import { OpponentField } from "./OpponentField";
import { PlayerField } from "./PlayerField";
import { useGameStore } from "@/store/useGameStore";

export const GameField = () => {
  const { round, self, opponent, timeLeft, result } = useGameStore();

  return (
    <div className="flex flex-col justify-between h-full p-4">
      <div className="text-center text-lg font-semibold">
        Раунд {round} из 5
      </div>
      <OpponentField />
      <div className="text-center text-sm">
        Время до конца хода: {timeLeft} секунд
      </div>
      <PlayerField />
    </div>
  );
};
