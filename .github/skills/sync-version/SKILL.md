---
name: sync-version
description: >
  Read the canonical version from package.json and check it against every
  file in the repository that carries a version string. Fix any inconsistency
  found. Use this skill whenever the project version has been bumped in
  package.json and the change needs to propagate to all dependent files, or
  when a version audit is needed before a release.
---

## Overview

`package.json` → `version` is the **single source of truth** for the
project version. Every other file that contains a version string must agree
with it. This skill audits all known locations, reports mismatches, and
applies targeted fixes.

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         sync-version                                │
│                                                                     │
│  1. Read PKG_VERSION from package.json                              │
│  2. Parse → MAJOR · MINOR · PATCH · PRERELEASE                      │
│  3. Check each file in the canonical list                           │
│  4. Report mismatches                                               │
│  5. Fix each mismatch (targeted Node script or sed)                 │
│  6. Re-validate (npm run validate + npm test)                       │
│  7. Commit all changes                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Canonical version locations

The following files are checked in order. Each entry lists the file, the
pattern that must match, and how to fix it if it does not.

### 1. `src/config/defaults.ts` — APP\_VERSION object fields

| Field | Expected value | Fix |
|-------|---------------|-----|
| `major:` | `MAJOR` (number) | Replace the integer literal on that line |
| `minor:` | `MINOR` (number) | Replace the integer literal on that line |
| `patch:` | `PATCH` (number) | Replace the integer literal on that line |
| `prerelease:` | `"PRERELEASE"` (string) | Replace the quoted string on that line |

### 2. `src/config/version.ts` — VERSION string constant

Pattern: `export const VERSION = 'X.Y.Z-PRERELEASE'`
Fix: replace the version string between the single quotes on that line.

### 3. `README.md` — version badge or header

Pattern: any occurrence of the old version string.
Fix: replace every occurrence of the old version string in this file.

### 4. `docs/INDEX.md` — metadata version field

Pattern: `version: X.Y.Z-PRERELEASE` (unquoted YAML field at the top)
Fix: replace the version string on that line.

### 5. `docs/ROADMAP.md` — current version header

Pattern: `**Current Version**: \`X.Y.Z-PRERELEASE\``
Fix: replace only this header line; do **not** touch version strings in
the roadmap table body (those are historical records of past releases).

### 6. `service-worker.js` — version in `@version` JSDoc and CACHE\_NAME

Pattern: `@version X.Y.Z-PRERELEASE` and `guia-turistico-vX.Y.Z-PRERELEASE`
in the `CACHE_NAME` constant.
Fix: replace all occurrences of the old version string in this file.

### 7. `public/service-worker.js` — same as above

Same patterns as `service-worker.js`.
Fix: replace all occurrences of the old version string in this file.

### 8. `.workflow-config.yaml` — project.version field

Pattern: `version: "X.Y.Z-PRERELEASE"` — indented two spaces under the `project:`
block
Fix: replace the quoted version string on that line.

---

## Files explicitly excluded from auto-fix

| File | Reason |
|------|--------|
| `CHANGELOG.md` | All version entries are historical; never overwrite past entries |
| `package-lock.json` | Managed by npm; updated by `npm install` / `npm ci` |
| `node_modules/` | Never modified directly |
| `.ai_workflow/` | AI-generated log files; not project source |
| `__tests__/` and `tests/` | Version strings are runtime assertions; a mismatch here means `src/config/defaults.ts` was wrong, not the test |
| `.github/copilot-instructions.md` | AI instruction file maintained separately |
| `docs/reports/` | Generated analysis artefacts, not maintained source |

---

## Step-by-step execution

### Step 1 — Read canonical version

```bash
PKG_VERSION="$(node -p "require('./package.json').version")"
```

Parse into components:

```bash
VERSION_CORE="${PKG_VERSION%%-*}"    # "0.12.5"
PRERELEASE="${PKG_VERSION#*-}"       # "alpha"  (empty string if no dash)
MAJOR="${VERSION_CORE%%.*}"
REST="${VERSION_CORE#*.}"
MINOR="${REST%%.*}"
PATCH="${REST#*.}"
```

Print: `ℹ️  Canonical version: PKG_VERSION (MAJOR.MINOR.PATCH, prerelease: PRERELEASE)`

### Step 2 — Detect old version (for targeted replacement)

When running after a `package.json` change, the previous version is
available via `git diff HEAD~1 -- package.json`. When running manually,
scan `src/config/defaults.ts` for any version string that does not match
`PKG_VERSION`.

```bash
OLD_VERSION="$(git diff HEAD~1 -- package.json 2>/dev/null \
  | grep '^-.*"version"' \
  | grep -oP '\d+\.\d+\.\d+-\w+')" || OLD_VERSION=""
```

If `OLD_VERSION` is empty, fall back to scanning each file individually
(see Step 3).

### Step 3 — Check each file

For each file in the canonical list, determine whether it contains
`PKG_VERSION` where expected. Collect mismatches into a report table:

```
File                          | Expected             | Found                | Status
src/config/defaults.ts        | patch: 5             | patch: 4             | ✗ MISMATCH
src/config/version.ts         | '0.12.10-alpha'       | '0.12.4-alpha'       | ✗ MISMATCH
README.md                     | 0.12.10-alpha         | 0.12.10-alpha         | ✓ OK
docs/INDEX.md                 | 0.12.10-alpha         | 0.12.10-alpha         | ✓ OK
docs/ROADMAP.md               | 0.12.10-alpha         | 0.12.10-alpha         | ✓ OK
service-worker.js             | 0.12.10-alpha         | 0.12.10-alpha         | ✓ OK
public/service-worker.js      | 0.12.10-alpha         | 0.12.10-alpha         | ✓ OK
.workflow-config.yaml         | "0.12.10-alpha"       | "0.12.10-alpha"       | ✓ OK
```

