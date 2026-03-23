---
name: purge-workflow-logs
description: >
  Delete all transient workflow artefacts under .ai_workflow/ — specifically
  the logs/, backlog/, and summaries/ directories and everything inside them.
  Use this skill when asked to clean up, remove, or purge workflow logs,
  backlogs, or summaries, or before starting a fresh workflow run to avoid
  stale data from previous runs.
---

## Overview

AI workflow runs accumulate large log files under `.ai_workflow/logs/`,
pending step definitions under `.ai_workflow/backlog/`, and executive summaries
under `.ai_workflow/summaries/`. These are **transient artefacts** — they are
gitignored, serve no purpose after the `audit-and-fix` pipeline has been run,
and consume disk space. This skill removes all three in one pass.

```text
.ai_workflow/
  logs/       ◄── deleted   (workflow run transcripts and prompt/response pairs)
  backlog/    ◄── deleted   (pending step definitions for incomplete runs)
  summaries/  ◄── deleted   (per-run executive summaries)
  plan.md         retained  (audit trail — consumed by fix-log-issues)
  archive/        retained  (long-term reference material)
  metrics/        retained  (performance data)
  *.json          retained  (config and history files)
```

## When to use

- After `audit-and-fix` has been run and `plan.md` has been written — the raw
  logs are no longer needed once the plan captures all confirmed issues.
- Before starting a fresh workflow run to ensure the new run starts from a
  clean state with no stale data from earlier runs.
- Whenever disk usage from `.ai_workflow/` is a concern.

## When NOT to use

- If `audit-and-fix` (or `validate-logs`) has **not yet been run** against the
  current logs — the logs are the source of truth for the next audit pass.
  Purging them before running `validate-logs` discards unreviewed findings.
- If any step in `.ai_workflow/backlog/` represents a workflow run that was
  interrupted and needs to be resumed.

## Prerequisites

- The working directory is the root of the `guia_turistico` repository.
- No other process is actively writing to `.ai_workflow/logs/`.

## Step-by-step execution

### 1. Inventory the target directories

```bash
ls .ai_workflow/logs     2>/dev/null && echo "logs: present"     || echo "logs: absent"
ls .ai_workflow/backlog  2>/dev/null && echo "backlog: present"  || echo "backlog: absent"
ls .ai_workflow/summaries 2>/dev/null && echo "summaries: present" || echo "summaries: absent"
```

Note which directories exist. Directories that are absent are silently skipped.

### 2. Delete the target directories

```bash
rm -rf .ai_workflow/logs .ai_workflow/backlog .ai_workflow/summaries
```

### 3. Verify removal

```bash
ls .ai_workflow/
```

Confirm that `logs/`, `backlog/`, and `summaries/` no longer appear in the
listing. Other files and directories (`plan.md`, `archive/`, `metrics/`,
`*.json`) must remain untouched.

### 4. Check git status

```bash
git status --short
```

Because all three directories are listed in `.gitignore`, their removal
produces no unstaged changes. If `git status` shows changes, they are
pre-existing modifications unrelated to this purge — do **not** commit them
as part of this skill.

## Expected output

```
✓ purge-workflow-logs complete
  Removed: .ai_workflow/logs/       (N run directories)
  Removed: .ai_workflow/backlog/    (N run directories)
  Removed: .ai_workflow/summaries/  (N run directories)
  Git commit: none needed (directories were gitignored)
```

If a directory was absent, replace its line with:

```
  Skipped: .ai_workflow/<dir>/  (already absent)
```

## What NOT to do

- Do **not** delete `plan.md` — it is the permanent audit trail written by
  `validate-logs` and consumed by `fix-log-issues`.
- Do **not** delete `archive/`, `metrics/`, or any `*.json` config file —
  these are long-term artefacts not covered by this skill.
- Do **not** commit the deletion — the directories are gitignored and produce
  no git changes.
- Do **not** run this skill if `validate-logs` has not yet been run against
  the current log set (see [When NOT to use](#when-not-to-use)).

## Related files

- `.ai_workflow/logs/` — workflow run transcripts (deleted)
- `.ai_workflow/backlog/` — pending step definitions (deleted)
- `.ai_workflow/summaries/` — per-run executive summaries (deleted)
- `.ai_workflow/plan.md` — retained audit trail
- `.github/skills/validate-logs/SKILL.md` — should be run before purging
- `.github/skills/audit-and-fix/SKILL.md` — orchestrates the full pipeline
- `.github/SKILLS.md` — skills index for this project
