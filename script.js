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
  ['#c996bf', '#b883ac', '#d8aed0'], ['#f08e8e', '#e67a7d', '#f5a5a1'],
];

function leaf(x, y, angle, scale = 1) {
  return `<path class="leaf" transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})" d="M0 0 C-4 -12 -18 -16 -24 -13 C-21 -2 -11 4 0 0Z"/>`;
}

// Scatter small sprays of baby's breath between the tulips.
const breath = Array.from({ length: 9 }, () => {
  const x = random(92, 328), y = random(205, 310), direction = random(-1, 1);
  let parts = '';
  for (let i = 0; i < 3; i++) {
    const bx = x + direction * (i * 8 + 7), by = y - (i + 1) * 12;
    parts += `<path class="baby-stem" d="M${x} ${y} Q${x + direction * 9} ${y - 10} ${bx} ${by}"/>`;
    for (let j = 0; j < 3; j++) {
      const px = bx + random(-9, 9), py = by + random(-8, 8), r = random(2.2, 3.7);
      parts += `<circle class="baby-flower" cx="${px}" cy="${py}" r="${r}"/>`;
    }
  }
  return `<g aria-hidden="true">${parts}</g>`;
}).join('');

const centers = Array.from({ length: 10 }, (_, i) => ({
  x: 83 + i * 28 + random(-12, 12),
  y: 100 + random(5, 80),
})).sort((a, b) => a.x - b.x);

function tulipMarkup(point, index) {
  const { x, y } = point;
  const stemEndX = 210 + (x - 210) * .34 + random(-8, 8);
  const stemEndY = 398 + random(-5, 5);
  const palette = palettes[Math.floor(random(0, palettes.length))];
  const angle = random(-17, 17);
  const petals = `<path class="petal petal-left" fill="${palette[0]}" d="M0 5 C-19 -3 -24 -18 -17 -31 C-12 -42 -5 -35 0 -24Z"/>
    <path class="petal petal-right" fill="${palette[1]}" d="M0 5 C19 -3 24 -18 17 -31 C12 -42 5 -35 0 -24Z"/>
    <path class="petal petal-center" fill="${palette[2]}" d="M-14 4 C-17 -14 -11 -38 0 -42 C11 -38 17 -14 14 4 Q0 13 -14 4Z"/>
    <path class="petal-inner" d="M0 -30 Q-3 -18 0 -6 Q3 -18 0 -30Z"/>`;
  const message = messages[index].replaceAll('&', '&amp;').replaceAll('<', '&lt;');
  return `<path class="stem" d="M${x} ${y + 1} Q${x + random(-20, 20)} ${y + 112} ${stemEndX} ${stemEndY}"/>
    ${leaf(x + (stemEndX - x) * .32, y + 80, random(-25, 25), random(.85, 1.15))}
    ${index % 2 === 0 ? leaf(x + (stemEndX - x) * .69, y + 147, random(145, 210), .75) : ''}
    <g class="tulip" data-flower="${index}" transform="translate(${x} ${y}) rotate(${angle})" role="button" tabindex="0" aria-label="Open tulip ${index + 1}">
      <circle class="hit-area" r="31" fill="transparent"/>
      <g class="bloom">
        <g class="paper-note"><path d="M-23 -35 Q0 -41 23 -35 L20 -7 Q0 -3 -20 -7Z" fill="#fff9e9" stroke="#dfc8a5" stroke-width="1.2"/><text x="0" y="-23" text-anchor="middle" fill="#805e67" font-family="Georgia,serif" font-size="5.2">${message}</text><path d="M-13 -15 Q0 -17 13 -14" fill="none" stroke="#e7cbb8" stroke-width=".7"/></g>
        ${petals}<circle class="flower-heart" cx="0" cy="-4" r="3"/>
      </g>
    </g>`;
}

const wrapper = `<g aria-hidden="true">
  <path d="M54 128 L129 163 Q157 215 210 299 Q265 217 291 163 L366 129 L318 270 L236 399 Q210 420 184 399 L102 270Z" fill="#bd8252" stroke="#a96c43" stroke-width="2"/>
  <path d="M70 143 L140 174 Q169 226 210 284 Q251 228 279 174 L349 143 L305 269 L230 390 Q210 400 190 390 L115 269Z" fill="#e9c6a1" stroke="#d4a980" stroke-width="1.5"/>
  <path d="M70 143 L140 174 L115 269 L91 222Z" fill="#f2d6b4" opacity=".8"/>
  <path d="M349 143 L279 174 L305 269 L329 222Z" fill="#d9ae87" opacity=".8"/>
  <path d="M103 267 L210 345 L317 267 L230 390 Q210 402 190 390Z" fill="#f5ddc1" stroke="#d4a980" stroke-width="1.5"/>
</g>`;
const tiedStems = `<g aria-hidden="true" fill="none" stroke="#718b60" stroke-width="3" stroke-linecap="round">
  <path d="M185 402 Q176 450 176 495 M194 404 Q189 452 190 502 M202 406 Q199 456 201 496 M210 407 L210 505 M218 406 Q222 453 220 499 M226 404 Q233 450 232 496 M235 402 Q245 448 245 489"/>
  </g><g aria-hidden="true"><path d="M165 385 Q210 399 255 385 L250 408 Q210 420 170 408Z" fill="#e88f9e"/><path d="M173 397 Q148 403 157 424 Q175 417 182 405 M247 397 Q272 403 263 424 Q245 417 238 405" fill="none" stroke="#db7d91" stroke-width="5" stroke-linecap="round"/></g>`;
svg.innerHTML = `${wrapper}${breath}<g class="stems">${centers.map(tulipMarkup).join('')}</g>${tiedStems}`;

function openFlower(flower) {
  lastFlower = flower;
  const bloomMarkup = flower.querySelector('.bloom').innerHTML;
  openFlowerSvg.innerHTML = `<g class="tulip screen-flower" transform="translate(120 140) scale(3.4)"><g class="bloom">${bloomMarkup}</g></g>`;
  flowerScreen.hidden = false;
  requestAnimationFrame(() => openFlowerSvg.querySelector('.screen-flower').classList.add('is-open'));
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
