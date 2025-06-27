import { OpponentField } from "./OpponentField";
import { PlayerField } from "./PlayerField";
import { useGameStore } from "@/store/useGameStore";
import gameBackground from "@/assets/game-background.svg";
import clsx from "clsx";
import TimeLeftLoader from "@/assets/time-left-loader.svg?react";

export const GameField = () => {
  const { round, opponent, timeLeft, gameStarted } = useGameStore();

  return (
    <div
      className={clsx(
        "flex flex-col h-[calc(100vh-124px)]",
        gameStarted
          ? "justify-between"
          : !!opponent?.user?.id
          ? "justify-between"
          : "justify-end"
      )}
    >
      <img
        src={gameBackground}
        alt="bg"
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
      />
      {!!opponent?.user?.id && <OpponentField />}
      {gameStarted && (
        <div className="flex flex-col items-center justify-center">
          <div className="text-sm font-semibold mb-4  text-white">
            Round {round} of 5
          </div>
          <div className="relative">
            <div className="text-center text-md font-semibold">{timeLeft}</div>
            <TimeLeftLoader
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 animate-spin"
              style={{ animationDuration: "1.5s" }}
            />
          </div>
        </div>
      )}
      <PlayerField />
    </div>
  );
};
