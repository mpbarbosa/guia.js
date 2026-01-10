# Singleton Pattern Refactoring Plan

## Executive Summary

The Guia Turístico codebase currently uses the Singleton pattern in 2 classes with 101 total `.getInstance()` calls across the application. While singletons provide convenient global access, they create hidden dependencies, make testing difficult, and introduce tight coupling between components.

**Status**: Analysis Complete | Refactoring Planned  
**Severity**: Medium  
**Recommendation**: Gradual migration to Dependency Injection

## Current State Analysis

### Singleton Classes Identified

| Class | File | Internal Uses | External Uses | Total Calls |
|-------|------|---------------|---------------|-------------|
| AddressCache | `src/data/AddressCache.js` | 56 | 22 | 78 |
| SingletonStatusManager | `src/status/SingletonStatusManager.js` | 11 | 0 | 11 |
| PositionManager* | `src/core/PositionManager.js` | - | 6 | 6 |

*Note: PositionManager has singleton infrastructure but is primarily accessed differently

### Usage Distribution

```
Files using .getInstance():
  • AddressCache.js (56 calls) - Heavy internal usage
  • AddressDataExtractor.js (22 calls) - Primary external consumer
  • SingletonStatusManager.js (11 calls) - Self-referential
  • PositionManager.js (6 calls) - Moderate usage
  • WebGeocodingManager.js (4 calls) - Coordination layer
  • Chronometer.js (1 call) - Minimal usage
  • GeolocationService.js (1 call) - Minimal usage
```

## Problems with Current Singleton Usage

### 1. Hidden Dependencies (High Impact)

**Problem**: Classes don't declare their dependencies explicitly.

```javascript
// ❌ BAD - Hidden dependency on AddressCache singleton
class AddressDataExtractor {
  extractAddress(rawData) {
    const cache = AddressCache.getInstance(); // Hidden global state
    return cache.getOrCompute(rawData);
  }
}
```

**Impact**:
- Hard to understand class dependencies
- Difficult to track data flow
- Impossible to substitute implementations

### 2. Testing Challenges (High Impact)

**Problem**: Singleton state persists across tests, causing flaky tests.

```javascript
// ❌ BAD - Tests interfere with each other
describe('AddressDataExtractor', () => {
  it('test 1', () => {
    const cache = AddressCache.getInstance();
    cache.set('key1', 'value1');
    // Test modifies shared global state
  });
  
  it('test 2', () => {
    const cache = AddressCache.getInstance();
    // This test sees polluted state from test 1!
    expect(cache.get('key1')).toBeUndefined(); // FAILS
  });
});
```

**Impact**:
- Test isolation violations
- Unpredictable test results
- Complex test setup/teardown
- Slow test execution

### 3. Tight Coupling (Medium Impact)

**Problem**: Components are tightly coupled to concrete implementations.

```javascript
// ❌ BAD - Tightly coupled to AddressCache
class WebGeocodingManager {
  processAddress() {
    const cache = AddressCache.getInstance(); // Cannot substitute
    // Cannot inject MockCache for testing
    // Cannot use different cache strategies
  }
}
```

**Impact**:
- Cannot swap implementations
- Hard to test in isolation
- Difficult to extend functionality
- Violates Open/Closed Principle

### 4. Global State Management (Medium Impact)

**Problem**: Mutable global state is shared everywhere.

```javascript
// ❌ BAD - Multiple parts of code modify shared state
// File A:
AddressCache.getInstance().set('key', 'valueA');

// File B (later):
AddressCache.getInstance().set('key', 'valueB'); // Overwrites!

// File C:
const value = AddressCache.getInstance().get('key'); // Which value?
```

**Impact**:
- Race conditions in async code
- Difficult to reason about state changes
- Hard to debug state-related issues
- Unexpected side effects

## Proposed Refactoring Strategy

### Phase 1: Infrastructure Setup (Low Risk)

**Goal**: Prepare dependency injection infrastructure without breaking changes.

