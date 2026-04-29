# API Documentation - Guia Turístico

**Version**: 0.17.2-alpha
**Last Updated**: 2026-04-27
**Service APIs Documentation Complete**: GeolocationService, ReverseGeocoder, ChangeDetectionCoordinator

## Overview

Guia Turístico provides a comprehensive set of APIs for building geolocation-aware tourist guide applications. The architecture is organized into distinct layers with clear responsibilities.

## API Organization

### Core APIs

Foundation classes providing essential data structures and state management.

- [**PositionManager**](./POSITION_MANAGER.md) - Singleton managing current geolocation state
- [**GeoPosition**](./API_REFERENCE.md#geoposition) - Immutable position value object
- [**GeocodingState**](./GEOCODING_STATE.md) - State machine for geocoding operations
- [**ObserverSubject**](./OBSERVER_SUBJECT.md) - Observer pattern implementation

### Service APIs

Services handling external integrations and browser APIs.

- [**GeolocationService**](./GEOLOCATION_SERVICE.md) - Browser Geolocation API wrapper
- [**ReverseGeocoder**](./REVERSE_GEOCODER.md) - OpenStreetMap Nominatim integration
- [**ChangeDetectionCoordinator**](./CHANGE_DETECTION_COORDINATOR.md) - Detects significant location changes

### Coordination APIs

Orchestration layer coordinating multiple services and components.

- [**WebGeocodingManager**](../architecture/WEB_GEOCODING_MANAGER.md) - Main application coordinator
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

- [**HTMLPositionDisplayer**](./API_REFERENCE.md#htmlpositiondisplayer) - Coordinate display and Google Maps integration
- [**HTMLAddressDisplayer**](./API_REFERENCE.md#htmladdressdisplayer) - Address formatting and display
- [**HTMLHighlightCardsDisplayer**](./API_REFERENCE.md#htmlhighlightcardsdisplayer) - Municipality and neighborhood highlight cards
- [**Reference place display components**](./API_COMPLETE_REFERENCE.md#displayui-apis) - Reference place rendering coverage in the consolidated UI API guide
- [**HTMLSidraDisplayer**](./API_REFERENCE.md#htmlsidradisplayer) - IBGE SIDRA demographic data display
- [**DisplayerFactory**](./DISPLAYER_FACTORY.md) - Factory for creating display components

### Speech Synthesis APIs

Text-to-speech functionality with queue management.

- [**SpeechSynthesisManager**](./SPEECH_SYNTHESIS_MANAGER.md) - Main facade for text-to-speech (Facade pattern)
- [**VoiceLoader**](./VOICE_LOADER.md) - Browser voice discovery and loading
- [**Speech internals**](./API_COMPLETE_REFERENCE.md#speech-synthesis-apis) - Queue, controller, and configuration coverage in the consolidated speech guide

### Performance & Timing APIs

Performance monitoring and timer management.

- [**Chronometer**](./API_REFERENCE.md#chronometer) - Performance timing and elapsed time tracking (Observer pattern)
- [**TimerManager**](./API_REFERENCE.md#timermanager) - Centralized timer management preventing memory leaks

### Status Management APIs

Application-wide status tracking.

- [**SingletonStatusManager**](./COMPLETE_API_REFERENCE.md#singletonstatusmanager) - Singleton for status management across components

### Utility APIs

Helper functions and utilities.

- [**distance**](./COMPLETE_API_REFERENCE.md#distance) - Distance calculation utilities (Haversine formula)
- [**logger**](./COMPLETE_API_REFERENCE.md#logger) - Logging utilities with DOM and console output
- [**device**](./COMPLETE_API_REFERENCE.md#device) - Device detection (mobile/desktop)
- [**accessibility**](./COMPLETE_API_REFERENCE.md#accessibility) - Accessibility utilities
- [**button-status**](./COMPLETE_API_REFERENCE.md#button-status) - Button state management

### Configuration APIs

Application configuration and constants.

- [**defaults**](./API_COMPLETE_REFERENCE.md#configuration) - Application configuration constants
- [**version**](./API_COMPLETE_REFERENCE.md#configuration) - Version information

### View Controllers

SPA route handlers and view logic.

- [**HomeView**](../architecture/VIEWS_LAYER.md) - Home view controller for location tracking (`src/views/home.js`)
- [**ConverterView**](../architecture/VIEWS_LAYER.md) - Coordinate converter view controller (`src/views/converter.js`)

## External API Integrations

- [**OpenStreetMap Nominatim**](../api-integration/NOMINATIM_INTEGRATION.md) - Reverse geocoding API
- [**IBGE API**](../guides/IBIRA_INTEGRATION.md) - Brazilian location data
- [**SIDRA API**](../guides/SIDRA_INTEGRATION.md) - Brazilian demographic statistics
- [**Google Maps**](./API_COMPLETE_REFERENCE.md#google-maps) - Map viewing and Street View

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

- **Issues**: [GitHub Issues](https://github.com/mpbarbosa/guia.js/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mpbarbosa/guia.js/discussions)
- **Documentation**: See [docs/](../) directory

---

**Quick Links**: [Architecture](../architecture/) | [Developer Guide](../developer/) | [Examples](../../examples/) | [Testing](../testing/)
