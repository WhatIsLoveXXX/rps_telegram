import { mnemonicToWalletKey } from '@ton/crypto';
import { Cell, OpenedContract, toNano } from '@ton/ton';
import dotenv from 'dotenv';
import { CustomerNotEnoughFunds, TransactionNotFoundError } from '../../constants/errors';
import { TonTransaction, TonTransactionsResponse } from '../types';
import { createWalletAdapter } from '../adapter/walletAdapter';
import * as process from 'node:process';

dotenv.config();

const TON_API_KEY = process.env.TON_API_KEY || '';
const SECRET_WALLET_WORDS = process.env.SECRET_WALLET_WORDS || '';
const TON_API_V3_ENDPOINT = 'https://toncenter.com/api/v3';

const maxRetries = 5;
const delayMs = 4000;

export async function sendTon(receiverAddress: string, amount: number) {
    const mnemonic = SECRET_WALLET_WORDS.split(' ');
    const { publicKey, secretKey } = await mnemonicToWalletKey(mnemonic);
    const contract = createWalletAdapter(publicKey);
    const amountNano = toNano(amount);

    const [seqno, balance] = await Promise.all([contract.getSeqno(), contract.getBalance()]);

    const reserveBuffer = toNano(0.000005);
    const estimatedFee = await contract.estimateFee({
        seqno,
        amountNano,
        receiver: receiverAddress,
    });

    const amountToSend = amountNano - estimatedFee - reserveBuffer;
    const totalCost = amountNano + estimatedFee + reserveBuffer;

    if (balance < totalCost) {
        throw new CustomerNotEnoughFunds(`Not enough TON: need ${Number(totalCost) / 1e9}, have ${Number(balance) / 1e9}`);
    }

    const transfer = contract.createTransfer({
        seqno,
        secretKey,
        amountNano: amountToSend,
        receiver: receiverAddress,
    });

    const messageHash = Cell.fromBoc(transfer.toBoc())[0].hash().toString('base64');

    await contract.send(transfer);
    console.log('📤 Transaction sent. Waiting for confirmation...');

    await waitForSeqnoChange(contract.contract, seqno);
    console.log('✅ Transaction confirmed. Receiving details...');

    const { transaction, isSuccess } = await getTransactionByMessageHash(contract.contract.address.toString(), messageHash);

    const spent = getRealSpentFromTransaction(transaction);

    const { bounced, bouncedCommission } = transaction
        ? await wasBouncedFromSender(receiverAddress, transaction)
        : { bounced: false, bouncedCommission: BigInt(0) };

    return { transaction, isSuccess, messageHash, bounced, spent, bouncedCommissionTon: nanoToTon(bouncedCommission) };
}

export async function receiveTon(receiverAddress: string, boc: string) {
    const { transaction, isSuccess } = await findTransactionByHashWithWait(receiverAddress, boc);

    // const bounced = transaction ? await wasBouncedFromSender(receiverAddress, transaction) : false; // If customer's wallet inactive, was checking for bounced of this transaction
    const bounced = false;

    return { transaction, isSuccess, bounced };
}

async function waitForSeqnoChange(contract: OpenedContract<any>, oldSeqno: number, timeout = 180_000, interval = 3_000): Promise<void> {
    console.log('⏳ Waiting for transaction confirmation...');

    const start = Date.now();

    while (true) {
        const elapsed = Date.now() - start;

        if (elapsed > timeout) {
            throw new TransactionNotFoundError();
        }

        const currentSeqno = await contract.getSeqno();
        console.log(`🔁 seqno = ${currentSeqno} | waiting > ${oldSeqno} (${Math.floor(elapsed / 1000)}s)`);

        if (currentSeqno > oldSeqno) {
            console.log('✅ Transaction confirmed');
            return;
        }

        await sleep(interval);
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRealSpentFromTransaction(tx: any): number | null {
    if (tx?.account_state_before?.balance && tx?.account_state_after?.balance) {
        const before = BigInt(tx.account_state_before.balance);
        const after = BigInt(tx.account_state_after.balance);
        return nanoToTon(before - after);
    }
    return null;
}

function nanoToTon(nano: bigint): number {
    return Number(nano) / 1e9;
}

async function wasBouncedFromSender(receiverAddress: string, originalTx: TonTransaction) {
    const outHash = originalTx.out_msgs?.[0]?.hash;
    if (!outHash) return { bounced: false, bouncedCommission: BigInt(0) };

    for (let attempt = 1; attempt <= 3; attempt++) {
        const txs = await getTransactions(receiverAddress, 10);

        const found = txs.find(
            (tx) => tx.in_msg && tx.in_msg.hash === outHash && (tx.description.aborted || tx.description.compute_ph?.skipped)
        );

        if (found) {
            console.log('Bounce found at sender side');
            return { bounced: true, bouncedCommission: BigInt(found.in_msg.value) };
        }

        console.log('Not found bouncing on attemt:' + attempt);

        await sleep(delayMs);
    }

    return { bounced: false, bouncedCommission: BigInt(0) };
}

export async function getTransactionByMessageHash(senderAddress: string, desiredMessageHash: string) {
    return findTransactionWithRetry(senderAddress, (tx) => {
        const inMsgHash = tx.in_msg.message_content.hash;
        return inMsgHash === desiredMessageHash;
    });
}

export async function findTransactionByHashWithWait(senderAddress: string, boc: string) {
    return findTransactionWithRetry(senderAddress, (tx) => {
        const hashFromBoc = getCellHashFromBoc(boc);
        return hashFromBoc === tx.in_msg.hash;
    });
}

async function findTransactionWithRetry(
    addressFriendly: string,
    match: (tx: any) => boolean
): Promise<{ transaction: TonTransaction | null; isSuccess: boolean }> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const limit = attempt * 2;
        console.log(`🔁 Attempt ${attempt}, checking last ${limit} transactions...`);

        try {
            const txs = await getTransactions(addressFriendly, limit);

            for (const transaction of txs) {
                if (!transaction.in_msg) continue;
                if (match(transaction)) {
                    const isSuccess = isTransactionSuccess(transaction);
                    console.log('✅ Transaction found');
                    return { transaction, isSuccess };
                }
            }
        } catch (err) {
            console.error('❌ Error verifying transaction:', err);
        }

        if (attempt < maxRetries) {
            console.log(`⏳ Not found, retrying in ${delayMs / 1000} seconds...`);
            await sleep(delayMs);
        }
    }

    return { transaction: null, isSuccess: false };
}

function isTransactionSuccess(tonTransaction: TonTransaction): boolean {
    const isAborted = tonTransaction.description.aborted;
    const action = tonTransaction.description.action;
    return isAborted || !action ? false : action.success;
}

async function getTransactions(senderAddress: string, limit: number): Promise<TonTransaction[]> {
    try {
        const url = TON_API_V3_ENDPOINT + '/transactions?account=' + senderAddress + '&sort=desc&limit=' + limit + '&offset=0';
        const apiKey = TON_API_KEY;
        const response = await fetch(url, { headers: { apiKey } });
        const data: TonTransactionsResponse = await response.json();
        return data.transactions || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

function getCellHashFromBoc(bocBase64: string): string {
    const cell = Cell.fromBoc(Buffer.from(bocBase64, 'base64'))[0];
    return cell.hash().toString('base64');
}
