import { api } from "./api";
import { IUser } from "./users.types";

export const authorize = async () => {
  try {
    const response = await api.post("/users/authorize", undefined);
    return response.data;
  } catch (error) {
    console.log("error", error);
    throw new Error(`Error authorizing`);
  }
};

export const getUser = async (userId?: number) => {
  try {
    const response = await api.get<IUser>(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching`);
  }
};

export const updateWallet = async (walletAddress: string) => {
  try {
    const response = await api.post("/users/wallet", { walletAddress });
    return response.data;
  } catch (error) {
    throw new Error(`Error updating wallet`);
  }
};
