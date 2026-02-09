# GeolocationService API Documentation

**Version:** 0.8.7-alpha  
**Module:** `services/GeolocationService`  
**Location:** `src/services/GeolocationService.js`

## Overview

GeolocationService is a sophisticated wrapper around the browser's native HTML5 Geolocation API, providing enhanced error handling, permission management, and seamless integration with the Guia Turístico application's position management system.

### Purpose and Responsibility

The service handles:
- Single location requests via `getCurrentPosition()`
- Continuous position monitoring via `watchPosition()`
- Centralized position state management through PositionManager
- Portuguese-language error messages for Brazilian users
- Material Design-styled error displays
- Race condition prevention for overlapping geolocation requests
- Graceful degradation when geolocation is unavailable

## Architecture

### Integration Points

- **PositionManager**: Centralized position state management and validation
- **BrowserGeolocationProvider**: Abstraction layer for geolocation operations
- **Display Components**: Automatic DOM updates with position data
- **Observer Pattern**: Implicit position update notifications via PositionManager

### Dependencies

```javascript
import PositionManager from '../core/PositionManager.js';
import { log } from '../utils/logger.js';
import { GEOLOCATION_OPTIONS } from '../config/defaults.js';
import BrowserGeolocationProvider from './providers/BrowserGeolocationProvider.js';
```

## Constructor

### Signature

```javascript
new GeolocationService(locationResult, geolocationProvider, positionManagerInstance, config)
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `locationResult` | `HTMLElement` | No | `undefined` | DOM element for displaying location results |
| `geolocationProvider` | `GeolocationProvider\|Object` | No | Auto-created | Provider for geolocation operations (or navigator for backward compatibility) |
| `positionManagerInstance` | `PositionManager` | No | Singleton | Injectable PositionManager instance (for testing) |
| `config` | `Object` | No | `{}` | Configuration options |
| `config.geolocationOptions` | `Object` | No | `GEOLOCATION_OPTIONS` | HTML5 Geolocation API options |

### Configuration Options

The `config.geolocationOptions` object supports standard HTML5 Geolocation API options:

- `enableHighAccuracy` (boolean): Request high accuracy position (default: `true`)
- `timeout` (number): Maximum time in milliseconds to wait for position (default: `10000`)
- `maximumAge` (number): Maximum age in milliseconds of cached position (default: `0`)

### Examples

```javascript
// Basic usage
const resultDiv = document.getElementById('location-display');
const service = new GeolocationService(resultDiv);

// With custom configuration
const service = new GeolocationService(resultDiv, null, null, {
  geolocationOptions: {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 5000
  }
});

// Dependency injection for testing (modern approach)
const mockProvider = new MockGeolocationProvider({ defaultPosition: mockPosition });
const mockPositionManager = { update: jest.fn() };
const service = new GeolocationService(null, mockProvider, mockPositionManager);

// Backward compatible (legacy approach still works)
const mockNavigator = { geolocation: mockGeolocationAPI };
const service = new GeolocationService(null, mockNavigator);
```

## Public Methods

### checkPermissions()

Checks the current geolocation permission status using the modern Permissions API.

**Signature:**
```javascript
async checkPermissions(): Promise<string>
```

**Returns:**
- `Promise<string>`: Resolves to permission state: `'granted'`, `'denied'`, or `'prompt'`

**Example:**
```javascript
const permission = await service.checkPermissions();
if (permission === 'granted') {
  // Safe to request location
  const position = await service.getSingleLocationUpdate();
} else if (permission === 'denied') {
  console.warn('Location permission denied');
}
```

**Browser Compatibility:**
- Falls back to `'prompt'` for browsers without Permissions API support

---

### getSingleLocationUpdate()

Requests the user's current position once with high accuracy settings.

**Signature:**
```javascript
async getSingleLocationUpdate(): Promise<GeolocationPosition>
```

**Returns:**
- `Promise<GeolocationPosition>`: Native Geolocation API position object

**Throws:**
- `GeolocationPositionError`: Permission denied, position unavailable, or timeout
- `Error`: If a request is already pending (race condition prevention)
- `Error`: If geolocation is not supported by the browser

**GeolocationPosition Structure:**
```javascript
{
  coords: {
    latitude: number,        // Decimal degrees
    longitude: number,       // Decimal degrees
    altitude: number|null,   // Meters above sea level
    accuracy: number,        // Accuracy in meters
    altitudeAccuracy: number|null,
    heading: number|null,    // Degrees from true north
    speed: number|null       // Meters per second
  },
  timestamp: number          // DOMTimeStamp
}
```

**Examples:**
```javascript
// Basic usage
try {
  const position = await service.getSingleLocationUpdate();
  console.log('Latitude:', position.coords.latitude);
  console.log('Longitude:', position.coords.longitude);
  console.log('Accuracy:', position.coords.accuracy, 'meters');
} catch (error) {
  console.error('Location error:', error.message);
}

