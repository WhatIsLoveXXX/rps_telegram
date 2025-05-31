import {getTransactionByOrder, TransactionEnum} from "./transactionType";

export class Transaction {
    id: number;
    userId: string;
    amount: number;
    type: TransactionEnum;
    txHash: string;
    createdAt: string;

    constructor(id: number, userId: string, amount: number, type: number, txHash: string, createdAt: string) {
        this.id = id;
        this.userId = userId;
        this.amount = amount;
        this.type = getTransactionByOrder(type);
        this.txHash = txHash;
        this.createdAt = createdAt;
    }

    static fromRow(row: any): Transaction {
        return new Transaction(
            row.id,
            row.user_id,
            parseFloat(row.amount),
            row.type,
            row.tx_hash,
            row.created_at
        );
    }
}