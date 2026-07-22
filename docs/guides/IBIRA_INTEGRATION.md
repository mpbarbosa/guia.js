# Ibira.js Integration Guide

## Overview

This project integrates [ibira.js](https://github.com/mpbarbosa/ibira.js) for API fetching and caching capabilities. It is installed as an npm dependency (`ibira.js@^0.5.0`) and bundled by Vite.

> **History:** ibira.js was previously loaded at runtime from the jsDelivr CDN with a `node_modules` fallback. Since it is now published to npm, the app depends on it directly and Vite bundles it — there is no runtime CDN fetch.

## Integration Strategy

The integration uses a **two-tier approach**:

1. **Bundled Module (Primary)** - `ibira.js` is resolved from `node_modules` and bundled into the app by Vite.
2. **Minimal Fallback (Last Resort)** - Provides a stub implementation if the module fails to load (e.g. in tests where it is absent).

## Installation

ibira.js is a normal dependency — `npm install` pulls it from the npm registry:

```bash
npm install ibira.js
```

It is declared in `package.json`:

```json
"dependencies": {
  "ibira.js": "^0.5.0"
}
```

## Implementation Details

### Loading Logic (in `src/guia.ts`)

```javascript
const ibiraLoadingPromise = (async () => {
    try {
        // Bundled npm dependency — Vite/Rollup resolves this from node_modules
        const ibiraModule = await import('ibira.js');
        // Success: return { success: true, source: 'local', manager }
    } catch (error) {
        // Minimal fallback: returns stub implementation
    }
})();
```

### HTML Preload (optional)

An inline module script in `src/index.html` eagerly loads `ibira.js` (also a bare
`import('ibira.js')`, bundled by Vite) and assigns `window.IbiraAPIFetchManager`
so it is available before `guia.js` initializes.

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

- **ibira.js version:** 0.5.0 (npm)
- **Registry:** npm (`ibira.js`)
- **Status:** ✅ Active

## Troubleshooting

### Module Not Found

**Symptoms:** Console warning "Local module load failed"

**Solution:** Install dependencies:

```bash
npm install
```

### Fallback Implementation Active

**Symptoms:** Console warning "Using fallback - ibira.js not available"

**Solution:** This means the module failed to load. Check:

1. npm dependencies are installed (`npm install`)
2. Node modules are not corrupted

### Checking Load Status

```javascript
window.ibiraLoadingPromise.then(result => {
    console.log('Load result:', result);
    // { success: true, source: 'local' | 'fallback', manager: <class> }
});
```

## Testing

### Test Loading (browser)

Open browser console on any HTML page:

```javascript
await window.ibiraLoadingPromise;
console.log('Ibira loaded successfully');
```

### Test Local Module (Node.js)

```bash
node -e "import('ibira.js').then(m => console.log('Loaded:', m.IbiraAPIFetchManager))"
```

## Migration Notes

If you need to upgrade to a newer version:

1. Update the npm package:

   ```bash
   npm install ibira.js@NEW_VERSION
   ```

2. Type-check and test (`npm run validate && npm test`)

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
