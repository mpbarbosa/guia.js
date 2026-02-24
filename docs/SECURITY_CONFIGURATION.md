# Security and Configuration Implementation Guide

## Overview

This guide documents the implementation of security recommendations including environment variables, Content Security Policy (CSP), and API rate limiting.

## 1. Environment Variables

### Setup

1. **Copy the example file:**

   ```bash
   cp .env.example .env
   ```

2. **Edit .env with your values:**

   ```bash
   # .env file (DO NOT commit to version control)
   NOMINATIM_API_URL=https://nominatim.openstreetmap.org
   NOMINATIM_USER_AGENT=GuiaTuristico/0.11.0
   IBGE_API_URL=https://servicodados.ibge.gov.br
   
   RATE_LIMIT_NOMINATIM=60
   RATE_LIMIT_IBGE=120
   
   ENABLE_SPEECH_SYNTHESIS=true
   ENABLE_OFFLINE_MODE=true
   ENABLE_ANALYTICS=false
   
   DEBUG_MODE=false
   LOG_LEVEL=info
   
   CSP_ENABLED=true
   CORS_ENABLED=false
   ```

### Usage in Code

```javascript
import { env } from './config/environment.js';

// Access environment variables
const apiUrl = env.nominatimApiUrl;
const isDebug = env.debugMode;

// Check environment
if (env.isDevelopment()) {
  console.log('Running in development mode');
}
```

### Browser Integration

For browser environments, inject environment variables at build time:

```html
<script>
  window.__ENV__ = {
    NOMINATIM_API_URL: 'https://nominatim.openstreetmap.org',
    DEBUG_MODE: true
  };
</script>
```

## 2. Content Security Policy (CSP)

### Important: Meta Tag Limitations

⚠️ **The `frame-ancestors` CSP directive is NOT supported in `<meta>` tags.** It only works when delivered via HTTP headers.

For clickjacking protection when using meta tags, the application uses:

- **X-Frame-Options: DENY** header (fallback for meta tag deployments)
- **frame-ancestors** directive only in HTTP headers (when available)

### Meta Tag Integration (Static Hosting)

For static hosting (GitHub Pages, Netlify, etc.) without HTTP header control:

```html
<!-- CSP meta tag (without frame-ancestors) -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://nominatim.openstreetmap.org https://servicodados.ibge.gov.br; base-uri 'self'; form-action 'self'">

<!-- X-Frame-Options for clickjacking protection -->
<meta http-equiv="X-Frame-Options" content="DENY">
```

### Dynamic CSP Injection

```javascript
import { getCSPMetaContent } from './config/csp.js';

// For meta tag (excludes frame-ancestors)
const meta = document.createElement('meta');
meta.httpEquiv = 'Content-Security-Policy';
meta.content = getCSPMetaContent(true); // No frame-ancestors
document.head.appendChild(meta);
```

### HTTP Header Configuration (Full CSP Support)

When you control the server and can set HTTP headers, use the full CSP with `frame-ancestors`:

#### Express.js

```javascript
import { getAllSecurityHeaders } from './config/csp.js';

app.use((req, res, next) => {
  // includeFrameAncestors=true for HTTP headers
  const headers = getAllSecurityHeaders(true, true);
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
});
```

#### Nginx

```nginx
location / {
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; frame-ancestors 'none';";
  add_header X-Content-Type-Options "nosniff";
  add_header X-Frame-Options "DENY";
  add_header X-XSS-Protection "1; mode=block";
}
```

#### Apache

```apache
Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; frame-ancestors 'none';"
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "DENY"
Header set X-XSS-Protection "1; mode=block"
```

### CSP Configuration Summary

| Directive | Meta Tag | HTTP Header | Notes |
|-----------|----------|-------------|-------|
| `default-src` | ✅ | ✅ | Fallback for unspecified directives |
| `script-src` | ✅ | ✅ | Controls JavaScript sources |
| `style-src` | ✅ | ✅ | Controls CSS sources |
| `img-src` | ✅ | ✅ | Controls image sources |
| `connect-src` | ✅ | ✅ | Controls fetch/XHR destinations |
| `font-src` | ✅ | ✅ | Controls font sources |
| `base-uri` | ✅ | ✅ | Restricts `<base>` tag |
| `form-action` | ✅ | ✅ | Restricts form submission |
| `frame-ancestors` | ❌ | ✅ | **HTTP header only!** |

