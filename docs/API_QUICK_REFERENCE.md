# API Quick Reference

**Fast reference guide for Guia Turístico's public API.**

---

## Core Classes

### GeoPosition

**Immutable value object representing geographic coordinates.**

```javascript
import { GeoPosition } from './src/core/GeoPosition.js';

// Constructor
new GeoPosition(latitude, longitude, accuracy?, timestamp?)

// Properties (getters only - immutable)
position.latitude    // number: -90 to 90
position.longitude   // number: -180 to 180
position.accuracy    // number | null: meters
position.timestamp   // number: milliseconds since epoch

// Methods
position.toJSON()           // Returns plain object
position.equals(otherPos)   // Boolean comparison
position.distanceTo(otherPos) // Distance in meters

// Example
const pos = new GeoPosition(-23.550520, -46.633309, 10);
console.log(pos.toJSON());
// { latitude: -23.550520, longitude: -46.633309, accuracy: 10, timestamp: ... }
```

---

### PositionManager

**Singleton managing current geolocation state. Extends ObserverSubject.**

```javascript
import { PositionManager } from './src/core/PositionManager.js';

// Get singleton instance
const manager = PositionManager.getInstance();

// Properties
manager.currentPosition  // GeoPosition | null

// Methods
manager.updatePosition(geoPosition)     // Updates position, notifies observers
manager.getCurrentPosition()            // Returns current GeoPosition or null
manager.hasPosition()                   // Returns boolean

// Observer pattern
manager.attach(observer)                // Add observer
manager.detach(observer)                // Remove observer
manager.notifyObservers(event, data)    // Notify all observers

// Example
manager.attach({
  update(eventType, data) {
    if (eventType === 'positionUpdated') {
      console.log('New position:', data.toJSON());
    }
  }
});
```

---

## Services

### GeolocationService

**Wrapper for browser Geolocation API.**

```javascript
import { GeolocationService } from './src/services/GeolocationService.js';

// Constructor
const service = new GeolocationService(positionManager?);

// Methods
service.getCurrentPosition(options?)    // Promise<GeoPosition>
service.startWatching(options?)         // Starts continuous tracking
service.stopWatching()                  // Stops tracking
service.isWatching()                    // Returns boolean

// Options
const options = {
  enableHighAccuracy: true,
  timeout: 10000,           // milliseconds
  maximumAge: 0             // milliseconds
};

// Example: Single position
const position = await service.getCurrentPosition();
console.log(`${position.latitude}, ${position.longitude}`);

// Example: Continuous tracking
service.startWatching({ enableHighAccuracy: true });
// Position updates sent to PositionManager automatically
```

---

### ReverseGeocoder

**Converts coordinates to address using OpenStreetMap Nominatim API.**

```javascript
import { ReverseGeocoder } from './src/services/ReverseGeocoder.js';

// Constructor
const geocoder = new ReverseGeocoder(latitude, longitude);

// Methods
geocoder.fetchAddress()     // Promise<object>: Raw Nominatim response
geocoder.getApiUrl()        // Returns API URL string

// Example
const geocoder = new ReverseGeocoder(-23.550520, -46.633309);
const addressData = await geocoder.fetchAddress();

console.log(addressData.address);
// {
//   road: "Avenida Paulista",
//   suburb: "Bela Vista",
//   city: "São Paulo",
//   state: "São Paulo",
//   country: "Brasil",
//   ...
// }
```

---

## Data Models

### BrazilianStandardAddress

**Standardized Brazilian address representation.**

```javascript
import { BrazilianStandardAddress } from './src/data/BrazilianStandardAddress.js';

// Constructor
const address = new BrazilianStandardAddress();

// Properties (all string)
address.logradouro              // Street name
address.numero                  // Street number
address.bairro                  // Neighborhood
address.municipio               // Municipality
address.uf                      // State abbreviation
address.cep                     // Postal code
address.pais                    // Country
address.regiaoMetropolitana     // Metropolitan region (v0.9.0+)

// Methods
address.municipioCompleto()             // "São Paulo, SP"
address.regiaoMetropolitanaFormatada()  // "Região Metropolitana do Recife"
address.enderecoCompleto()              // Full address string

// Example
const address = new BrazilianStandardAddress();
address.logradouro = "Avenida Paulista";
address.numero = "1578";
address.bairro = "Bela Vista";
address.municipio = "São Paulo";
address.uf = "SP";

console.log(address.municipioCompleto());
// "São Paulo, SP"
```

