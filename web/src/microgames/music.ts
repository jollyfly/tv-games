import type { Level } from '../types';
import { escapeHtml } from '../ui';
import { Microgame, type MicroAction, type MicroGameInfo, type MicroHost, type MicroResult } from './base';

export type MusicGameKey = 'echo' | 'queue' | 'memory' | 'baton' | 'pitch' | 'bubble' | 'drum' | 'maze' | 'choir' | 'stage';
export interface MusicGameInfo extends MicroGameInfo { key: MusicGameKey; }
const L = (label: string) => ({ icon: 'left' as const, label });
const R = (label: string) => ({ icon: 'right' as const, label });
const U = (label: string) => ({ icon: 'up' as const, label });
const D = (label: string) => ({ icon: 'down' as const, label });
const OK = (label: string) => ({ icon: 'ok' as const, label });
const BACK = { icon: 'back' as const, label: '回地图' };
const mk = (key: MusicGameKey, name: string, verb: string, controls: MusicGameInfo['controls']): MusicGameInfo => ({ key, name, verb, controls });

export const MUSIC_GAMES: Record<string, MusicGameInfo> = {
  'music-x1': mk('echo', '节奏回声', '听/看四个音符，按颜色复现', [L('选音符'), R('选音符'), OK('敲一下'), BACK]),
  'music-x2': mk('queue', '音符排队', '按 1→5 让音符依次排队', [L('选音符'), R('选音符'), OK('排队'), BACK]),
  'music-x3': mk('memory', '乐器记忆', '翻牌配对，找到三对乐器', [L('选牌'), R('选牌'), U('选牌'), D('选牌'), OK('翻牌'), BACK]),
  'music-x4': mk('baton', '指挥棒', '看准绿色拍点按 OK，连打三拍', [OK('打拍'), BACK]),
  'music-x5': mk('pitch', '音高滑梯', '上下移动音高，停到目标音符', [U('升高'), D('降低'), OK('定音'), BACK]),
  'music-x6': mk('bubble', '泡泡节拍', '看准泡泡到节拍线时按 OK', [OK('拍泡泡'), BACK]),
  'music-x7': mk('drum', '鼓点连击', '跟着鼓点节奏按 OK 连击四次', [OK('敲鼓'), BACK]),
  'music-x8': mk('maze', '音乐迷宫', '5×5 迷宫按 1→5 走到舞台', [L('走'), R('走'), U('走'), D('走'), BACK]),
  'music-x9': mk('choir', '合唱顺序', '交换小歌手，按 1、2、3 站好', [L('选歌手'), R('选歌手'), OK('交换'), BACK]),
  'music-x10': mk('stage', '舞台终章', '按舞台提示完成四步演出', [L('选'), R('选'), U('选'), D('选'), BACK]),
};

export function musicGameFor(id: string): MusicGameInfo | null { return MUSIC_GAMES[id] ?? null; }
abstract class MusicMicrogame extends Microgame<MusicGameInfo> {}
const NOTE_COLORS = ['#F28C6E', '#FFC94A', '#8ED3B0'];

