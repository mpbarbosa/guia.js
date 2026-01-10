# Nominatim API Integration and Address Translation

## Overview

This document provides comprehensive documentation for the Nominatim API integration and OSM address translation in the Guia Turístico project (version 0.7.0-alpha). Nominatim is the geocoding service provided by OpenStreetMap that powers the reverse geocoding functionality, translating geographic coordinates into Brazilian standard addresses.

**Key Features:**
- Complete Nominatim JSON format specification
- OSM address tag translation to Brazilian format
- Backward compatibility with both OSM tags and Nominatim fields
- Priority-based field resolution
- Comprehensive error handling

## API Endpoint

Guia Turístico uses the Nominatim reverse geocoding endpoint:

```url
https://nominatim.openstreetmap.org/reverse?format=json&lat={latitude}&lon={longitude}&zoom=18&addressdetails=1
```

**Parameters:**

- `format=json` - Returns data in JSON format
- `lat={latitude}` - Latitude coordinate (e.g., -23.5505)
- `lon={longitude}` - Longitude coordinate (e.g., -46.6333)
- `zoom=18` - Zoom level (18 = building/street level detail)
- `addressdetails=1` - Include detailed address breakdown

## Nominatim JSON Response Structure

### Top-Level Fields

A typical Nominatim API response contains the following structure:

```javascript
{
  "place_id": 123456789,           // Unique identifier for this place in OSM
  "licence": "string",              // Data license information
  "osm_type": "way|node|relation",  // Type of OSM element
  "osm_id": 987654321,              // OSM element ID
  "lat": "-23.5505199",             // Latitude as string
  "lon": "-46.6333094",             // Longitude as string
  "class": "amenity|highway|building|shop|place|...", // OSM class
  "type": "school|residential|commercial|...",         // OSM type
  "place_rank": 30,                 // Importance ranking (0-30)
  "importance": 0.32156,            // Calculated importance score
  "addresstype": "building",        // Type of address element
  "name": "Shopping Morumbi",       // Name of the place (if any)
  "display_name": "string",         // Full formatted address
  "address": { ... },               // Detailed address breakdown (see below)
  "boundingbox": [ ... ]            // Geographic bounding box (see below)
}
```

### Address Object Structure

The `address` object contains detailed address components. Fields vary based on location type and available data:

```javascript
{
  // OSM Address Tags (Priority Format - When Available)
  "addr:street": "Rua Oscar Freire",           // OSM standard street tag
  "addr:housenumber": "123",                   // OSM standard house number
  "addr:neighbourhood": "Jardins",             // OSM standard neighborhood
  "addr:city": "São Paulo",                    // OSM standard city
  "addr:state": "SP",                          // OSM standard state
  "addr:postcode": "01426-001",                // OSM standard postcode
  
  // Nominatim Fields (Fallback Format)
  "road": "Rodovia dos Bandeirantes",          // Street name (primary)
  "street": "Alternative Street Name",         // Alternative street field
  "pedestrian": "Pedestrian Way Name",         // Pedestrian street
  "house_number": "1089",                      // Building/house number
  "building": "Shopping Morumbi",              // Building name
  "neighbourhood": "City América",             // Neighborhood/district
  "suburb": "São Domingos",                    // Suburb area
  "quarter": "District Quarter",               // Quarter/district
  "city": "São Paulo",                         // City name (primary)
  "town": "Small Town Name",                   // Town (for smaller places)
  "village": "Village Name",                   // Village (for rural areas)
  "municipality": "Região Imediata de São Paulo", // Municipality
  "county": "Região Metropolitana de São Paulo",  // County/region
  "state_district": "Região Geográfica Intermediária de São Paulo", // State district
  "state": "São Paulo",                        // State/province name (full)
  "state_code": "SP",                          // State abbreviation
  "ISO3166-2-lvl4": "BR-SP",                   // ISO 3166-2 code for state
  "region": "Região Sudeste",                  // Geographic region
  "postcode": "05145-200",                     // Postal/ZIP code
  "country": "Brasil",                         // Country name
  "country_code": "br"                         // ISO country code (lowercase)
}
```

## Address Translation to Brazilian Format

### Supported Address Formats

Guia Turístico supports two address formats with automatic translation:

#### 1. OSM Address Tags (Priority Format)

| OSM Tag | Brazilian Field | Example Value |
|---------|-----------------|---------------|
| `addr:street` | `logradouro` | "Rua Oscar Freire" |
| `addr:housenumber` | `numero` | "123" |
| `addr:neighbourhood` | `bairro` | "Jardins" |
| `addr:city` | `municipio` | "São Paulo" |
| `addr:state` | `uf` | "SP" |
| `addr:postcode` | `cep` | "01426-001" |

#### 2. Nominatim API Format (Fallback Format)

| Nominatim Field | Brazilian Field | Fallback Chain |
|----------------|-----------------|----------------|
| `road`, `street`, `pedestrian` | `logradouro` | In order of priority |
| `house_number` | `numero` | Single field |
| `neighbourhood`, `suburb`, `quarter` | `bairro` | In order of priority |
| `city`, `town`, `municipality`, `village` | `municipio` | In order of priority |
| `state` (full names only) | `uf` | State full name field |
| `state_code`, extracted from `ISO3166-2-lvl4` | `siglaUF` | Two-letter state abbreviation |
| `postcode` | `cep` | Single field |
| `country` | `pais` | Single field |

### Translation Priority Rules

When both OSM tags and Nominatim fields are present, the system follows this priority:

1. **OSM address tags** (`addr:*`) - **Highest priority**
2. **Nominatim primary fields** (e.g., `road`, `city`, `state`)
3. **Nominatim fallback fields** (e.g., `street`, `town`, `state_code`)
4. **Null** - If no data available

### State Field Rules (`uf` and `siglaUF`)

The `uf` and `siglaUF` fields follow strict rules for consistency:

**`uf` field** - Contains ONLY full state names:
- Source: `addr:state` or `state` fields only
- Examples: "São Paulo", "Rio de Janeiro", "Minas Gerais"
- Will be `null` if only abbreviations are available (e.g., only `state_code` or `ISO3166-2-lvl4`)

**`siglaUF` field** - Contains ONLY two-letter state abbreviations:
- Priority: `state_code` > extracted from `ISO3166-2-lvl4`
- Examples: "SP", "RJ", "MG"
- If `uf` contains a two-letter code (edge case), `siglaUF` will use it
- The `AddressExtractor.extractSiglaUF()` static method extracts abbreviations by removing the "BR-" prefix from ISO codes (e.g., "BR-RJ" → "RJ")

### Field Mapping Reference

| Field | Type | Description | Example | Usage in Guia.js |
|-------|------|-------------|---------|------------------|
| `road` | string | Primary street name | "Rodovia dos Bandeirantes" | ✅ Maps to `logradouro` |
| `street` | string | Alternative street name | "Rua Oscar Freire" | ✅ Fallback for `logradouro` |
| `pedestrian` | string | Pedestrian-only street | "Calçadão da Paulista" | ✅ Fallback for `logradouro` |
| `house_number` | string | Building/house number | "1089" | ✅ Maps to `numero` |
| `building` | string | Building name | "Shopping Morumbi" | Used for reference places |
| `neighbourhood` | string | Neighborhood name | "City América" | ✅ Maps to `bairro` |
| `suburb` | string | Suburb/district | "São Domingos" | ✅ Fallback for `bairro` |
| `quarter` | string | District quarter | "Liberdade" | ✅ Fallback for `bairro` |
| `city` | string | City name | "São Paulo" | ✅ Maps to `municipio` |
| `town` | string | Town name (smaller) | "Campos do Jordão" | ✅ Fallback for `municipio` |
| `village` | string | Village name (rural) | "Vila Rural" | ✅ Fallback for `municipio` |
| `municipality` | string | Municipality | "Região Imediata de SP" | ✅ Fallback for `municipio` |
| `county` | string | County/metro region | "Região Metropolitana de SP" | ℹ️ Informational only |
| `state_district` | string | State district | "Região Geográfica..." | ℹ️ Informational only |
| `state` | string | State full name | "São Paulo" | ✅ Maps to `uf` (full names only) |
| `state_code` | string | State abbreviation | "SP" | ✅ Maps to `siglaUF` (abbreviations only) |
| `ISO3166-2-lvl4` | string | ISO state code | "BR-SP" | ✅ Fallback for `siglaUF` (extracts "SP") |
| `region` | string | Geographic region | "Região Sudeste" | ℹ️ Informational only |
| `postcode` | string | Postal code | "05145-200" | ✅ Maps to `cep` |
| `country` | string | Country name | "Brasil" | ✅ Maps to `pais` |
| `country_code` | string | ISO country code | "br" | ℹ️ Informational only |

