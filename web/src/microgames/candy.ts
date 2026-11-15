import type { Level } from '../types';
import { escapeHtml } from '../ui';
import { Microgame, type MicroAction, type MicroGameInfo, type MicroHost, type MicroResult } from './base';

export type CandyGameKey = 'conveyor' | 'balance' | 'wrap' | 'claw' | 'elevator' | 'tray' | 'jar' | 'pipe' | 'slot' | 'pachinko';
export interface CandyGameInfo extends MicroGameInfo { key: CandyGameKey; }

export const CANDY_GAMES: Record<string, CandyGameInfo> = {
  'candy-1': {
    key: 'conveyor', name: '糖果传送带', verb: '看准订单数字，在糖果经过扫描口时按 OK',
    controls: [{ icon: 'ok', label: '停传送带' }, { icon: 'back', label: '回地图' }],
  },
  'candy-2': {
    key: 'balance', name: '糖果天平', verb: '用左右键往两边加糖，让天平一样重',
    controls: [{ icon: 'left', label: '左边加糖' }, { icon: 'right', label: '右边加糖' }, { icon: 'back', label: '回地图' }],
  },
  'candy-3': {
    key: 'wrap', name: '糖纸包装', verb: '记住糖纸顺序，按颜色一格一格包好',
    controls: [{ icon: 'left', label: '选颜色' }, { icon: 'right', label: '选颜色' }, { icon: 'ok', label: '包一格' }, { icon: 'back', label: '回地图' }],
  },
  'candy-x4': {
    key: 'claw', name: '夹糖机', verb: '左右移动夹爪，按 OK 放下夹糖',
    controls: [{ icon: 'left', label: '移夹爪' }, { icon: 'right', label: '移夹爪' }, { icon: 'ok', label: '放下' }, { icon: 'back', label: '回地图' }],
  },
  'candy-x5': {
    key: 'elevator', name: '糖果电梯', verb: '上下开电梯，停在正确的楼层',
    controls: [{ icon: 'up', label: '上一层' }, { icon: 'down', label: '下一层' }, { icon: 'ok', label: '停这里' }, { icon: 'back', label: '回地图' }],
  },
  'candy-x6': {
    key: 'tray', name: '糖果托盘', verb: '在托盘格子里放糖或取糖，正好凑够数量',
    controls: [{ icon: 'left', label: '选格子' }, { icon: 'right', label: '选格子' }, { icon: 'up', label: '选格子' }, { icon: 'down', label: '选格子' }, { icon: 'ok', label: '放/取' }, { icon: 'back', label: '回地图' }],
  },
  'candy-x7': {
    key: 'jar', name: '糖果罐', verb: '按住 OK 装糖，到目标数量松手',
    controls: [{ icon: 'ok', label: '按住装糖' }, { icon: 'up', label: '松手' }, { icon: 'back', label: '回地图' }],
  },
  'candy-x8': {
    key: 'pipe', name: '糖果管道', verb: '转动手里的管道，把三节接成直线',
    controls: [{ icon: 'left', label: '选管道' }, { icon: 'right', label: '选管道' }, { icon: 'ok', label: '转一下' }, { icon: 'back', label: '回地图' }],
  },
  'candy-x9': {
    key: 'slot', name: '糖果拉霸', verb: '按 OK 依次停住三个转轮，停出三颗一样的糖',
    controls: [{ icon: 'ok', label: '停转轮' }, { icon: 'back', label: '回地图' }],
  },
  'candy-x10': {
    key: 'pachinko', name: '糖果弹珠', verb: '左右移动投糖口，把糖弹进目标数字杯',
    controls: [{ icon: 'left', label: '移投口' }, { icon: 'right', label: '移投口' }, { icon: 'ok', label: '投糖' }, { icon: 'back', label: '回地图' }],
  },
};

export function candyGameFor(id: string): CandyGameInfo | null { return CANDY_GAMES[id] ?? null; }

