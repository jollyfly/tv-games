import type { Level } from '../types';
import { escapeHtml } from '../ui';
import { Microgame, type MicroAction, type MicroGameInfo, type MicroHost, type MicroResult } from './base';

export type DonutGameKey = 'box' | 'catch' | 'icing' | 'split' | 'oven' | 'stack' | 'sort' | 'maze' | 'order' | 'night';
export interface DonutGameInfo extends MicroGameInfo { key: DonutGameKey; }
const L = (label: string) => ({ icon: 'left' as const, label });
const R = (label: string) => ({ icon: 'right' as const, label });
const U = (label: string) => ({ icon: 'up' as const, label });
const D = (label: string) => ({ icon: 'down' as const, label });
const OK = (label: string) => ({ icon: 'ok' as const, label });
const BACK = { icon: 'back' as const, label: '回地图' };
const mk = (key: DonutGameKey, name: string, verb: string, controls: DonutGameInfo['controls']): DonutGameInfo => ({ key, name, verb, controls });

export const DONUT_GAMES: Record<string, DonutGameInfo> = {
  'donut-x1': mk('box', '甜甜圈装盒', '在盒格里放/取甜甜圈，正好装满目标数量', [L('选格'), R('选格'), U('选格'), D('选格'), OK('放/取'), BACK]),
  'donut-x2': mk('catch', '传送带接糖', '左右移动盒子，接住落下的甜甜圈', [L('移盒'), R('移盒'), BACK]),
  'donut-x3': mk('icing', '糖霜图案', '按糖霜颜色顺序复现图案', [L('选色'), R('选色'), OK('挤糖霜'), BACK]),
  'donut-x4': mk('split', '平分甜甜圈', '左右把甜甜圈分到两个盘子，让两边一样多', [L('放左盘'), R('放右盘'), BACK]),
  'donut-x5': mk('oven', '烤箱计时', '看准时间按 OK 出炉，烤两盘', [OK('出炉'), BACK]),
  'donut-x6': mk('stack', '甜甜圈堆叠', '看准位置按 OK 叠甜甜圈，叠五层', [OK('叠一个'), BACK]),
  'donut-x7': mk('sort', '配料分拣', '按配料数量把甜甜圈放进对应筐', [L('选'), R('选'), OK('拿起/放下'), BACK]),
  'donut-x8': mk('maze', '甜甜圈迷宫', '5×5 迷宫按 1→5 送到柜台', [L('走'), R('走'), U('走'), D('走'), BACK]),
  'donut-x9': mk('order', '订单匹配', '找到和订单数字对应的盒子', [L('选盒'), R('选盒'), OK('交付'), BACK]),
  'donut-x10': mk('night', '工厂夜班', '按夜班流程操作四台机器', [L('选'), R('选'), U('选'), D('选'), BACK]),
};

export function donutGameFor(id: string): DonutGameInfo | null { return DONUT_GAMES[id] ?? null; }
abstract class DonutMicrogame extends Microgame<DonutGameInfo> {}

