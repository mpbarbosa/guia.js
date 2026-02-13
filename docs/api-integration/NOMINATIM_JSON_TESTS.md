# Nominatim JSON Format Tests

## Overview

This document describes the test suite created for validating Nominatim API JSON responses in the Guia Turístico project.

## Test File

**Location:** `__tests__/NominatimJSONFormat.test.js`

**Created:** Version 0.9.0-alpha

**Purpose:** Comprehensive validation of Nominatim API JSON format and data extraction for Brazilian addresses.

## Test Data

The test suite uses a real-world Nominatim API response from:

- **Location:** Mairiporã, São Paulo, Brazil
- **Coordinates:** -23.3303320, -46.5766545
- **Type:** shop/car_repair
- **Place ID:** 8779308
- **OSM ID:** 184347107

## Test Coverage (44 Tests Total)

### 1. Top-Level Fields (11 Tests)

Tests for the main Nominatim response fields:

- ✅ `place_id` - Numeric identifier validation
- ✅ `licence` - OSM license string verification
- ✅ `osm_type` - Type validation (way/node/relation)
- ✅ `osm_id` - OSM element ID validation
- ✅ `lat` / `lon` - Coordinate format (strings, not numbers)
- ✅ `class` / `type` - Classification validation
- ✅ `place_rank` - Importance ranking (0-30)
- ✅ `importance` - Importance score validation
- ✅ `addresstype` - Address type field
- ✅ `name` - Name field (can be empty string)
- ✅ `display_name` - Full formatted address

### 2. Address Object Structure (13 Tests)

Tests for detailed address components:

- ✅ `road` - Street name
- ✅ `neighbourhood` - Neighborhood field
- ✅ `suburb` - Suburb/district field
- ✅ `town` - Town name (for smaller cities)
- ✅ `municipality` - Municipality region
- ✅ `county` - County/metropolitan region
- ✅ `state` - State full name
- ✅ `ISO3166-2-lvl4` - ISO state code (BR-SP format)
- ✅ `region` - Geographic region
- ✅ `postcode` - Postal code (CEP)
- ✅ `country` - Country name
- ✅ `country_code` - ISO country code

### 3. Bounding Box Format (4 Tests)

Tests for geographic boundaries:

- ✅ Array structure validation
- ✅ String format verification (not numbers)
- ✅ Format validation [min_lat, max_lat, min_lon, max_lon]
- ✅ Coordinate containment within bounds

### 4. Reference Place Handling (2 Tests)

Tests for location reference (shop/car_repair):

- ✅ ReferencePlace creation with class/type
- ✅ Empty name handling

### 5. Address Extraction (5 Tests)

Tests for Brazilian standard address mapping:

- ✅ Complete address extraction (logradouro, bairro, municipio, uf, cep, pais)
- ✅ Field priority (town vs city_district)
- ✅ ISO3166-2-lvl4 state abbreviation extraction (BR-SP → SP)
- ✅ Missing house_number handling
- ✅ Suburb fallback for bairro

### 6. Data Type Validation (4 Tests)

Tests for correct data types:

- ✅ Numeric IDs (place_id, osm_id)
- ✅ Coordinate strings (lat, lon, boundingbox)
- ✅ Score numbers (place_rank, importance)
- ✅ Address field strings

### 7. Portuguese Character Encoding (2 Tests)

Tests for UTF-8 character handling:

- ✅ Portuguese characters preservation (São, Região)
- ✅ Special characters in street names (Antônio)

### 8. JSON Structure Integrity (3 Tests)

Tests for complete structure validation:

- ✅ All required top-level fields present
- ✅ Valid address structure for Mairiporã
- ✅ Match expected JSON from issue specification

## Running the Tests

```bash
# Run only Nominatim JSON format tests
npm test -- __tests__/NominatimJSONFormat.test.js

# Run with verbose output
npm test -- __tests__/NominatimJSONFormat.test.js --verbose

# Run all tests
npm test
```

## Expected Output

```text
PASS __tests__/NominatimJSONFormat.test.js
  Nominatim JSON Format Tests
    Top-Level Fields
      ✓ should have valid place_id as number
      ✓ should have licence information
      ... (44 tests total)

Test Suites: 1 passed, 1 total
Tests:       44 passed, 44 total
```

## Key Features Tested

1. **Real-World Data**: Uses actual Nominatim API response
2. **Type Safety**: Validates correct data types (strings vs numbers)
3. **Brazilian Standards**: Tests mapping to Brazilian address format
4. **Fallback Chains**: Tests field priority and fallback logic
5. **Character Encoding**: Validates UTF-8 Portuguese character handling
6. **Edge Cases**: Tests empty names, missing fields
7. **Format Validation**: Tests ISO codes, postcode format, bounding box

## Integration with Guia.js

The tests validate that Guia.js correctly:

- Extracts data from Nominatim API responses
- Maps to Brazilian standard address fields (logradouro, bairro, municipio, uf, cep, pais)
- Handles missing or optional fields gracefully
- Preserves Portuguese character encoding
- Creates reference places from class/type data

## Related Documentation

- [Nominatim Integration Documentation](./NOMINATIM_INTEGRATION.md)
- [OSM Address Translation Tests](../__tests__/OSMAddressTranslation.test.js)
- [Address Data Extractor Tests](../__tests__/AddressDataExtractor.test.js)
- [Reference Place Tests](../__tests__/ReferencePlace.test.js)

## Author

MP Barbosa

## Version History

- **0.9.0-alpha** - Initial test suite creation with 44 comprehensive tests

## License

Part of the Guia Turístico project (ISC License)
