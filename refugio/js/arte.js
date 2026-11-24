// ============================================================
//  Refúgio — arte em pixel desenhada pelo próprio jogo
//  (nenhuma imagem externa: tudo é pintado pixel a pixel)
// ============================================================
'use strict';

function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; }
function F(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }
function P(g, x, y, c) { g.fillStyle = c; g.fillRect(x, y, 1, 1); }
function mrng(s) { let a = s >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash2(x, y, s = 0) { let h = (x * 374761393 + y * 668265263 + s * 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

// círculos "pixelados" (união de círculos)
function inBlob(cs, x, y) { for (const [cx, cy, r] of cs) { const dx = x + .5 - cx, dy = y + .5 - cy; if (dx * dx + dy * dy <= r * r) return true; } return false; }
function blob(g, cs, col) {
  if (!cs.length) return;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y, r] of cs) { x0 = Math.min(x0, x - r); y0 = Math.min(y0, y - r); x1 = Math.max(x1, x + r); y1 = Math.max(y1, y + r); }
  g.fillStyle = col;
  for (let y = Math.floor(y0); y <= y1; y++) for (let x = Math.floor(x0); x <= x1; x++) if (inBlob(cs, x, y)) g.fillRect(x, y, 1, 1);
}
function ellipse(g, cx, cy, rx, ry, col) {
  g.fillStyle = col;
  for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) g.fillRect(cx + x, cy + y, 1, 1);
}

// ---------------- paletas por estação (0 prim, 1 verão, 2 outono, 3 inverno)
const PAL = {
  grass: [
    ['#72bf47', '#5fa93b', '#8fd65c', '#4f9431'],
    ['#66b041', '#539a35', '#7fc753', '#43822b'],
    ['#b3a446', '#998b39', '#c9b95c', '#7f7331'],
    ['#eef3f8', '#d9e3ef', '#ffffff', '#c4d3e6']],
  oak: [
    ['#3d7a2e', '#58a63e', '#88d05c'],
    ['#2f6b28', '#46903a', '#6dbb4c'],
    ['#9a4419', '#d27526', '#f2b23c'],
    null],
  pine: [['#1f5233', '#2f7247', '#4b9662'], ['#1c4a2f', '#2b6941', '#43895a'], ['#21492f', '#2f6642', '#4a8156'], ['#1f4a33', '#2c6544', '#3f7d57']],
  bush: [['#3a7a2c', '#52a03a', '#7cc552'], ['#2e6a27', '#448d36', '#66b24a'], ['#8a3b1a', '#b85a22', '#de8a33'], ['#6e6a5c', '#8b8574', '#a8a291']],
};

