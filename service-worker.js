/**
 * Service Worker for Guia Turístico
 * Provides offline support and caching for PWA functionality
 * @version 0.11.5-alpha
 */

const CACHE_NAME = 'guia-turistico-v0.11.5-alpha-20260225-28ae31e';
const STATIC_ASSETS = [
  './',
  './index.html'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - smart caching strategy based on asset type
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external API requests (OpenStreetMap, IBGE, etc.)
  if (request.url.includes('nominatim.openstreetmap.org') ||
      request.url.includes('servicodados.ibge.gov.br') ||
      request.url.includes('cdn.jsdelivr.net')) {
    return;
  }

  // All app assets use network-first strategy so the dev server (Vite) always
  // processes requests — critical for html-proxy virtual modules (inline scripts).
  // Falls back to cache when offline so the PWA shell still loads.
  event.respondWith(networkFirstStrategy(request));
});

/**
 * Network-first strategy: fetch from network, cache the result, fall back to cache on failure.
 * Used for JS/CSS assets so mobile devices always receive the latest deployed code.
 * @param {Request} request
 * @returns {Promise<Response>}
 */
function networkFirstStrategy(request) {
  return fetch(request)
    .then(response => {
      if (response && response.ok) {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache));
        return response;
      }
      // Non-2xx response (e.g. 500): fall back to cache if available
      return caches.match(request).then(cached => {
        if (cached) {
          console.log('[SW] Network error, serving from cache:', request.url);
          return cached;
        }
        return response;
      });
    })
    .catch(() => {
      console.log('[SW] Network failed, serving from cache:', request.url);
      return caches.match(request).then(cached => {
        return cached || new Response('', { status: 503, statusText: 'Service Unavailable' });
      });
    });
}

/**
 * Cache-first strategy: serve from cache if available, fetch from network otherwise.
 * Used for HTML navigation so the PWA shell loads instantly and works offline.
 * @param {Request} request
 * @returns {Promise<Response>}
 */
function cacheFirstStrategy(request) {
  return caches.match(request)
    .then(cachedResponse => {
      if (cachedResponse) {
        console.log('[SW] Serving from cache:', request.url);
        return cachedResponse;
      }

      console.log('[SW] Fetching from network:', request.url);
      return fetch(request)
        .then(response => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache));
          return response;
        })
        .catch(error => {
          console.error('[SW] Fetch failed:', error);
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('', { status: 503, statusText: 'Service Unavailable' });
        });
    });
}

// Message event - handle commands from app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
