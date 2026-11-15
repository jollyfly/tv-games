import type { GuardianId, ObjectKind } from '../types';
import { C, esc, svg } from './core';

const stroke = C.ink;

export function foxSvg(className = 'fox-svg'): string {
  return svg('0 0 310 430', `
    <ellipse cx="152" cy="410" rx="110" ry="15" fill="${stroke}" opacity="0.12"/>
    <path class="fox-tail" d="M94 304 C35 322 -15 269 2 216 C17 168 73 158 108 189 C134 212 136 252 120 279 C112 293 104 301 94 304 Z" fill="${C.orange}" stroke="${stroke}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M34 240 C20 221 21 201 34 190 C56 198 70 214 73 235 C62 247 47 250 34 240 Z" fill="#FFF1D8" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M118 330 C112 366 112 389 122 400 L158 400 L158 330 Z" fill="${C.amber}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M202 330 C202 366 205 389 216 400 L250 400 L244 326 Z" fill="${C.amber}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M124 393 q20 14 42 0 q18 12 40 0 l4 10 L114 403 Z" fill="#FFF1D8" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M104 240 C81 277 82 350 105 388 C136 404 214 404 245 386 C268 346 267 277 239 239 C209 211 133 209 104 240 Z" fill="${C.orange}" stroke="${stroke}" stroke-width="6" stroke-linejoin="round"/>
    <ellipse cx="175" cy="334" rx="54" ry="62" fill="#FFF1D8" stroke="${stroke}" stroke-width="4"/>
    <path d="M116 282 C87 251 71 203 72 152 C72 72 116 30 166 30 C222 30 270 78 270 151 C270 219 234 270 166 270 C147 270 130 268 116 262 Z" fill="${C.orange}" stroke="${stroke}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M88 91 L58 10 C54 2 63 -1 70 5 L135 57 Z" fill="${C.orange}" stroke="${stroke}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M97 72 L78 28 L113 56 Z" fill="${C.rose}"/>
    <path d="M224 62 L270 8 C276 3 283 10 280 19 L263 85 Z" fill="${C.orange}" stroke="${stroke}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M236 68 L265 33 L257 72 Z" fill="${C.rose}"/>
    <path d="M74 172 C69 139 84 107 112 91 C124 84 137 81 151 81 C162 81 170 84 174 90 C160 96 150 110 146 130 C140 158 149 186 170 202 C134 218 96 207 74 172 Z" fill="#F4A46F"/>
    <ellipse cx="165" cy="210" rx="82" ry="54" fill="#FFF1D8" stroke="${stroke}" stroke-width="4"/>
    <g class="fox-eyes">
      <ellipse cx="122" cy="157" rx="12" ry="17" fill="${stroke}"/>
      <ellipse cx="208" cy="157" rx="12" ry="17" fill="${stroke}"/>
      <circle cx="118" cy="151" r="4" fill="${C.paper}"/>
      <circle cx="204" cy="151" r="4" fill="${C.paper}"/>
    </g>
    <path d="M153 199 q12 -9 24 0 q-11 14 -24 0 Z" fill="${stroke}"/>
    <path d="M165 213 v7 M165 220 q-11 12 -23 2 M165 220 q11 12 23 2" fill="none" stroke="${stroke}" stroke-width="3.4" stroke-linecap="round"/>
    <ellipse cx="96" cy="210" rx="17" ry="9" fill="#F6A696" opacity="0.75"/>
    <ellipse cx="234" cy="210" rx="17" ry="9" fill="#F6A696" opacity="0.75"/>
    <path class="fox-arm" d="M247 280 C281 257 302 225 290 198 C284 184 270 183 259 191 C243 203 238 232 228 251 Z" fill="${C.orange}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="291" cy="194" r="19" fill="#FFF1D8" stroke="${stroke}" stroke-width="5"/>
    <path d="M105 244 C127 267 208 267 236 242 L244 267 C211 292 125 291 94 265 Z" fill="${C.teal}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M108 265 C95 292 96 320 112 340 L141 332 C127 312 129 290 141 273 Z" fill="${C.teal}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M154 265 L217 380" stroke="${C.brown}" stroke-width="12" stroke-linecap="round"/>
    <path d="M154 265 L217 380" stroke="#C9956B" stroke-width="4" stroke-linecap="round"/>
    <path d="M205 340 L256 351 C262 376 250 398 226 402 L199 394 Z" fill="${C.teal}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M226 369 l5 10 11 1 -8 8 2 11 -10 -5 -10 5 2 -11 -8 -8 11 -1 Z" fill="${C.sun}" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>
  `, className);
}

export function fireflySvg(className = 'firefly-svg'): string {
  // A cute but anatomically readable firefly: head + pronotum + segmented
  // abdomen, elytra, translucent hind wings, six legs and glowing tail.
  return svg('-80 -80 160 160', `
    <ellipse class="firefly-glow" cx="8" cy="30" rx="56" ry="48" fill="#FFE49B" opacity="0.20"/>
    <g class="firefly-legs" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round">
      <path d="M-20 16 C-39 22 -45 34 -53 43"/>
      <path d="M-8 22 C-28 32 -33 45 -39 55"/>
      <path d="M2 24 C-12 40 -15 51 -19 61"/>
      <path d="M20 16 C39 22 45 34 53 43"/>
      <path d="M9 22 C29 32 34 45 40 55"/>
      <path d="M-1 24 C13 40 16 51 20 61"/>
    </g>
    <g class="firefly-wings">
      <path d="M-10 -15 C-56 -54 -76 -30 -62 -7 C-51 11 -25 11 -8 -1 Z" fill="#E9F7FF" fill-opacity="0.72" stroke="${stroke}" stroke-width="3.5"/>
      <path d="M10 -15 C56 -54 76 -30 62 -7 C51 11 25 11 8 -1 Z" fill="#E9F7FF" fill-opacity="0.72" stroke="${stroke}" stroke-width="3.5"/>
      <path d="M-8 -2 C-37 -8 -50 2 -46 15 M8 -2 C37 -8 50 2 46 15" fill="none" stroke="${C.paper}" stroke-width="2" opacity="0.7"/>
    </g>
    <g class="firefly-body">
      <ellipse cx="-28" cy="11" rx="26" ry="15" transform="rotate(-35 -28 11)" fill="#6B4A2B" stroke="${stroke}" stroke-width="4"/>
      <ellipse cx="28" cy="11" rx="26" ry="15" transform="rotate(35 28 11)" fill="#6B4A2B" stroke="${stroke}" stroke-width="4"/>
      <path d="M-22 8 C-10 2 0 2 9 7" fill="none" stroke="#A8784A" stroke-width="2" opacity="0.75"/>
      <path d="M13 7 C22 2 32 2 44 8" fill="none" stroke="#A8784A" stroke-width="2" opacity="0.75"/>
      <ellipse cx="0" cy="39" rx="28" ry="35" fill="#5A3B23" stroke="${stroke}" stroke-width="4"/>
      <path d="M-25 28 C-10 23 12 23 27 29 M-28 41 C-10 36 12 36 28 42 M-24 55 C-8 50 10 50 24 55" fill="none" stroke="#A8784A" stroke-width="2.5" opacity="0.75"/>
      <ellipse cx="0" cy="58" rx="19" ry="13" fill="#FFE07A" stroke="${stroke}" stroke-width="3"/>
      <ellipse cx="0" cy="58" rx="10" ry="6" fill="#FFF4BC" opacity="0.9"/>
      <path d="M-24 -23 C-37 -9 -38 10 -25 21" fill="#F3A15E" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M24 -23 C37 -9 38 10 25 21" fill="#F3A15E" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M-21 -23 C-12 -32 12 -32 21 -23 L17 -9 C7 -3 -7 -3 -17 -9 Z" fill="#F8C078" stroke="${stroke}" stroke-width="3.5"/>
      <path d="M-12 -20 C-5 -25 5 -25 12 -20" fill="none" stroke="${stroke}" stroke-width="2" opacity="0.55"/>
      <circle cx="0" cy="-35" r="22" fill="#4A3020" stroke="${stroke}" stroke-width="4"/>
      <circle cx="-9" cy="-37" r="8" fill="${C.paper}" stroke="${stroke}" stroke-width="2.5"/>
      <circle cx="9" cy="-37" r="8" fill="${C.paper}" stroke="${stroke}" stroke-width="2.5"/>
      <circle cx="-8" cy="-36" r="3.2" fill="${stroke}"/><circle cx="10" cy="-36" r="3.2" fill="${stroke}"/>
      <circle cx="-7" cy="-37" r="1" fill="${C.paper}"/><circle cx="11" cy="-37" r="1" fill="${C.paper}"/>
      <path d="M-5 -24 q5 4 10 0" fill="none" stroke="${C.paper}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
      <path d="M-12 -54 C-23 -66 -34 -67 -41 -60 M12 -54 C23 -66 34 -67 41 -60" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="-42" cy="-60" r="3" fill="${stroke}"/><circle cx="42" cy="-60" r="3" fill="${stroke}"/>
    </g>
  `, className);
}

export function fireflyPropSvg(className = 'firefly-prop-svg'): string {
  return svg('0 0 180 140', `
    <ellipse class="firefly-glow" cx="134" cy="82" rx="36" ry="30" fill="#FFE49B" opacity="0.22"/>
    <g class="firefly-legs" fill="none" stroke="${stroke}" stroke-width="2.8" stroke-linecap="round">
      <path d="M66 91 C55 104 47 108 39 118 M80 96 C72 111 66 116 58 126 M97 98 C91 112 88 118 84 130"/>
      <path d="M118 95 C127 108 133 113 140 122 M129 91 C141 102 146 108 154 116 M141 84 C154 92 160 98 167 106"/>
    </g>
    <g class="firefly-wings">
      <path d="M92 48 C142 8 174 24 166 48 C159 69 125 79 98 67 Z" fill="#E9F7FF" fill-opacity="0.72" stroke="${stroke}" stroke-width="3.5"/>
      <path d="M91 53 C136 30 158 42 150 61 C142 77 113 82 94 71 Z" fill="#F7FCFF" fill-opacity="0.5" stroke="${stroke}" stroke-width="2.5"/>
      <path d="M111 48 C127 40 146 39 158 48 M104 60 C124 52 140 52 151 60" fill="none" stroke="${C.paper}" stroke-width="2" opacity="0.8"/>
    </g>
    <g class="firefly-body">
      <path d="M128 53 C158 53 171 65 171 83 C171 101 157 113 130 113 C111 113 98 104 98 87 C98 69 109 58 128 53 Z" fill="#5A3B23" stroke="${stroke}" stroke-width="4"/>
      <path d="M113 69 C128 63 150 64 163 73 M108 82 C124 76 148 77 169 85 M111 95 C127 90 147 91 161 98" fill="none" stroke="#A8784A" stroke-width="2.3" opacity="0.75"/>
      <ellipse cx="153" cy="96" rx="18" ry="13" fill="#FFE07A" stroke="${stroke}" stroke-width="3"/>
      <ellipse cx="156" cy="95" rx="9" ry="6" fill="#FFF4BC"/>
      <path d="M70 71 C54 67 42 70 36 77 L58 94 C70 91 84 84 94 75 Z" fill="#F3A15E" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M67 77 C77 73 88 70 98 70" fill="none" stroke="#FFD2A1" stroke-width="3" opacity="0.7"/>
      <path d="M104 49 C120 35 143 37 151 51 L141 66 C129 60 118 55 104 55 Z" fill="#7B4A2C" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
      <circle cx="61" cy="58" r="19" fill="#4A3020" stroke="${stroke}" stroke-width="3.5"/>
      <circle cx="53" cy="55" r="6.5" fill="${C.paper}" stroke="${stroke}" stroke-width="2"/>
      <circle cx="66" cy="55" r="6.5" fill="${C.paper}" stroke="${stroke}" stroke-width="2"/>
      <circle cx="53" cy="56" r="2.8" fill="${stroke}"/><circle cx="66" cy="56" r="2.8" fill="${stroke}"/>
      <circle cx="54" cy="55" r="1" fill="${C.paper}"/><circle cx="67" cy="55" r="1" fill="${C.paper}"/>
      <path d="M56 67 q6 4 12 0" fill="none" stroke="${C.paper}" stroke-width="2" stroke-linecap="round" opacity="0.75"/>
      <path d="M50 44 C42 33 34 31 28 36 M67 41 C72 29 79 25 87 29" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="27" cy="36" r="2.8" fill="${stroke}"/><circle cx="88" cy="29" r="2.8" fill="${stroke}"/>
    </g>
  `, className);
}

