## INDEX

# Documentation Index - Guia Turístico

---

Last Updated: 2026-01-28
Status: Active
Category: Guide

---

**Navigation**: [🏠 Home](../README.md) > 📚 Documentation Index

---

## 🚀 Quick Start Paths

Choose your path based on your role or goal:

### 🆕 New Contributors

1. Start: [README.md](../README.md) - Project overview
2. Then: [CONTRIBUTING.md](../.github/CONTRIBUTING.md) - Contribution guidelines
3. Next: [TDD_GUIDE.md](../.github/TDD_GUIDE.md) - Test-driven development
4. Finally: [UNIT_TEST_GUIDE.md](../.github/UNIT_TEST_GUIDE.md) - Writing tests

**Estimated time**: 2 hours reading

### 🏗️ Architecture Deep Dive

1. Start: [PROJECT_PURPOSE_AND_ARCHITECTURE.md](./PROJECT_PURPOSE_AND_ARCHITECTURE.md) - Overview
2. Then: [CLASS_DIAGRAM.md](./architecture/CLASS_DIAGRAM.md) - System design
3. Next: [MODULE_SPLITTING_GUIDE.md](./MODULE_SPLITTING_GUIDE.md) - Module organization
4. Finally: [WEB_GEOCODING_MANAGER.md](./architecture/WEB_GEOCODING_MANAGER.md) - Core component

**Estimated time**: 3 hours reading + exploration

### 🧪 Testing & Quality

1. Start: [TESTING.md](./testing/TESTING.md) - Testing overview
2. Then: [JEST_COMMONJS_ES6_GUIDE.md](../.github/JEST_COMMONJS_ES6_GUIDE.md) - Jest setup
3. Next: [HTML_GENERATION.md](./testing/HTML_GENERATION.md) - HTML testing
4. Finally: [TDD_GUIDE.md](../.github/TDD_GUIDE.md) - TDD methodology

**Estimated time**: 2 hours reading

### 🔧 Development Setup

