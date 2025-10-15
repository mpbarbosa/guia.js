# Jest and Module Systems: Critical Analysis & Best Practices

## Table of Contents

- [Executive Summary](#executive-summary)
- [Understanding the Problem](#understanding-the-problem)
- [Module Systems Overview](#module-systems-overview)
- [Jest and Module Systems](#jest-and-module-systems)
- [The Guia.js Context](#the-guiajs-context)
- [Solution Strategies](#solution-strategies)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Decision Matrix](#decision-matrix)
- [References](#references)

---

## Executive Summary

### The Core Problem

When splitting JavaScript modules, developers face a critical choice between **ES6 modules** (`import/export`) and **CommonJS** (`require/module.exports`). This choice becomes particularly complex when using **Jest**, which has varying levels of support for both systems.

**Guia.js Current State:**
- ✅ Source code uses ES6 modules (`import/export`)
- ✅ `package.json` has `"type": "module"`
- ❌ 19 test suites fail using `require()` with ES6 modules
- ❌ Tests using `fs.readFileSync + eval()` pattern incompatible with ES6

**Impact:** 6.3% test failure rate (25 failing tests) due to module system mismatch.

### Key Takeaways

1. **ES6 modules are the future** - Modern JavaScript standard, better tooling support
2. **CommonJS still prevalent in Node.js ecosystem** - Especially in testing tools
3. **Jest supports both** - But with different configurations and trade-offs
4. **Migration requires planning** - Can't mix systems without proper configuration
5. **Multiple valid solutions exist** - Choose based on project needs

---

## Understanding the Problem

### What Causes the Conflict?

The conflict arises from fundamental differences in how module systems work:

#### ES6 Modules (Static)
```javascript
// Static - analyzed at parse time, before code execution
import { calculateDistance } from './utils/distance.js';

// Imports are hoisted to top of file
// Cannot be conditionally imported
// Tree-shaking works because imports are statically analyzable
```

#### CommonJS (Dynamic)
```javascript
// Dynamic - executed at runtime
const { calculateDistance } = require('./utils/distance.js');

// Can be conditionally required
if (condition) {
  const module = require('./some-module');
}

// No tree-shaking because requires are evaluated at runtime
```

### The Jest Problem

When Jest encounters this code:

```javascript
// test.js - Jest test file
const { MyClass } = require('../src/myModule.js');
```

And `myModule.js` contains:

```javascript
// myModule.js - ES6 module
import { helper } from './helper.js';
export class MyClass { }
```

**Result:** `SyntaxError: Cannot use import statement outside a module`

**Why?** Jest's default transformer doesn't handle ES6 imports in files loaded via `require()`.

### Real Example from Guia.js

**Current failing test:**
```javascript
// __tests__/features/LocationChangeImmediateSpeech.test.js
const { BrazilianStandardAddress } = require('../../src/guia.js');
//                                   ↑ CommonJS require
```

**Source file:**
```javascript
// src/guia.js
import { calculateDistance, delay } from './utils/distance.js';
//     ↑ ES6 import - Jest can't handle this via require()
```

**Error:**
```
SyntaxError: Cannot use import statement outside a module
```

---

## Module Systems Overview

### ES6 Modules (ESM)

**Characteristics:**
- **Standard:** ECMAScript 2015 (ES6) official specification
- **Loading:** Asynchronous, static analysis
- **Environment:** Modern browsers, Node.js 12+
- **Syntax:** `import` / `export`
- **File extension:** `.js` (with `"type": "module"`), `.mjs`

**Advantages:**
- ✅ Official JavaScript standard
- ✅ Static analysis enables tree-shaking
- ✅ Better IDE/tooling support
- ✅ Cleaner, more readable syntax
- ✅ Native browser support
- ✅ Strict mode by default
- ✅ Top-level `await` support

**Disadvantages:**
- ❌ Requires Node.js 12+ or transpilation
- ❌ Some legacy tools don't support it
- ❌ Can't conditionally import
- ❌ Jest support requires configuration

**Example:**
```javascript
// Named exports
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// Default export
export default class Calculator {
  constructor() { }
}

// Import
import Calculator, { add, subtract } from './calculator.js';
```

### CommonJS (CJS)

**Characteristics:**
- **Standard:** De facto Node.js standard (pre-ES6)
- **Loading:** Synchronous, dynamic
- **Environment:** Node.js (all versions), requires bundler for browsers
- **Syntax:** `require()` / `module.exports`
- **File extension:** `.js` (default), `.cjs`

**Advantages:**
- ✅ Works in all Node.js versions
- ✅ Simpler mental model (just functions)
- ✅ Dynamic, can conditionally require
- ✅ Jest's default, works out of the box
- ✅ Huge ecosystem support

**Disadvantages:**
- ❌ Not a JavaScript standard (Node.js specific)
- ❌ No tree-shaking capability
- ❌ No static analysis
- ❌ Doesn't work in browsers without bundler
- ❌ Less modern, being phased out

**Example:**
```javascript
// Exports
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;

class Calculator {
  constructor() { }
}

module.exports = Calculator;
module.exports.add = add;
module.exports.subtract = subtract;

// Import
const Calculator = require('./calculator');
const { add, subtract } = require('./calculator');
```

### Comparison Table

| Feature | ES6 Modules | CommonJS |
|---------|-------------|----------|
| **Standard** | ✅ ECMAScript spec | ⚠️ Node.js convention |
| **Browser Support** | ✅ Native (modern) | ❌ Needs bundler |
| **Node.js Support** | ✅ v12+ | ✅ All versions |
| **Loading** | Asynchronous | Synchronous |
| **Tree Shaking** | ✅ Yes | ❌ No |
| **Static Analysis** | ✅ Yes | ❌ No |
| **Top-level await** | ✅ Yes | ❌ No |
| **Conditional Import** | ❌ No | ✅ Yes |
| **Jest Default** | ❌ Needs config | ✅ Works out of box |
| **Future** | ✅ Standard | ⚠️ Legacy |

---

## Jest and Module Systems

### Jest's Default Behavior

**Out of the box:**
- ✅ Supports CommonJS perfectly
- ❌ Doesn't support ES6 modules
- Uses Node.js's `require()` system
- Runs in Node environment

**Why?** Jest was created before ES6 modules were standardized in Node.js.

### Jest with ES6 Modules - Three Approaches

#### Approach 1: Experimental ESM Support (Recommended)

**Setup:**
```json
// package.json
{
  "type": "module",
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
  },
  "jest": {
    "testEnvironment": "node",
    "transform": {}
  }
}
```

**Test file:**
```javascript
// __tests__/myModule.test.js
import { describe, test, expect } from '@jest/globals';
import { MyClass } from '../src/myModule.js';

describe('MyClass', () => {
  test('works with ES6 modules', () => {
    const instance = new MyClass();
    expect(instance).toBeDefined();
  });
});
```

**Pros:**
- ✅ Uses real ES6 modules
- ✅ No transpilation
- ✅ Consistent with source code
- ✅ Future-proof

**Cons:**
- ⚠️ Experimental (may have bugs)
- ⚠️ Slower than CommonJS
- ⚠️ Some Jest features may not work

#### Approach 2: Babel Transpilation

**Setup:**
```bash
npm install --save-dev @babel/preset-env babel-jest
```

```json
// babel.config.json
{
  "presets": [
    ["@babel/preset-env", {
      "targets": { "node": "current" }
    }]
  ]
}
```

```json
// package.json
{
  "type": "module",
  "jest": {
    "transform": {
      "^.+\\.js$": "babel-jest"
    }
  }
}
```

**Test file:**
```javascript
// Still use ES6 imports - Babel will transpile
import { MyClass } from '../src/myModule.js';

test('works with Babel', () => {
  expect(new MyClass()).toBeDefined();
});
```

**Pros:**
- ✅ Mature, well-tested
- ✅ Fast execution
- ✅ Can use latest JS features
- ✅ Full Jest compatibility

**Cons:**
- ❌ Requires build step
- ❌ Tests run transpiled code (not source)
- ❌ Extra dependency

#### Approach 3: Dual Package (Hybrid)

**Setup:**
```json
// package.json
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./src/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

**Build step creates CommonJS version:**
```bash
# Build CommonJS version for tests
babel src --out-dir dist --out-file-extension .cjs
```

**Test file:**
```javascript
// Use CommonJS in tests
const { MyClass } = require('../dist/index.cjs');

test('works with CommonJS build', () => {
  expect(new MyClass()).toBeDefined();
});
```

**Pros:**
- ✅ Jest works perfectly
- ✅ Source uses ES6
- ✅ No experimental features

**Cons:**
- ❌ Requires build step
- ❌ Complexity of dual package
- ❌ Tests run different code than source

---

## The Guia.js Context

### Current State Analysis

**File Structure:**
```
src/
├── guia.js (ES6 module with imports)
├── guia_ibge.js
├── config/
│   └── defaults.js (ES6 module)
└── utils/
    ├── distance.js (ES6 module)
    ├── device.js (ES6 module)
    └── logger.js (ES6 module)

__tests__/
├── features/ (19 suites using require())
├── services/ (some using require())
└── unit/ (some using require())
```

**package.json:**
```json
{
  "type": "module",  // ← Tells Node.js all .js files are ES6
  "jest": {
    "testEnvironment": "node"
    // No transform configured
  }
}
```

### Why Tests Fail

**Failed Pattern #1: Direct require() of ES6 module**
```javascript
// ❌ FAILS
const { MyClass } = require('../../src/guia.js');
// Error: Cannot use import statement outside a module
```

**Failed Pattern #2: eval() with ES6 module**
```javascript
// ❌ FAILS
const fs = require('fs');
const guiaContent = fs.readFileSync('../../src/guia.js', 'utf8');
eval(guiaContent);
// Error: Cannot use import statement outside a module
```

**Why `eval()` fails:**
- ES6 `import` can only be used at top-level of module
- `eval()` executes code in current scope, not as module
- No way to `eval()` ES6 module syntax

### Test Failure Breakdown

**Statistics:**
- Total test suites: 40
- Passing: 21 (52.5%)
- Failing: 19 (47.5%)
- Total tests: 408
- Passing: 383 (93.9%)
- Failing: 25 (6.1%)

**Root causes:**
1. **CommonJS require() pattern** (15 suites)
   - Tests using `require('../../src/guia.js')`
   
2. **eval() pattern** (4 suites)
   - Tests using `fs.readFileSync() + eval()`
   
All failures are **test infrastructure issues**, not actual functionality bugs.

### Current Workarounds

Some tests already work because they:

1. **Don't import guia.js:**
   ```javascript
   // These tests work - test pure logic without imports
   test('pure function test', () => {
     expect(2 + 2).toBe(4);
   });
   ```

2. **Mock everything:**
   ```javascript
   // These tests work - don't actually import
   jest.mock('../../src/guia.js');
   ```

3. **Test configuration:**
   ```javascript
   // These tests work - test config data
   test('config values', () => {
     expect(config.version).toBe('0.5.0-alpha');
   });
   ```

---

## Solution Strategies

### Strategy 1: Migrate Tests to ES6 Modules (RECOMMENDED)

**Best for:** Modern projects, long-term maintainability

**Implementation:**

1. **Update Jest configuration:**
```json
// package.json
{
  "type": "module",
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
  },
  "jest": {
    "testEnvironment": "node",
    "transform": {}
  }
}
```

2. **Convert test files to ES6:**
```javascript
// Before (CommonJS)
const { BrazilianStandardAddress } = require('../../src/guia.js');

describe('Test', () => {
  test('example', () => {
    expect(BrazilianStandardAddress).toBeDefined();
  });
});

// After (ES6)
import { describe, test, expect } from '@jest/globals';
import { BrazilianStandardAddress } from '../../src/guia.js';

describe('Test', () => {
  test('example', () => {
    expect(BrazilianStandardAddress).toBeDefined();
  });
});
```

3. **Handle dynamic imports (if needed):**
```javascript
// For conditional loading
describe('Dynamic tests', () => {
  test('dynamic import', async () => {
    const { MyClass } = await import('../../src/guia.js');
    expect(MyClass).toBeDefined();
  });
});
```

**Pros:**
- ✅ Consistent with source code (ES6 everywhere)
- ✅ No build step needed
- ✅ Tests real module code
- ✅ Future-proof solution

**Cons:**
- ⚠️ Experimental flag needed
- ⚠️ Potential Jest incompatibilities
- ⚠️ Requires updating all test files

**Effort:** Medium (1-2 days for Guia.js)

---

### Strategy 2: Use Babel Transpilation

**Best for:** Stability, production projects

**Implementation:**

1. **Install dependencies:**
```bash
npm install --save-dev @babel/core @babel/preset-env babel-jest
```

2. **Create Babel config:**
```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: { node: 'current' }
    }]
  ]
};
```

3. **Update Jest config:**
```json
// package.json
{
  "jest": {
    "testEnvironment": "node",
    "transform": {
      "^.+\\.js$": "babel-jest"
    },
    "transformIgnorePatterns": [
      "node_modules/(?!(module-to-transform)/)"
    ]
  }
}
```

4. **Test files use ES6 imports:**
```javascript
// Tests can use ES6 - Babel transpiles automatically
import { BrazilianStandardAddress } from '../../src/guia.js';

describe('Test', () => {
  test('example', () => {
    expect(BrazilianStandardAddress).toBeDefined();
  });
});
```

**Pros:**
- ✅ Stable, production-ready
- ✅ Full Jest compatibility
- ✅ Can use latest JS features
- ✅ Well-documented, lots of examples

**Cons:**
- ❌ Build step overhead
- ❌ Tests run transpiled code
- ❌ Additional dependency
- ❌ Configuration complexity

**Effort:** Medium (1 day setup + testing)

---

### Strategy 3: Dual Export Strategy

**Best for:** Libraries, backward compatibility

**Implementation:**

1. **Update source files with dual exports:**
```javascript
// src/guia.js

// ES6 exports (for modern usage)
export class BrazilianStandardAddress { }

// CommonJS exports (for Jest/legacy)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BrazilianStandardAddress
  };
}
```

2. **Tests use CommonJS:**
```javascript
// __tests__/example.test.js
const { BrazilianStandardAddress } = require('../../src/guia.js');

