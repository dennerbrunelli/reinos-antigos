// Guarda o Refúgio no celular para funcionar sem internet.
// Ao atualizar o jogo, troque a versão abaixo (v1 -> v2 ...).
const CACHE = 'refugio-v2';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './js/arte.js', './js/mundo.js', './js/gente.js', './js/tela.js', ...['fx_click1', 'fx_chop1', 'fx_hammer1', 'fx_bell1', 'fx_done1', 'fx_coin1', 'fx_alert1', 'fx_splash1', 'fx_mine1'].map(f => `./sons/${f}.mp3`)];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('refugio-') && k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    return hit || (await net) || c.match('./index.html');
  }));
});
