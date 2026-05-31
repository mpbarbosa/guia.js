# Composition root for view-layer service wiring lives in WebGeocodingManager

View controllers (`HomeViewController`, `ConverterViewController`) must not
import service-layer modules (`RouteNavigationService`, `OfflineCacheService`)
directly. All orchestration flows through `WebGeocodingManager`, which owns the
service wiring and exposes a stable surface to view controllers. This keeps the
view layer responsible only for Vue/DOM lifecycle concerns, not for constructing
or coordinating services.

## Considered options

**Option A (chosen):** View controllers call `WebGeocodingManager.planRoute()`,
`getLatestLocationSnapshot()`, and `saveLocationSnapshot()` — thin delegating
methods added in Architecture Refactor Phase 2.

**Option B (rejected):** View controllers import service functions directly.
Rejected because it scattered service ownership across the view layer, made
the coordination boundary invisible to future contributors, and required every
test that exercises view behaviour to also mock service-layer internals.

## Consequences

- Service functions in `RouteNavigationService` and `OfflineCacheService` carry
  a module-level note directing view-layer readers to use `WebGeocodingManager`
  instead of importing them directly.
- `WebGeocodingManager` is the single import a view controller needs for
  orchestration — geolocation, geocoding, route planning, and offline snapshots.
