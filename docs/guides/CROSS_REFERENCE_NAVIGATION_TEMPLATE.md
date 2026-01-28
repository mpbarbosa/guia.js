# Cross-Reference Navigation Template

**Version**: 1.0.0  
**Last Updated**: 2026-01-28  
**Purpose**: Standard template for adding navigation and cross-references to documentation

---

## Standard Document Structure

Every major documentation file should include:

1. **Metadata Block** (required)
2. **Breadcrumb Navigation** (recommended)
3. **Main Content** (required)
4. **Related Documentation Section** (recommended)
5. **Footer Metadata** (optional)

---

## 1. Metadata Block (Top of File)

```markdown
# Document Title

---
Last Updated: YYYY-MM-DD
Status: Active | Draft | Deprecated | Archived
Category: Architecture | Testing | API | Guide | Report | Utility
---
```

**Purpose**: Document tracking and status  
**Location**: Immediately after title  
**See**: [Documentation Metadata Template](./DOCUMENTATION_METADATA_TEMPLATE.md)

---

## 2. Breadcrumb Navigation

### Format

```markdown
**Navigation**: [🏠 Home](../README.md) > [📚 Docs](./README.md) > Current Page Title
```

### Purpose
- Shows document location in hierarchy
- Provides quick navigation to parent levels
- Helps users understand context

### Placement
- Immediately after metadata block
- Before main content begins

### Examples

**Root-level document**:
```markdown
**Navigation**: [🏠 Home](../README.md) > [📚 Docs](./docs/README.md) > Testing Guide
```

**Subdirectory document**:
```markdown
**Navigation**: [🏠 Home](../../README.md) > [📚 Docs](../README.md) > [🧪 Testing](./README.md) > Test Strategy
```

**Deep subdirectory**:
```markdown
**Navigation**: [🏠 Home](../../../README.md) > [📚 Docs](../../README.md) > [🏗️ Architecture](../README.md) > [📦 Components](./README.md) > Component Name
```

### Icons Reference

Use emojis for visual clarity:
- 🏠 Home (project root)
- 📚 Docs (documentation root)
- 🧪 Testing
- 🏗️ Architecture
- 🔌 API Integration
- 🛠️ Utilities
- 📊 Reports
- 📝 Guides
- ⚙️ Configuration
- 🔄 Workflow

---

## 3. Related Documentation Section

### Standard Format

```markdown
## Related Documentation

### [Category Name]
- [Document Title](./path/to/doc.md) - Brief description
- [Another Document](../path/to/doc.md) - Brief description

### [Another Category]
- [Document Title](./path.md) - Brief description

### Documentation Hub
- [Documentation Index](./INDEX.md) - Complete documentation catalog
- [Documentation Hub](./README.md) - Quick navigation to all docs
```

### Purpose
- Help readers discover related content
- Provide context and additional resources
- Create documentation network

### Placement
- Near end of document
- After main content
- Before footer metadata

### Category Suggestions

**For Architecture Documents**:
```markdown
### Architecture Components
- [Component Name](./path.md) - Component description

### Related Patterns
- [Pattern Name](./path.md) - Pattern description

### Implementation Guides
- [Guide Name](./path.md) - Guide description
```

**For Testing Documents**:
```markdown
### Testing Resources
- [Test Strategy](./TEST_STRATEGY.md) - Overall approach
- [Test Infrastructure](./TEST_INFRASTRUCTURE.md) - Execution details

### Development Guides
- [Contributing Guidelines](../.github/CONTRIBUTING.md) - How to contribute
- [TDD Guide](../.github/TDD_GUIDE.md) - Test-Driven Development

### Documentation Hub
- [Documentation Index](./INDEX.md) - Complete catalog
```

**For API Integration Documents**:
```markdown
### API Documentation
- [API Name](./API_NAME.md) - API details

### Integration Guides
- [Guide Name](./GUIDE.md) - Integration steps

### Related APIs
- [Other API](./OTHER_API.md) - Related service

### Documentation Hub
- [API Integration Index](./README.md) - All API docs
```

**For Guide Documents**:
```markdown
### Related Guides
- [Guide Name](./GUIDE.md) - Guide description

### Reference Documentation
- [Reference](./REFERENCE.md) - Detailed reference

### Examples
- [Example](./EXAMPLE.md) - Practical example

### Documentation Hub
- [Guides Index](./README.md) - All guides
```

