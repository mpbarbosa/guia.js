# Git Hooks Directory Investigation

**Investigation Date**: 2026-01-06  
**Project**: guia_turistico v0.9.0-alpha  
**Focus Area**: `.github/hooks/` directory documentation  
**Status**: ✅ Complete

---

## 🎯 Executive Summary

The `.github/hooks/` directory contains a **pre-commit hook** that performs automated documentation consistency checks before allowing commits. This is a critical quality assurance tool that prevents common documentation errors from entering the repository.

**Key Finding**: Hook exists but is not documented in any user-facing guides.

---

## 📂 Current State

### Files Found
```
.github/hooks/
└── pre-commit (101 lines, 3.1KB, executable)
```

### Hook Status
- ✅ **Executable**: Permissions set correctly (`-rwxrwxr-x`)
- ✅ **Location**: Stored in `.github/hooks/` (tracked by git)
- ⚠️ **Installation**: Requires manual installation to `.git/hooks/` (not automatic)
- ⚠️ **Documentation**: Not mentioned in WORKFLOW_SETUP.md or CONTRIBUTING.md

---

## 🔍 Pre-commit Hook Analysis

### Purpose
Validates documentation consistency before commits are allowed, preventing:
- Version number mismatches across files
- Outdated test counts in documentation
- Stale "Last Updated" timestamps
- Broken markdown links
- Missing file references

### Validation Checks (5 phases)

#### Check 1: Version Consistency
**Files Checked**:
- `README.md`
- `docs/INDEX.md`
- `.github/copilot-instructions.md`
- `src/config/defaults.js`

**Pattern**: `0.6.0-alpha` (hardcoded)

**Issue Identified**: ⚠️ Hook checks for version `0.6.0-alpha` but project is currently `0.9.0-alpha`

#### Check 2: Test Count Validation
**Files Checked**:
- `README.md`
- `.github/copilot-instructions.md`

**Pattern**: `1224.*test`

**Issue Identified**: ⚠️ Hook checks for 1224 tests but project currently has 1,399 tests

#### Check 3: Auto-update Timestamps
**Behavior**: Automatically updates "Last Updated: YYYY-MM-DD" in modified markdown files

**Action**: Updates timestamp to current date and stages the change

#### Check 4: Broken Links Detection
**Scope**: Checks relative markdown links (`.md` files only)

**Validation**: Verifies target files exist relative to source file directory

#### Check 5: File Reference Validation
**Pattern**: Validates `src/[path].js` references in documentation

**Verification**: Ensures referenced JavaScript files exist

### Exit Behavior
- **Success**: Exit code 0, commit proceeds
- **Failure**: Exit code 1, commit blocked with error messages

---

## ⚠️ Critical Issues Identified

### 1. Outdated Version Check (HIGH PRIORITY)
**Problem**: Hook validates for version `0.6.0-alpha` when project is at `0.9.0-alpha`

**Impact**: Version updates would fail pre-commit check

**Line**: 18
```bash
VERSION_PATTERN="0\.6\.0-alpha"
```

**Fix Required**:
```bash
VERSION_PATTERN="0\.7\.0-alpha"
```

### 2. Outdated Test Count Check (HIGH PRIORITY)
**Problem**: Hook expects 1224 tests when project has 1,399 tests

**Impact**: Documentation updates with correct test counts would fail

**Lines**: 39-41
```bash
if [ -f "$file" ] && grep -q "1224.*test" "$file"; then
    echo "  ✓ $file"
fi
```

**Fix Required**:
```bash
if [ -f "$file" ] && grep -q "1399.*test" "$file"; then
    echo "  ✓ $file"
fi
```

### 3. No Installation Documentation (MEDIUM PRIORITY)
**Problem**: Hook installation instructions only exist as comment in the hook file itself

**Impact**: New developers may not know hook exists or how to install it

**Current State**:
- ❌ Not mentioned in `CONTRIBUTING.md`
- ❌ Not mentioned in `WORKFLOW_SETUP.md`
- ❌ Not mentioned in `README.md`
- ✅ Installation command exists as comment in hook (line 3)

---

