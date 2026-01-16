# Git Best Practices Guide - Guia Turístico Project

> **📋 Document Scope: Guia Turístico Specific**  
> This is the **Guia Turístico-specific version** with customizations for this web application project.  
> **Canonical Reference**: See [/docs/GIT_BEST_PRACTICES_GUIDE.md](../../../../../../docs/GIT_BEST_PRACTICES_GUIDE.md) in the main repository for universal best practices.  
> **Main Repository**: [mpbarbosa_site](https://github.com/mpbarbosa/mpbarbosa_site)

## Overview

This guide establishes Git best practices specifically for the Guia Turístico project, with emphasis on proper file operations, version control hygiene, and submodule management.

## Critical Rule: Always Use Git Commands for File Operations

### ❌ NEVER USE: System commands for tracked files
```bash
mv file.md new-location/     # Breaks git history
rm old-file.md              # Loses history tracking
cp file.md backup.md        # Creates untracked duplicates
```

### ✅ ALWAYS USE: Git commands for file operations
```bash
git mv file.md new-location/        # Preserves history
git rm old-file.md                  # Proper deletion tracking
git mv file.md backup.md            # Tracked copying through move
```

## File Reorganization Workflow

### 1. Planning Phase
```bash
# Check current status
git status
git log --oneline -5

# Plan your reorganization
# Document which files go where and why
```

### 2. Execution Phase
```bash
# Move files with git mv (REQUIRED)
git mv docs/javascript-guide.md .github/JAVASCRIPT_GUIDE.md
git mv docs/testing-guide.md .github/TESTING_GUIDE.md

# Update references in affected files
# Edit INDEX.md, README.md, etc. to reflect new paths

# Stage reference updates
git add docs/INDEX.md
```

### 3. Commit Phase
```bash
# Commit with descriptive message
git commit -m "docs: Reorganize documentation structure

- Move JavaScript guidelines from docs/ to .github/
- Move testing documentation to contributor guidelines
- Update INDEX.md with new file locations
- Improve separation between project docs and dev guidelines"
```

### 4. Push Phase
```bash
# Push to remote
git push origin main
```

## Submodule Update Cascade

When reorganizing files in guia_js, update parent repositories:

```bash
# 1. In guia_js (this repository)
git mv docs/file.md .github/file.md
git commit -m "docs: Move file to .github/"
git push origin main

# 2. In guia_turistico parent
cd ../../../..  # Navigate to guia_turistico root
git add src/libs/guia_js
git commit -m "Update guia_js submodule with documentation reorganization"
git push origin main

# 3. In main mpbarbosa_site repository
cd ../../../..  # Navigate to main repo root
git add src/submodules/guia_turistico
git commit -m "Update guia_turistico submodule with latest changes"
git push origin main
```

## Benefits of Using `git mv`

1. **History Preservation**: `git log --follow` works correctly
2. **Clear Diffs**: Shows as rename, not delete + add
3. **Better Merging**: Git can handle conflicts better
4. **Automatic Staging**: Move is automatically staged
5. **Professional Standards**: Industry best practice

## File Organization Standards for Guia.js

### docs/ Directory (Project Documentation)
- Architecture documentation
- API integration guides
- Technical specifications
- User-facing documentation

### .github/ Directory (Contributor Guidelines)
- Coding standards and best practices
- Testing methodology guides
- Contribution workflows
- GitHub-specific configuration

### Example Reorganization
```bash
# Moving coding standards from docs/ to .github/
git mv docs/JAVASCRIPT_BEST_PRACTICES.md .github/
git mv docs/ES6_GUIDE.md .github/
git mv docs/TESTING_GUIDE.md .github/

# Update documentation index
sed -i 's|docs/JAVASCRIPT_BEST_PRACTICES.md|.github/JAVASCRIPT_BEST_PRACTICES.md|g' docs/INDEX.md

# Commit the reorganization
git add docs/INDEX.md
git commit -m "docs: Move coding standards to .github/

- Move JavaScript best practices to contributor guidelines
- Move ES6 guide to .github/ for better developer access
- Move testing guide to contributor documentation
- Update INDEX.md references to new locations
- Improve separation of concerns in documentation"
```

## Quality Checklist

Before committing file reorganizations:

- [ ] Used `git mv` for all file moves
- [ ] Used `git rm` for all file deletions
- [ ] Updated all cross-references in documentation
- [ ] Verified links still work
- [ ] Tested file history with `git log --follow filename`
- [ ] Written descriptive commit message explaining rationale
- [ ] Planned submodule parent repository updates

## Integration with Existing Workflows

### GitHub Actions Compatibility
- Our automated workflows detect file changes correctly when using `git mv`
- Documentation updates trigger appropriate test suites
- Link validation works with proper git tracking

### Code Review Process
- File moves using `git mv` show clearly in pull requests
- History is preserved for reviewers
- Rationale for reorganization is clear in commit messages

## Emergency Recovery

If you accidentally used `mv` instead of `git mv`:

```bash
# If not yet committed:
git reset HEAD  # Unstage changes
git checkout -- .  # Restore original files
# Then redo with git mv

# If already committed:
# History is broken, but document this in next commit
git commit --amend -m "docs: Move files (history may be fragmented)

Note: Used system mv instead of git mv, file history may be incomplete"
```

## Conclusion

**Always use `git mv` and `git rm` for file operations in version-controlled projects.**

This ensures:
- Clean git history
- Professional development standards
- Easier collaboration and code review
- Better tooling support
- Preserved file lineage

---

**Project**: Guia.js  
**Last Updated**: October 20, 2025  
**Author**: MP Barbosa