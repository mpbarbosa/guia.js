# Migration Guide: v0.9.0 → v0.10.0-alpha

**Published**: 2026-02-15
**Status**: Active
**Scope**: HomeViewController introduction and WebGeocodingManager refactoring

---

## Overview

Version 0.10.0-alpha introduces the **HomeViewController** to manage home view location tracking logic, replacing inline code in `app.js`. This establishes a consistent view controller pattern across the application (HomeViewController + ConverterViewController).

### What Changed

- ✅ **New**: `HomeViewController` class (672 lines, src/views/home.js)
- ⚠️ **Deprecated**: 4 WebGeocodingManager tracking methods (backward compatible)
- ✅ **Refactored**: app.js simplified from 664 → 645 lines (-2.9%)
- ✅ **Tests**: 70 new tests for HomeViewController (100% coverage)

### Breaking Changes

**None** - All changes are backward compatible with deprecation warnings.

---

## Who Needs to Migrate

### ✅ You Should Migrate If

- You instantiate `WebGeocodingManager` directly for location tracking
- You call `getSingleLocationUpdate()`, `startTracking()`, or `stopTracking()` on WebGeocodingManager
- You're building a new feature that requires location tracking
- You want to follow current best practices

### ❌ Migration Not Required If

- You only use the converter view (`src/views/converter.js`)
- You don't directly interact with WebGeocodingManager
- You're okay with deprecation warnings (methods still work)

---

## Migration Steps

### Step 1: Update Imports

**Before (v0.9.0)**:

```javascript
import { WebGeocodingManager } from './coordination/WebGeocodingManager.js';
import { Chronometer } from './timing/Chronometer.js';
```

**After (v0.10.0)**:

```javascript
import { HomeViewController } from './views/home.js';
// WebGeocodingManager and Chronometer now initialized by HomeViewController
```

### Step 2: Update Initialization

**Before (v0.9.0)** - Manual setup in app.js:

```javascript
// Create WebGeocodingManager
const manager = new WebGeocodingManager(document, {
    locationResult: 'location-result',
    positionDisplay: 'position-display',
    enderecoPadronizadoDisplay: 'endereco-padronizado-display',
    referencePlaceDisplay: 'reference-place-display'
});

// Initialize Chronometer
const chronometer = new Chronometer({
    document: document,
    displayElementId: 'current-time-display',
    updateInterval: 1000,
    timezone: 'America/Sao_Paulo'
});

// Start tracking
manager.startTracking();
```

**After (v0.10.0)** - HomeViewController handles everything:

```javascript
// Create HomeViewController
const homeController = new HomeViewController(document, {
    locationResult: 'location-result',
    positionDisplay: 'position-display',
    enderecoPadronizadoDisplay: 'endereco-padronizado-display',
    referencePlaceDisplay: 'reference-place-display',
    chronometerDisplay: 'current-time-display',
    autoStartTracking: true  // Automatically starts tracking after init
});

// Initialize (async)
await homeController.init();
// Tracking is now active if autoStartTracking: true
```

### Step 3: Update Method Calls

**Before (v0.9.0)**:

```javascript
// Single position update
await manager.getSingleLocationUpdate();

// Start continuous tracking
manager.startTracking();

// Stop tracking
manager.stopTracking();

// Initialize speech synthesis
manager.initSpeechSynthesis();
```

**After (v0.10.0)**:

```javascript
// Single position update
await homeController.getSingleLocationUpdate();

// Start continuous tracking
homeController.startTracking();

// Stop tracking
homeController.stopTracking();

// Toggle tracking (convenience method)
homeController.toggleTracking();

// Speech synthesis - automatic in startTracking()
// No manual call needed
```

### Step 4: Update State References

**Before (v0.9.0)**:

```javascript
AppState.manager = manager;
if (AppState.manager) {
    AppState.manager.stopTracking();
}
```

**After (v0.10.0)**:

```javascript
AppState.homeController = homeController;
if (AppState.homeController) {
    AppState.homeController.stopTracking();
}
```

### Step 5: Update Cleanup Code

**Before (v0.9.0)**:

```javascript
// Manual cleanup
if (manager) {
    manager.stopTracking();
    // No destroy method
}
```

**After (v0.10.0)**:

```javascript
// Proper lifecycle management
if (homeController) {
    homeController.destroy();  // Stops tracking, removes listeners, cleans up
}
```

