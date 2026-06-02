# Milho Verde E2E Test Assessment

**Version**: 0.28.9-alpha
**Last Updated**: 2026-06-02

## Scope

This report assessed the former file
`__tests__/e2e/MilhoVerde-SerroMG.e2e.test.ts`
using
[`docs/guides/CODE_QUALITY_CONTROL_GUIDE.md`](../guides/CODE_QUALITY_CONTROL_GUIDE.md)
as the reference standard.

The stale test artifact was removed after this assessment was applied.

## Executive assessment

**Conclusion:** this file should **not** be kept as-is, and that recommendation
has now been applied.

It is currently a mislabeled, non-executed, integration-style regression
artifact rather than a real active E2E test. It also duplicates coverage that
already exists in the live integration suites and contains stale assertions that
no longer match the current `bairro`/`distrito` behavior.

## Current status

| Check | Assessment |
| --- | --- |
| Current status | Removed after assessment |
| Claimed role | E2E test |
| Actual role | Node-based fixture regression over data-layer classes |
| Active in `npm run test:e2e` | No |
| Main boundary under test | `GeoPosition` sanity checks plus `AddressDataExtractor`, `AddressExtractor`, `BrazilianStandardAddress`, and `ReferencePlace` |
| Browser flow exercised | No |
| Real assembled stack exercised | No |

### Why it is not an active E2E test

`jest.config.e2e.js` only matches:

- `**/__tests__/e2e/**/*.test.js`
- `**/__tests__/e2e/**/*.e2e.test.js`

The assessed file is `MilhoVerde-SerroMG.e2e.test.ts`, so it is outside the
active E2E runner. The repository's Puppeteer E2E command therefore does not
execute it.

The file also runs in `@jest-environment node`, mocks globals such as
`document`, `console`, `setupParams`, and `fetch`, and imports data-layer
classes directly. That makes it an integration-style fixture test, not a
browser-driven user-visible flow.

## Assessment against the Code Quality Control Guide

### 1. Responsibility gate — **fail**

The file is a catch-all test bucket rather than a focused boundary test. It
mixes:

- coordinate sanity checks
- fixed OSM fixture-shape assertions
- endereço padronizado extraction checks
- `ReferencePlace` construction checks
- `AddressExtractor` direct instantiation checks
- `BrazilianStandardAddress` formatting method checks
- IBGE/CEP/street-format micro-assertions

That breadth makes the file harder to classify, maintain, and trust.

### 2. Boundary gate — **fail**

The file does not test an E2E boundary. It does not drive the application
through a real browser interface, route, or assembled runtime stack. Instead it
exercises library-owned data and extractor classes directly from Node with test
doubles around the environment.

Per the repository's testing structure, this belongs at most in an integration
suite, not under the active E2E label.

### 3. Ubiquitous language gate — **fail**

The label "E2E" conflicts with the file's real behavior. In this repository,
E2E means browser-backed or user-flow-oriented checks. This file instead
behaves like a fixture-based extraction regression.

That naming mismatch makes the suite misleading for contributors and for any
automated validation flow.

### 4. Purity gate — **mixed**

The underlying scenario is a good candidate for deterministic fixture-based
assertions, but the file achieves that by broad global mutation:

- `global.document = undefined`
- mocked `global.console`
- mocked `global.setupParams`
- mocked `global.fetch`

That is workable for a focused integration regression, but it is noisy and
over-scoped for a file that is supposed to represent a single E2E scenario.

### 5. Test gate — **fail**

The repository already covers the useful Milho Verde / Camping Nozinho scenario
in active integration suites:

- [`__tests__/integration/data-modules.test.ts`](../../__tests__/integration/data-modules.test.ts)
- [`__tests__/integration/AddressDataExtractor-module.test.ts`](../../__tests__/integration/AddressDataExtractor-module.test.ts)

Those active tests already assert the normalized endereço padronizado output for:

- `logradouro`
- `numero`
- `distrito`
- `municipio`
- `siglaUF`
- `referencePlace`
- `logradouroCompleto()`
- `bairroCompleto()`
- `municipioCompleto()`
- `enderecoCompleto()`
- `toString()`

This means the assessed file is not adding a uniquely valuable boundary check in
its current location.

### 6. Validation gate — **fail**

Because the file is not matched by `jest.config.e2e.js`, its failures are
latent. That matters here because the file already contains stale expectations
that diverge from the current canonical address behavior:

1. It expects `bairroCompleto()` to return `''` when `bairro` is null and
   `distrito` is `"Milho Verde"`.
2. It expects `enderecoCompleto()` to omit `distrito` and return
   `"Rua Direita, 172, Serro, MG, 39150-000"`.

Those expectations no longer match the current repository behavior, where the
same scenario is asserted in active integration coverage as:

- `bairroCompleto() === 'Milho Verde'`
- `enderecoCompleto() === 'Rua Direita, 172, Milho Verde, Serro, MG, 39150-000'`

Because this file is inactive, that drift does not fail the real suite. That is
exactly the kind of silent quality regression the guide is meant to prevent.

## What is still useful in this file

The scenario itself is valuable:

- it uses a realistic Nominatim payload
- it exercises `city_district -> distrito`
- it verifies tourism reference-place extraction
- it checks a rural Brazilian address case that differs from common urban
  fixtures

The useful part is the **scenario**, not this file's current E2E classification.

## Recommended disposition

### Preferred recommendation

Do **not** keep this file as-is.

1. Keep the Milho Verde scenario in the active integration suites that already
   cover it.
2. Migrate any truly unique remaining assertion into those active suites if one
   is still missing.
3. Remove or reclassify this file rather than trying to "fix" it as E2E.

### Why this is preferred

- It restores a clear boundary between E2E and integration coverage.
- It avoids duplicate scenario maintenance.
- It removes an inactive file whose assertions have already drifted.
- It keeps the high-signal Milho Verde regression in suites that actually run.

## Alternative if the file must remain

If the repository intentionally wants this scenario to remain as a standalone
test artifact, it should be reclassified and rewritten as an **integration**
test, not an E2E test:

1. move it out of the E2E label/pathing
2. narrow it to one boundary
3. delete duplicated assertions already covered elsewhere
4. align all expectations with the current `bairro`/`distrito` contract

That is still weaker than the preferred option because the scenario already has
active coverage in better homes.

## Final recommendation

**Assessment result:** the file is **not useful as a current E2E test** and
should be treated as a redundant, stale, non-executed artifact.

**Applied action:** the Milho Verde scenario remains in active integration
coverage, and the stale `__tests__/e2e/MilhoVerde-SerroMG.e2e.test.ts`
artifact has been removed.
