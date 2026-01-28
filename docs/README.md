# Documentation Hub - Guia Turístico

---
Last Updated: 2026-01-28
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
- **[Class Extraction Guide](./class-extraction/README.md)** - Component organization
- **[Directory Organization](./DIRECTORY_ORGANIZATION.md)** - Documentation structure

### API & Integration
- **[IBGE Integration](./IBIRA_INTEGRATION.md)** - Brazilian statistics API
- **[SIDRA Integration](./SIDRA_INTEGRATION.md)** - Population data integration
- **[Nominatim API](./api-integration/NOMINATIM_INTEGRATION.md)** - OpenStreetMap geocoding

### Development Workflow
- **[Workflow Setup](./WORKFLOW_SETUP.md)** - Local development environment
- **[Testing Infrastructure](./testing/TEST_INFRASTRUCTURE.md)** - Test execution and coverage
- **[Code Quality Plan](./CODE_QUALITY_ACTION_PLAN.md)** - Quality standards
- **[Automation Tools](./AUTOMATION_TOOLS.md)** - Scripts and utilities

---

## 🗂️ Documentation Categories

### 📐 Architecture
Explore the system design and component structure:
- [architecture/](./architecture/) - Architecture diagrams and component docs
- [class-extraction/](./class-extraction/) - Class extraction and refactoring guides

### 🧪 Testing
Testing strategy, infrastructure, and best practices:
- [testing/](./testing/) - Test organization, infrastructure, and E2E scenarios
- [TESTING.md](../TESTING.md) - Main testing documentation

### 🔌 API Integration
External API integrations and data sources:
- [api-integration/](./api-integration/) - Nominatim, IBGE, and other APIs

### 🛠️ Refactoring
Refactoring plans and implementation guides:
- [refactoring/](./refactoring/) - God object elimination, singleton patterns, etc.

### 🚀 Features
Feature documentation and implementation guides:
- [FEATURE_METROPOLITAN_REGION_DISPLAY.md](./FEATURE_METROPOLITAN_REGION_DISPLAY.md)
- [FEATURE_MUNICIPIO_STATE_DISPLAY.md](./FEATURE_MUNICIPIO_STATE_DISPLAY.md)

### 📊 Reports
Analysis reports, implementation summaries, and audits:
- [reports/](./reports/) - Analysis, implementation, and validation reports

### 🔧 Utilities
Utility documentation and helper guides:
- [utils/](./utils/) - Timer management, logging, and other utilities

### 🎯 Workflow & Automation
CI/CD, scripts, and automation documentation:
- [workflow-automation/](./workflow-automation/) - GitHub Actions and automation scripts

### 📝 Guides
General purpose guides and how-tos:
- [guides/](./guides/) - Various development and contribution guides

---

## 🔍 Quick Search

### By Topic

**Geolocation & Location Services**
- [GeolocationService Implementation](./GEOLOCATION_SERVICE_IMPLEMENTATION.md)
- [Position Management](./architecture/POSITION_MANAGER.md)
- [Address Extraction](./architecture/ADDRESS_EXTRACTOR.md)

**Brazilian Address Handling**
- [Brazilian Address Standard](./architecture/BRAZILIAN_ADDRESS.md)
- [IBGE Integration](./IBIRA_INTEGRATION.md)
- [SIDRA Data](./SIDRA_INTEGRATION.md)

**UI & Display**
- [HTML Generation Testing](./TESTING_HTML_GENERATION.md)
- [Highlight Cards Display](./architecture/HTML_HIGHLIGHT_CARDS_DISPLAYER.md)
- [Views Layer](./architecture/VIEWS_LAYER.md)

**Testing & Quality**
- [Test Strategy](./testing/TEST_STRATEGY.md)
- [Test Infrastructure](./testing/TEST_INFRASTRUCTURE.md)
- [E2E Test Scenarios](./E2E_TEST_SCENARIO_MUNICIPIO_BAIRRO.md)

**Development Tools**
- [Automation Tools](./AUTOMATION_TOOLS.md)
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

- **2026-01-28**: [Reference Check False Positives Report](./reports/REFERENCE_CHECK_FALSE_POSITIVES_2026-01-28.md)
- **2026-01-23**: [Architecture Documentation Fixes](./ARCHITECTURE_DOCUMENTATION_FIXES_2026-01-23.md)
- **2026-01-24**: [Node Version Fix](./NODE_VERSION_FIX_2026-01-24.md)
- **2026-01-24**: [Security Monitoring](./SECURITY_MONITORING_2026-01-24.md)
- **2026-01-15**: [UI Component Validation Report](./reports/analysis/UI_COMPONENT_VALIDATION_REPORT_2026-01-15.md)

---

## 💡 Tips for Documentation Navigation

1. **New to the project?** Start with [Project Overview](../README.md) → [Contributing Guidelines](../.github/CONTRIBUTING.md)
2. **Setting up development?** Follow [Workflow Setup](./WORKFLOW_SETUP.md) → [Testing Guide](./testing/TEST_STRATEGY.md)
3. **Understanding architecture?** Read [Project Architecture](./PROJECT_PURPOSE_AND_ARCHITECTURE.md) → [Views Layer](./architecture/VIEWS_LAYER.md)
4. **Writing tests?** Check [Test Strategy](./testing/TEST_STRATEGY.md) → [Test Infrastructure](./testing/TEST_INFRASTRUCTURE.md)
5. **Looking for specific info?** Use [Full Index](./INDEX.md) or search within this page (Ctrl+F / Cmd+F)

---

## 🤝 Contributing to Documentation

Found outdated information or broken links? Want to improve documentation?

1. **Small fixes**: Edit directly and submit a pull request
2. **New documentation**: Follow the [Documentation Guide](../.github/CONTRIBUTING.md#documentation)
3. **Broken links**: Report using the [Reference Checker](../.github/scripts/README_REFERENCE_CHECKER.md)
4. **Major updates**: Open an [issue](https://github.com/mpbarbosa/guia_turistico/issues) first to discuss

---

## 📞 Need Help?

- **Questions?** Open a [GitHub Discussion](https://github.com/mpbarbosa/guia_turistico/discussions)
- **Bug reports?** Create an [Issue](https://github.com/mpbarbosa/guia_turistico/issues)
- **General info?** See [README.md](../README.md)

---

**Last Updated**: 2026-01-28  
**Documentation Version**: 0.7.1-alpha  
**Total Documentation Files**: 312+ markdown files
