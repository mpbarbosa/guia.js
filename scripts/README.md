# Scripts Directory

**Purpose**: Utility scripts for project maintenance and automation

---

## Available Scripts

### 1. fix-console-logging.sh

**Path**: `scripts/fix-console-logging.sh`
**Purpose**: Automatically fixes direct console.* usage to use centralized logger
**Usage**: `./scripts/fix-console-logging.sh`
**Arguments**: *(none — no flags supported)*
**Status**: ✅ **Portable** - works across all environments
**Related modules**: `src/utils/logger.js`

**What it does**:

- Processes a hardcoded list of ~40 source files under `src/`
- Adds `import { log, warn, error } from './utils/logger.js'` if not already present
- Replaces `console.log(` → `log(`, `console.warn(` → `warn(`, `console.error(` → `error(`
- Uses portable `SCRIPT_DIR` resolution (works on any system, CI/CD, Docker)
- Does **not** touch test files, HTML files, or `utils/logger.js` itself

**Exit codes**:

- `0` — completed successfully
- `1` — `set -e` triggered by an unexpected error

**Fixed Issues** (v0.9.0+):

- ✅ Removed hardcoded absolute path
- ✅ Added portable `SCRIPT_DIR` resolution
- ✅ Works in any environment (local, CI/CD, Docker)

---

### 2. update-doc-dates.sh

**Path**: `scripts/update-doc-dates.sh`
**Purpose**: Updates "Last Updated" dates in git-modified documentation files
**Usage**: `./scripts/update-doc-dates.sh`
**npm script**: `npm run update:dates`
**Arguments**: *(none — no flags supported)*
**Related modules**: `docs/` directory
**Cross-reference**: `docs/AUTOMATION_IMPLEMENTATION_SUMMARY.md`

**What it does**:

- Runs `git diff --name-only --diff-filter=M` to find currently modified `.md` files
- For files that contain `**Last Updated**:`, replaces the date with today's (`YYYY-MM-DD`)
- For files without a "Last Updated" field, appends a footer with the date and `**Status**: ✅ Active`
- Exits `0` with no changes if there are no modified markdown files

**Exit codes**:

- `0` — completed (updated files, or nothing to update)
- `1` — `set -e` triggered by an unexpected error

**Prerequisites**:

- Must be run from the project root
- Requires `git` (used to detect modified files)
- Works on files already staged or unstaged (uses `git diff`, not `git diff --cached`)

---

### 3. update-test-counts.sh

**Path**: `scripts/update-test-counts.sh`
**Purpose**: Updates test count statistics in documentation after running tests
**Usage**: `./scripts/update-test-counts.sh`
**npm script**: `npm run update:tests`
**Arguments**: *(none — no flags supported)*
**Related modules**: `README.md`, `.github/copilot-instructions.md`, `docs/INDEX.md`
**Cross-reference**: `docs/AUTOMATION_IMPLEMENTATION_SUMMARY.md`

**What it does**:

- Runs `npm test -- --json --outputFile=test-results.json --silent` to capture test results
- Parses `numPassedTests`, `numTotalTests`, `numFailedTests` from JSON output
- Updates `passing` / `skipped` / `total` count strings in:
  - `README.md`
  - `.github/copilot-instructions.md`
  - `docs/INDEX.md`
- Cleans up `test-results.json` on exit

**Exit codes**:

- `0` — test counts updated successfully
- `1` — `test-results.json` not produced (test runner failed hard), or `set -e` error

---

### 4. build_and_deploy.sh

**Path**: `scripts/build_and_deploy.sh`
**Purpose**: Build production bundle and deploy to staging environment
**Usage**: `./scripts/build_and_deploy.sh [OPTIONS]`
**Status**: ⚠️ **External dependency** - requires `mpbarbosa_site` sibling repository
**Related modules**: `dist/`, `vite.config.js`, `../mpbarbosa_site/shell_scripts/sync_to_staging.sh`

**Arguments**:

| Flag | Description | Implemented |
|------|-------------|-------------|
| `-h`, `--help` | Show help message and exit | ✅ Yes |
| `--dry-run` | Show commands without executing | ❌ Not implemented |
| `--skip-build` | Skip the `npm run build` step | ❌ Not implemented |

**Exit codes**:

- `0` — Deployment completed successfully
- `1` — Error during build or deployment (`set -e`)