// ---------------- chão
function paintGrass(s, v) {
  const [c, g] = mk(16, 16); const r = mrng(s * 131 + v * 17 + 3); const [b, d, l, dd] = PAL.grass[s];
  F(g, 0, 0, 16, 16, b);
  for (let i = 0; i < 22; i++) P(g, r() * 16 | 0, r() * 16 | 0, d);
  for (let i = 0; i < 12; i++) P(g, r() * 16 | 0, r() * 16 | 0, l);
  if (s < 3) {
    for (let k = 0; k < 2 + (v & 1); k++) { const x = 1 + r() * 13 | 0, y = 2 + r() * 12 | 0; P(g, x, y + 1, dd); P(g, x + 1, y, dd); P(g, x + 2, y + 1, dd); P(g, x + 1, y + 1, d); }
    if (s === 0 && v === 3) { for (let k = 0; k < 2; k++) { const x = 2 + r() * 11 | 0, y = 2 + r() * 11 | 0, fc = k ? '#f6d44a' : '#f08cc0'; P(g, x, y - 1, fc); P(g, x - 1, y, fc); P(g, x + 1, y, fc); P(g, x, y + 1, fc); P(g, x, y, '#fff7c9'); } }
    if (s === 1 && v === 3) { const x = 3 + r() * 10 | 0, y = 3 + r() * 10 | 0; P(g, x, y, '#f4f0e0'); P(g, x + 1, y, '#f4f0e0'); P(g, x, y + 1, '#f4f0e0'); P(g, x + 1, y + 1, '#f4f0e0'); P(g, x, y, '#f2c94c'); }
    if (s === 2 && v >= 2) for (let k = 0; k < 3; k++) { const x = r() * 15 | 0, y = r() * 15 | 0; P(g, x, y, k ? '#d9692a' : '#e9a23b'); P(g, x + 1, y, '#b8521f'); }
  } else {
    for (let i = 0; i < 6; i++) P(g, r() * 16 | 0, r() * 16 | 0, '#b9cbe2');
  }
  return c;
}
function paintSand(s, v) {
  const [c, g] = mk(16, 16); const r = mrng(s * 71 + v * 5 + 9);
  if (s === 3) { F(g, 0, 0, 16, 16, '#e7edf4'); for (let i = 0; i < 14; i++) P(g, r() * 16 | 0, r() * 16 | 0, '#cdb98a'); return c; }
  F(g, 0, 0, 16, 16, '#e4cf8e');
  for (let i = 0; i < 20; i++) P(g, r() * 16 | 0, r() * 16 | 0, '#cdb576');
  for (let i = 0; i < 10; i++) P(g, r() * 16 | 0, r() * 16 | 0, '#f3e2a8');
  return c;
}
function paintWater(s, v) {
  const [c, g] = mk(16, 16); const r = mrng(s * 13 + v * 3 + 1);
  if (s === 3) {
    F(g, 0, 0, 16, 16, '#bfe2f4');
    for (let i = 0; i < 14; i++) P(g, r() * 16 | 0, r() * 16 | 0, '#d9f0fb');
    const x = r() * 10 | 0, y = r() * 10 | 0; for (let k = 0; k < 5; k++) P(g, x + k, y + (k >> 1), '#ffffff');
    return c;
  }
  F(g, 0, 0, 16, 16, '#3f8fd4');
  for (let i = 0; i < 18; i++) P(g, r() * 16 | 0, r() * 16 | 0, '#3683c6');
  for (let i = 0; i < 6; i++) { const x = r() * 13 | 0, y = r() * 15 | 0; F(g, x, y, 3, 1, '#5aa6e2'); }
  return c;
}
function paintFord(s) {
  const [c, g] = mk(16, 16); const r = mrng(s + 77);
  F(g, 0, 0, 16, 16, s === 3 ? '#cbe8f6' : '#68b2e4');
  for (let i = 0; i < 12; i++) P(g, r() * 16 | 0, r() * 16 | 0, s === 3 ? '#e2f4fc' : '#7fc0ec');
  for (let k = 0; k < 4; k++) { const x = 1 + r() * 11 | 0, y = 1 + r() * 11 | 0; ellipse(g, x + 2, y + 2, 2, 1, '#8a8a84'); P(g, x + 1, y + 1, '#b9b9b1'); }
  return c;
}
function paintSoil(s) {
  const [c, g] = mk(16, 16); const r = mrng(s * 9 + 5);
  F(g, 0, 0, 16, 16, s === 3 ? '#e9eef4' : '#8a5a36');
  for (let y = 1; y < 16; y += 4) F(g, 0, y, 16, 1, s === 3 ? '#cfd8e3' : '#6b4327');
  for (let y = 2; y < 16; y += 4) F(g, 0, y, 16, 1, s === 3 ? '#f7f9fb' : '#9c6a42');
  for (let i = 0; i < 8; i++) P(g, r() * 16 | 0, r() * 16 | 0, s === 3 ? '#a58c6c' : '#5c3820');
  return c;
}

