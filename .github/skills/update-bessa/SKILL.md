---
name: update-bessa
description: >
  Update the bessa_patterns.ts dependency in paraty_geocore.js to the latest
  (or a specified) release. Uses jsDelivr CDN as the primary delivery source
  with the GitHub tarball as the npm-install fallback. Use this skill when
  asked to bump, upgrade, or refresh bessa_patterns.ts, or when the
  update-bessa GitHub Actions workflow needs to be triggered, debugged, or
  explained.
---

## Overview

`bessa_patterns.ts` is consumed by this project exclusively via a **jsDelivr
CDN URL** hard-coded in `src/index.html` as an importmap entry:

```html
<script type="importmap">
{
  "imports": {
    "bessa_patterns.ts": "https://cdn.jsdelivr.net/gh/mpbarbosa/bessa_patterns.ts@<TAG>/dist/index.mjs"
  }
}
</script>
```

There is **no npm dependency** for `bessa_patterns.ts` — only a URL
version-string replacement in `src/index.html` (and any test or documentation
files that reference the version string). A dedicated GitHub Actions workflow
handles the full update end-to-end.

## Workflow location

```text
.github/workflows/update-bessa.yml
```

## What the workflow does

1. **Resolve version** — uses `git ls-remote --tags` to find the latest
   `bessa_patterns.ts` release tag on GitHub (or uses the `version` input if
   provided via `workflow_dispatch`).
2. **Early-exit guard** — extracts the current version from the CDN URL in
   `src/index.html` and skips the rest if already up to date.
3. **Update `src/index.html`** — replaces the old jsDelivr CDN URL in the
   importmap with the new versioned one.
4. **Run `npm run validate`** — runs TypeScript/syntax checks to confirm no
   errors were introduced.
5. **Run tests** — runs the full Jest unit and integration suite (E2E tests
   excluded) to confirm nothing regressed.
6. **Adjust related tests** — finds test files that reference the
   `bessa_patterns.ts` CDN URL or version string and applies the
   version-string replacement, then re-runs only those affected files.
7. **Update documentation** — replaces old CDN URLs and bare version strings
   on `bessa` lines in all `*.md` files (single-pass, guarded by pre-check
   `grep`).
8. **Open pull request** — uses `peter-evans/create-pull-request@v7` to open
   (or update) a PR on branch `chore/update-bessa-patterns-<version>`.

## How to trigger manually

```shell
gh workflow run update-bessa.yml --field version=v0.13.0-alpha
```

Leave `version` blank to use the latest published release.

## Idempotency guarantees

- A `concurrency` group (`update-bessa-patterns`) prevents simultaneous runs
  from racing on the same PR branch. `cancel-in-progress: false` queues the
  second run rather than dropping it.
- The early-exit guard in step 2 checks the CDN URL in `src/index.html`
  before making any changes; if the importmap already points to the target
  version the entire job is skipped.
- `peter-evans/create-pull-request` updates an existing PR branch rather than
  opening a duplicate.

## CDN URL pattern

```text
https://cdn.jsdelivr.net/gh/mpbarbosa/bessa_patterns.ts@<TAG>/dist/index.mjs
```

## Files updated by this skill

| File | What changes |
|------|-------------|
| `src/index.html` | importmap CDN URL version (`bessa_patterns.ts` entry) |
| `__tests__/**` / `test/**` | Any CDN URL or bare version string on `bessa` lines |
| `*.md` | Any CDN URL or bare version string on `bessa` lines |

## Related files

- `.github/workflows/update-bessa.yml` — the full workflow definition
- `src/index.html` — importmap with the jsDelivr CDN URL
- `.github/SKILLS.md` — skills and workflows index for this project
