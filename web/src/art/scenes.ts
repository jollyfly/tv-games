import type { WorldId } from '../types';
import { fishSvg, planeSvg, seahorsePropSvg, octopusPropSvg, mantaPropSvg, anemonePropSvg, kelpPropSvg } from './characters';
import {
  C,
  cloud,
  esc,
  flower,
  grassTuft,
  hill,
  lighthouse,
  sceneSvg,
  starShape,
  sun,
  tree,
} from './core';

export const MAP_NODE_POSITIONS: Array<{ x: number; y: number }> = [
  { x: 250, y: 800 },
  { x: 415, y: 712 },
  { x: 575, y: 790 },
  { x: 755, y: 602 },
  { x: 930, y: 668 },
  { x: 1120, y: 548 },
  { x: 1270, y: 790 },
  { x: 1430, y: 706 },
  { x: 1592, y: 790 },
  { x: 1440, y: 650 },
  { x: 1300, y: 550 },
  { x: 1180, y: 450 },
  { x: 1340, y: 360 },
  { x: 1500, y: 300 },
  { x: 1700, y: 480 },
];

export const OCEAN_NODE_POSITIONS: Array<{ x: number; y: number }> = [
  { x: 250, y: 800 },
  { x: 420, y: 720 },
  { x: 590, y: 795 },
  { x: 750, y: 675 },
  { x: 920, y: 755 },
  { x: 1090, y: 660 },
  { x: 1250, y: 750 },
  { x: 1410, y: 670 },
  { x: 1540, y: 545 },
  { x: 1700, y: 380 },
];

export const WORLD_NODE_POSITIONS: Array<{ x: number; y: number }> = [
  { x: 250, y: 800 },
  { x: 430, y: 720 },
  { x: 600, y: 795 },
  { x: 760, y: 665 },
  { x: 930, y: 750 },
  { x: 1090, y: 650 },
  { x: 1260, y: 745 },
  { x: 1420, y: 650 },
  { x: 1560, y: 520 },
  { x: 1710, y: 350 },
];

export function worldRouteSvg(): string {
  const p = WORLD_NODE_POSITIONS;
  let route = `M${p[0].x} ${p[0].y}`;
  for (let index = 1; index < p.length; index += 1) {
    const previous = p[index - 1];
    const next = p[index];
    const lift = Math.min(80, Math.max(30, Math.abs(next.y - previous.y) * 0.3));
    route += ` C${previous.x + 50} ${previous.y - lift} ${next.x - 50} ${next.y + lift} ${next.x} ${next.y}`;
  }
  return `<svg class="world-route" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="${route}" fill="none" stroke="#FFFDF7" stroke-width="22" stroke-linecap="round" opacity="0.9"/>
    <path d="${route}" fill="none" stroke="#8B5E3C" stroke-width="5" stroke-linecap="round" stroke-dasharray="3 18"/>
  </svg>`;
}

export function homeScene(): string {
  return sceneSvg('home', `
    ${sun(1628, 160, 1.05)}
    ${cloud(620, 105, 1.12)}
    ${cloud(1030, 210, 0.72)}
    ${cloud(1090, 52, 0.5)}
    <path d="M360 262 q18 -14 36 0 q18 -14 36 0" fill="none" stroke="#4E7C82" stroke-width="4" stroke-linecap="round" opacity="0.5"/>
    <path d="M0 610 C260 592 474 618 714 604 C983 588 1212 614 1460 594 C1662 578 1806 596 1920 575 L1920 1080 L0 1080 Z" fill="url(#home-sea)"/>
    <rect y="580" width="1920" height="440" fill="url(#home-waves)" opacity="0.5"/>
    <path d="M0 676 C250 658 430 686 658 670 C943 650 1170 682 1432 666 C1638 652 1776 664 1920 650" fill="none" stroke="#E9FBF7" stroke-width="9" stroke-linecap="round" opacity="0.5"/>
    <g transform="translate(1520 235) scale(1.06)">${lighthouse(0, 0, 1)}</g>
    <path d="M0 780 C180 745 355 762 535 790 C750 823 927 765 1116 744 C1317 722 1512 758 1680 724 C1776 704 1858 714 1920 700 L1920 1080 L0 1080 Z" fill="${C.green}"/>
    <path d="M0 780 C180 745 355 762 535 790 C750 823 927 765 1116 744 C1317 722 1512 758 1680 724 C1776 704 1858 714 1920 700" fill="none" stroke="${C.ink}" stroke-width="6"/>
    <path d="M0 850 C220 816 423 834 620 866 C858 905 1040 835 1236 826 C1452 816 1690 862 1920 812 L1920 1080 L0 1080 Z" fill="url(#home-grass)"/>
    <path d="M0 850 C220 816 423 834 620 866 C858 905 1040 835 1236 826 C1452 816 1690 862 1920 812" fill="none" stroke="${C.ink}" stroke-width="5" opacity="0.7"/>
    <path d="M0 930 C240 896 434 930 636 944 C870 960 1062 902 1260 916 C1480 932 1724 954 1920 900" fill="none" stroke="#D7F0BF" stroke-width="8" stroke-linecap="round" opacity="0.45"/>
    ${tree(830, 670, 0.64)}
    ${tree(1748, 636, 0.82)}
    ${tree(1450, 700, 0.44)}
    ${tree(1050, 720, 0.32)}
    ${flower(1116, 918, 1.08)}
    ${flower(1190, 934, 0.72)}
    ${flower(722, 914, 0.82)}
    ${flower(1690, 946, 0.9)}
    ${flower(1770, 928, 0.56)}
    ${flower(142, 944, 0.64)}
    ${grassTuft(982, 930, 0.8)}
    ${grassTuft(638, 948, 0.7)}
    <g transform="translate(760 705)" opacity="0.95">
      <path d="M0 22 L62 22 L48 47 L20 47 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M28 20 L28 -22 L66 12 L28 12" fill="${C.coral}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M0 47 q15 9 30 0 q15 9 30 0" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
    </g>
    <g opacity="0.45" fill="none" stroke="${C.tealDark}" stroke-width="3.5" stroke-linecap="round">
      <path d="M420 480 q14 -11 28 0 q14 -11 28 0"/>
      <path d="M880 375 q12 -9 24 0 q12 -9 24 0"/>
    </g>
  `, C.sky, '#FFF3DA');
}

type MapSignOptions = { title: string; sub: string; icon: 'leaf' | 'candy' | 'owl' | 'star'; x: number; y: number; width?: number; floating?: boolean };

function mapSign({ title, sub, icon, x, y, width = 300, floating = false }: MapSignOptions): string {
  const iconMarkup = (() => {
    switch (icon) {
      case 'leaf':
        return `<circle cx="28" cy="28" r="20" fill="${C.leaf}" stroke="${C.ink}" stroke-width="3.5"/><path d="M28 18 C37 22 43 30 43 40 C34 42 28 34 28 27 C28 34 22 42 13 40 C13 30 19 22 28 18 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="2.5"/>`;
      case 'candy':
        return `<circle cx="28" cy="28" r="20" fill="${C.coral}" stroke="${C.ink}" stroke-width="3.5"/><path d="M12 20 L24 12 C31 8 37 16 31 22 L18 31 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="2.5"/><path d="M12 35 L34 27" stroke="${C.cream}" stroke-width="4" stroke-linecap="round"/>`;
      case 'owl':
        return `<circle cx="28" cy="28" r="20" fill="${C.grape}" stroke="${C.ink}" stroke-width="3.5"/><path d="M14 32 C17 14 39 14 42 32 C35 38 21 38 14 32 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="2.5"/><circle cx="23" cy="25" r="3.5" fill="${C.ink}"/><circle cx="34" cy="25" r="3.5" fill="${C.ink}"/>`;
      case 'star':
        return `<circle cx="28" cy="28" r="20" fill="${C.sun}" stroke="${C.ink}" stroke-width="3.5"/><path d="M28 14 L31 22 L40 23 L34 29 L36 38 L28 33 L20 38 L22 29 L16 23 L25 22 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="2"/>`;
    }
  })();
  return `<g transform="translate(${x} ${y})">
    ${floating ? '' : `<path d="M22 76 L22 270" stroke="${C.brown}" stroke-width="15" stroke-linecap="round"/><path d="M22 76 L22 270" stroke="${C.brownLight}" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`}
    <rect x="-8" y="-8" width="${width + 16}" height="98" rx="24" fill="${C.ink}" opacity="0.13"/>
    <rect x="0" y="-18" width="${width}" height="92" rx="22" fill="${C.paper}" stroke="${C.ink}" stroke-width="5"/>
    <path d="M8 0 C90 -8 ${width - 90} -8 ${width - 8} 0" fill="none" stroke="${C.sun}" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
    ${iconMarkup}
    <text x="64" y="27" font-family="'ZCOOL KuaiLe','PingFang SC',sans-serif" font-size="37" fill="${C.ink}">${esc(title)}</text>
    <text x="64" y="56" font-family="'PingFang SC','Noto Sans SC',sans-serif" font-size="22" fill="${C.ink}" opacity="0.65">${esc(sub)}</text>
  </g>`;
}

