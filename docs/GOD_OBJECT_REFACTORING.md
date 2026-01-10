# God Object Anti-Pattern Refactoring Plan

## Executive Summary

**AddressCache.js** (1,146 lines) exhibits the God Object anti-pattern by handling **4+ distinct responsibilities** in a single class. This violates the Single Responsibility Principle (SRP) and creates a maintenance nightmare with excessive coupling, difficult testing, and poor code organization.

**Status**: Analysis Complete | Refactoring Planned  
**Severity**: CRITICAL (Architectural Issue)  
**Recommendation**: Extract responsibilities into focused, cohesive classes

## Current State Analysis

### File Metrics

```
AddressCache.js:
  Total lines: 1,146 lines
  Total methods: 209 methods (estimated)
  Static methods: 54 methods
  Deprecated wrappers: 53 methods (83% of static methods)
  Dependencies: 3 imports (ObserverSubject, AddressExtractor, BrazilianStandardAddress)
```

### Responsibility Analysis

The AddressCache class currently handles **4 distinct responsibilities**:

| Responsibility | Lines | Methods | Complexity |
|----------------|-------|---------|------------|
| 1. Caching (LRU, expiration) | ~200 | ~15 | Medium |
| 2. Change Detection | ~300 | ~30 | High |
| 3. Observer Pattern | ~150 | ~10 | Medium |
| 4. Address Processing | ~100 | ~8 | Low |
| Deprecated Wrappers | ~400 | 53 | Low (boilerplate) |
| **TOTAL** | **1,146** | **~116** | **Very High** |

### Responsibility Breakdown

#### 1. **Caching Responsibility** (~200 lines)

**What it does**:
- Stores address data in Map
- Implements LRU (Least Recently Used) eviction
- Time-based cache expiration (5 minutes)
- Cache key generation

**Methods**:
```javascript
- generateCacheKey(data)
- evictLeastRecentlyUsedIfNeeded()
- cleanExpiredEntries()
- clearCache()
- cache.set() / cache.get() operations
```

**State**:
```javascript
- cache: Map<string, CacheEntry>
- maxCacheSize: 50
- cacheExpirationMs: 300000
```

#### 2. **Change Detection Responsibility** (~300 lines)

**What it does**:
- Detects changes in logradouro (street)
- Detects changes in bairro (neighborhood)
- Detects changes in municipio (city/municipality)
- Maintains change signatures for deduplication
- Provides change details with before/after comparison

**Methods**:
```javascript
// Logradouro (street) change detection
- hasLogradouroChanged()
- getLogradouroChangeDetails()
- setLogradouroChangeCallback(callback)
- getLogradouroChangeCallback()

// Bairro (neighborhood) change detection
- hasBairroChanged()
- getBairroChangeDetails()
- setBairroChangeCallback(callback)
- getBairroChangeCallback()

// Municipio (city) change detection
- hasMunicipioChanged()
- getMunicipioChangeDetails()
- setMunicipioChangeCallback(callback)
- getMunicipioChangeCallback()

// Internal helpers
- _computeBairroCompleto(rawData)
- _generateChangeSignature(...)
```

**State**:
```javascript
- lastNotifiedChangeSignature: string|null
- lastNotifiedBairroChangeSignature: string|null
- lastNotifiedMunicipioChangeSignature: string|null
- logradouroChangeCallback: Function|null
- bairroChangeCallback: Function|null
- municipioChangeCallback: Function|null
- currentAddress: BrazilianStandardAddress|null
- previousAddress: BrazilianStandardAddress|null
- currentRawData: Object|null
- previousRawData: Object|null
```

#### 3. **Observer Pattern Responsibility** (~150 lines)

**What it does**:
- Manages observer subscriptions
- Notifies observers of address changes
- Delegates to ObserverSubject

**Methods**:
```javascript
- subscribe(observer)
- unsubscribe(observer)
- notifyObservers(event)
```

**State**:
```javascript
- observerSubject: ObserverSubject
```

**Note**: This is already partially delegated to ObserverSubject, but the delegation is awkward.

#### 4. **Address Processing Responsibility** (~100 lines)

