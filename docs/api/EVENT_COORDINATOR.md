# EventCoordinator API Documentation

**Version**: 0.9.0-alpha  
**Module**: `coordination/EventCoordinator`  
**Since**: 0.9.0-alpha (Phase 1: WebGeocodingManager refactoring)

---

## Overview

EventCoordinator manages all DOM event handling and user interactions for the Guia Turístico application. It provides centralized event listener management with proper cleanup to prevent memory leaks.

**Single Responsibility**: Event handling only

### Key Features
- ✅ Centralized event listener management
- ✅ Automatic event handler cleanup
- ✅ Support for external callback delegation (window functions)
- ✅ Button state management integration
- ✅ Toast notifications for user feedback
- ✅ Memory leak prevention through handler tracking

### Design Principles
- **Separation of Concerns**: Isolates event handling from business logic
- **Dependency Injection**: Receives UICoordinator and GeocodingState
- **Resource Management**: Tracks handlers for proper cleanup
- **Extensibility**: Supports external callback delegation

---

## Class Signature

```javascript
class EventCoordinator {
  constructor(uiCoordinator, geocodingState)
}
```

---

## Constructor

### Syntax
```javascript
new EventCoordinator(uiCoordinator, geocodingState)
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uiCoordinator` | `UICoordinator` | ✅ | UI coordinator for accessing DOM elements |
| `geocodingState` | `GeocodingState` | ✅ | State manager for position/coordinates |

### Throws
- `TypeError` - If `uiCoordinator` is not provided
- `TypeError` - If `geocodingState` is not provided

### Example
```javascript
import EventCoordinator from './coordination/EventCoordinator.js';
import UICoordinator from './coordination/UICoordinator.js';
import GeocodingState from './core/GeocodingState.js';

const uiCoordinator = new UICoordinator(document);
const geocodingState = new GeocodingState();

const eventCoordinator = new EventCoordinator(
  uiCoordinator,
  geocodingState
);
```

---

## Public Methods

### initializeEventListeners()

Initializes all event listeners for interactive buttons.

#### Syntax
```javascript
eventCoordinator.initializeEventListeners()
```

#### Returns
`void`

#### Description
Sets up event listeners for:
- **Geolocation button** - Triggers location tracking
- **Restaurant search button** - Delegates to `window.findNearbyRestaurants()`
- **City statistics button** - Delegates to `window.fetchCityStatistics()`

**Note**: This method is idempotent - calling it multiple times has no effect after the first call.

#### Example
```javascript
// Initialize once
eventCoordinator.initializeEventListeners();

// Safe to call again (no-op)
eventCoordinator.initializeEventListeners();
```

---

### removeEventListeners()

Removes all registered event listeners and cleans up resources.

#### Syntax
```javascript
eventCoordinator.removeEventListeners()
```

#### Returns
`void`

#### Description
- Removes all tracked event listeners
- Clears internal handler map
- Resets initialization flag
- Prevents memory leaks

**⚠️ Important**: Always call this before disposing of EventCoordinator.

#### Example
```javascript
// When shutting down
eventCoordinator.removeEventListeners();
```

---

## Event Handlers

### Geolocation Button

**Button ID**: `obter-localizacao-btn`  
**Event**: `click`  
**Function**: Triggers geolocation tracking

#### Behavior
1. Checks if location is already being tracked
2. Validates button state
3. Shows info toast: "Obtendo sua localização..."
4. Triggers geolocation via UICoordinator

#### Example Setup
```html
<button id="obter-localizacao-btn">Obter Localização</button>
```

```javascript
eventCoordinator.initializeEventListeners();
// Click button → Location tracking starts
```

---

### Restaurant Search Button

**Button ID**: `encontrar-restaurantes-btn`  
**Event**: `click`  
**Function**: Delegates to `window.findNearbyRestaurants(lat, lon)`

#### Behavior
1. Gets current coordinates from GeocodingState
2. Validates coordinates exist
3. Calls external function with lat/lon
4. Shows error toast if coordinates unavailable

#### External Function Contract
```javascript
// Implement this in your application
window.findNearbyRestaurants = (latitude, longitude) => {
  console.log(`Finding restaurants at ${latitude}, ${longitude}`);
  // Your restaurant search logic here
};
```

#### Example
```html
<button id="encontrar-restaurantes-btn">Encontrar Restaurantes</button>
```

```javascript
// Define external handler
window.findNearbyRestaurants = (lat, lon) => {
  fetch(`/api/restaurants?lat=${lat}&lon=${lon}`)
    .then(response => response.json())
    .then(restaurants => displayRestaurants(restaurants));
};

eventCoordinator.initializeEventListeners();
// Click button → Calls window.findNearbyRestaurants()
```

---

### City Statistics Button

**Button ID**: `estatisticas-cidade-btn`  
**Event**: `click`  
**Function**: Delegates to `window.fetchCityStatistics(lat, lon)`

#### Behavior
1. Gets current coordinates from GeocodingState
2. Validates coordinates exist
3. Calls external function with lat/lon
4. Shows error toast if coordinates unavailable

#### External Function Contract
```javascript
// Implement this in your application
window.fetchCityStatistics = (latitude, longitude) => {
  console.log(`Fetching statistics at ${latitude}, ${longitude}`);
  // Your statistics fetching logic here
};
```

#### Example
```html
<button id="estatisticas-cidade-btn">Estatísticas da Cidade</button>
```

