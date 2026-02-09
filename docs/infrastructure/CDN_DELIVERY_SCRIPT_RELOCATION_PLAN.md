# CDN Delivery Script Relocation Plan

**Issue**: `.github/scripts/cdn-delivery.sh` located in project root instead of scripts directory  
**Priority**: LOW (organizational improvement, no functionality impact)  
**Date**: 2026-01-01  
**Status**: Proposed

---

## 📋 Executive Summary

The `.github/scripts/cdn-delivery.sh` script (348 lines, 15KB) is currently in the project root directory. For better organization and consistency with other scripts, it should be moved to `.github/scripts/` alongside other build/deployment scripts.

---

## 🎯 Current Situation

### File Location
```
guia_js/                               ❌ ROOT DIRECTORY
├── .github/scripts/cdn-delivery.sh                    (348 lines, 15KB, executable)
├── package.json
├── README.md
└── ... (other root files)
```

### Script Details
- **Size**: 15KB (348 lines)
- **Purpose**: Generates jsDelivr CDN URLs from GitHub repository
- **Type**: Build/deployment utility script
- **Permissions**: Executable (`-rwxrwxr-x`)
- **Language**: Bash shell script
- **Dependencies**: Node.js v18+, Git
- **Output**: `cdn-urls.txt` file

### Current Usage Pattern
```bash
# From project root
./.github/scripts/cdn-delivery.sh

# With environment variables
GITHUB_USER="username" ./.github/scripts/cdn-delivery.sh

# Custom output
OUTPUT_FILE="my-urls.txt" ./.github/scripts/cdn-delivery.sh
```

---

## 🔍 Comparison with Other Scripts

### Scripts in `.github/scripts/` (Organized)

| Script | Size | Lines | Purpose |
|--------|------|-------|---------|
| check-version-consistency.sh | 9.5KB | ~250 | Version validation |
| test-workflow-locally.sh | 6.3KB | ~180 | Pre-push validation |
| update-badges.sh | 4.9KB | ~140 | Badge synchronization |

**Total**: 3 scripts, organized location ✅

### Scripts in Root Directory (Disorganized)

| Script | Size | Lines | Purpose |
|--------|------|-------|---------|
| .github/scripts/cdn-delivery.sh | 15KB | 348 | CDN URL generation |

**Total**: 1 script, clutters root ❌

---

## ⚠️ Problems with Current Location

### 1. **Inconsistent Organization**
- Other build/deployment scripts are in `.github/scripts/`
- CDN delivery is also a build/deployment task
- No logical reason for different locations
- Violates "scripts go in scripts directory" convention

### 2. **Root Directory Clutter**
- Root directory should contain:
  - Configuration files (package.json, .gitignore)
  - Documentation (README.md)
  - Core directories (src/, docs/, tests/)
- Scripts should be in dedicated directory

### 3. **Discoverability Issues**
- New contributors may not find script in root
- Unclear that it's part of build/release process
- Not grouped with related automation scripts

### 4. **CI/CD Integration Confusion**
- Other CI/CD scripts are in `.github/scripts/`
- CDN delivery will be integrated into release workflow
- Should be co-located with related automation

### 5. **Path Dependency**
Script requires being run from project root:
```bash
# Line 67-72 in .github/scripts/cdn-delivery.sh
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "This script must be run from the project root directory"
    exit 1
fi
```

This requirement works from **any location** if we keep the script callable from root.

---

## 🎯 Recommended Solution

### Option 1: Move to `.github/scripts/` (RECOMMENDED)

**Target Location**:
```
.github/scripts/
├── .github/scripts/cdn-delivery.sh                    ✅ Moved here
├── check-version-consistency.sh
├── test-workflow-locally.sh
└── update-badges.sh
```

**Benefits**:
- ✅ Consistent with other scripts
- ✅ Clean root directory
- ✅ Clear purpose (GitHub-related automation)
- ✅ Easy to find alongside other CI/CD scripts
- ✅ Better organization

**Usage Pattern After Move**:
```bash
# From project root
./.github/script./.github/scripts/cdn-delivery.sh

# With environment variables
GITHUB_USER="username" ./.github/script./.github/scripts/cdn-delivery.sh

# From any directory (absolute path)
/path/to/guia_js/.github/script./.github/scripts/cdn-delivery.sh
```

