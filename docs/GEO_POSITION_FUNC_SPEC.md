# GeoPosition Class - Functional Specification

## Document Information

- **Version**: 1.0.0
- **Last Updated**: January 2025
- **Status**: Final
- **Purpose**: Language-agnostic functional specification for GeoPosition class implementation
- **Target Audience**: Developers implementing GeoPosition in other programming languages

## Overview

The GeoPosition class is a data wrapper and utility class that encapsulates geographic position information obtained from device geolocation systems (GPS, WiFi, cell tower triangulation, etc.). It provides standardized access to position coordinates, automatic quality classification, and distance calculation capabilities.

## Purpose and Motivation

### Problem Statement

Modern geolocation APIs (such as browser Geolocation API, mobile device GPS) provide position data in complex nested structures with multiple properties. Direct manipulation of these structures leads to:
- Verbose and repetitive code
- Inconsistent data access patterns
- Lack of standardized quality assessment
- Missing utility functions for common operations

### Solution

The GeoPosition class addresses these issues by:
- Providing a flattened, simplified data structure
- Automatically classifying position accuracy into standardized quality levels
- Offering utility methods for common geolocation operations
- Ensuring consistent string representations for debugging and logging

## Core Responsibilities

1. **Data Extraction**: Extract and flatten geographic coordinates from nested geolocation data structures
2. **Quality Classification**: Automatically assess and categorize GPS accuracy quality
3. **Distance Calculation**: Compute great-circle distances between geographic points
4. **Data Validation**: Handle missing or invalid position data gracefully
5. **String Representation**: Provide consistent, readable output for logging and debugging

## Functional Requirements

### FR-1: Constructor and Initialization

**Description**: Create a new GeoPosition instance from a geolocation position object.

**Input**:
- A position object containing:
  - `coords` (object): Nested coordinates object with:
    - `latitude` (number): Latitude in decimal degrees (-90 to 90)
    - `longitude` (number): Longitude in decimal degrees (-180 to 180)
    - `accuracy` (number): Horizontal accuracy in meters (≥ 0)
    - `altitude` (number or null): Altitude in meters above sea level
    - `altitudeAccuracy` (number or null): Vertical accuracy in meters
    - `heading` (number or null): Direction of travel in degrees (0-360, null if stationary)
    - `speed` (number or null): Speed in meters per second (≥ 0, null if stationary)
  - `timestamp` (number): Unix timestamp in milliseconds when position was acquired

**Output**:
- A GeoPosition instance with all properties extracted and initialized

**Behavior**:
- Extract all coordinate properties from nested structure
- Store reference to original position object
- Calculate and assign accuracy quality classification
- Log creation event with position summary

**Validation**:
- No validation required during construction
- Null and undefined values are preserved as-is
- Invalid numeric values are not rejected (handled by display logic)

**Side Effects**:
- Modifies original position object by adding a toString() method to it
- Logs creation message to application logging system

---

### FR-2: Accuracy Quality Classification (Static)

**Description**: Classify GPS accuracy into standardized quality levels based on accuracy value in meters.

**Input**:
- `accuracy` (number): GPS accuracy value in meters (typically 0-10000)

**Output**:
- `string`: One of five quality classifications:
  - "excellent"
  - "good"
  - "medium"
  - "bad"
  - "very bad"

**Classification Logic**:

| Accuracy Range (meters) | Quality Level | Description |
|-------------------------|---------------|-------------|
| accuracy ≤ 10 | "excellent" | High precision GPS signal |
| 10 < accuracy ≤ 30 | "good" | Good precision, suitable for most applications |
| 30 < accuracy ≤ 100 | "medium" | Moderate precision, WiFi-based location |
| 100 < accuracy ≤ 200 | "bad" | Poor precision, cell tower based |
| accuracy > 200 | "very bad" | Very poor precision, IP-based location |

**Algorithm**:
```
function classifyAccuracy(accuracy):
    if accuracy <= 10:
        return "excellent"
    else if accuracy <= 30:
        return "good"
    else if accuracy <= 100:
        return "medium"
    else if accuracy <= 200:
        return "bad"
    else:
        return "very bad"
```

**Edge Cases**:
- Negative values: Not expected, but would fall into "very bad" category
- Zero: Returns "excellent" (perfect accuracy, theoretical)
- Very large values (>10000): Returns "very bad"
- NaN or undefined: Implementation-specific handling required

---

### FR-3: Distance Calculation

**Description**: Calculate the great-circle distance between this position and another geographic point using the Haversine formula.

**Input**:
- Current position:
  - `latitude` (number): Latitude of current position in decimal degrees
  - `longitude` (number): Longitude of current position in decimal degrees
