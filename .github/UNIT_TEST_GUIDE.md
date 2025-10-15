# Unit Testing Guide for Guia.js

## Table of Contents

- [What is Unit Testing?](#what-is-unit-testing)
- [Why Unit Testing Matters](#why-unit-testing-matters)
- [Unit Testing Principles](#unit-testing-principles)
- [Setting Up Unit Tests](#setting-up-unit-tests)
- [Writing Effective Unit Tests](#writing-effective-unit-tests)
- [Unit Testing with Referential Transparency](#unit-testing-with-referential-transparency)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Examples](#examples)
- [Mocking and Dependencies](#mocking-and-dependencies)
- [Testing Async Code](#testing-async-code)
- [Testing Immutability](#testing-immutability)
- [Integration with Jest](#integration-with-jest)
- [Resources](#resources)

## What is Unit Testing?

**Unit testing** is a software testing methodology where individual units or components of code are tested in isolation from the rest of the application. A "unit" is typically the smallest testable part of an application:

- A single function
- A class method
- A small module
- An isolated component

### Key Characteristics of Unit Tests

1. **Isolated**: Tests one unit at a time without dependencies
2. **Fast**: Execute in milliseconds
3. **Repeatable**: Same result every time they run
4. **Independent**: Can run in any order
5. **Self-validating**: Pass or fail automatically (no manual inspection)

### Unit Tests vs Other Testing Types

| Type | Scope | Speed | Isolation | Example |
|------|-------|-------|-----------|---------|
| **Unit** | Single function/class | Fast (ms) | Complete | Test `calculateDistance()` |
| **Integration** | Multiple components | Moderate | Partial | Test API + cache + parser |
| **E2E** | Full system | Slow (seconds) | None | Test user workflow |

## Why Unit Testing Matters

### 1. **Early Bug Detection**

Unit tests catch bugs at the function level before they propagate:

```javascript
// Bug found immediately during development
test('should handle null input', () => {
    expect(formatAddress(null)).toBe('');  // FAIL: TypeError!
});
```

### 2. **Documentation**

Unit tests serve as executable documentation:

```javascript
// Test shows exactly how to use the function
test('should format Brazilian address with all components', () => {
    const address = {
        street: 'Avenida Paulista',
        number: '1578',
        city: 'São Paulo',
        state: 'SP'
    };
    
    expect(formatAddress(address)).toBe('Avenida Paulista, 1578, São Paulo - SP');
});
```

### 3. **Refactoring Safety**

Unit tests enable confident refactoring:

```javascript
// Before refactoring: Tests are green ✅
test('calculateDistance works correctly', () => {
    expect(calculateDistance(coord1, coord2)).toBeCloseTo(357.4, 1);
});

// After refactoring: Tests still green ✅
// You know refactoring didn't break functionality
```

### 4. **Design Improvement**

Writing unit tests forces better design:

- Functions become smaller and focused
- Dependencies become explicit
- Code becomes more modular
- Coupling is reduced

### 5. **Faster Development**

While unit tests take time to write, they save time by:

- Reducing debugging time
- Preventing regression bugs
- Enabling safe refactoring
- Providing quick feedback

## Unit Testing Principles

### 1. Test One Thing at a Time

Each test should verify a single behavior:

✅ **Good:**
```javascript
test('should return 0 for same coordinates', () => {
    const coord = { lat: -23.5, lon: -46.6 };
    expect(calculateDistance(coord, coord)).toBe(0);
});

test('should calculate positive distance for different coordinates', () => {
    const sp = { lat: -23.5, lon: -46.6 };
    const rio = { lat: -22.9, lon: -43.2 };
    expect(calculateDistance(sp, rio)).toBeGreaterThan(0);
});
```

❌ **Avoid:**
```javascript
test('distance calculation', () => {
    // Testing multiple behaviors in one test
    expect(calculateDistance(coord, coord)).toBe(0);
    expect(calculateDistance(sp, rio)).toBeGreaterThan(0);
    expect(calculateDistance(sp, bh)).toBeCloseTo(500, 0);
});
```

### 2. Arrange-Act-Assert (AAA) Pattern

Structure tests in three clear phases:

```javascript
test('should format CEP correctly', () => {
    // Arrange: Set up test data
    const cep = '01310200';
    
    // Act: Execute the function
    const formatted = formatCEP(cep);
    
    // Assert: Verify the result
    expect(formatted).toBe('01310-200');
});
```

### 3. Test Behavior, Not Implementation

Focus on what the function does, not how it does it:

✅ **Good: Testing behavior**
```javascript
test('should return sorted cities', () => {
    const cities = ['São Paulo', 'Brasília', 'Rio de Janeiro'];
    const result = sortCities(cities);
    
    expect(result[0]).toBe('Brasília');
    expect(result).toHaveLength(3);
});
```

❌ **Avoid: Testing implementation**
```javascript
test('should call Array.sort with correct comparator', () => {
    const sortSpy = jest.spyOn(Array.prototype, 'sort');
    sortCities(['São Paulo', 'Rio']);
    
    expect(sortSpy).toHaveBeenCalledWith(expect.any(Function));
});
```

### 4. Tests Should Be Independent

Each test should set up its own data and not rely on other tests:

✅ **Good:**
```javascript
describe('AddressCache', () => {
    let cache;
    
    beforeEach(() => {
        cache = new AddressCache(); // Fresh instance for each test
    });
    
    test('should store address', () => {
        cache.set('key1', { city: 'São Paulo' });
        expect(cache.get('key1')).toBeDefined();
    });
    
    test('should return null for missing key', () => {
        expect(cache.get('nonexistent')).toBeNull();
    });
});
```

### 5. Tests Should Be Fast

Unit tests should execute in milliseconds:

- Use pure functions (no I/O)
- Mock external dependencies
- Avoid real network calls
- Don't use real databases

```javascript
// Fast test: Pure function
test('calculates distance quickly', () => {
    const start = Date.now();
    calculateDistance(coord1, coord2);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(10); // Less than 10ms
});
```

## Setting Up Unit Tests

### Project Structure

```
guia_js/
├── src/
│   ├── guia.js              # Source code
│   └── guia_ibge.js         # IBGE module
├── __tests__/
│   ├── utils.test.js        # Unit tests for utilities
│   ├── CurrentPosition.test.js
│   ├── Immutability.test.js
│   └── ...
├── package.json             # Jest configuration
└── .gitignore              # Ignore node_modules
```

### Jest Configuration

In `package.json`:

```json
{
  "jest": {
    "testEnvironment": "node",
    "collectCoverageFrom": [
      "src/*.js",
      "!node_modules/**"
    ],
    "testMatch": [
      "**/__tests__/**/*.js",
      "**/*.test.js"
    ]
  }
}
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test utils.test.js

# Run with coverage
npm run test:coverage

# Watch mode (re-run on changes)
npm run test:watch

# Verbose output
npm run test:verbose
```

## Writing Effective Unit Tests

### Test Naming Convention

Use descriptive names that explain the scenario and expected outcome:

✅ **Good:**
```javascript
test('should return empty string when address is null', () => {});
test('should format complete Brazilian address with all components', () => {});
test('should preserve Portuguese special characters in city names', () => {});
test('should throw error when CEP has invalid length', () => {});
```

❌ **Avoid:**
```javascript
test('test1', () => {});
test('address test', () => {});
test('works', () => {});
test('null', () => {});
```

### Test Organization

Group related tests using `describe` blocks:

```javascript
describe('calculateDistance', () => {
    describe('valid inputs', () => {
        test('should calculate distance between two coordinates', () => {});
        test('should return 0 for same coordinates', () => {});
    });
    
    describe('edge cases', () => {
        test('should handle null coordinates', () => {});
        test('should handle undefined coordinates', () => {});
    });
    
    describe('error cases', () => {
        test('should throw error for invalid latitude', () => {});
        test('should throw error for invalid longitude', () => {});
    });
});
```

### Writing Assertions

Use specific, clear assertions:

```javascript
// Exact matches
expect(result).toBe('São Paulo');
expect(result).toEqual({ city: 'São Paulo' });

// Truthiness
expect(result).toBeTruthy();
expect(result).toBeDefined();
expect(result).not.toBeNull();

// Numbers
expect(distance).toBeCloseTo(357.4, 1);
expect(count).toBeGreaterThan(0);
expect(age).toBeLessThanOrEqual(150);

// Strings
expect(address).toContain('Paulista');
expect(cep).toMatch(/^\d{5}-\d{3}$/);

// Arrays
expect(cities).toHaveLength(3);
expect(cities).toContain('São Paulo');

// Objects
expect(address).toHaveProperty('city');
expect(address).toMatchObject({ city: 'São Paulo' });
```

## Unit Testing with Referential Transparency

Unit testing and referential transparency are natural partners. Pure functions are the easiest to unit test.

### Pure Functions: Perfect for Unit Testing

```javascript
// src/utils.js - Pure function
function calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(coord2.lat - coord1.lat);
    const dLon = toRadians(coord2.lon - coord1.lon);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// __tests__/utils.test.js - Easy to test!
describe('calculateDistance', () => {
    test('should calculate distance between São Paulo and Rio', () => {
        const sp = { lat: -23.550520, lon: -46.633308 };
        const rio = { lat: -22.906847, lon: -43.172896 };
        
        const distance = calculateDistance(sp, rio);
        
        expect(distance).toBeCloseTo(357.4, 1);
    });
    
    test('should return 0 for same coordinates', () => {
        const coord = { lat: -23.5, lon: -46.6 };
        
        expect(calculateDistance(coord, coord)).toBe(0);
    });
    
    test('should be commutative (same result regardless of order)', () => {
        const sp = { lat: -23.5, lon: -46.6 };
        const rio = { lat: -22.9, lon: -43.2 };
        
        const distance1 = calculateDistance(sp, rio);
        const distance2 = calculateDistance(rio, sp);
        
        expect(distance1).toBe(distance2);
    });
});
```

**Why this is easy to test:**
- ✅ No setup or teardown needed
- ✅ No mocks required
- ✅ Deterministic output
- ✅ No side effects to track
- ✅ Can test in complete isolation

### Isolating Side Effects for Testing

When you must have side effects, isolate them to make testing easier:

```javascript
// src/geocoding.js

// Pure function - easy to unit test
function buildGeocodingUrl(address, options = {}) {
    const baseUrl = 'https://nominatim.openstreetmap.org/search';
    const params = new URLSearchParams({
        q: address,
        format: options.format || 'json',
        addressdetails: options.details ? 1 : 0,
        limit: options.limit || 1
    });
    return `${baseUrl}?${params.toString()}`;
}

// Pure function - easy to unit test
function parseGeocodingResponse(response) {
    if (!response || response.length === 0) return null;
    
    const result = response[0];
    return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        displayName: result.display_name
    };
}

// Impure function - side effect at boundary
async function fetchGeocodingData(address) {
    const url = buildGeocodingUrl(address);
    const response = await fetch(url);
    const data = await response.json();
    return parseGeocodingResponse(data);
}

// __tests__/geocoding.test.js
describe('Geocoding Functions', () => {
    describe('buildGeocodingUrl (pure)', () => {
        test('should build URL with required parameters', () => {
            const url = buildGeocodingUrl('Avenida Paulista, São Paulo');
            
            expect(url).toContain('nominatim.openstreetmap.org');
            expect(url).toContain('q=Avenida+Paulista');
            expect(url).toContain('format=json');
        });
        
        test('should include optional parameters', () => {
            const url = buildGeocodingUrl('São Paulo', { 
                details: true, 
                limit: 5 
            });
            
            expect(url).toContain('addressdetails=1');
            expect(url).toContain('limit=5');
        });
    });
    
    describe('parseGeocodingResponse (pure)', () => {
        test('should parse valid response', () => {
            const response = [{
                lat: '-23.550520',
                lon: '-46.633308',
                display_name: 'São Paulo, Brasil'
            }];
            
            const result = parseGeocodingResponse(response);
            
            expect(result).toEqual({
                lat: -23.550520,
                lon: -46.633308,
                displayName: 'São Paulo, Brasil'
            });
        });
        
        test('should return null for empty response', () => {
            expect(parseGeocodingResponse([])).toBeNull();
            expect(parseGeocodingResponse(null)).toBeNull();
        });
    });
    
    describe('fetchGeocodingData (impure)', () => {
        beforeEach(() => {
            // Mock the side effect
            global.fetch = jest.fn();
        });
        
        test('should fetch and parse geocoding data', async () => {
            const mockResponse = [{
                lat: '-23.5',
                lon: '-46.6',
                display_name: 'Test'
            }];
            
            global.fetch.mockResolvedValue({
                json: () => Promise.resolve(mockResponse)
            });
            
            const result = await fetchGeocodingData('São Paulo');
            
            expect(result.lat).toBe(-23.5);
            expect(result.lon).toBe(-46.6);
        });
    });
});
```

**Benefits of this approach:**
- ✅ Pure functions (`buildGeocodingUrl`, `parseGeocodingResponse`) tested without mocks
- ✅ Side effect (`fetch`) isolated to one function
- ✅ Easier to test, maintain, and understand
- ✅ Pure functions can be reused and composed

## Best Practices

### 1. Keep Tests Simple

Tests should be simpler than the code they test:

✅ **Good:**
```javascript
test('should format address', () => {
    const result = formatAddress({ street: 'Av. Paulista', number: '1000' });
    expect(result).toBe('Av. Paulista, 1000');
});
```

❌ **Avoid:**
```javascript
test('should format address', () => {
    const addresses = generateTestAddresses(100);
    const results = addresses.map(addr => {
        const formatted = formatAddress(addr);
        return validateFormat(formatted) ? formatted : null;
    }).filter(Boolean);
    expect(results.length).toBeGreaterThan(50);
});
```

### 2. Test Edge Cases

Always test boundary conditions:

```javascript
describe('formatCEP edge cases', () => {
    test('should handle null input', () => {
        expect(formatCEP(null)).toBe('');
    });
    
    test('should handle undefined input', () => {
        expect(formatCEP(undefined)).toBe('');
    });
    
    test('should handle empty string', () => {
        expect(formatCEP('')).toBe('');
    });
    
    test('should handle invalid length', () => {
        expect(formatCEP('123')).toBe('');
    });
    
    test('should handle non-numeric characters', () => {
        expect(formatCEP('abcdefgh')).toBe('');
    });
    
    test('should handle already formatted CEP', () => {
        expect(formatCEP('01310-200')).toBe('01310-200');
    });
});
```

### 3. Don't Test Implementation Details

Test the public API, not internal mechanics:

✅ **Good:**
```javascript
test('cache should return stored value', () => {
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
});
```

❌ **Avoid:**
```javascript
test('cache should use Map internally', () => {
    expect(cache._internalMap).toBeInstanceOf(Map);
});
```

### 4. Use Setup and Teardown

Use `beforeEach` and `afterEach` to avoid repetition:

```javascript
describe('AddressCache', () => {
    let cache;
    
    beforeEach(() => {
        cache = new AddressCache();
    });
    
    afterEach(() => {
        cache.clear();
    });
    
    test('should add item', () => {
        cache.set('key', 'value');
        expect(cache.get('key')).toBe('value');
    });
    
    test('should remove item', () => {
        cache.set('key', 'value');
        cache.delete('key');
        expect(cache.get('key')).toBeNull();
    });
});
```

### 5. Test Error Conditions

Don't just test the happy path:

```javascript
describe('calculateDistance error handling', () => {
    test('should throw error for invalid latitude', () => {
        const invalid = { lat: 91, lon: 0 };
        const valid = { lat: 0, lon: 0 };
        
        expect(() => calculateDistance(invalid, valid))
            .toThrow('Invalid latitude');
    });
    
    test('should throw error for invalid longitude', () => {
        const invalid = { lat: 0, lon: 181 };
        const valid = { lat: 0, lon: 0 };
        
        expect(() => calculateDistance(valid, invalid))
            .toThrow('Invalid longitude');
    });
    
    test('should throw error for null coordinates', () => {
        expect(() => calculateDistance(null, { lat: 0, lon: 0 }))
            .toThrow('Coordinates cannot be null');
    });
});
```

### 6. Avoid Test Interdependence

Tests should not depend on each other:

❌ **Avoid:**
```javascript
let sharedData;

test('should create data', () => {
    sharedData = createData();
    expect(sharedData).toBeDefined();
});

test('should process data', () => {
    // Depends on previous test!
    const result = processData(sharedData);
    expect(result).toBeDefined();
});
```

✅ **Good:**
```javascript
test('should create data', () => {
    const data = createData();
    expect(data).toBeDefined();
});

test('should process data', () => {
    const data = createData(); // Create own data
    const result = processData(data);
    expect(result).toBeDefined();
});
```

## Common Patterns

### Pattern 1: Testing Pure Functions

```javascript
// src/validators.js
function isValidCEP(cep) {
    if (!cep) return false;
    const digits = cep.replace(/\D/g, '');
    return digits.length === 8;
}

// __tests__/validators.test.js
describe('isValidCEP', () => {
    test('should accept valid 8-digit CEP', () => {
        expect(isValidCEP('01310200')).toBe(true);
    });
    
    test('should accept formatted CEP', () => {
        expect(isValidCEP('01310-200')).toBe(true);
    });
    
    test('should reject CEP with wrong length', () => {
        expect(isValidCEP('123')).toBe(false);
        expect(isValidCEP('123456789')).toBe(false);
    });
    
    test('should reject null and undefined', () => {
        expect(isValidCEP(null)).toBe(false);
        expect(isValidCEP(undefined)).toBe(false);
    });
});
```

### Pattern 2: Testing with Test Data Builders

```javascript
// __tests__/helpers/builders.js
function buildAddress(overrides = {}) {
    return {
        street: 'Avenida Paulista',
        number: '1578',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-200',
        ...overrides
    };
}

// __tests__/formatters.test.js
describe('formatAddress', () => {
    test('should format complete address', () => {
        const address = buildAddress();
        expect(formatAddress(address)).toContain('Avenida Paulista');
    });
    
    test('should handle missing neighborhood', () => {
        const address = buildAddress({ neighborhood: null });
        const result = formatAddress(address);
        expect(result).not.toContain('null');
    });
});
```

### Pattern 3: Parameterized Tests

```javascript
describe('isValidBrazilianState', () => {
    const validStates = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES',
        'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR',
        'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
        'SP', 'SE', 'TO'
    ];
    
    test.each(validStates)('should accept valid state: %s', (state) => {
        expect(isValidBrazilianState(state)).toBe(true);
    });
    
    const invalidStates = ['XX', 'ZZ', '', null, undefined, 'S', 'SPP'];
    
    test.each(invalidStates)('should reject invalid state: %s', (state) => {
        expect(isValidBrazilianState(state)).toBe(false);
    });
});
```

### Pattern 4: Testing with Snapshots

```javascript
describe('formatBrazilianAddress', () => {
    test('should format address correctly', () => {
        const address = {
            street: 'Avenida Paulista',
            number: '1578',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01310-200'
        };
        
        const result = formatBrazilianAddress(address);
        
        // Snapshot test captures the exact output
        expect(result).toMatchSnapshot();
    });
});
```

## Examples

### Example 1: Testing a Utility Function

```javascript
// src/utils.js
function normalizeStreet(street) {
    if (!street) return '';
    
    return street
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/^(rua|avenida|av|r\.)\s+/i, (match) => {
            const normalized = {
                'rua': 'Rua',
                'avenida': 'Avenida',
                'av': 'Avenida',
                'r.': 'Rua'
            };
            return normalized[match.trim().toLowerCase()] + ' ';
        });
}

// __tests__/utils.test.js
describe('normalizeStreet', () => {
    test('should normalize "rua" to "Rua"', () => {
        expect(normalizeStreet('rua paulista')).toBe('Rua paulista');
    });
    
    test('should normalize "av" to "Avenida"', () => {
        expect(normalizeStreet('av paulista')).toBe('Avenida paulista');
    });
    
    test('should handle extra whitespace', () => {
        expect(normalizeStreet('  rua   paulista  ')).toBe('Rua paulista');
    });
    
    test('should handle empty string', () => {
        expect(normalizeStreet('')).toBe('');
    });
    
    test('should handle null', () => {
        expect(normalizeStreet(null)).toBe('');
    });
});
```

### Example 2: Testing a Class

```javascript
// src/AddressFormatter.js
class AddressFormatter {
    constructor(options = {}) {
        this.separator = options.separator || ', ';
        this.includeCountry = options.includeCountry || false;
    }
    
    format(address) {
        const parts = [
            address.street,
            address.number,
            address.neighborhood,
            address.city,
            address.state,
            address.zipCode
        ].filter(Boolean);
        
        let result = parts.join(this.separator);
        
        if (this.includeCountry) {
            result += `${this.separator}Brasil`;
        }
        
        return result;
    }
}

// __tests__/AddressFormatter.test.js
describe('AddressFormatter', () => {
    describe('constructor', () => {
        test('should use default separator', () => {
            const formatter = new AddressFormatter();
            const address = { street: 'Rua A', number: '123' };
            
            expect(formatter.format(address)).toBe('Rua A, 123');
        });
        
        test('should use custom separator', () => {
            const formatter = new AddressFormatter({ separator: ' - ' });
            const address = { street: 'Rua A', number: '123' };
            
            expect(formatter.format(address)).toBe('Rua A - 123');
        });
    });
    
    describe('format', () => {
        let formatter;
        
        beforeEach(() => {
            formatter = new AddressFormatter();
        });
        
        test('should format complete address', () => {
            const address = {
                street: 'Avenida Paulista',
                number: '1578',
                neighborhood: 'Bela Vista',
                city: 'São Paulo',
                state: 'SP',
                zipCode: '01310-200'
            };
            
            const result = formatter.format(address);
            
            expect(result).toBe(
                'Avenida Paulista, 1578, Bela Vista, São Paulo, SP, 01310-200'
            );
        });
        
        test('should handle missing fields', () => {
            const address = {
                street: 'Avenida Paulista',
                city: 'São Paulo'
            };
            
            const result = formatter.format(address);
            
            expect(result).toBe('Avenida Paulista, São Paulo');
        });
        
        test('should include country when option is set', () => {
            const formatter = new AddressFormatter({ includeCountry: true });
            const address = { city: 'São Paulo' };
            
            const result = formatter.format(address);
            
            expect(result).toBe('São Paulo, Brasil');
        });
    });
});
```

### Example 3: Testing Array Operations (Immutability)

```javascript
// src/sorters.js
function sortCitiesByName(cities) {
    // Return new sorted array (immutable)
    return [...cities].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

// __tests__/sorters.test.js
describe('sortCitiesByName', () => {
    test('should return sorted cities', () => {
        const cities = ['São Paulo', 'Brasília', 'Rio de Janeiro'];
        
        const result = sortCitiesByName(cities);
        
        expect(result).toEqual(['Brasília', 'Rio de Janeiro', 'São Paulo']);
    });
    
    test('should not mutate original array', () => {
        const cities = ['São Paulo', 'Brasília', 'Rio de Janeiro'];
        const original = [...cities];
        
        sortCitiesByName(cities);
        
        // Original array unchanged
        expect(cities).toEqual(original);
    });
    
    test('should handle Portuguese characters correctly', () => {
        const cities = ['Belém', 'Brasília', 'São Paulo'];
        
        const result = sortCitiesByName(cities);
        
        expect(result[0]).toBe('Belém');
        expect(result[1]).toBe('Brasília');
    });
});
```

## Mocking and Dependencies

### When to Use Mocks

Use mocks when testing code that has external dependencies:

- Network requests (fetch, axios)
- File system operations
- Database queries
- Browser APIs (localStorage, geolocation)
- Date/time (Date.now(), timestamps)
- Random values (Math.random())

### Mocking Browser APIs

```javascript
// __tests__/geolocation.test.js
describe('getCurrentLocation', () => {
    let mockGeolocation;
    
    beforeEach(() => {
        mockGeolocation = {
            getCurrentPosition: jest.fn()
        };
        global.navigator = { geolocation: mockGeolocation };
    });
    
    test('should get current location', async () => {
        const mockPosition = {
            coords: {
                latitude: -23.5,
                longitude: -46.6,
                accuracy: 10
            }
        };
        
        mockGeolocation.getCurrentPosition.mockImplementation((success) => {
            success(mockPosition);
        });
        
        const location = await getCurrentLocation();
        
        expect(location.lat).toBe(-23.5);
        expect(location.lon).toBe(-46.6);
    });
    
    test('should handle geolocation error', async () => {
        const mockError = {
            code: 1,
            message: 'User denied geolocation'
        };
        
        mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
            error(mockError);
        });
        
        await expect(getCurrentLocation()).rejects.toThrow('User denied');
    });
});
```

### Mocking Network Requests

```javascript
// __tests__/api.test.js
describe('fetchAddressFromCEP', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });
    
    afterEach(() => {
        jest.restoreAllMocks();
    });
    
    test('should fetch address data', async () => {
        const mockResponse = {
            cep: '01310-200',
            logradouro: 'Avenida Paulista',
            bairro: 'Bela Vista',
            localidade: 'São Paulo',
            uf: 'SP'
        };
        
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockResponse)
        });
        
        const result = await fetchAddressFromCEP('01310-200');
        
        expect(result.street).toBe('Avenida Paulista');
        expect(result.city).toBe('São Paulo');
    });
    
    test('should handle API error', async () => {
        global.fetch.mockRejectedValue(new Error('Network error'));
        
        await expect(fetchAddressFromCEP('01310-200'))
            .rejects
            .toThrow('Network error');
    });
});
```

### Mocking Date and Time

```javascript
// __tests__/timestamp.test.js
describe('isBusinessHour', () => {
    beforeEach(() => {
        // Mock Date.now()
        jest.useFakeTimers();
    });
    
    afterEach(() => {
        jest.useRealTimers();
    });
    
    test('should return true during business hours', () => {
        // Set time to 10:00 AM
        const mockDate = new Date('2025-01-08T10:00:00');
        jest.setSystemTime(mockDate);
        
        expect(isBusinessHour()).toBe(true);
    });
    
    test('should return false outside business hours', () => {
        // Set time to 11:00 PM
        const mockDate = new Date('2025-01-08T23:00:00');
        jest.setSystemTime(mockDate);
        
        expect(isBusinessHour()).toBe(false);
    });
});
```

### Mocking Modules

```javascript
// __tests__/geocoding.test.js
// Mock the entire module
jest.mock('../src/externalApi', () => ({
    geocode: jest.fn()
}));

const { geocode } = require('../src/externalApi');
const { processAddress } = require('../src/geocoding');

describe('processAddress', () => {
    test('should use geocoding API', async () => {
        geocode.mockResolvedValue({
            lat: -23.5,
            lon: -46.6
        });
        
        const result = await processAddress('São Paulo');
        
        expect(geocode).toHaveBeenCalledWith('São Paulo');
        expect(result.lat).toBe(-23.5);
    });
});
```

## Testing Async Code

### Testing Promises

```javascript
describe('fetchAddress', () => {
    test('should resolve with address data', async () => {
        const address = await fetchAddress('01310-200');
        
        expect(address).toBeDefined();
        expect(address.city).toBe('São Paulo');
    });
    
    test('should reject with error for invalid CEP', async () => {
        await expect(fetchAddress('invalid'))
            .rejects
            .toThrow('Invalid CEP');
    });
});
```

### Testing Async/Await

```javascript
describe('geocodeAddress', () => {
    test('should geocode Brazilian address', async () => {
        const result = await geocodeAddress('Avenida Paulista, São Paulo');
        
        expect(result).toHaveProperty('lat');
        expect(result).toHaveProperty('lon');
        expect(result.lat).toBeCloseTo(-23.5, 0);
    });
    
    test('should handle network errors', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
        
        try {
            await geocodeAddress('São Paulo');
            fail('Should have thrown an error');
        } catch (error) {
            expect(error.message).toBe('Network error');
        }
    });
});
```

### Testing Callbacks

```javascript
describe('loadAddress with callback', () => {
    test('should call callback with address data', (done) => {
        loadAddress('01310-200', (error, address) => {
            expect(error).toBeNull();
            expect(address.city).toBe('São Paulo');
            done();
        });
    });
    
    test('should call callback with error', (done) => {
        loadAddress('invalid', (error, address) => {
            expect(error).toBeDefined();
            expect(address).toBeNull();
            done();
        });
    });
});
```

### Testing with Timeouts

```javascript
describe('debounced geocoding', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    
    afterEach(() => {
        jest.useRealTimers();
    });
    
    test('should debounce multiple calls', () => {
        const mockCallback = jest.fn();
        const debouncedGeocode = debounce(mockCallback, 500);
        
        debouncedGeocode('São Paulo');
        debouncedGeocode('Rio de Janeiro');
        debouncedGeocode('Brasília');
        
        // Advance time by 500ms
        jest.advanceTimersByTime(500);
        
        // Only last call should execute
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith('Brasília');
    });
});
```

## Testing Immutability

### Testing Array Immutability

```javascript
describe('addCity', () => {
    test('should not mutate original array', () => {
        const cities = ['São Paulo', 'Rio de Janeiro'];
        const original = [...cities];
        
        const result = addCity(cities, 'Brasília');
        
        // Original array unchanged
        expect(cities).toEqual(original);
        
        // New array has added city
        expect(result).toContain('Brasília');
        expect(result).toHaveLength(3);
    });
});

describe('sortArray', () => {
    test('should return new sorted array without mutating original', () => {
        const numbers = [3, 1, 4, 1, 5];
        const original = [...numbers];
        
        const sorted = sortArray(numbers);
        
        expect(numbers).toEqual(original);
        expect(sorted).toEqual([1, 1, 3, 4, 5]);
    });
});
```

### Testing Object Immutability

```javascript
describe('updateAddress', () => {
    test('should return new object without mutating original', () => {
        const address = {
            street: 'Avenida Paulista',
            number: '1578',
            city: 'São Paulo'
        };
        const original = { ...address };
        
        const updated = updateAddress(address, { number: '2000' });
        
        // Original unchanged
        expect(address).toEqual(original);
        
        // New object has updated value
        expect(updated.number).toBe('2000');
        expect(updated.street).toBe('Avenida Paulista');
    });
});
```

### Testing with Object.freeze

```javascript
describe('immutable operations', () => {
    test('should respect frozen objects', () => {
        const address = Object.freeze({
            city: 'São Paulo'
        });
        
        expect(() => {
            address.city = 'Rio de Janeiro'; // Fails in strict mode
        }).toThrow(); // Or doesn't throw in non-strict mode
        
        expect(Object.isFrozen(address)).toBe(true);
    });
});
```

## Integration with Jest

### ⚠️ IMPORTANT: Jest and ES6 Modules

**If you're using ES6 modules (`import/export`) in your source code, you MUST configure Jest properly.**

**See comprehensive guides:**
- 📖 [JEST_COMMONJS_ES6_GUIDE.md](../docs/JEST_COMMONJS_ES6_GUIDE.md) - Complete analysis and solutions
- 📖 [TESTING_MODULE_SYSTEMS.md](./TESTING_MODULE_SYSTEMS.md) - Quick reference

**Quick setup for ES6 modules:**

```json
// package.json
{
  "type": "module",
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
  }
}
```

```javascript
// test.js - Import Jest globals
import { describe, test, expect } from '@jest/globals';
import { myFunction } from '../src/module.js';  // Include .js extension

describe('myFunction', () => {
  test('works', () => {
    expect(myFunction()).toBe('expected');
  });
});
```

**Common errors and fixes:**
- ❌ "Cannot use import statement outside a module" → Use `--experimental-vm-modules`
- ❌ "describe is not defined" → Import from `@jest/globals`
- ❌ "Module not found" → Add `.js` extension to imports

### Jest Matchers Reference

```javascript
// Equality
expect(value).toBe(expected);           // Same reference (===)
expect(value).toEqual(expected);        // Deep equality
expect(value).toStrictEqual(expected);  // Strict deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(10);
expect(value).toBeGreaterThanOrEqual(10);
expect(value).toBeLessThan(10);
expect(value).toBeLessThanOrEqual(10);
expect(value).toBeCloseTo(0.3, 5);      // Float comparison

// Strings
expect(str).toMatch(/pattern/);
expect(str).toContain('substring');

// Arrays and Iterables
expect(arr).toContain(item);
expect(arr).toHaveLength(3);
expect(arr).toContainEqual({ id: 1 });

// Objects
expect(obj).toHaveProperty('key');
expect(obj).toHaveProperty('key', 'value');
expect(obj).toMatchObject({ key: 'value' });

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('error message');
expect(() => fn()).toThrow(Error);

// Promises
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();
```

### Jest Configuration Tips

```javascript
// package.json
{
  "jest": {
    // Use node environment for unit tests
    "testEnvironment": "node",
    
    // Coverage thresholds
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    },
    
    // Ignore patterns
    "testPathIgnorePatterns": [
      "/node_modules/",
      "/dist/"
    ],
    
    // Setup files
    "setupFilesAfterEnv": ["<rootDir>/__tests__/setup.js"]
  }
}
```

### Running Tests Efficiently

```bash
# Run specific test file
npm test utils.test.js

# Run tests matching pattern
npm test --testNamePattern="should format"

# Run only changed tests
npm test --onlyChanged

# Update snapshots
npm test -- -u

# Run tests in specific folder
npm test __tests__/utils/

# Run with coverage for specific file
npm test -- --coverage --collectCoverageFrom="src/utils.js"
```

## Resources

### Internal Documentation

- **[TESTING.md](../TESTING.md)** - Overall testing guide and setup
- **[TDD_GUIDE.md](./TDD_GUIDE.md)** - Test-driven development approach
- **[REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md)** - Pure functions and testing
- **[CODE_REVIEW_GUIDE.md](./CODE_REVIEW_GUIDE.md)** - Review checklist for tests
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[docs/github/GITHUB_ACTIONS_GUIDE.md](../docs/github/GITHUB_ACTIONS_GUIDE.md)** - CI/CD integration

### Architecture Examples with Tests
- **[CLASS_DIAGRAM.md](../docs/architecture/CLASS_DIAGRAM.md)** - Complete class architecture and test organization
- **[GEO_POSITION.md](../docs/architecture/GEO_POSITION.md)** - Well-tested GeoPosition class example
- **[REFERENCE_PLACE.md](../docs/architecture/REFERENCE_PLACE.md)** - ReferencePlace with comprehensive test coverage
- **[WEB_GEOCODING_MANAGER.md](../docs/architecture/WEB_GEOCODING_MANAGER.md)** - Complex class with unit tests

### Jest Documentation

- **[Jest Getting Started](https://jestjs.io/docs/getting-started)** - Official documentation
- **[Jest Expect API](https://jestjs.io/docs/expect)** - All matchers and assertions
- **[Jest Mock Functions](https://jestjs.io/docs/mock-functions)** - Complete mocking guide
- **[Jest Async Testing](https://jestjs.io/docs/asynchronous)** - Testing async code
- **[Jest Configuration](https://jestjs.io/docs/configuration)** - Configuration options

### Books and Articles

- **Test Driven Development: By Example** - Kent Beck
- **The Art of Unit Testing** - Roy Osherove
- **Effective Unit Testing** - Lasse Koskela
- **xUnit Test Patterns** - Gerard Meszaros

### Online Resources

- **[JavaScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)** - Comprehensive guide
- **[Testing JavaScript](https://testingjavascript.com/)** - Kent C. Dodds course
- **[Jest Cheat Sheet](https://github.com/sapegin/jest-cheat-sheet)** - Quick reference

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-09  
**Status**: ✅ Ready for use  
**Maintained by**: Guia.js Team

---

## Quick Reference Card

### Unit Test Commands
```bash
npm test                    # Run all tests
npm test file.test.js       # Run specific file
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
npm run test:verbose        # Detailed output
npm run validate            # Validate syntax
npm run test:all            # Validate + test
```

### Unit Test Structure
```javascript
describe('Feature/Module', () => {
    beforeEach(() => {
        // Setup before each test
    });
    
    afterEach(() => {
        // Cleanup after each test
    });
    
    test('should do something specific', () => {
        // Arrange
        const input = createInput();
        
        // Act
        const result = functionUnderTest(input);
        
        // Assert
        expect(result).toBe(expected);
    });
});
```

### Testing Principles
- ✅ Test one thing at a time
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange-Act-Assert)
- ✅ Test behavior, not implementation
- ✅ Tests should be independent
- ✅ Tests should be fast
- ✅ Test edge cases and errors
- ✅ Keep tests simple and readable

### Pure Functions + Unit Tests
- ✅ Pure functions are easiest to test
- ✅ No mocks needed for pure functions
- ✅ Deterministic = predictable tests
- ✅ Isolate side effects at boundaries
- ✅ Test immutability in data operations
