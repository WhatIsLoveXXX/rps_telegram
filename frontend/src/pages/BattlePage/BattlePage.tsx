import { useEffect } from "react";
import { useParams } from "react-router-dom";

export const BattlePage = () => {
  const { id } = useParams();

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000/battle");

    socket.onopen = () => {
      console.log("Connected to server");
      socket.send(JSON.stringify({ id }));
    };
  }, []);

  return <div>BattlePage {id}</div>;
};