test('works', () => {
  expect(BrazilianStandardAddress).toBeDefined();
});
```

**Pros:**
- ✅ Works with both systems
- ✅ No Jest configuration needed
- ✅ Backward compatible
- ✅ Minimal changes to tests

**Cons:**
- ❌ Pollutes source with dual exports
- ❌ Can't use `import` in source
- ❌ Not truly ES6 modules
- ❌ Confusing to maintain

**Effort:** Low (few hours)

---

### Strategy 4: Separate Test Builds

**Best for:** Complex projects with distinct environments

**Implementation:**

1. **Create build script:**
```javascript
// scripts/build-for-tests.js
import { build } from 'esbuild';

build({
  entryPoints: ['src/guia.js'],
  bundle: false,
  format: 'cjs',
  outdir: 'dist/test',
  platform: 'node'
});
```

2. **Update package.json:**
```json
{
  "scripts": {
    "prebuild": "npm run build:tests",
    "build:tests": "node scripts/build-for-tests.js",
    "test": "npm run build:tests && jest"
  }
}
```

3. **Tests import from dist:**
```javascript
const { BrazilianStandardAddress } = require('../../dist/test/guia.js');
```

**Pros:**
- ✅ Source stays pure ES6
- ✅ Tests work with Jest
- ✅ No experimental features

**Cons:**
- ❌ Complex build process
- ❌ Tests run different code
- ❌ Slower test runs

**Effort:** High (2-3 days)

---

## Migration Guide

### Step-by-Step: Migrating to ES6 Tests (Strategy 1)

This is the **recommended approach** for Guia.js.

#### Phase 1: Preparation (15 minutes)

1. **Verify Node.js version:**
```bash
node --version  # Should be v18+ (current: v20.19.5)
```

2. **Backup current tests:**
```bash
git checkout -b jest-esm-migration
git commit -am "Checkpoint before Jest ESM migration"
```

3. **Document failing tests:**
```bash
npm test 2>&1 | tee test-results-before.txt
```

#### Phase 2: Update Jest Configuration (5 minutes)

1. **Update package.json:**
```json
{
  "type": "module",
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
    "test:watch": "node --experimental-vm-modules node_modules/jest/bin/jest.js --watch",
    "test:coverage": "node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "transform": {},
    "testMatch": [
      "**/__tests__/**/*.js",
      "**/*.test.js"
    ]
  }
}
```

2. **Test the configuration:**
```bash
npm test
# May still fail, but errors should be different
```

#### Phase 3: Convert Test Files (1-2 hours)

**Template for conversion:**

```javascript
// ❌ BEFORE (CommonJS)
const { MyClass } = require('../../src/guia.js');

