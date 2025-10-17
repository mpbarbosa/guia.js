# Guia.js Documentation Index

Welcome to the Guia.js documentation! This index provides an overview of all available documentation and guides.

## Core Documentation

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

- **[JEST_COMMONJS_ES6_GUIDE.md](./JEST_COMMONJS_ES6_GUIDE.md)** - Jest and Module Systems: Critical Analysis 🆕
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

- **[ES6_IMPORT_EXPORT_BEST_PRACTICES.md](./ES6_IMPORT_EXPORT_BEST_PRACTICES.md)** - ES6 Import/Export System Best Practices Guide 🆕
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

- **[MODULE_SPLITTING_SUMMARY.md](./MODULE_SPLITTING_SUMMARY.md)** - Module Splitting Implementation Summary 🆕
  - Implementation results and metrics
  - Test compatibility analysis (93.7% pass rate)
  - ES6 module migration impact
  - Future work and recommendations
  - Risk assessment and mitigations

### Automation & CI/CD

- **[WORKFLOW_SETUP.md](../WORKFLOW_SETUP.md)** - Complete workflow setup guide 🆕
  - Comprehensive GitHub Actions implementation
  - Smart test detection and execution
  - Automatic documentation updates
  - Markdown validation and link checking
  - Best practices and troubleshooting

- **[GITHUB_ACTIONS_GUIDE.md](./github/GITHUB_ACTIONS_GUIDE.md)** - GitHub Actions workflows guide 🆕
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
  - Performance and testing considerations
  - **GitHub Copilot-optimized format**
  - **Essential reading for all contributors**

- **[JAVASCRIPT_ECMASCRIPT_VERSIONS.md](./JAVASCRIPT_ECMASCRIPT_VERSIONS.md)** - JavaScript and ECMAScript Version Features 🆕
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

📊 **[Issue Template Comparison](./github/ISSUE_TEMPLATE_COMPARISON.md)** - Side-by-side comparison of all templates 🆕
  - Detailed analysis of each template's features
  - Common patterns and unique capabilities
  - Guidance on selecting the right template

## Quick Start Guides

### For New Contributors

1. **Read first**:
   - [CONTRIBUTING.md](../.github/CONTRIBUTING.md) - Understand project conventions
   - [HTML_CSS_JS_SEPARATION.md](../.github/HTML_CSS_JS_SEPARATION.md) - Separation of HTML, CSS, and JavaScript
   - [JAVASCRIPT_BEST_PRACTICES.md](../.github/JAVASCRIPT_BEST_PRACTICES.md) - JavaScript coding standards
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

- **Version**: 0.8.5-alpha (unstable development)
- **License**: See repository root
- **Author**: Marcelo Pereira Barbosa

---

**Note**: Files marked with 🆕 are newly created or recently updated as part of the referential transparency initiative.
