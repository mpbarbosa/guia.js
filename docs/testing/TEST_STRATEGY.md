# Test Strategy Documentation

**Version**: 0.9.0+  
**Test Count**: 2,045 tests (1,899 passing, 146 skipped)  
**Coverage**: ~70% overall, 100% on critical components

## Overview

Guia Turístico uses a **dual test infrastructure** approach:

1. **Jest/Puppeteer** (`__tests__/`) - Primary testing, JavaScript-based
2. **Python/Playwright** (`tests/`) - Cross-browser validation

This strategy provides comprehensive coverage with specialized tools for each testing concern.

## Test Infrastructure Breakdown

### Jest/Puppeteer (`__tests__/`)

**Purpose**: Primary test suite for unit, integration, and E2E tests  
**Language**: JavaScript (Node.js)  
**Browser**: Chromium (headless)  
**Test Count**: 2,045 tests across 88 suites  
**Execution Time**: ~30-45 seconds  
**Command**: `npm test`

#### Directory Organization

```
__tests__/
├── unit/                      # Pure unit tests (no DOM/API)
│   ├── core/                  # Core classes (GeoPosition, PositionManager)
│   ├── data/                  # Data processing (extractors, validators)
│   ├── services/              # Services (geocoding, geolocation)
│   ├── html/                  # Display components
│   └── utils/                 # Utility functions
├── integration/               # Multi-component tests
│   ├── address-flow/          # Address fetching workflows
│   ├── position-updates/      # Position change coordination
│   └── observer-patterns/     # Observer pattern integration
├── e2e/                       # Full user workflows (Puppeteer)
│   ├── NeighborhoodChangeWhileDriving.e2e.test.js
│   ├── CompleteGeolocationWorkflow.e2e.test.js
│   ├── municipio-bairro-display.e2e.test.js
│   ├── complete-address-validation.e2e.test.js
│   └── milho-verde-locationResult.e2e.test.js
├── managers/                  # Service managers
├── external/                  # External API mocking
└── features/                  # Feature-specific tests
```

#### Why This Organization?

- **Unit**: Tests single components in isolation (fast, no dependencies)
- **Integration**: Tests component interaction (moderate speed, some dependencies)
- **E2E**: Tests complete user workflows (slower, full browser automation)
- **Managers**: Tests singleton and service coordination patterns
- **External**: Tests API integration with mocking
- **Features**: Tests business features end-to-end

### Python/Playwright (`tests/`)

**Purpose**: Cross-browser validation and visual regression  
**Language**: Python 3.11+  
**Browsers**: Chromium, Firefox, WebKit (Safari)  
**Command**: `pytest tests/e2e/`

#### Directory Organization

```
tests/
└── e2e/                       # Cross-browser E2E tests
    ├── test_geolocation.py    # Geolocation API tests
    ├── test_navigation.py     # SPA routing tests
    └── conftest.py            # Pytest fixtures
```

#### Why Python/Playwright?

- **Cross-browser**: Validates behavior across all major browsers
- **Visual Testing**: Screenshot comparison and visual regression
- **CI/CD Integration**: Separate validation stage in pipeline
- **Browser Diversity**: WebKit (Safari) not available in Puppeteer

## Test Execution Strategy

### Local Development

```bash
# Quick validation (<1 second)
npm run validate

# Full test suite (~45 seconds)
npm test

# With coverage report
npm run test:coverage

# Watch mode (TDD)
npm run test:watch

# Specific E2E test
npm test -- __tests__/e2e/NeighborhoodChangeWhileDriving.e2e.test.js

# Cross-browser tests (requires Python)
pytest tests/e2e/
```

### CI/CD Pipeline

1. **Syntax Validation** - `node -c` on all JS files
2. **Unit Tests** - Jest unit tests only (fastest feedback)
3. **Integration Tests** - Jest integration tests
4. **E2E Tests (Jest)** - Puppeteer E2E tests
5. **Cross-browser Tests** - Playwright tests (Chromium, Firefox, WebKit)
6. **Coverage Report** - Generate and upload coverage

### Pre-commit Hooks (.husky/)

```bash
.husky/
├── pre-commit     # Run syntax validation + unit tests
└── pre-push       # Run full test suite + coverage check
```

## Coverage Strategy

### Target Coverage

- **Overall**: 70% minimum (currently 69.82%)
- **Critical Paths**: 100% (PositionManager, ServiceCoordinator)
- **Business Logic**: 90%+ (geocoding, address processing)
- **Display Components**: 80%+ (UI rendering)
- **Utilities**: 100% (pure functions)

### Current Coverage Breakdown

