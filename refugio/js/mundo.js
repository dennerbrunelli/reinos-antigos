// ============================================================
//  Refúgio — mundo: mapa, recursos, prédios e caminhos
// ============================================================
'use strict';

const TS = 16, MW = 72, MH = 72, N = MW * MH;
const MIN_PER_SEC = 40;              // minutos do jogo por segundo real (1x)
const DAYS_PER_SEASON = 6, DAYS_PER_YEAR = 24;
const ADULT = 10, ELDER = 60;
const SEASONS = ['Primavera', 'Verão', 'Outono', 'Inverno'];
const SEASON_ICO = ['🌸', '☀️', '🍂', '❄️'];
// tiles
const T_GRASS = 0, T_WATER = 1, T_SAND = 2, T_FORD = 3;
// objetos
const O_TREE = 1, O_SAPLING = 2, O_ROCK = 3, O_IRON = 4, O_BUSH = 5;

const RES = {
  fruta: { n: 'Frutas e ervas', i: '🫐', food: 1 }, carne: { n: 'Carne', i: '🍖', food: 1 }, peixe: { n: 'Peixe', i: '🐟', food: 1 }, trigo: { n: 'Trigo', i: '🌾', food: 1 },
  tora: { n: 'Toras', i: '🪵' }, pedra: { n: 'Pedra', i: '🪨' }, ferro: { n: 'Ferro', i: '⛓️' }, lenha: { n: 'Lenha', i: '🔥' },
  couro: { n: 'Couro', i: '🟫' }, ferramenta: { n: 'Ferramentas', i: '🔨' }, roupa: { n: 'Roupas', i: '🧥' },
};
const FOODS = ['fruta', 'carne', 'peixe', 'trigo'];

