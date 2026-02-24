# E2E Test Usage Guide

## Quick Reference

**DO NOT** run E2E tests with `npm test` - they will fail!

**Correct Commands**:

```bash
# Run E2E tests only (Node environment)
npm run test:e2e

# Run unit/integration tests only (jsdom environment)  
npm run test:unit

# Run both (sequentially)
npm run test:all-suites
```

## Why Separate Commands?

E2E tests use **Puppeteer** which requires a **Node.js environment**.
Unit tests use **jsdom** which simulates a browser DOM in Node.js.

These environments are **incompatible** and cannot run together.

## Test Statistics

**Unit/Integration Tests** (`npm run test:unit`):

- 2,574 passing
- 168 skipped
- 0 failing
- 95/100 suites passing
- ~31 seconds

**E2E Tests** (`npm run test:e2e`):

- 94 passing
- 1 failing (timing-dependent)
- 30 skipped
- 6/14 suites passing
- ~42 seconds

**Combined** (`npm run test:all-suites`):

- 2,668 passing
- 1 failing
- 198 skipped
- 101/114 suites passing
- ~73 seconds

## CI/CD Integration

In GitHub Actions, run:

```yaml
- run: npm run test:all-suites
```

This ensures both unit and E2E tests execute properly.

## Troubleshooting

**Error**: "ws does not work in the browser"

- **Cause**: Running E2E test with `npm test` (uses jsdom)
- **Fix**: Use `npm run test:e2e` instead

**Error**: "Your test suite must contain at least one test"

- **Cause**: Helper files matched by test pattern
- **Fix**: Helpers moved to `__tests__/helpers/` (excluded)

## Configuration Files

- `jest.config.e2e.js` - E2E tests (Node environment, 60s timeout)
- `jest.config.unit.js` - Unit tests (jsdom environment, 30s timeout)  
- `package.json` - Default config (jsdom, used by `npm test`)

## Writing E2E Tests

Place files in `__tests__/e2e/` and use `.e2e.test.js` suffix:

```javascript
// NO NEED for @jest-environment comment - config handles it
describe('E2E: My Feature', () => {
  // Use e2e-helpers for retry-based polling
  const { waitForElement, waitForElementText } = require('../helpers/e2e-helpers-lib');
  
  it('should work', async () => {
    await waitForElementText(page, '#result', 'Expected');
  });
});
```

## Reference

- **Created**: 2026-02-15
- **Checkpoint**: 002-e2e-test-configuration-fix.md
- **Related**: TESTING_IMPROVEMENTS_SUMMARY.md
