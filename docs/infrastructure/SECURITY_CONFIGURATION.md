## CSP_FRAME_ANCESTORS_FIX

# CSP Frame-Ancestors Fix

## Problem

The browser console was showing this warning:

```
The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element.
```

## Root Cause

The `frame-ancestors` CSP directive **cannot be used in HTML `<meta>` tags**. According to the CSP specification, this directive is only effective when delivered via HTTP response headers.

## Solution

### Changes Made

1. **Removed `frame-ancestors` from meta tag CSP configurations** (`src/config/csp.js`):
   - Removed from `productionCSP` object
   - Removed from `developmentCSP` object
   - Added explanatory comments

2. **Created HTTP-only CSP configuration**:
   - New `httpOnlyCSP` export containing `frame-ancestors`
   - New `getCSPHeadersWithFrameAncestors()` function for servers

3. **Enhanced security with X-Frame-Options**:
   - Already present in `securityHeaders`
   - Provides clickjacking protection for meta tag deployments
   - Added clarifying documentation

4. **Updated tests** (`__tests__/config/csp.test.js`):
   - Tests verify `frame-ancestors` is NOT in meta content
   - Tests verify `frame-ancestors` IS in HTTP header version
   - Added new test suite for HTTP-only directives

5. **Updated documentation** (`docs/SECURITY_CONFIGURATION.md`):
   - Added warning about meta tag limitations
   - Provided comparison table
   - Updated all examples

### API Changes

**For Static Hosting (Meta Tags):**

```javascript
import { getCSPMetaContent } from './config/csp.js';

// Returns CSP without frame-ancestors (safe for meta tags)
const csp = getCSPMetaContent(true);
```

**For HTTP Servers:**

```javascript
import { getAllSecurityHeaders } from './config/csp.js';

// includeFrameAncestors=true adds frame-ancestors directive
const headers = getAllSecurityHeaders(true, true);
```

### Defense-in-Depth

The application now uses **two layers** of clickjacking protection:

1. **X-Frame-Options: DENY** - Works in both meta tags and headers
2. **frame-ancestors 'none'** - Only in HTTP headers (when available)

This ensures protection regardless of deployment method.

## Browser Compatibility

| Feature | Meta Tag | HTTP Header |
|---------|----------|-------------|
| X-Frame-Options | ✅ Supported | ✅ Supported |
| frame-ancestors | ❌ Ignored | ✅ Supported |

## Testing

All 23 CSP tests pass:

```bash
npm test -- __tests__/config/csp.test.js
```

Key tests:

- ✅ Meta content excludes frame-ancestors
- ✅ HTTP headers include frame-ancestors
- ✅ X-Frame-Options present for fallback
- ✅ All other CSP directives work in both modes

## References

- [MDN: frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors)
- [CSP Level 3 Specification](https://www.w3.org/TR/CSP3/#directive-frame-ancestors)
- [X-Frame-Options MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)

## Migration Guide

### If you're using meta tags (current setup)

✅ **No action required** - The fix is automatic. X-Frame-Options provides protection.

### If you're deploying to a server with HTTP header control

Consider using `getAllSecurityHeaders(true, true)` to enable `frame-ancestors` for enhanced security:

```javascript
// Express.js example
app.use((req, res, next) => {
  const headers = getAllSecurityHeaders(true, true); // includeFrameAncestors=true
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
});
```

---

**Fixed in version**: 0.9.0-alpha
**Date**: 2026-02-16

---

## SECURITY_CONFIGURATION

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
