import type { Level } from '../types';
import { escapeHtml } from '../ui';
import { Microgame, type MicroAction, type MicroGameInfo, type MicroHost, type MicroResult } from './base';

export type SkyGameKey = 'plane' | 'gate' | 'balloon' | 'stars' | 'hop' | 'storm' | 'wind' | 'birds' | 'rainbow' | 'maze';
export interface SkyGameInfo extends MicroGameInfo { key: SkyGameKey; }

export const SKY_GAMES: Record<string, SkyGameInfo> = {
  'sky-x1': { key: 'plane', name: '飞机大战', verb: '左右瞄准，按 OK 击落正确数字的敌机', controls: [{ icon: 'left', label: '瞄准' }, { icon: 'right', label: '瞄准' }, { icon: 'ok', label: '开火' }, { icon: 'back', label: '回地图' }] },
  'sky-x2': { key: 'gate', name: '云门穿越', verb: '左右飞到写着目标数字的云门前，按 OK 穿过', controls: [{ icon: 'left', label: '飞' }, { icon: 'right', label: '飞' }, { icon: 'ok', label: '穿云门' }, { icon: 'back', label: '回地图' }] },
  'sky-x3': { key: 'balloon', name: '热气球', verb: '按住 OK 升空，到目标高度松手', controls: [{ icon: 'ok', label: '按住升空' }, { icon: 'up', label: '松手' }, { icon: 'back', label: '回地图' }] },
  'sky-x4': { key: 'stars', name: '空中接星', verb: '左右移动滑翔翼，接住落下的星星', controls: [{ icon: 'left', label: '移滑翔翼' }, { icon: 'right', label: '移滑翔翼' }, { icon: 'back', label: '回地图' }] },
  'sky-1': { key: 'hop', name: '云朵跳台', verb: '看准绿色云朵，按 OK 起跳', controls: [{ icon: 'ok', label: '起跳' }, { icon: 'back', label: '回地图' }] },
  'sky-2': { key: 'storm', name: '雷暴闪避', verb: '左右躲开闪电，捡到三颗太阳', controls: [{ icon: 'left', label: '躲' }, { icon: 'right', label: '躲' }, { icon: 'ok', label: '捡太阳' }, { icon: 'back', label: '回地图' }] },
  'sky-3': { key: 'wind', name: '风向标', verb: '按箭头方向吹风，让云飘到目标点', controls: [{ icon: 'left', label: '左风' }, { icon: 'right', label: '右风' }, { icon: 'up', label: '上风' }, { icon: 'down', label: '下风' }, { icon: 'back', label: '回地图' }] },
  'sky-4': { key: 'birds', name: '候鸟排队', verb: '按 1→5 让候鸟依次起飞', controls: [{ icon: 'left', label: '选鸟' }, { icon: 'right', label: '选鸟' }, { icon: 'ok', label: '起飞' }, { icon: 'back', label: '回地图' }] },
  'sky-5': { key: 'rainbow', name: '彩虹涂色', verb: '按顺序涂出彩虹颜色', controls: [{ icon: 'left', label: '选颜色' }, { icon: 'right', label: '选颜色' }, { icon: 'ok', label: '涂一格' }, { icon: 'back', label: '回地图' }] },
  'lighthouse-1': { key: 'maze', name: '云上灯塔', verb: '在云海迷宫按 1→5 走到灯塔', controls: [{ icon: 'left', label: '走' }, { icon: 'right', label: '走' }, { icon: 'up', label: '走' }, { icon: 'down', label: '走' }, { icon: 'back', label: '回地图' }] },
};

export function skyGameFor(id: string): SkyGameInfo | null { return SKY_GAMES[id] ?? null; }
abstract class SkyMicrogame extends Microgame<SkyGameInfo> {}

