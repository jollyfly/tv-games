import type { WorldId } from '../types';
import { C, svg } from './core';

const worldEffect: Record<WorldId, (className: string) => string> = {
  forest: (className) => svg('0 0 48 48', `
    <path d="M8 40 C6 22 20 8 42 10 C42 30 28 44 8 40 Z" fill="#79B85A" stroke="${C.ink}" stroke-width="2.5"/>
    <path d="M12 36 C20 28 28 20 36 15" fill="none" stroke="#4D8A43" stroke-width="2" stroke-linecap="round"/>
  `, className),
  candy: (className) => svg('0 0 48 48', `
    <path d="M6 18 C10 12 18 14 20 20 L20 30 C18 36 10 38 6 32 Z" fill="${C.coral}" stroke="${C.ink}" stroke-width="2.2"/>
    <path d="M42 18 C38 12 30 14 28 20 L28 30 C30 36 38 38 42 32 Z" fill="${C.coral}" stroke="${C.ink}" stroke-width="2.2"/>
    <rect x="18" y="18" width="12" height="14" rx="3" fill="${C.sun}" stroke="${C.ink}" stroke-width="2"/>
  `, className),
  castle: (className) => svg('0 0 48 48', `
    <path d="M24 5 L29 18 L43 19 L32 28 L36 42 L24 34 L12 42 L16 28 L5 19 L19 18 Z" fill="${C.sun}" stroke="${C.ink}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M24 14 L27 22 L35 23 L29 28 L31 36 L24 31 L17 36 L19 28 L13 23 L21 22 Z" fill="#FFF3B0"/>
  `, className),
  sky: (className) => svg('0 0 48 48', `
    <path d="M13 36 C3 36 0 26 8 22 C6 12 20 7 26 16 C33 8 44 14 42 24 C48 28 43 36 36 36 Z" fill="${C.paper}" stroke="${C.ink}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M15 24 C19 19 25 18 31 21" fill="none" stroke="${C.sky}" stroke-width="2.5" stroke-linecap="round"/>
  `, className),
  ocean: (className) => svg('0 0 48 48', `
    <circle cx="24" cy="25" r="16" fill="rgba(234,247,255,.45)" stroke="${C.paper}" stroke-width="2.5"/>
    <path d="M13 19 C17 11 25 9 31 12" fill="none" stroke="${C.paper}" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="18" cy="31" r="2.5" fill="${C.paper}" opacity="0.8"/>
    <circle cx="30" cy="33" r="4" fill="none" stroke="${C.teal}" stroke-width="2"/>
  `, className),
  dino: (className) => svg('0 0 48 48', `
    <path d="M8 38 C14 30 16 20 24 10 C32 22 34 31 40 38 C30 36 18 36 8 38 Z" fill="${C.sunDeep}" stroke="${C.ink}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M14 32 C19 25 22 20 24 15 C27 21 29 26 34 32" fill="none" stroke="${C.cream}" stroke-width="2" opacity="0.75"/>
    <circle cx="20" cy="27" r="2" fill="${C.ink}" opacity="0.5"/><circle cx="31" cy="25" r="1.5" fill="${C.ink}" opacity="0.5"/>
  `, className),
  space: (className) => svg('0 0 48 48', `
    <circle cx="24" cy="24" r="11" fill="${C.teal}" stroke="${C.ink}" stroke-width="2.5"/>
    <ellipse cx="24" cy="24" rx="20" ry="6" transform="rotate(-20 24 24)" fill="none" stroke="${C.sun}" stroke-width="3"/>
    <circle cx="37" cy="12" r="3" fill="${C.paper}" stroke="${C.ink}" stroke-width="1.5"/>
  `, className),
  music: (className) => svg('0 0 48 48', `
    <path d="M18 12 L38 8 V33" fill="none" stroke="${C.ink}" stroke-width="3"/>
    <path d="M18 12 V38" fill="none" stroke="${C.ink}" stroke-width="3"/>
    <ellipse cx="12" cy="39" rx="8" ry="5" fill="${C.coral}" stroke="${C.ink}" stroke-width="2"/>
    <ellipse cx="32" cy="35" rx="8" ry="5" fill="${C.coral}" stroke="${C.ink}" stroke-width="2"/>
  `, className),
  donut: (className) => svg('0 0 48 48', `
    <circle cx="24" cy="25" r="17" fill="${C.sunDeep}" stroke="${C.ink}" stroke-width="2.5"/>
    <circle cx="24" cy="25" r="6" fill="${C.cream}" stroke="${C.ink}" stroke-width="2"/>
    <path d="M9 22 C12 10 27 7 37 15 C41 19 42 24 40 28 C32 18 20 17 12 28 Z" fill="${C.rose}" stroke="${C.ink}" stroke-width="2"/>
    <g fill="${C.paper}"><rect x="18" y="10" width="2.5" height="6" rx="1" transform="rotate(-30 19 13)"/><rect x="32" y="20" width="2.5" height="6" rx="1" transform="rotate(60 33 23)"/></g>
  `, className),
  magic: (className) => svg('0 0 48 48', `
    <path d="M24 5 L34 20 L44 24 L34 28 L24 43 L14 28 L4 24 L14 20 Z" fill="${C.sun}" stroke="${C.ink}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M24 13 L29 22 L38 24 L29 27 L24 35 L19 27 L10 24 L19 22 Z" fill="#FFF3B0"/>
    <circle cx="24" cy="24" r="3" fill="${C.grape}" stroke="${C.ink}" stroke-width="1.5"/>
  `, className),
};

export function effectSvg(world: WorldId, className = 'effect-bit'): string {
  return worldEffect[world](className);
}

export function worldEffectLayer(world: WorldId): string {
  const spots = [
    [6, 18], [17, 68], [28, 12], [39, 58], [50, 24],
    [61, 72], [72, 16], [83, 62], [91, 30], [12, 84], [88, 84], [55, 88],
  ];
  return `<div class="world-effect-layer" aria-hidden="true">
    ${spots.map(([x, y], i) => `<span class="world-effect-bit" style="left:${x}%;top:${y}%;--d:${(i % 6) * 0.22}s;--s:${0.8 + (i % 3) * 0.15}">${effectSvg(world)}</span>`).join('')}
  </div>`;
}
