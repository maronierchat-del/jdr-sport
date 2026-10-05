const SW_VERSION = 'fitland-pwa-v3.8';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('fitland-')).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

// Pas de cache : toujours prendre la version publiée sur GitHub Pages.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