**What it does**:
- Extracts address from raw geocoding data
- Creates BrazilianStandardAddress objects
- Coordinates with AddressExtractor

**Methods**:
```javascript
- getBrazilianStandardAddress(data)
- Uses AddressExtractor internally
```

**State**:
```javascript
- currentAddress: BrazilianStandardAddress|null
- previousAddress: BrazilianStandardAddress|null
```

## Problems with God Object Pattern

### 1. Single Responsibility Principle Violation (Critical)

**Problem**: One class doing too many things.

```javascript
// AddressCache currently does EVERYTHING:
class AddressCache {
  // Caching
  generateCacheKey() { }
  evictLeastRecentlyUsed() { }
  
  // Change detection
  hasLogradouroChanged() { }
  hasBairroChanged() { }
  hasMunicipioChanged() { }
  
  // Observer pattern
  subscribe() { }
  notify() { }
  
  // Address processing
  getBrazilianStandardAddress() { }
  
  // ... 100+ more methods
}
```

**Impact**:
- Hard to understand class purpose
- Difficult to modify without breaking something
- Changes for one responsibility affect others
- Violates Open/Closed Principle

### 2. Excessive Coupling (High Impact)

**Problem**: Changes to one part affect unrelated parts.

```javascript
// Want to change cache eviction strategy?
// You must touch change detection code in the same class

// Want to improve change detection?
// You risk breaking caching logic

// Everything is tangled together
```

**Impact**:
- Risky changes (ripple effects)
- Hard to test in isolation
- Difficult to reuse components
- Can't swap implementations

### 3. Testing Complexity (High Impact)

**Problem**: Must test all responsibilities together.

```javascript
// To test cache eviction, you need:
describe('AddressCache', () => {
  it('evicts LRU entries', () => {
    const cache = AddressCache.getInstance();
    
    // Must set up:
    // - Observer subscriptions
    // - Change detection state
    // - Address processing
    // - Cache entries
    
    // Just to test cache eviction!
  });
});
```

**Impact**:
- Complex test setup
- Slow tests (full object initialization)
- Hard to mock dependencies
- Many test failures for unrelated changes

### 4. Poor Cohesion (Medium Impact)

**Problem**: Methods don't belong together logically.

```javascript
// These have nothing to do with each other:
cache.evictLeastRecentlyUsed();  // Caching concern
cache.hasLogradouroChanged();     // Change detection
cache.subscribe(observer);         // Observer pattern
cache.getBrazilianStandardAddress(); // Address processing
```

**Impact**:
- Confusing API
- Hard to navigate code
- Difficult for new developers
- Poor code organization

### 5. Maintenance Nightmare (High Impact)

**Problem**: 1,146 lines in one file.

```javascript
// Developer experience:
// 1. Open AddressCache.js
// 2. Scroll through 1,146 lines
// 3. Find the method you need (good luck)
// 4. Understand context (read 500 more lines)
// 5. Make change (hope nothing breaks)
// 6. Test (run 100+ tests)
```

**Metrics**:
- Lines: 1,146 (way too big)
- Methods: ~116 (cognitive overload)
- Responsibilities: 4+ (should be 1)
- Cyclomatic complexity: Very High

## Proposed Refactoring Strategy

### Target Architecture

Extract into **4 focused classes** with clear responsibilities:

```
BEFORE: God Object
┌────────────────────────────────────────┐
│         AddressCache (1,146 lines)     │
│  ┌──────────────────────────────────┐  │
│  │ Caching                          │  │
│  │ Change Detection                 │  │
│  │ Observer Pattern                 │  │
│  │ Address Processing               │  │
│  │ Deprecated Wrappers (53 methods) │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘

AFTER: Separated Concerns
┌─────────────────────┐  ┌──────────────────────────┐
│  AddressCache       │  │ AddressChangeDetector    │
│  (~200 lines)       │  │ (~300 lines)             │
│  ┌───────────────┐  │  │ ┌──────────────────────┐ │
│  │ • Caching     │  │  │ │ • Change detection   │ │
│  │ • LRU evict   │  │  │ │ • 3 address levels   │ │
│  │ • Expiration  │  │  │ │ • Change signatures  │ │
│  └───────────────┘  │  │ └──────────────────────┘ │
└─────────────────────┘  └──────────────────────────┘

┌─────────────────────┐  ┌──────────────────────────┐
│ AddressObservable   │  │ AddressProcessor         │
│ (~150 lines)        │  │ (~100 lines)             │
│  ┌───────────────┐  │  │ ┌──────────────────────┐ │
│  │ • Subscribe   │  │  │ │ • Extract address    │ │
│  │ • Unsubscribe │  │  │ │ • Process raw data   │ │
│  │ • Notify      │  │  │ │ • Create objects     │ │
│  └───────────────┘  │  │ └──────────────────────┘ │
└─────────────────────┘  └──────────────────────────┘
```

