import type { Level } from '../types';
import { escapeHtml } from '../ui';
import { Microgame, type MicroAction, type MicroGameInfo, type MicroHost, type MicroResult } from './base';

export type MagicGameKey = 'potion' | 'transform' | 'mirror' | 'spell' | 'broom' | 'creature' | 'maze' | 'stars' | 'balance' | 'finale';
export interface MagicGameInfo extends MicroGameInfo { key: MagicGameKey; }
const L = (label: string) => ({ icon: 'left' as const, label });
const R = (label: string) => ({ icon: 'right' as const, label });
const U = (label: string) => ({ icon: 'up' as const, label });
const D = (label: string) => ({ icon: 'down' as const, label });
const OK = (label: string) => ({ icon: 'ok' as const, label });
const BACK = { icon: 'back' as const, label: '回地图' };
const mk = (key: MagicGameKey, name: string, verb: string, controls: MagicGameInfo['controls']): MagicGameInfo => ({ key, name, verb, controls });

export const MAGIC_GAMES: Record<string, MagicGameInfo> = {
  'magic-x1': mk('potion', '魔法药水', '按配方颜色顺序倒药水', [L('选药水'), R('选药水'), OK('倒一格'), BACK]),
  'magic-x2': mk('transform', '变形咒', '左右选形状，把花园变成目标图案', [L('变'), R('变'), OK('定形'), BACK]),
  'magic-x3': mk('mirror', '镜像花', '翻转花镜，拼出目标亮花图案', [L('选镜'), R('选镜'), U('选镜'), D('选镜'), OK('翻转'), BACK]),
  'magic-x4': mk('spell', '魔法阵', '转动三圈符文，把标记对齐', [L('选圈'), R('选圈'), OK('转一下'), BACK]),
  'magic-x5': mk('broom', '飞天扫帚', '左右飞，接住掉落的星星', [L('飞'), R('飞'), BACK]),
  'magic-x6': mk('creature', '魔法生物', '翻牌配对三只魔法生物', [L('选牌'), R('选牌'), U('选牌'), D('选牌'), OK('翻牌'), BACK]),
  'magic-x7': mk('maze', '花园迷宫', '5×5 花园迷宫按 1→5 走到喷泉', [L('走'), R('走'), U('走'), D('走'), BACK]),
  'magic-x8': mk('stars', '星星采集', '在花圃里收集正好数量的星星', [L('选'), R('选'), U('选'), D('选'), OK('采集'), BACK]),
  'magic-x9': mk('balance', '魔法天平', '左右加魔法花，让两边一样重', [L('左'), R('右'), BACK]),
  'magic-x10': mk('finale', '花园庆典', '按庆典顺序完成四步魔法', [L('选'), R('选'), U('选'), D('选'), BACK]),
};

export function magicGameFor(id: string): MagicGameInfo | null { return MAGIC_GAMES[id] ?? null; }
abstract class MagicMicrogame extends Microgame<MagicGameInfo> {}
const POTION_COLORS = ['#F28C6E', '#FFC94A', '#8ED3B0'];

/* 1. 配药 */
class PotionGame extends MagicMicrogame {
  private pattern: number[] = [];
  private entered: number[] = [];
  private choice = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.pattern = Array.from({ length: 4 }, () => Math.floor(Math.random() * 3));
  }

  get info(): MagicGameInfo { return MAGIC_GAMES['magic-x1']; }

  render(): string {
    const recipe = this.pattern.map((n, i) => `<span class="potion-chip" style="--c:${POTION_COLORS[n]}${i < this.entered.length ? ';opacity:1' : ';opacity:.4'}">${potionArt(POTION_COLORS[n])}</span>`).join('');
    const choices = POTION_COLORS.map((c, i) => `<button class="potion-choice${i === this.choice ? ' is-focused' : ''}" style="background:${c}" data-potion="${i}" aria-label="药水 ${i + 1}">${potionArt(c)}</button>`).join('');
    return `<div class="micro-board potion-board" data-game="potion" data-pattern="${this.pattern.join(',')}" data-entered="${this.entered.join(',')}">
      <div class="micro-board-title">按配方顺序倒四格药水</div>
      <div class="micro-caption">看上面的颜色，左右选药水，按 OK 倒一格</div>
      <div class="potion-recipe">${recipe}</div>
      <div class="potion-choices">${choices}</div>
      <div class="micro-progress">已倒 <b>${this.entered.length}</b> / 4 格</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left' || action === 'right') { this.choice = (this.choice + (action === 'left' ? 2 : 1)) % 3; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.pattern[this.entered.length] !== this.choice) {
        this.entered = [];
        this.toastText = '药水顺序错了，重新配';
        return { redraw: true };
      }
      this.entered.push(this.choice);
      this.toastText = '';
      if (this.entered.length >= 4) window.setTimeout(() => this.complete(), 300);
      return { redraw: true };
    }
    return {};
  }
}

/* 2. 变形咒 */
class TransformGame extends MagicMicrogame {
  private target = 0;
  private shape = 0;
  private shapes = ['flower', 'star', 'mushroom'];

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = Math.floor(Math.random() * 3);
  }

  get info(): MagicGameInfo { return MAGIC_GAMES['magic-x2']; }

  render(): string {
    return `<div class="micro-board transform-board" data-game="transform" data-target="${this.target}" data-shape="${this.shape}">
      <div class="micro-board-title">把花园变成目标形状</div>
      <div class="micro-caption">左右切换形状，按 OK 定形；目标在右上角</div>
      <div class="transform-stage"><div class="transform-target">${shapeArt(this.shapes[this.target])}</div><div class="transform-main">${shapeArt(this.shapes[this.shape])}</div></div>
      <div class="micro-progress">当前：${this.shapes[this.shape]}</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.shape = (this.shape + 2) % 3; return { redraw: true }; }
    if (action === 'right') { this.shape = (this.shape + 1) % 3; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.shape === this.target) return this.complete();
      this.toastText = '形状不对，再变一次';
      return { redraw: true };
    }
    return {};
  }
}