---

### AddressExtractor

**Extracts Brazilian address from Nominatim API response.**

```javascript
import { AddressExtractor } from './src/data/AddressExtractor.js';

// Constructor
const extractor = new AddressExtractor(nominatimResponse);

// Methods
extractor.extractBrazilianAddress()  // Returns BrazilianStandardAddress
extractor.extractLogradouro()        // Returns street name
extractor.extractBairro()            // Returns neighborhood
extractor.extractMunicipio()         // Returns municipality
extractor.extractUF()                // Returns state abbreviation
extractor.extractMetropolitanRegion() // Returns metro region (v0.9.0+)

// Example
const geocoder = new ReverseGeocoder(-23.550520, -46.633309);
const nominatimData = await geocoder.fetchAddress();
const extractor = new AddressExtractor(nominatimData);
const address = extractor.extractBrazilianAddress();

console.log(address.municipioCompleto());
// "São Paulo, SP"
```

---

### ReferencePlace

**Represents a point of interest (POI).**

```javascript
import { ReferencePlace } from './src/data/ReferencePlace.js';

// Constructor
const place = new ReferencePlace(nominatimResponse);

// Properties
place.name          // string: POI name
place.type          // string: POI type
place.category      // string: Calculated category

// Methods
place.getName()          // Returns name
place.getType()          // Returns type
place.calculateCategory() // Returns human-readable category

// Categories
// - 'Estabelecimento comercial' (shop)
// - 'Ponto de interesse' (amenity)
// - 'Estação' (railway)
// - 'Edifício' (building)
// - 'Local' (place)
// - 'Desconhecido' (unknown)

// Example
const place = new ReferencePlace({
  name: "Museu de Arte de São Paulo",
  place: { type: "museum" }
});

console.log(place.calculateCategory());
// "Ponto de interesse"
```

---

## HTML Displayers

### HTMLPositionDisplayer

**Displays coordinates and Google Maps links.**

```javascript
import { HTMLPositionDisplayer } from './src/html/HTMLPositionDisplayer.js';

// Constructor
const displayer = new HTMLPositionDisplayer(document, elementId);

// Methods
displayer.displayPosition(geoPosition)   // Updates coordinate display
displayer.clearDisplay()                 // Clears display
displayer.generateGoogleMapsLink(lat, lon) // Returns URL string

// Example
const displayer = new HTMLPositionDisplayer(document, 'position-area');
const position = new GeoPosition(-23.550520, -46.633309);
displayer.displayPosition(position);

// HTML result:
// <div id="position-area">
//   Latitude: -23.550520
//   Longitude: -46.633309
//   <a href="https://maps.google.com/...">View on Map</a>
// </div>
```

---

### HTMLAddressDisplayer

**Displays formatted address.**

```javascript
import { HTMLAddressDisplayer } from './src/html/HTMLAddressDisplayer.js';

// Constructor
const displayer = new HTMLAddressDisplayer(document, elementId);

// Methods
displayer.displayAddress(brazilianAddress)  // Updates address display
displayer.clearDisplay()                    // Clears display
displayer.formatAddress(brazilianAddress)   // Returns formatted HTML string

// Example
const displayer = new HTMLAddressDisplayer(document, 'address-area');
const address = new BrazilianStandardAddress();
address.logradouro = "Avenida Paulista";
address.municipio = "São Paulo";
address.uf = "SP";

displayer.displayAddress(address);

// HTML result:
// <div id="address-area">
//   <p>Avenida Paulista</p>
//   <p>São Paulo, SP</p>
// </div>
```

---

### HTMLHighlightCardsDisplayer

**Displays municipality and neighborhood highlight cards.**

```javascript
import { HTMLHighlightCardsDisplayer } from './src/html/HTMLHighlightCardsDisplayer.js';

// Constructor
const displayer = new HTMLHighlightCardsDisplayer(document);

// Methods
displayer.displayMunicipio(municipio, uf, regiaoMetropolitana?)
displayer.displayBairro(bairro)
displayer.clearMunicipioCard()
displayer.clearBairroCard()

// Example
const displayer = new HTMLHighlightCardsDisplayer(document);
displayer.displayMunicipio("Recife", "PE", "Região Metropolitana do Recife");
displayer.displayBairro("Boa Viagem");

// Creates two highlight cards:
// ┌─────────────────────────────┐
// │ Município                    │
// │ Região Metropolitana do Recife│
// │ Recife, PE                  │
// └─────────────────────────────┘
// ┌─────────────────────────────┐
// │ Bairro                       │
// │ Boa Viagem                  │
// └─────────────────────────────┘
```

