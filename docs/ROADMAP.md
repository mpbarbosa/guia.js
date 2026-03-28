# 🗺️ Guia Turístico — Project Roadmap

**Current Version**: `0.13.1-alpha` | **Status**: Active Development
**Last Updated**: 2026-03-27

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

---

## 🚧 Near-Term (v0.14-alpha) — In Progress

### Repo Consolidation — Rename `guia_turistico` → `guia_js`

Infrastructure housekeeping to align the local folder name and GitHub repo name, eliminating the confusion caused by having two local clones pointing to the same remote.

**Context**: The active project lives in a local folder named `guia_turistico/` whose remote is `github.com/mpbarbosa/guia.js`. A second local folder `guia_js/` is an outdated clone of the same remote (at v0.6.0). Both point to the same GitHub repo via a redirect.

**Execution mode: one step at a time — stop after each step and wait for confirmation before proceeding.**

#### Step 1 — Pre-flight
Commit pending changes (`docs/ROADMAP.md`); push the 2 local-only commits so the remote is fully current.
*Test*: `git status` shows clean; `git log --oneline -3` shows HEAD matches `origin/main`.
⏸ **Stop — wait for user confirmation.**

#### Step 2 — Backup
`cp -r /home/mpb/Documents/GitHub/guia_turistico /home/mpb/Documents/GitHub/guia_turistico.bak`
*Test*: `ls /home/mpb/Documents/GitHub/guia_turistico.bak/src` lists source files.
⏸ **Stop — wait for user confirmation.**

#### Step 3 — Remove outdated local clone
`rm -rf /home/mpb/Documents/GitHub/guia_js`
*Test*: `ls /home/mpb/Documents/GitHub/guia_js` returns "No such file or directory".
⏸ **Stop — wait for user confirmation.**

#### Step 4 — Rename local folder
`mv /home/mpb/Documents/GitHub/guia_turistico /home/mpb/Documents/GitHub/guia_js`
*Test*: `ls /home/mpb/Documents/GitHub/guia_js/src` lists source files; `guia_turistico/` no longer exists.
⏸ **Stop — wait for user confirmation.**

#### Step 5 — Verify git remote
`cd /home/mpb/Documents/GitHub/guia_js && git remote -v && git fetch origin`
*Test*: remote URL still resolves to `guia.js.git`; `git fetch` exits 0.
⏸ **Stop — wait for user confirmation.**

#### Step 6 — Update internal references
Update all occurrences of `guia_turistico` across the project:

- `package.json` — `"name"` field: `guia_turistico` → `guia_js`
- `.workflow-config.yaml` — `name: "guia_turistico"` → `name: "guia_js"`
- `scripts/build_and_deploy.sh` — line 80 comment referencing `guia_turistico/`
- `scripts/deploy-preflight.sh` — verify and update any path references
- **`.github/skills/`** — 8 references across 6 files:
  - `validate-node-modules/SKILL.md` — lines 68 and 210
  - `sync-version/SKILL.md` — line 284
  - `purge-workflow-logs/SKILL.md` — line 48
  - `next-roadmap-phase/SKILL.md` — lines 14 and 66 (includes `gh issue list --repo mpbarbosa/guia_turistico`)
  - `update-paraty-geocore/SKILL.md` — line 4
  - `update-guia/SKILL.md` — line 4
  - `update-ibira/SKILL.md` — line 4
- `README.md` — ~15 occurrences (clone URLs, directory tree, CDN URL examples)
- `.github/workflows/` — any badge URLs or repo path references
- `.github/` other scripts and docs — scan for any remaining `guia_turistico` strings
- `cdn-urls.txt` — regenerate with `./.github/scripts/cdn-delivery.sh`
- **`mpbarbosa_site` repo** — companion updates needed in the sibling repo:
  - `src/index.html` line 96: `href="guia_turistico/"` → `href="guia_js/"`
  - `src/pages/guia-turistico.html`: redirect URL `../guia_turistico/index.html` → `../guia_js/index.html`
  - Shell deploy scripts: `cd ../guia_turistico` → `cd ../guia_js`; rename `copy_guia_turistico_project` function and `public/guia_turistico/` deploy target → `public/guia_js/`
  - Tests (`html_functionality.test.js`, `project_navigation.test.js`, `shell_scripts.test.js`, `shell_integration.test.js`): update all `guia_turistico` string expectations
  - `src/README.md` and `shell_scripts/README.md`: update path references
  - `COMPREHENSIVE_ROADMAP_2025-12-27.md`: update repo path and deployed path references
  - **Note**: renaming `public/guia_turistico/` → `public/guia_js/` changes the live URL on the site; consider a `guia_turistico/index.html` redirect file to preserve old bookmarks

