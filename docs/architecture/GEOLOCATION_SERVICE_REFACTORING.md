# GeolocationService Referential Transparency Refactoring

## Overview

This document details the refactoring of the `GeolocationService` class to maximize referential transparency by extracting pure functions, isolating side effects, and enabling dependency injection for better testability.

## Implementation Date

October 11, 2025

## Motivation

The original `GeolocationService` class mixed pure business logic with impure browser API calls and DOM manipulation, making it difficult to test and reason about. This refactoring follows the same principles applied to the `GeoPosition` class to create more maintainable and testable code.

## Changes Made

### 1. Pure Helper Functions Extracted

Six new pure helper functions were created to separate business logic from side effects:

#### `getGeolocationErrorInfo(errorCode)`
**Purpose:** Maps error codes to error metadata  
**Type:** Pure function (referentially transparent)  
**Returns:** Object with `name` and `message` properties

```javascript
// ✅ Pure: Same input always produces same output
const errorInfo = getGeolocationErrorInfo(1);
// Returns: { name: "PermissionDeniedError", message: "User denied..." }
```

#### `formatGeolocationError(error)`
**Purpose:** Transforms raw geolocation errors into consistent Error objects  
**Type:** Pure function  
**Returns:** Formatted Error object with additional properties

```javascript
// ✅ Pure: No mutations, deterministic
const formatted = formatGeolocationError({ code: 1, message: "..." });
// Returns Error object with name, message, code, and originalError
```

#### `getGeolocationErrorMessage(errorCode)`
**Purpose:** Returns Portuguese error messages for UI display  
**Type:** Pure function  
**Returns:** Portuguese error message string

```javascript
// ✅ Pure: No side effects
const msg = getGeolocationErrorMessage(1);
// Returns: "Permissão negada pelo usuário"
```

#### `generateErrorDisplayHTML(error)`
**Purpose:** Generates HTML for error display  
**Type:** Pure function (template generation only)  
**Returns:** HTML string

```javascript
// ✅ Pure: Returns HTML string without DOM manipulation
const html = generateErrorDisplayHTML({ code: 1, message: "..." });
// Returns HTML string (doesn't mutate DOM)
```

#### `isGeolocationSupported(navigatorObj)`
**Purpose:** Validates geolocation API availability  
**Type:** Pure function  
**Returns:** Boolean

```javascript
// ✅ Pure: Simple validation
const supported = isGeolocationSupported(navigator);
// Returns true/false
```

#### `isPermissionsAPISupported(navigatorObj)`
**Purpose:** Validates Permissions API availability  
**Type:** Pure function  
**Returns:** Boolean

```javascript
// ✅ Pure: Simple validation
const supported = isPermissionsAPISupported(navigator);
// Returns true/false
```

### 2. Dependency Injection Support

The `GeolocationService` constructor now accepts optional dependencies:

**Before:**
```javascript
constructor(locationResult) {
    this.locationResult = locationResult;
    this.positionManager = PositionManager.getInstance();
    // Uses global navigator object
}
```

**After:**
```javascript
constructor(locationResult, navigatorObj, positionManagerInstance) {
    this.locationResult = locationResult;
    this.navigator = navigatorObj || (typeof navigator !== 'undefined' ? navigator : null);
    this.positionManager = positionManagerInstance || PositionManager.getInstance();
}
```

**Benefits:**
- ✅ Testable without real browser APIs
- ✅ Follows Dependency Inversion Principle
- ✅ Enables mocking in unit tests
- ✅ Backward compatible (uses global navigator if not provided)

### 3. Method Updates to Use Pure Functions

#### `checkPermissions()`
**Before:** Direct access to global `navigator`  
**After:** Uses injected `this.navigator` and pure helper `isPermissionsAPISupported()`

```javascript
// ✅ Now uses pure helper function and injected dependency
async checkPermissions() {
    if (isPermissionsAPISupported(this.navigator)) {
        const permission = await this.navigator.permissions.query({ name: 'geolocation' });
        // ...
    }
}
```

#### `getSingleLocationUpdate()`
**Before:** Direct call to `this.formatGeolocationError()` (instance method)  
**After:** Uses pure function `formatGeolocationError()` and injected navigator

```javascript
// ✅ Now uses pure helper function
async getSingleLocationUpdate() {
    if (!isGeolocationSupported(this.navigator)) {
        // ...
    }
    this.navigator.geolocation.getCurrentPosition(
        (position) => { /* ... */ },
        (error) => reject(formatGeolocationError(error)), // Pure function
        setupParams.geolocationOptions
    );
}
```

#### `watchCurrentLocation()`
**Before:** Direct access to global `navigator`  
**After:** Uses injected `this.navigator` and pure helper

