# ReferencePlace Class Documentation

## Overview

The `ReferencePlace` class was introduced in version 0.8.5-alpha to encapsulate information about reference places extracted from geocoding API responses. Reference places include shopping centers, subway stations, cafes, and other points of interest that help provide contextual information about a user's location.

## Motivation

When users navigate around a city, it's helpful to know not just the street address but also any notable reference places they might be near or at. For example:
- "You are at Shopping Center Morumbi"
- "You are near Subway Station Sé"
- "You are at Café Girondino"

Previously, this functionality existed as a standalone `getAddressType()` function. The new `ReferencePlace` class provides a more cohesive, object-oriented approach to handling reference place data.

## Features

- **Automatic extraction** of class, type, and name from geocoding data
- **Portuguese descriptions** for reference place types
- **Immutable instances** (frozen after creation)
- **Integration** with `AddressExtractor` and `AddressDataExtractor`

## Usage

### Basic Usage

```javascript
const { ReferencePlace } = require('./src/guia.js');

const data = {
  class: 'shop',
  type: 'mall',
  name: 'Shopping Morumbi'
};

const refPlace = new ReferencePlace(data);

console.log(refPlace.className);     // 'shop'
console.log(refPlace.typeName);      // 'mall'
console.log(refPlace.name);          // 'Shopping Morumbi'
console.log(refPlace.description);   // 'Shopping Center'
console.log(refPlace.toString());    // 'ReferencePlace: Shopping Center - Shopping Morumbi'
```

### Integration with AddressDataExtractor

The `ReferencePlace` is automatically created when extracting address data:

```javascript
const { AddressDataExtractor } = require('./src/guia.js');

const geocodingData = {
  class: 'railway',
  type: 'subway',
  name: 'Estação Sé',
  address: {
    road: 'Praça da Sé',
    neighbourhood: 'Sé',
    city: 'São Paulo',
    state: 'São Paulo'
  }
};

const extractor = new AddressDataExtractor(geocodingData);

// Access the reference place
console.log(extractor.referencePlace.description);  // 'Estação do Metrô'
console.log(extractor.referencePlace.name);         // 'Estação Sé'

// Create speech notification
const speechText = `Você está próximo da ${extractor.referencePlace.description} ${extractor.referencePlace.name}`;
// "Você está próximo da Estação do Metrô Estação Sé"
```

## Supported Reference Place Types

The following reference place types are currently supported:

| Class     | Type       | Portuguese Description |
|-----------|------------|------------------------|
| place     | house      | Residencial            |
| shop      | mall       | Shopping Center        |
| shop      | car_repair | Oficina Mecânica       |
| amenity   | cafe       | Café                   |
| railway   | subway     | Estação do Metrô       |

Additional mappings can be configured in `setupParams.referencePlaceMap`.

## Valid Reference Place Classes

The following classes are considered valid for reference places (configurable in `setupParams.validRefPlaceClasses`):
- `place`
- `shop`
- `amenity`
- `railway`

## Handling Missing or Invalid Data

When data is missing or invalid, the `ReferencePlace` class handles it gracefully:

```javascript
// No reference place data
const data1 = { address: { road: 'Rua Augusta' } };
const refPlace1 = new ReferencePlace(data1);
console.log(refPlace1.description);  // 'Não classificado'

// Invalid class
const data2 = { class: 'unknown', type: 'unknown' };
const refPlace2 = new ReferencePlace(data2);
console.log(refPlace2.description);  // 'Não classificado'

// Valid class but unmapped type
const data3 = { class: 'shop', type: 'bookstore' };
const refPlace3 = new ReferencePlace(data3);
console.log(refPlace3.description);  // 'shop: bookstore'
```

## Real-World Scenario

Here's a complete example of the driving scenario mentioned in the feature request:

