# ReverseGeocoder API Documentation

**Version:** 0.9.0-alpha  
**Module:** `services/ReverseGeocoder`  
**Location:** `src/services/ReverseGeocoder.js`

## Overview

ReverseGeocoder is a service layer component responsible for converting geographic coordinates into human-readable addresses using the OpenStreetMap Nominatim API. It implements the observer pattern to enable reactive updates across UI components and integrates seamlessly with Brazilian address standardization.

### Purpose and Responsibility

The service handles:
- Coordinate-to-address conversion via OpenStreetMap Nominatim API
- Brazilian address standardization and formatting
- Observer pattern notifications for reactive UI updates
- Address data caching and performance optimization
- Automatic address updates when position changes
- Integration with AddressDataExtractor for data processing

## Architecture

### Integration Points

- **OpenStreetMap Nominatim API**: External geocoding service
- **IbiraAPIFetchManager**: API request management with caching and retry logic
- **AddressDataExtractor**: Brazilian address standardization and caching
- **PositionManager**: Position update notifications (observer pattern)
- **ObserverSubject**: Observer pattern implementation for address change notifications
- **Display Components**: HTMLAddressDisplayer, HTMLSidraDisplayer, etc.

### Dependencies

```javascript
import ObserverSubject from '../core/ObserverSubject.js';
import { log, warn, error } from '../utils/logger.js';
import { ADDRESS_FETCHED_EVENT } from '../config/defaults.js';
```

### External Dependencies

The class expects these to be injected or set externally:
- `fetchManager` (IbiraAPIFetchManager or fallback fetch)
- `AddressDataExtractor` (set via property assignment)

## Constructor

### Signature

```javascript
new ReverseGeocoder(fetchManager, config)
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `fetchManager` | `Object` | Yes | - | API fetch manager (IbiraAPIFetchManager or fallback) |
| `config` | `Object` | No | `{}` | Configuration options |
| `config.openstreetmapBaseUrl` | `string` | No | `'https://nominatim.openstreetmap.org/reverse?format=json'` | Base URL for OpenStreetMap Nominatim API |

### Examples

```javascript
// Basic usage with IbiraAPIFetchManager
import IbiraAPIFetchManager from '../external/IbiraAPIFetchManager.js';

const fetchManager = new IbiraAPIFetchManager();
const geocoder = new ReverseGeocoder(fetchManager);

// With custom Nominatim endpoint
const geocoder = new ReverseGeocoder(fetchManager, {
  openstreetmapBaseUrl: 'https://custom-nominatim.example.com/reverse?format=json'
});

// For testing with mock fetch manager
const mockFetchManager = {
  fetch: jest.fn().mockResolvedValue(mockAddressData)
};
const geocoder = new ReverseGeocoder(mockFetchManager);
```

## Public Methods

### setCoordinates(latitude, longitude)

Sets coordinates for reverse geocoding operations.

**Signature:**
```javascript
setCoordinates(latitude: number, longitude: number): void
```

**Parameters:**
- `latitude` (number): Latitude coordinate in decimal degrees
- `longitude` (number): Longitude coordinate in decimal degrees

**Example:**
```javascript
geocoder.setCoordinates(-23.550520, -46.633309); // São Paulo, Brazil
```

**Side Effects:**
- Generates OpenStreetMap Nominatim API URL
- Resets internal state (`data`, `error`, `loading`, `lastFetch`)
- Stores coordinates for subsequent geocoding operations

**Validation:**
The method validates coordinates and ignores invalid values:
```javascript
if (!latitude || !longitude) {
  return; // Silently ignore invalid coordinates
}
```

---

### fetchAddress()

Fetches address data using reverse geocoding and notifies observers.

**Signature:**
```javascript
async fetchAddress(): Promise<Object>
```

**Returns:**
- `Promise<Object>`: Nominatim address data object (see structure below)

**Throws:**
- `Error`: If coordinates are invalid or geocoding fails

**Example:**
```javascript
try {
  const addressData = await geocoder.fetchAddress();
  console.log('Address:', addressData.display_name);
  console.log('City:', addressData.address.city);
  console.log('State:', addressData.address.state);
} catch (error) {
  console.error('Geocoding failed:', error);
}
```

**Nominatim Response Structure:**
```javascript
{
  place_id: 12345,
  licence: "Data © OpenStreetMap contributors, ODbL 1.0...",
  osm_type: "way",
  osm_id: 123456789,
  lat: "-23.550520",
  lon: "-46.633309",
  display_name: "Praça da Sé, Centro, São Paulo, SP, 01001-000, Brasil",
  address: {
    road: "Praça da Sé",           // logradouro
    suburb: "Centro",              // bairro
    city: "São Paulo",             // municipio
    municipality: "São Paulo",
    state: "São Paulo",            // estado
    postcode: "01001-000",         // CEP
    country: "Brasil",
    country_code: "br"
  },
  boundingbox: [...],
  ...
}
```

**Observer Notifications:**
After successful fetch, the method notifies all subscribed observers:
```javascript
this.notifyObservers(
  this.currentAddress,        // Raw Nominatim data
  this.enderecoPadronizado,   // Brazilian standardized address
  ADDRESS_FETCHED_EVENT,      // Event type
  false,                      // loading state
  null                        // error state
);
```

---

### reverseGeocode()

Performs reverse geocoding to convert coordinates into address.

**Signature:**
```javascript
async reverseGeocode(): Promise<Object>
```

**Returns:**
- `Promise<Object>`: Geocoded address data from OpenStreetMap

**Throws:**
- `Error`: "Invalid coordinates" if latitude or longitude are missing
- `Error`: Network errors, HTTP errors, or JSON parsing errors from fetch

**Example:**
```javascript
// Basic reverse geocoding
const geocoder = new ReverseGeocoder(fetchManager);
geocoder.setCoordinates(-23.5505, -46.6333);

