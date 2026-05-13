---
name: e2e-nominatim-mock
description: ibira.js fetch() calls bypass Puppeteer's CDP request interception — Nominatim mock must be injected at the JavaScript level via page.evaluateOnNewDocument, not via setRequestInterception
metadata:
  type: project
---

Puppeteer's `page.setRequestInterception(true)` + `page.on('request', ...)` does NOT intercept Nominatim geocoding requests in the E2E Docker tests.

Root cause: `ibira.js` (bundled from node_modules in the Vite dist) calls the global `fetch()` from inside its `IbiraAPIFetcher._performSingleRequest()` method. This `fetch()` path bypasses CDP's `Fetch.enable` interception layer — possibly because the `evaluateOnNewDocument` patches `window.fetch` before CDP wraps it, or because of how the Chromium build in Alpine handles CDN-loaded vs bundled ibira.js modules.

Additionally, `OfflineCacheService` uses IndexedDB (`guia-offline-cache`) which persists geocoding results across pages in the same browser session. A previous test's real Nominatim response (e.g. "Cerqueira César" for MASP area coords) can populate this cache, causing the bairro to show real data instead of the mock.

**Fix** (in `__tests__/e2e/sanity.e2e.test.js` `setupGeolocationPage()`):
1. Use `page.evaluateOnNewDocument()` to patch `window.fetch` at the JS level — intercept `nominatim.openstreetmap.org` URLs and return the mock payload as `Promise.resolve(new Response(...))`.
2. Also clear IndexedDB (`guia-offline-cache`), localStorage, and sessionStorage in the same `evaluateOnNewDocument` call.
3. Keep the CDP interceptor (`setRequestInterception`) as a fallback for any non-fetch path.

**Why:** `evaluateOnNewDocument` runs before ANY page script, so the patched `window.fetch` is what ibira.js calls. The mock payload is returned synchronously without any network request.
