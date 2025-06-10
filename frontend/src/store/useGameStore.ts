import { create } from "zustand";
import { ROUND_TIME } from "./consts";

export type Card = "rock" | "paper" | "scissors";

interface Stats {
  wins: number;
  losses: number;
  draws: number;
}

export interface PlayerState {
  user: {
    balance: number;
    firstName: string;
    id: number;
    lastName: string;
    photoUrl: string;
    wallet: string | null;
    stats: Stats;
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
  gameOver: boolean;
  roundWinner?: number | null;
  gameWinner?: number | null;
  gameStarted: boolean;
  shouldShowOpponentCard: boolean;
  showWinnerModal?: boolean;
}

interface GameStore extends GameState {
  setGameState: (state: Partial<GameState>) => void;
  selectSelfCard: (card: Card | undefined) => void;
  resetOpponentCard: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  round: 1,
  timeLeft: ROUND_TIME,
  players: [],
  self: {
    user: {
      id: 0,
      balance: 0,
      firstName: "",
      lastName: "",
      photoUrl: "",
      wallet: null,
      stats: {
        wins: 0,
        losses: 0,
        draws: 0,
      },
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
      stats: {
        wins: 0,
        losses: 0,
        draws: 0,
      },
    },
    roundsWon: 0,
    isReady: false,
    selectedCard: undefined,
  },
  gameOver: false,
  roundWinner: undefined,
  gameStarted: false,
  shouldShowOpponentCard: false,
  showWinnerModal: false,

  setGameState: (state) => set((prev) => ({ ...prev, ...state })),
  selectSelfCard: (card) => {
    set((state) => ({
      self: { ...state.self, selectedCard: card },
    }));
  },
  resetOpponentCard: () => {
    set((state) => ({
      opponent: { ...state.opponent, selectedCard: undefined },
    }));
  },
  resetGame: () =>
    set((state) => ({
      ...state,
      round: 1,
      timeLeft: ROUND_TIME,
      gameOver: false,
      self: { ...state.self, selectedCard: undefined, roundsWon: 0 },
      opponent: {
        selectedCard: undefined,
        roundsWon: 0,
        isReady: false,
        user: {
          id: 0,
          balance: 0,
          firstName: "",
          lastName: "",
          photoUrl: "",
          wallet: null,
          stats: {
            wins: 0,
            losses: 0,
            draws: 0,
          },
        },
      },
      gameStarted: false,
    })),
}));
