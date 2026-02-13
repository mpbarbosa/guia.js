# GeocodingState API Documentation

**Version:** 0.9.0-alpha  
**Module:** `src/core/GeocodingState.js`  
**Pattern:** Observer, State Management  
**Author:** Marcelo Pereira Barbosa

## Overview

Centralized state management for geocoding data. GeocodingState manages the current position and coordinate state for the geocoding workflow, implementing the Observer pattern to notify subscribers of state changes. This class follows the Single Responsibility Principle by focusing solely on state management.

## Purpose and Responsibility

- **State Management Only**: Focused responsibility - manages position and coordinate state
- **Immutability**: Returns defensive copies of state to prevent external mutation
- **Observer Pattern**: Notifies subscribers of state changes
- **Encapsulation**: Private state with public accessors
- **Type Safety**: Validates types before accepting state updates

## Location in Codebase

```
src/core/GeocodingState.js
```

## Dependencies

```javascript
import GeoPosition from './GeoPosition.js';
import { warn } from '../utils/logger.js';
```

## Design Principles

1. **Single Responsibility**: State management only
2. **Immutability**: Returns defensive copies of state
3. **Observer Pattern**: Notify observers of state changes
4. **Encapsulation**: Private state with public accessors

## Constructor

### `constructor()`

Creates a new GeocodingState instance.

**Parameters:** None

**Returns:** New `GeocodingState` instance

**Example:**
```javascript
import GeocodingState from './core/GeocodingState.js';

const state = new GeocodingState();
```

**Since:** 0.9.0-alpha

## Public Methods

### `setPosition(position)`

Set current position and notify observers.

**Parameters:**
- `position` (GeoPosition | null): The new position, or null to clear

**Returns:** `GeocodingState` - This instance for method chaining

**Throws:** `TypeError` if position is not a GeoPosition instance or null

**Example:**
```javascript
import GeoPosition from './core/GeoPosition.js';

const position = new GeoPosition(browserPosition);
state.setPosition(position);

// Clear position
state.setPosition(null);

// Method chaining
state.setPosition(position).subscribe(observer);
```

**Since:** 0.9.0-alpha

---

### `getCurrentPosition()`

Get current position.

**Returns:** `GeoPosition | null` - The current position or null if not set

**Example:**
```javascript
const position = state.getCurrentPosition();
if (position) {
  console.log(position.latitude, position.accuracyQuality);
}
```

**Since:** 0.9.0-alpha

---

### `getCurrentCoordinates()`

Get current coordinates as a defensive copy.

**Returns:** `Object | null` - Coordinates object `{latitude, longitude}` or null

**Defensive Copy:** Returns a new object, not a reference to internal state

**Example:**
```javascript
const coords = state.getCurrentCoordinates();
if (coords) {
  console.log(`Lat: ${coords.latitude}, Lon: ${coords.longitude}`);
}
```

**Since:** 0.9.0-alpha

---

### `hasPosition()`

Check if position is available.

**Returns:** `boolean` - True if position is set, false otherwise

**Example:**
```javascript
if (state.hasPosition()) {
  const coords = state.getCurrentCoordinates();
  // Use coordinates...
}
```

**Since:** 0.9.0-alpha

---

### `subscribe(callback)`

Subscribe to state changes.

**Parameters:**
- `callback` (Function): Called when state changes: `(stateSnapshot) => void`
  - `stateSnapshot` (Object): State snapshot object
    - `position` (GeoPosition): Current position
    - `coordinates` (Object): Coordinates `{latitude, longitude}`

**Returns:** `Function` - Unsubscribe function

**Throws:** `TypeError` if callback is not a function

**Example:**
```javascript
const unsubscribe = state.subscribe((stateSnapshot) => {
  console.log('New position:', stateSnapshot.position);
  console.log('Coordinates:', stateSnapshot.coordinates);
});

// Later, unsubscribe
unsubscribe();
```

**Since:** 0.9.0-alpha

---

### `unsubscribe(callback)`

Unsubscribe from state changes.

**Parameters:**
- `callback` (Function): The callback to remove

**Returns:** `boolean` - True if callback was found and removed, false otherwise

