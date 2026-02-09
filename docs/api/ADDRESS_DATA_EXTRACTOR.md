# AddressDataExtractor API Documentation

**Version:** 0.8.7-alpha  
**File:** `src/data/AddressDataExtractor.js`  
**Author:** Marcelo Pereira Barbosa  
**Since:** 0.8.3-alpha  
**Status:** ⚠️ **DEPRECATED** - Use `AddressCache` directly for new code

## Overview

The `AddressDataExtractor` class is a **legacy wrapper** that maintains backward compatibility with existing code while delegating to the refactored `AddressExtractor` and `AddressCache` classes. Following the Single Responsibility Principle, the original class was split into specialized components with clear, focused responsibilities.

**This class serves as a facade and exists only for backward compatibility. New code should use `AddressCache` and `AddressExtractor` directly.**

## Purpose

- Maintain API compatibility with legacy code
- Delegate operations to specialized classes (`AddressExtractor`, `AddressCache`)
- Provide migration path for existing consumers
- Preserve original API surface for existing tests

## Architecture Refactoring

### Original (Pre-v0.8.3)
```
AddressDataExtractor (Single class handling everything)
├── Address extraction
├── Address caching
├── Change detection
├── Callback management
└── LRU eviction
```

### Refactored (v0.8.3+)
```
AddressDataExtractor (Facade - backward compatibility only)
├── AddressExtractor
│   ├── Address extraction
│   └── Field mapping
└── AddressCache (Singleton)
    ├── Caching with LRU
    ├── Change detection
    ├── Callback management
    └── Observer pattern
```

**Design Benefits:**
- **Single Responsibility**: Each class has one clear purpose
- **Testability**: Easier to test individual components
- **Maintainability**: Simpler code with focused responsibilities
- **Reusability**: Components can be used independently

---

## Migration Guide

### Old Code (Still Works)
```javascript
import AddressDataExtractor from './data/AddressDataExtractor.js';

// Create extractor instance
const extractor = new AddressDataExtractor(geocodingData);
const address = extractor.enderecoPadronizado;

// Static methods still work
AddressDataExtractor.setLogradouroChangeCallback((details) => {
  console.log('Street changed:', details);
});

const address2 = AddressDataExtractor.getBrazilianStandardAddress(data);
```

### New Code (Recommended)
```javascript
import AddressCache from './data/AddressCache.js';
import AddressExtractor from './data/AddressExtractor.js';

// Use AddressCache for caching and change detection
const cache = AddressCache.getInstance();
const address = cache.getBrazilianStandardAddress(geocodingData);

// Set callbacks
cache.setLogradouroChangeCallback((details) => {
  console.log('Street changed:', details);
});

// Use AddressExtractor directly for one-off extraction
const extractor = new AddressExtractor(geocodingData);
const address2 = extractor.enderecoPadronizado;
```

---

## Class Definition

```javascript
import AddressDataExtractor from './data/AddressDataExtractor.js';

// Instance usage (delegating to AddressExtractor)
const extractor = new AddressDataExtractor(geocodingData);

// Static usage (delegating to AddressCache)
const address = AddressDataExtractor.getBrazilianStandardAddress(geocodingData);
```

---

## Constructor

### `new AddressDataExtractor(data)`

Creates a new AddressDataExtractor instance by delegating to `AddressExtractor`.

**Parameters:**
- `data` (`Object`) - Raw address data from geocoding API

**Returns:** Frozen `AddressDataExtractor` instance

**Delegation:**
```javascript
constructor(data) {
    const extractor = new AddressExtractor(data);
    this.data = extractor.data;
    this.enderecoPadronizado = extractor.enderecoPadronizado;
    this.referencePlace = extractor.referencePlace;
    Object.freeze(this);
}
```

**Example:**
```javascript
const extractor = new AddressDataExtractor(geocodingData);
console.log(extractor.enderecoPadronizado.municipioCompleto());
// Output: "Recife, PE"
```

---

## Instance Properties

### `data`

**Type:** `Object`  
**Access:** Public (read-only after freeze)

Raw geocoding data passed to constructor. Delegated from `AddressExtractor`.

### `enderecoPadronizado`

**Type:** `BrazilianStandardAddress`  
**Access:** Public (read-only after freeze)

The extracted and standardized Brazilian address object. Delegated from `AddressExtractor`.

### `referencePlace`

**Type:** `ReferencePlace`  
**Access:** Public (read-only after freeze)

Reference place information extracted from geocoding data. Delegated from `AddressExtractor`.

