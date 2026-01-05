# GeolocationService Provider Pattern

## Overview

The GeolocationService has been refactored to use the **Provider Pattern** for better testability and flexibility. This architecture separates the browser-specific geolocation code into interchangeable providers, following the **Dependency Inversion Principle**.

## Architecture

### Class Hierarchy

```
GeolocationProvider (abstract base class)
├── BrowserGeolocationProvider (browser implementation)
└── MockGeolocationProvider (testing implementation)

GeolocationService (uses any GeolocationProvider)
```

### Key Classes

#### 1. GeolocationProvider (Interface)

Abstract base class defining the provider contract:

```javascript
class GeolocationProvider {
  getCurrentPosition(successCallback, errorCallback, options) { ... }
  watchPosition(successCallback, errorCallback, options) { ... }
  clearWatch(watchId) { ... }
  isSupported() { ... }
}
```

**Location**: `src/services/providers/GeolocationProvider.js`

#### 2. BrowserGeolocationProvider

Wraps the browser's `navigator.geolocation` API:

```javascript
const provider = new BrowserGeolocationProvider(navigator);

provider.getCurrentPosition(
  (position) => console.log(position),
  (error) => console.error(error),
  { enableHighAccuracy: true }
);
```

**Features**:
- Wraps navigator.geolocation API
- Supports dependency injection
- Validates geolocation support
- Checks Permissions API availability

**Location**: `src/services/providers/BrowserGeolocationProvider.js`

#### 3. MockGeolocationProvider

Controllable mock for testing:

```javascript
const mockProvider = new MockGeolocationProvider({
  defaultPosition: {
    coords: { latitude: -23.5505, longitude: -46.6333 },
    timestamp: Date.now()
  }
});
```

**Features**:
- Predefined positions/errors
- Dynamic position changes
- Simulated delays
- Watch functionality
- No browser dependencies

**Location**: `src/services/providers/MockGeolocationProvider.js`

## Usage Examples

### Basic Usage (New Way)

```javascript
import { GeolocationService, MockGeolocationProvider } from './src/guia.js';

// Create mock provider
const mockProvider = new MockGeolocationProvider({
  defaultPosition: {
    coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 15 },
    timestamp: Date.now()
  }
});

// Create service with provider
const service = new GeolocationService(null, mockProvider);

// Get position
const position = await service.getSingleLocationUpdate();
console.log(`Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`);
```

### Testing with Errors

```javascript
const errorProvider = new MockGeolocationProvider({
  defaultError: { code: 1, message: 'Permission denied' }
});

const service = new GeolocationService(null, errorProvider);

try {
  await service.getSingleLocationUpdate();
} catch (error) {
  console.log(`Error: ${error.name} - ${error.message}`);
}
```

### Dynamic Position Changes

```javascript
const dynamicProvider = new MockGeolocationProvider();

// Set initial position
dynamicProvider.setPosition({
  coords: { latitude: -23.5505, longitude: -46.6333 },
  timestamp: Date.now()
});

const pos1 = await service.getSingleLocationUpdate();

// Change position
dynamicProvider.setPosition({
  coords: { latitude: -22.9068, longitude: -43.1729 },
  timestamp: Date.now()
});

const pos2 = await service.getSingleLocationUpdate();
```

### Backward Compatibility (Old Way)

The old way of injecting the navigator object still works:

```javascript
// Old way - still supported
const service = new GeolocationService(null, navigator);

// Automatically wrapped in BrowserGeolocationProvider
const position = await service.getSingleLocationUpdate();
```

### Browser Usage with BrowserGeolocationProvider

```javascript
import { 
  GeolocationService, 
  BrowserGeolocationProvider 
} from './src/guia.js';

// Explicit provider creation
const browserProvider = new BrowserGeolocationProvider(navigator);
const service = new GeolocationService(null, browserProvider);

// Check support
if (browserProvider.isSupported()) {
  const position = await service.getSingleLocationUpdate();
}
```

## Testing Strategy

### Unit Tests

Test the service logic without real browser APIs:

```javascript
import { GeolocationService, MockGeolocationProvider } from '../src/guia.js';

test('should handle position updates', async () => {
  const mockProvider = new MockGeolocationProvider({
    defaultPosition: mockPosition
  });
  
  const mockPositionManager = { update: jest.fn() };
  const service = new GeolocationService(null, mockProvider, mockPositionManager);
  
  await service.getSingleLocationUpdate();
  
  expect(mockPositionManager.update).toHaveBeenCalledWith(mockPosition);
});
```

### Integration Tests

Test with BrowserGeolocationProvider and mock navigator:

```javascript
test('should work with browser provider', async () => {
  const mockNavigator = {
    geolocation: {
      getCurrentPosition: jest.fn((success) => success(mockPosition))
    }
  };
  
  const browserProvider = new BrowserGeolocationProvider(mockNavigator);
  const service = new GeolocationService(null, browserProvider);
  
  const position = await service.getSingleLocationUpdate();
  expect(position).toBe(mockPosition);
});
```

### Watch Position Testing

```javascript
test('should handle watch updates', (done) => {
  const mockProvider = new MockGeolocationProvider({
    defaultPosition: initialPosition
  });
  
  const service = new GeolocationService(null, mockProvider);
  const watchId = service.watchCurrentLocation();
  
  // Trigger update
  mockProvider.triggerWatchUpdate(newPosition);
  
  setTimeout(() => {
    expect(service.lastKnownPosition).toBe(newPosition);
    service.stopWatching();
    done();
  }, 50);
});
```

## Design Principles