**Example:**
```javascript
const handler = (state) => console.log(state);
state.subscribe(handler);

// Later...
state.unsubscribe(handler);
```

**Since:** 0.9.0-alpha

---

### `getObserverCount()`

Get number of active observers.

**Returns:** `number` - Number of subscribed observers

**Example:**
```javascript
console.log(`Active observers: ${state.getObserverCount()}`);
```

**Since:** 0.9.0-alpha

---

### `clearObservers()`

Clear all observers.

**Returns:** `void`

**Use Case:** Useful for cleanup or testing

**Example:**
```javascript
state.clearObservers();
console.log(state.getObserverCount()); // 0
```

**Since:** 0.9.0-alpha

---

### `clear()`

Clear current position state.

**Returns:** `void`

**Example:**
```javascript
state.clear();
console.log(state.hasPosition()); // false
```

**Since:** 0.9.0-alpha

---

### `toString()`

Get string representation of current state.

**Returns:** `string` - State summary

**Format:** `"GeocodingState: position: {status}, coordinates: {coords}, observers: {count}"`

**Example:**
```javascript
console.log(state.toString());
// Output: "GeocodingState: position: available, coordinates: (-23.5505, -46.6333), observers: 2"
```

**Since:** 0.9.0-alpha

## Usage Examples

### Basic State Management

```javascript
import GeocodingState from './core/GeocodingState.js';
import GeoPosition from './core/GeoPosition.js';

// Create state manager
const state = new GeocodingState();

// Subscribe to state changes
state.subscribe((stateSnapshot) => {
  console.log('Position updated:', stateSnapshot.position);
  console.log('Coordinates:', stateSnapshot.coordinates);
});

// Set position (triggers notification)
navigator.geolocation.getCurrentPosition((browserPosition) => {
  const position = new GeoPosition(browserPosition);
  state.setPosition(position);
});
```

### Coordinate Access

```javascript
// Get current state
const coords = state.getCurrentCoordinates();
if (coords) {
  console.log(`Latitude: ${coords.latitude}`);
  console.log(`Longitude: ${coords.longitude}`);
}

const position = state.getCurrentPosition();
if (position) {
  console.log(`Accuracy: ${position.accuracy}m`);
  console.log(`Quality: ${position.accuracyQuality}`);
}
```

### Observer Pattern Implementation

```javascript
import GeocodingState from './core/GeocodingState.js';

const state = new GeocodingState();

// Multiple observers
const displayObserver = (snapshot) => {
  console.log('Display:', snapshot.coordinates);
};

const mapObserver = (snapshot) => {
  console.log('Update map:', snapshot.position);
};

const logObserver = (snapshot) => {
  console.log('Log:', snapshot);
};

// Subscribe all observers
state.subscribe(displayObserver);
state.subscribe(mapObserver);
state.subscribe(logObserver);

console.log(`Total observers: ${state.getObserverCount()}`); // 3

// Unsubscribe specific observer
state.unsubscribe(logObserver);
console.log(`Remaining: ${state.getObserverCount()}`); // 2
```

### Method Chaining

```javascript
const state = new GeocodingState();

// Chain methods
state
  .setPosition(position)
  .subscribe((snapshot) => {
    console.log('Position:', snapshot.coordinates);
  });

if (state.hasPosition()) {
  const coords = state.getCurrentCoordinates();
  console.log(coords);
}
```

### Cleanup and Testing

```javascript
import GeocodingState from './core/GeocodingState.js';

function setupState() {
  const state = new GeocodingState();
  
  // Subscribe observers
  const observer1 = (s) => console.log('Observer 1:', s);
  const observer2 = (s) => console.log('Observer 2:', s);
  
  state.subscribe(observer1);
  state.subscribe(observer2);
  
  // Cleanup function
  return () => {
    state.clearObservers();
    state.clear();
    console.log('State cleaned up');
  };
}

// Usage
const cleanup = setupState();
// ... do work ...
cleanup(); // Clean up when done
```

### Integration with WebGeocodingManager

