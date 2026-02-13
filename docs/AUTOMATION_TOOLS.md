# Documentation Automation Tools

**Version**: 0.9.0-alpha  
**Last Updated**: 2026-01-01

## Overview

Automated tools to maintain documentation quality and prevent inconsistencies in Guia.js.

## Tools Provided

### 1. Pre-commit Hook (`pre-commit`)

Prevents commits with documentation inconsistencies by running 5 automated checks.

**Location**: `.github/hooks/pre-commit`

#### Installation

```bash
# Copy hook to git hooks directory
cp .github/hooks/pre-commit .git/hooks/pre-commit

# Make executable
chmod +x .git/hooks/pre-commit

# Verify installation
ls -la .git/hooks/pre-commit
```

#### Checks Performed

##### Check 1: Version Consistency ✅
Verifies version number (`0.9.0-alpha`) appears in all key files:
- `package.json`
- `README.md`
- `docs/INDEX.md`
- `.github/copilot-instructions.md`
- `src/config/defaults.js`

**If fails**: Lists files with version mismatches  
**Action**: Update all files to match `package.json`

##### Check 2: Test Count Synchronization ✅
Verifies test count (`1224 tests`) is documented in:
- `README.md`
- `.github/copilot-instructions.md`

**If fails**: Shows which files need updating  
**Action**: Run `npm test` and update documented counts

##### Check 3: Last Updated Dates 🔄 (Auto-fix)
Automatically updates "Last Updated" dates in modified `.md` files.

**Behavior**:
- Detects staged `.md` files with "Last Updated:" field
- Updates date to current date (YYYY-MM-DD format)
- Re-stages file automatically

**Example**:
```
Before: **Last Updated**: 2025-12-15
After:  **Last Updated**: 2026-01-01
```

##### Check 4: Broken Markdown Links ✅
Detects broken links to `.md` files within documentation.

**Checks**:
- Relative links: `[Text](../path/file.md)`
- Same-directory links: `[Text](./file.md)`
- Resolves `../` navigation

**If fails**: Lists broken links with source file  
**Action**: Fix or remove broken links

##### Check 5: File Reference Verification ✅
Verifies references to source files exist.

**Checks**:
- Pattern: `src/path/to/File.js`
- Verifies file exists in repository

**If fails**: Lists missing files  
**Action**: Update paths or verify files exist

#### Example Output

```bash
$ git commit -m "Update documentation"

═══ Documentation Consistency Check (Pre-commit) ═══

[1/5] Version consistency...
  ✓ README.md
  ✓ docs/INDEX.md
  ✓ .github/copilot-instructions.md
  ✓ src/config/defaults.js
✓ Versions consistent

[2/5] Test count...
  ✓ README.md
  ✓ .github/copilot-instructions.md
✓ Test counts OK

[3/5] Last Updated dates...
  ✓ Updated README.md
✓ Dates current

[4/5] Markdown links...
✓ No broken links

[5/5] File references...
✓ Files verified

═══ ✓ All checks passed ═══
[main abc1234] Update documentation
```

#### Bypassing the Hook (Not Recommended)

If absolutely necessary:

```bash
# Skip pre-commit hook (use with caution!)
git commit --no-verify -m "Message"
```

**⚠️ Warning**: Only bypass for emergency commits. Fix issues in next commit.

---

## 2. CI/CD Integration (Future)

### GitHub Actions Workflow

Add to `.github/workflows/documentation-check.yml`:

```yaml
name: Documentation Consistency Check

on:
  pull_request:
    paths:
      - '**.md'
      - 'package.json'
      - 'src/config/defaults.js'

jobs:
  check-documentation:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Check version consistency
        run: |
          VERSION=$(node -p "require('./package.json').version")
          echo "Package version: $VERSION"
          
          FILES="README.md docs/INDEX.md .github/copilot-instructions.md"
          for file in $FILES; do
            if ! grep -q "$VERSION" "$file"; then
              echo "::error file=$file::Version mismatch"
              exit 1
            fi
          done
      
      - name: Check test counts
        run: |
          ACTUAL=$(npx jest --listTests 2>/dev/null | wc -l || echo "60")
          echo "Actual test files: $ACTUAL"
          
          if ! grep -q "1224.*test" README.md; then
            echo "::warning file=README.md::Test count may be outdated"
          fi
      
      - name: Check for broken links
        uses: gaurav-nelson/github-action-markdown-link-check@v1
        with:
          use-quiet-mode: 'yes'
          config-file: '.github/markdown-link-check-config.json'
```

