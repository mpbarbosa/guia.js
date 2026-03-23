# High Cohesion Guide

---

Last Updated: 2026-03-23
Status: Active
Category: Guide

---

Each class and module in Guia Turístico should have **one clear reason to
exist**. All of its methods should work together toward that single purpose.

## Signs of Low Cohesion (avoid)

- A class name ends in `Manager`, `Util`, or `Helper` and does unrelated things.
- Adding a new feature requires editing a class that "shouldn't" care about it.
- A single file has both UI rendering logic and API-fetching logic.

## The Single Responsibility Principle

> A class should have only one reason to change.

If you can describe a class's job using "and" (e.g. *fetches addresses **and**
formats HTML **and** speaks them aloud*), split it.

## Cohesion in Guia Turístico

The codebase is layered for cohesion:

| Layer | Responsibility |
|-------|---------------|
| `src/core/` | Pure data structures and geolocation state |
| `src/services/` | External API calls (geocoding, IBGE) |
| `src/data/` | Data transformation, caching, change detection |
| `src/html/` | DOM manipulation and display |
| `src/speech/` | Text-to-speech synthesis |
| `src/coordination/` | Wiring services together (orchestration only) |
| `src/views/` | View controllers (route-level orchestration) |

Keep new code in the right layer. Do not let display logic leak into `src/data/`
or network calls into `src/html/`.

## Refactoring for Cohesion

When a class grows beyond ~400 lines, look for natural split points:

1. Group methods by what data they operate on.
2. Extract each group into its own class.
3. Compose them in the original class (or delete the original and inject them separately).

## See Also

- [LOW_COUPLING_GUIDE.md](./LOW_COUPLING_GUIDE.md) — the complementary principle.
- [CODE_REVIEW_GUIDE.md](./CODE_REVIEW_GUIDE.md) — architecture checklist for reviews.
