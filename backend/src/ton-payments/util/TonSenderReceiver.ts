import { mnemonicToWalletKey } from '@ton/crypto';
import { Cell, comment, internal, OpenedContract, SendMode, toNano, TonClient, WalletContractV4 } from '@ton/ton';
import dotenv from 'dotenv';
import { CustomerNotEnoughFunds, TransactionNotFoundError } from '../../constants/errors';
import { TonTransaction, TonTransactionsResponse } from '../types';

dotenv.config();

const SECRET_WALLET_WORDS = process.env.SECRET_WALLET_WORDS || '';
const TON_API_KEY = process.env.TON_API_KEY || '';
const TON_API_ENDPOINT = process.env.TON_API_ENDPOINT || '';
const TON_API_V3_ENDPOINT = 'https://toncenter.com/api/v3';

const client = new TonClient({
    endpoint: TON_API_ENDPOINT,
    apiKey: TON_API_KEY,
});

const maxRetries = 5;
const delayMs = 4000;

async function waitForSeqnoChange(
    contract: OpenedContract<WalletContractV4>,
    oldSeqno: number,
    timeout = 180_000,
    interval = 3_000
): Promise<void> {
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

export async function sendTon(receiverAddress: string, amount: number) {
    const mnemonic = SECRET_WALLET_WORDS.split(' ');
    const { publicKey, secretKey } = await mnemonicToWalletKey(mnemonic);
    const wallet = WalletContractV4.create({ workchain: 0, publicKey });
    const amountNano = toNano(amount);

    const contract = client.open(wallet);
    const [seqNo, balance] = await Promise.all([contract.getSeqno(), contract.getBalance()]);

    if (balance < amountNano) {
        throw new CustomerNotEnoughFunds();
    }

    const transfer = contract.createTransfer({
        seqno: seqNo,
        secretKey,
        messages: [internal({ to: receiverAddress, value: amountNano, body: comment('💸 From API') })],
        sendMode: SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS,
    });

    const messageHash = Cell.fromBoc(transfer.toBoc())[0].hash().toString('base64');

    await contract.send(transfer);

    console.log('📤 Transaction sent. Waiting for confirmation...');

    await waitForSeqnoChange(contract, seqNo);

    console.log('✅ Transaction confirmed. Receiving details...');

    const { transaction, isSuccess } = await getTransactionByMessageHash(contract.address.toString(), messageHash);
    return { transaction, isSuccess, messageHash };
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
