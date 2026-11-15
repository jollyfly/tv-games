import type { Level } from '../types';
import { escapeHtml } from '../ui';
import { Microgame, type MicroAction, type MicroGameInfo, type MicroHost, type MicroResult } from './base';

export type SpaceGameKey = 'orbit' | 'asteroid' | 'starmap' | 'hatch' | 'satellite' | 'gravity' | 'alien' | 'fuel' | 'warp' | 'launch';
export interface SpaceGameInfo extends MicroGameInfo { key: SpaceGameKey; }
const L = (label: string) => ({ icon: 'left' as const, label });
const R = (label: string) => ({ icon: 'right' as const, label });
const U = (label: string) => ({ icon: 'up' as const, label });
const D = (label: string) => ({ icon: 'down' as const, label });
const OK = (label: string) => ({ icon: 'ok' as const, label });
const BACK = { icon: 'back' as const, label: '回地图' };
const mk = (key: SpaceGameKey, name: string, verb: string, controls: SpaceGameInfo['controls']): SpaceGameInfo => ({ key, name, verb, controls });

export const SPACE_GAMES: Record<string, SpaceGameInfo> = {
  'space-x1': mk('orbit', '轨道对接', '等火箭转到绿色接口时按 OK 对接', [OK('对接'), BACK]),
  'space-x2': mk('asteroid', '陨石闪避', '左右移动飞船，躲陨石捡三颗星', [L('移动'), R('移动'), OK('捡星'), BACK]),
  'space-x3': mk('starmap', '星图坐标', '按行和列找到目标星球', [L('移'), R('移'), U('移'), D('移'), OK('定位'), BACK]),
  'space-x4': mk('hatch', '舱门密码', '按顺序输入四向密码', [L('输入'), R('输入'), U('输入'), D('输入'), BACK]),
  'space-x5': mk('satellite', '卫星维修', '转动三块太阳能板，让标记朝上', [L('选面板'), R('选面板'), OK('转一下'), BACK]),
  'space-x6': mk('gravity', '重力选择', '选一个重力方向，把星球吸到目标轨道', [L('左'), R('右'), U('上'), D('下'), BACK]),
  'space-x7': mk('alien', '外星记忆', '翻牌配对，找到三对星球朋友', [L('选牌'), R('选牌'), U('选牌'), D('选牌'), OK('翻牌'), BACK]),
  'space-x8': mk('fuel', '燃料加注', '按住 OK 加燃料，到目标刻度松手', [OK('按住加注'), U('松手'), BACK]),
  'space-x9': mk('warp', '星门迷宫', '5×5 星门迷宫按 1→5 走到出口', [L('走'), R('走'), U('走'), D('走'), BACK]),
  'space-x10': mk('launch', '最终发射', '按发射序列依次按下四个按钮', [L('选按钮'), R('选按钮'), U('选按钮'), D('选按钮'), BACK]),
};

export function spaceGameFor(id: string): SpaceGameInfo | null { return SPACE_GAMES[id] ?? null; }
abstract class SpaceMicrogame extends Microgame<SpaceGameInfo> {}

