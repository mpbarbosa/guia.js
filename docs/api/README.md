# API Documentation - Guia Turístico

**Version**: 0.9.0-alpha  
**Last Updated**: 2026-02-09  
**Service APIs Documentation Complete**: GeolocationService, ReverseGeocoder, ChangeDetectionCoordinator

## Overview

Guia Turístico provides a comprehensive set of APIs for building geolocation-aware tourist guide applications. The architecture is organized into distinct layers with clear responsibilities.

## API Organization

### Core APIs
Foundation classes providing essential data structures and state management.

- [**PositionManager**](./POSITION_MANAGER.md) - Singleton managing current geolocation state
- [**GeoPosition**](./GEO_POSITION.md) - Immutable position value object
- [**GeocodingState**](./GEOCODING_STATE.md) - State machine for geocoding operations
- [**ObserverSubject**](./OBSERVER_SUBJECT.md) - Observer pattern implementation

### Service APIs
Services handling external integrations and browser APIs.

- [**GeolocationService**](./GEOLOCATION_SERVICE.md) - Browser Geolocation API wrapper
- [**ReverseGeocoder**](./REVERSE_GEOCODER.md) - OpenStreetMap Nominatim integration
- [**ChangeDetectionCoordinator**](./CHANGE_DETECTION_COORDINATOR.md) - Detects significant location changes

### Coordination APIs
Orchestration layer coordinating multiple services and components.

- [**WebGeocodingManager**](./WEB_GEOCODING_MANAGER.md) - Main application coordinator
- [**ServiceCoordinator**](./SERVICE_COORDINATOR.md) - Service lifecycle management
- [**EventCoordinator**](./EVENT_COORDINATOR.md) - Event-based coordination
- [**SpeechCoordinator**](./SPEECH_COORDINATOR.md) - Speech synthesis coordination
- [**UICoordinator**](./UI_COORDINATOR.md) - UI component coordination

### Data Processing APIs
Classes for data extraction, transformation, and caching.

- [**BrazilianStandardAddress**](./BRAZILIAN_STANDARD_ADDRESS.md) - Brazilian address standardization
- [**AddressExtractor**](./ADDRESS_EXTRACTOR.md) - Address data extraction from API responses
- [**AddressDataExtractor**](./ADDRESS_DATA_EXTRACTOR.md) - Complete address data processing pipeline
- [**AddressCache**](./ADDRESS_CACHE.md) - Address caching with LRU eviction
- [**ReferencePlace**](./REFERENCE_PLACE.md) - Reference location handling and categorization
- [**LRUCache**](./LRU_CACHE.md) - Generic LRU cache implementation

### UI/Display APIs
Components for rendering geographic data in the browser.

- [**HTMLPositionDisplayer**](./HTML_POSITION_DISPLAYER.md) - Coordinate display and Google Maps integration
- [**HTMLAddressDisplayer**](./HTML_ADDRESS_DISPLAYER.md) - Address formatting and display
- [**HTMLHighlightCardsDisplayer**](./HTML_HIGHLIGHT_CARDS_DISPLAYER.md) - Municipality and neighborhood highlight cards
- [**HTMLReferencePlaceDisplayer**](./HTML_REFERENCE_PLACE_DISPLAYER.md) - Reference place display
- [**HTMLSidraDisplayer**](./HTML_SIDRA_DISPLAYER.md) - IBGE SIDRA demographic data display
- [**DisplayerFactory**](./DISPLAYER_FACTORY.md) - Factory for creating display components
- [**HtmlText**](./HTML_TEXT.md) - Text display utilities

### Speech Synthesis APIs
Text-to-speech functionality with queue management.

- [**SpeechSynthesisManager**](./SPEECH_SYNTHESIS_MANAGER.md) - Main facade for text-to-speech (Facade pattern)
- [**SpeechController**](./SPEECH_CONTROLLER.md) - Core speech synthesis control
- [**SpeechQueueProcessor**](./SPEECH_QUEUE_PROCESSOR.md) - Queue processing and execution
- [**SpeechConfiguration**](./SPEECH_CONFIGURATION.md) - Configuration management
- [**VoiceManager**](./VOICE_MANAGER.md) - Voice selection and management
- [**SpeechQueue**](./SPEECH_QUEUE.md) - Speech queue data structure
- [**SpeechItem**](./SPEECH_ITEM.md) - Individual speech item

### Performance & Timing APIs
Performance monitoring and timer management.

- [**Chronometer**](./CHRONOMETER.md) - Performance timing and elapsed time tracking (Observer pattern)
- [**TimerManager**](./TIMER_MANAGER.md) - Centralized timer management preventing memory leaks

### Status Management APIs
Application-wide status tracking.

- [**SingletonStatusManager**](./SINGLETON_STATUS_MANAGER.md) - Singleton for status management across components

### Utility APIs
Helper functions and utilities.

- [**distance**](./DISTANCE.md) - Distance calculation utilities (Haversine formula)
- [**logger**](./LOGGER.md) - Logging utilities with DOM and console output
- [**device**](./DEVICE.md) - Device detection (mobile/desktop)
- [**accessibility**](./ACCESSIBILITY.md) - Accessibility utilities
- [**button-utils**](./BUTTON_UTILS.md) - Button state management

### Configuration APIs
Application configuration and constants.