## Bounding Box Format

The `boundingbox` field is an array of four string values representing the geographic boundaries of the location:

```javascript
"boundingbox": [
  "-23.4969293",    // [0] Minimum latitude (south)
  "-23.4952133",    // [1] Maximum latitude (north)
  "-46.7313713",    // [2] Minimum longitude (west)
  "-46.7301159"     // [3] Maximum longitude (east)
]
```

**Format:** `[min_lat, max_lat, min_lon, max_lon]`

**Usage:**
- Defines rectangular area covering the location
- Used for map viewport sizing
- Useful for determining location precision
- All values are strings (not numbers)

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
console.log(result.enderecoCompleto());
// "Avenida Paulista, 1578, Bela Vista, São Paulo, SP, 01310-200"
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

### Example 4: State Abbreviation Handling

```javascript
// Case 1: Only state_code available (no full state name)
const dataWithStateCode = {
    address: {
        'road': 'Avenida Paulista',
        'city': 'São Paulo',
        'state_code': 'SP'  // Only abbreviation available
    }
};

const result1 = AddressDataExtractor.getBrazilianStandardAddress(dataWithStateCode);
console.log(result1.uf);         // null (no full state name available)
console.log(result1.siglaUF);    // "SP" (from state_code)

// Case 2: Full state name with ISO3166-2-lvl4
const dataWithFullState = {
    address: {
        'road': 'Avenida Atlântica',
        'city': 'Rio de Janeiro',
        'state': 'Rio de Janeiro',  // Full state name
        'ISO3166-2-lvl4': 'BR-RJ'   // ISO code for siglaUF extraction
    }
};

const result2 = AddressDataExtractor.getBrazilianStandardAddress(dataWithFullState);
console.log(result2.uf);         // "Rio de Janeiro" (full state name from state field)
console.log(result2.siglaUF);    // "RJ" (extracted from ISO3166-2-lvl4)

// The municipioCompleto() method uses siglaUF for consistent formatting
console.log(result2.municipioCompleto()); 
// "Rio de Janeiro, RJ"
```

### Example 5: Complete Integration

```javascript
// Import from Guia.js
const { ReverseGeocoder, AddressDataExtractor } = require('./src/guia.js');

// Create geocoder with coordinates
const geocoder = new ReverseGeocoder(-23.6265493, -46.6972537);

// Fetch Nominatim data
const nominatimData = await geocoder.reverseGeocode();

// Extract Brazilian standard address
const brazilianAddress = AddressDataExtractor.getBrazilianStandardAddress(nominatimData);

// Access standardized fields
console.log(brazilianAddress.logradouro);     // "Avenida Roque Petroni Júnior"
console.log(brazilianAddress.numero);         // "1089"
console.log(brazilianAddress.bairro);         // "Jardim das Acácias"
console.log(brazilianAddress.municipio);      // "São Paulo"
console.log(brazilianAddress.uf);             // "São Paulo" (full state name only)
console.log(brazilianAddress.siglaUF);        // "SP" (two-letter abbreviation only)
console.log(brazilianAddress.cep);            // "04707-000"

// Get formatted address
console.log(brazilianAddress.enderecoCompleto());
// "Avenida Roque Petroni Júnior, 1089, Jardim das Acácias, São Paulo, SP, 04707-000"
```

## Complete Real-World Examples

### Example 1: Shopping Mall in São Paulo

