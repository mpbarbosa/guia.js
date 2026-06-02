# DRY Guide

This guide defines how **Guia Turístico** (guia.js) keeps code, configuration,
tests, and documentation free from duplicated knowledge.

## Source of truth

Use this guide together with:

- [Architecture Guide](../architecture/ARCHITECTURE.md)
- [Code Quality Control Guide](./CODE_QUALITY_CONTROL_GUIDE.md)
- [High Cohesion Guide](./HIGH_COHESION_GUIDE.md)
- [Low Coupling Guide](./LOW_COUPLING_GUIDE.md)
- [Terminology Guide](./TERMINOLOGY_GUIDE.md)

## Goal

Every rule, threshold, label, and documentable fact should have one
authoritative home in the repository. When that knowledge changes, the change
should happen in one place and propagate everywhere else through references,
abstractions, or shared helpers rather than coordinated edits across copies.

## What DRY Means

DRY means the system has one canonical source for each fact or behavior.
Duplication is replaced by a reference or an abstraction that names the shared
knowledge explicitly.

A DRY guia.js codebase can answer questions like these with one obvious source:

- "Position thresholds live in `src/config/defaults.ts`, not in multiple
  coordinators or displayers."
- "Address normalization lives in `src/data/AddressExtractor.ts` and
  `src/data/BrazilianStandardAddress.ts`, not in services and HTML displayers."
- "Button enable/disable messaging lives in `src/utils/button-status.ts`, not
  in repeated DOM snippets across views."
- "Canonical vocabulary lives in `docs/guides/TERMINOLOGY_GUIDE.md`, not in
  conflicting prose copies."

If changing one rule requires a grep-and-edit sweep across copied logic or
duplicated docs, the repository is not DRY enough.

## Why It Matters

1. It reduces the cost of change because one edit should cover one rule.
2. It prevents drift between TypeScript modules, tests, and documentation.
3. It makes architecture boundaries easier to preserve and review.
4. It lowers regression risk when refactors touch shared behavior.
5. It keeps docs authoritative instead of allowing multiple nearly-identical
   guides to diverge.

## DRY and Code LLMs

DRY also improves the quality of LLM-assisted coding.

Code-focused models perform better when each fact has a clear home. When logic
or documentation is duplicated across files, a model may update one copy, miss
another, and leave the repository in a contradictory state. A single
authoritative source makes the safe edit target easier to find.

### Why LLMs Benefit

- A single source of truth gives the model a clear place to edit.
- Named shared helpers make the intent of the abstraction obvious.
- Centralized config reduces partial updates to thresholds or routes.
- Cross-linked docs reduce the chance of contradictory prose.
- Smaller, localized diffs make review and follow-up safer.

### Where Duplication Hurts LLMs

- Copied logic may be updated in one module and missed in another.
- Repeated constants can silently diverge between runtime code and tests.
- Repeated docs can disagree about the same repository rule.
- The model may reason from a stale copy because no canonical source is obvious.

## Required Rules

1. Extract logic that appears more than once into a named helper, module, or
   value object.
2. Keep configuration in `src/config/` or another single authoritative module,
   and reference it everywhere else.
3. Do not duplicate business rules across `src/data/`, `src/coordination/`,
   `src/services/`, and UI layers; own the rule once and delegate.
4. Do not duplicate terminology, policy, or process guidance across documents;
   write it once and cross-link.
5. Prefer parameterization over branched copies of similar logic.
6. Treat fixtures, selectors, error messages, and validation rules as knowledge
   that also needs a canonical home.
7. Remove "keep in sync" duplication by eliminating the extra copy, not by
   documenting the drift risk.

## Positive Signals

- A rule change usually requires editing one file.
- Shared behavior has a name that explains the concept it encodes.
- Configuration values are imported from one place.
- UI helpers reuse shared formatting, labels, and button-state helpers.
- Tests share builders or fixtures where the scenario is truly the same.
- Documentation links to the authoritative guide instead of restating it.

## Warning Signs

- The same parsing, normalization, or validation logic appears in multiple
  layers.
- A constant value is hardcoded in more than one file.
- Two guides describe the same repository rule differently.
- The same selector, fixture payload, or mock shape is copy-pasted with minor
  edits.