export function squirrelSvg(className = 'guardian-svg squirrel-svg'): string {
  return svg('0 0 330 310', `
    <ellipse cx="157" cy="278" rx="104" ry="14" fill="${stroke}" opacity="0.12"/>
    <path d="M212 244 C288 244 312 174 286 128 C266 92 219 95 203 130 C189 162 198 204 186 230 C180 243 189 254 212 244 Z" fill="#C9854E" stroke="${stroke}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M256 210 C282 192 290 160 274 138 C260 120 236 124 228 145" fill="none" stroke="#E7B481" stroke-width="11" stroke-linecap="round"/>
    <path d="M104 172 C85 202 85 244 106 268 C137 282 195 282 224 266 C244 241 242 202 222 173 C192 149 131 149 104 172 Z" fill="#C9854E" stroke="${stroke}" stroke-width="6" stroke-linejoin="round"/>
    <ellipse cx="168" cy="226" rx="38" ry="42" fill="#F8D9B3" stroke="${stroke}" stroke-width="4"/>
    <path d="M87 114 L69 45 C66 36 76 31 82 38 L131 89 Z" fill="#C9854E" stroke="${stroke}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M98 93 L84 60 L111 85 Z" fill="${C.rose}"/>
    <path d="M200 84 L236 35 C241 28 250 33 248 41 L236 107 Z" fill="#C9854E" stroke="${stroke}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M211 88 L235 55 L231 94 Z" fill="${C.rose}"/>
    <path d="M87 148 C83 94 118 64 164 64 C206 64 235 94 231 146 C228 190 201 211 160 211 C117 211 91 190 87 148 Z" fill="#C9854E" stroke="${stroke}" stroke-width="6"/>
    <ellipse cx="162" cy="130" rx="52" ry="43" fill="#F8D9B3" stroke="${stroke}" stroke-width="4"/>
    <ellipse cx="133" cy="124" rx="9" ry="12" fill="${stroke}"/>
    <ellipse cx="188" cy="124" rx="9" ry="12" fill="${stroke}"/>
    <circle cx="130" cy="120" r="3.2" fill="${C.paper}"/>
    <circle cx="185" cy="120" r="3.2" fill="${C.paper}"/>
    <path d="M157 139 q7 -6 14 0 q-7 9 -14 0 Z" fill="${stroke}"/>
    <path d="M161 149 v5 M161 154 q-7 8 -15 1 M161 154 q7 8 15 1" fill="none" stroke="${stroke}" stroke-width="2.8" stroke-linecap="round"/>
    <ellipse cx="115" cy="148" rx="12" ry="6" fill="#F1A28E" opacity="0.75"/>
    <ellipse cx="204" cy="148" rx="12" ry="6" fill="#F1A28E" opacity="0.75"/>
    <path d="M102 190 C76 204 77 238 103 253 C130 267 185 263 207 247" fill="none" stroke="${C.teal}" stroke-width="12" stroke-linecap="round"/>
    <g transform="translate(218 224)">
      <path d="M0 14 C0 2 12 -3 24 1 L45 10 L45 40 L22 46 C8 46 0 36 0 24 Z" fill="${C.teal}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M45 15 L72 6 C79 3 84 10 79 16 L56 30" fill="${C.teal}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M12 21 C24 19 34 24 38 34" fill="none" stroke="${C.sky}" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
    </g>
  `, className);
}

export function bearSvg(className = 'guardian-svg bear-svg'): string {
  return svg('0 0 330 380', `
    <ellipse cx="165" cy="360" rx="108" ry="16" fill="${stroke}" opacity="0.12"/>
    <path d="M85 260 C60 285 62 335 88 352 L244 352 C270 330 268 280 238 256 C204 232 120 232 85 260 Z" fill="#B97745" stroke="${stroke}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M108 320 C106 342 112 354 124 360 L206 360 C220 352 224 338 220 320 Z" fill="#A76438" stroke="${stroke}" stroke-width="5"/>
    <path d="M88 264 C66 292 68 330 88 348" fill="none" stroke="${C.sky}" stroke-width="8" opacity="0.8"/>
    <path d="M64 124 C50 60 96 24 140 32 C180 12 242 36 252 92 C266 152 236 205 188 218 C136 232 82 200 64 124 Z" fill="#C9854E" stroke="${stroke}" stroke-width="6"/>
    <circle cx="88" cy="62" r="38" fill="#C9854E" stroke="${stroke}" stroke-width="6"/>
    <circle cx="88" cy="62" r="20" fill="#E8B183"/>
    <circle cx="250" cy="64" r="38" fill="#C9854E" stroke="${stroke}" stroke-width="6"/>
    <circle cx="250" cy="64" r="20" fill="#E8B183"/>
    <ellipse cx="160" cy="150" rx="56" ry="42" fill="#F8D9B3" stroke="${stroke}" stroke-width="4"/>
    <circle cx="128" cy="114" r="11" fill="${stroke}"/>
    <circle cx="200" cy="114" r="11" fill="${stroke}"/>
    <circle cx="124" cy="109" r="3.6" fill="${C.paper}"/>
    <circle cx="196" cy="109" r="3.6" fill="${C.paper}"/>
    <ellipse cx="160" cy="142" rx="16" ry="11" fill="${stroke}"/>
    <path d="M160 152 v8 M160 160 q-12 10 -24 1 M160 160 q12 10 24 1" fill="none" stroke="${stroke}" stroke-width="3.4" stroke-linecap="round"/>
    <ellipse cx="106" cy="140" rx="15" ry="8" fill="#E8A48D" opacity="0.8"/>
    <ellipse cx="214" cy="140" rx="15" ry="8" fill="#E8A48D" opacity="0.8"/>
    <path d="M106 218 C96 256 108 286 136 304 L208 302 C232 280 238 250 222 218 C190 202 140 202 106 218 Z" fill="${C.teal}" stroke="${stroke}" stroke-width="5"/>
    <path d="M135 220 L160 270 L185 220" fill="none" stroke="${C.paper}" stroke-width="4" opacity="0.65"/>
    <path d="M66 245 C40 270 46 308 76 324" fill="none" stroke="#B97745" stroke-width="22" stroke-linecap="round"/>
    <path d="M242 246 C266 272 260 306 236 322" fill="none" stroke="#B97745" stroke-width="22" stroke-linecap="round"/>
  `, className);
}

export function owlSvg(className = 'guardian-svg owl-svg'): string {
  return svg('0 0 340 380', `
    <ellipse cx="170" cy="360" rx="100" ry="15" fill="${stroke}" opacity="0.12"/>
    <path d="M108 102 C80 58 96 22 130 18 C152 15 166 32 170 54 C180 28 202 14 226 24 C260 38 254 82 226 120 Z" fill="#A497CB" stroke="${stroke}" stroke-width="6"/>
    <path d="M78 190 C52 238 58 308 100 344 C140 376 232 370 264 330 C290 294 282 224 252 184 C220 144 112 136 78 190 Z" fill="#A497CB" stroke="${stroke}" stroke-width="6"/>
    <path d="M92 214 C72 246 82 300 112 324 C132 342 160 348 180 344 C156 318 150 270 166 234 Z" fill="#BCAFE0" opacity="0.8"/>
    <path d="M248 218 C266 250 258 296 236 322 C218 340 196 348 180 344 C202 318 208 270 194 236 Z" fill="#BCAFE0" opacity="0.8"/>
    <circle cx="126" cy="168" r="57" fill="#F4E4C9" stroke="${stroke}" stroke-width="5"/>
    <circle cx="218" cy="168" r="57" fill="#F4E4C9" stroke="${stroke}" stroke-width="5"/>
    <circle cx="126" cy="168" r="34" fill="${C.paper}" stroke="${stroke}" stroke-width="3"/>
    <circle cx="218" cy="168" r="34" fill="${C.paper}" stroke="${stroke}" stroke-width="3"/>
    <circle cx="126" cy="168" r="12" fill="${stroke}"/>
    <circle cx="218" cy="168" r="12" fill="${stroke}"/>
    <circle cx="122" cy="164" r="4" fill="${C.paper}"/>
    <circle cx="214" cy="164" r="4" fill="${C.paper}"/>
    <path d="M164 200 L172 226 L180 200 Z" fill="${C.coral}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M170 228 q-16 18 -34 3 M170 228 q16 18 34 3" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M70 223 C48 254 58 293 84 306" fill="none" stroke="${C.teal}" stroke-width="10" stroke-linecap="round"/>
    <path d="M272 223 C294 254 284 293 258 306" fill="none" stroke="${C.teal}" stroke-width="10" stroke-linecap="round"/>
    <g transform="translate(170 158)">
      <path d="M-58 0 L58 0" stroke="${stroke}" stroke-width="4"/>
      <circle cx="-58" cy="0" r="20" fill="none" stroke="${stroke}" stroke-width="4"/>
      <circle cx="58" cy="0" r="20" fill="none" stroke="${stroke}" stroke-width="4"/>
      <path d="M-103 0 L-78 0 M78 0 L103 0" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>
    </g>
    <g fill="${C.sun}" stroke="${stroke}" stroke-width="2">
      <path d="M36 88 l4 10 11 1 -8 7 2 11 -9 -5 -9 5 2 -11 -8 -7 11 -1 Z"/>
      <path d="M298 96 l3 8 9 1 -7 6 2 9 -7 -4 -7 4 2 -9 -7 -6 9 -1 Z"/>
    </g>
  `, className);
}

export function guardianSvg(id: GuardianId, className = ''): string {
  switch (id) {
    case 'squirrel': return squirrelSvg(className || 'guardian-svg squirrel-svg');
    case 'bear': return bearSvg(className || 'guardian-svg bear-svg');
    case 'owl': return owlSvg(className || 'guardian-svg owl-svg');
    case 'fox': return foxSvg(className || 'fox-svg');
    case 'firefly': return fireflySvg(className || 'firefly-svg');
    case 'turtle': return turtleSvg(className || 'guardian-svg turtle-svg');
    case 'dino': return dinoSvg(className || 'guardian-svg dino-svg');
  }
}

