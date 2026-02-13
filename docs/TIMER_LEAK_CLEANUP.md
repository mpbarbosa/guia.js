# Timer Leak Cleanup and Prevention Strategy

## Executive Summary

The test suite reports **worker process failures** due to timer leaks, with tests failing to exit gracefully. Analysis identifies **20 timer creations** (5 `setInterval`, 15 `setTimeout`) but only **3 cleanup calls**, creating significant memory and process leak risks.

**Status**: Analysis Complete | Fixes Required  
**Severity**: HIGH (Test Failures + Production Risk)  
**Root Cause**: Missing cleanup in lifecycle methods and test teardown

## Problem Statement

### Test Suite Error

```
A worker process has failed to exit gracefully and has been force exited.
This is likely caused by tests leaking due to improper teardown.
Try running with --detectOpenHandles to find leaks.
Active timers can also cause this, ensure that .unref() was called on them.
```

### Timer Statistics

```
Total Timers Created:   20 (5 setInterval, 15 setTimeout)
Total Cleanup Calls:     3 (3 clearInterval, 0 clearTimeout)
Cleanup Rate:          15% (CRITICAL - should be 100%)

Files with Potential Leaks:
  ⚠️  SpeechSynthesisManager.js (8 timers, 2 clears)
  ⚠️  Chronometer.js (2 timers, 1 clear)
  ⚠️  AddressCache.js (1 timer, 0 clears)
  ⚠️  MockGeolocationProvider.js (2 timers, 0 clears)
  ⚠️  error-recovery.js (2 timers, 0 clears)
  ⚠️  geolocation-banner.js (3 timers, 0 clears)
  ⚠️  guia.js (1 timer, 0 clears)
  ⚠️  distance.js (1 timer, 0 clears)
```

## Detailed Analysis

### Category 1: Persistent Timers (setInterval) - CRITICAL

These run indefinitely until manually stopped.

#### 1. Chronometer.js
```javascript
// LINE 104: Display update timer
this.intervalId = setInterval(() => {
  this.updateDisplay();
}, 1000);

// Cleanup exists but may not be called:
stop() {
  if (this.intervalId) {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }
}

// ⚠️ PROBLEM: No cleanup in destructor or error paths
// ⚠️ PROBLEM: Tests may not call stop() explicitly
```

**Impact**: Timer runs forever if `stop()` not called

#### 2. SpeechSynthesisManager.js - Voice Retry Timer
```javascript
// LINE 407: Voice retry mechanism
this.voiceRetryTimer = setInterval(() => {
  this.voiceRetryAttempts++;
  // Check for Brazilian Portuguese voice
  if (brazilianVoice) {
    this.stopVoiceRetryTimer();
  } else if (this.voiceRetryAttempts >= this.maxVoiceRetryAttempts) {
    this.stopVoiceRetryTimer();
  }
}, this.voiceRetryInterval);

// Cleanup exists but conditional:
stopVoiceRetryTimer() {
  if (this.voiceRetryTimer) {
    clearInterval(this.voiceRetryTimer);
    this.voiceRetryTimer = null;
  }
}

// ⚠️ PROBLEM: Timer may never stop if voice found later
// ⚠️ PROBLEM: No cleanup in destructor
```

**Impact**: Voice retry timer may leak if conditions not met

#### 3. SpeechSynthesisManager.js - Queue Timer
```javascript
// LINE 817: Queue processing timer
this.queueTimer = setInterval(() => {
  this.processQueue();
}, this.queueTimerInterval);

// Cleanup exists:
stopQueueTimer() {
  if (this.queueTimer) {
    clearInterval(this.queueTimer);
    this.queueTimer = null;
  }
}

// ⚠️ PROBLEM: No cleanup in destructor
// ⚠️ PROBLEM: Tests may not call stopQueueTimer()
```

**Impact**: Queue processing continues after tests end

#### 4. AddressCache.js - Global Cleanup Timer
```javascript
// LINE 1116: Automatic cache cleanup (GLOBAL!)
AddressCache.cleanupInterval = setInterval(() => {
  const instance = AddressCache.getInstance();
  if (instance) {
    instance.cleanExpiredEntries();
  }
}, 60000); // Every minute

// ⚠️ CRITICAL: No cleanup mechanism at all!
// ⚠️ CRITICAL: Global timer, not instance-specific
// ⚠️ CRITICAL: Runs forever, even when not needed
```

**Impact**: Global timer leaks every test run

### Category 2: One-Shot Timers (setTimeout) - MEDIUM

These fire once but can accumulate if many are created.

