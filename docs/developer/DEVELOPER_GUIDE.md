# Developer Guide - Guia Turístico

**Version**: 0.8.7-alpha  
**Last Updated**: 2026-02-09  
**Audience**: Developers contributing to or building on Guia Turístico

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Code Standards](#code-standards)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Common Tasks](#common-tasks)
9. [Contributing](#contributing)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

**Required Tools**:
- **Node.js**: v20.19.0+ (tested with v20.19.5 and v25.4.0)
- **npm**: v10+ (tested with v10.5.0 and v11.8.0)
- **Python**: 3.11+ (for development web server)
- **Git**: 2.x+ (for version control and CDN scripts)
- **Modern Browser**: Chrome 90+, Firefox 88+, or Safari 14+

**Verify Installation**:
```bash
node --version    # Should be v20.19.0+
npm --version     # Should be v10.x.x+
python3 --version # Should be Python 3.11+
git --version     # Should be git version 2.x+
```

**Install Missing Tools**:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm python3 git

# macOS (Homebrew)
brew install node python@3.11 git

# Windows (Chocolatey)
choco install nodejs python git
```

---

### Quick Start (5 Minutes)

```bash
# 1. Clone the repository
git clone https://github.com/mpbarbosa/guia_turistico.git
cd guia_turistico

# 2. Install dependencies (20 seconds, 299 packages)
npm install

# 3. Validate syntax (<1 second)
npm run validate

# 4. Run tests (30 seconds, 2,380 tests)
npm test

# 5. Start development server (3 seconds to start)
python3 -m http.server 9000

# 6. Open in browser
# Navigate to: http://localhost:9000/src/index.html
```

**Expected Output**:
- ✅ Syntax validation passes
- ✅ 2,214 tests passing (146 skipped, 20 failing - known issues)
- ✅ Web server running on port 9000
- ✅ Application loads without JavaScript errors

---

## Development Environment Setup

### IDE Configuration

**Recommended IDEs**:
- **VS Code** (recommended): Excellent JavaScript support
- **WebStorm**: Full-featured JavaScript IDE
- **Sublime Text**: Lightweight alternative

**VS Code Extensions** (recommended):
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ritwickdey.liveserver",
    "christian-kohler.path-intellisense",
    "ms-python.python"
  ]
}
```

### ESLint Configuration

Project uses ESLint v9+ with flat config (`eslint.config.js`):

```bash
# Lint all JavaScript files
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Git Hooks (Husky)

Pre-commit hooks automatically run:
- **Syntax validation**: `node -c` on all JS files
- **Unit tests**: Quick validation tests

Pre-push hooks run:
- **Full test suite**: All 2,380 tests

**Setup Husky** (automatic on `npm install`):
```bash
npm run prepare  # Initializes husky hooks
```

---

## Project Structure

### Directory Organization

```
guia_turistico/
├── src/                    # Source code (16,500+ lines)
│   ├── core/              # Foundation layer (4 classes)
│   ├── services/          # External integrations (3 services)
│   ├── coordination/      # Orchestration layer (5 coordinators)
│   ├── data/              # Data processing (6 classes)
│   ├── html/              # UI/Display layer (8 components)
│   ├── speech/            # Speech synthesis (7 classes)
│   ├── timing/            # Performance timing (2 classes)
│   ├── status/            # Status management (1 singleton)
│   ├── utils/             # Utilities (5 modules)
│   ├── config/            # Configuration (2 modules)
│   ├── views/             # View controllers (2 views)
│   ├── app.js             # SPA entry point (543 lines)
│   ├── index.html         # Main HTML page (379 lines)
│   └── *.css              # 15 modular CSS files
│
├── __tests__/             # Test suites (101 suites, 2,380 tests)
│   ├── unit/              # Unit tests (isolated)
│   ├── integration/       # Integration tests (multi-component)
│   ├── e2e/               # End-to-end tests (Puppeteer)
│   ├── features/          # Feature-specific tests
│   ├── services/          # Service layer tests
│   ├── managers/          # Manager class tests
│   └── external/          # External API tests
│
├── docs/                  # Documentation (100+ files)
│   ├── api/               # API documentation
│   ├── architecture/      # Architecture guides
│   ├── developer/         # Developer documentation
│   ├── user/              # User guides
│   ├── testing/           # Testing documentation
│   └── guides/            # Quick reference guides
│
├── libs/                  # External data libraries
│   └── sidra/             # IBGE SIDRA data (190KB JSON)
│
├── scripts/               # Automation scripts
│   ├── check-version-consistency.sh
│   ├── update-test-counts.sh
│   └── update-doc-dates.sh
│
├── .github/               # GitHub configuration
│   ├── workflows/         # GitHub Actions CI/CD
│   ├── scripts/           # CI/CD scripts
│   ├── CONTRIBUTING.md    # Contribution guidelines
│   └── copilot-instructions.md
│
├── package.json           # Node.js configuration
├── eslint.config.js       # ESLint configuration
├── jest.config.js         # Jest configuration (in package.json)
└── README.md              # Project README
```

### Key Files

| File | Lines | Purpose |
|------|-------|---------|
| `src/app.js` | 543 | SPA entry point, router |
| `src/views/home.js` | 595 | Home view controller |
| `src/views/converter.js` | 521 | Converter view controller |
| `src/guia.js` | 520 | guia.js library exports |
| `src/config/defaults.js` | 130+ | Application constants |
| `src/utils/TimerManager.js` | 147 | Timer management (prevents leaks) |
| `src/timing/Chronometer.js` | 356 | Performance timing |

---

## Development Workflow

### Daily Development Cycle

```bash
# 1. Start development server (leave running)
python3 -m http.server 9000

# 2. Edit source files in src/

# 3. Validate syntax (quick check)
npm run validate

# 4. Test specific changes
npm run test:changed

# 5. Run full test suite before commit
npm run test:all

# 6. Commit changes (triggers pre-commit hooks)
git add .
git commit -m "feat: add new feature"

# 7. Push changes (triggers pre-push hooks)
git push
```

### Testing Workflow

```bash
# Validate syntax only (<1 second)
npm run validate

# Run all tests (30 seconds)
npm test

# Run tests with coverage (30 seconds)
npm run test:coverage

# Run tests in watch mode (development)
npm run test:watch

# Run specific test category
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:features      # Feature tests only
npm run test:services      # Service tests only

# Run specific test file
npm test -- __tests__/unit/core/PositionManager.test.js

# Run tests matching pattern
npm test -- --testNamePattern="PositionManager"

# Full validation (syntax + tests)
npm run test:all
```

### Code Review Checklist

Before submitting a pull request:

- [ ] Syntax validation passes (`npm run validate`)
- [ ] All tests pass (`npm test`)
- [ ] Code coverage maintained or improved (`npm run test:coverage`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Code follows immutability principles (see [Code Standards](#code-standards))
- [ ] New features have tests (unit + integration)
- [ ] Documentation updated (if API changes)
- [ ] No console.log() statements (use logger.log())
- [ ] No hardcoded strings (use constants from `config/defaults.js`)

---

## Code Standards

### JavaScript Standards

**ECMAScript Version**: ES6+ (ES2015 modules)

**Module System**: ES6 Modules (`import`/`export`)

```javascript
// GOOD: ES6 modules
import { PositionManager } from './core/PositionManager.js';
export class MyClass { /* ... */ }

// BAD: CommonJS (not used in this project)
const PositionManager = require('./core/PositionManager');
module.exports = MyClass;
```

### Naming Conventions

```javascript
// Classes: PascalCase
class PositionManager { }

// Functions/Methods: camelCase
function calculateDistance() { }
getPosition() { }

// Constants: UPPER_SNAKE_CASE
const ADDRESS_FETCHED_EVENT = 'addressFetched';
const MINIMUM_DISTANCE_CHANGE = 20;

// Private methods: underscore prefix
_privateMethod() { }

// Files: Match class name or kebab-case for utilities
PositionManager.js
address-parser.js
```

### Immutability Principles

**CRITICAL**: This project follows immutability principles. See [`.github/CONTRIBUTING.md`](../../.github/CONTRIBUTING.md) for comprehensive guidelines.

#### Array Operations

```javascript
// ✅ GOOD: Immutable operations
const newArray = [...oldArray, newItem];          // Add
const filtered = oldArray.filter(item => ...);    // Remove
const mapped = oldArray.map(item => ...);         // Transform
const sorted = [...array].sort();                 // Sort (on copy)

// ❌ BAD: Mutation operations
array.push(newItem);       // Don't mutate
array.splice(0, 1);        // Don't mutate
array.sort();              // Don't mutate original
```

#### Object Operations

```javascript
// ✅ GOOD: Immutable operations
const newObject = { ...oldObject, newProp: value };
const updated = { ...obj, prop: newValue };

// ❌ BAD: Mutation operations
obj.newProp = value;       // Don't mutate
delete obj.prop;           // Don't mutate
```

#### Value Objects

```javascript
// ✅ GOOD: Immutable value objects
class GeoPosition {
  constructor(position) {
    this.latitude = position.coords.latitude;
    this.longitude = position.coords.longitude;
    Object.freeze(this); // Prevent mutations
  }
}

// ❌ BAD: Mutable objects
class Position {
  setLatitude(lat) {
    this.latitude = lat; // Don't mutate after creation
  }
}
```

### Error Handling

```javascript
// Service layer: Catch and log errors
try {
  const data = await fetchAddress();
} catch (error) {
  logger.error('Failed to fetch address:', error);
  // Fallback: use cached data or show coordinates only
}

// Validation: Throw errors for invalid inputs
function updatePosition(position) {
  if (!position || !position.coords) {
    throw new Error('Invalid position object');
  }
  // ... process valid position
}

// User-facing errors: Use logger.warn()
if (!navigator.geolocation) {
  logger.warn('Geolocation not supported in this browser');
}
```

### Logging Standards

```javascript
// Import logger (not console.log)
import { log, warn, error } from '../utils/logger.js';

// Use appropriate log level
log('Normal operation:', data);         // Info
warn('Non-critical issue:', message);   // Warning
error('Critical failure:', err);        // Error

// Never use console.log directly (except in tests)
console.log('Debug info'); // ❌ Don't do this
```

### Constants Usage

```javascript
// Import constants instead of hardcoding strings
import { 
  ADDRESS_FETCHED_EVENT, 
  MINIMUM_DISTANCE_CHANGE,
  MINIMUM_TIME_CHANGE 
} from './config/defaults.js';

// ✅ GOOD: Use constants
if (distance >= MINIMUM_DISTANCE_CHANGE) {
  notifyObservers(ADDRESS_FETCHED_EVENT, data);
}

// ❌ BAD: Hardcoded strings/numbers
if (distance >= 20) {  // Magic number
  notifyObservers('addressFetched', data);  // Typo risk
}
```

### Documentation Standards

```javascript
/**
 * Calculate distance between two geographic points using Haversine formula.
 * 
 * @param {number} lat1 - Latitude of first point in decimal degrees
 * @param {number} lon1 - Longitude of first point in decimal degrees
 * @param {number} lat2 - Latitude of second point in decimal degrees
 * @param {number} lon2 - Longitude of second point in decimal degrees
 * @returns {number} Distance in meters
 * 
 * @example
 * const distance = calculateDistance(-23.550520, -46.633309, -22.906847, -43.172896);
 * console.log(distance); // 357870.6 (São Paulo to Rio, ~358km)
 * 
 * @see {@link https://en.wikipedia.org/wiki/Haversine_formula} Haversine formula
 * @since 0.6.0-alpha
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Implementation...
}
```

---

## Testing

### Test Organization

```
__tests__/
├── unit/              # Isolated component tests
│   ├── core/          # Core layer tests
│   ├── data/          # Data processing tests
│   └── utils/         # Utility tests
│
├── integration/       # Multi-component tests
│   ├── coordination/  # Coordinator integration tests
│   └── services/      # Service integration tests
│
├── e2e/               # End-to-end tests (Puppeteer)
│   ├── CompleteGeolocationWorkflow.e2e.test.js
│   ├── NeighborhoodChangeWhileDriving.e2e.test.js
│   └── AddressChangeAndSpeech.e2e.test.js
│
├── features/          # Feature-specific tests
├── services/          # Service layer tests
├── managers/          # Manager class tests
└── external/          # External API tests
```

### Writing Tests

#### Unit Test Example

```javascript
// __tests__/unit/core/PositionManager.test.js
import { PositionManager } from '../../../src/core/PositionManager.js';

describe('PositionManager', () => {
  beforeEach(() => {
    // Reset singleton between tests
    PositionManager.resetInstance();
  });

  test('getInstance returns singleton instance', () => {
    const instance1 = PositionManager.getInstance();
    const instance2 = PositionManager.getInstance();
    
    expect(instance1).toBe(instance2);
  });

  test('update validates position accuracy', () => {
    const manager = PositionManager.getInstance();
    const badPosition = {
      coords: {
        latitude: -23.550520,
        longitude: -46.633309,
        accuracy: 250  // Very bad accuracy
      }
    };

    const updated = manager.update(badPosition);
    expect(updated).toBe(false); // Should reject bad accuracy
  });
});
```

#### Integration Test Example

```javascript
// __tests__/integration/GeolocationWorkflow.test.js
import { PositionManager } from '../../src/core/PositionManager.js';
import { ReverseGeocoder } from '../../src/services/ReverseGeocoder.js';

describe('Geolocation Workflow Integration', () => {
  test('position update triggers address fetch', async () => {
    const manager = PositionManager.getInstance();
    let addressFetched = false;

    const geocoder = new ReverseGeocoder(-23.550520, -46.633309);
    geocoder.addObserver('fetchCompleted', () => {
      addressFetched = true;
    });

    await geocoder.fetchAddress();
    expect(addressFetched).toBe(true);
  });
});
```

#### E2E Test Example

```javascript
// __tests__/e2e/GeolocationFlow.e2e.test.js
import puppeteer from 'puppeteer';

describe('E2E: Geolocation Flow', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
    
    // Mock geolocation
    await page.setGeolocation({
      latitude: -23.550520,
      longitude: -46.633309
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  test('location button triggers position display', async () => {
    await page.goto('http://localhost:9877/src/index.html');
    
    // Click location button
    await page.click('#getLocationButton');
    
    // Wait for coordinates to appear
    await page.waitForSelector('#latitude:not(:empty)');
    
    const lat = await page.$eval('#latitude', el => el.textContent);
    expect(lat).toContain('-23.550520');
  });
});
```

### Test Coverage

**Current Coverage**: ~85% overall (84.7% actual)

**Coverage Thresholds** (in `package.json`):
```json
"coverageThreshold": {
  "global": {
    "statements": 65,
    "branches": 69,
    "functions": 55,
    "lines": 65
  }
}
```

**Generate Coverage Report**:
```bash
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

---

## Debugging

### Browser Debugging

**1. Chrome DevTools**:
```javascript
// Add debugger statement
function updatePosition(position) {
  debugger; // Execution pauses here
  // ... rest of code
}
```

**2. Console Logging**:
```javascript
import { log } from './utils/logger.js';

// Logs to both console and DOM textarea
log('Current position:', position.latitude, position.longitude);
```

**3. Network Inspection**:
- Open Chrome DevTools → Network tab
- Filter by "Fetch/XHR"
- Monitor Nominatim and IBGE API calls

### Node.js Debugging

```bash
# Debug tests with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Connect Chrome DevTools to Node process
# Open chrome://inspect in Chrome
```

### Common Debug Scenarios

#### Geolocation Not Working

```javascript
// Check browser support
if (!navigator.geolocation) {
  log('Geolocation not supported');
}

// Check permissions
navigator.permissions.query({ name: 'geolocation' }).then(result => {
  log('Geolocation permission:', result.state);
});
```

#### API Calls Failing

```javascript
// Add error logging to ReverseGeocoder
geocoder.addObserver('fetchError', (error) => {
  error('Geocoding failed:', error);
  // Check network tab for HTTP status codes
});
```

#### Position Updates Not Triggering

```javascript
// Debug position validation
const manager = PositionManager.getInstance();
manager.update(position); // Returns true/false

// Check validation logs
log('Distance from last:', distance);
log('Time elapsed:', timeElapsed);
log('Accuracy quality:', accuracyQuality);
```

---

## Common Tasks

### Adding a New Feature

**Example**: Add a new display component

```bash
# 1. Create component file
touch src/html/HTMLNewFeatureDisplayer.js

# 2. Implement component
cat > src/html/HTMLNewFeatureDisplayer.js << 'EOF'
'use strict';
import { log } from '../utils/logger.js';

export class HTMLNewFeatureDisplayer {
  constructor(document, elementId) {
    this.element = document.getElementById(elementId);
  }
  
  display(data) {
    this.element.textContent = data;
    log('Displayed new feature:', data);
  }
}
EOF

# 3. Add to DisplayerFactory
# Edit src/html/DisplayerFactory.js

# 4. Write tests
touch __tests__/unit/html/HTMLNewFeatureDisplayer.test.js

# 5. Run tests
npm run test:changed

# 6. Update documentation
# Edit docs/api/HTML_NEW_FEATURE_DISPLAYER.md
```

### Modifying Configuration

```javascript
// Edit src/config/defaults.js
export const NEW_CONSTANT = 'value';

// Use in code
import { NEW_CONSTANT } from './config/defaults.js';
```

### Adding External API Integration

```javascript
// 1. Create service file
// src/services/NewAPIService.js

'use strict';
import { log, error } from '../utils/logger.js';
import ObserverSubject from '../core/ObserverSubject.js';

export class NewAPIService extends ObserverSubject {
  async fetchData() {
    try {
      const response = await fetch('https://api.example.com/data');
      const data = await response.json();
      this.notifyObservers('fetchCompleted', data);
      return data;
    } catch (err) {
      error('API fetch failed:', err);
      this.notifyObservers('fetchError', err);
      throw err;
    }
  }
}

// 2. Write integration tests
// __tests__/services/NewAPIService.test.js

// 3. Document API integration
// docs/api/NEW_API_INTEGRATION.md
```

### Running Pre-Push Validation Locally

```bash
# Simulate GitHub Actions workflow
./.github/scripts/test-workflow-locally.sh

# Expected output:
# ✅ JavaScript syntax validation
# ✅ Test suite execution
# ✅ Test coverage generation
# ✅ Documentation format checks
```

---

## Contributing

### Contribution Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Implement** changes following code standards
4. **Write** tests for new functionality
5. **Run** full test suite: `npm run test:all`
6. **Commit** with conventional commits: `git commit -m "feat: add feature"`
7. **Push** to your fork: `git push origin feature/my-feature`
8. **Open** a pull request

### Commit Message Format

**Convention**: [Conventional Commits](https://www.conventionalcommits.org/)

```
<type>(<scope>): <short description>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling

**Examples**:
```bash
git commit -m "feat(core): add position accuracy filtering"
git commit -m "fix(services): handle network timeout errors"
git commit -m "docs(api): update PositionManager documentation"
git commit -m "test(integration): add geocoding workflow tests"
```

### Pull Request Checklist

- [ ] Tests pass locally (`npm run test:all`)
- [ ] Code follows style guide
- [ ] Commit messages follow convention
- [ ] Documentation updated (if applicable)
- [ ] No breaking changes (or clearly documented)
- [ ] PR description explains changes clearly

### Code Review Guidelines

See [`.github/CONTRIBUTING.md`](../../.github/CONTRIBUTING.md) for comprehensive guidelines including:
- Immutability principles
- Testing requirements
- Documentation standards
- Git workflow

---

## Troubleshooting

### Issue: Tests Fail with "Module not found"

**Solution**: Ensure Node.js v20.19.0+ and ES6 modules enabled:
```bash
node --version  # Check version
npm install     # Reinstall dependencies
```

### Issue: Web Server Port Conflict

**Solution**: Use different port:
```bash
python3 -m http.server 8000
# Then navigate to http://localhost:8000/src/index.html
```

### Issue: Geolocation Permission Denied

**Solution**: Reset browser permissions:
- Chrome: Settings → Privacy → Site Settings → Location
- Firefox: Preferences → Privacy & Security → Permissions → Location

### Issue: ESLint Errors

**Solution**: Auto-fix with:
```bash
npm run lint:fix
```

### Issue: Jest Cache Issues

**Solution**: Clear Jest cache:
```bash
rm -rf .jest-cache
npm test
```

### Issue: Husky Hooks Not Running

**Solution**: Reinstall hooks:
```bash
npm run prepare
```

---

## Additional Resources

- [API Reference](../api/README.md)
- [Architecture Guide](../architecture/COMPREHENSIVE_GUIDE.md)
- [User Guide](../user/USER_GUIDE.md)
- [Testing Guide](../testing/TESTING.md)
- [Contributing Guidelines](../../.github/CONTRIBUTING.md)
- [Quick Reference Card](../guides/QUICK_REFERENCE_CARD.md)

---

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/mpbarbosa/guia_turistico/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mpbarbosa/guia_turistico/discussions)
- **Documentation**: See [docs/](../) directory

---

**Next Steps**:
1. ✅ Complete [Quick Start](#quick-start-5-minutes)
2. 📖 Read [Architecture Guide](../architecture/COMPREHENSIVE_GUIDE.md)
3. 🔍 Explore [API Reference](../api/README.md)
4. 🧪 Run tests and experiment
5. 🚀 Start contributing!

**Happy Coding! 🎉**