export function animalHeadSvg(id: GuardianId, className = 'animal-head'): string {
  const common = `stroke="${stroke}" stroke-width="5" stroke-linejoin="round"`;
  const blink = (inner: string) => `<g class="avatar-blink">${inner}</g>`;
  switch (id) {
    case 'squirrel':
      return svg('0 0 160 160', `
        <g class="avatar-bob">
          <path d="M128 122 C156 102 154 58 134 46 C118 36 104 52 110 68 C116 86 128 92 122 108 Z" fill="#C9854E" stroke="${stroke}" stroke-width="5"/>
          <path d="M124 101 C138 84 136 64 126 58" fill="none" stroke="#E7B481" stroke-width="8" stroke-linecap="round"/>
          <path d="M38 54 L24 18 C21 10 31 6 37 13 L66 42 Z" fill="#C9854E" ${common}/>
          <path d="M122 50 L136 16 C139 8 149 12 147 20 L134 58 Z" fill="#C9854E" ${common}/>
          <path d="M45 54 L37 33 L55 47 Z" fill="${C.rose}"/><path d="M128 49 L136 31 L142 50 Z" fill="${C.rose}"/>
          <circle cx="80" cy="88" r="52" fill="#C9854E" ${common}/>
          <path d="M40 72 C48 52 62 44 80 44 C98 44 112 52 120 72 C108 64 98 62 80 62 C62 62 52 64 40 72 Z" fill="#E7B481" opacity="0.8"/>
          <ellipse cx="80" cy="104" rx="30" ry="23" fill="#F8D9B3" stroke="${stroke}" stroke-width="3.5"/>
          ${blink(`<ellipse cx="61" cy="82" rx="8" ry="11" fill="${stroke}"/><ellipse cx="99" cy="82" rx="8" ry="11" fill="${stroke}"/><circle cx="58" cy="78" r="3" fill="${C.paper}"/><circle cx="96" cy="78" r="3" fill="${C.paper}"/>`)}
          <path d="M80 92 q6 -5 12 0 q-6 8 -12 0 Z" fill="${stroke}"/>
          <path d="M80 100 v7 M80 107 q-6 6 -11 1 M80 107 q6 6 11 1" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M73 116 h14 v9 h-14 Z" fill="${C.paper}" stroke="${stroke}" stroke-width="2.5"/>
          <g fill="#C9854E" opacity="0.7"><circle cx="53" cy="103" r="2"/><circle cx="58" cy="111" r="2"/><circle cx="107" cy="103" r="2"/><circle cx="102" cy="111" r="2"/></g>
          <path d="M48 132 C62 145 98 145 112 132 L118 160 H42 Z" fill="${C.teal}" stroke="${stroke}" stroke-width="4"/>
          <circle cx="80" cy="143" r="5" fill="${C.sun}" stroke="${stroke}" stroke-width="2"/>
        </g>
      `, className);
    case 'bear':
      return svg('0 0 160 160', `
        <g class="avatar-bob">
          <circle cx="42" cy="46" r="25" fill="#C9854E" ${common}/><circle cx="118" cy="46" r="25" fill="#C9854E" ${common}/>
          <circle cx="42" cy="46" r="14" fill="#E8B183"/><circle cx="118" cy="46" r="14" fill="#E8B183"/>
          <path d="M34 70 C46 52 60 46 80 46 C100 46 114 52 126 70 C114 64 102 62 80 62 C58 62 46 64 34 70 Z" fill="#E8B183" opacity="0.8"/>
          <circle cx="80" cy="90" r="54" fill="#C9854E" ${common}/>
          <ellipse cx="80" cy="105" rx="32" ry="24" fill="#F8D9B3" stroke="${stroke}" stroke-width="3.5"/>
          ${blink(`<circle cx="60" cy="82" r="7" fill="${stroke}"/><circle cx="100" cy="82" r="7" fill="${stroke}"/><circle cx="57" cy="79" r="2.5" fill="${C.paper}"/><circle cx="97" cy="79" r="2.5" fill="${C.paper}"/>`)}
          <ellipse cx="80" cy="96" rx="9" ry="7" fill="${stroke}"/>
          <path d="M80 103 v4 M80 107 q-7 6 -13 1 M80 107 q7 6 13 1" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M50 68 C59 58 71 54 80 54 C89 54 101 58 110 68" fill="none" stroke="#A96B3E" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
          <path d="M48 130 C60 142 100 142 112 130 L120 160 H40 Z" fill="${C.teal}" stroke="${stroke}" stroke-width="4"/>
          <path d="M58 136 L80 154 L102 136" fill="none" stroke="${C.paper}" stroke-width="3" opacity="0.65"/>
          <circle cx="80" cy="160" r="8" fill="${C.sun}" stroke="${stroke}" stroke-width="2"/>
        </g>
      `, className);
    case 'owl':
      return svg('0 0 160 160', `
        <g class="avatar-bob">
          <path d="M42 48 C26 20 44 8 64 14 C70 16 75 23 78 32 C84 18 96 10 112 18 C130 28 132 46 120 62 Z" fill="#A497CB" ${common}/>
          <path d="M48 48 L44 28 L58 38 Z" fill="#E7C7F1"/><path d="M112 48 L118 28 L102 38 Z" fill="#E7C7F1"/>
          <path d="M80 42 C50 42 30 62 32 94 C34 128 56 146 80 146 C104 146 126 128 128 94 C130 62 110 42 80 42 Z" fill="#A497CB" ${common}/>
          <path d="M80 54 C58 54 44 68 46 88 C48 106 62 116 80 116 C98 116 112 106 114 88 C116 68 102 54 80 54 Z" fill="#F4E4C9" stroke="${stroke}" stroke-width="3.5"/>
          <circle cx="60" cy="82" r="22" fill="${C.paper}" stroke="${stroke}" stroke-width="3.5"/>
          <circle cx="100" cy="82" r="22" fill="${C.paper}" stroke="${stroke}" stroke-width="3.5"/>
          ${blink(`<circle cx="60" cy="82" r="9" fill="${stroke}"/><circle cx="100" cy="82" r="9" fill="${stroke}"/><circle cx="57" cy="79" r="3" fill="${C.paper}"/><circle cx="97" cy="79" r="3" fill="${C.paper}"/>`)}
          <path d="M72 106 L80 120 L88 106 Z" fill="${C.coral}" stroke="${stroke}" stroke-width="3"/>
          <path d="M34 80 H126" stroke="${stroke}" stroke-width="3"/>
          <circle cx="34" cy="80" r="12" fill="none" stroke="${stroke}" stroke-width="3"/><circle cx="126" cy="80" r="12" fill="none" stroke="${stroke}" stroke-width="3"/>
          <path d="M47 128 C58 138 70 142 80 142 C90 142 102 138 113 128" fill="none" stroke="#E7C7F1" stroke-width="4" stroke-linecap="round"/>
          <path d="M54 132 L52 150 M72 136 L72 154 M88 136 L88 154 M106 132 L108 150" stroke="${stroke}" stroke-width="2" opacity="0.35"/>
        </g>
      `, className);
    case 'fox':
      return svg('0 0 160 160', `
        <g class="avatar-bob">
          <path d="M34 58 L18 10 C15 2 25 -2 31 6 L66 44 Z" fill="${C.orange}" ${common}/>
          <path d="M126 58 L142 10 C145 2 155 6 153 14 L135 64 Z" fill="${C.orange}" ${common}/>
          <path d="M28 15 L24 4 L42 20 Z" fill="${stroke}"/><path d="M140 14 L145 5 L150 20 Z" fill="${stroke}"/>
          <path d="M34 57 L58 45 L50 66 Z" fill="${C.rose}" opacity="0.75"/><path d="M126 57 L102 45 L110 66 Z" fill="${C.rose}" opacity="0.75"/>
          <path d="M80 40 C54 40 34 58 34 86 C34 116 54 139 80 139 C106 139 126 116 126 86 C126 58 106 40 80 40 Z" fill="${C.orange}" ${common}/>
          <path d="M40 86 C46 104 60 112 80 112 C100 112 114 104 120 86 C110 102 94 107 80 107 C66 107 50 102 40 86 Z" fill="#F4A46F" opacity="0.7"/>
          <path d="M58 102 C62 90 72 84 80 84 C88 84 98 90 102 102 C96 112 88 117 80 117 C72 117 64 112 58 102 Z" fill="#FFF1D8" stroke="${stroke}" stroke-width="3.5"/>
          ${blink(`<ellipse cx="60" cy="80" rx="8" ry="11" fill="${stroke}"/><ellipse cx="100" cy="80" rx="8" ry="11" fill="${stroke}"/><circle cx="57" cy="76" r="3" fill="${C.paper}"/><circle cx="97" cy="76" r="3" fill="${C.paper}"/>`)}
          <path d="M74 99 q6 -5 12 0 q-6 8 -12 0 Z" fill="${stroke}"/>
          <path d="M80 106 v5 M80 111 q-5 5 -10 1 M80 111 q5 5 10 1" fill="none" stroke="${stroke}" stroke-width="2.3" stroke-linecap="round"/>
          <ellipse cx="45" cy="92" rx="14" ry="7" fill="#E88F7D" opacity="0.55"/><ellipse cx="115" cy="92" rx="14" ry="7" fill="#E88F7D" opacity="0.55"/>
          <path d="M36 132 C54 146 106 146 124 132 L128 160 H32 Z" fill="${C.teal}" stroke="${stroke}" stroke-width="4"/>
          <path d="M80 140 l6 10 12 1 -9 8 3 11 -12 -6 -12 6 3 -11 -9 -8 12 -1 Z" fill="${C.sun}" stroke="${stroke}" stroke-width="2"/>
        </g>
      `, className);
    case 'firefly':
      return svg('0 0 160 160', `
        <g class="avatar-bob">
          <ellipse cx="80" cy="104" rx="54" ry="46" fill="#FFE49B" opacity="0.25"/>
          <g class="firefly-wings">
            <path d="M60 54 C18 20 8 52 30 72 C44 84 58 76 66 64 Z" fill="#E9F7FF" fill-opacity="0.75" stroke="${stroke}" stroke-width="4"/>
            <path d="M100 54 C142 20 152 52 130 72 C116 84 102 76 94 64 Z" fill="#E9F7FF" fill-opacity="0.75" stroke="${stroke}" stroke-width="4"/>
          </g>
          <ellipse cx="80" cy="118" rx="30" ry="34" fill="#5A3B23" stroke="${stroke}" stroke-width="5"/>
          <path d="M56 106 C68 100 92 100 104 106 M54 120 C66 114 94 114 106 120 M59 134 C70 129 90 129 101 134" fill="none" stroke="#A8784A" stroke-width="2.5" stroke-linecap="round"/>
          <ellipse cx="80" cy="143" rx="19" ry="12" fill="#FFE07A" stroke="${stroke}" stroke-width="3"/>
          <ellipse cx="80" cy="143" rx="9" ry="5" fill="#FFF4BC"/>
          <path d="M48 86 C56 72 70 66 80 68 C90 66 104 72 112 86 C104 99 92 105 80 105 C68 105 56 99 48 86 Z" fill="#F8C078" stroke="${stroke}" stroke-width="4"/>
          <path d="M56 82 C64 76 72 74 80 74 C88 74 96 76 104 82" fill="none" stroke="${stroke}" stroke-width="2" opacity="0.4"/>
          <circle cx="80" cy="54" r="25" fill="#4A3020" stroke="${stroke}" stroke-width="4"/>
          ${blink(`<circle cx="70" cy="52" r="8" fill="${C.paper}" stroke="${stroke}" stroke-width="2.5"/><circle cx="90" cy="52" r="8" fill="${C.paper}" stroke="${stroke}" stroke-width="2.5"/><circle cx="71" cy="53" r="3" fill="${stroke}"/><circle cx="91" cy="53" r="3" fill="${stroke}"/>`)}
          <path d="M75 66 q5 4 10 0" fill="none" stroke="${C.paper}" stroke-width="2.2" stroke-linecap="round"/>
          <path d="M58 34 C48 20 38 18 30 24 M102 34 C112 20 122 18 130 24" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
          <circle cx="29" cy="25" r="3" fill="${stroke}"/><circle cx="131" cy="25" r="3" fill="${stroke}"/>
          <g fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"><path d="M46 118 C36 128 32 138 30 150"/><path d="M114 118 C124 128 128 138 130 150"/></g>
        </g>
      `, className);
    case 'dino':
      return svg('0 0 160 160', `
        <g class="avatar-bob">
          <path d="M28 70 C24 50 38 38 54 44 C64 20 80 12 96 24 C110 12 130 20 130 40 C146 48 148 66 136 78 Z" fill="#8FCB72" stroke="${stroke}" stroke-width="5"/>
          <path d="M42 58 L34 30 L56 46 M84 30 L86 4 L102 30 M116 30 L132 10 L134 38" fill="${C.sun}" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
          <path d="M78 48 C52 48 32 66 32 94 C32 124 54 145 82 145 C110 145 130 124 130 94 C130 66 108 48 78 48 Z" fill="#8FCB72" stroke="${stroke}" stroke-width="5"/>
          <path d="M98 62 C118 64 133 78 136 96 C138 110 128 120 116 117 C102 113 93 99 94 84 Z" fill="#A9D98E" stroke="${stroke}" stroke-width="4"/>
          ${blink(`<ellipse cx="65" cy="82" rx="8" ry="11" fill="${stroke}"/><ellipse cx="103" cy="82" rx="8" ry="11" fill="${stroke}"/><circle cx="62" cy="78" r="3" fill="${C.paper}"/><circle cx="100" cy="78" r="3" fill="${C.paper}"/>`)}
          <path d="M84 110 C92 118 104 118 112 110" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
          <path d="M92 116 l5 8 M106 116 l-5 8" stroke="${C.paper}" stroke-width="4" stroke-linecap="round"/>
          <g fill="#4D8A43" opacity="0.55"><circle cx="52" cy="108" r="5"/><circle cx="62" cy="124" r="3.5"/><circle cx="106" cy="130" r="4"/><circle cx="118" cy="100" r="3"/></g>
          <path d="M44 140 C60 152 100 152 116 140" fill="none" stroke="${stroke}" stroke-width="3" opacity="0.35"/>
        </g>
      `, className);
    case 'turtle':
      return svg('0 0 160 160', `
        <g class="avatar-bob">
          <path d="M20 74 C20 36 50 18 80 18 C110 18 140 36 140 74 C140 116 112 140 80 140 C48 140 20 116 20 74 Z" fill="#79B85A" stroke="${stroke}" stroke-width="5"/>
          <path d="M34 70 C38 44 58 32 80 32 C102 32 122 44 126 70 C112 92 48 92 34 70 Z" fill="#A9D98E" stroke="${stroke}" stroke-width="4"/>
          <g fill="none" stroke="#4D8A43" stroke-width="2.5" opacity="0.8"><path d="M80 34 V94 M52 46 L64 86 M108 46 L96 86 M38 70 H122"/></g>
          <path d="M58 26 C58 10 70 2 82 2 C94 2 104 10 104 26 C96 36 66 36 58 26 Z" fill="#A9D98E" stroke="${stroke}" stroke-width="4"/>
          ${blink(`<circle cx="71" cy="18" r="6" fill="${C.paper}" stroke="${stroke}" stroke-width="2.5"/><circle cx="91" cy="18" r="6" fill="${C.paper}" stroke="${stroke}" stroke-width="2.5"/><circle cx="73" cy="18" r="2.5" fill="${stroke}"/><circle cx="93" cy="18" r="2.5" fill="${stroke}"/>`)}
          <path d="M74 29 q8 5 15 0" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M22 128 C42 142 118 142 138 128" fill="none" stroke="${stroke}" stroke-width="3" opacity="0.35"/>
          <circle cx="42" cy="78" r="5" fill="#C6E5A9" opacity="0.8"/><circle cx="118" cy="80" r="4" fill="#C6E5A9" opacity="0.8"/>
        </g>
      `, className);
  }
}

