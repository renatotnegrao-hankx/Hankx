/* Cache offline do HANKX Finanças */
const CACHE = 'hankx-fin-v15';
const FILES = ['./', 'index.html', 'styles.css?v=14', 'app.js?v=14', 'manifest.json', 'icons/icon-192.png', 'icons/apple-touch-icon.png', 'icons/logo.png', 'vendor/xlsx.full.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  // rede primeiro (pega atualizações), cache quando estiver offline
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
