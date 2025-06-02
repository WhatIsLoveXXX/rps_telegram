import { api } from "./api";

export const topUpBalance = async (
  initDataRaw: string | undefined,
  amount: number,
  boc: string
) => {
  try {
    const response = await api.post(
      "/balance/topUp",
      { amount, boc },
      {
        headers: {
          Authorization: `tma ${initDataRaw}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error top up`);
  }
};

export const withdrawBalance = async (
  initDataRaw: string | undefined,
  amount: number
) => {
  try {
    const response = await api.post(
      "/balance/withdraw",
      { amount },
      {
        headers: {
          Authorization: `tma ${initDataRaw}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error withdrawing`);
  }
};
