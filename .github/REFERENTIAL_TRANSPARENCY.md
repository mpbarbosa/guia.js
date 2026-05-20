# Referential Transparency

This repository prefers pure, deterministic logic: given the same inputs, code
should return the same result and avoid hidden side effects or input mutation.

## Source of Truth

Use [docs/guides/REFERENTIAL_TRANSPARENCY.md](../docs/guides/REFERENTIAL_TRANSPARENCY.md)
as the authoritative guide. This `.github/` copy exists so workflow reviews and
Copilot-oriented guidance can discover the rule in the expected location
without duplicating the full document.

## Repository-Specific Rules

1. Prefer pure helper functions for calculations, formatting, parsing, and
   change detection; pass dependencies in as parameters instead of reading
   hidden globals when practical.
2. Do not mutate arrays or objects passed into a function; return new values
   with non-mutating patterns such as object spread, `map`, `filter`, and copied
   arrays before sorting or reversing.
3. Keep immutable value objects immutable: set their data through constructors
   or explicit creation helpers rather than public setters or in-place updates.
4. Isolate unavoidable side effects such as DOM updates, browser APIs, speech,
   geolocation, timers, and network calls behind focused coordinator, manager,
   service, or displayer layers.
5. Use `src/utils/TimerManager` for timer-based behavior instead of bare
   `setTimeout` or `setInterval`, so time-driven side effects stay explicit and
   controllable.
6. In tests, assert that pure transformations leave their inputs unchanged and
   produce the same outputs for the same inputs.
7. When state must change, make the boundary explicit and keep the mutation
   localized to the smallest responsible component.
8. Keep this `.github/` guide concise and link to related engineering guidance
   instead of copying long explanations or examples.

## Review Heuristic

If a function reads hidden mutable state, mutates its arguments, or mixes
calculation with DOM, timer, network, or browser side effects, it is probably
not referentially transparent and should be split so the pure logic can stand
on its own.
