# CORS Troubleshooting Guide

## Understanding the Issue

The application uses the **OpenStreetMap Nominatim API** for reverse geocoding (converting coordinates to addresses). This external API may be blocked by CORS (Cross-Origin Resource Sharing) policies in production environments.

## Error Symptoms

```javascript
TypeError: Failed to fetch
    at IbiraAPIFetcher._performSingleRequest (IbiraAPIFetcher.js:518:27)
```

```javascript
GET https://nominatim.openstreetmap.org/reverse?format=json&lat=-23.550520&lon=-46.633309
CORS error / Failed to fetch
```

## How the Application Handles This

The application has **automatic CORS fallback** enabled by default:

### Step 1: Direct Connection (First Attempt)

```
Request → https://nominatim.openstreetmap.org/reverse
```

### Step 2: CORS Proxy Fallback (Automatic Retry)

If Step 1 fails with a network/CORS error:

```
Request → https://api.allorigins.win/raw?url=https%3A%2F%2Fnominatim.openstreetmap.org%2Freverse...
```

### Step 3: Error Notification

If both attempts fail, the user sees:

```
"Não foi possível acessar o serviço de geocodificação.
Verifique sua conexão ou consulte CORS_TROUBLESHOOTING.md"
```

## Configuration

The CORS fallback is controlled in `src/config/defaults.js`:

```javascript
export const ENABLE_CORS_FALLBACK = true;  // Enabled by default
export const CORS_PROXY = null;  // Auto-selected on first error
```

### Disable CORS Fallback (Not Recommended)

If you want to disable the automatic fallback:

```javascript
// src/config/defaults.js
export const ENABLE_CORS_FALLBACK = false;
```

### Custom CORS Proxy

To use a different CORS proxy:

```javascript
// src/config/defaults.js
export const CORS_PROXY = 'https://your-cors-proxy.com/?url=';
```

## Debugging CORS Issues

### Browser Console

Look for these messages in the browser console:

**Success Pattern**:

```
(ReverseGeocoder) Retrying with CORS proxy fallback...
(ReverseGeocoder) CORS proxy fallback succeeded
```

**Failure Pattern**:

```
[ReverseGeocoder.fetchAddress] Failed: TypeError: Failed to fetch
(ReverseGeocoder) CORS proxy fallback also failed: TypeError: Failed to fetch
```

### Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Look for requests to `nominatim.openstreetmap.org`
4. Check:
   - Status code (200 = success, 0 = CORS blocked)
   - Response headers (should include `Access-Control-Allow-Origin`)
   - Timing (slow responses may indicate network issues)

## Common Solutions

### 1. Verify Internet Connectivity

```bash
# Test if Nominatim API is reachable
curl -I "https://nominatim.openstreetmap.org/reverse?format=json&lat=-23.5505&lon=-46.6333"

# Should return: HTTP/2 200
```

### 2. Check Firewall Rules

If deployed behind a corporate firewall:

- Whitelist `nominatim.openstreetmap.org`
- Whitelist `api.allorigins.win` (fallback proxy)
- Allow outbound HTTPS on port 443

### 3. Rate Limiting

Nominatim has usage limits:

- **1 request per second** maximum
- **User-Agent header** required

The application handles this automatically via `ibira.js` library rate limiting.

### 4. Alternative Geocoding Services

If Nominatim is consistently unavailable, consider:

**Option A: Self-hosted Nominatim**

- Install Nominatim on your server
- Update `openstreetmapBaseUrl` in `WebGeocodingManager`
- No CORS issues (same-origin requests)

**Option B: Commercial geocoding APIs**

- Google Maps Geocoding API
- Mapbox Geocoding API
- HERE Geocoding API

**Option C: Reverse Proxy**

- Set up your own reverse proxy
- Forward requests to Nominatim
- Add CORS headers on your server

## Production Deployment

### Apache Configuration

```apache
# .htaccess - Add CORS headers for your reverse proxy
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type"
</IfModule>

# Reverse proxy to Nominatim (optional)
RewriteEngine On
RewriteRule ^api/nominatim/(.*) https://nominatim.openstreetmap.org/$1 [P,L]
```

### Nginx Configuration

```nginx
# Reverse proxy to Nominatim (optional)
location /api/nominatim/ {
    proxy_pass https://nominatim.openstreetmap.org/;
    proxy_set_header Host nominatim.openstreetmap.org;

    # Add CORS headers
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type" always;

    # Handle OPTIONS preflight
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

Then update your application:

```javascript
// src/config/defaults.js or pass via constructor
const config = {
    openstreetmapBaseUrl: 'https://your-domain.com/api/nominatim/reverse?format=json',
    enableCorsFallback: false  // Not needed with reverse proxy
};
```

## Testing CORS Fallback

### Manual Test

1. Open browser DevTools Console
2. Block direct Nominatim access (use browser extension or firewall)
3. Trigger geolocation in the app
4. Watch console for fallback messages

### Automated Test

```javascript
// Test CORS fallback in browser console
(async () => {
    try {
        // This should fail with CORS in production
        const response = await fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=-23.5505&lon=-46.6333');
        console.log('Direct access:', response.ok ? 'SUCCESS' : 'FAILED');
    } catch (err) {
        console.log('Direct access FAILED (expected in production)');

        // Try CORS proxy
        const proxyUrl = 'https://api.allorigins.win/raw?url=' +
            encodeURIComponent('https://nominatim.openstreetmap.org/reverse?format=json&lat=-23.5505&lon=-46.6333');
        const proxyResponse = await fetch(proxyUrl);
        console.log('CORS proxy:', proxyResponse.ok ? 'SUCCESS' : 'FAILED');
    }
})();
```

## Performance Impact

**Direct Connection**:

- ~200-500ms average response time
- No additional latency

**CORS Proxy Fallback**:

- ~500-1500ms average response time
- Additional hop through proxy server
- Still provides functional geocoding

**Recommendation**: Monitor the frequency of fallback usage. If >50% of requests use the fallback, investigate why direct connections are failing.

## References

- [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)
- [CORS Specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [AllOrigins CORS Proxy](https://allorigins.win/)

---

**Last Updated**: 2026-02-16
**Version**: 0.9.0-alpha
