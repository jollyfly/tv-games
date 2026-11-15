import type { Level, WorldId } from '../types';
import type { MicroHost, Microgame } from './base';
import { createForestGame, forestGameFor } from './forest';
import { candyGameFor, createCandyGame } from './candy';
import { castleGameFor, createCastleGame } from './castle';
import { skyGameFor, createSkyGame } from './sky';
import { oceanGameFor, createOceanGame } from './ocean';
import { dinoGameFor, createDinoGame } from './dino';
import { spaceGameFor, createSpaceGame } from './space';
import { musicGameFor, createMusicGame } from './music';
import { donutGameFor, createDonutGame } from './donut';
import { magicGameFor, createMagicGame } from './magic';

export type { MicroAction, MicroControl, MicroGameInfo, MicroHost, MicroResult } from './base';
export { Microgame } from './base';

const FACTORIES: Array<{ world: WorldId; has: (id: string) => boolean; create: (level: Level, host: MicroHost) => Microgame | null }> = [
  { world: 'forest', has: (id) => !!forestGameFor(id), create: createForestGame },
  { world: 'candy', has: (id) => !!candyGameFor(id), create: createCandyGame },
  { world: 'castle', has: (id) => !!castleGameFor(id), create: createCastleGame },
  { world: 'sky', has: (id) => !!skyGameFor(id), create: createSkyGame },
  { world: 'ocean', has: (id) => !!oceanGameFor(id), create: createOceanGame },
  { world: 'dino', has: (id) => !!dinoGameFor(id), create: createDinoGame },
  { world: 'space', has: (id) => !!spaceGameFor(id), create: createSpaceGame },
  { world: 'music', has: (id) => !!musicGameFor(id), create: createMusicGame },
  { world: 'donut', has: (id) => !!donutGameFor(id), create: createDonutGame },
  { world: 'magic', has: (id) => !!magicGameFor(id), create: createMagicGame },
];

export function hasMicrogame(levelId: string): boolean {
  return FACTORIES.some((entry) => entry.has(levelId));
}

export function createMicrogame(level: Level, host: MicroHost): Microgame | null {
  for (const entry of FACTORIES) {
    if (entry.world === level.world && entry.has(level.id)) return entry.create(level, host);
  }
  return null;
}
