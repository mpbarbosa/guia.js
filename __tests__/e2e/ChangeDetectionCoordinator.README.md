# ChangeDetectionCoordinator E2E Test Documentation

## Overview

This end-to-end test suite validates the `ChangeDetectionCoordinator` class, which manages callback-based change detection for address components (logradouro, bairro, municipio) and coordinates observer notifications.

## Test File

`__tests__/e2e/ChangeDetectionCoordinator.e2e.test.js`

## What Is Being Tested

### Core Functionality

1. **Change Detection Setup and Lifecycle**
   - Initialization of ChangeDetectionCoordinator with all callbacks
   - Proper setup of AddressDataExtractor reference
   - Registration of change detection callbacks
   - Cleanup and callback removal

2. **Logradouro (Street) Change Detection**
   - Detection of street changes when moving within same neighborhood
   - Observer notification with correct changeDetails
   - Verification of previous and current logradouro values

3. **Bairro (Neighborhood) Change Detection**
   - Detection of neighborhood boundary crossings
   - UI update of bairro highlight card
   - Observer notification with bairro-specific data
   - Validation of change propagation through observer pattern

4. **Municipio (City) Change Detection**
   - Detection of city boundary crossings
   - UI update of municipio highlight card
   - Observer notification with full address data
   - Verification of cross-city navigation handling

5. **Observer Notification Mechanism**
   - Multiple observers receive change notifications
   - Error handling for failing observers
   - Notification chain continues despite errors
   - Function observers receive full context

6. **changeDetails Parameter Structure**
   - Correct structure provided to observers
   - Contains `previous`, `current`, and `hasChanged` properties
   - Previous and current values are properly differentiated

## Test Route

The test simulates a user moving through different locations:

1. **Initial Position - Centro SP**
   - Latitude: -23.550520, Longitude: -46.633309
   - Logradouro: Praça da República
   - Bairro: República
   - Municipio: São Paulo

2. **Same Bairro Different Street**
   - Latitude: -23.551000, Longitude: -46.634000
   - Logradouro: Rua 7 de Abril
   - Bairro: República (same)
   - Municipio: São Paulo (same)
   - **Triggers**: Logradouro change only

3. **Different Bairro Same City**
   - Latitude: -23.565209, Longitude: -46.664850
   - Logradouro: Avenida Paulista
   - Bairro: Jardim Paulista (changed)
   - Municipio: São Paulo (same)
   - **Triggers**: Logradouro + Bairro change

4. **Different City - Campinas**
   - Latitude: -22.907104, Longitude: -47.063240
   - Logradouro: Avenida Francisco Glicério
   - Bairro: Centro (changed)
   - Municipio: Campinas (changed)
   - **Triggers**: Logradouro + Bairro + Municipio change

## Test Scenarios

### 1. Change Detection Setup and Lifecycle

**Test**: Initialize ChangeDetectionCoordinator with all callbacks
- Validates that coordinator has AddressDataExtractor reference
- Checks that callbacks are registered (implementation-dependent)

**Test**: Remove all callbacks on cleanup
- Calls `removeAllChangeDetection()`
- Verifies all callbacks are cleared/nulled

### 2. Logradouro Change Detection

**Test**: Detect logradouro change when moving to different street
- Sets up change event tracking
- Moves from República to Rua 7 de Abril
- Verifies `LogradouroChanged` event is fired
- Validates changeDetails contains correct values

### 3. Bairro Change Detection

**Test**: Detect bairro change when crossing neighborhood boundary
- Tracks bairro change events
- Moves from República to Jardim Paulista
- Verifies `BairroChanged` event is fired
- Validates previous and current bairro values

**Test**: Update bairro card in UI when bairro changes
- Checks initial bairro value in UI
- Moves to different bairro
- Verifies UI element updates with new bairro name

### 4. Municipio Change Detection

**Test**: Detect municipio change when crossing city boundary
- Tracks municipio change events
- Moves from São Paulo to Campinas
- Verifies `MunicipioChanged` event is fired
- Validates previous and current municipio values

**Test**: Update municipio card in UI when city changes
- Checks initial municipio value in UI
- Moves to different city
- Verifies UI element updates with new municipio name

### 5. Observer Notification

**Test**: Notify all registered observers of changes
- Registers two observers
- Triggers location change
- Verifies both observers receive notifications

**Test**: Handle observer errors without breaking notification chain
- Registers observer that throws error
- Registers normal observer after error-throwing observer
- Verifies normal observer still gets called despite error

### 6. changeDetails Structure

**Test**: Provide correct changeDetails structure to observers
- Captures changeDetails from observer callback
- Validates structure: `hasChanged`, `previous`, `current`
- Verifies previous and current values are different
- Ensures all expected properties are defined

