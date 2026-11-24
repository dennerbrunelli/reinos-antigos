// ============================================================
//  Refúgio — os moradores: necessidades, trabalho, famílias
// ============================================================
'use strict';

const NOMES_H = ['João', 'Pedro', 'Antônio', 'Francisco', 'Benedito', 'Sebastião', 'Joaquim', 'Manoel', 'Tomé', 'Luís', 'Raimundo', 'Severino', 'Caetano', 'Inácio', 'Mateus', 'Davi', 'Gabriel', 'Lucas', 'Rafael', 'Miguel', 'Bento', 'Otávio', 'Elias', 'Simão', 'Vicente', 'Jonas', 'Damião', 'Cosme', 'Aurélio', 'Gaspar'];
const NOMES_M = ['Maria', 'Ana', 'Rosa', 'Luzia', 'Joana', 'Benedita', 'Teresa', 'Clara', 'Helena', 'Isabel', 'Júlia', 'Marta', 'Rita', 'Inês', 'Sofia', 'Laura', 'Cecília', 'Aurora', 'Lívia', 'Beatriz', 'Madalena', 'Francisca', 'Antônia', 'Iara', 'Celeste', 'Graça', 'Dalva', 'Glória', 'Vitória', 'Esperança'];
const SOBRENOMES = ['Silva', 'Souza', 'Ferreira', 'Costa', 'Ramos', 'Prado', 'Moura', 'Lima', 'Barros', 'Rocha', 'Pires', 'Nunes', 'Teixeira', 'Campos', 'Freitas', 'Macedo'];
const pick = a => a[Math.random() * a.length | 0];

function newPerson(male, age, sur, extra = {}) {
  const v = {
    id: G.nextId++, name: pick(male ? NOMES_H : NOMES_M), sur, male, age, x: 0, y: 0,
    job: 'lab', work: 0, home: 0, spouse: 0, mom: 0, dad: 0,
    hunger: Math.random() * 30, warm: 100, health: 100, tools: age >= ADULT ? 100 : 0, clothes: 100,
    carry: {}, inside: 0, sleep: false, act: '', dir: 0, flip: false, walkT: 0,
    look: { skin: pick(SKINS), hair: pick(HAIRS), shirt: pick(SHIRTS), pants: pick(PANTS), long: !male && Math.random() < .8, beard: male && Math.random() < .4 },
    ...extra,
  };
  v.q = []; v.path = []; v.cleanup = null;
  return v;
}
function addPerson(v) { G.vs.push(v); vmap.set(v.id, v); }
function refreshLook(v) { v.spr = null; }
function sprOf(v) {
  if (!v.spr) v.spr = personSprites({ ...v.look, male: v.male, kid: v.age < ADULT, old: v.age >= ELDER, hat: v.age >= ADULT ? JOBS[v.job].hat : null });
  return v.spr;
}
function fullName(v) { return `${v.name} ${v.sur}`; }

function spawnFamilies(cx, cy) {
  const used = new Set();
  for (let f = 0; f < 5; f++) {
    let sur; do sur = pick(SOBRENOMES); while (used.has(sur)); used.add(sur);
    const a = newPerson(true, 20 + Math.random() * 16, sur), b = newPerson(false, 19 + Math.random() * 15, sur);
    a.spouse = b.id; b.spouse = a.id; addPerson(a); addPerson(b);
    const kids = f < 4 ? 1 : 0;
    for (let k = 0; k < kids; k++) { const c = newPerson(Math.random() < .5, 3 + Math.random() * 5, sur, { mom: b.id, dad: a.id }); addPerson(c); }
  }
  for (const v of G.vs) { v.x = cx + (Math.random() - .5) * 6 + .5; v.y = cy + 2 + Math.random() * 3 + .5; if (!walk(idx(Math.floor(v.x), Math.floor(v.y)))) { v.x = cx + .5; v.y = cy + 3.5; } }
}

// ---------------- plano de ações
const go = p => ({ a: 'go', x: p.x, y: p.y });
const wait = (m, anim) => ({ a: 'wait', m, anim });
const fn = f => ({ a: 'fn', f });
function plan(v, acts, cleanup, act) {
  v.q = acts.concat([fn(v => { v.cleanup = null; })]);
  v.cleanup = cleanup || null; v.act = act || '';
}
function failPlan(v) {
  v.q = []; v.path = []; v.anim = null;
  if (v.cleanup) { const c = v.cleanup; v.cleanup = null; c(v); }
}
function eff(v) { return (v.tools > 0 ? 1 : .55) * (v.age >= ELDER ? .7 : 1) * (v.health < 40 ? .7 : 1); }
function wear(v, n = 3) { if (v.tools > 0) v.tools = Math.max(0, v.tools - n); }
function hasCarry(v) { for (const k in v.carry) if (v.carry[k] > 0) return true; return false; }
function enter(b) { return fn(v => { if (!bget(b.id)) return false; v.inside = b.id; }); }
const leave = fn(v => { if (v.inside) { v.inside = 0; v.sleep = false; } });

