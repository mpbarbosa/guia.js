# HTMLHighlightCardsDisplayer Test Coverage - Action Plan

**Class**: HTMLHighlightCardsDisplayer  
**Current Coverage**: 75% statements, 60% branches  
**Target Coverage**: 88% statements, 85% branches  
**Total Effort**: 1-2 hours

---

## Quick Summary

✅ **42 tests passing** - Excellent feature coverage  
❌ **60% branch coverage** - Below 69% threshold  
⚠️ **Missing**: Constructor validation, missing DOM elements, integration tests

---

## Phase 1: Critical Coverage Gaps (1 hour)

### Add Constructor Validation Tests (30 min)

**File**: `__tests__/html/HTMLHighlightCardsDisplayer.test.js`

**Add 3 tests**:
```javascript
describe('Constructor Validation', () => {
    test('should throw TypeError when document is missing', () => {
        expect(() => new HTMLHighlightCardsDisplayer(null))
            .toThrow(TypeError);
    });

    test('should throw TypeError when document is undefined', () => {
        expect(() => new HTMLHighlightCardsDisplayer(undefined))
            .toThrow(TypeError);
    });

    test('should be immutable (Object.freeze)', () => {
        const mockDocument = { getElementById: () => null };
        const displayer = new HTMLHighlightCardsDisplayer(mockDocument);
        expect(Object.isFrozen(displayer)).toBe(true);
    });
});
```

**Coverage Gain**: +25% branch coverage

---

### Add Missing DOM Element Tests (30 min)

**Add 3 tests**:
```javascript
describe('Missing DOM Elements', () => {
    test('should handle missing municipio element gracefully', () => {
        const mockDocument = {
            getElementById: (id) => 
                id === 'municipio-value' ? null : { textContent: '' }
        };
        const displayer = new HTMLHighlightCardsDisplayer(mockDocument);
        const enderecoPadronizado = new BrazilianStandardAddress();
        enderecoPadronizado.municipio = 'Recife';
        
        expect(() => displayer.update({}, enderecoPadronizado)).not.toThrow();
    });

    test('should handle missing bairro element gracefully', () => {
        // Similar pattern for bairro-value
    });

    test('should handle missing metropolitan region element gracefully', () => {
        // Similar pattern for regiao-metropolitana-value
    });
});
```

**Coverage Gain**: +50% branch coverage

---

## Phase 2: Integration Tests (1 hour, optional)

### Create Integration Test File (1 hour)

**File**: `__tests__/integration/HTMLHighlightCardsDisplayer.integration.test.js`

**Add 3 tests**:
```javascript
describe('HTMLHighlightCardsDisplayer Integration', () => {
    test('should be subscribable to ReverseGeocoder', () => {
        // Test observer pattern subscription
    });

    test('should receive updates from ServiceCoordinator', () => {
        // Test coordination layer integration
    });

    test('should handle multiple rapid updates', () => {
        // Test concurrent update handling
    });
});
```

**Coverage Gain**: Integration validation (no direct coverage increase)

---

## Expected Results

### After Phase 1

| Metric | Before | After | Target | Status |
|--------|--------|-------|--------|--------|
| Statements | 75% | 88% | 68% | ✅ |
| Branches | 60% | 85% | 73% | ✅ |
| Functions | 100% | 100% | 57% | ✅ |
| Test Count | 42 | 48 | N/A | +6 tests |

### After Phase 2

- **Integration**: ✅ Validated
- **Test Count**: 53 tests (+11 total)
- **End-to-end**: Verified

---

## Verification Commands

```bash
# Run tests with coverage
npm test -- __tests__/html/HTMLHighlightCardsDisplayer.test.js --coverage

# Check specific file coverage
npm run test:coverage -- --collectCoverageFrom="src/html/HTMLHighlightCardsDisplayer.js"

# Expected: Branches >= 85%
```

---

## Success Criteria

✅ All 48+ tests passing  
✅ Branch coverage ≥85% (exceeds 73% threshold)  
✅ Statement coverage ≥88%  
✅ No uncovered error paths  
✅ Integration scenarios validated

---

## Priority

🟡 **MEDIUM** - Address within next sprint

**Why**: Current coverage below branch threshold (60% vs 69% required)

---

## Files to Modify/Create

**Modify**:
- `__tests__/html/HTMLHighlightCardsDisplayer.test.js` (add 6 tests)

**Create** (Phase 2):
- `__tests__/integration/HTMLHighlightCardsDisplayer.integration.test.js` (3-5 tests)

---

**Full Analysis**: HTMLHIGHLIGHTCARDSDISPLAYER_TEST_COVERAGE_2026-01-28.md
