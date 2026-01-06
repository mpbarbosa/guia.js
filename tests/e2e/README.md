# End-to-End (E2E) Tests

This directory contains end-to-end tests for the Guia Turístico application using Jest.

## Overview

E2E tests validate complete workflows and integration between multiple components, focusing on:
- Geolocation coordinate processing
- OpenStreetMap API integration
- Brazilian address format standardization
- IBGE data integration
- Reference place classification

## Test Structure

E2E tests follow the pattern from the `guia_js` library reference implementation:
- Mock external APIs (OpenStreetMap, fetch)
- Validate complete data flow from coordinates to formatted addresses
- Test Brazilian-specific address components (logradouro, municipio, uf, cep)
- Verify tourism and place classification mappings

## Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run all tests (unit + e2e + integration)
npm run test:all
```

## Test Files

- `MilhoVerde-SerroMG.e2e.test.js` - Complete address validation workflow for Milho Verde, Serro, MG
  - Coordinates: Lat -18.4696091, Lon -43.4953982
  - Tests OSM API integration, address extraction, and Brazilian address formatting

## Writing New E2E Tests

When adding new E2E tests:

1. Use CommonJS format (`require` instead of `import`)
2. Mock external dependencies (fetch, DOM, console)
3. Set up `global.setupParams` for application configuration
4. Use real data from OpenStreetMap for test scenarios
5. Validate complete workflows, not just individual functions
6. Follow the naming pattern: `Location-City.e2e.test.js`

## Test Environment

- **Environment**: Node.js (not jsdom)
- **Mocking**: Jest mocks for external APIs
- **Data**: Real OpenStreetMap responses for specific locations
- **Coverage**: E2E tests complement unit tests (pure functions) and integration tests (Selenium UI tests)

## Example Test Structure

```javascript
const { describe, test, expect, beforeEach } = require('@jest/globals');

// Setup mocks
global.fetch = jest.fn();
global.setupParams = { /* config */ };

describe('E2E: Location Test', () => {
    const EXPECTED_DATA = { /* OSM response */ };
    
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => EXPECTED_DATA
        });
    });
    
    describe('Test Category', () => {
        test('should validate specific behavior', () => {
            // Test implementation
        });
    });
});
```

## Notes

- E2E tests focus on integration between components from the `guia_js` library
- These tests validate data flow without requiring a browser environment
- For browser-based UI testing, see `tests/integration/` (Selenium tests)
- For pure function testing, see `tests/unit/` (Jest unit tests)
