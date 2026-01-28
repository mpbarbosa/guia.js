# Jest Environment jsdom Fix - Summary

**Issue**: Test suite failed with "jest-environment-jsdom cannot be found"  
**Date**: 2026-01-28  
**Status**: ✅ **RESOLVED**

---

## Problem

Test file `__tests__/unit/HTMLHighlightCardsDisplayer-MetropolitanRegion.test.js` failed with:
```
Test environment jest-environment-jsdom cannot be found.
As of Jest 28 "jest-environment-jsdom" is no longer shipped by default,
make sure to install it separately.
```

---

## Root Cause

1. **Missing dependency**: `jest-environment-jsdom` not installed (Jest 28+ requires separate installation)
2. **Environment misconfiguration**: Test file used `@jest-environment jsdom` but manually imported JSDOM (redundant)
3. **TextEncoder polyfill**: Node.js environment requires TextEncoder/TextDecoder polyfills for jsdom

---

## Solution

### 1. Installed jest-environment-jsdom
```bash
npm install --save-dev jest-environment-jsdom
```

**Result**: Added 6 packages, 507 total packages

### 2. Fixed test file configuration
**File**: `__tests__/unit/HTMLHighlightCardsDisplayer-MetropolitanRegion.test.js`

**Changed**:
```diff
- * @jest-environment jsdom
+ * @jest-environment node

  import { JSDOM } from 'jsdom';
+ import { TextEncoder, TextDecoder } from 'util';
+
+ // Polyfill for TextEncoder/TextDecoder (required for jsdom in Node.js)
+ global.TextEncoder = TextEncoder;
+ global.TextDecoder = TextDecoder;
```

**Rationale**: Test manually creates JSDOM instance, so should run in node environment with polyfills

---

## Test Results

### Before Fix
- ❌ Test suite failed to run
- 0 tests executed
- Blocked 21 metropolitan region tests

### After Fix
- ✅ Test suite passes
- ✅ **21 tests passing** (all metropolitan region tests)
- ✅ Execution time: 0.415 seconds

### Full Test Suite Impact
- **Before**: 2,213 tests passing
- **After**: 2,234 tests passing (+21 tests)
- **Test suites**: 91 passing (+1 suite fixed)

---

## Files Modified

1. **package.json** (dependency added via npm install)
   - Added `jest-environment-jsdom` to devDependencies

2. **__tests__/unit/HTMLHighlightCardsDisplayer-MetropolitanRegion.test.js**
   - Changed `@jest-environment jsdom` → `@jest-environment node`
   - Added TextEncoder/TextDecoder polyfills

---

## Tests Now Passing (21 tests)

### Metropolitan Region Display Feature
1. ✅ Display "Região Metropolitana do Recife"
2. ✅ Display "Região Metropolitana de São Paulo"
3. ✅ Display Olinda in Recife metropolitan region
4. ✅ No region display for non-metropolitan municipalities
5. ✅ Handle Pontal do Coruripe (incomplete data)
6. ✅ Update all three values in single call
7. ✅ Maintain independence between region and municipality updates
8. ✅ Handle very long metropolitan region names
9. ✅ Handle special characters in region names
10. ✅ Handle null enderecoPadronizado gracefully
11. ✅ Handle undefined enderecoPadronizado gracefully
12. ✅ Log metropolitan region in update call
13. ✅ Log empty string when region is null
14. ✅ Verify DOM element order (region between label and value)

---

## Technical Notes

### Jest Environment Configuration

**Two approaches**:

1. **jsdom environment** (auto-provides DOM):
   ```javascript
   /**
    * @jest-environment jsdom
    */
   // Use global.document directly, no JSDOM import needed
   ```

2. **Node environment with manual JSDOM** (used here):
   ```javascript
   /**
    * @jest-environment node
    */
   import { JSDOM } from 'jsdom';
   import { TextEncoder, TextDecoder } from 'util';
   
   global.TextEncoder = TextEncoder;
   global.TextDecoder = TextDecoder;
   
   const dom = new JSDOM(...);
   const document = dom.window.document;
   ```

**Why node + manual JSDOM**:
- Gives more control over DOM setup
- Can reset DOM between tests (beforeEach)
- Explicit about test dependencies
- Avoids global pollution

---

## Verification

### Run specific test file
```bash
npm test -- __tests__/unit/HTMLHighlightCardsDisplayer-MetropolitanRegion.test.js
```

**Expected**:
```
Test Suites: 1 passed, 1 total
Tests:       21 passed, 21 total
Time:        ~0.4 seconds
```

### Run full test suite
```bash
npm test
```

**Expected**:
```
Test Suites: 91 passed (includes metropolitan region tests)
Tests:       2,234 passed
```

---

## Prevention

### For new test files using jsdom

**Option A - Auto jsdom environment** (simpler):
```javascript
/**
 * @jest-environment jsdom
 */
// No JSDOM import needed
// Use global.document, global.window
```

**Option B - Manual jsdom setup** (more control):
```javascript
/**
 * @jest-environment node
 */
import { JSDOM } from 'jsdom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
```

**Rule**: Don't mix both approaches (causes conflicts)

---

## Related Files

- `__tests__/html/HTMLHighlightCardsDisplayer.test.js` - Uses node environment (42→48 tests)
- `__tests__/unit/HTMLHighlightCardsDisplayer-MetropolitanRegion.test.js` - Fixed file (21 tests)
- `package.json` - Contains jsdom and jest-environment-jsdom dependencies

---

## Summary

✅ **Issue resolved** - jest-environment-jsdom installed and test configuration fixed  
✅ **21 tests recovered** - Metropolitan region display tests now passing  
✅ **No regressions** - Full test suite improved from 2,213 to 2,234 passing tests  
✅ **Total tests**: 48 (main) + 21 (metropolitan) = **69 tests for HTMLHighlightCardsDisplayer**

---

**Fix Time**: 10 minutes  
**Impact**: +21 tests passing, +1 test suite passing  
**Status**: ✅ COMPLETE
