import { describe, expect, it } from "vitest";
import { applyHint, hasConflict, isGiven, isSolved, type GameState } from "./game";
import type { Grid } from "./sudoku/types";

const SOLUTION: Grid = [
  5, 3, 4, 6, 7, 8, 9, 1, 2, 6, 7, 2, 1, 9, 5, 3, 4, 8, 1, 9, 8, 3, 4, 2, 5, 6, 7, 8, 5, 9, 7, 6, 1,
  4, 2, 3, 4, 2, 6, 8, 5, 3, 7, 9, 1, 7, 1, 3, 9, 2, 4, 8, 5, 6, 9, 6, 1, 5, 3, 7, 2, 8, 4, 2, 8, 7,
  4, 1, 9, 6, 3, 5, 3, 4, 5, 2, 8, 6, 1, 7, 9,
];

function makeState(puzzle: Grid, entries: Grid = [...puzzle]): GameState {
  return {
    difficulty: "medium",
    puzzle,
    solution: SOLUTION,
    entries,
    elapsedSeconds: 0,
    finished: false,
  };
}

describe("hasConflict", () => {
  it("never flags a given clue", () => {
    const puzzle = [...SOLUTION];
    const state = makeState(puzzle);
    expect(hasConflict(state, 0)).toBe(false);
  });

  it("never flags an empty cell", () => {
    const puzzle = new Array(81).fill(0) as Grid;
    const state = makeState(puzzle);
    expect(hasConflict(state, 5)).toBe(false);
  });

  it("flags a wrong entry immediately, even when it does not clash with any filled peer", () => {
    // Regression test: a digit that is still locally consistent with every
    // currently-filled row/col/box peer (because most of the board is still
    // empty) but disagrees with the puzzle's unique solution must be caught
    // right away. Otherwise the player can fill in a "locally valid" wrong
    // digit and only discover the mistake much later, when the board has
    // been painted into an unsolvable corner (two cells whose row and
    // column requirements contradict each other) with no clear culprit.
    const puzzle = new Array(81).fill(0) as Grid;
    const entries = [...puzzle];
    entries[0] = SOLUTION[0] === 5 ? 3 : 5; // definitely wrong, no peers filled at all
    const state = makeState(puzzle, entries);

    expect(hasConflict(state, 0)).toBe(true);
  });

  it("does not flag a correct entry", () => {
    const puzzle = new Array(81).fill(0) as Grid;
    const entries = [...puzzle];
    entries[0] = SOLUTION[0];
    const state = makeState(puzzle, entries);

    expect(hasConflict(state, 0)).toBe(false);
  });
});

describe("isSolved", () => {
  it("is true once every cell matches the solution", () => {
    const state = makeState(new Array(81).fill(0) as Grid, [...SOLUTION]);
    expect(isSolved(state)).toBe(true);
  });

  it("is false while any cell is empty or wrong", () => {
    const entries = [...SOLUTION];
    entries[0] = 0;
    expect(isSolved(makeState(new Array(81).fill(0) as Grid, entries))).toBe(false);

    const wrongEntries = [...SOLUTION];
    wrongEntries[0] = wrongEntries[0] === 9 ? 8 : 9;
    expect(isSolved(makeState(new Array(81).fill(0) as Grid, wrongEntries))).toBe(false);
  });
});

describe("applyHint", () => {
  it("reveals the correct value for the selected empty cell", () => {
    const puzzle = new Array(81).fill(0) as Grid;
    const state = makeState(puzzle);

    const revealed = applyHint(state, 3);

    expect(revealed).toBe(3);
    expect(state.entries[3]).toBe(SOLUTION[3]);
  });

  it("corrects the selected cell if it currently holds a wrong value", () => {
    const puzzle = new Array(81).fill(0) as Grid;
    const entries = [...puzzle];
    entries[3] = SOLUTION[3] === 1 ? 2 : 1;
    const state = makeState(puzzle, entries);

    const revealed = applyHint(state, 3);

    expect(revealed).toBe(3);
    expect(state.entries[3]).toBe(SOLUTION[3]);
  });

  it("falls back to the first empty or wrong cell when nothing useful is selected", () => {
    const puzzle = new Array(81).fill(0) as Grid;
    const entries = [...SOLUTION];
    entries[10] = 0;
    const state = makeState(puzzle, entries);

    const revealed = applyHint(state, 0); // cell 0 is already correct

    expect(revealed).toBe(10);
    expect(state.entries[10]).toBe(SOLUTION[10]);
  });

  it("returns -1 when the board is already fully solved", () => {
    const puzzle = new Array(81).fill(0) as Grid;
    const state = makeState(puzzle, [...SOLUTION]);

    expect(applyHint(state, null)).toBe(-1);
  });

  it("never touches a given clue", () => {
    const puzzle = [...SOLUTION];
    const state = makeState(puzzle);

    expect(applyHint(state, 0)).toBe(-1);
  });
});

describe("isGiven", () => {
  it("is true only for non-zero puzzle cells", () => {
    const puzzle = new Array(81).fill(0) as Grid;
    puzzle[0] = 5;
    const state = makeState(puzzle);

    expect(isGiven(state, 0)).toBe(true);
    expect(isGiven(state, 1)).toBe(false);
  });
});