/* 1. 轨道对接 */
class OrbitGame extends SpaceMicrogame {
  private angle = 0;
  private target = 0;
  private timer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 30 + Math.floor(Math.random() * 300);
    this.timer = window.setInterval(() => {
      if (this.finished) return;
      this.angle = (this.angle + 4) % 360;
      this.host.redraw();
    }, 70);
  }

  get info(): SpaceGameInfo { return SPACE_GAMES['space-x1']; }

  render(): string {
    return `<div class="micro-board orbit-board" data-game="orbit" data-angle="${this.angle}" data-target="${this.target}">
      <div class="micro-board-title">让火箭对准绿色接口</div>
      <div class="micro-caption">火箭绕星球转，转到绿色接口时按 OK 对接</div>
      <div class="orbit-stage"><div class="orbit-ring"></div><div class="orbit-target" style="transform:rotate(${this.target}deg) translateY(-170px)"></div><div class="orbit-rocket" style="transform:rotate(${this.angle}deg) translateY(-170px)">${rocketArt()}</div><div class="orbit-planet">${planetArt()}</div></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action !== 'confirm') return {};
    const diff = Math.abs(((this.angle - this.target + 540) % 360) - 180);
    if (diff < 18) return this.complete();
    this.toastText = '还没对准接口，再等一圈';
    return { redraw: true };
  }

  dispose(): void { if (this.timer !== null) window.clearInterval(this.timer); this.timer = null; }
}

/* 2. 陨石闪避 */
class AsteroidGame extends SpaceMicrogame {
  private stars = new Set<number>();
  private rocks = new Set<number>();
  private collected = 0;
  private timer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.rocks.add(1);
    this.stars.add(3);
    this.timer = window.setInterval(() => {
      if (this.finished) return;
      this.rocks = new Set(Array.from({ length: 1 + Math.floor(Math.random() * 2) }, () => Math.floor(Math.random() * 5)));
      if (Math.random() > 0.5) this.stars.add(Math.floor(Math.random() * 5));
      if (this.rocks.has(this.cursor)) {
        this.collected = 0;
        this.stars.clear();
        this.toastText = '撞到陨石，星星掉了';
      }
      this.host.redraw();
    }, 1000);
  }

  get info(): SpaceGameInfo { return SPACE_GAMES['space-x2']; }

  render(): string {
    const lanes = Array.from({ length: 5 }, (_, i) => `<div class="asteroid-lane${i === this.cursor ? ' is-focused' : ''}${this.rocks.has(i) ? ' is-rock' : ''}" data-lane="${i}">${this.rocks.has(i) ? rockArt() : ''}${this.stars.has(i) ? `<span class="asteroid-star">${starArt()}</span>` : ''}<div class="asteroid-ground"></div></div>`).join('');
    return `<div class="micro-board asteroid-board" data-game="asteroid" data-collected="${this.collected}" data-target="3">
      <div class="micro-board-title">躲开陨石，捡 <b>3</b> 颗星</div>
      <div class="micro-caption">左右移动；陨石落下时别在那一格，站着按 OK 捡星</div>
      <div class="asteroid-stage">${lanes}<div class="asteroid-ship" style="left:${this.cursor * 20 + 10}%">${rocketArt()}</div></div>
      <div class="micro-progress">已捡 <b>${this.collected}</b> / 3 颗</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + 4) % 5; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % 5; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.stars.has(this.cursor) && !this.rocks.has(this.cursor)) {
        this.stars.delete(this.cursor);
        this.collected += 1;
        if (this.collected >= 3) return this.complete();
        return { redraw: true };
      }
      this.toastText = '这里没有星星';
      return { redraw: true };
    }
    return {};
  }

  dispose(): void { if (this.timer !== null) window.clearInterval(this.timer); this.timer = null; }
}