**Script Works From Any Location** because:
- Script validates `package.json` presence (line 67)
- If not found, shows helpful error message
- User just needs to `cd` to project root first

---

### Option 2: Create Root `scripts/` Directory (ALTERNATIVE)

**Target Location**:
```
scripts/
└── .github/scripts/cdn-delivery.sh                    ✅ Moved here
```

**Benefits**:
- ✅ Shorter path (`./script./.github/scripts/cdn-delivery.sh`)
- ✅ Separate from GitHub-specific files
- ✅ Common pattern in open-source projects

**Drawbacks**:
- ⚠️ Creates new top-level directory
- ⚠️ Only one script would live there
- ⚠️ Less organized (no grouping with CI/CD scripts)

**Not Recommended**: Only 1 script doesn't justify new directory

---

### Option 3: Keep in Root (NOT RECOMMENDED)

**Rationale**:
- Maintains current usage pattern
- No path changes needed

**Why Not Recommended**:
- Violates organization principles
- Inconsistent with other scripts
- Contributes to root clutter
- No logical reason to keep separate

---

## 📝 Detailed Migration Plan

### Phase 1: Move Script with Git

```bash
# Preserve git history with git mv
git mv .github/scripts/cdn-delivery.sh .github/script./.github/scripts/cdn-delivery.sh

# Verify move
ls -la .github/script./.github/scripts/cdn-delivery.sh

# Check permissions preserved
test -x .github/script./.github/scripts/cdn-delivery.sh && echo "Executable: Yes"
```

**Result**: Script moved, history preserved, permissions maintained

---

### Phase 2: Test Script Functionality

```bash
# Change to project root (script requires this)
cd /path/to/guia_js

# Test script from new location
./.github/script./.github/scripts/cdn-delivery.sh

# Verify output file created
test -f cdn-urls.txt && echo "✅ Output file created"

# Verify URLs generated
grep "cdn.jsdelivr.net" cdn-urls.txt && echo "✅ URLs generated"

# Clean up test output
rm cdn-urls.txt
```

**Expected**: Script runs successfully from new location

---

### Phase 3: Update Documentation

#### Files to Update

**1. README.md**:
```bash
# Find references
grep -n "cdn-delivery.sh" README.md

# Update references
sed -i 's|./.github/scripts/cdn-delivery.sh|./.github/script./.github/scripts/cdn-delivery.sh|g' README.md
```

**2. .github/copilot-instructions.md**:
```bash
# Find references
grep -n "cdn-delivery.sh" .github/copilot-instructions.md

# Update references
sed -i 's|./.github/scripts/cdn-delivery.sh|./.github/script./.github/scripts/cdn-delivery.sh|g' .github/copilot-instructions.md
```

**3. DEVOPS_INTEGRATION_ASSESSMENT.md**:
```bash
# Update script path references
sed -i 's|./.github/scripts/cdn-delivery.sh|./.github/script./.github/scripts/cdn-delivery.sh|g' DEVOPS_INTEGRATION_ASSESSMENT.md

# Update location description
sed -i 's|cdn-delivery.sh (Root Directory)|cdn-delivery.sh (.github/scripts/)|g' DEVOPS_INTEGRATION_ASSESSMENT.md
```

**4. PREREQUISITES_DOCUMENTATION_UPDATE.md**:
```bash
sed -i 's|./.github/scripts/cdn-delivery.sh|./.github/script./.github/scripts/cdn-delivery.sh|g' PREREQUISITES_DOCUMENTATION_UPDATE.md
```

**5. ERROR_HANDLING_COMPLETE.md**:
```bash
sed -i 's|./.github/scripts/cdn-delivery.sh|./.github/script./.github/scripts/cdn-delivery.sh|g' ERROR_HANDLING_COMPLETE.md
```

**6. Proposed release.yml workflow** (DEVOPS_INTEGRATION_ASSESSMENT.md):
```yaml
# Update in proposed workflow YAML
- name: Run CDN delivery script
  run: |
    chmod +x ./.github/script./.github/scripts/cdn-delivery.sh
    ./.github/script./.github/scripts/cdn-delivery.sh
```

---

### Phase 4: Update Script Internal Documentation

The script itself may reference its location. Check and update:

```bash
# Check for self-references
grep -n "cdn-delivery.sh" .github/script./.github/scripts/cdn-delivery.sh

# If found in usage examples, update:
sed -i 's|./.github/scripts/cdn-delivery.sh|./.github/script./.github/scripts/cdn-delivery.sh|g' .github/script./.github/scripts/cdn-delivery.sh
```

**Lines to update** (if referencing old path):
- Line 18: Usage example
- Line 28: Usage example
- Line 72: Error message with path

**Updated Usage Block**:
```bash
# Usage:
#   ./.github/script./.github/scripts/cdn-delivery.sh
#
#   Environment Variables (optional):
#     GITHUB_USER    - GitHub username (default: mpbarbosa)
#     GITHUB_REPO    - Repository name (default: guia_js)
#     MAIN_FILE      - Main file path (default: src/guia.js)
#     OUTPUT_FILE    - Output filename (default: cdn-urls.txt)
#
#   Examples:
#     # Use defaults
#     ./.github/script./.github/scripts/cdn-delivery.sh
#
#     # Override for fork
#     GITHUB_USER="yourname" GITHUB_REPO="yourrepo" ./.github/script./.github/scripts/cdn-delivery.sh
```

---

### Phase 5: Create Convenience Wrapper (Optional)

If shorter path is desired, create a root wrapper script:

**Create `cdn-delivery` (no .sh)**:
```bash
#!/bin/bash
# Convenience wrapper for .github/scripts/cdn-delivery.sh
# Usage: ./cdn-delivery [args...]

# Forward all arguments to actual script
exec "$(dirname "$0")/.github/script./.github/scripts/cdn-delivery.sh" "$@"
```

**Make executable**:
```bash
chmod +x cdn-delivery
git add cdn-delivery
```

**Usage**:
```bash
# Short form
./cdn-delivery

# Long form (direct)
./.github/script./.github/scripts/cdn-delivery.sh
```

**Benefits**:
- Backward compatibility with `./cdn-delivery`
- Cleaner usage in documentation
- Script remains organized in `.github/scripts/`

**Drawback**:
- Adds another file to root (defeats purpose)
- **Not recommended** unless strong user preference

---

### Phase 6: Update .gitignore (If Needed)

Check if `.github/scripts/cdn-delivery.sh` or its output is gitignored:

```bash
grep -n "cdn-delivery\|cdn-urls" .gitignore
```

If patterns exist, verify they still work after move.

**Note**: Output file `cdn-urls.txt` is in root (unchanged), so no .gitignore updates needed.

---

### Phase 7: Validation

```bash
# 1. Verify script exists in new location
test -f .github/script./.github/scripts/cdn-delivery.sh && echo "✅ Script exists"

# 2. Verify executable permission
test -x .github/script./.github/scripts/cdn-delivery.sh && echo "✅ Executable"

# 3. Test script execution
./.github/script./.github/scripts/cdn-delivery.sh

# 4. Verify output created
test -f cdn-urls.txt && echo "✅ Output file created"
cat cdn-urls.txt | head -5

# 5. Verify URLs format
grep -q "cdn.jsdelivr.net" cdn-urls.txt && echo "✅ URLs valid"

# 6. Clean up test output
rm cdn-urls.txt

# 7. Check git history preserved
git log --follow .github/script./.github/scripts/cdn-delivery.sh | head -20

# 8. Verify documentation updates
grep "cdn-delivery.sh" README.md
grep "cdn-delivery.sh" .github/copilot-instructions.md
grep "cdn-delivery.sh" DEVOPS_INTEGRATION_ASSESSMENT.md

# 9. Run linter
npm run lint

# 10. Run tests
npm test
```

---

### Phase 8: Commit Changes