```javascript
import GeocodingState from './core/GeocodingState.js';
import GeoPosition from './core/GeoPosition.js';

class WebGeocodingManager {
  constructor() {
    this.state = new GeocodingState();
    
    // Subscribe to state changes
    this.state.subscribe((snapshot) => {
      this.onPositionChange(snapshot);
    });
  }
  
  onPositionChange(snapshot) {
    if (snapshot.coordinates) {
      console.log('Fetching address for:', snapshot.coordinates);
      // Trigger geocoding...
    }
  }
  
  updatePosition(browserPosition) {
    const position = new GeoPosition(browserPosition);
    this.state.setPosition(position);
  }
}
```

### Error Handling

```javascript
import GeocodingState from './core/GeocodingState.js';

const state = new GeocodingState();

// Type validation
try {
  state.setPosition({ latitude: 0, longitude: 0 }); // Wrong type!
} catch (error) {
  console.error('Error:', error.message);
  // "GeocodingState: position must be a GeoPosition instance or null"
}

// Callback validation
try {
  state.subscribe("not a function"); // Wrong type!
} catch (error) {
  console.error('Error:', error.message);
  // "GeocodingState: callback must be a function"
}
```

### Defensive Copy Demonstration

```javascript
const state = new GeocodingState();
state.setPosition(position);

// Get coordinates
const coords1 = state.getCurrentCoordinates();
const coords2 = state.getCurrentCoordinates();

// Different objects (defensive copies)
console.log(coords1 !== coords2); // true

// Modifying returned object doesn't affect state
coords1.latitude = 0;
const coords3 = state.getCurrentCoordinates();
console.log(coords3.latitude); // Original value, not 0
```

## Related Classes

- **[GeoPosition](./GEO_POSITION.md)** - Position data wrapper used by GeocodingState
- **[PositionManager](./POSITION_MANAGER.md)** - Alternative position management approach
- **WebGeocodingManager** (`src/coordination/WebGeocodingManager.js`) - Uses GeocodingState
- **[ObserverSubject](./OBSERVER_SUBJECT.md)** - Alternative observer implementation

## Design Patterns

- **State Pattern**: Manages state transitions
- **Observer Pattern**: Notifies subscribers of changes
- **Defensive Copy Pattern**: Returns copies to prevent mutation
- **Method Chaining Pattern**: Returns `this` for fluent interface

## History

**Since:** 0.9.0-alpha  
**Extraction:** Extracted from WebGeocodingManager during Phase 17 refactoring  
**Purpose:** Separate state management concerns from coordination logic

## Testing

Test file: `__tests__/unit/core/GeocodingState.test.js`

```javascript
import GeocodingState from './GeocodingState.js';
import GeoPosition from './GeoPosition.js';

describe('GeocodingState', () => {
  test('state management', () => {
    const state = new GeocodingState();
    expect(state.hasPosition()).toBe(false);
    
    const position = new GeoPosition(browserPosition);
    state.setPosition(position);
    
    expect(state.hasPosition()).toBe(true);
    expect(state.getCurrentPosition()).toBe(position);
  });
  
  test('observer notification', () => {
    const state = new GeocodingState();
    const callback = jest.fn();
    
    state.subscribe(callback);
    state.setPosition(position);
    
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        position: position,
        coordinates: expect.any(Object)
      })
    );
  });
  
  test('defensive copy', () => {
    const state = new GeocodingState();
    state.setPosition(position);
    
    const coords1 = state.getCurrentCoordinates();
    const coords2 = state.getCurrentCoordinates();
    
    expect(coords1).not.toBe(coords2);
    expect(coords1).toEqual(coords2);
  });
});
```

## Performance Considerations

- **Defensive Copies**: Creates new objects on each `getCurrentCoordinates()` call
- **Observer Pattern**: O(n) notification time where n = number of observers
- **Type Validation**: Minimal overhead for instanceof checks
- **Memory**: Lightweight - only stores position reference and observers array

## Thread Safety

- Not designed for concurrent access
- Browser JavaScript is single-threaded
- State mutations are synchronous

## See Also

- [Phase 17 Refactoring Documentation](../refactoring/PHASE_17.md)
- [State Management Best Practices](../patterns/STATE_MANAGEMENT.md)
- [Observer Pattern Guide](../patterns/OBSERVER_PATTERN.md)
