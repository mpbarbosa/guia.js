# Complete API Reference

**Version**: 0.8.7-alpha  
**Last Updated**: 2026-02-11

This document provides a comprehensive reference for all public APIs in the Guia Turístico application.

## Table of Contents

1. [Core APIs](#core-apis)
2. [Service APIs](#service-apis)
3. [Coordination APIs](#coordination-apis)
4. [Data Processing APIs](#data-processing-apis)
5. [Display/UI APIs](#displayui-apis)
6. [Speech Synthesis APIs](#speech-synthesis-apis)
7. [Utility APIs](#utility-apis)
8. [Configuration](#configuration)

---

## Core APIs

### PositionManager

**Purpose**: Singleton manager for current geolocation state throughout the application.

**File**: `src/core/PositionManager.js`

#### Methods

##### `getInstance()`
Returns the singleton instance of PositionManager.

```javascript
import { PositionManager } from './core/PositionManager.js';

const positionManager = PositionManager.getInstance();
```

**Returns**: `PositionManager` - Singleton instance

##### `setCurrentPosition(geoPosition)`
Updates the current position. Triggers updates on distance (20m) OR time (30s) thresholds.

```javascript
const position = new GeoPosition(latitude, longitude, accuracy, timestamp);
positionManager.setCurrentPosition(position);
```

**Parameters**:
- `geoPosition` (GeoPosition) - Immutable position value object

**Thresholds** (v0.7.2+):
- Distance: 20 meters (MINIMUM_DISTANCE_CHANGE)
- Time: 30 seconds (MINIMUM_TIME_CHANGE)

##### `getCurrentPosition()`
Retrieves the current position.

```javascript
const currentPosition = positionManager.getCurrentPosition();
console.log(currentPosition.latitude, currentPosition.longitude);
```

**Returns**: `GeoPosition | null` - Current position or null if not set

##### `addObserver(callback)`
Registers an observer for position changes.

```javascript
positionManager.addObserver((newPosition) => {
  console.log('Position updated:', newPosition);
});
```

**Parameters**:
- `callback` (Function) - Callback invoked on position changes

**Returns**: `Function` - Unsubscribe function

##### `notifyObservers()`
Notifies all registered observers of position changes.

```javascript
positionManager.notifyObservers();
```

---

### GeoPosition

**Purpose**: Immutable value object representing a geographic position.

**File**: `src/core/GeoPosition.js`

#### Constructor

```javascript
import { GeoPosition } from './core/GeoPosition.js';

const position = new GeoPosition(latitude, longitude, accuracy, timestamp);
```

**Parameters**:
- `latitude` (Number) - Latitude in decimal degrees
- `longitude` (Number) - Longitude in decimal degrees
- `accuracy` (Number) - Position accuracy in meters
- `timestamp` (Number) - Unix timestamp in milliseconds

#### Properties

```javascript
position.latitude   // Number: Latitude
position.longitude  // Number: Longitude
position.accuracy   // Number: Accuracy in meters
position.timestamp  // Number: Unix timestamp
```

#### Methods

##### `distanceTo(otherPosition)`
Calculates distance to another position using Haversine formula.

```javascript
const position1 = new GeoPosition(-23.5505, -46.6333, 10, Date.now());
const position2 = new GeoPosition(-23.5615, -46.6559, 10, Date.now());

const distanceMeters = position1.distanceTo(position2);
console.log(`Distance: ${distanceMeters} meters`);
```

**Parameters**:
- `otherPosition` (GeoPosition) - Target position

**Returns**: `Number` - Distance in meters

##### `toJSON()`
Serializes position to JSON object.

```javascript
const json = position.toJSON();
// { latitude: -23.5505, longitude: -46.6333, accuracy: 10, timestamp: 1707609276097 }
```

**Returns**: `Object` - JSON representation

---

## Service APIs

### GeolocationService

**Purpose**: Wrapper for browser Geolocation API with error handling.

**File**: `src/services/GeolocationService.js`

#### Methods

##### `getCurrentPosition(options)`
Retrieves the current position from browser.

```javascript
import { GeolocationService } from './services/GeolocationService.js';

const service = new GeolocationService();
service.getCurrentPosition({
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0
})
.then(position => {
  console.log('Latitude:', position.coords.latitude);
  console.log('Longitude:', position.coords.longitude);
})
.catch(error => {
  console.error('Geolocation error:', error.message);
});
```

**Parameters**:
- `options` (Object) - Geolocation options
  - `enableHighAccuracy` (Boolean) - Request high accuracy
  - `timeout` (Number) - Timeout in milliseconds
  - `maximumAge` (Number) - Maximum age of cached position

**Returns**: `Promise<Position>` - Browser Position object

**Errors**:
- `PERMISSION_DENIED` - User denied geolocation permission
- `POSITION_UNAVAILABLE` - Position could not be determined
- `TIMEOUT` - Request timed out

##### `watchPosition(successCallback, errorCallback, options)`
Watches position changes continuously.

```javascript
const watchId = service.watchPosition(
  (position) => {
    console.log('Position updated:', position.coords);
  },
  (error) => {
    console.error('Watch error:', error);
  },
  { enableHighAccuracy: true }
);

// Stop watching later
service.clearWatch(watchId);
```

**Parameters**:
- `successCallback` (Function) - Called on position updates
- `errorCallback` (Function) - Called on errors
- `options` (Object) - Geolocation options

**Returns**: `Number` - Watch ID for clearing

##### `clearWatch(watchId)`
Stops watching position changes.

```javascript
service.clearWatch(watchId);
```

**Parameters**:
- `watchId` (Number) - Watch ID from watchPosition()

---

### ReverseGeocoder

**Purpose**: Converts coordinates to addresses using OpenStreetMap Nominatim API.

**File**: `src/services/ReverseGeocoder.js`

#### Constructor

```javascript
import { ReverseGeocoder } from './services/ReverseGeocoder.js';

const geocoder = new ReverseGeocoder(latitude, longitude);
```

**Parameters**:
- `latitude` (Number) - Latitude in decimal degrees
- `longitude` (Number) - Longitude in decimal degrees

#### Methods

##### `fetchAddress()`
Fetches address data from Nominatim API.

```javascript
const geocoder = new ReverseGeocoder(-23.5505, -46.6333);

geocoder.fetchAddress()
  .then(addressData => {
    console.log('Address:', addressData.display_name);
    console.log('City:', addressData.address.city);
    console.log('State:', addressData.address.state);
  })
  .catch(error => {
    console.error('Geocoding failed:', error);
  });
```

**Returns**: `Promise<Object>` - Address data from Nominatim

**Response Structure**:
```javascript
{
  display_name: "Av. Paulista, São Paulo, SP, Brazil",
  address: {
    road: "Avenida Paulista",
    city: "São Paulo",
    state: "São Paulo",
    postcode: "01310-100",
    country: "Brasil",
    county: "Região Metropolitana de São Paulo" // v0.8.7-alpha
  },
  lat: "-23.5505",
  lon: "-46.6333"
}
```

**API Endpoint**: `https://nominatim.openstreetmap.org/reverse`

**Rate Limiting**: 1 request/second (Nominatim usage policy)

##### `addObserver(callback)`
Registers observer for address fetch events.

```javascript
geocoder.addObserver((event, data) => {
  if (event === 'ADDRESS_FETCHED') {
    console.log('Address fetched:', data);
  }
});
```

**Parameters**:
- `callback` (Function) - Observer callback

**Events** (v0.7.2+):
- `ADDRESS_FETCHED` - Address successfully fetched (uses constant from config/defaults.js)

---

## Data Processing APIs

### BrazilianStandardAddress

**Purpose**: Standardizes Brazilian address data with proper formatting.

**File**: `src/data/BrazilianStandardAddress.js`

#### Constructor

```javascript
import { BrazilianStandardAddress } from './data/BrazilianStandardAddress.js';

const address = new BrazilianStandardAddress();
address.logradouro = "Avenida Paulista";
address.numero = "1578";
address.bairro = "Bela Vista";
address.municipio = "São Paulo";
address.uf = "SP";
address.cep = "01310-100";
address.regiaoMetropolitana = "Região Metropolitana de São Paulo"; // v0.8.7-alpha
```

#### Properties

```javascript
address.logradouro           // String: Street name
address.numero               // String: Street number
address.complemento          // String: Complement
address.bairro               // String: Neighborhood
address.municipio            // String: Municipality/City
address.uf                   // String: State code (2 letters)
address.cep                  // String: Postal code
address.pais                 // String: Country
address.regiaoMetropolitana  // String: Metropolitan region (v0.8.7-alpha)
```

#### Methods

##### `municipioCompleto()`
Returns municipality with state code.

```javascript
const fullCity = address.municipioCompleto();
// "São Paulo, SP"
```

**Returns**: `String` - "Município, UF" format

##### `regiaoMetropolitanaFormatada()` (v0.8.7-alpha)
Returns formatted metropolitan region name.

```javascript
const metro = address.regiaoMetropolitanaFormatada();
// "Região Metropolitana de São Paulo"
```

**Returns**: `String | null` - Formatted metropolitan region or null

##### `enderecoCompleto()`
Returns complete formatted address.

```javascript
const full = address.enderecoCompleto();
// "Avenida Paulista, 1578, Bela Vista, São Paulo, SP, 01310-100, Brasil"
```

**Returns**: `String` - Complete address

##### `toJSON()`
Serializes to JSON object.

```javascript
const json = address.toJSON();
```

**Returns**: `Object` - JSON representation

---

### AddressCache

**Purpose**: LRU cache for address data with change detection (v0.8.7-alpha refactored with composition).

**File**: `src/data/AddressCache.js`

**Architecture** (v0.8.7-alpha):
- Uses composition pattern with 3 focused classes
- **AddressChangeDetector**: Field change detection with signature tracking
- **CallbackRegistry**: Centralized callback management
- **AddressDataStore**: Address data storage with history tracking

#### Constructor

```javascript
import { AddressCache } from './data/AddressCache.js';

const cache = new AddressCache(maxSize);
// Default maxSize: 100
```

**Parameters**:
- `maxSize` (Number, optional) - Maximum cache entries (default: 100)

#### Methods

##### `set(key, value)`
Stores address in cache with LRU eviction.

```javascript
cache.set('current', {
  municipio: 'São Paulo',
  bairro: 'Bela Vista',
  uf: 'SP'
});
```

**Parameters**:
- `key` (String) - Cache key
- `value` (Object) - Address data

##### `get(key)`
Retrieves address from cache.

```javascript
const address = cache.get('current');
```

**Parameters**:
- `key` (String) - Cache key

**Returns**: `Object | null` - Cached address or null

##### `registerChangeCallback(field, callback)`
Registers callback for field changes.

```javascript
cache.registerChangeCallback('bairro', (oldValue, newValue) => {
  console.log(`Bairro changed: ${oldValue} → ${newValue}`);
});
```

**Parameters**:
- `field` (String) - Field name to monitor
- `callback` (Function) - Callback with (oldValue, newValue) signature

**Supported Fields**:
- `municipio` - Municipality changes
- `bairro` - Neighborhood changes
- `uf` - State changes
- `regiaoMetropolitana` - Metropolitan region changes (v0.8.7-alpha)

##### `clear()`
Clears all cached data.

```javascript
cache.clear();
```

---

### AddressExtractor

**Purpose**: Extracts and normalizes address data from Nominatim responses.

**File**: `src/data/AddressExtractor.js`

#### Methods

##### `extract(nominatimData)`
Extracts standardized address from Nominatim response.

```javascript
import { AddressExtractor } from './data/AddressExtractor.js';

const extractor = new AddressExtractor();
const address = extractor.extract(nominatimData);

console.log(address.municipio);
console.log(address.bairro);
console.log(address.uf);
console.log(address.regiaoMetropolitana); // v0.8.7-alpha
```

**Parameters**:
- `nominatimData` (Object) - Raw Nominatim API response

**Returns**: `BrazilianStandardAddress` - Standardized address object

**Extraction Logic** (v0.8.7-alpha):
- Municipality: `city`, `town`, `village`, `municipality`
- Neighborhood: `neighbourhood`, `suburb`, `quarter`
- State: `state` field
- Metropolitan Region: `county` field (new in v0.8.7-alpha)

---

### ReferencePlace

**Purpose**: Handles reference location (nearby places) with categorization.

**File**: `src/data/ReferencePlace.js`

#### Constructor

```javascript
import { ReferencePlace } from './data/ReferencePlace.js';

const place = new ReferencePlace(
  'Museu de Arte de São Paulo',
  'museum',
  50 // distance in meters
);
```

**Parameters**:
- `name` (String) - Place name
- `type` (String) - Place type (amenity, shop, building, etc.)
- `distance` (Number) - Distance in meters

#### Methods

##### `calculateCategory()`
Determines place category from type (v0.7.2+).

```javascript
const category = place.calculateCategory();
// Returns: 'museum', 'restaurant', 'shop', 'transport', 'building', 'other'
```

**Supported Types**:
- `place`, `shop`, `amenity`, `railway`, `building`

**Returns**: `String` - Categorized place type

##### `toJSON()`
Serializes to JSON.

```javascript
const json = place.toJSON();
// { name: "Museu de Arte de São Paulo", type: "museum", distance: 50 }
```

**Returns**: `Object` - JSON representation

---

## Display/UI APIs

### HTMLPositionDisplayer

**Purpose**: Displays coordinates with Google Maps integration.

**File**: `src/html/HTMLPositionDisplayer.js`

#### Constructor

```javascript
import { HTMLPositionDisplayer } from './html/HTMLPositionDisplayer.js';

const displayer = new HTMLPositionDisplayer(document, 'output-element-id');
```

**Parameters**:
- `document` (Document) - DOM document object
- `elementId` (String) - Target element ID

#### Methods

##### `display(geoPosition)`
Displays position coordinates.

```javascript
const position = new GeoPosition(-23.5505, -46.6333, 10, Date.now());
displayer.display(position);
```

**Parameters**:
- `geoPosition` (GeoPosition) - Position to display

**Output Format**:
```
Latitude: -23.5505°
Longitude: -46.6333°
Accuracy: 10 meters
[Google Maps Link] [Street View Link]
```

##### `clear()`
Clears displayed content.

```javascript
displayer.clear();
```

---

### HTMLAddressDisplayer

**Purpose**: Formats and displays Brazilian addresses.

**File**: `src/html/HTMLAddressDisplayer.js`

#### Constructor

```javascript
import { HTMLAddressDisplayer } from './html/HTMLAddressDisplayer.js';

const displayer = new HTMLAddressDisplayer(document, 'address-output-id');
```

#### Methods

##### `display(address)`
Displays formatted address.

```javascript
const address = new BrazilianStandardAddress();
address.logradouro = "Avenida Paulista";
address.municipio = "São Paulo";
address.uf = "SP";

displayer.display(address);
```

**Parameters**:
- `address` (BrazilianStandardAddress) - Address to display

**Output Format**:
```
Endereço: Avenida Paulista, 1578
Bairro: Bela Vista
Cidade: São Paulo, SP
CEP: 01310-100
```

---

### HTMLHighlightCardsDisplayer

**Purpose**: Displays municipality and neighborhood highlight cards (v0.7.1+).

**File**: `src/html/HTMLHighlightCardsDisplayer.js`

#### Constructor

```javascript
import { HTMLHighlightCardsDisplayer } from './html/HTMLHighlightCardsDisplayer.js';

const displayer = new HTMLHighlightCardsDisplayer(document);
```

#### Methods

##### `displayMunicipio(municipio, uf)`
Displays municipality highlight card with state.

```javascript
displayer.displayMunicipio('Recife', 'PE');
// Displays: "Recife, PE"
```

**Parameters**:
- `municipio` (String) - Municipality name
- `uf` (String) - State code

##### `displayBairro(bairro)`
Displays neighborhood highlight card.

```javascript
displayer.displayBairro('Boa Viagem');
```

**Parameters**:
- `bairro` (String) - Neighborhood name

##### `displayRegiaoMetropolitana(regiaoMetropolitana)` (v0.8.7-alpha)
Displays metropolitan region highlight.

```javascript
displayer.displayRegiaoMetropolitana('Região Metropolitana do Recife');
```

**Parameters**:
- `regiaoMetropolitana` (String) - Metropolitan region name

##### `clear()`
Clears all highlight cards.

```javascript
displayer.clear();
```

---

### HTMLSidraDisplayer

**Purpose**: Displays IBGE SIDRA demographic statistics (v0.7.2+).

**File**: `src/html/HTMLSidraDisplayer.js`

#### Constructor

```javascript
import { HTMLSidraDisplayer } from './html/HTMLSidraDisplayer.js';

const displayer = new HTMLSidraDisplayer(document, 'stats-output-id');
```

#### Methods

##### `display(sidraData)`
Displays population statistics with Brazilian Portuguese localization.

```javascript
displayer.display({
  municipio: 'Recife',
  uf: 'PE',
  populacao: 1653461,
  ano: 2023
});
```

**Parameters**:
- `sidraData` (Object) - SIDRA data object
  - `municipio` (String) - Municipality name
  - `uf` (String) - State code
  - `populacao` (Number) - Population count
  - `ano` (Number) - Year

**Output Format**:
```
📊 Estatísticas Demográficas
Município: Recife, PE
População: 1.653.461 habitantes
Ano: 2023
Fonte: IBGE SIDRA
```

##### `addObserver(callback)`
Registers observer for SIDRA data updates.

```javascript
displayer.addObserver((data) => {
  console.log('SIDRA data updated:', data);
});
```

**Data Source**:
- Online: IBGE SIDRA API (https://servicodados.ibge.gov.br/api/v3/agregados/6579)
- Offline: `libs/sidra/tab6579_municipios.json` (190KB fallback)

---

### DisplayerFactory

**Purpose**: Factory for creating display components (v0.8.6+).

**File**: `src/html/DisplayerFactory.js`

#### Methods

##### `createPositionDisplayer(document, elementId)`
Creates position displayer.

```javascript
import { DisplayerFactory } from './html/DisplayerFactory.js';

const factory = new DisplayerFactory();
const positionDisplayer = factory.createPositionDisplayer(document, 'coords-output');
```

**Returns**: `HTMLPositionDisplayer`

##### `createAddressDisplayer(document, elementId)`
Creates address displayer.

```javascript
const addressDisplayer = factory.createAddressDisplayer(document, 'address-output');
```

**Returns**: `HTMLAddressDisplayer`

##### `createReferencePlaceDisplayer(document, elementId)`
Creates reference place displayer.

```javascript
const placeDisplayer = factory.createReferencePlaceDisplayer(document, 'place-output');
```

**Returns**: `HTMLReferencePlaceDisplayer`

##### `createHighlightCardsDisplayer(document)`
Creates highlight cards displayer.

```javascript
const cardsDisplayer = factory.createHighlightCardsDisplayer(document);
```

**Returns**: `HTMLHighlightCardsDisplayer`

##### `createSidraDisplayer(document, elementId)` (v0.8.6+)
Creates SIDRA displayer.

```javascript
const sidraDisplayer = factory.createSidraDisplayer(document, 'stats-output');
```

**Returns**: `HTMLSidraDisplayer`

---

## Speech Synthesis APIs

### SpeechSynthesisManager

**Purpose**: Main orchestrator for speech synthesis using composition pattern (v0.8.7-alpha refactored).

**File**: `src/speech/SpeechSynthesisManager.js`

**Architecture** (v0.8.7-alpha):
- Manager/Controller with Composition
- Coordinates 4 focused components:
  - `VoiceLoader` - Voice loading with exponential backoff
  - `VoiceSelector` - Brazilian Portuguese voice selection
  - `SpeechConfiguration` - Rate/pitch parameter management
  - `SpeechQueue` - Priority-based request queue

#### Constructor

```javascript
import { SpeechSynthesisManager } from './speech/SpeechSynthesisManager.js';

const speechManager = new SpeechSynthesisManager();
```

#### Methods

##### `speak(text, priority)`
Queues text for speech synthesis.

```javascript
speechManager.speak('Bem-vindo ao Guia Turístico', 'high');
```

**Parameters**:
- `text` (String) - Text to speak
- `priority` (String) - Priority level: 'high', 'normal', 'low'

**Priority Processing**:
- `high` - Immediate processing (interrupts current)
- `normal` - Standard queue processing
- `low` - Background processing

##### `setRate(rate)`
Sets speech rate.

```javascript
speechManager.setRate(1.2); // 20% faster
```

**Parameters**:
- `rate` (Number) - Rate value (0.1 to 10.0, default: 1.0)

**Automatic Clamping**: Values outside range are clamped with logging

##### `setPitch(pitch)`
Sets speech pitch.

```javascript
speechManager.setPitch(1.0); // Normal pitch
```

**Parameters**:
- `pitch` (Number) - Pitch value (0.0 to 2.0, default: 1.0)

##### `stop()`
Stops current speech and clears queue.

```javascript
speechManager.stop();
```

##### `pause()`
Pauses current speech.

```javascript
speechManager.pause();
```

##### `resume()`
Resumes paused speech.

```javascript
speechManager.resume();
```

**Brazilian Portuguese Optimization**:
- Prioritizes pt-BR voices
- Falls back to pt-* prefix
- Quality scoring: local +10, primary language +20

**Tests**: 69/72 passing (3 skipped for cross-environment compatibility)

---

### VoiceLoader

**Purpose**: Asynchronous voice loading with exponential backoff retry (v0.8.7-alpha).

**File**: `src/speech/VoiceLoader.js`

#### Methods

##### `loadVoices()`
Loads available voices with retry mechanism.

```javascript
import { VoiceLoader } from './speech/VoiceLoader.js';

const loader = new VoiceLoader();
const voices = await loader.loadVoices();
console.log(`Loaded ${voices.length} voices`);
```

**Returns**: `Promise<Array>` - Array of SpeechSynthesisVoice objects

**Retry Strategy**:
- Delays: 100ms → 200ms → 400ms → 800ms → 1600ms → 3200ms → 5000ms (capped)
- Max attempts: 10
- Concurrent load protection

##### `getVoices()`
Gets currently loaded voices (synchronous).

```javascript
const voices = loader.getVoices();
```

**Returns**: `Array` - Cached voices array

##### `hasVoices()`
Checks if voices are loaded.

```javascript
if (loader.hasVoices()) {
  console.log('Voices ready');
}
```

**Returns**: `Boolean` - True if voices loaded

##### `clearCache()`
Clears voice cache.

```javascript
loader.clearCache();
```

---

### VoiceSelector

**Purpose**: Intelligent Brazilian Portuguese voice selection (v0.8.7-alpha).

**File**: `src/speech/VoiceSelector.js`

#### Methods

##### `selectVoice(voices)`
Selects best Brazilian Portuguese voice.

```javascript
import { VoiceSelector } from './speech/VoiceSelector.js';

const selector = new VoiceSelector();
const bestVoice = selector.selectVoice(voices);

if (bestVoice) {
  console.log(`Selected: ${bestVoice.name} (${bestVoice.lang})`);
}
```

**Parameters**:
- `voices` (Array) - Array of SpeechSynthesisVoice objects

**Returns**: `SpeechSynthesisVoice | null` - Best voice or null

**Selection Strategy** (3 levels):
1. **Exact match**: pt-BR language code
2. **Prefix match**: pt-* language codes
3. **Fallback**: First available voice
4. **None**: Returns null

**Voice Quality Scoring**:
- Local voice: +10 points
- Primary language match: +20 points

##### `filterByLanguage(voices, langCode)`
Filters voices by language code.

```javascript
const ptBRVoices = selector.filterByLanguage(voices, 'pt-BR');
```

**Parameters**:
- `voices` (Array) - Voice array
- `langCode` (String) - Language code (e.g., 'pt-BR', 'pt-')

**Returns**: `Array` - Filtered voices

##### `scoreVoice(voice, isExactMatch)`
Scores a voice for selection priority.

```javascript
const score = selector.scoreVoice(voice, true);
```

**Parameters**:
- `voice` (SpeechSynthesisVoice) - Voice to score
- `isExactMatch` (Boolean) - Is exact language match

**Returns**: `Number` - Quality score

##### `getVoiceInfo(voice)`
Gets voice information object.

```javascript
const info = selector.getVoiceInfo(voice);
// { name: "Google português do Brasil", lang: "pt-BR", local: false }
```

**Returns**: `Object` - Voice metadata

---

### SpeechConfiguration

**Purpose**: Rate/pitch parameter validation and management (v0.8.7-alpha).

**File**: `src/speech/SpeechConfiguration.js`

#### Constructor

```javascript
import { SpeechConfiguration } from './speech/SpeechConfiguration.js';

const config = new SpeechConfiguration();
```

#### Methods

##### `setRate(rate)`
Sets and validates speech rate.

```javascript
config.setRate(1.5); // 50% faster
```

**Parameters**:
- `rate` (Number) - Rate value (0.1 to 10.0)

**Validation**: Values automatically clamped to valid range

##### `getRate()`
Gets current rate.

```javascript
const rate = config.getRate(); // 1.5
```

**Returns**: `Number` - Current rate

##### `setPitch(pitch)`
Sets and validates speech pitch.

```javascript
config.setPitch(1.2);
```

**Parameters**:
- `pitch` (Number) - Pitch value (0.0 to 2.0)

##### `getPitch()`
Gets current pitch.

```javascript
const pitch = config.getPitch(); // 1.2
```

**Returns**: `Number` - Current pitch

##### `reset()`
Resets to default values.

```javascript
config.reset();
// rate: 1.0, pitch: 1.0
```

**Valid Ranges**:
- Rate: 0.1 to 10.0 (default: 1.0)
- Pitch: 0.0 to 2.0 (default: 1.0)

**Tests**: 44/44 passing

---

## Utility APIs

### TimerManager

**Purpose**: Centralized timer management preventing memory leaks (v0.8.7+ migration complete).

**File**: `src/utils/TimerManager.js`

**Singleton**: Ensures single instance across application

#### Methods

##### `getInstance()`
Gets singleton instance.

```javascript
import { timerManager } from './utils/TimerManager.js';

const manager = timerManager.getInstance();
```

**Returns**: `TimerManager` - Singleton instance

##### `setInterval(callback, delay, id)`
Creates named interval timer.

```javascript
const timerId = timerManager.setInterval(
  () => console.log('Tick'),
  1000,
  'heartbeat-timer'
);
```

**Parameters**:
- `callback` (Function) - Timer callback
- `delay` (Number) - Delay in milliseconds
- `id` (String) - Unique timer identifier

**Returns**: `String` - Timer ID for tracking

##### `setTimeout(callback, delay, id)`
Creates named timeout timer.

```javascript
const timerId = timerManager.setTimeout(
  () => console.log('Delayed'),
  5000,
  'delayed-action'
);
```

**Parameters**:
- `callback` (Function) - Timer callback
- `delay` (Number) - Delay in milliseconds
- `id` (String) - Unique timer identifier

**Returns**: `String` - Timer ID

##### `clearTimer(id)`
Clears specific timer by ID.

```javascript
timerManager.clearTimer('heartbeat-timer');
```

**Parameters**:
- `id` (String) - Timer identifier

##### `clearAllTimers()`
Clears all tracked timers.

```javascript
timerManager.clearAllTimers();
```

**Usage Pattern**:
```javascript
// ✅ Good - Named timer with cleanup
const id = timerManager.setInterval(callback, 1000, 'my-timer');
// Later...
timerManager.clearTimer('my-timer');

// ❌ Bad - Direct setInterval without tracking
const id = setInterval(callback, 1000); // Memory leak risk!
```

**Migrated Components** (v0.8.7+):
- SpeechSynthesisManager
- VoiceManager
- SpeechQueueProcessor
- Chronometer

---

### Button Status Utility

**Purpose**: Contextual status messages for disabled buttons (v0.8.7-alpha).

**File**: `src/utils/button-status.js`

#### Functions

##### `disableWithReason(button, reason)`
Disables button with status message.

```javascript
import { disableWithReason } from './utils/button-status.js';

const button = document.getElementById('location-btn');
disableWithReason(button, 'Aguardando localização para habilitar');
```

**Parameters**:
- `button` (HTMLElement) - Button element
- `reason` (String) - Status message in Brazilian Portuguese

**Features**:
- Sets `disabled` attribute
- Adds ARIA attributes (`aria-describedby`, `role="status"`, `aria-live="polite"`)
- Color-coded status indicator
- WCAG 2.1 AA accessible

##### `enableWithMessage(button, message)`
Enables button with success message.

```javascript
import { enableWithMessage } from './utils/button-status.js';

enableWithMessage(button, 'Localização obtida com sucesso');
```

**Parameters**:
- `button` (HTMLElement) - Button element
- `message` (String) - Success message

##### `updateButtonStatus(button, message, type)`
Updates button status without changing enabled state.

```javascript
import { updateButtonStatus } from './utils/button-status.js';

updateButtonStatus(button, 'Processando...', 'info');
```

**Parameters**:
- `button` (HTMLElement) - Button element
- `message` (String) - Status message
- `type` (String) - Status type: 'info', 'warning', 'success', 'error'

**Status Types**:
- `info` - Blue indicator
- `warning` - Orange indicator
- `success` - Green indicator
- `error` - Red indicator

##### `removeButtonStatus(button)`
Removes status message.

```javascript
import { removeButtonStatus } from './utils/button-status.js';

removeButtonStatus(button);
```

**Parameters**:
- `button` (HTMLElement) - Button element

---

## Configuration

### Default Constants

**File**: `src/config/defaults.js`

#### Application Metadata

```javascript
import { APP_VERSION, APP_NAME } from './config/defaults.js';

console.log(APP_NAME);     // "Guia Turístico"
console.log(APP_VERSION);  // "0.8.7-alpha"
```

#### Timing Configuration

```javascript
import { 
  MINIMUM_TIME_CHANGE, 
  MINIMUM_DISTANCE_CHANGE 
} from './config/defaults.js';

// Position update thresholds
console.log(MINIMUM_TIME_CHANGE);      // 30000 (30 seconds)
console.log(MINIMUM_DISTANCE_CHANGE);  // 20 (meters)
```

#### Event Names

```javascript
import { ADDRESS_FETCHED_EVENT } from './config/defaults.js';

// Use for consistency across components
geocoder.addObserver((event) => {
  if (event === ADDRESS_FETCHED_EVENT) {
    console.log('Address fetched');
  }
});
```

**Available Constants**:
- `APP_VERSION` - Application version
- `APP_NAME` - Application name
- `MINIMUM_TIME_CHANGE` - Position update time threshold (30s)
- `MINIMUM_DISTANCE_CHANGE` - Position update distance threshold (20m)
- `ADDRESS_FETCHED_EVENT` - Address fetch event name
- `BUTTON_STATUS_MESSAGES` - Brazilian Portuguese button status messages (v0.8.7-alpha)

**Usage Guidelines**:
- ✅ Import constants for consistency
- ✅ Avoid hardcoded strings
- ✅ Use for event names, thresholds, configuration

---

## Quick Reference

### Common Workflows

#### Getting User Location

```javascript
import { GeolocationService } from './services/GeolocationService.js';
import { PositionManager } from './core/PositionManager.js';
import { GeoPosition } from './core/GeoPosition.js';

const service = new GeolocationService();
const manager = PositionManager.getInstance();

service.getCurrentPosition({ enableHighAccuracy: true })
  .then(pos => {
    const geoPos = new GeoPosition(
      pos.coords.latitude,
      pos.coords.longitude,
      pos.coords.accuracy,
      Date.now()
    );
    manager.setCurrentPosition(geoPos);
  });
```

#### Reverse Geocoding

```javascript
import { ReverseGeocoder } from './services/ReverseGeocoder.js';
import { AddressExtractor } from './data/AddressExtractor.js';

const geocoder = new ReverseGeocoder(-23.5505, -46.6333);
const extractor = new AddressExtractor();

const rawAddress = await geocoder.fetchAddress();
const standardAddress = extractor.extract(rawAddress);

console.log(standardAddress.municipioCompleto()); // "São Paulo, SP"
```

#### Speech Synthesis

```javascript
import { SpeechSynthesisManager } from './speech/SpeechSynthesisManager.js';

const speech = new SpeechSynthesisManager();
speech.setRate(1.0);
speech.setPitch(1.0);
speech.speak('Bem-vindo ao Guia Turístico', 'high');
```

#### Displaying Data

```javascript
import { DisplayerFactory } from './html/DisplayerFactory.js';

const factory = new DisplayerFactory();
const posDisplayer = factory.createPositionDisplayer(document, 'coords');
const addrDisplayer = factory.createAddressDisplayer(document, 'address');

posDisplayer.display(geoPosition);
addrDisplayer.display(standardAddress);
```

---

## Browser Compatibility

**Minimum Requirements**:
- Modern browser with ES6+ support
- Geolocation API support
- SpeechSynthesis API (optional, for voice features)

**Tested Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## External API Dependencies

### OpenStreetMap Nominatim
- **URL**: `https://nominatim.openstreetmap.org/reverse`
- **Rate Limit**: 1 request/second
- **Usage Policy**: https://operations.osmfoundation.org/policies/nominatim/

### IBGE (Brazilian Institute of Geography and Statistics)
- **Location API**: `https://servicodados.ibge.gov.br/api/v1/localidades/estados/`
- **SIDRA API**: `https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/-6/variaveis/9324`
- **Offline Fallback**: `libs/sidra/tab6579_municipios.json` (190KB)

### Google Maps
- **Map Links**: `https://www.google.com/maps?q=lat,lon`
- **Street View**: `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=lat,lon`

---

## Migration Notes

### v0.8.7-alpha Changes

**Metropolitan Region Support**:
- Added `regiaoMetropolitana` field to `BrazilianStandardAddress`
- Added `regiaoMetropolitanaFormatada()` method
- Updated `AddressExtractor` to extract from Nominatim `county` field
- Added `displayRegiaoMetropolitana()` to `HTMLHighlightCardsDisplayer`

**Speech Synthesis Refactoring**:
- Refactored to composition pattern
- New classes: `VoiceLoader`, `VoiceSelector`, `SpeechConfiguration`
- Replaced circular timer with exponential backoff
- Improved Brazilian Portuguese voice selection

**Button Status Messages**:
- New utility: `src/utils/button-status.js`
- WCAG 2.1 AA accessible button status indicators
- Brazilian Portuguese status messages
- Color-coded status types

**Timer Management**:
- Migrated all components to `TimerManager`
- Prevents memory leaks in long-running sessions
- Named timer tracking for debugging

### v0.8.6 Changes

**ServiceCoordinator Enhancement**:
- Added SIDRA displayer management
- Factory method: `createSidraDisplayer()`

### v0.7.2 Changes

**Position Update Logic**:
- Distance threshold: 20 meters
- Time threshold: 30 seconds
- Updates trigger on EITHER threshold

**SIDRA Integration**:
- Added `HTMLSidraDisplayer` class
- Observer pattern for automatic updates
- Offline fallback data (libs/sidra/)

**Reference Place Categorization**:
- Added `calculateCategory()` method
- Supports: place, shop, amenity, railway, building

### v0.7.1 Changes

**Highlight Cards**:
- Added `HTMLHighlightCardsDisplayer`
- Municipality display with state code
- Neighborhood tracking

---

## Support and Resources

**Repository**: https://github.com/mpbarbosa/guia_turistico  
**Documentation**: `/docs/`  
**Examples**: `/examples/`  
**Tests**: `__tests__/`  

**Related Projects**:
- guia.js: https://github.com/mpbarbosa/guia_js
- ibira.js: Brazilian IBGE integration

---

**Last Updated**: 2026-02-11  
**Version**: 0.8.7-alpha  
**Status**: ✅ Complete and Validated