/* 1. 飞机大战 */
class PlaneBattleGame extends SkyMicrogame {
  private target = 0;
  private enemies: number[] = [3, 5, 7];

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 2 + Math.floor(Math.random() * 6);
    this.enemies = [this.target, ...Array.from({ length: 2 }, () => 1 + Math.floor(Math.random() * 7)).filter((v) => v !== this.target)].slice(0, 3).sort(() => Math.random() - 0.5);
  }

  get info(): SkyGameInfo { return SKY_GAMES['sky-x1']; }

  render(): string {
    const enemies = this.enemies.map((v, i) => `<div class="sky-enemy${this.focusClass(i)}" data-enemy="${v}" style="left:${16 + i * 30}%">${enemyPlane(v)}</div>`).join('');
    return `<div class="micro-board sky-board" data-game="plane" data-target="${this.target}" data-enemies="${this.enemies.join(',')}" data-cursor="${this.cursor}">
      <div class="micro-board-title">击落写着 <b>${this.target}</b> 的敌机</div>
      <div class="micro-caption">左右瞄准，按 OK 开火；打错可以继续瞄</div>
      <div class="sky-stage">${cloudBg()}${enemies}<div class="sky-hero" style="left:${16 + this.cursor * 30}%">${heroPlane()}</div></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = Math.max(0, this.cursor - 1); return { redraw: true }; }
    if (action === 'right') { this.cursor = Math.min(2, this.cursor + 1); return { redraw: true }; }
    if (action === 'confirm') {
      if (this.enemies[this.cursor] === this.target) return this.complete();
      this.toastText = '打错敌机了，再瞄准';
      return { redraw: true };
    }
    return {};
  }
}

/* 2. 云门穿越：盯住目标云门，经过飞机时按 OK */
class CloudGateGame extends SkyMicrogame {
  private target = 3;
  private gates: number[] = [];

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 2 + Math.floor(Math.random() * 6);
    const others = [1, 2, 3, 4, 5, 6, 7].filter((v) => v !== this.target).sort(() => Math.random() - 0.5).slice(0, 2);
    this.gates = [this.target, ...others].sort(() => Math.random() - 0.5);
    this.cursor = this.gates.indexOf(this.target);
  }

  get info(): SkyGameInfo { return SKY_GAMES['sky-x2']; }

  render(): string {
    const gates = this.gates.map((v, i) => `<div class="sky-gate static${this.focusClass(i)}" data-gate="${v}" style="left:${16 + i * 30}%">${cloudGate(v)}</div>`).join('');
    return `<div class="micro-board gate-board" data-game="gate" data-target="${this.target}" data-gates="${this.gates.join(',')}" data-cursor="${this.cursor}">
      <div class="micro-board-title">飞到写着 <b>${this.target}</b> 的云门前</div>
      <div class="micro-caption">左右移动飞机，按 OK 穿过目标云门</div>
      <div class="gate-stage">${cloudBg()}${gates}<div class="gate-plane" style="left:${16 + this.cursor * 30}%">${heroPlane()}</div></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = Math.max(0, this.cursor - 1); return { redraw: true }; }
    if (action === 'right') { this.cursor = Math.min(2, this.cursor + 1); return { redraw: true }; }
    if (action === 'confirm') {
      if (this.gates[this.cursor] === this.target) return this.complete();
      this.toastText = '云门数字不对，再飞一次';
      return { redraw: true };
    }
    return {};
  }
}

