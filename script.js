const svg = document.querySelector('#bouquet');
const flowerScreen = document.querySelector('#flower-screen');
const openFlowerSvg = document.querySelector('#open-flower');
const pickedGarden = document.querySelector('#picked-garden');
const finalPaper = document.querySelector('#final-paper');
let lastFlower = null;
let lastPickedButton = null;
const pickedFlowers = new Set();
const pickedButtons = new Map();
let completionPending = false;
let completionTimer = null;

const messages = [
  "You're a great friend and I'm very thankful to have you in my life, more than i could ever express", 
  "I hope that you see how much you mean to me with those mesmerizing eyes", 
  "You are beautiful and very very cute. I know you know that already🙄. You never fail to make me take a second to admire your beauty everyday", 
  'You are magic',
  'I am so so so so so so proud of you',
  'You brighten up my day with just your smile so keep smiling!', 
  'You can do this!', 
  'You are wonderful',
  'Sending a hug', 
  'You make life sweeter',
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
const paperColors = colors.map(([, , mid]) => mid);
finalPaper.querySelector('.poem-sheet').style.setProperty('--petal-gradient', `linear-gradient(135deg, ${paperColors.map((color, i) => `${color} ${(i / (paperColors.length - 1) * 100).toFixed(1)}%`).join(', ')})`);
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

// Baby's breath frames the final sheet, with the paper sitting in front of the stems.
const paperBreath = document.querySelector('#paper-breath');
const sideBreath = Array.from({ length: 14 }, (_, i) => {
  const side = i < 7 ? -1 : 1;
  const baseX = side < 0 ? random(15, 65) : random(635, 685);
  const endX = side < 0 ? random(45, 95) : random(605, 655);
  return makeSpray(baseX, random(650, 770), endX, random(150, 330), random(22, 38));
});
const topBreath = [205, 350, 495].map(x => makeSpray(x, 300, x + random(-26, 26), random(-35, 15), 34));
const bottomBreath = [220, 350, 480].map(x => makeSpray(x, 500, x + random(-24, 24), random(790, 840), 32));
paperBreath.innerHTML = [...sideBreath, ...topBreath, ...bottomBreath].join('');
paperBreath.querySelectorAll('.baby-flower').forEach(flower => {
  flower.setAttribute('r', (Number(flower.getAttribute('r')) * 1.45).toFixed(1));
});

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

function wrapMessage(text, maxLength = 13) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}
const escapeText = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;');

function stemMarkup({ x, y }, index) {
  const endX = 210 + (x - 210) * .15, endY = 190;
  return `<path class="stem flower-stem" data-flower="${index}" style="stroke:hsl(${random(110, 145)} ${random(14, 22)}% ${random(50, 60)}%)" d="M${x} ${y + 1} Q${x + random(-8, 8)} ${y + 60} ${endX} ${endY}"/>`;
}