```javascript
// Define external handler
window.fetchCityStatistics = (lat, lon) => {
  fetch(`/api/city-stats?lat=${lat}&lon=${lon}`)
    .then(response => response.json())
    .then(stats => displayStatistics(stats));
};

eventCoordinator.initializeEventListeners();
// Click button → Calls window.fetchCityStatistics()
```

---

## Architecture Integration

### Coordination Layer
EventCoordinator is part of the coordination layer alongside:
- **ServiceCoordinator** - Manages services and observers
- **UICoordinator** - Manages UI state and elements
- **SpeechCoordinator** - Coordinates text-to-speech

### Dependencies

**Required Components**:
- `UICoordinator` - Provides access to DOM elements
- `GeocodingState` - Provides current position/coordinates

**Utilities**:
- `logger` - Console and DOM logging
- `toast` - User notification system

---

## Usage Patterns

### Basic Setup
```javascript
// 1. Create dependencies
const document = window.document;
const uiCoordinator = new UICoordinator(document);
const geocodingState = new GeocodingState();

// 2. Create event coordinator
const eventCoordinator = new EventCoordinator(
  uiCoordinator,
  geocodingState
);

// 3. Define external handlers
window.findNearbyRestaurants = (lat, lon) => {
  console.log(`Restaurants at ${lat}, ${lon}`);
};

window.fetchCityStatistics = (lat, lon) => {
  console.log(`Stats at ${lat}, ${lon}`);
};

// 4. Initialize event listeners
eventCoordinator.initializeEventListeners();
```

### Cleanup Pattern
```javascript
// Always cleanup when navigating away
window.addEventListener('beforeunload', () => {
  eventCoordinator.removeEventListeners();
});

// Or when unmounting component
function unmount() {
  eventCoordinator.removeEventListeners();
  // ... other cleanup
}
```

---

## Error Handling

### Constructor Errors
```javascript
try {
  const coordinator = new EventCoordinator(null, geocodingState);
} catch (error) {
  console.error(error.message);
  // "EventCoordinator: uiCoordinator is required"
}
```

### Missing Coordinates
```javascript
// When restaurant button is clicked without location
// Automatic error toast: "Localização não disponível. Obtenha sua localização primeiro."

// User sees toast notification
// No exception thrown
```

### Missing External Handlers
```javascript
// If window.findNearbyRestaurants is not defined
// Click handler gracefully handles undefined
// May show error toast or log warning
```

---

## Toast Notifications

EventCoordinator uses the toast utility for user feedback:

### Info Toast
```javascript
showInfo('Obtendo sua localização...');
```
- **Trigger**: Geolocation button clicked
- **Duration**: 3 seconds
- **Style**: Blue info banner

### Error Toast
```javascript
showError('Localização não disponível. Obtenha sua localização primeiro.');
```
- **Trigger**: Restaurant/Stats button clicked without location
- **Duration**: 5 seconds
- **Style**: Red error banner

---

## Best Practices

### ✅ Do
- Define external handlers before initializing listeners
- Call `removeEventListeners()` during cleanup
- Use toast notifications for user feedback
- Validate state before external function calls

### ❌ Don't
- Don't initialize listeners multiple times unnecessarily
- Don't forget to cleanup before navigation
- Don't rely on external handlers without validation
- Don't manually remove individual handlers (use cleanup method)

---

## HTML Integration

### Required Button IDs
```html
<!-- Geolocation trigger -->
<button id="obter-localizacao-btn">Obter Localização</button>

<!-- Restaurant search -->
<button id="encontrar-restaurantes-btn">Encontrar Restaurantes</button>

<!-- City statistics -->
<button id="estatisticas-cidade-btn">Estatísticas da Cidade</button>
```

### Example HTML Template
```html
<div class="controls">
  <button id="obter-localizacao-btn" class="btn btn-primary">
    📍 Obter Localização
  </button>
  
  <button id="encontrar-restaurantes-btn" class="btn btn-secondary" disabled>
    🍽️ Encontrar Restaurantes
  </button>
  
  <button id="estatisticas-cidade-btn" class="btn btn-secondary" disabled>
    📊 Estatísticas da Cidade
  </button>
</div>
```

---

## Memory Management

### Handler Tracking
EventCoordinator tracks all event handlers internally:

```javascript
// Internal structure
this._handlers = new Map([
  [buttonElement, { type: 'click', listener: handlerFunction }],
  // ... more handlers
]);
```

### Cleanup Process
```javascript
removeEventListeners() {
  // 1. Iterate through all tracked handlers
  this._handlers.forEach((handlerInfo, element) => {
    element.removeEventListener(handlerInfo.type, handlerInfo.listener);
  });
  
  // 2. Clear the map
  this._handlers.clear();
  
  // 3. Reset initialization flag
  this._initialized = false;
}
```

---

## Related Documentation

- [UICoordinator](./UI_COORDINATOR.md) - Provides DOM element access
- [ServiceCoordinator](./SERVICE_COORDINATOR.md) - Service lifecycle management
- [GeocodingState](./GEOCODING_STATE.md) - State management
- [WebGeocodingManager](./WEB_GEOCODING_MANAGER.md) - Uses EventCoordinator

---

## Version History

- **0.9.0-alpha** (2026-01-28) - Initial implementation
  - Extracted from monolithic WebGeocodingManager
  - Implements Single Responsibility Principle
  - Full event handler cleanup support
  - Toast notification integration

---

**Status**: ✅ Production Ready  
**Test Coverage**: 85%+ (unit + integration tests)  
**Breaking Changes**: None (initial version)
