# AddressExtractor API Documentation

**Version:** 0.8.7-alpha  
**File:** `src/data/AddressExtractor.js`  
**Author:** Marcelo Pereira Barbosa  
**Since:** 0.8.3-alpha

## Overview

The `AddressExtractor` class extracts and standardizes address data from geocoding API responses, converting various API formats into a consistent `BrazilianStandardAddress` structure. It serves as the primary parser for OpenStreetMap Nominatim responses and supports both Nominatim API format and standard OSM address tags.

## Purpose

- Extract address data from geocoding API responses (OpenStreetMap Nominatim)
- Standardize various address field formats into Brazilian standard
- Provide intelligent fallback logic for missing data
- Support both Nominatim format and OSM address tags
- Create immutable address instances (frozen after creation)
- Extract reference place information for context

## Data Flow

```
Nominatim API Response → AddressExtractor → BrazilianStandardAddress (frozen)
                                         ↓
                                   ReferencePlace
```

**Consumers:**
- `AddressCache` - Caches extracted addresses
- `AddressDataExtractor` - Legacy facade (delegates to this class)
- `WebGeocodingManager` - Coordinates geocoding workflow

---

## Class Definition

```javascript
import AddressExtractor from './data/AddressExtractor.js';

const extractor = new AddressExtractor(geocodingData);
const address = extractor.enderecoPadronizado;  // BrazilianStandardAddress
```

---

## Constructor

### `new AddressExtractor(data)`

Creates a new AddressExtractor instance, extracts address data, and freezes the instance.

**Parameters:**
- `data` (`Object`) - Raw address data from geocoding API (Nominatim format)
  - `data.address` (`Object`) - Address component object
  - `data.class` (`string`, optional) - OSM feature class (e.g., "shop", "amenity")
  - `data.type` (`string`, optional) - OSM feature type (e.g., "mall", "cafe")
  - `data.name` (`string`, optional) - Feature name

**Returns:** Frozen `AddressExtractor` instance

**Immutability:** The instance is frozen using `Object.freeze(this)` after creation

**Example:**
```javascript
const nominatimResponse = {
  address: {
    road: "Avenida Paulista",
    house_number: "1578",
    neighbourhood: "Bela Vista",
    city: "São Paulo",
    county: "Região Metropolitana de São Paulo",
    state: "São Paulo",
    state_code: "SP",
    postcode: "01310-100",
    country: "Brasil"
  },
  class: "building",
  type: "yes",
  name: "MASP"
};

const extractor = new AddressExtractor(nominatimResponse);
console.log(extractor.enderecoPadronizado.municipioCompleto());
// Output: "São Paulo, SP"
```

---

## Properties

### `data`

**Type:** `Object`  
**Access:** Public (read-only after freeze)

Raw geocoding data passed to constructor.

### `enderecoPadronizado`

**Type:** `BrazilianStandardAddress`  
**Access:** Public (read-only after freeze)

The extracted and standardized Brazilian address object.

**Example:**
```javascript
const extractor = new AddressExtractor(geocodingData);
const address = extractor.enderecoPadronizado;

console.log(address.logradouro);     // "Avenida Paulista"
console.log(address.municipio);      // "São Paulo"
console.log(address.siglaUF);        // "SP"
```

---

## Static Methods

### `AddressExtractor.extractSiglaUF(iso3166Code)`

Extracts the state abbreviation (siglaUF) from ISO3166-2-lvl4 field.

**Parameters:**
- `iso3166Code` (`string`) - The ISO3166-2-lvl4 code (e.g., "BR-RJ", "BR-SP")

**Returns:** `string | null` - The state abbreviation (e.g., "RJ", "SP") or null if invalid

**Since:** 0.8.6-alpha

**Example:**
```javascript
const sigla1 = AddressExtractor.extractSiglaUF("BR-RJ");
console.log(sigla1);  // "RJ"

const sigla2 = AddressExtractor.extractSiglaUF("BR-SP");
console.log(sigla2);  // "SP"

const sigla3 = AddressExtractor.extractSiglaUF("invalid");
console.log(sigla3);  // null

const sigla4 = AddressExtractor.extractSiglaUF(null);
console.log(sigla4);  // null
```

**Implementation:**
```javascript
static extractSiglaUF(iso3166Code) {
    if (!iso3166Code || typeof iso3166Code !== 'string') {
        return null;
    }
    
    // Extract the state code after "BR-" prefix
    const match = iso3166Code.match(/^BR-([A-Z]{2})$/);
    return match ? match[1] : null;
}
```

