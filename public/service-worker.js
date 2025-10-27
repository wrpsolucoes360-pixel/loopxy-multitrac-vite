// Note: A static service worker like this is not ideal for a Vite project
// because filenames in the build output are hashed.
// For a real production PWA, consider using a plugin like vite-plugin-pwa.

const CACHE_NAME = 'multitrack-player-v2';
// Cache the main entry points. Vite's build process will handle the rest.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      try {
        const fetchRequest = event.request.clone();
        const response = await fetch(fetchRequest);

        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        cache.put(event.request, responseToCache);
        return response;
      } catch (error) {
        // The network failed, which is a common scenario for a PWA.
        // You could return a fallback page here if you have one cached.
        console.log('Fetch failed; returning offline page instead.', error);
      }
    })
  );
});
