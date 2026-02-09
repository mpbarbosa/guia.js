# PositionManager API Documentation

**Version:** 0.8.7-alpha  
**Module:** `src/core/PositionManager.js`  
**Pattern:** Singleton, Observer  
**Author:** Marcelo Pereira Barbosa

## Overview

Centralized singleton manager for device geographic position. `PositionManager` implements the singleton and observer patterns to provide a single source of truth for the current device position. It wraps the browser's Geolocation API, applies multi-layer validation rules (accuracy, distance, time thresholds), and notifies subscribed observers about position changes.

## Purpose and Responsibility

- **Single Position State**: Ensures only one position state exists across the entire application
- **Smart Filtering**: Prevents excessive processing from GPS noise and minor position changes
- **Multi-Layer Validation**: Applies accuracy quality, distance, and time threshold rules
- **Observer Notifications**: Notifies subscribers of meaningful position changes
- **Integration Ready**: Works seamlessly with `GeoPosition` for enhanced position data

## Key Features

- Singleton pattern ensures one position state across application
- Observer pattern for decoupled position change notifications
- Smart filtering prevents excessive processing from GPS noise
- Multi-layer validation (accuracy quality, distance OR time threshold)
- Integration with GeoPosition for enhanced position data

## Validation Rules (v0.7.2-alpha)

1. **Accuracy Quality**: Rejects medium/bad/very bad accuracy on mobile devices
2. **Distance OR Time Threshold**: Updates if EITHER condition is met:
   - Movement ≥ 20 meters OR
   - Time elapsed ≥ 30 seconds
3. **Event Classification**: Distinguishes regular updates (≥50s) from immediate updates (<50s)

## Location in Codebase

```
src/core/PositionManager.js
```

## Dependencies

```javascript
import GeoPosition from './GeoPosition.js';
import ObserverSubject from './ObserverSubject.js';
import { calculateDistance } from '../utils/distance.js';
import { log, warn } from '../utils/logger.js';
```

## Constructor

### `constructor(position)`

Creates a new PositionManager instance (private - use `getInstance()` instead).

**Parameters:**
- `position` (GeolocationPosition, optional): Initial position data

**Example:**
```javascript
// Typically used internally by getInstance()
const manager = new PositionManager(geolocationPosition);
```

**Since:** 0.6.0-alpha

## Static Methods

### `getInstance(position)`

Gets or creates the singleton PositionManager instance.

**Parameters:**
- `position` (GeolocationPosition, optional): HTML5 Geolocation API Position object
  - `position.coords` (GeolocationCoordinates): Coordinate information
    - `latitude` (number): Latitude in decimal degrees
    - `longitude` (number): Longitude in decimal degrees
    - `accuracy` (number): Accuracy in meters
  - `position.timestamp` (number): Timestamp when position was acquired

**Returns:** `PositionManager` - The singleton instance

**Example:**
```javascript
// Create initial instance
const manager = PositionManager.getInstance();

// Create or update with position data
navigator.geolocation.getCurrentPosition((position) => {
  const manager = PositionManager.getInstance(position);
  console.log(manager.latitude, manager.longitude);
});
```

**Since:** 0.6.0-alpha

## Static Constants

### Event Type Constants

```javascript
// Position successfully updated
PositionManager.strCurrPosUpdate = "PositionManager updated"

// Position update rejected by validation
PositionManager.strCurrPosNotUpdate = "PositionManager not updated"

// Immediate position update (< 50s elapsed)
PositionManager.strImmediateAddressUpdate = "Immediate address update"
```

## Public Methods

### `subscribe(observer)`

Subscribes an observer to position change notifications.

**Parameters:**
- `observer` (Object): Observer object to subscribe
  - `observer.update` (Function): Method called on position changes `(positionManager, eventType) => void`

**Returns:** `void`

**Example:**
```javascript
const myObserver = {
  update: (positionManager, event) => {
    console.log('Position event:', event, positionManager.latitude);
  }
};
PositionManager.getInstance().subscribe(myObserver);
```

