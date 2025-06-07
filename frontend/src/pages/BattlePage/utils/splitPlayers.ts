import { PlayerState } from "@/store/useGameStore";

export const splitPlayers = (players: PlayerState[], userId: number) => {
  const selfPlayer = players.find((p) => p.user.id === userId);
  const opponentPlayer = players.find((p) => p.user.id !== userId);
  return { selfPlayer, opponentPlayer };
};
