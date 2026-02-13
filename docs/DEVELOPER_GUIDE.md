# Developer Guide - Guia Turístico

**Comprehensive guide for developers contributing to or extending Guia Turístico.**

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Setup](#development-setup)
3. [Code Organization](#code-organization)
4. [Design Patterns](#design-patterns)
5. [Testing Strategy](#testing-strategy)
6. [Contributing Guidelines](#contributing-guidelines)
7. [Performance Optimization](#performance-optimization)
8. [Debugging Guide](#debugging-guide)

---

## Architecture Overview

### High-Level Architecture

Guia Turístico follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────┐
│         Presentation Layer (Views)           │
│  - home.js, converter.js                    │
│  - User interaction handling                 │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│        Coordination Layer                    │
│  - WebGeocodingManager                      │
│  - ServiceCoordinator                       │
│  - Orchestrates services & displayers       │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Service Layer                        │
│  - GeolocationService (Browser API)         │
│  - ReverseGeocoder (OpenStreetMap)         │
│  - SpeechSynthesisManager                   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          Data Layer                          │
│  - BrazilianStandardAddress                 │
│  - GeoPosition (immutable)                  │
│  - AddressCache (with LRU eviction)         │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Display Layer (HTML)                 │
│  - HTMLPositionDisplayer                    │
│  - HTMLAddressDisplayer                     │
│  - HTMLHighlightCardsDisplayer              │
│  - HTMLSidraDisplayer                       │
└─────────────────────────────────────────────┘
```

### Core Design Principles

1. **Immutability First**
   - All data objects are immutable
   - Use spread operator, `filter()`, `map()` instead of mutations
   - See `.github/CONTRIBUTING.md` for guidelines

2. **Observer Pattern**
   - Components communicate via observer notifications
   - `ObserverSubject` base class for observable objects
   - Decouples components for testability

3. **Single Responsibility**
   - Each class has one clear purpose
   - Small, focused classes (150-500 lines)
   - Easy to test and maintain

4. **Composition Over Inheritance**
   - Manager classes use composition
   - Example: `SpeechSynthesisManager` composes 4 focused components

5. **Dependency Injection**
   - Services receive dependencies via constructor
   - Enables easy mocking in tests

---

## Development Setup

### Initial Setup

See [GETTING_STARTED.md](./GETTING_STARTED.md) for basic setup.

### Development Tools

#### ESLint Configuration

```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint:fix
```

**Configuration**: `eslint.config.js` (ESLint v9 flat config)

#### Git Hooks (Husky)

Pre-commit hooks automatically run:
- Syntax validation (`node -c`)
- Unit tests

Pre-push hooks run:
- Full test suite

**Manual trigger**:
```bash
.husky/pre-commit
.husky/pre-push
```

#### Local CI/CD Testing

Test workflow locally before pushing:

```bash
.github/scripts/test-workflow-locally.sh
```

This simulates GitHub Actions workflow.

---

## Code Organization

### Directory Structure

```
src/
├── app.js                    # SPA entry point
├── index.html               # Main HTML page
├── config/                  # Configuration
│   └── defaults.js          # Constants (timing, events)
├── core/                    # Core architecture
│   ├── GeoPosition.js       # Immutable position value object
│   ├── PositionManager.js   # Singleton position state
│   └── ObserverSubject.js   # Observer pattern base class
├── services/                # External API services
│   ├── GeolocationService.js      # Browser Geolocation API
│   ├── ReverseGeocoder.js         # OpenStreetMap Nominatim
│   └── APIFetcher.js              # Base API client
├── coordination/            # Service coordinators
│   ├── WebGeocodingManager.js     # Main coordinator
│   └── ServiceCoordinator.js      # Service lifecycle
├── data/                    # Data models
│   ├── BrazilianStandardAddress.js # Address model
│   ├── AddressExtractor.js         # Extract from API
│   ├── AddressCache.js             # Caching with LRU
│   ├── AddressChangeDetector.js    # Change detection
│   ├── CallbackRegistry.js         # Callback management
│   ├── AddressDataStore.js         # Address storage
│   └── ReferencePlace.js           # POI model
├── html/                    # UI displayers
│   ├── HTMLPositionDisplayer.js        # Coordinates
│   ├── HTMLAddressDisplayer.js         # Address
│   ├── HTMLHighlightCardsDisplayer.js  # Municipality/bairro
│   ├── HTMLReferencePlaceDisplayer.js  # POI
│   ├── HTMLSidraDisplayer.js           # Population stats
│   └── DisplayerFactory.js             # Factory pattern
├── speech/                  # Speech synthesis
│   ├── SpeechSynthesisManager.js  # Main orchestrator
│   ├── VoiceLoader.js             # Voice loading
│   ├── VoiceSelector.js           # Voice selection
│   ├── SpeechConfiguration.js     # Rate/pitch config
│   ├── SpeechQueue.js             # Queue data structure
│   └── SpeechItem.js              # Queue items
├── timing/                  # Performance timing
│   └── Chronometer.js       # Elapsed time tracking
├── utils/                   # Utilities
│   ├── TimerManager.js      # Centralized timer management
│   └── button-status.js     # Button status messages
└── views/                   # View controllers
    ├── home.js              # Home view (location tracking)
    └── converter.js         # Converter view
```

### File Naming Conventions

- **PascalCase**: Classes (e.g., `PositionManager.js`)
- **camelCase**: Utilities, modules (e.g., `button-status.js`)
- **UPPERCASE**: Constants (e.g., `defaults.js` exports)
- **kebab-case**: CSS files (e.g., `highlight-cards.css`)

---

## Design Patterns

### 1. Singleton Pattern

**Used for**: Global state management

**Example**: `PositionManager`

```javascript
// src/core/PositionManager.js
class PositionManager extends ObserverSubject {
  static #instance = null;
  
  static getInstance() {
    if (!PositionManager.#instance) {
      PositionManager.#instance = new PositionManager();
    }
    return PositionManager.#instance;
  }
  
  // Private constructor
  constructor() {
    if (PositionManager.#instance) {
      throw new Error("Use getInstance()");
    }
    super();
  }
}

// Usage
const positionManager = PositionManager.getInstance();
```

**Why**: Ensures single source of truth for current position.

### 2. Observer Pattern

**Used for**: Component communication

**Example**: Position updates

```javascript
// Subject (Observable)
class PositionManager extends ObserverSubject {
  updatePosition(newPosition) {
    this.#currentPosition = newPosition;
    this.notifyObservers('positionUpdated', newPosition);
  }
}

// Observer
class MyObserver {
  constructor() {
    const positionManager = PositionManager.getInstance();
    positionManager.attach(this);
  }
  
  update(eventType, data) {
    if (eventType === 'positionUpdated') {
      console.log('New position:', data);
    }
  }
}
```

**Why**: Decouples components, enables reactive updates.

### 3. Factory Pattern

**Used for**: Creating display components

**Example**: `DisplayerFactory`

```javascript
// src/html/DisplayerFactory.js
class DisplayerFactory {
  static createPositionDisplayer(document) {
    return new HTMLPositionDisplayer(
      document,
      'position-display-area'
    );
  }
  
  static createAddressDisplayer(document) {
    return new HTMLAddressDisplayer(
      document,
      'address-display-area'
    );
  }
  
  // ... more factory methods
}

// Usage
const positionDisplayer = DisplayerFactory.createPositionDisplayer(document);
const addressDisplayer = DisplayerFactory.createAddressDisplayer(document);
```

**Why**: Centralizes object creation, enables easy configuration changes.

### 4. Composition Pattern

**Used for**: Complex managers with multiple responsibilities

**Example**: `SpeechSynthesisManager` (v0.9.0+)

```javascript
// Manager composes focused components
class SpeechSynthesisManager {
  constructor() {
    this.voiceLoader = new VoiceLoader();
    this.voiceSelector = new VoiceSelector();
    this.configuration = new SpeechConfiguration();
    this.queue = new SpeechQueue();
  }
  
  async speak(text, priority = 'normal') {
    const voices = await this.voiceLoader.loadVoices();
    const voice = this.voiceSelector.selectVoice(voices, 'pt-BR');
    const rate = this.configuration.getRate();
    
    this.queue.enqueue(new SpeechItem(text, voice, rate, priority));
    this.processQueue();
  }
}
```

**Why**: Each component has single responsibility, easier to test.

### 5. Value Object Pattern

**Used for**: Immutable data objects

**Example**: `GeoPosition`

```javascript
// src/core/GeoPosition.js
class GeoPosition {
  #latitude;
  #longitude;
  #accuracy;
  #timestamp;
  
  constructor(latitude, longitude, accuracy = null, timestamp = Date.now()) {
    // Validate and freeze
    this.#latitude = this.#validateLatitude(latitude);
    this.#longitude = this.#validateLongitude(longitude);
    this.#accuracy = accuracy;
    this.#timestamp = timestamp;
    
    Object.freeze(this); // Immutable
  }
  
  get latitude() { return this.#latitude; }
  get longitude() { return this.#longitude; }
  
  // No setters - object is immutable
  
  toJSON() {
    return {
      latitude: this.#latitude,
      longitude: this.#longitude,
      accuracy: this.#accuracy,
      timestamp: this.#timestamp
    };
  }
}

// Usage
const position1 = new GeoPosition(-23.550520, -46.633309);
// position1.latitude = 0; // Error: no setter

// Create new object for updates
const position2 = new GeoPosition(-23.550521, -46.633310);
```

**Why**: Immutability prevents bugs, simplifies reasoning.

---

## Testing Strategy

### Test Organization

```
__tests__/
├── unit/               # Unit tests (isolated)
│   ├── core/
│   ├── services/
│   ├── data/
│   └── utils/
├── integration/        # Integration tests (multiple components)
│   ├── address-extraction/
│   ├── geocoding/
│   └── speech/
├── e2e/               # End-to-end tests (full workflows)
│   ├── CompleteGeolocationWorkflow.e2e.test.js
│   └── NeighborhoodChangeWhileDriving.e2e.test.js
├── managers/          # Manager class tests
├── external/          # External API tests
└── features/          # Feature-based tests
```

### Test Coverage Goals

| Layer | Target Coverage | Current |
|-------|----------------|---------|
| Core | 100% | 95%+ |
| Services | 90%+ | 85%+ |
| Data | 90%+ | 88%+ |
| HTML | 80%+ | 75%+ |
| Overall | 85%+ | ~85% |

### Writing Tests

#### Unit Test Example

```javascript
// __tests__/unit/core/GeoPosition.test.js
import { GeoPosition } from '../../../src/core/GeoPosition.js';

describe('GeoPosition', () => {
  describe('constructor', () => {
    it('should create immutable position object', () => {
      const position = new GeoPosition(-23.550520, -46.633309);
      
      expect(position.latitude).toBe(-23.550520);
      expect(position.longitude).toBe(-46.633309);
      
      // Test immutability
      expect(() => {
        position.latitude = 0;
      }).toThrow();
    });
    
    it('should validate latitude range', () => {
      expect(() => {
        new GeoPosition(91, 0); // Invalid
      }).toThrow('Latitude must be between -90 and 90');
    });
  });
  
  describe('toJSON', () => {
    it('should serialize to JSON', () => {
      const position = new GeoPosition(-23.550520, -46.633309, 10);
      const json = position.toJSON();
      
      expect(json).toEqual({
        latitude: -23.550520,
        longitude: -46.633309,
        accuracy: 10,
        timestamp: expect.any(Number)
      });
    });
  });
});
```

#### Integration Test Example

```javascript
// __tests__/integration/geocoding/address-extraction.integration.test.js
import { ReverseGeocoder } from '../../../src/services/ReverseGeocoder.js';
import { AddressExtractor } from '../../../src/data/AddressExtractor.js';

describe('Address Extraction Integration', () => {
  it('should extract Brazilian address from Nominatim response', async () => {
    // São Paulo coordinates
    const geocoder = new ReverseGeocoder(-23.550520, -46.633309);
    const nominatimData = await geocoder.fetchAddress();
    
    const extractor = new AddressExtractor(nominatimData);
    const address = extractor.extractBrazilianAddress();
    
    expect(address.municipio).toBe('São Paulo');
    expect(address.uf).toBe('SP');
    expect(address.pais).toBe('Brasil');
  });
});
```

#### E2E Test Example

```javascript
// __tests__/e2e/CompleteGeolocationWorkflow.e2e.test.js
import puppeteer from 'puppeteer';

describe('Complete Geolocation Workflow', () => {
  let browser, page;
  
  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true });
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  beforeEach(async () => {
    page = await browser.newPage();
    
    // Mock geolocation
    await page.evaluateOnNewDocument(() => {
      navigator.geolocation.getCurrentPosition = (success) => {
        success({
          coords: {
            latitude: -23.550520,
            longitude: -46.633309,
            accuracy: 10
          }
        });
      };
    });
    
    await page.goto('http://localhost:9877/src/index.html');
  });
  
  it('should display coordinates and address after clicking button', async () => {
    // Click geolocation button
    await page.click('#get-location-btn');
    
    // Wait for coordinates
    await page.waitForSelector('#coordinates-display');
    const coords = await page.$eval('#coordinates-display', el => el.textContent);
    expect(coords).toContain('-23.550520');
    
    // Wait for address
    await page.waitForSelector('#address-display', { timeout: 10000 });
    const address = await page.$eval('#address-display', el => el.textContent);
    expect(address).toContain('São Paulo');
  });
});
```

### Running Tests

```bash
# All tests (~65 seconds)
npm test

# Specific test file
npm test -- __tests__/unit/core/GeoPosition.test.js

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests only
npm test -- __tests__/e2e/
```

---

## Contributing Guidelines

### Code Style

#### Immutability

```javascript
// ❌ Bad: Mutates array
const items = [];
items.push(newItem);
items.sort();

// ✅ Good: Creates new array
const items = [];
const newItems = [...items, newItem];
const sortedItems = [...newItems].sort();
```

#### Async/Await

```javascript
// ❌ Bad: Promise chaining
fetchAddress()
  .then(data => processData(data))
  .then(result => displayResult(result))
  .catch(err => handleError(err));

// ✅ Good: Async/await
async function handleAddress() {
  try {
    const data = await fetchAddress();
    const result = await processData(data);
    displayResult(result);
  } catch (err) {
    handleError(err);
  }
}
```

#### Error Handling

```javascript
// ✅ Always handle errors
async function fetchData() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error; // Re-throw for caller to handle
  }
}
```

### Timer Management

**ALWAYS use `TimerManager` for timers**:

```javascript
import { timerManager } from '../utils/TimerManager.js';

// ❌ Bad: Direct timer (causes memory leaks)
const intervalId = setInterval(() => {
  updateDisplay();
}, 1000);

// ✅ Good: TimerManager
const timerId = timerManager.setInterval(() => {
  updateDisplay();
}, 1000, 'display-update-timer');

// Cleanup
timerManager.clearTimer('display-update-timer');
```

### Adding New Features

1. **Create branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Write tests first** (TDD):
   ```bash
   touch __tests__/unit/your-feature.test.js
   npm run test:watch
   ```

3. **Implement feature**:
   - Follow existing patterns
   - Use TypeDoc comments for public APIs
   - Ensure immutability

4. **Validate**:
   ```bash
   npm run test:all
   .github/scripts/test-workflow-locally.sh
   ```

5. **Commit**:
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

6. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add neighborhood tracking
fix: correct coordinate validation
docs: update API reference
test: add integration tests for address extraction
refactor: extract voice loading to separate class
perf: optimize address caching
chore: update dependencies
```

---

## Performance Optimization

### Throttling and Debouncing

```javascript
// Throttle position updates (20m or 30s threshold)
import { MINIMUM_DISTANCE_CHANGE, MINIMUM_TIME_CHANGE } from '../config/defaults.js';

const shouldUpdate = (oldPos, newPos, lastUpdateTime) => {
  const distance = calculateDistance(oldPos, newPos);
  const timeElapsed = Date.now() - lastUpdateTime;
  
  return distance >= MINIMUM_DISTANCE_CHANGE || 
         timeElapsed >= MINIMUM_TIME_CHANGE;
};
```

### Caching

```javascript
// Address caching with LRU eviction
import { AddressCache } from '../data/AddressCache.js';

const cache = new AddressCache(maxSize = 100);

// Check cache before API call
const cachedAddress = cache.get(coordinateKey);
if (cachedAddress) {
  return cachedAddress;
}

// Cache API response
const address = await fetchFromAPI();
cache.set(coordinateKey, address);
```

### Lazy Loading

```javascript
// Lazy load displayers
let sidraDisplayer = null;

function getSidraDisplayer() {
  if (!sidraDisplayer) {
    sidraDisplayer = new HTMLSidraDisplayer(document);
  }
  return sidraDisplayer;
}
```

---

## Debugging Guide

### Browser DevTools

```javascript
// Enable verbose logging
localStorage.setItem('debug', 'true');

// Check observer notifications
window.addEventListener('addressFetched', (event) => {
  console.log('Address fetched:', event.detail);
});
```

### Network Debugging

```javascript
// Monitor API calls
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('nominatim'))
  .forEach(r => console.log(`${r.name}: ${r.duration}ms`));
```

### Memory Leaks

```javascript
// Check for timer leaks
console.log(timerManager.getActiveTimers());

// Profile memory
// Chrome DevTools → Memory → Take Heap Snapshot
```

---

## Next Steps

- **API Reference**: [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)
- **Integration**: [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- **Performance**: [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md)
- **Contributing**: [.github/CONTRIBUTING.md](../.github/CONTRIBUTING.md)

---

**Last Updated**: 2026-02-12  
**Version**: 0.9.0-alpha