/* 1. 节奏回声 */
class EchoGame extends MusicMicrogame {
  private pattern: number[] = [];
  private entered: number[] = [];
  private choice = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.pattern = Array.from({ length: 4 }, () => Math.floor(Math.random() * 3));
  }

  get info(): MusicGameInfo { return MUSIC_GAMES['music-x1']; }

  render(): string {
    const pattern = this.pattern.map((n, i) => `<span class="echo-note${i < this.entered.length ? ' is-done' : ''}" style="--note:${NOTE_COLORS[n]}">${noteArt(NOTE_COLORS[n])}</span>`).join('');
    const choices = NOTE_COLORS.map((c, i) => `<button class="echo-choice${i === this.choice ? ' is-focused' : ''}" style="background:${c}" data-note="${i}" aria-label="音符 ${i + 1}">${noteArt(c)}</button>`).join('');
    return `<div class="micro-board echo-board" data-game="echo" data-pattern="${this.pattern.join(',')}" data-entered="${this.entered.join(',')}">
      <div class="micro-board-title">听一听，再敲出同样的节奏</div>
      <div class="micro-caption">看上面的音符顺序，左右选颜色，按 OK 敲一下</div>
      <div class="echo-pattern">${pattern}</div>
      <div class="echo-choices">${choices}</div>
      <div class="micro-progress">已敲 <b>${this.entered.length}</b> / 4 下</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left' || action === 'right') { this.choice = (this.choice + (action === 'left' ? 2 : 1)) % 3; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.pattern[this.entered.length] !== this.choice) {
        this.entered = [];
        this.toastText = '节奏错了，从头再敲';
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

/* 2. 音符排队 */
class QueueGame extends MusicMicrogame {
  private notes: number[] = [];
  private step = 1;
  private queued = new Set<number>();

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.notes = [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
  }

  get info(): MusicGameInfo { return MUSIC_GAMES['music-x2']; }

  render(): string {
    const notes = this.notes.map((n, i) => `<button class="queue-note${this.focusClass(i)}${this.queued.has(i) ? ' is-queued' : ''}" data-note="${n}" aria-label="音符 ${n}">
      ${noteArt('#FFC94A')}<b>${n}</b>
    </button>`).join('');
    return `<div class="micro-board queue-board" data-game="queue" data-step="${this.step}" data-notes="${this.notes.join(',')}">
      <div class="micro-board-title">让音符按 1 → 5 排队</div>
      <div class="micro-caption">左右选音符，按 OK 排队；点错重新排</div>
      <div class="queue-stage">${notes}</div>
      <div class="micro-progress">已排队 <b>${this.step - 1}</b> / 5 个</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + 4) % 5; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % 5; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.notes[this.cursor] !== this.step) {
        this.step = 1;
        this.queued = new Set();
        this.toastText = '排错队啦，重新来';
        return { redraw: true };
      }
      this.queued.add(this.cursor);
      this.step += 1;
      this.toastText = '';
      if (this.step > 5) return this.complete();
      return { redraw: true };
    }
    return {};
  }
}

/* 3. 乐器记忆 */
class InstrumentMemory extends MusicMicrogame {
  private cards: string[] = [];
  private opened: number[] = [];
  private matched = new Set<number>();
  private first = -1;
  private lock = false;
  private timer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.cards = ['drum', 'drum', 'harp', 'harp', 'flute', 'flute'].sort(() => Math.random() - 0.5);
  }

  get info(): MusicGameInfo { return MUSIC_GAMES['music-x3']; }

  render(): string {
    const cards = this.cards.map((v, i) => `<button class="inst-card${this.focusClass(i)}${this.opened.includes(i) || this.matched.has(i) ? ' is-open' : ''}${this.matched.has(i) ? ' is-matched' : ''}" data-card="${i}" data-kind="${v}" aria-label="乐器牌 ${i + 1}">
      <span class="inst-back">${noteArt('#8ED3B0')}</span><span class="inst-face">${instrumentArt(v)}</span>
    </button>`).join('');
    return `<div class="micro-board inst-board" data-game="memory" data-matched="${this.matched.size}">
      <div class="micro-board-title">翻牌配对，找到三对乐器</div>
      <div class="micro-caption">方向键选牌，按 OK 翻开；记住位置</div>
      <div class="inst-grid">${cards}</div>
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

/* 4. 指挥棒 */
class BatonGame extends MusicMicrogame {
  private position = 0;
  private dir = 1;
  private hits = 0;
  private targetHits = 3;
  private timer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.timer = window.setInterval(() => {
      if (this.finished) return;
      this.position += this.dir * 4;
      if (this.position > 100 || this.position < 0) { this.dir *= -1; this.position = Math.max(0, Math.min(100, this.position)); }
      this.host.redraw();
    }, 60);
  }

  get info(): MusicGameInfo { return MUSIC_GAMES['music-x4']; }

  render(): string {
    const inZone = this.position >= 40 && this.position <= 60;
    return `<div class="micro-board baton-board" data-game="baton" data-position="${this.position}" data-hits="${this.hits}" data-in-zone="${inZone ? 1 : 0}">
      <div class="micro-board-title">看准绿色拍点打拍，连打 <b>3</b> 拍</div>
      <div class="micro-caption">指挥棒进入绿色区域时按 OK</div>
      <div class="baton-stage"><div class="baton-track"><span class="baton-zone"></span><span class="baton-marker" style="left:${this.position}%">${batonArt()}</span></div><div class="baton-count">${this.hits} / 3</div></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action !== 'confirm') return {};
    if (this.position >= 40 && this.position <= 60) {
      this.hits += 1;
      this.toastText = '';
      if (this.hits >= this.targetHits) return this.complete();
      return { redraw: true };
    }
    this.hits = 0;
    this.toastText = '打偏了，重新数拍';
    return { redraw: true };
  }

  dispose(): void { if (this.timer !== null) window.clearInterval(this.timer); this.timer = null; }
}