try {
  const addressData = await geocoder.reverseGeocode();
  console.log('Address:', addressData.display_name);
} catch (error) {
  console.error('Geocoding failed:', error.message);
}

// With promise chaining (legacy style)
geocoder.reverseGeocode()
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Failed:', error));
```

**Fetch Manager Fallback:**
If `fetchManager` is not available, the method falls back to browser's native `fetch()`:
```javascript
if (!this.fetchManager) {
  const response = await fetch(this.url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}
```

**Performance:**
- Uses configured fetch manager with built-in caching
- Generates cache key based on coordinates
- Avoids redundant API calls for same locations

---

### getCacheKey()

Generates unique cache key for geocoded results.

**Signature:**
```javascript
getCacheKey(): string
```

**Returns:**
- `string`: Unique cache key based on latitude and longitude

**Example:**
```javascript
geocoder.setCoordinates(-23.550520, -46.633309);
const key = geocoder.getCacheKey();
console.log(key); // "-23.55052,-46.633309"
```

**Use Case:**
Used internally and by caching systems to identify unique coordinate pairs:
```javascript
const cache = new Map();
const key = geocoder.getCacheKey();
if (cache.has(key)) {
  return cache.get(key); // Use cached address
}
```

---

### update(positionManager, posEvent, loading, error)

Observer pattern update method for PositionManager notifications.

**Signature:**
```javascript
update(
  positionManager: PositionManager,
  posEvent: string,
  loading: Object,
  error: Object
): void
```

**Parameters:**
- `positionManager` (PositionManager): PositionManager instance with current position
- `posEvent` (string): Position event type (strCurrPosUpdate, strCurrPosNotUpdate, etc.)
- `loading` (Object): Loading state information
- `error` (Object): Error information if any

**Example:**
```javascript
// Automatic integration via PositionManager observer pattern
const positionManager = PositionManager.getInstance();
const geocoder = new ReverseGeocoder(fetchManager);

// Subscribe to position updates
positionManager.subscribe(geocoder);

// When position changes, geocoder.update() is automatically called
// which triggers reverse geocoding and observer notifications
```

**Event-Driven Flow:**
```
Position Update → PositionManager → ReverseGeocoder.update()
  → reverseGeocode() → notifyObservers() → UI Components
```

**Brazilian Address Processing:**
The method automatically converts raw Nominatim data to Brazilian standard format:
```javascript
if (this.AddressDataExtractor) {
  this.enderecoPadronizado = this.AddressDataExtractor.getBrazilianStandardAddress(addressData);
  // Now available: municipio, bairro, siglaUF, logradouro, etc.
}
```

---

### Observer Pattern Methods

#### subscribe(observer)

Subscribes an observer to address update notifications.

**Signature:**
```javascript
subscribe(observer: Object): void
```

**Parameters:**
- `observer` (Object): Observer with `update()` method

**Example:**
```javascript
const myObserver = {
  update(addressData, enderecoPadronizado, event, loading, error) {
    console.log('Address changed:', addressData.display_name);
    console.log('Municipality:', enderecoPadronizado.municipio);
  }
};

geocoder.subscribe(myObserver);
```

---

#### unsubscribe(observer)

Unsubscribes an observer from address update notifications.

**Signature:**
```javascript
unsubscribe(observer: Object): void
```

**Example:**
```javascript
geocoder.unsubscribe(myObserver);
```

---

#### notifyObservers(...args)

Notifies all subscribed observers of address changes.

**Signature:**
```javascript
notifyObservers(...args): void
```

**Parameters:**
- `args` (Array): Arguments passed to observer `update()` methods

**Standard Notification Signature:**
```javascript
notifyObservers(
  currentAddress,        // Raw Nominatim data
  enderecoPadronizado,   // Brazilian standardized address
  ADDRESS_FETCHED_EVENT, // Event type constant
  loading,               // Boolean loading state
  error                  // Error object or null
);
```

**Example:**
```javascript
// Manual notification (normally done automatically)
geocoder.notifyObservers(
  addressData,
  brazilianAddress,
  'AddressFetched',
  false,
  null
);
```

---

### toString()

Returns a string representation of the ReverseGeocoder instance.

**Signature:**
```javascript
toString(): string
```

**Returns:**
- `string`: Formatted string with class name and coordinates

**Example:**
```javascript
const geocoder = new ReverseGeocoder(fetchManager);
geocoder.setCoordinates(-23.5505, -46.6333);
console.log(geocoder.toString());
// Output: "ReverseGeocoder: -23.5505, -46.6333"

const emptyGeocoder = new ReverseGeocoder(fetchManager);
console.log(emptyGeocoder.toString());
// Output: "ReverseGeocoder: No coordinates set"
```

## Properties

### Public Properties

| Property | Type | Description |
|----------|------|-------------|
| `currentAddress` | `Object` | Current raw address data from Nominatim (getter/setter) |
| `enderecoPadronizado` | `BrazilianStandardAddress` | Standardized Brazilian address format |
| `latitude` | `number` | Current latitude coordinate |
| `longitude` | `number` | Current longitude coordinate |
| `url` | `string` | Generated OpenStreetMap Nominatim API URL |

### Internal Properties

| Property | Type | Description |
|----------|------|-------------|
| `fetchManager` | `Object` | API fetch manager instance |
| `config` | `Object` | Configuration options |
| `observerSubject` | `ObserverSubject` | Observer pattern implementation |
| `data` | `Object` | Internal raw address data storage |
| `error` | `Error` | Last error that occurred |
| `loading` | `boolean` | Loading state flag |
| `lastFetch` | `number` | Timestamp of last fetch |
| `AddressDataExtractor` | `Object` | Address standardization utility (injected) |

## Error Handling

### Error Types

| Error | Scenario | Handling |
|-------|----------|----------|
| `"Invalid coordinates"` | Missing latitude or longitude | Validate coordinates before calling `reverseGeocode()` |
| Network errors | Network connectivity issues | Retry with exponential backoff |
| HTTP errors | API unavailable (status >= 400) | Fallback to cached data or show error |
| JSON parsing errors | Invalid API response | Log error and notify observers |

### Error Handling Pattern

```javascript
try {
  geocoder.setCoordinates(lat, lon);
  const addressData = await geocoder.fetchAddress();
  // Success handling
} catch (error) {
  if (error.message === "Invalid coordinates") {
    console.error('Coordinates are required');
  } else if (error.message.includes('HTTP error')) {
    console.error('API unavailable:', error);
  } else {
    console.error('Geocoding failed:', error);
  }
  
  // Observers are notified automatically on error
}
```

### Observer Error Notifications

When geocoding fails, observers are notified with error information:
```javascript
this.notifyObservers(
  null,              // No address data
  null,              // No standardized address
  posEvent,          // Event type
  false,             // Not loading
  error              // Error object
);
```

## OpenStreetMap Nominatim API

### API Endpoint

Default endpoint:
```
https://nominatim.openstreetmap.org/reverse?format=json
```

### API Request

Generated URL format:
```
https://nominatim.openstreetmap.org/reverse?format=json&lat={latitude}&lon={longitude}&zoom=18&addressdetails=1
```

**Parameters:**
- `format=json`: Response format
- `lat={latitude}`: Latitude coordinate
- `lon={longitude}`: Longitude coordinate  
- `zoom=18`: Detail level (18 = building level)
- `addressdetails=1`: Include detailed address components

### API Response

```javascript
{
  place_id: 12345,
  licence: "Data © OpenStreetMap contributors, ODbL 1.0...",
  osm_type: "way",
  osm_id: 123456789,
  lat: "-23.550520",
  lon: "-46.633309",
  display_name: "Praça da Sé, Centro, São Paulo, SP, 01001-000, Brasil",
  address: {
    road: "Praça da Sé",
    suburb: "Centro",
    city: "São Paulo",
    municipality: "São Paulo",
    state: "São Paulo",
    postcode: "01001-000",
    country: "Brasil",
    country_code: "br"
  },
  boundingbox: ["lat1", "lat2", "lon1", "lon2"]
}
```

### Rate Limiting

**Nominatim Usage Policy:**
- Maximum 1 request per second
- Must include valid User-Agent header
- Implement caching to reduce requests
- Consider self-hosting for high-volume usage

**Implementation:**
The `IbiraAPIFetchManager` handles rate limiting and caching automatically.

### Attribution

OpenStreetMap data is © OpenStreetMap contributors, ODbL 1.0:
- Must display attribution in your application
- See: https://www.openstreetmap.org/copyright

## Brazilian Address Standardization

### BrazilianStandardAddress Format

When `AddressDataExtractor` is configured, addresses are converted to:

```javascript
{
  logradouro: "Praça da Sé",
  bairro: "Centro", 
  municipio: "São Paulo",
  siglaUF: "SP",
  estado: "São Paulo",
  CEP: "01001-000",
  pais: "Brasil",
  regiaoMetropolitana: "Região Metropolitana de São Paulo"
}
```

### Integration with AddressDataExtractor

```javascript
// Set AddressDataExtractor reference
import AddressDataExtractor from '../data/AddressDataExtractor.js';
geocoder.AddressDataExtractor = AddressDataExtractor;

// Now fetchAddress() returns both raw and standardized data
const addressData = await geocoder.fetchAddress();
console.log(geocoder.currentAddress);        // Raw Nominatim data
console.log(geocoder.enderecoPadronizado);   // Brazilian format
```

### Portuguese Language Support

The standardized format uses Portuguese terminology:
- **logradouro**: Street name (road, avenue, etc.)
- **bairro**: Neighborhood (suburb, district)
- **município**: Municipality (city)
- **siglaUF**: State abbreviation (SP, RJ, MG, etc.)
- **estado**: Full state name
- **CEP**: Postal code (Código de Endereçamento Postal)
- **região metropolitana**: Metropolitan region

## Integration Examples

### Complete Workflow

```javascript
import IbiraAPIFetchManager from '../external/IbiraAPIFetchManager.js';
import ReverseGeocoder from './ReverseGeocoder.js';
import AddressDataExtractor from '../data/AddressDataExtractor.js';
import PositionManager from '../core/PositionManager.js';

// Setup
const fetchManager = new IbiraAPIFetchManager();
const geocoder = new ReverseGeocoder(fetchManager);
geocoder.AddressDataExtractor = AddressDataExtractor;

// Subscribe to position updates
const positionManager = PositionManager.getInstance();
positionManager.subscribe(geocoder);

// Subscribe to address updates
const displayObserver = {
  update(addressData, enderecoPadronizado, event, loading, error) {
    if (error) {
      console.error('Address fetch failed:', error);
      return;
    }
    
    console.log('City:', enderecoPadronizado.municipio);
    console.log('State:', enderecoPadronizado.siglaUF);
    console.log('Neighborhood:', enderecoPadronizado.bairro);
  }
};

geocoder.subscribe(displayObserver);

// Trigger position update (cascades to address fetch)
positionManager.update(position);
```

### Manual Geocoding

```javascript
// Without position manager integration
const geocoder = new ReverseGeocoder(fetchManager);
geocoder.AddressDataExtractor = AddressDataExtractor;

// Set coordinates
geocoder.setCoordinates(-23.550520, -46.633309);

// Fetch address
const addressData = await geocoder.fetchAddress();

// Access results
console.log('Display name:', addressData.display_name);
console.log('Municipality:', geocoder.enderecoPadronizado.municipio);
console.log('Cache key:', geocoder.getCacheKey());
```

### With UI Components

```javascript
import HTMLAddressDisplayer from '../html/HTMLAddressDisplayer.js';

// Create displayer
const addressDisplayElement = document.getElementById('address-display');
const displayer = new HTMLAddressDisplayer(addressDisplayElement);

// Subscribe displayer to geocoder
geocoder.subscribe(displayer);

// Address updates automatically trigger UI updates
```

## Performance Optimization

### Caching Strategy

```javascript
// Cache key based on coordinates
const key = geocoder.getCacheKey(); // "-23.55052,-46.633309"

// IbiraAPIFetchManager handles caching automatically
// Same coordinates won't trigger redundant API calls
```

### Coordinate Precision

Optimize by rounding coordinates for cache hits:
```javascript
const roundedLat = Math.round(lat * 10000) / 10000;  // 4 decimal places
const roundedLon = Math.round(lon * 10000) / 10000;
geocoder.setCoordinates(roundedLat, roundedLon);
```

4 decimal places provides ~11 meter precision, sufficient for most use cases.

### Debouncing

Prevent excessive geocoding during continuous position updates:
```javascript
let geocodeTimeout;
function debouncedGeocode(lat, lon) {
  clearTimeout(geocodeTimeout);
  geocodeTimeout = setTimeout(() => {
    geocoder.setCoordinates(lat, lon);
    geocoder.fetchAddress();
  }, 1000); // Wait 1 second after last position update
}
```

## Testing

### Mock Fetch Manager

```javascript
const mockFetchManager = {
  fetch: jest.fn().mockResolvedValue({
    display_name: "Test Address",
    address: {
      road: "Test Road",
      suburb: "Test Neighborhood",
      city: "Test City",
      state: "Test State",
      postcode: "12345-678",
      country: "Brasil"
    }
  })
};

const geocoder = new ReverseGeocoder(mockFetchManager);
```

### Mock AddressDataExtractor

```javascript
const mockAddressDataExtractor = {
  getBrazilianStandardAddress: jest.fn().mockReturnValue({
    municipio: "São Paulo",
    siglaUF: "SP",
    bairro: "Centro"
  })
};

geocoder.AddressDataExtractor = mockAddressDataExtractor;
```

### Test Observer Notifications

```javascript
const testObserver = {
  update: jest.fn()
};

geocoder.subscribe(testObserver);
await geocoder.fetchAddress();

expect(testObserver.update).toHaveBeenCalledWith(
  expect.any(Object), // addressData
  expect.any(Object), // enderecoPadronizado
  'AddressFetched',
  false,
  null
);
```

## See Also

- [GeolocationService Documentation](./GEOLOCATION_SERVICE.md)
- [PositionManager Documentation](../core/POSITION_MANAGER.md)
- [AddressDataExtractor Documentation](../data/ADDRESS_DATA_EXTRACTOR.md)
- [BrazilianStandardAddress Documentation](../data/BRAZILIAN_STANDARD_ADDRESS.md)
- [OpenStreetMap Nominatim Documentation](https://nominatim.org/release-docs/latest/)
- [OpenStreetMap Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)

## Change Log

### v0.9.0-alpha
- Extracted from `guia.js` in Phase 2 modularization
- Enhanced observer pattern integration
- Improved error handling and validation
- Fixed code duplication in `reverseGeocode()`
- Added fallback to native `fetch()` when fetch manager unavailable
- Enhanced documentation with comprehensive examples

### v0.9.0-alpha
- Initial version with OpenStreetMap Nominatim integration
- Brazilian address standardization support
- Observer pattern implementation for reactive updates
- Integration with PositionManager and AddressDataExtractor