/* 1. 装盒 */
class BoxGame extends DonutMicrogame {
  private target = 5;
  private placed = new Set<number>();

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 4 + Math.floor(Math.random() * 3);
  }

  get info(): DonutGameInfo { return DONUT_GAMES['donut-x1']; }

  render(): string {
    const cells = Array.from({ length: 9 }, (_, i) => `<button class="donut-box-cell${this.focusClass(i)}${this.placed.has(i) ? ' is-filled' : ''}" data-cell="${i}" aria-label="盒子格 ${i + 1}">
      ${this.placed.has(i) ? donutArt() : '<span class="box-empty"></span>'}
    </button>`).join('');
    return `<div class="micro-board box-board" data-game="box" data-target="${this.target}" data-placed="${this.placed.size}">
      <div class="micro-board-title">盒子里正好放 <b>${this.target}</b> 个甜甜圈</div>
      <div class="micro-caption">方向键选格，按 OK 放一个；再按一次取走</div>
      <div class="donut-box-grid">${cells}</div>
      <div class="micro-progress">已放 <b>${this.placed.size}</b> / ${this.target} 个</div>
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
      if (this.placed.has(this.cursor)) this.placed.delete(this.cursor);
      else if (this.placed.size < this.target) this.placed.add(this.cursor);
      else { this.toastText = '先取走一个再放'; return { redraw: true }; }
      this.toastText = '';
      if (this.placed.size === this.target) window.setTimeout(() => this.complete(), 300);
    } else return {};
    return { redraw: true };
  }
}

/* 2. 传送带接糖 */
class CatchGame extends DonutMicrogame {
  private slots = 5;
  private caught = 0;
  private target = 5;
  private donuts: Array<{ x: number; y: number }> = [];
  private timer: number | null = null;
  private spawnTimer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 5;
    this.donuts.push({ x: 2, y: 0 });
    this.timer = window.setInterval(() => {
      this.donuts = this.donuts.map((d) => ({ x: d.x, y: d.y + 5 })).filter((d) => {
        if (d.y < 300) return true;
        if (Math.abs(d.x - this.cursor) <= 1) this.caught += 1;
        return false;
      });
      if (this.caught >= this.target) this.complete();
      this.host.redraw();
    }, 90);
    this.spawnTimer = window.setInterval(() => {
      if (this.finished) return;
      this.donuts.push({ x: Math.floor(Math.random() * this.slots), y: 0 });
    }, 560);
  }

  get info(): DonutGameInfo { return DONUT_GAMES['donut-x2']; }

  render(): string {
    const donuts = this.donuts.map((d) => `<span class="fall-donut" style="left:${d.x * 20 + 10}%;top:${d.y}px">${donutArt()}</span>`).join('');
    return `<div class="micro-board catch-board" data-game="catch" data-caught="${this.caught}" data-target="${this.target}">
      <div class="micro-board-title">接住 <b>${this.target}</b> 个甜甜圈</div>
      <div class="micro-caption">左右移动盒子，让甜甜圈落进盒子</div>
      <div class="catch-stage">${donuts}<div class="catch-box" style="left:${this.cursor * 20 + 10}%">${boxArt()}</div><div class="catch-belt"></div></div>
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

/* 3. 糖霜图案 */
class IcingGame extends DonutMicrogame {
  private colors = ['pink', 'yellow', 'mint'];
  private pattern: string[] = [];
  private entered: string[] = [];

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.pattern = Array.from({ length: 4 }, () => this.colors[Math.floor(Math.random() * 3)]);
  }

  get info(): DonutGameInfo { return DONUT_GAMES['donut-x3']; }

  render(): string {
    const target = this.pattern.map((c, i) => `<span class="icing-chip ${c}${i < this.entered.length ? ' is-done' : ''}">${icingDonutArt(c)}</span>`).join('');
    const choices = this.colors.map((c, i) => `<button class="icing-choice ${c}${i === this.cursor ? ' is-focused' : ''}" data-color="${c}" aria-label="${c}">${icingDonutArt(c)}</button>`).join('');
    return `<div class="micro-board icing-board" data-game="icing" data-pattern="${this.pattern.join(',')}" data-entered="${this.entered.join(',')}">
      <div class="micro-board-title">照着糖霜顺序挤图案</div>
      <div class="micro-caption">左右选颜色，按 OK 挤一格；顺序错就重来</div>
      <div class="icing-target">${target}</div>
      <div class="icing-colors">${choices}</div>
      <div class="micro-progress">已挤 <b>${this.entered.length}</b> / 4 格</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left' || action === 'right') { this.cursor = (this.cursor + (action === 'left' ? 2 : 1)) % 3; return { redraw: true }; }
    if (action === 'confirm') {
      const c = this.colors[this.cursor];
      if (c !== this.pattern[this.entered.length]) {
        this.entered = [];
        this.toastText = '糖霜颜色错了，重新挤';
        return { redraw: true };
      }
      this.entered.push(c);
      this.toastText = '';
      if (this.entered.length >= 4) window.setTimeout(() => this.complete(), 300);
      return { redraw: true };
    }
    return {};
  }
}

/* 4. 平分甜甜圈 */
class SplitGame extends DonutMicrogame {
  private left = 0;
  private right = 0;
  private target = 3;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 2 + Math.floor(Math.random() * 4);
  }

  get info(): DonutGameInfo { return DONUT_GAMES['donut-x4']; }

  render(): string {
    return `<div class="micro-board split-board" data-game="split" data-left="${this.left}" data-right="${this.right}" data-target="${this.target}">
      <div class="micro-board-title">让两个盘子一样多，每盘 <b>${this.target}</b> 个</div>
      <div class="micro-caption">左键往左盘放，右键往右盘放</div>
      <div class="split-stage"><div class="split-plate left">${Array.from({ length: this.left }, () => donutArt()).join('')}<b>${this.left}</b></div><div class="split-eq">=</div><div class="split-plate right">${Array.from({ length: this.right }, () => donutArt()).join('')}<b>${this.right}</b></div></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') this.left = Math.min(this.target, this.left + 1);
    else if (action === 'right') this.right = Math.min(this.target, this.right + 1);
    else return {};
    if (this.left === this.target && this.right === this.target) window.setTimeout(() => this.complete(), 350);
    return { redraw: true };
  }
}