/* 3. 镜像花 */
class MirrorGame extends MagicMicrogame {
  private target: boolean[] = [];
  private current: boolean[] = [];

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = Array.from({ length: 6 }, () => Math.random() > 0.45);
    this.current = Array.from({ length: 6 }, () => Math.random() > 0.5);
  }

  get info(): MagicGameInfo { return MAGIC_GAMES['magic-x3']; }

  render(): string {
    const target = this.target.map((on) => `<span class="magic-dot${on ? ' is-on' : ''}"></span>`).join('');
    const tiles = this.current.map((on, i) => `<button class="magic-mirror${this.focusClass(i)}${on ? ' is-on' : ''}" data-index="${i}" data-on="${on ? 1 : 0}" aria-label="花镜 ${i + 1}">${magicMirrorArt()}</button>`).join('');
    return `<div class="micro-board magic-mirror-board" data-game="mirror" data-target="${this.target.map(Number).join('')}" data-current="${this.current.map(Number).join('')}">
      <div class="micro-board-title">把花镜拼成上面的亮花图案</div>
      <div class="micro-caption">方向键选镜子，按 OK 翻转</div>
      <div class="magic-mirror-pattern">${target}</div>
      <div class="magic-mirror-grid">${tiles}</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    const row = Math.floor(this.cursor / 3);
    const col = this.cursor % 3;
    if (action === 'left' && col > 0) this.cursor -= 1;
    else if (action === 'right' && col < 2) this.cursor += 1;
    else if (action === 'up' && row > 0) this.cursor -= 3;
    else if (action === 'down' && row < 1) this.cursor += 3;
    else if (action === 'confirm') {
      this.current[this.cursor] = !this.current[this.cursor];
      this.toastText = '';
      if (this.target.every((v, i) => v === this.current[i])) window.setTimeout(() => this.complete(), 300);
    } else return {};
    return { redraw: true };
  }
}

/* 4. 魔法阵 */
class SpellGame extends MagicMicrogame {
  private rings = [1, 2, 3];

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.rings = Array.from({ length: 3 }, () => [1, 2, 3][Math.floor(Math.random() * 3)]);
  }

  get info(): MagicGameInfo { return MAGIC_GAMES['magic-x4']; }

  render(): string {
    const rings = this.rings.map((o, i) => `<button class="spell-ring${this.focusClass(i)}" data-ring="${i}" data-orientation="${o}" aria-label="符文圈 ${i + 1}">
      <span style="transform:rotate(${o * 90}deg)">${runeArt()}</span>
    </button>`).join('');
    return `<div class="micro-board spell-board" data-game="spell" data-rings="${this.rings.join(',')}">
      <div class="micro-board-title">转动三圈符文，让金色标记朝上</div>
      <div class="micro-caption">左右选圈，按 OK 转 90°；三圈对齐就完成</div>
      <div class="spell-stage">${rings}</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + 2) % 3; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % 3; return { redraw: true }; }
    if (action === 'confirm') {
      this.rings[this.cursor] = (this.rings[this.cursor] + 1) % 4;
      if (this.rings.every((r) => r === 0)) window.setTimeout(() => this.complete(), 300);
      return { redraw: true };
    }
    return {};
  }
}

