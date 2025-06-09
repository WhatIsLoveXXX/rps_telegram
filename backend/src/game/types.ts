import { User } from '../user/model/user';

export type Card = 'rock' | 'paper' | 'scissors';

export interface PlayerState {
    user: User;
    roundsWon: number;
    selectedCard?: Card;
    isReady: boolean;
}

export interface GameState {
    players: Map<string, PlayerState>; // userId -> state
    round: number;
    maxRounds: number;
    moveTimeout?: NodeJS.Timeout;
}
