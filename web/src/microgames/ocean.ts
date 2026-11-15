import type { Level } from '../types';
import { escapeHtml } from '../ui';
import { clownFishSvg, blueFishPropSvg, pufferFishPropSvg, starfishPropSvg, crabPropSvg, jellyfishPropSvg, fishingBoatSvg, shellPropSvg, coralPropSvg, diverPropSvg, submarinePropSvg, treasureChestSvg } from '../art';
import { Microgame, type MicroAction, type MicroGameInfo, type MicroHost, type MicroResult } from './base';

export type OceanGameKey = 'fishing' | 'starfish' | 'pearl' | 'coral' | 'submarine' | 'jelly' | 'crab' | 'bubble' | 'treasure' | 'palace';
export interface OceanGameInfo extends MicroGameInfo { key: OceanGameKey; }

const info = (key: OceanGameKey, name: string, verb: string, controls: OceanGameInfo['controls']): OceanGameInfo => ({ key, name, verb, controls });
const L = (label: string) => ({ icon: 'left' as const, label });
const R = (label: string) => ({ icon: 'right' as const, label });
const U = (label: string) => ({ icon: 'up' as const, label });
const D = (label: string) => ({ icon: 'down' as const, label });
const OK = (label: string) => ({ icon: 'ok' as const, label });
const BACK = { icon: 'back' as const, label: '回地图' };

export const OCEAN_GAMES: Record<string, OceanGameInfo> = {
  'ocean-1': info('fishing', '数字捕鱼', '左右开船，按 OK 下网捕鱼', [L('开船'), R('开船'), OK('下网'), BACK]),
  'ocean-2': info('starfish', '海星采集', '在礁石间移动，收集正好数量的海星', [L('选礁石'), R('选礁石'), U('选礁石'), D('选礁石'), OK('采集'), BACK]),
  'ocean-3': info('pearl', '珍珠下潜', '按住 OK 下潜，到目标深度松手', [OK('按住下潜'), U('松手'), BACK]),
  'ocean-4': info('coral', '珊瑚种植', '在海底花圃里种下目标数量的珊瑚', [L('换位置'), R('换位置'), OK('种珊瑚'), BACK]),
  'ocean-5': info('submarine', '潜艇迷宫', '开潜艇按 1→5 穿过海底峡谷', [L('开'), R('开'), U('开'), D('开'), BACK]),
  'ocean-6': info('jelly', '水母灯', '按亮灯顺序点亮水母', [L('选水母'), R('选水母'), OK('点亮'), BACK]),
  'ocean-7': info('crab', '螃蟹赛跑', '左右交替横着走，走到目标步数', [L('横走'), R('横走'), BACK]),
  'ocean-8': info('bubble', '数字泡泡', '左右移动网兜，接住目标数量的泡泡', [L('移网'), R('移网'), BACK]),
  'ocean-9': info('treasure', '藏宝图', '按行和列找到宝箱', [L('移'), R('移'), U('移'), D('移'), OK('挖宝'), BACK]),
  'ocean-10': info('palace', '珍珠宫', '在珍珠宫迷宫按 1→4 走到王座', [L('走'), R('走'), U('走'), D('走'), BACK]),
};

export function oceanGameFor(id: string): OceanGameInfo | null { return OCEAN_GAMES[id] ?? null; }
abstract class OceanMicrogame extends Microgame<OceanGameInfo> {}