export function mapScene(): string {
  const forestIsland = `
    <path d="M80 785 C60 720 120 670 200 660 C254 615 334 630 374 660 C434 615 520 635 552 685 C620 700 654 760 615 805 C568 858 430 880 300 868 C180 858 98 838 80 785 Z" fill="${C.ink}" opacity="0.14" transform="translate(8 14)"/>
    <path d="M80 785 C60 720 120 670 200 660 C254 615 334 630 374 660 C434 615 520 635 552 685 C620 700 654 760 615 805 C568 858 430 880 300 868 C180 858 98 838 80 785 Z" fill="url(#map-grass)" stroke="${C.ink}" stroke-width="5"/>
    <path d="M120 744 C180 705 260 718 310 735 C372 708 470 716 540 748 C578 760 600 782 600 802 C542 842 410 854 290 844 C190 836 130 812 120 744 Z" fill="#8BC76D" opacity="0.65"/>
    ${tree(468, 620, 0.58)}
    ${tree(160, 696, 0.5)}
    ${tree(334, 690, 0.38)}
    ${flower(128, 794, 0.52)}
    ${flower(548, 790, 0.58)}
    <path d="M215 800 q12 -24 24 0 q-12 8 -24 0 Z" fill="${C.rose}" stroke="${C.ink}" stroke-width="3"/>
    <path d="M227 800 L227 816" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>
  `;
  const candyIsland = `
    <path d="M686 588 C664 520 724 466 800 458 C852 420 928 430 970 466 C1040 432 1120 462 1142 528 C1170 585 1138 648 1058 674 C976 710 818 704 748 664 C700 634 678 616 686 588 Z" fill="${C.ink}" opacity="0.14" transform="translate(8 14)"/>
    <path d="M686 588 C664 520 724 466 800 458 C852 420 928 430 970 466 C1040 432 1120 462 1142 528 C1170 585 1138 648 1058 674 C976 710 818 704 748 664 C700 634 678 616 686 588 Z" fill="#F3B6A4" stroke="${C.ink}" stroke-width="5"/>
    <path d="M730 552 C788 510 886 508 960 530 C1038 500 1104 526 1112 568 C1086 608 1004 622 930 612 C846 600 772 590 730 552 Z" fill="#FBE8D9" opacity="0.7"/>
    <path d="M756 516 C764 490 790 474 820 478 C842 480 856 494 860 514 C846 534 816 546 786 540 C766 536 756 528 756 516 Z" fill="${C.coral}" stroke="${C.ink}" stroke-width="4"/>
    <path d="M958 500 C974 476 1002 470 1024 482 C1048 494 1054 518 1042 538 C1022 556 986 556 966 538 C954 528 952 512 958 500 Z" fill="${C.grape}" stroke="${C.ink}" stroke-width="4"/>
    <g transform="translate(742 430) scale(0.7)">
      <path d="M32 230 L32 82 C32 30 86 12 116 44 C138 68 136 102 112 118" fill="none" stroke="${C.paper}" stroke-width="30" stroke-linecap="round"/>
      <path d="M32 230 L32 82 C32 30 86 12 116 44 C138 68 136 102 112 118" fill="none" stroke="${C.coral}" stroke-width="14" stroke-dasharray="20 17" stroke-linecap="round"/>
      <path d="M32 230 L32 82 C32 30 86 12 116 44 C138 68 136 102 112 118" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>
    </g>
    <g transform="translate(932 540) scale(0.52)">
      <path d="M0 0 L0 58" stroke="${C.paper}" stroke-width="11"/>
      <circle cx="0" cy="-20" r="40" fill="${C.paper}" stroke="${C.ink}" stroke-width="4"/>
      <path d="M0 -20 m-29 0 a29 29 0 1 1 58 0" fill="none" stroke="${C.coral}" stroke-width="11" stroke-dasharray="16 13"/>
      <path d="M-29 -20 C-14 -38 14 -38 29 -20" fill="none" stroke="${C.grape}" stroke-width="6" stroke-linecap="round"/>
    </g>
  `;
  const castleIsland = `
    <path d="M1228 790 C1206 720 1248 664 1318 646 C1368 610 1434 625 1468 652 C1524 616 1600 632 1632 684 C1680 710 1692 770 1658 814 C1608 864 1500 890 1400 878 C1300 868 1248 842 1228 790 Z" fill="${C.ink}" opacity="0.14" transform="translate(8 14)"/>
    <path d="M1228 790 C1206 720 1248 664 1318 646 C1368 610 1434 625 1468 652 C1524 616 1600 632 1632 684 C1680 710 1692 770 1658 814 C1608 864 1500 890 1400 878 C1300 868 1248 842 1228 790 Z" fill="#8E7CC3" stroke="${C.ink}" stroke-width="5"/>
    <path d="M1264 770 C1300 714 1380 698 1440 716 C1504 686 1580 706 1618 744 C1642 770 1642 800 1620 824 C1564 852 1460 860 1370 850 C1300 840 1264 810 1264 770 Z" fill="#A89BD3" opacity="0.6"/>
    <g transform="translate(1378 566)">
      <path d="M0 155 L0 60 L112 60 L112 155 Z" fill="${C.paper}" stroke="${C.ink}" stroke-width="5"/>
      <path d="M-10 64 L0 10 L112 10 L122 64 Z" fill="${C.grape}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M0 10 L56 -32 L112 10 Z" fill="${C.coral}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>
      <rect x="38" y="94" width="36" height="61" rx="18" fill="${C.grape}" stroke="${C.ink}" stroke-width="4"/>
      <path d="M20 82 L30 82 L30 58 L42 58 L42 82 L54 82 L54 58 L66 58 L66 82 L78 82 L78 58 L90 58 L90 82 L102 82" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="56" cy="52" r="12" fill="${C.sun}" stroke="${C.ink}" stroke-width="3"/>
    </g>
    <g transform="translate(1514 612) scale(0.76)">
      <path d="M0 180 L0 74 L88 74 L88 180 Z" fill="${C.paper}" stroke="${C.ink}" stroke-width="5"/>
      <path d="M-9 78 L0 20 L88 20 L98 78 Z" fill="${C.grape}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M0 20 L44 -20 L88 20 Z" fill="${C.sun}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>
      <rect x="30" y="108" width="28" height="50" rx="14" fill="${C.grapeDark}" stroke="${C.ink}" stroke-width="4"/>
    </g>
    <g fill="${C.sun}" stroke="${C.ink}" stroke-width="2">
      <path d="M1588 600 l4 12 13 1 -10 9 3 13 -11 -7 -11 7 3 -13 -10 -9 13 -1 Z"/>
      <path d="M1330 710 l3 9 10 1 -8 7 2 10 -8 -5 -8 5 2 -10 -8 -7 10 -1 Z"/>
    </g>
  `;
  const lighthouseIsland = `
    <path d="M1650 452 C1636 396 1678 350 1738 346 C1790 314 1852 340 1864 390 C1884 426 1860 474 1810 490 C1742 512 1666 500 1650 452 Z" fill="${C.ink}" opacity="0.14" transform="translate(8 12)"/>
    <path d="M1650 452 C1636 396 1678 350 1738 346 C1790 314 1852 340 1864 390 C1884 426 1860 474 1810 490 C1742 512 1666 500 1650 452 Z" fill="#989486" stroke="${C.ink}" stroke-width="5"/>
    <path d="M1680 432 C1710 402 1766 398 1810 414 C1834 422 1844 438 1838 452 C1800 470 1744 474 1704 462 C1682 456 1672 446 1680 432 Z" fill="#A6C96D" opacity="0.8"/>
    <g transform="translate(1699 174) scale(0.82)">${lighthouse(0, 0, 1)}</g>
  `;
  return sceneSvg('map', `
    <rect width="1920" height="1080" fill="url(#map-sea)"/>
    <rect width="1920" height="1080" fill="url(#map-waves)" opacity="0.75"/>
    <g fill="none" stroke="${C.paper}" stroke-width="2" opacity="0.2">
      <path d="M0 250 C420 180 700 260 1010 210 C1300 165 1600 220 1920 160"/>
      <path d="M0 470 C340 420 600 490 880 430 C1190 365 1500 430 1920 370"/>
      <path d="M0 900 C350 850 700 920 1050 865 C1390 810 1680 860 1920 810"/>
      <path d="M410 0 C400 220 450 430 420 660 C390 850 430 980 410 1080"/>
      <path d="M1420 0 C1380 200 1450 350 1420 560 C1390 770 1440 930 1410 1080"/>
    </g>
    ${cloud(680, 60, 0.7)}
    ${cloud(1160, 110, 0.52)}
    ${cloud(90, 270, 0.48)}
    ${cloud(1460, 245, 0.43)}
    <g opacity="0.92">
      ${cloud(1250, 450, 0.6)}
      ${cloud(1450, 320, 0.5)}
      ${cloud(1640, 240, 0.36)}
      <g transform="translate(760 170) rotate(-9) scale(0.42)">${planeSvg('player', 'map-sky-plane')}</g>
    </g>
    ${forestIsland}
    ${candyIsland}
    ${castleIsland}
    ${lighthouseIsland}
    ${mapSign({ x: 132, y: 520, title: '青芽森林', sub: '第 1–3 关 · 数一数', icon: 'leaf' })}
    ${mapSign({ x: 772, y: 308, width: 340, title: '糖果镇', sub: '第 4–6 关 · 数字与数量', icon: 'candy' })}
    ${mapSign({ x: 930, y: 130, width: 330, title: '云上天空', sub: '第 10–14 关 · 数字与逻辑', icon: 'star', floating: true })}
    <g transform="translate(1618 146)">
      <path d="M20 42 L20 140" stroke="${C.brown}" stroke-width="10" stroke-linecap="round"/>
      <rect x="-8" y="0" width="220" height="70" rx="22" fill="${C.paper}" stroke="${C.ink}" stroke-width="4"/>
      <text x="26" y="43" font-family="'ZCOOL KuaiLe','PingFang SC',sans-serif" font-size="32" fill="${C.ink}">星光灯塔</text>
    </g>
    <path d="${mapPath(MAP_NODE_POSITIONS)}" fill="none" stroke="${C.paper}" stroke-width="20" stroke-linecap="round" opacity="0.9"/>
    <path d="${mapPath(MAP_NODE_POSITIONS)}" fill="none" stroke="${C.brown}" stroke-width="5" stroke-linecap="round" stroke-dasharray="3 18"/>
    <g transform="translate(1010 930) rotate(-8)">
      <path d="M0 22 L70 22 L52 50 L18 50 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M32 20 L32 -30 L78 12 L32 12" fill="${C.coral}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>
    </g>
    <g transform="translate(148 924)">
      <circle r="54" fill="${C.cream}" stroke="${C.ink}" stroke-width="4"/>
      <circle r="42" fill="none" stroke="${C.ink}" stroke-width="2" opacity="0.4"/>
      <path d="M0 -38 L10 -6 L38 0 L10 6 L0 38 L-10 6 L-38 0 L-10 -6 Z" fill="${C.coral}" stroke="${C.ink}" stroke-width="3"/>
      <path d="M0 -38 L0 38 M-38 0 L38 0" stroke="${C.ink}" stroke-width="2" opacity="0.35"/>
      <text x="0" y="-64" text-anchor="middle" font-family="'PingFang SC','Noto Sans SC',sans-serif" font-size="20" fill="${C.ink}" opacity="0.65">北</text>
    </g>
    <g transform="translate(1120 548) scale(0.9)">
      <circle r="56" fill="${C.sun}" opacity="0.1"/>
      ${starShape(36, -34, 0.55)}
    </g>
  `, '#CBEFF0', '#FFF6E6');
}

