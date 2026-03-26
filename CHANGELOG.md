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
