---
name: update-ibira
description: >
  Update the ibira.js dependency in guia_js to the latest
  (or a specified) release. Use this skill when asked to bump, upgrade, or
  refresh ibira.js, or when the update-ibira GitHub Actions workflow needs to
  be triggered, debugged, or explained.
---

## Overview

`ibira.js` is consumed by this project in two ways:

1. **CDN import** — a jsDelivr CDN URL hard-coded in `src/guia.ts` and
   `src/index.html` is the primary runtime source.
2. **npm fallback** — a GitHub-sourced npm dependency in `package.json`
   (`"ibira.js": "github:mpbarbosa/ibira.js#<TAG>"`) is used as a fallback
   when the CDN import fails or the code runs in a non-browser environment.

Both the CDN URL version and the npm dependency tag must be kept in sync.
A dedicated GitHub Actions workflow handles the full update end-to-end.

## Workflow location

```text
.github/workflows/update-ibira.yml
```

## What the workflow does

1. **Resolve version** — queries the GitHub API for the latest ibira.js
   release tag (or uses the `version` input if provided via
   `workflow_dispatch`).
2. **Early-exit guard** — extracts the current version from the CDN URL in
   `src/guia.ts` and skips the rest if already up to date.
3. **Update `src/guia.ts`** — replaces the old jsDelivr CDN URL with the new
   versioned one.
4. **Update `src/index.html`** — replaces the CDN URL in both the
   `<link rel="modulepreload">` and the dynamic `import()` call.
5. **Update `package.json`** — replaces the npm dependency tag
   (`github:mpbarbosa/ibira.js#<TAG>`) with the new version.
6. **Update `src/types/paraty-geocore.d.ts`** — replaces the CDN URL in the
   ambient module declaration so TypeScript type-checking stays consistent.
7. **Run `npm install`** — installs the newly pinned npm fallback package.
8. **Run validation** — runs `npm run validate` (TypeScript checks) to confirm
   no errors were introduced.
9. **Run tests** — runs the full Jest suite to confirm nothing regressed.
10. **Update test files** — replaces the old CDN URL in `__tests__/` and
    `test/` files that reference the ibira.js CDN URL.
11. **Update documentation** — replaces old CDN URLs and version strings in
    all `*.md` files (single-pass, guarded by pre-check grep).
12. **Open pull request** — uses `peter-evans/create-pull-request@v7` to open
    (or update) a PR on branch `chore/update-ibira-<version>`.

## How to trigger manually

```shell
gh workflow run update-ibira.yml --field version=v0.3.0
```

Leave `version` blank to use the latest published release.

## Idempotency guarantees

- A `concurrency` group (`update-ibira`) prevents simultaneous runs from
  racing on the same PR branch.
- The early-exit guard in step 2 checks **both** the CDN URL (`src/guia.ts`)
  and the npm dependency tag (`package.json`) before deciding to skip. The
  workflow only exits early when both are already at the target version,
  preventing the npm dep from being silently left behind after a mid-run
  failure or a manual partial update.
- `peter-evans/create-pull-request` updates an existing PR rather than
  opening a duplicate.

## CDN URL pattern

```text
https://cdn.jsdelivr.net/gh/mpbarbosa/ibira.js@<TAG>/src/index.js
```

## npm dependency pattern

```text
"ibira.js": "github:mpbarbosa/ibira.js#<TAG>"
```

## Files updated by this skill

| File | What changes |
|------|-------------|
| `src/guia.ts` | `import()` CDN URL version |
| `src/index.html` | `modulepreload` href and dynamic `import()` CDN URL version |
| `package.json` | npm dependency tag (`github:mpbarbosa/ibira.js#<TAG>`) |
| `src/types/paraty-geocore.d.ts` | Ambient module declaration CDN URL version |
| `__tests__/**` / `test/**` | Any CDN import URL version references |
| `*.md` | Any CDN URL or bare version string on ibira lines |

## Related files

- `.github/workflows/update-ibira.yml` — the full workflow definition
- `src/guia.ts` — primary CDN import with npm fallback
- `src/index.html` — CDN modulepreload and dynamic import
- `package.json` — npm fallback dependency declaration
- `src/types/paraty-geocore.d.ts` — TypeScript ambient module declarations
