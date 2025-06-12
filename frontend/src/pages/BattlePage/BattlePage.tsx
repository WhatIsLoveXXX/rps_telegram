import { useTelegramUser } from "@/hooks/useTelegramUser";
import { useParams } from "react-router-dom";
import { socket } from "@/utils/socket-config";
import { useSocketConnection } from "./hooks/useSocketConnection";
import { useEffect } from "react";
import { PlayerState, useGameStore } from "@/store/useGameStore";
import { GameField } from "./components/GameField";
import { splitPlayers } from "./utils/splitPlayers";
import { startRoundTimer } from "./utils/roundTimer";
import { RoundWinnerModal } from "./components/RoundWinnerModal";
import { GameWinnerModal } from "./components/GameWinnerModal";

export const BattlePage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const user = useTelegramUser();
  const {
    setGameState,
    resetGame,
    showRoundWinnerModal,
    showGameWinnerModal,
    resetGameWithoutUsers,
  } = useGameStore();

  const { isLoading } = useSocketConnection();

  useEffect(() => {
    if (!roomId || !user?.id) return;

    // On page load
    socket.emit("connect_user", {
      roomId: roomId,
      userId: user?.id,
    });

    socket.on("game_state", (state) => {
      // console.log("SOCKET: game_state", state);

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

    socket.on(
      "round_result",
      (state: {
        roundWinner: number | null;
        players: PlayerState[];
        shouldShowOpponentCard: boolean;
        showRoundWinnerModal: boolean;
      }) => {
        console.log("round_result", state);

        const players: PlayerState[] = state.players;
        const { selfPlayer, opponentPlayer } = splitPlayers(players, user.id);

        if (!selfPlayer) {
          console.warn("Current user is not found in players");
          return;
        }
        setGameState({
          ...state,
          shouldShowOpponentCard: true,
          self: selfPlayer,
          opponent: opponentPlayer,
        });
      }
    );

    socket.on(
      "game_over",
      (state: {
        gameWinner: number | null;
        players: PlayerState[];
        gameOver: boolean;
        showGameWinnerModal: boolean;
      }) => {
        const players: PlayerState[] = state.players;
        const { selfPlayer, opponentPlayer } = splitPlayers(players, user.id);

        if (!selfPlayer) {
          console.warn("Current user is not found in players");
          return;
        }
        console.log("game_over", state);
        setGameState({ ...state, self: selfPlayer, opponent: opponentPlayer });
      }
    );

    return () => {
      socket.off("game_state");
      socket.off("round_result");
      socket.off("game_over");
    };
  }, [roomId, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const handleRoundStart = (state: {
      round: number;
      players: PlayerState[];
      shouldShowOpponentCard: boolean;
      roundWinner: number | null;
      showRoundWinnerModal: boolean;
    }) => {
      console.log("start round", state);
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
        gameStarted: true,
        // roundWinner: state.roundWinner,
        // showRoundWinnerModal: state.showRoundWinnerModal,
      });

      startRoundTimer(roomId || "");
    };

    socket.on("round_start", handleRoundStart);

    return () => {
      socket.off("round_start", handleRoundStart);
    };
  }, []);

  useEffect(() => {
    return () => {
      resetGame();
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <GameField />
      <RoundWinnerModal isOpen={showRoundWinnerModal || false} />
      <GameWinnerModal
        isOpen={showGameWinnerModal || false}
        onClose={resetGameWithoutUsers}
      />
    </>
  );
};