const B = {
  carroca: { n: 'Carroça', w: 2, h: 2, cost: {}, work: 1, store: 900, desc: 'Os mantimentos trazidos de Pedra Alta. Serve de depósito.' },
  casa: { n: 'Casa de madeira', w: 2, h: 2, cost: { tora: 16, pedra: 8 }, work: 36, home: 6, burn: .3, cat: 'mor', desc: 'Abriga uma família. No frio, gasta lenha.' },
  casap: { n: 'Casa de pedra', w: 2, h: 2, cost: { tora: 10, pedra: 30, ferro: 4 }, work: 60, home: 6, burn: .14, cat: 'mor', desc: 'Mais quente: gasta metade da lenha.' },
  coletor: { n: 'Cabana do coletor', w: 2, h: 2, cost: { tora: 20 }, work: 24, jobs: 4, job: 'coletor', radius: 10, cat: 'com', desc: 'Colhe frutas, ervas e cogumelos da mata. Para no inverno.' },
  cacador: { n: 'Cabana do caçador', w: 2, h: 2, cost: { tora: 20, pedra: 4 }, work: 24, jobs: 3, job: 'cacador', radius: 13, cat: 'com', desc: 'Caça cervos: carne e couro.' },
  pescador: { n: 'Cabana do pescador', w: 2, h: 2, cost: { tora: 24, pedra: 6 }, work: 30, jobs: 3, job: 'pescador', water: true, cat: 'com', desc: 'Tem que encostar na água. Pesca o ano todo (pouco no inverno).' },
  campo: { n: 'Plantação de trigo', w: 5, h: 5, cost: {}, work: 9, jobs: 3, job: 'fazendeiro', flat: true, cat: 'com', desc: 'Planta na primavera, colhe no fim do verão. A geada do inverno estraga o que sobrar.' },
  armazem: { n: 'Armazém', w: 3, h: 2, cost: { tora: 30, pedra: 12 }, work: 45, store: 1000, cat: 'rec', desc: 'Guarda os recursos. Faça perto de onde se trabalha.' },
  silvicultor: { n: 'Cabana do silvicultor', w: 2, h: 2, cost: { tora: 24, pedra: 8 }, work: 30, jobs: 4, job: 'silvicultor', radius: 9, cat: 'rec', desc: 'Corta árvores e planta mudas. Toras sem acabar a mata.' },
  lenhador: { n: 'Lenhador', w: 2, h: 2, cost: { tora: 24, pedra: 8 }, work: 30, jobs: 2, job: 'lenhador', cat: 'rec', desc: '3 toras viram 9 de lenha. Sem toras no depósito, corta árvores perto da cabana.' },
  pedreira: { n: 'Pedreira', w: 3, h: 3, cost: { tora: 30 }, work: 45, jobs: 4, job: 'pedreiro', cat: 'rec', desc: 'Tira pedra sem acabar (devagar).' },
  mina: { n: 'Mina de ferro', w: 3, h: 3, cost: { tora: 40, pedra: 24 }, work: 60, jobs: 4, job: 'mineiro', cat: 'rec', desc: 'Tira ferro sem acabar.' },
  ferreiro: { n: 'Ferreiro', w: 2, h: 2, cost: { tora: 30, pedra: 30, ferro: 4 }, work: 45, jobs: 2, job: 'ferreiro', cat: 'ofi', desc: '2 toras + 2 ferros viram 2 ferramentas.' },
  alfaiate: { n: 'Alfaiate', w: 2, h: 2, cost: { tora: 30, pedra: 20 }, work: 36, jobs: 2, job: 'alfaiate', cat: 'ofi', desc: '4 couros viram 2 roupas de frio.' },
};
const CATS = [
  { k: 'mor', n: 'Moradia', i: '🏠' }, { k: 'com', n: 'Comida', i: '🍎' }, { k: 'rec', n: 'Recursos', i: '🪵' }, { k: 'ofi', n: 'Ofícios', i: '🔨' }, { k: 'fer', n: 'Ações', i: '🪓' },
];
const JOBS = {
  lab: { n: 'Trabalhador', i: '🧺', hat: null }, coletor: { n: 'Coletor', i: '🫐', hat: '#a6853b' }, cacador: { n: 'Caçador', i: '🏹', hat: '#5a6a2a' },
  pescador: { n: 'Pescador', i: '🎣', hat: '#e0c870' }, fazendeiro: { n: 'Fazendeiro', i: '🌾', hat: '#d8b35a' }, silvicultor: { n: 'Silvicultor', i: '🌲', hat: '#3f6f2a' },
  lenhador: { n: 'Lenhador', i: '🪓', hat: '#a6452a' }, pedreiro: { n: 'Pedreiro', i: '🪨', hat: '#8a8a84' }, mineiro: { n: 'Mineiro', i: '⛏️', hat: '#f2c94c' },
  ferreiro: { n: 'Ferreiro', i: '🔨', hat: '#3a3a3e' }, alfaiate: { n: 'Alfaiate', i: '🧵', hat: '#8a5aa8' },
};
const CRAFT = {
  lenhador: { in: { tora: 3 }, out: { lenha: 9 }, t: 170, a: 'Rachando lenha' },
  ferreiro: { in: { tora: 2, ferro: 2 }, out: { ferramenta: 2 }, t: 300, a: 'Forjando ferramentas' },
  alfaiate: { in: { couro: 4 }, out: { roupa: 2 }, t: 300, a: 'Costurando roupas' },
  pedreiro: { in: {}, out: { pedra: 5 }, t: 200, a: 'Cortando pedra' },
  mineiro: { in: {}, out: { ferro: 3 }, t: 240, a: 'Minerando ferro' },
};

const G = {};           // estado do jogo (é o que se salva)
let bmap = new Map(), vmap = new Map();
let bg = new Int32Array(N), blk = new Uint8Array(N); // prédio em cada tile / tile bloqueado
let claims = new Map(); // tile -> id da pessoa que vai trabalhar nele
let terrainDirty = true;

const inb = (x, y) => x >= 0 && y >= 0 && x < MW && y < MH;
const idx = (x, y) => y * MW + x;
const bget = id => bmap.get(id);
const vget = id => vmap.get(id);
const walk = i => G.tile[i] !== T_WATER && !blk[i];
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