#### 5. SpeechSynthesisManager.js - Queue Processing Delays
```javascript
// Multiple setTimeout calls for queue processing:
setTimeout(() => this.processQueue(), 10); // LINE 754
setTimeout(() => this.processQueue(), 10); // LINE 766
setTimeout(() => this.processQueue(), 10); // LINE 780

// ⚠️ PROBLEM: No tracking or cleanup
// ⚠️ PROBLEM: May fire after tests end
```

**Impact**: Callbacks execute after test teardown

#### 6. MockGeolocationProvider.js - Simulated Delays
```javascript
// LINE 273: Simulate async geolocation
setTimeout(fn, this.config.delay);

// LINE 276: Immediate execution fallback
setTimeout(fn, 0);

// ⚠️ PROBLEM: No cleanup in test environment
// ⚠️ PROBLEM: Callbacks may fire after test ends
```

**Impact**: Async operations continue after tests

#### 7. UI Animation Timers (error-recovery.js, geolocation-banner.js)
```javascript
// error-recovery.js LINE 51:
setTimeout(() => {
  // Toast removal animation
  setTimeout(() => toast.remove(), 300);
}, 3000);

// geolocation-banner.js LINE 119:
setTimeout(() => banner.remove(), 300);

// ⚠️ PROBLEM: UI timers in test environment
// ⚠️ PROBLEM: No DOM in Node.js tests
```

**Impact**: Timers fire in non-browser environments

#### 8. Utility Timers
```javascript
// distance.js LINE 77: Delay utility
export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// guia.js LINE 95: CDN timeout
setTimeout(() => reject(new Error('CDN import timeout')), 5000);

// ⚠️ PROBLEM: Promise-based timers harder to track
// ⚠️ PROBLEM: Long delays (5 seconds) in tests
```

**Impact**: Test hangs on long delays

## Root Causes

### 1. Missing Lifecycle Cleanup Methods

**Problem**: Classes with timers lack `destroy()` or `cleanup()` methods.

```javascript
// ❌ NO CLEANUP METHOD
class Chronometer {
  start() {
    this.intervalId = setInterval(...);
  }
  
  stop() {
    clearInterval(this.intervalId);
  }
  
  // Missing: destroy() or cleanup()
}

// ✅ SHOULD HAVE
class Chronometer {
  start() { ... }
  stop() { ... }
  
  destroy() {
    this.stop();
    // Clean up any other resources
  }
}
```

### 2. Global Timers

**Problem**: Timers attached to class itself, not instances.

```javascript
// ❌ GLOBAL TIMER - BAD
AddressCache.cleanupInterval = setInterval(() => {
  // Runs forever, no way to clean up
}, 60000);

// ✅ INSTANCE TIMER - GOOD
class AddressCache {
  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.cleanExpiredEntries();
    }, 60000);
  }
  
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}
```

### 3. Test Environment Issues

**Problem**: Tests don't call cleanup methods.

```javascript
// ❌ TEST LEAKS
describe('Chronometer', () => {
  it('starts timer', () => {
    const chrono = new Chronometer();
    chrono.start();
    // TEST ENDS - timer still running!
  });
});

// ✅ PROPER CLEANUP
describe('Chronometer', () => {
  let chrono;
  
  beforeEach(() => {
    chrono = new Chronometer();
  });
  
  afterEach(() => {
    if (chrono) {
      chrono.stop(); // or chrono.destroy()
    }
  });
  
  it('starts timer', () => {
    chrono.start();
    // Timer will be cleaned up
  });
});
```

### 4. Conditional Cleanup

**Problem**: Cleanup only happens under certain conditions.

```javascript
// ❌ CONDITIONAL - MAY LEAK
startVoiceRetryTimer() {
  this.voiceRetryTimer = setInterval(() => {
    if (voiceFound) {
      this.stopVoiceRetryTimer(); // Only if voice found
    }
  }, 1000);
}

// ✅ GUARANTEED CLEANUP
destroy() {
  // Always clean up, regardless of state
  if (this.voiceRetryTimer) {
    clearInterval(this.voiceRetryTimer);
    this.voiceRetryTimer = null;
  }
}
```

## Proposed Solutions

### Solution 1: Add Lifecycle Methods to All Timer Classes

#### Chronometer.js
```javascript
class Chronometer {
  // Existing methods...
  
  /**
   * Destroys the chronometer and cleans up all resources.
   * 
   * Stops the timer, clears the interval, and releases references.
   * This method should be called when the chronometer is no longer needed,
   * especially in test environments to prevent timer leaks.
   * 
   * @returns {void}
   * @since 0.9.0-alpha
   * 
   * @example
   * const chrono = new Chronometer();
   * chrono.start();
   * // ... use chronometer
   * chrono.destroy(); // Clean up when done
   */
  destroy() {
    this.stop(); // Stop timer if running
    this.intervalId = null;
    this.element = null; // Release DOM reference
  }
}
```

