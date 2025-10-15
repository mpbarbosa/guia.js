# JavaScript Module Splitting Guide

## Table of Contents

- [Overview](#overview)
- [What are JavaScript Modules?](#what-are-javascript-modules)
- [Benefits of Modularization](#benefits-of-modularization)
- [Module Systems in JavaScript](#module-systems-in-javascript)
- [ES6 Modules (ESM)](#es6-modules-esm)
- [CommonJS Modules](#commonjs-modules)
- [Strategies for Splitting Code](#strategies-for-splitting-code)
- [Maintaining Referential Transparency](#maintaining-referential-transparency)
- [Practical Examples from Guia.js](#practical-examples-from-guiajs)
- [Migration Strategies](#migration-strategies)
- [Testing Modular Code](#testing-modular-code)
- [Best Practices](#best-practices)
- [Common Pitfalls](#common-pitfalls)
- [Tools and Automation](#tools-and-automation)
- [References](#references)

## Overview

This guide provides comprehensive instructions for splitting large JavaScript files into smaller, focused modules. Following modular design principles improves code maintainability, testability, and reusability while aligning with the project's core principles of **referential transparency**, **high cohesion**, and **low coupling**.

### Why This Guide?

The Guia.js project currently has a 6,000+ line `guia.js` file containing 25+ classes. While functional, this monolithic structure:
- Makes code harder to navigate and understand
- Increases merge conflicts in team environments
- Complicates testing individual components
- Reduces code reusability across projects

This guide shows how to split such files into focused, maintainable modules.

### Guiding Principles

1. **Single Responsibility**: Each module should have one clear purpose
2. **High Cohesion**: Related functionality stays together
3. **Low Coupling**: Minimize dependencies between modules
4. **Referential Transparency**: Preserve pure function characteristics
5. **Testability**: Enable isolated unit testing

## What are JavaScript Modules?

**JavaScript modules** are self-contained units of code that encapsulate related functionality and expose only what's necessary through exports. Modules provide:

- **Encapsulation**: Private implementation details
- **Explicit Dependencies**: Clear import/export statements
- **Namespace Management**: Avoid global variable pollution
- **Code Organization**: Logical grouping of functionality

### Module Anatomy

A typical JavaScript module consists of:

```javascript
// 1. Imports (dependencies)
import { dependency1 } from './dependency1.js';
import { dependency2 } from './dependency2.js';

// 2. Private implementation (not exported)
const privateHelper = () => {
  // Internal logic
};

// 3. Public API (exported)
export const publicFunction = () => {
  return privateHelper();
};

export class PublicClass {
  // Class implementation
}
```

## Benefits of Modularization

### 1. Improved Maintainability

**Before** (monolithic):
```javascript
// guia.js - 6,000 lines
class GeoPosition { /* ... */ }
class PositionManager { /* ... */ }
class ReverseGeocoder { /* ... */ }
// ... 20+ more classes
```

**After** (modular):
```javascript
// src/models/GeoPosition.js - 50 lines
export class GeoPosition { /* ... */ }

// src/managers/PositionManager.js - 100 lines  
export class PositionManager { /* ... */ }

// src/services/ReverseGeocoder.js - 80 lines
export class ReverseGeocoder { /* ... */ }
```

**Benefits**:
- Find code faster (clear file names)
- Smaller files are easier to read
- Changes are localized to relevant modules
- Reduces cognitive load

### 2. Enhanced Reusability

Modules can be reused across projects:

```javascript
// Use the same GeoPosition class in multiple projects
import { GeoPosition } from '@guia/models/GeoPosition.js';

// Works in web app
const webPosition = new GeoPosition(coords);

// Works in Node.js script
const serverPosition = new GeoPosition(coords);
```

### 3. Better Testability

**Before** (monolithic):
```javascript
// Hard to test - need entire 6,000-line file
const guia = require('./guia.js');
// Which class am I testing?
```

**After** (modular):
```javascript
// Test only what you need
import { calculateDistance } from '../src/utils/distance.js';

describe('calculateDistance', () => {
  test('calculates distance between São Paulo and Rio', () => {
    const distance = calculateDistance(-23.5505, -46.6333, -22.9068, -43.1729);
    expect(distance).toBeCloseTo(357710, 0);
  });
});
```

### 4. Parallel Development

Multiple developers can work on different modules simultaneously without conflicts:

```javascript
// Developer A works on:
src/services/GeolocationService.js

// Developer B works on:
src/services/ReverseGeocoder.js

// No merge conflicts!
```

### 5. Performance Optimization

Modern bundlers can:
- **Tree-shake** unused exports
- **Code-split** for lazy loading
- **Cache** individual modules

```javascript
// Only import what you need - bundler removes unused code
import { calculateDistance } from './utils.js';
// geocodeAddress() is tree-shaken if not imported
```

## Module Systems in JavaScript

JavaScript has two primary module systems:

### 1. ES6 Modules (ESM)
- **Standard**: Official ECMAScript standard (2015+)
- **Environment**: Modern browsers, Node.js 12+
- **Syntax**: `import`/`export`
- **Loading**: Asynchronous
- **File Extension**: `.js` or `.mjs`

### 2. CommonJS (CJS)
- **Standard**: De facto Node.js standard
- **Environment**: Node.js, bundlers (webpack, browserify)
- **Syntax**: `require()`/`module.exports`
- **Loading**: Synchronous
- **File Extension**: `.js` or `.cjs`

### Comparison Table

| Feature | ES6 Modules | CommonJS |
|---------|-------------|----------|
| **Syntax** | `import`/`export` | `require()`/`module.exports` |
| **Environment** | Browser + Node.js | Node.js + bundlers |
| **Loading** | Asynchronous | Synchronous |
| **Tree Shaking** | ✅ Yes | ❌ No |
| **Static Analysis** | ✅ Yes | ❌ No |
| **Browser Support** | ✅ Modern browsers | ❌ Needs bundler |
| **Node.js Support** | ✅ v12+ | ✅ All versions |
| **Future** | ✅ Standard | ⚠️ Legacy |

### Which to Use?

**For Guia.js (web + Node.js):**
- **Primary**: ES6 modules (modern standard)
- **Testing**: CommonJS for Jest compatibility
- **Strategy**: Write ES6, transpile for compatibility


## ES6 Modules (ESM)

ES6 modules are the modern JavaScript standard for organizing code.

### Basic Syntax

#### Named Exports

```javascript
// utils/distance.js
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const getOpenStreetMapUrl = (latitude, longitude) => 
  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
```

**Import named exports:**

```javascript
// app.js
import { calculateDistance, getOpenStreetMapUrl } from './utils/distance.js';

const distance = calculateDistance(-23.5505, -46.6333, -22.9068, -43.1729);
const url = getOpenStreetMapUrl(-23.5505, -46.6333);
```

#### Default Exports

```javascript
// models/GeoPosition.js
export default class GeoPosition {
  constructor(latitude, longitude, accuracy) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.accuracy = accuracy;
  }

  toString() {
    return `(${this.latitude}, ${this.longitude})`;
  }
}
```

**Import default export:**

```javascript
// app.js
import GeoPosition from './models/GeoPosition.js';

const position = new GeoPosition(-23.5505, -46.6333, 10);
```

#### Mixed Exports

```javascript
// services/geocoder.js
export class ReverseGeocoder {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }
}

export const DEFAULT_API_URL = 'https://nominatim.openstreetmap.org/reverse';

export default ReverseGeocoder;
```

**Import mixed exports:**

```javascript
import ReverseGeocoder, { DEFAULT_API_URL } from './services/geocoder.js';
// or
import { ReverseGeocoder as Geocoder, DEFAULT_API_URL } from './services/geocoder.js';
```

### Advanced Import Patterns

#### Namespace Import

```javascript
// Import everything from a module
import * as Distance from './utils/distance.js';

const dist = Distance.calculateDistance(-23.5505, -46.6333, -22.9068, -43.1729);
const url = Distance.getOpenStreetMapUrl(-23.5505, -46.6333);
```

#### Aliased Imports

```javascript
// Rename imports to avoid conflicts
import { calculateDistance as calcDist } from './utils/distance.js';
import { calculateDistance as haversineDistance } from './utils/haversine.js';

const dist1 = calcDist(lat1, lon1, lat2, lon2);
const dist2 = haversineDistance(lat1, lon1, lat2, lon2);
```

#### Re-exports

```javascript
// utils/index.js - Barrel file pattern
export { calculateDistance, getOpenStreetMapUrl } from './distance.js';
export { log, warn } from './logger.js';
export { delay } from './async.js';

// Now import from single entry point:
import { calculateDistance, log, delay } from './utils/index.js';
```

### ES6 Module Characteristics

#### Static Structure

ES6 modules are **statically analyzable** - imports/exports are determined at parse time:

```javascript
// ✅ Good: Static import (can be analyzed)
import { calculateDistance } from './utils/distance.js';

// ❌ Bad: Dynamic import in conditional (use dynamic import() for this)
if (needsDistance) {
  import { calculateDistance } from './utils/distance.js'; // Syntax error!
}

// ✅ Good: Dynamic import for conditional loading
if (needsDistance) {
  const { calculateDistance } = await import('./utils/distance.js');
}
```

#### Singleton Modules

Modules are **singletons** - imported once and cached:

```javascript
// counter.js
let count = 0;
export const increment = () => ++count;
export const getCount = () => count;

// file1.js
import { increment, getCount } from './counter.js';
increment();
console.log(getCount()); // 1

// file2.js
import { getCount } from './counter.js';
console.log(getCount()); // 1 (same instance!)
```

#### Live Bindings

Exports are **live bindings** - changes reflect in importers:

```javascript
// counter.js
export let count = 0;
export const increment = () => { count++; };

// app.js
import { count, increment } from './counter.js';
console.log(count); // 0
increment();
console.log(count); // 1 (updated!)
```

## CommonJS Modules

CommonJS is the traditional Node.js module system.

### Basic Syntax

#### Exporting

```javascript
// utils/distance.js
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const getOpenStreetMapUrl = (latitude, longitude) => 
  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

// Named exports
module.exports = {
  calculateDistance,
  getOpenStreetMapUrl
};

// Or individual exports
exports.calculateDistance = calculateDistance;
exports.getOpenStreetMapUrl = getOpenStreetMapUrl;
```

#### Importing

```javascript
// app.js
const { calculateDistance, getOpenStreetMapUrl } = require('./utils/distance.js');

const distance = calculateDistance(-23.5505, -46.6333, -22.9068, -43.1729);
const url = getOpenStreetMapUrl(-23.5505, -46.6333);
```

#### Default Export Pattern

```javascript
// models/GeoPosition.js
class GeoPosition {
  constructor(latitude, longitude, accuracy) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.accuracy = accuracy;
  }
}

module.exports = GeoPosition;

// app.js
const GeoPosition = require('./models/GeoPosition.js');
const position = new GeoPosition(-23.5505, -46.6333, 10);
```

### CommonJS Characteristics

#### Synchronous Loading

CommonJS loads modules **synchronously**:

```javascript
// Blocks until module is loaded
const distance = require('./utils/distance.js');
console.log('Module loaded'); // Runs after module loads
```

#### Dynamic Imports

Can use `require()` conditionally:

```javascript
// ✅ Works: Dynamic require
let calculator;
if (needsDistance) {
  calculator = require('./utils/distance.js');
}
```

#### Value Copies

CommonJS exports are **value copies**, not live bindings:

```javascript
// counter.js
let count = 0;
const increment = () => { count++; };
module.exports = { count, increment };

// app.js
const { count, increment } = require('./counter.js');
console.log(count); // 0
increment();
console.log(count); // 0 (still 0 - not live binding!)
```


## Strategies for Splitting Code

### 1. Split by Layer (Architectural Pattern)

Organize code by architectural responsibility:

```
src/
├── models/              # Domain models
│   ├── GeoPosition.js
│   └── Address.js
├── services/            # External integrations
│   ├── GeolocationService.js
│   └── ReverseGeocoder.js
├── managers/            # Business logic coordinators
│   ├── PositionManager.js
│   └── WebGeocodingManager.js
├── presenters/          # UI/Display logic
│   ├── HTMLPositionDisplayer.js
│   └── HTMLAddressDisplayer.js
└── utils/               # Shared utilities
    ├── distance.js
    └── logger.js
```

**Example for Guia.js:**

```javascript
// src/models/GeoPosition.js
export class GeoPosition {
  constructor({ latitude, longitude, accuracy, altitude, heading, speed, timestamp }) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.accuracy = accuracy;
    this.altitude = altitude;
    this.heading = heading;
    this.speed = speed;
    this.timestamp = timestamp;
  }

  distanceTo(other) {
    return calculateDistance(
      this.latitude, this.longitude,
      other.latitude, other.longitude
    );
  }
}

// src/services/ReverseGeocoder.js
import { getOpenStreetMapUrl } from '../utils/urls.js';

export class ReverseGeocoder {
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.apiUrl = getOpenStreetMapUrl(latitude, longitude);
  }

  async fetch() {
    const response = await fetch(this.apiUrl);
    return response.json();
  }
}
```

### 2. Split by Feature (Domain-Driven Design)

Organize by business domain or feature:

```
src/
├── geolocation/
│   ├── GeoPosition.js
│   ├── GeolocationService.js
│   ├── PositionManager.js
│   └── index.js
├── geocoding/
│   ├── ReverseGeocoder.js
│   ├── AddressExtractor.js
│   ├── AddressCache.js
│   └── index.js
├── display/
│   ├── PositionDisplayer.js
│   ├── AddressDisplayer.js
│   └── index.js
└── utils/
    ├── distance.js
    └── logger.js
```

**Example barrel file:**

```javascript
// src/geolocation/index.js
export { GeoPosition } from './GeoPosition.js';
export { GeolocationService } from './GeolocationService.js';
export { PositionManager } from './PositionManager.js';

// Usage:
import { GeoPosition, PositionManager } from './geolocation/index.js';
```

### 3. Split by Responsibility (Single Responsibility Principle)

Each file should have ONE reason to change:

```javascript
// ❌ Bad: Multiple responsibilities in one file
// services/geocoding.js
export class ReverseGeocoder { /* ... */ }
export class AddressParser { /* ... */ }
export class AddressValidator { /* ... */ }
export class AddressFormatter { /* ... */ }
export class AddressCache { /* ... */ }

// ✅ Good: One responsibility per file
// services/ReverseGeocoder.js
export class ReverseGeocoder { /* ... */ }

// parsers/AddressParser.js
export class AddressParser { /* ... */ }

// validators/AddressValidator.js
export class AddressValidator { /* ... */ }

// formatters/AddressFormatter.js  
export class AddressFormatter { /* ... */ }

// caching/AddressCache.js
export class AddressCache { /* ... */ }
```

### 4. Extract Utilities and Constants

Move shared utilities and constants to dedicated modules:

```javascript
// config/constants.js
export const EARTH_RADIUS_METERS = 6371e3;
export const DEFAULT_TRACKING_INTERVAL = 50000;
export const MINIMUM_DISTANCE_CHANGE = 20;

export const ACCURACY_THRESHOLDS = {
  mobile: ['medium', 'bad', 'very bad'],
  desktop: ['bad', 'very bad']
};

// utils/distance.js
import { EARTH_RADIUS_METERS } from '../config/constants.js';

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = EARTH_RADIUS_METERS;
  // ... implementation
};

// utils/logger.js
export const log = (message, ...params) => {
  console.log(`[${new Date().toISOString()}]`, message, ...params);
};

export const warn = (message, ...params) => {
  console.warn(`[${new Date().toISOString()}]`, message, ...params);
};
```

### 5. Progressive Refactoring

Don't split everything at once. Start with:

**Phase 1**: Extract utilities (lowest risk)
```javascript
// Easy wins - pure functions, no dependencies
utils/distance.js
utils/logger.js
utils/async.js
```

**Phase 2**: Extract models (low risk)
```javascript
// Simple data structures
models/GeoPosition.js
models/Address.js
```

**Phase 3**: Extract services (medium risk)
```javascript
// External integrations
services/ReverseGeocoder.js
services/GeolocationService.js
```

**Phase 4**: Extract managers (higher risk)
```javascript
// Complex business logic - test thoroughly
managers/PositionManager.js
managers/WebGeocodingManager.js
```

**Phase 5**: Extract presenters (highest risk)
```javascript
// DOM dependencies - careful testing needed
presenters/HTMLPositionDisplayer.js
presenters/HTMLAddressDisplayer.js
```

## Maintaining Referential Transparency

When splitting modules, preserve **referential transparency** - pure functions remain pure.

### Pure Function Modules

```javascript
// utils/distance.js - Referentially transparent
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// ✅ Pure: Same inputs always produce same outputs
// ✅ No side effects
// ✅ No external dependencies
// ✅ Testable without mocks
```

### Dependency Injection for Testability

Make dependencies explicit:

```javascript
// ❌ Bad: Hidden dependency on global fetch
export class ReverseGeocoder {
  async fetchAddress(lat, lon) {
    const response = await fetch(`https://api.example.com?lat=${lat}&lon=${lon}`);
    return response.json();
  }
}

// ✅ Good: Dependency injection
export class ReverseGeocoder {
  constructor(fetchFn = fetch) {
    this.fetchFn = fetchFn;
  }

  async fetchAddress(lat, lon) {
    const response = await this.fetchFn(`https://api.example.com?lat=${lat}&lon=${lon}`);
    return response.json();
  }
}

// Easy to test with mock
const mockFetch = jest.fn();
const geocoder = new ReverseGeocoder(mockFetch);
```

### Isolate Side Effects

Keep impure code separate from pure logic:

```javascript
// ✅ Good: Pure calculation separated from side effects
// models/distance.js (pure)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Pure calculation
  return distance;
};

// services/logger.js (impure - side effects isolated)
export const logDistance = (distance) => {
  console.log(`Distance: ${distance}m`); // Side effect
  // Could also write to file, send to analytics, etc.
};

// app.js
import { calculateDistance } from './models/distance.js';
import { logDistance } from './services/logger.js';

const dist = calculateDistance(lat1, lon1, lat2, lon2); // Pure
logDistance(dist); // Impure - side effect explicit
```

### Immutable Module Patterns

```javascript
// config/setup.js - Immutable configuration
export const DEFAULT_CONFIG = Object.freeze({
  trackingInterval: 50000,
  minimumDistanceChange: 20,
  geolocationOptions: Object.freeze({
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 0
  })
});

// ✅ Configuration is immutable
// DEFAULT_CONFIG.trackingInterval = 1000; // Error in strict mode

// Create modified config without mutation
export const createConfig = (overrides = {}) => ({
  ...DEFAULT_CONFIG,
  ...overrides,
  geolocationOptions: {
    ...DEFAULT_CONFIG.geolocationOptions,
    ...(overrides.geolocationOptions || {})
  }
});
```


## Practical Examples from Guia.js

Let's refactor parts of the current 6,000-line `guia.js` file.

### Example 1: Extract Distance Utilities

**Before** (in guia.js, lines 73-86):

```javascript
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};
```

**After** (new module):

```javascript
// src/utils/distance.js
/**
 * Earth's mean radius in meters.
 * Used for Haversine distance calculations.
 */
export const EARTH_RADIUS_METERS = 6371e3;

/**
 * Converts degrees to radians.
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export const toRadians = (degrees) => (degrees * Math.PI) / 180;

/**
 * Calculates the great-circle distance between two geographic points using the Haversine formula.
 * 
 * @param {number} lat1 - Latitude of first point in decimal degrees (-90 to 90)
 * @param {number} lon1 - Longitude of first point in decimal degrees (-180 to 180)
 * @param {number} lat2 - Latitude of second point in decimal degrees (-90 to 90)
 * @param {number} lon2 - Longitude of second point in decimal degrees (-180 to 180)
 * @returns {number} Distance in meters between the two points
 * 
 * @example
 * // Distance between São Paulo and Rio de Janeiro
 * const distance = calculateDistance(-23.5505, -46.6333, -22.9068, -43.1729);
 * console.log(distance); // ~357,710 meters (357.7 km)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
};

// src/guia.js (updated)
import { calculateDistance } from './utils/distance.js';
```

### Example 2: Extract Configuration

**Before** (in guia.js, lines 15-34):

```javascript
const setupParams = {
  trackingInterval: 50000,
  minimumDistanceChange: 20,
  independentQueueTimerInterval: 5000,
  noReferencePlace: "Não classificado",
  validRefPlaceClasses: ["place", "shop", "amenity", "railway"],
  mobileNotAcceptedAccuracy: ["medium", "bad", "very bad"],
  desktopNotAcceptedAccuracy: ["bad", "very bad"],
  notAcceptedAccuracy: null,
  geolocationOptions: {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 0,
  },
  openstreetmapBaseUrl: "https://nominatim.openstreetmap.org/reverse?format=json",
};
```

**After** (new module):

```javascript
// src/config/defaults.js
/**
 * Default configuration for Guia.js application.
 * All values are immutable to prevent accidental modification.
 */

/** Position tracking interval in milliseconds */
export const TRACKING_INTERVAL = 50000;

/** Minimum distance change in meters to trigger position update */
export const MINIMUM_DISTANCE_CHANGE = 20;

/** Speech queue timer interval in milliseconds */
export const QUEUE_TIMER_INTERVAL = 5000;

/** Default text for unclassified reference places */
export const NO_REFERENCE_PLACE = "Não classificado";

/** Valid OSM reference place classes */
export const VALID_REF_PLACE_CLASSES = Object.freeze([
  "place",
  "shop",
  "amenity",
  "railway"
]);

/** Accuracy thresholds for mobile devices (GPS) */
export const MOBILE_ACCURACY_THRESHOLDS = Object.freeze([
  "medium",
  "bad",
  "very bad"
]);

/** Accuracy thresholds for desktop devices (WiFi/IP) */
export const DESKTOP_ACCURACY_THRESHOLDS = Object.freeze([
  "bad",
  "very bad"
]);

/** Browser Geolocation API options */
export const GEOLOCATION_OPTIONS = Object.freeze({
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 0
});

/** OpenStreetMap Nominatim API base URL */
export const OSM_BASE_URL = "https://nominatim.openstreetmap.org/reverse?format=json";

/**
 * Creates a complete configuration object with defaults.
 * Returns a new object (immutable pattern).
 */
export const createDefaultConfig = () => ({
  trackingInterval: TRACKING_INTERVAL,
  minimumDistanceChange: MINIMUM_DISTANCE_CHANGE,
  independentQueueTimerInterval: QUEUE_TIMER_INTERVAL,
  noReferencePlace: NO_REFERENCE_PLACE,
  validRefPlaceClasses: [...VALID_REF_PLACE_CLASSES],
  mobileNotAcceptedAccuracy: [...MOBILE_ACCURACY_THRESHOLDS],
  desktopNotAcceptedAccuracy: [...DESKTOP_ACCURACY_THRESHOLDS],
  notAcceptedAccuracy: null,
  geolocationOptions: { ...GEOLOCATION_OPTIONS },
  openstreetmapBaseUrl: OSM_BASE_URL
});

// src/guia.js (updated)
import { createDefaultConfig } from './config/defaults.js';

const setupParams = createDefaultConfig();
```

### Example 3: Extract Logger Utilities

**Before** (in guia.js):

```javascript
const log = (message, ...params) => {
  console.log(`[${new Date().toISOString()}]`, message, ...params);
};

const warn = (message, ...params) => {
  console.warn(`[${new Date().toISOString()}]`, message, ...params);
};
```

**After** (new module):

```javascript
// src/utils/logger.js
/**
 * Logging utilities with timestamp formatting.
 * Pure functions for consistent logging across the application.
 */

/**
 * Formats current timestamp for log messages.
 * 
 * @returns {string} ISO 8601 timestamp
 * 
 * @example
 * formatTimestamp(); // "2025-10-15T04:33:48.006Z"
 */
export const formatTimestamp = () => new Date().toISOString();

/**
 * Logs info message with timestamp.
 * 
 * @param {string} message - Message to log
 * @param {...any} params - Additional parameters
 * 
 * @example
 * log('Position updated', { lat: -23.5505, lon: -46.6333 });
 * // Output: [2025-10-15T04:33:48.006Z] Position updated { lat: -23.5505, lon: -46.6333 }
 */
export const log = (message, ...params) => {
  console.log(`[${formatTimestamp()}]`, message, ...params);
};

/**
 * Logs warning message with timestamp.
 * 
 * @param {string} message - Warning message
 * @param {...any} params - Additional parameters
 * 
 * @example
 * warn('Low accuracy detected', { accuracy: 500 });
 * // Output: [2025-10-15T04:33:48.006Z] Low accuracy detected { accuracy: 500 }
 */
export const warn = (message, ...params) => {
  console.warn(`[${formatTimestamp()}]`, message, ...params);
};

/**
 * Logs error message with timestamp.
 * 
 * @param {string} message - Error message
 * @param {...any} params - Additional parameters
 * 
 * @example
 * error('Geolocation failed', new Error('Permission denied'));
 */
export const error = (message, ...params) => {
  console.error(`[${formatTimestamp()}]`, message, ...params);
};

// src/guia.js (updated)
import { log, warn, error } from './utils/logger.js';
```

## Migration Strategies

### Strategy 1: Bottom-Up Migration (Recommended)

Start with lowest-level utilities, then work up to complex components:

```
Phase 1: Utils (Week 1)
├── Extract utils/distance.js
├── Extract utils/logger.js
├── Extract utils/async.js
└── Update tests

Phase 2: Config (Week 1)
├── Extract config/defaults.js
├── Extract config/constants.js
└── Update tests

Phase 3: Models (Week 2)
├── Extract models/GeoPosition.js
├── Extract models/Address.js
└── Update tests

Phase 4: Services (Week 2-3)
├── Extract services/ReverseGeocoder.js
├── Extract services/GeolocationService.js
└── Update tests

Phase 5: Managers (Week 3-4)
├── Extract managers/PositionManager.js
├── Extract managers/WebGeocodingManager.js
└── Update tests

Phase 6: Presenters (Week 4-5)
├── Extract presenters/HTMLPositionDisplayer.js
├── Extract presenters/HTMLAddressDisplayer.js
└── Update tests
```

### Strategy 2: Strangler Fig Pattern

Gradually replace old code with new modules:

```javascript
// Step 1: Create new module
// src/utils/distance-new.js
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // New implementation
};

// Step 2: Use both (temporary)
// src/guia.js
import { calculateDistance as calculateDistanceNew } from './utils/distance-new.js';

const calculateDistance = (...args) => {
  // Log usage
  console.log('Using calculateDistance');
  // Delegate to new implementation
  return calculateDistanceNew(...args);
};

// Step 3: Monitor and test

// Step 4: Remove old implementation
// Delete old calculateDistance from guia.js

// Step 5: Update all imports
import { calculateDistance } from './utils/distance.js';
```

### Migration Checklist

For each module extraction:

- [ ] Identify module boundaries (Single Responsibility)
- [ ] Extract code to new file
- [ ] Add proper imports/exports
- [ ] Update documentation (JSDoc)
- [ ] Add/update unit tests
- [ ] Run existing tests (ensure no regressions)
- [ ] Update all import statements
- [ ] Run syntax validation (`node -c`)
- [ ] Test in browser environment
- [ ] Test in Node.js environment
- [ ] Update documentation references
- [ ] Code review
- [ ] Commit with descriptive message


## Testing Modular Code

### Jest and ES6 Modules - Critical Configuration

**⚠️ IMPORTANT:** When using ES6 modules with Jest, special configuration is required.

**The Problem:**
```javascript
// Source uses ES6 modules
// src/guia.js
import { helper } from './utils/helper.js';
export class MyClass { }

// CommonJS tests fail
// test.js
const { MyClass } = require('../src/guia.js');
// ❌ Error: Cannot use import statement outside a module
```

**The Solution:**

1. **Update package.json:**
```json
{
  "type": "module",
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
  },
  "jest": {
    "testEnvironment": "node",
    "transform": {}
  }
}
```

2. **Update test files to ES6:**
```javascript
// ✅ Correct: ES6 test file
import { describe, test, expect } from '@jest/globals';
import { MyClass } from '../../src/guia.js';

describe('MyClass', () => {
  test('works with ES6', () => {
    expect(new MyClass()).toBeDefined();
  });
});
```

**Key Points:**
- ✅ Import Jest globals from `@jest/globals`
- ✅ Use `import` instead of `require()`
- ✅ Include `.js` extensions in imports
- ✅ Use `--experimental-vm-modules` flag
- ❌ Don't use `eval()` with ES6 modules
- ❌ Don't mix `import` and `require()`

**See:** [JEST_COMMONJS_ES6_GUIDE.md](./JEST_COMMONJS_ES6_GUIDE.md) for comprehensive guide.

### Unit Testing Individual Modules

**Before** (monolithic):
```javascript
// Hard to test - requires entire 6,000-line file
const guia = require('./guia.js');
// Test what exactly?
```

**After** (modular):
```javascript
// __tests__/utils/distance.test.js
import { describe, test, expect } from '@jest/globals';
import { calculateDistance } from '../../src/utils/distance.js';

describe('calculateDistance', () => {
  test('calculates distance between São Paulo and Rio de Janeiro', () => {
    const distance = calculateDistance(-23.5505, -46.6333, -22.9068, -43.1729);
    expect(distance).toBeCloseTo(357710, 0);
  });

  test('returns 0 for same coordinates', () => {
    const distance = calculateDistance(-23.5505, -46.6333, -23.5505, -46.6333);
    expect(distance).toBe(0);
  });

  test('handles antipodal points', () => {
    const distance = calculateDistance(0, 0, 0, 180);
    expect(distance).toBeCloseTo(20015086, 0); // Half Earth's circumference
  });
});
```

### Mocking Module Dependencies

```javascript
// __tests__/services/ReverseGeocoder.test.js
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { ReverseGeocoder } from '../../src/services/ReverseGeocoder.js';

// Mock fetch dependency
global.fetch = jest.fn();

describe('ReverseGeocoder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches address data from API', async () => {
    const mockResponse = {
      address: {
        road: 'Avenida Paulista',
        city: 'São Paulo'
      }
    };

    global.fetch.mockResolvedValue({
      json: async () => mockResponse
    });

    const geocoder = new ReverseGeocoder(-23.5505, -46.6333);
    const result = await geocoder.fetch();

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('lat=-23.5505')
    );
  });
});
```

### Integration Testing Modules

```javascript
// __tests__/integration/geolocation-flow.test.js
import { describe, test, expect } from '@jest/globals';
import { GeoPosition } from '../../src/models/GeoPosition.js';
import { PositionManager } from '../../src/managers/PositionManager.js';
import { calculateDistance } from '../../src/utils/distance.js';

describe('Geolocation Integration', () => {
  test('complete position tracking flow', () => {
    // Create position
    const position1 = new GeoPosition({
      latitude: -23.5505,
      longitude: -46.6333,
      accuracy: 10
    });

    // Initialize manager
    const manager = PositionManager.getInstance(position1);

    // Update position
    const position2 = new GeoPosition({
      latitude: -23.5515,
      longitude: -46.6343,
      accuracy: 10
    });

    const distance = position1.distanceTo(position2);
    
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(200); // Small movement
  });
});
```

### Common Jest + ES6 Pitfalls to Avoid

#### ❌ Pitfall 1: Using eval() with ES6 modules

```javascript
// ❌ WRONG - eval() doesn't work with ES6 imports
const fs = require('fs');
const guiaContent = fs.readFileSync('../../src/guia.js', 'utf8');
eval(guiaContent);
// Error: Cannot use import statement outside a module

// ✅ CORRECT - Use proper imports
import { MyClass } from '../../src/guia.js';
```

#### ❌ Pitfall 2: Missing Jest globals import

```javascript
// ❌ WRONG - describe/test not defined in ESM
describe('Test', () => {
  test('fails', () => { });
});
// Error: describe is not defined

// ✅ CORRECT - Import Jest globals
import { describe, test, expect } from '@jest/globals';
describe('Test', () => {
  test('works', () => { });
});
```

#### ❌ Pitfall 3: Missing .js extension

```javascript
// ❌ WRONG - Missing extension
import { MyClass } from './MyClass';
// Error: Module not found

// ✅ CORRECT - Include .js extension
import { MyClass } from './MyClass.js';
```

#### ❌ Pitfall 4: Mixing module systems

```javascript
// ❌ WRONG - Don't mix import and require
import { A } from './a.js';
const B = require('./b.js');

// ✅ CORRECT - Use one system consistently
import { A } from './a.js';
import { B } from './b.js';
```

**For complete Jest configuration guide, see:**
- [JEST_COMMONJS_ES6_GUIDE.md](./JEST_COMMONJS_ES6_GUIDE.md) - Full guide
- [TESTING_MODULE_SYSTEMS.md](../.github/TESTING_MODULE_SYSTEMS.md) - Quick reference

## Best Practices

### 1. One Module, One Responsibility

```javascript
// ✅ Good: Focused module
// src/utils/distance.js
export const calculateDistance = (lat1, lon1, lat2, lon2) => { /* ... */ };
export const toRadians = (degrees) => { /* ... */ };

// ❌ Bad: Mixed responsibilities
// src/utils/everything.js
export const calculateDistance = () => { /* ... */ };
export const formatAddress = () => { /* ... */ };
export const fetchWeather = () => { /* ... */ };
export const playSound = () => { /* ... */ };
```

### 2. Explicit Dependencies

```javascript
// ✅ Good: Dependencies are clear
import { calculateDistance } from './utils/distance.js';
import { log } from './utils/logger.js';
import { GeoPosition } from './models/GeoPosition.js';

// ❌ Bad: Hidden dependencies
// Code uses global variables or implicit dependencies
```

### 3. Avoid Circular Dependencies

```javascript
// ❌ Bad: Circular dependency
// moduleA.js
import { functionB } from './moduleB.js';
export const functionA = () => functionB();

// moduleB.js
import { functionA } from './moduleA.js';
export const functionB = () => functionA(); // Circular!

// ✅ Good: Break cycle with shared module
// utils.js
export const sharedFunction = () => { /* ... */ };

// moduleA.js
import { sharedFunction } from './utils.js';
export const functionA = () => sharedFunction();

// moduleB.js
import { sharedFunction } from './utils.js';
export const functionB = () => sharedFunction();
```

### 4. Use Barrel Files for Clean Imports

```javascript
// src/models/index.js - Barrel file
export { GeoPosition } from './GeoPosition.js';
export { Address } from './Address.js';
export { ReferencePlace } from './ReferencePlace.js';

// ✅ Good: Clean imports
import { GeoPosition, Address, ReferencePlace } from './models/index.js';

// ❌ Less clean: Individual imports
import { GeoPosition } from './models/GeoPosition.js';
import { Address } from './models/Address.js';
import { ReferencePlace } from './models/ReferencePlace.js';
```

### 5. Consistent Naming Conventions

```javascript
// File naming
// ✅ PascalCase for classes
GeoPosition.js
PositionManager.js
ReverseGeocoder.js

// ✅ camelCase for utilities
distance.js
logger.js
async.js

// ✅ kebab-case for multi-word utilities
device-detection.js
address-parser.js

// Directory naming
// ✅ Plural for collections
models/
services/
utils/

// ✅ Singular for single purpose
config/
```

### 6. Keep Modules Small

**Guidelines:**
- **Utilities**: < 100 lines
- **Models**: < 200 lines
- **Services**: < 300 lines
- **Managers**: < 500 lines

If a module exceeds these limits, consider splitting further.

### 7. Document Module Purpose

```javascript
/**
 * Distance calculation utilities using Haversine formula.
 * 
 * This module provides pure functions for calculating great-circle
 * distances between geographic coordinates. All functions are
 * referentially transparent and suitable for unit testing.
 * 
 * @module utils/distance
 * @see {@link https://en.wikipedia.org/wiki/Haversine_formula}
 * 
 * @example
 * import { calculateDistance } from './utils/distance.js';
 * 
 * const distance = calculateDistance(
 *   -23.5505, -46.6333,  // São Paulo
 *   -22.9068, -43.1729   // Rio de Janeiro
 * );
 * console.log(distance); // ~357,710 meters
 */

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Implementation
};
```

### 8. Version Control Best Practices

```bash
# Commit after each module extraction
git add src/utils/distance.js
git commit -m "refactor: extract distance utilities to separate module

- Move calculateDistance to src/utils/distance.js
- Add EARTH_RADIUS_METERS constant
- Add toRadians helper function
- Update imports in guia.js
- Add unit tests for distance calculations"

# Keep commits focused
# One module per commit for easy review and rollback
```

## Common Pitfalls

### 1. Premature Modularization

**Problem**: Splitting too early before understanding domain boundaries.

```javascript
// ❌ Bad: Split without clear purpose
src/utils/math.js        // What kind of math?
src/helpers/stuff.js     // What stuff?
src/misc/things.js       // What things?

// ✅ Good: Clear purpose
src/utils/distance.js           // Geographic distance calculations
src/formatters/address.js       // Address formatting
src/validators/coordinates.js   // Coordinate validation
```

**Solution**: Wait until you understand the domain. Refactor when patterns emerge.

### 2. Over-Modularization

**Problem**: Too many tiny modules that are hard to navigate.

```javascript
// ❌ Bad: Excessive splitting
src/utils/add.js         // 3 lines
src/utils/subtract.js    // 3 lines
src/utils/multiply.js    // 3 lines
src/utils/divide.js      // 3 lines

// ✅ Good: Related functions together
src/utils/math.js        // All basic math operations
```

**Solution**: Balance granularity with practicality. Related functions can share a module.

### 3. Tight Coupling Through Modules

**Problem**: Modules that depend on too many others.

```javascript
// ❌ Bad: Too many dependencies
// src/managers/ComplexManager.js
import { A } from './A.js';
import { B } from './B.js';
import { C } from './C.js';
import { D } from './D.js';
import { E } from './E.js';
import { F } from './F.js';
import { G } from './G.js';
import { H } from './H.js';
// ... 10 more imports

// ✅ Good: Minimal dependencies
// src/managers/FocusedManager.js
import { GeoPosition } from '../models/GeoPosition.js';
import { calculateDistance } from '../utils/distance.js';
```

**Solution**: If a module needs many imports, it may be doing too much. Split it further.

### 4. Forgetting to Update Tests

**Problem**: Extracting modules but not updating tests.

```javascript
// ❌ Bad: Old test still imports from monolithic file
import { calculateDistance } from '../src/guia.js'; // Old import

// ✅ Good: Test imports from new module
import { calculateDistance } from '../src/utils/distance.js'; // New import
```

**Solution**: Update tests immediately when extracting modules.

### 5. Breaking Backward Compatibility

**Problem**: Removing exports without deprecation period.

```javascript
// ❌ Bad: Immediate removal
// guia.js
// calculateDistance removed - breaks existing code!

// ✅ Good: Deprecation period
// guia.js
import { calculateDistance as calcDist } from './utils/distance.js';

/**
 * @deprecated Use calculateDistance from './utils/distance.js' instead
 */
export const calculateDistance = (...args) => {
  console.warn('calculateDistance is deprecated. Import from utils/distance.js');
  return calcDist(...args);
};
```

**Solution**: Maintain compatibility exports during migration.

### 6. Circular Dependencies

**Problem**: Modules importing each other.

```javascript
// ❌ Bad: Circular dependency
// PositionManager.js
import { GeoPosition } from './GeoPosition.js';

// GeoPosition.js
import { PositionManager } from './PositionManager.js'; // Circular!
```

**Solution**: Restructure to remove cycles. Often means extracting shared code.

### 7. Mixing ES6 and CommonJS

**Problem**: Inconsistent module syntax.

```javascript
// ❌ Bad: Mixed syntax
import { A } from './A.js';           // ES6
const B = require('./B.js');          // CommonJS
export default C;                     // ES6
module.exports = { D };               // CommonJS
```

**Solution**: Choose one module system and stick with it.

## Tools and Automation

### 1. Bundlers

**Webpack** - Module bundler for production
```javascript
// webpack.config.js
module.exports = {
  entry: './src/guia.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
};
```

**Rollup** - ES6 module bundler
```javascript
// rollup.config.js
export default {
  input: 'src/guia.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es'
  }
};
```

### 2. Linters

**ESLint** - Catch import/export errors
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'import/no-unresolved': 'error',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error'
  }
};
```

### 3. Dependency Analysis

**Madge** - Visualize module dependencies
```bash
# Install
npm install -g madge

# Analyze dependencies
madge --circular src/

# Generate dependency graph
madge --image graph.svg src/
```

**Dependency Cruiser** - Validate module dependencies
```bash
# Install
npm install -D dependency-cruiser

# Check for circular dependencies
npx depcruise --validate .dependency-cruiser.js src/
```

### 4. Code Coverage

Ensure modules are tested:
```bash
# Run Jest with coverage
npm test -- --coverage

# Coverage should include all modules
# Aim for >80% coverage per module
```

## References

### Official Documentation

- **[ECMAScript Modules (ESM)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)** - MDN Web Docs
- **[Node.js ES Modules](https://nodejs.org/api/esm.html)** - Official Node.js documentation
- **[CommonJS Modules](https://nodejs.org/api/modules.html)** - Node.js module system

### Best Practices

- **[JavaScript Modules: A Beginner's Guide](https://www.freecodecamp.org/news/javascript-modules-a-beginner-s-guide/)** - FreeCodeCamp
- **[ES6 Modules in Depth](https://ponyfoo.com/articles/es6-modules-in-depth)** - Pony Foo
- **[Organizing JavaScript Code](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#modulepatternjavascript)** - Addy Osmani

### Project-Specific Guides

- **[JAVASCRIPT_BEST_PRACTICES.md](../.github/JAVASCRIPT_BEST_PRACTICES.md)** - Project JavaScript standards
- **[REFERENTIAL_TRANSPARENCY.md](../.github/REFERENTIAL_TRANSPARENCY.md)** - Pure functions guide
- **[LOW_COUPLING_GUIDE.md](../.github/LOW_COUPLING_GUIDE.md)** - Low coupling principles
- **[HIGH_COHESION_GUIDE.md](../.github/HIGH_COHESION_GUIDE.md)** - High cohesion principles
- **[CODE_REVIEW_GUIDE.md](../.github/CODE_REVIEW_GUIDE.md)** - Code review checklist
- **[UNIT_TEST_GUIDE.md](../.github/UNIT_TEST_GUIDE.md)** - Unit testing fundamentals
- **[HTML_CSS_JS_SEPARATION.md](../.github/HTML_CSS_JS_SEPARATION.md)** - Separation of concerns

### Tools

- **[Webpack](https://webpack.js.org/)** - Module bundler
- **[Rollup](https://rollupjs.org/)** - ES6 module bundler
- **[Parcel](https://parceljs.org/)** - Zero-config bundler
- **[Madge](https://github.com/pahen/madge)** - Module dependency graph
- **[Dependency Cruiser](https://github.com/sverweij/dependency-cruiser)** - Validate dependencies

### Books

- **"JavaScript: The Good Parts"** by Douglas Crockford
- **"You Don't Know JS: ES6 & Beyond"** by Kyle Simpson
- **"Clean Code in JavaScript"** by James Padolsey

---

## Summary

This guide has covered:

✅ **What modules are** and why they matter  
✅ **Benefits** of modular code (maintainability, testability, reusability)  
✅ **ES6 vs CommonJS** module systems  
✅ **Strategies** for splitting large files  
✅ **Practical examples** from Guia.js codebase  
✅ **Migration strategies** for safe refactoring  
✅ **Testing** modular code  
✅ **Best practices** and common pitfalls  
✅ **Tools** for automation and analysis  

### Next Steps

1. **Review** existing codebase (guia.js, 6,000+ lines)
2. **Identify** extraction candidates (utilities, models, services)
3. **Start small** with pure utility functions
4. **Test thoroughly** at each step
5. **Iterate** and improve module boundaries
6. **Document** module purposes and relationships

### Key Takeaways

- **Modules improve maintainability** through clear boundaries
- **Start with utilities** (lowest risk, highest value)
- **Preserve referential transparency** when splitting
- **Test each module** independently
- **Use consistent** naming and structure
- **Avoid** circular dependencies
- **Choose ES6 modules** for modern JavaScript
- **Document** module purpose and usage

---

**For questions or improvements to this guide:**
- Open an issue on GitHub
- Reference this guide in code reviews
- Share feedback with the team

**Related Documentation:**
- [JAVASCRIPT_BEST_PRACTICES.md](../.github/JAVASCRIPT_BEST_PRACTICES.md)
- [REFERENTIAL_TRANSPARENCY.md](../.github/REFERENTIAL_TRANSPARENCY.md)
- [CODE_REVIEW_GUIDE.md](../.github/CODE_REVIEW_GUIDE.md)
- [UNIT_TEST_GUIDE.md](../.github/UNIT_TEST_GUIDE.md)
- [LOW_COUPLING_GUIDE.md](../.github/LOW_COUPLING_GUIDE.md)
- [HIGH_COHESION_GUIDE.md](../.github/HIGH_COHESION_GUIDE.md)

**Author:** Guia.js Team  
**Version:** 1.0.0  
**Last Updated:** 2025-10-15  
**License:** MIT
