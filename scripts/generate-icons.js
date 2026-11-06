import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = path.join(root, 'assets');
const size = 1024;

const defs = `
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f04439" />
      <stop offset="0.47" stop-color="#a92325" />
      <stop offset="1" stop-color="#101112" />
    </linearGradient>
    <radialGradient id="glow" cx="0.2" cy="0.12" r="0.9">
      <stop offset="0" stop-color="#ff6354" stop-opacity="0.72" />
      <stop offset="0.56" stop-color="#e23830" stop-opacity="0.16" />
      <stop offset="1" stop-color="#101112" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="slash" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#f3483c" stop-opacity="0" />
      <stop offset="0.5" stop-color="#f3483c" stop-opacity="0.5" />
      <stop offset="1" stop-color="#f3483c" stop-opacity="0" />
    </linearGradient>
  </defs>`;

const background = `
  <rect width="1024" height="1024" fill="#101112" />
  <path d="M0 0h750L340 1024H0Z" fill="url(#base)" />
  <rect width="1024" height="1024" fill="url(#glow)" />
  <path d="M170 710 730 150h105L275 710Z" fill="url(#slash)" opacity=".8" />
  <path d="M0 824 1024 420v604H0Z" fill="#0c0d0e" opacity=".72" />
  <path d="M0 824 1024 420" fill="none" stroke="#ffffff" stroke-opacity=".12" stroke-width="2" />`;

const motorcycle = `
  <g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="340" cy="665" r="75" stroke-width="23" />
    <circle cx="340" cy="665" r="14" stroke-width="10" />
    <circle cx="700" cy="665" r="75" stroke-width="23" />
    <circle cx="700" cy="665" r="14" stroke-width="10" />
    <path d="m340 665 105-76 107 3 62 73M445 589l-54-88M550 592l55-103 95 5 54 171" stroke-width="18" />
    <path d="m601 485 51-51 63 13 54 51-29 31-73-14-62 16-43 62-77 9-45-39-85 13-38 89h-26l22-92 43-102 21-27 90-12 42-38 32-2 53 36 83 11 35 31 50 42-10 20-40-7-40-45-57-2-33 63-53 12-42-34-37 5-33 47" fill="#fff" stroke="#fff" stroke-width="8" />
    <path d="m485 539 41-4 48 48-22 39-66-4-40-38z" fill="#fff" stroke="#fff" stroke-width="8" />
    <path d="m395 489 72-13 38 11M621 472l48 7 28 24M712 482l31-31 31 6" stroke-width="13" />
    <path d="m608 489 42-6 39 15M468 538l-26 20M527 548l34 28" stroke="#a9272b" stroke-width="8" />
  </g>`;

const svgDoc = (content) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${content}</svg>`;
const composedSvg = svgDoc(`${defs}${background}${motorcycle}`);
const foregroundSvg = svgDoc(motorcycle);
const backgroundSvg = svgDoc(`${defs}${background}`);

await mkdir(assetsDir, { recursive: true });
await writeFile(path.join(assetsDir, 'icon-source.svg'), composedSvg);

await Promise.all([
  sharp(Buffer.from(composedSvg)).resize(size, size).png().toFile(path.join(assetsDir, 'icon-only.png')),
  sharp(Buffer.from(foregroundSvg)).resize(size, size).png().toFile(path.join(assetsDir, 'icon-foreground.png')),
  sharp(Buffer.from(backgroundSvg)).resize(size, size).png().toFile(path.join(assetsDir, 'icon-background.png')),
]);

console.log('Iconos SpeedMoto generados en assets/ (1024x1024).');