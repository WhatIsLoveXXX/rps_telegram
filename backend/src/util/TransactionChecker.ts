import cron from 'node-cron';
import db from "../config/db";
import {findTransactionByHashWithWait} from "./TonSenderReceiver";
import {TransactionService} from "../service/transactionService";
import {TransactionEnum} from "../model/transactionType";
import * as dotenv from 'dotenv';

dotenv.config();

class DepositRetryService {
    static start() {
        // Запуск каждые 30 минут
    cron.schedule('*/30 * * * *', async () => {
            console.log('[CRON] Running deposit retry...');
            await DepositRetryService.processPendingDeposits();
        });
    }

    static async processPendingDeposits() {
        const client = await db.connect();
        const MAX_RETRIES = 10;
        const wallet_address = process.env.WALLET_ADDRESS;
    
        try {
            const { rows } = await client.query(
                'SELECT * FROM pending_deposits ORDER BY last_attempt_at ASC'
            );

            for (const deposit of rows) {
                const { id, user_id, boc, amount, retry_count } = deposit;

                const userResult = await client.query(
                    'SELECT wallet_address FROM users WHERE id = $1',
                    [user_id]
                );

                if (userResult.rowCount === 0) {
                    await client.query('DELETE FROM pending_deposits WHERE id = $1', [id]);
                    continue;
                }

                const wallet = userResult.rows[0].wallet_address;
                const transaction = await findTransactionByHashWithWait(wallet, boc);

                if (transaction) {
                    const txHash = transaction.hash().toString("hex");

                    await client.query('BEGIN');
                    await client.query(
                        'UPDATE users SET balance = balance + $1 WHERE id = $2',
                        [amount, user_id]
                    );
                    await TransactionService.createTransaction(client, user_id, amount, TransactionEnum.DEPOSIT, txHash);
                    await client.query('DELETE FROM pending_deposits WHERE id = $1', [id]);
                    await client.query('COMMIT');
                    console.log(`[CRON] Deposit processed for user_id=${user_id}`);
                } else {
                    if (retry_count + 1 >= MAX_RETRIES) {
                        await client.query('DELETE FROM pending_deposits WHERE id = $1', [id]);
                        console.warn(`[CRON] Max retries reached for deposit id=${id}`);
                    } else {
                        await client.query(
                            'UPDATE pending_deposits SET retry_count = retry_count + 1, last_attempt_at = NOW() WHERE id = $1',
                            [id]
                        );
                        console.log(`[CRON] Retry ${retry_count + 1} for deposit id=${id}`);
                    }
                }
            }
        } catch (err) {
            console.error('[CRON] Failed to process pending deposits:', err);
            await client.query('ROLLBACK');
        } finally {
            client.release();
        }
    }
}

export default DepositRetryService;
