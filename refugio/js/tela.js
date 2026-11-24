// ============================================================
//  Refúgio — tela: desenho, toque, painéis, som e salvar
// ============================================================
'use strict';

const $ = id => document.getElementById(id);
const cv = $('cv'), ctx = cv.getContext('2d');
let VW = 0, VH = 0, DPR = 1;
const cam = { x: 0, y: 0, z: 3 };
const SPEEDS = [0, 1, 3, 8];
let running = false, dlgOpen = 0, sel = null;
let M = { t: 'none' };   // modo da ferramenta
const SAVE_KEY = 'refugio-save-v1';

function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1); VW = innerWidth; VH = innerHeight;
  cv.width = Math.floor(VW * DPR); cv.height = Math.floor(VH * DPR);
  ctx.imageSmoothingEnabled = false;
}
addEventListener('resize', resize); resize();

// ---------------- texturas por estação
const TEX = [];
function tex(s) {
  if (TEX[s]) return TEX[s];
  const X = TEX[s] = {
    grass: [0, 1, 2, 3].map(v => paintGrass(s, v)), sand: [0, 1].map(v => paintSand(s, v)), water: [0, 1].map(v => paintWater(s, v)), ford: paintFord(s), soil: paintSoil(s),
    oak: [0, 1, 2].map(v => paintOak(s, v)), pine: [0, 1].map(v => paintPine(s, v)), sap: paintSapling(s), bush: [paintBush(s, false), paintBush(s, true)],
    rock: [0, 1].map(v => paintRock(s, false, v)), iron: [0, 1].map(v => paintRock(s, true, v)), crop: [0, 1, 2, 3, 4, 5].map(k => paintCrop(k, s)), deer: [0, 1].map(f => paintDeer(f, s)), bld: {},
  };
  return X;
}
function bldSpr(t, s) { const X = tex(s); if (!X.bld[t]) X.bld[t] = paintBuilding(t, s); return X.bld[t]; }

// ---------------- chão em cache (redesenha quando muda a estação, estrada ou plantação)
const [cache, cg] = mk(MW * TS, MH * TS); let cacheSeason = -1;
const isWater = (x, y) => inb(x, y) && (G.tile[idx(x, y)] === T_WATER || G.tile[idx(x, y)] === T_FORD);
function buildCache() {
  const s = season(), X = tex(s);
  cacheSeason = s; terrainDirty = false;
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const i = idx(x, y), t = G.tile[i], v = (hash2(x, y, 7) * 4) | 0, px = x * TS, py = y * TS;
    cg.drawImage(t === T_WATER ? X.water[v & 1] : t === T_FORD ? X.ford : t === T_SAND ? X.sand[v & 1] : X.grass[v], px, py);
  }
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    if (!isWater(x, y)) continue; const px = x * TS, py = y * TS;
    const foam = s === 3 ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.55)';
    if (!isWater(x, y - 1)) { if (s < 3) F(cg, px, py, 16, 3, 'rgba(20,40,80,.25)'); F(cg, px, py + (s < 3 ? 3 : 0), 16, 1, foam); }
    if (!isWater(x, y + 1)) F(cg, px, py + 15, 16, 1, foam);
    if (!isWater(x - 1, y)) F(cg, px, py, 1, 16, foam);
    if (!isWater(x + 1, y)) F(cg, px + 15, py, 1, 16, foam);
  }
  for (const b of G.blds) if (B[b.t].flat) for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) cg.drawImage(X.soil, x * TS, y * TS);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (G.road[idx(x, y)]) drawRoad(x, y, s);
}
function drawRoad(x, y, s) {
  const c = s === 3 ? ['#cdbfa9', '#b4a488', '#f2eee6'] : ['#b78d5b', '#9a7248', '#cfa878'];
  const px = x * TS, py = y * TS, r = (dx, dy) => inb(x + dx, y + dy) && G.road[idx(x + dx, y + dy)];
  F(cg, px + 2, py + 2, 12, 12, c[0]);
  if (r(0, -1)) F(cg, px + 2, py, 12, 2, c[0]); if (r(0, 1)) F(cg, px + 2, py + 14, 12, 2, c[0]);
  if (r(-1, 0)) F(cg, px, py + 2, 2, 12, c[0]); if (r(1, 0)) F(cg, px + 14, py + 2, 2, 12, c[0]);
  for (let k = 0; k < 6; k++) { const h = hash2(x * 7 + k, y * 3, 5); P(cg, px + 3 + (h * 10 | 0), py + 3 + ((h * 997) % 1 * 10 | 0), k % 2 ? c[1] : c[2]); }
}

