import type { Grid } from "./types";

const SIZE = 9;
const BOX = 3;

export function rowOf(index: number): number {
  return Math.floor(index / SIZE);
}

export function colOf(index: number): number {
  return index % SIZE;
}

export function boxStartOf(index: number): number {
  const r = rowOf(index);
  const c = colOf(index);
  return Math.floor(r / BOX) * BOX * SIZE + Math.floor(c / BOX) * BOX;
}

export function peersOf(index: number): number[] {
  const r = rowOf(index);
  const c = colOf(index);
  const boxRow = Math.floor(r / BOX) * BOX;
  const boxCol = Math.floor(c / BOX) * BOX;
  const peers = new Set<number>();
  for (let i = 0; i < SIZE; i++) {
    peers.add(r * SIZE + i); // row
    peers.add(i * SIZE + c); // column
  }
  for (let br = 0; br < BOX; br++) {
    for (let bc = 0; bc < BOX; bc++) {
      peers.add((boxRow + br) * SIZE + (boxCol + bc));
    }
  }
  peers.delete(index);
  return [...peers];
}

export function canPlace(grid: Grid, index: number, value: number): boolean {
  return peersOf(index).every((p) => grid[p] !== value);
}

export function isValidGrid(grid: Grid): boolean {
  for (let i = 0; i < grid.length; i++) {
    const value = grid[i];
    if (value === 0) continue;
    for (const p of peersOf(i)) {
      if (p > i && grid[p] === value) return false;
    }
  }
  return true;
}

function findEmptyCell(grid: Grid): number {
  return grid.indexOf(0);
}

function shuffledDigits(): number[] {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits;
}

/** Fills an empty grid completely at random using backtracking. Mutates and returns the grid. */
export function generateSolvedGrid(): Grid {
  const grid: Grid = new Array(81).fill(0);
  fillGrid(grid);
  return grid;
}

function fillGrid(grid: Grid): boolean {
  const index = findEmptyCell(grid);
  if (index === -1) return true;
  for (const digit of shuffledDigits()) {
    if (canPlace(grid, index, digit)) {
      grid[index] = digit;
      if (fillGrid(grid)) return true;
      grid[index] = 0;
    }
  }
  return false;
}

const FULL_MASK = 0b111111111; // digits 1-9 as bits 0-8

function boxIndexOf(r: number, c: number): number {
  return Math.floor(r / BOX) * BOX + Math.floor(c / BOX);
}

function popcount(mask: number): number {
  let count = 0;
  while (mask) {
    mask &= mask - 1;
    count++;
  }
  return count;
}

interface Masks {
  row: number[];
  col: number[];
  box: number[];
}

function buildMasks(grid: Grid): Masks {
  const row = new Array(SIZE).fill(0);
  const col = new Array(SIZE).fill(0);
  const box = new Array(SIZE).fill(0);
  for (let i = 0; i < grid.length; i++) {
    const value = grid[i];
    if (value === 0) continue;
    const bit = 1 << (value - 1);
    const r = rowOf(i);
    const c = colOf(i);
    row[r] |= bit;
    col[c] |= bit;
    box[boxIndexOf(r, c)] |= bit;
  }
  return { row, col, box };
}

/** Finds the empty cell with fewest legal candidates (minimum-remaining-values heuristic).
 * This is what makes backtracking fast even on near-empty grids: cells with a single
 * candidate are filled immediately, and dead ends (zero candidates) are caught early. */
function pickBestCell(
  grid: Grid,
  masks: Masks,
): { index: number; candidates: number } | "solved" | "deadEnd" {
  let bestIndex = -1;
  let bestMask = 0;
  let bestCount = 10;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] !== 0) continue;
    const r = rowOf(i);
    const c = colOf(i);
    const used = masks.row[r] | masks.col[c] | masks.box[boxIndexOf(r, c)];
    const available = FULL_MASK & ~used;
    const count = popcount(available);
    if (count === 0) return "deadEnd";
    if (count < bestCount) {
      bestCount = count;
      bestIndex = i;
      bestMask = available;
      if (count === 1) break;
    }
  }
  if (bestIndex === -1) return "solved";
  return { index: bestIndex, candidates: bestMask };
}

/** Enumerates solutions via backtracking with the MRV heuristic. `onSolution` is called for
 * each complete solution found; return `false` from it to stop the search early. */
function search(grid: Grid, masks: Masks, onSolution: () => boolean): boolean {
  const cell = pickBestCell(grid, masks);
  if (cell === "deadEnd") return true;
  if (cell === "solved") return onSolution();

  const { index, candidates } = cell;
  const r = rowOf(index);
  const c = colOf(index);
  const b = boxIndexOf(r, c);

  for (let digit = 1; digit <= 9; digit++) {
    const bit = 1 << (digit - 1);
    if (!(candidates & bit)) continue;

    grid[index] = digit;
    masks.row[r] |= bit;
    masks.col[c] |= bit;
    masks.box[b] |= bit;

    const keepSearching = search(grid, masks, onSolution);

    grid[index] = 0;
    masks.row[r] &= ~bit;
    masks.col[c] &= ~bit;
    masks.box[b] &= ~bit;

    if (!keepSearching) return false;
  }
  return true;
}

/** Solves a puzzle. Returns a new solved grid, or null if unsolvable. */
export function solve(grid: Grid): Grid | null {
  const working = [...grid];
  const masks = buildMasks(working);
  let solution: Grid | null = null;
  search(working, masks, () => {
    solution = [...working];
    return false; // one solution is enough
  });
  return solution;
}

/** Counts solutions up to `limit` (stops early once reached) to check puzzle uniqueness efficiently. */
export function countSolutions(grid: Grid, limit = 2): number {
  const working = [...grid];
  const masks = buildMasks(working);
  let count = 0;
  search(working, masks, () => {
    count++;
    return count < limit;
  });
  return count;
}

export function hasUniqueSolution(grid: Grid): boolean {
  return countSolutions(grid, 2) === 1;
}