/* 1. 数字捕鱼 */
class FishingGame extends OceanMicrogame {
  private fish: number[] = [1, 2, 3, 4, 5];
  private caught = 0;
  private target = 3;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.fish = Array.from({ length: 5 }, () => 1 + Math.floor(Math.random() * 7));
    this.target = 3;
  }

  get info(): OceanGameInfo { return OCEAN_GAMES['ocean-1']; }

  render(): string {
    const fish = this.fish.map((v, i) => `<div class="fishing-lane${this.focusClass(i)}" data-lane="${i}" data-fish="${v}">
      ${v ? `<span class="fishing-fish">${fishArt(v, i % 3)}</span>` : '<span class="fishing-empty">·</span>'}
    </div>`).join('');
    return `<div class="micro-board fishing-board" data-game="fishing" data-caught="${this.caught}" data-target="${this.target}">
      <div class="micro-board-title">捕 <b>${this.target}</b> 条鱼</div>
      <div class="micro-caption">左右开船，按 OK 在鱼游过船下时下网</div>
      <div class="fishing-stage"><div class="fishing-water">${fish}</div><div class="fishing-boat" style="left:${this.cursor * 20 + 10}%">${fishBoat()}</div></div>
      <div class="micro-progress">已捕 <b>${this.caught}</b> / ${this.target} 条</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + 4) % 5; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % 5; return { redraw: true }; }
    if (action === 'confirm') {
      if (!this.fish[this.cursor]) { this.toastText = '船下没有鱼，换个位置'; return { redraw: true }; }
      this.fish[this.cursor] = 0;
      this.caught += 1;
      this.toastText = '';
      if (this.caught >= this.target) window.setTimeout(() => this.complete(), 350);
      return { redraw: true };
    }
    return {};
  }
}

/* 2. 海星采集 */
class StarfishGame extends OceanMicrogame {
  private rocks: boolean[] = [];
  private collected = 0;
  private target = 4;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.rocks = Array.from({ length: 9 }, (_, i) => i % 2 === 0 || Math.random() > 0.6);
    this.target = 4;
  }

  get info(): OceanGameInfo { return OCEAN_GAMES['ocean-2']; }

  render(): string {
    const rocks = this.rocks.map((has, i) => `<button class="starfish-rock${this.focusClass(i)}${has ? ' has-star' : ''}" data-rock="${i}" aria-label="礁石 ${i + 1}">
      ${has ? starfishArt() : '<span class="rock-empty"></span>'}
    </button>`).join('');
    return `<div class="micro-board starfish-board" data-game="starfish" data-collected="${this.collected}" data-target="${this.target}">
      <div class="micro-board-title">收集正好 <b>${this.target}</b> 只海星</div>
      <div class="micro-caption">方向键在礁石间移动，按 OK 采集海星</div>
      <div class="starfish-grid">${rocks}</div>
      <div class="micro-progress">已收集 <b>${this.collected}</b> / ${this.target} 只</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    const row = Math.floor(this.cursor / 3);
    const col = this.cursor % 3;
    if (action === 'left' && col > 0) this.cursor -= 1;
    else if (action === 'right' && col < 2) this.cursor += 1;
    else if (action === 'up' && row > 0) this.cursor -= 3;
    else if (action === 'down' && row < 2) this.cursor += 3;
    else if (action === 'confirm') {
      if (!this.rocks[this.cursor]) { this.toastText = '这块礁石没有海星'; return { redraw: true }; }
      this.rocks[this.cursor] = false;
      this.collected += 1;
      this.toastText = '';
      if (this.collected >= this.target) window.setTimeout(() => this.complete(), 350);
    } else return {};
    return { redraw: true };
  }
}