/* 5. 飞天扫帚 */
class BroomGame extends MagicMicrogame {
  private slots = 5;
  private caught = 0;
  private target = 5;
  private stars: Array<{ x: number; y: number }> = [];
  private timer: number | null = null;
  private spawnTimer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.stars.push({ x: 2, y: 0 });
    this.timer = window.setInterval(() => {
      this.stars = this.stars.map((s) => ({ x: s.x, y: s.y + 5 })).filter((s) => {
        if (s.y < 300) return true;
        if (Math.abs(s.x - this.cursor) <= 1) this.caught += 1;
        return false;
      });
      if (this.caught >= this.target) this.complete();
      this.host.redraw();
    }, 90);
    this.spawnTimer = window.setInterval(() => {
      if (this.finished) return;
      this.stars.push({ x: Math.floor(Math.random() * this.slots), y: 0 });
    }, 560);
  }

  get info(): MagicGameInfo { return MAGIC_GAMES['magic-x5']; }

  render(): string {
    const stars = this.stars.map((s) => `<span class="magic-fall-star" style="left:${s.x * 20 + 10}%;top:${s.y}px">${starArt()}</span>`).join('');
    return `<div class="micro-board magic-broom-board" data-game="broom" data-caught="${this.caught}" data-target="${this.target}">
      <div class="micro-board-title">接住 <b>${this.target}</b> 颗魔法星</div>
      <div class="micro-caption">左右飞扫帚，让星星落进光圈</div>
      <div class="magic-broom-stage">${stars}<div class="magic-broom" style="left:${this.cursor * 20 + 10}%">${broomArt()}</div><div class="magic-broom-ground"></div></div>
      <div class="micro-progress">已接 <b>${this.caught}</b> / ${this.target} 颗</div>
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

/* 6. 魔法生物 */
class CreatureGame extends MagicMicrogame {
  private cards: string[] = [];
  private opened: number[] = [];
  private matched = new Set<number>();
  private first = -1;
  private lock = false;
  private timer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.cards = ['fairy', 'fairy', 'dragon', 'dragon', 'unicorn', 'unicorn'].sort(() => Math.random() - 0.5);
  }

  get info(): MagicGameInfo { return MAGIC_GAMES['magic-x6']; }

  render(): string {
    const cards = this.cards.map((v, i) => `<button class="creature-card${this.focusClass(i)}${this.opened.includes(i) || this.matched.has(i) ? ' is-open' : ''}${this.matched.has(i) ? ' is-matched' : ''}" data-card="${i}" data-kind="${v}" aria-label="魔法牌 ${i + 1}">
      <span class="creature-back">${creatureBackArt()}</span><span class="creature-face">${creatureArt(v)}</span>
    </button>`).join('');
    return `<div class="micro-board creature-board" data-game="creature" data-matched="${this.matched.size}">
      <div class="micro-board-title">翻牌配对三只魔法生物</div>
      <div class="micro-caption">方向键选牌，按 OK 翻开</div>
      <div class="creature-grid">${cards}</div>
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
      const a = this.first; const b = this.cursor;
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

/* 7. 花园迷宫 */
class MagicMazeGame extends MagicMicrogame {
  private cols = 5;
  private grid: number[] = [];
  private step = 1;
  private hero = 0;
  private start = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.make();
  }

  get info(): MagicGameInfo { return MAGIC_GAMES['magic-x7']; }

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
    const tiles = this.grid.map((v, i) => `<div class="magic-maze-tile${i === this.hero ? ' is-hero' : ''}" data-cell="${i}" data-value="${v}">${i === this.hero ? fairyArt() : v}</div>`).join('');
    return `<div class="micro-board magic-maze-board" data-game="maze" data-step="${this.step}" data-hero="${this.hero}">
      <div class="micro-board-title">花园迷宫：按 1→5 走到喷泉</div>
      <div class="micro-caption">方向键走一格；走错回到起点</div>
      <div class="magic-maze-grid">${tiles}</div>
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
      this.toastText = '走错啦，回到花园门';
      return { redraw: true };
    }
    this.hero = next;
    this.step += 1;
    this.toastText = '';
    if (this.step >= 5) return this.complete();
    return { redraw: true };
  }
}

/* 8. 星星采集 */
class MagicStarsGame extends MagicMicrogame {
  private cells: boolean[] = [];
  private collected = 0;
  private target = 4;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.cells = Array.from({ length: 9 }, (_, i) => i % 2 === 0 || Math.random() > 0.65);
    this.target = 4;
  }

  get info(): MagicGameInfo { return MAGIC_GAMES['magic-x8']; }

  render(): string {
    const cells = this.cells.map((has, i) => `<button class="magic-star-cell${this.focusClass(i)}${has ? ' has-star' : ''}" data-cell="${i}" aria-label="花圃 ${i + 1}">${has ? starArt() : '<span class="magic-empty"></span>'}</button>`).join('');
    return `<div class="micro-board magic-star-board" data-game="stars" data-collected="${this.collected}" data-target="${this.target}">
      <div class="micro-board-title">收集正好 <b>${this.target}</b> 颗魔法星</div>
      <div class="micro-caption">方向键移动，按 OK 采集星星</div>
      <div class="magic-star-grid">${cells}</div>
      <div class="micro-progress">已收集 <b>${this.collected}</b> / ${this.target} 颗</div>
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
      if (!this.cells[this.cursor]) { this.toastText = '这里没有星星'; return { redraw: true }; }
      this.cells[this.cursor] = false;
      this.collected += 1;
      this.toastText = '';
      if (this.collected >= this.target) window.setTimeout(() => this.complete(), 300);
    } else return {};
    return { redraw: true };
  }
}

