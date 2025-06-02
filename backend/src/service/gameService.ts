import { GameResult } from "../model/gameResult";
import db from "../config/db";
import {RoomService} from "./roomService";
import {BalanceService} from "./balanceService";

export class GameService {
    private static readonly MAX_RETRIES = 3;

    static async processGameResult(
        user1Id: string,
        user2Id: string,
        betAmount: bigint,
        winnerId: string | null,
        roomId: number
    ): Promise<void> {
        for (let attempt = 1; attempt <= GameService.MAX_RETRIES; attempt++) {
            const client = await db.connect();
            try {
                await client.query('BEGIN');

                const users = await client.query(
                    'SELECT id, balance FROM users WHERE id IN ($1, $2) FOR UPDATE',
                    [user1Id, user2Id]
                );

                const userMap = Object.fromEntries(users.rows.map(u => [u.id, u]));
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
                
                await RoomService.deleteRoom(client, roomId)

                await client.query('COMMIT');
                return;
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`Transaction failed (attempt ${attempt}):`, err);

                if (attempt === GameService.MAX_RETRIES) {
                    throw new Error('Game processing failed after multiple attempts');
                }

                await new Promise(res => setTimeout(res, 200));
            } finally {
                client.release();
            }
        }
    }
}