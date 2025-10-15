# Jest and Module Systems Documentation - Quick Guide

**Created:** 2025-10-15  
**Purpose:** Navigation guide for Jest and ES6/CommonJS module documentation

---

## 📚 Documentation Files

### 1. Comprehensive Guide (Main Reference)
**File:** [docs/JEST_COMMONJS_ES6_GUIDE.md](../docs/JEST_COMMONJS_ES6_GUIDE.md)  
**Length:** 1,505 lines  
**Audience:** All contributors, maintainers, GitHub Copilot  

**Contents:**
- Executive summary of the problem
- Detailed module systems comparison (ES6 vs CommonJS)
- Jest configuration for ES6 modules
- Three solution strategies with pros/cons
- Step-by-step migration guide
- Best practices for both source and test code
- Comprehensive troubleshooting section
- Decision matrix for choosing approaches
- Real examples from Guia.js

**When to Read:** 
- Before starting Jest ESM migration
- When encountering module system errors
- When making architectural decisions about modules
- To understand why 19 test suites are failing

---

### 2. Quick Reference (Maintainer Guide)
**File:** [.github/TESTING_MODULE_SYSTEMS.md](./TESTING_MODULE_SYSTEMS.md)  
**Length:** 666 lines  
**Audience:** Maintainers, contributors, GitHub Copilot  

**Contents:**
- TL;DR decision guide
- Current Guia.js state analysis
- Ranked solution strategies
- Migration checklist
- Common patterns (before/after examples)
- Troubleshooting quick fixes
- Impact analysis
- GitHub Copilot instructions

**When to Read:**
- Quick reference during implementation
- When reviewing PRs with module changes
- When writing new test files
- For copy-paste code templates

---

### 3. Module Splitting Guide (Updated)
**File:** [docs/MODULE_SPLITTING_GUIDE.md](../docs/MODULE_SPLITTING_GUIDE.md)  
**Updates:** Added Jest and ES6 modules section  

**New Content:**
- Jest configuration for ES6 modules
- Common Jest pitfalls with ES6
- Test file templates
- Cross-references to Jest guides

**When to Read:**
- When splitting modules
- When setting up new tests
- For general module system understanding

---

### 4. Unit Test Guide (Updated)
**File:** [.github/UNIT_TEST_GUIDE.md](./UNIT_TEST_GUIDE.md)  
**Updates:** Added Jest ESM warning and quick setup  

**New Content:**
- Warning about ES6 module configuration
- Quick setup instructions
- Links to comprehensive guides
- Common error fixes

**When to Read:**
- When writing new unit tests
- When Jest tests fail mysteriously
- For Jest matcher reference

---

### 5. Practical Example
**File:** [examples/jest-esm-migration-example.js](../examples/jest-esm-migration-example.js)  
**Length:** 400+ lines  
**Type:** Runnable demonstration  

**Run it:**
```bash
node examples/jest-esm-migration-example.js
```

**Contents:**
- Visual comparison of problems
- Migration steps
- Common patterns
- Checklist
- Expected results

**When to Use:**
- To see migration overview
- To share with team
- As presentation material
- For quick understanding

---

## 🎯 How to Use This Documentation

### Scenario 1: "My Jest tests are failing with import errors"

1. **Start here:** [TESTING_MODULE_SYSTEMS.md](./TESTING_MODULE_SYSTEMS.md) → Troubleshooting section
2. **Read:** Error descriptions and quick fixes
3. **If still stuck:** [JEST_COMMONJS_ES6_GUIDE.md](../docs/JEST_COMMONJS_ES6_GUIDE.md) → Troubleshooting section

### Scenario 2: "I need to migrate tests to ES6"

1. **Read:** [JEST_COMMONJS_ES6_GUIDE.md](../docs/JEST_COMMONJS_ES6_GUIDE.md) → Migration Guide section
2. **Use:** [TESTING_MODULE_SYSTEMS.md](./TESTING_MODULE_SYSTEMS.md) → Migration Checklist
3. **Reference:** Common patterns section during implementation
4. **Run:** `node examples/jest-esm-migration-example.js` for overview

### Scenario 3: "I'm writing a new test file"

1. **Quick start:** [TESTING_MODULE_SYSTEMS.md](./TESTING_MODULE_SYSTEMS.md) → Test File Template
2. **Copy template** and modify for your needs
3. **Check:** [UNIT_TEST_GUIDE.md](./UNIT_TEST_GUIDE.md) → Jest matchers

### Scenario 4: "I'm deciding between ES6 and CommonJS"

1. **Read:** [JEST_COMMONJS_ES6_GUIDE.md](../docs/JEST_COMMONJS_ES6_GUIDE.md) → Decision Matrix
2. **Review:** Solution Strategies section
3. **Check:** The Guia.js Context section for project-specific recommendation

### Scenario 5: "I'm splitting modules"

1. **Primary:** [MODULE_SPLITTING_GUIDE.md](../docs/MODULE_SPLITTING_GUIDE.md)
2. **Testing setup:** Jest and ES6 Modules section
3. **Reference:** [JEST_COMMONJS_ES6_GUIDE.md](../docs/JEST_COMMONJS_ES6_GUIDE.md) for test configuration

