---
name: next-roadmap-phase
description: >
  Plan and implement the next application version milestone. Reads the current
  project state from docs/ROADMAP.md, docs/architecture/ARCHITECTURE.md, and
  CHANGELOG.md; proposes a scoped set of changes for the next version; and
  executes the implementation once the scope is confirmed. Use this skill when
  asked to "go ahead with the next roadmap phase", "implement the next
  version", or "what should we ship next?".
---

## Overview

This skill encodes the full workflow for advancing `guia_js` to its
next version milestone. It follows a **propose → confirm → implement** loop
so that scope decisions are always made by the developer, not by the agent.

The skill produces:

- Working TypeScript code changes (new features, removals, fixes)
- Matching tests under `__tests__/` or `tests/`
- Updated `CHANGELOG.md`, `docs/ROADMAP.md`, and `docs/architecture/ARCHITECTURE.md`
- A single atomic git commit

---

## Prerequisites

- A clean working tree (`git status` shows no uncommitted changes)
- All tests pass (`npm test`)
- `docs/ROADMAP.md` and `docs/architecture/ARCHITECTURE.md` are reasonably
  up to date (run `audit-and-fix` first if in doubt)

---

## Step-by-step execution

### Step 1 — Read current state

Gather context from these files:

```bash
# Current version
grep '"version"' package.json

# Latest CHANGELOG entry
head -60 CHANGELOG.md

# Roadmap near-term and long-term sections
grep -A 40 "Near-Term" docs/ROADMAP.md
grep -A 20 "Long-Term" docs/ROADMAP.md

# Technical debt table
grep -A 20 "Key Technical Debt" docs/ROADMAP.md
```

Also inspect:

- `docs/ROADMAP.md` §"Near-Term" — items marked as in-progress or planned are
  the primary candidates for the next version
- `docs/ROADMAP.md` §"Key Technical Debt" — low/medium priority items that
  have accumulated since the last release
- `docs/architecture/ARCHITECTURE.md` — current architecture and any stale
  documentation describing already-changed components
- `src/app.ts` — application entry point; any wired-up but undocumented features
- Open GitHub issues (if any): `gh issue list --repo mpbarbosa/guia.js`

### Step 2 — Identify candidate changes

Using the information from Step 1, build a candidate list organised by type:

| Type | Source | Example |
|------|--------|---------|
| **Feature** | "Near-Term" in ROADMAP.md | Offline-first IndexedDB caching |
| **Feature** | "Long-Term" items ready to pull forward | Route navigation utility |
| **Bug fix** | "Key Technical Debt" table | Duplicate CHANGELOG entries |
| **Removal** | Deprecated/placeholder code in `src/` | Placeholder `alert()` calls |
| **Doc gap** | Components in `src/` not documented in architecture docs | New displayers, services |
| **Doc stale** | Limitations listed in docs but already fixed in code | Outdated architecture sections |

### Step 3 — Propose scope and wait for confirmation

Present the proposed next version number and scope table to the developer:

```
Proposed: v0.X.0-alpha

| # | Type    | Description                          | Files affected         |
|---|---------|--------------------------------------|------------------------|
| 1 | Feature | ...                                  | src/..., __tests__/... |
| 2 | Fix     | ...                                  | src/..., __tests__/... |
| 3 | Docs    | Update ROADMAP.md and ARCHITECTURE   | docs/...               |
```

**Do not proceed until the developer confirms the scope.**
If the developer modifies the scope, update your internal plan before continuing.

> **Important:** Scope decisions (what version number, what to include/exclude)
> are product decisions. The skill proposes; the developer decides.

### Step 4 — Implement code changes

For each code change in the confirmed scope:

1. Edit the source file under `src/`
2. Add or update tests under `__tests__/` (unit/integration) or `tests/`
   (Playwright e2e)
3. Run the affected tests immediately to catch regressions:

   ```bash
   npm test -- --testPathPattern="<affected-pattern>" --no-coverage
   ```

Order of operations within a change:

- Source change first
- Tests second (TDD: write test → see fail → fix → green)
- Do not move on until the tests for the current change are green

### Step 5 — Run full test suite + type check + lint

```bash
npm test -- --no-coverage
npx tsc --noEmit
npm run lint:md
```

All three must be clean before proceeding. Fix any failures before continuing.

### Step 6 — Update documentation

Update in this order:

1. **`docs/architecture/ARCHITECTURE.md`** — reflect any architectural
   changes, new components, or removed components
2. **`docs/ROADMAP.md`**:
   - Move completed "Near-Term" items to the "Completed" section with the new
     version tag
   - Update "Near-Term" with remaining or new items for the next version
   - Update the "Key Technical Debt" table (strike through resolved items)
   - Update `**Current Version**` at the top
   - Update `**Last Updated**` date
3. **`CHANGELOG.md`** — add a new `## [X.Y.Z-alpha] — YYYY-MM-DD` section
   using [Keep a Changelog](https://keepachangelog.com/) format

Run `npm run lint:md` again after updating docs.

### Step 7 — Commit

```bash
git add -A
git commit -m "feat(<scope>): <short description> (v<VERSION>)

<bullet list of changes>

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

Commit message conventions:

- Prefix: `feat(...)` for new features, `fix(...)` for bug fixes,
  `refactor(...)` for internal changes, `docs(...)` for doc-only changes
- If the commit contains multiple types, use the dominant one
- Always include the version number in the subject line
- Also bump `"version"` in `package.json` and `APP_VERSION` in
  `src/config/defaults.ts` as part of this commit

### Step 8 — Print summary

```
✓ next-roadmap-phase complete
  Version:  v0.X.0-alpha
  Commit:   <sha>
  Changes:
    ✅ <change 1>
    ✅ <change 2>
    ...
  Tests:    <N> passed (was <N-prev>)
```

---

## What this skill does NOT do

| Out of scope | Reason |
|-------------|--------|
| Decide version number autonomously | Product decision |
| Choose which features to add | Product decision |
| Publish to npm or deploy | Separate release workflow |
| Create a GitHub PR | Run `gh pr create` manually if needed |
| Run the AI workflow pipeline | Use `audit-and-fix` for that |

---

## Decision heuristics for version number

Use these as a starting point for the proposal (developer has final say):

| Change type | Suggested bump |
|-------------|---------------|
| Breaking change (removal, API change) | `MINOR` (e.g., 0.12 → 0.13) |
| New backwards-compatible feature | `MINOR` |
| Bug fix only, no API change | `PATCH` (e.g., 0.13.0 → 0.13.1) |
| Doc-only changes | `PATCH` |

Since the project is in `alpha`, all releases carry the `-alpha` prerelease
tag until stability criteria are met (ROADMAP.md §"Long-Term").

---

## Related files

- `docs/ROADMAP.md` — source of truth for current scope and deferred items
- `docs/architecture/ARCHITECTURE.md` — architecture layer documentation
- `CHANGELOG.md` — release notes
- `src/app.ts` — application entry point; canonical list of initialised components
- `src/config/defaults.ts` — `APP_VERSION` constant (bump alongside `package.json`)
- `.github/skills/audit-and-fix/SKILL.md` — run this first if logs are stale
- `.github/SKILLS.md` — skills index for this project