export function dinoSvg(className = 'guardian-svg dino-svg'): string {
  return svg('0 0 320 300', `
    <ellipse cx="160" cy="280" rx="108" ry="13" fill="${C.ink}" opacity="0.12"/>
    <g class="dino-tail">
      <path d="M82 216 C52 206 25 180 18 151 C15 137 24 128 36 135 C60 149 77 178 98 192 Z" fill="#69A84F" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M52 174 C42 159 32 150 25 150 C34 164 40 175 50 185 Z" fill="#8FCB72"/>
    </g>
    <path d="M94 221 C76 185 93 145 129 129 C163 114 204 127 224 158 C242 188 232 223 201 240 C168 258 119 251 94 221 Z" fill="#79BC5B" stroke="${stroke}" stroke-width="5"/>
    <path d="M118 219 C126 194 152 181 182 188 C204 194 214 212 208 231 C197 250 158 255 137 244 C125 238 116 231 118 219 Z" fill="#B7DE9A" stroke="${stroke}" stroke-width="3.5"/>
    <path d="M125 219 C136 203 158 198 179 204 C195 209 201 219 197 229" fill="none" stroke="#EAF6D8" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
    <g class="dino-legs" fill="#69A84F" stroke="${stroke}" stroke-width="4" stroke-linejoin="round">
      <path d="M133 235 C128 254 128 267 137 278 L164 278 C158 263 161 249 169 236 Z"/>
      <path d="M193 232 C191 251 196 266 206 278 L231 278 C222 262 219 247 222 231 Z"/>
    </g>
    <path d="M129 275 h37 M196 275 h37" stroke="${stroke}" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
    <path d="M216 172 C232 142 257 126 278 132 C300 138 307 163 293 180 C276 201 244 198 226 183 Z" fill="#8FCB72" stroke="${stroke}" stroke-width="5"/>
    <path d="M247 151 C249 139 257 130 270 128 C283 127 292 135 294 146 C281 137 264 139 257 153 Z" fill="#A9D98E" stroke="${stroke}" stroke-width="3"/>
    <circle cx="278" cy="157" r="7" fill="${C.paper}" stroke="${stroke}" stroke-width="2.5"/>
    <circle cx="280" cy="157" r="3" fill="${stroke}"/>
    <circle cx="279" cy="154" r="1" fill="${C.paper}"/>
    <path d="M296 172 q11 5 2 13" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="279" cy="178" r="4" fill="${C.rose}" opacity="0.65"/>
    <path d="M232 144 C226 129 238 116 252 120 C262 123 267 132 264 142" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
    <g fill="#FFC94A" stroke="${stroke}" stroke-width="3" stroke-linejoin="round">
      <path d="M107 126 l-10 -23 l22 13 Z"/><path d="M130 110 l-3 -25 l18 18 Z"/><path d="M158 103 l7 -24 l10 24 Z"/><path d="M187 109 l14 -19 l2 25 Z"/><path d="M210 128 l20 -11 l-9 23 Z"/>
    </g>
    <g class="dino-spots" fill="#4D8A43" opacity="0.55">
      <circle cx="118" cy="173" r="5"/><circle cx="141" cy="158" r="4"/><circle cx="165" cy="168" r="5"/><circle cx="185" cy="151" r="3.5"/><circle cx="104" cy="197" r="3"/>
    </g>
    <path d="M84 216 C72 206 70 193 79 187" fill="none" stroke="#4D8A43" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
  `, className);
}


export function turtleSvg(className = 'guardian-svg turtle-svg'): string {
  return svg('0 0 300 280', `
    <ellipse cx="152" cy="255" rx="102" ry="13" fill="${C.ink}" opacity="0.12"/>
    <g class="turtle-flippers" fill="#8FCB72" stroke="${stroke}" stroke-width="5" stroke-linejoin="round">
      <path d="M54 143 C25 128 8 145 18 165 C28 185 56 187 76 171 Z"/>
      <path d="M241 143 C270 128 288 145 278 165 C268 185 240 187 220 171 Z"/>
      <path d="M70 214 C48 229 48 248 66 253 C84 258 99 244 101 226 Z"/>
      <path d="M229 214 C251 229 251 248 233 253 C215 258 200 244 198 226 Z"/>
    </g>
    <path d="M47 162 C47 92 96 56 150 56 C204 56 253 92 253 162 C253 219 210 247 150 247 C90 247 47 219 47 162 Z" fill="#79B85A" stroke="${stroke}" stroke-width="6"/>
    <path d="M66 151 C71 98 107 73 150 73 C193 73 229 98 234 151 C219 180 186 194 150 194 C114 194 81 180 66 151 Z" fill="#A9D98E" stroke="${stroke}" stroke-width="4"/>
    <g fill="none" stroke="#4D8A43" stroke-width="3" opacity="0.85">
      <path d="M150 79 L150 190 M91 102 L115 178 M209 102 L185 178 M82 151 H218 M105 92 L133 183 M195 92 L167 183"/>
    </g>
    <g fill="#C6E5A9" opacity="0.9">
      <circle cx="127" cy="112" r="4"/><circle cx="176" cy="121" r="3"/><circle cx="112" cy="160" r="3.5"/><circle cx="188" cy="164" r="4"/>
    </g>
    <path d="M147 47 C153 26 183 22 195 43 C205 61 190 82 170 85 C154 87 143 73 147 60 Z" fill="#A9D98E" stroke="${stroke}" stroke-width="5"/>
    <path d="M160 38 C167 30 180 32 186 42" fill="none" stroke="${stroke}" stroke-width="2.5" opacity="0.55"/>
    <circle cx="174" cy="54" r="6.5" fill="${C.paper}" stroke="${stroke}" stroke-width="2.5"/><circle cx="176" cy="54" r="3" fill="${stroke}"/>
    <circle cx="190" cy="62" r="5" fill="${C.paper}" stroke="${stroke}" stroke-width="2.5"/><circle cx="192" cy="62" r="2.4" fill="${stroke}"/>
    <path d="M180 77 q9 6 16 0" fill="none" stroke="${stroke}" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M56 233 C86 247 116 251 148 251 C181 251 215 245 244 230" fill="none" stroke="#4D8A43" stroke-width="4" stroke-linecap="round" opacity="0.55"/>
    <circle cx="58" cy="151" r="7" fill="#C6E5A9" opacity="0.75"/><circle cx="243" cy="154" r="6" fill="#C6E5A9" opacity="0.75"/>
    <path d="M130 246 q18 12 38 0" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" opacity="0.35"/>
  `, className);
}


export function fishSvg(tone = 0, className = 'fish-svg'): string {
  const palettes = [
    { body: '#F27059', fin: '#FFC94A', trim: '#C95542' },
    { body: '#8E7CC3', fin: '#F6C7B9', trim: '#6E5CA6' },
    { body: '#2A9D8F', fin: '#FFC94A', trim: '#1E776D' },
  ];
  const p = palettes[tone % 3];
  return `<svg class="${className} fish-svg" viewBox="0 0 300 220" width="300" height="220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <ellipse cx="146" cy="172" rx="58" ry="9" fill="${C.ink}" opacity="0.1"/>
    <path d="M76 108 C42 76 18 84 20 112 C22 138 47 142 76 126 Z" fill="${p.fin}" stroke="${stroke}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M111 88 C123 52 158 46 179 72 C162 77 148 88 140 102 Z" fill="${p.fin}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M103 128 C77 130 63 148 69 167 C75 187 106 187 120 164 Z" fill="${p.fin}" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M85 110 C85 79 119 58 160 58 C204 58 241 83 253 110 C241 141 204 162 160 162 C119 162 85 141 85 110 Z" fill="${p.body}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M120 110 C128 94 148 90 161 101 C173 112 166 127 150 132 C134 137 116 125 120 110 Z" fill="${p.trim}" opacity="0.4"/>
    <circle cx="221" cy="102" r="10" fill="${C.paper}" stroke="${stroke}" stroke-width="3"/>
    <circle cx="224" cy="102" r="4.5" fill="${stroke}"/>
    <path d="M238 125 q12 6 2 14" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M113 134 q10 8 20 0" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
    <circle cx="64" cy="65" r="7" fill="none" stroke="${C.paper}" stroke-width="3" opacity="0.8"/>
    <circle cx="47" cy="44" r="4" fill="none" stroke="${C.paper}" stroke-width="2.5" opacity="0.7"/>
  </svg>`;
}

export function submarineSvg(className = 'player-plane-svg'): string {
  return `<svg class="${className} submarine-svg" viewBox="0 0 300 220" width="300" height="220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <ellipse cx="150" cy="196" rx="78" ry="9" fill="${C.ink}" opacity="0.12"/>
    <path d="M42 110 C42 70 89 42 150 42 C211 42 258 70 258 110 C258 150 211 178 150 178 C89 178 42 150 42 110 Z" fill="${C.sun}" stroke="${stroke}" stroke-width="5"/>
    <path d="M58 96 C74 62 112 48 150 48 C188 48 226 62 242 96" fill="none" stroke="${C.paper}" stroke-width="7" stroke-linecap="round" opacity="0.65"/>
    <circle cx="150" cy="112" r="39" fill="${C.teal}" stroke="${stroke}" stroke-width="4"/>
    <circle cx="150" cy="112" r="29" fill="${C.paper}" stroke="${stroke}" stroke-width="4"/>
    <g class="sub-pilot">
      <path d="M135 105 q5 -7 11 0 q-6 5 -11 0 Z M154 105 q5 -7 11 0 q-6 5 -11 0 Z" fill="${stroke}"/>
      <path d="M141 118 q9 6 18 0" fill="none" stroke="${stroke}" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="130" cy="116" r="3.5" fill="${C.rose}" opacity="0.8"/><circle cx="170" cy="116" r="3.5" fill="${C.rose}" opacity="0.8"/>
    </g>
    <path d="M232 108 L278 88 L278 132 Z" fill="${C.coral}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M249 108 H275" stroke="${C.cream}" stroke-width="5" stroke-linecap="round"/>
    <path d="M150 42 V17" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="150" cy="15" r="7" fill="${C.coral}" stroke="${stroke}" stroke-width="3"/>
    <path d="M96 169 L82 193 M204 169 L218 193" stroke="${C.ink}" stroke-width="4" stroke-linecap="round" opacity="0.5"/>
    <circle cx="78" cy="70" r="5" fill="none" stroke="${C.paper}" stroke-width="2.5" opacity="0.8"/>
    <circle cx="61" cy="48" r="3" fill="none" stroke="${C.paper}" stroke-width="2" opacity="0.7"/>
  </svg>`;
}

export function clownFishSvg(className = '', number?: number): string {
  return svg('0 0 180 130', `
    <g class="fish-tail">
      <path d="M28 65 C12 42 2 38 6 65 C2 92 12 88 28 65 Z" fill="${C.sun}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M10 65 H27" stroke="${stroke}" stroke-width="2" opacity="0.35"/>
    </g>
    <path d="M30 64 C30 34 60 22 94 26 C132 30 160 46 162 64 C160 82 132 99 94 103 C60 107 30 94 30 64 Z" fill="${C.coral}" stroke="${stroke}" stroke-width="4"/>
    <path d="M78 28 C70 16 86 8 100 18 L114 29 Z" fill="${C.sun}" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M67 94 C56 108 70 118 86 108 L98 99 Z" fill="${C.sun}" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M92 58 C110 44 128 50 134 64 C128 79 110 85 92 71" fill="#FFF1D8" stroke="${stroke}" stroke-width="3"/>
    <g class="fish-scales" fill="none" stroke="#C95745" stroke-width="2.5" opacity="0.55">
      <path d="M48 50 q8 14 0 28 M64 45 q8 15 0 30 M80 41 q8 16 0 32 M96 40 q8 17 0 34"/>
    </g>
    <path d="M136 54 C146 50 154 54 156 62 C153 70 145 73 137 68" fill="${C.coral}" stroke="${stroke}" stroke-width="2"/>
    <circle cx="140" cy="54" r="5.5" fill="${C.paper}" stroke="${stroke}" stroke-width="2.5"/>
    <circle cx="141" cy="54" r="2.2" fill="${stroke}"/>
    <path d="M155 64 q5 5 0 10" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M54 83 C64 92 78 96 91 93" fill="none" stroke="#C95745" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
    ${number !== undefined ? `<g transform="translate(78 68)"><circle r="15" fill="${C.paper}" stroke="${stroke}" stroke-width="3"/><text y="7" text-anchor="middle" font-family="Arial Rounded MT Bold, sans-serif" font-size="20" fill="${stroke}">${number}</text></g>` : ''}
  `, className);
}