// ---------------- tempo
const day = () => Math.floor(G.t / 1440);
const hour = () => (G.t % 1440) / 60;
const season = () => Math.floor(day() / DAYS_PER_SEASON) % 4;
const year = () => Math.floor(day() / DAYS_PER_YEAR) + 1;
const dayInSeason = () => day() % DAYS_PER_SEASON + 1;
function temp() {
  const s = season(), d = dayInSeason(), H = hour();
  let T = [13, 22, 10, -6][s];
  if (s === 0 && d <= 2) T = 7;
  if (s === 2 && d > 3) T = 3;
  if (s === 3 && G.harsh) T = -13;
  if (H < 6 || H >= 20) T -= 4;
  return T;
}

// ---------------- estoque
function foodTotal() { let n = 0; for (const k of FOODS) n += G.stock[k]; return n; }
function stockTotal() { let n = 0; for (const k in G.stock) n += G.stock[k]; return n; }
function storeCap() { let n = 0; for (const b of G.blds) if (b.done && B[b.t].store) n += B[b.t].store; return n; }
function spaceLeft() { return storeCap() - stockTotal(); }
// cabe mais disto? (sempre cabe o que está em falta, para a vila nunca travar)
function roomFor(k, n) {
  if (spaceLeft() >= n) return true;
  if (G.stock[k] < (RES[k].food ? 60 : 40)) return true;
  return G.blds.some(b => !b.done && (b.need[k] || 0) > 0);
}
function take(k, n) { const t = Math.max(0, Math.min(n, Math.floor(G.stock[k]))); G.stock[k] -= t; return t; }
function takeFood(n) {
  let got = 0;
  while (got < n) {
    let best = null; for (const k of FOODS) if (G.stock[k] >= 1 && (!best || G.stock[k] > G.stock[best])) best = k;
    if (!best) break; G.stock[best] -= 1; got++;
  }
  return got;
}
function addStock(k, n) { G.stock[k] = (G.stock[k] || 0) + n; if (k === 'trigo') G.harvested += n; }

// ---------------- ruído para gerar o mapa
function vnoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, s) { let t = 0, a = 1, f = 1, n = 0; for (let o = 0; o < 4; o++) { t += vnoise(x * f, y * f, s + o * 17) * a; n += a; a *= .5; f *= 2; } return t / n; }