/* 9. 魔法天平 */
class MagicBalanceGame extends MagicMicrogame {
  private left = 0;
  private right = 0;
  private target = 3;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 2 + Math.floor(Math.random() * 4);
  }

  get info(): MagicGameInfo { return MAGIC_GAMES['magic-x9']; }

  render(): string {
    return `<div class="micro-board magic-balance-board" data-game="balance" data-left="${this.left}" data-right="${this.right}" data-target="${this.target}">
      <div class="micro-board-title">让两边魔法花一样多，每边 <b>${this.target}</b> 朵</div>
      <div class="micro-caption">左键加左，右键加右</div>
      <div class="magic-balance-stage"><div class="magic-balance-pan">${Array.from({ length: this.left }, () => flowerArt()).join('')}<b>${this.left}</b></div><div class="magic-balance-pivot">${runePivotArt()}</div><div class="magic-balance-pan">${Array.from({ length: this.right }, () => flowerArt()).join('')}<b>${this.right}</b></div></div>
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

/* 10. 花园庆典 */
class FinaleGame extends MagicMicrogame {
  private pattern: Array<'left' | 'right' | 'up' | 'down'> = [];
  private entered = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    const all: Array<'left' | 'right' | 'up' | 'down'> = ['left', 'right', 'up', 'down'];
    this.pattern = Array.from({ length: 4 }, () => all[Math.floor(Math.random() * 4)]);
  }

  get info(): MagicGameInfo { return MAGIC_GAMES['magic-x10']; }

  render(): string {
    const icons: Record<string, string> = { left: magicStepArt('left'), right: magicStepArt('right'), up: magicStepArt('up'), down: magicStepArt('down') };
    return `<div class="micro-board finale-board" data-game="finale" data-pattern="${this.pattern.join(',')}" data-entered="${this.entered}">
      <div class="micro-board-title">花园庆典：完成四步魔法</div>
      <div class="micro-caption">按庆典顺序按方向键；错一步重新开始</div>
      <div class="finale-pattern">${this.pattern.map((p, i) => `<span class="finale-step${i < this.entered ? ' is-done' : ''}">${icons[p]}</span>`).join('')}</div>
      <div class="finale-stage">${fairyArt()}<span>${this.entered} / 4</span></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (!['left', 'right', 'up', 'down'].includes(action)) return {};
    if (action !== this.pattern[this.entered]) {
      this.entered = 0;
      this.toastText = '魔法顺序错了，重新来';
      return { redraw: true };
    }
    this.entered += 1;
    this.toastText = '';
    if (this.entered >= 4) window.setTimeout(() => this.complete(), 300);
    return { redraw: true };
  }
}

export function createMagicGame(level: Level, host: MicroHost): MagicMicrogame | null {
  switch (magicGameFor(level.id)?.key) {
    case 'potion': return new PotionGame(level, host);
    case 'transform': return new TransformGame(level, host);
    case 'mirror': return new MirrorGame(level, host);
    case 'spell': return new SpellGame(level, host);
    case 'broom': return new BroomGame(level, host);
    case 'creature': return new CreatureGame(level, host);
    case 'maze': return new MagicMazeGame(level, host);
    case 'stars': return new MagicStarsGame(level, host);
    case 'balance': return new MagicBalanceGame(level, host);
    case 'finale': return new FinaleGame(level, host);
    default: return null;
  }
}