```javascript
{
  "place_id": 123456789,
  "licence": "Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright",
  "osm_type": "way",
  "osm_id": 987654321,
  "lat": "-23.6265493",
  "lon": "-46.6972537",
  "class": "shop",
  "type": "mall",
  "place_rank": 30,
  "importance": 0.32156,
  "addresstype": "building",
  "name": "Shopping Morumbi",
  "display_name": "Shopping Morumbi, Avenida Roque Petroni Júnior, 1089, Jardim das Acácias, São Paulo, Região Imediata de São Paulo, Região Metropolitana de São Paulo, Região Geográfica Intermediária de São Paulo, São Paulo, Região Sudeste, 04707-000, Brasil",
  "address": {
    "building": "Shopping Morumbi",
    "road": "Avenida Roque Petroni Júnior",
    "house_number": "1089",
    "neighbourhood": "Jardim das Acácias",
    "city": "São Paulo",
    "municipality": "Região Imediata de São Paulo",
    "county": "Região Metropolitana de São Paulo",
    "state_district": "Região Geográfica Intermediária de São Paulo",
    "state": "São Paulo",
    "ISO3166-2-lvl4": "BR-SP",
    "region": "Região Sudeste",
    "postcode": "04707-000",
    "country": "Brasil",
    "country_code": "br"
  },
  "boundingbox": [
    "-23.6275",
    "-23.6255",
    "-46.6985",
    "-46.6960"
  ]
}
```

### Example 2: Rodovia dos Bandeirantes, São Paulo

```javascript
{
  "place_id": 234567890,
  "licence": "Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright",
  "osm_type": "way",
  "osm_id": 876543210,
  "lat": "-23.4960713",
  "lon": "-46.7307436",
  "class": "highway",
  "type": "motorway",
  "place_rank": 26,
  "importance": 0.42156,
  "addresstype": "road",
  "name": "Rodovia dos Bandeirantes",
  "display_name": "Rodovia dos Bandeirantes, City América, São Domingos, São Paulo, Região Imediata de São Paulo, Região Metropolitana de São Paulo, Região Geográfica Intermediária de São Paulo, São Paulo, Região Sudeste, 05145-200, Brasil",
  "address": {
    "road": "Rodovia dos Bandeirantes",
    "neighbourhood": "City América",
    "suburb": "São Domingos",
    "city": "São Paulo",
    "municipality": "Região Imediata de São Paulo",
    "county": "Região Metropolitana de São Paulo",
    "state_district": "Região Geográfica Intermediária de São Paulo",
    "state": "São Paulo",
    "ISO3166-2-lvl4": "BR-SP",
    "region": "Região Sudeste",
    "postcode": "05145-200",
    "country": "Brasil",
    "country_code": "br"
  },
  "boundingbox": [
    "-23.4969293",
    "-23.4952133",
    "-46.7313713",
    "-46.7301159"
  ]
}
```

### Example 3: Residential Address in Rio de Janeiro

```javascript
{
  "place_id": 345678901,
  "licence": "Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright",
  "osm_type": "way",
  "osm_id": 765432109,
  "lat": "-22.9068",
  "lon": "-43.1729",
  "class": "building",
  "type": "residential",
  "place_rank": 30,
  "importance": 0.22156,
  "addresstype": "building",
  "name": null,
  "display_name": "Rua Visconde de Pirajá, 500, Ipanema, Rio de Janeiro, Região Metropolitana do Rio de Janeiro, Rio de Janeiro, Região Sudeste, 22410-000, Brasil",
  "address": {
    "road": "Rua Visconde de Pirajá",
    "house_number": "500",
    "neighbourhood": "Ipanema",
    "city": "Rio de Janeiro",
    "state": "Rio de Janeiro",
    "ISO3166-2-lvl4": "BR-RJ",
    "region": "Região Sudeste",
    "postcode": "22410-000",
    "country": "Brasil",
    "country_code": "br"
  },
  "boundingbox": [
    "-22.9070",
    "-22.9066",
    "-43.1731",
    "-43.1727"
  ]
}
```

### Example 4: Minimal Response (Rural Area)