---

## Static Methods (All Delegate to AddressCache)

### Cache Management

#### `AddressDataExtractor.generateCacheKey(data)`

Generates a cache key for address data.

**Parameters:**
- `data` (`Object`) - Address data from geocoding API

**Returns:** `string | null` - Cache key or null

**Delegation:** `AddressCache.generateCacheKey(data)`

**Example:**
```javascript
const key = AddressDataExtractor.generateCacheKey(geocodingData);
console.log(key); // "Avenida Paulista|1578|Bela Vista|São Paulo|01310-100|BR"
```

#### `AddressDataExtractor.clearCache()`

Clears all cache entries and resets change tracking.

**Returns:** `void`

**Delegation:** `AddressCache.getInstance().clearCache()`

**Example:**
```javascript
AddressDataExtractor.clearCache();
```

---

### Callback Registration

#### `AddressDataExtractor.setLogradouroChangeCallback(callback)`

Sets the callback function for logradouro (street) changes.

**Parameters:**
- `callback` (`Function | null`) - Function to call on logradouro changes

**Returns:** `void`

**Delegation:** `AddressCache.getInstance().setLogradouroChangeCallback(callback)`

**Example:**
```javascript
AddressDataExtractor.setLogradouroChangeCallback((details) => {
  console.log('Street changed:', details.current.logradouro);
  console.log('Previous:', details.previous.logradouro);
});
```

#### `AddressDataExtractor.setBairroChangeCallback(callback)`

Sets the callback function for bairro (neighborhood) changes.

**Parameters:**
- `callback` (`Function | null`) - Function to call on bairro changes

**Returns:** `void`

**Delegation:** `AddressCache.getInstance().setBairroChangeCallback(callback)`

**Example:**
```javascript
AddressDataExtractor.setBairroChangeCallback((details) => {
  console.log('Neighborhood changed:', details.current.bairro);
  console.log('Previous:', details.previous.bairro);
});
```

#### `AddressDataExtractor.setMunicipioChangeCallback(callback)`

Sets the callback function for municipio (municipality) changes.

**Parameters:**
- `callback` (`Function | null`) - Function to call on municipio changes

**Returns:** `void`

**Delegation:** `AddressCache.getInstance().setMunicipioChangeCallback(callback)`

**Example:**
```javascript
AddressDataExtractor.setMunicipioChangeCallback((details) => {
  console.log('City changed:', details.current.municipio);
  console.log('State:', details.current.uf);
});
```

---

### Callback Retrieval

#### `AddressDataExtractor.getLogradouroChangeCallback()`

Gets the currently registered logradouro change callback.

**Returns:** `Function | null`

**Delegation:** `AddressCache.getInstance().getLogradouroChangeCallback()`

#### `AddressDataExtractor.getBairroChangeCallback()`

Gets the currently registered bairro change callback.

**Returns:** `Function | null`

**Delegation:** `AddressCache.getInstance().getBairroChangeCallback()`

#### `AddressDataExtractor.getMunicipioChangeCallback()`

Gets the currently registered municipio change callback.

**Returns:** `Function | null`

**Delegation:** `AddressCache.getInstance().getMunicipioChangeCallback()`

---

### Change Detection

#### `AddressDataExtractor.hasLogradouroChanged()`

Checks if logradouro has changed. Returns true only once per change.

**Returns:** `boolean`

**Delegation:** `AddressCache.getInstance().hasLogradouroChanged()`

**Example:**
```javascript
if (AddressDataExtractor.hasLogradouroChanged()) {
  console.log('Street changed!');
}
```

#### `AddressDataExtractor.hasBairroChanged()`

Checks if bairro has changed. Returns true only once per change.

**Returns:** `boolean`

**Delegation:** `AddressCache.getInstance().hasBairroChanged()`

#### `AddressDataExtractor.hasMunicipioChanged()`

Checks if municipio has changed. Returns true only once per change.

**Returns:** `boolean`

**Delegation:** `AddressCache.getInstance().hasMunicipioChanged()`

---

### Change Details

#### `AddressDataExtractor.getLogradouroChangeDetails()`

Gets detailed information about logradouro change.

**Returns:** `Object` - Change details

**Delegation:** `AddressCache.getInstance().getLogradouroChangeDetails()`

**Return Structure:**
```javascript
{
  hasChanged: boolean,
  current: { logradouro: string | null },
  previous: { logradouro: string | null },
  timestamp: number
}
```

