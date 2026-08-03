import { DIFFICULTY_CLUES, type Difficulty, type Grid } from "./types";
import { countSolutions, generateSolvedGrid } from "./solver";

export interface Puzzle {
  puzzle: Grid; // 0 = empty
  solution: Grid;
  difficulty: Difficulty;
}

function shuffledIndices(): number[] {
  const indices = Array.from({ length: 81 }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

/** Removes cells from a solved grid one at a time, keeping the puzzle uniquely solvable,
 * until the clue budget for the given difficulty is reached (or no more cells can be removed). */
function digHoles(solution: Grid, targetClues: number): Grid {
  const puzzle = [...solution];
  let clues = 81;

  for (const index of shuffledIndices()) {
    if (clues <= targetClues) break;
    const backup = puzzle[index];
    puzzle[index] = 0;
    if (countSolutions(puzzle, 2) === 1) {
      clues--;
    } else {
      puzzle[index] = backup;
    }
  }

  return puzzle;
}

export function generatePuzzle(difficulty: Difficulty): Puzzle {
  const solution = generateSolvedGrid();
  const puzzle = digHoles(solution, DIFFICULTY_CLUES[difficulty]);
  return { puzzle, solution, difficulty };
}