*Test*: `grep -r "guia_turistico" . --include="*.sh" --include="*.json" --include="*.md" --include="*.yml" --include="*.yaml" --exclude-dir=node_modules --exclude-dir=.git` returns no matches.
⏸ **Stop — wait for user confirmation.**

#### Step 7 — Verify (full test suite)
`npm install` → `npm run validate` → `npm run build` → `npm run test:all`
*Test*: All pass; no new failures vs. baseline.
⏸ **Stop — wait for user confirmation.**

#### Step 8 — Commit and push
Commit all reference changes with a clear message; push to `origin/main`.
*Test*: `git log --oneline -1` shows the commit; `git status` is clean.
⏸ **Stop — wait for user confirmation.**

#### Step 9 — Remove backup
`rm -rf /home/mpb/Documents/GitHub/guia_turistico.bak`
*Test*: path no longer exists.
⏸ **Done.**

### Optional follow-up: Rename GitHub repo `guia.js` → `guia_js`

Recommended for full name consistency between local folder and remote, but independent — can be done any time after Step 8.

1. GitHub → repository Settings → rename `guia.js` to `guia_js`. GitHub creates a permanent redirect from the old name, so all existing external links, CDN URLs, and `npm install` references remain valid.
2. `git remote set-url origin git@github.com:mpbarbosa/guia_js.git` → `git fetch` to confirm.
3. Verify the `"guia.js"` dependency in `package.json` (`github:mpbarbosa/guia_js#<TAG>`) resolves correctly with `npm install`.
4. Commit: `chore: update remote URL after GitHub repo rename guia.js → guia_js`.

**Risks**: GitHub redirect keeps old CDN URLs valid; jsDelivr resolves through the redirect. Out-of-repo scripts referencing the old `guia_turistico` path must be updated manually.

### Offline-First Architecture

- Cache IBGE municipality data locally (IndexedDB)
- Cache recent addresses and positions for offline access
- Background sync for queued address lookups

### Bootstrap Navigation Bar

Adds a responsive, accessible primary navbar using **Bootstrap 5.3 + Bootstrap Icons**, bridged to the existing Material Design 3 token system — no palette conflict.

**Scope**: Home (`/#/`) and Converter (`/#/converter`) only. New views are added to the menu as they ship.

**Implementation steps**:

1. Install `bootstrap` + `bootstrap-icons` as production dependencies (`npm install bootstrap bootstrap-icons`).
2. Create `src/bootstrap-overrides.css` (~30 lines) — maps `--bs-primary`, `--bs-body-bg`, `--bs-navbar-color`, and related Bootstrap CSS vars to the existing `--md-sys-color-*` MD3 design tokens.
3. Add a dedicated `ui` Vite manual chunk for Bootstrap assets (clean bundle split, no contamination of app chunks).
4. Insert a `<nav class="navbar navbar-expand-md">` block in `src/index.html` — after the progress bar, before the hero header — containing the brand logo, **Início** and **Conversor** links, and a hamburger toggle for mobile (`navbar-expand-md` breakpoint).
5. Extend `updateActiveNavLink()` in `src/app.ts` to add the Bootstrap `.active` class (and `aria-current="page"`) to `.navbar-nav a` on route change.
6. Clean up `src/navigation.css`: delete the 45-line commented-out `.app-navigation { ... }` block (dead since v0.9.0).
7. Remove the footer converter link from `src/index.html` (now promoted to the navbar).
8. Verify: `npm run build` (check `ui` chunk size), `npm run test:unit` (baseline unchanged), `npm run validate` (`tsc --noEmit` exits 0).

**Out of scope for this phase**: Bootstrap dark mode, hero-header redesign, new route stubs, full Bootstrap CSS reset.

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
