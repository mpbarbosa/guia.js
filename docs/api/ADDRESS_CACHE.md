# AddressCache API Documentation

**Version:** 0.8.7-alpha  
**File:** `src/data/AddressCache.js` (1,165 lines)  
**Author:** Marcelo Pereira Barbosa  
**Since:** 0.8.4-alpha

## Overview

The `AddressCache` class manages caching of standardized addresses with sophisticated strategies including LRU (Least Recently Used) eviction, time-based expiration, change detection for address components, and callback-based notifications. It implements the **Singleton pattern** ensuring only one cache instance exists throughout the application.

## Purpose

- Cache `BrazilianStandardAddress` instances with LRU eviction
- Detect changes in address components (logradouro, bairro, municipio)
- Notify registered callbacks when address changes occur
- Prevent redundant address extraction and API calls
- Provide observer pattern integration for reactive components
- Manage memory with automatic cache cleanup

## Data Flow

```
Geocoding API Response → AddressCache.getBrazilianStandardAddress()
                              ↓
                         Check Cache
                         ↙         ↘
                    Cache Hit    Cache Miss
                        ↓            ↓
                   Return Cached   AddressExtractor
                                      ↓
                                  Cache Result
                                      ↓
                               Detect Changes
                                      ↓
                              Trigger Callbacks
                                      ↓
                             Notify Observers
                                      ↓
                        Return BrazilianStandardAddress
```

---

## Singleton Pattern

### `AddressCache.getInstance()`

Gets or creates the singleton AddressCache instance.

**Returns:** `AddressCache` - The singleton instance

**Example:**
```javascript
import AddressCache from './data/AddressCache.js';

const cache = AddressCache.getInstance();
const cache2 = AddressCache.getInstance();

console.log(cache === cache2);  // true (same instance)
```

**Implementation:**
```javascript
static getInstance() {
    if (!AddressCache.instance) {
        AddressCache.instance = new AddressCache();
    }
    return AddressCache.instance;
}
```

---

## Constructor (Private)

### `new AddressCache()`

Creates a new AddressCache instance. **This is called internally by `getInstance()`** to maintain the singleton pattern.

**Initialization:**
- Creates `LRUCache` instance (50 entries, 5-minute expiration)
- Initializes change detection tracking
- Sets up observer subject for reactive components
- Starts automatic cleanup timer (60-second interval)

**Example:**
```javascript
// DO NOT call constructor directly
// const cache = new AddressCache();  // ❌ Use getInstance() instead

// Correct usage
const cache = AddressCache.getInstance();  // ✅
```

**Internal Setup:**
```javascript
constructor() {
    this.observerSubject = new ObserverSubject();
    this.cache = new LRUCache(50, 300000); // 50 entries, 5 minutes
    
    this.lastNotifiedChangeSignature = null;
    this.lastNotifiedBairroChangeSignature = null;
    this.lastNotifiedMunicipioChangeSignature = null;
    this.logradouroChangeCallback = null;
    this.bairroChangeCallback = null;
    this.municipioChangeCallback = null;
    this.currentAddress = null;
    this.previousAddress = null;
    this.currentRawData = null;
    this.previousRawData = null;
    
    // Cleanup timer using TimerManager (prevents memory leaks)
    timerManager.setInterval(() => {
        this.cleanExpiredEntries();
    }, 60000, 'address-cache-cleanup');
}
```

---

## Instance Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `cache` | `LRUCache` | LRU cache instance | 50 entries, 5 min |
| `observerSubject` | `ObserverSubject` | Observer pattern subject | new instance |
| `logradouroChangeCallback` | `Function \| null` | Street change callback | `null` |
| `bairroChangeCallback` | `Function \| null` | Neighborhood change callback | `null` |
| `municipioChangeCallback` | `Function \| null` | Municipality change callback | `null` |
| `currentAddress` | `BrazilianStandardAddress \| null` | Current address | `null` |
| `previousAddress` | `BrazilianStandardAddress \| null` | Previous address | `null` |
| `currentRawData` | `Object \| null` | Current raw data | `null` |
| `previousRawData` | `Object \| null` | Previous raw data | `null` |
| `lastNotifiedChangeSignature` | `string \| null` | Last logradouro change | `null` |
| `lastNotifiedBairroChangeSignature` | `string \| null` | Last bairro change | `null` |
| `lastNotifiedMunicipioChangeSignature` | `string \| null` | Last municipio change | `null` |

---

