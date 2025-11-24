const CACHE_NAME = 'mathetrainer-v2'; // inkrementieren bei Release
const ASSETS = [
  '/css/styles.css',
  '/js/plusminusuebung.js',
  '/js/reihenuebung.js',
  // ...weitere versionierte Assets
];

// Install: assets in Cache
self.addEventListener('install', (ev) => {
  self.skipWaiting(); // installiert neuen SW und fordert Aktivierung
  ev.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Aktivieren: alte Caches entfernen
self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Fetch: Navigation = network-first; Assets = cache-first (stale-while-revalidate)
self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  const url = new URL(req.url);

  // Navigation (HTML) -> network-first
  if (req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'))) {
    ev.respondWith(
      fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
        return resp;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Assets -> cache-first, update in background
  ev.respondWith(
    caches.match(req).then(cached => {
      const networkFetch = fetch(req).then(resp => {
        if (resp && resp.status === 200) caches.open(CACHE_NAME).then(c => c.put(req, resp.clone()));
        return resp;
      }).catch(() => null);
      return cached || networkFetch;
    })
  );
});

// Optional: Empfang von Nachrichten (z.B. 'skipWaiting' aus der Seite)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});