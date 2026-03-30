---
name: fix-log-issues
description: >
  Consume the $project_root/.ai_workflow/plan.md file produced by the validate-logs skill
  and fix each open issue in the codebase. After every fix is applied and
  verified, insert the resolved items into the project roadmap. Use this skill
  when asked to apply, resolve, or close the issues listed in plan.md, or
  immediately after running validate-logs.
parameters:
  project_root:
    description: >
      Root directory of the project to operate on.
      Defaults to the current GitHub Copilot CLI working directory.
    default: $PWD
---

## Overview

This skill is the second half of the log-validation pipeline:

```text
validate-logs  →  $project_root/.ai_workflow/plan.md  →  fix-log-issues
```

It reads `$project_root/.ai_workflow/plan.md`, works through every issue with status
`open` in dependency order, applies the minimal fix required, verifies the
fix, updates the issue status in `plan.md`, and finally records all resolved
items in the project roadmap (`docs/ROADMAP.md`).

## Prerequisites

- `$project_root/.ai_workflow/plan.md` must exist and contain at least one issue with
  `**Status:** open`.
- Run `validate-logs` first if `plan.md` is absent or empty.

## plan.md contract

The file is written by `validate-logs`. Each issue block looks like:

```markdown
### RI-NNN — <short title>

- **ID:** RI-NNN
- **Source step:** step_<id>
- **Type:** <issue type>
- **Priority:** <Medium | Low>
- **Path:** <file or directory path>
- **Description:** <problem description>
- **Fix:** <action to take>
- **Status:** open
```

Only issues with `**Status:** open` are processed. Issues with status
`done`, `skipped`, or `in-progress` are left untouched.

## Fix catalogue

Each `Type` value maps to a concrete fix strategy:

### `undocumented-directory`

The directory at `Path` is not referenced in any documentation file.

**Fix procedure:**

1. Identify the most appropriate documentation file to update (prefer
   `README.md` inside the same parent directory, or `docs/ARCHITECTURE.md`).
2. Add a brief description of the directory's purpose under the relevant
   section (e.g., "Files and directories" or "Directory structure").
3. Run `cd "$project_root" && npm run lint:md` to confirm no markdown violations were introduced.

### `markdown-lint`

One or more markdownlint rules are violated in the file at `Path`.

**Fix procedure:**

1. Run `cd "$project_root" && npm run lint:md:fix` to apply auto-fixable corrections.
2. Run `cd "$project_root" && npm run lint:md` to identify any remaining violations.
3. For each remaining violation, edit the file manually to comply with the
   rule referenced in the `Description` field.
4. Re-run `cd "$project_root" && npm run lint:md` and confirm zero violations for the affected
   file(s).

### `dependency-warning`

`npm install --dry-run` or `npm audit` produced a warning for a dependency.

**Fix procedure:**

1. Run `cd "$project_root" && npm audit --audit-level=moderate` to reproduce the warning.
2. If the advisory has a fix available: run `cd "$project_root" && npm audit fix` (non-breaking
   only — do not use `--force`).
3. Run `cd "$project_root" && npm ci && npm run build && npm test` to confirm nothing regressed.
4. If no automated fix exists, add a comment to `package.json` (or open a
   GitHub issue) and mark the plan item as `skipped` with a reason.

### `typescript-issue`

`tsc --noEmit` reported a type error or warning.

**Fix procedure:**

1. Run `cd "$project_root" && npx tsc --noEmit` to reproduce.
2. Edit the file at `Path` to resolve the type error using the minimum
   change that preserves existing behaviour.
3. Re-run `cd "$project_root" && npx tsc --noEmit` and confirm zero new errors.
4. Run `cd "$project_root" && npm test` to confirm no test regressions.

### `architecture-mismatch`

The directory tree diverges from the description in `docs/ARCHITECTURE.md`.

**Fix procedure:**

1. Determine whether the code or the documentation is the source of truth.
   - If the code changed intentionally: update `docs/ARCHITECTURE.md`.
   - If a directory was added accidentally: remove it or move it to the
     correct location.
2. Run `cd "$project_root" && npm run lint:md` after editing any documentation.

### `missing-test-coverage`

A module or exported function has no corresponding test.

**Fix procedure:**

1. Locate the source file at `Path`.
2. Create or extend the matching test file under `test/` following the
   existing test structure (e.g., `test/core/`, `test/utils/`).
3. Write tests covering the normal path and any documented edge cases.
4. Run `cd "$project_root" && npm run test:coverage` and confirm the new code is covered.

### `docs-outdated`

A documentation file references a file, export, or behaviour that no longer
exists in the codebase.

**Fix procedure:**

1. Open the documentation file at `Path`.
2. Locate the stale reference described in `Description`.
3. Update or remove the reference to match the current codebase state.
4. Run `cd "$project_root" && npm run lint:md` to confirm no violations were introduced.

## Processing loop

For each `open` issue in `plan.md` (in the order they appear):

1. **Set status to `in-progress`** — update `**Status:** open` →
   `**Status:** in-progress` in `plan.md`.

2. **Apply the fix** — follow the procedure for the issue's `Type` (see
   [Fix catalogue](#fix-catalogue) above). Use the `Fix` field from
   `plan.md` as the authoritative description of what to do.

3. **Verify the fix** — run the verification command(s) listed in the fix
   procedure. Confirm the issue no longer reproduces.

4. **Mark as done** — update `**Status:** in-progress` →
   `**Status:** done` in `plan.md`.

5. If the fix cannot be applied (dependency with no upstream patch, requires
   breaking change, etc.):
   - Update status to `skipped`.
   - Add `**Skip reason:** <explanation>` immediately after the Status line.

Commit after every individual fix so that each change is atomic and
reversible:

```
fix(<type>): <short title from plan.md ID>

Resolves RI-NNN identified by validate-logs.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

## Updating the project roadmap

After all issues have been processed (status `done` or `skipped`), append
the results to `$project_root/docs/ROADMAP.md` under a
`## Roadmap — Minor Issues` section (create if absent):

```markdown
## Roadmap — Minor Issues

> Populated by the `fix-log-issues` skill. Each item was verified against
> the live codebase before being marked done.

| ID | Source step | Description | File / Path | Priority | Status |
|----|------------|-------------|-------------|----------|--------|
| RI-001 | step_05 | Undocumented dir docs/api/assets | docs/api/README.md | Medium | done |
```

- Continue the ID sequence from the highest existing ID in the table.
- Set `Status` to `done` or `skipped` as recorded in `plan.md`.
- Commit the roadmap update separately:

  ```
  docs: update roadmap with resolved minor issues (fix-log-issues)

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

## Final summary

Print a console summary when all issues have been processed:

```
✓ fix-log-issues complete
  Fixed:   N
  Skipped: N
  Total:   N

plan.md updated — all issues are now done or skipped.
Roadmap updated in $project_root/docs/ROADMAP.md.
```

## What NOT to do

- Do not apply fixes for issues with status `done`, `skipped`, or
  `in-progress`.
- Do not make speculative improvements beyond what the `Fix` field in
  `plan.md` specifies.
- Do not use `npm audit fix --force`; breaking changes are out of scope.
- Do not delete `plan.md` after completing — it is a permanent audit trail.

## Related files

- `$project_root/.ai_workflow/plan.md` — input: structured issue list from `validate-logs`
- `$project_root/docs/ROADMAP.md` — output: roadmap updated with results
- `.github/skills/validate-logs/SKILL.md` — the upstream skill that creates plan.md
- `.github/SKILLS.md` — skills index for this project
