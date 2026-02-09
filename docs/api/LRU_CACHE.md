# LRUCache API Documentation

**Version:** 0.8.7-alpha  
**File:** `src/data/LRUCache.js` (243 lines)  
**Author:** Marcelo Pereira Barbosa (extracted from AddressCache)  
**Since:** 0.8.7-alpha

## Overview

The `LRUCache` class is a generic, reusable **Least Recently Used (LRU)** cache implementation with time-based expiration. It provides O(1) get/set operations using JavaScript's `Map` data structure and automatically evicts the least recently accessed entries when the cache reaches maximum capacity.

## Purpose

- Store key-value pairs with automatic LRU eviction
- Expire entries after a configurable time period
- Track access times for proper LRU ordering
- Provide O(1) performance for get/set operations
- Support any data type for keys and values
- Reusable across application for any caching needs

## Design Characteristics

- **Pure Data Structure**: No business logic dependencies
- **Generic**: Works with any data types
- **Efficient**: O(1) get/set operations
- **Automatic**: Eviction and expiration handled internally
- **Configurable**: Max size and expiration time customizable

---

## Class Definition

```javascript
import LRUCache from './data/LRUCache.js';

const cache = new LRUCache(maxSize, expirationMs);
```

---

## Constructor

### `new LRUCache(maxSize, expirationMs)`

Creates a new LRU cache instance.

**Parameters:**
- `maxSize` (`number`, optional) - Maximum number of entries before eviction. Default: `50`
- `expirationMs` (`number`, optional) - Time in milliseconds before entries expire. Default: `300000` (5 minutes)

**Returns:** `LRUCache` instance

**Example:**
```javascript
// Default configuration (50 entries, 5 minutes)
const cache1 = new LRUCache();

// Custom configuration (100 entries, 10 minutes)
const cache2 = new LRUCache(100, 600000);

// Small cache (10 entries, 1 minute)
const cache3 = new LRUCache(10, 60000);
```

---

## Properties

### `cache`

**Type:** `Map<string, Object>`  
**Access:** Private (accessed internally)

Internal JavaScript `Map` storing cache entries. Each entry contains:
```javascript
{
  value: any,           // The cached value
  timestamp: number,    // Creation time (for expiration)
  lastAccessed: number  // Last access time (for LRU)
}
```

### `maxSize`

**Type:** `number`  
**Access:** Public

Maximum number of entries allowed in cache before LRU eviction occurs.

**Example:**
```javascript
const cache = new LRUCache(50);
console.log(cache.maxSize);  // 50

cache.maxSize = 100;  // Increase capacity
```

### `expirationMs`

**Type:** `number`  
**Access:** Public

Time in milliseconds before cache entries expire.

**Example:**
```javascript
const cache = new LRUCache(50, 300000);
console.log(cache.expirationMs);  // 300000 (5 minutes)

cache.expirationMs = 600000;  // Change to 10 minutes
```

---

## Public Methods

### `get(key)`

Retrieves a value from the cache by key. Updates access time for LRU tracking if entry is valid.

**Parameters:**
- `key` (`string`) - Cache key to retrieve

**Returns:** `any | null` - The cached value, or `null` if not found or expired

**Complexity:** O(1) for retrieval, O(1) for LRU update

**Behavior:**
1. Look up key in cache
2. If not found, return `null`
3. Check if entry has expired
4. If expired, delete entry and return `null`
5. If valid, update `lastAccessed` timestamp
6. Move entry to end of Map (most recent)
7. Return cached value

**Example:**
```javascript
const cache = new LRUCache();

cache.set('user:123', { name: 'Alice', age: 30 });
const user = cache.get('user:123');
console.log(user);  // { name: 'Alice', age: 30 }

// Non-existent key
const missing = cache.get('user:999');
console.log(missing);  // null

// After expiration period (5 minutes)
setTimeout(() => {
  const expired = cache.get('user:123');
  console.log(expired);  // null (entry expired and removed)
}, 300001);
```

**LRU Tracking:**
```javascript
const cache = new LRUCache(3);  // Max 3 entries

cache.set('a', 1);
cache.set('b', 2);
cache.set('c', 3);

// Access 'a' (moves to end)
cache.get('a');

// Now order is: b, c, a (a is most recent)

cache.set('d', 4);  // Evicts 'b' (least recent)

console.log(cache.get('b'));  // null (evicted)
console.log(cache.get('a'));  // 1 (still present)
```

---

### `set(key, value)`

Stores a value in the cache. Automatically evicts LRU entry if cache is at maximum capacity.