// ---------------- árvores, arbustos, pedras
function paintOak(s, v) {
  const [c, g] = mk(28, 34); const r = mrng(500 + v * 37);
  ellipse(g, 14, 31, 8, 2, 'rgba(0,0,0,.22)');
  F(g, 12, 18, 5, 13, '#7a4b26'); F(g, 12, 18, 1, 13, '#9a6536'); F(g, 16, 18, 1, 13, '#55321a');
  F(g, 10, 29, 2, 2, '#6a4020'); F(g, 17, 29, 2, 2, '#6a4020');
  if (s === 3) {
    const br = [[14, 18, 14, 6], [14, 13, 7, 7], [14, 11, 21, 6], [13, 15, 5, 11], [15, 15, 23, 11], [14, 8, 10, 3], [14, 8, 18, 3]];
    for (const [x0, y0, x1, y1] of br) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let k = 0; k <= n; k++) { const x = Math.round(x0 + (x1 - x0) * k / n), y = Math.round(y0 + (y1 - y0) * k / n); P(g, x, y, '#5c3a1f'); if (k % 2 === 0) P(g, x, y - 1, '#ffffff'); } }
    F(g, 12, 17, 5, 1, '#ffffff');
    return c;
  }
  const j = () => (r() * 3 | 0) - 1;
  const cs = [[14 + j(), 12, 9], [8 + j(), 16 + j(), 6], [20 + j(), 16 + j(), 6], [14 + j(), 6 + j(), 6 + (v === 1 ? 1 : 0)]];
  const pal = PAL.oak[s];
  blob(g, cs.map(([x, y, rr]) => [x, y + 1.5, rr]), pal[0]);
  blob(g, cs.map(([x, y, rr]) => [x, y, rr - 1]), pal[1]);
  blob(g, cs.map(([x, y, rr]) => [x - 2, y - 2, rr - 4]).filter(a => a[2] > 1), pal[2]);
  for (let i = 0; i < 40; i++) { const x = 4 + r() * 21 | 0, y = 1 + r() * 22 | 0; if (inBlob(cs.map(([a, b, rr]) => [a, b, rr - 1.5]), x, y)) P(g, x, y, r() < .5 ? pal[0] : pal[2]); }
  if (s === 0) for (let i = 0; i < 7; i++) { const x = 5 + r() * 18 | 0, y = 2 + r() * 18 | 0; if (inBlob(cs, x, y)) { P(g, x, y, '#f7b6d2'); } }
  if (s === 2) for (let i = 0; i < 8; i++) { const x = 5 + r() * 18 | 0, y = 2 + r() * 18 | 0; if (inBlob(cs, x, y)) P(g, x, y, '#ffd25a'); }
  return c;
}
function paintPine(s, v) {
  const [c, g] = mk(22, 36); const r = mrng(900 + v * 11);
  ellipse(g, 11, 33, 7, 2, 'rgba(0,0,0,.22)');
  F(g, 9, 26, 4, 7, '#6b4122'); F(g, 9, 26, 1, 7, '#8a5a30');
  const [d, m, l] = PAL.pine[s];
  const lay = v ? 4 : 3;
  for (let k = 0; k < lay; k++) {
    const top = 1 + k * (v ? 6 : 7), base = top + 11, hwMax = 4 + k * (v ? 1.8 : 2.4);
    for (let y = top; y <= base; y++) {
      const hw = Math.max(1, Math.round((y - top) / (base - top) * hwMax));
      F(g, 11 - hw, y, hw * 2, 1, m);
      F(g, 11 - hw, y, Math.max(1, hw * .6 | 0), 1, l);
      F(g, 11 + hw - Math.max(1, hw * .7 | 0), y, Math.max(1, hw * .7 | 0), 1, d);
      if (y === base) F(g, 11 - hw, y, hw * 2, 1, d);
      if (s === 3 && y - top < 3) F(g, 11 - hw, y, hw * 2 - 1, 1, y - top < 2 ? '#ffffff' : '#e3ecf5');
    }
  }
  if (s === 3) for (let i = 0; i < 10; i++) P(g, 4 + r() * 14 | 0, 3 + r() * 22 | 0, '#ffffff');
  return c;
}
function paintSapling(s) {
  const [c, g] = mk(10, 12);
  ellipse(g, 5, 10, 3, 1, 'rgba(0,0,0,.2)');
  F(g, 4, 5, 1, 6, '#6b4122');
  const col = s === 3 ? '#8b8574' : s === 2 ? '#d27526' : '#58a63e';
  F(g, 1, 3, 3, 2, col); F(g, 5, 2, 3, 2, col); F(g, 3, 1, 3, 2, col);
  P(g, 2, 3, '#88d05c'); if (s === 3) { F(g, 1, 2, 3, 1, '#fff'); F(g, 5, 1, 3, 1, '#fff'); }
  return c;
}
function paintBush(s, berries) {
  const [c, g] = mk(18, 15); const r = mrng(33 + s);
  ellipse(g, 9, 12, 7, 2, 'rgba(0,0,0,.22)');
  const cs = [[9, 7, 6], [5, 9, 4], [13, 9, 4]]; const [d, m, l] = PAL.bush[s];
  blob(g, cs.map(([x, y, rr]) => [x, y + 1, rr]), d);
  blob(g, cs.map(([x, y, rr]) => [x, y, rr - 1]), m);
  blob(g, [[7, 5, 2.5]], l);
  if (s === 3) { blob(g, [[9, 4, 4], [5, 7, 2.5], [13, 7, 2.5]], '#ffffff'); }
  if (berries && s < 3) for (let i = 0; i < 6; i++) { const x = 3 + r() * 12 | 0, y = 3 + r() * 8 | 0; if (inBlob(cs, x, y)) { P(g, x, y, '#d6334a'); P(g, x + 1, y, '#a3172f'); P(g, x, y - 1 < 0 ? 0 : y, '#d6334a'); P(g, x, y, '#ff7a8a'); } }
  return c;
}
function paintRock(s, iron, v) {
  const [c, g] = mk(18, 14); const r = mrng(71 + v * 13 + (iron ? 5 : 0));
  ellipse(g, 9, 11, 8, 2, 'rgba(0,0,0,.25)');
  const cs = v ? [[7, 7, 5], [12, 8, 4]] : [[9, 7, 6], [13, 9, 3]];
  blob(g, cs.map(([x, y, rr]) => [x, y + 1, rr]), iron ? '#5b4a40' : '#666661');
  blob(g, cs.map(([x, y, rr]) => [x, y, rr - .5]), iron ? '#7d6a5c' : '#8f8f89');
  blob(g, cs.map(([x, y, rr]) => [x - 1.5, y - 2, rr - 3]).filter(a => a[2] > .8), iron ? '#a08a78' : '#b8b8b0');
  for (let i = 0; i < (iron ? 9 : 4); i++) { const x = 3 + r() * 13 | 0, y = 2 + r() * 9 | 0; if (inBlob(cs, x, y)) { P(g, x, y, iron ? (i % 2 ? '#c8682a' : '#e08a3a') : '#6f6f6a'); } }
  if (s === 3) blob(g, cs.map(([x, y, rr]) => [x - .5, y - rr + 2, rr - 2]).filter(a => a[2] > .8), '#ffffff');
  return c;
}

