# Guia Turístico - Tourist Guide Web Application

---

Last Updated: 2026-02-23
Status: Active
version: 0.12.4-alpha

---

[![Tests](https://img.shields.io/badge/tests-3074%20passing%20%2F%203242%20total-green)](https://github.com/mpbarbosa/guia_turistico)
[![Version](https://img.shields.io/badge/version-0.11.7--alpha-blue)](https://github.com/mpbarbosa/guia_turistico)
[![License](https://img.shields.io/badge/license-ISC-blue)](https://github.com/mpbarbosa/guia_turistico)

> **Note on Test Status**: 3,074 tests pass successfully out of 3,242 total (168 skipped, 0 failing), with 122 of 127 test suites passing (5 skipped). The test suite is stable with 100% pass rate. See the Testing section below for details.

A single-page web application (SPA) for tourist guidance, built on top of the [guia.js](https://github.com/mpbarbosa/guia_js) geolocation library. This application provides an interactive tourist guide experience with geolocation services, address geocoding, and mapping integration specifically designed for Brazilian addresses.

## 🎯 Project Overview

**Guia Turístico** is a web application that uses the **guia.js** library to provide:

- Tourist location services
- Address-based navigation
- Brazilian location information
- Interactive SPA routing
- Mobile-responsive interface

**Dependency**: This project depends on [guia.js](https://github.com/mpbarbosa/guia_js) - the core geolocation library.

> **Note**: This repository is `guia_turistico` (the web application). The `guia.js` library is a separate dependency from [github.com/mpbarbosa/guia_js](https://github.com/mpbarbosa/guia_js).

## ✨ Key Features

- 🗺️ **Single-Page Application** - Modern SPA with client-side routing
- 📍 **Real-Time Location Tracking** - Primary feature: continuous location monitoring while navigating
- 🌍 **Powered by guia.js** - Uses guia.js library for geolocation functionality
- 🇧🇷 **Brazilian Focus** - Specialized support for Brazilian locations via IBGE integration
- 📊 **IBGE SIDRA Integration** - Population statistics and demographic data display (v0.9.0+)
- 📱 **Mobile-First Design** - Responsive interface optimized for mobile devices
- 🎨 **Material Design 3** - Modern UI following Material Design guidelines
- ♿ **Accessibility** - WCAG 2.1 compliant with ARIA support
- 🔧 **Coordinate Converter** - Secondary utility: convert coordinates to addresses

### ✨ Latest Features (v0.9.0-alpha)

#### 🔘 Contextual Button Status Messages

Smart status messages for disabled buttons, reducing user confusion:

```javascript
// Initially disabled
"Aguardando localização para habilitar"

// After location is obtained
"Pronto para usar"
```

**Benefits**:

- Clear explanation for disabled buttons
- WCAG 2.1 AA accessible with ARIA attributes
- Color-coded status types (info, warning, success, error)
- Automatic screen reader announcements

**Implementation** (`src/utils/button-status.js`):

```javascript
import { disableWithReason, enableWithMessage, BUTTON_STATUS_MESSAGES } from '../utils/button-status.js';

// Disable with explanation
disableWithReason(button, "Aguardando localização para habilitar");

// Enable with success message
enableWithMessage(button, "Pronto para usar");
```

#### 🌆 Metropolitan Region Display

Automatically displays metropolitan region context for municipalities in metropolitan areas:

```
┌─────────────────────────────────────┐
│ Município                            │
│ Região Metropolitana do Recife      │  ← NEW!
│ Recife, PE                          │
└─────────────────────────────────────┘
```

**Benefits**:

- Better geographic context for users
- Extracted from Nominatim `county` field
- Supports 9 major Brazilian metropolitan regions
- 77 comprehensive tests ensuring reliability

#### 🗺️ State Abbreviation Display

Enhanced geographic context with state codes:

| Before | Now ✨ |
|--------|--------|
| "Recife" | "Recife, PE" |
| "São Paulo" | "São Paulo, SP" |
| "Salvador" | "Salvador, BA" |

**Coverage**: All 26 Brazilian states + Federal District

📚 **Learn More**: See [FEATURE_BUTTON_STATUS_MESSAGES.md](./docs/user/features/FEATURE_BUTTON_STATUS_MESSAGES.md), [FEATURE_METROPOLITAN_REGION_DISPLAY.md](./docs/user/features/FEATURE_METROPOLITAN_REGION_DISPLAY.md), and [FEATURE_MUNICIPIO_STATE_DISPLAY.md](./docs/user/features/FEATURE_MUNICIPIO_STATE_DISPLAY.md) for complete details.

## 🚀 Quick Start

### Prerequisites

- **Node.js v20.19.0+** (tested with v20.19.5 and v25.4.0)
- **npm v10+** (tested with v10.5.0 and v11.8.0)
- **Python 3.11+** (for web server during development)
- **Git** (for version control and CDN script)
- **Modern browser** with Geolocation API support (Chrome 90+, Firefox 88+, Safari 14+)

**Verify Your Environment**:

```bash
# Check Node.js version
node --version
# Should output: v20.19.0 or higher (tested up to v25.4.0)

# Check npm version
npm --version
# Should output: v10.x.x or higher

# Check Python version
python3 --version
# Should output: Python 3.11.x or higher

# Check Git
git --version
# Should output: git version 2.x.x or higher
```

**Installation Help**:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm python3 git

# macOS (with Homebrew)
brew install node python@3.11 git

# Windows (with Chocolatey)
choco install nodejs python git
```

### Installation

```bash
# Clone the repository
git clone https://github.com/mpbarbosa/guia_turistico.git
cd guia_turistico

# Install dependencies (includes guia.js library and Vite)
npm install

# Validate JavaScript syntax (<1 second)
npm run validate

# Run test suite (3,242 total tests, 3,074 passing, 168 skipped, ~65 seconds)
npm test

# Run tests with coverage (~30 seconds)
npm run test:coverage

# Full validation: syntax + tests (~30 seconds total)
npm run test:all
```

> **Note**: Test execution times may vary by 1-2 seconds depending on system performance and available resources.

### Running the Application

#### Development Mode (Recommended)

```bash
# Start Vite development server with HMR (hot module replacement)
npm run dev

# Server starts at http://localhost:9000
# Opens automatically in your browser
# Features: Fast refresh, hot module replacement, instant feedback
```

#### Production Build

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview

# Production build output in dist/ folder
```

#### Legacy Mode (Python Server)

```bash
# Start development web server (runs indefinitely)
python3 -m http.server 9000

# Access the application
# Open http://localhost:9000/src/index.html in your browser
```

**Development Workflow**:

- Use `npm run dev` for active development (HMR, fast refresh)
- Use `npm run build` before deployment to production
- Use `npm run preview` to test production build locally

**⚠️ Production Deployment**: Ensure the entire `dist/` folder is deployed, including the `dist/libs/sidra/` directory. See [DEPLOYMENT_GUIDE.md](docs/guides/DEPLOYMENT_GUIDE.md) for details.

### Quick Validation

```bash
# Node.js execution test (<1 second)
node src/app.js
# Expected output: Application initialization messages

# Code linting (ESLint v9 flat config)
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Utility Scripts

The project includes several automation and validation scripts accessible via npm:

```bash
# Version & Consistency Checks
npm run check:version        # Verify version consistency across files
npm run check:references     # Check for broken documentation references
npm run check:terminology    # Validate terminology consistency

# Documentation Updates
npm run update:dates         # Update "Last Updated" metadata in docs
npm run update:tests         # Update test count documentation
npm run update:badges        # Update README badges

# CDN & Distribution
npm run cdn:generate         # Generate jsDelivr CDN URLs

# CI/CD Testing
npm run ci:test-local        # Simulate GitHub Actions workflow locally

# API Documentation
npm run docs:generate        # Generate JSDoc API documentation
npm run docs:serve           # Serve docs on http://localhost:8080

# Visual Testing
npm run test:visual          # Run Selenium visual hierarchy tests
```

> **Tip**: Run `npm run ci:test-local` before pushing to catch issues early.

#### Shell Scripts (`scripts/`)

The `scripts/` directory contains standalone shell scripts for maintenance, deployment, and automation tasks:

| Script | Purpose | Arguments | Related modules |
|--------|---------|-----------|-----------------|
| `scripts/fix-console-logging.sh` | Replace direct `console.*` calls with centralized logger | *(none)* | `src/utils/logger.js` |
| `scripts/update-doc-dates.sh` | Update "Last Updated" dates in git-modified `.md` files | *(none)* | `docs/` |
| `scripts/update-test-counts.sh` | Sync test count statistics across documentation after test runs | *(none)* | `README.md`, `docs/INDEX.md`, `.github/copilot-instructions.md` |
| `scripts/deploy-preflight.sh` | Production deployment pre-flight checklist (build + file checks + live smoke test) | *(none)* | `dist/`, `libs/sidra/tab6579_municipios.json`, `vite.config.js` |
| `scripts/build_and_deploy.sh` | Build production bundle and push to staging via sibling repo | `-h`, `--help` | `dist/`, `../mpbarbosa_site/shell_scripts/sync_to_staging.sh` |
| `scripts/cleanup-ai-workflow.sh` | Remove old `.ai_workflow/` run artifact directories and local build/test caches | `--days N`, `--dry-run` | `.ai_workflow/`, `.jest-cache/`, `coverage/` |

```bash
# Replace console.log/warn/error with centralized logger across src/
./scripts/fix-console-logging.sh

# Update "Last Updated" dates in all currently git-modified .md files
./scripts/update-doc-dates.sh

# Run tests and update passing/total counts in README and docs
./scripts/update-test-counts.sh

# Verify build, dist/ contents, and SIDRA JSON before production deploy
./scripts/deploy-preflight.sh

# Show help for build/deploy script
./scripts/build_and_deploy.sh --help

# Build and push to staging (requires ../mpbarbosa_site sibling repo)
./scripts/build_and_deploy.sh

# Preview what old .ai_workflow/ runs would be removed (safe, no deletions)
./scripts/cleanup-ai-workflow.sh --dry-run

# Remove workflow artifact directories older than 14 days
./scripts/cleanup-ai-workflow.sh --days 14
```

For full details on each script — including executable permissions, shebangs, environment variables, exit codes, workflow relationships, and CI/CD integration — see [`scripts/README.md`](./scripts/README.md).

> **Integration tests**: `tests/integration/run_visual_hierarchy_tests.sh` starts a local HTTP server and runs Selenium-based visual hierarchy tests. See [`scripts/README.md`](./scripts/README.md) for full documentation.
> **CI/CD note**: These scripts are **local developer tools**. GitHub Actions workflows in `.github/workflows/` automate equivalent operations (badge updates, test-count sync, doc linting) on push/PR. For CI helper scripts used inside workflows, see [`.github/scripts/`](./.github/scripts/).
> **Permissions**: All scripts ship executable (`chmod +x`). If lost after cloning, restore with `chmod +x scripts/*.sh`.
> **Entry point**: Scripts use `#!/bin/bash` and must be invoked as `./scripts/<name>.sh` or `bash scripts/<name>.sh`, not `sh`.
> **Error handling**: All scripts use `set -e` — any failing command exits immediately with code 1. None require external environment variables.

#### GitHub CI/CD Helper Scripts (`.github/scripts/`)

These scripts are invoked by GitHub Actions workflows and by the `npm run ci:test-local` / `npm run cdn:generate` npm aliases. They can also be run directly from the project root:

| Script | Purpose |
|---|---|
| `bump-sw-cache.sh` | Updates `CACHE_NAME` in `service-worker.js` with current version, date, and git SHA |
| `cdn-delivery.sh` | Generates jsDelivr CDN URLs for the current version; output saved to `cdn-urls.txt` |
| `change-type-detector.sh` | Detects change type from Conventional Commit messages (used by workflow routing) |
| `check-references.sh` | Validates internal file references in docs; filters known false-positive patterns |
| `check-terminology.sh` | Validates documentation against the project terminology guide |
| `check-version-consistency.sh` | Verifies version numbers are consistent across all files; `--fix` flag auto-corrects |
| `test-change-type-detection.sh` | Test suite for the change-type detector (all Conventional Commit scenarios) |
| `test-conditional-execution.sh` | Test suite for the workflow condition evaluator |
| `test-workflow-locally.sh` | Simulates the GitHub Actions workflow locally; run before pushing to catch CI failures |
| `update-badges.sh` | Extracts test/coverage results from `npm test` output and updates README badges |
| `update-doc-metadata.sh` | Adds or updates "Last Updated" metadata in documentation files |
| `update-version-references.sh` | Propagates the version from `package.json` to all version reference points |
| `validate-cross-references.sh` | Validates internal hyperlinks in documentation files |
| `validate-jsdom-update.sh` | Validates jsdom upgrade compatibility (run after bumping `jsdom` devDependency) |
| `workflow-condition-evaluator.sh` | Evaluates conditional execution rules from `.workflow-config.yaml` |

## 📁 Project Structure

This section provides a quick reference to the project's directory organization. For a complete directory tree and detailed file organization, see [PROJECT_STRUCTURE.md](./docs/developer/PROJECT_STRUCTURE.md). For architectural details and design decisions, see [PROJECT_PURPOSE_AND_ARCHITECTURE.md](./docs/architecture/PROJECT_PURPOSE_AND_ARCHITECTURE.md).

```
guia_turistico/
├── src/                          # Source code (ES6 modules)
│   ├── app.js                    # Main application entry point (550+ lines)
│   ├── guia.js                   # guia.js library exports (468 lines)
│   ├── guia_ibge.js              # IBGE integration utilities
│   ├── index.html                # Main HTML page for SPA
│   ├── core/                     # Core classes (Singletons, Managers)
│   ├── data/                     # Data processing and extraction
│   ├── html/                     # HTML display and DOM manipulation
│   ├── speech/                   # Speech synthesis functionality
│   ├── views/                    # SPA view controllers (home, converter)
│   └── utils/                    # Utility functions
├── __tests__/                    # Test suites (127 suites, 3,074 passing)
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   ├── e2e/                      # End-to-end tests (Puppeteer)
│   ├── features/                 # Feature tests
│   ├── external/                 # External API tests
│   └── managers/                 # Manager class tests
├── tests/                        # Python/Playwright cross-browser tests
│   └── e2e/                      # E2E tests (Chrome, Firefox, Safari)
├── docs/                         # Documentation hub
│   ├── INDEX.md                  # Complete documentation index
│   ├── architecture/             # Architecture documentation
│   ├── api-integration/          # API integration guides
│   ├── class-extraction/         # Modularization history
│   ├── testing/                  # Test infrastructure documentation
│   ├── issue-189/                # Issue #189 follow-up docs
│   └── prompts/                  # Workflow prompts and guides
├── .github/                      # GitHub configuration
│   ├── CONTRIBUTING.md           # Contribution guidelines
│   ├── JAVASCRIPT_BEST_PRACTICES.md
│   ├── REFERENTIAL_TRANSPARENCY.md
│   ├── workflows/                # CI/CD workflows
│   ├── scripts/                  # Automation scripts
│   └── ISSUE_TEMPLATE/           # Issue templates
├── .husky/                       # Git hooks (pre-commit, pre-push)
├── examples/                     # Usage examples
├── libs/                         # Offline data libraries (SIDRA)
├── eslint.config.js              # ESLint v9 flat configuration
├── package.json                  # Node.js project configuration
├── .github/scripts/cdn-delivery.sh               # CDN URL generator script
├── cdn-urls.txt                  # Pre-generated CDN URLs
└── *.html                        # Test pages and demos
```

## 💡 Usage Examples

The `examples/` directory contains working demonstrations of key functionality:

### Available Examples

1. **geoposition-immutability-demo.js** - Demonstrates referential transparency principles:
   - Pure constructor without side effects
   - Immutability through defensive copying
   - Deterministic pure methods
   - Static pure functions

2. **geolocation-service-demo.js** - Shows GeolocationService usage patterns

3. **jest-esm-migration-example.js** - Example of Jest with ES modules configuration

### Running Examples

```bash
# Run from project root
node examples/geoposition-immutability-demo.js

# Run geolocation service demo
node examples/geolocation-service-demo.js
```

See [examples/README.md](examples/README.md) for detailed documentation and expected outputs.

## 🧪 Testing

### Test Suite Overview

- **Total Tests**: 3,242 total (3,074 passing, 168 skipped, 0 failing)
- **Test Suites**: 127 total (122 passing, 5 skipped, 0 failing)
- **Test Count**: 3,074 passing tests (3,242 total with 168 skipped)
- **Execution Time**: ~65 seconds
- **Code Coverage**: 76% overall (exceeds 65% threshold by 11%)
  - Statements: 76%, Branches: 74.2%, Functions: 70.7%, Lines: 76.5%
  - Critical modules at 100%: DisplayerFactory, HTMLAddressDisplayer, HTMLPositionDisplayer
  - guia_ibge.js: 100% coverage (perfect)

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

### Testing Terminology

To ensure clear communication about testing concepts:

- **Test Suite**: A file containing related tests (e.g., `__tests__/unit/PositionManager.test.js`)
  - The project has 57 passing test suites across 5 categories

- **Test**: Individual test case within a suite using `it()` or `test()`
  - Example: `it('should return singleton instance')`
  - The project has 3,242 tests total (3,074 passing, 168 skipped)

- **Test Category**: Organizational grouping of related test suites
  - **unit/**: Tests for individual classes and functions in isolation
  - **integration/**: Tests for interactions between multiple components
  - **features/**: Tests for complete user-facing features
  - **external/**: Tests for external API integrations
  - **managers/**: Tests for manager and coordinator classes

**Example**: The PositionManager test suite (`__tests__/unit/PositionManager.test.js`) contains 12 individual tests covering singleton behavior, state management, and position updates.

### Test Categories

- **Unit Tests**: Individual component testing with mocks
- **Integration Tests**: Multi-component interaction testing
- **Feature Tests**: End-to-end feature validation
- **Immutability Tests**: Verifying referential transparency patterns
- **API Tests**: External API integration validation

### Test Definitions

- **Test Suite**: A file containing related tests (e.g., `__tests__/unit/PositionManager.test.js`) - we have 122 passing suites
- **Test**: Individual test case within a suite
- **Test Category**: Organizational grouping by functionality (unit, integration, features, external, managers)
- **Code Coverage**: Percentage of source code executed during tests (76% overall, exceeds 65% threshold)

## 📚 Documentation

### Essential Reading for Contributors

1. **[Documentation Index](docs/INDEX.md)** - Complete documentation hub
2. **[Contributing Guide](.github/CONTRIBUTING.md)** - Code style and submission process
3. **[JavaScript Best Practices](docs/guides/JAVASCRIPT_BEST_PRACTICES.md)** - Coding standards
4. **[Referential Transparency Guide](docs/guides/REFERENTIAL_TRANSPARENCY.md)** - Functional programming principles

### Architecture Documentation

- **[Class Diagram](docs/architecture/CLASS_DIAGRAM.md)** - System architecture overview
- **[GeoPosition](docs/architecture/GEO_POSITION.md)** - GPS position wrapper documentation
- **[PositionManager](docs/architecture/POSITION_MANAGER.md)** - Position state management
- **[WebGeocodingManager](docs/architecture/WEB_GEOCODING_MANAGER.md)** - Main coordinator documentation

### Development Guides

- **[Module Splitting Guide](docs/guides/MODULE_SPLITTING_GUIDE.md)** - Modularization strategies
- **[ES6 Import/Export Best Practices](docs/guides/ES6_IMPORT_EXPORT_BEST_PRACTICES.md)** - Module patterns
- **[TDD Guide](docs/guides/TDD_GUIDE.md)** - Test-driven development
- **[Unit Test Guide](docs/guides/UNIT_TEST_GUIDE.md)** - Unit testing fundamentals

### Configuration & Tools

- **[ESLint Setup](docs/developer/ESLINT_SETUP.md)** - Linter configuration with custom rules
- **[Workflow Setup](docs/workflow-automation/WORKFLOW_SETUP.md)** - GitHub Actions and CI/CD
- **[Jest & Module Systems](docs/guides/JEST_COMMONJS_ES6_GUIDE.md)** - Testing module configurations

## ⚡ Build System & Performance

### Vite Build Process

The application uses **Vite** as the build tool to provide optimized production builds with:

**Performance Benefits**:

- ✅ **25% bundle size reduction** (1.2M → 900K) through minification
- ✅ **Automatic code splitting** into logical chunks (core, speech, services, data, html, coordination)
- ✅ **60-70% fewer HTTP requests** via bundling
- ✅ **Tree shaking** to eliminate unused code
- ✅ **Terser minification** with source maps for debugging

**Build Configuration** (`vite.config.js`):

```javascript
{
  target: 'es2022',           // Modern browsers with top-level await support
  minify: 'terser',           // Aggressive minification
  sourcemap: true,            // Debug support
  manualChunks: {             // Strategic code splitting
    'vendor': [...],          // External dependencies
    'speech': [...],          // Speech synthesis modules (17.5 KB)
    'core': [...],            // Core position management (9.5 KB)
    'services': [...],        // API services (13.9 KB)
    'data': [...],            // Data processing (19.7 KB)
    'html': [...],            // UI displayers (16.0 KB)
    'coordination': [...]     // Service coordinators (23.0 KB)
  }
}
```

**Bundle Analysis**:

```bash
# Production build creates optimized chunks:
dist/
├── assets/
│   ├── coordination-*.js    23 KB (gzip: 5.6 KB)
│   ├── core-*.js             9 KB (gzip: 3.3 KB)
│   ├── data-*.js            20 KB (gzip: 4.1 KB)
│   ├── html-*.js            16 KB (gzip: 5.0 KB)
│   ├── main-*.js            22 KB (gzip: 6.7 KB)
│   ├── services-*.js        14 KB (gzip: 3.9 KB)
│   ├── speech-*.js          18 KB (gzip: 4.5 KB)
│   └── main-*.css           33 KB (gzip: 7.6 KB)
└── index.html               26 KB (gzip: 7.3 KB)

Total: 900 KB (25% reduction from source)
```

**Browser Requirements**:

- ES2022 support (Chrome 94+, Firefox 93+, Safari 15+)
- Top-level await support
- ES modules support

### Development Modes

**1. Development Mode** (Recommended for active development):

```bash
npm run dev
# - Vite dev server with HMR (hot module replacement)
# - Instant feedback on changes
# - Source maps enabled
# - Fast refresh without page reload
# - Runs at http://localhost:9000
```

**2. Production Build**:

```bash
npm run build
# - Minified and optimized bundle
# - Code splitting into chunks
# - Tree shaking enabled
# - Output to dist/ folder
```

**3. Production Preview**:

```bash
npm run preview
# - Preview production build locally
# - Test optimized bundle before deployment
# - Runs at http://localhost:9001
```

**4. Legacy Mode** (Python server for source files):

```bash
python3 -m http.server 9000
# - Direct file serving without build
# - Useful for debugging original source
# - Access at http://localhost:9000/src/index.html
```

## 🏗️ Core Architecture

### Main Classes

#### Core Layer (Singletons & Managers)

- `PositionManager` - Centralized position state with observer pattern
- `SingletonStatusManager` - Cross-component status management
- `GeolocationService` - Browser geolocation API wrapper
- `WebGeocodingManager` - Main coordination and workflow management

#### View Controllers (v0.10.0-alpha) 🆕

- **`HomeViewController`** - Home view controller for location tracking
  - **Purpose**: Manages the home view (/) with real-time location tracking
  - **Features**: Single-position capture, continuous tracking toggle, button management
  - **Lines**: 672 lines (src/views/home.js)
  - **Tests**: 70 comprehensive unit tests with 100% coverage
  - **API**:
    - `init()` - Initialize manager and chronometer
    - `getSingleLocationUpdate()` - Capture current position
    - `startTracking()` / `stopTracking()` - Control continuous tracking
    - `toggleTracking()` - Convenience method for tracking control
  - **Migration**: Replaces inline logic from app.js (664→645 lines, -2.9%)
- `ConverterViewController` - Converter view for coordinate conversion (unchanged)

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
- `HTMLHighlightCardsDisplayer` - Municipio and bairro highlight cards (v0.9.0+)
  - **v0.9.0-alpha**: Metropolitan region display (Região Metropolitana) with reduced visual prominence ✅
  - **Features**: Municipality with state abbreviation (e.g., "Recife, PE"), region context for metro areas
- `HTMLReferencePlaceDisplayer` - Displays nearby reference places
- `HTMLSidraDisplayer` - IBGE SIDRA data display with observer pattern (v0.9.0+)
  - **Features**: Population statistics, Brazilian Portuguese localization, automatic updates
  - **Data Source**: IBGE SIDRA API with offline fallback (libs/sidra/tab6579_municipios.json)
- `DisplayerFactory` - Factory pattern for display component creation (5 methods, v0.9.0-alpha) ✅

#### Speech Synthesis Layer (Refactored v0.11.1-alpha) 🆕

- **`HtmlSpeechSynthesisDisplayer`** - **Facade pattern** composing 3 focused components (518 lines)
  - **Architecture**: Converted from monolithic 814-line class to lightweight facade
  - **Benefits**: 36% size reduction, better testability (140 tests), Single Responsibility Principle
  - **Component 1: HtmlSpeechControls** (489 lines, 51 tests)
    - UI element management (voice select, buttons, sliders)
    - Event handler setup/cleanup with memory leak prevention
    - Brazilian Portuguese voice prioritization
  - **Component 2: AddressSpeechObserver** (96 lines, 41 tests)
    - Address change notification handling
    - Priority-based speech synthesis (municipality: 3, bairro: 2, logradouro: 1)
    - First address announcement logic
  - **Component 3: SpeechTextBuilder** (312 lines, 48 tests)
    - Brazilian Portuguese text formatting
    - Address component text building methods
  - **API**: 100% backward compatible, all 60 unit tests passing, no breaking changes
- `SpeechSynthesisManager` - Main orchestrator using composition pattern
  - Composition Components: VoiceLoader, VoiceSelector, SpeechConfiguration, SpeechQueue
- `SpeechController` - Core speech synthesis control logic
- `SpeechQueueProcessor` - Queue processing and execution
- `SpeechConfiguration` - Speech synthesis configuration management
- `VoiceManager` - Voice selection and management
- `SpeechQueue` - Queue data structure for speech items
- `SpeechItem` - Individual speech item representation

### Design Patterns Used

- **Singleton Pattern** - PositionManager, StatusManager
- **Observer Pattern** - Position and address change notifications
- **Facade Pattern** - HtmlSpeechSynthesisDisplayer (v0.11.0+), Simplified API access
- **Composition Pattern** - HtmlSpeechSynthesisDisplayer components, SpeechSynthesisManager components
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

**Documentation**: [Nominatim API Format](docs/api-integration/NOMINATIM_INTEGRATION.md)

### IBGE (Brazilian Institute of Geography and Statistics)

```javascript
// State data endpoint
https://servicodados.ibge.gov.br/api/v1/localidades/estados/
```

**Documentation**: [IBGE Integration](docs/guides/IBIRA_INTEGRATION.md)

### IBGE API via ibira.js

Guia.js integrates with IBGE (Brazilian statistics) through the **ibira.js** library using a three-tier loading strategy:

1. **CDN Loading** (primary): jsDelivr CDN v0.2.2-alpha with 5-second timeout
2. **Local Module** (fallback): `node_modules/ibira.js` for Node.js environments
3. **Mock Fallback** (testing): Stub implementation when neither source is available

```javascript
// Dynamic CDN import with timeout
import('https://cdn.jsdelivr.net/gh/mpbarbosa/ibira.js@0.2.2-alpha/src/index.js')
  .then(module => module.IbiraAPIFetchManager)
  .catch(() => import('ibira.js')); // Fallback to local
```

**Features**:

- Automatic failover between CDN and local sources
- Zero-configuration mock for testing environments
- Full IBGE API compatibility through `IbiraAPIFetchManager`

**Documentation**: [IBIRA Integration Guide](docs/guides/IBIRA_INTEGRATION.md)

### Google Maps Integration

Guia.js generates Google Maps links for enhanced location visualization and navigation:

**Features**:

- **Map View Links**: Opens location in Google Maps web interface
- **Street View Integration**: Direct links to Street View when available
- **Directions**: External routing to user's location

**Generated Links** (created by HTMLPositionDisplayer):

```javascript
// Map view URL format
https://www.google.com/maps?q=<latitude>,<longitude>

// Street View URL format
https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=<latitude>,<longitude>
```

**Usage**: The application automatically generates these links when displaying position data. No API key required for basic link generation.

**Note**: Google Maps links are external - users navigate to Google's service. For embedded maps, consider the Google Maps JavaScript API (requires API key).

## 📦 CDN Delivery

Guia.js can be delivered via **jsDelivr CDN** for easy integration into web projects with global distribution and automatic optimization.

**Quick Start**: Run `./.github/scripts/cdn-delivery.sh` to generate all CDN URLs for the current version.

**Reference**: [jsDelivr Documentation](https://www.jsdelivr.com/?docs=gh)

### Prerequisites

Before using the CDN delivery script, ensure you have:

**Required**:

- **Node.js v18+** - For package.json parsing
- **Git** - For commit hash extraction and repository information

**Optional**:

- **curl** - For CDN availability testing (script works without it)

**Verify Dependencies**:

```bash
# Check Node.js version (must be v18+)
node --version

# Check Git availability
git --version

# Check curl (optional)
curl --version
```

If any required dependency is missing:

```bash
# Install Node.js (Ubuntu/Debian)
sudo apt update && sudo apt install nodejs

# Install Node.js (macOS with Homebrew)
brew install node

# Git is usually pre-installed
# If not: sudo apt install git (Linux) or brew install git (macOS)
```

### CDN URL Generator Script

The `.github/scripts/cdn-delivery.sh` script automatically generates CDN URLs based on your current version and commit:

```bash
# Generate all CDN URLs
./.github/scripts/cdn-delivery.sh

# Output includes:
# - Version-specific URLs (recommended for production)
# - Commit-specific URLs (for audit trails)
# - Branch URLs (for development)
# - Version range URLs (SemVer)
# - Minified URLs (auto-optimized)
# - Combination URLs (multiple files)

# All URLs saved to cdn-urls.txt
```

**Script Features**:

- ✅ Automatic version detection from package.json
- ✅ Current commit hash for immutable URLs
- ✅ Multiple URL formats for different use cases
- ✅ Color-coded terminal output
- ✅ Persistent output file (cdn-urls.txt)
- ✅ Comprehensive error checking and helpful messages

### Exit Codes & Error Handling

**Exit Codes**:

- **0**: Success - URLs generated and saved to `cdn-urls.txt`
- **1**: Error - Check error message for details

**Common Errors and Solutions**:

#### Error: Node.js not found

```bash
Error: Node.js not found
This script requires Node.js v18+ to parse package.json
```

**Solution**: Install Node.js

```bash
# Ubuntu/Debian
sudo apt install nodejs

# macOS
brew install node

# Verify
node --version  # Should be v18+
```

#### Error: package.json not found

```bash
Error: package.json not found
This script must be run from the project root directory
Current directory: /home/user/wrong/path
```

**Solution**: Navigate to project root

```bash
cd /path/to/guia_turistico
./.github/scripts/cdn-delivery.sh
```

#### Error: Git not found

```bash
Error: Git not found
This script requires Git to extract commit information
```

**Solution**: Install Git

```bash
# Ubuntu/Debian
sudo apt install git

# macOS
brew install git

# Verify
git --version
```

#### Error: Not a Git repository

```bash
Error: Not a Git repository
This script requires a Git repository to extract commit hash
```

**Solution**: Ensure you're in a cloned repository

```bash
# Clone if needed
git clone https://github.com/mpbarbosa/guia_turistico.git
cd guia_turistico
./.github/scripts/cdn-delivery.sh
```

#### Error: Failed to read package.json

```bash
Error: Failed to read package.json
Details: SyntaxError: Unexpected token...
```

**Solution**: Check package.json syntax

```bash
# Validate JSON
node -p "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))"

# Or use online validator
# https://jsonlint.com/
```

#### Error: Package not yet available on CDN

```bash
# When accessing CDN URL, you get:
# 404 Not Found
# Package not found
```

**Solution**: Ensure Git tag is pushed and wait for CDN sync

```bash
# 1. Check if tag exists locally
git tag | grep v0.9.0-alpha

# 2. If missing, create tag
git tag v0.9.0-alpha

# 3. Push tag to GitHub
git push origin v0.9.0-alpha

# 4. Wait for jsDelivr to sync (5-10 minutes)
# Check status at: https://www.jsdelivr.com/package/gh/mpbarbosa/guia_turistico

# 5. Verify CDN availability
curl -I "https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0.9.0-alpha/src/app.js"
# Should return: HTTP/7.1.0

# Alternative: Use commit hash instead (available immediately)
# https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@COMMIT_HASH/src/app.js
```

**Note**: CDN sync times:

- **Tag-based URLs**: 5-10 minutes after pushing tag
- **Commit-based URLs**: Available immediately after push
- **Branch URLs**: Update within ~1 minute

### Quick Start

```bash
# From project root directory
./.github/scripts/cdn-delivery.sh

# Output saved to cdn-urls.txt
```

### Usage Guide

#### When to Run the Script

Run `.github/scripts/cdn-delivery.sh` when you need CDN URLs:

- ✅ **After version bumps** - Update CDN URLs when `package.json` version changes
- ✅ **Before releases** - Generate distribution URLs for release notes
- ✅ **After creating Git tags** - Get version-specific URLs for stable releases
- ✅ **During documentation** - Get current URLs for examples and guides
- ✅ **Manual anytime** - Script is idempotent and safe to run repeatedly

#### Basic Usage

```bash
# Generate all CDN URLs for current version
./.github/scripts/cdn-delivery.sh

# Output appears in terminal with color coding
# Also saved to: cdn-urls.txt
```

#### Release Workflow Integration

**Scenario 1: Version Bump and Release**

```bash
# 1. Bump version
npm version patch  # or minor, major
# Creates: v0.6.1-alpha

# 2. Generate CDN URLs
./.github/scripts/cdn-delivery.sh

# 3. Commit URLs file
git add cdn-urls.txt package.json package-lock.json
git commit -m "chore: bump version to v0.6.1-alpha"

# 4. Create and push tag
git tag v0.6.1-alpha
git push origin main
git push origin v0.6.1-alpha

# 5. Wait 5-10 minutes for jsDelivr sync

# 6. Verify CDN availability
curl -I "https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0.9.0-alpha/package.json"
```

**Scenario 2: Documentation Update**

```bash
# Need current CDN URLs for docs
./.github/scripts/cdn-delivery.sh

# Copy URLs from cdn-urls.txt
# Update documentation files
vim README.md

# Commit changes
git add README.md cdn-urls.txt
git commit -m "docs: update CDN URLs"
git push
```

**Scenario 3: Pre-release Testing**

```bash
# Use commit-based URL before tagging
./.github/scripts/cdn-delivery.sh

# Get commit URL from output:
# https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@abc1234/src/guia.js

# Test in browser immediately (no tag needed)
# Available within seconds of pushing to GitHub
```

#### Environment & Configuration

**No Configuration Required**: Script auto-detects:

- Repository information from Git
- Version from `package.json`
- Current commit hash
- Main file location

**Environment Variables** (optional overrides):

| Variable | Default | Purpose | Example |
|----------|---------|---------|---------|
| `GITHUB_USER` | `mpbarbosa` | GitHub username | Your fork owner |
| `GITHUB_REPO` | `guia_js` | Repository name | Your fork name |
| `MAIN_FILE` | `src/guia.js` | Main file path | Custom entry point |
| `OUTPUT_FILE` | `cdn-urls.txt` | Output filename | Custom output |

**Usage Examples**:

```bash
# Use defaults (recommended for main repository)
./.github/scripts/cdn-delivery.sh

# Generate URLs for your fork
GITHUB_USER="yourname" GITHUB_REPO="yourrepo" ./.github/scripts/cdn-delivery.sh

# Custom main file
MAIN_FILE="dist/guia.min.js" ./.github/scripts/cdn-delivery.sh

# Custom output file
OUTPUT_FILE="production-urls.txt" ./.github/scripts/cdn-delivery.sh

# Combine multiple overrides
GITHUB_USER="yourname" OUTPUT_FILE="my-urls.txt" ./.github/scripts/cdn-delivery.sh

# Set for entire session
export GITHUB_USER="yourname"
export GITHUB_REPO="yourrepo"
./.github/scripts/cdn-delivery.sh  # Uses exported values
```

**Configuration Display**:

```bash
$ ./.github/scripts/cdn-delivery.sh
🔍 Checking prerequisites...
✅ Node.js found: v20.19.5
✅ package.json found
✅ Git found: git v2.x.x
✅ Git repository detected
✅ All prerequisites met!

⚙️  Configuration:
   GitHub User: mpbarbosa
   Repository: guia_js
   Main File: src/guia.js
   Output File: cdn-urls.txt

[URLs generated...]
```

**For Forks and Custom Setups**:

```bash
# Permanent configuration (edit script directly)
# Lines 87-90 in .github/scripts/cdn-delivery.sh:
GITHUB_USER="${GITHUB_USER:-yourname}"
GITHUB_REPO="${GITHUB_REPO:-yourrepo}"
MAIN_FILE="${MAIN_FILE:-custom/path.js}"
OUTPUT_FILE="${OUTPUT_FILE:-custom-urls.txt}"
```

#### Command-Line Arguments

**Current**: Script takes no arguments (uses environment variables instead)

**Future**: Planned options:

```bash
./.github/scripts/cdn-delivery.sh --help           # Show usage help
./.github/scripts/cdn-delivery.sh --test           # Test CDN availability only
./.github/scripts/cdn-delivery.sh --version X.Y.Z  # Generate URLs for specific version
./.github/scripts/cdn-delivery.sh --commit abc123  # Generate URLs for specific commit
./.github/scripts/cdn-delivery.sh --quiet          # Suppress output, only save file
```

#### Output Files

**cdn-urls.txt**:

- Plain text format
- All generated URLs
- Timestamped
- Safe to commit to repository
- Used by documentation and CI/CD

**Location**: Project root directory

**Format**:

```
# Generated: 2026-02-11 23:45:00
# Version: 7.1.0-alpha
# Commit: abc1234567890abcdef1234567890abcdef12345

Version-specific URLs:
https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0.9.0-alpha/src/guia.js
...
```

#### Best Practices

> **📌 Important**: Always use **version-specific CDN URLs** (e.g., `@0.9.0-alpha`) in production for stability and cache consistency. Avoid branch-based URLs (`@main`) which auto-update and can break applications unexpectedly.

1. **Run after every version change**

   ```bash
   npm version patch && ./.github/scripts/cdn-delivery.sh
   ```

2. **Commit cdn-urls.txt with version bumps**

   ```bash
   git add cdn-urls.txt package.json
   git commit -m "chore: version bump"
   ```

3. **Use version-specific URLs in production**

   ```html
   <!-- ✅ Good: Pinned version -->
   <script src="https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0.9.0-alpha/src/guia.js"></script>

   <!-- ❌ Avoid: Latest version (unpredictable) -->
   <script src="https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@main/src/guia.js"></script>
   ```

4. **Test commit URLs before tagging**

   ```bash
   # Push code
   git push

   # Generate URLs
   ./.github/scripts/cdn-delivery.sh

   # Test commit URL immediately
   # Then create tag once tested
   git tag v0.6.0-alpha
   git push origin v0.6.0-alpha
   ```

5. **Keep cdn-urls.txt in repository**
   - Provides URL history
   - Helps with documentation
   - Useful for CI/CD pipelines

#### Troubleshooting

**Script fails silently**:

```bash
# Run with bash -x for debugging
bash -x ./.github/scripts/cdn-delivery.sh
```

**URLs not working**:

```bash
# Verify tag was pushed
git ls-remote --tags origin

# Check jsDelivr status
curl -I "https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0.9.0-alpha/package.json"

# Use commit URL as temporary alternative
```

**Wrong version shown**:

```bash
# Check package.json
cat package.json | grep version

# Verify you're in project root
pwd
ls package.json

# Update version if needed
npm version patch
```

### 📦 Version-Specific URLs (Recommended for Production)

Load a specific version for stability and cache consistency:

```html
<!-- Main guia.js file -->
<script src="https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0.9.0-alpha/src/guia.js"></script>

<!-- Load entire src directory -->
<link rel="prefetch" href="https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0.9.0-alpha/src/">

<!-- IBGE utilities -->
<script src="https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0.9.0-alpha/src/guia_ibge.js"></script>
```

**Benefits:**

- ✅ Version pinning prevents breaking changes
- ✅ Immutable URLs for reliable caching
- ✅ Production-ready stability

### 🔖 Commit-Specific URLs

Load from a specific git commit (immutable):

```html
<!-- Replace {COMMIT_SHA} with actual commit hash -->
<script src="https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@{COMMIT_SHA}/src/guia.js"></script>

<!-- Example with full commit hash -->
<script src="https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@ba5b3adee7fc5f77e30f5a7a42efadf42eec34dc/src/guia.js"></script>
```

**Use case:** Pin to exact commit for audit trails and regulatory compliance

### 🌿 Branch URLs (Auto-updating)

Load latest from a branch (updates automatically):

```html
<!-- Latest from main branch -->
<script src="https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@main/src/guia.js"></script>
```

**⚠️ Warning:** Not recommended for production - URLs update as branch changes

### 🎯 Version Range URLs (SemVer)

Automatically get latest patches or minor versions:

```html
<!-- Latest v0.6.x (patch updates only) -->
<script src="https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0.6/src/guia.js"></script>

<!-- Latest v0.x.x (minor + patch updates) -->
<script src="https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0/src/guia.js"></script>
```

**Use case:** Auto-receive bug fixes while maintaining compatibility

### ⚡ Optimized & Minified URLs

jsDelivr automatically minifies files:

```html
<!-- Auto-minified version (adds .min.js) -->
<script src="https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0.9.0-alpha/src/guia.min.js"></script>

<!-- Source maps (for debugging) -->
<script src="https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0.9.0-alpha/src/guia.js.map"></script>
```

### 📚 Combine Multiple Files

Combine and minify multiple files in a single request:

```html
<!-- Combine guia.js and guia_ibge.js -->
<script src="https://cdn.jsdelivr.net/combine/gh/mpbarbosa/guia_turistico@0.9.0-alpha/src/guia.js,gh/mpbarbosa/guia_turistico@0.9.0-alpha/src/guia_ibge.js"></script>
```

**Benefits:**

- Reduces HTTP requests
- Automatic minification
- Combined caching

### 🌐 HTML Usage Examples

#### Standard Script Tag

```html
<!-- Load specific version -->
<script src="https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0.9.0-alpha/src/guia.js"></script>

<!-- Use after load -->
<script>
  const manager = new WebGeocodingManager(document, 'container-id');
  manager.startGeolocation();
</script>
```

#### With Subresource Integrity (SRI)

```html
<!-- Generate SRI hash at: https://www.srihash.org/ -->
<script src="https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0.9.0-alpha/src/guia.js"
        integrity="sha384-HASH_HERE"
        crossorigin="anonymous"></script>
```

**Security:** SRI validates file integrity and prevents tampering

#### ES Module Import

```html
<script type="module">
  import { WebGeocodingManager, PositionManager } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0.9.0-alpha/src/guia.js';

  // Use imported classes
  const manager = new WebGeocodingManager(document, 'map-container');
  const position = PositionManager.getInstance();
</script>
```

#### Module Preloading

```html
<!-- Preload for better performance -->
<link rel="modulepreload" href="https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0.9.0-alpha/src/guia.js">

<script type="module">
  // Module is already cached
  import { WebGeocodingManager } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0.9.0-alpha/src/guia.js';
</script>
```

### 📦 NPM CDN URLs (if published to npm)

If guia_js is published to npm registry:

```html
<!-- Load from npm -->
<script src="https://cdn.jsdelivr.net/npm/guia_turistico@0.9.0-alpha/src/guia.js"></script>

<!-- Load latest version -->
<script src="https://cdn.jsdelivr.net/npm/guia_js/src/guia.js"></script>
```

### 🔧 Additional Features

#### Package Metadata

```javascript
// Get package.json
fetch('https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0.9.0-alpha/package.json')
  .then(res => res.json())
  .then(pkg => console.log(pkg.version));

// List all files in package
fetch('https://data.jsdelivr.com/v1/package/gh/mpbarbosa/guia_turistico@0.9.0-alpha')
  .then(res => res.json())
  .then(data => console.log(data.files));
```

### ⚡ Performance Tips

1. **Always use specific versions in production** - Avoid `@latest` or branch names
2. **Enable SRI (Subresource Integrity)** - For security and cache validation
3. **Use modulepreload** - Preload critical modules for faster loading
4. **Leverage browser caching** - CDN files are cached automatically
5. **Combine files when possible** - Reduce HTTP requests

### 🌍 CDN Features

- ✅ **750+ CDN Locations** - Worldwide distribution via jsDelivr
- ✅ **Automatic Compression** - Brotli and Gzip support
- ✅ **HTTP/2 & HTTP/3** - Modern protocol support
- ✅ **Smart Caching** - Optimized cache headers
- ✅ **Auto-Minification** - Minified versions generated automatically
- ✅ **Source Maps** - Debug support with .map files
- ✅ **Zero Config** - No build step required
- ✅ **99.9% Uptime** - Enterprise-grade reliability

### 🔐 Security Considerations

#### Generate SRI Hash

```bash
# Using curl and openssl
curl -s https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0.9.0-alpha/src/guia.js | \
  openssl dgst -sha384 -binary | openssl base64 -A

# Or use online tool: https://www.srihash.org/
```

#### Use HTTPS Only

All jsDelivr URLs use HTTPS with valid SSL certificates.

### 📋 Making CDN Available

To make your version available on jsDelivr CDN:

```bash
# 1. Ensure code is pushed to GitHub
git push origin main

# 2. Create a git tag with version
git tag v0.6.0-alpha

# 3. Push the tag
git push origin v0.6.0-alpha

# 4. Wait a few minutes for jsDelivr to sync
# Then test: https://cdn.jsdelivr.net/gh/mpbarbosa/guia_turistico@0.9.0-alpha/package.json
```

### 📁 CDN Files Reference

- **`.github/scripts/cdn-delivery.sh`** - Shell script to generate all CDN URLs with current version
- **`cdn-urls.txt`** - Pre-generated CDN URLs for quick reference

Run `./.github/scripts/cdn-delivery.sh` anytime to generate updated URLs after version changes.

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

### Pre-Push Validation

**Always test locally before pushing** to catch issues early and speed up CI/CD:

```bash
# Simulate GitHub Actions workflow locally
./.github/scripts/test-workflow-locally.sh
```

**What it validates**:

- ✅ JavaScript syntax (npm run validate)
- ✅ Test suite execution (npm test)
- ✅ Coverage generation (npm run test:coverage)
- ✅ Documentation format checks
- ✅ Change detection (shows what will trigger in CI)

**Prerequisites**:

- Node.js v18+ (for npm commands)
- npm dependencies installed (`npm install`)
- git (for change detection)
- Standard Unix tools: grep, find, wc

**Output Interpretation**:

The script detects file changes and runs appropriate validations:

- **JavaScript changes**: Runs syntax validation + tests
- **Test file changes**: Runs full test suite + coverage
- **Documentation changes**: Validates markdown format + updates index

**Exit Codes**:

- **0**: All checks passed - safe to push
- **1**: Some checks failed - fix issues before pushing

**Common Failures**:

1. **npm test fails**
   - Fix failing tests before pushing
   - Run `npm test` separately for detailed output
   - Check `npm run test:verbose` for more information

2. **Syntax validation fails**
   - Check JavaScript syntax errors
   - Run `node -c src/file.js` to debug specific files
   - Use `npm run lint` to catch style issues

3. **Documentation issues**
   - Remove Windows line endings: `dos2unix file.md`
   - Update `docs/INDEX.md` if new files added
   - Check markdown formatting

**Integration with Git**:

```bash
# Recommended workflow
git add .
./.github/scripts/test-workflow-locally.sh
git commit -m "your message"
git push
```

**What happens in CI**:

- If tests changed: TESTING.md auto-updated by bot
- If docs changed: docs/INDEX.md auto-updated by bot
- Auto-commits appear from `github-actions[bot]`

For comprehensive guidance, see:

- [GitHub Actions Guide](docs/guides/GITHUB_ACTIONS_GUIDE.md)
- [Workflow Setup](docs/workflow-automation/WORKFLOW_SETUP.md)
- [Contributing Guidelines](.github/CONTRIBUTING.md)

### Development Guidelines

### Code Quality Standards

- ✅ **Functional Programming** - Use pure functions and immutability
- ✅ **Referential Transparency** - Functions return same output for same input
- ✅ **No Direct Mutations** - Use spread operators, filter(), map() instead of push(), splice()
- ✅ **Comprehensive Tests** - Write tests for all new functionality
- ✅ **Documentation** - Update docs for API changes

### Local Pre-Push Validation

```bash
# Simulate GitHub Actions workflow locally
./.github/scripts/test-workflow-locally.sh
```

**What it validates**:

- ✅ JavaScript syntax validation (`npm run validate`)
- ✅ Test suite execution (`npm test`)
- ✅ Coverage generation (`npm run test:coverage`)
- ✅ Documentation format checks
- ✅ Shows exactly what will trigger in CI/CD

**Benefits**:

- Catch failures before pushing
- Faster feedback loop (local vs remote)
- Saves CI/CD minutes
- Preview GitHub Actions results

**Output Example**:

```
🔍 Running JavaScript Syntax Validation...
✅ Syntax validation passed

🧪 Running Test Suite...
✅ Tests passed: 1,739 passing (1,882 total, 143 skipped)

📊 Generating Coverage Report...
✅ Coverage: 69.82%

✅ All checks passed! Safe to push.
```

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Write tests first** (TDD approach recommended)
4. **Implement your feature**
5. **Run validation**: `npm run test:all`
6. **Run linter**: `npm run lint:fix`
7. **Pre-push check**: `./.github/scripts/test-workflow-locally.sh`
8. **Commit changes**: Use conventional commits (feat:, fix:, docs:, test:)
9. **Push to your fork**: `git push origin feature/your-feature`
10. **Create a Pull Request**

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

**Learn More**: [Referential Transparency Guide](docs/guides/REFERENTIAL_TRANSPARENCY.md)

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
- **Test Coverage**: 76% (statements), 74.2% (branches)
- **Test Count**: 3,242 tests total (3,074 passing, 168 skipped, 0 failing)
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

**Track Progress**: See [Issue #189 Follow-up](docs/reports/analysis/)

## 📞 Support

- **Documentation**: [docs/INDEX.md](docs/INDEX.md)
- **Issues**: [GitHub Issues](https://github.com/mpbarbosa/guia_turistico/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mpbarbosa/guia_turistico/discussions)

---

**Version**: 0.9.0-alpha (active development)
**Status**: Active Development
**Last Updated**: 2026-02-23