/* 5. 烤箱计时 */
class OvenGame extends DonutMicrogame {
  private position = 0;
  private dir = 1;
  private baked = 0;
  private target = 2;
  private timer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.timer = window.setInterval(() => {
      if (this.finished) return;
      this.position += this.dir * 3;
      if (this.position > 100 || this.position < 0) { this.dir *= -1; this.position = Math.max(0, Math.min(100, this.position)); }
      this.host.redraw();
    }, 70);
  }

  get info(): DonutGameInfo { return DONUT_GAMES['donut-x5']; }

  render(): string {
    const inZone = this.position >= 42 && this.position <= 58;
    return `<div class="micro-board oven-board" data-game="oven" data-position="${this.position}" data-baked="${this.baked}" data-in-zone="${inZone ? 1 : 0}">
      <div class="micro-board-title">看准绿色时间出炉，烤 <b>2</b> 盘</div>
      <div class="micro-caption">指针到绿色区域时按 OK</div>
      <div class="oven-stage"><div class="oven">${ovenArt()}</div><div class="oven-track"><span class="oven-zone"></span><span class="oven-marker" style="left:${this.position}%">●</span></div><div class="micro-progress">已出炉 <b>${this.baked}</b> / 2 盘</div></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action !== 'confirm') return {};
    if (this.position >= 42 && this.position <= 58) {
      this.baked += 1;
      this.toastText = '';
      if (this.baked >= this.target) return this.complete();
      return { redraw: true };
    }
    this.toastText = '烤糊了，重新计时';
    this.baked = 0;
    return { redraw: true };
  }

  dispose(): void { if (this.timer !== null) window.clearInterval(this.timer); this.timer = null; }
}

/* 6. 甜甜圈堆叠 */
class StackGame extends DonutMicrogame {
  private position = 0;
  private dir = 1;
  private stack = 0;
  private timer: number | null = null;
  private sway = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.timer = window.setInterval(() => {
      if (this.finished) return;
      this.position += this.dir * 4;
      if (this.position > 100 || this.position < 0) { this.dir *= -1; this.position = Math.max(0, Math.min(100, this.position)); }
      this.host.redraw();
    }, 70);
  }

  get info(): DonutGameInfo { return DONUT_GAMES['donut-x6']; }

  render(): string {
    const inZone = this.position >= 40 && this.position <= 60;
    const layers = Array.from({ length: this.stack }, (_, i) => `<span class="stack-donut" style="--i:${i}">${donutArt()}</span>`).join('');
    return `<div class="micro-board stack-board" data-game="stack" data-position="${this.position}" data-stack="${this.stack}" data-in-zone="${inZone ? 1 : 0}">
      <div class="micro-board-title">看准位置叠 <b>5</b> 层甜甜圈</div>
      <div class="micro-caption">甜甜圈到绿色范围按 OK 叠上去；歪了会掉</div>
      <div class="stack-stage"><div class="stack-line"><span class="stack-zone"></span><span class="stack-marker" style="left:${this.position}%">${donutArt()}</span></div><div class="stack-pile">${layers}</div><div class="stack-count">${this.stack} / 5</div></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action !== 'confirm') return {};
    if (this.position >= 40 && this.position <= 60) {
      this.stack += 1;
      this.toastText = '';
      if (this.stack >= 5) return this.complete();
      return { redraw: true };
    }
    this.stack = Math.max(0, this.stack - 1);
    this.toastText = '歪了，掉了一层';
    return { redraw: true };
  }

  dispose(): void { if (this.timer !== null) window.clearInterval(this.timer); this.timer = null; }
}