/* art */
function potionArt(color: string): string {
  return `<svg class="potion-art" viewBox="0 0 100 130" aria-hidden="true">
    <rect x="38" y="8" width="24" height="18" rx="4" fill="#B87B48" stroke="#23313F" stroke-width="3"/>
    <path d="M38 26 H62 V42 C82 54 88 82 70 104 C52 124 26 116 18 94 C10 72 24 50 38 42 Z" fill="#EAF7FF" fill-opacity="0.65" stroke="#23313F" stroke-width="4"/>
    <path d="M25 76 C34 66 48 68 58 74 C70 82 78 78 84 68 C88 92 74 108 54 111 C34 114 20 100 25 76 Z" fill="${color}" opacity="0.9"/>
    <path d="M30 90 C38 98 54 100 66 92" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="4" stroke-linecap="round"/>
    <g fill="rgba(255,255,255,.8)"><circle cx="44" cy="64" r="4"/><circle cx="62" cy="58" r="2.5"/><circle cx="58" cy="82" r="3"/></g>
    <path d="M28 46 C24 34 32 28 40 34" fill="none" stroke="#8E7CC3" stroke-width="3" stroke-linecap="round"/>
    <circle cx="80" cy="34" r="4" fill="#FFC94A" stroke="#23313F" stroke-width="1.5"/>
  </svg>`;
}
function shapeArt(s: string): string {
  if (s === 'flower') return `<svg class="shape-flower" viewBox="0 0 120 120" aria-hidden="true">
    <path d="M60 114 C58 92 50 74 58 58" fill="none" stroke="#4D8A43" stroke-width="6" stroke-linecap="round"/>
    <path d="M58 86 C40 86 30 74 32 62 C48 62 58 72 58 86 Z" fill="#79B85A" stroke="#23313F" stroke-width="3"/>
    <g fill="#F28C6E" stroke="#23313F" stroke-width="3">
      <ellipse cx="60" cy="26" rx="14" ry="20"/><ellipse cx="38" cy="38" rx="14" ry="20" transform="rotate(-55 38 38)"/><ellipse cx="82" cy="38" rx="14" ry="20" transform="rotate(55 82 38)"/><ellipse cx="30" cy="60" rx="14" ry="20" transform="rotate(-115 30 60)"/><ellipse cx="90" cy="60" rx="14" ry="20" transform="rotate(115 90 60)"/>
    </g>
    <circle cx="60" cy="50" r="14" fill="#FFC94A" stroke="#23313F" stroke-width="3"/>
    <g fill="#E8834E"><circle cx="56" cy="46" r="2"/><circle cx="64" cy="50" r="2"/><circle cx="57" cy="55" r="2"/></g>
  </svg>`;
  if (s === 'star') return `<svg class="shape-star" viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="60" cy="62" r="50" fill="#FFE7A0" opacity="0.22"/>
    <path d="M60 8 L74 44 L110 48 L82 72 L92 110 L60 89 L28 110 L38 72 L10 48 L46 44 Z" fill="#FFC94A" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
    <path d="M60 26 L68 49 L92 52 L73 68 L78 90 L60 78 L42 90 L47 68 L28 52 L52 49 Z" fill="#FFE49B"/>
    <path d="M60 40 L64 54 L78 55 L67 64 L70 78 L60 70 L50 78 L53 64 L42 55 L56 54 Z" fill="#FFF8D8" opacity="0.9"/>
  </svg>`;
  return `<svg class="shape-mushroom" viewBox="0 0 120 120" aria-hidden="true">
    <path d="M46 114 C40 92 42 76 48 62 H72 C78 76 80 92 74 114 Z" fill="#FFF1D8" stroke="#23313F" stroke-width="4"/>
    <path d="M16 64 C16 24 104 24 104 64 C86 74 34 74 16 64 Z" fill="#F28C6E" stroke="#23313F" stroke-width="4"/>
    <g fill="#FFFDF7"><circle cx="42" cy="48" r="7"/><circle cx="72" cy="40" r="5"/><circle cx="86" cy="56" r="6"/><circle cx="58" cy="60" r="3.5"/></g>
    <circle cx="52" cy="84" r="3.5" fill="#23313F"/><circle cx="68" cy="84" r="3.5" fill="#23313F"/>
    <path d="M54 94 q6 5 12 0" fill="none" stroke="#23313F" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}
function magicMirrorArt(): string {
  return `<svg class="magic-mirror-art" viewBox="0 0 120 110" aria-hidden="true">
    <path d="M60 6 L112 50 L60 104 L8 50 Z" fill="#8E7CC3" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
    <path d="M60 16 L100 50 L60 92 L20 50 Z" fill="#DCEBFA" stroke="#23313F" stroke-width="3"/>
    <path d="M32 44 C40 30 56 26 68 32 C58 36 48 44 44 54 C40 52 34 50 32 44 Z" fill="rgba(255,255,255,.85)"/>
    <path d="M40 72 C48 64 58 60 70 58" fill="none" stroke="#FFFDF7" stroke-width="3" stroke-linecap="round"/>
    <g fill="#FFFDF7" opacity="0.9"><circle cx="28" cy="34" r="3"/><circle cx="96" cy="42" r="4"/><circle cx="88" cy="74" r="3"/></g>
  </svg>`;
}
function runeArt(): string {
  return `<svg class="rune-art" viewBox="0 0 170 170" aria-hidden="true">
    <circle cx="85" cy="85" r="70" fill="rgba(142,124,195,.16)" stroke="#8E7CC3" stroke-width="6"/>
    <circle cx="85" cy="85" r="54" fill="none" stroke="#FFC94A" stroke-width="3" stroke-dasharray="8 9"/>
    <circle cx="85" cy="85" r="36" fill="none" stroke="#DCEBFA" stroke-width="2" opacity="0.7"/>
    <path d="M85 22 L108 85 L85 148 L62 85 Z" fill="none" stroke="#FFC94A" stroke-width="4"/>
    <path d="M22 85 H148 M85 22 V148" stroke="#DCEBFA" stroke-width="2" opacity="0.5"/>
    <g fill="#FFC94A"><circle cx="85" cy="22" r="5"/><circle cx="148" cy="85" r="5"/><circle cx="85" cy="148" r="5"/><circle cx="22" cy="85" r="5"/></g>
    <circle cx="85" cy="85" r="13" fill="#F6C7B9" stroke="#23313F" stroke-width="3"/>
    <path d="M85 78 l4 7 8 1 -6 5 2 8 -8 -4 -8 4 2 -8 -6 -5 8 -1 Z" fill="#FFFDF7"/>
  </svg>`;
}
function starArt(): string {
  return `<svg class="magic-star" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="52" r="42" fill="#FFE7A0" opacity="0.24"/>
    <path d="M50 8 L62 36 L92 40 L68 60 L76 90 L50 73 L24 90 L32 60 L8 40 L38 36 Z" fill="#FFC94A" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
    <path d="M50 24 L56 41 L74 42 L60 53 L65 70 L50 60 L35 70 L40 53 L26 42 L44 41 Z" fill="#FFE49B"/>
  </svg>`;
}
function broomArt(): string {
  return `<svg class="broom-art" viewBox="0 0 190 140" aria-hidden="true">
    <path d="M20 116 L124 30" stroke="#8B5E3C" stroke-width="10" stroke-linecap="round"/>
    <path d="M20 116 L124 30" stroke="#C9956B" stroke-width="4" stroke-linecap="round"/>
    <path d="M118 40 C138 10 180 12 178 42 C176 64 148 76 126 60 Z" fill="#F6C7B9" stroke="#23313F" stroke-width="4"/>
    <g fill="none" stroke="#D98A4E" stroke-width="3"><path d="M146 24 C158 30 162 44 154 56 M136 28 C148 36 150 48 142 58 M158 30 C168 38 168 48 160 58"/></g>
    <path d="M12 108 C2 124 6 136 20 138 C34 140 40 128 32 116 Z" fill="#8B5E3C" stroke="#23313F" stroke-width="3"/>
    <path d="M32 108 L12 138" stroke="#FFC94A" stroke-width="5"/>
    <g fill="#FFC94A"><path d="M96 74 l4 10 11 1 -9 7 3 11 -10 -6 -10 6 3 -11 -9 -7 11 -1 Z"/><path d="M74 96 l2 6 7 1 -5 5 1 6 -5 -3 -6 3 1 -6 -5 -5 7 -1 Z"/></g>
  </svg>`;
}
function creatureArt(v: string): string {
  if (v === 'fairy') return `<svg class="creature-fairy" viewBox="0 0 120 120" aria-hidden="true">
    <path d="M60 42 C36 36 24 16 34 12 C46 8 56 28 58 42 Z M60 42 C84 36 96 16 86 12 C74 8 64 28 62 42 Z" fill="#DCEBFA" stroke="#23313F" stroke-width="3"/>
    <circle cx="60" cy="46" r="24" fill="#F6C7B9" stroke="#23313F" stroke-width="4"/>
    <path d="M60 68 C44 76 42 98 60 108 C78 98 76 76 60 68 Z" fill="#8ED3B0" stroke="#23313F" stroke-width="4"/>
    <circle cx="51" cy="44" r="3.5" fill="#23313F"/><circle cx="69" cy="44" r="3.5" fill="#23313F"/>
    <path d="M55 56 q5 4 10 0" fill="none" stroke="#23313F" stroke-width="2.5"/>
    <path d="M60 12 l4 9 10 1 -8 6 2 10 -8 -5 -8 5 2 -10 -8 -6 10 -1 Z" fill="#FFC94A" stroke="#23313F" stroke-width="2"/>
  </svg>`;
  if (v === 'dragon') return `<svg class="creature-dragon" viewBox="0 0 120 120" aria-hidden="true">
    <path d="M26 58 C22 24 58 12 84 26 C106 38 108 64 92 78 C78 90 52 90 40 78 Z" fill="#8ED3B0" stroke="#23313F" stroke-width="4"/>
    <path d="M42 28 L34 8 L54 22 M82 20 L94 4 L94 26" fill="#FFC94A" stroke="#23313F" stroke-width="3"/>
    <path d="M80 34 C96 30 112 38 114 54 C104 52 94 54 86 62" fill="#8ED3B0" stroke="#23313F" stroke-width="3"/>
    <circle cx="80" cy="42" r="4.5" fill="#23313F"/><circle cx="80" cy="40" r="1.5" fill="#FFFDF7"/>
    <path d="M92 54 q8 4 2 9" fill="none" stroke="#23313F" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M34 78 C22 90 18 106 30 114 C40 120 48 108 44 96" fill="#8ED3B0" stroke="#23313F" stroke-width="3"/>
    <g fill="#FFC94A"><circle cx="52" cy="54" r="3"/><circle cx="66" cy="62" r="2.5"/><circle cx="44" cy="68" r="2"/></g>
  </svg>`;
  return `<svg class="creature-unicorn" viewBox="0 0 120 120" aria-hidden="true">
    <path d="M56 38 C48 18 62 6 78 16 C94 26 92 48 80 60 C70 70 56 66 52 54 Z" fill="#DCEBFA" stroke="#23313F" stroke-width="4"/>
    <path d="M68 16 L74 0 L82 18" fill="#FFC94A" stroke="#23313F" stroke-width="3"/>
    <path d="M48 34 C34 34 28 46 34 58 C38 66 48 68 56 62" fill="#8E7CC3" stroke="#23313F" stroke-width="4"/>
    <path d="M46 24 C38 16 42 4 54 8 C64 12 62 24 56 30" fill="#DCEBFA" stroke="#23313F" stroke-width="3"/>
    <circle cx="76" cy="34" r="4.5" fill="#23313F"/><circle cx="76" cy="32" r="1.5" fill="#FFFDF7"/>
    <path d="M88 44 q8 4 2 9" fill="none" stroke="#23313F" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M42 62 C40 82 54 96 72 96 C90 96 98 82 94 66" fill="#DCEBFA" stroke="#23313F" stroke-width="3"/>
    <path d="M50 72 C60 64 78 64 88 72" fill="none" stroke="#B9A7D8" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}