### Class Responsibility Matrix

| New Class | Responsibility | Lines | Methods | Dependencies |
|-----------|---------------|-------|---------|--------------|
| **AddressCache** | Cache management only | ~200 | ~15 | None |
| **AddressChangeDetector** | Change detection | ~300 | ~25 | AddressCache |
| **AddressObservable** | Observer pattern | ~150 | ~10 | None |
| **AddressProcessor** | Address extraction | ~100 | ~8 | AddressExtractor |
| **TOTAL** | **4 focused classes** | **~750** | **~58** | **Minimal** |

**Note**: Deprecated wrappers (~400 lines) will be removed per Deprecation Cleanup Plan

### Phase 1: Extract AddressCache (Pure Caching)

**Goal**: Create a focused cache class with only caching responsibility.

**New AddressCache.js** (~200 lines):
```javascript
/**
 * Pure cache implementation with LRU eviction and expiration.
 * 
 * ONLY handles caching - no change detection, no observers, no processing.
 */
class AddressCache {
  constructor(config = {}) {
    this.cache = new Map();
    this.maxCacheSize = config.maxCacheSize || 50;
    this.cacheExpirationMs = config.cacheExpirationMs || 300000;
  }
  
  /**
   * Gets value from cache if exists and not expired.
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check expiration
    if (Date.now() - entry.timestamp > this.cacheExpirationMs) {
      this.cache.delete(key);
      return null;
    }
    
    // Update access time for LRU
    entry.lastAccessed = Date.now();
    return entry.value;
  }
  
  /**
   * Sets value in cache with automatic LRU eviction.
   */
  set(key, value) {
    this.evictLeastRecentlyUsedIfNeeded();
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      lastAccessed: Date.now()
    });
  }
  
  /**
   * Generates cache key from address data.
   */
  generateCacheKey(data) {
    // Key generation logic (unchanged)
  }
  
  /**
   * Evicts LRU entries when max size reached.
   */
  evictLeastRecentlyUsedIfNeeded() {
    if (this.cache.size >= this.maxCacheSize) {
      // LRU eviction logic (unchanged)
    }
  }
  
  /**
   * Removes expired entries.
   */
  cleanExpiredEntries() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.cacheExpirationMs) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Clears all cache entries.
   */
  clearCache() {
    this.cache.clear();
  }
  
  /**
   * Gets cache size.
   */
  size() {
    return this.cache.size;
  }
}

export default AddressCache;
```

**Benefits**:
- ✅ Single responsibility (caching only)
- ✅ Easy to test in isolation
- ✅ Can swap cache implementations
- ✅ Reusable in other contexts
- ✅ Clear, focused API

### Phase 2: Extract AddressChangeDetector

**Goal**: Separate change detection into its own class.

