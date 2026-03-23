# Referential Transparency & Immutability

---

Last Updated: 2026-03-23
Status: Active
Category: Guide

---

Guia Turístico follows **immutability-first** principles. Functions should return
new values rather than mutating their inputs.

## Core Rule

> A function is referentially transparent if it always returns the same output
> for the same input and produces no observable side effects.

## Immutability Patterns

### Arrays — use instead of mutating methods

| Avoid | Use instead |
|-------|-------------|
| `arr.push(x)` | `[...arr, x]` |
| `arr.splice(i, 1)` | `arr.filter((_, idx) => idx !== i)` |
| `arr.sort()` | `[...arr].sort()` |
| `arr.reverse()` | `[...arr].reverse()` |

### Objects — use spread or `Object.assign`

```javascript
// Bad — mutates the original
address.city = 'Recife';

// Good — returns a new object
const updated = { ...address, city: 'Recife' };
```

### Classes and state

- Prefer value objects (all fields set in constructor, no setters).
- If mutable state is unavoidable, isolate it in dedicated manager classes.
- Never expose raw mutable arrays or objects from public getters — return copies.

## Why This Matters

- Easier to test (no setup/teardown for shared state).
- Safer in event-driven code (no race conditions on shared data structures).
- Enables cheap equality checks (`prev !== next` suffices for change detection).

## See Also

- [CODE_REVIEW_GUIDE.md](./CODE_REVIEW_GUIDE.md) — review checklist includes immutability checks.
- [CONTRIBUTING.md](./CONTRIBUTING.md) — pull request checklist.
