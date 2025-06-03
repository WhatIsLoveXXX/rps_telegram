import { api } from "./api";

export const authorize = async (initDataRaw?: string) => {
  try {
    const response = await api.post("/users/authorize", undefined, {
      headers: {
        Authorization: `tma ${initDataRaw}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log("error", error);
    throw new Error(`Error authorizing`);
  }
};

export const getUsers = async (initDataRaw?: string) => {
  try {
    const response = await api.get("/users", {
      headers: {
        Authorization: `tma ${initDataRaw}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching`);
  }
};

export const updateWallet = async (
  initDataRaw: string | undefined,
  walletAddress: string
) => {
  try {
    const response = await api.post(
      "/users/wallet",
      { walletAddress },
      {
        headers: {
          Authorization: `tma ${initDataRaw}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error updating wallet`);
  }
};
