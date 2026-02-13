# GeoPosition API Documentation

**Version:** 0.9.0-alpha  
**Module:** `src/core/GeoPosition.js`  
**Pattern:** Value Object (Immutable)  
**Author:** Marcelo Pereira Barbosa

## Overview

Geographic position data wrapper with convenience methods. Provides an immutable wrapper around browser Geolocation API position data, adding convenience methods for distance calculations and accuracy assessment.

## Purpose and Responsibility

- **Immutable Position Data**: Wraps browser geolocation data in a frozen, immutable object
- **Accuracy Assessment**: Classifies GPS accuracy into quality levels
- **Distance Calculations**: Provides convenient distance calculation methods
- **Enhanced Position Data**: Adds computed properties like `accuracyQuality`
- **Defensive Copying**: Creates defensive copies to avoid sharing references

## Location in Codebase

```
src/core/GeoPosition.js
```

## Dependencies

```javascript
import { calculateDistance } from '../utils/distance.js';
import { log, warn, error } from '../utils/logger.js';
```

## Constructor

### `constructor(position)`

Creates a new immutable GeoPosition instance.

**Parameters:**
- `position` (GeolocationPosition): Browser Geolocation API position object
  - `position.coords` (GeolocationCoordinates): Coordinate information
    - `latitude` (number): Latitude in decimal degrees
    - `longitude` (number): Longitude in decimal degrees
    - `accuracy` (number): Accuracy in meters
    - `altitude` (number, nullable): Altitude in meters
    - `altitudeAccuracy` (number, nullable): Altitude accuracy in meters
    - `heading` (number, nullable): Compass heading in degrees
    - `speed` (number, nullable): Speed in meters/second
  - `position.timestamp` (number): Timestamp when position was acquired

**Returns:** Immutable `GeoPosition` instance

**Immutability:** All instances are frozen with `Object.freeze(this)` after creation

**Example:**
```javascript
import GeoPosition from './core/GeoPosition.js';

navigator.geolocation.getCurrentPosition((browserPosition) => {
  const position = new GeoPosition(browserPosition);
  console.log(position.latitude, position.longitude);
  console.log(position.accuracyQuality); // 'good'
  
  // Attempting to modify will fail (or throw in strict mode)
  position.latitude = 0; // No effect - object is frozen
});
```

**Since:** 0.9.0-alpha

## Static Methods

### `getAccuracyQuality(accuracy)`

Classifies GPS accuracy into quality levels based on accuracy value in meters.

**Parameters:**
- `accuracy` (number): GPS accuracy value in meters from GeolocationCoordinates

**Returns:** `string` - Quality classification: 'excellent' | 'good' | 'medium' | 'bad' | 'very bad'

**Quality Levels:**
- **excellent**: ≤ 10 meters (high precision, suitable for all applications)
- **good**: 11-30 meters (good precision, suitable for most applications)
- **medium**: 31-100 meters (moderate precision, may be acceptable for some uses)
- **bad**: 101-200 meters (poor precision, generally not recommended)
- **very bad**: > 200 meters (very poor precision, should be rejected)

**Example:**
```javascript
// Classify different accuracy levels
console.log(GeoPosition.getAccuracyQuality(5));    // 'excellent'
console.log(GeoPosition.getAccuracyQuality(25));   // 'good'
console.log(GeoPosition.getAccuracyQuality(75));   // 'medium'
console.log(GeoPosition.getAccuracyQuality(150));  // 'bad'
console.log(GeoPosition.getAccuracyQuality(500));  // 'very bad'
```

**Since:** 0.9.0-alpha

## Instance Properties

All properties are read-only due to `Object.freeze()`:

- `geolocationPosition` (GeolocationPosition): Defensive copy of original browser position object
- `coords` (GeolocationCoordinates): Defensive copy of coordinates object
- `latitude` (number): Latitude in decimal degrees
- `longitude` (number): Longitude in decimal degrees
- `accuracy` (number): Position accuracy in meters
- `accuracyQuality` (string): Computed quality classification
- `altitude` (number, nullable): Altitude in meters
- `altitudeAccuracy` (number, nullable): Altitude accuracy in meters
- `heading` (number, nullable): Compass heading in degrees (0-360)
- `speed` (number, nullable): Speed in meters per second
- `timestamp` (number): Timestamp when position was acquired (milliseconds since Unix epoch)