function runV(v, dt) {
  let guard = 0;
  while (dt > 0 && guard++ < 10) {
    if (!v.q.length) { think(v); if (!v.q.length) return; }
    const A = v.q[0];
    if (A.a === 'fn') { v.q.shift(); if (A.f(v) === false) failPlan(v); continue; }
    if (A.a === 'go') {
      if (!A.started) {
        A.started = true;
        if (v.inside) { const b = bget(v.inside); if (b) { const p = doorOf(b); v.x = p.x + .5; v.y = p.y + .5; } v.inside = 0; v.sleep = false; }
        const p = astar(Math.floor(v.x), Math.floor(v.y), A.x, A.y);
        if (!p) { failPlan(v); v.q = [wait(20)]; return; }
        v.path = p;
      }
      dt = moveV(v, dt);
      if (!v.path.length) v.q.shift(); else return;
      continue;
    }
    if (A.a === 'wait') {
      const u = Math.min(dt, A.m); A.m -= u; dt -= u; v.anim = A.anim || null;
      if (A.m <= 0) { v.q.shift(); v.anim = null; } else return;
    }
  }
}
function moveV(v, dt) {
  const base = 6 / 60 * (v.age < ADULT ? .85 : v.age >= ELDER ? .75 : 1) * (v.health < 30 ? .7 : 1);
  while (dt > 0 && v.path.length) {
    const ni = v.path[0];
    if (!walk(ni)) { // caminho bloqueado por obra nova: recalcula
      const last = v.path[v.path.length - 1];
      const p = astar(Math.floor(v.x), Math.floor(v.y), last % MW, (last / MW) | 0);
      if (!p) { v.path = []; failPlan(v); return 0; }
      v.path = p; if (!p.length) return dt; continue;
    }
    const tx = ni % MW + .5, ty = ((ni / MW) | 0) + .5;
    const dx = tx - v.x, dy = ty - v.y, d = Math.hypot(dx, dy);
    const sp = base / tileCost(idx(Math.floor(v.x), Math.floor(v.y)));
    const step = sp * dt;
    if (Math.abs(dx) > Math.abs(dy)) { v.dir = 2; v.flip = dx < 0; } else v.dir = dy < 0 ? 1 : 0;
    v.walkT += dt;
    if (step >= d) { v.x = tx; v.y = ty; v.path.shift(); dt -= d / sp; }
    else { v.x += dx / d * step; v.y += dy / d * step; dt = 0; }
  }
  return dt;
}

// ---------------- o que fazer agora?
function think(v) {
  v.anim = null; v.act = '';
  if (hasCarry(v)) return planDeposit(v);
  const H = hour(), night = H >= 21 || H < 5.5, cold = temp() < 10;
  const home = v.home ? bget(v.home) : null;
  if (v.hunger >= 50 && planEat(v, home)) return;
  if (cold && v.warm < 45 && home) { if (home.wood > 0) return planWarm(v, home); if (v.age >= ADULT && G.stock.lenha >= 1 && !home.sup) return planSupply(v, home); if (v.warm < 25) return planWarm(v, home); }
  if (night) { if (home) return planSleep(v, home); return planIdle(v, null, 'Sem casa... dorme ao relento'); }
  if (v.age < ADULT) return planIdle(v, home, 'Brincando');
  if (v.tools <= 0 && G.stock.ferramenta >= 1) return planFetch(v, 'ferramenta');
  if (v.clothes <= 0 && G.stock.roupa >= 1) return planFetch(v, 'roupa');
  if (home && !home.sup && ((home.food < 8 && foodTotal() >= 4) || (home.wood < 8 && G.stock.lenha >= 3 && (season() >= 2 || cold)))) return planSupply(v, home);
  const w = v.work ? bget(v.work) : null;
  if (w && w.done && JOBF[v.job] && JOBF[v.job](v, w)) return;
  if (jobLab(v)) return;
  planIdle(v, home, 'À toa');
}
function planDeposit(v) {
  const s = nearestStore(v.x, v.y);
  const dep = fn(v => { for (const k in v.carry) addStock(k, v.carry[k]); v.carry = {}; });
  if (!s) return plan(v, [dep, wait(10)], null, 'Guardando');
  plan(v, [go(doorOf(s)), wait(8), dep], null, 'Levando ao depósito');
}
function planEat(v, home) {
  if (home && home.food >= 1) {
    plan(v, [go(doorOf(home)), enter(home), wait(30), fn(v => { const n = Math.min(2, Math.floor(home.food)); if (!n) return false; home.food -= n; v.hunger = Math.max(0, v.hunger - 50 * n); })], null, 'Comendo em casa');
    return true;
  }
  if (foodTotal() < 1) return false;
  const s = nearestStore(v.x, v.y); if (!s) return false;
  plan(v, [go(doorOf(s)), wait(20), fn(v => { const n = takeFood(2); if (!n) return false; v.hunger = Math.max(0, v.hunger - 50 * n); })], null, 'Comendo no depósito');
  return true;
}
function planWarm(v, home) { plan(v, [go(doorOf(home)), enter(home), wait(150)], null, 'Se esquentando no fogo'); }
function planSleep(v, home) {
  const m = ((6 * 60 - (G.t % 1440)) + 1440) % 1440;
  plan(v, [go(doorOf(home)), enter(home), fn(v => { v.sleep = true; }), wait(Math.max(30, m))], null, 'Dormindo');
}
function planIdle(v, home, act) {
  const base = home ? doorOf(home) : (() => { const s = nearestStore(v.x, v.y); return s ? doorOf(s) : { x: Math.floor(v.x), y: Math.floor(v.y) }; })();
  let p = null;
  for (let k = 0; k < 8 && !p; k++) { const x = base.x + (Math.random() * 7 | 0) - 3, y = base.y + (Math.random() * 7 | 0) - 3; if (inb(x, y) && walk(idx(x, y))) p = { x, y }; }
  plan(v, p ? [go(p), wait(30 + Math.random() * 40)] : [wait(40)], null, act);
}
function planFetch(v, k) {
  const s = nearestStore(v.x, v.y); if (!s) return planIdle(v, null, '');
  plan(v, [go(doorOf(s)), wait(10), fn(v => { if (take(k, 1) < 1) return false; if (k === 'ferramenta') v.tools = 100; else v.clothes = 100; })], null, k === 'ferramenta' ? 'Pegando ferramenta nova' : 'Pegando roupa de frio');
}
function planSupply(v, home) {
  const s = nearestStore(v.x, v.y); if (!s) return planIdle(v, home, '');
  home.sup = v.id; const got = { food: 0, wood: 0 };
  plan(v, [go(doorOf(s)), wait(12), fn(v => {
    got.food = takeFood(Math.max(0, Math.min(16, 24 - Math.floor(home.food))));
    if (season() >= 2 || temp() < 10 || home.wood < 4) got.wood = take('lenha', Math.max(0, 20 - Math.floor(home.wood)));
    if (!got.food && !got.wood) return false;
    v.carry = {}; v.sack = true;
  }), go(doorOf(home)), wait(8), fn(v => { if (!bget(home.id)) return false; home.food += got.food; home.wood += got.wood; got.food = got.wood = 0; home.sup = 0; v.sack = false; })],
    v => { home.sup = 0; v.sack = false; if (got.food) addStock('fruta', got.food); if (got.wood) addStock('lenha', got.wood); }, 'Levando comida e lenha para casa');
}

