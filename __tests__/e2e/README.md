# End-to-End Test Suite

This directory contains comprehensive end-to-end (E2E) tests for the Guia.js application. These tests validate complete workflows and multi-component interactions as they would occur in production.

## Overview

**Total E2E Tests: 76 tests across 5 test files**

The E2E test suite covers:
- Complete application workflows from initialization to user output
- Multi-component integration and coordination
- Error handling and recovery scenarios
- Brazilian address processing pipeline
- Real-world navigation scenarios
- Speech synthesis and change detection integration

## Test Files

### 1. CompleteGeolocationWorkflow.e2e.test.js (19 tests)

Tests the complete geolocation workflow from start to finish:

**What it tests:**
- Application initialization
- Geolocation position acquisition
- Reverse geocoding (coordinates → address)
- Address data extraction and formatting
- Display rendering (HTML + speech)
- Observer pattern notifications
- Error handling during workflow
- Performance characteristics

**Key scenarios:**
- Full workflow: Startup → Position → Geocode → Display
- Position updates triggering change detection
- Integration of Manager → Position → Geocoder → Address
- Graceful error handling for invalid data
- Observer notifications on position changes
- Workflow completion time validation

**Example test:**
```javascript
test('should execute complete workflow from geolocation to display', async () => {
    // 1. Initialize position
    const position = new GeoPosition(mockCoords);
    
    // 2. Reverse geocode
    const addressData = await geocoder.getReverseGeocodedData(...);
    
    // 3. Extract Brazilian address
    const brazilianAddress = AddressDataExtractor.getBrazilianStandardAddress(addressData);
    
    // 4. Verify complete workflow
    expect(brazilianAddress.municipio).toBe('São Paulo');
});
```

### 2. AddressChangeAndSpeech.e2e.test.js (21 tests)

Tests address change detection and speech synthesis integration:

**What it tests:**
- Position change detection
- Address component comparison (município, bairro, logradouro)
- Change event generation
- Speech priority management
- Speech queue processing
- Speech synthesis execution
- Immediate speech for critical changes

**Key scenarios:**
- Municipality change → high-priority speech
- Neighborhood (bairro) change → normal-priority speech
- Street change → low-priority speech
- Priority ordering in speech queue
- Sequential speech processing
- Driving scenario with multiple changes
- Immediate speech processing

**Example test:**
```javascript
test('should detect municipality change and trigger high-priority speech', async () => {
    // 1. Create addresses
    const address1 = getBrazilianStandardAddress({ city: 'São Paulo' });
    const address2 = getBrazilianStandardAddress({ city: 'Campinas' });
    
    // 2. Detect change
    expect(address1.municipio !== address2.municipio).toBe(true);
    
    // 3. Queue high-priority speech
    speechQueue.enqueue(`Entrando em ${address2.municipio}`, 'high');
    expect(speechQueue.items[0].priority).toBe('high');
});
```

### 3. BrazilianAddressProcessing.e2e.test.js (20 tests)

Tests the Brazilian address processing pipeline:

**What it tests:**
- OpenStreetMap/Nominatim data retrieval
- Address translation (OSM → Brazilian format)
- Brazilian address component extraction
- Standard address formatting
- Display name generation
- CEP (postal code) processing
- Multiple city formats
- Street type prefixes (Rua, Avenida, Travessa, etc.)

**Key scenarios:**
- São Paulo address processing
- Rio de Janeiro address with Portuguese street types
- Brasília address with capital naming
- Address component extraction
- Missing component handling
- State name normalization
- Display name generation
- CEP formatting

**Example test:**
```javascript
test('should process complete São Paulo address from OSM to Brazilian format', async () => {
    // 1. Mock OSM response
    const osmResponse = {
        address: {
            road: 'Avenida Paulista',
            house_number: '1578',
            neighbourhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'São Paulo',
            postcode: '01310-200'
        }
    };
    
    // 2. Extract Brazilian address
    const brazilianAddress = AddressDataExtractor.getBrazilianStandardAddress(osmResponse);
    
    // 3. Verify all components
    expect(brazilianAddress.logradouro).toBe('Avenida Paulista');
    expect(brazilianAddress.bairro).toBe('Bela Vista');
    expect(brazilianAddress.cep).toBe('01310-200');
});
```

