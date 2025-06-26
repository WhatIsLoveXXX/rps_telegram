import { Address, Cell, comment, internal, OpenedContract, SendMode, TonClient, WalletContractV4, WalletContractV5R1 } from '@ton/ton';

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

    estimateFee(args: { seqno: number; amountNano: bigint; receiver: string; commentText?: string }): Promise<bigint>;
}

abstract class BaseWalletAdapter implements WalletAdapter {
    abstract contract: OpenedContract<any>;

    abstract createTransfer(args: { seqno: number; secretKey: Buffer; amountNano: bigint; receiver: string; commentText?: string }): Cell;

    getSeqno() {
        return this.contract.getSeqno();
    }

    getBalance() {
        return this.contract.getBalance();
    }

    send(transfer: Cell) {
        return this.contract.send(transfer);
    }

    async estimateFee({
        seqno,
        amountNano,
        receiver,
        commentText = 'From KNB',
    }: {
        seqno: number;
        amountNano: bigint;
        receiver: string;
        commentText?: string;
    }): Promise<bigint> {
        const transfer = this.createTransfer({
            seqno,
            secretKey: Buffer.alloc(64),
            amountNano,
            receiver,
            commentText,
        });

        const fees = await client.estimateExternalMessageFee(this.contract.address, {
            body: transfer,
            initCode: null,
            initData: null,
            ignoreSignature: true,
        });

        const { gas_fee, fwd_fee, storage_fee, in_fwd_fee } = fees.source_fees;
        return BigInt(gas_fee) + BigInt(fwd_fee) + BigInt(storage_fee) + BigInt(in_fwd_fee);
    }
}

class WalletAdapterV4 extends BaseWalletAdapter {
    contract: OpenedContract<WalletContractV4>;

    constructor(publicKey: Buffer) {
        const wallet = WalletContractV4.create({ workchain: 0, publicKey });
        super();
        this.contract = client.open(wallet);
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
        return this.contract.createTransfer({
            seqno,
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
}

class WalletAdapterV5 extends BaseWalletAdapter {
    contract: OpenedContract<WalletContractV5R1>;

    constructor(publicKey: Buffer) {
        const wallet = WalletContractV5R1.create({ workchain: 0, publicKey });
        super();
        this.contract = client.open(wallet);
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
        return this.contract.createTransfer({
            seqno,
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
}

export function createWalletAdapter(publicKey: Buffer): WalletAdapter {
    const version = Number(WALLET_VERSION) || 5;
    if (version === 4) return new WalletAdapterV4(publicKey);
    if (version === 5) return new WalletAdapterV5(publicKey);
    throw new Error('Unsupported wallet version: ' + version);
}
