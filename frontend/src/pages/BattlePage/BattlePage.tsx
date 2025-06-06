import { useTelegramUser } from "@/hooks/useTelegramUser";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "@/utils/socket-config";
import { useSocketConnection } from "./hooks/useSocketConnection";
import { useEffect } from "react";
import { PlayerState, useGameStore } from "@/store/useGameStore";
import { GameField } from "./components/GameField";

export const BattlePage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const user = useTelegramUser();
  const navigate = useNavigate();
  const { setGameState, self, opponent } = useGameStore();

  const { isLoading } = useSocketConnection();

  useEffect(() => {
    if (!roomId || !user?.id) return;

    // Вызывается при входе на страницу битвы
    socket.emit("connect_user", {
      roomId: roomId,
      userId: user?.id,
    });

    socket.on("game_state", (state) => {
      console.log("SOCKET: game_state", state);

      const players: PlayerState[] = state.players;
      console.log("SOCKET: players", players);
      console.log("SOCKET: user?.id", user?.id);
      const selfPlayer = players.find((p) => p.user.id === user?.id);
      const opponentPlayer = players.find((p) => p.user.id !== user?.id);

      if (!selfPlayer) {
        console.warn("Current user is not found in players");
        return;
      }

      setGameState({
        ...state,
        self: selfPlayer,
        opponent: opponentPlayer,
      });
    });

    socket.on("round_result", (result) => {
      setGameState({ result });
    });

    socket.on("game_over", () => {
      setGameState({ gameOver: true });
    });

    socket.on("waiting_ready", () => {
      console.log("SOCKET: waiting_ready");
    });
    return () => {
      socket.off("game_state");
      socket.off("round_result");
      socket.off("game_over");
    };
  }, [roomId, user?.id]);

  console.log("COMPONENT: self", self);
  console.log("COMPONENT: opponent", opponent);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <GameField />

      <button onClick={() => navigate(-1)}>Back</button>
    </div>
  );
};
