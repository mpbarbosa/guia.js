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
- **Actions**: Validate inputs/outputs match usage
- **Templates**: Create test issues to verify rendering
- **Config**: Check all references still work

### Documentation

When making changes:
- Update this guide if coupling principles change
- Document new reusable actions in this file
- Note breaking changes in commit messages
- Update workflow comments for clarity

## Architecture Diagram

```
.github/
├── config.yml                          # Centralized configuration
├── LOW_COUPLING_GUIDE.md              # This file
├── copilot-instructions.md            # Copilot-specific instructions
├── CONTRIBUTING.md                     # Contribution guidelines
├── actions/                            # Reusable workflow actions
│   ├── validate-js/                   # JavaScript validation
│   │   └── action.yml
│   └── security-check/                # Security scanning
│       └── action.yml
├── ISSUE_TEMPLATE/                     # Issue templates
│   ├── config.yml                     # Template configuration
│   ├── copilot_issue.md              # Copilot issues
│   ├── feature_request.md            # Feature requests
│   └── technical_debt.md             # Technical debt
└── workflows/                          # GitHub Actions workflows
    └── copilot-coding-agent.yml      # Main CI workflow
```

## Examples

### Good: Using Reusable Action

```yaml
# Main workflow is clean and declarative
- name: Validate code
  uses: ./.github/actions/validate-js
  with:
    files: 'src/*.js'
```

### Bad: Inline Logic

```yaml
# Workflow contains implementation details
- name: Validate code
  run: |
    for file in src/*.js; do
      node -c "$file"
    done
```

### Good: Centralized Configuration

```yaml
# Reference centralized config
node-version: ${{ vars.NODE_VERSION }}
```

### Bad: Hardcoded Values

```yaml
# Hardcoded version appears in multiple places
node-version: '18'
```

## Related Documentation

### Project Guidelines
- [HIGH_COHESION_GUIDE.md](./HIGH_COHESION_GUIDE.md) - Complementary principle for cohesive components
- [REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md) - Pure functions reduce coupling
- [CODE_REVIEW_GUIDE.md](./CODE_REVIEW_GUIDE.md) - Review checklist including coupling concerns
- [TDD_GUIDE.md](./TDD_GUIDE.md) - Testing approach for loosely coupled code
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Major refactoring examples

### Architecture Examples
- [CLASS_DIAGRAM.md](../docs/architecture/CLASS_DIAGRAM.md) - Overall architecture showing low coupling
- [WEBGEOCODINGMANAGER_REFACTORING.md](../docs/architecture/WEBGEOCODINGMANAGER_REFACTORING.md) - Reducing coupling example
- [WEB_GEOCODING_MANAGER.md](../docs/architecture/WEB_GEOCODING_MANAGER.md) - Dependency injection pattern

### External References
- [GitHub Actions: Reusing workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
- [Creating composite actions](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)
- [Issue templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository)

## Version History

- **v1.0** (Current): Initial low-coupling refactoring
  - Created centralized config.yml
  - Extracted reusable actions
  - Removed duplicate workflow file
  - Standardized issue templates

## Questions?

If you have questions about these patterns or need help applying them, please open an issue for discussion.
