import { create } from "zustand";
import { ROUND_TIME } from "./consts";

/**
 * Represents the possible card choices in the game
 */
export type Card = "rock" | "paper" | "scissors";

/**
 * Player statistics interface
 */
export interface Stats {
  wins: number;
  losses: number;
  draws: number;
}

/**
 * User information interface
 */
export interface UserInfo {
  balance: number;
  firstName: string;
  id: number;
  lastName: string;
  photoUrl: string;
  wallet: string | null;
  stats: Stats;
  username: string;
}

/**
 * Represents the state of a player in the game
 */
export interface PlayerState {
  user: UserInfo;
  selectedCard?: Card;
  roundsWon: number;
  isReady: boolean;
}

/**
 * Represents the complete game state
 */
export interface GameState {
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
  showRoundWinnerModal?: boolean;
  showGameWinnerModal?: boolean;
  readyTimeLeft?: number;
  showReadyTimer?: boolean;
}

/**
 * Initial player state with default values
 */
const initialPlayerState: PlayerState = {
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
    username: "",
  },
  roundsWon: 0,
  isReady: false,
  selectedCard: undefined,
};

/**
 * Game store interface with actions
 */
interface GameStore extends GameState {
  setGameState: (state: Partial<GameState>) => void;
  selectSelfCard: (card: Card | undefined) => void;
  resetOpponentCard: () => void;
  resetGame: () => void;
  resetGameWithoutUsers: () => void;
}

/**
 * Creates and manages the game store using Zustand
 */
export const useGameStore = create<GameStore>((set) => ({
  round: 1,
  timeLeft: ROUND_TIME,
  players: [],
  self: { ...initialPlayerState },
  opponent: { ...initialPlayerState },
  gameOver: false,
  roundWinner: undefined,
  gameStarted: false,
  shouldShowOpponentCard: false,
  showRoundWinnerModal: false,
  showGameWinnerModal: false,
  readyTimeLeft: undefined,
  showReadyTimer: false,

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
      opponent: { ...initialPlayerState },
      gameStarted: false,
      showRoundWinnerModal: false,
      showGameWinnerModal: false,
      readyTimeLeft: undefined,
      showReadyTimer: false,
    })),

  resetGameWithoutUsers: () =>
    set((state) => ({
      ...state,
      round: 1,
      timeLeft: ROUND_TIME,
      gameOver: false,
      self: {
        ...state.self,
        isReady: false,
        selectedCard: undefined,
        roundsWon: 0,
      },
      opponent: {
        ...state.opponent,
        isReady: false,
        selectedCard: undefined,
        roundsWon: 0,
      },
      gameStarted: false,
      showRoundWinnerModal: false,
      showGameWinnerModal: false,
      readyTimeLeft: undefined,
      showReadyTimer: false,
    })),
}));
