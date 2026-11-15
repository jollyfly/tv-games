import type { Level } from '../types';
import { escapeHtml } from '../ui';
import { fireflyPropSvg } from '../art';
import { Microgame, type MicroAction, type MicroGameInfo, type MicroHost, type MicroResult } from './base';

export type { MicroAction, MicroHost, MicroResult } from './base';

export type ForestGameKey = 'seed' | 'water' | 'bridge' | 'firefly' | 'climb' | 'memory' | 'sort' | 'rain' | 'pollinate' | 'maze';
export interface ForestGameInfo extends MicroGameInfo {
  key: ForestGameKey;
}

export const FOREST_GAMES: Record<string, ForestGameInfo> = {
  'forest-1': { key: 'seed', name: '播种', verb: '按 OK 把种子一颗颗种进花圃', controls: [{ icon: 'left', label: '换花圃' }, { icon: 'right', label: '换花圃' }, { icon: 'ok', label: '放种子' }, { icon: 'back', label: '回地图' }] },
  'forest-2': { key: 'water', name: '浇水', verb: '按住 OK 蓄水，到刻度松手', controls: [{ icon: 'ok', label: '按住蓄水' }, { icon: 'up', label: '松手停止' }, { icon: 'back', label: '回地图' }] },
  'forest-3': { key: 'bridge', name: '数字石桥', verb: '左右选石头，按 OK 踩上去', controls: [{ icon: 'left', label: '选石头' }, { icon: 'right', label: '选石头' }, { icon: 'ok', label: '踩上去' }, { icon: 'back', label: '回地图' }] },
  'forest-x4': { key: 'firefly', name: '萤火虫网', verb: '左右移动网兜，按 OK 捕捉萤火虫', controls: [{ icon: 'left', label: '移网兜' }, { icon: 'right', label: '移网兜' }, { icon: 'ok', label: '网住' }, { icon: 'back', label: '回地图' }] },
  'forest-x5': { key: 'sort', name: '落叶分拣', verb: '先选叶子，再选数字筐', controls: [{ icon: 'left', label: '选叶子/筐' }, { icon: 'right', label: '选叶子/筐' }, { icon: 'ok', label: '拿起/放下' }, { icon: 'back', label: '回地图' }] },
  'forest-x6': { key: 'climb', name: '爬树', verb: '上下移动，找到第 N 根树枝', controls: [{ icon: 'up', label: '往上爬' }, { icon: 'down', label: '往下爬' }, { icon: 'ok', label: '停这里' }, { icon: 'back', label: '回地图' }] },
  'forest-x7': { key: 'memory', name: '蘑菇记忆', verb: '翻牌配对，记住每张牌的位置', controls: [{ icon: 'left', label: '选牌' }, { icon: 'right', label: '选牌' }, { icon: 'up', label: '选牌' }, { icon: 'down', label: '选牌' }, { icon: 'ok', label: '翻牌' }, { icon: 'back', label: '回地图' }] },
  'forest-x8': { key: 'rain', name: '接雨', verb: '左右移动木桶，接住落下的雨滴', controls: [{ icon: 'left', label: '移木桶' }, { icon: 'right', label: '移木桶' }, { icon: 'back', label: '回地图' }] },
  'forest-x9': { key: 'pollinate', name: '蜜蜂授粉', verb: '在花田里移动小蜜蜂，给花朵授粉', controls: [{ icon: 'left', label: '飞' }, { icon: 'right', label: '飞' }, { icon: 'up', label: '飞' }, { icon: 'down', label: '飞' }, { icon: 'ok', label: '授粉' }, { icon: 'back', label: '回地图' }] },
  'forest-x10': { key: 'maze', name: '树根迷宫', verb: '在树根迷宫里按数字顺序走到出口', controls: [{ icon: 'left', label: '走' }, { icon: 'right', label: '走' }, { icon: 'up', label: '走' }, { icon: 'down', label: '走' }, { icon: 'back', label: '回地图' }] },
};

export function forestGameFor(levelId: string): ForestGameInfo | null {
  return FOREST_GAMES[levelId] ?? null;
}

export abstract class ForestMicrogame extends Microgame<ForestGameInfo> {}

