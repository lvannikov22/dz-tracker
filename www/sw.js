const CACHE = 'dz-v1';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(['./', 'index.html', 'style.css', 'app.js', 'build.js', 'manifest.webmanifest', 'fonts/nunito/index.css']))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// сначала сеть (всегда свежая версия), без сети берём из кэша
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req.url, { cache: 'no-cache' })
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match('index.html')))
  );
});
