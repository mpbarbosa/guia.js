---
name: audit-and-fix
description: >
  Orchestrate the full log-audit pipeline in a single pass: run validate-logs
  to produce .ai_workflow/plan.md, then immediately run fix-log-issues to
  apply every confirmed fix and update the project roadmap. Use this skill
  when asked to audit and fix workflow logs end-to-end, or any time you want
  both steps executed without a manual handoff between them.
---

## Overview

This skill is a thin coordinator that runs the two-step log-remediation
pipeline back-to-back:

```text
┌───────────────────────────────────────────────────────────────┐
│                       audit-and-fix                           │
│                                                               │
│  1. validate-logs  ──►  .ai_workflow/plan.md                  │
│                                ▼                              │
│  2. fix-log-issues  ──►  fixes applied + roadmap updated      │
└───────────────────────────────────────────────────────────────┘
```

It adds no new logic of its own. Every decision about what counts as a minor
issue, how to verify it, and how to fix it is governed by the individual
skill files. This skill only defines the execution order and the abort
conditions that apply when running them together.

## Prerequisites

- `.ai_workflow/logs/` must exist and contain at least one workflow run
  directory. If it is empty or absent, abort with:

  ```
  ✗ audit-and-fix aborted — no workflow run directories found under
    .ai_workflow/logs/. Run a workflow first, then retry.
  ```

## Execution order

### Phase 1 — validate-logs

Execute the full `validate-logs` skill as documented in
`.github/skills/validate-logs/SKILL.md`.

**Expected outcome:** `.ai_workflow/plan.md` exists and contains one or more
issue blocks.

**Abort condition:** If `validate-logs` produces a `plan.md` with zero
issues (all candidates were already fixed or all were Critical/High), print
a success notice and stop — there is nothing for Phase 2 to do:

```
✓ audit-and-fix complete (no issues to fix)
  validate-logs found 0 confirmed minor issues.
  plan.md is empty — fix-log-issues skipped.
```

### Phase 2 — fix-log-issues

Execute the full `fix-log-issues` skill as documented in
`.github/skills/fix-log-issues/SKILL.md`.

Read `.ai_workflow/plan.md` (written in Phase 1) and process every `open`
issue.

**Expected outcome:** All issues are `done` or `skipped`, roadmap updated,
all commits pushed.

## Abort and resume behaviour

If execution is interrupted mid-phase (e.g., a fix fails verification):

- `plan.md` retains accurate statuses — issues touched so far are `done` or
  `in-progress`; untouched issues remain `open`.
- To resume, invoke `fix-log-issues` directly (not `audit-and-fix`) so
  Phase 1 is not re-run and the existing `plan.md` is not overwritten.

## Final summary

Print a consolidated summary after both phases complete:

```
✓ audit-and-fix complete
  Phase 1 — validate-logs:   N issue(s) written to plan.md
  Phase 2 — fix-log-issues:  N fixed  |  N skipped
  Roadmap updated: docs/ROADMAP.md
```

## Related files

- `.github/skills/validate-logs/SKILL.md` — Phase 1 skill
- `.github/skills/fix-log-issues/SKILL.md` — Phase 2 skill
- `.ai_workflow/plan.md` — intermediate handoff artifact
- `docs/ROADMAP.md` — final roadmap destination
- `.github/SKILLS.md` — skills index for this project