**New AddressChangeDetector.js** (~300 lines):
```javascript
/**
 * Detects changes in Brazilian address components.
 * 
 * Tracks changes across three levels:
 * - Logradouro (street level)
 * - Bairro (neighborhood level)
 * - Municipio (municipality level)
 */
class AddressChangeDetector {
  constructor() {
    this.currentAddress = null;
    this.previousAddress = null;
    this.currentRawData = null;
    this.previousRawData = null;
    
    // Change tracking
    this.lastLogradouroSignature = null;
    this.lastBairroSignature = null;
    this.lastMunicipioSignature = null;
    
    // Callbacks
    this.logradouroChangeCallback = null;
    this.bairroChangeCallback = null;
    this.municipioChangeCallback = null;
  }
  
  /**
   * Updates current address and detects changes.
   */
  updateAddress(standardAddress, rawData) {
    this.previousAddress = this.currentAddress;
    this.previousRawData = this.currentRawData;
    this.currentAddress = standardAddress;
    this.currentRawData = rawData;
  }
  
  /**
   * Checks if logradouro (street) has changed.
   */
  hasLogradouroChanged() {
    if (!this.currentAddress || !this.previousAddress) {
      return false;
    }
    
    const currentSignature = this._generateLogradouroSignature(this.currentAddress);
    const previousSignature = this._generateLogradouroSignature(this.previousAddress);
    
    return currentSignature !== previousSignature;
  }
  
  /**
   * Gets logradouro change details.
   */
  getLogradouroChangeDetails() {
    return {
      previous: this.previousAddress?.logradouro,
      current: this.currentAddress?.logradouro,
      changed: this.hasLogradouroChanged()
    };
  }
  
  // Similar methods for bairro and municipio...
  
  /**
   * Sets callback for logradouro changes.
   */
  setLogradouroChangeCallback(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }
    this.logradouroChangeCallback = callback;
  }
  
  /**
   * Notifies callbacks if changes detected.
   */
  notifyChanges() {
    if (this.hasLogradouroChanged() && this.logradouroChangeCallback) {
      this.logradouroChangeCallback(this.getLogradouroChangeDetails());
    }
    // Similar for bairro and municipio...
  }
  
  // Private helper methods
  _generateLogradouroSignature(address) {
    // Signature generation logic
  }
  
  _generateBairroSignature(address) {
    // Signature generation logic
  }
  
  _generateMunicipioSignature(address) {
    // Signature generation logic
  }
}

export default AddressChangeDetector;
```

**Benefits**:
- ✅ Focused on change detection only
- ✅ Clear 3-level change hierarchy
- ✅ Easy to test change logic
- ✅ Can extend with more change types
- ✅ Callback pattern for notifications

### Phase 3: Extract AddressObservable

**Goal**: Clean observer pattern implementation.

**New AddressObservable.js** (~150 lines):
```javascript
import ObserverSubject from '../core/ObserverSubject.js';

/**
 * Observable wrapper for address changes.
 * 
 * Provides observer pattern for address update notifications.
 */
class AddressObservable {
  constructor() {
    this.observerSubject = new ObserverSubject();
  }
  
  /**
   * Subscribes observer to address changes.
   */
  subscribe(observer) {
    if (!observer || typeof observer.update !== 'function') {
      throw new TypeError('Observer must have update() method');
    }
    this.observerSubject.subscribe(observer);
  }
  
  /**
   * Unsubscribes observer from address changes.
   */
  unsubscribe(observer) {
    this.observerSubject.unsubscribe(observer);
  }
  
  /**
   * Notifies all observers with address change event.
   */
  notify(addressData, changeType) {
    this.observerSubject.notify({
      type: 'address-change',
      changeType,
      data: addressData,
      timestamp: Date.now()
    });
  }
  
  /**
   * Gets count of subscribed observers.
   */
  getObserverCount() {
    return this.observerSubject.observers.length;
  }
}

export default AddressObservable;
```

**Benefits**:
- ✅ Clean observer interface
- ✅ Delegates to ObserverSubject properly
- ✅ Easy to test notifications
- ✅ Can add filtering/middleware
- ✅ Type-safe observer contract

### Phase 4: Extract AddressProcessor

**Goal**: Coordinate address extraction and processing.

