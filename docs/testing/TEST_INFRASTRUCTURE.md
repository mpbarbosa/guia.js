# Test Infrastructure Documentation

**Last Updated**: 2026-01-16  
**Version**: 0.7.1-alpha  
**Purpose**: Clarify the distinction between Jest and Playwright test suites

## Overview

Guia Turístico uses **two separate test infrastructures** for different testing purposes:

1. **Jest/Puppeteer** (`__tests__/`) - Primary JavaScript unit and E2E tests
2. **Python/Playwright** (`tests/`) - Cross-browser validation and visual regression

## Test Infrastructure Comparison

| Feature | Jest/Puppeteer (`__tests__/`) | Python/Playwright (`tests/`) |
|---------|-------------------------------|------------------------------|
| **Language** | JavaScript (Node.js) | Python 3.11+ |
| **Purpose** | Unit, integration, E2E tests | Cross-browser validation |
| **Browsers** | Chromium (headless) | Chrome, Firefox, Safari/WebKit |
| **Test Count** | 1,968 tests (1,820 passing) | Separate test suite |
| **Execution** | `npm test` | `pytest tests/e2e/` |
| **Speed** | ~45 seconds | Varies by browser |
| **CI/CD** | Primary test suite | Secondary validation |
| **Coverage** | Jest coverage reports | Playwright traces |

## Directory Structure

### Jest/Puppeteer: `__tests__/`
```
__tests__/
├── unit/              # Unit tests (pure JavaScript)
├── integration/       # Integration tests (multiple components)
├── e2e/              # End-to-end tests (full workflows)
│   ├── NeighborhoodChangeWhileDriving.e2e.test.js
│   ├── CompleteGeolocationWorkflow.e2e.test.js
│   └── municipio-bairro-display.e2e.test.js
├── managers/         # Service manager tests
├── external/         # External API integration tests
└── ui/              # UI component tests
```

### Python/Playwright: `tests/`
```
tests/
└── e2e/             # Cross-browser E2E tests
    ├── test_geolocation.py
    ├── test_navigation.py
    └── conftest.py  # Pytest fixtures
```

## When to Use Each Infrastructure

### Use Jest/Puppeteer (`__tests__/`) for:
✅ **Daily development** - Fast feedback loop  
✅ **Unit and integration tests** - Component isolation  
✅ **CI/CD pipeline** - Primary automated testing  
✅ **Code coverage** - Jest coverage reports  
✅ **Debugging** - Node.js debugging tools  

### Use Python/Playwright (`tests/`) for:
✅ **Cross-browser testing** - Chrome, Firefox, Safari  
✅ **Visual regression** - Screenshot comparisons  
✅ **CI/CD validation** - Pre-release browser checks  
✅ **Production readiness** - Real browser testing  
✅ **Accessibility testing** - Playwright accessibility tools  

## Execution Commands

### Jest/Puppeteer Tests
```bash
# Run all tests (~45 seconds)
npm test

# Run specific E2E test
npm test -- __tests__/e2e/NeighborhoodChangeWhileDriving.e2e.test.js

# Run with coverage
npm run test:coverage

# Watch mode (development)
npm run test:watch
```

### Python/Playwright Tests
```bash
# Install dependencies (first time)
pip install -r tests/requirements.txt
playwright install

# Run all E2E tests
pytest tests/e2e/

# Run specific browser
pytest tests/e2e/ --browser chromium

# Run with headed browser (visible)
pytest tests/e2e/ --headed

# Generate test report
pytest tests/e2e/ --html=report.html
```

## Test Strategy by Project Phase

### Development Phase (Current: v0.7.1-alpha)
- **Primary**: Jest/Puppeteer for rapid iteration
- **Secondary**: Manual Python/Playwright spot checks

### Pre-Release Phase (v0.8.0+)
- **Primary**: Jest/Puppeteer for regression testing
- **Secondary**: Full Python/Playwright cross-browser suite

### Production Release (v1.0.0)
- **Primary**: Both test suites must pass
- **Secondary**: Visual regression tests
- **Required**: Cross-browser compatibility verification

## CI/CD Integration

### Current GitHub Actions Workflow
```yaml
# .github/workflows/copilot-coding-agent.yml
- Jest/Puppeteer: Runs on every push ✅
- Python/Playwright: Runs on pull requests (optional) ⚠️
```

### Recommended CI/CD Strategy
1. **Pull Request**: Jest/Puppeteer (fast feedback)
2. **Merge to main**: Jest + Python/Playwright (full validation)
3. **Release tags**: Jest + Python/Playwright + Visual regression

## Test File Naming Conventions

### Jest/Puppeteer
- Unit tests: `*.test.js` (e.g., `CurrentPosition.test.js`)
- E2E tests: `*.e2e.test.js` (e.g., `CompleteGeolocationWorkflow.e2e.test.js`)
- Integration: `*.integration.test.js`

### Python/Playwright
- E2E tests: `test_*.py` (e.g., `test_geolocation.py`)
- Fixtures: `conftest.py`

## Dependencies

### Jest/Puppeteer Dependencies
```json
{
  "jest": "^30.1.3",
  "puppeteer": "^24.35.0",
  "jsdom": "^25.0.1"
}
```

### Python/Playwright Dependencies
```txt
pytest>=7.4.0
playwright>=1.40.0
pytest-html>=3.2.0
```

## Troubleshooting

### Jest/Puppeteer Issues
```bash
# Clear Jest cache
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose

# Debug specific test
node --inspect-brk node_modules/.bin/jest __tests__/e2e/test.e2e.test.js
```

### Python/Playwright Issues
```bash
# Reinstall browsers
playwright install --force

# Run with traces
pytest tests/e2e/ --tracing on

# Debug mode
pytest tests/e2e/ -s --headed
```

## Future Enhancements

**Planned Improvements**:
1. Unified test reporting dashboard
2. Automated visual regression testing
3. Performance testing integration
4. Mobile device testing (Playwright)
5. API contract testing

## Related Documentation

- `__tests__/e2e/NeighborhoodChangeWhileDriving.README.md` - E2E test documentation
- `docs/testing/TESTING.md` - Comprehensive testing guide
- `.github/CONTRIBUTING.md` - Contribution workflow
- `package.json` - Jest configuration

---

**Status**: Dual infrastructure operational  
**Primary**: Jest/Puppeteer (1,820 tests passing)  
**Secondary**: Python/Playwright (cross-browser validation)
