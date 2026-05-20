# TypeScript Best Practices

This repository is TypeScript-first: keep source code strongly typed, explicit
about runtime boundaries, and aligned with the strict ES2022 module patterns
used throughout `src/`.

## Source of Truth

Use `tsconfig.json`, [docs/architecture/ARCHITECTURE.md](../docs/architecture/ARCHITECTURE.md),
and the TypeScript sources under `src/` as the authoritative references for
this repository's coding conventions. This `.github/` copy exists so workflow
reviews and Copilot-oriented guidance can discover the rule in the expected
location without duplicating the full document.

## Repository-Specific Rules

1. Keep `src/` TypeScript-first: the repository has completed its migration to
   `.ts` source files, and `npm run validate` enforces `tsc --noEmit` under
   strict mode.
2. Honor the current compiler constraints in `tsconfig.json`, especially
   `strict`, `noUnusedLocals`, `noUnusedParameters`,
   `noFallthroughCasesInSwitch`, and `exactOptionalPropertyTypes`.
3. Use `import type` for type-only dependencies and keep them separate from
   runtime imports so emitted modules stay clean and intentions stay obvious.
4. Keep relative import specifiers ending in `.js` inside TypeScript source
   files, matching the repository's ES module and bundler conventions.
5. Prefer explicit interfaces and type aliases for shared shapes, and keep
   narrow contracts near the consuming module or in `src/types/` when reused
   across layers.
6. Accept `unknown` at integration boundaries and narrow it with type guards or
   validation helpers instead of relying on broad `any` or unchecked casts.
7. Use immutable, typed transformations for configuration and data shaping;
   prefer patterns like `Readonly<T>`, `Object.freeze`, `map`, `filter`, and
   copied arrays over mutating shared inputs.
8. Keep side effects explicit and localized: DOM updates, browser APIs, speech,
   geolocation, timers, and network calls should stay in clear boundary layers,
   leaving pure typed helpers easier to test and reuse.
9. Keep comments and JSDoc focused on intent, behavior, and public contracts
   rather than narrating obvious implementation steps.
10. Keep this `.github/` guide concise and link to related engineering guidance
    instead of copying long examples or extended tutorials.

## Review Heuristic

If a change introduces new `.js` source under `src/`, weakens strict-mode
assumptions with `any` or unchecked assertions, skips `import type` for
type-only dependencies, or mixes typed pure logic with boundary side effects,
it is probably drifting away from the repository's TypeScript conventions.
