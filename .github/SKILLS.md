## SKILLS

# GitHub Skills

**Package:** `guia_turistico`
**Language:** JavaScript (ESM)
**License:** ISC

---

## Overview

GitHub Skills are reusable GitHub Actions workflows that automate recurring
engineering tasks for this repository. Each skill is a self-contained `.yml`
file under `.github/workflows/` and is designed to be idempotent — running it
multiple times with the same inputs always converges to the same repository
state.

---

## Skills Index

| Skill | File | Trigger | Purpose |
|-------|------|---------|---------|
| [Update paraty_geocore.js](#update-paraty-geocoreyml) | `update-paraty-geocore.yml` | Weekly (Wed) / manual | Bump paraty_geocore.js jsDelivr CDN URL |
| [Validate logs](#validate-logs) | _(Copilot skill)_ | Manual | Validate `.ai_workflow/logs` against codebase; write `plan.md` |
| [Fix log issues](#fix-log-issues) | _(Copilot skill)_ | Manual (after validate-logs) | Consume `plan.md`, apply fixes, update roadmap |
| [Audit and fix](#audit-and-fix) | _(Copilot skill)_ | Manual | Run validate-logs then fix-log-issues in one pass |
| [Next roadmap phase](#next-roadmap-phase) | _(Copilot skill)_ | Manual | Propose and implement the next version milestone |
| [Sync version](#sync-version) | _(Copilot skill)_ | Manual | Propagate package.json version to all dependent files |
| [Copy TS to project](#copy-ts-to-project) | _(Copilot skill)_ | Manual | Migrate a TypeScript file into any target repository with tests, exports, and docs |
| [Purge workflow logs](#purge-workflow-logs) | _(Copilot skill)_ | Manual | Delete transient `.ai_workflow/` artefacts (logs, backlog, summaries) after an audit run |

---

## update-paraty-geocore.yml

**File:** `.github/workflows/update-paraty-geocore.yml`
**Purpose:** Keep the `paraty_geocore.js` dependency current by updating its
jsDelivr CDN URL in `src/guia.js`, `jest.config.unit.js`, `package.json`, and
any test or documentation files that reference the version string, then opening
a pull request with the full set of changes.

### Triggers

| Event | Details |
|-------|---------|
| `schedule` | Every **Wednesday at 09:00 UTC** |
| `workflow_dispatch` | Manual run; accepts an optional `version` input (e.g. `v0.12.0`) |

### Inputs (workflow_dispatch only)

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `version` | No | _(latest)_ | Exact release tag to target, e.g. `v0.12.0`. Omit to use the latest published GitHub release. |

### Permissions

| Scope | Level | Reason |
|-------|-------|--------|
| `contents` | write | Push the update branch |
| `pull-requests` | write | Open / update the PR |

### Concurrency

```yaml
concurrency:
  group: update-paraty-geocore
  cancel-in-progress: false
```

Runs are serialised under the `update-paraty-geocore` group. A second trigger
queues rather than cancels, so no scheduled run is silently dropped.

### Steps

| # | Step | Skipped if up to date |
|---|------|-----------------------|
| 1 | Checkout repository | — |
| 2 | Set up Node.js 20 | — |
| 3 | Resolve target paraty_geocore.js version | — |
| 4 | Check current version in `src/guia.js` | — |
| 5 | Update CDN URL in `src/guia.js` | ✅ |
| 6 | Update `moduleNameMapper` in `jest.config.unit.js` | ✅ |
| 7 | Update `moduleNameMapper` in `package.json` | ✅ |
| 8 | Run validation (`npm run validate`) | ✅ |
| 9 | Run unit & integration tests | ✅ |
| 10 | Adjust paraty_geocore.js related tests | ✅ |
| 11 | Update paraty_geocore.js related documentation | ✅ |
| 12 | Create pull request | ✅ |

Steps 5–12 are gated by the version check in step 4 and are skipped entirely
when `src/guia.js` already contains the target CDN URL.

### CDN URL pattern

```text
https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@<TAG>/dist/esm/index.js
```

### Idempotency guarantees

| Concern | Mitigation |
|---------|-----------|
| Running twice for the same version | Step 4 hard-exits; `peter-evans/create-pull-request` updates the existing PR |
| Concurrent schedule + m

---

## SKILL

---

name: update-paraty-geocore
description: >
  Update the paraty_geocore.js dependency in guia_turistico to the latest
  (or a specified) release. Use this skill when asked to bump, upgrade, or
  refresh paraty_geocore.js, or when the update-paraty-geocore GitHub Actions
  workflow needs to be triggered, debugged, or explained
---

## Overview

`paraty_geocore.js` is consumed by this project via a **jsDelivr CDN URL**
hard-coded in `src/guia.js`. Unlike tarball-based dependencies, there is no
`package.json` entry to update — the version lives directly inside the import
statement and in the Jest `moduleNameMapper` that maps the CDN URL to the local
source for tests.

A dedicated GitHub Actions workflow handles the update process end-to-end.

## Workflow location

```text
.github/workflows/update-paraty-geocore.yml
```

## What the workflow does

1. **Resolve version** — queries the GitHub API for the latest
   paraty_geocore.js release tag (or uses the `version` input if provided via
   `workflow_dispatch`).
2. **Early-exit guard** — extracts the current version from the CDN URL in
   `src/guia.js` and skips the rest if already up to date.
3. **Update `src/guia.js`** — replaces the old jsDelivr CDN URL with the new
   versioned one.
4. **Update `jest.config.unit.js`** — replaces the `moduleNameMapper` regex
   key that maps the CDN URL to the local paraty_geocore.js source.
5. **Update `package.json`** — replaces the `moduleNameMapper` regex key in
   the inline Jest configuration block.
6. **Run validation** — runs `npm run validate` (node -c syntax checks) to
   confirm no JS errors were introduced.
7. **Run tests** — runs the full Jest suite to confirm nothing regressed.
8. **Update test files** — replaces the old CDN URL in `__tests__/` and
   `test/` files that import directly from the CDN URL.
9. **Update documentation** — replaces old CDN URLs and version strings in
   all `*.md` files (single-pass, guarded by pre-check grep).
10. **Open pull request** — uses `peter-evans/create-pull-request@v7` to open
    (or update) a PR on branch `chore/update-paraty-geocore-<version>`.

## How to trigger manually

```shell
gh workflow run update-paraty-geocore.yml --field version=v0.12.0
```

Leave `version` blank to use the latest published release.

## Idempotency guarantees

- A `concurrency` group (`update-paraty-geocore`) prevents simultaneous runs
  from racing on the same PR branch.
- The early-exit guard in step 2 ensures no changes are committed if the
  dependency is already at the target version.
- `peter-evans/create-pull-request` updates an existing PR rather than opening
  a duplicate.

## CDN URL pattern

```text
https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@<TAG>/dist/esm/index.js
```

## Files updated by this skill

| File | What changes |
|------|-------------|
| `src/guia.js` | `import` statement CDN URL version |
| `jest.config.unit.js` | `moduleNameMapper` regex key CDN URL version |
| `package.json` | Inline Jest `moduleNameMapper` regex key CDN URL version |
| `__tests__/types/paraty-geocore.test.js` | CDN import URL version |
| `test/core/GeocodingState.test.js` | CDN import URL version |
| `*.md` | Any CDN URL or bare version string on paraty lines |

## Related files

- `.github/workflows/update-paraty-geocore.yml` — the full workflow definition
- `src/guia.js` — consumes paraty_geocore.js via CDN import
- `jest.config.unit.js` — maps the CDN URL to local source for Jest

---

## CHANGELOG

# Changelog

All notable changes to Guia Turístico will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **`paraty_geocore.js` dependency upgrade** from `@0.10.2` to `@0.11.3`:
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
  - **Component 3: SpeechTextBuilder** (`src/speech/SpeechTextBuilder.js`, 312 lines, 48

---

## GEO_POSITION

# GeoPosition API Reference

> ⚠️ **Moved to `paraty_geocore.js`**
>
> Since `v0.12.10-alpha`, the `GeoPosition` class lives in the external [`paraty_geocore.js`](https://github.com/mpbarbosa/paraty_geocore.js) library.
>
> **Full API reference:** [paraty_geocore.js/docs/GEO_POSITION_API.md](https://github.com/mpbarbosa/paraty_geocore.js/blob/main/docs/GEO_POSITION_API.md)

---

## GEO_POSITION

# GeoPosition Class Documentation

> ⚠️ **Moved to `paraty_geocore.js`**
>
> Since `v0.12.10-alpha`, the `GeoPosition` class lives in the external [`paraty_geocore.js`](https://github.com/mpbarbosa/paraty_geocore.js) library.
> The local `src/core/GeoPosition.ts` file has been removed.
>
> **Full documentation:** [paraty_geocore.js/docs/GEO_POSITION.md](https://github.com/mpbarbosa/paraty_geocore.js/blob/main/docs/GEO_POSITION.md)

## Import in guia_turistico

```ts
import { GeoPosition } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.12.1-alpha/dist/esm/index.js';
```

## Jest (via moduleNameMapper in `jest.config.unit.js`)

The CDN URL is mapped to the local `paraty_geocore.js` source for offline test execution:

```
'^https://cdn\\.jsdelivr\\.net/gh/mpbarbosa/paraty_geocore\\.js@0\\.9\\.3-alpha/dist/esm/index\\.js$'
→ '<rootDir>/../paraty_geocore.js/src/index'
```

---

## GEO_POSITION_FUNC_SPEC

# GeoPosition — Functional Specification

> ⚠️ **Moved to `paraty_geocore.js`**
>
> Since `v0.12.10-alpha`, the `GeoPosition` class lives in the external [`paraty_geocore.js`](https://github.com/mpbarbosa/paraty_geocore.js) library.
>
> **Full functional specification:** [paraty_geocore.js/docs/GEO_POSITION_FUNC_SPEC.md](https://github.com/mpbarbosa/paraty_geocore.js/blob/main/docs/GEO_POSITION_FUNC_SPEC.md)