/* ------------------------------------------------------------------ */
/* 1. 播种：移动花圃，按 OK 一颗一颗放种子，凑够目标数量              */
/* ------------------------------------------------------------------ */
class SeedGame extends ForestMicrogame {
  private target = 0;
  private planted = 0;
  private plots = 5;
  private perPlot: number[] = [];

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 3 + Math.floor(Math.random() * 4);
    this.perPlot = Array(this.plots).fill(0);
  }

  get info(): ForestGameInfo { return FOREST_GAMES['forest-1']; }

  private total(): number { return this.perPlot.reduce((a, b) => a + b, 0); }

  render(): string {
    const plots = this.perPlot.map((count, index) => `
      <button class="micro-seed-plot${this.focusClass(index)}" data-plot="${index}" aria-label="花圃 ${index + 1}，${count} 颗种子">
        <span class="seed-soil"></span>${count > 0 ? `<span class="seed-art">${seedArt()}</span>` : ''}
        <span class="seed-dots">${Array.from({ length: count }, (_, i) => `<span class="seed-dot" style="--i:${i}"></span>`).join('')}</span>
        <span class="seed-plot-count">${count}</span>
      </button>`).join('');
    return `<div class="micro-board seed-board" data-game="seed" data-target="${this.target}" data-planted="${this.total()}">
      <div class="micro-board-title">把 <b>${this.target}</b> 颗种子种进花圃</div>
      <div class="micro-caption">左右移动小铲子，按 OK 放一颗种子</div>
      <div class="seed-plots">${plots}</div>
      <div class="micro-progress">已种下 <b>${this.total()}</b> / ${this.target} 颗</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + this.plots - 1) % this.plots; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % this.plots; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.finished) return {};
      if (this.total() >= this.target) return {};
      this.perPlot[this.cursor] += 1;
      this.toastText = '';
      if (this.total() >= this.target) {
        // Let the last seed visibly land before completing.
        window.setTimeout(() => this.complete(), 380);
      }
      return { redraw: true };
    }
    return {};
  }
}

/* ------------------------------------------------------------------ */
/* 2. 浇水：按住 OK 蓄水，到标记线松手；过头要倒掉重来               */
/* ------------------------------------------------------------------ */
class WaterGame extends ForestMicrogame {
  private target = 4;
  private waterLevel = 0;
  private filling = false;
  private timer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 3 + Math.floor(Math.random() * 3);
  }

  get info(): ForestGameInfo { return FOREST_GAMES['forest-2']; }

  render(): string {
    const pct = Math.min(100, this.waterLevel / 7 * 100);
    return `<div class="micro-board water-board" data-game="water" data-target="${this.target}" data-level="${this.waterLevel.toFixed(2)}">
      <div class="micro-board-title">给花苗浇水，浇到 <b>${this.target}</b> 格</div>
      <div class="micro-caption">按住 OK 让水升高，到刻度就松手</div>
      <div class="water-stage">
        <div class="watering-can">${wateringCan()}</div>
        <div class="water-gauge">
          <div class="water-fill" style="height:${pct}%"></div>
          <div class="water-marker" style="bottom:${this.target / 7 * 100}%"><span>${this.target}</span></div>
          <div class="water-bubbles">${Array.from({ length: 8 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>
        </div>
        <div class="water-plant">${flowerPlant(this.waterLevel)}</div>
      </div>
      <div class="micro-progress">水位 <b>${this.waterLevel.toFixed(1)}</b> / ${this.target}</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  private startFill(): void {
    if (this.filling || this.finished) return;
    this.filling = true;
    this.timer = window.setInterval(() => {
      if (!this.filling) return;
      this.waterLevel = Math.min(7, this.waterLevel + 0.12);
      if (this.waterLevel >= 7) this.stopFill(true);
      else this.host.redraw();
    }, 90);
  }

  private stopFill(over = false): void {
    if (!this.filling) return;
    this.filling = false;
    if (this.timer !== null) { window.clearInterval(this.timer); this.timer = null; }
    if (over || this.waterLevel > this.target + 0.55) {
      this.toastText = '水太多啦，倒掉重新来';
      this.waterLevel = 0;
      this.host.toast('水太多啦，重新蓄水');
      this.host.redraw();
      return;
    }
    if (Math.abs(this.waterLevel - this.target) <= 0.45) {
      this.complete();
      return;
    }
    this.toastText = this.waterLevel < this.target ? '还差一点，再按住 OK' : '快到了，再试一次';
    this.host.redraw();
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'confirm') { this.startFill(); return {}; }
    if (action === 'release' || action === 'up') { this.stopFill(false); return {}; }
    return {};
  }

  dispose(): void {
    this.filling = false;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
  }
}

/* ------------------------------------------------------------------ */
/* 3. 数字石桥：踩 1→5 的石头，踩错整座桥重置                        */
/* ------------------------------------------------------------------ */
class BridgeGame extends ForestMicrogame {
  private stones: number[] = [];
  private step = 1;
  private crossing: number[] = [];
  private stonesCount = 5;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.stones = Array.from({ length: this.stonesCount }, (_, i) => i + 1);
    for (let i = this.stones.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.stones[i], this.stones[j]] = [this.stones[j], this.stones[i]];
    }
  }

  get info(): ForestGameInfo { return FOREST_GAMES['forest-3']; }

  render(): string {
    const stones = this.stones.map((value, index) => {
      const crossed = this.crossing.includes(index);
      return `<button class="bridge-stone${this.focusClass(index)}${crossed ? ' is-crossed' : ''}" data-stone="${value}" data-index="${index}" aria-label="数字石 ${value}">
        <span>${value}</span>
      </button>`;
    }).join('');
    return `<div class="micro-board bridge-board" data-game="bridge" data-step="${this.step}" data-stones="${this.stones.join(',')}">
      <div class="micro-board-title">踩数字石过河，从 1 走到 5</div>
      <div class="micro-caption">左右选石头，按 OK 踩上去；踩错就回岸边</div>
      <div class="bridge-scene">
        <div class="bridge-bank left">${iconLeaf()}<span>岸边</span></div>
        <div class="bridge-river"><div class="bridge-stones">${stones}</div><div class="bridge-fox">${fox()} </div></div>
        <div class="bridge-bank right">${iconFlag()}<span>对岸</span></div>
      </div>
      <div class="micro-progress">已踩 <b>${this.step - 1}</b> / 5 块石头</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + this.stonesCount - 1) % this.stonesCount; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % this.stonesCount; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.finished) return {};
      const value = this.stones[this.cursor];
      if (value !== this.step) {
        this.toastText = '石头沉啦！回到岸边重新走';
        this.step = 1;
        this.crossing = [];
        this.cursor = 0;
        this.host.toast('走错了，回到岸边');
        return { redraw: true };
      }
      this.crossing.push(this.cursor);
      this.step += 1;
      this.toastText = '';
      if (this.step > this.stonesCount) return this.complete();
      return { redraw: true };
    }
    return {};
  }
}

/* ------------------------------------------------------------------ */
/* 4. 萤火虫网：左右移动网兜，捕捉 3 只萤火虫                         */
/* ------------------------------------------------------------------ */
class FireflyGame extends ForestMicrogame {
  private slots = 5;
  private flies: boolean[] = [];
  private caught = 0;
  private caughtSlots = new Set<number>();
  private target = 3;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    const positions = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5).slice(0, this.target);
    this.flies = Array(this.slots).fill(false);
    for (const p of positions) this.flies[p] = true;
  }

  get info(): ForestGameInfo { return FOREST_GAMES['forest-x4']; }

  render(): string {
    const slots = this.flies.map((present, index) => {
      const caught = this.caughtSlots.has(index);
      return `<button class="firefly-slot${this.focusClass(index)}${caught ? ' is-caught' : ''}" data-slot="${index}" aria-label="草丛 ${index + 1}">
        <span class="firefly-grass">${grass()}</span>
        ${present ? `<span class="firefly-bug">${fireflyPropSvg('firefly-bug-svg')}</span>` : caught ? '<span class="firefly-empty">✓</span>' : ''}
        ${index === this.cursor ? `<span class="firefly-net">${net()}</span>` : ''}
      </button>`;
    }).join('');
    return `<div class="micro-board firefly-board" data-game="firefly" data-caught="${this.caught}" data-target="${this.target}">
      <div class="micro-board-title">用网兜捉住 <b>${this.target}</b> 只萤火虫</div>
      <div class="micro-caption">左右移动网兜，按 OK 网住草丛里的萤火虫</div>
      <div class="firefly-meadow">${slots}</div>
      <div class="micro-progress">已捉 <b>${this.caught}</b> / ${this.target} 只</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + this.slots - 1) % this.slots; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % this.slots; return { redraw: true }; }
    if (action === 'confirm') {
      if (!this.flies[this.cursor]) { this.toastText = '这里没有萤火虫，换个草丛试试'; return { redraw: true }; }
      this.flies[this.cursor] = false;
      this.caughtSlots.add(this.cursor);
      this.caught += 1;
      this.toastText = '';
      if (this.caught >= this.target) window.setTimeout(() => this.complete(), 320);
      return { redraw: true };
    }
    return {};
  }
}