**Since:** 0.6.0-alpha

---

### `unsubscribe(observer)`

Unsubscribes an observer from position change notifications.

**Parameters:**
- `observer` (Object): Observer object to unsubscribe

**Returns:** `void`

**Example:**
```javascript
PositionManager.getInstance().unsubscribe(myObserver);
```

**Since:** 0.6.0-alpha

---

### `update(position)`

Updates the position with validation and filtering rules.

**Parameters:**
- `position` (GeolocationPosition): New position data from Geolocation API
  - `position.coords` (GeolocationCoordinates): Coordinate information
    - `latitude` (number): Latitude in decimal degrees
    - `longitude` (number): Longitude in decimal degrees
    - `accuracy` (number): Accuracy in meters
    - `altitude` (number, nullable): Altitude in meters
    - `altitudeAccuracy` (number, nullable): Altitude accuracy in meters
    - `heading` (number, nullable): Compass heading in degrees
    - `speed` (number, nullable): Speed in meters/second
  - `position.timestamp` (number): Timestamp when position was acquired

**Returns:** `void`

**Fires:**
- `strCurrPosUpdate` - When position successfully updated
- `strCurrPosNotUpdate` - When position rejected by validation
- `strImmediateAddressUpdate` - When update is immediate (< 50s)

**Validation Rules:**
1. Position validity: Must have valid position object with timestamp
2. Time constraint: Must wait at least 50 seconds between updates
3. Accuracy requirement: Rejects medium/bad/very bad accuracy positions
4. Distance threshold: Must move at least 20 meters

**Example:**
```javascript
// Update with new position (typically from Geolocation API)
navigator.geolocation.getCurrentPosition((position) => {
  const manager = PositionManager.getInstance();
  manager.update(position); // Validates and updates if rules pass
});
```

**Since:** 0.6.0-alpha

---

### `toString()`

Returns a string representation of the current position.

**Returns:** `string` - Formatted string with position details

**Example:**
```javascript
const manager = PositionManager.getInstance(position);
console.log(manager.toString());
// Output: "PositionManager: -23.5505, -46.6333, good, 760, 0, 0, 1634567890123"
```

**Since:** 0.6.0-alpha

## Properties (Read-Only)

All properties are read-only and proxied from the underlying `lastPosition` GeoPosition instance:

- `latitude` (number): Current latitude in decimal degrees
- `longitude` (number): Current longitude in decimal degrees
- `accuracy` (number): Position accuracy in meters
- `accuracyQuality` (string): Quality classification ('excellent', 'good', 'medium', 'bad', 'very bad')
- `altitude` (number, nullable): Altitude in meters
- `heading` (number, nullable): Compass heading in degrees
- `speed` (number, nullable): Speed in meters/second
- `timestamp` (number): Timestamp when position was acquired

**Example:**
```javascript
const manager = PositionManager.getInstance();
console.log(`Current position: ${manager.latitude}, ${manager.longitude}`);
console.log(`Accuracy: ${manager.accuracy}m (${manager.accuracyQuality})`);
```

## Configuration

### `initializeConfig(config)`

Initialize setupParams - called when module loads or can be overridden for testing.

**Parameters:**
- `config` (Object): Configuration object with tracking parameters
  - `notAcceptedAccuracy` (string[]): Array of unacceptable accuracy levels
  - `minimumDistanceChange` (number): Minimum distance change in meters to trigger update
  - `trackingInterval` (number): Tracking interval in milliseconds

**Returns:** `void`

**Example:**
```javascript
// Initialize with custom configuration
initializeConfig({
  notAcceptedAccuracy: ['medium', 'bad'],
  minimumDistanceChange: 50,
  trackingInterval: 30000
});
```

**Since:** 0.8.6-alpha

### Default Configuration

```javascript
{
  notAcceptedAccuracy: ['medium', 'bad', 'very bad'],
  minimumDistanceChange: 20,  // meters
  trackingInterval: 50000      // milliseconds (50 seconds)
}
```

## Usage Examples

### Basic Usage