## Primary Method

### `getBrazilianStandardAddress(data)`

**Main entry point** for retrieving standardized addresses. Coordinates cache retrieval, address extraction, and change detection.

**Parameters:**
- `data` (`Object`) - Raw address data from geocoding API

**Returns:** `BrazilianStandardAddress` - Standardized address object

**Workflow:**
1. Generate cache key from data
2. Check cache for existing entry
3. If cache hit: return cached address
4. If cache miss:
   - Create new address with `AddressExtractor`
   - Store in cache (with automatic LRU eviction)
   - Update current/previous address tracking
   - Detect changes (logradouro, bairro, municipio)
   - Trigger registered callbacks
   - Notify observers
5. Return standardized address

**Example:**
```javascript
const cache = AddressCache.getInstance();

const geocodingData = {
  address: {
    road: "Avenida Paulista",
    house_number: "1578",
    city: "São Paulo",
    state_code: "SP"
  }
};

const address = cache.getBrazilianStandardAddress(geocodingData);
console.log(address.enderecoCompleto());
// "Avenida Paulista, 1578, São Paulo, SP"

// Second call returns cached result (no extraction)
const address2 = cache.getBrazilianStandardAddress(geocodingData);
console.log(address === address2);  // false (different instances from cache structure)
```

**Static Wrapper:**
```javascript
// Static method for backward compatibility
const address = AddressCache.getBrazilianStandardAddress(geocodingData);
```

---

## Cache Management

### `generateCacheKey(data)`

Generates a unique cache key for address data to enable efficient caching and retrieval.

**Parameters:**
- `data` (`Object`) - Address data from geocoding API

**Returns:** `string | null` - Cache key or null if data is invalid

**Key Components:**
- Street name (`road`, `street`)
- House number
- Neighborhood (`neighbourhood`, `suburb`)
- City (`city`, `town`, `municipality`)
- Postal code
- Country code

**Format:** Components joined with `|` separator

**Example:**
```javascript
const cache = AddressCache.getInstance();

const data = {
  address: {
    road: "Avenida Paulista",
    house_number: "1578",
    neighbourhood: "Bela Vista",
    city: "São Paulo",
    postcode: "01310-100",
    country_code: "BR"
  }
};

const key = cache.generateCacheKey(data);
console.log(key);
// "Avenida Paulista|1578|Bela Vista|São Paulo|01310-100|BR"
```

**Static Wrapper:**
```javascript
const key = AddressCache.generateCacheKey(data);
```

---

### `clearCache()`

Clears all cache entries and resets change tracking. Primarily used for testing.

**Returns:** `void`

**Example:**
```javascript
const cache = AddressCache.getInstance();
cache.clearCache();

console.log(cache.getCacheSize());  // 0
console.log(cache.currentAddress);  // null
console.log(cache.previousAddress); // null
```

**Static Wrapper:**
```javascript
AddressCache.clearCache();
```

---

### `cleanExpiredEntries()`

Removes all expired entries from the cache based on timestamp. Called automatically every 60 seconds by the cleanup timer.

**Returns:** `void` (logs count of removed entries)

**Example:**
```javascript
const cache = AddressCache.getInstance();

// Manual cleanup
cache.cleanExpiredEntries();
// Console: "(AddressCache) Cleaned 3 expired cache entries"

// Automatic cleanup runs every 60 seconds via TimerManager
```

**Static Wrapper:**
```javascript
AddressCache.cleanExpiredEntries();
```

---

### `getCacheSize()`

Gets the current number of entries in the cache.

**Returns:** `number` - Number of cached entries

**Example:**
```javascript
const cache = AddressCache.getInstance();
console.log(cache.getCacheSize());  // e.g., 15
```

**Static Wrapper:**
```javascript
const size = AddressCache.getCacheSize();
```

---

## Callback Management

### `setLogradouroChangeCallback(callback)`

Sets the callback function to be called when logradouro (street) changes are detected.

**Parameters:**
- `callback` (`Function | null`) - Function to call on logradouro changes, or null to remove callback

**Callback Parameters:**
- `changeDetails` (`Object`) - Details about the logradouro change

**Returns:** `void`

**Example:**
```javascript
const cache = AddressCache.getInstance();

cache.setLogradouroChangeCallback((changeDetails) => {
  console.log('Street changed!');
  console.log('From:', changeDetails.previous.logradouro);
  console.log('To:', changeDetails.current.logradouro);
  console.log('Timestamp:', changeDetails.timestamp);
});

// Remove callback
cache.setLogradouroChangeCallback(null);
```