function fairyArt(): string {
  return `<svg class="fairy-art" viewBox="0 0 160 210" aria-hidden="true">
    <path d="M80 52 C48 40 32 14 48 8 C64 2 74 28 78 50 Z M80 52 C112 40 128 14 112 8 C96 2 86 28 82 50 Z" fill="#DCEBFA" stroke="#23313F" stroke-width="4"/>
    <circle cx="80" cy="58" r="30" fill="#F6C7B9" stroke="#23313F" stroke-width="4"/>
    <path d="M50 58 C46 30 60 18 80 18 C100 18 114 30 110 58 C100 44 92 40 80 40 C68 40 60 44 50 58 Z" fill="#8E7CC3" stroke="#23313F" stroke-width="4"/>
    <circle cx="68" cy="56" r="4" fill="#23313F"/><circle cx="92" cy="56" r="4" fill="#23313F"/>
    <path d="M74 70 q6 5 12 0" fill="none" stroke="#23313F" stroke-width="3" stroke-linecap="round"/>
    <circle cx="58" cy="68" r="4" fill="#F6A696" opacity="0.65"/><circle cx="102" cy="68" r="4" fill="#F6A696" opacity="0.65"/>
    <path d="M54 90 C58 84 102 84 106 90 L124 164 H36 Z" fill="#8ED3B0" stroke="#23313F" stroke-width="4"/>
    <path d="M48 102 C32 114 26 136 32 156 M112 102 C128 114 134 136 128 156" fill="none" stroke="#23313F" stroke-width="4"/>
    <path d="M64 164 H96 L104 202 H56 Z" fill="#B9A7D8" stroke="#23313F" stroke-width="4"/>
    <path d="M56 202 L44 214 M104 202 L116 214" stroke="#23313F" stroke-width="5" stroke-linecap="round"/>
    <path d="M80 104 l5 9 11 1 -8 7 2 11 -10 -6 -10 6 2 -11 -8 -7 11 -1 Z" fill="#FFC94A" stroke="#23313F" stroke-width="2"/>
    <g fill="#FFC94A"><path d="M30 74 l3 8 9 1 -7 6 2 8 -7 -4 -7 4 2 -8 -7 -6 9 -1 Z"/><path d="M126 46 l2 6 7 1 -5 5 1 6 -5 -3 -6 3 1 -6 -5 -5 7 -1 Z"/></g>
  </svg>`;
}
function flowerArt(): string {
  return `<svg class="magic-flower-art" viewBox="0 0 110 110" aria-hidden="true">
    <path d="M55 104 C53 88 48 78 54 64" fill="none" stroke="#4D8A43" stroke-width="6" stroke-linecap="round"/>
    <path d="M54 86 C38 84 30 74 32 64 C46 64 54 72 54 86 Z" fill="#79B85A" stroke="#23313F" stroke-width="2.5"/>
    <g fill="#F28C6E" stroke="#23313F" stroke-width="3">
      <ellipse cx="55" cy="26" rx="13" ry="20"/><ellipse cx="34" cy="38" rx="13" ry="20" transform="rotate(-55 34 38)"/><ellipse cx="76" cy="38" rx="13" ry="20" transform="rotate(55 76 38)"/><ellipse cx="32" cy="60" rx="13" ry="20" transform="rotate(-115 32 60)"/><ellipse cx="78" cy="60" rx="13" ry="20" transform="rotate(115 78 60)"/>
    </g>
    <circle cx="55" cy="48" r="13" fill="#FFC94A" stroke="#23313F" stroke-width="3"/>
    <g fill="#E8834E"><circle cx="51" cy="44" r="2"/><circle cx="59" cy="48" r="2"/><circle cx="52" cy="53" r="2"/></g>
  </svg>`;
}
function magicStepArt(dir: string): string {
  const rotate = dir === 'left' ? -90 : dir === 'right' ? 90 : dir === 'down' ? 180 : 0;
  return `<svg class="magic-step-art" viewBox="0 0 100 100" aria-hidden="true" style="transform:rotate(${rotate}deg)">
    <circle cx="50" cy="50" r="36" fill="rgba(255,201,74,.16)" stroke="#8E7CC3" stroke-width="3"/>
    <path d="M50 18 V78" stroke="#8B5E3C" stroke-width="5" stroke-linecap="round"/>
    <path d="M50 18 l6 13 14 2 -10 9 3 14 -13 -7 -13 7 3 -14 -10 -9 14 -2 Z" fill="#FFC94A" stroke="#23313F" stroke-width="2.5"/>
    <path d="M50 64 L34 82 M50 64 L66 82" stroke="#23313F" stroke-width="4" stroke-linecap="round"/>
    <circle cx="50" cy="78" r="6" fill="#F6C7B9" stroke="#23313F" stroke-width="2.5"/>
  </svg>`;
}
function creatureBackArt(): string {
  return `<svg class="creature-back-art" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="38" fill="#8E7CC3" stroke="#23313F" stroke-width="3"/>
    <path d="M50 20 l5 14 15 1 -11 9 4 15 -13 -8 -13 8 4 -15 -11 -9 15 -1 Z" fill="#FFC94A" stroke="#23313F" stroke-width="2"/>
    <g fill="#FFFDF7"><circle cx="24" cy="30" r="3"/><circle cx="78" cy="34" r="2.5"/><circle cx="82" cy="70" r="3"/><circle cx="26" cy="72" r="2.5"/></g>
  </svg>`;
}
function runePivotArt(): string {
  return `<svg class="rune-pivot-art" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="30" fill="#8E7CC3" stroke="#23313F" stroke-width="3"/>
    <path d="M50 26 L60 50 L50 74 L40 50 Z" fill="#FFC94A" stroke="#23313F" stroke-width="2"/>
    <circle cx="50" cy="50" r="6" fill="#FFFDF7"/>
  </svg>`;
}
