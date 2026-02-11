# Browser Cache Clearing Guide

## Issues Fixed - Complete Summary

### 1. Variable Shadowing Errors (TypeError: error is not a function)
**Files Fixed**:
- ✅ `src/app.js` - 4 instances (lines 75, 203, 423, 565)
- ✅ `src/services/GeolocationService.js` - 2 instances (lines 453, 515)
- ✅ `src/views/home.js` - 1 instance (line 376)

**Total**: 7 error handlers fixed across 3 files

### 2. Missing Files (404 Errors)
- ✅ `manifest.json` - Now inline Base64 manifest (no external file needed)
- ✅ `service-worker.js` - Graceful detection and fallback for development mode

## Files Changed

### app.js
- Already had: `import { log, warn, error } from './utils/logger.js'`
- Fixed: Renamed 4 `catch (error)` blocks to `catch (err)`
- Lines: 75, 203, 423, 565

### GeolocationService.js
- Added: `error` to import statement
- Fixed: Renamed 2 callback parameters from `(error) =>` to `(err) =>`
- Lines: 453, 515

### home.js
- Already had: `import { log, warn, error } from '../utils/logger.js'`
- Fixed: Renamed 1 callback parameter from `(error) =>` to `(err) =>`
- Line: 376

### index.html
- **Manifest**: Changed from external `/manifest.json` to inline Base64 data URI
  - Prevents 404 error
  - Contains minimal PWA manifest: `{"name":"Guia Turístico","short_name":"Guia","start_url":"/","display":"standalone","background_color":"#ffffff","theme_color":"#2563eb","icons":[]}`
- **Service Worker**: Added HEAD request check before registration
  - Only registers if `service-worker.js` exists
  - Graceful fallback for development mode
  - No more console errors if file missing

## How to Clear Browser Cache

### Chrome/Edge
1. Open DevTools (F12)
2. Right-click on the Refresh button
3. Select "Empty Cache and Hard Reload"

**OR**

1. Press `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)
2. Select "Cached images and files"
3. Click "Clear data"

### Firefox
1. Press `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)
2. Select "Cache"
3. Click "Clear Now"

### Safari
1. Press `Cmd+Option+E` to empty caches
2. Reload the page

## Verify Fix Applied

After clearing cache, check browser console. You should **NOT** see:
```
TypeError: error is not a function at GeolocationService.js:453:6
TypeError: error is not a function at GeolocationService.js:515:5
TypeError: error is not a function at home.js:376
```

## Alternative: Disable Cache During Development

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Disable cache"
4. Keep DevTools open while testing

### Firefox DevTools
1. Open DevTools (F12)
2. Click Settings (gear icon)
3. Check "Disable HTTP Cache (when toolbox is open)"

## Server-Side Solution

If running local server, restart it to ensure fresh files:

```bash
# Kill existing server
ps aux | grep "python3 -m http.server"
kill <PID>

# Start fresh server
cd /path/to/guia_turistico/src
python3 -m http.server 9000
```

## Files Changed Summary

### GeolocationService.js
- Added `error` to imports from `../utils/logger.js`
- Renamed error callback parameter from `error` to `err` (2 occurrences)

### home.js
- Already imported `error` from `../utils/logger.js`
- Renamed error callback parameter from `error` to `err` (1 occurrence)

## Technical Explanation

**Variable Shadowing**: When a callback parameter has the same name as an imported function, the parameter "shadows" (hides) the function, making it inaccessible within that scope.

**Before (broken)**:
```javascript
import { error } from '../utils/logger.js';

.catch((error) => {
  error("Log this", error); // ❌ error is the parameter, not the function!
})
```

**After (fixed)**:
```javascript
import { error } from '../utils/logger.js';

.catch((err) => {
  error("Log this", err); // ✅ error is the function, err is the parameter
})
```