```javascript
{
  "place_id": 456789012,
  "licence": "Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright",
  "osm_type": "node",
  "osm_id": 654321098,
  "lat": "-15.7801",
  "lon": "-47.9292",
  "class": "place",
  "type": "village",
  "place_rank": 19,
  "importance": 0.12156,
  "addresstype": "village",
  "name": "Vila dos Pescadores",
  "display_name": "Vila dos Pescadores, Goiás, Região Centro-Oeste, Brasil",
  "address": {
    "village": "Vila dos Pescadores",
    "state": "Goiás",
    "region": "Região Centro-Oeste",
    "country": "Brasil",
    "country_code": "br"
  },
  "boundingbox": [
    "-15.7850",
    "-15.7750",
    "-47.9350",
    "-47.9250"
  ]
}
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
| `uf` | string\|null | **Full state name only** | "São Paulo", "Rio de Janeiro" |
| `siglaUF` | string\|null | **Two-letter state abbreviation only** | "SP", "RJ" |
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

## Field Availability by Location Type

Different types of locations return different sets of fields:

| Location Type | Available Fields | Example |
|--------------|------------------|---------|
| **Building** | road, house_number, neighbourhood, city, state, postcode | Residential, commercial buildings |
| **Highway/Road** | road, neighbourhood, suburb, city, state, postcode | Roads, highways |
| **Amenity** | road, building, neighbourhood, city, state, postcode | Schools, hospitals, parks |
| **Shop/Mall** | road, house_number, building, neighbourhood, city, state, postcode | Shopping centers, stores |
| **Natural** | neighbourhood, city, state | Parks, beaches, natural features |
| **Rural/Village** | village, state, region | Small towns, rural areas |

## Error Handling

The translation system handles errors gracefully:

| Scenario | Behavior |
|----------|----------|
| Missing address object | Returns object with all null fields |
| Missing specific fields | Sets field to null |
| Invalid data types | Preserves value as-is (no type validation) |
| Unexpected tags | Ignores unknown tags |
| Empty address object | Returns object with all null fields |

## Important Notes

### Data Types

- **Coordinates (`lat`, `lon`)**: Always returned as **strings**, not numbers
- **Bounding box values**: Always **strings**, not numbers
- **IDs (`place_id`, `osm_id`)**: Numbers
- **Address fields**: Strings or null/undefined

### Handling Missing Fields

Not all fields are present in every response. Guia Turístico handles this gracefully:

```javascript
// Safe access with fallbacks
const street = address.road || address.street || address.pedestrian || null;
const city = address.city || address.town || address.municipality || address.village || null;
```

### Character Encoding

- All text is UTF-8 encoded
- Properly handles Portuguese characters (á, é, í, ó, ú, ã, õ, ç)
- No special decoding required in JavaScript

### Rate Limiting

Nominatim has usage policies:

- **Maximum 1 request per second** for free tier
- Include a valid `User-Agent` header
- Consider caching results

Guia Turístico implements caching via `AddressCache` to minimize API calls.

## Data Quality Considerations

### Accuracy

- **Urban areas**: Generally high accuracy and complete data
- **Rural areas**: May have minimal data (village + state only)
- **New developments**: May lack house numbers or precise addresses

### Data Completeness

Fields that are commonly **available**:
- `road`, `city`, `state`, `country`, `country_code`

Fields that are **sometimes missing**:
- `house_number`, `postcode`, `neighbourhood`

Fields that are **often missing**:
- `building`, `quarter`, `municipality`, `state_district`

### Localization

- Field names are in English
- Content is in local language (Portuguese for Brazil)
- `display_name` contains full formatted address in local language

## Implementation Details

### Location in Codebase

The OSM address translation is implemented in the `AddressExtractor` class:

- **File**: `src/data/AddressExtractor.js`
- **Class**: `AddressExtractor`
- **Static Method**: `padronizaEndereco()` - Translates Nominatim/OSM to Brazilian format

### Algorithm

```
For each Brazilian address field:
  1. Check if OSM address tag exists (addr:*)
  2. If not, check primary Nominatim field
  3. If not, check fallback Nominatim fields
  4. If none exist, set to null
