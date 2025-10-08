# OSM JSON to Brazilian Address Translation

## Overview

This document describes the OSM (OpenStreetMap) JSON address tag translation feature implemented in Guia.js version 0.8.5-alpha. The feature enables translation of standard OSM address tags to Brazilian address format while maintaining backward compatibility with the Nominatim API format.

## Motivation

OpenStreetMap uses a standardized address tagging format (e.g., `addr:street`, `addr:housenumber`) that differs from the Nominatim API response format (e.g., `road`, `house_number`). This feature ensures Guia.js can process address data from both formats and translate them to the Brazilian address standard.

## Supported Address Formats

### OSM Address Tags (Priority Format)

The following standard OSM address tags are supported:

| OSM Tag | Brazilian Field | Example Value |
|---------|-----------------|---------------|
| `addr:street` | `logradouro` | "Rua Oscar Freire" |
| `addr:housenumber` | `numero` | "123" |
| `addr:neighbourhood` | `bairro` | "Jardins" |
| `addr:city` | `municipio` | "São Paulo" |
| `addr:state` | `uf` | "SP" |
| `addr:postcode` | `cep` | "01426-001" |

### Nominatim API Format (Fallback Format)

The following Nominatim API fields are supported as fallbacks:

| Nominatim Field | Brazilian Field | Fallback Chain |
|----------------|-----------------|----------------|
| `road`, `street`, `pedestrian` | `logradouro` | In order of priority |
| `house_number` | `numero` | Single field |
| `neighbourhood`, `suburb`, `quarter` | `bairro` | In order of priority |
| `city`, `town`, `municipality`, `village` | `municipio` | In order of priority |
| `state`, `state_code`, `ISO3166-2-lvl4` (extracted) | `uf` | In order of priority |
| `postcode` | `cep` | Single field |

## Translation Priority

When both OSM tags and Nominatim fields are present, the system follows this priority:

1. **OSM address tags** (`addr:*`) - **Highest priority**
2. **Nominatim primary fields** (e.g., `road`, `city`, `state`)
3. **Nominatim fallback fields** (e.g., `street`, `town`, `state_code`)
4. **ISO3166-2-lvl4 extracted** - State abbreviation extracted from ISO code (e.g., "BR-RJ" → "RJ")
5. **Null** - If no data available

**Special Handling for State Field (`uf`)**: The state abbreviation (`siglaUF`) can be automatically extracted from the `ISO3166-2-lvl4` field when other state-related fields are not available. The extraction removes the "BR-" prefix from codes like "BR-RJ" to get "RJ".

## Usage Examples

### Example 1: Standard OSM Address Tags

```javascript
const { AddressDataExtractor } = require('./src/guia.js');

const osmData = {
    address: {
        'addr:street': 'Rua Oscar Freire',
        'addr:housenumber': '123',
        'addr:neighbourhood': 'Jardins',
        'addr:city': 'São Paulo',
        'addr:state': 'SP',
        'addr:postcode': '01426-001'
    }
};

const result = AddressDataExtractor.getBrazilianStandardAddress(osmData);

console.log(result.logradouro);      // "Rua Oscar Freire"
console.log(result.numero);          // "123"
console.log(result.bairro);          // "Jardins"
console.log(result.municipio);       // "São Paulo"
console.log(result.uf);              // "SP"
console.log(result.siglaUF);         // "SP"
console.log(result.cep);             // "01426-001"
console.log(result.enderecoCompleto()); 
// "Rua Oscar Freire, 123, Jardins, São Paulo, SP, 01426-001"
```

### Example 2: Nominatim API Format (Backward Compatibility)

```javascript
const nominatimData = {
    address: {
        road: 'Avenida Paulista',
        house_number: '1578',
        neighbourhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        postcode: '01310-200'
    }
};

const result = AddressDataExtractor.getBrazilianStandardAddress(nominatimData);
// Works exactly the same as OSM format
```

### Example 3: Mixed Format with Priority

```javascript
const mixedData = {
    address: {
        'addr:street': 'Rua from OSM',      // OSM tag takes priority
        'road': 'Rua from Nominatim',       // Ignored
        'addr:housenumber': '100',          // OSM tag takes priority
        'house_number': '200',              // Ignored
        'city': 'São Paulo',                // Used (no OSM tag available)
        'state': 'SP'                       // Used (no OSM tag available)
    }
};

const result = AddressDataExtractor.getBrazilianStandardAddress(mixedData);
console.log(result.logradouro);  // "Rua from OSM"
console.log(result.numero);      // "100"
console.log(result.municipio);   // "São Paulo"
```

### Example 4: State Abbreviation Extraction from ISO3166-2-lvl4

```javascript
const dataWithISO = {
    address: {
        'road': 'Avenida Atlântica',
        'city': 'Rio de Janeiro',
        'ISO3166-2-lvl4': 'BR-RJ'  // State code in ISO format
        // Note: No explicit state or state_code field
    }
};

const result = AddressDataExtractor.getBrazilianStandardAddress(dataWithISO);
console.log(result.logradouro);  // "Avenida Atlântica"
console.log(result.municipio);   // "Rio de Janeiro"
console.log(result.uf);          // null (no direct state field)
console.log(result.siglaUF);     // "RJ" (extracted from ISO3166-2-lvl4)

// The municipioCompleto() method uses siglaUF when available
console.log(result.municipioCompleto()); 
// "Rio de Janeiro, RJ"
```

### Example 5: Partial Address Data

