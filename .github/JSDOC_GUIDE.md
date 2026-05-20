# JSDoc Guide

This repository expects JSDoc on public APIs so exported behavior, parameters,
return values, and versioned changes remain clear to readers and generated docs.

## Source of Truth

Use [docs/guides/JSDOC_GUIDE.md](../docs/guides/JSDOC_GUIDE.md) as the
authoritative guide. This `.github/` copy exists so workflow reviews and
Copilot-oriented guidance can discover the rule in the expected location
without duplicating the full document.

## Repository-Specific Rules

1. Document exported functions, classes, and public methods with a concise
   summary plus the tags needed for safe usage, especially `@param`,
   `@returns`, and `@throws` when applicable.
2. Add `@since` for new public APIs using the repository's prerelease version
   format, and keep version tags updated when a documented API is introduced.
3. Use examples for non-obvious behavior, constructors, or APIs with multiple
   call patterns so generated docs show real usage.
4. Describe responsibilities and observable behavior rather than repeating the
   implementation line by line.
5. Keep module and class docs aligned with the current architecture so public
   contracts stay in sync with `src/` ownership and layering.
6. Skip heavy JSDoc on private helpers, test-only utilities, and trivial local
   lambdas when an inline comment or readable naming is enough.
7. Use `npm run docs:generate` when you need to refresh generated API output in
   `docs/api-generated/`.
8. Keep this `.github/` guide concise and link to related documentation guidance
   instead of copying long templates or extended examples.

## Review Heuristic

If a public API lacks enough JSDoc for a caller to understand its inputs,
outputs, failure modes, or usage without reading the implementation, the
documentation is probably incomplete and should be strengthened before review
passes.