function mapPath(p: Array<{ x: number; y: number }>): string {
  let path = `M${p[0].x} ${p[0].y}`;
  for (let index = 1; index < p.length; index += 1) {
    const previous = p[index - 1];
    const next = p[index];
    const lift = Math.min(80, Math.max(28, Math.abs(next.y - previous.y) * 0.28));
    path += ` C${previous.x + 42} ${previous.y - lift} ${next.x - 42} ${next.y + lift} ${next.x} ${next.y}`;
  }
  return path;
}

export function worldScene(world: WorldId): string {
  switch (world) {
    case 'forest':
      return sceneSvg('q-forest', `
        ${sun(1640, 146, 0.82)}
        ${cloud(90, 30, 0.62)}
        ${cloud(1720, 40, 0.55)}
        <path d="M0 460 C170 360 330 380 490 448 C650 390 810 382 980 454 C1140 372 1300 386 1460 452 C1630 372 1780 388 1920 442 L1920 700 L0 700 Z" fill="#A8D786" opacity="0.72"/>
        <path d="M0 512 C210 432 402 454 600 512 C785 452 1020 448 1210 514 C1410 442 1658 454 1920 514 L1920 1080 L0 1080 Z" fill="url(#q-forest-grass)"/>
        <path d="M0 640 C256 604 464 620 682 646 C912 674 1130 620 1350 628 C1560 636 1768 674 1920 646" fill="none" stroke="${C.ink}" stroke-width="5"/>
        ${tree(26, 300, 1.04)}
        ${tree(1688, 320, 1.08)}
        ${tree(1370, 370, 0.56)}
        ${tree(284, 392, 0.44)}
        ${grassTuft(250, 700, 1)}
        ${grassTuft(1630, 730, 1.1)}
        ${flower(150, 774, 0.75)}
        ${flower(1760, 760, 0.65)}
        <path d="M0 790 C300 750 570 788 840 780 C1130 770 1390 748 1920 800 L1920 1080 L0 1080 Z" fill="#6FB358"/>
        <path d="M0 790 C300 750 570 788 840 780 C1130 770 1390 748 1920 800" fill="none" stroke="${C.ink}" stroke-width="5" opacity="0.7"/>
        <path d="M0 930 C260 892 500 920 760 940 C1060 962 1270 890 1510 910 C1690 926 1800 944 1920 920" fill="none" stroke="#D7F0BF" stroke-width="7" stroke-linecap="round" opacity="0.4"/>
        <g opacity="0.8">
          <path d="M120 300 C170 280 218 284 260 300" fill="none" stroke="${C.paper}" stroke-width="5" stroke-linecap="round" opacity="0.5"/>
          <path d="M1500 240 C1550 220 1600 224 1644 242" fill="none" stroke="${C.paper}" stroke-width="5" stroke-linecap="round" opacity="0.5"/>
        </g>
      `, C.sky, '#FFF3DA');
    case 'candy':
      return sceneSvg('q-candy', `
        ${cloud(120, 34, 0.58)}
        ${cloud(1660, 44, 0.52)}
        <circle cx="1630" cy="158" r="86" fill="#FFDFA8" opacity="0.5"/>
        <path d="M0 480 C210 390 420 400 610 470 C830 400 1060 402 1240 480 C1430 400 1660 410 1920 470 L1920 720 L0 720 Z" fill="#F6C7B9" opacity="0.8"/>
        <path d="M0 570 C220 480 440 500 650 560 C860 482 1110 490 1300 570 C1500 486 1720 500 1920 568 L1920 1080 L0 1080 Z" fill="url(#q-candy-grass)"/>
        <path d="M0 640 C220 610 440 640 650 662 C870 686 1090 620 1320 640 C1540 660 1750 690 1920 654" fill="none" stroke="${C.ink}" stroke-width="5"/>
        <path d="M0 780 C300 748 560 782 840 766 C1110 752 1390 740 1920 790 L1920 1080 L0 1080 Z" fill="#F0C1A8" opacity="0.65"/>
        <path d="M0 894 C260 856 500 880 760 900 C1060 922 1270 850 1510 870 C1690 886 1800 904 1920 880" fill="none" stroke="#FFF3DA" stroke-width="7" stroke-linecap="round" opacity="0.5"/>
        ${grassTuft(250, 760, 0.8, C.coralDark)}
        ${grassTuft(1600, 820, 0.9, C.coralDark)}
        ${lollipopTree(92, 438, 1.05, C.coral)}
        ${lollipopTree(1720, 450, 1.0, C.grape)}
        ${candyCaneFence(250, 812, 0.9)}
        ${candyCaneFence(1490, 838, 0.8)}
        ${gumdropBush(280, 730, 0.9, C.teal)}
        ${gumdropBush(1580, 724, 0.85, C.sun)}
        ${gumballMachine(1580, 548, 0.8)}
      `, '#FCE4D9', '#FFF3DA', '#FBE4D4');
    case 'castle':
      return sceneSvg('q-castle', `
        <circle cx="1640" cy="150" r="86" fill="#FFE7A0" opacity="0.45"/>
        <circle cx="1640" cy="150" r="65" fill="${C.sun}" opacity="0.75"/>
        ${cloud(230, 26, 0.56)}
        ${cloud(1480, 42, 0.48)}
        <g fill="${C.sun}" opacity="0.8">
          <path d="M300 200 l4 12 13 1 -10 9 3 13 -11 -7 -11 7 3 -13 -10 -9 13 -1 Z"/>
          <path d="M1180 160 l3 9 10 1 -8 7 2 10 -8 -5 -8 5 2 -10 -8 -7 10 -1 Z"/>
          <path d="M800 110 l2 7 8 1 -6 5 2 8 -6 -4 -6 4 2 -8 -6 -5 8 -1 Z"/>
        </g>
        <path d="M0 500 C240 430 440 450 650 510 C860 440 1090 440 1310 510 C1520 440 1740 450 1920 510 L1920 760 L0 760 Z" fill="#7568A2" opacity="0.7"/>
        <g transform="translate(1360 390) scale(0.92)">
          <path d="M0 240 L0 90 L180 90 L180 240 Z" fill="${C.paper}" stroke="${C.ink}" stroke-width="5"/>
          <path d="M-16 94 L0 20 L180 20 L196 94 Z" fill="${C.grape}" stroke="${C.ink}" stroke-width="5"/>
          <path d="M0 20 L90 -40 L180 20 Z" fill="${C.coral}" stroke="${C.ink}" stroke-width="5"/>
          <path d="M40 140 H140 V240 H40 Z" fill="${C.grapeDark}" stroke="${C.ink}" stroke-width="4"/>
          <path d="M62 240 V140 C62 108 118 108 118 140 V240" fill="none" stroke="${C.ink}" stroke-width="3"/>
          <circle cx="90" cy="72" r="13" fill="${C.sun}" stroke="${C.ink}" stroke-width="3"/>
          <path d="M28 120 H54 V88 H76 V120 H104 V88 H126 V120 H152" fill="none" stroke="${C.ink}" stroke-width="3"/>
        </g>
        <path d="M0 760 C260 700 500 730 760 750 C1030 772 1250 690 1510 712 C1700 728 1800 750 1920 716 L1920 1080 L0 1080 Z" fill="url(#q-castle-grass)"/>
        <path d="M0 760 C260 700 500 730 760 750 C1030 772 1250 690 1510 712 C1700 728 1800 750 1920 716" fill="none" stroke="${C.ink}" stroke-width="5" opacity="0.75"/>
        <path d="M0 906 C260 868 500 890 760 910 C1060 932 1270 860 1510 880 C1690 896 1800 914 1920 890" fill="none" stroke="#D9CFF0" stroke-width="7" stroke-linecap="round" opacity="0.5"/>
        ${tree(280, 650, 0.44, '#A497CB', '#74639B')}
        ${tree(1710, 670, 0.52, '#A497CB', '#74639B')}
        ${grassTuft(360, 800, 0.9, '#6E5CA6')}
        ${grassTuft(1550, 840, 0.8, '#6E5CA6')}
        ${castleBanner(118, 392, 1.05, C.coral)}
        ${castleBanner(1690, 414, 0.95, C.sun)}
        ${castleRoseWindow(806, 38, 0.78)}
        ${castleTorch(76, 670, 0.9)}
        ${castleTorch(1748, 690, 0.9)}
        <g class="castle-stars" fill="${C.sun}" opacity="0.9">
          <path d="M520 170 l4 11 12 1 -9 8 3 12 -10 -6 -10 6 3 -12 -9 -8 12 -1 Z"/>
          <path d="M1260 120 l3 8 9 1 -7 6 2 9 -7 -4 -7 4 2 -9 -7 -6 9 -1 Z"/>
        </g>
      `, '#6F7EAD', '#B8ACC8', '#8B7EB3');
    case 'sky':
      return sceneSvg('q-sky', `
        <circle cx="1620" cy="120" r="94" fill="#FFE7A0" opacity="0.35"/>
        <circle cx="1620" cy="120" r="68" fill="${C.sun}" opacity="0.88"/>
        ${cloud(120, 44, 0.7)}
        ${cloud(900, 28, 0.52)}
        ${cloud(1400, 56, 0.44)}
        <path d="M0 520 C240 470 430 500 640 530 C850 556 1090 490 1310 520 C1530 550 1740 510 1920 540 L1920 760 L0 760 Z" fill="#6AAFB8" opacity="0.26"/>
        <path d="M0 650 C220 600 440 630 660 654 C890 680 1090 610 1320 640 C1540 668 1740 640 1920 666 L1920 1080 L0 1080 Z" fill="#79BFC4" opacity="0.25"/>
        <g transform="translate(185 700)">
          <path d="M0 70 C38 20 115 10 168 38 C216 14 285 30 300 80 C330 90 340 126 312 148 C286 174 240 176 210 160 C170 190 108 186 78 158 C36 160 3 127 0 70 Z" fill="${C.paper}" stroke="${C.ink}" stroke-width="5"/>
          <path d="M52 126 C70 100 100 92 124 102 C150 82 194 88 210 112" fill="none" stroke="${C.sky}" stroke-width="5" stroke-linecap="round" opacity="0.6"/>
        </g>
        <g transform="translate(1590 680) scale(0.9)">
          <path d="M0 70 C38 20 115 10 168 38 C216 14 285 30 300 80 C330 90 340 126 312 148 C286 174 240 176 210 160 C170 190 108 186 78 158 C36 160 3 127 0 70 Z" fill="${C.paper}" stroke="${C.ink}" stroke-width="5"/>
        </g>
        <g fill="${C.sun}" opacity="0.9">
          <path d="M360 250 l4 12 13 1 -10 9 3 13 -11 -7 -11 7 3 -13 -10 -9 13 -1 Z"/>
          <path d="M1120 240 l3 9 10 1 -8 7 2 10 -8 -5 -8 5 2 -10 -8 -7 10 -1 Z"/>
        </g>
        <path d="M0 890 C250 850 500 880 760 900 C1020 920 1280 850 1520 875 C1720 896 1840 920 1920 900 L1920 1080 L0 1080 Z" fill="#BDE6DE" opacity="0.45"/>
        ${skyRainbow(480, 42, 0.9)}
        ${skyBalloon(82, 356, 0.95)}
        ${skyFloatingIsland(1650, 510, 0.9)}
        ${skyBirdFlock(1450, 190, 0.9)}
      `, '#86D4DF', '#D7F4E8', '#B7E9E2');
    case 'dino':
      return sceneSvg('q-dino', `
        ${cloud(120, 40, 0.46)}<circle cx="1600" cy="130" r="80" fill="${C.sun}" opacity="0.8"/>
        <path d="M0 650 C260 570 500 610 760 660 C1020 710 1250 560 1510 610 C1700 640 1820 610 1920 620 L1920 1080 L0 1080 Z" fill="#8B9C55"/>
        <path d="M0 820 C280 750 550 810 800 840 C1090 872 1300 780 1540 820 C1710 840 1830 870 1920 840 L1920 1080 L0 1080 Z" fill="#C5A36B"/>
        <g fill="${C.leafDark}" opacity="0.8"><path d="M180 770 C160 650 220 620 280 650 C300 720 260 760 180 770 Z"/><path d="M1660 730 C1640 600 1710 570 1770 620 C1790 690 1750 730 1660 730 Z"/></g>
        ${dinoVolcano(1610, 430, 0.9)}
        ${dinoSkeleton(70, 560, 0.9)}
        ${dinoEggNest(250, 760, 0.9)}
        ${fernCluster(1540, 730, 0.9)}
        ${fernCluster(470, 670, 0.65)}
        <g fill="${C.paper}" opacity="0.6"><circle cx="1120" cy="300" r="5"/><circle cx="1190" cy="260" r="3"/><circle cx="980" cy="220" r="4"/></g>
      `, '#E9C58D', '#7B8E55', '#D7B47B');
    case 'space':
      return sceneSvg('q-space', `
        <g fill="${C.paper}"><circle cx="180" cy="140" r="4"/><circle cx="430" cy="80" r="3"/><circle cx="800" cy="160" r="5"/><circle cx="1200" cy="90" r="3"/><circle cx="1600" cy="180" r="4"/><circle cx="1760" cy="70" r="2"/></g>
        <circle cx="1540" cy="220" r="115" fill="${C.grape}"/><ellipse cx="1540" cy="220" rx="180" ry="38" fill="none" stroke="${C.sun}" stroke-width="8" opacity="0.7"/>
        <circle cx="380" cy="360" r="64" fill="${C.teal}" opacity="0.8"/>
        <path d="M0 730 C280 680 520 720 780 750 C1060 782 1280 690 1540 720 C1740 740 1840 760 1920 730 L1920 1080 L0 1080 Z" fill="#24445C"/>
        <path d="M0 900 C300 840 600 900 900 900 C1200 900 1500 840 1920 890 L1920 1080 L0 1080 Z" fill="#1B3347"/>
        <g transform="translate(800 610)"><rect x="0" y="0" width="120" height="180" rx="30" fill="${C.paper}" stroke="${C.ink}" stroke-width="5"/><circle cx="60" cy="68" r="28" fill="${C.sky}" stroke="${C.ink}" stroke-width="4"/><path d="M35 170 L5 235 L55 195 M85 170 L115 235 L65 195" fill="${C.coral}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/></g>
        ${spaceSatellite(70, 320, 0.9)}
        ${spaceAsteroidBelt(1640, 386, 0.9)}
        ${spaceStation(1610, 610, 0.8)}
        ${spaceConstellation(600, 74, 0.9)}
      `, '#162C45', '#0B1728', '#233D61');
    case 'music':
      return sceneSvg('q-music', `
        <circle cx="1640" cy="130" r="80" fill="${C.sun}" opacity="0.5"/>
        ${cloud(120, 40, 0.5)}${cloud(1400, 40, 0.45)}
        <path d="M0 680 C250 620 460 650 700 690 C960 730 1180 620 1430 660 C1640 690 1820 700 1920 670 L1920 1080 L0 1080 Z" fill="#F4C3D1"/>
        <path d="M0 820 C300 760 540 820 820 840 C1090 860 1310 780 1570 810 C1740 830 1860 850 1920 820 L1920 1080 L0 1080 Z" fill="#F7DDE0"/>
        <g fill="${C.paper}" stroke="${C.ink}" stroke-width="4"><circle cx="300" cy="360" r="52"/><circle cx="1300" cy="300" r="42"/><circle cx="1030" cy="210" r="28"/></g>
        <g fill="${C.grapeDark}" opacity="0.8"><path d="M690 300 l30 -20 4 40 40 4 -32 22 -2 40 -30 -26 -38 10 14 -36 -22 -28 42 2 Z"/></g>
        ${musicHarp(74, 400, 0.95)}
        ${musicDrum(1660, 522, 0.9)}
        ${musicNotes(640, 78, 1)}
        ${stageSpotlight(1080, 34, 0.9)}
      `, '#F7D8E2', '#FFF1E6', '#F9E3E6');
    case 'donut':
      return sceneSvg('q-donut', `
        <circle cx="1640" cy="140" r="80" fill="${C.sun}" opacity="0.5"/>
        ${cloud(160, 40, 0.5)}${cloud(1330, 40, 0.4)}
        <path d="M0 680 C250 610 500 660 760 690 C1020 720 1240 630 1500 660 C1720 680 1840 700 1920 670 L1920 1080 L0 1080 Z" fill="#EDB5A5"/>
        <path d="M0 850 C300 790 560 850 840 860 C1110 870 1340 800 1590 830 C1750 850 1860 860 1920 840 L1920 1080 L0 1080 Z" fill="#F6D7BF"/>
        <g transform="translate(680 260) scale(0.7)"><circle cx="60" cy="60" r="43" fill="#D99A5C" stroke="${C.ink}" stroke-width="4"/><circle cx="60" cy="60" r="15" fill="${C.cream}" stroke="${C.ink}" stroke-width="4"/></g>
        ${donutConveyor(70, 630, 0.9)}
        ${donutPipes(1660, 380, 0.9)}
        ${donutSign(760, 48, 0.85)}
        ${donutBoxes(250, 730, 0.9)}
        <g fill="${C.paper}" opacity="0.7"><circle cx="980" cy="240" r="5"/><circle cx="1060" cy="200" r="3"/><circle cx="1180" cy="310" r="4"/></g>
      `, '#F6D7BF', '#FFF1E6', '#F1C7AF');
    case 'magic':
      return sceneSvg('q-magic', `
        <circle cx="1620" cy="150" r="86" fill="${C.sun}" opacity="0.5"/>
        ${cloud(100, 40, 0.55)}${cloud(1400, 40, 0.4)}
        <path d="M0 700 C220 630 450 660 680 700 C910 740 1130 640 1370 670 C1580 700 1800 680 1920 650 L1920 1080 L0 1080 Z" fill="#8B7EB3"/>
        <path d="M0 850 C300 790 550 850 820 860 C1090 870 1340 780 1590 820 C1740 840 1860 860 1920 840 L1920 1080 L0 1080 Z" fill="#6E5CA6"/>
        <g fill="${C.sun}" opacity="0.85"><path d="M360 230 l5 15 16 1 -12 11 4 16 -13 -9 -14 9 4 -16 -12 -11 16 -1 Z"/><path d="M1120 220 l4 12 13 1 -10 9 3 13 -11 -7 -11 7 3 -13 -10 -9 13 -1 Z"/><path d="M780 140 l3 9 10 1 -8 7 2 10 -8 -5 -8 5 2 -10 -8 -7 10 -1 Z"/></g>
        <g fill="${C.rose}" opacity="0.9"><circle cx="280" cy="720" r="16"/><circle cx="340" cy="690" r="10"/><circle cx="1580" cy="720" r="13"/><circle cx="1630" cy="680" r="8"/></g>
        ${magicPotionShelf(80, 400, 0.9)}
        ${magicMushroom(1660, 510, 0.95)}
        ${magicMirror(820, 40, 0.78)}
        ${magicRune(228, 612, 0.55)}
        ${magicCrystals(1610, 684, 0.9)}
      `, '#8B7EB3', '#4D3B72', '#6E5CA8');
    case 'ocean':
      return sceneSvg('q-ocean', `
        <g opacity="0.55">
          <path d="M240 0 C190 190 250 350 180 560" fill="none" stroke="${C.paper}" stroke-width="34" stroke-linecap="round"/>
          <path d="M760 0 C700 210 780 370 700 580" fill="none" stroke="${C.paper}" stroke-width="26" stroke-linecap="round"/>
          <path d="M1280 0 C1210 240 1290 400 1200 620" fill="none" stroke="${C.paper}" stroke-width="30" stroke-linecap="round"/>
        </g>
        <g fill="${C.paper}" opacity="0.45">
          <circle cx="360" cy="160" r="9"/><circle cx="410" cy="110" r="5"/><circle cx="980" cy="170" r="7"/>
          <circle cx="1020" cy="120" r="4"/><circle cx="1450" cy="190" r="8"/><circle cx="1510" cy="130" r="4"/>
          <circle cx="650" cy="300" r="5"/><circle cx="1700" cy="300" r="6"/>
        </g>
        <path d="M0 720 C220 670 440 700 660 730 C900 762 1110 690 1340 710 C1540 728 1760 700 1920 740 L1920 1080 L0 1080 Z" fill="#D9C08A" opacity="0.55"/>
        <path d="M0 850 C280 800 520 840 780 860 C1040 880 1260 810 1510 840 C1690 860 1810 880 1920 860 L1920 1080 L0 1080 Z" fill="#C8A970" opacity="0.65"/>
        <g transform="translate(90 600)">
          <path d="M0 240 C20 160 70 130 120 150 C140 80 200 60 240 105 C290 80 340 120 340 180 C380 210 380 250 340 280 L0 280 Z" fill="#E7A07D" stroke="${C.ink}" stroke-width="5"/>
          <path d="M25 220 C60 160 95 180 110 220 M190 120 C210 85 245 88 260 125 M280 180 C300 150 330 160 330 200" fill="none" stroke="#F6C1A8" stroke-width="12" stroke-linecap="round"/>
          <path d="M104 230 C104 180 150 168 170 195 C184 214 164 236 140 236" fill="#F6C1A8" stroke="${C.ink}" stroke-width="4"/>
          <path d="M242 208 C260 178 292 188 292 220" fill="none" stroke="${C.coral}" stroke-width="16" stroke-linecap="round"/>
        </g>
        <g transform="translate(1640 620)">
          <path d="M0 260 C20 180 70 150 120 170 C150 100 210 90 245 130 C290 105 340 150 330 210 C360 235 350 270 315 285 L0 285 Z" fill="#D98E72" stroke="${C.ink}" stroke-width="5"/>
          <path d="M40 235 C80 180 118 200 136 238 M200 150 C220 115 256 118 270 155 M280 205 C304 178 330 188 330 220" fill="none" stroke="#F6C1A8" stroke-width="12" stroke-linecap="round"/>
        </g>
        <g fill="${C.paper}" opacity="0.75">
          <circle cx="550" cy="410" r="11"/><circle cx="580" cy="380" r="6"/><circle cx="540" cy="350" r="4"/>
          <circle cx="1120" cy="320" r="8"/><circle cx="1150" cy="290" r="5"/>
          <circle cx="1760" cy="560" r="9"/><circle cx="1790" cy="530" r="4"/>
        </g>
        <g transform="translate(1080 760)">
          <path d="M0 80 C0 30 40 0 90 0 C140 0 180 30 180 80 L160 150 C120 175 60 175 20 150 Z" fill="#B9875B" stroke="${C.ink}" stroke-width="5"/>
          <path d="M15 80 C40 52 140 52 165 80" fill="none" stroke="#E2B77D" stroke-width="6"/>
          <path d="M35 150 L25 190 M145 150 L155 190" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>
          <circle cx="90" cy="55" r="22" fill="${C.sun}" stroke="${C.ink}" stroke-width="4"/>
          <path d="M90 42 L96 56 L110 57 L99 66 L103 80 L90 71 L77 80 L81 66 L70 57 L84 56 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="2"/>
        </g>
        <g transform="translate(30 940)">
          <path d="M0 40 C15 10 45 0 70 15 C98 0 130 14 132 40 C110 58 25 58 0 40 Z" fill="#79B85A" stroke="${C.ink}" stroke-width="4"/>
          <path d="M22 50 C10 20 18 -10 35 -28 M62 52 C52 18 60 -14 78 -34 M100 50 C96 20 104 -8 120 -24" fill="none" stroke="#4D8A43" stroke-width="10" stroke-linecap="round"/>
        </g>
        <g transform="translate(1200 34)">${mantaPropSvg('ocean-manta-prop', 300, 160)}</g>
        <g transform="translate(48 500)">${seahorsePropSvg('ocean-seahorse-prop', 150, 240)}</g>
        <g transform="translate(1640 480)">${octopusPropSvg('ocean-octopus-prop', 240, 210)}</g>
        <g transform="translate(64 790)">${anemonePropSvg('ocean-anemone-prop', 150, 170)}</g>
        <g transform="translate(1730 720)">${kelpPropSvg('ocean-kelp-prop', 120, 250)}</g>
      `, '#3D93AA', '#1B5265', '#2B7689');

  }
}

