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

#### `docs/refactoring/`
**Purpose**: Active refactoring session documentation and implementation guides  
**Status**: Working documentation for ongoing refactoring initiatives  
**Category**: God class elimination, implementation guides, phase resumption

**Key Files**:
- `GOD_CLASS_REFACTORING_PLAN_2026-01-24.md` - Current refactoring plan
- `IMPLEMENTATION_GUIDE_2026-01-24.md` - Step-by-step implementation guide
- `PHASE_3_RESUME_GUIDE.md` - Phase continuation instructions

**Expected Content**:
- Active refactoring session plans
- Implementation guides for ongoing work
- Phase-specific documentation
- Refactoring checkpoints and progress tracking

**Note**: Unlike `class-extraction/`, this contains **active** working documentation, not historical records.

#### `docs/class-extraction/`
**Purpose**: Historical documentation of modularization process

**Key Files**:
- `README.md` - Overview of class extraction phases
- `CLASS_EXTRACTION_PHASE_*.md` - 16 phases of refactoring
- `MODULE_SPLITTING_SUMMARY.md` - Module organization results

**Note**: This directory documents the transformation from a 6,000+ line monolithic file to a modular architecture.

#### `docs/testing/`
**Purpose**: Test infrastructure, strategy, and execution documentation

**Key Files**:
- `TEST_INFRASTRUCTURE.md` - Dual test infrastructure comparison
- `TEST_STRATEGY.md` - Comprehensive testing strategy
- `E2E_TEST_SUMMARY.md` - End-to-end test documentation

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

#### `docs/reports/`
**Purpose**: Comprehensive project analysis, audits, and implementation tracking  
**Status**: Active documentation  
**Organization**: Subdirectories by report type (analysis, bugfixes, implementation)

**Subdirectories**:

##### `docs/reports/analysis/`
**Purpose**: Technical analysis, audits, and improvement planning  
**Expected Content**:
- Architecture validation reports
- Code quality improvement plans
- Dependency update strategies
- Documentation consistency audits (dated)
- UI component validation reports

##### `docs/reports/bugfixes/`
**Purpose**: Bug fix implementation documentation and resolution records  
**Expected Content**:
- Bug fix summaries with root cause analysis
- E2E test fix documentation
- Documentation error fixes (dated)
- Worker process and environment issue resolutions

##### `docs/reports/implementation/`
**Purpose**: Completed implementation summaries and session records  
**Expected Content**:
- Feature implementation summaries
- Documentation audit completion reports
- Multi-phase project completion records
- Environment configuration implementations

#### `docs/workflow-automation/`
**Purpose**: CI/CD workflow documentation and automation strategy  
**Status**: Active documentation  
**Category**: Automation implementations, security strategies, and workflow configuration

**Key Files**:
- `AUTOMATION_SUMMARY.md` - Overview of automation implementations
- `FINAL_AUTOMATION_SUMMARY.md` - Complete automation system summary
- `WORKFLOW_TERMINOLOGY_DISAMBIGUATION.md` - Workflow terminology and concepts
- `CI_CACHING_STRATEGY.md` - CI/CD performance optimization
- `SECURITY_STRATEGY.md` - Security automation and monitoring

**Expected Content**:
- GitHub Actions workflow documentation
- Automation tool configurations and strategies
- CI/CD optimization and caching strategies
- Security automation patterns
- Pre-commit and pre-push hook documentation

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
- ❌ NOT for experimental/draft work (use `docs/reports/analysis/` instead)
- ❌ NOT for temporary notes (delete instead)

**Expected Content**:
- Analysis reports from past improvement initiatives
- Implementation summaries of completed projects
- Planning documents for historical reference
- Audit trail documentation

**See Also**: [docs/misc/README.md](./misc/README.md) for detailed archive index

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
- `REFACTOR_ADDRESS_FETCHED_CONSTANT.md` - Constant extraction refactoring

### Process Documentation
- `CODE_QUALITY_ACTION_PLAN.md` - Code quality improvement roadmap
- `DEPENDENCY_MANAGEMENT.md` - Dependency update strategy
- `WORKFLOW_SETUP.md` - GitHub Actions setup
- `AUTOMATION_IMPLEMENTATION_SUMMARY.md` - Automation overview

### Historical Documentation
- `CHANGELOG_v0.9.0.md` - Version 0.9.0 changes
- `DOCUMENTATION_FIXES_2026-01-09.md` - Documentation update history
- `PHASE*_*.md` - Implementation phase documentation

## Navigation

### Finding Documentation

**By Topic**:
- Architecture → `docs/architecture/`
- APIs → `docs/api-integration/`
- Testing → `docs/testing/`
- History → `docs/class-extraction/`

**By Type**:
- Reference → Root level + `docs/reference/`
- Guides → `docs/guides/`
- Reports → `docs/reports/`

**By Status**:
- Current → Root level + core directories
- Historical → `docs/class-extraction/`, phase files
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

- [INDEX.md](./INDEX.md) - Complete documentation index
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Project file organization
- [CONTRIBUTING.md](../.github/CONTRIBUTING.md) - Contribution guidelines

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
