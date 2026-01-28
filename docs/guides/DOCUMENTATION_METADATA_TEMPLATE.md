# Documentation Metadata Template

Use this template for creating new documentation files with proper metadata.

## Standard Metadata Block

Place at the top of your markdown file, after the title:

```markdown
# Document Title

---
Last Updated: YYYY-MM-DD
Status: Active | Draft | Deprecated | Archived
Version: X.X.X
Category: Architecture | Testing | API | Guide | Report | Utility
Maintainer: @username (optional)
Related: [Link to related docs] (optional)
---

## Content starts here...
```

## Metadata Field Descriptions

### Required Fields

**Last Updated**
- Format: `YYYY-MM-DD`
- When to update: Any significant content change
- Use script: `.github/scripts/update-doc-metadata.sh`

**Status**
- `Active` - Current, maintained documentation
- `Draft` - Work in progress, not yet finalized
- `Deprecated` - Outdated but kept for reference
- `Archived` - Historical reference, no longer maintained

### Optional Fields

**Version**
- Format: Semantic versioning (e.g., `0.7.1-alpha`)
- Use when: Documentation is version-specific
- Sync with: `package.json` version

**Category**
- `Architecture` - System design and component structure
- `Testing` - Test strategy, infrastructure, guides
- `API` - API integration and external services
- `Guide` - How-to guides and tutorials
- `Report` - Analysis reports and summaries
- `Utility` - Utility scripts and tools
- `Workflow` - CI/CD, automation, processes
- `Refactoring` - Refactoring plans and implementations

**Maintainer**
- Format: `@github-username` or `Team Name`
- Use when: Specific person/team responsible for doc
- Helps: Contributors know who to contact

**Related**
- Format: `[Link text](relative/path/to/doc.md)`
- Use when: Document references other important docs
- Helps: Navigation and cross-referencing

## Examples

### Minimal (Required Only)

```markdown
# Testing Strategy

---
Last Updated: 2026-01-28
Status: Active
---

## Overview
...
```

### Complete (All Fields)

```markdown
# SIDRA Integration Guide

---
Last Updated: 2026-01-28
Status: Active
Version: 0.7.2+
Category: API
Maintainer: @mpbarbosa
Related: [IBGE Integration](./IBIRA_INTEGRATION.md), [Data Architecture](./architecture/DATA_LAYER.md)
---

## Overview
...
```

### Draft Document

```markdown
# New Feature Implementation Plan

---
Last Updated: 2026-01-28
Status: Draft
Version: 0.8.0-alpha
Category: Guide
---

**⚠️ Note**: This document is a work in progress.

## Proposal
...
```

### Deprecated Document

```markdown
# Legacy API Integration (Deprecated)

---
Last Updated: 2025-12-15
Status: Deprecated
Version: 0.5.0
Category: API
---

**⚠️ Deprecated**: This integration method is no longer supported. See [New API Integration](./NEW_API.md) instead.

## Historical Information
...
```

## Automated Metadata Updates

Use the metadata updater script for batch updates:

```bash
# Update single file
.github/scripts/update-doc-metadata.sh docs/TESTING.md

# Update all docs with current date
.github/scripts/update-doc-metadata.sh --all --recursive

# Dry run to preview changes
.github/scripts/update-doc-metadata.sh --dry-run --all

# Use specific date
.github/scripts/update-doc-metadata.sh --date 2026-01-15 docs/TESTING.md
```

## When to Update Metadata

### Last Updated Field

Update when:
- ✅ Significant content changes (new sections, major edits)
- ✅ Code examples updated
- ✅ API/integration details changed
- ✅ Architecture diagrams modified
- ✅ Links updated or corrected

Don't update for:
- ❌ Typo fixes
- ❌ Minor wording improvements
- ❌ Formatting adjustments
- ❌ Comment additions

### Status Field

Update when:
- ✅ Document moves from Draft → Active
- ✅ Content becomes outdated (Active → Deprecated)
- ✅ Document archived for reference (Deprecated → Archived)

### Version Field

Update when:
- ✅ Package version bumps and doc reflects new version
- ✅ Breaking changes require version-specific docs
- ✅ Feature additions tied to specific release

## Best Practices

1. **Be Consistent**: Use the same metadata format across all docs
2. **Keep Current**: Update "Last Updated" when making significant changes
3. **Link Related Docs**: Help readers navigate between related documents
4. **Mark Drafts Clearly**: Use Status: Draft and add a warning note
5. **Deprecate Gracefully**: Keep deprecated docs with clear warnings and migration paths
6. **Archive Old Content**: Don't delete, mark as Archived with historical context

## Frequently Updated Documents

These documents should be updated regularly:

### Version-Specific
- `CHANGELOG.md` - Every release
- `README.md` - Major feature additions
- `package.json` - Version bumps

### Test-Related
- `docs/testing/TEST_STRATEGY.md` - Test infrastructure changes
- `docs/testing/TEST_INFRASTRUCTURE.md` - Coverage updates

### Architecture
- `docs/PROJECT_PURPOSE_AND_ARCHITECTURE.md` - Major refactorings
- `docs/architecture/CLASS_DIAGRAM.md` - Component additions

### Reports
- `docs/reports/` - After audits or analysis
- `docs/CODE_QUALITY_ACTION_PLAN.md` - Progress updates

## Git Integration

Consider adding metadata updates to commit messages:

```bash
# When updating documentation
git commit -m "docs: update TESTING.md with new strategy

- Updated metadata (Last Updated: 2026-01-28)
- Added E2E testing section
- Revised coverage targets"
```

## Maintenance Schedule

Suggested review intervals:

- **Monthly**: Check all Active docs for outdated content
- **Quarterly**: Review Draft docs, promote or archive
- **Annually**: Full documentation audit
- **After releases**: Update version-specific docs

## Tools

- **Metadata Updater**: `.github/scripts/update-doc-metadata.sh`
- **Reference Checker**: `.github/scripts/check-references.py`
- **Version Checker**: `.github/scripts/check-version-consistency.sh`

---

Last Updated: 2026-01-28  
Status: Active  
Category: Guide