export function oceanMapScene(): string {
  const p = OCEAN_NODE_POSITIONS;
  return sceneSvg('ocean-map', `
    <rect width="1920" height="1080" fill="url(#ocean-map-sea)"/>
    <g opacity="0.45">
      <path d="M250 0 C190 230 270 430 190 700" fill="none" stroke="${C.paper}" stroke-width="42" stroke-linecap="round"/>
      <path d="M760 0 C700 260 780 460 690 740" fill="none" stroke="${C.paper}" stroke-width="30" stroke-linecap="round"/>
      <path d="M1300 0 C1220 280 1320 500 1220 800" fill="none" stroke="${C.paper}" stroke-width="36" stroke-linecap="round"/>
    </g>
    <g fill="none" stroke="${C.paper}" stroke-width="2" opacity="0.18">
      <path d="M0 300 C360 240 640 320 980 260 C1300 205 1600 280 1920 220"/>
      <path d="M0 560 C300 510 620 580 940 520 C1240 465 1580 530 1920 470"/>
      <path d="M0 930 C350 870 700 940 1080 890 C1420 845 1700 900 1920 850"/>
    </g>
    <g opacity="0.95">
      <path d="M60 790 C40 720 100 670 180 660 C230 615 320 630 365 665 C430 620 520 640 548 690 C610 710 635 770 595 815 C545 865 420 885 300 870 C175 855 85 838 60 790 Z" fill="#DDBB83" stroke="${C.ink}" stroke-width="5"/>
      <path d="M108 748 C170 710 260 720 314 738 C380 710 480 722 548 752" fill="none" stroke="#F3D9AA" stroke-width="6" stroke-linecap="round" opacity="0.7"/>
      <path d="M140 740 C110 670 150 650 185 680 C210 700 195 730 168 742 Z" fill="#E7A07D" stroke="${C.ink}" stroke-width="4"/>
      <path d="M390 710 C360 640 410 620 445 650 C470 675 450 705 420 715 Z" fill="#D98E72" stroke="${C.ink}" stroke-width="4"/>
      <g transform="translate(1020 660)">
        <path d="M0 170 C20 90 80 55 145 80 C175 20 245 15 280 65 C330 40 380 82 372 145 C410 175 390 215 345 225 L0 225 Z" fill="#E7A07D" stroke="${C.ink}" stroke-width="5"/>
        <path d="M40 190 C95 135 150 155 180 195 M240 100 C270 70 310 85 320 120 M300 175 C330 145 365 160 365 200" fill="none" stroke="#F6C1A8" stroke-width="12" stroke-linecap="round"/>
      </g>
      <g transform="translate(1580 610)">
        <path d="M0 170 C20 90 80 55 145 80 C175 20 245 15 280 65 C330 40 380 82 372 145 C410 175 390 215 345 225 L0 225 Z" fill="#D98E72" stroke="${C.ink}" stroke-width="5"/>
      </g>
    </g>
    <g transform="translate(1450 760)">
      <path d="M0 80 C0 30 40 0 90 0 C140 0 180 30 180 80 L160 150 C120 175 60 175 20 150 Z" fill="#B9875B" stroke="${C.ink}" stroke-width="5"/>
      <path d="M15 80 C40 52 140 52 165 80" fill="none" stroke="#E2B77D" stroke-width="6"/>
      <circle cx="90" cy="55" r="22" fill="${C.sun}" stroke="${C.ink}" stroke-width="4"/>
      <path d="M90 42 L96 56 L110 57 L99 66 L103 80 L90 71 L77 80 L81 66 L70 57 L84 56 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="2"/>
      <path d="M35 150 L25 190 M145 150 L155 190" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>
    </g>
    <g transform="translate(280 560) scale(0.52)">${fishSvg(0)}</g>
    <g transform="translate(920 480) scale(0.4)">${fishSvg(1)}</g>
    <g transform="translate(1240 470) scale(0.32)">${fishSvg(2)}</g>
    <g transform="translate(520 300) scale(0.3)">${fishSvg(2)}</g>
    <g fill="${C.paper}" opacity="0.7">
      <circle cx="390" cy="330" r="10"/><circle cx="430" cy="290" r="5"/><circle cx="360" cy="260" r="4"/>
      <circle cx="1180" cy="260" r="8"/><circle cx="1220" cy="220" r="4"/>
      <circle cx="1700" cy="520" r="9"/><circle cx="1750" cy="480" r="5"/>
    </g>
    ${mapSign({ x: 350, y: 430, width: 300, title: '海底奇遇', sub: '第 16–25 关 · 数字与逻辑', icon: 'star', floating: true })}
    <g transform="translate(1510 150)">
      <path d="M20 42 L20 140" stroke="${C.brown}" stroke-width="10" stroke-linecap="round"/>
      <rect x="-8" y="0" width="250" height="70" rx="22" fill="${C.paper}" stroke="${C.ink}" stroke-width="4"/>
      <text x="26" y="43" font-family="'ZCOOL KuaiLe','PingFang SC',sans-serif" font-size="32" fill="${C.ink}">珍珠宫</text>
    </g>
    <path d="${mapPath(p)}" fill="none" stroke="${C.paper}" stroke-width="20" stroke-linecap="round" opacity="0.8"/>
    <path d="${mapPath(p)}" fill="none" stroke="${C.brown}" stroke-width="5" stroke-linecap="round" stroke-dasharray="3 18"/>
    <g transform="translate(1050 950) rotate(-8)">
      <path d="M0 22 L70 22 L52 50 L18 50 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M32 20 L32 -30 L78 12 L32 12" fill="${C.coral}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>
    </g>
  `, '#3D93AA', '#1B5265', '#2B7689');
}