export function starfishPropSvg(className = ''): string {
  return svg('0 0 160 160', `
    <g class="starfish-arms" fill="#F28C6E" stroke="${stroke}" stroke-width="4" stroke-linejoin="round">
      <path d="M80 80 C62 58 58 38 72 20 C77 14 83 14 88 20 C102 38 98 58 80 80 Z"/>
      <path d="M80 80 C62 58 58 38 72 20 C77 14 83 14 88 20 C102 38 98 58 80 80 Z" transform="rotate(72 80 80)"/>
      <path d="M80 80 C62 58 58 38 72 20 C77 14 83 14 88 20 C102 38 98 58 80 80 Z" transform="rotate(144 80 80)"/>
      <path d="M80 80 C62 58 58 38 72 20 C77 14 83 14 88 20 C102 38 98 58 80 80 Z" transform="rotate(216 80 80)"/>
      <path d="M80 80 C62 58 58 38 72 20 C77 14 83 14 88 20 C102 38 98 58 80 80 Z" transform="rotate(288 80 80)"/>
    </g>
    <circle cx="80" cy="80" r="27" fill="#F28C6E" stroke="${stroke}" stroke-width="4"/>
    <path d="M80 54 C91 60 94 72 88 82 C82 91 68 91 62 82 C56 72 61 59 72 54" fill="#FFD1B8" opacity="0.5"/>
    <g class="starfish-tube-feet" fill="#FFD1B8">
      <circle cx="80" cy="19" r="2.6"/><circle cx="73" cy="29" r="2.2"/><circle cx="87" cy="29" r="2.2"/>
      <circle cx="116" cy="50" r="2.5"/><circle cx="107" cy="56" r="2"/><circle cx="121" cy="62" r="2.1"/>
      <circle cx="116" cy="111" r="2.5"/><circle cx="106" cy="103" r="2"/><circle cx="122" cy="97" r="2.1"/>
      <circle cx="44" cy="111" r="2.5"/><circle cx="54" cy="103" r="2"/><circle cx="38" cy="97" r="2.1"/>
      <circle cx="44" cy="50" r="2.5"/><circle cx="53" cy="56" r="2"/><circle cx="39" cy="62" r="2.1"/>
    </g>
    <g fill="#D96C50" opacity="0.75">
      <circle cx="72" cy="74" r="3"/><circle cx="87" cy="73" r="2.4"/><circle cx="92" cy="84" r="2.6"/>
      <circle cx="68" cy="86" r="2.2"/><circle cx="80" cy="92" r="2.4"/><circle cx="68" cy="64" r="2"/>
    </g>
    <circle cx="71" cy="76" r="3.4" fill="${stroke}"/><circle cx="89" cy="76" r="3.4" fill="${stroke}"/>
    <circle cx="70" cy="75" r="1.1" fill="${C.paper}"/><circle cx="88" cy="75" r="1.1" fill="${C.paper}"/>
    <path d="M73 86 q7 6 14 0" fill="none" stroke="${stroke}" stroke-width="2.7" stroke-linecap="round"/>
  `, className);
}

export function crabPropSvg(className = ''): string {
  return svg('0 0 190 150', `
    <g class="crab-legs" fill="none" stroke="${stroke}" stroke-width="5" stroke-linecap="round">
      <path d="M52 96 C36 101 27 114 20 130 M48 108 C38 118 34 132 31 143 M66 111 C58 125 56 137 57 146"/>
      <path d="M138 96 C154 101 163 114 170 130 M142 108 C152 118 156 132 159 143 M124 111 C132 125 134 137 133 146"/>
    </g>
    <path d="M55 68 C58 39 78 24 95 24 C113 24 134 39 137 68 C140 98 118 120 95 122 C72 124 52 99 55 68 Z" fill="#F27059" stroke="${stroke}" stroke-width="5"/>
    <path d="M62 72 C70 46 82 36 95 36 C110 36 123 47 129 70" fill="none" stroke="#FFB09A" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
    <g fill="#C95745" opacity="0.8"><circle cx="76" cy="61" r="4"/><circle cx="95" cy="52" r="3"/><circle cx="114" cy="61" r="4"/><circle cx="86" cy="79" r="3"/><circle cx="107" cy="83" r="2.5"/></g>
    <g class="crab-claws" fill="#F27059" stroke="${stroke}" stroke-width="5" stroke-linejoin="round">
      <path d="M62 82 C42 74 25 58 28 42 C32 28 47 26 57 36 L70 52 Z"/>
      <path d="M128 82 C148 74 165 58 162 42 C158 28 143 26 133 36 L120 52 Z"/>
      <path d="M26 43 C36 34 46 37 50 48 C43 58 32 56 26 43 Z" fill="${C.coral}"/>
      <path d="M164 43 C154 34 144 37 140 48 C147 58 158 56 164 43 Z" fill="${C.coral}"/>
    </g>
    <g class="crab-eyes">
      <path d="M80 48 V27 M110 48 V27" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="80" cy="23" r="9" fill="${C.paper}" stroke="${stroke}" stroke-width="3"/><circle cx="110" cy="23" r="9" fill="${C.paper}" stroke="${stroke}" stroke-width="3"/>
      <circle cx="82" cy="23" r="3.5" fill="${stroke}"/><circle cx="112" cy="23" r="3.5" fill="${stroke}"/>
    </g>
    <path d="M87 99 q8 6 16 0" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
  `, className);
}

export function jellyfishPropSvg(className = ''): string {
  return svg('0 0 180 220', `
    <ellipse class="jellyfish-glow" cx="90" cy="90" rx="74" ry="68" fill="#FFE7A0" opacity="0.16"/>
    <g class="jellyfish-tentacles" fill="none" stroke="#F0A9C4" stroke-width="5" stroke-linecap="round">
      <path d="M55 118 C45 143 54 159 46 181 C40 197 47 208 41 218"/>
      <path d="M74 123 C66 148 74 164 67 184 C62 199 68 209 63 219"/>
      <path d="M94 124 C89 150 97 167 90 187 C86 200 91 209 87 219"/>
      <path d="M113 121 C107 145 115 163 108 183 C103 197 109 208 104 218"/>
      <path d="M130 116 C124 138 132 154 126 173 C122 186 127 197 123 210"/>
    </g>
    <g class="jellyfish-arms" fill="#F6C7B9" opacity="0.75">
      <path d="M72 110 C66 142 82 150 76 177 C84 160 94 156 88 128 Z"/>
      <path d="M98 110 C104 142 90 150 96 177 C88 160 78 156 84 128 Z"/>
      <path d="M85 116 C78 145 94 151 88 183 C100 158 106 140 100 118 Z"/>
    </g>
    <path d="M20 92 C24 48 58 26 91 26 C125 26 158 48 162 92 C145 109 122 115 91 115 C60 115 38 109 20 92 Z" fill="#F6C7B9" stroke="${stroke}" stroke-width="5"/>
    <path d="M26 88 C36 58 58 42 86 40 C74 52 67 70 67 91 C54 94 39 94 26 88 Z" fill="#FFE3D3" opacity="0.8"/>
    <g fill="#E58DAF" opacity="0.7"><circle cx="56" cy="63" r="4"/><circle cx="86" cy="50" r="3"/><circle cx="116" cy="62" r="4"/><circle cx="136" cy="80" r="2.6"/><circle cx="44" cy="80" r="2.6"/></g>
    <circle cx="70" cy="78" r="7" fill="${C.paper}" stroke="${stroke}" stroke-width="2.5"/><circle cx="70" cy="78" r="3" fill="${stroke}"/>
    <circle cx="110" cy="78" r="7" fill="${C.paper}" stroke="${stroke}" stroke-width="2.5"/><circle cx="110" cy="78" r="3" fill="${stroke}"/>
    <path d="M82 94 q8 6 16 0" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
  `, className);
}

export function fishingBoatSvg(className = ''): string {
  return svg('0 0 260 210', `
    <g class="boat-bob">
      <path d="M24 130 H236 L214 180 H48 Z" fill="#B87B48" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M36 147 H224 M48 164 H212" stroke="#8B5E3C" stroke-width="3" opacity="0.7"/>
      <path d="M90 130 V72 H174 V130" fill="#F4E8CF" stroke="${stroke}" stroke-width="4"/>
      <path d="M90 91 H174" stroke="${stroke}" stroke-width="3"/>
      <rect x="101" y="100" width="25" height="22" fill="#7FB6D9" stroke="${stroke}" stroke-width="2.5"/>
      <rect x="139" y="100" width="25" height="22" fill="#7FB6D9" stroke="${stroke}" stroke-width="2.5"/>
      <path d="M132 72 V25" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>
      <path d="M132 31 L186 52 L132 72 Z" fill="${C.sun}" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M137 73 C168 92 176 116 172 139" fill="none" stroke="#DDBB83" stroke-width="4" stroke-dasharray="3 7"/>
      <path d="M48 166 C58 190 78 199 96 190" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
      <circle cx="62" cy="133" r="4" fill="${C.paper}" opacity="0.55"/>
    </g>
  `, className);
}

export function shellPropSvg(className = ''): string {
  return svg('0 0 180 150', `
    <g class="shell-shimmer">
      <path d="M18 118 C18 58 50 22 90 22 C130 22 162 58 162 118 C142 135 38 135 18 118 Z" fill="#F6C7B9" stroke="${stroke}" stroke-width="5"/>
      <path d="M90 119 V28 M50 118 C52 78 62 49 90 28 M130 118 C128 78 118 49 90 28 M32 103 C42 68 57 44 90 28 M148 103 C138 68 123 44 90 28" fill="none" stroke="#C95745" stroke-width="3" opacity="0.8"/>
      <path d="M18 118 C44 126 136 126 162 118" fill="none" stroke="${stroke}" stroke-width="4"/>
      <circle cx="90" cy="78" r="22" fill="${C.paper}" stroke="${stroke}" stroke-width="3.5"/>
      <circle cx="82" cy="70" r="6" fill="#EAF7FF" opacity="0.8"/>
      <path d="M26 121 C38 140 62 147 90 147 C118 147 142 140 154 121" fill="none" stroke="${stroke}" stroke-width="3" opacity="0.4"/>
    </g>
  `, className);
}

export function coralPropSvg(color = '#F27059', className = ''): string {
  return svg('0 0 140 190', `
    <g class="coral-sway" fill="none" stroke="${stroke}" stroke-width="4">
      <path d="M70 182 V86 M70 125 C52 120 38 100 34 74 M70 108 C88 101 103 82 108 56 M70 145 C48 145 34 130 28 111 M70 155 C94 155 110 140 116 120" stroke-width="12" stroke-linecap="round" stroke="${color}"/>
      <path d="M70 182 V86 M70 125 C52 120 38 100 34 74 M70 108 C88 101 103 82 108 56" stroke="${color}" stroke-width="12" stroke-linecap="round"/>
    </g>
    <g fill="#FFD1B8" stroke="${stroke}" stroke-width="2">
      <circle cx="34" cy="70" r="9"/><circle cx="107" cy="54" r="8"/><circle cx="28" cy="108" r="7"/><circle cx="116" cy="116" r="8"/><circle cx="70" cy="82" r="7"/>
    </g>
    <g fill="#FFE7A0" opacity="0.8"><circle cx="35" cy="68" r="3"/><circle cx="108" cy="52" r="2.5"/><circle cx="29" cy="106" r="2.5"/><circle cx="117" cy="114" r="3"/></g>
    <path d="M46 182 H94" stroke="${stroke}" stroke-width="4" stroke-linecap="round" opacity="0.35"/>
  `, className);
}

export function diverPropSvg(className = ''): string {
  return svg('0 0 170 210', `
    <g class="diver-float">
      <path d="M48 72 C48 43 67 26 88 26 C109 26 128 43 128 72 C128 91 115 104 88 104 C61 104 48 91 48 72 Z" fill="#FFE7A0" stroke="${stroke}" stroke-width="5"/>
      <path d="M60 66 C60 45 73 35 88 35 C104 35 117 46 117 66 C117 80 105 88 88 88 C72 88 60 80 60 66 Z" fill="#B9E3EA" stroke="${stroke}" stroke-width="3.5"/>
      <path d="M70 57 C76 50 82 50 87 55" fill="none" stroke="${C.paper}" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
      <path d="M126 48 C146 42 154 53 144 63" fill="none" stroke="${stroke}" stroke-width="3.5"/>
      <path d="M58 109 C42 124 42 155 62 171 C84 183 106 178 122 168 C137 149 134 123 118 109 Z" fill="#2A9D8F" stroke="${stroke}" stroke-width="4"/>
      <path d="M58 128 C42 138 35 156 38 174 M118 128 C136 138 143 155 140 174" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>
      <path d="M62 171 L46 193 L77 185 M112 169 L128 193 L98 185" fill="#F6A25E" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 113 V162" stroke="${C.paper}" stroke-width="3" stroke-dasharray="2 6" opacity="0.7"/>
      <g fill="none" stroke="${C.paper}" stroke-width="2.5" opacity="0.65"><circle cx="137" cy="92" r="5"/><circle cx="147" cy="72" r="3.5"/><circle cx="135" cy="55" r="2.5"/></g>
    </g>
  `, className);
}

export function submarinePropSvg(className = ''): string {
  return svg('0 0 260 170', `
    <g class="submarine-body">
      <path d="M22 88 C22 52 68 28 132 28 C196 28 238 52 238 88 C238 124 196 146 132 146 C68 146 22 124 22 88 Z" fill="${C.sun}" stroke="${stroke}" stroke-width="5"/>
      <path d="M40 76 C52 50 86 40 122 40 C158 40 194 50 212 76" fill="none" stroke="${C.paper}" stroke-width="6" stroke-linecap="round" opacity="0.55"/>
      <g fill="#7FB6D9" stroke="${stroke}" stroke-width="3">
        <circle cx="82" cy="88" r="17"/><circle cx="132" cy="88" r="17"/><circle cx="182" cy="88" r="17"/>
      </g>
      <g fill="rgba(255,255,255,0.45)"><circle cx="78" cy="83" r="4"/><circle cx="128" cy="83" r="4"/><circle cx="178" cy="83" r="4"/></g>
      <path d="M132 28 V8 H152 V30" fill="${C.coral}" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M132 8 h20 v10 h-20" fill="${C.teal}" stroke="${stroke}" stroke-width="2.5"/>
      <g class="sub-propeller"><path d="M238 88 L258 66 V110 Z" fill="${C.coral}" stroke="${stroke}" stroke-width="3.5"/><path d="M248 88 H260" stroke="${stroke}" stroke-width="3"/></g>
      <path d="M22 88 H7 V76 H22 M22 88 H7 V100 H22" fill="#B9C7D0" stroke="${stroke}" stroke-width="3"/>
      <circle cx="154" cy="42" r="5" fill="${C.paper}" stroke="${stroke}" stroke-width="2"/>
      <path d="M48 122 C76 137 140 142 190 130" fill="none" stroke="#F6A25E" stroke-width="3" opacity="0.6"/>
    </g>
  `, className);
}