// ---------------- trabalhador (constrói e recolhe o que foi marcado)
function jobLab(v) {
  // 1) levar material para obras
  let best = null, bd = 1e9, mat = null;
  const res = reserve();
  for (const b of G.blds) {
    if (b.done) continue;
    for (const k in b.need) { const rem = b.need[k] - (b.inc[k] || 0); if (rem > 0 && G.stock[k] - (res[k] || 0) >= 1) { const c = bCenter(b); const d = dist(v.x, v.y, c.x, c.y); if (d < bd) { bd = d; best = b; mat = k; } } }
  }
  if (best) {
    const b = best, k = mat, s = nearestStore(v.x, v.y);
    if (s) {
      const n = Math.min(10, b.need[k] - (b.inc[k] || 0), Math.floor(G.stock[k] - (res[k] || 0)));
      b.inc[k] = (b.inc[k] || 0) + n;
      plan(v, [go(doorOf(s)), wait(8), fn(v => { const got = take(k, n); if (!got) return false; v.carry = { [k]: got }; }),
      go(nearTile(b, v.x, v.y)), wait(8), fn(v => { if (!bget(b.id) || b.done) return false; const got = v.carry[k] || 0; b.inc[k] -= n; b.need[k] = Math.max(0, b.need[k] - got); if (b.need[k] <= 0) delete b.need[k]; v.carry = {}; })],
        () => { if (bget(b.id)) b.inc[k] = Math.max(0, (b.inc[k] || 0) - n); }, `Levando ${RES[k].n.toLowerCase()} para a obra`);
      return true;
    }
  }
  // 2) trabalhar nas obras que já têm todo o material
  best = null; bd = 1e9;
  for (const b of G.blds) {
    if (b.done || Object.keys(b.need).length || b.builders >= 4) continue;
    const c = bCenter(b); const d = dist(v.x, v.y, c.x, c.y); if (d < bd) { bd = d; best = b; }
  }
  if (best) {
    const b = best; b.builders++;
    plan(v, [go(nearTile(b, v.x, v.y)), wait(60 / eff(v), 'build'), fn(v => {
      if (!bget(b.id) || b.done) return false;
      b.builders--; b.prog += 1; wear(v, 2);
      if (b.prog >= B[b.t].work) completeBuilding(b);
    })], () => { b.builders = Math.max(0, b.builders - 1); }, `Construindo: ${B[b.t].n}`);
    return true;
  }
  // 3) recolher recursos marcados
  if (G.marks.size) {
    let bi = -1; bd = 1e9;
    const ok = { tora: roomFor('tora', 10), pedra: roomFor('pedra', 6), ferro: roomFor('ferro', 5), fruta: roomFor('fruta', 10) };
    for (const i of G.marks) { if (claims.has(i)) continue; const o = G.obj[i]; if (!ok[o === O_TREE ? 'tora' : o === O_ROCK ? 'pedra' : o === O_IRON ? 'ferro' : 'fruta']) continue; const d = dist(v.x, v.y, i % MW, (i / MW) | 0); if (d < bd) { bd = d; bi = i; } }
    if (bi >= 0) return planGather(v, bi, true);
  }
  return false;
}
// toras guardadas para o lenhador quando a lenha está baixa (senão as obras levam tudo)
function reserve() {
  const r = {};
  const wc = G.blds.some(b => b.done && b.t === 'lenhador' && b.workers.length);
  const houses = G.blds.filter(b => b.done && B[b.t].home).length;
  if (wc && G.stock.lenha < Math.max(30, houses * 20)) r.tora = 9;
  return r;
}
function planGather(v, i, lab) {
  const o = G.obj[i]; const p = adjTile(i, v.x, v.y); if (!p || !o) { G.marks.delete(i); return false; }
  claims.set(i, v.id);
  const t = o === O_TREE ? 100 : o === O_BUSH ? 40 : 130;
  const act = o === O_TREE ? 'Cortando árvore' : o === O_BUSH ? 'Arrancando arbusto' : o === O_IRON ? 'Quebrando minério de ferro' : 'Quebrando pedra';
  plan(v, [go(p), fn(v => { faceTo(v, i); }), wait(t / eff(v), o === O_TREE ? 'chop' : 'mine'), fn(v => {
    claims.delete(i);
    if (G.obj[i] !== o) return false;
    wear(v, 3);
    if (o === O_TREE) { v.carry = { tora: G.amt[i] || 10 }; clearObj(i); }
    else if (o === O_BUSH) { if (G.amt[i]) v.carry = { fruta: G.amt[i] }; clearObj(i); }
    else { const k = o === O_IRON ? 'ferro' : 'pedra', n = Math.min(o === O_IRON ? 5 : 6, G.amt[i]); G.amt[i] -= n; v.carry = { [k]: n }; if (G.amt[i] <= 0) clearObj(i); }
  })], () => claims.delete(i), act);
  return true;
}
function clearObj(i) { G.obj[i] = 0; G.amt[i] = 0; G.grow[i] = 0; G.marks.delete(i); claims.delete(i); }
function faceTo(v, i) { const dx = i % MW + .5 - v.x, dy = ((i / MW) | 0) + .5 - v.y; if (Math.abs(dx) > Math.abs(dy)) { v.dir = 2; v.flip = dx < 0; } else v.dir = dy < 0 ? 1 : 0; }

