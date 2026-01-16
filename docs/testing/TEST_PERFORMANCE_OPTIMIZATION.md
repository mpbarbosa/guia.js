# Test Performance Optimization

**Date**: 2026-01-15  
**Optimization Target**: SpeechQueue.test.js (5.089s → 2.842s)  
**Performance Gain**: 44% faster (2.247s improvement)  

---

## 🎯 **Optimization Applied**

### **Issue Identified**
Two tests in `__tests__/unit/SpeechQueue.test.js` used real timers:
```javascript
// BEFORE (SLOW):
test('should clean expired items', async () => {
    shortQueue.enqueue("Will expire");
    await new Promise(resolve => setTimeout(resolve, 1100)); // ⏱️ 1100ms wait
    expect(shortQueue.getItems()).toHaveLength(0);
});
```

**Problem**: Tests actually waited 1100ms in real time (2.2s total)

### **Solution Applied**
Replaced real timers with Jest fake timers:
```javascript
// AFTER (FAST):
test('should clean expired items', () => {
    jest.useFakeTimers();
    
    shortQueue.enqueue("Will expire");
    jest.advanceTimersByTime(1100); // ⚡ Instant simulation
    expect(shortQueue.getItems()).toHaveLength(0);
    
    jest.useRealTimers();
});
```

**Result**: Tests complete instantly (<1ms each)

---

## 📊 **Performance Results**

### Before Optimization
```
Test Suites: 1 passed
Tests:       50 passed
Time:        5.089s
└── getItems should clean expired items: 1100ms
└── should respect SpeechItem expiration logic: 1102ms
```

### After Optimization
```
Test Suites: 1 passed
Tests:       50 passed
Time:        2.842s ✅
└── getItems should clean expired items: <1ms ⚡
└── should respect SpeechItem expiration logic: <1ms ⚡
```

**Improvement**: 44% faster (2.247s saved)

---

## 🔧 **Optimization Pattern**

### When to Use Fake Timers

✅ **Use fake timers when**:
- Testing time-based expiration logic
- Testing debounce/throttle behavior
- Testing scheduled callbacks
- Simulating delays without waiting

❌ **DON'T use fake timers when**:
- Testing real async operations (API calls, file I/O)
- Testing race conditions
- Testing actual timing precision
- Integration tests with external services

### Implementation Template

```javascript
describe('Timer-dependent behavior', () => {
    beforeEach(() => {
        // Option 1: Use fake timers for entire suite
        jest.useFakeTimers();
    });
    
    afterEach(() => {
        jest.useRealTimers();
    });
    
    test('delays action by 1000ms', () => {
        const callback = jest.fn();
        setTimeout(callback, 1000);
        
        // Fast forward time
        jest.advanceTimersByTime(1000);
        
        expect(callback).toHaveBeenCalled();
    });
    
    test('specific test needs real timers', () => {
        // Option 2: Toggle within test
        jest.useRealTimers();
        
        // Real async operation
        await someRealAsyncFunction();
        
        jest.useFakeTimers(); // Restore
    });
});
```

---

## 🚀 **Additional Optimization Opportunities**

### 1. Other Slow Tests Identified
- `SpeechSynthesisManager.test.js`: Check for real timer usage
- `Chronometer.test.js`: May benefit from fake timers
- Integration tests: Consider test splitting

### 2. Test Suite Splitting Strategy

**Current**: All tests in one file (50 tests, 2.8s)

**Recommended**:
```
__tests__/unit/
├── SpeechQueue.core.test.js (40 tests, <1s)
├── SpeechQueue.expiration.test.js (5 tests, <1s)
└── SpeechQueue.performance.test.js (5 tests, 1.8s)
```

**Benefit**: Better parallelization, faster CI

### 3. CI/CD Optimization

```yaml
# .github/workflows/test.yml
jobs:
  fast-tests:
    runs-on: ubuntu-latest
    steps:
      - run: npm test -- --testPathIgnorePatterns="integration|e2e"
      # Runs in ~3s
      
  slow-tests:
    runs-on: ubuntu-latest
    steps:
      - run: npm test -- --testPathPattern="integration"
      # Runs in parallel with fast-tests
```

---

## 📈 **Overall Test Suite Performance**

### Current State
```
Total Tests: 1,792 passing
Total Time:  ~31s
Suites:      77 passing

Performance Distribution:
├── Fast (<100ms): 70 suites (91%)
├── Medium (100ms-1s): 5 suites (6%)
└── Slow (>1s): 2 suites (3%)
    ├── SpeechQueue.test.js: 2.8s ✅ (optimized)
    └── Integration tests: variable
```

### Optimization Impact
- **Before**: SpeechQueue consuming 16% of total test time (5s/31s)
- **After**: SpeechQueue consuming 9% of total test time (2.8s/31s)
- **Savings**: 7% reduction in overall suite time

---

## ✅ **Best Practices Established**

1. **Always use fake timers for expiration tests**
   - Saves 1000ms+ per test
   - More reliable (no timing variance)

2. **Measure before optimizing**
   ```bash
   npm test -- --verbose | grep "ms)"
   ```

3. **Document slow tests**
   - Comment why real timers are needed
   - Or convert to fake timers

4. **CI performance monitoring**
   - Track test suite duration in CI
   - Alert on >10% regression

---

## 🎓 **Lessons Learned**

### What Worked
✅ Fake timers provided instant 44% improvement  
✅ No functional changes needed to tests  
✅ All 50 tests still passing  

### Watch Out For
⚠️ Fake timers can hide timing bugs in production code  
⚠️ Always restore real timers after test  
⚠️ Some APIs don't work with fake timers (e.g., Web Speech API)  

---

## 📝 **Files Modified**

| File | Changes | Lines | Impact |
|------|---------|-------|--------|
| `__tests__/unit/SpeechQueue.test.js` | Added fake timers | 2 tests | -2.2s |

---

**Status**: ✅ **Optimization Complete**  
**Next**: Monitor CI test duration, consider additional optimizations if needed

