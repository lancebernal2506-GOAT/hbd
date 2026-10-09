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
const pick = list => list[Math.floor(Math.random() * list.length)];
const shuffle = list => list.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
// A spread of hues (rose, blush, coral, peach, lilac) so no two tulips match.
const hues = shuffle([346, 336, 352, 8, 22, 304, 340, 358, 16, 326]);
const colors = hues.map(h => {
  h += random(-5, 5);
  const sat = random(52, 70), lift = random(-3, 3);
  return [`hsl(${h} ${sat}% ${70 + lift}%)`, `hsl(${h} ${random(70, 90)}% ${95 + lift / 3}%)`, `hsl(${h} ${sat}% ${85 + lift}%)`];
});
const tulipDefs = `<defs>${colors.map(([deep, light, mid], i) =>
  `<linearGradient id="tf${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${deep}"/><stop offset=".5" stop-color="${light}"/><stop offset="1" stop-color="${mid}"/></linearGradient>` +
  `<linearGradient id="tb${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${deep}"/><stop offset=".6" stop-color="${mid}"/><stop offset="1" stop-color="${light}"/></linearGradient>`).join('')}</defs>`;

/* ---------- Greenery fanned out behind the tulips ---------- */
const greens = [-74, -52, -30, -10, 10, 30, 52, 74].map((a, i) => {
  const x = 210 + a * 1.35, s = random(.8, 1.05) + (i % 2 ? 0 : .12);
  const hue = random(100, 145), light = random(56, 68);
  return `<path class="leaf" style="fill:hsl(${hue} ${random(14, 22)}% ${light}%);stroke:hsl(${hue} 16% ${light - 12}%)" transform="translate(${x} 160) rotate(${a}) scale(${s})" d="M0 0 C-14 -26 -12 -62 0 -86 C12 -62 14 -26 0 0Z"/>`;
}).join('');

/* ---------- Baby's breath: thin sprays with little white blossoms ---------- */
function makeSpray(ox, oy, ex, ey, reach = 20) {
  const cx = (ox + ex) / 2 + random(-12, 12), cy = (oy + ey) / 2;
  const at = t => [(1 - t) ** 2 * ox + 2 * (1 - t) * t * cx + t * t * ex, (1 - t) ** 2 * oy + 2 * (1 - t) * t * cy + t * t * ey];
  const cluster = (px, py) => Array.from({ length: 4 }, () =>
    `<circle class="baby-flower" style="fill:${pick(['#fffdf8', '#fff7ef', '#fdf0f1', '#f7f4ff', '#fffaf0'])}" cx="${(px + random(-8, 8)).toFixed(1)}" cy="${(py + random(-7, 7)).toFixed(1)}" r="${random(2.2, 3.6).toFixed(1)}"/>`).join('');
  let parts = `<path class="baby-stem" style="stroke:${pick(['#97b28e', '#a6bd9d', '#88a681'])}" d="M${ox} ${oy} Q${cx} ${cy} ${ex} ${ey}"/>`;
  [.45, .62, .8].forEach(t => {
    const [px, py] = at(t), bx = px + random(-reach, reach), by = py - random(6, reach);
    parts += `<path class="baby-stem" d="M${px} ${py} L${bx} ${by}"/>${cluster(bx, by)}`;
  });
  return `<g aria-hidden="true">${parts + cluster(ex, ey)}</g>`;
}

// Evenly spaced origins (with a little jitter) so the sprays spread out instead of clumping.
const spaced = (n, from, to, i) => from + (i + random(.15, .85)) / n * (to - from);

// Behind the tulips: tall sprays rising above and between the blooms.
const breathBack = Array.from({ length: 13 }, (_, i) => {
  const ox = spaced(13, 105, 315, i);
  return makeSpray(ox, 178, ox + (ox - 210) * random(.6, 1.2) + random(-14, 14), random(18, 100));
}).join('');

// In front of the tulips: short sprays tucked in just below the blooms, plus a few on the outer edges.
const breathLow = Array.from({ length: 9 }, (_, i) => {
  const ox = spaced(9, 90, 330, i);
  return makeSpray(ox, 186, ox + (ox - 210) * random(.2, .45) + random(-8, 8), random(128, 164), 14);
}).join('');
const breathEdge = [-1, -1, 1, 1].map((side, i) => {
  const ox = 210 + side * (i % 2 ? 70 : 105);
  return makeSpray(ox, 178, 210 + side * random(150, 185), random(30, 100));
}).join('');
const breathFront = breathLow + breathEdge;

