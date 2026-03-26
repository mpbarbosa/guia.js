# JavaScript Best Practices

Guidelines for writing clean, maintainable JavaScript in this project.

## General Principles

- Prefer `const` over `let`; avoid `var`.
- Use arrow functions for callbacks and short expressions.
- Use template literals instead of string concatenation.
- Destructure objects and arrays where it improves readability.

## Immutability

Follow the immutability conventions documented in [CONTRIBUTING.md](./CONTRIBUTING.md):

- Use spread operator (`...`) instead of `push`, `splice`, or direct mutation.
- Prefer `map`, `filter`, and `reduce` over `forEach` with side effects.
- Treat all imported data as read-only.

## Async Patterns

- Always `await` asynchronous calls; avoid mixing `.then()` chains with `async/await`.
- Handle errors with `try/catch` blocks; never swallow exceptions silently.
- Use `Promise.all` for concurrent independent operations.

## Modules

- Use ES module syntax (`import`/`export`); CommonJS `require()` is reserved for Jest config files.
- Export only the public API of each module; keep implementation details private.

## Naming Conventions

- **Classes**: `PascalCase`
- **Functions and variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `PascalCase` for classes, `camelCase` for utilities

## Related Guides

- [TDD_GUIDE.md](./TDD_GUIDE.md) — test-driven development workflow
- [CODE_REVIEW_GUIDE.md](./CODE_REVIEW_GUIDE.md) — code review standards
- [CONTRIBUTING.md](./CONTRIBUTING.md) — full contribution guidelines
