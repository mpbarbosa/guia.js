# Guia.js Documentation Index

Welcome to the Guia.js documentation! This index provides an overview of all available documentation and guides.

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
  - Development workflow and CDN distribution

### Architecture & Design

- **[CLASS_DIAGRAM.md](./architecture/CLASS_DIAGRAM.md)** - Comprehensive overview of the class architecture
  - Design patterns used (Singleton, Observer, Facade, Strategy)
  - Class relationships and responsibilities
  - Refactoring history and rationale
  - Best practices for development

- **[REFERENCE_PLACE.md](./architecture/REFERENCE_PLACE.md)** - Reference place type documentation
  - Classification system for locations
  - Type mappings and descriptions
  - Integration with geocoding APIs

- **[GEO_POSITION.md](./architecture/GEO_POSITION.md)** - Geographic position data documentation
  - Wrapper for browser GeolocationPosition API
  - GPS accuracy quality classification
  - Distance calculation utilities
  - Integration with position tracking

- **[POSITION_MANAGER.md](./architecture/POSITION_MANAGER.md)** - PositionManager class documentation 🆕
  - Singleton pattern for centralized position state management
  - Observer pattern for position change notifications
  - Multi-layer validation (accuracy, distance, time thresholds)
  - Comprehensive API reference with real-world examples
  - Smart filtering to prevent excessive processing

- **[GEO_POSITION_FUNC_SPEC.md](./architecture/GEO_POSITION_FUNC_SPEC.md)** - GeoPosition functional specification 🆕
  - Language-agnostic functional requirements
  - Codeless specification for multi-language implementation
  - Detailed algorithms and data model
  - Testing requirements and validation rules

- **[WEB_GEOCODING_MANAGER.md](./architecture/WEB_GEOCODING_MANAGER.md)** - WebGeocodingManager class documentation 🆕
  - Main coordinator for geocoding workflow
  - Observer pattern implementation for position/address changes
  - Dependency injection for testing and flexibility
  - Comprehensive API reference with real-world examples
  - Architecture diagram and design patterns explained

- **[WEBGEOCODINGMANAGER_REFACTORING.md](./architecture/WEBGEOCODINGMANAGER_REFACTORING.md)** - WebGeocodingManager refactoring analysis
  - High cohesion and low coupling improvements
  - Design patterns applied (Coordinator, Observer, Dependency Injection)
  - Code quality metrics and architectural improvements
  - Comprehensive documentation of Issue #189

- **[ELEMENT_IDS_CONFIGURATION.md](./architecture/ELEMENT_IDS_CONFIGURATION.md)** - Element IDs configuration 🆕
  - Configurable DOM element IDs for WebGeocodingManager
  - Improves testability and reusability
  - Single source of truth for DOM dependencies

- **[observer-pattern-sequence.md](./architecture/observer-pattern-sequence.md)** - Observer pattern execution flow
  - Position update process
  - Advanced callback-observer combinations
  - Sequence diagrams

### Issue #189 Follow-up

- **[ISSUE_189_README.md](./issue-189/ISSUE_189_README.md)** - Quick navigation guide 🆕
  - Overview of all Issue #189 follow-up documentation
  - Quick reference table
  - Navigation to related files

- **[ISSUE_189_NEXT_STEPS.md](./issue-189/ISSUE_189_NEXT_STEPS.md)** - Issue #189 follow-up work 🆕
  - 5 technical debt items identified from WebGeocodingManager refactoring
  - Detailed specifications for each enhancement opportunity
  - Priority and effort estimations
  - Implementation order recommendations
  - Referential transparency considerations for each item

- **[ISSUE_189_TRACKING.md](./issue-189/ISSUE_189_TRACKING.md)** - Issue creation tracking 🆕
  - Status of issue creation for #189 follow-up items
  - Quick reference table for all 5 technical debt items
  - Progress checklist and success metrics

- **[CREATE_ISSUES_GUIDE.md](./issue-189/CREATE_ISSUES_GUIDE.md)** - Issue creation guide 🆕
  - Ready-to-use issue templates for all 5 technical debt items
  - Step-by-step instructions for creating GitHub issues
  - Complete issue content with proper formatting

- **[ISSUE_189_SUMMARY_FOR_USER.md](./issue-189/ISSUE_189_SUMMARY_FOR_USER.md)** - Summary for repository owner 🆕
  - What was completed
  - Recommended next steps
  - Quick copy-paste labels

### Testing

