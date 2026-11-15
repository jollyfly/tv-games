export const C = {
  ink: '#23313F',
  cream: '#FFF6E6',
  paper: '#FFFDF7',
  sky: '#C7EEF2',
  sea: '#8ECFC9',
  teal: '#2A9D8F',
  tealDark: '#1E776D',
  coral: '#F27059',
  coralDark: '#C95542',
  sun: '#FFC94A',
  sunDeep: '#E39A25',
  leaf: '#79B85A',
  leafDark: '#4D8A43',
  green: '#6FB358',
  grass: '#94CF72',
  grape: '#8E7CC3',
  grapeDark: '#6E5CA6',
  navy: '#243B53',
  brown: '#8B5E3C',
  brownLight: '#B9875B',
  rose: '#F6C7B9',
  pink: '#FBD8C9',
  white: '#FFFFFF',
  orange: '#E88755',
  amber: '#D97345',
  creamDeep: '#F4E4C9',
};

export function esc(value: string): string {
  return value.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char] ?? char));
}

export function svg(viewBox: string, content: string, className = '', width?: number, height?: number): string {
  const size = width && height ? ` width="${width}" height="${height}"` : '';
  return `<svg class="${className}" viewBox="${viewBox}"${size} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${content}</svg>`;
}

export function sceneDefs(prefix: string, skyTop = '#C7EEF2', skyBottom = '#FFF2D8', skyMid = '#E9F6E7'): string {
  return `
    <defs>
      <linearGradient id="${prefix}-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${skyTop}"/>
        <stop offset="0.64" stop-color="${skyMid}"/>
        <stop offset="1" stop-color="${skyBottom}"/>
      </linearGradient>
      <linearGradient id="${prefix}-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#B7E4E1"/>
        <stop offset="1" stop-color="#84C9C5"/>
      </linearGradient>
      <linearGradient id="${prefix}-grass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${C.grass}"/>
        <stop offset="1" stop-color="${C.green}"/>
      </linearGradient>
      <linearGradient id="${prefix}-paper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${C.paper}"/>
        <stop offset="1" stop-color="${C.cream}"/>
      </linearGradient>
      <pattern id="${prefix}-grain" width="36" height="36" patternUnits="userSpaceOnUse">
        <circle cx="5" cy="8" r="1.4" fill="${C.ink}" opacity="0.045"/>
        <circle cx="23" cy="25" r="1" fill="${C.ink}" opacity="0.04"/>
        <path d="M12 30 q5 -4 10 0" fill="none" stroke="${C.ink}" stroke-width="1" opacity="0.035"/>
        <path d="M28 7 l4 0" stroke="${C.ink}" stroke-width="1" opacity="0.035"/>
      </pattern>
      <pattern id="${prefix}-waves" width="70" height="42" patternUnits="userSpaceOnUse">
        <path d="M6 24 q10 -9 20 0 t20 0" fill="none" stroke="${C.paper}" stroke-width="2.4" stroke-linecap="round" opacity="0.28"/>
        <circle cx="60" cy="12" r="2" fill="${C.paper}" opacity="0.25"/>
      </pattern>
    </defs>`;
}

export function sceneSvg(prefix: string, inner: string, skyTop?: string, skyBottom?: string, skyMid?: string): string {
  return `<svg class="scene-svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    ${sceneDefs(prefix, skyTop, skyBottom, skyMid)}
    <rect width="1920" height="1080" fill="url(#${prefix}-sky)"/>
    ${inner}
    <rect width="1920" height="1080" fill="url(#${prefix}-grain)" opacity="0.7"/>
  </svg>`;
}

export function cloud(x: number, y: number, scale = 1): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M14 74 C-2 49 13 18 47 16 C56 -12 104 -16 121 10 C151 -5 186 16 185 49 C213 52 222 82 201 96 L33 96 C19 94 12 86 14 74 Z" fill="${C.paper}" stroke="${C.ink}" stroke-width="4" opacity="0.96"/>
    <path d="M46 70 C57 48 92 49 102 68" fill="none" stroke="${C.sky}" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
  </g>`;
}

export function sun(x: number, y: number, scale = 1): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <circle r="126" fill="#FFE7A0" opacity="0.22"/>
    <circle r="96" fill="${C.sun}" stroke="${C.sunDeep}" stroke-width="5"/>
    <circle cx="-25" cy="-28" r="24" fill="#FFF3C7" opacity="0.65"/>
    <g fill="${C.sun}" stroke="${C.sunDeep}" stroke-width="4" stroke-linecap="round">
      <path d="M0 -128 L0 -156"/><path d="M91 -91 L110 -111"/><path d="M128 0 L156 0"/>
      <path d="M90 91 L110 111"/><path d="M-91 -91 L-110 -111"/><path d="M-128 0 L-156 0"/>
    </g>
  </g>`;
}