abstract class CandyMicrogame extends Microgame<CandyGameInfo> {}

/* 1. 传送带：数字糖果移动，按 OK 停在订单数字下面 */
class ConveyorGame extends CandyMicrogame {
  private target = 4;
  private candies: number[] = [];
  private scanner = 0;
  private timer: number | null = null;
  private stopped = false;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 2 + Math.floor(Math.random() * 6);
    const values = [this.target];
    while (values.length < 6) {
      const v = 1 + Math.floor(Math.random() * 7);
      if (!values.includes(v)) values.push(v);
    }
    this.candies = values.sort(() => Math.random() - 0.5);
    this.timer = window.setInterval(() => {
      if (this.finished || this.stopped) return;
      this.scanner = (this.scanner + 1) % this.candies.length;
      this.host.redraw();
    }, 760);
  }

  get info(): CandyGameInfo { return CANDY_GAMES['candy-1']; }

  render(): string {
    const belt = this.candies.map((value, index) => `<div class="conveyor-candy${index === this.scanner ? ' is-under' : ''}" data-value="${value}">${candyArt(value)}</div>`).join('');
    return `<div class="micro-board conveyor-board" data-game="conveyor" data-target="${this.target}" data-scanner="${this.scanner}">
      <div class="micro-board-title">订单：<b>${this.target}</b> 号糖果</div>
      <div class="micro-caption">糖果在传送带上走，经过扫描口时按 OK 停下</div>
      <div class="conveyor-order">${candyArt(this.target)}<span>目标</span></div>
      <div class="conveyor-stage"><div class="conveyor-belt"></div><div class="conveyor-items">${belt}</div><div class="conveyor-scanner"></div></div>
      <div class="micro-progress">${this.stopped ? '停下来了' : '扫描口在移动…'}</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action !== 'confirm' || this.stopped) return {};
    this.stopped = true;
    if (this.candies[this.scanner] === this.target) {
      this.stopped = false;
      return this.complete();
    }
    this.toastText = '不是这盒，传送带重新转起来';
    window.setTimeout(() => { this.stopped = false; this.host.redraw(); }, 650);
    return { redraw: true };
  }

  dispose(): void { if (this.timer !== null) window.clearInterval(this.timer); this.timer = null; }
}

/* 2. 天平：往左右加糖，两边一样多 */
class BalanceGame extends CandyMicrogame {
  private left = 0;
  private right = 0;
  private target = 3;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 2 + Math.floor(Math.random() * 4);
  }

  get info(): CandyGameInfo { return CANDY_GAMES['candy-2']; }

  render(): string {
    const tilt = Math.max(-8, Math.min(8, (this.right - this.left) * 2));
    const pile = (n: number) => Array.from({ length: n }, () => candyArt(2)).join('');
    return `<div class="micro-board balance-board" data-game="balance" data-left="${this.left}" data-right="${this.right}" data-target="${this.target}">
      <div class="micro-board-title">让两边一样多，每边要到 <b>${this.target}</b> 颗</div>
      <div class="micro-caption">左键往左盘加，右键往右盘加</div>
      <div class="balance-stage">
        <div class="balance-arm" style="transform:rotate(${tilt}deg)">
          <div class="balance-pan left"><div class="balance-pile">${pile(this.left)}</div><span class="balance-count">${this.left}</span></div>
          <div class="balance-pivot">${scaleArt()}</div>
          <div class="balance-pan right"><div class="balance-pile">${pile(this.right)}</div><span class="balance-count">${this.right}</span></div>
        </div>
      </div>
      <div class="micro-progress">左 ${this.left} · 右 ${this.right}</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') this.left = Math.min(this.target, this.left + 1);
    else if (action === 'right') this.right = Math.min(this.target, this.right + 1);
    else return {};
    if (this.left === this.target && this.right === this.target) {
      window.setTimeout(() => this.complete(), 400);
    } else if (this.left === this.target && this.right === this.target) {
      this.toastText = '';
    }
    return { redraw: true };
  }
}

