const CACHE_NAME = 'mathetrainer-v1';
// Liste der Assets relativ zum Site‑Root-Subpath; keine führenden '/' hier
const ASSETS = [
  'index.html',
  'plusminusuebung.html',
  'reihenuebung.html',
  'links.html',
  'css/styles.css',
  'js/plusminusuebung.js',
  'js/reihenuebung.js',
  'js/sw-register.js',
  'js/help.js',
  'images/mathetrainer192.png'
];

// Hilfsfunktion: Basis-Pfad ermitteln (verwende registration.scope falls vorhanden)
function basePath() {
  try { return self.registration.scope || '/mathetrainer/'; } catch (e) { return '/mathetrainer/'; }
}

self.addEventListener('install', (ev) => {
  ev.waitUntil((async () => {
    const base = basePath();
    const cache = await caches.open(CACHE_NAME);
    const urls = ASSETS.map(a => new URL(a, base).href);

    // Versuche jedes Asset zu holen; speichere nur erfolgreiche Antworten
    await Promise.all(urls.map(async (url) => {
      try {
        const resp = await fetch(url, { cache: 'no-cache' });
        if (!resp || (resp.status && resp.status >= 400)) {
          console.warn('Skipping bad asset', url, resp && resp.status);
          return;
        }
        await cache.put(url, resp.clone());
      } catch (err) {
        console.warn('Asset failed to cache, skipping', url, err);
      }
    }));

    // Aktivieren erlauben
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  // Navigation (HTML) -> network-first
  if (req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'))) {
    ev.respondWith((async () => {
      try {
        const net = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, net.clone()).catch(()=>{});
        return net;
      } catch {
        return caches.match(req) || caches.match('index.html');
      }
    })());
    return;
  }

  // Sonstige Anfragen -> cache-first, update im Hintergrund
  ev.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    const networkFetch = fetch(req).then(async (resp) => {
      if (resp && resp.status === 200) {
        cache.put(req, resp.clone()).catch(()=>{});
      }
      return resp;
    }).catch(()=>null);
    return cached || networkFetch;
  })());
});

// Support für manuelle Aktivierung
self.addEventListener('message', (ev) => {
  if (ev.data && ev.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});