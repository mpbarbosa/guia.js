---
name: validate-node-modules
description: >
  Audit npm dependencies for deprecation warnings and unsafe transitive
  packages. For each deprecated package found, trace its dependency chain,
  research a safe replacement or override, apply the fix to package.json,
  verify no tests regress, and commit. Use this skill when asked to fix,
  clean up, or audit npm deprecation warnings, or when `npm install` produces
  `npm warn deprecated` or `npm warn gitignore-fallback` lines.
---

## Overview

Running `npm install` against a healthy dependency tree should produce no
`npm warn deprecated` lines. This skill automates the full audit→fix→verify
loop so that every actionable warning is resolved in a single pass.

```text
┌─────────────────────────────────────────────────────────────────────┐
│                     validate-node-modules                           │
│                                                                     │
│  1. Capture all deprecation warnings                                │
│  2. Trace each deprecated package to its root cause                 │
│  3. Determine a safe fix (override / direct upgrade / skip)         │
│  4. Apply fixes to package.json overrides                           │
│  5. Run npm install and confirm warnings are gone                   │
│  6. Run tests — revert any fix that causes regressions              │
│  7. Commit                                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Step 1 — Capture deprecation warnings

Run a clean install, piping stderr (where npm prints warnings) to a file:

```bash
npm install 2>&1 | grep -E "^npm warn (deprecated|gitignore-fallback)" \
  | sort -u > /tmp/npm-warnings.txt

echo "=== Deprecation warnings found ==="
cat /tmp/npm-warnings.txt
echo "Total: $(wc -l < /tmp/npm-warnings.txt)"
```

If `/tmp/npm-warnings.txt` is empty, print:

```
✅  validate-node-modules: no deprecated packages found.
    Nothing to do.
```

…and stop.

---

## Step 2 — Trace each deprecated package to its root cause

For every unique package name appearing in the warnings, find what pulls it in:

```bash
while IFS= read -r line; do
  PKG=$(echo "$line" | grep -oP "(?<=deprecated )\S+(?=@)" | head -1)
  VER=$(echo "$line" | grep -oP "(?<=deprecated )\S+" | head -1)
  echo ""
  echo "▶ $VER"
  npm ls "$PKG" --depth=10 2>/dev/null | grep -v "^guia_js"
done < /tmp/npm-warnings.txt
```

Record, for each deprecated package:

| Field | Example |
|-------|---------|
| Package + version | `glob@7.2.3` |
| Deprecation message | `Glob versions prior to v9 are no longer supported` |
| Direct parent | `test-exclude@6.0.0` |
| Full chain | `ts-jest → @jest/transform → babel-plugin-istanbul → test-exclude → glob` |

---

## Step 3 — Determine a safe fix for each warning

Apply these rules in order:

### Rule A — Transitive: newer version of the offending intermediate exists

Check if a newer version of the **direct parent** eliminates the deprecated dep:

```bash
npm show <parent-package> versions --json | python3 -c \
  "import json,sys; v=json.load(sys.stdin); print(v[-5:])"
npm show <parent-package>@latest dependencies 2>/dev/null | grep <deprecated-pkg>
```

If the latest version of `<parent-package>` no longer depends on `<deprecated-pkg>`,
add an override for `<parent-package>` in `package.json`.

### Rule B — Direct dependency: upgrade it

If the deprecated package is a **direct** `devDependency` or `dependency`, bump
it in `package.json` using `npm install <pkg>@latest --save-dev`.

### Rule C — Cannot fix without test regressions

Some overrides force a major-version jump that changes the package's public API
and breaks transitive consumers. Detect regressions by applying the override in
isolation, running `npm run test:unit`, and reverting if the test count drops or
new failures appear compared to the pre-fix baseline.

Mark such packages as **⚠️ Upstream issue** and document them (see Step 6).

### Rule D — `npm warn gitignore-fallback`

This warning fires when npm installs a GitHub-sourced dependency that has no
`.npmignore` file. The fix lives in the **upstream repo**, not here. Note the
affected repo(s) and skip.

---

## Step 4 — Apply safe overrides to `package.json`

For each fix from Rule A or B, add or extend the `overrides` object:

```bash
node - <<'EOF'
const fs  = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.overrides = pkg.overrides || {};

// Example: promote test-exclude to v7 (eliminates glob@7 + inflight)
pkg.overrides['test-exclude'] = '^7.0.2';

// Example: promote html-encoding-sniffer to v6 (eliminates whatwg-encoding@2+3 from http-server chain)
pkg.overrides['html-encoding-sniffer'] = '^6.0.0';

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('✅  package.json overrides updated');
EOF
```

**Do NOT** add an override unless you have confirmed, via `npm show`, that the
target version resolves the deprecated dep.

Re-run `npm install` and confirm the warning is gone before proceeding:

```bash
npm install 2>&1 | grep -E "^npm warn deprecated" || echo "✅  Warning resolved"
```

---

## Step 5 — Verify no regressions

Capture the **pre-fix test baseline** (passing tests count) before applying any
override, then compare after:

```bash
# Baseline (run before any fix)
BEFORE=$(npm run test:unit --silent 2>&1 | grep -oP '\d+ passed' | head -1)

