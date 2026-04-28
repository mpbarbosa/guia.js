# GitHub Scripts Directory

**Purpose**: Automation scripts for CI/CD workflows, git hooks, and documentation maintenance

**Location**: `.github/scripts/`
**Scope**: Primary automation helpers used by GitHub Actions, local validation commands, and documentation maintenance

---

## Script Inventory

### Documentation & Consistency (7 scripts)

#### 1. check-version-consistency.sh (243 lines)

**Purpose**: Validates version consistency across project files
**Usage**: `./.github/scripts/check-version-consistency.sh`
**npm script**: `npm run check:version`
**Documentation**: README.md (line 829)

**Checks**:

- package.json version matches copilot-instructions.md
- README.md has correct version badge
- All documentation uses consistent version strings

---

#### 2. check-references.sh

**Purpose**: Validates internal documentation links
**Usage**: `./.github/scripts/check-references.sh`
**npm script**: `npm run check:references`
**Documentation**: README.md

**What it does**:

- Scans markdown files for broken internal links
- Checks file path references
- Reports missing documentation targets

---

#### 3. check-terminology.sh

**Purpose**: Enforces consistent terminology across documentation
**Usage**: `./.github/scripts/check-terminology.sh`
**npm script**: `npm run check:terminology`

**What it does**:

- Validates terminology consistency
- Checks for deprecated terms
- Reports inconsistent naming

---

#### 4. update-doc-metadata.sh (453 lines)

**Purpose**: Updates metadata in documentation files
**Usage**: `./.github/scripts/update-doc-metadata.sh [options]`

**Options**:

- `--help` - Show usage
- `--date` - Update dates only
- `--all` - Update all metadata fields
- `--recursive` - Process subdirectories
- `--verbose` - Detailed output
- `--dry-run` - Preview changes

**Documentation**: Referenced in multiple docs/ files

---

#### 5. validate-cross-references.sh (78 lines)

**Purpose**: Validates cross-references between documentation files
**Usage**: `./.github/scripts/validate-cross-references.sh [OPTIONS]`
**npm script**: Consider adding `npm run check:cross-refs`
**Documentation**: ✅ **COMPLETE**
**--help flag**: ✅ **YES**

**What it does**:

- Checks internal documentation links (markdown)
- Validates relative path references (`./`, `../`)
- Reports broken or circular references with file and line numbers
- Verifies file existence for all linked paths
- Excludes external URLs (http/https) and anchor-only links (#)

**Output**:

- Success: `✓ All N references valid` (green)
- Failure: List of broken references with:
  - Source file path
  - Target link path
  - Line number (when available)
  - Error type (file not found, invalid path, etc.)

**Exit codes**:

- `0`: All references valid, no broken links
- `1`: Broken references found

**Examples**:

```bash
# Validate all cross-references
./.github/scripts/validate-cross-references.sh

# Run as part of documentation checks
npm run check:references && ./.github/scripts/validate-cross-references.sh

# Use in CI/CD
- name: Validate cross-references
  run: ./.github/scripts/validate-cross-references.sh
```

**Link Patterns Checked**:

```markdown
[text](./relative/path.md)           # Relative to current file
[text](../parent/doc.md)             # Parent directory
[text](docs/guide.md)                # From project root
[text](./file.md#section)            # With anchor (file checked)
```

**Exclusions**:

- External links: `[text](https://example.com)`
- Anchor-only: `[text](#section)`
- node_modules/, .git/, venv/ directories

**Related Tools**:

- `check-references.sh` - File reference validation
- `check-references.py` - Enhanced reference checking with false positive filtering
- `check-links.py` - External link validation

**Integration**:
Used in documentation validation workflows to ensure all internal links remain valid across restructuring and updates.

---

#### 6. bump-sw-cache.sh

**Purpose**: Updates `CACHE_NAME` in `service-worker.js` with the current app version, date, and git SHA
**Usage**: `./.github/scripts/bump-sw-cache.sh`
**Documentation**: README.md, `.github/workflows/bump-sw-cache.yml`

**What it does**:

- Reads the version from `package.json`
- Builds a new cache name with version + UTC date + git short SHA
- Rewrites `service-worker.js` in place
- Exits non-zero if run outside the repository root or if `service-worker.js` is missing

**Integration**:
Executed by the `bump-sw-cache.yml` workflow after pushes to `main`.

---

#### 7. update-version-references.sh

**Purpose**: Propagates the current `package.json` version to documentation and source files that still carry older version strings
**Usage**: `./.github/scripts/update-version-references.sh [--dry-run]`
**npm script**: `npm run update:version-refs`
**Documentation**: README.md, `docs/reports/implementation/VERSION_REFERENCES_UPDATE_2026-02-13.md`

**What it does**:

- Reads the canonical version from `package.json`
- Scans `docs/`, `src/`, `__tests__/`, `examples/`, `.github/`, `scripts/`, and root markdown files
- Replaces tracked legacy version strings with the current version
- Prints a scan/update summary and supports dry-run previews

**Exit codes**:

- `0`: Scan completed successfully
- `1`: Failed to read `package.json` version or a replacement command failed under `set -e`

---

### CDN & Distribution (1 script)

#### 8. cdn-delivery.sh (229 lines)

**Purpose**: Generates jsDelivr CDN URLs for the current version
**Usage**: `./.github/scripts/cdn-delivery.sh`
**npm script**: `npm run cdn:generate`
**Documentation**: README.md (comprehensive - lines 850-940)

**Output**: `cdn-urls.txt` with distribution URLs

**Features**:

- Generates versioned CDN URLs
- Supports commit-specific URLs
- Tests CDN availability (optional)

**Environment Variables**:

- `GITHUB_USER` - Repository owner
- `GITHUB_REPO` - Repository name

---

### Testing & CI/CD (5 scripts)

#### 9. test-workflow-locally.sh (318 lines)

**Purpose**: Simulates GitHub Actions workflow locally before pushing
**Usage**: `./.github/scripts/test-workflow-locally.sh`
**npm script**: `npm run ci:test-local`
**Documentation**: README.md, docs/WORKFLOW_SETUP.md

**What it validates**:

- JavaScript syntax (npm run validate)
- Test suite execution (npm test)
- Test coverage generation
- Documentation format checks
- Change detection

**Exit codes**:

- 0: All checks passed
- 1: Some checks failed

---

#### 10. validate-jsdom-update.sh (120+ lines)

**Purpose**: Validates jsdom dependency updates for DOM API compatibility
**Usage**: `./.github/scripts/validate-jsdom-update.sh [version]`
**Documentation**: ✅ **COMPLETE**

**What it does**:

- Backs up current state with git stash
- Updates jsdom to specified version (or 27.4.0 default)
- Runs full test suite (syntax validation + all tests)
- Validates DOM API compatibility
- Reports any breaking changes or test failures
- Provides rollback instructions if update fails

**Parameters**:

- `version` (optional): Specific jsdom version to test (default: 27.4.0)
  - Examples: `27.4.0`, `28.0.0`, `latest`

**Process Steps**:

1. Check current jsdom version (`npm list jsdom`)
2. Create backup (`git stash`)
3. Update jsdom to target version
4. Run syntax validation (`npm run validate`)
5. Run full test suite (`npm test`)
6. Report results and recommendations

**Output**:

- ✓ Success indicators for each step (green)
- ✗ Failure indicators with error details (red)
- Test results summary
- Compatibility report
- Recommendation: proceed or rollback

**Exit codes**:

- `0`: Update safe - all tests pass, no breaking changes
- `1`: Breaking changes detected - rollback recommended

**Examples**:

```bash
# Test default jsdom version (27.4.0)
./.github/scripts/validate-jsdom-update.sh

# Test specific version
./.github/scripts/validate-jsdom-update.sh 28.0.0

# Test latest version
./.github/scripts/validate-jsdom-update.sh latest
```

**When to use**:

- Before upgrading jsdom in package.json
- After jsdom releases new major version
- When DOM API tests fail unexpectedly
- As part of quarterly dependency upgrade process
- Before major releases (pre-release validation)

**Rollback Procedure** (if update fails):

```bash
# Script automatically restores backup on failure
git stash pop  # Restore pre-update state
npm install    # Reinstall original dependencies
```

**Known Issues**:

- jsdom 28.0.0+ has ES module compatibility issues (see Issue #114)
- Some versions may have CORS-related test failures
- Puppeteer tests may timeout with newer jsdom versions

**Related Documentation**:

- copilot-instructions.md (line 101) - jsdom upgrade validation process
- Issue #114 - jsdom ES module compatibility resolution

---

#### 11. change-type-detector.sh (308 lines)

**Purpose**: Detects change type from Conventional Commits messages
**Usage**: `./.github/scripts/change-type-detector.sh [base_ref]`
**Used by**: `.github/workflows/modified-files.yml`
**Documentation**: ✅ **COMPLETE**

**What it does**:

- Analyzes commit messages since `base_ref` (default: HEAD~1)
- Parses Conventional Commits format (feat, fix, docs, test, etc.)
- Outputs change type for conditional workflow execution
- Supports all standard Conventional Commits types

**Parameters**:

- `base_ref` (optional): Git reference to compare against (default: HEAD~1)
  - Examples: `HEAD~1`, `abc123`, `origin/main`, `v0.9.0`

**Output**:

- Change type string to stdout: `feat`|`fix`|`docs`|`test`|`refactor`|`chore`|`ci`|`perf`|`style`
- Diagnostic messages to stderr (colored)

**Exit codes**:

- `0`: Success, change type detected and output
- `1`: Error (invalid git ref, parsing failure, unknown change type)

**Examples**:

```bash
# Detect changes since last commit
./.github/scripts/change-type-detector.sh
# Output: "feat" (or "fix", "docs", etc.)

# Detect changes since specific commit
./.github/scripts/change-type-detector.sh abc123

# Detect changes in PR branch
./.github/scripts/change-type-detector.sh origin/main

# Use in conditional logic
CHANGE_TYPE=$(./.github/scripts/change-type-detector.sh origin/main)
if [ "$CHANGE_TYPE" = "test" ]; then
  npm test
fi
```

**Conventional Commits Types Supported**:

- `feat:` - New features (triggers version bump)
- `fix:` - Bug fixes (triggers version bump)
- `docs:` - Documentation changes only
- `test:` - Test additions/updates
- `refactor:` - Code refactoring (no behavior change)
- `chore:` - Maintenance tasks (dependencies, config)
- `ci:` - CI/CD pipeline changes
- `perf:` - Performance improvements
- `style:` - Code style/formatting changes

**Workflow Integration**:
Used in `.github/workflows/modified-files.yml` to determine which jobs to run:

```yaml
- name: Detect change type
  id: change-type
  run: |
    CHANGE_TYPE=$(./.github/scripts/change-type-detector.sh ${{ github.event.before }})
    echo "type=$CHANGE_TYPE" >> $GITHUB_OUTPUT

- name: Run tests only for code changes
  if: steps.change-type.outputs.type == 'feat' || steps.change-type.outputs.type == 'fix'
  run: npm test
```

**Testing**: See `test-change-type-detection.sh` for test suite

---

#### 12. test-change-type-detection.sh (237 lines)

**Purpose**: Test suite for change-type-detector.sh
**Usage**: `./.github/scripts/test-change-type-detection.sh [OPTIONS]`
**Documentation**: ✅ **COMPLETE**
**--help flag**: ✅ **YES**

**What it does**:

- Runs 20+ test cases for change type detection
- Validates Conventional Commits parsing accuracy
- Tests edge cases (empty commits, invalid formats, multiple types)
- Reports pass/fail status for each test scenario

**Test Coverage**:

- All Conventional Commits types (feat, fix, docs, test, etc.)
- Scoped commits: `feat(api):`, `fix(ui):`
- Breaking changes: `feat!:`, `fix(api)!:`
- Multi-line commit messages
- Invalid/malformed commits
- Empty commit ranges

**Expected Output**:

```
🧪 Testing change-type-detector.sh
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Test 1: feat: commit → "feat"
✅ Test 2: fix: commit → "fix"
✅ Test 3: docs: commit → "docs"
...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All tests passed (20/20)
```

**Run before**:

- Modifying `change-type-detector.sh`
- Adding new commit type patterns
- Updating Conventional Commits parsing logic
- Deploying workflow changes

**Execution time**: ~5 seconds

---

#### 13. test-conditional-execution.sh (203 lines)

**Purpose**: Test suite for workflow-condition-evaluator.sh
**Usage**: `./.github/scripts/test-conditional-execution.sh [OPTIONS]`
**Documentation**: ✅ **COMPLETE**
**--help flag**: ✅ **YES**

**What it does**:

- Tests workflow condition evaluation logic (15+ scenarios)
- Validates file pattern matching accuracy
- Checks `.workflow-config.yaml` rule parsing
- Ensures conditional execution works correctly

**Test Coverage**:

- File pattern matching (`src/**/*.js`, `__tests__/**`, etc.)
- Change type conditions (docs-only, test-only, etc.)
- Combined conditions (file patterns + change types)
- Edge cases (no changes, all files changed, invalid patterns)

**Expected Output**:

```
🧪 Testing workflow-condition-evaluator.sh
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Test 1: src/ changes → "run"
✅ Test 2: docs/ changes → "skip" (for test step)
✅ Test 3: docs/ changes → "run" (for docs step)
...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All tests passed (15/15)
```

**Run before**:

- Modifying `workflow-condition-evaluator.sh`
- Changing `.workflow-config.yaml` rules
- Updating workflow logic in modified-files.yml
- Adding new file pattern conditions

**Dependencies**:

- Requires `.workflow-config.yaml` in project root
- Uses `git diff` for file detection

**Execution time**: ~3 seconds

---

#### 14. workflow-condition-evaluator.sh (225 lines)

**Purpose**: Evaluates conditional workflow execution rules from .workflow-config.yaml
**Usage**: `./.github/scripts/workflow-condition-evaluator.sh <step_name> [base_ref]`
**Used by**: `.github/workflows/modified-files.yml`
**Documentation**: ✅ **COMPLETE**

**What it does**:

- Reads workflow rules from `.workflow-config.yaml`
- Detects changed files since `base_ref` using `git diff`
- Determines if specified step should run based on file patterns and change types
- Outputs "run" or "skip" for workflow conditional execution

**Parameters**:

- `step_name` (required): Name of workflow step to evaluate (must match `.workflow-config.yaml` key)
- `base_ref` (optional): Git reference for comparison (default: HEAD~1)

**Output**:

- `"run"` or `"skip"` to stdout
- Diagnostic messages to stderr (colored)

**Exit codes**:

- `0`: Success (step should run or skip as determined)
- `1`: Error (invalid step name, missing config, git failure)

**Examples**:

```bash
# Check if tests should run
./.github/scripts/workflow-condition-evaluator.sh test-suite
# Output: "run" (if src/ files changed) or "skip" (if only docs/ changed)

# Check if docs update needed
./.github/scripts/workflow-condition-evaluator.sh update-docs origin/main
# Output: "run" (if docs/ or README.md changed)

# Use in workflow conditional
SHOULD_RUN=$(./.github/scripts/workflow-condition-evaluator.sh test-suite)
if [ "$SHOULD_RUN" = "run" ]; then
  npm test
fi
```

**Configuration File** (`.workflow-config.yaml`):

```yaml
steps:
  test-suite:
    run_on:
      - file_patterns:
          - "src/**/*.js"
          - "__tests__/**/*.js"
      - change_types: ["feat", "fix", "refactor"]

  update-docs:
    run_on:
      - file_patterns:
          - "docs/**/*.md"
          - "README.md"
      - change_types: ["docs", "feat"]
```

**File Pattern Rules**:

- Glob patterns supported: `*`, `**`, `?`, `{a,b}`
- Multiple patterns: ANY match triggers "run"
- Negation not supported (use separate steps)

**Change Type Rules**:

- Detected via `change-type-detector.sh`
- Multiple types: ANY match triggers "run"
- Combines with file patterns (OR logic)

**Workflow Integration**:
Used in `.github/workflows/modified-files.yml`:

```yaml
- name: Check if tests should run
  id: check-tests
  run: |
    RESULT=$(./.github/scripts/workflow-condition-evaluator.sh test-suite ${{ github.event.before }})
    echo "should_run=$RESULT" >> $GITHUB_OUTPUT

- name: Run tests
  if: steps.check-tests.outputs.should_run == 'run'
  run: npm test
```

**Testing**: See `test-conditional-execution.sh` for test suite

**Dependencies**:

- `git` (for diff detection)
- `.workflow-config.yaml` (configuration file)
- `change-type-detector.sh` (for change type detection)

---

### Badge Management (1 script)

#### 15. update-badges.sh

**Purpose**: Updates README badges (test counts, coverage, etc.)
**Usage**: `./.github/scripts/update-badges.sh`
**npm script**: `npm run update:badges`
**Documentation**: README.md, multiple docs files

**What it does**:

- Updates test count badges
- Updates coverage percentage badges
- Updates version badges

**Note**: Referenced in documentation-lint.yml but not automatically executed (manual-only)

---

### Python Utilities (3 scripts)

#### Python vs Shell Script Comparison

Some validation checks have both Python and shell implementations. Understanding when to use each version:

| Feature | Python Version | Shell Version | Best Use Case |
|---------|---------------|---------------|---------------|
| **check-references** | ✅ Advanced regex filtering | ✅ Basic path checks | Python for CI/CD (fewer false positives) |
| **check-terminology** | ✅ Context-aware patterns | ✅ Simple string matching | Python for comprehensive audits |
| **check-links** | ✅ External link validation | ❌ Not available | Python only (HTTP requests) |

**Key Differences**:

- **Python scripts**: Better regex support, structured output, false positive filtering
- **Shell scripts**: Faster for simple checks, no Python dependency, easier to debug

---

#### 16. check-references.py

**Purpose**: Enhanced reference checker with false positive filtering
**Usage**: `python3 .github/scripts/check-references.py`
**Shell wrapper**: `check-references.sh` (basic version)
**Version**: 1.0.0 (2026-01-28)

**What it does**:

- Scans all markdown files for file references
- Validates file paths exist and are accessible
- Filters out false positives (code examples, regex patterns)
- Provides structured error reporting with line numbers

**Advantages over shell version**:

- Advanced regex pattern matching
- False positive exclusion patterns:
  - JavaScript regex: `/pattern/g`, `/pattern/gi`
  - String operations: `.replace()`, `.match()`, `.test()`
  - Code comments and examples
- Better handling of edge cases
- Structured JSON-like output option

**Exclusion Patterns**:

```python
EXCLUDE_REGEX_PATTERNS = [
    r'/.*?/g[im]*',              # JavaScript regex
    r'\.replace\s*\(',           # String replacement
    r'\.match\s*\(',             # String matching
    r'\.test\s*\(',              # Regex testing
]
```

**When to use**:

- ✅ CI/CD workflows (better accuracy, fewer false positives)
- ✅ When code comments cause false positives
- ✅ Detailed reference auditing with structured output
- ✅ Large codebases with mixed content (code + docs)

**When to use shell version instead**:

- ✅ Quick local checks (faster startup)
- ✅ Environments without Python 3
- ✅ Simple validation without regex patterns

---

#### 17. check-terminology.py

**Purpose**: Terminology consistency validator with context awareness
**Usage**: `python3 .github/scripts/check-terminology.py`
**Shell wrapper**: `check-terminology.sh` (basic version)
**Version**: 1.0.0 (2026-01-28)

**What it does**:

- Validates documentation against terminology guide standards
- Context-aware checking (code vs. documentation)
- Brazilian Portuguese accent validation
- Consistent capitalization enforcement

**Terminology Checks**:

1. **Brazilian Portuguese accents**:
   - ❌ `municipio` (code context: allowed)
   - ✅ `município` (documentation: required)
   - Pattern: `\bmunicipios?\b` with code exclusion

2. **Correct capitalization**:
   - ❌ `Guia.js`, `GUIA.JS`
   - ✅ `guia.js`
   - Pattern: Case-sensitive matching with code context awareness

3. **Consistent naming conventions**:
   - Library names, class names, method names
   - File path references
   - API endpoint formatting

**Context Awareness**:

```python
'exclude_pattern': r'var\s+municipio|const\s+municipio|\.municipio'  # Exclude code
```

**Output**:

- Color-coded findings (yellow warnings, red errors)
- File path, line number, and column position
- Suggested corrections
- Summary statistics (errors vs. warnings)

**When to use**:

- ✅ Before documentation commits (pre-commit hook)
- ✅ CI/CD workflows for terminology enforcement
- ✅ Documentation audits and style guide compliance
- ✅ Quarterly consistency reviews

**When to use shell version instead**:

- ✅ Quick local checks without detailed output
- ✅ Simple string replacement validation
- ✅ Environments without Python 3

---

#### 18. check-links.py

**Purpose**: External link checker with timeout handling and status validation
**Usage**: `python3 .github/scripts/check-links.py`
**No shell equivalent** (requires HTTP client)

**What it checks**:

- HTTP/HTTPS external links in markdown files
- Response status codes (200 OK, 301 Moved, 404 Not Found, etc.)
- Timeout handling for slow/unresponsive sites (30s default)
- Broken anchor links on external pages
- Redirect chains (301 → 302 → 200)

**Exclusions** (rate limiting / always-available):

```python
EXCLUDE_DOMAINS = [
    'shields.io',           # Badge CDN (rate-limited)
    'localhost',            # Local development
    '127.0.0.1',           # Loopback address
    '192.168.',            # Private network
]
```

**Output**:

- ✓ Valid links (200, 301, 302) with response time
- ✗ Broken links (404, 500, timeout) with error details
- ⚠ Redirected links (301, 302) with final destination
- Summary statistics (total, valid, broken, excluded)

**Exit codes**:

- `0`: All links valid or excluded
- `1`: Broken links found

**Examples**:

```bash
# Check all external links
python3 .github/scripts/check-links.py

# Check specific file
python3 .github/scripts/check-links.py README.md

# Verbose output with response details
python3 .github/scripts/check-links.py --verbose
```

**When to use**:

- ✅ Monthly documentation audits (external links decay)
- ✅ Before major releases (ensure all references valid)
- ✅ After restructuring documentation
- ✅ When users report broken links
- ❌ Not in CI/CD (external sites unreliable, rate limiting)

**Performance**:

- Timeout: 30 seconds per link
- Concurrent requests: 5 (configurable)
- Execution time: ~2-5 minutes for 100 links

**Related Tools**:

- `validate-cross-references.sh` - Internal markdown links
- `check-references.py` - File path references

---

### JavaScript Utilities (1 script)

#### 19. generate_api_docs.js

**Purpose**: Generates API documentation from JSDoc comments
**Usage**: `node .github/scripts/generate_api_docs.js`

---

## Usage Patterns

### In CI/CD Workflows

```yaml
- name: Check version consistency
  run: ./.github/scripts/check-version-consistency.sh

- name: Validate cross-references
  run: ./.github/scripts/validate-cross-references.sh
```

### Via npm Scripts

```bash
npm run check:version          # Version consistency
npm run check:references       # Link validation
npm run check:terminology      # Terminology consistency
npm run cdn:generate           # Generate CDN URLs
npm run ci:test-local         # Test workflow locally
```

### Direct Execution

```bash
# From project root
./.github/scripts/cdn-delivery.sh
./.github/scripts/check-version-consistency.sh
```

---

## CI/CD Integration Matrix

### Workflows Using Scripts

| Workflow | Scripts Used | Integration Status |
|----------|--------------|-------------------|
| version-consistency.yml | ⚠️ Inline (could use check-version-consistency.sh) | 🔴 Migration recommended |
| documentation-lint.yml | ⚠️ References update-badges.sh | 🟡 Partial integration |
| link-checker.yml | ⚠️ Inline curl (could use check-links.py) | 🟡 Enhancement opportunity |
| modified-files.yml | ⚠️ Inline git diff (could use change-type-detector.sh) | 🔴 Migration recommended |
| jsdoc-coverage.yml | ✅ Uses jsdoc-audit.js via npm | ✅ Properly integrated |
| test-badges.yml | ⚠️ Inline (could integrate update-badges.sh) | 🟡 Enhancement opportunity |
| dependency-audit.yml | ✅ Self-contained workflow | ✅ Well documented |
| test.yml | ✅ Uses npm scripts | ✅ Appropriate architecture |

### Migration Opportunities (High Priority)

**1. version-consistency.yml** → `check-version-consistency.sh`

- Benefit: More comprehensive version checks
- Effort: 10 minutes
- Impact: HIGH - Catch more version inconsistencies

**2. modified-files.yml** → `change-type-detector.sh` + `workflow-condition-evaluator.sh`

- Benefit: Standardized Conventional Commits parsing
- Effort: 30 minutes
- Impact: HIGH - Better conditional execution logic
- Requires: `.workflow-config.yaml` configuration

**3. link-checker.yml** → `check-links.py`

- Benefit: Better error handling, timeout support
- Effort: 10 minutes
- Impact: MEDIUM - More reliable link validation

### Example Integration

```yaml
# .github/workflows/version-consistency.yml (proposed)
- name: Check version consistency
  run: ./.github/scripts/check-version-consistency.sh

# .github/workflows/modified-files.yml (proposed)
- name: Detect change type
  id: change-type
  run: |
    TYPE=$(./.github/scripts/change-type-detector.sh ${{ github.event.before }})
    echo "type=$TYPE" >> $GITHUB_OUTPUT

- name: Check if tests should run
  id: should-test
  run: |
    RESULT=$(./.github/scripts/workflow-condition-evaluator.sh test-suite)
    echo "run=$RESULT" >> $GITHUB_OUTPUT
```

**Documentation**: See CI/CD Integration Analysis section above for complete migration guide

---

## Script Development Guidelines

### Requirements

- **Shebang**: `#!/bin/bash` or `#!/usr/bin/env python3`
- **Error handling**: Use `set -e` for bash
- **Help option**: Always include `--help`
- **Relative paths**: No hardcoded absolute paths
- **Exit codes**: 0 = success, 1 = failure

### Testing

- Test in clean environment
- Run from project root
- Test with missing dependencies
- Validate error messages

### Documentation

- Add entry to this README
- Document in `docs/AUTOMATION_TOOLS.md`
- Add npm script alias if user-facing
- Include usage examples

---

## Relationship to Other Directories

### `.github/scripts/` vs `scripts/`

- **`.github/scripts/`**: CI/CD automation, git hooks, GitHub-specific
- **`scripts/`**: Project maintenance, manual utilities, developer tools

### `.github/scripts/` vs `.github/actions/`

- **Scripts**: Shell scripts, direct execution, workflow steps
- **Actions**: Reusable workflow components, GitHub Actions format

### `.github/scripts/` vs `.github/workflows/`

- **Scripts**: Implementation logic
- **Workflows**: Orchestration, triggers, step definitions

---

## Related Documentation

- `scripts/` - Project maintenance scripts
- `docs/AUTOMATION_TOOLS.md` - Comprehensive automation guide
- `docs/WORKFLOW_SETUP.md` - CI/CD workflow documentation
- `.github/workflows/README.md` - Workflow documentation

---

**Last Updated**: 2026-02-15
**Script Count**: 20 documented
**Workflow Count**: 10 analyzed
**Integration Opportunities**: 6 identified
**Status**: ✅ All scripts documented and standardized
