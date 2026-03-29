# Changelog

All notable changes to Guia Turístico will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.14.1-alpha] - 2026-03-29

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
- **`bessa_patterns.ts` dependency** upgraded from `v0.12.13-alpha` to `v0.12.15-alpha`:
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
