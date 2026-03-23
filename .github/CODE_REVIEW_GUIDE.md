# Code Review Guide

---

Last Updated: 2026-03-23
Status: Active
Category: Guide

---

This checklist is used when reviewing pull requests for Guia Turístico.

## Review Checklist

### Correctness

- [ ] Logic is correct for the happy path.
- [ ] Edge cases are handled (null, empty, boundary values).
- [ ] No silent failures (errors are surfaced or logged).

### Immutability

- [ ] No `push`, `splice`, `sort`, or `reverse` on shared arrays — see [REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md).
- [ ] No direct property mutation on objects passed in as parameters.

### Tests

- [ ] Every new public function has at least one unit test.
- [ ] Tests follow Arrange–Act–Assert pattern.
- [ ] No test depends on execution order.

### Documentation

- [ ] Public APIs have JSDoc (`@param`, `@returns`) — see [JSDOC_GUIDE.md](./JSDOC_GUIDE.md).
- [ ] CHANGELOG.md updated if user-facing behaviour changed.
- [ ] ROADMAP.md updated if a planned feature was completed.

### Architecture

- [ ] New classes follow Single Responsibility Principle.
- [ ] Dependencies are injected, not imported as singletons inside business logic.
- [ ] No circular imports introduced.

### Style

- [ ] TypeScript types used (no `any` without justification).
- [ ] No commented-out code left in (use `// TODO:` instead).
- [ ] File length is reasonable (< 600 lines; extract if larger).

## Severity Levels

| Label | Meaning |
|-------|---------|
| 🚫 **Blocker** | Must be fixed before merge |
| ⚠️ **Warning** | Should be fixed; can merge with agreement |
| 💡 **Suggestion** | Optional improvement; leave as comment |