---

## 4. Footer Metadata (Optional)

### Simple Footer

```markdown
---

_Last updated: YYYY-MM-DD_
```

### Detailed Footer

```markdown
---

**Document Maintainer**: Team/Person Name  
**Last Review**: YYYY-MM-DD  
**Next Review**: YYYY-MM-DD or "As needed"  
**Related Issues**: [#123](https://github.com/user/repo/issues/123)
```

### Purpose
- Additional tracking information
- Maintenance scheduling
- Issue tracking

### When to Use
- Use simple footer for most documents
- Use detailed footer for critical documents requiring regular review
- Optional for all documents

---

## Complete Example

### Example: Testing Document

```markdown
# Test Strategy Documentation

---
Last Updated: 2026-01-28
Status: Active
Category: Testing
---

**Navigation**: [🏠 Home](../../README.md) > [📚 Docs](../README.md) > [🧪 Testing](./README.md) > Test Strategy

## Overview

[Main content goes here...]

## Testing Approach

[Content...]

## Best Practices

[Content...]

---

## Related Documentation

### Testing Resources
- [Test Infrastructure](./TEST_INFRASTRUCTURE.md) - Test execution and coverage
- [E2E Test Scenarios](../E2E_TEST_SCENARIO_MUNICIPIO_BAIRRO.md) - Example scenarios
- [Testing HTML Generation](../TESTING_HTML_GENERATION.md) - Component testing

### Development Guides
- [Contributing Guidelines](../../.github/CONTRIBUTING.md) - How to contribute
- [TDD Guide](../../.github/TDD_GUIDE.md) - Test-Driven Development
- [Unit Test Guide](../../.github/UNIT_TEST_GUIDE.md) - Writing unit tests

### Documentation Hub
- [Documentation Index](../INDEX.md) - Complete documentation catalog
- [Documentation Hub](../README.md) - Quick navigation to all docs

---

_Last updated: 2026-01-28_
```

---

## Best Practices

### DO ✅

1. **Always include breadcrumb navigation** for documents in subdirectories
2. **Add Related Documentation section** for major guides and references
3. **Use relative paths** for internal links
4. **Group related links** by category in Related Documentation
5. **Include brief descriptions** for each related link
6. **Update breadcrumbs** when moving files
7. **Test all links** before committing

### DON'T ❌

1. **Don't use absolute paths** for internal documentation
2. **Don't create circular references** (A → B → A)
3. **Don't list too many links** (5-10 per category max)
4. **Don't forget to update** when document structure changes
5. **Don't omit descriptions** - help readers understand relevance
6. **Don't duplicate** - link to canonical source only

---

## Tools & Validation

### Check Cross-References

```bash
# Validate all internal links
python3 .github/scripts/check-references.py

# Check specific file
python3 .github/scripts/check-references.py docs/FILE.md
```

### Update Breadcrumbs Script

Consider creating a script to:
1. Detect document depth
2. Generate appropriate breadcrumb
3. Update all files in batch

*Note: This is a future enhancement opportunity*

---

## Maintenance

### When to Update Cross-References

1. **Creating new document**: Add breadcrumb and Related Documentation
2. **Moving document**: Update all breadcrumbs and incoming links
3. **Deprecating document**: Update Related Documentation to point to replacement
4. **Major content update**: Review Related Documentation for accuracy

### Quarterly Review

1. Verify all breadcrumbs are correct
2. Check Related Documentation sections are current
3. Remove links to deprecated/archived content
4. Add links to new relevant documentation

---

## Related Documentation

### Documentation Standards
- [Documentation Metadata Template](./DOCUMENTATION_METADATA_TEMPLATE.md) - Metadata standards
- [Documentation Quick Reference](./DOCUMENTATION_QUICK_REFERENCE.md) - Quick guide
- [Terminology Guide](./TERMINOLOGY_GUIDE.md) - Consistent terminology

### Automation Tools
- [Reference Checker](../../.github/scripts/README_REFERENCE_CHECKER.md) - Link validation
- [Metadata Updater](../../.github/scripts/update-doc-metadata.sh) - Metadata management

### Documentation Hub
- [Documentation Index](../INDEX.md) - Complete documentation catalog
- [Documentation Hub](../README.md) - Quick navigation to all docs

---

_Last updated: 2026-01-28_
