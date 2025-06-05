import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import axios from "axios";

const { initDataRaw } = retrieveLaunchParams();

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Authorization: `tma ${initDataRaw}`,
  },
});
