# Changelog

All notable changes to Guia Turístico will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `src/utils/TimerManager.js`: Centralized timer management utility (147 lines)
- `__tests__/utils/TimerManager.test.js`: Comprehensive test suite (26 tests, 100% coverage)
- Code quality improvement plan documentation

### Changed
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
- Updated README.md to reflect focus on location tracking as primary feature
- Updated test count badges: 1,820 passing / 1,968 total (was 1,516 / 1,653)
- Updated `.github/copilot-instructions.md` with UI architecture section
- Added CHANGELOG.md for tracking project changes

## [0.7.1-alpha] - 2026-01-11

### Added
- Municipio/bairro display fix
- HTMLHighlightCardsDisplayer component
- ServiceCoordinator integration for address updates

### Fixed
- Bairro card not updating when changing neighborhoods

## [0.7.0-alpha] - 2025-12-XX

Initial release with guia.js integration.

### Added
- Single-page application structure
- Client-side routing
- Geolocation services
- Address geocoding for Brazilian locations
- IBGE integration
- Material Design 3 UI
- Accessibility compliance (WCAG 2.1)
