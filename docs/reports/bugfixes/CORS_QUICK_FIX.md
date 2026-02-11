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

### Proxy still not working?

1. **Check proxy URL**: Must end with `?url=` or handle URL encoding
2. **Network issues**: Test proxy directly in browser
3. **Rate limiting**: allorigins.win has rate limits

### Want to use a different proxy?

```javascript
// Other public proxies:
export const CORS_PROXY = 'https://corsproxy.io/?';
export const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';  // Requires request access
```

### Need more control?

Run your own proxy server. See `CORS_TROUBLESHOOTING.md` for complete setup instructions.

---

## Summary

**Quick fix**: Set `ENABLE_CORS_FALLBACK = true` in `src/config/defaults.js`

**Best practices**:
- ✅ Use fallback for local development
- ✅ Use direct access (no proxy) in production with HTTPS
- ✅ Consider running own proxy for team development

**Files to modify**:
- `src/config/defaults.js` - Enable/disable fallback and set proxy URL

That's it! Your CORS issues should be resolved.
