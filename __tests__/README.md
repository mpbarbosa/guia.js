# Test Organization

This directory contains all test files for the Guia.js project, organized by test subject and purpose.

## Quick Reference

| Directory | Test Type | Count | Purpose |
|-----------|-----------|-------|---------|
| `__mocks__/` | Mocks | 2 files | Jest module mocks (toast, logger) |
| `unit/` | Unit | 10 files | Individual class tests |
| `integration/` | Integration | 1 file | Multi-component tests |
| `features/` | Feature | 7 files | Feature behavior tests |
| `ui/` | UI | 2 files | Display component tests |
| `managers/` | Managers | 2 files | High-level coordinator tests |
| `external/` | External | 3 files | API integration tests |
| `utils/` | Utils | 2 files | Utility function tests |
| `patterns/` | Patterns | 1 file | Design pattern tests |
| `e2e/` | E2E | 11 files | End-to-end workflow tests |
| **Total** | | **41 files** | **2,437 passing tests** |

## Directory Structure

### `__mocks__/` - Jest Module Mocks
Standard Jest convention for mocking modules and dependencies:
- **Purpose**: Provides mock implementations for external dependencies
- **Convention**: Jest automatically uses mocks from `__mocks__/` when `jest.mock()` is called
- **Usage**: Manual mocks for npm packages or project modules
- **Documentation**: [Jest Manual Mocks](https://jestjs.io/docs/manual-mocks)

**Current Mocks**:
- `src/utils/toast.js` - Mock toast notification system
- `src/utils/logger.js` - Mock logging utilities

**When to use**:
- ✅ Mocking external libraries (e.g., browser APIs, third-party packages)
- ✅ Providing consistent test fixtures
- ✅ Isolating tests from network calls or file system
- ✅ Replacing utilities that have side effects (logging, notifications, etc.)

**Example Structure**:
```
__tests__/__mocks__/
├── src/
│   └── utils/
│       ├── toast.js       # Mock toast notifications
│       └── logger.js      # Mock console logging
└── external-library.js    # Mock third-party package (if needed)
```

**Note**: Jest automatically discovers mocks in `__mocks__/` directory when `jest.mock()` is called in test files.

---

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
