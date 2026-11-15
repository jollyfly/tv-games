import type { Level } from '../types';
import { escapeHtml } from '../ui';
import { Microgame, type MicroAction, type MicroGameInfo, type MicroHost, type MicroResult } from './base';

export type CastleGameKey = 'mirror' | 'stars' | 'candles' | 'clock' | 'bridge' | 'gears' | 'knight' | 'windows' | 'throne' | 'dance';
export interface CastleGameInfo extends MicroGameInfo { key: CastleGameKey; }

export const CASTLE_GAMES: Record<string, CastleGameInfo> = {
  'castle-x1': { key: 'mirror', name: '镜面点灯', verb: '翻转镜子，让左右灯光和图案一样', controls: [{ icon: 'left', label: '选镜子' }, { icon: 'right', label: '选镜子' }, { icon: 'up', label: '选镜子' }, { icon: 'down', label: '选镜子' }, { icon: 'ok', label: '翻转' }, { icon: 'back', label: '回地图' }] },
  'castle-x2': { key: 'stars', name: '星座连线', verb: '按数字顺序连接星星', controls: [{ icon: 'left', label: '选星星' }, { icon: 'right', label: '选星星' }, { icon: 'ok', label: '连接' }, { icon: 'back', label: '回地图' }] },
  'castle-x3': { key: 'candles', name: '烛台计数', verb: '点亮正好目标数量的蜡烛', controls: [{ icon: 'left', label: '选蜡烛' }, { icon: 'right', label: '选蜡烛' }, { icon: 'ok', label: '点亮/熄灭' }, { icon: 'back', label: '回地图' }] },
  'castle-1': { key: 'clock', name: '钟楼指针', verb: '转动指针，停到目标钟点', controls: [{ icon: 'left', label: '往前转' }, { icon: 'right', label: '往后转' }, { icon: 'ok', label: '对时' }, { icon: 'back', label: '回地图' }] },
  'castle-2': { key: 'bridge', name: '吊桥蓄力', verb: '按住 OK 放下吊桥，到标记松手', controls: [{ icon: 'ok', label: '按住放桥' }, { icon: 'up', label: '松手' }, { icon: 'back', label: '回地图' }] },
  'castle-3': { key: 'gears', name: '城门齿轮', verb: '转动三个齿轮，把标记都转到上方', controls: [{ icon: 'left', label: '选齿轮' }, { icon: 'right', label: '选齿轮' }, { icon: 'ok', label: '转一下' }, { icon: 'back', label: '回地图' }] },
  'castle-x7': { key: 'knight', name: '骑士巡城', verb: '在城墙迷宫里按 1→5 走到塔楼', controls: [{ icon: 'left', label: '走' }, { icon: 'right', label: '走' }, { icon: 'up', label: '走' }, { icon: 'down', label: '走' }, { icon: 'back', label: '回地图' }] },
  'castle-x8': { key: 'windows', name: '塔楼寻窗', verb: '移动望远镜，找到亮灯数量正确的窗户', controls: [{ icon: 'left', label: '移望远镜' }, { icon: 'right', label: '移望远镜' }, { icon: 'up', label: '移望远镜' }, { icon: 'down', label: '移望远镜' }, { icon: 'ok', label: '查看' }, { icon: 'back', label: '回地图' }] },
  'castle-x9': { key: 'throne', name: '王座归位', verb: '交换王座，把 1、2、3 按顺序排好', controls: [{ icon: 'left', label: '选王座' }, { icon: 'right', label: '选王座' }, { icon: 'ok', label: '交换' }, { icon: 'back', label: '回地图' }] },
  'castle-x10': { key: 'dance', name: '舞会舞步', verb: '记住四个舞步，按顺序复现', controls: [{ icon: 'left', label: '舞步' }, { icon: 'right', label: '舞步' }, { icon: 'up', label: '舞步' }, { icon: 'down', label: '舞步' }, { icon: 'back', label: '回地图' }] },
};

export function castleGameFor(id: string): CastleGameInfo | null { return CASTLE_GAMES[id] ?? null; }
abstract class CastleMicrogame extends Microgame<CastleGameInfo> {}