/* ------------------------------------------------------------------ */
/* 5. 落叶分拣：先选叶子，再选数字筐；把每片叶子送回它的数量筐         */
/* ------------------------------------------------------------------ */
class SortGame extends ForestMicrogame {
  private leaves: number[] = [];
  private phase: 'leaf' | 'basket' = 'leaf';
  private selected = -1;
  private selectedValue = 0;
  private basket = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.leaves = [3, 3, 5, 5].sort(() => Math.random() - 0.5);
  }

  get info(): ForestGameInfo { return FOREST_GAMES['forest-x5']; }

  render(): string {
    const leaves = this.leaves.map((value, index) => `
      <button class="sort-leaf${this.phase === 'leaf' && this.focusClass(index)}${this.selected === index ? ' is-selected' : ''}" data-value="${value}" aria-label="有 ${value} 个斑点的叶子">
        ${leafSvg()}<span class="leaf-dots">${Array.from({ length: value }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</span>
      </button>`).join('');
    const baskets = [3, 5].map((value, index) => `
      <button class="sort-basket${this.phase === 'basket' ? this.focusClass(index) : ''}${this.basket === index && this.phase === 'basket' ? ' is-selected' : ''}" data-basket="${value}" aria-label="${value} 号筐">
        <span class="basket-rim"></span><span class="basket-label">${value}</span>
      </button>`).join('');
    return `<div class="micro-board sort-board" data-game="sort" data-phase="${this.phase}" data-left="${this.leaves.length}">
      <div class="micro-board-title">把落叶按斑点数量送回对应的筐</div>
      <div class="micro-caption">${this.phase === 'leaf' ? '左右选叶子，按 OK 拿起' : '左右选数字筐，按 OK 放进去'}</div>
      <div class="sort-stage">
        <div class="sort-leaves">${leaves}</div>
        <div class="sort-baskets">${baskets}</div>
      </div>
      <div class="micro-progress">还剩 <b>${this.leaves.length}</b> 片叶子</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left' || action === 'right') {
      const size = this.phase === 'leaf' ? this.leaves.length : 2;
      if (!size) return {};
      this.cursor = (this.cursor + (action === 'left' ? size - 1 : 1)) % size;
      if (this.phase === 'basket') this.basket = this.cursor;
      return { redraw: true };
    }
    if (action === 'confirm') {
      if (this.phase === 'leaf') {
        if (!this.leaves.length) return {};
        this.selected = this.cursor;
        this.selectedValue = this.leaves[this.cursor];
        this.phase = 'basket';
        this.cursor = 0;
        this.basket = 0;
        return { redraw: true };
      }
      const basketValue = this.cursor === 0 ? 3 : 5;
      if (this.selectedValue === basketValue) {
        this.leaves.splice(this.selected, 1);
        this.phase = 'leaf';
        this.selected = -1;
        this.cursor = 0;
        this.toastText = '';
        if (!this.leaves.length) window.setTimeout(() => this.complete(), 320);
      } else {
        this.toastText = `数一数，这片叶子不是 ${basketValue} 个斑点`;
        this.phase = 'leaf';
        this.selected = -1;
        this.cursor = 0;
      }
      return { redraw: true };
    }
    return {};
  }
}

/* ------------------------------------------------------------------ */
/* 6. 爬树：上下移动，找到从下往上数第 N 根树枝                       */
/* ------------------------------------------------------------------ */
class ClimbGame extends ForestMicrogame {
  private target = 3;
  private branches = 5;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 2 + Math.floor(Math.random() * 4);
  }

  get info(): ForestGameInfo { return FOREST_GAMES['forest-x6']; }

  render(): string {
    const branches = Array.from({ length: this.branches }, (_, i) => {
      const level = this.branches - 1 - i;
      return `<button class="climb-branch${this.focusClass(level)}" style="bottom:${30 + level * 60}px" data-branch="${level + 1}" aria-label="第 ${level + 1} 根树枝">
        <span class="climb-leaf left">${leafSvg()}</span><span class="climb-arm"></span><span class="climb-leaf right">${leafSvg()}</span>
      </button>`;
    }).join('');
    return `<div class="micro-board climb-board" data-game="climb" data-target="${this.target}">
      <div class="micro-board-title">从下往上数，找到第 <b>${this.target}</b> 根树枝</div>
      <div class="micro-caption">上下移动小松鼠，按 OK 停在正确的树枝</div>
      <div class="climb-tree">
        <div class="climb-trunk"></div>
        ${branches}
        <div class="climb-squirrel" style="bottom:${18 + this.cursor * 60}px">${squirrelClimb()}</div>
      </div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'up') { this.cursor = Math.min(this.branches - 1, this.cursor + 1); return { redraw: true }; }
    if (action === 'down') { this.cursor = Math.max(0, this.cursor - 1); return { redraw: true }; }
    if (action === 'confirm') {
      if (this.cursor + 1 === this.target) return this.complete();
      this.toastText = '不是这一根，再数一数';
      return { redraw: true };
    }
    return {};
  }
}