**Recommendation**: Use `X-Frame-Options: DENY` alongside CSP for defense-in-depth, as it's supported in both meta tags and HTTP headers.

## 3. API Rate Limiting

### Basic Usage

```javascript
import RateLimiter from './utils/rate-limiter.js';

// Create limiter
const nominatimLimiter = new RateLimiter({
  maxRequests: 60,    // 60 requests
  interval: 60000,    // per minute
  name: 'Nominatim'
});

// Schedule API call
const data = await nominatimLimiter.schedule(async () => {
  const response = await fetch('https://nominatim.openstreetmap.org/reverse?...');
  return response.json();
});
```

### Pre-configured Limiters

```javascript
import { createDefaultLimiters } from './utils/rate-limiter.js';

const limiters = createDefaultLimiters();

// Use Nominatim limiter
const address = await limiters.nominatim.schedule(async () => {
  const response = await fetch(nominatimUrl);
  return response.json();
});

// Use IBGE limiter
const cityData = await limiters.ibge.schedule(async () => {
  const response = await fetch(ibgeUrl);
  return response.json();
});
```

### Integration with ReverseGeocoder

```javascript
import ReverseGeocoder from './services/ReverseGeocoder.js';
import { createDefaultLimiters } from './utils/rate-limiter.js';

const limiters = createDefaultLimiters();

class RateLimitedReverseGeocoder extends ReverseGeocoder {
  async fetch() {
    return limiters.nominatim.schedule(() => super.fetch());
  }
}
```

### Monitoring Statistics

```javascript
// Get rate limiter statistics
const stats = nominatimLimiter.getStats();
console.log(`Total requests: ${stats.totalRequests}`);
console.log(`Queued requests: ${stats.queuedRequests}`);
console.log(`Average wait time: ${stats.averageWaitTime}ms`);
console.log(`Current tokens: ${stats.currentTokens}`);
console.log(`Utilization rate: ${stats.utilizationRate}%`);
```

## 4. Production Checklist

Before deploying to production:

- [ ] Create `.env` file with production values
- [ ] Ensure `.env` is in `.gitignore`
- [ ] Set `CSP_ENABLED=true` in environment
- [ ] Configure CSP headers on web server
- [ ] Set `DEBUG_MODE=false`
- [ ] Set appropriate rate limits
- [ ] Test all API calls with rate limiting
- [ ] Verify CSP doesn't block legitimate resources
- [ ] Enable HTTPS
- [ ] Test geolocation on HTTPS

## 5. Development vs Production

### Development Mode

- Relaxed CSP (allows `unsafe-eval` for hot reload)
- Higher log verbosity
- Rate limiting statistics visible
- Debug mode enabled

### Production Mode

- Strict CSP (minimal `unsafe-inline` only where necessary)
- Error logging only
- Rate limiting enforced
- Analytics enabled (if configured)

## 6. Troubleshooting

### CSP Violations

Check browser console for CSP violation reports:

```
Refused to load the script 'https://example.com/script.js' 
because it violates the following Content Security Policy directive: "script-src 'self'"
```

**Solution**: Add the domain to the appropriate CSP directive in `src/config/csp.js`.

### Rate Limiting Errors

```
Error: Rate limiter queue full for Nominatim (max: 100)
```

**Solution**: Increase `maxQueueSize` or reduce request frequency.

### Environment Variables Not Loading

- Browser: Ensure `window.__ENV__` is set before app initialization
- Node.js: Check `.env` file exists and is readable

## 7. Security Best Practices

1. **Never commit `.env` to version control**
2. **Use HTTPS in production** (geolocation requires secure context)
3. **Rotate API keys regularly** (if applicable)
4. **Monitor rate limit statistics** to detect unusual patterns
5. **Keep CSP directives minimal** (only add sources as needed)
6. **Review security headers periodically**
7. **Test CSP in development** before deploying

## 8. References

- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)

---

**Last Updated**: 2026-02-15  
**Version**: 0.11.0-alpha
