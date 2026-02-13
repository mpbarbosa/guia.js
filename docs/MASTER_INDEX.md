# Guia Turístico - Master Documentation Index

**Last Updated**: 2026-02-13  
**Version**: 0.9.0-alpha  
**Status**: ✅ Active

---

Welcome to the comprehensive documentation for **Guia Turístico** - a tourist guide web application built on the guia.js geolocation library. This master index provides quick navigation to all documentation resources.

## 🚀 Quick Links

| For... | Start Here |
|--------|------------|
| **New Users** | [User Guide](user/USER_GUIDE.md) \| [Quick Start](QUICK_START.md) |
| **New Developers** | [Developer Onboarding](developer/ONBOARDING.md) \| [Quick Start Guide](QUICK_START_GUIDE.md) |
| **API Reference** | [Complete API Reference](api/COMPLETE_API_REFERENCE.md) \| [API Quick Reference](API_QUICK_REFERENCE.md) |
| **Architecture** | [System Overview](architecture/SYSTEM_OVERVIEW.md) \| [Architecture Guide](ARCHITECTURE_OVERVIEW.md) |
| **Contributing** | [Contributing Guide](../.github/CONTRIBUTING.md) \| [Testing Guide](developer/TESTING_GUIDE.md) |

---

## 📚 Documentation Categories

### 1. Getting Started

#### For Users
- **[User Guide](user/USER_GUIDE.md)** - Complete guide for end users
- **[Quick Start](QUICK_START.md)** - Get started in 5 minutes
- **[Feature Guides](user/features/)** - Feature-specific documentation
  - [Location Tracking](user/features/location-tracking.md)
- **[Troubleshooting](user/TROUBLESHOOTING.md)** - Common issues and solutions
- **[FAQ](user/FAQ.md)** - Frequently asked questions

#### For Developers
- **[Developer Onboarding](developer/ONBOARDING.md)** - New developer guide
- **[Quick Start Guide](QUICK_START_GUIDE.md)** - 5-minute developer setup
- **[Getting Started](GETTING_STARTED.md)** - Detailed setup guide
- **[Project Structure](PROJECT_STRUCTURE.md)** - Codebase organization
- **[Contributing Guide](../.github/CONTRIBUTING.md)** - How to contribute

### 2. API Documentation

#### Core APIs
- **[Complete API Reference](api/COMPLETE_API_REFERENCE.md)** - Full API documentation
- **[API Quick Reference](API_QUICK_REFERENCE.md)** - Quick lookup
- **[Integration Examples](api/INTEGRATION_EXAMPLES.md)** - Real-world usage patterns
- **[Error Handling Guide](api/ERROR_HANDLING_GUIDE.md)** - Error scenarios

#### API by Component
| Component | Documentation |
|-----------|--------------|
| **Position Management** | [PositionManager](api/POSITION_MANAGER.md) \| [GeoPosition](api/GEO_POSITION.md) |
| **Geolocation Services** | [GeolocationService](api/GEOLOCATION_SERVICE.md) \| [ReverseGeocoder](api/REVERSE_GEOCODER.md) |
| **Address Processing** | [AddressExtractor](api/ADDRESS_EXTRACTOR.md) \| [AddressCache](api/ADDRESS_CACHE.md) \| [BrazilianStandardAddress](api/BRAZILIAN_STANDARD_ADDRESS.md) |
| **UI Display** | [DisplayerFactory](api/DISPLAYER_FACTORY.md) \| [UI Components](api/UI_COORDINATOR.md) |
| **Speech Synthesis** | [SpeechSynthesisManager](api/SPEECH_SYNTHESIS_MANAGER.md) \| [VoiceLoader](api/VOICE_LOADER.md) |
| **Coordination** | [ServiceCoordinator](api/SERVICE_COORDINATOR.md) \| [EventCoordinator](api/EVENT_COORDINATOR.md) |

#### Generated Documentation
- **[JSDoc API (Generated)](api-generated/index.html)** - Auto-generated API docs

### 3. Architecture Documentation