/* 3. 热气球：按住升空到目标高度 */
class BalloonGame extends SkyMicrogame {
  private target = 4;
  private altitude = 0;
  private filling = false;
  private timer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 3 + Math.floor(Math.random() * 3);
  }

  get info(): SkyGameInfo { return SKY_GAMES['sky-x3']; }

  render(): string {
    return `<div class="micro-board balloon-board" data-game="balloon" data-target="${this.target}" data-altitude="${this.altitude.toFixed(1)}">
      <div class="micro-board-title">升到 <b>${this.target}</b> 格高度</div>
      <div class="micro-caption">按住 OK 升空，到刻度松手；升过头会下降重来</div>
      <div class="balloon-stage"><div class="balloon-sky">${cloudBg()}</div><div class="balloon-gauge"><div class="balloon-fill" style="height:${this.altitude / 7 * 100}%"></div><div class="balloon-marker" style="bottom:${this.target / 7 * 100}%"><span>${this.target}</span></div></div><div class="balloon" style="bottom:${this.altitude / 7 * 55 + 12}%">${balloonArt()}</div></div>
      <div class="micro-progress">高度 <b>${this.altitude.toFixed(1)}</b> / ${this.target}</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  private start(): void {
    if (this.filling || this.finished) return;
    this.filling = true;
    this.timer = window.setInterval(() => {
      if (!this.filling) return;
      this.altitude = Math.min(7, this.altitude + 0.12);
      if (this.altitude >= 7) this.stop(true);
      else this.host.redraw();
    }, 90);
  }

  private stop(over = false): void {
    if (!this.filling) return;
    this.filling = false;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    if (over || this.altitude > this.target + 0.55) {
      this.toastText = '飞过头了，落回地面重来';
      this.altitude = 0;
      this.host.redraw();
      return;
    }
    if (Math.abs(this.altitude - this.target) <= 0.45) this.complete();
    else {
      this.toastText = this.altitude < this.target ? '再升高一点' : '慢一点，再试一次';
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

/* 4. 空中接星 */
class StarCatchGame extends SkyMicrogame {
  private slots = 5;
  private caught = 0;
  private target = 5;
  private stars: Array<{ x: number; y: number }> = [];
  private timer: number | null = null;
  private spawnTimer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.target = 5;
    this.stars.push({ x: 2, y: 0 });
    this.timer = window.setInterval(() => {
      this.stars = this.stars.map((s) => ({ x: s.x, y: s.y + 5 })).filter((s) => {
        if (s.y < 300) return true;
        if (Math.abs(s.x - this.cursor) <= 1) {
          this.caught += 1;
          if (this.caught >= this.target) this.complete();
        }
        return false;
      });
      this.host.redraw();
    }, 90);
    this.spawnTimer = window.setInterval(() => {
      if (this.finished) return;
      this.stars.push({ x: Math.floor(Math.random() * this.slots), y: 0 });
    }, 620);
  }

  get info(): SkyGameInfo { return SKY_GAMES['sky-x4']; }

  render(): string {
    const stars = this.stars.map((s) => `<span class="sky-star" style="left:${s.x * 20 + 10}%;top:${s.y}px">${starSvg()}</span>`).join('');
    return `<div class="micro-board skycatch-board" data-game="stars" data-caught="${this.caught}" data-target="${this.target}">
      <div class="micro-board-title">接住 <b>${this.target}</b> 颗星星</div>
      <div class="micro-caption">左右移动滑翔翼，让星星落进翼里</div>
      <div class="skycatch-stage">${cloudBg()}${stars}<div class="skycatch-glider" style="left:${this.cursor * 20 + 10}%">${glider()}</div><div class="skycatch-ground"></div></div>
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

/* 5. 云朵跳台：看准绿色云朵，按 OK 起跳，连续 4 次 */
class CloudHopGame extends SkyMicrogame {
  private position = 0;
  private targetPos = 40;
  private hops = 0;
  private targetHops = 4;
  private dir = 1;
  private timer: number | null = null;
  private moving = true;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.targetPos = 30 + Math.floor(Math.random() * 40);
    this.timer = window.setInterval(() => {
      if (this.finished || !this.moving) return;
      this.position += this.dir * 3;
      if (this.position > 100 || this.position < 0) { this.dir *= -1; this.position = Math.max(0, Math.min(100, this.position)); }
      this.host.redraw();
    }, 50);
  }

  get info(): SkyGameInfo { return SKY_GAMES['sky-1']; }

  render(): string {
    const inZone = Math.abs(this.position - this.targetPos) <= 10;
    return `<div class="micro-board hop-board" data-game="hop" data-position="${this.position}" data-target="${this.targetPos}" data-hops="${this.hops}" data-in-zone="${inZone ? 1 : 0}">
      <div class="micro-board-title">看准绿色云朵起跳，连跳 4 次</div>
      <div class="micro-caption">按 OK 在亮起的云朵上起跳；跳空会滑回上一朵</div>
      <div class="hop-stage">${cloudBg()}<div class="hop-track"><div class="hop-cloud" style="left:${this.targetPos}%">${cloudPuff()}</div><div class="hop-fox" style="left:${this.position}%">${foxHop()}</div></div><div class="hop-hint">${inZone ? '现在跳！' : '等云朵亮起来'}</div></div>
      <div class="micro-progress">已跳 <b>${this.hops}</b> / ${this.targetHops} 次</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action !== 'confirm') return {};
    if (Math.abs(this.position - this.targetPos) <= 10) {
      this.hops += 1;
      this.toastText = '';
      if (this.hops >= this.targetHops) return this.complete();
      this.targetPos = 15 + Math.floor(Math.random() * 70);
      this.position = 0;
      this.dir = 1;
      return { redraw: true };
    }
    this.hops = Math.max(0, this.hops - 1);
    this.toastText = '跳空了，滑回上一朵云';
    return { redraw: true };
  }

  dispose(): void { if (this.timer !== null) window.clearInterval(this.timer); this.timer = null; }
}

/* 6. 雷暴闪避：躲闪电，捡三颗太阳 */
class StormGame extends SkyMicrogame {
  private suns = new Set<number>();
  private hazard = -1;
  private collected = 0;
  private target = 3;
  private timer: number | null = null;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.timer = window.setInterval(() => {
      if (this.finished) return;
      this.hazard = Math.floor(Math.random() * 5);
      if (this.cursor === this.hazard) {
        this.collected = 0;
        this.toastText = '被闪电击中了，太阳掉了';
        this.suns.clear();
      } else if (this.suns.has(this.cursor)) {
        this.suns.delete(this.cursor);
        this.collected += 1;
        this.toastText = '';
        if (this.collected >= this.target) { this.complete(); return; }
      }
      if (Math.random() > 0.5) this.suns.add(Math.floor(Math.random() * 5));
      this.host.redraw();
    }, 1100);
  }

  get info(): SkyGameInfo { return SKY_GAMES['sky-2']; }

  render(): string {
    const lanes = Array.from({ length: 5 }, (_, i) => `<div class="storm-lane${i === this.cursor ? ' is-focused' : ''}${i === this.hazard ? ' is-hazard' : ''}" data-lane="${i}">
      ${i === this.hazard ? stormBolt() : ''}${this.suns.has(i) ? `<span class="storm-sun">${sunArt()}</span>` : ''}
      <div class="storm-ground"></div>
    </div>`).join('');
    return `<div class="micro-board storm-board" data-game="storm" data-collected="${this.collected}" data-target="${this.target}" data-cursor="${this.cursor}">
      <div class="micro-board-title">躲开闪电，捡 <b>${this.target}</b> 颗太阳</div>
      <div class="micro-caption">左右移动；闪电落下时别站在那一格，站着按 OK 捡太阳</div>
      <div class="storm-stage">${lanes}</div>
      <div class="micro-progress">已捡 <b>${this.collected}</b> / ${this.target} 颗</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + 4) % 5; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % 5; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.suns.has(this.cursor) && this.cursor !== this.hazard) {
        this.suns.delete(this.cursor);
        this.collected += 1;
        if (this.collected >= this.target) return this.complete();
        return { redraw: true };
      }
      this.toastText = '这里没有太阳，换个位置';
      return { redraw: true };
    }
    return {};
  }

  dispose(): void { if (this.timer !== null) window.clearInterval(this.timer); this.timer = null; }
}

