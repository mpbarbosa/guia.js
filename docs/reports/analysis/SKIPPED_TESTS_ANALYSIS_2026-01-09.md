# Skipped Test Suites Analysis
**Date**: 2026-01-09
**Total Skipped**: 5 test suites, 145 tests

## Summary Table

| Test File | Lines | Tests | Skip Reason | Category | Priority |
|-----------|-------|-------|-------------|----------|----------|
| `__tests__/unit/SpeechSynthesisManager.test.js` | 901 | ~12 | Cross-environment edge cases only | Unit | Low |
| `__tests__/managers/WebGeocodingManager.test.js` | 656 | ~35 | API mismatch - needs refactor | Unit | Medium |
| `__tests__/features/MunicipioChangeText.test.js` | 333 | ~15 | Top-level await hangs Jest | Feature | Medium |
| `__tests__/integration/SpeechSynthesisManager.integration.test.js` | 845 | ~40 | Async timing issues/hangs | Integration | Low |
| `__tests__/integration/HtmlSpeechSynthesisDisplayer.integration.test.js` | 872 | ~28 | jsdom/parse5 ES module issue | Integration | Low |
| `__tests__/integration/WebGeocodingManager.integration.test.js` | 669 | ~15 | Dependencies not extracted yet | Integration | Low |

**Total**: 4,276 lines of test code

---

## Detailed Analysis

### 1. SpeechSynthesisManager.test.js (Unit)
**Status**: Partially skipped - only 1 nested suite (`Cross-Environment Compatibility`)
**Skip Reason**: Edge case testing for environments without `setTimeout`/`clearInterval`
**Tests Skipped**: ~12 tests in "Cross-Environment Compatibility" suite

**Details**:
- Main test suite RUNS successfully (hundreds of tests passing)
- Only the cross-environment compatibility section is skipped
- Tests hypothetical scenarios like missing timer functions
- Not critical - core functionality is tested elsewhere

**Recommendation**: 
- ✅ **KEEP SKIPPED** - These are edge case tests for exotic environments
- Low priority - unlikely to encounter environments without timers
- Could be re-enabled if supporting minimal JS runtimes

---

### 2. WebGeocodingManager.test.js (Unit)
**Status**: Entirely skipped
**Skip Reason**: API mismatch - test expects different API than current implementation
**Tests Skipped**: ~35 tests (entire suite)

**Details**:
```javascript
// TODO: This test suite expects a different WebGeocodingManager API 
// that doesn't match the current implementation. Skipping until the refactoring is completed.
```
- Tests were written for a planned API that hasn't been implemented yet
- Current WebGeocodingManager has different constructor/methods
- Integration tests exist in `__tests__/integration/WebGeocodingManager.integration.test.js` (also skipped)

**Recommendation**:
- ⚠️ **MEDIUM PRIORITY** - Should be updated or removed
- Options:
  1. Update tests to match current API (2-3 hours)
  2. Delete outdated tests if API won't change (30 min)
  3. Wait for planned refactoring
- Check if current WebGeocodingManager has other test coverage

---

### 3. MunicipioChangeText.test.js (Feature)
**Status**: Entirely skipped
**Skip Reason**: Top-level `await` causes Jest to hang indefinitely
**Tests Skipped**: ~15 tests for Issue #218 (municipality change announcements)

**Details**:
```javascript
// TODO: This test file hangs due to top-level await (line 85)
// Jest has issues with top-level await in test files
// Need to refactor to use beforeAll() with async import instead
// See: https://github.com/jestjs/jest/issues/10784
```
- Uses `await import('../../src/guia.js')` at top level
- Jest doesn't handle top-level await well in test files
- Tests validate speech text includes both previous and current municipality

**Recommendation**:
- ⚠️ **MEDIUM PRIORITY** - Feature-specific test for Issue #218
- **Easy Fix** (~15 minutes):
  1. Move `await import()` into `beforeAll()` hook
  2. Store imported classes in outer scope
  3. Re-enable test suite
- Related to speech synthesis feature testing

---

### 4. SpeechSynthesisManager.integration.test.js (Integration)
**Status**: Entirely skipped
**Skip Reason**: Async timing issues cause indefinite hangs
**Tests Skipped**: ~40 integration tests

