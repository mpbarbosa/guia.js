# Finding Classes After Modularization

This guide helps locate classes and functions after the Phase 2-16 modularization of `guia.js`.

## Quick Reference: Old guia.js → New Module Locations

| Component | Original Location (guia.js) | New Location | Phase |
|-----------|----------------------------|--------------|-------|
| **Core Classes** | | | |
| `GeoPosition` | Lines ~100-200 | `src/core/GeoPosition.js` | Phase 3 |
| `PositionManager` | Lines ~200-350 | `src/core/PositionManager.js` | Phase 4 |
| `ObserverSubject` | Lines ~350-400 | `src/core/ObserverSubject.js` | Phase 5 |
| **Services** | | | |
| `GeolocationService` | Lines ~400-600 | `src/services/GeolocationService.js` | Phase 7 |
| `ReverseGeocoder` | Lines ~600-800 | `src/services/ReverseGeocoder.js` | Phase 8 |
| `ChangeDetectionCoordinator` | Lines ~800-900 | `src/services/ChangeDetectionCoordinator.js` | Phase 9 |
| **Data Processing** | | | |
| `BrazilianStandardAddress` | Lines ~900-1200 | `src/data/BrazilianStandardAddress.js` | Phase 10 |
| `AddressExtractor` | Lines ~1200-1400 | `src/data/AddressExtractor.js` | Phase 11 |
| `AddressCache` | Lines ~1400-1500 | `src/data/AddressCache.js` | Phase 12 |
| `ReferencePlace` | Lines ~1500-1600 | `src/data/ReferencePlace.js` | Phase 13 |
| `AddressDataExtractor` | Lines ~1600-1800 | `src/data/AddressDataExtractor.js` | Phase 14 |
| **HTML Display** | | | |
| `HTMLPositionDisplayer` | Lines ~1800-2200 | `src/html/HTMLPositionDisplayer.js` | Phase 15 |
| `HTMLAddressDisplayer` | Lines ~2200-2600 | `src/html/HTMLAddressDisplayer.js` | Phase 15 |
| `HTMLReferencePlaceDisplayer` | Lines ~2600-2800 | `src/html/HTMLReferencePlaceDisplayer.js` | Phase 15 |
| `HtmlText` | Lines ~2800-2900 | `src/html/HtmlText.js` | Phase 15 |
| `DisplayerFactory` | Lines ~2900-3000 | `src/html/DisplayerFactory.js` | Phase 15 |
| `HtmlSpeechSynthesisDisplayer` | Lines ~3000-3100 | `src/html/HtmlSpeechSynthesisDisplayer.js` | Phase 15 |
| **Speech** | | | |
| `SpeechSynthesisManager` | Lines ~3100-3400 | `src/speech/SpeechSynthesisManager.js` | Phase 6 |
| `SpeechQueue` | Lines ~3400-3500 | `src/speech/SpeechQueue.js` | Phase 6 |
| `SpeechItem` | Lines ~3500-3600 | `src/speech/SpeechItem.js` | Phase 6 |
| **Timing** | | | |
| `Chronometer` | Lines ~3600-3800 | `src/timing/Chronometer.js` | Phase 2 |
| **Coordination** | | | |
| `WebGeocodingManager` | Lines ~3800-4500 | `src/coordination/WebGeocodingManager.js` | Phase 16 |
| **Status** | | | |
| `SingletonStatusManager` | Lines ~4500-4600 | `src/status/SingletonStatusManager.js` | Phase 2 |
| **Utilities** | | | |
| `calculateDistance()` | Lines ~50-100 | `src/utils/distance.js` | Module Split |
| `log()`, `warn()` | Lines ~30-50 | `src/utils/logger.js` | Module Split |
| `isMobileDevice()` | Lines ~4600-4700 | `src/utils/device.js` | Module Split |
| **Configuration** | | | |
| Version, Constants | Lines ~1-30 | `src/config/defaults.js` | Module Split |
| **IBGE Integration** | | | |
| `renderUrlUFNome()` | Separate file | `src/guia_ibge.js` | Original |

