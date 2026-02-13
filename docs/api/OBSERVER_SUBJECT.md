# ObserverSubject API Documentation

**Version:** 0.9.0-alpha  
**Module:** `src/core/ObserverSubject.js`  
**Pattern:** Observer (Subject Implementation)  
**Author:** Marcelo Pereira Barbosa

## Overview

ObserverSubject centralizes observer pattern implementation with immutable state updates. This class provides a reusable implementation of the observer pattern, supporting both object-based observers (with update methods) and function-based observers. It eliminates code duplication across multiple classes that need observer functionality.

## Purpose and Responsibility

- **Reusable Observer Pattern**: Centralized implementation for use across multiple classes
- **Immutable State Management**: Observer arrays managed immutably using spread and filter
- **Dual Observer Types**: Supports both object observers (with update methods) and function observers
- **Referential Transparency**: Predictable state transitions without direct mutation
- **Composition Ready**: Designed for use via composition in other classes

## Location in Codebase

```
src/core/ObserverSubject.js
```

## Dependencies

```javascript
import { log } from '../utils/logger.js';
```

## Referential Transparency & Immutability

- Observer arrays are managed immutably using spread operator and filter
- `subscribe()` and `unsubscribe()` create new arrays instead of mutating in place
- State transitions are predictable and referentially transparent
- Each operation returns void but updates state without direct mutation

## Constructor

### `constructor()`

Creates a new ObserverSubject instance.

**Parameters:** None

**Returns:** New `ObserverSubject` instance with empty observer arrays

**Example:**
```javascript
import ObserverSubject from './core/ObserverSubject.js';

const subject = new ObserverSubject();
```

**Since:** 0.9.0-alpha

## Public Methods

### Object Observer Methods

#### `subscribe(observer)`

Subscribes an observer object to receive notifications. The observer must have an update() method.

**Parameters:**
- `observer` (Object): Observer object with an update method
  - `observer.update` (Function): Method called when notifying observers: `(subject, ...args) => void`

**Returns:** `void`

**Immutable Pattern:** Creates a new array using spread operator instead of mutating the existing observers array.

**Example:**
```javascript
const observer = {
  update: (subject, ...args) => {
    console.log('Notified with:', args);
  }
};
observerSubject.subscribe(observer);

// Demonstrating immutability
const originalArray = observerSubject.observers;
observerSubject.subscribe(observer);
const newArray = observerSubject.observers;
console.log(originalArray !== newArray); // true - new array created
```

**Since:** 0.9.0-alpha

---

#### `unsubscribe(observer)`

Unsubscribes an observer object from notifications.

**Parameters:**
- `observer` (Object): Observer object to remove

**Returns:** `void`

**Immutable Pattern:** Uses filter to create a new array without the observer.

**Example:**
```javascript
observerSubject.unsubscribe(observer);

// Demonstrating immutability
const arrayBefore = observerSubject.observers;
observerSubject.unsubscribe(observer);
const arrayAfter = observerSubject.observers;
console.log(arrayBefore !== arrayAfter); // true - new array created
```

**Since:** 0.9.0-alpha

---

#### `notifyObservers(...args)`

Notifies all subscribed object observers. Calls the update() method on each observer.

**Parameters:**
- `...args` (*): Arguments to pass to each observer's update method

**Returns:** `void`

**Example:**
```javascript
observerSubject.notifyObservers(data1, data2, eventType);
```

**Since:** 0.9.0-alpha

---

### Function Observer Methods

#### `subscribeFunction(observerFunction)`

Subscribes a function to receive notifications.

**Parameters:**
- `observerFunction` (Function): Function to be called on notifications: `(subject, ...args) => void`

**Returns:** `void`

**Immutable Pattern:** Creates a new array using spread operator.

**Example:**
```javascript
const handler = (subject, ...args) => {
  console.log('Function observer notified:', args);
};
observerSubject.subscribeFunction(handler);
```

**Since:** 0.9.0-alpha

---

#### `unsubscribeFunction(observerFunction)`

Unsubscribes a function from notifications.

**Parameters:**
- `observerFunction` (Function): Function to remove

**Returns:** `void`

**Immutable Pattern:** Uses filter to create a new array.

**Example:**
```javascript
observerSubject.unsubscribeFunction(handler);
```

**Since:** 0.9.0-alpha

---

#### `notifyFunctionObservers(...args)`

Notifies all subscribed function observers.

**Parameters:**
- `...args` (*): Arguments to pass to each observer function

**Returns:** `void`

**Example:**
```javascript
observerSubject.notifyFunctionObservers(data1, data2);
```

**Since:** 0.9.0-alpha

---

### Utility Methods

#### `getObserverCount()`

Gets the count of subscribed object observers.

**Returns:** `number` - Number of subscribed observers

