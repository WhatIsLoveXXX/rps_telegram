import { useTelegramUser } from "@/hooks/useTelegramUser";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("https://abe4-5-58-147-116.ngrok-free.app",{
  extraHeaders: {
    "ngrok-skip-browser-warning": "69420"
  }
});

export const BattlePage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const user = useTelegramUser();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState([]);

  // useEffect(() => {

  // }, [roomId]);

  function test() {
    socket.emit('join_battle', {roomId, user});
    console.log("click");
  }

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err);
    });
    socket.on("error", (error) => {
      console.log("ERROR");
      console.log(error);
    });
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