/* 3. 星图坐标 */
class StarMapGame extends SpaceMicrogame {
  private targetRow = 2;
  private targetCol = 2;
  private cols = 3;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.targetRow = 1 + Math.floor(Math.random() * 3);
    this.targetCol = 1 + Math.floor(Math.random() * 3);
  }

  get info(): SpaceGameInfo { return SPACE_GAMES['space-x3']; }

  render(): string {
    const cells = Array.from({ length: 9 }, (_, i) => `<button class="starmap-cell${this.focusClass(i)}" data-cell="${i}" aria-label="星图格 ${i + 1}">${this.cursor === i ? planetArt() : '·'}</button>`).join('');
    return `<div class="micro-board starmap-board" data-game="starmap" data-target-row="${this.targetRow}" data-target-col="${this.targetCol}" data-cursor="${this.cursor}">
      <div class="micro-board-title">星图：第 <b>${this.targetRow}</b> 行，第 <b>${this.targetCol}</b> 列</div>
      <div class="micro-caption">方向键移望远镜，按 OK 定位；错了可以再找</div>
      <div class="starmap-grid">${cells}</div>
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
      if (row + 1 === this.targetRow && col + 1 === this.targetCol) return this.complete();
      this.toastText = '坐标不对，再看看行列';
    } else return {};
    return { redraw: true };
  }
}

/* 4. 舱门密码 */
class HatchCodeGame extends SpaceMicrogame {
  private pattern: Array<'left' | 'right' | 'up' | 'down'> = [];
  private entered = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    const all: Array<'left' | 'right' | 'up' | 'down'> = ['left', 'right', 'up', 'down'];
    this.pattern = Array.from({ length: 4 }, () => all[Math.floor(Math.random() * 4)]);
  }

  get info(): SpaceGameInfo { return SPACE_GAMES['space-x4']; }

  render(): string {
    const icons: Record<string, string> = { left: '←', right: '→', up: '↑', down: '↓' };
    return `<div class="micro-board hatchcode-board" data-game="hatch" data-pattern="${this.pattern.join(',')}" data-entered="${this.entered}">
      <div class="micro-board-title">输入舱门密码</div>
      <div class="micro-caption">按上面的四向密码依次输入；错一位重新来</div>
      <div class="hatchcode-pattern">${this.pattern.map((p, i) => `<span class="hatchcode-step${i < this.entered ? ' is-done' : ''}">${icons[p]}</span>`).join('')}</div>
      <div class="hatchcode-door">${hatchDoor()}</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (!['left', 'right', 'up', 'down'].includes(action)) return {};
    if (action !== this.pattern[this.entered]) {
      this.entered = 0;
      this.toastText = '密码错了，重新输入';
      return { redraw: true };
    }
    this.entered += 1;
    this.toastText = '';
    if (this.entered >= this.pattern.length) window.setTimeout(() => this.complete(), 300);
    return { redraw: true };
  }
}

/* 5. 卫星维修 */
class SatelliteGame extends SpaceMicrogame {
  private panels = [1, 2, 3];

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.panels = Array.from({ length: 3 }, () => [1, 2, 3][Math.floor(Math.random() * 3)]);
  }

  get info(): SpaceGameInfo { return SPACE_GAMES['space-x5']; }

  render(): string {
    const panels = this.panels.map((o, i) => `<button class="sat-panel${this.focusClass(i)}" data-panel="${i}" data-orientation="${o}" aria-label="太阳能板 ${i + 1}">
      <span style="transform:rotate(${o * 90}deg)">${panelArt()}</span>
    </button>`).join('');
    return `<div class="micro-board satellite-board" data-game="satellite" data-panels="${this.panels.join(',')}">
      <div class="micro-board-title">转动太阳能板，让金色标记朝上</div>
      <div class="micro-caption">左右选面板，按 OK 转 90°；三块都朝上就修好</div>
      <div class="satellite-stage">${panels}</div>
      <div class="micro-progress">已对齐 <b>${this.panels.filter((p) => p === 0).length}</b> / 3 块</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + 2) % 3; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % 3; return { redraw: true }; }
    if (action === 'confirm') {
      this.panels[this.cursor] = (this.panels[this.cursor] + 1) % 4;
      if (this.panels.every((p) => p === 0)) window.setTimeout(() => this.complete(), 300);
      return { redraw: true };
    }
    return {};
  }
}

/* 6. 重力选择 */
class GravityGame extends SpaceMicrogame {
  private target = 2;
  private choice = 0;
  private dirs: Array<'left' | 'right' | 'up' | 'down'> = ['left', 'right', 'up', 'down'];

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = Math.floor(Math.random() * 4);
  }

  get info(): SpaceGameInfo { return SPACE_GAMES['space-x6']; }

  render(): string {
    const dirs = this.dirs.map((d, i) => `<button class="gravity-dir${this.focusClass(i)}" data-dir="${d}" aria-label="${d}">${this.dirIcon(d)}</button>`).join('');
    return `<div class="micro-board gravity-board" data-game="gravity" data-target="${this.target}" data-choice="${this.choice}">
      <div class="micro-board-title">选择重力方向，把星球吸到目标轨道</div>
      <div class="micro-caption">按方向键选箭头，按 OK 启动重力</div>
      <div class="gravity-stage"><div class="gravity-planet">${planetArt()}</div><div class="gravity-dirs">${dirs}</div></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  private dirIcon(d: string): string { return d === 'left' ? '←' : d === 'right' ? '→' : d === 'up' ? '↑' : '↓'; }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.choice = 0; return { redraw: true }; }
    if (action === 'right') { this.choice = 1; return { redraw: true }; }
    if (action === 'up') { this.choice = 2; return { redraw: true }; }
    if (action === 'down') { this.choice = 3; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.choice === this.target) return this.complete();
      this.toastText = '重力方向不对，星球飘走了';
      return { redraw: true };
    }
    return {};
  }
}