describe('MyClass', () => {
  test('does something', () => {
    expect(new MyClass()).toBeDefined();
  });
});

// ✅ AFTER (ES6)
import { describe, test, expect, jest } from '@jest/globals';
import { MyClass } from '../../src/guia.js';

describe('MyClass', () => {
  test('does something', () => {
    expect(new MyClass()).toBeDefined();
  });
});
```

**Convert each test file:**

1. **Add Jest globals import:**
   ```javascript
   import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
   ```

2. **Replace require() with import:**
   ```javascript
   // Before
   const { Class1, Class2 } = require('../../src/guia.js');
   
   // After
   import { Class1, Class2 } from '../../src/guia.js';
   ```

3. **Handle eval() pattern:**
   ```javascript
   // ❌ BEFORE - Cannot work with ES6
   const fs = require('fs');
   const guiaContent = fs.readFileSync('../../src/guia.js', 'utf8');
   eval(guiaContent);
   
   // ✅ AFTER - Use dynamic import
   const guia = await import('../../src/guia.js');
   const { BrazilianStandardAddress } = guia;
   ```

4. **Update mocks:**
   ```javascript
   // Before
   jest.mock('../../src/module.js');
   
   // After (same, but ensure file path has .js)
   jest.mock('../../src/module.js');
   ```

#### Phase 4: Fix Common Issues (30 minutes)

**Issue 1: "ReferenceError: describe is not defined"**

```javascript
// ❌ Missing imports
describe('Test', () => { });

