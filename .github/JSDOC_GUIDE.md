# JSDoc Guide

---

Last Updated: 2026-03-23
Status: Active
Category: Guide

---

All public APIs in Guia Turístico must be documented with JSDoc comments.

## Basic Structure

```javascript
/**
 * Brief one-line summary ending with a period.
 *
 * Longer description if needed.
 *
 * @param {string} name - Description of the parameter.
 * @returns {string} Description of the return value.
 * @throws {TypeError} When `name` is not a string.
 * @example
 * const result = myFunction('hello');
 */
```

## Required Tags

| Tag | Required for | Notes |
|-----|-------------|-------|
| `@param` | Every parameter | Include type and description |
| `@returns` | Non-void functions | Include type and description |
| `@throws` | Functions that throw | Document the condition |
| `@since` | New public APIs | Use `x.y.z-prerelease` format |

## Class Documentation

```javascript
/**
 * Brief description of the class and its responsibility.
 *
 * @class
 * @example
 * const instance = new MyClass(config);
 * instance.doWork();
 */
```

## When NOT to add JSDoc

- Private methods and fields (prefix `_`) — keep a short inline comment instead.
- Test helper functions — `// arrange / act / assert` comments are sufficient.
- One-line utility lambdas where the intent is obvious.

## Tooling

Generate the API reference with:

```bash
npm run docs:generate
```

Output is written to `docs/api-generated/`.
