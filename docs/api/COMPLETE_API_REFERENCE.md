# Complete API Reference - Guia Turístico v0.8.7-alpha

---
**Last Updated**: 2026-02-11  
**Version**: 0.8.7-alpha  
**Status**: Complete Reference

---

## Table of Contents

1. [Core Module](#core-module)
2. [Services Module](#services-module)
3. [Data Module](#data-module)
4. [HTML/Display Module](#htmldisplay-module)
5. [Speech Module](#speech-module)
6. [Timing Module](#timing-module)
7. [Utils Module](#utils-module)
8. [Coordination Module](#coordination-module)
9. [Config Module](#config-module)
10. [Status Module](#status-module)
11. [Components Module](#components-module)

---

## Core Module

Location: `src/core/`

### GeoPosition

Immutable wrapper for browser Geolocation API Position object with validation and utilities.

#### Constructor

```javascript
import GeoPosition from './core/GeoPosition.js';

const geoPosition = new GeoPosition(position);
```

**Parameters:**
- `position` (Position): Browser Geolocation API Position object

**Throws:**
- `TypeError`: If position is null or undefined
- `TypeError`: If position.coords is missing

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `latitude` | Number | Geographic latitude in decimal degrees |
| `longitude` | Number | Geographic longitude in decimal degrees |
| `accuracy` | Number | Accuracy in meters |
| `accuracyQuality` | String | Human-readable accuracy rating |
| `altitude` | Number\|null | Altitude in meters above mean sea level |
| `altitudeAccuracy` | Number\|null | Altitude accuracy in meters |
| `heading` | Number\|null | Direction of travel in degrees (0-360) |
| `speed` | Number\|null | Speed in meters per second |
| `timestamp` | Number | Unix timestamp of position capture |

#### Methods

##### `static getAccuracyQuality(accuracy)`

Convert accuracy value to quality rating.

```javascript
const quality = GeoPosition.getAccuracyQuality(15); // "excellent"
```

**Parameters:**
- `accuracy` (Number): Accuracy in meters

**Returns:** String - One of: "excellent" (0-20m), "good" (20-50m), "fair" (50-100m), "poor" (>100m)

##### `calculateAccuracyQuality()`

Get accuracy quality for this position.

```javascript
const quality = geoPosition.calculateAccuracyQuality();
```

**Returns:** String - Accuracy quality rating

##### `distanceTo(otherPosition)`

Calculate distance to another position using Haversine formula.

```javascript
const distance = position1.distanceTo(position2); // meters
```

**Parameters:**
- `otherPosition` (GeoPosition): Target position

**Returns:** Number - Distance in meters

**Throws:**
- `TypeError`: If otherPosition is not a GeoPosition instance

##### `toString()`

Get string representation of position.

```javascript
console.log(geoPosition.toString());
// Output: "GeoPosition(lat: -23.5505, lon: -46.6333, accuracy: 15m)"
```

**Returns:** String - Formatted position summary

---

### PositionManager

Singleton manager for current device geographic position with observer notification.

#### Singleton Access

```javascript
import PositionManager from './core/PositionManager.js';

const positionManager = PositionManager.getInstance();
```

#### Properties (Read-Only)

| Property | Type | Description |
|----------|------|-------------|
| `latitude` | Number\|null | Current latitude |
| `longitude` | Number\|null | Current longitude |
| `accuracy` | Number\|null | Current accuracy in meters |
| `accuracyQuality` | String\|null | Current accuracy quality |
| `altitude` | Number\|null | Current altitude |
| `heading` | Number\|null | Current heading |
| `speed` | Number\|null | Current speed |
| `timestamp` | Number\|null | Current timestamp |

#### Methods

##### `update(position)`

Update current position and notify observers.

```javascript
positionManager.update(newPosition);
```

**Parameters:**
- `position` (Position): New browser Position object

**Fires:**
- `POSITION_UPDATE` event to all observers
- `ADDRESS_FETCHED_EVENT` after geocoding

##### `subscribe(observer)`

Subscribe to position updates.

```javascript
const observer = {
  update: (posManager, event, data, error) => {
    console.log('Position updated:', data);
  }
};

positionManager.subscribe(observer);
```

**Parameters:**
- `observer` (Object): Object with `update(posManager, event, data, error)` method

##### `unsubscribe(observer)`

Remove observer subscription.

```javascript
positionManager.unsubscribe(observer);
```

**Parameters:**
- `observer` (Object): Previously subscribed observer

---

### ObserverSubject

Base class for observer pattern implementation with both object and function observers.

#### Constructor

```javascript
import ObserverSubject from './core/ObserverSubject.js';

const subject = new ObserverSubject();
```

#### Methods

##### `subscribe(observer)`

Subscribe object observer with `update()` method.

```javascript
subject.subscribe({
  update: (...args) => console.log('Updated:', args)
});
```

**Parameters:**
- `observer` (Object): Object with `update()` method

##### `subscribeFunction(fn)`

Subscribe function observer.

```javascript
subject.subscribeFunction((data) => console.log('Data:', data));
```

**Parameters:**
- `fn` (Function): Callback function

**Returns:** Function - The subscribed function for unsubscribing

##### `notifyObservers(...args)`

Notify all object observers.

```javascript
subject.notifyObservers('event', {data: 'value'});
```

**Parameters:**
- `...args` (any): Arguments passed to observer `update()` methods

##### `notifyFunctionObservers(...args)`

Notify all function observers.

```javascript
subject.notifyFunctionObservers({status: 'success'});
```

**Parameters:**
- `...args` (any): Arguments passed to function observers

##### `clearAllObservers()`

Remove all observers (objects and functions).

```javascript
subject.clearAllObservers();
```

---

### GeocodingState

Position state manager with callback subscription for geocoding workflow.

#### Constructor

```javascript
import GeocodingState from './core/GeocodingState.js';

const state = new GeocodingState();
```

#### Methods

##### `setPosition(position)`

Update position and notify subscribers.

```javascript
state.setPosition(geoPosition);
```

**Parameters:**
- `position` (GeoPosition): New position

**Fires:** Calls all subscribed callbacks with new position

##### `getCurrentPosition()`

Get current position.

```javascript
const position = state.getCurrentPosition();
```

**Returns:** GeoPosition|null

##### `getCurrentCoordinates()`

Get current coordinates object.

```javascript
const coords = state.getCurrentCoordinates();
// Returns: {latitude: -23.5505, longitude: -46.6333}
```

**Returns:** Object|null - Object with `latitude` and `longitude` properties

##### `hasPosition()`

Check if position is set.

```javascript
if (state.hasPosition()) {
  // Position available
}
```

**Returns:** Boolean

##### `subscribe(callback)`

Subscribe to position updates.

```javascript
state.subscribe((position) => {
  console.log('New position:', position);
});
```

**Parameters:**
- `callback` (Function): Function called with new position

##### `unsubscribe(callback)`

Remove callback subscription.

```javascript
state.unsubscribe(callback);
```

**Parameters:**
- `callback` (Function): Previously subscribed callback

---

## Services Module

Location: `src/services/`

### GeolocationService

Browser Geolocation API wrapper with permission checking and watch management.

#### Constructor

```javascript
import GeolocationService from './services/GeolocationService.js';

const geoService = new GeolocationService(positionManager);
```

**Parameters:**
- `positionManager` (PositionManager): Singleton position manager instance

#### Methods

##### `checkPermissions()`

Check geolocation permission status.

```javascript
const permission = await geoService.checkPermissions();
// Returns: 'granted', 'denied', or 'prompt'
```

**Returns:** Promise<String> - Permission state

**Browser Support:** May return 'unavailable' if Permissions API not supported

##### `getSingleLocationUpdate()`

Get one-time location update.

```javascript
const position = await geoService.getSingleLocationUpdate();
```

**Returns:** Promise<Position> - Browser Position object

**Throws:** Promise rejection with GeolocationPositionError

##### `watchCurrentLocation()`

Start continuous location tracking.

```javascript
const watchId = geoService.watchCurrentLocation();
```

**Returns:** Number - Watch ID for stopping

**Side Effects:**
- Updates PositionManager on each position update
- Stores watch ID internally

##### `stopWatching()`

Stop continuous location tracking.

```javascript
geoService.stopWatching();
```

**Side Effects:**
- Clears watch ID
- Stops position updates

##### `getLastKnownPosition()`

Get most recent position from PositionManager.

```javascript
const lastPosition = geoService.getLastKnownPosition();
```

**Returns:** Object|null - Position data or null

##### `isCurrentlyWatching()`

Check if actively watching position.

```javascript
const isWatching = geoService.isCurrentlyWatching();
```

**Returns:** Boolean

##### `getCurrentWatchId()`

Get current watch ID.

```javascript
const watchId = geoService.getCurrentWatchId();
```

**Returns:** Number|null - Watch ID or null

##### `hasPendingRequest()`

Check if location request is pending.

```javascript
const isPending = geoService.hasPendingRequest();
```

**Returns:** Boolean

---

### ReverseGeocoder

Reverse geocoding service using OpenStreetMap Nominatim API with caching and observer notification.

#### Constructor

```javascript
import ReverseGeocoder from './services/ReverseGeocoder.js';

const geocoder = new ReverseGeocoder(latitude, longitude);
```

**Parameters:**
- `latitude` (Number): Geographic latitude
- `longitude` (Number): Geographic longitude

#### Methods

##### `setCoordinates(lat, lon)`

Update coordinates for geocoding.

```javascript
geocoder.setCoordinates(-23.5505, -46.6333);
```

**Parameters:**
- `lat` (Number): Latitude
- `lon` (Number): Longitude

##### `getCacheKey()`

Get cache key for current coordinates.

```javascript
const key = geocoder.getCacheKey();
// Returns: "reverse:lat=-23.5505,lon=-46.6333"
```

**Returns:** String - Cache key

##### `fetchAddress()`

Fetch address from Nominatim API.

```javascript
const addressData = await geocoder.fetchAddress();
```

**Returns:** Promise<Object> - Raw Nominatim response

**Throws:** Promise rejection on API error

**API Endpoint:** `https://nominatim.openstreetmap.org/reverse`

**Query Parameters:**
- `format=json`
- `lat`, `lon`
- `zoom=18`
- `addressdetails=1`
- `extratags=1`

##### `reverseGeocode()`

Reverse geocode with caching.

```javascript
const address = await geocoder.reverseGeocode();
```

**Returns:** Promise<Object> - Cached or freshly fetched address

##### `update(positionManager, posEvent, loading, error)`

Observer update method for PositionManager events.

```javascript
geocoder.update(positionManager, 'POSITION_UPDATE', false, null);
```

**Parameters:**
- `positionManager` (PositionManager): Position manager instance
- `posEvent` (String): Event type
- `loading` (Boolean): Loading state
- `error` (Error|null): Error if any

**Side Effects:**
- Fetches address on position update
- Notifies observers with ADDRESS_FETCHED_EVENT

---

### ChangeDetectionCoordinator

Monitors address component changes (logradouro, bairro, municipio) and notifies observers.

#### Constructor

```javascript
import ChangeDetectionCoordinator from './services/ChangeDetectionCoordinator.js';

const coordinator = new ChangeDetectionCoordinator();
```

#### Methods

##### `setAddressDataExtractor(extractor)`

Set address data extractor instance.

```javascript
coordinator.setAddressDataExtractor(addressDataExtractor);
```

**Parameters:**
- `extractor` (AddressDataExtractor): Address extraction instance

##### `setCurrentPosition(position)`

Update current position for change detection.

```javascript
coordinator.setCurrentPosition(geoPosition);
```

**Parameters:**
- `position` (GeoPosition): Current position

##### `setupChangeDetection()`

Setup all change detection observers.

```javascript
coordinator.setupChangeDetection();
```

**Side Effects:**
- Subscribes to logradouro changes
- Subscribes to bairro changes
- Subscribes to municipio changes

##### `removeAllChangeDetection()`

Remove all change detection observers.

```javascript
coordinator.removeAllChangeDetection();
```

##### `setupLogradouroChangeDetection()`

Setup street name change detection.

```javascript
coordinator.setupLogradouroChangeDetection();
```

##### `setupBairroChangeDetection()`

Setup neighborhood change detection.

```javascript
coordinator.setupBairroChangeDetection();
```

##### `setupMunicipioChangeDetection()`

Setup municipality change detection.

```javascript
coordinator.setupMunicipioChangeDetection();
```

##### `notifyLogradouroChangeObservers(details)`

Notify observers of street name change.

```javascript
coordinator.notifyLogradouroChangeObservers({
  oldValue: 'Rua A',
  newValue: 'Rua B',
  position: geoPosition
});
```

**Parameters:**
- `details` (Object): Change details with `oldValue`, `newValue`, `position`

---

## Data Module

Location: `src/data/`

### BrazilianStandardAddress

Standardized address format following IBGE conventions with metropolitan region support.

#### Constructor

```javascript
import BrazilianStandardAddress from './data/BrazilianStandardAddress.js';

const address = new BrazilianStandardAddress({
  logradouro: 'Av. Paulista',
  numero: '1578',
  bairro: 'Bela Vista',
  municipio: 'São Paulo',
  uf: 'SP',
  cep: '01310-200',
  regiaoMetropolitana: 'Região Metropolitana de São Paulo'
});
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `logradouro` | String | Street name (thoroughfare) |
| `numero` | String | Street number |
| `complemento` | String | Complement (apt, suite, etc.) |
| `bairro` | String | Neighborhood |
| `municipio` | String | Municipality name |
| `uf` | String | State abbreviation (2 letters) |
| `cep` | String | Postal code (CEP) |
| `pais` | String | Country (default: 'Brasil') |
| `regiaoMetropolitana` | String | Metropolitan region name (v0.8.7+) |

#### Methods

##### `municipioCompleto()`

Get municipality with state abbreviation.

```javascript
const full = address.municipioCompleto();
// Returns: "São Paulo, SP"
```

**Returns:** String - "Município, UF" format

##### `regiaoMetropolitanaFormatada()`

Get formatted metropolitan region.

```javascript
const metro = address.regiaoMetropolitanaFormatada();
// Returns: "Região Metropolitana de São Paulo"
```

**Returns:** String|null - Formatted name or null

##### `toString()`

Get full formatted address.

```javascript
console.log(address.toString());
// Output: "Av. Paulista, 1578, Bela Vista, São Paulo, SP, 01310-200, Brasil"
```

**Returns:** String - Complete address

---

### AddressExtractor

Extracts BrazilianStandardAddress and ReferencePlace from raw Nominatim geocoding data.

#### Constructor

```javascript
import AddressExtractor from './data/AddressExtractor.js';

const extractor = new AddressExtractor();
```

#### Methods

##### `extractAddress(raw)`

Extract standardized address from Nominatim response.

```javascript
const address = extractor.extractAddress(nominatimData);
```

**Parameters:**
- `raw` (Object): Nominatim API response

**Returns:** BrazilianStandardAddress - Extracted address object

**Extraction Logic:**
- `logradouro`: From `road` field
- `numero`: From `house_number` field
- `bairro`: From `suburb`, `neighbourhood`, or `city_district`
- `municipio`: From `city`, `town`, `municipality`, or `village`
- `uf`: From `state` (mapped to abbreviation)
- `cep`: From `postcode`
- `regiaoMetropolitana`: From `county` field (v0.8.7+)

##### `extractReferencePlace(raw)`

Extract reference place from Nominatim response.

```javascript
const refPlace = extractor.extractReferencePlace(nominatimData);
```

**Parameters:**
- `raw` (Object): Nominatim API response

**Returns:** ReferencePlace - Extracted reference place

**Extracts:**
- OSM place type
- Amenity classification
- Historic designation
- Category and subcategory

---

### AddressCache

LRU cache for address data with change detection and callback management.

#### Constructor

```javascript
import AddressCache from './data/AddressCache.js';

const cache = new AddressCache({
  maxSize: 100,
  onLogradouroChange: (details) => console.log('Street changed:', details),
  onBairroChange: (details) => console.log('Neighborhood changed:', details),
  onMunicipioChange: (details) => console.log('City changed:', details)
});
```

**Parameters (Options Object):**
- `maxSize` (Number): Maximum cache entries (default: 100)
- `onLogradouroChange` (Function): Street name change callback
- `onBairroChange` (Function): Neighborhood change callback
- `onMunicipioChange` (Function): Municipality change callback

#### Methods

##### `updateAddress(cacheKey, address, raw)`

Update address in cache and trigger change detection.

```javascript
cache.updateAddress(key, brazilianAddress, rawNominatim);
```

**Parameters:**
- `cacheKey` (String): Cache key
- `address` (BrazilianStandardAddress): Extracted address
- `raw` (Object): Raw Nominatim data

**Side Effects:**
- Updates cache
- Triggers change callbacks if components changed
- Evicts oldest entry if maxSize exceeded

##### `getCurrentAddress()`

Get current address.

```javascript
const current = cache.getCurrentAddress();
```

**Returns:** BrazilianStandardAddress|null

##### `getPreviousAddress()`

Get previous address.

```javascript
const previous = cache.getPreviousAddress();
```

**Returns:** BrazilianStandardAddress|null

##### `hasAddressHistory()`

Check if previous address exists.

```javascript
if (cache.hasAddressHistory()) {
  // Can compare with previous
}
```

**Returns:** Boolean

---

### ReferencePlace

Geographic reference classification from OpenStreetMap tags.

#### Constructor

```javascript
import ReferencePlace from './data/ReferencePlace.js';

const refPlace = new ReferencePlace({
  type: 'amenity',
  name: 'Starbucks',
  amenity: 'cafe',
  category: 'food'
});
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `type` | String | OSM place type |
| `name` | String | Place name |
| `amenity` | String | Amenity classification |
| `place` | String | Place classification |
| `category` | String | Category |
| `subcategory` | String | Subcategory |

#### Methods

##### `calculateCategory()`

Calculate category from type and amenity.

```javascript
const category = refPlace.calculateCategory();
// Returns: 'restaurant', 'shop', 'transport', etc.
```

**Returns:** String|null - Calculated category

**Supported Types:**
- `amenity`: cafe, restaurant, bank, hospital, school, etc.
- `shop`: supermarket, bakery, clothing, etc.
- `place`: city, town, village, suburb
- `railway`: station, platform
- `building`: residential, commercial, public

---

## HTML/Display Module

Location: `src/html/`

### DisplayerFactory

Factory for creating HTML displayer instances.

#### Static Methods

##### `create(type)`

Create displayer instance by type.

```javascript
import { DisplayerFactory } from './html/DisplayerFactory.js';

const positionDisplayer = DisplayerFactory.create('position');
const addressDisplayer = DisplayerFactory.create('address');
const sidraDisplayer = DisplayerFactory.create('sidra');
```

**Parameters:**
- `type` (String): Displayer type - 'position', 'address', 'referencePlace', 'highlightCards', 'sidra'

**Returns:** Object - Displayer instance

**Throws:** Error if unknown type

---

### HTMLPositionDisplayer

Displays geographic coordinates with Google Maps integration.

#### Constructor

```javascript
import HTMLPositionDisplayer from './html/HTMLPositionDisplayer.js';

const displayer = new HTMLPositionDisplayer();
```

#### Methods

##### `display(position, element)`

Display position coordinates in element.

```javascript
displayer.display(geoPosition, document.getElementById('coords'));
```

**Parameters:**
- `position` (GeoPosition): Position to display
- `element` (HTMLElement): Target DOM element

**Side Effects:**
- Updates element innerHTML with formatted coordinates
- Adds Google Maps link

**Format:**
```
📍 Latitude: -23.5505°
📍 Longitude: -46.6333°
🎯 Accuracy: 15m (excellent)
🗺️ View on Google Maps
```

---

### HTMLAddressDisplayer

Displays formatted Brazilian addresses.

#### Constructor

```javascript
import HTMLAddressDisplayer from './html/HTMLAddressDisplayer.js';

const displayer = new HTMLAddressDisplayer();
```

#### Methods

##### `display(address, element)`

Display address in element.

```javascript
displayer.display(brazilianAddress, document.getElementById('address'));
```

**Parameters:**
- `address` (BrazilianStandardAddress): Address to display
- `element` (HTMLElement): Target DOM element

**Side Effects:**
- Updates element innerHTML with formatted address

**Format:**
```
📫 Av. Paulista, 1578
🏘️ Bairro: Bela Vista
🏙️ Município: São Paulo, SP
📮 CEP: 01310-200
```

---

### HTMLHighlightCardsDisplayer

Displays municipality and neighborhood highlight cards with metropolitan region support.

#### Constructor

```javascript
import HTMLHighlightCardsDisplayer from './html/HTMLHighlightCardsDisplayer.js';

const displayer = new HTMLHighlightCardsDisplayer();
```

#### Methods

##### `displayMunicipioCard(address, element)`

Display municipality card.

```javascript
displayer.displayMunicipioCard(address, cardElement);
```

**Parameters:**
- `address` (BrazilianStandardAddress): Address with municipality data
- `element` (HTMLElement): Target card element

**Card Content (v0.8.7+):**
```
┌─────────────────────────────────┐
│ 🏛️ Município                    │
│ Região Metropolitana do Recife │ ← NEW!
│ Recife, PE                     │
└─────────────────────────────────┘
```

##### `displayBairroCard(address, element)`

Display neighborhood card.

```javascript
displayer.displayBairroCard(address, cardElement);
```

**Parameters:**
- `address` (BrazilianStandardAddress): Address with neighborhood data
- `element` (HTMLElement): Target card element

**Card Content:**
```
┌──────────────────┐
│ 🏘️ Bairro        │
│ Bela Vista      │
└──────────────────┘
```

---

### HTMLSidraDisplayer

Displays IBGE SIDRA demographic data with loading/error states.

#### Constructor

```javascript
import HTMLSidraDisplayer from './html/HTMLSidraDisplayer.js';

const displayer = new HTMLSidraDisplayer();
```

#### Methods

##### `displayLoading(element)`

Show loading state.

```javascript
displayer.displayLoading(sidraElement);
```

**Parameters:**
- `element` (HTMLElement): Target element

**Loading UI:**
```
⏳ Carregando dados do IBGE...
```

##### `displayError(error, element)`

Show error state.

```javascript
displayer.displayError(new Error('API error'), sidraElement);
```

**Parameters:**
- `error` (Error): Error object
- `element` (HTMLElement): Target element

##### `display(data, element)`

Display SIDRA data.

```javascript
displayer.display({
  municipality: 'Recife',
  population: 1645727,
  year: 2023
}, sidraElement);
```

**Parameters:**
- `data` (Object): SIDRA data with `municipality`, `population`, `year`
- `element` (HTMLElement): Target element

**Display Format:**
```
📊 População (IBGE SIDRA)
🏙️ Município: Recife
👥 População estimada: 1.645.727
📅 Ano: 2023
```

---

## Speech Module

Location: `src/speech/`

### SpeechSynthesisManager

Main orchestrator for speech synthesis with queue management and Brazilian Portuguese optimization.

#### Constructor

```javascript
import SpeechSynthesisManager from './speech/SpeechSynthesisManager.js';

const manager = new SpeechSynthesisManager();
```

#### Methods

##### `speak(text, options)`

Speak text with configuration.

```javascript
manager.speak('Olá, bem-vindo!', {
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  lang: 'pt-BR',
  onEnd: () => console.log('Finished'),
  onError: (err) => console.error('Error:', err)
});
```

**Parameters:**
- `text` (String): Text to speak
- `options` (Object): Configuration object
  - `rate` (Number): Speech rate 0.1-10.0 (default: 1.0)
  - `pitch` (Number): Voice pitch 0.0-2.0 (default: 1.0)
  - `volume` (Number): Volume 0.0-1.0 (default: 1.0)
  - `lang` (String): Language code (default: 'pt-BR')
  - `onEnd` (Function): Completion callback
  - `onError` (Function): Error callback

**Side Effects:**
- Enqueues speech item
- Starts queue processing if not running

##### `pause()`

Pause current speech.

```javascript
manager.pause();
```

##### `resume()`

Resume paused speech.

```javascript
manager.resume();
```

##### `stop()`

Stop all speech and clear queue.

```javascript
manager.stop();
```

**Side Effects:**
- Cancels current speech
- Clears queue
- Resets state

##### `getAvailableVoices()`

Get available system voices.

```javascript
const voices = manager.getAvailableVoices();
```

**Returns:** Promise<Array<SpeechSynthesisVoice>>

##### `selectBestVoice(lang)`

Select best voice for language.

```javascript
const voice = await manager.selectBestVoice('pt-BR');
```

**Parameters:**
- `lang` (String): Language code

**Returns:** Promise<SpeechSynthesisVoice|null>

**Selection Priority:**
1. Exact language match (pt-BR)
2. Language prefix match (pt-*)
3. First available voice
4. null

---

### VoiceLoader

Asynchronous voice loading with exponential backoff retry.

#### Constructor

```javascript
import VoiceLoader from './speech/VoiceLoader.js';

const loader = new VoiceLoader();
```

#### Methods

##### `loadVoices()`

Load available voices with retry.

```javascript
const voices = await loader.loadVoices();
```

**Returns:** Promise<Array<SpeechSynthesisVoice>>

**Retry Strategy:**
- Initial delay: 100ms
- Exponential backoff: 100ms → 200ms → 400ms → 800ms → 1600ms → 3200ms
- Max delay: 5000ms
- Max attempts: 10
- Concurrent load protection

**Throws:** Promise rejection after max retries

##### `getVoices()`

Get cached voices without loading.

```javascript
const voices = loader.getVoices();
```

**Returns:** Array<SpeechSynthesisVoice> - Empty array if not loaded

##### `hasVoices()`

Check if voices are loaded.

```javascript
if (loader.hasVoices()) {
  // Voices available
}
```

**Returns:** Boolean

##### `clearCache()`

Clear voice cache.

```javascript
loader.clearCache();
```

---

### VoiceSelector

Intelligent voice selection with quality scoring.

#### Constructor

```javascript
import VoiceSelector from './speech/VoiceSelector.js';

const selector = new VoiceSelector(availableVoices);
```

**Parameters:**
- `voices` (Array<SpeechSynthesisVoice>): Available voices

#### Methods

##### `selectVoice(language)`

Select best voice for language.

```javascript
const voice = selector.selectVoice('pt-BR');
```

**Parameters:**
- `language` (String): Target language code

**Returns:** SpeechSynthesisVoice|null

**Selection Strategy:**
1. Exact match (pt-BR): +20 points
2. Prefix match (pt-*): +10 points
3. Local voice: +10 points
4. Returns highest scored voice

##### `filterByLanguage(language)`

Filter voices by language.

```javascript
const ptVoices = selector.filterByLanguage('pt-BR');
```

**Parameters:**
- `language` (String): Language code

**Returns:** Array<SpeechSynthesisVoice> - Matching voices

##### `scoreVoice(voice, language)`

Calculate voice quality score.

```javascript
const score = selector.scoreVoice(voice, 'pt-BR');
```

**Parameters:**
- `voice` (SpeechSynthesisVoice): Voice to score
- `language` (String): Target language

**Returns:** Number - Quality score

**Scoring:**
- Exact language match: +20
- Prefix match: +10
- Local voice: +10
- Primary language: +20

##### `getVoiceInfo(voice)`

Get voice information.

```javascript
const info = selector.getVoiceInfo(voice);
// Returns: {name: 'Google português do Brasil', lang: 'pt-BR', local: false, default: true}
```

**Parameters:**
- `voice` (SpeechSynthesisVoice): Voice

**Returns:** Object - Voice metadata

---

### SpeechConfiguration

Speech synthesis parameter validation and management.

#### Constructor

```javascript
import SpeechConfiguration from './speech/SpeechConfiguration.js';

const config = new SpeechConfiguration();
```

#### Methods

##### `setRate(rate)`

Set speech rate with validation.

```javascript
config.setRate(1.5);
```

**Parameters:**
- `rate` (Number): Speech rate 0.1-10.0

**Side Effects:**
- Clamps value to valid range
- Logs warning if clamped

##### `setPitch(pitch)`

Set voice pitch with validation.

```javascript
config.setPitch(1.2);
```

**Parameters:**
- `pitch` (Number): Voice pitch 0.0-2.0

**Side Effects:**
- Clamps value to valid range
- Logs warning if clamped

##### `getRate()`

Get current rate.

```javascript
const rate = config.getRate();
```

**Returns:** Number - Current rate

##### `getPitch()`

Get current pitch.

```javascript
const pitch = config.getPitch();
```

**Returns:** Number - Current pitch

##### `reset()`

Reset to default configuration.

```javascript
config.reset();
```

**Side Effects:**
- Sets rate to 1.0
- Sets pitch to 1.0

---

## Timing Module

Location: `src/timing/`

### Chronometer

Elapsed time tracking with observer pattern for performance monitoring.

#### Constructor

```javascript
import Chronometer from './timing/Chronometer.js';

const chrono = new Chronometer();
```

#### Methods

##### `start()`

Start timing.

```javascript
chrono.start();
```

**Side Effects:**
- Records start time
- Sets state to 'running'
- Notifies observers

##### `stop()`

Stop timing.

```javascript
const elapsed = chrono.stop();
```

**Returns:** Number - Elapsed milliseconds

**Side Effects:**
- Records stop time
- Sets state to 'stopped'
- Notifies observers

##### `pause()`

Pause timing.

```javascript
chrono.pause();
```

**Side Effects:**
- Records pause time
- Sets state to 'paused'
- Preserves elapsed time

##### `resume()`

Resume from pause.

```javascript
chrono.resume();
```

**Side Effects:**
- Adjusts start time
- Sets state to 'running'
- Continues from paused time

##### `getElapsed()`

Get current elapsed time.

```javascript
const elapsed = chrono.getElapsed();
```

**Returns:** Number - Milliseconds elapsed

##### `reset()`

Reset chronometer.

```javascript
chrono.reset();
```

**Side Effects:**
- Clears all times
- Sets state to 'idle'
- Notifies observers

##### `subscribe(observer)`

Subscribe to timing events.

```javascript
chrono.subscribe({
  update: (event, data) => {
    console.log(`Event: ${event}, Elapsed: ${data.elapsed}ms`);
  }
});
```

**Parameters:**
- `observer` (Object): Observer with `update(event, data)` method

**Events:**
- `'started'`: Timing started
- `'stopped'`: Timing stopped
- `'paused'`: Timing paused
- `'resumed'`: Timing resumed
- `'reset'`: Chronometer reset

---

## Utils Module

Location: `src/utils/`

### logger

Centralized logging facility with log levels.

#### Functions

##### `log(message, ...params)`

Log informational message.

```javascript
import { log } from './utils/logger.js';

log('User clicked button', { buttonId: 'submit' });
```

**Parameters:**
- `message` (String): Log message
- `...params` (any): Additional parameters

**Side Effects:**
- Writes to console.log
- Writes to DOM if textarea#log exists

##### `warn(message, ...params)`

Log warning message.

```javascript
import { warn } from './utils/logger.js';

warn('Geolocation permission denied');
```

**Parameters:**
- `message` (String): Warning message
- `...params` (any): Additional parameters

**Side Effects:**
- Writes to console.warn
- Writes to DOM with ⚠️ prefix

##### `error(message, ...params)`

Log error message.

```javascript
import { error } from './utils/logger.js';

error('API request failed', err);
```

**Parameters:**
- `message` (String): Error message
- `...params` (any): Additional parameters

**Side Effects:**
- Writes to console.error
- Writes to DOM with ❌ prefix

##### `debug(message, ...params)`

Log debug message.

```javascript
import { debug } from './utils/logger.js';

debug('Cache hit', { key: 'address-123' });
```

**Parameters:**
- `message` (String): Debug message
- `...params` (any): Additional parameters

**Side Effects:**
- Only logs if log level includes 'debug'
- Writes to console.log with 🐛 prefix

##### `setLogLevel(level)`

Set logging level.

```javascript
import { setLogLevel } from './utils/logger.js';

setLogLevel('debug'); // Show all logs
setLogLevel('info');  // Show info, warn, error
setLogLevel('warn');  // Show warn, error only
setLogLevel('error'); // Show error only
```

**Parameters:**
- `level` (String): Log level - 'debug', 'info', 'warn', 'error'

---

### TimerManager

Centralized timer management singleton preventing memory leaks.

#### Singleton Access

```javascript
import timerManager from './utils/TimerManager.js';
```

#### Methods

##### `setInterval(callback, delay, id)`

Create named interval timer.

```javascript
const timerId = timerManager.setInterval(() => {
  console.log('Tick');
}, 1000, 'my-interval');
```

**Parameters:**
- `callback` (Function): Callback function
- `delay` (Number): Delay in milliseconds
- `id` (String): Unique timer identifier

**Returns:** String - Timer ID (same as input `id`)

**Side Effects:**
- Registers timer for cleanup
- Starts interval

##### `setTimeout(callback, delay, id)`

Create named timeout timer.

```javascript
const timerId = timerManager.setTimeout(() => {
  console.log('Timeout fired');
}, 5000, 'my-timeout');
```

**Parameters:**
- `callback` (Function): Callback function
- `delay` (Number): Delay in milliseconds
- `id` (String): Unique timer identifier

**Returns:** String - Timer ID (same as input `id`)

**Side Effects:**
- Registers timer for cleanup
- Starts timeout

##### `clearTimer(id)`

Clear specific timer.

```javascript
timerManager.clearTimer('my-interval');
```

**Parameters:**
- `id` (String): Timer identifier

**Side Effects:**
- Stops timer
- Removes from registry

##### `clearAllTimers()`

Clear all managed timers.

```javascript
timerManager.clearAllTimers();
```

**Side Effects:**
- Stops all registered timers
- Clears timer registry
- Called automatically on app shutdown

---

### distance

Geospatial distance calculations.

#### Constants

##### `EARTH_RADIUS_METERS`

Earth's mean radius in meters: 6371000

```javascript
import { EARTH_RADIUS_METERS } from './utils/distance.js';
```

#### Functions

##### `calculateDistance(lat1, lon1, lat2, lon2)`

Calculate distance between two coordinates using Haversine formula.

```javascript
import { calculateDistance } from './utils/distance.js';

const distance = calculateDistance(
  -23.5505, -46.6333,  // São Paulo
  -22.9068, -43.1729   // Rio de Janeiro
);
// Returns: ~357000 (meters)
```

**Parameters:**
- `lat1` (Number): First latitude
- `lon1` (Number): First longitude
- `lat2` (Number): Second latitude
- `lon2` (Number): Second longitude

**Returns:** Number - Distance in meters

**Formula:** Haversine great-circle distance

---

### html-sanitizer

XSS prevention utilities for safe HTML rendering.

#### Functions

##### `escapeHtml(text)`

Escape HTML special characters.

```javascript
import { escapeHtml } from './utils/html-sanitizer.js';

const safe = escapeHtml('<script>alert("XSS")</script>');
// Returns: "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;"
```

**Parameters:**
- `text` (String): Text to escape

**Returns:** String - Escaped text

**Escapes:**
- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&#x27;`

##### `escapeHtmlTruncate(text, maxLength)`

Escape and truncate text.

```javascript
const safe = escapeHtmlTruncate('<b>Long text...</b>', 10);
// Returns: "&lt;b&gt;Long..."
```

**Parameters:**
- `text` (String): Text to escape and truncate
- `maxLength` (Number): Maximum length

**Returns:** String - Escaped and truncated text

---

### accessibility

Accessibility utilities for emoji and ARIA support.

#### Functions

##### `accessibleEmoji(emoji, label)`

Make emoji accessible with screen reader label.

```javascript
import { accessibleEmoji } from './utils/accessibility.js';

const html = accessibleEmoji('🗺️', 'Map icon');
// Returns: <span role="img" aria-label="Map icon">🗺️</span>
```

**Parameters:**
- `emoji` (String): Emoji character(s)
- `label` (String): Screen reader label

**Returns:** String - HTML with ARIA attributes

##### `createAccessibleEmoji(emoji, label)`

Create accessible emoji DOM element.

```javascript
const element = createAccessibleEmoji('📍', 'Location pin');
```

**Parameters:**
- `emoji` (String): Emoji character(s)
- `label` (String): Screen reader label

**Returns:** HTMLElement - Span element with ARIA

##### `makeEmojisAccessible(container)`

Make all emojis in container accessible.

```javascript
makeEmojisAccessible(document.getElementById('content'));
```

**Parameters:**
- `container` (HTMLElement): Container element

**Side Effects:**
- Finds all text nodes with emojis
- Wraps them in accessible spans
- Uses `ACCESSIBLE_EMOJIS` map for labels

#### Constants

##### `ACCESSIBLE_EMOJIS`

Map of common emojis to screen reader labels.

```javascript
import { ACCESSIBLE_EMOJIS } from './utils/accessibility.js';

console.log(ACCESSIBLE_EMOJIS.get('🗺️')); // "Map icon"
```

**Includes:**
- 🗺️: "Map icon"
- 📍: "Location pin"
- 🏘️: "Neighborhood icon"
- 🏙️: "City icon"
- 📊: "Chart icon"
- And more...

---

### button-status

Contextual button status messages for improved UX (v0.8.7-alpha).

#### Functions

##### `disableWithReason(button, reason)`

Disable button with explanatory status message.

```javascript
import { disableWithReason } from './utils/button-status.js';

disableWithReason(
  document.getElementById('track-btn'),
  'Aguardando localização para habilitar'
);
```

**Parameters:**
- `button` (HTMLElement): Button element
- `reason` (String): Reason for disabled state

**Side Effects:**
- Disables button
- Adds status message below button
- Sets ARIA attributes
- Adds `aria-describedby` linking to status

**Accessibility:**
- `role="status"`
- `aria-live="polite"`
- `aria-atomic="true"`
- WCAG 2.1 AA compliant

##### `enableWithMessage(button, message)`

Enable button with success/ready message.

```javascript
import { enableWithMessage } from './utils/button-status.js';

enableWithMessage(
  document.getElementById('track-btn'),
  'Pronto para usar'
);
```

**Parameters:**
- `button` (HTMLElement): Button element
- `message` (String): Success/ready message

**Side Effects:**
- Enables button
- Updates status message
- Announces change to screen readers

##### `addButtonStatus(button, message, type)`

Add or update button status message.

```javascript
addButtonStatus(button, 'Processing...', 'info');
```

**Parameters:**
- `button` (HTMLElement): Button element
- `message` (String): Status message
- `type` (String): Status type - 'info', 'warning', 'success', 'error'

**Side Effects:**
- Creates/updates status element
- Applies color-coded styling

**Status Colors:**
- `info`: Blue (#2196F3)
- `warning`: Orange (#FF9800)
- `success`: Green (#4CAF50)
- `error`: Red (#F44336)

##### `removeButtonStatus(button)`

Remove button status message.

```javascript
removeButtonStatus(button);
```

**Parameters:**
- `button` (HTMLElement): Button element

**Side Effects:**
- Removes status element
- Removes ARIA attributes

##### `updateButtonStatus(button, message, type)`

Update existing button status.

```javascript
updateButtonStatus(button, 'Almost done...', 'warning');
```

**Parameters:**
- `button` (HTMLElement): Button element
- `message` (String): New message
- `type` (String): New type

**Side Effects:**
- Updates message text
- Updates status type styling
- Announces to screen readers

#### Constants

##### `BUTTON_STATUS_MESSAGES`

Predefined status messages in Brazilian Portuguese.

```javascript
import { BUTTON_STATUS_MESSAGES } from './utils/button-status.js';

console.log(BUTTON_STATUS_MESSAGES.AWAITING_LOCATION);
// "Aguardando localização para habilitar"
```

**Available Messages:**
- `AWAITING_LOCATION`: "Aguardando localização para habilitar"
- `READY_TO_USE`: "Pronto para usar"
- `LOCATION_TRACKING_ACTIVE`: "Rastreamento ativo"
- `NO_LOCATION`: "Sem localização disponível"
- `PROCESSING`: "Processando..."
- `DISABLED`: "Desabilitado temporariamente"

---

### toast

Toast notification system for user feedback.

#### Functions

##### `showToast(message, type, duration)`

Show toast notification.

```javascript
import { showToast } from './utils/toast.js';

showToast('Address updated successfully', 'success', 3000);
```

**Parameters:**
- `message` (String): Notification message
- `type` (String): Toast type - 'success', 'error', 'info', 'warning'
- `duration` (Number): Display duration in milliseconds (default: 3000)

**Returns:** String - Toast ID for dismissal

**Side Effects:**
- Creates toast element
- Animates into view
- Auto-dismisses after duration

##### `showSuccess(message, duration)`

Show success toast.

```javascript
showSuccess('Location updated', 2000);
```

**Parameters:**
- `message` (String): Success message
- `duration` (Number): Duration (default: 3000)

**Returns:** String - Toast ID

##### `showError(message, duration)`

Show error toast.

```javascript
showError('Failed to fetch address', 5000);
```

**Parameters:**
- `message` (String): Error message
- `duration` (Number): Duration (default: 5000)

**Returns:** String - Toast ID

##### `showInfo(message, duration)`

Show info toast.

```javascript
showInfo('Geolocation permission required', 4000);
```

**Parameters:**
- `message` (String): Info message
- `duration` (Number): Duration (default: 3000)

**Returns:** String - Toast ID

##### `showWarning(message, duration)`

Show warning toast.

```javascript
showWarning('Low accuracy detected', 4000);
```

**Parameters:**
- `message` (String): Warning message
- `duration` (Number): Duration (default: 4000)

**Returns:** String - Toast ID

##### `dismissToast(toastId)`

Dismiss specific toast.

```javascript
const id = showToast('Message', 'info');
dismissToast(id);
```

**Parameters:**
- `toastId` (String): Toast identifier

**Side Effects:**
- Animates toast out
- Removes from DOM

##### `dismissAllToasts()`

Dismiss all visible toasts.

```javascript
dismissAllToasts();
```

**Side Effects:**
- Dismisses all active toasts
- Clears toast queue

---

### device

Device detection utilities.

#### Functions

##### `isMobileDevice(options)`

Detect if device is mobile.

```javascript
import { isMobileDevice } from './utils/device.js';

if (isMobileDevice()) {
  // Mobile-specific code
}

// With options
if (isMobileDevice({ includeTablets: false })) {
  // Phone only
}
```

**Parameters:**
- `options` (Object): Detection options
  - `includeTablets` (Boolean): Include tablets as mobile (default: true)
  - `checkTouch` (Boolean): Check for touch support (default: true)

**Returns:** Boolean - True if mobile device

**Detection Methods:**
1. User agent matching (phone/tablet keywords)
2. Screen width (< 768px)
3. Touch support (if `checkTouch: true`)
4. Orientation API presence

---

## Coordination Module

Location: `src/coordination/`

### WebGeocodingManager

Main application orchestrator coordinating all services, displayers, and lifecycle management.

#### Constructor

```javascript
import WebGeocodingManager from './coordination/WebGeocodingManager.js';

const manager = new WebGeocodingManager(document, 'root-element-id');
```

**Parameters:**
- `document` (Document): Browser document object
- `elementId` (String): Root element ID

**Side Effects:**
- Initializes PositionManager
- Creates ServiceCoordinator
- Sets up all displayers
- Wires observers
- Ready for tracking

#### Methods

##### `startTracking()`

Start continuous location tracking.

```javascript
manager.startTracking();
```

**Side Effects:**
- Starts GeolocationService watch
- Begins position updates
- Activates geocoding pipeline

##### `stopTracking()`

Stop location tracking.

```javascript
manager.stopTracking();
```

**Side Effects:**
- Stops GeolocationService watch
- Pauses geocoding
- Clears pending requests

##### `getSingleLocation()`

Get one-time location update.

```javascript
const position = await manager.getSingleLocation();
```

**Returns:** Promise<Position> - Single position update

##### `cleanup()`

Cleanup resources on shutdown.

```javascript
manager.cleanup();
```

**Side Effects:**
- Stops tracking
- Clears all timers
- Unsubscribes all observers
- Releases resources

---

### ServiceCoordinator

Coordinates service lifecycle and observer wiring.

#### Constructor

```javascript
import ServiceCoordinator from './coordination/ServiceCoordinator.js';

const coordinator = new ServiceCoordinator(positionManager, document);
```

**Parameters:**
- `positionManager` (PositionManager): Singleton position manager
- `document` (Document): Browser document object

#### Methods

##### `createDisplayers()`

Create all display components.

```javascript
const displayers = coordinator.createDisplayers();
```

**Returns:** Object - Map of displayer instances
- `position`: HTMLPositionDisplayer
- `address`: HTMLAddressDisplayer
- `referencePlace`: HTMLReferencePlaceDisplayer
- `highlightCards`: HTMLHighlightCardsDisplayer
- `sidra`: HTMLSidraDisplayer

##### `wireObservers()`

Wire observers between components.

```javascript
coordinator.wireObservers();
```

**Side Effects:**
- Connects PositionManager → ReverseGeocoder
- Connects ReverseGeocoder → Displayers
- Connects AddressCache → ChangeDetection
- Sets up speech synthesis observers

##### `startTracking()`

Start coordinated tracking.

```javascript
coordinator.startTracking();
```

**Side Effects:**
- Delegates to GeolocationService
- Activates all observers

##### `stopTracking()`

Stop coordinated tracking.

```javascript
coordinator.stopTracking();
```

**Side Effects:**
- Delegates to GeolocationService
- Deactivates observers

---

## Config Module

Location: `src/config/`

### defaults.js

Application configuration constants.

#### Constants

```javascript
import {
  APP_NAME,
  APP_VERSION,
  NOMINATIM_API_BASE,
  MINIMUM_DISTANCE_CHANGE,
  MINIMUM_TIME_CHANGE,
  ADDRESS_FETCHED_EVENT
} from './config/defaults.js';
```

**Available Constants:**

| Constant | Value | Description |
|----------|-------|-------------|
| `APP_NAME` | 'Guia Turístico' | Application name |
| `APP_VERSION` | '0.8.7-alpha' | Current version |
| `NOMINATIM_API_BASE` | 'https://nominatim.openstreetmap.org' | Nominatim API base URL |
| `CORS_PROXY` | '' | CORS proxy URL (empty = direct) |
| `MINIMUM_DISTANCE_CHANGE` | 20 | Minimum distance in meters to trigger update |
| `MINIMUM_TIME_CHANGE` | 30000 | Minimum time in ms to trigger update (30s) |
| `ADDRESS_FETCHED_EVENT` | 'ADDRESS_FETCHED' | Address fetch event name |
| `POSITION_UPDATE_EVENT` | 'POSITION_UPDATE' | Position update event name |
| `ACCURACY_EXCELLENT` | 20 | Excellent accuracy threshold (meters) |
| `ACCURACY_GOOD` | 50 | Good accuracy threshold (meters) |
| `ACCURACY_FAIR` | 100 | Fair accuracy threshold (meters) |

---

## Status Module

Location: `src/status/`

### SingletonStatusManager

Application-wide status management singleton.

#### Singleton Access

```javascript
import SingletonStatusManager from './status/SingletonStatusManager.js';

const statusManager = SingletonStatusManager.getInstance();
```

#### Methods

##### `setStatus(key, value)`

Set status value.

```javascript
statusManager.setStatus('geolocation', 'tracking');
```

**Parameters:**
- `key` (String): Status key
- `value` (any): Status value

##### `getStatus(key)`

Get status value.

```javascript
const status = statusManager.getStatus('geolocation');
```

**Parameters:**
- `key` (String): Status key

**Returns:** any - Status value or undefined

##### `clearStatus(key)`

Clear specific status.

```javascript
statusManager.clearStatus('geolocation');
```

**Parameters:**
- `key` (String): Status key to clear

##### `clearAllStatuses()`

Clear all statuses.

```javascript
statusManager.clearAllStatuses();
```

---

## Components Module

Location: `src/components/`

### Toast (ToastManager)

Singleton toast notification manager.

#### Singleton Access

```javascript
import { toastManager } from './components/Toast.js';
```

See [toast utilities](#toast) for API documentation.

---

### Skeletons

Loading skeleton placeholders for improved perceived performance.

#### Functions

##### `createSkeleton(config)`

Create skeleton loading placeholder.

```javascript
import { createSkeleton } from './components/Skeletons.js';

const skeleton = createSkeleton({
  type: 'text',
  lines: 3,
  width: '100%',
  height: '20px'
});
document.body.appendChild(skeleton);
```

**Parameters:**
- `config` (Object): Skeleton configuration
  - `type` (String): 'text', 'circle', 'rect', 'card'
  - `lines` (Number): Number of lines (for text type)
  - `width` (String): Width CSS value
  - `height` (String): Height CSS value
  - `className` (String): Additional CSS class

**Returns:** HTMLElement - Skeleton element

##### `showSkeletons(container, preset)`

Show preset skeleton configuration.

```javascript
import { showSkeletons } from './components/Skeletons.js';

showSkeletons(document.getElementById('address'), 'address');
```

**Parameters:**
- `container` (HTMLElement): Target container
- `preset` (String): Preset name - 'address', 'position', 'card', 'list'

**Side Effects:**
- Clears container
- Adds skeleton elements

**Presets:**
- `'address'`: 4-line address skeleton
- `'position'`: 2-line coordinates skeleton
- `'card'`: Card with title + content skeleton
- `'list'`: List of items skeleton

##### `hideSkeletons(container)`

Remove skeleton placeholders.

```javascript
hideSkeletons(container);
```

**Parameters:**
- `container` (HTMLElement): Container with skeletons

**Side Effects:**
- Removes all skeleton elements

---

### EmptyState

Empty state templates for better UX.

#### Functions

##### `createEmptyState(config)`

Create empty state element.

```javascript
import { createEmptyState } from './components/EmptyState.js';

const emptyState = createEmptyState({
  icon: '📍',
  title: 'No location yet',
  message: 'Click button to get location',
  action: {
    label: 'Get Location',
    handler: () => getLocation()
  }
});
```

**Parameters:**
- `config` (Object): Empty state configuration
  - `icon` (String): Emoji icon
  - `title` (String): Title text
  - `message` (String): Description message
  - `action` (Object): Optional action button
    - `label` (String): Button label
    - `handler` (Function): Click handler

**Returns:** HTMLElement - Empty state element

#### Constants

##### `EMPTY_STATES`

Preset empty state configurations.

```javascript
import { EMPTY_STATES } from './components/EmptyState.js';

const locationEmptyState = EMPTY_STATES.LOCATION;
```

**Available Presets:**
- `LOCATION`: No location available
- `ADDRESS`: No address data
- `RESULTS`: No search results
- `ERROR`: Error state
- `PERMISSION`: Permission required

---

## Usage Examples

### Complete Geolocation Workflow

```javascript
import WebGeocodingManager from './coordination/WebGeocodingManager.js';

// Initialize manager
const manager = new WebGeocodingManager(document, 'app-root');

// Start tracking
document.getElementById('start-btn').addEventListener('click', () => {
  manager.startTracking();
});

// Stop tracking
document.getElementById('stop-btn').addEventListener('click', () => {
  manager.stopTracking();
});

// Get single location
document.getElementById('once-btn').addEventListener('click', async () => {
  try {
    const position = await manager.getSingleLocation();
    console.log('Position:', position);
  } catch (error) {
    console.error('Error:', error);
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  manager.cleanup();
});
```

### Custom Observer for Position Updates

```javascript
import PositionManager from './core/PositionManager.js';

const positionManager = PositionManager.getInstance();

const customObserver = {
  update: (posManager, event, data, error) => {
    if (error) {
      console.error('Position error:', error);
      return;
    }
    
    console.log('New position:', {
      lat: posManager.latitude,
      lon: posManager.longitude,
      accuracy: posManager.accuracy,
      quality: posManager.accuracyQuality
    });
  }
};

positionManager.subscribe(customObserver);
```

### Speech Synthesis with Brazilian Portuguese

```javascript
import SpeechSynthesisManager from './speech/SpeechSynthesisManager.js';

const speechManager = new SpeechSynthesisManager();

// Simple speech
speechManager.speak('Bem-vindo ao Guia Turístico!');

// With configuration
speechManager.speak('Você está na Avenida Paulista', {
  rate: 1.0,
  pitch: 1.0,
  lang: 'pt-BR',
  onEnd: () => console.log('Speech finished'),
  onError: (err) => console.error('Speech error:', err)
});

// Pause/Resume
speechManager.pause();
setTimeout(() => speechManager.resume(), 2000);

// Stop all
speechManager.stop();
```

### Address Change Detection

```javascript
import ChangeDetectionCoordinator from './services/ChangeDetectionCoordinator.js';
import { showToast } from './utils/toast.js';

const changeCoordinator = new ChangeDetectionCoordinator();
changeCoordinator.setAddressDataExtractor(addressDataExtractor);

// Subscribe to neighborhood changes
changeCoordinator.subscribe('bairro', (details) => {
  showToast(
    `Você entrou em ${details.newValue}`,
    'info',
    3000
  );
});

// Subscribe to municipality changes
changeCoordinator.subscribe('municipio', (details) => {
  showToast(
    `Agora você está em ${details.newValue}`,
    'success',
    4000
  );
});

changeCoordinator.setupChangeDetection();
```

### Custom Display Component

```javascript
import { DisplayerFactory } from './html/DisplayerFactory.js';

const addressDisplayer = DisplayerFactory.create('address');
const element = document.getElementById('address-display');

// Display address
addressDisplayer.display(brazilianAddress, element);

// Update display on changes
addressDataExtractor.subscribe((address) => {
  addressDisplayer.display(address, element);
});
```

### Timer Management Best Practices

```javascript
import timerManager from './utils/TimerManager.js';

// Create named interval
const intervalId = timerManager.setInterval(() => {
  console.log('Periodic update');
}, 5000, 'periodic-update');

// Create named timeout
const timeoutId = timerManager.setTimeout(() => {
  console.log('Delayed action');
}, 10000, 'delayed-action');

// Clear specific timer
timerManager.clearTimer('periodic-update');

// Clear all timers on cleanup
window.addEventListener('beforeunload', () => {
  timerManager.clearAllTimers();
});
```

---

## Event Reference

### Observer Events

| Event | Emitter | Payload | Description |
|-------|---------|---------|-------------|
| `POSITION_UPDATE` | PositionManager | GeoPosition | New position available |
| `ADDRESS_FETCHED` | ReverseGeocoder | BrazilianStandardAddress | Address geocoded |
| `LOGRADOURO_CHANGE` | ChangeDetectionCoordinator | {oldValue, newValue, position} | Street changed |
| `BAIRRO_CHANGE` | ChangeDetectionCoordinator | {oldValue, newValue, position} | Neighborhood changed |
| `MUNICIPIO_CHANGE` | ChangeDetectionCoordinator | {oldValue, newValue, position} | Municipality changed |
| `SPEECH_START` | SpeechSynthesisManager | {text, config} | Speech started |
| `SPEECH_END` | SpeechSynthesisManager | {text} | Speech completed |
| `SPEECH_ERROR` | SpeechSynthesisManager | {error} | Speech error |
| `TIMER_START` | Chronometer | {startTime} | Timing started |
| `TIMER_STOP` | Chronometer | {elapsed} | Timing stopped |

---

## Error Handling

### Common Errors

#### GeolocationPositionError

Browser geolocation errors.

**Error Codes:**
- `1` (PERMISSION_DENIED): User denied permission
- `2` (POSITION_UNAVAILABLE): Location unavailable
- `3` (TIMEOUT): Request timed out

**Handling:**
```javascript
try {
  const position = await geoService.getSingleLocationUpdate();
} catch (error) {
  switch (error.code) {
    case 1:
      showToast('Please grant location permission', 'warning');
      break;
    case 2:
      showToast('Location unavailable', 'error');
      break;
    case 3:
      showToast('Location request timed out', 'error');
      break;
  }
}
```

#### API Errors

Nominatim API errors.

**Common Issues:**
- Rate limiting (HTTP 429)
- Network errors
- Invalid coordinates

**Handling:**
```javascript
try {
  const address = await geocoder.fetchAddress();
} catch (error) {
  if (error.message.includes('429')) {
    warn('Rate limited, using cached data');
  } else {
    error('Geocoding failed:', error);
    showToast('Failed to fetch address', 'error');
  }
}
```

---

## Best Practices

### Observer Pattern

1. **Always unsubscribe** to prevent memory leaks:
```javascript
const observer = {update: () => {}};
subject.subscribe(observer);
// Later...
subject.unsubscribe(observer);
```

2. **Use function observers** for simple callbacks:
```javascript
const unsubscribe = subject.subscribeFunction((data) => {
  console.log(data);
});
// Later...
unsubscribe();
```

### Timer Management

1. **Always use TimerManager** for timers:
```javascript
// ✅ Good
timerManager.setInterval(fn, 1000, 'my-timer');

// ❌ Bad
setInterval(fn, 1000);
```

2. **Clear timers on cleanup**:
```javascript
window.addEventListener('beforeunload', () => {
  timerManager.clearAllTimers();
});
```

### Accessibility

1. **Make emojis accessible**:
```javascript
const html = accessibleEmoji('🗺️', 'Map icon');
```

2. **Use button status messages**:
```javascript
disableWithReason(button, 'Aguardando localização');
```

3. **Test with screen readers**: Ensure ARIA attributes are present

### Performance

1. **Use caching** for API responses
2. **Debounce** frequent updates
3. **Use skeleton loaders** for perceived performance
4. **Clean up resources** on component unmount

---

## Migration Guides

### From v0.8.6 to v0.8.7-alpha

**New Features:**
- Metropolitan region display support
- Button status messages utility
- Enhanced accessibility

**Breaking Changes:**
- None (backward compatible)

**New APIs:**
```javascript
// Button status messages
import { disableWithReason, enableWithMessage } from './utils/button-status.js';

// Metropolitan region
address.regiaoMetropolitanaFormatada(); // New method
```

**Migration Steps:**
1. Update imports for new utilities
2. Replace manual button state management with button-status utilities
3. Update UI to display metropolitan region if desired

---

## Testing

### Unit Testing

```javascript
// Example: Testing GeoPosition
import GeoPosition from './core/GeoPosition.js';

describe('GeoPosition', () => {
  it('calculates distance correctly', () => {
    const pos1 = new GeoPosition({
      coords: {latitude: -23.5505, longitude: -46.6333, accuracy: 10}
    });
    const pos2 = new GeoPosition({
      coords: {latitude: -22.9068, longitude: -43.1729, accuracy: 10}
    });
    
    const distance = pos1.distanceTo(pos2);
    expect(distance).toBeCloseTo(357000, -3); // ~357km
  });
});
```

### Integration Testing

```javascript
// Example: Testing geocoding workflow
import WebGeocodingManager from './coordination/WebGeocodingManager.js';

describe('WebGeocodingManager', () => {
  it('fetches address after position update', async () => {
    const manager = new WebGeocodingManager(document, 'test-root');
    
    const mockPosition = {
      coords: {
        latitude: -23.5505,
        longitude: -46.6333,
        accuracy: 15
      }
    };
    
    await manager.updatePosition(mockPosition);
    
    const address = manager.getCurrentAddress();
    expect(address).toBeDefined();
    expect(address.municipio).toBe('São Paulo');
  });
});
```

### E2E Testing

See `__tests__/e2e/` for comprehensive end-to-end test examples using Puppeteer.

---

## Appendix

### External API References

- **Nominatim API**: https://nominatim.org/release-docs/develop/api/Reverse/
- **IBGE API**: https://servicodados.ibge.gov.br/api/docs/
- **SIDRA API**: https://apisidra.ibge.gov.br/

### Browser API References

- **Geolocation API**: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

### Related Documentation

- [Architecture Overview](./architecture/SYSTEM_OVERVIEW.md)
- [Developer Guide](./developer/GETTING_STARTED.md)
- [User Guide](./user/USER_GUIDE.md)
- [Testing Guide](./developer/TESTING_GUIDE.md)

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-02-11  
**Status**: Complete ✅

For questions or contributions, see [CONTRIBUTING.md](../.github/CONTRIBUTING.md).
