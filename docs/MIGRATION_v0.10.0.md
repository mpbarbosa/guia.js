# Migration Guide — v0.10.0-alpha

This guide covers breaking changes and migration steps for upgrading
to **v0.10.0-alpha** of Guia Turístico.

## Summary

v0.10.0-alpha introduced `HomeViewController` as a dedicated view controller
for the home route (`#/`), replacing inline initialization logic that was
previously embedded in `src/app.js`.

## Breaking Changes

### `WebGeocodingManager` method deprecations

The following `WebGeocodingManager` methods are deprecated and will be removed
in a future release. Use `HomeViewController` instead:

| Deprecated method | Replacement |
|-------------------|-------------|
| `getSingleLocationUpdate()` | `homeView.getSingleLocationUpdate()` |
| `startTracking()` | `homeView.startTracking()` |
| `stopTracking()` | `homeView.stopTracking()` |
| `initSpeechSynthesis()` | Handled internally by `HomeViewController` |

## Migration Steps

### Before (v0.9.x)

```javascript
const manager = new WebGeocodingManager(document, 'map');
await manager.getSingleLocationUpdate();
manager.startTracking();
```

### After (v0.10.0-alpha)

```javascript
const homeView = await HomeViewController.create(document, params);
await homeView.getSingleLocationUpdate();
homeView.startTracking();
```

## `HomeViewController` API

```javascript
// Factory method (recommended)
const homeView = await HomeViewController.create(document, params);

// Lifecycle
await homeView.init();
homeView.destroy();

// Location
await homeView.getSingleLocationUpdate();
homeView.startTracking();
homeView.stopTracking();
homeView.toggleTracking();
homeView.isTracking(); // → boolean
```

## Related Files

- `src/views/home.js` — HomeViewController implementation
- `src/coordination/WebGeocodingManager.js` — deprecated methods
- `CHANGELOG.md` — full version history
