import Rock from "@/assets/cards/rock.svg?react";
import Paper from "@/assets/cards/paper.svg?react";
import Scissors from "@/assets/cards/scissors.svg?react";
import { CardType } from "./types";

export const cards: CardType[] = ["rock", "paper", "scissors"];

export const cardsImages: Record<CardType, React.ReactNode> = {
  rock: <Rock />,
  paper: <Paper />,
  scissors: <Scissors />,
};
