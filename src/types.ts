export type Operation = "+" | "-" | "×" | "÷";
export type Difficulty = "easy" | "medium" | "hard";

export interface Equation {
  left: number;
  op: Operation;
  rightMissing: boolean;
  result: number;
  answer: number;
  difficulty: Difficulty;
}