---
name: copy-ts-to-project
description: >
  Copy a TypeScript source file (and its related code, documentation, and
  tests) from this project into any target repository, then adjust all affected
  artefacts so the module is fully integrated. Use this skill when asked to
  "migrate", "contribute", "move", or "copy" a TypeScript file to another
  project.
---

## Overview

This skill automates the end-to-end process of promoting a TypeScript module
from the current project into any target repository.

The skill is **parameterised** by two values:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `{inputNameFile}` | Base name (or relative path) of the TypeScript source file to copy | `RateLimiter`, `src/utils/RateLimiter.ts` |
| `{targetProject}` | Name of the target repository (folder name on the local filesystem) | `paraty_geocore.js`, `my-lib` |

The target is assumed to live at `../{targetProject}/` (sibling directory).
If it lives elsewhere, ask the developer for the absolute path before
proceeding.

A **propose → confirm → implement** loop is used so that placement and scope
decisions are always made by the developer, not the agent.

---

## Prerequisites

- Both repositories are present on the local filesystem:
  - **Source** (this project): current working directory
  - **Target**: `../{targetProject}/` (sibling directory, same parent — confirm
    if different)
- Both repos have a clean working tree (`git status` shows no uncommitted
  changes).
- `{targetProject}` dependencies are installed (`npm install` inside that repo
  if `node_modules/` is absent or stale).
- The source file actually exists and the code compiles without errors.

---

## Step-by-step execution

### Step 1 — Locate the source file

```bash
# Resolve the source file path (adjust glob as needed)
find . -name "{inputNameFile}.ts" -not -path "*/node_modules/*" -not -path "*/dist/*"
```

If multiple matches are found, present them to the developer and ask which one
to use before proceeding.

Read the resolved file in full. Identify:

| Item | How to find it |
|------|---------------|
| **Public exports** | All `export` statements at the top level |
| **Named types / interfaces** | `export interface`, `export type`, `export enum` |
| **Internal imports** | `import … from '…'` lines referencing project-local paths |
| **External imports** | Imports from `node_modules` (not bundled in paraty_geocore.js) |
| **JSDoc / TSDoc** | Block comments that describe the module, its params, and return values |
| **Related source files** | Files imported by `{inputNameFile}.ts` that also need to be migrated |

> ⚠️ If the file has external imports (`npm` packages that are **not** already
> in `paraty_geocore.js/package.json`), flag them explicitly and ask the
> developer whether to add them or refactor them away before continuing.

---

### Step 2 — Determine placement in `{targetProject}`

Inspect the target repository's directory structure:

```bash
find ../{targetProject}/src -type d | sort
find ../{targetProject}/test -type d 2>/dev/null | sort
```

Use the following general heuristics as a starting point, then confirm with
the developer:

| Source module nature | Typical target path |
|----------------------|---------------------|
| Domain entity / data wrapper | `src/core/` or equivalent |
| Observer / event pattern | `src/core/` or equivalent |
| Pure utility / helper function | `src/utils/` or equivalent |
| Error / exception types | Existing errors file (append) or `src/core/` |
| Configuration / constants only | `src/core/` or equivalent |

> Adjust these paths based on the actual layout of `{targetProject}`. If the
> project uses a flat `src/` structure or a different convention, propose what
> fits best.

Confirm the target path with the developer before writing any files.

Also determine which sub-folder to use for tests by mirroring the `src/`
layout (e.g. `src/core/X.ts` → `test/core/X.test.ts`).

---

### Step 3 — Propose and wait for confirmation

Present a migration plan table to the developer:

```
Proposed migration: {inputNameFile} → {targetProject}

| Artefact                        | Action       | Destination path                         |
|---------------------------------|--------------|-----------------------------------------|
| {inputNameFile}.ts              | Copy + adapt | {targetProject}/src/<dir>/              |
| <dependency A>.ts (if needed)   | Copy + adapt | {targetProject}/src/<dir>/              |
| test/{inputNameFile}.test.ts    | Create/adapt | {targetProject}/test/<dir>/             |
| src/index.ts (or entry point)   | Update       | Add export(s) for {inputNameFile}        |
| docs/ARCHITECTURE.md            | Update       | Add module entry                         |
| docs/CHANGELOG.md               | Update       | Add entry for current version            |
| docs/API.md (if exists)         | Update       | Add module section                       |
| docs/<NAME>-FRS.md (new)        | Create       | Functional requirements spec             |
```

**Do not proceed until the developer confirms.** If they change the scope,
update the plan accordingly.

---

### Step 4 — Copy and adapt the source file(s)

For each file being migrated:

1. **Copy** the raw content into the target path in `{targetProject}`.
2. **Adapt** the file for the `{targetProject}` codebase:
   - Replace relative imports that referenced the source project's paths with
     the correct relative paths inside `{targetProject}`.
   - Replace any source-project-specific constants or logger calls with the
     `{targetProject}` equivalents (inspect existing files for the logging
     convention used).
   - Ensure the file header JSDoc block follows the `{targetProject}` pattern
     (inspect existing source files for the convention used). A sensible
     default:

     ```ts
     /**
      * <Short one-sentence description.>
      *
      * @module <dir>/<FileName>
      * @since <NEXT_VERSION>
      */
     ```

   - Verify all TypeScript types are correctly expressed (no implicit `any`,
     strict null safety preserved).
   - Remove any DOM-specific code that does not belong in the target library
     (e.g. `document`, `window`, `HTMLElement`). Flag these to the developer
     if removal changes semantics.
3. **Run a syntax / type check** immediately after each file is written:

   ```bash
   cd ../{targetProject} && npx tsc --noEmit
   ```

   Fix any type errors before continuing.

---

### Step 5 — Write or adapt the test file

Locate an existing test for the source file:

```bash
# In the source project
find . -name "{inputNameFile}*.test.*" -not -path "*/node_modules/*"
```

**If an existing test file is found:**

- Copy it to `{targetProject}/test/<dir>/{inputNameFile}.test.ts`.
- Re-point all imports to the `{targetProject}/src/` paths.
- Remove test cases that rely on DOM APIs or source-project-specific
  infrastructure that will not exist in `{targetProject}`.
- Add at least one smoke test that imports the module through the public
  entry point of `{targetProject}`.

**If no existing test file is found:**

Write a new test file following the conventions in `{targetProject}/test/`
(inspect an existing test file for style and structure):

- One top-level `describe('<ClassName | functionName>')` block.
- Nested `describe` blocks per method / behaviour group.
- `beforeEach` / `afterEach` for setup/teardown.
- Descriptive `it('should …')` strings that read as spec sentences.
- Cover: happy path, edge cases (null/undefined inputs), error paths.

Run the new/adapted tests immediately:

```bash
cd ../{targetProject} && npm test -- --testPathPattern="{inputNameFile}"
```

All tests must pass before continuing.

---

### Step 6 — Update the public entry point exports

Identify the public entry point of `{targetProject}` (commonly `src/index.ts`
or `src/index.js`). Append the new exports following the existing grouping
pattern:

```ts
export { default as {ClassName} } from './<dir>/{inputNameFile}.js';
export type { {TypeName1}, {TypeName2} } from './<dir>/{inputNameFile}.js';
```

Preserve alphabetical or logical ordering within each export group.

Verify the public surface compiles:

```bash
cd ../{targetProject} && npx tsc --noEmit
```

Then run the index smoke test to confirm the new symbol is re-exported:

```bash
cd ../{targetProject} && npm test -- --testPathPattern="index"
```

---

### Step 7 — Run the full test suite

```bash
cd ../{targetProject} && npm run test:all
```

All tests must pass (0 failures). Fix any regressions before continuing.

---

