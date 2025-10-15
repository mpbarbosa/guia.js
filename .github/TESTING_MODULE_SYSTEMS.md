# Testing Module Systems: ES6 vs CommonJS in Jest

**Target Audience:** Maintainers, Contributors, GitHub Copilot  
**Purpose:** Quick reference for module system decisions in testing  
**Related:** [Full Guide](../docs/JEST_COMMONJS_ES6_GUIDE.md)

---

## TL;DR - Quick Decision Guide

### Current Guia.js State ✅❌

```
Source Code:    ES6 modules ✅ (import/export)
Package Type:   "module" ✅
Test Strategy:  CommonJS ❌ (incompatible)
Test Results:   19/40 suites failing ❌
Root Cause:     Module system mismatch
```

### Recommended Solution

**Migrate tests to ES6 with experimental Jest ESM support**

```bash
# Update test command
"test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
```

```javascript
// Update test files
import { describe, test, expect } from '@jest/globals';
import { MyClass } from '../../src/guia.js';
```

**Estimated effort:** 1-2 days  
**Impact:** Fixes all 19 failing test suites

---

## The Problem

### What's Happening

**Before module splitting:**
```javascript
// guia.js - Single file, no imports
class MyClass { }
// ... all code in one file

// Tests work fine
const { MyClass } = require('./guia.js'); // ✅ Works
```

**After module splitting:**
```javascript
// guia.js - Now imports from other modules
import { helper } from './utils/helper.js'; // ES6 import
class MyClass { }
export { MyClass };

// Tests break
const { MyClass } = require('./guia.js'); // ❌ Fails
// Error: Cannot use import statement outside a module
```

### Why It Fails

| Aspect | ES6 Modules | CommonJS |
|--------|-------------|----------|
| **Loading** | Static, compile-time | Dynamic, runtime |
| **Syntax** | `import/export` | `require()/module.exports` |
| **Interop** | Can't `require()` ES6 | Can't `import` CommonJS easily |
| **Jest Default** | ❌ Needs config | ✅ Works out of box |

**Key Point:** Once you use `import` in source, you can't `require()` it without transpilation.

---

## Solutions Ranked

### 🥇 Solution 1: ES6 Tests (RECOMMENDED)

**Migrate tests to ES6 modules**

**Pros:**
- ✅ Matches source code (ES6 everywhere)
- ✅ No transpilation needed
- ✅ Future-proof
- ✅ Tests real code

**Cons:**
- ⚠️ Requires `--experimental-vm-modules` flag
- ⚠️ Slightly slower than CommonJS
- ⚠️ Must update all test files

**Implementation:**
```json
// package.json
{
  "type": "module",
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
  }
}
```

```javascript
// test.js
import { describe, test, expect } from '@jest/globals';
import { MyClass } from '../../src/guia.js';

describe('MyClass', () => {
  test('works', () => {
    expect(new MyClass()).toBeDefined();
  });
});
```

**Effort:** Medium (1-2 days for Guia.js)  
**Best for:** Guia.js ✅

---

### 🥈 Solution 2: Babel Transpilation

**Use Babel to transpile ES6 to CommonJS for tests**

**Pros:**
- ✅ Stable, production-ready
- ✅ Full Jest compatibility
- ✅ Fast execution
- ✅ No experimental flags

**Cons:**
- ❌ Requires build step
- ❌ Tests run transpiled code
- ❌ Extra dependency

**Implementation:**
```bash
npm install --save-dev @babel/core @babel/preset-env babel-jest
```

```json
// babel.config.json
{
  "presets": [["@babel/preset-env", { "targets": { "node": "current" }}]]
}
```

```json
// package.json
{
  "jest": {
    "transform": { "^.+\\.js$": "babel-jest" }
  }
}
```

**Effort:** Medium (1 day)  
**Best for:** Production projects needing stability

---

### 🥉 Solution 3: Dual Exports

**Source files export both ES6 and CommonJS**

**Pros:**
- ✅ Works with both systems
- ✅ No Jest config changes
- ✅ Backward compatible

**Cons:**
- ❌ Pollutes source code
- ❌ Can't use `import` in source files
- ❌ Not true ES6 modules
- ❌ Maintenance burden

**Implementation:**
```javascript
// src/module.js
export const myFunction = () => { };

// Also export CommonJS
if (typeof module !== 'undefined') {
  module.exports = { myFunction };
}
```

**Effort:** Low (few hours)  
**Best for:** Legacy compatibility (not recommended for Guia.js)

---

## Migration Checklist

### Phase 1: Setup (15 min)

- [ ] Verify Node.js version (18+)
- [ ] Create backup branch: `git checkout -b jest-esm-migration`
- [ ] Document current test failures: `npm test 2>&1 | tee before.txt`

### Phase 2: Configure Jest (5 min)

- [ ] Update `package.json` test script:
  ```json
  "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
  ```
- [ ] Update other test scripts (watch, coverage)
- [ ] Set `"transform": {}` in Jest config
- [ ] Run tests to verify new errors

