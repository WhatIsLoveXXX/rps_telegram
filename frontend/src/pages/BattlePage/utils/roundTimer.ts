import { socket } from "@/utils/socket-config";
import { useGameStore } from "@/store/useGameStore";
import { cards } from "../consts";
import { CardType } from "../types";
import { ROUND_TIME } from "@/store/consts";

let currentInterval: NodeJS.Timeout | null = null;

export const startRoundTimer = (roomId: string) => {
  // Clear any existing interval before starting a new one
  if (currentInterval) {
    clearInterval(currentInterval);
  }

  let currentTime = ROUND_TIME;
  useGameStore.getState().setGameState({ timeLeft: currentTime });

  currentInterval = setInterval(() => {
    currentTime -= 1;
    useGameStore.getState().setGameState({ timeLeft: currentTime });

    if (currentTime <= 0) {
      if (currentInterval) {
        clearInterval(currentInterval);
        currentInterval = null;
      }

      // Get fresh state when timer ends
      const currentState = useGameStore.getState();
      const card = currentState.self.selectedCard ?? getRandomCard();
      console.log("EMIT MAKE_MOVEEEEE");
      socket.emit("make_move", {
        roomId: roomId,
        userId: currentState.self.user.id,
        selectedCard: card,
      });
    }
  }, 1000);
};

const getRandomCard = (): CardType => {
  const index = Math.floor(Math.random() * cards.length);
  return cards[index];
};