**Example:**
```javascript
console.log(`Object observers: ${subject.getObserverCount()}`);
```

**Since:** 0.9.0-alpha

---

#### `getFunctionObserverCount()`

Gets the count of subscribed function observers.

**Returns:** `number` - Number of subscribed function observers

**Example:**
```javascript
console.log(`Function observers: ${subject.getFunctionObserverCount()}`);
```

**Since:** 0.9.0-alpha

---

#### `clearAllObservers()`

Clears all observers (both object and function observers).

**Returns:** `void`

**Example:**
```javascript
subject.clearAllObservers();
console.log(subject.getObserverCount()); // 0
console.log(subject.getFunctionObserverCount()); // 0
```

**Since:** 0.9.0-alpha

## Properties

- `observers` (Array): Array of subscribed object observers (read-only, managed immutably)
- `functionObservers` (Array): Array of subscribed function observers (read-only, managed immutably)

## Usage Examples

### Basic Usage with Composition

```javascript
import ObserverSubject from './core/ObserverSubject.js';

// Using in a class via composition
class MyClass {
  constructor() {
    this.observerSubject = new ObserverSubject();
  }
  
  subscribe(observer) {
    this.observerSubject.subscribe(observer);
  }
  
  notify(...args) {
    this.observerSubject.notifyObservers(...args);
  }
}
```

### Object Observers

```javascript
import ObserverSubject from './core/ObserverSubject.js';

const subject = new ObserverSubject();

// Create observers
const observer1 = {
  update: (subject, eventType, data) => {
    console.log('Observer 1:', eventType, data);
  }
};

const observer2 = {
  update: (subject, eventType, data) => {
    console.log('Observer 2:', eventType, data);
  }
};

// Subscribe observers
subject.subscribe(observer1);
subject.subscribe(observer2);

// Notify all observers
subject.notifyObservers('position-updated', { lat: -23.5505, lon: -46.6333 });

// Unsubscribe
subject.unsubscribe(observer1);
```

### Function Observers

```javascript
import ObserverSubject from './core/ObserverSubject.js';

const subject = new ObserverSubject();

// Function-based observers
const handler1 = (subject, ...args) => {
  console.log('Handler 1 received:', args);
};

const handler2 = (subject, ...args) => {
  console.log('Handler 2 received:', args);
};

// Subscribe functions
subject.subscribeFunction(handler1);
subject.subscribeFunction(handler2);

// Notify function observers
subject.notifyFunctionObservers('data-changed', { value: 42 });

// Unsubscribe
subject.unsubscribeFunction(handler1);
```

### Immutable Observer Management

```javascript
const subject = new ObserverSubject();
const observer1 = { update: () => {} };
const observer2 = { update: () => {} };

subject.subscribe(observer1);
const array1 = subject.observers; // [observer1]

subject.subscribe(observer2);
const array2 = subject.observers; // [observer1, observer2]

// array1 and array2 are different instances (immutable pattern)
console.log(array1 !== array2); // true
console.log(array1.length); // 1 (original unchanged)
console.log(array2.length); // 2 (new array created)
```

### Integration with PositionManager

```javascript
import ObserverSubject from './core/ObserverSubject.js';
import GeoPosition from './core/GeoPosition.js';

class PositionManager {
  constructor(position) {
    this.observerSubject = new ObserverSubject();
    this.lastPosition = null;
    
    if (position) {
      this.update(position);
    }
  }
  
  subscribe(observer) {
    this.observerSubject.subscribe(observer);
  }
  
  unsubscribe(observer) {
    this.observerSubject.unsubscribe(observer);
  }
  
  update(position) {
    this.lastPosition = new GeoPosition(position);
    this.observerSubject.notifyObservers(
      this, 
      'position-updated',
      this.lastPosition
    );
  }
  
  get observers() {
    return this.observerSubject.observers;
  }
}
```

### Mixed Observer Types

```javascript
const subject = new ObserverSubject();

// Object observer
const objectObserver = {
  update: (subject, ...args) => console.log('Object:', args)
};

// Function observer
const functionObserver = (subject, ...args) => console.log('Function:', args);

// Subscribe both types
subject.subscribe(objectObserver);
subject.subscribeFunction(functionObserver);

// Notify separately
subject.notifyObservers('event1', 'data1');          // Only object observers
subject.notifyFunctionObservers('event2', 'data2');  // Only function observers

console.log(`Object observers: ${subject.getObserverCount()}`);           // 1
console.log(`Function observers: ${subject.getFunctionObserverCount()}`); // 1
```

### Error-Safe Observer Pattern