### Phase 3: Convert Tests (1-2 hours)

For each test file:

- [ ] Add Jest globals import:
  ```javascript
  import { describe, test, expect, jest } from '@jest/globals';
  ```
- [ ] Replace `require()` with `import`:
  ```javascript
  // Before: const { MyClass } = require('../../src/guia.js');
  // After:  import { MyClass } from '../../src/guia.js';
  ```
- [ ] Replace `eval()` patterns with `import`:
  ```javascript
  // Before: const code = fs.readFileSync(...); eval(code);
  // After:  import { MyClass } from '../../src/guia.js';
  ```
- [ ] Add `.js` extensions to all imports
- [ ] Handle async imports if needed:
  ```javascript
  const module = await import('../../src/guia.js');
  ```

### Phase 4: Verify (15 min)

- [ ] Run all tests: `npm test`
- [ ] Check coverage: `npm run test:coverage`
- [ ] Test watch mode: `npm run test:watch`
- [ ] Verify web app: `python3 -m http.server 9000`

### Phase 5: Document (10 min)

- [ ] Update README with new test command
- [ ] Document `--experimental-vm-modules` requirement
- [ ] Note Node.js 18+ requirement
- [ ] Commit: `git commit -m "feat: migrate tests to ES6 modules"`

---

## Common Patterns

### Pattern 1: Basic Import

```javascript
// ❌ BEFORE (CommonJS)
const { MyClass, helper } = require('../../src/guia.js');

describe('Tests', () => {
  test('works', () => {
    expect(MyClass).toBeDefined();
  });
});

// ✅ AFTER (ES6)
import { describe, test, expect } from '@jest/globals';
import { MyClass, helper } from '../../src/guia.js';

describe('Tests', () => {
  test('works', () => {
    expect(MyClass).toBeDefined();
  });
});
```

### Pattern 2: Dynamic Import

```javascript
// ❌ BEFORE (eval pattern)
const fs = require('fs');
const guiaContent = fs.readFileSync('../../src/guia.js', 'utf8');
eval(guiaContent);
const myClass = new MyClass();

// ✅ AFTER (dynamic import)
import { describe, test, expect } from '@jest/globals';

describe('Tests', () => {
  test('dynamic import', async () => {
    const { MyClass } = await import('../../src/guia.js');
    expect(new MyClass()).toBeDefined();
  });
});
```

### Pattern 3: Mock Imports

```javascript
// ❌ BEFORE
jest.mock('../../src/module.js');
const { MyClass } = require('../../src/module.js');

// ✅ AFTER
import { jest } from '@jest/globals';
jest.mock('../../src/module.js');
import { MyClass } from '../../src/module.js';
```

### Pattern 4: Setup Files

```javascript
// ❌ BEFORE (setupTests.js)
global.myGlobal = require('./config.js');

// ✅ AFTER (setupTests.js)
import config from './config.js';
global.myGlobal = config;
```

---

## Troubleshooting

### Error: "Cannot use import statement outside a module"

**Cause:** Jest trying to `require()` an ES6 module

**Fix:**
```json
// package.json - Add experimental flag
{
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
  }
}
```

### Error: "ReferenceError: describe is not defined"

**Cause:** Jest globals not available in ESM mode

**Fix:**
```javascript
// Add to every test file
import { describe, test, expect, jest } from '@jest/globals';
```

### Error: "Module not found"

**Cause:** Missing `.js` extension

**Fix:**
```javascript
// ❌ import { helper } from './helper';
// ✅ import { helper } from './helper.js';
```

### Error: "require() of ES Module not supported"

**Cause:** Using `require()` on ES6 module

**Fix:**
```javascript
// Change from require to import
// ❌ const module = require('./module.js');
// ✅ import module from './module.js';
```

---

## GitHub Copilot Instructions

When working with Guia.js tests:

### ✅ DO

```javascript
// Use ES6 imports in tests
import { describe, test, expect, jest } from '@jest/globals';
import { MyClass } from '../../src/guia.js';

// Include .js extension
import { helper } from './helper.js';

// Use dynamic import for conditional loading
if (condition) {
  const module = await import('./module.js');
}
```

### ❌ DON'T

```javascript
// Don't use require() in test files
const { MyClass } = require('../../src/guia.js');

// Don't use eval() pattern
const code = fs.readFileSync('file.js', 'utf8');
eval(code);

// Don't omit .js extension
import { helper } from './helper';

// Don't mix module systems
import { A } from './a.js';
const B = require('./b.js');
```

### Test File Template

```javascript
/**
 * Test: [Feature Name]
 * 
 * @jest-environment node
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { ClassUnderTest } from '../../src/guia.js';

describe('ClassUnderTest', () => {
  beforeEach(() => {
    // Setup
  });

  test('should do something', () => {
    const instance = new ClassUnderTest();
    expect(instance).toBeDefined();
  });

  test('async test example', async () => {
    const result = await instance.asyncMethod();
    expect(result).toBe('expected');
  });
});
```