```javascript
// Get singleton instance
const manager = PositionManager.getInstance();

// Subscribe to position updates
const observer = {
  update: (positionManager, eventType) => {
    if (eventType === PositionManager.strCurrPosUpdate) {
      console.log('Position:', positionManager.latitude, positionManager.longitude);
    }
  }
};
manager.subscribe(observer);
```

### Update Position from Geolocation API

```javascript
// Update position (typically done by GeolocationService)
navigator.geolocation.getCurrentPosition((position) => {
  const manager = PositionManager.getInstance();
  manager.update(position); // Validates and updates if rules pass
});
```

### Access Position Properties

```javascript
const manager = PositionManager.getInstance();
console.log(`Lat: ${manager.latitude}, Lon: ${manager.longitude}`);
console.log(`Accuracy: ${manager.accuracy}m (${manager.accuracyQuality})`);
console.log(`Speed: ${manager.speed} m/s`);
```

### Complete Workflow Example

```javascript
import PositionManager from './core/PositionManager.js';

// Initialize position manager
const positionManager = PositionManager.getInstance();

// Subscribe to updates
const displayObserver = {
  update: (manager, eventType) => {
    switch (eventType) {
      case PositionManager.strCurrPosUpdate:
        console.log('Position updated:', manager.latitude, manager.longitude);
        console.log('Accuracy:', manager.accuracyQuality);
        break;
      
      case PositionManager.strCurrPosNotUpdate:
        console.log('Position update rejected (filtering applied)');
        break;
      
      case PositionManager.strImmediateAddressUpdate:
        console.log('Immediate update:', manager.latitude, manager.longitude);
        break;
    }
  }
};

positionManager.subscribe(displayObserver);

// Start watching position
navigator.geolocation.watchPosition(
  (position) => {
    positionManager.update(position);
  },
  (error) => {
    console.error('Geolocation error:', error);
  },
  {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  }
);
```

## Related Classes

- **[GeoPosition](./GEO_POSITION.md)** - Position data wrapper with convenience methods
- **[ObserverSubject](./OBSERVER_SUBJECT.md)** - Observer pattern implementation
- **[GeocodingState](./GEOCODING_STATE.md)** - State management for geocoding workflow
- **GeolocationService** (`src/services/GeolocationService.js`) - Browser geolocation wrapper

## Design Patterns

- **Singleton Pattern**: Ensures only one position state exists
- **Observer Pattern**: Decouples position changes from dependent components
- **Facade Pattern**: Simplifies complex position tracking logic
- **Proxy Pattern**: Properties proxied from underlying GeoPosition instance

## Testing

Test file: `__tests__/unit/core/PositionManager.test.js`

```javascript
import PositionManager from './PositionManager.js';

describe('PositionManager', () => {
  test('singleton instance', () => {
    const instance1 = PositionManager.getInstance();
    const instance2 = PositionManager.getInstance();
    expect(instance1).toBe(instance2);
  });
  
  test('update with valid position', () => {
    const manager = PositionManager.getInstance();
    const observer = { update: jest.fn() };
    manager.subscribe(observer);
    
    const position = {
      coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 10 },
      timestamp: Date.now()
    };
    
    manager.update(position);
    expect(observer.update).toHaveBeenCalled();
  });
});
```

## Browser Compatibility

- Requires HTML5 Geolocation API support
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires HTTPS in production (localhost allowed for development)

## Performance Considerations

- **Efficient Filtering**: Only processes meaningful position changes
- **Smart Thresholds**: Configurable distance and time thresholds prevent excessive updates
- **Immutable Observers**: Observer array managed immutably via ObserverSubject
- **Lazy Evaluation**: Position only updated when validation rules pass

## Security Considerations

- Position data should be treated as sensitive user information
- Always request user permission before accessing geolocation
- Consider privacy implications when storing or transmitting position data
- Use HTTPS to prevent man-in-the-middle attacks

## See Also

- [Complete Architecture Documentation](../architecture/POSITION_MANAGER.md)
- [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [MDN GeolocationPosition](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition)
