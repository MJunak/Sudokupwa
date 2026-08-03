import { describe, expect, it } from "vitest";
import { generatePuzzle } from "./generator";
import { hasUniqueSolution, isValidGrid } from "./solver";
import { DIFFICULTIES, DIFFICULTY_CLUES } from "./types";

describe("generatePuzzle", () => {
  for (const difficulty of DIFFICULTIES) {
    it(`produces a valid, uniquely solvable puzzle for "${difficulty}"`, () => {
      const { puzzle, solution } = generatePuzzle(difficulty);

      expect(solution).toHaveLength(81);
      expect(solution.every((value) => value >= 1 && value <= 9)).toBe(true);
      expect(isValidGrid(solution)).toBe(true);

      // Every given clue must match the solution exactly.
      puzzle.forEach((value, index) => {
        if (value !== 0) expect(value).toBe(solution[index]);
      });

      // The puzzle must have exactly one solution - otherwise a player could
      // fill it in consistently with local rules and still not match the
      // stored solution, which is exactly the silent-dead-end bug this
      // generator must never produce.
      expect(hasUniqueSolution(puzzle)).toBe(true);

      const clueCount = puzzle.filter((value) => value !== 0).length;
      const target = DIFFICULTY_CLUES[difficulty];
      expect(clueCount).toBeGreaterThanOrEqual(target);
      expect(clueCount).toBeLessThanOrEqual(target + 15);
    });
  }
});