export function treasureChestSvg(className = ''): string {
  return svg('0 0 180 150', `
    <ellipse cx="90" cy="137" rx="70" ry="9" fill="${C.ink}" opacity="0.12"/>
    <path d="M24 69 C24 38 52 24 90 24 C128 24 156 38 156 69 V82 H24 Z" fill="#B87B48" stroke="${stroke}" stroke-width="5"/>
    <path d="M24 82 H156 V130 H24 Z" fill="#A9784F" stroke="${stroke}" stroke-width="5"/>
    <path d="M24 82 H156 M38 69 V130 M142 69 V130" stroke="${stroke}" stroke-width="4"/>
    <path d="M24 69 H156" stroke="#E3B982" stroke-width="5" opacity="0.7"/>
    <rect x="75" y="66" width="30" height="34" rx="4" fill="${C.sun}" stroke="${stroke}" stroke-width="3.5"/>
    <circle cx="90" cy="82" r="4" fill="${stroke}"/>
    <g fill="${C.sun}" stroke="${stroke}" stroke-width="2.5"><circle cx="47" cy="102" r="7"/><circle cx="61" cy="113" r="5"/><circle cx="127" cy="104" r="6"/></g>
    <path d="M38 118 H142" stroke="#E3B982" stroke-width="3" opacity="0.65"/>
  `, className);
}

export function seahorsePropSvg(className = '', width = 140, height = 220): string {
  return svg('0 0 140 220', `
    <g class="seahorse-bob">
      <path d="M68 38 C52 46 46 64 54 79 C61 92 78 94 89 84 C103 70 105 48 96 35 C87 22 74 24 68 38 Z" fill="#F6A25E" stroke="${stroke}" stroke-width="4"/>
      <path d="M96 42 C111 34 124 44 120 57 C116 68 106 71 98 65" fill="#FFD1B8" stroke="${stroke}" stroke-width="3.5"/>
      <circle cx="102" cy="43" r="4" fill="${stroke}"/>
      <path d="M68 75 C55 97 56 123 70 143 C83 161 77 184 64 197 C55 206 39 202 36 190 C33 178 45 172 51 180 C56 187 63 178 59 168 C53 150 70 140 77 124 C86 105 82 87 76 74" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>
      <path d="M55 97 C43 100 39 116 48 123 M73 108 C62 112 60 128 69 135 M65 137 C54 142 55 156 65 162" fill="none" stroke="#FFD1B8" stroke-width="4" stroke-linecap="round"/>
      <path d="M78 57 C89 52 100 56 102 66 C103 76 94 82 85 78 C77 74 74 63 78 57 Z" fill="#FFD1B8" stroke="${stroke}" stroke-width="3"/>
      <path d="M68 34 L60 20 L74 27 M78 32 L80 16 L88 30" fill="#FFC94A" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M57 69 C50 65 44 66 39 72 C46 76 52 78 59 78 Z" fill="#E8834E" stroke="${stroke}" stroke-width="3"/>
      <circle cx="76" cy="52" r="4" fill="${stroke}"/><circle cx="75" cy="51" r="1.3" fill="${C.paper}"/>
      <path d="M80 66 q6 3 10 0" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
    </g>
  `, className, width, height);
}

export function octopusPropSvg(className = '', width = 230, height = 200): string {
  return svg('0 0 230 200', `
    <g class="octopus-body">
      <path d="M48 82 C48 38 78 14 115 14 C152 14 182 38 182 82 C182 112 162 128 115 128 C68 128 48 112 48 82 Z" fill="#C78BDB" stroke="${stroke}" stroke-width="5"/>
      <path d="M72 48 C84 30 104 24 120 26 C102 36 92 50 89 68 C78 63 70 56 72 48 Z" fill="#E7C7F1" opacity="0.8"/>
      <g fill="#A96AC3" opacity="0.65"><circle cx="76" cy="85" r="5"/><circle cx="99" cy="72" r="4"/><circle cx="123" cy="84" r="5"/><circle cx="148" cy="72" r="4"/><circle cx="160" cy="100" r="3"/></g>
      <circle cx="91" cy="78" r="12" fill="${C.paper}" stroke="${stroke}" stroke-width="3.5"/><circle cx="139" cy="78" r="12" fill="${C.paper}" stroke="${stroke}" stroke-width="3.5"/>
      <circle cx="94" cy="78" r="5" fill="${stroke}"/><circle cx="142" cy="78" r="5" fill="${stroke}"/>
      <circle cx="92" cy="76" r="1.5" fill="${C.paper}"/><circle cx="140" cy="76" r="1.5" fill="${C.paper}"/>
      <path d="M106 102 q10 8 20 0" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
    </g>
    <g class="octopus-arms" fill="none" stroke="${stroke}" stroke-width="5" stroke-linecap="round">
      <path d="M56 112 C30 120 18 144 26 164 C34 180 52 182 62 170" stroke="#B478CB"/>
      <path d="M75 122 C60 142 56 166 66 184 C74 196 90 194 94 180" stroke="#C78BDB"/>
      <path d="M98 128 C94 152 100 176 113 190 M119 128 C124 150 122 172 116 190" stroke="#B478CB"/>
      <path d="M139 124 C154 144 158 168 148 184 C140 196 124 194 120 180" stroke="#C78BDB"/>
      <path d="M160 114 C186 122 198 146 190 166 C182 182 164 184 154 172" stroke="#B478CB"/>
    </g>
    <g class="octopus-suckers" fill="#FFD1B8">
      <circle cx="31" cy="144" r="3"/><circle cx="36" cy="159" r="2.5"/><circle cx="48" cy="169" r="2.5"/>
      <circle cx="66" cy="153" r="3"/><circle cx="70" cy="171" r="2.5"/><circle cx="82" cy="184" r="2.5"/>
      <circle cx="102" cy="153" r="3"/><circle cx="108" cy="171" r="2.5"/><circle cx="130" cy="154" r="3"/>
      <circle cx="152" cy="148" r="2.5"/><circle cx="164" cy="162" r="2.5"/>
    </g>
  `, className, width, height);
}

export function mantaPropSvg(className = '', width = 280, height = 150): string {
  return svg('0 0 280 150', `
    <g class="manta-glide">
      <path d="M140 34 C110 34 91 46 69 48 C38 51 12 70 22 82 C35 97 71 85 91 91 C107 96 122 110 140 110 C158 110 173 96 189 91 C209 85 245 97 258 82 C268 70 242 51 211 48 C189 46 170 34 140 34 Z" fill="#6B7FA8" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M140 39 C107 39 96 58 95 86 C100 104 118 119 140 120 C162 119 180 104 185 86 C184 58 173 39 140 39 Z" fill="#8EA4C7" stroke="${stroke}" stroke-width="4"/>
      <path d="M126 44 C118 30 104 24 97 31 C92 38 103 48 116 53" fill="#8EA4C7" stroke="${stroke}" stroke-width="4"/>
      <path d="M154 44 C162 30 176 24 183 31 C188 38 177 48 164 53" fill="#8EA4C7" stroke="${stroke}" stroke-width="4"/>
      <path d="M140 120 V144" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round"/>
      <g fill="${stroke}"><circle cx="126" cy="57" r="3.5"/><circle cx="154" cy="57" r="3.5"/></g>
      <g stroke="#4A6080" stroke-width="2" opacity="0.7"><path d="M112 91 H126 M111 97 H126 M111 103 H125"/><path d="M168 91 H182 M168 97 H183 M168 103 H184"/></g>
      <path d="M88 60 C62 60 40 69 34 77 M192 60 C218 60 240 69 246 77" fill="none" stroke="#A7B8D8" stroke-width="2.5" opacity="0.7"/>
    </g>
  `, className, width, height);
}

export function anemonePropSvg(className = '', width = 170, height = 190): string {
  return svg('0 0 170 190', `
    <g class="anemone-sway">
      <path d="M42 176 C30 155 35 137 53 127 C72 116 100 116 118 127 C136 138 141 157 129 176 Z" fill="#D96C78" stroke="${stroke}" stroke-width="4"/>
      <g fill="#F6A9B8" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round">
        <path d="M52 132 C30 118 27 94 38 77"/><path d="M63 126 C49 105 52 78 66 62"/><path d="M78 122 C68 98 75 70 88 53"/>
        <path d="M94 121 C91 94 102 67 114 52"/><path d="M110 124 C116 99 130 79 141 68"/><path d="M122 132 C136 117 150 109 158 108"/>
        <path d="M64 137 C44 138 27 129 20 116"/><path d="M108 137 C128 138 146 128 152 116"/>
      </g>
      <g fill="#FFD1B8" opacity="0.9">
        <circle cx="38" cy="76" r="7"/><circle cx="66" cy="61" r="6"/><circle cx="88" cy="51" r="6"/><circle cx="114" cy="51" r="7"/><circle cx="141" cy="67" r="6"/><circle cx="158" cy="107" r="6"/>
      </g>
      <path d="M48 178 C72 168 101 168 125 178" fill="none" stroke="${stroke}" stroke-width="3" opacity="0.4"/>
    </g>
  `, className, width, height);
}

export function kelpPropSvg(className = '', width = 120, height = 250): string {
  return svg('0 0 120 250', `
    <g class="kelp-sway" fill="none" stroke="#4D8A43" stroke-width="4">
      <path d="M50 248 C36 199 58 160 43 119 C35 92 50 63 59 36" stroke-width="13" stroke-linecap="round"/>
      <path d="M55 210 C76 197 94 203 102 219 C81 225 63 222 55 210 Z" fill="#79B85A" stroke-width="3"/>
      <path d="M46 170 C25 155 20 132 32 116 C47 123 54 145 46 170 Z" fill="#8FCB72" stroke-width="3"/>
      <path d="M48 119 C29 103 32 81 48 71 C61 83 61 104 48 119 Z" fill="#79B85A" stroke-width="3"/>
      <path d="M57 153 C73 135 91 134 101 146 C90 163 71 167 57 153 Z" fill="#A9D98E" stroke-width="3"/>
      <path d="M45 73 C31 55 38 36 53 32 C61 48 57 65 45 73 Z" fill="#8FCB72" stroke-width="3"/>
      <path d="M72 228 C64 199 76 180 91 174 C97 197 88 218 72 228 Z" fill="#79B85A" stroke-width="3"/>
    </g>
    <g fill="rgba(255,255,255,0.55)"><circle cx="76" cy="92" r="5"/><circle cx="81" cy="74" r="3"/><circle cx="90" cy="112" r="4"/></g>
  `, className, width, height);
}

export function blueFishPropSvg(className = '', number?: number): string {
  return svg('0 0 180 130', `
    <g class="fish-tail">
      <path d="M26 66 C10 44 2 40 7 66 C2 92 10 88 26 66 Z" fill="${C.sun}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
    </g>
    <path d="M28 66 C28 36 60 24 96 28 C132 32 158 46 160 66 C158 86 132 100 96 104 C60 108 28 96 28 66 Z" fill="#5BAED0" stroke="${stroke}" stroke-width="4"/>
    <path d="M76 30 C68 17 84 8 100 18 L114 30 Z" fill="${C.teal}" stroke="${stroke}" stroke-width="3.5"/>
    <path d="M67 96 C56 110 70 119 86 109 L98 100 Z" fill="${C.sun}" stroke="${stroke}" stroke-width="3.5"/>
    <path d="M94 62 C110 49 127 54 133 66 C127 80 110 85 94 72" fill="#EAF7FF" stroke="${stroke}" stroke-width="3"/>
    <g fill="none" stroke="#2A7FA0" stroke-width="3" opacity="0.8"><path d="M48 52 q8 15 0 30 M64 47 q8 17 0 34 M80 44 q8 19 0 38"/></g>
    <g fill="${C.sun}" opacity="0.9"><circle cx="54" cy="74" r="3"/><circle cx="72" cy="62" r="2.6"/><circle cx="88" cy="84" r="2.4"/></g>
    <circle cx="138" cy="58" r="5.5" fill="${C.paper}" stroke="${stroke}" stroke-width="2.5"/><circle cx="139" cy="58" r="2.2" fill="${stroke}"/>
    <path d="M154 66 q5 5 0 10" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
    ${number !== undefined ? `<g transform="translate(76 68)"><circle r="15" fill="${C.paper}" stroke="${stroke}" stroke-width="3"/><text y="7" text-anchor="middle" font-family="Arial Rounded MT Bold, sans-serif" font-size="20" fill="${stroke}">${number}</text></g>` : ''}
  `, className);
}

