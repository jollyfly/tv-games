import raw from './content.json';
import type { ContentFile, GameRound, Level, SaveState, World } from './types';

type RawLevel = Omit<Level, 'rounds'> & { rounds: Array<Omit<GameRound, 'kind'>> };

const rawContent = raw as unknown as Omit<ContentFile, 'levels'> & { levels: RawLevel[] };

/** The source JSON keeps one `kind` per level; rounds inherit it at load time. */
export const levels: Level[] = rawContent.levels.map((level) => ({
  ...level,
  rounds: level.rounds.map((round) => ({ ...round, kind: level.kind })) as GameRound[],
}));
export const worlds: World[] = rawContent.worlds;
export const content: ContentFile = { ...rawContent, levels };

export function getLevel(id: string): Level {
  const level = levels.find((item) => item.id === id);
  if (!level) throw new Error(`Unknown level: ${id}`);
  return level;
}

export function getLevelIndex(id: string): number {
  return levels.findIndex((item) => item.id === id);
}

export function getWorldById(id: string): World {
  const world = worlds.find((item) => item.id === id);
  if (!world) throw new Error(`Unknown world: ${id}`);
  return world;
}

export function getWorld(id: string): World {
  const level = getLevel(id);
  const world = worlds.find((item) => item.id === level.world);
  if (!world) throw new Error(`Unknown world for level: ${id}`);
  return world;
}

export function nextLevelId(id: string): string | null {
  const index = getLevelIndex(id);
  return index >= 0 && index < levels.length - 1 ? levels[index + 1].id : null;
}

export function firstIncompleteLevel(state: SaveState): Level {
  const completed = new Set(state.progress.completed);
  return levels.find((level) => !completed.has(level.id)) ?? levels[levels.length - 1];
}

export function introVoiceId(level: Level): string {
  return `intro-${level.id}`;
}

export function promptVoiceId(level: Level, roundIndex: number): string {
  return `prompt-${level.id}-${roundIndex + 1}`;
}

export function countVoiceId(n: number): string {
  return `count-${n}`;
}

export function summaryVoiceId(n: number): string {
  return `summary-${n}`;
}

export function roundKind(level: Level, index: number): GameRound['kind'] {
  return level.rounds[index].kind;
}

export function validateContent(): string[] {
  const errors: string[] = [];
  if (levels.length !== 100) errors.push('必须正好有 100 个关卡');
  for (const level of levels) {
    if (level.rounds.length !== 3) errors.push(`${level.id} 不是 3 题`);
    level.rounds.forEach((round, index) => {
      const where = `${level.id} 第 ${index + 1} 题`;
      switch (round.kind) {
        case 'count':
        case 'quantity':
          if (round.options.length !== 3) errors.push(`${where} 选项不是 3 个`);
          if (!round.options.includes(round.target)) errors.push(`${where} 缺少正确答案`);
          if (new Set(round.options).size !== 3) errors.push(`${where} 选项重复`);
          break;
        case 'sequence':
          if (!round.options.includes(round.answer)) errors.push(`${where} 缺少正确答案`);
          if (round.sequence.filter((v) => v === null).length !== 1) errors.push(`${where} 缺口不是 1 个`);
          break;
        case 'compare':
          if (round.left === round.right) errors.push(`${where} 两边一样多`);
          break;
        case 'pattern':
          if (!round.options.includes(round.answer)) errors.push(`${where} 缺少正确答案`);
          break;
        case 'ordinal':
          if (round.position < 1 || round.position > round.lineup.length) errors.push(`${where} 序数越界`);
          if (!round.options.includes(round.answer)) errors.push(`${where} 缺少正确答案`);
          break;
        case 'maze': {
          const side = Math.sqrt(round.grid.length);
          if (!Number.isInteger(side) || round.cols !== side) errors.push(`${where} 迷宫不是正方形`);
          if (round.path[0] !== 1) errors.push(`${where} 迷宫必须从 1 开始`);
          if (round.path.some((value, index) => value !== index + 1)) errors.push(`${where} 迷宫路径必须连续`);
          break;
        }
        case 'plane':
          if (round.options.length !== 3) errors.push(`${where} 飞机选项不是 3 个`);
          if (!round.options.includes(round.target)) errors.push(`${where} 飞机缺少正确目标`);
          break;
        case 'relation':
          if (round.answer !== round.base + round.delta) errors.push(`${where} 数量关系答案错误`);
          if (!round.options.includes(round.answer)) errors.push(`${where} 数量关系缺少正确答案`);
          break;
        case 'odd':
          if (round.items.length !== 3) errors.push(`${where} 找不同不是 3 项`);
          break;
        case 'coord':
          if (round.items.length !== round.rows * round.cols) errors.push(`${where} 星图格子数量错误`);
          if (round.targetRow < 1 || round.targetRow > round.rows || round.targetCol < 1 || round.targetCol > round.cols) errors.push(`${where} 坐标越界`);
          break;
        case 'share':
          if (!round.options.includes(round.answer)) errors.push(`${where} 平分缺少正确答案`);
          break;
      }
    });
  }
  return errors;
}