/* 3. 糖纸包装：记住颜色顺序，逐格复现 */
class WrapGame extends CandyMicrogame {
  private colors = ['strawberry', 'lemon', 'mint'];
  private pattern: string[] = [];
  private entered: string[] = [];
  private choice = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.pattern = Array.from({ length: 4 }, () => this.colors[Math.floor(Math.random() * 3)]);
  }

  get info(): CandyGameInfo { return CANDY_GAMES['candy-3']; }

  render(): string {
    const target = this.pattern.map((c) => `<span class="wrap-chip ${c}">${wrappedCandyArt(c)}</span>`).join('');
    const progress = this.pattern.map((c, i) => `<span class="wrap-slot ${i < this.entered.length ? this.entered[i] : 'empty'}">${i < this.entered.length ? wrappedCandyArt(this.entered[i]) : ''}</span>`).join('');
    const choices = this.colors.map((c, i) => `<button class="wrap-color ${c}${i === this.choice ? ' is-focused' : ''}" data-color="${c}" aria-label="${c}">${wrappedCandyArt(c)}</button>`).join('');
    return `<div class="micro-board wrap-board" data-game="wrap" data-pattern="${this.pattern.join(',')}" data-entered="${this.entered.join(',')}">
      <div class="micro-board-title">照着糖纸顺序包好</div>
      <div class="micro-caption">看上面的颜色，左右选颜色，按 OK 包一格</div>
      <div class="wrap-target">${target}</div>
      <div class="wrap-progress">${progress}</div>
      <div class="wrap-colors">${choices}</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left' || action === 'right') {
      this.choice = (this.choice + (action === 'left' ? 2 : 1)) % 3;
      return { redraw: true };
    }
    if (action === 'confirm') {
      const color = this.colors[this.choice];
      const expected = this.pattern[this.entered.length];
      if (color !== expected) {
        this.entered = [];
        this.toastText = '颜色不对，糖纸重包';
        return { redraw: true };
      }
      this.entered.push(color);
      this.toastText = '';
      if (this.entered.length === this.pattern.length) window.setTimeout(() => this.complete(), 300);
      return { redraw: true };
    }
    return {};
  }
}

/* 4. 夹糖机：左右移动夹爪，按 OK 放下夹糖 */
class ClawGame extends CandyMicrogame {
  private candyAt: boolean[] = [];
  private caught = 0;
  private target = 3;
  private dropping = false;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.candyAt = Array(5).fill(false);
    for (const i of [1, 3, 4]) this.candyAt[i] = true;
    this.target = 3;
  }

  get info(): CandyGameInfo { return CANDY_GAMES['candy-x4']; }

  render(): string {
    const lanes = this.candyAt.map((has, i) => `<div class="claw-lane${this.focusClass(i)}" data-lane="${i}">
      ${has ? `<div class="claw-candy">${candyArt(3)}</div>` : ''}
      <div class="claw-line"></div>
    </div>`).join('');
    return `<div class="micro-board claw-board" data-game="claw" data-caught="${this.caught}" data-target="${this.target}" data-cursor="${this.cursor}">
      <div class="micro-board-title">夹起 <b>${this.target}</b> 颗糖</div>
      <div class="micro-caption">左右移动夹爪，对准糖果按 OK 放下</div>
      <div class="claw-stage"><div class="claw-rail"></div><div class="claw-head" style="left:${this.cursor * 20 + 10}%">${clawArt()}</div><div class="claw-lanes">${lanes}</div></div>
      <div class="micro-progress">已夹 <b>${this.caught}</b> / ${this.target} 颗</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + 4) % 5; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % 5; return { redraw: true }; }
    if (action === 'confirm') {
      if (!this.candyAt[this.cursor]) { this.toastText = '这里没有糖，换个位置'; return { redraw: true }; }
      this.candyAt[this.cursor] = false;
      this.caught += 1;
      this.toastText = '';
      if (this.caught >= this.target) window.setTimeout(() => this.complete(), 350);
      return { redraw: true };
    }
    return {};
  }
}