- Other position (object):
  - `latitude` (number): Latitude of target position in decimal degrees
  - `longitude` (number): Longitude of target position in decimal degrees

**Output**:
- `number`: Distance in meters between the two positions

**Algorithm - Haversine Formula**:
```
Given:
- lat1, lon1: coordinates of position 1 (in decimal degrees)
- lat2, lon2: coordinates of position 2 (in decimal degrees)
- R = 6371000 meters (Earth's mean radius)

Process:
1. Convert all coordinates from degrees to radians:
   lat1_rad = lat1 * π / 180
   lon1_rad = lon1 * π / 180
   lat2_rad = lat2 * π / 180
   lon2_rad = lon2 * π / 180

2. Calculate differences:
   Δlat = lat2_rad - lat1_rad
   Δlon = lon2_rad - lon1_rad

3. Apply Haversine formula:
   a = sin²(Δlat/2) + cos(lat1_rad) * cos(lat2_rad) * sin²(Δlon/2)
   c = 2 * atan2(√a, √(1-a))
   distance = R * c

Return: distance (in meters)
```

**Mathematical Details**:
- **sin²(x)**: Sine of x, squared
- **cos(x)**: Cosine of x
- **atan2(y, x)**: Two-argument arctangent function
- **√**: Square root

**Edge Cases**:
- Same position (distance = 0): Should return 0 or near-zero value
- Antipodal points (opposite sides of Earth): Should return ~20,037 km
- Null/undefined coordinates: Implementation-specific error handling required
- Invalid coordinates (out of range): Implementation-specific error handling required

**Accuracy Notes**:
- Assumes Earth is a perfect sphere (R = 6371 km)
- Accurate to within 0.5% for most terrestrial distances
- Less accurate for very short distances (<1 meter) due to rounding
- Not suitable for precise surveying or navigation requiring sub-meter accuracy

---

### FR-4: Accuracy Setter with Automatic Quality Update

**Description**: Update position accuracy value and automatically recalculate quality classification.

**Input**:
- `value` (number): New accuracy value in meters

**Output**:
- None (setter method)

**Behavior**:
1. Store accuracy value in internal property
2. Automatically invoke accuracy quality classification logic
3. Update accuracyQuality property with new classification

**Side Effects**:
- Updates two properties: internal accuracy storage and accuracyQuality

**Synchronization Requirement**:
- The accuracy value and accuracyQuality must always be consistent
- When accuracy changes, accuracyQuality MUST be updated immediately

---

### FR-5: String Representation

**Description**: Generate a human-readable string representation of the position for debugging and logging.

**Input**:
- Current GeoPosition instance state

**Output**:
- `string`: Formatted position information

**Format Specification**:
```
"ClassName: latitude, longitude, accuracyQuality, altitude, speed, heading, timestamp"
```

**Examples**:
```
Valid position:
"GeoPosition: -23.5505, -46.6333, good, 760, 0, 0, 1634567890123"

Missing coordinates:
"GeoPosition: No position data"
```

**Formatting Rules**:
1. Start with class name followed by colon and space
2. If latitude or longitude is null/undefined/0, return "ClassName: No position data"
3. Otherwise, format all properties in order, comma-separated:
   - latitude (as-is, decimal number)
   - longitude (as-is, decimal number)
   - accuracyQuality (string)
   - altitude (number or null)
   - speed (number or null)
   - heading (number or null)
   - timestamp (number, Unix milliseconds)

**Missing Data Handling**:
- Null values: Display as "null" or implementation's null representation
- Undefined values: Display as "undefined" or similar
- Zero values: Display as "0"

---

### FR-6: Instance Accuracy Quality Calculation (Deprecated)

**Description**: Calculate accuracy quality for current instance's accuracy value.

**Status**: DEPRECATED - Use the accuracyQuality property instead

**Reason for Deprecation**: This method contains a bug (calls undefined function instead of static method). The accuracyQuality property is automatically maintained and should be used instead.

