## SKILLS

# GitHub Skills

**Package:** `guia_js`
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
| [Update bessa_patterns.ts](#update-bessayml) | `update-bessa.yml` | Weekly (Tue) / manual | Bump bessa_patterns.ts jsDelivr CDN URL in importmap |
| [Update guia.js](#update-guiayml) | `update-guia.yml` | Weekly (Mon) / manual | Bump guia.js npm dependency tag |
| Update paraty_geocore.js | `update-paraty-geocore.yml` | Weekly (Wed) / manual | Bump paraty_geocore.js jsDelivr CDN URL |
| Validate node modules | _(Copilot skill)_ | Manual | Audit npm deprecation warnings, trace chains, apply safe overrides, verify tests |
| Validate logs | _(Copilot skill)_ | Manual | Validate `.ai_workflow/logs` against codebase; write `plan.md` |
| Fix log issues | _(Copilot skill)_ | Manual (after validate-logs) | Consume `plan.md`, apply fixes, update roadmap |
| Audit and fix | _(Copilot skill)_ | Manual | Run validate-logs then fix-log-issues in one pass |
| Next roadmap phase | _(Copilot skill)_ | Manual | Propose and implement the next version milestone |
| Sync version | _(Copilot skill)_ | Manual | Propagate package.json version to all dependent files |
| Copy TS to project | _(Copilot skill)_ | Manual | Migrate a TypeScript file into any target repository with tests, exports, and docs |
| Purge workflow logs | _(Copilot skill)_ | Manual | Delete transient `.ai_workflow/` artefacts (logs, backlog, summaries) after an audit run |

---

## update-bessa.yml

**File:** `.github/workflows/update-bessa.yml`
**Purpose:** Keep the `bessa_patterns.ts` dependency current by updating its
jsDelivr CDN URL in the importmap `<script>` block of `src/index.html`, and
any test or documentation files that reference the version string, then opening
a pull request with the full set of changes.

### Triggers

| Event | Details |
|-------|---------|
| `schedule` | Every **Tuesday at 09:00 UTC** |
| `workflow_dispatch` | Manual run; accepts an optional `version` input (e.g. `v0.13.1-alpha`) |

### Manual trigger

```shell
gh workflow run update-bessa.yml --field version=v0.13.1-alpha
```

### Idempotency

| Mechanism | Detail |
|-----------|--------|
| Concurrency group | `update-bessa-patterns` — second trigger queues rather than cancels |
| Early-exit guard | Skips all steps when `src/index.html` already has the target CDN URL |
| PR action | `peter-evans/create-pull-request` updates an existing PR branch |

### Steps

| # | Step | Skipped when |
|---|------|-------------|
| 1 | Checkout | — |
| 2 | Set up Node.js 20 | — |
| 3 | Resolve target bessa_patterns.ts version | — |
| 4 | Check current bessa_patterns.ts version in src/index.html | — |
| 5 | Update bessa_patterns.ts CDN URL in src/index.html | Already up to date |
| 6 | Run validation (`npm run validate`) | Already up to date |
| 7 | Run unit & integration tests | Already up to date |
| 8 | Adjust bessa_patterns.ts related tests | Already up to date |
| 9 | Update bessa_patterns.ts related documentation | Already up to date |
| 10 | Open pull request | Already up to date |

---

## update-guia.yml

**File:** `.github/workflows/update-guia.yml`
**Purpose:** Keep the `guia.js` core dependency current by updating its
npm dependency tag (`github:mpbarbosa/guia_js#<TAG>`) in `package.json`, and
any test or documentation files that reference the version string, then opening
a pull request with the full set of changes.

### Triggers

| Event | Details |
|-------|---------|
| `schedule` | Every **Monday at 09:00 UTC** |
| `workflow_dispatch` | Manual run; accepts an optional `version` input (e.g. `v0.13.1-alpha`) |

---

## update-bessa.yml (Copilot skill)

### Overview

`bessa_patterns.ts` is consumed by this project via a

---

## SKILL

```yaml
name: update-bessa
description: >
  Update the bessa_patterns.ts dependency in paraty_geocore.js to the latest
  (or a specified) release. Uses jsDelivr CDN as the primary delivery source
  with the GitHub tarball as the npm-install fallback. Use this skill when
  asked to bump, upgrade, or refresh bessa_patterns.ts, or when the
  update-bessa GitHub Actions workflow needs to be triggered, debugged, or
  explained
```

## Skill Overview

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
gh workflow run update-bessa.yml --field version=v0.13.1-alpha
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