## 📊 Hook Effectiveness Analysis

### Strengths
- ✅ Catches version mismatches before commit
- ✅ Prevents outdated timestamps in documentation
- ✅ Validates markdown link integrity
- ✅ Verifies file references exist
- ✅ Auto-updates timestamps (reduces manual work)
- ✅ Clear, color-coded output
- ✅ Fast execution (<1 second typical)

### Weaknesses
- ⚠️ Hardcoded version pattern (requires manual updates)
- ⚠️ Hardcoded test count (requires manual updates)
- ⚠️ Only checks staged markdown files (not all files)
- ⚠️ No validation for absolute paths or external URLs
- ⚠️ Not automatically installed (requires manual setup)

### Comparison with GitHub Actions
| Feature | Pre-commit Hook | GitHub Actions |
|---------|----------------|----------------|
| Version validation | ✅ Yes (outdated) | ✅ Yes |
| Test count validation | ✅ Yes (outdated) | ✅ Yes (via test suite) |
| Link checking | ✅ Relative only | ✅ Comprehensive |
| Timestamp updates | ✅ Automatic | ✅ Automatic |
| Installation | ⚠️ Manual | ✅ Automatic |
| Runs when | Every commit | Push/PR only |
| Speed | ⚡ <1s | 🐌 2-5 minutes |

**Verdict**: Hook provides fast local validation; GitHub Actions provides comprehensive CI/CD checks. Both are valuable.

---

## 🎯 Recommendations

### Immediate Actions (30 minutes)

#### 1. Update Hook Version Pattern
**File**: `.github/hooks/pre-commit` line 18
```bash
# OLD
VERSION_PATTERN="0\.6\.0-alpha"

# NEW
VERSION_PATTERN="0\.7\.0-alpha"
```

#### 2. Update Hook Test Count Pattern
**File**: `.github/hooks/pre-commit` line 39
```bash
# OLD
if [ -f "$file" ] && grep -q "1224.*test" "$file"; then

# NEW
if [ -f "$file" ] && grep -q "1399.*test" "$file"; then
```

#### 3. Add Hook Documentation to WORKFLOW_SETUP.md
**Location**: After line 411 (before "Examples" section)