**New AddressProcessor.js** (~100 lines):
```javascript
import AddressExtractor from './AddressExtractor.js';
import BrazilianStandardAddress from './BrazilianStandardAddress.js';

/**
 * Processes raw geocoding data into standardized addresses.
 */
class AddressProcessor {
  constructor() {
    this.extractor = new AddressExtractor();
  }
  
  /**
   * Extracts and creates Brazilian standard address from raw data.
   */
  process(rawData) {
    if (!rawData || !rawData.address) {
      return null;
    }
    
    // Extract address components
    const extracted = this.extractor.extract(rawData);
    
    // Create standardized address
    const standardAddress = new BrazilianStandardAddress();
    standardAddress.logradouro = extracted.logradouro;
    standardAddress.numero = extracted.numero;
    standardAddress.bairro = extracted.bairro;
    standardAddress.cidade = extracted.cidade;
    standardAddress.estado = extracted.estado;
    standardAddress.cep = extracted.cep;
    
    return standardAddress;
  }
  
  /**
   * Validates address data.
   */
  validate(address) {
    // Validation logic
  }
}

export default AddressProcessor;
```

**Benefits**:
- ✅ Single purpose (address processing)
- ✅ Easy to add validation
- ✅ Can swap extractors
- ✅ Clear transformation pipeline
- ✅ Testable in isolation

### Phase 5: Create Facade/Coordinator

**Goal**: Provide unified interface without God Object.

**New AddressCacheCoordinator.js** (~150 lines):
```javascript
import AddressCache from './AddressCache.js';
import AddressChangeDetector from './AddressChangeDetector.js';
import AddressObservable from './AddressObservable.js';
import AddressProcessor from './AddressProcessor.js';

/**
 * Coordinates address caching, change detection, and notifications.
 * 
 * Facade pattern that delegates to focused components.
 */
class AddressCacheCoordinator {
  constructor(config = {}) {
    this.cache = new AddressCache(config.cache);
    this.changeDetector = new AddressChangeDetector();
    this.observable = new AddressObservable();
    this.processor = new AddressProcessor();
  }
  
  /**
   * Gets or computes address from raw data.
   */
  getOrCompute(rawData) {
    // Generate cache key
    const key = this.cache.generateCacheKey(rawData);
    
    // Try cache first
    let address = this.cache.get(key);
    if (address) {
      return address;
    }
    
    // Process address
    address = this.processor.process(rawData);
    
    // Cache result
    this.cache.set(key, address);
    
    // Detect changes
    this.changeDetector.updateAddress(address, rawData);
    if (this.changeDetector.hasLogradouroChanged()) {
      const details = this.changeDetector.getLogradouroChangeDetails();
      this.observable.notify(details, 'logradouro');
    }
    
    return address;
  }
  
  /**
   * Subscribes to address changes.
   */
  subscribe(observer) {
    this.observable.subscribe(observer);
  }
  
  /**
   * Sets change callback.
   */
  setLogradouroChangeCallback(callback) {
    this.changeDetector.setLogradouroChangeCallback(callback);
  }
  
  // Delegate other operations to components...
}

export default AddressCacheCoordinator;
```

**Benefits**:
- ✅ Clean facade interface
- ✅ Delegates to focused components
- ✅ Easy to test coordination
- ✅ Can swap implementations
- ✅ Maintains backward compatibility

## Migration Strategy

### Phase 1: Create New Classes (No Breaking Changes)

**Week 1**:
- Create AddressCache.js (pure caching)
- Create AddressChangeDetector.js
- Create AddressObservable.js
- Create AddressProcessor.js
- Add comprehensive unit tests
- **No changes to existing code**

### Phase 2: Create Coordinator (Backward Compatible)

**Week 2**:
- Create AddressCacheCoordinator.js
- Implement same API as old AddressCache
- Add integration tests
- Verify behavior matches old implementation
- **Still no breaking changes**

### Phase 3: Gradual Migration (Internal First)

**Week 3-4**:
- Update AddressDataExtractor to use coordinator
- Update WebGeocodingManager
- Update tests
- Validate all functionality works
- **Internal changes only**

### Phase 4: Deprecate Old Class

**Week 5**:
- Mark old AddressCache as deprecated
- Add runtime warnings
- Update documentation
- Announce removal in v1.0.0

### Phase 5: Remove Old Class (v1.0.0)

**v1.0.0 Release**:
- Remove old AddressCache.js
- Rename AddressCacheCoordinator to AddressCache (or keep separate)
- Update all imports
- Major version bump

## Expected Benefits

### Code Organization

