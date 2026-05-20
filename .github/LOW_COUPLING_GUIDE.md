# Low Coupling Guide

This repository prefers narrow, explicit dependency boundaries so modules stay
replaceable, testable, and easier to evolve without cross-layer ripple effects.

## Source of Truth

Use [docs/guides/LOW_COUPLING_GUIDE.md](../docs/guides/LOW_COUPLING_GUIDE.md) as
the authoritative guide. This `.github/` copy exists so workflow reviews and
Copilot-oriented guidance can discover the rule in the expected location
without duplicating the full document.

## Repository-Specific Rules

1. Pass collaborators through constructors, setup methods, or explicit factory
   boundaries instead of creating them deep inside the class that uses them.
2. Depend on the smallest interface or shape a collaborator actually needs
   rather than importing broad concrete implementations.
3. Keep `src/coordination/` focused on wiring services, observers, and
   displayers, not on detailed rendering or low-level data transformation.
4. Keep `src/services/` concerned with external APIs and domain responses, not
   DOM updates, route control, or UI rendering.
5. Keep `src/html/` focused on browser and rendering responsibilities, not on
   reverse geocoding, caching, or broader service orchestration.
6. Keep singleton lookups such as shared managers at clear edge boundaries;
   pass narrower state or ports into deeper helpers instead of repeated
   `getInstance()` calls throughout the stack.
7. If one file imports several modules from different architectural layers to do
   one job, split the responsibility or introduce a narrower boundary.
8. Keep this `.github/` guide concise and link to related architectural guidance
   instead of copying full examples or extended explanations.

## Review Heuristic

If replacing a collaborator with a mock or fake requires changing the caller,
or a small feature change forces coordinated edits across `coordination`,
`services`, `html`, and `data`, the dependency boundary is probably too
concrete and coupling should be reduced.