/* 7. 配料分拣 */
class ToppingSortGame extends DonutMicrogame {
  private donuts: number[] = [];
  private phase: 'donut' | 'basket' = 'donut';
  private selected = -1;
  private selectedValue = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.donuts = [3, 3, 5, 5].sort(() => Math.random() - 0.5);
  }

  get info(): DonutGameInfo { return DONUT_GAMES['donut-x7']; }

  render(): string {
    const donuts = this.donuts.map((v, i) => `<button class="topping-donut${this.phase === 'donut' ? this.focusClass(i) : ''}${this.selected === i ? ' is-selected' : ''}" data-value="${v}" aria-label="甜甜圈 ${v}">${donutArt()}<span>${v}</span></button>`).join('');
    const baskets = [3, 5].map((v, i) => `<button class="topping-basket${this.phase === 'basket' ? this.focusClass(i) : ''}" data-basket="${v}" aria-label="${v} 号筐"><span>${v}</span></button>`).join('');
    return `<div class="micro-board topping-board" data-game="sort" data-phase="${this.phase}" data-left="${this.donuts.length}">
      <div class="micro-board-title">按配料数量把甜甜圈放进对应筐</div>
      <div class="micro-caption">${this.phase === 'donut' ? '左右选甜甜圈，按 OK 拿起' : '左右选筐，按 OK 放下'}</div>
      <div class="topping-stage"><div class="topping-donuts">${donuts}</div><div class="topping-baskets">${baskets}</div></div>
      <div class="micro-progress">还剩 <b>${this.donuts.length}</b> 个</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left' || action === 'right') {
      const size = this.phase === 'donut' ? this.donuts.length : 2;
      if (!size) return {};
      this.cursor = (this.cursor + (action === 'left' ? size - 1 : 1)) % size;
      return { redraw: true };
    }
    if (action === 'confirm') {
      if (this.phase === 'donut') {
        if (!this.donuts.length) return {};
        this.selected = this.cursor;
        this.selectedValue = this.donuts[this.cursor];
        this.phase = 'basket';
        this.cursor = 0;
        return { redraw: true };
      }
      const basket = this.cursor === 0 ? 3 : 5;
      if (basket === this.selectedValue) {
        this.donuts.splice(this.selected, 1);
        this.selected = -1;
        this.phase = 'donut';
        this.cursor = 0;
        this.toastText = '';
        if (!this.donuts.length) window.setTimeout(() => this.complete(), 300);
      } else {
        this.toastText = '配料数量不对，再看看';
        this.phase = 'donut';
        this.selected = -1;
        this.cursor = 0;
      }
      return { redraw: true };
    }
    return {};
  }
}

/* 8. 甜甜圈迷宫 */
class DonutMazeGame extends DonutMicrogame {
  private cols = 5;
  private grid: number[] = [];
  private step = 1;
  private hero = 0;
  private start = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.make();
  }

  get info(): DonutGameInfo { return DONUT_GAMES['donut-x8']; }

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
    const tiles = this.grid.map((v, i) => `<div class="donut-maze-tile${i === this.hero ? ' is-hero' : ''}" data-cell="${i}" data-value="${v}">${i === this.hero ? donutArt() : v}</div>`).join('');
    return `<div class="micro-board donut-maze-board" data-game="maze" data-step="${this.step}" data-hero="${this.hero}">
      <div class="micro-board-title">甜甜圈迷宫：按 1→5 送到柜台</div>
      <div class="micro-caption">方向键走一格；走错回到起点</div>
      <div class="donut-maze-grid">${tiles}</div>
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
      this.toastText = '走错啦，回到起点';
      return { redraw: true };
    }
    this.hero = next;
    this.step += 1;
    this.toastText = '';
    if (this.step >= 5) return this.complete();
    return { redraw: true };
  }
}

