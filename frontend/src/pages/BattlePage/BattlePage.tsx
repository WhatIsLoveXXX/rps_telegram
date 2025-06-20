import { useTelegramUser } from "@/hooks/useTelegramUser";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "@/utils/socket-config";
import { useSocketConnection } from "./hooks/useSocketConnection";
import { useEffect } from "react";
import { PlayerState, useGameStore } from "@/store/useGameStore";
import { GameField } from "./components/GameField";
import { splitPlayers } from "./utils/splitPlayers";
import { startRoundTimer } from "./utils/roundTimer";
import { RoundWinnerModal } from "./components/RoundWinnerModal";
import { GameWinnerModal } from "./components/GameWinnerModal";

import { useReadyTimer } from "./hooks/useReadyTimer";
import { shouldStartReadyTimer } from "./utils/playerReadyChecker";

export const BattlePage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const user = useTelegramUser();
  const {
    setGameState,
    resetGame,
    showRoundWinnerModal,
    showGameWinnerModal,
    resetGameWithoutUsers,
    players,
    gameStarted,
  } = useGameStore();

  const { isLoading } = useSocketConnection();

  // Хук для управления таймером готовности
  const { timeLeft: readyTimeLeft, isActive: isReadyTimerActive } =
    useReadyTimer({
      roomId: roomId || "",
      shouldStartTimer: shouldStartReadyTimer(players, gameStarted),
      onTimeExpired: () => {
        console.log("=== TIMER EXPIRED - DETAILED CHECK ===");
        console.log("Current user ID:", user?.id);
        console.log(
          "Players state:",
          players.map((p) => ({
            id: p.user.id,
            username: p.user.username,
            isReady: p.isReady,
          }))
        );

        // Когда время истекло, проверяем готовность текущего пользователя
        const currentPlayer = players.find((p) => p.user.id === user?.id);
        console.log(
          "Current player found:",
          currentPlayer
            ? {
                id: currentPlayer.user.id,
                username: currentPlayer.user.username,
                isReady: currentPlayer.isReady,
              }
            : "NOT FOUND"
        );

        // Если текущий пользователь не готов - выкидываем его
        if (currentPlayer && !currentPlayer.isReady) {
          console.log("❌ Kicking current player - NOT READY");
          navigate("/battles");
        } else if (currentPlayer && currentPlayer.isReady) {
          console.log("✅ Current player is READY - staying in room");
        } else {
          console.log(
            "⚠️ Current player NOT FOUND in players array - this is a problem!"
          );
          // Возможно стоит не выкидывать если игрока нет в массиве
        }
        console.log("=== END TIMER EXPIRED CHECK ===");
      },
    });

  // Обновляем состояние таймера готовности в store
  useEffect(() => {
    setGameState({
      readyTimeLeft,
      showReadyTimer: isReadyTimerActive,
    });
  }, [readyTimeLeft, isReadyTimerActive, setGameState]);

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