---

### HTMLSidraDisplayer

**Displays IBGE SIDRA population statistics.**

```javascript
import { HTMLSidraDisplayer } from './src/html/HTMLSidraDisplayer.js';

// Constructor
const displayer = new HTMLSidraDisplayer(document);

// Methods
displayer.displayPopulation(municipioCode)  // Fetches and displays
displayer.clearDisplay()                    // Clears display

// Example
const displayer = new HTMLSidraDisplayer(document);
await displayer.displayPopulation("3550308"); // São Paulo code

// HTML result:
// <div id="sidra-display-area">
//   <h3>População Estimada</h3>
//   <p>12.325.232 habitantes (2021)</p>
//   <small>Fonte: IBGE SIDRA</small>
// </div>
```

---

## Speech Synthesis

### SpeechSynthesisManager

**Manages text-to-speech with Brazilian Portuguese optimization.**

```javascript
import { SpeechSynthesisManager } from './src/speech/SpeechSynthesisManager.js';

// Constructor
const manager = new SpeechSynthesisManager();

// Methods
manager.speak(text, priority?)           // Adds to queue
manager.setRate(rate)                    // 0.1 - 10.0
manager.setPitch(pitch)                  // 0.0 - 2.0
manager.stopSpeaking()                   // Stops current speech
manager.clearQueue()                     // Clears queue

// Priority levels
'high'    // Interrupts current speech
'normal'  // Default queue
'low'     // Background announcements

// Example
const manager = new SpeechSynthesisManager();
await manager.speak("Você está em São Paulo", 'normal');
await manager.speak("Bairro: Bela Vista", 'low');
```

---

## Utilities

### TimerManager

**Centralized timer management (prevents memory leaks).**

```javascript
import { timerManager } from './src/utils/TimerManager.js';

// Methods
timerManager.setInterval(callback, delay, id)  // Returns string ID
timerManager.setTimeout(callback, delay, id)   // Returns string ID
timerManager.clearTimer(id)                    // Clears specific timer
timerManager.clearAllTimers()                  // Clears all timers
timerManager.getActiveTimers()                 // Returns array of IDs

// Example
const timerId = timerManager.setInterval(() => {
  console.log('Update');
}, 1000, 'my-update-timer');

// Cleanup
timerManager.clearTimer('my-update-timer');
```

---

### Button Status Utilities

**Contextual status messages for buttons (v0.9.0+).**

```javascript
import { 
  disableWithReason, 
  enableWithMessage, 
  BUTTON_STATUS_MESSAGES 
} from './src/utils/button-status.js';

// Methods
disableWithReason(button, message, type?)  // Disables with status
enableWithMessage(button, message, type?)  // Enables with status
addButtonStatus(button, message, type?)    // Adds status span
removeButtonStatus(button)                 // Removes status span
updateButtonStatus(button, message, type?) // Updates existing status

// Status types
'info'     // Blue (default)
'warning'  // Orange
'success'  // Green
'error'    // Red

// Example
const button = document.getElementById('my-button');

// Disable with explanation
disableWithReason(button, "Aguardando localização");

// Enable with success message
enableWithMessage(button, "Pronto para usar", 'success');

// Predefined messages
console.log(BUTTON_STATUS_MESSAGES.WAITING_FOR_LOCATION);
// "Aguardando localização para habilitar"
```

---

## Configuration Constants

### Default Values

```javascript
import {
  APP_VERSION,
  MINIMUM_DISTANCE_CHANGE,
  MINIMUM_TIME_CHANGE,
  ADDRESS_FETCHED_EVENT,
  BUTTON_STATUS_MESSAGES
} from './src/config/defaults.js';

// Constants
APP_VERSION                  // "0.9.0-alpha"
MINIMUM_DISTANCE_CHANGE      // 20 (meters)
MINIMUM_TIME_CHANGE          // 30000 (milliseconds = 30 seconds)
ADDRESS_FETCHED_EVENT        // "addressFetched"

// Button status messages (v0.9.0+)
BUTTON_STATUS_MESSAGES.WAITING_FOR_LOCATION
BUTTON_STATUS_MESSAGES.READY_TO_USE
BUTTON_STATUS_MESSAGES.PROCESSING
// ... more messages
```

---

## Coordination

### WebGeocodingManager

