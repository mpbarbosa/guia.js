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
# Check markdown links
python3 .github/scripts/check-links.py
```

## 💡 Best Practices

### When to Update Metadata

**Do Update**:

- ✅ Significant content changes
- ✅ New sections added
- ✅ Code examples updated
- ✅ API changes documented
- ✅ Status changes (Draft → Active)

**Don't Update For**:

- ❌ Typo fixes
- ❌ Minor wording
- ❌ Formatting only
- ❌ Comment additions

### Metadata Field Usage

**Last Updated**: Always update for significant changes
**Status**: Keep current (Active/Draft/Deprecated)
**Version**: Use when doc is version-specific
**Category**: Helps with organization and search
**Maintainer**: Optional, use for team ownership
**Related**: Link to related docs for navigation

## 🎯 Common Workflows

### Creating New Doc

1. Copy template from `docs/guides/DOCUMENTATION_METADATA_TEMPLATE.md`
2. Add metadata block after title
3. Write content
4. Run metadata updater: `.github/scripts/update-doc-metadata.sh YOUR_FILE.md`
5. Check references: `python3 .github/scripts/check-references.py`

### Updating Existing Doc

1. Make content changes
2. Update metadata: `.github/scripts/update-doc-metadata.sh YOUR_FILE.md`
3. Verify references: `python3 .github/scripts/check-references.py`
4. Commit with descriptive message

### Deprecating Doc

1. Update Status: `Deprecated`
2. Add deprecation notice at top
3. Link to replacement doc
4. Update "Last Updated"
5. Keep file for reference (don't delete)

### Archiving Doc

1. Update Status: `Archived`
2. Add archival notice
3. Move to appropriate archive location (if needed)
4. Update references in other docs

## 📚 Full Documentation

- **Navigation Hub**: `docs/README.md`
- **Full Index**: `docs/INDEX.md`
- **Metadata Template**: `docs/guides/DOCUMENTATION_METADATA_TEMPLATE.md`
- **Script Documentation**: `.github/scripts/README_REFERENCE_CHECKER.md`

---

**Quick Links**:

- [Documentation Hub](../README.md)
- [Full Index](../INDEX.md)
- [Metadata Template](./DOCUMENTATION_METADATA_TEMPLATE.md)
- [Contributing Guidelines](../../.github/CONTRIBUTING.md)
