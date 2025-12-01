const CACHE_NAME = 'mathetrainer-v2'; // vorher z.B. v1 erhöhen
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

self.addEventListener('install', (event) => {
    self.skipWaiting(); // sofort aktiv werden
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
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
            ]);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            // alte Caches entfernen
            const keys = await caches.keys();
            await Promise.all(keys.map(k => { if (k !== CACHE_NAME) return caches.delete(k); }));
            await self.clients.claim(); // Seiten sofort übernehmen
        })()
    );
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