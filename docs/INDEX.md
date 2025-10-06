# Guia.js Documentation Index

Welcome to the Guia.js documentation! This index provides an overview of all available documentation and guides.

## Core Documentation

### Architecture & Design

- **[CLASS_DIAGRAM.md](./CLASS_DIAGRAM.md)** - Comprehensive overview of the class architecture
  - Design patterns used (Singleton, Observer, Facade, Strategy)
  - Class relationships and responsibilities
  - Refactoring history and rationale
  - Best practices for development

- **[REFERENCE_PLACE.md](./REFERENCE_PLACE.md)** - Reference place type documentation
  - Classification system for locations
  - Type mappings and descriptions
  - Integration with geocoding APIs

- **[GEO_POSITION.md](./GEO_POSITION.md)** - Geographic position data documentation
  - Wrapper for browser GeolocationPosition API
  - GPS accuracy quality classification
  - Distance calculation utilities
  - Integration with position tracking

### Testing

- **[TESTING.md](../TESTING.md)** - Automated testing documentation
  - Test suite overview (180+ tests across 22 suites)
  - Coverage information (~12% of guia.js, 100% of guia_ibge.js)
  - Running tests: `npm test`, `npm run test:coverage`
  - Immutability pattern tests

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

### Architectural Principles

- **[LOW_COUPLING_GUIDE.md](../.github/LOW_COUPLING_GUIDE.md)** - Low coupling principles
  - Dependency management
  - Interface design
  - Module boundaries

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

- **[Documentation](../.github/ISSUE_TEMPLATE/documentation.md)** - Report documentation issues 🆕
  - Request missing documentation or report unclear/outdated content
  - Includes documentation quality checklist

📊 **[Issue Template Comparison](./ISSUE_TEMPLATE_COMPARISON.md)** - Side-by-side comparison of all templates 🆕
  - Detailed analysis of each template's features
  - Common patterns and unique capabilities
  - Guidance on selecting the right template

## Quick Start Guides

### For New Contributors

1. **Read first**:
   - [CONTRIBUTING.md](../.github/CONTRIBUTING.md) - Understand project conventions
   - [REFERENTIAL_TRANSPARENCY.md](../.github/REFERENTIAL_TRANSPARENCY.md) - Learn core principles

2. **Before coding**:
   - Review [CODE_REVIEW_GUIDE.md](../.github/CODE_REVIEW_GUIDE.md) checklist
   - Check [CLASS_DIAGRAM.md](./CLASS_DIAGRAM.md) to understand architecture

3. **Development workflow**:
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

1. **Architecture reference**: [CLASS_DIAGRAM.md](./CLASS_DIAGRAM.md)
2. **Refactoring history**: [REFACTORING_SUMMARY.md](../.github/REFACTORING_SUMMARY.md)
3. **Design principles**:
   - [REFERENTIAL_TRANSPARENCY.md](../.github/REFERENTIAL_TRANSPARENCY.md)
   - [LOW_COUPLING_GUIDE.md](../.github/LOW_COUPLING_GUIDE.md)

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
- **Questions about architecture?** See [CLASS_DIAGRAM.md](./CLASS_DIAGRAM.md)
- **Found a bug?** Open an issue using the appropriate template

## Project Information

- **Version**: 0.8.5-alpha (unstable development)
- **License**: See repository root
- **Author**: Marcelo Pereira Barbosa

---

**Note**: Files marked with 🆕 are newly created or recently updated as part of the referential transparency initiative.