// ---------------- profissões
function findNear(b, r, test, fx, fy) {
  const cand = []; inRadius(b, r, (i, x, y) => { if (!claims.has(i) && test(i)) cand.push(i); });
  if (!cand.length) return -1;
  const c = fx === undefined ? bCenter(b) : { x: fx, y: fy };
  cand.sort((a, b2) => dist(a % MW, (a / MW) | 0, c.x, c.y) - dist(b2 % MW, (b2 / MW) | 0, c.x, c.y));
  return cand[Math.random() * Math.min(4, cand.length) | 0];
}
const JOBF = {
  coletor(v, b) {
    if (season() === 3 || !roomFor('fruta', 8)) return false;
    let i = findNear(b, B.coletor.radius, i => G.obj[i] === O_BUSH && G.amt[i] > 0);
    let bush = i >= 0;
    if (!bush) i = findNear(b, B.coletor.radius, i => G.obj[i] === O_TREE && !G.marks.has(i));
    if (i < 0) return false;
    const p = adjTile(i, v.x, v.y); if (!p) return false;
    claims.set(i, v.id);
    plan(v, [go(p), fn(v => faceTo(v, i)), wait((bush ? 110 : 150) / eff(v), 'pick'), fn(v => {
      claims.delete(i); wear(v, 2);
      if (bush) { if (G.obj[i] !== O_BUSH) return false; const n = Math.min(8, G.amt[i]); G.amt[i] -= n; if (n) v.carry = { fruta: n }; }
      else v.carry = { fruta: 4 };
    })], () => claims.delete(i), bush ? 'Colhendo frutas' : 'Catando ervas e cogumelos');
    return true;
  },
  cacador(v, b) {
    if (!roomFor('carne', 15)) return false;
    const c = bCenter(b); let d = null, bd = 1e9;
    for (const a of G.deer) { if (a.hunted) continue; const dd = dist(a.x, a.y, c.x, c.y); if (dd < B.cacador.radius && dd < bd) { bd = dd; d = a; } }
    if (!d) { plan(v, [go(nearTile(b)), wait(90)], null, 'Esperando a caça aparecer'); return true; }
    d.hunted = v.id;
    const p = { x: Math.floor(d.x), y: Math.floor(d.y) };
    if (!walk(idx(p.x, p.y))) { d.hunted = 0; return false; }
    plan(v, [go(p), wait(50 / eff(v), 'hunt'), fn(v => {
      d.hunted = 0; wear(v, 3);
      if (G.deer.includes(d) && dist(d.x, d.y, v.x, v.y) < 4 && Math.random() < .85) { G.deer = G.deer.filter(a => a !== d); v.carry = { carne: 12, couro: 3 }; sfx('hunt'); }
    })], () => { d.hunted = 0; }, 'Caçando');
    return true;
  },
  pescador(v, b) {
    if (!roomFor('peixe', 6)) return false;
    if (!b.spots || !b.spots.length) {
      b.spots = [];
      inRadius(b, 4.5, (i, x, y) => { if (!walk(i)) return; for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy; if (inb(nx, ny) && G.tile[idx(nx, ny)] === T_WATER) { b.spots.push(i); break; } } });
      if (!b.spots.length) return false;
    }
    const i = pick(b.spots);
    if (!walk(i)) { b.spots = null; return false; }
    plan(v, [go({ x: i % MW, y: (i / MW) | 0 }), fn(v => { const x = i % MW, y = (i / MW) | 0; for (const [dx, dy] of DIRS) if (inb(x + dx, y + dy) && G.tile[idx(x + dx, y + dy)] === T_WATER) { faceTo(v, idx(x + dx, y + dy)); break; } }),
    wait(200 / eff(v), 'fish'), fn(v => { wear(v, 2); v.carry = { peixe: season() === 3 ? 2 : 5 }; })], null, season() === 3 ? 'Pescando no gelo' : 'Pescando');
    return true;
  },
  fazendeiro(v, b) {
    const s = season(); if (s === 3) return false;
    const n = b.w * b.h;
    const tile = () => fieldTile(b);
    if (b.growth >= 1 && b.harv < b.plant - 1e-6) {
      plan(v, [go(tile()), wait(55 / eff(v), 'farm'), fn(v => { b.harv = Math.min(b.plant, b.harv + 1 / n); v.carry = { trigo: 12 }; wear(v, 1); }),
      fn(v => { if (b.harv < b.plant - 1e-6) { b.harv = Math.min(b.plant, b.harv + 1 / n); v.carry.trigo += 12; } })], null, 'Colhendo trigo');
      return true;
    }
    if (s <= 1 && b.plant < 1 - 1e-6 && b.growth < .25) {
      plan(v, [go(tile()), wait(45 / eff(v), 'farm'), fn(v => { b.plant = Math.min(1, b.plant + 1 / n); wear(v, 1); })], null, 'Plantando trigo');
      return true;
    }
    if (b.plant > 0 && b.growth < 1) {
      plan(v, [go(tile()), wait(60 / eff(v), 'farm'), fn(v => { b.growth = Math.min(1, b.growth + .004); })], null, 'Cuidando da plantação');
      return true;
    }
    return false;
  },
  silvicultor(v, b) {
    b.flip = !b.flip;
    const r = B.silvicultor.radius;
    const cut = () => {
      if (!roomFor('tora', 10)) return false;
      const i = findNear(b, r, i => G.obj[i] === O_TREE && !G.marks.has(i)); if (i < 0) return false;
      const p = adjTile(i, v.x, v.y); if (!p) return false;
      claims.set(i, v.id);
      plan(v, [go(p), fn(v => faceTo(v, i)), wait(110 / eff(v), 'chop'), fn(v => { claims.delete(i); if (G.obj[i] !== O_TREE) return false; wear(v, 3); v.carry = { tora: G.amt[i] || 10 }; clearObj(i); })], () => claims.delete(i), 'Cortando árvore');
      return true;
    };
    const plant = () => {
      const i = findNear(b, r, i => G.tile[i] === T_GRASS && !G.obj[i] && !bg[i] && !G.road[i]); if (i < 0) return false;
      claims.set(i, v.id);
      plan(v, [go({ x: i % MW, y: (i / MW) | 0 }), wait(40 / eff(v), 'farm'), fn(v => { claims.delete(i); if (G.obj[i] || bg[i] || G.road[i]) return false; G.obj[i] = O_SAPLING; G.grow[i] = 0; wear(v, 1); })], () => claims.delete(i), 'Plantando muda');
      return true;
    };
    return b.flip ? (cut() || plant()) : (plant() || cut());
  },
  lenhador(v, b) {
    if (craft(v, b, CRAFT.lenhador)) return true;
    // sem toras no depósito: corta uma árvore perto da cabana e racha ali mesmo
    if (G.stock.tora >= 3 || !roomFor('lenha', 30)) return false;
    const i = findNear(b, 8, i => G.obj[i] === O_TREE); if (i < 0) return false;
    const p = adjTile(i, v.x, v.y); if (!p) return false;
    claims.set(i, v.id);
    plan(v, [go(p), fn(v => faceTo(v, i)), wait(100 / eff(v), 'chop'), fn(v => { claims.delete(i); if (G.obj[i] !== O_TREE) return false; v.carry = { tora: G.amt[i] || 10 }; clearObj(i); wear(v, 3); }),
    go(nearTile(b, v.x, v.y)), wait(CRAFT.lenhador.t * 2 / eff(v), 'work'), fn(v => { const n = v.carry.tora || 0; v.carry = { lenha: n * 3 }; })], () => claims.delete(i), 'Cortando árvore para lenha');
    return true;
  },
  ferreiro: (v, b) => craft(v, b, CRAFT.ferreiro),
  alfaiate: (v, b) => craft(v, b, CRAFT.alfaiate),
  pedreiro: (v, b) => craft(v, b, CRAFT.pedreiro),
  mineiro: (v, b) => craft(v, b, CRAFT.mineiro),
};
function craft(v, b, R) {
  for (const k in R.out) if (!roomFor(k, R.out[k] + 2)) return false;
  for (const k in R.in) if (G.stock[k] < R.in[k]) return false;
  const acts = [];
  if (Object.keys(R.in).length) {
    const s = nearestStore(v.x, v.y); if (!s) return false;
    acts.push(go(doorOf(s)), wait(8), fn(v => {
      for (const k in R.in) if (G.stock[k] < R.in[k]) return false;
      for (const k in R.in) take(k, R.in[k]);
      v.carry = { ...R.in };
    }));
  }
  acts.push(go(nearTile(b, v.x, v.y)), wait(R.t / eff(v), 'work'), fn(v => { if (!bget(b.id)) return false; v.carry = { ...R.out }; wear(v, 3); b.busy = G.t; }));
  plan(v, acts, null, R.a);
  return true;
}

