# End-to-End (E2E) Testing Guide

Comprehensive guide for writing and running end-to-end tests in Guia.js.

## Table of Contents

- [Overview](#overview)
- [E2E Test Structure](#e2e-test-structure)
- [Available E2E Tests](#available-e2e-tests)
- [Writing E2E Tests](#writing-e2e-tests)
- [Running E2E Tests](#running-e2e-tests)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

End-to-end (E2E) tests verify complete user workflows by testing the entire application stack from user interaction to final output. Unlike unit tests that test individual components in isolation, E2E tests ensure all components work together correctly.

**Current Status**: 5 E2E test files with comprehensive workflow coverage

**Location**: `__tests__/e2e/`

**Test Runner**: Jest with Node.js environment

## E2E Test Structure

### Directory Organization

```
__tests__/e2e/
├── README.md                              # E2E test documentation
├── CompleteGeolocationWorkflow.e2e.test.js    # Full geolocation flow
├── BrazilianAddressProcessing.e2e.test.js     # Address processing workflows
├── AddressChangeAndSpeech.e2e.test.js         # Change detection + speech
├── ErrorHandlingRecovery.e2e.test.js          # Error scenarios
└── MultiComponentIntegration.e2e.test.js      # Complex component interactions
```

### Test File Naming Convention

- Format: `<Feature><Action>.e2e.test.js`
- Examples:
  - `CompleteGeolocationWorkflow.e2e.test.js`
  - `BrazilianAddressProcessing.e2e.test.js`
  - `ErrorHandlingRecovery.e2e.test.js`

## Available E2E Tests

### 1. CompleteGeolocationWorkflow.e2e.test.js

Tests the complete geolocation acquisition and processing workflow.

**Scenarios Tested**:
- User grants location permission
- Browser geolocation API returns coordinates
- Coordinates are processed and validated
- Position manager stores the position
- UI updates reflect new position
- Success callbacks are triggered

**Test Flow**:
```javascript
User Action → Geolocation Request → Position Acquired → 
Validation → Storage → UI Update → Success Notification
```

**Coverage**: ~315 lines, 8 test cases

### 2. BrazilianAddressProcessing.e2e.test.js

Tests address processing specific to Brazilian location data.

**Scenarios Tested**:
- Address extraction from Nominatim API response
- Brazilian address standardization
- Municipality (município) and neighborhood (bairro) processing
- Address caching and retrieval
- Complete address formatting

**Test Flow**:
```javascript
Coordinates → Reverse Geocoding → Address Extraction → 
Standardization → Brazilian Format → Cache Storage → Display
```

**Coverage**: ~445 lines, 10 test cases

### 3. AddressChangeAndSpeech.e2e.test.js

Tests change detection and speech synthesis integration.

**Scenarios Tested**:
- Location change detection (municipality, neighborhood)
- Speech synthesis triggering on changes
- Speech queue management
- Priority-based speech ordering
- Immediate vs. interval-based speech

**Test Flow**:
```javascript
Position Update → Change Detection → Speech Queue → 
Priority Sorting → Speech Synthesis → Completion Callback
```

**Coverage**: ~422 lines, 12 test cases

### 4. ErrorHandlingRecovery.e2e.test.js

Tests error scenarios and recovery mechanisms.

**Scenarios Tested**:
- Geolocation permission denied
- Network errors during geocoding
- Invalid position data handling
- Timeout scenarios
- Graceful degradation
- Error notification to users

**Test Flow**:
```javascript
Error Trigger → Error Detection → Error Handler → 
User Notification → Recovery Attempt → Fallback State
```

**Coverage**: ~458 lines, 15 test cases

### 5. MultiComponentIntegration.e2e.test.js

Tests complex interactions between multiple components.

**Scenarios Tested**:
- WebGeocodingManager orchestrating multiple services
- Observer pattern notifications across components
- Display component synchronization
- State management across position updates
- Component lifecycle management

**Test Flow**:
```javascript
User Action → Manager Coordination → Service Calls → 
State Updates → Observer Notifications → UI Synchronization
```

**Coverage**: ~511 lines, 18 test cases

## Writing E2E Tests

### Basic Structure

```javascript
/**
 * @file Feature.e2e.test.js
 * @description End-to-end tests for [feature description]
 */

describe('Feature E2E Tests', () => {
    let componentA;
    let componentB;
    let mockDependency;

    beforeEach(() => {
        // Setup complete test environment
        mockDependency = createMockDependency();
        componentA = new ComponentA(mockDependency);
        componentB = new ComponentB(componentA);
    });

    afterEach(() => {
        // Cleanup
        jest.clearAllMocks();
    });

    describe('Complete Workflow', () => {
        it('should complete full user workflow successfully', async () => {
            // Arrange: Setup initial state
            const userInput = { latitude: -23.5505, longitude: -46.6333 };
            
            // Act: Execute complete workflow
            const result = await componentA.processInput(userInput);
            const display = componentB.displayResult(result);
            
            // Assert: Verify end-to-end behavior
            expect(result.processed).toBe(true);
            expect(display.shown).toBe(true);
            expect(componentA.state).toBe('completed');
            expect(componentB.notifications).toHaveLength(1);
        });
    });
});
```

### E2E Test Patterns

#### Pattern 1: Complete User Journey

Test a full user workflow from start to finish:

```javascript
describe('Complete User Journey', () => {
    it('should handle user getting location and viewing address', async () => {
        // 1. User clicks "Get Location" button
        const userAction = { action: 'getLocation' };
        
        // 2. Application requests geolocation
        const position = await geolocationService.getCurrentPosition();
        
        // 3. Application geocodes coordinates
        const address = await reverseGeocoder.geocode(
            position.coords.latitude,
            position.coords.longitude
        );
        
        // 4. Application displays results
        const display = addressDisplayer.display(address);
        
        // 5. Verify complete flow
        expect(position).toBeDefined();
        expect(address.municipality).toBe('São Paulo');
        expect(display.visible).toBe(true);
    });
});
```

#### Pattern 2: Multi-Component Coordination

Test how multiple components work together:

```javascript
describe('Multi-Component Coordination', () => {
    it('should coordinate position, geocoding, and display', async () => {
        // Setup components
        const manager = new WebGeocodingManager(document, 'container');
        const positionManager = PositionManager.getInstance();
        
        // Trigger workflow
        await manager.handleGeolocation(mockPosition);
        
        // Verify coordination
        expect(positionManager.currentPosition).toBeDefined();
        expect(manager.lastAddress).toBeDefined();
        expect(manager.displayedComponents.length).toBeGreaterThan(0);
    });
});
```

#### Pattern 3: Error Recovery

Test error handling and recovery:

```javascript
describe('Error Recovery', () => {
    it('should recover from geocoding failure', async () => {
        // Setup: Mock geocoding failure
        reverseGeocoder.geocode = jest.fn()
            .mockRejectedValueOnce(new Error('Network error'))
            .mockResolvedValueOnce({ municipality: 'São Paulo' });
        
        // Act: First attempt fails, second succeeds
        let firstAttempt;
        try {
            firstAttempt = await manager.processPosition(mockPosition);
        } catch (error) {
            // Error handled
        }
        
        // Retry succeeds
        const secondAttempt = await manager.processPosition(mockPosition);
        
        // Verify recovery
        expect(firstAttempt).toBeUndefined();
        expect(secondAttempt.municipality).toBe('São Paulo');
    });
});
```

### Mocking Guidelines for E2E Tests

E2E tests should mock only external dependencies:

**✅ Mock These**:
- Browser APIs (navigator.geolocation, window, document)
- External API calls (Nominatim, IBGE)
- Time-dependent functions (setTimeout, Date.now)

**❌ Don't Mock These**:
- Internal application components
- Business logic
- Data transformations

Example:

```javascript
// ✅ Good: Mock external API
const mockGeolocation = {
    getCurrentPosition: jest.fn((success) => {
        success({
            coords: { latitude: -23.5505, longitude: -46.6333 }
        });
    })
};

// ❌ Bad: Don't mock internal logic
// const mockAddressExtractor = {
//     extract: jest.fn(() => ({ municipality: 'São Paulo' }))
// };
```

## Running E2E Tests

### Run All E2E Tests

```bash
# Run all E2E tests
npm test -- __tests__/e2e/

# Run with verbose output
npm test -- __tests__/e2e/ --verbose

# Run with coverage
npm test -- __tests__/e2e/ --coverage
```

### Run Specific E2E Test

```bash
# Run single test file
npm test -- __tests__/e2e/CompleteGeolocationWorkflow.e2e.test.js

# Run tests matching pattern
npm test -- --testNamePattern="Complete User Journey"
```

### Watch Mode for Development

```bash
# Watch E2E tests during development
npm test -- __tests__/e2e/ --watch
```

### Expected Output

```
PASS __tests__/e2e/CompleteGeolocationWorkflow.e2e.test.js
  Complete Geolocation Workflow
    ✓ should acquire and process position (45ms)
    ✓ should handle position updates (32ms)
    ✓ should notify observers (28ms)

PASS __tests__/e2e/BrazilianAddressProcessing.e2e.test.js
  Brazilian Address Processing
    ✓ should extract Brazilian address (38ms)
    ✓ should standardize município (25ms)
    ✓ should format complete address (31ms)

Test Suites: 5 passed, 5 total
Tests:       63 passed, 63 total
Time:        5.234s
```

## Best Practices

### 1. Test Real User Scenarios

Focus on actual user workflows, not implementation details:

```javascript
// ✅ Good: Tests user workflow
it('should display address after user grants location permission', async () => {
    // Simulates user clicking button and granting permission
});

// ❌ Bad: Tests implementation
it('should call reverseGeocoder.geocode with correct parameters', () => {
    // Too focused on implementation
});
```

### 2. Use Realistic Test Data

Use actual Brazilian coordinates and addresses:

```javascript
const brazilianLocations = {
    saoPaulo: {
        coords: { latitude: -23.5505, longitude: -46.6333 },
        expectedAddress: {
            municipality: 'São Paulo',
            state: 'SP',
            neighborhood: 'República'
        }
    },
    rio: {
        coords: { latitude: -22.9068, longitude: -43.1729 },
        expectedAddress: {
            municipality: 'Rio de Janeiro',
            state: 'RJ',
            neighborhood: 'Centro'
        }
    }
};
```

### 3. Test Complete Workflows

Each test should verify a complete user journey:

```javascript
describe('Complete Address Display Workflow', () => {
    it('should show complete workflow from location to display', async () => {
        // 1. User initiates location request
        // 2. Application gets coordinates
        // 3. Application geocodes address
        // 4. Application standardizes Brazilian format
        // 5. Application displays to user
        // 6. Verify all steps completed successfully
    });
});
```

### 4. Verify State Transitions

Check that application state changes correctly:

```javascript
it('should transition through correct states', async () => {
    expect(manager.state).toBe('idle');
    
    const promise = manager.getLocation();
    expect(manager.state).toBe('loading');
    
    await promise;
    expect(manager.state).toBe('complete');
});
```

### 5. Test Error Boundaries

Ensure errors don't crash the application:

```javascript
it('should handle errors gracefully', async () => {
    // Trigger error condition
    const errorPromise = manager.processInvalidData(null);
    
    // Should not throw
    await expect(errorPromise).resolves.toMatchObject({
        error: true,
        recovered: true
    });
    
    // Application should still be functional
    expect(manager.state).not.toBe('crashed');
});
```

## Troubleshooting

### Common Issues

#### Issue: Tests timeout

```javascript
// Solution: Increase timeout for slow operations
jest.setTimeout(10000); // 10 seconds

it('should complete slow operation', async () => {
    await slowOperation();
}, 10000); // Per-test timeout
```

#### Issue: Flaky tests due to timing

```javascript
// Solution: Use waitFor or explicit promises
it('should update after delay', async () => {
    manager.triggerDelayedUpdate();
    
    // ❌ Bad: Race condition
    // expect(manager.updated).toBe(true);
    
    // ✅ Good: Wait for condition
    await new Promise(resolve => {
        const check = setInterval(() => {
            if (manager.updated) {
                clearInterval(check);
                resolve();
            }
        }, 100);
    });
    
    expect(manager.updated).toBe(true);
});
```

#### Issue: Mock not being called

```javascript
// Solution: Verify mock setup and async handling
it('should call mocked function', async () => {
    const mockFn = jest.fn().mockResolvedValue('result');
    component.dependency = mockFn;
    
    await component.performAction();
    
    // Debug: Check if mock was called
    console.log('Mock calls:', mockFn.mock.calls);
    expect(mockFn).toHaveBeenCalled();
});
```

### Debugging Tips

1. **Add console.log statements** to trace execution flow
2. **Use `--verbose` flag** to see detailed test output
3. **Run single test in isolation** to eliminate interference
4. **Check mock setup** in beforeEach blocks
5. **Verify async operations** are properly awaited

## Related Documentation

- [Unit Testing Guide](./UNIT_TESTING_GUIDE.md) - Testing individual components
- [Integration Testing](../README.md) - Testing component interactions
- [Test Organization](../__tests__/README.md) - Overall test structure
- [Contributing Guide](../.github/CONTRIBUTING.md) - Development guidelines

---

**Version**: 0.6.0-alpha  
**Last Updated**: 2026-01-01  
**Test Coverage**: 63 E2E tests across 5 test files