**Before**:
```
1 file: AddressCache.js (1,146 lines)
  - Everything in one place
  - Hard to navigate
  - Difficult to understand
```

**After**:
```
5 files: ~750 lines total (removing 400 deprecated lines)
  - AddressCache.js (~200 lines) - Pure caching
  - AddressChangeDetector.js (~300 lines) - Change logic
  - AddressObservable.js (~150 lines) - Observer pattern
  - AddressProcessor.js (~100 lines) - Processing
  - AddressCacheCoordinator.js (~150 lines) - Coordination
```

### Testability

**Before**:
```javascript
// Must test everything together
describe('AddressCache', () => {
  it('does everything', () => {
    // 100+ lines of setup
    // Test one feature
    // Hope nothing else breaks
  });
});
```

**After**:
```javascript
// Test each responsibility separately
describe('AddressCache', () => {
  it('caches values', () => {
    const cache = new AddressCache();
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });
});

describe('AddressChangeDetector', () => {
  it('detects logradouro changes', () => {
    const detector = new AddressChangeDetector();
    detector.updateAddress(address1, data1);
    detector.updateAddress(address2, data2);
    expect(detector.hasLogradouroChanged()).toBe(true);
  });
});
```

### Reusability

**Before**:
```javascript
// Can't reuse cache without change detection
// Can't reuse change detection without cache
// Everything is coupled
```

**After**:
```javascript
// Reuse cache anywhere
const cache = new AddressCache({ maxSize: 100 });

// Reuse change detector for other data
const detector = new AddressChangeDetector();

// Reuse observable for other events
const observable = new AddressObservable();
```

### Maintainability

**Before**:
```
- 1 file with 1,146 lines
- 4 responsibilities mixed together
- High cognitive load
- Risky changes
```

**After**:
```
- 5 files with clear purposes
- Each class has 1 responsibility
- Low cognitive load
- Safe, isolated changes
```

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Breaking existing code | **MEDIUM** | Phased migration with backward compatibility |
| Introducing bugs | **MEDIUM** | Comprehensive test suite for each class |
| Performance regression | **LOW** | Benchmark before/after |
| API confusion | **LOW** | Clear migration guide and deprecation warnings |

## Timeline

| Phase | Duration | Risk | Status |
|-------|----------|------|--------|
| Phase 1: Create new classes | Week 1 | LOW | ⚠️ Planned |
| Phase 2: Create coordinator | Week 2 | LOW | ⚠️ Planned |
| Phase 3: Gradual migration | Week 3-4 | MEDIUM | ⚠️ Planned |
| Phase 4: Deprecate old class | Week 5 | LOW | ⚠️ Planned |
| Phase 5: Remove old class | v1.0.0 | MEDIUM | ⚠️ Planned |

**Total Timeline**: 5 weeks + v1.0.0 release

## Success Metrics

### Code Quality
- ✅ Single Responsibility Principle followed
- ✅ Each class < 300 lines
- ✅ Clear, focused APIs
- ✅ High cohesion, low coupling

### Testing
- ✅ Each class has isolated tests
- ✅ Test coverage maintained or improved
- ✅ Faster test execution
- ✅ Easier to mock dependencies

### Maintainability
- ✅ Easier to understand code
- ✅ Safer to make changes
- ✅ Better code navigation
- ✅ Clearer documentation

### Performance
- ✅ No performance regression
- ✅ Memory usage similar or better
- ✅ Cache performance maintained

## Conclusion

The AddressCache class is a textbook example of the God Object anti-pattern. By extracting its 4 distinct responsibilities into focused, cohesive classes, we can dramatically improve code quality, testability, and maintainability. The proposed 5-week phased migration ensures backward compatibility while setting the foundation for a clean v1.0.0 release.

**Recommendation**: Begin Phase 1 (creating new classes) in next sprint. This is high-priority architectural refactoring that will pay dividends in long-term maintainability.

## References

- [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle)
- [God Object Anti-Pattern](https://en.wikipedia.org/wiki/God_object)
- [Facade Pattern](https://refactoring.guru/design-patterns/facade)
- [Extract Class Refactoring](https://refactoring.guru/extract-class)
