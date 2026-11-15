import type { Level } from '../types';
import { escapeHtml } from '../ui';
import { Microgame, type MicroAction, type MicroGameInfo, type MicroHost, type MicroResult } from './base';

export type DinoGameKey = 'brush' | 'egg' | 'bone' | 'volcano' | 'footprint' | 'hatch' | 'feed' | 'sort' | 'maze' | 'museum';
export interface DinoGameInfo extends MicroGameInfo { key: DinoGameKey; }

const L = (label: string) => ({ icon: 'left' as const, label });
const R = (label: string) => ({ icon: 'right' as const, label });
const U = (label: string) => ({ icon: 'up' as const, label });
const D = (label: string) => ({ icon: 'down' as const, label });
const OK = (label: string) => ({ icon: 'ok' as const, label });
const BACK = { icon: 'back' as const, label: '回地图' };
const mk = (key: DinoGameKey, name: string, verb: string, controls: DinoGameInfo['controls']): DinoGameInfo => ({ key, name, verb, controls });

export const DINO_GAMES: Record<string, DinoGameInfo> = {
  'dino-x1': mk('brush', '化石挖掘', '刷开沙土，找齐 4 块化石', [L('刷子'), R('刷子'), U('刷子'), D('刷子'), OK('刷一下'), BACK]),
  'dino-x2': mk('egg', '恐龙蛋配对', '找到写着目标数字的恐龙蛋', [L('选蛋'), R('选蛋'), OK('打开'), BACK]),
  'dino-x3': mk('bone', '骨架拼接', '按 1→5 把骨头接起来', [L('选骨头'), R('选骨头'), OK('拼接'), BACK]),
  'dino-x4': mk('volcano', '火山跳石', '按 1→5 踩石头过岩浆', [L('跳'), R('跳'), U('跳'), D('跳'), BACK]),
  'dino-x5': mk('footprint', '脚印舞步', '按脚印方向走完四步', [L('踩'), R('踩'), U('踩'), D('踩'), BACK]),
  'dino-x6': mk('hatch', '孵化保温', '按住 OK 给蛋保温到目标温度', [OK('按住保温'), U('松手'), BACK]),
  'dino-x7': mk('feed', '喂小恐龙', '左右移动，喂够目标数量的叶子', [L('移动'), R('移动'), OK('喂叶子'), BACK]),
  'dino-x8': mk('sort', '化石分拣', '把化石按数量放进对应筐', [L('选化石/筐'), R('选化石/筐'), OK('拿起/放下'), BACK]),
  'dino-x9': mk('maze', '恐龙迷宫', '在 5×5 迷宫里按 1→5 走到巢穴', [L('走'), R('走'), U('走'), D('走'), BACK]),
  'dino-x10': mk('museum', '博物馆之夜', '交换展品，把 1、2、3 排好', [L('选展品'), R('选展品'), OK('交换'), BACK]),
};

export function dinoGameFor(id: string): DinoGameInfo | null { return DINO_GAMES[id] ?? null; }
abstract class DinoMicrogame extends Microgame<DinoGameInfo> {}