1. Start: [README.md](../README.md#installation) - Installation
2. Then: [WORKFLOW_SETUP.md](./WORKFLOW_SETUP.md) - Development workflow
3. Next: [JSDOC_GUIDE.md](../.github/JSDOC_GUIDE.md) - Documentation standards
4. Finally: [CONTRIBUTING.md](../.github/CONTRIBUTING.md) - Best practices

**Estimated time**: 1 hour + hands-on setup

### 🐛 Debugging & Troubleshooting

1. Start: [TESTING.md](./testing/TESTING.md#troubleshooting) - Common issues
2. Then: [JEST_COMMONJS_ES6_GUIDE.md](../.github/JEST_COMMONJS_ES6_GUIDE.md) - Module issues
3. Next: [CONTRIBUTING.md](../.github/CONTRIBUTING.md) - Contribution guidelines and immutability principles
4. Also: [CODE_PATTERN_DOCUMENTATION_GUIDE.md](./CODE_PATTERN_DOCUMENTATION_GUIDE.md) - Valid code patterns
5. Finally: [GitHub Issues](https://github.com/mpbarbosa/guia.js/issues) - Report bugs

**Estimated time**: Variable

---

Welcome to the Guia Turístico documentation! This index provides an overview of all available documentation and guides.

## Quick Links

- **[README.md](../README.md)** - Project overview, quick start, and getting started guide 🆕
  - Installation instructions
  - Quick start commands
  - Project structure overview
  - Testing and validation guide
  - Contributing guidelines
  - Troubleshooting common issues

## Core Documentation

### Project Purpose & Identity

- **[PROJECT_PURPOSE_AND_ARCHITECTURE.md](./PROJECT_PURPOSE_AND_ARCHITECTURE.md)** - ⚠️ CRITICAL: Project identity and architecture boundaries 🆕
  - **READ FIRST** before making deployment decisions
  - Definitive guide on what Guia.js IS and IS NOT
  - Why GitHub Pages is inappropriate for this project
  - Correct distribution methods (CDN, npm)
  - Decision making framework for architecture changes
  - Prevents inappropriate migrations and architectural mistakes

### Project Structure

- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Project structure and organization 🆕
  - Purpose as library component (not standalone site)
  - Integration with mpbarbosa.com personal website
  - Directory structure explanation (/src for library organization)
  - Historical context of restructuring commit

- **[PROJECT_CLARIFICATION.md](./PROJECT_CLARIFICATION.md)** - 📦 ARCHIVED: Historical clarifications (2026-01-06)
  - Historical record of project identity confusion resolution
  - Preserved for audit trail and AI tool reference
  - See current docs: README.md, PROJECT_PURPOSE_AND_ARCHITECTURE.md
  - Development workflow and CDN distribution
  - **Source Directory Details**:
    - **Views Module** (`/src/views

---

## NAVIGATION_IMPROVEMENT_GUIDE

# Navigation Structure Improvement Guide

**Generated**: 2026-01-06
**Project**: Guia Turístico v0.9.0-alpha
**Status**: 🟢 **Implementation Guide**

---

## Overview

This guide provides standards and templates for improving documentation navigation across the Guia Turístico project.

---

## 1. Breadcrumb Navigation

### Purpose

Help users understand their location in the documentation hierarchy and easily navigate back to parent sections.

### Standard Format

```markdown
**Navigation**: [🏠 Home](../README.md) > [📚 Docs](./INDEX.md) > [🏗️ Architecture](./architecture/) > Current Page
```

### Placement

- **Location**: Top of file, immediately after title
- **Separator**: Use `---` horizontal rule after navigation

### Examples by Location

#### Root README.md

```markdown
# Guia Turístico - Tourist Guide Web Application

**Navigation**: 🏠 You are here (Home)

---
```

#### docs/INDEX.md

```markdown
# Documentation Index

**Navigation**: [🏠 Home](../README.md) > 📚 You are here (Documentation Index)

---
```

#### docs/architecture/CLASS_DIAGRAM.md

```markdown
# Class Diagram

**Navigation**: [🏠 Home](../../README.md) > [📚 Docs](../INDEX.md) > [🏗️ Architecture](./README.md) > Class Diagram

---
```

#### docs/api-integration/NOMINATIM_API_FORMAT.md

```markdown
# Nominatim API Format

**Navigation**: [🏠 Home](../../README.md) > [📚 Docs](../INDEX.md) > [🔌 API Integration](./README.md) > Nominatim API

---
```

#### .github/CONTRIBUTING.md

```markdown
# Contributing Guide

**Navigation**: [🏠 Home](../README.md) > [⚙️ GitHub](./README.md) > Contributing

---
```

### Emoji Icons Reference

Use consistent emojis for better visual navigation:

- 🏠 **Home** - Root README.md
- 📚 **Docs** - Documentation index
- 🏗️ **Architecture** - System design docs
- 🧪 **Testing** - Test documentation
- 🔌 **API Integration** - External APIs
- 🎨 **UI/UX** - User interface docs
- ⚙️ **GitHub** - Repository settings/workflows
- 📦 **Packages** - Dependencies and modules
- 🔧 **Tools** - Development tools
- 📖 **Guides** - How-to documentation
- 🐛 **Issues** - Issue tracking
- 🚀 **Deployment** - Deployment guides

---

## 2. Quick Start Paths

### Purpose

Provide curated learning paths for different user roles and goals.

### Implementation in docs/INDEX.md

```markdown
## 🚀 Quick Start Paths

Choose your path based on your role or goal:

### 🆕 New Contributors
1. Start: [README.md](../README.md) - Project overview
2. Then: [CONTRIBUTING.md](../.github/CONTRIBUTING.md) - Guidelines
3. Next: [TDD_GUIDE.md](../.github/TDD_GUIDE.md) - TDD basics
4. Finally: [UNIT_TEST_GUIDE.md](../.github/UNIT_TEST_GUIDE.md) - Writing tests

**Estimated time**: 2 hours reading

### 🏗️ Architecture Deep Dive
1. Start: [PROJECT_PURPOSE_AND_ARCHITECTURE.md](./PROJECT_PURPOSE_AND_ARCHITECTURE.md)
2. Then: [CLASS_DIAGRAM.md](./architecture/CLASS_DIAGRAM.md)
3. Next: [MODULE_SPLITTING_GUIDE.md](./MODULE_SPLITTING_GUIDE.md)
4. Finally: [WEB_GEOCODING_MANAGER.md](./architecture/WEB_GEOCODING_MANAGER.md)

**Estimated time**: 3 hours reading + exploration

### 🧪 Testing & Quality
1. Start: [TESTING.md](../TESTING.md) - Overview
2. Then: [JEST_COMMONJS_ES6_GUIDE.md](../.github/JEST_COMMONJS_ES6_GUIDE.md)
3. Next: [TESTING_HTML_GENERATION.md](./TESTING_HTML_GENERATION.md)
4. Finally: [TDD_GUIDE.md](../.github/TDD_GUIDE.md)

**Estimated time**: 2 hours reading
```

### Path Templates

**New Feature Development**:

```markdown
### 🔨 Adding New Features
1. Start: [CONTRIBUTING.md](../.github/CONTRIBUTING.md) - Workflow
2. Then: [TDD_GUIDE.md](../.github/TDD_GUIDE.md) - Write tests first
3. Next: [JSDOC_GUIDE.md](../.github/JSDOC_GUIDE.md) - Document code
4. Finally: Pull request checklist

**Estimated time**: Variable based on feature
```

**Bug Fixing**:

```markdown
### 🐛 Fixing Bugs
1. Start: [GitHub Issues](https://github.com/mpbarbosa/guia.js/issues)
2. Then: [TESTING.md](../TESTING.md#troubleshooting) - Reproduce
3. Next: [TDD_GUIDE.md](..