---

## Best Practices

### Source Code

1. **Always use ES6 modules** - Don't revert to CommonJS
2. **Include .js extensions** - Required by ES6 spec
3. **Export named exports** - Better tree-shaking
4. **No eval()** - Security and compatibility

```javascript
// ✅ GOOD
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Implementation
};

export class GeoPosition {
  constructor(lat, lon) {
    this.latitude = lat;
    this.longitude = lon;
  }
}
```

### Test Code

1. **Import Jest globals** - Required for ESM
2. **Use same module system as source** - ES6 if source is ES6
3. **Avoid dynamic imports unless necessary** - Slower
4. **One module system per project** - Don't mix

```javascript
// ✅ GOOD
import { describe, test, expect } from '@jest/globals';
import { GeoPosition } from '../../src/models/GeoPosition.js';

describe('GeoPosition', () => {
  test('creates position', () => {
    const pos = new GeoPosition(10, 20);
    expect(pos.latitude).toBe(10);
  });
});
```

### Configuration

1. **Be explicit** - Set `"type": "module"` in package.json
2. **Document requirements** - Note Node.js version, flags
3. **Provide examples** - Show correct import patterns
4. **Update CI/CD** - Include `--experimental-vm-modules`

```json
// package.json
{
  "type": "module",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
    "test:watch": "node --experimental-vm-modules node_modules/jest/bin/jest.js --watch"
  }
}
```

---

## Impact Analysis

### Current State (Before Migration)

```
Total Test Suites:    40
├─ Passing:          21 (52.5%)
└─ Failing:          19 (47.5%)

Total Tests:         408
├─ Passing:         383 (93.9%)
└─ Failing:          25 (6.1%)

Failure Reasons:
├─ require() on ES6:  15 suites
└─ eval() pattern:     4 suites
```

### Expected State (After Migration)

```
Total Test Suites:    40
├─ Passing:      38-40 (95-100%)
└─ Failing:        0-2 (0-5%)

Total Tests:         408
├─ Passing:     403-408 (98-100%)
└─ Failing:        0-5 (0-2%)

Improvements:
├─ All import errors fixed
├─ All eval() patterns removed
└─ Consistent module system
```

### Benefits

**Code Quality:**
- ✅ Consistent module system (ES6 everywhere)
- ✅ Modern JavaScript practices
- ✅ Better static analysis
- ✅ Future-proof codebase

**Developer Experience:**
- ✅ Clear import patterns
- ✅ Better IDE support
- ✅ Easier debugging
- ✅ Less confusion

**Testing:**
- ✅ Tests match production code
- ✅ True integration testing
- ✅ No transpilation overhead
- ✅ Reliable test results

---

## Quick Commands

### Run Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Specific file
npm test -- path/to/test.js

# Verbose output
npm test -- --verbose
```

### Validate Syntax
```bash
# Check source files
node -c src/guia.js
node -c src/utils/distance.js

# All JS files
find src -name "*.js" -exec node -c {} \;
```

### Debug Tests
```bash
# Node inspector
node --inspect --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand

# Chrome DevTools
# Visit chrome://inspect
```

---

## Related Documentation

### Guia.js Docs
- [📖 JEST_COMMONJS_ES6_GUIDE.md](../docs/JEST_COMMONJS_ES6_GUIDE.md) - Complete guide
- [📖 MODULE_SPLITTING_GUIDE.md](../docs/MODULE_SPLITTING_GUIDE.md) - Module splitting
- [📖 MODULE_SPLITTING_SUMMARY.md](../docs/MODULE_SPLITTING_SUMMARY.md) - Implementation summary
- [📖 UNIT_TEST_GUIDE.md](./UNIT_TEST_GUIDE.md) - Testing practices
- [📖 REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md) - Pure functions

### External Resources
- [Jest ESM Docs](https://jestjs.io/docs/ecmascript-modules)
- [Node.js ESM Docs](https://nodejs.org/api/esm.html)
- [MDN: JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

---

## Summary

### The Bottom Line

**Problem:** Tests use `require()`, source uses `import` → incompatible

**Solution:** Update tests to use `import` with Jest experimental ESM

**Effort:** 1-2 days

**Result:** All tests passing, consistent ES6 everywhere

### Action Items

**For Maintainers:**
1. Review this guide
2. Approve migration strategy
3. Allocate 1-2 days for migration
4. Update CI/CD with new test command

**For Contributors:**
1. Use ES6 imports in new tests
2. Don't use `require()` or `eval()`
3. Include `.js` extensions
4. Follow test template above

**For GitHub Copilot:**
1. Generate ES6 test files
2. Use template from this guide
3. Avoid CommonJS patterns
4. Ensure `.js` extensions

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-15  
**Maintained By:** Guia.js Team  
**Status:** Active

**Related Issues:**
- Module system mismatch causing test failures
- Need for clear testing guidelines
- ES6 migration strategy