### Link Checker Configuration

Create `.github/markdown-link-check-config.json`:

```json
{
  "ignorePatterns": [
    {
      "pattern": "^https://cdn.jsdelivr.net"
    },
    {
      "pattern": "^https://nominatim.openstreetmap.org"
    }
  ],
  "replacementPatterns": [],
  "httpHeaders": [
    {
      "urls": ["https://github.com"],
      "headers": {
        "Accept-Encoding": "zlib, deflate, br"
      }
    }
  ],
  "timeout": "20s",
  "retryOn429": true,
  "retryCount": 3
}
```

---

## 3. Version Bump Script

### `bump-version.sh`

Automatically updates version across all files.

Create `.github/scripts/bump-version.sh`:

```bash
#!/bin/bash
# Version Bump Script
# Usage: ./bump-version.sh 0.9.0-alpha

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <new-version>"
    echo "Example: $0 0.9.0-alpha"
    exit 1
fi

NEW_VERSION="$1"
OLD_VERSION=$(node -p "require('./package.json').version")

echo "Bumping version: $OLD_VERSION → $NEW_VERSION"
echo ""

# Update package.json
npm version "$NEW_VERSION" --no-git-tag-version
echo "✓ Updated package.json"

# Update source code
sed -i "s/VERSION = '$OLD_VERSION'/VERSION = '$NEW_VERSION'/" src/config/defaults.js
echo "✓ Updated src/config/defaults.js"

# Update documentation
for file in README.md docs/INDEX.md .github/copilot-instructions.md; do
    sed -i "s/$OLD_VERSION/$NEW_VERSION/g" "$file"
    echo "✓ Updated $file"
done

# Update test snapshots if needed
echo ""
echo "⚠ Remember to:"
echo "  1. Update CHANGELOG.md"
echo "  2. Run: npm test"
echo "  3. Commit: git commit -am 'chore: bump version to $NEW_VERSION'"
echo "  4. Tag: git tag v$NEW_VERSION"
echo "  5. Push: git push && git push --tags"
```

**Usage**:

```bash
# Make executable
chmod +x .github/scripts/bump-version.sh

# Bump version
./.github/scripts/bump-version.sh 0.9.0-alpha
```

---

## 4. Documentation Health Check

### `check-docs.sh`

Comprehensive documentation audit.

Create `.github/scripts/check-docs.sh`:

```bash
#!/bin/bash
# Documentation Health Check

echo "Documentation Health Check"
echo "=========================="
echo ""

# Check 1: Files missing timestamps
echo "📅 Checking timestamps..."
NO_TIMESTAMP=0
for file in $(find docs .github -name "*.md" -type f); do
    if ! grep -q "Last Updated:" "$file"; then
        echo "  ⚠ Missing timestamp: $file"
        NO_TIMESTAMP=$((NO_TIMESTAMP + 1))
    fi
done
echo "  Found $NO_TIMESTAMP files without timestamps"
echo ""

# Check 2: Outdated timestamps (> 6 months)
echo "📆 Checking stale docs..."
STALE_DOCS=0
SIX_MONTHS_AGO=$(date -d '6 months ago' +%Y-%m-%d)
for file in $(find docs .github -name "*.md" -type f); do
    if grep -q "Last Updated:" "$file"; then
        DATE=$(grep "Last Updated:" "$file" | grep -oP '\d{4}-\d{2}-\d{2}')
        if [ "$DATE" \< "$SIX_MONTHS_AGO" ]; then
            echo "  ⚠ Stale (>6 months): $file ($DATE)"
            STALE_DOCS=$((STALE_DOCS + 1))
        fi
    fi
done
echo "  Found $STALE_DOCS stale documents"
echo ""

# Check 3: Test file count
echo "🧪 Checking test count..."
ACTUAL_TESTS=$(find __tests__ -name "*.test.js" -o -name "*.spec.js" | wc -l)
echo "  Actual test files: $ACTUAL_TESTS"

if grep -q "$ACTUAL_TESTS" README.md; then
    echo "  ✓ README.md is accurate"
else
    echo "  ⚠ README.md may be outdated"
fi
echo ""

# Check 4: Dead code references
echo "💀 Checking for references to removed files..."
DEAD_REFS=0
for file in $(find docs -name "*.md" -type f); do
    while IFS= read -r ref; do
        if [ ! -f "$ref" ]; then
            echo "  ⚠ Dead reference in $file: $ref"
            DEAD_REFS=$((DEAD_REFS + 1))
        fi
    done < <(grep -oP 'src/[a-zA-Z0-9/_.-]+\.js' "$file" 2>/dev/null || true)
done
echo "  Found $DEAD_REFS dead code references"
echo ""

# Summary
echo "Summary"
echo "======="
echo "  Missing timestamps: $NO_TIMESTAMP"
echo "  Stale docs (>6mo): $STALE_DOCS"
echo "  Dead references: $DEAD_REFS"
echo ""

if [ $NO_TIMESTAMP -eq 0 ] && [ $STALE_DOCS -eq 0 ] && [ $DEAD_REFS -eq 0 ]; then
    echo "✓ Documentation is healthy!"
    exit 0
else
    echo "⚠ Documentation needs attention"
    exit 1
fi
```

**Usage**:

```bash
# Run health check
./.github/scripts/check-docs.sh

# Example output:
# Missing timestamps: 5
# Stale docs (>6mo): 3
# Dead references: 2
# ⚠ Documentation needs attention
```

---

## 5. Automated Test Count Update

### `update-test-count.sh`

Automatically updates test count in documentation.

Create `.github/scripts/update-test-count.sh`:

```bash
#!/bin/bash
# Update Test Count in Documentation

# Get actual test count
TEST_COUNT=$(npx jest --listTests 2>/dev/null | wc -l || echo "60")
SUITE_COUNT=$(find __tests__ -type d | tail -n +2 | wc -l)

echo "Actual counts:"
echo "  Test files: $TEST_COUNT"
echo "  Test suites: $SUITE_COUNT"
echo ""

# Update README.md
sed -i "s/[0-9]\+ passing tests/$TEST_COUNT passing tests/" README.md
sed -i "s/[0-9]\+ passing suites/$SUITE_COUNT passing suites/" README.md
echo "✓ Updated README.md"

# Update copilot-instructions.md
sed -i "s/[0-9]\+ tests in [0-9]\+ suites/$TEST_COUNT tests in $SUITE_COUNT suites/" .github/copilot-instructions.md
echo "✓ Updated copilot-instructions.md"

echo ""
echo "Test counts updated. Review changes with: git diff"
```

---

## Installation Guide

### Quick Setup (5 minutes)

```bash
# 1. Install pre-commit hook
cp .github/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# 2. Make scripts executable
chmod +x .github/scripts/*.sh

# 3. Test the hook
git add -A
git commit -m "test: documentation automation"
```

### Full Setup (15 minutes)

```bash
# 1. Install all hooks
cp .github/hooks/* .git/hooks/
chmod +x .git/hooks/*

# 2. Create scripts directory
mkdir -p .github/scripts

# 3. Install scripts (create files from above)
# - bump-version.sh
# - check-docs.sh
# - update-test-count.sh

# 4. Make executable
chmod +x .github/scripts/*.sh

# 5. Test health check
./.github/scripts/check-docs.sh

# 6. (Optional) Add CI workflow
# Create .github/workflows/documentation-check.yml
```

---

## Usage Examples

### Daily Workflow

```bash
# Make documentation changes
vim README.md

# Stage changes
git add README.md

# Commit (hook runs automatically)
git commit -m "docs: update feature description"

# Hook output:
# ═══ Documentation Consistency Check ═══
# [1/5] Version consistency... ✓
# [2/5] Test count... ✓  
# [3/5] Last Updated dates... ✓ Updated README.md
# [4/5] Markdown links... ✓
# [5/5] File references... ✓
# ═══ ✓ All checks passed ═══
```