/* 1. 化石挖掘 */
class BrushGame extends DinoMicrogame {
  private fossils = new Set<number>();
  private brushed = new Set<number>();
  private target = 4;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    while (this.fossils.size < 4) this.fossils.add(Math.floor(Math.random() * 9));
  }

  get info(): DinoGameInfo { return DINO_GAMES['dino-x1']; }

  render(): string {
    const cells = Array.from({ length: 9 }, (_, i) => `<button class="brush-cell${this.focusClass(i)}${this.brushed.has(i) ? ' is-brushed' : ''}" data-cell="${i}" aria-label="沙土 ${i + 1}">
      ${this.brushed.has(i) ? (this.fossils.has(i) ? boneArt() : '<span class="brush-empty">沙</span>') : '<span class="brush-sand"></span>'}
    </button>`).join('');
    return `<div class="micro-board brush-board" data-game="brush" data-found="${[...this.brushed].filter((i) => this.fossils.has(i)).length}" data-target="${this.target}">
      <div class="micro-board-title">刷开沙土，找到 <b>${this.target}</b> 块化石</div>
      <div class="micro-caption">方向键移动刷子，按 OK 刷一下；没有化石就换个地方</div>
      <div class="brush-grid">${cells}</div><div class="brush-tool">${brushArt()}</div>
      <div class="micro-progress">已找到 <b>${[...this.brushed].filter((i) => this.fossils.has(i)).length}</b> / ${this.target} 块</div>
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
      this.brushed.add(this.cursor);
      this.toastText = this.fossils.has(this.cursor) ? '' : '这里只有沙土';
      if ([...this.brushed].filter((i) => this.fossils.has(i)).length >= this.target) window.setTimeout(() => this.complete(), 350);
    } else return {};
    return { redraw: true };
  }
}

/* 2. 恐龙蛋配对 */
class EggGame extends DinoMicrogame {
  private eggs: number[] = [];
  private target = 3;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 2 + Math.floor(Math.random() * 5);
    this.eggs = Array.from({ length: 6 }, () => 1 + Math.floor(Math.random() * 6));
    this.eggs[Math.floor(Math.random() * 6)] = this.target;
  }

  get info(): DinoGameInfo { return DINO_GAMES['dino-x2']; }

  render(): string {
    const eggs = this.eggs.map((v, i) => `<button class="dino-egg${this.focusClass(i)}" data-egg="${i}" data-number="${v}" aria-label="恐龙蛋 ${i + 1}">${eggArt(v)}</button>`).join('');
    return `<div class="micro-board egg-board" data-game="egg" data-target="${this.target}">
      <div class="micro-board-title">找到写着 <b>${this.target}</b> 的恐龙蛋</div>
      <div class="micro-caption">左右选蛋，按 OK 打开；打开错可以继续找</div>
      <div class="egg-stage">${eggs}</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + 5) % 6; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % 6; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.eggs[this.cursor] === this.target) return this.complete();
      this.toastText = '孵出来的不是目标数字，再找找';
      return { redraw: true };
    }
    return {};
  }
}

/* 3. 骨架拼接 */
class BoneGame extends DinoMicrogame {
  private numbers: number[] = [];
  private step = 1;
  private placed = new Set<number>();

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.numbers = [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
  }

  get info(): DinoGameInfo { return DINO_GAMES['dino-x3']; }

  render(): string {
    const bones = this.numbers.map((v, i) => `<button class="bone-piece${this.focusClass(i)}${this.placed.has(i) ? ' is-placed' : ''}" data-bone="${i}" data-number="${v}" aria-label="骨头 ${v}">${boneArt()}<span>${v}</span></button>`).join('');
    return `<div class="micro-board bone-board" data-game="bone" data-step="${this.step}" data-numbers="${this.numbers.join(',')}">
      <div class="micro-board-title">按 1 → 5 把骨架拼起来</div>
      <div class="micro-caption">左右选骨头，按 OK 拼接；接错就全部散开</div>
      <div class="bone-stage">${bones}</div>
      <div class="micro-progress">已拼 <b>${this.step - 1}</b> / 5 块</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + 4) % 5; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % 5; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.numbers[this.cursor] !== this.step) {
        this.placed = new Set();
        this.step = 1;
        this.toastText = '接错顺序，骨架散开了';
        return { redraw: true };
      }
      this.placed.add(this.cursor);
      this.step += 1;
      this.toastText = '';
      if (this.step > 5) return this.complete();
      return { redraw: true };
    }
    return {};
  }
}

/* 4. 火山跳石 */
class VolcanoGame extends DinoMicrogame {
  private cols = 4;
  private grid: number[] = [];
  private step = 1;
  private hero = 0;
  private start = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.make();
  }

  get info(): DinoGameInfo { return DINO_GAMES['dino-x4']; }

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
    const tiles = this.grid.map((v, i) => `<div class="volcano-tile${i === this.hero ? ' is-hero' : ''}" data-cell="${i}" data-value="${v}">${i === this.hero ? dinoSmall() : v}</div>`).join('');
    return `<div class="micro-board volcano-board" data-game="volcano" data-step="${this.step}" data-hero="${this.hero}">
      <div class="micro-board-title">火山跳石：按 1→5 跳过岩浆</div>
      <div class="micro-caption">方向键跳到相邻石头；踩错会退回起点</div>
      <div class="volcano-grid">${tiles}</div>
      <div class="micro-progress">已跳过 <b>${this.step - 1}</b> / 5 块</div>
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
      this.toastText = '踩空了，退回岩浆边';
      return { redraw: true };
    }
    this.hero = next;
    this.step += 1;
    this.toastText = '';
    if (this.step >= 5) return this.complete();
    return { redraw: true };
  }
}

