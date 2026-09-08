const CACHE = 'froydinger-vibeslops-v1';
const BASE = new URL('./', self.location.href);
const SHELL = ['index.html', 'manifest.webmanifest', 'pwa.js', 'touch-controls.css', 'social/icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL.map(file => new URL(file, BASE).href))));
  // Let an existing match finish before an updated worker takes control.
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('froydinger-vibeslops-') && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  const local = url.origin === BASE.origin && url.pathname.startsWith(BASE.pathname);
  const dependency = url.origin === 'https://cdn.jsdelivr.net' && url.pathname.startsWith('/npm/');
  if (request.method !== 'GET' || request.headers.has('range') || (!local && !dependency)) return;
  // Only cache files the player actually uses, keeping the initial visit small.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      if (response.ok && response.status === 200 && response.type !== 'opaque') {
        const copy = response.clone();
        event.waitUntil(cache.put(request, copy).catch(() => {}));
      }
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        const shell = await cache.match(new URL('index.html', BASE).href);
        if (shell) return shell;
      }
      throw error;
    }
  })());
});
