# System Architecture Overview

**Version**: 0.9.0-alpha  
**Last Updated**: 2026-02-11  
**Document Type**: Technical Architecture Guide

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architectural Layers](#architectural-layers)
4. [Component Architecture](#component-architecture)
5. [Data Flow](#data-flow)
6. [Design Patterns](#design-patterns)
7. [Integration Points](#integration-points)
8. [Scalability and Performance](#scalability-and-performance)

---

## Executive Summary

**Guia Turístico** is a single-page web application (SPA) providing real-time geolocation services with Brazilian address geocoding. The architecture follows a **layered design** with clear separation of concerns across 7 distinct layers.

### Key Characteristics

- **Architecture Style**: Layered + Observer Pattern + Composition
- **Language**: JavaScript (ES6+)
- **Runtime**: Browser + Node.js (testing/validation)
- **Dependencies**: guia.js library, ibira.js, jsdom (testing), puppeteer (E2E)
- **Test Coverage**: ~85% (2,401 tests, 2,235 passing)
- **Performance**: <1s geolocation, <2s address resolution

### Design Philosophy

1. **Immutability**: Data objects are immutable by default
2. **Composition over Inheritance**: Favor composition (v0.9.0-alpha refactor)
3. **Single Responsibility**: Each component has one clear purpose
4. **Observer Pattern**: Event-driven communication between components
5. **Dependency Injection**: Services injected via constructors

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Web Browser (Client)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Guia Turístico SPA (index.html)         │  │
│  │                                                       │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │         Application Layer (app.js)           │  │  │
│  │  │  - Router (/ and /converter routes)          │  │  │
│  │  │  - View Controllers (home.js, converter.js)  │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                       ↓                             │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │     Coordination Layer                       │  │  │
│  │  │  - WebGeocodingManager (main orchestrator)   │  │  │
│  │  │  - ServiceCoordinator (lifecycle manager)    │  │  │
│  │  │  - EventCoordinator, UICoordinator           │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                       ↓                             │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │         Service Layer                        │  │  │
│  │  │  - GeolocationService (browser API wrapper)  │  │  │
│  │  │  - ReverseGeocoder (Nominatim integration)   │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                       ↓                             │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │         Core Layer                           │  │  │
│  │  │  - PositionManager (state singleton)         │  │  │
│  │  │  - GeoPosition (immutable value object)      │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  - OpenStreetMap Nominatim (geocoding)                      │
│  - IBGE API (Brazilian location data)                       │
│  - IBGE SIDRA API (demographic statistics)                  │
│  - Google Maps (mapping/Street View)                        │
└─────────────────────────────────────────────────────────────┘
```

### Execution Flow

1. **User Action**: User clicks "Obter Localização" button
2. **View Controller**: Captures event, delegates to coordination layer
3. **Coordination**: `WebGeocodingManager` orchestrates services
4. **Service**: `GeolocationService` requests browser location
5. **Core**: `PositionManager` stores position state
6. **Service**: `ReverseGeocoder` fetches address from Nominatim
7. **Data Processing**: Extractors normalize Brazilian address data
8. **Display**: HTML displayers render formatted output
9. **Speech**: Optional text-to-speech for accessibility

---

## Architectural Layers

The application is organized into **7 distinct layers**, each with specific responsibilities:

### 1. Application Layer (`src/app.js`, `src/views/`)

**Responsibility**: Application initialization, routing, and view management

**Components**:
- `app.js` (543 lines) - SPA entry point with router
- `views/home.js` (495 lines) - Home view controller
- `views/converter.js` (521 lines) - Converter view controller

**Key Functions**:
- Route handling (`#/` → home, `#/converter` → converter)
- DOM initialization
- View lifecycle management
- Event delegation to coordination layer

**Design Pattern**: **Front Controller** + **MVC**

```javascript
// Router setup
router.on('/', () => homeView.render());
router.on('/converter', () => converterView.render());
router.resolve();
```

---

### 2. Coordination Layer (`src/coordination/`)

**Responsibility**: Orchestrates services, manages component lifecycle, coordinates events

**Components**:
- `WebGeocodingManager.js` - Main orchestrator
- `ServiceCoordinator.js` - Service lifecycle manager
- `EventCoordinator.js` - Event bus
- `UICoordinator.js` - UI state management
- `SpeechCoordinator.js` - Speech synthesis coordination

**Key Functions**:
- Service initialization and cleanup
- Cross-component communication
- State synchronization
- Error handling and recovery

**Design Pattern**: **Facade** + **Mediator** + **Observer**

```javascript
// ServiceCoordinator manages all displayers
serviceCoordinator.initializeDisplayers(document);
serviceCoordinator.cleanupAll();
```

---

### 3. Service Layer (`src/services/`)

**Responsibility**: External API integration, geolocation services

**Components**:
- `GeolocationService.js` - Browser Geolocation API wrapper
- `ReverseGeocoder.js` - OpenStreetMap Nominatim client
- Observer pattern for event notifications

**Key Functions**:
- Browser geolocation access
- Reverse geocoding (coordinates → address)
- API error handling
- Rate limiting compliance

**Design Pattern**: **Adapter** + **Observer**

```javascript
// GeolocationService wraps browser API
service.getCurrentPosition({ enableHighAccuracy: true })
  .then(position => handleSuccess(position))
  .catch(error => handleError(error));
```

---

### 4. Core Layer (`src/core/`)

**Responsibility**: Foundational data structures and state management

**Components**:
- `PositionManager.js` - Singleton position state manager
- `GeoPosition.js` - Immutable position value object

**Key Functions**:
- Global position state
- Position change detection (20m distance OR 30s time)
- Observer notifications
- Immutability enforcement

**Design Pattern**: **Singleton** + **Value Object** + **Observer**

```javascript
// Singleton with observer pattern
const manager = PositionManager.getInstance();
manager.addObserver((newPos) => console.log(newPos));
manager.setCurrentPosition(geoPosition);
```

---

### 5. Data Processing Layer (`src/data/`)

**Responsibility**: Data extraction, transformation, caching, and validation

**Components**:
- `BrazilianStandardAddress.js` - Address standardization
- `AddressExtractor.js` - Nominatim data extraction
- `AddressCache.js` - LRU cache with change detection (refactored v0.9.0-alpha)
  - `AddressChangeDetector.js` - Change detection
  - `CallbackRegistry.js` - Callback management
  - `AddressDataStore.js` - Data storage
- `AddressDataExtractor.js` - Complete address extraction pipeline
- `ReferencePlace.js` - Reference location handling
- `LRUCache.js` - Generic LRU cache implementation

**Key Functions**:
- Brazilian address normalization
- Field extraction from Nominatim responses
- Address change detection (municipio, bairro, uf, regiaoMetropolitana)
- LRU eviction policy
- Reference place categorization

**Design Pattern**: **Value Object** + **Composition** (v0.9.0-alpha) + **Strategy**

```javascript
// Composition-based caching (v0.9.0-alpha)
const cache = new AddressCache(100);
cache.registerChangeCallback('bairro', (old, new) => {
  console.log(`Bairro changed: ${old} → ${new}`);
});
cache.set('current', addressData);
```

---

### 6. Presentation Layer (`src/html/`)

**Responsibility**: UI rendering, DOM manipulation, data display

**Components**:
- `HTMLPositionDisplayer.js` - Coordinate display + Google Maps links
- `HTMLAddressDisplayer.js` - Address formatting and display
- `HTMLHighlightCardsDisplayer.js` - Municipality/neighborhood cards (v0.9.0+)
- `HTMLReferencePlaceDisplayer.js` - Reference place display
- `HTMLSidraDisplayer.js` - IBGE demographic statistics (v0.9.0+)
- `DisplayerFactory.js` - Factory for displayer creation (v0.9.0+)
- `HtmlText.js` - Text utilities
- `HtmlSpeechSynthesisDisplayer.js` - Speech synthesis UI

**Key Functions**:
- HTML generation (safe, sanitized)
- DOM element updates
- Google Maps integration
- IBGE SIDRA statistics display
- Metropolitan region display (v0.9.0-alpha)
- Brazilian Portuguese localization

**Design Pattern**: **Factory** + **Template Method** + **Presenter**

```javascript
// Factory pattern for displayer creation
const factory = new DisplayerFactory();
const posDisplayer = factory.createPositionDisplayer(document, 'coords-id');
const sidraDisplayer = factory.createSidraDisplayer(document, 'stats-id');
```

---

### 7. Speech Synthesis Layer (`src/speech/`)

**Responsibility**: Text-to-speech synthesis with Brazilian Portuguese optimization

**Components** (v0.9.0-alpha Composition Refactor):
- `SpeechSynthesisManager.js` - Main orchestrator (1148 lines)
  - Coordinates 4 focused components via composition
- `VoiceLoader.js` - Asynchronous voice loading with exponential backoff
- `VoiceSelector.js` - Brazilian Portuguese voice selection
- `SpeechConfiguration.js` - Rate/pitch parameter management
- `SpeechQueue.js` - Priority-based request queue
- `SpeechItem.js` - Individual speech request items

**Legacy Components** (deprecated):
- `SpeechController.js`, `SpeechQueueProcessor.js`, `VoiceManager.js`

**Key Functions**:
- Priority-based speech queue (high, normal, low)
- Brazilian Portuguese voice optimization
- Exponential backoff retry for voice loading
- Rate and pitch configuration with validation
- Queue management (pause, resume, stop, clear)

**Design Pattern**: **Composition** (v0.9.0-alpha) + **Queue** + **Strategy**

```javascript
// Composition-based architecture (v0.9.0-alpha)
const speechManager = new SpeechSynthesisManager();
// Internally uses: VoiceLoader, VoiceSelector, SpeechConfiguration, SpeechQueue

speechManager.setRate(1.2);
speechManager.setPitch(1.0);
speechManager.speak('Bem-vindo ao Guia Turístico', 'high');
```

**Voice Loading Strategy** (v0.9.0-alpha):
- Retry delays: 100ms → 200ms → 400ms → 800ms → 1600ms → 3200ms → 5000ms
- Max 10 attempts
- Concurrent load protection

---

## Component Architecture

### Core Components Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Environment                       │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Application Entry (app.js)                 │    │
│  │  - Initializes router                              │    │
│  │  - Loads view controllers                          │    │
│  │  - Sets up global error handlers                   │    │
│  └───────────────────┬────────────────────────────────┘    │
│                      │                                      │
│                      ▼                                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │   WebGeocodingManager (Orchestrator)               │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │   ServiceCoordinator                         │ │    │
│  │  │  - Position displayer                        │ │    │
│  │  │  - Address displayer                         │ │    │
│  │  │  - Reference place displayer                 │ │    │
│  │  │  - Highlight cards displayer (v0.9.0+)       │ │    │
│  │  │  - SIDRA displayer (v0.9.0+, v0.9.0+)        │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  └───────────────────┬────────────────────────────────┘    │
│                      │                                      │
│           ┌──────────┼──────────┐                          │
│           ▼          ▼          ▼                          │
│  ┌────────────┐ ┌───────────┐ ┌──────────────┐           │
│  │Geolocation │ │  Reverse  │ │   Position   │           │
│  │  Service   │ │  Geocoder │ │   Manager    │           │
│  │  (Browser) │ │(Nominatim)│ │  (Singleton) │           │
│  └────────────┘ └───────────┘ └──────────────┘           │
│       │              │               │                     │
│       │              │               │                     │
│       ▼              ▼               ▼                     │
│  ┌─────────────────────────────────────────────────┐     │
│  │          Data Processing Layer                   │     │
│  │  - AddressExtractor                              │     │
│  │  - AddressCache (composition v0.9.0-alpha)       │     │
│  │  - BrazilianStandardAddress                      │     │
│  │  - ReferencePlace                                │     │
│  └─────────────────────────────────────────────────┘     │
│                      │                                     │
│                      ▼                                     │
│  ┌─────────────────────────────────────────────────┐     │
│  │          Presentation Layer                      │     │
│  │  - HTMLPositionDisplayer                         │     │
│  │  - HTMLAddressDisplayer                          │     │
│  │  - HTMLHighlightCardsDisplayer (v0.9.0+)         │     │
│  │  - HTMLSidraDisplayer (v0.9.0+)                  │     │
│  │  - DisplayerFactory (v0.9.0+)                    │     │
│  └─────────────────────────────────────────────────┘     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Component Dependencies

```
app.js
 ├── router (navigo)
 ├── views/home.js
 │    └── WebGeocodingManager
 │         ├── ServiceCoordinator
 │         │    ├── DisplayerFactory (v0.9.0+)
 │         │    │    ├── HTMLPositionDisplayer
 │         │    │    ├── HTMLAddressDisplayer
 │         │    │    ├── HTMLHighlightCardsDisplayer
 │         │    │    ├── HTMLReferencePlaceDisplayer
 │         │    │    └── HTMLSidraDisplayer
 │         │    └── SpeechSynthesisManager
 │         ├── GeolocationService
 │         ├── ReverseGeocoder
 │         └── PositionManager (singleton)
 │              └── GeoPosition (value object)
 └── views/converter.js
      └── Coordinate conversion utilities
```

---

## Data Flow

### Geolocation Workflow

```
┌──────────────┐
│ User clicks  │
│   button     │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│ View Controller          │
│ (home.js)                │
│ - Captures event         │
│ - Validates state        │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ WebGeocodingManager      │
│ - Orchestrates services  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ GeolocationService       │
│ - Requests browser API   │
│ - navigator.geolocation  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐      ┌────────────────────┐
│ Position obtained        │─────▶│ PositionManager    │
│ - Latitude: -23.5505     │      │ - Stores state     │
│ - Longitude: -46.6333    │      │ - Notifies obs     │
│ - Accuracy: 10m          │      │ - Checks thresholds│
└──────┬───────────────────┘      └────────────────────┘
       │                                    │
       │                                    │ Distance: 20m OR Time: 30s
       │                                    ▼
       │                          ┌────────────────────┐
       │                          │ Threshold met?     │
       │                          │ YES: Continue flow │
       │                          │ NO:  Skip update   │
       │                          └────────┬───────────┘
       │                                   │
       ▼                                   ▼
┌──────────────────────────┐      ┌────────────────────┐
│ ReverseGeocoder          │◀─────│ Trigger geocoding  │
│ - Calls Nominatim API    │      └────────────────────┘
│ - Returns address data   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ AddressExtractor         │
│ - Extracts fields        │
│ - Normalizes data        │
│ - Creates standard addr  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ AddressCache             │
│ - Stores address         │
│ - Detects changes        │
│ - Fires callbacks        │
└──────┬───────────────────┘
       │
       ├───────────────────────────┐
       │                           │
       ▼                           ▼
┌──────────────────┐      ┌────────────────────┐
│ Display Layer    │      │ Speech Layer       │
│ - Position       │      │ - Voice synthesis  │
│ - Address        │      │ - Queue processing │
│ - Highlight      │      │ - pt-BR voices     │
│ - Reference      │      └────────────────────┘
│ - SIDRA stats    │
└──────────────────┘
```

### Address Change Detection Flow (v0.9.0-alpha)

```
┌─────────────────────────┐
│ New address received    │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ AddressCache.set()              │
│ ┌─────────────────────────────┐ │
│ │ AddressDataStore            │ │
│ │ - Stores current/previous   │ │
│ └──────────┬──────────────────┘ │
│            │                     │
│            ▼                     │
│ ┌─────────────────────────────┐ │
│ │ AddressChangeDetector       │ │
│ │ - Compares field signatures │ │
│ │ - Detects: municipio,       │ │
│ │   bairro, uf, regiao Metro  │ │
│ └──────────┬──────────────────┘ │
│            │                     │
│            ▼                     │
│ ┌─────────────────────────────┐ │
│ │ CallbackRegistry            │ │
│ │ - Executes registered       │ │
│ │   callbacks for changed     │ │
│ │   fields                    │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
           │
           ▼
┌─────────────────────────┐
│ UI Updates              │
│ - Highlight cards       │
│ - Address display       │
│ - Speech notifications  │
└─────────────────────────┘
```

---

## Design Patterns

### 1. Singleton Pattern

**Usage**: `PositionManager`, `SingletonStatusManager`, `TimerManager`

**Purpose**: Ensure single instance for global state management

```javascript
// PositionManager.js
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
- Global state consistency
- Prevents state duplication
- Centralized access point

---

### 2. Observer Pattern

**Usage**: `PositionManager`, `ReverseGeocoder`, `AddressCache`, `HTMLSidraDisplayer`

**Purpose**: Event-driven component communication

```javascript
// Observer pattern implementation
class PositionManager {
  #observers = [];
  
  addObserver(callback) {
    this.#observers.push(callback);
    return () => this.removeObserver(callback); // Returns unsubscribe function
  }
  
  notifyObservers() {
    this.#observers.forEach(cb => cb(this.#currentPosition));
  }
}
```

**Benefits**:
- Loose coupling between components
- Reactive updates
- Easy to add/remove listeners

---

### 3. Value Object Pattern

**Usage**: `GeoPosition`, `BrazilianStandardAddress`

**Purpose**: Immutable data structures

```javascript
// GeoPosition.js
class GeoPosition {
  #latitude;
  #longitude;
  #accuracy;
  #timestamp;
  
  constructor(lat, lon, accuracy, timestamp) {
    this.#latitude = lat;
    this.#longitude = lon;
    this.#accuracy = accuracy;
    this.#timestamp = timestamp;
    Object.freeze(this); // Enforce immutability
  }
  
  get latitude() { return this.#latitude; }
  get longitude() { return this.#longitude; }
}
```

**Benefits**:
- Immutability prevents bugs
- Clear data contracts
- Easy to test

---

### 4. Composition Pattern (v0.9.0-alpha)

**Usage**: `SpeechSynthesisManager`, `AddressCache`

**Purpose**: Build complex behavior from focused components

```javascript
// SpeechSynthesisManager.js (v0.9.0-alpha)
class SpeechSynthesisManager {
  #voiceLoader;
  #voiceSelector;
  #configuration;
  #queue;
  
  constructor() {
    this.#voiceLoader = new VoiceLoader();
    this.#voiceSelector = new VoiceSelector();
    this.#configuration = new SpeechConfiguration();
    this.#queue = new SpeechQueue();
  }
  
  async speak(text, priority) {
    const voices = await this.#voiceLoader.loadVoices();
    const voice = this.#voiceSelector.selectVoice(voices);
    const item = new SpeechItem(text, priority, voice, this.#configuration);
    this.#queue.enqueue(item);
  }
}
```

**Benefits**:
- Single Responsibility Principle
- Easier testing (test each component independently)
- Better code organization
- Flexible composition

---

### 5. Factory Pattern

**Usage**: `DisplayerFactory` (v0.9.0+)

**Purpose**: Centralized object creation

```javascript
// DisplayerFactory.js
class DisplayerFactory {
  createPositionDisplayer(document, elementId) {
    return new HTMLPositionDisplayer(document, elementId);
  }
  
  createSidraDisplayer(document, elementId) {
    return new HTMLSidraDisplayer(document, elementId);
  }
  
  // ... other factory methods
}
```

**Benefits**:
- Centralized creation logic
- Easy to swap implementations
- Dependency injection ready

---

### 6. Adapter Pattern

**Usage**: `GeolocationService`

**Purpose**: Wrap browser Geolocation API with Promise interface

```javascript
// GeolocationService.js
class GeolocationService {
  getCurrentPosition(options) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }
}
```

**Benefits**:
- Consistent async interface
- Easy to mock for testing
- Browser API abstraction

---

### 7. Facade Pattern

**Usage**: `WebGeocodingManager`

**Purpose**: Simplify complex subsystem interactions

```javascript
// WebGeocodingManager.js
class WebGeocodingManager {
  constructor(document, elementId) {
    this.serviceCoordinator = new ServiceCoordinator(document);
    this.geolocationService = new GeolocationService();
    this.positionManager = PositionManager.getInstance();
  }
  
  async requestLocation() {
    const pos = await this.geolocationService.getCurrentPosition();
    this.positionManager.setCurrentPosition(pos);
    // ... orchestrate other services
  }
}
```

**Benefits**:
- Simplified client interface
- Hides complexity
- Centralized coordination

---

### 8. Strategy Pattern

**Usage**: `VoiceSelector` (v0.9.0-alpha)

**Purpose**: Pluggable voice selection algorithms

```javascript
// VoiceSelector.js
class VoiceSelector {
  selectVoice(voices) {
    // Strategy 1: Exact pt-BR match
    let selected = this.filterByLanguage(voices, 'pt-BR')[0];
    if (selected) return selected;
    
    // Strategy 2: pt-* prefix match
    selected = this.filterByLanguage(voices, 'pt-')[0];
    if (selected) return selected;
    
    // Strategy 3: First available
    return voices[0] || null;
  }
}
```

**Benefits**:
- Flexible algorithms
- Easy to extend
- Clear fallback logic

---

## Integration Points

### External APIs

#### 1. OpenStreetMap Nominatim

**Purpose**: Reverse geocoding (coordinates → address)

**Endpoint**: `https://nominatim.openstreetmap.org/reverse`

**Integration**: `ReverseGeocoder` class

**Rate Limit**: 1 request/second

**Request Example**:
```http
GET /reverse?format=json&lat=-23.5505&lon=-46.6333&addressdetails=1
```

**Response Structure**:
```json
{
  "display_name": "Av. Paulista, São Paulo, SP, Brazil",
  "address": {
    "road": "Avenida Paulista",
    "neighbourhood": "Bela Vista",
    "city": "São Paulo",
    "state": "São Paulo",
    "postcode": "01310-100",
    "country": "Brasil",
    "county": "Região Metropolitana de São Paulo"
  }
}
```

---

#### 2. IBGE Location API

**Purpose**: Brazilian state/municipality data

**Endpoint**: `https://servicodados.ibge.gov.br/api/v1/localidades/estados/`

**Integration**: `guia_ibge.js` utilities

**No Rate Limit**: Public API

---

#### 3. IBGE SIDRA API (v0.9.0+)

**Purpose**: Demographic statistics (population data)

**Endpoint**: `https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/-6/variaveis/9324`

**Integration**: `HTMLSidraDisplayer` class

**Offline Fallback**: `libs/sidra/tab6579_municipios.json` (190KB)

**Response Example**:
```json
{
  "id": "6579",
  "resultados": [
    {
      "series": [
        {
          "localidade": {
            "id": "2611606",
            "nome": "Recife"
          },
          "serie": {
            "2023": "1653461"
          }
        }
      ]
    }
  ]
}
```

---

#### 4. Google Maps

**Purpose**: Map visualization and Street View

**Integration**: `HTMLPositionDisplayer` (generates links)

**No API Key Required**: Uses public URL scheme

**Map Link**: `https://www.google.com/maps?q={lat},{lon}`

**Street View**: `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint={lat},{lon}`

---

### Browser APIs

#### 1. Geolocation API

**Purpose**: Device location access

**Integration**: `GeolocationService` class

**Permissions**: User must grant location access

**Methods Used**:
- `navigator.geolocation.getCurrentPosition()`
- `navigator.geolocation.watchPosition()`

---

#### 2. SpeechSynthesis API

**Purpose**: Text-to-speech

**Integration**: `SpeechSynthesisManager` class

**Availability**: Optional (graceful degradation if unavailable)

**Methods Used**:
- `window.speechSynthesis.speak()`
- `window.speechSynthesis.getVoices()`

---

### Internal Libraries

#### 1. guia.js

**Purpose**: Core geolocation library

**Repository**: https://github.com/mpbarbosa/guia_js

**Integration**: Imported as npm dependency

**Key Exports**: Core classes, utilities

---

#### 2. ibira.js

**Purpose**: Brazilian IBGE integration

**Integration**: Utility functions for IBGE data

---

## Scalability and Performance

### Performance Characteristics

| Operation | Target Time | Actual | Notes |
|-----------|-------------|--------|-------|
| Syntax validation | <1 second | <1s | `node -c` |
| Geolocation request | <3 seconds | ~1s | Browser dependent |
| Address geocoding | <5 seconds | ~2s | Network dependent |
| Speech synthesis | <2 seconds | ~1s | Voice loading |
| Test suite execution | <60 seconds | ~65s | 2,401 tests |
| Page load | <2 seconds | ~1s | No bundling |

### Scalability Considerations

#### 1. Caching Strategy

- **AddressCache**: LRU cache with 100 entry limit
- **Voice Cache**: Browser SpeechSynthesis caching
- **SIDRA Data**: Offline fallback (190KB JSON)

#### 2. Memory Management

- **TimerManager**: Prevents memory leaks (v0.9.0+)
- **Observer cleanup**: Unsubscribe functions returned
- **DOM references**: Cleaned up on view destruction

#### 3. Network Optimization

- **Rate limiting**: 1 req/s for Nominatim
- **Retry logic**: Exponential backoff for voice loading
- **Offline fallback**: Local SIDRA data

#### 4. Browser Optimization

- **No bundling**: Direct ES6 module loading
- **Lazy loading**: Components loaded on demand
- **Minimal dependencies**: Small footprint

### Bottlenecks and Mitigations

| Bottleneck | Impact | Mitigation |
|------------|--------|------------|
| Nominatim rate limit | Geocoding delays | Cache addresses, batch requests |
| Voice loading delay | Speech synthesis lag | Exponential backoff, preload voices |
| Large test suite | CI/CD time | Parallel execution, fake timers |
| No CDN bundling | Initial load time | Browser HTTP/2, small files |

---

## Future Architecture Considerations

### Potential Improvements

1. **Service Worker**: Offline-first PWA capabilities
2. **IndexedDB**: Persistent client-side storage
3. **Web Workers**: Background processing for heavy computation
4. **WebSocket**: Real-time location tracking
5. **Micro-frontends**: Split converter into separate app

### Migration Paths

1. **TypeScript**: Type safety and better IDE support
2. **React/Vue**: Component-based UI framework
3. **Build Pipeline**: Webpack/Vite for optimization
4. **GraphQL**: Unified API layer

---

## Related Documentation

- [Complete API Reference](./API_COMPLETE_REFERENCE.md)
- [Development Guide](./developer/DEVELOPMENT_GUIDE.md)
- [Testing Guide](./developer/TESTING_GUIDE.md)
- [User Guide](./user/USER_GUIDE.md)

---

**Last Updated**: 2026-02-11  
**Version**: 0.9.0-alpha  
**Status**: ✅ Complete and Validated
