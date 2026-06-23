# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

**Guia Turístico** is a Vue 3 + TypeScript SPA (v0.28.x-alpha) built on the **guia.js** geolocation library. It provides real-time location tracking, reverse geocoding, and an interactive tourist guide for Brazilian addresses. Routes (hash mode): `#/` (home/location), `#/converter`, `#/map`, `#/monitor`, `#/stats`, `#/history`, `#/extra`.

The codebase is essentially all TypeScript (137 `.ts`, ~20 `.vue` SFCs, only a handful of legacy `.js`). It is mid-migration to **Material Design 3 + Tailwind v4** — see `### Coexistence model` below before touching entry points.

Key external dependencies (sibling repos, resolved via Vite aliases/CDN — see `vite.config.js`):

- `guia.js` — core geolocation library (this repo IS the guia.js project)
- `ibira.js` — Brazilian IBGE integration
- `paraty_geoservices` / `paraty_geocore.js` — geocoding utilities
- `bessa_patterns.ts` — shared design-pattern primitives (importmap alias)

## Commands

```bash
# Development
npm run dev          # Vite dev server with HMR on port 9000 (~3s)
npm run build        # Production bundle to dist/ (~5s)
npm run preview      # Preview production build on port 9001

# Testing (Jest runs with --experimental-vm-modules; maxWorkers=1, jsdom)
npm test             # Default Jest suite
npm run test:watch   # Watch mode
npm run test:coverage  # With coverage
npm run test:unit    # Unit suite (jest.config.unit.js)
npm run test:e2e     # Puppeteer E2E suite (jest.config.e2e.js)
npm run test:playwright  # Playwright sanity (tests/e2e/sanity.playwright.ts)
npm run test:all-suites  # Combined unit + E2E
npm run test:all     # validate (tsc) + default Jest suite
npm run test:changed # Only tests for changed files

# Run a single test
npm test -- path/to/file.test.ts          # one file
npm test -- -t "name of the test case"    # by test name

# Validation
npm run validate     # tsc --noEmit type-check (the real "syntax check" — codebase is TS)
npm run lint         # ESLint v9 (flat config)
npm run lint:fix     # Auto-fix lint issues
npm run lint:md      # Markdown lint (scripts/lint-md.js)
npm run check:version  # Version consistency across all files

# Local CI simulation
npm run ci:test-local   # ./.github/scripts/test-workflow-locally.sh
```

Git hooks (Husky) run automatically: pre-commit runs syntax + unit tests; pre-push runs the default Jest suite.

## Architecture

### Coexistence model (read before editing entry points)

The app runs **two front-ends side by side** during the MD3 migration, both wired up in `src/index.html`:

- **`main.ts`** — the new Vue 3 app. `createApp(App).use(router)` mounts on `#app`. Routing is **vue-router** in hash mode (`src/router.ts`), components are `.vue` SFCs in `src/components/`.
- **`app.ts`** (compiled/served alongside as `app.js`) — the **legacy custom hash-router** mounting view controllers on `#app-content`. Still owns most location-tracking logic via `src/views/home.ts` and `src/views/converter.ts`.

Don't delete the legacy DOM nodes or assume a single router — `index.html` comments mark which markup is "kept for app.ts compatibility." New UI should be built as Vue SFCs + composables; legacy controllers are migrated incrementally.

### Layers

```
src/
├── main.ts                 # Vue 3 entry — createApp + vue-router, mounts #app
├── app.ts                  # Legacy custom hash-router, mounts #app-content
├── router.ts               # vue-router routes (home, converter, map, monitor, stats, history, extra)
├── App.vue                 # Vue root; AppBar / BottomNav / router-view
├── components/             # Vue SFCs (AppBar, BottomNav, HomeView, ConverterView, StatCard,
│                           #   Toast, Onboarding, …) + components/views/ (Map/Monitor/Stats/History/Extra)
├── composables/            # use* hooks bridging Vue components to the displayer/service layer
├── views/                  # Legacy view controllers (home.ts, converter.ts)
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
├── services/providers/     # GeolocationProvider abstraction (Browser + Mock impls)
├── utils/                  # TimerManager (required for all timers), button-status, logger, ErrorBoundary
├── config/                 # version.js, routes, environment constants
├── styles/ + *.css         # design-tokens.css + MD3/Tailwind v4 styles
└── types/                  # TypeScript interfaces
```

### Build (vite.config.js)

- `@vitejs/plugin-vue` + `@tailwindcss/vite` (Tailwind v4).
- Custom plugin resolves `.js` imports to a sibling `.ts` file when present — enables gradual `.js`→`.ts` migration without rewriting import paths.
- Sibling packages are wired in here: `bessa_patterns.ts` via alias, `paraty_geoservices` via a CDN-resolution plugin (intercepts both `dist/index.js` and `dist/esm/index.js`). Dev server on **9000**, preview on **9001**, build target `es2022` (top-level await).

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
