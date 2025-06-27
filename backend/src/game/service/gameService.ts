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
import { GameBrokenError, InsufficientBalanceError, RoomNotFoundError, UserNotFoundError } from '../../constants/errors';
import { SocketAction } from '../socketEndpoints';

export class GameService {
    private static readonly MAX_RETRIES = 3;

    private static games = new Map<string, GameState>();

    private static readonly PROFIT_NET_COEFFICIENT = 1 - (Number(process.env.INNER_GAME_TAX) || 0.1);

    static async connectUser(io: Server, socket: Socket, roomId: string, userId: number): Promise<void> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const room = await RoomService.getRoomById(roomId, client);
            if (!room) {
                throw new RoomNotFoundError();
            }

            const user = await UserService.getUserById(userId, true, client);
            if (!user) {
                throw new UserNotFoundError();
            }

            if (user.balance < room.bet) {
                throw new InsufficientBalanceError();
            }

            await RoomService.joinRoom(roomId, userId, client);

            await client.query('COMMIT');

            socket.data.roomId = roomId;
            socket.data.userId = userId;

            this.initGameState(this.games, roomId);
            this.addUserToPlayerState(this.games, roomId, user);

            socket.join(roomId.toString());

            const gameState = this.games.get(roomId);

            if (gameState) io.in(roomId).emit(SocketAction.GAME_STATE, { players: [...gameState.players.values()] });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(error);
            socket.emit(SocketAction.ERROR, error instanceof Error ? error.message : 'Could not join room');
        } finally {
            client.release();
        }
    }

    static async setUserReady(io: Server, socket: Socket, roomId: string, userId: number): Promise<void> {
        try {
            const gameState = this.games.get(roomId);
            if (!gameState) return;
            const players = gameState.players;

            const user = players.get(userId.toString());

            if (user) {
                user.isReady = true;
                user.selectedCard = undefined;
            }

            io.in(roomId).emit(SocketAction.GAME_STATE, { players: [...players.values()] });
            const playersValues = [...players.values()];
            const isFullRoom = playersValues.length === 2;
            if (isFullRoom && playersValues.every((it) => it.isReady)) {
                gameState.gameStarted = true;
                console.log('setUserReady trigger round_start', gameState.round);
                io.in(roomId).emit(SocketAction.ROUND_START, {
                    round: gameState.round,
                    players: [...players.values()],
                });
            }
        } catch (error) {
            console.error(error);
            socket.emit(SocketAction.ERROR, error instanceof Error ? error.message : 'Could not set user ready');
        }
    }

    static async makeMovement(io: Server, socket: Socket, roomId: string, userId: number, selectedCard: Card): Promise<void> {
        try {
            const game = this.games.get(roomId);
            if (!game) return;

            const allPlayers = Array.from(game.players.values());

            if (allPlayers.length !== 2) {
                console.log('Not enough players to make a move');
                return;
            }

            const player = game.players.get(userId.toString());

            if (!player) return;

            player.selectedCard = selectedCard;

            const moves = allPlayers.map((p) => p.selectedCard);

            if (moves.every(Boolean)) {
                return this.finishRound(io, socket, roomId, game);
            }
        } catch (error) {
            console.error(error);
            socket.emit(SocketAction.ERROR, error instanceof Error ? error.message : 'Could not make move');
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

            if (isRoomEmpty) {
                await RoomService.deleteRoom(roomId, client);
            }

            await client.query('COMMIT');
            console.log(`User ${userId} removed from room ${roomId} (reason: ${reason})`);
            const gameState = this.games.get(roomId);
            if (gameState) {
                if (!gameState.gameOver && gameState.gameStarted) {
                    const player = gameState.players.get(userId.toString())!;
                    player.isConnected = false;
                    console.log(`Player ${userId} marked as disconnected.`);

                    const remainingPlayers = [...gameState.players.values()].filter((player) => player.isConnected); // Оставшиеся активные игроки

                    if (remainingPlayers.length === 1) {
                        const gameWinner = remainingPlayers[0].user.id;
                        console.log(`Player ${gameWinner} wins because the opponent disconnected.`);

                        gameState.gameOver = true;
                        gameState.gameStarted = false;
                        io.in(roomId).emit(SocketAction.GAME_OVER, {
                            gameWinner,
                            players: remainingPlayers,
                            gameOver: gameState.gameOver,
                            gameStarted: false,
                            showGameWinnerModal: true,
                        });

                        await this.processGameResult(io, gameWinner, roomId);
                    } else {
                        //Duplication of code
                        gameState.players.delete(userId.toString());
                        console.log(`User ${userId} removed from gameState`);
                        io.in(roomId).emit(SocketAction.GAME_STATE, { players: [...gameState.players.values()] });
                    }
                } else {
                    //Duplication of code
                    gameState.players.delete(userId.toString());
                    console.log(`User ${userId} removed from gameState`);
                    io.in(roomId).emit(SocketAction.GAME_STATE, { players: [...gameState.players.values()] });
                }
            }
            if (isRoomEmpty) {
                this.games.delete(roomId);
                console.log(`Room ${roomId} was removed`);
            }
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error on disconnect:', error);
            socket.emit(SocketAction.ERROR, error instanceof Error ? error.message : 'Could not disconnect from socket');
        } finally {
            client.release();
        }
    }

    private static async finishRound(io: Server, socket: Socket, roomId: string, game: GameState) {
        try {
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
                game.gameStarted = false;
                io.in(roomId).emit(SocketAction.GAME_OVER, {
                    gameWinner,
                    players: [...game.players.values()],
                    gameOver: true,
                    gameStarted: false,
                    showGameWinnerModal: true,
                });
                await this.processGameResult(io, gameWinner, roomId);
            } else {
                io.in(roomId).emit(SocketAction.ROUND_RESULT, {
                    roundWinner: roundWinner === 0 ? null : roundWinner === 1 ? firstUserId : secondUserId,
                    players: [...game.players.values()],
                    shouldShowOpponentCard: true,
                    showRoundWinnerModal: true,
                });

                // increase round
                game.round++;
                if (game.round > game.maxRounds) {
                    const gameWinner = p1.roundsWon > p2.roundsWon ? p1.user.id : p2.roundsWon > p1.roundsWon ? p2.user.id : null;

                    game.gameOver = true;
                    game.gameStarted = false;
                    io.in(roomId).emit(SocketAction.GAME_OVER, {
                        gameWinner,
                        players: [...game.players.values()],
                        gameOver: true,
                        gameStarted: false,
                        showGameWinnerModal: true,
                    });
                    await this.processGameResult(io, gameWinner, roomId);
                } else {
                    setTimeout(() => {
                        console.log('finishRound trigger round_start', game.round);
                        io.in(roomId).emit(SocketAction.ROUND_START, {
                            round: game.round,
                            players: [...game.players.values()],
                            shouldShowOpponentCard: false,
                            roundWinner: undefined,
                            showRoundWinnerModal: false,
                        });
                    }, 3000);
                }
                // Очистка карт
                for (const p of game.players.values()) {
                    delete p.selectedCard;
                }
            }
        } catch (error) {
            console.error(error);
            socket.emit(SocketAction.ERROR, error instanceof Error ? error.message : 'Could not disconnect from socket');
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
                    this.updateInStateBalances(winnerId, players, betAmount);
                }

                await client.query('COMMIT');
                // TODO: delete disconnected user instead of reset and sent game state
                await this.resetGameStatesAndRemoveLowBalancePlayers(io, roomId);

                return;
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`Transaction failed (attempt ${attempt}):`, err);

                if (attempt === GameService.MAX_RETRIES) {
                    throw new GameBrokenError();
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
            throw new RoomNotFoundError();
        }

        const currentGame = this.games.get(roomId);
        if (!currentGame) {
            throw new GameBrokenError();
        }

        const players = [...currentGame.players.values()].map((playerState) => playerState.user);
        if (players.length !== 2) {
            throw new GameBrokenError();
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
                throw new InsufficientBalanceError();
            }
        });
    }

    private static async saveDrawHistory(players: any[], betAmount: number, client: any): Promise<void> {
        for (const player of players) {
            await GameHistoryService.saveGameHistory(player.id, betAmount, GameResult.DRAW, client);
            player.stats = await UserStatsService.updateUserStats(player.id, betAmount, GameResult.DRAW, client);
        }
    }

    private static async processWinnerAndLoser(winnerId: number, players: any[], betAmount: number, client: any): Promise<void> {
        const loser = players.find((player) => player.id !== winnerId);
        const winner = players.find((player) => player.id === winnerId);
        const betAmountWithoutTaxes = betAmount * this.PROFIT_NET_COEFFICIENT;

        await BalanceService.deductBalance(loser.id, betAmount, client);
        await BalanceService.addBalance(winnerId, betAmountWithoutTaxes, client);

        await GameHistoryService.saveGameHistory(winnerId, betAmountWithoutTaxes, GameResult.WIN, client);
        await GameHistoryService.saveGameHistory(loser.id, betAmount, GameResult.LOSE, client);
        winner.stats = await UserStatsService.updateUserStats(winnerId, betAmountWithoutTaxes, GameResult.WIN, client);
        loser.stats = await UserStatsService.updateUserStats(loser.id, betAmount, GameResult.LOSE, client);
    }

    private static updateInStateBalances(winnerId: number, players: any[], betAmount: number): void {
        const loser = players.find((player) => player.id !== winnerId);
        const winner = players.find((player) => player.id === winnerId);
        const betAmountWithoutTaxes = betAmount * this.PROFIT_NET_COEFFICIENT;

        loser.balance -= betAmount;
        winner.balance += betAmountWithoutTaxes;

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
            gameStarted: false,
        };

        games.set(roomId, state);
    }

    private static async resetGameStatesAndRemoveLowBalancePlayers(io: Server, roomId: string): Promise<void> {
        const gameState = this.games.get(roomId);
        if (!gameState) return;
        const updatedPlayers = new Map<string, PlayerState>();

        gameState.players.forEach((playerState, userId) => {
            if (playerState.isConnected) {
                updatedPlayers.set(userId, {
                    user: { ...playerState.user },
                    roundsWon: 0,
                    selectedCard: playerState.selectedCard, // TODO: consider set to undefined
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
            gameStarted: false,
        });
        // CHECK ---> issue with cards if selectedCard: undefined
        io.in(roomId).emit(SocketAction.GAME_STATE, { players: [...updatedPlayers.values()] });
    }
}
