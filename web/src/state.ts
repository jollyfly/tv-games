import { firstIncompleteLevel, levels } from './content';
import type { SaveState, Settings } from './types';

const STORAGE_KEY = 'number-island-save-v1';

export const defaultSettings: Settings = {
  voiceVolume: 0.9,
  sfxVolume: 0.7,
  musicEnabled: true,
  breakMinutes: 15,
  reduceMotion: false,
  captions: false,
  unlockAll: false,
};

export function freshState(): SaveState {
  return {
    version: 1,
    progress: {
      completed: [],
      stars: {},
      attempts: {},
      hints: {},
      tutorialDone: false,
      currentLevelId: levels[0].id,
    },
    settings: { ...defaultSettings },
    resume: null,
  };
}

type NativeBridge = {
  loadState?: () => string;
  saveState?: (json: string) => void;
  exitApp?: () => void;
  ready?: () => void;
  setAudioFocus?: (active: boolean) => void;
};

function bridge(): NativeBridge | null {
  const candidate = (window as unknown as { NumberIslandNative?: NativeBridge }).NumberIslandNative;
  return candidate ?? null;
}

function normalise(raw: unknown): SaveState {
  const base = freshState();
  if (!raw || typeof raw !== 'object') return base;
  const input = raw as Partial<SaveState>;
  const progress = (input.progress ?? {}) as Partial<SaveState['progress']>;
  const settings = (input.settings ?? {}) as Partial<Settings>;
  const validIds = new Set(levels.map((level) => level.id));
  const completed = Array.isArray(progress.completed)
    ? progress.completed.filter((id): id is string => typeof id === 'string' && validIds.has(id))
    : [];
  const stars: Record<string, number> = {};
  for (const id of completed) stars[id] = 1;
  const currentLevelId = typeof progress.currentLevelId === 'string' && validIds.has(progress.currentLevelId)
    ? progress.currentLevelId
    : base.progress.currentLevelId;

  return {
    version: 1,
    progress: {
      completed,
      stars,
      attempts: typeof progress.attempts === 'object' && progress.attempts ? progress.attempts : {},
      hints: typeof progress.hints === 'object' && progress.hints ? progress.hints : {},
      tutorialDone: Boolean(progress.tutorialDone),
      currentLevelId,
    },
    settings: {
      voiceVolume: clamp(Number(settings.voiceVolume), 0, 1, base.settings.voiceVolume),
      sfxVolume: clamp(Number(settings.sfxVolume), 0, 1, base.settings.sfxVolume),
      musicEnabled: settings.musicEnabled !== false,
      breakMinutes: [0, 10, 15, 20].includes(Number(settings.breakMinutes)) ? Number(settings.breakMinutes) : 15,
      reduceMotion: Boolean(settings.reduceMotion),
      captions: Boolean(settings.captions),
      unlockAll: Boolean(settings.unlockAll),
    },
    resume: isResume(input.resume ?? null, validIds) ? input.resume ?? null : null,
  };
}

function isResume(value: SaveState['resume'], validIds: Set<string>): value is NonNullable<SaveState['resume']> {
  if (!value || typeof value !== 'object') return false;
  return validIds.has(value.levelId) && Number.isInteger(value.roundIndex) && value.roundIndex >= 0 && value.roundIndex < 3;
}

function clamp(value: number, min: number, max: number, fallback: number): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

export function loadState(): SaveState {
  const native = bridge();
  try {
    if (native?.loadState) {
      const json = native.loadState();
      if (json) return normalise(JSON.parse(json));
    }
  } catch (error) {
    console.warn('native state load failed', error);
  }
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (json) return normalise(JSON.parse(json));
  } catch (error) {
    console.warn('local state load failed', error);
  }
  return freshState();
}

export function saveState(state: SaveState): void {
  const stars: Record<string, number> = {};
  for (const id of state.progress.completed) stars[id] = 1;
  const safe: SaveState = {
    ...state,
    version: 1,
    progress: {
      ...state.progress,
      stars,
      currentLevelId: resolveCurrentLevel(state),
    },
    settings: { ...state.settings },
  };
  const json = JSON.stringify(safe);
  try {
    bridge()?.saveState?.(json);
  } catch (error) {
    console.warn('native state save failed', error);
  }
  try {
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.warn('local state save failed', error);
  }
}

export function resolveCurrentLevel(state: SaveState): string {
  const completed = new Set(state.progress.completed);
  return firstIncompleteLevel({ ...state, progress: { ...state.progress, completed: [...completed] } }).id;
}

export function markLevelComplete(state: SaveState, levelId: string): { isNew: boolean; allComplete: boolean } {
  const isNew = !state.progress.completed.includes(levelId);
  if (isNew) state.progress.completed.push(levelId);
  state.progress.stars[levelId] = 1;
  state.progress.currentLevelId = resolveCurrentLevel(state);
  state.resume = null;
  return {
    isNew,
    allComplete: levels.every((level) => state.progress.completed.includes(level.id)),
  };
}

export function recordAttempt(state: SaveState, levelId: string, usedHint: boolean): void {
  state.progress.attempts[levelId] = (state.progress.attempts[levelId] ?? 0) + 1;
  if (usedHint) state.progress.hints[levelId] = (state.progress.hints[levelId] ?? 0) + 1;
}

export function resetProgress(state: SaveState): void {
  const settings = { ...state.settings };
  const tutorialDone = state.progress.tutorialDone;
  Object.assign(state, freshState());
  state.settings = settings;
  state.progress.tutorialDone = tutorialDone;
}

export function markTutorialDone(state: SaveState): void {
  state.progress.tutorialDone = true;
}

export function clearResume(state: SaveState): void {
  state.resume = null;
}