function tulipMarkup({ x, y }, index) {
  const deep = colors[index][0];
  const angle = (x - 210) / 140 * 22 + random(-14, 14);
  const lines = wrapMessage(messages[index]);
  const firstLine = -18 - (lines.length - 1) * 3.25;
  const text = lines.map((line, n) =>
    `<text x="0" y="${firstLine + n * 6.5}" text-anchor="middle">${escapeText(line)}</text>`).join('');
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
        <g class="tulip-message">${text}</g>
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
  if (document.body.classList.contains('is-gathering') || finalPaper.classList.contains('is-visible')) return;
  lastFlower = flower;
  const id = Number(flower.dataset.flower);
  if (!pickedFlowers.has(id)) {
    pickedFlowers.add(id);
    flower.classList.add('is-picked');
    svg.querySelector(`.flower-stem[data-flower="${id}"]`)?.classList.add('is-picked');
    lastPickedButton = addPickedFlower(flower, id);
    if (pickedFlowers.size === messages.length) {
      completionPending = true;
      completionTimer = window.setTimeout(() => {
        if (!completionPending) return;
        completionPending = false;
        startGathering();
      }, 5000);
    }
  } else {
    lastPickedButton = pickedButtons.get(id) || null;
  }
  const [deep, light, mid] = colors[id];
  const lines = wrapMessage(messages[id], 22);
  const fontSize = Math.max(10.5, 14 - Math.max(0, lines.length - 3) * .9);
  const lineHeight = fontSize * 1.28;
  const firstLine = 243 - ((lines.length - 1) * lineHeight) / 2;
  const messageText = lines.map((line, index) =>
    `<text x="180" y="${(firstLine + index * lineHeight).toFixed(1)}">${escapeText(line)}</text>`).join('');
  const surfaceId = `tulip-page-${id}`;

  openFlowerSvg.innerHTML = `<defs>
      <linearGradient id="${surfaceId}" x1=".15" y1="0" x2=".85" y2="1">
        <stop offset="0" stop-color="${light}"/>
        <stop offset=".44" stop-color="${mid}"/>
        <stop offset="1" stop-color="${deep}"/>
      </linearGradient>
      <linearGradient id="${surfaceId}-highlight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".5"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <g class="screen-tulip-page">
      <path class="screen-message-surface" fill="url(#${surfaceId})" d="M180 443 C158 405 88 379 61 293 C36 215 55 121 105 79 C132 56 158 77 180 132 C202 77 228 56 255 79 C305 121 324 215 299 293 C272 379 202 405 180 443Z"/>
      <path class="screen-message-highlight" fill="url(#${surfaceId}-highlight)" d="M180 132 C158 77 132 56 105 79 C69 109 53 178 67 243 C101 219 137 207 180 208Z"/>
      <path class="screen-petal-fold" d="M180 132 C180 186 180 285 180 411 M105 79 C141 118 159 162 180 208 M255 79 C219 118 201 162 180 208 M64 291 C110 277 147 276 180 294 M296 291 C250 277 213 276 180 294"/>
      <path class="screen-petal-edge" d="M180 443 C158 405 88 379 61 293 C36 215 55 121 105 79 C132 56 158 77 180 132 C202 77 228 56 255 79 C305 121 324 215 299 293 C272 379 202 405 180 443Z"/>
      <g class="screen-message" style="font-size:${fontSize}px">${messageText}</g>
    </g>`;
  flowerScreen.hidden = false;
  const page = openFlowerSvg.querySelector('.screen-tulip-page');
  requestAnimationFrame(() => requestAnimationFrame(() => page.classList.add('is-open')));
}

function addPickedFlower(flower, id) {
  const item = document.createElement('button');
  item.type = 'button';
  item.className = 'picked-tulip';
  item.style.setProperty('--pick-delay', `${id * 35}ms`);
  item.setAttribute('aria-label', `Read picked tulip ${id + 1}`);
  item.innerHTML = `<svg class="picked-icon" viewBox="-28 -54 56 72" aria-hidden="true">${tulipDefs}<path class="stem" d="M0 4 Q-1 10 0 17"/><g class="tulip" transform="translate(0 0)"><g class="bloom">${flower.querySelector('.bloom').innerHTML}</g></g></svg>`;
  item.addEventListener('click', () => openFlower(flower));
  pickedGarden.append(item);
  pickedGarden.hidden = false;
  pickedButtons.set(id, item);
  return item;
}

function startGathering() {
  window.clearTimeout(completionTimer);
  completionPending = false;
  flowerScreen.hidden = true;
  openFlowerSvg.replaceChildren();
  document.body.classList.add('is-gathering');
  window.setTimeout(() => {
    finalPaper.hidden = false;
    requestAnimationFrame(() => finalPaper.classList.add('is-visible'));
  }, 950);
}

function closeFlower() {
  flowerScreen.hidden = true;
  openFlowerSvg.replaceChildren();
  lastPickedButton?.focus();
  if (completionPending) {
    completionPending = false;
    startGathering();
  }
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