#### SpeechSynthesisManager.js
```javascript
class SpeechSynthesisManager {
  // Existing methods...
  
  /**
   * Destroys the speech manager and cleans up all resources.
   * 
   * Stops all timers, clears the queue, cancels any ongoing speech,
   * and releases references. Critical for preventing timer leaks in
   * test environments.
   * 
   * @returns {void}
   * @since 0.9.0-alpha
   * 
   * @example
   * const manager = new SpeechSynthesisManager();
   * // ... use manager
   * manager.destroy(); // Clean up when done
   */
  destroy() {
    // Stop all timers
    this.stopVoiceRetryTimer();
    this.stopQueueTimer();
    
    // Cancel ongoing speech
    if (this.synth) {
      this.synth.cancel();
    }
    
    // Clear queue
    if (this.speechQueue) {
      this.speechQueue.clear();
    }
    
    // Release references
    this.synth = null;
    this.speechQueue = null;
    this.voice = null;
  }
}
```

#### AddressCache.js
```javascript
class AddressCache {
  constructor() {
    // ... existing code
    
    // CHANGE: Make timer instance-based, not global
    this.cleanupInterval = setInterval(() => {
      this.cleanExpiredEntries();
    }, 60000);
  }
  
  /**
   * Destroys the cache and cleans up all resources.
   * 
   * Stops the cleanup timer, clears the cache, and releases references.
   * Important for test environments to prevent timer leaks.
   * 
   * @returns {void}
   * @since 0.9.0-alpha
   */
  destroy() {
    // Stop cleanup timer
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Clear cache
    this.clearCache();
    
    // Release references
    this.observerSubject = null;
  }
  
  // REMOVE: Global timer (LINE 1116)
  // AddressCache.cleanupInterval = setInterval(...)  // DELETE THIS!
}
```

### Solution 2: Fix Test Environment

#### Update Test Setup/Teardown
```javascript
// __tests__/unit/Chronometer.test.js
describe('Chronometer', () => {
  let chronometer;
  
  beforeEach(() => {
    chronometer = new Chronometer(document, 'test-element');
  });
  
  afterEach(() => {
    // CRITICAL: Always clean up
    if (chronometer) {
      chronometer.destroy();
      chronometer = null;
    }
  });
  
  it('starts timing', () => {
    chronometer.start();
    expect(chronometer.isRunning).toBe(true);
    // Timer will be cleaned up in afterEach
  });
});
```

#### Jest Configuration
```javascript
// jest.config.js or package.json
{
  "testEnvironment": "jsdom",
  "testTimeout": 10000, // Reasonable timeout
  "forceExit": false, // Don't force exit - find leaks instead
  "detectOpenHandles": true, // Detect timer leaks
  "detectLeaks": true // Enable leak detection
}
```

### Solution 3: Track Timers Explicitly

#### Timer Registry Pattern
```javascript
/**
 * Tracks and manages all application timers for cleanup.
 */
class TimerRegistry {
  constructor() {
    this.timers = new Set();
  }
  
  /**
   * Registers a setInterval timer.
   */
  setInterval(callback, delay) {
    const id = setInterval(callback, delay);
    this.timers.add({ id, type: 'interval' });
    return id;
  }
  
  /**
   * Registers a setTimeout timer.
   */
  setTimeout(callback, delay) {
    const id = setTimeout(callback, delay);
    this.timers.add({ id, type: 'timeout' });
    return id;
  }
  
  /**
   * Clears a specific timer.
   */
  clear(id) {
    const timer = Array.from(this.timers).find(t => t.id === id);
    if (timer) {
      if (timer.type === 'interval') {
        clearInterval(timer.id);
      } else {
        clearTimeout(timer.id);
      }
      this.timers.delete(timer);
    }
  }
  
  /**
   * Clears all tracked timers.
   */
  clearAll() {
    for (const timer of this.timers) {
      if (timer.type === 'interval') {
        clearInterval(timer.id);
      } else {
        clearTimeout(timer.id);
      }
    }
    this.timers.clear();
  }
}

// Global registry for test cleanup
export const timerRegistry = new TimerRegistry();

// Usage in classes:
class Chronometer {
  start() {
    this.intervalId = timerRegistry.setInterval(() => {
      this.updateDisplay();
    }, 1000);
  }
  
  stop() {
    if (this.intervalId) {
      timerRegistry.clear(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Test cleanup:
afterEach(() => {
  timerRegistry.clearAll(); // Clean up all timers
});
```

### Solution 4: Use Timer Wrappers