/* 3. 珍珠下潜 */
class PearlGame extends OceanMicrogame {
  private target = 4;
  private depth = 0;
  private filling = false;
  private timer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 3 + Math.floor(Math.random() * 3);
  }

  get info(): OceanGameInfo { return OCEAN_GAMES['ocean-3']; }

  render(): string {
    return `<div class="micro-board pearl-board" data-game="pearl" data-target="${this.target}" data-depth="${this.depth.toFixed(1)}">
      <div class="micro-board-title">下潜到第 <b>${this.target}</b> 格找珍珠</div>
      <div class="micro-caption">按住 OK 下潜，到刻度松手；下过头会浮回海面</div>
      <div class="pearl-stage"><div class="pearl-water"></div><div class="pearl-gauge"><div class="pearl-fill" style="height:${this.depth / 7 * 100}%"></div><div class="pearl-marker" style="bottom:${this.target / 7 * 100}%"><span>${this.target}</span></div></div><div class="pearl-diver" style="top:${8 + this.depth / 7 * 70}%">${diverArt()}</div><div class="pearl-shell">${shellArt()}</div></div>
      <div class="micro-progress">深度 <b>${this.depth.toFixed(1)}</b> / ${this.target}</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  private start(): void {
    if (this.filling || this.finished) return;
    this.filling = true;
    this.timer = window.setInterval(() => {
      if (!this.filling) return;
      this.depth = Math.min(7, this.depth + 0.12);
      if (this.depth >= 7) this.stop(true);
      else this.host.redraw();
    }, 90);
  }

  private stop(over = false): void {
    if (!this.filling) return;
    this.filling = false;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    if (over || this.depth > this.target + 0.55) {
      this.toastText = '潜太深了，浮回海面重来';
      this.depth = 0;
      this.host.redraw();
      return;
    }
    if (Math.abs(this.depth - this.target) <= 0.45) this.complete();
    else {
      this.toastText = this.depth < this.target ? '再下潜一点' : '慢一点，再试一次';
      this.host.redraw();
    }
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'confirm') { this.start(); return {}; }
    if (action === 'release' || action === 'up') { this.stop(false); return {}; }
    return {};
  }

  dispose(): void { if (this.timer !== null) window.clearInterval(this.timer); this.timer = null; this.filling = false; }
}

/* 4. 珊瑚种植 */
class CoralGame extends OceanMicrogame {
  private target = 4;
  private planted = 0;
  private slots = 5;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 3 + Math.floor(Math.random() * 3);
  }

  get info(): OceanGameInfo { return OCEAN_GAMES['ocean-4']; }

  render(): string {
    const slots = Array.from({ length: this.slots }, (_, i) => `<button class="coral-slot${this.focusClass(i)}${i < this.planted ? ' is-planted' : ''}" data-slot="${i}" aria-label="珊瑚位 ${i + 1}">
      ${i < this.planted ? coralArt(i) : '<span class="coral-empty"></span>'}
    </button>`).join('');
    return `<div class="micro-board coral-board" data-game="coral" data-planted="${this.planted}" data-target="${this.target}">
      <div class="micro-board-title">种下 <b>${this.target}</b> 株珊瑚</div>
      <div class="micro-caption">左右换位置，按 OK 种一株；种满目标就完成</div>
      <div class="coral-stage">${slots}</div>
      <div class="micro-progress">已种 <b>${this.planted}</b> / ${this.target} 株</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + this.slots - 1) % this.slots; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % this.slots; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.planted >= this.target) return {};
      if (this.cursor < this.planted) { this.toastText = '这里已经有一株珊瑚啦'; return { redraw: true }; }
      this.planted += 1;
      this.toastText = '';
      if (this.planted >= this.target) window.setTimeout(() => this.complete(), 350);
      return { redraw: true };
    }
    return {};
  }
}

