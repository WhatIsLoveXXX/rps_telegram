import { GameResult } from '../gameResult';
import db from '../../config/db';
import { RoomService } from '../../room/service/roomService';
import { BalanceService } from '../../user/service/balanceService';
import { UserService } from '../../user/service/userService';
import { DisconnectReason, Server, Socket } from 'socket.io';
import { Card, GameState, PlayerState } from '../types';
import { User } from '../../user/model/user';
import { GameHistoryService } from './gameHistoryService';

export class GameService {
    private static readonly MAX_RETRIES = 3;

    private static games = new Map<string, GameState>();

    static async processGameResult(
        user1Id: string,
        user2Id: string,
        betAmount: number,
        winnerId: string | null,
        roomId: number
    ): Promise<void> {
        for (let attempt = 1; attempt <= GameService.MAX_RETRIES; attempt++) {
            const client = await db.connect();
            try {
                await client.query('BEGIN');

                const users = await client.query('SELECT id, balance FROM users WHERE id IN ($1, $2) FOR UPDATE', [user1Id, user2Id]);

                const userMap = Object.fromEntries(users.rows.map((u) => [u.id, u]));
                const user1 = userMap[user1Id];
                const user2 = userMap[user2Id];

                if (user1.balance < betAmount || user2.balance < betAmount) {
                    throw new Error('One or both users have insufficient balance');
                }

                if (winnerId === null) {
                    await client.query(
                        `INSERT INTO game_history (user_id, bet, result) VALUES
             ($1, $3, $2),
             ($4, $3, $2)`,
                        [user1Id, GameResult.DRAW, betAmount, user2Id]
                    );
                } else {
                    const loserId = winnerId === user1Id ? user2Id : user1Id;

                    await BalanceService.deductBalance(client, betAmount, loserId);
                    await BalanceService.addBalance(client, betAmount, winnerId);

                    // Запись истории
                    await client.query(
                        `INSERT INTO game_history (user_id, bet, result) VALUES
             ($1, $3, $2),
             ($4, $3, $5)`,
                        [winnerId, GameResult.WIN, betAmount, loserId, GameResult.LOSE]
                    );
                }

                await RoomService.deleteRoom(roomId, client);

                await client.query('COMMIT');
                return;
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`Transaction failed (attempt ${attempt}):`, err);

                if (attempt === GameService.MAX_RETRIES) {
                    throw new Error('Game processing failed after multiple attempts');
                }

                await new Promise((res) => setTimeout(res, 200));
            } finally {
                client.release();
            }
        }
    }

    static async connectUser(io: Server, socket: Socket, roomId: string, userId: number): Promise<void> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const room = await RoomService.getRoomById(roomId, client);
            if (!room) {
                socket.emit('error', 'Room not found');
                await client.query('ROLLBACK');
                return;
            }

            const user = await UserService.getUserById(userId, client, true);
            if (!user) {
                socket.emit('error', 'User not found');
                await client.query('ROLLBACK');
                return;
            }

            if (user.balance < room.bet) {
                socket.emit('error', 'Insufficient balance');
                await client.query('ROLLBACK');
                return;
            }

            await RoomService.joinRoom(roomId, userId, client);

            await client.query('COMMIT');

            socket.data.roomId = roomId;
            socket.data.userId = userId;

            this.initGameState(this.games, roomId);
            this.addUserToPlayerState(this.games, roomId, user);

            socket.join(roomId.toString());

            const clientSize = io.sockets.adapter.rooms.get(roomId.toString())?.size || 0;
            const gameState = this.games.get(roomId);

            if (gameState) io.in(roomId).emit('game_state', { players: [...gameState.players.values()] });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(error);
            socket.emit('error', 'Could not join room');
        } finally {
            client.release();
        }
    }

    static async setUserReady(io: Server, socket: Socket, roomId: string, userId: number): Promise<void> {
        const gameState = this.games.get(roomId);
        if (!gameState) return;
        const players = gameState.players;

        const user = players.get(userId.toString());

        if (user) {
            user.isReady = true;
        }

        io.in(roomId).emit('game_state', { players: [...players.values()] });
        const playersValues = [...players.values()];
        const isFullRoom = playersValues.length === 2;
        if (isFullRoom && playersValues.every((it) => it.isReady)) {
            console.log('setUserReady trigger round_start', gameState.round);
            io.in(roomId).emit('round_start', { round: gameState.round, players: [...players.values()] });
        }
    }

    static async makeMovement(io: Server, socket: Socket, roomId: string, userId: number, selectedCard: Card): Promise<void> {
        const game = this.games.get(roomId);
        if (!game) return;

        const player = game.players.get(userId.toString());

        //Надо понять, когда происходит event, когда мы кликнули по карте или же таймер исяк
        if (!player) return; // чтобы не перезаписывал

        player.selectedCard = selectedCard;

        // socket.to(roomId).emit('opponent_moved', { userId });

        const allPlayers = Array.from(game.players.values());
        const moves = allPlayers.map((p) => p.selectedCard);
        console.log('moves', moves);
        // console.log('allPlayers', allPlayers);
        // Если оба игрока сходили
        console.log('Провалились в finishRound', moves.every(Boolean));
        if (moves.every(Boolean)) {
            return this.finishRound(io, roomId, game);
        }
    }

    static async disconnect(io: Server, socket: Socket, reason: DisconnectReason): Promise<void> {
        const roomId = socket.data.roomId;
        const userId = socket.data.userId;

        if (!roomId || !userId) return;

        const client = await db.connect();
        try {
            await client.query('BEGIN');

            await RoomService.leaveRoom(roomId, userId, client);
            await RoomService.changeCreatorIfNeeded(roomId, userId, client);
            const isRoomEmpty = await RoomService.isRoomEmpty(roomId, client);

            //Don't delete
            const mockedRoomId = '7be9fec6-e9b1-4764-910c-f4215e34e431';

            if (isRoomEmpty && roomId !== mockedRoomId) {
                await RoomService.deleteRoom(roomId, client);
            }

            await client.query('COMMIT');
            console.log(`User ${userId} removed from room ${roomId} (reason: ${reason})`);
            const gameState = this.games.get(roomId);
            if (gameState) {
                gameState.players.delete(userId.toString());
                console.log('User ${userId} removed from gameState');
                io.in(roomId).emit('game_state', { players: [...gameState.players.values()] });
            }
            if (isRoomEmpty) {
                this.games.delete(roomId);
                console.log(`Room ${roomId} was removed`);
            }
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error on disconnect:', error);
        } finally {
            client.release();
        }
    }

    private static finishRound(io: Server, roomId: string, game: GameState) {
        const [p1, p2] = [...game.players.values()];
        const roundWinner = this.getRoundWinner(p1.selectedCard!, p2.selectedCard!);
        const [firstUserId, secondUserId] = [p1.user.id, p2.user.id];

        let gameWinner: number | undefined = undefined;

        if (roundWinner === 1) p1.roundsWon++;
        else if (roundWinner === 2) p2.roundsWon++;

        for (const player of game.players.values()) {
            if (player.roundsWon === 3) {
                gameWinner = player.user.id;
                break;
            }
        }

        if (gameWinner) {
            io.in(roomId).emit('game_over', { gameWinner, players: [...game.players.values()], gameOver: true });

            // TODO: clear game state and users
        } else {
            io.in(roomId).emit('round_result', {
                roundWinner: roundWinner === 0 ? null : roundWinner === 1 ? firstUserId : secondUserId,
                players: [...game.players.values()],
                shouldShowOpponentCard: true,
                showWinnerModal: true,
            });

            // Очистка карт
            for (const p of game.players.values()) {
                delete p.selectedCard;
            }
            // increase round
            game.round++;
            if (game.round > game.maxRounds) {
                const gameWinner = p1.roundsWon > p2.roundsWon ? p1.user.id : p2.roundsWon > p1.roundsWon ? p2.user.id : null;

                io.in(roomId).emit('game_over', { gameWinner, players: [...game.players.values()], gameOver: true });
                // TODO: clear game state and users
            } else {
                console.log('should trigger round_start', !(game.round > game.maxRounds));
                setTimeout(() => {
                    console.log('finishRound trigger round_start', game.round);
                    io.in(roomId).emit('round_start', {
                        round: game.round,
                        players: [...game.players.values()],
                        shouldShowOpponentCard: false,
                        roundWinner: undefined,
                        showWinnerModal: false,
                    });
                }, 3000);
            }
        }
    }

    private static getRoundWinner(p1: Card, p2: Card): 0 | 1 | 2 {
        if (p1 === p2) return 0;
        if ((p1 === 'rock' && p2 === 'scissors') || (p1 === 'scissors' && p2 === 'paper') || (p1 === 'paper' && p2 === 'rock')) {
            return 1;
        }
        return 2;
    }

    private static addUserToPlayerState(games: Map<string, GameState>, roomId: string, user: User) {
        const game = games.get(roomId);
        if (!game) return;

        game.players.set(user.id.toString(), {
            user,
            roundsWon: 0,
            isReady: false,
        });
    }

    private static initGameState(games: Map<string, GameState>, roomId: string) {
        const isGameExist = games.has(roomId);
        if (isGameExist) return;

        const state: GameState = {
            players: new Map<string, PlayerState>(),
            round: 1,
            maxRounds: 5,
        };

        games.set(roomId, state);
    }
}
