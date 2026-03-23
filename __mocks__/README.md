# `__mocks__`

Jest [manual mocks](https://jestjs.io/docs/manual-mocks) for static-asset imports.

## Files

| File | Purpose |
|------|---------|
| `fileMock.js` | Returns the string `'test-file-stub'` for any import that Vite normally handles as a file (images, fonts, CSS modules, etc.). Referenced in `jest.config.unit.js` via the `moduleNameMapper` option so that test code does not crash when importing non-JS assets. |

## When to add a new mock here

Add a file here when a module or asset import causes test failures because it has no meaningful JavaScript representation (e.g. SVG files, WASM binaries, binary fonts). Do **not** mock real JavaScript modules here — use `jest.mock()` inside the test file instead.
