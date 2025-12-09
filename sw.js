const CACHE_NAME = 'v3d-cache-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/base.css',
  './css/components.css',
  './css/layout.css',
  './css/responsive.css',
  './css/variables.css',
  './js/main.js',
  './js/config.js',
  './js/controls.js',
  './js/interactions.js',
  './js/theme.js',
  './js/viewer.js',
  './js/webgpu.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networked = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => cached);
      
      return cached || networked;
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
