## CORS_TROUBLESHOOTING

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
RewriteRule ^api/n

---

## CORS_QUICK_FIX

# Quick CORS Fix - Enable Automatic Fallback

## TL;DR - One-Line Fix

Open `src/config/defaults.js` and change:

```javascript
export const ENABLE_CORS_FALLBACK = false;
```

To:

```javascript
export const ENABLE_CORS_FALLBACK = true;
```

That's it! The app will now automatically retry failed requests using a CORS proxy.

---

## What This Does

When enabled, the application will:

1. **Try direct API access first** (fast, no proxy)
2. **If CORS error occurs**, automatically retry using `https://api.allorigins.win` proxy
3. **Show user-friendly message**: "Não foi possível acessar o serviço. Tentando via proxy..."
4. **Fall back to proxy** for subsequent requests if direct access keeps failing

---

## Configuration Options

### Option 1: Automatic Fallback (Recommended for Development)

```javascript
// src/config/defaults.js
export const ENABLE_CORS_FALLBACK = true;
export const CORS_PROXY = null;  // Uses allorigins.win automatically
```

**Pros**:

- ✅ Tries direct access first (faster when it works)
- ✅ Automatically falls back on error
- ✅ No manual proxy configuration needed

**Cons**:

- ⚠️ First request will fail (CORS error logged)
- ⚠️ Depends on third-party proxy service

---

### Option 2: Always Use Proxy

```javascript
// src/config/defaults.js
export const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
export const ENABLE_CORS_FALLBACK = false;  // Not needed, always using proxy
```

**Pros**:

- ✅ No CORS errors ever
- ✅ Consistent behavior

**Cons**:

- ⚠️ All requests go through proxy (slower)
- ⚠️ Depends on third-party service

---

### Option 3: Custom Proxy Server

```javascript
// src/config/defaults.js
export const CORS_PROXY = 'http://localhost:3000/api/proxy?url=';
export const ENABLE_CORS_FALLBACK = false;
```

**Pros**:

- ✅ Full control over proxy
- ✅ Better for team development
- ✅ Can add custom headers, caching, rate limiting

**Cons**:

- ⚠️ Requires running your own proxy server

See `CORS_TROUBLESHOOTING.md` for proxy server code.

---

## How It Works

### Without CORS Fallback (Default)

```
User requests location
  ↓
App tries to fetch address from Nominatim
  ↓
❌ CORS Error: Access blocked by browser
  ↓
User sees: "Não foi possível acessar o serviço"
```

### With CORS Fallback Enabled

```
User requests location
  ↓
App tries to fetch address from Nominatim
  ↓
❌ CORS Error detected
  ↓
App automatically retries via CORS proxy
  ↓
✅ Success! Address displayed
  ↓
Next requests use proxy automatically
```

---

## Testing

After enabling CORS fallback:

1. Clear browser cache (`Ctrl+Shift+Delete`)
2. Reload the page (`Ctrl+Shift+R`)
3. Click "Obter Localização"
4. Watch console:

**Expected output**:

```
[ErrorRecovery] CORS error detected
[ReverseGeocoder] Retrying with CORS proxy fallback...
[ReverseGeocoder] Using CORS proxy: https://api.allorigins.win/raw?url=
✓ [ReverseGeocoder] CORS proxy fallback succeeded
✓ ServiceCoordinator: Address fetched successfully
```

---

## Production Deployment

⚠️ **Important**: Disable CORS fallback in production!

```javascript
// For production, use HTTPS and disable proxy
export const ENABLE_CORS_FALLBACK = false;
export const CORS_PROXY = null;
```

Why?

- Nominatim allows CORS from HTTPS origins
- No proxy needed in production
- Faster and more reliable

---

## Troubleshooting

### Proxy still not working

1. **Check proxy URL**: Must end with `?url=` or handle URL encoding
2. **Network issues**: Test proxy directly in browser
3. **Rate limiting**: allorigins.win has rate limits

### Want to use a different proxy

```javascript
// Other public proxies:
export const CORS_PROXY = 'https://corsproxy.io/?';
export const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';  // Requires request access
```

### Need more control

Run your own proxy server. See `CORS_TROUBLESHOOTING.md` for complete setup instructions.

---

## Summary

**Quick fix**: Set `ENABLE_CORS_FALLBACK = true` in `src/config/defaults.js`

**Best practices**:

- ✅ Us

