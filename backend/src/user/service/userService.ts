import db from '../../config/db';
import { User } from '../model/user';
import { findTransactionByHashWithWait, sendTon } from '../../ton-payments/util/TonSenderReceiver';
import { TransactionService } from '../../ton-payments/transactionService';
import { Queryable } from '../../config/types';
import { UserStatsService } from './userStatsService';
import { BalanceService } from './balanceService';
import { InsufficientBalanceError, TransactionNotFoundError, UserNotFoundError } from '../../constants/errors';
import { TransactionStatus, TransactionType } from '../../ton-payments/types';

export class UserService {
    static async createUser(id: number, username: string, firstName: string, lastName: string, photoUrl: string): Promise<User> {
        const result = await db.query(
            'INSERT INTO users (id, username, first_name, last_name, photo_url) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING returning *',
            [id, username, firstName, lastName, photoUrl]
        );
        return User.fromRow(result.rows[0]);
    }

    static async isExist(id: number): Promise<boolean> {
        const result = await db.query('SELECT COUNT(*) AS count FROM users WHERE id = $1', [id]);
        return result.rows[0].count > 0;
    }

    static async getUserById(id: number, withStats = false, client: Queryable = db): Promise<User | null> {
        try {
            const query = 'SELECT * FROM users WHERE id = $1';
            const res = await client.query(query, [id]);
            const row = res.rows[0];
            if (!row) return null;

            const user = User.fromRow(row);

            if (withStats) {
                user.stats = await UserStatsService.getUserStats(id, client);
            }

            return user;
        } catch (err) {
            console.error('Error in getUserById:', err);
            throw new UserNotFoundError();
        }
    }

    static async updateWallet(id: number, wallet: string): Promise<void> {
        if (wallet.length !== 48) {
            throw new Error('Invalid wallet length: must be exactly 48 characters.');
        }
        await db.query('UPDATE users SET wallet = $1 WHERE id = $2', [wallet, id]);
    }

    static async topUpBalance(userId: number, amount: number, boc: string, senderAddress: string): Promise<User | null> {
        const client = await db.connect();
        let shouldInsertPending = false;
        try {
            await client.query('BEGIN');

            const user = await UserService.getUserById(userId, false, client);

            if (!user) {
                throw new UserNotFoundError();
            }

            const { transaction, isSuccess } = await findTransactionByHashWithWait(senderAddress, boc);
            if (transaction === null) {
                shouldInsertPending = true;
                throw new TransactionNotFoundError();
            }
            const txHash = Buffer.from(transaction.hash, 'base64').toString('hex');
            const transactionStatus = isSuccess ? TransactionStatus.CREATED : TransactionStatus.REJECTED;

            const updatedUser = isSuccess ? await BalanceService.addBalance(userId, amount, client) : null;

            await TransactionService.createTransaction(userId, amount, TransactionType.DEPOSIT, txHash, transactionStatus, client);

            await client.query('COMMIT');
            return updatedUser;
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(err);

            if (shouldInsertPending) {
                try {
                    await client.query(
                        'INSERT INTO pending_deposits_withdrawals (user_id, boc, amount, type, wallet_address) VALUES ($1, $2, $3, $4, $5)',
                        [userId, boc, amount, TransactionType.DEPOSIT, senderAddress]
                    );
                } catch (insertErr) {
                    console.error('Failed to insert pending withdrawal:', insertErr);
                }
            }

            throw err;
        } finally {
            client.release();
        }
    }

    static async withdrawBalance(userId: number, amount: number, receiverAddress: string): Promise<User | string> {
        const client = await db.connect();
        let shouldInsertPending = false;
        let messageHash: string | null = null;

        try {
            await client.query('BEGIN');

            const userResult = await UserService.getUserById(userId, false, client);
            if (!userResult) {
                throw new UserNotFoundError();
            }

            if (userResult.balance < amount) {
                throw new InsufficientBalanceError();
            }

            const { transaction, isSuccess, messageHash: hash } = await sendTon(receiverAddress, amount);
            messageHash = hash;

            if (transaction === null) {
                shouldInsertPending = true;
                throw new TransactionNotFoundError();
            }
            const txHash = Buffer.from(transaction.hash, 'base64').toString('hex');
            const transactionStatus = isSuccess ? TransactionStatus.CREATED : TransactionStatus.REJECTED;

            const updatedUser = BalanceService.deductBalance(userId, amount, client);

            await TransactionService.createTransaction(userId, amount, TransactionType.WITHDRAW, txHash, transactionStatus, client);

            await client.query('COMMIT');
            return updatedUser;
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(err);

            if (shouldInsertPending && messageHash) {
                try {
                    await client.query(
                        'INSERT INTO pending_deposits_withdrawals (user_id, boc, amount, type, wallet_address) VALUES ($1, $2, $3, $4, $5)',
                        [userId, messageHash, amount, TransactionType.WITHDRAW, process.env.WALLET_ADDRESS]
                    );
                } catch (insertErr) {
                    console.error('Failed to insert pending withdrawal:', insertErr);
                }
            }

            throw err;
        } finally {
            client.release();
        }
    }
}
