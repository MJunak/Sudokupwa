import { generatePuzzle } from "./sudoku/generator";
import type { Difficulty, Grid } from "./sudoku/types";

export interface GameState {
  difficulty: Difficulty;
  puzzle: Grid; // 0 = empty cell the player must fill in
  solution: Grid;
  entries: Grid; // current board contents (givens + player input)
  elapsedSeconds: number;
  finished: boolean;
}

export function createGame(difficulty: Difficulty): GameState {
  const { puzzle, solution } = generatePuzzle(difficulty);
  return {
    difficulty,
    puzzle,
    solution,
    entries: [...puzzle],
    elapsedSeconds: 0,
    finished: false,
  };
}

export function isGiven(state: GameState, index: number): boolean {
  return state.puzzle[index] !== 0;
}

/** Flags any player-filled cell that doesn't match the puzzle's unique solution.
 * A plain "does this clash with a peer" check would miss digits that are locally
 * valid at the moment they're entered but still wrong - those silently paint the
 * board into an unsolvable corner later instead of being caught immediately. */
export function hasConflict(state: GameState, index: number): boolean {
  if (isGiven(state, index)) return false;
  const value = state.entries[index];
  if (value === 0) return false;
  return value !== state.solution[index];
}

export function isSolved(state: GameState): boolean {
  return state.entries.every((value, index) => value !== 0 && !hasConflict(state, index));
}

/** Reveals the correct digit for a cell: the selected one if it's empty/wrong,
 * otherwise the first empty or incorrect cell on the board. Returns the revealed
 * index, or -1 if the board has nothing left to reveal. */
export function applyHint(state: GameState, selectedIndex: number | null): number {
  const needsHint = (index: number) =>
    !isGiven(state, index) && state.entries[index] !== state.solution[index];

  let target = selectedIndex !== null && needsHint(selectedIndex) ? selectedIndex : -1;
  if (target === -1) {
    target = state.entries.findIndex((_, index) => needsHint(index));
  }
  if (target === -1) return -1;

  state.entries[target] = state.solution[target];
  return target;
}
