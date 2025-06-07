import { useTelegramUser } from "@/hooks/useTelegramUser";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "@/utils/socket-config";
import { useSocketConnection } from "./hooks/useSocketConnection";
import { useEffect } from "react";
import { PlayerState, useGameStore } from "@/store/useGameStore";
import { GameField } from "./components/GameField";
import { splitPlayers } from "./utils/splitPlayers";

export const BattlePage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const user = useTelegramUser();
  const navigate = useNavigate();
  const { setGameState } = useGameStore();

  const { isLoading } = useSocketConnection();

  useEffect(() => {
    if (!roomId || !user?.id) return;

    // On page load
    socket.emit("connect_user", {
      roomId: roomId,
      userId: user?.id,
    });

    socket.on("game_state", (state) => {
      console.log("SOCKET: game_state", state);

      const players: PlayerState[] = state.players;
      const { selfPlayer, opponentPlayer } = splitPlayers(players, user.id);

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
    return () => {
      socket.off("game_state");
      socket.off("round_result");
      socket.off("game_over");
    };
  }, [roomId, user?.id]);

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
