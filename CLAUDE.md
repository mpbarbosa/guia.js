# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

**Guia Turístico** is a Vue 3 + TypeScript SPA (v0.16.0-alpha) built on the **guia.js** geolocation library. It provides real-time location tracking, reverse geocoding, and an interactive tourist guide for Brazilian addresses. The app runs at `#/` (location tracking) and `#/converter` (coordinate conversion).

Key external dependencies:

- `guia.js` — core geolocation library (this repo IS the guia.js project)
- `ibira.js` — Brazilian IBGE integration
- `paraty_geocore.js` — geocoding utilities

## Commands

```bash
# Development
npm run dev          # Vite dev server with HMR on port 9000 (~3s)
npm run build        # Production bundle to dist/ (~5s)
npm run preview      # Preview production build on port 9001

# Testing
npm test             # Full test suite (~65s, 3000+ tests)
npm run test:watch   # Watch mode
npm run test:coverage  # With coverage (~76% overall)
npm run test:unit    # Unit tests only
npm run test:e2e     # Puppeteer E2E tests only
npm run test:all     # Syntax validation + full test suite

# Validation
node -c src/app.js   # Syntax check (<1s) — run before commits
npm run lint         # ESLint v9 (flat config)
npm run lint:fix     # Auto-fix lint issues
npm run validate     # JS syntax validation only
npm run check:version  # Version consistency across all files

# Local CI simulation
./.github/scripts/test-workflow-locally.sh
```

Git hooks (Husky) run automatically: pre-commit runs syntax + unit tests; pre-push runs the full suite.

## Architecture

### Layers

```
src/
├── app.ts / main.ts        # Vue entry point + router (#/, #/converter)
├── views/                  # View controllers (HomeViewController, ConverterViewController)
├── core/                   # Singletons: PositionManager, ObserverSubject, GeoPosition
├── coordination/           # Orchestration: WebGeocodingManager, ServiceCoordinator,
│                           #   EventCoordinator, UICoordinator
├── services/               # External APIs: GeolocationService, ReverseGeocoder,
│                           #   AwsGeocoder, IBGECityStatsService, OverpassService
├── data/                   # Value objects + processing: BrazilianStandardAddress,
│                           #   AddressCache (+ AddressChangeDetector, CallbackRegistry,
│                           #   AddressDataStore), AddressDataExtractor
├── html/                   # UI displayers: HTMLPositionDisplayer, HTMLAddressDisplayer,
│                           #   HTMLHighlightCardsDisplayer, HTMLSidraDisplayer,
│                           #   HtmlSpeechSynthesisDisplayer (facade), DisplayerFactory
├── speech/                 # SpeechSynthesisManager + VoiceLoader, VoiceSelector,
│                           #   SpeechConfiguration, SpeechQueue, SpeechTextBuilder
├── observers/              # Observer implementations including AddressSpeechObserver
├── status/                 # SingletonStatusManager
├── timing/                 # Chronometer (observer-based performance timing)
├── utils/                  # TimerManager (required for all timers), button-status
├── config/                 # version.js, routes, environment constants
└── types/                  # TypeScript interfaces
```

### Key Design Patterns

- **Observer** — position/address changes propagate via `ObserverSubject`; `ADDRESS_FETCHED_EVENT` constant (in `src/config/defaults.js`) is the primary notification channel.
- **Singleton** — `PositionManager` and `SingletonStatusManager` hold cross-component state.
- **Facade** — `HtmlSpeechSynthesisDisplayer` wraps three focused components (`HtmlSpeechControls`, `AddressSpeechObserver`, `SpeechTextBuilder`).
- **Factory** — `DisplayerFactory` creates all five displayer types.
- **Composition** — `AddressCache` composed of `AddressChangeDetector + CallbackRegistry + AddressDataStore`; `SpeechSynthesisManager` composed of `VoiceLoader + VoiceSelector + SpeechConfiguration + SpeechQueue`.

### Important Rules

- **TimerManager is required for all timers** — never use bare `setInterval`/`setTimeout`. Use `timerManager.setInterval(cb, delay, 'named-id')`.
- **Immutability** — data objects (e.g., `GeoPosition`, `BrazilianStandardAddress`) are immutable value objects. See `.github/CONTRIBUTING.md`.
- **Position update thresholds** — `PositionManager` only updates on distance ≥ 20 m OR time ≥ 30 s (`MINIMUM_DISTANCE_CHANGE`, `MINIMUM_TIME_CHANGE` in `src/config/defaults.js`).
- **Button state** — use `src/utils/button-status.js` helpers (`disableWithReason`, `enableWithMessage`) instead of raw DOM manipulation. This ensures WCAG 2.1 AA compliance.

### External APIs

- Nominatim (OSM): reverse geocoding
- IBGE: Brazilian state/municipality data
- SIDRA: demographic statistics (offline fallback in `libs/sidra/tab6579_municipios.json`)
- Google Maps: link generation for map/street view