#### System Design
- **[System Overview](architecture/SYSTEM_OVERVIEW.md)** - High-level architecture
- **[Architecture Overview](ARCHITECTURE_OVERVIEW.md)** - Comprehensive guide
- **[Project Purpose & Architecture](PROJECT_PURPOSE_AND_ARCHITECTURE.md)** - Vision and design
- **[Architecture Decision Records](architecture/ARCHITECTURE_DECISION_RECORD.md)** - Design decisions

#### Component Architecture
- **[Core Components](architecture/COMPREHENSIVE_GUIDE.md)** - Component design
- **[Observer Pattern](observer-pattern.md)** - Event-driven architecture
- **[Views Layer](architecture/VIEWS_LAYER.md)** - UI architecture
- **[Data Flow](ARCHITECTURE_OVERVIEW.md#data-flow)** - Data architecture

#### Diagrams
- **[Class Diagram](architecture/CLASS_DIAGRAM.md)** - Class structure
- **[Sequence Diagrams](architecture/observer-pattern-sequence.md)** - Interaction flows
- **[Version Timeline](architecture/VERSION_TIMELINE.md)** - Evolution history

### 4. Developer Guides

#### Development Workflow
- **[Developer Guide](developer/DEVELOPER_GUIDE.md)** - Complete development guide
- **[Onboarding Guide](developer/ONBOARDING.md)** - New developer setup
- **[Debugging Guide](developer/DEBUGGING_GUIDE.md)** - Debugging tips
- **[Testing Guide](developer/TESTING_GUIDE.md)** - Testing practices
- **[Deployment Guide](developer/DEPLOYMENT_GUIDE.md)** - Deploy workflow

#### Best Practices
- **[Code Quality](CODE_QUALITY_ACTION_PLAN.md)** - Code standards
- **[Error Handling](ERROR_HANDLING.md)** - Error patterns
- **[Logging Guide](LOGGING_GUIDE.md)** - Logging best practices
- **[Naming Conventions](NAMING_CONVENTIONS.md)** - Naming standards
- **[Code Patterns](CODE_PATTERN_DOCUMENTATION_GUIDE.md)** - Design patterns

#### Tools & Configuration
- **[ESLint Setup](ESLINT_SETUP.md)** - Linting configuration
- **[JSDoc Guide](../.github/JSDOC_GUIDE.md)** - Documentation generation
- **[Git Best Practices](../.github/GIT_BEST_PRACTICES_GUIDE.md)** - Version control
- **[Workflow Setup](WORKFLOW_SETUP.md)** - CI/CD configuration

### 5. Testing Documentation

#### Testing Strategy
- **[Testing Guide](testing/TESTING.md)** - Complete testing guide
- **[Test Strategy](testing/TEST_STRATEGY.md)** - Testing approach
- **[Test Infrastructure](testing/TEST_INFRASTRUCTURE.md)** - Test setup
- **[E2E Testing Guide](testing/E2E_TESTING_GUIDE.md)** - End-to-end tests

#### Test Types
- **[Unit Testing](../__tests__/README.md)** - Unit test guide
- **[Integration Testing](../__tests__/integration/)** - Integration tests
- **[E2E Test Patterns](testing/E2E_TEST_PATTERNS.md)** - E2E patterns
- **[Performance Testing](testing/PERFORMANCE_TESTING_GUIDE.md)** - Performance tests

#### Coverage & Quality
- **[Coverage Policy](COVERAGE_POLICY.md)** - Coverage requirements
- **[Coverage Analysis](testing/COVERAGE_ANALYSIS_2026-01-24.md)** - Coverage reports
- **[Test Performance](testing/TEST_PERFORMANCE_OPTIMIZATION.md)** - Optimization
- **[Browser Compatibility](testing/BROWSER_COMPATIBILITY_GUIDE.md)** - Cross-browser

### 6. Integration Documentation

#### External APIs
- **[Nominatim Integration](api-integration/NOMINATIM_INTEGRATION.md)** - OpenStreetMap
- **[IBGE Integration](IBIRA_INTEGRATION.md)** - Brazilian locations
- **[SIDRA Integration](SIDRA_INTEGRATION.md)** - Demographics data

#### Service Integration
- **[Geolocation Provider Pattern](GEOLOCATION_PROVIDER_PATTERN.md)** - Provider pattern
- **[Service Coordination](api/SERVICE_COORDINATOR.md)** - Service orchestration

### 7. Feature Documentation

#### Core Features
- **[Location Tracking](user/features/location-tracking.md)** - Real-time tracking (v0.9.0+)
- **[Button Status Messages](FEATURE_BUTTON_STATUS_MESSAGES.md)** - Contextual feedback (v0.9.0+)
- **[Metropolitan Region Display](FEATURE_METROPOLITAN_REGION_DISPLAY.md)** - Metro regions (v0.9.0+)
- **[Municipality Display](FEATURE_MUNICIPIO_STATE_DISPLAY.md)** - State codes (v0.9.0+)

#### Speech Synthesis
- **[Speech Synthesis Tutorial](guides/TUTORIAL_SPEECH_SYNTHESIS.md)** - Audio feedback
- **[Voice Selection](VOICE_SELECTION.md)** - Voice management

#### UI Components
- **[Visual Hierarchy](VISUAL_HIERARCHY.md)** - UI design
- **[Accessibility](../src/utils/accessibility.js)** - WCAG compliance

### 8. Infrastructure & Operations

#### Build & Deployment
- **[Deployment Guide](guides/DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Vite Build](reports/implementation/VITE_BUILD_IMPLEMENTATION.md)** - Build system
- **[CDN Delivery](infrastructure/CDN_DELIVERY_SCRIPT_RELOCATION_PLAN.md)** - CDN setup

#### CI/CD
- **[CI/CD Guide](../.github/CI_CD_GUIDE.md)** - Continuous integration
- **[GitHub Actions](../.github/GITHUB_ACTIONS_GUIDE.md)** - Workflow automation
- **[Workflow Setup](WORKFLOW_SETUP.md)** - Local testing

#### Environment
- **[Node Version Alignment](infrastructure/NODE_VERSION_ALIGNMENT_PLAN.md)** - Node.js setup
- **[Environment Variables](reports/implementation/ENVIRONMENT_VARIABLES_COMPLETE.md)** - Configuration

### 9. Maintenance & Refactoring

#### Refactoring Guides
- **[Refactoring Summary](../.github/REFACTORING_SUMMARY.md)** - Recent changes
- **[God Object Refactoring](refactoring/GOD_CLASS_REFACTORING_PLAN_2026-01-24.md)** - Decomposition
- **[Class Extraction](class-extraction/CLASS_EXTRACTION_SUMMARY.md)** - Module splitting
- **[WebGeocodingManager Refactoring](WEBGEOCODINGMANAGER_REFACTORING_PLAN.md)** - Core refactor

#### Technical Debt
- **[Console Logging Debt](CONSOLE_LOGGING_TECHNICAL_DEBT.md)** - Logging cleanup
- **[Timer Management](TIMER_MANAGEMENT_CLEANUP.md)** - Memory leaks
- **[Dependency Management](DEPENDENCY_MANAGEMENT.md)** - Dependency updates

### 10. Advanced Topics

#### Performance
- **[Performance Analysis](testing/PERFORMANCE_ANALYSIS_2026-01-24.md)** - Performance metrics
- **[Optimization Guide](PHASE3_OPTIMIZATION_ANALYSIS.md)** - Optimization tips
- **[Flakiness Analysis](testing/FLAKINESS_ANALYSIS_2026-01-24.md)** - Test stability

#### Security
- **[Security Monitoring](SECURITY_MONITORING_2026-01-24.md)** - Security practices
- **[Security Assessment](reports/analysis/SECURITY_ASSESSMENT_2026-01-09.md)** - Security audit

#### Data Management
- **[Device Detection](DEVICE_DETECTION.md)** - Platform detection
- **[Address Caching](api/ADDRESS_CACHE.md)** - Cache strategy
- **[LRU Cache](api/LRU_CACHE.md)** - Cache implementation

### 11. Reference Materials

#### Quick References
- **[Quick Reference Card](guides/QUICK_REFERENCE_CARD.md)** - Command cheatsheet
- **[Documentation Quick Reference](guides/DOCUMENTATION_QUICK_REFERENCE.md)** - Doc lookup
- **[Terminology Guide](guides/TERMINOLOGY_GUIDE.md)** - Terms glossary
- **[Version Bump Guide](guides/VERSION_BUMP_QUICK_REFERENCE.md)** - Release workflow

#### Templates
- **[Documentation Metadata Template](guides/DOCUMENTATION_METADATA_TEMPLATE.md)** - Doc standards
- **[Cross-Reference Template](guides/CROSS_REFERENCE_NAVIGATION_TEMPLATE.md)** - Linking guide

#### Reports
- **[Reports Index](reports/README.md)** - Analysis reports
- **[Implementation Reports](reports/implementation/)** - Feature reports
- **[Bug Fix Reports](reports/bugfixes/)** - Bug fixes
- **[Analysis Reports](reports/analysis/)** - Code analysis

### 12. Historical Documentation

#### Version History
- **[Changelog](../CHANGELOG.md)** - Version history
- **[Version Timeline](architecture/VERSION_TIMELINE.md)** - Evolution
- **[Implementation Summaries](IMPLEMENTATION_SUMMARY_v0.7.4.md)** - Feature history

#### Migration Guides
- **[Migration Guide](MIGRATION_GUIDE.md)** - Version upgrades
- **[Dependency Overhaul](COMPLETE_DEPENDENCY_OVERHAUL_SUMMARY.md)** - Major changes

---

## 🔍 Documentation by Task

### I want to...

#### Understand the Project
- Start: [Project Purpose & Architecture](PROJECT_PURPOSE_AND_ARCHITECTURE.md)
- Then: [System Overview](architecture/SYSTEM_OVERVIEW.md)
- Deep dive: [Architecture Guide](ARCHITECTURE_OVERVIEW.md)

#### Use the Application
- Start: [User Guide](user/USER_GUIDE.md)
- Features: [Location Tracking](user/features/location-tracking.md)
- Issues: [Troubleshooting](user/TROUBLESHOOTING.md)

#### Start Contributing
- Start: [Developer Onboarding](developer/ONBOARDING.md)
- Setup: [Quick Start Guide](QUICK_START_GUIDE.md)
- Standards: [Contributing Guide](../.github/CONTRIBUTING.md)

#### Find an API
- Browse: [Complete API Reference](api/COMPLETE_API_REFERENCE.md)
- Quick lookup: [API Quick Reference](API_QUICK_REFERENCE.md)
- Examples: [Integration Examples](api/INTEGRATION_EXAMPLES.md)

#### Write Tests
- Guide: [Testing Guide](developer/TESTING_GUIDE.md)
- Strategy: [Test Strategy](testing/TEST_STRATEGY.md)
- Patterns: [E2E Test Patterns](testing/E2E_TEST_PATTERNS.md)

#### Debug an Issue
- Guide: [Debugging Guide](developer/DEBUGGING_GUIDE.md)
- Errors: [Error Handling Guide](api/ERROR_HANDLING_GUIDE.md)
- Troubleshoot: [Troubleshooting](user/TROUBLESHOOTING.md)

#### Deploy to Production
- Guide: [Deployment Guide](guides/DEPLOYMENT_GUIDE.md)
- Build: [Vite Build](reports/implementation/VITE_BUILD_IMPLEMENTATION.md)
- CI/CD: [CI/CD Guide](../.github/CI_CD_GUIDE.md)

---

## 📖 Documentation Standards

All documentation follows these standards:
- **Format**: Markdown (.md)
- **Front matter**: Date, version, status
- **Structure**: TL;DR, sections, examples
- **Quality**: Tested examples, cross-references
- **Maintenance**: Regular updates, version tracking

See [Documentation Guide](CODE_PATTERN_DOCUMENTATION_GUIDE.md) for details.

---

## 🆘 Need Help?

- **Can't find documentation?** - Check this index or search [docs/](.)
- **Documentation outdated?** - [Open an issue](https://github.com/mpbarbosa/guia_turistico/issues)
- **Want to contribute?** - See [Contributing Guide](../.github/CONTRIBUTING.md)
- **Have questions?** - See [FAQ](user/FAQ.md) or [Troubleshooting](user/TROUBLESHOOTING.md)

---

## 📈 Documentation Statistics

- **Total Documents**: 200+ files
- **API References**: 30+ classes documented
- **Code Examples**: 100+ working examples
- **Test Coverage**: 85% documented
- **Last Updated**: 2026-02-13

---

**Navigation**: [← Back to README](../README.md) | [Quick Start →](QUICK_START_GUIDE.md)
