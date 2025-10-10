# Test Driven Development (TDD) Guide for Guia.js

## Table of Contents

- [What is Test Driven Development?](#what-is-test-driven-development)
- [Why TDD Matters](#why-tdd-matters)
- [The TDD Cycle: Red-Green-Refactor](#the-tdd-cycle-red-green-refactor)
- [TDD Workflow](#tdd-workflow)
- [TDD with Referential Transparency](#tdd-with-referential-transparency)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Examples](#examples)
- [Integration with CI/CD](#integration-with-cicd)
- [Resources](#resources)

## What is Test Driven Development?

**Test Driven Development (TDD)** is a software development approach where tests are written *before* the actual code. The process follows a short, repeatable cycle:

1. **Write a failing test** (Red) - Define what you want to build
2. **Make the test pass** (Green) - Implement the simplest solution
3. **Refactor** (Refactor) - Improve the code while keeping tests green

TDD ensures that:
- Every feature has tests from the start
- Code is designed to be testable
- Tests serve as living documentation
- Refactoring is safe and confident

### The TDD Philosophy

> "Code without tests is broken by design." - Jacob Kaplan-Moss

TDD inverts the traditional development process:
- **Traditional**: Code → Test → Debug
- **TDD**: Test → Code → Refactor

## Why TDD Matters

### 1. **Better Design**

Writing tests first forces you to think about:
- Function interfaces and APIs
- Dependencies and coupling
- Edge cases and error handling
- Referential transparency and pure functions

### 2. **Higher Confidence**

With TDD, you know:
- ✅ Your code works as expected
- ✅ Changes don't break existing functionality
- ✅ Edge cases are handled
- ✅ Refactoring is safe

### 3. **Living Documentation**

Tests serve as:
- Examples of how to use your code
- Specifications of expected behavior
- Documentation that never goes out of date

### 4. **Faster Development**

TDD may seem slower initially, but:
- Less time debugging
- Fewer production bugs
- Easier maintenance
- Confident refactoring

### 5. **Aligns with Referential Transparency**

TDD naturally encourages:
- Pure functions (easier to test)
- Isolated side effects (testable boundaries)
- Deterministic behavior (predictable tests)
- Immutable data structures (reliable assertions)

## The TDD Cycle: Red-Green-Refactor

### 🔴 Red: Write a Failing Test

**Goal**: Define what you want to build

```javascript
// __tests__/AddressFormatter.test.js
describe('AddressFormatter', () => {
    test('should format Brazilian address with all components', () => {
        const address = {
            street: 'Avenida Paulista',
            number: '1578',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01310-200'
        };
        
        const formatted = formatBrazilianAddress(address);
        
        expect(formatted).toBe('Avenida Paulista, 1578, Bela Vista, São Paulo - SP, 01310-200');
    });
});
```

**What to do:**
1. Think about the function signature
2. Consider inputs and expected outputs
3. Write the test as if the function exists
4. Run the test - it should fail (Red)

**Why it fails:**
- Function doesn't exist yet
- This is expected and good!

### 🟢 Green: Make the Test Pass

**Goal**: Implement the simplest solution that makes the test pass

```javascript
// src/AddressFormatter.js
function formatBrazilianAddress(address) {
    return `${address.street}, ${address.number}, ${address.neighborhood}, ${address.city} - ${address.state}, ${address.zipCode}`;
}

module.exports = { formatBrazilianAddress };
```

**What to do:**
1. Implement the minimum code to pass the test
2. Don't worry about perfection yet
3. Run the test - it should pass (Green)
4. Commit if test passes

**Principles:**
- Keep it simple
- Don't add features not covered by tests
- Make the test pass first, optimize later

### 🔵 Refactor: Improve the Code

**Goal**: Clean up the code while keeping tests green

```javascript
// src/AddressFormatter.js
function formatBrazilianAddress(address) {
    // Refactored: handle missing components
    const components = [
        address.street,
        address.number,
        address.neighborhood,
        [address.city, address.state].filter(Boolean).join(' - '),
        address.zipCode
    ].filter(Boolean);
    
    return components.join(', ');
}

module.exports = { formatBrazilianAddress };
```

**What to do:**
1. Improve code quality, readability, performance
2. Extract functions if needed
3. Apply referential transparency principles
4. Run tests after each change - they must stay green
5. Commit when refactoring is complete

**Safe refactorings:**
- Rename variables
- Extract functions
- Remove duplication
- Improve performance
- Add immutability

## TDD Workflow

### Step-by-Step Process

```
┌─────────────────────────────────────────┐
│  1. Write a failing test (RED)          │
│     - Define expected behavior          │
│     - Test should fail                  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  2. Run the test                        │
│     - Verify it fails for right reason  │
│     - npm test                          │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  3. Write minimal code (GREEN)          │
│     - Make test pass                    │
│     - Keep it simple                    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  4. Run tests again                     │
│     - Verify test passes                │
│     - All tests should be green         │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  5. Refactor (REFACTOR)                 │
│     - Improve code quality              │
│     - Keep tests green                  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  6. Run tests after refactoring         │
│     - Ensure nothing broke              │
│     - All tests still green             │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  7. Commit                              │
│     - Save working state                │
│     - test: add feature X               │
└────────────────┬────────────────────────┘
                 │
                 ▼
                REPEAT for next feature
```

### Daily TDD Workflow

**Morning:**
```bash
# 1. Pull latest changes
git pull origin main

# 2. Run all tests to ensure clean state
npm test

# 3. Check coverage
npm run test:coverage
```

**During Development:**
```bash
# 1. Create feature branch
git checkout -b feature/address-validation

# 2. Write test (RED)
# Edit __tests__/AddressValidator.test.js

# 3. Run test - should fail
npm test AddressValidator

# 4. Write implementation (GREEN)
# Edit src/AddressValidator.js

# 5. Run test - should pass
npm test AddressValidator

# 6. Refactor (REFACTOR)
# Improve code while keeping tests green

# 7. Run all tests
npm test

# 8. Commit
git add .
git commit -m "test: add Brazilian address validation"

# 9. Repeat for next test
```

**Before Push:**
```bash
# 1. Run full test suite
npm run test:all

# 2. Check coverage hasn't decreased
npm run test:coverage

# 3. Validate code
npm run validate

# 4. Push
git push origin feature/address-validation
```

## TDD with Referential Transparency

TDD and referential transparency work together perfectly. Pure functions are easier to test, and TDD encourages writing pure functions.

### Pure Functions are Easy to Test

**Good Example: Pure Function**
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
    test('should calculate distance between two coordinates', () => {
        const coord1 = { lat: -23.550520, lon: -46.633308 }; // São Paulo
        const coord2 = { lat: -22.906847, lon: -43.172896 }; // Rio de Janeiro
        
        const distance = calculateDistance(coord1, coord2);
        
        expect(distance).toBeCloseTo(357.4, 1);
    });
    
    test('should return 0 for same coordinates', () => {
        const coord = { lat: -23.550520, lon: -46.633308 };
        
        const distance = calculateDistance(coord, coord);
        
        expect(distance).toBe(0);
    });
});
```

**Why this is easy to test:**
- No dependencies to mock
- Deterministic output
- No side effects
- Can test in isolation

### Isolate Side Effects for Testing

**Good Example: Separate Pure and Impure**
```javascript
// src/geocoding.js

// Pure function - easy to test
function buildGeocodingUrl(address) {
    const baseUrl = 'https://nominatim.openstreetmap.org/search';
    const params = new URLSearchParams({
        q: address,
        format: 'json',
        addressdetails: 1,
        limit: 1
    });
    return `${baseUrl}?${params.toString()}`;
}

// Impure function - side effect at boundary
async function fetchGeocodingData(address) {
    const url = buildGeocodingUrl(address);
    const response = await fetch(url);
    return response.json();
}

// __tests__/geocoding.test.js
describe('buildGeocodingUrl', () => {
    test('should build correct URL for Brazilian address', () => {
        const url = buildGeocodingUrl('Avenida Paulista, São Paulo');
        
        expect(url).toContain('nominatim.openstreetmap.org');
        expect(url).toContain('q=Avenida+Paulista');
        expect(url).toContain('format=json');
    });
});

describe('fetchGeocodingData', () => {
    test('should fetch geocoding data', async () => {
        // Mock the fetch at the boundary
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve([{ lat: '-23.5', lon: '-46.6' }])
            })
        );
        
        const data = await fetchGeocodingData('São Paulo');
        
        expect(data).toHaveLength(1);
        expect(data[0].lat).toBe('-23.5');
    });
});
```

**Benefits:**
- Pure `buildGeocodingUrl` tested without mocks
- Side effect (`fetch`) isolated to `fetchGeocodingData`
- Easier to test, maintain, and understand

## Best Practices

### 1. Write the Test First (Always)

❌ **Don't:**
```javascript
// Writing code first
function processAddress(address) {
    // Implementation
}

// Then writing test
test('should process address', () => {
    // Test
});
```

✅ **Do:**
```javascript
// Write test first
test('should process address', () => {
    const address = { street: 'Av. Paulista' };
    const result = processAddress(address);
    expect(result).toBeDefined();
});

// Then implement
function processAddress(address) {
    // Implementation
}
```

### 2. One Test at a Time

Focus on one behavior per test:

✅ **Good:**
```javascript
test('should format street address', () => {
    const address = { street: 'Av. Paulista', number: '1000' };
    expect(formatStreet(address)).toBe('Av. Paulista, 1000');
});

test('should handle missing street number', () => {
    const address = { street: 'Av. Paulista' };
    expect(formatStreet(address)).toBe('Av. Paulista, s/n');
});
```

❌ **Avoid:**
```javascript
test('should format address in all cases', () => {
    // Testing multiple behaviors in one test
    expect(formatStreet({ street: 'Av. Paulista', number: '1000' })).toBe('Av. Paulista, 1000');
    expect(formatStreet({ street: 'Av. Paulista' })).toBe('Av. Paulista, s/n');
    expect(formatStreet(null)).toBeNull();
});
```

### 3. Test Behavior, Not Implementation

✅ **Good: Testing behavior**
```javascript
test('should return sorted cities by name', () => {
    const cities = ['São Paulo', 'Brasília', 'Rio de Janeiro'];
    const sorted = sortCities(cities);
    
    expect(sorted[0]).toBe('Brasília');
    expect(sorted[2]).toBe('São Paulo');
});
```

❌ **Avoid: Testing implementation**
```javascript
test('should call Array.sort', () => {
    const sortSpy = jest.spyOn(Array.prototype, 'sort');
    sortCities(['São Paulo', 'Rio']);
    
    expect(sortSpy).toHaveBeenCalled(); // Implementation detail
});
```

### 4. Keep Tests Fast

- Use pure functions (no I/O)
- Mock external dependencies
- Run tests in parallel
- Use test database snapshots

```javascript
// Fast: Pure function
test('calculateDistance is fast', () => {
    const start = Date.now();
    calculateDistance({lat: 0, lon: 0}, {lat: 1, lon: 1});
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(10); // milliseconds
});
```

### 5. Test Edge Cases

Always test:
- Empty inputs
- Null/undefined
- Invalid data types
- Boundary values
- Error conditions

```javascript
describe('formatAddress edge cases', () => {
    test('should handle null address', () => {
        expect(formatAddress(null)).toBe('');
    });
    
    test('should handle empty object', () => {
        expect(formatAddress({})).toBe('');
    });
    
    test('should handle missing required fields', () => {
        expect(formatAddress({ city: 'São Paulo' })).toContain('São Paulo');
    });
});
```

### 6. Use Descriptive Test Names

✅ **Good:**
```javascript
test('should return empty string when address is null', () => { });
test('should format complete Brazilian address with all components', () => { });
test('should preserve Portuguese special characters in city names', () => { });
```

❌ **Avoid:**
```javascript
test('test 1', () => { });
test('address formatting', () => { });
test('works', () => { });
```

### 7. Follow the AAA Pattern

Structure tests as **Arrange-Act-Assert**:

```javascript
test('should calculate distance between cities', () => {
    // Arrange - Set up test data
    const saoPaulo = { lat: -23.550520, lon: -46.633308 };
    const rio = { lat: -22.906847, lon: -43.172896 };
    
    // Act - Execute the function
    const distance = calculateDistance(saoPaulo, rio);
    
    // Assert - Verify the result
    expect(distance).toBeCloseTo(357.4, 1);
});
```

### 8. Keep Tests Independent

Each test should be able to run in isolation:

✅ **Good:**
```javascript
describe('AddressCache', () => {
    let cache;
    
    beforeEach(() => {
        cache = new AddressCache(); // Fresh instance each test
    });
    
    test('should add address to cache', () => {
        cache.add('key1', { city: 'São Paulo' });
        expect(cache.get('key1')).toBeDefined();
    });
    
    test('should return null for missing key', () => {
        expect(cache.get('nonexistent')).toBeNull();
    });
});
```

## Common Patterns

### Pattern 1: Testing Pure Functions

```javascript
// src/utils.js
function formatCEP(cep) {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return null;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

// __tests__/utils.test.js
describe('formatCEP', () => {
    test('should format valid CEP', () => {
        expect(formatCEP('01310200')).toBe('01310-200');
    });
    
    test('should handle CEP with formatting', () => {
        expect(formatCEP('01310-200')).toBe('01310-200');
    });
    
    test('should return null for invalid CEP', () => {
        expect(formatCEP('123')).toBeNull();
    });
});
```

### Pattern 2: Testing with Mocks

```javascript
// __tests__/geocoding.test.js
describe('geocoding with mocks', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });
    
    afterEach(() => {
        jest.restoreAllMocks();
    });
    
    test('should handle API errors gracefully', async () => {
        global.fetch.mockRejectedValue(new Error('Network error'));
        
        const result = await safeGeocode('São Paulo');
        
        expect(result).toBeNull();
    });
});
```

### Pattern 3: Testing Async Code

```javascript
// __tests__/async.test.js
describe('async operations', () => {
    test('should resolve with address data', async () => {
        const data = await fetchAddress('01310-200');
        
        expect(data).toBeDefined();
        expect(data.city).toBe('São Paulo');
    });
    
    test('should reject with error for invalid CEP', async () => {
        await expect(fetchAddress('invalid'))
            .rejects
            .toThrow('Invalid CEP');
    });
});
```

### Pattern 4: Testing Immutability

```javascript
// __tests__/immutability.test.js
describe('immutability', () => {
    test('should not mutate original array when sorting', () => {
        const original = ['c', 'a', 'b'];
        const originalCopy = [...original];
        
        const sorted = sortArray(original);
        
        expect(original).toEqual(originalCopy); // Original unchanged
        expect(sorted).toEqual(['a', 'b', 'c']);
    });
});
```

## Examples

### Example 1: Adding a New Feature with TDD

**Feature**: Validate Brazilian phone numbers

**Step 1: Write failing test (RED)**
```javascript
// __tests__/PhoneValidator.test.js
const { isValidBrazilianPhone } = require('../src/PhoneValidator');