```javascript
const { AddressDataExtractor } = require('./src/guia.js');

// User enters a shopping mall parking lot
const geocodingResponse = {
  class: 'shop',
  type: 'mall',
  name: 'Shopping Morumbi',
  address: {
    road: 'Avenida Roque Petroni Junior',
    house_number: '1089',
    neighbourhood: 'Jardim das Acácias',
    city: 'São Paulo',
    state: 'São Paulo',
    postcode: '04707-000',
    country: 'Brasil'
  }
};

// Extract address and reference place
const extractor = new AddressDataExtractor(geocodingResponse);

// Display address information
console.log('Full Address:', extractor.enderecoPadronizado.enderecoCompleto());
// "Avenida Roque Petroni Junior, 1089, Jardim das Acácias, São Paulo, São Paulo, 04707-000"

// Display reference place information
console.log('Reference Place:', extractor.referencePlace.description);
// "Shopping Center"

console.log('Place Name:', extractor.referencePlace.name);
// "Shopping Morumbi"

// Create speech notification
const speechText = `Você está no ${extractor.referencePlace.description} ${extractor.referencePlace.name}`;
// "Você está no Shopping Center Shopping Morumbi"

// The app can now speak this notification to the user
```

## API Reference

### Constructor

```javascript
new ReferencePlace(data)
```

**Parameters:**
- `data` (Object): Raw address data from geocoding API
  - `class` (string, optional): The class category (e.g., 'shop', 'amenity', 'railway')
  - `type` (string, optional): The specific type within the class (e.g., 'mall', 'cafe', 'subway')
  - `name` (string, optional): The name of the reference place

### Properties

- `className` (string|null): The class category of the reference place
- `typeName` (string|null): The specific type within the class
- `name` (string|null): The name of the reference place
- `description` (string): The Portuguese description of the reference place type

### Methods

#### `toString()`

Returns a string representation of the reference place.

**Returns:** `string`

**Example:**
```javascript
const refPlace = new ReferencePlace({ class: 'shop', type: 'mall', name: 'Shopping Morumbi' });
console.log(refPlace.toString());
// "ReferencePlace: Shopping Center - Shopping Morumbi"
```

## Testing

The `ReferencePlace` class has comprehensive test coverage:

```bash
npm test -- __tests__/ReferencePlace.test.js
```

Test results:
- ✅ 23 tests covering all functionality
- ✅ Constructor validation
- ✅ Description calculation
- ✅ Edge cases handling
- ✅ Integration scenarios

## Version History

- **0.8.5-alpha**: Initial implementation of `ReferencePlace` class
- **0.8.4-alpha**: Previous version with standalone `getAddressType()` function

## Related Classes

- `AddressExtractor`: Creates and stores a `ReferencePlace` instance
- `AddressDataExtractor`: Exposes the `referencePlace` property for consumer use
- `BrazilianStandardAddress`: Handles standardized address formatting

## Author

Marcelo Pereira Barbosa

## See Also

### Related Architecture Documentation
- [Class Diagram](./CLASS_DIAGRAM.md) - Overall system architecture and class relationships
- [WEB_GEOCODING_MANAGER.md](./WEB_GEOCODING_MANAGER.md) - Geocoding coordination layer
- [GEO_POSITION.md](./GEO_POSITION.md) - GeoPosition class documentation

### Testing and Quality
- [Testing Documentation](../TESTING.md) - Test suite and coverage information
- [TDD_GUIDE.md](../../.github/TDD_GUIDE.md) - Test-driven development approach
- [UNIT_TEST_GUIDE.md](../../.github/UNIT_TEST_GUIDE.md) - Unit testing best practices

### Development Guidelines
- [REFERENTIAL_TRANSPARENCY.md](../../.github/REFERENTIAL_TRANSPARENCY.md) - Pure functions and immutable objects
- [CODE_REVIEW_GUIDE.md](../../.github/CODE_REVIEW_GUIDE.md) - Code review standards
- [HIGH_COHESION_GUIDE.md](../../.github/HIGH_COHESION_GUIDE.md) - Single responsibility principle

### Related Issues
- Issue: [Feature] Implement class ReferencePlace