```javascript
import ObserverSubject from './core/ObserverSubject.js';

class SafeSubject extends ObserverSubject {
  notifyObservers(...args) {
    this.observers.forEach((observer) => {
      try {
        if (typeof observer.update === "function") {
          observer.update(...args);
        }
      } catch (error) {
        console.error('Observer error:', error);
      }
    });
  }
}

const subject = new SafeSubject();
const faultyObserver = {
  update: () => { throw new Error('Observer failed'); }
};

subject.subscribe(faultyObserver);
subject.notifyObservers(); // Logs error but continues
```

### Cleanup and Resource Management

```javascript
function createManagedSubject() {
  const subject = new ObserverSubject();
  
  // Setup observers
  const observer1 = { update: () => console.log('Observer 1') };
  const observer2 = { update: () => console.log('Observer 2') };
  
  subject.subscribe(observer1);
  subject.subscribe(observer2);
  
  // Return subject with cleanup function
  return {
    subject,
    cleanup: () => {
      subject.clearAllObservers();
      console.log('All observers cleared');
    }
  };
}

// Usage
const { subject, cleanup } = createManagedSubject();
subject.notifyObservers('test');
cleanup(); // Clean up when done
```

## Related Classes

- **[PositionManager](./POSITION_MANAGER.md)** - Uses ObserverSubject for position notifications
- **SingletonStatusManager** (`src/status/SingletonStatusManager.js`) - Uses ObserverSubject
- **[GeocodingState](./GEOCODING_STATE.md)** - Alternative observer implementation
- **[GeoPosition](./GEO_POSITION.md)** - Position data passed to observers

## Design Patterns

- **Observer Pattern**: Subject-observer relationship implementation
- **Composition Pattern**: Designed to be composed into other classes
- **Immutable State Pattern**: State transitions create new arrays
- **Strategy Pattern**: Supports multiple observer types (object/function)

## Advantages Over Traditional Implementation

1. **Reusability**: Single implementation used across multiple classes
2. **Immutability**: State updates are predictable and referentially transparent
3. **Type Flexibility**: Supports both object and function observers
4. **Code Reduction**: Eliminates duplicated observer management code
5. **Testability**: Easier to test in isolation

## Testing

Test file: `__tests__/unit/core/ObserverSubject.test.js`

```javascript
import ObserverSubject from './ObserverSubject.js';

describe('ObserverSubject', () => {
  test('subscribe and notify', () => {
    const subject = new ObserverSubject();
    const observer = { update: jest.fn() };
    
    subject.subscribe(observer);
    subject.notifyObservers('test-event', 'data');
    
    expect(observer.update).toHaveBeenCalledWith('test-event', 'data');
  });
  
  test('immutable observer array', () => {
    const subject = new ObserverSubject();
    const observer = { update: () => {} };
    
    const array1 = subject.observers;
    subject.subscribe(observer);
    const array2 = subject.observers;
    
    expect(array1).not.toBe(array2);
    expect(array1.length).toBe(0);
    expect(array2.length).toBe(1);
  });
  
  test('unsubscribe', () => {
    const subject = new ObserverSubject();
    const observer = { update: jest.fn() };
    
    subject.subscribe(observer);
    subject.unsubscribe(observer);
    subject.notifyObservers('test');
    
    expect(observer.update).not.toHaveBeenCalled();
  });
});
```

## Performance Considerations

- **Array Creation**: Creates new arrays on subscribe/unsubscribe (O(n) space)
- **Notification**: O(n) time complexity where n = number of observers
- **Memory**: Each state transition creates new array (garbage collected)
- **Trade-off**: Immutability benefits outweigh minor performance cost

## Best Practices

1. **Prefer Composition**: Use via composition, not inheritance
2. **Observer Cleanup**: Always unsubscribe when no longer needed
3. **Error Handling**: Wrap observer calls in try-catch for production
4. **Type Checking**: Validate observer has update method before calling
5. **Documentation**: Document expected observer interface

## Migration Guide

### From Direct Array Manipulation

```javascript
// Before (mutable)
class OldClass {
  constructor() {
    this.observers = [];
  }
  
  subscribe(observer) {
    this.observers.push(observer); // Direct mutation
  }
  
  notify() {
    this.observers.forEach(o => o.update());
  }
}

// After (immutable)
import ObserverSubject from './core/ObserverSubject.js';

class NewClass {
  constructor() {
    this.observerSubject = new ObserverSubject();
  }
  
  subscribe(observer) {
    this.observerSubject.subscribe(observer); // Immutable
  }
  
  notify() {
    this.observerSubject.notifyObservers();
  }
}
```

## See Also

- [Observer Pattern Documentation](../patterns/OBSERVER_PATTERN.md)
- [Immutability Guide](../guides/IMMUTABILITY.md)
- [PositionManager Implementation](./POSITION_MANAGER.md)
- [Composition vs Inheritance](../patterns/COMPOSITION.md)