/* ---------- Tulips scattered at random inside a dome-shaped area ---------- */
const centers = (() => {
  const pts = [];
  let minDist = 36, tries = 0;
  while (pts.length < 10) {
    const x = random(78, 342), y = random(50, 148);
    const inside = ((x - 210) / 138) ** 2 + ((y - 142) / 94) ** 2 <= 1;
    if (inside && pts.every(p => Math.hypot(p.x - x, p.y - y) >= minDist)) pts.push({ x, y });
    else if (++tries % 150 === 0) minDist -= 2; // relax spacing if the area gets crowded
  }
  return pts;
})();

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
  return `<path class="stem" style="stroke:hsl(${random(110, 145)} ${random(14, 22)}% ${random(50, 60)}%)" d="M${x} ${y + 1} Q${x + random(-8, 8)} ${y + 60} ${endX} ${endY}"/>`;
}

function tulipMarkup({ x, y }, index) {
  const deep = colors[index][0];
  const angle = (x - 210) / 140 * 22 + random(-14, 14);
  const lines = splitMessage(messages[index]);
  const text = lines.map((line, n) =>
    `<text x="0" y="${lines.length === 1 ? -26 : -32 + n * 10}" text-anchor="middle">${escapeText(line)}</text>`).join('');
  const edge = `stroke="${deep}"`;
  return `<g class="tulip" data-flower="${index}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)})" role="button" tabindex="0" aria-label="Open tulip ${index + 1}">
      <circle class="hit-area" r="24" fill="transparent"/>
      <g class="bloom">
        <ellipse class="flower-base" cx="0" cy="5" rx="5" ry="4.5"/>
        <path class="petal petal-left" fill="url(#tb${index})" ${edge} d="M0 6 C-19 8 -25 -10 -21 -27 C-19 -35 -15 -41 -12 -45 C-8 -39 -4 -32 0 -24Z"/>
        <path class="petal petal-right" fill="url(#tb${index})" ${edge} d="M0 6 C19 8 25 -10 21 -27 C19 -35 15 -41 12 -45 C8 -39 4 -32 0 -24Z"/>
        <path class="petal petal-fl" fill="url(#tf${index})" ${edge} d="M0 9 C-14 9 -21 -4 -19 -20 C-17 -31 -11 -39 -4 -44 C-1 -40 2 -33 3 -22 C3 -10 2 0 0 9Z"/>
        <path class="petal petal-fr" fill="url(#tf${index})" ${edge} d="M0 9 C14 9 21 -4 19 -20 C17 -31 11 -39 4 -44 C1 -40 -2 -33 -3 -22 C-3 -10 -2 0 0 9Z"/>
        <path class="petal-vein petal-seam" d="M4 -44 C1 -40 -2 -33 -3 -22 C-3 -10 -2 0 0 9" stroke="${deep}"/>
        <path class="petal-vein" d="M-4 -38 C-12 -28 -15 -12 -10 6 M-9 -33 C-16 -22 -16 -8 -13 2 M10 -36 C15 -24 15 -10 10 5" stroke="${deep}"/>
        <path class="petal-inner" d="M-13 -22 Q-16 -8 -11 3 Q-8 -10 -13 -22Z"/>
        <circle class="flower-heart" cx="0" cy="-4" r="3"/>
        <g class="paper-note"><path d="M-25 -44 Q0 -49 25 -44 L22 -9 Q0 -5 -22 -9Z" fill="#fff9e9" stroke="#dfc8a5" stroke-width="1.2"/>${text}</g>
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
svg.innerHTML = `${tulipDefs}${wrapBack}${greens}${breathBack}<g class="stems">${centers.map(stemMarkup).join('')}</g>
  <g class="tulips">${byY.map(({ c, i }) => tulipMarkup(c, i)).join('')}</g>${breathFront}${wrapFront}${bow}`;

/* ---------- Opening a tulip full-screen ---------- */
function openFlower(flower) {
  lastFlower = flower;
  const bloomMarkup = flower.querySelector('.bloom').innerHTML;
  openFlowerSvg.innerHTML = `<path class="stem" stroke-width="1.5" d="M0 5 Q2 30 0 62" transform="translate(120 150) scale(1.95)"/>
    <g class="tulip screen-flower" transform="translate(120 150) scale(1.95)"><g class="bloom">${bloomMarkup}</g></g>`;
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
