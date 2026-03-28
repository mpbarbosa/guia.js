---
name: update-guia
description: >
  Update the guia.js dependency in guia_js to the latest (or a
  specified) release. Use this skill when asked to bump, upgrade, or refresh
  guia.js, or when the update-guia GitHub Actions workflow needs to be
  triggered, debugged, or explained.
---

## Overview

`guia.js` is consumed by this project via a **GitHub-sourced npm dependency**
in `package.json` (`"guia.js": "github:mpbarbosa/guia_js#<TAG>"`). A dedicated
GitHub Actions workflow handles the update process end-to-end.

## Workflow location

```text
.github/workflows/update-guia.yml
```

## What the workflow does

1. **Resolve version** — queries the GitHub repository tags for the latest
   guia.js release tag (or uses the `version` input if provided via
   `workflow_dispatch`).
2. **Early-exit guard** — compares the resolved tag against the npm dependency
   tag already in `package.json`; skips the rest if already up to date.
3. **Update `package.json`** — replaces the old `github:mpbarbosa/guia_js#<TAG>`
   reference with the new one.
4. **Install dependencies** — runs `npm install` to fetch the new guia.js
   package and regenerate `package-lock.json`.
5. **Run validation** — runs `npm run validate` (TypeScript checks) to confirm
   no type errors were introduced by the new version.
6. **Run tests** — runs the full Jest suite to confirm nothing regressed.
7. **Adjust related code** — `sed`-replaces old version strings in `src/`.
8. **Update documentation** — replaces old version strings in all `*.md` files
   (single-pass, guarded by pre-check grep).
9. **Adjust related tests** — replaces old version strings in `test/` and
   `__tests__/`, then re-runs only the affected test files.
10. **Open pull request** — uses `peter-evans/create-pull-request@v7` to open
    (or update) a PR on branch `chore/update-guia-js-<version>`.

## How to trigger manually

```shell
gh workflow run update-guia.yml --field version=v0.7.0-alpha
```

Leave `version` blank to use the latest published release.

## Idempotency guarantees

- A `concurrency` group (`update-guia-js`) prevents simultaneous runs from
  racing on the same PR branch.
- The early-exit guard in step 2 ensures no changes are committed if the
  dependency is already at the target version.
- `peter-evans/create-pull-request` updates an existing PR rather than opening
  a duplicate.

## npm dependency pattern

```text
"guia.js": "github:mpbarbosa/guia_js#<TAG>"
```

## Files updated by this skill

| File | What changes |
|------|-------------|
| `package.json` | npm dependency tag (`github:mpbarbosa/guia_js#<TAG>`) |
| `src/**` | Any hardcoded version strings referencing guia.js |
| `__tests__/**` / `test/**` | Any version string references in test files |
| `*.md` | Any version string on guia lines |

## Related files

- `.github/workflows/update-guia.yml` — the full workflow definition
- `package.json` — guia.js npm dependency declaration
- `.github/SKILLS.md` — skills and workflows index for this project