**Details**:
```javascript
// TODO: This test suite has async timing issues that cause tests to hang indefinitely
// The timer mocking was causing infinite recursion, and removing it causes tests to wait forever
// Skip until async behavior can be properly mocked or tests can be refactored
```
- Complex timer mocking for speech queue processing
- Infinite recursion with mocked timers or infinite wait without mocks
- Integration scenarios for real Web Speech API usage

**Recommendation**:
- ✅ **LOW PRIORITY** - Unit tests provide coverage
- Integration tests are "nice to have" but unit tests cover core logic
- Would require significant timer mocking refactor (4-6 hours)
- Consider moving to Selenium/browser tests instead

---

### 5. HtmlSpeechSynthesisDisplayer.integration.test.js (Integration)
**Status**: Entirely skipped
**Skip Reason**: jsdom/parse5 ES module compatibility issues
**Tests Skipped**: ~28 integration tests

**Details**:
```javascript
// TODO: Temporarily skipped due to jsdom/parse5 ES module compatibility issues
// Re-enable when jsdom is updated or parse5 compatibility is resolved
```
- Requires real DOM environment (jsdom)
- ES module compatibility issues with jsdom or parse5 dependency
- Integration tests for HTML displayer with speech synthesis

**Recommendation**:
- ✅ **LOW PRIORITY** - jsdom is optional for this project
- Project uses real browser testing (Selenium) instead
- Would require jsdom installation + configuration (2-3 hours)
- Not worth effort since Selenium tests cover this

---

### 6. WebGeocodingManager.integration.test.js (Integration)
**Status**: Entirely skipped
**Skip Reason**: Dependencies not extracted into separate modules yet
**Tests Skipped**: ~15 integration tests

**Details**:
```javascript
// TODO: This test suite is for a future refactoring where dependencies are extracted to separate modules
// Currently these modules don't exist yet (Logger, LocationDisplayer, SpeechManager, etc.)
// Skipping until the refactoring is completed
```
- Tests written for planned architecture refactoring
- Expects modular dependencies (Logger, LocationDisplayer, SpeechManager)
- Current implementation has these embedded, not extracted

**Recommendation**:
- ✅ **LOW PRIORITY** - Future architecture planning
- Keep for reference during future refactoring
- Don't enable until refactoring is done

---

## Priority Actions

### Should Enable (Medium Priority)
1. **MunicipioChangeText.test.js** (~15 min fix)
   - Move `await import()` to `beforeAll()`
   - Tests specific feature from Issue #218
   - Easy win for +15 tests

2. **WebGeocodingManager.test.js** (2-3 hours OR 30 min to delete)
   - Either update tests to match current API
   - OR delete if API is stable and won't match tests
   - Decision needed: update vs delete

### Can Keep Skipped (Low Priority)
3. **SpeechSynthesisManager.test.js (Cross-Environment only)**
   - Edge cases only, main suite runs fine
   - Not worth enabling unless targeting minimal runtimes

4. **Integration tests (3 files)**
   - Complex mocking or dependency issues
   - Unit tests provide coverage
   - Selenium tests cover browser scenarios
   - Not worth effort for current project state

---

## Test Coverage Without Skipped Tests

**Current Coverage**: 69.66% overall
- 1,274 tests passing
- 145 tests skipped (10.2% of total 1,419 tests)

**Coverage is GOOD** because:
- ✅ Core functionality has unit tests (passing)
- ✅ Browser scenarios have Selenium tests (Python)
- ✅ Skipped tests are mostly integration/edge cases
- ✅ Main SpeechSynthesisManager unit tests pass (only cross-env skipped)

---

## Recommendations Summary

### Immediate Action (15 minutes)
- [ ] Fix `MunicipioChangeText.test.js` - move import to `beforeAll()`
  - Easy win: +15 tests enabled
  - Tests specific Issue #218 feature

### Short Term (30 min - 3 hours)
- [ ] Decide on `WebGeocodingManager.test.js`:
  - Option A: Update tests to match current API (2-3 hours)
  - Option B: Delete if API is stable (30 min)
  - Check if other tests cover WebGeocodingManager

### Long Term (Optional)
- [ ] Keep integration tests skipped unless:
  - Major refactoring makes them relevant again
  - Project decides to invest in jsdom setup
  - Async timer mocking patterns improve

### Document
- [x] Add this analysis to TESTING.md or docs/misc/
- [x] Update skip reasons with issue tracker links if needed