### 4. ErrorHandlingRecovery.e2e.test.js (20 tests)

Tests error handling and recovery mechanisms:

**What it tests:**
- Invalid coordinate handling
- Network failures and timeouts
- API errors (404, 500)
- Malformed API responses
- Speech synthesis failures
- Recovery mechanisms
- Boundary conditions
- Edge cases

**Key scenarios:**
- Null/invalid coordinates
- Poor accuracy rejection
- Out-of-bounds coordinates
- Network timeout handling
- API 404/500 errors
- Network disconnection
- Retry on transient failures
- Empty/malformed responses
- Missing speech synthesis support
- Position at international date line
- Position at poles

**Example test:**
```javascript
test('should handle network timeout gracefully', async () => {
    // Mock timeout
    global.fetch.mockImplementationOnce(() => 
        Promise.reject(new Error('Network timeout'))
    );
    
    // Should handle error gracefully
    try {
        await geocoder.getReverseGeocodedData(lat, lon);
        expect(true).toBe(false); // Should not reach
    } catch (error) {
        expect(error.message).toContain('timeout');
    }
});
```

### 5. MultiComponentIntegration.e2e.test.js (16 tests)

Tests complex multi-component interactions:

**What it tests:**
- WebGeocodingManager orchestration
- PositionManager coordination
- ReverseGeocoder + AddressDataExtractor pipeline
- ChangeDetectionCoordinator integration
- SpeechSynthesisManager coordination
- Observer pattern implementation
- Singleton pattern consistency
- Display component synchronization
- Complete navigation sessions

**Key scenarios:**
- Manager → Position → Geocoder → Display workflow
- Observer pattern notifications
- Geocoder + Extractor integration
- Change detection → Speech synthesis
- Multiple change detector coordination
- Speech priority management
- Singleton instance maintenance
- Position pipeline processing
- HTML + Speech synchronization
- Reference places with addresses
- Complete navigation session
- Component lifecycle management

**Example test:**
```javascript
test('should handle complete navigation session', async () => {
    const route = [
        { lat: -23.5505, lon: -46.6333, bairro: 'Bela Vista' },
        { lat: -23.5606, lon: -46.6556, bairro: 'Jardins' },
        { lat: -23.5707, lon: -46.6779, bairro: 'Pinheiros' },
    ];
    
    let previousAddress = null;
    
    for (const point of route) {
        // 1. Create position
        const position = new GeoPosition(point);
        
        // 2. Geocode
        const data = await geocoder.getReverseGeocodedData(...);
        const address = AddressDataExtractor.getBrazilianStandardAddress(data);
        
        // 3. Detect changes
        if (previousAddress && address.bairro !== previousAddress.bairro) {
            speechQueue.enqueue(`Entrando no bairro ${address.bairro}`, 'normal');
        }
        
        previousAddress = address;
    }
    
    expect(speechQueue.items.length).toBeGreaterThan(0);
});
```

## Running E2E Tests

```bash
# Run all E2E tests
npm test -- __tests__/e2e

# Run specific E2E test file
npm test -- __tests__/e2e/CompleteGeolocationWorkflow.e2e.test.js
npm test -- __tests__/e2e/AddressChangeAndSpeech.e2e.test.js
npm test -- __tests__/e2e/BrazilianAddressProcessing.e2e.test.js
npm test -- __tests__/e2e/ErrorHandlingRecovery.e2e.test.js
npm test -- __tests__/e2e/MultiComponentIntegration.e2e.test.js

# Run with verbose output
npm test -- __tests__/e2e --verbose

# Run with coverage
npm run test:coverage -- __tests__/e2e
```

## Test Structure

All E2E tests follow a consistent structure:

1. **Setup**: Mock global objects, setupParams, and utility functions
2. **Import**: Load classes from guia.js
3. **Test Suites**: Organized by workflow or scenario
4. **Cleanup**: Reset singletons and clear mocks in beforeEach

### Common Mocks

