# GitHub Scripts Directory

**Purpose**: Automation scripts for CI/CD workflows, git hooks, and documentation maintenance

**Location**: `.github/scripts/`  
**Count**: 17 executable files (13 shell, 3 Python, 1 JavaScript)

---

## Script Inventory

### Documentation & Consistency (5 scripts)

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
**Usage**: `./.github/scripts/validate-cross-references.sh`  
**Documentation**: ❌ **UNDOCUMENTED**

**What it does**:
- Checks internal doc links
- Validates relative paths
- Reports broken references

---

### CDN & Distribution (1 script)

#### 6. cdn-delivery.sh (229 lines)
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

#### 7. test-workflow-locally.sh (318 lines)
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

#### 8. validate-jsdom-update.sh
**Purpose**: Validates jsdom dependency updates  
**Usage**: `./.github/scripts/validate-jsdom-update.sh`  
**Documentation**: copilot-instructions.md

**What it does**:
- Tests jsdom upgrade compatibility
- Runs test suite with new version
- Validates DOM API compatibility

---

#### 9. change-type-detector.sh (308 lines)
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

#### 10. test-change-type-detection.sh (237 lines)
**Purpose**: Test suite for change-type-detector.sh  
**Usage**: `./.github/scripts/test-change-type-detection.sh`  
**Documentation**: ✅ **COMPLETE**

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

#### 11. test-conditional-execution.sh (203 lines)
**Purpose**: Test suite for workflow-condition-evaluator.sh  
**Usage**: `./.github/scripts/test-conditional-execution.sh`  
**Documentation**: ✅ **COMPLETE**

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

#### 12. workflow-condition-evaluator.sh (225 lines)
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

#### 13. update-badges.sh
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

#### 14. extract_docs.py
**Purpose**: Extracts documentation from source files  
**Usage**: `python3 .github/scripts/extract_docs.py`

---

#### 15. analyze_code_structure.py
**Purpose**: Analyzes codebase structure and generates reports  
**Usage**: `python3 .github/scripts/analyze_code_structure.py`

---

#### 16. validate_imports.py
**Purpose**: Validates ES6 module imports  
**Usage**: `python3 .github/scripts/validate_imports.py`

---

### JavaScript Utilities (1 script)

#### 17. generate_api_docs.js
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

**Last Updated**: 2026-02-11  
**Maintainer**: DevOps team  
**Status**: 5 scripts need documentation (issues #3, #5, #9-12)
