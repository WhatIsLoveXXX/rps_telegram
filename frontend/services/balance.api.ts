import { api } from "./api";

export const topUpBalance = async (amount: number, boc: string) => {
  try {
    const response = await api.post("/users/balance/topUp", { amount, boc });
    return response.data;
  } catch (error) {
    throw new Error(`Error top up`);
  }
};

export const withdrawBalance = async (amount: number) => {
  try {
    const response = await api.post("/balance/withdraw", { amount });
    return response.data;
  } catch (error) {
    throw new Error(`Error withdrawing`);
  }
};
