---
name: update-bessa
description: >
  Update the bessa_patterns.ts dependency in guia_turistico to the latest
  (or a specified) release. Use this skill when asked to bump, upgrade, or
  refresh bessa_patterns.ts, or when the update-bessa GitHub Actions workflow
  needs to be triggered, debugged, or explained.
---

## Overview

`bessa_patterns.ts` is consumed by this project via a **jsDelivr CDN URL**
hard-coded in `src/index.html` as an importmap entry. Unlike npm dependencies,
there is no `package.json` entry to update — the version lives directly inside
the importmap `<script>` block.

A dedicated GitHub Actions workflow handles the update process end-to-end.

## Workflow location

```text
.github/workflows/update-bessa.yml
```

## What the workflow does

1. **Resolve version** — queries the GitHub repository tags for the latest
   bessa_patterns.ts release tag (or uses the `version` input if provided via
   `workflow_dispatch`).
2. **Early-exit guard** — extracts the current version from the CDN URL in
   `src/index.html` and skips the rest if already up to date.
3. **Update `src/index.html`** — replaces the old jsDelivr CDN URL with the
   new versioned one inside the importmap `<script>` block.
4. **Run validation** — runs `npm run validate` (TypeScript checks) to confirm
   no errors were introduced.
5. **Run tests** — runs the full Jest suite to confirm nothing regressed.
6. **Update test files** — replaces the old CDN URL in `__tests__/` and
   `test/` files that reference the bessa_patterns.ts CDN URL.
7. **Update documentation** — replaces old CDN URLs and version strings in
   all `*.md` files (single-pass, guarded by pre-check grep).
8. **Open pull request** — uses `peter-evans/create-pull-request@v7` to open
    (or update) a PR on branch `chore/update-bessa-patterns-<version>`.

## How to trigger manually

```shell
gh workflow run update-bessa.yml --field version=v0.13.0-alpha
```

Leave `version` blank to use the latest published release.

## Idempotency guarantees

- A `concurrency` group (`update-bessa-patterns`) prevents simultaneous runs
  from racing on the same PR branch.
- The early-exit guard in step 2 ensures no changes are committed if the
  dependency is already at the target version.
- `peter-evans/create-pull-request` updates an existing PR rather than opening
  a duplicate.

## CDN URL pattern

```text
https://cdn.jsdelivr.net/gh/mpbarbosa/bessa_patterns.ts@<TAG>/dist/index.mjs
```

## Files updated by this skill

| File | What changes |
|------|-------------|
| `src/index.html` | importmap CDN URL version |
| `__tests__/**` / `test/**` | Any CDN URL version references in test files |
| `*.md` | Any CDN URL or bare version string on bessa lines |

## Related files

- `.github/workflows/update-bessa.yml` — the full workflow definition
- `src/index.html` — importmap entry for bessa_patterns.ts CDN URL
- `.github/SKILLS.md` — skills and workflows index for this project
