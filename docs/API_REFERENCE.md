# Guia Turístico API Reference

**Version:** 0.9.0-alpha  
**Last Updated:** 2026-02-11  
**Status:** ✅ Production Ready

## Table of Contents

1. [Core API](#core-api)
2. [Geolocation Services](#geolocation-services)
3. [Data Processing](#data-processing)
4. [Display Components](#display-components)
5. [Speech Synthesis](#speech-synthesis)
6. [Utilities](#utilities)
7. [Configuration](#configuration)

---

## Core API

### PositionManager

**File:** `src/core/PositionManager.js`  
**Type:** Singleton  
**Purpose:** Central manager for current geolocation state

#### Methods

##### `getInstance()`
Returns the singleton instance of PositionManager.

```javascript
import PositionManager from './src/core/PositionManager.js';

const manager = PositionManager.getInstance();
```

##### `getCurrentPosition()`
Returns the current GeoPosition object.

**Returns:** `GeoPosition | null`

```javascript
const position = manager.getCurrentPosition();
if (position) {
  console.log(`Lat: ${position.latitude}, Lon: ${position.longitude}`);
}
```

##### `updatePosition(latitude, longitude, timestamp = Date.now())`
Updates the current position.

**Parameters:**
- `latitude` (number): Latitude coordinate (-90 to 90)
- `longitude` (number): Longitude coordinate (-180 to 180)
- `timestamp` (number, optional): Unix timestamp in milliseconds

**Returns:** `GeoPosition`

**Triggers:** Position update events for registered observers

```javascript
const newPosition = manager.updatePosition(-23.550520, -46.633309);
```

##### `addObserver(observer)`
Registers an observer to receive position updates.

**Parameters:**
- `observer` (object): Object with `update(position)` method

```javascript
const myObserver = {
  update(position) {
    console.log('Position changed:', position);
  }
};

manager.addObserver(myObserver);
```

##### `removeObserver(observer)`
Unregisters an observer.

**Parameters:**
- `observer` (object): Previously registered observer

```javascript
manager.removeObserver(myObserver);
```

##### `getDistanceFromPrevious()`
Calculates distance from previous position.

**Returns:** `number` - Distance in meters, or 0 if no previous position

```javascript
const distance = manager.getDistanceFromPrevious();
console.log(`Moved ${distance} meters`);
```

---

### GeoPosition

**File:** `src/core/GeoPosition.js`  
**Type:** Immutable Value Object  
**Purpose:** Represents a geographic position

#### Constructor

```javascript
import GeoPosition from './src/core/GeoPosition.js';

const position = new GeoPosition(latitude, longitude, timestamp);
```

**Parameters:**
- `latitude` (number): Latitude coordinate
- `longitude` (number): Longitude coordinate
- `timestamp` (number, optional): Unix timestamp (defaults to `Date.now()`)

#### Properties

- `latitude` (number, read-only): Latitude coordinate
- `longitude` (number, read-only): Longitude coordinate
- `timestamp` (number, read-only): Unix timestamp in milliseconds

#### Methods

##### `toString()`
Returns string representation of position.

**Returns:** `string` - Format: `"GeoPosition(lat, lon) @ timestamp"`

```javascript
console.log(position.toString());
// Output: "GeoPosition(-23.550520, -46.633309) @ 1707690835000"
```

##### `equals(otherPosition)`
Compares two positions for equality.

**Parameters:**
- `otherPosition` (GeoPosition): Position to compare

**Returns:** `boolean` - True if coordinates match

```javascript
const pos1 = new GeoPosition(-23.550520, -46.633309);
const pos2 = new GeoPosition(-23.550520, -46.633309);
console.log(pos1.equals(pos2)); // true
```

---

## Geolocation Services

### GeolocationService

**File:** `src/services/GeolocationService.js`  
**Purpose:** Browser geolocation API wrapper with provider pattern support

#### Constructor

```javascript
import GeolocationService from './src/services/GeolocationService.js';

const service = new GeolocationService(provider);
```

**Parameters:**
- `provider` (GeolocationProvider, optional): Geolocation provider (defaults to BrowserGeolocationProvider)

#### Methods

##### `watchPosition(successCallback, errorCallback, options)`
Starts watching position changes.

**Parameters:**
- `successCallback` (function): Called with position updates
- `errorCallback` (function): Called on errors
- `options` (object, optional): Geolocation options

**Returns:** `number` - Watch ID

```javascript
const watchId = service.watchPosition(
  (position) => {
    console.log('New position:', position);
  },
  (error) => {
    console.error('Geolocation error:', error);
  },
  {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  }
);
```

##### `clearWatch(watchId)`
Stops watching position.

**Parameters:**
- `watchId` (number): Watch ID returned by `watchPosition()`

```javascript
service.clearWatch(watchId);
```

##### `getCurrentPosition(successCallback, errorCallback, options)`
Gets current position once.

```javascript
service.getCurrentPosition(
  (position) => console.log(position),
  (error) => console.error(error)
);
```

---

### ReverseGeocoder

**File:** `src/services/ReverseGeocoder.js`  
**Purpose:** OpenStreetMap Nominatim reverse geocoding integration

#### Constructor

```javascript
import ReverseGeocoder from './src/services/ReverseGeocoder.js';

const geocoder = new ReverseGeocoder(latitude, longitude);
```

**Parameters:**
- `latitude` (number): Latitude coordinate
- `longitude` (number): Longitude coordinate

#### Methods

##### `fetchAddress()`
Fetches address data from Nominatim API.

**Returns:** `Promise<object>` - Address data object

**Throws:** Error if API request fails

```javascript
try {
  const addressData = await geocoder.fetchAddress();
  console.log('Address:', addressData);
} catch (error) {
  console.error('Failed to fetch address:', error);
}
```

#### API Response Structure

```javascript
{
  place_id: 12345,
  lat: "-23.550520",
  lon: "-46.633309",
  display_name: "São Paulo, Brazil",
  address: {
    road: "Avenida Paulista",
    suburb: "Bela Vista",
    city: "São Paulo",
    state: "São Paulo",
    country: "Brazil",
    country_code: "br",
    postcode: "01310-100"
  },
  boundingbox: ["...", "...", "...", "..."]
}
```

---

## Data Processing

### BrazilianStandardAddress

**File:** `src/data/BrazilianStandardAddress.js`  
**Purpose:** Brazilian address standardization and formatting

#### Constructor

```javascript
import BrazilianStandardAddress from './src/data/BrazilianStandardAddress.js';

const address = new BrazilianStandardAddress();
```

#### Properties

- `logradouro` (string): Street name
- `numero` (string): Street number
- `complemento` (string): Additional address info
- `bairro` (string): Neighborhood
- `municipio` (string): Municipality (city)
- `uf` (string): State abbreviation (e.g., "SP", "RJ")
- `cep` (string): Postal code (CEP)
- `regiaoMetropolitana` (string): Metropolitan region (v0.9.0-alpha+)

#### Methods

##### `setFromNominatim(nominatimData)`
Populates address from Nominatim API response.

**Parameters:**
- `nominatimData` (object): Nominatim API response

```javascript
const addressData = await geocoder.fetchAddress();
address.setFromNominatim(addressData);
```

##### `toString()`
Returns formatted address string.

**Returns:** `string` - Complete formatted address

```javascript
console.log(address.toString());
// Output: "Av. Paulista, 1578 - Bela Vista, São Paulo - SP, 01310-100"
```

##### `municipioCompleto()`
Returns municipality with state abbreviation.

**Returns:** `string` - Format: "Municipality, UF"

```javascript
console.log(address.municipioCompleto());
// Output: "São Paulo, SP"
```

##### `regiaoMetropolitanaFormatada()`
Returns formatted metropolitan region name (v0.9.0-alpha+).

**Returns:** `string` - Format: "Região Metropolitana de [City]"

```javascript
console.log(address.regiaoMetropolitanaFormatada());
// Output: "Região Metropolitana de Recife"
```

---

### AddressCache

**File:** `src/data/AddressCache.js`  
**Type:** Composition-based cache system (v0.9.0-alpha refactored)  
**Purpose:** Caches addresses with change detection and callback management

#### Constructor

```javascript
import AddressCache from './src/data/AddressCache.js';

const cache = new AddressCache(maxSize = 100);
```

**Parameters:**
- `maxSize` (number, optional): Maximum cache entries (default: 100)

#### Methods

##### `set(key, addressData)`
Stores address in cache.

**Parameters:**
- `key` (string): Cache key (typically coordinate pair)
- `addressData` (object): Address data object

```javascript
cache.set('lat-23.550520_lon-46.633309', addressData);
```

##### `get(key)`
Retrieves address from cache.

**Parameters:**
- `key` (string): Cache key

**Returns:** `object | undefined` - Address data or undefined if not found

```javascript
const cached = cache.get('lat-23.550520_lon-46.633309');
```

##### `has(key)`
Checks if address exists in cache.

**Parameters:**
- `key` (string): Cache key

**Returns:** `boolean`

```javascript
if (cache.has(key)) {
  console.log('Address found in cache');
}
```

##### `registerCallback(field, callback)`
Registers callback for field changes.

**Parameters:**
- `field` (string): Field name to monitor (e.g., 'bairro', 'municipio')
- `callback` (function): Callback function `(current, previous) => void`

**Returns:** `string` - Callback ID for unregistration

```javascript
const callbackId = cache.registerCallback('bairro', (current, prev) => {
  console.log(`Neighborhood changed from ${prev} to ${current}`);
});
```

##### `unregisterCallback(field, callbackId)`
Unregisters a callback.

**Parameters:**
- `field` (string): Field name
- `callbackId` (string): Callback ID from registration

```javascript
cache.unregisterCallback('bairro', callbackId);
```

##### `clear()`
Clears all cached data.

```javascript
cache.clear();
```

---

### ReferencePlace

**File:** `src/data/ReferencePlace.js`  
**Purpose:** Represents nearby reference locations

#### Constructor

```javascript
import ReferencePlace from './src/data/ReferencePlace.js';

const place = new ReferencePlace(data);
```

**Parameters:**
- `data` (object): Place data with `name`, `type`, and optional `distance`

#### Properties

- `name` (string): Place name
- `type` (string): Place type (e.g., 'amenity', 'shop', 'place')
- `distance` (number, optional): Distance in meters

#### Methods

##### `calculateCategory()`
Determines place category from type.

**Returns:** `string` - Category: 'Ponto de Referência', 'Comércio', 'Transporte', 'Edifício', 'Outro'

**Supported Types:** (v0.9.0+)
- `place`, `amenity`, `shop`, `railway`, `building`

```javascript
const category = place.calculateCategory();
console.log(category); // e.g., "Ponto de Referência"
```

---

## Display Components

### HTMLPositionDisplayer

**File:** `src/html/HTMLPositionDisplayer.js`  
**Purpose:** Displays coordinates and Google Maps integration

#### Constructor

```javascript
import HTMLPositionDisplayer from './src/html/HTMLPositionDisplayer.js';

const displayer = new HTMLPositionDisplayer(document, containerId);
```

**Parameters:**
- `document` (Document): DOM document object
- `containerId` (string): Container element ID

#### Methods

##### `display(position)`
Displays position coordinates and map link.

**Parameters:**
- `position` (GeoPosition): Position to display

```javascript
displayer.display(position);
```

##### `clear()`
Clears displayed content.

```javascript
displayer.clear();
```

---

### HTMLAddressDisplayer

**File:** `src/html/HTMLAddressDisplayer.js`  
**Purpose:** Displays formatted address information

#### Constructor

```javascript
import HTMLAddressDisplayer from './src/html/HTMLAddressDisplayer.js';

const displayer = new HTMLAddressDisplayer(document, containerId);
```

#### Methods

##### `display(address)`
Displays formatted address.

**Parameters:**
- `address` (BrazilianStandardAddress): Address object

```javascript
displayer.display(address);
```

---

### HTMLHighlightCardsDisplayer

**File:** `src/html/HTMLHighlightCardsDisplayer.js`  
**Purpose:** Displays municipality and neighborhood highlight cards (v0.9.0+)

#### Constructor

```javascript
import HTMLHighlightCardsDisplayer from './src/html/HTMLHighlightCardsDisplayer.js';

const displayer = new HTMLHighlightCardsDisplayer(document, containerId);
```

#### Methods

##### `display(address)`
Displays municipality and neighborhood cards.

**Parameters:**
- `address` (BrazilianStandardAddress): Address object

**Features:**
- Municipality with state (e.g., "Recife, PE")
- Metropolitan region display (v0.9.0-alpha+)
- Neighborhood tracking

```javascript
displayer.display(address);
```

---

### HTMLSidraDisplayer

**File:** `src/html/HTMLSidraDisplayer.js`  
**Purpose:** Displays IBGE SIDRA demographic statistics (v0.9.0+)

#### Constructor

```javascript
import HTMLSidraDisplayer from './src/html/HTMLSidraDisplayer.js';

const displayer = new HTMLSidraDisplayer(document, containerId);
```

#### Methods

##### `display(municipio, uf)`
Fetches and displays population statistics.

**Parameters:**
- `municipio` (string): Municipality name
- `uf` (string): State abbreviation

**Features:**
- IBGE SIDRA API integration
- Offline fallback (`libs/sidra/tab6579_municipios.json`)
- Brazilian Portuguese localization
- Observer pattern for automatic updates

```javascript
displayer.display('Recife', 'PE');
```

---

### DisplayerFactory

**File:** `src/html/DisplayerFactory.js`  
**Purpose:** Factory for creating display components

#### Methods

##### `createPositionDisplayer(document, elementId)`
Creates HTMLPositionDisplayer instance.

##### `createAddressDisplayer(document, elementId)`
Creates HTMLAddressDisplayer instance.

##### `createReferencePlaceDisplayer(document, elementId)`
Creates HTMLReferencePlaceDisplayer instance.

##### `createHighlightCardsDisplayer(document, elementId)`
Creates HTMLHighlightCardsDisplayer instance.

##### `createSidraDisplayer(document, elementId)`
Creates HTMLSidraDisplayer instance (v0.9.0+).

```javascript
import DisplayerFactory from './src/html/DisplayerFactory.js';

const factory = new DisplayerFactory();
const positionDisplayer = factory.createPositionDisplayer(document, 'position-container');
const addressDisplayer = factory.createAddressDisplayer(document, 'address-container');
```

---

## Speech Synthesis

### SpeechSynthesisManager

**File:** `src/speech/SpeechSynthesisManager.js`  
**Type:** Singleton, Composition Pattern (v0.9.0-alpha refactored)  
**Purpose:** Main orchestrator for speech synthesis

#### Architecture

**Composition Components:**
- **VoiceLoader**: Asynchronous voice loading with exponential backoff retry
- **VoiceSelector**: Brazilian Portuguese voice prioritization strategy
- **SpeechConfiguration**: Rate/pitch parameter validation and clamping
- **SpeechQueue**: Priority-based request queue management

#### Methods

##### `getInstance()`
Returns singleton instance.

```javascript
import SpeechSynthesisManager from './src/speech/SpeechSynthesisManager.js';

const manager = SpeechSynthesisManager.getInstance();
```

##### `speak(text, priority = 'normal')`
Adds text to speech queue.

**Parameters:**
- `text` (string): Text to speak
- `priority` (string): 'high' or 'normal'

```javascript
manager.speak('Você está em São Paulo', 'high');
```

##### `setRate(rate)`
Sets speech rate.

**Parameters:**
- `rate` (number): Rate (0.1 to 10.0, clamped automatically)

```javascript
manager.setRate(1.2); // 20% faster
```

##### `setPitch(pitch)`
Sets speech pitch.

**Parameters:**
- `pitch` (number): Pitch (0.0 to 2.0, clamped automatically)

```javascript
manager.setPitch(1.0); // Normal pitch
```

##### `stop()`
Stops current speech.

```javascript
manager.stop();
```

##### `pause()`
Pauses speech.

```javascript
manager.pause();
```

##### `resume()`
Resumes paused speech.

```javascript
manager.resume();
```

---

### VoiceLoader

**File:** `src/speech/VoiceLoader.js` (v0.9.0-alpha)  
**Purpose:** Voice loading with exponential backoff retry

#### Methods

##### `loadVoices()`
Loads available voices asynchronously.

**Returns:** `Promise<Array>` - Array of available voices

**Retry Strategy:**
- Delays: 100ms → 200ms → 400ms → 800ms → 1600ms → 3200ms → 5000ms (capped)
- Max 10 retry attempts

```javascript
import VoiceLoader from './src/speech/VoiceLoader.js';

const loader = new VoiceLoader();
const voices = await loader.loadVoices();
```

---

### VoiceSelector

**File:** `src/speech/VoiceSelector.js` (v0.9.0-alpha)  
**Purpose:** Intelligent Brazilian Portuguese voice selection

#### Methods

##### `selectVoice(voices)`
Selects best Brazilian Portuguese voice.

**Parameters:**
- `voices` (Array): Available voices

**Returns:** `SpeechSynthesisVoice | null`

**Selection Strategy:**
1. pt-BR exact match (highest priority)
2. pt-* prefix match
3. First available voice
4. null if no voices

**Quality Scoring:**
- Local voice: +10 points
- Primary language match: +20 points

```javascript
import VoiceSelector from './src/speech/VoiceSelector.js';

const selector = new VoiceSelector();
const bestVoice = selector.selectVoice(voices);
```

---

## Utilities

### TimerManager

**File:** `src/utils/TimerManager.js`  
**Type:** Singleton  
**Purpose:** Centralized timer management to prevent memory leaks

#### Methods

##### `getInstance()`
Returns singleton instance.

```javascript
import TimerManager from './src/utils/TimerManager.js';

const timerManager = TimerManager.getInstance();
```

##### `setInterval(callback, delay, id)`
Creates named interval timer.

**Parameters:**
- `callback` (function): Function to execute
- `delay` (number): Delay in milliseconds
- `id` (string): Unique timer ID

**Returns:** `string` - Timer ID

```javascript
const timerId = timerManager.setInterval(
  () => console.log('tick'),
  1000,
  'my-timer'
);
```

##### `setTimeout(callback, delay, id)`
Creates named timeout timer.

```javascript
const timerId = timerManager.setTimeout(
  () => console.log('done'),
  5000,
  'my-timeout'
);
```

##### `clearTimer(id)`
Clears a timer by ID.

**Parameters:**
- `id` (string): Timer ID

```javascript
timerManager.clearTimer('my-timer');
```

##### `clearAll()`
Clears all managed timers.

```javascript
timerManager.clearAll();
```

---

### Chronometer

**File:** `src/timing/Chronometer.js`  
**Purpose:** Performance timing and elapsed time tracking

#### Constructor

```javascript
import Chronometer from './src/timing/Chronometer.js';

const chrono = new Chronometer();
```

#### Methods

##### `start()`
Starts the chronometer.

```javascript
chrono.start();
```

##### `stop()`
Stops the chronometer.

**Returns:** `number` - Elapsed time in milliseconds

```javascript
const elapsed = chrono.stop();
console.log(`Took ${elapsed}ms`);
```

##### `reset()`
Resets the chronometer.

```javascript
chrono.reset();
```

##### `getElapsedTime()`
Gets elapsed time without stopping.

**Returns:** `number` - Elapsed time in milliseconds

```javascript
const elapsed = chrono.getElapsedTime();
```

##### `addObserver(observer)`
Registers observer for timing events.

```javascript
chrono.addObserver({
  update(elapsed) {
    console.log('Elapsed:', elapsed);
  }
});
```

---

### Distance Utilities

**File:** `src/utils/distance.js`

#### Functions

##### `calculateDistance(lat1, lon1, lat2, lon2)`
Calculates distance between two coordinates using Haversine formula.

**Parameters:**
- `lat1` (number): First latitude
- `lon1` (number): First longitude
- `lat2` (number): Second latitude
- `lon2` (number): Second longitude

**Returns:** `number` - Distance in meters

```javascript
import { calculateDistance } from './src/utils/distance.js';

const distance = calculateDistance(
  -23.550520, -46.633309,  // São Paulo
  -22.906847, -43.172896   // Rio de Janeiro
);
console.log(`${distance} meters`); // ~358,000 meters
```

---

## Configuration

### Default Configuration

**File:** `src/config/defaults.js`

#### Constants

##### Event Names
```javascript
export const ADDRESS_FETCHED_EVENT = 'address:fetched';
```

##### Thresholds
```javascript
export const MINIMUM_TIME_CHANGE = 30000;      // 30 seconds
export const MINIMUM_DISTANCE_CHANGE = 20;     // 20 meters
```

##### Version
```javascript
export const VERSION = '0.9.0-alpha';
```

#### Usage

```javascript
import { 
  ADDRESS_FETCHED_EVENT, 
  MINIMUM_TIME_CHANGE,
  MINIMUM_DISTANCE_CHANGE 
} from './src/config/defaults.js';

// Use constants for consistency
if (distance > MINIMUM_DISTANCE_CHANGE) {
  // Trigger update
}
```

---

## API Integration

### OpenStreetMap Nominatim

**Base URL:** `https://nominatim.openstreetmap.org/reverse`

**Parameters:**
- `format=json` - Response format
- `lat={latitude}` - Latitude coordinate
- `lon={longitude}` - Longitude coordinate

**Example:**
```bash
curl "https://nominatim.openstreetmap.org/reverse?format=json&lat=-23.550520&lon=-46.633309"
```

### IBGE API

**Base URL:** `https://servicodados.ibge.gov.br/api/v1/localidades/estados/`

**Endpoints:**
- `/estados/{uf}` - State information
- `/estados/{uf}/municipios` - Municipalities in state

### SIDRA API

**Base URL:** `https://servicodados.ibge.gov.br/api/v3/agregados/`

**Population Data:**
- `6579/periodos/-6/variaveis/9324` - Last 6 years population estimates

---

## Error Handling

### Common Errors

#### GeolocationPositionError
```javascript
service.watchPosition(
  (pos) => console.log(pos),
  (error) => {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        console.error('User denied geolocation');
        break;
      case error.POSITION_UNAVAILABLE:
        console.error('Position unavailable');
        break;
      case error.TIMEOUT:
        console.error('Request timeout');
        break;
    }
  }
);
```

#### Network Errors
```javascript
try {
  const address = await geocoder.fetchAddress();
} catch (error) {
  if (error.message.includes('Network')) {
    console.error('Network error, using cache');
  }
}
```

---

## Performance Considerations

### Position Updates
- Updates trigger on distance (20m) OR time (30s) thresholds
- Use PositionManager for centralized state
- Implement change detection to avoid unnecessary updates

### Caching Strategy
- AddressCache uses LRU eviction (max 100 entries)
- Cache keys use coordinate pairs
- Register callbacks for field-specific change detection

### Timer Management
- Always use TimerManager for all application timers
- Call `clearAll()` on app shutdown
- Use named timer IDs for debugging

---

## Migration Guides

### Upgrading to v0.9.0-alpha

**New Features:**
- Metropolitan region display in `BrazilianStandardAddress`
- Refactored speech synthesis with composition pattern
- Enhanced AddressCache with separate components

**Breaking Changes:** None - 100% backward compatible

**New Methods:**
```javascript
// Metropolitan region support
address.regiaoMetropolitana; // New property
address.regiaoMetropolitanaFormatada(); // New method

// Enhanced display
displayer.display(address); // Now shows metropolitan region
```

---

## Examples

See [API_EXAMPLES.md](./API_EXAMPLES.md) for comprehensive code examples.

---

## Support

- **Documentation:** [docs/](../docs/)
- **Issues:** GitHub Issues
- **Contributing:** [CONTRIBUTING.md](../.github/CONTRIBUTING.md)
- **Testing:** [TESTING.md](./TESTING.md)

---

**Version:** 0.9.0-alpha  
**Last Updated:** 2026-02-11