// ---------------- prédios
const WALL = {
  log(g, x, y, w, h) {
    F(g, x, y, w, h, '#93602f');
    for (let yy = y; yy < y + h; yy += 3) { F(g, x, yy, w, 1, '#b07a42'); F(g, x, yy + 2, w, 1, '#6e4320'); }
    for (let yy = y; yy < y + h; yy += 3) { F(g, x - 1, yy, 2, 2, '#c99b62'); F(g, x + w - 1, yy, 2, 2, '#c99b62'); P(g, x - 1, yy, '#7a5030'); P(g, x + w, yy, '#7a5030'); }
  },
  stone(g, x, y, w, h) {
    F(g, x, y, w, h, '#9c9a92');
    for (let yy = y, k = 0; yy < y + h; yy += 3, k++) { F(g, x, yy + 2, w, 1, '#75736c'); for (let xx = x + (k % 2 ? 2 : 0); xx < x + w; xx += 5) F(g, xx, yy, 1, 2, '#75736c'); F(g, x, yy, w, 1, '#b7b5ad'); }
  },
  plank(g, x, y, w, h, c1 = '#b98a55', c2 = '#8f6238') {
    F(g, x, y, w, h, c1);
    for (let xx = x; xx < x + w; xx += 3) F(g, xx, y, 1, h, c2);
    F(g, x, y, w, 1, '#d9b27a');
  },
  red(g, x, y, w, h) {
    F(g, x, y, w, h, '#b23c2e');
    for (let xx = x; xx < x + w; xx += 3) F(g, xx, y, 1, h, '#8c2a20');
    F(g, x, y, w, 1, '#d45a46');
  },
};
function roof(g, x, y, w, h, c, cd, cl, thatch) {
  F(g, x, y, w, h, c);
  if (thatch) {
    for (let yy = y; yy < y + h; yy += 2) for (let xx = x + (yy % 4 ? 1 : 0); xx < x + w; xx += 3) { P(g, xx, yy, cd); P(g, xx + 1, yy + 1, cl); }
  } else {
    for (let yy = y + 2, k = 0; yy < y + h; yy += 3, k++) { F(g, x, yy, w, 1, cd); for (let xx = x + (k % 2 ? 1 : 3); xx < x + w; xx += 4) P(g, xx, yy - 1, cd); }
  }
  F(g, x, y, w, 1, cl); F(g, x, y + h - 1, w, 1, cd); F(g, x, y + h, w, 1, 'rgba(0,0,0,.35)');
  F(g, x + (w >> 1) - 1, y, 2, h, cl);
}
function snowRoof(g, x, y, w, h) {
  const sh = Math.round(h * .5);
  F(g, x + 1, y, w - 2, sh, '#f4f8fc'); F(g, x + 1, y, w - 2, 1, '#ffffff');
  for (let xx = x + 1; xx < x + w - 1; xx++) { const d = 1 + ((xx * 7 + 3) % 4 === 0 ? 2 : (xx * 5) % 3 === 0 ? 1 : 0); F(g, xx, y + sh, 1, d, '#e2eaf3'); }
  F(g, x + 1, y + sh - 1, w - 2, 1, '#d5e0ec');
}
function door(g, x, y, w = 6, h = 9, col = '#6a3d1c') { F(g, x - 1, y - 1, w + 2, h + 1, '#3b200d'); F(g, x, y, w, h, col); F(g, x + 1, y + 1, 1, h - 2, '#85532a'); P(g, x + w - 2, y + (h >> 1), '#f2c94c'); }
function windowPx(g, x, y) { F(g, x - 1, y - 1, 7, 7, '#3b200d'); F(g, x, y, 5, 5, '#9fdcff'); F(g, x + 2, y, 1, 5, '#3b200d'); F(g, x, y + 2, 5, 1, '#3b200d'); P(g, x, y, '#e8f7ff'); }