export function confettiSvg(): string {
  const bits = [
    [140, 160, 0], [320, 110, 25], [510, 180, 50], [720, 100, 15], [940, 160, 70],
    [1140, 90, 35], [1340, 150, 5], [1540, 100, 60], [1700, 190, 20], [250, 310, 40],
    [620, 300, 0], [1230, 320, 65], [1450, 300, 30], [1800, 330, 50], [80, 420, 10],
    [1810, 460, 75], [420, 430, 55], [1120, 440, 25], [820, 420, 15], [1610, 410, 0],
  ];
  const colors = [C.sun, C.coral, C.teal, C.grape, C.leaf, C.rose];
  return `<svg class="confetti-svg" viewBox="0 0 1920 1080" aria-hidden="true" focusable="false">
    ${bits.map(([x, y, rot], index) => {
      const color = colors[index % colors.length];
      return `<g class="confetti-piece" style="--x:${x}px;--y:${y}px;--rot:${rot}deg;--delay:${index * 0.035}s"><rect x="-8" y="-5" width="16" height="10" rx="3" fill="${color}" stroke="${C.ink}" stroke-width="2"/></g>`;
    }).join('')}
  </svg>`;
}

export function worldLabel(world: WorldId): { name: string; color: string } {
  switch (world) {
    case 'forest': return { name: '青芽森林', color: C.leaf };
    case 'candy': return { name: '糖果镇', color: C.coral };
    case 'castle': return { name: '星光城堡', color: C.grape };
    case 'sky': return { name: '云上天空', color: C.teal };
    case 'ocean': return { name: '海底奇遇', color: C.tealDark };
    case 'dino': return { name: '恐龙化石谷', color: C.leafDark };
    case 'space': return { name: '星际数字站', color: C.navy };
    case 'music': return { name: '音乐泡泡镇', color: C.coral };
    case 'donut': return { name: '甜甜圈工厂', color: C.sunDeep };
    case 'magic': return { name: '魔法花园', color: C.grapeDark };
  }
}