/* 5. 音高滑梯 */
class PitchGame extends MusicMicrogame {
  private target = 4;
  private pitch = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 2 + Math.floor(Math.random() * 5);
  }

  get info(): MusicGameInfo { return MUSIC_GAMES['music-x5']; }

  render(): string {
    return `<div class="micro-board pitch-board" data-game="pitch" data-target="${this.target}" data-pitch="${this.pitch}">
      <div class="micro-board-title">把音高滑到 <b>${this.target}</b> 号音符</div>
      <div class="micro-caption">上下移动音高，按 OK 定音；停错可以再滑</div>
      <div class="pitch-stage"><div class="pitch-ladder">${Array.from({ length: 7 }, (_, i) => `<span class="pitch-step${i === this.pitch ? ' is-active' : ''}${i === this.target ? ' is-target' : ''}"><b>${i + 1}</b></span>`).join('')}</div><div class="pitch-fox">${musicFox()}</div></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'up') { this.pitch = Math.min(6, this.pitch + 1); return { redraw: true }; }
    if (action === 'down') { this.pitch = Math.max(0, this.pitch - 1); return { redraw: true }; }
    if (action === 'confirm') {
      if (this.pitch + 1 === this.target) return this.complete();
      this.toastText = '音高不对，再滑一滑';
      return { redraw: true };
    }
    return {};
  }
}

/* 6. 泡泡节拍 */
class BubbleBeatGame extends MusicMicrogame {
  private position = 0;
  private hits = 0;
  private target = 3;
  private timer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.timer = window.setInterval(() => {
      if (this.finished) return;
      this.position = (this.position + 3) % 100;
      this.host.redraw();
    }, 60);
  }

  get info(): MusicGameInfo { return MUSIC_GAMES['music-x6']; }

  render(): string {
    const inZone = this.position >= 42 && this.position <= 58;
    return `<div class="micro-board bubblebeat-board" data-game="bubble" data-position="${this.position}" data-hits="${this.hits}" data-in-zone="${inZone ? 1 : 0}">
      <div class="micro-board-title">泡泡到节拍线时按 OK，拍 <b>3</b> 下</div>
      <div class="micro-caption">看准中间的节拍线</div>
      <div class="bubblebeat-stage"><div class="bubblebeat-line"></div><div class="bubblebeat-bubble" style="left:${this.position}%">${bubbleArt()}</div><div class="bubblebeat-count">${this.hits} / 3</div></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action !== 'confirm') return {};
    if (this.position >= 42 && this.position <= 58) {
      this.hits += 1;
      this.toastText = '';
      if (this.hits >= this.target) return this.complete();
      return { redraw: true };
    }
    this.toastText = '拍早了，等泡泡到线';
    return { redraw: true };
  }

  dispose(): void { if (this.timer !== null) window.clearInterval(this.timer); this.timer = null; }
}

