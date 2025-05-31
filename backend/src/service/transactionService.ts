import { Transaction } from '../model/transaction';
import {TransactionEnum} from "../model/transactionType";
import {PoolClient} from "pg";

export class TransactionService {
    static async createTransaction(client: PoolClient, userId: number, amount: number, type: TransactionEnum, txHash: string): Promise<Transaction> {
        try {
            const result = await client.query(
                `
                    INSERT INTO transactions (user_id, amount, type, tx_hash, created_at)
                    VALUES ($1, $2, $3, $4, $5)
                        RETURNING id
                `,
                [userId, amount, type.valueOf(), txHash, Date.now()]
            );

            return Transaction.fromRow(result.rows[0]);
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}