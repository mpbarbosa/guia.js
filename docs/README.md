# Documentation Hub - Guia Turístico

---

Last Updated: 2026-05-23
Status: Active
Category: Guide

---

**Navigation**: [🏠 Project Home](../README.md) | [📚 Full Index](./INDEX.md) | [🤝 Contributing](../.github/CONTRIBUTING.md)

---

## 📖 Quick Links

### Essential Reading

- **[Project Overview](../README.md)** - What is Guia Turístico?
- **[Installation Guide](../README.md#installation)** - Get started quickly
- **[Contributing Guidelines](../.github/CONTRIBUTING.md)** - How to contribute
- **[Testing Guide](./testing/TEST_STRATEGY.md)** - Testing philosophy and practices

### Architecture & Design

- **[Project Architecture](./PROJECT_PURPOSE_AND_ARCHITECTURE.md)** - System design overview
- **[Views Layer](./architecture/VIEWS_LAYER.md)** - SPA view controllers
- **[Module Structure](./architecture/MODULES.md)** - Current module organization
- **[Directory Organization](./developer/DIRECTORY_ORGANIZATION.md)** - Documentation structure

### API & Integration

- **[Ibira.js Integration](./guides/IBIRA_INTEGRATION.md)** - Brazilian statistics API integration
- **[SIDRA Integration](./guides/SIDRA_INTEGRATION.md)** - Population data integration
- **[Nominatim API](./api-integration/NOMINATIM_INTEGRATION.md)** - OpenStreetMap geocoding

### Development Workflow

- **[Workflow Setup](../WORKFLOW_SETUP.md)** - Local development environment
- **[Testing Infrastructure](./testing/TEST_INFRASTRUCTURE.md)** - Test execution and coverage
- **[Code Quality Plan](./developer/CODE_QUALITY_ACTION_PLAN.md)** - Quality standards
- **[DRY Guide](./guides/DRY_GUIDE.md)** - Single-source-of-truth rules for code, tests, and docs
- **[GitHub Scripts](../.github/scripts/README.md)** - Scripts and utilities

---

## 🗂️ Documentation Categories

### 📐 Architecture

Explore the system design and component structure:

- [architecture/](./architecture/) - Architecture diagrams and component docs

### 🧪 Testing

Testing strategy, infrastructure, and best practices:

- [testing/](./testing/) - Test organization, infrastructure, and E2E scenarios
- [Testing Guide](./testing/TESTING.md) - Main testing documentation

### 🔌 API Integration

External API integrations and data sources:

- [api-integration/](./api-integration/) - Nominatim, IBGE, and other APIs

### 🚀 Features

Feature documentation and implementation guides:

- [FEATURE_METROPOLITAN_REGION_DISPLAY.md](./user/features/FEATURE_METROPOLITAN_REGION_DISPLAY.md)
- [FEATURE_MUNICIPIO_STATE_DISPLAY.md](./user/features/FEATURE_MUNICIPIO_STATE_DISPLAY.md)

### 🔧 Utilities

Utility documentation and helper guides:

- [utils/](./utils/) - Timer management, logging, and other utilities

### 🎯 CI/CD & Automation

Workflow setup, GitHub Actions, and automation tooling:

- [WORKFLOW_SETUP.md](../WORKFLOW_SETUP.md) - Local workflow setup and CI/CD overview
- [github/](./github/) - GitHub Actions reference guides
- [.github/workflows/README.md](../.github/workflows/README.md) - Workflow descriptions
- [.github/scripts/README.md](../.github/scripts/README.md) - Automation script inventory

### 📝 Guides

General purpose guides and how-tos:

- [guides/](./guides/) - Various development and contribution guides

### 📚 Developer Resources

Developer-specific documentation and references:

- [developer/](./developer/) - Developer guides, patterns, and best practices
- [api/](./api/) - Technical references and specifications
- [prompts/](./prompts/) - AI assistant prompts and templates

### 🔍 Generated & Auto-Generated

Auto-generated documentation (should not be manually edited):

- [api-generated/](./api-generated/) - JSDoc-generated API docs (ignored in git)
- [api/](./api/) - API documentation (may include generated content)

### 🗃️ Miscellaneous Archive

Controlled historical archive and retired documentation records:

- [misc/](./misc/) - Controlled archive for historical records and retired documentation

---

## 🔍 Quick Search

### By Topic

**Geolocation & Location Services**

- [Position Management](./api/POSITION_MANAGER.md)
- [Address Extraction](./api/ADDRESS_EXTRACTOR.md)

**Brazilian Address Handling**

- [Brazilian Address Standard](./api/BRAZILIAN_STANDARD_ADDRESS.md)
- [Ibira.js Integration](./guides/IBIRA_INTEGRATION.md)
- [SIDRA Data](./guides/SIDRA_INTEGRATION.md)

**UI & Display**

- [HTML Generation Testing](./testing/HTML_GENERATION.md)
- [Highlight Cards Display](./api/API_REFERENCE.md#htmlhighlightcardsdisplayer)
- [Views Layer](./architecture/VIEWS_LAYER.md)

**Testing & Quality**

- [Test Strategy](./testing/TEST_STRATEGY.md)
- [Test Infrastructure](./testing/TEST_INFRASTRUCTURE.md)
- [E2E Test Scenarios](./testing/E2E_TEST_SCENARIO_MUNICIPIO_BAIRRO.md)
- [DRY Guide](./guides/DRY_GUIDE.md)

**Development Tools**

- [GitHub Scripts](../.github/scripts/README.md)
- [Reference Checker](../.github/scripts/README_REFERENCE_CHECKER.md)
- [Version Consistency](../.github/scripts/check-version-consistency.sh)

### By Status

**✅ Production-Ready**

- Core geolocation services
- Brazilian address standardization
- IBGE/SIDRA integration
- Speech synthesis system
- Timer management utilities

**🚧 In Progress**

- Documentation improvements
- Test coverage expansion
- Performance optimization

**📋 Planned**

- Enhanced error handling
- Additional API integrations
- Mobile responsiveness improvements

---

## 📚 Complete Documentation Index

For a comprehensive, categorized list of all documentation files, see:

- **[INDEX.md](./INDEX.md)** - Full documentation index with descriptions

---

## 🆕 Recently Updated

> **Note**: Files below show recent changes. For detailed change history, see [CHANGELOG.md](../CHANGELOG.md)

- **2026-05-22**: Maintenance archive removed; archival guidance now lives in [misc/README.md](./misc/README.md) and stable operational references live under [infrastructure/](./infrastructure/)

---

## 💡 Tips for Documentation Navigation

1. **New to the project?** Start with [Project Overview](../README.md) → [Contributing Guidelines](../.github/CONTRIBUTING.md)
2. **Setting up development?** Follow [Workflow Setup](../WORKFLOW_SETUP.md) → [Testing Guide](./testing/TEST_STRATEGY.md)
3. **Understanding architecture?** Read [Project Architecture](./PROJECT_PURPOSE_AND_ARCHITECTURE.md) → [Views Layer](./architecture/VIEWS_LAYER.md)
4. **Writing tests?** Check [Test Strategy](./testing/TEST_STRATEGY.md) → [Test Infrastructure](./testing/TEST_INFRASTRUCTURE.md)
5. **Looking for specific info?** Use [Full Index](./INDEX.md) or search within this page (Ctrl+F / Cmd+F)

---

## 🤝 Contributing to Documentation

Found outdated information or broken links? Want to improve documentation?

1. **Small fixes**: Edit directly and submit a pull request
2. **New documentation**: Follow the [Documentation Guide](../.github/CONTRIBUTING.md#documentation)
3. **Broken links**: Report using the [Reference Checker](../.github/scripts/README_REFERENCE_CHECKER.md)
4. **Major updates**: Open an [issue](https://github.com/mpbarbosa/guia.js/issues) first to discuss

---

## 📞 Need Help

- **Questions?** Open a [GitHub Discussion](https://github.com/mpbarbosa/guia.js/discussions)
- **Bug reports?** Create an [Issue](https://github.com/mpbarbosa/guia.js/issues)
- **General info?** See [README.md](../README.md)

---

**Last Updated**: 2026-05-23
**Documentation Version**: 0.27.3-alpha
**Total Documentation Files**: 312+ markdown files
**Directory Structure**: 20 documented categories