/* 7. 鼓点连击 */
class DrumGame extends MusicMicrogame {
  private beat = 0;
  private hits = 0;
  private target = 4;
  private timer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.timer = window.setInterval(() => {
      if (this.finished) return;
      this.beat = (this.beat + 1) % 4;
      this.host.redraw();
    }, 520);
  }

  get info(): MusicGameInfo { return MUSIC_GAMES['music-x7']; }

  render(): string {
    return `<div class="micro-board drum-board" data-game="drum" data-beat="${this.beat}" data-hits="${this.hits}">
      <div class="micro-board-title">跟着鼓点敲 <b>4</b> 下</div>
      <div class="micro-caption">亮点落到鼓面时按 OK</div>
      <div class="drum-stage"><div class="drum-lights">${Array.from({ length: 4 }, (_, i) => `<span class="${i === this.beat ? 'is-on' : ''}"></span>`).join('')}</div><div class="drum">${drumArt()}</div><div class="drum-count">${this.hits} / 4</div></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action !== 'confirm') return {};
    if (this.beat === 0) {
      this.hits += 1;
      this.toastText = '';
      if (this.hits >= this.target) return this.complete();
      return { redraw: true };
    }
    this.hits = 0;
    this.toastText = '没踩到鼓点，重新来';
    return { redraw: true };
  }

  dispose(): void { if (this.timer !== null) window.clearInterval(this.timer); this.timer = null; }
}

/* 8. 音乐迷宫 */
class MusicMazeGame extends MusicMicrogame {
  private cols = 5;
  private grid: number[] = [];
  private step = 1;
  private hero = 0;
  private start = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.make();
  }

  get info(): MusicGameInfo { return MUSIC_GAMES['music-x8']; }

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
    const tiles = this.grid.map((v, i) => `<div class="music-maze-tile${i === this.hero ? ' is-hero' : ''}" data-cell="${i}" data-value="${v}">${i === this.hero ? noteArt() : v}</div>`).join('');
    return `<div class="micro-board music-maze-board" data-game="maze" data-step="${this.step}" data-hero="${this.hero}">
      <div class="micro-board-title">音乐迷宫：按 1→5 走到舞台</div>
      <div class="micro-caption">方向键走一格；走错回到起点</div>
      <div class="music-maze-grid">${tiles}</div>
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
      this.toastText = '走错音阶了，回到起点';
      return { redraw: true };
    }
    this.hero = next;
    this.step += 1;
    this.toastText = '';
    if (this.step >= 5) return this.complete();
    return { redraw: true };
  }
}

/* 9. 合唱顺序 */
class ChoirGame extends MusicMicrogame {
  private order: number[] = [];

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.order = [1, 2, 3].sort(() => Math.random() - 0.5);
    if (this.order.join('') === '123') this.order = [2, 1, 3];
  }

  get info(): MusicGameInfo { return MUSIC_GAMES['music-x9']; }

  render(): string {
    const singers = this.order.map((n, i) => `<button class="singer${this.focusClass(i)}" data-singer="${i}" data-number="${n}" aria-label="歌手 ${n}">${singerArt()}<span>${n}</span></button>`).join('');
    return `<div class="micro-board choir-board" data-game="choir" data-order="${this.order.join(',')}">
      <div class="micro-board-title">让小歌手按 1 · 2 · 3 站好</div>
      <div class="micro-caption">左右选歌手，按 OK 与右边交换位置</div>
      <div class="choir-stage">${singers}</div>
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

/* 10. 舞台终章 */
class StageGame extends MusicMicrogame {
  private pattern: Array<'left' | 'right' | 'up' | 'down'> = [];
  private entered = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    const all: Array<'left' | 'right' | 'up' | 'down'> = ['left', 'right', 'up', 'down'];
    this.pattern = Array.from({ length: 4 }, () => all[Math.floor(Math.random() * 4)]);
  }

  get info(): MusicGameInfo { return MUSIC_GAMES['music-x10']; }

  render(): string {
    const icons: Record<string, string> = { left: stageStepArt('left'), right: stageStepArt('right'), up: stageStepArt('up'), down: stageStepArt('down') };
    return `<div class="micro-board stage-board" data-game="stage" data-pattern="${this.pattern.join(',')}" data-entered="${this.entered}">
      <div class="micro-board-title">完成四步舞台演出</div>
      <div class="micro-caption">按舞台提示的方向依次演出；错一步重新来</div>
      <div class="stage-pattern">${this.pattern.map((p, i) => `<span class="stage-step${i < this.entered ? ' is-done' : ''}">${icons[p]}</span>`).join('')}</div>
      <div class="stage-perform">${singerArt()}<span>${this.entered} / 4</span></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (!['left', 'right', 'up', 'down'].includes(action)) return {};
    if (action !== this.pattern[this.entered]) {
      this.entered = 0;
      this.toastText = '演出错步了，重新来';
      return { redraw: true };
    }
    this.entered += 1;
    this.toastText = '';
    if (this.entered >= 4) window.setTimeout(() => this.complete(), 300);
    return { redraw: true };
  }
}