- `global.document` - Set to undefined for Node environment
- `global.console` - Mocked to track logging
- `global.setupParams` - Application configuration
- `global.fetch` - Mocked for API calls
- `global.speechSynthesis` - Mocked speech API
- `global.calculateDistance` - Haversine formula implementation

## Coverage

The E2E tests cover:

### Components Tested
- ✅ GeoPosition
- ✅ PositionManager
- ✅ ReverseGeocoder
- ✅ AddressDataExtractor
- ✅ BrazilianStandardAddress
- ✅ ChangeDetectionCoordinator
- ✅ SpeechQueue
- ✅ SpeechSynthesisManager
- ✅ WebGeocodingManager
- ✅ ObserverSubject
- ✅ ReferencePlace
- ✅ SingletonStatusManager

### Workflows Tested
- ✅ Complete geolocation workflow
- ✅ Address change detection
- ✅ Speech synthesis integration
- ✅ Brazilian address processing
- ✅ Error handling and recovery
- ✅ Multi-component orchestration
- ✅ Real-world navigation scenarios

### Scenarios Covered
- ✅ Normal operation
- ✅ Error conditions
- ✅ Edge cases
- ✅ Boundary conditions
- ✅ Recovery mechanisms
- ✅ Performance characteristics
- ✅ Concurrent operations

## Best Practices

### Writing E2E Tests

1. **Test complete workflows**: Focus on end-to-end scenarios, not isolated units
2. **Use realistic data**: Test with actual Brazilian addresses and coordinates
3. **Mock external dependencies**: Mock APIs, browser APIs, DOM
4. **Test error scenarios**: Include failure cases, not just happy paths
5. **Verify integration**: Test how components work together
6. **Keep tests independent**: Each test should be able to run alone
7. **Clean up after tests**: Reset singletons and mocks in beforeEach

### Example E2E Test Template

```javascript
describe('E2E: [Feature Name]', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset singletons
        if (PositionManager && PositionManager.instance) {
            PositionManager.instance = null;
        }
    });

    describe('Workflow: [Workflow Name]', () => {
        test('should [expected behavior]', async () => {
            // 1. Setup
            const position = new GeoPosition(coords);
            
            // 2. Mock external dependencies
            global.fetch.mockResolvedValueOnce({ ... });
            
            // 3. Execute workflow
            const result = await performWorkflow();
            
            // 4. Verify results
            expect(result).toBeDefined();
            expect(result.property).toBe(expectedValue);
        });
    });
});
```

## Maintenance

### Adding New E2E Tests

1. Create new test file following naming convention: `[Feature].e2e.test.js`
2. Add comprehensive JSDoc header describing what the test covers
3. Follow the existing test structure and patterns
4. Include tests for both success and failure scenarios
5. Update this README with test count and description

### Updating Existing E2E Tests

1. Maintain backward compatibility when possible
2. Update test descriptions to reflect changes
3. Add new test cases for new functionality
4. Keep test files focused on specific workflows
5. Update test counts in README

## Performance

E2E tests are designed to run quickly:
- **Average execution time**: ~1 second for all 76 tests
- **Parallelization**: Tests run in parallel where possible
- **Mock efficiency**: External APIs are mocked to avoid network delays
- **Isolation**: Tests are independent and don't share state

## Continuous Integration

These E2E tests are part of the CI pipeline:
- Run automatically on every commit
- Must pass before merging to main branch
- Provide confidence in application functionality
- Catch integration issues early

## Related Documentation

- [Main Test README](../README.md) - Overview of all tests
- [Integration Tests](../integration/README.md) - Component interaction tests
- [Feature Tests](../features/README.md) - Feature-specific tests
- [TESTING.md](../../TESTING.md) - General testing guidelines

## Version

E2E Test Suite Version: **1.0.0**  
Guia.js Version: **0.5.0-alpha**  
Last Updated: 2024

## Contributing

When contributing E2E tests:
1. Follow the existing patterns and conventions
2. Write clear, descriptive test names
3. Include comprehensive JSDoc comments
4. Test both success and failure paths
5. Verify tests pass locally before committing
6. Update this README with your changes

---

**Note**: These E2E tests validate the complete application workflows. For unit tests of individual components, see the `__tests__/unit/` directory. For integration tests between pairs of components, see `__tests__/integration/`.