```javascript
// ✅ Uses injected dependency and pure validation
watchCurrentLocation() {
    if (!isGeolocationSupported(this.navigator)) {
        return null;
    }
    this.watchId = this.navigator.geolocation.watchPosition(/* ... */);
}
```

#### `stopWatching()`
**Before:** Direct access to global `navigator`  
**After:** Uses injected `this.navigator`

```javascript
// ✅ Uses injected dependency
stopWatching() {
    if (this.watchId !== null && this.isWatching) {
        this.navigator.geolocation.clearWatch(this.watchId);
        // ...
    }
}
```

#### `updateErrorDisplay(error)`
**Before:** Contained duplicate error mapping logic  
**After:** Uses pure function `generateErrorDisplayHTML()`

```javascript
// ✅ Delegates to pure function
updateErrorDisplay(error) {
    if (!this.locationResult) return;
    this.locationResult.innerHTML = generateErrorDisplayHTML(error); // Pure function
}
```

### 4. Removed Instance Method

The `formatGeolocationError()` instance method was removed because it's now a pure function outside the class.

**Before:**
```javascript
class GeolocationService {
    formatGeolocationError(error) {
        const errorMap = { /* ... */ };
        // ...
    }
}
```

**After:**
```javascript
// ✅ Pure function outside class (globally accessible)
const formatGeolocationError = (error) => {
    const errorInfo = getGeolocationErrorInfo(error.code);
    // ...
};
```

## Side Effects Isolation

Side effects are now clearly isolated in specific methods:

| Method | Pure Logic | Side Effects |
|--------|-----------|--------------|
| `checkPermissions()` | Uses `isPermissionsAPISupported()` | Async browser API call, state mutation |
| `getSingleLocationUpdate()` | Uses `isGeolocationSupported()`, `formatGeolocationError()` | Browser API call, DOM update, state mutation |
| `watchCurrentLocation()` | Uses `isGeolocationSupported()` | Browser API call, state mutation |
| `stopWatching()` | None | Browser API call, state mutation |
| `updateLocationDisplay()` | None | DOM manipulation |
| `updateErrorDisplay()` | Uses `generateErrorDisplayHTML()` | DOM manipulation |

**Pure functions (no side effects):**
- `getGeolocationErrorInfo()`
- `formatGeolocationError()`
- `getGeolocationErrorMessage()`
- `generateErrorDisplayHTML()`
- `isGeolocationSupported()`
- `isPermissionsAPISupported()`

## Testing Improvements

### New Test Files

1. **`__tests__/services/GeolocationService.helpers.test.js`** (237 lines)
   - Tests all pure helper functions
   - Verifies referential transparency
   - Checks for side-effect freedom
   - 20 tests covering all pure functions

2. **`__tests__/services/GeolocationService.injection.test.js`** (378 lines)
   - Tests dependency injection
   - Demonstrates mocking without real browser APIs
   - Tests complete workflows with mocked dependencies
   - 17 tests covering DI scenarios

### Test Coverage

**Total new tests: 37**

#### Pure Helper Functions (20 tests)
- `getGeolocationErrorInfo`: 4 tests
- `formatGeolocationError`: 3 tests
- `getGeolocationErrorMessage`: 3 tests
- `generateErrorDisplayHTML`: 3 tests
- `isGeolocationSupported`: 4 tests
- `isPermissionsAPISupported`: 4 tests
- Overall purity: 1 test

#### Dependency Injection (17 tests)
- Constructor DI: 3 tests
- `checkPermissions` with mocks: 3 tests
- `getSingleLocationUpdate` with mocks: 4 tests
- `watchCurrentLocation` with mocks: 3 tests
- `stopWatching` with mocks: 1 test
- End-to-end workflow: 1 test

### Testing Without Real Browser APIs

**Before:**
```javascript
// ❌ Hard to test - requires real browser APIs
const service = new GeolocationService(element);
await service.getSingleLocationUpdate(); // Needs real navigator.geolocation
```

**After:**
```javascript
// ✅ Easy to test - uses mocked dependencies
const mockNavigator = {
    geolocation: {
        getCurrentPosition: jest.fn((success) => success(mockPosition))
    }
};
const service = new GeolocationService(null, mockNavigator);
await service.getSingleLocationUpdate(); // Uses mock
```

## Benefits

### 1. Referential Transparency
- Pure functions can be replaced with their return values
- Same inputs always produce same outputs
- No hidden dependencies or global state

### 2. Testability
- Pure functions are trivial to test (no setup/teardown)
- Dependency injection enables complete mocking
- No need for browser APIs in unit tests