/* 7. 风向标：按目标方向吹风 */
class WindGame extends SkyMicrogame {
  private pattern: Array<'left' | 'right' | 'up' | 'down'> = [];
  private entered = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    const all: Array<'left' | 'right' | 'up' | 'down'> = ['left', 'right', 'up', 'down'];
    this.pattern = Array.from({ length: 3 }, () => all[Math.floor(Math.random() * 4)]);
  }

  get info(): SkyGameInfo { return SKY_GAMES['sky-3']; }

  render(): string {
    const icons: Record<string, string> = { left: '←', right: '→', up: '↑', down: '↓' };
    const pattern = this.pattern.map((p, i) => `<span class="wind-step${i < this.entered ? ' is-done' : ''}">${icons[p]}</span>`).join('');
    return `<div class="micro-board wind-board" data-game="wind" data-pattern="${this.pattern.join(',')}" data-entered="${this.entered}">
      <div class="micro-board-title">按风向把云吹到灯塔</div>
      <div class="micro-caption">看上面的风向，按对应方向键</div>
      <div class="wind-pattern">${pattern}</div>
      <div class="wind-stage">${cloudPuff()}<span class="wind-arrow">${this.entered < this.pattern.length ? icons[this.pattern[this.entered]] : '✓'}</span></div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (!['left', 'right', 'up', 'down'].includes(action)) return {};
    if (action !== this.pattern[this.entered]) {
      this.entered = 0;
      this.toastText = '风向错了，重新吹';
      return { redraw: true };
    }
    this.entered += 1;
    this.toastText = '';
    if (this.entered >= this.pattern.length) window.setTimeout(() => this.complete(), 300);
    return { redraw: true };
  }
}

/* 8. 候鸟排队：按 1→5 起飞 */
class BirdsGame extends SkyMicrogame {
  private numbers: number[] = [];
  private step = 1;
  private flying = new Set<number>();

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.numbers = [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
  }

  get info(): SkyGameInfo { return SKY_GAMES['sky-4']; }

  render(): string {
    const birds = this.numbers.map((n, i) => `<button class="bird${this.focusClass(i)}${this.flying.has(i) ? ' is-flying' : ''}" data-bird="${n}" aria-label="候鸟 ${n}">
      ${birdArt()}<span class="bird-number">${n}</span>
    </button>`).join('');
    return `<div class="micro-board birds-board" data-game="birds" data-step="${this.step}" data-numbers="${this.numbers.join(',')}">
      <div class="micro-board-title">让候鸟按 1 → 5 起飞</div>
      <div class="micro-caption">左右选候鸟，按 OK 起飞；点错重新排队</div>
      <div class="birds-stage">${birds}</div>
      <div class="micro-progress">已起飞 <b>${this.step - 1}</b> / 5 只</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left') { this.cursor = (this.cursor + 4) % 5; return { redraw: true }; }
    if (action === 'right') { this.cursor = (this.cursor + 1) % 5; return { redraw: true }; }
    if (action === 'confirm') {
      if (this.numbers[this.cursor] !== this.step) {
        this.step = 1;
        this.flying = new Set();
        this.toastText = '排错队了，重新起飞';
        return { redraw: true };
      }
      this.flying.add(this.cursor);
      this.step += 1;
      this.toastText = '';
      if (this.step > 5) return this.complete();
      return { redraw: true };
    }
    return {};
  }
}

