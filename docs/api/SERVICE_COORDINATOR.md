# ServiceCoordinator API Documentation

**Version**: 0.9.0-alpha  
**Module**: `coordination/ServiceCoordinator`  
**Since**: 0.9.0-alpha (Phase 1: WebGeocodingManager refactoring)

---

## Overview

ServiceCoordinator manages the lifecycle of services, observers, and displayers in the Guia Turístico application. It serves as the coordination layer between low-level services (geolocation, geocoding) and high-level UI components.

**Single Responsibility**: Service coordination and lifecycle management

### Key Features
- ✅ Service lifecycle management (start, stop, cleanup)
- ✅ Observer pattern wiring and subscription management
- ✅ Displayer creation and initialization
- ✅ Resource cleanup and memory leak prevention
- ✅ Integration with PositionManager singleton
- ✅ Centralized logging and error handling

### Design Principles
- **Separation of Concerns**: Isolates service coordination from UI and events
- **Dependency Injection**: Receives all services via constructor
- **Observer Pattern**: Manages observer subscriptions centrally
- **Resource Management**: Handles service cleanup properly

---

## Class Signature

```javascript
class ServiceCoordinator {
  constructor({
    geolocationService,
    reverseGeocoder,
    changeDetectionCoordinator,
    observerSubject,
    displayerFactory
  })
}
```

---

## Constructor

### Syntax
```javascript
new ServiceCoordinator(params)
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | `Object` | ✅ | Configuration parameters |
| `params.geolocationService` | `GeolocationService` | ✅ | Geolocation service instance |
| `params.reverseGeocoder` | `ReverseGeocoder` | ✅ | Reverse geocoder instance |
| `params.changeDetectionCoordinator` | `ChangeDetectionCoordinator` | ✅ | Change detection coordinator |
| `params.observerSubject` | `ObserverSubject` | ✅ | Observer subject for notifications |
| `params.displayerFactory` | `Object` | ✅ | Factory for creating displayers |

### Throws
- `TypeError` - If any required parameter is missing

### Example
```javascript
import ServiceCoordinator from './coordination/ServiceCoordinator.js';
import GeolocationService from './services/GeolocationService.js';
import ReverseGeocoder from './services/ReverseGeocoder.js';
import ChangeDetectionCoordinator from './services/ChangeDetectionCoordinator.js';
import ObserverSubject from './core/ObserverSubject.js';
import DisplayerFactory from './html/DisplayerFactory.js';

const coordinator = new ServiceCoordinator({
  geolocationService: new GeolocationService(),
  reverseGeocoder: new ReverseGeocoder(),
  changeDetectionCoordinator: new ChangeDetectionCoordinator(),
  observerSubject: new ObserverSubject(),
  displayerFactory: DisplayerFactory
});
```

---

## Public Methods

### createDisplayers()

Creates and initializes all display components.

#### Syntax
```javascript
coordinator.createDisplayers(locationResult, addressDisplay, referenceDisplay, highlightCardsDisplay, sidraDisplay)
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `locationResult` | `HTMLElement` | ✅ | Container for position display |
| `addressDisplay` | `HTMLElement` | ✅ | Container for address display |
| `referenceDisplay` | `HTMLElement` | ✅ | Container for reference place display |
| `highlightCardsDisplay` | `HTMLElement` | ✅ | Container for municipality/neighborhood cards |
| `sidraDisplay` | `HTMLElement` | ✅ | Container for IBGE SIDRA demographic data |

#### Returns
`void`

#### Example
```javascript
const locationResult = document.getElementById('location-result');
const addressDisplay = document.getElementById('address-display');
const referenceDisplay = document.getElementById('reference-display');
const highlightCards = document.getElementById('highlight-cards');
const sidraDisplay = document.getElementById('sidra-display');

coordinator.createDisplayers(
  locationResult,
  addressDisplay,
  referenceDisplay,
  highlightCards,
  sidraDisplay
);
```

---

### wireObservers()

Wires up observer pattern subscriptions between services and displayers.

#### Syntax
```javascript
coordinator.wireObservers()
```

#### Returns
`void`

#### Description
Connects observers to subjects for:
- Position updates → Position displayer
- Address updates → Address displayer
- Reference place updates → Reference place displayer
- Municipality/neighborhood updates → Highlight cards displayer
- IBGE data updates → SIDRA displayer

#### Example
```javascript
// After creating displayers
coordinator.wireObservers();

// Now position updates will automatically trigger UI updates
```

---

### startTracking()

Starts geolocation tracking with current position and continuous updates.

#### Syntax
```javascript
coordinator.startTracking()
```

#### Returns
`Promise<void>`

#### Description
1. Requests current position from GeolocationService
2. Initiates continuous position watching
3. Triggers reverse geocoding for address lookup
4. Updates PositionManager with new positions

#### Example
```javascript
try {
  await coordinator.startTracking();
  console.log('Tracking started successfully');
} catch (error) {
  console.error('Failed to start tracking:', error);
}
```

---

### stopTracking()

Stops all geolocation tracking and clears resources.

#### Syntax
```javascript
coordinator.stopTracking()
```

