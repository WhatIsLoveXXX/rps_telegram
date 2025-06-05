import { api } from "./api";

export const authorize = async () => {
  try {
    const response = await api.post("/users/authorize", undefined);
    return response.data;
  } catch (error) {
    console.log("error", error);
    throw new Error(`Error authorizing`);
  }
};

export const getUsers = async () => {
  try {
    const response = await api.get("/users");
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
