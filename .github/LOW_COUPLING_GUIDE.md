# Low Coupling Guide

---

Last Updated: 2026-05-15
Status: Active
Category: Guide

---

Modules in Guia Turistico should depend on narrow contracts instead of concrete
implementations whenever practical. This keeps coordinators, services, and UI
adapters easier to test, replace, and reason about in isolation.

## Signs of High Coupling (avoid)

- A module imports a singleton directly when the dependency could be injected.
- A class depends on a concrete collaborator but only needs 2-3 methods from it.
- UI code mixes DOM rendering, network requests, caching, and route orchestration
  in the same file.
- Changing one service forces edits across unrelated `html/`, `data/`, and
  `coordination/` modules.

## Techniques for Low Coupling

### Dependency Injection

Pass collaborators through constructors or explicit setup methods instead of
hardwiring them inside the class:

```typescript
// Good - ServiceCoordinator receives collaborators from the outside
const coordinator = new ServiceCoordinator({
  geolocationService,
  reverseGeocoder,
  changeDetectionCoordinator,
  observerSubject,
  displayerFactory,
  document,
});
```

This keeps wiring at the composition boundary and lets tests swap focused test
doubles without rewriting the caller.

### Interface / Type Boundaries

Define the smallest interface that matches what the collaborator actually needs:

```typescript
interface IReverseGeocoderForCDC {
  currentAddress: unknown;
  enderecoPadronizado: unknown;
}

interface IAddressDataExtractorForCDC {
  setLogradouroChangeCallback(cb: ((changeDetails: unknown) => void) | null): void;
  setBairroChangeCallback(cb: ((changeDetails: unknown) => void) | null): void;
  setMunicipioChangeCallback(cb: ((changeDetails: unknown) => void) | null): void;
}
```

`ChangeDetectionCoordinator` follows this pattern so it can coordinate address
change callbacks without importing broader concrete implementations.

### Factory Methods at Composition Boundaries

Use factory methods where wiring is simple but should stay out of callers:

```typescript
const headerDisplayer = HTMLHeaderDisplayer.create(document);
```

This keeps construction details localized and avoids spreading setup logic
across route or bootstrap code.

### Keep Singletons at the Edge

This repository does use shared managers such as `PositionManager`,
`TimerManager`, and `AddressCache`, but direct singleton lookups should stay at
well-defined coordination boundaries. Prefer passing derived state or narrow
ports deeper into helpers, observers, and displayers instead of letting every
module call `getInstance()` on its own.

## Module-Level Rules

- Keep `src/coordination/` focused on wiring services, observers, and displayers
  through constructor parameters, setup methods, or small interfaces.
- Keep `src/services/` depending on external APIs and value types, not on DOM
  displayers or route controllers.
- Keep `src/html/` focused on rendering and browser APIs, not on reverse
  geocoding, caching, or service orchestration.
- Keep `src/data/` focused on extraction, normalization, caching, and change
  detection with no direct UI responsibilities.
- If a file imports many modules from different layers just to perform one task,
  split the responsibility or introduce a narrower boundary.

## Review Heuristic

If replacing a collaborator with a mock or fake requires changing the caller's
logic, the dependency boundary is probably too concrete. If one change forces
simultaneous edits across `coordination`, `services`, and `html`, coupling is
likely too high and the responsibility split should be revisited.

## See Also

- [HIGH_COHESION_GUIDE.md](./HIGH_COHESION_GUIDE.md) - cohesion and coupling
  should improve together.
- [REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md) - immutable data
  reduces accidental coupling through shared mutable state.