/* 1. 镜面点灯：翻转 2×3 镜子，拼出目标亮灯图案 */
class MirrorGame extends CastleMicrogame {
  private target: boolean[] = [];
  private current: boolean[] = [];
  private cols = 3;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = Array.from({ length: 6 }, () => Math.random() > 0.45);
    this.current = Array.from({ length: 6 }, () => Math.random() > 0.5);
    if (this.target.every((v, i) => v === this.current[i])) this.current[0] = !this.current[0];
  }

  get info(): CastleGameInfo { return CASTLE_GAMES['castle-x1']; }

  render(): string {
    const target = this.target.map((on) => `<span class="mirror-dot${on ? ' is-on' : ''}"></span>`).join('');
    const tiles = this.current.map((on, i) => `<button class="mirror-tile${this.focusClass(i)}${on ? ' is-on' : ''}" data-index="${i}" data-on="${on ? 1 : 0}" aria-label="镜子 ${i + 1}">
      ${mirrorArt()}
    </button>`).join('');
    return `<div class="micro-board mirror-board" data-game="mirror" data-target="${this.target.map(Number).join('')}" data-current="${this.current.map(Number).join('')}">
      <div class="micro-board-title">把灯光拼成上面的图案</div>
      <div class="micro-caption">方向键选镜子，按 OK 翻转；亮灯要完全一致</div>
      <div class="mirror-pattern">${target}</div>
      <div class="mirror-grid">${tiles}</div>
      <div class="micro-progress">已对齐 <b>${this.current.filter((v, i) => v === this.target[i]).length}</b> / 6 面</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    const row = Math.floor(this.cursor / this.cols);
    const col = this.cursor % this.cols;
    if (action === 'left' && col > 0) this.cursor -= 1;
    else if (action === 'right' && col < 2) this.cursor += 1;
    else if (action === 'up' && row > 0) this.cursor -= 3;
    else if (action === 'down' && row < 1) this.cursor += 3;
    else if (action === 'confirm') {
      this.current[this.cursor] = !this.current[this.cursor];
      this.toastText = '';
      if (this.target.every((v, i) => v === this.current[i])) window.setTimeout(() => this.complete(), 320);
    } else return {};
    return { redraw: true };
  }
}

/* 2. 星座连线：按 1→5 连接星星，点错重来 */
class StarsGame extends CastleMicrogame {
  private numbers: number[] = [];
  private step = 1;
  private connected = new Set<number>();

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.numbers = Array.from({ length: 5 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
  }

  get info(): CastleGameInfo { return CASTLE_GAMES['castle-x2']; }

  render(): string {
    const stars = this.numbers.map((value, i) => `<button class="star-node${this.focusClass(i)}${this.connected.has(i) ? ' is-connected' : ''}" data-node="${i}" data-number="${value}" aria-label="星星 ${value}">
      <span class="star-node-shape">${starSvg()}</span><span class="star-node-number">${value}</span>
    </button>`).join('');
    return `<div class="micro-board stars-board" data-game="stars" data-step="${this.step}" data-numbers="${this.numbers.join(',')}">
      <div class="micro-board-title">按 1 → 5 把星星连起来</div>
      <div class="micro-caption">左右选星星，按 OK 连接；连错就重新来</div>
      <div class="star-line">${stars}</div>
      <div class="micro-progress">已连 <b>${this.step - 1}</b> / 5 颗</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + 4) % 5; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % 5; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.numbers[this.cursor] !== this.step) {
        this.step = 1;
        this.connected = new Set();
        this.toastText = '连错了，从第 1 颗重新来';
        return { redraw: true };
      }
      this.connected.add(this.cursor);
      this.step += 1;
      this.toastText = '';
      if (this.step > 5) return this.complete();
      return { redraw: true };
    }
    return {};
  }
}

