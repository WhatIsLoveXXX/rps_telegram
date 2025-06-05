import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import axios from "axios";

const { initDataRaw } = retrieveLaunchParams();

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Authorization: `tma ${initDataRaw}`,
    "ngrok-skip-browser-warning": "skip", //Needed for ngrok tunnel
  },
});