- **[TESTING.md](../TESTING.md)** - Automated testing documentation
  - Test suite overview (180+ tests across 22 suites)
  - Coverage information (~12% of guia.js, 100% of guia_ibge.js)
  - Running tests: `npm test`, `npm run test:coverage`
  - Immutability pattern tests

- **[JEST_COMMONJS_ES6_GUIDE.md](../.github/JEST_COMMONJS_ES6_GUIDE.md)** - Jest and Module Systems: Critical Analysis 🆕
  - **Essential reading for all contributors and GitHub Copilot**
  - Comprehensive guide to ES6 modules vs CommonJS in Jest
  - Understanding the module system conflict (why tests fail)
  - Three solution strategies (ES6 migration, Babel, dual exports)
  - Step-by-step migration guide from CommonJS to ES6 tests
  - Common errors and troubleshooting
  - Best practices for testing with ES6 modules
  - Decision matrix for choosing the right approach
  - Addresses current test failure issue (19/40 suites failing)
  - **Critical for fixing module system incompatibility**

### Modularization & Code Organization

- **[ES6_IMPORT_EXPORT_BEST_PRACTICES.md](../.github/ES6_IMPORT_EXPORT_BEST_PRACTICES.md)** - ES6 Import/Export System Best Practices Guide 🆕
  - **Essential reference for all ES6 module work**
  - Comprehensive export patterns (named, default, re-exports)
  - Import patterns (named, default, mixed, dynamic)
  - Module organization and naming conventions
  - Common pitfalls and practical solutions
  - HTML integration with `type="module"`
  - Testing considerations for ES6 modules
  - Performance optimization and tree shaking
  - Migration strategies from CommonJS
  - Troubleshooting guide for import/export errors
  - Real-world examples from Phase 16 modularization
  - **Based on actual guia.js modularization experience**

- **[class-extraction/README.md](./class-extraction/README.md)** - Class Extraction Documentation Hub 🆕
  - **Complete guide to class extraction and module splitting efforts**
  - Chronological documentation of Phases 2-16
  - Architecture evolution from monolithic to modular design
  - Functional programming transformation emphasis
  - Before/after code structure comparisons
  - Performance and maintainability improvements
  - Reading guide for new contributors and implementation details

- **[class-extraction/CLASS_LOCATION_GUIDE.md](./class-extraction/CLASS_LOCATION_GUIDE.md)** - Finding Classes After Modularization 🆕
  - **Quick reference table: Old line numbers → New module paths**
  - Directory structure and organization by functionality
  - Import examples (before/after modularization)
  - Test file locations matching source structure
  - Links to all phase documentation (Phases 2-16)
  - Migration tips for updating code references
  - Statistics: 93% reduction from 6,055 to 468 lines

- **[MODULE_SPLITTING_GUIDE.md](./MODULE_SPLITTING_GUIDE.md)** - JavaScript Module Splitting Guide 🆕
  - Understanding JavaScript modules (ES6 vs CommonJS)
  - Benefits of modularization for maintainability and testability
  - Strategies for splitting large files (by layer, feature, responsibility)
  - Maintaining referential transparency in modules
  - Practical examples from Guia.js (6,000+ line file refactoring)
  - Migration strategies (bottom-up, strangler fig pattern)
  - **Jest configuration for ES6 modules** 🔥
  - Testing modular code (unit tests, mocks, integration)
  - Common Jest pitfalls with ES6 modules
  - Best practices and common pitfalls
  - Tools and automation (bundlers, linters, dependency analysis)
  - **GitHub Copilot-optimized format**
  - **Essential for maintainers and contributors**

### Automation & CI/CD

- **[WORKFLOW_SETUP.md](../WORKFLOW_SETUP.md)** - Complete workflow setup guide 🆕
  - Comprehensive GitHub Actions implementation
  - Smart test detection and execution
  - Automatic documentation updates
  - Markdown validation and link checking
  - Best practices and troubleshooting

- **[GITHUB_ACTIONS_GUIDE.md](../.github/GITHUB_ACTIONS_GUIDE.md)** - GitHub Actions workflows guide 🆕
  - Automated file modification workflow
  - Test and documentation updates
  - Coverage reporting
  - Troubleshooting and best practices

- **[Workflows README](../.github/workflows/README.md)** - Technical workflow details 🆕
  - Workflow architecture and jobs
  - Custom composite actions
  - Configuration and customization
  - Integration with existing workflows

### API Integration