/* 5. 潜艇迷宫 */
class SubmarineGame extends OceanMicrogame {
  private cols = 5;
  private grid: number[] = [];
  private step = 1;
  private sub = 0;
  private start = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.make();
  }

  get info(): OceanGameInfo { return OCEAN_GAMES['ocean-5']; }

  private make(): void {
    const n = this.cols;
    const start = Math.floor(Math.random() * n * n);
    const cells = [start];
    while (cells.length < 5) {
      const row = Math.floor(cells[cells.length - 1] / n);
      const col = cells[cells.length - 1] % n;
      const choices: number[] = [];
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = row + dr;
        const nc = col + dc;
        const idx = nr * n + nc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n && !cells.includes(idx)) choices.push(idx);
      }
      if (!choices.length) { this.make(); return; }
      cells.push(choices[Math.floor(Math.random() * choices.length)]);
    }
    this.grid = Array.from({ length: n * n }, () => 6 + Math.floor(Math.random() * 4));
    cells.forEach((cell, i) => { this.grid[cell] = i + 1; });
    this.start = start;
    this.sub = start;
  }

  render(): string {
    const tiles = this.grid.map((v, i) => `<div class="sub-tile${i === this.sub ? ' is-sub' : ''}" data-cell="${i}" data-value="${v}">${i === this.sub ? subArt() : v}</div>`).join('');
    return `<div class="micro-board sub-board" data-game="submarine" data-step="${this.step}" data-sub="${this.sub}">
      <div class="micro-board-title">潜艇按 1→5 穿过海底峡谷</div>
      <div class="micro-caption">方向键移动；走错会回到起点</div>
      <div class="sub-grid">${tiles}</div>
      <div class="micro-progress">已走过 <b>${this.step - 1}</b> / 5 格</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (!['left', 'right', 'up', 'down'].includes(action)) return {};
    const row = Math.floor(this.sub / this.cols);
    const col = this.sub % this.cols;
    const nr = row + (action === 'down' ? 1 : action === 'up' ? -1 : 0);
    const nc = col + (action === 'right' ? 1 : action === 'left' ? -1 : 0);
    if (nr < 0 || nr >= this.cols || nc < 0 || nc >= this.cols) return {};
    const next = nr * this.cols + nc;
    if (this.grid[next] !== this.step + 1) {
      this.step = 1;
      this.sub = this.start;
      this.toastText = '撞上礁石，回到起点';
      return { redraw: true };
    }
    this.sub = next;
    this.step += 1;
    this.toastText = '';
    if (this.step >= 5) return this.complete();
    return { redraw: true };
  }
}

/* 6. 水母灯 */
class JellyGame extends OceanMicrogame {
  private order: number[] = [];
  private step = 0;
  private count = 5;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.order = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);
  }

  get info(): OceanGameInfo { return OCEAN_GAMES['ocean-6']; }

  render(): string {
    const jellies = Array.from({ length: this.count }, (_, i) => {
      const isNext = this.order[this.step] === i;
      const done = this.order.slice(0, this.step).includes(i);
      return `<button class="jelly${this.focusClass(i)}${done ? ' is-lit' : ''}${isNext ? ' is-next' : ''}" data-jelly="${i}" aria-label="水母 ${i + 1}">
        ${jellyArt()}<span>${i + 1}</span>
      </button>`;
    }).join('');
    return `<div class="micro-board jelly-board" data-game="jelly" data-step="${this.step}" data-order="${this.order.join(',')}">
      <div class="micro-board-title">按提示顺序点亮水母</div>
      <div class="micro-caption">左右选水母，按 OK 点亮；顺序错就重新亮</div>
      <div class="jelly-stage">${jellies}</div>
      <div class="micro-progress">已点亮 <b>${this.step}</b> / 5 只</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + 4) % 5; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % 5; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.order[this.step] !== this.cursor) {
        this.step = 0;
        this.toastText = '顺序错了，从第一只重新点';
        return { redraw: true };
      }
      this.step += 1;
      this.toastText = '';
      if (this.step >= 5) return this.complete();
      return { redraw: true };
    }
    return {};
  }
}

