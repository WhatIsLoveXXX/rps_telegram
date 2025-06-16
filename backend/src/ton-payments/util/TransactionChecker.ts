import cron from 'node-cron';
import db from '../../config/db';
import { findTransactionByHashWithWait, getTransactionByMessageHash } from './TonSenderReceiver';
import { TransactionService } from '../transactionService';
import * as dotenv from 'dotenv';
import { TransactionStatus, TransactionType } from '../types';
import { BalanceService } from '../../user/service/balanceService';

dotenv.config();

class DepositRetryService {
    static start() {
        cron.schedule('*/25 * * * *', async () => {
            console.log('[CRON] Running deposit retry...');
            await DepositRetryService.processPendingDeposits();
        });
    }

    static async processPendingDeposits() {
        const client = await db.connect();
        const MAX_RETRIES = 10;
        try {
            const { rows } = await client.query('SELECT * FROM pending_deposits_withdrawals ORDER BY last_attempt_at ASC');

            for (const deposit of rows) {
                const { id, user_id, boc, amount, type, retry_count, wallet_address } = deposit;
                let transactionInfo, isSuccessInfo;
                if (Number(type) === TransactionType.DEPOSIT) {
                    const { transaction, isSuccess } = await findTransactionByHashWithWait(wallet_address, boc);
                    transactionInfo = transaction;
                    isSuccessInfo = isSuccess;
                } else {
                    const { transaction, isSuccess } = await getTransactionByMessageHash(wallet_address, boc);
                    transactionInfo = transaction;
                    isSuccessInfo = isSuccess;
                }
                const transactionStatus = isSuccessInfo ? TransactionStatus.CREATED : TransactionStatus.REJECTED;

                if (transactionInfo) {
                    const txHash = Buffer.from(transactionInfo.hash, 'base64').toString('hex');
                    await client.query('BEGIN');

                    Number(type) === TransactionType.DEPOSIT
                        ? await BalanceService.addBalance(user_id, amount, client)
                        : await BalanceService.deductBalance(user_id, amount, client);

                    await TransactionService.createTransaction(
                        user_id,
                        amount,
                        Number(type) as TransactionType,
                        txHash,
                        transactionStatus,
                        client
                    );

                    await client.query('DELETE FROM pending_deposits_withdrawals WHERE id = $1', [id]);
                    await client.query('COMMIT');
                    console.log(`[CRON] Deposit processed for user_id=${user_id}`);
                } else {
                    if (retry_count + 1 >= MAX_RETRIES) {
                        console.warn(`[CRON] Max retries reached for deposit id=${id}`);
                    } else {
                        await client.query(
                            'UPDATE pending_deposits_withdrawals SET retry_count = retry_count + 1, last_attempt_at = NOW() WHERE id = $1',
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