/* 5. 糖果电梯：上下开电梯，停在正确楼层 */
class ElevatorGame extends CandyMicrogame {
  private target = 3;
  private floors = 5;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 2 + Math.floor(Math.random() * 4);
  }

  get info(): CandyGameInfo { return CANDY_GAMES['candy-x5']; }

  render(): string {
    const floors = Array.from({ length: this.floors }, (_, i) => {
      const floor = i;
      return `<div class="elevator-floor${this.focusClass(floor)}" data-floor="${floor + 1}">
        <span class="elevator-door"></span><span class="elevator-panel">${candyArt((floor % 5) + 1)}</span>
      </div>`;
    }).reverse().join('');
    return `<div class="micro-board elevator-board" data-game="elevator" data-target="${this.target}" data-floor="${this.cursor + 1}">
      <div class="micro-board-title">从下往上数，坐电梯到第 <b>${this.target}</b> 层</div>
      <div class="micro-caption">上下移动电梯，按 OK 停在正确楼层</div>
      <div class="elevator-shaft"><div class="elevator-car" style="bottom:${this.cursor * 20 + 2}%">${candyArt(2)}</div>${floors}</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'up') { this.cursor = Math.min(this.floors - 1, this.cursor + 1); return { redraw: true }; }
    if (action === 'down') { this.cursor = Math.max(0, this.cursor - 1); return { redraw: true }; }
    if (action === 'confirm') {
      if (this.cursor + 1 === this.target) return this.complete();
      this.toastText = '不是这一层，再数一数';
      return { redraw: true };
    }
    return {};
  }
}

/* 6. 糖果托盘：在 3×3 格子里放/取糖，正好 N 颗 */
class TrayGame extends CandyMicrogame {
  private target = 5;
  private placed = new Set<number>();
  private cols = 3;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 4 + Math.floor(Math.random() * 3);
  }

  get info(): CandyGameInfo { return CANDY_GAMES['candy-x6']; }

  render(): string {
    const cells = Array.from({ length: 9 }, (_, i) => `<button class="tray-cell${this.focusClass(i)}${this.placed.has(i) ? ' is-filled' : ''}" data-cell="${i}" aria-label="托盘格 ${i + 1}">
      ${this.placed.has(i) ? candyArt((i % 3) + 1) : '<span class="tray-empty"></span>'}
    </button>`).join('');
    return `<div class="micro-board tray-board" data-game="tray" data-target="${this.target}" data-placed="${this.placed.size}">
      <div class="micro-board-title">在托盘里放正好 <b>${this.target}</b> 颗糖</div>
      <div class="micro-caption">方向键选格子，按 OK 放糖；再按一次取走</div>
      <div class="tray-grid">${cells}</div>
      <div class="micro-progress">已放 <b>${this.placed.size}</b> / ${this.target} 颗</div>
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
      if (this.placed.has(this.cursor)) this.placed.delete(this.cursor);
      else if (this.placed.size < this.target) this.placed.add(this.cursor);
      else { this.toastText = '先取走一颗再放'; return { redraw: true }; }
      this.toastText = '';
      if (this.placed.size === this.target) window.setTimeout(() => this.complete(), 300);
    } else return {};
    return { redraw: true };
  }
}

