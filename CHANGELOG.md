# Changelog

All notable changes to Guia Turístico will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
[0.9.0-alpha]: https://github.com/mpbarbosa/guia_turistico/compare/v0.9.0-alpha...v0.9.0-alpha
[0.9.0-alpha]: https://github.com/mpbarbosa/guia_turistico/compare/v0.6.0-alpha...v0.9.0-alpha

---

**Last Updated**: 2026-02-09  
**Status**: ✅ Active
