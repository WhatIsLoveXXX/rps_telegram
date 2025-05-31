// В случае ошибки допустим выхода из таймаута и не сохранение транзакции локально, то потом тогда 
// пытаться делать ретрай, проверять какое-то поле, можно генерить айдишку в комменте допустим

import { mnemonicToWalletKey } from "ton-crypto";
import {Address, Cell, Transaction,comment,
    internal, OpenedContract,
    SendMode,
    toNano,
    TonClient,
    WalletContractV4} from "ton";
import dotenv from "dotenv";

dotenv.config();

const SECRET_WALLET_WORDS = process.env.SECRET_WALLET_WORDS || '';
const TON_API_KEY = process.env.TON_API_KEY;
const TON_API_ENDPOINT = process.env.TON_API_ENDPOINT || '';

const client = new TonClient({
    endpoint: TON_API_ENDPOINT,
    apiKey: TON_API_KEY,
});

async function waitForSeqnoChange(
    contract: OpenedContract<WalletContractV4>,
    oldSeqno: number,
    timeout = 180_000,
    interval = 3_000
): Promise<void> {
    console.log("⏳ Ожидаем подтверждение транзакции...");

    const start = Date.now();

    while (true) {
        const elapsed = Date.now() - start;

        if (elapsed > timeout) {
            throw new Error("⏰ Timeout: Транзакция не подтвердилась за отведённое время.");
        }

        const currentSeqno = await contract.getSeqno();
        console.log(`🔁 seqno = ${currentSeqno} | ожидаем > ${oldSeqno} (${Math.floor(elapsed / 1000)}s)`);

        if (currentSeqno > oldSeqno) {
            console.log("✅ Транзакция подтверждена");
            return;
        }

        await sleep(interval);
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getTransactionByMessageHash(
    client: TonClient,
    address: Address,
    desiredMessageHash: string
): Promise<Transaction> {
    const maxRetries = 5;
    const delayMs = 2000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const limit = attempt * 20;
        console.log(`🔁 Attempt ${attempt}, checking last ${limit} transactions...`);

        const txs = await client.getTransactions(address, { limit });

        const tx = txs.find(tx => {
            try {
                const inMsgHash = tx.inMessage?.body?.hash?.().toString("hex");
                return inMsgHash === desiredMessageHash;
            } catch {
                return false;
            }
        });

        if (tx) {
            console.log("✅ Transaction found!");
            return tx;
        }

        if (attempt < maxRetries) {
            console.log(`⏳ Not found, retrying in ${delayMs / 1000} seconds...`);
            await sleep(delayMs);
        }
    }

    throw new Error("❌ Transaction not found after all retries.");
}


export async function sendTon(wallet_address: string, amount: number) {
    const mnemonic = SECRET_WALLET_WORDS.split(" ");
    const { publicKey, secretKey } = await mnemonicToWalletKey(mnemonic);
    const wallet = WalletContractV4.create({ workchain: 0, publicKey });
    const amountNano = toNano(amount);
    
    const contract = client.open(wallet);
    const [seqNo, balance] = await Promise.all([contract.getSeqno(), contract.getBalance()]);

    if (balance < amountNano) {
        throw new Error("❌ Недостаточно средств для перевода.");
    }

    const transfer = contract.createTransfer({
        seqno: seqNo,
        secretKey,
        messages: [internal({ to: wallet_address, value: amountNano, body: comment('💸 From API') })],
        sendMode: SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS,
    });

    const boc = transfer.toBoc();
    const cell = Cell.fromBoc(boc)[0];
    const messageHash = cell.hash().toString('hex');

    await contract.send(transfer);

    console.log("📤 Транзакция отправлена. Ожидаем подтверждения...");
    
    await waitForSeqnoChange(contract, seqNo);

    console.log("✅ Транзакция подтверждена. Получаем детали...");

    return await getTransactionByMessageHash(client, contract.address, messageHash);
}

export async function findTransactionByHashWithWait(
    walletAddress: string,
    boc: string,
    timeout: number = 180_000,
    interval: number = 5_000
) {
    const address = Address.parse(walletAddress);
    const cell = Cell.fromBoc(Buffer.from(boc, "base64"))[0];
    const hashToFind = cell.hash().toString("hex");

    const start = Date.now();

    while (true) {
        const elapsed = Date.now() - start;

        if (elapsed > timeout) {
            console.warn("⏰ Таймаут ожидания транзакции");
            return null;
        }

        try {
            const txs = await client.getTransactions(address, { limit: 10 });

            for (const tx of txs) {
                const currentHash = tx.hash().toString("hex");
                if (currentHash === hashToFind) {
                    console.log("✅ Транзакция найдена");
                    return tx;
                }
            }
        } catch (err) {
            console.error("❌ Ошибка при проверке транзакции:", err);
        }

        console.log(`⏳ Ожидаем транзакцию... (${Math.floor(elapsed / 1000)}s)`);
        await sleep(interval);
    }
}