## Module Organization

### Directory Structure

```
src/
├── guia.js (468 lines)           # Main entry point, exports
├── guia_ibge.js                  # IBGE API utilities
├── core/                         # Core classes (Phases 3-5)
│   ├── GeoPosition.js            # Geographic position value object
│   ├── PositionManager.js        # Singleton position manager
│   └── ObserverSubject.js        # Observer pattern base
├── services/                     # Service classes (Phases 7-9)
│   ├── GeolocationService.js     # Browser geolocation wrapper
│   ├── ReverseGeocoder.js        # Nominatim API integration
│   └── ChangeDetectionCoordinator.js  # Position change detection
├── data/                         # Data processing (Phases 10-14)
│   ├── BrazilianStandardAddress.js    # Address standardization
│   ├── AddressExtractor.js       # Address data extraction
│   ├── AddressCache.js           # Address caching
│   ├── ReferencePlace.js         # Reference location handling
│   └── AddressDataExtractor.js   # Complete address extraction
├── html/                         # Display components (Phase 15)
│   ├── HTMLPositionDisplayer.js  # Position display
│   ├── HTMLAddressDisplayer.js   # Address display
│   ├── HTMLReferencePlaceDisplayer.js  # Reference place display
│   ├── HtmlText.js               # Text display utilities
│   ├── DisplayerFactory.js       # Display component factory
│   └── HtmlSpeechSynthesisDisplayer.js  # Speech display
├── speech/                       # Speech synthesis (Phase 6)
│   ├── SpeechSynthesisManager.js # Main speech manager
│   ├── SpeechQueue.js            # Speech queue
│   └── SpeechItem.js             # Individual speech items
├── timing/                       # Timing utilities (Phase 2)
│   └── Chronometer.js            # Event timing
├── coordination/                 # Orchestration (Phase 16)
│   └── WebGeocodingManager.js    # Main coordinator
├── status/                       # Status management (Phase 2)
│   └── SingletonStatusManager.js # Status singleton
├── utils/                        # Utility functions
│   ├── distance.js               # Distance calculations
│   ├── logger.js                 # Logging utilities
│   └── device.js                 # Device detection
└── config/                       # Configuration
    └── defaults.js               # Version and constants
```

## Finding Classes by Functionality

### Geolocation Features
- **Get current position**: `GeolocationService` → `src/services/GeolocationService.js`
- **Store position**: `PositionManager` → `src/core/PositionManager.js`
- **Position value object**: `GeoPosition` → `src/core/GeoPosition.js`
- **Detect changes**: `ChangeDetectionCoordinator` → `src/services/ChangeDetectionCoordinator.js`

### Address Processing
- **Reverse geocoding**: `ReverseGeocoder` → `src/services/ReverseGeocoder.js`
- **Brazilian addresses**: `BrazilianStandardAddress` → `src/data/BrazilianStandardAddress.js`
- **Extract address data**: `AddressExtractor` → `src/data/AddressExtractor.js`
- **Cache addresses**: `AddressCache` → `src/data/AddressCache.js`
- **Complete extraction**: `AddressDataExtractor` → `src/data/AddressDataExtractor.js`

### Display Components
- **Show coordinates**: `HTMLPositionDisplayer` → `src/html/HTMLPositionDisplayer.js`
- **Show address**: `HTMLAddressDisplayer` → `src/html/HTMLAddressDisplayer.js`
- **Show reference place**: `HTMLReferencePlaceDisplayer` → `src/html/HTMLReferencePlaceDisplayer.js`
- **Create displayers**: `DisplayerFactory` → `src/html/DisplayerFactory.js`

### Speech Synthesis
- **Manage speech**: `SpeechSynthesisManager` → `src/speech/SpeechSynthesisManager.js`
- **Queue speech**: `SpeechQueue` → `src/speech/SpeechQueue.js`
- **Speech items**: `SpeechItem` → `src/speech/SpeechItem.js`