/* 3. 烛台计数：点亮正好目标数量 */
class CandlesGame extends CastleMicrogame {
  private lit = new Set<number>();
  private target = 4;
  private count = 7;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 3 + Math.floor(Math.random() * 4);
  }

  get info(): CastleGameInfo { return CASTLE_GAMES['castle-x3']; }

  render(): string {
    const candles = Array.from({ length: this.count }, (_, i) => `<button class="candle${this.focusClass(i)}${this.lit.has(i) ? ' is-lit' : ''}" data-candle="${i}" aria-label="蜡烛 ${i + 1}">
      <span class="candle-flame">${this.lit.has(i) ? flame() : ''}</span><span class="candle-wax"></span>
    </button>`).join('');
    return `<div class="micro-board candles-board" data-game="candles" data-target="${this.target}" data-lit="${this.lit.size}">
      <div class="micro-board-title">点亮正好 <b>${this.target}</b> 根蜡烛</div>
      <div class="micro-caption">左右选蜡烛，按 OK 点亮；再按一次熄灭</div>
      <div class="candles-stage">${candles}</div>
      <div class="micro-progress">已点亮 <b>${this.lit.size}</b> / ${this.target} 根</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + this.count - 1) % this.count; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % this.count; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.lit.has(this.cursor)) this.lit.delete(this.cursor);
      else if (this.lit.size < this.target) this.lit.add(this.cursor);
      else { this.toastText = '已经够亮了，先熄灭一根'; return { redraw: true }; }
      this.toastText = '';
      if (this.lit.size === this.target) window.setTimeout(() => this.complete(), 300);
      return { redraw: true };
    }
    return {};
  }
}

/* 4. 钟楼指针：转动指针到目标钟点 */
class ClockGame extends CastleMicrogame {
  private target = 3;
  private hour = 1;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 1 + Math.floor(Math.random() * 6);
  }

  get info(): CastleGameInfo { return CASTLE_GAMES['castle-1']; }

  render(): string {
    const angle = this.hour * 30;
    return `<div class="micro-board clock-board" data-game="clock" data-target="${this.target}" data-hour="${this.hour}">
      <div class="micro-board-title">把钟楼指针转到 <b>${this.target}</b> 点</div>
      <div class="micro-caption">左右转动指针，按 OK 对时</div>
      <div class="clock-stage"><div class="clock-face">${clockNumerals()}<div class="clock-hand" style="transform:rotate(${angle}deg)"></div><div class="clock-centre"></div></div></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.hour = this.hour === 1 ? 6 : this.hour - 1; return { redraw: true }; }
    if (action === 'right') { this.hour = this.hour === 6 ? 1 : this.hour + 1; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.hour === this.target) return this.complete();
      this.toastText = '还没到目标钟点，再转一转';
      return { redraw: true };
    }
    return {};
  }
}

/* 5. 吊桥蓄力：按住 OK 放桥到标记线 */
class DrawbridgeGame extends CastleMicrogame {
  private target = 4;
  private bridgeLevel = 0;
  private filling = false;
  private timer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 3 + Math.floor(Math.random() * 3);
  }

  get info(): CastleGameInfo { return CASTLE_GAMES['castle-2']; }

  render(): string {
    const angle = -78 + this.bridgeLevel / 7 * 78;
    return `<div class="micro-board drawbridge-board" data-game="drawbridge" data-target="${this.target}" data-level="${this.bridgeLevel.toFixed(2)}">
      <div class="micro-board-title">放下吊桥，到第 <b>${this.target}</b> 格</div>
      <div class="micro-caption">按住 OK 放桥，到标记线松手；放过头会收回</div>
      <div class="drawbridge-stage">
        <div class="castle-gate">${castleGate()}</div>
        <div class="drawbridge" style="transform:rotate(${angle}deg)">${bridgePlanks()}</div>
        <div class="drawbridge-marker" style="bottom:${this.target / 7 * 100}%"><span>${this.target}</span></div>
        <div class="drawbridge-moat"></div>
      </div>
      <div class="micro-progress">桥面 <b>${this.bridgeLevel.toFixed(1)}</b> / ${this.target}</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  private start(): void {
    if (this.filling || this.finished) return;
    this.filling = true;
    this.timer = window.setInterval(() => {
      if (!this.filling) return;
      this.bridgeLevel = Math.min(7, this.bridgeLevel + 0.12);
      if (this.bridgeLevel >= 7) this.stop(true);
      else this.host.redraw();
    }, 90);
  }

  private stop(over = false): void {
    if (!this.filling) return;
    this.filling = false;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    if (over || this.bridgeLevel > this.target + 0.55) {
      this.toastText = '放过头了，吊桥收回重来';
      this.bridgeLevel = 0;
      this.host.redraw();
      return;
    }
    if (Math.abs(this.bridgeLevel - this.target) <= 0.45) this.complete();
    else {
      this.toastText = this.bridgeLevel < this.target ? '还差一点，再按住 OK' : '慢一点，再试一次';
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

/* 6. 城门齿轮：旋转三个齿轮，让标记朝上 */
class GearsGame extends CastleMicrogame {
  private gears: number[] = [1, 2, 3];

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.gears = Array.from({ length: 3 }, () => [1, 2, 3][Math.floor(Math.random() * 3)]);
  }

  get info(): CastleGameInfo { return CASTLE_GAMES['castle-3']; }

  render(): string {
    const gears = this.gears.map((o, i) => `<button class="gear${this.focusClass(i)}" data-gear="${i}" data-orientation="${o}" aria-label="齿轮 ${i + 1}">
      <span class="gear-wheel" style="transform:rotate(${o * 30}deg)">${gearArt()}</span>
    </button>`).join('');
    return `<div class="micro-board gears-board" data-game="gears" data-gears="${this.gears.join(',')}">
      <div class="micro-board-title">转动三个齿轮，让金色标记朝上</div>
      <div class="micro-caption">左右选齿轮，按 OK 转一格；三个都朝上就开门</div>
      <div class="gears-stage">${gears}</div>
      <div class="micro-progress">已对齐 <b>${this.gears.filter((g) => g === 0).length}</b> / 3 个</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + 2) % 3; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % 3; return { redraw: true }; }
    if (action === 'confirm') {
      this.gears[this.cursor] = (this.gears[this.cursor] + 1) % 4;
      if (this.gears.every((g) => g === 0)) window.setTimeout(() => this.complete(), 320);
      return { redraw: true };
    }
    return {};
  }
}