/* 7. 糖果罐：按住 OK 装糖，到目标数量松手 */
class JarGame extends CandyMicrogame {
  private target = 5;
  private count = 0;
  private filling = false;
  private timer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 4 + Math.floor(Math.random() * 4);
  }

  get info(): CandyGameInfo { return CANDY_GAMES['candy-x7']; }

  render(): string {
    const candies = Array.from({ length: this.count }, (_, i) => `<span class="jar-candy" style="--i:${i}">${candyArt((i % 3) + 1)}</span>`).join('');
    return `<div class="micro-board jar-board" data-game="jar" data-target="${this.target}" data-count="${this.count}">
      <div class="micro-board-title">装 <b>${this.target}</b> 颗糖进罐子</div>
      <div class="micro-caption">按住 OK 装糖，到目标数量就松手</div>
      <div class="jar-stage"><div class="jar-lid"></div><div class="jar-body">${candies}<div class="jar-count">${this.count}</div></div><div class="jar-machine">${candyArt(4)}</div></div>
      <div class="micro-progress">罐子里 <b>${this.count}</b> / ${this.target} 颗</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  private start(): void {
    if (this.filling || this.finished) return;
    this.filling = true;
    this.timer = window.setInterval(() => {
      if (!this.filling) return;
      this.count += 1;
      if (this.count > this.target) {
        this.stop(true);
      } else {
        this.host.redraw();
        if (this.count === this.target) this.stop(false);
      }
    }, 260);
  }

  private stop(over = false): void {
    if (!this.filling) return;
    this.filling = false;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    if (over) {
      this.toastText = '装太多啦，倒出来重来';
      this.count = 0;
      this.host.redraw();
      return;
    }
    if (this.count === this.target) this.complete();
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'confirm') { this.start(); return {}; }
    if (action === 'release' || action === 'up') { this.stop(false); return {}; }
    return {};
  }

  dispose(): void { if (this.timer !== null) window.clearInterval(this.timer); this.timer = null; this.filling = false; }
}

/* 8. 糖果管道：转动三节管道，接成一条直线 */
class PipeGame extends CandyMicrogame {
  private orientations: number[] = [1, 1, 1];

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.orientations = Array.from({ length: 3 }, () => [1, 2, 3][Math.floor(Math.random() * 3)]);
  }

  get info(): CandyGameInfo { return CANDY_GAMES['candy-x8']; }

  render(): string {
    const pipes = this.orientations.map((orientation, i) => `<button class="pipe-tile${this.focusClass(i)}" data-index="${i}" data-orientation="${orientation}" aria-label="管道 ${i + 1}">
      <span class="pipe-segment" style="transform:rotate(${orientation * 90}deg)"><i></i></span>
    </button>`).join('');
    return `<div class="micro-board pipe-board" data-game="pipe" data-orientations="${this.orientations.join(',')}">
      <div class="micro-board-title">把三节管道接成一条直线</div>
      <div class="micro-caption">左右选管道，按 OK 旋转；接口对齐就会通</div>
      <div class="pipe-stage"><div class="pipe-source">${candyArt(1)}</div>${pipes}<div class="pipe-target">${candyArt(4)}</div></div>
      <div class="micro-progress">已对齐 <b>${this.orientations.filter((o) => o === 0).length}</b> / 3 节</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + 2) % 3; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % 3; return { redraw: true }; }
    if (action === 'confirm') {
      this.orientations[this.cursor] = (this.orientations[this.cursor] + 1) % 4;
      if (this.orientations.every((o) => o === 0)) window.setTimeout(() => this.complete(), 300);
      return { redraw: true };
    }
    return {};
  }
}

