# JSDoc Documentation Standards

This guide defines the JSDoc documentation standards for the Guia.js project.

## Table of Contents

- [Core Principles](#core-principles)
- [Required Tags](#required-tags)
- [Common Patterns](#common-patterns)
- [Examples by Component Type](#examples-by-component-type)
- [Best Practices](#best-practices)
- [References](#references)

## Core Principles

1. **Document Public APIs**: All exported functions, classes, and methods must have JSDoc comments
2. **Be Descriptive**: Explain *what* the code does and *why* it exists, not just *how* it works
3. **Include Examples**: Provide usage examples for complex functions and classes
4. **Keep Updated**: Update documentation when code changes
5. **Follow Conventions**: Use consistent formatting and tag ordering

## Required Tags

### For All Documented Code

- `@module` or `@file` - File-level documentation describing the module's purpose
- `@since` - Version when the code was introduced (e.g., `0.6.0-alpha`)
- `@author` - Code author(s)

### For Functions and Methods

- `@param` - Parameter name, type, and description
- `@returns` - Return type and description
- `@throws` - Exceptions that may be thrown (if applicable)
- `@example` - Usage examples

### For Classes

- `@class` - Marks the function as a class
- `@constructor` - Documents constructor parameters
- `@property` - Instance properties (if not obvious from constructor)

### Optional But Recommended

- `@deprecated` - Marks deprecated code with migration instructions
- `@see` - References to related documentation
- `@private` - Marks internal-only code
- `@readonly` - Marks read-only properties
- `@immutable` - Documents immutability guarantees

## Common Patterns

### Module Documentation

```javascript
/**
 * Geographic position data wrapper with convenience methods.
 * 
 * Provides an immutable wrapper around browser Geolocation API position data,
 * adding convenience methods for distance calculations and accuracy assessment.
 * 
 * @module core/GeoPosition
 * @since 0.6.0-alpha
 * @author Marcelo Pereira Barbosa
 */
```

### Class Documentation

```javascript
/**
 * Represents a geographic position with enhanced methods.
 * 
 * This class wraps the browser's Geolocation API position object and provides
 * additional utility methods while maintaining immutability.
 * 
 * @class
 * @immutable All instances are frozen after creation
 * 
 * @example
 * const position = new GeoPosition({
 *   coords: {
 *     latitude: -23.5505,
 *     longitude: -46.6333,
 *     accuracy: 10
 *   },
 *   timestamp: Date.now()
 * });
 * console.log(position.accuracyQuality); // 'excellent'
 */
class GeoPosition {
  // ...
}
```

### Method Documentation

```javascript
/**
 * Classifies GPS accuracy into quality levels based on accuracy value in meters.
 * 
 * Provides a standardized way to assess the quality of GPS position data
 * based on the accuracy reported by the device. Lower values indicate better accuracy.
 * 
 * Quality Levels:
 * - excellent: ≤ 10 meters (high precision, suitable for all applications)
 * - good: 11-30 meters (good precision, suitable for most applications)  
 * - medium: 31-100 meters (moderate precision, may be acceptable for some uses)
 * - bad: 101-200 meters (poor precision, generally not recommended)
 * - very bad: > 200 meters (very poor precision, should be rejected)
 * 
 * @static
 * @param {number} accuracy - GPS accuracy value in meters from GeolocationCoordinates
 * @returns {string} Quality classification: 'excellent'|'good'|'medium'|'bad'|'very bad'
 * 
 * @example
 * // Classify different accuracy levels
 * console.log(GeoPosition.getAccuracyQuality(5));   // 'excellent'
 * console.log(GeoPosition.getAccuracyQuality(25));  // 'good'
 * console.log(GeoPosition.getAccuracyQuality(75));  // 'medium'
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates/accuracy}
 * @since 0.6.0-alpha
 */
static getAccuracyQuality(accuracy) {
  // Implementation...
}
```

### Constructor Documentation

```javascript
/**
 * Creates a chronometer instance for tracking position-related events.
 * 
 * @param {HTMLElement} element - DOM element where chronometer will be displayed
 * @param {Object} [eventConfig] - Configuration object for position events
 * @param {string} [eventConfig.positionUpdate='strCurrPosUpdate'] - Event name for successful position updates
 * @param {string} [eventConfig.immediateAddressUpdate='strImmediateAddressUpdate'] - Event name for immediate address updates  
 * @param {string} [eventConfig.positionNotUpdate='strCurrPosNotUpdate'] - Event name for rejected position updates
 * 
 * @example
 * const chrono = new Chronometer(document.getElementById('timer'), {
 *   positionUpdate: 'gps-updated',
 *   positionNotUpdate: 'gps-failed'
 * });
 */
constructor(element, eventConfig = {}) {
  // Implementation...
}
```

### Function Documentation

```javascript
/**
 * Calculates the great-circle distance between two geographic coordinates.
 * 
 * Uses the Haversine formula to compute the shortest distance over Earth's surface,
 * assuming a spherical Earth with radius of 6371 km.
 * 
 * @param {number} lat1 - Latitude of first point in decimal degrees
 * @param {number} lon1 - Longitude of first point in decimal degrees
 * @param {number} lat2 - Latitude of second point in decimal degrees
 * @param {number} lon2 - Longitude of second point in decimal degrees
 * @returns {number} Distance in meters (rounded to nearest meter)
 * 
 * @example
 * // Distance between São Paulo and Rio de Janeiro
 * const distance = calculateDistance(-23.5505, -46.6333, -22.9068, -43.1729);
 * console.log(distance); // Approximately 357000 meters (357 km)
 * 
 * @see {@link https://en.wikipedia.org/wiki/Haversine_formula} Haversine formula
 * @since 0.6.0-alpha
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  // Implementation...
}
```

## Examples by Component Type

### Singleton Pattern

```javascript
/**
 * Singleton manager for current geographic position state.
 * 
 * Maintains a single source of truth for the current position across the application.
 * Uses the singleton pattern to ensure only one instance exists.
 * 
 * @class
 * @singleton
 * 
 * @example
 * // Get singleton instance with initial position
 * const manager = PositionManager.getInstance(position);
 * 
 * // Get existing instance (returns same instance)
 * const sameManager = PositionManager.getInstance();
 * console.log(manager === sameManager); // true
 */
class PositionManager {
  /**
   * Gets the singleton instance of PositionManager.
   * 
   * @static
   * @param {Object} [position] - Initial position (only used on first call)
   * @returns {PositionManager} The singleton instance
   */
  static getInstance(position) {
    // Implementation...
  }
}
```

### Factory Pattern

```javascript
/**
 * Factory for creating display components based on configuration.
 * 
 * @class
 * 
 * @example
 * const factory = new DisplayerFactory();
 * const displayer = factory.createPositionDisplayer(document, 'map-container');
 */
class DisplayerFactory {
  /**
   * Creates a position displayer instance.
   * 
   * @param {Document} document - DOM document object
   * @param {string} elementId - ID of the container element
   * @returns {HTMLPositionDisplayer} Configured position displayer
   * @throws {Error} If element with elementId is not found
   */
  createPositionDisplayer(document, elementId) {
    // Implementation...
  }
}
```

### Service Classes

```javascript
/**
 * Wrapper for browser's Geolocation API with enhanced error handling.
 * 
 * Provides a consistent interface to geolocation services with:
 * - Dependency injection for testability
 * - Standardized error handling
 * - High-accuracy position requests
 * 
 * @class
 * 
 * @example
 * const service = new GeolocationService(navigator.geolocation);
 * 
 * service.getCurrentPosition(
 *   (position) => console.log('Location:', position.coords),
 *   (error) => console.error('Error:', error.message)
 * );
 */
class GeolocationService {
  /**
   * Creates a geolocation service instance.
   * 
   * @param {Geolocation} geolocation - Browser's geolocation API object (injected for testing)
   */
  constructor(geolocation) {
    // Implementation...
  }
}
```

### Utility Functions

```javascript
/**
 * Formats milliseconds into human-readable time string.
 * 
 * @param {number} milliseconds - Time duration in milliseconds
 * @returns {string} Formatted time string in HH:MM:SS format
 * 
 * @example
 * formatTime(3661000); // "01:01:01"
 * formatTime(90000);   // "00:01:30"
 * 
 * @private
 */
function formatTime(milliseconds) {
  // Implementation...
}
```

### Deprecated Code

```javascript
/**
 * Calculates the accuracy quality for the current position.
 * 
 * @returns {string} Quality classification for current position accuracy
 * 
 * @deprecated Use the `accuracyQuality` property instead - this method has a bug
 * @see GeoPosition#accuracyQuality
 * 
 * @example
 * // ❌ Old way (deprecated)
 * const quality = position.calculateAccuracyQuality();
 * 
 * // ✅ New way (recommended)
 * const quality = position.accuracyQuality;
 */
calculateAccuracyQuality() {
  // Implementation...
}
```

## Best Practices

### 1. Use TypeScript-Style Type Definitions

```javascript
/**
 * @param {Object} options - Configuration options
 * @param {string} options.url - API endpoint URL
 * @param {number} [options.timeout=5000] - Request timeout in milliseconds
 * @param {Object.<string, string>} [options.headers] - HTTP headers
 * @returns {Promise<Object>} API response data
 */
```

### 2. Document Optional Parameters

Use square brackets `[param]` for optional parameters:

```javascript
/**
 * @param {string} text - Required text parameter
 * @param {number} [priority=0] - Optional priority (default: 0)
 */
```

### 3. Document Complex Return Types

```javascript
/**
 * @returns {{latitude: number, longitude: number, accuracy: number}} Position coordinates
 */

/**
 * @returns {Array<{id: string, name: string}>} Array of location objects
 */

/**
 * @returns {Promise<GeoPosition>} Promise resolving to position data
 */
```

### 4. Use @see for Related Documentation

```javascript
/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Geolocation} Geolocation API
 * @see GeoPosition For the wrapper class
 * @see calculateDistance For distance calculations
 */
```

### 5. Include Practical Examples

```javascript
/**
 * @example
 * // Basic usage
 * const result = myFunction('input');
 * 
 * @example
 * // Advanced usage with options
 * const result = myFunction('input', {
 *   option1: true,
 *   option2: 'value'
 * });
 */
```

### 6. Document Immutability Guarantees

```javascript
/**
 * @class
 * @immutable All instances are frozen after creation
 * @readonly All properties are read-only
 */
```

### 7. Use @throws for Error Conditions

```javascript
/**
 * @param {string} elementId - Element ID
 * @returns {HTMLElement} The DOM element
 * @throws {Error} If element is not found in document
 * @throws {TypeError} If elementId is not a string
 */
```

## Tag Ordering Convention

Maintain consistent tag ordering for readability:

1. Description (no tag)
2. `@class`, `@function`, `@module`, etc.
3. `@static`, `@private`, `@readonly`, `@immutable`
4. `@param` (in parameter order)
5. `@returns`
6. `@throws`
7. `@example`
8. `@see`
9. `@deprecated`
10. `@since`
11. `@author`

## References

- [JSDoc Official Documentation](https://jsdoc.app/)
- [TypeScript JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [Google JavaScript Style Guide - Comments](https://google.github.io/styleguide/jsguide.html#jsdoc)
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## Related Documentation

- [Contributing Guide](CONTRIBUTING.md) - General contribution guidelines
- [JavaScript Best Practices](JAVASCRIPT_BEST_PRACTICES.md) - Coding standards
- [Referential Transparency Guide](REFERENTIAL_TRANSPARENCY.md) - Functional programming principles

---

**Version**: 0.6.0-alpha  
**Last Updated**: 2026-01-01
