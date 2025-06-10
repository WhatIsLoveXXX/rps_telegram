import { PoolClient } from 'pg';
import { Queryable } from '../../config/types';

export class BalanceService {
    static async deductBalance(client: PoolClient, amount: number, userId: number): Promise<number> {
        try {
            const result = await client.query(`UPDATE users set balance = balance - $1 WHERE user_id = $2 returning balance`, [
                amount,
                userId,
            ]);
            return parseFloat(result.rows[0].balance);
        } catch (err) {
            console.error('Error in deductBalance:', err);
            throw err;
        }
    }

    static async addBalance(client: PoolClient, amount: number, userId: number): Promise<number> {
        try {
            const result = await client.query(`UPDATE users SET balance = balance + $1 WHERE user_id = $2 returning balance`, [
                amount,
                userId,
            ]);
            return parseFloat(result.rows[0].balance);
        } catch (err) {
            console.error('Error in addBalance:', err);
            throw err;
        }
    }

    static async getUserBalances(userIds: number[], client: Queryable): Promise<Record<number, number>> {
        const placeholders = userIds.map((_, index) => `$${index + 1}`).join(', '); // Конструируем плейсхолдеры
        const query = `SELECT id, balance FROM users WHERE id IN (${placeholders}) FOR UPDATE`;

        const balancesQuery = await client.query(query, userIds);

        return Object.fromEntries(balancesQuery.rows.map((row: { id: number; balance: string }) => [row.id, parseFloat(row.balance)]));
    }
}
