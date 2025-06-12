import { Transaction } from './transaction';
import { Queryable } from '../config/types';
import db from '../config/db';
import { TransactionStatus, TransactionType } from './types';

export class TransactionService {
    static async createTransaction(
        userId: number,
        amount: number,
        type: TransactionType,
        txHash: string,
        status: TransactionStatus,
        client: Queryable = db
    ): Promise<Transaction> {
        try {
            const result = await client.query(
                `
                    INSERT INTO transactions (user_id, amount, type, tx_hash, status)
                    VALUES ($1, $2, $3, $4, $5)
                        RETURNING *
                `,
                [userId, amount, type.valueOf(), txHash, status]
            );

            return Transaction.fromRow(result.rows[0]);
        } catch (err) {
            console.error('Error in createTransaction:', err);
            throw err;
        }
    }
}