// cada prédio: canvas + pontos de janela (luz à noite) + chaminé (fumaça)
function paintBuilding(t, s) {
  const W = s === 3; // inverno: neve nos telhados
  const out = { win: [], chim: null };
  let c, g;
  const cabin = (o) => {
    [c, g] = mk(32, 44);
    ellipse(g, 16, 42, 15, 2, 'rgba(0,0,0,.22)');
    WALL[o.wall](g, 2, 26, 28, 16);
    roof(g, 0, 6, 32, 21, ...o.roof, o.thatch);
    if (W) snowRoof(g, 0, 6, 32, 20);
    if (o.chim !== false) { F(g, 23, 1, 5, 9, '#7d7a72'); F(g, 23, 1, 5, 1, '#a9a69c'); F(g, 22, 0, 7, 2, '#5e5c56'); if (W) F(g, 22, 0, 7, 1, '#fff'); out.chim = [25, 0]; }
    door(g, 13, 33);
    windowPx(g, 5, 30); windowPx(g, 22, 30);
    out.win.push([7, 32], [24, 32]);
  };
  switch (t) {
    case 'casa': cabin({ wall: 'log', roof: ['#a1442c', '#7a2f1d', '#c65f3f'] }); break;
    case 'casap': cabin({ wall: 'stone', roof: ['#4b6a8c', '#344e6a', '#6b8db0'] }); break;
    case 'coletor': cabin({ wall: 'log', roof: ['#d2ad55', '#a6853b', '#ecd07c'], thatch: 1, chim: false });
      F(g, 1, 37, 8, 5, '#a9783e'); F(g, 1, 37, 8, 1, '#c99b5c'); for (let i = 0; i < 4; i++) { P(g, 2 + i * 2, 36, '#d6334a'); P(g, 3 + i * 2, 35, '#5b3fa0'); } break;
    case 'cacador': cabin({ wall: 'log', roof: ['#8a6a3a', '#6a4f28', '#a8875a'], thatch: 1 });
      F(g, 12, 22, 8, 3, '#7a5a3a'); P(g, 11, 21, '#e8dcc0'); P(g, 10, 20, '#e8dcc0'); P(g, 20, 21, '#e8dcc0'); P(g, 21, 20, '#e8dcc0'); P(g, 14, 25, '#3b200d'); P(g, 17, 25, '#3b200d');
      F(g, 26, 34, 4, 7, '#b88a5a'); F(g, 27, 35, 2, 5, '#d9b083'); break;
    case 'pescador': cabin({ wall: 'plank', roof: ['#3e8c8c', '#2b6666', '#5fb0ae'] });
      for (let i = 0; i < 6; i++) for (let k = 0; k < 4; k++) P(g, 1 + i * 2 - k % 2, 34 + k * 2, '#e6dcc0');
      F(g, 26, 36, 5, 6, '#8a5a30'); F(g, 26, 38, 5, 1, '#5a3a1a'); break;
    case 'silvicultor': cabin({ wall: 'log', roof: ['#4f7f3a', '#355c27', '#72a656'] });
      for (let i = 0; i < 2; i++) { F(g, 1 + i * 6, 38, 4, 4, '#a0522d'); F(g, 2 + i * 6, 35, 2, 3, '#3f8f3a'); P(g, 1 + i * 6, 35, '#58a63e'); } break;
    case 'lenhador': cabin({ wall: 'plank', roof: ['#8c4a2a', '#683519', '#ae6a44'] });
      for (let r = 0; r < 3; r++) for (let i = 0; i < 3 - r; i++) { ellipse(g, 3 + i * 3 + r * 1.5 | 0, 40 - r * 3, 1, 1, '#c98d52'); P(g, 3 + i * 3 + r * 1.5 | 0, 40 - r * 3, '#7a4b26'); }
      F(g, 25, 37, 5, 4, '#7a4b26'); F(g, 25, 37, 5, 1, '#c99b62'); F(g, 27, 33, 1, 5, '#5a3a1a'); F(g, 26, 33, 3, 2, '#b8b8b0'); break;
    case 'ferreiro': cabin({ wall: 'stone', roof: ['#4a4644', '#302d2b', '#6a6562'] });
      F(g, 1, 37, 8, 2, '#3a3a3e'); F(g, 3, 39, 4, 3, '#2a2a2e'); F(g, 0, 36, 4, 1, '#55555c'); F(g, 25, 38, 6, 4, '#7d7a72'); F(g, 26, 38, 4, 2, '#ff8a2a'); P(g, 27, 38, '#ffd24a'); break;
    case 'alfaiate': cabin({ wall: 'plank', roof: ['#7a4a8c', '#583468', '#9c6aae'] });
      F(g, 0, 34, 1, 8, '#5a3a1a'); F(g, 10, 34, 1, 8, '#5a3a1a'); F(g, 0, 34, 11, 1, '#e6dcc0'); F(g, 2, 35, 3, 4, '#d6334a'); F(g, 6, 35, 3, 5, '#3f7fc0'); break;
    case 'armazem': {
      [c, g] = mk(48, 46);
      ellipse(g, 24, 44, 23, 2, 'rgba(0,0,0,.22)');
      WALL.red(g, 2, 24, 44, 20);
      roof(g, 0, 4, 48, 21, '#6a4a3a', '#4a3226', '#8a6a5a');
      if (W) snowRoof(g, 0, 4, 48, 20);
      F(g, 16, 30, 16, 14, '#e9e1cf'); F(g, 17, 31, 14, 13, '#8c2a20');
      for (let k = 0; k < 14; k++) { P(g, 17 + k, 31 + k * 13 / 14 | 0, '#e9e1cf'); P(g, 30 - k, 31 + k * 13 / 14 | 0, '#e9e1cf'); }
      F(g, 24, 31, 1, 13, '#e9e1cf');
      F(g, 4, 28, 6, 5, '#e9e1cf'); F(g, 5, 29, 4, 3, '#3b200d'); F(g, 38, 28, 6, 5, '#e9e1cf'); F(g, 39, 29, 4, 3, '#3b200d');
      F(g, 2, 38, 6, 6, '#b07a42'); F(g, 2, 38, 6, 1, '#d9b27a'); F(g, 40, 39, 6, 5, '#b07a42'); F(g, 40, 39, 6, 1, '#d9b27a');
      break;
    }
    case 'carroca': {
      [c, g] = mk(32, 34);
      ellipse(g, 16, 31, 15, 2, 'rgba(0,0,0,.22)');
      F(g, 3, 18, 26, 8, '#8a5a30'); F(g, 3, 18, 26, 1, '#b07a42'); F(g, 3, 25, 26, 1, '#5a3a1a');
      for (let x = 3; x < 29; x++) { const h = Math.round(Math.sqrt(Math.max(0, 1 - ((x - 16) / 13.5) ** 2)) * 13); F(g, x, 18 - h, 1, h, x % 4 === 0 ? '#d8ccaa' : '#efe5c8'); P(g, x, 18 - h, '#fffaf0'); }
      if (W) for (let x = 5; x < 27; x++) { const h = Math.round(Math.sqrt(Math.max(0, 1 - ((x - 16) / 13.5) ** 2)) * 13); F(g, x, 18 - h, 1, 2, '#ffffff'); }
      for (const wx of [8, 24]) { ellipse(g, wx, 27, 4, 4, '#4a2e16'); ellipse(g, wx, 27, 2, 2, '#8a5a30'); P(g, wx, 27, '#3b200d'); }
      F(g, 0, 20, 4, 1, '#6a4020');
      break;
    }
    case 'pedreira': {
      [c, g] = mk(48, 52);
      F(g, 2, 6, 44, 44, '#8f8a80'); F(g, 6, 10, 36, 36, '#7a756c'); F(g, 10, 14, 28, 28, '#666159');
      for (let i = 0; i < 6; i++) { const x = 8 + (i % 3) * 11, y = 14 + (i / 3 | 0) * 14; F(g, x, y, 9, 6, '#b8b5ab'); F(g, x, y, 9, 1, '#d6d3c9'); F(g, x, y + 5, 9, 1, '#8a867c'); }
      F(g, 40, 2, 2, 34, '#7a4b26'); F(g, 26, 2, 16, 2, '#7a4b26'); F(g, 28, 4, 1, 14, '#d8ccaa'); F(g, 26, 18, 5, 4, '#b8b5ab');
      if (W) for (let i = 0; i < 40; i++) P(g, 2 + (i * 37) % 44, 6 + (i * 53) % 44, '#ffffff');
      break;
    }
    case 'mina': {
      [c, g] = mk(48, 54);
      ellipse(g, 24, 50, 23, 3, 'rgba(0,0,0,.22)');
      blob(g, [[24, 28, 20], [12, 36, 12], [36, 36, 12]], '#6d6258');
      blob(g, [[22, 24, 16], [12, 32, 9], [34, 32, 9]], '#8a7d70');
      blob(g, [[18, 18, 8]], '#a39585');
      if (W) blob(g, [[22, 14, 9], [12, 26, 5], [34, 26, 5]], '#ffffff');
      F(g, 17, 32, 14, 18, '#1d1815'); F(g, 15, 30, 18, 3, '#7a4b26'); F(g, 15, 30, 3, 20, '#7a4b26'); F(g, 30, 30, 3, 20, '#7a4b26');
      F(g, 4, 44, 10, 5, '#5a5a60'); F(g, 5, 42, 8, 2, '#c8682a'); ellipse(g, 6, 49, 1, 1, '#2a2a2e'); ellipse(g, 12, 49, 1, 1, '#2a2a2e');
      break;
    }
    default: [c, g] = mk(16, 16);
  }
  out.c = c; return out;
}