- **[NOMINATIM_API_FORMAT.md](./api-integration/NOMINATIM_API_FORMAT.md)** - Nominatim API JSON format documentation 🆕
  - Complete JSON response structure
  - Address object field descriptions
  - Bounding box format
  - Real-world examples from Brazilian addresses
  - Integration with Guia.js
  - Field availability by location type

- **[NOMINATIM_JSON_TESTS.md](./api-integration/NOMINATIM_JSON_TESTS.md)** - Nominatim JSON format tests 🆕
  - Test suite for validating Nominatim API responses
  - Test coverage and examples

- **[OSM_ADDRESS_TRANSLATION.md](./api-integration/OSM_ADDRESS_TRANSLATION.md)** - OSM address tag translation
  - OSM to Brazilian address mapping
  - Priority and fallback chains
  - Usage examples and integration

### Features

- **[DEVICE_DETECTION.md](../DEVICE_DETECTION.md)** - Device detection and accuracy thresholds
  - Mobile vs desktop detection
  - GPS accuracy classification
  - Device-specific configurations

- **[VOICE_SELECTION.md](../VOICE_SELECTION.md)** - Text-to-speech functionality
  - Brazilian Portuguese voice selection
  - Speech synthesis integration
  - Voice preference management

## Contributing & Best Practices

### Configuration & Tools

- **[ESLINT_SETUP.md](./ESLINT_SETUP.md)** - ESLint configuration and "this" keyword rule 🆕
  - ESLint v9 flat config setup
  - Custom rule to disallow "this" keyword
  - Enforces functional programming patterns
  - npm scripts: `npm run lint` and `npm run lint:fix`
  - Refactoring patterns from classes to factory functions
  - 952 errors found (uses of "this" in codebase)

- **[IBIRA_INTEGRATION.md](./IBIRA_INTEGRATION.md)** - ibira.js CDN and local module integration 🆕
  - Three-tier loading strategy (CDN → local module → fallback)
  - jsDelivr CDN configuration (v0.2.2-alpha)
  - API fetching and caching capabilities
  - Observer pattern support
  - Usage examples and troubleshooting
  - Performance optimization tips

### CDN Delivery

- **cdn-delivery.sh** - jsDelivr CDN URL generator script 🆕
  - Generates CDN URLs for all guia.js files
  - Version-specific and branch-based URLs
  - HTML usage examples and ES module imports
  - Commit-specific URLs for immutability
  - SemVer range support (e.g., @0.6 for latest patch)
  - NPM CDN URLs (if published to npm registry)

- **cdn-urls.txt** - Pre-generated CDN URLs reference 🆕
  - Production URLs (version-pinned for stability)
  - Development URLs (auto-updating from branch)
  - HTML and ES module usage examples
  - Quick reference for web integration

### Code Quality Guidelines

- **[CONTRIBUTING.md](../.github/CONTRIBUTING.md)** - Contribution guidelines
  - Code style and best practices
  - **Referential transparency principles** 🆕
  - **Immutability patterns**
  - Testing requirements
  - Pull request process

- **[JAVASCRIPT_BEST_PRACTICES.md](../.github/JAVASCRIPT_BEST_PRACTICES.md)** - JavaScript Best Practices Guide 🆕
  - Core JavaScript principles and patterns
  - Functional programming in JavaScript
  - Pure functions and immutability patterns
  - Modern ES6+ features and syntax
  - Error handling and async programming
  - Code organization and naming conventions
  - Common pitfalls and anti-patterns

- **[JSDOC_GUIDE.md](../.github/JSDOC_GUIDE.md)** - JSDoc Documentation Standards 🆕
  - Required tags for all code (@module, @param, @returns, etc.)
  - Common patterns for classes, functions, and modules
  - Examples by component type (singletons, factories, services)
  - Best practices for type definitions and optional parameters
  - Documentation for immutability and deprecation
  - Tag ordering conventions
  - Performance and testing considerations
  - **GitHub Copilot-optimized format**
  - **Essential reading for all contributors**

- **[JAVASCRIPT_ECMASCRIPT_VERSIONS.md](../.github/JAVASCRIPT_ECMASCRIPT_VERSIONS.md)** - JavaScript and ECMAScript Version Features 🆕
  - Comprehensive summary of features in every JavaScript/ECMAScript version
  - Version timeline from ES1 (1997) to ES2024 (ES15)
  - Practical code examples for each major feature
  - Browser compatibility information
  - Feature support matrix for functional programming
  - Best practices for modern JavaScript
  - **GitHub Copilot-optimized format**
  - **Essential reference for all contributors**