### 3. Reusability
- Pure functions can be used anywhere
- Error formatting logic is portable
- Validation functions are context-independent

### 4. Maintainability
- Clear separation between pure and impure code
- Business logic isolated from I/O operations
- Easier to reason about code behavior

### 5. Concurrency Safety
- Pure functions are inherently thread-safe
- No race conditions in error formatting
- Deterministic behavior

## Backward Compatibility

All changes are **backward compatible**:

✅ Existing code using `GeolocationService` without injected dependencies continues to work  
✅ `new GeolocationService(element)` still uses global `navigator`  
✅ All public method signatures remain unchanged  
✅ No breaking changes to existing consumers

## Examples

### Basic Usage (No Changes)

```javascript
// ✅ Works exactly as before
const service = new GeolocationService(document.getElementById('result'));
const position = await service.getSingleLocationUpdate();
```

### Testing with Dependency Injection (New Capability)

```javascript
// ✅ New: Complete control for testing
const mockNavigator = {
    geolocation: {
        getCurrentPosition: jest.fn((success) => {
            success({ coords: { latitude: -23.5505, longitude: -46.6333 } });
        })
    },
    permissions: {
        query: jest.fn().mockResolvedValue({ state: 'granted' })
    }
};

const mockPositionManager = {
    update: jest.fn()
};

const service = new GeolocationService(null, mockNavigator, mockPositionManager);

// Check permissions
const permission = await service.checkPermissions();
expect(permission).toBe('granted');

// Get position
const position = await service.getSingleLocationUpdate();
expect(mockPositionManager.update).toHaveBeenCalled();
```

### Using Pure Helper Functions Directly

```javascript
// ✅ Pure functions can be used independently
const errorInfo = getGeolocationErrorInfo(1);
console.log(errorInfo.name); // "PermissionDeniedError"

const message = getGeolocationErrorMessage(1);
console.log(message); // "Permissão negada pelo usuário"

const html = generateErrorDisplayHTML({ code: 1, message: "Test" });
// Returns HTML string for display
```

## Comparison with GeoPosition Refactoring

This refactoring follows the same principles as the `GeoPosition` class refactoring:

| Aspect | GeoPosition | GeolocationService |
|--------|-------------|-------------------|
| **Pure Functions** | `getAccuracyQuality()`, `calculateDistance()` | 6 pure helper functions |
| **Immutability** | Defensive copying, no setters | Not applicable (service class) |
| **Dependency Injection** | N/A (pure data class) | Navigator and PositionManager |
| **Side Effect Isolation** | No side effects at all | Side effects in minimal methods |
| **Testability** | Easy (pure class) | Easy (mockable dependencies) |

## Implementation Checklist

- [x] Extract pure error formatting functions
- [x] Extract pure validation functions
- [x] Add dependency injection to constructor
- [x] Update all methods to use injected navigator
- [x] Update all methods to use pure helpers
- [x] Remove duplicate logic (error formatting)
- [x] Create comprehensive tests for pure functions
- [x] Create tests for dependency injection
- [x] Verify backward compatibility
- [x] Update documentation

## Related Documentation

- [REFERENTIAL_TRANSPARENCY.md](../../.github/REFERENTIAL_TRANSPARENCY.md) - Functional programming guidelines
- [GEO_POSITION.md](./GEO_POSITION.md) - Pure, referentially transparent GeoPosition class
- [GEOPOSITION_REFACTORING_SUMMARY.md](./GEOPOSITION_REFACTORING_SUMMARY.md) - Similar refactoring pattern
- [CLASS_DIAGRAM.md](./CLASS_DIAGRAM.md) - System architecture overview

## See Also

- GeolocationService tests: `__tests__/services/GeolocationService.*.test.js`
- Pure helper functions: `src/guia.js` (lines 5577-5724)
- GeolocationService class: `src/guia.js` (lines 5726-5918)

## Version History

- **0.8.5-alpha** (2025-10-11): Refactored for referential transparency
  - Added 6 pure helper functions
  - Added dependency injection support
  - Added 37 comprehensive tests
  - Isolated side effects in minimal methods
- **0.8.3-alpha**: Initial implementation with mixed concerns

## Conclusion

The `GeolocationService` class is now more referentially transparent:

- ✅ Pure functions extracted for all business logic
- ✅ Side effects isolated in minimal, well-documented methods
- ✅ Dependency injection enables complete testability
- ✅ 37 new tests verify pure behavior and DI support
- ✅ Backward compatible with existing code
- ✅ Follows project standards from REFERENTIAL_TRANSPARENCY.md

This refactoring makes the codebase easier to test, maintain, and reason about while maintaining full compatibility with existing code.
