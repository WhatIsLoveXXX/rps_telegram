import {SendTransactionRequest} from "@tonconnect/ui-react";

const tonToNano = (tonAmount: number) => Math.round(tonAmount * 1_000_000_000);

export const prepareTransaction = (priceInUsdt: number, tonPrice: number): SendTransactionRequest => {
    const tonAmount = priceInUsdt / tonPrice;
    return {
        validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes
        messages: [
            {
                address: import.meta.env.VITE_RECEIVER_ADDRESS, // TON
                amount: tonToNano(tonAmount).toString(), // Toncoin in nanotons
            },
        ],
    }
}