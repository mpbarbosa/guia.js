# TDD Guide

This repository expects small Red-Green-Refactor cycles: write the failing
test first, make the narrowest change that passes, then refactor safely.

## Source of Truth

Use [docs/guides/TDD_GUIDE.md](../docs/guides/TDD_GUIDE.md) as the
authoritative guide. This `.github/` copy exists so workflow reviews and
Copilot-oriented guidance can discover the rule in the expected location
without duplicating the full document.

## Repository-Specific Rules

1. Write or update the failing test before implementation changes; start with
   `npm run test:unit` for TypeScript unit work and expand to broader suites
   only when the change crosses that boundary.
2. Keep each TDD step small: one behavior, one failing reason, and the minimum
   production code needed to turn red to green.
3. Name tests by observable behavior rather than implementation details, and
   structure cases with Arrange-Act-Assert.
4. Replace browser APIs and external I/O with mocks or stubs, including
   `fetch`, `navigator.geolocation`, and `speechSynthesis`; the red/green
   signal should come from the unit under test, not live dependencies.
5. Refactor only after the relevant tests are green, preserving public behavior
   while reducing duplication and improving clarity.
6. Reset singleton, cache, timer, and other shared state in `beforeEach` and
   `afterEach` so every red-green cycle stays deterministic.
7. Use Jest fake timers when exercising timer-driven logic instead of waiting
   on real time.
8. Keep this `.github/` guide concise and link to related testing guidance
   instead of copying long walkthroughs or examples.

## Review Heuristic

If implementation code appears before the failing test, or a "green" step
depends on broad unrelated changes, real I/O, or hidden shared state, the
change is drifting away from TDD and should be reduced back to a small
Red-Green-Refactor cycle.