/* 9. 彩虹涂色：按顺序涂颜色 */
class RainbowGame extends SkyMicrogame {
  private colors = ['red', 'orange', 'yellow', 'green', 'blue'];
  private pattern: string[] = [];
  private entered: string[] = [];
  private choice = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.pattern = ['red', 'orange', 'yellow', 'green', 'blue'].sort(() => Math.random() - 0.5).slice(0, 4);
  }

  get info(): SkyGameInfo { return SKY_GAMES['sky-5']; }

  render(): string {
    const choices = this.colors.map((c, i) => `<button class="rainbow-color ${c}${i === this.choice ? ' is-focused' : ''}" data-color="${c}" aria-label="${c}">${rainbowChipArt(c)}</button>`).join('');
    const done = this.pattern.map((c, i) => `<span class="rainbow-slot ${i < this.entered.length ? this.entered[i] : 'empty'}">${i < this.entered.length ? rainbowChipArt(this.entered[i]) : ''}</span>`).join('');
    return `<div class="micro-board rainbow-board" data-game="rainbow" data-pattern="${this.pattern.join(',')}" data-entered="${this.entered.join(',')}">
      <div class="micro-board-title">按顺序涂出彩虹</div>
      <div class="micro-caption">左右选颜色，按 OK 涂一格；顺序错就重来</div>
      <div class="rainbow-target">${this.pattern.map((c) => `<span class="rainbow-chip ${c}">${rainbowChipArt(c)}</span>`).join('')}</div>
      <div class="rainbow-progress">${done}</div>
      <div class="rainbow-colors">${choices}</div>
      ${this.toastText ? `<div class="micro-toast">${escapeHtml(this.toastText)}</div>` : ''}
    </div>`;
  }

  handle(action: MicroAction): MicroResult {
    if (action === 'left' || action === 'right') { this.choice = (this.choice + (action === 'left' ? 4 : 1)) % 5; return { redraw: true }; }
    if (action === 'confirm') {
      const c = this.colors[this.choice];
      if (c !== this.pattern[this.entered.length]) {
        this.entered = [];
        this.toastText = '颜色顺序错了，重新涂';
        return { redraw: true };
      }
      this.entered.push(c);
      this.toastText = '';
      if (this.entered.length === this.pattern.length) window.setTimeout(() => this.complete(), 300);
      return { redraw: true };
    }
    return {};
  }
}

/* 10. 云上灯塔：4×4 云海迷宫 */
class SkyMazeGame extends SkyMicrogame {
  private cols = 4;
  private grid: number[] = [];
  private step = 1;
  private hero = 0;
  private start = 0;

  constructor(level: Level, host: MicroHost) {
    super(level, host);
    this.makeMaze();
  }