**Prerequisites**:

- `mpbarbosa_site` repository cloned at `../mpbarbosa_site`
- Valid staging configuration and sync script at `mpbarbosa_site/shell_scripts/sync_to_staging.sh`
- Production build completes without errors (`npm run build`)
- Write permissions for deployment target

**Directory Structure Required**:

```
parent-directory/
├── guia_turistico/           # This project
│   ├── scripts/
│   │   └── build_and_deploy.sh
│   └── dist/                 # Created by npm run build
└── mpbarbosa_site/           # Sibling project
    └── shell_scripts/
        └── sync_to_staging.sh
```

**Known Issues**:

- ❌ No error handling for missing directories
- ❌ No validation that build succeeded before deploying
- ❌ No rollback mechanism if deployment fails
- ❌ Requires specific directory structure (fragile)
- ❌ External project dependency not documented in main README

**Recommendations**:

```bash
# Enhanced version with error handling (proposed)
#!/bin/bash
set -e  # Exit on error

# Validate prerequisites
if [ ! -d "../mpbarbosa_site" ]; then
    echo "Error: mpbarbosa_site not found at ../mpbarbosa_site"
    exit 1
fi

# Build production bundle
echo "Building production bundle..."
npm run build || {
    echo "Error: Build failed"
    exit 1
}

# Deploy to staging
echo "Deploying to staging..."
cd ../mpbarbosa_site
./shell_scripts/sync_to_staging.sh --step1 || {
    echo "Error: Deployment failed"
    exit 1
}

echo "✓ Deployment complete"
```

**Usage Notes**:

- ⚠️ Run only when ready to deploy to staging
- ⚠️ Ensure all tests pass before running
- ⚠️ Coordinate with mpbarbosa_site repository owner
- ⚠️ Not intended for production deployment (staging only)

**Alternative (CI/CD)**:
Consider migrating to GitHub Actions workflow for automated deployment:

```yaml
# .github/workflows/deploy-staging.yml (proposed)
name: Deploy to Staging
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: npm run build
      - name: Deploy
        run: # rsync or deployment command
```

---

### 5. deploy-preflight.sh

**Path**: `scripts/deploy-preflight.sh`
**Purpose**: Production deployment pre-flight checklist — verifies the build is ready before deploying
**Usage**: `./scripts/deploy-preflight.sh`
**Arguments**: *(none — no flags supported)*
**Related modules**: `dist/`, `libs/sidra/tab6579_municipios.json`, `vite.config.js`
**Cross-reference**: `docs/DEPLOYMENT.md`

**What it does**:

1. Checks Node.js version (warns if < v18)
2. Runs `npm run build` and fails if the build errors
3. Verifies that `dist/index.html` exists
4. Verifies that `dist/libs/sidra/tab6579_municipios.json` exists (SIDRA offline data)
5. Verifies that `dist/assets/` contains JS and CSS files
6. Starts `npm run preview` on port 9001, tests that `/` and `/libs/sidra/tab6579_municipios.json` return HTTP 200
7. Stops the preview server and prints a deployment-ready summary

**Exit codes**:

- `0` — all checks passed; `dist/` is ready for deployment
- `1` — any check failed (missing file, build failure, or endpoint not reachable)

**Prerequisites**:

- `npm install` has been run
- Port 9001 is free (used for smoke-testing the preview server)
- `curl` available (used for endpoint checks)

---

### 6. cleanup-ai-workflow.sh

**Path**: `scripts/cleanup-ai-workflow.sh`
**Purpose**: Removes old `.ai_workflow/` run artifact directories and local build/test caches
**Usage**: `./scripts/cleanup-ai-workflow.sh [--days N] [--dry-run]`
**npm script**: `npm run cleanup:ai-workflow`
**Arguments**:

- `--days N` — delete workflow runs older than N days (default: `30`)
- `--dry-run` — print what would be deleted without removing anything
- `-h / --help` — show usage

**Related modules**: `.ai_workflow/logs/`, `.ai_workflow/prompts/`, `.ai_workflow/summaries/`, `.jest-cache/`, `.pytest_cache/`, `coverage/`

**What it does**:

- Deletes `workflow_*` subdirectories in `.ai_workflow/logs/`, `.ai_workflow/prompts/`, and `.ai_workflow/summaries/` that are older than `--days` (mtime-based)
- Removes `.jest-cache/`, `.pytest_cache/`, and `coverage/` from the project root
- Always preserves `.ai_workflow/backlog/`, `.ai_workflow/metrics/`, `.ai_workflow/commit_history.json`, and `.ai_workflow/model_definitions.json`
- Prints a KB-freed summary when complete

**Exit codes**:

- `0` — completed (dry-run or actual cleanup)
- `1` — not run from project root, or unknown argument

**Example**:

```bash
# Preview what would be removed (safe, no deletions)
./scripts/cleanup-ai-workflow.sh --dry-run

# Remove workflow runs older than 14 days
./scripts/cleanup-ai-workflow.sh --days 14

# Via npm
npm run cleanup:ai-workflow
```

---

## Running Scripts

### Executable Permissions

All scripts in this directory ship with the executable bit already set (`-rwxrwxr-x`).
If permissions are ever lost (e.g. after a fresh clone on some systems), restore them:

```bash
# Restore executable permissions for all scripts
chmod +x scripts/*.sh

# Or individually
chmod +x scripts/fix-console-logging.sh
chmod +x scripts/update-doc-dates.sh
chmod +x scripts/update-test-counts.sh
chmod +x scripts/deploy-preflight.sh
chmod +x scripts/build_and_deploy.sh
chmod +x scripts/cleanup-ai-workflow.sh
```

Verify current permissions with:

```bash
ls -la scripts/*.sh
```

### Shebangs and Entry Points

Every script begins with `#!/bin/bash` as the first line. This means:

- Scripts **must** be invoked as `./scripts/<name>.sh` or `bash scripts/<name>.sh` — not as `sh scripts/<name>.sh` (which uses `/bin/sh` and may lack bash features).
- All scripts use `set -e` (fail-fast): any command that exits non-zero causes the script to abort immediately.
- No script sources another script or imports a shared library; each is self-contained.

### Direct Execution

```bash
# From project root
./scripts/fix-console-logging.sh          # Fix console.* → centralized logger
./scripts/update-doc-dates.sh             # Update "Last Updated" in modified .md files
./scripts/update-test-counts.sh           # Sync test counts into docs
./scripts/deploy-preflight.sh             # Pre-flight checklist before production deploy
./scripts/build_and_deploy.sh             # Staging deployment (requires ../mpbarbosa_site)
./scripts/build_and_deploy.sh --help      # Show build_and_deploy.sh usage
./scripts/cleanup-ai-workflow.sh          # Remove old .ai_workflow/ runs and caches
./scripts/cleanup-ai-workflow.sh --dry-run  # Preview what would be deleted
```

### Via npm Scripts

```bash
npm run update:dates      # → ./scripts/update-doc-dates.sh
npm run update:tests      # → ./scripts/update-test-counts.sh
npm run cleanup:ai-workflow  # → ./scripts/cleanup-ai-workflow.sh
# Note: fix-console-logging.sh, deploy-preflight.sh, and build_and_deploy.sh
#       have no npm alias; invoke them directly
```

---

## Environment Variables

None of the scripts in this directory require externally-set environment variables.
All variables they use are defined internally. For reference:

| Script | Internal variables | External env vars required |
|--------|--------------------|---------------------------|
| `fix-console-logging.sh` | `SCRIPT_DIR`, `PROJECT_ROOT`, `FILES`, `DEPTH`, `PREFIX` | *(none)* |
| `update-doc-dates.sh` | `TODAY`, `MODIFIED`, `updated` | *(none)* |
| `update-test-counts.sh` | `PASSING`, `TOTAL`, `FAILED`, `SKIPPED` | *(none)* |
| `deploy-preflight.sh` | `NODE_VERSION`, `JS_COUNT`, `CSS_COUNT`, `PREVIEW_PID` | *(none)* |
| `build_and_deploy.sh` | *(none beyond `$1`)* | *(none)* |
| `cleanup-ai-workflow.sh` | `DAYS`, `DRY_RUN`, `DELETED`, `BYTES` | *(none)* |

---

## Error Handling and Exit Codes

All scripts use `set -e` — any failing command causes immediate exit with code 1.

