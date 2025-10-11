# GeoPosition Class Documentation

## Overview

The `GeoPosition` class was introduced in version 0.5.0-alpha to encapsulate and manage geographic position data obtained from the browser's Geolocation API. It provides a **pure, referentially transparent, immutable** way to handle GPS coordinates, accuracy information, altitude, speed, and heading data with automatic quality classification.

## Motivation

When working with the browser's Geolocation API, position data comes in a complex nested structure with coordinates inside a `coords` object. The `GeoPosition` class simplifies this by:
- Flattening the position data structure for easier access
- Automatically classifying GPS accuracy into quality levels (excellent, good, medium, bad, very bad)
- Providing utility methods for distance calculations
- Offering consistent string representations for logging and debugging
- **Ensuring referential transparency**: No side effects, no mutations, predictable behavior
- **Providing immutability**: All properties set at construction, no setters
- **Creating defensive copies**: Input objects are not modified or shared

Previously, developers had to work directly with the browser's `GeolocationPosition` object, which requires accessing nested properties like `position.coords.latitude`. The `GeoPosition` class provides a cleaner, more intuitive interface with functional programming guarantees.

## Features

- **Automatic extraction** of coordinates from GeolocationPosition objects
- **Quality classification** for GPS accuracy (excellent to very bad)
- **Distance calculation** between geographic points using Haversine formula
- **Consistent logging** with formatted toString() output
- **Integration** with PositionManager and GeolocationService
- **Referential transparency**: Pure functions, no side effects, predictable outputs
- **Immutability**: All properties set at construction, no mutation after creation
- **Immutable instances** (frozen after creation)
- **Defensive copying**: Input objects are copied to prevent shared mutable state

## Usage

### Basic Usage

```javascript
const { GeoPosition } = require('./src/guia.js');

// Simulate browser GeolocationPosition object
const geolocationPosition = {
  coords: {
    latitude: -23.5505,
    longitude: -46.6333,
    accuracy: 15,
    altitude: 760,
    altitudeAccuracy: 10,
    heading: 90,
    speed: 5
  },
  timestamp: 1634567890123
};

const position = new GeoPosition(geolocationPosition);

console.log(position.latitude);         // -23.5505
console.log(position.longitude);        // -46.6333
console.log(position.accuracy);         // 15
console.log(position.accuracyQuality);  // 'good'
console.log(position.altitude);         // 760
console.log(position.speed);            // 5
console.log(position.heading);          // 90
console.log(position.timestamp);        // 1634567890123
```

### Accuracy Quality Classification

The class automatically classifies GPS accuracy into quality levels:

```javascript
// Static method for any accuracy value
console.log(GeoPosition.getAccuracyQuality(5));    // 'excellent'
console.log(GeoPosition.getAccuracyQuality(25));   // 'good'
console.log(GeoPosition.getAccuracyQuality(75));   // 'medium'
console.log(GeoPosition.getAccuracyQuality(150));  // 'bad'
console.log(GeoPosition.getAccuracyQuality(500));  // 'very bad'

// Instance property automatically calculated
const position = new GeoPosition(geolocationPosition);
console.log(position.accuracyQuality);  // Automatically set based on accuracy value
```

### Distance Calculation

Calculate the distance between two geographic positions:

```javascript
const currentPosition = new GeoPosition({
  coords: {
    latitude: -23.5505,
    longitude: -46.6333,
    accuracy: 15,
    altitude: 760,
    altitudeAccuracy: 10,
    heading: 0,
    speed: 0
  },
  timestamp: Date.now()
});

// Restaurant coordinates
const restaurant = {
  latitude: -23.5489,
  longitude: -46.6388
};

// Calculate distance in meters
const distance = currentPosition.distanceTo(restaurant);
console.log(`Restaurant is ${Math.round(distance)} meters away`);
// Output: "Restaurant is approximately 587 meters away"
```

### Integration with Browser Geolocation API

Real-world usage with the browser's Geolocation API:

```javascript
// In a web browser environment
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (browserPosition) => {
      // Wrap browser position in GeoPosition for easier access
      const position = new GeoPosition(browserPosition);
      
      // Access position data with simplified properties
      console.log(`Latitude: ${position.latitude}`);
      console.log(`Longitude: ${position.longitude}`);
      console.log(`Accuracy: ${position.accuracy}m (${position.accuracyQuality})`);
      
      // Log complete position info
      console.log(position.toString());
      // Output: "GeoPosition: -23.5505, -46.6333, good, 760, 0, 0, 1634567890123"
    },
    (error) => {
      console.error('Geolocation error:', error);
    }
  );
}
```

## Accuracy Quality Levels

The GPS accuracy is classified into five quality levels based on the accuracy value in meters:

| Quality Level | Accuracy Range | Description | Use Cases |
|--------------|----------------|-------------|-----------|
| **excellent** | ≤ 10 meters | High precision GPS | Navigation, precise location services |
| **good** | 11-30 meters | Good precision | Most mobile applications |
| **medium** | 31-100 meters | Moderate precision | General location services |
| **bad** | 101-200 meters | Poor precision | Generally not recommended |
| **very bad** | > 200 meters | Very poor precision | Should be rejected |

These thresholds are used by the application to determine whether to accept or reject position readings, especially important for distinguishing between mobile (GPS) and desktop (WiFi/IP) environments.

## Handling Missing or Invalid Data

The class handles missing or invalid position data gracefully:

```javascript
// Position with no coordinates
const invalidPosition = {
  coords: {
    latitude: null,
    longitude: null,
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null
  },
  timestamp: Date.now()
};

const position = new GeoPosition(invalidPosition);
console.log(position.toString());
// Output: "GeoPosition: No position data"

// Properties are still accessible
console.log(position.latitude);   // null
console.log(position.altitude);   // null
```

## Real-World Scenario

Here's a complete example of tracking a user's movement while driving:

```javascript
const { GeoPosition } = require('./src/guia.js');

let lastPosition = null;

// Simulate continuous position tracking
function handlePositionUpdate(browserPosition) {
  const currentPosition = new GeoPosition(browserPosition);
  
  // Check accuracy quality
  if (currentPosition.accuracyQuality === 'bad' || 
      currentPosition.accuracyQuality === 'very bad') {
    console.log('Position accuracy too poor, waiting for better signal...');
    return;
  }
  
  // Calculate distance traveled
  if (lastPosition) {
    const distanceTraveled = currentPosition.distanceTo(lastPosition);
    console.log(`Traveled ${Math.round(distanceTraveled)} meters`);
  }
  
  // Display current location info
  console.log(`Current Position: ${currentPosition.latitude}, ${currentPosition.longitude}`);
  console.log(`Speed: ${currentPosition.speed} m/s`);
  console.log(`Heading: ${currentPosition.heading}°`);
  console.log(`Accuracy: ${currentPosition.accuracy}m (${currentPosition.accuracyQuality})`);
  
  // Store for next comparison
  lastPosition = currentPosition;
}

// In browser: watch position continuously
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    handlePositionUpdate,
    (error) => console.error('Geolocation error:', error),
    { enableHighAccuracy: true, maximumAge: 0 }
  );
}
```

## API Reference

### Constructor

```javascript
new GeoPosition(position)
```

**Parameters:**
- `position` (Object): GeolocationPosition object from browser's Geolocation API
  - `coords` (Object): Coordinates object
    - `latitude` (number): Latitude in decimal degrees
    - `longitude` (number): Longitude in decimal degrees
    - `accuracy` (number): Accuracy in meters
    - `altitude` (number|null): Altitude in meters above sea level
    - `altitudeAccuracy` (number|null): Altitude accuracy in meters
    - `heading` (number|null): Direction of travel in degrees (0-360)
    - `speed` (number|null): Speed in meters per second
  - `timestamp` (number): Timestamp when the position was acquired

**Pure and Immutable:**
- Does not mutate the input `position` object
- Does not perform side effects (no logging)
- Creates defensive copies of `position` and `coords` objects
- All properties are set once at construction and cannot be changed

### Properties

#### Instance Properties