// ---------------- distribui empregos (sempre sobram 2 trabalhadores para construir)
function assignJobs() {
  const adults = G.vs.filter(v => v.age >= ADULT);
  for (const b of G.blds) {
    if (!b.done || !B[b.t].jobs) continue;
    b.workers = b.workers.filter(id => { const v = vget(id); return v && v.work === b.id; });
    while (b.workers.length > b.maxW) { const v = vget(b.workers.pop()); if (v) { v.job = 'lab'; v.work = 0; refreshLook(v); if (!hasCarry(v)) failPlan(v); } }
  }
  // um por vez, sempre para quem tem menos gente
  for (; ;) {
    const want = G.blds.filter(b => b.done && B[b.t].jobs && b.workers.length < b.maxW);
    if (!want.length) return;
    const labs = adults.filter(v => v.job === 'lab' && vmap.has(v.id));
    if (labs.length <= 2) return;
    want.sort((a, o) => a.workers.length / a.maxW - o.workers.length / o.maxW);
    const b = want[0], c = bCenter(b);
    labs.sort((a, o) => dist(a.x, a.y, c.x, c.y) - dist(o.x, o.y, c.x, c.y));
    const v = labs[0]; v.job = B[b.t].job; v.work = b.id; b.workers.push(v.id); refreshLook(v);
  }
}

// ---------------- vida e morte
function die(v, cause) {
  const msg = { fome: 'morreu de fome', frio: 'morreu de frio', velhice: 'faleceu de velhice' }[cause] || 'faleceu';
  toast(`${fullName(v)} ${msg} (${Math.floor(v.age)} anos).`, '🕯️', true);
  G.deaths++;
  failPlan(v);
  for (const k in v.carry) addStock(k, v.carry[k]);
  const h = v.home ? bget(v.home) : null; if (h) h.res = h.res.filter(id => id !== v.id);
  const w = v.work ? bget(v.work) : null; if (w) w.workers = w.workers.filter(id => id !== v.id);
  const s = v.spouse ? vget(v.spouse) : null; if (s) s.spouse = 0;
  for (const [i, id] of claims) if (id === v.id) claims.delete(i);
  for (const d of G.deer) if (d.hunted === v.id) d.hunted = 0;
  for (const b of G.blds) if (b.sup === v.id) b.sup = 0;
  G.vs = G.vs.filter(o => o !== v); vmap.delete(v.id);
  if (G.follow === v.id) G.follow = 0;
  if (sel && sel.v === v) sel = null;
  if (!G.vs.length) gameOver();
}

