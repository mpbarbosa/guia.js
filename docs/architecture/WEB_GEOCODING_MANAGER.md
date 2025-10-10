# WebGeocodingManager Class Documentation

## Overview

The `WebGeocodingManager` class is the main coordination layer for the geocoding workflow in the Guia.js application. Introduced in version 0.5.0-alpha and significantly refactored in PR #189, it orchestrates geolocation services, reverse geocoding operations, and UI updates for displaying location-based information. Following the Coordinator/Mediator pattern, it manages communication between services and UI displayers while providing a clean observer-based API for external consumers.

## Motivation

Managing geolocation and geocoding in a web application involves coordinating multiple concerns:
- Obtaining GPS coordinates from the browser
- Converting coordinates to human-readable addresses
- Detecting and notifying about address changes
- Updating multiple UI components in sync
- Managing observer subscriptions
- Handling DOM element initialization and events

The `WebGeocodingManager` class addresses these challenges by:
- **Centralizing coordination**: Single entry point for all geocoding operations
- **Managing dependencies**: Services and displayers are injected or created with defaults
- **Providing observer pattern**: Clean subscription mechanism for state changes
- **Separating concerns**: UI, services, and coordination logic are clearly separated
- **Enabling testability**: Dependency injection allows mocking for tests

Previously, applications had to manually wire up these components and manage their interactions, leading to tightly coupled code that was difficult to test and maintain.

## Features

- **Service coordination**: Manages GeolocationService and ReverseGeocoder
- **UI management**: Initializes and coordinates multiple displayers (position, address, reference place)
- **Observer pattern**: Provides subscribe/unsubscribe for position and address changes
- **Change detection**: Automatically detects changes in logradouro, bairro, and municipio
- **Dependency injection**: Accepts custom services and factories for testing
- **Speech synthesis**: Integrates text-to-speech functionality
- **Backward compatibility**: Maintains legacy API while providing improved architecture

## Architecture

### Class Diagram

```
WebGeocodingManager
    ├── creates → ChangeDetectionCoordinator
    │                 ├── uses → ObserverSubject (shared)
    │                 ├── reads from → ReverseGeocoder
    │                 └── registers with → AddressCache
    ├── uses → ReverseGeocoder
    │              ├── subscribes to → PositionManager
    │              └── notifies → Displayers
    ├── uses → GeolocationService
    │              └── updates → PositionManager
    ├── creates → DisplayerFactory
    │              ├── PositionDisplayer
    │              ├── AddressDisplayer
    │              └── ReferencePlaceDisplayer
    └── uses → ObserverSubject
                   ├── manages → Object observers
                   └── manages → Function observers
```

### Design Patterns Applied

#### 1. Coordinator/Mediator Pattern
The class acts as a central coordinator that manages interactions between services and displayers, preventing direct coupling between components.

#### 2. Observer Pattern
Implements a subject/observer mechanism allowing external components to subscribe to position and address changes without tight coupling.

#### 3. Dependency Injection
Services, factories, and configuration can be injected via constructor, enabling testability and flexibility.

#### 4. Factory Pattern
Uses DisplayerFactory to create UI displayer instances, allowing alternative implementations for testing or different UI frameworks.

## Usage

### Basic Usage

```javascript
// Minimal setup - uses default services
const manager = new WebGeocodingManager(document, {
  locationResult: 'location-result'
});

// Start continuous location tracking
manager.startTracking();
```

### With Custom Element IDs

```javascript
const manager = new WebGeocodingManager(document, {
  locationResult: 'location-result',
  enderecoPadronizadoDisplay: 'address-display',
  referencePlaceDisplay: 'reference-place',
  elementIds: {
    chronometer: 'my-chronometer',
    findRestaurantsBtn: 'find-restaurants',
    cityStatsBtn: 'city-stats',
    timestampDisplay: 'timestamp'
  }
});

manager.startTracking();
```

### Subscribing to Changes (Object Observer)

```javascript
const myObserver = {
  update: (position, currentAddress, enderecoPadronizado) => {
    console.log('Position:', position.coords.latitude, position.coords.longitude);
    console.log('Address:', enderecoPadronizado.enderecoCompleto());
  }
};

manager.subscribe(myObserver);
```