// ✅ Add Jest globals
import { describe, test, expect } from '@jest/globals';
describe('Test', () => { });
```

**Issue 2: "Cannot use import before initialization"**

```javascript
// ❌ Circular dependency
import { A } from './A.js';
export const B = new A();

// ✅ Use dynamic import or refactor
export const getB = async () => {
  const { A } = await import('./A.js');
  return new A();
};
```

**Issue 3: "Module not found"**

```javascript
// ❌ Missing .js extension
import { MyClass } from './MyClass';

// ✅ Include extension
import { MyClass } from './MyClass.js';
```

#### Phase 5: Verification (15 minutes)

1. **Run all tests:**
```bash
npm test
```

2. **Check coverage:**
```bash
npm run test:coverage
```

3. **Run tests in watch mode:**
```bash
npm run test:watch
```

4. **Verify web functionality:**
```bash
python3 -m http.server 9000
# Open http://localhost:9000/test.html
```

#### Phase 6: Cleanup (10 minutes)

1. **Remove old eval() code:**
   - Delete any `fs.readFileSync() + eval()` patterns
   - Replace with proper imports

2. **Update documentation:**
   - Update README with new test command
   - Document `--experimental-vm-modules` flag

3. **Commit changes:**
```bash
git add .
git commit -m "feat: migrate tests to ES6 modules with Jest experimental ESM support"
```

### Expected Results

**Before:**
- 19 test suites failing
- 25 tests failing
- 93.9% pass rate

**After:**
- 0-2 test suites failing (edge cases)
- 0-5 tests failing
- 98-100% pass rate

---

## Best Practices

### For Source Code

#### 1. Always Use ES6 Modules

```javascript
// ✅ GOOD - ES6 modules
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Implementation
};

