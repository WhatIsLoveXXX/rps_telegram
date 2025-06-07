import { useGameStore } from "@/store/useGameStore";
import "./CardStyles.css";

export const OpponentField = () => {
  const { opponent, result } = useGameStore();

  const getCardContent = (index: number) => {
    if (result && result.opponentCard) {
      return result.opponentCard;
    }
    return "🂠";
  };

  return (
    <div className="flex justify-center gap-4 mb-8">
      {opponent?.user?.photoUrl && (
        <>
          <img
            className="w-4 h-4"
            src={opponent.user.photoUrl}
            alt="opponent"
          />
          <p className="text-red-500">
            {opponent.isReady ? "Ready" : "Not ready"}
          </p>
        </>
      )}
      {[0, 1, 2].map((i) => (
        <div key={i} className="card back">
          {getCardContent(i)}
        </div>
      ))}
    </div>
  );
};
