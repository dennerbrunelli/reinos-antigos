// Guarda o jogo no celular para funcionar sem internet.
// Ao atualizar o jogo, troque o número da versão abaixo (v1 -> v2 ...).
const CACHE = 'imperio-v7';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './assets/abertura.jpg', './assets/gpt/b_grego_P1_0.webp', './assets/gpt/b_grego_P1_1.webp', './assets/gpt/b_grego_P2_0.webp', './assets/gpt/b_grego_P2_1.webp', './assets/gpt/n_N1.webp', './assets/gpt/n_N2.webp', './assets/gpt/t_areia.webp', './assets/gpt/t_fundo.webp', './assets/gpt/t_grama.webp', './assets/gpt/t_raso.webp', './assets/gpt/t_seca.webp', './assets/gpt/t_terra.webp', './assets/gpt/u_elfs_2.webp', './assets/gpt/u_espa_0.webp', './assets/gpt/u_espa_1.webp', './assets/gpt/u_gaz_2.webp', './assets/gpt/u_guerA_0.webp', './assets/gpt/u_guerA_1.webp', './assets/gpt/u_guer_0.webp', './assets/gpt/u_guer_1.webp', './assets/gpt/u_leao_2.webp', './assets/gpt/u_vill_0.webp', './assets/gpt/u_vill_1.webp'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// Responde com a cópia guardada; se tiver internet, busca a versão nova em segundo plano
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, {ignoreSearch: true});
    const net = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    return hit || (await net) || c.match('./index.html');
  }));
});