// Check for pending requests before calling
if (!service.hasPendingRequest()) {
  const position = await service.getSingleLocationUpdate();
  // Process position...
} else {
  console.log('Request already in progress');
}

// Promise chaining (legacy style)
service.getSingleLocationUpdate()
  .then(position => {
    console.log('Success:', position);
  })
  .catch(error => {
    console.error('Failed:', error);
  });
```

**Race Condition Protection:**
If a request is already pending, this method will reject immediately to prevent race conditions and stale data. Use `hasPendingRequest()` to check before calling.

**Privacy Notice:**
Coordinates are not logged in error messages to protect user privacy. Full position data is only passed to authorized components.

**Side Effects:**
- Updates `PositionManager` with new position
- Updates display element if provided
- Sets `lastKnownPosition` internal state

---

### watchCurrentLocation()

Starts continuous position monitoring using the Geolocation API's watchPosition method.

**Signature:**
```javascript
watchCurrentLocation(): number|null
```

**Returns:**
- `number`: Watch ID for stopping the position watching
- `null`: If geolocation is not supported or already watching

**Example:**
```javascript
// Start watching
const watchId = service.watchCurrentLocation();

// Later, to stop watching
service.stopWatching();

// Check if currently watching
if (service.isCurrentlyWatching()) {
  console.log('Position tracking is active');
}
```

**Privacy Notice:**
Continuous tracking involves sensitive location data. Ensure users have consented to location tracking and understand how their data will be used. Stop tracking when no longer needed to preserve battery and privacy.

**Side Effects:**
- Sets `isWatching` flag to `true`
- Stores watch ID internally
- Updates `PositionManager` on each position update
- Updates display element on each update if provided

---

### stopWatching()

Stops the continuous position monitoring that was started with `watchCurrentLocation()`.

**Signature:**
```javascript
stopWatching(): void
```

**Example:**
```javascript
service.stopWatching(); // Stops position monitoring
```

**Importance:**
Stopping position watching is crucial for:
- Battery life conservation
- Performance optimization
- Privacy protection
- Resource cleanup

---

### getLastKnownPosition()

Retrieves the last known position without making a new API request.

**Signature:**
```javascript
getLastKnownPosition(): GeolocationPosition|null
```

**Returns:**
- `GeolocationPosition|null`: Last known position or `null` if none available

**Example:**
```javascript
const lastPos = service.getLastKnownPosition();
if (lastPos) {
  console.log('Last known:', lastPos.coords.latitude, lastPos.coords.longitude);
} else {
  console.log('No position available yet');
}
```

---

### isCurrentlyWatching()

Checks if the service is currently watching position.

**Signature:**
```javascript
isCurrentlyWatching(): boolean
```

**Returns:**
- `boolean`: `true` if position watching is active, `false` otherwise

**Example:**
```javascript
if (service.isCurrentlyWatching()) {
  console.log('Tracking is active');
} else {
  service.watchCurrentLocation();
}
```

---

### getCurrentWatchId()

Gets the current watch ID.

**Signature:**
```javascript
getCurrentWatchId(): number|null
```

**Returns:**
- `number|null`: Watch ID or `null` if not watching

**Example:**
```javascript
const watchId = service.getCurrentWatchId();
if (watchId !== null) {
  console.log('Active watch ID:', watchId);
}
```

---

### hasPendingRequest()

Checks if a geolocation request is currently pending.

**Signature:**
```javascript
hasPendingRequest(): boolean
```

**Returns:**
- `boolean`: `true` if a request is pending, `false` otherwise

**Example:**
```javascript
if (!service.hasPendingRequest()) {
  const position = await service.getSingleLocationUpdate();
} else {
  console.log('Request already in progress');
}
```

**Use Case:**
Use this method to prevent race conditions by checking if a request is already in progress before calling `getSingleLocationUpdate()`.

## Error Handling

### Error Types

The service handles and formats several error types:

| Error Code | Name | Portuguese Message | Description |
|------------|------|-------------------|-------------|
| 1 | `PermissionDeniedError` | "Permissão negada pelo usuário" | User denied geolocation permission |
| 2 | `PositionUnavailableError` | "Posição indisponível" | Position information is unavailable |
| 3 | `TimeoutError` | "Timeout na obtenção da posição" | Geolocation request timed out |
| - | `UnknownGeolocationError` | "Erro desconhecido" | Unknown geolocation error |
| - | `NotSupportedError` | - | Geolocation not supported by browser |
| - | `RequestPendingError` | - | Request already pending (race condition) |

### Error Display

Errors are displayed in Portuguese with Material Design styling:

```html
<div class="location-error">
  <h4>Erro na Obtenção da Localização</h4>
  <p><strong>Código:</strong> 1</p>
  <p><strong>Mensagem:</strong> Permissão negada pelo usuário</p>
  <p><strong>Detalhes:</strong> User denied geolocation permission</p>