/* 7. 外星记忆 */
class AlienGame extends SpaceMicrogame {
  private cards: string[] = [];
  private opened: number[] = [];
  private matched = new Set<number>();
  private first = -1;
  private lock = false;
  private timer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.cards = ['green', 'green', 'purple', 'purple', 'orange', 'orange'].sort(() => Math.random() - 0.5);
  }

  get info(): SpaceGameInfo { return SPACE_GAMES['space-x7']; }

  render(): string {
    const cards = this.cards.map((v, i) => `<button class="alien-card${this.focusClass(i)}${this.opened.includes(i) || this.matched.has(i) ? ' is-open' : ''}${this.matched.has(i) ? ' is-matched' : ''}" data-card="${i}" data-kind="${v}" aria-label="记忆牌 ${i + 1}">
      <span class="alien-back">?</span><span class="alien-face">${alienArt(v)}</span>
    </button>`).join('');
    return `<div class="micro-board alien-board" data-game="alien" data-matched="${this.matched.size}">
      <div class="micro-board-title">翻牌配对，找到三对星球朋友</div>
      <div class="micro-caption">方向键选牌，按 OK 翻开；记住位置</div>
      <div class="alien-grid">${cards}</div>
      <div class="micro-progress">已配对 <b>${this.matched.size / 2}</b> / 3 对</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (this.lock) return {};
    if (action === 'left' || action === 'right') { this.cursor = (this.cursor + (action === 'left' ? 5 : 1)) % 6; return { redraw: true }; }
    if (action === 'up' || action === 'down') { this.cursor = (this.cursor + 3) % 6; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.matched.has(this.cursor) || this.opened.includes(this.cursor)) return {};
      this.opened.push(this.cursor);
      if (this.first < 0) { this.first = this.cursor; return { redraw: true }; }
      const a = this.first;
      const b = this.cursor;
      if (this.cards[a] === this.cards[b]) {
        this.matched.add(a); this.matched.add(b); this.opened = []; this.first = -1;
        if (this.matched.size === 6) window.setTimeout(() => this.complete(), 300);
        return { redraw: true };
      }
      this.lock = true;
      this.timer = window.setTimeout(() => { this.opened = []; this.first = -1; this.lock = false; this.host.redraw(); }, 700);
      return { redraw: true };
    }
    return {};
  }

  dispose(): void { if (this.timer !== null) window.clearTimeout(this.timer); this.timer = null; }
}

/* 8. 燃料加注 */
class FuelGame extends SpaceMicrogame {
  private target = 4;
  private fuel = 0;
  private filling = false;
  private timer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 3 + Math.floor(Math.random() * 3);
  }

  get info(): SpaceGameInfo { return SPACE_GAMES['space-x8']; }

  render(): string {
    return `<div class="micro-board fuel-board" data-game="fuel" data-target="${this.target}" data-fuel="${this.fuel.toFixed(1)}">
      <div class="micro-board-title">加注燃料到 <b>${this.target}</b> 格</div>
      <div class="micro-caption">按住 OK 加燃料，到刻度松手；加过头要排空重来</div>
      <div class="fuel-stage"><div class="fuel-rocket">${rocketArt()}</div><div class="fuel-gauge"><div class="fuel-fill" style="height:${this.fuel / 7 * 100}%"></div><div class="fuel-marker" style="bottom:${this.target / 7 * 100}%"><span>${this.target}</span></div></div></div>
      <div class="micro-progress">燃料 <b>${this.fuel.toFixed(1)}</b> / ${this.target}</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  private start(): void {
    if (this.filling || this.finished) return;
    this.filling = true;
    this.timer = window.setInterval(() => {
      if (!this.filling) return;
      this.fuel = Math.min(7, this.fuel + 0.12);
      if (this.fuel >= 7) this.stop(true);
      else this.host.redraw();
    }, 90);
  }

  private stop(over = false): void {
    if (!this.filling) return;
    this.filling = false;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    if (over || this.fuel > this.target + 0.55) {
      this.toastText = '加过头了，排空重来';
      this.fuel = 0;
      this.host.redraw();
      return;
    }
    if (Math.abs(this.fuel - this.target) <= 0.45) this.complete();
    else { this.toastText = this.fuel < this.target ? '再加一点' : '慢一点'; this.host.redraw(); }
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'confirm') { this.start(); return {}; }
    if (action === 'release' || action === 'up') { this.stop(false); return {}; }
    return {};
  }

  dispose(): void { if (this.timer !== null) window.clearInterval(this.timer); this.timer = null; this.filling = false; }
}