/* ------------------------------------------------------------------ */
/* 7. 蘑菇记忆：翻牌配对，三对全部找到                                 */
/* ------------------------------------------------------------------ */
class MemoryGame extends ForestMicrogame {
  private cards: string[] = [];
  private opened: number[] = [];
  private matched = new Set<number>();
  private first = -1;
  private lock = false;
  private timer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    const values = ['flower', 'star', 'candy'];
    this.cards = [...values, ...values].sort(() => Math.random() - 0.5);
  }

  get info(): ForestGameInfo { return FOREST_GAMES['forest-x7']; }

  render(): string {
    const cards = this.cards.map((value, index) => {
      const open = this.opened.includes(index) || this.matched.has(index);
      return `<button class="memory-card${this.focusClass(index)}${open ? ' is-open' : ''}${this.matched.has(index) ? ' is-matched' : ''}" data-card="${index}" data-kind="${value}" aria-label="记忆牌 ${index + 1}">
        <span class="memory-back">?</span>
        <span class="memory-face">${memoryIcon(value)}</span>
      </button>`;
    }).join('');
    return `<div class="micro-board memory-board" data-game="memory" data-matched="${this.matched.size}">
      <div class="micro-board-title">翻开两张一样的牌</div>
      <div class="micro-caption">用方向键移动，按 OK 翻牌；记住位置</div>
      <div class="memory-grid">${cards}</div>
      <div class="micro-progress">已配对 <b>${this.matched.size / 2}</b> / 3 对</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (this.lock) return {};
    if (action === 'left' || action === 'right') {
      this.cursor = (this.cursor + (action === 'left' ? 5 : 1)) % 6;
      return { redraw: true };
    }
    if (action === 'up' || action === 'down') {
      this.cursor = (this.cursor + (action === 'up' ? 3 : 3)) % 6;
      return { redraw: true };
    }
    if (action === 'confirm') {
      if (this.matched.has(this.cursor) || this.opened.includes(this.cursor)) return {};
      this.opened.push(this.cursor);
      if (this.first < 0) {
        this.first = this.cursor;
        return { redraw: true };
      }
      const a = this.first;
      const b = this.cursor;
      if (this.cards[a] === this.cards[b]) {
        this.matched.add(a);
        this.matched.add(b);
        this.opened = [];
        this.first = -1;
        if (this.matched.size === 6) window.setTimeout(() => this.complete(), 350);
        return { redraw: true };
      }
      this.lock = true;
      this.timer = window.setTimeout(() => {
        this.opened = [];
        this.first = -1;
        this.lock = false;
        this.host.redraw();
      }, 720);
      return { redraw: true };
    }
    return {};
  }

  dispose(): void {
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
  }
}

/* ------------------------------------------------------------------ */
/* 8. 接雨：左右移动木桶，接住目标数量的雨滴                         */
/* ------------------------------------------------------------------ */
class RainGame extends ForestMicrogame {
  private slots = 5;
  private caught = 0;
  private target = 6;
  private drops: Array<{ x: number; y: number }> = [];
  private timer: number | null = null;
  private spawnTimer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 4 + Math.floor(Math.random() * 3);
    this.drops.push({ x: 2, y: 10 });
    this.timer = window.setInterval(() => {
      this.drops = this.drops
        .map((d) => ({ x: d.x, y: d.y + 4 }))
        .filter((d) => {
          if (d.y < 250) return true;
          if (Math.abs(d.x - this.cursor) <= 1) {
            this.caught += 1;
            if (this.caught >= this.target) this.complete();
          }
          return false;
        });
      this.host.redraw();
    }, 90);
    this.spawnTimer = window.setInterval(() => {
      if (this.finished) return;
      this.drops.push({ x: Math.floor(Math.random() * this.slots), y: 0 });
    }, 560);
  }

  get info(): ForestGameInfo { return FOREST_GAMES['forest-x8']; }

  render(): string {
    const drops = this.drops.map((d) => `<span class="rain-drop" style="left:${d.x * 20 + 10}%;top:${d.y}px"></span>`).join('');
    const buckets = Array.from({ length: this.slots }, (_, index) => `<span class="rain-slot${index === this.cursor ? ' is-focused' : ''}" style="left:${index * 20 + 10}%"></span>`).join('');
    return `<div class="micro-board rain-board" data-game="rain" data-caught="${this.caught}" data-target="${this.target}">
      <div class="micro-board-title">接住 <b>${this.target}</b> 滴雨，浇给树苗</div>
      <div class="micro-caption">左右移动木桶，让雨滴落进桶里</div>
      <div class="rain-stage">${drops}<div class="rain-cloud">${rainCloud()}</div><div class="rain-ground"></div>${buckets}<div class="rain-bucket" style="left:${this.cursor * 20 + 10}%">${bucket()}</div></div>
      <div class="micro-progress">已接 <b>${this.caught}</b> / ${this.target} 滴</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + this.slots - 1) % this.slots; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % this.slots; return { redraw: true }; }
    return {};
  }

  dispose(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    if (this.spawnTimer !== null) window.clearInterval(this.spawnTimer);
    this.timer = null;
    this.spawnTimer = null;
  }
}

