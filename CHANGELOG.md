# Changelog

All notable changes to Guia Turístico will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **`paraty_geocore.js` dependency upgrade** from `@0.10.2` to `@0.11.0`:
  - Updated CDN URL in all 5 source files, 9 test files, `jest.config.unit.js`, `package.json`, and `src/types/paraty-geocore.d.ts`
  - Added new TypeScript declarations to `src/types/paraty-geocore.d.ts`: `withObserver`, `ObserverMixinOptions`, `ObserverMixinResult`
  - Corrected stale version references (`@0.9.10-alpha`, `@0.9.3-alpha`) in `docs/architecture/ARCHITECTURE.md`, `docs/architecture/GEO_POSITION.md`, `docs/guides/QUICK_START.md`, and `docs/class-extraction/CLASS_LOCATION_GUIDE.md`
  - `delay` utility internally moved to `utils/async.js` in `paraty_geocore.js` — no API change

- **`paraty_geocore.js` dependency upgrade** from `@0.9.9-alpha` to `@0.9.10-alpha`:
  - Updated CDN URL in all source files, test files, `jest.config.unit.js`, `package.json`, and `src/types/paraty-geocore.d.ts`
  - `GeocodingState` and `ObserverSubject` are now exported from the CDN — the local `src/core/GeocodingState.js` stub has been removed
  - `src/coordination/WebGeocodingManager.ts` now imports `GeocodingState` from the CDN alongside `GeoPosition`
  - Updated ambient type declarations in `src/types/paraty-geocore.d.ts` to include `ObserverSubject`, `GeocodingState`, and `GeocodingStateSnapshot`
  - `geocodingState.destroy()` call replaced by `geocodingState.clear()` to match the CDN API
  - Updated `test/core/GeocodingState.test.js` to test the CDN class (validation, observer pattern, `clear()`, `hasPosition()`)

### Fixed

- **`paraty_geocore.js` dependency upgrade** from `@0.9.3-alpha` to `@0.9.4-alpha`:
  - Updated CDN URL in all 5 source files, 7 test files, `jest.config.unit.js`, and `src/types/paraty-geocore.d.ts`
  - Added missing type declarations to `paraty-geocore.d.ts`: `calculateDistance`, `EARTH_RADIUS_METERS`, `delay`
  - `delay(ms)` now clamps negative values to `0` (upstream fix in `utils/async`)
  - `GeoPosition.getAccuracyQuality()` uses named `ACCURACY_THRESHOLDS` constants internally (no API change)

- **GeoPosition CDN import** (`src/core/GeoPosition.ts` removed — now imported from `paraty_geocore.js` CDN):
  - Upgraded from `paraty_geocore.js@0.9.2-alpha` (CJS dist) to `@0.9.3-alpha` (ESM dist)
  - Resolved browser error: `SyntaxError: does not provide an export named 'default'`
  - **Root cause**: Old CDN URL served CommonJS format which browsers cannot load as ES modules
  - **Fix**: `paraty_geocore.js` now ships an ESM build at `dist/esm/index.js` (native browser ESM)
  - Updated all 5 source files and 7 test files to use named import: `import { GeoPosition } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.9.3-alpha/dist/esm/index.js'`

## [0.11.0-alpha] - 2026-02-15

### Refactored

- **HtmlSpeechSynthesisDisplayer** (814 → 518 lines, **-36% reduction**): Converted from monolithic class to facade pattern
  - **Architecture**: Facade pattern composing 3 focused components for Single Responsibility Principle compliance
  - **Component 1: HtmlSpeechControls** (`src/html/HtmlSpeechControls.js`, 489 lines, 51 tests)
    - UI element management (voice select, buttons, sliders)
    - Event handler setup and cleanup (prevents memory leaks)
    - Brazilian Portuguese voice prioritization
    - **API**: `updateVoices()`, `destroy()`
  - **Component 2: AddressSpeechObserver** (`src/observers/AddressSpeechObserver.js`, 96 lines, 41 tests)
    - Address change notification handling
    - Priority-based speech synthesis (municipality: 3, bairro: 2, logradouro: 1, periodic: 0)
    - First address announcement logic
    - **API**: `update()`, `resetFirstAddressFlag()`
  - **Component 3: SpeechTextBuilder** (`src/speech/SpeechTextBuilder.js`, 312 lines, 48 tests)
    - Brazilian Portuguese text formatting
    - Address component text building (logradouro, bairro, municipio, full address)
    - **API**: `buildTextToSpeech*()` methods
  - **Facade**: HtmlSpeechSynthesisDisplayer maintains 100% backward compatible API
    - All 60 unit tests passing (zero breaking changes)
    - Property getters for DOM elements (voiceSelect, textInput, etc.)
    - Method delegation to composed components
    - Observer pattern interface preserved
    - `destroy()` method for proper cleanup (NEW, prevents memory leaks)