function hourTick() {
  const T = temp(), cold = T < 10, H = Math.floor(hour());
  for (const v of G.vs.slice()) {
    const kid = v.age < ADULT;
    v.hunger += v.sleep ? 1.3 : kid ? 2.2 : 2.6;
    const home = v.inside ? bget(v.inside) : null;
    if (cold) {
      if (home && B[home.t].home && home.wood > 0) v.warm = Math.min(100, v.warm + 30);
      else if (home) v.warm = Math.max(0, v.warm - (10 - T) * .12);
      else { v.warm -= (10 - T) * .55 * (v.clothes > 0 ? .45 : 1); if (v.clothes > 0) v.clothes = Math.max(0, v.clothes - .6); }
    } else { v.warm = Math.min(100, v.warm + 15); if (v.clothes > 0) v.clothes = Math.max(0, v.clothes - .04); }
    let cause = null;
    if (v.hunger >= 100) { v.hunger = 100; v.health -= 2.5; cause = 'fome'; }
    if (v.warm <= 0) { v.warm = 0; v.health -= home ? 1.5 : 3.5; cause = 'frio'; }
    if (!cause && v.hunger < 85 && v.warm > 25) v.health = Math.min(100, v.health + 1.5);
    if (v.health <= 0) die(v, cause);
  }
  // casas queimam lenha no frio
  for (const b of G.blds) {
    const d = B[b.t];
    if (d.home && b.done && cold && b.res.length && b.wood > 0) b.wood = Math.max(0, b.wood - d.burn);
    if (d.flat && b.done && season() < 3 && b.plant > 0 && b.growth < 1) b.growth = Math.min(1, b.growth + 1 / (13 * 24));
  }
  if (H === 2) births();
  assignJobs();
  checkStory();
  if (H === 8 && season() >= 2) { const hs = G.blds.filter(b => b.done && B[b.t].home); const tot = G.stock.lenha + hs.reduce((a, b) => a + b.wood, 0); if (hs.length && tot < hs.length * (season() === 3 ? 10 : 30)) { const wc = G.blds.filter(b => b.done && b.t === 'lenhador'); toast(!wc.length ? 'Pouca lenha! Construa um lenhador antes do inverno.' : G.stock.tora < 10 ? 'Pouca lenha! Marque árvores para ter toras.' : 'Pouca lenha! Ponha mais gente no lenhador (toque nele e use +).', '🔥', true); } }
  if (H === 12 && G.vs.length && foodTotal() < G.vs.length * 3 && !G.vs.every(v => v.home && bget(v.home).food > 4)) toast('A comida está acabando!', '⚠️', true);
}

function births() {
  for (const h of G.blds) {
    if (!h.done || !B[h.t].home || h.res.length >= 6) continue;
    const f = h.res.map(vget).find(v => v && !v.male && v.age >= 16 && v.age <= 42 && v.spouse && h.res.includes(v.spouse));
    if (!f) continue;
    const m = vget(f.spouse); if (!m || m.age < 16) continue;
    if (h.food <= 0 && foodTotal() < 10) continue;
    if (Math.random() < .07) {
      const b = newPerson(Math.random() < .5, 0, m.sur, { mom: f.id, dad: m.id, home: h.id, inside: h.id });
      const p = doorOf(h); b.x = p.x + .5; b.y = p.y + .5;
      addPerson(b); h.res.push(b.id); G.births++;
      toast(`Nasceu ${b.name}, ${b.male ? 'filho' : 'filha'} de ${f.name} e ${m.name}!`, '👶');
      sfx('birth');
    }
  }
}

function dayTick() {
  const s = season(), d = dayInSeason();
  for (const v of G.vs.slice()) {
    const wasKid = v.age < ADULT, wasOld = v.age >= ELDER;
    v.age += 1 / DAYS_PER_YEAR;
    if (wasKid && v.age >= ADULT) { v.job = 'lab'; v.tools = G.stock.ferramenta >= 1 ? (take('ferramenta', 1), 100) : 0; refreshLook(v); toast(`${v.name} cresceu e começa a trabalhar.`, '🧑'); }
    if (!wasOld && v.age >= ELDER) refreshLook(v);
    if (v.age > 58 && Math.random() < (v.age - 58) * .0016) { die(v, 'velhice'); }
  }
  // mudas viram árvores
  if (s < 3) for (let i = 0; i < N; i++) if (G.obj[i] === O_SAPLING) { G.grow[i] += 1 / 18; if (G.grow[i] >= 1) { G.obj[i] = O_TREE; G.amt[i] = 10; G.grow[i] = 1; } }
  if (d === 1) seasonStart(s);
  if (s === 1 && d === 3) for (let i = 0; i < N; i++) if (G.obj[i] === O_BUSH) G.amt[i] = Math.min(16, G.amt[i] + 6);
  housing();
  deerDay(s, d);
  saveGame();
}
function seasonStart(s) {
  if (s === 0) {
    for (let i = 0; i < N; i++) if (G.obj[i] === O_BUSH) G.amt[i] = 12;
    if (G.t > 1440) toast('A primavera chegou! Hora de plantar.', '🌸');
    if (running && year() >= 2 && G.vs.length >= 6 && Math.random() < .45) nomads();
  }
  if (s === 1) toast('Verão: dias longos para trabalhar.', '☀️');
  if (s === 2) toast('Outono: o inverno se aproxima. Junte lenha e comida!', '🍂');
  if (s === 3) {
    G.harsh = Math.random() < .25;
    toast(G.harsh ? 'Inverno rigoroso! O frio vai ser cruel este ano.' : 'O inverno chegou.', '❄️', G.harsh);
    for (const b of G.blds) if (B[b.t].flat && b.done) {
      const lost = b.plant - b.harv; if (lost > .05 && b.growth > .1) toast(`A geada estragou parte da plantação.`, '🥶', true);
      b.plant = 0; b.growth = 0; b.harv = 0;
    }
  } else G.harsh = false;
}

