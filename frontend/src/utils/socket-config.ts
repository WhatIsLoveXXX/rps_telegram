import { io, Socket } from "socket.io-client";

export const socket: Socket = io(import.meta.env.VITE_BACKEND_URL, {
  extraHeaders: {
    "ngrok-skip-browser-warning": "skip", //Needed for ngrok tunnel
  },
  autoConnect: false,
});