function genMap(seed) {
  const R = mrng(seed);
  G.tile = new Uint8Array(N); G.obj = new Uint8Array(N); G.amt = new Uint8Array(N); G.grow = new Float32Array(N); G.road = new Uint8Array(N);
  const cx = MW / 2, cy = MH / 2;
  // lagos
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const d = dist(x, y, cx, cy);
    const w = fbm(x / 13, y / 13, seed + 1);
    if (w < .3 && d > 12) G.tile[idx(x, y)] = T_WATER;
  }
  // rio de cima a baixo, com três vaus para atravessar
  let rx = MW * .74 + (R() - .5) * 6;
  const fords = [10 + (R() * 8 | 0), 32 + (R() * 8 | 0), 54 + (R() * 8 | 0)];
  for (let y = 0; y < MH; y++) {
    rx += (fbm(y / 9, 3.3, seed + 5) - .5) * 1.8;
    rx = Math.max(MW * .62, Math.min(MW - 6, rx));
    const w = 2 + (fbm(y / 6, 8.1, seed + 9) > .55 ? 1 : 0);
    for (let x = Math.round(rx - w / 2); x < Math.round(rx - w / 2) + w; x++) if (inb(x, y)) G.tile[idx(x, y)] = fords.some(f => Math.abs(f - y) <= 0) ? T_FORD : T_WATER;
  }
  // lago garantido perto do início (para pescar)
  const ang = R() * Math.PI * 2, px = Math.round(cx + Math.cos(ang) * 11), py = Math.round(cy + Math.sin(ang) * 10);
  for (let y = -4; y <= 4; y++) for (let x = -5; x <= 5; x++) if ((x * x) / 20 + (y * y) / 12 <= 1 && inb(px + x, py + y)) G.tile[idx(px + x, py + y)] = T_WATER;
  // areia nas margens
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const i = idx(x, y); if (G.tile[i] !== T_GRASS) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (inb(nx, ny) && G.tile[idx(nx, ny)] === T_WATER && hash2(x, y, seed) < .75) { G.tile[i] = T_SAND; break; } }
  }
  // mata, pedras, ferro, arbustos
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const i = idx(x, y); if (G.tile[i] !== T_GRASS) continue;
    const d = dist(x, y, cx, cy); if (d < 6) continue;
    const f = fbm(x / 11 + 50, y / 11, seed + 3);
    const edge = Math.min(x, y, MW - 1 - x, MH - 1 - y) < 3;
    const h = hash2(x, y, seed + 11);
    const rk = fbm(x / 7 + 40, y / 7 + 40, seed + 7);
    if (rk > .68 && h < .55) { const iron = fbm(x / 9 + 9, y / 9, seed + 13) > .58 && h < .3; G.obj[i] = iron ? O_IRON : O_ROCK; G.amt[i] = iron ? 20 : 24; continue; }
    let pt = edge ? .85 : f > .56 ? .82 : f > .48 ? .3 : .035;
    if (d < 10) pt *= .4;
    if (h < pt) { G.obj[i] = O_TREE; G.amt[i] = 10; G.grow[i] = 1; continue; }
    const pb = f > .42 ? .06 : .012;
    if (hash2(x, y, seed + 21) < pb) { G.obj[i] = O_BUSH; G.amt[i] = 12; }
  }
  // garante pedra, ferro e frutas por perto
  const near = (r0, r1, fn) => { for (let k = 0; k < 400; k++) { const a = R() * Math.PI * 2, r = r0 + R() * (r1 - r0); const x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r); if (inb(x, y) && G.tile[idx(x, y)] === T_GRASS && G.obj[idx(x, y)] === 0) { fn(x, y); return; } } };
  const cluster = (x, y, o, n) => { for (let k = 0; k < n; k++) { const xx = x + (R() * 5 | 0) - 2, yy = y + (R() * 5 | 0) - 2; if (inb(xx, yy) && G.tile[idx(xx, yy)] === T_GRASS && dist(xx, yy, cx, cy) > 5) { G.obj[idx(xx, yy)] = o; G.amt[idx(xx, yy)] = o === O_IRON ? 20 : 24; } } };
  near(8, 11, (x, y) => cluster(x, y, O_ROCK, 7));
  near(9, 13, (x, y) => cluster(x, y, O_ROCK, 5));
  near(12, 16, (x, y) => cluster(x, y, O_IRON, 5));
  for (let k = 0; k < 8; k++) near(6, 10, (x, y) => { G.obj[idx(x, y)] = O_BUSH; G.amt[idx(x, y)] = 12; });
}

// ---------------- caminhos (A*)
const _g = new Float32Array(N), _came = new Int32Array(N), _seen = new Uint32Array(N), _closed = new Uint32Array(N);
let _stamp = 0; let _hp = [], _hf = [];
function hpush(i, f) { _hp.push(i); _hf.push(f); let k = _hp.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (_hf[p] <= _hf[k]) break; [_hp[p], _hp[k]] = [_hp[k], _hp[p]];[_hf[p], _hf[k]] = [_hf[k], _hf[p]]; k = p; } }
function hpop() {
  const top = _hp[0], li = _hp.pop(), lf = _hf.pop();
  if (_hp.length) { _hp[0] = li; _hf[0] = lf; let k = 0; for (; ;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < _hp.length && _hf[l] < _hf[m]) m = l; if (r < _hp.length && _hf[r] < _hf[m]) m = r; if (m === k) break; [_hp[m], _hp[k]] = [_hp[k], _hp[m]];[_hf[m], _hf[k]] = [_hf[k], _hf[m]]; k = m; } }
  return top;
}
function tileCost(i) { if (G.road[i]) return .55; if (G.tile[i] === T_FORD) return 2.2; const o = G.obj[i]; if (o === O_TREE) return 1.35; if (o === O_ROCK || o === O_IRON) return 1.8; return 1; }
const DIRS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
function astar(sx, sy, tx, ty) {
  if (!inb(tx, ty) || !inb(sx, sy)) return null;
  const s = idx(sx, sy), t = idx(tx, ty);
  if (s === t) return [];
  if (!walk(t)) return null;
  _stamp++; _hp = []; _hf = [];
  _g[s] = 0; _seen[s] = _stamp; _came[s] = -1; hpush(s, 0);
  let n = 0;
  while (_hp.length) {
    const c = hpop();
    if (c === t) break;
    if (_closed[c] === _stamp) continue; _closed[c] = _stamp;
    if (++n > 9000) return null;
    const cx = c % MW, cy = (c / MW) | 0;
    for (const [dx, dy, dc] of DIRS) {
      const nx = cx + dx, ny = cy + dy; if (!inb(nx, ny)) continue;
      const ni = idx(nx, ny); if (!walk(ni)) continue;
      if (dx && dy && (!walk(idx(cx + dx, cy)) || !walk(idx(cx, cy + dy)))) continue;
      const ng = _g[c] + dc * (tileCost(ni) + tileCost(c)) * .5;
      if (_seen[ni] !== _stamp || ng < _g[ni]) {
        _seen[ni] = _stamp; _g[ni] = ng; _came[ni] = c;
        const hx = Math.abs(nx - tx), hy = Math.abs(ny - ty);
        hpush(ni, ng + (Math.max(hx, hy) + .414 * Math.min(hx, hy)) * .8);
      }
    }
  }
  if (_seen[t] !== _stamp) return null;
  const path = []; let c = t; while (c !== s && c !== -1) { path.push(c); c = _came[c]; }
  return path.reverse();
}