- **[MODULE_SPLITTING_GUIDE.md](./MODULE_SPLITTING_GUIDE.md)** - JavaScript Module Splitting Guide 🆕
  - Understanding JavaScript modules (ES6 vs CommonJS)
  - Benefits of modularization for maintainability and testability
  - Strategies for splitting large files (by layer, feature, responsibility)
  - Maintaining referential transparency in modules
  - Practical examples from Guia.js (6,000+ line file refactoring)
  - Migration strategies (bottom-up, strangler fig pattern)
  - Testing modular code (unit tests, mocks, integration)
  - Best practices and common pitfalls
  - Tools and automation (bundlers, linters, dependency analysis)
  - **GitHub Copilot-optimized format**
  - **Essential for maintainers and contributors**

- **[REFERENTIAL_TRANSPARENCY.md](../.github/REFERENTIAL_TRANSPARENCY.md)** - Comprehensive guide 🆕
  - What is referential transparency and why it matters
  - Pure vs impure functions with examples
  - Best practices for JavaScript
  - Testing referentially transparent code
  - Common pitfalls and solutions
  - **Required reading for all contributors**

- **[CODE_REVIEW_GUIDE.md](../.github/CODE_REVIEW_GUIDE.md)** - Code review checklist 🆕
  - Review process and mindset
  - **Referential transparency checklist**
  - Immutability verification
  - Code quality standards
  - Common issues and solutions

- **[TDD_GUIDE.md](../.github/TDD_GUIDE.md)** - Test Driven Development guide 🆕
  - What is TDD and why it matters
  - Red-Green-Refactor cycle
  - TDD workflow and best practices
  - Integration with referential transparency
  - Examples and common patterns
  - CI/CD integration

- **[UNIT_TEST_GUIDE.md](../.github/UNIT_TEST_GUIDE.md)** - Unit Testing guide 🆕
  - What is unit testing and why it matters
  - Unit testing principles (AAA, isolation, speed)
  - Writing effective unit tests
  - Testing pure functions and referential transparency
  - Mocking and async testing
  - Testing immutability
  - Jest integration and best practices
  - **GitHub Copilot-optimized format**

- **[E2E_TESTING_GUIDE.md](./testing/E2E_TESTING_GUIDE.md)** - End-to-End Testing Guide 🆕
  - Complete user workflow testing
  - 5 E2E test files with 63 test cases
  - Test patterns: user journeys, multi-component coordination, error recovery
  - Writing E2E tests with realistic scenarios
  - Mocking guidelines (external dependencies only)
  - Running and debugging E2E tests
  - Best practices for comprehensive testing

- **[PERFORMANCE_TESTING_GUIDE.md](./testing/PERFORMANCE_TESTING_GUIDE.md)** - Performance Testing Guide 🆕
  - Core Web Vitals (LCP, FID, CLS)
  - Custom application metrics (geolocation, geocoding, rendering)
  - Performance testing tools (DevTools, Lighthouse, custom scripts)
  - Benchmarking with automated suites
  - Optimization strategies (DOM, debouncing, lazy loading, caching, Web Workers)
  - Production monitoring and performance budgets
  - Performance targets: LCP < 2.5s, FID < 100ms, CLS < 0.1

- **[BROWSER_COMPATIBILITY_GUIDE.md](./testing/BROWSER_COMPATIBILITY_GUIDE.md)** - Browser Compatibility Testing 🆕
  - Supported browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
  - Feature support matrix and browser-specific behaviors
  - Testing tools (BrowserStack, DevTools, Playwright)
  - Manual testing checklist for all target browsers
  - Automated cross-browser testing with Playwright
  - Known issues and workarounds (Safari iOS speech, Firefox timing, Chrome accuracy)
  - Mobile-specific considerations and testing

- **[HTML_CSS_JS_SEPARATION.md](../.github/HTML_CSS_JS_SEPARATION.md)** - HTML, CSS, and JavaScript Separation Guide 🆕
  - Separation of concerns in web development
  - The three pillars: Structure, Presentation, and Behavior
  - Benefits: maintainability, reusability, readability, performance
  - Practical file structure recommendations
  - Real-world examples from Guia.js project
  - Common mistakes and anti-patterns
  - Best practices and integration with project standards
  - **Essential for all contributors and end users**

### Architectural Principles

- **[LOW_COUPLING_GUIDE.md](../.github/LOW_COUPLING_GUIDE.md)** - Low coupling principles
  - Dependency management
  - Interface design
  - Module boundaries

