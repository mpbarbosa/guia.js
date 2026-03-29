## LRU_CACHE

# LRUCache API Documentation

**Version:** 0.9.0-alpha
**File:** `src/data/LRUCache.js` (243 lines)
**Author:** Marcelo Pereira Barbosa (extracted from AddressCache)
**Since:** 0.9.0-alpha

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
cache.set('c',

---

## PHASE1A_GOD_OBJECT_LRUCACHE_EXTRACTION

# Phase 1A: God Object Refactoring - LRUCache Extraction

**Date**: 2026-01-09
**Status**: ✅ COMPLETE
**Severity**: MEDIUM (Architectural Improvement)
**Type**: Refactoring - Extract Class Pattern
**Related**: docs/GOD_OBJECT_REFACTORING.md (Master Plan)

---

## Executive Summary

Successfully extracted **LRUCache** as a standalone, reusable component from the AddressCache God Object. This is the first step in a multi-phase refactoring to break down the 1,197-line AddressCache into focused, single-responsibility classes.

**Key Achievements**:

- ✅ Created LRUCache.js (241 lines) - Pure caching logic with no business dependencies
- ✅ Reduced AddressCache.js by 29 lines (1,197 → 1,168)
- ✅ Written 19 comprehensive unit tests (100% passing)
- ✅ All 1,301 existing tests still passing (no regressions)
- ✅ Zero breaking changes (100% backward compatible)
- ✅ Completed in ~2 hours (vs 16-24 hours for full refactoring)

---

## Problem Statement

**AddressCache.js** (1,197 lines) is a God Object with **4+ distinct responsibilities**:

1. **Caching** (LRU, expiration) - ~200 lines ← **THIS PHASE**
2. Change Detection (logradouro, bairro, municipio) - ~300 lines
3. Observer Pattern (subscribe/notify) - ~150 lines
4. Address Processing - ~100 lines
5. Deprecated Wrappers - ~400 lines

**Phase 1A Goal**: Extract caching logic into a reusable, testable LRUCache class.

---

## Implementation Details

### 1. Created LRUCache.js (NEW FILE) ✅

**Location**: `src/data/LRUCache.js`
**Lines**: 241 lines (including comprehensive JSDoc)
**Dependencies**: NONE (pure data structure)

#### Key Features

```javascript
class LRUCache {
    constructor(maxSize = 50, expirationMs = 300000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.expirationMs = expirationMs;
    }

    // O(1) get with automatic expiration + LRU tracking
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // Check expiration
        if (Date.now() - entry.timestamp > this.expirationMs) {
            this.cache.delete(key);
            return null;
        }

        // Update LRU order (move to end)
        entry.lastAccessed = Date.now();
        this.cache.delete(key);
        this.cache.set(key, entry);

        return entry.value;
    }

    // O(1) set with automatic LRU eviction
    set(key, value) {
        this.evictIfNeeded(); // Auto-evict if at capacity

        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            lastAccessed: Date.now()
        });
    }

    // O(1) eviction of least recently used
    evictIfNeeded() {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }
    }

    // O(n) expired entry cleanup
    cleanExpired() {
        const now = Date.now();
        let removed = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.expirationMs) {
                this.cache.delete(key);
                removed++;
            }
        }

        return removed;
    }

    clear() { this.cache.clear(); }
    get size() { return this.cache.size; }
    has(key) { return this.cache.has(key); }
}
```

#### Design Decisions

**1. Pure Data Structure**

- No business logic dependencies
- No imports (except built-in Map)
- Can be reused for ANY caching needs

**2. Automatic LRU Management**

- `get()` automatically updates access time and moves to end
- `set()` automatically evicts LRU entry when full
- No manual intervention required

**3. Expiration Handling**

- `get()` checks expiration and auto-removes stale entries
- `cleanExpired()` for batch cleanup (e.g., periodic timer)

**4. Performance Optimized**

- O(1) get/set operations using Map
- O(1) LRU eviction (delete first entry)
- O(n) expiration cleanup (unavoidable)

---

### 2. U
