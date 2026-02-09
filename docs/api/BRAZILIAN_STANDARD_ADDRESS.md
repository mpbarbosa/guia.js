# BrazilianStandardAddress API Documentation

**Version:** 0.8.7-alpha  
**File:** `src/data/BrazilianStandardAddress.js`  
**Author:** Marcelo Pereira Barbosa  
**Since:** 0.8.3-alpha

## Overview

The `BrazilianStandardAddress` class provides a standardized data structure for representing Brazilian addresses with formatting methods for displaying complete address information. It follows immutable patterns for data manipulation and ensures consistent address representation across the application.

## Purpose

- Standardize Brazilian address data structure
- Provide formatted output methods for address display
- Support Brazilian-specific address components (logradouro, bairro, município, UF, CEP)
- Follow immutability principles for data manipulation
- Support metropolitan region display (v0.8.7-alpha)

## Data Flow

```
Raw API Data → AddressExtractor → BrazilianStandardAddress → Display Components
```

The class serves as a data model consumed by:
- `HTMLAddressDisplayer` - Address UI rendering
- `AddressCache` - Cached address storage
- `AddressExtractor` - Address standardization pipeline
- `HTMLHighlightCardsDisplayer` - Municipality/neighborhood cards

---

## Class Definition

```javascript
import BrazilianStandardAddress from './data/BrazilianStandardAddress.js';

const address = new BrazilianStandardAddress();
```

---

## Constructor

### `new BrazilianStandardAddress()`

Creates a new BrazilianStandardAddress instance with all fields initialized to `null` (except `pais` which defaults to "Brasil").

**Parameters:** None

**Example:**
```javascript
const address = new BrazilianStandardAddress();
console.log(address.pais); // "Brasil"
console.log(address.municipio); // null
```

---

## Properties

All properties are public and can be directly accessed and modified:

| Property | Type | Description | Default | Version |
|----------|------|-------------|---------|---------|
| `logradouro` | `string \| null` | Street name (e.g., "Avenida Paulista") | `null` | 0.8.3-alpha |
| `numero` | `string \| null` | Street number (e.g., "1578") | `null` | 0.8.3-alpha |
| `complemento` | `string \| null` | Address complement (e.g., "Apt 10") | `null` | 0.8.3-alpha |
| `bairro` | `string \| null` | Neighborhood (e.g., "Bela Vista") | `null` | 0.8.3-alpha |
| `municipio` | `string \| null` | Municipality/city (e.g., "São Paulo") | `null` | 0.8.3-alpha |
| `regiaoMetropolitana` | `string \| null` | Metropolitan region (e.g., "Região Metropolitana do Recife") | `null` | 0.8.7-alpha |
| `uf` | `string \| null` | State full name (e.g., "São Paulo", "Rio de Janeiro") | `null` | 0.8.3-alpha |
| `siglaUF` | `string \| null` | State abbreviation (e.g., "SP", "RJ") | `null` | 0.8.3-alpha |
| `cep` | `string \| null` | Postal code (e.g., "01310-100") | `null` | 0.8.3-alpha |
| `pais` | `string` | Country name | `"Brasil"` | 0.8.3-alpha |

### Property Details

**`logradouro` (Street Name)**
- Contains the street, avenue, road, or pathway name
- Examples: "Rua Augusta", "Avenida Paulista", "Travessa do Comércio"

**`bairro` (Neighborhood)**
- Brazilian neighborhood or district
- Examples: "Copacabana", "Ipanema", "Centro"

**`municipio` (Municipality)**
- City or municipality name
- Examples: "São Paulo", "Rio de Janeiro", "Recife"

**`regiaoMetropolitana` (Metropolitan Region)** - *New in v0.8.7-alpha*
- Metropolitan region name for cities in metro areas
- Extracted from Nominatim `county` field
- Examples: "Região Metropolitana do Recife", "Região Metropolitana de São Paulo"
- Used by `HTMLHighlightCardsDisplayer` for context information

**`uf` and `siglaUF` (State)**
- `uf`: Full state name (e.g., "Pernambuco", "São Paulo")
- `siglaUF`: Two-letter state code (e.g., "PE", "SP")
- These are kept separate to support both full and abbreviated displays

---

## Public Methods

### `logradouroCompleto()`

Returns the complete formatted street address (street name + number).

**Returns:** `string` - Formatted street address or just street name

**Example:**
```javascript
const address = new BrazilianStandardAddress();
address.logradouro = "Avenida Paulista";
address.numero = "1578";

console.log(address.logradouroCompleto());
// Output: "Avenida Paulista, 1578"

// Without number
address.numero = null;
console.log(address.logradouroCompleto());
// Output: "Avenida Paulista"
```

**Implementation:**
```javascript
logradouroCompleto() {
    if (!this.logradouro) return "";
    if (this.numero) {
        return `${this.logradouro}, ${this.numero}`;
    }
    return this.logradouro;
}
```

---

### `bairroCompleto()`

Returns the complete formatted neighborhood information.

