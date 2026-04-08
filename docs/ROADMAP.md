# 🗺️ Guia Turístico — Project Roadmap

**Current Version**: `0.14.4-alpha` | **Status**: Active Development
**Last Updated**: 2026-03-29

---

## ✅ Completed (v0.9 – v0.13)

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
- **Log audit fixes** (2026-03-26): resolved `APP_VERSION.patch` mismatch in `src/config/defaults.ts` (RI-001), merge conflict in `service-worker.js` (RI-002), restored files staged for deletion by failed workflow run (RI-003)
- **Nearby Places** — `OverpassService.ts` + `HTMLNearbyPlacesPanel.ts`; Overpass API integration for 6 categories; auto-enables when GPS available (v0.13.1-alpha)
- **City Statistics** — `IBGECityStatsService.ts` + `HTMLCityStatsPanel.ts`; live IBGE population + area data; offline-capable (v0.13.1-alpha)
- **Dependency upgrades** (v0.13.1-alpha): `paraty_geocore.js` → `v0.12.10-alpha`, `ibira.js` → `v0.4.22-alpha`, `bessa_patterns.ts` → `v0.12.15-alpha`
- **Bootstrap 5.3 responsive navbar** (v0.14.4-alpha): Bootstrap 5.3 + Bootstrap Icons; `<nav class="navbar navbar-expand-md">` with Início + Conversor links, hamburger toggle, MD3 token bridge via `bootstrap-overrides.css`, dedicated `ui` Vite chunk; footer converter links removed

---

## 🚧 Near-Term (v0.15-alpha)

### ✅ Repo Consolidation — `guia_turistico` → `guia_js` (DONE)

Local folder renamed from `guia_turistico/` to `guia_js/` to match the GitHub remote (`guia.js`). All internal references updated across both repos. Stale self-dependency (`"guia.js": "github:mpbarbosa/guia_js#v0.6.0-alpha"`) removed from `package.json`. Companion updates applied to `mpbarbosa_site`.

**Optional follow-up: Rename GitHub repo `guia.js` → `guia_js`**

Recommended for full name consistency between local folder and remote, but independent — can be done any time.

1. GitHub → repository Settings → rename `guia.js` to `guia_js`. GitHub creates a permanent redirect from the old name, so all existing external links and CDN URLs remain valid.
2. `git remote set-url origin git@github.com:mpbarbosa/guia_js.git` → `git fetch` to confirm.

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
| Consolidate duplicate `CHANGELOG.md` v0.9.0 entries | ~~Low~~ ✅ Done |

---

## 🔧 Resolved Minor Issues (audit-and-fix)

Issues identified from `.ai_workflow` workflow runs and resolved via the `audit-and-fix` pipeline.