---

## API Reference

### HomeViewController Constructor

```javascript
constructor(document, params = {})
```

**Parameters**:

- `document` (Document, required): DOM document object
- `params.locationResult` (string|Element, required): Location result container ID or element
- `params.positionDisplay` (string|Element, optional): Position display container
- `params.enderecoPadronizadoDisplay` (string|Element, optional): Address display container
- `params.referencePlaceDisplay` (string|Element, optional): Reference place display container
- `params.chronometerDisplay` (string|Element, optional): Chronometer display container
- `params.autoStartTracking` (boolean, default: false): Auto-start tracking after init
- `params.manager` (WebGeocodingManager, optional): Dependency injection for testing
- `params.chronometer` (Chronometer, optional): Dependency injection for testing

**Throws**:

- `Error` if `document` is missing
- `Error` if `params.locationResult` is missing

### HomeViewController Methods

#### `async init()`

Initialize the controller (creates WebGeocodingManager and Chronometer).

**Returns**: `Promise<void>`
**Throws**: `Error` if already initialized

```javascript
await homeController.init();
```

#### `async getSingleLocationUpdate()`

Capture a single position update.

**Returns**: `Promise<GeoPosition>`
**Throws**: `Error` if not initialized

```javascript
const position = await homeController.getSingleLocationUpdate();
console.log(position.latitude, position.longitude);
```

#### `startTracking()`

Start continuous location tracking.

**Returns**: `void`
**Throws**: `Error` if not initialized

```javascript
homeController.startTracking();
```

#### `stopTracking()`

Stop continuous location tracking.

**Returns**: `void`
**Throws**: `Error` if not initialized

```javascript
homeController.stopTracking();
```

#### `toggleTracking()`

Toggle tracking on/off (convenience method).

**Returns**: `void`
**Throws**: `Error` if not initialized

```javascript
// Stop if tracking, start if not
homeController.toggleTracking();
```

#### `destroy()`

Clean up resources (stops tracking, removes event listeners).

**Returns**: `void`

```javascript
homeController.destroy();
```

#### `isTracking()`

Check if currently tracking.

**Returns**: `boolean`

```javascript
if (homeController.isTracking()) {
    console.log('Currently tracking location');
}
```

#### `toString()`

Get string representation.

**Returns**: `string`

```javascript
console.log(homeController.toString());
// Output: "HomeViewController{initialized: true, tracking: true}"
```

### Static Factory Method

#### `static async create(document, params = {})`

Create and initialize a HomeViewController in one step.

**Returns**: `Promise<HomeViewController>`

```javascript
// One-step creation and initialization
const homeController = await HomeViewController.create(document, {
    locationResult: 'location-result',
    autoStartTracking: true
});
```

---

## Code Examples

### Example 1: Basic Setup

```javascript
import { HomeViewController } from './views/home.js';

// Create and initialize
const homeController = new HomeViewController(document, {
    locationResult: 'location-result',
    autoStartTracking: true
});

await homeController.init();
// Tracking is now active
```

### Example 2: Manual Tracking Control

```javascript
import { HomeViewController } from './views/home.js';

// Create without auto-start
const homeController = new HomeViewController(document, {
    locationResult: 'location-result',
    autoStartTracking: false
});

await homeController.init();

// Start tracking when user clicks button
document.getElementById('start-btn').addEventListener('click', () => {
    homeController.startTracking();
});

// Stop tracking when user clicks button
document.getElementById('stop-btn').addEventListener('click', () => {
    homeController.stopTracking();
});
```

### Example 3: Using Static Factory

```javascript
import { HomeViewController } from './views/home.js';

// Create and initialize in one step
const homeController = await HomeViewController.create(document, {
    locationResult: 'location-result',
    positionDisplay: 'position-display',
    autoStartTracking: true
});

// Ready to use immediately
console.log('Tracking:', homeController.isTracking());
```

### Example 4: Proper Cleanup

```javascript
import { HomeViewController } from './views/home.js';

let homeController = null;

// Initialize
async function initHome() {
    homeController = await HomeViewController.create(document, {
        locationResult: 'location-result',
        autoStartTracking: true
    });
}

// Cleanup on route change
function cleanupHome() {
    if (homeController) {
        homeController.destroy();  // Stops tracking, removes listeners
        homeController = null;
    }
}

// Route transitions
async function loadRoute(route) {
    cleanupHome();  // Clean up previous view

    if (route === '/') {
        await initHome();
    }
}
```