### Subscribing to Changes (Function Observer)

```javascript
manager.subscribeFunction((position, currentAddress, enderecoPadronizado, changeDetails) => {
  if (changeDetails?.hasChanged) {
    console.log(`${changeDetails.component} changed from ${changeDetails.previous} to ${changeDetails.current}`);
  }
  console.log('Current address:', enderecoPadronizado.enderecoCompleto());
});
```

### Dependency Injection for Testing

```javascript
// Mock services for testing
const mockGeocoder = {
  subscribe: jest.fn(),
  currentAddress: { display_name: 'Test Address' },
  enderecoPadronizado: {
    logradouro: 'Test Street',
    bairro: 'Test Neighborhood'
  }
};

const mockGeoService = {
  getSingleLocationUpdate: jest.fn().mockResolvedValue({
    coords: { latitude: -23.5505, longitude: -46.6333 }
  }),
  watchCurrentLocation: jest.fn().mockReturnValue(123)
};

const manager = new WebGeocodingManager(document, {
  locationResult: 'location-result',
  reverseGeocoder: mockGeocoder,
  geolocationService: mockGeoService
});

// Now you can test without real geolocation/geocoding
```

### Pre-configured Services

```javascript
// Configure geocoder before injection
const customGeocoder = new ReverseGeocoder();
customGeocoder.configure({ 
  provider: 'nominatim',
  timeout: 5000,
  retries: 3
});

const manager = new WebGeocodingManager(document, {
  locationResult: 'location-result',
  reverseGeocoder: customGeocoder
});
```

## Real-World Scenarios

### Scenario 1: Navigation Application

Track user movement and update navigation instructions:

```javascript
const manager = new WebGeocodingManager(document, {
  locationResult: 'nav-position',
  enderecoPadronizadoDisplay: 'nav-address'
});

// Subscribe to address changes for turn-by-turn navigation
manager.subscribeFunction((position, currentAddress, enderecoPadronizado, changeDetails) => {
  if (changeDetails?.component === 'logradouro' && changeDetails.hasChanged) {
    // User changed streets - update navigation
    console.log(`Entered ${enderecoPadronizado.logradouro}`);
    updateTurnByTurnDirections(enderecoPadronizado);
    announceStreetChange(enderecoPadronizado.logradouro);
  }
});

manager.startTracking();
```

### Scenario 2: Delivery Application

Monitor driver location and notify when entering delivery area:

```javascript
const manager = new WebGeocodingManager(document, {
  locationResult: 'driver-location',
  enderecoPadronizadoDisplay: 'current-address'
});

const deliveryBairro = 'Vila Madalena';

manager.subscribeFunction((position, currentAddress, enderecoPadronizado, changeDetails) => {
  if (changeDetails?.component === 'bairro') {
    if (enderecoPadronizado.bairro === deliveryBairro) {
      notifyCustomer('Driver arrived in your neighborhood!');
      updateDeliveryStatus('nearby');
    }
  }
});

manager.startTracking();
```

### Scenario 3: Location-Based Services

Display nearby points of interest:

```javascript
const manager = new WebGeocodingManager(document, {
  locationResult: 'user-location',
  enderecoPadronizadoDisplay: 'address-display',
  referencePlaceDisplay: 'poi-display'
});

// Update POIs when municipality changes
manager.subscribeFunction((position, currentAddress, enderecoPadronizado, changeDetails) => {
  if (changeDetails?.component === 'municipio' && changeDetails.hasChanged) {
    console.log(`Entered ${enderecoPadronizado.municipio}, ${enderecoPadronizado.siglaUF}`);
    loadLocalAttractions(enderecoPadronizado.municipio);
    updateWeatherInfo(enderecoPadronizado.municipio);
  }
});

manager.startTracking();
```

### Scenario 4: Real-time Analytics Dashboard

Track user location patterns:

```javascript
const manager = new WebGeocodingManager(document, {
  locationResult: 'location-stats'
});

const locationHistory = [];

manager.subscribeFunction((position, currentAddress, enderecoPadronizado) => {
  // Store location data for analytics
  locationHistory.push({
    timestamp: new Date(position.timestamp),
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    bairro: enderecoPadronizado.bairro,
    municipio: enderecoPadronizado.municipio,
    accuracy: position.coords.accuracy
  });
  
  // Update dashboard
  updateHeatMap(locationHistory);
  updateVisitedNeighborhoods(locationHistory);
});

manager.startTracking();
```

## API Reference

### Constructor

```javascript
new WebGeocodingManager(document, params)
```

**Parameters:**

- `document` (Document): DOM document object for element access
- `params` (Object): Configuration parameters
  - `locationResult` (string, **required**): ID of element to display location results
  - `enderecoPadronizadoDisplay` (string, optional): ID of element for standardized address display
  - `referencePlaceDisplay` (string, optional): ID of element for reference place display
  - `elementIds` (Object, optional): Custom element IDs (defaults to DEFAULT_ELEMENT_IDS)
  - `displayerFactory` (Object, optional): Factory for creating displayers (defaults to DisplayerFactory)
  - `geolocationService` (GeolocationService, optional): Custom geolocation service instance
  - `reverseGeocoder` (ReverseGeocoder, optional): Custom reverse geocoder instance

**Throws:**
- `TypeError` - If document is null or undefined
- `TypeError` - If params.locationResult is not provided

**Initialization Steps:**
1. Store document reference and configuration
2. Initialize observer subject for external subscribers
3. Initialize DOM elements and event handlers
4. Create geolocation and geocoding services
5. Create and wire up UI displayers
6. Establish observer relationships