**Returns:** `string` - Formatted neighborhood name

**Example:**
```javascript
const address = new BrazilianStandardAddress();
address.bairro = "Copacabana";

console.log(address.bairroCompleto());
// Output: "Copacabana"
```

**Implementation:**
```javascript
bairroCompleto() {
    return this.bairro || "";
}
```

---

### `municipioCompleto()`

Returns the complete formatted city and state information (município + state abbreviation).

**Returns:** `string` - Formatted city and state

**Example:**
```javascript
const address = new BrazilianStandardAddress();
address.municipio = "Recife";
address.siglaUF = "PE";

console.log(address.municipioCompleto());
// Output: "Recife, PE"

// Without state
address.siglaUF = null;
console.log(address.municipioCompleto());
// Output: "Recife"
```

**Implementation:**
```javascript
municipioCompleto() {
    if (!this.municipio) return "";
    if (this.siglaUF) {
        return `${this.municipio}, ${this.siglaUF}`;
    }
    return this.municipio;
}
```

---

### `regiaoMetropolitanaFormatada()` *(New in v0.8.7-alpha)*

Returns the formatted metropolitan region name.

**Returns:** `string` - Metropolitan region name or empty string

**Example:**
```javascript
const address = new BrazilianStandardAddress();
address.regiaoMetropolitana = "Região Metropolitana do Recife";

console.log(address.regiaoMetropolitanaFormatada());
// Output: "Região Metropolitana do Recife"

// Without metropolitan region
address.regiaoMetropolitana = null;
console.log(address.regiaoMetropolitanaFormatada());
// Output: ""
```

**Use Case:**
- Display metropolitan region context in highlight cards
- Provide additional geographic context for addresses
- Used by `HTMLHighlightCardsDisplayer` for metro region display

**Implementation:**
```javascript
regiaoMetropolitanaFormatada() {
    return this.regiaoMetropolitana || "";
}
```

---

### `enderecoCompleto()`

Returns a complete formatted address string combining all address components.

**Returns:** `string` - Complete formatted address

**Immutability Pattern:** Uses `filter()` and `join()` for immutable array operations

**Example:**
```javascript
const address = new BrazilianStandardAddress();
address.logradouro = "Avenida Paulista";
address.numero = "1578";
address.bairro = "Bela Vista";
address.municipio = "São Paulo";
address.siglaUF = "SP";
address.cep = "01310-100";

console.log(address.enderecoCompleto());
// Output: "Avenida Paulista, 1578, Bela Vista, São Paulo, SP, 01310-100"
```

**Implementation:**
```javascript
enderecoCompleto() {
    return [
        this.logradouroCompleto(),
        this.bairro,
        this.municipioCompleto(),
        this.cep
    ]
        .filter(Boolean)  // Remove falsy values (immutable pattern)
        .join(", ");
}
```

---

### `toString()`

Returns a string representation of the address object.

**Returns:** `string` - String representation

**Example:**
```javascript
const address = new BrazilianStandardAddress();
address.logradouro = "Avenida Paulista";
address.municipio = "São Paulo";

console.log(address.toString());
// Output: "BrazilianStandardAddress: Avenida Paulista, São Paulo"

// Empty address
const empty = new BrazilianStandardAddress();
console.log(empty.toString());
// Output: "BrazilianStandardAddress: Empty address"
```

---

## Brazilian Address Field Mapping

### OSM/Nominatim to Brazilian Standard

| Nominatim Field | Brazilian Field | Description |
|-----------------|-----------------|-------------|
| `road`, `street`, `pedestrian` | `logradouro` | Street name |
| `house_number` | `numero` | Street number |
| `neighbourhood`, `suburb`, `quarter` | `bairro` | Neighborhood |
| `city`, `town`, `municipality`, `village` | `municipio` | Municipality |
| `county` | `regiaoMetropolitana` | Metropolitan region (v0.8.7) |
| `state` | `uf` | State full name |
| `state_code`, `ISO3166-2-lvl4` | `siglaUF` | State abbreviation |
| `postcode` | `cep` | Postal code |
| `country` | `pais` | Country |

### Example Nominatim Response

```json
{
  "address": {
    "road": "Avenida Paulista",
    "house_number": "1578",
    "neighbourhood": "Bela Vista",
    "city": "São Paulo",
    "county": "Região Metropolitana de São Paulo",
    "state": "São Paulo",
    "state_code": "SP",
    "postcode": "01310-100",
    "country": "Brasil"
  }
}
```

**Converted to BrazilianStandardAddress:**
```javascript
{
  logradouro: "Avenida Paulista",
  numero: "1578",
  bairro: "Bela Vista",
  municipio: "São Paulo",
  regiaoMetropolitana: "Região Metropolitana de São Paulo",
  uf: "São Paulo",
  siglaUF: "SP",
  cep: "01310-100",
  pais: "Brasil"
}
```

---

## Integration Examples

### Basic Usage with Manual Population

