import { api } from "./api";
import { IUser } from "./users.types";

export const authorize = async () => {
  try {
    const response = await api.post("/users/authorize", undefined);
    return response.data;
  } catch (error: any) {
    throw error.response.data.message;
  }
};

export const getUser = async (userId?: number) => {
  try {
    const response = await api.get<IUser>(`/users/${userId}`);
    return response.data;
  } catch (error: any) {
    throw error.response.data.message;
  }
};

export const updateWallet = async (walletAddress: string) => {
  try {
    const response = await api.post("/users/wallet", { walletAddress });
    return response.data;
  } catch (error: any) {
    throw error.response.data.message;
  }
};
