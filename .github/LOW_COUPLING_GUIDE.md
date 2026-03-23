# Low Coupling Guide

---

Last Updated: 2026-03-23
Status: Active
Category: Guide

---

Modules in Guia Turístico should depend on abstractions, not on concrete
implementations. This makes each component easier to test, replace, and reason
about in isolation.

## Signs of High Coupling (avoid)

- A class instantiates its own dependencies with `new` inside the constructor.
- A module imports a singleton and calls methods directly on it.
- A function accepts a large "god object" and reads only 2–3 fields from it.

## Techniques for Low Coupling

### Dependency Injection

Pass dependencies in through the constructor instead of creating them inside:

```typescript
// Bad — tightly coupled
class ReverseGeocoder {
  private cache = AddressCache.getInstance(); // hard dependency
}

// Good — injectable
class ReverseGeocoder {
  constructor(private cache: IAddressCache) {}
}
```

### Interface / Type Boundaries

Define a minimal interface for what a collaborator needs to provide:

```typescript
interface IAddressCache {
  get(key: string): BrazilianStandardAddress | null;
  set(key: string, value: BrazilianStandardAddress): void;
}
```

This lets tests pass a simple mock object without importing the real class.

### Factory Methods

Use static factory methods to construct objects when wiring is complex:

```typescript
// Creates a fully wired instance for production
const mgr = await WebGeocodingManager.create(document, 'app');
```

## Module-Level Rules

- Each file exports one primary class or function.
- Avoid barrel files (`index.ts`) that re-export many unrelated things.
- Keep `import` lists short — if a file imports more than 8–10 modules,
  consider splitting it.

## See Also

- [HIGH_COHESION_GUIDE.md](./HIGH_COHESION_GUIDE.md) — the complementary principle.
- [REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md) — immutability reduces accidental coupling through shared state.
