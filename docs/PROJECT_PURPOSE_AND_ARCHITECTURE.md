# Project Purpose and Architecture

---

Last Updated: 2026-03-23
Status: Active
Category: Overview

---

> For the full architecture reference, see
> [docs/architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md).
> This file is a short orientation guide for new contributors.

## What Is Guia Turístico?

Guia Turístico is a single-page web application (SPA) that acts as an
interactive tourist guide. It uses the browser's Geolocation API to track
the user's position in real time, reverse-geocodes coordinates via
OpenStreetMap Nominatim, and announces street, neighbourhood, and city
changes using speech synthesis.

**Target context:** A user driving or walking through a Brazilian city who
wants to know where they are without looking at the screen.

## Core Architecture in One Diagram

```
Browser Geolocation API
        │
        ▼
GeolocationService  ──throttle──►  PositionManager (20 m / 30 s filter)
                                          │
                                          ▼
                                   ReverseGeocoder  (Nominatim API)
                                          │
                                          ▼
                                   AddressCache  (LRU + confirmation buffers)
                                          │
                          ┌───────────────┼───────────────┐
                          ▼               ▼               ▼
                  logradouro          bairro          municipio
                  callback            callback         callback
                          │               │               │
                          └───────────────┴───────────────┘
                                          │
                              HTMLAddressDisplayer / SpeechSynthesisManager
```

## Key Design Principles

1. **Immutability** — data flows downward; components never mutate inputs.
   See [REFERENTIAL_TRANSPARENCY.md](../.github/REFERENTIAL_TRANSPARENCY.md).

2. **Low coupling** — services are injected, not imported as singletons
   inside business logic. See [LOW_COUPLING_GUIDE.md](../.github/LOW_COUPLING_GUIDE.md).

3. **High cohesion** — each layer has one job (fetch / transform / display).
   See [HIGH_COHESION_GUIDE.md](../.github/HIGH_COHESION_GUIDE.md).

4. **Testability** — the confirmation buffer, throttle, and all displayers
   accept injected dependencies so tests need no browser APIs.

## Entry Points

| File | Role |
|------|------|
| `src/app.ts` | SPA entry point — router, view controllers |
| `src/index.html` | Single HTML page |
| `src/config/defaults.ts` | All application constants |
| `src/coordination/ServiceCoordinator.ts` | Wires all services together |

## Further Reading

- [docs/architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md) — full reference
- [docs/architecture/CLASS_DIAGRAM.md](architecture/CLASS_DIAGRAM.md) — class relationships
- [docs/architecture/MODULES.md](architecture/MODULES.md) — module dependency map
- [CONTRIBUTING.md](../.github/CONTRIBUTING.md) — how to contribute