export function createMusicGame(level: Level, host: MicroHost): MusicMicrogame | null {
  switch (musicGameFor(level.id)?.key) {
    case 'echo': return new EchoGame(level, host);
    case 'queue': return new QueueGame(level, host);
    case 'memory': return new InstrumentMemory(level, host);
    case 'baton': return new BatonGame(level, host);
    case 'pitch': return new PitchGame(level, host);
    case 'bubble': return new BubbleBeatGame(level, host);
    case 'drum': return new DrumGame(level, host);
    case 'maze': return new MusicMazeGame(level, host);
    case 'choir': return new ChoirGame(level, host);
    case 'stage': return new StageGame(level, host);
    default: return null;
  }
}

/* art */
function noteArt(color = '#F28C6E'): string {
  return `<svg class="note-art" viewBox="0 0 110 110" aria-hidden="true">
    <path d="M42 24 L86 14 V76" fill="none" stroke="#23313F" stroke-width="7"/>
    <path d="M42 24 V84" fill="none" stroke="#23313F" stroke-width="7"/>
    <path d="M44 26 L86 16" stroke="#FFFDF7" stroke-width="2.5" opacity="0.7"/>
    <ellipse cx="29" cy="86" rx="18" ry="12" fill="${color}" stroke="#23313F" stroke-width="3.5"/>
    <ellipse cx="73" cy="78" rx="18" ry="12" fill="${color}" stroke="#23313F" stroke-width="3.5"/>
    <path d="M22 82 C26 78 33 78 37 81" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="98" cy="26" r="5" fill="#FFC94A" stroke="#23313F" stroke-width="2"/>
  </svg>`;
}
function instrumentArt(v: string): string {
  if (v === 'drum') return `<svg class="instrument-drum" viewBox="0 0 130 130" aria-hidden="true">
    <ellipse cx="65" cy="52" rx="48" ry="26" fill="#F28C6E" stroke="#23313F" stroke-width="4"/>
    <path d="M17 52 V92 C17 116 113 116 113 92 V52" fill="#F28C6E" stroke="#23313F" stroke-width="4"/>
    <ellipse cx="65" cy="52" rx="36" ry="17" fill="#FFE7A0" stroke="#23313F" stroke-width="3"/>
    <path d="M23 66 L30 105 M107 66 L100 105 M45 74 V110 M85 74 V110" stroke="#23313F" stroke-width="3" opacity="0.7"/>
    <path d="M36 34 L16 6 M94 34 L114 6" stroke="#B87B48" stroke-width="7" stroke-linecap="round"/>
    <circle cx="14" cy="5" r="6" fill="#FFC94A" stroke="#23313F" stroke-width="2"/><circle cx="116" cy="5" r="6" fill="#FFC94A" stroke="#23313F" stroke-width="2"/>
  </svg>`;
  if (v === 'harp') return `<svg class="instrument-harp" viewBox="0 0 130 130" aria-hidden="true">
    <path d="M30 116 V42 C30 20 50 8 66 24 L106 112 Z" fill="#FFC94A" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
    <path d="M40 108 V48 C40 32 54 24 64 36 L98 108" fill="none" stroke="#23313F" stroke-width="3"/>
    <g stroke="#FFFDF7" stroke-width="2" opacity="0.8"><path d="M46 62 L94 110 M50 50 L102 100 M56 42 L108 90 M64 36 L112 80"/></g>
    <path d="M26 116 H108" stroke="#23313F" stroke-width="7" stroke-linecap="round"/>
    <circle cx="108" cy="112" r="7" fill="#F28C6E" stroke="#23313F" stroke-width="2"/>
  </svg>`;
  return `<svg class="instrument-flute" viewBox="0 0 150 90" aria-hidden="true">
    <path d="M12 52 H122 C136 52 144 44 144 34 C144 26 136 22 126 24 L20 40 Z" fill="#8ED3B0" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
    <path d="M20 42 L126 26" stroke="#FFFDF7" stroke-width="3" opacity="0.7"/>
    <g fill="#23313F"><circle cx="52" cy="39" r="4"/><circle cx="72" cy="36" r="4"/><circle cx="92" cy="33" r="4"/><circle cx="112" cy="30" r="4"/></g>
    <path d="M132 28 L146 22 M132 36 L146 30" stroke="#23313F" stroke-width="3" stroke-linecap="round"/>
    <path d="M16 52 C8 58 8 68 16 72" fill="none" stroke="#23313F" stroke-width="3"/>
  </svg>`;
}
function musicFox(): string {
  return `<svg class="music-fox" viewBox="0 0 140 140" aria-hidden="true">
    <path d="M34 48 L24 12 L54 38 M106 48 L116 12 L86 38" fill="#E8834E" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="70" cy="70" r="46" fill="#E8834E" stroke="#23313F" stroke-width="4"/>
    <path d="M42 86 C50 104 90 104 98 86 C90 96 50 96 42 86 Z" fill="#FFF1D8"/>
    <ellipse cx="70" cy="86" rx="26" ry="18" fill="#FFF1D8" stroke="#23313F" stroke-width="3"/>
    <circle cx="54" cy="64" r="6" fill="#23313F"/><circle cx="86" cy="64" r="6" fill="#23313F"/>
    <circle cx="52" cy="62" r="2" fill="#FFFDF7"/><circle cx="84" cy="62" r="2" fill="#FFFDF7"/>
    <path d="M64 76 q6 -5 12 0 q-6 7 -12 0 Z" fill="#23313F"/>
    <path d="M70 82 v4 M70 86 q-5 4 -9 1 M70 86 q5 4 9 1" fill="none" stroke="#23313F" stroke-width="2"/>
    <path d="M102 88 L126 46" stroke="#23313F" stroke-width="5" stroke-linecap="round"/>
    <circle cx="128" cy="42" r="6" fill="#FFC94A" stroke="#23313F" stroke-width="2"/>
    <path d="M38 108 C30 124 34 134 48 136" fill="none" stroke="#2A9D8F" stroke-width="12" stroke-linecap="round"/>
  </svg>`;
}
function bubbleArt(): string {
  return `<svg class="music-bubble-art" viewBox="0 0 110 110" aria-hidden="true">
    <circle cx="55" cy="56" r="42" fill="rgba(142,211,176,.42)" stroke="#23313F" stroke-width="3.5"/>
    <path d="M26 40 C34 24 52 18 66 24" fill="none" stroke="#FFFDF7" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
    <circle cx="36" cy="72" r="5" fill="#FFFDF7" opacity="0.7"/>
    <path d="M48 42 V78" stroke="#23313F" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="42" cy="82" rx="10" ry="7" fill="#F28C6E" stroke="#23313F" stroke-width="2.5"/>
    <path d="M49 45 L74 40 V70" fill="none" stroke="#23313F" stroke-width="4"/>
    <ellipse cx="68" cy="74" rx="10" ry="7" fill="#FFC94A" stroke="#23313F" stroke-width="2.5"/>
  </svg>`;
}
function drumArt(): string {
  return `<svg class="drum-art" viewBox="0 0 220 180" aria-hidden="true">
    <ellipse cx="110" cy="60" rx="82" ry="36" fill="#F28C6E" stroke="#23313F" stroke-width="5"/>
    <path d="M28 60 V118 C28 154 192 154 192 118 V60" fill="#F28C6E" stroke="#23313F" stroke-width="5"/>
    <ellipse cx="110" cy="60" rx="66" ry="25" fill="#FFE7A0" stroke="#23313F" stroke-width="3"/>
    <path d="M34 74 L42 132 M186 74 L178 132 M72 82 V144 M148 82 V144" stroke="#23313F" stroke-width="3" opacity="0.65"/>
    <path d="M48 32 L20 2 M172 32 L200 2" stroke="#B87B48" stroke-width="9" stroke-linecap="round"/>
    <circle cx="18" cy="0" r="8" fill="#FFC94A" stroke="#23313F" stroke-width="2.5"/><circle cx="202" cy="0" r="8" fill="#FFC94A" stroke="#23313F" stroke-width="2.5"/>
    <path d="M92 60 l6 11 12 1 -9 8 3 11 -12 -6 -12 6 3 -11 -9 -8 12 -1 Z" fill="#FFFDF7" opacity="0.8"/>
  </svg>`;
}
function singerArt(): string {
  return `<svg class="singer-art" viewBox="0 0 180 240" aria-hidden="true">
    <path d="M58 54 C58 24 122 24 122 54 C122 76 108 90 90 90 C72 90 58 76 58 54 Z" fill="#F6C7B9" stroke="#23313F" stroke-width="4"/>
    <path d="M56 54 C52 28 68 8 90 8 C112 8 128 28 124 54 C114 40 102 34 90 34 C78 34 66 40 56 54 Z" fill="#8E7CC3" stroke="#23313F" stroke-width="4"/>
    <circle cx="76" cy="54" r="4.5" fill="#23313F"/><circle cx="104" cy="54" r="4.5" fill="#23313F"/>
    <path d="M82 68 q8 6 16 0" fill="none" stroke="#23313F" stroke-width="3" stroke-linecap="round"/>
    <circle cx="66" cy="66" r="4" fill="#F6A696" opacity="0.6"/><circle cx="114" cy="66" r="4" fill="#F6A696" opacity="0.6"/>
    <path d="M52 94 C60 86 120 86 128 94 L142 176 H38 Z" fill="#8E7CC3" stroke="#23313F" stroke-width="4"/>
    <path d="M48 106 C34 126 32 146 38 166 M132 106 C146 126 148 146 142 166" fill="none" stroke="#23313F" stroke-width="4"/>
    <path d="M62 176 H118 L126 224 H54 Z" fill="#B9A7D8" stroke="#23313F" stroke-width="4"/>
    <path d="M62 224 L48 238 M118 224 L132 238" stroke="#23313F" stroke-width="6" stroke-linecap="round"/>
    <path d="M130 134 C144 128 154 138 150 150 C146 160 136 162 128 156" fill="#B9C7D0" stroke="#23313F" stroke-width="4"/>
    <path d="M132 146 H148" stroke="#23313F" stroke-width="3"/>
    <path d="M96 108 l4 8 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1 Z" fill="#FFC94A" stroke="#23313F" stroke-width="2" transform="translate(0 6)"/>
  </svg>`;
}
function batonArt(): string {
  return `<svg class="baton-art" viewBox="0 0 70 120" aria-hidden="true">
    <path d="M35 8 V72" stroke="#23313F" stroke-width="6" stroke-linecap="round"/>
    <path d="M35 8 V72" stroke="#FFFDF7" stroke-width="2" stroke-linecap="round"/>
    <path d="M22 72 H48 L44 104 H26 Z" fill="#B87B48" stroke="#23313F" stroke-width="3"/>
    <path d="M26 84 H44 M27 94 H43" stroke="#8B5E3C" stroke-width="2.5"/>
    <circle cx="35" cy="8" r="6" fill="#FFC94A" stroke="#23313F" stroke-width="2"/>
  </svg>`;
}
function stageStepArt(dir: string): string {
  const rotate = dir === 'left' ? -90 : dir === 'right' ? 90 : dir === 'down' ? 180 : 0;
  return `<svg class="stage-step-art" viewBox="0 0 110 110" aria-hidden="true" style="transform:rotate(${rotate}deg)">
    <path d="M34 84 C20 72 24 48 42 38 C58 28 82 36 86 56 C92 80 70 96 48 92 Z" fill="#8E7CC3" stroke="#23313F" stroke-width="4"/>
    <path d="M50 40 V16 C50 8 62 8 62 16 V36" fill="#FFC94A" stroke="#23313F" stroke-width="3"/>
    <path d="M42 74 H74" stroke="#FFFDF7" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
    <path d="M88 26 L102 14 M88 34 H104" stroke="#23313F" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}
