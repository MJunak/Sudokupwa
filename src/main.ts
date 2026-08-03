import "./style.css";
import { applyHint, createGame, hasConflict, isGiven, isSolved, type GameState } from "./game";
import { loadGame, saveGame } from "./persistence";
import {
  averageWonTimeSeconds,
  formatTime,
  loadStats,
  recordGameStarted,
  recordGameWon,
} from "./stats";
import { boxStartOf, colOf, rowOf } from "./sudoku/solver";
import { DIFFICULTIES, DIFFICULTY_LABELS, type Difficulty } from "./sudoku/types";

const DEFAULT_DIFFICULTY: Difficulty = "medium";
const SIZE = 9;

const board = document.querySelector<HTMLDivElement>("#board")!;
const numpad = document.querySelector<HTMLDivElement>("#numpad")!;
const difficultySelect = document.querySelector<HTMLSelectElement>("#difficulty-select")!;
const newGameBtn = document.querySelector<HTMLButtonElement>("#new-game-btn")!;
const hintBtn = document.querySelector<HTMLButtonElement>("#hint-btn")!;
const timerEl = document.querySelector<HTMLSpanElement>("#timer")!;
const statsBtn = document.querySelector<HTMLButtonElement>("#stats-btn")!;
const statsOverlay = document.querySelector<HTMLDivElement>("#stats-overlay")!;
const statsContent = document.querySelector<HTMLDivElement>("#stats-content")!;
const closeStatsBtn = document.querySelector<HTMLButtonElement>("#close-stats-btn")!;
const winOverlay = document.querySelector<HTMLDivElement>("#win-overlay")!;
const winTimeEl = document.querySelector<HTMLParagraphElement>("#win-time")!;
const winNewGameBtn = document.querySelector<HTMLButtonElement>("#win-new-game-btn")!;

const loadedGame = loadGame();
let state: GameState =
  loadedGame && !loadedGame.finished ? loadedGame : startNewGame(loadedGame?.difficulty ?? DEFAULT_DIFFICULTY);
let selectedIndex: number | null = null;
let timerHandle: number | undefined;

function startNewGame(difficulty: Difficulty, persist = true): GameState {
  const game = createGame(difficulty);
  recordGameStarted(difficulty);
  if (persist) saveGame(game);
  return game;
}

function setupDifficultySelect(): void {
  for (const difficulty of DIFFICULTIES) {
    const option = document.createElement("option");
    option.value = difficulty;
    option.textContent = DIFFICULTY_LABELS[difficulty];
    difficultySelect.appendChild(option);
  }
  difficultySelect.value = state.difficulty;
}

function setupNumpad(): void {
  numpad.innerHTML = "";
  for (let digit = 1; digit <= 9; digit++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "num-btn";
    btn.textContent = String(digit);
    btn.addEventListener("click", () => enterDigit(digit));
    numpad.appendChild(btn);
  }
  const eraseBtn = document.createElement("button");
  eraseBtn.type = "button";
  eraseBtn.className = "num-btn erase-btn";
  eraseBtn.textContent = "Löschen";
  eraseBtn.addEventListener("click", () => enterDigit(0));
  numpad.appendChild(eraseBtn);
}

function enterDigit(digit: number): void {
  if (selectedIndex === null || state.finished) return;
  if (isGiven(state, selectedIndex)) return;
  state.entries[selectedIndex] = digit;
  saveGame(state);
  renderBoard();
  checkWin();
}

function selectCell(index: number): void {
  selectedIndex = index;
  renderBoard();
}

function renderBoard(): void {
  board.innerHTML = "";
  const selectedValue = selectedIndex !== null ? state.entries[selectedIndex] : 0;

  for (let index = 0; index < 81; index++) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    cell.setAttribute("role", "gridcell");

    const value = state.entries[index];
    const given = isGiven(state, index);
    const r = rowOf(index);
    const c = colOf(index);

    if (value !== 0) cell.textContent = String(value);
    if (given) cell.classList.add("given");
    if (hasConflict(state, index)) cell.classList.add("conflict");
    if (index === selectedIndex) cell.classList.add("selected");
    else if (
      selectedIndex !== null &&
      (r === rowOf(selectedIndex) ||
        c === colOf(selectedIndex) ||
        boxStartOf(index) === boxStartOf(selectedIndex))
    ) {
      cell.classList.add("peer");
    }
    if (selectedValue !== 0 && value === selectedValue && index !== selectedIndex) {
      cell.classList.add("same-value");
    }

    if (c % 3 === 0) cell.classList.add("border-left");
    if (c === 8) cell.classList.add("border-right");
    if (r % 3 === 0) cell.classList.add("border-top");
    if (r === 8) cell.classList.add("border-bottom");

    cell.addEventListener("click", () => selectCell(index));
    board.appendChild(cell);
  }
}

