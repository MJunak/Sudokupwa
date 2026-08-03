import { generatePuzzle } from "./sudoku/generator";
import { peersOf } from "./sudoku/solver";
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

export function hasConflict(state: GameState, index: number): boolean {
  const value = state.entries[index];
  if (value === 0) return false;
  return peersOf(index).some((peer) => state.entries[peer] === value);
}

/** A puzzle is solved once every cell is filled without any rule conflicts.
 * Since the generator guarantees a unique solution, that's sufficient - no need
 * to compare against the stored solution cell by cell. */
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