- **[HIGH_COHESION_GUIDE.md](../.github/HIGH_COHESION_GUIDE.md)** - High cohesion principles 🆕
  - Single responsibility for components
  - Focused workflows and actions
  - Cohesive documentation structure
  - Real examples from PR #121 refactoring

- **[REFACTORING_SUMMARY.md](../.github/REFACTORING_SUMMARY.md)** - Major refactoring history
  - PR #121: AddressDataExtractor refactoring
  - Design decisions and trade-offs
  - Migration guides

## Issue Templates

When creating issues, use these templates for consistency:

- **[Technical Debt](../.github/ISSUE_TEMPLATE/technical_debt.md)** - Report technical debt
  - Now includes referential transparency considerations 🆕
  
- **[Feature Request](../.github/ISSUE_TEMPLATE/feature_request.md)** - Propose new features
  - Now includes implementation considerations for pure functions 🆕
  
- **[Copilot Issue](../.github/ISSUE_TEMPLATE/copilot_issue.md)** - Report Copilot-related issues
  - Now includes referential transparency guidelines 🆕

- **[GitHub Copilot Test](../.github/ISSUE_TEMPLATE/copilot_test.md)** - Document and track Copilot testing 🆕
  - Test code completions, generations, and suggestions
  - Evaluate quality against project standards
  - Track referential transparency in generated code
  - Document reproducible test scenarios

- **[Documentation](../.github/ISSUE_TEMPLATE/documentation.md)** - Report documentation issues 🆕
  - Request missing documentation or report unclear/outdated content
  - Includes documentation quality checklist

- **[Functional Specification](../.github/ISSUE_TEMPLATE/functional_specification.md)** - Create functional specifications 🆕
  - Codeless, language-agnostic specification format
  - Suitable for AI-supported development (GitHub Copilot, etc.)
  - Based on GEO_POSITION_FUNC_SPEC.md format
  - Comprehensive sections for requirements, data models, use cases, testing

- **[GitHub Configuration](../.github/ISSUE_TEMPLATE/github_config.md)** - Report .github configuration issues 🆕
  - Report workflow, action, or CI/CD issues
  - Request infrastructure improvements
  - Includes environment details and debugging aids
  - References WORKFLOW_SETUP.md for guidance

- **[Agile Ticket](../.github/ISSUE_TEMPLATE/agile-ticket.yml)** - Create actionable Agile tickets 🆕
  - User stories following "As a X, I want Y, so that Z" format
  - Acceptance criteria and Definition of Done
  - Engineering principles integration (referential transparency, TDD, low coupling, high cohesion)
  - Story points estimation using Fibonacci scale
  - Ideal for breaking down functional specifications into implementable tasks
  - Uses GitHub's YAML form syntax for structured data entry

- **[UX Issue](../.github/ISSUE_TEMPLATE/ux_issue.md)** - Report user experience problems 🆕
  - Report usability concerns and UX suggestions
  - Includes steps to reproduce, expected vs actual behavior
  - Screenshots and environment details
  - Severity classification (cosmetic, usability, blocking)

📊 **[Issue Template Comparison](../.github/ISSUE_TEMPLATE_COMPARISON.md)** - Side-by-side comparison of all templates 🆕
  - Detailed analysis of each template's features
  - Common patterns and unique capabilities
  - Guidance on selecting the right template

## Quick Start Guides

### For New Contributors

1. **Read first**:
   - [CONTRIBUTING.md](../.github/CONTRIBUTING.md) - Understand project conventions
   - [HTML_CSS_JS_SEPARATION.md](../.github/HTML_CSS_JS_SEPARATION.md) - Separation of HTML, CSS, and JavaScript
   - [JAVASCRIPT_BEST_PRACTICES.md](../.github/JAVASCRIPT_BEST_PRACTICES.md) - JavaScript coding standards
   - [JSDOC_GUIDE.md](../.github/JSDOC_GUIDE.md) - JSDoc documentation standards 🆕
   - [REFERENTIAL_TRANSPARENCY.md](../.github/REFERENTIAL_TRANSPARENCY.md) - Learn core principles

2. **Before coding**:
   - Review [CODE_REVIEW_GUIDE.md](../.github/CODE_REVIEW_GUIDE.md) checklist
   - Check [CLASS_DIAGRAM.md](./architecture/CLASS_DIAGRAM.md) to understand architecture