**Example:**
```javascript
const details = AddressDataExtractor.getLogradouroChangeDetails();
console.log(details);
// {
//   hasChanged: true,
//   current: { logradouro: "Avenida Boa Viagem" },
//   previous: { logradouro: "Rua do Sol" },
//   timestamp: 1640000000000
// }
```

#### `AddressDataExtractor.getBairroChangeDetails()`

Gets detailed information about bairro change.

**Returns:** `Object` - Change details

**Delegation:** `AddressCache.getInstance().getBairroChangeDetails()`

**Return Structure:**
```javascript
{
  hasChanged: boolean,
  current: { bairro: string | null, bairroCompleto: string | null },
  previous: { bairro: string | null, bairroCompleto: string | null },
  timestamp: number
}
```

#### `AddressDataExtractor.getMunicipioChangeDetails()`

Gets detailed information about municipio change.

**Returns:** `Object` - Change details

**Delegation:** `AddressCache.getInstance().getMunicipioChangeDetails()`

**Return Structure:**
```javascript
{
  hasChanged: boolean,
  current: { municipio: string | undefined, uf: string | undefined },
  previous: { municipio: string | undefined, uf: string | undefined },
  timestamp: number
}
```

---

### Primary Method

#### `AddressDataExtractor.getBrazilianStandardAddress(data)`

Main static method to get Brazilian standard address. Coordinates cache retrieval and extraction.

**Parameters:**
- `data` (`Object`) - Raw address data from geocoding API

**Returns:** `BrazilianStandardAddress` - Standardized address object

**Delegation:** `AddressCache.getInstance().getBrazilianStandardAddress(data)`

**Example:**
```javascript
const address = AddressDataExtractor.getBrazilianStandardAddress(geocodingData);
console.log(address.enderecoCompleto());
// "Avenida Paulista, 1578, Bela Vista, São Paulo, SP, 01310-100"
```

---

## Static Properties (Delegated to AddressCache)

All static properties are implemented using property descriptors that create **live references** to the `AddressCache` singleton. Changes to these properties affect the singleton instance.

### Configuration Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `cache` | `LRUCache` | The LRU cache instance | 50 entries, 5 min expiration |
| `maxCacheSize` | `number` | Maximum cache entries | 50 |
| `cacheExpirationMs` | `number` | Cache expiration time (ms) | 300000 (5 min) |

### Change Tracking Properties

| Property | Type | Description |
|----------|------|-------------|
| `lastNotifiedChangeSignature` | `string \| null` | Last logradouro change signature |
| `lastNotifiedBairroChangeSignature` | `string \| null` | Last bairro change signature |
| `lastNotifiedMunicipioChangeSignature` | `string \| null` | Last municipio change signature |

### Callback Properties

| Property | Type | Description |
|----------|------|-------------|
| `logradouroChangeCallback` | `Function \| null` | Logradouro change callback |
| `bairroChangeCallback` | `Function \| null` | Bairro change callback |
| `municipioChangeCallback` | `Function \| null` | Municipio change callback |

### Address State Properties

| Property | Type | Description |
|----------|------|-------------|
| `currentAddress` | `BrazilianStandardAddress \| null` | Current cached address |
| `previousAddress` | `BrazilianStandardAddress \| null` | Previous cached address |
| `currentRawData` | `Object \| null` | Current raw geocoding data |
| `previousRawData` | `Object \| null` | Previous raw geocoding data |

**Property Descriptor Example:**
```javascript
Object.defineProperties(AddressDataExtractor, {
  cache: {
    get: () => AddressCache.getInstance().cache,
    set: (value) => { AddressCache.getInstance().cache = value; }
  },
  // ... other properties
});
```

---

## Instance Methods

### `toString()`

Returns a string representation of the extractor.

**Returns:** `string`

**Example:**
```javascript
const extractor = new AddressDataExtractor(geocodingData);
console.log(extractor.toString());
// "AddressDataExtractor: Avenida Paulista, 1578, Bela Vista, São Paulo, SP"
```

---

## Integration Examples

### Legacy Code Pattern (Still Supported)

```javascript
import AddressDataExtractor from './data/AddressDataExtractor.js';

// Instance usage
const extractor = new AddressDataExtractor(geocodingData);
const address = extractor.enderecoPadronizado;
console.log(address.municipioCompleto());

// Static usage with callbacks
AddressDataExtractor.setLogradouroChangeCallback((details) => {
  console.log('Street changed!');
  console.log('From:', details.previous.logradouro);
  console.log('To:', details.current.logradouro);
});

// Get address (triggers cache and callbacks)
const address2 = AddressDataExtractor.getBrazilianStandardAddress(geocodingData);
```