export function tree(x: number, y: number, scale = 1, canopy = C.leaf, dark = C.leafDark): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M76 206 C69 181 70 150 78 124 L111 124 C118 151 118 180 112 206 Z" fill="${C.brownLight}" stroke="${C.ink}" stroke-width="5"/>
    <path d="M96 131 C60 131 31 111 25 82 C57 78 83 86 99 102 C103 111 101 122 96 131 Z" fill="${dark}" stroke="${C.ink}" stroke-width="5"/>
    <path d="M97 134 C132 131 157 111 164 82 C132 78 108 86 94 102 C90 111 92 124 97 134 Z" fill="${canopy}" stroke="${C.ink}" stroke-width="5"/>
    <circle cx="53" cy="70" r="42" fill="${dark}" stroke="${C.ink}" stroke-width="5"/>
    <circle cx="104" cy="48" r="52" fill="${canopy}" stroke="${C.ink}" stroke-width="5"/>
    <circle cx="153" cy="78" r="38" fill="${canopy}" stroke="${C.ink}" stroke-width="5"/>
    <circle cx="87" cy="88" r="36" fill="${canopy}" stroke="${C.ink}" stroke-width="4"/>
    <path d="M69 42 q17 -14 34 2" fill="none" stroke="${C.sky}" stroke-width="5" stroke-linecap="round" opacity="0.6"/>
  </g>`;
}

export function flower(x: number, y: number, scale = 1, petal = C.coral): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M0 6 C-3 34 -5 62 0 92" fill="none" stroke="${C.leafDark}" stroke-width="8" stroke-linecap="round"/>
    <path d="M-2 48 C-31 40 -45 21 -40 7 C-17 7 -3 22 3 38 Z" fill="${C.leaf}" stroke="${C.ink}" stroke-width="4"/>
    <path d="M2 66 C28 55 43 39 39 23 C16 21 1 36 -3 52 Z" fill="${C.leaf}" stroke="${C.ink}" stroke-width="4"/>
    <circle cx="0" cy="-26" r="22" fill="${petal}" stroke="${C.ink}" stroke-width="4"/>
    <circle cx="25" cy="-8" r="22" fill="${petal}" stroke="${C.ink}" stroke-width="4"/>
    <circle cx="15" cy="21" r="22" fill="${petal}" stroke="${C.ink}" stroke-width="4"/>
    <circle cx="-15" cy="21" r="22" fill="${petal}" stroke="${C.ink}" stroke-width="4"/>
    <circle cx="-25" cy="-8" r="22" fill="${petal}" stroke="${C.ink}" stroke-width="4"/>
    <circle r="18" fill="${C.sun}" stroke="${C.ink}" stroke-width="4"/>
    <circle cx="-6" cy="-6" r="6" fill="#FFE49B"/>
  </g>`;
}

export function lighthouse(x: number, y: number, scale = 1): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M62 420 C50 410 52 394 70 386 L210 386 C230 395 230 411 218 420 Z" fill="#6F8D9B" stroke="${C.ink}" stroke-width="5"/>
    <path d="M28 390 C38 349 88 326 145 326 C198 326 235 353 244 390 C218 407 55 407 28 390 Z" fill="${C.brown}" stroke="${C.ink}" stroke-width="5"/>
    <path d="M56 329 C76 317 102 311 133 311 C174 311 204 322 218 337 L206 390 C179 402 88 402 64 390 Z" fill="#9A6845" stroke="${C.ink}" stroke-width="5"/>
    <path d="M82 320 L106 110 L168 110 L194 320 C158 333 118 333 82 320 Z" fill="${C.paper}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M91 270 L185 270 L190 306 C156 316 120 316 87 306 Z" fill="${C.coral}" opacity="0.95"/>
    <path d="M99 207 L177 207 L181 240 C150 248 124 248 96 240 Z" fill="${C.coral}" opacity="0.95"/>
    <path d="M106 147 L171 147 L174 177 C146 184 127 184 102 177 Z" fill="${C.coral}" opacity="0.95"/>
    <path d="M72 111 L98 111 L94 94 L176 94 L172 111 L196 111 L184 78 L84 78 Z" fill="${C.ink}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>
    <rect x="102" y="50" width="64" height="48" rx="8" fill="#FFE9A8" stroke="${C.ink}" stroke-width="5"/>
    <path d="M96 50 L134 14 L172 50 Z" fill="${C.coral}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="134" cy="74" r="17" fill="${C.sun}" stroke="${C.ink}" stroke-width="4"/>
    <circle cx="134" cy="74" r="7" fill="${C.paper}"/>
    <path d="M102 58 L28 16 L22 38 L98 80 Z" fill="#FFE7A0" opacity="0.28"/>
    <path d="M166 58 L228 20 L236 42 L170 82 Z" fill="#FFE7A0" opacity="0.22"/>
    <path d="M110 388 C112 365 120 350 136 350 C151 350 160 366 162 388" fill="${C.brown}" stroke="${C.ink}" stroke-width="5"/>
    <path d="M74 372 C80 354 101 346 119 355" fill="none" stroke="${C.paper}" stroke-width="4" opacity="0.5" stroke-linecap="round"/>
  </g>`;
}

export function starShape(x: number, y: number, scale = 1, fill = C.sun, stroke = C.ink): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M0 -22 L6.7 -6.8 L23 -5 L11 6 L14.5 22 L0 13 L-14.5 22 L-11 6 L-23 -5 L-6.7 -6.8 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
  </g>`;
}

export function hill(x: number, y: number, width: number, height: number, fill: string): string {
  return `<path d="M${x} ${y + height} C${x + width * 0.16} ${y + height * 0.5} ${x + width * 0.28} ${y + height * 0.08} ${x + width * 0.5} ${y} C${x + width * 0.72} ${y + height * 0.08} ${x + width * 0.84} ${y + height * 0.5} ${x + width} ${y + height} Z" fill="${fill}"/>`;
}

export function grassTuft(x: number, y: number, scale = 1, color = C.leafDark): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round">
    <path d="M0 0 C-2 -14 -10 -18 -14 -26"/><path d="M4 0 C2 -18 8 -24 10 -34"/><path d="M8 0 C16 -12 24 -16 28 -24"/>
  </g>`;
}

export function paperPanel(x: number, y: number, width: number, height: number, radius = 32, fill = C.paper): string {
  return `<g>
    <rect x="${x + 8}" y="${y + 12}" width="${width}" height="${height}" rx="${radius}" fill="${C.ink}" opacity="0.12"/>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" stroke="${C.ink}" stroke-width="5"/>
  </g>`;
}
