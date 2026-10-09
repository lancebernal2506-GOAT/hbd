const svg = document.querySelector('#bouquet');
const flowerScreen = document.querySelector('#flower-screen');
const openFlowerSvg = document.querySelector('#open-flower');
let lastFlower = null;

const messages = [
  'You are loved', 'Keep blooming!', 'You make me smile', 'You are magic',
  'So proud of you', 'You are my sunshine', 'You can do this!', 'You are wonderful',
  'Sending a hug', 'You make life sweeter',
];
const random = (min, max) => Math.random() * (max - min) + min;
const palettes = [
  ['#ed849b', '#e97791', '#f49cb0'], ['#f3afbd', '#ed9bac', '#f7c3ca'],
  ['#dc7790', '#ce6582', '#e58aa0'], ['#f2c59d', '#edb486', '#f7d4b3'],
  ['#c996bf', '#b883ac', '#d8aed0'], ['#f6e3d8', '#efd2c4', '#fbeee6'],
];

/* ---------- Greenery fanned out behind the tulips ---------- */
const greens = [-74, -52, -30, -10, 10, 30, 52, 74].map((a, i) => {
  const x = 210 + a * 1.35, s = random(.8, 1.05) + (i % 2 ? 0 : .12);
  return `<path class="leaf" transform="translate(${x} 160) rotate(${a}) scale(${s})" d="M0 0 C-14 -26 -12 -62 0 -86 C12 -62 14 -26 0 0Z"/>`;
}).join('');

/* ---------- Baby's breath: thin sprays with little white blossoms ---------- */
const sprays = Array.from({ length: 18 }, () => {
  const ox = random(110, 310), oy = 178;
  const ex = ox + (ox - 210) * random(.5, 1.1) + random(-18, 18), ey = random(18, 100);
  const cx = (ox + ex) / 2 + random(-14, 14), cy = (oy + ey) / 2;
  const at = t => [(1 - t) ** 2 * ox + 2 * (1 - t) * t * cx + t * t * ex, (1 - t) ** 2 * oy + 2 * (1 - t) * t * cy + t * t * ey];
  const cluster = (px, py) => Array.from({ length: 4 }, () =>
    `<circle class="baby-flower" cx="${(px + random(-8, 8)).toFixed(1)}" cy="${(py + random(-7, 7)).toFixed(1)}" r="${random(2.2, 3.6).toFixed(1)}"/>`).join('');
  let parts = `<path class="baby-stem" d="M${ox} ${oy} Q${cx} ${cy} ${ex} ${ey}"/>`;
  [.5, .68, .84].forEach(t => {
    const [px, py] = at(t), bx = px + random(-22, 22), by = py - random(8, 20);
    parts += `<path class="baby-stem" d="M${px} ${py} L${bx} ${by}"/>${cluster(bx, by)}`;
  });
  parts += cluster(ex, ey);
  return { front: Math.abs(ex - 210) > 105, html: `<g aria-hidden="true">${parts}</g>` };
});
const breathBack = sprays.filter(s => !s.front).map(s => s.html).join('');
const breathFront = sprays.filter(s => s.front).map(s => s.html).join('');

/* ---------- Tulips arranged in a dome ---------- */
const centers = Array.from({ length: 10 }, (_, i) => {
  const t = i / 9;
  return {
    x: 84 + t * 252 + random(-4, 4),
    y: 126 - 62 * Math.sin(Math.PI * t) ** .8 + (i % 2 ? 12 : 0) + random(-4, 4),
  };
});

function splitMessage(text) {
  const words = text.split(' ');
  if (text.length <= 11) return [text];
  let best = 1, diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
    if (d < diff) { diff = d; best = i; }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}
const escapeText = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;');

function stemMarkup({ x, y }) {
  const endX = 210 + (x - 210) * .15, endY = 190;
  return `<path class="stem" d="M${x} ${y + 1} Q${x + random(-8, 8)} ${y + 60} ${endX} ${endY}"/>`;
}

function tulipMarkup({ x, y }, index) {
  const palette = palettes[Math.floor(random(0, palettes.length))];
  const angle = (x - 210) / 140 * 20 + random(-5, 5);
  const lines = splitMessage(messages[index]);
  const text = lines.map((line, n) =>
    `<text x="0" y="${lines.length === 1 ? -26 : -32 + n * 10}" text-anchor="middle">${escapeText(line)}</text>`).join('');
  return `<g class="tulip" data-flower="${index}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(1.05)" role="button" tabindex="0" aria-label="Open tulip ${index + 1}">
      <circle class="hit-area" r="24" fill="transparent"/>
      <g class="bloom">
        <path class="petal petal-left" fill="${palette[0]}" d="M1 6 C-17 7 -24 -9 -21 -26 C-20 -34 -18 -40 -15 -41 C-9 -36 -4 -30 0 -20Z"/>
        <path class="petal petal-right" fill="${palette[1]}" d="M-1 6 C17 7 24 -9 21 -26 C20 -34 18 -40 15 -41 C9 -36 4 -30 0 -20Z"/>
        <g class="paper-note"><path d="M-25 -44 Q0 -49 25 -44 L22 -9 Q0 -5 -22 -9Z" fill="#fff9e9" stroke="#dfc8a5" stroke-width="1.2"/>${text}</g>
        <path class="petal petal-center" fill="${palette[2]}" d="M-17 0 C-22 -12 -16 -29 -6 -35 Q0 -39 6 -35 C16 -29 22 -12 17 0 C10 9 -10 9 -17 0Z"/>
        <path class="petal-inner" d="M-8 -26 Q-12 -12 -7 0 Q-3 -13 -8 -26Z"/>
        <circle class="flower-heart" cx="0" cy="-4" r="3"/>
      </g>
    </g>`;
}