**Parameters:**
- `key` (`string`) - Cache key
- `value` (`any`) - Value to store

**Returns:** `void`

**Complexity:** O(1) average case, O(n) worst case when eviction needed

**Behavior:**
1. Check if cache is at max capacity
2. If at capacity, evict least recently used entry
3. Store new entry with current timestamp
4. Set both `timestamp` (creation) and `lastAccessed` (for LRU)

**Example:**
```javascript
const cache = new LRUCache();

// Store various data types
cache.set('user:123', { name: 'Alice', role: 'admin' });
cache.set('count:total', 42);
cache.set('config:theme', 'dark');
cache.set('list:items', ['a', 'b', 'c']);

// Retrieve values
console.log(cache.get('user:123'));  // { name: 'Alice', role: 'admin' }
console.log(cache.get('count:total'));  // 42
```

**LRU Eviction Example:**
```javascript
const cache = new LRUCache(3);  // Max 3 entries

cache.set('a', 1);
cache.set('b', 2);
cache.set('c', 3);
console.log(cache.size);  // 3

// Cache is full, adding 'd' will evict 'a' (least recent)
cache.set('d', 4);
console.log(cache.size);  // 3 (still at max)

console.log(cache.get('a'));  // null (evicted)
console.log(cache.get('d'));  // 4 (newly added)
```

---

### `cleanExpired()`

Removes all expired entries from the cache based on expiration time.

**Parameters:** None

**Returns:** `number` - Number of entries removed

**Complexity:** O(n) where n is the number of cache entries

**Behavior:**
1. Iterate through all cache entries
2. Check if entry timestamp exceeds expiration time
3. Delete expired entries
4. Count and return number of removed entries

**Example:**
```javascript
const cache = new LRUCache(50, 5000);  // 5 second expiration

cache.set('key1', 'value1');
cache.set('key2', 'value2');
cache.set('key3', 'value3');

// Wait 6 seconds
setTimeout(() => {
  const removed = cache.cleanExpired();
  console.log(`Cleaned up ${removed} expired entries`);
  // Output: "Cleaned up 3 expired entries"
  
  console.log(cache.size);  // 0 (all expired)
}, 6000);
```

**Periodic Cleanup Pattern:**
```javascript
const cache = new LRUCache();

// Clean up expired entries every 60 seconds
setInterval(() => {
  const removed = cache.cleanExpired();
  if (removed > 0) {
    console.log(`Cleaned up ${removed} expired entries`);
  }
}, 60000);
```

---

### `clear()`

Removes all entries from the cache.

**Parameters:** None

**Returns:** `void`

**Complexity:** O(1)

**Example:**
```javascript
const cache = new LRUCache();

cache.set('a', 1);
cache.set('b', 2);
console.log(cache.size);  // 2

cache.clear();
console.log(cache.size);  // 0
```

---

### `has(key)`

Checks if a key exists in the cache without updating access time or checking expiration.

**Parameters:**
- `key` (`string`) - Key to check

**Returns:** `boolean` - True if key exists, false otherwise

**Complexity:** O(1)

**Note:** Unlike `get()`, this method:
- Does NOT update LRU tracking
- Does NOT check expiration
- Use only for existence checks without affecting cache behavior

**Example:**
```javascript
const cache = new LRUCache();

cache.set('user:123', { name: 'Alice' });

if (cache.has('user:123')) {
  console.log('User is cached');
}

// Does not affect LRU order
cache.has('user:123');  // No side effects
```

---

### `toString()`

Returns a string representation of the cache state.

**Parameters:** None

**Returns:** `string` - String representation

**Format:** `"LRUCache: size=<current>/<max>, expiration=<ms>ms"`

**Example:**
```javascript
const cache = new LRUCache(50, 300000);

cache.set('a', 1);
cache.set('b', 2);
cache.set('c', 3);

console.log(cache.toString());
// "LRUCache: size=3/50, expiration=300000ms"
```

---

## Getters

### `size`

Gets the current number of entries in the cache.

**Type:** `number`  
**Access:** Read-only

**Example:**
```javascript
const cache = new LRUCache();

console.log(cache.size);  // 0

cache.set('a', 1);
cache.set('b', 2);

console.log(cache.size);  // 2
```

---

## Private Methods

### `evictIfNeeded()` (Private)

Evicts the least recently used entry if cache is at maximum capacity. Called automatically by `set()`.

**Returns:** `void`

**Complexity:** O(1) - removes first entry from Map

