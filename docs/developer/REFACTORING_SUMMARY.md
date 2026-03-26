## REFACTORING_SUMMARY

# .github Folder Refactoring Summary

## Overview

This document summarizes the refactoring work done to improve low-coupling principles in the `.github` folder configuration.

## Problem Statement

The `.github` folder had several coupling issues:

1. **Duplicate workflow file** - Same workflow existed in two locations
2. **Hardcoded file paths** - File paths scattered throughout workflows
3. **Repeated validation logic** - Security and syntax checks duplicated
4. **Template duplication** - Issue templates had repeated sections
5. **No centralized configuration** - Common settings defined multiple times

## Solution Implemented

### 1. Removed Duplication

**Removed**:

- `.github/copilot-coding-agent.yml` (duplicate of workflow file)

**Kept**:

- `.github/workflows/copilot-coding-agent.yml` (canonical location)

### 2. Created Centralized Configuration

**New File**: `.github/config.yml`

Contains:

- Common labels for issues
- Default assignees
- Project file paths
- Validation configuration
- Code quality thresholds

Benefits:

- Single source of truth
- Easy to update project-wide settings
- Clear documentation of standards

### 3. Extracted Reusable Actions

Created modular, reusable workflow actions:

#### `.github/actions/validate-js/action.yml`

- Validates JavaScript syntax for specified files
- Parameterized file list
- Reusable across workflows

#### `.github/actions/security-check/action.yml`

- Performs security scanning on JavaScript files
- Checks for credentials, eval(), and HTTPS usage
- Consistent security rules across all workflows

Benefits:

- Logic defined once, used many times
- Easy to enhance without touching main workflows
- Testable independently
- Promotes consistency

### 4. Refactored Main Workflow

**File**: `.github/workflows/copilot-coding-agent.yml`

Changes:

- Uses reusable actions instead of inline scripts
- Updated file paths to use `src/` prefix
- Removed duplicated security logic
- Cleaner, more maintainable structure

### 5. Standardized Issue Templates

**Updated Templates**:

- `copilot_issue.md`
- `feature_request.md`
- `technical_debt.md`

Changes:

- Standardized "Additional Context" sections
- Removed redundant instructions
- Each template remains self-contained
- Added proper "Proposed Solution" heading

**New File**: `.github/ISSUE_TEMPLATE/config.yml`

- Centralizes template configuration
- Provides contact links
- Controls blank issue creation

### 6. Created Documentation

**New Files**:

1. **`.github/LOW_COUPLING_GUIDE.md`**
   - Explains principles applied
   - Best practices for maintenance
   - Usage examples
   - Architecture diagram
   - Guidelines for future changes

2. **`.github/REFACTORING_SUMMARY.md`** (this file)
   - Summary of changes made
   - Before/after comparison
   - Validation results
   - Migration notes

## Before/After Comparison

<!-- markdownlint-disable MD024 -->

```yaml
- name: Validate JavaScript syntax
  run: |
    echo "Validating JavaScript syntax..."
    node -c guia.js
    node -c guia_ibge.js
    echo "✅ JavaScript syntax validation passed"
```

### After: Reusable Action

```yaml
- name: Validate JavaScript syntax
  uses: ./.github/actions/validate-js
  with:
    files: 'src/guia.js src/guia_ibge.js'
```

### Before: Duplicated Security Logic

```yaml
- name: Basic security scan
  run: |
    echo "Performing basic security checks..."
    # ... 25+ lines of bash code ...
```

### After: Reusable Action

```yaml
- name: Basic security scan
  uses: ./.github/actions/security-check
  with:
    files: 'src/*.js'
```

## Files Modified

### Created

- `.github/config.yml`
- `.github/actions/validate-js/action.yml`
- `.github/actions/security-check/action.yml`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/LOW_COUPLING_GUIDE.md`
- `.github/REFACTORING_SUMMARY.md`

### Modified

- `.github/workflows/copilot-coding-agent.yml`
- `.github/ISSUE_TEMPLATE/copilot_issue.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/ISSUE_TEMPLATE/tec

---

## LOW_COUPLING_GUIDE

# Low Coupling Guide for .github Configuration

This document explains the low-coupling principles applied to the `.github` folder configuration and how to maintain them.

## Overview

Low coupling in the `.github` folder means minimizing dependencies between configuration files, workflows, and templates. This makes the repository easier to maintain and allows components to evolve independently.

## Principles Applied

### 1. Centralized Configuration

**File**: `.github/config.yml`

This file centralizes common settings used across workflows and templates:

- Common labels
- Default assignees
- Project file paths
- Validation configuration
- Code quality thresholds

**Benefits**:

- Single source of truth for configuration
- Changes to labels or paths only need to be updated in one place
- Easy to understand project standards at a glance

**Usage Example**:
When you need to add a new label, update it once in `config.yml` rather than in each template.

### 2. Reusable Workflow Actions

**Location**: `.github/actions/`

We've created modular, reusable actions:

#### validate-js

Validates JavaScript syntax for specified files.

```yaml
- name: Validate JavaScript
  uses: ./.github/actions/validate-js
  with:
    files: 'src/guia.js src/guia_ibge.js'
```

**Benefits**:

- Validation logic defined once
- Reusable across multiple workflows
- Easy to update validation behavior centrally
- Can be tested independently

#### security-check

Performs security scanning on JavaScript files.

```yaml
- name: Security Check
  uses: ./.github/actions/security-check
  with:
    files: 'src/*.js'
```

**Benefits**:

- Security rules defined in one place
- Consistent security checks across all workflows
- Easy to add new security rules
- Can be enhanced without touching main workflows

### 3. Modular Issue Templates

**Location**: `.github/ISSUE_TEMPLATE/`

Issue templates are now:

- **Self-contained**: Each template has its own purpose
- **Consistent**: Common sections use similar wording but are not duplicated
- **Configurable**: Template configuration is in `config.yml`

**Templates**:

1. `copilot_issue.md` - For Copilot-related issues
2. `feature_request.md` - For new feature proposals
3. `technical_debt.md` - For technical debt tracking
4. `config.yml` - Template configuration and contact links

**Benefits**:

- Each template can be modified independently
- No repeated logic between templates
- Contact links centralized in config.yml

### 4. Removed Duplication

**Changes Made**:

- ❌ Removed duplicate `.github/copilot-coding-agent.yml` (kept only in `workflows/`)
- ✅ Extracted validation logic to reusable actions
- ✅ Standardized "Additional Context" sections in templates
- ✅ Centralized file paths to avoid hardcoding

## Best Practices

### When Adding a New Workflow

1. Check if existing actions can be reused
2. Extract common logic into new reusable actions
3. Reference centralized configuration where possible
4. Keep workflow jobs focused and independent

Example:

```yaml
jobs:
  validate:
    steps:
      - uses: ./.github/actions/validate-js
      - uses: ./.github/actions/security-check
```

### When Adding a New Issue Template

1. Add template configuration to `ISSUE_TEMPLATE/config.yml` if needed
2. Use consistent section naming with existing templates
3. Keep descriptions concise and template-specific
4. Avoid duplicating instructions - reference documentation instead

### When Updating Configuration

1. Update `config.yml` for shared settings
2. Reusable actions for workflow logic
3. Update individual templates only for template-specific content

## Maintenance Guidelines

### Regular Reviews

Periodically review for:

- [ ] Duplicated logic across workflows
- [ ] Hardcoded values that could be centralized
- [ ] Actions that could be generalized and reused
- [ ] Templates with overlapping content

### Testing Changes

When modifying:

- **Workflows**: Test on a feature branch first
- **Actions**: Validate inputs/outputs mat
