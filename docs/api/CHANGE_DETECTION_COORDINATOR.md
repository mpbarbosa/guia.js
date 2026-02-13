# ChangeDetectionCoordinator API Documentation

**Version:** 0.9.0-alpha  
**Module:** `services/ChangeDetectionCoordinator`  
**Location:** `src/services/ChangeDetectionCoordinator.js`

## Overview

ChangeDetectionCoordinator manages callbacks for detecting and notifying observers about changes in address components (logradouro, bairro, municipio). This class coordinates between AddressDataExtractor change detection and observer notifications, enabling reactive UI updates when users move between streets, neighborhoods, or municipalities.

### Purpose and Responsibility

The coordinator handles:
- Registration of change detection callbacks with AddressDataExtractor
- Detection of logradouro (street), bairro (neighborhood), and municipio (municipality) changes
- Observer notifications when address components change
- Coordination between position updates, address data, and UI components
- Error handling to prevent cascading failures in the change detection system

## Architecture

### Integration Points

- **AddressDataExtractor**: Registers callbacks for address component changes
- **ReverseGeocoder**: Source of address data for change detection
- **ObserverSubject**: Observer pattern implementation for notifications
- **UI Components**: HTMLAddressDisplayer, HTMLHighlightCardsDisplayer, speech synthesis
- **WebGeocodingManager**: Main orchestrator that initializes the coordinator

### Dependencies

```javascript
import ObserverSubject from '../core/ObserverSubject.js';
import { log, warn, error } from '../utils/logger.js';
```

### External Dependencies

The class expects these to be injected or set externally:
- `AddressDataExtractor` (set via `setAddressDataExtractor()`)
- `currentPosition` (updated via `setCurrentPosition()`)

## Design Pattern

### Callback-Based Change Detection

The coordinator replaces timer-based polling with event-driven callbacks:

**Old Approach (v0.9.0 and earlier):**
```javascript
// Timer-based polling (inefficient)
setInterval(() => {
  if (oldAddress !== newAddress) {
    notifyObservers();
  }
}, 1000);
```

**New Approach (v0.9.0-alpha):**
```javascript
// Callback-based (efficient)
AddressDataExtractor.setLogradouroChangeCallback((changeDetails) => {
  coordinator.handleLogradouroChange(changeDetails);
});
```

### Benefits

- ✅ **Performance**: No polling overhead
- ✅ **Accuracy**: Immediate change detection
- ✅ **Scalability**: Centralized change management
- ✅ **Testability**: Easy to mock callbacks
- ✅ **Memory**: Fewer timer instances

## Constructor

### Signature

```javascript
new ChangeDetectionCoordinator(params)
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params` | `Object` | Yes | Configuration parameters |
| `params.reverseGeocoder` | `ReverseGeocoder` | Yes | ReverseGeocoder instance for address data |
| `params.observerSubject` | `ObserverSubject` | Yes | ObserverSubject for managing observers |

### Example

```javascript
import ChangeDetectionCoordinator from './ChangeDetectionCoordinator.js';
import ReverseGeocoder from './ReverseGeocoder.js';
import ObserverSubject from '../core/ObserverSubject.js';

const reverseGeocoder = new ReverseGeocoder(fetchManager);
const observerSubject = new ObserverSubject();

const coordinator = new ChangeDetectionCoordinator({
  reverseGeocoder,
  observerSubject
});
```

## Public Methods

### setAddressDataExtractor(addressDataExtractor)

Sets the AddressDataExtractor reference to avoid circular dependencies during module loading.

**Signature:**
```javascript
setAddressDataExtractor(addressDataExtractor: Object): void
```

**Parameters:**
- `addressDataExtractor` (Object): AddressDataExtractor class or instance

**Example:**
```javascript
import AddressDataExtractor from '../data/AddressDataExtractor.js';

coordinator.setAddressDataExtractor(AddressDataExtractor);
```

**Why Needed:**
This method breaks circular dependencies:
- `ChangeDetectionCoordinator` needs `AddressDataExtractor` for callbacks
- `AddressDataExtractor` might import services that use `ChangeDetectionCoordinator`
- Solution: Inject `AddressDataExtractor` after module loading completes

---

### setCurrentPosition(position)

Sets the current position. Called by WebGeocodingManager when position updates.

**Signature:**
```javascript
setCurrentPosition(position: Object): void
```