```javascript
import BrazilianStandardAddress from './data/BrazilianStandardAddress.js';

// Create and populate address
const address = new BrazilianStandardAddress();
address.logradouro = "Rua da Consolação";
address.numero = "930";
address.bairro = "Consolação";
address.municipio = "São Paulo";
address.siglaUF = "SP";
address.cep = "01302-000";

// Display formatted address
console.log(address.enderecoCompleto());
// "Rua da Consolação, 930, Consolação, São Paulo, SP, 01302-000"
```

### Usage with AddressExtractor

```javascript
import AddressExtractor from './data/AddressExtractor.js';

// Extract from geocoding API response
const geocodingData = {
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

const extractor = new AddressExtractor(geocodingData);
const address = extractor.enderecoPadronizado;

console.log(address.municipioCompleto());        // "Recife, PE"
console.log(address.regiaoMetropolitanaFormatada()); // "Região Metropolitana do Recife"
console.log(address.enderecoCompleto());
// "Avenida Boa Viagem, 5000, Boa Viagem, Recife, PE, 51021-000"
```

### Usage with AddressCache

```javascript
import AddressCache from './data/AddressCache.js';

const cache = AddressCache.getInstance();

// Get standardized address from cache or create new
const address = cache.getBrazilianStandardAddress(geocodingData);

// Access formatted output
document.getElementById('street').textContent = address.logradouroCompleto();
document.getElementById('neighborhood').textContent = address.bairroCompleto();
document.getElementById('city').textContent = address.municipioCompleto();
document.getElementById('metro').textContent = address.regiaoMetropolitanaFormatada();
```

### Display in UI Components

```javascript
import HTMLAddressDisplayer from './html/HTMLAddressDisplayer.js';

// Render address in HTML
const displayer = new HTMLAddressDisplayer(address, document);
displayer.display();
```

---

## Version History

### v0.8.7-alpha (Current)
- **Added**: `regiaoMetropolitana` property for metropolitan region support
- **Added**: `regiaoMetropolitanaFormatada()` method
- **Enhancement**: Support for displaying metropolitan region context in highlight cards
- **Integration**: Used by `HTMLHighlightCardsDisplayer` for metro region display

### v0.8.3-alpha (Initial)
- Initial implementation with all core properties
- Immutable data manipulation patterns using `filter()` and `join()`
- Complete formatting methods for address display
- Support for Brazilian address components (logradouro, bairro, município, UF, CEP)

---

## Immutability Patterns

The class follows immutability principles recommended in `.github/CONTRIBUTING.md`:

**✅ Uses immutable array operations:**
```javascript
// Good: filter() and join() (immutable)
return [
    this.logradouroCompleto(),
    this.bairro,
    this.municipioCompleto(),
    this.cep
]
    .filter(Boolean)  // Creates new array
    .join(", ");      // Creates new string
```

**❌ Avoids mutating operations:**
```javascript
// Bad: push() and sort() (mutating)
const parts = [];
if (this.logradouro) parts.push(this.logradouro);
if (this.bairro) parts.push(this.bairro);
return parts.join(", ");
```

---

## Testing

The class has comprehensive test coverage in:
- `__tests__/unit/data/BrazilianStandardAddress.test.js`
- `__tests__/integration/address-extraction.test.js`
- `__tests__/e2e/complete-address-validation.e2e.test.js`

**Example Test:**
```javascript
describe('BrazilianStandardAddress', () => {
  test('formats complete address correctly', () => {
    const address = new BrazilianStandardAddress();
    address.logradouro = "Avenida Paulista";
    address.numero = "1578";
    address.bairro = "Bela Vista";
    address.municipio = "São Paulo";
    address.siglaUF = "SP";
    
    expect(address.enderecoCompleto()).toBe(
      "Avenida Paulista, 1578, Bela Vista, São Paulo, SP"
    );
  });
  
  test('formats metropolitan region correctly', () => {
    const address = new BrazilianStandardAddress();
    address.regiaoMetropolitana = "Região Metropolitana do Recife";
    
    expect(address.regiaoMetropolitanaFormatada()).toBe(
      "Região Metropolitana do Recife"
    );
  });
});
```

---

## Related Classes

- **`AddressExtractor`** - Populates BrazilianStandardAddress from API data
- **`AddressCache`** - Caches BrazilianStandardAddress instances
- **`AddressDataExtractor`** - Legacy facade (delegates to AddressExtractor)
- **`HTMLAddressDisplayer`** - Renders BrazilianStandardAddress in UI
- **`HTMLHighlightCardsDisplayer`** - Displays municipality and metropolitan region cards

---

## See Also

- [ADDRESS_EXTRACTOR.md](./ADDRESS_EXTRACTOR.md) - Address extraction from API data
- [ADDRESS_CACHE.md](./ADDRESS_CACHE.md) - Address caching strategy
- [ADDRESS_DATA_EXTRACTOR.md](./ADDRESS_DATA_EXTRACTOR.md) - Legacy facade
- [REFERENCE_PLACE.md](./REFERENCE_PLACE.md) - Reference place integration