### Version Release

```bash
# Bump version
./.github/scripts/bump-version.sh 0.9.0-alpha

# Review changes
git diff

# Commit and tag
git commit -am "chore: bump version to 0.9.0-alpha"
git tag v0.9.0-alpha

# Push
git push && git push --tags
```

### Monthly Health Check

```bash
# Run comprehensive check
./.github/scripts/check-docs.sh

# Update test counts if needed
./.github/scripts/update-test-count.sh

# Fix any issues found
# ...

# Commit fixes
git commit -am "docs: monthly health check fixes"
```

---

## Troubleshooting

### Hook Not Running

**Problem**: Pre-commit hook doesn't execute

**Solution**:
```bash
# Verify installation
ls -la .git/hooks/pre-commit

# Check permissions
chmod +x .git/hooks/pre-commit

# Test manually
.git/hooks/pre-commit
```

### False Positives

**Problem**: Hook reports errors incorrectly

**Solution**:
```bash
# Review the specific check
# Edit .github/hooks/pre-commit
# Adjust patterns or add exceptions

# Temporarily bypass (emergency only)
git commit --no-verify
```

### CI Workflow Failures

**Problem**: GitHub Actions check fails

**Solution**:
```bash
# Run checks locally
./.github/scripts/check-docs.sh

# Fix issues
# ...

# Push fixes
git push
```

---

## Maintenance

### Monthly Tasks
- Run `.github/scripts/check-docs.sh`
- Review and update stale documentation
- Update test counts if changed significantly

### Quarterly Tasks
- Review automation scripts for improvements
- Update hook patterns if new files added
- Audit "Last Updated" dates across all docs

### Per-Release Tasks
- Run `.github/scripts/bump-version.sh <version>`
- Update CHANGELOG.md
- Verify all checks pass before tagging

---

## Future Enhancements

### Planned Features
1. **Spell checker integration** - Catch typos before commit
2. **Diagram validation** - Verify Mermaid syntax
3. **External link checker** - Test HTTP links
4. **Coverage badge automation** - Auto-update coverage badges
5. **Changelog generator** - Generate CHANGELOG from commits

### Community Contributions Welcome
- Improve pattern matching
- Add new consistency checks
- Create IDE integrations
- Build web dashboard

---

## Related Documentation

- [DOCUMENTATION_IMPROVEMENT_RECOMMENDATIONS.md](./DOCUMENTATION_IMPROVEMENT_RECOMMENDATIONS.md) - Future improvements
- [CONTRIBUTING.md](../.github/CONTRIBUTING.md) - Contribution guidelines
- [CODE_REVIEW_GUIDE.md](../.github/CODE_REVIEW_GUIDE.md) - Review checklist

---

**Version**: 0.9.0-alpha  
**Last Updated**: 2026-01-01  
**Maintainer**: Guia.js Team

---

## 6. Automated Badge Updates

### `update-badges.sh`

Automatically updates README badges with actual test results and coverage.

**Location**: `.github/scripts/update-badges.sh`

#### Features
- ✅ Extracts test count from `npm test` output
- ✅ Extracts coverage percentage from `npm run test:coverage`
- ✅ Updates test badge: `tests-1224%20passing-brightgreen`
- ✅ Updates coverage badge with dynamic color:
  - 80%+: bright green
  - 70-79%: green
  - 60-69%: yellow
  - 50-59%: orange
  - <50%: red
- ✅ Also updates `.github/copilot-instructions.md`

#### Usage

```bash
# Run after making test changes
npm test
./.github/scripts/update-badges.sh

# Review changes
git diff README.md

# Commit
git add README.md .github/copilot-instructions.md
git commit -m "chore: update test badges"
```

#### Example Output