/* 7. 螃蟹赛跑：左右交替横走 */
class CrabGame extends OceanMicrogame {
  private steps = 0;
  private target = 6;
  private last: 'left' | 'right' | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 5 + Math.floor(Math.random() * 3);
  }

  get info(): OceanGameInfo { return OCEAN_GAMES['ocean-7']; }

  render(): string {
    return `<div class="micro-board crab-board" data-game="crab" data-steps="${this.steps}" data-target="${this.target}" data-last="${this.last ?? ''}">
      <div class="micro-board-title">左右交替横走 <b>${this.target}</b> 步</div>
      <div class="micro-caption">不能连续走同一边；走错会退回起点</div>
      <div class="crab-stage"><div class="crab-track">${Array.from({ length: 10 }, (_, i) => `<span class="crab-dot${i < this.steps ? ' is-past' : ''}"></span>`).join('')}</div><div class="crab" style="left:${5 + this.steps * 9}%">${crabArt()}</div></div>
      <div class="micro-progress">已走 <b>${this.steps}</b> / ${this.target} 步</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action !== 'left' && action !== 'right') return {};
    if (action === this.last) {
      this.steps = 0;
      this.last = null;
      this.toastText = '不能连续走同一边，退回起点';
      return { redraw: true };
    }
    this.last = action;
    this.steps += 1;
    this.toastText = '';
    if (this.steps >= this.target) return this.complete();
    return { redraw: true };
  }
}

/* 8. 数字泡泡 */
class BubbleGame extends OceanMicrogame {
  private slots = 5;
  private caught = 0;
  private target = 5;
  private bubbles: Array<{ x: number; y: number }> = [];
  private timer: number | null = null;
  private spawnTimer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 5;
    this.bubbles.push({ x: 2, y: 260 });
    this.timer = window.setInterval(() => {
      this.bubbles = this.bubbles.map((b) => ({ x: b.x, y: b.y - 4 })).filter((b) => {
        if (b.y > -40) return true;
        if (Math.abs(b.x - this.cursor) <= 1) {
          this.caught += 1;
          if (this.caught >= this.target) this.complete();
        }
        return false;
      });
      this.host.redraw();
    }, 90);
    this.spawnTimer = window.setInterval(() => {
      if (this.finished) return;
      this.bubbles.push({ x: Math.floor(Math.random() * this.slots), y: 300 });
    }, 600);
  }

  get info(): OceanGameInfo { return OCEAN_GAMES['ocean-8']; }

  render(): string {
    const bubbles = this.bubbles.map((b) => `<span class="ocean-bubble" style="left:${b.x * 20 + 10}%;top:${b.y}px">${bubbleArt(((Math.round(b.y / 20) + b.x) % 5) + 1)}</span>`).join('');
    return `<div class="micro-board bubble-board" data-game="bubble" data-caught="${this.caught}" data-target="${this.target}">
      <div class="micro-board-title">接住 <b>${this.target}</b> 个数字泡泡</div>
      <div class="micro-caption">左右移动网兜，让泡泡升进网里</div>
      <div class="bubble-stage">${bubbles}<div class="bubble-net" style="left:${this.cursor * 20 + 10}%">${netArt()}</div><div class="bubble-floor"></div></div>
      <div class="micro-progress">已接 <b>${this.caught}</b> / ${this.target} 个</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + 4) % 5; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % 5; return { redraw: true }; }
    return {};
  }

  dispose(): void { if (this.timer !== null) window.clearInterval(this.timer); if (this.spawnTimer !== null) window.clearInterval(this.spawnTimer); this.timer = null; this.spawnTimer = null; }
}

