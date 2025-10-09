# Test Organization

This directory contains all test files for the Guia.js project, organized by test subject and purpose.

## Directory Structure

### `unit/` - Unit Tests (10 files)
Tests for individual classes and their methods in isolation:
- `ObserverSubject.test.js` - Observer pattern implementation
- `CurrentPosition.test.js` - Geolocation position handling
- `PositionManager.test.js` - Position management functionality
- `ReferencePlace.test.js` - Reference place data structures
- `ReverseGeocoder.test.js` - Reverse geocoding logic
- `AddressDataExtractor.test.js` - Address data extraction
- `ImmediateAddressFlow.test.js` - Immediate address flow logic
- `SpeechQueue.test.js` - Speech queue management
- `SpeechSynthesisManager.test.js` - Speech synthesis coordination
- `SingletonStatusManager.test.js` - Singleton status management

### `integration/` - Integration Tests (1 file)
Tests for multiple components working together:
- `GeoPositionPositionManager.integration.test.js` - GeoPosition and PositionManager integration

### `features/` - Feature Tests (7 files)
Tests for specific application features and behaviors:
- `BairroChangeDetection.test.js` - Neighborhood change detection
- `MunicipioChangeDetection.test.js` - Municipality change detection
- `LocationChangeImmediateSpeech.test.js` - Immediate speech on location change
- `FullAddressSpeechInterval.test.js` - Full address speech intervals
- `MunicipioSpeechPriority.test.js` - Municipality speech prioritization
- `SpeechPriority.test.js` - Speech priority logic
- `ChangeDetectionCoordinator.test.js` - Change detection coordination

### `ui/` - UI Component Tests (2 files)
Tests for display and user interface components:
- `BairroDisplay.test.js` - Neighborhood display component
- `DisplayerFactory.test.js` - Factory for display components

### `managers/` - Manager Tests (2 files)
Tests for high-level manager and coordinator classes:
- `WebGeocodingManager.test.js` - Web geocoding management
- `WebGeocodingManagerMunicipio.test.js` - Municipality-specific geocoding

### `external/` - External API Tests (3 files)
Tests for external service integrations:
- `NominatimJSONFormat.test.js` - Nominatim API format handling
- `OSMAddressTranslation.test.js` - OpenStreetMap address translation
- `guia_ibge.test.js` - IBGE API integration

### `utils/` - Utility Tests (2 files)
Tests for utility functions and helpers:
- `utils.test.js` - General utility functions
- `DeviceDetection.test.js` - Device detection utilities

### `patterns/` - Design Pattern Tests (1 file)
Tests for design patterns and architectural principles:
- `Immutability.test.js` - Immutability pattern validation

### `e2e/` - End-to-End Tests (5 files)
Comprehensive end-to-end tests that validate complete workflows:
- `CompleteGeolocationWorkflow.e2e.test.js` - Full workflow from position acquisition to display
- `AddressChangeAndSpeech.e2e.test.js` - Address change detection and speech synthesis integration
- `BrazilianAddressProcessing.e2e.test.js` - Brazilian address formatting and processing pipeline
- `ErrorHandlingRecovery.e2e.test.js` - Error handling, recovery, and edge cases
- `MultiComponentIntegration.e2e.test.js` - Complex multi-component interactions and coordination

## Running Tests

All tests can be run from the project root:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test directory
npm test -- __tests__/unit
npm test -- __tests__/integration
npm test -- __tests__/features
npm test -- __tests__/e2e

# Run only E2E tests
npm test -- __tests__/e2e
```

## Test Organization Principles

Tests are organized by their primary purpose:
- **Unit tests** focus on individual class behavior
- **Integration tests** validate component interactions
- **Feature tests** verify end-to-end feature functionality
- **UI tests** check display and rendering logic
- **Manager tests** validate high-level coordination
- **External tests** ensure external API compatibility
- **Util tests** verify helper function correctness
- **Pattern tests** validate architectural principles
- **E2E tests** validate complete application workflows from start to finish

This organization makes it easier to:
- Locate tests related to specific functionality
- Run targeted test suites
- Maintain and extend the test coverage
- Understand the codebase structure
