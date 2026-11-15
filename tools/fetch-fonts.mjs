#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'web/src/fonts');
await mkdir(out, { recursive: true });
const content = JSON.parse(await readFile(path.join(root, 'web/src/content.json'), 'utf8'));
const sources = await Promise.all(
  ['web/src/main.ts', 'web/src/ui.ts', 'web/src/art/characters.ts', 'web/src/art/scenes.ts'].map((file) => readFile(path.join(root, file), 'utf8')),
);
const text = [
  ...sources,
  ...Object.values(content.voices),
  ...content.levels.flatMap((level) => [level.title, level.intro, ...level.rounds.map((round) => round.prompt)]),
].join('\n');
const chars = [...new Set([...text].filter((char) => /[\u3000-\u9fff\uff00-\uffef，。！？、：·–—（）「」“”‘’…]/.test(char)))].sort().join('');
console.log('glyph source characters:', [...chars].length);

async function grabGoogleFont(family, subset, file) {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}&display=swap&text=${encodeURIComponent(subset)}`;
  const css = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    },
  }).then(async (response) => {
    if (!response.ok) throw new Error(`${family} CSS ${response.status}: ${await response.text()}`);
    return response.text();
  });
  const match = css.match(/url\((https:[^)]+)\)/);
  if (!match) throw new Error(`${family}: no font URL in CSS`);
  const data = Buffer.from(await fetch(match[1]).then((response) => response.arrayBuffer()));
  await writeFile(path.join(out, file), data);
  console.log(`${family}: ${data.length} bytes -> ${file}`);
}

await grabGoogleFont('ZCOOL KuaiLe', chars, 'zcool-kuaile.woff2');
await grabGoogleFont('Fredoka', '0123456789/.,+-', 'fredoka.woff2');
