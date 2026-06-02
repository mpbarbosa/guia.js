# Documentation Directory Organization

**Purpose**: Central documentation hub for all project documentation
**Location**: `docs/`

## Directory Structure & Purpose

### Core Documentation Directories

#### `docs/architecture/`

**Purpose**: Architectural decisions, patterns, and system design documentation

**Key Files**:

- `VIEWS_LAYER.md` - SPA view controllers documentation
- `LAYERED_ARCHITECTURE.md` - Layer separation and responsibilities
- Design patterns and architectural evolution

#### `docs/api-integration/`

**Purpose**: External API integration guides and specifications

**Key Files**:

- `NOMINATIM_API_FORMAT.md` - OpenStreetMap Nominatim API documentation
- API endpoint specifications
- Integration patterns and examples

#### `docs/issue-189/`

**Purpose**: Documentation related to Issue #189 resolution

**Key Files**:

- Issue-specific implementation details
- Follow-up tasks and validation

#### `docs/prompts/`

**Purpose**: AI-assisted development workflow prompts and guides

**Key Files**:

- Workflow automation prompts
- Development task templates
- AI collaboration patterns

#### `docs/guides/`

**Purpose**: Developer guides and how-to documentation

**Expected Content**:

- Setup guides
- Development workflows
- Contribution guidelines

#### UI and interaction documentation

**Purpose**: UI and interaction guidance is maintained alongside the feature,
architecture, and testing docs it supports rather than in a separate
top-level UX section.

**Primary Locations**:

- `docs/architecture/` - View structure and rendering flow
- `docs/user/features/` - User-facing behavior and UI features
- `docs/testing/` - UI-related test coverage and validation guidance

#### `docs/infrastructure/`

**Purpose**: Infrastructure and tooling documentation

**Expected Content**:

- CI/CD pipeline configuration
- Deployment procedures
- Tool setup and configuration

#### `docs/reference/`

**Purpose**: Reference documentation and API specs

**Expected Content**:

- API reference
- Class method documentation
- Configuration reference

#### Workflow & Automation References

**Purpose**: Current CI/CD and automation documentation is maintained
across repository-level guides instead of a dedicated
`docs/workflow-automation/` directory

**Primary Locations**:

- `WORKFLOW_SETUP.md` - Local workflow setup and CI/CD overview
- `docs/github/GITHUB_ACTIONS_GUIDE.md` - GitHub Actions reference
- `.github/workflows/README.md` - Workflow catalog
- `.github/scripts/README.md` - Automation script inventory

#### `docs/misc/`

**Purpose**: Historical project records archive from major documentation initiatives (2026-01-01+)
**Status**: Archived documentation (reference only)
**Category**: Implementation summaries, analysis reports, and completed work records

**Acceptance Criteria** (prevents dumping ground):

- ✅ Historical records of **completed** work only
- ✅ Must have clear date in filename (e.g., `*_2026-01-09.md`)
- ✅ Must be referenced from active documentation
- ✅ Documents older than current release cycle
- ❌ NOT for active guides or current documentation
- ❌ NOT for experimental/draft work
- ❌ NOT for temporary notes (delete instead)

**Expected Content**:

- Analysis reports from past improvement initiatives
- Implementation summaries of completed projects
- Planning documents for historical reference
- Audit trail documentation

**See Also**: [docs/misc/README.md](../misc/README.md) for detailed archive index

## Root-Level Documentation Files

### Technical Documentation

- `PROJECT_STRUCTURE.md` - Overall project organization
- `PROJECT_PURPOSE_AND_ARCHITECTURE.md` - High-level purpose and design
- `MODULES.md` - Module system documentation
- `NAMING_CONVENTIONS.md` - Code naming standards
- `TESTING.md` - Testing overview
- `ERROR_HANDLING.md` - Error handling patterns
- `LOGGING_GUIDE.md` - Logging best practices

### Integration Documentation

- `IBIRA_INTEGRATION.md` - ibira.js integration (IBGE data)
- `SIDRA_INTEGRATION.md` - SIDRA API integration (population data)

### Process Documentation

- `CODE_QUALITY_ACTION_PLAN.md` - Code quality improvement roadmap
- `DEPENDENCY_MANAGEMENT.md` - Dependency update strategy
- `WORKFLOW_SETUP.md` - GitHub Actions setup
- `AUTOMATION_IMPLEMENTATION_SUMMARY.md` - Automation overview

