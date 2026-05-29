# Architecture Refactor Roadmap

---

**Last Updated**: 2026-05-28
**Status**: Proposed
**Category**: Architecture
**Scope**: Near-term implementation roadmap

---

**Navigation**: [🏠 Documentation Hub](../README.md) | [📖 Complete Index](../INDEX.md) | [🏗️ Architecture Overview](../ARCHITECTURE.md)

---

## Summary

This roadmap turns the architecture assessment into an implementation sequence focused on three improvements with the highest return:

1. Export coordinator service contracts from `src/types/` so dependency boundaries are reusable and test-visible.
2. Restore composition-root discipline by moving view-layer service wiring behind `WebGeocodingManager`.
3. Replace static-only displayer creation with an injectable factory contract that is easy to mock.

The goal is not to redesign the whole application. The goal is to make the existing coordination model consistent, easier to test, and less sensitive to CDN-backed service changes.

## Why this roadmap exists

The current codebase already applies good architectural patterns, but not consistently:

- `src/coordination/ServiceCoordinator.ts` defines six useful local interfaces, but they are private to that file.
- `src/views/home.ts` still imports `planRoute` from `RouteNavigationService` and snapshot helpers from `OfflineCacheService` directly.
- `WebGeocodingManager` has dependency injection hooks, but some defaults are still constructed inline.
- `DisplayerFactory` is treated as a static class, which limits test replacement even though the coordination layer already wants a factory abstraction.

## Success criteria

This roadmap is complete when the codebase reaches all of the following:

- View controllers depend on `WebGeocodingManager` for orchestration instead of importing route-planning and cache services directly.
- Shared coordinator contracts live in `src/types/` and are reused across coordinators and tests.
- Displayer creation is injectable through an exported interface or default factory object.
- Existing public behavior remains stable during the migration, with explicit deprecations where call sites must move.

## Non-goals

This roadmap intentionally does **not** include:

- a full Clean Architecture rewrite
- use-case / presenter rings for every workflow
- a dependency injection container
- broad service-layer rewrites unrelated to the composition root problem

## Scope boundaries

| In scope | Out of scope |
|---|---|
| `ServiceCoordinator` interface extraction | Rewriting all services behind new domain abstractions |
| `WebGeocodingManager` ownership of view-facing service wiring | Replacing every direct service-to-service call in the codebase |
| `home.ts` migration away from direct `RouteNavigationService` and `OfflineCacheService` imports | Reworking `IBGECityStatsService` internals unless required by the migration |
| `DisplayerFactory` contract and injection cleanup | Introducing a DI container or plugin framework |

## Recommended phase order

| Phase | Priority | Why first |
|---|---|---|
| Phase 0 - Baseline and migration guardrails | P0 | Prevents ambiguous scope and accidental API breaks |
| Phase 1 - Shared coordinator contracts | P1 | Creates the reusable type boundary that later phases consume |
| Phase 2 - Composition root discipline | P1 | Removes the most visible view-layer coupling |
| Phase 3 - Injectable displayer factory | P2 | Finishes the testability gap once contract boundaries are in place |
| Phase 4 - Cleanup and deprecation removal planning | P3 | Leaves a clear, low-risk tail after behavior is stable |

## Phase 0 - Baseline and migration guardrails

**Objective**: define the migration boundary before moving code.

### Deliverables

- Confirm the initial contract set extracted from `ServiceCoordinator`:
  - `IGeolocationServiceForSC`
  - `IReverseGeocoderForSC`
  - `IChangeDetectionCoordinatorForSC`
  - `IObserverSubjectForSC`
  - `IDisplayerFactory`
  - `IDisplayers`
- Document the view-layer migration target: `src/views/home.ts` should stop importing:
  - `planRoute` from `src/services/RouteNavigationService.ts`
  - `saveLocationSnapshot` / `getLatestLocationSnapshot` from `src/services/OfflineCacheService.ts`
- Decide and document the compatibility policy:
  - keep existing module exports temporarily
  - mark them deprecated for view-layer use
  - move callers to `WebGeocodingManager` first

### Acceptance criteria

- A reviewer can identify exactly which call sites are migrating in this roadmap.
- The roadmap names what stays stable, what becomes deprecated, and what is deferred.

## Phase 1 - Shared coordinator contracts

**Objective**: move ServiceCoordinator's local dependency interfaces into `src/types/` and make them reusable.

### Implementation

1. Create a shared type module such as `src/types/coordinator-services.ts`.
2. Move the six local interfaces currently declared in `src/coordination/ServiceCoordinator.ts` into that module.
3. Update `ServiceCoordinator` to import those contracts instead of declaring them inline.
4. Reuse the exported contracts in other coordination code where the same dependencies already exist.
5. Keep the types narrow and behavior-focused; do not turn this phase into a wide service redesign.

### Deliverables

