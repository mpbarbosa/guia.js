---
name: sync-workflow-config
description: >
  Audit and synchronize .workflow-config.yaml with the repository's current
  package scripts, routes, directory structure, and automation settings. Use
  this skill after adding or removing scripts, routes, directories, or workflow
  behaviors, or whenever the workflow config looks stale or inconsistent with
  the codebase.
---

## Overview

`.workflow-config.yaml` is the project-level configuration for the local AI
workflow automation. It is consumed directly by repository tooling such as
`scripts/lint-md.js`, and it also informs workflow routing, project metadata,
SPA structure, and validation behavior.

This skill treats `.workflow-config.yaml` as **derived configuration**.
Canonical values live in the source files that actually implement the app and
its tooling. The goal is to make `.workflow-config.yaml` match the repository as
it exists today, with **minimal, targeted edits** and **no speculative fields**.

## Canonical sources of truth

Use these files as the primary sources when auditing and updating
`.workflow-config.yaml`:

| Area | Canonical source(s) | Notes |
|------|---------------------|-------|
| Project identity | `package.json` | `name`, `version`, `description` |
| Primary language and build/test scripts | `package.json` | Infer from scripts and dependency graph; prefer exact script strings |
| Router mode and SPA routes | `src/router.ts`, `src/config/routes.ts` | Hash-based routing and route/view inventory live here |
| Directory structure | Real filesystem under `src/`, `__tests__/`, `tests/`, `docs/`, `scripts/` | Keep only directories that actually exist |
| Markdown lint settings | `scripts/lint-md.js`, `.markdownlint.yaml`, `package.json` | `scripts/lint-md.js` parses the `linting:` block directly |
| Deploy settings | `scripts/build_and_deploy.sh`, `package.json` scripts | Only advertise deploy support that actually exists |
| Version-sync scope | `package.json`, `src/config/version.ts`, `service-worker.js`, `public/service-worker.js`, `.github/skills/sync-version/SKILL.md` | Keep the workflow config aligned with the maintained version surfaces |
| Change patterns | Existing source/test/docs/config layout | Patterns must reflect current repo organization |

## What to keep in sync

Audit each of these blocks in `.workflow-config.yaml` and update only the parts
that are clearly stale:

### 1. `project:`

- `name` must match `package.json -> name`
- `version` must match `package.json -> version`
- `description` should match the current application identity, not stale legacy
  wording
- `kind` should reflect the actual app type used by the repository today

### 2. `tech_stack:`

- `primary_language` should match the dominant source language in `src/`
- `framework`, `build_system`, `test_framework`, `test_command`,
  `lint_command`, and `lint_commands` must reflect actual installed tooling and
  package scripts
- `routing` and `spa_entry` must match the live SPA/router implementation

### 3. `structure:`

- Keep only directories and assets that actually exist
- Preserve the current grouping convention (`source_dirs`, `test_dirs`,
  `docs_dirs`, `ui_dirs`, `css_dirs`, `static_assets`)
- Prefer repo-root-relative paths

### 4. `workflow:` / `steps:`

- Keep step descriptions aligned with the current TypeScript/Vite/Vue stack
- Fix stale references to removed JS entry points, missing configs, or outdated
  tooling names
- Preserve existing step IDs, dependency ordering, and phases unless the repo
  structure proves they are wrong

### 5. `linting:`

- `md_linter`, `md_glob`, and `md_excludes` must remain compatible with
  `scripts/lint-md.js`
- Do not invent YAML shapes that the parser in `scripts/lint-md.js` cannot read

### 6. `deploy:`

- `enabled` should only be `true` when the referenced deploy script exists and
  is still the intended deploy path
- `script` must match the actual repo script path

### 7. `spa:`

- `routes` must match the real router paths and corresponding views/components
- `components` should list the active top-level UI displayers/components used by
  the SPA, not removed or renamed files

### 8. `conditionals:`, `change_patterns:`, `version:`, `change_detection:`

- Keep file globs aligned with the current repository layout
- Ensure config-file patterns include `.workflow-config.yaml` itself
- Ensure version-tracked files match the maintained version surfaces in source
- Keep change-type examples and routing descriptions consistent with the
  project's current tooling and conventions

## Recommended execution flow

### Step 1 — Read the authoritative files

Read at minimum:

```text
package.json
.workflow-config.yaml
src/router.ts
src/config/routes.ts
scripts/lint-md.js
```

Also inspect any file directly referenced by the block being updated, such as:

```text
.markdownlint.yaml
scripts/build_and_deploy.sh
src/config/version.ts
service-worker.js
public/service-worker.js
```

### Step 2 — Build a mismatch list

For each section in `.workflow-config.yaml`, compare configured values against
the canonical sources above. Record only concrete mismatches, for example:

- package version changed but `project.version` did not
- routing is still marked as custom hash navigation while `src/router.ts` uses
  Vue Router hash history
- `lint_command` or `linting.md_linter` no longer matches the actual script
- `spa.routes` points at files that were renamed
- `change_patterns.code_files` still targets `.js` when the source tree is
  TypeScript-first

### Step 3 — Apply minimal edits

Update `.workflow-config.yaml` surgically:

- preserve comments unless they are now wrong
- preserve existing ordering unless reordering improves correctness
- do not remove blocks that are still in active use
- do not broaden globs unnecessarily

When a value is already correct, leave it untouched.

### Step 4 — Validate the updated configuration

After editing `.workflow-config.yaml`, run the repository validations that
exercise the affected surfaces:

```bash
npm run validate
npm run check:version
```

If the `linting:` block changed, also run:

```bash
npm run lint:md
```

If the workflow-step descriptions or script references changed, verify that the
referenced files and commands still exist before finishing.

### Step 5 — Summarize the sync

Report:

1. which sections were already correct
2. which sections were updated
3. which canonical files were used to justify the changes

If there are no mismatches, say so explicitly and leave the file unchanged.

## Guardrails

- Do **not** change unrelated repository files unless a referenced path or
  script must be created or renamed as part of the same task.
- Do **not** overwrite intentionally richer descriptions in
  `.workflow-config.yaml` with shorter `package.json` text unless the current
  workflow description is clearly stale or inaccurate.
- Do **not** rename step IDs or restructure the entire workflow unless the user
  explicitly asks for a workflow redesign.
- Do **not** add YAML constructs that `scripts/lint-md.js` cannot parse with its
  current regular-expression-based reader.

## Expected result

Successful execution leaves `.workflow-config.yaml` aligned with the current
repository state, especially for:

- package metadata
- TypeScript/Vite/Vue router configuration
- markdown lint dispatch
- deploy script registration
- version-tracked files
- change-detection patterns

## Related files

- `.workflow-config.yaml`
- `package.json`
- `src/router.ts`
- `src/config/routes.ts`
- `scripts/lint-md.js`
- `.markdownlint.yaml`
- `scripts/build_and_deploy.sh`
- `.github/skills/sync-version/SKILL.md`
- `.github/SKILLS.md`
