import { useGameStore } from "@/store/useGameStore";
import { socket } from "@/utils/socket-config";
import clsx from "clsx";
import { useParams } from "react-router-dom";
import { useTelegramUser } from "@/hooks/useTelegramUser";
import WinIcon from "@/assets/icons/win-icon.svg?react";
import LossIcon from "@/assets/icons/lose-icon.svg?react";
import DrawIcon from "@/assets/icons/draw-icon.svg?react";
import { CircularProgress } from "./CircularProgress";
import { READY_TIMEOUT } from "../consts";

export const SelfInfo = () => {
  const user = useTelegramUser();
  const { self, gameStarted, opponent, showReadyTimer, readyTimeLeft } =
    useGameStore();
  const { roomId } = useParams<{ roomId: string }>();

  // Вычисляем прогресс для круговой полоски (от 100% до 0%)
  const progress =
    showReadyTimer && readyTimeLeft !== undefined
      ? (readyTimeLeft / READY_TIMEOUT) * 100
      : 100;

  const handleReady = () => {
    if (self.isReady) return;
    socket.emit("user_ready", { roomId, userId: self.user.id });
  };

  return (
    <div
      className={clsx(
        "flex items-center mb-4",
        gameStarted && !!opponent?.user?.id ? "justify-between" : "justify-end"
      )}
    >
      {!gameStarted && !!opponent?.user?.id && (
        <button
          onClick={handleReady}
          className={clsx(
            "px-6 w-[200px] h-[46px]  text-white font-medium text-sm py-2 rounded-lg transition absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2",
            self.isReady
              ? "bg-[#1B73DD]/60"
              : "bg-[#1B73DD] hover:bg-[#1B73DD]/80"
          )}
        >
          Ready
        </button>
      )}
      {gameStarted && !!opponent?.user?.id && (
        <div className="text-white text-sm">Rounds won: {self.roundsWon}</div>
      )}
      <div className="flex items-center gap-[10px]">
        <div className="text-right whitespace-nowrap">
          <p className="text-sm font-semibold  text-white">{user?.username}</p>
          <div className="text-[10px] flex justify-end gap-1">
            <div className="flex items-center gap-1">
              <WinIcon />
              <span className="text-white">{self.user.stats.wins}</span>
            </div>
            <div className="flex items-center gap-1">
              <LossIcon />
              <span className="text-white">{self.user.stats.losses}</span>
            </div>
            <div className="flex items-center gap-1">
              <DrawIcon />
              <span className="text-white">{self.user.stats.draws}</span>
            </div>
          </div>
        </div>
        <CircularProgress
          progress={showReadyTimer && !self.isReady ? progress : 0}
          size={61}
        >
          <img
            className="min-w-13 min-h-13 max-w-13 max-h-13 rounded-full"
            src={user?.photoUrl}
            alt="self"
          />
        </CircularProgress>
      </div>
    </div>
  );
};
