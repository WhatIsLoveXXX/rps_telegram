import { useGameStore } from "@/store/useGameStore";
import { OpponentInfo } from "./OpponentInfo";
import CardBack from "@/assets/cards/card-back.svg?react";
import { cardsImages } from "../consts";
import { CardType } from "../types";
import { motion } from "framer-motion";

const getCardContent = (selectedCard: CardType | undefined) => {
  if (selectedCard) {
    return cardsImages[selectedCard];
  }
  return <CardBack className="w-18 h-28  rounded-lg text-black" />;
};

export const OpponentField = () => {
  const { opponent, shouldShowOpponentCard, gameStarted } = useGameStore();
  return (
    <div>
      <OpponentInfo />
      {gameStarted && (
        <div className="flex justify-center mb-8">
          <motion.div
            initial={false}
            animate={{
              rotateY:
                shouldShowOpponentCard && opponent.selectedCard ? 180 : 0,
            }}
            transition={{ duration: 0.6 }}
            style={{ perspective: 1000 }}
          >
            <motion.div
              style={{
                backfaceVisibility: "hidden",
                transformStyle: "preserve-3d",
              }}
            >
              {getCardContent(opponent.selectedCard)}
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
