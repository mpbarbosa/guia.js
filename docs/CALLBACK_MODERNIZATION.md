# Callback Pattern Modernization Plan

## Executive Summary

AddressCache.js implements an **emerging callback hell** pattern with **3 separate callback properties** for change detection. This violates DRY principles, creates API complexity, and prevents extensibility. The solution is to modernize to a **single unified callback** with change type parameter, or better yet, migrate to **Observer pattern** (already partially implemented).

**Status**: Analysis Complete | Modernization Planned  
**Severity**: Medium (Growing Technical Debt)  
**Recommendation**: Consolidate to single callback or migrate to Observer

## Current State Analysis

### Callback Properties in AddressCache

```javascript
class AddressCache {
  constructor() {
    // THREE separate callback properties
    this.logradouroChangeCallback = null;  // Street changes
    this.bairroChangeCallback = null;      // Neighborhood changes
    this.municipioChangeCallback = null;    // City changes
    
    // Plus observer pattern (already exists!)
    this.observerSubject = new ObserverSubject();
  }
}
```

### API Complexity

The current API requires managing **9 methods** for 3 callback types:

```javascript
// Setters (3 methods)
setLogradouroChangeCallback(callback)
setBairroChangeCallback(callback)
setMunicipioChangeCallback(callback)

// Getters (3 methods)
getLogradouroChangeCallback()
getBairroChangeCallback()
getMunicipioChangeCallback()

// Internal invocation (3 code paths)
if (this.logradouroChangeCallback) {
  this.logradouroChangeCallback(details);
}
if (this.bairroChangeCallback) {
  this.bairroChangeCallback(details);
}
if (this.municipioChangeCallback) {
  this.municipioChangeCallback(details);
}
```

**Plus 6 deprecated static wrapper methods** = **15 total methods** for callbacks!

### Problems

#### 1. **Callback Proliferation** (Medium Impact)

**Problem**: Every new change type requires 2+ new methods.

```javascript
// Current: 3 types = 9 methods
setLogradouroChangeCallback()
getLogradouroChangeCallback()
// ... etc for bairro, municipio

// Future: 5 types = 15 methods?
setLogradouroChangeCallback()
setCEPChangeCallback()
setEstadoChangeCallback()
setPaisChangeCallback()
// ... this doesn't scale!
```

**Impact**:
- API bloat
- Maintenance burden
- Poor extensibility
- Code duplication

#### 2. **Violates DRY Principle** (Medium Impact)

**Problem**: Same pattern repeated 3 times.

```javascript
// ❌ REPEATED CODE (3×)
setLogradouroChangeCallback(callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('Callback must be a function');
  }
  this.logradouroChangeCallback = callback;
}

setBairroChangeCallback(callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('Callback must be a function');
  }
  this.bairroChangeCallback = callback;
}

setMunicipioChangeCallback(callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('Callback must be a function');
  }
  this.municipioChangeCallback = callback;
}

// Same pattern, different variable - this is code smell!
```

**Impact**:
- Code duplication
- Harder to maintain
- Inconsistent behavior risk

#### 3. **API Confusion** (Low Impact)

**Problem**: Users must remember 3 different method names.

```javascript
// ❌ CONFUSING - which method do I need?
cache.setLogradouroChangeCallback(fn1);
cache.setBairroChangeCallback(fn2);
cache.setMunicipioChangeCallback(fn3);

// Easy to forget one
// Hard to set all at once
// Can't dynamically set by type
```

**Impact**:
- Developer confusion
- Incomplete setup
- Hard to document

#### 4. **Observer Pattern Already Exists!** (High Impact)

**Problem**: Callbacks are redundant - Observer pattern is better and already implemented.

```javascript
// Current: TWO notification systems coexist
class AddressCache {
  constructor() {
    // Old: Callbacks
    this.logradouroChangeCallback = null;
    this.bairroChangeCallback = null;
    this.municipioChangeCallback = null;
    
    // New: Observer pattern
    this.observerSubject = new ObserverSubject();
  }
}

// Users can use EITHER:
// Option 1: Callbacks (old)
cache.setLogradouroChangeCallback(fn);

// Option 2: Observer (better)
cache.subscribe(observer);
```

**Impact**:
- Architectural inconsistency
- Redundant functionality
- Maintenance of two systems

## Proposed Solutions

### Solution 1: Single Unified Callback (Simple)

**Goal**: Consolidate 3 callbacks into 1 with type parameter.

