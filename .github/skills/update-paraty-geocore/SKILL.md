---
name: update-paraty-geocore
description: >
  Update the paraty_geocore.js dependency in guia_turistico to the latest
  (or a specified) release. Uses jsDelivr CDN as the primary delivery source
  with a GitHub repository clone as the local test fallback. Use this skill
  when asked to bump, upgrade, or refresh paraty_geocore.js, or when the
  update-paraty-geocore GitHub Actions workflow needs to be triggered,
  debugged, or explained.
---

## Overview

`paraty_geocore.js` is consumed by this project in two ways:

1. **CDN import** — a jsDelivr CDN URL hard-coded in `src/guia.ts` (and
   several other TypeScript source files) is the primary runtime source.
2. **GitHub clone fallback for tests** — because Node.js (Jest) cannot
   resolve `https://` imports at runtime, the workflow clones the
   `paraty_geocore.js` repository at the target tag into a sibling directory
   (`../paraty_geocore.js/`). The `moduleNameMapper` in both
   `jest.config.unit.js` and `package.json` maps the CDN URL regex to that
   local clone's `src/index` file so tests can resolve the import.

Both the CDN URL version string **and** the `moduleNameMapper` regex key must
be kept in sync. There is no npm dependency for `paraty_geocore.js` in
`package.json` — only URL version-string replacements across relevant files.
A dedicated GitHub Actions workflow handles the full update end-to-end.

## Workflow location

```text
.github/workflows/update-paraty-geocore.yml
```

## What the workflow does

1. **Resolve version** — uses `git ls-remote --tags` to find the latest
   `paraty_geocore.js` release tag on GitHub (or uses the `version` input if
   provided via `workflow_dispatch`).
2. **Early-exit guard** — extracts the current CDN URL version from
   `src/guia.ts` and skips all subsequent steps if already up to date.
3. **Update `src/**/*.ts`** — replaces the old jsDelivr CDN URL with the new
   versioned one in every `.ts` file under `src/` (multiple files import from
   this URL directly).
4. **Update `src/types/paraty-geocore.d.ts`** — replaces the CDN URL in the
   ambient module declaration so TypeScript type-checking (`tsc --noEmit`)
   stays consistent with the actual import URL.
5. **Update `jest.config.unit.js`** — replaces the `moduleNameMapper` regex
   key version string so Jest maps the new CDN URL to the local clone.
6. **Update `package.json`** — replaces the inline `moduleNameMapper` regex
   key version string (Jest config embedded in `package.json`) with the same
   new version.
7. **Clone `paraty_geocore.js` for tests** — clones the repo at the target
   tag into the sibling path `../paraty_geocore.js/` and runs
   `npm install --production` there so the local CJS dist can be resolved
   by Jest during test execution.
8. **Adjust related tests** — finds test files in `test/` and `__tests__/`
   that reference the `paraty_geocore.js` CDN URL or version string and
   applies the version-string replacement, then re-runs only those files.
9. **Run `npm run validate`** — runs TypeScript checks (`tsc --noEmit`) after
   `npm ci` to confirm no type errors were introduced.
10. **Run tests** — runs the full Jest unit and integration suite (E2E tests
    excluded) against the newly cloned local fallback to confirm nothing
    regressed.
11. **Update documentation** — replaces old CDN URLs and bare version strings
    on `paraty_geocore` lines in all `*.md` files (single-pass, guarded by
    pre-check `grep`).
12. **Open pull request** — uses `peter-evans/create-pull-request@v7` to open
    (or update) a PR on branch `chore/update-paraty-geocore-<version>`.

## How to trigger manually

```shell
gh workflow run update-paraty-geocore.yml --field version=v0.13.1-alpha
```

Leave `version` blank to use the latest published release.

## Idempotency guarantees

- A `concurrency` group (`update-paraty-geocore`) prevents simultaneous runs
  from racing on the same PR branch. `cancel-in-progress: false` queues the
  second run rather than dropping it.
- The early-exit guard in step 2 checks the CDN URL in `src/guia.ts` before
  making any changes; if it already points to the target version the entire
  job is skipped.
- `peter-evans/create-pull-request` updates an existing PR branch rather than
  opening a duplicate.

## CDN URL pattern

```text
https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@<VERSION>/dist/esm/index.js
```

> **Note:** The version in this CDN URL uses the bare semver string (e.g.
> `0.12.6-alpha`), **not** the `v`-prefixed tag (e.g. `v0.12.6-alpha`).

## moduleNameMapper pattern (Jest / Node.js fallback)

```json
"^https://cdn\\.jsdelivr\\.net/gh/mpbarbosa/paraty_geocore\\.js@<VERSION>/dist/esm/index\\.js$":
  "<rootDir>/../paraty_geocore.js/src/index"
```

This regex key appears in both `jest.config.unit.js` and the inline `jest`
section of `package.json`. Both must be updated together.

## Files updated by this skill

| File | What changes |
|------|-------------|
| `src/guia.ts` | `import()` CDN URL version |
| `src/**/*.ts` | CDN `import` URL version in all TypeScript source files |
| `src/types/paraty-geocore.d.ts` | Ambient module declaration CDN URL version |
| `jest.config.unit.js` | `moduleNameMapper` regex key version string |
| `package.json` | Inline Jest `moduleNameMapper` regex key version string |
| `__tests__/**` / `test/**` | Any CDN URL or bare version string on `paraty_geocore` lines |
| `*.md` | Any CDN URL or bare version string on `paraty_geocore` lines |

## Related files

- `.github/workflows/update-paraty-geocore.yml` — the full workflow definition
- `src/guia.ts` — primary CDN import entry point
- `src/types/paraty-geocore.d.ts` — TypeScript ambient module declaration
- `jest.config.unit.js` — Jest module mapper for local test fallback
- `package.json` — inline Jest module mapper (mirrors `jest.config.unit.js`)
- `.github/SKILLS.md` — skills and workflows index for this project
