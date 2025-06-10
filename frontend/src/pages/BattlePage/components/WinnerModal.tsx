import React from "react";
import { Modal } from "../../../components/Modal/Modal";
import { cardsImages } from "@/pages/BattlePage/consts";
import { useGameStore } from "@/store/useGameStore";

interface WinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { self, opponent, roundWinner } = useGameStore();
  const selfId = self.user.id;
  const opponentId = opponent?.user.id;
  const selfCard = self.selectedCard;
  const opponentCard = opponent?.selectedCard;

  let title = "Draw!";
  if (roundWinner === selfId) title = "You win!";
  else if (roundWinner === opponentId) title = "You lose!";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="relative w-[220px] h-[180px] flex items-center justify-center">
          {/* Opponent card (верхняя) */}
          <div
            className="absolute left-1/2 top-1/2 w-[140px] h-[90px]"
            style={{
              transform: "translate(-50%, -60%) rotate(-15deg) scale(1.05)",
              zIndex: 2,
              boxShadow: "0 4px 16px 0 rgba(0,0,0,0.15)",
            }}
          >
            {opponentCard && cardsImages[opponentCard]}
          </div>
          {/* Self card (нижняя) */}
          <div
            className="absolute left-1/2 top-1/2 w-[140px] h-[90px]"
            style={{
              transform: "translate(-50%, -40%) rotate(15deg) scale(1.05)",
              zIndex: 1,
              boxShadow: "0 4px 16px 0 rgba(0,0,0,0.10)",
            }}
          >
            {selfCard && cardsImages[selfCard]}
          </div>
        </div>
      </div>
    </Modal>
  );
};