function lollipopTree(x: number, y: number, scale: number, color: string): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})"><g class="lollipop-tree">
    <path d="M58 220 C54 170 55 128 58 82" stroke="${C.brown}" stroke-width="11" stroke-linecap="round"/>
    <circle cx="58" cy="58" r="54" fill="${color}" stroke="${C.ink}" stroke-width="5"/>
    <path d="M58 8 C80 8 102 22 106 46 C110 72 92 94 66 104 C42 112 16 96 12 70 C8 44 28 14 58 8 Z" fill="#FFF4E8" opacity="0.28"/>
    <path d="M58 16 C82 16 100 36 96 60 C92 84 70 98 48 92 C28 86 20 66 28 48 C36 30 48 16 58 16 Z" fill="none" stroke="${C.ink}" stroke-width="3" opacity="0.45"/>
    <path d="M58 16 C44 30 38 48 42 66 C46 82 58 92 72 88" fill="none" stroke="${C.paper}" stroke-width="3" opacity="0.7"/>
    <path d="M30 198 C44 188 72 188 88 198" fill="none" stroke="${C.leaf}" stroke-width="12" stroke-linecap="round"/>
  </g></g>`;
}
function candyCaneFence(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})"><g class="candy-cane-fence">
    <path d="M16 100 V28 C16 8 38 4 44 22 C50 38 36 46 28 38" fill="none" stroke="${C.coral}" stroke-width="14" stroke-linecap="round"/>
    <path d="M16 100 V28 C16 8 38 4 44 22 C50 38 36 46 28 38" fill="none" stroke="${C.paper}" stroke-width="4" stroke-linecap="round" stroke-dasharray="7 12"/>
    <path d="M84 100 V22 C84 2 106 -2 112 16 C118 32 104 40 96 32" fill="none" stroke="${C.teal}" stroke-width="14" stroke-linecap="round"/>
    <path d="M84 100 V22 C84 2 106 -2 112 16 C118 32 104 40 96 32" fill="none" stroke="${C.paper}" stroke-width="4" stroke-linecap="round" stroke-dasharray="7 12"/>
    <path d="M0 100 H124" stroke="${C.ink}" stroke-width="4" stroke-linecap="round" opacity="0.4"/>
  </g></g>`;
}
function gumdropBush(x: number, y: number, scale: number, color: string): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})"><g class="gumdrop-bush">
    <path d="M0 88 C0 54 20 30 48 34 C58 12 94 12 104 38 C132 38 148 62 140 88 Z" fill="${color}" stroke="${C.ink}" stroke-width="4"/>
    <g fill="${C.paper}" opacity="0.7"><circle cx="32" cy="58" r="7"/><circle cx="70" cy="42" r="5"/><circle cx="104" cy="66" r="6"/></g>
    <path d="M22 88 h104" stroke="${C.ink}" stroke-width="4" opacity="0.35"/>
  </g></g>`;
}
function gumballMachine(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})"><g class="gumball-machine">
    <path d="M20 110 H140 L126 240 H34 Z" fill="#DDBB83" stroke="${C.ink}" stroke-width="4"/>
    <circle cx="80" cy="100" r="78" fill="#BFEAF5" fill-opacity="0.6" stroke="${C.ink}" stroke-width="4"/>
    <g fill="${C.coral}"><circle cx="46" cy="77" r="13"/><circle cx="75" cy="62" r="12"/><circle cx="106" cy="74" r="13"/><circle cx="60" cy="102" r="12"/><circle cx="92" cy="104" r="12"/><circle cx="78" cy="125" r="11"/></g>
    <path d="M18 104 H142" stroke="${C.ink}" stroke-width="5"/>
    <circle cx="80" cy="170" r="16" fill="${C.sun}" stroke="${C.ink}" stroke-width="4"/>
    <path d="M80 154 V132" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>
    <path d="M38 224 H122" stroke="${C.ink}" stroke-width="3" opacity="0.4"/>
  </g></g>`;
}