/* 5. 脚印舞步 */
class FootprintGame extends DinoMicrogame {
  private pattern: Array<'left' | 'right' | 'up' | 'down'> = [];
  private entered = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    const all: Array<'left' | 'right' | 'up' | 'down'> = ['left', 'right', 'up', 'down'];
    this.pattern = Array.from({ length: 4 }, () => all[Math.floor(Math.random() * 4)]);
  }

  get info(): DinoGameInfo { return DINO_GAMES['dino-x5']; }

  render(): string {
    const icons: Record<string, string> = { left: footprintArt('left'), right: footprintArt('right'), up: footprintArt('up'), down: footprintArt('down') };
    const pattern = this.pattern.map((p, i) => `<span class="foot-step${i < this.entered ? ' is-done' : ''}">${icons[p]}</span>`).join('');
    return `<div class="micro-board footprint-board" data-game="footprint" data-pattern="${this.pattern.join(',')}" data-entered="${this.entered}">
      <div class="micro-board-title">跟着脚印走，踩完四步</div>
      <div class="micro-caption">按脚印方向依次踩；踩错从头再来</div>
      <div class="foot-pattern">${pattern}</div>
      <div class="foot-stage">${dinoSmall()}<span class="foot-count">${this.entered} / 4</span></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (!['left', 'right', 'up', 'down'].includes(action)) return {};
    if (action !== this.pattern[this.entered]) {
      this.entered = 0;
      this.toastText = '踩错脚印了，从头走';
      return { redraw: true };
    }
    this.entered += 1;
    this.toastText = '';
    if (this.entered >= this.pattern.length) window.setTimeout(() => this.complete(), 300);
    return { redraw: true };
  }
}

/* 6. 孵化保温 */
class HatchGame extends DinoMicrogame {
  private target = 4;
  private warmth = 0;
  private filling = false;
  private timer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 3 + Math.floor(Math.random() * 3);
  }

  get info(): DinoGameInfo { return DINO_GAMES['dino-x6']; }

  render(): string {
    return `<div class="micro-board hatch-board" data-game="hatch" data-target="${this.target}" data-warmth="${this.warmth.toFixed(1)}">
      <div class="micro-board-title">给恐龙蛋保温到 <b>${this.target}</b> 格</div>
      <div class="micro-caption">按住 OK 加温，到刻度松手；太热蛋会冷却重来</div>
      <div class="hatch-stage"><div class="hatch-egg">${eggArt()}</div><div class="hatch-gauge"><div class="hatch-fill" style="height:${this.warmth / 7 * 100}%"></div><div class="hatch-marker" style="bottom:${this.target / 7 * 100}%"><span>${this.target}</span></div></div><div class="hatch-heat">${flameArt()}</div></div>
      <div class="micro-progress">温度 <b>${this.warmth.toFixed(1)}</b> / ${this.target}</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  private start(): void {
    if (this.filling || this.finished) return;
    this.filling = true;
    this.timer = window.setInterval(() => {
      if (!this.filling) return;
      this.warmth = Math.min(7, this.warmth + 0.12);
      if (this.warmth >= 7) this.stop(true);
      else this.host.redraw();
    }, 90);
  }

  private stop(over = false): void {
    if (!this.filling) return;
    this.filling = false;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    if (over || this.warmth > this.target + 0.55) {
      this.toastText = '太热啦，蛋冷却重来';
      this.warmth = 0;
      this.host.redraw();
      return;
    }
    if (Math.abs(this.warmth - this.target) <= 0.45) this.complete();
    else {
      this.toastText = this.warmth < this.target ? '再暖一点' : '慢一点';
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

/* 7. 喂小恐龙 */
class FeedGame extends DinoMicrogame {
  private fed = 0;
  private target = 4;
  private slots = 5;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 3 + Math.floor(Math.random() * 3);
  }

  get info(): DinoGameInfo { return DINO_GAMES['dino-x7']; }

  render(): string {
    const leaves = Array.from({ length: this.slots }, (_, i) => `<button class="feed-leaf${this.focusClass(i)}${i < this.fed ? ' is-eaten' : ''}" data-slot="${i}" aria-label="叶子 ${i + 1}">${leafArt()}</button>`).join('');
    return `<div class="micro-board feed-board" data-game="feed" data-fed="${this.fed}" data-target="${this.target}">
      <div class="micro-board-title">喂小恐龙 <b>${this.target}</b> 片叶子</div>
      <div class="micro-caption">左右选叶子，按 OK 喂一片；喂够数量就完成</div>
      <div class="feed-stage"><div class="feed-dino">${dinoBig()}</div><div class="feed-leaves">${leaves}</div></div>
      <div class="micro-progress">已喂 <b>${this.fed}</b> / ${this.target} 片</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + 4) % 5; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % 5; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.fed >= this.target) return {};
      if (this.cursor < this.fed) { this.toastText = '这片叶子已经吃掉啦'; return { redraw: true }; }
      this.fed += 1;
      this.toastText = '';
      if (this.fed >= this.target) window.setTimeout(() => this.complete(), 350);
      return { redraw: true };
    }
    return {};
  }
}

/* 8. 化石分拣 */
class FossilSortGame extends DinoMicrogame {
  private fossils: number[] = [];
  private phase: 'fossil' | 'basket' = 'fossil';
  private selected = -1;
  private selectedValue = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.fossils = [3, 3, 5, 5].sort(() => Math.random() - 0.5);
  }

  get info(): DinoGameInfo { return DINO_GAMES['dino-x8']; }

  render(): string {
    const fossils = this.fossils.map((v, i) => `<button class="fossil-card${this.phase === 'fossil' ? this.focusClass(i) : ''}${this.selected === i ? ' is-selected' : ''}" data-value="${v}" aria-label="化石 ${v}">${fossilArt()}<span>${v}</span></button>`).join('');
    const baskets = [3, 5].map((v, i) => `<button class="fossil-basket${this.phase === 'basket' ? this.focusClass(i) : ''}" data-basket="${v}" aria-label="${v} 号筐"><span>${v}</span></button>`).join('');
    return `<div class="micro-board fossil-sort-board" data-game="sort" data-phase="${this.phase}" data-left="${this.fossils.length}">
      <div class="micro-board-title">把化石按数量放进对应筐</div>
      <div class="micro-caption">${this.phase === 'fossil' ? '左右选化石，按 OK 拿起' : '左右选筐，按 OK 放下'}</div>
      <div class="fossil-stage"><div class="fossil-cards">${fossils}</div><div class="fossil-baskets">${baskets}</div></div>
      <div class="micro-progress">还剩 <b>${this.fossils.length}</b> 块化石</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left' || action === 'right') {
      const size = this.phase === 'fossil' ? this.fossils.length : 2;
      if (!size) return {};
      this.cursor = (this.cursor + (action === 'left' ? size - 1 : 1)) % size;
      return { redraw: true };
    }
    if (action === 'confirm') {
      if (this.phase === 'fossil') {
        if (!this.fossils.length) return {};
        this.selected = this.cursor;
        this.selectedValue = this.fossils[this.cursor];
        this.phase = 'basket';
        this.cursor = 0;
        return { redraw: true };
      }
      const basket = this.cursor === 0 ? 3 : 5;
      if (basket === this.selectedValue) {
        this.fossils.splice(this.selected, 1);
        this.selected = -1;
        this.phase = 'fossil';
        this.cursor = 0;
        this.toastText = '';
        if (!this.fossils.length) window.setTimeout(() => this.complete(), 300);
      } else {
        this.toastText = '数量不对，再看看化石';
        this.phase = 'fossil';
        this.selected = -1;
        this.cursor = 0;
      }
      return { redraw: true };
    }
    return {};
  }
}

/* 9. 恐龙迷宫 */
class DinoMazeGame extends DinoMicrogame {
  private cols = 5;
  private grid: number[] = [];
  private step = 1;
  private hero = 0;
  private start = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.make();
  }

  get info(): DinoGameInfo { return DINO_GAMES['dino-x9']; }

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
    const tiles = this.grid.map((v, i) => `<div class="dino-tile${i === this.hero ? ' is-hero' : ''}" data-cell="${i}" data-value="${v}">${i === this.hero ? dinoSmall() : v}</div>`).join('');
    return `<div class="micro-board dino-maze-board" data-game="maze" data-step="${this.step}" data-hero="${this.hero}">
      <div class="micro-board-title">恐龙迷宫：按 1→5 走到巢穴</div>
      <div class="micro-caption">方向键走一格；走错就回到起点</div>
      <div class="dino-grid">${tiles}</div>
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
      this.toastText = '走错啦，回到巢穴口';
      return { redraw: true };
    }
    this.hero = next;
    this.step += 1;
    this.toastText = '';
    if (this.step >= 5) return this.complete();
    return { redraw: true };
  }
}

/* 10. 博物馆之夜 */
class MuseumGame extends DinoMicrogame {
  private order: number[] = [];
  private selected = -1;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.order = [1, 2, 3].sort(() => Math.random() - 0.5);
    if (this.order.join('') === '123') this.order = [2, 1, 3];
  }

  get info(): DinoGameInfo { return DINO_GAMES['dino-x10']; }

  render(): string {
    const items = this.order.map((v, i) => `<button class="museum-item${this.focusClass(i)}${this.selected === i ? ' is-selected' : ''}" data-item="${i}" data-number="${v}" aria-label="展品 ${v}">
      ${exhibitArt(v)}<span>${v}</span>
    </button>`).join('');
    return `<div class="micro-board museum-board" data-game="museum" data-order="${this.order.join(',')}">
      <div class="micro-board-title">把展品按 1 · 2 · 3 摆好</div>
      <div class="micro-caption">左右选展品，按 OK 与右边交换</div>
      <div class="museum-stage">${items}</div>
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
      this.selected = -1;
      this.toastText = '';
      if (this.order.join('') === '123') return this.complete();
      return { redraw: true };
    }
    return {};
  }
}

