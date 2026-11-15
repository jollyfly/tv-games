import { iconSvg } from './art';
import { C } from './art/core';

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] ?? char));
}

export function keycap(icon: 'left' | 'right' | 'up' | 'down' | 'ok' | 'back', label: string, compact = false): string {
  const inner = icon === 'ok'
    ? `<span class="keycap-text">OK</span>`
    : icon === 'back'
      ? `<span class="keycap-text">↩</span>`
      : iconSvg(icon, 'keycap-icon');
  return `<span class="keycap-group${compact ? ' compact' : ''}"><span class="keycap">${inner}</span><span class="keycap-label">${escapeHtml(label)}</span></span>`;
}

export function controlLegend(items: Array<{ icon: 'left' | 'right' | 'up' | 'down' | 'ok' | 'back'; label: string }>): string {
  return `<div class="control-legend">${items.map((item) => keycap(item.icon, item.label)).join('')}</div>`;
}

export function progressPips(current: number): string {
  return `<div class="progress-pips" aria-label="第 ${current + 1} 题，共 3 题">${[0, 1, 2]
    .map((index) => `<span class="progress-pip${index < current ? ' is-done' : ''}${index === current ? ' is-current' : ''}"></span>`)
    .join('')}</div>`;
}

export function starCounter(count: number, total: number): string {
  return `<div class="star-counter">${iconSvg('star', 'counter-star')}<span><b>${count}</b> / ${total}</span></div>`;
}

export function brandMark(size = 52): string {
  return `<svg class="brand-mark" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <circle cx="32" cy="32" r="29" fill="${C.sun}" stroke="${C.ink}" stroke-width="4"/>
    <path d="M17 38 C21 22 43 17 49 30 C53 39 44 49 30 47 C21 46 16 42 17 38 Z" fill="${C.leaf}" stroke="${C.ink}" stroke-width="3"/>
    <path d="M24 37 C28 31 33 28 39 28" fill="none" stroke="${C.cream}" stroke-width="4" stroke-linecap="round"/>
    <path d="M30 46 L34 56" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}

export function toastElement(message: string): string {
  return `<div class="toast-bubble">${escapeHtml(message)}</div>`;
}

export function levelBadge(worldName: string, number: number, title: string, color: string): string {
  return `<div class="level-badge" style="--badge-accent:${color}">
    <span class="level-badge-dot"></span>
    <span>${escapeHtml(worldName)} · 第 ${number} 关</span>
    <b>${escapeHtml(title)}</b>
  </div>`;
}