### Historical Documentation

- `CHANGELOG_v0.28.10.md` - Version 0.9.0 changes
- `DOCUMENTATION_FIXES_2026-01-09.md` - Documentation update history
- `PHASE*_*.md` - Implementation phase documentation

## Navigation

### Finding Documentation

**By Topic**:

- Architecture → `docs/architecture/`
- APIs → `docs/api-integration/`
- Testing → `TESTING.md` (root) + `tests/README.md`
- History → `docs/reports/implementation/`, `docs/misc/`

**By Type**:

- Reference → Root level + `docs/reference/`
- Guides → `docs/guides/`
- Reports → `docs/misc/`

**By Status**:

- Current → Root level + core directories
- Historical → `docs/misc/`
- Experimental → `docs/misc/`

## Documentation Index

For a complete, searchable index of all documentation:

- **See**: `docs/INDEX.md` - Comprehensive documentation catalog

## Contribution Guidelines

When adding new documentation:

1. **Choose Correct Directory**: Use the purpose statements above
2. **Follow Naming Conventions**: Use SCREAMING_SNAKE_CASE.md for documentation
3. **Update INDEX.md**: Add new files to the documentation index
4. **Cross-Reference**: Link related documentation
5. **Add Metadata**: Include version, date, purpose at file top

### Documentation Template

```markdown
# Title

**Version**: X.Y.Z
**Date**: YYYY-MM-DD
**Purpose**: Brief purpose statement
**Related**: [Link to related docs]

## Overview
...

## Details
...

## Related Documentation
- [File 1](./FILE1.md)
- [File 2](./FILE2.md)
```

## Maintenance

### Regular Tasks

- **Quarterly**: Review and archive outdated documentation
- **Per Release**: Update version-specific documentation
- **As Needed**: Add new guides and reference material

### Archival Policy

Documentation older than 2 releases or 6 months (whichever is longer) should be:

1. Marked as **[HISTORICAL]** in title
2. Moved to appropriate historical directory
3. Linked from newer replacement documentation

## Related Documentation

- [INDEX.md](../INDEX.md) - Complete documentation index
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Project file organization
- [CONTRIBUTING.md](../../.github/CONTRIBUTING.md) - Contribution guidelines

---

## Development Tooling Artifacts

The following directories are automatically generated during development and testing.
They are gitignored and should not be committed to version control.

### `.ai_workflow/`

**Purpose**: AI-assisted development workflow automation
**Contents**: Logs, metrics, summaries, and backlog tracking
**Maintenance**: Automatically managed by AI workflow tools
**Status**: Excluded from version control (`.gitignore`)

### `.idea/`

**Purpose**: JetBrains IDE configuration (WebStorm, IntelliJ)
**Contents**: IDE settings, caches, workspace configuration
**Maintenance**: Automatically managed by IDE
**Status**: Excluded from version control (`.gitignore`)

### `.jest-cache/`

**Purpose**: Jest test runner cache for faster test execution
**Contents**: Transformed test files and execution cache
**Maintenance**: Automatically cleared by Jest (configured in `package.json`)
**Configuration**: `"cacheDirectory": ".jest-cache"` in `jest` section of `package.json`
**Status**: Excluded from version control (`.gitignore`)

### `.pytest_cache/`

**Purpose**: Pytest test runner cache (Python E2E tests)
**Contents**: Test collection cache and execution metadata
**Maintenance**: Automatically managed by pytest
**Status**: Excluded from version control (`.gitignore`)

### `venv/`

**Purpose**: Python virtual environment for Playwright E2E testing
**Contents**: Python packages (playwright, pytest, etc.)
**Setup**: `python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt`
**Maintenance**: Recreate when Python dependencies change
**Status**: Excluded from version control (`.gitignore`)

### `node_modules/`

**Purpose**: Node.js dependencies for Jest, Puppeteer, and other npm packages
**Contents**: JavaScript packages managed by npm
**Setup**: `npm install`
**Maintenance**: Update with `npm update` or `npm install` after `package.json` changes
**Status**: Excluded from version control (`.gitignore`)

### `coverage/`

**Purpose**: Test coverage reports generated by Jest
**Contents**: HTML and JSON coverage reports
**Generation**: `npm run test:coverage`
**Maintenance**: Regenerated on each coverage run
**Status**: Excluded from version control (`.gitignore`)