/* 9. 星门迷宫 */
class WarpGame extends SpaceMicrogame {
  private cols = 5;
  private grid: number[] = [];
  private step = 1;
  private hero = 0;
  private start = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.make();
  }

  get info(): SpaceGameInfo { return SPACE_GAMES['space-x9']; }

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
    this.hero = start;
  }

  render(): string {
    const tiles = this.grid.map((v, i) => `<div class="warp-tile${i === this.hero ? ' is-hero' : ''}" data-cell="${i}" data-value="${v}">${i === this.hero ? rocketArt() : v}</div>`).join('');
    return `<div class="micro-board warp-board" data-game="warp" data-step="${this.step}" data-hero="${this.hero}">
      <div class="micro-board-title">星门迷宫：按 1→5 走到出口</div>
      <div class="micro-caption">方向键走一格；走错回到起点</div>
      <div class="warp-grid">${tiles}</div>
      <div class="micro-progress">已走过 <b>${this.step - 1}</b> / 5 格</div>
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
      this.toastText = '走进死路，回到起点';
      return { redraw: true };
    }
    this.hero = next;
    this.step += 1;
    this.toastText = '';
    if (this.step >= 5) return this.complete();
    return { redraw: true };
  }
}

/* 10. 最终发射 */
class LaunchGame extends SpaceMicrogame {
  private order: number[] = [0, 1, 2, 3];
  private step = 0;
  private buttons = ['A', 'B', 'C', 'D'];

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.order = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
  }

  get info(): SpaceGameInfo { return SPACE_GAMES['space-x10']; }

  render(): string {
    const buttons = this.buttons.map((b, i) => `<button class="launch-button${this.focusClass(i)}${this.order.slice(0, this.step).includes(i) ? ' is-done' : ''}" data-button="${i}" aria-label="按钮 ${b}"><span>${b}</span></button>`).join('');
    return `<div class="micro-board launch-board" data-game="launch" data-step="${this.step}" data-order="${this.order.join(',')}">
      <div class="micro-board-title">按顺序按下四个发射按钮</div>
      <div class="micro-caption">看上面的顺序，左右选按钮，按 OK 按下</div>
      <div class="launch-order">${this.order.map((i) => `<span class="launch-step${this.order.slice(0, this.step).includes(i) ? ' is-done' : ''}">${this.buttons[i]}</span>`).join('')}</div>
      <div class="launch-stage">${buttons}<div class="launch-rocket">${rocketArt()}</div></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (!['left', 'right', 'up', 'down'].includes(action)) return {};
    if (action === 'left') { this.cursor = Math.max(0, this.cursor - 1); return { redraw: true }; }
    if (action === 'right') { this.cursor = Math.min(3, this.cursor + 1); return { redraw: true }; }
    if (action === 'up') { this.cursor = 0; return { redraw: true }; }
    if (action === 'down') { this.cursor = 3; return { redraw: true }; }
    return {};
  }

  // buttons are selected with left/right and confirmed with OK; keep the classic
  // input path by overriding confirm separately below
}

