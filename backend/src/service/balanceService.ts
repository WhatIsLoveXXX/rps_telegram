import {PoolClient} from "pg";

export class BalanceService {
    static async deductBalance(client: PoolClient, amount: bigint, userId: string): Promise<void> {
        try {
            await client.query(`UPDATE users set balance = balance - $1 WHERE user_id = $2`, 
                [amount, userId]);
        } catch (err) {
            console.error('Error in deductBalance:', err);
            throw err;
        }
    }

    static async addBalance(client: PoolClient, amount: bigint, userId: string): Promise<void> {
        try {
            await client.query(
                `UPDATE users SET balance = balance + $1 WHERE user_id = $2`,
                [amount, userId]
            );
        } catch (err) {
            console.error('Error in addBalance:', err);
            throw err;
        }
    }

}