describe('Brazilian Phone Validator', () => {
    test('should validate mobile phone with area code', () => {
        expect(isValidBrazilianPhone('(11) 98765-4321')).toBe(true);
    });
    
    test('should reject invalid phone', () => {
        expect(isValidBrazilianPhone('123')).toBe(false);
    });
});

// Run: npm test
// Result: FAIL - function doesn't exist
```

**Step 2: Make test pass (GREEN)**
```javascript
// src/PhoneValidator.js
function isValidBrazilianPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 11 && digits.startsWith('11');
}

module.exports = { isValidBrazilianPhone };

// Run: npm test
// Result: PASS
```

**Step 3: Refactor (REFACTOR)**
```javascript
// src/PhoneValidator.js
function isValidBrazilianPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    const hasCorrectLength = digits.length === 10 || digits.length === 11;
    const hasValidAreaCode = /^[1-9]{2}/.test(digits);
    
    return hasCorrectLength && hasValidAreaCode;
}

// Run: npm test
// Result: PASS - tests still green after refactor
```

**Step 4: Add more tests**
```javascript
test('should validate landline with 10 digits', () => {
    expect(isValidBrazilianPhone('(11) 3456-7890')).toBe(true);
});

test('should reject phone with invalid area code', () => {
    expect(isValidBrazilianPhone('(00) 98765-4321')).toBe(false);
});
```

### Example 2: Refactoring with TDD

**Scenario**: Refactor impure function to be pure

**Before: Impure function**
```javascript
// Hard to test - depends on Date
function greetUser(name) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bom dia' : 'Boa tarde';
    return `${greeting}, ${name}!`;
}
```

**Step 1: Write tests for new pure function**
```javascript
// __tests__/greeting.test.js
describe('generateGreeting (pure)', () => {
    test('should generate morning greeting', () => {
        expect(generateGreeting('João', 8)).toBe('Bom dia, João!');
    });
    
    test('should generate afternoon greeting', () => {
        expect(generateGreeting('Maria', 14)).toBe('Boa tarde, Maria!');
    });
});
```

**Step 2: Implement pure function**
```javascript
// src/greeting.js
function generateGreeting(name, hour) {
    const greeting = hour < 12 ? 'Bom dia' : 'Boa tarde';
    return `${greeting}, ${name}!`;
}