export function pufferFishPropSvg(className = '', number?: number): string {
  return svg('0 0 180 140', `
    <g class="fish-tail">
      <path d="M28 70 C10 46 0 44 6 70 C0 96 10 94 28 70 Z" fill="${C.sun}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
    </g>
    <path d="M42 72 C42 38 70 20 102 20 C136 20 162 40 162 72 C162 104 136 122 102 122 C70 122 42 106 42 72 Z" fill="#F6C7B9" stroke="${stroke}" stroke-width="4"/>
    <path d="M54 60 C55 34 74 24 92 24 C78 38 72 56 72 74 C63 74 57 68 54 60 Z" fill="#FFE8DE" opacity="0.8"/>
    <g fill="#E58DAF" opacity="0.8"><circle cx="76" cy="88" r="4"/><circle cx="94" cy="102" r="3"/><circle cx="118" cy="92" r="4"/><circle cx="140" cy="80" r="3"/></g>
    <g stroke="#C95745" stroke-width="4" stroke-linecap="round">
      <path d="M58 43 L48 30"/><path d="M82 27 L80 12"/><path d="M112 22 L118 8"/><path d="M140 32 L154 20"/><path d="M57 99 L44 112"/><path d="M142 100 L156 113"/>
    </g>
    <g fill="${C.sun}"><circle cx="48" cy="30" r="3"/><circle cx="80" cy="12" r="3"/><circle cx="118" cy="8" r="3"/><circle cx="154" cy="20" r="3"/><circle cx="44" cy="112" r="3"/><circle cx="156" cy="113" r="3"/></g>
    <path d="M129 52 C142 46 154 52 156 63 C153 73 143 76 133 69" fill="#F6A25E" stroke="${stroke}" stroke-width="3"/>
    <circle cx="146" cy="55" r="5.5" fill="${C.paper}" stroke="${stroke}" stroke-width="2.5"/><circle cx="147" cy="55" r="2.2" fill="${stroke}"/>
    <path d="M156 72 q6 6 0 12" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M74 78 q12 8 24 0" fill="none" stroke="${stroke}" stroke-width="2.8" stroke-linecap="round"/>
    ${number !== undefined ? `<g transform="translate(96 74)"><circle r="15" fill="${C.paper}" stroke="${stroke}" stroke-width="3"/><text y="7" text-anchor="middle" font-family="Arial Rounded MT Bold, sans-serif" font-size="20" fill="${stroke}">${number}</text></g>` : ''}
  `, className);
}

export function objectSvg(kind: ObjectKind, className = 'object-svg'): string {
  switch (kind) {
    case 'fossil':
      return svg('0 0 120 100', `
        <path d="M12 76 C20 34 48 12 88 18 C108 22 114 38 102 55 C91 70 68 82 40 84 C25 85 15 82 12 76 Z" fill="#D8C5A3" stroke="${stroke}" stroke-width="4"/>
        <path d="M38 32 C34 47 40 60 56 65 C72 70 84 62 88 50" fill="none" stroke="#B49B74" stroke-width="5" stroke-linecap="round"/>
        <path d="M52 28 C46 38 48 47 56 52 C66 57 76 52 80 43" fill="none" stroke="#F4E6CB" stroke-width="4" stroke-linecap="round"/>
        <circle cx="92" cy="32" r="4" fill="#B49B74"/><circle cx="28" cy="62" r="3" fill="#B49B74"/>
      `, className);
    case 'planet':
      return svg('0 0 120 120', `
        <circle cx="60" cy="60" r="38" fill="${C.teal}" stroke="${stroke}" stroke-width="4"/>
        <ellipse cx="60" cy="60" rx="54" ry="14" transform="rotate(-18 60 60)" fill="none" stroke="${C.sun}" stroke-width="8" opacity="0.9"/>
        <ellipse cx="60" cy="60" rx="54" ry="14" transform="rotate(-18 60 60)" fill="none" stroke="${stroke}" stroke-width="2"/>
        <path d="M44 42 C50 30 70 26 82 38 C90 46 88 60 78 68" fill="none" stroke="${C.paper}" stroke-width="4" opacity="0.55"/>
        <circle cx="46" cy="48" r="3" fill="${C.paper}" opacity="0.7"/>
      `, className);
    case 'note':
      return svg('0 0 110 120', `
        <path d="M42 22 L91 12 V76" fill="none" stroke="${C.grapeDark}" stroke-width="8" stroke-linejoin="round"/>
        <path d="M42 22 V84" fill="none" stroke="${C.grapeDark}" stroke-width="8" stroke-linecap="round"/>
        <ellipse cx="29" cy="88" rx="18" ry="13" transform="rotate(-18 29 88)" fill="${C.coral}" stroke="${stroke}" stroke-width="3.5"/>
        <ellipse cx="78" cy="79" rx="18" ry="13" transform="rotate(-18 78 79)" fill="${C.coral}" stroke="${stroke}" stroke-width="3.5"/>
        <path d="M46 38 L86 30" stroke="${C.paper}" stroke-width="4" opacity="0.55"/>
      `, className);
    case 'donut':
      return svg('0 0 120 120', `
        <circle cx="60" cy="60" r="43" fill="#D99A5C" stroke="${stroke}" stroke-width="4"/>
        <path d="M25 55 C30 28 55 15 78 23 C94 29 103 44 98 60 C88 44 67 39 51 46 C38 51 29 58 25 55 Z" fill="${C.rose}" stroke="${stroke}" stroke-width="3.5"/>
        <circle cx="60" cy="60" r="15" fill="${C.cream}" stroke="${stroke}" stroke-width="4"/>
        <g fill="${C.paper}" opacity="0.9">
          <rect x="40" y="35" width="4" height="13" rx="2" transform="rotate(-28 42 42)"/>
          <rect x="76" y="39" width="4" height="13" rx="2" transform="rotate(26 78 46)"/>
          <rect x="84" y="63" width="4" height="12" rx="2" transform="rotate(70 86 69)"/>
          <rect x="55" y="26" width="4" height="12" rx="2" transform="rotate(10 57 32)"/>
        </g>
      `, className);
    case 'starfish':
      return starfishPropSvg(className);
    case 'fish':
      return clownFishSvg(className);
    case 'pearl':
      return shellPropSvg(className);
    case 'flower':
      return svg('0 0 100 130', `
        <path d="M50 50 C47 76 47 100 50 126" fill="none" stroke="${C.leafDark}" stroke-width="7" stroke-linecap="round"/>
        <path d="M48 86 C22 78 12 62 16 50 C36 50 50 64 52 78 Z" fill="${C.leaf}" stroke="${stroke}" stroke-width="3.5"/>
        <path d="M52 102 C74 92 84 78 80 64 C62 64 49 77 46 90 Z" fill="${C.leaf}" stroke="${stroke}" stroke-width="3.5"/>
        <g transform="translate(50 36)">
          <circle cx="0" cy="-25" r="18" fill="${C.coral}" stroke="${stroke}" stroke-width="3.5"/>
          <circle cx="24" cy="-8" r="18" fill="${C.coral}" stroke="${stroke}" stroke-width="3.5"/>
          <circle cx="15" cy="20" r="18" fill="${C.coral}" stroke="${stroke}" stroke-width="3.5"/>
          <circle cx="-15" cy="20" r="18" fill="${C.coral}" stroke="${stroke}" stroke-width="3.5"/>
          <circle cx="-24" cy="-8" r="18" fill="${C.coral}" stroke="${stroke}" stroke-width="3.5"/>
          <circle r="15" fill="${C.sun}" stroke="${stroke}" stroke-width="3.5"/>
          <circle cx="-5" cy="-5" r="5" fill="#FFE49B"/>
        </g>
      `, className);
    case 'strawberry':
      return svg('0 0 110 110', `
        <path d="M55 92 C28 78 16 54 26 38 C36 22 50 30 55 36 C60 30 74 22 84 38 C94 54 82 78 55 92 Z" fill="${C.coral}" stroke="${stroke}" stroke-width="4"/>
        <path d="M55 38 C48 30 38 27 32 31 C37 23 48 19 55 24 C62 19 73 23 78 31 C72 27 62 30 55 38 Z" fill="${C.leaf}" stroke="${stroke}" stroke-width="3"/>
        <path d="M55 20 L55 7" stroke="${C.leafDark}" stroke-width="4" stroke-linecap="round"/>
        <g fill="#FFE9A8">
          <ellipse cx="43" cy="52" rx="3" ry="5"/><ellipse cx="61" cy="49" rx="3" ry="5"/>
          <ellipse cx="52" cy="68" rx="3" ry="5"/><ellipse cx="72" cy="64" rx="3" ry="5"/>
          <ellipse cx="35" cy="68" rx="3" ry="5"/><ellipse cx="58" cy="82" rx="3" ry="5"/>
        </g>
        <circle cx="45" cy="43" r="4" fill="#FF9B87" opacity="0.7"/>
      `, className);
    case 'candy':
      return svg('0 0 120 90', `
        <path d="M32 45 L8 22 L4 66 Z" fill="${C.grape}" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M88 45 L112 22 L116 66 Z" fill="${C.coral}" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
        <ellipse cx="60" cy="45" rx="32" ry="27" fill="${C.sun}" stroke="${stroke}" stroke-width="4"/>
        <path d="M39 34 C51 23 70 30 74 44 C78 59 63 69 49 61" fill="none" stroke="${C.coral}" stroke-width="8" stroke-linecap="round"/>
        <circle cx="48" cy="37" r="5" fill="${C.paper}" opacity="0.8"/>
      `, className);
    case 'star':
      return svg('0 0 100 100', `
        <path d="M50 9 L60 34 L87 37 L67 55 L73 82 L50 68 L27 82 L33 55 L13 37 L40 34 Z" fill="${C.sun}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="38" cy="33" r="4" fill="#FFE9A8"/>
      `, className);
    case 'apple':
      return svg('0 0 100 110', `
        <path d="M50 35 C36 18 12 28 15 55 C18 82 36 99 50 101 C64 99 82 82 85 55 C88 28 64 18 50 35 Z" fill="${C.coral}" stroke="${stroke}" stroke-width="4"/>
        <path d="M50 34 C50 22 54 12 65 7" fill="none" stroke="${C.brown}" stroke-width="5" stroke-linecap="round"/>
        <path d="M53 21 C64 8 84 8 88 20 C79 33 62 31 53 21 Z" fill="${C.leaf}" stroke="${stroke}" stroke-width="3.5"/>
        <circle cx="35" cy="45" r="7" fill="#FF9B87" opacity="0.65"/>
      `, className);
    case 'acorn':
      return svg('0 0 100 110', `
        <path d="M50 29 C30 31 20 47 23 65 C26 86 40 102 50 105 C60 102 74 86 77 65 C80 47 70 31 50 29 Z" fill="#B9875B" stroke="${stroke}" stroke-width="4"/>
        <path d="M24 42 C26 18 42 10 50 10 C58 10 74 18 76 42 C64 50 36 50 24 42 Z" fill="${C.brown}" stroke="${stroke}" stroke-width="4"/>
        <path d="M50 10 L50 3" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>
        <path d="M34 30 h32 M30 38 h40" stroke="#C9956B" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
      `, className);
  }
}

