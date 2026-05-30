# Changelog

All notable changes to Guia Turístico will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.28.2-alpha] - 2026-05-28

### Added

- **Shared coordinator contracts** (`src/types/coordinator-services.ts`):
  - Extracted `ServiceCoordinator` dependency interfaces into a reusable type module
  - Exported `ServiceCoordinatorParams` so coordination-layer callers can share the same constructor contract

### Changed

- **`ServiceCoordinator.ts`**:
  - Replaced file-local dependency interfaces with imports from `src/types/coordinator-services.ts`
- **`WebGeocodingManager.ts`**:
  - Reused the exported `ServiceCoordinatorParams` type instead of an inline constructor shape cast when creating `ServiceCoordinator`
- **Coordinator unit tests**:
  - Typed the existing service mocks against the exported shared coordinator interfaces

## [0.27.3-alpha] - 2026-05-21

### Added

- **MD3 Phase 6 — Map screen** (`src/components/views/MapView.vue`):
  - Replaced Unsplash placeholder image with a real MapLibre GL JS map (`<div id="maplibre-map">`)
  - Address card now shows live `street`, `neighborhood`, and `city` from the `useMapDisplayer` composable
- **`useMapDisplayer` composable** (`src/composables/useMapDisplayer.ts`):
  - First composable in the project; wraps `MapLibreDisplayer` for Vue lifecycle integration
  - Subscribes to `PositionManager` on mount to forward GPS coordinates to `MapLibreDisplayer.updatePosition()`
  - Subscribes to `AddressCache` on mount to expose reactive `street`, `neighborhood`, `city` refs
  - Unsubscribes from both singletons on unmount
- **`MapLibreDisplayer.mount()`** (`src/html/MapLibreDisplayer.ts`):
  - New public method that initialises the MapLibre map immediately (no toggle button required)
  - Calls `resize()` if the map was already initialised, making it safe to call on Vue route re-entry
- **Jest `bessa_patterns.ts` mapping** (`package.json`): added `moduleNameMapper` entry pointing to the local sibling repo so tests that transitively import `AddressCache` no longer fail to resolve the package

### Tests

- `test/html/MapLibreDisplayer.test.js`: 4 new tests for `mount()` (22 total)
- `test/composables/useMapDisplayer.test.js`: 12 new unit tests covering initial state, subscription lifecycle, position forwarding, address reactivity, and cleanup on unmount

## [0.25.0-alpha] - 2026-05-21

### Changed

- **MD3 Phase 5 — ConverterView template aligned to spec** (`src/components/ConverterView.vue`):
  - Main card: `rounded-t-[40px]` bottom-sheet → `rounded-3xl border-outline-variant shadow-sm`
  - Result highlight cards: `bg-surface p-4` → `bg-white p-6 shadow-sm` (matches `LocationHighlightCards` pattern)
  - Result content card: `bg-indigo-50 border-indigo-100` → `bg-white border-outline-variant shadow-sm`
  - Submit button: `py-5` → `py-4`

### Fixed

- **Legacy router 404 for Vue-only routes** (`src/app.ts`): navigating to `#/map`, `#/stats`, or `#/history` no longer renders a 404 panel in `#app-content`; the legacy router now clears that element and lets Vue handle the view

## [0.24.9-alpha] - 2026-04-29

### Added

- **Offline cache foundation** (`src/services/OfflineCacheService.ts`, `src/views/home.ts`):
  - IndexedDB-backed persistence for the latest and recent location/address snapshots
  - Home view now restores the last saved coordinates and standardized address when live data is not yet available
  - Route planner can reuse the last saved location as its implicit origin fallback

### Changed

- **`IBGECityStatsService.ts`**: city-stat lookups now persist successful IBGE responses and reuse them before or after a network failure
- **Offline-first behavior**: cached municipality stats and last-known location data now complement the existing online-first home workflow instead of introducing a separate offline mode

### Fixed

- **Version metadata sync**: `package.json`, `src/config/version.ts`, `src/config/defaults.ts`, `src/app.ts`, and `src/index.html` now consistently reflect `0.24.9-alpha`
- **Release docs**: README, roadmap, and architecture docs now describe the shipped offline-first foundation

## [0.18.0-alpha] - 2026-04-29

### Added

- **Route Navigation MVP** (`src/services/RouteNavigationService.ts`, `src/html/HTMLRoutePlannerPanel.ts`, `src/views/home.ts`, `src/index.html`):
  - Home-view route planner with editable origin and destination fields
  - Current-location fallback when the origin field is left blank
  - Public OSRM driving route calculation with Google Maps and OpenStreetMap handoff links
  - Route summary with distance, duration, and key steps in a dedicated panel

### Changed

- **Home feature panels**: route planning now ships alongside nearby places, city statistics, and the inline map as a first-class utility on the main screen
- **`src/index.html` CSP**: `connect-src` now includes `https://router.project-osrm.org` for public route planning

### Fixed

- **Version metadata sync**: `package.json`, `src/config/version.ts`, `src/config/defaults.ts`, `src/app.ts`, and `src/index.html` now consistently reflect `0.18.0-alpha`
- **Architecture and roadmap docs**: release docs now reflect the TypeScript codebase and the shipped route-planning milestone