/* ------------------------------------------------------------------ */
/* 9. 蜜蜂授粉：在花田网格中移动，给目标数量的花授粉                 */
/* ------------------------------------------------------------------ */
class PollinateGame extends ForestMicrogame {
  private target = 5;
  private visited = new Set<number>();
  private cols = 3;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 5;
  }

  get info(): ForestGameInfo { return FOREST_GAMES['forest-x9']; }

  render(): string {
    const flowers = Array.from({ length: 9 }, (_, i) => {
      const done = this.visited.has(i);
      return `<button class="pollinate-flower${this.focusClass(i)}${done ? ' is-done' : ''}" data-cell="${i}" aria-label="花 ${i + 1}">
        ${done ? flowerArt('#F28C6E') : flowerArt('#F6C7B9')}
        ${this.cursor === i ? `<span class="pollinate-bee">${beeArt()}</span>` : ''}
      </button>`;
    }).join('');
    return `<div class="micro-board pollinate-board" data-game="pollinate" data-target="${this.target}" data-visited="${this.visited.size}">
      <div class="micro-board-title">给小蜜蜂经过的 <b>${this.target}</b> 朵花授粉</div>
      <div class="micro-caption">方向键移动，按 OK 停在花上授粉；每朵只授一次</div>
      <div class="pollinate-grid">${flowers}</div>
      <div class="micro-progress">已授粉 <b>${this.visited.size}</b> / ${this.target} 朵</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    const row = Math.floor(this.cursor / this.cols);
    const col = this.cursor % this.cols;
    if (action === 'left' && col > 0) this.cursor -= 1;
    else if (action === 'right' && col < this.cols - 1) this.cursor += 1;
    else if (action === 'up' && row > 0) this.cursor -= this.cols;
    else if (action === 'down' && row < 2) this.cursor += this.cols;
    else if (action === 'confirm') {
      if (this.visited.has(this.cursor)) {
        this.toastText = '这朵花已经授过粉啦';
        return { redraw: true };
      }
      this.visited.add(this.cursor);
      this.toastText = '';
      if (this.visited.size >= this.target) window.setTimeout(() => this.complete(), 350);
    } else return {};
    return { redraw: true };
  }
}

/* ------------------------------------------------------------------ */
/* 10. 树根迷宫：在 5×5 网格里按数字顺序走到出口                     */
/* ------------------------------------------------------------------ */
class ForestMazeGame extends ForestMicrogame {
  private cols = 5;
  private grid: number[] = [];
  private path: number[] = [];
  private step = 1;
  private fox = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.makeMaze();
  }

  get info(): ForestGameInfo { return FOREST_GAMES['forest-x10']; }

  private makeMaze(): void {
    const n = this.cols;
    const start = Math.floor(Math.random() * n * n);
    const cells = [start];
    while (cells.length < 5) {
      const [row, col] = [Math.floor(cells[cells.length - 1] / n), cells[cells.length - 1] % n];
      const choices: number[] = [];
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = row + dr;
        const nc = col + dc;
        const idx = nr * n + nc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n && !cells.includes(idx)) choices.push(idx);
      }
      if (!choices.length) { this.makeMaze(); return; }
      cells.push(choices[Math.floor(Math.random() * choices.length)]);
    }
    this.grid = Array.from({ length: n * n }, () => 6 + Math.floor(Math.random() * 4));
    cells.forEach((cell, i) => { this.grid[cell] = i + 1; });
    this.path = cells;
    this.fox = start;
  }

  render(): string {
    const tiles = this.grid.map((value, i) => {
      const isFox = i === this.fox;
      return `<div class="forest-maze-tile${isFox ? ' is-fox' : ''}" data-cell="${i}" data-value="${value}">${isFox ? dinoFox() : value}</div>`;
    }).join('');
    return `<div class="micro-board forest-maze-board" data-game="maze" data-step="${this.step}" data-fox="${this.fox}">
      <div class="micro-board-title">树根迷宫：按 1 → 5 走到出口</div>
      <div class="micro-caption">方向键走一格；走错就回到起点，没有提示</div>
      <div class="forest-maze-grid">${tiles}</div>
      <div class="micro-progress">已走过 <b>${this.step - 1}</b> / 5 格</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (!['left', 'right', 'up', 'down'].includes(action)) return {};
    const row = Math.floor(this.fox / this.cols);
    const col = this.fox % this.cols;
    const nr = row + (action === 'down' ? 1 : action === 'up' ? -1 : 0);
    const nc = col + (action === 'right' ? 1 : action === 'left' ? -1 : 0);
    if (nr < 0 || nr >= this.cols || nc < 0 || nc >= this.cols) return {};
    const next = nr * this.cols + nc;
    if (this.grid[next] !== this.step + 1) {
      this.toastText = '树根断了，回到起点';
      this.step = 1;
      this.fox = this.path[0];
      this.host.toast('走错了，回到起点');
      return { redraw: true };
    }
    this.fox = next;
    this.step += 1;
    this.toastText = '';
    if (this.step >= 5) return this.complete();
    return { redraw: true };
  }
}

export function createForestGame(level: Level, host: MicroHost): ForestMicrogame | null {
  switch (forestGameFor(level.id)?.key) {
    case 'seed': return new SeedGame(level, host);
    case 'water': return new WaterGame(level, host);
    case 'bridge': return new BridgeGame(level, host);
    case 'firefly': return new FireflyGame(level, host);
    case 'sort': return new SortGame(level, host);
    case 'climb': return new ClimbGame(level, host);
    case 'memory': return new MemoryGame(level, host);
    case 'rain': return new RainGame(level, host);
    case 'pollinate': return new PollinateGame(level, host);
    case 'maze': return new ForestMazeGame(level, host);
    default: return null;
  }
}

