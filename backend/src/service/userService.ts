import db from '../config/db';
import {User} from '../model/user';
import {findTransactionByHashWithWait, sendTon} from "../util/TonSenderReceiver";
import {TransactionService} from "./transactionService";
import {TransactionEnum} from "../model/transactionType";
import {Queryable} from "../config/types";

export class UserService {
    static async createUser(id: number, name: string): Promise<User> {
        await db.query(
            'INSERT INTO users (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
            [id, name]
        );
        return new User(id, name, 0);
    }

    static async isExist(id: number): Promise<boolean> {
        console.log(id);
        const result = await db.query('SELECT COUNT(*) AS count FROM users WHERE id = $1', [id]);
        return result.rows[0].count > 0;
    }

    static async getUserById(id: number, client: Queryable = db): Promise<User | null> {
        const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) return null;
        return User.fromRow(result.rows[0]);
    }

    static async updateWallet(id: number, wallet: string): Promise<void> {
        if (wallet.length !== 48) {
            throw new Error('Invalid wallet length: must be exactly 48 characters.');
        }
        await db.query('UPDATE users SET wallet = $1 WHERE id = $2', [wallet, id]);
    }


    static async isWalletExist(id: number): Promise<boolean> {
        const wallet = await db.query('select wallet from userswhere id = $1', [id]);
        return !(wallet.rows.length === 0 || !wallet.rows[0]);
    }

    static async topUpBalance(userId: number, amount: number, boc: string): Promise<User | null> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const userResult = await client.query(
                'SELECT balance, wallet_address FROM users WHERE id = $1 FOR UPDATE',
                [userId]
            );

            if (userResult.rowCount === 0) {
                await client.query('ROLLBACK');
                return null;
            }

            const { wallet_address } = userResult.rows[0];
            
            const transaction = await findTransactionByHashWithWait(wallet_address, boc);
            if (transaction == null) {
                await client.query(
                    'INSERT INTO pending_deposits (user_id, boc, amount) VALUES ($1, $2, $3)',
                    [userId, boc, amount]
                );
                await client.query('ROLLBACK');
                throw new Error("Transaction not found")
            }
            const txHash = transaction.hash().toString("hex");
            
            const result = await client.query(
                'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING *',
                [amount, userId]
            );
            
            await TransactionService.createTransaction(client, userId, amount, TransactionEnum.DEPOSIT, txHash);
            
            await client.query('COMMIT');
            return User.fromRow(result.rows[0]);
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    static async withdrawBalance(userId: number, amount: number): Promise<User | string> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const userResult = await client.query(
                'SELECT balance, wallet_address FROM users WHERE id = $1 FOR UPDATE',
                [userId]
            );

            if (userResult.rowCount === 0) {
                await client.query('ROLLBACK');
                return 'User not found';
            }

            const { balance, wallet_address } = userResult.rows[0];
            if (balance < amount) {
                await client.query('ROLLBACK');
                return 'Insufficient balance';
            }

            const transaction = await sendTon(wallet_address, amount);
            const txHash = Buffer.from(transaction.hash()).toString('hex');
            
            const result = await client.query(
                'UPDATE users SET balance = balance - $1 WHERE id = $2 RETURNING *',
                [amount, userId]
            );

            await TransactionService.createTransaction(client, userId, amount, TransactionEnum.WITHDRAWAL, txHash);

            await client.query('COMMIT');
            return User.fromRow(result.rows[0]);
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

}
