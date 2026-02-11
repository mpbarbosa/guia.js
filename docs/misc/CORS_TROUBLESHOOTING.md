# CORS Error Troubleshooting Guide

## What is the CORS Error?

```
Access to fetch at 'https://nominatim.openstreetmap.org/reverse' from origin 'http://localhost:8080' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### What is CORS?

**CORS** (Cross-Origin Resource Sharing) is a security mechanism that prevents web pages from making requests to a different domain than the one serving the web page.

- **Your app**: `http://localhost:8080` (origin)
- **Nominatim API**: `https://nominatim.openstreetmap.org` (different origin)
- **Browser**: Blocks the request for security

## Why This Happens

1. **Development Environment**: Running locally on `http://localhost:8080`
2. **External API**: Calling `https://nominatim.openstreetmap.org`
3. **Browser Security**: Modern browsers block cross-origin requests without proper headers
4. **HTTP 425 (Too Early)**: Nominatim may be rate-limiting or detecting unusual request patterns

## Solutions

### ✅ Solution 1: Use HTTPS for Local Development (Recommended)

Nominatim allows CORS from HTTPS origins. Change your local server to use HTTPS:

```bash
# Install http-server with SSL support
npm install -g http-server

# Start with SSL (creates self-signed certificate)
http-server -S -C cert.pem -K key.pem -p 8443

# Access: https://localhost:8443/src/index.html
```

**Note**: You'll need to accept the self-signed certificate warning in your browser.

---

### ✅ Solution 2: Use Browser Extension (Development Only)

Install a CORS-unblocking browser extension:

**Chrome/Edge**:
- [Allow CORS: Access-Control-Allow-Origin](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf)

**Firefox**:
- [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/)

⚠️ **Warning**: Only use during development. Disable when browsing other sites.

---

### ✅ Solution 3: Use a CORS Proxy (Quick Fix)

Add a CORS proxy prefix to API calls. **Not recommended for production**.

```javascript
// In ReverseGeocoder.js, modify the URL:
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const apiUrl = 'https://nominatim.openstreetmap.org/reverse';
const fullUrl = proxyUrl + apiUrl;
```

**Public CORS Proxies**:
- `https://cors-anywhere.herokuapp.com/` (requires request access)
- `https://api.allorigins.win/raw?url=` (add your URL after)

---

### ✅ Solution 4: Run Your Own CORS Proxy (Best for Team)

Create a simple proxy server:

**proxy-server.js**:
```javascript
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

app.get('/api/reverse', async (req, res) => {
  const { lat, lon } = req.query;
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
  
  const response = await fetch(url, {
    headers: { 'User-Agent': 'GuiaTuristico/0.8.7' }
  });
  
  const data = await response.json();
  res.json(data);
});

app.listen(3000, () => console.log('Proxy running on port 3000'));
```

Install dependencies:
```bash
npm install express cors node-fetch
node proxy-server.js
```

Update app to use proxy:
```javascript
const url = 'http://localhost:3000/api/reverse?lat=' + lat + '&lon=' + lon;
```

---

### ✅ Solution 5: Disable Browser Security (Development Only)

**Chrome** - Start with disabled security:
```bash
# Windows
chrome.exe --disable-web-security --user-data-dir="C:/chrome-dev"

# Mac
open -na Google\ Chrome --args --disable-web-security --user-data-dir="/tmp/chrome-dev"

# Linux
google-chrome --disable-web-security --user-data-dir="/tmp/chrome-dev"
```

⚠️ **Warning**: Only for development. Creates security risks.

---

## Current Implementation

The app now has **graceful error handling** for CORS failures:

### Enhanced Error Messages

**User sees**:
```
Erro de Rede
Não foi possível acessar o serviço de geocodificação. Verifique sua conexão.
```

**Instead of**:
```
TypeError: Failed to fetch
```

### Error Detection

The app detects these error types:
- **CORS errors**: "Failed to fetch" or "CORS" in message
- **Rate limiting (429)**: "Limite de requisições atingido"
- **Too Early (425)**: "Serviço temporariamente indisponível"

### What Happens
1. ✅ Error is logged to console (for developers)
2. ✅ User-friendly toast notification appears
3. ✅ App continues to work (doesn't crash)
4. ✅ User can try again

---

## Production Deployment

For production, you have two options:

### Option A: Backend Proxy (Recommended)
- Deploy a backend server (Node.js, Python, etc.)
- Backend makes requests to Nominatim
- Frontend calls your backend
- No CORS issues

### Option B: Use HTTPS
- Deploy on HTTPS domain
- Nominatim allows CORS from HTTPS origins
- No proxy needed

---

## Nominatim Usage Policy

⚠️ **Important**: Respect Nominatim's usage policy:

1. **Rate Limiting**: Max 1 request per second
2. **User-Agent**: Always set a custom User-Agent header
3. **Caching**: Cache results to reduce requests
4. **Heavy Usage**: Run your own Nominatim instance

Read more: https://operations.osmfoundation.org/policies/nominatim/

---

## Testing

After implementing a solution, you should see:

```
✅ [GeolocationService] getSingleLocationUpdate called
✅ ServiceCoordinator: Address fetched successfully
✅ Address displayed: [Your address]
```

**No more**:
```
❌ Access to fetch... has been blocked by CORS policy
❌ GET https://nominatim.openstreetmap.org/reverse net::ERR_FAILED 425
```

---

## Quick Start for Development

**Fastest solution for local testing**:

1. Install browser extension (Solution 2)
2. Enable extension
3. Reload page
4. Should work immediately

**Best long-term solution**:

1. Set up local CORS proxy (Solution 4)
2. Update API URL in config
3. Team can use same proxy

---

## Need Help?

If errors persist:
1. Check browser console for detailed error messages
2. Verify network connectivity
3. Try a different browser
4. Check Nominatim status: https://status.openstreetmap.org/

## Files Modified

- ✅ `src/services/ReverseGeocoder.js` - Enhanced error handling with user-friendly messages
- ✅ Error detection for CORS, rate limiting (429), and service unavailable (425) errors
- ✅ Integration with ErrorRecovery for toast notifications