/* 7. 骑士巡城：城墙迷宫按数字顺序走到塔楼 */
class KnightMazeGame extends CastleMicrogame {
  private cols = 5;
  private grid: number[] = [];
  private path: number[] = [];
  private step = 1;
  private knight = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.makeMaze();
  }

  get info(): CastleGameInfo { return CASTLE_GAMES['castle-x7']; }

  private makeMaze(): void {
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
      if (!choices.length) { this.makeMaze(); return; }
      cells.push(choices[Math.floor(Math.random() * choices.length)]);
    }
    this.grid = Array.from({ length: n * n }, () => 6 + Math.floor(Math.random() * 4));
    cells.forEach((cell, i) => { this.grid[cell] = i + 1; });
    this.path = cells;
    this.knight = start;
  }

  render(): string {
    const tiles = this.grid.map((value, i) => `<div class="knight-tile${i === this.knight ? ' is-knight' : ''}" data-cell="${i}" data-value="${value}">${i === this.knight ? knightArt() : value}</div>`).join('');
    return `<div class="micro-board knight-board" data-game="knight" data-step="${this.step}" data-knight="${this.knight}">
      <div class="micro-board-title">骑士巡城：按 1→5 走到塔楼</div>
      <div class="micro-caption">方向键走一格；走错就回到城门，没有提示</div>
      <div class="knight-grid">${tiles}</div>
      <div class="micro-progress">已走过 <b>${this.step - 1}</b> / 5 格</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (!['left', 'right', 'up', 'down'].includes(action)) return {};
    const row = Math.floor(this.knight / this.cols);
    const col = this.knight % this.cols;
    const nr = row + (action === 'down' ? 1 : action === 'up' ? -1 : 0);
    const nc = col + (action === 'right' ? 1 : action === 'left' ? -1 : 0);
    if (nr < 0 || nr >= this.cols || nc < 0 || nc >= this.cols) return {};
    const next = nr * this.cols + nc;
    if (this.grid[next] !== this.step + 1) {
      this.step = 1;
      this.knight = this.path[0];
      this.toastText = '走错路了，回到城门';
      this.host.toast('走错了，回城门');
      return { redraw: true };
    }
    this.knight = next;
    this.step += 1;
    this.toastText = '';
    if (this.step >= 5) return this.complete();
    return { redraw: true };
  }
}

/* 8. 塔楼寻窗：找到亮灯数量正确的窗户 */
class WindowsGame extends CastleMicrogame {
  private target = 4;
  private windows: number[] = [];
  private cols = 3;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 2 + Math.floor(Math.random() * 3);
    this.windows = Array.from({ length: 9 }, () => 1 + Math.floor(Math.random() * 4));
    if (!this.windows.includes(this.target)) this.windows[4] = this.target;
  }

  get info(): CastleGameInfo { return CASTLE_GAMES['castle-x8']; }

  render(): string {
    const wins = this.windows.map((n, i) => `<button class="castle-window${this.focusClass(i)}" data-window="${i}" data-lights="${n}" aria-label="窗户 ${i + 1}">
      <span class="window-frame">${Array.from({ length: n }, (_, k) => `<i style="--i:${k}"></i>`).join('')}</span>
    </button>`).join('');
    return `<div class="micro-board windows-board" data-game="windows" data-target="${this.target}">
      <div class="micro-board-title">用望远镜找：哪扇窗亮着 <b>${this.target}</b> 盏灯</div>
      <div class="micro-caption">方向键移望远镜，按 OK 查看</div>
      <div class="windows-grid">${wins}</div>
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
      if (this.windows[this.cursor] === this.target) return this.complete();
      this.toastText = '这扇窗的灯数不对，再看看';
      return { redraw: true };
    } else return {};
    return { redraw: true };
  }
}