```
╔════════════════════════════════════════════════════════════╗
║         Automated Badge Update from Test Results          ║
╚════════════════════════════════════════════════════════════╝

[1/3] Running tests to extract counts...
  Extracted: 1224 tests in 57 suites

[2/3] Running coverage to extract percentage...
  Extracted: 70% coverage

[3/3] Updating badges in README.md...
  ✓ Updated badges in README.md
  ✓ Updated copilot-instructions.md

╔════════════════════════════════════════════════════════════╗
║   ✓ Badge update complete!                                ║
╚════════════════════════════════════════════════════════════╝

  Test Badge: 1224 passing
  Coverage Badge: 70% (green)

Review changes with: git diff README.md
```

---

## 7. Documentation Linting

### markdownlint Configuration

Ensures consistent markdown formatting across all documentation.

**Configuration**: `.markdownlint.json`

#### Rules Enforced
- ✅ ATX-style headers (`#` instead of underlines)
- ✅ Dash-style lists (`-` instead of `*`)
- ✅ 120 character line length (except code/tables)
- ✅ Fenced code blocks (` ``` ` style)
- ✅ Consistent ordered lists
- ✅ Single H1 per document

#### Local Usage

```bash
# Install markdownlint-cli2
npm install -g markdownlint-cli2

# Lint all markdown files
markdownlint-cli2 "**/*.md"

# Lint with auto-fix
markdownlint-cli2 --fix "**/*.md"

# Lint specific files
markdownlint-cli2 README.md docs/*.md
```

#### CI Integration

Automatically runs on all PRs touching `.md` files.

See: `.github/workflows/documentation-lint.yml`

---

## 8. Link Checking

### markdown-link-check Configuration

Validates all internal and external links in documentation.

**Configuration**: `.github/markdown-link-check-config.json`

#### Features
- ✅ Checks internal relative links
- ✅ Validates external HTTPS links
- ✅ Ignores CDN and API endpoints (allowed to be offline)
- ✅ Retries on 429 (rate limit)
- ✅ 20 second timeout per link
- ✅ Only checks modified files in PRs

#### Ignored Patterns
- `https://cdn.jsdelivr.net` (CDN may be temporarily unavailable)
- `https://nominatim.openstreetmap.org` (API endpoint)
- `https://servicodados.ibge.gov.br` (API endpoint)
- `http://localhost` (local development)

#### CI Integration

Runs automatically on PRs. See workflow: `documentation-lint.yml`

---

## 9. Line Number Deprecation Check

### Automated Detection

Prevents adding outdated line number references to documentation.

**Integration**: `.github/workflows/documentation-lint.yml`

#### What It Checks
- ❌ Patterns like: `"lines 62-666"`
- ❌ Patterns like: `"line 123"`
- ✅ Suggests using file paths instead

#### Example

```bash
# ❌ This will be flagged:
See lines 100-200 in guia.js

# ✅ Use this instead:
See src/core/GeoPosition.js
```

#### CI Behavior

```
Checking for line number references in documentation...

❌ Found line number references (deprecated):
docs/architecture/OLD_DOC.md:45:See lines 100-200

Line numbers become stale quickly. Use module/file references instead.
Example: Instead of 'lines 62-666', use 'src/core/GeoPosition.js'

Build failed.
```

---

## 10. GitHub Actions Workflows

### documentation-lint.yml

Comprehensive CI/CD pipeline for documentation quality.

**Location**: `.github/workflows/documentation-lint.yml`

#### Jobs

##### 1. Markdown Linting
- Runs: `markdownlint-cli2`
- Checks: Formatting consistency
- Fails: On formatting violations

##### 2. Link Validation
- Runs: `markdown-link-check`
- Checks: Internal and external links
- Fails: On broken links

##### 3. Line Number Check
- Runs: Custom grep script
- Checks: Deprecated line references
- Fails: If line numbers found

##### 4. Badge Synchronization
- Runs: Test suite
- Checks: Badge accuracy
- Warns: If badges out of date (doesn't fail)

##### 5. Version Consistency
- Runs: Version extraction
- Checks: All files match package.json
- Fails: On version mismatches

#### Trigger Conditions

```yaml
on:
  pull_request:
    paths:
      - '**.md'
      - '.markdownlint.json'
  push:
    branches:
      - main
    paths:
      - '**.md'
```

---

## Complete Automation Stack

### Summary of All Tools

| Tool | Type | Auto-Fix | CI/CD | Purpose |
|------|------|----------|-------|---------|
| pre-commit | Git Hook | ✅ Dates | ❌ | Pre-commit validation |
| update-badges.sh | Script | ✅ | ❌ | Badge synchronization |
| bump-version.sh | Script | ✅ | ❌ | Version updates |
| check-docs.sh | Script | ❌ | ❌ | Health monitoring |
| markdownlint | Linter | ✅ | ✅ | Format consistency |
| link-check | Validator | ❌ | ✅ | Link validation |
| line-number-check | Validator | ❌ | ✅ | Deprecation detection |
| version-check | Validator | ❌ | ✅ | Version consistency |
| badge-sync-check | Validator | ❌ | ✅ | Badge accuracy |

### Automation Flow

```
Developer Commits
       ↓
   Pre-commit Hook (5 checks)
       ↓
   Push to GitHub
       ↓
   CI Pipeline Triggers
       ↓
   ┌─────────────────┐
   │ Markdown Lint   │ → Format check
   │ Link Check      │ → Validate links
   │ Line # Check    │ → Detect deprecated refs
   │ Badge Sync      │ → Verify accuracy
   │ Version Check   │ → Consistency
   └─────────────────┘
       ↓
   All Checks Pass
       ↓
   Merge Approved
```

---

## Updated Installation Guide

### Prerequisites

Before installing automation tools, ensure you have:

**Required**:
- **Bash shell** (Linux/macOS default, Windows WSL/Git Bash)
- **Git** - For hooks and version control
- **Node.js v18+** - For npm scripts and markdownlint
- **npm v10+** - For package management

**Optional**:
- **Python 3.11+** - For web server testing (already required for Guia.js)

**Verify Environment**:
```bash
# Check bash
bash --version

# Check Git
git --version

# Check Node.js and npm
node --version
npm --version
```

### Complete Setup (15 minutes)

```bash
# 1. Install pre-commit hook
cp .github/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# 2. Install markdownlint-cli2 (global)
npm install -g markdownlint-cli2

# 3. Make scripts executable
chmod +x .github/scripts/*.sh

# 4. Test pre-commit hook
git add -A
git commit -m "test: automation setup"

# 5. Test badge update
./.github/scripts/update-badges.sh

# 6. Test linting
markdownlint-cli2 "**/*.md"

# 7. Test health check
./.github/scripts/check-docs.sh
```

### CI/CD Setup (Already Configured)

✅ Workflows are ready to use:
- Push to main → Full validation
- Open PR → Validation on changed files
- No additional setup required

---

## Updated Usage Examples

### Daily Workflow with Full Automation

```bash
# 1. Make documentation changes
vim docs/NEW_FEATURE.md

# 2. Run linter (optional, CI will do it)
markdownlint-cli2 docs/NEW_FEATURE.md

# 3. Stage changes
git add docs/NEW_FEATURE.md

# 4. Commit (pre-commit hook runs automatically)
git commit -m "docs: add new feature guide"

# Output:
# ═══ Documentation Consistency Check ═══
# [1/5] Version consistency... ✓
# [2/5] Test count... ✓
# [3/5] Last Updated dates... ✓ Updated NEW_FEATURE.md
# [4/5] Markdown links... ✓
# [5/5] File references... ✓
# ═══ ✓ All checks passed ═══

# 5. Push to GitHub
git push origin feature/new-docs

# 6. CI runs automatically:
#    - Markdown linting
#    - Link checking
#    - Line number detection
#    - Badge sync check
#    - Version consistency
```

### After Adding Tests

```bash
# 1. Add new tests
git add __tests__/new-feature.test.js

# 2. Run tests
npm test

# 3. Update badges automatically
./.github/scripts/update-badges.sh

# 4. Commit badge updates
git add README.md .github/copilot-instructions.md
git commit -m "chore: update badges after adding tests"
```

---

**Version**: 0.9.0-alpha  
**Last Updated**: 2026-01-01  
**Status**: ✅ Complete Automation Stack