/* 9. 糖果拉霸：三个转轮依次停下，凑成三颗一样的糖 */
class SlotGame extends CandyMicrogame {
  private reels = [0, 1, 2];
  private stopped = [false, false, false];
  private active = 0;
  private timer: number | null = null;
  private symbols = [0, 1, 2];
  private lock = false;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.timer = window.setInterval(() => {
      if (this.lock) return;
      this.reels = this.reels.map((value, index) => this.stopped[index] ? value : (value + 1) % 3);
      this.host.redraw();
    }, 480);
  }

  get info(): CandyGameInfo { return CANDY_GAMES['candy-x9']; }

  render(): string {
    const reels = this.reels.map((value, index) => `<div class="slot-reel${this.stopped[index] ? ' is-stopped' : ''}${index === this.active ? ' is-active' : ''}" data-index="${index}" data-value="${value}">${slotArt(value)}</div>`).join('');
    return `<div class="micro-board slot-board" data-game="slot" data-reels="${this.reels.join(',')}" data-active="${this.active}" data-stopped="${this.stopped.filter(Boolean).length}">
      <div class="micro-board-title">停出三颗一样的糖</div>
      <div class="micro-caption">按 OK 依次停住转轮；三个一样就中奖</div>
      <div class="slot-machine"><div class="slot-lights">${Array.from({ length: 9 }, () => '<i></i>').join('')}</div><div class="slot-reels">${reels}</div><div class="slot-handle">${slotHandle()}</div></div>
      <div class="micro-progress">已停 <b>${this.stopped.filter(Boolean).length}</b> / 3 个</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action !== 'confirm' || this.lock) return {};
    if (this.stopped[this.active]) {
      this.active = this.stopped.findIndex((s) => !s);
      if (this.active < 0) this.active = 0;
      return { redraw: true };
    }
    this.stopped[this.active] = true;
    if (this.stopped.every(Boolean)) {
      if (this.reels.every((v) => v === this.reels[0])) return this.complete();
      this.lock = true;
      this.toastText = '没凑齐，再来一次';
      this.active = 0;
      window.setTimeout(() => {
        this.stopped = [false, false, false];
        this.lock = false;
        this.host.redraw();
      }, 700);
      return { redraw: true };
    }
    this.active = this.stopped.findIndex((s) => !s);
    return { redraw: true };
  }

  dispose(): void { if (this.timer !== null) window.clearInterval(this.timer); this.timer = null; }
}

/* 10. 糖果弹珠：移动投糖口，把糖投进目标数字杯 */
class PachinkoGame extends CandyMicrogame {
  private target = 3;
  private cups = 5;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 2 + Math.floor(Math.random() * 4);
  }

  get info(): CandyGameInfo { return CANDY_GAMES['candy-x10']; }

  render(): string {
    const cups = Array.from({ length: this.cups }, (_, i) => `<div class="pachinko-cup${i === this.cursor ? ' is-focused' : ''}" data-cup="${i + 1}">
      <span class="cup-number">${i + 1}</span>
    </div>`).join('');
    return `<div class="micro-board pachinko-board" data-game="pachinko" data-target="${this.target}" data-cursor="${this.cursor}">
      <div class="micro-board-title">把糖弹进 <b>${this.target}</b> 号杯</div>
      <div class="micro-caption">左右移动投糖口，按 OK 投一颗；投错可以再投</div>
      <div class="pachinko-stage"><div class="pachinko-pegs">${Array.from({ length: 9 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div><div class="pachinko-cups">${cups}</div><div class="pachinko-launcher" style="left:${this.cursor * 20 + 10}%">${candyArt(2)}</div></div>
      <div class="micro-progress">投口对准 <b>${this.cursor + 1}</b> 号杯</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + 4) % 5; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % 5; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.cursor + 1 === this.target) return this.complete();
      this.toastText = '弹到别的杯子里了，再试一次';
      return { redraw: true };
    }
    return {};
  }
}

export function createCandyGame(level: Level, host: MicroHost): CandyMicrogame | null {
  switch (candyGameFor(level.id)?.key) {
    case 'conveyor': return new ConveyorGame(level, host);
    case 'balance': return new BalanceGame(level, host);
    case 'wrap': return new WrapGame(level, host);
    case 'claw': return new ClawGame(level, host);
    case 'elevator': return new ElevatorGame(level, host);
    case 'tray': return new TrayGame(level, host);
    case 'jar': return new JarGame(level, host);
    case 'pipe': return new PipeGame(level, host);
    case 'slot': return new SlotGame(level, host);
    case 'pachinko': return new PachinkoGame(level, host);
    default: return null;
  }
}

