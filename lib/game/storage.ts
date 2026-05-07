import { GameState } from './types';
import { normalizeGameState } from './state';

const STORAGE_KEY = 'dyl_game_state';

export function saveGameState(state: GameState): void {
  try {
    const serialized = JSON.stringify(normalizeGameState(state));
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    console.error('Failed to save game state');
  }
}

export function loadGameState(): GameState | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    return normalizeGameState(JSON.parse(serialized) as GameState);
  } catch {
    return null;
  }
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function hasSavedGame(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
