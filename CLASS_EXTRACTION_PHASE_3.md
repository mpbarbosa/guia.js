# Class Extraction Summary - Phase 3: Data Processing Layer

## Overview

Phase 3 of the class extraction initiative focuses on extracting data processing layer classes from `guia.js` into separate, focused modules following repository best practices established in Phase 1 and Phase 2.

## Target Classes

### Data Processing Layer Classes to Extract

1. **BrazilianStandardAddress** (lines 185-263)
   - Standardized Brazilian address structure
   - Formatting methods for complete addresses
   - Immutable pattern with filter/join operations
   - Dependencies: None (pure data structure)

2. **ReferencePlace** (lines 291-394)
   - Reference place data wrapper (shopping centers, subway stations, etc.)
   - OSM class/type to Portuguese description mapping
   - Immutable with Object.freeze()
   - Dependencies: setupParams (config)

3. **AddressExtractor** (lines 970-1080)
   - Extracts and standardizes address data from geocoding APIs
   - Supports Nominatim and OSM address tag formats
   - Creates BrazilianStandardAddress and ReferencePlace instances
   - Dependencies: BrazilianStandardAddress, ReferencePlace

4. **AddressCache** (lines 1109-2227)
   - LRU cache for address data
   - Change detection for address components (logradouro, bairro, municipio)
   - Observer pattern integration
   - Callback management for change notifications
   - Dependencies: ObserverSubject, AddressExtractor, BrazilianStandardAddress

## Extraction Strategy

### Phase 3 Goals

- Extract data processing layer classes to `src/data/` directory
- Maintain backward compatibility with existing code
- Follow established patterns from Phase 1 and Phase 2
- Preserve all functionality and API contracts
- Add integration tests for extracted modules

### Principles to Apply

Following repository best practices:

1. **Referential Transparency** (REFERENTIAL_TRANSPARENCY.md)
   - Pure functions where possible
   - Immutable data structures
   - Clear separation of side effects

2. **Low Coupling** (LOW_COUPLING_GUIDE.md)
   - Clear module boundaries
   - Dependency injection for testability
   - ES6 import/export

3. **High Cohesion** (HIGH_COHESION_GUIDE.md)
   - Single responsibility per module
   - Related functionality grouped together
   - Clear separation of concerns

4. **Folder Structure** (FOLDER_STRUCTURE_GUIDE.md)
   - Data processing classes in `src/data/`
   - Tests in `__tests__/integration/`

## Implementation Plan

### Step 1: Create Documentation ✅
- [x] Create CLASS_EXTRACTION_PHASE_3.md

### Step 2: Create src/data directory
- [ ] Create src/data/ directory for data processing modules

### Step 3: Extract BrazilianStandardAddress
- [ ] Create src/data/BrazilianStandardAddress.js
- [ ] Copy class implementation
- [ ] Add module documentation
- [ ] Export as default and named export

### Step 4: Extract ReferencePlace
- [ ] Create src/data/ReferencePlace.js
- [ ] Copy class implementation
- [ ] Add proper imports for dependencies (setupParams)
- [ ] Add module documentation
- [ ] Export as default and named export

### Step 5: Extract AddressExtractor
- [ ] Create src/data/AddressExtractor.js
- [ ] Copy class implementation
- [ ] Add proper imports for dependencies
- [ ] Add module documentation
- [ ] Export as default and named export

### Step 6: Extract AddressCache
- [ ] Create src/data/AddressCache.js
- [ ] Copy class implementation
- [ ] Add proper imports for dependencies
- [ ] Add module documentation
- [ ] Export as default and named export

### Step 7: Update guia.js
- [ ] Import extracted data processing classes
- [ ] Remove extracted class definitions
- [ ] Re-export classes for backward compatibility
- [ ] Maintain window.* globals for browser usage
- [ ] Verify syntax with `npm run validate`

### Step 8: Create Integration Tests
- [ ] Create __tests__/integration/data-modules.test.js
- [ ] Test module imports
- [ ] Test class instantiation
- [ ] Test basic functionality
- [ ] Test module interactions

### Step 9: Validation
- [ ] Run syntax validation: `npm run validate`
- [ ] Run all tests: `npm test`
- [ ] Verify test pass rate remains ≥94%
- [ ] Check backward compatibility
- [ ] Measure file size reduction

### Step 10: Update Documentation
- [ ] Update CLASS_EXTRACTION_SUMMARY.md with Phase 3 completion
- [ ] Document final metrics and results

## Expected Outcomes

### File Size Metrics
- **Before**: guia.js ~4210 lines
- **Target After**: guia.js ~2770 lines (34% reduction)
- **New modules**: ~1440 lines (with enhanced documentation)

### Quality Improvements
- Clear data processing layer boundaries
- Better testability through module isolation
- Improved code organization
- Enhanced maintainability
- Foundation for Phase 4 (Presentation Layer)

## Dependencies and Relationships

### BrazilianStandardAddress Dependencies
- **Uses**: None (pure data structure)
- **Used by**: AddressExtractor, AddressCache, HTMLAddressDisplayer

### ReferencePlace Dependencies
- **Uses**: setupParams (configuration)
- **Used by**: AddressExtractor

### AddressExtractor Dependencies
- **Uses**: BrazilianStandardAddress, ReferencePlace
- **Used by**: AddressCache, AddressDataExtractor (legacy wrapper)

### AddressCache Dependencies
- **Uses**: ObserverSubject, AddressExtractor, BrazilianStandardAddress
- **Used by**: AddressDataExtractor (legacy wrapper), WebGeocodingManager

## Progress Tracking

### Completion Status
- **Phase 1**: ✅ Complete (GeoPosition, ObserverSubject, PositionManager)
- **Phase 2**: ✅ Complete (ReverseGeocoder, GeolocationService, ChangeDetectionCoordinator)
- **Phase 3**: ⏳ In Progress (BrazilianStandardAddress, ReferencePlace, AddressExtractor, AddressCache)
- **Phase 4**: ⏳ Planned (Presentation Layer)

### Current Task
**Phase 3 Extraction - Data Processing Layer**

Extracting core data processing classes to improve code organization and establish clear boundaries between data processing and other layers.

## Notes

- Following the successful extraction pattern established in Phase 1 and Phase 2
- All extractions maintain full backward compatibility
- Each module is self-contained with proper dependency injection
- Tests validate module functionality and integration
- Documentation includes JSDoc comments and usage examples
- BrazilianStandardAddress has no external dependencies, making it the ideal starting point
- ReferencePlace depends only on configuration, minimal coupling
- AddressExtractor depends on the two classes above
- AddressCache is the most complex, depends on all others plus ObserverSubject