```bash
# Stage all changes
git add .github/script./.github/scripts/cdn-delivery.sh
git add README.md
git add .github/copilot-instructions.md
git add DEVOPS_INTEGRATION_ASSESSMENT.md
git add PREREQUISITES_DOCUMENTATION_UPDATE.md
git add ERROR_HANDLING_COMPLETE.md

# Verify no old file reference remains
git status | grep "cdn-delivery.sh"

# Commit with descriptive message
git commit -m "refactor: move .github/scripts/cdn-delivery.sh to .github/scripts/

- Move .github/scripts/cdn-delivery.sh from root to .github/scripts/
- Co-locate with other build/deployment scripts
- Update all documentation references
- Update internal script usage examples
- Preserve git history with git mv
- Maintain executable permissions

Benefits:
- Cleaner root directory structure
- Consistent script organization
- Easier to find alongside CI/CD scripts
- Better alignment with open-source conventions

Usage:
- Old: ./.github/scripts/cdn-delivery.sh
- New: ./.github/script./.github/scripts/cdn-delivery.sh

Breaking: Path changed (documentation updated)
Impact: Low - Script rarely executed manually
Tests: All tests passing, script validated"

# Verify commit
git show --stat
```

---

## 📊 Before and After Comparison

### Before (Current State)
```
guia_js/                               ❌ CLUTTERED ROOT
├── .github/scripts/cdn-delivery.sh                    ❌ Inconsistent location
├── cdn-urls.txt                       (output file, OK in root)
├── package.json
├── README.md
├── src/
├── tests/
├── __tests__/
├── docs/
└── .github/
    └── scripts/
        ├── check-version-consistency.sh    ✅ Organized
        ├── test-workflow-locally.sh        ✅ Organized
        └── update-badges.sh                ✅ Organized

Issues:
- 1 script in root (inconsistent)
- 3 scripts in .github/scripts/ (organized)
- No clear pattern
```

### After (Proposed State)
```
guia_js/                               ✅ CLEAN ROOT
├── cdn-urls.txt                       (output file, OK in root)
├── package.json
├── README.md
├── src/
├── tests/
├── __tests__/
├── docs/
└── .github/
    └── scripts/
        ├── .github/scripts/cdn-delivery.sh                 ✅ Organized
        ├── check-version-consistency.sh    ✅ Organized
        ├── test-workflow-locally.sh        ✅ Organized
        └── update-badges.sh                ✅ Organized

Benefits:
- All 4 scripts in .github/scripts/ (consistent)
- Clean root directory
- Clear organization
- Easy discoverability
```

---

## 🔍 Script Analysis

### Prerequisites (Lines 50-96)
```bash
# Script validates:
1. Node.js v18+ available
2. package.json exists (project root check)
3. Git available
4. Git repository detected

# All checks work regardless of script location
# Only requirement: User must be in project root when executing
```

### Configuration (Lines 100-150)
```bash
# Environment variables:
GITHUB_USER=${GITHUB_USER:-mpbarbosa}
GITHUB_REPO=${GITHUB_REPO:-guia_js}
MAIN_FILE=${MAIN_FILE:-src/guia.js}
OUTPUT_FILE=${OUTPUT_FILE:-cdn-urls.txt}

# All relative to project root
# No hard-coded paths to script location
```

### Output (Lines 200-348)
```bash
# Generates cdn-urls.txt in current directory
# If run from project root, output is in project root
# Script location doesn't affect output location
```

**Conclusion**: Script location change is **safe** - no internal dependencies on its path.

---

## ⚠️ Risks and Mitigation

### Risk 1: Path References in External Tools
**Risk**: External scripts/tools may reference `./.github/scripts/cdn-delivery.sh`  
**Likelihood**: Low (script is new, not widely integrated)  
**Mitigation**:
- Search entire project for references
- Update all found references
- Document new path in migration notes

### Risk 2: User Muscle Memory
**Risk**: Users accustomed to `./.github/scripts/cdn-delivery.sh`  
**Likelihood**: Low (script rarely executed manually)  
**Mitigation**:
- Update all documentation
- Clear commit message explaining change
- Optional: Create convenience wrapper (Phase 5)

### Risk 3: CI/CD Integration
**Risk**: Future release workflow may reference old path  
**Likelihood**: High (planned integration)  
**Mitigation**:
- Update proposed workflow YAML in DEVOPS_INTEGRATION_ASSESSMENT.md
- Ensure new path is used when implementing release workflow

### Risk 4: Git History Loss
**Risk**: Moving file could lose history  
**Likelihood**: Zero (using `git mv`)  
**Mitigation**:
- Always use `git mv` (preserves history)
- Verify with `git log --follow`

