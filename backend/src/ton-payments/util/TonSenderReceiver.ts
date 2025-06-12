import { mnemonicToWalletKey } from 'ton-crypto';
import {
    Address,
    Cell,
    comment,
    internal,
    OpenedContract,
    SendMode,
    toNano,
    TonClient,
    WalletContractV4,
    beginCell,
    storeMessage,
    TransactionDescription,
    TransactionActionPhase,
} from 'ton';
import dotenv from 'dotenv';
import { CustomerNotEnoughFunds, TransactionNotFoundError } from '../../constants/errors';

dotenv.config();

const SECRET_WALLET_WORDS = process.env.SECRET_WALLET_WORDS || '';
const TON_API_KEY = process.env.TON_API_KEY;
const TON_API_ENDPOINT = process.env.TON_API_ENDPOINT || '';

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

    const messageHash = Cell.fromBoc(transfer.toBoc())[0].hash().toString('hex');

    await contract.send(transfer);

    console.log('📤 Transaction sent. Waiting for confirmation...');

    await waitForSeqnoChange(contract, seqNo);

    console.log('✅ Transaction confirmed. Receiving details...');

    const { transaction, isSuccess } = await getTransactionByMessageHash(contract.address, messageHash);
    return { transaction, isSuccess, messageHash };
}

export async function getTransactionByMessageHash(address: Address, desiredMessageHash: string) {
    return findTransactionWithRetry(client, address, (tx) => {
        const inMsgHash = tx.inMessage?.body?.hash?.().toString('hex');
        return inMsgHash === desiredMessageHash;
    });
}

export async function findTransactionByHashWithWait(senderAddress: string, boc: string) {
    const address = Address.parse(senderAddress);

    return findTransactionWithRetry(client, address, (tx) => {
        const currentBoc = getMessageBoc(tx.inMessage);
        return currentBoc === boc;
    });
}

async function findTransactionWithRetry(
    client: TonClient,
    address: Address,
    match: (tx: any) => boolean
): Promise<{ transaction: any | null; isSuccess: boolean }> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const limit = attempt * 10;
        console.log(`🔁 Attempt ${attempt}, checking last ${limit} transactions...`);

        try {
            const txs = await client.getTransactions(address, { limit });

            for (const transaction of txs) {
                if (!transaction.inMessage) continue;

                if (match(transaction)) {
                    const isSuccess = isTransactionSuccess(transaction.description);
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

function isTransactionSuccess(description: any): boolean {
    const { isAborted, actionPhase } = checkAbortedAndAction(description);
    return isAborted || !actionPhase ? false : actionPhase.success;
}

function getMessageBoc(message: any): string {
    return beginCell().store(storeMessage(message)).endCell().toBoc().toString('base64');
}

function checkAbortedAndAction(description: TransactionDescription): {
    isAborted?: boolean;
    actionPhase?: TransactionActionPhase;
} {
    let isAborted: boolean | undefined;
    let actionPhase: TransactionActionPhase | undefined;

    switch (description.type) {
        case 'generic':
        case 'tick-tock':
        case 'split-prepare':
        case 'merge-install':
            isAborted = description.aborted;

            if (description.actionPhase) {
                actionPhase = description.actionPhase;
            }
            break;
        case 'merge-prepare':
            isAborted = description.aborted;
            break;
        case 'storage':
        case 'split-install':
            break;
    }
    return { isAborted, actionPhase };
}