- Comments such as "keep in sync with X" guard duplicate code or docs.
- A change to one rule requires touching code, tests, and docs because they
  each carry their own copy of the rule.

## Applying DRY by Repository Surface

| Surface | DRY approach |
| --- | --- |
| `src/config/` | Keep thresholds, routes, CSP, and environment defaults in one config entry point |
| `src/core/` and `src/data/` | Own invariants, normalization, and value semantics once and expose them through stable APIs |
| `src/coordination/` and `src/services/` | Delegate shared policy logic to lower layers instead of reimplementing it during orchestration |
| `src/html/`, `src/components/`, and `src/composables/` | Reuse shared labels, formatters, and UI state helpers instead of hand-rolling repeated DOM logic |
| `__tests__/` and `tests/` | Share fixtures or helpers when the same scenario is being asserted across suites; avoid blind copy-paste with drift |
| `docs/` | Define each policy or glossary term once, then cross-link |

Keep the single source of truth as close as possible to the concept it owns,
and let other layers import, call, or reference it.

## Best Practices

### When Creating a New File

1. Search for an existing implementation or guide before adding a new one.
2. Extract shared logic when the same rule is needed in two places.
3. Import configuration and constants instead of redefining them locally.
4. Name abstractions after the rule or concept they encode.

### When Creating Functions or Classes

1. Call the existing helper instead of restating its logic inline.
2. Parameterize variants instead of maintaining near-duplicate branches.
3. Keep invariant enforcement close to the value object or data module that owns
   it.
4. Keep adapter and UI layers thin when a lower-level abstraction already owns
   the rule.

### When Writing Tests

1. Reuse builders, fixtures, and helper payloads when the same scenario is under
   test.
2. Do not duplicate a long fixture only to assert one small variant; derive the
   variant from the base fixture when practical.
3. Keep the suite boundaries clear so the same behavior is not re-tested
   needlessly at every layer without purpose.

### When Writing Documentation

1. Write each rule, definition, or policy in one guide.
2. Link to that guide from related docs instead of copying paragraphs.
3. When two docs have drifted, pick one authoritative version and remove the
   duplicate wording.
4. Prefer guide-level references over repeating policy blocks in API docs.

## Refactoring for DRY

When duplication has accumulated, reduce it deliberately:

1. Identify the copies and decide which one is authoritative.
2. Extract the shared logic, config, fixture, or prose into one named location.
3. Replace copies with imports, helper calls, shared fixtures, or links.
4. Delete the redundant copies.
5. Rename the extracted abstraction if its purpose is still unclear.
6. Verify that the canonical source covers every case the copies handled.

## Review Heuristics

### Single-Source Test

If one rule changes, how many files must be edited? If the answer is more than
one, duplicated knowledge probably exists.

### Name Test

Does the repeated behavior have a clear abstraction name? If not, the codebase
may still be carrying unnamed duplication.

### Drift Test

Are the copies still identical? If they have diverged, one is already wrong and
the duplication has become a defect.

### Search Test

Can a contributor find the canonical source for the rule with one obvious
lookup? If not, the repository likely lacks a true source of truth.

### Sync Comment Test

Does a code comment or doc note say "keep in sync with"? Treat that as a sign
to remove duplication rather than a durable solution.

## Preferred Fixes

1. Extract duplicate logic into a named helper, module, or value object.
2. Move repeated constants into a shared config or constant module.
3. Replace repeated DOM status logic with existing UI helpers.
4. Consolidate repeated test payloads into shared fixtures or builders.
5. Remove duplicate docs and replace them with cross-links to the canonical
   guide.
6. Delete "keep in sync" comments by deleting the extra copy they were guarding.

## Summary Checklist

- [ ] Each business rule, threshold, or policy lives in one place.
- [ ] Constants and configuration values are defined once and imported.
- [ ] Shared behavior has a clear name.
- [ ] No duplicated helper exists solely with a different local spelling.
- [ ] Tests reuse shared fixtures where appropriate instead of copying them.
- [ ] Documentation is cross-linked rather than duplicated.
- [ ] A reviewer can find the canonical source for any rule with one obvious
      lookup.
