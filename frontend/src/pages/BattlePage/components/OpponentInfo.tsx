import { useGameStore } from "@/store/useGameStore";
import clsx from "clsx";

export const OpponentInfo = () => {
  const { opponent } = useGameStore();

  if (!opponent) return null;

  return (
    <div className="flex justify-between mb-5">
      <div className="flex items-center gap-2">
        <img
          className="min-w-13 min-h-13 max-w-12 max-h-12 rounded-full"
          src={opponent.user.photoUrl}
          alt="opponent"
        />
        <div>
          <p>{opponent.user.firstName}</p>
          <p>Mock score</p>
        </div>
      </div>
      <p
        className={clsx(
          "font-medium text-sm",
          opponent.isReady ? "text-green-500" : "text-red-500"
        )}
      >
        {opponent.isReady ? "Ready" : "Not ready"}
      </p>
    </div>
  );
};