```javascript
const partialData = {
    address: {
        'addr:street': 'Avenida Atlântica',
        'addr:city': 'Rio de Janeiro'
        // Missing: housenumber, neighbourhood, state, postcode
    }
};

const result = AddressDataExtractor.getBrazilianStandardAddress(partialData);
console.log(result.logradouro);  // "Avenida Atlântica"
console.log(result.numero);      // null
console.log(result.bairro);      // null
console.log(result.municipio);   // "Rio de Janeiro"
console.log(result.uf);          // null
console.log(result.siglaUF);     // null
console.log(result.cep);         // null

// Formatted address handles null values gracefully
console.log(result.enderecoCompleto()); 
// "Avenida Atlântica, Rio de Janeiro"
```

## Brazilian Address Standard Output

The translation produces a `BrazilianStandardAddress` object with the following properties:

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `logradouro` | string\|null | Street name | "Rua Oscar Freire" |
| `numero` | string\|null | House/building number | "123" |
| `complemento` | string\|null | Complement (not extracted from OSM) | null |
| `bairro` | string\|null | Neighborhood | "Jardins" |
| `municipio` | string\|null | City/Municipality | "São Paulo" |
| `uf` | string\|null | State name or abbreviation | "SP" or "São Paulo" |
| `siglaUF` | string\|null | Two-letter state abbreviation | "SP" |
| `cep` | string\|null | Postal code | "01426-001" |
| `pais` | string | Country (default: "Brasil") | "Brasil" |
| `referencePlace` | ReferencePlace | Reference place object | See ReferencePlace docs |

### Formatting Methods

The `BrazilianStandardAddress` class provides the following formatting methods:

- `logradouroCompleto()` - Returns "Logradouro, Número" format
- `bairroCompleto()` - Returns neighborhood name
- `municipioCompleto()` - Returns "Município, siglaUF" format (uses siglaUF when available)
- `enderecoCompleto()` - Returns full formatted address

**Note**: The `municipioCompleto()` method prioritizes using `siglaUF` over `uf` to ensure consistent two-letter state abbreviation format.

## Error Handling

The translation system handles errors gracefully:

| Scenario | Behavior |
|----------|----------|
| Missing address object | Returns object with all null fields |
| Missing specific fields | Sets field to null |
| Invalid data types | Preserves value as-is (no type validation) |
| Unexpected tags | Ignores unknown tags |
| Empty address object | Returns object with all null fields |

## Implementation Details

### Location in Codebase

The OSM address translation is implemented in the `AddressExtractor` class:

- **File**: `src/guia.js`
- **Class**: `AddressExtractor`
- **Method**: `padronizaEndereco()` (lines 2000-2044)

### Algorithm

```
For each Brazilian address field:
  1. Check if OSM address tag exists (addr:*)
  2. If not, check primary Nominatim field
  3. If not, check fallback Nominatim fields
  4. If none exist, set to null
```

### Performance Considerations

- **Caching**: Translated addresses are cached using the `AddressCache` class
- **Immutability**: All address objects are frozen after creation
- **Efficiency**: Simple field mapping with no heavy computation

## Testing

Comprehensive test coverage is provided in:

**File**: `__tests__/OSMAddressTranslation.test.js`

**Test Categories**:
- FR-1: Identify and Extract OSM Address Tags (4 tests)
- FR-2: Map to Brazilian Address Fields (3 tests)
- FR-3: Format and Output Brazilian Address (5 tests)
- UC-1: Convert OSM Address to Brazilian Format (1 test)
- UC-2: Handle Incomplete OSM Data (1 test)
- Error Handling (3 tests)
- Backward Compatibility (2 tests)
- Performance and Caching (1 test)
- Integration Tests (2 tests)

**Total**: 22 tests

### Running Tests

```bash
# Run OSM translation tests only
npm test -- __tests__/OSMAddressTranslation.test.js

# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

## Integration with Existing System

The OSM address translation integrates seamlessly with:

- **ReverseGeocoder**: Processes Nominatim API responses
- **AddressCache**: Caches translated addresses
- **HTMLAddressDisplayer**: Displays translated addresses in UI
- **ReferencePlace**: Extracts reference place information
- **WebGeocodingManager**: Coordinates geocoding workflow

## Backward Compatibility

✅ **Full backward compatibility maintained**

- Existing Nominatim API integrations continue to work
- No breaking changes to public APIs
- All existing tests pass
- Fallback mechanism ensures smooth transition

## Related Documentation

- [Nominatim API Format](./NOMINATIM_API_FORMAT.md) - Complete Nominatim JSON format documentation
- [BrazilianStandardAddress Class](./BRAZILIAN_ADDRESS.md)
- [ReferencePlace Class](./REFERENCE_PLACE.md)
- [AddressCache Documentation](./ADDRESS_CACHE.md)
- [Testing Guide](../TESTING.md)

## Version History

- **v0.8.5-alpha** (2025-10-07) - Initial implementation of OSM address tag translation
- Implements functional specification for OSM JSON to Brazilian Address translation

## References

- [OpenStreetMap Wiki: Addresses](https://wiki.openstreetmap.org/wiki/Addresses)
- [OSM Tagging Guidelines](https://wiki.openstreetmap.org/wiki/Key:addr)
- [Nominatim API Documentation](https://nominatim.org/release-docs/latest/api/Output/)
- [Brazilian Address Standard](https://www.correios.com.br)

## Author

Marcelo Pereira Barbosa (@mpbarbosa)

## See Also

- [Functional Specification](../issues/150-osm-translation-spec.md) - Original specification
- [Implementation Issue](https://github.com/mpbarbosa/guia_js/issues/150)
- [Class Diagram](./CLASS_DIAGRAM.md)
