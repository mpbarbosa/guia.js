---
name: copy-ts-to-paraty
description: >
  Copy a TypeScript source file (and its related code, documentation, and
  tests) from this project into the paraty_geocore.js repository, then adjust
  all affected artefacts so the module is fully integrated. Use this skill
  when asked to "migrate", "contribute", "move", or "copy" a TypeScript file
  to paraty_geocore.js.
---

## Overview

This skill automates the end-to-end process of promoting a TypeScript module
from `guia_turistico` (or another source) into `paraty_geocore.js`.

The skill is **parameterised** by `{inputNameFile}` — the base name of the
TypeScript source file to copy (e.g. `RateLimiter`, `async`, `GeoPosition`).
You may supply a bare name (`RateLimiter`) or a relative path
(`src/utils/RateLimiter.ts`); the skill resolves both forms.

A **propose → confirm → implement** loop is used so that placement and scope
decisions are always made by the developer, not the agent.

---

## Prerequisites

- Both repositories are present on the local filesystem:
  - **Source** (this project): `guia_turistico/`
  - **Target**: `../paraty_geocore.js/` (sibling directory, same parent)
- Both repos have a clean working tree (`git status` shows no uncommitted
  changes).
- `paraty_geocore.js` dependencies are installed (`npm install` inside that
  repo if `node_modules/` is absent or stale).
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

### Step 2 — Determine placement in paraty_geocore.js

Use the following heuristics to propose the target subdirectory:

| Source module nature | Target path |
|----------------------|------------|
| Domain entity / data wrapper (e.g. `GeoPosition`) | `src/core/` |
| Observer / event pattern | `src/core/` |
| Pure utility / helper function | `src/utils/` |
| Error / exception types | `src/core/errors.ts` (append, do not create a new file) |
| Configuration / constants only | `src/core/` |

Confirm the target path with the developer before writing any files.

Also determine which sub-folder of `test/` to use:

| Source path | Test path |
|-------------|-----------|
| `src/core/X.ts` | `test/core/X.test.ts` |
| `src/utils/X.ts` | `test/utils/X.test.ts` |

---

### Step 3 — Propose and wait for confirmation

Present a migration plan table to the developer:

```
Proposed migration: {inputNameFile} → paraty_geocore.js

| Artefact                        | Action       | Destination path                        |
|---------------------------------|--------------|-----------------------------------------|
| {inputNameFile}.ts              | Copy + adapt | paraty_geocore.js/src/<dir>/            |
| <dependency A>.ts (if needed)   | Copy + adapt | paraty_geocore.js/src/<dir>/            |
| test/{inputNameFile}.test.ts    | Create/adapt | paraty_geocore.js/test/<dir>/           |
| src/index.ts                    | Update       | Add export(s) for {inputNameFile}       |
| docs/ARCHITECTURE.md            | Update       | Add module entry                        |
| docs/CHANGELOG.md               | Update       | Add entry for current version           |
| docs/API.md (if exists)         | Update       | Add module section                      |
| docs/<NAME>-FRS.md (new)        | Create       | Functional requirements spec            |
```

**Do not proceed until the developer confirms.** If they change the scope,
update the plan accordingly.

---

### Step 4 — Copy and adapt the source file(s)

For each file being migrated:

1. **Copy** the raw content into the target path in `paraty_geocore.js`.
2. **Adapt** the file for the paraty_geocore.js codebase:
   - Replace relative imports that referenced guia_turistico paths with the
     correct relative paths inside paraty_geocore.js.
   - Replace any guia_turistico-specific constants or logger calls with the
     paraty_geocore.js equivalents (`log`, `warn` from `utils/logger.ts`).
   - Ensure the file header JSDoc block follows the paraty_geocore.js pattern:

     ```ts
     /**
      * <Short one-sentence description.>
      *
      * @module <core|utils>/<FileName>
      * @since <NEXT_VERSION>-alpha
      * @author Marcelo Pereira Barbosa
      */
     ```

   - Verify all TypeScript types are correctly expressed (no implicit `any`,
     strict null safety preserved).
   - Remove any DOM-specific code that does not belong in a core library
     (e.g. `document`, `window`, `HTMLElement`). Flag these to the developer
     if removal changes semantics.
3. **Run a syntax / type check** immediately after each file is written:

   ```bash
   cd ../paraty_geocore.js && npx tsc --noEmit
   ```

   Fix any type errors before continuing.

---

### Step 5 — Write or adapt the test file

Locate an existing test for the source file:

```bash
# In guia_turistico
find . -name "{inputNameFile}*.test.*" -not -path "*/node_modules/*"
```

**If an existing test file is found:**

- Copy it to `paraty_geocore.js/test/<dir>/{inputNameFile}.test.ts`.
- Re-point all imports to the paraty_geocore.js `src/` paths.
- Remove test cases that rely on DOM APIs or guia_turistico-specific
  infrastructure that will not exist in paraty_geocore.js.