export function patternIconSvg(value: string): string {
  if (/^\d+$/.test(value)) {
    return svg('0 0 100 100', `<text x="50" y="80" text-anchor="middle" font-family="'Fredoka','Arial Rounded MT Bold',sans-serif" font-size="86" font-weight="600" fill="${C.ink}">${esc(value)}</text>`, 'pattern-svg number-pattern');
  }
  switch (value) {
    case 'moon':
      return svg('0 0 100 100', `
        <path d="M64 15 C35 20 20 45 29 67 C38 88 65 95 82 80 C61 82 45 67 46 49 C47 34 54 23 64 15 Z" fill="${C.sun}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="37" cy="31" r="4" fill="#FFE9A8"/>
      `, 'pattern-svg');
    case 'star':
      return svg('0 0 100 100', `<path d="M50 9 L60 34 L87 37 L67 55 L73 82 L50 68 L27 82 L33 55 L13 37 L40 34 Z" fill="${C.sun}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>`, 'pattern-svg');
    case 'cloud':
      return svg('0 0 120 100', `
        <path d="M21 74 C7 58 17 37 38 35 C44 15 76 13 88 32 C108 29 124 45 116 63 C126 76 116 88 96 89 L36 89 C23 88 16 82 21 74 Z" fill="${C.paper}" stroke="${stroke}" stroke-width="4"/>
        <path d="M38 69 C46 55 67 55 73 68" fill="none" stroke="${C.sky}" stroke-width="4" stroke-linecap="round"/>
      `, 'pattern-svg');
    case 'sun':
      return svg('0 0 100 100', `
        <circle cx="50" cy="50" r="25" fill="${C.sun}" stroke="${stroke}" stroke-width="4"/>
        <g stroke="${C.sunDeep}" stroke-width="4" stroke-linecap="round">
          <path d="M50 9 v12"/><path d="M50 79 v12"/><path d="M9 50 h12"/><path d="M79 50 h12"/>
          <path d="M21 21 l9 9"/><path d="M70 70 l9 9"/><path d="M79 21 l-9 9"/><path d="M30 70 l-9 9"/>
        </g>
        <circle cx="41" cy="41" r="6" fill="#FFE9A8"/>
      `, 'pattern-svg');
    case 'fish':
      return svg('0 0 110 90', `
        <path d="M16 45 C2 30 -2 50 8 59 C14 65 24 60 29 54 Z" fill="${C.sun}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M35 45 C35 28 55 19 76 22 C99 26 110 38 110 45 C110 54 98 67 76 70 C55 73 35 62 35 45 Z" fill="${C.coral}" stroke="${stroke}" stroke-width="4"/>
        <circle cx="92" cy="38" r="4" fill="${C.ink}"/><circle cx="91" cy="36" r="1.5" fill="${C.paper}"/>
        <path d="M55 24 L68 12 L75 27 Z" fill="${C.sun}" stroke="${stroke}" stroke-width="3"/>
      `, 'pattern-svg');
    case 'note':
      return objectSvg('note', 'pattern-svg');
    case 'donut':
      return objectSvg('donut', 'pattern-svg');
    case 'planet':
      return objectSvg('planet', 'pattern-svg');
    case 'fossil':
      return objectSvg('fossil', 'pattern-svg');
    case 'shell':
      return svg('0 0 100 100', `
        <path d="M14 58 C14 30 35 15 50 15 C65 15 86 30 86 58 L81 71 C64 82 36 82 19 71 Z" fill="${C.rose}" stroke="${stroke}" stroke-width="4"/>
        <path d="M18 56 C31 44 69 44 82 56 M27 36 L36 70 M50 22 L50 77 M73 36 L64 70" fill="none" stroke="${stroke}" stroke-width="2.5" opacity="0.5"/>
        <circle cx="50" cy="58" r="10" fill="${C.paper}" stroke="${stroke}" stroke-width="2.5"/>
      `, 'pattern-svg');
    default:
      return svg('0 0 100 100', `<circle cx="50" cy="50" r="34" fill="${C.paper}" stroke="${stroke}" stroke-width="4"/>`, 'pattern-svg');
  }
}

export type IconName =
  | 'star' | 'lock' | 'speaker' | 'home' | 'map' | 'play' | 'back' | 'check'
  | 'parent' | 'sound' | 'music' | 'eye' | 'reset' | 'exit' | 'settings' | 'up' | 'down' | 'left' | 'right';

export function iconSvg(name: IconName, className = 'ui-icon'): string {
  const path = (() => {
    switch (name) {
      case 'star': return `<path d="M16 3 L20 11 L29 12 L22 18 L24 27 L16 22 L8 27 L10 18 L3 12 L12 11 Z" fill="${C.sun}" stroke="${C.ink}" stroke-width="2" stroke-linejoin="round"/>`;
      case 'lock': return `<rect x="6" y="13" width="20" height="16" rx="5" fill="${C.cream}" stroke="${C.ink}" stroke-width="2.5"/><path d="M11 13 V9 C11 2 21 2 21 9 V13" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="21" r="2.4" fill="${C.ink}"/>`;
      case 'speaker': return `<path d="M5 13 L11 13 L18 7 L18 25 L11 19 L5 19 Z" fill="${C.ink}"/><path d="M22 12 C27 16 27 20 22 24 M26 8 C34 15 34 21 26 28" fill="none" stroke="${C.ink}" stroke-width="2.5" stroke-linecap="round"/>`;
      case 'home': return `<path d="M4 15 L16 5 L28 15 V27 H20 V19 H12 V27 H4 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round"/>`;
      case 'map': return `<path d="M4 8 L12 5 L20 8 L28 5 V26 L20 29 L12 26 L4 29 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round"/><path d="M10 24 C14 18 18 20 23 12" fill="none" stroke="${C.coral}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="2 4"/>`;
      case 'play': return `<path d="M10 6 L25 16 L10 26 Z" fill="${C.teal}" stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round"/>`;
      case 'back': return `<path d="M18 6 L7 16 L18 26 M7 16 H28" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
      case 'check': return `<circle cx="16" cy="16" r="12" fill="${C.leaf}" stroke="${C.ink}" stroke-width="2.5"/><path d="M9 16 L14 21 L23 10" fill="none" stroke="${C.paper}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
      case 'parent': return `<path d="M6 12 C6 6 10 3 16 3 C22 3 26 6 26 12 V18 H6 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="2.5"/><path d="M10 19 L8 28 L24 28 L22 19" fill="${C.teal}" stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="16" cy="12" r="3" fill="${C.ink}"/>`;
      case 'sound': return `<path d="M5 13 H11 L18 7 V25 L11 19 H5 Z" fill="${C.sun}" stroke="${C.ink}" stroke-width="2.2"/><path d="M22 11 C27 15 27 19 22 23" fill="none" stroke="${C.ink}" stroke-width="2.5" stroke-linecap="round"/>`;
      case 'music': return `<path d="M12 7 L26 4 V19" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/><circle cx="9" cy="23" r="4" fill="${C.coral}" stroke="${C.ink}" stroke-width="2"/><circle cx="23" cy="20" r="4" fill="${C.coral}" stroke="${C.ink}" stroke-width="2"/>`;
      case 'eye': return `<path d="M3 16 C8 8 24 8 29 16 C24 24 8 24 3 16 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="2.5"/><circle cx="16" cy="16" r="4" fill="${C.ink}"/>`;
      case 'reset': return `<path d="M8 9 C12 3 24 4 26 14 C28 24 18 29 10 24" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/><path d="M4 6 L8 12 L13 7" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
      case 'exit': return `<path d="M15 4 H27 V28 H15" fill="none" stroke="${C.ink}" stroke-width="2.8" stroke-linejoin="round"/><path d="M5 16 H20 M14 10 L20 16 L14 22" fill="none" stroke="${C.coralDark}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
      case 'settings': return `<circle cx="16" cy="16" r="5" fill="${C.cream}" stroke="${C.ink}" stroke-width="2.5"/><path d="M16 3 V8 M16 24 V29 M3 16 H8 M24 16 H29 M7 7 L11 11 M21 21 L25 25 M25 7 L21 11 M11 21 L7 25" stroke="${C.ink}" stroke-width="2.5" stroke-linecap="round"/>`;
      case 'up': return `<path d="M16 27 V6 M7 15 L16 6 L25 15" fill="none" stroke="${C.ink}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
      case 'down': return `<path d="M16 5 V26 M7 17 L16 26 L25 17" fill="none" stroke="${C.ink}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
      case 'left': return `<path d="M27 16 H6 M15 7 L6 16 L15 25" fill="none" stroke="${C.ink}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
      case 'right': return `<path d="M5 16 H26 M17 7 L26 16 L17 25" fill="none" stroke="${C.ink}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  })();
  return svg('0 0 32 32', path, className);
}

export function remoteSvg(activeKey: 'left' | 'right' | 'ok' | 'up' | null = null): string {
  const active = (key: string): string => activeKey === key ? 'is-active' : '';
  return svg('0 0 260 520', `
    <rect x="38" y="8" width="184" height="504" rx="88" fill="${C.paper}" stroke="${C.ink}" stroke-width="7"/>
    <rect x="63" y="35" width="134" height="58" rx="29" fill="${C.teal}" stroke="${C.ink}" stroke-width="4"/>
    <text x="130" y="74" text-anchor="middle" font-family="'ZCOOL KuaiLe','PingFang SC',sans-serif" font-size="26" fill="${C.paper}">数字岛</text>
    <g class="${active('up')}">
      <circle cx="130" cy="151" r="34" fill="${C.cream}" stroke="${C.ink}" stroke-width="5"/>
      <path d="M130 167 V136 M114 151 L130 134 L146 151" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <g transform="translate(130 240)">
      <g class="${active('left')}" transform="translate(-78 0)"><circle r="27" fill="${C.cream}" stroke="${C.ink}" stroke-width="5"/><path d="M8 0 H-8 M-2 -7 L-9 0 L-2 7" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g class="${active('ok')}"><circle r="38" fill="${C.sun}" stroke="${C.ink}" stroke-width="5"/><text x="0" y="8" text-anchor="middle" font-family="'Fredoka','Arial Rounded MT Bold',sans-serif" font-size="23" font-weight="600" fill="${C.ink}">OK</text></g>
      <g class="${active('right')}" transform="translate(78 0)"><circle r="27" fill="${C.cream}" stroke="${C.ink}" stroke-width="5"/><path d="M-8 0 H8 M2 -7 L9 0 L2 7" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>
    </g>
    <g transform="translate(130 344)">
      <circle r="33" fill="${C.cream}" stroke="${C.ink}" stroke-width="5"/>
      <path d="M-5 9 H5 M-3 1 H3" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>
    </g>
    <text x="130" y="421" text-anchor="middle" font-family="'PingFang SC','Noto Sans SC',sans-serif" font-size="20" fill="${C.ink}" opacity="0.55">左右选择 · OK 确定</text>
    <text x="130" y="453" text-anchor="middle" font-family="'PingFang SC','Noto Sans SC',sans-serif" font-size="20" fill="${C.ink}" opacity="0.55">上键再听一遍</text>
    <circle cx="130" cy="488" r="5" fill="${C.coral}" opacity="0.35"/>
  `, 'remote-svg');
}

export type PlaneTone = 0 | 1 | 2;

/**
 * A small top-down paper plane for the sky battle. The player has a fox pilot;
 * the three enemy planes use different wing colours so they are easy to track.
 */
export function planeSvg(variant: 'player' | 'enemy' = 'player', className = '', tone: PlaneTone = 0): string {
  const enemyPalettes = [
    { body: C.coral, wing: C.cream, trim: C.coralDark },
    { body: C.grape, wing: C.cream, trim: C.grapeDark },
    { body: C.teal, wing: C.cream, trim: C.tealDark },
  ];
  const palette = variant === 'player'
    ? { body: C.sun, wing: C.cream, trim: C.coralDark }
    : enemyPalettes[tone % enemyPalettes.length];
  const pilot = variant === 'player'
    ? `<g class="pilot-fox">
        <path d="M128 96 L116 72 L145 84 Z" fill="${C.orange}" stroke="${C.ink}" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M172 96 L184 72 L155 84 Z" fill="${C.orange}" stroke="${C.ink}" stroke-width="3.5" stroke-linejoin="round"/>
        <circle cx="150" cy="105" r="26" fill="${C.orange}" stroke="${C.ink}" stroke-width="4"/>
        <path d="M137 101 q5 -8 12 0 q-7 5 -12 0 Z M151 101 q5 -8 12 0 q-7 5 -12 0 Z" fill="${C.ink}"/>
        <path d="M146 113 q4 4 8 0" fill="none" stroke="${C.ink}" stroke-width="2.8" stroke-linecap="round"/>
        <circle cx="132" cy="111" r="4" fill="${C.rose}" opacity="0.8"/><circle cx="168" cy="111" r="4" fill="${C.rose}" opacity="0.8"/>
      </g>`
    : `<g class="pilot-enemy">
        <ellipse cx="150" cy="103" rx="22" ry="16" fill="${C.cream}" stroke="${C.ink}" stroke-width="3.5"/>
        <path d="M133 99 q5 -6 11 0 q-6 5 -11 0 Z M156 99 q5 -6 11 0 q-6 5 -11 0 Z" fill="${C.ink}"/>
        <path d="M137 111 q13 8 26 0" fill="none" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round"/>
      </g>`;
  return `<svg class="plane-svg ${className}" viewBox="0 0 300 220" width="300" height="220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <ellipse cx="150" cy="196" rx="78" ry="9" fill="${C.ink}" opacity="0.1"/>
    <path d="M150 24 C171 52 179 78 177 107 L218 130 L218 153 L177 143 L166 184 L202 200 L202 211 L150 197 L98 211 L98 200 L134 184 L123 143 L82 153 L82 130 L123 107 C121 78 129 52 150 24 Z" fill="${palette.body}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M150 36 C166 59 168 81 164 104 L199 124 L199 143 L164 135 L152 171 L150 184 L148 171 L136 135 L101 143 L101 124 L136 104 C132 81 134 59 150 36 Z" fill="${palette.wing}" stroke="${C.ink}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M150 26 L150 47 M150 170 L150 192" stroke="${palette.trim}" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="150" cy="103" rx="35" ry="31" fill="${C.paper}" stroke="${C.ink}" stroke-width="3.5"/>
    ${pilot}
    <g class="plane-prop">
      <ellipse cx="150" cy="210" rx="44" ry="8" fill="${C.paper}" stroke="${C.ink}" stroke-width="3.5" opacity="0.9"/>
      <circle cx="150" cy="210" r="7" fill="${palette.trim}" stroke="${C.ink}" stroke-width="3"/>
      <path d="M150 7 v22" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>
      <path d="M139 7 q11 -9 22 0 q-11 7 -22 0 Z" fill="${C.sun}" stroke="${C.ink}" stroke-width="3"/>
    </g>
    <path d="M62 117 l-19 -9 M238 117 l19 -9" stroke="${C.ink}" stroke-width="3" stroke-linecap="round" opacity="0.35"/>
  </svg>`;
}
