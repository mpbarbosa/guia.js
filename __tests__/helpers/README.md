# Test Helpers

Shared utility libraries used across the test suite. These are **not** test files themselves — they export helper functions consumed by unit, integration, and E2E tests.

## Files

| File | Description |
|------|-------------|
| `e2e-helpers-lib.js` | Helper functions for E2E Puppeteer tests (page setup, mocks, assertions) |
| `test-environment-lib.js` | Utilities for detecting the current test environment (jsdom, Node.js, browser) and checking API availability |

## Usage

```js
import { setupE2EPage } from '../helpers/e2e-helpers-lib.js';
import { isJsdom } from '../helpers/test-environment-lib.js';
```

## Guidelines

- Helpers must not contain `describe`/`it`/`test` blocks.
- Keep helpers environment-agnostic unless explicitly scoped to jsdom or Node.js.
