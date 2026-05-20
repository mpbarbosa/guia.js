# Unit Test Guide

This repository requires focused unit tests: keep each test centered on one
behavior and isolate external dependencies.

## Source of Truth

Use [docs/guides/UNIT_TEST_GUIDE.md](../docs/guides/UNIT_TEST_GUIDE.md) as the
authoritative guide. This `.github/` copy exists so workflow reviews and
Copilot-oriented guidance can discover the rule in the expected location
without duplicating the full document.

## Repository-Specific Rules

1. Put TypeScript unit tests in `__tests__/` and mirror the relevant `src/`
   directory structure so source and test ownership stay aligned.
2. Use `npm run test:unit` for the repository's Jest TypeScript unit suite;
   reserve `npm test` for the broader default Jest run.
3. Test one unit or behavior at a time, use descriptive behavior-based names,
   and structure cases with Arrange-Act-Assert.
4. Replace browser APIs and external I/O with mocks or stubs, including
   `fetch`, `navigator.geolocation`, and `speechSynthesis`; unit tests must not
   make live network or platform calls.
5. Reset singleton, cache, timer, and other shared state in `beforeEach` and
   `afterEach` so tests remain order-independent.
6. Use Jest fake timers when exercising timer-driven logic instead of waiting
   on real time.
7. Keep assertions on observable behavior and public results rather than
   internal implementation details.
8. Keep this `.github/` guide concise and link to related testing guidance
   instead of copying long examples.

## Review Heuristic

If a test needs real network access, persistent shared state from another test,
or detailed knowledge of internal implementation to pass, it is probably no
longer a unit test and should be narrowed or moved to a broader test layer.
