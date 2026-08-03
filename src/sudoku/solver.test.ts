import { describe, expect, it } from "vitest";
import {
  canPlace,
  countSolutions,
  generateSolvedGrid,
  hasUniqueSolution,
  isValidGrid,
  peersOf,
  solve,
} from "./solver";
import type { Grid } from "./types";

const SOLVED_GRID: Grid = [
  5, 3, 4, 6, 7, 8, 9, 1, 2, 6, 7, 2, 1, 9, 5, 3, 4, 8, 1, 9, 8, 3, 4, 2, 5, 6, 7, 8, 5, 9, 7, 6, 1,
  4, 2, 3, 4, 2, 6, 8, 5, 3, 7, 9, 1, 7, 1, 3, 9, 2, 4, 8, 5, 6, 9, 6, 1, 5, 3, 7, 2, 8, 4, 2, 8, 7,
  4, 1, 9, 6, 3, 5, 3, 4, 5, 2, 8, 6, 1, 7, 9,
];

describe("peersOf", () => {
  it("returns 20 distinct peers covering row, column and box", () => {
    const peers = peersOf(0);
    expect(peers).toHaveLength(20);
    expect(new Set(peers).size).toBe(20);
    expect(peers).not.toContain(0);
    expect(peers).toContain(8); // same row
    expect(peers).toContain(72); // same column
    expect(peers).toContain(10); // same box
  });
});

describe("canPlace", () => {
  it("rejects a digit already used by a peer", () => {
    const grid: Grid = new Array(81).fill(0);
    grid[0] = 5;
    expect(canPlace(grid, 1, 5)).toBe(false); // same row
    expect(canPlace(grid, 9, 5)).toBe(false); // same column
    expect(canPlace(grid, 10, 5)).toBe(false); // same box
    expect(canPlace(grid, 1, 6)).toBe(true);
  });
});

describe("isValidGrid", () => {
  it("accepts a correctly solved grid", () => {
    expect(isValidGrid(SOLVED_GRID)).toBe(true);
  });

  it("rejects a grid with a duplicate in a row", () => {
    const broken = [...SOLVED_GRID];
    broken[1] = broken[0];
    expect(isValidGrid(broken)).toBe(false);
  });
});

describe("generateSolvedGrid", () => {
  it("produces a complete, valid, randomized solution", () => {
    const grid = generateSolvedGrid();
    expect(grid).toHaveLength(81);
    expect(grid.every((value) => value >= 1 && value <= 9)).toBe(true);
    expect(isValidGrid(grid)).toBe(true);
    expect(hasUniqueSolution(grid)).toBe(true);
  });

  it("does not always produce the same grid", () => {
    const a = generateSolvedGrid();
    const b = generateSolvedGrid();
    expect(a).not.toEqual(b);
  });
});

describe("solve", () => {
  it("returns the same grid when given a solved puzzle", () => {
    expect(solve(SOLVED_GRID)).toEqual(SOLVED_GRID);
  });

  it("solves a puzzle with some cells removed back to the original solution", () => {
    const puzzle = [...SOLVED_GRID];
    puzzle[0] = 0;
    puzzle[40] = 0;
    puzzle[80] = 0;
    expect(solve(puzzle)).toEqual(SOLVED_GRID);
  });

  it("returns null when a blank cell has no legal candidate left", () => {
    const broken = [...SOLVED_GRID];
    // Clear cell 0 (needs digit 5) but duplicate that same digit onto its
    // row/box peer at cell 1 (originally a 3). Every other digit is already
    // blocked for cell 0 by its peers, so with 5 now blocked too there is no
    // legal digit left for it - a genuine dead end, not just a duplicate.
    broken[0] = 0;
    broken[1] = SOLVED_GRID[0]; // = 5, duplicating cell 0's only remaining candidate
    expect(solve(broken)).toBeNull();
  });
});

describe("countSolutions / hasUniqueSolution", () => {
  it("finds exactly one solution for a fully solved grid", () => {
    expect(countSolutions(SOLVED_GRID, 2)).toBe(1);
    expect(hasUniqueSolution(SOLVED_GRID)).toBe(true);
  });

  it("finds multiple solutions for a mostly empty grid", () => {
    const empty: Grid = new Array(81).fill(0);
    expect(countSolutions(empty, 2)).toBe(2);
    expect(hasUniqueSolution(empty)).toBe(false);
  });
});
