# Material Design 3 Migration Plan

## Context

guia_js currently uses Bootstrap 5.3 as its CSS framework, with 20+ custom CSS files layered on top. A prototype at `/home/mpb/Downloads/guia-js` demonstrates the target visual language: Material Design 3 implemented via Tailwind CSS v4 + custom CSS tokens (no `@material/web` library). The prototype adds 3 new screens (Map, Stats, History) on top of the existing Home and Converter screens, adopting a Bottom Navigation Bar pattern instead of the current top navbar. This plan migrates the app to that target in 8 atomic phases, each ending with a test/commit/push/deploy gate.

**Key decisions:**

- Tailwind CSS v4 (matches prototype; `@theme {}` in CSS, no `tailwind.config.js`)
- No `@material/web` — custom Tailwind components following MD3 anatomy
- `@vueuse/motion` for animations (Vue equivalent of Framer Motion)
- `vue-chartjs` + `chart.js` for data charts in Stats screen
- TypeScript displayers in `src/html/` are preserved and kept as-is until their screen is Vueified; they write to IDs that Vue renders

**Prototype color palette (replaces current):**

- `--color-primary: #004ac6`
- `--color-primary-container: #2563eb`
- `--color-surface: #f8f9fa`
- `--color-surface-card: #ffffff`
- `--color-outline: #737686`
- `--color-outline-variant: #c3c6d7`

**Typography:** Inter (UI) + JetBrains Mono (data/metadata)

---

## Phase 0 — Archive Current Site to /v1

**Goal:** Preserve the current production build at `https://mpbarbosa.com/guia_js/v1` before any migration work begins. This gives users a stable fallback and provides a visual reference for before/after comparison.

**Why `public/v1/` not `dist/v1/`:** `vite.config.js` sets `emptyOutDir: true`, so every build wipes `dist/` entirely. Files placed directly in `dist/v1/` would be deleted on the next `npm run build`. Instead, the snapshot lives in `public/v1/` — Vite copies `public/` contents into `dist/` on every build, so `dist/v1/` is always reconstructed from the tracked `public/v1/` snapshot automatically.

**Steps:**

1. Run `npm run build` to ensure `dist/` is current.
2. Copy the production build into `public/v1/` (excluding `.map` source maps to keep repo size ~2.4 MB):

   ```bash
   mkdir -p public/v1/assets
   cp dist/index.html dist/offline.html dist/manifest.json dist/service-worker.js \
      dist/favicon.svg dist/icon-192.png dist/icon-512.png public/v1/
   rsync -av --exclude="*.map" dist/assets/ public/v1/assets/
   cp -r dist/libs public/v1/libs
   ```

3. Commit `public/v1/` — tracked in git, never rebuilt, never modified during migration.

**Gate:** `npm test` green → `npm run build` to verify `dist/v1/` appears → commit `chore: archive current build to public/v1 (pre-MD3 snapshot)` → push → verify `https://mpbarbosa.com/guia_js/v1` loads correctly

**Note:** The service worker at `v1/service-worker.js` has a different scope (`/guia_js/v1/`) than the main app (`/guia_js/`), so both coexist without cache conflicts.

---

## Phase 1 — Design Token Unification + Tailwind CSS v4 Install

**Goal:** Install Tailwind v4 alongside Bootstrap (no removal yet). Migrate `design-tokens.css` to Tailwind's `@theme {}` block with the prototype's MD3 color palette.

**Files to create:**

- `src/styles/md3-theme.css` — `@import "tailwindcss"` + `@theme {}` with full MD3 palette, typography, elevation, border-radius tokens; `@layer base { body { @apply bg-surface antialiased; } }`
- `src/styles/compat-tokens.css` — thin bridge mapping old `--color-*` vars to new theme vars so existing CSS keeps resolving
- `src/styles/fonts.css` — `@import` Inter + JetBrains Mono from Google Fonts

**Files to modify:**