/* 9. 订单匹配 */
class OrderGame extends DonutMicrogame {
  private target = 4;
  private boxes: number[] = [];

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 2 + Math.floor(Math.random() * 6);
    this.boxes = Array.from({ length: 3 }, () => 1 + Math.floor(Math.random() * 7));
    this.boxes[Math.floor(Math.random() * 3)] = this.target;
  }

  get info(): DonutGameInfo { return DONUT_GAMES['donut-x9']; }

  render(): string {
    const boxes = this.boxes.map((v, i) => `<button class="order-box${this.focusClass(i)}" data-box="${i}" data-number="${v}" aria-label="盒子 ${v}">${boxArt()}<span>${v}</span></button>`).join('');
    return `<div class="micro-board order-board" data-game="order" data-target="${this.target}">
      <div class="micro-board-title">订单：<b>${this.target}</b> 个甜甜圈</div>
      <div class="micro-caption">左右选盒子，按 OK 交付正确的订单</div>
      <div class="order-stage">${boxes}</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + 2) % 3; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % 3; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.boxes[this.cursor] === this.target) return this.complete();
      this.toastText = '数量不对，再看看订单';
      return { redraw: true };
    }
    return {};
  }
}

/* 10. 工厂夜班 */
class NightGame extends DonutMicrogame {
  private pattern: Array<'left' | 'right' | 'up' | 'down'> = [];
  private entered = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    const all: Array<'left' | 'right' | 'up' | 'down'> = ['left', 'right', 'up', 'down'];
    this.pattern = Array.from({ length: 4 }, () => all[Math.floor(Math.random() * 4)]);
  }

  get info(): DonutGameInfo { return DONUT_GAMES['donut-x10']; }

  render(): string {
    const icons: Record<string, string> = { left: nightStepArt('left'), right: nightStepArt('right'), up: nightStepArt('up'), down: nightStepArt('down') };
    return `<div class="micro-board night-board" data-game="night" data-pattern="${this.pattern.join(',')}" data-entered="${this.entered}">
      <div class="micro-board-title">按夜班流程操作四台机器</div>
      <div class="micro-caption">照着流程方向依次操作；错一步重新来</div>
      <div class="night-pattern">${this.pattern.map((p, i) => `<span class="night-step${i < this.entered ? ' is-done' : ''}">${icons[p]}</span>`).join('')}</div>
      <div class="night-stage">${factoryArt()}<span>${this.entered} / 4</span></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (!['left', 'right', 'up', 'down'].includes(action)) return {};
    if (action !== this.pattern[this.entered]) {
      this.entered = 0;
      this.toastText = '流程错了，重新开始';
      return { redraw: true };
    }
    this.entered += 1;
    this.toastText = '';
    if (this.entered >= 4) window.setTimeout(() => this.complete(), 300);
    return { redraw: true };
  }
}

export function createDonutGame(level: Level, host: MicroHost): DonutMicrogame | null {
  switch (donutGameFor(level.id)?.key) {
    case 'box': return new BoxGame(level, host);
    case 'catch': return new CatchGame(level, host);
    case 'icing': return new IcingGame(level, host);
    case 'split': return new SplitGame(level, host);
    case 'oven': return new OvenGame(level, host);
    case 'stack': return new StackGame(level, host);
    case 'sort': return new ToppingSortGame(level, host);
    case 'maze': return new DonutMazeGame(level, host);
    case 'order': return new OrderGame(level, host);
    case 'night': return new NightGame(level, host);
    default: return null;
  }
}