// ---------------- desenho do quadro
function s2w(sx, sy) { return { x: cam.x + sx / cam.z, y: cam.y + sy / cam.z }; }
function nightAmt() { const h = hour(); if (h < 5) return 1; if (h < 7) return 1 - (h - 5) / 2; if (h < 18.5) return 0; if (h < 21) return (h - 18.5) / 2.5; return 1; }
const parts = []; const weather = [];
function render(now) {
  const s = season(), X = tex(s);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#16241a'; ctx.fillRect(0, 0, cv.width, cv.height);
  const z = cam.z * DPR;
  ctx.setTransform(z, 0, 0, z, Math.round(-cam.x * z), Math.round(-cam.y * z));
  ctx.imageSmoothingEnabled = false;
  if (terrainDirty || cacheSeason !== s) buildCache();
  ctx.drawImage(cache, 0, 0);
  const x0 = Math.max(0, Math.floor(cam.x / TS) - 2), y0 = Math.max(0, Math.floor(cam.y / TS) - 1);
  const x1 = Math.min(MW - 1, Math.ceil((cam.x + VW / cam.z) / TS) + 2), y1 = Math.min(MH - 1, Math.ceil((cam.y + VH / cam.z) / TS) + 3);
  // brilho na água
  if (s < 3) {
    const ph = now / 900;
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (G.tile[idx(x, y)] !== T_WATER) continue;
      const h = hash2(x, y, 3), k = (ph + h * 10) % 6;
      if (k < 1.2) { const xx = x * TS + (h * 11 | 0) + (k * 2 | 0), yy = y * TS + 5 + (h * 97 % 1 * 8 | 0); ctx.fillRect(xx, yy, 3, 1); }
    }
  }
  // plantações
  for (const b of G.blds) {
    if (!B[b.t].flat) continue;
    if (b.x > x1 || b.x + b.w < x0 || b.y > y1 || b.y + b.h < y0) continue;
    const n = b.w * b.h;
    if (!b.done) { ctx.globalAlpha = .5; ctx.fillStyle = '#3a2a1a'; for (let k = 0; k < n * Math.min(1, b.prog / B[b.t].work); k++) ctx.fillRect((b.x + k % b.w) * TS + 2, (b.y + (k / b.w | 0)) * TS + 7, 12, 2); ctx.globalAlpha = 1; continue; }
    const st = b.growth >= 1 ? 4 : b.growth > .66 ? 3 : b.growth > .33 ? 2 : 1;
    for (let k = 0; k < n; k++) {
      const x = b.x + k % b.w, y = b.y + (k / b.w | 0);
      const stage = k < Math.round(b.harv * n) ? 5 : k < Math.round(b.plant * n) ? st : 0;
      if (stage && s < 3) ctx.drawImage(X.crop[stage], x * TS, y * TS);
    }
  }
  // lista de coisas que se desenham de baixo para cima
  const L = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = idx(x, y); if (G.obj[i]) L.push([y * TS + 14, 0, i]); }
  for (const b of G.blds) if (!B[b.t].flat && b.x <= x1 + 2 && b.x + b.w >= x0 - 2 && b.y <= y1 + 2 && b.y + b.h >= y0) L.push([(b.y + b.h) * TS - 1, 1, b]);
  for (const v of G.vs) if (!v.inside && v.x >= x0 - 1 && v.x <= x1 + 2 && v.y >= y0 - 1 && v.y <= y1 + 2) L.push([v.y * TS + 2, 2, v]);
  for (const a of G.deer) if (a.x >= x0 - 1 && a.x <= x1 + 2 && a.y >= y0 - 1 && a.y <= y1 + 2) L.push([a.y * TS + 2, 3, a]);
  L.sort((a, b) => a[0] - b[0]);
  for (const [, k, o] of L) {
    if (k === 0) drawObj(o, X, s);
    else if (k === 1) drawBld(o, s, now);
    else if (k === 2) drawPerson(o, now);
    else { const fr = (Math.floor(o.fr / 6) % 2); const sp = X.deer[o.wait > 0 ? 0 : fr]; drawFlip(sp, o.x * TS - 8, o.y * TS - 12, o.flip); }
  }
  // fumaça
  for (const p of parts) { ctx.globalAlpha = Math.max(0, p.life / p.max) * .55; ctx.fillStyle = p.c; const r = p.r * (1.6 - p.life / p.max); ctx.fillRect(p.x - r / 2, p.y - r / 2, r, r); }
  ctx.globalAlpha = 1;
  drawOverlays(now, x0, y0, x1, y1);
  // noite
  const na = nightAmt() * .62;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (na > 0) {
    const h = hour();
    if (h > 17 && h < 21) { ctx.fillStyle = `rgba(255,130,60,${.12 * Math.sin(Math.PI * Math.min(1, (h - 17.5) / 3))})`; ctx.fillRect(0, 0, cv.width, cv.height); }
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgb(${255 - 205 * na | 0},${255 - 175 * na | 0},${255 - 80 * na | 0})`; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.globalCompositeOperation = 'lighter';
    drawLights(na, s, now);
    ctx.globalCompositeOperation = 'source-over';
  }
  drawWeather(s);
}
function drawFlip(img, x, y, flip) {
  if (!flip) { ctx.drawImage(img, Math.round(x), Math.round(y)); return; }
  ctx.save(); ctx.translate(Math.round(x) + img.width, Math.round(y)); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0); ctx.restore();
}
function drawObj(i, X, s) {
  const x = i % MW, y = (i / MW) | 0, o = G.obj[i], px = x * TS, py = y * TS, h = hash2(x, y, 1);
  const jx = Math.round((h - .5) * 4);
  if (o === O_TREE) { if (h < .45) { const sp = X.pine[h < .2 ? 0 : 1]; ctx.drawImage(sp, px + 8 - 11 + jx, py + 16 - 34); } else { const sp = X.oak[(h * 30 | 0) % 3]; ctx.drawImage(sp, px + 8 - 14 + jx, py + 16 - 32); } }
  else if (o === O_SAPLING) ctx.drawImage(X.sap, px + 3, py + 3);
  else if (o === O_BUSH) ctx.drawImage(X.bush[G.amt[i] > 0 && s < 3 ? 1 : 0], px - 1, py + 2);
  else if (o === O_ROCK) ctx.drawImage(X.rock[h < .5 ? 0 : 1], px - 1, py + 2);
  else if (o === O_IRON) ctx.drawImage(X.iron[h < .5 ? 0 : 1], px - 1, py + 2);
  if (G.marks.has(i)) { // marcação de recolher
    const yy = py - (o === O_TREE ? 18 : 2);
    F(ctx, px + 6, yy, 4, 4, '#f2c94c'); F(ctx, px + 7, yy + 1, 2, 2, '#c0473a'); F(ctx, px + 7, yy + 4, 2, 2, '#f2c94c');
  }
}
function drawBld(b, s, now) {
  const d = B[b.t], px = b.x * TS, py = b.y * TS, w = b.w * TS, h = b.h * TS;
  if (!b.done) {
    F(ctx, px + 1, py + 1, w - 2, h - 2, '#a07c50'); F(ctx, px + 1, py + 1, w - 2, 1, '#c09a6a'); F(ctx, px + 1, py + h - 2, w - 2, 1, '#7a5a38');
    const pr = b.prog / d.work, ph = 3 + pr * 18;
    for (const [cx, cy] of [[px + 2, py + 2], [px + w - 4, py + 2], [px + 2, py + h - 3], [px + w - 4, py + h - 3]]) F(ctx, cx, cy - ph, 2, ph, '#7a4b26');
    if (pr > .4) { F(ctx, px + 2, py + 2 - ph, w - 4, 2, '#8a5a30'); F(ctx, px + 2, py + h - 3 - ph, w - 4, 2, '#8a5a30'); }
    if (pr > .7) for (let k = 0; k < 4; k++) F(ctx, px + 2, py + h - 3 - ph + 3 + k * 4, w - 4, 1, '#9a6a3a');
    let gotT = (d.cost.tora || 0) - (b.need.tora || 0), gotP = (d.cost.pedra || 0) - (b.need.pedra || 0);
    for (let k = 0; k < Math.min(4, Math.ceil(gotT / 6)); k++) { F(ctx, px + 3, py + h - 6 - k * 2, 8, 2, '#9a6536'); P(ctx, px + 3, py + h - 6 - k * 2, '#d9b083'); }
    for (let k = 0; k < Math.min(4, Math.ceil(gotP / 6)); k++) F(ctx, px + w - 10 + (k % 2) * 3, py + h - 6 - (k >> 1) * 3, 3, 3, '#a8a8a0');
    // barra
    F(ctx, px + 2, py - 6 - ph, w - 4, 3, '#3b200d'); F(ctx, px + 3, py - 5 - ph, (w - 6) * pr, 1, '#7cd05a');
    if (Object.keys(b.need).length) { F(ctx, px + w / 2 - 2, py - 12 - ph, 4, 4, '#f2c94c'); }
    return;
  }
  const S = bldSpr(b.t, s);
  const x = px + (w - S.c.width) / 2, y = py + h - S.c.height + 2;
  ctx.drawImage(S.c, Math.round(x), Math.round(y));
  if (b.t === 'carroca') { // fogueira do acampamento
    const fx = px + 36, fy = py + h + 4, f = Math.floor(now / 140) % 3;
    for (const [dx, dy] of [[-4, 0], [-3, -2], [0, -3], [3, -2], [4, 0], [3, 2], [0, 3], [-3, 2]]) F(ctx, fx + dx - 1, fy + dy, 2, 2, '#8a8a84');
    F(ctx, fx - 3, fy, 6, 1, '#5a3a1a');
    F(ctx, fx - 2, fy - 3 - f, 4, 3 + f, '#f08a2a'); F(ctx, fx - 1, fy - 5 - (f === 1 ? 1 : 0), 2, 3, '#ffd24a'); P(ctx, fx + (f - 1), fy - 6 - f, '#fff3b0');
    if (Math.random() < .06 && parts.length < 300) parts.push({ x: fx, y: fy - 6, vx: (Math.random() - .5) * 3, vy: -7, life: 1.8, max: 1.8, r: 2.5, c: '#bdb8b0' });
  }
  // fumaça da chaminé
  if (S.chim && Math.random() < .12) {
    const smoking = d.home ? (b.wood > 0 && b.res.length && (temp() < 14 || G.vs.some(v => v.inside === b.id))) : (b.t === 'ferreiro' && G.t - (b.busy || -1e9) < 400) || b.workers.length > 0 && b.t !== 'coletor';
    if (smoking && parts.length < 300) parts.push({ x: x + S.chim[0] + Math.random() * 2, y: y + S.chim[1], vx: (Math.random() - .3) * 4, vy: -8 - Math.random() * 4, life: 2.5, max: 2.5, r: 3 + Math.random() * 2, c: s === 3 ? '#d8dde6' : '#e8e4dc' });
  }
}
function drawPerson(v, now) {
  const S = sprOf(v);
  const moving = v.q.length && v.q[0].a === 'go' && v.path.length;
  let fr = moving ? [1, 0, 2, 0][Math.floor(v.walkT / 2.2) % 4] : 0;
  let bob = 0;
  if (!moving && v.anim) bob = Math.floor(now / (v.anim === 'fish' ? 600 : 180)) % 2;
  const x = v.x * TS - 5, y = v.y * TS - 14 + bob;
  drawFlip(S[v.dir][fr], x, y, v.dir === 2 && v.flip);
  // ferramenta em uso
  if (!moving && v.anim) {
    const sx = v.dir === 2 ? (v.flip ? x - 2 : x + 10) : x + 8, sy = y + 6;
    if (v.anim === 'chop' || v.anim === 'mine' || v.anim === 'build') { F(ctx, sx, sy - (bob ? 4 : 1), 1, 5, '#7a4b26'); F(ctx, sx - 1, sy - (bob ? 4 : 1), 3, 2, v.anim === 'build' ? '#5a5a60' : '#b8b8b0'); }
    else if (v.anim === 'fish') { ctx.fillStyle = '#7a4b26'; for (let k = 0; k < 6; k++) ctx.fillRect(sx + (v.flip && v.dir === 2 ? -k : k), sy - k, 1, 1); F(ctx, sx + (v.flip && v.dir === 2 ? -6 : 6), sy - 5, 1, 7, 'rgba(255,255,255,.6)'); }
    else if (v.anim === 'farm' || v.anim === 'pick') { F(ctx, sx, sy + 1 + bob, 2, 2, v.anim === 'pick' ? '#d6334a' : '#7a4b26'); }
    else if (v.anim === 'hunt') { F(ctx, sx, sy - 3, 1, 8, '#7a4b26'); P(ctx, sx + 1, sy - 2, '#e6dcc0'); P(ctx, sx + 1, sy + 3, '#e6dcc0'); }
  }
  // o que carrega
  let k = null; for (const kk in v.carry) if (v.carry[kk] > 0) { k = kk; break; }
  if (k || v.sack) {
    const col = { tora: '#9a6536', pedra: '#a8a8a0', ferro: '#7d6a5c', lenha: '#c98d52', fruta: '#d6334a', carne: '#c0574a', peixe: '#7fb3d0', trigo: '#e8c04a', couro: '#8a5a30', ferramenta: '#5a5a60', roupa: '#3f7fc0' }[k] || '#d8b980';
    F(ctx, Math.round(x) + 2, Math.round(y) - 3, 6, 4, '#3b200d'); F(ctx, Math.round(x) + 3, Math.round(y) - 2, 4, 2, col);
  }
  if (sel && sel.v === v) { F(ctx, Math.round(x) + 3, Math.round(y) - 8 - (Math.floor(now / 300) % 2), 4, 2, '#fff36a'); F(ctx, Math.round(x) + 4, Math.round(y) - 6 - (Math.floor(now / 300) % 2), 2, 1, '#fff36a'); }
}
function drawOverlays(now, x0, y0, x1, y1) {
  // seleção
  if (sel && sel.b && bget(sel.b.id)) {
    const b = sel.b, d = B[b.t];
    ctx.strokeStyle = '#fff36a'; ctx.lineWidth = 1; ctx.setLineDash([3, 2]); ctx.lineDashOffset = -now / 80;
    ctx.strokeRect(b.x * TS + .5, b.y * TS + .5, b.w * TS - 1, b.h * TS - 1);
    if (d.radius) { const c = bCenter(b); ctx.beginPath(); ctx.arc(c.x * TS, c.y * TS, d.radius * TS, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,243,106,.8)'; ctx.stroke(); ctx.fillStyle = 'rgba(255,243,106,.07)'; ctx.fill(); }
    ctx.setLineDash([]);
  } else if (sel && sel.i !== undefined) {
    const x = sel.i % MW, y = (sel.i / MW) | 0; ctx.strokeStyle = '#fff36a'; ctx.strokeRect(x * TS + .5, y * TS + .5, 15, 15);
  }
  // fantasma do prédio
  if (M.t === 'place') {
    const d = B[M.type], ok = canPlace(M.type, M.x, M.y);
    ctx.fillStyle = ok ? 'rgba(120,255,120,.28)' : 'rgba(255,80,60,.38)'; ctx.fillRect(M.x * TS, M.y * TS, d.w * TS, d.h * TS);
    ctx.strokeStyle = ok ? '#b8ffb0' : '#ff8a7a'; ctx.lineWidth = 1; ctx.strokeRect(M.x * TS + .5, M.y * TS + .5, d.w * TS - 1, d.h * TS - 1);
    if (!d.flat) { const S = bldSpr(M.type, season()); ctx.globalAlpha = .7; ctx.drawImage(S.c, Math.round(M.x * TS + (d.w * TS - S.c.width) / 2), Math.round((M.y + d.h) * TS - S.c.height + 2)); ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect((M.x + (d.w >> 1)) * TS + 4, (M.y + d.h) * TS + 4, 8, 8); }
    if (d.radius) { ctx.beginPath(); ctx.arc((M.x + d.w / 2) * TS, (M.y + d.h / 2) * TS, d.radius * TS, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]); }
  }
  if (M.rect) {
    const r = normRect(M.rect);
    ctx.fillStyle = M.t === 'unmark' ? 'rgba(255,120,80,.22)' : 'rgba(255,230,90,.22)';
    ctx.fillRect(r.x0 * TS, r.y0 * TS, (r.x1 - r.x0 + 1) * TS, (r.y1 - r.y0 + 1) * TS);
    ctx.strokeStyle = '#fff36a'; ctx.strokeRect(r.x0 * TS + .5, r.y0 * TS + .5, (r.x1 - r.x0 + 1) * TS - 1, (r.y1 - r.y0 + 1) * TS - 1);
  }
}
function drawLights(na, s, now) {
  const z = cam.z * DPR;
  const glow = (wx, wy, r, col) => {
    const sx = (wx - cam.x) * z, sy = (wy - cam.y) * z, rr = r * z;
    if (sx < -rr || sy < -rr || sx > cv.width + rr || sy > cv.height + rr) return;
    const gr = ctx.createRadialGradient(sx, sy, 0, sx, sy, rr); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gr; ctx.fillRect(sx - rr, sy - rr, rr * 2, rr * 2);
  };
  const a = Math.min(1, na * 1.8);
  for (const b of G.blds) {
    if (!b.done || B[b.t].flat) continue;
    const S = bldSpr(b.t, s), x = b.x * TS + (b.w * TS - S.c.width) / 2, y = (b.y + b.h) * TS - S.c.height + 2;
    const lit = B[b.t].home ? G.vs.some(v => v.inside === b.id) : b.workers.length > 0;
    if (lit) for (const [wx, wy] of S.win) glow(x + wx, y + wy, 16, `rgba(255,190,90,${.55 * a})`);
    if (b.t === 'carroca') glow(b.x * TS + 36, (b.y + b.h) * TS + 4, 26, `rgba(255,150,60,${.5 * a})`);
    if (b.t === 'ferreiro') glow(x + 27, y + 38, 14, `rgba(255,120,40,${.6 * a})`);
  }
}
function drawWeather(s) {
  const want = s === 3 ? 90 : s === 2 ? 22 : s === 0 ? 14 : 0;
  while (weather.length < want) weather.push({ x: Math.random() * VW, y: Math.random() * VH, v: .5 + Math.random(), p: Math.random() * 6 });
  if (weather.length > want) weather.length = want;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  for (const w of weather) {
    if (s === 3) { ctx.fillStyle = 'rgba(255,255,255,.85)'; const r = w.v > 1.1 ? 3 : 2; ctx.fillRect(w.x | 0, w.y | 0, r, r); }
    else if (s === 2) { ctx.fillStyle = w.v > 1 ? '#d9692a' : '#e9a23b'; ctx.fillRect(w.x | 0, w.y | 0, 4, 3); ctx.fillStyle = '#b8521f'; ctx.fillRect((w.x | 0) + 1, (w.y | 0) + 1, 2, 1); }
    else { ctx.fillStyle = '#f7c6dc'; ctx.fillRect(w.x | 0, w.y | 0, 3, 2); }
  }
}
function updateParticles(rdt) {
  const sp = SPEEDS[G.speed] ? 1 : 0;
  for (const p of parts) { p.life -= rdt; p.x += p.vx * rdt; p.y += p.vy * rdt; p.vx += 2 * rdt; }
  for (let i = parts.length - 1; i >= 0; i--) if (parts[i].life <= 0) parts.splice(i, 1);
  const s = season();
  for (const w of weather) {
    w.p += rdt;
    if (s === 3) { w.y += 30 * w.v * rdt; w.x += Math.sin(w.p * 1.3) * 12 * rdt + 6 * rdt; }
    else { w.y += 22 * w.v * rdt; w.x += (Math.sin(w.p * 2) * 30 + 15) * rdt; }
    if (w.y > VH + 5) { w.y = -5; w.x = Math.random() * VW; } if (w.x > VW + 5) w.x = -5;
  }
}

// ---------------- toque, mouse e teclado
const ptr = new Map(); let gest = null;
const AREA = ['road', 'mark', 'unmark', 'unroad'];
function wTile(sx, sy) { const w = s2w(sx, sy); return { x: Math.floor(w.x / TS), y: Math.floor(w.y / TS) }; }
function normRect(r) { return { x0: Math.max(0, Math.min(r.x0, r.x1)), y0: Math.max(0, Math.min(r.y0, r.y1)), x1: Math.min(MW - 1, Math.max(r.x0, r.x1)), y1: Math.min(MH - 1, Math.max(r.y0, r.y1)) }; }
function clampCam() {
  const vw = VW / cam.z, vh = VH / cam.z;
  cam.x = Math.max(-vw * .4, Math.min(MW * TS - vw * .6, cam.x));
  cam.y = Math.max(-vh * .4, Math.min(MH * TS - vh * .6, cam.y));
}
function zoomAt(nz, sx, sy) { nz = Math.max(1.5, Math.min(7, nz)); const w = s2w(sx, sy); cam.z = nz; cam.x = w.x - sx / nz; cam.y = w.y - sy / nz; clampCam(); }
cv.addEventListener('pointerdown', e => {
  audioInit();
  if (!running) return;
  cv.setPointerCapture(e.pointerId);
  ptr.set(e.pointerId, { x: e.clientX, y: e.clientY });
  hideSub();
  if (ptr.size === 1) {
    const t = wTile(e.clientX, e.clientY);
    gest = { kind: 'pan', sx: e.clientX, sy: e.clientY, cx: cam.x, cy: cam.y, moved: false, last: t };
    if (M.t === 'place') { const d = B[M.type]; if (t.x >= M.x - 1 && t.x <= M.x + d.w && t.y >= M.y - 1 && t.y <= M.y + d.h) { gest.kind = 'ghost'; gest.ox = t.x - M.x; gest.oy = t.y - M.y; } }
    else if (AREA.includes(M.t)) { gest.kind = 'area'; M.rect = M.t === 'road' || M.t === 'unroad' ? null : { x0: t.x, y0: t.y, x1: t.x, y1: t.y }; if (M.t === 'road' || M.t === 'unroad') paintRoad(t.x, t.y); }
  } else if (ptr.size === 2) {
    const [a, b] = [...ptr.values()];
    if (gest && gest.kind === 'area') { M.rect = null; }
    gest = { kind: 'pinch', d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: cam.z, wx: cam.x + (a.x + b.x) / 2 / cam.z, wy: cam.y + (a.y + b.y) / 2 / cam.z, moved: true };
  }
});
cv.addEventListener('pointermove', e => {
  if (!ptr.has(e.pointerId) || !gest) return;
  ptr.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (gest.kind === 'pinch') {
    if (ptr.size < 2) return;
    const [a, b] = [...ptr.values()];
    const nz = Math.max(1.5, Math.min(7, gest.z0 * Math.hypot(a.x - b.x, a.y - b.y) / gest.d0));
    cam.z = nz; cam.x = gest.wx - (a.x + b.x) / 2 / nz; cam.y = gest.wy - (a.y + b.y) / 2 / nz; clampCam();
    return;
  }
  const dx = e.clientX - gest.sx, dy = e.clientY - gest.sy;
  if (Math.abs(dx) + Math.abs(dy) > 8) gest.moved = true;
  if (gest.kind === 'pan') { if (gest.moved) { cam.x = gest.cx - dx / cam.z; cam.y = gest.cy - dy / cam.z; clampCam(); G.follow = 0; } }
  else if (gest.kind === 'ghost') { const t = wTile(e.clientX, e.clientY); M.x = t.x - gest.ox; M.y = t.y - gest.oy; }
  else if (gest.kind === 'area') {
    const t = wTile(e.clientX, e.clientY);
    if (M.rect) { M.rect.x1 = t.x; M.rect.y1 = t.y; }
    else { // estrada: pinta a linha
      const l = gest.last, n = Math.max(Math.abs(t.x - l.x), Math.abs(t.y - l.y));
      for (let k = 1; k <= n; k++) paintRoad(Math.round(l.x + (t.x - l.x) * k / n), Math.round(l.y + (t.y - l.y) * k / n));
      gest.last = t;
    }
  }
});
const endPtr = e => {
  if (!ptr.has(e.pointerId)) return;
  ptr.delete(e.pointerId);
  if (!gest) return;
  if (gest.kind === 'pinch') { if (ptr.size === 1) { const [a] = [...ptr.values()]; gest = { kind: 'pan', sx: a.x, sy: a.y, cx: cam.x, cy: cam.y, moved: true }; } else if (!ptr.size) gest = null; return; }
  if (ptr.size) return;
  if (gest.kind === 'area') { if (M.rect) applyArea(); M.rect = null; }
  else if (!gest.moved) tap(e.clientX, e.clientY);
  gest = null;
};
cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('wheel', e => { e.preventDefault(); if (running) zoomAt(cam.z * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX, e.clientY); }, { passive: false });
addEventListener('keydown', e => {
  if (!running || dlgOpen) return;
  if (e.key === ' ') { setSpeed(G.speed ? 0 : 1); e.preventDefault(); }
  else if (e.key >= '1' && e.key <= '3') setSpeed(+e.key);
  else if (e.key === 'Escape') { setMode('none'); sel = null; }
  const k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1] }[e.key];
  if (k) { cam.x += k[0] * 60 / cam.z * 3; cam.y += k[1] * 60 / cam.z * 3; clampCam(); }
});

function paintRoad(x, y) {
  if (!inb(x, y)) return; const i = idx(x, y);
  if (M.t === 'road') { if (G.road[i] || G.tile[i] === T_WATER || bg[i] || G.obj[i] === O_ROCK || G.obj[i] === O_IRON) return; if (G.obj[i]) clearObj(i); G.road[i] = 1; }
  else { if (!G.road[i]) return; G.road[i] = 0; }
  terrainDirty = true;
}
function applyArea() {
  const r = normRect(M.rect); let n = 0;
  for (let y = r.y0; y <= r.y1; y++) for (let x = r.x0; x <= r.x1; x++) {
    const i = idx(x, y), o = G.obj[i];
    if (M.t === 'mark') { if ((o === O_TREE || o === O_ROCK || o === O_IRON || o === O_BUSH) && !G.marks.has(i)) { G.marks.add(i); n++; } }
    else if (G.marks.has(i)) { G.marks.delete(i); n++; }
  }
  if (n) { toast(M.t === 'mark' ? `${n} marcados para recolher.` : `${n} desmarcados.`, M.t === 'mark' ? '🪓' : '✋'); sfx('click'); }
}
function tap(sx, sy) {
  const t = wTile(sx, sy), w = s2w(sx, sy);
  if (M.t === 'place') { const d = B[M.type]; M.x = t.x - (d.w >> 1); M.y = t.y - (d.h >> 1); return; }
  if (M.t === 'demo') {
    if (!inb(t.x, t.y)) return;
    let id = bg[idx(t.x, t.y)] || (inb(t.x, t.y + 1) && bg[idx(t.x, t.y + 1)]);
    const b = id && bget(id);
    if (b) { if (b.t === 'carroca' && countDone('armazem') === 0) { toast('Construa um armazém antes de desmontar a carroça.', '⚠️'); return; } showDlg(`<h2>Demolir?</h2><p>Derrubar <b>${B[b.t].n}</b>? Volta metade do material.</p>`, [['Demolir', () => { removeBuilding(b); if (sel && sel.b === b) sel = null; sfx('click'); }], ['Cancelar', null]]); }
    return;
  }
  // seleção
  let best = null, bd = 9;
  for (const v of G.vs) { if (v.inside) continue; const dx = Math.abs(w.x - v.x * TS), dy = w.y - (v.y * TS - 6); if (dx < 11 && Math.abs(dy) < 13) { const d = dx + Math.abs(dy); if (d < bd) { bd = d; best = v; } } }
  if (best) { sel = { v: best }; sfx('click'); openInfo(); return; }
  if (!inb(t.x, t.y)) { sel = null; openInfo(); return; }
  const i = idx(t.x, t.y);
  let id = bg[i] || (inb(t.x, t.y + 1) && bg[idx(t.x, t.y + 1)] && !B[bget(bg[idx(t.x, t.y + 1)]).t].flat ? bg[idx(t.x, t.y + 1)] : 0);
  if (id) { sel = { b: bget(id) }; sfx('click'); openInfo(); return; }
  let oi = G.obj[i] ? i : (inb(t.x, t.y + 1) && G.obj[idx(t.x, t.y + 1)] === O_TREE ? idx(t.x, t.y + 1) : -1);
  if (oi >= 0) { sel = { i: oi }; sfx('click'); openInfo(); return; }
  sel = null; openInfo();
}

// ---------------- interface (HTML)
function chip(k) { return `<div class="chip" id="c_${k}" title="${RES[k] ? RES[k].n : ''}"><span>${RES[k] ? RES[k].i : ''}</span><b></b></div>`; }
function buildHUD() {
  $('top').innerHTML = `<div class="chip date" id="c_date"></div><div class="chip" id="c_pop" title="Moradores"><span>👥</span><b></b></div><div class="chip" id="c_food" title="Comida"><span>🍎</span><b></b></div>` +
    ['tora', 'pedra', 'ferro', 'lenha', 'ferramenta', 'roupa', 'couro'].map(chip).join('') + `<div class="chip" id="c_cap" title="Depósitos (usado / total)"><span>📦</span><b></b></div>`;
  $('cats').innerHTML = CATS.map(c => `<button class="btn cat" data-cat="${c.k}"><span>${c.i}</span><small>${c.n}</small></button>`).join('');
  $('ctl').innerHTML = `<button class="btn sm" data-sp="0" title="Pausar">⏸</button><button class="btn sm" data-sp="1" title="Normal">▶</button><button class="btn sm" data-sp="2" title="Rápido">⏩</button><button class="btn sm" data-sp="3" title="Muito rápido">⏭</button>
  <button class="btn sm" id="b_diary" title="Diário">📜</button><button class="btn sm" id="b_people" title="Moradores e trabalho">👥</button><button class="btn sm" id="b_menu" title="Menu">☰</button>`;
}
function setSpeed(k) { G.speed = k; sfx('click'); refreshCtl(); }
function refreshCtl() { document.querySelectorAll('[data-sp]').forEach(b => b.classList.toggle('on', +b.dataset.sp === G.speed)); }
function fmt(n) { n = Math.floor(n); return n >= 10000 ? (n / 1000).toFixed(0) + 'k' : n >= 1000 ? (n / 1000).toFixed(1) + 'k' : '' + n; }
function uiTick() {
  if (!running) return;
  const s = season();
  $('c_date').innerHTML = `<span>${SEASON_ICO[s]}</span><b>${SEASONS[s]} ${dayInSeason()} · Ano ${year()}</b><i>${String(Math.floor(hour())).padStart(2, '0')}:${String(Math.floor(G.t % 60 / 10) * 10).padStart(2, '0')} · ${Math.round(temp())}°</i>`;
  const kids = G.vs.filter(v => v.age < ADULT).length, homeless = G.vs.filter(v => !v.home).length;
  setChip('pop', `${G.vs.length}`, homeless > 0 && s >= 2, `Moradores: ${G.vs.length - kids} adultos, ${kids} crianças${homeless ? ` · ${homeless} sem casa!` : ''}`);
  const ft = foodTotal(); setChip('food', fmt(ft), ft < G.vs.length * 5, `Comida: ${FOODS.map(k => `${RES[k].i} ${Math.floor(G.stock[k])}`).join('  ')}`);
  for (const k of ['tora', 'pedra', 'ferro', 'lenha', 'ferramenta', 'roupa', 'couro']) setChip(k, fmt(G.stock[k]), (k === 'lenha' && s >= 2 && G.stock.lenha < 20) || (k === 'ferramenta' && G.stock[k] < 1));
  const cap = storeCap(), used = stockTotal(); setChip('cap', `${Math.round(used / Math.max(1, cap) * 100)}%`, used > cap * .92, `Depósitos: ${Math.floor(used)} de ${cap}`);
  refreshInfo();
  refreshMode();
}
function setChip(k, txt, bad, title) { const e = $('c_' + k); if (!e) return; const b = e.querySelector('b'); if (b.textContent !== txt) b.textContent = txt; e.classList.toggle('bad', !!bad); if (title) e.title = title; }

// menu de construir
let curCat = null;
const thumbs = {};
function thumb(t) {
  if (thumbs[t]) return thumbs[t];
  let c;
  if (t === 'campo') { const X = tex(1); [c] = mk(32, 32); const g = c.getContext('2d'); for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { g.drawImage(X.soil, x * 16, y * 16); g.drawImage(X.crop[4], x * 16, y * 16); } }
  else if (t === 'road') { [c] = mk(16, 16); const g = c.getContext('2d'); F(g, 0, 0, 16, 16, '#66b041'); F(g, 2, 0, 12, 16, '#b78d5b'); P(g, 6, 5, '#9a7248'); P(g, 9, 11, '#cfa878'); }
  else c = bldSpr(t, 1).c;
  return thumbs[t] = c.toDataURL();
}
const ACTIONS = [
  { k: 'mark', n: 'Recolher', i: '🪓', d: 'Arraste para marcar árvores, pedras e ferro. Os trabalhadores vão buscar.' },
  { k: 'unmark', n: 'Desmarcar', i: '✋', d: 'Arraste para tirar a marcação.' },
  { k: 'road', n: 'Estrada', i: '🟫', d: 'Arraste para fazer caminhos de terra: anda-se mais rápido.' },
  { k: 'unroad', n: 'Tirar estrada', i: '🚫', d: 'Arraste para apagar caminhos.' },
  { k: 'demo', n: 'Demolir', i: '💥', d: 'Toque num prédio para derrubar.' },
];
function openCat(k) {
  if (curCat === k) { hideSub(); return; }
  curCat = k; sfx('click');
  const sub = $('sub');
  let h = '';
  if (k === 'fer') h = ACTIONS.map(a => `<button class="card" data-act="${a.k}"><div class="ic">${a.i}</div><b>${a.n}</b><small>${a.d}</small></button>`).join('');
  else for (const t in B) {
    const d = B[t]; if (d.cat !== k) continue;
    const cost = Object.keys(d.cost).length ? Object.entries(d.cost).map(([r, n]) => `<span class="${G.stock[r] < n ? 'no' : ''}">${RES[r].i}${n}</span>`).join(' ') : '<span>grátis</span>';
    h += `<button class="card" data-b="${t}"><img src="${thumb(t)}"><b>${d.n}</b><small>${cost}</small></button>`;
  }
  sub.innerHTML = h; sub.classList.add('show');
  document.querySelectorAll('.cat').forEach(b => b.classList.toggle('on', b.dataset.cat === k));
}
function hideSub() { curCat = null; $('sub').classList.remove('show'); document.querySelectorAll('.cat').forEach(b => b.classList.remove('on')); }
function setMode(t, type) {
  M = { t };
  if (t === 'place') {
    M.type = type; const c = s2w(VW / 2, VH / 2); M.x = Math.floor(c.x / TS) - (B[type].w >> 1); M.y = Math.floor(c.y / TS) - (B[type].h >> 1);
    sel = null; openInfo();
  }
  hideSub(); refreshMode(true);
}
let lastModeKey = '';
function refreshMode(force) {
  const el = $('mode');
  let key = M.t + (M.type || '') + (M.t === 'place' ? canPlace(M.type, M.x, M.y) : '');
  if (!force && key === lastModeKey) return; lastModeKey = key;
  if (M.t === 'none') { el.classList.remove('show'); return; }
  let h = '';
  if (M.t === 'place') {
    const d = B[M.type], ok = canPlace(M.type, M.x, M.y);
    h = `<div class="mt"><b>${d.n}</b><small>${ok ? 'Toque no mapa ou arraste o prédio. Depois confirme.' : (d.water ? 'Tem que encostar na água e ter espaço.' : 'Lugar ruim: precisa de chão livre (sem água, pedra ou estrada) e porta livre.')}</small></div>
    <button class="btn ok" id="m_ok" ${ok ? '' : 'disabled'}>✔ Construir</button><button class="btn no" id="m_x">✕</button>`;
  } else {
    const a = ACTIONS.find(a => a.k === M.t);
    h = `<div class="mt"><b>${a.i} ${a.n}</b><small>${a.d} Dois dedos movem o mapa.</small></div><button class="btn no" id="m_x">✕ Pronto</button>`;
  }
  el.innerHTML = h; el.classList.add('show');
}
function confirmPlace() {
  if (M.t !== 'place' || !canPlace(M.type, M.x, M.y)) return;
  placeBuilding(M.type, M.x, M.y, false); sfx('place');
  M.x += B[M.type].w + 1; refreshMode(true);
}

document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  audioInit();
  if (t.dataset.cat) return openCat(t.dataset.cat);
  if (t.dataset.b) return setMode('place', t.dataset.b);
  if (t.dataset.act && !t.dataset.id && ACTIONS.some(a => a.k === t.dataset.act)) return setMode(t.dataset.act);
  if (t.dataset.sp) return setSpeed(+t.dataset.sp);
  if (t.id === 'm_ok') return confirmPlace();
  if (t.id === 'm_x') return setMode('none');
  if (t.id === 'b_diary') return showDiary();
  if (t.id === 'b_people') return showPeople();
  if (t.id === 'b_menu') return showMenu();
  if (t.dataset.dlg !== undefined) return closeDlg(+t.dataset.dlg);
  const a = t.dataset.a, id = +t.dataset.id;
  if (a === 'w+' || a === 'w-') { const b = bget(id); if (!b) return; b.maxW = Math.max(0, Math.min(B[b.t].jobs, b.maxW + (a === 'w+' ? 1 : -1))); assignJobs(); sfx('click'); refreshInfo(true); if (dlgOpen && $('people')) showPeople(true); return; }
  if (a === 'demo') { const b = bget(id); if (b) { if (b.t === 'carroca' && countDone('armazem') === 0) { toast('Construa um armazém antes de desmontar a carroça.', '⚠️'); return; } showDlg(`<h2>Demolir?</h2><p>Derrubar <b>${B[b.t].n}</b>? Volta metade do material.</p>`, [['Demolir', () => { removeBuilding(b); sel = null; openInfo(); }], ['Cancelar', null]]); } return; }
  if (a === 'follow') { G.follow = G.follow === id ? 0 : id; refreshInfo(true); return; }
  if (a === 'mark1') { const i = sel && sel.i; if (i !== undefined && G.obj[i]) { if (G.marks.has(i)) G.marks.delete(i); else if (G.obj[i] !== O_SAPLING) G.marks.add(i); } refreshInfo(true); return; }
  if (a === 'close') { sel = null; openInfo(); return; }
  if (a === 'prio') { const b = bget(id); if (b && !b.done) { G.blds = G.blds.filter(o => o !== b); G.blds.unshift(b); toast('Essa obra vai na frente.', '⭐'); } return; }
  if (a === 'gosel') { const b = bget(id); if (b) { const c = bCenter(b); cam.x = c.x * TS - VW / cam.z / 2; cam.y = c.y * TS - VH / cam.z / 2; clampCam(); sel = { b }; openInfo(); closeDlg(-1); } return; }
});

// painel de informações
let lastInfo = '';
function openInfo() { lastInfo = ''; refreshInfo(true); }
function bar(lbl, v, col) { v = Math.max(0, Math.min(100, v)); return `<div class="bar"><span>${lbl}</span><div><i style="width:${v}%;background:${v < 25 ? '#c0392b' : col}"></i></div></div>`; }
function refreshInfo(force) {
  const el = $('info'); let h = '';
  if (sel && sel.v && !vmap.has(sel.v.id)) sel = null;
  if (sel && sel.b && !bget(sel.b.id)) sel = null;
  if (sel && sel.i !== undefined && !G.obj[sel.i]) sel = null;
  if (!sel) { if (lastInfo) { el.classList.remove('show'); lastInfo = ''; } return; }
  if (sel.v) {
    const v = sel.v, home = v.home ? bget(v.home) : null, sp = v.spouse ? vget(v.spouse) : null;
    const job = v.age < ADULT ? 'Criança' : JOBS[v.job].i + ' ' + JOBS[v.job].n;
    const kids = G.vs.filter(k => k.mom === v.id || k.dad === v.id);
    h = `<h3>${v.male ? '👨' : '👩'} ${fullName(v)}</h3><div class="sub">${Math.floor(v.age)} anos · ${job}${v.age >= ELDER ? ' · idoso' : ''}</div>
    <p class="act">${v.inside ? (v.sleep ? '💤 Dormindo' : '🏠 Em casa') : '' } ${v.act || ''}</p>
    ${bar('Barriga', 100 - v.hunger, '#e0a03a')}${bar('Calor', v.warm, '#e0603a')}${bar('Saúde', v.health, '#4fa04a')}${v.age >= ADULT ? bar('Ferramenta', v.tools, '#7a8aa0') : ''}${bar('Roupa', v.clothes, '#5a7ac0')}
    <p>${home ? '🏠 Tem casa' : '⚠️ <b>Sem casa</b>'}${sp ? ` · 💍 ${sp.name}` : ''}${kids.length ? ` · 👶 ${kids.map(k => k.name).join(', ')}` : ''}</p>
    <div class="row"><button class="btn sm2" data-a="follow" data-id="${v.id}">${G.follow === v.id ? '✋ Parar de seguir' : '👁 Seguir'}</button><button class="btn sm2" data-a="close">✕</button></div>`;
  } else if (sel.b) {
    const b = sel.b, d = B[b.t];
    h = `<h3>${d.n}</h3>`;
    if (!b.done) {
      const need = Object.keys(d.cost).map(k => `${RES[k].i} ${d.cost[k] - (b.need[k] || 0)}/${d.cost[k]}`).join(' · ');
      h += `<div class="sub">Em obra · ${Math.floor(b.prog / d.work * 100)}% construído</div>${need ? `<p>Material: ${need}</p>` : ''}
      <p class="hint">${Object.keys(b.need).length ? (Object.keys(b.need).some(k => G.stock[k] < 1) ? '⚠️ Falta material no depósito!' : 'Trabalhadores trazendo material...') : 'Trabalhadores construindo...'}</p>
      <div class="row"><button class="btn sm2" data-a="prio" data-id="${b.id}">⭐ Prioridade</button><button class="btn sm2 no" data-a="demo" data-id="${b.id}">💥 Cancelar</button><button class="btn sm2" data-a="close">✕</button></div>`;
    } else {
      h += `<div class="sub">${d.desc}</div>`;
      if (d.jobs) {
        const ws = b.workers.map(vget).filter(Boolean);
        h += `<div class="wk"><span>${JOBS[d.job].i} ${JOBS[d.job].n}s: <b>${ws.length}</b> / vagas <b>${b.maxW}</b> (máx ${d.jobs})</span><button class="btn sq" data-a="w-" data-id="${b.id}">−</button><button class="btn sq" data-a="w+" data-id="${b.id}">+</button></div>`;
        if (ws.length) h += `<p class="names">${ws.map(v => v.name).join(', ')}</p>`;
        if (ws.length < b.maxW) h += `<p class="hint">Faltam trabalhadores livres (sempre ficam 2 para construir).</p>`;
        if (b.t === 'coletor' && season() === 3) h += `<p class="hint">No inverno não há o que colher: ajudam nas obras.</p>`;
      }
      if (d.home) h += `<p>Moradores (${b.res.length}/6): ${b.res.map(vget).filter(Boolean).map(v => `${v.name} (${Math.floor(v.age)})`).join(', ') || '<i>vazia</i>'}</p><p>🍎 Comida em casa: <b>${Math.floor(b.food)}</b> · 🔥 Lenha: <b>${Math.floor(b.wood)}</b></p>`;
      if (d.store) h += `<p>Depósitos da vila: <b>${Math.floor(stockTotal())}</b> de ${storeCap()}</p><div class="stk">${Object.keys(RES).map(k => `<span>${RES[k].i} ${Math.floor(G.stock[k])}</span>`).join('')}</div>`;
      if (d.flat) { const s = season(); h += `<p>${s === 3 ? '❄️ Terra parada até a primavera.' : `Plantado ${Math.round(b.plant * 100)}% · Crescimento ${Math.round(b.growth * 100)}% · Colhido ${Math.round(b.harv * 100)}%`}</p>`; }
      if (CRAFT[d.job]) { const R = CRAFT[d.job]; h += `<p class="hint">${Object.entries(R.in).map(([k, n]) => `${RES[k].i}${n}`).join(' + ') || '⛰️'} → ${Object.entries(R.out).map(([k, n]) => `${RES[k].i}${n}`).join(' ')}</p>`; }
      h += `<div class="row">${b.t !== 'carroca' || countDone('armazem') ? `<button class="btn sm2 no" data-a="demo" data-id="${b.id}">💥 Demolir</button>` : ''}<button class="btn sm2" data-a="close">✕</button></div>`;
    }
  } else if (sel.i !== undefined) {
    const i = sel.i, o = G.obj[i];
    const name = { [O_TREE]: `🌳 Árvore — ${G.amt[i]} toras`, [O_SAPLING]: `🌱 Muda — ${Math.round(G.grow[i] * 100)}% crescida`, [O_ROCK]: `🪨 Pedras — ${G.amt[i]} de pedra`, [O_IRON]: `⛓️ Minério de ferro — ${G.amt[i]}`, [O_BUSH]: `🫐 Arbusto — ${G.amt[i]} frutas` }[o];
    h = `<h3>${name}</h3><p class="hint">${G.marks.has(i) ? 'Marcado: um trabalhador vem recolher.' : o === O_SAPLING ? 'Cresce sozinha até virar árvore.' : 'Marque para os trabalhadores recolherem.'}</p>
    <div class="row">${o !== O_SAPLING ? `<button class="btn sm2" data-a="mark1">${G.marks.has(i) ? '✋ Desmarcar' : '🪓 Recolher'}</button>` : ''}<button class="btn sm2" data-a="close">✕</button></div>`;
  }
  if (h !== lastInfo || force) { el.innerHTML = h; lastInfo = h; el.classList.add('show'); }
}

// ---------------- janelas
const dlgActs = [];
function showDlg(html, buttons, cls) {
  const el = $('dlg');
  dlgActs.length = 0;
  const bs = (buttons || [['Ok', null]]).map(([t, f], k) => { dlgActs.push(f); return `<button class="btn big" data-dlg="${k}">${t}</button>`; }).join('');
  el.innerHTML = `<div class="box pnl ${cls || ''}">${html}<div class="row c">${bs}</div></div>`;
  el.classList.add('show'); dlgOpen = 1;
}
function closeDlg(k) { const f = dlgActs[k]; $('dlg').classList.remove('show'); dlgOpen = 0; if (f) f(); }
function showStory(i) {
  const st = STORY[i]; if (!st) return;
  showDlg(`<div class="kick">📜 Diário de Dona Cida — capítulo ${i + 1}</div><h2>${st.t}</h2><p class="story">${st.txt}</p>${st.goal ? `<div class="goal">🎯 <b>Objetivo:</b> ${st.goal}</div>` : ''}`, [[i === 0 ? 'Começar' : 'Continuar', null]], 'storybox');
}
function showDiary() {
  const st = STORY[G.storyI];
  const past = STORY.slice(0, G.storyI).map((s, k) => `<li>✔ ${s.t}</li>`).join('');
  const log = (G.log || []).slice(-14).reverse().map(l => `<li>${l}</li>`).join('');
  showDlg(`<div class="kick">📜 Diário de Dona Cida</div><h2>${st.t}</h2><p class="story">${st.txt}</p>${st.goal ? `<div class="goal">🎯 <b>Objetivo:</b> ${st.goal}</div>` : ''}
  ${past ? `<h4>Capítulos vividos</h4><ul class="past">${past}</ul>` : ''}<h4>Acontecimentos recentes</h4><ul class="log">${log || '<li>Nada ainda.</li>'}</ul>
  <p class="hint">Mortes: ${G.deaths} · Nascimentos: ${G.births}${G.nomadsJoined ? ` · Viajantes acolhidos: ${G.nomadsJoined}` : ''}</p>`, [['Fechar', null]], 'storybox');
}
function showPeople(refresh) {
  const adults = G.vs.filter(v => v.age >= ADULT), kids = G.vs.length - adults.length, old = G.vs.filter(v => v.age >= ELDER).length;
  const homeless = G.vs.filter(v => !v.home).length, freeHouses = G.blds.filter(b => b.done && B[b.t].home && !b.res.length).length;
  const labs = adults.filter(v => v.job === 'lab').length;
  const rows = G.blds.filter(b => b.done && B[b.t].jobs).map(b => `<tr><td><button class="lnk" data-a="gosel" data-id="${b.id}">${JOBS[B[b.t].job].i} ${B[b.t].n}</button></td><td><b>${b.workers.length}</b>/${b.maxW}</td><td><button class="btn sq" data-a="w-" data-id="${b.id}">−</button><button class="btn sq" data-a="w+" data-id="${b.id}">+</button></td></tr>`).join('');
  const html = `<div id="people"><h2>👥 Moradores</h2><p><b>${G.vs.length}</b> pessoas: ${adults.length} adultos (${old} idosos), ${kids} crianças.<br>${homeless ? `⚠️ <b>${homeless} sem casa</b>` : '🏠 Todos têm casa'} · Casas vazias: ${freeHouses}</p>
  <p>🧺 Trabalhadores livres (constroem e recolhem): <b>${labs}</b></p>
  ${rows ? `<table class="jobs">${rows}</table>` : '<p class="hint">Construa cabanas de trabalho para dar profissões.</p>'}
  <p class="hint">Cada vaga tira um trabalhador livre. Sempre ficam 2 livres para as obras.</p></div>`;
  if (refresh && dlgOpen) { $('dlg').querySelector('.box').innerHTML = html + `<div class="row c"><button class="btn big" data-dlg="0">Fechar</button></div>`; return; }
  showDlg(html, [['Fechar', null]]);
}
function showMenu() {
  showDlg(`<h2>☰ Menu</h2><p class="hint">O jogo salva sozinho todo dia de manhã.</p>`,
    [['💾 Salvar agora', () => { saveGame(); toast('Jogo salvo.', '💾'); }], [`🎵 Música: ${musicOn ? 'ligada' : 'desligada'}`, () => { musicOn = !musicOn; try { localStorage.setItem('refugio-music', musicOn ? '1' : '0'); } catch (e) { } toast(musicOn ? 'Música ligada' : 'Música desligada', '🎵'); }],
    ['❓ Como jogar', showHelp], ['🌱 Novo jogo', () => showDlg('<h2>Começar de novo?</h2><p>O jogo atual será perdido.</p>', [['Sim, novo jogo', () => { newGame(); }], ['Não', null]])], ['Voltar', null]]);
}
function showHelp() {
  showDlg(`<h2>❓ Como jogar</h2><div class="help">
  <p><b>Objetivo:</b> manter a vila viva. Não há guerra — o inimigo é o inverno, a fome e o frio.</p>
  <p>🏠 <b>Casas</b>: cada família precisa de uma. Casa vazia atrai um casal; casais com casa têm filhos. Sem casa vazia, a vila não cresce.</p>
  <p>🍎 <b>Comida</b>: coletor, caçador e pescador funcionam logo. A plantação de trigo rende muito mas só colhe no fim do verão.</p>
  <p>🔥 <b>Lenha</b>: no frio cada casa queima lenha. O lenhador transforma toras em lenha. Sem lenha, gente morre de frio.</p>
  <p>🔨 <b>Ferramentas e roupas</b>: gastam com o uso. Sem ferramenta trabalha-se devagar; sem roupa, o frio pega mais.</p>
  <p>🪓 <b>Recolher</b>: marque árvores e pedras e os trabalhadores livres trazem para o depósito.</p>
  <p>👥 <b>Trabalho</b>: toque numa cabana e use − / + para escolher quantos trabalham nela.</p>
  <p>👆 Arraste para andar pelo mapa, pinça para zoom, toque para ver detalhes.</p></div>`, [['Entendi', null]]);
}
function toast(msg, ico = 'ℹ️', bad) {
  if (G.log) { G.log.push(`${ico} <b>${SEASONS[season()]} ${dayInSeason()}, ano ${year()}:</b> ${msg}`); if (G.log.length > 60) G.log.shift(); }
  if (!running) return;
  const el = document.createElement('div'); el.className = 'toast' + (bad ? ' bad' : ''); el.innerHTML = `<span>${ico}</span>${msg}`;
  const box = $('toasts'); box.appendChild(el); while (box.children.length > 4) box.firstChild.remove();
  setTimeout(() => el.classList.add('out'), 4200); setTimeout(() => el.remove(), 4800);
  if (bad) sfx('bad');
}
function gameOver() {
  G.over = true; try { localStorage.removeItem(SAVE_KEY); } catch (e) { }
  setTimeout(() => showDlg(`<h2>🕯️ O vale ficou em silêncio</h2><p class="story">O último morador se foi. A vila resistiu por <b>${year() - 1} ano(s) e ${(day() % DAYS_PER_YEAR)} dias</b>.<br><br>Um dia, outros exilados vão descer a serra e encontrar as casas vazias... e talvez tenham mais sorte.</p>`, [['🌱 Tentar de novo', () => newGame()]]), 50);
}

// ---------------- som (sintetizado) e música
let AC = null, musicOn = true, sfxGain = null, musGain = null;
try { musicOn = localStorage.getItem('refugio-music') !== '0'; } catch (e) { }
function audioInit() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    sfxGain = AC.createGain(); sfxGain.gain.value = .9; sfxGain.connect(AC.destination);
    musGain = AC.createGain(); musGain.gain.value = .5; musGain.connect(AC.destination);
    setInterval(musicTick, 250);
  } catch (e) { AC = null; }
}
function tone(f, t, dur, type = 'sine', vol = .1, out = sfxGain) {
  const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + .05);
}
function sfx(k) {
  if (!AC) return; const t = AC.currentTime;
  if (k === 'click') tone(660, t, .05, 'square', .025);
  else if (k === 'place') { tone(330, t, .08, 'square', .04); tone(440, t + .06, .1, 'square', .03); }
  else if (k === 'done') [523, 659, 784].forEach((f, i) => tone(f, t + i * .09, .3, 'triangle', .07));
  else if (k === 'birth') [784, 988, 1175, 1568].forEach((f, i) => tone(f, t + i * .1, .35, 'sine', .06));
  else if (k === 'story') [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, t + i * .14, .6, 'triangle', .06));
  else if (k === 'hunt') tone(160, t, .12, 'sawtooth', .03);
  else if (k === 'bad') { tone(262, t, .25, 'triangle', .06); tone(208, t + .2, .4, 'triangle', .06); }
}
let beat = 0, nextBeat = 0;
const CHORDS = [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]]; // I vi IV V
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16];
function musicTick() {
  if (!AC || !running || !musicOn || AC.state !== 'running') return;
  const s = season(), base = s === 3 ? 220 : 261.63, len = s === 3 ? .8 : .55;
  const now = AC.currentTime; if (nextBeat < now) nextBeat = now + .05;
  while (nextBeat < now + .6) {
    const ch = CHORDS[Math.floor(beat / 8) % 4];
    if (beat % 8 === 0) tone(base / 2 * Math.pow(2, ch[0] / 12), nextBeat, len * 6, 'triangle', .035, musGain);
    if (beat % 2 === 0 && Math.random() < .7) { const n = PENTA[Math.random() * PENTA.length | 0]; tone(base * Math.pow(2, (n + (s === 3 ? -12 : 0)) / 12 + (Math.random() < .3 ? ch[1] / 12 : 0)), nextBeat, len * 2.5, 'sine', .028, musGain); }
    if (beat % 4 === 2 && Math.random() < .5) tone(base * Math.pow(2, ch[2] / 12), nextBeat, len * 2, 'triangle', .018, musGain);
    beat++; nextBeat += len;
  }
}

// ---------------- salvar / carregar
function b64(a) { let s = ''; for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
function unb64(s, T) { const d = atob(s), a = new T(d.length); for (let i = 0; i < d.length; i++) a[i] = d.charCodeAt(i); return a; }
function saveGame() {
  if (!running || G.over || !G.tile) return;
  try {
    const g8 = new Uint8Array(N); for (let i = 0; i < N; i++) g8[i] = Math.round(G.grow[i] * 100);
    const d = {
      v: 1, t: G.t, seed: G.seed, speed: G.speed, tile: b64(G.tile), obj: b64(G.obj), amt: b64(G.amt), road: b64(G.road), grow: b64(g8), marks: [...G.marks],
      blds: G.blds.map(b => ({ ...b, spots: undefined, inc: {}, builders: 0, sup: 0 })),
      vs: G.vs.map(v => ({ ...v, q: undefined, path: undefined, cleanup: undefined, spr: undefined, anim: null, sack: false })),
      deer: G.deer.map(a => ({ x: a.x, y: a.y })), stock: G.stock, storyI: G.storyI, births: G.births, deaths: G.deaths, harvested: G.harvested, nextId: G.nextId,
      harsh: G.harsh, nomadsJoined: G.nomadsJoined || 0, log: G.log, cam: { x: cam.x, y: cam.y, z: cam.z },
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(d));
  } catch (e) { console.warn('não salvou', e); }
}
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
function loadGame() {
  const d = JSON.parse(localStorage.getItem(SAVE_KEY));
  for (const k in G) delete G[k];
  Object.assign(G, {
    t: d.t, seed: d.seed, speed: d.speed || 1, tile: unb64(d.tile, Uint8Array), obj: unb64(d.obj, Uint8Array), amt: unb64(d.amt, Uint8Array), road: unb64(d.road, Uint8Array),
    grow: Float32Array.from(unb64(d.grow, Uint8Array), x => x / 100), marks: new Set(d.marks), blds: d.blds, vs: d.vs,
    deer: d.deer.map(a => ({ x: a.x, y: a.y, tx: a.x, ty: a.y, wait: Math.random() * 60, hunted: 0, fr: 0 })), stock: d.stock, storyI: d.storyI, births: d.births, deaths: d.deaths,
    harvested: d.harvested, nextId: d.nextId, harsh: d.harsh, nomadsJoined: d.nomadsJoined, log: d.log || [], follow: 0, over: false,
  });
  for (const k in RES) if (G.stock[k] === undefined) G.stock[k] = 0;
  for (const v of G.vs) { v.q = []; v.path = []; v.cleanup = null; v.spr = null; }
  claims = new Map(); rebuildIndex();
  if (d.cam) Object.assign(cam, d.cam);
  startPlay();
}
addEventListener('visibilitychange', () => { if (document.hidden && running) saveGame(); });

// ---------------- novo jogo, título e laço principal
function newGame() {
  for (const k in G) delete G[k];
  const seed = (Math.random() * 1e9) | 0;
  Object.assign(G, {
    seed, t: 6 * 60 + 30, speed: 1, blds: [], vs: [], deer: [], marks: new Set(), nextId: 1, storyI: 0, births: 0, deaths: 0, harvested: 0, harsh: false, log: [], follow: 0, over: false,
    stock: { fruta: 220, carne: 60, peixe: 0, trigo: 220, tora: 80, pedra: 40, ferro: 10, lenha: 40, couro: 0, ferramenta: 14, roupa: 14 },
  });
  genMap(seed);
  claims = new Map(); rebuildIndex();
  const cx = MW / 2 - 1, cy = MH / 2 - 1;
  placeBuilding('carroca', cx, cy, true);
  spawnFamilies(cx, cy);
  spawnDeer(30);
  G.harvested = 0;
  cam.z = Math.max(2.5, Math.min(4, Math.round(Math.min(VW, VH) / 140)));
  cam.x = (cx + 1) * TS - VW / cam.z / 2; cam.y = (cy + 1) * TS - VH / cam.z / 2;
  sel = null; M = { t: 'none' };
  startPlay();
  showStory(0);
  saveGame();
}
function startPlay() {
  running = true; $('title').classList.remove('show'); $('hud').classList.add('show');
  buildHUD(); refreshCtl(); openInfo(); setMode('none'); $('toasts').innerHTML = '';
}
function showTitle() {
  running = false;
  $('hud').classList.remove('show'); $('title').classList.add('show');
  $('t_cont').style.display = hasSave() ? '' : 'none';
}
$('t_new').onclick = () => { audioInit(); if (hasSave()) showDlg('<h2>Novo jogo?</h2><p>O jogo salvo será substituído.</p>', [['Sim', () => newGame()], ['Não', null]]); else newGame(); };
$('t_cont').onclick = () => { audioInit(); try { loadGame(); } catch (e) { console.error(e); toast('Não deu para abrir o jogo salvo.', '⚠️'); newGame(); } };
$('t_help').onclick = () => { audioInit(); showHelp(); };

let last = performance.now();
function simStep(dt) {
  const h0 = Math.floor(G.t / 60), d0 = Math.floor((G.t - 360) / 1440);
  G.t += dt;
  for (const v of G.vs.slice()) if (vmap.has(v.id)) runV(v, dt);
  updateDeer(dt);
  if (Math.floor(G.t / 60) !== h0) hourTick();
  if (Math.floor((G.t - 360) / 1440) !== d0) dayTick();
}
function frame(now) {
  const rdt = Math.min(.1, (now - last) / 1000); last = now;
  if (running && !dlgOpen && !G.over) {
    let gm = rdt * MIN_PER_SEC * SPEEDS[G.speed];
    while (gm > 0) { const st = Math.min(gm, 2); simStep(st); gm -= st; }
  }
  if (!running && G.tile && !dlgOpen) { let gm = rdt * MIN_PER_SEC * .6; while (gm > 0) { const st = Math.min(gm, 2); simStep(st); gm -= st; } }
  if (!running) { // tela de título: a câmera passeia pelo vale
    cam.z = Math.max(2, Math.min(VW, VH) / 160); cam.x = MW * TS / 2 - VW / cam.z / 2 + Math.sin(now / 9000) * 120; cam.y = MH * TS / 2 - VH / cam.z / 2 + Math.cos(now / 11000) * 80;
  }
  if (G.follow) { const v = vget(G.follow); if (v) { cam.x += (v.x * TS - VW / cam.z / 2 - cam.x) * .1; cam.y += (v.y * TS - VH / cam.z / 2 - cam.y) * .1; } }
  updateParticles(rdt);
  if (G.tile) render(now);
  if (now - (frame.ui || 0) > 250) { frame.ui = now; uiTick(); }
  requestAnimationFrame(frame);
}

// fundo da tela de título: um vale de exemplo
(function boot() {
  Object.assign(G, { seed: 7, t: 2 * 1440 + 10 * 60, speed: 0, blds: [], vs: [], deer: [], marks: new Set(), nextId: 1, stock: {}, log: [] });
  genMap(1234); rebuildIndex();
  placeBuilding('carroca', MW / 2 - 1, MH / 2 - 1, true);
  placeBuilding('casa', MW / 2 - 5, MH / 2 - 4, true); placeBuilding('casa', MW / 2 + 2, MH / 2 - 4, true);
  spawnFamilies(MW / 2 - 1, MH / 2 - 1); spawnDeer(20);
  showTitle();
  requestAnimationFrame(frame);
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
})();
window.__dbg = { G, sim: h => { for (let k = 0; k < h * 30; k++) simStep(2); }, cam, get sel() { return sel; } };