function greetUser(name) {
    return generateGreeting(name, new Date().getHours());
}

module.exports = { generateGreeting, greetUser };
```

**Result**: 
- `generateGreeting` is pure and easy to test
- `greetUser` is impure but thin (delegates to pure function)
- Side effect isolated at boundary

## Integration with CI/CD

### GitHub Actions Integration

The project includes automated workflows that run tests on every push:

**`.github/workflows/modified-files.yml`** runs tests when:
- Source files change (`src/*.js`)
- Test files change (`__tests__/*.test.js`)

**Local Testing Before Push:**
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run validation
npm run validate

# Run everything
npm run test:all
```

### Test Coverage Requirements

- **Minimum coverage**: 80% for new code
- **Coverage tracked**: `src/*.js`
- **Coverage reports**: Available in CI/CD logs

### Continuous Testing

The workflow ensures:
1. Tests run on every commit
2. Failed tests block merges
3. Coverage is reported
4. Documentation updates automatically

### TDD in Pull Requests

When opening a PR:
1. ✅ All tests pass
2. ✅ New tests cover new features
3. ✅ Coverage hasn't decreased
4. ✅ Tests are well-named and clear

## Resources

### Internal Documentation

- **[TESTING.md](../TESTING.md)** - Test suite overview and configuration
- **[UNIT_TEST_GUIDE.md](./UNIT_TEST_GUIDE.md)** - Unit testing best practices
- **[REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md)** - Pure functions guide
- **[CODE_REVIEW_GUIDE.md](./CODE_REVIEW_GUIDE.md)** - Code review checklist
- **[GITHUB_ACTIONS_GUIDE.md](../docs/github/GITHUB_ACTIONS_GUIDE.md)** - CI/CD workflow guide
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines

### Architecture Examples
- **[CLASS_DIAGRAM.md](../docs/architecture/CLASS_DIAGRAM.md)** - Complete class architecture
- **[GEO_POSITION.md](../docs/architecture/GEO_POSITION.md)** - Example of well-tested class
- **[REFERENCE_PLACE.md](../docs/architecture/REFERENCE_PLACE.md)** - TDD implementation example
- **[WEBGEOCODINGMANAGER_REFACTORING.md](../docs/architecture/WEBGEOCODINGMANAGER_REFACTORING.md)** - Refactoring with tests

### Jest Documentation

- **[Jest Getting Started](https://jestjs.io/docs/getting-started)** - Official Jest docs
- **[Jest Matchers](https://jestjs.io/docs/expect)** - All available assertions
- **[Jest Mock Functions](https://jestjs.io/docs/mock-functions)** - Mocking guide

### TDD Books and Articles

- **Test Driven Development: By Example** - Kent Beck
- **Growing Object-Oriented Software, Guided by Tests** - Steve Freeman & Nat Pryce
- **Working Effectively with Legacy Code** - Michael Feathers
- **Refactoring: Improving the Design of Existing Code** - Martin Fowler

### Online Resources

- **[Test Driven Development FAQ](http://www.jamesshore.com/v2/blog/2005/test-driven-development-faq)** - James Shore
- **[The Three Laws of TDD](http://butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd)** - Uncle Bob
- **[TDD Best Practices](https://testdriven.io/test-driven-development/)** - TestDriven.io

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-08  
**Status**: ✅ Ready for use  
**Maintained by**: Guia.js Team

---

## Quick Reference Card

### TDD Commands
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
npm run test:verbose        # Detailed output
npm run validate            # Validate JS syntax
npm run test:all            # Validate + test
```

### TDD Cycle
1. 🔴 **RED** - Write failing test
2. 🟢 **GREEN** - Make it pass
3. 🔵 **REFACTOR** - Improve code
4. ✅ **COMMIT** - Save progress

### Testing Principles
- ✅ Test behavior, not implementation
- ✅ One assertion concept per test
- ✅ Tests should be fast
- ✅ Tests should be independent
- ✅ Use descriptive names
- ✅ Follow AAA pattern (Arrange-Act-Assert)
- ✅ Test edge cases

### Referential Transparency + TDD
- ✅ Pure functions are easy to test
- ✅ Isolate side effects at boundaries
- ✅ Use dependency injection
- ✅ Avoid global state
- ✅ Return new values, don't mutate
