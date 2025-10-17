# ES6 Import/Export System Best Practices Guide

## Overview

This comprehensive guide provides best practices for ES6 import/export systems based on real-world experience from the guia.js modularization project. These practices ensure maintainable, scalable, and error-free module systems.

**Created**: 2024-12-28  
**Version**: 1.0.0  
**Context**: Post-Phase 16 modularization best practices  

## Table of Contents

1. [Export Patterns](#export-patterns)
2. [Import Patterns](#import-patterns)
3. [Module Organization](#module-organization)
4. [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
5. [HTML Integration](#html-integration)
6. [Testing Considerations](#testing-considerations)
7. [Performance Optimization](#performance-optimization)
8. [Migration Strategies](#migration-strategies)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Real-World Examples](#real-world-examples)

## Export Patterns

### 1. Named Exports (Recommended)

**✅ Best Practice**: Use named exports for most cases
```javascript
// ✅ Good - Clear, explicit, tree-shakable
export const log = (message) => console.log(message);
export const warn = (message) => console.warn(message);
export const error = (message) => console.error(message);

// ✅ Good - Class with named export
export class LocationService {
    getCurrentPosition() { /* ... */ }
}

// ✅ Good - Multiple exports at the end
const formatTimestamp = () => new Date().toISOString();
const validateCoordinates = (lat, lng) => { /* ... */ };

export { formatTimestamp, validateCoordinates };
```

**❌ Avoid**: Inconsistent export naming
```javascript
// ❌ Bad - Inconsistent naming conventions
export const logInfo = (message) => console.log(message);    // Should be 'log'
export const logWarning = (message) => console.warn(message); // Should be 'warn'
export const logError = (message) => console.error(message);  // Should be 'error'
```

### 2. Default Exports

**✅ Best Practice**: Use default exports for main classes or primary functionality
```javascript
// ✅ Good - Main class as default export
export default class WebGeocodingManager {
    constructor(dependencies) { /* ... */ }
}

// ✅ Good - Single utility function
export default function geocodeAddress(address) {
    return fetch(`/api/geocode?address=${address}`);
}

// ✅ Good - Configuration object
export default {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3
};
```

**❌ Avoid**: Mixing default and named exports inappropriately
```javascript
// ❌ Bad - Confusing mix of default and named
export default class Logger { /* ... */ }
export const log = (msg) => { /* ... */ };  // Should be method of Logger class
export const warn = (msg) => { /* ... */ }; // Should be method of Logger class
```

### 3. Re-exports and Barrel Exports

**✅ Best Practice**: Create index files for clean module interfaces
```javascript
// src/utils/index.js - Barrel export
export { log, warn, error } from './logger.js';
export { formatTimestamp, validateInput } from './helpers.js';
export { default as Cache } from './cache.js';

// src/services/index.js - Service barrel
export { GeolocationService } from './geolocation.js';
export { GeocodingService } from './geocoding.js';
export { default as APIClient } from './api-client.js';
```

**❌ Avoid**: Deep import paths in consumer code
```javascript
// ❌ Bad - Deep import paths
import { log } from './utils/logging/console/logger.js';
import { GeolocationService } from './services/location/geolocation/service.js';

// ✅ Good - Using barrel exports
import { log } from './utils/index.js';
import { GeolocationService } from './services/index.js';
```

## Import Patterns

### 1. Named Imports (Recommended)

**✅ Best Practice**: Use descriptive, explicit named imports
```javascript
// ✅ Good - Clear, specific imports
import { log, warn, error } from './utils/logger.js';
import { GeolocationService, GeocodingService } from './services/index.js';
import { validateCoordinates, formatAddress } from './utils/helpers.js';

// ✅ Good - Aliased imports for clarity
import { log as logMessage } from './utils/logger.js';
import { Service as LocationService } from './location-service.js';
```

### 2. Default Imports

**✅ Best Practice**: Use meaningful names for default imports
```javascript
// ✅ Good - Descriptive default import names
import WebGeocodingManager from './coordination/WebGeocodingManager.js';
import LocationDisplayer from './display/LocationDisplayer.js';
import APIClient from './api/client.js';

// ✅ Good - Aliased default imports
import Manager from './coordination/WebGeocodingManager.js';
import Displayer from './display/LocationDisplayer.js';
```

**❌ Avoid**: Generic or confusing default import names
```javascript
// ❌ Bad - Generic names
import Thing from './coordination/WebGeocodingManager.js';
import Stuff from './display/LocationDisplayer.js';
import Data from './api/client.js';
```

### 3. Mixed Imports

**✅ Best Practice**: Combine default and named imports when appropriate
```javascript
// ✅ Good - Main class + utility functions
import WebGeocodingManager, { createManager, validateConfig } from './manager.js';

// ✅ Good - Default + specific named imports
import Logger, { log, warn } from './utils/logger.js';

// ✅ Good - Namespace + specific imports
import * as Utils from './utils/index.js';
import { GeolocationService } from './services/index.js';
```

### 4. Dynamic Imports

**✅ Best Practice**: Use dynamic imports for code splitting and lazy loading
```javascript
// ✅ Good - Lazy loading heavy modules
async function initializeMapping() {
    const { MapService } = await import('./services/mapping.js');
    return new MapService();
}

// ✅ Good - Conditional loading
if (isProductionMode) {
    const { Analytics } = await import('./analytics/tracker.js');
    Analytics.initialize();
}

// ✅ Good - Feature detection
if ('geolocation' in navigator) {
    const { GeolocationService } = await import('./geolocation.js');
    // Use geolocation service
}
```

## Module Organization

### 1. Directory Structure

**✅ Best Practice**: Organize modules by functionality
```
src/
├── coordination/           # Orchestrator classes
│   ├── WebGeocodingManager.js
│   └── ServiceCoordinator.js
├── services/              # Business logic services
│   ├── geolocation/
│   ├── geocoding/
│   └── index.js          # Barrel export
├── utils/                 # Pure utility functions
│   ├── logger.js
│   ├── helpers.js
│   └── index.js          # Barrel export
├── display/               # UI/Display components
│   ├── LocationDisplayer.js
│   └── StatusDisplayer.js
├── api/                   # External API integration
│   ├── IbiraAPIFetchManager.js
│   └── client.js
└── index.js              # Main entry point
```

### 2. File Naming Conventions

**✅ Best Practice**: Use consistent, descriptive names
```javascript
// ✅ Good - Clear, descriptive file names
WebGeocodingManager.js      // PascalCase for classes
LocationDisplayer.js        // PascalCase for classes
logger.js                   // camelCase for utilities
api-client.js              // kebab-case for multi-word utilities
index.js                   // Standard entry points
```

**❌ Avoid**: Ambiguous or inconsistent naming
```javascript
// ❌ Bad - Unclear names
manager.js                 // What kind of manager?
utils.js                   // Too generic
helper.js                  // What does it help with?
stuff.js                   // Meaningless
```

### 3. Module Size Guidelines

**✅ Best Practice**: Keep modules focused and reasonably sized
```javascript
// ✅ Good - Focused, single-responsibility modules
// logger.js - 60 lines, focused on logging
// LocationDisplayer.js - 200 lines, focused on display
// WebGeocodingManager.js - 700 lines, orchestration (after extraction)

// ✅ Good - Split large modules into smaller ones
// Before: guia.js - 6000+ lines (monolithic)
// After: 16 specialized modules averaging 200-400 lines each
```

## Common Pitfalls and Solutions

### 1. Import/Export Name Mismatches

**❌ Problem**: Importing functions with wrong names
```javascript
// logger.js exports
export const log = (message) => console.log(message);
export const warn = (message) => console.warn(message);

// ❌ Bad - Wrong import names
import { logInfo, logWarning } from './logger.js';
// Error: does not provide an export named 'logInfo'
```

**✅ Solution**: Match export names exactly
```javascript
// ✅ Good - Correct import names
import { log, warn } from './logger.js';

// ✅ Good - Use aliases if needed
import { log as logInfo, warn as logWarning } from './logger.js';
```

### 2. Missing Exports

**❌ Problem**: Forgetting to export functions
```javascript
// utils.js
const formatDate = (date) => date.toISOString();
const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

// ❌ Bad - Functions not exported
// Consumer cannot import these functions
```

**✅ Solution**: Always export public functions
```javascript
// ✅ Good - Explicit exports
export const formatDate = (date) => date.toISOString();
export const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

// ✅ Good - Export at the end
const formatDate = (date) => date.toISOString();
const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

export { formatDate, validateEmail };
```

### 3. Circular Dependencies

**❌ Problem**: Modules importing each other
```javascript
// user.js
import { validatePermission } from './permission.js';
export class User { /* ... */ }

// permission.js
import { User } from './user.js';  // ❌ Circular dependency
export const validatePermission = (user) => { /* ... */ };
```

**✅ Solution**: Refactor to eliminate circular dependencies
```javascript
// user.js
export class User { /* ... */ }

// permission.js
export const validatePermission = (user) => { /* ... */ };

// user-service.js - Composition layer
import { User } from './user.js';
import { validatePermission } from './permission.js';

export class UserService {
    validateUser(user) {
        return validatePermission(user);
    }
}
```

### 4. Default Export Confusion

**❌ Problem**: Mixing default and named exports inconsistently
```javascript
// ❌ Bad - Confusing export pattern
export default class Logger { /* ... */ }
export const log = (msg) => { /* ... */ };

// Consumer confusion:
import Logger, { log } from './logger.js';  // Why both?
```

**✅ Solution**: Choose consistent patterns
```javascript
// ✅ Good - All named exports (utility pattern)
export const createLogger = (level) => { /* ... */ };
export const log = (msg) => { /* ... */ };
export const warn = (msg) => { /* ... */ };

// ✅ Good - Default export for main class
export default class Logger {
    log(msg) { /* ... */ }
    warn(msg) { /* ... */ }
}
```

## HTML Integration

### 1. Module Script Tags

**✅ Best Practice**: Use `type="module"` for ES6 modules
```html
<!-- ✅ Good - ES6 module loading -->
<script type="module" src="./src/guia.js"></script>
<script type="module" src="./coordination/WebGeocodingManager.js"></script>

<!-- ✅ Good - Inline module script -->
<script type="module">
    import { WebGeocodingManager } from './src/coordination/WebGeocodingManager.js';
    const manager = new WebGeocodingManager(dependencies);
    await manager.initialize();
</script>
```

**❌ Avoid**: Regular script tags for modules
```html
<!-- ❌ Bad - Will cause "Cannot use import statement outside a module" -->
<script src="./src/guia.js"></script>
```

### 2. Fallback for Non-Module Browsers

**✅ Best Practice**: Provide fallbacks for older browsers
```html
<!-- ✅ Good - Module with fallback -->
<script type="module" src="./src/modern-app.js"></script>
<script nomodule src="./src/legacy-app.js"></script>

<!-- ✅ Good - Feature detection -->
<script>
if ('type' in HTMLScriptElement.prototype) {
    // Modern browser with module support
    import('./src/modern-app.js');
} else {
    // Legacy browser
    document.write('<script src="./src/legacy-app.js"><\/script>');
}
</script>
```

### 3. Module Preloading

**✅ Best Practice**: Preload critical modules
```html
<!-- ✅ Good - Preload important modules -->
<link rel="modulepreload" href="./src/coordination/WebGeocodingManager.js">
<link rel="modulepreload" href="./src/services/GeolocationService.js">

<script type="module">
    // Modules are already preloaded and cached
    import { WebGeocodingManager } from './src/coordination/WebGeocodingManager.js';
</script>
```

## Testing Considerations

### 1. Jest Configuration for ES6 Modules

**✅ Best Practice**: Configure Jest for ES6 modules
```javascript
// jest.config.js
export default {
    // Enable experimental ES6 module support
    extensionsToTreatAsEsm: ['.js'],
    globals: {
        'ts-jest': {
            useESM: true
        }
    },
    moduleNameMapping: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    transform: {
        '^.+\\.js$': ['babel-jest', { 
            presets: [['@babel/preset-env', { targets: { node: 'current' } }]] 
        }]
    }
};
```

### 2. Mocking ES6 Modules

**✅ Best Practice**: Mock modules appropriately
```javascript
// ✅ Good - Mock named exports
jest.mock('./utils/logger.js', () => ({
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
}));

// ✅ Good - Mock default export
jest.mock('./services/GeolocationService.js', () => ({
    default: jest.fn().mockImplementation(() => ({
        getCurrentPosition: jest.fn(),
        watchPosition: jest.fn()
    }))
}));

// ✅ Good - Partial mock
jest.mock('./utils/helpers.js', () => ({
    ...jest.requireActual('./utils/helpers.js'),
    formatDate: jest.fn(() => '2024-01-01')
}));
```

### 3. Testing Module Boundaries

**✅ Best Practice**: Test module interfaces
```javascript
// ✅ Good - Test module exports
describe('Logger Module', () => {
    it('should export required functions', () => {
        const loggerModule = require('./utils/logger.js');
        
        expect(loggerModule.log).toBeDefined();
        expect(loggerModule.warn).toBeDefined();
        expect(loggerModule.error).toBeDefined();
        expect(typeof loggerModule.log).toBe('function');
    });
});

// ✅ Good - Test integration between modules
describe('WebGeocodingManager Integration', () => {
    it('should correctly use logger module', () => {
        const { log } = require('./utils/logger.js');
        const WebGeocodingManager = require('./coordination/WebGeocodingManager.js');
        
        const manager = new WebGeocodingManager(dependencies);
        manager.initialize();
        
        expect(log).toHaveBeenCalledWith(expect.stringContaining('Initialized'));
    });
});
```

## Performance Optimization

### 1. Tree Shaking

**✅ Best Practice**: Enable tree shaking with proper exports
```javascript
// ✅ Good - Tree-shakable named exports
export const log = (message) => console.log(message);
export const warn = (message) => console.warn(message);
export const error = (message) => console.error(message);

// Consumer only imports what they need
import { log } from './utils/logger.js';  // Only 'log' is bundled
```

**❌ Avoid**: Namespace imports that prevent tree shaking
```javascript
// ❌ Bad - Imports entire module
import * as Logger from './utils/logger.js';
Logger.log('message');  // All exports are bundled, even unused ones
```

### 2. Code Splitting

**✅ Best Practice**: Split code by routes/features
```javascript
// ✅ Good - Route-based code splitting
const initializeMapping = () => import('./features/mapping.js');
const initializeAnalytics = () => import('./features/analytics.js');
const initializeChat = () => import('./features/chat.js');

// ✅ Good - Feature-based dynamic imports
if (userHasPermission('mapping')) {
    const { MapService } = await import('./services/mapping.js');
    // Initialize mapping
}
```

### 3. Module Caching

**✅ Best Practice**: Leverage browser module caching
```javascript
// ✅ Good - Consistent import paths for caching
import { log } from './utils/logger.js';     // Cached
import { warn } from './utils/logger.js';    // Uses cached module

// ✅ Good - Use barrel exports for consistent paths
import { log, warn, error } from './utils/index.js';  // Single cached module
```

## Migration Strategies

### 1. Gradual Migration from CommonJS

**✅ Best Practice**: Migrate incrementally
```javascript
// Phase 1: Convert exports while maintaining CommonJS imports
// module.js
export const log = (message) => console.log(message);
// Also provide CommonJS export for compatibility
module.exports = { log };

// Phase 2: Convert imports in consuming modules
// Before
const { log } = require('./module.js');

// After
import { log } from './module.js';

// Phase 3: Remove CommonJS exports
// module.js - Pure ES6
export const log = (message) => console.log(message);
```

### 2. Converting Large Monolithic Files

**✅ Best Practice**: Extract systematically (Phase 16 approach)
```javascript
// Phase 1: Identify extraction candidates
// - Utility functions → utils/
// - Service classes → services/
// - Display components → display/
// - Orchestrator classes → coordination/

// Phase 2: Extract to separate modules
// Before: monolithic.js (6000+ lines)
// After: 
// - utils/logger.js
// - services/GeolocationService.js
// - display/LocationDisplayer.js
// - coordination/WebGeocodingManager.js

// Phase 3: Update imports in main file
// main.js
import { log } from './utils/logger.js';
import { GeolocationService } from './services/GeolocationService.js';
import { LocationDisplayer } from './display/LocationDisplayer.js';
import { WebGeocodingManager } from './coordination/WebGeocodingManager.js';
```

### 3. Maintaining Backward Compatibility

**✅ Best Practice**: Provide compatibility layers
```javascript
// main.js - New modular exports
export { log, warn, error } from './utils/logger.js';
export { GeolocationService } from './services/GeolocationService.js';
export { WebGeocodingManager } from './coordination/WebGeocodingManager.js';

// Also provide window globals for backward compatibility
if (typeof window !== 'undefined') {
    window.GeolocationService = GeolocationService;
    window.WebGeocodingManager = WebGeocodingManager;
}
```

## Troubleshooting Guide

### 1. "Cannot use import statement outside a module"

**Problem**: ES6 imports in non-module context
```
Uncaught SyntaxError: Cannot use import statement outside a module
```

**Solutions**:
```html
<!-- ✅ Solution 1: Add type="module" to script tag -->
<script type="module" src="./app.js"></script>

<!-- ✅ Solution 2: Use .mjs extension -->
<script type="module" src="./app.mjs"></script>

<!-- ✅ Solution 3: Configure package.json -->
{
  "type": "module"
}
```

### 2. "The requested module does not provide an export named 'X'"

**Problem**: Import name doesn't match export name
```
The requested module './utils/logger.js' does not provide an export named 'logError'
```

**Solutions**:
```javascript
// ✅ Check what's actually exported
console.log(Object.keys(await import('./utils/logger.js')));

// ✅ Use correct import names
import { error } from './utils/logger.js';  // Not 'logError'

// ✅ Use aliases if needed
import { error as logError } from './utils/logger.js';
```

### 3. "Failed to resolve module specifier"

**Problem**: Incorrect import paths
```
Failed to resolve module specifier "./utils/logger". Relative references must start with either "/", "./", or "../".
```

**Solutions**:
```javascript
// ❌ Bad - Missing file extension
import { log } from './utils/logger';

// ✅ Good - Include .js extension
import { log } from './utils/logger.js';

// ✅ Good - Use relative paths correctly
import { log } from '../utils/logger.js';
import { log } from '/absolute/path/logger.js';
```

### 4. Circular Dependency Warnings

**Problem**: Modules importing each other
```
Warning: Detected circular dependency: A -> B -> A
```

**Solutions**:
```javascript
// ✅ Solution 1: Extract shared dependencies
// shared.js
export const CONSTANTS = { /* ... */ };

// module-a.js
import { CONSTANTS } from './shared.js';

// module-b.js  
import { CONSTANTS } from './shared.js';

// ✅ Solution 2: Use dependency injection
// Instead of importing directly, inject dependencies
class ServiceA {
    constructor(serviceB) {
        this.serviceB = serviceB;
    }
}
```

## Real-World Examples

### 1. Logger Module (Utility Pattern)

```javascript
// src/utils/logger.js
/**
 * Logging utilities with consistent formatting
 */

const formatTimestamp = () => new Date().toISOString();

export const log = (message, ...params) => {
    console.log(`[${formatTimestamp()}]`, message, ...params);
};

export const warn = (message, ...params) => {
    console.warn(`[${formatTimestamp()}]`, message, ...params);
};

export const error = (message, ...params) => {
    console.error(`[${formatTimestamp()}]`, message, ...params);
};

// Named exports allow tree shaking and clear imports
```

### 2. Service Class (Default Export Pattern)

```javascript
// src/services/GeolocationService.js
/**
 * Geolocation service with error handling
 */

export default class GeolocationService {
    constructor(options = {}) {
        this.options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000,
            ...options
        };
    }

    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                this.options
            );
        });
    }

    watchPosition(callback, errorCallback) {
        if (!navigator.geolocation) {
            errorCallback?.(new Error('Geolocation not supported'));
            return null;
        }

        return navigator.geolocation.watchPosition(
            callback,
            errorCallback,
            this.options
        );
    }
}

// Export additional utilities if needed
export const isGeolocationSupported = () => 'geolocation' in navigator;
export const calculateDistance = (pos1, pos2) => { /* ... */ };
```

### 3. Orchestrator Class (Mixed Export Pattern)

```javascript
// src/coordination/WebGeocodingManager.js
/**
 * Main orchestrator for geolocation system
 */

import { log, warn, error } from '../utils/logger.js';
import GeolocationService from '../services/GeolocationService.js';
import LocationDisplayer from '../display/LocationDisplayer.js';

export default class WebGeocodingManager {
    constructor(dependencies = {}) {
        this.logger = dependencies.logger || { log, warn, error };
        this.geolocationService = dependencies.geolocationService || new GeolocationService();
        this.displayer = dependencies.displayer || new LocationDisplayer();
        
        this.observers = [];
        this.isTracking = false;
    }

    async initialize() {
        try {
            this.log('WebGeocodingManager initializing...');
            
            // Initialize UI elements
            this.initializeUI();
            
            // Set up event listeners
            this.bindEvents();
            
            this.log('WebGeocodingManager initialized successfully');
        } catch (error) {
            this.error('Failed to initialize WebGeocodingManager:', error);
            throw error;
        }
    }

    async startTracking() {
        if (this.isTracking) {
            this.warn('Tracking already started');
            return;
        }

        try {
            const position = await this.geolocationService.getCurrentPosition();
            this.handlePositionUpdate(position);
            this.isTracking = true;
            this.log('Location tracking started');
        } catch (error) {
            this.error('Failed to start tracking:', error);
            throw error;
        }
    }

    addObserver(observer) {
        if (observer && typeof observer.update === 'function') {
            this.observers.push(observer);
            this.log(`Observer added. Total: ${this.observers.length}`);
        } else {
            this.warn('Invalid observer provided');
        }
    }

    notifyObservers(data) {
        this.observers.forEach(observer => {
            try {
                observer.update(data);
            } catch (error) {
                this.error('Observer notification failed:', error);
            }
        });
    }

    handlePositionUpdate(position) {
        const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
        };

        // Update display
        this.displayer.updateLocation(locationData);
        
        // Notify observers
        this.notifyObservers(locationData);
        
        this.log('Position updated:', locationData);
    }

    // Delegate logging to injected logger
    log(message, ...params) {
        this.logger.log(message, ...params);
    }

    warn(message, ...params) {
        this.logger.warn(message, ...params);
    }

    error(message, ...params) {
        this.logger.error(message, ...params);
    }
}

// Export utility functions for creating managers
export const createManager = (dependencies) => {
    return new WebGeocodingManager(dependencies);
};

export const createManagerWithDefaults = () => {
    return new WebGeocodingManager({
        geolocationService: new GeolocationService({
            enableHighAccuracy: true,
            timeout: 10000
        })
    });
};

// Export configuration helpers
export const DEFAULT_CONFIG = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 60000
};
```

### 4. Barrel Export (Index Pattern)

```javascript
// src/index.js - Main entry point
/**
 * Main entry point for the geolocation system
 * Provides clean, organized exports for consumers
 */

// Core orchestration
export { default as WebGeocodingManager } from './coordination/WebGeocodingManager.js';

// Services
export { default as GeolocationService } from './services/GeolocationService.js';
export { default as GeocodingService } from './services/GeocodingService.js';

// Display components
export { default as LocationDisplayer } from './display/LocationDisplayer.js';
export { default as StatusDisplayer } from './display/StatusDisplayer.js';

// Utilities
export { log, warn, error } from './utils/logger.js';
export { formatCoordinates, calculateDistance } from './utils/helpers.js';

// Re-export from services for convenience
export { 
    isGeolocationSupported,
    calculateDistance 
} from './services/GeolocationService.js';

// Provide backward compatibility
if (typeof window !== 'undefined') {
    // Make available globally for legacy code
    const modules = await import('./index.js');
    Object.assign(window, modules);
}

// Export version information
export const VERSION = '1.0.0';
export const BUILD_DATE = '2024-12-28';
```

### 5. HTML Integration Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ES6 Module Example</title>
    
    <!-- Preload critical modules -->
    <link rel="modulepreload" href="./src/index.js">
    <link rel="modulepreload" href="./src/coordination/WebGeocodingManager.js">
</head>
<body>
    <div id="location-display"></div>
    <div id="status-display"></div>
    <button id="start-tracking">Start Tracking</button>

    <!-- ES6 Module Script -->
    <script type="module">
        import { 
            WebGeocodingManager, 
            GeolocationService, 
            LocationDisplayer,
            log 
        } from './src/index.js';

        // Initialize system
        async function initializeApp() {
            try {
                log('Initializing geolocation app...');

                // Create dependencies
                const dependencies = {
                    geolocationService: new GeolocationService({
                        enableHighAccuracy: true,
                        timeout: 10000
                    }),
                    displayer: new LocationDisplayer({
                        displayElement: document.getElementById('location-display'),
                        statusElement: document.getElementById('status-display')
                    })
                };

                // Create and initialize manager
                const manager = new WebGeocodingManager(dependencies);
                await manager.initialize();

                // Set up UI event handlers
                document.getElementById('start-tracking').addEventListener('click', async () => {
                    try {
                        await manager.startTracking();
                        log('Tracking started successfully');
                    } catch (error) {
                        console.error('Failed to start tracking:', error);
                    }
                });

                log('App initialized successfully');
            } catch (error) {
                console.error('Failed to initialize app:', error);
            }
        }

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeApp);
        } else {
            initializeApp();
        }
    </script>

    <!-- Fallback for non-module browsers -->
    <script nomodule>
        console.warn('ES6 modules not supported. Please use a modern browser.');
        document.body.innerHTML = '<p>This application requires a modern browser with ES6 module support.</p>';
    </script>
</body>
</html>
```

## Conclusion

This guide provides comprehensive best practices for ES6 import/export systems based on real-world experience from the guia.js modularization project. Following these patterns will help you create maintainable, scalable, and error-free module systems.

### Key Takeaways

1. **Use named exports** for utilities and multiple functions
2. **Use default exports** for main classes and primary functionality  
3. **Match import names exactly** with export names
4. **Add `type="module"`** to HTML script tags
5. **Organize modules by functionality**, not by file type
6. **Keep modules focused** and reasonably sized
7. **Provide barrel exports** for clean consumer interfaces
8. **Test module boundaries** and integration points
9. **Plan migration strategies** for legacy codebases
10. **Use consistent naming conventions** across your project

### Additional Resources

- [MDN ES6 Modules Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [guia.js Module Documentation](./MODULES.md)
- [Jest ES6 Module Configuration](./JEST_COMMONJS_ES6_GUIDE.md)
- [Phase 16 Extraction Documentation](../CLASS_EXTRACTION_PHASE_16.md)

---

**Document Version**: 1.0.0  
**Last Updated**: 2024-12-28  
**Author**: Marcelo Pereira Barbosa  
**Project**: guia.js ES6 Modularization