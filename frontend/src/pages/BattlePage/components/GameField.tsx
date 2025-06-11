import { OpponentField } from "./OpponentField";
import { PlayerField } from "./PlayerField";
import { useGameStore } from "@/store/useGameStore";
import gameBackground from "@/assets/game-background.svg";
import clsx from "clsx";

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
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw_+_100px] h-screen"
      />
      {gameStarted && (
        <div className="text-sm font-semibold mb-4">Round {round} of 5</div>
      )}
      {!!opponent?.user?.id && <OpponentField />}
      {gameStarted && (
        <div className="text-center text-md font-semibold">{timeLeft}</div>
      )}
      <PlayerField />
    </div>
  );
};