| Script | Exit 0 | Exit 1 |
|--------|--------|--------|
| `fix-console-logging.sh` | All files processed | Unexpected shell error |
| `update-doc-dates.sh` | Dates updated (or no modified files) | Unexpected shell error |
| `update-test-counts.sh` | Counts synced to docs | `test-results.json` not produced; shell error |
| `deploy-preflight.sh` | All checks passed; dist/ ready | Missing file, build failure, or endpoint unreachable |
| `build_and_deploy.sh` | Deployment completed | Build failed or sync script errored |
| `cleanup-ai-workflow.sh` | Cleanup (or dry-run) complete | Not in project root; unknown argument |

To capture exit status explicitly:

```bash
./scripts/deploy-preflight.sh
if [ $? -eq 0 ]; then
  echo "Ready to deploy"
else
  echo "Pre-flight failed — do not deploy"
fi
```

---

## Script Maintenance

### Adding New Scripts

1. Place script in `scripts/`
2. Add `#!/bin/bash` as the first line
3. Add `set -e` for fail-fast behaviour
4. Add a structured header comment block (see existing scripts for template)
5. Make executable: `chmod +x scripts/your-script.sh`
6. Add entry to this README (permissions, args, exit codes, env vars)
7. Add npm script alias in `package.json` (if applicable)

### Best Practices

- Use `#!/bin/bash`, never `#!/bin/sh` (scripts rely on bash-specific features)
- Use `set -e` so failures are never silently swallowed
- Resolve paths via `SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"` — never hardcode absolute paths
- Include `--help` / `-h` for scripts with non-trivial options
- Document all arguments, exit codes, and env vars in the header comment block
- Test in a clean environment before committing

---

## Workflows

Scripts fall into two groups with distinct execution contexts.

### Development Workflow

Run these during normal coding and documentation work:

```
Code change
    │
    ├─► fix-console-logging.sh   # if you added files with direct console.* calls
    │
    ├─► [edit documentation]
    │
    ├─► update-doc-dates.sh      # after editing any .md files (uses git diff)
    │
    └─► update-test-counts.sh    # after running the test suite, before committing
```

Typical session:

```bash
# 1. Run tests to get current numbers
npm test

# 2. Sync those numbers into docs
./scripts/update-test-counts.sh

# 3. Update dates on any .md files you edited
./scripts/update-doc-dates.sh

# 4. Commit everything together
git add -A && git commit -m "docs: update test counts and dates"
```

### Deployment Workflow

Run these when preparing a production release:

```
npm test  ──────────────────────────────► (all passing)
    │
    ▼
update-test-counts.sh   # sync counts into docs
    │
    ▼
update-doc-dates.sh     # timestamp modified docs
    │
    ▼
deploy-preflight.sh     # verify build, dist/, SIDRA data, smoke-test (:9001)
    │
    └─ exit 0 only ──►  build_and_deploy.sh   # push to staging via mpbarbosa_site
```

**Never run `build_and_deploy.sh` if `deploy-preflight.sh` exits non-zero.**

### Maintenance Workflow

`fix-console-logging.sh` is a one-off code-quality tool, not part of either
regular workflow above. Run it when:

- Adding new source files that use `console.*` directly
- After pulling changes that introduced logging regressions

```bash
# Scan and fix, then verify no console.* remain
./scripts/fix-console-logging.sh
grep -rn "console\." src/ --include="*.js" | grep -v "logger.js" | grep -v "node_modules"
```

---

## Integration Test Scripts

These scripts live in `tests/integration/` and are documented here for completeness.

### run_visual_hierarchy_tests.sh

**Path**: `tests/integration/run_visual_hierarchy_tests.sh`
**Purpose**: Runs Selenium-based visual hierarchy integration tests against a local HTTP server
**Usage**: `./tests/integration/run_visual_hierarchy_tests.sh`
**Arguments**: *(none — no flags supported)*
**Related modules**: `tests/integration/test_visual_hierarchy.py`, `src/index.html`

**What it does**:

1. Validates it is run from the project root (checks for `src/index.html`)
2. Installs Selenium via `pip3` if not already present
3. Starts a local HTTP server on port 8080 (`python3 -m http.server 8080 --directory src`)
4. Runs `tests/integration/test_visual_hierarchy.py` with Python 3
5. Stops the HTTP server regardless of test outcome (cleanup always runs)

**Exit codes**:

- `0` — all visual hierarchy tests passed
- `1` — one or more tests failed, or server failed to start, or a prerequisite is missing

**Prerequisites**:

- Must be run from the project root
- Requires Python 3 (`python3` in `PATH`)
- Requires Selenium (`pip3 install selenium`) — installed automatically if missing
- Port 8080 must be free

**Example**:

```bash
# From project root
./tests/integration/run_visual_hierarchy_tests.sh
```

---

## Common Use Cases

### "I just edited some docs and want to update timestamps"

```bash
./scripts/update-doc-dates.sh
# Only .md files that git diff reports as modified are touched
# If nothing is modified yet, the script exits cleanly with no changes
```

### "Tests passed — I want the README badge to reflect that"

```bash
npm test
./scripts/update-test-counts.sh
git add README.md .github/copilot-instructions.md docs/INDEX.md
git commit -m "docs: sync test counts"
```

### "I want to deploy but need to check everything is ready first"

```bash
./scripts/deploy-preflight.sh
# If exit 0 → proceed. If exit 1 → read the ❌ output and fix before deploying
```

### "Is my production build serving the SIDRA data correctly?"

```bash
# deploy-preflight.sh tests this automatically:
./scripts/deploy-preflight.sh
# Look for: "✅ SIDRA JSON file accessible"
```

### "I pulled changes and now some files have console.log calls again"

```bash
./scripts/fix-console-logging.sh
# Then confirm no regressions:
grep -rn "console\." src/ --include="*.js" | grep -v "logger.js"
```

---

## Troubleshooting

### `update-doc-dates.sh` reports "No modified markdown files found"

**Cause**: The script uses `git diff --name-only --diff-filter=M` — it only sees files with *unstaged* modifications. Files already staged (`git add`-ed) are not included.
**Fix**: Either unstage first (`git restore --staged <file>`), or manually set the date:

```bash
TODAY=$(date -I)
sed -i "s/\*\*Last Updated\*\*: [0-9-]*/\*\*Last Updated\*\*: $TODAY/" docs/YOUR_FILE.md
```

### `update-test-counts.sh` exits with "No test results found"

**Cause**: `npm test` exited with a non-zero code (a test suite failed hard) and did not write `test-results.json`.
**Fix**: Run `npm test` directly to see which suite failed, fix the failure, then re-run the script.

### `deploy-preflight.sh` fails with "SIDRA JSON file not accessible (404)"

**Cause**: `vite.config.js` is not copying `libs/sidra/` into `dist/` as a static asset.
**Fix**: Verify `vite.config.js` has `libs/` in its `publicDir` or `assetsInclude` config, then re-run `npm run build` before the preflight check.

### `deploy-preflight.sh` fails with "Main page not accessible"

**Cause**: Port 9001 is already in use, so the preview server cannot start.
**Fix**:

```bash
# Find what is using port 9001
lsof -i :9001
# Kill it, then re-run
kill <PID>
./scripts/deploy-preflight.sh
```

### `build_and_deploy.sh` fails with "No such file or directory: ../mpbarbosa_site"

**Cause**: The sibling repository is not cloned at the expected path.
**Fix**: Clone it:

```bash
cd ..
git clone <mpbarbosa_site-repo-url> mpbarbosa_site
cd guia_turistico
./scripts/build_and_deploy.sh
```

### `cleanup-ai-workflow.sh` — "No items deleted" but directories seem old

**Cause**: The `find -mtime` check uses file modification time, not the timestamp in the directory name. A recently-touched workflow directory will be kept even if its name is old.
**Fix**: Use `--days 0` to remove all `workflow_*` entries regardless of mtime, or manually remove the specific directory:

```bash
rm -rf .ai_workflow/logs/workflow_20260101_000000
```

### `run_visual_hierarchy_tests.sh` fails with "Failed to start HTTP server"**Cause**: Port 8080 is already in use

**Fix**:

```bash
lsof -i :8080
kill <PID>
./tests/integration/run_visual_hierarchy_tests.sh
```

### `run_visual_hierarchy_tests.sh` fails with "ModuleNotFoundError: No module named 'selenium'"

**Cause**: The automatic `pip3 install selenium` step was skipped or failed (e.g., no internet access).
**Fix**: Install manually or use the project virtualenv:

```bash
pip3 install selenium
# or
source venv/bin/activate
./tests/integration/run_visual_hierarchy_tests.sh
```

### `run_visual_hierarchy_tests.sh` — tests fail but server is running

**Cause**: A visual hierarchy assertion in `test_visual_hierarchy.py` failed (CSS/DOM regression).
**Fix**: Open `http://localhost:8080` in a browser while the server is running, inspect the failing element, and fix the relevant CSS or HTML in `src/`.

### A script exits immediately with no output**Cause**: `set -e` caused silent exit because a command returned non-zero before any output was produced (e.g. `node` or `git` not found)

**Fix**: Run with `bash -x` for step-by-step trace:

```bash
bash -x ./scripts/update-test-counts.sh
```

---

---

## CI/CD Integration

The scripts in `scripts/` are **local developer tools** — they are not called directly by
any GitHub Actions workflow. The CI/CD pipeline in `.github/workflows/` replicates
equivalent logic inline (using `run:` steps) so that it works in the ephemeral runner
environment without depending on local checkout paths or sibling repositories.

### Relationship map

```
Developer machine                    GitHub Actions (automatic)
─────────────────                    ──────────────────────────
scripts/update-test-counts.sh   ←──► modified-files.yml
  (manual: after npm test)               "Update Test Documentation" job
                                         Trigger: push/PR to main, develop
                                         (when test files changed)

scripts/update-doc-dates.sh     ←──► documentation-lint.yml
  (manual: after editing .md)            "Badge Synchronization" job
                                         Trigger: push/PR touching **.md

                                    test-badges.yml
                                         Trigger: push to main
                                         Runs inline badge update logic

scripts/deploy-preflight.sh     ←──► test.yml
  (manual: before deploying)             "Test Pipeline" (security, lint, tests)
                                         Trigger: push/PR to main, develop
                                         (CI is the automated equivalent)

scripts/build_and_deploy.sh          (no CI equivalent — staging deploy
  (manual: staging only)               is a manual operation)

scripts/fix-console-logging.sh       (no CI equivalent — one-off code
  (manual: maintenance)               quality fix, not automated)
```

### .github/scripts/ vs scripts/

The project has two script directories with different purposes:

| Directory | Purpose | Called by |
|-----------|---------|-----------|
| `scripts/` | Developer-facing maintenance and deployment tools | Developers manually |
| `.github/scripts/` | CI/CD helper scripts consumed by GitHub Actions workflows | GitHub Actions runners |

Key `.github/scripts/` files and the workflows that call them:

| Script | Workflow |
|--------|---------|
| `cdn-delivery.sh` | Manual / `npm run cdn:generate` |
| `check-version-consistency.sh` | `version-consistency.yml` |
| `check-references.sh` | `documentation-lint.yml` |
| `update-badges.sh` | `test-badges.yml`, `documentation-lint.yml` |
| `test-workflow-locally.sh` | Manual (`npm run ci:test-local`) |
| `validate-jsdom-update.sh` | Manual (jsdom upgrade validation) |

### When to use scripts/ vs waiting for CI

| Situation | Use |
|-----------|-----|
| You edited docs and want timestamps updated now | `./scripts/update-doc-dates.sh` |
| You ran tests locally and want docs to reflect counts | `./scripts/update-test-counts.sh` |
| You are about to deploy to staging | `./scripts/deploy-preflight.sh` then `build_and_deploy.sh` |
| You pushed to `main` and want badges updated | CI handles it automatically (`test-badges.yml`) |
| You opened a PR and want docs linted | CI handles it automatically (`documentation-lint.yml`) |
| You want to simulate the full CI run locally | `./.github/scripts/test-workflow-locally.sh` |

### No container or IaC scripts

This project does not use Docker, Kubernetes, Terraform, Ansible, or any other
container/orchestration tooling. Deployment is a file-sync operation handled by
`build_and_deploy.sh` → `mpbarbosa_site/shell_scripts/sync_to_staging.sh`.
There are no infrastructure-as-code scripts to document.

## Related Documentation

- `.github/scripts/` - CI/CD automation scripts
- `docs/AUTOMATION_TOOLS.md` - Complete automation guide
- `docs/AUTOMATION_IMPLEMENTATION_SUMMARY.md` - Implementation details

---

**Last Updated**: 2026-02-11
**Maintainer**: Project automation team