/* 9. 王座归位：交换相邻王座，把 1、2、3 排好 */
class ThroneGame extends CastleMicrogame {
  private order: number[] = [];

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.order = [1, 2, 3].sort(() => Math.random() - 0.5);
    if (this.order.join('') === '123') this.order = [2, 1, 3];
  }

  get info(): CastleGameInfo { return CASTLE_GAMES['castle-x9']; }

  render(): string {
    const thrones = this.order.map((n, i) => `<button class="throne${this.focusClass(i)}" data-throne="${i}" data-number="${n}" aria-label="王座 ${n}">
      ${throneArt()}<span class="throne-number">${n}</span>
    </button>`).join('');
    return `<div class="micro-board throne-board" data-game="throne" data-order="${this.order.join(',')}">
      <div class="micro-board-title">把王座排成 1 · 2 · 3</div>
      <div class="micro-caption">左右选王座，按 OK 和右边的王座交换位置</div>
      <div class="thrones-stage">${thrones}</div>
      <div class="micro-progress">当前顺序 <b>${this.order.join(' · ')}</b></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = Math.max(0, this.cursor - 1); return { redraw: true }; }
    if (action === 'right') { this.cursor = Math.min(2, this.cursor + 1); return { redraw: true }; }
    if (action === 'confirm') {
      const other = this.cursor === 2 ? 0 : this.cursor + 1;
      [this.order[this.cursor], this.order[other]] = [this.order[other], this.order[this.cursor]];
      this.toastText = '';
      if (this.order.join('') === '123') return this.complete();
      return { redraw: true };
    }
    return {};
  }
}

/* 10. 舞会舞步：复现四步舞步 */
class DanceGame extends CastleMicrogame {
  private pattern: Array<'left' | 'right' | 'up' | 'down'> = [];
  private entered = 0;
  private lock = false;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    const all: Array<'left' | 'right' | 'up' | 'down'> = ['left', 'right', 'up', 'down'];
    this.pattern = Array.from({ length: 4 }, () => all[Math.floor(Math.random() * all.length)]);
  }

  get info(): CastleGameInfo { return CASTLE_GAMES['castle-x10']; }

  render(): string {
    const icons: Record<string, string> = { left: '←', right: '→', up: '↑', down: '↓' };
    const pattern = this.pattern.map((p, i) => `<span class="dance-step${i < this.entered ? ' is-done' : ''}">${icons[p]}</span>`).join('');
    return `<div class="micro-board dance-board" data-game="dance" data-pattern="${this.pattern.join(',')}" data-entered="${this.entered}">
      <div class="micro-board-title">记住舞步，跟着跳一遍</div>
      <div class="micro-caption">按上面的方向顺序按方向键；跳错从头再来</div>
      <div class="dance-pattern">${pattern}</div>
      <div class="dance-stage">${danceStar()}<span class="dance-count">${this.entered} / 4</span></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (this.lock) return {};
    if (!['left', 'right', 'up', 'down'].includes(action)) return {};
    if (action !== this.pattern[this.entered]) {
      this.entered = 0;
      this.toastText = '舞步错啦，从头再跳';
      return { redraw: true };
    }
    this.entered += 1;
    this.toastText = '';
    if (this.entered >= this.pattern.length) {
      this.lock = true;
      window.setTimeout(() => this.complete(), 300);
    }
    return { redraw: true };
  }
}

