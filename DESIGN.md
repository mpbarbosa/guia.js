# DESIGN.md — Guia Turístico Web GUI Specification

## Overview

**Guia Turístico** is a mobile-first PWA that provides real-time location tracking and reverse geocoding for Brazilian addresses. The UI is a full-viewport shell with a fixed app bar at the top, a fixed bottom navigation bar, and a scrollable content region in between. All navigation is client-side via hash routing (`#/`, `#/converter`, `#/map`, etc.).

---

## Mood & Aesthetics

**Swiss Modern × Technical Minimalist.**

- **Professionalism:** Deep blues and pure whites. Data feels precise, not decorative.
- **Precision:** Large rounded corners (24–28 px) contrast with tight, structured typography.
- **Depth:** Subtle shadows and `backdrop-blur` separate UI layers without heavy borders.
- **Restraint:** No gradients except the hero header. No decorative illustrations. Information hierarchy is the decoration.

---

## Design System

### Token Source

All design tokens are defined in `src/styles/md3-theme.css` inside a Tailwind `@theme {}` block. Tokens follow the [Material Design 3](https://m3.material.io/) naming convention.

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#004ac6` | Action buttons, active tab indicators, hero gradient start |
| `--color-primary-container` | `#2563eb` | Active tab icon background; hero gradient end |
| `--color-on-primary` | `#ffffff` | Text/icons on primary surfaces |
| `--color-on-primary-container` | `#ffffff` | Text/icons inside primary containers |
| `--color-secondary` | `#7c3aed` | Accent — used sparingly for badges, highlights |
| `--color-secondary-container` | `#ede9fe` | Chip/badge backgrounds |
| `--color-surface` | `#f8f9fa` | App background (ice-grey, reduces eye strain) |
| `--color-surface-card` | `#ffffff` | Card surfaces |
| `--color-surface-variant` | `#f1f3f9` | Input backgrounds, secondary panels |
| `--color-on-surface` | `#1c1b1f` | Body text |
| `--color-on-surface-variant` | `#434655` | Secondary text, inactive nav labels |
| `--color-outline` | `#737686` | Muted labels (MUNICÍPIO, BAIRRO headers), field borders |
| `--color-outline-variant` | `#c3c6d7` | Card borders, dividers |
| `--color-error` | `#ba1a1a` | Error states |
| `--color-error-container` | `#ffdad6` | Error message backgrounds |
| `--color-on-error` | `#ffffff` | Text on error surfaces |
| `--color-success` | `#059669` | GPS accuracy "good" state, success toasts |
| `--color-warning` | `#d97706` | GPS accuracy "degraded" state, warnings |
| `indigo-950` (Tailwind) | `#1e1b4b` | Card value text — deep indigo for premium readability |

**Semantic signals:** green (`--color-success`) = optimal; amber (`--color-warning`) = watch; red (`--color-error`) = fault. These map directly to geolocation accuracy states.

### Typography

| Role | Font | Notes |
|---|---|---|
| UI & Titles | **Inter** | All headings, labels, body. Exceptional legibility at small sizes. |
| Data & Metadata | **JetBrains Mono** | Coordinates, technical values, code. Signals "precision-processed" data. |

Typography scale in use:

| Class | Size | Weight | Usage |
|---|---|---|---|
| `text-[10px]` / `text-xs` | 10–12 px | `font-black` | Card category labels (MUNICÍPIO, BAIRRO, LOGRADOURO) — all-caps, widest tracking |
| `text-sm` | 14 px | `font-medium` | Sub-values (metropolitan region), secondary info |
| `text-xl` | 20 px | `font-bold` | Card primary values (municipality name, street name) |
| `text-2xl` | 24 px | `font-bold` | Hero location header |
| `text-xs` `uppercase tracking-[0.2em]` | 12 px | `font-bold` | Hero eyebrow label ("ONDE ESTOU?") |
| `text-[11px]` `uppercase tracking-wide` | 11 px | `font-bold` | Bottom nav labels |

### Elevation (Box Shadows)

| Token | Value | Usage |
|---|---|---|
| `--shadow-level-0` | `none` | Flat surfaces |
| `--shadow-level-1` | `0 1px 2px rgba(0,0,0,.3), 0 1px 3px 1px rgba(0,0,0,.15)` | Cards at rest |
| `--shadow-level-2` | `0 1px 2px rgba(0,0,0,.3), 0 2px 6px 2px rgba(0,0,0,.15)` | Hover cards |
| `--shadow-level-3` | `0 4px 8px 3px rgba(0,0,0,.15), 0 1px 3px rgba(0,0,0,.3)` | Floating panels |
| `--shadow-level-4` | `0 6px 10px 4px rgba(0,0,0,.15), 0 2px 3px rgba(0,0,0,.3)` | Modals, drawers |
| `shadow-sm` (Tailwind) | `0 1px 2px 0 rgba(0,0,0,0.05)` | Location highlight cards (subtle lift) |
| `shadow-xl` | Tailwind default | Hero header card |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-xs` | 4 px | Tags, chips |
| `--radius-sm` | 8 px | Inputs |
| `--radius-md` | 12 px | Buttons |
| `--radius-lg` | 16 px | Minor cards |
| `--radius-xl` | 28 px | Major cards, nav items |
| `--radius-full` | 9999 px | Pills, indicator dots |
| `rounded-3xl` (Tailwind) | 24 px | Hero header card, location cards |
| `rounded-2xl` (Tailwind) | 16 px | Location highlight cards |

### Icon Set

**Bootstrap Icons 1.13.1** — loaded via CDN link. Icon names follow `bi-{name}` (outline) and `bi-{name}-fill` (filled/active) convention.

---

## App Shell Layout

```
┌─────────────────────────────────┐
│          AppBar (fixed top)      │  ~56 px, bg-white/80 backdrop-blur-md
├─────────────────────────────────┤
│                                 │
│      Scrollable Content Area    │  flex-1, overflow-y-auto, no-scrollbar
│      (view-specific content)    │
│                                 │
├─────────────────────────────────┤
│        BottomNav (fixed bottom)  │  ~72 px, bg-white, border-t
└─────────────────────────────────┘
```

The root `<body>` and `<html>` are `height: 100%; overflow: hidden` — the shell owns all scroll. The content region uses `overflow-y: auto` with scrollbar hidden (`.no-scrollbar`).

The Vue app mounts inside `<div id="app">` in `src/index.html`. The outer shell (`AppBar` + `BottomNav`) is persistent across all routes; only the content region swaps on navigation.

---

## Component Catalogue

### AppBar

**File:** `src/components/AppBar.vue` (implicit — lives in root App shell)

```
[ ◎  guia.js ]                    [ 🔔 ] [ avatar ]
```

- `sticky top-0 z-50`
- `bg-white/80 backdrop-blur-md` — frosted glass over scrolled content
- `border-b border-outline-variant`
- Left: app logo / name with compass icon
- Right: notification bell + user avatar (placeholder)
- Height: ~56 px

---

### AppHeroHeader

**File:** `src/components/AppHeroHeader.vue`

```
┌─────────────────────────────────────────────────┐
│  ONDE ESTOU?                                    │
│  ↗  — · —                                       │
└─────────────────────────────────────────────────┘
```

- `bg-gradient-to-br from-primary to-indigo-800` — deep blue gradient
- `rounded-3xl p-6 text-white shadow-xl shrink-0`
- Eyebrow: `text-xs font-bold uppercase tracking-[0.2em] opacity-80` — "ONDE ESTOU?"
- Icon: `bi bi-cursor-fill text-3xl` — GPS cursor arrow
- Location display: `text-2xl font-bold leading-tight` — shows city/street or "— · —" as placeholder
- `aria-live="polite"` on the `<h2>` — screen readers announce location changes
- `data-pending="true"` attribute removed by `HTMLHighlightCardsDisplayer` once real data arrives

---

### Onboarding

**File:** `src/components/Onboarding.vue`

Conditionally shown (`v-show="showOnboarding"`) when geolocation permission has not yet been granted or when an error occurred.

```
┌─────────────────────────────────────────────────┐
│  📍  Ativar Localização                         │
│  Permita acesso à localização para...           │
│                                                 │
│  [ ATIVAR LOCALIZAÇÃO ]  (full-width button)    │
└─────────────────────────────────────────────────┘
```

- White card, `rounded-2xl`, `border border-outline-variant`
- Error state: card border turns `border-error`, icon changes to warning symbol
- Button: full-width, filled primary style, `bg-primary text-white`
- Props: `hasError: boolean`
- Hides once `PositionManager` receives first GPS fix

---

### LocationHighlightCards

**File:** `src/components/LocationHighlightCards.vue`

Three stacked vertical cards, one per address level. Each card is independent and updates asynchronously as geocoding data arrives.

```
┌─────────────────────────────────────────────────┐
│  MUNICÍPIO                                      │
│  Região Metropolitana de São Paulo              │   ← shown only for true metro regions
│  SÃO PAULO, SP                                  │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  BAIRRO                                         │
│  CONSOLAÇÃO                                     │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  LOGRADOURO                                     │
│  AV. PAULISTA                                   │
└─────────────────────────────────────────────────┘
```

**Card anatomy:**

| Element | Classes | Notes |
|---|---|---|
| Container | `highlight-card bg-white border border-outline-variant p-6 rounded-2xl shadow-sm` | White card with subtle border |
| Category label | `text-xs font-black text-outline uppercase tracking-widest` | e.g. "MUNICÍPIO" |
| Sub-value | `text-sm text-outline font-medium mt-1` | Metropolitan region (hidden when empty) |
| Primary value | `text-xl font-bold text-indigo-950 mt-1 uppercase leading-tight` | Main address field |

**Section wrapper:** `section.location-highlights space-y-4` — `space-y-4` (16 px vertical gap between cards).

**Layout override:** `highlight-cards.css` (legacy) sets `.location-highlights { display: flex }`. This is neutralized in `md3-theme.css` via `#app .location-highlights { display: block !important }`.

**Placeholder state:** Each `<p>` shows `—` (em-dash) until the geocoder populates the value.

**MUNICÍPIO display:** Shows `"CIDADE, UF"` format (e.g. "SÃO PAULO, SP") when `siglaUF` is available. The state abbreviation is resolved from: `state_code` field → `ISO3166-2-lvl4` field → state-name lookup table (fallback for flat geocoder formats that omit explicit codes).

**Metropolitan region sub-text:** Shown only for real metropolitan regions (e.g. "Região Metropolitana de São Paulo"). Filtered out for Brazilian macroregions ("Região Sudeste", "Região Nordeste", etc.) — these are geocoding artifacts from the Nominatim `county` field, not meaningful sub-municipality data.

**Accessibility:** Each card is `role="region"` with `aria-labelledby` pointing to its category label. Primary values have `aria-live="polite"`.

---

### BottomNav

**File:** `src/components/BottomNav.vue`

Fixed bottom navigation bar with 6 tabs, optimized for thumb reach.

```
[ Home ] [ Routes ] [ Maps ] [ Monitor ] [ Stats ] [ History ]
```

| Tab | Path | Icon (inactive) | Icon (active) |
|---|---|---|---|
| Home | `/` | `bi-house` | `bi-house-fill` |
| Routes | `/converter` | `bi-compass` | `bi-compass-fill` |
| Maps | `/map` | `bi-map` | `bi-map-fill` |
| Monitor | `/monitor` | `bi-speedometer2` | `bi-speedometer2` |
| Stats | `/stats` | `bi-bar-chart` | `bi-bar-chart-fill` |
| History | `/history` | `bi-clock-history` | `bi-clock-history` |

**Active tab treatment:**

- Outer link: `bg-primary/5` background tint
- Icon wrapper: `bg-primary-container text-white` (blue pill background)
- Label: `text-primary`
- Indicator dot: `w-1.5 h-1.5 bg-primary rounded-full absolute -top-1` (small dot above icon)

**Inactive tab treatment:**

- Icon: `text-on-surface-variant`
- Label: `text-on-surface-variant opacity-60`

**Structure:**

```
<nav role="navigation" aria-label="Navegação principal">
  <a aria-current="page" aria-label="{tab.label}">
    <span aria-hidden="true" />   <!-- indicator dot (active only) -->
    <div>                          <!-- icon wrapper -->
      <i class="bi ..." />
    </div>
    <span>{label}</span>
  </a>
</nav>
```

---

## Views (Tab Content)

### Home (`/`)

**File:** `src/components/HomeView.vue`

```
<div class="p-6 space-y-6 flex flex-col min-h-full bg-surface">
  AppHeroHeader
  Onboarding (v-show, conditional)
  LocationHighlightCards
</div>
```

- `p-6` outer padding (24 px all sides)
- `space-y-6` (24 px gap between sections)
- `bg-surface` (#f8f9fa) — the ice-grey base

**Data flow:**

```
Geolocation API
  → PositionManager (debounced: ≥20 m or ≥30 s)
    → ReverseGeocoder (Nominatim OSM)
      → NominatimAddressExtractor
        → BrazilianStandardAddress
          → HTMLHighlightCardsDisplayer
            → DOM: #municipio-value, #bairro-value, #logradouro-value,
                   #regiao-metropolitana-value, #header-location-text
```

---

### Routes / Converter (`/converter`)

**File:** `src/views/ConverterView.vue` + `src/coordination/ServiceCoordinator.ts`

Coordinate-to-address conversion form.

```
┌─────────────────────────────────────────────────┐
│  Coordenadas → Endereço                         │
│  Latitude:  [ -23.550520 ]                      │
│  Longitude: [ -46.633309 ]                      │
│  [ CONVERTER PARA ENDEREÇO ]                    │
│                                                 │
│  Result panel (aria-live)                       │
└─────────────────────────────────────────────────┘
```

- Form inputs: `md3-card` style
- Submit button: `md3-button-filled` → `bg-primary text-white`
- Result: populated in `#address-result`, `aria-live="polite"`

---

### Maps (`/map`)

**File:** `src/components/views/MapView.vue` (inferred)

MapLibre GL JS fullscreen map with floating location overlay and category chips.

```
┌─────────────────────────────────────────────────┐
│  [ Categoria A ] [ Categoria B ] [ Categoria C ]│  ← chip filter row
│                                                 │
│                  MAP CANVAS                     │
│                                                 │
│  ┌──────────────────────────────┐               │
│  │  📍 Rua Atual, Bairro        │               │  ← floating overlay (backdrop-blur)
│  └──────────────────────────────┘               │
└─────────────────────────────────────────────────┘
```

- Map container: full viewport width/height
- Chip filter: horizontal scroll, `bg-secondary-container text-secondary rounded-full px-3 py-1`
- Floating overlay: `bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-level-3`

---

### Monitor (`/monitor`)

**File:** `src/components/views/MonitorView.vue`

Chronometer and speech synthesis diagnostics panel.

```
┌─────────────────────────────────────────────────┐
│  ⏱  00:00:00.000                                │  ← shared chronometer display
│                                                 │
│  [ Texto para síntese de voz... ]               │  ← textarea
│  [ ▶ FALAR ]                                    │
└─────────────────────────────────────────────────┘
```

- Chronometer: monospaced (`font-mono`), large display
- Uses `src/timing/sharedChronometer.ts` singleton
- Speech textarea: standard `<textarea>` with MD3 input styling
- No route `loadingEnabled` — loads instantly (no heavy init)

---

### Stats (`/stats`)

**File:** `src/components/views/StatsView.vue`

IBGE demographic statistics for the current municipality.

```
[ Todos ] [ População ] [ Economia ] [ Infraestrutura ]  ← filter pills

┌─────────────┐  ┌─────────────┐
│  CATEGORIA  │  │  CATEGORIA  │
│  Título     │  │  Título     │
│  12.345.678 │  │  R$ 45.678  │
│  ↑ +2.3%    │  │  ↓ -0.8%   │
└─────────────┘  └─────────────┘
```

- **StatCard anatomy:** Category (small caps) → Title → Value → Trend indicator
- Filter pills: `bg-secondary-container rounded-full`, active = `bg-primary text-white`
- Data source: IBGE SIDRA API (`IBGECityStatsService`) with offline fallback JSON
- Values formatted according to Brazilian locale (pt-BR): numbers with `.` thousand separators, currency with `R$`

---

### History (`/history`)

**File:** `src/components/views/HistoryView.vue`

App preferences, navigation history, and version information.

```
┌─────────────────────────────────────────────────┐
│  PREFERÊNCIAS                                   │
│  Síntese de voz   [ toggle ]                    │
│  Notificações     [ toggle ]                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  HISTÓRICO DE LOCALIZAÇÃO                       │
│  • São Paulo, SP — há 2 min                     │
│  • Osasco, SP — há 15 min                       │
└─────────────────────────────────────────────────┘

  v0.17.2-alpha · mpbarbosa@gmail.com
```

- `ToggleSwitch` component for preferences — WCAG 2.1 AA compliant (`role="switch"`, `aria-checked`)
- History list: chronological, most recent first
- Version string from `src/config/version.js`

---

## Accessibility

| Pattern | Implementation |
|---|---|
| Route focus management | On route change, `manageFocusAfterRouteChange()` finds the first `<h1>` in the new view and calls `.focus({ preventScroll: true })` with `tabindex="-1"` |
| Live regions | `aria-live="polite"` on `#municipio-value`, `#bairro-value`, `#logradouro-value`, `#header-location-text` |
| Navigation landmark | `<nav role="navigation" aria-label="Navegação principal">` on BottomNav |
| Active page | `aria-current="page"` on the active BottomNav tab |
| Card regions | `role="region"` + `aria-labelledby` on each LocationHighlightCard |
| Decorative icons | `aria-hidden="true"` on all `<i class="bi ...">` elements |
| Button state | `src/utils/button-status.js` helpers (`disableWithReason`, `enableWithMessage`) — never raw DOM `disabled` toggling |
| Color contrast | All text/background combinations meet WCAG AA (4.5:1 normal, 3:1 large) |

---

## Micro-interactions & Transitions

| Interaction | Implementation |
|---|---|
| Tab switch | CSS `transition-all duration-300` on icon wrapper and label |
| Active tab indicator | Active dot appears/disappears with `v-if` (no animation — instant) |
| Icon fill swap | `:class` binding swaps outline ↔ fill icon class on route match |
| Location update | `aria-live="polite"` announces to screen readers; no visual animation |
| Onboarding hide | `v-show` toggle — CSS display none/block, no transition |

No JS animation library is used. All transitions are CSS-only via Tailwind `transition-*` utilities.

---

## CSS Architecture

```
src/styles/
├── md3-theme.css          # @theme {} tokens + Tailwind import + global overrides
├── fonts.css              # @font-face declarations (Inter, JetBrains Mono)
└── (Tailwind utilities)   # Generated at build time from md3-theme.css tokens

src/
├── advanced-controls.css  # Legacy panel styles
└── highlight-cards.css    # Legacy card styles (conflicts neutralized by md3-theme.css)
```

**Legacy CSS coexistence:** `highlight-cards.css` predates the Vue/Tailwind migration and sets `.location-highlights { display: flex; flex-wrap: wrap }` and `.highlight-card { background: gradient; text-align: center }`. These are neutralized with `#app`-scoped `!important` overrides in `md3-theme.css` without touching the legacy file (which still powers the non-Vue fallback HTML shell).

---

## Libraries

| Library | Version | Role |
|---|---|---|
| Vue 3 | 3.x | SPA framework (Composition API, `<script setup>`) |
| Vue Router | 4.x | Hash-mode routing (`#/`, `#/converter`, …) |
| Tailwind CSS | 4.x | Utility-first styling; tokens via `@theme {}` |
| Bootstrap Icons | 1.13.1 | Icon set (`bi-*` classes via CDN) |
| MapLibre GL JS | latest | Map rendering (Maps tab) |
| Inter | variable | UI typeface (local + CDN fallback) |
| JetBrains Mono | variable | Monospace typeface for data/code |

---

## File Map (UI-relevant)

```
src/
├── app.ts                          # Vue entry, router setup, focus management
├── index.html                      # Shell HTML: #app mount point, legacy #app-content
├── styles/
│   ├── md3-theme.css               # Design tokens, global base styles
│   └── fonts.css                   # Font declarations
├── components/
│   ├── AppHeroHeader.vue           # Blue gradient hero card
│   ├── BottomNav.vue               # 6-tab bottom navigation
│   ├── HomeView.vue                # Home tab layout
│   ├── LocationHighlightCards.vue  # Município / Bairro / Logradouro cards
│   ├── Onboarding.vue              # Permission request card
│   └── views/
│       ├── MonitorView.vue         # Chronometer + speech
│       ├── StatsView.vue           # IBGE demographic stats
│       ├── HistoryView.vue         # Preferences + location history
│       ├── MapView.vue             # MapLibre map
│       └── ConverterView.vue       # Coordinate converter
├── html/
│   ├── HTMLHighlightCardsDisplayer.ts  # Writes to #municipio-value etc.
│   ├── HTMLPositionDisplayer.ts        # Writes lat/lng/accuracy
│   └── HTMLAddressDisplayer.ts         # Writes full address string
└── data/
    ├── BrazilianStandardAddress.ts     # Value object; municipioCompleto(), regiaoMetropolitanaFormatada()
    └── AddressExtractor.ts             # Nominatim → BrazilianStandardAddress mapping
```