```javascript
class AddressCache {
  constructor() {
    // BEFORE: 3 separate callbacks
    // this.logradouroChangeCallback = null;
    // this.bairroChangeCallback = null;
    // this.municipioChangeCallback = null;
    
    // AFTER: Single unified callback
    this.changeCallback = null;
  }
  
  /**
   * Sets a unified change callback for all change types.
   * 
   * @param {Function} callback - Called with (changeType, details)
   * @param {string} changeType - 'logradouro', 'bairro', or 'municipio'
   * @param {Object} details - Change details object
   * 
   * @example
   * cache.setChangeCallback((changeType, details) => {
   *   switch(changeType) {
   *     case 'logradouro':
   *       console.log('Street changed:', details);
   *       break;
   *     case 'bairro':
   *       console.log('Neighborhood changed:', details);
   *       break;
   *     case 'municipio':
   *       console.log('City changed:', details);
   *       break;
   *   }
   * });
   */
  setChangeCallback(callback) {
    if (callback && typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }
    this.changeCallback = callback;
  }
  
  /**
   * Gets the unified change callback.
   */
  getChangeCallback() {
    return this.changeCallback;
  }
  
  /**
   * Removes the change callback.
   */
  clearChangeCallback() {
    this.changeCallback = null;
  }
  
  /**
   * Internal: Notifies callback of changes.
   */
  _notifyChange(changeType, details) {
    if (this.changeCallback) {
      try {
        this.changeCallback(changeType, details);
      } catch (error) {
        console.error(`Change callback error (${changeType}):`, error);
      }
    }
  }
  
  // Usage in change detection:
  _detectChanges() {
    if (this.hasLogradouroChanged()) {
      const details = this.getLogradouroChangeDetails();
      this._notifyChange('logradouro', details);
    }
    
    if (this.hasBairroChanged()) {
      const details = this.getBairroChangeDetails();
      this._notifyChange('bairro', details);
    }
    
    if (this.hasMunicipioChanged()) {
      const details = this.getMunicipioChangeDetails();
      this._notifyChange('municipio', details);
    }
  }
}
```

**Benefits**:
- ✅ 3 methods → 3 methods (setChange, getChange, clearChange)
- ✅ Extensible (add new types without new methods)
- ✅ Single API surface
- ✅ Easier to use

**Migration Path**:
```javascript
// BEFORE: 3 separate callbacks
cache.setLogradouroChangeCallback((details) => {
  console.log('Street:', details);
});
cache.setBairroChangeCallback((details) => {
  console.log('Neighborhood:', details);
});

// AFTER: Single unified callback
cache.setChangeCallback((type, details) => {
  if (type === 'logradouro') {
    console.log('Street:', details);
  } else if (type === 'bairro') {
    console.log('Neighborhood:', details);
  }
});
```

### Solution 2: Callback Registry with Type Filtering (Flexible)

**Goal**: Allow multiple callbacks per type.

```javascript
class AddressCache {
  constructor() {
    // Registry of callbacks by type
    this.changeCallbacks = new Map();
    // Map<changeType, Set<callback>>
  }
  
  /**
   * Registers a callback for specific change type(s).
   * 
   * @param {string|string[]} types - Change type(s) to listen for
   * @param {Function} callback - Called with (changeType, details)
   * 
   * @example
   * // Single type
   * cache.onChangeType('logradouro', (type, details) => {
   *   console.log('Street changed:', details);
   * });
   * 
   * // Multiple types
   * cache.onChangeType(['bairro', 'municipio'], (type, details) => {
   *   console.log(`${type} changed:`, details);
   * });
   * 
   * // All types (wildcard)
   * cache.onChangeType('*', (type, details) => {
   *   console.log('Something changed:', type, details);
   * });
   */
  onChangeType(types, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }
    
    const typeArray = Array.isArray(types) ? types : [types];
    
    for (const type of typeArray) {
      if (!this.changeCallbacks.has(type)) {
        this.changeCallbacks.set(type, new Set());
      }
      this.changeCallbacks.get(type).add(callback);
    }
    
    // Return unsubscribe function
    return () => this.offChangeType(types, callback);
  }
  
  /**
   * Removes a callback for specific change type(s).
   */
  offChangeType(types, callback) {
    const typeArray = Array.isArray(types) ? types : [types];
    
    for (const type of typeArray) {
      const callbacks = this.changeCallbacks.get(type);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.changeCallbacks.delete(type);
        }
      }
    }
  }
  
  /**
   * Internal: Notifies all registered callbacks for a change type.
   */
  _notifyChange(changeType, details) {
    // Notify specific type callbacks
    const specificCallbacks = this.changeCallbacks.get(changeType);
    if (specificCallbacks) {
      for (const callback of specificCallbacks) {
        try {
          callback(changeType, details);
        } catch (error) {
          console.error(`Change callback error (${changeType}):`, error);
        }
      }
    }
    
    // Notify wildcard callbacks
    const wildcardCallbacks = this.changeCallbacks.get('*');
    if (wildcardCallbacks) {
      for (const callback of wildcardCallbacks) {
        try {
          callback(changeType, details);
        } catch (error) {
          console.error(`Change callback error (*):`, error);
        }
      }
    }
  }
}
```

