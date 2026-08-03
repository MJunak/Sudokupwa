export type Cell = number; // 0 = empty, 1-9 = filled
export type Grid = Cell[]; // length 81, row-major

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Leicht",
  medium: "Mittel",
  hard: "Schwer",
  expert: "Experte",
};

// Number of clues (pre-filled cells) left in the puzzle per difficulty.
export const DIFFICULTY_CLUES: Record<Difficulty, number> = {
  easy: 40,
  medium: 32,
  hard: 27,
  expert: 22,
};