function candyArt(value: number): string {
  const colors = ['#F28C6E', '#FFC94A', '#8ED3B0', '#8E7CC3', '#F6A25E', '#7FB6D9', '#E58DAF'];
  const c = colors[(value - 1 + colors.length) % colors.length];
  return `<svg class="candy-svg" viewBox="0 0 110 90" aria-hidden="true">
    <path d="M22 28 C8 18 4 6 18 10 C30 14 36 22 40 28 M88 28 C102 18 106 6 92 10 C80 14 74 22 70 28" fill="${c}" stroke="#23313F" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M19 15 C25 20 29 24 32 28 M91 15 C85 20 81 24 78 28" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="55" cy="52" rx="31" ry="28" fill="${c}" stroke="#23313F" stroke-width="4"/>
    <path d="M34 39 C40 29 52 25 63 28 C54 34 46 42 42 53 C37 51 34 46 34 39 Z" fill="rgba(255,255,255,.45)"/>
    <path d="M40 64 C48 72 64 74 72 64" fill="none" stroke="rgba(35,49,63,.25)" stroke-width="3" stroke-linecap="round"/>
    <g fill="#FFFDF7" opacity="0.9"><circle cx="36" cy="55" r="3"/><circle cx="73" cy="45" r="2.5"/><circle cx="67" cy="69" r="2"/></g>
    <circle cx="55" cy="52" r="22" fill="#FFFDF7" stroke="#23313F" stroke-width="3"/>
    <text x="55" y="63" text-anchor="middle" font-family="Arial Rounded MT Bold, sans-serif" font-size="32" font-weight="700" fill="#23313F">${value}</text>
  </svg>`;
}
function wrappedCandyArt(color: string): string {
  const c = color === 'strawberry' ? '#F28C6E' : color === 'lemon' ? '#FFC94A' : color === 'mint' ? '#8ED3B0' : color;
  return `<svg class="wrapped-candy-svg" viewBox="0 0 140 84" aria-hidden="true">
    <path d="M8 22 C24 12 36 18 42 30 L42 54 C34 66 20 70 8 60 Z" fill="${c}" stroke="#23313F" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M132 22 C116 12 104 18 98 30 L98 54 C106 66 120 70 132 60 Z" fill="${c}" stroke="#23313F" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M38 29 C50 22 90 22 102 29 L102 55 C90 62 50 62 38 55 Z" fill="${c}" stroke="#23313F" stroke-width="4"/>
    <path d="M48 32 C60 26 82 26 94 32" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="5" stroke-linecap="round"/>
    <path d="M42 58 C54 66 86 66 98 58" fill="none" stroke="rgba(35,49,63,.28)" stroke-width="3" stroke-linecap="round"/>
    <g fill="#FFFDF7" opacity="0.85"><circle cx="55" cy="48" r="3"/><circle cx="70" cy="38" r="2.5"/><circle cx="87" cy="48" r="3"/></g>
    <path d="M28 26 C32 34 32 46 28 54 M112 26 C108 34 108 46 112 54" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}
function scaleArt(): string {
  return `<svg class="scale-svg" viewBox="0 0 180 160" aria-hidden="true">
    <path d="M90 18 V128" stroke="#23313F" stroke-width="7" stroke-linecap="round"/>
    <path d="M48 144 H132" stroke="#23313F" stroke-width="8" stroke-linecap="round"/>
    <path d="M62 144 C70 130 110 130 118 144" fill="none" stroke="#B9875B" stroke-width="8" stroke-linecap="round"/>
    <path d="M36 42 H144" stroke="#23313F" stroke-width="5" stroke-linecap="round"/>
    <circle cx="90" cy="42" r="13" fill="#FFC94A" stroke="#23313F" stroke-width="4"/>
    <path d="M90 29 l5 8 9 1 -7 7 2 9 -9 -4 -9 4 2 -9 -7 -7 9 -1 Z" fill="#FFFDF7" stroke="#23313F" stroke-width="1.5"/>
    <circle cx="36" cy="42" r="7" fill="#F28C6E" stroke="#23313F" stroke-width="3"/><circle cx="144" cy="42" r="7" fill="#8ED3B0" stroke="#23313F" stroke-width="3"/>
    <path d="M28 42 C34 52 38 62 36 72 M152 42 C146 52 142 62 144 72" fill="none" stroke="#23313F" stroke-width="3" stroke-linecap="round"/>
    <path d="M20 72 H52 M128 72 H160" stroke="#23313F" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}