/* art */
function nightStepArt(dir: string): string {
  const rotate = dir === 'left' ? -90 : dir === 'right' ? 90 : dir === 'down' ? 180 : 0;
  return `<svg class="night-step-art" viewBox="0 0 100 100" aria-hidden="true" style="transform:rotate(${rotate}deg)">
    <circle cx="50" cy="50" r="32" fill="#D99A5C" stroke="#23313F" stroke-width="4"/>
    <circle cx="50" cy="50" r="12" fill="#FFF8E8" stroke="#23313F" stroke-width="3"/>
    <path d="M50 16 C42 16 36 22 36 30 C44 24 56 24 64 30 C64 22 58 16 50 16 Z" fill="#F6C7B9"/>
    <path d="M50 56 V82 M50 82 L40 72 M50 82 L60 72" stroke="#23313F" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
function donutArt(icing: 'pink' | 'yellow' | 'mint' | 'choco' | 'plain' = 'pink'): string {
  const colors = { pink: '#F6C7B9', yellow: '#FFE49B', mint: '#B9E3C8', choco: '#A9784F', plain: '#D99A5C' };
  const c = colors[icing];
  return `<svg class="donut-art" viewBox="0 0 120 120" aria-hidden="true">
    <ellipse cx="60" cy="104" rx="38" ry="8" fill="#23313F" opacity="0.12"/>
    <circle cx="60" cy="58" r="45" fill="#D99A5C" stroke="#23313F" stroke-width="4"/>
    <circle cx="60" cy="58" r="40" fill="#E7B482" opacity="0.55"/>
    <path d="M22 58 C22 30 44 14 68 20 C92 26 104 48 96 70 C92 82 82 92 68 96 C50 100 32 88 26 72 C24 66 22 62 22 58 Z" fill="${c}" stroke="#23313F" stroke-width="3"/>
    <path d="M30 76 C36 88 46 94 58 96 C50 88 46 80 44 68 Z" fill="${c}" stroke="#23313F" stroke-width="2.5"/>
    <circle cx="60" cy="58" r="16" fill="#FFF8E8" stroke="#23313F" stroke-width="4"/>
    <circle cx="60" cy="58" r="9" fill="#F4E8CF"/>
    <g fill="#FFFDF7" opacity="0.85"><rect x="40" y="33" width="4" height="13" rx="2" transform="rotate(-35 42 40)"/><rect x="78" y="38" width="4" height="13" rx="2" transform="rotate(28 80 44)"/><rect x="82" y="70" width="4" height="12" rx="2" transform="rotate(65 84 76)"/><rect x="36" y="66" width="4" height="11" rx="2" transform="rotate(-48 38 71)"/></g>
    <g fill="#F27059"><circle cx="54" cy="30" r="3"/><circle cx="86" cy="52" r="2.5"/><circle cx="72" cy="88" r="2.5"/></g>
    <g fill="#8ED3B0"><circle cx="34" cy="48" r="2.5"/><circle cx="70" cy="24" r="2.5"/></g>
    <path d="M30 48 C34 32 46 24 60 24" fill="none" stroke="#FFFDF7" stroke-width="4" stroke-linecap="round" opacity="0.65"/>
  </svg>`;
}
function icingDonutArt(color: string): string {
  const map: Record<string, 'pink' | 'yellow' | 'mint'> = { pink: 'pink', yellow: 'yellow', mint: 'mint' };
  return donutArt(map[color] ?? 'pink');
}
function boxArt(): string {
  return `<svg class="donut-box-art" viewBox="0 0 140 150" aria-hidden="true">
    <path d="M16 50 H124 L112 140 H28 Z" fill="#DDBB83" stroke="#23313F" stroke-width="4"/>
    <path d="M16 50 L34 18 H106 L124 50" fill="#F4E8CF" stroke="#23313F" stroke-width="4"/>
    <path d="M16 50 H124" stroke="#23313F" stroke-width="3"/>
    <circle cx="70" cy="88" r="24" fill="#D99A5C" stroke="#23313F" stroke-width="3"/>
    <circle cx="70" cy="88" r="8" fill="#FFF8E8" stroke="#23313F" stroke-width="3"/>
    <path d="M48 78 C54 64 70 58 84 64 C94 68 98 78 94 88 C82 74 64 72 52 82 Z" fill="#F6C7B9" opacity="0.85"/>
    <path d="M34 24 C46 16 96 16 106 24" fill="none" stroke="#FFFDF7" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
    <path d="M58 18 V50 M82 18 V50" stroke="#F28C6E" stroke-width="5" opacity="0.75"/>
    <rect x="42" y="112" width="56" height="16" rx="4" fill="#FFFDF7" stroke="#23313F" stroke-width="2.5"/>
    <path d="M52 120 H88" stroke="#23313F" stroke-width="2" opacity="0.5"/>
  </svg>`;
}
function ovenArt(): string {
  return `<svg class="donut-oven-art" viewBox="0 0 240 240" aria-hidden="true">
    <rect x="18" y="18" width="204" height="204" rx="20" fill="#B9C7D0" stroke="#23313F" stroke-width="5"/>
    <rect x="38" y="52" width="164" height="118" rx="12" fill="#4A6070" stroke="#23313F" stroke-width="4"/>
    <rect x="50" y="64" width="140" height="94" rx="8" fill="#23313F" opacity="0.6"/>
    <g fill="#D99A5C" stroke="#23313F" stroke-width="3"><circle cx="86" cy="106" r="24"/><circle cx="86" cy="106" r="8" fill="#FFF8E8"/><circle cx="146" cy="106" r="24"/><circle cx="146" cy="106" r="8" fill="#FFF8E8"/></g>
    <g fill="#F6C7B9"><path d="M66 92 C72 80 88 76 98 82 C90 84 82 90 80 98 Z"/><path d="M126 92 C132 80 148 76 158 82 C150 84 142 90 140 98 Z"/></g>
    <path d="M38 182 H202" stroke="#23313F" stroke-width="3"/>
    <circle cx="78" cy="202" r="12" fill="#23313F"/><circle cx="120" cy="202" r="12" fill="#FFC94A" stroke="#23313F" stroke-width="3"/><circle cx="162" cy="202" r="12" fill="#23313F"/>
    <g fill="#FFFDF7" opacity="0.7"><circle cx="70" cy="110" r="2.5"/><circle cx="100" cy="126" r="2"/></g>
  </svg>`;
}
function factoryArt(): string {
  return `<svg class="donut-factory-art" viewBox="0 0 320 170" aria-hidden="true">
    <path d="M8 160 V64 H70 V42 H112 V64 H164 V30 H214 V64 H312 V160 Z" fill="#DDBB83" stroke="#23313F" stroke-width="4"/>
    <path d="M8 64 H312" stroke="#23313F" stroke-width="3"/>
    <g fill="#4A6070" stroke="#23313F" stroke-width="2.5"><rect x="38" y="92" width="30" height="30"/><rect x="124" y="92" width="30" height="30"/><rect x="230" y="92" width="30" height="30"/></g>
    <path d="M40 108 H66 M126 108 H152 M232 108 H258" stroke="#7FB6D9" stroke-width="3"/>
    <path d="M164 30 V10 M214 30 V10" stroke="#23313F" stroke-width="4"/>
    <g class="factory-smoke" fill="none" stroke="#FFFDF7" stroke-width="7" stroke-linecap="round" opacity="0.7"><path d="M174 8 C164 -8 180 -20 194 -10"/><path d="M224 8 C214 -8 230 -20 244 -10"/></g>
    <path d="M18 160 H302" stroke="#23313F" stroke-width="6"/>
    <g fill="#D99A5C" stroke="#23313F" stroke-width="2.5"><circle cx="76" cy="148" r="12"/><circle cx="76" cy="148" r="4" fill="#FFF8E8"/><circle cx="106" cy="148" r="12"/><circle cx="106" cy="148" r="4" fill="#FFF8E8"/></g>
    <path d="M8 136 H312" stroke="#B87B48" stroke-width="7"/>
  </svg>`;
}