export class GeoPosition {
  constructor(lat, lon) {
    this.latitude = lat;
    this.longitude = lon;
  }
}

// ❌ AVOID - CommonJS in new code
module.exports = {
  calculateDistance,
  GeoPosition
};
```

**Why?**
- ES6 is the JavaScript standard
- Better tooling support
- Enables tree-shaking
- Future-proof

#### 2. Always Include .js Extension

```javascript
// ✅ GOOD - Explicit extension
import { helper } from './utils/helper.js';

// ❌ BAD - Missing extension (works in bundlers, not Node.js)
import { helper } from './utils/helper';
```

**Why?**
- Required by ES6 spec
- Works in browsers without bundler
- Explicit is better than implicit

#### 3. Prefer Named Exports

```javascript
// ✅ GOOD - Named exports (easier to tree-shake)
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// ⚠️ OK - Default export (use sparingly)
export default class Calculator { }

// ❌ AVOID - Mixed default/named when unnecessary
export default function add(a, b) { return a + b; }
export const subtract = (a, b) => a - b;
```

**Why?**
- Named exports enable better tree-shaking
- Better IDE autocomplete
- Prevents naming conflicts

#### 4. Keep Modules Focused

```javascript
// ✅ GOOD - Single responsibility
// utils/distance.js
export const calculateDistance = (lat1, lon1, lat2, lon2) => { };
export const distanceInKm = (meters) => meters / 1000;