### Step 8 — Update documentation

Update the following files in `{targetProject}/docs/` (skip any that don't
exist; create them only if the project already uses that convention):

#### `docs/ARCHITECTURE.md`

- Add the new file to the **Directory Structure** code block under the correct
  `src/` sub-folder.
- Add a row to the relevant table with a one-line description.
- Update the **Version** entry in the versioning table to the next version.

#### `docs/CHANGELOG.md`

Add a new entry (or append to the unreleased entry) at the top:

```md
### Added

- `src/<dir>/{inputNameFile}.ts` — <short description of what the module does>
  - <bullet: key capability 1>
  - <bullet: key capability 2>
- New tests in `test/<dir>/{inputNameFile}.test.ts` covering <N> scenarios
```

#### `docs/API.md` (if file exists)

Add a section describing the exported symbol(s):

```md
### `{ClassName}` / `{functionName}`

> Added in `<NEXT_VERSION>`

<description>

**Import:**
```ts
import { {Symbol} } from '{targetProject}';
```

**Key methods / properties:** …

```

#### `docs/{inputNameFile}-FRS.md` (new file)

Create a new Functional Requirements Spec if the project uses this pattern
(check whether other `docs/*-FRS.md` files exist first):

```md
# {inputNameFile} — Functional Requirements

**Module:** `{targetProject} / src/<dir>/{inputNameFile}.ts`
**Version:** <NEXT_VERSION>

## Purpose

<Why this module exists and what problem it solves.>

## Requirements

| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| FR-01 | … | … |
```

Run the markdown linter after all docs are updated (if the project has one):

```bash
cd ../{targetProject} && npm run lint:md 2>/dev/null || true
```

---

### Step 9 — Commit

```bash
cd ../{targetProject}
git add -A
git commit -m "feat: add {inputNameFile} module

- Migrated from <source project>
- Added test coverage in test/<dir>/{inputNameFile}.test.ts
- Exported from public entry point
- Added docs/{inputNameFile}-FRS.md (if applicable)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Step 10 — Print summary

```
✓ copy-ts-to-project complete
  Source:   <source project>/src/.../{inputNameFile}.ts
  Target:   {targetProject}/src/<dir>/{inputNameFile}.ts
  Tests:    {targetProject}/test/<dir>/{inputNameFile}.test.ts
  Exports:  entry point updated
  Docs:     ARCHITECTURE.md, CHANGELOG.md, API.md, {inputNameFile}-FRS.md
  Commit:   <sha>
  Suite:    <N> tests passing
```

---

## What this skill does NOT do

| Out of scope | Reason |
|-------------|--------|
| Bump the version in `package.json` | Use `sync-version` or the release workflow |
| Open a pull request | Run `gh pr create` manually if needed |
| Migrate DOM-dependent code | Target library may need to stay DOM-free |
| Publish to npm / CDN | Separate release workflow |
| Modify source project files | Source files remain unchanged |

---

## Common adaptation patterns

### Logger calls

Inspect `{targetProject}` for its logging convention, then adapt:

```ts
// source project (before)
console.log(`[MyClass] ${message}`);

// typical target adaptation — use whatever logger the target project uses
import { log } from '../utils/logger.js';
log(`[MyClass] ${message}`);
```

### Error handling

Use the target project's error types (inspect `src/core/` or `src/errors.ts`):

```ts
// generic pattern — adapt to target project's error class
import { ProjectError } from './errors.js';
throw new ProjectError('Invalid value');
```

### Relative import rewriting

```ts
// source project (before)
import { calculateDistance } from '../../utils/calculateDistance.js';

// target project (after) — use the target's equivalent path
import { calculateDistance } from '../utils/distance.js';
```

---

## Related files

- `../{targetProject}/src/` — source files of the target project
- `../{targetProject}/test/` — test mirror of `src/`
- `../{targetProject}/docs/` — documentation (if present)