**Static Wrapper:**
```javascript
AddressCache.setLogradouroChangeCallback((details) => {
  console.log('Street changed:', details);
});
```

---

### `setBairroChangeCallback(callback)`

Sets the callback function to be called when bairro (neighborhood) changes are detected.

**Parameters:**
- `callback` (`Function | null`) - Function to call on bairro changes

**Callback Parameters:**
- `changeDetails` (`Object`) - Details about the bairro change (includes `bairroCompleto`)

**Returns:** `void`

**Example:**
```javascript
const cache = AddressCache.getInstance();

cache.setBairroChangeCallback((changeDetails) => {
  console.log('Neighborhood changed!');
  console.log('From:', changeDetails.previous.bairro);
  console.log('To:', changeDetails.current.bairro);
  console.log('Complete:', changeDetails.current.bairroCompleto);
});
```

**Static Wrapper:**
```javascript
AddressCache.setBairroChangeCallback((details) => {
  console.log('Neighborhood changed:', details);
});
```

---

### `setMunicipioChangeCallback(callback)`

Sets the callback function to be called when municipio (municipality) changes are detected.

**Parameters:**
- `callback` (`Function | null`) - Function to call on municipio changes

**Callback Parameters:**
- `changeDetails` (`Object`) - Details about the municipio change (includes state)

**Returns:** `void`

**Example:**
```javascript
const cache = AddressCache.getInstance();

cache.setMunicipioChangeCallback((changeDetails) => {
  console.log('City changed!');
  console.log('From:', changeDetails.previous.municipio);
  console.log('To:', changeDetails.current.municipio);
  console.log('State:', changeDetails.current.uf);
});
```

**Static Wrapper:**
```javascript
AddressCache.setMunicipioChangeCallback((details) => {
  console.log('City changed:', details);
});
```

---

### Callback Getters

#### `getLogradouroChangeCallback()`

Gets the currently registered logradouro change callback.

**Returns:** `Function | null`

#### `getBairroChangeCallback()`

Gets the currently registered bairro change callback.

**Returns:** `Function | null`

#### `getMunicipioChangeCallback()`

Gets the currently registered municipio change callback.

**Returns:** `Function | null`

**Example:**
```javascript
const cache = AddressCache.getInstance();
const callback = cache.getLogradouroChangeCallback();

if (callback) {
  console.log('Logradouro callback is registered');
}
```

---

## Change Detection

### `hasLogradouroChanged()`

Checks if logradouro has changed compared to previous address. **Returns true only once per change** to prevent notification loops.

**Returns:** `boolean` - True if logradouro has changed and not yet notified

**Change Signature:** Uses `"previousValue=>currentValue"` format to track notifications

**Example:**
```javascript
const cache = AddressCache.getInstance();

if (cache.hasLogradouroChanged()) {
  console.log('Street changed!');
  // Returns true only once for this change
}

if (cache.hasLogradouroChanged()) {
  // Returns false - already notified about this change
}
```

**Static Wrapper:**
```javascript
if (AddressCache.hasLogradouroChanged()) {
  console.log('Street changed!');
}
```

---

### `hasBairroChanged()`

Checks if bairro has changed compared to previous address. Returns true only once per change.

**Returns:** `boolean`

**Example:**
```javascript
const cache = AddressCache.getInstance();

if (cache.hasBairroChanged()) {
  console.log('Neighborhood changed!');
}
```

**Static Wrapper:**
```javascript
if (AddressCache.hasBairroChanged()) {
  console.log('Neighborhood changed!');
}
```

---

### `hasMunicipioChanged()`

Checks if municipio has changed compared to previous address. Returns true only once per change.

**Returns:** `boolean`

**Example:**
```javascript
const cache = AddressCache.getInstance();

if (cache.hasMunicipioChanged()) {
  console.log('City changed!');
}
```

**Static Wrapper:**
```javascript
if (AddressCache.hasMunicipioChanged()) {
  console.log('City changed!');
}
```

---

## Change Details

### `getLogradouroChangeDetails()`

Gets detailed information about logradouro change.

**Returns:** `Object` - Change details

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
const cache = AddressCache.getInstance();
const details = cache.getLogradouroChangeDetails();

