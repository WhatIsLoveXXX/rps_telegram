import { useTelegramUser } from "@/hooks/useTelegramUser";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("https://3ad0-93-171-242-216.ngrok-free.app", {
  rejectUnauthorized: false, // WARN: please do not do this in production
  autoConnect: false,
});

export const BattlePage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const user = useTelegramUser();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState([]);

  // useEffect(() => {

  // }, [roomId]);

  function test() {
    socket.connect();
    console.log("click");
  }

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onFooEvent(value: any) {
      setFooEvents((previous: any) => [...previous, value] as any);
    }
    // socket.on("connect", () => {
    //   console.log("Connected to socket:", socket.id);
    // });
    socket.on("connect", onConnect);

    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err);
    });
    socket.on("error", (error) => {
      console.log("ERROR");
      console.log(error);
    });
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("foo", onFooEvent);
    };
  }, []);

  return (
    <div>
      BattlePage {roomId}
      <button onClick={test}>Join room</button>
      <p>State: {"" + isConnected}</p>
      <ul>
        {fooEvents.map((event, index) => (
          <li key={index}>{event}</li>
        ))}
      </ul>
    </div>
  );
};
