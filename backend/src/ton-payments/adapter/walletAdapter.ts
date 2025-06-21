import { Cell, comment, internal, OpenedContract, SendMode, TonClient, WalletContractV4, WalletContractV5R1 } from '@ton/ton';

const TON_API_KEY = process.env.TON_API_KEY || '';
const TON_API_ENDPOINT = process.env.TON_API_ENDPOINT || '';
const WALLET_VERSION = process.env.WALLET_VERSION;

const client = new TonClient({
    endpoint: TON_API_ENDPOINT,
    apiKey: TON_API_KEY,
});

interface WalletAdapter {
    contract: OpenedContract<any>;
    getSeqno(): Promise<number>;
    getBalance(): Promise<bigint>;
    createTransfer(args: { seqno: number; secretKey: Buffer; amountNano: bigint; receiver: string; commentText?: string }): Cell;
    send(transfer: Cell): Promise<void>;
}

class WalletAdapterV4 implements WalletAdapter {
    contract: OpenedContract<WalletContractV4>;

    constructor(publicKey: Buffer) {
        const wallet = WalletContractV4.create({ workchain: 0, publicKey });
        this.contract = client.open(wallet);
    }

    getSeqno() {
        return this.contract.getSeqno();
    }

    getBalance() {
        return this.contract.getBalance();
    }

    createTransfer({
        seqno,
        secretKey,
        amountNano,
        receiver,
        commentText = 'From KNB',
    }: {
        seqno: number;
        secretKey: Buffer;
        amountNano: bigint;
        receiver: string;
        commentText?: string;
    }): Cell {
        console.log('Создали в 4 версии!');
        return this.contract.createTransfer({
            seqno: seqno,
            secretKey,
            sendMode: SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS,
            bounce: false,
            messages: [
                internal({
                    to: receiver,
                    value: amountNano,
                    body: comment(commentText),
                }),
            ],
        });
    }

    send(transfer: Cell) {
        return this.contract.send(transfer);
    }
}

class WalletAdapterV5 implements WalletAdapter {
    contract: OpenedContract<WalletContractV5R1>;

    constructor(publicKey: Buffer) {
        const wallet = WalletContractV5R1.create({ workchain: 0, publicKey });
        this.contract = client.open(wallet);
    }

    getSeqno() {
        return this.contract.getSeqno();
    }

    getBalance() {
        return this.contract.getBalance();
    }

    createTransfer({
        seqno,
        secretKey,
        amountNano,
        receiver,
        commentText = 'From KNB',
    }: {
        seqno: number;
        secretKey: Buffer;
        amountNano: bigint;
        receiver: string;
        commentText?: string;
    }): Cell {
        console.log('Создали в 5 версии!');
        return this.contract.createTransfer({
            seqno,
            secretKey,
            bounce: false,
            sendMode: SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS,
            messages: [
                internal({
                    to: receiver,
                    value: amountNano,
                    body: comment(commentText),
                }),
            ],
        });
    }

    send(transfer: Cell) {
        return this.contract.send(transfer);
    }
}

export function createWalletAdapter(publicKey: Buffer): WalletAdapter {
    const version = Number(WALLET_VERSION) || 5;
    if (version === 4) return new WalletAdapterV4(publicKey);
    if (version === 5) return new WalletAdapterV5(publicKey);
    throw new Error('Unsupported wallet version: ' + version);
}