**Actions**:
1. ✅ Create factory/container pattern for instance management
2. ✅ Add optional constructor injection to singleton classes
3. ✅ Maintain backward compatibility with `.getInstance()`
4. ✅ Update tests to use constructor injection

**Example**:
```javascript
// NEW - Supports both patterns
class AddressCache {
  static instance = null;
  
  // Keep singleton pattern (backward compatible)
  static getInstance() {
    if (!AddressCache.instance) {
      AddressCache.instance = new AddressCache();
    }
    return AddressCache.instance;
  }
  
  // NEW - Allow constructor injection
  constructor(config = {}) {
    this.maxCacheSize = config.maxCacheSize || 50;
    this.cacheExpirationMs = config.cacheExpirationMs || 300000;
    // ... rest of initialization
  }
}

// Usage - both work:
const cache1 = AddressCache.getInstance(); // OLD way
const cache2 = new AddressCache({ maxCacheSize: 100 }); // NEW way
```

### Phase 2: Incremental Migration (Medium Risk)

**Goal**: Gradually convert consumers to dependency injection.

**Priority Order** (by coupling severity):
1. **AddressDataExtractor** (22 calls) - High impact
2. **PositionManager** (6 calls) - Core component
3. **WebGeocodingManager** (4 calls) - Coordination layer
4. **Others** (2 calls) - Low impact

**Example Migration**:
```javascript
// BEFORE - Singleton dependency
class AddressDataExtractor {
  extractAddress(rawData) {
    const cache = AddressCache.getInstance();
    return cache.getOrCompute(rawData);
  }
}

// AFTER - Constructor injection
class AddressDataExtractor {
  constructor(addressCache = null) {
    // Default to singleton for backward compatibility
    this.addressCache = addressCache || AddressCache.getInstance();
  }
  
  extractAddress(rawData) {
    return this.addressCache.getOrCompute(rawData);
  }
}

// New usage with injection:
const cache = new AddressCache();
const extractor = new AddressDataExtractor(cache);
```

### Phase 3: Container Pattern (Higher Risk)

**Goal**: Centralized dependency management.

**Actions**:
1. Create dependency injection container
2. Register all services in container
3. Update application initialization to use container
4. Deprecate `.getInstance()` methods

**Example Container**:
```javascript
class ServiceContainer {
  constructor() {
    this.services = new Map();
  }
  
  register(name, factory) {
    this.services.set(name, { factory, instance: null });
  }
  
  get(name) {
    const service = this.services.get(name);
    if (!service.instance) {
      service.instance = service.factory(this);
    }
    return service.instance;
  }
}

// Application initialization
const container = new ServiceContainer();

container.register('addressCache', () => new AddressCache());
container.register('positionManager', (c) => 
  new PositionManager(c.get('addressCache'))
);
container.register('webGeocodingManager', (c) => 
  new WebGeocodingManager(
    document,
    c.get('positionManager'),
    c.get('addressCache')
  )
);

// Usage
const manager = container.get('webGeocodingManager');
```

### Phase 4: Complete Removal (Highest Risk)

**Goal**: Remove singleton pattern entirely.

**Actions**:
1. Remove all `.getInstance()` methods
2. Convert all remaining singleton calls to injection
3. Update all documentation
4. Final testing and validation

## Refactoring Benefits

### Testability (High Value)

```javascript
// ✅ GOOD - Easy to test with mock
describe('AddressDataExtractor', () => {
  it('extracts address with cache', () => {
    const mockCache = {
      getOrCompute: jest.fn().mockReturnValue('mocked address')
    };
    const extractor = new AddressDataExtractor(mockCache);
    
    const result = extractor.extractAddress(rawData);
    
    expect(mockCache.getOrCompute).toHaveBeenCalledWith(rawData);
    expect(result).toBe('mocked address');
  });
});
```

### Flexibility (Medium Value)

```javascript
// ✅ GOOD - Can use different cache strategies
const memoryCache = new MemoryCacheAdapter();
const redisCache = new RedisCacheAdapter();

// Use memory cache in development
const devExtractor = new AddressDataExtractor(memoryCache);

// Use Redis cache in production
const prodExtractor = new AddressDataExtractor(redisCache);
```