export function createCastleGame(level: Level, host: MicroHost): CastleMicrogame | null {
  switch (castleGameFor(level.id)?.key) {
    case 'mirror': return new MirrorGame(level, host);
    case 'stars': return new StarsGame(level, host);
    case 'candles': return new CandlesGame(level, host);
    case 'clock': return new ClockGame(level, host);
    case 'bridge': return new DrawbridgeGame(level, host);
    case 'gears': return new GearsGame(level, host);
    case 'knight': return new KnightMazeGame(level, host);
    case 'windows': return new WindowsGame(level, host);
    case 'throne': return new ThroneGame(level, host);
    case 'dance': return new DanceGame(level, host);
    default: return null;
  }
}

function mirrorArt(): string {
  return `<svg class="mirror-art" viewBox="0 0 120 140" aria-hidden="true">
    <path d="M60 6 L108 42 V98 L60 134 L12 98 V42 Z" fill="#8E7CC3" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
    <path d="M60 16 L98 46 V94 L60 122 L22 94 V46 Z" fill="#FFE7A0" stroke="#23313F" stroke-width="3"/>
    <path d="M60 25 L88 50 V90 L60 112 L32 90 V50 Z" fill="#DCEBFA" stroke="#23313F" stroke-width="3"/>
    <path d="M42 48 C50 34 70 34 80 46 C70 48 58 54 50 64 C45 60 42 54 42 48 Z" fill="rgba(255,255,255,.8)"/>
    <path d="M38 82 C46 72 54 68 66 64" fill="none" stroke="#FFFDF7" stroke-width="4" stroke-linecap="round"/>
    <g fill="#FFFDF7"><path d="M25 34 l3 7 8 1 -6 5 2 8 -7 -4 -7 4 2 -8 -6 -5 8 -1 Z"/><path d="M94 88 l2 5 6 1 -4 4 1 6 -5 -3 -5 3 1 -6 -4 -4 6 -1 Z"/></g>
    <circle cx="60" cy="6" r="6" fill="#FFC94A" stroke="#23313F" stroke-width="2.5"/>
  </svg>`;
}
function starSvg(): string {
  return `<svg class="castle-star" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="52" r="42" fill="#FFE7A0" opacity="0.25"/>
    <path d="M50 6 L62 36 L94 38 L69 58 L78 90 L50 72 L22 90 L31 58 L6 38 L38 36 Z" fill="#FFC94A" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
    <path d="M50 20 L58 42 L80 43 L62 57 L68 78 L50 65 L32 78 L38 57 L20 43 L42 42 Z" fill="#FFE49B"/>
    <path d="M50 32 L54 46 L68 47 L57 55 L61 68 L50 60 L39 68 L43 55 L32 47 L46 46 Z" fill="#FFF8D8" opacity="0.9"/>
  </svg>`;
}
function flame(): string {
  return `<svg class="castle-flame" viewBox="0 0 48 70" aria-hidden="true">
    <path d="M24 4 C8 24 4 34 10 48 C14 58 34 58 38 48 C44 34 34 18 24 4 Z" fill="#F28C6E" stroke="#23313F" stroke-width="3"/>
    <path d="M24 18 C14 32 14 42 22 50 C16 52 12 46 12 39 C12 28 18 22 24 18 Z" fill="#FFC94A"/>
    <path d="M25 34 C19 41 19 47 25 52 C31 47 31 41 25 34 Z" fill="#FFFDF7"/>
    <circle cx="22" cy="44" r="2" fill="#FFC94A" opacity="0.8"/>
  </svg>`;
}
function castleGate(): string {
  return `<svg class="castle-gate-art" viewBox="0 0 260 280" aria-hidden="true">
    <path d="M24 270 V100 L56 74 L82 100 L108 66 L134 100 L160 74 L186 100 L236 72 V270 Z" fill="#B9C7D0" stroke="#23313F" stroke-width="5"/>
    <g fill="none" stroke="#8FA1AE" stroke-width="2" opacity="0.9">
      <path d="M34 126 H226 M34 162 H226 M34 198 H226 M34 234 H226"/>
      <path d="M66 100 V270 M98 100 V270 M130 100 V270 M162 100 V270 M194 100 V270"/>
    </g>
    <path d="M88 270 V166 C88 128 172 128 172 166 V270 Z" fill="#3E5263" stroke="#23313F" stroke-width="5"/>
    <g stroke="#B9C7D0" stroke-width="5"><path d="M100 270 V160 M120 270 V152 M140 270 V152 M160 270 V160"/><path d="M92 188 H168 M92 214 H168 M92 240 H168"/></g>
    <path d="M42 102 V190 L62 172 V102 Z" fill="#F28C6E" stroke="#23313F" stroke-width="3"/>
    <path d="M218 102 V190 L198 172 V102 Z" fill="#FFC94A" stroke="#23313F" stroke-width="3"/>
    <g fill="#FFFDF7"><path d="M50 124 l3 8 9 1 -7 6 2 9 -7 -5 -8 5 2 -9 -7 -6 9 -1 Z"/><path d="M208 126 l3 8 9 1 -7 6 2 9 -7 -5 -8 5 2 -9 -7 -6 9 -1 Z"/></g>
    <path d="M20 270 H240" stroke="#23313F" stroke-width="7" stroke-linecap="round"/>
  </svg>`;
}
function bridgePlanks(): string {
  return `<svg class="bridge-planks-art" viewBox="0 0 300 80" aria-hidden="true">
    <path d="M0 20 C32 4 60 30 90 16 C120 2 150 28 180 14 C210 0 240 26 270 12 C284 6 294 10 300 16" fill="none" stroke="#8B5E3C" stroke-width="5"/>
    <rect y="20" width="300" height="56" rx="8" fill="#B87B48" stroke="#23313F" stroke-width="4"/>
    <g fill="#DDBB83" opacity="0.8"><rect x="8" y="28" width="62" height="40" rx="4"/><rect x="76" y="28" width="64" height="40" rx="4"/><rect x="146" y="28" width="64" height="40" rx="4"/><rect x="216" y="28" width="76" height="40" rx="4"/></g>
    <g stroke="#8B5E3C" stroke-width="2" opacity="0.75"><path d="M12 40 H68 M14 50 H66 M80 40 H136 M82 50 H134 M150 40 H206 M152 50 H204 M220 40 H286 M222 50 H284"/></g>
    <g fill="#23313F"><circle cx="22" cy="30" r="3"/><circle cx="278" cy="30" r="3"/><circle cx="22" cy="68" r="3"/><circle cx="278" cy="68" r="3"/></g>
    <path d="M0 20 C20 10 36 12 48 20 M252 20 C268 10 286 10 300 18" fill="none" stroke="#C9956B" stroke-width="3"/>
  </svg>`;
}
function gearArt(): string {
  return `<svg class="gear-art" viewBox="0 0 180 180" aria-hidden="true">
    <g fill="#D9C58A" stroke="#23313F" stroke-width="4" stroke-linejoin="round">
      <path d="M90 6 L102 28 L126 20 L126 46 L152 56 L136 78 L152 102 L126 112 L126 138 L102 130 L90 154 L78 130 L54 138 L54 112 L28 102 L44 80 L28 56 L54 46 L54 20 L78 28 Z"/>
      <circle cx="90" cy="80" r="42"/>
    </g>
    <circle cx="90" cy="80" r="29" fill="#FFF8E8" stroke="#23313F" stroke-width="4"/>
    <circle cx="90" cy="80" r="10" fill="#23313F"/>
    <g stroke="#B59A5F" stroke-width="5" stroke-linecap="round"><path d="M90 53 V67 M90 93 V107 M63 80 H77 M103 80 H117 M71 61 L81 71 M99 89 L109 99 M109 61 L99 71 M81 89 L71 99"/></g>
    <path d="M90 28 V46" stroke="#F28C6E" stroke-width="8" stroke-linecap="round"/>
  </svg>`;
}
function knightArt(): string {
  return `<svg class="knight-art" viewBox="0 0 120 150" aria-hidden="true">
    <path d="M60 8 C44 8 34 20 34 36 V52 C34 58 39 64 46 66 L44 82 C30 88 22 104 20 124 H100 C98 104 90 88 76 82 L74 66 C81 64 86 58 86 52 V36 C86 20 76 8 60 8 Z" fill="#B9C7D0" stroke="#23313F" stroke-width="4"/>
    <path d="M44 36 C48 24 72 24 76 36 V48 H44 Z" fill="#8FA1AE" stroke="#23313F" stroke-width="3"/>
    <path d="M44 44 H76" stroke="#23313F" stroke-width="4"/>
    <g fill="#23313F"><circle cx="50" cy="44" r="3"/><circle cx="70" cy="44" r="3"/></g>
    <path d="M56 56 C52 62 52 68 58 72 M64 56 C68 62 68 68 62 72" fill="none" stroke="#23313F" stroke-width="3" stroke-linecap="round"/>
    <path d="M34 82 C26 92 22 106 22 122 H98 C98 106 94 92 86 82" fill="none" stroke="#23313F" stroke-width="4"/>
    <path d="M60 82 V122 M40 98 H80" stroke="#23313F" stroke-width="3" opacity="0.5"/>
    <path d="M76 20 C90 10 98 14 100 26 C94 34 84 34 78 28 Z" fill="#F28C6E" stroke="#23313F" stroke-width="3"/>
    <path d="M34 124 L22 146 M86 124 L98 146" stroke="#23313F" stroke-width="5" stroke-linecap="round"/>
    <path d="M60 96 l5 8 9 1 -7 6 2 9 -9 -5 -9 5 2 -9 -7 -6 9 -1 Z" fill="#FFC94A" stroke="#23313F" stroke-width="2"/>
  </svg>`;
}
function throneArt(): string {
  return `<svg class="throne-art" viewBox="0 0 180 220" aria-hidden="true">
    <path d="M30 200 V62 C30 30 60 16 90 16 C120 16 150 30 150 62 V200 Z" fill="#8E7CC3" stroke="#23313F" stroke-width="5"/>
    <path d="M44 194 V78 C44 56 64 44 90 44 C116 44 136 56 136 78 V194" fill="#FFE7A0" stroke="#23313F" stroke-width="4"/>
    <path d="M56 188 V92 C56 76 70 66 90 66 C110 66 124 76 124 92 V188" fill="#D96C78" stroke="#23313F" stroke-width="3"/>
    <path d="M64 118 C72 104 108 104 116 118 L116 166 C102 176 78 176 64 166 Z" fill="#F6C7B9" stroke="#23313F" stroke-width="3"/>
    <g fill="#FFC94A" stroke="#23313F" stroke-width="2"><circle cx="58" cy="60" r="7"/><circle cx="122" cy="60" r="7"/></g>
    <path d="M90 20 l7 15 17 2 -13 11 4 17 -15 -8 -15 8 4 -17 -13 -11 17 -2 Z" fill="#FFC94A" stroke="#23313F" stroke-width="3"/>
    <path d="M24 200 H156" stroke="#23313F" stroke-width="8" stroke-linecap="round"/>
    <path d="M38 208 H142" stroke="#B9875B" stroke-width="8" stroke-linecap="round"/>
  </svg>`;
}
function danceStar(): string {
  return `<svg class="dance-star-art" viewBox="0 0 260 240" aria-hidden="true">
    <circle cx="130" cy="116" r="96" fill="#FFE7A0" opacity="0.22"/>
    <path d="M130 14 L154 78 L222 82 L168 124 L188 190 L130 152 L72 190 L92 124 L38 82 L106 78 Z" fill="#FFC94A" stroke="#23313F" stroke-width="5" stroke-linejoin="round"/>
    <path d="M130 38 L146 82 L194 85 L156 113 L170 158 L130 132 L90 158 L104 113 L66 85 L114 82 Z" fill="#FFE49B"/>
    <circle cx="112" cy="104" r="7" fill="#23313F"/><circle cx="148" cy="104" r="7" fill="#23313F"/>
    <circle cx="109" cy="100" r="2.5" fill="#FFFDF7"/><circle cx="145" cy="100" r="2.5" fill="#FFFDF7"/>
    <path d="M118 126 q12 10 24 0" fill="none" stroke="#23313F" stroke-width="4" stroke-linecap="round"/>
    <path d="M98 142 C82 154 72 166 68 184 M162 142 C178 154 188 166 192 184" stroke="#23313F" stroke-width="5" stroke-linecap="round"/>
    <path d="M56 186 C70 190 82 186 88 178 M184 186 C198 190 210 186 216 178" fill="#F28C6E" stroke="#23313F" stroke-width="3"/>
    <g fill="#FFFDF7"><path d="M198 40 l3 8 9 1 -7 6 2 9 -7 -5 -8 5 2 -9 -7 -6 9 -1 Z"/><path d="M42 54 l2 6 7 1 -5 5 1 6 -5 -3 -6 3 1 -6 -5 -5 7 -1 Z"/></g>
  </svg>`;
}

function clockNumerals(): string { return Array.from({ length: 6 }, (_, i) => `<span class="clock-number" style="--n:${i + 1}">${i + 1}</span>`).join(''); }