**Parameters:**
- `position` (Object): Current position object from GeolocationService

**Example:**
```javascript
// Called automatically by WebGeocodingManager
positionManager.subscribe({
  update(positionManager) {
    coordinator.setCurrentPosition(positionManager.lastPosition);
  }
});
```

**Position Object Structure:**
```javascript
{
  coords: {
    latitude: number,
    longitude: number,
    accuracy: number,
    // ... other GeolocationPosition properties
  },
  timestamp: number
}
```

---

### setupChangeDetection()

Sets up change detection callbacks for all address components (logradouro, bairro, municipio).

**Signature:**
```javascript
setupChangeDetection(): void
```

**Example:**
```javascript
// Called during initialization
coordinator.setAddressDataExtractor(AddressDataExtractor);
coordinator.setupChangeDetection();
```

**What It Does:**
1. Registers logradouro change callback
2. Registers bairro change callback
3. Registers municipio change callback

**Equivalent To:**
```javascript
coordinator.setupLogradouroChangeDetection();
coordinator.setupBairroChangeDetection();
coordinator.setupMunicipioChangeDetection();
```

---

### removeAllChangeDetection()

Removes all change detection callbacks. Use during cleanup or when stopping change detection.

**Signature:**
```javascript
removeAllChangeDetection(): void
```

**Example:**
```javascript
// Cleanup on component unmount
window.addEventListener('beforeunload', () => {
  coordinator.removeAllChangeDetection();
});
```

**What It Does:**
1. Clears logradouro change callback
2. Clears bairro change callback
3. Clears municipio change callback

**Equivalent To:**
```javascript
coordinator.removeLogradouroChangeDetection();
coordinator.removeBairroChangeDetection();
coordinator.removeMunicipioChangeDetection();
```

---

### setupLogradouroChangeDetection()

Sets up logradouro (street) change detection using callback mechanism.

**Signature:**
```javascript
setupLogradouroChangeDetection(): void
```

**Example:**
```javascript
coordinator.setupLogradouroChangeDetection();
```

**Callback Signature:**
```javascript
(changeDetails: Object) => {
  // changeDetails structure:
  {
    previous: { logradouro: string, ... },
    current: { logradouro: string, ... },
    hasChanged: boolean
  }
}
```

---

### removeLogradouroChangeDetection()

Removes the logradouro change detection callback.

**Signature:**
```javascript
removeLogradouroChangeDetection(): void
```

**Example:**
```javascript
coordinator.removeLogradouroChangeDetection();
```

---

### setupBairroChangeDetection()

Sets up bairro (neighborhood) change detection using callback mechanism.

**Signature:**
```javascript
setupBairroChangeDetection(): void
```

**Example:**
```javascript
coordinator.setupBairroChangeDetection();
```

**Callback Signature:**
```javascript
(changeDetails: Object) => {
  // changeDetails structure:
  {
    previous: { bairro: string, ... },
    current: { bairro: string, ... },
    hasChanged: boolean
  }
}
```

---

### removeBairroChangeDetection()

Removes the bairro change detection callback.

**Signature:**
```javascript
removeBairroChangeDetection(): void
```

**Example:**
```javascript
coordinator.removeBairroChangeDetection();
```

---

### setupMunicipioChangeDetection()

Sets up municipio (municipality/city) change detection using callback mechanism.

**Signature:**
```javascript
setupMunicipioChangeDetection(): void
```

**Example:**
```javascript
coordinator.setupMunicipioChangeDetection();
```

**Callback Signature:**
```javascript
(changeDetails: Object) => {
  // changeDetails structure:
  {
    previous: { municipio: string, siglaUF: string, ... },
    current: { municipio: string, siglaUF: string, ... },
    hasChanged: boolean
  }
}
```

---

### removeMunicipioChangeDetection()

Removes the municipio change detection callback.

**Signature:**
```javascript
removeMunicipioChangeDetection(): void
```

**Example:**
```javascript
coordinator.removeMunicipioChangeDetection();
```

## Observer Notification Methods

### handleLogradouroChange(changeDetails)

Handles logradouro change events and notifies observers. Called automatically when a logradouro change is detected.

**Signature:**
```javascript
handleLogradouroChange(changeDetails: Object): void
```

**Parameters:**
- `changeDetails.previous` (Object): Previous address component values
- `changeDetails.current` (Object): Current address component values
- `changeDetails.hasChanged` (boolean): Whether change actually occurred