| Component | Coverage | Target | Status |
|-----------|----------|--------|--------|
| PositionManager | 100% | 100% | ✅ |
| ServiceCoordinator | 95% | 90% | ✅ |
| ReverseGeocoder | 92% | 90% | ✅ |
| HTMLSidraDisplayer | 100% | 100% | ✅ |
| AddressExtractor | 88% | 90% | ⚠️ |
| Overall | 69.82% | 70% | ⚠️ |

### Gap Analysis

**Priority 1** - Increase to 70%:
- Add edge case tests for `AddressExtractor`
- Test error paths in `GeolocationService`
- Cover fallback logic in API fetchers

**Priority 2** - Maintain 100%:
- Keep critical singletons at 100%
- Maintain SIDRA displayer coverage
- Test all immutability patterns

## Test Types Explained

### Unit Tests

**Purpose**: Test single functions/classes in isolation  
**Speed**: Very fast (<100ms per test)  
**Dependencies**: None (mocked if needed)

**Example**:
```javascript
describe('GeoPosition', () => {
  it('should be immutable', () => {
    const pos = new GeoPosition(10, 20);
    expect(() => { pos.latitude = 30; }).toThrow();
  });
});
```

### Integration Tests

**Purpose**: Test component interaction  
**Speed**: Fast to moderate (100-500ms per test)  
**Dependencies**: Multiple real components

**Example**:
```javascript
describe('Address Fetching Flow', () => {
  it('should coordinate geocoder and displayer', async () => {
    const geocoder = new ReverseGeocoder(-23.55, -46.63);
    const displayer = new HTMLAddressDisplayer(mockElement);
    
    geocoder.subscribe(displayer);
    await geocoder.fetchAddress();
    
    expect(mockElement.innerHTML).toContain('São Paulo');
  });
});
```

### E2E Tests

**Purpose**: Test complete user workflows  
**Speed**: Slower (1-5 seconds per test)  
**Dependencies**: Full browser, DOM, APIs (mocked)

**Example**:
```javascript
describe('Complete Geolocation Workflow', () => {
  it('should track location changes while driving', async () => {
    await page.goto('http://localhost:9877/src/index.html');
    await page.click('#botaoObterLocalizacao');
    
    // Simulate movement
    await mockGeolocationChange(-23.55, -46.63);
    await page.waitForSelector('#bairroCard');
    
    expect(await page.$eval('#bairroCard', el => el.textContent))
      .toContain('Vila Mariana');
  });
});
```

## Custom Test Organization

### Why Not Standard Jest Structure?

The project uses a **domain-based organization** instead of Jest's default `__tests__` colocated structure:

**Benefits**:
1. **Centralized Testing**: All tests in one location for easy discovery
2. **Test Type Separation**: Clear distinction between unit/integration/E2E
3. **CI/CD Optimization**: Run test types independently in pipeline stages
4. **Documentation**: Tests serve as living documentation when grouped by concern

**Trade-offs**:
- Slightly longer import paths
- Need to maintain parallel structure with `src/`

## Skipped Tests (146)

### Why Skip Tests?

Tests are skipped for specific reasons:

1. **Browser-only Features** (80 tests) - Require DOM/browser APIs not available in Node.js
2. **External API Dependencies** (40 tests) - Require network access or rate-limited APIs
3. **Performance Tests** (20 tests) - Long-running, manual execution only
4. **Experimental Features** (6 tests) - Work in progress, not yet stable

### Managing Skipped Tests

```javascript
// Browser-only test
describe.skip('Speech Synthesis', () => {
  it('should speak address changes', () => {
    // Requires window.speechSynthesis API
  });
});

// External API test
it.skip('should fetch from SIDRA API', async () => {
  // Requires network access, may hit rate limits
});
```

## Best Practices

### Test Naming

```javascript
// ✅ Good: Descriptive, explains expected behavior
it('should update position when distance exceeds 20m threshold', () => {});

// ❌ Bad: Vague, unclear expectation
it('should work', () => {});
```

### Test Structure (AAA Pattern)

```javascript
it('should calculate distance correctly', () => {
  // Arrange - Set up test data
  const lat1 = -23.550520, lon1 = -46.633309;
  const lat2 = -23.551520, lon2 = -46.634309;
  
  // Act - Execute the operation
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  
  // Assert - Verify the result
  expect(distance).toBeCloseTo(157.23, 2);
});
```

### Mocking External Dependencies

```javascript
// Mock browser geolocation API
global.navigator.geolocation = {
  getCurrentPosition: jest.fn((success) => {
    success({ coords: { latitude: -23.55, longitude: -46.63 } });
  })
};
```

## Related Documentation

- [TEST_INFRASTRUCTURE.md](../testing/TEST_INFRASTRUCTURE.md) - Infrastructure comparison
- [CONTRIBUTING.md](../../.github/CONTRIBUTING.md) - Testing guidelines
- [TDD_GUIDE.md](../../.github/TDD_GUIDE.md) - Test-driven development