### Clear Dependencies (High Value)

```javascript
// ✅ GOOD - Dependencies are explicit
class WebGeocodingManager {
  constructor(document, positionManager, addressCache, geocoder) {
    // All dependencies declared in constructor
    this.document = document;
    this.positionManager = positionManager;
    this.addressCache = addressCache;
    this.geocoder = geocoder;
  }
}

// Clear understanding of what this class needs
```

## Implementation Timeline

### Immediate (Week 1)
- ✅ Document current singleton usage
- ✅ Create refactoring plan
- ✅ Write test cases for singleton behavior

### Short-term (Weeks 2-3)
- ⚠️ Add constructor injection support to AddressCache
- ⚠️ Add constructor injection support to SingletonStatusManager
- ⚠️ Update tests to use constructor injection

### Medium-term (Weeks 4-6)
- 📋 Migrate AddressDataExtractor to dependency injection
- 📋 Migrate PositionManager consumers
- 📋 Migrate WebGeocodingManager
- 📋 Update documentation

### Long-term (Weeks 7-8)
- 📋 Create ServiceContainer implementation
- 📋 Update application initialization
- 📋 Deprecate .getInstance() methods
- 📋 Final testing and validation

## Testing Strategy

### Before Refactoring
- Document existing behavior with integration tests
- Capture current API contracts
- Benchmark performance baseline

### During Refactoring
- Maintain backward compatibility tests
- Add new constructor injection tests
- Test both old and new patterns

### After Refactoring
- Validate all tests pass with new pattern
- Confirm performance characteristics maintained
- Remove deprecated singleton tests

## Backward Compatibility Strategy

To avoid breaking changes, we'll maintain both patterns during transition:

```javascript
class AddressCache {
  // Keep singleton (deprecated but functional)
  static getInstance() {
    console.warn('AddressCache.getInstance() is deprecated. Use constructor injection.');
    if (!AddressCache.instance) {
      AddressCache.instance = new AddressCache();
    }
    return AddressCache.instance;
  }
  
  // Prefer constructor injection (new way)
  constructor(config = {}) {
    // ... initialization
  }
}
```

## Risk Assessment

| Phase | Risk Level | Impact | Mitigation |
|-------|-----------|--------|------------|
| Phase 1: Infrastructure | Low | No API changes | Full backward compatibility |
| Phase 2: Incremental | Medium | Optional API changes | Default to singleton |
| Phase 3: Container | Medium-High | New initialization | Gradual rollout |
| Phase 4: Complete | High | Breaking changes | Major version bump |

## Success Metrics

- ✅ Zero test failures after each phase
- ✅ 100% backward compatibility in Phases 1-2
- ✅ All classes use constructor injection (Phase 3+)
- ✅ No `.getInstance()` calls in production code (Phase 4)
- ✅ Test execution time reduced by 20%+
- ✅ Code coverage maintained or improved

## Alternative Approaches Considered

### 1. Keep Singletons (Rejected)
**Pros**: No refactoring needed  
**Cons**: Technical debt accumulates, testing remains difficult

### 2. Big-Bang Refactor (Rejected)
**Pros**: Complete solution immediately  
**Cons**: Too risky, high chance of regressions

### 3. Gradual Migration (SELECTED)
**Pros**: Lower risk, maintains stability, testable increments  
**Cons**: Takes longer, requires discipline

## Conclusion

While the current singleton usage provides convenient global access, it creates significant testing and maintainability challenges. The proposed gradual migration to dependency injection will improve code quality, testability, and flexibility without introducing breaking changes during the transition period.

**Recommendation**: Proceed with Phase 1 (Infrastructure Setup) immediately, as it is low-risk and provides foundation for future improvements.

## References

- [Dependency Injection in JavaScript](https://blog.risingstack.com/dependency-injection-in-node-js/)
- [Testing Singleton Patterns](https://kentcdodds.com/blog/avoid-the-test-user)
- [Clean Architecture Principles](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