export function createDinoGame(level: Level, host: MicroHost): DinoMicrogame | null {
  switch (dinoGameFor(level.id)?.key) {
    case 'brush': return new BrushGame(level, host);
    case 'egg': return new EggGame(level, host);
    case 'bone': return new BoneGame(level, host);
    case 'volcano': return new VolcanoGame(level, host);
    case 'footprint': return new FootprintGame(level, host);
    case 'hatch': return new HatchGame(level, host);
    case 'feed': return new FeedGame(level, host);
    case 'sort': return new FossilSortGame(level, host);
    case 'maze': return new DinoMazeGame(level, host);
    case 'museum': return new MuseumGame(level, host);
    default: return null;
  }
}

/* art */
function brushArt(): string {
  return `<svg class="brush-art" viewBox="0 0 130 150" aria-hidden="true">
    <path d="M42 10 H88 L80 80 H50 Z" fill="#B87B48" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
    <path d="M50 22 H80 M52 36 H78 M54 50 H76" stroke="#8B5E3C" stroke-width="3" opacity="0.7"/>
    <path d="M50 80 H80 L94 112 H36 Z" fill="#DDBB83" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
    <g stroke="#8B6F4E" stroke-width="3" stroke-linecap="round"><path d="M44 110 L40 136 M54 110 L52 140 M64 110 L64 142 M74 110 L76 140 M84 110 L88 136"/></g>
    <g fill="#C5A36B"><circle cx="36" cy="126" r="4"/><circle cx="88" cy="120" r="3"/><circle cx="76" cy="132" r="2.5"/></g>
    <path d="M28 90 C20 84 20 76 30 78" fill="none" stroke="#23313F" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}
function footprintArt(dir: string): string {
  const rotate = dir === 'left' ? -90 : dir === 'right' ? 90 : dir === 'down' ? 180 : 0;
  return `<svg class="footprint-art" viewBox="0 0 100 100" aria-hidden="true" style="transform:rotate(${rotate}deg)">
    <path d="M50 84 C34 84 24 72 26 56 C28 42 38 34 50 34 C62 34 72 42 74 56 C76 72 66 84 50 84 Z" fill="#A9784F" stroke="#23313F" stroke-width="4"/>
    <g fill="#A9784F" stroke="#23313F" stroke-width="3.5" stroke-linejoin="round">
      <path d="M50 38 C40 30 36 16 44 8 C54 10 58 24 54 36 Z"/>
      <path d="M30 46 C18 44 10 34 14 24 C24 22 34 32 38 42 Z"/>
      <path d="M70 46 C82 44 90 34 86 24 C76 22 66 32 62 42 Z"/>
    </g>
    <path d="M40 60 C46 64 56 64 62 58" fill="none" stroke="#6E4D34" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
    <circle cx="46" cy="54" r="3" fill="#6E4D34"/><circle cx="56" cy="66" r="2.5" fill="#6E4D34"/>
  </svg>`;
}
function boneArt(): string {
  return `<svg viewBox="0 0 120 100" aria-hidden="true">
    <path d="M28 32 C16 30 10 40 18 48 C12 58 22 68 34 62 L84 46 C94 54 106 48 102 36 C108 26 98 16 88 22 Z" fill="#F4E6CB" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="27" cy="37" r="13" fill="#F4E6CB" stroke="#23313F" stroke-width="4"/>
    <circle cx="31" cy="55" r="12" fill="#F4E6CB" stroke="#23313F" stroke-width="4"/>
    <circle cx="95" cy="31" r="12" fill="#F4E6CB" stroke="#23313F" stroke-width="4"/>
    <circle cx="91" cy="48" r="13" fill="#F4E6CB" stroke="#23313F" stroke-width="4"/>
    <path d="M40 47 C56 43 74 39 88 38" fill="none" stroke="#D8C5A3" stroke-width="3" stroke-linecap="round"/>
    <path d="M44 57 C58 52 72 49 84 48" fill="none" stroke="#D8C5A3" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}
