import { content } from './content';
import type { Settings, WorldId } from './types';

type AudioBridge = { setAudioFocus?: (active: boolean) => void };

function nativeBridge(): AudioBridge | null {
  return (window as unknown as { NumberIslandNative?: AudioBridge }).NumberIslandNative ?? null;
}

const baseUrl = import.meta.env.BASE_URL || './';
const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

type SfxName = 'focus' | 'confirm' | 'correct' | 'wrong' | 'star' | 'locked' | 'swish' | 'fanfare' | 'sparkle';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private voice: HTMLAudioElement | null = null;
  private musicSource: AudioBufferSourceNode | null = null;
  private musicBuffers = new Map<WorldId, AudioBuffer>();
  private musicWorld: WorldId = 'forest';
  private preloaded = new Set<string>();
  private audioCache = new Map<string, HTMLAudioElement>();
  private settings: Settings;
  private unlocked = false;
  private voiceToken = 0;
  private speakFallback = false;

  constructor(settings: Settings) {
    this.settings = { ...settings };
  }

  updateSettings(settings: Settings): void {
    const musicWasOn = this.settings.musicEnabled;
    this.settings = { ...settings };
    if (this.ctx) {
      const now = this.ctx.currentTime;
      this.sfxGain?.gain.setTargetAtTime(settings.sfxVolume * 0.5, now, 0.03);
      this.musicGain?.gain.setTargetAtTime(settings.musicEnabled ? 0.16 : 0, now, 0.08);
    }
    if (!settings.musicEnabled && musicWasOn) this.stopMusic();
    if (settings.musicEnabled && musicWasOn && this.unlocked) this.startMusic();
  }

  unlock(): void {
    if (this.unlocked) {
      if (this.ctx?.state === 'suspended') void this.ctx.resume();
      if (this.settings.musicEnabled && !this.musicSource) this.startMusic();
      return;
    }
    this.unlocked = true;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctx) {
        this.ctx = new Ctx();
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = this.settings.musicEnabled ? 0.15 : 0;
        this.musicGain.connect(this.ctx.destination);
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.settings.sfxVolume * 0.5;
        this.sfxGain.connect(this.ctx.destination);
        this.startMusic();
      }
    } catch (error) {
      console.warn('AudioContext unavailable', error);
    }
    nativeBridge()?.setAudioFocus?.(true);
  }

  setWorld(world: WorldId): void {
    if (this.musicWorld === world) return;
    this.musicWorld = world;
    if (this.musicSource) {
      this.startMusic();
    }
  }

  stopVoice(): void {
    this.voiceToken += 1;
    if (this.voice) {
      this.voice.pause();
      this.voice.currentTime = 0;
    }
    window.speechSynthesis?.cancel();
  }

  stopAll(): void {
    this.stopVoice();
    this.stopMusic();
  }

  preload(ids: string[]): void {
    for (const id of ids) {
      if (this.preloaded.has(id)) continue;
      this.preloaded.add(id);
      const audio = this.audioFor(id);
      try {
        audio.load();
      } catch {
        // ignore; playback will retry
      }
    }
  }

  async playVoice(id: string, captionText?: string): Promise<void> {
    if (!this.unlocked) this.unlock();
    this.voiceToken += 1;
    const token = this.voiceToken;
    if (this.voice) {
      this.voice.pause();
      this.voice.currentTime = 0;
    }
    this.duckMusic(true);
    if (this.settings.voiceVolume <= 0) {
      this.duckMusic(false);
      return;
    }
    const audio = this.audioFor(id);
    audio.volume = this.settings.voiceVolume;
    this.voice = audio;
    try {
      await audio.play();
      await new Promise<void>((resolve) => {
        const done = (): void => {
          audio.removeEventListener('ended', done);
          audio.removeEventListener('error', done);
          resolve();
        };
        audio.addEventListener('ended', done, { once: true });
        audio.addEventListener('error', done, { once: true });
        window.setTimeout(done, 15000);
      });
    } catch (error) {
      if (token === this.voiceToken) this.fallbackSpeech(captionText);
    } finally {
      if (token === this.voiceToken) this.duckMusic(false);
    }
  }

  async playNumber(n: number): Promise<void> {
    await this.playVoice(`count-${n}`, String(n));
  }

  /** Plays count words with a beat between each one. */
  async countAlong(n: number, onNumber: (value: number) => void): Promise<void> {
    for (let value = 1; value <= n; value += 1) {
      onNumber(value);
      void this.playNumber(value);
      await sleep(value === n ? 760 : 650);
    }
  }

  async playSummary(n: number): Promise<void> {
    await this.playVoice(`summary-${n}`, `一共有 ${n} 个，数得真仔细！`);
  }

  playSfx(name: SfxName): void {
    if (!this.unlocked) this.unlock();
    const ctx = this.ctx;
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;
    const volume = this.settings.sfxVolume;
    if (volume <= 0) return;

    const tone = (
      freq: number,
      start: number,
      duration: number,
      type: OscillatorType,
      gainValue: number,
      endFreq?: number,
    ): void => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + start);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, now + start + duration);
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(gainValue * volume, now + start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
      osc.connect(gain);
      gain.connect(this.sfxGain as GainNode);
      osc.start(now + start);
      osc.stop(now + start + duration + 0.03);
    };

    const sparkle = (start: number, high = 1): void => {
      const notes = high > 0 ? [2093, 2637, 3136] : [1568, 2093, 2637];
      notes.forEach((freq, index) => {
        tone(freq, start + index * 0.055, 0.24 + index * 0.04, 'sine', 0.035 / (index + 1));
        tone(freq * 2.005, start + index * 0.055 + 0.012, 0.16, 'sine', 0.012);
      });
    };

    const noise = (start: number, duration: number, gainValue: number, highpass: number): void => {
      const samples = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, samples, ctx.sampleRate);
      const channel = buffer.getChannelData(0);
      let seed = 0x9e3779b9;
      let previous = 0;
      for (let i = 0; i < samples; i += 1) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const white = (seed / 0xffffffff) * 2 - 1;
        const filtered = white - previous * 0.92;
        previous = white;
        const env = Math.sin(Math.PI * Math.min(1, i / samples)) ** 1.3;
        channel[i] = filtered * env * (i / samples > 0.85 ? 0 : 1);
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = highpass;
      const gain = ctx.createGain();
      gain.gain.value = gainValue * volume;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain as GainNode);
      source.start(now + start);
    };

    switch (name) {
      case 'focus':
        tone(740, 0, 0.08, 'sine', 0.11);
        break;
      case 'confirm':
        tone(560, 0, 0.11, 'triangle', 0.12);
        tone(840, 0.07, 0.14, 'sine', 0.08);
        break;
      case 'correct':
        // A bright rising run plus a shimmer: a small reward, not a loud jingle.
        [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, index) => {
          tone(freq, index * 0.072, 0.26 + index * 0.035, 'triangle', 0.105 - index * 0.009);
          tone(freq * 2.005, index * 0.072 + 0.008, 0.2, 'sine', 0.018);
        });
        tone(1046.5, 0.31, 0.42, 'sine', 0.07, 2093);
        sparkle(0.36);
        noise(0.16, 0.32, 0.022, 2600);
        break;
      case 'wrong':
        tone(220, 0, 0.12, 'triangle', 0.1);
        tone(164, 0.07, 0.16, 'sine', 0.08);
        break;
      case 'star':
        sparkle(0);
        tone(1046.5, 0.02, 0.2, 'sine', 0.08);
        tone(1318.5, 0.1, 0.25, 'sine', 0.07);
        break;
      case 'sparkle':
        sparkle(0);
        noise(0.02, 0.3, 0.018, 3400);
        break;
      case 'fanfare':
        // Level-complete fanfare: a quick three-chord lift and a little confetti hiss.
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
          tone(freq, index * 0.11, 0.36, 'triangle', 0.075);
        });
        [1046.5, 1318.51, 1567.98, 2093].forEach((freq, index) => {
          tone(freq, 0.46 + index * 0.055, 0.55, 'sine', 0.045);
        });
        sparkle(0.55);
        noise(0.44, 0.55, 0.025, 2100);
        break;
      case 'locked':
        tone(260, 0, 0.13, 'sine', 0.08);
        tone(210, 0.12, 0.18, 'sine', 0.07);
        break;
      case 'swish':
        tone(300, 0, 0.16, 'sine', 0.04);
        noise(0, 0.22, 0.02, 1200);
        break;
    }
  }

  private audioFor(id: string): HTMLAudioElement {
    const cached = this.audioCache.get(id);
    if (cached) return cached;
    const audio = new Audio(`${baseUrl}audio-v4/${id}.m4a`);
    audio.dataset.id = id;
    audio.preload = 'auto';
    this.audioCache.set(id, audio);
    return audio;
  }

  private fallbackSpeech(text?: string): void {
    if (!text || !('speechSynthesis' in window)) return;
    if (this.speakFallback) return;
    this.speakFallback = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.86;
    utterance.pitch = 1.05;
    utterance.onend = () => {
      this.speakFallback = false;
    };
    window.speechSynthesis.speak(utterance);
  }

  private duckMusic(duck: boolean): void {
    if (!this.ctx || !this.musicGain || !this.settings.musicEnabled) return;
    this.musicGain.gain.setTargetAtTime(duck ? 0.035 : 0.15, this.ctx.currentTime, 0.08);
  }

  private startMusic(): void {
    if (!this.ctx || !this.musicGain || !this.settings.musicEnabled) return;
    this.stopMusicSource();
    const buffer = this.getMusicBuffer(this.musicWorld);
    if (!buffer) return;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.musicGain);
    source.start();
    this.musicSource = source;
  }

  stopMusic(): void {
    this.stopMusicSource();
  }

  private stopMusicSource(): void {
    if (this.musicSource) {
      try {
        this.musicSource.stop();
      } catch {
        // already stopped
      }
      this.musicSource.disconnect();
      this.musicSource = null;
    }
  }

  private getMusicBuffer(world: WorldId): AudioBuffer | null {
    if (!this.ctx) return null;
    const cached = this.musicBuffers.get(world);
    if (cached) return cached;
    const buffer = this.buildMusic(world);
    if (buffer) this.musicBuffers.set(world, buffer);
    return buffer;
  }

  /**
   * An original bouncy platformer loop: rising bass, off-beat chords, mallet
   * lead, kick/snare and shaker. No existing game melody is copied.
   */
  private buildMusic(world: WorldId): AudioBuffer | null {
    const ctx = this.ctx;
    if (!ctx) return null;
    const sampleRate = ctx.sampleRate;
    const bpm = world === 'castle' ? 124 : 132;
    const beat = 60 / bpm;
    const bars = 8;
    const duration = beat * 4 * bars;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    const midiFreq = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);
    const roots: Record<WorldId, number> = { forest: 60, candy: 65, castle: 62, sky: 69, ocean: 64, dino: 57, space: 71, music: 66, donut: 62, magic: 61 };
    const tonic = roots[world];
    // I – V – vi – IV – I – V – IV – V. Bouncy island-pop progression.
    const progression = [0, 7, 9, 5, 0, 7, 5, 7];
    const melodyMotif = [0, 7, 4, 7, 0, 4, 7, 12];
    const seedStart = 0x13579bdf;

    const addSample = (at: number, value: number): void => {
      const index = ((Math.floor(at * sampleRate) % length) + length) % length;
      data[index] += value;
    };

    const addTone = (
      start: number,
      midi: number,
      dur: number,
      amp: number,
      timbre: 'mallet' | 'uke' | 'bass' | 'bell',
    ): void => {
      const freq = midiFreq(midi);
      const startSample = Math.floor(start * sampleRate);
      const noteSamples = Math.floor(dur * sampleRate);
      const decay = timbre === 'bass' ? 2.8 : timbre === 'uke' ? 6.5 : 4.6;
      for (let i = 0; i < noteSamples; i += 1) {
        const t = i / sampleRate;
        const attack = Math.min(1, t / 0.008);
        const env = attack * Math.exp(-t * decay);
        if (env < 0.0001) break;
        const phase = 2 * Math.PI * freq * t;
        let wave = 0;
        if (timbre === 'mallet') wave = Math.sin(phase) + 0.3 * Math.sin(phase * 2) + 0.07 * Math.sin(phase * 3);
        else if (timbre === 'uke') wave = Math.sin(phase) + 0.18 * Math.sin(phase * 2) + 0.08 * Math.sin(phase * 4);
        else if (timbre === 'bass') wave = Math.sin(phase) + 0.16 * Math.sin(phase * 2);
        else wave = Math.sin(phase) + 0.45 * Math.sin(phase * 2.01) + 0.14 * Math.sin(phase * 3.99);
        const index = startSample + i;
        const wrapped = ((index % length) + length) % length;
        data[wrapped] += wave * env * amp;
      }
    };

    const addKick = (start: number, amp: number): void => {
      const noteSamples = Math.floor(0.13 * sampleRate);
      for (let i = 0; i < noteSamples; i += 1) {
        const t = i / sampleRate;
        const env = Math.exp(-t * 34);
        const freq = 92 - 46 * Math.min(1, t / 0.1);
        const value = Math.sin(2 * Math.PI * freq * t) * env * amp;
        addSample(start + t, value);
      }
    };

    const addNoise = (start: number, dur: number, amp: number, highpass: number): void => {
      const noteSamples = Math.floor(dur * sampleRate);
      let seed = seedStart;
      for (let i = 0; i < noteSamples; i += 1) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const white = (seed / 0xffffffff) * 2 - 1;
        const t = i / sampleRate;
        const env = Math.sin(Math.PI * Math.min(1, i / noteSamples)) ** 1.4;
        // Cheap high-pass shaping for shaker/clap air.
        const shaped = white * env * amp;
        addSample(start + t, shaped * (highpass > 2000 ? 1 : 0.5));
      }
    };

    for (let bar = 0; bar < bars; bar += 1) {
      const barStart = bar * 4 * beat;
      const chordRoot = tonic + progression[bar];
      const isMinor = progression[bar] === 9;
      const third = isMinor ? 3 : 4;
      const chord = [0, third, 7, 12];
      const intensity = world === 'castle' ? 0.88 : world === 'candy' ? 1.05 : 1;

      // Bouncy low end: every quarter, with a fifth lift on beat 3.
      for (let quarter = 0; quarter < 4; quarter += 1) {
        const lift = quarter === 2 ? 7 : quarter === 3 ? 5 : 0;
        addTone(barStart + quarter * beat, chordRoot - 12 + lift, beat * 0.42, 0.052 * intensity, 'bass');
      }
      // Off-beat ukulele chord stabs, the "jump" feel.
      for (const strumBeat of [0.5, 1.5, 2.5, 3.5]) {
        chord.forEach((interval, index) => {
          addTone(barStart + strumBeat * beat + index * 0.012, chordRoot + 12 + interval, beat * 0.26, 0.014 * intensity, 'uke');
        });
      }

      // Mallet melody, with one gentle syncopation.
      melodyMotif.forEach((interval, step) => {
        if (step === 7) return;
        const start = barStart + step * (beat / 2);
        const octave = step === 5 ? 12 : 0;
        const toneInterval = interval === 4 ? third : interval;
        addTone(start, chordRoot + 12 + (toneInterval === 12 ? 12 : toneInterval) + octave, beat * 0.4, 0.055 * intensity, 'mallet');
      });
      if (bar % 2 === 1) {
        addTone(barStart + 3.5 * beat, chordRoot + 24, beat * 0.6, 0.025 * intensity, 'bell');
      }

      // Kick on 1/3, snare on 2/4, shaker on every eighth.
      addKick(barStart, 0.09 * intensity);
      addKick(barStart + 2 * beat, 0.075 * intensity);
      addNoise(barStart + beat, 0.09, 0.038 * intensity, 2400);
      addNoise(barStart + 3 * beat, 0.09, 0.034 * intensity, 2400);
      for (let eighth = 0; eighth < 8; eighth += 1) {
        addNoise(barStart + eighth * (beat / 2) + beat / 4, 0.033, eighth % 2 === 0 ? 0.012 : 0.007, 4200);
      }
      if (bar % 4 === 3) addNoise(barStart + 3.55 * beat, 0.12, 0.028 * intensity, 1800);
    }

    // Normalize with a little headroom and a soft ceiling.
    let peak = 0;
    for (let i = 0; i < length; i += 1) peak = Math.max(peak, Math.abs(data[i]));
    if (peak > 0) {
      const gain = 0.36 / peak;
      for (let i = 0; i < length; i += 1) {
        data[i] = Math.tanh(data[i] * gain * 1.15) * 0.9;
      }
    }
    return buffer;
  }
}

export function createAudio(settings: Settings): AudioEngine {
  return new AudioEngine(settings);
}

export const VOICE_TEXT = content.voices;