console.log(details);
// {
//   hasChanged: true,
//   current: { logradouro: "Avenida Boa Viagem" },
//   previous: { logradouro: "Rua do Sol" },
//   timestamp: 1640000000000
// }
```

**Static Wrapper:**
```javascript
const details = AddressCache.getLogradouroChangeDetails();
```

---

### `getBairroChangeDetails()`

Gets detailed information about bairro change including complete neighborhood string.

**Returns:** `Object` - Change details

**Return Structure:**
```javascript
{
  hasChanged: boolean,
  current: { 
    bairro: string | null, 
    bairroCompleto: string | null 
  },
  previous: { 
    bairro: string | null, 
    bairroCompleto: string | null 
  },
  timestamp: number
}
```

**Example:**
```javascript
const cache = AddressCache.getInstance();
const details = cache.getBairroChangeDetails();

console.log(details);
// {
//   hasChanged: true,
//   current: { 
//     bairro: "Boa Viagem", 
//     bairroCompleto: "Boa Viagem, Pina" 
//   },
//   previous: { 
//     bairro: "Centro", 
//     bairroCompleto: "Centro" 
//   },
//   timestamp: 1640000000000
// }
```

**Static Wrapper:**
```javascript
const details = AddressCache.getBairroChangeDetails();
```

---

### `getMunicipioChangeDetails()`

Gets detailed information about municipio change including state information.

**Returns:** `Object` - Change details

**Return Structure:**
```javascript
{
  hasChanged: boolean,
  current: { 
    municipio: string | undefined, 
    uf: string | undefined 
  },
  previous: { 
    municipio: string | undefined, 
    uf: string | undefined 
  },
  timestamp: number
}
```

**Example:**
```javascript
const cache = AddressCache.getInstance();
const details = cache.getMunicipioChangeDetails();

console.log(details);
// {
//   hasChanged: true,
//   current: { municipio: "Recife", uf: "Pernambuco" },
//   previous: { municipio: "Olinda", uf: "Pernambuco" },
//   timestamp: 1640000000000
// }
```

**Static Wrapper:**
```javascript
const details = AddressCache.getMunicipioChangeDetails();
```

---

## Observer Pattern

### `subscribe(observer)`

Subscribes an observer object to cache events.

**Parameters:**
- `observer` (`Object`) - Observer with `update(event)` method

**Returns:** `void`

**Example:**
```javascript
const cache = AddressCache.getInstance();

const myObserver = {
  update(event) {
    if (event.type === 'addressUpdated') {
      console.log('Address updated!');
      console.log('Cache size:', event.cacheSize);
      console.log('Address:', event.address.enderecoCompleto());
    }
  }
};

cache.subscribe(myObserver);
```

**Static Wrapper:**
```javascript
AddressCache.subscribe(myObserver);
```

---

### `unsubscribe(observer)`

Unsubscribes an observer object from cache events.

**Parameters:**
- `observer` (`Object`) - Observer to remove

**Returns:** `void`

**Example:**
```javascript
const cache = AddressCache.getInstance();
cache.unsubscribe(myObserver);
```

**Static Wrapper:**
```javascript
AddressCache.unsubscribe(myObserver);
```

---

### `subscribeFunction(fn)`

Subscribes a function to cache events.

**Parameters:**
- `fn` (`Function`) - Function to call on events

**Returns:** `void`

**Example:**
```javascript
const cache = AddressCache.getInstance();

cache.subscribeFunction((event) => {
  console.log('Event:', event.type);
  console.log('Address:', event.address);
  console.log('Cache size:', event.cacheSize);
});
```

**Static Wrapper:**
```javascript
AddressCache.subscribeFunction((event) => {
  console.log('Event received:', event);
});
```

---

### `unsubscribeFunction(fn)`

Unsubscribes a function from cache events.

**Parameters:**
- `fn` (`Function`) - Function to remove

**Returns:** `void`

---

## Resource Management

### `destroy()`

Destroys the cache and cleans up all resources. **Critical for preventing timer leaks** especially in test environments.

**Operations:**
1. Stops cleanup timer using `TimerManager`
2. Clears all cached data
3. Releases all references (observers, callbacks, addresses)

**Returns:** `void`

**Example:**
```javascript
const cache = AddressCache.getInstance();

// Use cache...