// ---------------- prédios
function rebuildIndex() {
  bmap = new Map(); vmap = new Map(); bg = new Int32Array(N); blk = new Uint8Array(N);
  for (const b of G.blds) { bmap.set(b.id, b); stamp(b, b.id); }
  for (const v of G.vs) vmap.set(v.id, v);
  terrainDirty = true;
}
function stamp(b, val) {
  const flat = B[b.t].flat;
  for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) { const i = idx(x, y); bg[i] = val; blk[i] = val && !flat ? 1 : 0; }
}
function doorOf(b) {
  if (B[b.t].flat) return fieldTile(b);
  const x = b.x + (b.w >> 1), y = b.y + b.h;
  if (inb(x, y) && walk(idx(x, y))) return { x, y };
  return nearTile(b);
}
function fieldTile(b) { return { x: b.x + (Math.random() * b.w | 0), y: b.y + (Math.random() * b.h | 0) }; }
function nearTile(b, fx, fy) {
  const c = [];
  for (let x = b.x - 1; x <= b.x + b.w; x++) c.push([x, b.y - 1], [x, b.y + b.h]);
  for (let y = b.y; y < b.y + b.h; y++) c.push([b.x - 1, y], [b.x + b.w, y]);
  const ok = c.filter(([x, y]) => inb(x, y) && walk(idx(x, y)));
  if (!ok.length) return { x: b.x + (b.w >> 1), y: b.y + b.h };
  let p;
  if (fx !== undefined) { ok.sort((a, b2) => dist(a[0], a[1], fx, fy) - dist(b2[0], b2[1], fx, fy)); p = ok[Math.random() * Math.min(3, ok.length) | 0]; }
  else p = ok[Math.random() * ok.length | 0];
  return { x: p[0], y: p[1] };
}
function adjTile(i, fx, fy) {
  const x = i % MW, y = (i / MW) | 0; let best = null, bd = 1e9;
  for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy; if (!inb(nx, ny) || !walk(idx(nx, ny))) continue; const d = dist(nx, ny, fx, fy) + (G.obj[idx(nx, ny)] ? .7 : 0); if (d < bd) { bd = d; best = { x: nx, y: ny }; } }
  return best || (walk(i) ? { x, y } : null);
}
function bCenter(b) { return { x: b.x + b.w / 2, y: b.y + b.h / 2 }; }
function canPlace(t, x, y) {
  const d = B[t];
  if (x < 1 || y < 1 || x + d.w > MW - 1 || y + d.h > MH - 1) return false;
  for (let yy = y; yy < y + d.h; yy++) for (let xx = x; xx < x + d.w; xx++) {
    const i = idx(xx, yy);
    if (G.tile[i] === T_WATER || G.tile[i] === T_FORD || bg[i] || G.road[i]) return false;
    if (G.obj[i] === O_ROCK || G.obj[i] === O_IRON) return false;
  }
  if (!d.flat) { const dx = x + (d.w >> 1), dy = y + d.h; if (!inb(dx, dy) || !walk(idx(dx, dy)) || bg[idx(dx, dy)]) return false; }
  // não tampar a porta de outro prédio
  for (const o of G.blds) { if (B[o.t].flat) continue; const dx = o.x + (o.w >> 1), dy = o.y + o.h; if (dx >= x && dx < x + d.w && dy >= y && dy < y + d.h) return false; }
  if (d.water) {
    let ok = false;
    for (let yy = y - 1; yy <= y + d.h && !ok; yy++) for (let xx = x - 1; xx <= x + d.w; xx++) if (inb(xx, yy) && G.tile[idx(xx, yy)] === T_WATER) { ok = true; break; }
    if (!ok) return false;
  }
  return true;
}
function placeBuilding(t, x, y, done) {
  const d = B[t];
  const b = { id: G.nextId++, t, x, y, w: d.w, h: d.h, done: false, need: { ...d.cost }, inc: {}, prog: 0, builders: 0, workers: [], maxW: 0, res: [], food: 0, wood: 0, sup: 0, plant: 0, growth: 0, harv: 0, flip: false };
  for (let yy = y; yy < y + d.h; yy++) for (let xx = x; xx < x + d.w; xx++) {
    const i = idx(xx, yy);
    if (G.obj[i]) { G.obj[i] = 0; G.amt[i] = 0; }
    G.marks.delete(i); claims.delete(i);
  }
  G.blds.push(b); bmap.set(b.id, b); stamp(b, b.id);
  if (d.flat) terrainDirty = true;
  // quem ficou preso em cima sai pela porta
  for (const v of G.vs) if (blk[idx(Math.floor(v.x), Math.floor(v.y))]) { const p = nearTile(b); v.x = p.x + .5; v.y = p.y + .5; v.path = []; }
  if (done) completeBuilding(b, true);
  return b;
}
function completeBuilding(b, silent) {
  const d = B[b.t];
  b.done = true; b.need = {}; b.inc = {};
  b.maxW = Math.min(d.jobs || 0, 2);
  if (d.flat) terrainDirty = true;
  if (!silent) { toast(`${d.n} pronta!`, '🔨'); sfx('done'); }
  assignJobs();
}
function removeBuilding(b) {
  const d = B[b.t];
  // devolve metade do que custou (ou tudo o que chegou, se ainda era obra)
  for (const k in d.cost) { const got = d.cost[k] - (b.need[k] || 0); const back = b.done ? Math.floor(d.cost[k] / 2) : got; if (back > 0) addStock(k, back); }
  if (d.home) { if (b.food) addStock('fruta', Math.floor(b.food)); if (b.wood) addStock('lenha', Math.floor(b.wood)); }
  for (const id of b.res) { const v = vget(id); if (v) { v.home = 0; } }
  for (const id of b.workers) { const v = vget(id); if (v) { v.job = 'lab'; v.work = 0; refreshLook(v); } }
  for (const v of G.vs) {
    if (v.inside === b.id) { const p = doorOf(b); v.inside = 0; v.x = p.x + .5; v.y = p.y + .5; }
    if (v.work === b.id || v.home === b.id || (v.task && v.task === b.id)) failPlan(v);
  }
  stamp(b, 0);
  G.blds = G.blds.filter(o => o !== b); bmap.delete(b.id);
  if (d.flat) terrainDirty = true;
}
function nearestStore(x, y) {
  let best = null, bd = 1e9;
  for (const b of G.blds) if (b.done && B[b.t].store) { const c = bCenter(b); const d = dist(x, y, c.x, c.y); if (d < bd) { bd = d; best = b; } }
  return best;
}
function countDone(...ts) { return G.blds.filter(b => b.done && ts.includes(b.t)).length; }
function inRadius(b, r, fn) {
  const c = bCenter(b);
  for (let y = Math.max(0, Math.floor(c.y - r)); y <= Math.min(MH - 1, Math.ceil(c.y + r)); y++)
    for (let x = Math.max(0, Math.floor(c.x - r)); x <= Math.min(MW - 1, Math.ceil(c.x + r)); x++)
      if (dist(x + .5, y + .5, c.x, c.y) <= r) fn(idx(x, y), x, y);
}