**Example:**
```javascript
// Called automatically by AddressDataExtractor
const changeDetails = {
  previous: { logradouro: "Rua A" },
  current: { logradouro: "Rua B" },
  hasChanged: true
};
coordinator.handleLogradouroChange(changeDetails);
```

**Error Handling:**
Wraps notification in try-catch to prevent cascading failures:
```javascript
try {
  this.notifyLogradouroChangeObservers(changeDetails);
} catch (err) {
  error("Error handling logradouro change:", err);
}
```

---

### handleBairroChange(changeDetails)

Handles bairro change events and notifies observers. Called automatically when a bairro change is detected.

**Signature:**
```javascript
handleBairroChange(changeDetails: Object): void
```

**Parameters:**
- `changeDetails.previous` (Object): Previous address component values
- `changeDetails.current` (Object): Current address component values  
- `changeDetails.hasChanged` (boolean): Whether change actually occurred

**Example:**
```javascript
const changeDetails = {
  previous: { bairro: "Centro" },
  current: { bairro: "Jardins" },
  hasChanged: true
};
coordinator.handleBairroChange(changeDetails);
```

**Log Output:**
```
(ChangeDetectionCoordinator) Notificando os observadores da mudança de bairro.
```

---

### handleMunicipioChange(changeDetails)

Handles municipio change events and notifies observers. Called automatically when a municipio change is detected.

**Signature:**
```javascript
handleMunicipioChange(changeDetails: Object): void
```

**Parameters:**
- `changeDetails.previous` (Object): Previous address component values
- `changeDetails.current` (Object): Current address component values
- `changeDetails.hasChanged` (boolean): Whether change actually occurred

**Example:**
```javascript
const changeDetails = {
  previous: { municipio: "São Paulo", siglaUF: "SP" },
  current: { municipio: "Campinas", siglaUF: "SP" },
  hasChanged: true
};
coordinator.handleMunicipioChange(changeDetails);
```

**Log Output:**
```
(ChangeDetectionCoordinator) Notificando os observadores da mudança de município.
```

## Observer Notification Details

### Observer Types

The coordinator notifies two types of observers:

#### 1. Regular Observers (with `update()` method)

**Signature:**
```javascript
observer.update(changeData, changeType, null, changeDetails)
```

**Parameters:**
- `changeData`: Specific data for the change (e.g., new logradouro value)
- `changeType`: "LogradouroChanged", "BairroChanged", or "MunicipioChanged"
- `null`: Reserved parameter
- `changeDetails`: Full change details with previous/current values

**Example Observer:**
```javascript
const myObserver = {
  update(changeData, changeType, _, changeDetails) {
    if (changeType === "BairroChanged") {
      console.log('New neighborhood:', changeData);
      console.log('Previous:', changeDetails.previous.bairro);
      console.log('Current:', changeDetails.current.bairro);
    }
  }
};

coordinator.observerSubject.subscribe(myObserver);
```

#### 2. Function Observers

**Signature:**
```javascript
functionObserver(currentPosition, currentAddress, enderecoPadronizado, changeDetails)
```

**Parameters:**
- `currentPosition`: Current GeolocationPosition object
- `currentAddress`: Raw Nominatim address data
- `enderecoPadronizado`: Brazilian standardized address
- `changeDetails`: Full change details with previous/current values

**Example Function Observer:**
```javascript
const myFunctionObserver = (position, address, brazilianAddress, changeDetails) => {
  console.log('Position:', position.coords);
  console.log('Full address:', address.display_name);
  console.log('Municipality:', brazilianAddress.municipio);
  console.log('Change:', changeDetails);
};

coordinator.observerSubject.subscribeFunctionObserver(myFunctionObserver);
```

### Change Events

| Event Type | Trigger | changeData Value |
|------------|---------|------------------|
| `"LogradouroChanged"` | Street name changes | `changeDetails.current.logradouro` |
| `"BairroChanged"` | Neighborhood changes | `changeDetails.current.bairro` |
| `"MunicipioChanged"` | Municipality changes | `reverseGeocoder.currentAddress` (full address) |

### Change Details Structure

```javascript
{
  previous: {
    logradouro: string,
    bairro: string,
    municipio: string,
    siglaUF: string,
    // ... other address components
  },
  current: {
    logradouro: string,
    bairro: string,
    municipio: string,
    siglaUF: string,
    // ... other address components
  },
  hasChanged: boolean
}
```