- Shared coordinator contracts exported from `src/types/`
- `ServiceCoordinator` refactored to consume the exported types
- Tests able to import the same contracts used by production code

### Acceptance criteria

- `ServiceCoordinator.ts` no longer owns private-only versions of those contracts.
- Other coordinators can reference the same interfaces without duplicating them.
- Type exports isolate call sites from concrete CDN-backed implementations.

## Phase 2 - Composition root discipline in WebGeocodingManager

**Objective**: make `WebGeocodingManager` the single view-facing owner of route-planning and offline snapshot orchestration.

### Implementation

1. Add explicit `WebGeocodingManager` APIs for the behaviors `home.ts` currently performs through direct service imports.
2. Move default construction and ownership of `RouteNavigationService`-adjacent and `OfflineCacheService`-adjacent behavior behind the manager.
3. Update `src/views/home.ts` so it talks to `WebGeocodingManager` only for those workflows.
4. Leave internal service-layer uses alone unless they block the migration. For example, `IBGECityStatsService` can continue using cache internals until a separate cache-abstraction pass is justified.

### Deliverables

- `home.ts` no longer imports route planning helpers directly
- `home.ts` no longer imports offline snapshot helpers directly
- `WebGeocodingManager` exposes the public orchestration surface required by the view
- Composition-root ownership becomes explicit in the coordination layer

### Acceptance criteria

- `HomeViewController` owns Vue / DOM lifecycle concerns, not service wiring.
- Route planning and offline snapshot flows are initiated through `WebGeocodingManager`.
- No new concrete service imports are added to `home.ts`.

## Phase 3 - Injectable displayer factory

**Objective**: make displayer creation replaceable in tests and alternative configurations.

### Implementation

1. Export `IDisplayerFactory` as a shared contract from `src/types/`.
2. Update `WebGeocodingManager` and `ServiceCoordinator` to accept any object that satisfies that contract.
3. Preserve the current default behavior by providing a default factory implementation for production wiring.
4. If static-only `DisplayerFactory` remains awkward after interface extraction, convert it to an instance-backed default object in this phase rather than forcing tests to patch static methods.

### Deliverables

- Shared `IDisplayerFactory` contract
- Default displayer factory implementation usable by production code
- Test doubles can replace the factory without static patching

### Acceptance criteria

- Production code still uses the existing default factory behavior.
- Tests can inject a mock factory object directly.
- The coordination layer no longer depends on a static class reference as its only factory shape.

## Phase 4 - Cleanup, deprecation follow-through, and documentation sync

**Objective**: finish the migration without leaving ambiguous ownership behind.

### Implementation

1. Add deprecation notes to direct view-layer service entry points that should now flow through `WebGeocodingManager`.
2. Update architecture docs that describe `WebGeocodingManager`, `ServiceCoordinator`, and `DisplayerFactory`.
3. Decide whether any deprecated entry points can be removed in the next milestone or should stay until `v1.0`.

### Deliverables

- Clear deprecation notes for transitional imports
- Updated architecture and API docs
- A follow-up removal plan for any deprecated paths

### Acceptance criteria

- Reviewers can tell which path is preferred and which path is transitional.
- Documentation matches the final composition-root ownership model.

## Compatibility and migration policy

| Category | Policy |
|---|---|
| Stable | Existing end-user behavior and default geocoding workflows remain unchanged |
| Stable | `WebGeocodingManager` remains the primary orchestration entry point |
| Transitional | Direct view-layer imports of `planRoute` and offline snapshot helpers remain temporarily available |
| Transitional | Static `DisplayerFactory` behavior may remain as an adapter during migration |
| Deferred | Removal of deprecated direct imports can happen in a later milestone once consumers are migrated |

## Testing milestones

| Phase | Minimum verification |
|---|---|
| Phase 1 | Shared type exports compile cleanly and existing coordinator tests still target the same behavior |
| Phase 2 | `home.ts` integration paths cover route planning and offline snapshot flows through `WebGeocodingManager` |
| Phase 3 | Coordinator tests inject a mock displayer factory without patching static methods |
| Phase 4 | Documentation and deprecation notes match the implemented entry points |

## Suggested implementation slices

To reduce risk, each phase should land in small reviewable slices:

1. Extract types without behavior changes.
2. Add `WebGeocodingManager` APIs before removing direct `home.ts` imports.
3. Switch `home.ts` call sites after the manager API is stable.
4. Introduce the default displayer factory object and migrate tests.
5. Add deprecation notes only after the new path is fully usable.

## End-state

After this roadmap is implemented:

- `home.ts` should depend on one orchestration entry point instead of importing multiple concrete services.
- coordinator contracts should be reusable, test-visible, and independent from concrete CDN-backed classes
- displayer creation should be mockable without static monkey-patching
- `WebGeocodingManager` should better reflect its intended role as the composition root for the view layer
