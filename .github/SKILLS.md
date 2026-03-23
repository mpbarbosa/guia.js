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
| [Copy TS to paraty](#copy-ts-to-paraty) | _(Copilot skill)_ | Manual | Migrate a TypeScript file into paraty_geocore.js with tests, exports, and docs |

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
| Concurrent schedule + manual trigger | `concurrency` group serialises runs |
| `sed` double-replacement in docs | URL pass runs before version pass; second pass is guarded by a `grep` pre-check |

---

## validate-logs

**File:** `.github/skills/validate-logs/SKILL.md`
**Trigger:** Manual (Copilot CLI skill)

Reads every workflow run directory under `.ai_workflow/logs/`, cross-checks
the AI-identified issues against the live codebase, and writes a structured
`.ai_workflow/plan.md` listing every confirmed **medium/low severity** item.
The `plan.md` is the handoff artifact consumed by `fix-log-issues`.

### When to use

- After a workflow run has been reviewed and you want to archive its findings
  before purging the logs.
- When auditing past runs for overlooked minor improvements.

### What it does

1. Collects flagged entries from `steps/*.log` and `## Response` blocks from
   `prompts/**/*.md`.
2. Verifies each issue still exists in the current codebase (lint, tsc,
   directory checks, etc.).
3. Writes confirmed medium/low issues to `.ai_workflow/plan.md` with status
   `open`, ready for `fix-log-issues`.

Critical/High severity items are out of scope and are not written to `plan.md`.

---

## fix-log-issues

**File:** `.github/skills/fix-log-issues/SKILL.md`
**Trigger:** Manual (Copilot CLI skill — run after `validate-logs`)

Reads `.ai_workflow/plan.md` produced by `validate-logs` and applies the fix
for each `open` issue. After every fix is verified, updates the issue status
in `plan.md` and inserts the resolved items into the project roadmap in
`docs/ROADMAP.md`.

### When to use

- Immediately after `validate-logs` has written `plan.md`.
- When you want to batch-apply all confirmed minor fixes in one pass.

### What it does

1. Reads each `open` issue from `.ai_workflow/plan.md`.
2. Applies the fix described in the `Fix` field (see the fix catalogue in the
   skill file for type-specific procedures).
3. Verifies the fix (lint, tsc, tests as appropriate).
4. Marks the issue `done` (or `skipped` with a reason) in `plan.md`.
5. Commits each fix atomically.
6. Appends all resolved issues to `docs/ROADMAP.md` under
   `## Roadmap — Minor Issues` and commits the roadmap update.

---

## audit-and-fix

**File:** `.github/skills/audit-and-fix/SKILL.md`
**Trigger:** Manual (Copilot CLI skill)

Orchestrates the full log-remediation pipeline in a single pass by running
`validate-logs` then `fix-log-issues` back-to-back. Use this instead of
invoking the two skills separately when you want an uninterrupted end-to-end
run with no manual handoff.

### When to use

- Any time you want to audit the workflow logs and apply all fixes in one go.
- Prefer the individual skills (`validate-logs` / `fix-log-issues`) when you
  need to inspect or edit `plan.md` between the two phases.

### What it does

1. **Phase 1** — runs `validate-logs`: scans `.ai_workflow/logs/`, verifies
   issues against the live codebase, and writes `.ai_workflow/plan.md`.
2. Aborts early (success) if `plan.md` contains zero issues.
3. **Phase 2** — runs `fix-log-issues`: processes every `open` issue in
   `plan.md`, applies and verifies each fix, then updates
   `docs/ROADMAP.md` with the results.

If interrupted mid-run, resume with `fix-log-issues` alone — `plan.md`
preserves the status of every issue so no work is lost.

---

## Running a Skill Manually

1. Go to the repository on GitHub → **Actions** tab.
2. Select the skill from the left-hand workflow list.
3. Click **Run workflow**.
4. Optionally fill in the `version` input (leave blank for latest).
5. Click **Run workflow** to confirm.

The skill will open a pull request (or update an existing one) on a
dedicated branch. Review and merge the PR to apply the changes to `main`.

---

## next-roadmap-phase

**File:** `.github/skills/next-roadmap-phase/SKILL.md`
**Trigger:** Manual (Copilot CLI skill)

Reads the current project state from `docs/ROADMAP.md`,
`docs/architecture/ARCHITECTURE.md`, and `CHANGELOG.md`, then proposes a
scoped set of changes for the next version milestone. Once the developer
confirms the scope, the skill implements the changes, updates all
documentation, and commits everything atomically.

### When to use

- When the "Near-Term" section of `docs/ROADMAP.md` has items ready to ship.
- When asked "what should we ship next?" or "implement the next version".
- After `audit-and-fix` has been run and the codebase is clean.

### What it does

1. Reads `docs/ROADMAP.md`, `CHANGELOG.md`, and architecture docs to
   understand what is complete, in-progress, and deferred.
2. Proposes a next version number and a scope table (features, fixes, removals,
   doc updates).
3. **Waits for developer confirmation before writing any code.**
4. Implements each confirmed change with matching tests.
5. Runs `npm test`, `tsc --noEmit`, and `npm run lint:md` — all must be clean.
6. Updates `docs/ROADMAP.md`, `docs/architecture/ARCHITECTURE.md`, and
   `CHANGELOG.md`.
7. Bumps `"version"` in `package.json` and `APP_VERSION` in
   `src/config/defaults.ts`.
8. Commits everything in one atomic commit and prints a summary.

---

## sync-version

**Skill file**: `.github/skills/sync-version/SKILL.md`

Audits and synchronises every version string in the repository against the
canonical version recorded in `package.json`. Run this skill after bumping the
version in `package.json` to ensure all dependent files stay consistent.

### When to use

- After manually editing `"version"` in `package.json`
- Before tagging a release to confirm no stale version strings remain
- Any time `npm run check:version` reports a mismatch

### What it does

1. Reads the canonical version from `package.json`.
2. Checks each file in the canonical list against that version.
3. Reports any mismatch found.
4. Applies targeted fixes (Node script for `src/config/defaults.ts`,
   `sed` for all other files).
5. Runs `npm run validate` and `npm test` to confirm nothing broke.
6. Commits all changes in one atomic commit.

### Canonical version files

| File | Version carrier |
|------|----------------|
| `src/config/defaults.ts` | `APP_VERSION` object fields (`major`, `minor`, `patch`, `prerelease`) |
| `src/config/version.ts` | `export const VERSION = 'X.Y.Z-PRERELEASE'` |
| `README.md` | Version badge / header references |
| `docs/INDEX.md` | `version:` metadata field |
| `docs/ROADMAP.md` | `**Current Version**` header line |
| `service-worker.js` | `@version` JSDoc + `CACHE_NAME` constant |
| `public/service-worker.js` | Same as above |
| `.workflow-config.yaml` | `project.version` field |

---

## copy-ts-to-paraty

**File:** `.github/skills/copy-ts-to-paraty/SKILL.md`
**Trigger:** Manual (Copilot CLI skill)

Migrates a TypeScript source file (identified by `{inputNameFile}`) from this
project into the `paraty_geocore.js` repository. The skill copies the file and
any related source dependencies, adapts all imports and conventions, creates or
adapts the test suite, updates `src/index.ts` exports, and updates
`docs/ARCHITECTURE.md`, `docs/CHANGELOG.md`, `docs/API.md`, and a new
`docs/{inputNameFile}-FRS.md` functional-requirements spec.

### When to use

- When a module developed in `guia_turistico` is stable enough to be promoted
  into the shared `paraty_geocore.js` library.
- When asked to "migrate", "contribute", "move", or "copy" a TypeScript file
  to paraty_geocore.js.

### What it does

1. Locates `{inputNameFile}.ts` in the current project.
2. Determines the correct target subdirectory (`src/core/` or `src/utils/`)
   and proposes a migration plan to the developer.
3. **Waits for confirmation before writing any files.**
4. Copies and adapts the source file (rewrites imports, replaces logger calls,
   adds paraty_geocore.js JSDoc header, removes any DOM dependencies).
5. Copies or creates a test file in `test/<dir>/`, re-pointing all imports.
6. Updates `src/index.ts` with the new exports.
7. Runs `tsc --noEmit` and the full test suite — both must be green.
8. Updates `docs/ARCHITECTURE.md`, `docs/CHANGELOG.md`, `docs/API.md`, and
   creates `docs/{inputNameFile}-FRS.md`.
9. Runs `npm run lint:md` — must be clean.
10. Commits everything atomically and prints a summary.

### Prerequisites

- Both repos are present locally as sibling directories
  (`guia_turistico/` and `paraty_geocore.js/`).
- Both repos have a clean working tree.
- The source file compiles without errors.

### Related skills

- `update-paraty-geocore` — use this afterwards to bump guia_turistico's
  dependency on the new paraty_geocore.js version.
