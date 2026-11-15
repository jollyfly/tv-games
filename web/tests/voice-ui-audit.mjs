// Checks every level's narration against the controls actually rendered on screen.
// Run from web/: node tests/voice-ui-audit.mjs
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const content = JSON.parse(fs.readFileSync('src/content.json', 'utf8'));
const audioDir = path.resolve('public/audio-v4');
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const rows = [];
const failures = [];

for (const level of content.levels) {
  await page.goto(`http://127.0.0.1:5173/?preview=${level.id}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(180);
  const ui = await page.evaluate(() => {
    const groups = [...document.querySelectorAll('.control-legend .keycap-group')];
    const controls = groups.map((g) => {
      const label = g.querySelector('.keycap-label')?.textContent?.trim() || '';
      const keyText = g.querySelector('.keycap-text')?.textContent?.trim() || '';
      if (keyText === 'OK') return { key: 'ok', label };
      if (keyText.includes('↩')) return { key: 'back', label };
      const d = g.querySelector('svg path')?.getAttribute('d') || '';
      if (d.startsWith('M27 16 H6')) return { key: 'left', label };
      if (d.startsWith('M5 16 H26')) return { key: 'right', label };
      if (d.startsWith('M16 27 V6')) return { key: 'up', label };
      if (d.startsWith('M16 5 V26')) return { key: 'down', label };
      return { key: 'other', label };
    });
    return {
      title: document.querySelector('.micro-title')?.textContent?.trim() || '',
      verb: document.querySelector('.micro-verb')?.textContent?.trim() || '',
      game: document.querySelector('.micro-board')?.getAttribute('data-game') || '',
      controls,
    };
  });
  const voice = content.voices[`micro-${level.id}`] || '';
  const keys = new Set(ui.controls.map((c) => c.key));
  const hold = ui.controls.some((c) => c.label.includes('按住')) || /按住|松手|松开/.test(ui.verb);
  const direction = ['left', 'right', 'up', 'down'].some((k) => keys.has(k));
  const checks = [];
  if (!voice) checks.push('没有语音文案');
  if (ui.title && !voice.includes(ui.title)) checks.push('没有播报关卡名');
  if (!fs.existsSync(path.join(audioDir, `micro-${level.id}.m4a`))) checks.push('音频文件不存在');
  if (hold) {
    if (!voice.includes('按住')) checks.push('按住类关卡没有说“按住”');
    if (!/松手|松开/.test(voice)) checks.push('按住类关卡没有说松开');
  } else {
    if (direction && !/方向键|左右键|上下键|左右|上下/.test(voice)) checks.push('有方向操作但语音没提方向');
    if (keys.has('ok') && !voice.includes('确定键')) checks.push('有确定键操作但语音没提确定键');
    if (!direction && voice.includes('方向键')) checks.push('没有方向操作但语音说方向键');
  }
  if (/看准时机，按确定键操作|用方向键操作，按确定键确认/.test(voice)) checks.push('残留通用尾巴');
  const status = checks.length ? 'FAIL' : 'PASS';
  rows.push({ id: level.id, title: ui.title, verb: ui.verb, game: ui.game, controls: ui.controls, voice, status, checks });
  if (checks.length) failures.push({ id: level.id, checks });
}

await browser.close();
const payload = {
  generatedAt: new Date().toISOString(),
  levels: rows.length,
  passed: rows.length - failures.length,
  failed: failures.length,
  failures,
  rows,
};
fs.mkdirSync('../docs', { recursive: true });
fs.writeFileSync('../docs/voice-audit.json', JSON.stringify(payload, null, 2));
const lines = [
  '# 逐关语音 × 实际屏幕操作一致性审计',
  '',
  `- 关卡数：${rows.length}`,
  `- 通过：${payload.passed}`,
  `- 失败：${payload.failed}`,
  `- 失败关卡：${failures.map((f) => `${f.id}（${f.checks.join('、')}）`).join('；') || '无'}`,
  '',
  '| 关卡 | 标题 | 当前屏幕操作 | 语音文案 | 音频 | 结果 |',
  '|---|---|---|---|---|---|',
];
for (const r of rows) {
  const op = r.controls.filter((c) => c.key !== 'back').map((c) => `${c.label}(${c.key})`).join(' / ');
  const audio = fs.existsSync(path.join(audioDir, `micro-${r.id}.m4a`)) ? '有' : '缺';
  lines.push(`| ${r.id} | ${r.title} | ${op} | ${r.voice} | ${audio} | ${r.status} |`);
}
fs.writeFileSync('../docs/09-voice-audit.md', lines.join('\n') + '\n');
console.log(`voice levels ${rows.length} passed ${payload.passed} failed ${payload.failed}`);
for (const failure of failures) console.log(failure.id, failure.checks.join(' / '));
process.exitCode = failures.length ? 1 : 0;