## Mock Configuration

### Nominatim API Mocking

The test mocks OpenStreetMap Nominatim API responses for each test location:

```javascript
MOCK_NOMINATIM_RESPONSES = {
    '-23.55052,-46.633309': { /* República response */ },
    '-23.551,-46.634': { /* Rua 7 de Abril response */ },
    '-23.565209,-46.66485': { /* Jardim Paulista response */ },
    '-22.907104,-47.06324': { /* Campinas response */ }
}
```

### Geolocation API Mocking

The test overrides `navigator.geolocation.getCurrentPosition` to simulate GPS position updates:

```javascript
navigator.geolocation.getCurrentPosition = (success) => {
    success({
        coords: {
            latitude: pos.latitude,
            longitude: pos.longitude,
            accuracy: 10
        }
    });
};
```

## Test Infrastructure

- **Browser**: Puppeteer headless Chrome
- **Server**: Local HTTP server on port 9877
- **Request Interception**: Mocks Nominatim API calls
- **CORS**: Enabled for cross-origin requests
- **Timeouts**: 2-3 second waits for async operations

## Expected Results

### Passing Tests (8 total)

✅ Change Detection Setup and Lifecycle (2 tests)
✅ Logradouro Change Detection (1 test)
✅ Bairro Change Detection (2 tests)
✅ Municipio Change Detection (2 tests)
✅ Observer Notification and Error Handling (2 tests)
✅ changeDetails Parameter Structure (1 test)

### Test Execution

```bash
# Run all E2E tests
npm test -- __tests__/e2e/

# Run only ChangeDetectionCoordinator tests
npm test -- __tests__/e2e/ChangeDetectionCoordinator.e2e.test.js

# Run with verbose output
npm test -- __tests__/e2e/ChangeDetectionCoordinator.e2e.test.js --verbose
```

## Key Assertions

1. **Change Detection**:
   - `expect(logradouroChanges.length).toBeGreaterThan(0)`
   - `expect(changeDetails.hasChanged).toBe(true)`

2. **UI Updates**:
   - `expect(updatedBairro).toBe(TEST_ROUTE[2].expected.bairro)`
   - `expect(updatedMunicipio).toContain(TEST_ROUTE[3].expected.municipio)`

3. **Observer Notifications**:
   - `expect(calls.observer1).toBeGreaterThan(0)`
   - `expect(goodObserverCalled).toBe(true)`

4. **Data Structure**:
   - `expect(changeDetails.hasPrevious).toBe(true)`
   - `expect(changeDetails.currentBairro).not.toBe(changeDetails.previousBairro)`

## Debugging Tips

### Test Failures

1. **Timeout Issues**: Increase wait times for slower systems
2. **Mock Responses**: Verify coordinate keys match exactly
3. **Observer Registration**: Check if observers are properly added before triggers
4. **UI Selectors**: Ensure element IDs match (home-municipio-value, home-location-type-value)

### Console Logging

Add logging to page context:

```javascript
await page.evaluate(() => {
    console.log('Current observers:', window.webGeocodingManager.observerSubject.observers.length);
});
```

View console output:

```javascript
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
```

## Related Files

- **Source**: `src/services/ChangeDetectionCoordinator.js`
- **Dependencies**:
  - `src/core/ObserverSubject.js`
  - `src/utils/logger.js`
  - `src/data/AddressDataExtractor.js`
- **UI Components**:
  - `src/html/HTMLHighlightCardsDisplayer.js`
  - `src/views/home.js`

## Implementation Notes

### Version History

- **v0.8.7-alpha**: ChangeDetectionCoordinator extracted from guia.js
- Replaces timer-based polling with callback mechanism
- Improves performance by eliminating continuous checks
- Provides rich changeDetails to observers

### Architecture

```
ChangeDetectionCoordinator
├── setupChangeDetection()
│   ├── setupLogradouroChangeDetection()
│   ├── setupBairroChangeDetection()
│   └── setupMunicipioChangeDetection()
├── Handle Changes
│   ├── handleLogradouroChange()
│   ├── handleBairroChange()
│   └── handleMunicipioChange()
└── Notify Observers
    ├── notifyLogradouroChangeObservers()
    ├── notifyBairroChangeObservers()
    └── notifyMunicipioChangeObservers()
```

## Contributing

When modifying ChangeDetectionCoordinator:

1. Ensure all tests pass
2. Add new tests for new functionality
3. Update this README with new test scenarios
4. Verify error handling coverage
5. Test with real geolocation data

## License

MIT License - See LICENSE file for details

## Author

Marcelo Pereira Barbosa