// LaunchGame needs OK handling; replace its handle with a version that confirms.
class LaunchGameFinal extends LaunchGame {
  handle(action: MicroAction): MicroResult {
    if (action === 'confirm') {
      const expected = this['order'][this['step']];
      if (this.cursor !== expected) {
        this['step'] = 0;
        this.toastText = '按钮顺序错了，从头按';
        return { redraw: true };
      }
      this['step'] += 1;
      this.toastText = '';
      if (this['step'] >= 4) return this.complete();
      return { redraw: true };
    }
    return super.handle(action);
  }
}

export function createSpaceGame(level: Level, host: MicroHost): SpaceMicrogame | null {
  switch (spaceGameFor(level.id)?.key) {
    case 'orbit': return new OrbitGame(level, host);
    case 'asteroid': return new AsteroidGame(level, host);
    case 'starmap': return new StarMapGame(level, host);
    case 'hatch': return new HatchCodeGame(level, host);
    case 'satellite': return new SatelliteGame(level, host);
    case 'gravity': return new GravityGame(level, host);
    case 'alien': return new AlienGame(level, host);
    case 'fuel': return new FuelGame(level, host);
    case 'warp': return new WarpGame(level, host);
    case 'launch': return new LaunchGameFinal(level, host);
    default: return null;
  }
}