  get info(): SkyGameInfo { return SKY_GAMES['lighthouse-1']; }

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
    this.start = start;
    this.hero = start;
  }

  render(): string {
    const tiles = this.grid.map((v, i) => `<div class="sky-maze-tile${i === this.hero ? ' is-hero' : ''}" data-cell="${i}" data-value="${v}">${i === this.hero ? heroPlane() : v}</div>`).join('');
    return `<div class="micro-board skymaze-board" data-game="maze" data-step="${this.step}" data-hero="${this.hero}">
      <div class="micro-board-title">云海迷宫：按 1→5 走到灯塔</div>
      <div class="micro-caption">方向键走一格；走错回到起点</div>
      <div class="sky-maze-grid">${tiles}</div>
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
      this.toastText = '走错云层了，回到起点';
      return { redraw: true };
    }
    this.hero = next;
    this.step += 1;
    this.toastText = '';
    if (this.step >= 5) return this.complete();
    return { redraw: true };
  }
}

export function createSkyGame(level: Level, host: MicroHost): SkyMicrogame | null {
  switch (skyGameFor(level.id)?.key) {
    case 'plane': return new PlaneBattleGame(level, host);
    case 'gate': return new CloudGateGame(level, host);
    case 'balloon': return new BalloonGame(level, host);
    case 'stars': return new StarCatchGame(level, host);
    case 'hop': return new CloudHopGame(level, host);
    case 'storm': return new StormGame(level, host);
    case 'wind': return new WindGame(level, host);
    case 'birds': return new BirdsGame(level, host);
    case 'rainbow': return new RainbowGame(level, host);
    case 'maze': return new SkyMazeGame(level, host);
    default: return null;
  }
}

function cloudBg(): string { return `<div class="sky-clouds"><i></i><i></i><i></i></div>`; }
function enemyPlane(value: number): string {
  return `<svg class="enemy-plane" viewBox="0 0 140 110" aria-hidden="true">
    <path d="M62 50 L48 22 H66 L78 46 Z M64 60 L48 88 H66 L80 64 Z" fill="#B9C7D0" stroke="#23313F" stroke-width="3"/>
    <path d="M18 55 C38 32 96 30 124 55 C96 78 38 80 18 55 Z" fill="#8E7CC3" stroke="#23313F" stroke-width="4"/>
    <path d="M34 46 C54 38 82 38 104 47 C88 58 56 60 34 52 Z" fill="#B9A7D8" opacity="0.7"/>
    <path d="M108 44 C118 38 130 42 132 50 C128 58 118 60 108 54 Z" fill="#FFC94A" stroke="#23313F" stroke-width="3"/>
    <circle cx="104" cy="54" r="17" fill="#FFFDF7" stroke="#23313F" stroke-width="3"/>
    <text x="104" y="63" text-anchor="middle" font-family="Arial Rounded MT Bold, sans-serif" font-size="25" font-weight="700" fill="#23313F">${value}</text>
    <circle cx="42" cy="54" r="5" fill="#EAF7FF" stroke="#23313F" stroke-width="2"/>
    <path d="M18 55 L4 48 L10 57 L2 62 L18 60" fill="#FFC94A" stroke="#23313F" stroke-width="2.5"/>
  </svg>`;
}
function heroPlane(): string {
  return `<svg class="hero-plane" viewBox="0 0 140 110" aria-hidden="true">
    <g class="hero-propeller"><path d="M12 30 L12 80 M8 34 L8 76" stroke="#23313F" stroke-width="4" stroke-linecap="round"/><circle cx="12" cy="55" r="7" fill="#FFC94A" stroke="#23313F" stroke-width="2"/></g>
    <path d="M58 48 L44 18 H64 L80 43 Z M60 62 L44 92 H64 L82 66 Z" fill="#FFC94A" stroke="#23313F" stroke-width="3"/>
    <path d="M22 55 C44 30 100 30 126 55 C100 80 44 80 22 55 Z" fill="#F28C6E" stroke="#23313F" stroke-width="4"/>
    <path d="M38 46 C56 38 82 38 102 45 C86 58 56 60 38 51 Z" fill="#FFD1B8" opacity="0.75"/>
    <path d="M110 42 C122 36 134 42 136 52 C132 62 120 64 110 56 Z" fill="#FFC94A" stroke="#23313F" stroke-width="3"/>
    <circle cx="100" cy="55" r="10" fill="#EAF7FF" stroke="#23313F" stroke-width="3"/>
    <path d="M80 55 q10 -7 20 0" fill="none" stroke="#23313F" stroke-width="2" opacity="0.4"/>
    <path d="M22 55 L6 48 L12 57 L2 64 L22 60" fill="#FFC94A" stroke="#23313F" stroke-width="2.5"/>
    <path d="M44 55 l5 8 9 1 -7 6 2 9 -9 -5 -9 5 2 -9 -7 -6 9 -1 Z" fill="#FFFDF7" stroke="#23313F" stroke-width="2" transform="translate(8 0) scale(.7)"/>
  </svg>`;
}
function cloudGate(value: number): string { return `<div class="gate-cloud"><span>${value}</span></div>`; }
function balloonArt(): string {
  return `<svg class="balloon-art" viewBox="0 0 160 220" aria-hidden="true">
    <path d="M80 8 C28 8 8 60 28 100 C42 126 64 136 80 144 C96 136 118 126 132 100 C152 60 132 8 80 8 Z" fill="#F28C6E" stroke="#23313F" stroke-width="5"/>
    <path d="M80 8 C58 8 42 28 42 58 C42 86 58 112 80 144 C80 100 80 50 80 8 Z" fill="#FFC94A" opacity="0.75"/>
    <path d="M80 8 C102 8 118 28 118 58 C118 86 102 112 80 144 C80 100 80 50 80 8 Z" fill="#8ED3B0" opacity="0.55"/>
    <path d="M60 142 L56 168 M100 142 L104 168" stroke="#23313F" stroke-width="3"/>
    <path d="M48 168 H112 L104 202 H56 Z" fill="#B87B48" stroke="#23313F" stroke-width="4"/>
    <path d="M52 180 H108 M54 192 H106" stroke="#8B5E3C" stroke-width="3" opacity="0.8"/>
    <path d="M64 174 L80 162 L96 174" fill="none" stroke="#23313F" stroke-width="2" opacity="0.55"/>
    <circle cx="80" cy="76" r="10" fill="#FFFDF7" stroke="#23313F" stroke-width="2.5"/>
    <path d="M54 48 C64 34 78 30 92 33" fill="none" stroke="#FFFDF7" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
  </svg>`;
}
function starSvg(): string {
  return `<svg class="sky-star" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="52" r="42" fill="#FFE7A0" opacity="0.24"/>
    <path d="M50 8 L62 36 L92 40 L68 60 L76 90 L50 73 L24 90 L32 60 L8 40 L38 36 Z" fill="#FFC94A" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
    <path d="M50 22 L58 43 L79 46 L63 59 L68 79 L50 67 L32 79 L37 59 L21 46 L42 43 Z" fill="#FFE49B"/>
    <path d="M50 34 L54 48 L67 49 L57 57 L60 70 L50 62 L40 70 L43 57 L33 49 L46 48 Z" fill="#FFF8D8" opacity="0.9"/>
  </svg>`;
}
function glider(): string {
  return `<svg class="glider-art" viewBox="0 0 190 120" aria-hidden="true">
    <path d="M8 62 L178 18 L92 66 L178 92 Z" fill="#8ED3B0" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
    <path d="M8 62 L84 66 L58 96 Z" fill="#FFC94A" stroke="#23313F" stroke-width="4"/>
    <path d="M92 66 L104 108 H74 Z" fill="#F28C6E" stroke="#23313F" stroke-width="3"/>
    <path d="M38 66 L96 50 M34 70 L92 78" stroke="#4D8A43" stroke-width="3" opacity="0.65"/>
    <circle cx="58" cy="62" r="18" fill="#E8834E" stroke="#23313F" stroke-width="3"/>
    <path d="M44 50 L38 30 L56 44 M68 44 L80 28 L76 50" fill="#E8834E" stroke="#23313F" stroke-width="3"/>
    <circle cx="52" cy="60" r="3" fill="#23313F"/><circle cx="64" cy="60" r="3" fill="#23313F"/>
    <path d="M54 69 q5 4 10 0" fill="none" stroke="#23313F" stroke-width="2"/>
    <path d="M22 58 L8 50 L14 61 L2 68 L24 64" fill="#FFC94A" stroke="#23313F" stroke-width="2"/>
  </svg>`;
}
function cloudPuff(): string {
  return `<svg class="cloud-puff-art" viewBox="0 0 190 110" aria-hidden="true">
    <path d="M24 90 C2 90 0 62 22 54 C12 28 46 14 64 34 C78 8 122 8 134 36 C162 24 188 48 174 70 C190 86 168 98 146 92 C122 104 44 104 24 90 Z" fill="#A8E6A3" stroke="#23313F" stroke-width="4"/>
    <path d="M40 55 C54 40 74 38 90 48 M104 42 C120 34 140 38 150 50" fill="none" stroke="#E7F9D8" stroke-width="5" stroke-linecap="round"/>
    <path d="M36 78 C64 86 126 86 158 76" fill="none" stroke="#79B85A" stroke-width="3" stroke-linecap="round" opacity="0.65"/>
  </svg>`;
}
function foxHop(): string {
  return `<svg class="fox-hop-art" viewBox="0 0 120 130" aria-hidden="true">
    <path d="M26 72 C4 58 8 26 30 24 C48 22 44 52 62 64" fill="#E8834E" stroke="#23313F" stroke-width="4"/>
    <path d="M34 42 C28 34 30 30 36 30 C42 30 41 37 45 42" fill="none" stroke="#FFF1D8" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="66" cy="80" rx="30" ry="34" fill="#E8834E" stroke="#23313F" stroke-width="4"/>
    <ellipse cx="66" cy="88" rx="18" ry="22" fill="#FFF1D8" stroke="#23313F" stroke-width="2.5"/>
    <path d="M42 74 L32 54 L52 66 Z M90 72 L100 52 L82 64 Z" fill="#E8834E" stroke="#23313F" stroke-width="3"/>
    <path d="M48 57 L42 46 L55 55 Z M84 57 L90 46 L77 55 Z" fill="#F6A696"/>
    <circle cx="54" cy="72" r="5" fill="#23313F"/><circle cx="78" cy="72" r="5" fill="#23313F"/>
    <circle cx="52" cy="70" r="1.8" fill="#FFFDF7"/><circle cx="76" cy="70" r="1.8" fill="#FFFDF7"/>
    <path d="M60 83 q6 -4 12 0 q-6 7 -12 0 Z" fill="#23313F"/>
    <path d="M66 88 v4 M66 92 q-6 4 -10 1 M66 92 q6 4 10 1" fill="none" stroke="#23313F" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M48 112 C38 122 36 128 40 132 M84 112 C94 122 96 128 92 132" stroke="#23313F" stroke-width="6" stroke-linecap="round"/>
  </svg>`;
}
function stormBolt(): string {
  return `<svg class="storm-bolt-art" viewBox="0 0 90 180" aria-hidden="true">
    <path d="M52 2 L14 94 L42 86 L30 178 L78 66 L48 74 Z" fill="#FFC94A" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
    <path d="M52 2 L32 64 L50 60 L42 116 L64 60 L46 64 Z" fill="#FFF3B0"/>
    <path d="M20 42 L10 54 L18 56 M70 110 L82 98 L74 96" stroke="#FFFDF7" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
  </svg>`;
}
function sunArt(): string {
  return `<svg class="sun-art" viewBox="0 0 110 110" aria-hidden="true">
    <g stroke="#FFC94A" stroke-width="7" stroke-linecap="round"><path d="M55 6 V22 M55 88 V104 M6 55 H22 M88 55 H104 M20 20 L31 31 M79 79 L90 90 M90 20 L79 31 M31 79 L20 90"/></g>
    <circle cx="55" cy="55" r="30" fill="#FFC94A" stroke="#23313F" stroke-width="4"/>
    <circle cx="46" cy="51" r="4" fill="#23313F"/><circle cx="64" cy="51" r="4" fill="#23313F"/>
    <path d="M48 64 q7 7 14 0" fill="none" stroke="#23313F" stroke-width="2.8" stroke-linecap="round"/>
    <circle cx="42" cy="63" r="4" fill="#F6A696" opacity="0.6"/><circle cx="68" cy="63" r="4" fill="#F6A696" opacity="0.6"/>
  </svg>`;
}
function birdArt(): string {
  return `<svg class="bird-art" viewBox="0 0 120 100" aria-hidden="true">
    <path d="M8 54 C30 18 54 24 60 44 C66 24 90 18 112 54 C88 48 70 52 60 68 C50 52 32 48 8 54 Z" fill="#8E7CC3" stroke="#23313F" stroke-width="4" stroke-linejoin="round"/>
    <path d="M36 48 C46 38 54 38 60 46 C52 50 44 52 36 48 Z M84 48 C74 38 66 38 60 46 C68 50 76 52 84 48 Z" fill="#B9A7D8" opacity="0.8"/>
    <circle cx="72" cy="44" r="3.5" fill="#23313F"/>
    <path d="M86 48 L102 52 L86 56 Z" fill="#FFC94A" stroke="#23313F" stroke-width="2"/>
    <path d="M60 68 L60 82 M52 80 L60 72 L68 80" stroke="#23313F" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}
function rainbowChipArt(color: string): string {
  const c = color === 'red' ? '#F27059' : color === 'orange' ? '#F6A25E' : color === 'yellow' ? '#FFC94A' : color === 'green' ? '#8ED3B0' : '#7FB6D9';
  return `<svg class="rainbow-chip-art" viewBox="0 0 140 80" aria-hidden="true">
    <path d="M8 58 C8 32 30 16 54 22 C64 4 92 4 102 24 C126 18 140 36 132 56 C120 72 28 76 8 58 Z" fill="#FFFDF7" stroke="#23313F" stroke-width="3"/>
    <path d="M18 48 C38 34 98 34 122 48" fill="none" stroke="${c}" stroke-width="16" stroke-linecap="round"/>
    <path d="M22 42 C42 30 94 30 116 42" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="4" stroke-linecap="round"/>
    <g fill="#FFFDF7" opacity="0.8"><circle cx="40" cy="60" r="3"/><circle cx="102" cy="58" r="2.5"/></g>
  </svg>`;
}