**Example:**
```javascript
const position = new GeoPosition(browserPosition);

console.log(`Position: ${position.latitude}, ${position.longitude}`);
console.log(`Accuracy: ${position.accuracy}m (${position.accuracyQuality})`);
console.log(`Altitude: ${position.altitude}m`);
console.log(`Speed: ${position.speed} m/s`);
console.log(`Heading: ${position.heading}°`);
console.log(`Timestamp: ${new Date(position.timestamp).toISOString()}`);
```

## Instance Methods

### `distanceTo(otherPosition)`

Calculates the distance between this position and another position using the Haversine formula.

**Parameters:**
- `otherPosition` (Object): Other position to calculate distance to
  - `latitude` (number): Latitude of other position in decimal degrees
  - `longitude` (number): Longitude of other position in decimal degrees

**Returns:** `number` - Distance in meters between the two positions

**Example:**
```javascript
const currentPosition = new GeoPosition(browserPosition);
const restaurant = { latitude: -23.5489, longitude: -46.6388 };
const distance = currentPosition.distanceTo(restaurant);
console.log(`Restaurant is ${Math.round(distance)} meters away`);
```

**Use Cases:**
- Determine how far the device has moved
- Calculate distance to points of interest
- Implement proximity-based features
- Validate minimum distance thresholds

**Since:** 0.9.0-alpha

---

### `calculateAccuracyQuality()`

Calculates the accuracy quality for the current position.

**Returns:** `string` - Quality classification for current position accuracy

**Deprecation Notice:** ⚠️ **Deprecated** - Use the `accuracyQuality` property instead. This method has a bug (calls undefined `getAccuracyQuality` instead of `GeoPosition.getAccuracyQuality`).

**Example:**
```javascript
// Deprecated - do not use
const quality = position.calculateAccuracyQuality(); // May throw error

// Use this instead
const quality = position.accuracyQuality; // Correct
```

**Since:** 0.9.0-alpha

---

### `toString()`

Returns a string representation of the GeoPosition instance.

**Returns:** `string` - Formatted string with position details

**Format:** `"GeoPosition: lat, lon, quality, altitude, speed, heading, timestamp"`

**Example:**
```javascript
const position = new GeoPosition(browserPosition);
console.log(position.toString());
// Output: "GeoPosition: -23.5505, -46.6333, good, 760, 0, 0, 1634567890123"
```

**Since:** 0.9.0-alpha

## Usage Examples

### Basic Position Wrapping

```javascript
import GeoPosition from './core/GeoPosition.js';

navigator.geolocation.getCurrentPosition((browserPosition) => {
  const position = new GeoPosition(browserPosition);
  
  console.log('Position acquired:');
  console.log(`  Coordinates: ${position.latitude}, ${position.longitude}`);
  console.log(`  Accuracy: ${position.accuracy}m (${position.accuracyQuality})`);
  console.log(`  Time: ${new Date(position.timestamp).toLocaleString()}`);
});
```

### Distance Calculation

```javascript
import GeoPosition from './core/GeoPosition.js';
import { log } from '../utils/logger.js';

// Current position
const currentPosition = new GeoPosition(browserPosition);

// Points of interest
const destinations = [
  { name: 'Restaurant', latitude: -23.5489, longitude: -46.6388 },
  { name: 'Museum', latitude: -23.5505, longitude: -46.6333 },
  { name: 'Park', latitude: -23.5525, longitude: -46.6356 }
];

// Calculate distances
destinations.forEach(dest => {
  const distance = currentPosition.distanceTo(dest);
  log(`${dest.name} is ${Math.round(distance)} meters away`);
});

// Find nearest destination
const nearest = destinations.reduce((closest, current) => {
  const currentDist = currentPosition.distanceTo(current);
  const closestDist = currentPosition.distanceTo(closest);
  return currentDist < closestDist ? current : closest;
});

log(`Nearest destination: ${nearest.name}`);
```

### Accuracy Validation

```javascript
import GeoPosition from './core/GeoPosition.js';

function validatePosition(browserPosition) {
  const position = new GeoPosition(browserPosition);
  
  const acceptableQualities = ['excellent', 'good'];
  
  if (acceptableQualities.includes(position.accuracyQuality)) {
    console.log('Position quality acceptable:', position.accuracyQuality);
    return true;
  } else {
    console.warn('Position quality too low:', position.accuracyQuality);
    return false;
  }
}

// Usage
navigator.geolocation.getCurrentPosition((browserPosition) => {
  if (validatePosition(browserPosition)) {
    // Proceed with position
  } else {
    // Request new position with higher accuracy
  }
});
```

