# Guia Turístico Project Structure Documentation

**Version:** 0.7.0-alpha  
**Last Updated:** 2026-01-06  
**Project Type:** Tourist Guide Web Application

## Overview

Guia.js is a **reusable JavaScript library component** designed to be integrated into the [mpbarbosa.com](https://www.mpbarbosa.com) personal website. This is **NOT** a standalone GitHub Pages site.

### Repository Relationships

```
Personal Site Architecture:
├── Source Repository: https://github.com/mpbarbosa/mpbarbosa_site
├── Staging Repository: https://github.com/mpbarbosa/mpbarbosa.com  
└── Component Libraries:
    └── guia_js (this project) - Brazilian geolocation library
```

## Directory Structure

```
guia_turistico/
├── src/                          # Source code (modularized library)
│   ├── guia.js                   # Main entry point and exports
│   ├── guia_ibge.js              # IBGE utilities
│   ├── app.js                    # Application entry point
│   ├── index.html                # Demo/documentation page
│   ├── config/                   # Configuration constants
│   │   └── defaults.js           # Default settings and values
│   ├── coordination/             # Coordination and orchestration
│   ├── core/                     # Core domain classes
│   ├── data/                     # Data processing and models
│   ├── html/                     # UI display components
│   ├── services/                 # External service integrations
│   │   └── providers/            # Geolocation providers
│   ├── speech/                   # Speech synthesis
│   ├── status/                   # Status management
│   │   └── SingletonStatusManager.js  # Global status tracking
│   ├── timing/                   # Performance timing utilities
│   │   └── Chronometer.js        # Elapsed time tracker
│   ├── utils/                    # Utility functions
│   │   ├── distance.js           # Haversine distance calculations
│   │   ├── device.js             # Device/browser detection
│   │   └── logger.js             # Logging with timestamps
│   └── *.css files               # Modular stylesheets
│
├── __tests__/                    # Jest test suites (1,399 total tests)
├── examples/                     # Usage examples
├── docs/                         # Documentation
│
├── test.html                     # Primary manual test page
├── *-test.html                   # Specialized test pages
│
├── package.json                  # npm configuration
├── eslint.config.js              # ESLint configuration
└── README.md                     # Project documentation
```

## Project Purpose

### Primary Purpose
- **Reusable library component** for Brazilian address geolocation
- Integrated into mpbarbosa.com personal website
- Provides geolocation, geocoding, and address standardization features

### NOT Intended For
- ❌ Standalone GitHub Pages deployment
- ❌ Independent website hosting
- ❌ Direct end-user application

## Source Organization

### `/src` Directory
The `/src` directory contains the **modularized source code** for the library:

- **Purpose**: Organize source files for library distribution
- **Structure**: Modularized classes following separation of concerns
- **Usage**: Imported by integration projects (mpbarbosa.com site)
- **Standard Practice**: Common pattern for JavaScript libraries

### Root Directory Test Files
Test HTML files in root directory are for **development and validation**:

- `test.html` - Primary manual testing interface
- `brazilian-voice-test.html` - Speech synthesis testing
- `device-detection-test.html` - Device detection validation
- `ibira-test.html` - Ibirapuera Park integration testing
- And 7 more specialized test files

All test files reference source modules from `/src` directory.

## Historical Context

### Directory Restructuring (July 2025)
**Commit:** `bf63e15` - "estruturando os diretorios. /src para o github pages"

**What Actually Happened:**
- Moved `index.html` from root to `/src/index.html`
- Created standard library directory structure with `/src`
- Organized modularized source files

**Misleading Commit Message:**
- Message mentioned "GitHub pages" but this was **incorrect**
- Actual purpose: Standard library source organization
- `/src` structure is for **library distribution**, not GitHub Pages

**Correction:**
The commit message should have been: *"estruturando os diretorios. /src para organização de biblioteca"* (restructuring directories. /src for library organization)

## Integration with mpbarbosa.com

### How Guia.js Integrates

```javascript
// In mpbarbosa.com site:
import { WebGeocodingManager, ReverseGeocoder } from './libs/guia_js/src/guia.js';

// Use the library components
const manager = new WebGeocodingManager(document, 'result-area');
manager.geocode();
```

### Development Workflow

1. **Develop in guia_js repository**
   - Edit source files in `/src`
   - Run tests: `npm run test:all`
   - Validate with test.html

2. **Integrate into mpbarbosa_site**
   - Reference guia_js as dependency or submodule
   - Import required modules
   - Deploy to staging (mpbarbosa.com)

3. **Production deployment**
   - Production site pulls from staging
   - Library remains as component

## CDN Distribution

While not a GitHub Pages site, guia_js is distributed via jsDelivr CDN:

```html
<!-- CDN usage in mpbarbosa.com -->
<script type="module">
  import { WebGeocodingManager } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/guia_js@0.6.0-alpha/src/guia.js';
</script>
```

See `cdn-urls.txt` for current CDN URLs.

## Source Directory Details

### Timing Module (`/src/timing/`)

The timing module provides performance and elapsed time tracking utilities for the application.

#### Components

**`Chronometer.js`** (305 lines, 9.7KB)
- **Purpose**: Tracks and displays elapsed time since last position update
- **Pattern**: Observer pattern implementation
- **Version**: Since 0.8.3-alpha
- **Test Coverage**: 51 tests in `__tests__/unit/Chronometer.test.js`

**Key Features**:
- Start/stop/reset timer functionality
- HH:MM:SS time formatting
- Automatic display updates (1-second interval)
- Observer pattern integration with PositionManager
- Error and loading state handling
- Configurable event names for flexibility

**Public Methods**:
```javascript
start()        // Starts the chronometer
stop()         // Stops timing and interval updates
reset()        // Resets elapsed time to zero
update()       // Observer pattern callback (position updates)
getElapsedTime()  // Returns elapsed time in milliseconds
formatTime()   // Formats milliseconds to HH:MM:SS
toString()     // Debug representation
```

**Usage Example**:
```javascript
import Chronometer from './timing/Chronometer.js';

// Create chronometer
const element = document.getElementById('timer-display');
const chronometer = new Chronometer(element);

// Subscribe to position updates (observer pattern)
PositionManager.getInstance().subscribe(chronometer);

// Manual control
chronometer.start();  // Begin timing
chronometer.stop();   // Pause timing
chronometer.reset();  // Reset to 00:00:00
```

**Observer Pattern Integration**:
```javascript
// Chronometer responds to position events:
// - 'strCurrPosUpdate': Position successfully updated → reset & restart
// - 'strImmediateAddressUpdate': Immediate address update → reset & restart
// - 'strCurrPosNotUpdate': Position rejected → continue if running
// - Error states: Stop and display "Error"
// - Loading states: Display "Loading..."
```

**Custom Event Configuration**:
```javascript
// Configure custom event names
const chronometer = new Chronometer(element, {
  positionUpdate: 'location.updated',
  immediateAddressUpdate: 'address.immediate',
  positionNotUpdate: 'location.rejected'
});
```

**Integration Points**:
- Used by `WebGeocodingManager` for timing display
- Exported in `src/guia.js` main entry point
- Tested in `__tests__/unit/Chronometer.test.js`

**Design Decisions**:
- **Observer Pattern**: Decouples timing from position management
- **Immutable Time**: Uses timestamps, not mutable counters
- **DOM Optional**: Works with or without element (headless mode)
- **Event Injection**: Configurable event names for reusability

## Development Commands

```bash
# Install dependencies
npm install

# Validate source code
npm run validate

# Run automated tests
npm test

# Run with coverage
npm run test:coverage

# Full validation
npm run test:all

# Start dev server for manual testing
python3 -m http.server 9000
# Then open: http://localhost:9000/test.html
```

## Key Principles

1. **Component Library**: This is a library, not an application
2. **Integration Focus**: Designed for mpbarbosa.com integration
3. **Modular Structure**: `/src` contains organized, importable modules
4. **Test-Driven**: 1224+ tests ensure reliability
5. **Standards Compliant**: ES6 modules, immutability patterns

## References

- **Main README**: `/README.md`
- **Module Documentation**: `/docs/MODULES.md`
- **Testing Guide**: `/docs/TESTING.md`
- **Contributing**: `/.github/CONTRIBUTING.md`
- **GitHub Copilot Instructions**: `/.github/copilot-instructions.md`

## Summary

**Guia.js is a JavaScript library component, not a GitHub Pages site.** The `/src` directory structure is standard library organization for modularized source code. The project integrates into the mpbarbosa.com personal website and is distributed via CDN for reusability.

The historical commit message mentioning "GitHub Pages" was misleading - the actual purpose was standard library source organization following best practices for JavaScript libraries.
