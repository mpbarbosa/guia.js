# ObserverSubject Pattern Documentation - Guia Turístico
**Version:** 0.8.7-alpha  
**Date:** 2026-02-11  
**Author:** Comprehensive analysis of Observer pattern implementation

---

## Table of Contents
1. [Overview](#overview)
2. [Core Implementation](#core-implementation)
3. [Subject Classes](#subject-classes)
4. [Observer Classes](#observer-classes)
5. [Notification Chains](#notification-chains)
6. [Method Reference](#method-reference)
7. [Usage Examples](#usage-examples)

---

## Overview

### Pattern Architecture

The Guia Turístico project implements the Observer pattern using **composition** with the `ObserverSubject` class. This architecture enables decoupled communication between components:

- **Subjects**: Classes that publish events (have `observerSubject` instance)
- **Observers**: Classes that subscribe to events (implement `update()` method)
- **Dual-Role**: Some classes act as both Subject and Observer

### Key Characteristics

- ✅ **Immutable state updates** - Arrays updated via spread/filter
- ✅ **Composition over inheritance** - `observerSubject` member variable
- ✅ **Mixin delegation** - Reusable `withObserver()` pattern
- ✅ **Type safety** - Observer validation with duck typing
- ✅ **Error resilience** - Try/catch in notification loops

### Statistics

- **5 Subject classes** (publish events)
- **14 Observer classes** (subscribe to events)
- **2 Dual-role classes** (both Subject and Observer)
- **4 main notification chains** (position → address → speech → UI)

---

## Core Implementation

### ObserverSubject Class
**File:** `src/core/ObserverSubject.js` (198 lines)

#### Class Definition

```javascript
class ObserverSubject {
    constructor() {
        this.observers = [];
        this.functionObservers = [];
    }
}
```

#### Object Observer Methods

```javascript
/**
 * Subscribes an observer object to receive notifications.
 * Uses immutable pattern - creates new array instead of mutating.
 * 
 * @param {Object} observer - Observer with update() method
 * @returns {void}
 */
subscribe(observer) {
    if (observer) {
        this.observers = [...this.observers, observer];
    }
}

/**
 * Unsubscribes an observer from notifications.
 * Uses immutable pattern - filters to new array.
 * 
 * @param {Object} observer - Observer to remove
 * @returns {void}
 */
unsubscribe(observer) {
    this.observers = this.observers.filter((o) => o !== observer);
}

/**
 * Notifies all subscribed observer objects.
 * Passes this subject as first argument plus any additional args.
 * 
 * @param {...*} args - Arguments to pass to update()
 * @returns {void}
 */
notifyObservers(...args) {
    this.observers.forEach((observer) => {
        if (typeof observer.update === "function") {
            observer.update(...args);
        } else {
            warn("Observer missing update() method:", observer);
        }
    });
}
```

#### Function Observer Methods

```javascript
/**
 * Subscribes a function to receive notifications.
 * Supports functional programming style.
 * 
 * @param {Function} observerFunction - Callback function
 * @returns {void}
 */
subscribeFunction(observerFunction) {
    if (observerFunction) {
        this.functionObservers = [...this.functionObservers, observerFunction];
    }
}

/**
 * Unsubscribes a function from notifications.
 * 
 * @param {Function} observerFunction - Function to remove
 * @returns {void}
 */
unsubscribeFunction(observerFunction) {
    this.functionObservers = this.functionObservers.filter(
        (fn) => fn !== observerFunction
    );
}

/**
 * Notifies all subscribed function observers.
 * 
 * @param {...*} args - Arguments to pass to functions
 * @returns {void}
 */
notifyFunctionObservers(...args) {
    this.functionObservers.forEach((fn) => {
        if (typeof fn === "function") {
            try {
                fn(...args);
            } catch (err) {
                error("Function observer error:", err);
            }
        }
    });
}
```

---

## Subject Classes

Classes that **publish events** by maintaining an `observerSubject` instance.

---

### 1. PositionManager ⭐

**File:** `src/core/PositionManager.js` (543 lines)  
**Role:** Subject + Observer (dual-role)  
**Pattern:** Singleton

#### Subject Behavior

```javascript
// Initialization (line 220)
this.observerSubject = new ObserverSubject();

// Custom notification method (lines 305-307)
notifyObservers(posEvent, data = null, error = null) {
    this.observerSubject.notifyObservers(this, posEvent, data, error);
}

// Mixin delegation (line 493)
Object.assign(PositionManager.prototype, withObserver({ excludeNotify: true }));
// Provides: subscribe(), unsubscribe()
```

#### Observer Behavior

```javascript
// Subscribes to GeolocationService (implicitly via callback)
// Receives position updates from browser geolocation API

/**
 * Observer pattern update method.
 * Called when new position data arrives from GeolocationService.
 * 
 * @param {Object} position - Geolocation position object
 * @returns {void}
 */
update(position) {
    // Validate position data
    if (!position || !position.timestamp) {
        warn("(PositionManager) Invalid position data:", position);
        return;
    }

    // Check accuracy threshold
    if (setupParams.notAcceptedAccuracy && ...) {
        error = { name: "AccuracyError", message: "Accuracy not good enough" };
    }

    // Distance/time validation (20m OR 30s)
    const shouldUpdate = this._shouldUpdatePosition(position);
    
    if (shouldUpdate) {
        // Update internal state
        this.lastPosition = new GeoPosition(position);
        this.tsPosicaoAtual = Date.now();
        
        // Notify observers
        this.notifyObservers(PositionManager.strCurrPosUpdate, position, null);
    }
}
```

#### Events Published

| Event Name | Constant | When Published | Purpose |
|------------|----------|----------------|---------|
| Current Position Update | `PositionManager.strCurrPosUpdate` | ≥50s elapsed OR significant distance change | Triggers full address lookup |
| Immediate Address Update | `PositionManager.strImmediateAddressUpdate` | <50s elapsed, minor position change | Updates without full geocoding |
| Position Not Updated | `PositionManager.strCurrPosNotUpdate` | Validation fails (accuracy, distance) | Notifies validation failure |

#### Notification Signature

```javascript
notifyObservers(
    this,           // PositionManager instance
    posEvent,       // Event type (strCurrPosUpdate, etc.)
    data,           // Position data object (optional)
    error           // Error object (optional)
)
```

#### Subscription Example

```javascript
const positionManager = PositionManager.getInstance();

// Observer with update method
const myObserver = {
    update(positionManager, eventType, data, error) {
        if (eventType === PositionManager.strCurrPosUpdate) {
            console.log('Position updated:', positionManager.lastPosition);
        }
    }
};

positionManager.subscribe(myObserver);
```

---

### 2. ReverseGeocoder ⭐

**File:** `src/services/ReverseGeocoder.js` (512 lines)  
**Role:** Subject + Observer (dual-role)  
**Pattern:** Multi-instance (one per coordinate pair)

#### Subject Behavior

```javascript
// Initialization (line 113)
this.observerSubject = new ObserverSubject();

// Custom notification method (lines 139-142)
notifyObservers(...args) {
    log("(ReverseGeocoder) Notifying observers with args:", args);
    this.observerSubject.notifyObservers(...args);
}

// Mixin delegation (line 500)
Object.assign(ReverseGeocoder.prototype, withObserver({ excludeNotify: true }));
// Provides: subscribe(), unsubscribe()
```

#### Observer Behavior

```javascript
/**
 * Observer pattern update method.
 * Called when PositionManager notifies of position changes.
 * 
 * @param {PositionManager} positionManager - Source of position data
 * @param {string} posEvent - Event type
 * @param {Object} loading - Loading state
 * @param {Object} error - Error information
 * @returns {void}
 */
update(positionManager, posEvent, loading, error) {
    // Validate input
    if (!positionManager || !positionManager.lastPosition) {
        warn("(ReverseGeocoder) Invalid PositionManager or no last position.");
        return;
    }

    // Filter events - only process position updates
    if (posEvent !== PositionManager.strCurrPosUpdate && 
        posEvent !== PositionManager.strImmediateAddressUpdate) {
        return;
    }

    // Extract coordinates
    const { latitude, longitude } = positionManager.lastPosition;
    
    // Trigger async reverse geocoding
    this.reverseGeocode(latitude, longitude)
        .then(() => {
            log("(ReverseGeocoder) Reverse geocode successful");
        })
        .catch((err) => {
            error("(ReverseGeocoder) Reverse geocode failed:", err);
        });
}
```

#### Events Published

| Event Name | Constant | When Published | Purpose |
|------------|----------|----------------|---------|
| Address Fetched | `ADDRESS_FETCHED_EVENT` | After successful reverse geocoding | Notifies all address displayers with new data |

**Constant Definition** (`src/config/defaults.js`):
```javascript
export const ADDRESS_FETCHED_EVENT = 'address-fetched';
```

#### Notification Signature

```javascript
notifyObservers(
    currentAddress,         // Raw geocoding data from Nominatim API
    enderecoPadronizado,    // BrazilianStandardAddress instance
    ADDRESS_FETCHED_EVENT,  // posEvent constant
    false,                  // loading state (always false after fetch)
    null                    // error (null on success)
)
```

#### Notification Code (lines 241-247)

```javascript
// Successful geocoding notification
this.notifyObservers(
    this.currentAddress,
    this.enderecoPadronizado,
    ADDRESS_FETCHED_EVENT,
    false,  // loading complete
    null    // no error
);
```

#### Subscription Example

```javascript
const reverseGeocoder = new ReverseGeocoder(-23.550520, -46.633309);

const addressDisplayer = {
    update(addressData, standardizedAddress, eventType, loading, error) {
        if (eventType === ADDRESS_FETCHED_EVENT) {
            console.log('Address:', standardizedAddress.municipioCompleto());
            console.log('Neighborhood:', standardizedAddress.bairro);
        }
    }
};

reverseGeocoder.subscribe(addressDisplayer);
```

---

### 3. WebGeocodingManager

**File:** `src/coordination/WebGeocodingManager.js` (847 lines)  
**Role:** Subject only  
**Pattern:** Main application coordinator

#### Subject Behavior

```javascript
// Initialization (line 327)
this.observerSubject = new ObserverSubject();

// Mixin delegation (line 837)
Object.assign(WebGeocodingManager.prototype, withObserver());
// Provides: subscribe(), unsubscribe(), notifyObservers()
```

#### Events Published

Publishes various geocoding workflow events coordinating the entire application lifecycle.

#### Method Reference

| Method | Parameters | Description |
|--------|------------|-------------|
| `subscribe(observer)` | `observer: Object` | Add observer to notifications |
| `unsubscribe(observer)` | `observer: Object` | Remove observer |
| `notifyObservers(...args)` | `...args: any` | Notify all observers |

---

### 4. AddressCache

**File:** `src/data/AddressCache.js` (1171 lines)  
**Role:** Subject only  
**Pattern:** Singleton with composition architecture (v0.8.7-alpha)

#### Subject Behavior

```javascript
// Initialization (line 78)
this.observerSubject = new ObserverSubject();

// Composition architecture
this.changeDetector = new AddressChangeDetector();
this.callbackRegistry = new CallbackRegistry();
this.dataStore = new AddressDataStore();
```

#### Events Published

- **Address field changes**: municipio, bairro, logradouro
- **Cache operations**: store, retrieve, eviction (LRU)
- **Change detection**: Signature-based field comparison

#### Notification Methods

```javascript
// Via CallbackRegistry composition
registerCallback(fieldName, callback) {
    this.callbackRegistry.register(fieldName, callback);
}

// Via ObserverSubject
subscribe(observer) {
    this.observerSubject.subscribe(observer);
}

// Change notification (internal)
_notifyFieldChange(fieldName, currentValue, previousValue) {
    // Executes registered callbacks
    const callbacks = this.callbackRegistry.get(fieldName);
    callbacks.forEach(callback => {
        try {
            callback(currentValue, previousValue, fieldName);
        } catch (error) {
            error("Callback execution error:", error);
        }
    });
}
```

#### Subscription Example

```javascript
const addressCache = AddressCache.getInstance();

// Register field-specific callback
addressCache.registerCallback('bairro', (current, previous) => {
    console.log(`Bairro changed: ${previous} → ${current}`);
});

// Register generic observer
const observer = {
    update(addressData, eventDetails) {
        console.log('Address cache updated:', eventDetails);
    }
};
addressCache.subscribe(observer);
```

---

### 5. SpeechQueue

**File:** `src/speech/SpeechQueue.js` (511 lines)  
**Role:** Subject only  
**Pattern:** Priority queue with dual notification

#### Subject Behavior

```javascript
// Initialization (line 113)
this.observerSubject = new ObserverSubject();

// Custom subscribe with validation (lines 217-228)
subscribe(observer) {
    if (observer == null) {
        warn("(SpeechQueue) Attempted to subscribe a null observer.");
        return;
    }
    if (typeof observer.update !== 'function') {
        throw new TypeError("Observer must have an update() method");
    }
    this.observerSubject.subscribe(observer);
}

// Object observer notification (lines 238-240)
notifyObservers() {
    this.observerSubject.notifyObservers(this);
}

// Function observer subscription (lines 256-267)
subscribeFunction(observerFunction) {
    if (observerFunction == null) {
        warn("(SpeechQueue) Attempted to subscribe a null observer function.");
        return;
    }
    if (typeof observerFunction !== 'function') {
        throw new TypeError("Observer must be a function");
    }
    this.observerSubject.subscribeFunction(observerFunction);
}

// Function observer notification (lines 291-299)
notifyFunctionObservers() {
    this.observerSubject.functionObservers.forEach((fn) => {
        try {
            fn(this);
        } catch (err) {
            error("(SpeechQueue) Error in function observer:", err);
        }
    });
}

// Mixin partial delegation (line 499)
Object.assign(SpeechQueue.prototype, { 
    unsubscribe: mixinMethods.unsubscribe 
});
```

#### Events Published

| Operation | When Notified | Notification Type |
|-----------|---------------|-------------------|
| `enqueue()` | After adding item to queue | Object + Function observers |
| `dequeue()` | After removing item from queue | Object + Function observers |
| `clear()` | After clearing all items | Object + Function observers |

#### Notification Signature

```javascript
// Object observers
update(queue) // receives SpeechQueue instance

// Function observers
(queue) => { ... } // callback with SpeechQueue instance
```

#### Subscription Example

```javascript
const speechQueue = new SpeechQueue();

// Object observer
const queueMonitor = {
    update(queue) {
        console.log(`Queue size: ${queue.size()}`);
        console.log(`Has items: ${queue.hasItems()}`);
    }
};
speechQueue.subscribe(queueMonitor);

// Function observer
speechQueue.subscribeFunction((queue) => {
    if (queue.size() > 5) {
        console.warn('Speech queue is getting large!');
    }
});

// Trigger notifications
speechQueue.enqueue("Hello world", 1); // Notifies both observers
```

---

## Observer Classes

Classes that **subscribe to events** by implementing an `update()` method.

---

### Position Observers

Subscribe to **PositionManager** for position change notifications.

---

#### 1. HTMLPositionDisplayer

**File:** `src/html/HTMLPositionDisplayer.js` (303 lines)  
**Subscribes To:** PositionManager

```javascript
/**
 * Observer pattern update method.
 * Called when position changes occur.
 * 
 * @param {PositionManager} positionManager - Source of position data
 * @param {string} posEvent - Event type
 * @param {Object} loading - Loading state
 * @param {Object} error - Error information
 * @returns {void}
 */
update(positionManager, posEvent, loading, error) {
    // Input validation
    if (!positionManager) {
        warn("(HTMLPositionDisplayer) No PositionManager provided");
        return;
    }

    // Handle loading state
    if (loading) {
        this.showLoadingState();
        return;
    }

    // Handle error state
    if (error) {
        this.showError(error.message);
        return;
    }

    // Extract position data
    const position = positionManager.lastPosition;
    if (!position) {
        return;
    }

    // Display coordinates
    const { latitude, longitude, accuracy } = position;
    this.displayCoordinates(latitude, longitude, accuracy);
    
    // Update Google Maps link
    this.updateMapLink(latitude, longitude);
}
```

**Events Handled:**
- `PositionManager.strCurrPosUpdate`
- `PositionManager.strImmediateAddressUpdate`

**Display Elements:**
- Latitude/longitude coordinates
- Accuracy information
- Google Maps link
- Street View link (if applicable)

---

#### 2. HtmlText

**File:** `src/html/HtmlText.js` (152 lines)  
**Subscribes To:** PositionManager

```javascript
/**
 * Observer pattern update method.
 * Generic text display for position data.
 * 
 * @param {PositionManager} positionManager - Source of position data
 * @param {string} posEvent - Event type
 * @param {Object} loading - Loading state
 * @param {Object} error - Error information
 * @returns {void}
 */
update(positionManager, posEvent, loading, error) {
    if (!this.element) return;

    if (loading) {
        this.element.textContent = "Carregando...";
        return;
    }

    if (error) {
        this.element.textContent = `Erro: ${error.message}`;
        return;
    }

    if (positionManager && positionManager.lastPosition) {
        const { latitude, longitude } = positionManager.lastPosition;
        this.element.textContent = 
            `Posição: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
}
```

---

#### 3. Chronometer

**File:** `src/timing/Chronometer.js` (356 lines)  
**Subscribes To:** PositionManager

```javascript
/**
 * Observer pattern update method.
 * Resets/updates timer on position changes.
 * 
 * @param {PositionManager} positionManager - Source of position data
 * @param {string} eventType - Event type
 * @param {Object} data - Additional event data
 * @param {Object} error - Error information
 * @returns {void}
 */
update(positionManager, eventType, data, error) {
    // Only respond to actual position updates
    if (eventType === PositionManager.strCurrPosUpdate ||
        eventType === PositionManager.strImmediateAddressUpdate) {
        
        // Reset timer for new position
        this.reset();
        this.start();
        
        log("(Chronometer) Timer reset on position update");
    }
}
```

**Features:**
- Timer reset on position updates
- Elapsed time tracking
- Observer pattern for timer events
- Integration with position management

---

### Address Observers

Subscribe to **ReverseGeocoder** for address data notifications.

---

#### 4. HTMLAddressDisplayer ✅

**File:** `src/html/HTMLAddressDisplayer.js` (386 lines)  
**Subscribes To:** ReverseGeocoder

```javascript
/**
 * Observer pattern update method.
 * Called when address changes occur.
 * 
 * @param {Object} addressData - Raw geocoding data from Nominatim
 * @param {BrazilianStandardAddress} enderecoPadronizado - Standardized address
 * @param {string} posEvent - Event type (ADDRESS_FETCHED_EVENT)
 * @param {boolean} loading - Loading state
 * @param {Object} error - Error information
 * @returns {void}
 */
update(addressData, enderecoPadronizado, posEvent, loading, error) {
    // Input validation
    if (!this.element) {
        warn("(HTMLAddressDisplayer) No target element");
        return;
    }

    // Handle loading state
    if (loading) {
        this.element.innerHTML = '<p class="loading">Carregando endereço...</p>';
        return;
    }

    // Handle error state
    if (error) {
        this.element.innerHTML = 
            `<p class="error">Erro ao carregar endereço: ${error.message}</p>`;
        return;
    }

    // Only process ADDRESS_FETCHED_EVENT
    if (posEvent !== ADDRESS_FETCHED_EVENT) {
        return;
    }

    // Render address HTML
    const html = this.renderAddressHtml(addressData, enderecoPadronizado);
    this.element.innerHTML = html;

    // Update standardized address display (if configured)
    if (this.enderecoPadronizadoDisplay && enderecoPadronizado) {
        const standardized = enderecoPadronizado.toString();
        this.enderecoPadronizadoDisplay.textContent = standardized;
    }

    log("(HTMLAddressDisplayer) Address display updated");
}
```

**Display Components:**
- Full display name (from Nominatim)
- Standardized Brazilian address format
- Detailed attribute breakdown (HTML5 details/summary)
- All address components (road, city, state, etc.)

---

#### 5. HTMLHighlightCardsDisplayer

**File:** `src/html/HTMLHighlightCardsDisplayer.js` (309 lines)  
**Subscribes To:** ReverseGeocoder

```javascript
/**
 * Observer pattern update method.
 * Updates municipality and neighborhood highlight cards.
 * 
 * @param {Object} addressData - Raw geocoding data
 * @param {BrazilianStandardAddress} enderecoPadronizado - Standardized address
 * @returns {void}
 */
update(addressData, enderecoPadronizado) {
    if (!enderecoPadronizado) {
        this.showEmptyState();
        return;
    }

    // Update municipality card
    const municipio = enderecoPadronizado.municipioCompleto(); // e.g., "Recife, PE"
    this.updateMunicipioCard(municipio);

    // Update metropolitan region (v0.8.7-alpha)
    const regiaoMetro = enderecoPadronizado.regiaoMetropolitanaFormatada();
    this.updateRegiaoMetropolitanaCard(regiaoMetro);

    // Update neighborhood card
    const bairro = enderecoPadronizado.bairro;
    this.updateBairroCard(bairro);

    // Update street card
    const logradouro = enderecoPadronizado.logradouro;
    this.updateLogradouroCard(logradouro);
}
```

**Display Cards:**
- **Município**: City with state abbreviation (e.g., "São Paulo, SP")
- **Região Metropolitana**: Metropolitan region (e.g., "Região Metropolitana de Recife")
- **Bairro**: Neighborhood name
- **Logradouro**: Street name with number

---

#### 6. HTMLReferencePlaceDisplayer

**File:** `src/html/HTMLReferencePlaceDisplayer.js` (302 lines)  
**Subscribes To:** ReverseGeocoder

```javascript
/**
 * Observer pattern update method.
 * Displays nearby reference places (landmarks).
 * 
 * @param {Object} addressData - Raw geocoding data
 * @param {BrazilianStandardAddress} brazilianStandardAddress - Standardized address
 * @param {string} posEvent - Event type
 * @param {boolean} loading - Loading state
 * @param {Object} error - Error information
 * @returns {void}
 */
update(addressData, brazilianStandardAddress, posEvent, loading, error) {
    if (!this.element) return;

    if (loading) {
        this.element.textContent = "Buscando local de referência...";
        return;
    }

    if (error) {
        this.element.textContent = "Local de referência indisponível";
        return;
    }

    // Extract reference place from address data
    const referencePlace = this._extractReferencePlace(addressData);
    
    if (referencePlace) {
        this.displayReferencePlace(referencePlace);
    } else {
        this.element.textContent = "Nenhum local de referência próximo";
    }
}

_extractReferencePlace(addressData) {
    // Check for shop, amenity, railway, building, place
    const categories = ['shop', 'amenity', 'railway', 'building', 'place'];
    
    for (const category of categories) {
        if (addressData[category]) {
            return new ReferencePlace(addressData);
        }
    }
    
    return null;
}
```

**Reference Place Types:**
- Shopping centers
- Parks and recreational areas
- Railway stations
- Notable buildings
- Points of interest

---

#### 7. HTMLSidraDisplayer

**File:** `src/html/HTMLSidraDisplayer.js` (258 lines)  
**Subscribes To:** ReverseGeocoder

```javascript
/**
 * Observer pattern update method.
 * Fetches and displays IBGE SIDRA demographic data.
 * 
 * @param {Object} addressData - Raw geocoding data
 * @param {BrazilianStandardAddress} enderecoPadronizado - Standardized address
 * @param {string} posEvent - Event type
 * @param {boolean} loading - Loading state
 * @param {Object} error - Error information
 * @returns {void}
 */
update(addressData, enderecoPadronizado, posEvent, loading, error) {
    if (!this.element) return;

    if (loading) {
        this.element.innerHTML = '<p class="loading">Carregando dados do IBGE...</p>';
        return;
    }

    if (error) {
        this.element.innerHTML = '<p class="error">Dados do IBGE indisponíveis</p>';
        return;
    }

    // Only process ADDRESS_FETCHED_EVENT
    if (posEvent !== ADDRESS_FETCHED_EVENT) {
        return;
    }

    // Extract municipality for SIDRA lookup
    if (!enderecoPadronizado || !enderecoPadronizado.municipio) {
        this.element.textContent = "Município não identificado";
        return;
    }

    const municipio = enderecoPadronizado.municipio;
    const uf = enderecoPadronizado.estado;

    // Fetch SIDRA data (population, demographics)
    this.fetchSidraData(municipio, uf)
        .then(data => this.displaySidraData(data))
        .catch(err => {
            error("(HTMLSidraDisplayer) SIDRA fetch failed:", err);
            this.element.innerHTML = '<p class="error">Erro ao buscar estatísticas</p>';
        });
}
```

**SIDRA Data Displayed:**
- Population estimates (most recent)
- Municipality code (IBGE)
- Data source and reference year
- Formatted with Brazilian Portuguese locale

---

#### 8. HtmlSpeechSynthesisDisplayer

**File:** `src/html/HtmlSpeechSynthesisDisplayer.js` (779 lines)  
**Subscribes To:** ReverseGeocoder, AddressCache

```javascript
/**
 * Observer pattern update method.
 * Handles address changes and triggers speech synthesis.
 * 
 * Flexible signature supporting multiple notification contexts.
 * 
 * @param {Object} currentAddress - Current address data
 * @param {string|Object} enderecoPadronizadoOrEvent - Standardized address or event
 * @param {string} posEvent - Position event type
 * @param {Object} loadingOrChangeDetails - Loading state or change details
 * @param {Object} error - Error information
 * @returns {void}
 */
update(currentAddress, enderecoPadronizadoOrEvent, posEvent, loadingOrChangeDetails, error) {
    // Context detection: From ReverseGeocoder or AddressCache?
    const isFromReverseGeocoder = (posEvent === ADDRESS_FETCHED_EVENT);
    const isFromAddressCache = (typeof loadingOrChangeDetails === 'object' && 
                                loadingOrChangeDetails?.fieldName);

    if (isFromReverseGeocoder) {
        // Initial address load - lower priority
        this._handleAddressFetch(currentAddress, enderecoPadronizadoOrEvent);
    } 
    else if (isFromAddressCache) {
        // Field change - prioritized speech
        const changeDetails = loadingOrChangeDetails;
        this._handleFieldChange(
            changeDetails.fieldName,
            changeDetails.newValue,
            changeDetails.oldValue
        );
    }
}

_handleFieldChange(fieldName, newValue, oldValue) {
    // Priority mapping
    const priorities = {
        'municipio': 3,      // Highest priority
        'bairro': 2,         // Medium priority
        'logradouro': 1      // Lower priority
    };

    const priority = priorities[fieldName] || 0;
    
    // Generate Portuguese speech text
    const speechText = this._generateSpeechText(fieldName, newValue);
    
    // Enqueue to SpeechQueue
    if (this.speechQueue && speechText) {
        this.speechQueue.enqueue(speechText, priority);
        log(`(HtmlSpeechSynthesisDisplayer) Speech queued: ${speechText} (priority ${priority})`);
    }
}

_generateSpeechText(fieldName, value) {
    const templates = {
        'municipio': `Você entrou no município de ${value}`,
        'bairro': `Você entrou no bairro ${value}`,
        'logradouro': `Você está em ${value}`
    };
    
    return templates[fieldName] || null;
}
```

**Speech Priorities:**
1. **Priority 3**: Municipality changes (highest)
2. **Priority 2**: Neighborhood changes (medium)
3. **Priority 1**: Street changes (lower)

**Integration:**
- Subscribes to ReverseGeocoder for initial address
- Subscribes to AddressCache for field changes
- Enqueues speech to SpeechQueue with priorities

---

### Internal Observers

---

#### 9. AddressDataStore

**File:** `src/data/AddressDataStore.js** (253 lines)  
**Subscribes To:** Internal (AddressCache composition)  
**Role:** Observer in composition architecture

```javascript
/**
 * Internal update method for address data storage.
 * Part of AddressCache's composition architecture.
 * 
 * @param {BrazilianStandardAddress} newAddress - New standardized address
 * @param {Object} newRawData - New raw geocoding data
 * @returns {void}
 */
update(newAddress, newRawData) {
    // Store previous state for change detection
    this._previousAddress = this._currentAddress;
    this._previousRawData = this._currentRawData;

    // Update current state
    this._currentAddress = newAddress;
    this._currentRawData = newRawData;

    // Update cache storage
    const cacheKey = AddressDataStore.generateCacheKey(newRawData);
    this._lruCache.set(cacheKey, { address: newAddress, raw: newRawData });

    log("(AddressDataStore) Address data updated");
}
```

---

## Notification Chains

### Complete Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NOTIFICATION CHAINS                           │
│                     Guia Turístico v0.8.7-alpha                     │
└─────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════
                         CHAIN 1: POSITION UPDATES
═══════════════════════════════════════════════════════════════════════

┌─────────────────────┐
│ Browser Geolocation │
│    API (native)     │
└──────────┬──────────┘
           │ navigator.geolocation.watchPosition()
           ↓
┌─────────────────────┐
│ GeolocationService  │
│  (service wrapper)  │
└──────────┬──────────┘
           │ position callback
           ↓
┌──────────────────────────────────────────────────────────────────────┐
│ PositionManager.update(position) ⭐ SUBJECT                          │
│                                                                       │
│ 1. Validates position data (accuracy, timestamp)                     │
│ 2. Checks distance threshold (20m) OR time threshold (30s)          │
│ 3. Updates lastPosition if valid                                     │
│ 4. Determines event type:                                            │
│    • strCurrPosUpdate (≥50s elapsed)                                │
│    • strImmediateAddressUpdate (<50s elapsed)                       │
│ 5. Calls: notifyObservers(this, eventType, position, error)        │
└──────────┬───────────────────────────────────────────────────────────┘
           │
           ├─→ notifyObservers(this, PositionManager.strCurrPosUpdate, ...)
           │
           ├────────────────────────────────────────────────────────────┐
           │                                                             │
           ↓                                                             ↓
┌─────────────────────┐                                   ┌──────────────────────┐
│ HTMLPositionDisplayer│                                   │ Chronometer.update() │
│ .update()           │                                   │                      │
├─────────────────────┤                                   ├──────────────────────┤
│ • Displays lat/lon  │                                   │ • Resets timer       │
│ • Shows accuracy    │                                   │ • Starts elapsed     │
│ • Google Maps link  │                                   │   time tracking      │
│ • Street View link  │                                   │ • Notifies observers │
└─────────────────────┘                                   └──────────────────────┘
           │
           ↓
┌─────────────────────┐
│ HtmlText.update()   │
├─────────────────────┤
│ • Generic position  │
│   text display      │
│ • Coordinates       │
└─────────────────────┘
           │
           ↓
┌──────────────────────────────────────────────────────────────────────┐
│ ReverseGeocoder.update() ⭐ OBSERVER → SUBJECT                       │
│                                                                       │
│ 1. Receives: (positionManager, strCurrPosUpdate, data, error)       │
│ 2. Extracts: latitude, longitude                                     │
│ 3. Calls: reverseGeocode(lat, lon) [ASYNC]                          │
│ 4. Fetches from: Nominatim OpenStreetMap API                         │
│ 5. Creates: BrazilianStandardAddress                                │
│ 6. Calls: notifyObservers(address, standardized, ADDRESS_FETCHED...) │
└──────────┬───────────────────────────────────────────────────────────┘
           │
           │ notifyObservers(addressData, standardized, ADDRESS_FETCHED_EVENT, ...)
           │
           └────┬──────────┬─────────────┬──────────────┬──────────────┐
                │          │             │              │              │
                ↓          ↓             ↓              ↓              ↓

═══════════════════════════════════════════════════════════════════════
                         CHAIN 2: ADDRESS DISPLAY
═══════════════════════════════════════════════════════════════════════

┌──────────────────┐  ┌─────────────────┐  ┌───────────────────┐
│HTMLAddressDisplayer│  │HTMLHighlightCards│  │HTMLReferencePlace │
│.update() ✅       │  │Displayer.update()│  │Displayer.update() │
├──────────────────┤  ├─────────────────┤  ├───────────────────┤
│• Full address    │  │• Município card │  │• Nearby landmarks │
│• Details/summary │  │• Região Metro   │  │• Shopping centers │
│• All components  │  │• Bairro card    │  │• Railway stations │
│• Standardized    │  │• Logradouro     │  │• Notable places   │
└──────────────────┘  └─────────────────┘  └───────────────────┘

┌────────────────────┐  ┌─────────────────────────────────┐
│HTMLSidraDisplayer  │  │HtmlSpeechSynthesisDisplayer     │
│.update()           │  │.update()                        │
├────────────────────┤  ├─────────────────────────────────┤
│• Fetches SIDRA API │  │• Initial address announcement   │
│• Population data   │  │• Enqueues to SpeechQueue       │
│• IBGE statistics   │  │  (lower priority for first load)│
│• Formatted display │  │• Subscribes to AddressCache    │
└────────────────────┘  └──────────┬──────────────────────┘
                                   │
                                   │ Also subscribes to:
                                   ↓

═══════════════════════════════════════════════════════════════════════
                    CHAIN 3: ADDRESS CHANGE DETECTION
═══════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────┐
│ AddressCache ⭐ SUBJECT                                               │
│                                                                       │
│ Composition Architecture (v0.8.7-alpha):                             │
│ ┌──────────────────┐  ┌─────────────────┐  ┌──────────────────┐   │
│ │AddressChangeDetector│  │CallbackRegistry │  │AddressDataStore │   │
│ │                  │  │                 │  │                  │   │
│ │• hasFieldChanged()│  │• register()     │  │• update()        │   │
│ │• getSignature()  │  │• get()          │  │• getCurrent()    │   │
│ │• trackChanges()  │  │• unregister()   │  │• getPrevious()   │   │
│ └──────────────────┘  └─────────────────┘  └──────────────────┘   │
│                                                                       │
│ 1. Receives new address from ReverseGeocoder                         │
│ 2. Compares with previous address (signature-based)                 │
│ 3. Detects field changes: municipio, bairro, logradouro             │
│ 4. Executes registered callbacks for changed fields                  │
│ 5. Notifies observers via observerSubject                            │
└──────────┬───────────────────────────────────────────────────────────┘
           │
           │ Callbacks for field changes
           ↓
┌──────────────────────────────────────────────────────────────────────┐
│ HtmlSpeechSynthesisDisplayer.update()                               │
│ (via AddressCache callback registration)                             │
│                                                                       │
│ Priority-based speech synthesis:                                     │
│ ┌─────────────────┬──────────┬──────────────────────────┐          │
│ │ Field Changed   │ Priority │ Speech Text               │          │
│ ├─────────────────┼──────────┼──────────────────────────┤          │
│ │ municipio       │    3     │ "Você entrou no município │          │
│ │                 │          │  de [nome]"               │          │
│ ├─────────────────┼──────────┼──────────────────────────┤          │
│ │ bairro          │    2     │ "Você entrou no bairro    │          │
│ │                 │          │  [nome]"                  │          │
│ ├─────────────────┼──────────┼──────────────────────────┤          │
│ │ logradouro      │    1     │ "Você está em [rua]"      │          │
│ └─────────────────┴──────────┴──────────────────────────┘          │
│                                                                       │
│ Enqueues speech items to SpeechQueue                                │
└──────────┬───────────────────────────────────────────────────────────┘
           │
           ↓

═══════════════════════════════════════════════════════════════════════
                       CHAIN 4: SPEECH SYNTHESIS
═══════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────┐
│ SpeechQueue ⭐ SUBJECT                                                │
│                                                                       │
│ Priority-based queue management:                                     │
│ • High priority (3): Municipality changes                            │
│ • Medium priority (2): Neighborhood changes                          │
│ • Low priority (1): Street changes                                   │
│                                                                       │
│ Operations that trigger notifications:                               │
│ 1. enqueue(text, priority) → notifyObservers() + notifyFunction()  │
│ 2. dequeue() → notifyObservers() + notifyFunctionObservers()       │
│ 3. clear() → notifyObservers() + notifyFunctionObservers()         │
└──────────┬───────────────────────────────────────────────────────────┘
           │
           ├─→ notifyObservers(this) [Object observers]
           │
           └─→ notifyFunctionObservers(this) [Function observers]
                │
                ↓
┌──────────────────────────────────────────────────────────────────────┐
│ SpeechSynthesisManager                                               │
│ (subscribes as function observer)                                     │
│                                                                       │
│ 1. Receives queue state change notification                          │
│ 2. Checks if queue has items: queue.hasItems()                      │
│ 3. Processes highest priority item: queue.peek()                    │
│ 4. Dequeues and synthesizes: queue.dequeue()                        │
│ 5. Uses Web Speech API: window.speechSynthesis.speak()             │
│ 6. Brazilian Portuguese voice selection (pt-BR preferred)            │
└──────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════
                         COMPLETE FLOW SUMMARY
═══════════════════════════════════════════════════════════════════════

Browser Geolocation
    ↓
GeolocationService
    ↓
PositionManager ────────────→ HTMLPositionDisplayer
    │                          Chronometer
    │                          HtmlText
    ↓
ReverseGeocoder ────────────→ HTMLAddressDisplayer ✅
    │                          HTMLHighlightCardsDisplayer
    │                          HTMLReferencePlaceDisplayer
    │                          HTMLSidraDisplayer
    │                          HtmlSpeechSynthesisDisplayer (initial)
    ↓
AddressCache ───────────────→ HtmlSpeechSynthesisDisplayer (changes)
    │
    ↓
SpeechQueue ────────────────→ SpeechSynthesisManager
    │
    ↓
Web Speech API (browser native)

═══════════════════════════════════════════════════════════════════════
```

---

## Method Reference

### Subject Methods

All Subject classes provide these methods (via composition or mixin):

#### subscribe(observer)

```javascript
/**
 * Subscribes an observer to receive notifications.
 * 
 * @param {Object} observer - Observer object with update() method
 * @returns {void}
 * @throws {TypeError} If observer doesn't have update() method (SpeechQueue only)
 * 
 * @example
 * const myObserver = {
 *     update(subject, ...args) {
 *         console.log('Notified:', args);
 *     }
 * };
 * subject.subscribe(myObserver);
 */
```

#### unsubscribe(observer)

```javascript
/**
 * Unsubscribes an observer from notifications.
 * 
 * @param {Object} observer - Observer to remove
 * @returns {void}
 * 
 * @example
 * subject.unsubscribe(myObserver);
 */
```

#### notifyObservers(...args)

```javascript
/**
 * Notifies all subscribed observers.
 * Passes subject as first argument, plus any additional arguments.
 * 
 * @param {...*} args - Arguments to pass to observers
 * @returns {void}
 * 
 * @example
 * // PositionManager
 * this.notifyObservers(this, 'strCurrPosUpdate', positionData, null);
 * 
 * // ReverseGeocoder
 * this.notifyObservers(addressData, standardized, ADDRESS_FETCHED_EVENT, false, null);
 */
```

### Observer Method

All Observer classes must implement:

#### update(...args)

```javascript
/**
 * Observer pattern update method.
 * Called when subject notifies of state changes.
 * 
 * Signature varies by Subject:
 * 
 * From PositionManager:
 * @param {PositionManager} positionManager - Source
 * @param {string} posEvent - Event type
 * @param {Object} data - Position data
 * @param {Object} error - Error if any
 * 
 * From ReverseGeocoder:
 * @param {Object} addressData - Raw geocoding data
 * @param {BrazilianStandardAddress} enderecoPadronizado - Standardized address
 * @param {string} posEvent - Event type (ADDRESS_FETCHED_EVENT)
 * @param {boolean} loading - Loading state
 * @param {Object} error - Error if any
 * 
 * From SpeechQueue:
 * @param {SpeechQueue} queue - Queue instance
 * 
 * @returns {void}
 */
```

---

## Usage Examples

### Example 1: Position Observer

```javascript
// Create position observer
class MyPositionObserver {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
    }

    update(positionManager, eventType, data, error) {
        if (error) {
            this.element.textContent = `Error: ${error.message}`;
            return;
        }

        if (eventType === PositionManager.strCurrPosUpdate) {
            const { latitude, longitude } = positionManager.lastPosition;
            this.element.textContent = 
                `New position: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
    }
}

// Subscribe to position updates
const observer = new MyPositionObserver('position-display');
const positionManager = PositionManager.getInstance();
positionManager.subscribe(observer);
```

### Example 2: Address Observer

```javascript
// Create address observer
const addressLogger = {
    update(addressData, enderecoPadronizado, eventType, loading, error) {
        if (loading) {
            console.log('Loading address...');
            return;
        }

        if (error) {
            console.error('Address error:', error);
            return;
        }

        if (eventType === ADDRESS_FETCHED_EVENT) {
            console.log('Municipality:', enderecoPadronizado.municipioCompleto());
            console.log('Neighborhood:', enderecoPadronizado.bairro);
            console.log('Street:', enderecoPadronizado.logradouro);
        }
    }
};

// Subscribe to address updates
const reverseGeocoder = new ReverseGeocoder(-23.550520, -46.633309);
reverseGeocoder.subscribe(addressLogger);

// Subscribe reverse geocoder to position manager
const positionManager = PositionManager.getInstance();
positionManager.subscribe(reverseGeocoder);
```

### Example 3: Address Change Detection

```javascript
// Register callback for specific field changes
const addressCache = AddressCache.getInstance();

// Monitor neighborhood changes
addressCache.registerCallback('bairro', (currentValue, previousValue, fieldName) => {
    console.log(`Neighborhood changed from "${previousValue}" to "${currentValue}"`);
    
    // Trigger custom action
    showNotification(`You entered ${currentValue}`);
});

// Monitor municipality changes
addressCache.registerCallback('municipio', (currentValue, previousValue) => {
    console.log(`Municipality: ${previousValue} → ${currentValue}`);
    
    // Update UI
    updateMunicipalityBadge(currentValue);
});
```

### Example 4: Speech Queue Observers

```javascript
const speechQueue = new SpeechQueue();

// Object observer
const queueMonitor = {
    update(queue) {
        const size = queue.size();
        console.log(`Queue size: ${size}`);
        
        if (queue.hasItems()) {
            const nextItem = queue.peek();
            console.log(`Next speech: "${nextItem.text}" (priority ${nextItem.priority})`);
        }
    }
};

// Function observer
const queueWarning = (queue) => {
    if (queue.size() > 5) {
        console.warn('Queue is getting large! Consider adjusting priorities.');
    }
};

// Subscribe both
speechQueue.subscribe(queueMonitor);
speechQueue.subscribeFunction(queueWarning);

// Trigger notifications
speechQueue.enqueue("Welcome message", 1);           // Notifies both
speechQueue.enqueue("Municipality changed", 3);      // Notifies both
speechQueue.enqueue("Street name announced", 1);     // Notifies both
```

### Example 5: Complete Chain Setup

```javascript
// Full observer pattern chain setup
async function setupGeolocationChain() {
    // 1. Get singletons
    const positionManager = PositionManager.getInstance();
    const addressCache = AddressCache.getInstance();
    
    // 2. Create displayers
    const positionDisplayer = new HTMLPositionDisplayer(
        document.getElementById('coordinates')
    );
    
    const addressDisplayer = new HTMLAddressDisplayer(
        document.getElementById('address-details'),
        document.getElementById('standardized-address')
    );
    
    const highlightCards = new HTMLHighlightCardsDisplayer();
    
    const sidraDisplayer = new HTMLSidraDisplayer(
        document.getElementById('sidra-data')
    );
    
    // 3. Create speech synthesis
    const speechQueue = new SpeechQueue();
    const speechSynthesisDisplayer = new HtmlSpeechSynthesisDisplayer(speechQueue);
    
    // 4. Create reverse geocoder
    const reverseGeocoder = new ReverseGeocoder(0, 0); // Initial coords
    
    // 5. Wire position observers
    positionManager.subscribe(positionDisplayer);
    positionManager.subscribe(reverseGeocoder);
    
    // 6. Wire address observers
    reverseGeocoder.subscribe(addressDisplayer);
    reverseGeocoder.subscribe(highlightCards);
    reverseGeocoder.subscribe(sidraDisplayer);
    reverseGeocoder.subscribe(speechSynthesisDisplayer);
    
    // 7. Wire address change observers
    addressCache.registerCallback('bairro', (current, previous) => {
        speechSynthesisDisplayer.handleBairroChange(current, previous);
    });
    
    addressCache.registerCallback('municipio', (current, previous) => {
        speechSynthesisDisplayer.handleMunicipioChange(current, previous);
    });
    
    // 8. Wire speech queue observers
    const speechManager = new SpeechSynthesisManager();
    speechQueue.subscribeFunction((queue) => {
        if (queue.hasItems()) {
            speechManager.processQueue(queue);
        }
    });
    
    console.log('✓ Complete observer pattern chain initialized');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', setupGeolocationChain);
```

---

## Best Practices

### 1. Observer Validation

Always validate observer input before subscription:

```javascript
subscribe(observer) {
    if (!observer) {
        warn('Cannot subscribe null observer');
        return;
    }
    
    if (typeof observer.update !== 'function') {
        throw new TypeError('Observer must have update() method');
    }
    
    this.observerSubject.subscribe(observer);
}
```

### 2. Error Handling in update()

Wrap observer updates in try/catch for resilience:

```javascript
update(subject, ...args) {
    try {
        // Validate input
        if (!subject) {
            warn('Invalid subject in update');
            return;
        }
        
        // Process notification
        this.handleUpdate(subject, ...args);
        
    } catch (error) {
        error('Observer update failed:', error);
    }
}
```

### 3. Unsubscribe on Cleanup

Always unsubscribe when observers are destroyed:

```javascript
class MyComponent {
    constructor() {
        this.subject = PositionManager.getInstance();
        this.subject.subscribe(this);
    }
    
    destroy() {
        // Clean up subscription
        this.subject.unsubscribe(this);
        console.log('Unsubscribed from position updates');
    }
    
    update(positionManager, eventType, data, error) {
        // Handle updates
    }
}
```

### 4. Immutable Pattern

Always use spread/filter for array operations:

```javascript
// ✅ Good - Immutable
subscribe(observer) {
    this.observers = [...this.observers, observer];
}

unsubscribe(observer) {
    this.observers = this.observers.filter(o => o !== observer);
}

// ❌ Bad - Mutable
subscribe(observer) {
    this.observers.push(observer); // Mutates array
}
```

### 5. Event Type Constants

Use constants for event types to avoid typos:

```javascript
// Define in config/defaults.js
export const ADDRESS_FETCHED_EVENT = 'address-fetched';

// Use in code
notifyObservers(addressData, standard, ADDRESS_FETCHED_EVENT, false, null);

// Check in observer
update(addressData, standard, eventType, loading, error) {
    if (eventType === ADDRESS_FETCHED_EVENT) {
        // Handle address fetch
    }
}
```

---

## Troubleshooting

### Common Issues

#### 1. Observer not receiving notifications

**Problem**: Observer subscribed but update() not called.

**Checklist**:
- ✓ Observer has `update()` method
- ✓ Observer subscribed: `subject.subscribe(observer)`
- ✓ Subject notifying: `subject.notifyObservers(...)`
- ✓ No errors in console

**Debug**:
```javascript
// Add logging to subject
notifyObservers(...args) {
    console.log('Notifying observers:', this.observers.length);
    this.observerSubject.notifyObservers(...args);
}

// Add logging to observer
update(...args) {
    console.log('Observer update called:', args);
}
```

#### 2. Duplicate notifications

**Problem**: Observer receiving same notification multiple times.

**Cause**: Observer subscribed multiple times.

**Solution**:
```javascript
// Check before subscribing
subscribe(observer) {
    if (this.observers.includes(observer)) {
        warn('Observer already subscribed');
        return;
    }
    this.observers = [...this.observers, observer];
}
```

#### 3. Memory leaks

**Problem**: Observers not garbage collected.

**Cause**: Missing unsubscribe on component destruction.

**Solution**:
```javascript
class MyComponent {
    constructor() {
        this.subjects = [];
    }
    
    subscribeToSubject(subject) {
        subject.subscribe(this);
        this.subjects.push(subject);
    }
    
    destroy() {
        // Unsubscribe from all subjects
        this.subjects.forEach(subject => {
            subject.unsubscribe(this);
        });
        this.subjects = [];
    }
}
```

#### 4. Notification order issues

**Problem**: Observers notified in unexpected order.

**Cause**: Array iteration order.

**Solution**: Observers are notified in subscription order. If order matters, use priority system like SpeechQueue.

---

## Performance Considerations

### 1. Observer Count

- **Recommended**: < 10 observers per subject
- **Maximum**: < 50 observers per subject

### 2. Notification Frequency

- **PositionManager**: ~1-2 notifications/second (30s threshold)
- **ReverseGeocoder**: ~1 notification/50 seconds (async delay)
- **AddressCache**: 1-3 notifications per address (field changes)
- **SpeechQueue**: Variable (depends on speech synthesis speed)

### 3. Async Handling

ReverseGeocoder uses async notifications:

```javascript
// Don't block on async operations
async reverseGeocode(lat, lon) {
    try {
        const data = await this.fetchFromAPI(lat, lon);
        // Notify after async completes
        this.notifyObservers(data, ...);
    } catch (error) {
        this.notifyObservers(null, ..., error);
    }
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.8.7-alpha | 2026-02-11 | Added metropolitan region display, refactored AddressCache composition |
| 0.8.4-alpha | 2025-12-15 | Introduced ObserverSubject class, refactored to composition pattern |
| 0.7.2-alpha | 2025-11-10 | Added ReverseGeocoder observer role, SIDRA displayer |
| 0.7.1-alpha | 2025-10-20 | Added highlight cards displayer, municipio/bairro observers |

---

## References

### Related Documentation

- **ObserverSubject Source**: `src/core/ObserverSubject.js`
- **ObserverMixin Source**: `src/utils/ObserverMixin.js`
- **Position Management**: `docs/position-management.md`
- **Address Cache Architecture**: `docs/address-cache-refactoring.md`
- **Speech Synthesis**: `docs/speech-synthesis-refactoring.md`

### Design Patterns

- **Observer Pattern**: Gang of Four (GoF) behavioral pattern
- **Composition over Inheritance**: Effective JavaScript design principle
- **Immutability**: Functional programming principle
- **Singleton Pattern**: PositionManager, AddressCache

---

## Appendix: Class Hierarchy

```
ObserverSubject (base class)
├── Subjects (have observerSubject)
│   ├── PositionManager ⭐ (also Observer)
│   ├── ReverseGeocoder ⭐ (also Observer)
│   ├── WebGeocodingManager
│   ├── AddressCache
│   └── SpeechQueue
│
└── Observers (have update())
    ├── Position Observers
    │   ├── HTMLPositionDisplayer
    │   ├── HtmlText
    │   ├── Chronometer
    │   └── ReverseGeocoder ⭐
    │
    ├── Address Observers
    │   ├── HTMLAddressDisplayer ✅
    │   ├── HTMLHighlightCardsDisplayer
    │   ├── HTMLReferencePlaceDisplayer
    │   ├── HTMLSidraDisplayer
    │   └── HtmlSpeechSynthesisDisplayer
    │
    └── Internal Observers
        └── AddressDataStore
```

---

**END OF DOCUMENTATION**

*Generated: 2026-02-11*  
*Version: 0.8.7-alpha*  
*Guia Turístico - Tourist Guide Application*