### Changed

- **Improved Maintainability**: Monolithic 814-line class split into 3 focused components
  - Better testability: 140 total tests vs original 60 tests (133% more coverage)
  - Cleaner separation of concerns: UI, Observer logic, Text formatting
  - Easier to extend: Add new address fields or speech patterns without touching UI code
  - Better composition: Components can be used independently if needed

### Fixed

- **Memory Leak Prevention**: Added `destroy()` method for proper event listener cleanup
- **Logging Consistency**: Facade layer now handles logging for backward compatibility

### Migration Guide

**NO CHANGES REQUIRED** - 100% backward compatible!

The facade maintains the exact same API as the original monolithic class:

```javascript
// Existing code continues to work without changes
const displayer = new HtmlSpeechSynthesisDisplayer(document, {
  voiceSelectId: 'voice-select',
  textInputId: 'text-input',
  speakBtnId: 'speak-btn',
  // ... other element IDs
});

// All existing methods work the same
displayer.updateVoices();
displayer.buildTextToSpeech(address);
displayer.update(address, 'BairroChanged', 'strCurrPosUpdate');

// NEW: Optional cleanup method to prevent memory leaks
displayer.destroy(); // Call when component unmounts
```

**Benefits**:

- Same constructor signature
- Same public methods
- Same property access
- Same observer pattern interface
- Zero breaking changes

**What Changed Internally**:

- UI operations → delegated to HtmlSpeechControls
- Address notifications → delegated to AddressSpeechObserver
- Text formatting → delegated to SpeechTextBuilder
- Better organized, easier to test, easier to maintain

## [0.10.0-alpha] - 2026-02-15

### Added

- **HomeViewController** (`src/views/home.js`, 672 lines): New view controller for home view location tracking
  - Manages single-position capture and continuous tracking workflows
  - Event listener management with memory leak prevention
  - UI state management with accessibility (button text, icons, ARIA labels)
  - Dependency injection pattern for testing
  - **API**: `init()`, `getSingleLocationUpdate()`, `startTracking()`, `stopTracking()`, `toggleTracking()`
  - **Tests**: 70 comprehensive unit tests with 100% coverage (`__tests__/views/home.test.js`, 872 lines)
  - **Documentation**: Complete JSDoc with examples and error handling

### Changed

- **`app.js`** (664 → 645 lines, -2.9%): Refactored to use HomeViewController
  - Replaced inline WebGeocodingManager instantiation with HomeViewController
  - Removed inline Chronometer initialization (now handled by HomeViewController)
  - Simplified `initializeHomeView()` from ~60 lines to ~25 lines (-58% complexity)
  - Updated AppState from `manager` to `homeController`
  - Cleaner separation of concerns and consistent view controller pattern

### Deprecated

- **WebGeocodingManager tracking methods** (will be removed in v1.0.0):
  - `getSingleLocationUpdate()` → Use `HomeViewController.getSingleLocationUpdate()`
  - `startTracking()` → Use `HomeViewController.startTracking()`
  - `stopTracking()` → Use `HomeViewController.stopTracking()`
  - `initSpeechSynthesis()` → Automatic initialization in `HomeViewController.startTracking()`
  - All deprecated methods emit `warn()` deprecation warnings with migration guidance
  - Full backward compatibility maintained for smooth migration
  - Documentation added to tests explaining deprecation strategy

### Fixed

- **Code organization**: Extracted 300+ lines of view-specific logic from WebGeocodingManager
- **Architecture**: Established consistent view controller pattern (HomeViewController + ConverterViewController)
- **Testing**: Improved test organization with separate test suites for view controllers