---

## CORS_TEST_RESULTS

# CORS Fallback System - Test Results

## Configuration Applied

### File: `src/config/defaults.js`

```javascript
export const CORS_PROXY = null;  // Will use allorigins.win automatically
export const ENABLE_CORS_FALLBACK = true;  // ✅ ENABLED
```

### File: `src/coordination/WebGeocodingManager.js`

```javascript
import { CORS_PROXY, ENABLE_CORS_FALLBACK } from '../config/defaults.js';

// ...

this.reverseGeocoder = params.reverseGeocoder ||
  new ReverseGeocoder(fetchManager, {
    corsProxy: CORS_PROXY,
    enableCorsFallback: ENABLE_CORS_FALLBACK
  });
```

## What Was Changed

### 1. Configuration Module (`src/config/defaults.js`)

- ✅ Added `CORS_PROXY` constant (null = auto-detect)
- ✅ Added `ENABLE_CORS_FALLBACK` constant (true = enabled)
- ✅ Added `NOMINATIM_API_BASE` constant for consistency

### 2. ReverseGeocoder Service (`src/services/ReverseGeocoder.js`)

- ✅ Constructor now accepts `corsProxy` and `enableCorsFallback` config
- ✅ Added `_corsRetryAttempted` flag to prevent infinite loops
- ✅ Enhanced error handling with CORS detection
- ✅ Automatic retry with `https://api.allorigins.win/raw?url=` on CORS failure
- ✅ Updated `getOpenStreetMapUrl()` helper to support proxy URLs
- ✅ User-friendly error messages with retry notification

### 3. WebGeocodingManager (`src/coordination/WebGeocodingManager.js`)

- ✅ Imports CORS configuration from defaults
- ✅ Passes configuration to ReverseGeocoder on instantiation
- ✅ Maintains backward compatibility with custom ReverseGeocoder instances

## Expected Behavior

### First Request (Direct API)

1. User clicks "Obter Localização"
2. App gets coordinates from browser
3. App tries direct Nominatim API call
4. **CORS error occurs** (expected in development)

### Automatic Fallback

1. Error handler detects CORS failure
2. Shows toast: "Não foi possível acessar o serviço. Tentando via proxy..."
3. Automatically retries via `https://api.allorigins.win/raw?url=`
4. **Success!** Address is fetched and displayed

### Subsequent Requests

1. Next location request uses proxy automatically
2. No CORS errors on subsequent requests

## Console Output (Expected)

### With CORS Fallback Enabled

```
[GeolocationService] getSingleLocationUpdate called
✓ Application initialized successfully

// First attempt (will fail due to CORS)
Access to fetch at 'https://nominatim.openstreetmap.org/reverse...'
has been blocked by CORS policy

[ReverseGeocoder.fetchAddress] Failed: TypeError: Failed to fetch
⚠️ [ReverseGeocoder] Retrying with CORS proxy fallback...

// Second attempt (via proxy)
[ReverseGeocoder] Using CORS proxy: https://api.allorigins.win/raw?url=
✓ [ReverseGeocoder] CORS proxy fallback succeeded
✓ ServiceCoordinator: Address fetched successfully

// Address displayed
[ReverseGeocoder.fetchAddress] Standardized address: {...}
```

## Validation Checklist

- [x] JavaScript syntax valid (`npm run validate`)
- [x] Configuration properly imported
- [x] ReverseGeocoder receives config
- [x] Error detection logic in place
- [x] Retry logic implemented
- [x] User notifications configured
- [x] Backward compatibility maintained

## How to Test

### Step 1: Verify Configuration

```bash
grep "ENABLE_CORS_FALLBACK = true" src/config/defaults.js
# Should output: export const ENABLE_CORS_FALLBACK = true;
```

### Step 2: Clear Browser Cache

1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Step 3: Test Application

1. Open `http://localhost:8080/src/index.html`
2. Open browser console (F12)
3. Click "Obter Localização" button
4. Grant location permission if prompted
5. Watch console for fallback messages

### Step 4: Verify Success

- ✅ Toast notification appears during retry
- ✅ Address is displayed after a few seconds
- ✅ No unhandled errors
- ✅ Map links work correctly

## Troubleshooting

### If fallback doesn't trigger

1. Check config: `cat src/config/defaults.js | grep ENABLE_CORS_FALLBACK`
2. Verify browser cache is cleared
3. Check conso