/* ---------- Paper wrap, cone and bow ---------- */
const pleats = [[96, 168], [132, 176], [170, 179], [250, 179], [288, 176], [324, 168]]
  .map(([px, py]) => `M${px} ${py} L${210 + (px - 210) * .12} 412`).join(' ');

const wrapBack = `<g aria-hidden="true">
  <path d="M46 132 Q52 98 98 104 Q150 70 210 78 Q270 70 322 104 Q368 98 374 132 Q360 172 210 184 Q60 172 46 132Z" fill="#c88fc3" stroke="#b57cb0" stroke-width="1.5"/>
</g>`;

const wrapFront = `<g aria-hidden="true">
  <path d="M186 405 L166 470 Q188 480 210 468 Q232 480 254 470 L234 405Z" fill="#f3c9e5" stroke="#d896c6" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M192 420 L180 468 M201 424 L196 474 M210 424 L210 468 M219 424 L224 474 M228 420 L240 468" fill="none" stroke="#dba3cd" stroke-width="1.2"/>
  <path d="M64 150 Q138 182 210 172 Q282 182 356 150 L232 412 Q210 422 188 412Z" fill="#efb7dd" stroke="#d896c6" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M356 150 Q282 182 210 172 L206 418 Q220 418 232 412Z" fill="#e7a8d3" opacity=".75"/>
  <path d="M64 150 Q112 172 168 178 L124 272Z" fill="#fadcee" opacity=".7"/>
  <path d="${pleats}" fill="none" stroke="#d58fc2" stroke-width="1.2" opacity=".8"/>
</g>`;

const bow = `<g aria-hidden="true" stroke="#bb5a92" stroke-width="1.4" stroke-linejoin="round" fill="#d878ae">
  <path d="M207 358 Q195 385 184 408 L200 399 L211 366Z"/>
  <path d="M213 358 Q225 385 236 408 L220 399 L209 366Z"/>
  <path d="M210 355 C184 322 156 344 168 366 C178 380 200 366 210 355Z"/>
  <path d="M210 355 C236 322 264 344 252 366 C242 380 220 366 210 355Z"/>
  <path d="M182 346 Q172 356 178 366 M238 346 Q248 356 242 366" fill="none" stroke="#c4659c" stroke-width="1.2"/>
  <ellipse cx="210" cy="357" rx="8" ry="9" fill="#e58bbd"/>
</g>`;

const byY = centers.map((c, i) => ({ c, i })).sort((a, b) => a.c.y - b.c.y);
svg.innerHTML = `${wrapBack}${greens}${breathBack}<g class="stems">${centers.map(stemMarkup).join('')}</g>
  <g class="tulips">${byY.map(({ c, i }) => tulipMarkup(c, i)).join('')}</g>${breathFront}${wrapFront}${bow}`;

/* ---------- Opening a tulip full-screen ---------- */
function openFlower(flower) {
  lastFlower = flower;
  const bloomMarkup = flower.querySelector('.bloom').innerHTML;
  openFlowerSvg.innerHTML = `<path class="stem" stroke-width="1.5" d="M0 5 Q2 30 0 62" transform="translate(120 150) scale(2.3)"/>
    <g class="tulip screen-flower" transform="translate(120 150) scale(2.3)"><g class="bloom">${bloomMarkup}</g></g>`;
  flowerScreen.hidden = false;
  const bloom = openFlowerSvg.querySelector('.screen-flower');
  requestAnimationFrame(() => requestAnimationFrame(() => bloom.classList.add('is-open')));
}

function closeFlower() {
  flowerScreen.hidden = true;
  openFlowerSvg.replaceChildren();
  lastFlower?.focus();
}

svg.addEventListener('click', event => {
  const flower = event.target.closest('.tulip');
  if (flower) openFlower(flower);
});
svg.addEventListener('keydown', event => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.tulip')) {
    event.preventDefault();
    openFlower(event.target);
  }
});
flowerScreen.addEventListener('click', closeFlower);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !flowerScreen.hidden) closeFlower();
});