## [0.17.2-alpha] - 2026-03-29

### Added

- **Bootstrap 5.3 responsive navbar** (`src/index.html`, `src/app.ts`):
  - `<nav class="navbar navbar-expand-md app-navbar">` inserted above main content
  - **Início** (`#/`) and **Conversor** (`#/converter`) nav links with Bootstrap Icons
  - Hamburger toggle (`navbar-expand-md`) for mobile viewports
  - Active route highlighted with `.active` class and `aria-current="page"`
  - Mobile collapse auto-closes after navigation
- **`src/bootstrap-overrides.css`**: Maps Bootstrap CSS custom properties (`--bs-*`) to existing MD3 design tokens (`--md-sys-color-*`), preventing palette conflicts
- **`@types/bootstrap`** dev-dependency for Bootstrap 5 TypeScript types

### Changed

- **`updateActiveNavLink()`** in `src/app.ts`: extended to add/remove `.active` + `aria-current` on `.navbar-nav .nav-link` in addition to legacy selectors; auto-closes mobile menu on route change
- **`vite.config.js`**: Bootstrap assets routed to a dedicated `ui` manual chunk (separate from `vendor`); removed stale `guia.js` from `optimizeDeps.include`
- **`src/navigation.css`**: Removed the 45-line commented-out `.app-navigation` block deprecated since v0.9.0; removed dead mobile media query for `.app-navigation`

### Removed

- **Footer converter links** in `src/index.html`: the `<aside class="feature-discovery">` card and the plain `<p>` link for the Converter route were removed — navigation is now handled by the navbar

## [0.13.1-alpha] - 2026-03-27

### Added

- **Nearby Places** (`OverpassService.ts` + `HTMLNearbyPlacesPanel.ts`):
  - Overpass API integration for OSM place search by category (restaurants, pharmacies, hospitals, tourist attractions, cafés, supermarkets)
  - Panel renders results with distance and OSM links
  - Buttons auto-enable when GPS coordinates become available
- **City Statistics** (`IBGECityStatsService.ts` + `HTMLCityStatsPanel.ts`):
  - Live IBGE Localidades + IBGE SIDRA population queries
  - Panel renders population, area (km²), IBGE code with links
  - Municipality name sourced from cached Nominatim result (no extra network call)

### Changed

- **`paraty_geocore.js` dependency** upgraded from `@0.9.2-alpha` to `@0.12.10-alpha`:
  - GeoPosition migrated from CJS to ESM CDN build (resolves browser `SyntaxError`)
  - `GeocodingState` and `ObserverSubject` now exported from CDN; local stubs removed
  - New type declarations: `calculateDistance`, `EARTH_RADIUS_METERS`, `delay`, `withObserver`, `ObserverMixinOptions`, `ObserverMixinResult`, `GeocodingStateSnapshot`
  - `geocodingState.destroy()` → `geocodingState.clear()` (API alignment)
  - Updated CDN URL across all source files, test files, `jest.config.unit.js`, `package.json`, and `src/types/paraty-geocore.d.ts`
- **`ibira.js` dependency** upgraded from `v0.4.13-alpha` to `v0.4.22-alpha`:
  - Updated `src/guia.ts`, `src/index.html`, `package.json`, `src/types/paraty-geocore.d.ts`, and all documentation references
- **`bessa_patterns.ts` dependency** upgraded from `v0.12.13-alpha` to `0.12.16-alpha`:
  - Updated jsDelivr importmap URL in `src/index.html`

### Fixed

- `APP_VERSION.patch` in `src/config/defaults.ts` synced to 12 (was 10)
- Added `"private": true` to `package.json` to suppress npm publish warning
- Fixed broken link to non-existent `FALSE_POSITIVE_PATTERNS.md` in `docs/INDEX.md`
- `navigator.permissions` now restored after each test in `onboarding.test.ts` (`afterEach`)
- Added `AbortController` to the browser `fetch()` fallback in `ReverseGeocoder.ts`
- Added `isRecord()` type guard in `address-parser.ts` to replace unsafe `as Record<string, unknown>` casts

## [0.11.0-alpha] - 2026-02-15

### Refactored

- **HtmlSpeechSynthesisDisplayer** (814 → 518 lines, **-36% reduction**): Converted from monolithic class to facade pattern
  - **Architecture**: Facade pattern composing 3 focused components for Single Responsibility Principle compliance
  - **Component 1: HtmlSpeechControls** (`src/html/HtmlSpeechControls.ts`, 489 lines, 51 tests): UI element management, event handlers, Brazilian Portuguese voice prioritization
  - **Component 2: AddressSpeechObserver** (`src/observers/AddressSpeechObserver.ts`, 96 lines, 41 tests): Priority-based speech synthesis (municipality: 3, bairro: 2, logradouro: 1, periodic: 0)
  - **Component 3: SpeechTextBuilder** (`src/speech/SpeechTextBuilder.ts`, 312 lines, 48 tests): Brazilian Portuguese address text formatting
  - 100% backward-compatible API; 60 unit tests passing