### 1. Dependency Inversion Principle

GeolocationService depends on the abstract `GeolocationProvider` interface, not concrete implementations:

```javascript
// ✅ Good - depends on abstraction
class GeolocationService {
  constructor(locationResult, provider, positionManager) {
    this.provider = provider; // Any GeolocationProvider
  }
}

// ❌ Bad - depends on concrete implementation
class GeolocationService {
  constructor(locationResult) {
    this.navigator = navigator; // Tight coupling to browser
  }
}
```

### 2. Open/Closed Principle

New providers can be added without modifying existing code:

```javascript
// Easy to add new providers
class GPSDeviceProvider extends GeolocationProvider {
  // Custom GPS device implementation
}

const gpsProvider = new GPSDeviceProvider();
const service = new GeolocationService(null, gpsProvider);
```

### 3. Interface Segregation

Minimal interface with only essential methods:

```javascript
interface GeolocationProvider {
  getCurrentPosition(success, error, options)
  watchPosition(success, error, options)
  clearWatch(watchId)
  isSupported()
}
```

### 4. Single Responsibility

Each class has one clear responsibility:

- **GeolocationProvider**: Define provider interface
- **BrowserGeolocationProvider**: Wrap browser API
- **MockGeolocationProvider**: Provide test doubles
- **GeolocationService**: Coordinate geolocation operations

## Benefits

### ✅ Testability

- No browser dependencies in tests
- Deterministic behavior
- Fast test execution
- Easy to simulate errors

### ✅ Flexibility

- Support different geolocation sources
- Easy to mock for development
- Customizable behavior per environment

### ✅ Maintainability

- Clear separation of concerns
- Easy to understand
- Low coupling between components
- High cohesion within classes

### ✅ Backward Compatibility

- Existing code continues to work
- Gradual migration path
- No breaking changes

## Migration Guide

### For Existing Code

No changes required! The old pattern still works:

```javascript
// Before and after - same code works
const service = new GeolocationService(resultDiv, navigator);
```

### For New Code

Prefer the provider pattern:

```javascript
// Recommended for new code
const provider = new BrowserGeolocationProvider(navigator);
const service = new GeolocationService(resultDiv, provider);
```

### For Tests

Use MockGeolocationProvider:

```javascript
// Before - complex mock setup
const mockNavigator = {
  geolocation: {
    getCurrentPosition: jest.fn((success) => {
      success(mockPosition);
    })
  }
};

// After - simple and clear
const mockProvider = new MockGeolocationProvider({
  defaultPosition: mockPosition
});
```

## API Reference

### GeolocationProvider Methods

#### `getCurrentPosition(successCallback, errorCallback, options)`

Gets current position once.

**Parameters**:
- `successCallback: Function` - Called with position on success
- `errorCallback: Function` - Called with error on failure  
- `options: Object` - Geolocation options (enableHighAccuracy, timeout, maximumAge)

**Returns**: `void`

#### `watchPosition(successCallback, errorCallback, options)`

Starts continuous position monitoring.

**Parameters**: Same as getCurrentPosition
**Returns**: `number` - Watch ID for stopping

#### `clearWatch(watchId)`

Stops position monitoring.

**Parameters**:
- `watchId: number` - Watch ID from watchPosition

**Returns**: `void`

#### `isSupported()`

Checks if geolocation is supported.

**Returns**: `boolean` - True if supported

### MockGeolocationProvider Configuration

```javascript
new MockGeolocationProvider({
  supported: true,           // Whether geolocation is supported
  defaultPosition: null,     // Default position to return
  defaultError: null,        // Default error to return
  delay: 0                   // Delay in ms before callbacks
})
```

### MockGeolocationProvider Methods

#### `setPosition(position)`

Sets position for future calls.

#### `setError(error)`

Sets error for future calls.

#### `triggerWatchUpdate(position)`

Triggers update for all active watches.

#### `triggerWatchError(error)`

Triggers error for all active watches.

## Files Structure

```
src/
├── services/
│   ├── GeolocationService.js          (updated - uses provider)
│   └── providers/
│       ├── GeolocationProvider.js     (new - base class)
│       ├── BrowserGeolocationProvider.js (new - browser impl)
│       └── MockGeolocationProvider.js (new - test impl)
│
__tests__/
├── services/
│   ├── GeolocationService.injection.test.js (existing - passing)
│   ├── GeolocationService.helpers.test.js   (existing - passing)
│   ├── GeolocationService.raceCondition.test.js (existing - passing)
│   ├── GeolocationService.providerPattern.test.js (new - 8 tests)
│   └── providers/
│       ├── GeolocationProvider.test.js (new - 8 tests)
│       ├── BrowserGeolocationProvider.test.js (new - 16 tests)
│       └── MockGeolocationProvider.test.js (new - 24 tests)
│
examples/
└── provider-pattern-demo.js (new - working demo)
```

## Related Documentation

- [REFERENTIAL_TRANSPARENCY.md](../../.github/REFERENTIAL_TRANSPARENCY.md) - Pure functions and immutability
- [LOW_COUPLING_GUIDE.md](../../.github/LOW_COUPLING_GUIDE.md) - Coupling principles
- [HIGH_COHESION_GUIDE.md](../../.github/HIGH_COHESION_GUIDE.md) - Cohesion principles
- [TDD_GUIDE.md](../../.github/TDD_GUIDE.md) - Test-driven development

## See Also

- Example: `examples/provider-pattern-demo.js`
- Tests: `__tests__/services/providers/`
- Integration tests: `__tests__/services/GeolocationService.providerPattern.test.js`
