import { useEffect, useState } from "react";
import { socket } from "@/utils/socket-config";
import { Socket } from "socket.io-client";

export const useSocketConnection = () => {
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    socket.connect();

    const onConnect = () => {
      setIsLoading(false);
      console.log("Connected:", socket);
    };
    const onDisconnect = (reason: Socket.DisconnectReason) => {
      setIsLoading(true);
      if (socket.active) {
        console.log("Trying to reconnect", reason);
        // temporary disconnection, the socket will automatically try to reconnect
      } else {
        // the connection was forcefully closed by the server or the client itself
        // in that case, `socket.connect()` must be manually called in order to reconnect
        console.log("Disconnected from socket", reason);
      }
    };
    const onError = (err: any) => console.log("Socket error:", err);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onError);

    return () => {
      socket.disconnect();
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onError);
    };
  }, []);

  return { isLoading };
};