**Use Cases:**
- Extract state abbreviation from Nominatim `ISO3166-2-lvl4` field
- Fallback when `state_code` is not available
- Handle international address formats

---

## Public Methods

### `toString()`

Returns a string representation of the extractor.

**Returns:** `string` - String representation with complete address

**Example:**
```javascript
const extractor = new AddressExtractor(geocodingData);
console.log(extractor.toString());
// Output: "AddressExtractor: Avenida Paulista, 1578, Bela Vista, São Paulo, SP, 01310-100"
```

---

## Private Methods

### `padronizaEndereco()` (Private)

Standardizes the address data into Brazilian format. This method is automatically called by the constructor.

**Field Mapping Logic:**

#### 1. Street Name (`logradouro`)
```javascript
this.enderecoPadronizado.logradouro = 
    address['addr:street'] ||    // OSM tag (highest priority)
    address.road ||               // Nominatim standard
    address.street ||             // Alternative format
    address.pedestrian ||         // Pedestrian ways
    null;
```

**Supported Fields:** `addr:street`, `road`, `street`, `pedestrian`

#### 2. Street Number (`numero`)
```javascript
this.enderecoPadronizado.numero = 
    address['addr:housenumber'] || // OSM tag
    address.house_number ||         // Nominatim standard
    null;
```

**Supported Fields:** `addr:housenumber`, `house_number`

#### 3. Neighborhood (`bairro`)
```javascript
this.enderecoPadronizado.bairro = 
    address['addr:neighbourhood'] || // OSM tag
    address.neighbourhood ||          // Nominatim standard
    address.suburb ||                 // Alternative
    address.quarter ||                // Alternative
    null;
```

**Supported Fields:** `addr:neighbourhood`, `neighbourhood`, `suburb`, `quarter`

#### 4. Municipality (`municipio`)
```javascript
this.enderecoPadronizado.municipio = 
    address['addr:city'] ||  // OSM tag
    address.city ||          // Nominatim standard
    address.town ||          // Smaller cities
    address.municipality ||  // Municipality level
    address.village ||       // Village level
    null;
```

**Supported Fields:** `addr:city`, `city`, `town`, `municipality`, `village`

**Note:** `hamlet` is intentionally NOT included - hamlets are subdivisions within municipalities, not municipalities themselves.

#### 5. Metropolitan Region (`regiaoMetropolitana`) - *v0.8.7-alpha*
```javascript
this.enderecoPadronizado.regiaoMetropolitana = address.county || null;
```

**Extraction Source:** Nominatim stores metropolitan regions in the `county` field for Brazilian addresses

**Examples:**
- "Região Metropolitana do Recife"
- "Região Metropolitana de São Paulo"
- "Região Metropolitana do Rio de Janeiro"

#### 6. State Full Name (`uf`)
```javascript
this.enderecoPadronizado.uf = 
    address['addr:state'] ||  // OSM tag (priority)
    address.state ||          // Nominatim standard
    null;
```

**Rule:** Contains ONLY full state names (e.g., "São Paulo", "Rio de Janeiro")

**Supported Fields:** `addr:state`, `state`

#### 7. State Abbreviation (`siglaUF`)
```javascript
this.enderecoPadronizado.siglaUF = 
    address.state_code ||                              // Direct code
    AddressExtractor.extractSiglaUF(address['ISO3166-2-lvl4']) || // Extract from ISO code
    null;

// Backward compatibility: if uf contains a 2-letter code, use it
if (this.enderecoPadronizado.uf && /^[A-Z]{2}$/.test(this.enderecoPadronizado.uf)) {
    this.enderecoPadronizado.siglaUF = this.enderecoPadronizado.uf;
}
```

**Rule:** Contains ONLY two-letter state abbreviations (e.g., "SP", "RJ")

**Priority:**
1. `state_code` - Direct state abbreviation
2. `ISO3166-2-lvl4` - Extract from ISO code using `extractSiglaUF()`
3. `uf` field - If it's already a 2-letter code (backward compatibility)

#### 8. Postal Code (`cep`)
```javascript
this.enderecoPadronizado.cep = 
    address['addr:postcode'] || // OSM tag
    address.postcode ||         // Nominatim standard
    null;
```

**Supported Fields:** `addr:postcode`, `postcode`

#### 9. Country (`pais`)
```javascript
this.enderecoPadronizado.pais = 
    address.country === 'Brasil' || address.country === 'Brazil' 
        ? 'Brasil' 
        : (address.country || 'Brasil');
```