// Clean up when done
cache.destroy();
```

**Use in Tests:**
```javascript
afterEach(() => {
  const cache = AddressCache.getInstance();
  cache.destroy();
});
```

**Static Wrapper:**
```javascript
AddressCache.destroy();
```

---

## Caching Strategy

### LRU (Least Recently Used) Eviction

The cache uses `LRUCache` internally with the following strategy:

**Configuration:**
- **Max Size:** 50 entries
- **Expiration:** 300,000 ms (5 minutes)
- **Cleanup Interval:** 60 seconds (automatic)

**Eviction Policy:**
1. When cache reaches max size (50 entries)
2. Evict the **least recently accessed** entry
3. Most recently used entries are kept

**Expiration Policy:**
1. Each entry has a timestamp
2. Entries older than 5 minutes are expired
3. Expired entries are removed on access or during periodic cleanup
4. Cleanup runs automatically every 60 seconds

**Example:**
```javascript
const cache = AddressCache.getInstance();

// Cache fills up
for (let i = 0; i < 51; i++) {
  cache.getBrazilianStandardAddress(generateData(i));
}

// Cache size stays at 50 (oldest entry evicted)
console.log(cache.getCacheSize());  // 50

// Wait 6 minutes, then access cache
setTimeout(() => {
  cache.cleanExpiredEntries();
  console.log(cache.getCacheSize());  // 0 (all expired)
}, 360000);
```

### Cache Key Generation

Cache keys are generated from essential address components:

**Components Used:**
1. Street name
2. House number
3. Neighborhood
4. City
5. Postal code
6. Country code

**Algorithm:**
```javascript
const keyComponents = [
  address.road || address.street || '',
  address.house_number || '',
  address.neighbourhood || address.suburb || '',
  address.city || address.town || address.municipality || '',
  address.postcode || '',
  address.country_code || ''
];

const cacheKey = keyComponents
  .filter(component => component.trim() !== '')
  .join('|');
```

**Example Keys:**
- `"Avenida Paulista|1578|Bela Vista|São Paulo|01310-100|BR"`
- `"Rua Oscar Freire|379|Jardins|São Paulo|01426-001|BR"`
- `"Avenida Boa Viagem|5000|Boa Viagem|Recife|51021-000|BR"`

---

## Integration Examples

### Basic Caching

```javascript
import AddressCache from './data/AddressCache.js';

const cache = AddressCache.getInstance();

const data1 = {
  address: {
    road: "Avenida Paulista",
    house_number: "1578",
    city: "São Paulo",
    state_code: "SP"
  }
};

// First call: extracts and caches
const address1 = cache.getBrazilianStandardAddress(data1);
console.log('Cache size:', cache.getCacheSize());  // 1

// Second call with same data: returns from cache (no extraction)
const address2 = cache.getBrazilianStandardAddress(data1);
console.log('Cache size:', cache.getCacheSize());  // Still 1
```

### Change Detection and Callbacks

```javascript
import AddressCache from './data/AddressCache.js';

const cache = AddressCache.getInstance();

// Register callbacks
cache.setLogradouroChangeCallback((details) => {
  console.log(`Street changed from ${details.previous.logradouro} to ${details.current.logradouro}`);
});

cache.setBairroChangeCallback((details) => {
  console.log(`Neighborhood changed from ${details.previous.bairro} to ${details.current.bairro}`);
});

cache.setMunicipioChangeCallback((details) => {
  console.log(`City changed from ${details.previous.municipio} to ${details.current.municipio}`);
});

// First address
const data1 = {
  address: {
    road: "Rua Augusta",
    city: "São Paulo",
    neighbourhood: "Consolação"
  }
};
cache.getBrazilianStandardAddress(data1);

// Second address (different street)
const data2 = {
  address: {
    road: "Avenida Paulista",  // Changed
    city: "São Paulo",
    neighbourhood: "Consolação"
  }
};
cache.getBrazilianStandardAddress(data2);
// Console: "Street changed from Rua Augusta to Avenida Paulista"

// Third address (different neighborhood)
const data3 = {
  address: {
    road: "Avenida Paulista",
    city: "São Paulo",
    neighbourhood: "Bela Vista"  // Changed
  }
};
cache.getBrazilianStandardAddress(data3);
// Console: "Neighborhood changed from Consolação to Bela Vista"
```

### Observer Pattern Integration

```javascript
import AddressCache from './data/AddressCache.js';

const cache = AddressCache.getInstance();

// Object observer
const addressObserver = {
  update(event) {
    if (event.type === 'addressUpdated') {
      console.log('Address updated event received');
      console.log('Cache now has', event.cacheSize, 'entries');
      displayAddress(event.address);
    }
  }
};