| ID | Title | Type | Fix | Commit |
|----|-------|------|-----|--------|
| RI-001 | Version mismatch in `src/config/defaults.ts` | docs-outdated | Set `APP_VERSION.patch = 5` to match `package.json` `0.12.12-alpha` | c997728 |
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
| RI-014 | Version mismatch: `APP_VERSION.patch` was 6 in `src/config/defaults.ts` | docs-outdated | Updated `patch: 6` to `patch: 7`; `npm run check:version` exits 0 | 9238ce7 |
| RI-015 | Undocumented `__mocks__` directory | undocumented-directory | Created `__mocks__/README.md` describing `fileMock.js` purpose and when to add new mocks; `npm run lint:md` exits 0 | 522982b |
| RI-016 | Broken references to missing guide files in `CONTRIBUTING.md` | docs-outdated | Created 8 missing guide files: `JSDOC_GUIDE.md`, `REFERENTIAL_TRANSPARENCY.md`, `CODE_REVIEW_GUIDE.md`, `TDD_GUIDE.md`, `UNIT_TEST_GUIDE.md`, `LOW_COUPLING_GUIDE.md`, `HIGH_COHESION_GUIDE.md`, `docs/PROJECT_PURPOSE_AND_ARCHITECTURE.md`; `npm run lint:md` exits 0 | ca29e3e |
| RI-017 | Version mismatch: `APP_VERSION.patch` was 7 in `src/config/defaults.ts` | docs-outdated | Updated `patch: 7` to `patch: 9`; `npm run check:version` exits 0 | df7dd25 |
| RI-018 | Undocumented `.github/skills` directory | undocumented-directory | Created `.github/skills/README.md` pointing to `.github/SKILLS.md`; `npm run lint:md` exits 0 | df7dd25 |
| RI-019 | Version badge in `README.md` outdated | docs-outdated | Updated badge from `0.11.7-alpha` to `0.12.12-alpha` | 93fdd37 |
| RI-020 | Undocumented `__tests__/services/providers` directory | undocumented-directory | Created `__tests__/services/providers/README.md` describing the 3 provider test files | 7889dba |
| RI-021 | Missing `.github/JAVASCRIPT_BEST_PRACTICES.md` (RI-016 incomplete) | docs-outdated | Created `.github/JAVASCRIPT_BEST_PRACTICES.md` JavaScript coding standards guide | 5ac25aa |
| RI-022 | Missing `docs/architecture/REFERENCE_PLACE.md` | docs-outdated | Created `docs/architecture/REFERENCE_PLACE.md` ReferencePlace class architecture doc | a5b71fa |
| RI-023 | Missing guide files in `.github/ISSUE_TEMPLATE/github_config.md` | docs-outdated | Created `WORKFLOW_SETUP.md`, `docs/github/GITHUB_ACTIONS_GUIDE.md`, `docs/github/ISSUE_TEMPLATE_COMPARISON.md` | a5b71fa |
| RI-024 | Missing `docs/MIGRATION_v0.10.0.md` | docs-outdated | Created `docs/MIGRATION_v0.10.0.md` HomeViewController migration guide | a5b71fa |
| RI-025 | Markdown lint violations in `.github/SKILLS.md` | markdown-lint | Removed duplicate heading, broken fragment links, truncated row, embedded YAML block | fd6ab55 |
| RI-026 | Markdown lint violations in 8 other project files | markdown-lint | Fixed MD003/MD024/MD055/MD056 violations in CHANGELOG.md and 7 other files; `npm run lint:md` exits 0 | b16bacb |
| RI-027 | `APP_VERSION.patch` was 10 instead of 12 in `src/config/defaults.ts` | docs-outdated | Updated `patch: 10` → `patch: 12`; `tsc --noEmit` exits 0 | 24b2a70 |
| RI-028 | Missing `"private": true` in `package.json` | dependency-warning | Added `"private": true` after version field | 4aa43e7 |
| RI-029 | Broken link to non-existent `FALSE_POSITIVE_PATTERNS.md` in `docs/INDEX.md` line 61 | docs-outdated | Replaced with valid link to `.github/CONTRIBUTING.md` | a4aa69a |
| RI-030 | `navigator.permissions` not restored after 4 tests in `onboarding.test.ts` | missing-test-coverage | Added `beforeEach`/`afterEach` to save and restore `navigator.permissions`; 10/10 tests pass | e5ac928 |
| RI-031 | Browser `fetch()` fallback in `ReverseGeocoder.ts` has no AbortController | missing-test-coverage | Added `AbortController` to native `fetch()` path only; stored as `_abortController` instance field; `tsc --noEmit` exits 0 | 7b4c2a5 |
| RI-032 | Unsafe `as Record<string, unknown>` casts in `address-parser.ts` without validation | typescript-issue | Added `isRecord()` type guard; guard is called before each cast; 49/49 tests pass | 85948b9 |
| RI-033 | Version mismatch in README.md (0.12.x vs 0.14.4-alpha) | docs-outdated | Updated front-matter and badge to 0.14.4-alpha | ca4fc3c |
| RI-034 | Version mismatch in src/config/defaults.ts (patch: 0 vs patch: 1) | docs-outdated | Changed patch to 1 in APP_VERSION | ca4fc3c |
| RI-035 | 6 broken internal links in docs/INDEX.md | docs-outdated | Replaced each broken link with correct existing path | f6b34ec |
| RI-036 | 10,411 MDL violations across 443 .md files (MD007/MD009/MD026/MD047) | markdown-lint | Stripped trailing whitespace, ensured final newlines, fixed SKILLS.md setext heading | fd1cf81 |
| RI-037 | Missing try/catch in .github/scripts/jsdoc-audit.js fs calls | architecture-mismatch | Wrapped readdirSync/statSync/readFileSync in try/catch with safe defaults | d14b153 |
| RI-038 | Undocumented eslint-disable any in src/andarilho.ts | typescript-issue | Added inline comment explaining legacy global pattern | 40c820c |
| RI-039 | Version mismatch in src/config/defaults.ts (patch: 1 vs patch: 2) | docs-outdated | Changed `patch: 1` → `patch: 2` in `APP_VERSION`; `npm run check:version` exits 0 | 410abff |
| RI-040 | Broken links in docs/INDEX.md (MODULE_SPLITTING, TESTING, JEST guide, TESTING_HTML) | docs-outdated | Replaced 4 broken links with correct existing paths; `npm run lint:md` exits 0 | a02c4d6 |
| RI-041 | Version mismatch: `APP_VERSION.patch` was `2` in `src/config/defaults.ts` vs `patch: 3` in `package.json` | docs-outdated | Changed `patch: 2` → `patch: 3`; `npm run check:version` exits 0 | af7b940 |
| RI-042 | `.workflow_session_cloc_cache.json` was git-tracked auto-generated artefact | architecture-mismatch | Added `.workflow_session_cloc_cache.json` to `.gitignore` and ran `git rm --cached` | 8c7d6fd |
| RI-043 | Divergent paths in `manifest.json` vs `public/manifest.json` (absolute vs relative) | docs-outdated | Updated `manifest.json` to use relative paths (`./`) matching canonical `public/manifest.json` | bad6580 |
