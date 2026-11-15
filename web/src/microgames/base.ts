import type { Level } from '../types';

export type MicroAction = 'left' | 'right' | 'up' | 'down' | 'confirm' | 'release';
export type MicroControlIcon = 'left' | 'right' | 'up' | 'down' | 'back' | 'ok';

export interface MicroControl {
  icon: MicroControlIcon;
  label: string;
}

export interface MicroResult {
  redraw?: boolean;
  done?: boolean;
  toast?: string;
}

export interface MicroHost {
  redraw: () => void;
  complete: () => void;
  toast: (message: string) => void;
}

export interface MicroGameInfo {
  key: string;
  name: string;
  verb: string;
  controls: MicroControl[];
}

export abstract class Microgame<TInfo extends MicroGameInfo = MicroGameInfo> {
  protected level: Level;
  protected host: MicroHost;
  protected cursor = 0;
  protected toastText = '';
  protected finished = false;

  constructor(level: Level, host: MicroHost) {
    this.level = level;
    this.host = host;
  }

  abstract get info(): TInfo;
  abstract render(): string;
  abstract handle(action: MicroAction): MicroResult;

  get levelId(): string { return this.level.id; }
  get levelNumber(): number { return this.level.number; }
  get worldId() { return this.level.world; }

  dispose(): void {}

  protected complete(): MicroResult {
    if (this.finished) return {};
    this.finished = true;
    this.host.complete();
    return { done: true };
  }

  protected focusClass(index: number): string {
    return index === this.cursor ? ' is-focused' : '';
  }
}