### Modern Code Pattern (Recommended)

```javascript
import AddressCache from './data/AddressCache.js';
import AddressExtractor from './data/AddressExtractor.js';

// Use AddressCache singleton
const cache = AddressCache.getInstance();

// Set callbacks
cache.setLogradouroChangeCallback((details) => {
  console.log('Street changed!');
  console.log('From:', details.previous.logradouro);
  console.log('To:', details.current.logradouro);
});

// Get cached address
const address = cache.getBrazilianStandardAddress(geocodingData);

// Direct extraction (no caching)
const extractor = new AddressExtractor(geocodingData);
const address2 = extractor.enderecoPadronizado;
```

### Mixed Usage (Transition Period)

```javascript
import AddressDataExtractor from './data/AddressDataExtractor.js';
import AddressCache from './data/AddressCache.js';

// Legacy code still using AddressDataExtractor
const address1 = AddressDataExtractor.getBrazilianStandardAddress(data1);

// New code using AddressCache
const cache = AddressCache.getInstance();
const address2 = cache.getBrazilianStandardAddress(data2);

// Both access the same singleton cache!
console.log(cache.getCacheSize());  // Includes both address1 and address2
```

---

## Deprecation Notice

**⚠️ This class is deprecated and exists only for backward compatibility.**

### Why Deprecated?

1. **Violation of Single Responsibility Principle**: Original class mixed extraction, caching, and change detection
2. **Difficult to Test**: Monolithic design made unit testing complex
3. **Poor Reusability**: Components couldn't be used independently
4. **Maintenance Burden**: Changes affected multiple unrelated features

### Migration Timeline

- **v0.8.3-alpha**: Refactored into `AddressExtractor` and `AddressCache`
- **v0.8.4-alpha**: AddressDataExtractor marked as deprecated facade
- **v0.9.0** (Future): AddressDataExtractor may be removed

### How to Migrate

**Step 1:** Identify usage patterns
```bash
# Find all AddressDataExtractor imports
grep -r "AddressDataExtractor" src/
```

**Step 2:** Replace instance usage
```javascript
// Old
const extractor = new AddressDataExtractor(data);

// New
const extractor = new AddressExtractor(data);
```

**Step 3:** Replace static usage
```javascript
// Old
AddressDataExtractor.getBrazilianStandardAddress(data);

// New
AddressCache.getInstance().getBrazilianStandardAddress(data);
```

**Step 4:** Update imports
```javascript
// Old
import AddressDataExtractor from './data/AddressDataExtractor.js';

// New
import AddressExtractor from './data/AddressExtractor.js';
import AddressCache from './data/AddressCache.js';
```

---

## Testing

Legacy tests still pass due to facade pattern:
- `__tests__/unit/data/AddressDataExtractor.test.js` - Legacy tests (still passing)
- `__tests__/unit/data/AddressExtractor.test.js` - New extraction tests
- `__tests__/unit/data/AddressCache.test.js` - New caching tests

**Example Legacy Test (Still Works):**
```javascript
describe('AddressDataExtractor (Legacy)', () => {
  test('extracts address correctly', () => {
    const data = {
      address: {
        road: "Avenida Paulista",
        city: "São Paulo",
        state_code: "SP"
      }
    };
    
    const extractor = new AddressDataExtractor(data);
    expect(extractor.enderecoPadronizado.logradouro).toBe("Avenida Paulista");
  });
  
  test('static methods work', () => {
    const address = AddressDataExtractor.getBrazilianStandardAddress(data);
    expect(address).toBeInstanceOf(BrazilianStandardAddress);
  });
});
```

---

## Related Classes

- **`AddressExtractor`** - Actual extraction implementation
- **`AddressCache`** - Actual caching implementation
- **`BrazilianStandardAddress`** - Target data structure
- **`ReferencePlace`** - Reference place information

---

## See Also

- [ADDRESS_EXTRACTOR.md](./ADDRESS_EXTRACTOR.md) - Modern extraction API
- [ADDRESS_CACHE.md](./ADDRESS_CACHE.md) - Modern caching API
- [BRAZILIAN_STANDARD_ADDRESS.md](./BRAZILIAN_STANDARD_ADDRESS.md) - Address data structure
- [REFERENCE_PLACE.md](./REFERENCE_PLACE.md) - Reference place details
