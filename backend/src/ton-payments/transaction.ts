import { TransactionStatus, TransactionType } from './types';

export class Transaction {
    id: number;
    userId: number;
    amount: number;
    type: TransactionType;
    txHash: string;
    status: TransactionStatus;
    createdAt: string;

    constructor(
        id: number,
        userId: number,
        amount: number,
        type: TransactionType,
        txHash: string,
        status: TransactionStatus,
        createdAt: string
    ) {
        this.id = id;
        this.userId = userId;
        this.amount = amount;
        this.type = type;
        this.txHash = txHash;
        this.status = status;
        this.createdAt = createdAt;
    }

    static fromRow(row: any): Transaction {
        return new Transaction(
            Number(row.id),
            Number(row.user_id),
            parseFloat(row.amount),
            Number(row.type) as TransactionType,
            row.tx_hash,
            row.status as TransactionStatus,
            row.created_at
        );
    }
}