## Integration Examples

### Complete Setup with WebGeocodingManager

```javascript
import ChangeDetectionCoordinator from './ChangeDetectionCoordinator.js';
import ReverseGeocoder from './ReverseGeocoder.js';
import ObserverSubject from '../core/ObserverSubject.js';
import AddressDataExtractor from '../data/AddressDataExtractor.js';

// Create coordinator
const reverseGeocoder = new ReverseGeocoder(fetchManager);
const observerSubject = new ObserverSubject();

const coordinator = new ChangeDetectionCoordinator({
  reverseGeocoder,
  observerSubject
});

// Setup dependencies
coordinator.setAddressDataExtractor(AddressDataExtractor);

// Register change detection callbacks
coordinator.setupChangeDetection();

// Subscribe observers
const bairroDisplayer = {
  update(changeData, changeType, _, changeDetails) {
    if (changeType === "BairroChanged") {
      document.getElementById('bairro-display').textContent = changeData;
    }
  }
};

observerSubject.subscribe(bairroDisplayer);
```

### With UI Components

```javascript
import HTMLHighlightCardsDisplayer from '../html/HTMLHighlightCardsDisplayer.js';

// Create UI component
const cardsElement = document.getElementById('highlight-cards');
const cardsDisplayer = new HTMLHighlightCardsDisplayer(cardsElement);

// Subscribe to address changes
observerSubject.subscribe(cardsDisplayer);

// Cards automatically update when bairro or municipio changes
```

### Cleanup on Page Unload

```javascript
// Proper cleanup to prevent memory leaks
window.addEventListener('beforeunload', () => {
  coordinator.removeAllChangeDetection();
  observerSubject.unsubscribeAll();
});
```

### Manual Testing

```javascript
// Simulate address changes for testing
const testChangeDetails = {
  previous: { bairro: "Centro", municipio: "São Paulo" },
  current: { bairro: "Jardins", municipio: "São Paulo" },
  hasChanged: true
};

coordinator.handleBairroChange(testChangeDetails);
// Observers should be notified
```

## Error Handling

### Defensive Programming

All handler methods include error handling to prevent cascading failures:

```javascript
try {
  this.notifyBairroChangeObservers(changeDetails);
} catch (err) {
  error("(ChangeDetectionCoordinator) Error handling bairro change:", err);
}
```

### Function Observer Error Handling

Each function observer is called in a separate try-catch:

```javascript
for (const fn of this.observerSubject.functionObservers) {
  try {
    fn(currentPosition, currentAddress, enderecoPadronizado, changeDetails);
  } catch (err) {
    error(`Error notifying function observer about ${changeType}:`, err);
  }
}
```

**Benefits:**
- One observer's error doesn't block others
- Errors are logged with context
- System remains stable during failures

### Missing Dependencies

The coordinator gracefully handles missing dependencies:

```javascript
if (!this.AddressDataExtractor) {
  warn("(ChangeDetectionCoordinator) AddressDataExtractor not available");
  return; // Silently skip callback registration
}
```

## Performance Considerations

### Callback vs. Polling

**Old Approach (Timer-based):**
- ❌ CPU overhead from constant polling
- ❌ Delayed change detection (polling interval)
- ❌ Multiple timers consuming resources
- ❌ Memory leaks if timers not cleared

**New Approach (Callback-based):**
- ✅ Zero overhead when no changes
- ✅ Immediate change detection
- ✅ Single callback per component
- ✅ Automatic cleanup

### Memory Management

```javascript
// Proper cleanup prevents memory leaks
coordinator.removeAllChangeDetection(); // Clears callbacks
observerSubject.unsubscribeAll();       // Clears observers
```

### Observer Count

Monitor observer count to prevent performance degradation:
```javascript
console.log('Observer count:', coordinator.observerSubject.observers.length);
console.log('Function observers:', coordinator.observerSubject.functionObservers.length);
```

**Recommendation:** Keep total observers under 20 for optimal performance.

## Testing

### Mock AddressDataExtractor

```javascript
const mockAddressDataExtractor = {
  setLogradouroChangeCallback: jest.fn(),
  setBairroChangeCallback: jest.fn(),
  setMunicipioChangeCallback: jest.fn()
};

coordinator.setAddressDataExtractor(mockAddressDataExtractor);
coordinator.setupChangeDetection();

expect(mockAddressDataExtractor.setLogradouroChangeCallback).toHaveBeenCalled();
expect(mockAddressDataExtractor.setBairroChangeCallback).toHaveBeenCalled();
expect(mockAddressDataExtractor.setMunicipioChangeCallback).toHaveBeenCalled();
```

