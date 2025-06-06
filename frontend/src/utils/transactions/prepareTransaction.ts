import { SendTransactionRequest } from "@tonconnect/ui-react";
import { beginCell } from "@ton/ton";

const tonToNano = (tonAmount: number) => Math.round(tonAmount * 1_000_000_000);

export const prepareTransaction = (
  tonPrice: number,
  userName: string
): SendTransactionRequest => {
  const body = beginCell()
    .storeUint(0, 32) // write 32 zero bits to indicate that a text comment will follow
    .storeStringTail(`Transaction sent from ${userName}`) // write our text comment
    .endCell();

  return {
    validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes
    messages: [
      {
        address: import.meta.env.VITE_RECEIVER_ADDRESS, // TON
        amount: tonToNano(tonPrice).toString(), // Toncoin in nanotons
        payload: body.toBoc().toString("base64"),
        // amount: "2000" //test
      },
    ],
  };
};