### Migration Guide

```javascript
// OLD (deprecated)
const manager = new WebGeocodingManager(document, { locationResult: 'location-result' });
manager.getSingleLocationUpdate();
manager.startTracking();

// NEW (v0.10.0+)
const controller = new HomeViewController(document, { locationResult: 'location-result' });
await controller.init();
controller.getSingleLocationUpdate();
controller.startTracking();
```

**Breaking Changes**: None (deprecation warnings only)
**Removal Timeline**: Deprecated methods will be fully removed in v1.0.0

## [0.9.0-alpha] - 2026-01-28

### Added

- **Metropolitan Region Display (v0.9.0-alpha)**: Municipality highlight card now displays "Região Metropolitana" information for municipalities in metropolitan areas
  - Displays between município label and municipality name with reduced visual prominence
  - Visual hierarchy: smaller font size (0.875rem) and lighter color (70% opacity)
  - Example: "Região Metropolitana do Recife" for Recife, Olinda, and other RMR municipalities
  - Extracts data from Nominatim `address.county` field
  - Graceful fallback: no display for non-metropolitan municipalities
  - Documentation: `docs/FEATURE_METROPOLITAN_REGION_DISPLAY.md` (12.5KB)
  - Comprehensive test coverage:
    - `__tests__/unit/BrazilianStandardAddress-MetropolitanRegion.test.js`: 19 unit tests
    - `__tests__/unit/AddressExtractor-MetropolitanRegion.test.js`: 26 unit tests
    - `__tests__/unit/HTMLHighlightCardsDisplayer-MetropolitanRegion.test.js`: 28 unit tests
    - `__tests__/e2e/metropolitan-region-display.e2e.test.js`: 4 E2E tests (Recife, São Paulo, non-metro, visual hierarchy)
  - Total: 77 new tests, all passing
- **Município State Abbreviation Display (v0.9.0-alpha)**: Municipality highlight card now displays the state abbreviation alongside the município name (e.g., "Recife, PE" instead of just "Recife")
  - Provides better geographic context for users
  - Fallback to município name only if state abbreviation is unavailable
  - Comprehensive test coverage with 42 unit tests covering all 26 Brazilian states
  - Documentation: `docs/FEATURE_MUNICIPIO_STATE_DISPLAY.md`
  - `__tests__/html/HTMLHighlightCardsDisplayer.test.js`: New unit test suite (42 tests)
- `src/html/HTMLSidraDisplayer.js`: IBGE SIDRA data displayer (7,502 bytes, v0.9.0+)
- `libs/sidra/tab6579_municipios.json`: IBGE municipality population data (190KB offline fallback)
- `__tests__/unit/HTMLSidraDisplayer.test.js`: Comprehensive test suite for SIDRA displayer
- `__tests__/e2e/complete-address-validation.e2e.test.js`: Complete address data validation E2E test
- `__tests__/e2e/milho-verde-locationResult.e2e.test.js`: Location result integration E2E test
- `ADDRESS_FETCHED_EVENT` constant in `src/config/defaults.js` (replaces hardcoded strings)
- `building` type support in `VALID_REF_PLACE_CLASSES` for OSM building references
- `src/utils/TimerManager.js`: Centralized timer management utility (147 lines)
- `__tests__/utils/TimerManager.test.js`: Comprehensive test suite (26 tests, 100% coverage)
- Code quality improvement plan documentation

### Changed

- **`BrazilianStandardAddress` (v0.9.0-alpha)**: Added `regiaoMetropolitana` property and `regiaoMetropolitanaFormatada()` method
  - Stores metropolitan region information from Nominatim API
  - Returns formatted region name or empty string
  - Follows same pattern as `bairroCompleto()` method
- **`AddressExtractor` (v0.9.0-alpha)**: Now extracts metropolitan region from `address.county` field
  - Maps Nominatim `county` field to `enderecoPadronizado.regiaoMetropolitana`
  - Supports Brazilian metropolitan regions (Recife, São Paulo, Rio de Janeiro, etc.)
  - Falls back to null when county field is missing
