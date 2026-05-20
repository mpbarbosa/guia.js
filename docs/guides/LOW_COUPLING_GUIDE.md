# Low Coupling Guide

## What Low Coupling Means

Low coupling means modules depend on narrow, explicit contracts instead of broad
knowledge of each other's internals. In this repository, that keeps
coordinators, services, data objects, and HTML displayers easier to test,
replace, and reason about in isolation.

## Why It Matters

Low coupling makes the codebase more maintainable:

- Changes stay localized instead of rippling across unrelated modules.
- Tests can replace collaborators with focused mocks, fakes, or stubs.
- Composition stays near bootstrap and coordinator boundaries.
- Domain logic remains reusable outside a specific DOM or service context.

## Signs of High Coupling

Watch for these warning signs:

- A module imports a singleton directly when the dependency could be injected.
- A class depends on a concrete collaborator but only needs a few methods.
- One file mixes DOM rendering, network requests, caching, and orchestration.
- A small change forces edits across `coordination/`, `services/`, `html/`, and
  `data/` at the same time.
- A test can only replace a dependency by rewriting the caller's logic.

## Techniques for Low Coupling

### Dependency Injection

Pass collaborators through constructors or explicit setup methods instead of
creating them deep inside the class.

```typescript
const coordinator = new ServiceCoordinator({
  geolocationService,
  reverseGeocoder,
  changeDetectionCoordinator,
  observerSubject,
  displayerFactory,
  document,
});
```

This keeps wiring at the composition boundary and lets tests substitute focused
test doubles.

### Narrow Interface Boundaries

Define the smallest interface that matches what a collaborator actually needs.

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

This pattern keeps callers from depending on unrelated capabilities of a larger
concrete implementation.

### Factory Methods at Composition Boundaries

Use factory methods when construction details belong at the edge, not in every
caller.

```typescript
const headerDisplayer = HTMLHeaderDisplayer.create(document);
```

This localizes setup logic and keeps route or bootstrap code focused on wiring.

### Keep Singletons at the Edge

This repository does use shared managers such as `PositionManager`,
`TimerManager`, and `AddressCache`, but direct singleton access should stay at
well-defined boundaries. Prefer passing derived state or narrow ports deeper
into helpers, observers, and displayers instead of letting many modules call
`getInstance()` independently.

## Layer-Specific Guidance

### `src/coordination/`

- Focus on wiring services, observers, and displayers.
- Accept collaborators through constructor parameters, setup methods, or narrow
  interfaces.
- Avoid embedding detailed business logic that belongs in lower-level helpers.

### `src/services/`

- Depend on external APIs, request/response mapping, and value types.
- Avoid direct DOM manipulation or route-control responsibilities.

### `src/html/`

- Focus on rendering, user interaction, and browser APIs.
- Avoid geocoding, caching, or service-orchestration responsibilities.

### `src/data/`

- Focus on extraction, normalization, caching, and change detection.
- Avoid direct UI responsibilities or route management.

## Review Heuristic

Use these checks during review:

1. If replacing a dependency with a mock requires changing the caller's logic,
   the boundary is probably too concrete.
2. If one change forces simultaneous edits across several architecture layers,
   coupling is probably too high.
3. If a file imports many modules from different layers just to perform one
   task, split the responsibility or introduce a narrower boundary.

## Related Guides

- [HIGH_COHESION_GUIDE.md](./HIGH_COHESION_GUIDE.md) - cohesion and coupling
  should improve together.
- [REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md) - immutable data
  reduces accidental coupling through shared mutable state.
- [MODULE_SPLITTING_GUIDE.md](./MODULE_SPLITTING_GUIDE.md) - practical guidance
  for extracting smaller, less coupled modules.