### Mock Observer

```javascript
const mockObserver = {
  update: jest.fn()
};

coordinator.observerSubject.subscribe(mockObserver);

const changeDetails = {
  previous: { bairro: "A" },
  current: { bairro: "B" },
  hasChanged: true
};

coordinator.handleBairroChange(changeDetails);

expect(mockObserver.update).toHaveBeenCalledWith(
  "B",                    // changeData
  "BairroChanged",        // changeType
  null,                   // reserved
  changeDetails           // full details
);
```

### Test Error Handling

```javascript
const throwingObserver = {
  update: jest.fn(() => {
    throw new Error("Test error");
  })
};

const normalObserver = {
  update: jest.fn()
};

coordinator.observerSubject.subscribe(throwingObserver);
coordinator.observerSubject.subscribe(normalObserver);

// Both observers called, error doesn't break system
coordinator.handleBairroChange(changeDetails);

expect(throwingObserver.update).toHaveBeenCalled();
expect(normalObserver.update).toHaveBeenCalled(); // Still called!
```

## Use Cases

### 1. Neighborhood Tracking While Driving

```javascript
// Show neighborhood card when entering new bairro
const bairroObserver = {
  update(changeData, changeType, _, changeDetails) {
    if (changeType === "BairroChanged" && changeDetails.hasChanged) {
      showNeighborhoodCard(changeDetails.current.bairro);
      announceNeighborhood(changeDetails.current.bairro);
    }
  }
};
```

### 2. Municipality Statistics

```javascript
// Update IBGE statistics when entering new municipality
const municipioObserver = {
  update(changeData, changeType, _, changeDetails) {
    if (changeType === "MunicipioChanged" && changeDetails.hasChanged) {
      const municipio = changeDetails.current.municipio;
      const uf = changeDetails.current.siglaUF;
      fetchMunicipalityStatistics(municipio, uf);
    }
  }
};
```

### 3. Speech Synthesis

```javascript
// Announce address changes via speech synthesis
const speechObserver = (position, address, brazilianAddress, changeDetails) => {
  if (changeDetails.hasChanged) {
    const text = `Você está agora em ${brazilianAddress.bairro}, ${brazilianAddress.municipio}`;
    speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }
};

coordinator.observerSubject.subscribeFunctionObserver(speechObserver);
```

### 4. Analytics Tracking

```javascript
// Track when users cross municipality boundaries
const analyticsObserver = {
  update(changeData, changeType, _, changeDetails) {
    if (changeType === "MunicipioChanged" && changeDetails.hasChanged) {
      analytics.track('municipality_boundary_crossed', {
        from: changeDetails.previous.municipio,
        to: changeDetails.current.municipio,
        timestamp: new Date().toISOString()
      });
    }
  }
};
```

## See Also

- [AddressDataExtractor Documentation](../data/ADDRESS_DATA_EXTRACTOR.md)
- [ReverseGeocoder Documentation](./REVERSE_GEOCODER.md)
- [ObserverSubject Documentation](../core/OBSERVER_SUBJECT.md)
- [HTMLHighlightCardsDisplayer Documentation](../html/HTML_HIGHLIGHT_CARDS_DISPLAYER.md)
- [WebGeocodingManager Documentation](../coordination/WEB_GEOCODING_MANAGER.md)

## Change Log

### v0.9.0-alpha
- Initial extraction from `guia.js` in Phase 2 modularization
- Replaced timer-based polling with callback mechanism
- Introduced `setupChangeDetection()` and `removeAllChangeDetection()` methods
- Added `setAddressDataExtractor()` to avoid circular dependencies
- Implemented error handling for observer notifications
- Added DRY principle with `_notifyAddressChangeObservers()` helper
- Enhanced documentation with comprehensive examples

### Design Evolution

**Previous Approach (v0.9.0):**
- Timer-based polling every second
- High CPU overhead
- Delayed change detection
- Scattered timer management

**Current Approach (v0.9.0-alpha):**
- Callback-based change detection
- Zero overhead when idle
- Immediate change notifications
- Centralized callback management
- Better testability and maintainability
