import React from "react";
import { Modal } from "../../../components/Modal/Modal";
import { cardsImages } from "@/pages/BattlePage/consts";
import { useGameStore } from "@/store/useGameStore";
import { motion } from "framer-motion";

interface GameWinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Вынесенный компонент для карточки с анимацией
const CardView = ({
  image,
  zIndex,
  rotate,
  translateX,
  translateY,
  scale,
  delay = 0,
}: {
  image: React.ReactNode;
  zIndex: number;
  rotate: number;
  translateX: string;
  translateY: string;
  scale: number;
  delay?: number;
}) => (
  <motion.div
    className="absolute left-1/2 top-1/2 w-[140px] h-[90px]"
    style={{
      zIndex,
    }}
    initial={{
      opacity: 0,
      x: "-50%",
      y: "-50%",
      rotate: 0,
      scale: 0.8,
    }}
    animate={{
      opacity: 1,
      x: translateX,
      y: translateY,
      rotate,
      scale,
    }}
    transition={{
      type: "spring",
      stiffness: 200,
      damping: 20,
      delay,
    }}
  >
    {image}
  </motion.div>
);

export const GameWinnerModal: React.FC<GameWinnerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { self, opponent, roundWinner, gameWinner } = useGameStore();
  const selfId = self.user?.id;
  const opponentId = opponent?.user?.id;
  const selfCard = self?.selectedCard;
  const opponentCard = opponent?.selectedCard;

  let title = "Draw in this game!";
  if (gameWinner === selfId) title = "You won this game!";
  else if (gameWinner === opponentId) title = "You lost this game!";

  let topCardProps, bottomCardProps;
  if (roundWinner === selfId) {
    topCardProps = {
      image: selfCard && cardsImages[selfCard],
      zIndex: 2,
      rotate: 90,
      translateX: "-55%",
      translateY: "-65%",
      scale: 1.08,
      delay: 0.18,
    };
    bottomCardProps = {
      image: opponentCard && cardsImages[opponentCard],
      zIndex: 1,
      rotate: 20,
      translateX: "-45%",
      translateY: "-30%",
      scale: 0.98,
      delay: 0,
    };
  } else if (roundWinner === opponentId) {
    topCardProps = {
      image: opponentCard && cardsImages[opponentCard],
      zIndex: 2,
      rotate: 90,
      translateX: "-55%",
      translateY: "-65%",
      scale: 1.08,
      boxShadow: "0 8px 24px 0 rgba(0,0,0,0.18)",
      delay: 0.18,
    };
    bottomCardProps = {
      image: selfCard && cardsImages[selfCard],
      zIndex: 1,
      rotate: 20,
      translateX: "-45%",
      translateY: "-30%",
      scale: 0.98,
      boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
      delay: 0,
    };
  } else {
    topCardProps = {
      image: opponentCard && cardsImages[opponentCard],
      zIndex: 2,
      rotate: 90,
      translateX: "-55%",
      translateY: "-65%",
      scale: 1.08,
      delay: 0.18,
    };
    bottomCardProps = {
      image: selfCard && cardsImages[selfCard],
      zIndex: 1,
      rotate: 20,
      translateX: "-45%",
      translateY: "-30%",
      scale: 0.98,
      delay: 0,
    };
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6  text-white">{title}</h2>
        <div className="relative w-[220px] h-[180px] flex items-center justify-center">
          <CardView {...bottomCardProps} />
          <CardView {...topCardProps} />
        </div>
      </div>
    </Modal>
  );
};