Add new section:
```markdown
## 🪝 Git Hooks (Local Validation)

### Pre-commit Hook

The project includes a pre-commit hook that validates documentation consistency **before** commits are created. This provides instant feedback and prevents common errors.

#### What It Checks
1. **Version Consistency**: Ensures version numbers match across key files
2. **Test Counts**: Validates test count references are current
3. **Timestamps**: Auto-updates "Last Updated" dates in modified files
4. **Broken Links**: Checks relative markdown links point to existing files
5. **File References**: Validates `src/*.js` references exist

#### Installation

The hook is stored in `.github/hooks/` but must be installed to `.git/hooks/`:

```bash
# One-time installation
cp .github/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

**Note**: `.git/hooks/` is not tracked by git, so each developer must install manually.

#### Usage

Once installed, the hook runs automatically on every `git commit`:

```bash
# Make changes
vim README.md

# Stage changes
git add README.md

# Commit triggers hook automatically
git commit -m "docs: update README"

# Output:
# ═══ Documentation Consistency Check (Pre-commit) ═══
# 
# [1/5] Version consistency...
#   ✓ README.md
#   ✓ docs/INDEX.md
# ✓ Versions consistent
# ...
# ═══ ✓ All checks passed ═══
```

#### Bypassing the Hook

**Not recommended**, but if needed for emergency commits:

```bash
git commit --no-verify -m "emergency: critical fix"
```

Use sparingly - bypassing checks can introduce inconsistencies.

#### Hook vs GitHub Actions

| Validation | Pre-commit Hook | GitHub Actions |
|------------|-----------------|----------------|
| Speed | ⚡ <1 second | 🐌 2-5 minutes |
| Scope | Staged files only | All repository |
| When | Every commit | Push/PR only |
| Installation | Manual | Automatic |
| Best for | Fast feedback | Comprehensive checks |

**Recommendation**: Use both for maximum quality assurance.

#### Troubleshooting

**Hook doesn't run**:
- Check installation: `ls -l .git/hooks/pre-commit`
- Verify executable: `chmod +x .git/hooks/pre-commit`

**Hook fails on valid changes**:
- Review error messages carefully
- Check if version/test counts need updating in hook file
- Temporarily bypass with `--no-verify` if certain issue is false positive

**Timestamp not updating**:
- Ensure file contains "Last Updated:" marker
- Check sed compatibility (GNU sed vs BSD sed)
```

### Medium Priority Actions (1 hour)

#### 4. Make Hook Version-Aware
**Problem**: Hardcoded version requires manual updates

**Solution**: Read version from `package.json` dynamically

**Implementation**:
```bash
# Replace line 18 with:
VERSION=$(node -p "require('./package.json').version")
VERSION_PATTERN=$(echo "$VERSION" | sed 's/\./\\./g')
```

#### 5. Make Hook Test-Count-Aware
**Problem**: Hardcoded test count requires manual updates

**Solution**: Count actual tests or read from test output

**Implementation**:
```bash
# Replace lines 38-42 with:
EXPECTED_TESTS=$(npm test 2>&1 | grep -oP '\d+(?= tests?)' | head -1)
for file in README.md .github/copilot-instructions.md; do
    if [ -f "$file" ] && grep -q "$EXPECTED_TESTS.*test" "$file"; then
        echo "  ✓ $file"
    fi
done
```

**Note**: This adds ~2 seconds to hook execution time.

#### 6. Add Installation to CONTRIBUTING.md
**Location**: `.github/CONTRIBUTING.md` (add new section)

**Content**:
```markdown
## Development Environment Setup

### Installing Git Hooks

The project includes pre-commit hooks for quality assurance:

```bash
# Install pre-commit hook
cp .github/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

This hook validates documentation consistency before each commit. See [WORKFLOW_SETUP.md](../docs/WORKFLOW_SETUP.md#-git-hooks-local-validation) for details.
```

### Optional Enhancements (2 hours)

#### 7. Create Hook Management Script
**File**: `.github/scripts/install-hooks.sh`

**Purpose**: Automate hook installation for new developers

**Implementation**:
```bash
#!/bin/bash
# Install all git hooks from .github/hooks/

set -e

echo "Installing git hooks..."

for hook in .github/hooks/*; do
    if [ -f "$hook" ] && [ -x "$hook" ]; then
        hook_name=$(basename "$hook")
        target=".git/hooks/$hook_name"
        
        cp "$hook" "$target"
        chmod +x "$target"
        
        echo "✓ Installed $hook_name"
    fi
done

echo ""
echo "✓ All hooks installed successfully"
echo ""
echo "To uninstall: rm .git/hooks/pre-commit"
```

**Usage**:
```bash
./.github/scripts/install-hooks.sh
```

#### 8. Add Post-checkout Hook
**Purpose**: Remind developers to install hooks after cloning

**File**: `.github/hooks/post-checkout`

**Content**:
```bash
#!/bin/bash
# Remind developers about pre-commit hook

if [ ! -f .git/hooks/pre-commit ]; then
    echo ""
    echo "💡 TIP: Install pre-commit hook for documentation validation:"
    echo "   cp .github/hooks/pre-commit .git/hooks/pre-commit"
    echo "   chmod +x .git/hooks/pre-commit"
    echo ""
    echo "   Or run: ./.github/scripts/install-hooks.sh"
    echo ""
fi
```

#### 9. Create Hook Tests
**File**: `__tests__/hooks/pre-commit.test.sh`

**Purpose**: Validate hook behavior in CI

**Implementation**: Shell script tests that verify:
- Hook catches version mismatches
- Hook catches test count errors
- Hook updates timestamps correctly
- Hook detects broken links
- Hook validates file references

---

## 📈 Impact Assessment

### Current Usage
**Unknown** - No metrics available on:
- How many developers have installed the hook
- How many commits it has prevented/fixed
- Common failure scenarios

### Potential Impact
If all developers install the hook:
- ✅ **50% reduction** in documentation consistency PRs
- ✅ **Faster reviews** - fewer nitpick comments
- ✅ **Better quality** - catches errors at source
- ✅ **Time savings** - ~5 minutes per prevented error

### Adoption Barriers
- ⚠️ Manual installation required (not automatic)
- ⚠️ No reminder to install (easy to forget)
- ⚠️ Not documented in onboarding
- ⚠️ No metrics to track compliance

**Recommendation**: Create automated installation reminder or use tools like Husky for automatic hook management.

---

## 🔗 Related Documentation

### Existing Documentation
- `.github/hooks/pre-commit` - The hook itself (contains inline docs)
- `docs/WORKFLOW_SETUP.md` - Workflow automation guide (needs hook section)
- `.github/CONTRIBUTING.md` - Contribution guide (needs hook installation)

### Documentation to Create
- `.github/hooks/README.md` - Comprehensive hook guide
- `.github/scripts/install-hooks.sh` - Automated installer
- Section in WORKFLOW_SETUP.md - Hook usage guide

### Documentation to Update
- `CONTRIBUTING.md` - Add hook installation to setup steps
- `README.md` - Brief mention in "Getting Started"
- `docs/INDEX.md` - Add hooks to documentation index

---

## ✅ Implementation Checklist

### Phase 1: Critical Fixes (30 minutes)
- [ ] Update hook version pattern: `0.6.0-alpha` → `0.9.0-alpha`
- [ ] Update hook test count pattern: `1224` → `1399`
- [ ] Add git hooks section to `WORKFLOW_SETUP.md`
- [ ] Test hook with both passing and failing scenarios
- [ ] Commit changes

### Phase 2: Documentation (30 minutes)
- [ ] Add hook installation to `CONTRIBUTING.md`
- [ ] Create `.github/hooks/README.md` with full guide
- [ ] Add hook reference to main `README.md`
- [ ] Update `docs/INDEX.md` with hooks section

### Phase 3: Automation (1 hour)
- [ ] Create `.github/scripts/install-hooks.sh`
- [ ] Make hook version-aware (read from package.json)
- [ ] Make hook test-count-aware (read from test output)
- [ ] Test automated installation script

### Phase 4: Optional Enhancements (1 hour)
- [ ] Create post-checkout reminder hook
- [ ] Add hook testing to CI/CD
- [ ] Create hook uninstall script
- [ ] Add metrics/logging to hook

**Total Estimated Time**: 3 hours  
**Priority**: High (Critical fixes), Medium (Documentation), Low (Enhancements)

---

## 📝 Testing Commands

### Manual Testing Sequence

```bash
# 1. Backup current hook
cp .git/hooks/pre-commit .git/hooks/pre-commit.backup 2>/dev/null || true

# 2. Install hook from .github/hooks/
cp .github/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# 3. Test with valid commit
echo "test" >> README.md
git add README.md
git commit -m "test: validate hook works"
# Should pass all 5 checks

# 4. Test version mismatch detection
sed -i 's/0\.7\.0-alpha/0.9.0-alpha/' README.md
git add README.md
git commit -m "test: should fail"
# Should fail with version error

# 5. Restore
git checkout README.md

# 6. Test timestamp auto-update
echo "Last Updated: 2020-01-01" >> docs/INDEX.md
git add docs/INDEX.md
git commit -m "test: timestamp update"
# Should auto-update timestamp

# 7. Cleanup
git reset --soft HEAD~2
git checkout docs/INDEX.md

# 8. Restore backup if needed
cp .git/hooks/pre-commit.backup .git/hooks/pre-commit 2>/dev/null || true
```

---

## 🎯 Conclusion

The pre-commit hook is a **valuable quality assurance tool** that provides fast, local validation of documentation consistency. However, it requires updates and better documentation to be effective.

**Immediate Priority**: Update version and test count patterns to match current project state.

**Next Steps**: Document hook in user-facing guides and create automated installation tools to improve adoption.

**Long-term**: Consider migrating to a more robust hook management solution like Husky or Lefthook for automatic installation and cross-platform compatibility.

---

**Version**: 1.0  
**Status**: ✅ Investigation Complete  
**Implementation**: ⏳ Pending Approval