---

## 📊 Current Guia.js Status

### The Problem
- **Source code:** Uses ES6 modules (`import/export`) ✅
- **Test files:** Use CommonJS (`require/module.exports`) ❌
- **Result:** 19 out of 40 test suites failing (47.5%)

### The Root Cause
```
Source: import { helper } from './utils.js';  // ES6
Test:   const { MyClass } = require('./src/guia.js');  // CommonJS
Error:  Cannot use import statement outside a module
```

### Recommended Solution
**Migrate tests to ES6 modules** (Strategy 1 in comprehensive guide)

**Estimated Effort:** 1-2 days  
**Expected Result:** 0-2% failure rate (down from 47.5%)

---

## 🔑 Key Concepts

### ES6 Modules
```javascript
// Export
export const myFunction = () => { };
export class MyClass { }

// Import
import { myFunction, MyClass } from './module.js';
```

**Characteristics:**
- ✅ JavaScript standard
- ✅ Static analysis
- ✅ Tree-shaking
- ⚠️ Jest needs configuration

### CommonJS
```javascript
// Export
module.exports = { myFunction, MyClass };

// Import
const { myFunction, MyClass } = require('./module');
```

**Characteristics:**
- ✅ Node.js standard
- ✅ Jest default
- ❌ No tree-shaking
- ❌ Legacy system

### The Incompatibility

**You cannot `require()` a file that uses `import`**

```javascript
// ❌ This fails
// src/module.js
import { helper } from './helper.js';
export const myFunction = () => { };

// test.js
const { myFunction } = require('../src/module.js');
// Error: Cannot use import statement outside a module
```

**Solutions:**
1. Migrate tests to ES6 (recommended)
2. Use Babel transpilation
3. Use dual exports (not recommended)

---

## ✅ Quick Jest ESM Setup

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

```javascript
// test.js
import { describe, test, expect } from '@jest/globals';
import { myFunction } from '../src/module.js';

describe('myFunction', () => {
  test('works', () => {
    expect(myFunction()).toBe('expected');
  });
});
```

---

## 🚨 Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "Cannot use import statement outside a module" | Missing ESM config | Add `"type": "module"` and `--experimental-vm-modules` |
| "describe is not defined" | Missing Jest globals import | `import { describe, test, expect } from '@jest/globals'` |
| "Module not found" | Missing `.js` extension | Add `.js` to all imports |
| "require() of ES Module not supported" | Using `require()` on ES6 | Change to `import` |

---

## 📖 Reading Order

### For New Contributors
1. **Quick Reference:** [TESTING_MODULE_SYSTEMS.md](./TESTING_MODULE_SYSTEMS.md) (30 min)
2. **Example:** Run `node examples/jest-esm-migration-example.js` (5 min)
3. **Deep Dive:** [JEST_COMMONJS_ES6_GUIDE.md](../docs/JEST_COMMONJS_ES6_GUIDE.md) (2 hours)

### For Maintainers
1. **Context:** [JEST_COMMONJS_ES6_GUIDE.md](../docs/JEST_COMMONJS_ES6_GUIDE.md) → The Guia.js Context (15 min)
2. **Strategy:** Decision Matrix section (10 min)
3. **Implementation:** Migration Guide section (30 min)
4. **Reference:** Keep [TESTING_MODULE_SYSTEMS.md](./TESTING_MODULE_SYSTEMS.md) open during work

### For Code Reviewers
1. **Standards:** [TESTING_MODULE_SYSTEMS.md](./TESTING_MODULE_SYSTEMS.md) → Best Practices (15 min)
2. **Patterns:** Common Patterns section (10 min)
3. **Reference:** [JEST_COMMONJS_ES6_GUIDE.md](../docs/JEST_COMMONJS_ES6_GUIDE.md) → Best Practices (30 min)

---

## 🔗 Related Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md) - Pure function principles
- [UNIT_TEST_GUIDE.md](./UNIT_TEST_GUIDE.md) - Unit testing guide
- [MODULE_SPLITTING_GUIDE.md](../docs/MODULE_SPLITTING_GUIDE.md) - Module splitting
- [INDEX.md](../docs/INDEX.md) - Complete documentation index

---

## 💡 Pro Tips

1. **Always use ES6 imports in new code** - It's the future
2. **Run example script first** - Saves time understanding concepts
3. **Keep quick reference open** - For common patterns
4. **Use test file template** - Ensures consistency
5. **Read troubleshooting before asking** - Most issues are covered

---

## 📞 Getting Help

1. **Check troubleshooting sections first**
2. **Run the example script** for visual understanding
3. **Search existing issues** for similar problems
4. **Open an issue** using the documentation template if needed

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-15  
**Maintained By:** Guia.js Team

**Total Documentation:** ~2,200 lines of comprehensive guidance  
**Files:** 5 core documents + 1 practical example  
**Coverage:** Complete module system migration guide