function castleBanner(x: number, y: number, scale: number, color: string): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="castle-banner">
      <path d="M18 300 V14" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>
      <circle cx="18" cy="10" r="9" fill="${C.sun}" stroke="${C.ink}" stroke-width="3"/>
      <path d="M24 30 H104 L88 74 L104 118 H24 Z" fill="${color}" stroke="${C.ink}" stroke-width="4"/>
      <path d="M55 55 l5 14 16 1 -12 10 4 16 -13 -8 -13 8 4 -16 -12 -10 16 -1 Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="2"/>
      <path d="M24 132 C48 144 80 144 104 132" fill="none" stroke="${C.ink}" stroke-width="3" opacity="0.5"/>
    </g>
  </g>`;
}
function castleTorch(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="castle-torch">
      <path d="M18 170 V58" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>
      <path d="M0 170 H36" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>
      <path d="M4 58 H32 L26 78 H10 Z" fill="${C.amber}" stroke="${C.ink}" stroke-width="3"/>
      <path d="M18 12 C4 34 4 48 18 56 C32 48 32 34 18 12 Z" fill="${C.coral}" stroke="${C.ink}" stroke-width="3"/>
      <path d="M18 28 C12 38 12 45 18 50 C24 45 24 38 18 28 Z" fill="${C.sun}"/>
    </g>
  </g>`;
}
function castleRoseWindow(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="castle-rose">
      <circle cx="140" cy="140" r="116" fill="${C.grapeDark}" stroke="${C.ink}" stroke-width="7"/>
      <circle cx="140" cy="140" r="94" fill="${C.grape}" stroke="${C.ink}" stroke-width="4"/>
      <g fill="${C.sun}" opacity="0.9"><circle cx="140" cy="140" r="24"/><circle cx="140" cy="62" r="10"/><circle cx="140" cy="218" r="10"/><circle cx="62" cy="140" r="10"/><circle cx="218" cy="140" r="10"/></g>
      <g fill="none" stroke="${C.cream}" stroke-width="4" opacity="0.85">
        <circle cx="140" cy="140" r="24"/><path d="M140 46 V234 M46 140 H234 M74 74 L206 206 M206 74 L74 206"/>
      </g>
      <circle cx="140" cy="140" r="7" fill="${C.paper}" stroke="${C.ink}" stroke-width="3"/>
    </g>
  </g>`;
}
function skyRainbow(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="sky-rainbow">
      <path d="M0 220 C150 0 420 0 570 220" fill="none" stroke="${C.rose}" stroke-width="28" opacity="0.55"/>
      <path d="M0 220 C150 0 420 0 570 220" fill="none" stroke="${C.sun}" stroke-width="20" opacity="0.5"/>
      <path d="M0 220 C150 0 420 0 570 220" fill="none" stroke="${C.teal}" stroke-width="12" opacity="0.45"/>
      <circle cx="25" cy="208" r="38" fill="${C.paper}" opacity="0.65"/><circle cx="545" cy="208" r="38" fill="${C.paper}" opacity="0.65"/>
    </g>
  </g>`;
}
function skyBalloon(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="sky-balloon">
      <path d="M92 10 C30 10 6 68 30 112 C48 144 76 152 92 158 C108 152 136 144 154 112 C178 68 154 10 92 10 Z" fill="${C.coral}" stroke="${C.ink}" stroke-width="5"/>
      <path d="M92 20 C62 20 45 46 48 72 M92 24 C120 24 138 50 134 76" fill="none" stroke="${C.sun}" stroke-width="7" stroke-linecap="round" opacity="0.8"/>
      <path d="M72 156 L62 196 H122 L112 156" fill="#DDBB83" stroke="${C.ink}" stroke-width="4"/>
      <path d="M64 196 H120" stroke="${C.ink}" stroke-width="4"/>
      <path d="M70 162 L92 128 L114 162" fill="none" stroke="${C.ink}" stroke-width="2" opacity="0.45"/>
      <circle cx="92" cy="56" r="8" fill="${C.cream}" stroke="${C.ink}" stroke-width="2" opacity="0.7"/>
    </g>
  </g>`;
}
function skyFloatingIsland(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="sky-island">
      <path d="M0 60 C38 10 128 0 200 28 C248 10 286 36 300 72 C260 104 46 112 0 60 Z" fill="${C.paper}" stroke="${C.ink}" stroke-width="5"/>
      <path d="M24 72 C74 110 220 110 274 70 C230 174 130 220 54 168 Z" fill="#B49B74" stroke="${C.ink}" stroke-width="4"/>
      <path d="M86 66 C82 40 96 24 114 28 C128 32 136 48 130 64 Z" fill="${C.leaf}" stroke="${C.ink}" stroke-width="3.5"/>
      <path d="M110 28 L110 4 M110 16 L126 8 M110 22 L94 14" stroke="${C.leafDark}" stroke-width="3" stroke-linecap="round"/>
      <g fill="${C.sun}"><circle cx="208" cy="48" r="8"/><circle cx="234" cy="62" r="4"/></g>
      <path d="M154 28 C178 18 218 18 240 32" fill="none" stroke="${C.teal}" stroke-width="3" opacity="0.5"/>
    </g>
  </g>`;
}
function skyBirdFlock(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="sky-birds" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round">
      <path d="M0 20 C14 4 28 4 42 20 C56 4 70 4 84 20"/>
      <path d="M58 58 C68 47 78 47 88 58 C98 47 108 47 118 58"/>
      <path d="M112 15 C120 7 128 7 136 15 C144 7 152 7 160 15"/>
    </g>
  </g>`;
}


function dinoVolcano(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="dino-volcano">
      <path d="M0 260 L72 76 L108 104 L142 52 L190 110 L218 88 L300 260 Z" fill="#8B6F4E" stroke="${C.ink}" stroke-width="5"/>
      <path d="M106 104 L128 80 L154 112 L142 142 L118 148 Z" fill="#4A3020" stroke="${C.ink}" stroke-width="3"/>
      <path d="M128 86 C118 56 138 32 160 42 C148 52 148 68 160 78 C146 86 138 90 128 86 Z" fill="${C.coral}" stroke="${C.ink}" stroke-width="3"/>
      <g class="dino-smoke" fill="none" stroke="#D8C5A3" stroke-width="7" stroke-linecap="round" opacity="0.65">
        <path d="M146 38 C128 18 154 0 172 6 C194 -6 214 16 198 30"/><path d="M178 16 C200 2 226 18 218 38"/>
      </g>
      <path d="M188 166 C218 180 236 206 240 260" fill="none" stroke="#F27059" stroke-width="8" stroke-linecap="round" opacity="0.8"/>
      <g fill="#7A5A3E"><circle cx="70" cy="206" r="8"/><circle cx="226" cy="220" r="6"/><circle cx="256" cy="248" r="5"/></g>
    </g>
  </g>`;
}
function dinoSkeleton(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="dino-skeleton">
      <g fill="#F4E6CB" stroke="${C.ink}" stroke-width="3.5" stroke-linejoin="round">
        <path d="M22 96 C12 75 26 55 50 58 C70 60 78 77 68 91 C60 102 38 108 22 96 Z"/>
        <circle cx="48" cy="69" r="5" fill="${C.ink}"/><path d="M32 92 q16 8 30 0" fill="none" stroke="${C.ink}" stroke-width="2"/>
        <path d="M70 88 C110 76 150 88 174 112 L162 124 C138 108 108 100 76 106 Z"/>
        <path d="M88 82 L88 132 M112 82 L112 138 M136 90 L136 130 M156 100 L156 120" stroke-width="4"/>
        <path d="M172 112 C196 118 210 140 202 160 C194 176 178 176 170 162" fill="none" stroke-width="4"/>
        <path d="M22 96 C6 112 -2 132 10 145 C20 155 34 147 32 136" fill="none" stroke-width="4"/>
      </g>
      <path d="M64 112 L52 142 M98 118 L88 146" stroke="${C.ink}" stroke-width="4" stroke-linecap="round" opacity="0.4"/>
    </g>
  </g>`;
}
function dinoEggNest(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="dino-nest">
      <path d="M0 80 C20 40 118 40 150 80 C130 110 28 114 0 80 Z" fill="#A9784F" stroke="${C.ink}" stroke-width="4"/>
      <path d="M18 80 C38 54 112 54 132 80 M8 88 C38 66 116 66 144 88" fill="none" stroke="#DDBB83" stroke-width="4" stroke-linecap="round"/>
      <g fill="#F6C7B9" stroke="${C.ink}" stroke-width="3.5">
        <path d="M38 70 C22 50 34 28 50 32 C64 36 66 58 52 72 Z"/>
        <path d="M68 62 C52 38 66 18 82 24 C96 30 96 52 82 64 Z"/>
        <path d="M100 72 C86 50 100 30 116 36 C130 42 128 64 114 74 Z"/>
      </g>
      <g fill="#C95745" opacity="0.6"><circle cx="42" cy="48" r="3"/><circle cx="78" cy="38" r="2.5"/><circle cx="112" cy="52" r="3"/></g>
    </g>
  </g>`;
}
function fernCluster(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="fern-sway" fill="none" stroke="#4D8A43" stroke-width="5" stroke-linecap="round">
      <path d="M40 120 C20 80 26 48 54 24 M40 120 C66 82 82 54 92 24 M40 120 C12 98 2 78 -4 52"/>
      <g stroke="#79B85A" stroke-width="4"><path d="M27 48 l-16 -8 M31 62 l-18 -4 M38 38 l-12 -13 M52 38 l13 -12 M66 58 l19 -6 M74 78 l18 -2"/></g>
    </g>
  </g>`;
}
function spaceSatellite(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="space-satellite">
      <rect x="52" y="36" width="70" height="58" rx="8" fill="#B9C7D0" stroke="${C.ink}" stroke-width="4"/>
      <rect x="66" y="52" width="42" height="26" rx="4" fill="${C.sky}" stroke="${C.ink}" stroke-width="3"/>
      <path d="M52 52 H4 V82 H52 M122 52 H170 V82 H122" fill="#7FB6D9" stroke="${C.ink}" stroke-width="4"/>
      <path d="M4 52 V82 M20 52 V82 M36 52 V82 M138 52 V82 M154 52 V82 M170 52 V82" stroke="${C.ink}" stroke-width="2" opacity="0.5"/>
      <path d="M78 36 V14 M96 36 V20" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="78" cy="12" r="5" fill="${C.sun}" stroke="${C.ink}" stroke-width="2"/>
      <circle cx="96" cy="20" r="4" fill="${C.coral}" stroke="${C.ink}" stroke-width="2"/>
    </g>
  </g>`;
}
function spaceAsteroidBelt(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="space-asteroids">
      <path d="M0 54 C-2 28 20 8 48 16 C76 24 84 54 62 72 C42 88 10 78 0 54 Z" fill="#8B6F4E" stroke="${C.ink}" stroke-width="4"/>
      <circle cx="30" cy="38" r="8" fill="#6E563B"/><circle cx="55" cy="58" r="5" fill="#6E563B"/>
      <path d="M98 18 C108 2 132 8 136 24 C142 42 124 54 110 46 C98 40 92 30 98 18 Z" fill="#A9784F" stroke="${C.ink}" stroke-width="3.5"/>
      <path d="M104 96 C118 86 142 94 146 110 C150 126 134 138 118 130 C104 124 96 108 104 96 Z" fill="#8B6F4E" stroke="${C.ink}" stroke-width="3"/>
    </g>
  </g>`;
}
function spaceStation(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="space-station">
      <ellipse cx="90" cy="90" rx="82" ry="30" fill="none" stroke="${C.sun}" stroke-width="5" opacity="0.7"/>
      <circle cx="90" cy="88" r="44" fill="#24445C" stroke="${C.ink}" stroke-width="5"/>
      <circle cx="90" cy="88" r="22" fill="#7FB6D9" stroke="${C.ink}" stroke-width="3"/>
      <path d="M90 44 V12 M90 132 V164 M46 88 H8 M134 88 H176" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>
      <g fill="${C.sun}" stroke="${C.ink}" stroke-width="2"><circle cx="90" cy="12" r="7"/><circle cx="90" cy="164" r="7"/><circle cx="8" cy="88" r="7"/><circle cx="176" cy="88" r="7"/></g>
      <g class="station-lights" fill="${C.paper}"><circle cx="66" cy="74" r="4"/><circle cx="114" cy="74" r="4"/><circle cx="66" cy="102" r="4"/><circle cx="114" cy="102" r="4"/></g>
    </g>
  </g>`;
}
function spaceConstellation(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="constellation" fill="${C.paper}" stroke="${C.sun}" stroke-width="2">
      <path d="M0 38 L46 10 L96 32 L146 4 L190 30" fill="none" stroke="${C.sun}" stroke-width="2" opacity="0.55"/>
      <g><circle cx="0" cy="38" r="4"/><circle cx="46" cy="10" r="5"/><circle cx="96" cy="32" r="4"/><circle cx="146" cy="4" r="4"/><circle cx="190" cy="30" r="5"/></g>
    </g>
  </g>`;
}


function musicHarp(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="music-harp">
      <path d="M30 300 V46 C30 18 56 8 74 28 L204 294 Z" fill="none" stroke="${C.ink}" stroke-width="10" stroke-linejoin="round"/>
      <path d="M44 286 V58 C44 42 58 34 70 48 L188 286" fill="none" stroke="${C.sun}" stroke-width="7"/>
      <g stroke="${C.paper}" stroke-width="2.5" opacity="0.8"><path d="M60 82 L182 286 M74 58 L196 270 M88 48 L203 252 M102 40 L210 232"/></g>
      <path d="M30 300 H204" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/>
      <circle cx="204" cy="294" r="8" fill="${C.coral}" stroke="${C.ink}" stroke-width="3"/>
    </g>
  </g>`;
}
function musicDrum(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="music-drum">
      <ellipse cx="100" cy="80" rx="82" ry="30" fill="${C.sun}" stroke="${C.ink}" stroke-width="5"/>
      <path d="M18 80 V160 C18 190 182 190 182 160 V80" fill="${C.coral}" stroke="${C.ink}" stroke-width="5"/>
      <ellipse cx="100" cy="80" rx="82" ry="30" fill="none" stroke="${C.cream}" stroke-width="4"/>
      <path d="M26 96 L48 182 M174 96 L152 182 M58 106 L68 186 M142 106 L132 186" stroke="${C.ink}" stroke-width="3" opacity="0.65"/>
      <path d="M76 18 L58 2 M124 18 L142 2" stroke="${C.brown}" stroke-width="7" stroke-linecap="round"/>
      <circle cx="56" cy="0" r="6" fill="${C.cream}" stroke="${C.ink}" stroke-width="2"/><circle cx="144" cy="0" r="6" fill="${C.cream}" stroke="${C.ink}" stroke-width="2"/>
    </g>
  </g>`;
}
function musicNotes(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="music-notes" fill="none" stroke="${C.grapeDark}" stroke-width="5" stroke-linecap="round">
      <path d="M0 80 C30 40 80 30 120 50 C160 70 200 52 230 20"/>
      <path d="M30 40 V10 M78 26 V-4 M126 48 V18 M174 58 V28"/>
      <g fill="${C.coral}" stroke="${C.ink}" stroke-width="2"><ellipse cx="20" cy="42" rx="12" ry="8" transform="rotate(-18 20 42)"/><ellipse cx="68" cy="28" rx="12" ry="8" transform="rotate(-18 68 28)"/><ellipse cx="116" cy="50" rx="12" ry="8" transform="rotate(-18 116 50)"/></g>
    </g>
  </g>`;
}
function stageSpotlight(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="stage-spotlight">
      <rect x="0" y="0" width="110" height="54" rx="12" fill="${C.ink}" stroke="${C.ink}" stroke-width="4"/>
      <circle cx="26" cy="26" r="14" fill="${C.sun}" stroke="${C.paper}" stroke-width="3"/>
      <circle cx="58" cy="26" r="14" fill="${C.coral}" stroke="${C.paper}" stroke-width="3"/>
      <circle cx="90" cy="26" r="14" fill="${C.teal}" stroke="${C.paper}" stroke-width="3"/>
      <path d="M20 54 L-50 240 H90 L60 54 Z" fill="${C.sun}" opacity="0.16"/>
      <path d="M80 54 L40 240 H150 L120 54 Z" fill="${C.teal}" opacity="0.13"/>
    </g>
  </g>`;
}
function donutConveyor(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="donut-conveyor">
      <rect x="0" y="70" width="300" height="54" rx="20" fill="#8B5E3C" stroke="${C.ink}" stroke-width="4"/>
      <g fill="${C.paper}" opacity="0.6"><circle cx="32" cy="97" r="12"/><circle cx="90" cy="97" r="12"/><circle cx="148" cy="97" r="12"/><circle cx="206" cy="97" r="12"/><circle cx="264" cy="97" r="12"/></g>
      <g transform="translate(24 20)"><circle cx="40" cy="40" r="28" fill="#D99A5C" stroke="${C.ink}" stroke-width="4"/><circle cx="40" cy="40" r="10" fill="${C.cream}" stroke="${C.ink}" stroke-width="3"/><path d="M20 34 C28 20 50 18 60 30" fill="none" stroke="${C.rose}" stroke-width="8" stroke-linecap="round"/></g>
      <g transform="translate(142 12) scale(.85)"><circle cx="40" cy="40" r="28" fill="#D99A5C" stroke="${C.ink}" stroke-width="4"/><circle cx="40" cy="40" r="10" fill="${C.cream}" stroke="${C.ink}" stroke-width="3"/><path d="M20 34 C28 20 50 18 60 30" fill="none" stroke="${C.sun}" stroke-width="8" stroke-linecap="round"/></g>
      <path d="M0 140 H300" stroke="${C.ink}" stroke-width="4" stroke-linecap="round" opacity="0.35"/>
    </g>
  </g>`;
}
function donutPipes(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="donut-pipes">
      <path d="M0 40 H92 C112 40 112 60 92 60 H30 V152 C30 170 52 170 52 152 V110" fill="none" stroke="${C.ink}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M0 40 H92 C112 40 112 60 92 60 H30 V152 C30 170 52 170 52 152 V110" fill="none" stroke="${C.teal}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="92" cy="50" r="13" fill="${C.sun}" stroke="${C.ink}" stroke-width="3"/>
      <path d="M134 20 V150" stroke="${C.ink}" stroke-width="14" stroke-linecap="round"/><path d="M134 20 V150" stroke="${C.coral}" stroke-width="8" stroke-linecap="round"/>
      <rect x="112" y="150" width="44" height="20" rx="5" fill="${C.sun}" stroke="${C.ink}" stroke-width="3"/>
    </g>
  </g>`;
}
function donutSign(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="donut-sign">
      <path d="M92 120 V210" stroke="${C.ink}" stroke-width="8"/>
      <circle cx="92" cy="76" r="68" fill="#D99A5C" stroke="${C.ink}" stroke-width="5"/>
      <circle cx="92" cy="76" r="28" fill="${C.cream}" stroke="${C.ink}" stroke-width="4"/>
      <path d="M38 62 C48 38 76 28 106 36 C126 42 142 56 146 72" fill="none" stroke="${C.rose}" stroke-width="14" stroke-linecap="round"/>
      <g fill="${C.paper}"><rect x="52" y="48" width="4" height="12" rx="2" transform="rotate(-25 54 54)"/><rect x="108" y="42" width="4" height="12" rx="2" transform="rotate(25 110 48)"/><rect x="122" y="82" width="4" height="12" rx="2" transform="rotate(65 124 88)"/></g>
      <path d="M58 210 H126" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>
    </g>
  </g>`;
}
function donutBoxes(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="donut-boxes">
      <g transform="translate(0 70)"><path d="M0 30 H96 V120 H0 Z" fill="#DDBB83" stroke="${C.ink}" stroke-width="4"/><path d="M0 30 L16 8 H80 L96 30" fill="#F4E8CF" stroke="${C.ink}" stroke-width="4"/><circle cx="48" cy="70" r="16" fill="#D99A5C" stroke="${C.ink}" stroke-width="3"/><circle cx="48" cy="70" r="6" fill="${C.cream}"/></g>
      <g transform="translate(52 0)"><path d="M0 30 H96 V120 H0 Z" fill="#DDBB83" stroke="${C.ink}" stroke-width="4"/><path d="M0 30 L16 8 H80 L96 30" fill="#F4E8CF" stroke="${C.ink}" stroke-width="4"/><circle cx="48" cy="70" r="16" fill="#D99A5C" stroke="${C.ink}" stroke-width="3"/><circle cx="48" cy="70" r="6" fill="${C.cream}"/></g>
    </g>
  </g>`;
}
function magicPotionShelf(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="magic-potions">
      <path d="M0 120 H260" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>
      <g transform="translate(20 20)"><path d="M30 20 H62 V48 C82 60 82 92 60 108 H32 C10 92 10 60 30 48 Z" fill="#B9E3EA" stroke="${C.ink}" stroke-width="4"/><path d="M18 82 C34 72 58 84 74 74 V98 C54 106 30 98 18 102 Z" fill="${C.coral}" opacity="0.8"/><rect x="32" y="8" width="28" height="16" rx="4" fill="${C.brown}" stroke="${C.ink}" stroke-width="3"/><circle cx="46" cy="66" r="4" fill="${C.paper}" opacity="0.7"/></g>
      <g transform="translate(112 12)"><path d="M28 16 H56 V42 C78 54 84 86 62 104 H22 C0 86 6 54 28 42 Z" fill="#E7C7F1" stroke="${C.ink}" stroke-width="4"/><path d="M12 80 C30 68 54 86 72 74 V96 C52 104 30 94 12 100 Z" fill="${C.grape}" opacity="0.75"/><rect x="30" y="4" width="24" height="14" rx="4" fill="${C.brown}" stroke="${C.ink}" stroke-width="3"/><circle cx="42" cy="64" r="3.5" fill="${C.paper}" opacity="0.7"/></g>
      <g transform="translate(198 26)"><path d="M24 18 H52 C60 36 72 50 64 76 C58 96 18 96 12 76 C4 50 16 36 24 18 Z" fill="#FFF1C9" stroke="${C.ink}" stroke-width="4"/><path d="M10 74 C28 62 48 82 66 70 V86 C46 94 28 86 10 90 Z" fill="${C.sun}" opacity="0.9"/><rect x="26" y="6" width="24" height="14" rx="4" fill="${C.brown}" stroke="${C.ink}" stroke-width="3"/></g>
    </g>
  </g>`;
}
function magicMushroom(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="magic-mushroom">
      <path d="M70 280 C54 220 54 178 72 148 H128 C146 178 146 220 130 280 Z" fill="#FFF1D8" stroke="${C.ink}" stroke-width="5"/>
      <path d="M18 150 C18 70 182 70 182 150 C150 166 50 166 18 150 Z" fill="${C.coral}" stroke="${C.ink}" stroke-width="5"/>
      <g fill="${C.paper}" opacity="0.8"><circle cx="60" cy="120" r="13"/><circle cx="112" cy="102" r="9"/><circle cx="150" cy="132" r="11"/><circle cx="92" cy="140" r="7"/></g>
      <circle cx="82" cy="190" r="4" fill="${C.ink}"/><circle cx="118" cy="190" r="4" fill="${C.ink}"/><path d="M92 206 q8 6 16 0" fill="none" stroke="${C.ink}" stroke-width="2.5"/>
      <g fill="${C.grape}" opacity="0.75"><circle cx="40" cy="270" r="5"/><circle cx="160" cy="258" r="4"/><circle cx="54" cy="250" r="3"/></g>
    </g>
  </g>`;
}
function magicMirror(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="magic-mirror-prop">
      <ellipse cx="120" cy="130" rx="92" ry="118" fill="${C.grape}" stroke="${C.ink}" stroke-width="7"/>
      <ellipse cx="120" cy="130" rx="68" ry="92" fill="#DCEBFA" stroke="${C.ink}" stroke-width="4"/>
      <path d="M74 94 C96 74 130 74 158 96" fill="none" stroke="${C.paper}" stroke-width="6" stroke-linecap="round" opacity="0.85"/>
      <path d="M120 12 l7 21 22 2 -18 14 6 22 -17 -12 -18 12 6 -22 -17 -14 22 -2 Z" fill="${C.sun}" stroke="${C.ink}" stroke-width="3"/>
      <path d="M42 246 L120 220 L198 246" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>
    </g>
  </g>`;
}
function magicRune(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="magic-rune">
      <circle cx="120" cy="120" r="110" fill="none" stroke="${C.sun}" stroke-width="4" stroke-dasharray="10 12" opacity="0.7"/>
      <circle cx="120" cy="120" r="84" fill="none" stroke="${C.paper}" stroke-width="2" opacity="0.5"/>
      <path d="M120 30 L196 160 H44 Z" fill="none" stroke="${C.paper}" stroke-width="3" opacity="0.5"/>
      <path d="M120 60 L156 120 L120 180 L84 120 Z" fill="none" stroke="${C.sun}" stroke-width="5"/>
      <circle cx="120" cy="120" r="8" fill="${C.sun}"/>
      <g fill="${C.paper}" opacity="0.8"><circle cx="120" cy="20" r="4"/><circle cx="220" cy="120" r="4"/><circle cx="120" cy="220" r="4"/><circle cx="20" cy="120" r="4"/></g>
    </g>
  </g>`;
}
function magicCrystals(x: number, y: number, scale: number): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <g class="magic-crystals">
      <path d="M46 130 L24 56 L56 16 L90 62 L78 130 Z" fill="#B9E3EA" stroke="${C.ink}" stroke-width="4"/>
      <path d="M94 130 L84 62 L116 28 L144 74 L132 130 Z" fill="#E7C7F1" stroke="${C.ink}" stroke-width="4"/>
      <path d="M140 134 L136 82 L162 52 L186 90 L178 134 Z" fill="${C.rose}" stroke="${C.ink}" stroke-width="4"/>
      <g fill="${C.paper}" opacity="0.7"><path d="M48 64 L54 44 L74 60 L66 82 Z"/><path d="M106 78 L116 54 L130 78 L120 100 Z"/></g>
      <path d="M20 136 H196" stroke="${C.ink}" stroke-width="4" stroke-linecap="round" opacity="0.35"/>
    </g>
  </g>`;
}