function seedArt(): string {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <ellipse cx="50" cy="78" rx="36" ry="14" fill="#8F623E" opacity="0.55"/>
    <path d="M50 74 C46 53 49 39 61 26" fill="none" stroke="#4D8A43" stroke-width="6" stroke-linecap="round"/>
    <path d="M51 52 C33 48 28 32 39 23 C51 28 55 40 51 52 Z" fill="#79B85A" stroke="#23313F" stroke-width="3"/>
    <path d="M53 45 C56 28 72 22 82 29 C78 43 67 50 53 45 Z" fill="#A9D98E" stroke="#23313F" stroke-width="3"/>
    <path d="M37 77 C29 59 35 39 50 31 C65 41 69 60 61 78 Z" fill="#8B5E3C" stroke="#23313F" stroke-width="4"/>
    <path d="M44 51 C47 61 48 70 47 78 M57 47 C55 59 55 69 56 78" fill="none" stroke="#C9956B" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    <circle cx="34" cy="82" r="6" fill="#FFD45C" stroke="#23313F" stroke-width="2.5"/>
    <circle cx="68" cy="84" r="4" fill="#FFD45C" stroke="#23313F" stroke-width="2.5"/>
  </svg>`;
}
function beeArt(): string {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <g class="bee-wings">
      <ellipse cx="38" cy="34" rx="20" ry="12" transform="rotate(-32 38 34)" fill="#EAF7FF" stroke="#23313F" stroke-width="3"/>
      <ellipse cx="63" cy="33" rx="19" ry="11" transform="rotate(30 63 33)" fill="#EAF7FF" stroke="#23313F" stroke-width="3"/>
      <path d="M28 28 C36 20 44 20 50 28 M52 26 C60 18 68 20 74 28" fill="none" stroke="#9EC9DB" stroke-width="2"/>
    </g>
    <g fill="none" stroke="#23313F" stroke-width="3" stroke-linecap="round">
      <path d="M36 35 C28 26 22 25 16 28"/><path d="M64 34 C72 25 78 24 84 27"/>
      <path d="M32 60 C25 67 22 74 23 80"/><path d="M42 66 C37 74 36 80 38 86"/><path d="M62 66 C67 74 68 80 66 86"/><path d="M72 60 C79 67 82 74 81 80"/>
    </g>
    <circle cx="16" cy="28" r="3" fill="#23313F"/><circle cx="84" cy="27" r="3" fill="#23313F"/>
    <ellipse cx="50" cy="54" rx="27" ry="20" fill="#FFD45C" stroke="#23313F" stroke-width="4"/>
    <path d="M36 39 C40 32 60 32 64 39" fill="none" stroke="#23313F" stroke-width="3"/>
    <g fill="#3E3228" stroke="#23313F" stroke-width="2">
      <path d="M34 48 C40 43 60 43 66 48 L64 56 C57 52 43 52 36 56 Z"/>
      <path d="M34 63 C40 58 60 58 66 63 L64 70 C57 66 43 66 36 70 Z"/>
    </g>
    <circle cx="39" cy="47" r="4.5" fill="#FFFDF7" stroke="#23313F" stroke-width="2"/><circle cx="61" cy="47" r="4.5" fill="#FFFDF7" stroke="#23313F" stroke-width="2"/>
    <circle cx="40" cy="47" r="2" fill="#23313F"/><circle cx="62" cy="47" r="2" fill="#23313F"/>
    <path d="M50 58 q5 4 10 0" fill="none" stroke="#23313F" stroke-width="2" stroke-linecap="round"/>
    <path d="M75 57 L84 60 L75 64" fill="#23313F"/>
  </svg>`;
}
function wateringCan(): string {
  return `<svg viewBox="0 0 220 180" aria-hidden="true">
    <g class="watering-can">
      <path d="M54 60 H146 C160 60 170 70 170 84 V144 C170 158 160 168 146 168 H54 C40 168 30 158 30 144 V84 C30 70 40 60 54 60 Z" fill="#7FB6D9" stroke="#23313F" stroke-width="5"/>
      <path d="M44 72 C58 64 76 62 92 62 C78 78 70 100 68 126 C52 120 42 108 42 90 Z" fill="#B9E3EA" opacity="0.65"/>
      <path d="M164 91 L204 73 C216 68 226 76 226 89 V108 C226 118 218 124 208 121 L164 110 Z" fill="#5E9FC4" stroke="#23313F" stroke-width="5" stroke-linejoin="round"/>
      <ellipse cx="220" cy="91" rx="9" ry="17" fill="#4D8A43" stroke="#23313F" stroke-width="3"/>
      <path d="M44 66 C18 20 38 2 60 14" fill="none" stroke="#23313F" stroke-width="15" stroke-linecap="round"/>
      <path d="M44 66 C18 20 38 2 60 14" fill="none" stroke="#7FB6D9" stroke-width="8" stroke-linecap="round"/>
      <path d="M56 78 H144" stroke="#EAF7FF" stroke-width="6" stroke-linecap="round" opacity="0.7"/>
      <g fill="#7FB6D9"><circle cx="96" cy="118" r="7"/><circle cx="120" cy="132" r="5"/><circle cx="78" cy="140" r="4"/></g>
    </g>
  </svg>`;
}
function flowerPlant(level: number): string {
  const bloom = level >= 2.5;
  return `<svg viewBox="0 0 180 220" aria-hidden="true">
    <path d="M90 205 C86 162 68 132 82 94 M90 205 C96 166 118 140 108 102" fill="none" stroke="#4D8A43" stroke-width="9" stroke-linecap="round"/>
    <path d="M84 160 C60 158 48 144 50 130 C70 128 82 142 84 160 Z" fill="#79B85A" stroke="#23313F" stroke-width="3"/>
    <path d="M100 145 C122 140 136 124 132 110 C112 112 100 126 100 145 Z" fill="#A9D98E" stroke="#23313F" stroke-width="3"/>
    <path d="M88 186 C70 182 60 170 64 158 C80 160 89 173 88 186 Z" fill="#8FCB72" stroke="#23313F" stroke-width="2.5"/>
    <path d="M52 206 C60 190 120 190 128 206 Z" fill="#8B5E3C" stroke="#23313F" stroke-width="3"/>
    <g>${bloom ? `
      <g fill="#F28C6E" stroke="#23313F" stroke-width="3">
        <ellipse cx="82" cy="63" rx="18" ry="27" transform="rotate(-38 82 63)"/>
        <ellipse cx="106" cy="63" rx="18" ry="27" transform="rotate(38 106 63)"/>
        <ellipse cx="70" cy="86" rx="18" ry="27" transform="rotate(-80 70 86)"/>
        <ellipse cx="118" cy="86" rx="18" ry="27" transform="rotate(80 118 86)"/>
        <ellipse cx="94" cy="104" rx="18" ry="27"/>
      </g>
      <circle cx="94" cy="78" r="16" fill="#FFC94A" stroke="#23313F" stroke-width="3"/>
      <g fill="#E8834E"><circle cx="88" cy="73" r="2.5"/><circle cx="101" cy="79" r="2.5"/><circle cx="92" cy="88" r="2.5"/></g>
    ` : `
      <path d="M82 96 C74 74 84 56 100 52 C107 70 101 88 82 96 Z" fill="#F6C7B9" stroke="#23313F" stroke-width="3"/>
      <path d="M100 52 C104 64 98 78 86 85" fill="none" stroke="#E8A48D" stroke-width="2.5"/>
    `}</g>
  </svg>`;
}
function fox(): string {
  return `<svg viewBox="0 0 140 120" aria-hidden="true">
    <g class="bridge-fox-art">
      <path d="M38 44 C28 22 44 14 58 24 C68 14 82 16 90 28 C108 22 122 34 118 50 C116 64 104 70 94 66 C84 78 60 78 50 66 C40 62 34 54 38 44 Z" fill="#E8834E" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
      <path d="M36 43 L28 12 L52 30 Z M112 38 L128 10 L130 42 Z" fill="#E8834E" stroke="#23313F" stroke-width="4"/>
      <path d="M33 17 L30 7 L43 19 Z M124 15 L130 7 L132 22 Z" fill="#23313F"/>
      <path d="M58 48 C66 40 80 40 88 48 C96 58 88 70 74 72 C60 74 52 62 58 48 Z" fill="#FFF1D8" stroke="#23313F" stroke-width="3"/>
      <circle cx="66" cy="50" r="4.5" fill="#23313F"/><circle cx="88" cy="50" r="4.5" fill="#23313F"/>
      <circle cx="64" cy="48" r="1.5" fill="#FFFDF7"/><circle cx="86" cy="48" r="1.5" fill="#FFFDF7"/>
      <path d="M74 60 q7 -5 14 0 q-7 7 -14 0 Z" fill="#23313F"/>
      <path d="M81 65 v6 M81 71 q-6 5 -11 1 M81 71 q6 5 11 1" fill="none" stroke="#23313F" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="48" cy="60" rx="9" ry="5" fill="#F6A696" opacity="0.65"/><ellipse cx="106" cy="60" rx="9" ry="5" fill="#F6A696" opacity="0.65"/>
      <path d="M50 77 C42 94 48 108 62 110 C80 112 96 107 100 94 L95 76" fill="#E8834E" stroke="#23313F" stroke-width="4"/>
      <path d="M62 84 L80 106 L98 82" fill="none" stroke="#2A9D8F" stroke-width="9" stroke-linecap="round"/>
      <circle cx="80" cy="106" r="6" fill="#FFC94A" stroke="#23313F" stroke-width="2"/>
    </g>
  </svg>`;
}
function rainCloud(): string {
  return `<svg viewBox="0 0 300 120" aria-hidden="true">
    <g class="rain-cloud-art">
      <path d="M42 84 C18 84 8 58 28 46 C24 22 54 10 72 28 C86 4 128 4 140 30 C160 12 196 22 194 46 C224 44 236 72 216 84 Z" fill="#B6D9EA" stroke="#23313F" stroke-width="4"/>
      <path d="M48 58 C62 44 82 44 94 54 M112 38 C126 28 146 30 154 42" fill="none" stroke="#EAF7FF" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
      <g fill="#7FB6D9" stroke="#23313F" stroke-width="2.5">
        <path d="M78 92 C71 106 70 114 76 118 C84 114 84 103 78 92 Z"/>
        <path d="M120 92 C113 106 112 114 118 118 C126 114 126 103 120 92 Z"/>
        <path d="M164 92 C157 106 156 114 162 118 C170 114 170 103 164 92 Z"/>
      </g>
      <path d="M206 94 L194 112 H206 L198 128" fill="none" stroke="#FFC94A" stroke-width="4" stroke-linejoin="round"/>
    </g>
  </svg>`;
}
function bucket(): string {
  return `<svg viewBox="0 0 110 110" aria-hidden="true">
    <g class="bucket-art">
      <path d="M18 30 H92 L82 96 H28 Z" fill="#B87B48" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
      <path d="M26 46 H84 M30 64 H80 M33 82 H77" stroke="#8B5E3C" stroke-width="3" opacity="0.75"/>
      <ellipse cx="55" cy="30" rx="37" ry="10" fill="#DDBB83" stroke="#23313F" stroke-width="4"/>
      <ellipse cx="55" cy="30" rx="29" ry="6" fill="#7FB6D9"/>
      <path d="M21 26 H89 M23 40 H87" stroke="#C0CBD3" stroke-width="5" stroke-linecap="round"/>
      <path d="M26 91 H84" stroke="#C0CBD3" stroke-width="3" opacity="0.8"/>
      <path d="M32 22 C22 8 34 0 44 8" fill="none" stroke="#23313F" stroke-width="5" stroke-linecap="round"/>
    </g>
  </svg>`;
}
function flowerArt(color: string): string {
  return `<svg viewBox="0 0 120 120" aria-hidden="true">
    <g class="pollinate-flower-art">
      <path d="M60 112 C58 92 54 78 58 62" fill="none" stroke="#4D8A43" stroke-width="6" stroke-linecap="round"/>
      <path d="M58 94 C42 94 34 84 36 74 C50 74 58 82 58 94 Z" fill="#79B85A" stroke="#23313F" stroke-width="2.5"/>
      <path d="M60 86 C76 84 84 74 82 64 C68 66 60 74 60 86 Z" fill="#A9D98E" stroke="#23313F" stroke-width="2.5"/>
      <g fill="${color}" stroke="#23313F" stroke-width="3">
        <ellipse cx="60" cy="26" rx="14" ry="22"/>
        <ellipse cx="38" cy="40" rx="14" ry="22" transform="rotate(-56 38 40)"/>
        <ellipse cx="82" cy="40" rx="14" ry="22" transform="rotate(56 82 40)"/>
        <ellipse cx="44" cy="62" rx="14" ry="22" transform="rotate(-112 44 62)"/>
        <ellipse cx="76" cy="62" rx="14" ry="22" transform="rotate(112 76 62)"/>
      </g>
      <circle cx="60" cy="48" r="13" fill="#FFC94A" stroke="#23313F" stroke-width="3"/>
      <g fill="#E8834E"><circle cx="56" cy="44" r="2"/><circle cx="64" cy="48" r="2"/><circle cx="57" cy="53" r="2"/></g>
    </g>
  </svg>`;
}
function memoryIcon(value: string): string {
  if (value === 'flower') return flowerArt('#F28C6E');
  if (value === 'star') return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 10 L61 38 L92 40 L68 59 L76 88 L50 71 L24 88 L32 59 L8 40 L39 38 Z" fill="#FFC94A" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/><path d="M50 24 L56 41 L74 42 L60 53 L65 70 L50 60 L35 70 L40 53 L26 42 L44 41 Z" fill="#FFE49B" opacity="0.85"/></svg>`;
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M25 58 C25 30 75 30 75 58 C66 68 34 68 25 58 Z" fill="#F28C6E" stroke="#23313F" stroke-width="4"/>
    <path d="M42 60 C40 76 40 86 50 90 C60 86 60 76 58 60" fill="#FFF1D8" stroke="#23313F" stroke-width="3.5"/>
    <g fill="#FFFDF7"><circle cx="42" cy="46" r="6"/><circle cx="58" cy="40" r="4.5"/><circle cx="62" cy="54" r="3.5"/><circle cx="35" cy="55" r="3"/></g>
    <path d="M38 72 C42 76 58 76 62 72" fill="none" stroke="#23313F" stroke-width="2" opacity="0.35"/>
  </svg>`;
}
function leafSvg(): string {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M12 78 C8 36 38 10 84 12 C86 54 58 86 12 78 Z" fill="#D98A4E" stroke="#23313F" stroke-width="4"/>
    <path d="M18 72 C34 58 54 36 78 20" fill="none" stroke="#8B5E3C" stroke-width="4" stroke-linecap="round"/>
    <g fill="none" stroke="#B36A38" stroke-width="2" opacity="0.75">
      <path d="M32 62 C38 52 42 48 52 44 M46 48 C54 50 58 50 64 46 M58 36 C64 32 70 30 76 30 M28 70 C32 60 38 56 46 54"/>
      <path d="M44 70 C36 66 30 64 24 64"/>
    </g>
    <path d="M14 78 C22 84 30 86 38 84" fill="none" stroke="#8B5E3C" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="68" cy="64" rx="5" ry="3" fill="#F6D7BF" opacity="0.7"/>
  </svg>`;
}
function squirrelClimb(): string {
  return `<svg viewBox="0 0 120 130" aria-hidden="true">
    <g class="climb-squirrel">
      <path d="M27 62 C6 48 8 22 28 22 C46 22 42 48 58 62" fill="#E8834E" stroke="#23313F" stroke-width="4"/>
      <path d="M30 40 C22 32 24 28 31 28 C38 28 37 35 42 41" fill="none" stroke="#F8D9B3" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="64" cy="78" rx="28" ry="32" fill="#E8834E" stroke="#23313F" stroke-width="4"/>
      <ellipse cx="64" cy="84" rx="17" ry="22" fill="#F8D9B3" stroke="#23313F" stroke-width="2.5"/>
      <path d="M42 72 L34 54 L50 64 Z M86 70 L94 52 L80 62 Z" fill="#E8834E" stroke="#23313F" stroke-width="3"/>
      <path d="M46 57 L42 48 L53 55 Z M82 57 L88 48 L76 55 Z" fill="#F6A696"/>
      <circle cx="54" cy="72" r="4.5" fill="#23313F"/><circle cx="74" cy="72" r="4.5" fill="#23313F"/>
      <circle cx="52" cy="70" r="1.5" fill="#FFFDF7"/><circle cx="72" cy="70" r="1.5" fill="#FFFDF7"/>
      <path d="M60 83 q5 -4 10 0 q-5 6 -10 0 Z" fill="#23313F"/>
      <path d="M65 88 v4 M65 92 q-5 4 -9 1 M65 92 q5 4 9 1" fill="none" stroke="#23313F" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M46 110 C37 120 34 126 38 130 M82 110 C91 120 94 126 90 130" stroke="#23313F" stroke-width="6" stroke-linecap="round"/>
      <circle cx="88" cy="99" r="10" fill="#C9956B" stroke="#23313F" stroke-width="3"/>
      <path d="M84 91 C84 85 92 85 92 91" fill="none" stroke="#4D8A43" stroke-width="2.5"/>
    </g>
  </svg>`;
}
function net(): string {
  return `<svg viewBox="0 0 150 130" aria-hidden="true">
    <path d="M14 116 L92 40" stroke="#8B5E3C" stroke-width="10" stroke-linecap="round"/>
    <path d="M14 116 L92 40" stroke="#C9956B" stroke-width="4" stroke-linecap="round"/>
    <g transform="rotate(-35 96 40)">
      <ellipse cx="96" cy="40" rx="44" ry="32" fill="rgba(235,249,255,0.28)" stroke="#23313F" stroke-width="5"/>
      <path d="M58 40 H134 M96 8 V72 M68 14 L124 66 M68 66 L124 14" stroke="#23313F" stroke-width="2" opacity="0.4"/>
      <path d="M60 20 C76 8 116 8 132 20" fill="none" stroke="#FFFDF7" stroke-width="3" opacity="0.8"/>
    </g>
    <circle cx="146" cy="36" r="6" fill="#FFC94A" stroke="#23313F" stroke-width="2"/>
  </svg>`;
}