- **`HTMLHighlightCardsDisplayer` (v0.9.0-alpha)**: Updated to display metropolitan region in municipality card
  - Added `_regiaoMetropolitanaElement` reference in constructor
  - Displays region between label and municipality value
  - Updates `regiao-metropolitana-value` DOM element
  - Calls `regiaoMetropolitanaFormatada()` method
- **`src/index.html` (v0.9.0-alpha)**: Added `<div id="regiao-metropolitana-value">` element in municipality card
  - Positioned between município label and value for correct visual hierarchy
  - Includes `aria-live="polite"` for screen reader support
- **`src/highlight-cards.css` (v0.9.0-alpha)**: Added `.metropolitan-region-value` styling
  - Font size: 0.875rem (87.5% of base, smaller than municipality)
  - Opacity: 0.7 (70%, lighter than municipality)
  - Margin: 8px top, 12px bottom for visual separation
- **`HTMLHighlightCardsDisplayer` (v0.9.0-alpha)**: Updated to use `municipioCompleto()` method instead of direct `municipio` property access
  - Displays município with state abbreviation format: "City, ST"
  - Maintains backwards compatibility with graceful fallback
- **E2E test expectations (v0.9.0-alpha)**: Updated assertions to match new município display format
  - `__tests__/e2e/municipio-bairro-simple.e2e.test.js`: Updated to expect "Arapiraca, AL"
  - `__tests__/e2e/municipio-bairro-display.e2e.test.js`: Updated TEST_COORDINATES constant
- `DisplayerFactory`: Now creates 5 displayer types (added Sidra displayer factory method)
- `ServiceCoordinator`: Manages SIDRA displayer lifecycle and observer subscriptions
- `ReverseGeocoder`: Uses `ADDRESS_FETCHED_EVENT` constant for observer notifications
- `HTMLAddressDisplayer`: Updated to use `ADDRESS_FETCHED_EVENT` constant
- `ReferencePlace.calculateCategory()`: Extended to support building types
- `PositionManager`: Position updates trigger on distance (20m) OR time (30s) thresholds
- **UI Simplification**: Removed primary navigation menu to focus on main feature (location tracking)
  - Moved coordinate converter to footer link (secondary feature)
  - Updated page title to emphasize location tracking purpose
  - Simplified user interface for clearer focus on real-time tracking
- Updated `src/index.html`: Removed `<nav class="app-navigation">`, added `<footer class="app-footer">`
- Updated `src/navigation.css`: Deprecated nav styles, added footer styles
- Updated `src/app.js`: Modified `updateActiveNavLink()` to support footer navigation

### Fixed

- Memory leak prevention infrastructure (TimerManager)
- Test coverage increased to 83.97%

### Documentation

- Added `docs/REFACTOR_ADDRESS_FETCHED_CONSTANT.md`: Documents constant extraction refactoring
- Updated test infrastructure documentation with SIDRA test coverage
- Updated README.md to reflect focus on location tracking as primary feature
- Updated test count badges: 2,212 passing / 2,374 total (was 1,899 / 2,045)
  - Added 77 tests for metropolitan region feature (73 unit + 4 E2E)
  - Total increase: +329 tests, +313 passing tests
- Updated `.github/copilot-instructions.md` with UI architecture section
- Added CHANGELOG.md for tracking project changes

## [0.9.0-alpha] - 2026-01-11

### Added

- Municipio/bairro display fix
- HTMLHighlightCardsDisplayer component
- ServiceCoordinator integration for address updates

### Fixed

- Bairro card not updating when changing neighborhoods

## [0.9.0-alpha] - 2025-12-XX

Initial release with guia.js integration.

### Added

- Single-page application structure
- Client-side routing
- Geolocation services
- Address geocoding for Brazilian locations
- IBGE integration
- Material Design 3 UI
- Accessibility compliance (WCAG 2.1)

---

[Unreleased]: https://github.com/mpbarbosa/guia_turistico/compare/v0.9.0-alpha...HEAD
[0.9.0-alpha]: https://github.com/mpbarbosa/guia_turistico/compare/v0.6.0-alpha...v0.9.0-alpha

---

**Last Updated**: 2026-02-09
**Status**: ✅ Active