---

## Deprecation Warnings

### Warning Messages

When you call deprecated methods, you'll see console warnings:

```
⚠️ getSingleLocationUpdate() is deprecated as of v0.10.0-alpha
   Use HomeViewController.getSingleLocationUpdate() instead.

   OLD: manager.getSingleLocationUpdate()
   NEW: homeController.getSingleLocationUpdate()

   This method will be removed in v1.0.0
```

### Suppressing Warnings (Not Recommended)

If you need to temporarily suppress warnings:

```javascript
// Save original warn function
const originalWarn = console.warn;

// Suppress warnings
console.warn = () => {};

// Call deprecated method
manager.getSingleLocationUpdate();

// Restore original warn
console.warn = originalWarn;
```

**Warning**: Suppressing deprecation warnings is not recommended. Migrate to the new API instead.

---

## Testing

### Unit Tests

HomeViewController has 70 comprehensive unit tests:

```bash
# Run HomeViewController tests only
npm test -- __tests__/views/home.test.js

# Expected output:
# Tests: 70 passing, 70 total
# Time: ~2 seconds
```

### Integration Tests

Test your migrated code:

```javascript
import { HomeViewController } from './views/home.js';

describe('Home View Integration', () => {
    test('should initialize and start tracking', async () => {
        const homeController = new HomeViewController(document, {
            locationResult: 'location-result',
            autoStartTracking: true
        });

        await homeController.init();

        expect(homeController.isTracking()).toBe(true);

        homeController.destroy();
    });
});
```

---

## Troubleshooting

### Issue: "document is required"

**Problem**: Missing document parameter in constructor.

**Solution**:

```javascript
// ❌ Wrong
const controller = new HomeViewController({ locationResult: 'location-result' });

// ✅ Correct
const controller = new HomeViewController(document, { locationResult: 'location-result' });
```

### Issue: "params.locationResult is required"

**Problem**: Missing locationResult parameter.

**Solution**:

```javascript
// ❌ Wrong
const controller = new HomeViewController(document);

// ✅ Correct
const controller = new HomeViewController(document, { locationResult: 'location-result' });
```

### Issue: "HomeViewController not initialized"

**Problem**: Calling methods before `init()`.

**Solution**:

```javascript
// ❌ Wrong
const controller = new HomeViewController(document, { locationResult: 'location-result' });
controller.startTracking();  // Error!

// ✅ Correct
const controller = new HomeViewController(document, { locationResult: 'location-result' });
await controller.init();  // Initialize first
controller.startTracking();  // Now works
```

### Issue: Deprecation warnings in console

**Problem**: Using deprecated WebGeocodingManager methods.

**Solution**: Migrate to HomeViewController (see migration steps above).

---

## Timeline

- **v0.10.0-alpha** (2026-02-15): HomeViewController introduced, methods deprecated
- **v0.11.0 - v0.99.0**: Deprecation period (warnings continue)
- **v1.0.0** (TBD): Deprecated methods fully removed

**Recommendation**: Migrate during v0.10.0 - v0.99.0 to avoid breaking changes in v1.0.0.

---

## Support

- **Documentation**: See [HomeViewController JSDoc](../src/views/home.js)
- **Examples**: See [examples/](../examples/)
- **Issues**: Report bugs at [GitHub Issues](https://github.com/mpbarbosa/guia_turistico/issues)
- **Tests**: Reference [**tests**/views/home.test.js](../__tests__/views/home.test.js)

---

## Checklist

Use this checklist to track your migration progress:

- [ ] Updated imports (removed WebGeocodingManager, Chronometer)
- [ ] Replaced WebGeocodingManager instantiation with HomeViewController
- [ ] Called `init()` before using tracking methods
- [ ] Updated method calls (getSingleLocationUpdate, startTracking, stopTracking)
- [ ] Updated state references (AppState.manager → AppState.homeController)
- [ ] Added destroy() calls for cleanup
- [ ] Tested migrated code
- [ ] Verified no deprecation warnings
- [ ] Updated documentation/comments

---

**Last Updated**: 2026-02-15
**Version**: 0.10.0-alpha
**Status**: ✅ Active