/* 9. 藏宝图：按行列坐标挖宝 */
class TreasureGame extends OceanMicrogame {
  private targetRow = 2;
  private targetCol = 3;
  private cols = 3;
  private digs = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.targetRow = 1 + Math.floor(Math.random() * 3);
    this.targetCol = 1 + Math.floor(Math.random() * 3);
  }

  get info(): OceanGameInfo { return OCEAN_GAMES['ocean-9']; }

  render(): string {
    const cells = Array.from({ length: 9 }, (_, i) => `<button class="treasure-cell${this.focusClass(i)}" data-cell="${i}" aria-label="藏宝格 ${i + 1}">${this.cursor === i ? shovelArt() : '·'}</button>`).join('');
    return `<div class="micro-board treasure-board" data-game="treasure" data-target-row="${this.targetRow}" data-target-col="${this.targetCol}" data-cursor="${this.cursor}">
      <div class="micro-board-title">藏宝图：第 <b>${this.targetRow}</b> 行，第 <b>${this.targetCol}</b> 列</div>
      <div class="micro-caption">方向键移动铁锹，按 OK 挖宝；挖错可以再挖</div>
      <div class="treasure-grid">${cells}</div><div class="treasure-chest">${treasureChestSvg('ocean-chest-svg')}</div>
      <div class="micro-progress">已挖 <b>${this.digs}</b> 次</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    const row = Math.floor(this.cursor / this.cols);
    const col = this.cursor % this.cols;
    if (action === 'left' && col > 0) this.cursor -= 1;
    else if (action === 'right' && col < 2) this.cursor += 1;
    else if (action === 'up' && row > 0) this.cursor -= 3;
    else if (action === 'down' && row < 2) this.cursor += 3;
    else if (action === 'confirm') {
      this.digs += 1;
      if (row + 1 === this.targetRow && col + 1 === this.targetCol) return this.complete();
      this.toastText = '这里没有宝箱，再看看行列';
    } else return {};
    return { redraw: true };
  }
}

/* 10. 珍珠宫：4×4 迷宫 */
class PalaceGame extends OceanMicrogame {
  private cols = 4;
  private grid: number[] = [];
  private step = 1;
  private hero = 0;
  private start = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.make();
  }

  get info(): OceanGameInfo { return OCEAN_GAMES['ocean-10']; }

  private make(): void {
    const n = this.cols;
    const start = Math.floor(Math.random() * n * n);
    const cells = [start];
    while (cells.length < 4) {
      const row = Math.floor(cells[cells.length - 1] / n);
      const col = cells[cells.length - 1] % n;
      const choices: number[] = [];
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = row + dr;
        const nc = col + dc;
        const idx = nr * n + nc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n && !cells.includes(idx)) choices.push(idx);
      }
      if (!choices.length) { this.make(); return; }
      cells.push(choices[Math.floor(Math.random() * choices.length)]);
    }
    this.grid = Array.from({ length: n * n }, () => 5 + Math.floor(Math.random() * 5));
    cells.forEach((cell, i) => { this.grid[cell] = i + 1; });
    this.start = start;
    this.hero = start;
  }

  render(): string {
    const tiles = this.grid.map((v, i) => `<div class="palace-tile${i === this.hero ? ' is-hero' : ''}" data-cell="${i}" data-value="${v}">${i === this.hero ? shellArt() : v}</div>`).join('');
    return `<div class="micro-board palace-board" data-game="palace" data-step="${this.step}" data-hero="${this.hero}">
      <div class="micro-board-title">珍珠宫：按 1→4 走到王座</div>
      <div class="micro-caption">方向键走一格；走错回到宫门</div>
      <div class="palace-grid">${tiles}</div>
      <div class="micro-progress">已走过 <b>${this.step - 1}</b> / 4 格</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (!['left', 'right', 'up', 'down'].includes(action)) return {};
    const row = Math.floor(this.hero / this.cols);
    const col = this.hero % this.cols;
    const nr = row + (action === 'down' ? 1 : action === 'up' ? -1 : 0);
    const nc = col + (action === 'right' ? 1 : action === 'left' ? -1 : 0);
    if (nr < 0 || nr >= this.cols || nc < 0 || nc >= this.cols) return {};
    const next = nr * this.cols + nc;
    if (this.grid[next] !== this.step + 1) {
      this.step = 1;
      this.hero = this.start;
      this.toastText = '走错了，回到宫门';
      return { redraw: true };
    }
    this.hero = next;
    this.step += 1;
    this.toastText = '';
    if (this.step >= 4) return this.complete();
    return { redraw: true };
  }
}

