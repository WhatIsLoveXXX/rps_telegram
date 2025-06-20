import { useGameStore } from "@/store/useGameStore";
import clsx from "clsx";
import WinIcon from "@/assets/icons/win-icon.svg?react";
import LossIcon from "@/assets/icons/lose-icon.svg?react";
import DrawIcon from "@/assets/icons/draw-icon.svg?react";
import { CircularProgress } from "./CircularProgress";
import { READY_TIMEOUT } from "../consts";

export const OpponentInfo = () => {
  const { opponent, gameStarted, showReadyTimer, readyTimeLeft } =
    useGameStore();

  if (!opponent) return null;

  // Вычисляем прогресс для круговой полоски (от 100% до 0%)
  const progress =
    showReadyTimer && readyTimeLeft !== undefined
      ? (readyTimeLeft / READY_TIMEOUT) * 100
      : 100;

  return (
    <div className="flex justify-between mb-5 items-center">
      <div className="flex items-center gap-2">
        <CircularProgress
          progress={showReadyTimer && !opponent.isReady ? progress : 0}
          size={61}
        >
          <img
            className="min-w-13 min-h-13 max-w-13 max-h-13 rounded-full"
            src={opponent.user.photoUrl}
            alt="opponent"
          />
        </CircularProgress>

        <div className="whitespace-nowrap">
          <p className="text-sm font-semibold  text-white">
            {opponent.user.username}
          </p>
          <div className="text-[10px] flex  gap-1">
            <div className="flex items-center gap-1">
              <WinIcon />
              <span className="text-white">{opponent.user.stats.wins}</span>
            </div>
            <div className="flex items-center gap-1">
              <LossIcon />
              <span className="text-white">{opponent.user.stats.losses}</span>
            </div>
            <div className="flex items-center gap-1">
              <DrawIcon />
              <span className="text-white">{opponent.user.stats.draws}</span>
            </div>
          </div>
        </div>
      </div>
      {!gameStarted ? (
        <p
          className={clsx(
            "font-medium text-sm",
            opponent.isReady ? "text-green-500" : "text-red-500"
          )}
        >
          {opponent.isReady ? "Ready" : "Not ready"}
        </p>
      ) : (
        <div className="text-white text-sm">
          Rounds won: {opponent.roundsWon}
        </div>
      )}
    </div>
  );
};