**Benefits**:
- ✅ Multiple callbacks per type
- ✅ Type filtering
- ✅ Wildcard support
- ✅ Unsubscribe function
- ✅ Very flexible

**Usage**:
```javascript
// Multiple handlers for same type
const unsubscribe1 = cache.onChangeType('logradouro', (type, details) => {
  updateUI(details);
});

const unsubscribe2 = cache.onChangeType('logradouro', (type, details) => {
  logAnalytics(details);
});

// Listen to multiple types
cache.onChangeType(['bairro', 'municipio'], (type, details) => {
  console.log(`Location level changed: ${type}`);
});

// Wildcard for all changes
cache.onChangeType('*', (type, details) => {
  console.log('Any change:', type);
});

// Unsubscribe
unsubscribe1();
```

### Solution 3: Migrate to Observer Pattern (Recommended)

**Goal**: Deprecate callbacks entirely, use existing Observer pattern.

**Rationale**:
- Observer pattern already implemented (ObserverSubject)
- More flexible than callbacks
- Standard design pattern
- Already used elsewhere in codebase
- Reduces duplicate systems

```javascript
class AddressCache {
  constructor() {
    // REMOVE: All callback properties
    // this.logradouroChangeCallback = null;
    // this.bairroChangeCallback = null;
    // this.municipioChangeCallback = null;
    // this.changeCallback = null;
    
    // KEEP: Observer pattern only
    this.observerSubject = new ObserverSubject();
  }
  
  /**
   * Subscribes an observer to address changes.
   * 
   * Observer will receive update(changeEvent) calls with:
   * - changeEvent.type: 'address-change'
   * - changeEvent.changeType: 'logradouro', 'bairro', or 'municipio'
   * - changeEvent.details: Change details object
   * - changeEvent.timestamp: When change occurred
   * 
   * @param {Object} observer - Object with update(event) method
   * 
   * @example
   * const observer = {
   *   update(event) {
   *     console.log(`${event.changeType} changed:`, event.details);
   *   }
   * };
   * cache.subscribe(observer);
   */
  subscribe(observer) {
    this.observerSubject.subscribe(observer);
  }
  
  /**
   * Unsubscribes an observer.
   */
  unsubscribe(observer) {
    this.observerSubject.unsubscribe(observer);
  }
  
  /**
   * Internal: Notifies observers of changes.
   */
  _notifyChange(changeType, details) {
    const event = {
      type: 'address-change',
      changeType,
      details,
      timestamp: Date.now()
    };
    
    this.observerSubject.notify(event);
  }
}
```

**Migration from callbacks to observers**:
```javascript
// BEFORE: Callbacks
cache.setLogradouroChangeCallback((details) => {
  console.log('Street changed:', details);
});

// AFTER: Observer pattern
const observer = {
  update(event) {
    if (event.changeType === 'logradouro') {
      console.log('Street changed:', event.details);
    }
  }
};
cache.subscribe(observer);

// OR: Functional observer helper
cache.subscribeToChangeType('logradouro', (details) => {
  console.log('Street changed:', details);
});
```

**Helper method for functional style**:
```javascript
/**
 * Convenience method for functional observers.
 * 
 * @param {string|string[]} changeTypes - Types to listen for
 * @param {Function} callback - Called with (details, changeType, event)
 * @returns {Function} Unsubscribe function
 * 
 * @example
 * const unsubscribe = cache.subscribeToChangeType('logradouro', (details) => {
 *   console.log('Street:', details);
 * });
 * 
 * // Later:
 * unsubscribe();
 */
subscribeToChangeType(changeTypes, callback) {
  const types = Array.isArray(changeTypes) ? changeTypes : [changeTypes];
  const wildcard = types.includes('*');
  
  const observer = {
    update(event) {
      if (event.type === 'address-change') {
        const matches = wildcard || types.includes(event.changeType);
        if (matches) {
          try {
            callback(event.details, event.changeType, event);
          } catch (error) {
            console.error('Observer callback error:', error);
          }
        }
      }
    }
  };
  
  this.subscribe(observer);
  
  // Return unsubscribe function
  return () => this.unsubscribe(observer);
}
```

## Comparison Matrix