### Risk 5: Permission Loss
**Risk**: File may lose executable permission  
**Likelihood**: Zero (`git mv` preserves permissions)  
**Mitigation**:
- Verify with `test -x` after move
- Re-add if needed: `chmod +x .github/script./.github/scripts/cdn-delivery.sh`

---

## 📚 Related Files and Patterns

### Similar Open Source Projects

**React**:
```
react/
└── scripts/
    ├── build.sh
    ├── release.sh
    └── deploy.sh
```

**Vue.js**:
```
vue/
└── scripts/
    ├── build.js
    ├── release.js
    └── publish.js
```

**Node.js**:
```
node/
└── tools/
    ├── doc/
    ├── test/
    └── release.sh
```

**Express.js**:
```
express/
└── scripts/
    └── release.sh
```

**Common Pattern**: Build/deployment scripts in `scripts/` or `.github/scripts/`

---

## ✅ Success Criteria

Move is successful when:

- [x] Script exists at `.github/script./.github/scripts/cdn-delivery.sh`
- [x] Script is executable (`chmod +x`)
- [x] Script runs successfully from project root
- [x] Generates `cdn-urls.txt` with valid URLs
- [x] Git history preserved (`git log --follow`)
- [x] All documentation updated (README, copilot-instructions, etc.)
- [x] Script internal examples updated
- [x] No references to old path remain
- [x] npm test passes
- [x] npm run lint passes
- [x] CI/CD workflows unaffected (no current usage)

---

## 🚀 Implementation Timeline

**Estimated Time**: 15-30 minutes

| Phase | Task | Duration | Risk |
|-------|------|----------|------|
| 1 | Move script with git mv | 2 min | Low |
| 2 | Test functionality | 5 min | Low |
| 3 | Update documentation | 5 min | Low |
| 4 | Update script internals | 3 min | Low |
| 5 | Create wrapper (optional) | 3 min | Low |
| 6 | Update .gitignore (if needed) | 2 min | Low |
| 7 | Validation | 5 min | Low |
| 8 | Commit changes | 2 min | Low |
| **Total** | | **15-30 min** | **Low** |

---

## 🔄 Rollback Plan

If issues arise:

```bash
# Restore to original location
git mv .github/script./.github/scripts/cdn-delivery.sh .github/scripts/cdn-delivery.sh

# Revert documentation
git checkout README.md
git checkout .github/copilot-instructions.md
git checkout DEVOPS_INTEGRATION_ASSESSMENT.md

# Verify working
./.github/scripts/cdn-delivery.sh

# Run tests
npm test
```

---

## 📖 Documentation Updates Summary

### Files Requiring Updates

| File | Lines to Update | Type |
|------|----------------|------|
| README.md | ~3-5 references | Usage examples |
| .github/copilot-instructions.md | ~8-10 references | Documentation |
| DEVOPS_INTEGRATION_ASSESSMENT.md | ~12-15 references | Technical docs |
| PREREQUISITES_DOCUMENTATION_UPDATE.md | ~6 references | Setup guide |
| ERROR_HANDLING_COMPLETE.md | ~5 references | Error docs |
| .github/scripts/cdn-delivery.sh (internal) | ~3 references | Usage examples |

**Total**: ~37-43 references to update

**Automated Updates**:
```bash
# One-line update for all files
find . -type f \( -name "*.md" -o -name "*.sh" \) -not -path "./node_modules/*" \
  -exec sed -i 's|\./cdn-delivery\.sh|./.github/script./.github/scripts/cdn-delivery.sh|g' {} \;
```

---

## ✅ Recommended Action

**Proceed with Option 1: Move to `.github/scripts/`**

**Rationale**:
1. ✅ Consistent with existing scripts
2. ✅ Clean root directory
3. ✅ Low risk (15-30 minute task)
4. ✅ Easy rollback if needed
5. ✅ Follows open-source conventions
6. ✅ Better organization for future CI/CD integration

**Next Steps**:
1. Create feature branch: `git checkout -b refactor/move-cdn-delivery-script`
2. Follow phases 1-8 above
3. Run full validation
4. Create pull request
5. Merge after validation

---

**Document Version**: 1.0  
**Priority**: LOW  
**Impact**: High (organization) / None (functionality)  
**Estimated Effort**: 15-30 minutes  
**Risk Level**: Low  
**Breaking Change**: Path change (fully documented)
