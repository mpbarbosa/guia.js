# Ibira.js Integration Guide

## Overview

This project integrates [ibira.js](https://github.com/mpbarbosa/ibira.js) v0.2.1-alpha for API fetching and caching capabilities.

## Integration Strategy

The integration uses a **three-tier fallback approach**:

1. **CDN (Primary)** - Loads from jsDelivr CDN (browser only)
2. **Local Node Module (Fallback)** - Uses installed npm package
3. **Minimal Fallback (Last Resort)** - Provides stub implementation if both fail

## CDN Configuration

### Production URL (Recommended)
```javascript
https://cdn.jsdelivr.net/gh/mpbarbosa/ibira.js@0.2.1-alpha/src/index.js
```

**Benefits:**
- ✅ Specific version pinning (0.2.1-alpha)
- ✅ Global CDN with 750+ locations
- ✅ Automatic compression (Brotli/Gzip)
- ✅ HTTP/2 and HTTP/3 support
- ✅ No npm installation required for browser usage

### HTML Usage (Optional)
If you want to preload ibira.js before guia.js loads:

```html
<!-- Preload ibira.js from CDN -->
<link rel="modulepreload" href="https://cdn.jsdelivr.net/gh/mpbarbosa/ibira.js@0.2.1-alpha/src/index.js">

<!-- Then load guia.js which will use the cached version -->
<script type="module" src="src/guia.js"></script>
```

## Local Module Fallback

### Installation
```bash
npm install mpbarbosa/ibira.js
```

### When It's Used
- Node.js environments (no CDN support)
- CDN fails to load (network issues, timeout, etc.)
- Browser with CDN blocked

## Implementation Details

### Loading Logic (in `src/guia.js`)

```javascript
const ibiraLoadingPromise = (async () => {
    try {
        // 1. Try CDN first (browser only)
        if (typeof window !== 'undefined') {
            const importPromise = import('https://cdn.jsdelivr.net/gh/mpbarbosa/ibira.js@0.2.1-alpha/src/index.js');
            const ibiraModule = await Promise.race([importPromise, timeoutPromise]);
            // Success: return { success: true, source: 'cdn', manager }
        }
        
        // 2. Fallback to local module
        const ibiraModule = await import('ibira.js');
        // Success: return { success: true, source: 'local', manager }
        
    } catch (error) {
        // 3. Use minimal fallback
        // Returns stub implementation
    }
})();
```

### Timeout Configuration
- **CDN timeout:** 5 seconds
- If CDN doesn't respond within 5s, automatically falls back to local module

### Accessing IbiraAPIFetchManager

The loading happens asynchronously. To use `IbiraAPIFetchManager`:

```javascript
// Wait for ibira.js to load
await window.ibiraLoadingPromise;

// Now you can use it
const manager = new IbiraAPIFetchManager({
    baseUrl: 'https://api.example.com',
    cacheTimeout: 300000 // 5 minutes
});

const data = await manager.fetch('/endpoint');
```

## Exported Variables

The following are available globally after guia.js loads:

- `window.ibiraLoadingPromise` - Promise that resolves when loading completes
- `window.IbiraAPIFetchManager` - The manager class (after promise resolves)

## API Usage Examples

### Basic Fetch
```javascript
const manager = new IbiraAPIFetchManager();
const data = await manager.fetch('https://api.example.com/data');
console.log(data);
```

### With Caching
```javascript
const manager = new IbiraAPIFetchManager({
    cacheTimeout: 300000 // Cache for 5 minutes
});

// First call - fetches from API
const data1 = await manager.fetch('https://api.example.com/data');

// Second call - returns from cache
const data2 = await manager.fetch('https://api.example.com/data');
```

### With Observer Pattern
```javascript
const observer = {
    update: (data) => {
        console.log('Data updated:', data);
    }
};

manager.subscribe(observer);
```

## Version Information

- **ibira.js version:** 0.2.1-alpha
- **CDN Provider:** jsDelivr
- **Integration date:** 2025-12-15
- **Status:** ✅ Active

## Troubleshooting

### CDN Not Loading
**Symptoms:** Console warning "CDN load failed"

**Solution:** The system automatically falls back to local module. Ensure ibira.js is installed:
```bash
npm install mpbarbosa/ibira.js
```

### Local Module Not Found
**Symptoms:** Console warning "Local module load failed"

**Solution:** Install the package:
```bash
npm install mpbarbosa/ibira.js
```

### Fallback Implementation Active
**Symptoms:** Console warning "Using fallback - ibira.js not available"

**Solution:** This means both CDN and local module failed. Check:
1. Internet connectivity (for CDN)
2. npm dependencies are installed
3. Node modules are not corrupted

### Checking Load Status
```javascript
window.ibiraLoadingPromise.then(result => {
    console.log('Load result:', result);
    // { success: true, source: 'cdn' | 'local' | 'fallback', manager: <class> }
});
```

## Testing

### Test CDN Loading
Open browser console on any HTML page:
```javascript
await window.ibiraLoadingPromise;
console.log('Ibira loaded successfully');
```

### Test Local Module
Run in Node.js:
```bash
node -e "import('ibira.js').then(m => console.log('Loaded:', m.IbiraAPIFetchManager))"
```

## Migration Notes

If you need to upgrade to a newer version:

1. Update CDN URL in `src/guia.js`:
   ```javascript
   // Change @0.2.1-alpha to new version
   import('https://cdn.jsdelivr.net/gh/mpbarbosa/ibira.js@NEW_VERSION/src/index.js')
   ```

2. Update npm package:
   ```bash
   npm install mpbarbosa/ibira.js@NEW_VERSION
   ```

3. Test both CDN and local loading

## Resources

- **ibira.js Repository:** https://github.com/mpbarbosa/ibira.js
- **CDN URLs:** https://github.com/mpbarbosa/ibira.js/blob/main/cdn-urls.txt
- **jsDelivr Docs:** https://www.jsdelivr.com/?docs=gh
- **API Documentation:** https://github.com/mpbarbosa/ibira.js/blob/main/docs/INDEX.md

## Security Notes

### CDN Security
- jsDelivr uses HTTPS with valid SSL certificates
- Consider adding SRI (Subresource Integrity) for production:
  ```html
  <script src="CDN_URL" integrity="sha384-HASH" crossorigin="anonymous"></script>
  ```

### Generate SRI Hash
```bash
curl -s CDN_URL | openssl dgst -sha384 -binary | openssl base64 -A
```

## Performance Tips

1. **Use specific versions** - Don't use `@latest` or branch names in production
2. **Leverage browser caching** - CDN files are cached by browsers
3. **Preload if critical** - Use `<link rel="modulepreload">` for critical paths
4. **Monitor fallback usage** - Check logs for CDN failures
5. **Keep local module updated** - Sync with CDN version

## License

Both guia.js and ibira.js are MIT licensed.