**Examples:** See [Usage](#usage) section above.

**Since:** 0.5.0-alpha

---

### Properties

#### Instance Properties

- `document` (Document): Reference to the DOM document
- `locationResult` (string): ID of the main location result element
- `enderecoPadronizadoDisplay` (string|null): ID of standardized address display element
- `referencePlaceDisplay` (string|null): ID of reference place display element
- `elementIds` (Object): Configuration object for element IDs (frozen)
- `displayerFactory` (Object): Factory for creating displayer instances
- `observerSubject` (ObserverSubject): Observer subject for managing subscriptions
- `currentPosition` (Object|null): Current GeolocationPosition object
- `currentCoords` (Object|null): Current coordinates object
- `geolocationService` (GeolocationService): Geolocation service instance
- `reverseGeocoder` (ReverseGeocoder): Reverse geocoder instance
- `changeDetectionCoordinator` (ChangeDetectionCoordinator): Coordinator for address change detection
- `positionDisplayer` (Object): Displayer for position information
- `addressDisplayer` (Object): Displayer for address information
- `referencePlaceDisplayer` (Object): Displayer for reference place information
- `chronometer` (Chronometer|undefined): Chronometer for tracking time
- `htmlSpeechSynthesisDisplayer` (Object|undefined): Speech synthesis displayer

#### Read-only Getters

- `observers` (Array): Array of subscribed object observers (delegates to ObserverSubject)
- `functionObservers` (Array): Array of subscribed function observers (delegates to ObserverSubject)

---

### Public Methods

#### `startTracking()`

Starts continuous location tracking and initializes all monitoring systems.

This is the main entry point for starting the geocoding workflow. It:
1. Initializes speech synthesis UI
2. Gets initial location update
3. Starts continuous position watching
4. Registers callbacks for address component change detection

**Returns:** `void`

**Example:**
```javascript
const manager = new WebGeocodingManager(document, {
  locationResult: 'location-result'
});
manager.startTracking(); // Begins continuous tracking
```

**Since:** 0.5.0-alpha

---

#### `subscribe(observer)`

Subscribes an observer object to receive notifications about position and address changes.

Observers must implement an `update(position, currentAddress, enderecoPadronizado)` method to receive notifications. Null observers are rejected with a warning.

**Parameters:**
- `observer` (Object): Observer object with update() method
  - `update` (Function): Method called when notifications occur

**Returns:** `void`

**Example:**
```javascript
const myObserver = {
  update: (pos, addr, endPad) => {
    console.log('Position changed:', pos);
  }
};
manager.subscribe(myObserver);
```

**Since:** 0.5.0-alpha

---

#### `unsubscribe(observer)`

Unsubscribes an observer object from receiving notifications.

**Parameters:**
- `observer` (Object): Observer object to unsubscribe

**Returns:** `void`

**Example:**
```javascript
manager.unsubscribe(myObserver);
```

**Since:** 0.5.0-alpha

---

#### `subscribeFunction(observerFunction)`

Subscribes a function to receive notifications about position and address changes.

Function observers receive `(position, currentAddress, enderecoPadronizado, changeDetails)` as parameters. This provides an alternative to the observer object pattern with additional change detail information.

**Parameters:**
- `observerFunction` (Function): Function to call on notifications
  - Receives: position, currentAddress, enderecoPadronizado, changeDetails

**Returns:** `void`

**Example:**
```javascript
manager.subscribeFunction((pos, addr, endPad, details) => {
  console.log('Address changed:', endPad.enderecoCompleto());
  if (details?.hasChanged) {
    console.log(`Changed component: ${details.component}`);
  }
});
```

**Since:** 0.5.0-alpha

---

#### `unsubscribeFunction(observerFunction)`

Unsubscribes a function observer from receiving notifications.

**Parameters:**
- `observerFunction` (Function): Function observer to unsubscribe

**Returns:** `void`

**Example:**
```javascript
manager.unsubscribeFunction(myFunction);
```

**Since:** 0.5.0-alpha

---

#### `notifyObservers()`

Manually notifies all subscribed object observers about current position and address.

Sends current position, raw address, and standardized address to all observers that have been subscribed via `subscribe()` method. Typically called automatically, but available for manual notification.

**Returns:** `void`

**Example:**
```javascript
// Force notification of all observers
manager.notifyObservers();
```

**Since:** 0.5.0-alpha

---

#### `notifyFunctionObservers()`

Manually notifies all function observers about current state.

Calls each subscribed function observer with current position, address, and standardized address. This is a convenience method for manual notification of function observers.

**Returns:** `void`

**Example:**
```javascript
// Force notification of all function observers
manager.notifyFunctionObservers();
```

**Since:** 0.5.0-alpha

---

#### `getBrazilianStandardAddress()`

Gets the current Brazilian standardized address.

Returns the standardized address object from the reverse geocoder, which contains formatted Brazilian address components.

**Returns:** `BrazilianStandardAddress|null` - Standardized address or null if not yet geocoded

**Example:**
```javascript
const address = manager.getBrazilianStandardAddress();
if (address) {
  console.log(address.enderecoCompleto());
  // Output: "Avenida Paulista, 1578 - Bela Vista, São Paulo/SP"
}
```

**Since:** 0.5.0-alpha

---

#### `getSingleLocationUpdate()`

Gets a single location update from the geolocation service.

Requests current position from the GeolocationService, performs reverse geocoding on the coordinates, and notifies observers. This is typically used for initial position acquisition or manual position refresh.

**Workflow:**
1. Request single location update from GeolocationService
2. If successful, store position and trigger reverse geocoding
3. Process geocoding results and standardize address
4. Notify all observers with new position and address

**Returns:** `void`

**Fires:**
- `ReverseGeocoder#notifyObservers` - When geocoding completes
- `WebGeocodingManager#notifyFunctionObservers` - After geocoding completes

**Example:**
```javascript
// Get one-time location update
manager.getSingleLocationUpdate();
```

**Since:** 0.5.0-alpha

---

#### `initSpeechSynthesis()`

Initializes speech synthesis UI components.

Creates and configures the HTML speech synthesis displayer with configured element IDs for voice controls. Subscribes the displayer to both reverse geocoder and manager notifications, then freezes it to prevent modifications.

This method should be called after the relevant DOM elements are available. Element IDs can be customized via the elementIds configuration in constructor.

**Returns:** `void`

**Example:**
```javascript
// Called automatically by startTracking()
// Can be called manually if needed
manager.initSpeechSynthesis();
```

**Since:** 0.5.0-alpha

---

#### `toString()`

Returns a string representation of this WebGeocodingManager instance.

Provides a human-readable representation showing the class name and current coordinates (if available). Useful for logging and debugging.

**Returns:** `string` - String representation with coordinates or "N/A"

**Example:**
```javascript
console.log(manager.toString());
// Output: "WebGeocodingManager: -23.5505, -46.6333"
```

**Since:** 0.5.0-alpha

---

### Deprecated Methods

The following methods are deprecated and delegate to ChangeDetectionCoordinator. Use the coordinator directly for new code:

#### `setupLogradouroChangeDetection()` ⚠️ DEPRECATED

**Use:** `manager.changeDetectionCoordinator.setupLogradouroChangeDetection()` instead

Sets up logradouro (street) change detection using callback mechanism.

---

#### `removeLogradouroChangeDetection()` ⚠️ DEPRECATED

**Use:** `manager.changeDetectionCoordinator.removeLogradouroChangeDetection()` instead

Removes the logradouro change detection callback.

---

#### `setupBairroChangeDetection()` ⚠️ DEPRECATED

**Use:** `manager.changeDetectionCoordinator.setupBairroChangeDetection()` instead

Sets up bairro (neighborhood) change detection using callback mechanism.

---

#### `removeBairroChangeDetection()` ⚠️ DEPRECATED

**Use:** `manager.changeDetectionCoordinator.removeBairroChangeDetection()` instead

Removes the bairro change detection callback.

---

#### `setupMunicipioChangeDetection()` ⚠️ DEPRECATED

**Use:** `manager.changeDetectionCoordinator.setupMunicipioChangeDetection()` instead

Sets up municipio (municipality/city) change detection using callback mechanism.

---

#### `removeMunicipioChangeDetection()` ⚠️ DEPRECATED

**Use:** `manager.changeDetectionCoordinator.removeMunicipioChangeDetection()` instead

Removes the municipio change detection callback.

---

#### `initElements()` ⚠️ DEPRECATED

**Use:** `_initializeUIElements()` is called automatically in constructor

Legacy method for backward compatibility. Do not use in new code.

---

## Testing

The `WebGeocodingManager` class has comprehensive test coverage with 23 passing tests:

```bash
npm test -- __tests__/WebGeocodingManager.test.js
```

### Test Coverage

Test suites cover:
- ✅ Constructor and initialization (5 tests)
- ✅ Observer pattern implementation (6 tests)
- ✅ Public API methods (3 tests)
- ✅ High cohesion validation (2 tests)
- ✅ Low coupling validation (2 tests)
- ✅ Backward compatibility (3 tests)
- ✅ Error handling (2 tests)

### Testing with Dependency Injection

```javascript
describe('WebGeocodingManager with mocked services', () => {
  it('should work with injected mock geocoder', () => {
    const mockGeocoder = {
      subscribe: jest.fn(),
      currentAddress: { display_name: 'Test' },
      enderecoPadronizado: { logradouro: 'Test Street' }
    };
    
    const manager = new WebGeocodingManager(document, {
      locationResult: 'location-result',
      reverseGeocoder: mockGeocoder
    });
    
    expect(manager.reverseGeocoder).toBe(mockGeocoder);
  });
});
```

### Testing Observer Pattern

```javascript
it('should notify observers on position change', () => {
  const manager = new WebGeocodingManager(document, {
    locationResult: 'location-result'
  });
  
  const observer = {
    update: jest.fn()
  };
  
  manager.subscribe(observer);
  manager.notifyObservers();
  
  expect(observer.update).toHaveBeenCalled();
});
```

## Design Considerations

### Coordinator Pattern

The class serves as a central coordinator (Mediator pattern) that:
- **Prevents tight coupling**: Components don't know about each other directly
- **Centralizes wiring**: Observer relationships are established in one place
- **Simplifies testing**: Mock one coordinator instead of multiple components
- **Improves maintainability**: Changes to component relationships are localized

### Dependency Injection Benefits

The constructor accepts optional service instances:
1. **Testability**: Inject mocks to avoid real geolocation/network calls
2. **Flexibility**: Use custom service implementations
3. **Configuration**: Pre-configure services before injection
4. **Backward Compatibility**: Default instances created if not provided

### Observer Pattern Implementation

Two subscription mechanisms are provided:

**Object Observers** (Classic pattern):
```javascript
const observer = {
  update: (pos, addr, endPad) => { /* ... */ }
};
manager.subscribe(observer);
```

**Function Observers** (Simplified):
```javascript
manager.subscribeFunction((pos, addr, endPad, details) => {
  // Additional changeDetails parameter
});
```

Function observers receive additional change details, making them more suitable for reactive applications.

### Immutability Patterns

- Created displayers are frozen with `Object.freeze()` to prevent modifications
- Element IDs configuration is frozen to ensure immutability
- Observer arrays use immutable patterns in ObserverSubject

### Why Not Fully Immutable?

The class maintains mutable state for:
1. **Position updates**: GPS positions change continuously in real-time
2. **Observer management**: Dynamic subscription/unsubscription is necessary
3. **DOM integration**: Browser APIs require mutable references
4. **Performance**: Real-time tracking needs efficient state updates

However, immutability principles are applied where appropriate (displayers, configuration).

## Related Classes

- **[PositionManager](./CLASS_DIAGRAM.md)**: Singleton managing current device position state
- **[ReverseGeocoder](./CLASS_DIAGRAM.md)**: Converts coordinates to addresses via Nominatim API
- **[GeolocationService](./CLASS_DIAGRAM.md)**: Wraps browser Geolocation API
- **[ChangeDetectionCoordinator](./CLASS_DIAGRAM.md)**: Manages address component change detection callbacks
- **[ObserverSubject](./CLASS_DIAGRAM.md)**: Observer pattern implementation for subscriptions
- **[DisplayerFactory](./CLASS_DIAGRAM.md)**: Factory for creating UI displayer instances
- **[GeoPosition](./GEO_POSITION.md)**: Geographic position data wrapper

## Common Patterns

### Pattern 1: Single Location Lookup

Get location once without continuous tracking:

```javascript
const manager = new WebGeocodingManager(document, {
  locationResult: 'location-result'
});

manager.subscribeFunction((position, currentAddress, enderecoPadronizado) => {
  console.log('Current location:', enderecoPadronizado.enderecoCompleto());
  // Do something with the location
});

// Get single update (no continuous tracking)
manager.getSingleLocationUpdate();
```

### Pattern 2: Conditional Notifications

Only react to specific types of changes:

```javascript
manager.subscribeFunction((position, currentAddress, enderecoPadronizado, changeDetails) => {
  if (!changeDetails) return; // Initial notification
  
  switch (changeDetails.component) {
    case 'logradouro':
      handleStreetChange(enderecoPadronizado.logradouro);
      break;
    case 'bairro':
      handleNeighborhoodChange(enderecoPadronizado.bairro);
      break;
    case 'municipio':
      handleCityChange(enderecoPadronizado.municipio);
      break;
  }
});
```

### Pattern 3: Unsubscribe After Condition

Stop tracking after reaching destination:

```javascript
const destinationBairro = 'Vila Madalena';

const observer = (position, currentAddress, enderecoPadronizado) => {
  if (enderecoPadronizado.bairro === destinationBairro) {
    console.log('Destination reached!');
    manager.unsubscribeFunction(observer);
    stopNavigation();
  }
};

manager.subscribeFunction(observer);
manager.startTracking();
```

### Pattern 4: Error Handling in Observers

Robust observer implementation with error handling:

```javascript
const robustObserver = {
  update: (position, currentAddress, enderecoPadronizado) => {
    try {
      // Update UI
      updateMap(position.coords);
      updateAddressDisplay(enderecoPadronizado);
    } catch (error) {
      console.error('Error updating UI:', error);
      // Don't let one observer's error crash the app
    }
  }
};

manager.subscribe(robustObserver);
```

## Referential Transparency Considerations

The WebGeocodingManager class is **not referentially transparent** because it:
- Performs I/O operations (geolocation, network requests)
- Mutates internal state (position, observers)
- Manages side effects (DOM updates, notifications)
- Interacts with browser APIs (navigator.geolocation)

However, the class follows best practices to minimize complexity:

### Pure Logic Extraction

Where possible, pure functions are used for business logic:

```javascript
// Pure function - can be tested in isolation
function shouldNotifyChange(previous, current) {
  return previous !== current && current !== null;
}

// Used within impure coordinator
if (shouldNotifyChange(prevBairro, currentBairro)) {
  this.notifyBairroChangeObservers(changeDetails);
}
```

### Explicit Side Effects

Side effects are:
- **Clearly identified**: Methods that perform I/O are documented
- **Centralized**: Coordination logic is separated from business logic
- **Testable**: Dependency injection allows mocking I/O operations

### Testing Strategy

Use dependency injection to test coordinator logic without side effects:

```javascript
const mockGeocoder = {
  subscribe: jest.fn(),
  currentAddress: mockData,
  enderecoPadronizado: mockAddress
};

const manager = new WebGeocodingManager(document, {
  locationResult: 'location-result',
  reverseGeocoder: mockGeocoder
});

// Test coordination logic without real network calls
expect(mockGeocoder.subscribe).toHaveBeenCalledTimes(2);
```

### Side Effect Boundaries

Side effects are isolated at boundaries:
- **GeolocationService**: Handles browser geolocation API
- **ReverseGeocoder**: Handles network requests
- **Displayers**: Handle DOM updates
- **WebGeocodingManager**: Coordinates these boundaries

This architecture makes it clear where side effects occur and enables testing coordination logic independently.

## Version History

- **0.5.0-alpha**: Initial implementation of WebGeocodingManager
  - Constructor with service creation
  - Observer pattern for position/address changes
  - Basic UI element initialization
  - startTracking() for continuous monitoring

- **0.8.5-alpha** (PR #189): Major refactoring
  - Dependency injection for services
  - High cohesion improvements (focused methods)
  - Low coupling improvements (configuration object)
  - Comprehensive JSDoc documentation (200+ lines)
  - 23 unit tests with 100% backward compatibility
  - ChangeDetectionCoordinator extraction
  - DisplayerFactory pattern
  - Immutability for displayers and configuration

## Author

Marcelo Pereira Barbosa

## See Also

### Related Architecture Documentation
- **[CLASS_DIAGRAM.md](./CLASS_DIAGRAM.md)** - Complete class architecture and relationships
- **[WEBGEOCODINGMANAGER_REFACTORING.md](./WEBGEOCODINGMANAGER_REFACTORING.md)** - Detailed refactoring analysis (PR #189)
- **[GEO_POSITION.md](./GEO_POSITION.md)** - Geographic position data documentation
- **[REFERENCE_PLACE.md](./REFERENCE_PLACE.md)** - Reference place class documentation
- **[observer-pattern-sequence.md](./observer-pattern-sequence.md)** - Observer pattern execution flow diagrams

### Testing and Quality
- **[TESTING.md](../TESTING.md)** - Testing documentation and coverage
- **[TDD_GUIDE.md](../../.github/TDD_GUIDE.md)** - Test-driven development approach
- **[UNIT_TEST_GUIDE.md](../../.github/UNIT_TEST_GUIDE.md)** - Unit testing best practices

### Development Guidelines
- **[REFERENTIAL_TRANSPARENCY.md](../../.github/REFERENTIAL_TRANSPARENCY.md)** - Functional programming guidelines
- **[CODE_REVIEW_GUIDE.md](../../.github/CODE_REVIEW_GUIDE.md)** - Code review standards
- **[HIGH_COHESION_GUIDE.md](../../.github/HIGH_COHESION_GUIDE.md)** - Single responsibility and cohesion
- **[LOW_COUPLING_GUIDE.md](../../.github/LOW_COUPLING_GUIDE.md)** - Dependency management

### Related Issues and Technical Debt
- **[ISSUE_189_NEXT_STEPS.md](../issue-189/ISSUE_189_NEXT_STEPS.md)** - Follow-up technical debt items

## External Documentation

- [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [OpenStreetMap Nominatim API](https://nominatim.org/release-docs/latest/api/Overview/)
- [Observer Pattern](https://refactoring.guru/design-patterns/observer)
- [Mediator Pattern](https://refactoring.guru/design-patterns/mediator)
- [Dependency Injection](https://martinfowler.com/articles/injection.html)

## License

See repository root for license information.
