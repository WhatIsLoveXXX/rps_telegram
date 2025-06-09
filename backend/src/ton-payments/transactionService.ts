import { Transaction } from './transaction';
import { TransactionEnum } from './transactionType';
import { PoolClient } from 'pg';

export class TransactionService {
    static async createTransaction(
        client: PoolClient,
        userId: number,
        amount: number,
        type: TransactionEnum,
        txHash: string
    ): Promise<Transaction> {
        try {
            const result = await client.query(
                `
                    INSERT INTO transactions (user_id, amount, type, tx_hash)
                    VALUES ($1, $2, $3, $4)
                        RETURNING *
                `,
                [userId, amount, type.valueOf(), txHash]
            );

            return Transaction.fromRow(result.rows[0]);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}