</div>
```

### Error Handling Pattern

```javascript
try {
  const position = await service.getSingleLocationUpdate();
  // Success handling
} catch (error) {
  if (error.name === 'PermissionDeniedError') {
    // Handle permission denial
    showPermissionInstructions();
  } else if (error.name === 'TimeoutError') {
    // Handle timeout
    retryWithLongerTimeout();
  } else if (error.name === 'RequestPendingError') {
    // Handle race condition
    console.log('Request already in progress');
  } else {
    // Handle other errors
    console.error('Geolocation failed:', error.message);
  }
}
```

## Browser Compatibility

### HTML5 Geolocation API Support

The service includes robust browser compatibility checks:

```javascript
if (!this.provider.isSupported()) {
  throw new Error("Geolocation is not supported by this browser");
}
```

**Supported Browsers:**
- Chrome 5+
- Firefox 3.5+
- Safari 5+
- Edge (all versions)
- Opera 10.6+
- iOS Safari 3.2+
- Android Browser 2.1+

### Permissions API Support

The service gracefully degrades when Permissions API is unavailable:

```javascript
const permission = await service.checkPermissions();
// Returns 'prompt' for browsers without Permissions API
```

**Permissions API Support:**
- Chrome 43+
- Firefox 46+
- Opera 30+
- Edge 79+
- Safari: Not supported (falls back to 'prompt')

### HTTPS Requirement

**Important:** Geolocation requires HTTPS in production environments:
- ✅ `https://` - Allowed
- ✅ `http://localhost` - Allowed (development only)
- ❌ `http://` - Blocked (security risk)

## Performance Considerations

### Race Condition Prevention

The service prevents overlapping requests:

```javascript
if (this.isPendingRequest && this.pendingPromise) {
  return this.pendingPromise; // Return existing promise
}
```

### Caching

- Last known position is cached in `lastKnownPosition`
- Use `getLastKnownPosition()` to avoid unnecessary API calls
- Position updates respect `maximumAge` configuration

### Battery Optimization

For continuous tracking:
- Stop watching when no longer needed: `service.stopWatching()`
- Consider less frequent updates: adjust `geolocationOptions`
- Monitor battery level and adjust tracking accordingly

## Integration Examples

### With PositionManager

```javascript
// GeolocationService automatically updates PositionManager
const service = new GeolocationService(displayElement);
const position = await service.getSingleLocationUpdate();

// PositionManager now has the latest position
const positionManager = PositionManager.getInstance();
console.log(positionManager.lastPosition); // Same as position
```

### With Display Components

```javascript
// Automatic DOM updates
const displayElement = document.getElementById('location-display');
const service = new GeolocationService(displayElement);

await service.getSingleLocationUpdate();
// displayElement is automatically updated with coordinates
```

### Continuous Tracking

```javascript
// Start tracking
const service = new GeolocationService(displayElement);
service.watchCurrentLocation();

// Position updates flow automatically:
// GeolocationService → PositionManager → ReverseGeocoder → UI Components

// Stop tracking when done
window.addEventListener('beforeunload', () => {
  service.stopWatching();
});
```

## Testing

### Dependency Injection

```javascript
// Mock provider for testing
const mockProvider = {
  isSupported: () => true,
  getCurrentPosition: (success, error, options) => {
    success(mockPosition);
  },
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

const mockPositionManager = {
  update: jest.fn()
};

const service = new GeolocationService(
  null, 
  mockProvider, 
  mockPositionManager
);

await service.getSingleLocationUpdate();
expect(mockPositionManager.update).toHaveBeenCalledWith(mockPosition);
```

### Mock Position Object

```javascript
const mockPosition = {
  coords: {
    latitude: -23.550520,
    longitude: -46.633309,
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null
  },
  timestamp: Date.now()
};
```

## See Also

- [PositionManager Documentation](../core/POSITION_MANAGER.md)
- [ReverseGeocoder Documentation](./REVERSE_GEOCODER.md)
- [BrowserGeolocationProvider Documentation](./providers/BROWSER_GEOLOCATION_PROVIDER.md)
- [HTML5 Geolocation API Specification](https://www.w3.org/TR/geolocation-API/)
- [OpenStreetMap Nominatim API](https://nominatim.openstreetmap.org/)

## Change Log

### v0.8.7-alpha
- Extracted from `guia.js` in Phase 2 modularization
- Added provider abstraction pattern with `BrowserGeolocationProvider`
- Enhanced dependency injection support
- Added race condition prevention with `isPendingRequest` flag
- Improved documentation and type annotations

### v0.8.3-alpha
- Enhanced PositionManager integration
- Added permission checking via Permissions API
- Improved error handling and localization
- Added watch position state management methods
