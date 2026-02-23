/**
 * Service Worker for Guia Turístico
 * Provides offline support and caching for PWA functionality
 * @version 0.9.0-alpha
 */

const CACHE_NAME = 'guia-turistico-v0.9.0-alpha-20260223c';
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

// Fetch event - serve from cache, fallback to network
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
  
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', request.url);
          return cachedResponse;
        }
        
        console.log('[SW] Fetching from network:', request.url);
        return fetch(request)
          .then(response => {
            // Don't cache non-success responses
            if (!response || response.status !== 200) {
              return response;
            }
            
            // Clone response for caching (cache both 'basic' and 'cors' responses)
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.error('[SW] Fetch failed:', error);
            
            // Only return HTML fallback for page navigation requests, not for JS/CSS assets.
            // Returning index.html for a failed JS asset request would cause the browser
            // to try parsing HTML as JavaScript, hanging the app.
            if (request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            
            return new Response('', { status: 503, statusText: 'Service Unavailable' });
          });
      })
  );
});

// Message event - handle commands from app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