// ❌ BAD - Mixed concerns
// utils/everything.js
export const calculateDistance = () => { };
export const formatDate = () => { };
export const validateEmail = () => { };
```

### For Test Files

#### 1. Import Jest Globals

```javascript
// ✅ GOOD - Explicit imports
import { describe, test, expect, jest, beforeEach } from '@jest/globals';

describe('MyClass', () => {
  test('works', () => {
    expect(true).toBe(true);
  });
});

// ❌ BAD - Relying on globals (breaks with ESM)
describe('MyClass', () => {
  test('works', () => {
    expect(true).toBe(true);
  });
});
```

#### 2. Use Dynamic Import for Conditional Loading

```javascript
// ✅ GOOD - Dynamic import
describe('Platform-specific tests', () => {
  test('loads module conditionally', async () => {
    if (process.platform === 'darwin') {
      const { MacModule } = await import('./mac-module.js');
      expect(MacModule).toBeDefined();
    }
  });
});

// ❌ BAD - Can't conditionally use static import
if (process.platform === 'darwin') {
  import { MacModule } from './mac-module.js'; // Syntax error
}
```

#### 3. Avoid eval() Completely

```javascript
// ❌ BAD - eval() pattern
const fs = require('fs');
const code = fs.readFileSync('./module.js', 'utf8');
eval(code);

// ✅ GOOD - Proper import
import { MyClass } from './module.js';

// ✅ GOOD - Dynamic import if needed
const module = await import('./module.js');
```

**Why?**
- `eval()` incompatible with ES6 modules
- Security risk
- Poor performance
- No static analysis

#### 4. Test in Same Environment as Production

```javascript
// ✅ GOOD - If source is ES6, tests should be too
// source.js
export const add = (a, b) => a + b;

// source.test.js
import { add } from './source.js';
test('adds', () => expect(add(1, 2)).toBe(3));

// ❌ BAD - Different module system
// source.test.js (CommonJS)
const { add } = require('./source.js'); // Won't work if source is ES6
```

### For Configuration

#### 1. Be Explicit About Module Type

```json
// ✅ GOOD - Explicit type
{
  "type": "module"
}

// ⚠️ ACCEPTABLE - Default (CommonJS)
{
  // No type specified = CommonJS
}