**Algorithm:**
1. Check if cache size >= maxSize
2. Get first key from Map (least recently accessed)
3. Delete first entry
4. Map maintains insertion order, so first entry is LRU

**Implementation:**
```javascript
evictIfNeeded() {
    if (this.cache.size >= this.maxSize) {
        // First entry in Map is least recently accessed
        const firstKey = this.cache.keys().next().value;
        if (firstKey !== undefined) {
            this.cache.delete(firstKey);
        }
    }
}
```

---

## LRU Algorithm Details

### How LRU Works

The LRU cache uses JavaScript's `Map` which **maintains insertion order**:

1. **New Entry**: Added to end of Map (most recent)
2. **Access (get)**: Entry is deleted and re-inserted to move to end
3. **Eviction**: First entry is removed (least recently accessed)

### LRU Order Example

```javascript
const cache = new LRUCache(3);

cache.set('a', 1);  // Order: [a]
cache.set('b', 2);  // Order: [a, b]
cache.set('c', 3);  // Order: [a, b, c]

// Access 'a' (moves to end)
cache.get('a');     // Order: [b, c, a]

// Access 'b' (moves to end)
cache.get('b');     // Order: [c, a, b]

// Add 'd' (evicts 'c' - least recent)
cache.set('d', 4);  // Order: [a, b, d]

console.log(cache.get('c'));  // null (evicted)
console.log(cache.get('a'));  // 1 (still present)
```

### Why This Is Efficient

- **Map Deletion/Insertion**: O(1) operations
- **No Array Shifting**: Map maintains order internally
- **No Additional Data Structures**: No linked list needed
- **Memory Efficient**: Only stores keys, values, and timestamps

---

## Usage Examples

### Basic Caching

```javascript
import LRUCache from './data/LRUCache.js';

const cache = new LRUCache(50, 300000);  // 50 items, 5 min expiration

// Store user data
cache.set('user:123', { 
  name: 'Alice', 
  email: 'alice@example.com',
  preferences: { theme: 'dark' }
});

// Retrieve user data
const user = cache.get('user:123');
if (user) {
  console.log(`Welcome back, ${user.name}!`);
}
```

### API Response Caching

```javascript
const apiCache = new LRUCache(100, 600000);  // 100 items, 10 min

async function fetchUserData(userId) {
  const cacheKey = `user:${userId}`;
  
  // Check cache first
  const cached = apiCache.get(cacheKey);
  if (cached) {
    console.log('Cache hit!');
    return cached;
  }
  
  // Cache miss - fetch from API
  console.log('Cache miss - fetching from API');
  const response = await fetch(`/api/users/${userId}`);
  const data = await response.json();
  
  // Store in cache
  apiCache.set(cacheKey, data);
  
  return data;
}
```

### Session Management

```javascript
const sessionCache = new LRUCache(1000, 1800000);  // 1000 sessions, 30 min

function createSession(userId, sessionData) {
  const sessionId = generateSessionId();
  sessionCache.set(sessionId, {
    userId,
    createdAt: Date.now(),
    ...sessionData
  });
  return sessionId;
}

function getSession(sessionId) {
  const session = sessionCache.get(sessionId);
  if (!session) {
    throw new Error('Session expired or not found');
  }
  return session;
}

function invalidateSession(sessionId) {
  sessionCache.delete(sessionId);
}
```

### Computed Value Caching

```javascript
const computeCache = new LRUCache(200, 3600000);  // 200 items, 1 hour

function expensiveComputation(input) {
  const cacheKey = `compute:${JSON.stringify(input)}`;
  
  // Check cache
  const cached = computeCache.get(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  // Perform expensive computation
  console.log('Computing...');
  const result = /* complex calculation */ input * 2;
  
  // Cache result
  computeCache.set(cacheKey, result);
  
  return result;
}
```

### Geographic Data Caching

```javascript
const geoCache = new LRUCache(500, 1800000);  // 500 locations, 30 min

function cacheLocation(lat, lon, data) {
  const key = `geo:${lat.toFixed(6)},${lon.toFixed(6)}`;
  geoCache.set(key, data);
}

function getLocation(lat, lon) {
  const key = `geo:${lat.toFixed(6)},${lon.toFixed(6)}`;
  return geoCache.get(key);
}

// Used by AddressCache internally
const addressCache = new LRUCache(50, 300000);
addressCache.set('address-key', {
  address: brazilianStandardAddress,
  rawData: nominatimResponse
});
```

### Cache with Automatic Cleanup