- `geolocationPosition` (Object): Original GeolocationPosition object from browser
- `coords` (Object): Reference to position.coords for compatibility
- `latitude` (number): Latitude in decimal degrees
- `longitude` (number): Longitude in decimal degrees
- `accuracy` (number): Accuracy in meters (setter available)
- `accuracyQuality` (string): Quality classification ('excellent'|'good'|'medium'|'bad'|'very bad')
- `altitude` (number|null): Altitude in meters above sea level
- `altitudeAccuracy` (number|null): Altitude accuracy in meters
- `heading` (number|null): Direction of travel in degrees (0-360, null if stationary)
- `speed` (number|null): Speed in meters per second (null if stationary)
- `timestamp` (number): Timestamp when position was acquired

### Methods

#### `static getAccuracyQuality(accuracy)`

Classifies GPS accuracy into quality levels based on accuracy value in meters.

**Parameters:**
- `accuracy` (number): GPS accuracy value in meters

**Returns:** `string` - Quality classification: 'excellent'|'good'|'medium'|'bad'|'very bad'

**Example:**
```javascript
console.log(GeoPosition.getAccuracyQuality(5));    // 'excellent'
console.log(GeoPosition.getAccuracyQuality(25));   // 'good'
console.log(GeoPosition.getAccuracyQuality(75));   // 'medium'
console.log(GeoPosition.getAccuracyQuality(150));  // 'bad'
console.log(GeoPosition.getAccuracyQuality(500));  // 'very bad'
```

**Since:** 0.5.0-alpha

---

#### `calculateAccuracyQuality()`

⚠️ **DEPRECATED**: Use the `accuracyQuality` property instead.

Convenience method that applies the static getAccuracyQuality() method to this instance's accuracy value.

**Returns:** `string` - Quality classification for current position accuracy

**Note:** This method has a bug - it calls undefined `getAccuracyQuality()` function instead of the static method. Use the `accuracyQuality` property which is automatically calculated and maintained.

**Since:** 0.5.0-alpha

---

#### `distanceTo(otherPosition)`

Calculates the distance between this position and another position using the Haversine formula.

**Parameters:**
- `otherPosition` (Object): Other position to calculate distance to
  - `latitude` (number): Latitude of other position in decimal degrees
  - `longitude` (number): Longitude of other position in decimal degrees

**Returns:** `number` - Distance in meters between the two positions

**Example:**
```javascript
const currentPosition = new GeoPosition(geolocationPosition);
const restaurant = { latitude: -23.5489, longitude: -46.6388 };
const distance = currentPosition.distanceTo(restaurant);
console.log(`Restaurant is ${Math.round(distance)} meters away`);
// Output: "Restaurant is 587 meters away"
```

**See Also:** 
- `calculateDistance()` - The underlying distance calculation utility function

**Since:** 0.5.0-alpha

---

#### `toString()`

Returns a string representation of the GeoPosition instance.

Provides a formatted summary of key position properties for debugging and logging purposes. Includes class name and essential position data following the same format as PositionManager.toString().

**Returns:** `string` - Formatted string with position details

**Format:** `"ClassName: latitude, longitude, accuracyQuality, altitude, speed, heading, timestamp"`

**Example:**
```javascript
const position = new GeoPosition(geolocationPosition);
console.log(position.toString());
// Output: "GeoPosition: -23.5505, -46.6333, good, 760, 0, 0, 1634567890123"

// When position data is missing
const invalidPosition = new GeoPosition(invalidGeolocationPosition);
console.log(invalidPosition.toString());
// Output: "GeoPosition: No position data"
```

**Since:** 0.5.0-alpha

## Testing

The `GeoPosition` class has comprehensive test coverage:

```bash
npm test -- __tests__/CurrentPosition.test.js
```

Test coverage includes:
- ✅ Constructor and property initialization
- ✅ toString() method with various data scenarios
- ✅ GeolocationPosition toString() enhancement
- ✅ Accuracy quality classification
- ✅ Handling of null/missing values
- ✅ Integration with PositionManager

## Design Considerations

### Referential Transparency and Immutability

As of version 0.5.0-alpha, the `GeoPosition` class is **designed to be referentially transparent and immutable**:

