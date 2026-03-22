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