### Quality-Based Filtering

```javascript
import GeoPosition from './core/GeoPosition.js';

// Static method usage
const accuracyValues = [5, 25, 75, 150, 500];

accuracyValues.forEach(accuracy => {
  const quality = GeoPosition.getAccuracyQuality(accuracy);
  console.log(`${accuracy}m → ${quality}`);
});

// Output:
// 5m → excellent
// 25m → good
// 75m → medium
// 150m → bad
// 500m → very bad
```

### Immutability Demonstration

```javascript
import GeoPosition from './core/GeoPosition.js';

const position = new GeoPosition(browserPosition);

console.log('Original:', position.latitude, position.longitude);

// Attempt to modify (will fail silently or throw in strict mode)
try {
  position.latitude = 0;
  position.longitude = 0;
} catch (error) {
  console.log('Cannot modify frozen object');
}

// Values remain unchanged
console.log('After attempt:', position.latitude, position.longitude);
// Output: Same as original values
```

### Movement Detection

```javascript
import GeoPosition from './core/GeoPosition.js';

let lastPosition = null;

function onPositionUpdate(browserPosition) {
  const currentPosition = new GeoPosition(browserPosition);
  
  if (lastPosition) {
    const distanceMoved = currentPosition.distanceTo(lastPosition);
    console.log(`Moved ${distanceMoved.toFixed(1)} meters`);
    
    if (distanceMoved >= 20) {
      console.log('Significant movement detected');
      // Trigger address update
    }
  }
  
  lastPosition = currentPosition;
}

// Start watching position
navigator.geolocation.watchPosition(onPositionUpdate);
```

## Related Classes

- **[PositionManager](./POSITION_MANAGER.md)** - Uses GeoPosition for position tracking
- **calculateDistance** (`src/utils/distance.js`) - Haversine distance calculation
- **[ObserverSubject](./OBSERVER_SUBJECT.md)** - Observer pattern for position updates
- **[GeocodingState](./GEOCODING_STATE.md)** - State management for geocoding

## Design Patterns

- **Value Object Pattern**: Immutable representation of position data
- **Defensive Copying**: Creates copies to prevent external mutation
- **Adapter Pattern**: Adapts browser GeolocationPosition to enhanced interface

## Immutability Benefits

1. **Thread Safety**: Frozen objects are inherently thread-safe
2. **Predictable State**: Cannot be modified after creation
3. **Caching**: Safe to cache and share without cloning
4. **Pure Functions**: Enables functional programming patterns
5. **Debugging**: Easier to debug - state cannot change unexpectedly

## Testing

Test file: `__tests__/unit/core/GeoPosition.test.js`

```javascript
import GeoPosition from './GeoPosition.js';

describe('GeoPosition', () => {
  test('immutability', () => {
    const browserPosition = {
      coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 10 },
      timestamp: Date.now()
    };
    
    const position = new GeoPosition(browserPosition);
    
    // Attempt to modify
    expect(() => {
      'use strict';
      position.latitude = 0;
    }).toThrow();
  });
  
  test('accuracy quality classification', () => {
    expect(GeoPosition.getAccuracyQuality(5)).toBe('excellent');
    expect(GeoPosition.getAccuracyQuality(25)).toBe('good');
    expect(GeoPosition.getAccuracyQuality(75)).toBe('medium');
    expect(GeoPosition.getAccuracyQuality(150)).toBe('bad');
    expect(GeoPosition.getAccuracyQuality(500)).toBe('very bad');
  });
  
  test('distance calculation', () => {
    const pos1 = new GeoPosition({
      coords: { latitude: 0, longitude: 0 },
      timestamp: Date.now()
    });
    const pos2 = { latitude: 0, longitude: 1 };
    
    const distance = pos1.distanceTo(pos2);
    expect(distance).toBeCloseTo(111319, -2); // ~111km per degree at equator
  });
});
```

## Browser Compatibility

- Works in all modern browsers with Geolocation API support
- Requires ES6+ for spread operator and Object.freeze()
- No polyfills required for target environments

## Performance Considerations

- **Immutable Objects**: Slight memory overhead but improved safety
- **Defensive Copying**: Creates new objects to prevent reference sharing
- **Distance Calculations**: O(1) complexity using Haversine formula
- **Frozen Objects**: V8 optimizes frozen objects for performance

## See Also

- [MDN GeolocationPosition](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition)
- [MDN GeolocationCoordinates](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
