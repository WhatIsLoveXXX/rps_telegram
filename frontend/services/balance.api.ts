import { api } from "./api";

export const topUpBalance = async (
  amount: number,
  boc: string,
  senderAddress: string
) => {
  try {
    const response = await api.post("/users/balance/topUp", {
      amount,
      boc,
      senderAddress,
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.message;
  }
};

export const withdrawBalance = async (
  amount: number,
  receiverAddress: string
) => {
  try {
    const response = await api.post("/users/balance/withdraw", {
      amount,
      receiverAddress,
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.message;
  }
};