| Feature | Current (3 Callbacks) | Solution 1 (Unified) | Solution 2 (Registry) | Solution 3 (Observer) |
|---------|---------------------|---------------------|---------------------|---------------------|
| **Methods** | 9 + 6 deprecated | 3 | 2 | 2 + 1 helper |
| **Extensibility** | ❌ Poor | ✅ Good | ✅ Excellent | ✅ Excellent |
| **Multiple handlers** | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| **Type filtering** | ⚠️ Manual | ⚠️ Manual | ✅ Built-in | ✅ Built-in (helper) |
| **Unsubscribe** | ⚠️ Manual | ⚠️ Manual | ✅ Yes | ✅ Yes |
| **Error handling** | ❌ None | ✅ Try-catch | ✅ Try-catch | ✅ Try-catch |
| **Consistency** | ❌ Callbacks | ⚠️ Callbacks | ⚠️ Callbacks | ✅ Observer (existing) |
| **Code duplication** | ❌ High | ✅ Low | ✅ Low | ✅ Minimal |
| **Learning curve** | ✅ Simple | ✅ Simple | ⚠️ Medium | ⚠️ Medium |

## Recommended Approach

### **Solution 3: Migrate to Observer Pattern** (RECOMMENDED)

**Rationale**:
1. Observer pattern already exists (ObserverSubject)
2. Eliminates duplicate notification systems
3. More flexible than callbacks
4. Standard design pattern
5. Reduces API surface
6. Future-proof architecture

**Migration Strategy**:

#### Phase 1: Add Helper Methods (Week 1)
```javascript
// Add subscribeToChangeType helper
// Maintain backward compatibility
// No breaking changes
```

#### Phase 2: Deprecate Callbacks (Week 2)
```javascript
/**
 * @deprecated Use subscribeToChangeType('logradouro', callback) instead
 */
setLogradouroChangeCallback(callback) {
  console.warn('setLogradouroChangeCallback is deprecated');
  this._legacyCallbackAdapter('logradouro', callback);
}

_legacyCallbackAdapter(changeType, callback) {
  // Convert callback to observer
  this.subscribeToChangeType(changeType, callback);
}
```

#### Phase 3: Remove Callbacks (v1.0.0)
```javascript
// Remove all callback methods
// Remove all callback properties
// Observer pattern only
```

## Implementation Plan

### Week 1: Add Observer Helpers
- Add `subscribeToChangeType()` helper method
- Add tests for new method
- Document observer pattern usage
- No breaking changes

### Week 2: Deprecate Callbacks
- Add deprecation warnings to callback methods
- Create adapter for legacy callbacks
- Update documentation with migration guide
- Announce removal in v1.0.0

### Week 3: Update Internal Code
- Migrate internal callback usage to observers
- Update tests
- Verify all functionality works

### v1.0.0: Remove Callbacks
- Delete all callback methods and properties
- Remove deprecated code
- Clean observer-only API

## Expected Benefits

### Code Reduction
```
Current:
  - 3 callback properties
  - 9 callback methods
  - 6 deprecated wrappers
  Total: 15 methods, ~300 lines

After:
  - 0 callback properties
  - 2 observer methods (subscribe, unsubscribe)
  - 1 helper method (subscribeToChangeType)
  Total: 3 methods, ~50 lines

Reduction: 12 methods, ~250 lines (83% reduction)
```

### API Simplicity
```
Before:
  setLogradouroChangeCallback()
  getLogradouroChangeCallback()
  setBairroChangeCallback()
  getBairroChangeCallback()
  setMunicipioChangeCallback()
  getMunicipioChangeCallback()
  subscribe()
  unsubscribe()

After:
  subscribe()
  unsubscribe()
  subscribeToChangeType()  // convenience
```

### Extensibility
```javascript
// Adding new change type:

// BEFORE: Requires code changes
// - Add new callback property
// - Add new setter method
// - Add new getter method
// - Add new notification code
// Result: 50+ lines, 3+ methods

// AFTER: Zero code changes needed
cache.subscribeToChangeType('new-type', callback);
// Just works! No code changes required
```

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Breaking existing code | MEDIUM | Phased deprecation, adapter layer |
| Learning curve | LOW | Helper method provides familiar API |
| Missed use cases | LOW | Observer pattern more flexible than callbacks |
| Performance | VERY LOW | Observer pattern is lightweight |

## Conclusion

The current 3-callback pattern is an emerging callback hell that will worsen as more change types are added. With Observer pattern already implemented, migrating callbacks to observers is the clear choice. This consolidates two notification systems into one, reduces code by 83%, and provides superior flexibility.

**Recommendation**: Begin Week 1 (add observer helpers) immediately. This is low-risk and sets foundation for callback deprecation.

## References

- [Observer Pattern](https://refactoring.guru/design-patterns/observer)
- [Callback Hell](http://callbackhell.com/)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [From Callbacks to Promises to Async/Await](https://tylermcginnis.com/async-javascript-from-callbacks-to-promises-to-async-await/)
