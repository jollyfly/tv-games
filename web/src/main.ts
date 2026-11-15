import './styles.css';
import type { Action, GameRound, Level, SaveState, WorldId } from './types';
import {
  content,
  firstIncompleteLevel,
  getLevel,
  getWorld,
  getWorldById,
  worlds,
  introVoiceId,
  levels,
  nextLevelId,
  promptVoiceId,
  summaryVoiceId,
} from './content';
import { loadState, markLevelComplete, markTutorialDone, recordAttempt, resetProgress, saveState } from './state';
import { createAudio, type AudioEngine } from './audio';
import {
  animalHeadSvg,
  confettiSvg,
  effectSvg,
  worldEffectLayer,
  fireflySvg,
  foxSvg,
  guardianSvg,
  homeScene,
  iconSvg,
  objectSvg,
  patternIconSvg,
  remoteSvg,
  fishSvg,
  planeSvg,
  submarineSvg,
  starShape,
  worldScene,
  WORLD_NODE_POSITIONS,
  worldRouteSvg,
} from './art';
import { controlLegend, progressPips, escapeHtml, starCounter, levelBadge } from './ui';
import { createMicrogame, hasMicrogame, type MicroAction, type MicroHost, type Microgame } from './microgames';

type ScreenName = 'home' | 'worlds' | 'map' | 'intro' | 'question' | 'micro' | 'complete' | 'parent' | 'tutorial';
type ModalAction = string;

interface ModalOption {
  label: string;
  action: string;
  primary?: boolean;
}

interface ModalConfig {
  title: string;
  body?: string;
  illustration?: string;
  options: ModalOption[];
  onChoose: (action: ModalAction) => void;
  onBack?: () => void;
}

interface ChoiceModel {
  options: Array<number | string>;
  correctIndex: number;
}

interface MazeRuntime {
  cell: number;
  step: number;
  wrong: number;
  done: boolean;
}

interface QuestionRuntime {
  level: Level;
  roundIndex: number;
  attempts: number;
  hintUsed: boolean;
  hintRecorded: boolean;
  locked: boolean;
  revealed: boolean;
  advanced: boolean;
  correctBaseIndex: number;
  baseOptions: Array<number | string>;
  visibleIndices: number[];
  runId: number;
  maze?: MazeRuntime;
  compareFlipped?: boolean;
  compareLeft?: number;
  compareRight?: number;
}

interface NativeBridge {
  loadState?: () => string;
  saveState?: (json: string) => void;
  exitApp?: () => void;
  ready?: () => void;
  setAudioFocus?: (active: boolean) => void;
}

declare global {
  interface Window {
    __numberIsland?: {
      onNativeKey?: (payload: { action?: Action; repeat?: boolean } | Action) => void;
      onAppPause?: () => void;
      onAppResume?: () => void;
    };
    NumberIslandNative?: NativeBridge;
  }
}

const STAGE_W = 1920;
const STAGE_H = 1080;
const TOTAL_LEVELS = levels.length;

const CN_NUMBERS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '二十一', '二十二', '二十三', '二十四', '二十五'];

function worldColor(id: WorldId): string {
  const colors: Record<WorldId, string> = { forest: '#79B85A', candy: '#F27059', castle: '#8E7CC3', sky: '#2A9D8F', ocean: '#1E776D', dino: '#4D8A43', space: '#243B53', music: '#F6C7B9', donut: '#E39A25', magic: '#6E5CA6' };
  return colors[id];
}

function cnNumber(n: number): string {
  if (n === 100) return '一百';
  return CN_NUMBERS[n] ?? String(n);
}
const SCREEN_SELECTOR = '[data-focusable]';

class Game {
  private state: SaveState;
  private audio: AudioEngine;
  private screen: ScreenName = 'home';
  private sceneEl: HTMLElement;
  private overlayEl: HTMLElement;
  private captionEl: HTMLElement;
  private toastEl: HTMLElement;
  private stageEl: HTMLElement;
  private focusables: HTMLElement[] = [];
  private focusIndex = 0;
  private q: QuestionRuntime | null = null;
  private modal: ModalConfig | null = null;
  private modalFocusables: HTMLElement[] = [];
  private modalFocusIndex = 0;
  private timers: number[] = [];
  private welcomePlayed = false;
  private introLevelId = '';
  private mapFocusLevelId = '';
  private mapWorld: WorldId = 'forest';
  private microgame: Microgame | null = null;
  private parentReturn: 'home' | 'map' = 'home';
  private tutorialTarget = '';
  private tutorialStep = 0;
  private tutorialReturn: 'intro' | 'map' = 'intro';
  private completeLevelId = '';
  private completeAll = false;
  private sessionStart = 0;
  private breakArmed = false;
  private breakShown = false;
  private lastBackTimer = 0;
  private backHeld = false;
  private suppressBack = false;

  constructor() {
    this.state = loadState();
    this.audio = createAudio(this.state.settings);
    const scene = document.getElementById('scene');
    const overlay = document.getElementById('overlay');
    const caption = document.getElementById('caption');
    const toast = document.getElementById('toast');
    const stage = document.getElementById('stage');
    if (!scene || !overlay || !caption || !toast || !stage) throw new Error('Missing app shell');
    this.sceneEl = scene;
    this.overlayEl = overlay;
    this.captionEl = caption;
    this.toastEl = toast;
    this.stageEl = stage;
  }