cache.subscribe(addressObserver);

// Function observer
cache.subscribeFunction((event) => {
  if (event.type === 'addressUpdated') {
    logToAnalytics('address-updated', {
      cacheSize: event.cacheSize,
      timestamp: Date.now()
    });
  }
});

// Trigger event
cache.getBrazilianStandardAddress(geocodingData);
// Both observers notified
```

### Integration with UI Components

```javascript
import AddressCache from './data/AddressCache.js';
import HTMLAddressDisplayer from './html/HTMLAddressDisplayer.js';

const cache = AddressCache.getInstance();

// Set up change callbacks for UI updates
cache.setLogradouroChangeCallback((details) => {
  updateStreetDisplay(details.current.logradouro);
  notifyUser(`You entered ${details.current.logradouro}`);
});

cache.setBairroChangeCallback((details) => {
  updateNeighborhoodCard(details.current.bairro);
});

cache.setMunicipioChangeCallback((details) => {
  updateCityCard(details.current.municipio, details.current.uf);
});

// Get address and display
function updateLocation(geocodingData) {
  const address = cache.getBrazilianStandardAddress(geocodingData);
  
  const displayer = new HTMLAddressDisplayer(address, document);
  displayer.display();
}
```

### Memory Leak Prevention

```javascript
import AddressCache from './data/AddressCache.js';

// In a long-running application
const cache = AddressCache.getInstance();

// Use cache throughout app lifecycle...

// Clean up before shutdown
window.addEventListener('beforeunload', () => {
  cache.destroy();  // Stop timers, clear references
});

// In tests
afterEach(() => {
  const cache = AddressCache.getInstance();
  cache.destroy();
  AddressCache.instance = null;  // Reset singleton for next test
});
```

---

## Static Property Access

All instance properties are accessible via static getters/setters for backward compatibility:

```javascript
// Access cache directly
const cacheInstance = AddressCache.cache;

// Access configuration
console.log(AddressCache.maxCacheSize);      // 50
console.log(AddressCache.cacheExpirationMs); // 300000

// Access current state
console.log(AddressCache.currentAddress);
console.log(AddressCache.previousAddress);

// Access callbacks
console.log(AddressCache.logradouroChangeCallback);
```

**Note:** These are live references to the singleton instance. Changes affect the singleton.

---

## Testing

Comprehensive test coverage in:
- `__tests__/unit/data/AddressCache.test.js`
- `__tests__/integration/address-caching.test.js`

**Example Test:**
```javascript
describe('AddressCache', () => {
  let cache;
  
  beforeEach(() => {
    cache = AddressCache.getInstance();
    cache.clearCache();
  });
  
  afterEach(() => {
    cache.destroy();
    AddressCache.instance = null;
  });
  
  test('caches addresses correctly', () => {
    const data = {
      address: {
        road: "Avenida Paulista",
        city: "São Paulo"
      }
    };
    
    const address1 = cache.getBrazilianStandardAddress(data);
    expect(cache.getCacheSize()).toBe(1);
    
    const address2 = cache.getBrazilianStandardAddress(data);
    expect(cache.getCacheSize()).toBe(1);  // Still 1 (cached)
  });
  
  test('detects logradouro changes', () => {
    const callback = jest.fn();
    cache.setLogradouroChangeCallback(callback);
    
    cache.getBrazilianStandardAddress({
      address: { road: "Rua A", city: "São Paulo" }
    });
    
    cache.getBrazilianStandardAddress({
      address: { road: "Rua B", city: "São Paulo" }
    });
    
    expect(callback).toHaveBeenCalled();
  });
});
```

---

## Related Classes

- **`LRUCache`** - Underlying LRU cache implementation
- **`AddressExtractor`** - Extracts addresses from API data
- **`BrazilianStandardAddress`** - Cached address data structure
- **`ObserverSubject`** - Observer pattern implementation
- **`TimerManager`** - Manages cleanup timer

---

## See Also

- [LRU_CACHE.md](./LRU_CACHE.md) - LRU cache implementation details
- [ADDRESS_EXTRACTOR.md](./ADDRESS_EXTRACTOR.md) - Address extraction
- [BRAZILIAN_STANDARD_ADDRESS.md](./BRAZILIAN_STANDARD_ADDRESS.md) - Address data structure
- [ADDRESS_DATA_EXTRACTOR.md](./ADDRESS_DATA_EXTRACTOR.md) - Legacy facade
