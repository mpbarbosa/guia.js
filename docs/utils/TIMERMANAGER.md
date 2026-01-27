# TimerManager - Centralized Timer Management

## Overview

`TimerManager` is a singleton utility class that provides centralized management of JavaScript timers (`setInterval` and `setTimeout`) to prevent memory leaks and ensure proper cleanup in both Node.js and browser environments.

## Location

**File:** `src/utils/TimerManager.js`  
**Size:** 147 lines  
**Test Coverage:** 100% (26 tests)  
**Test File:** `__tests__/utils/TimerManager.test.js`

## Purpose

### Problem Solved

Without centralized timer management:
- Timers can be forgotten and continue running indefinitely
- Memory leaks occur from uncleaned timers
- Hard to track all active timers in an application
- Process may hang due to active timers (Node.js)

### Solution Provided

`TimerManager` provides:
- **Automatic tracking** of all created timers
- **Named timers** for easy identification
- **Bulk cleanup** via `clearAll()`
- **Node.js optimization** (prevents hanging)
- **Memory leak prevention**

## API Reference

### setInterval(callback, delay, id)

Creates a tracked interval timer.

**Parameters:**
- `callback` (Function) - Function to execute repeatedly
- `delay` (number) - Delay between executions in milliseconds
- `id` (string) - Unique identifier for the timer

**Returns:** `string` - Timer ID

**Example:**
```javascript
import timerManager from './utils/TimerManager.js';

timerManager.setInterval(
    () => console.log('tick'),
    1000,
    'heartbeat'
);
```

### setTimeout(callback, delay, id)

Creates a tracked timeout timer.

**Parameters:**
- `callback` (Function) - Function to execute once
- `delay` (number) - Delay before execution in milliseconds
- `id` (string) - Unique identifier for the timer

**Returns:** `string` - Timer ID

### clearTimer(id)

Clears a specific timer by ID.

**Parameters:**
- `id` (string) - Timer identifier

**Returns:** `boolean` - `true` if cleared

### clearAll()

Clears all tracked timers.

**Returns:** `number` - Count of cleared timers

### getTimerCount()

Gets the count of active timers.

**Returns:** `number` - Number of active timers

### hasTimer(id)

Checks if a timer exists.

**Parameters:**
- `id` (string) - Timer identifier

**Returns:** `boolean`

### getActiveTimers()

Gets all active timer IDs.

**Returns:** `string[]` - Array of timer IDs

## Usage Example

```javascript
import timerManager from './utils/TimerManager.js';

// Start interval
timerManager.setInterval(
    () => updateUI(),
    1000,
    'uiUpdater'
);

// Later: stop interval
timerManager.clearTimer('uiUpdater');

// Cleanup all on exit
process.on('exit', () => {
    timerManager.clearAll();
});
```

## Best Practices

1. **Always use named IDs** - Makes debugging easier
2. **Clear timers when done** - Prevents memory leaks
3. **Use unique IDs** - Avoid overwriting timers
4. **Clean up in tests** - Call `clearAll()` in `afterEach()`

## Testing

**Coverage:** 100% (26 tests)  
**Test File:** `__tests__/utils/TimerManager.test.js`

## Related Documentation

- [TIMER_MANAGEMENT_CLEANUP.md](../TIMER_MANAGEMENT_CLEANUP.md)
- [CONTRIBUTING.md](../../.github/CONTRIBUTING.md)
