import { useGameStore } from "@/store/useGameStore";
import clsx from "clsx";
import { SelfInfo } from "./SelfInfo";
import { motion } from "framer-motion";
import { cards, cardsImages } from "../consts";
import { CardType } from "../types";

export const PlayerField = () => {
  const { self, gameOver, selectSelfCard, gameStarted } = useGameStore();

  const handleClick = (card: CardType) => {
    if (gameOver) return;
    selectSelfCard(card);
  };

  return (
    <div>
      {gameStarted && (
        <div className="flex justify-center gap-4 mt-8">
          {cards.map((card) => (
            <motion.button
              key={card}
              onClick={() => handleClick(card)}
              initial={false}
              animate={{
                y: self.selectedCard === card ? -20 : 0,
                scale: self.selectedCard === card ? 1.05 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={clsx(
                "w-18 h-28 bg-white rounded-lg text-black shadow-md transition-colors duration-200"
              )}
            >
              {cardsImages[card]}
            </motion.button>
          ))}
        </div>
      )}
      <SelfInfo />
    </div>
  );
};