```javascript
const cache = new LRUCache(100, 300000);  // 5 min expiration

// Set up automatic cleanup every 60 seconds
const cleanupInterval = setInterval(() => {
  const removed = cache.cleanExpired();
  if (removed > 0) {
    console.log(`[Cache] Cleaned ${removed} expired entries`);
  }
}, 60000);

// Clean up on shutdown
process.on('SIGTERM', () => {
  clearInterval(cleanupInterval);
  cache.clear();
});
```

---

## Performance Characteristics

### Time Complexity

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| `get(key)` | O(1) | Direct Map lookup + delete/reinsert |
| `set(key, value)` | O(1) average | May require O(1) eviction |
| `has(key)` | O(1) | Direct Map lookup |
| `clear()` | O(1) | Map.clear() is O(1) |
| `cleanExpired()` | O(n) | Must check all entries |
| `evictIfNeeded()` | O(1) | Remove first entry |

### Space Complexity

- **O(n)** where n is the number of cached entries
- Each entry stores: `value + timestamp + lastAccessed` (2 numbers)
- Map overhead: minimal (native JavaScript implementation)

### Memory Management

**Automatic Eviction:**
- Keeps memory usage bounded to `maxSize` entries
- Eviction happens automatically on `set()`
- No manual cleanup required for LRU

**Time-Based Expiration:**
- Expired entries removed on access (`get()`)
- Periodic cleanup recommended (`cleanExpired()`)
- Prevents memory growth from stale entries

---

## Integration with AddressCache

The `LRUCache` class was extracted from `AddressCache` to follow the Single Responsibility Principle:

```javascript
// AddressCache uses LRUCache internally
class AddressCache {
  constructor() {
    this.cache = new LRUCache(50, 300000);  // 50 entries, 5 min
    
    // Periodic cleanup
    timerManager.setInterval(() => {
      this.cleanExpiredEntries();
    }, 60000, 'address-cache-cleanup');
  }
  
  cleanExpiredEntries() {
    const removed = this.cache.cleanExpired();
    if (removed > 0) {
      log(`Cleaned ${removed} expired cache entries`);
    }
  }
  
  getBrazilianStandardAddress(data) {
    const cacheKey = this.generateCacheKey(data);
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached.address;
    }
    
    // Extract and cache
    const extractor = new AddressExtractor(data);
    this.cache.set(cacheKey, {
      address: extractor.enderecoPadronizado,
      rawData: data
    });
    
    return extractor.enderecoPadronizado;
  }
}
```

---

## Testing

Example test coverage:

```javascript
describe('LRUCache', () => {
  test('stores and retrieves values', () => {
    const cache = new LRUCache();
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });
  
  test('evicts LRU entry when full', () => {
    const cache = new LRUCache(2);  // Max 2 entries
    
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);  // Evicts 'a'
    
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBe(3);
  });
  
  test('expires entries after expiration time', (done) => {
    const cache = new LRUCache(10, 100);  // 100ms expiration
    
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
    
    setTimeout(() => {
      expect(cache.get('key')).toBeNull();  // Expired
      done();
    }, 150);
  });
  
  test('cleanExpired removes expired entries', (done) => {
    const cache = new LRUCache(10, 50);
    
    cache.set('a', 1);
    cache.set('b', 2);
    
    setTimeout(() => {
      const removed = cache.cleanExpired();
      expect(removed).toBe(2);
      expect(cache.size).toBe(0);
      done();
    }, 100);
  });
});
```

---

## Comparison with Other Cache Implementations

### vs. Simple Object Cache

**LRUCache Advantages:**
- Automatic eviction (prevents unbounded growth)
- Time-based expiration
- LRU ordering (keeps frequently used data)
- O(1) operations

**Simple Object Disadvantages:**
- No automatic eviction (memory leak risk)
- No expiration (stale data)
- Manual cleanup required

### vs. Third-Party Libraries

**Advantages of This Implementation:**
- No external dependencies
- Lightweight (243 lines)
- Tailored to application needs
- Easy to understand and maintain

**Third-Party Alternatives:**
- `lru-cache` (npm) - More features but heavier
- `quick-lru` (npm) - Similar, but adds dependency

---

## Related Classes

- **`AddressCache`** - Uses LRUCache internally for address caching
- **`TimerManager`** - Manages periodic cleanup timers

---

## See Also

- [ADDRESS_CACHE.md](./ADDRESS_CACHE.md) - AddressCache implementation using LRUCache
- [Wikipedia: Cache replacement policies](https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU)) - LRU algorithm details
