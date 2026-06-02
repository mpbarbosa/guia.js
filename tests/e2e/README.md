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

This legacy directory no longer carries active Jest E2E scenarios.
Milho Verde payload regressions now live in the executed integration suite:

- `__tests__/integration/data-modules.test.ts`
- `__tests__/integration/AddressDataExtractor-module.test.ts`

The stale `__tests__/e2e/MilhoVerde-SerroMG.e2e.test.ts` artifact was removed
after the docs/testing audit because it was not part of the active E2E runner.

## Writing New E2E Tests

When adding new E2E tests:

1. Add browser-level E2E coverage under `__tests__/e2e/`
2. Keep fixture-based payload regressions in `__tests__/integration/`
3. Use real data from OpenStreetMap for scenario fixtures
4. Validate production code paths, not the fixture literals themselves

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

- Browser-based Jest E2E tests live under `__tests__/e2e/`
- Fixture-driven address-pipeline regressions live under `__tests__/integration/`
- For Selenium-based browser validation, see `tests/integration/`
