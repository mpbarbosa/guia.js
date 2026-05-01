/**
 * Service Worker for Guia Turístico
 * Provides offline support and caching for PWA functionality
 * @version 0.12.12-alpha
 */

const CACHE_NAME = 'guia-turistico-v0.19.2-alpha-20260501-6c3f2e2';

/** Shell assets precached on install — routes that must work offline. */
const STATIC_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];
const STATIC_ASSET_PATHS = new Set(
  STATIC_ASSETS.map((asset) => new URL(asset, self.location.origin).pathname)
);

/**
 * External API origins whose responses should be cached for offline use.
 * Uses network-first with cache fallback so the latest data is always
 * preferred when the device has connectivity.
 */
const API_ORIGINS = [
  'nominatim.openstreetmap.org',
  'servicodados.ibge.gov.br',
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
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isNavigationRequest = request.mode === 'navigate';
  const isPrecachedShellAsset = isSameOrigin && STATIC_ASSET_PATHS.has(url.pathname);
  const isStaticSubresource =
    isSameOrigin && ['script', 'style', 'image', 'font'].includes(request.destination);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip CDN imports (paraty_geocore.js, maplibre-gl) — no benefit caching these
  if (url.hostname === 'cdn.jsdelivr.net') {
    return;
  }

  // External API calls: network-first with cache fallback so offline geocoding
  // can serve the last known result for the same coordinates.
  if (API_ORIGINS.some(origin => url.hostname.includes(origin))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Serve navigations and same-origin static assets from cache first once they
  // have been populated. This avoids paying network latency on repeat app-shell
  // loads while the versioned cache key still guarantees fresh assets after a
  // deploy.
  if (isNavigationRequest || isPrecachedShellAsset || isStaticSubresource) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Other same-origin requests stay network-first so dynamic responses still
  // prefer fresh content and only fall back to cache when offline.
  event.respondWith(networkFirstStrategy(request));
});

/**
 * Network-first strategy: fetch from network, cache the result, fall back to cache on failure.
 * Used for all requests — ensures the latest content is always preferred.
 * For navigation requests that fail, serves offline.html as a fallback.
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
        if (cached) return cached;
        // Navigation fallback: serve offline shell
        if (request.mode === 'navigate') {
          return caches.match('./offline.html');
        }
        return new Response('', { status: 503, statusText: 'Service Unavailable' });
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