- `package.json` — add `tailwindcss@^4`, `@tailwindcss/vite@^4` to devDependencies
- `vite.config.js` — add `import tailwindcss from '@tailwindcss/vite'` before `vue()` plugin
- `src/index.html` — add `<link rel="stylesheet" href="styles/md3-theme.css">` as **first** stylesheet; update CSP meta to include `https://fonts.googleapis.com` (style-src) and `https://fonts.gstatic.com` (font-src)
- `public/manifest.json` — update `theme_color` from `#2563eb` to `#004ac6`

**Gate:** `npm test` green → `npm run build` succeeds → commit `feat: install Tailwind v4, unify MD3 design tokens` → push → deploy

**Risk:** Tailwind v4 plugin must be ordered before `resolveJsToTs` in `vite.config.js`; naming collision between old `--color-*` vars and Tailwind theme vars is handled by `compat-tokens.css`.

---

## Phase 2 — App Shell: Top App Bar + Bottom Navigation

**Goal:** Replace Bootstrap navbar with Vue-native `AppBar.vue`. Add `BottomNav.vue` with 5 tabs (Home, Rotas, Mapa, Stats, Histórico). Add 3 stub routes. Wire into `App.vue`. Remove Bootstrap Collapse JS usage.

**New routes:** `/map` → `MapView.vue` (stub), `/stats` → `StatsView.vue` (stub), `/history` → `HistoryView.vue` (stub)

**Files to create:**

- `src/components/AppBar.vue` — `bg-white/80 backdrop-blur-md border-b border-outline-variant`; logo `bg-primary rounded-xl p-2`; title `text-primary font-bold`
- `src/components/BottomNav.vue` — `bg-white border-t border-outline-variant`; active tab: `bg-primary-container text-white`; CSS transition for active indicator (`transition-all duration-300`)
- `src/components/views/MapView.vue` (stub → `<EmptyState>`)
- `src/components/views/StatsView.vue` (stub)
- `src/components/views/HistoryView.vue` (stub)

**Files to modify:**

- `src/App.vue` — add shell: `<AppBar>`, `<main class="flex-1 overflow-y-auto">`, `<RouterView>`, `<BottomNav>`; add `flex flex-col h-screen max-w-md mx-auto bg-surface overflow-hidden shadow-2xl`
- `src/router.ts` — add 3 new routes
- `src/app.ts` — remove `import { Collapse } from 'bootstrap'` and `.hide()` call
- `package.json` — add `@vueuse/motion` to dependencies

**Gate:** Tests pass → all 5 tabs navigate → commit `feat: add MD3 app shell with Bottom Navigation` → push → deploy

---

## Phase 3 — CSS Framework Swap: Remove Bootstrap

**Goal:** Remove Bootstrap CSS from bundle. Replace all Bootstrap utility classes in `index.html` and Vue SFCs with Tailwind equivalents. Keep all 20+ custom CSS files intact (they use custom properties, not Bootstrap classes).

**Files to modify:**

- `src/index.html` — replace ~38 Bootstrap class usages (`card`, `card-header`, `card-body`, `badge`, `d-flex`, `align-items-center`, `gap-2`, `fw-semibold`, `text-bg-secondary`, `ms-auto`, `collapse`, etc.) with Tailwind equivalents; remove `collapse navbar-collapse` div
- `src/app.ts` — remove `import 'bootstrap/dist/css/bootstrap.min.css'` and `import './bootstrap-overrides.css'`
- `src/bootstrap-overrides.css` — remove all `.app-navbar`, `.navbar-*` selectors; keep only `--md-sys-color-*` token declarations at `:root` (repurposed as token bridge)
- `vite.config.js` — remove `'bootstrap'` from `manualChunks`
- `package.json` — remove `bootstrap` from dependencies, `@types/bootstrap` from devDependencies

**Gate:** `npm test` green → `npm run build` (verify no Bootstrap chunk) → visual browser check → commit `chore: remove Bootstrap, complete Tailwind v4 adoption` → push → deploy

---

## Phase 4 — Home Screen: Migrate from index.html to HomeView.vue ✅ DONE (299a5a0)

**Goal:** Migrate full home screen content from `index.html` into `HomeView.vue` as proper Vue SFCs with Tailwind MD3 styling. Preserve all element IDs that `HomeViewController` and displayers target.

