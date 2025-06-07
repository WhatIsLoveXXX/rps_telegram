import { useGameStore } from "@/store/useGameStore";
import { socket } from "@/utils/socket-config";
import "./CardStyles.css"; // для стилей карт, можно кастомизировать
import { useParams } from "react-router-dom";
import clsx from "clsx";

export const PlayerField = () => {
  const { self, round, gameOver, selectCard, setGameState } = useGameStore();
  const { roomId } = useParams<{ roomId: string }>();

  const handleClick = (card: "rock" | "paper" | "scissors") => {
    if (self.selectedCard || gameOver) return;

    selectCard(card);
    socket.emit("select_card", { card });
  };

  const cards: ("rock" | "paper" | "scissors")[] = [
    "rock",
    "paper",
    "scissors",
  ];

  return (
    <div className="flex justify-center gap-4 mt-8">
      <img className="w-6 h-6" src={self.user.photoUrl} alt="self" />

      {cards.map((card) => (
        <button
          key={card}
          onClick={() => handleClick(card)}
          className={`card ${self.selectedCard === card ? "selected" : ""}`}
        >
          {card}
        </button>
      ))}
      <button
        onClick={() => {
          socket.emit("user_ready", { roomId, userId: self.user.id });
          setGameState({ self: { ...self, isReady: true } });
        }}
        className={clsx(
          "bg-[#1B73DD] px-3 hover:bg-[#1B73DD]/80 text-white font-medium py-2 rounded-lg transition",
          self.isReady ? "bg-green-500" : "bg-red-500"
        )}
      >
        Ready
      </button>
    </div>
  );
};
