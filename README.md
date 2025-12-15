# Guia.js - Brazilian Geolocation Web Application

[![Tests](https://img.shields.io/badge/tests-1224%20passing-brightgreen)](https://github.com/mpbarbosa/guia_js)
[![Coverage](https://img.shields.io/badge/coverage-70%25-yellow)](https://github.com/mpbarbosa/guia_js)
[![License](https://img.shields.io/badge/license-ISC-blue)](https://github.com/mpbarbosa/guia_js)

A JavaScript-based geolocation web application (version 0.5.0-alpha) providing geolocation services, address geocoding, and mapping integration specifically designed for Brazilian addresses. Features DOM manipulation, OpenStreetMap/Nominatim API integration, and speech synthesis capabilities.

## ✨ Key Features

- 🌍 **Brazilian Address Geocoding** - Specialized support for Brazilian address formats and IBGE integration
- 📍 **Geolocation Services** - Browser-based geolocation with GPS accuracy classification
- 🗺️ **OpenStreetMap Integration** - Reverse geocoding using Nominatim API
- 🎤 **Speech Synthesis** - Brazilian Portuguese text-to-speech support
- 📱 **Device Detection** - Mobile vs desktop with accuracy thresholds
- 🧪 **Comprehensive Testing** - 1224+ tests with 70% code coverage
- ⚙️ **Functional Programming** - Referential transparency and immutability patterns

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ (tested with v20.19.5)
- npm v10+
- Python 3.11+ (for web server during development)
- Modern browser with Geolocation API support

### Installation

```bash
# Clone the repository
git clone https://github.com/mpbarbosa/guia_js.git
cd guia_js

# Install dependencies (299 packages, ~20 seconds)
npm install

# Validate JavaScript syntax (<1 second)
npm run validate

# Run test suite (1224 tests, ~5 seconds)
npm test

# Run tests with coverage (~6 seconds)
npm run test:coverage

# Full validation: syntax + tests (~10 seconds)
npm run test:all
```

### Running the Application

```bash
# Start development web server (runs indefinitely)
python3 -m http.server 9000

# Access the application
# Open http://localhost:9000/test.html in your browser
```

### Quick Validation

```bash
# Node.js execution test (<1 second)
node src/guia.js
# Expected output: [timestamp] Guia.js version: 0.5.0-alpha

# Code linting (ESLint v9 flat config)
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

## 📁 Project Structure

```
guia_js/
├── src/                          # Source code (ES6 modules)
│   ├── guia.js                   # Main application (2288 lines)
│   ├── guia_ibge.js              # IBGE integration utilities
│   ├── core/                     # Core classes (Singletons, Managers)
│   ├── data/                     # Data processing and extraction
│   ├── html/                     # HTML display and DOM manipulation
│   ├── speech/                   # Speech synthesis functionality
│   └── utils/                    # Utility functions
├── __tests__/                    # Test suites (57 passing suites)
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   ├── features/                 # Feature tests
│   ├── external/                 # External API tests
│   └── managers/                 # Manager class tests
├── tests/                        # Additional test files
├── docs/                         # Documentation hub
│   ├── INDEX.md                  # Complete documentation index
│   ├── architecture/             # Architecture documentation
│   ├── api-integration/          # API integration guides
│   ├── class-extraction/         # Modularization history
│   ├── issue-189/                # Issue #189 follow-up docs
│   └── prompts/                  # Workflow prompts and guides
├── .github/                      # GitHub configuration
│   ├── CONTRIBUTING.md           # Contribution guidelines
│   ├── JAVASCRIPT_BEST_PRACTICES.md
│   ├── REFERENTIAL_TRANSPARENCY.md
│   ├── workflows/                # CI/CD workflows
│   └── ISSUE_TEMPLATE/           # Issue templates
├── examples/                     # Usage examples
├── eslint.config.js              # ESLint v9 flat configuration
├── package.json                  # Node.js project configuration
├── cdn-delivery.sh               # CDN URL generator script
├── cdn-urls.txt                  # Pre-generated CDN URLs
└── *.html                        # Test pages and demos
```

## 🧪 Testing

### Test Suite Overview

- **Total Tests**: 1224 passing tests
- **Test Suites**: 57 passing suites (5 skipped)
- **Execution Time**: ~5 seconds
- **Code Coverage**: ~70% on main codebase
- **Coverage Details**:
  - guia.js: 69.56% statements, 43.75% branches
  - guia_ibge.js: 100% coverage

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose

# Full validation (syntax + tests)
npm run test:all
```

### Test Categories

- **Unit Tests**: Individual component testing with mocks
- **Integration Tests**: Multi-component interaction testing
- **Feature Tests**: End-to-end feature validation
- **Immutability Tests**: Verifying referential transparency patterns
- **API Tests**: External API integration validation

## 📚 Documentation

### Essential Reading for Contributors

1. **[Documentation Index](docs/INDEX.md)** - Complete documentation hub
2. **[Contributing Guide](.github/CONTRIBUTING.md)** - Code style and submission process
3. **[JavaScript Best Practices](.github/JAVASCRIPT_BEST_PRACTICES.md)** - Coding standards
4. **[Referential Transparency Guide](.github/REFERENTIAL_TRANSPARENCY.md)** - Functional programming principles

### Architecture Documentation

- **[Class Diagram](docs/architecture/CLASS_DIAGRAM.md)** - System architecture overview
- **[GeoPosition](docs/architecture/GEO_POSITION.md)** - GPS position wrapper documentation
- **[PositionManager](docs/architecture/POSITION_MANAGER.md)** - Position state management
- **[WebGeocodingManager](docs/architecture/WEB_GEOCODING_MANAGER.md)** - Main coordinator documentation

### Development Guides

- **[Module Splitting Guide](docs/MODULE_SPLITTING_GUIDE.md)** - Modularization strategies
- **[ES6 Import/Export Best Practices](.github/ES6_IMPORT_EXPORT_BEST_PRACTICES.md)** - Module patterns
- **[TDD Guide](.github/TDD_GUIDE.md)** - Test-driven development
- **[Unit Test Guide](.github/UNIT_TEST_GUIDE.md)** - Unit testing fundamentals

### Configuration & Tools

- **[ESLint Setup](docs/ESLINT_SETUP.md)** - Linter configuration with custom rules
- **[Workflow Setup](docs/WORKFLOW_SETUP.md)** - GitHub Actions and CI/CD
- **[Jest & Module Systems](.github/JEST_COMMONJS_ES6_GUIDE.md)** - Testing module configurations

## 🏗️ Core Architecture

### Main Classes

#### Core Layer (Singletons & Managers)
- `PositionManager` - Centralized position state with observer pattern
- `SingletonStatusManager` - Cross-component status management
- `GeolocationService` - Browser geolocation API wrapper
- `WebGeocodingManager` - Main coordination and workflow management

#### Data Processing Layer
- `GeoDataParser` - Parse geographic data from APIs
- `GeoDataExtractor` - Extract structured data from raw responses
- `GeoDataValidator` - Validate data integrity
- `BrazilianStandardAddress` - Brazilian address standardization
- `AddressDataExtractor` - Address data extraction with caching

#### API Integration Layer
- `APIFetcher` - Base class for API communications
- `ReverseGeocoder` - OpenStreetMap/Nominatim integration
- IBGE API integration for Brazilian location data

#### Display Layer
- `HTMLPositionDisplayer` - Coordinate display and Google Maps links
- `HTMLAddressDisplayer` - Address formatting and presentation
- `DisplayerFactory` - Factory pattern for display component creation

#### Speech Synthesis Layer
- `SpeechSynthesisManager` - Text-to-speech coordination
- `SpeechQueue` - Queue management for speech items
- `SpeechItem` - Individual speech item representation

### Design Patterns Used

- **Singleton Pattern** - PositionManager, StatusManager
- **Observer Pattern** - Position and address change notifications
- **Facade Pattern** - Simplified API access
- **Strategy Pattern** - Configurable display strategies
- **Factory Pattern** - Display component creation

## 🔌 API Integrations

### OpenStreetMap Nominatim

```javascript
// Reverse geocoding endpoint
https://nominatim.openstreetmap.org/reverse
  ?format=json
  &lat=-23.550520
  &lon=-46.633309
```

**Documentation**: [Nominatim API Format](docs/api-integration/NOMINATIM_API_FORMAT.md)

### IBGE (Brazilian Institute of Geography and Statistics)

```javascript
// State data endpoint
https://servicodados.ibge.gov.br/api/v1/localidades/estados/
```

**Documentation**: [IBGE Integration](docs/IBIRA_INTEGRATION.md)

### Google Maps Integration

- Map viewing links
- Street View integration
- Directions and routing (external)

## 📦 CDN Delivery

Guia.js can be delivered via jsDelivr CDN for easy integration into web projects.

### Generate CDN URLs

```bash
# Run the CDN delivery script
./cdn-delivery.sh

# Generates cdn-urls.txt with all available CDN URLs
```

### Quick CDN Integration

```html
<!-- Production (recommended - specific version) -->
<script src="https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@0.5.0-alpha/src/guia.js"></script>

<!-- ES Module import -->
<script type="module">
  import { WebGeocodingManager } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@0.5.0-alpha/src/guia.js';
  // Use the module...
</script>
```

### CDN Features

- ✅ **Global Distribution** - 750+ CDN locations worldwide
- ✅ **Version Pinning** - Lock to specific version for production
- ✅ **Automatic Optimization** - Brotli/Gzip compression
- ✅ **HTTP/2 & HTTP/3** - Modern protocol support
- ✅ **Zero Config** - No build step required

**Files**: 
- `cdn-delivery.sh` - Generate CDN URLs with current version
- `cdn-urls.txt` - Pre-generated CDN URLs for quick reference

## ⚙️ Configuration

### ESLint Configuration

```javascript
// eslint.config.js - ESLint v9 flat config
export default [
  {
    rules: {
      'no-invalid-this': 'error', // Enforces functional programming
      // ... additional rules
    }
  }
];
```

### Jest Configuration

```json
{
  "testEnvironment": "node",
  "transform": {},
  "testMatch": ["**/__tests__/**/*.js", "**/*.test.js"]
}
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Code Quality Standards

- ✅ **Functional Programming** - Use pure functions and immutability
- ✅ **Referential Transparency** - Functions return same output for same input
- ✅ **No Direct Mutations** - Use spread operators, filter(), map() instead of push(), splice()
- ✅ **Comprehensive Tests** - Write tests for all new functionality
- ✅ **Documentation** - Update docs for API changes

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Write tests first** (TDD approach recommended)
4. **Implement your feature**
5. **Run validation**: `npm run test:all`
6. **Run linter**: `npm run lint:fix`
7. **Commit changes**: Use conventional commits (feat:, fix:, docs:, test:)
8. **Push to your fork**: `git push origin feature/your-feature`
9. **Create a Pull Request**

### Commit Message Format

```bash
# Feature
feat: Add Brazilian city statistics API integration

# Bug fix
fix: Correct null reference error in PositionManager

# Documentation
docs: Update architecture diagram with new classes

# Tests
test: Add integration tests for AddressDataExtractor

# Refactoring
refactor: Extract speech synthesis to separate module

# Chores
chore: Update dependencies to latest versions
```

### Before Submitting PR

```bash
# Ensure all checks pass
npm run validate      # Syntax validation
npm run test:all      # All tests pass
npm run lint          # No linting errors
npm run test:coverage # Coverage maintained or improved
```

## 📋 Project Principles

### Functional Programming Focus

This project emphasizes functional programming principles:

1. **Referential Transparency** - Functions are pure and predictable
2. **Immutability** - Data structures are never modified in place
3. **Explicit Dependencies** - No hidden global state
4. **Isolated Side Effects** - I/O operations at boundaries only
5. **Low Coupling** - Components are independent
6. **High Cohesion** - Each module has single responsibility

**Learn More**: [Referential Transparency Guide](.github/REFERENTIAL_TRANSPARENCY.md)

## 🐛 Known Issues & Limitations

### Browser Dependencies
- Full functionality requires modern browser with Geolocation API support
- Location permissions must be granted by user
- HTTPS required in production (localhost works for development)

### Missing Implementations
- `findNearbyRestaurants()` function is stubbed but not implemented
- City statistics functionality is partially implemented
- Some API error handling could be enhanced

### Testing Warnings
- Worker process warning about timer cleanup (expected, not blocking)
- 5 test suites intentionally skipped (work in progress)
- Verbose console output in tests (expected behavior for logging tests)

## 🔧 Troubleshooting

### Common Issues

**Tests fail with module errors:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Web server port conflicts:**
```bash
# Use different port
python3 -m http.server 8000
```

**Geolocation not working:**
- Ensure HTTPS or localhost (browsers require secure context)
- Grant location permissions when prompted
- Check browser console for errors

**ESLint errors about "this" keyword:**
```bash
# This is intentional - project enforces functional programming
# Refactor code to use factory functions instead of classes
```

## 📊 Project Statistics

- **Lines of Code**: ~2300+ (main application)
- **Test Coverage**: 70% (statements), 44% (branches)
- **Test Count**: 1224 passing tests
- **Dependencies**: 2 runtime, 2 dev dependencies
- **Supported Node.js**: v18+
- **ES Module Type**: ESM (ECMAScript Modules)

## 📄 License

ISC License - See repository for details

## 👥 Authors

- Marcelo Pereira Barbosa

## 🔗 Related Projects

- **[ibira.js](https://github.com/mpbarbosa/ibira.js)** - Brazilian geolocation utilities library

## 🎯 Roadmap

### Upcoming Features
- Complete restaurant search implementation
- Enhanced city statistics functionality
- Improved error handling for API failures
- Performance optimizations
- Additional Brazilian data sources

### Technical Debt
- Migrate remaining class-based code to functional patterns
- Increase test coverage to 90%+
- Complete API error recovery mechanisms
- Add end-to-end browser tests

**Track Progress**: See [Issue #189 Follow-up](docs/issue-189/ISSUE_189_README.md)

## 📞 Support

- **Documentation**: [docs/INDEX.md](docs/INDEX.md)
- **Issues**: [GitHub Issues](https://github.com/mpbarbosa/guia_js/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mpbarbosa/guia_js/discussions)

---

**Version**: 0.5.0-alpha (unstable development)  
**Status**: Active Development  
**Last Updated**: December 2024
