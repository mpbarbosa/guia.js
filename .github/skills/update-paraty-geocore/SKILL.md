---
name: update-paraty-geocore
description: >
  Update the paraty_geocore.js dependency in guia_turistico to the latest
  (or a specified) release. Use this skill when asked to bump, upgrade, or
  refresh paraty_geocore.js, or when the update-paraty-geocore GitHub Actions
  workflow needs to be triggered, debugged, or explained.
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