export function createOceanGame(level: Level, host: MicroHost): OceanMicrogame | null {
  switch (oceanGameFor(level.id)?.key) {
    case 'fishing': return new FishingGame(level, host);
    case 'starfish': return new StarfishGame(level, host);
    case 'pearl': return new PearlGame(level, host);
    case 'coral': return new CoralGame(level, host);
    case 'submarine': return new SubmarineGame(level, host);
    case 'jelly': return new JellyGame(level, host);
    case 'crab': return new CrabGame(level, host);
    case 'bubble': return new BubbleGame(level, host);
    case 'treasure': return new TreasureGame(level, host);
    case 'palace': return new PalaceGame(level, host);
    default: return null;
  }
}

/* art */
function fishArt(v: number, variant = 0): string {
  if (variant === 1) return blueFishPropSvg('ocean-fish-svg', v);
  if (variant === 2) return pufferFishPropSvg('ocean-fish-svg', v);
  return clownFishSvg('ocean-fish-svg', v);
}
function fishBoat(): string { return fishingBoatSvg('ocean-boat-svg'); }
function starfishArt(): string { return starfishPropSvg('ocean-starfish-svg'); }
function shellArt(): string { return shellPropSvg('ocean-shell-svg'); }
function diverArt(): string { return diverPropSvg('ocean-diver-svg'); }
function coralArt(i: number): string { return coralPropSvg(i % 2 ? '#F27059' : '#F6A25E', 'ocean-coral-svg'); }
function subArt(): string { return submarinePropSvg('ocean-sub-svg'); }
function jellyArt(): string { return jellyfishPropSvg('ocean-jelly-svg'); }
function crabArt(): string { return crabPropSvg('ocean-crab-svg'); }
function netArt(): string { return `<svg viewBox="0 0 140 100" aria-hidden="true"><path d="M10 90 L100 20" stroke="#B87B48" stroke-width="8" stroke-linecap="round"/><ellipse cx="100" cy="24" rx="38" ry="26" transform="rotate(-35 100 24)" fill="rgba(255,255,255,0.2)" stroke="#23313F" stroke-width="4"/></svg>`; }


function shovelArt(): string {
  return `<svg class="shovel-art" viewBox="0 0 100 130" aria-hidden="true">
    <path d="M50 8 V74" stroke="#8B5E3C" stroke-width="9" stroke-linecap="round"/>
    <path d="M50 8 V74" stroke="#C9956B" stroke-width="3" stroke-linecap="round"/>
    <path d="M30 12 H70" stroke="#8B5E3C" stroke-width="8" stroke-linecap="round"/>
    <path d="M30 74 H70 L80 102 C72 122 28 122 20 102 Z" fill="#B9C7D0" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
    <path d="M50 78 V116" stroke="#8FA1AE" stroke-width="3"/>
    <path d="M26 101 C40 108 60 108 74 101" fill="none" stroke="#EAF7FF" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    <g fill="#C9956B"><circle cx="50" cy="82" r="4"/><circle cx="50" cy="96" r="3"/></g>
  </svg>`;
}
function bubbleArt(n: number): string {
  return `<svg class="bubble-art" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="52" r="38" fill="rgba(235,249,255,.28)" stroke="#EAF7FF" stroke-width="4"/>
    <path d="M25 40 C31 25 47 20 58 24" fill="none" stroke="#FFFDF7" stroke-width="5" stroke-linecap="round" opacity="0.9"/>
    <circle cx="34" cy="67" r="4" fill="#FFFDF7" opacity="0.7"/>
    <circle cx="50" cy="51" r="21" fill="rgba(255,253,247,.28)" stroke="#7FB6D9" stroke-width="2"/>
    <text x="50" y="59" text-anchor="middle" font-family="Arial Rounded MT Bold, sans-serif" font-size="27" font-weight="700" fill="#FFFDF7">${n}</text>
    <path d="M68 34 l3 7 8 1 -6 5 2 8 -7 -4 -7 4 2 -8 -6 -5 8 -1 Z" fill="#FFFDF7" opacity="0.8"/>
  </svg>`;
}