// famílias se mudam para casas vazias; jovens saem da casa dos pais e se casam
function housing() {
  const homes = G.blds.filter(b => b.done && B[b.t].home);
  for (const h of homes) h.res = h.res.filter(id => vmap.has(id) && vget(id).home === h.id);
  const moveTo = (v, h) => { const o = v.home ? bget(v.home) : null; if (o) o.res = o.res.filter(id => id !== v.id); v.home = h.id; h.res.push(v.id); };
  for (const h of homes) {
    if (h.res.length) continue;
    let cand = G.vs.find(v => !v.home && v.age >= ADULT && v.spouse);
    if (!cand) cand = G.vs.find(v => !v.home && v.age >= ADULT);
    if (!cand) cand = G.vs.find(v => v.age >= ADULT + 4 && !v.spouse && v.home && bget(v.home) && bget(v.home).res.length >= 3);
    if (!cand) continue;
    const group = [cand];
    if (cand.spouse) { const s = vget(cand.spouse); if (s && (!s.home || s.home === cand.home)) group.push(s); }
    else {
      const mate = G.vs.find(o => o !== cand && o.age >= ADULT + 4 && !o.spouse && o.male !== cand.male && Math.abs(o.age - cand.age) < 16 && !(o.mom && o.mom === cand.mom) && !(o.dad && o.dad === cand.dad) && o.id !== cand.mom && o.id !== cand.dad && cand.id !== o.mom && cand.id !== o.dad);
      if (mate) { cand.spouse = mate.id; mate.spouse = cand.id; group.push(mate); if (cand.male) mate.sur = cand.sur; else cand.sur = mate.sur; toast(`${cand.name} e ${mate.name} se casaram e ganharam casa própria.`, '💍'); }
    }
    for (const g of group.slice()) for (const k of G.vs) if (k.age < ADULT && (k.mom === g.id || k.dad === g.id) && !group.includes(k) && (!k.home || k.home === g.home)) group.push(k);
    for (const g of group) moveTo(g, h);
  }
  // crianças sem casa vão para a casa dos pais (ou qualquer casa com espaço)
  for (const k of G.vs) if (k.age < ADULT && !k.home) {
    const p = vget(k.mom) || vget(k.dad);
    let h = p && p.home ? bget(p.home) : null;
    if (!h || h.res.length >= 6) h = homes.find(o => o.res.length && o.res.length < 6);
    if (h) moveTo(k, h);
  }
}

// ---------------- cervos
function spawnDeer(n) {
  for (let k = 0; k < n; k++) for (let t = 0; t < 60; t++) {
    const x = 2 + Math.random() * (MW - 4) | 0, y = 2 + Math.random() * (MH - 4) | 0, i = idx(x, y);
    if (walk(i) && G.obj[i] === O_TREE && dist(x, y, MW / 2, MH / 2) > 9) { G.deer.push({ x: x + .5, y: y + .5, tx: x + .5, ty: y + .5, wait: Math.random() * 120, hunted: 0, fr: 0 }); break; }
  }
}
function deerDay(s, d) { if (s === 0 && d === 2) { const n = Math.min(45 - G.deer.length, Math.ceil(G.deer.length * .35) + 2); if (n > 0) spawnDeer(n); } }
function updateDeer(dt) {
  for (const a of G.deer) {
    if (a.wait > 0) { a.wait -= dt; continue; }
    const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy);
    const sp = 2.5 / 60 * dt;
    if (d <= sp) {
      a.x = a.tx; a.y = a.ty; a.wait = 30 + Math.random() * 180;
      for (let t = 0; t < 10; t++) {
        const nx = Math.floor(a.x + (Math.random() - .5) * 10), ny = Math.floor(a.y + (Math.random() - .5) * 10);
        if (inb(nx, ny) && walk(idx(nx, ny)) && (G.obj[idx(nx, ny)] === O_TREE || Math.random() < .3)) { a.tx = nx + .5; a.ty = ny + .5; break; }
      }
    } else {
      a.x += dx / d * sp; a.y += dy / d * sp; a.flip = dx < 0; a.fr += dt;
      if (!walk(idx(Math.floor(a.x), Math.floor(a.y)))) { a.x -= dx / d * sp; a.y -= dy / d * sp; a.tx = a.x; a.ty = a.y; }
    }
    // foge de gente perto (menos do caçador que já está na espreita)
  }
}

