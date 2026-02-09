# Comprehensive Architecture Guide - Guia Turístico

**Version**: 0.8.7-alpha  
**Last Updated**: 2026-02-09  
**Status**: Production-ready (with 20 known failing tests)

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [Design Patterns](#design-patterns)
4. [Data Flow](#data-flow)
5. [Component Interaction](#component-interaction)
6. [External Dependencies](#external-dependencies)
7. [Configuration System](#configuration-system)
8. [State Management](#state-management)
9. [Error Handling Strategy](#error-handling-strategy)
10. [Performance Considerations](#performance-considerations)
11. [Security Architecture](#security-architecture)
12. [Testing Architecture](#testing-architecture)

---

## System Overview

### High-Level Architecture

Guia Turístico is a **Single-Page Application (SPA)** built on a **layered architecture** with clear separation of concerns. The application provides real-time location tracking and geographic information services specifically optimized for Brazilian addresses.

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface (HTML/CSS)                │
│                  (Material Design 3, Mobile-First)          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│                  View Controllers Layer                     │
│              (HomeView, ConverterView)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│                  UI/Display Layer                           │
│    (HTMLPositionDisplayer, HTMLAddressDisplayer, etc.)      │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│                  Coordination Layer                         │
│  (WebGeocodingManager, ServiceCoordinator, EventCoordinator)│
└───────┬──────────────────────────────┬─────────────────────┘
        │                              │
┌───────┴────────────┐        ┌────────┴──────────────────────┐
│   Service Layer    │        │    Data Processing Layer      │
│  (GeolocationService,       │  (BrazilianStandardAddress,   │
│   ReverseGeocoder)          │   AddressExtractor, Caches)   │
└────────┬───────────┘        └───────────┬───────────────────┘
         │                                │
┌────────┴────────────────────────────────┴───────────────────┐
│                  Core/Foundation Layer                      │
│     (PositionManager, GeoPosition, ObserverSubject)         │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

1. **Separation of Concerns**: Each layer has distinct responsibilities
2. **Immutability**: Data structures are immutable where possible
3. **Observer Pattern**: Loose coupling through event-driven communication
4. **Singleton Pattern**: Single source of truth for application state
5. **Dependency Injection**: Configuration injected rather than hardcoded
6. **Testability**: All layers independently testable

---

## Architecture Layers

### 1. Core/Foundation Layer (`src/core/`)

**Purpose**: Fundamental data structures and state management

**Key Components**:
- **PositionManager** (Singleton): Single source of truth for current position
- **GeoPosition**: Immutable position value object with convenience methods
- **GeocodingState**: State machine for geocoding operations
- **ObserverSubject**: Base class for observer pattern implementation

**Responsibilities**:
- Manage application-wide state (position, geocoding status)
- Provide immutable data structures
- Implement observer pattern for event distribution
- Enforce business rules (distance thresholds, accuracy validation)

**Design Patterns**: Singleton, Observer, Value Object, State Machine

---

### 2. Service Layer (`src/services/`)

**Purpose**: External integrations and browser API wrappers

**Key Components**:
- **GeolocationService**: Wrapper for browser Geolocation API
- **ReverseGeocoder**: OpenStreetMap Nominatim integration
- **ChangeDetectionCoordinator**: Detects significant location changes

**Responsibilities**:
- Abstract external APIs (browser, OpenStreetMap, IBGE, SIDRA)
- Handle network requests and responses
- Transform external data into internal formats
- Manage API rate limiting and error handling

**Integration Points**:
```javascript
// GeolocationService → Browser Geolocation API
navigator.geolocation.getCurrentPosition()

// ReverseGeocoder → OpenStreetMap Nominatim API
fetch('https://nominatim.openstreetmap.org/reverse?...')

// IBGE integration → Brazilian location data
fetch('https://servicodados.ibge.gov.br/api/v1/localidades/...')
```

---

### 3. Data Processing Layer (`src/data/`)

**Purpose**: Data extraction, transformation, validation, and caching

**Key Components**:
- **BrazilianStandardAddress**: Standardized Brazilian address structure
- **AddressExtractor**: Extract address data from Nominatim responses
- **AddressDataExtractor**: Complete address processing pipeline
- **AddressCache**: LRU cache for address lookups
- **ReferencePlace**: Reference location handling and categorization
- **LRUCache**: Generic LRU cache implementation

**Responsibilities**:
- Parse and validate external API responses
- Standardize address data for Brazilian context
- Cache frequently accessed data
- Extract and categorize reference places

**Data Flow Example**:
```
Nominatim API Response
  ↓
AddressExtractor (parse JSON)
  ↓
BrazilianStandardAddress (standardize)
  ↓
AddressCache (store for reuse)
  ↓
Display Layer (render to UI)
```

---

### 4. Coordination Layer (`src/coordination/`)

**Purpose**: Orchestrate multiple services and components

**Key Components**:
- **WebGeocodingManager**: Main application coordinator
- **ServiceCoordinator**: Service lifecycle management
- **EventCoordinator**: Event-based coordination
- **SpeechCoordinator**: Speech synthesis coordination
- **UICoordinator**: UI component coordination

**Responsibilities**:
- Coordinate interactions between layers
- Manage component lifecycle (initialization, cleanup)
- Distribute events to appropriate handlers
- Orchestrate complex workflows (position update → geocoding → display)

**Workflow Example**:
```javascript
// User clicks "Get Location" button
UICoordinator.handleLocationRequest()
  ↓
ServiceCoordinator.startGeolocation()
  ↓
GeolocationService.getCurrentPosition()
  ↓
PositionManager.update() [validates and stores]
  ↓
EventCoordinator.notifyObservers('positionUpdate')
  ↓
WebGeocodingManager.onPositionUpdate()
  ↓
ReverseGeocoder.fetchAddress()
  ↓
AddressDataExtractor.process()
  ↓
HTMLAddressDisplayer.display()
```

---

### 5. UI/Display Layer (`src/html/`)

**Purpose**: Render geographic data in the browser

**Key Components**:
- **HTMLPositionDisplayer**: Coordinate display and Google Maps links
- **HTMLAddressDisplayer**: Address formatting and display
- **HTMLHighlightCardsDisplayer**: Municipality and neighborhood cards
- **HTMLReferencePlaceDisplayer**: Reference place display
- **HTMLSidraDisplayer**: IBGE demographic statistics display
- **DisplayerFactory**: Factory for creating display components
- **HtmlText**: Text display utilities

**Responsibilities**:
- Update DOM elements with geographic data
- Format data for user-friendly display
- Generate dynamic links (Google Maps, IBGE)
- Handle accessibility (ARIA attributes, screen reader support)

**Display Components Pattern**:
```javascript
class HTMLAddressDisplayer {
  constructor(document, elementId) {
    this.element = document.getElementById(elementId);
  }
  
  display(addressData) {
    // Update DOM with formatted address
    this.element.innerHTML = this.formatAddress(addressData);
  }
}
```

---

### 6. View Controllers Layer (`src/views/`)

**Purpose**: SPA route handlers and view-specific logic

**Key Components**:
- **HomeView** (`home.js`): Main location tracking interface (595 lines)
- **ConverterView** (`converter.js`): Coordinate converter utility (521 lines)

**Responsibilities**:
- Handle route-specific initialization and cleanup
- Bind UI components to application logic
- Manage view-specific state
- Coordinate services for each view

**Routing Structure**:
```javascript
// app.js router
const routes = {
  '/': () => HomeView.initialize(),
  '/converter': () => ConverterView.initialize()
};
```

---

### 7. Speech Synthesis Layer (`src/speech/`)

**Purpose**: Text-to-speech functionality with queue management

**Key Components**:
- **SpeechSynthesisManager** (Facade): Main API for speech synthesis
- **SpeechController**: Core control logic
- **SpeechQueueProcessor**: Queue processing
- **VoiceManager**: Voice selection and management
- **SpeechConfiguration**: Configuration management
- **SpeechQueue**: Queue data structure
- **SpeechItem**: Individual speech item

**Responsibilities**:
- Manage speech synthesis queue
- Handle voice selection (Portuguese Brazilian voices)
- Coordinate speech playback
- Handle browser speech synthesis API

**Architecture**: Facade pattern wrapping complex subsystem

---

### 8. Performance & Timing Layer (`src/timing/`)

**Purpose**: Performance monitoring and timer management

**Key Components**:
- **Chronometer**: Performance timing with observer pattern (356 lines)
- **TimerManager**: Centralized timer management preventing leaks (147 lines)

**Responsibilities**:
- Track elapsed time for user-facing displays
- Monitor performance metrics
- Prevent timer memory leaks
- Centralize all setInterval/setTimeout calls

---

### 9. Status Management Layer (`src/status/`)

**Purpose**: Application-wide status tracking

**Key Components**:
- **SingletonStatusManager**: Singleton for status across components

**Responsibilities**:
- Track application state (loading, ready, error)
- Provide centralized status access
- Notify components of status changes

---

### 10. Utility Layer (`src/utils/`)

**Purpose**: Reusable helper functions

**Key Components**:
- **distance.js**: Haversine formula distance calculations
- **logger.js**: Logging with DOM and console output
- **device.js**: Device detection (mobile/desktop)
- **accessibility.js**: Accessibility helpers
- **button-utils.js**: Button state management

---

### 11. Configuration Layer (`src/config/`)

**Purpose**: Application configuration and constants

**Key Components**:
- **defaults.js** (130+ lines): Application constants
  - Event names: `ADDRESS_FETCHED_EVENT`, `POSITION_UPDATE_EVENT`
  - Thresholds: `MINIMUM_TIME_CHANGE = 30s`, `MINIMUM_DISTANCE_CHANGE = 20m`
  - Accuracy levels: `NOT_ACCEPTED_ACCURACY = ['medium', 'bad', 'very bad']`
- **version.js**: Version information

**Usage Pattern**:
```javascript
import { ADDRESS_FETCHED_EVENT, MINIMUM_DISTANCE_CHANGE } from './config/defaults.js';

// Use constants instead of hardcoded strings
observer.notify(ADDRESS_FETCHED_EVENT, data);
```

---

## Design Patterns

### 1. Singleton Pattern

**Usage**: PositionManager, SingletonStatusManager, TimerManager

**Purpose**: Ensure single source of truth for shared state

```javascript
class PositionManager {
  static #instance = null;
  
  static getInstance() {
    if (!PositionManager.#instance) {
      PositionManager.#instance = new PositionManager();
    }
    return PositionManager.#instance;
  }
}
```

**Benefits**:
- Single point of access for position data
- Prevents conflicting state across application
- Simplifies testing (reset singleton between tests)

---

### 2. Observer Pattern

**Usage**: PositionManager, ReverseGeocoder, Chronometer, various coordinators

**Purpose**: Loose coupling between components through event notifications

```javascript
class ObserverSubject {
  addObserver(eventName, callback) {
    this.observers[eventName] = this.observers[eventName] || [];
    this.observers[eventName].push(callback);
  }
  
  notifyObservers(eventName, data) {
    (this.observers[eventName] || []).forEach(callback => {
      callback(data);
    });
  }
}
```

**Benefits**:
- Decoupled communication between layers
- Easy to add new observers without modifying subjects
- Supports multiple observers per event

**Example Flow**:
```
PositionManager.update()
  → notifyObservers('positionUpdate')
    → WebGeocodingManager.onPositionUpdate()
    → HTMLPositionDisplayer.onPositionUpdate()
    → SpeechCoordinator.onPositionUpdate()
```

---

### 3. Factory Pattern

**Usage**: DisplayerFactory

**Purpose**: Centralize creation of display components

```javascript
class DisplayerFactory {
  static createPositionDisplayer(document, elementId) {
    return new HTMLPositionDisplayer(document, elementId);
  }
  
  static createAddressDisplayer(document, elementId) {
    return new HTMLAddressDisplayer(document, elementId);
  }
  
  // ... 5 factory methods total
}
```

**Benefits**:
- Encapsulate display component creation
- Easy to swap implementations
- Consistent initialization across application

---

### 4. Facade Pattern

**Usage**: SpeechSynthesisManager

**Purpose**: Simplify complex speech synthesis subsystem

```javascript
class SpeechSynthesisManager {
  // Simple API hiding complexity
  speak(text, options) {
    // Delegates to SpeechController, VoiceManager, QueueProcessor, etc.
  }
  
  pause() { /* ... */ }
  resume() { /* ... */ }
  cancel() { /* ... */ }
}
```

---

### 5. Value Object Pattern

**Usage**: GeoPosition, BrazilianStandardAddress

**Purpose**: Immutable data structures representing domain concepts

```javascript
class GeoPosition {
  constructor(position) {
    this.latitude = position.coords.latitude;
    this.longitude = position.coords.longitude;
    // ... other properties
    Object.freeze(this); // Immutable
  }
}
```

---

### 6. State Pattern

**Usage**: GeocodingState

**Purpose**: Manage state transitions for geocoding operations

**States**: `idle → loading → success | error`

---

## Data Flow

### Main User Flow: Location Tracking

```
1. User grants location permission
   ↓
2. GeolocationService.watchPosition()
   ↓
3. Browser provides position update
   ↓
4. PositionManager.update() validates:
   - Accuracy quality check (reject medium/bad/very bad on mobile)
   - Distance threshold (≥20m) OR Time threshold (≥30s)
   ↓
5. If valid, notifyObservers('positionUpdate')
   ↓
6. Parallel processing:
   ├─→ HTMLPositionDisplayer: Update coordinates display
   ├─→ ReverseGeocoder: Fetch address from Nominatim
   └─→ Chronometer: Update elapsed time
   ↓
7. ReverseGeocoder receives response
   ↓
8. AddressDataExtractor processes:
   ├─→ Extract address components
   ├─→ Standardize to BrazilianStandardAddress
   ├─→ Cache in AddressCache
   └─→ Extract ReferencePlace if available
   ↓
9. Notify observers('addressFetched')
   ↓
10. Parallel display updates:
    ├─→ HTMLAddressDisplayer: Format and display address
    ├─→ HTMLHighlightCardsDisplayer: Show municipio/bairro cards
    ├─→ HTMLReferencePlaceDisplayer: Show nearby places
    ├─→ HTMLSidraDisplayer: Fetch and show population stats
    └─→ SpeechCoordinator: Announce address change (if enabled)
```

### Position Update Logic (v0.7.2+)

**Critical Business Rule**: Updates trigger on **distance OR time** threshold:

```javascript
// Distance check (Haversine formula)
const distance = calculateDistance(oldPos, newPos);
const distanceThreshold = 20; // meters

// Time check
const timeElapsed = newPos.timestamp - oldPos.timestamp;
const timeThreshold = 30000; // milliseconds (30 seconds)

// Update if EITHER condition is true
if (distance >= distanceThreshold || timeElapsed >= timeThreshold) {
  // Update position and notify observers
}
```

**Accuracy Quality Filter** (mobile devices only):
```javascript
// Reject positions with poor accuracy on mobile
if (isMobileDevice() && ['medium', 'bad', 'very bad'].includes(accuracyQuality)) {
  return; // Skip update
}
```

---

## Component Interaction

### Dependency Graph

```
┌──────────────────┐
│   app.js (SPA)   │
└────────┬─────────┘
         │
    ┌────┴────┐
    │  Router │
    └────┬────┘
         │
    ┌────┴─────────────────┐
    │                      │
┌───┴────────┐    ┌────────┴──────┐
│  HomeView  │    │ ConverterView │
└───┬────────┘    └────────┬──────┘
    │                      │
    └──────────┬───────────┘
               │
        ┌──────┴──────────────┐
        │ WebGeocodingManager │ (Main Coordinator)
        └──────┬──────────────┘
               │
     ┌─────────┼─────────┐
     │         │         │
┌────┴───┐ ┌──┴───┐ ┌───┴────────┐
│Services│ │ Data │ │ DisplayLayer│
└────────┘ └──────┘ └────────────┘
     │         │         │
     └─────────┼─────────┘
               │
        ┌──────┴──────┐
        │ Core Layer  │
        └─────────────┘
```

### Key Interactions

1. **View → Coordinator**: Views delegate business logic to coordinators
2. **Coordinator → Service**: Coordinators request data from services
3. **Service → Core**: Services update core state (PositionManager)
4. **Core → All Layers**: Core notifies all layers via observer pattern
5. **Data → Display**: Data layer formats, display layer renders

---

## External Dependencies

### 1. guia.js Library

**Repository**: [github.com/mpbarbosa/guia_js](https://github.com/mpbarbosa/guia_js)  
**Version**: v0.6.0-alpha  
**Purpose**: Core geolocation functionality

**Integration**:
```javascript
// package.json
"dependencies": {
  "guia.js": "github:mpbarbosa/guia_js#v0.6.0-alpha"
}
```

---

### 2. ibira.js Library

**Repository**: [github.com/mpbarbosa/ibira.js](https://github.com/mpbarbosa/ibira.js)  
**Version**: v0.2.1-alpha  
**Purpose**: Brazilian IBGE integration

---

### 3. OpenStreetMap Nominatim API

**Endpoint**: `https://nominatim.openstreetmap.org/reverse`  
**Purpose**: Reverse geocoding (coordinates → address)  
**Rate Limit**: 1 request per second  
**Usage Policy**: Required to provide attribution

---

### 4. IBGE APIs

**Endpoints**:
- Location data: `https://servicodados.ibge.gov.br/api/v1/localidades/`
- SIDRA demographics: `https://servicodados.ibge.gov.br/api/v3/agregados/6579/`

**Purpose**: Brazilian location data and demographic statistics

---

## Configuration System

### Configuration Structure

All configuration lives in `src/config/defaults.js`:

```javascript
export const ADDRESS_FETCHED_EVENT = 'addressFetched';
export const POSITION_UPDATE_EVENT = 'positionUpdate';
export const MINIMUM_TIME_CHANGE = 30000; // 30 seconds
export const MINIMUM_DISTANCE_CHANGE = 20; // meters
export const NOT_ACCEPTED_ACCURACY = ['medium', 'bad', 'very bad'];
export const TRACKING_INTERVAL = 5000; // 5 seconds
```

### Usage Pattern

```javascript
// Import specific constants
import { ADDRESS_FETCHED_EVENT, MINIMUM_DISTANCE_CHANGE } from './config/defaults.js';

// Use in code
if (distance >= MINIMUM_DISTANCE_CHANGE) {
  notifyObservers(ADDRESS_FETCHED_EVENT, data);
}
```

**Benefits**:
- Single source of truth for configuration
- Easy to modify thresholds
- Type-safe constant names
- Prevents typos in event names

---

## State Management

### Application State

**Primary State**: Managed by **PositionManager** (Singleton)

```javascript
{
  latitude: number,
  longitude: number,
  accuracy: number,
  accuracyQuality: string,
  timestamp: number,
  heading: number,
  speed: number
}
```

**Secondary State**: Managed by **SingletonStatusManager**

```javascript
{
  geocodingStatus: 'idle' | 'loading' | 'success' | 'error',
  applicationReady: boolean,
  errorMessage: string | null
}
```

### State Updates

**Immutable Updates**:
```javascript
// GOOD: Create new object
const newPosition = new GeoPosition(browserPosition);

// BAD: Mutate existing object
position.latitude = newLat; // ❌ Don't do this
```

---

## Error Handling Strategy

### Error Handling Layers

1. **Service Layer**: Catch API errors, network failures
2. **Coordination Layer**: Handle service errors, retry logic
3. **Display Layer**: Show user-friendly error messages
4. **Core Layer**: Validate data, throw errors for invalid inputs

### Error Types

```javascript
// API Errors (ReverseGeocoder)
try {
  await geocoder.fetchAddress();
} catch (error) {
  logger.error('Geocoding failed:', error);
  // Fallback: Use cached data or show coordinates only
}

// Geolocation Errors (GeolocationService)
navigator.geolocation.getCurrentPosition(
  success => { /* ... */ },
  error => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        logger.warn('User denied location permission');
        break;
      case error.POSITION_UNAVAILABLE:
        logger.warn('Location unavailable');
        break;
      case error.TIMEOUT:
        logger.warn('Location request timeout');
        break;
    }
  }
);

// Validation Errors (PositionManager)
if (!isValidPosition(position)) {
  logger.warn('Invalid position data, skipping update');
  return;
}
```

---

## Performance Considerations

### Optimization Strategies

1. **Caching**: AddressCache with LRU eviction (reduces API calls)
2. **Throttling**: Position updates limited to 20m OR 30s thresholds
3. **Lazy Loading**: Components initialized only when needed
4. **Timer Management**: TimerManager prevents memory leaks
5. **Immutable Data**: GeoPosition frozen after creation

### Performance Metrics

- **JavaScript bundle**: ~16,500 lines of code across 59 files
- **Test execution**: ~30 seconds for 2,380 tests
- **Cold start**: <1 second (SPA initialization)
- **Position update**: <100ms (validation and display)
- **Geocoding request**: 200-500ms (network dependent)

---

## Security Architecture

### Security Measures

1. **No credentials in code**: All API keys managed externally (none required for public APIs)
2. **HTTPS required**: Geolocation API requires secure context
3. **Content Security Policy**: Recommended CSP headers
4. **Input validation**: All external data validated before processing
5. **XSS prevention**: DOM manipulation uses `textContent` where possible

### Security Checklist

- ✅ No hardcoded credentials
- ✅ No eval() usage
- ✅ Input validation on all external data
- ✅ Dependency security audits (`npm audit`)
- ✅ HTTPS requirement for production

---

## Testing Architecture

### Test Organization

```
__tests__/
├── unit/           # Unit tests (isolated component testing)
├── integration/    # Integration tests (multi-component)
├── e2e/            # End-to-end tests (full workflows)
├── features/       # Feature-specific tests
├── services/       # Service layer tests
├── managers/       # Manager class tests
└── external/       # External API integration tests
```

### Test Infrastructure

- **Test Runner**: Jest v30.1.3
- **Browser Automation**: Puppeteer v24.35.0 (E2E tests)
- **DOM Testing**: jsdom v25.0.1
- **Test Count**: 2,380 total (2,214 passing, 146 skipped, 20 failing)
- **Coverage**: ~85% overall (84.7% actual)

### Test Strategy

1. **Unit Tests**: Mock all dependencies, test in isolation
2. **Integration Tests**: Test component interactions with real dependencies
3. **E2E Tests**: Full browser automation testing user workflows

---

## Related Documentation

- [API Reference](../api/README.md)
- [Developer Guide](../developer/DEVELOPER_GUIDE.md)
- [User Guide](../user/USER_GUIDE.md)
- [Testing Guide](../testing/TESTING.md)
- [Design Patterns](./DESIGN_PATTERNS.md)
- [Data Flow Diagrams](./DATA_FLOW.md)

---

**Last Review**: 2026-02-09  
**Reviewers**: Technical Architecture Team  
**Status**: ✅ Complete
