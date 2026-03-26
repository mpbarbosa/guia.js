## DOCUMENTATION_METADATA_TEMPLATE

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

## Content starts here..
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

- Format: Semantic versioning (e.g., `0.9.0-alpha`)
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
Version: 0.9.0+
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
Version: 0.9.0-alpha
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
Version: 0.9.0
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

1. **Be Consistent**: Use the same m

---

## DOCUMENTATION_QUICK_REFERENCE

# Documentation Navigation & Metadata - Quick Reference

**Version**: 1.0.0
**Last Updated**: 2026-01-28
**Status**: Active

## 🚀 Quick Start

### Finding Documentation

**Main Entry Points**:

1. **`docs/README.md`** - Documentation hub with quick links (NEW ✨)
2. **`docs/INDEX.md`** - Comprehensive categorized index
3. **Project `README.md`** - Project overview and installation

**Navigation Path**:

```
Project Root (README.md)
  ├── docs/README.md (Documentation Hub) ← NEW!
  │   ├── Quick Links (Essential reading)
  │   ├── Categories (By topic)
  │   └── Search (By keyword)
  └── docs/INDEX.md (Full Index)
      ├── Quick Start Paths (By role)
      ├── All Categories (Detailed)
      └── Complete File List
```

### Adding Metadata to Docs

**Script**: `.github/scripts/update-doc-metadata.sh`

```bash
# Update single file
.github/scripts/update-doc-metadata.sh docs/TESTING.md

# Update all docs (recursive)
.github/scripts/update-doc-metadata.sh --all --recursive

# Dry run (preview changes)
.github/scripts/update-doc-metadata.sh --dry-run --all

# Custom date
.github/scripts/update-doc-metadata.sh --date 2026-01-15 docs/TESTING.md
```

## 📋 Metadata Format

### Standard Block

```markdown
# Document Title

---
Last Updated: YYYY-MM-DD
Status: Active | Draft | Deprecated | Archived
Version: X.X.X (optional)
Category: Architecture | Testing | API | Guide | Report | Utility
---

Content starts here...
```

### Quick Templates

**Minimal** (Required only):

```markdown
---
Last Updated: 2026-01-28
Status: Active
---
```

**Complete** (All fields):

```markdown
---
Last Updated: 2026-01-28
Status: Active
Version: 0.9.0-alpha
Category: Testing
Maintainer: @username
Related: [Link](./path.md)
---
```

## 🔍 Finding What You Need

### By Role

**New Contributor**:

```
README.md → docs/README.md → CONTRIBUTING.md → TDD_GUIDE.md
```

**Developer**:

```
docs/README.md → PROJECT_PURPOSE_AND_ARCHITECTURE.md → VIEWS_LAYER.md
```

**Tester**:

```
docs/README.md → testing/TEST_STRATEGY.md → TEST_INFRASTRUCTURE.md
```

### By Topic

| Topic | Start Here |
|-------|-----------|
| **Architecture** | `docs/PROJECT_PURPOSE_AND_ARCHITECTURE.md` |
| **Testing** | `docs/testing/TEST_STRATEGY.md` |
| **API Integration** | `docs/SIDRA_INTEGRATION.md`, `docs/IBIRA_INTEGRATION.md` |
| **Development Setup** | `docs/WORKFLOW_SETUP.md` |
| **Contributing** | `.github/CONTRIBUTING.md` |

### By Status

**Active Docs**: Current, maintained

- Most docs in `docs/architecture/`
- All guides in `docs/testing/`
- Integration docs in `docs/api-integration/`

**Draft Docs**: Work in progress

- Check metadata: `Status: Draft`
- Often in `docs/reports/` during analysis

**Deprecated Docs**: Outdated but kept for reference

- Check metadata: `Status: Deprecated`
- Usually includes migration path

## 🛠️ Maintenance Tasks

### Daily

```bash
# Before committing doc changes
.github/scripts/update-doc-metadata.sh docs/YOUR_FILE.md
```

### Weekly

```bash
# Check for broken references
python3 .github/scripts/check-references.py
```

### Monthly

```bash
# Update all recently modified docs
find docs -name "*.md" -mtime -30 -exec \
  .github/scripts/update-doc-metadata.sh {} \;
```

### Before Release

```bash
# Update all docs with new version
.github/scripts/update-doc-metadata.sh --all --recursive

# Verify references
python3 .github/scripts/check-references.py

# Update CHANGELOG
# (manual process)
```

## 📊 Documentation Statistics

**Location**: `docs/README.md` (bottom of file)

Current stats:

- Total files: 312+ markdown files
- Categories: 12 subdirectories
- Active docs: ~280
- Draft/Deprecated: ~32

## 🔗 Related Tools

### Reference Checking

```bash
# Check all references
python3 .github/scripts/check-references.py

# Check specific files
python3 .github/scripts/check-references.py docs/TESTING.md
```

### Version Consistency

```bash
# Check version across files
.github/scripts/check-version-consistency.sh
```

### Link Validation

```bash
# Che
