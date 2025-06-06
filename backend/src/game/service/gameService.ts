import { GameResult } from '../../model/gameResult';
import db from '../../config/db';
import { RoomService } from '../../service/roomService';
import { BalanceService } from '../../service/balanceService';
import { UserService } from '../../service/userService';
import { DisconnectReason, Server, Socket } from 'socket.io';
import { Card, GameState, PlayerState } from '../types';
import { User } from '../../model/user';

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
        console.log('inside service| connect user');
        try {
            await client.query('BEGIN');

            const room = await RoomService.getRoomById(roomId, client);
            if (!room) {
                socket.emit('error', 'Room not found');
                await client.query('ROLLBACK');
                return;
            }

            const user = await UserService.getUserById(userId, client);
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
            console.log('before adding to state:', user);
            this.addUserToPlayerState(this.games, roomId, user);

            socket.join(roomId.toString());

            const clientSize = io.sockets.adapter.rooms.get(roomId.toString())?.size || 0;
            const gameState = this.games.get(roomId);
            console.log('after adding to state from state:', gameState?.players.get(userId.toString()));

            if (gameState) io.in(roomId).emit('game_state', { players: [...gameState.players.values()] });

            if (clientSize === 2) {
                // Подготовка к игре — 2 игрока подключились
                const readyUsers = new Set<string>();

                // const timer = setTimeout(async () => {
                //     const state = gamePreparationState.get(roomId);
                //     if (!state) return;
                //
                //     const roomSockets = io.sockets.adapter.rooms.get(roomId.toString());
                //     if (!roomSockets) return;
                //
                //     for (const socketId of roomSockets) {
                //         const sock = io.sockets.sockets.get(socketId);
                //         if (!sock) continue;
                //
                //         const userId = sock.data.userId;
                //         if (!state.readyUsers.has(userId)) {
                //             sock.emit('kicked', 'You were not ready in time');
                //             sock.leave(roomId.toString());
                //
                //             const kickClient = await db.connect();
                //             try {
                //                 await kickClient.query('BEGIN');
                //                 await RoomService.leaveRoom(roomId, userId, kickClient);
                //                 const isRoomEmpty = await RoomService.isRoomEmpty(roomId, kickClient);
                //                 if (isRoomEmpty && roomId !== '7be9fec6-e9b1-4764-910c-f4215e34e431') {
                //                     await RoomService.deleteRoom(roomId, kickClient);
                //                 }
                //                 await kickClient.query('COMMIT');
                //             } catch (err) {
                //                 await kickClient.query('ROLLBACK');
                //                 console.error('Error kicking user:', err);
                //             } finally {
                //                 kickClient.release();
                //             }
                //         }
                //     }
                //
                //     gamePreparationState.delete(roomId);
                // }, 10_000);

                io.in(roomId.toString()).emit('waiting_ready');
            }
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(error);
            socket.emit('error', 'Could not join room');
        } finally {
            client.release();
        }
    }

    static async setUserReady(io: Server, socket: Socket, roomId: string, userId: number): Promise<void> {
        const game = this.games.get(roomId);
        if (!game) return;

        const user = game.players.get(userId.toString());

        if (user) {
            user.isReady = true;
        }

        if (game.players.size === 2) {
            // startGame(roomId);
        }
    }

    static async makeMovement(io: Server, socket: Socket, roomId: string, userId: number, selectedCard: Card): Promise<void> {
        const game = this.games.get(roomId);
        if (!game) return;

        const player = game.players.get(userId.toString());
        //Надо понять, когда происходит event, когда мы кликнули по карте или же таймер исяк
        if (!player || player.selectedCard) return; // чтобы не перезаписывал

        player.selectedCard = selectedCard;

        socket.to(roomId).emit('opponent_moved', { userId });

        const allPlayers = Array.from(game.players.values());
        const moves = allPlayers.map((p) => p.selectedCard);

        // Если оба игрока сходили
        if (moves.every(Boolean)) {
            if (game.moveTimeout) {
                clearTimeout(game.moveTimeout); // ⛔ Останавливаем таймер
                delete game.moveTimeout;
            }
            return this.finishRound(io, roomId, game);
        }

        // Если только один сходил, запускаем таймер, если он ещё не запущен
        if (!game.moveTimeout) {
            game.moveTimeout = setTimeout(() => {
                console.log('Ход не завершён вовремя, выбираем случайные ходы');

                for (const p of allPlayers) {
                    if (!p.selectedCard) {
                        p.selectedCard = this.randomMove();
                    }
                }

                this.finishRound(io, roomId, game);
            }, 10_000); // 10 секунд
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
            const isRoomEmpty = await RoomService.isRoomEmpty(roomId, client);

            //Don't delete
            const mockedRoomId = '7be9fec6-e9b1-4764-910c-f4215e34e431';

            if (isRoomEmpty && roomId !== mockedRoomId) {
                await RoomService.deleteRoom(roomId, client);
            }

            await client.query('COMMIT');
            console.log(`User ${userId} removed from room ${roomId} (reason: ${reason})`);
            if (isRoomEmpty) {
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
        const [p1, p2] = Array.from(game.players.values());
        const winner = this.getRoundWinner(p1.selectedCard!, p2.selectedCard!);
        const [firstUserId, secondUserId] = [p1.user.id, p2.user.id];

        if (winner === 1) p1.roundsWon++;
        else if (winner === 2) p2.roundsWon++;

        io.in(roomId).emit('round_result', {
            round: game.round,
            cards: {
                [firstUserId]: p1.selectedCard,
                [secondUserId]: p2.selectedCard,
            },
            scores: {
                [firstUserId]: p1.roundsWon,
                [secondUserId]: p2.roundsWon,
            },
            winner: winner === 0 ? null : winner === 1 ? firstUserId : secondUserId,
        });

        // Очистка
        for (const p of Object.values(game.players)) {
            delete p.selectedCard;
        }

        delete game.moveTimeout;
        game.round++;

        if (game.round > game.maxRounds) {
            // const finalScores = Object.values(game.players).map(p => ({ userId: p.userId, score: p.roundsWon }));
            // const maxScore = Math.max(...finalScores.map(s => s.score));
            // const finalScores = [] as any;
            // const maxScore = 0;
            // const winners = finalScores
            //     .filter((s) => s.roundsWon === maxScore)
            //     .map((s) => s.userId);

            // io.in(roomId).emit('game_over', { winners, finalScores });
            this.games.delete(roomId);
        } else {
            setTimeout(() => {
                io.in(roomId).emit('round_start', { round: game.round });
            }, 3000);
        }
    }

    private static randomMove(): Card {
        const moves: Card[] = ['rock', 'paper', 'scissors'];
        return moves[Math.floor(Math.random() * moves.length)];
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

    // function startGame(roomId: string) {
    //     const sockets = io.sockets.adapter.rooms.get(roomId);
    //     if (!sockets || sockets.size !== 2) return;
    //
    //     const players: Record<string, PlayerState> = {};
    //     for (const socketId of sockets) {
    //         const sock = io.sockets.sockets.get(socketId);
    //         if (sock?.data.userId) {
    //             players[sock.data.userId] = { roundsWon: 0 };
    //         }
    //     }
    //
    //     const game: GameState = {
    //         players,
    //         round: 1,
    //         maxRounds: 5,
    //     };
    //
    //     games.set(roomId, game);
    //     io.in(roomId).emit('round_start', { round: game.round });
    // }
}