**Main coordinator for geolocation workflow.**

```javascript
import { WebGeocodingManager } from './src/coordination/WebGeocodingManager.js';

// Constructor
const manager = new WebGeocodingManager(document, elementId);

// Methods
manager.initialize()          // Sets up services and displayers
manager.getCurrentLocation()  // Triggers geolocation
manager.cleanup()             // Cleanup resources

// Example
const manager = new WebGeocodingManager(document, 'main-container');
await manager.initialize();
await manager.getCurrentLocation();
```

---

## Event System

### Custom Events

```javascript
// Address fetched event
document.addEventListener(ADDRESS_FETCHED_EVENT, (event) => {
  console.log('Address data:', event.detail);
});

// Dispatch custom event
const event = new CustomEvent(ADDRESS_FETCHED_EVENT, {
  detail: { address: addressObject }
});
document.dispatchEvent(event);
```

---

## Complete Example

### Full Geolocation Workflow

```javascript
import { GeolocationService } from './src/services/GeolocationService.js';
import { ReverseGeocoder } from './src/services/ReverseGeocoder.js';
import { AddressExtractor } from './src/data/AddressExtractor.js';
import { HTMLPositionDisplayer } from './src/html/HTMLPositionDisplayer.js';
import { HTMLAddressDisplayer } from './src/html/HTMLAddressDisplayer.js';
import { SpeechSynthesisManager } from './src/speech/SpeechSynthesisManager.js';

async function completeWorkflow() {
  // 1. Get user's position
  const geoService = new GeolocationService();
  const position = await geoService.getCurrentPosition();
  
  // 2. Display coordinates
  const positionDisplayer = new HTMLPositionDisplayer(document, 'position-area');
  positionDisplayer.displayPosition(position);
  
  // 3. Fetch address
  const geocoder = new ReverseGeocoder(position.latitude, position.longitude);
  const nominatimData = await geocoder.fetchAddress();
  
  // 4. Extract Brazilian address
  const extractor = new AddressExtractor(nominatimData);
  const address = extractor.extractBrazilianAddress();
  
  // 5. Display address
  const addressDisplayer = new HTMLAddressDisplayer(document, 'address-area');
  addressDisplayer.displayAddress(address);
  
  // 6. Announce via speech
  const speechManager = new SpeechSynthesisManager();
  await speechManager.speak(`Você está em ${address.municipioCompleto()}`);
  
  console.log('Workflow complete!');
}

completeWorkflow();
```

---

## API Response Formats

### Nominatim Response (Abbreviated)

```json
{
  "place_id": 123456,
  "lat": "-23.550520",
  "lon": "-46.633309",
  "address": {
    "road": "Avenida Paulista",
    "suburb": "Bela Vista",
    "city": "São Paulo",
    "state": "São Paulo",
    "postcode": "01310-100",
    "country": "Brasil",
    "country_code": "br"
  },
  "boundingbox": [...],
  "display_name": "Avenida Paulista, ..."
}
```

### IBGE SIDRA Response (Abbreviated)

```json
[
  {
    "V": "12325232",
    "D1N": "São Paulo",
    "D1C": "3550308",
    "D2N": "2021"
  }
]
```

---

## Error Handling

### Common Errors

```javascript
// Geolocation denied
try {
  const position = await service.getCurrentPosition();
} catch (error) {
  if (error.code === 1) {
    console.error('User denied geolocation permission');
  }
}

// Network error
try {
  const address = await geocoder.fetchAddress();
} catch (error) {
  console.error('Address lookup failed:', error.message);
}

// Invalid coordinates
try {
  const position = new GeoPosition(91, 0); // Invalid latitude
} catch (error) {
  console.error('Invalid coordinates:', error.message);
}
```

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari |
|---------|--------|---------|--------|
| Geolocation API | 94+ | 93+ | 15+ |
| ES Modules | ✅ | ✅ | ✅ |
| Top-level await | ✅ | ✅ | ✅ |
| Speech Synthesis | ✅ | ✅ | ✅ (limited) |

---

## Further Reading

- **Getting Started**: [GETTING_STARTED.md](./GETTING_STARTED.md)
- **User Guide**: [USER_GUIDE.md](./user/USER_GUIDE.md)
- **Developer Guide**: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **Complete API**: [api/COMPLETE_API_REFERENCE.md](./api/COMPLETE_API_REFERENCE.md)

---

**Last Updated**: 2026-02-12  
**Version**: 0.9.0-alpha