// ---------------- pessoas
const SKINS = ['#f2c9a0', '#e0ac7e', '#c68a5b', '#9a6440', '#7a4a2c'];
const HAIRS = ['#3a2412', '#5c3a1c', '#8a5a2a', '#c9a24a', '#1f1a17', '#a6452a', '#6a3a1a'];
const SHIRTS = ['#c0473a', '#3f7fc0', '#4f9a4a', '#d0a040', '#8a5aa8', '#e07a3a', '#3fa0a0', '#b85a7a', '#6a7a3a'];
const PANTS = ['#4a3a2a', '#3a4a6a', '#5a4a3a', '#3a3a3a', '#6a4a2a'];

function paintPerson(p, dir, fr) {
  const [c, g] = mk(10, 16);
  const kid = p.kid, oy = kid ? 4 : 0;
  ellipse(g, 5, 15, 3, 1, 'rgba(0,0,0,.25)');
  const hair = p.old ? '#d8d2c8' : p.hair;
  // pernas
  const ly = kid ? 13 : 12, lh = kid ? 2 : 3;
  const la = fr === 1 ? -1 : 0, lb = fr === 2 ? -1 : 0;
  F(g, 3, ly + la, 2, lh, p.pants); F(g, 5, ly + lb, 2, lh, p.pants);
  P(g, 3, ly + lh - 1 + la, '#2a1a0e'); P(g, 4, ly + lh - 1 + la, '#2a1a0e'); P(g, 5, ly + lh - 1 + lb, '#2a1a0e'); P(g, 6, ly + lh - 1 + lb, '#2a1a0e');
  // corpo
  const by = kid ? 9 : 7, bh = kid ? 4 : 5;
  F(g, 2, by, 6, bh, p.shirt);
  if (!p.male) { F(g, 2, by + bh - 1, 6, kid ? 1 : 2, p.shirt); F(g, 1, by + bh, 8, 1, p.shirt); }
  F(g, 2, by, 6, 1, 'rgba(255,255,255,.25)');
  // braços
  const aw = fr === 1 ? 1 : fr === 2 ? -1 : 0;
  if (dir !== 2) { F(g, 1, by + 1, 1, bh - 1 + aw, p.shirt); F(g, 8, by + 1, 1, bh - 1 - aw, p.shirt); P(g, 1, by + bh + aw - 1 > by ? by + bh - 1 + aw : by + 1, p.skin); P(g, 8, by + bh - 1 - aw, p.skin); }
  else { F(g, 4 + aw, by + 1, 2, bh - 1, p.shirt); P(g, 4 + aw, by + bh - 1, p.skin); }
  // cabeça
  const hy = kid ? 3 : 1;
  F(g, 2, hy, 6, 6, p.skin);
  F(g, 2, hy - 1 < 0 ? 0 : hy - 1, 6, 2, hair);
  if (dir === 0) { // frente
    F(g, 1, hy, 1, p.long ? 6 : 3, hair); F(g, 8, hy, 1, p.long ? 6 : 3, hair); F(g, 2, hy + 1, 6, 1, hair);
    P(g, 3, hy + 3, '#2a1a0e'); P(g, 6, hy + 3, '#2a1a0e'); P(g, 3, hy + 4, 'rgba(230,110,110,.5)'); P(g, 6, hy + 4, 'rgba(230,110,110,.5)');
    if (p.male && !kid && p.beard) F(g, 3, hy + 5, 4, 1, hair);
  } else if (dir === 1) { // costas
    F(g, 1, hy, 8, p.long ? 7 : 5, hair);
  } else { // lado (olha para a direita)
    F(g, 1, hy, 4, p.long ? 7 : 4, hair); F(g, 2, hy + 1, 6, 1, hair); P(g, 6, hy + 3, '#2a1a0e'); P(g, 8, hy + 3, p.skin);
  }
  if (p.hat) { F(g, 1, hy - 1, 8, 2, p.hat); F(g, 0, hy + 1, 10, 1, p.hat); }
  return c;
}
const _ppl = new Map();
function personSprites(p) {
  const key = [p.skin, p.hair, p.shirt, p.pants, p.male, p.long, p.kid, p.old, p.beard, p.hat].join('|');
  let s = _ppl.get(key);
  if (!s) { s = [0, 1, 2].map(d => [0, 1, 2].map(f => paintPerson(p, d, f))); _ppl.set(key, s); }
  return s;
}

