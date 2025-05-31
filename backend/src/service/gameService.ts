import {GameResult} from "../model/gameResult";
import db from "../config/db";

export class GameService {

private static readonly MAX_RETRIES = 3;

static async processGameResult(
    winnerId: string,
    loserId: string,
    betAmount: number
): Promise<void> {
    for (let attempt = 1; attempt <= GameService.MAX_RETRIES; attempt++) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // Блокируем обе строки
            const users = await client.query(
                'SELECT id, balance FROM users WHERE id IN ($1, $2) FOR UPDATE',
                [winnerId, loserId]
            );
            if (users.rowCount !== 2) {
                throw new Error('One or both users not found');
            }

            // Проверка на баланс
            const loser = users.rows.find(u => u.id === loserId);
            if (!loser || loser.balance < betAmount) {
                throw new Error('Insufficient funds for loser');
            }

            // Списываем у проигравшего
            await client.query(
                'UPDATE users SET balance = balance - $1 WHERE id = $2',
                [betAmount, loserId]
            );

            // Начисляем победителю
            await client.query(
                'UPDATE users SET balance = balance + $1 WHERE id = $2',
                [betAmount, winnerId]
            );

            // Запись в историю
            await client.query(
                `INSERT INTO game_history (user_id, bet, result) VALUES
                 ($1, $3, $2),
                 ($4, $3, $5)`,
                [winnerId, GameResult.WIN, betAmount, loserId, GameResult.LOSE]
            );

            await client.query('COMMIT');
            return; // Успех — выходим
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(`Transaction failed (attempt ${attempt}):`, err);

            if (attempt === GameService.MAX_RETRIES) {
                throw new Error('Game processing failed after multiple attempts');
            }

            // Пауза между ретраями (например, 200мс)
            await new Promise(res => setTimeout(res, 200));
        } finally {
            client.release();
        }
    }
}

}