**Check `src/config/defaults.ts` field-by-field:**

```bash
node - <<'EOF'
const fs  = require('fs');
const src = fs.readFileSync('src/config/defaults.ts', 'utf8');
const pkg = require('./package.json');
const [core, pre] = pkg.version.split('-');
const [maj, min, pat] = core.split('.').map(Number);

const majorOk = src.match(new RegExp(`\\bmajor:\\s*${maj}\\b`));
const minorOk = src.match(new RegExp(`\\bminor:\\s*${min}\\b`));
const patchOk = src.match(new RegExp(`\\bpatch:\\s*${pat}\\b`));
const preOk   = src.includes(`prerelease: "${pre}"`);

if (majorOk && minorOk && patchOk && preOk) {
  console.log('OK: src/config/defaults.ts — all fields correct');
} else {
  if (!majorOk) console.log(`  MISMATCH: major: expected ${maj}`);
  if (!minorOk) console.log(`  MISMATCH: minor: expected ${min}`);
  if (!patchOk) console.log(`  MISMATCH: patch: expected ${pat}`);
  if (!preOk)   console.log(`  MISMATCH: prerelease: expected "${pre}"`);
}
EOF
```

### Step 4 — Fix mismatches

Apply fixes only to files that have mismatches.

**Fix `src/config/defaults.ts`** — use a Node script for precision:

```bash
node - <<'EOF'
const fs  = require('fs');
const pkg = require('./package.json');
const [core, pre] = pkg.version.split('-');
const [maj, min, pat] = core.split('.').map(Number);

let src = fs.readFileSync('src/config/defaults.ts', 'utf8');
src = src.replace(/(\bmajor:\s*)\d+/,       `$1${maj}`);
src = src.replace(/(\bminor:\s*)\d+/,       `$1${min}`);
src = src.replace(/(\bpatch:\s*)\d+/,       `$1${pat}`);
src = src.replace(/(prerelease:\s*")[^"]*"/, `$1${pre}"`);
fs.writeFileSync('src/config/defaults.ts', src);
console.log('✅  Fixed: src/config/defaults.ts');
EOF
```

**Fix `src/config/version.ts`** — replace the VERSION string constant:

```bash
sed -i "s|export const VERSION = '[^']*'|export const VERSION = '${PKG_VERSION}'|" \
  src/config/version.ts
echo "✅  Fixed: src/config/version.ts"
```

**Fix all other files** — replace the old version string:

```bash
for FILE in README.md docs/INDEX.md service-worker.js public/service-worker.js; do
  if grep -qF "${OLD_VERSION}" "${FILE}" 2>/dev/null; then
    sed -i "s|${OLD_VERSION}|${PKG_VERSION}|g" "${FILE}"
    echo "✅  Fixed: ${FILE}"
  fi
done
```

**Fix `docs/ROADMAP.md`** — header line only:

```bash
sed -i "/\*\*Current Version\*\*/s|${OLD_VERSION}|${PKG_VERSION}|" docs/ROADMAP.md
echo "✅  Fixed: docs/ROADMAP.md (header line only)"
```

**Fix `.workflow-config.yaml`** — `project.version` field only:

```bash
sed -i "/^  version:/s|\"${OLD_VERSION}\"|\"${PKG_VERSION}\"|" .workflow-config.yaml
echo "✅  Fixed: .workflow-config.yaml"
```

### Step 5 — Validate and test

```bash
npm run validate   # tsc --noEmit — catches type errors
npm test           # catches version assertion regressions
```

If either fails, report the failure and stop. Do **not** commit a broken
state.

### Step 6 — Commit

Stage only the files that were changed:

```bash
git add \
  src/config/defaults.ts \
  src/config/version.ts \
  README.md \
  docs/INDEX.md \
  docs/ROADMAP.md \
  service-worker.js \
  public/service-worker.js \
  .workflow-config.yaml

git commit -m "chore(version): sync all version strings to ${PKG_VERSION}

Propagates the version bump from package.json to:
- src/config/defaults.ts (APP_VERSION object fields)
- src/config/version.ts (VERSION string constant)
- README.md (version references)
- docs/INDEX.md (metadata version field)
- docs/ROADMAP.md (current version header)
- service-worker.js and public/service-worker.js
- .workflow-config.yaml (project.version field)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Output format

Print a structured summary after execution:

```
sync-version — guia_turistico
════════════════════════════════════════════
Canonical version: 0.12.10-alpha
─────────────────────────────────────────────
File                          Status
src/config/defaults.ts        ✓ OK  (or ✗ FIXED)
src/config/version.ts         ✓ OK
README.md                     ✓ OK
docs/INDEX.md                 ✓ OK
docs/ROADMAP.md               ✓ OK
service-worker.js             ✓ OK
public/service-worker.js      ✓ OK
.workflow-config.yaml         ✓ OK
─────────────────────────────────────────────
Result: N fixed  |  N already correct
✅  Validation passed (tsc + npm test)
✅  Committed: chore(version): sync all version strings to 0.12.10-alpha
════════════════════════════════════════════
```

If no mismatches are found, print:

```
✅  sync-version: all version strings already agree with package.json (0.12.10-alpha)
    No files were modified.
```

---

## Related files

- `package.json` — canonical version source
- `src/config/defaults.ts` — APP\_VERSION runtime object
- `src/config/version.ts` — VERSION string constant
- `docs/ROADMAP.md` — current version header
- `.workflow-config.yaml` — project.version field (sync target)
- `npm run check:version` — lightweight CLI check (subset of this skill)
- `.github/SKILLS.md` — skills index for this project