# After applying overrides
npm install
AFTER=$(npm run test:unit --silent 2>&1 | grep -oP '\d+ passed' | head -1)

echo "Before: $BEFORE  |  After: $AFTER"
```

If `AFTER` is lower than `BEFORE`, the override introduced regressions — revert
it from `package.json`, run `npm install` to restore, and re-run tests to
confirm the baseline is restored. Document the skipped fix in the commit message.

**Regression-safe overrides confirmed in this project:**

| Override | Safe? | Notes |
|----------|-------|-------|
| `test-exclude: ^7.0.2` | ✅ | Eliminates `glob@7` + `inflight`; `babel-plugin-istanbul` API-compatible |
| `html-encoding-sniffer: ^6.0.0` | ✅ | Eliminates `whatwg-encoding@2.0.0`; uses `@exodus/bytes` internally |
| `jsdom: ^28.1.0` | ❌ | Jest mock property assignment fails in jsdom@28 (`read only property`) |
| `minimatch: ^10.2.2` | ✅ | Pre-existing override; no issues |

---

## Step 6 — Commit

Stage `package.json` and `package-lock.json`, then commit:

```bash
FIXED_LIST="<comma-separated list of packages fixed>"
SKIPPED_LIST="<comma-separated list of upstream/unsafe issues>"

git add package.json package-lock.json
git commit -m "fix: resolve npm deprecation warnings

Fixed (via package.json overrides):
- <package@version>: <reason fixed>

Skipped (upstream or unsafe):
- <package@version>: <reason skipped>

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Step 7 — Print summary

```
validate-node-modules — guia_js
════════════════════════════════════════════
Warnings found: N
─────────────────────────────────────────────
Package               Chain                                    Fix
glob@7.2.3            ts-jest→babel-plugin-istanbul→test-exclude  ✅ override test-exclude@^7.0.2
inflight@1.0.6        glob@7.2.3 (transitive)                  ✅ resolved by glob fix above
whatwg-encoding@2.0.0 http-server→html-encoding-sniffer@3       ✅ override html-encoding-sniffer@^6.0.0
whatwg-encoding@3.1.1 jest-env-jsdom→jsdom@26 (direct dep)      ⚠️ upstream: jest-env-jsdom must adopt jsdom@28
.npmignore x2         guia.js / ibira.js GitHub deps            ⚠️ upstream: add .npmignore to those repos
─────────────────────────────────────────────
Fixed:   3 warnings
Skipped: 2 warnings (upstream)
✅ Tests: 3649 passing (baseline unchanged)
✅ Committed: fix: resolve npm deprecation warnings
════════════════════════════════════════════
```

---

## Known patterns in this project

### `glob@7.2.3` + `inflight@1.0.6`

**Chain:** `ts-jest` → `@jest/transform` → `babel-plugin-istanbul@7.0.1` →
`test-exclude@6.0.0` → `glob@7.2.3` → `inflight@1.0.6`

**Fix:** `"test-exclude": "^7.0.2"` in `package.json` `overrides`.
`test-exclude@7` uses `glob@^10.4.1` and no longer pulls `inflight`.
`babel-plugin-istanbul@7.0.1` is API-compatible with `test-exclude@7` despite
specifying `^6.0.0` in its own dependencies.

### `whatwg-encoding@2.0.0`

**Chain:** `http-server@14.1.1` → `html-encoding-sniffer@3.0.0` →
`whatwg-encoding@2.0.0`

**Fix:** `"html-encoding-sniffer": "^6.0.0"` in `package.json` `overrides`.
`html-encoding-sniffer@6` uses `@exodus/bytes` instead of `whatwg-encoding`.

### `whatwg-encoding@3.1.1` _(upstream — cannot fix locally)_

**Chain:** `jest-environment-jsdom@30.x` → `jsdom@26.1.0` →
`whatwg-encoding@3.1.1`

`jsdom@26` has `whatwg-encoding` as a **direct** dependency (not via
`html-encoding-sniffer`). An npm override of `jsdom` to `^28.1.0` removes
`whatwg-encoding` but causes jest-mock to throw
`TypeError: Cannot assign to read only property` for module namespace objects,
failing 17 additional test suites. **Do not override jsdom.**

Track upstream: [jest-environment-jsdom](https://github.com/jestjs/jest/issues) —
wait for the package to adopt `jsdom@^28`.

### `npm warn gitignore-fallback` _(upstream — two repos)_

Fires for `guia.js` (`github:mpbarbosa/guia_js`) and `ibira.js`
(`github:mpbarbosa/ibira.js`) because neither repo ships a `.npmignore` file.
npm uses `.gitignore` as a fallback; file exclusion works correctly, so this
is advisory only. Fix: add `.npmignore` to each upstream repo at the tag
currently referenced in `package.json`, then release a new tag and update the
dependency ref here.

---

## Related files

- `package.json` — `overrides` block where fixes are applied
- `package-lock.json` — updated by `npm install` after each override change
- `.github/SKILLS.md` — skills index for this project