function clawArt(): string {
  return `<svg class="claw-svg" viewBox="0 0 130 165" aria-hidden="true">
    <path d="M65 0 V38" stroke="#23313F" stroke-width="9" stroke-linecap="round"/>
    <path d="M65 0 V38" stroke="#B9C7D0" stroke-width="4" stroke-linecap="round"/>
    <rect x="35" y="36" width="60" height="34" rx="10" fill="#B9C7D0" stroke="#23313F" stroke-width="4"/>
    <circle cx="65" cy="53" r="8" fill="#FFC94A" stroke="#23313F" stroke-width="3"/>
    <path d="M42 70 C28 82 24 98 32 112 M88 70 C102 82 106 98 98 112" fill="#D8E2E8" stroke="#23313F" stroke-width="5" stroke-linejoin="round"/>
    <path d="M35 110 C26 122 28 137 40 145 C48 134 48 122 44 112 Z" fill="#D8E2E8" stroke="#23313F" stroke-width="4"/>
    <path d="M95 110 C104 122 102 137 90 145 C82 134 82 122 86 112 Z" fill="#D8E2E8" stroke="#23313F" stroke-width="4"/>
    <path d="M48 72 C50 86 54 94 65 102 C76 94 80 86 82 72" fill="none" stroke="#23313F" stroke-width="4"/>
    <circle cx="48" cy="82" r="4" fill="#FFC94A" stroke="#23313F" stroke-width="2"/><circle cx="82" cy="82" r="4" fill="#FFC94A" stroke="#23313F" stroke-width="2"/>
    <path d="M40 48 H90" stroke="rgba(255,255,255,.7)" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}
function slotArt(value: number): string {
  const c = value === 0 ? '#F28C6E' : value === 1 ? '#FFC94A' : '#8ED3B0';
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M22 40 C10 32 8 22 20 26 C28 29 34 35 38 41 M78 40 C90 32 92 22 80 26 C72 29 66 35 62 41" fill="${c}" stroke="#23313F" stroke-width="3.5"/>
    <ellipse cx="50" cy="56" rx="28" ry="25" fill="${c}" stroke="#23313F" stroke-width="4"/>
    <path d="M32 46 C38 38 48 36 56 38 C48 43 42 50 40 58 C35 55 32 51 32 46 Z" fill="rgba(255,255,255,.5)"/>
    <circle cx="42" cy="57" r="3.5" fill="#23313F"/><circle cx="58" cy="57" r="3.5" fill="#23313F"/>
    <path d="M44 67 q6 5 12 0" fill="none" stroke="#23313F" stroke-width="2.5" stroke-linecap="round"/>
    <g fill="#FFFDF7" opacity="0.85"><circle cx="34" cy="66" r="2.5"/><circle cx="66" cy="66" r="2.5"/></g>
  </svg>`;
}

function slotHandle(): string { return `<svg viewBox="0 0 80 180" aria-hidden="true"><path d="M40 12 V100" stroke="#23313F" stroke-width="10" stroke-linecap="round"/><circle cx="40" cy="14" r="15" fill="#F28C6E" stroke="#23313F" stroke-width="4"/><path d="M40 108 V158" stroke="#23313F" stroke-width="6"/></svg>`; }