#### Returns
`void`

#### Description
- Stops geolocation watching
- Clears any pending operations
- Does not remove observers (use `cleanup()` for full teardown)

#### Example
```javascript
coordinator.stopTracking();
console.log('Tracking stopped');
```

---

### cleanup()

Performs complete cleanup of all services and observers.

#### Syntax
```javascript
coordinator.cleanup()
```

#### Returns
`void`

#### Description
Comprehensive cleanup including:
- Stopping geolocation tracking
- Clearing all observer subscriptions
- Cleaning up displayers
- Releasing all resources

**⚠️ Important**: Call this when disposing of the coordinator to prevent memory leaks.

#### Example
```javascript
// When shutting down the application
coordinator.cleanup();
```

---

## Architecture Integration

### Coordination Layer
ServiceCoordinator is part of the coordination layer alongside:
- **EventCoordinator** - Handles DOM events
- **UICoordinator** - Manages UI state
- **SpeechCoordinator** - Coordinates text-to-speech

### Dependencies

**Required Services**:
- `GeolocationService` - Browser geolocation API wrapper
- `ReverseGeocoder` - Address lookup via Nominatim API
- `ChangeDetectionCoordinator` - Significant location change detection

**Core Components**:
- `PositionManager` - Singleton for current position state
- `ObserverSubject` - Observer pattern implementation

**Displayers** (via DisplayerFactory):
- `HTMLPositionDisplayer` - Coordinate display
- `HTMLAddressDisplayer` - Address rendering
- `HTMLReferencePlaceDisplayer` - Reference location display
- `HTMLHighlightCardsDisplayer` - Municipality/neighborhood cards
- `HTMLSidraDisplayer` - IBGE demographic data

---

## Usage Patterns

### Basic Setup
```javascript
// 1. Create services
const geolocationService = new GeolocationService();
const reverseGeocoder = new ReverseGeocoder();
const changeDetector = new ChangeDetectionCoordinator();
const observerSubject = new ObserverSubject();

// 2. Create coordinator
const serviceCoordinator = new ServiceCoordinator({
  geolocationService,
  reverseGeocoder,
  changeDetectionCoordinator: changeDetector,
  observerSubject,
  displayerFactory: DisplayerFactory
});

// 3. Initialize displayers
const locationDiv = document.getElementById('location-result');
const addressDiv = document.getElementById('address-display');
const refDiv = document.getElementById('reference-display');
const highlightDiv = document.getElementById('highlight-cards');
const sidraDiv = document.getElementById('sidra-display');

serviceCoordinator.createDisplayers(
  locationDiv,
  addressDiv,
  refDiv,
  highlightDiv,
  sidraDiv
);

// 4. Wire observers
serviceCoordinator.wireObservers();

// 5. Start tracking
await serviceCoordinator.startTracking();
```

### Cleanup Pattern
```javascript
// Always cleanup when done
window.addEventListener('beforeunload', () => {
  serviceCoordinator.cleanup();
});

// Or when navigating away
function navigateAway() {
  serviceCoordinator.cleanup();
  // ... navigation logic
}
```

---

## Error Handling

### Constructor Errors
```javascript
try {
  const coordinator = new ServiceCoordinator({
    geolocationService: null // Missing required param
  });
} catch (error) {
  console.error(error.message);
  // "ServiceCoordinator: geolocationService is required"
}
```

### Tracking Errors
```javascript
try {
  await coordinator.startTracking();
} catch (error) {
  if (error.code === 1) {
    // PERMISSION_DENIED
    console.error('User denied geolocation permission');
  } else if (error.code === 2) {
    // POSITION_UNAVAILABLE
    console.error('Position unavailable');
  } else {
    // TIMEOUT or other error
    console.error('Geolocation error:', error.message);
  }
}
```

---

## Best Practices

### ✅ Do
- Always call `createDisplayers()` before `wireObservers()`
- Call `cleanup()` when disposing of the coordinator
- Handle tracking errors with try-catch
- Use dependency injection for all services

### ❌ Don't
- Don't create multiple ServiceCoordinator instances
- Don't forget to cleanup before navigation
- Don't start tracking without creating displayers first
- Don't manually manage observer subscriptions (let coordinator handle it)

---

## Related Documentation

- [WebGeocodingManager](./WEB_GEOCODING_MANAGER.md) - Uses ServiceCoordinator
- [EventCoordinator](./EVENT_COORDINATOR.md) - Sibling coordinator for events
- [UICoordinator](./UI_COORDINATOR.md) - Sibling coordinator for UI
- [PositionManager](./POSITION_MANAGER.md) - Position state singleton
- [DisplayerFactory](./DISPLAYER_FACTORY.md) - Displayer creation

---

## Version History

- **0.9.0-alpha** (2026-01-28) - Initial implementation as part of WebGeocodingManager refactoring
- Extracted from monolithic WebGeocodingManager class
- Implements Single Responsibility Principle
- Full observer pattern support

---

**Status**: ✅ Production Ready  
**Test Coverage**: 90%+ (integration tests)  
**Breaking Changes**: None (initial version)