```

### Integration with Existing System

The Nominatim integration works seamlessly with:

- **ReverseGeocoder** (`src/services/ReverseGeocoder.js`) - Processes Nominatim API responses
- **AddressCache** (`src/data/AddressCache.js`) - Caches translated addresses
- **AddressDataExtractor** (`src/data/AddressDataExtractor.js`) - Coordinates extraction and translation
- **HTMLAddressDisplayer** (`src/html/HTMLAddressDisplayer.js`) - Displays translated addresses in UI
- **ReferencePlace** (`src/data/ReferencePlace.js`) - Extracts reference place information
- **WebGeocodingManager** (`src/coordination/WebGeocodingManager.js`) - Coordinates geocoding workflow

### Performance Considerations

- **Caching**: Translated addresses are cached using the `AddressCache` class
- **Immutability**: All address objects are frozen after creation
- **Efficiency**: Simple field mapping with no heavy computation

## Testing

### Test Coverage

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

### Testing Nominatim Integration

```javascript
// Test file: __tests__/OSMAddressTranslation.test.js
describe('Nominatim API Format Support', () => {
  test('should parse complete Nominatim response', () => {
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
    
    expect(result.logradouro).toBe('Avenida Paulista');
    expect(result.numero).toBe('1578');
    expect(result.bairro).toBe('Bela Vista');
    expect(result.municipio).toBe('São Paulo');
    expect(result.uf).toBe('SP');
    expect(result.cep).toBe('01310-200');
  });
});
```

### Running Tests

```bash
# Run OSM translation tests only
npm test -- __tests__/OSMAddressTranslation.test.js

# Test address extraction
npm test -- __tests__/AddressDataExtractor.test.js

# All tests
npm test

# With coverage
npm run test:coverage
```

## Backward Compatibility

✅ **Full backward compatibility maintained**

- Existing Nominatim API integrations continue to work
- No breaking changes to public APIs
- All existing tests pass
- Fallback mechanism ensures smooth transition

## Best Practices

### When Using Nominatim Data

1. **Always check for null/undefined** before accessing address fields
2. **Use fallback chains** for critical fields (road → street → pedestrian)
3. **Cache responses** to avoid rate limiting
4. **Validate coordinates** before making API calls
5. **Handle errors gracefully** when API is unavailable

### Performance Tips

1. Use `AddressCache` to store previously fetched addresses
2. Batch related operations to minimize API calls
3. Implement exponential backoff for rate limit handling
4. Consider using local Nominatim instance for high-volume applications

### Security Considerations

1. Never expose API keys in client-side code (Nominatim is public API)
2. Validate and sanitize coordinates from user input
3. Implement rate limiting on your application side
4. Monitor for unusual usage patterns

## Related Documentation

- [Brazilian Standard Address](../architecture/BRAZILIAN_ADDRESS.md) - BrazilianStandardAddress class documentation (if exists)
- [Reference Place](../architecture/REFERENCE_PLACE.md) - Location type classification
- [Address Cache](../architecture/ADDRESS_CACHE.md) - Caching documentation (if exists)
- [Class Diagram](../architecture/CLASS_DIAGRAM.md) - System architecture overview
- [Testing Guide](../TESTING.md) - Testing documentation

## External References

- **[Nominatim API Documentation](https://nominatim.org/release-docs/latest/)** - Official API documentation
- **[Nominatim Output Details](https://nominatim.org/release-docs/latest/api/Output/)** - Response format specification
- **[OpenStreetMap Wiki - Addresses](https://wiki.openstreetmap.org/wiki/Addresses)** - OSM address tagging standards
- **[OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/)** - Live API service
- **[OSM Address Tags](https://wiki.openstreetmap.org/wiki/Key:addr)** - Address tagging guidelines
- **[Brazilian Address Standard](https://www.correios.com.br)** - Correios addressing

## Contributing

When modifying Nominatim integration:

1. Update tests in `__tests__/OSMAddressTranslation.test.js`
2. Update this documentation with new fields or behavior
3. Maintain backward compatibility with existing Nominatim format
4. Follow referential transparency principles (pure functions)
5. Document any new field mappings

## Version History

- **v0.7.0-alpha** (2026-01-06) - Consolidated Nominatim documentation for Guia Turístico application
- **v0.6.0-alpha** (2025-10-07) - Initial implementation of OSM address tag translation

## Target Audience

This documentation is intended for:

- ✅ **Contributors** - Developers working on Guia Turístico
- ✅ **API Users** - Developers using Guia Turístico as a library
- ✅ **Maintainers** - Project maintainers understanding the integration
- ✅ **GitHub Copilot** - AI-assisted development with clear, structured information

## Author

Marcelo Pereira Barbosa (@mpbarbosa)

## License

Documentation is part of the Guia Turístico project. See repository root for license information.

---

**Last Updated**: 2026-01-10  
**Version**: 0.7.0-alpha  
**Status**: ✅ Complete and up-to-date