// ---------------- animais
function paintDeer(fr, s) {
  const [c, g] = mk(16, 14);
  ellipse(g, 8, 12, 5, 1, 'rgba(0,0,0,.22)');
  const b = s === 3 ? '#8a6a4a' : '#a8743e', d = '#7a5028';
  F(g, 3, 5, 9, 4, b); F(g, 3, 8, 9, 1, d); F(g, 4, 5, 6, 1, '#c89458');
  P(g, 2, 5, '#f4efe4'); P(g, 2, 6, '#f4efe4');
  F(g, 11, 2, 3, 4, b); F(g, 12, 1, 3, 3, b); P(g, 14, 2, '#2a1a0e'); P(g, 13, 2, '#1a0e06');
  P(g, 12, 0, d); P(g, 11, 0, d); P(g, 14, 0, d);
  const l1 = fr ? 1 : 0;
  F(g, 4, 9, 1, 3 - l1, d); F(g, 6, 9, 1, 2 + l1, d); F(g, 9, 9, 1, 3 - l1, d); F(g, 11, 9, 1, 2 + l1, d);
  for (let i = 0; i < 3; i++) P(g, 5 + i * 2, 6, '#e8d0a8');
  return c;
}

// ---------------- plantação (estágios do trigo)
function paintCrop(stage, s) {
  const [c, g] = mk(16, 16);
  if (stage === 0) return c;
  if (stage === 5) { // restolho
    for (let i = 0; i < 4; i++) for (let k = 0; k < 3; k++) { F(g, 2 + i * 4, 3 + k * 5, 1, 2, '#c9a24a'); }
    return c;
  }
  const col = stage >= 4 ? ['#e8c04a', '#c99a2a', '#f6dc7a'] : ['#4f9a3a', '#3a7a2a', '#7cc552'];
  const h = [0, 2, 4, 7, 9][stage];
  for (let i = 0; i < 4; i++) for (let k = 0; k < 3; k++) {
    const x = 2 + i * 4, y = 5 + k * 5;
    F(g, x, y - h + 2, 1, h, col[1]); F(g, x + 1, y - h + 3, 1, h - 1, col[0]);
    if (stage >= 4) { F(g, x, y - h + 1, 2, 2, col[2]); }
    else if (stage >= 2) P(g, x - 1, y - h + 3, col[2]);
  }
  return c;
}

// ---------------- ícone do jogo (para o celular)
function paintIcon(size) {
  const [c, g] = mk(size, size);
  const [ic, ig] = mk(48, 48);
  F(ig, 0, 0, 48, 48, '#79c24f'); F(ig, 0, 34, 48, 14, '#66b041');
  for (let i = 0; i < 40; i++) P(ig, (i * 37) % 48, 30 + (i * 13) % 18, '#5a9a3a');
  F(ig, 0, 0, 48, 14, '#8fd0f0'); F(ig, 0, 14, 48, 2, '#bfe6f8');
  const t = paintPine(1, 0); ig.drawImage(t, 30, 4); ig.drawImage(paintOak(1, 1), -6, 6);
  ig.drawImage(paintBuilding('casa', 1).c, 8, 6);
  g.imageSmoothingEnabled = false; g.drawImage(ic, 0, 0, size, size);
  return c;
}