1. **No side effects**: The constructor does not log or mutate input objects
2. **Immutable properties**: All properties are set once at construction time
3. **No setters**: The accuracy setter has been removed to ensure immutability
4. **Defensive copying**: The constructor creates defensive copies of input objects to prevent shared mutable state
5. **Pure methods**: All methods (distanceTo, toString) are pure functions that depend only on their inputs

### Position Updates

For continuous position tracking, create new `GeoPosition` instances for each update rather than mutating existing instances. This ensures:
- Predictable behavior (referential transparency)
- Easier testing and debugging
- Thread-safety and concurrency-friendliness
- Compatibility with functional programming patterns

Example:
```javascript
// DON'T: Try to mutate (won't work as expected)
// position.accuracy = 20; // No setter exists

// DO: Create a new instance for updates
const newPosition = new GeoPosition(updatedBrowserPosition);
```

## Related Classes

- **[PositionManager](./POSITION_MANAGER.md)**: Singleton that uses GeoPosition to manage current device position
- **[GeolocationService](./CLASS_DIAGRAM.md)**: Wraps browser Geolocation API and creates GeoPosition instances
- **[ReverseGeocoder](./CLASS_DIAGRAM.md)**: Uses position coordinates to fetch address information

## Common Patterns

### Filtering by Accuracy Quality

```javascript
function isAcceptableAccuracy(position, isMobile = false) {
  const acceptable = isMobile 
    ? ['excellent', 'good']
    : ['excellent', 'good', 'medium'];
  
  return acceptable.includes(position.accuracyQuality);
}

// Usage
const position = new GeoPosition(browserPosition);
if (isAcceptableAccuracy(position, true)) {
  // Process high-accuracy position for mobile
  updateUserLocation(position);
}
```

### Distance Threshold Checking

```javascript
function isNearby(currentPosition, targetLocation, maxDistanceMeters = 100) {
  const distance = currentPosition.distanceTo(targetLocation);
  return distance <= maxDistanceMeters;
}

// Usage
const position = new GeoPosition(browserPosition);
const store = { latitude: -23.5505, longitude: -46.6333 };

if (isNearby(position, store, 50)) {
  console.log('You are near the store entrance!');
}
```

## Version History

- **0.5.0-alpha**: Referentially transparent implementation
  - **Breaking change**: Removed accuracy setter for immutability
  - **Breaking change**: Constructor no longer mutates input position object
  - **Breaking change**: Constructor no longer logs creation
  - Added defensive copying of position and coords objects
  - All properties now immutable (set once at construction)
  - All methods are pure functions (no side effects)
  - Static `getAccuracyQuality()` method (pure function)
  - Instance methods: `distanceTo()` (pure), `toString()` (pure)
  - Deprecated `calculateAccuracyQuality()` method (bug present, use property instead)

## Author

Marcelo Pereira Barbosa

## See Also

### Related Architecture Documentation
- [Class Diagram](./CLASS_DIAGRAM.md) - Overall system architecture
- [GEO_POSITION_FUNC_SPEC.md](./GEO_POSITION_FUNC_SPEC.md) - Functional specification for GeoPosition
- [WEB_GEOCODING_MANAGER.md](./WEB_GEOCODING_MANAGER.md) - Main geocoding coordination layer

### Testing and Quality
- [Testing Documentation](../TESTING.md) - Test suite and coverage
- [Device Detection](../DEVICE_DETECTION.md) - How accuracy quality affects position acceptance
- [TDD_GUIDE.md](../../.github/TDD_GUIDE.md) - Test-driven development
- [UNIT_TEST_GUIDE.md](../../.github/UNIT_TEST_GUIDE.md) - Unit testing practices

### Development Guidelines
- [REFERENTIAL_TRANSPARENCY.md](../../.github/REFERENTIAL_TRANSPARENCY.md) - Pure functions and immutability
- [CODE_REVIEW_GUIDE.md](../../.github/CODE_REVIEW_GUIDE.md) - Code review standards

### External References
- [MDN GeolocationPosition](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition)
- [MDN GeolocationCoordinates](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates)
