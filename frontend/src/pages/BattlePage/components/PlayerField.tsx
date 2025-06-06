import { useGameStore } from "@/store/useGameStore";
import { socket } from "@/utils/socket-config";
import "./CardStyles.css"; // для стилей карт, можно кастомизировать

export const PlayerField = () => {
  const { self, round, gameOver, selectCard } = useGameStore();

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
      <img className="w-4 h-4" src={self.user.photoUrl} alt="self" />
      {cards.map((card) => (
        <button
          key={card}
          onClick={() => handleClick(card)}
          className={`card ${self.selectedCard === card ? "selected" : ""}`}
        >
          {card}
        </button>
      ))}
    </div>
  );
};