/* art */
function rocketArt(): string {
  return `<svg class="rocket-art" viewBox="0 0 110 160" aria-hidden="true">
    <path d="M55 6 C82 30 90 60 82 102 H28 C20 60 28 30 55 6 Z" fill="#FFFDF7" stroke="#23313F" stroke-width="4"/>
    <path d="M55 6 C42 24 36 42 35 64 H75 C74 42 68 24 55 6 Z" fill="#FFE7A0" opacity="0.65"/>
    <path d="M35 64 H75" stroke="#23313F" stroke-width="3"/>
    <circle cx="55" cy="54" r="17" fill="#7FB6D9" stroke="#23313F" stroke-width="4"/>
    <circle cx="49" cy="48" r="5" fill="#FFFDF7" opacity="0.8"/>
    <path d="M36 88 H74 M40 103 H70" stroke="#B9C7D0" stroke-width="3"/>
    <g fill="#F28C6E" stroke="#23313F" stroke-width="4" stroke-linejoin="round">
      <path d="M28 74 L8 104 L30 98 Z"/><path d="M82 74 L102 104 L80 98 Z"/>
    </g>
    <path d="M38 100 C34 124 38 140 44 152 C48 138 50 120 48 100 M72 100 C76 124 72 140 66 152 C62 138 60 120 62 100" fill="#FFC94A" stroke="#23313F" stroke-width="3.5"/>
    <path d="M44 120 C50 112 60 112 66 120 C60 136 50 136 44 120 Z" fill="#F28C6E"/>
    <g fill="#B9C7D0"><circle cx="39" cy="82" r="2.5"/><circle cx="71" cy="82" r="2.5"/><circle cx="55" cy="80" r="2"/></g>
    <path d="M55 10 V22" stroke="#FFC94A" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}
function planetArt(): string {
  return `<svg class="planet-art" viewBox="0 0 180 180" aria-hidden="true">
    <circle cx="90" cy="90" r="58" fill="#2A9D8F" stroke="#23313F" stroke-width="5"/>
    <path d="M36 82 C54 58 92 48 124 62 C144 71 152 88 148 102 C130 130 78 134 46 112 C34 103 32 92 36 82 Z" fill="#8ED3B0" opacity="0.85"/>
    <path d="M54 52 C70 40 94 38 112 48" fill="none" stroke="#EAF7FF" stroke-width="5" stroke-linecap="round" opacity="0.55"/>
    <g fill="#79B85A" opacity="0.9"><path d="M62 70 C76 60 94 62 104 74 C92 84 74 84 62 70 Z"/><path d="M108 104 C120 96 136 100 140 112 C126 120 112 118 108 104 Z"/></g>
    <ellipse cx="90" cy="94" rx="86" ry="24" transform="rotate(-16 90 94)" fill="none" stroke="#FFC94A" stroke-width="10"/>
    <ellipse cx="90" cy="94" rx="86" ry="24" transform="rotate(-16 90 94)" fill="none" stroke="#FFF3B0" stroke-width="3" opacity="0.7"/>
    <circle cx="148" cy="50" r="11" fill="#F6C7B9" stroke="#23313F" stroke-width="3"/>
    <circle cx="160" cy="40" r="5" fill="#FFFDF7" opacity="0.7"/>
  </svg>`;
}
function starArt(): string {
  return `<svg class="space-star" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="52" r="42" fill="#FFE7A0" opacity="0.24"/>
    <path d="M50 8 L62 36 L92 40 L68 60 L76 90 L50 73 L24 90 L32 60 L8 40 L38 36 Z" fill="#FFC94A" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
    <path d="M50 22 L58 43 L79 46 L63 59 L68 79 L50 67 L32 79 L37 59 L21 46 L42 43 Z" fill="#FFE49B"/>
    <path d="M50 34 L54 48 L67 49 L57 57 L60 70 L50 62 L40 70 L43 57 L33 49 L46 48 Z" fill="#FFF8D8" opacity="0.9"/>
  </svg>`;
}
function rockArt(): string {
  return `<svg class="asteroid-art" viewBox="0 0 120 120" aria-hidden="true">
    <path d="M18 58 C12 30 38 8 68 14 C94 18 112 42 100 70 C90 94 56 108 32 92 C20 84 20 70 18 58 Z" fill="#8B6F4E" stroke="#23313F" stroke-width="4"/>
    <path d="M28 42 C42 26 66 24 82 34 C70 38 58 48 52 60 C42 56 32 50 28 42 Z" fill="#A9784F" opacity="0.8"/>
    <g fill="#6E563B"><circle cx="46" cy="44" r="10"/><circle cx="78" cy="64" r="7"/><circle cx="58" cy="80" r="5"/><circle cx="90" cy="42" r="4"/></g>
    <g fill="none" stroke="#C5A36B" stroke-width="2.5" opacity="0.8"><circle cx="46" cy="44" r="15"/><circle cx="78" cy="64" r="11"/></g>
    <path d="M8 28 L20 36 M6 44 L16 48 M104 20 L112 30" stroke="#FFC94A" stroke-width="3" stroke-linecap="round" opacity="0.65"/>
  </svg>`;
}
function hatchDoor(): string {
  return `<svg class="hatch-door-art" viewBox="0 0 240 260" aria-hidden="true">
    <path d="M18 250 V96 C18 24 222 24 222 96 V250 Z" fill="#B9C7D0" stroke="#23313F" stroke-width="5"/>
    <path d="M48 250 V124 C48 72 192 72 192 124 V250" fill="#4A6070" stroke="#23313F" stroke-width="5"/>
    <path d="M66 250 V134 C66 94 174 94 174 134 V250" fill="#647C8C" stroke="#23313F" stroke-width="3"/>
    <g fill="#8FA1AE"><circle cx="42" cy="110" r="5"/><circle cx="198" cy="110" r="5"/><circle cx="42" cy="220" r="5"/><circle cx="198" cy="220" r="5"/></g>
    <circle cx="120" cy="150" r="25" fill="#B9E3EA" stroke="#23313F" stroke-width="4"/>
    <path d="M100 150 C108 136 132 136 140 150 C132 164 108 164 100 150 Z" fill="#7FB6D9"/>
    <rect x="158" y="184" width="28" height="42" rx="5" fill="#23313F"/>
    <g fill="#FFC94A"><circle cx="166" cy="195" r="3"/><circle cx="178" cy="195" r="3"/><circle cx="166" cy="207" r="3"/><circle cx="178" cy="207" r="3"/></g>
    <path d="M80 218 H160" stroke="#23313F" stroke-width="3" opacity="0.55"/>
    <path d="M56 42 L72 56 M184 42 L168 56" stroke="#F28C6E" stroke-width="5" stroke-linecap="round"/>
  </svg>`;
}
function panelArt(): string {
  return `<svg class="solar-panel-art" viewBox="0 0 130 180" aria-hidden="true">
    <path d="M24 10 H106 V158 H24 Z" fill="#7FB6D9" stroke="#23313F" stroke-width="4"/>
    <g stroke="#23313F" stroke-width="2.5" opacity="0.8"><path d="M24 44 H106 M24 80 H106 M24 116 H106 M51 10 V158 M79 10 V158"/></g>
    <g fill="#B9E3EA" opacity="0.55"><rect x="28" y="14" width="20" height="26"/><rect x="55" y="14" width="21" height="26"/><rect x="82" y="14" width="20" height="26"/><rect x="28" y="48" width="20" height="28"/><rect x="82" y="48" width="20" height="28"/></g>
    <path d="M65 158 V178" stroke="#23313F" stroke-width="6"/>
    <circle cx="65" cy="176" r="6" fill="#FFC94A" stroke="#23313F" stroke-width="2.5"/>
    <path d="M32 20 C42 14 54 14 62 18" fill="none" stroke="#FFFDF7" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    <path d="M65 0 V18" stroke="#FFC94A" stroke-width="7" stroke-linecap="round"/>
  </svg>`;
}
function alienArt(c: string): string {
  const fill = c === 'green' ? '#8ED3B0' : c === 'purple' ? '#8E7CC3' : '#F6A25E';
  return `<svg class="alien-art" viewBox="0 0 120 130" aria-hidden="true">
    <path d="M24 58 C24 24 96 24 96 58 C96 78 88 92 78 100 H42 C32 92 24 78 24 58 Z" fill="${fill}" stroke="#23313F" stroke-width="4"/>
    <path d="M38 96 C26 104 22 116 24 126 H96 C98 116 94 104 82 96 Z" fill="#EAF7FF" stroke="#23313F" stroke-width="4"/>
    <path d="M38 60 C26 48 22 34 30 28 C40 30 46 44 48 56 C44 60 40 62 38 60 Z M82 60 C94 48 98 34 90 28 C80 30 74 44 72 56 C76 60 80 62 82 60 Z" fill="#FFFDF7" stroke="#23313F" stroke-width="3.5"/>
    <circle cx="56" cy="58" r="10" fill="#FFFDF7" stroke="#23313F" stroke-width="3"/><circle cx="80" cy="58" r="10" fill="#FFFDF7" stroke="#23313F" stroke-width="3"/>
    <circle cx="58" cy="58" r="4.5" fill="#23313F"/><circle cx="82" cy="58" r="4.5" fill="#23313F"/>
    <circle cx="56" cy="55" r="1.5" fill="#FFFDF7"/><circle cx="80" cy="55" r="1.5" fill="#FFFDF7"/>
    <path d="M62 76 q8 6 16 0" fill="none" stroke="#23313F" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M44 28 L34 8 M92 28 L102 8" stroke="#23313F" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="33" cy="7" r="5" fill="#FFC94A" stroke="#23313F" stroke-width="2"/><circle cx="103" cy="7" r="5" fill="#FFC94A" stroke="#23313F" stroke-width="2"/>
    <path d="M40 112 H78" stroke="#7FB6D9" stroke-width="4"/>
    <circle cx="60" cy="112" r="4" fill="#FFC94A" stroke="#23313F" stroke-width="2"/>
  </svg>`;
}
