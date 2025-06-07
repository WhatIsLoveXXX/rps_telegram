import { create } from "zustand";

export type Card = "rock" | "paper" | "scissors";

export type RoundResult = {
  selfCard: Card;
  opponentCard: Card;
  winner: "self" | "opponent" | "draw";
};

export interface PlayerState {
  user: {
    balance: number;
    firstName: string;
    id: number;
    lastName: string;
    photoUrl: string;
    wallet: string | null;
  };
  selectedCard?: Card;
  roundsWon: number;
  isReady: boolean;
}

interface GameState {
  players: PlayerState[];
  round: number;
  timeLeft: number;
  self: PlayerState;
  opponent: PlayerState;
  result?: RoundResult;
  gameOver: boolean;
}

interface GameStore extends GameState {
  setGameState: (state: Partial<GameState>) => void;
  selectCard: (card: Card) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  round: 1,
  timeLeft: 20,
  players: [],
  self: {
    user: {
      id: 0,
      balance: 0,
      firstName: "",
      lastName: "",
      photoUrl: "",
      wallet: null,
    },
    roundsWon: 0,
    isReady: false,
    selectedCard: undefined,
  },
  opponent: {
    user: {
      id: 0,
      balance: 0,
      firstName: "",
      lastName: "",
      photoUrl: "",
      wallet: null,
    },
    roundsWon: 0,
    isReady: false,
    selectedCard: undefined,
  },
  result: undefined,
  gameOver: false,

  setGameState: (state) => set((prev) => ({ ...prev, ...state })),
  selectCard: (card) => {
    set((state) => ({
      self: { ...state.self, selectedCard: card },
    }));
  },
  resetGame: () =>
    set((state) => ({
      ...state,
      round: 1,
      timeLeft: 20,
      result: undefined,
      gameOver: false,
      self: { ...state.self, selectedCard: undefined, roundsWon: 0 },
      opponent: { ...state.opponent, selectedCard: undefined, roundsWon: 0 },
    })),
}));