### Coordination
- **Main coordinator**: `WebGeocodingManager` → `src/coordination/WebGeocodingManager.js`
- **Status management**: `SingletonStatusManager` → `src/status/SingletonStatusManager.js`

## Import Examples

### Before Modularization (all from guia.js)
```javascript
// Everything was in one file
const position = new GeoPosition(coords);
const manager = PositionManager.getInstance();
const service = new GeolocationService(navigator.geolocation);
```

### After Modularization (ES6 imports)
```javascript
// Import specific modules
import { GeoPosition } from './src/core/GeoPosition.js';
import { PositionManager } from './src/core/PositionManager.js';
import { GeolocationService } from './src/services/GeolocationService.js';

const position = new GeoPosition(coords);
const manager = PositionManager.getInstance();
const service = new GeolocationService(navigator.geolocation);
```

### Browser Usage (via guia.js exports)
```html
<script type="module" src="src/guia.js"></script>
<script type="module">
  // All classes exported through window object
  const position = new window.GeoPosition(coords);
  const manager = window.PositionManager.getInstance();
</script>
```

## Test File Locations

Tests follow the same structure as source files:

```
__tests__/
├── unit/
│   ├── GeoPosition.test.js
│   ├── PositionManager.test.js
│   ├── GeolocationService.test.js
│   └── ...
├── integration/
│   ├── WebGeocodingManager.integration.test.js
│   └── ...
├── features/
│   ├── AddressExtraction.test.js
│   └── ...
└── managers/
    └── ...
```

## Documentation References

### Phase Documentation
- [Phase 2](CLASS_EXTRACTION_PHASE_2.md) - Chronometer, SingletonStatusManager
- [Phase 3](CLASS_EXTRACTION_PHASE_3.md) - GeoPosition
- [Phase 4](CLASS_EXTRACTION_PHASE_4.md) - PositionManager
- [Phase 5](CLASS_EXTRACTION_PHASE_5.md) - ObserverSubject
- [Phase 6](CLASS_EXTRACTION_PHASE_6.md) - Speech synthesis classes
- [Phase 7](CLASS_EXTRACTION_PHASE_7.md) - GeolocationService
- [Phase 8](CLASS_EXTRACTION_PHASE_8.md) - ReverseGeocoder
- [Phase 9](CLASS_EXTRACTION_PHASE_9.md) - ChangeDetectionCoordinator
- [Phase 10](CLASS_EXTRACTION_PHASE_10.md) - BrazilianStandardAddress
- [Phase 11](CLASS_EXTRACTION_PHASE_11.md) - AddressExtractor
- [Phase 12](CLASS_EXTRACTION_PHASE_12.md) - AddressCache
- [Phase 13](CLASS_EXTRACTION_PHASE_13.md) - ReferencePlace
- [Phase 14](CLASS_EXTRACTION_PHASE_14.md) - AddressDataExtractor
- [Phase 15](CLASS_EXTRACTION_PHASE_15.md) - HTML display classes
- [Phase 16](CLASS_EXTRACTION_PHASE_16.md) - WebGeocodingManager

### Summary Documents
- [Class Extraction Summary](CLASS_EXTRACTION_SUMMARY.md) - Overview of all phases
- [Module Splitting Summary](MODULE_SPLITTING_SUMMARY.md) - Technical implementation details

## Migration Tips

1. **Update Imports**: Replace relative line references with module imports
2. **Check Dependencies**: Each module lists its dependencies in JSDoc `@module` tags
3. **Review Tests**: Each extracted class has corresponding test files
4. **Check Documentation**: Each module has inline JSDoc documentation
5. **Use IDE Navigation**: Modern IDEs can jump to definitions across modules

## Statistics

- **Original guia.js**: 6,055+ lines
- **Current guia.js**: 468 lines
- **Reduction**: 93% (5,587 lines extracted)
- **Total Modules**: 29 files
- **Phases Completed**: 16
- **Test Coverage**: ~70% overall

---

**Last Updated**: 2026-01-01  
**Version**: 0.6.0-alpha