**Strategy:** "Lift and shift" — HTML structure moves from `index.html` into Vue template syntax, preserving IDs. Displayer classes continue to work unchanged because they find the same IDs in the Vue-rendered DOM.

**Created:**

- `src/components/AppHeroHeader.vue` — hero gradient card with `id=header-location-text`, mirroring `Município · localidade` from the live location cards
- `src/components/LocationHighlightCards.vue` — 3-card grid preserving `municipio-value`, `bairro-value`, `logradouro-value`
- `src/components/SecondaryInfoPanel.vue` — collapsible secondary info panel with all secondary IDs; includes secondary-info-collapse CSS
- `src/components/AdvancedControlsPanel.vue` — advanced controls + navigation log; includes chronometer CSS

**Modified:**

- `src/components/HomeView.vue` — full template using sub-components; reactive onboarding state via geolocation events
- `src/components/Onboarding.vue` — added `id=onboarding-card` + `id=enable-location-btn`; `v-if` → `v-show` (element stays in DOM for getElementById)
- `src/index.html` — `<main id=app-content>` emptied (kept for app.ts); `onboarding.js` script removed; misplaced post-`</html>` styles deleted (moved to components)

**Coexistence notes:**

- `id=address-confirmation-threshold-control` and `id=confirmation-buffer-card` remain in hidden nav (app.ts initializes them before Vue mounts — moving them to Vue would break initialization timing)
- Two HomeViewController instances still coexist (app.ts + HomeView.vue) — pre-existing issue; Vue elements are found first since `<div id=app>` precedes `<main id=app-content>` in DOM order

---

## Phase 5 — ConverterView MD3 Redesign ✅ DONE (v0.25.0-alpha)

**Goal:** Rewrite `ConverterView.vue` template with Tailwind MD3 classes. Zero logic changes.

**Files modified:**

- `src/components/ConverterView.vue` — main card `rounded-3xl border-outline-variant shadow-sm`; button `py-4`; result highlight cards and result content card aligned to `LocationHighlightCards` pattern (`bg-white border border-outline-variant p-6 rounded-2xl shadow-sm`)
- `src/app.ts` — legacy router no longer renders 404 for Vue-only routes (`/map`, `/stats`, `/history`); clears `#app-content` instead

---

## Phase 6 — Map Screen (MapView.vue) ✅ Done (v0.27.3-alpha)

**Goal:** Replace `/map` stub with full `MapView.vue`. Keep `MapLibreDisplayer.ts` as-is, initialized via a Vue composable. Build the MD3 floating overlay UI.

**Files created:**

- `src/components/views/MapView.vue` — `<div id="maplibre-map" class="absolute inset-0 w-full h-full">`; floating overlay with `pointer-events-none` container; floating location card bound to composable reactive refs; horizontal chip scrollbar (category filters); FAB circle button (bottom right)
- `src/composables/useMapDisplayer.ts` — wraps `MapLibreDisplayer` via new `mount()` API; subscribes to `PositionManager` (GPS) and `AddressCache` (address label); exposes reactive `{ street, neighborhood, city }`; cleans up on `onUnmounted`
- `test/composables/useMapDisplayer.test.js` — 12 unit tests

**Files modified:**

- `src/html/MapLibreDisplayer.ts` — added public `mount()` method for Vue-context (no toggle button needed)
- `test/html/MapLibreDisplayer.test.js` — 4 new tests for `mount()`
- `package.json` — added `bessa_patterns.ts` to `moduleNameMapper` so AddressCache-dependent tests resolve correctly

**Notes:**

- `src/router.ts` was already routing `/map` → `MapView` from Phase 2 — no change needed
- `HomeViewController` usage of `MapLibreDisplayer` (toggle-button pattern) is unchanged

**Gate:** ✅ `npm test` → 164 tests pass → `npx tsc --noEmit` → clean

---

## Phase 7 — Stats Screen (StatsView.vue + vue-chartjs)