**Default:** "Brasil"  
**Normalization:** Both "Brasil" and "Brazil" are normalized to "Brasil"

#### 10. Reference Place
```javascript
this.enderecoPadronizado.referencePlace = new ReferencePlace(this.data);
```

Creates a `ReferencePlace` instance from the geocoding data (includes `class`, `type`, `name` fields).

---

## Brazilian Address Field Mapping

### Complete Mapping Table

| Brazilian Field | Nominatim Field(s) | OSM Tag | Priority | Description |
|----------------|-------------------|---------|----------|-------------|
| `logradouro` | `road`, `street`, `pedestrian` | `addr:street` | OSM tag first | Street name |
| `numero` | `house_number` | `addr:housenumber` | OSM tag first | Street number |
| `bairro` | `neighbourhood`, `suburb`, `quarter` | `addr:neighbourhood` | OSM tag first | Neighborhood |
| `municipio` | `city`, `town`, `municipality`, `village` | `addr:city` | OSM tag first | Municipality |
| `regiaoMetropolitana` | `county` | - | - | Metropolitan region (v0.8.7) |
| `uf` | `state` | `addr:state` | OSM tag first | State full name |
| `siglaUF` | `state_code`, `ISO3166-2-lvl4` | - | state_code first | State abbreviation |
| `cep` | `postcode` | `addr:postcode` | OSM tag first | Postal code |
| `pais` | `country` | - | - | Country (normalized) |

### Fallback Hierarchy Example

For **Municipality** (`municipio`):
```
1. address['addr:city']      // OSM tag (highest priority)
2. address.city              // Nominatim: major cities
3. address.town              // Nominatim: smaller cities
4. address.municipality      // Nominatim: municipality level
5. address.village           // Nominatim: village level
6. null                      // No data available
```

---

## Integration Examples

### Basic Usage

```javascript
import AddressExtractor from './data/AddressExtractor.js';

const nominatimData = {
  address: {
    road: "Avenida Boa Viagem",
    house_number: "5000",
    neighbourhood: "Boa Viagem",
    city: "Recife",
    county: "Região Metropolitana do Recife",
    state: "Pernambuco",
    state_code: "PE",
    postcode: "51021-000",
    country: "Brasil"
  }
};

const extractor = new AddressExtractor(nominatimData);
const address = extractor.enderecoPadronizado;

console.log(address.logradouroCompleto());        // "Avenida Boa Viagem, 5000"
console.log(address.bairroCompleto());            // "Boa Viagem"
console.log(address.municipioCompleto());         // "Recife, PE"
console.log(address.regiaoMetropolitanaFormatada()); // "Região Metropolitana do Recife"
console.log(address.enderecoCompleto());
// "Avenida Boa Viagem, 5000, Boa Viagem, Recife, PE, 51021-000"
```

### Handling OSM Address Tags

```javascript
// Nominatim can return OSM address tags directly
const osmData = {
  address: {
    'addr:street': 'Rua Oscar Freire',
    'addr:housenumber': '379',
    'addr:neighbourhood': 'Jardins',
    'addr:city': 'São Paulo',
    'addr:state': 'São Paulo',
    'addr:postcode': '01426-001',
    country: 'Brasil'
  }
};

const extractor = new AddressExtractor(osmData);
const address = extractor.enderecoPadronizado;

console.log(address.logradouro);  // "Rua Oscar Freire"
console.log(address.numero);      // "379"
console.log(address.bairro);      // "Jardins"
```

### Handling Missing Fields

```javascript
// Partial address data
const partialData = {
  address: {
    city: "Olinda",
    state: "Pernambuco",
    country: "Brasil"
  }
};

const extractor = new AddressExtractor(partialData);
const address = extractor.enderecoPadronizado;

console.log(address.logradouro);   // null
console.log(address.numero);       // null
console.log(address.bairro);       // null
console.log(address.municipio);    // "Olinda"
console.log(address.uf);           // "Pernambuco"
console.log(address.enderecoCompleto()); // "Olinda"
```

### State Abbreviation Extraction

```javascript
// Using ISO3166-2-lvl4 field
const dataWithISO = {
  address: {
    city: "Salvador",
    state: "Bahia",
    "ISO3166-2-lvl4": "BR-BA",  // ISO code
    country: "Brasil"
  }
};

const extractor = new AddressExtractor(dataWithISO);
const address = extractor.enderecoPadronizado;

console.log(address.siglaUF);  // "BA" (extracted from ISO code)
console.log(address.uf);       // "Bahia"
```