function iconLeaf(): string { return `<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M12 62 C8 28 34 10 66 12 C66 46 46 68 12 62 Z" fill="#79B85A" stroke="#23313F" stroke-width="4"/><path d="M20 58 C32 44 44 32 58 22" fill="none" stroke="#4D8A43" stroke-width="4" stroke-linecap="round"/></svg>`; }
function iconFlag(): string { return `<svg viewBox="0 0 80 110" aria-hidden="true"><path d="M18 100 V12" stroke="#23313F" stroke-width="6" stroke-linecap="round"/><path d="M22 18 h46 l-8 20 8 20 H22 Z" fill="#F27059" stroke="#23313F" stroke-width="4"/></svg>`; }


function dinoFox(): string { return `<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M14 58 C8 34 28 18 52 24 C70 28 72 50 56 60 C42 70 22 70 14 58 Z" fill="#E8834E" stroke="#23313F" stroke-width="3.5"/><path d="M18 26 L16 8 L34 22 M58 22 L70 8 L70 28" fill="#E8834E" stroke="#23313F" stroke-width="3.5"/><circle cx="32" cy="44" r="3" fill="#23313F"/><circle cx="50" cy="44" r="3" fill="#23313F"/><path d="M36 54 q6 4 12 0" fill="none" stroke="#23313F" stroke-width="2" stroke-linecap="round"/></svg>`; }
function grass(): string { return `<svg viewBox="0 0 120 90" aria-hidden="true"><path d="M18 88 C12 55 26 38 38 24 M45 88 C40 55 50 32 62 18 M72 88 C70 58 82 40 96 28 M98 88 C96 66 106 50 116 40" fill="none" stroke="#4D8A43" stroke-width="6" stroke-linecap="round"/><path d="M0 90 h120" stroke="#4D8A43" stroke-width="4"/></svg>`; }