// ❌ BAD - Mixing without proper config
{
  "type": "module",
  // But tests use require() without transpilation
}
```

#### 2. Document Module System Choice

```json
// package.json
{
  "type": "module",
  "description": "Uses ES6 modules throughout. Tests use experimental ESM support.",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

```markdown
# README.md
## Module System

This project uses **ES6 modules** (not CommonJS). 

- Source: ES6 `import/export`
- Tests: ES6 with `--experimental-vm-modules`
- Requires: Node.js 18+
```

---

## Troubleshooting

### Common Errors and Solutions

#### Error 1: "Cannot use import statement outside a module"

**Symptom:**
```
SyntaxError: Cannot use import statement outside a module
```

**Causes:**
1. Missing `"type": "module"` in package.json
2. Using `.js` file without module flag
3. Jest not configured for ESM

**Solutions:**

```json
// Solution 1: Add to package.json
{
  "type": "module"
}

// Solution 2: Use .mjs extension
// Rename: module.js → module.mjs

// Solution 3: Configure Jest for ESM
{
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
  }
}
```

#### Error 2: "ReferenceError: describe is not defined"

**Symptom:**
```
ReferenceError: describe is not defined
```

**Cause:**
Jest globals not available in ESM mode

**Solution:**
```javascript
// Add this to every test file
import { describe, test, expect, jest } from '@jest/globals';
```

#### Error 3: "Module not found"

**Symptom:**
```
Cannot find module './utils/helper'
```

**Cause:**
Missing `.js` extension (required in ES6)

**Solution:**
```javascript
// ❌ Missing extension
import { helper } from './utils/helper';

// ✅ Include extension
import { helper } from './utils/helper.js';
```

#### Error 4: "require() of ES Module not supported"

**Symptom:**
```
Error [ERR_REQUIRE_ESM]: require() of ES Module not supported
```

**Cause:**
Using `require()` on a file with `"type": "module"`

**Solutions:**

```javascript
// Solution 1: Change to import
// Before
const { module } = require('./module.js');

// After
import { module } from './module.js';

// Solution 2: Use dynamic import
const { module } = await import('./module.js');

// Solution 3: Change file to CommonJS
// Remove "type": "module" or use .cjs extension
```

#### Error 5: "Jest encountered an unexpected token"

**Symptom:**
```
Jest encountered an unexpected token
```

**Cause:**
Jest trying to parse ES6 syntax without proper configuration

**Solutions:**

```json
// Solution 1: Use experimental ESM
{
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
  }
}

// Solution 2: Add Babel transformer
{
  "jest": {
    "transform": {
      "^.+\\.js$": "babel-jest"
    }
  }
}
```

#### Error 6: "Top-level await is not available"

**Symptom:**
```
SyntaxError: await is only valid in async functions
```

**Cause:**
Using `await` at top level in CommonJS

**Solutions:**

```javascript
// ❌ CommonJS - doesn't support top-level await
const data = await fetchData();

// ✅ ES6 module - supports top-level await
// (Requires "type": "module")
const data = await fetchData();

// ✅ CommonJS workaround - wrap in async IIFE
(async () => {
  const data = await fetchData();
})();
```

### Debugging Checklist

When tests fail after module migration:

- [ ] `package.json` has `"type": "module"`
- [ ] Test command includes `--experimental-vm-modules`
- [ ] All imports have `.js` extension
- [ ] Test files import Jest globals
- [ ] No `require()` statements in ES6 modules
- [ ] No `eval()` patterns
- [ ] No circular dependencies
- [ ] Node.js version is 18+

### Performance Issues

**Symptom:** Tests run slowly with ESM

**Causes:**
- Experimental ESM has overhead
- Module resolution is slower
- No caching of modules

**Solutions:**

```javascript
// 1. Use Babel for production tests
// (Faster than experimental ESM)

// 2. Reduce dynamic imports
// Before - slow
describe('tests', () => {
  test('test 1', async () => {
    const module = await import('./module.js');
  });
  test('test 2', async () => {
    const module = await import('./module.js'); // Re-imports
  });
});

// After - faster
import { module } from './module.js'; // Import once
describe('tests', () => {
  test('test 1', () => { /* use module */ });
  test('test 2', () => { /* use module */ });
});

// 3. Use test groups to share imports
describe('module tests', () => {
  let module;
  beforeAll(async () => {
    module = await import('./module.js');
  });
  
  test('test 1', () => { /* use module */ });
  test('test 2', () => { /* use module */ });
});
```

---

## Decision Matrix

### When to Use ES6 Modules

**Use ES6 when:**
- ✅ Starting new project
- ✅ Modern browser target (ES6+)
- ✅ Node.js 18+ environment
- ✅ Want tree-shaking benefits
- ✅ Need top-level await
- ✅ Building for long-term maintenance

**Example projects:**
- Modern web applications
- Node.js APIs (v18+)
- React/Vue/Angular apps
- Libraries for modern environments

### When to Use CommonJS

**Use CommonJS when:**
- ✅ Legacy Node.js support needed (< v12)
- ✅ Simple scripts without bundler
- ✅ Jest tests (easiest path)
- ✅ Existing CommonJS codebase
- ✅ Maximum compatibility needed

**Example projects:**
- Node.js tools for CI/CD
- Build scripts
- Legacy applications
- Simple utility scripts

### Migration Decision Tree

```
Do you control the codebase?
├─ Yes
│  └─ Is it a new project?
│     ├─ Yes → Use ES6 modules
│     └─ No → Are tests working?
│        ├─ Yes → Consider gradual ES6 migration
│        └─ No → Fix tests first, then consider migration
│
└─ No (Third-party library)
   └─ Check package.json "type"
      ├─ "module" → You must use ES6 imports
      ├─ No "type" → Use CommonJS require()
      └─ "exports" field → Check documentation
```

### Guia.js Recommendation

**Recommended approach:** **ES6 Modules with Jest Experimental ESM**

**Reasoning:**
1. ✅ Source already uses ES6 (`import/export`)
2. ✅ `package.json` already has `"type": "module"`
3. ✅ Modern Node.js v20 environment
4. ✅ Browser target is modern
5. ✅ Future-proof solution
6. ✅ Consistent across source and tests
7. ⚠️ Only 6% test failure (easy to fix)

**Alternative (if stability critical):** Babel transpilation
- More stable than experimental flag
- Still allows ES6 everywhere
- Slightly more complex setup

**Not recommended:** 
- ❌ Reverting to CommonJS (backwards step)
- ❌ Dual export (complexity not worth it)
- ❌ Keeping current broken state

---

## References

### Official Documentation

- [Jest ECMAScript Modules](https://jestjs.io/docs/ecmascript-modules)
- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)
- [MDN: JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [ECMAScript 2015 Spec](https://262.ecma-international.org/6.0/)

### Guia.js Documentation

- [MODULE_SPLITTING_GUIDE.md](./MODULE_SPLITTING_GUIDE.md) - Complete guide to module splitting
- [MODULE_SPLITTING_SUMMARY.md](./MODULE_SPLITTING_SUMMARY.md) - Implementation summary
- [MODULES.md](./MODULES.md) - Module system documentation
- [REFERENTIAL_TRANSPARENCY.md](../.github/REFERENTIAL_TRANSPARENCY.md) - Pure function principles
- [UNIT_TEST_GUIDE.md](../.github/UNIT_TEST_GUIDE.md) - Testing best practices

### Related Guides

- [Babel Jest Setup](https://jestjs.io/docs/getting-started#using-babel)
- [ES6 Modules in Node.js](https://nodejs.org/api/packages.html#packages_determining_module_system)
- [Jest Configuration](https://jestjs.io/docs/configuration)

### Tools

- [Jest](https://jestjs.org/) - Testing framework
- [Babel](https://babeljs.io/) - JavaScript transpiler
- [ESLint](https://eslint.org/) - Code linting (supports both module systems)
- [esbuild](https://esbuild.github.io/) - Fast bundler with ESM support

---

## Quick Reference

### ES6 Module Cheat Sheet

```javascript
// Named export
export const myFunction = () => { };
export class MyClass { }

// Default export
export default class MyClass { }

// Import named
import { myFunction, MyClass } from './module.js';

// Import default
import MyClass from './module.js';

// Import all
import * as Module from './module.js';

// Dynamic import
const module = await import('./module.js');
```

### CommonJS Cheat Sheet

```javascript
// Export
module.exports = { myFunction, MyClass };
module.exports.myFunction = () => { };

// Export default
module.exports = MyClass;

// Import
const { myFunction, MyClass } = require('./module');
const MyClass = require('./module');

// Dynamic require
const modulePath = './module';
const module = require(modulePath);
```

### Jest ESM Command

```bash
# Run tests with experimental ESM
node --experimental-vm-modules node_modules/jest/bin/jest.js

# With coverage
node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage

# Watch mode
node --experimental-vm-modules node_modules/jest/bin/jest.js --watch
```

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-15  
**Author:** GitHub Copilot  
**Target Audience:** Contributors, Maintainers, GitHub Copilot

**Related Issues:**
- Test failures with ES6 module migration
- 19 test suites using incompatible patterns
- Need clear guidance on module system choice
