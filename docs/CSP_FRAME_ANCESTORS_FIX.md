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