3. **Learn testing**:
   - [UNIT_TEST_GUIDE.md](../.github/UNIT_TEST_GUIDE.md) - Unit testing fundamentals
   - [TDD_GUIDE.md](../.github/TDD_GUIDE.md) - Test-driven development workflow
   - [TESTING.md](../TESTING.md) - Project test suite overview

4. **Development workflow**:
   ```bash
   # Validate syntax
   npm run validate
   
   # Run tests
   npm test
   
   # Run tests with coverage
   npm run test:coverage
   
   # Full validation
   npm run test:all
   ```

### For Code Reviewers

1. **Review checklist**: [CODE_REVIEW_GUIDE.md](../.github/CODE_REVIEW_GUIDE.md)
2. **Focus areas**:
   - ✅ Are functions pure (referentially transparent)?
   - ✅ Is state immutable (no direct mutations)?
   - ✅ Are side effects isolated?
   - ✅ Are dependencies explicit?

### For Maintainers

1. **Architecture reference**: [CLASS_DIAGRAM.md](./architecture/CLASS_DIAGRAM.md)
2. **Refactoring history**: [REFACTORING_SUMMARY.md](../.github/REFACTORING_SUMMARY.md)
3. **Design principles**:
   - [REFERENTIAL_TRANSPARENCY.md](../.github/REFERENTIAL_TRANSPARENCY.md)
   - [LOW_COUPLING_GUIDE.md](../.github/LOW_COUPLING_GUIDE.md)
   - [HIGH_COHESION_GUIDE.md](../.github/HIGH_COHESION_GUIDE.md)

## Project Principles

### Core Values 🆕

This project prioritizes:

1. **Referential Transparency**: Functions are pure, deterministic, and free of side effects
2. **Immutability**: Data structures are never modified in place
3. **Testability**: Code is easy to test in isolation
4. **Maintainability**: Clear, predictable code that's easy to understand
5. **Low Coupling**: Components are independent and loosely connected

### Code Quality Standards

- ✅ **Pure functions by default**: Business logic should be referentially transparent
- ✅ **Explicit dependencies**: No hidden global state
- ✅ **Isolated side effects**: I/O operations at boundaries only
- ✅ **Immutable data**: Use spread operators, `filter()`, `map()`, not `push()`, `splice()`
- ✅ **Comprehensive tests**: All new functionality must have tests
- ✅ **Clear documentation**: JSDoc comments for public APIs

## Recent Updates 🆕

### December 2024: Configuration & Integration Documentation

New documentation for project configuration and external integrations:

- ✅ **ESLint Setup**: Configured ESLint v9 with custom rule to disallow "this" keyword
- ✅ **ibira.js Integration**: Added CDN loading with fallback to local module
- ✅ **Documentation Organization**: Moved all root-level docs to `docs/` folder
- ✅ **Test Fixes**: Fixed 12+ test suites with various import/path/mock issues

**Impact**: Better tooling for functional programming enforcement and improved external library integration.

### October 2024: Referential Transparency Documentation

Major documentation update to formalize the project's commitment to functional programming principles:

- ✅ Created comprehensive referential transparency guide
- ✅ Added code review checklist with FP focus
- ✅ Updated contributing guidelines
- ✅ Enhanced all issue templates
- ✅ Created this documentation index

**Impact**: All contributors now have clear guidance on writing pure, testable, maintainable code.

## External Resources

### Functional Programming

- [Professor Frisby's Mostly Adequate Guide](https://mostly-adequate.gitbook.io/)
- [Functional Programming in JavaScript](https://github.com/getify/Functional-Light-JS)
- [Ramda.js - Functional JavaScript Library](https://ramdajs.com/)

### JavaScript Best Practices

- [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

### Testing

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)

## Getting Help

- **Questions about referential transparency?** See [REFERENTIAL_TRANSPARENCY.md](../.github/REFERENTIAL_TRANSPARENCY.md)
- **Questions about contributing?** See [CONTRIBUTING.md](../.github/CONTRIBUTING.md)
- **Questions about architecture?** See [CLASS_DIAGRAM.md](./architecture/CLASS_DIAGRAM.md)
- **Found a bug?** Open an issue using the appropriate template

## Project Information

- **Version**: 0.6.0-alpha (unstable development)
- **License**: ISC (see LICENSE file)
- **Author**: Marcelo Pereira Barbosa
- **Last Updated**: 2026-01-01

---

**Note**: Files marked with 🆕 are newly created or recently updated as part of the referential transparency initiative.
