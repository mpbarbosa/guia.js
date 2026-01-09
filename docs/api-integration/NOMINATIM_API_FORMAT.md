# Nominatim API JSON Format Documentation

## Overview

This document provides comprehensive documentation for the Nominatim API JSON format as used in the Guia.js project. Nominatim is the geocoding service provided by OpenStreetMap that powers the reverse geocoding functionality in Guia.js.

The Nominatim API returns detailed geographic and address information in JSON format when querying for location data based on coordinates (reverse geocoding) or search queries (forward geocoding).

## API Endpoint

Guia.js uses the Nominatim reverse geocoding endpoint:

```
https://nominatim.openstreetmap.org/reverse?format=json&lat={latitude}&lon={longitude}&zoom=18&addressdetails=1
```

**Parameters:**
- `format=json` - Returns data in JSON format
- `lat={latitude}` - Latitude coordinate (e.g., -23.5505)
- `lon={longitude}` - Longitude coordinate (e.g., -46.6333)
- `zoom=18` - Zoom level (18 = building/street level detail)
- `addressdetails=1` - Include detailed address breakdown

## Complete JSON Response Structure

A typical Nominatim API response contains the following top-level fields:

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

## Address Object Structure

The `address` object contains detailed address components. Fields vary based on location type and available data:

### Core Address Fields

```javascript
{
  "road": "Rodovia dos Bandeirantes",           // Street name (primary)
  "street": "Alternative Street Name",          // Alternative street field
  "pedestrian": "Pedestrian Way Name",          // Pedestrian street
  "house_number": "1089",                       // Building/house number
  "building": "Shopping Morumbi",               // Building name
  "neighbourhood": "City América",              // Neighborhood/district
  "suburb": "São Domingos",                     // Suburb area
  "quarter": "District Quarter",                // Quarter/district
  "city": "São Paulo",                          // City name (primary)
  "town": "Small Town Name",                    // Town (for smaller places)
  "village": "Village Name",                    // Village (for rural areas)
  "municipality": "Região Imediata de São Paulo", // Municipality
  "county": "Região Metropolitana de São Paulo",  // County/region
  "state_district": "Região Geográfica Intermediária de São Paulo", // State district
  "state": "São Paulo",                         // State/province name (full)
  "state_code": "SP",                           // State abbreviation
  "ISO3166-2-lvl4": "BR-SP",                    // ISO 3166-2 code for state
  "region": "Região Sudeste",                   // Geographic region
  "postcode": "05145-200",                      // Postal/ZIP code
  "country": "Brasil",                          // Country name
  "country_code": "br"                          // ISO country code (lowercase)
}
```

### Field Descriptions and Usage

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

## Integration with Guia.js

### Address Field Mapping

Guia.js uses the `AddressDataExtractor` class to map Nominatim fields to Brazilian address standards:

```javascript
const nominatimResponse = await fetch(nominatimUrl).then(r => r.json());
const address = AddressDataExtractor.getBrazilianStandardAddress(nominatimResponse);

// Nominatim → Brazilian Standard mapping:
// road, street, pedestrian → logradouro
// house_number → numero
// neighbourhood, suburb, quarter → bairro
// city, town, municipality, village → municipio
// state, state_code, ISO3166-2-lvl4 (extracted) → uf
// Two-letter state code extracted from uf or ISO3166-2-lvl4 → siglaUF
// postcode → cep
// country → pais
```

### Priority and Fallback Chain

The extraction follows a priority order for each field:

1. **OSM address tags** (`addr:street`, `addr:housenumber`, etc.) - Highest priority
2. **Primary Nominatim fields** (`road`, `city`, `state`)
3. **Fallback Nominatim fields** (`street`, `town`, `state_code`)
4. **ISO3166-2-lvl4 extracted** (state abbreviation extracted from ISO code)
5. **Null** if no data available

**Note for `uf` and `siglaUF` fields**: 
- The `uf` field contains state name or abbreviation from `addr:state`, `state`, or `state_code` fields
- The `siglaUF` field contains the two-letter state abbreviation
- When `uf` is a two-letter code (e.g., "SP"), `siglaUF` will be set to the same value
- When `uf` is a full state name (e.g., "São Paulo"), `siglaUF` will attempt to extract the abbreviation from the `ISO3166-2-lvl4` field (e.g., "BR-SP" → "SP")
- The `AddressExtractor.extractSiglaUF()` static method handles extraction from ISO3166-2-lvl4 format

See [OSM_ADDRESS_TRANSLATION.md](./OSM_ADDRESS_TRANSLATION.md) for complete details.

### Code Example

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

## Important Notes

### Data Types

- **Coordinates (`lat`, `lon`)**: Always returned as **strings**, not numbers
- **Bounding box values**: Always **strings**, not numbers
- **IDs (`place_id`, `osm_id`)**: Numbers
- **Address fields**: Strings or null/undefined

### Handling Missing Fields

Not all fields are present in every response. Guia.js handles this gracefully:

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

Guia.js implements caching via `AddressCache` to minimize API calls.

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

## Testing and Validation

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
# Test Nominatim format handling
npm test -- __tests__/OSMAddressTranslation.test.js

# Test address extraction
npm test -- __tests__/AddressDataExtractor.test.js

# All tests
npm test
```

## Related Documentation

- **[OSM Address Translation](./OSM_ADDRESS_TRANSLATION.md)** - Address format mapping and translation
- **[Brazilian Address Standard](../architecture/BRAZILIAN_ADDRESS.md)** - BrazilianStandardAddress class documentation (if exists)
- **[Reference Place](../architecture/REFERENCE_PLACE.md)** - Location type classification
- **[Class Diagram](../architecture/CLASS_DIAGRAM.md)** - System architecture overview

## External References

- **[Nominatim API Documentation](https://nominatim.org/release-docs/latest/)** - Official API documentation
- **[Nominatim Output Details](https://nominatim.org/release-docs/latest/api/Output/)** - Response format specification
- **[OpenStreetMap Wiki - Addresses](https://wiki.openstreetmap.org/wiki/Addresses)** - OSM address tagging standards
- **[OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/)** - Live API service
- **[OSM Address Tags](https://wiki.openstreetmap.org/wiki/Key:addr)** - Address tagging guidelines

## Version History

- **v0.7.0-alpha** - Added comprehensive Nominatim API format documentation
- **v0.6.0-alpha** - Basic geocoding support

## Target Audience

This documentation is intended for:

- ✅ **Contributors** - Developers working on Guia.js
- ✅ **API Users** - Developers using Guia.js as a library
- ✅ **Maintainers** - Project maintainers understanding the integration
- ✅ **GitHub Copilot** - AI-assisted development with clear, structured information

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

## Contributing

When modifying Nominatim integration:

1. Update tests in `__tests__/OSMAddressTranslation.test.js`
2. Update this documentation with new fields or behavior
3. Maintain backward compatibility with existing Nominatim format
4. Follow referential transparency principles (pure functions)
5. Document any new field mappings

## Author

Marcelo Pereira Barbosa (@mpbarbosa)

## License

Documentation is part of the Guia.js project. See repository root for license information.

---

**Last Updated**: 2026-01-06  
**Version**: 0.7.0-alpha  
**Status**: ✅ Complete and up-to-date