**Goal:** Replace `/stats` stub with `StatsView.vue` showing IBGE data. Use `IBGECityStatsService` via a composable. Replace `HTMLCityStatsPanel` DOM writes with reactive refs.

**Files to create:**

- `src/components/views/StatsView.vue` — horizontal chip filter row; `StatCard` grid; dark "Reference Document" footer card (`bg-indigo-950 text-white`)
- `src/components/StatCard.vue` — icon, label, value, status badge, optional `<Bar>` chart slot
- `src/composables/useCityStats.ts` — calls `IBGECityStatsService.fetchStats()`, stores result in `ref<CityStats | null>()`

**Files to modify:**

- `src/router.ts` — update `/stats` to `StatsView`
- `package.json` — add `vue-chartjs`, `chart.js` to dependencies; add `jest-canvas-mock` to devDependencies
- `jest.setup.js` (or equivalent) — add `import 'jest-canvas-mock'`

**Gate:** `npm test` → IBGE data visible → commit `feat: implement Stats screen with IBGE data and charts` → push → deploy

**Note:** `HTMLCityStatsPanel` is not deleted here — still used in the home screen secondary panel. Deletion deferred to Phase 8.

---

## Phase 8 — History Screen + Legacy CSS Cleanup

**Goal:** Build `HistoryView.vue` (settings toggles + navigation history). Delete all CSS files superseded by Tailwind. Strip utility classes from `design-tokens.css`, keeping only `:root { ... }` token declarations.

**Files to create:**

- `src/components/views/HistoryView.vue` — settings section with `ToggleSwitch`; navigation history list; system info footer
- `src/components/ToggleSwitch.vue` — MD3 switch: `w-12 h-6 rounded-full`; thumb `translate-x-6` transition
- `src/composables/useNavigationHistory.ts`

**Files to modify:**

- `src/router.ts` — update `/history` to `HistoryView`
- `src/design-tokens.css` — strip all utility classes (`.m-xs`, `.p-sm`, `.elevation-1`, etc.); keep only `:root { --color-primary: ...; --md-sys-elevation-level*: ...; }` declarations

**Files to delete (confirm empty after migration):**

- `src/bootstrap-overrides.css` — vars moved to `md3-theme.css`
- Review for deletion: `src/header-hero.css`, `src/highlight-cards.css`, `src/onboarding.css`, `src/loc-em-movimento.css`
- **Keep permanently:** `src/accessibility-compliance.css`, `src/reduced-motion.css`, `src/skip-link.css`, `src/transitions.css`

**Gate:** `npm test` → `npm run build` → visual check all 5 screens → commit `feat: complete MD3 migration, remove legacy CSS` → push → deploy

---

## Summary

| Phase | Name | Bootstrap | Screens Added | Highest Risk |
|-------|------|-----------|---------------|--------------|
| 0 | Archive current site to /v1 | Unchanged | — | Service worker scope conflict |
| 1 | Token Unification + Tailwind Install | Coexists | — | Vite plugin order |
| 2 | App Shell (AppBar + BottomNav) | Partial removal (JS) | 3 stubs | Controller DOM init |
| 3 | CSS Framework Swap | Fully removed | — | Visual regression |
| 4 | Home Screen Vue Migration | Classes replaced | Home (full) | Element ID availability |
| 5 | ConverterView Redesign | N/A | Converter (restyled) | Low |
| 6 | Map Screen | N/A | Map | MapLibre canvas height |
| 7 | Stats Screen | N/A | Stats | jest-canvas-mock setup |
| 8 | History + CSS Cleanup | CSS files deleted | History | Dead CSS class refs |

---

## End-to-End Verification (after all phases)

1. `npm test` — full suite (3000+ tests, ~65s)
2. `npm run test:e2e` — Puppeteer: all 5 screens navigate, location updates, IBGE data loads
3. `npm run build` — bundle has no Bootstrap chunk; Tailwind CSS is compiled
4. Manual check: Bottom Nav active states, all 5 tabs, speech synthesis, map tracking, converter
5. `npm run check:version` — version consistency
6. Lighthouse: PWA score, accessibility score (target ≥ 95)