  boot(): void {
    this.applyMotion();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.bindInput();
    this.bindClicks();
    window.__numberIsland = {
      onNativeKey: (payload) => {
        const action = typeof payload === 'string' ? payload : payload?.action;
        if (!action) return;
        this.handleAction(action);
      },
      onAppPause: () => this.onAppPause(),
      onAppResume: () => this.onAppResume(),
    };
    window.addEventListener('blur', () => {
      this.audio.stopVoice();
    });
    window.addEventListener('keyup', (event) => {
      if (this.screen !== 'micro') return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.handleMicroAction('release');
      }
    });
    this.sessionStart = Date.now();
    window.setInterval(() => this.checkBreak(), 30000);
    this.showHome(true);
    requestAnimationFrame(() => {
      (window as unknown as { NumberIslandNative?: NativeBridge }).NumberIslandNative?.ready?.();
    });
    this.previewFromQuery();
  }

  private resize(): void {
    const scale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
    this.stageEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  private bindInput(): void {
    document.addEventListener('keydown', (event) => {
      if (event.repeat) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' ', 'Escape', 'Backspace'].includes(event.key)) {
          event.preventDefault();
        }
        return;
      }
      let action: Action | null = null;
      switch (event.key) {
        case 'ArrowLeft': action = 'left'; break;
        case 'ArrowRight': action = 'right'; break;
        case 'ArrowUp': action = 'up'; break;
        case 'ArrowDown': action = 'down'; break;
        case 'Enter':
        case ' ': action = 'confirm'; break;
        case 'Escape':
        case 'Backspace':
          this.startBackHold();
          event.preventDefault();
          return;
      }
      if (action) {
        event.preventDefault();
        this.handleAction(action);
      }
    });
    document.addEventListener('keyup', (event) => {
      if (event.key === 'Escape' || event.key === 'Backspace') {
        event.preventDefault();
        this.endBackHold();
      }
    });
    window.addEventListener('blur', () => this.endBackHold(true));
  }

  private startBackHold(): void {
    if (this.backHeld) return;
    this.backHeld = true;
    this.suppressBack = false;
    window.clearTimeout(this.lastBackTimer);
    this.lastBackTimer = window.setTimeout(() => {
      if (!this.backHeld) return;
      this.suppressBack = true;
      this.handleAction('back_long');
    }, 1100);
  }

  private endBackHold(cancelOnly = false): void {
    if (!this.backHeld) return;
    this.backHeld = false;
    window.clearTimeout(this.lastBackTimer);
    if (cancelOnly) return;
    if (!this.suppressBack) this.handleAction('back');
    this.suppressBack = false;
  }

  private bindClicks(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as Element | null;
      if (!target) return;
      const replay = target.closest<HTMLElement>('[data-replay]');
      if (replay) {
        this.replayPrompt();
        return;
      }
      const modalButton = target.closest<HTMLElement>('[data-modal-index]');
      if (modalButton && this.modal) {
        const index = Number(modalButton.dataset.modalIndex);
        this.chooseModal(index);
        return;
      }
      const focusable = target.closest<HTMLElement>('[data-focusable]');
      if (!focusable) return;
      if (this.modal) {
        const modalIndex = this.modalFocusables.indexOf(focusable);
        if (modalIndex >= 0) {
          this.modalFocusIndex = modalIndex;
          this.applyModalFocus();
          this.chooseModal(modalIndex);
        }
        return;
      }
      const index = this.focusables.indexOf(focusable);
      if (index >= 0) {
        this.focusIndex = index;
        this.applyFocus(false);
      }
      this.activateFocusable(focusable);
      this.audio.unlock();
    });
  }

  private handleAction(action: Action): void {
    this.audio.unlock();
    if (!this.breakArmed && (action === 'confirm' || action === 'left' || action === 'right' || action === 'up' || action === 'down')) {
      this.breakArmed = true;
      this.sessionStart = Date.now();
    }
    if (this.modal) {
      this.handleModalAction(action);
      return;
    }
    if (this.screen === 'tutorial') {
      this.handleTutorialAction(action);
      return;
    }
    if (this.screen === 'parent') {
      this.handleParentAction(action);
      return;
    }
    if (this.screen === 'question') {
      this.handleQuestionAction(action);
      return;
    }
    if (this.screen === 'micro') {
      this.handleMicroAction(action);
      return;
    }
    if (this.screen === 'worlds') {
      if (action === 'left' || action === 'right') this.moveFocus(action === 'left' ? -1 : 1);
      else if (action === 'up' || action === 'down') this.moveFocus(action === 'up' ? -5 : 5);
      else if (action === 'confirm') this.activateFocused();
      else if (action === 'back') this.showHome();
      else if (action === 'back_long' || action === 'menu') this.showParent('home');
      return;
    }
    if (action === 'back_long') {
      if (this.screen === 'home' || this.screen === 'map') this.showParent(this.screen);
      return;
    }
    if (action === 'menu') {
      if (this.screen === 'home' || this.screen === 'map') this.showParent(this.screen);
      return;
    }
    if (action === 'left') this.moveFocus(-1);
    else if (action === 'right') this.moveFocus(1);
    else if (action === 'up' || action === 'down') this.moveFocus(action === 'up' ? -1 : 1);
    else if (action === 'confirm') this.activateFocused();
    else if (action === 'back') this.handleBack();
  }

  private handleBack(): void {
    switch (this.screen) {
      case 'home':
        this.openExitConfirm();
        break;
      case 'map':
        this.showWorlds();
        break;
      case 'worlds':
        this.showHome();
        break;
      case 'intro':
        this.showMap(getLevel(this.introLevelId).world, this.introLevelId);
        break;
      case 'complete':
        this.showMap(getLevel(this.completeLevelId).world, this.completeLevelId);
        break;
      case 'parent':
        this.showParentReturn();
        break;
    }
  }

  private onAppPause(): void {
    this.audio.stopAll();
    if (this.screen === 'question' && !this.modal) this.openPause();
  }

  private onAppResume(): void {
    if (this.modal) this.applyModalFocus();
  }

  private applyMotion(): void {
    document.body.classList.toggle('reduce-motion', this.state.settings.reduceMotion);
  }

  private save(): void {
    saveState(this.state);
    this.audio.updateSettings(this.state.settings);
    this.applyMotion();
  }

  private clearTimers(): void {
    for (const id of this.timers) window.clearTimeout(id);
    this.timers = [];
  }

  private after(ms: number, callback: () => void): number {
    const id = window.setTimeout(callback, ms);
    this.timers.push(id);
    return id;
  }

  private speak(id: string, text?: string): void {
    if (text) this.showCaption(text);
    void this.audio.playVoice(id, text);
  }

  private showCaption(text: string): void {
    if (!this.state.settings.captions) {
      this.captionEl.classList.remove('is-visible');
      return;
    }
    this.captionEl.textContent = text;
    this.captionEl.classList.add('is-visible');
    const timeout = window.setTimeout(() => this.captionEl.classList.remove('is-visible'), Math.max(2200, 1300 + text.length * 150));
    this.timers.push(timeout);
  }

  private toast(message: string): void {
    this.toastEl.innerHTML = `<div class="toast-bubble">${escapeHtml(message)}</div>`;
    this.toastEl.classList.add('is-visible');
    this.after(2400, () => this.toastEl.classList.remove('is-visible'));
  }

  private setScene(html: string): void {
    this.clearTimers();
    this.audio.stopVoice();
    this.sceneEl.innerHTML = `<div class="screen">${html}</div>`;
    this.focusables = [];
    this.focusIndex = 0;
  }

  private setFocusables(selector = SCREEN_SELECTOR, initial = 0): void {
    this.focusables = Array.from(this.sceneEl.querySelectorAll<HTMLElement>(selector)).filter((element) => !element.hasAttribute('disabled'));
    this.focusIndex = Math.max(0, Math.min(initial, this.focusables.length - 1));
    this.applyFocus(true);
  }

  private applyFocus(silent = false): void {
    this.focusables.forEach((element) => element.classList.remove('is-focused'));
    const element = this.focusables[this.focusIndex];
    if (!element) return;
    element.classList.add('is-focused');
    if (!silent) this.audio.playSfx('focus');
    if (this.screen === 'map') this.updateMapTooltip();
  }

  private moveFocus(delta: number): void {
    if (!this.focusables.length) return;
    const next = Math.max(0, Math.min(this.focusables.length - 1, this.focusIndex + delta));
    if (next === this.focusIndex) return;
    this.focusIndex = next;
    this.applyFocus(false);
  }

  private activateFocused(): void {
    const element = this.focusables[this.focusIndex];
    if (!element) return;
    this.activateFocusable(element);
  }

  private activateFocusable(element: HTMLElement): void {
    const action = element.dataset.action;
    if (!action) return;
    this.audio.playSfx('confirm');
    this.activateAction(action);
  }

  private activateAction(action: string): void {
    if (action === 'continue') this.startAdventure();
    else if (action === 'map') this.showWorlds();
    else if (action === 'start') this.startFocusedLevel();
    else if (action === 'next') this.nextLevelAction();
    else if (action === 'complete-map') this.showMap(this.completeLevelId ? getLevel(this.completeLevelId).world : this.currentLevel().world);
    else if (action === 'tutorial-start') this.finishTutorial();
    else if (action.startsWith('node:')) this.chooseMapLevel(action.slice(5));
    else if (action.startsWith('world:')) this.chooseWorld(action.slice(6));
    else if (action.startsWith('option:')) this.chooseAnswer(Number(action.slice(7)));
    else if (action.startsWith('parent:')) this.activateParent(action.slice(7));
    else if (action === 'parent-close') this.showParentReturn();
  }

  private currentLevel(): Level {
    return firstIncompleteLevel(this.state);
  }

  private isAllComplete(): boolean {
    return this.state.progress.completed.length >= levels.length;
  }

  private isUnlocked(level: Level): boolean {
    if (this.state.settings.unlockAll) return true;
    if (this.state.progress.completed.includes(level.id)) return true;
    const incomplete = this.currentLevel();
    return level.id === incomplete.id;
  }

  private showHome(initial = false): void {
    this.screen = 'home';
    this.q = null;
    this.modal = null;
    this.overlayEl.innerHTML = '';
    this.audio.setWorld('forest');
    const level = this.currentLevel();
    const allDone = this.isAllComplete();
    const world = getWorld(level.id);
    const completed = this.state.progress.completed.length;
    const buttonLabel = allDone ? '再玩一次' : '继续冒险';
    const buttonSub = allDone ? '星光庆典 · 全岛都亮啦' : `第 ${level.number} 关 · ${level.title}`;
    this.setScene(`
      ${homeScene()}
      <div class="home-brand">
        <h1 class="sr-only">数字岛大冒险</h1>
        <svg class="home-logo" viewBox="0 0 760 370" aria-hidden="true">
          <text x="2" y="144" class="logo-text logo-cream" font-size="138" stroke-width="18" stroke-linejoin="round">数字岛</text>
          <text x="2" y="310" class="logo-text logo-sun" font-size="138" stroke-width="18" stroke-linejoin="round">大冒险</text>
        </svg>
        <p class="home-sub">和点点一起，点亮数字岛</p>
        <p class="home-kicker">${TOTAL_LEVELS} 个数字关卡 · 遥控器冒险 · 不识字也能玩</p>
      </div>

      <div class="home-actions">
        <button class="paper-button primary home-primary" data-focusable data-action="continue">
          <span class="button-symbol">${iconSvg('play')}</span>
          <span class="button-copy"><strong>${buttonLabel}</strong><small>${buttonSub}</small></span>
        </button>
        <button class="paper-button secondary home-secondary" data-focusable data-action="map">
          <span class="button-symbol map-symbol">${iconSvg('map')}</span>
          <span class="button-copy"><strong>关卡地图</strong><small>${allDone ? '重温每一站' : `${completed} / ${TOTAL_LEVELS} 颗数字星`}</small></span>
        </button>
      </div>

      <div class="home-fox">${foxSvg('home-fox-svg fox-svg')}</div>
      <div class="home-firefly">${fireflySvg('home-firefly-svg')}</div>
      <div class="home-sparkle sparkle-a">${iconSvg('star', 'home-sparkle-star')}</div>
      <div class="home-sparkle sparkle-b">${iconSvg('star', 'home-sparkle-star')}</div>
      <div class="home-parent-hint">${iconSvg('parent', 'parent-hint-icon')} 家长：长按返回键</div>
      ${controlLegend([{ icon: 'left', label: '选择' }, { icon: 'right', label: '选择' }, { icon: 'ok', label: '确定' }, { icon: 'back', label: '返回' }])}
    `);
    this.setFocusables('[data-focusable]', 0);
    if (initial && !this.welcomePlayed) {
      this.welcomePlayed = true;
      this.after(700, () => {
        if (this.screen === 'home' && !this.modal && !this.state.progress.tutorialDone) {
          this.speak('welcome', content.voices.welcome);
        }
      });
    }
  }

  private startAdventure(): void {
    const level = this.isAllComplete() ? levels[0] : this.currentLevel();
    if (!this.state.progress.tutorialDone) {
      this.showTutorial(level.id, 'intro');
    } else {
      this.showIntro(level);
    }
  }

  private worldLevels(worldId: WorldId): Level[] {
    return levels.filter((level) => level.world === worldId);
  }

  private isWorldUnlocked(worldId: WorldId): boolean {
    const done = new Set(this.state.progress.completed);
    return this.worldLevels(worldId).some((level) => done.has(level.id) || this.isUnlocked(level));
  }

  private worldDoneCount(worldId: WorldId): number {
    const done = new Set(this.state.progress.completed);
    return this.worldLevels(worldId).filter((level) => done.has(level.id)).length;
  }

  private showWorlds(): void {
    this.screen = 'worlds';
    this.q = null;
    this.modal = null;
    this.overlayEl.innerHTML = '';
    this.audio.setWorld('forest');
    const current = this.currentLevel();
    const completed = this.state.progress.completed.length;
    const cards = worlds.map((world) => {
      const chapter = this.worldLevels(world.id);
      const done = this.worldDoneCount(world.id);
      const unlocked = this.isWorldUnlocked(world.id);
      const isCurrent = current.world === world.id;
      return `<button class="world-card${isCurrent ? ' is-current' : ''}${!unlocked ? ' is-locked' : ''}" data-focusable data-action="world:${world.id}" aria-label="${escapeHtml(world.name)}，已完成 ${done}/10${unlocked ? '' : '，未解锁'}">
        <span class="world-card-top" style="--world-accent:${worldColor(world.id)}"></span>
        <span class="world-card-guardian">${guardianSvg(world.guardian, 'world-card-guardian-svg')}</span>
        <span class="world-card-name">${escapeHtml(world.name)}</span>
        <span class="world-card-skill">${escapeHtml(world.skill)}</span>
        <span class="world-card-progress">${done} / 10 颗星</span>
        <span class="world-card-state">${!unlocked ? iconSvg('lock', 'world-card-lock') : isCurrent ? '继续' : done === 10 ? '已完成' : '进入'}</span>
      </button>`;
    }).join('');
    this.setScene(`
      ${homeScene()}
      <div class="map-entry-wipe worlds-wipe" style="--wipe:#2A9D8F"></div>
      <div class="world-select-screen">
        <div class="world-select-header">
          <div class="map-eyebrow">数字岛 · 十座主题岛</div>
          <h1>选择一张地图</h1>
          <p>每张地图 10 关，共 ${TOTAL_LEVELS} 关</p>
        </div>
        <div class="world-starcount">${starCounter(completed, TOTAL_LEVELS)}</div>
        <div class="world-grid">${cards}</div>
        <div class="world-parent-hint">${iconSvg('parent', 'parent-hint-icon')} 家长：长按返回键</div>
        ${controlLegend([{ icon: 'left', label: '选择' }, { icon: 'right', label: '选择' }, { icon: 'up', label: '选择' }, { icon: 'down', label: '选择' }, { icon: 'ok', label: '进入' }, { icon: 'back', label: '回首页' }])}
      </div>
    `);
    const currentIndex = Math.max(0, worlds.findIndex((world) => world.id === current.world));
    this.setFocusables('.world-card', currentIndex);
  }

  private chooseWorld(id: string): void {
    const world = getWorldById(id);
    if (!this.isWorldUnlocked(world.id)) {
      this.audio.playSfx('locked');
      this.speak('locked', content.voices.locked);
      this.toast('先完成前面的地图，再来这里吧');
      return;
    }
    const chapter = this.worldLevels(world.id);
    const done = new Set(this.state.progress.completed);
    const current = this.currentLevel();
    const focus = chapter.find((level) => level.id === current.id)?.id
      ?? chapter.find((level) => !done.has(level.id))?.id
      ?? chapter[chapter.length - 1].id;
    this.showMap(world.id, focus);
  }

  private handleMicroAction(action: Action | 'release'): void {
    const game = this.microgame;
    if (!game) return;
    if (action === 'back') {
      const world = game.worldId;
      const levelId = game.levelId;
      game.dispose();
      this.microgame = null;
      this.showMap(world, levelId);
      return;
    }
    if (action === 'menu') {
      const voiceKey = `micro-${game.levelId}`;
      const voiceText = content.voices[voiceKey];
      if (voiceText) {
        this.audio.stopVoice();
        this.speak(voiceKey, voiceText);
      }
      return;
    }
    if (action === 'back_long') {
      const world = game.worldId;
      game.dispose();
      this.microgame = null;
      this.showMap(world);
      return;
    }
    if (!['left', 'right', 'up', 'down', 'confirm', 'release'].includes(action)) return;
    const result = game.handle(action as MicroAction);
    if (result.toast) this.toast(result.toast);
    if (this.screen !== 'micro') return;
    if (result.redraw) this.renderMicrogame();
  }

  private startMicrogame(level: Level): void {
    this.screen = 'micro';
    this.q = null;
    this.modal = null;
    this.overlayEl.innerHTML = '';
    this.audio.setWorld(level.world);
    this.audio.stopVoice();
    const host: MicroHost = {
      redraw: () => this.renderMicrogame(),
      complete: () => this.finishMicrogame(),
      toast: (message) => this.toast(message),
    };
    this.microgame = createMicrogame(level, host);
    if (!this.microgame) {
      this.showMap(level.world, level.id);
      return;
    }
    this.renderMicrogame();
    const voiceKey = `micro-${level.id}`;
    const voiceText = content.voices[voiceKey];
    if (voiceText) this.speak(voiceKey, voiceText);
  }

  private renderMicrogame(): void {
    const game = this.microgame;
    if (!game) return;
    const info = game.info;
    const level = game['level'] as Level;
    const world = getWorld(level.id);
    this.setScene(`
      ${worldScene(level.world)}
      <div class="micro-screen">
        <div class="micro-header">
          <div class="micro-eyebrow">${escapeHtml(world.name)} · 第 ${level.number} 关</div>
          <h1 class="micro-title">${escapeHtml(info.name)}</h1>
          <p class="micro-verb">${escapeHtml(info.verb)}</p>
        </div>
        ${game.render()}
        <div class="micro-parent-hint">${iconSvg('parent', 'parent-hint-icon')} 菜单键再听 · 家长：长按返回键</div>
        ${controlLegend(info.controls)}
      </div>
    `);
  }

  private finishMicrogame(): void {
    const game = this.microgame;
    if (!game) return;
    const level = game['level'] as Level;
    game.dispose();
    this.microgame = null;
    const { allComplete } = markLevelComplete(this.state, level.id);
    this.save();
    this.showComplete(level, allComplete);
  }

  private showMap(worldId: WorldId, focusLevelId?: string): void {
    this.screen = 'map';
    this.mapWorld = worldId;
    this.q = null;
    this.modal = null;
    this.overlayEl.innerHTML = '';
    this.audio.setWorld(worldId);
    const world = getWorldById(worldId);
    const chapter = this.worldLevels(worldId);
    const current = this.currentLevel();
    const completedIds = new Set(this.state.progress.completed);
    const doneInWorld = this.worldDoneCount(worldId);
    const allDone = this.isAllComplete();
    const completed = this.state.progress.completed.length;
    const focusCandidate = focusLevelId && chapter.some((level) => level.id === focusLevelId)
      ? focusLevelId
      : (chapter.find((level) => !completedIds.has(level.id))?.id ?? chapter[chapter.length - 1].id);
    this.mapFocusLevelId = focusCandidate;
    const nodes = chapter.map((level, index) => {
      const done = completedIds.has(level.id);
      const unlocked = this.isUnlocked(level);
      const isCurrent = !done && level.id === current.id;
      const position = WORLD_NODE_POSITIONS[index];
      const cls = done ? 'is-done' : isCurrent ? 'is-current' : unlocked ? 'is-available' : 'is-locked';
      const statusIcon = done ? iconSvg('star', 'node-status-icon') : isCurrent ? iconSvg('play', 'node-status-icon') : !unlocked ? iconSvg('lock', 'node-status-icon') : iconSvg('play', 'node-status-icon');
      return `<button class="map-node ${cls}" style="left:${position.x}px;top:${position.y}px" data-focusable data-action="node:${level.id}" aria-label="第 ${level.number} 关 ${escapeHtml(level.title)}${done ? '，已完成' : !unlocked ? '，未解锁' : ''}">
        <span class="map-disc"><span class="map-number">${level.number}</span>${isCurrent ? '<span class="map-current-ribbon">继续</span>' : ''}</span>
        <span class="map-status">${statusIcon}</span>
        ${done ? '<span class="map-done-star">' + iconSvg('star', 'map-done-star-icon') + '</span>' : ''}
      </button>`;
    }).join('');
    this.setScene(`
      ${worldScene(worldId)}
      <div class="map-entry-wipe" style="--wipe:${worldColor(worldId)}"></div>
      <div class="world-route-layer">${worldRouteSvg()}</div>
      <div class="map-header">
        <div class="map-title-block">
          <div class="map-eyebrow">数字岛 · ${escapeHtml(world.name)}</div>
          <h1 class="map-title">${escapeHtml(world.name)}</h1>
          <p class="map-subtitle">${doneInWorld} / 10 颗星${allDone ? ' · 全岛都亮啦！' : ''}</p>
        </div>
      </div>
      <div class="map-starcount">${starCounter(completed, TOTAL_LEVELS)}</div>
      <div class="map-node-layer">${nodes}</div>
      <div class="map-tooltip" id="map-tooltip"></div>
      <div class="map-firefly">${fireflySvg('map-firefly-svg')}</div>
      <div class="map-parent-hint">${iconSvg('parent', 'parent-hint-icon')} 家长：长按返回键</div>
      ${controlLegend([{ icon: 'left', label: '选择关卡' }, { icon: 'right', label: '选择关卡' }, { icon: 'ok', label: '进入' }, { icon: 'back', label: '回十座岛' }])}
    `);
    const targetIndex = Math.max(0, chapter.findIndex((level) => level.id === this.mapFocusLevelId));
    this.setFocusables('.map-node', targetIndex);
    this.updateMapTooltip();
  }

  private updateMapTooltip(): void {
    const tooltip = document.getElementById('map-tooltip');
    if (!tooltip) return;
    const el = this.focusables[this.focusIndex];
    const id = el?.dataset.action?.replace('node:', '');
    if (!id) return;
    this.mapFocusLevelId = id;
    const level = getLevel(id);
    const done = this.state.progress.completed.includes(id);
    const unlocked = this.isUnlocked(level);
    const world = getWorld(id);
    tooltip.innerHTML = `<span class="tooltip-level">第 ${level.number} 关 · ${escapeHtml(level.title)}</span><span class="tooltip-world">${escapeHtml(world.name)} · ${escapeHtml(level.skill)}</span><span class="tooltip-action">${!unlocked ? '先完成前面的关卡' : done ? '按 OK 再玩一次' : '按 OK 开始'}</span>`;
  }

  private chooseMapLevel(id: string): void {
    const level = getLevel(id);
    if (!this.isUnlocked(level)) {
      this.audio.playSfx('locked');
      this.speak('locked', content.voices.locked);
      this.toast('先完成前面的关卡，再来这里吧');
      return;
    }
    this.showIntro(level);
  }

  private showIntro(level: Level): void {
    if (hasMicrogame(level.id)) {
      this.startMicrogame(level);
      return;
    }
    this.screen = 'intro';
    this.q = null;
    this.introLevelId = level.id;
    this.overlayEl.innerHTML = '';
    this.audio.setWorld(level.world);
    this.preloadLevelVoices(level);
    const world = getWorld(level.id);
    const resume = this.state.resume?.levelId === level.id ? this.state.resume : null;
    const startLabel = resume ? `继续第 ${resume.roundIndex + 1} 题` : '出发';
    const guardian = guardianSvg(level.guardian);
    this.setScene(`
      ${worldScene(level.world)}
      <div class="intro-overlay">
        <div class="intro-panel">
          <div class="intro-eyebrow">第 ${level.number} 关 · ${escapeHtml(world.name)}</div>
          <h1 class="intro-title">${escapeHtml(level.title)}</h1>
          <p class="intro-mission">${escapeHtml(level.intro)}</p>
          <div class="intro-skill"><span>这次练习</span><b>${escapeHtml(level.skill)}</b></div>
          <button class="paper-button primary intro-start" data-focusable data-action="start">
            <span class="button-symbol">${iconSvg('play')}</span>
            <span class="button-copy"><strong>${startLabel}</strong><small>${resume ? '接着上次的地方' : '按 OK，和点点一起出发'}</small></span>
          </button>
        </div>
        <div class="intro-guardian">${guardian}</div>
        <div class="intro-fox">${foxSvg('intro-fox-svg fox-svg')}</div>
      </div>
      <div class="intro-parent-hint">返回键：回地图</div>
    `);
    this.setFocusables('[data-focusable]', 0);
    this.speak(introVoiceId(level), level.intro);
  }

  private startFocusedLevel(): void {
    const level = getLevel(this.introLevelId);
    if (hasMicrogame(level.id)) {
      this.startMicrogame(level);
      return;
    }
    this.startLevel(level);
  }

  private preloadLevelVoices(level: Level): void {
    const ids = [introVoiceId(level), ...level.rounds.map((_, index) => promptVoiceId(level, index)), ...Array.from({ length: 10 }, (_, i) => `count-${i + 1}`), ...Array.from({ length: 9 }, (_, i) => `summary-${i + 2}`)];
    this.audio.preload(ids);
  }

  private showTutorial(targetLevelId: string, returnTo: 'intro' | 'map'): void {
    this.screen = 'tutorial';
    this.tutorialTarget = targetLevelId;
    this.tutorialStep = 0;
    this.tutorialReturn = returnTo;
    this.audio.setWorld('forest');
    this.renderTutorial();
    this.speak('tutorial-1', content.voices['tutorial-1']);
  }

  private renderTutorial(): void {
    const step = this.tutorialStep;
    const activeKey = step === 0 ? 'left' : step === 1 ? 'ok' : step === 2 ? 'up' : null;
    const steps = [
      { title: '先让光圈动起来', body: '按左键或右键，选一选卡片。', hint: '← →' },
      { title: '按 OK 确定', body: '看到喜欢的答案，按中间的大按钮。', hint: 'OK' },
      { title: '没听清就再听', body: '按上键，萤萤会再说一遍。', hint: '↑' },
    ];
    const final = step === 3;
    this.setScene(`
      ${homeScene()}
      <div class="tutorial-overlay">
        <div class="tutorial-card">
          <div class="tutorial-copy">
            <div class="tutorial-eyebrow">遥控器小课堂 · ${Math.min(step + 1, 3)} / 3</div>
            <h1>${final ? '准备好啦！' : steps[step].title}</h1>
            <p>${final ? '你已经会用遥控器了。和点点一起出发吧。' : steps[step].body}</p>
            <div class="tutorial-progress">${[0, 1, 2].map((index) => `<span class="${index < step ? 'is-done' : ''}${index === step ? ' is-current' : ''}"></span>`).join('')}</div>
            ${final ? `<button class="paper-button primary tutorial-start" data-focusable data-action="tutorial-start"><span class="button-symbol">${iconSvg('play')}</span><span class="button-copy"><strong>开始冒险</strong><small>按 OK 出发</small></span></button>` : `<div class="tutorial-prompt-pill">${steps[step].hint} <span>试试看</span></div>`}
            <button class="text-button tutorial-home" type="button" data-tutorial-home>先回首页</button>
          </div>
          <div class="tutorial-remote">${remoteSvg(activeKey)}</div>
        </div>
      </div>
      <div class="tutorial-note">家长也可以在“家长区”重看这段教学</div>
    `);
    if (final) this.setFocusables('[data-focusable]', 0);
    const homeButton = this.sceneEl.querySelector<HTMLElement>('[data-tutorial-home]');
    homeButton?.addEventListener('click', () => this.showHome());
  }

  private handleTutorialAction(action: Action): void {
    if (action === 'back') {
      this.showHome();
      return;
    }
    if (this.tutorialStep === 0 && (action === 'left' || action === 'right')) {
      this.audio.playSfx('correct');
      this.tutorialStep = 1;
      this.renderTutorial();
      this.speak('tutorial-2', content.voices['tutorial-2']);
      return;
    }
    if (this.tutorialStep === 1 && action === 'confirm') {
      this.audio.playSfx('correct');
      this.tutorialStep = 2;
      this.renderTutorial();
      this.speak('tutorial-3', content.voices['tutorial-3']);
      return;
    }
    if (this.tutorialStep === 2 && action === 'up') {
      this.audio.playSfx('correct');
      this.tutorialStep = 3;
      this.renderTutorial();
      this.speak('tutorial-done', content.voices['tutorial-done']);
      return;
    }
    if (this.tutorialStep === 3 && action === 'confirm') this.finishTutorial();
    if (action === 'back_long') return;
  }

  private finishTutorial(): void {
    markTutorialDone(this.state);
    this.save();
    if (this.tutorialReturn === 'map') {
      this.showMap(getLevel(this.tutorialTarget).world, this.tutorialTarget);
    } else {
      this.showIntro(getLevel(this.tutorialTarget));
    }
  }


  private previewFromQuery(): void {
    const preview = new URLSearchParams(window.location.search).get('preview');
    if (!preview) return;
    window.setTimeout(() => {
      if (hasMicrogame(preview)) {
        const level = levels.find((item) => item.id === preview);
        if (level) this.startMicrogame(level);
      }
      else if (preview === 'map') this.showWorlds();
      else if (preview === 'ocean') {
        this.showMap('ocean');
      }
      else if (preview === 'worlds') this.showWorlds();
      else if (preview === 'parent') this.showParent('home');
      else if (preview === 'tutorial') this.showTutorial(levels[0].id, 'intro');
      else if (preview.startsWith('q')) {
        const level = getLevel(levels[Math.max(0, Math.min(levels.length - 1, Number(preview.slice(1)) - 1))].id);
        this.state.progress.tutorialDone = true;
        this.showIntro(level);
        this.startLevel(level);
      } else if (preview === 'complete') {
        const level = levels[1];
        this.state.progress.completed = [levels[0].id];
        this.completeLevelId = level.id;
        this.completeAll = false;
        this.showComplete(level, false);
      }
    }, 120);
  }

  private startLevel(level: Level): void {
    this.screen = 'question';
    this.audio.setWorld(level.world);
    this.preloadLevelVoices(level);
    const resume = this.state.resume?.levelId === level.id ? this.state.resume : null;
    this.beginRound(level, resume?.roundIndex ?? 0, resume?.attempts ?? 0, Boolean(resume?.attemptsUsedHints));
  }

  private beginRound(level: Level, roundIndex: number, attempts = 0, hintUsed = false): void {
    const round = level.rounds[roundIndex];
    const compareFlipped = round.kind === 'compare' && Math.random() < 0.5;
    const effectiveRound: GameRound = compareFlipped && round.kind === 'compare'
      ? { ...round, left: round.right, right: round.left }
      : round;
    const shuffled = this.shuffleChoiceModel(this.buildChoiceModel(effectiveRound), effectiveRound);
    const model = shuffled;
    const q: QuestionRuntime = {
      level,
      roundIndex,
      attempts,
      hintUsed,
      hintRecorded: hintUsed,
      locked: false,
      revealed: false,
      advanced: false,
      correctBaseIndex: model.correctIndex,
      baseOptions: model.options,
      visibleIndices: model.options.map((_, index) => index),
      runId: Date.now(),
      compareFlipped,
      compareLeft: effectiveRound.kind === 'compare' ? effectiveRound.left : undefined,
      compareRight: effectiveRound.kind === 'compare' ? effectiveRound.right : undefined,
    };
    if (round.kind === 'maze') {
      q.maze = { cell: round.grid.indexOf(1), step: 1, wrong: 0, done: false };
    }
    this.q = q;
    this.state.resume = {
      levelId: level.id,
      roundIndex,
      attempts,
      attemptsUsedHints: hintUsed ? 1 : 0,
    };
    this.save();
    this.renderQuestion(true);
  }

  private shuffleChoiceModel(model: ChoiceModel, round: GameRound): ChoiceModel {
    // Keep the learning target fixed, but never leave the correct answer in a
    // predictable slot. Compare/maze use spatial layouts instead of option cards.
    if (round.kind === 'compare' || round.kind === 'maze' || round.kind === 'coord' || model.options.length < 2) return model;
    const order = model.options.map((_, index) => index);
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return {
      options: order.map((index) => model.options[index]),
      correctIndex: order.indexOf(model.correctIndex),
    };
  }

  private buildChoiceModel(round: GameRound): ChoiceModel {
    switch (round.kind) {
      case 'count':
      case 'quantity':
        return { options: round.options.slice(), correctIndex: round.options.indexOf(round.target) };
      case 'sequence':
        return { options: round.options.slice(), correctIndex: round.options.indexOf(round.answer) };
      case 'pattern':
        return { options: round.options.slice(), correctIndex: round.options.indexOf(round.answer) };
      case 'ordinal':
        return { options: round.options.slice(), correctIndex: round.options.indexOf(round.answer) };
      case 'compare': {
        const correctSide = round.ask === 'more'
          ? (round.left > round.right ? 'left' : 'right')
          : (round.left < round.right ? 'left' : 'right');
        return { options: ['left', 'right'], correctIndex: correctSide === 'left' ? 0 : 1 };
      }
      case 'plane':
      case 'relation':
        return { options: round.options.slice(), correctIndex: round.options.indexOf('answer' in round ? round.answer : round.target) };
      case 'odd':
        return { options: round.items.slice(), correctIndex: round.oddIndex };
      case 'coord':
        return { options: round.items.slice(), correctIndex: (round.targetRow - 1) * round.cols + (round.targetCol - 1) };
      case 'share':
        return { options: round.options.slice(), correctIndex: round.options.indexOf(round.answer) };
      case 'maze':
        return { options: [], correctIndex: 0 };
    }
  }

  private renderQuestion(announce: boolean): void {
    const q = this.q;
    if (!q) return;
    this.screen = 'question';
    const level = q.level;
    const round = level.rounds[q.roundIndex];
    const world = getWorld(level.id);
    const allChoices = this.renderAnswerArea(level, round);
    const play = this.renderPlayArea(level, round);
    const isCompare = round.kind === 'compare';
    const isMaze = round.kind === 'maze';
    const isPlane = round.kind === 'plane';
    const isRelation = round.kind === 'relation';
    const isCoord = round.kind === 'coord';
    const promptChip = isCompare
      ? `<span class="ask-chip">${round.ask === 'more' ? '更多' : '更少'} ${iconSvg(round.ask === 'more' ? 'up' : 'down', 'ask-chip-icon')}</span>`
      : '';
    this.setScene(`
      ${worldScene(level.world)}
      <div class="question-screen q-${round.kind}">
        <div class="question-hud">
          <div class="level-chip"><span class="level-chip-dot"></span><span>${escapeHtml(world.name)} · 第 ${level.number} 关</span></div>
          ${progressPips(q.roundIndex)}
          ${starCounter(this.state.progress.completed.length, TOTAL_LEVELS)}
        </div>
        <div class="prompt-bubble">
          <div class="prompt-firefly">${fireflySvg('prompt-firefly-svg')}</div>
          <div class="prompt-copy">
            <p>${escapeHtml(round.prompt)}</p>
            ${promptChip}
          </div>
          <button class="replay-button" type="button" data-replay aria-label="再听一遍题目">
            ${iconSvg('speaker', 'replay-icon')}
            <span>↑ 再听</span>
          </button>
        </div>
        ${isCompare || isMaze || isPlane || isRelation || isCoord ? '' : '<div class="play-panel-wrap">'}
        ${play}
        ${isCompare || isMaze || isPlane || isRelation || isCoord ? '' : '</div>'}
        ${isMaze || isPlane || isCoord ? '' : allChoices}
        <div class="question-guardian">${guardianSvg(level.guardian)}</div>
        ${isMaze || isPlane || isCoord ? '' : `<div class="question-fox">${foxSvg('question-fox-svg')}</div>`}
        ${isCompare || isMaze || isPlane ? '' : `<div class="question-star-star sparkle-one">${iconSvg('star', 'question-sparkle-icon')}</div>`}
        ${controlLegend(isMaze
          ? [{ icon: 'left', label: '移动' }, { icon: 'right', label: '移动' }, { icon: 'up', label: '移动' }, { icon: 'down', label: '移动' }, { icon: 'ok', label: '再听' }, { icon: 'back', label: '暂停' }]
          : isPlane
            ? [{ icon: 'left', label: '瞄准' }, { icon: 'right', label: '瞄准' }, { icon: 'ok', label: '发射' }, { icon: 'up', label: '再听' }, { icon: 'back', label: '暂停' }]
            : isCoord
              ? [{ icon: 'left', label: '看星图' }, { icon: 'right', label: '看星图' }, { icon: 'up', label: '看星图' }, { icon: 'down', label: '看星图' }, { icon: 'ok', label: '选择' }, { icon: 'back', label: '暂停' }]
              : [{ icon: 'left', label: '选择' }, { icon: 'right', label: '选择' }, { icon: 'ok', label: '确定' }, { icon: 'up', label: '再听' }, { icon: 'back', label: '暂停' }])}
      </div>
    `);
    if (!isMaze && !isCompare) {
      this.setFocusables('.answer-option', this.focusIndexForAnswer());
    } else if (isCompare) {
      this.setFocusables('.answer-option', this.focusIndexForAnswer());
    } else {
      this.focusables = [];
    }
    if (announce) {
      this.after(280, () => this.replayPrompt());
    }
  }

  private focusIndexForAnswer(): number {
    if (!this.q) return 0;
    if (this.q.revealed) {
      const index = this.q.visibleIndices.indexOf(this.q.correctBaseIndex);
      return index >= 0 ? index : 0;
    }
    return 0;
  }

  private renderPlayArea(level: Level, round: GameRound): string {
    if (!this.q) return '';
    switch (round.kind) {
      case 'count': {
        return `<div class="play-panel">
          <div class="count-stage count-${round.object}">
            <div class="count-bed">
              ${this.renderCountItems(round.object, round.target)}
            </div>
            <div class="count-caption">数一数，一共有几个？</div>
          </div>
        </div>`;
      }
      case 'quantity': {
        return `<div class="play-panel quantity-panel">
          <div class="target-sign">
            <span class="target-label">要几个？</span>
            <strong>${round.target}</strong>
            <span class="target-sub">看看哪个盘子正好</span>
          </div>
          <div class="quantity-message">
            ${fireflySvg('quantity-firefly-svg')}
            <p>看清数字，再数一数。</p>
          </div>
        </div>`;
      }
      case 'plane': {
        return this.renderPlaneBattle(round);
      }
      case 'relation': {
        return this.renderRelation(round);
      }
      case 'coord': {
        const q = this.q;
        if (!q) return '';
        const cells = round.items.map((value, index) => {
          const isAnswer = q.revealed && index === q.correctBaseIndex;
          return `<button class="coord-cell answer-option${isAnswer ? ' is-answer' : ''}" data-base-index="${index}" data-choice-value="${escapeHtml(value)}" data-focusable data-action="option:${index}" aria-label="星图格 ${index + 1}">${patternIconSvg(value)}</button>`;
        }).join('');
        return `<div class="play-panel coord-panel"><div class="coord-clue">第 <b>${round.targetRow}</b> 行 · 第 <b>${round.targetCol}</b> 列</div><div class="coord-grid" style="--coord-cols:${round.cols}">${cells}</div></div>`;
      }
      case 'share': {
        const donuts = Array.from({ length: round.total }, () => objectSvg('donut')).join('');
        return `<div class="play-panel share-panel"><div class="share-ticket">订单：${round.total} 个甜甜圈，分给 ${round.parts} 个盘子，要一样多</div><div class="share-donuts">${donuts}</div></div>`;
      }
      case 'odd': {
        return `<div class="play-panel odd-panel"><div class="odd-caption">找出和大家不一样的那个数字</div><div class="odd-hint">看仔细，它们中有两个是一样的</div></div>`;
      }
      case 'sequence': {
        const sequenceCaption = level.world === 'candy' ? '小火车少了一节车厢' : level.world === 'ocean' ? '潜水艇的路线少了一段' : '数字小桥少了一块';
        const sequenceSub = level.world === 'candy' ? '补上正确的车厢数字' : level.world === 'ocean' ? '补上正确的航标数字' : '补上桥中间的数字';
        return `<div class="play-panel sequence-panel">
          <div class="sequence-caption">${sequenceCaption}</div>
          <div class="sequence-track sequence-${level.world}">
            ${round.sequence.map((value) => `<div class="sequence-tile ${value === null ? 'is-missing' : ''}">${value === null ? '<span class="missing-mark">?</span>' : `<span>${value}</span>`}</div>`).join('')}
          </div>
          <div class="sequence-sub">${sequenceSub}</div>
        </div>`;
      }
      case 'compare': {
        return this.renderComparePanels(round);
      }
      case 'pattern': {
        return `<div class="play-panel pattern-panel">
          <div class="pattern-caption">${level.world === 'ocean' ? '跟着泡泡找规律' : '跟着星光找规律'}</div>
          <div class="pattern-strip">
            ${round.sequence.map((value) => `<div class="pattern-tile">${patternIconSvg(value)}</div>`).join('')}
            <div class="pattern-tile pattern-mystery"><span>?</span></div>
          </div>
        </div>`;
      }
      case 'ordinal': {
        return `<div class="play-panel ordinal-panel${this.q!.attempts > 0 ? ' show-positions' : ''}">
          <div class="ordinal-target">找第 <b>${round.position}</b> 个</div>
          <div class="ordinal-track">
            <div class="ordinal-flag">
              <span class="flag-pole"></span><span class="flag-cloth">起点</span>
            </div>
            ${round.lineup.map((animal, index) => `<div class="ordinal-animal" data-position="${index + 1}">${guardianSvg(animal, `ordinal-svg ${animal}-ordinal`)}<span class="ordinal-number">${index + 1}</span></div>`).join('')}
          </div>
        </div>`;
      }
      case 'maze': {
        return this.renderMaze(round);
      }
    }
  }

  private renderPlaneBattle(round: Extract<GameRound, { kind: 'plane' }>): string {
    const q = this.q;
    if (!q) return '';
    const ocean = round.theme === 'ocean';
    const target = round.mode === 'number'
      ? `${round.target}`
      : `${round.target}<small>颗星星</small>`;
    const planes = q.visibleIndices.map((baseIndex, index) => {
      const value = Number(q.baseOptions[baseIndex]);
      const isAnswer = q.revealed && baseIndex === q.correctBaseIndex;
      const payload = round.mode === 'number'
        ? `<span class="enemy-banner-number">${value}</span>`
        : `<span class="enemy-stars">${Array.from({ length: value }, () => iconSvg('star', 'enemy-star')).join('')}</span>`;
      const enemyArt = ocean
        ? fishSvg(index as 0 | 1 | 2, 'enemy-plane-svg')
        : planeSvg('enemy', 'enemy-plane-svg', index as 0 | 1 | 2);
      return `<button class="enemy-plane answer-option${isAnswer ? ' is-answer' : ''}" data-base-index="${baseIndex}" data-choice-value="${value}" data-focusable data-action="option:${baseIndex}" aria-label="目标 ${value}">
        ${enemyArt}
        <span class="enemy-banner">${payload}</span>
      </button>`;
    }).join('');
    return `<div class="plane-battle${ocean ? ' ocean-battle' : ''}">
      <div class="plane-sky-deco deco-one"></div><div class="plane-sky-deco deco-two"></div>
      <div class="plane-target"><span>目标</span><strong>${target}</strong><span>${ocean ? '捕捉它！' : '击落它！'}</span></div>
      <div class="enemy-planes">${planes}</div>
      <div class="player-plane">${ocean ? submarineSvg('player-plane-svg') : planeSvg('player', 'player-plane-svg')}</div>
      <div class="plane-cloud cloud-left"></div><div class="plane-cloud cloud-right"></div>
    </div>`;
  }

  private renderRelation(round: Extract<GameRound, { kind: 'relation' }>): string {
    const operation = round.delta > 0 ? '+' : '−';
    const amount = Math.abs(round.delta);
    const baseStars = Array.from({ length: round.base }, () => iconSvg('star', 'relation-star')).join('');
    const deltaStars = Array.from({ length: amount }, () => iconSvg('star', 'relation-star relation-star-delta')).join('');
    return `<div class="relation-panel">
      <div class="relation-cloud">
        <span class="relation-cloud-label">${round.delta > 0 ? '又飘来' : '被风吹走'}</span>
        <span class="relation-cloud-stars">${baseStars}</span>
        <span class="relation-cloud-stars delta">${deltaStars}</span>
      </div>
      <div class="relation-equation">
        <span class="relation-number">${round.base}</span>
        <span class="relation-op">${operation}</span>
        <span class="relation-number">${amount}</span>
        <span class="relation-op">=</span>
        <span class="relation-question">?</span>
      </div>
      <div class="relation-caption">${round.delta > 0 ? '多一个，就往前数' : '少一个，就往后退'}</div>
    </div>`;
  }

  private renderCountItems(object: string, count: number): string {
    const isFrame = object === 'candy' || count > 5;
    const slots = isFrame ? 10 : count;
    const pieces: string[] = [];
    for (let i = 0; i < slots; i += 1) {
      if (i < count) {
        pieces.push(`<div class="count-item" data-count-index="${i}">${objectSvg(object as never)}<span class="count-badge"></span></div>`);
      } else {
        pieces.push('<div class="count-empty"></div>');
      }
    }
    return `<div class="count-items${isFrame ? ' ten-frame' : ' free-row'} ${object === 'flower' ? 'flower-row' : ''}">${pieces.join('')}</div>`;
  }

  private miniObjects(object: string, count: number): string {
    return `<div class="mini-objects mini-count-${count}">${Array.from({ length: count }, (_, index) => `<span class="mini-object" data-mini-index="${index}">${objectSvg(object as never)}<i></i></span>`).join('')}</div>`;
  }

  private renderComparePanels(round: Extract<GameRound, { kind: 'compare' }>): string {
    if (!this.q) return '';
    return `<div class="compare-area">
      ${(['left', 'right'] as const).map((side, baseIndex) => {
        const count = side === 'left' ? (this.q!.compareLeft ?? round.left) : (this.q!.compareRight ?? round.right);
        const correct = this.q!.correctBaseIndex === baseIndex;
        return `<div class="compare-panel answer-option${this.q!.revealed && correct ? ' is-answer' : ''}" data-base-index="${baseIndex}" data-choice-value="${side}" data-focusable data-action="option:${baseIndex}">
          <div class="compare-cloud">
            <span class="cloud-puff puff-one"></span><span class="cloud-puff puff-two"></span><span class="cloud-puff puff-three"></span>
            ${this.miniObjects(round.object, count)}
          </div>
          <div class="compare-footer"><span class="compare-side">${side === 'left' ? '左边' : '右边'}</span><span class="compare-pick">看这边</span></div>
        </div>`;
      }).join('')}
    </div>`;
  }

  private renderAnswerArea(level: Level, round: GameRound): string {
    if (round.kind === 'compare' || round.kind === 'maze' || round.kind === 'plane' || round.kind === 'coord') return '';
    if (!this.q) return '';
    if (round.kind === 'share') {
      const q = this.q;
      return `<div class="answer-area"><div class="answer-row share-answer-row">${q.visibleIndices.map((baseIndex) => {
        const value = String(q.baseOptions[baseIndex]);
        const [a, b] = value.split('+').map(Number);
        const plates = [a, b].map((count) => `<span class="share-plate">${Array.from({ length: count }, () => objectSvg('donut')).join('')}</span>`).join('');
        return `<button class="choice-card share-choice answer-option${q.revealed && baseIndex === q.correctBaseIndex ? ' is-answer' : ''}" data-base-index="${baseIndex}" data-choice-value="${escapeHtml(value)}" data-focusable data-action="option:${baseIndex}"><span class="choice-tape"></span><span class="share-pair">${plates}</span><span class="share-label">${a} + ${b}</span></button>`;
      }).join('')}</div></div>`;
    }
    const visible = this.q.visibleIndices;
    const cards = visible.map((baseIndex) => {
      const value = this.q!.baseOptions[baseIndex];
      let inner = '';
      if (round.kind === 'count' || round.kind === 'sequence' || round.kind === 'relation' || round.kind === 'odd') {
        inner = `<span class="choice-number">${String(value)}</span>`;
      } else if (round.kind === 'quantity') {
        inner = this.miniObjects(round.object, Number(value));
      } else if (round.kind === 'pattern') {
        inner = `<span class="choice-pattern">${patternIconSvg(String(value))}</span>`;
      } else if (round.kind === 'ordinal') {
        inner = `<span class="choice-animal">${animalHeadSvg(value as never)}</span>`;
      }
      const isAnswer = this.q!.revealed && baseIndex === this.q!.correctBaseIndex;
      return `<button class="choice-card answer-option${isAnswer ? ' is-answer' : ''}" data-base-index="${baseIndex}" data-choice-value="${escapeHtml(String(value))}" data-focusable data-action="option:${baseIndex}">
        <span class="choice-tape"></span>
        ${inner}
      </button>`;
    }).join('');
    return `<div class="answer-area"><div class="answer-row">${cards}</div></div>`;
  }

  private renderMaze(round: Extract<GameRound, { kind: 'maze' }>): string {
    if (!this.q?.maze) return '';
    const maze = this.q.maze;
    const tiles = round.grid.map((value, cell) => {
      const current = maze.cell === cell;
      return `<div class="maze-tile${current ? ' is-current' : ''}" data-cell="${cell}" data-value="${value}">
        <span class="maze-tile-number">${value}</span>
        ${current ? `<span class="maze-fox" id="maze-fox">${animalHeadSvg('fox', 'maze-fox-head')}</span>` : ''}
      </div>`;
    }).join('');
    return `<div class="maze-area">
      <div class="maze-side">
        <div class="maze-target-label">数字小路</div>
        <div class="maze-progress">已走过 <b>${maze.step}</b> 格</div>
        <div class="maze-route-hint">从 1 开始，按顺序走到终点</div>
        <div class="maze-side-hint">走错就回到起点</div>
      </div>
      <div class="maze-board maze-${round.cols}" data-maze-board style="--maze-cols:${round.cols}">${tiles}</div>
      <div class="maze-lighthouse">${iconSvg('star', 'maze-star')}<span>${escapeHtml(round.goalLabel ?? '灯塔')}</span></div>
    </div>`;
  }

  private chooseAnswer(baseIndex: number): void {
    const q = this.q;
    if (!q || q.locked || q.revealed) return;
    const element = this.sceneEl.querySelector<HTMLElement>(`.answer-option[data-base-index="${baseIndex}"]`);
    if (!element) return;
    if (baseIndex === q.correctBaseIndex) {
      this.handleCorrect(element);
    } else {
      this.handleWrong(baseIndex, element);
    }
  }

  private handleCorrect(element: HTMLElement): void {
    const q = this.q;
    if (!q) return;
    q.locked = true;
    this.clearTimers();
    this.focusables.forEach((item) => item.classList.remove('is-focused'));
    this.focusables = [];
    element.classList.add('is-correct');
    if (q.level.rounds[q.roundIndex].kind === 'plane') {
      element.classList.add('is-hit');
      this.sceneEl.querySelector('.player-plane')?.classList.add('is-firing');
    }
    this.audio.playSfx('correct');
    this.showFeedback('correct', '答对啦！');
    this.spawnBurst(element);
    const round = q.level.rounds[q.roundIndex];
    if (round.kind === 'count' || round.kind === 'quantity') {
      const elements = this.countElementsFor(round);
      window.setTimeout(() => {
        if (!this.q || this.q !== q) return;
        this.runCountCelebration(round.target, elements, () => this.advanceQuestionIfCurrent(q));
      }, 180);
    } else {
      this.speak(`praise-${(q.roundIndex % 4) + 1}`, content.voices[`praise-${(q.roundIndex % 4) + 1}`]);
      this.after(2400, () => this.advanceQuestionIfCurrent(q));
    }
  }

  private countElementsFor(round: GameRound): HTMLElement[] {
    if (round.kind === 'count') {
      return Array.from(this.sceneEl.querySelectorAll<HTMLElement>('.count-item'));
    }
    if (round.kind === 'quantity' && this.q) {
      const correct = this.q.correctBaseIndex;
      return Array.from(this.sceneEl.querySelectorAll<HTMLElement>(`.answer-option[data-base-index="${correct}"] .mini-object`));
    }
    return [];
  }

  private runCountCelebration(n: number, elements: HTMLElement[], done: () => void): void {
    elements.forEach((element) => {
      element.classList.remove('is-lit');
      const badge = element.querySelector<HTMLElement>('.count-badge, i');
      if (badge) badge.textContent = '';
    });
    void this.audio.countAlong(n, (value) => {
      const element = elements[value - 1];
      if (!element) return;
      element.classList.add('is-lit');
      const badge = element.querySelector<HTMLElement>('.count-badge, i');
      if (badge) badge.textContent = String(value);
    });
    const total = n * 650 + 1000;
    this.after(total, () => {
      void this.audio.playSummary(n);
      this.after(1600, done);
    });
  }

  private advanceQuestionIfCurrent(q: QuestionRuntime): void {
    if (this.q !== q || q.advanced) return;
    this.advanceQuestion();
  }

  private advanceQuestion(): void {
    const q = this.q;
    if (!q || q.advanced) return;
    q.advanced = true;
    this.clearTimers();
    if (q.roundIndex < 2) {
      this.state.resume = {
        levelId: q.level.id,
        roundIndex: q.roundIndex + 1,
        attempts: 0,
        attemptsUsedHints: 0,
      };
      this.save();
      this.focusIndex = 0;
      this.beginRound(q.level, q.roundIndex + 1, 0, false);
      return;
    }
    const { allComplete } = markLevelComplete(this.state, q.level.id);
    this.save();
    this.showComplete(q.level, allComplete);
  }

  private handleWrong(baseIndex: number, element: HTMLElement): void {
    const q = this.q;
    if (!q || q.locked || q.revealed) return;
    q.attempts += 1;
    this.state.progress.attempts[q.level.id] = (this.state.progress.attempts[q.level.id] ?? 0) + 1;
    this.saveQuestionProgress();
    this.audio.playSfx('wrong');
    element.classList.add('is-wrong');
    this.after(420, () => element.classList.remove('is-wrong'));
    const round = q.level.rounds[q.roundIndex];
    if (round.kind === 'maze') {
      this.resetMaze();
      return;
    }
    // No hints and no answer reveal: keep the target, rebuild the option set,
    // then let the child look again.
    q.locked = true;
    this.showFeedback('hint', '再试一次');
    this.after(620, () => {
      if (this.q !== q) return;
      this.regenerateOptions();
      q.locked = false;
      this.renderQuestion(false);
    });
  }

  private shuffleValues<T>(values: T[]): T[] {
    const copy = values.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  private numericChoices(correct: number, min = 1, max = 10): number[] {
    const pool = new Set<number>([correct]);
    while (pool.size < 3) pool.add(min + Math.floor(Math.random() * (max - min + 1)));
    return this.shuffleValues([...pool]);
  }

  private regenerateOptions(): void {
    const q = this.q;
    if (!q) return;
    const round = q.level.rounds[q.roundIndex];
    let options: Array<number | string> = [];
    let correct: number | string = 0;
    switch (round.kind) {
      case 'count':
      case 'quantity':
        correct = round.target;
        options = this.numericChoices(round.target);
        break;
      case 'sequence':
        correct = round.answer;
        options = this.numericChoices(round.answer);
        break;
      case 'plane':
        correct = round.target;
        options = this.numericChoices(round.target);
        break;
      case 'relation':
        correct = round.answer;
        options = this.numericChoices(round.answer);
        break;
      case 'odd': {
        const items = this.shuffleValues(round.items.slice());
        const counts = new Map<number, number>();
        for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
        const odd = items.find((item) => counts.get(item) === 1) ?? items[0];
        q.baseOptions = items;
        q.correctBaseIndex = items.indexOf(odd);
        q.visibleIndices = items.map((_, index) => index);
        return;
      }
      case 'coord': {
        q.baseOptions = this.shuffleValues(round.items.slice());
        q.correctBaseIndex = (round.targetRow - 1) * round.cols + (round.targetCol - 1);
        q.visibleIndices = q.baseOptions.map((_, index) => index);
        return;
      }
      case 'share': {
        const shareRound = round as Extract<GameRound, { kind: 'share' }>;
        const candidates: string[] = [];
        for (let left = 1; left < shareRound.total; left += 1) {
          const pair: string = `${left}+${shareRound.total - left}`;
          if (pair !== shareRound.answer) candidates.push(pair);
        }
        q.baseOptions = this.shuffleValues([shareRound.answer, ...this.shuffleValues(candidates).slice(0, 2)]);
        q.correctBaseIndex = q.baseOptions.indexOf(shareRound.answer);
        q.visibleIndices = q.baseOptions.map((_, index) => index);
        return;
      }
      case 'pattern': {
        const pool = this.shuffleValues(['star', 'moon', 'sun', 'cloud', 'fish', 'shell', '1', '2', '3', '4', '5', '6'].filter((value) => value !== round.answer));
        options = this.shuffleValues([round.answer, ...pool.slice(0, 2)]);
        correct = round.answer;
        break;
      }
      case 'ordinal': {
        const pool = this.shuffleValues(['squirrel', 'bear', 'owl', 'fox', 'firefly', 'turtle'].filter((value) => value !== round.answer));
        options = this.shuffleValues([round.answer, ...pool.slice(0, 2)]);
        correct = round.answer;
        break;
      }
      case 'compare': {
        let left = 2 + Math.floor(Math.random() * 6);
        let right = 2 + Math.floor(Math.random() * 6);
        while (right === left) right = 2 + Math.floor(Math.random() * 6);
        q.compareLeft = left;
        q.compareRight = right;
        q.baseOptions = ['left', 'right'];
        q.correctBaseIndex = round.ask === 'more'
          ? (left > right ? 0 : 1)
          : (left < right ? 0 : 1);
        q.visibleIndices = [0, 1];
        return;
      }
      case 'maze':
        return;
    }
    q.baseOptions = options;
    q.correctBaseIndex = options.indexOf(correct);
    q.visibleIndices = options.map((_, index) => index);
  }

  private resetMaze(): void {
    const q = this.q;
    if (!q?.maze) return;
    const round = q.level.rounds[q.roundIndex];
    if (round.kind !== 'maze') return;
    q.maze.cell = round.grid.indexOf(1);
    q.maze.step = 1;
    q.maze.wrong += 1;
    this.audio.playSfx('wrong');
    this.showFeedback('hint', '走错了，回到起点');
    this.updateMazeVisuals();
  }

  private saveQuestionProgress(): void {
    const q = this.q;
    if (!q) return;
    this.state.resume = {
      levelId: q.level.id,
      roundIndex: q.roundIndex,
      attempts: q.attempts,
      attemptsUsedHints: q.hintUsed ? 1 : 0,
    };
    this.save();
  }

  private hintVoiceFor(round: GameRound): string {
    switch (round.kind) {
      case 'count': return 'hint-count';
      case 'quantity': return 'hint-quantity';
      case 'sequence': return 'hint-sequence';
      case 'compare': return 'hint-compare';
      case 'pattern': return 'hint-pattern';
      case 'ordinal': return 'hint-ordinal';
      case 'maze': return 'hint-maze';
      case 'odd': return 'hint-count';
      case 'coord': return 'hint-count';
      case 'share': return 'hint-relation';
      case 'plane': return 'hint-plane';
      case 'relation': return 'hint-relation';
    }
  }

  private hintTextFor(round: GameRound): string {
    return content.voices[this.hintVoiceFor(round)];
  }

  private trimWrongOption(selectedBase: number): void {
    const q = this.q;
    if (!q) return;
    const wrong = q.visibleIndices.find((index) => index !== q.correctBaseIndex && index !== selectedBase)
      ?? q.visibleIndices.find((index) => index !== q.correctBaseIndex);
    if (wrong !== undefined) q.visibleIndices = q.visibleIndices.filter((index) => index !== wrong);
  }

  private pulseCountObjects(): void {
    const items = Array.from(this.sceneEl.querySelectorAll<HTMLElement>('.count-item, .mini-object'));
    items.forEach((item, index) => {
      item.style.animationDelay = `${index * 60}ms`;
      item.classList.add('is-pulsing');
    });
    this.after(1200, () => items.forEach((item) => item.classList.remove('is-pulsing')));
  }

  private handleQuestionAction(action: Action): void {
    const q = this.q;
    if (!q) return;
    if (q.locked) {
      if (action === 'confirm') this.advanceQuestion();
      return;
    }
    if (q.revealed) {
      if (action === 'confirm') this.advanceQuestion();
      else if (action === 'back') this.openPause();
      return;
    }
    const round = q.level.rounds[q.roundIndex];
    if (round.kind === 'coord') {
      if (action === 'left' || action === 'right' || action === 'up' || action === 'down') this.moveCoordFocus(action);
      else if (action === 'confirm') this.chooseAnswer(this.focusIndex);
      else if (action === 'back') this.openPause();
      return;
    }
    if (round.kind === 'maze') {
      if (action === 'left' || action === 'right' || action === 'up' || action === 'down') this.moveMaze(action);
      else if (action === 'confirm') this.replayPrompt();
      else if (action === 'back') this.openPause();
      return;
    }
    if (action === 'left') this.moveFocus(-1);
    else if (action === 'right') this.moveFocus(1);
    else if (action === 'up') this.replayPrompt();
    else if (action === 'confirm') this.activateFocused();
    else if (action === 'back') this.openPause();
  }

  private moveMaze(direction: 'left' | 'right' | 'up' | 'down'): void {
    const q = this.q;
    if (!q?.maze) return;
    const round = q.level.rounds[q.roundIndex];
    if (round.kind !== 'maze' || q.maze.done) return;
    const cols = round.cols;
    const row = Math.floor(q.maze.cell / cols);
    const col = q.maze.cell % cols;
    const nextRow = row + (direction === 'up' ? -1 : direction === 'down' ? 1 : 0);
    const nextCol = col + (direction === 'left' ? -1 : direction === 'right' ? 1 : 0);
    if (nextRow < 0 || nextRow >= Math.ceil(round.grid.length / cols) || nextCol < 0 || nextCol >= cols) {
      this.audio.playSfx('locked');
      return;
    }
    const nextCell = nextRow * cols + nextCol;
    const expected = round.path[q.maze.step];
    const value = round.grid[nextCell];
    if (value === expected) {
      q.maze.cell = nextCell;
      q.maze.step += 1;
      this.audio.playSfx('confirm');
      if (q.maze.step >= round.path.length) {
        this.finishMaze(q);
        return;
      }
      this.updateMazeVisuals();
    } else {
      const tile = this.sceneEl.querySelector<HTMLElement>(`.maze-tile[data-cell="${nextCell}"]`);
      if (tile) {
        tile.classList.add('is-wrong');
        this.after(520, () => tile.classList.remove('is-wrong'));
      }
      this.resetMaze();
    }
  }

  private moveCoordFocus(direction: 'left' | 'right' | 'up' | 'down'): void {
    const q = this.q;
    if (!q) return;
    const round = q.level.rounds[q.roundIndex];
    if (round.kind !== 'coord' || !this.focusables.length) return;
    const cols = round.cols;
    const row = Math.floor(this.focusIndex / cols);
    const col = this.focusIndex % cols;
    const nr = row + (direction === 'down' ? 1 : direction === 'up' ? -1 : 0);
    const nc = col + (direction === 'right' ? 1 : direction === 'left' ? -1 : 0);
    if (nr < 0 || nr >= round.rows || nc < 0 || nc >= cols) return;
    this.focusIndex = nr * cols + nc;
    this.applyFocus(false);
  }

  private updateMazeVisuals(): void {
    const q = this.q;
    if (!q?.maze) return;
    const round = q.level.rounds[q.roundIndex];
    if (round.kind !== 'maze') return;
    const board = this.sceneEl.querySelector<HTMLElement>('[data-maze-board]');
    if (!board) return;
    const fox = document.getElementById('maze-fox');
    board.querySelectorAll<HTMLElement>('.maze-tile').forEach((tile) => {
      tile.classList.remove('is-current');
      if (Number(tile.dataset.cell) === q.maze!.cell) {
        tile.classList.add('is-current');
        if (fox) tile.appendChild(fox);
      }
    });
    const progress = this.sceneEl.querySelector<HTMLElement>('.maze-progress b');
    if (progress) progress.textContent = String(q.maze.step);
  }

  private finishMaze(q: QuestionRuntime): void {
    if (!q.maze) return;
    q.maze.done = true;
    q.locked = true;
    this.audio.playSfx('star');
    const round = q.level.rounds[q.roundIndex];
    const goal = round.kind === 'maze' ? (round.goalLabel ?? '灯塔') : '终点';
    this.showFeedback('correct', `到达${goal}啦！`);
    this.screenBurst();
    this.speak(`praise-${(q.roundIndex % 4) + 1}`, content.voices[`praise-${(q.roundIndex % 4) + 1}`]);
    this.after(2000, () => this.advanceQuestionIfCurrent(q));
  }

  private replayPrompt(): void {
    const q = this.q;
    if (!q) return;
    const round = q.level.rounds[q.roundIndex];
    const button = this.sceneEl.querySelector<HTMLElement>('.replay-button');
    if (button) {
      button.classList.add('is-playing');
      this.after(280, () => button.classList.remove('is-playing'));
    }
    this.audio.playSfx('confirm');
    this.speak(promptVoiceId(q.level, q.roundIndex), round.prompt);
  }

  private showFeedback(kind: 'hint' | 'correct', text: string): void {
    const old = this.sceneEl.querySelector('.feedback-toast');
    old?.remove();
    const screen = this.sceneEl.querySelector('.question-screen');
    if (!screen) return;
    const toast = document.createElement('div');
    toast.className = `feedback-toast ${kind === 'correct' ? 'is-correct' : 'is-hint'}`;
    toast.innerHTML = kind === 'correct'
      ? `${iconSvg('check', 'feedback-icon')}<span>${escapeHtml(text)}</span>`
      : `${fireflySvg('feedback-firefly')}<span>${escapeHtml(text)}</span>`;
    screen.appendChild(toast);
    this.after(kind === 'correct' ? 2100 : 3200, () => toast.remove());
  }

  private hintVisualText(round: GameRound): string {
    switch (round.kind) {
      case 'count': return '用小手点着，一朵一朵数';
      case 'quantity': return '先看清数字，再数一数';
      case 'sequence': return '看看前面的数字，再想想';
      case 'compare': return '一个对一个，配一配';
      case 'pattern': return '拍着手，找一找节奏';
      case 'ordinal': return '从小旗这边开始，慢慢数';
      case 'maze': return '走错了，回到起点';
      case 'odd': return '看仔细，有两个是一样的';
      case 'coord': return '看清行和列，再选择'; 
      case 'share': return '两份一样多才公平';
      case 'plane': return '瞄准正确的数字，按 OK 发射';
      case 'relation': return '多一个就往前数，少一个就往后退';
    }
  }

  private spawnBurst(element: HTMLElement): void {
    const world = this.currentLevel()?.world ?? 'forest';
    const burst = document.createElement('div');
    burst.className = 'answer-burst';
    for (let i = 0; i < 8; i += 1) {
      const bit = document.createElement('span');
      bit.className = 'effect-burst-bit';
      bit.style.setProperty('--angle', `${i * 45}deg`);
      bit.style.setProperty('--delay', `${i * 12}ms`);
      const rad = (i * 45 * Math.PI) / 180;
      bit.style.setProperty('--tx', `${Math.round(Math.cos(rad) * 120)}px`);
      bit.style.setProperty('--ty', `${Math.round(Math.sin(rad) * 120)}px`);
      bit.innerHTML = effectSvg(world);
      burst.appendChild(bit);
    }
    element.appendChild(burst);
    this.after(900, () => burst.remove());
  }

  private screenBurst(): void {
    const screen = this.sceneEl.querySelector('.question-screen');
    if (!screen) return;
    const world = this.currentLevel()?.world ?? 'forest';
    const burst = document.createElement('div');
    burst.className = 'screen-burst';
    for (let i = 0; i < 16; i += 1) {
      const bit = document.createElement('span');
      bit.className = 'screen-effect-bit';
      bit.style.setProperty('--x', `${(i * 127) % 1900}px`);
      bit.style.setProperty('--y', `${160 + (i * 67) % 650}px`);
      bit.style.setProperty('--delay', `${(i % 5) * 30}ms`);
      bit.innerHTML = effectSvg(world);
      burst.appendChild(bit);
    }
    screen.appendChild(burst);
    this.after(1300, () => burst.remove());
  }

  private showComplete(level: Level, allComplete: boolean): void {
    this.screen = 'complete';
    this.q = null;
    this.completeLevelId = level.id;
    this.completeAll = allComplete;
    this.audio.setWorld(allComplete ? 'magic' : level.world);
    this.preloadLevelVoices(level);
    this.overlayEl.innerHTML = '';
    const world = getWorld(level.id);
    const nextId = nextLevelId(level.id);
    const starCount = this.state.progress.completed.length;
    const finale = allComplete;
    const chapterDone = this.worldDoneCount(level.world) >= 10;
    const nextLabel = nextId && !allComplete ? '下一关' : '回到地图';
    const nextAction = nextId && !allComplete ? 'next' : 'complete-map';
    this.setScene(`
      ${worldScene(level.world)}
      ${worldEffectLayer(level.world)}
      ${confettiSvg()}
      <div class="complete-screen">
        <div class="complete-rays"></div>
        <div class="star-shower">${Array.from({ length: 14 }, (_, index) => `<span style="--i:${index}">${iconSvg('star', 'shower-star')}</span>`).join('')}</div>
        <div class="complete-panel">
          <div class="complete-eyebrow">${escapeHtml(world.name)} · 第 ${level.number} 关完成</div>
          ${chapterDone && !finale ? '<div class="complete-map-ribbon">地图完成 · 下一座岛亮起来了</div>' : ''}
          <div class="complete-star">${iconSvg('star', 'complete-star-icon')}</div>
          <h1>${finale ? '数字岛全亮啦！' : '你得到了一颗数字星！'}</h1>
          <p>${finale ? `${cnNumber(TOTAL_LEVELS)}颗数字星都亮起来了。数字岛的星光庆典开始啦！` : `数字星 ${starCount} / ${TOTAL_LEVELS} · 下一站在前方等你`}</p>
          <div class="complete-sticker">
            <div class="sticker-ring">${guardianSvg(level.guardian)}</div>
            <span>${escapeHtml(world.guardianName)}的贴纸</span>
          </div>
          <div class="complete-actions">
            <button class="paper-button primary" data-focusable data-action="${nextAction}">
              <span class="button-symbol">${iconSvg('play')}</span>
              <span class="button-copy"><strong>${nextLabel}</strong><small>${nextId && !allComplete ? '继续冒险' : '回到星光航线'}</small></span>
            </button>
            <button class="paper-button secondary" data-focusable data-action="complete-map">
              <span class="button-symbol">${iconSvg('map')}</span>
              <span class="button-copy"><strong>关卡地图</strong><small>看看走过的路</small></span>
            </button>
          </div>
        </div>
      </div>
      ${controlLegend([{ icon: 'left', label: '选择' }, { icon: 'right', label: '选择' }, { icon: 'ok', label: '确定' }, { icon: 'back', label: '回地图' }])}
    `);
    this.setFocusables('[data-focusable]', 0);
    this.audio.playSfx('fanfare');
    if (finale) this.speak('finale', content.voices.finale);
    else this.speak('level-complete-2', content.voices['level-complete-2']);
  }

  private nextLevelAction(): void {
    const current = this.completeLevelId ? getLevel(this.completeLevelId) : this.currentLevel();
    const next = nextLevelId(current.id);
    if (next && !this.completeAll) this.showIntro(getLevel(next));
    else this.showMap(current.world, current.id);
  }


  private showParent(returnTo: 'home' | 'map'): void {
    this.screen = 'parent';
    this.parentReturn = returnTo;
    this.q = null;
    this.audio.setWorld('forest');
    this.audio.stopVoice();
    this.renderParent();
    this.speak('parent', content.voices.parent);
  }

  private parentRows(): Array<{ id: string; label: string; description: string; value: string; kind: 'range' | 'toggle' | 'action'; icon: string }> {
    const s = this.state.settings;
    const breakValue = s.breakMinutes === 0 ? '关闭' : `${s.breakMinutes} 分钟`;
    return [
      { id: 'voice', label: '旁白音量', description: '萤萤说话的声音', value: `${Math.round(s.voiceVolume * 100)}%`, kind: 'range', icon: 'speaker' },
      { id: 'sfx', label: '音效音量', description: '星星、按钮和小提示声', value: `${Math.round(s.sfxVolume * 100)}%`, kind: 'range', icon: 'music' },
      { id: 'music', label: '背景音乐', description: '轻轻的木琴音乐', value: s.musicEnabled ? '开' : '关', kind: 'toggle', icon: 'music' },
      { id: 'break', label: '护眼休息', description: '连续玩一会儿后提醒看看远处', value: breakValue, kind: 'toggle', icon: 'eye' },
      { id: 'motion', label: '减少动态效果', description: '关闭漂浮和大幅动画', value: s.reduceMotion ? '开' : '关', kind: 'toggle', icon: 'eye' },
      { id: 'captions', label: '显示字幕', description: '为旁白显示文字', value: s.captions ? '开' : '关', kind: 'toggle', icon: 'speaker' },
      { id: 'unlock', label: '解锁全部关卡', description: '跳过顺序，自由选择关卡', value: s.unlockAll ? '开' : '关', kind: 'toggle', icon: 'map' },
      { id: 'tutorial', label: '重看操作教学', description: '再带孩子认识一次遥控器', value: '进入', kind: 'action', icon: 'play' },
      { id: 'reset', label: '重置进度', description: '清除关卡和数字星，保留设置', value: '需要确认', kind: 'action', icon: 'reset' },
      { id: 'exit', label: '退出游戏', description: '回到电视桌面', value: '需要确认', kind: 'action', icon: 'exit' },
    ];
  }

  private renderParent(): void {
    const rows = this.parentRows();
    const done = this.state.progress.completed.length;
    const attempts = Object.values(this.state.progress.attempts).reduce((sum, value) => sum + value, 0);
    const hints = Object.values(this.state.progress.hints).reduce((sum, value) => sum + value, 0);
    this.setScene(`
      ${homeScene()}
      <div class="parent-shade"></div>
      <div class="parent-screen">
        <div class="parent-panel">
          <header class="parent-header">
            <div>
              <div class="parent-eyebrow">家长区 · 本应用完全离线</div>
              <h1>家长设置</h1>
            </div>
            <div class="parent-back-hint">按返回键离开</div>
          </header>
          <div class="parent-summary">
            <span>已完成 <b>${done} / ${TOTAL_LEVELS}</b> 关</span>
            <span>数字星 <b>${done}</b> 颗</span>
            <span>尝试 <b>${attempts}</b> 次 · 提示 <b>${hints}</b> 次</span>
          </div>
          <div class="parent-list">
            ${rows.map((row) => `<div class="parent-row" data-focusable data-action="parent:${row.id}" data-parent-id="${row.id}" data-kind="${row.kind}">
              <span class="parent-icon">${iconSvg(row.icon as never, 'parent-row-icon')}</span>
              <span class="parent-label"><b>${escapeHtml(row.label)}</b><small>${escapeHtml(row.description)}</small></span>
              <span class="parent-value">${escapeHtml(row.value)}</span>
            </div>`).join('')}
          </div>
          <footer class="parent-footer">
            <span>无广告 · 无内购 · 无账号 · 不收集儿童信息</span>
            <span>用遥控器上下选择，左右调整</span>
          </footer>
        </div>
      </div>
    `);
    this.setFocusables('.parent-row', 0);
  }

  private handleParentAction(action: Action): void {
    if (action === 'back') {
      this.showParentReturn();
      return;
    }
    if (action === 'up') this.moveFocus(-1);
    else if (action === 'down') this.moveFocus(1);
    else if (action === 'left') this.adjustParent(-1);
    else if (action === 'right') this.adjustParent(1);
    else if (action === 'confirm') {
      const row = this.focusables[this.focusIndex];
      if (row?.dataset.parentId) this.activateParent(row.dataset.parentId);
    }
  }

  private adjustParent(delta: number): void {
    const row = this.focusables[this.focusIndex];
    const id = row?.dataset.parentId;
    if (!id) return;
    const settings = this.state.settings;
    switch (id) {
      case 'voice':
        settings.voiceVolume = round1(clamp01(settings.voiceVolume + delta * 0.1));
        break;
      case 'sfx':
        settings.sfxVolume = round1(clamp01(settings.sfxVolume + delta * 0.1));
        break;
      case 'music':
        if (delta !== 0) settings.musicEnabled = !settings.musicEnabled;
        break;
      case 'break':
        if (delta !== 0) {
          const values = [0, 10, 15, 20];
          const index = Math.max(0, values.indexOf(settings.breakMinutes));
          settings.breakMinutes = values[(index + (delta > 0 ? 1 : values.length - 1)) % values.length];
        }
        break;
      case 'motion':
        if (delta !== 0) settings.reduceMotion = !settings.reduceMotion;
        break;
      case 'captions':
        if (delta !== 0) settings.captions = !settings.captions;
        break;
      case 'unlock':
        if (delta !== 0) settings.unlockAll = !settings.unlockAll;
        break;
      default:
        return;
    }
    this.save();
    this.audio.playSfx('focus');
    this.refreshParentRow(id);
    if (id === 'voice' || id === 'sfx') this.audio.playSfx('focus');
  }

  private activateParent(id: string): void {
    const settings = this.state.settings;
    switch (id) {
      case 'voice':
      case 'sfx':
        this.adjustParent(1);
        break;
      case 'music':
      case 'motion':
      case 'captions':
      case 'unlock':
        this.adjustParent(1);
        break;
      case 'break':
        this.adjustParent(1);
        break;
      case 'tutorial':
        this.showTutorial(this.currentLevel().id, 'map');
        break;
      case 'reset':
        this.openModal({
          title: '要重置进度吗？',
          body: '会清除已完成的关卡和数字星，设置会保留。这个操作不能撤销。',
          options: [
            { label: '先不重置', action: 'cancel', primary: true },
            { label: '重置进度', action: 'reset' },
          ],
          onChoose: (action) => {
            if (action !== 'reset') return;
            resetProgress(this.state);
            this.save();
            this.toast('进度已重置');
            this.showHome();
          },
          onBack: () => this.closeModal(),
        });
        break;
      case 'exit':
        this.openModal({
          title: '要退出游戏吗？',
          body: '下次打开会从上次的地方继续。',
          options: [
            { label: '再玩一会', action: 'cancel', primary: true },
            { label: '退出游戏', action: 'exit' },
          ],
          onChoose: (action) => {
            if (action === 'exit') this.exitApp();
          },
          onBack: () => this.closeModal(),
        });
        break;
    }
  }

  private refreshParentRow(id: string): void {
    const row = this.parentRows().find((item) => item.id === id);
    const element = this.sceneEl.querySelector<HTMLElement>(`[data-parent-id="${id}"] .parent-value`);
    if (row && element) element.textContent = row.value;
    if (id === 'unlock') this.toast(this.state.settings.unlockAll ? '全部关卡已解锁' : '恢复按顺序解锁');
    if (id === 'motion') this.applyMotion();
    if (id === 'captions' && this.state.settings.captions) this.showCaption('字幕已打开。');
  }

  private showParentReturn(): void {
    if (this.parentReturn === 'map') this.showWorlds();
    else this.showHome();
  }

  private exitApp(): void {
    this.audio.stopAll();
    const native = (window as unknown as { NumberIslandNative?: NativeBridge }).NumberIslandNative;
    if (native?.exitApp) native.exitApp();
    else this.toast('浏览器预览：按关闭标签页退出');
  }

  private openPause(): void {
    if (this.modal) return;
    this.audio.stopVoice();
    this.openModal({
      title: '暂停一下',
      body: '点点在等你。按左右选一选，按 OK 继续。',
      options: [
        { label: '继续玩', action: 'resume', primary: true },
        { label: '回地图', action: 'map' },
      ],
      onChoose: (action) => {
        if (action === 'map') {
          if (this.q) this.saveQuestionProgress();
          if (this.q) this.showMap(this.q.level.world, this.q.level.id);
          else this.showWorlds();
        }
      },
      onBack: () => this.closeModal(),
    });
  }

  private openExitConfirm(): void {
    this.openModal({
      title: '要离开数字岛吗？',
      body: '下次打开会从上次的地方继续。',
      options: [
        { label: '再玩一会', action: 'stay', primary: true },
        { label: '离开', action: 'exit' },
      ],
      onChoose: (action) => {
        if (action === 'exit') this.exitApp();
      },
      onBack: () => this.closeModal(),
    });
  }

  private checkBreak(): void {
    if (!this.breakArmed || this.breakShown || this.modal) return;
    if (this.state.settings.breakMinutes <= 0) return;
    if (this.screen !== 'question' && this.screen !== 'intro') return;
    if (Date.now() - this.sessionStart < this.state.settings.breakMinutes * 60000) return;
    this.breakShown = true;
    this.audio.stopVoice();
    this.openModal({
      title: '让眼睛休息一下',
      body: '眨眨眼，看看远处，喝一小口水。休息好了再按 OK。',
      illustration: iconSvg('eye', 'break-eye'),
      options: [{ label: '我休息好啦', action: 'resume', primary: true }],
      onChoose: () => {
        this.sessionStart = Date.now();
        this.breakShown = false;
        if (this.screen === 'question') this.after(400, () => this.replayPrompt());
      },
      onBack: () => this.closeModal(),
    });
    this.speak('break', content.voices.break);
  }

  private openModal(config: ModalConfig): void {
    this.modal = config;
    this.modalFocusIndex = 0;
    this.overlayEl.innerHTML = `<div class="modal-backdrop">
      <div class="modal-card" role="dialog" aria-modal="true">
        ${config.illustration ? `<div class="modal-illustration">${config.illustration}</div>` : `<div class="modal-mark">${iconSvg('star', 'modal-mark-icon')}</div>`}
        <h2>${escapeHtml(config.title)}</h2>
        ${config.body ? `<p>${escapeHtml(config.body)}</p>` : ''}
        <div class="modal-actions">
          ${config.options.map((option, index) => `<button class="modal-button${option.primary ? ' primary' : ''}" data-modal-index="${index}" data-focusable>${escapeHtml(option.label)}</button>`).join('')}
        </div>
        <div class="modal-key-hint">左右选择 · OK 确定</div>
      </div>
    </div>`;
    this.modalFocusables = Array.from(this.overlayEl.querySelectorAll<HTMLElement>('[data-focusable]'));
    this.applyModalFocus();
  }

  private applyModalFocus(): void {
    this.modalFocusables.forEach((element) => element.classList.remove('is-focused'));
    const element = this.modalFocusables[this.modalFocusIndex];
    if (element) element.classList.add('is-focused');
  }

  private handleModalAction(action: Action): void {
    if (!this.modal) return;
    if (action === 'left' || action === 'up') {
      if (this.modalFocusables.length > 1) {
        this.modalFocusIndex = Math.max(0, this.modalFocusIndex - 1);
        this.applyModalFocus();
        this.audio.playSfx('focus');
      }
    } else if (action === 'right' || action === 'down') {
      if (this.modalFocusables.length > 1) {
        this.modalFocusIndex = Math.min(this.modalFocusables.length - 1, this.modalFocusIndex + 1);
        this.applyModalFocus();
        this.audio.playSfx('focus');
      }
    } else if (action === 'confirm') {
      this.chooseModal(this.modalFocusIndex);
    } else if (action === 'back') {
      if (this.modal.onBack) this.modal.onBack();
      else this.closeModal();
    }
  }

  private chooseModal(index: number): void {
    const modal = this.modal;
    if (!modal) return;
    const option = modal.options[index];
    if (!option) return;
    this.closeModal();
    modal.onChoose(option.action);
  }

  private closeModal(): void {
    this.modal = null;
    this.modalFocusables = [];
    this.overlayEl.innerHTML = '';
    if (this.focusables.length) this.applyFocus(true);
  }

}

const game = new Game();
game.boot();

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

