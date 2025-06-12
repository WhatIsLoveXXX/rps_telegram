import { Queryable } from '../../config/types';
import { User } from '../model/user';
import db from '../../config/db';
import { BalanceOperationError } from '../../constants/errors';

export class BalanceService {
    static async deductBalance(userId: number, amount: number, client: Queryable = db): Promise<User> {
        try {
            const result = await client.query(`UPDATE users set balance = balance - $1 WHERE id = $2 returning *`, [amount, userId]);
            return User.fromRow(result.rows[0]);
        } catch (err) {
            console.error('Error in deductBalance:', err);
            throw new BalanceOperationError();
        }
    }

    static async addBalance(userId: number, amount: number, client: Queryable = db): Promise<User> {
        try {
            const result = await client.query(`UPDATE users SET balance = balance + $1 WHERE id = $2 returning *`, [amount, userId]);
            return User.fromRow(result.rows[0]);
        } catch (err) {
            console.error('Error in addBalance:', err);
            throw new BalanceOperationError();
        }
    }

    static async getUserBalances(userIds: number[], client: Queryable): Promise<Record<number, number>> {
        try {
            const placeholders = userIds.map((_, index) => `$${index + 1}`).join(', '); // Конструируем плейсхолдеры
            const query = `SELECT id, balance
                           FROM users
                           WHERE id IN (${placeholders}) FOR UPDATE`;

            const balancesQuery = await client.query(query, userIds);

            return Object.fromEntries(balancesQuery.rows.map((row: { id: number; balance: string }) => [row.id, parseFloat(row.balance)]));
        } catch (err) {
            console.error('Error in getUserBalances:', err);
            throw new BalanceOperationError();
        }
    }
}
