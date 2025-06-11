import { GameResult } from '../gameResult';
import db from '../../config/db';
import { RoomService } from '../../room/service/roomService';
import { BalanceService } from '../../user/service/balanceService';
import { UserService } from '../../user/service/userService';
import { DisconnectReason, Server, Socket } from 'socket.io';
import { Card, GameState, PlayerState } from '../types';
import { User } from '../../user/model/user';
import { GameHistoryService } from './gameHistoryService';
import { UserStatsService } from '../../user/service/userStatsService';

export class GameService {
    private static readonly MAX_RETRIES = 3;

    private static games = new Map<string, GameState>();

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

            const user = await UserService.getUserById(userId, true, client);
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

    static async setUserReady(io: Server, roomId: string, userId: number): Promise<void> {
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
            gameState.gameInProgress = true;
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
                if (!gameState.gameOver && gameState.gameInProgress) {
                    const player = gameState.players.get(userId.toString())!;
                    player.isConnected = false;
                    console.log(`Player ${userId} marked as disconnected.`);

                    const remainingPlayers = [...gameState.players.values()].filter((player) => player.isConnected); // Оставшиеся активные игроки

                    if (remainingPlayers.length === 1) {
                        const gameWinner = remainingPlayers[0].user.id;
                        console.log(`Player ${gameWinner} wins because the opponent disconnected.`);

                        gameState.gameOver = true;
                        io.in(roomId).emit('game_over', { gameWinner, players: [...gameState.players.values()], gameOver: true });

                        await this.processGameResult(io, gameWinner, roomId);
                    } else {
                        gameState.players.delete(userId.toString());
                        console.log('User ${userId} removed from gameState');
                        io.in(roomId).emit('game_state', { players: [...gameState.players.values()] });
                    }
                }
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

    private static async finishRound(io: Server, roomId: string, game: GameState) {
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
            game.gameOver = true;
            io.in(roomId).emit('game_over', { gameWinner, players: [...game.players.values()], gameOver: true });
            await this.processGameResult(io, gameWinner, roomId);
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

                game.gameOver = true;
                io.in(roomId).emit('game_over', { gameWinner, players: [...game.players.values()], gameOver: true });
                await this.processGameResult(io, gameWinner, roomId);
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

    private static async processGameResult(io: Server, winnerId: number | null, roomId: string): Promise<void> {
        for (let attempt = 1; attempt <= GameService.MAX_RETRIES; attempt++) {
            const client = await db.connect();

            try {
                await client.query('BEGIN');

                const { betAmount, players } = await this.getRoomAndPlayers(roomId, client);
                const balancesMap = await this.getAndUpdateBalances(players, client);

                this.ensureSufficientBalance(players, balancesMap, betAmount);

                if (winnerId === null) {
                    await this.saveDrawHistory(players, betAmount, client);
                } else {
                    await this.processWinnerAndLoser(winnerId, players, betAmount, client);
                }

                if (winnerId !== null) {
                    this.updateInMemoryBalances(winnerId, players, betAmount);
                }

                await client.query('COMMIT');

                await this.resetGameStatesAndRemoveLowBalancePlayers();

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

    private static async getRoomAndPlayers(roomId: string, client: any): Promise<{ betAmount: number; players: any[] }> {
        const room = await RoomService.getRoomById(roomId, client);
        if (!room) {
            throw new Error('Room not found');
        }

        const currentGame = this.games.get(roomId);
        if (!currentGame) {
            throw new Error('Game not found in active games');
        }

        const players = [...currentGame.players.values()].map((playerState) => playerState.user);
        if (players.length !== 2) {
            throw new Error('Game must have exactly 2 players');
        }

        return { betAmount: room.bet, players };
    }

    private static async getAndUpdateBalances(players: any[], client: any): Promise<Record<number, number>> {
        const playerIds = players.map((player) => player.id);
        const balancesMap = await BalanceService.getUserBalances(playerIds, client);

        players.forEach((player) => {
            player.balance = balancesMap[player.id];
        });

        return balancesMap;
    }

    private static ensureSufficientBalance(players: any[], balancesMap: Record<number, number>, betAmount: number): void {
        players.forEach((player) => {
            if (balancesMap[player.id] < betAmount) {
                throw new Error('One or both users have insufficient balance');
            }
        });
    }

    private static async saveDrawHistory(players: any[], betAmount: number, client: any): Promise<void> {
        for (const player of players) {
            await GameHistoryService.saveGameHistory(player.id, betAmount, GameResult.DRAW, client);
            await UserStatsService.updateUserStats(player.id, betAmount, GameResult.DRAW, client);
        }
    }

    private static async processWinnerAndLoser(winnerId: number, players: any[], betAmount: number, client: any): Promise<void> {
        const loser = players.find((player) => player.id !== winnerId);

        await BalanceService.deductBalance(client, betAmount, loser.id);
        await BalanceService.addBalance(client, betAmount, winnerId);

        await GameHistoryService.saveGameHistory(winnerId, betAmount, GameResult.WIN, client);
        await GameHistoryService.saveGameHistory(loser.id, betAmount, GameResult.LOSE, client);

        await UserStatsService.updateUserStats(winnerId, betAmount, GameResult.WIN, client);
        await UserStatsService.updateUserStats(loser.id, betAmount, GameResult.LOSE, client);
    }

    private static updateInMemoryBalances(winnerId: number, players: any[], betAmount: number): void {
        const loser = players.find((player) => player.id !== winnerId);
        const winner = players.find((player) => player.id === winnerId);

        loser.balance -= betAmount;
        winner.balance += betAmount;

        console.log(`Updated in-memory balances. Winner: ${winnerId}, Loser: ${loser.id}`);
    }

    private static addUserToPlayerState(games: Map<string, GameState>, roomId: string, user: User) {
        const game = games.get(roomId);
        if (!game) return;

        game.players.set(user.id.toString(), {
            user,
            roundsWon: 0,
            isReady: false,
            isConnected: true,
        });
    }

    private static initGameState(games: Map<string, GameState>, roomId: string) {
        const isGameExist = games.has(roomId);
        if (isGameExist) return;

        const state: GameState = {
            players: new Map<string, PlayerState>(),
            round: 1,
            maxRounds: 5,
            gameOver: false,
            gameInProgress: false,
        };

        games.set(roomId, state);
    }

    private static async resetGameStatesAndRemoveLowBalancePlayers(): Promise<void> {
        this.games.forEach((gameState, roomId) => {
            const updatedPlayers = new Map<string, PlayerState>();

            gameState.players.forEach((playerState, userId) => {
                if (playerState.isConnected) {
                    updatedPlayers.set(userId, {
                        user: { ...playerState.user },
                        roundsWon: 0,
                        selectedCard: undefined,
                        isReady: false,
                        isConnected: true,
                    });
                }
            });

            this.games.set(roomId, {
                players: updatedPlayers,
                round: 1,
                maxRounds: gameState.maxRounds,
                gameOver: false,
                gameInProgress: false,
            });
        });
    }
}
