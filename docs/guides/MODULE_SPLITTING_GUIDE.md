# Module Splitting Guide

**Version**: 0.28.8-alpha
**Last Updated**: 2026-05-30

Use this guide when a file has grown large enough that responsibilities,
dependencies, or test setup are starting to blur together.

## When to split a module

Split a module when one file starts to mix concerns that should evolve
independently, for example:

- DOM rendering plus service orchestration
- cache state plus change-detection rules
- coordination logic plus browser API wrappers
- reusable domain logic plus app-specific bootstrap code

## Practical checklist

1. Keep pure data shaping and formatting separate from DOM or network side
   effects.
2. Extract narrow collaborators behind explicit interfaces or focused utility
   modules.
3. Move composition back toward the coordinator or bootstrap layer.
4. Preserve behavior with targeted unit or integration coverage as each split
   lands.
5. Prefer incremental extraction over large rewrites.

## Related guides

- [Low Coupling Guide](./LOW_COUPLING_GUIDE.md) - design goals that justify a
  split
- [Guia.js Module Structure](../architecture/MODULES.md) - current module layout
- [Jest and ES6 Modules Guide](./JEST_COMMONJS_ES6_GUIDE.md) - test setup for
  extracted modules