- Add at least one smoke test that imports the module through the public
  `src/index.ts` entry point:

  ```ts
  import { <ExportedSymbol> } from '../../src/index.js';
  ```

**If no existing test file is found:**

Write a new test file following the conventions in `test/core/GeoPosition.test.ts`:

- One top-level `describe('<ClassName | functionName>')` block.
- Nested `describe` blocks per method / behaviour group.
- `beforeEach` / `afterEach` for setup/teardown.
- Descriptive `it('should …')` strings that read as spec sentences.
- Cover: happy path, edge cases (null/undefined inputs), error paths.

Run the new/adapted tests immediately:

```bash
cd ../paraty_geocore.js && npm test -- --testPathPattern="{inputNameFile}"
```

All tests must pass before continuing.

---

### Step 6 — Update `src/index.ts` exports

Append the new exports to `paraty_geocore.js/src/index.ts` following the
existing grouping pattern:

```ts
export { default as {ClassName} } from './core/{inputNameFile}.js';
export type { {TypeName1}, {TypeName2} } from './core/{inputNameFile}.js';
```

Preserve alphabetical or logical ordering within each export group.

Verify the public surface compiles:

```bash
cd ../paraty_geocore.js && npx tsc --noEmit
```

Then run the index smoke test to confirm the new symbol is re-exported:

```bash
cd ../paraty_geocore.js && npm test -- --testPathPattern="index"
```

---

### Step 7 — Run the full test suite

```bash
cd ../paraty_geocore.js && npm run test:all
```

All tests must pass (0 failures). Fix any regressions before continuing.

---

### Step 8 — Update documentation

Update the following files in `paraty_geocore.js/docs/`:

#### `docs/ARCHITECTURE.md`

- Add the new file to the **Directory Structure** code block under the correct
  `src/` sub-folder.
- Add a row to the relevant table (Core Modules or Utilities) with a one-line
  description.
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

> Added in `<NEXT_VERSION>-alpha`

<description>

**Import:**
```ts
import { {Symbol} } from 'paraty_geocore.js';
```

**Key methods / properties:** …

```

#### `docs/{inputNameFile}-FRS.md` (new file)

Create a new Functional Requirements Spec following the pattern of
`docs/GeoPosition-FRS.md` or `docs/distance-FRS.md`:

```md
# {inputNameFile} — Functional Requirements

**Module:** `paraty_geocore.js / src/<dir>/{inputNameFile}.ts`
**Version:** <NEXT_VERSION>-alpha

## Purpose

<Why this module exists and what problem it solves.>

## Requirements

| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| FR-01 | … | … |
```

Run the markdown linter after all docs are updated:

```bash
cd ../paraty_geocore.js && npm run lint:md
```

Fix any lint errors before continuing.

---

### Step 9 — Commit

```bash
cd ../paraty_geocore.js
git add -A
git commit -m "feat(core): add {inputNameFile} module

- Migrated from guia_turistico
- Added test coverage in test/<dir>/{inputNameFile}.test.ts
- Exported from src/index.ts
- Added docs/{inputNameFile}-FRS.md

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Step 10 — Print summary

```
✓ copy-ts-to-paraty complete
  Source:   guia_turistico/src/.../{inputNameFile}.ts
  Target:   paraty_geocore.js/src/<dir>/{inputNameFile}.ts
  Tests:    paraty_geocore.js/test/<dir>/{inputNameFile}.test.ts
  Exports:  src/index.ts updated
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
| Migrate DOM-dependent code | Core library must stay DOM-free |
| Publish to npm / CDN | Separate release workflow |
| Modify guia_turistico source | Source files remain unchanged |

---

## Common adaptation patterns

### Logger calls

```ts
// guia_turistico (before)
console.log(`[MyClass] ${message}`);

// paraty_geocore.js (after)
import { log } from '../utils/logger.js';
log(`[MyClass] ${message}`);
```

### Error handling

```ts
// paraty_geocore.js — use GeoPositionError or extend it
import { GeoPositionError } from './errors.js';
throw new GeoPositionError('Invalid coordinate');
```

### Relative import rewriting

```ts
// guia_turistico (before)
import { calculateDistance } from '../../utils/calculateDistance.js';

// paraty_geocore.js (after) — already exists in utils/distance.ts
import { calculateDistance } from '../utils/distance.js';
```

---

## Related files

- `../paraty_geocore.js/src/index.ts` — public export surface
- `../paraty_geocore.js/src/core/` — domain classes
- `../paraty_geocore.js/src/utils/` — pure utility functions
- `../paraty_geocore.js/test/` — test mirror of `src/`
- `../paraty_geocore.js/docs/ARCHITECTURE.md` — architecture reference
- `../paraty_geocore.js/docs/CHANGELOG.md` — release notes
- `../paraty_geocore.js/docs/API.md` — full API reference
- `.github/skills/update-paraty-geocore/SKILL.md` — bump this project's
  dependency once the new version is tagged in paraty_geocore.js