- [**defaults**](./DEFAULTS.md) - Application configuration constants
- [**version**](./VERSION.md) - Version information

### View Controllers
SPA route handlers and view logic.

- [**HomeView**](./HOME_VIEW.md) - Home view controller for location tracking (`src/views/home.js`)
- [**ConverterView**](./CONVERTER_VIEW.md) - Coordinate converter view controller (`src/views/converter.js`)

## External API Integrations

- [**OpenStreetMap Nominatim**](./NOMINATIM_INTEGRATION.md) - Reverse geocoding API
- [**IBGE API**](./IBGE_INTEGRATION.md) - Brazilian location data
- [**SIDRA API**](./SIDRA_INTEGRATION.md) - Brazilian demographic statistics
- [**Google Maps**](./GOOGLE_MAPS_INTEGRATION.md) - Map viewing and Street View

## Design Patterns

The codebase uses several design patterns consistently:

- **Singleton Pattern**: PositionManager, SingletonStatusManager, TimerManager
- **Observer Pattern**: ObserverSubject, Chronometer, various coordinators
- **Factory Pattern**: DisplayerFactory
- **Facade Pattern**: SpeechSynthesisManager
- **Value Object Pattern**: GeoPosition, BrazilianStandardAddress
- **State Pattern**: GeocodingState

## API Usage Examples

### Getting Current Position

```javascript
import { PositionManager } from './core/PositionManager.js';

const positionManager = PositionManager.getInstance();
const currentPosition = positionManager.getPosition();

console.log(`Latitude: ${currentPosition.latitude}`);
console.log(`Longitude: ${currentPosition.longitude}`);
```

### Reverse Geocoding

```javascript
import { ReverseGeocoder } from './services/ReverseGeocoder.js';

const geocoder = new ReverseGeocoder(-23.550520, -46.633309);
geocoder.addObserver('fetchCompleted', (addressData) => {
  console.log('Address:', addressData);
});

await geocoder.fetchAddress();
```

### Address Standardization

```javascript
import { BrazilianStandardAddress } from './data/BrazilianStandardAddress.js';

const address = new BrazilianStandardAddress();
address.municipio = 'Recife';
address.uf = 'PE';
address.regiaoMetropolitana = 'Região Metropolitana de Recife';

console.log(address.municipioCompleto()); // "Recife, PE"
console.log(address.regiaoMetropolitanaFormatada()); // "Região Metropolitana de Recife"
```

### Speech Synthesis

```javascript
import { SpeechSynthesisManager } from './speech/SpeechSynthesisManager.js';

const speechManager = new SpeechSynthesisManager();
speechManager.speak('Bem-vindo ao Guia Turístico', { lang: 'pt-BR' });
```

### Timer Management

```javascript
import { TimerManager } from './utils/TimerManager.js';

const timerManager = TimerManager.getInstance();
const intervalId = timerManager.setInterval(() => {
  console.log('Periodic update');
}, 1000);

// Cleanup when done
timerManager.clearInterval(intervalId);
```

## API Conventions

### Naming Conventions

- **Classes**: PascalCase (e.g., `PositionManager`)
- **Methods**: camelCase (e.g., `getPosition()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `ADDRESS_FETCHED_EVENT`)
- **Private methods**: Prefix with underscore `_privateMethod()`

### Immutability

The codebase follows immutability principles:
- Use spread operator for arrays: `[...array]`
- Use spread operator for objects: `{...object}`
- Use `filter()`, `map()`, `reduce()` instead of mutation methods
- Avoid `push()`, `pop()`, `splice()`, `sort()` on original arrays

See [`.github/CONTRIBUTING.md`](../../.github/CONTRIBUTING.md) for comprehensive guidelines.

### Error Handling

- API methods throw errors for invalid inputs
- Async methods return rejected promises on failure
- User-facing errors are logged with `logger.warn()` or `logger.error()`
- Network errors are caught and handled gracefully

### Browser Compatibility

- **Minimum versions**: Chrome 90+, Firefox 88+, Safari 14+
- **Required APIs**: Geolocation API, Speech Synthesis API (optional)
- **Polyfills**: None required for modern browsers

## Testing

All APIs have comprehensive test coverage:
- **Unit tests**: `__tests__/unit/`
- **Integration tests**: `__tests__/integration/`
- **E2E tests**: `__tests__/e2e/`

Run tests with: `npm test`

## Related Documentation

- [Architecture Guide](../architecture/COMPREHENSIVE_GUIDE.md)
- [Developer Guide](../developer/DEVELOPER_GUIDE.md)
- [User Guide](../user/USER_GUIDE.md)
- [Testing Guide](../testing/TESTING.md)
- [Contributing Guidelines](../../.github/CONTRIBUTING.md)

## API Stability

- **Stable APIs**: Core, Services, Data Processing layers
- **Beta APIs**: Speech Synthesis (may change)
- **Experimental APIs**: None

## Deprecation Policy

Deprecated APIs are marked with `@deprecated` JSDoc tags and logged warnings. APIs remain functional for at least two minor versions before removal.

## Support

- **Issues**: [GitHub Issues](https://github.com/mpbarbosa/guia_turistico/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mpbarbosa/guia_turistico/discussions)
- **Documentation**: See [docs/](../) directory

---

**Quick Links**: [Architecture](../architecture/) | [Developer Guide](../developer/) | [Examples](../examples/) | [Testing](../testing/)
