# High Cohesion Guide

This repository requires high-cohesion changes: keep each file, symbol, and
document focused on one clear responsibility.

## Source of Truth

Use [docs/guides/HIGH_COHESION_GUIDE.md](../docs/guides/HIGH_COHESION_GUIDE.md)
as the authoritative guide. This `.github/` copy exists so workflow reviews and
Copilot-oriented guidance can discover the rule in the expected location
without duplicating the full document.

## Repository-Specific Rules

1. Keep `src/core/` focused on immutable geolocation state, observers, and
   foundational runtime primitives with no DOM rendering or HTTP concerns.
2. Keep `src/services/` focused on external I/O such as geocoding, IBGE, SIDRA,
   and Overpass access with no UI rendering or route orchestration logic.
3. Keep `src/data/` focused on address extraction, normalization, caching, and
   change detection with no direct DOM manipulation.
4. Keep `src/html/` focused on DOM display and UI adapters with no network
   calls or business-rule orchestration.
5. Keep `src/speech/` focused on speech synthesis composition, queuing, and
   voice selection with no reverse-geocoding or display responsibilities.
6. Keep `src/coordination/` and `src/views/` focused on wiring and route-level
   orchestration; delegate concrete work to the services, data, html, and
   speech layers instead of accumulating mixed logic there.
7. Keep `src/utils/` focused on small shared helpers such as timer and button
   state support; if a helper starts coordinating features, move that logic to a
   dedicated module.
8. Keep each document focused on one topic and link to related guidance instead
   of copying large sections between files.

## Review Heuristic

If the best one-sentence description of a file or symbol needs repeated "and",
the responsibility is probably too broad and should be split.
