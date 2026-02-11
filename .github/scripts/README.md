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
**Usage**: `./.github/scripts/change-type-detector.sh <commit-message>`  
**Documentation**: ❌ **UNDOCUMENTED**

**What it does**:
- Parses Conventional Commits format
- Determines change type: feat, fix, docs, test, refactor, etc.
- Used by conditional workflow execution

**Output**: Change type string (feat/fix/docs/test/...)

---

#### 10. test-change-type-detection.sh (237 lines)
**Purpose**: Test suite for change-type-detector.sh  
**Usage**: `./.github/scripts/test-change-type-detection.sh`  
**Documentation**: ❌ **UNDOCUMENTED**

**What it does**:
- Runs test cases for change type detection
- Validates Conventional Commits parsing
- Reports pass/fail for each scenario

---

#### 11. test-conditional-execution.sh (203 lines)
**Purpose**: Test suite for workflow-condition-evaluator.sh  
**Usage**: `./.github/scripts/test-conditional-execution.sh`  
**Documentation**: ❌ **UNDOCUMENTED**

**What it does**:
- Tests workflow condition evaluation logic
- Validates conditional execution rules
- Ensures CI/CD workflows run appropriately

---

#### 12. workflow-condition-evaluator.sh (225 lines)
**Purpose**: Evaluates conditional workflow execution rules  
**Usage**: `./.github/scripts/workflow-condition-evaluator.sh <condition>`  
**Documentation**: ❌ **UNDOCUMENTED**

**What it does**:
- Determines if workflow should run based on changes
- Evaluates file path patterns
- Used by modified-files.yml workflow

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