function updateTimerDisplay(): void {
  timerEl.textContent = formatTime(state.elapsedSeconds);
}

function stopTimer(): void {
  if (timerHandle !== undefined) {
    clearInterval(timerHandle);
    timerHandle = undefined;
  }
}

function startTimer(): void {
  stopTimer();
  if (state.finished) return;
  timerHandle = window.setInterval(() => {
    state.elapsedSeconds++;
    updateTimerDisplay();
    saveGame(state);
  }, 1000);
}

function checkWin(): void {
  if (state.finished) return;
  if (!isSolved(state)) return;
  state.finished = true;
  stopTimer();
  recordGameWon(state.difficulty, state.elapsedSeconds);
  saveGame(state);
  winTimeEl.textContent = `Deine Zeit: ${formatTime(state.elapsedSeconds)}`;
  winOverlay.classList.remove("hidden");
}

function loadNewGame(difficulty: Difficulty): void {
  selectedIndex = null;
  state = startNewGame(difficulty);
  updateTimerDisplay();
  renderBoard();
  startTimer();
}

function renderStats(): void {
  const stats = loadStats();
  statsContent.innerHTML = "";
  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr><th>Level</th><th>Gespielt</th><th>Gewonnen</th><th>Beste Zeit</th><th>Ø Zeit</th></tr>
    </thead>
  `;
  const tbody = document.createElement("tbody");
  for (const difficulty of DIFFICULTIES) {
    const entry = stats[difficulty];
    const avg = averageWonTimeSeconds(entry);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${DIFFICULTY_LABELS[difficulty]}</td>
      <td>${entry.played}</td>
      <td>${entry.won}</td>
      <td>${entry.bestTimeSeconds !== null ? formatTime(entry.bestTimeSeconds) : "-"}</td>
      <td>${avg !== null ? formatTime(avg) : "-"}</td>
    `;
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  statsContent.appendChild(table);
}

function setupEvents(): void {
  newGameBtn.addEventListener("click", () => loadNewGame(difficultySelect.value as Difficulty));

  difficultySelect.addEventListener("change", () => {
    loadNewGame(difficultySelect.value as Difficulty);
  });

  hintBtn.addEventListener("click", () => {
    if (state.finished) return;
    const revealed = applyHint(state, selectedIndex);
    if (revealed === -1) return;
    selectedIndex = revealed;
    saveGame(state);
    renderBoard();
    checkWin();
  });

  statsBtn.addEventListener("click", () => {
    renderStats();
    statsOverlay.classList.remove("hidden");
  });
  closeStatsBtn.addEventListener("click", () => statsOverlay.classList.add("hidden"));

  winNewGameBtn.addEventListener("click", () => {
    winOverlay.classList.add("hidden");
    loadNewGame(difficultySelect.value as Difficulty);
  });

  window.addEventListener("keydown", (event) => {
    if (selectedIndex === null) return;
    if (event.key >= "1" && event.key <= "9") {
      enterDigit(Number(event.key));
    } else if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
      enterDigit(0);
    } else if (event.key.startsWith("Arrow")) {
      event.preventDefault();
      const r = rowOf(selectedIndex);
      const c = colOf(selectedIndex);
      let next = selectedIndex;
      if (event.key === "ArrowUp") next = ((r + 8) % 9) * SIZE + c;
      if (event.key === "ArrowDown") next = ((r + 1) % 9) * SIZE + c;
      if (event.key === "ArrowLeft") next = r * SIZE + ((c + 8) % 9);
      if (event.key === "ArrowRight") next = r * SIZE + ((c + 1) % 9);
      selectCell(next);
    }
  });
}

setupDifficultySelect();
setupNumpad();
setupEvents();
renderBoard();
updateTimerDisplay();
startTimer();
