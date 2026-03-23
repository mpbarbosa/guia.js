# 🗺️ Guia Turístico — Project Roadmap

**Current Version**: `0.12.7-alpha` | **Status**: Active Development
**Last Updated**: 2026-03-22

---

## ✅ Completed (v0.9 – v0.14)

- Real-time geolocation tracking with position/address display
- Brazilian address standardization (Nominatim + IBGE)
- IBGE SIDRA population data integration (online + offline fallback)
- Metropolitan region (Região Metropolitana) detection & display
- Municipio + bairro highlight cards
- Speech synthesis for address announcements (Brazilian Portuguese voice prioritization)
- Material Design 3 UI with WCAG 2.1 accessibility
- Refactored `HtmlSpeechSynthesisDisplayer` to facade pattern (−36% lines)
- Partial TypeScript migration (coordination, core, data, config layers)
- **Full TypeScript migration complete** — all 95 `src/` files are `.ts`, `tsc --noEmit` exits 0, strict mode enabled
- **PWA finalized** — `service-worker.js` with network-first/cache-first strategies, `offline.html` fallback, registered in `index.html`
- **AWS Location Service** — `AwsGeocoder.ts` + `AwsAddressExtractor.ts` integrated; UI toggle (`#provider-switch-btn`) + `switchProvider()` wired end-to-end
- **Interactive Map** — MapLibre GL 5.x inline map (`MapLibreDisplayer.ts`) with position marker and toggle button
- Vite build system with code splitting (25% bundle reduction)
- Contextual button status messages (`button-status.ts`)
- `paraty_geocore.js` CDN dependency for shared geolocation primitives

---

## 🚧 Near-Term (v0.15-alpha) — In Progress

### ✅ Nearby Places — Implemented

- `OverpassService.ts`: Overpass API integration for OSM place search by category
- `HTMLNearbyPlacesPanel.ts`: Panel renders results with distance and OSM links
- Supported categories: restaurants, pharmacies, hospitals, tourist attractions, cafés, supermarkets
- Buttons auto-enable when GPS coordinates become available

### ✅ City Statistics — Implemented

- `IBGECityStatsService.ts`: Live IBGE Localidades + IBGE SIDRA population queries
- `HTMLCityStatsPanel.ts`: Panel renders population, area (km²), IBGE code with links
- Municipality name sourced from cached Nominatim result (no extra network call)

### Offline-First Architecture

- Cache IBGE municipality data locally (IndexedDB)
- Cache recent addresses and positions for offline access
- Background sync for queued address lookups

### Route Navigation Utility

- Simple A→B route between two Brazilian addresses
- Integration with public OpenRouteService or OSRM

---

## 🌟 Long-Term (v1.0 — Stable Release)

### Stable API & Public 1.0 Release

- Remove `alpha` designation across all version strings
- Semantic versioning policy enforced (no breaking changes without major bump)
- Full public API documentation (JSDoc → HTML)

### Multi-Language Support

- English translation layer (i18n)
- Maintain Brazilian Portuguese as primary

### Accessibility Audit & Certification

- Full WCAG 2.1 AA audit by automated + manual tools
- Screen reader testing on iOS VoiceOver and Android TalkBack
- Leverage Leaflet 2.0 accessible map controls: `aria-keyshortcuts` on map container, accessible popup close button `aria-label`

### Performance Targets

- Lighthouse score: ≥ 90 Performance, ≥ 95 Accessibility
- Bundle size: < 500 KB gzipped
- Core Web Vitals: LCP < 2.5s, CLS < 0.1

---

## 🔑 Key Technical Debt

| Item | Priority |
|---|---|
| ~~Replace placeholder `findNearbyRestaurants()`~~ ✅ Done | ~~Medium~~ |
| ~~Replace placeholder `fetchCityStatistics()`~~ ✅ Done | ~~Medium~~ |
| Offline-First Architecture (IndexedDB caching) | Medium |
| Route Navigation Utility (OpenRouteService/OSRM) | Low |
| Consolidate duplicate `CHANGELOG.md` v0.9.0 entries | Low |

---

## 🔧 Resolved Minor Issues (audit-and-fix)

Issues identified from `.ai_workflow` workflow runs and resolved via the `audit-and-fix` pipeline.

| ID | Title | Type | Fix | Commit |
|----|-------|------|-----|--------|
| RI-001 | Version mismatch in `src/config/defaults.ts` | docs-outdated | Set `APP_VERSION.patch = 5` to match `package.json` `0.12.7-alpha` | c997728 |
| RI-002 | Loose return type on `getRoute()` | typescript-issue | Added `RouteConfig` interface; updated `getRoute` return type to `RouteConfig \| null` | c997728 |
| RI-003 | Missing `CONTRIBUTING.md` at repository root | docs-outdated | Created root `CONTRIBUTING.md` linking to `.github/CONTRIBUTING.md` | 0838a50 |
| RI-004 | Missing `docs/GETTING_STARTED.md` | docs-outdated | Created `docs/GETTING_STARTED.md` index pointing to `docs/guides/GETTING_STARTED.md` | 0838a50 |
| RI-005 | Missing `docs/API.md` | docs-outdated | Created `docs/API.md` index pointing to `docs/api/API_REFERENCE.md` | 0838a50 |
| RI-006 | Missing `docs/ARCHITECTURE.md` | docs-outdated | Created `docs/ARCHITECTURE.md` index pointing to `docs/architecture/` | 0838a50 |
| RI-007 | Remaining `.js` files blocking full TS strict-mode | typescript-issue | Converted all 11 remaining JS source files to TypeScript; fixed all type errors; `tsc --noEmit` exits 0; 181/181 tests pass | 3d677bc |
| RI-008 | Original `.js` files still present alongside `.ts` counterparts | cleanup | Deleted all 11 original `.js` source files + dead `SpeechSynthesisManager.facade-wip.js`; updated `validate` script to use `tsc --noEmit` | 196a3a4 |
| RI-009 | Broken script references in workflow-automation and infrastructure docs | docs-outdated | Added `⚠️ Not implemented` notices to 5 files (`AUTOMATION_TOOLS.md`, `AUTOMATION_SUMMARY.md`, `FINAL_AUTOMATION_SUMMARY.md`, `WORKFLOW_OPTIMIZATION_COMBINED.md`, `GIT_HOOKS_INVESTIGATION.md`) for 17 missing scripts | fc58b57 |
| RI-010 | MD032 violations in `fix-log-issues` SKILL.md | markdown-lint | Added blank lines before each numbered list in Fix procedure blocks; `npm run lint:md` exits 0 | ab9f9c8 |
| RI-011 | Version mismatch: `APP_VERSION.patch` was 5 in `src/config/defaults.ts` | docs-outdated | Updated `patch: 5` to `patch: 6`; `npm run check:version` exits 0 | d383354 |
| RI-012 | MD031 violation in `.github/skills/copy-ts-to-paraty/SKILL.md` line 272 | markdown-lint | Added blank line before fenced code block; `npm run lint:md` exits 0 | f676312 |
| RI-013 | MD032 violation in `docs/throttle-geolocation.md` line 4 | markdown-lint | Added blank line before list in blockquote; `npm run lint:md` exits 0 | bda4c6a |
