const CACHE_NAME = 'mathetrainer-v1';
const ASSETS = [
  './',
  './index.html',
  './reihenuebung.html',
  './links.html',
  './css/styles.css',
  './js/reihenuebung.js',
  './images/mathetrainer180.png',
  './images/mathetrainer192.png',
  './images/mathetrainer512.png',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(r => r || fetch(event.request))
  );
});