function eggArt(value?: number): string {
  return `<svg viewBox="0 0 110 130" aria-hidden="true">
    <path d="M55 6 C84 6 100 52 100 80 C100 108 80 124 55 124 C30 124 10 108 10 80 C10 52 26 6 55 6 Z" fill="#F6C7B9" stroke="#23313F" stroke-width="4"/>
    <path d="M28 48 C40 34 62 34 78 46 C62 44 46 51 36 64 C30 60 27 54 28 48 Z" fill="#FFE8DE" opacity="0.8"/>
    <g fill="#C95745" opacity="0.72"><circle cx="42" cy="58" r="8"/><circle cx="70" cy="72" r="5"/><circle cx="48" cy="92" r="6"/><circle cx="76" cy="98" r="3.5"/><circle cx="30" cy="78" r="3"/></g>
    <path d="M30 104 C38 96 45 104 52 96 C60 88 68 98 78 92" fill="none" stroke="#23313F" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/>
    <path d="M26 35 C34 24 44 18 56 17" fill="none" stroke="#FFFDF7" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
    ${value !== undefined ? `<circle cx="55" cy="76" r="23" fill="#FFFDF7" stroke="#23313F" stroke-width="3"/><text x="55" y="86" text-anchor="middle" font-family="Arial Rounded MT Bold, sans-serif" font-size="30" font-weight="700" fill="#23313F">${value}</text>` : ''}
  </svg>`;
}
function dinoSmall(): string {
  return `<svg viewBox="0 0 120 110" aria-hidden="true">
    <path d="M20 80 C8 68 16 48 34 46 C48 28 76 30 86 48 C104 52 108 72 92 80 C74 92 38 92 20 80 Z" fill="#79BC5B" stroke="#23313F" stroke-width="4"/>
    <path d="M86 50 C92 36 108 32 116 42 C122 50 114 60 104 60 C102 70 92 74 86 66 Z" fill="#8FCB72" stroke="#23313F" stroke-width="4"/>
    <circle cx="104" cy="46" r="4.5" fill="#23313F"/><circle cx="105" cy="44" r="1.5" fill="#FFFDF7"/>
    <path d="M112 54 q5 3 1 7" fill="none" stroke="#23313F" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M40 44 l-4 -17 l17 12 M64 38 l2 -18 l13 15 M82 40 l11 -13 l4 16" fill="#FFC94A" stroke="#23313F" stroke-width="3" stroke-linejoin="round"/>
    <g fill="#FFC94A" opacity="0.9"><circle cx="54" cy="62" r="4"/><circle cx="72" cy="54" r="3"/><circle cx="82" cy="70" r="3.5"/></g>
    <path d="M42 84 L36 104 M76 86 L82 104 M54 88 L54 104" stroke="#23313F" stroke-width="5" stroke-linecap="round"/>
  </svg>`;
}
function dinoBig(): string {
  return `<svg viewBox="0 0 240 230" aria-hidden="true">
    <path d="M28 170 C8 138 32 98 68 90 C86 58 132 54 160 76 C196 76 222 112 208 148 C192 188 80 204 28 170 Z" fill="#79BC5B" stroke="#23313F" stroke-width="6"/>
    <path d="M44 152 C64 118 124 112 168 132 C190 142 198 164 184 182 C160 206 78 208 48 186 C38 178 36 166 44 152 Z" fill="#B7DE9A" stroke="#23313F" stroke-width="4"/>
    <path d="M162 88 C168 52 204 40 226 58 C244 72 234 100 214 106 C218 126 202 138 186 126 L174 104 Z" fill="#8FCB72" stroke="#23313F" stroke-width="5"/>
    <circle cx="218" cy="66" r="9" fill="#FFFDF7" stroke="#23313F" stroke-width="3"/><circle cx="220" cy="66" r="4" fill="#23313F"/>
    <path d="M234 86 C242 92 238 102 230 102" fill="none" stroke="#23313F" stroke-width="3" stroke-linecap="round"/>
    <path d="M78 74 l-10 -30 l28 20 M122 60 l4 -32 l22 26 M154 66 l18 -24 l6 28" fill="#FFC94A" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
    <g fill="#FFC94A" opacity="0.9"><circle cx="82" cy="126" r="7"/><circle cx="108" cy="112" r="5"/><circle cx="132" cy="148" r="5"/><circle cx="150" cy="118" r="4"/></g>
    <path d="M60 190 L50 222 M162 194 L172 222 M94 198 L94 224" stroke="#23313F" stroke-width="7" stroke-linecap="round"/>
    <path d="M58 220 h18 M162 220 h18 M88 222 h12" stroke="#23313F" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}
function fossilArt(): string {
  return `<svg viewBox="0 0 120 110" aria-hidden="true">
    <path d="M8 84 C12 40 42 12 86 18 C112 22 116 48 100 68 C80 92 34 100 8 84 Z" fill="#D8C5A3" stroke="#23313F" stroke-width="4"/>
    <g fill="none" stroke="#8B6F4E" stroke-width="4" stroke-linecap="round">
      <path d="M28 46 C38 36 52 34 64 40 C76 46 82 58 78 70"/>
      <path d="M40 58 C48 52 58 52 66 58 M44 70 C52 64 62 64 70 70 M34 76 C44 84 62 86 78 80"/>
      <path d="M78 70 C88 66 96 58 98 48"/>
    </g>
    <circle cx="44" cy="42" r="7" fill="#8B6F4E" opacity="0.45"/>
  </svg>`;
}
function leafArt(): string {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M12 80 C10 34 40 12 84 14 C84 56 60 84 12 80 Z" fill="#79B85A" stroke="#23313F" stroke-width="4"/>
    <path d="M20 74 C36 58 56 36 78 22" fill="none" stroke="#4D8A43" stroke-width="4"/>
    <g fill="none" stroke="#A9D98E" stroke-width="2" opacity="0.8"><path d="M34 62 L42 54 M44 52 L54 46 M54 40 L62 34 M40 70 L48 64"/></g>
    <ellipse cx="64" cy="60" rx="5" ry="3" fill="#F6D7BF" opacity="0.7"/>
  </svg>`;
}
function flameArt(): string {
  return `<svg viewBox="0 0 90 110" aria-hidden="true">
    <path d="M45 6 C22 38 16 54 26 78 C34 96 58 98 66 78 C76 50 60 26 45 6 Z" fill="#F27059" stroke="#23313F" stroke-width="4"/>
    <path d="M45 34 C34 52 34 66 44 76 C54 66 54 52 45 34 Z" fill="#FFC94A"/>
    <path d="M45 52 C40 60 40 68 45 72 C50 68 50 60 45 52 Z" fill="#FFFDF7"/>
    <path d="M26 38 C18 46 18 56 24 62" fill="none" stroke="#FFC94A" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
  </svg>`;
}
function exhibitArt(v: number): string { return v === 1 ? dinoSmall() : v === 2 ? fossilArt() : eggArt(); }
