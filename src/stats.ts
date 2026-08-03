import { DIFFICULTIES, type Difficulty } from "./sudoku/types";

export interface DifficultyStats {
  played: number;
  won: number;
  bestTimeSeconds: number | null;
  totalWonTimeSeconds: number;
}

export type Stats = Record<Difficulty, DifficultyStats>;

const STORAGE_KEY = "sudokupwa:stats";

function emptyStats(): Stats {
  const stats = {} as Stats;
  for (const difficulty of DIFFICULTIES) {
    stats[difficulty] = {
      played: 0,
      won: 0,
      bestTimeSeconds: null,
      totalWonTimeSeconds: 0,
    };
  }
  return stats;
}

export function loadStats(): Stats {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyStats();
  try {
    const parsed = JSON.parse(raw) as Partial<Stats>;
    const stats = emptyStats();
    for (const difficulty of DIFFICULTIES) {
      if (parsed[difficulty]) {
        stats[difficulty] = { ...stats[difficulty], ...parsed[difficulty] };
      }
    }
    return stats;
  } catch {
    return emptyStats();
  }
}

function saveStats(stats: Stats): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function recordGameStarted(difficulty: Difficulty): void {
  const stats = loadStats();
  stats[difficulty].played++;
  saveStats(stats);
}

export function recordGameWon(difficulty: Difficulty, timeSeconds: number): void {
  const stats = loadStats();
  const entry = stats[difficulty];
  entry.won++;
  entry.totalWonTimeSeconds += timeSeconds;
  if (entry.bestTimeSeconds === null || timeSeconds < entry.bestTimeSeconds) {
    entry.bestTimeSeconds = timeSeconds;
  }
  saveStats(stats);
}

export function averageWonTimeSeconds(entry: DifficultyStats): number | null {
  return entry.won > 0 ? Math.round(entry.totalWonTimeSeconds / entry.won) : null;
}

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
