import axios from "axios";
import { initData } from "@telegram-apps/sdk-react";

//  const initDataRaw = useSignal(initData.raw);
const api = axios.create({
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Authorization: `tma ${initData.raw}`,
  },
});

export const testApi = async (initDataRaw?: string) => {
  try {
    const response = await api.get("/api/users", {
      //   headers: {
      //     Authorization: `tma ${initDataRaw}`,
      //   },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching`);
  }
};