#### AutoCleanupTimer Class
```javascript
/**
 * Self-cleaning timer that automatically cleans up on destroy.
 */
class AutoCleanupTimer {
  constructor(callback, delay, type = 'interval') {
    this.callback = callback;
    this.delay = delay;
    this.type = type;
    this.timerId = null;
    this.isRunning = false;
  }
  
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    if (this.type === 'interval') {
      this.timerId = setInterval(this.callback, this.delay);
    } else {
      this.timerId = setTimeout(this.callback, this.delay);
    }
  }
  
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.type === 'interval') {
      clearInterval(this.timerId);
    } else {
      clearTimeout(this.timerId);
    }
    this.timerId = null;
  }
  
  destroy() {
    this.stop();
    this.callback = null;
  }
}

// Usage:
class Chronometer {
  constructor() {
    this.displayTimer = new AutoCleanupTimer(
      () => this.updateDisplay(),
      1000,
      'interval'
    );
  }
  
  start() {
    this.displayTimer.start();
  }
  
  stop() {
    this.displayTimer.stop();
  }
  
  destroy() {
    this.displayTimer.destroy();
  }
}
```

## Implementation Plan

### Phase 1: Fix Critical Leaks (Week 1) - HIGH PRIORITY

**Critical timers that MUST be fixed immediately:**

1. ✅ **AddressCache.js Global Timer**
   - Remove global `AddressCache.cleanupInterval`
   - Move to instance timer
   - Add `destroy()` method
   - Update tests

2. ✅ **Chronometer.js**
   - Add `destroy()` method
   - Update all tests with `afterEach` cleanup
   - Verify timer cleanup

3. ✅ **SpeechSynthesisManager.js**
   - Add `destroy()` method
   - Clean up voice retry timer
   - Clean up queue timer
   - Update tests

### Phase 2: Add Lifecycle Methods (Week 2)

**Add `destroy()` to all classes with timers:**

1. All classes from Phase 1
2. MockGeolocationProvider (test utility)
3. Document lifecycle patterns
4. Create base class or interface

### Phase 3: Update Test Infrastructure (Week 3)

**Ensure all tests clean up properly:**

1. Add `afterEach` cleanup to all timer tests
2. Enable `detectOpenHandles` in Jest
3. Fix any remaining leaks found
4. Document test cleanup patterns

### Phase 4: Prevention (Week 4)

**Prevent future leaks:**

1. Create TimerRegistry or AutoCleanupTimer
2. Add ESLint rules for timer usage
3. Document timer best practices
4. Code review checklist

## Success Metrics

### Before
```
Timer Cleanup Rate:       15% (3/20)
Test Process Exits:       Forced (worker failures)
Open Handles:             Unknown
Timer Tracking:           None
```

### After
```
Timer Cleanup Rate:       100% (20/20)
Test Process Exits:       Graceful
Open Handles:             0 detected
Timer Tracking:           Automated
```

### Test Validation
```bash
# Enable leak detection
npm test -- --detectOpenHandles --detectLeaks

# Should output:
# ✅ All tests passed
# ✅ No open handles detected
# ✅ No memory leaks detected
```

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Breaking tests | LOW | Add cleanup methods, don't change behavior |
| Performance impact | LOW | Cleanup only in destroy(), not hot path |
| Missing cleanup calls | MEDIUM | Document lifecycle, add to guidelines |
| Complex refactoring | LOW | Incremental changes, one class at a time |

## Timeline

| Phase | Duration | Priority | Status |
|-------|----------|----------|--------|
| Phase 1: Fix critical leaks | Week 1 | CRITICAL | ⚠️ Urgent |
| Phase 2: Add lifecycle methods | Week 2 | HIGH | ⚠️ Planned |
| Phase 3: Update test infrastructure | Week 3 | MEDIUM | ⚠️ Planned |
| Phase 4: Prevention mechanisms | Week 4 | LOW | ⚠️ Planned |

**Total Timeline**: 4 weeks

## Conclusion

Timer leaks are causing test failures and pose production risks. The analysis identifies 20 timer creations with only 15% cleanup rate. The proposed 4-phase plan systematically addresses all leaks, starting with critical fixes in Week 1.

**Immediate Action Required**: Fix AddressCache global timer and add destroy() methods to Chronometer and SpeechSynthesisManager.

## References

- [Jest Detect Open Handles](https://jestjs.io/docs/cli#--detectopenhandles)
- [Node.js Timer Best Practices](https://nodejs.org/en/docs/guides/timers-in-node/)
- [Memory Leaks in JavaScript](https://developer.chrome.com/docs/devtools/memory-problems/)
- [Testing Async Code](https://jestjs.io/docs/asynchronous)
