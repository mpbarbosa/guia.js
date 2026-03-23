# TDD Guide — Test-Driven Development

---

Last Updated: 2026-03-23
Status: Active
Category: Guide

---

Guia Turístico follows the **Red–Green–Refactor** TDD cycle.

## The Cycle

```
1. RED    — Write a failing test for the behaviour you want.
2. GREEN  — Write the minimum code to make the test pass.
3. REFACTOR — Clean up without breaking the test.
```

Repeat for each new behaviour.

## Rules

- Write the test **before** writing the implementation.
- One logical assertion per test (multiple `expect` calls are fine when they
  test the same behaviour from different angles).
- Test names describe the expected behaviour, not the implementation:
  - ✅ `'returns null when address has no road'`
  - ❌ `'test the getRoad() function'`

## Test Structure (Arrange–Act–Assert)

```typescript
test('returns the formatted address when all fields are present', () => {
  // Arrange
  const address = new BrazilianStandardAddress({ road: 'Rua das Flores', city: 'Recife' });

  // Act
  const result = address.format();

  // Assert
  expect(result).toBe('Rua das Flores, Recife');
});
```

## What Belongs in a Unit Test

- One class / one function in isolation.
- Dependencies are replaced with mocks or stubs.
- No network calls, no file I/O, no timers (use Jest fake timers).

## Running the Test Suite

```bash
# All tests (JS + TS)
npm test

# TypeScript unit tests only
node --experimental-vm-modules node_modules/jest/bin/jest.js --config jest.config.unit.js

# Watch mode (during development)
npm run test:watch
```

## See Also

- [UNIT_TEST_GUIDE.md](./UNIT_TEST_GUIDE.md) — patterns for common test scenarios.
- [CODE_REVIEW_GUIDE.md](./CODE_REVIEW_GUIDE.md) — test checklist for reviewers.