**Input**: None (uses instance's accuracy property)

**Output**: `string` - Quality classification

**Behavior**: Apply static accuracy quality classification to instance's accuracy value

**Recommendation**: Implementations should either:
- Not implement this method
- Mark it as deprecated with warning
- Fix the bug if implementing for compatibility

## Data Model

### Properties

| Property | Type | Nullable | Description |
|----------|------|----------|-------------|
| geolocationPosition | object | No | Original position object from geolocation API |
| coords | object | No | Reference to coords property of original object |
| latitude | number | Yes | Latitude in decimal degrees (-90 to 90) |
| longitude | number | Yes | Longitude in decimal degrees (-180 to 180) |
| accuracy | number | Yes | Horizontal accuracy in meters |
| accuracyQuality | string | No | Quality classification (excellent/good/medium/bad/very bad) |
| altitude | number | Yes | Altitude in meters above sea level |
| altitudeAccuracy | number | Yes | Vertical accuracy in meters |
| heading | number | Yes | Direction of travel in degrees (0-360) |
| speed | number | Yes | Speed in meters per second |
| timestamp | number | No | Unix timestamp in milliseconds |

### Coordinate System

- **Latitude**: Decimal degrees, positive = North, negative = South, range: -90 to 90
- **Longitude**: Decimal degrees, positive = East, negative = West, range: -180 to 180
- **Altitude**: Meters above mean sea level, can be negative (below sea level)
- **Heading**: Degrees clockwise from true north, range: 0 to 360
- **Speed**: Meters per second, always ≥ 0
- **Accuracy**: Meters, represents horizontal margin of error, always ≥ 0

## Validation Rules

### V-1: Coordinate Validation
- Latitude must be between -90 and 90 degrees
- Longitude must be between -180 and 180 degrees
- **Note**: GeoPosition class does NOT enforce validation (handled by geolocation API)

### V-2: Accuracy Validation
- Accuracy should be a positive number
- Accuracy of 0 represents perfect accuracy (theoretical)
- **Note**: Negative accuracy is not expected but not explicitly rejected

### V-3: Null Handling
- Null values are preserved and passed through
- No errors thrown for null position properties
- toString() method handles null gracefully

### V-4: Missing Data Handling
- Missing coordinates result in "No position data" message
- Other missing properties (altitude, speed, etc.) are acceptable
- Application logic should check for null values before using data

## Quality Classification Use Cases

### UC-1: Mobile Device Position Validation
**Context**: Mobile device with GPS hardware
**Acceptance Criteria**:
- "excellent" (≤10m): Always accepted
- "good" (11-30m): Always accepted
- "medium" (31-100m): Typically rejected (GPS should be better)
- "bad" (101-200m): Always rejected
- "very bad" (>200m): Always rejected

### UC-2: Desktop Device Position Validation
**Context**: Desktop computer with WiFi/IP-based location
**Acceptance Criteria**:
- "excellent" (≤10m): Always accepted
- "good" (11-30m): Always accepted
- "medium" (31-100m): Accepted (typical for WiFi)
- "bad" (101-200m): Rejected
- "very bad" (>200m): Rejected

### UC-3: Position Update Filtering
**Context**: Continuous position tracking with quality control
**Logic**:
1. Receive new position
2. Create GeoPosition instance
3. Check accuracyQuality property
4. Accept or reject based on device type and quality thresholds
5. If accepted, update application state

## Distance Calculation Use Cases

### UC-4: Proximity Detection
**Scenario**: Determine if user is near a point of interest
**Process**:
1. Create GeoPosition from user's current location
2. Call distanceTo() with point of interest coordinates
3. Compare result with threshold (e.g., 100 meters)
4. Trigger notification if within threshold

### UC-5: Movement Detection
**Scenario**: Detect when user has moved significantly
**Process**:
1. Store previous GeoPosition
2. Receive new position data
3. Create new GeoPosition
4. Calculate distance using distanceTo(previousPosition)
5. If distance > threshold (e.g., 50 meters), consider it significant movement

### UC-6: Distance Display
**Scenario**: Show distance to destinations
**Process**:
1. Get user's current GeoPosition
2. For each destination, call distanceTo(destination)
3. Format and display distances (e.g., "587 meters away")

## Implementation Considerations

### Immutability
- **Design Decision**: GeoPosition is NOT immutable (not frozen/sealed)
- **Rationale**: 
  - Position data updates frequently in real-time tracking
  - Accuracy setter needs to function properly
  - Integration with mutable browser/device APIs
  - Performance considerations for frequent updates

### Side Effects
- Constructor modifies original position object (adds toString method)
- Constructor logs creation message
- Both side effects are intentional for debugging purposes

### Performance
- Object creation should be lightweight (no heavy computation)
- Distance calculation (Haversine) is moderately expensive (trigonometry)
- For high-frequency updates, consider caching distance calculations

### Thread Safety
- Class is not inherently thread-safe
- If used in concurrent environment, external synchronization required
- Position updates should be synchronized by application logic

### Error Handling
- Constructor does not throw exceptions for invalid data
- Invalid/missing data is preserved as-is
- Validation and error handling is responsibility of caller

## Integration Points

### Input Sources
- Browser Geolocation API (GeolocationPosition object)
- Mobile device GPS systems
- Desktop WiFi/IP geolocation services
- Simulated/mock position data for testing

### Output Consumers
- PositionManager (singleton position management)
- GeolocationService (position tracking service)
- ReverseGeocoder (coordinate to address conversion)
- UI display components
- Logging and debugging systems

## Testing Requirements

### Test Categories

1. **Constructor Tests**
   - Valid position object with all properties
   - Position with null/undefined properties
   - Position with edge case values (equator, poles, date line)

2. **Accuracy Classification Tests**
   - Boundary values (10m, 30m, 100m, 200m)
   - Values just above and below boundaries
   - Zero accuracy
   - Very large accuracy values (>10000m)

3. **Distance Calculation Tests**
   - Same location (distance = 0)
   - Known distances (validate against reference)
   - Short distances (<100m)
   - Long distances (>1000km)
   - Cross-meridian calculations

4. **String Representation Tests**
   - Valid position with all data
   - Position with missing coordinates
   - Position with null values

5. **Accuracy Setter Tests**
   - Set accuracy and verify quality update
   - Verify synchronization between accuracy and accuracyQuality

### Test Data Examples

**Valid Position** (São Paulo, Brazil):
```
{
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
}
```

**Invalid/Missing Position**:
```
{
  coords: {
    latitude: null,
    longitude: null,
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null
  },
  timestamp: 1634567890123
}
```

**Accuracy Boundary Test Values**:
- 10 → "excellent"
- 10.1 → "good"
- 30 → "good"
- 30.1 → "medium"
- 100 → "medium"
- 100.1 → "bad"
- 200 → "bad"
- 200.1 → "very bad"

## Dependencies

### Required External Functions
- `calculateDistance(lat1, lon1, lat2, lon2)`: Haversine distance calculation
  - Must be implemented separately as utility function
  - Returns distance in meters

### Required External Side Effects
- `log(message, ...params)`: Logging function
  - Used in constructor to log creation event
  - Handles both console and DOM logging

### Mathematical Dependencies
- Trigonometric functions: sin, cos, atan2, sqrt
- Mathematical constant: π (pi)
- Degree to radian conversion: π/180

## Version History

- **Version 0.5.0-alpha**: Initial implementation
  - Constructor with property extraction
  - Static getAccuracyQuality() method
  - Instance methods: distanceTo(), toString()
  - Accuracy setter with automatic quality calculation
  - Deprecated calculateAccuracyQuality() method (contains bug)

## References

### Standards and APIs
- [W3C Geolocation API Specification](https://www.w3.org/TR/geolocation-API/)
- [MDN GeolocationPosition](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition)
- [MDN GeolocationCoordinates](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates)

### Mathematical References
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [Great-circle distance](https://en.wikipedia.org/wiki/Great-circle_distance)
- WGS84 Earth ellipsoid model

### Related Documentation
- GEO_POSITION.md: Implementation documentation and usage examples
- CLASS_DIAGRAM.md: Architecture and class relationships
- DEVICE_DETECTION.md: Quality thresholds by device type
- TESTING.md: Test suite documentation

## Glossary

- **Accuracy**: The margin of error for geographic coordinates, in meters
- **Geolocation**: The process of determining geographic position of a device
- **GPS**: Global Positioning System, satellite-based navigation system
- **Haversine Formula**: Mathematical formula for calculating great-circle distances
- **Great-circle Distance**: Shortest distance between two points on a sphere
- **Decimal Degrees**: Coordinate system using decimal numbers (vs degrees/minutes/seconds)
- **Unix Timestamp**: Number of milliseconds since January 1, 1970 UTC
- **Referential Transparency**: Property where a function always returns same output for same input
- **Quality Classification**: Categorization of GPS accuracy into discrete levels

## Implementation Checklist

When implementing GeoPosition in a new language:

- [ ] Create constructor accepting nested position object
- [ ] Extract and flatten all coordinate properties
- [ ] Implement static accuracy quality classification with exact thresholds
- [ ] Implement distance calculation using Haversine formula
- [ ] Implement accuracy setter with automatic quality update
- [ ] Implement toString() method with specified format
- [ ] Handle null/undefined values gracefully
- [ ] Add logging for position creation (if applicable)
- [ ] Write comprehensive unit tests for all functionality
- [ ] Validate against reference implementation (JavaScript)
- [ ] Document any language-specific considerations
- [ ] Test integration with position management system

## Contact

For questions about this specification:
- Review the reference implementation in src/guia.js
- Check existing documentation in docs/GEO_POSITION.md
- Consult the test suite in __tests__/CurrentPosition.test.js

---

**Document Status**: This is a living document. Updates should be made when functional requirements change or clarifications are needed.