### With Reference Place

```javascript
const dataWithPlace = {
  address: {
    road: "Avenida Paulista",
    house_number: "1578",
    city: "São Paulo",
    state: "São Paulo",
    state_code: "SP",
    country: "Brasil"
  },
  class: "shop",
  type: "mall",
  name: "Shopping Paulista"
};

const extractor = new AddressExtractor(dataWithPlace);
const address = extractor.enderecoPadronizado;

console.log(address.referencePlace.description);
// "Shopping Center Shopping Paulista"
console.log(address.referencePlace.name);
// "Shopping Paulista"
```

### Integration with AddressCache

```javascript
import AddressCache from './data/AddressCache.js';

const cache = AddressCache.getInstance();

// AddressCache uses AddressExtractor internally
const address = cache.getBrazilianStandardAddress(nominatimData);

// The extraction and caching happen automatically
console.log(address.municipioCompleto());  // "Recife, PE"
```

---

## Immutability

The `AddressExtractor` instance is **frozen** after creation using `Object.freeze(this)`. This prevents any modification of the extractor or its properties after construction.

**Example:**
```javascript
const extractor = new AddressExtractor(geocodingData);

// Attempting to modify will fail in strict mode or be silently ignored
extractor.data = null;  // ❌ Cannot modify
extractor.enderecoPadronizado = new BrazilianStandardAddress();  // ❌ Cannot modify

// Object.isFrozen() confirms immutability
console.log(Object.isFrozen(extractor));  // true
```

**Rationale:**
- Follows MP Barbosa immutability standards (see `.github/CONTRIBUTING.md`)
- Prevents accidental modification of extracted data
- Ensures referential transparency for caching
- Supports functional programming patterns

---

## Version History

### v0.8.7-alpha (Current)
- **Added**: Metropolitan region extraction from `county` field
- **Enhancement**: `regiaoMetropolitana` support in `BrazilianStandardAddress`
- **Integration**: Used by `HTMLHighlightCardsDisplayer` for metro region display

### v0.8.6-alpha
- **Added**: `extractSiglaUF()` static method for ISO3166-2-lvl4 parsing
- **Enhancement**: Improved state abbreviation extraction logic
- **Documentation**: Added comprehensive field mapping documentation

### v0.8.3-alpha (Initial)
- Initial implementation with full field mapping
- Support for both Nominatim format and OSM address tags
- Immutable pattern with `Object.freeze()`
- Integration with `BrazilianStandardAddress` and `ReferencePlace`

---

## Testing

Comprehensive test coverage in:
- `__tests__/unit/data/AddressExtractor.test.js`
- `__tests__/integration/address-extraction.test.js`
- `__tests__/e2e/complete-address-validation.e2e.test.js`

**Example Test:**
```javascript
describe('AddressExtractor', () => {
  test('extracts complete Brazilian address', () => {
    const data = {
      address: {
        road: "Avenida Paulista",
        house_number: "1578",
        neighbourhood: "Bela Vista",
        city: "São Paulo",
        state: "São Paulo",
        state_code: "SP",
        postcode: "01310-100",
        country: "Brasil"
      }
    };
    
    const extractor = new AddressExtractor(data);
    const address = extractor.enderecoPadronizado;
    
    expect(address.logradouro).toBe("Avenida Paulista");
    expect(address.numero).toBe("1578");
    expect(address.bairro).toBe("Bela Vista");
    expect(address.municipio).toBe("São Paulo");
    expect(address.siglaUF).toBe("SP");
  });
  
  test('is frozen after creation', () => {
    const extractor = new AddressExtractor({ address: {} });
    expect(Object.isFrozen(extractor)).toBe(true);
  });
});
```

---

## Related Classes

- **`BrazilianStandardAddress`** - Target data structure for extraction
- **`AddressCache`** - Caches extracted addresses
- **`AddressDataExtractor`** - Legacy facade (delegates to AddressExtractor)
- **`ReferencePlace`** - Reference place information
- **`WebGeocodingManager`** - Coordinates geocoding workflow

---

## See Also

- [BRAZILIAN_STANDARD_ADDRESS.md](./BRAZILIAN_STANDARD_ADDRESS.md) - Target address data structure
- [ADDRESS_CACHE.md](./ADDRESS_CACHE.md) - Caching extracted addresses
- [ADDRESS_DATA_EXTRACTOR.md](./ADDRESS_DATA_EXTRACTOR.md) - Legacy facade
- [REFERENCE_PLACE.md](./REFERENCE_PLACE.md) - Reference place details