// ---------------- viajantes
function nomads() {
  const n = 3 + (Math.random() * 4 | 0);
  G.ask = { n };
  showDlg(`<h2>🎒 Viajantes na estrada</h2><p>Um grupo de <b>${n} viajantes</b> chegou pelo caminho da serra. Também foram expulsos de suas terras e pedem para morar no vale.</p><p>Mais gente trabalha mais — mas também come mais e precisa de casa antes do inverno.</p>`,
    [['Aceitar', () => acceptNomads(n)], ['Recusar', () => { toast('Os viajantes seguiram viagem.', '🎒'); }]]);
}
function acceptNomads(n) {
  let ex = 1, ey = 1;
  for (let t = 0; t < 200; t++) { const side = Math.random() * 4 | 0, r = 2 + Math.random() * (MW - 4) | 0; [ex, ey] = side === 0 ? [r, 1] : side === 1 ? [r, MH - 2] : side === 2 ? [1, r] : [MW - 2, r]; if (walk(idx(ex, ey))) break; }
  const sur = pick(SOBRENOMES);
  let last = null;
  for (let k = 0; k < n; k++) {
    const v = newPerson(Math.random() < .5, k < 2 ? 18 + Math.random() * 20 : 4 + Math.random() * 40, k < 2 ? sur : pick(SOBRENOMES));
    v.x = ex + .5; v.y = ey + .5; v.hunger = 40; v.tools = 0; v.clothes = 30;
    if (k === 1 && last && last.male !== v.male && v.age >= ADULT) { v.spouse = last.id; last.spouse = v.id; }
    if (k >= 2 && v.age < ADULT && last) { const m = G.vs.find(o => o.id === last.id); if (m) { v.mom = m.male ? 0 : m.id; v.dad = m.male ? m.id : 0; v.sur = m.sur; } }
    addPerson(v); if (k < 2) last = v;
  }
  toast(`${n} viajantes se juntaram ao vale.`, '🎒');
  G.nomadsJoined = (G.nomadsJoined || 0) + n;
}

// ---------------- diário (história)
const STORY = [
  { t: 'A Chegada', txt: 'Fazia três verões que não chovia em Pedra Alta. Quando os celeiros do barão secaram, ele pôs a culpa nas famílias do vale baixo e mandou todas embora: uma carroça, algumas ferramentas e o que coubesse nos braços.<br><br>Depois de muitos dias pela serra, a velha Dona Cida apontou para um vale verde cortado por um rio. <i>“Aqui”</i>, disse ela. <i>“Aqui ninguém vai nos mandar embora.”</i><br><br>O inverno nesta terra é longo. A primeira coisa é ter um teto.', goal: 'Construa 2 casas', check: () => countDone('casa', 'casap') >= 2 },
  { t: 'O Primeiro Teto', txt: 'Na primeira noite debaixo de telhado, as crianças dormiram sem acordar. Os adultos ficaram em volta do fogo fazendo contas: a comida da carroça não dura até a neve.', goal: 'Ponha um coletor, caçador ou pescador para trabalhar', check: () => G.blds.some(b => b.done && ['coletor', 'cacador', 'pescador'].includes(b.t) && b.workers.length > 0) },
  { t: 'Comida na Mesa', txt: 'Peixe, frutas do mato, carne de caça. Não é a mesa farta de antigamente, mas ninguém dorme com fome.<br><br>Dona Cida, porém, olha para as montanhas: <i>“Quando a neve chega aqui, chega para ficar. Casa sem lenha é casa fria.”</i>', goal: 'Construa um lenhador e guarde 60 de lenha', check: () => countDone('lenhador') >= 1 && G.stock.lenha >= 60 },
  { t: 'Fogo Aceso', txt: 'As pilhas de lenha crescem encostadas nas paredes. O céu já tem cor de chumbo de manhã cedo. Agora é aguentar.', goal: 'Sobreviva ao primeiro inverno', check: () => year() >= 2 },
  { t: 'Degelo', txt: 'A neve derreteu e o rio voltou a correr forte. Sobrevivemos. Pela primeira vez, alguém falou em <i>ficar</i> — não em fugir.<br><br>Uma vila só vive de verdade quando nasce gente nela.', goal: 'Que nasça uma criança no vale', check: () => G.births >= 1 },
  { t: 'O Primeiro Choro', txt: 'O choro de um bebê acordou a vila inteira. Dona Cida riu como há muito tempo não ria.<br><br>Mais bocas, porém, pedem mais comida. Em Pedra Alta havia campos de trigo a perder de vista...', goal: 'Faça uma plantação e colha trigo', check: () => G.harvested > 0 },
  { t: 'Pão de Trigo', txt: 'O primeiro pão saiu torto e queimado de um lado. Foi o pão mais gostoso que já comemos.<br><br>As ferramentas que trouxemos estão gastas. Sem ferro e um bom ferreiro, o trabalho vai ficar cada vez mais lento.', goal: 'Construa um ferreiro e guarde 25 ferramentas', check: () => countDone('ferreiro') >= 1 && G.stock.ferramenta >= 25 },
  { t: 'Martelo e Bigorna', txt: 'O som do martelo agora marca as horas do vale. Viajantes que passam pela serra ouvem e descem para ver.', goal: 'Chegue a 30 moradores', check: () => G.vs.length >= 30 },
  { t: 'A Vila', txt: 'Já são trinta, quarenta. Crianças que nasceram aqui nunca viram Pedra Alta e nem querem ver.<br><br>Dona Cida anda devagar agora, de bengala, contando as casas.', goal: 'Chegue ao 8º ano com 50 moradores', check: () => year() >= 8 && G.vs.length >= 50 },
  { t: 'O Vale do Refúgio', txt: 'Chegou um mensageiro de Pedra Alta. A seca voltou por lá, e o barão pergunta se o vale aceitaria receber algumas famílias.<br><br>Fizemos o que ninguém fez por nós: dissemos sim.<br><br><b>Fim do diário.</b> A vila é sua — continue cuidando dela pelo tempo que quiser.', goal: null, check: null },
];
function checkStory() {
  const cur = STORY[G.storyI]; if (!cur || !cur.check) return;
  if (cur.check()) { G.storyI++; sfx('story'); showStory(G.storyI); }
}
