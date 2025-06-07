export enum TransactionEnum {
    WITHDRAWAL, // 0
    DEPOSIT, // 1
}

export function getTransactionByOrder(order: number): TransactionEnum {
    const values = Object.values(TransactionEnum).filter((v) => typeof v === 'number') as number[];
    if (!values.includes(order)) {
        throw new Error(`Invalid order value for TransactionEnum: ${order}`);
    }
    return order as TransactionEnum;
}
