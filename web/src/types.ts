export type WorldId = 'forest' | 'candy' | 'castle' | 'sky' | 'ocean' | 'dino' | 'space' | 'music' | 'donut' | 'magic';
export type GuardianId = 'squirrel' | 'bear' | 'owl' | 'fox' | 'firefly' | 'turtle' | 'dino';
export type ObjectKind = 'flower' | 'strawberry' | 'candy' | 'star' | 'apple' | 'acorn' | 'fish' | 'pearl' | 'starfish' | 'fossil' | 'planet' | 'note' | 'donut';
export type RoundKind = 'count' | 'quantity' | 'sequence' | 'compare' | 'pattern' | 'ordinal' | 'maze' | 'plane' | 'relation' | 'odd' | 'coord' | 'share';

export interface World {
  id: WorldId;
  name: string;
  range: string;
  guardian: GuardianId;
  guardianName: string;
  skill: string;
}

export interface RoundBase {
  prompt: string;
}

export interface CountRound extends RoundBase {
  target: number;
  object: ObjectKind;
  options: number[];
}

export interface QuantityRound extends RoundBase {
  target: number;
  object: ObjectKind;
  options: number[];
}

export interface SequenceRound extends RoundBase {
  sequence: (number | null)[];
  answer: number;
  options: number[];
}

export interface CompareRound extends RoundBase {
  left: number;
  right: number;
  ask: 'more' | 'fewer';
  object: ObjectKind;
}

export interface PatternRound extends RoundBase {
  sequence: string[];
  answer: string;
  options: string[];
}

export interface OrdinalRound extends RoundBase {
  lineup: GuardianId[];
  position: number;
  answer: GuardianId;
  options: GuardianId[];
}

export interface MazeRound extends RoundBase {
  grid: number[];
  path: number[];
  cols: number;
  goalLabel?: string;
}

export interface PlaneRound extends RoundBase {
  target: number;
  options: number[];
  mode: 'number' | 'quantity';
  theme?: 'sky' | 'ocean';
}

export interface OddRound extends RoundBase {
  items: number[];
  oddIndex: number;
}

export interface CoordRound extends RoundBase {
  rows: number;
  cols: number;
  items: string[];
  targetRow: number;
  targetCol: number;
}

export interface ShareRound extends RoundBase {
  total: number;
  parts: number;
  options: string[];
  answer: string;
}

export interface RelationRound extends RoundBase {
  base: number;
  delta: number;
  answer: number;
  options: number[];
}

export type GameRound =
  | (CountRound & { kind: 'count' })
  | (QuantityRound & { kind: 'quantity' })
  | (SequenceRound & { kind: 'sequence' })
  | (CompareRound & { kind: 'compare' })
  | (PatternRound & { kind: 'pattern' })
  | (OrdinalRound & { kind: 'ordinal' })
  | (MazeRound & { kind: 'maze' })
  | (PlaneRound & { kind: 'plane' })
  | (RelationRound & { kind: 'relation' })
  | (OddRound & { kind: 'odd' })
  | (CoordRound & { kind: 'coord' })
  | (ShareRound & { kind: 'share' });

export interface Level {
  id: string;
  number: number;
  world: WorldId;
  title: string;
  skill: string;
  kind: RoundKind;
  guardian: GuardianId;
  intro: string;
  rounds: GameRound[];
}

export interface ContentFile {
  version: number;
  title: string;
  levels: Level[];
  worlds: World[];
  voices: Record<string, string>;
}

export type Settings = {
  voiceVolume: number;
  sfxVolume: number;
  musicEnabled: boolean;
  breakMinutes: number;
  reduceMotion: boolean;
  captions: boolean;
  unlockAll: boolean;
};

export type SaveState = {
  version: 1;
  progress: {
    completed: string[];
    stars: Record<string, number>;
    attempts: Record<string, number>;
    hints: Record<string, number>;
    tutorialDone: boolean;
    currentLevelId: string;
  };
  settings: Settings;
  resume: {
    levelId: string;
    roundIndex: number;
    attempts: number;
    attemptsUsedHints: number;
  } | null;
};

export type Action = 'left' | 'right' | 'up' | 'down' | 'confirm' | 'back' | 'back_long' | 'menu';
