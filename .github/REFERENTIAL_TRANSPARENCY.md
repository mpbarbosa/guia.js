# Referential Transparency in Guia.js

## Table of Contents

- [What is Referential Transparency?](#what-is-referential-transparency)
- [Why It Matters](#why-it-matters)
- [Pure vs Impure Functions](#pure-vs-impure-functions)
- [Best Practices](#best-practices)
- [Testing Referentially Transparent Code](#testing-referentially-transparent-code)
- [Common Pitfalls](#common-pitfalls)
- [Resources](#resources)

## What is Referential Transparency?

**Referential transparency** is a property of functions where an expression can be replaced with its resulting value without changing the program's behavior. A function is referentially transparent if:

1. **It always produces the same output for the same input** (deterministic)
2. **It has no observable side effects** (no mutation of external state, I/O operations, etc.)

When a function is referentially transparent, you can safely replace any function call with its result, making the code easier to reason about, test, and optimize.

### Mathematical Foundation

In mathematics, a function is referentially transparent by default:
```
f(x) = x + 2
```

If `x = 3`, then `f(3) = 5` always, and you can replace `f(3)` with `5` anywhere in your equations.

### Programming Context

In JavaScript, referential transparency means functions behave like mathematical functions:
```javascript
// Referentially transparent
function add(a, b) {
  return a + b;
}

// Can always replace add(2, 3) with 5
const result = add(2, 3) * 2;  // Same as: 5 * 2
```

## Why It Matters

### 1. **Predictability and Reasoning**

Referentially transparent code is easier to understand because you don't need to track hidden state changes:

```javascript
// Hard to reason about - not referentially transparent
let total = 0;
function addToTotal(value) {
  total += value;  // Side effect: modifies external state
  return total;
}

console.log(addToTotal(5));   // 5
console.log(addToTotal(5));   // 10 - different result!

// Easy to reason about - referentially transparent
function add(current, value) {
  return current + value;  // Pure calculation
}

console.log(add(0, 5));   // 5
console.log(add(0, 5));   // 5 - always the same!
```

### 2. **Testability**

Pure functions are trivial to test because they have no dependencies:

```javascript
// Easy to test - no setup/teardown needed
test('add function', () => {
  expect(add(2, 3)).toBe(5);
  expect(add(-1, 1)).toBe(0);
  expect(add(0, 0)).toBe(0);
});
```

### 3. **Concurrency Safety**

Referentially transparent functions are inherently thread-safe:

```javascript
// Safe for concurrent execution
const results = [1, 2, 3, 4, 5].map(x => multiply(x, 2));
// No race conditions because multiply is pure
```

### 4. **Memoization and Optimization**

Pure functions can be cached based on their inputs:

```javascript
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);  // Safe because fn is pure
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

const expensiveCalculation = memoize((n) => {
  // Complex calculation that's pure
  return n * n * n;
});
```

### 5. **Code Reusability**

Pure functions are more modular and reusable because they don't depend on external context:

```javascript
// Reusable anywhere
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}
```

## Pure vs Impure Functions

### Pure Functions (Referentially Transparent)

Pure functions satisfy two conditions:
1. **Deterministic**: Same input always produces same output
2. **No side effects**: Don't modify external state or perform I/O

#### Examples of Pure Functions

```javascript
// ✅ Pure: Simple calculation
function square(x) {
  return x * x;
}

// ✅ Pure: String manipulation
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ✅ Pure: Array transformation (creates new array)
function double(numbers) {
  return numbers.map(n => n * 2);
}

// ✅ Pure: Object transformation (creates new object)
function updateAge(person, newAge) {
  return { ...person, age: newAge };
}

// ✅ Pure: Complex calculation
function calculateTax(income, rate) {
  if (income <= 0) return 0;
  return income * (rate / 100);
}

// ✅ Pure: Composition of pure functions
function formatCurrency(amount) {
  const rounded = Math.round(amount * 100) / 100;
  return `$${rounded.toFixed(2)}`;
}
```

### Impure Functions (Not Referentially Transparent)

Impure functions have side effects or depend on external state:

#### Examples of Impure Functions

```javascript
// ❌ Impure: Modifies external state
let count = 0;
function increment() {
  count++;  // Side effect
  return count;
}

// ❌ Impure: Mutates input argument
function sortArray(arr) {
  arr.sort();  // Mutates original array
  return arr;
}

// ❌ Impure: Depends on external state
const config = { multiplier: 2 };
function calculate(x) {
  return x * config.multiplier;  // Depends on external config
}

// ❌ Impure: Uses random values
function generateId() {
  return Math.random().toString(36);  // Non-deterministic
}

// ❌ Impure: Uses current time
function getTimestamp() {
  return new Date().getTime();  // Non-deterministic
}

// ❌ Impure: Performs I/O
function saveToLocalStorage(key, value) {
  localStorage.setItem(key, value);  // Side effect (I/O)
}

// ❌ Impure: Network request
function fetchUserData(userId) {
  return fetch(`/api/users/${userId}`);  // Side effect (I/O)
}

// ❌ Impure: Logs to console
function calculateWithLogging(a, b) {
  console.log(`Calculating ${a} + ${b}`);  // Side effect (I/O)
  return a + b;
}
```

### Converting Impure to Pure

Many impure functions can be made pure by passing dependencies as parameters:

```javascript
// ❌ Impure: Depends on global config
const TAX_RATE = 0.15;
function calculateTax(income) {
  return income * TAX_RATE;
}

// ✅ Pure: Tax rate is a parameter
function calculateTax(income, taxRate) {
  return income * taxRate;
}

// ❌ Impure: Mutates array
function removeFirst(arr) {
  arr.shift();
  return arr;
}

// ✅ Pure: Returns new array
function removeFirst(arr) {
  return arr.slice(1);
}

// ❌ Impure: Uses Date.now()
function addExpiry(data) {
  return {
    ...data,
    expiresAt: Date.now() + 300000
  };
}

// ✅ Pure: Current time is a parameter
function addExpiry(data, currentTime) {
  return {
    ...data,
    expiresAt: currentTime + 300000
  };
}
```

## Best Practices

### 1. Prefer Pure Functions

Default to writing pure functions whenever possible:

```javascript
// ✅ Good: Pure function for business logic
function calculateDiscount(price, discountPercent) {
  return price * (1 - discountPercent / 100);
}

// Use impure wrapper to handle side effects
function applyDiscountAndSave(product, discountPercent) {
  const newPrice = calculateDiscount(product.price, discountPercent);
  return saveProduct({ ...product, price: newPrice });  // I/O side effect
}
```

### 2. Isolate Side Effects

Keep side effects at the boundaries of your application:

```javascript
// ✅ Core logic is pure
function validateAddress(address) {
  return address.street && address.city && address.zipCode;
}

function formatAddress(address) {
  return `${address.street}, ${address.city}, ${address.zipCode}`;
}

// Side effects only in the controller/handler
async function handleAddressSubmission(addressData) {
  if (!validateAddress(addressData)) {  // Pure
    throw new Error('Invalid address');
  }
  
  const formatted = formatAddress(addressData);  // Pure
  await saveToDatabase(formatted);  // Impure: I/O
  console.log('Address saved');  // Impure: I/O
}
```

### 3. Pass Dependencies as Parameters

Avoid hidden dependencies:

```javascript
// ❌ Bad: Hidden dependency
const apiConfig = { baseUrl: 'https://api.example.com' };
function buildUrl(endpoint) {
  return `${apiConfig.baseUrl}${endpoint}`;
}

// ✅ Good: Explicit dependency
function buildUrl(baseUrl, endpoint) {
  return `${baseUrl}${endpoint}`;
}
```

### 4. Use Immutable Data Structures

Always create new objects/arrays instead of mutating:

```javascript
// ❌ Bad: Mutations
function updateUser(user, updates) {
  Object.assign(user, updates);  // Mutates user
  return user;
}

// ✅ Good: Immutable updates
function updateUser(user, updates) {
  return { ...user, ...updates };  // Creates new object
}

// ❌ Bad: Array mutation
function addItem(cart, item) {
  cart.push(item);  // Mutates cart
  return cart;
}

// ✅ Good: Immutable array
function addItem(cart, item) {
  return [...cart, item];  // Creates new array
}
```

### 5. Separate Calculations from Effects

```javascript
// ✅ Pure calculation
function calculateRoute(start, end, waypoints) {
  // Complex route calculation
  return { distance, duration, path };
}

// ✅ Pure formatting
function formatRoute(route) {
  return {
    distanceText: `${route.distance.toFixed(2)} km`,
    durationText: `${Math.round(route.duration / 60)} min`,
    pathCoords: route.path.map(p => [p.lat, p.lng])
  };
}

// Impure orchestration
async function displayRoute(start, end, waypoints) {
  const route = calculateRoute(start, end, waypoints);  // Pure
  const formatted = formatRoute(route);  // Pure
  renderToMap(formatted);  // Impure: DOM manipulation
  await saveToHistory(formatted);  // Impure: I/O
}
```

### 6. Use Pure Validators and Transformers

```javascript
// ✅ Pure validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidCoordinate(lat, lon) {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

// ✅ Pure transformation
function normalizePhoneNumber(phone) {
  return phone.replace(/\D/g, '');
}

function sanitizeInput(input) {
  return input.trim().replace(/[<>]/g, '');
}
```

### 7. Avoid Temporal Coupling

Don't rely on function call order:

```javascript
// ❌ Bad: Temporal coupling
class UserService {
  loadUser(id) {
    this.currentUser = fetchUser(id);
  }
  
  getUserName() {
    return this.currentUser.name;  // Depends on loadUser being called first
  }
}

// ✅ Good: Explicit data flow
class UserService {
  async loadUser(id) {
    return await fetchUser(id);
  }
  
  getUserName(user) {
    return user.name;
  }
}
```

## Testing Referentially Transparent Code

### Unit Testing Pure Functions

Pure functions are the easiest to test:

```javascript
describe('calculateDistance', () => {
  test('calculates distance between two points', () => {
    const result = calculateDistance(0, 0, 1, 1);
    expect(result).toBeCloseTo(157249.6, 1);
  });
  
  test('returns 0 for same point', () => {
    expect(calculateDistance(10, 20, 10, 20)).toBe(0);
  });
  
  test('distance is symmetric', () => {
    const d1 = calculateDistance(1, 2, 3, 4);
    const d2 = calculateDistance(3, 4, 1, 2);
    expect(d1).toBe(d2);
  });
});
```

### Property-Based Testing

Referentially transparent functions are ideal for property-based testing:

```javascript
describe('pure function properties', () => {
  test('add is commutative', () => {
    // For all a, b: add(a, b) === add(b, a)
    expect(add(3, 5)).toBe(add(5, 3));
    expect(add(-2, 7)).toBe(add(7, -2));
  });
  
  test('add is associative', () => {
    // For all a, b, c: add(add(a, b), c) === add(a, add(b, c))
    expect(add(add(1, 2), 3)).toBe(add(1, add(2, 3)));
  });
  
  test('multiple calls return same result', () => {
    const input = [1, 2, 3];
    const result1 = double(input);
    const result2 = double(input);
    expect(result1).toEqual(result2);
  });
});
```

### Testing with Mock Data

Pure functions don't need complex setup:

```javascript
describe('formatAddress', () => {
  test('formats complete address', () => {
    const address = {
      street: 'Rua Augusta',
      number: '123',
      city: 'São Paulo',
      state: 'SP'
    };
    
    expect(formatAddress(address)).toBe('Rua Augusta, 123, São Paulo, SP');
  });
  
  test('handles missing number', () => {
    const address = {
      street: 'Rua Augusta',
      city: 'São Paulo',
      state: 'SP'
    };
    
    expect(formatAddress(address)).toBe('Rua Augusta, São Paulo, SP');
  });
});
```

### Checking Referential Transparency

```javascript
describe('referential transparency checks', () => {
  test('function is deterministic', () => {
    const inputs = [[1, 2], [3, 4], [-1, 0]];
    
    inputs.forEach(([a, b]) => {
      const result1 = add(a, b);
      const result2 = add(a, b);
      const result3 = add(a, b);
      
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });
  
  test('function does not modify inputs', () => {
    const original = [1, 2, 3];
    const copy = [...original];
    
    const result = double(original);
    
    expect(original).toEqual(copy);  // Input unchanged
    expect(result).not.toBe(original);  // Returns new array
  });
});
```

## Common Pitfalls

### 1. Hidden Mutations

```javascript
// ❌ Looks pure but isn't
function sortedCopy(arr) {
  return arr.sort();  // sort() mutates arr!
}

// ✅ Truly pure
function sortedCopy(arr) {
  return [...arr].sort();  // Sort a copy
}
```

### 2. Object Reference Traps

```javascript
// ❌ Shallow copy doesn't prevent nested mutations
function updateAddress(person, newStreet) {
  const updated = { ...person };
  updated.address.street = newStreet;  // Mutates original!
  return updated;
}

// ✅ Deep copy for nested properties
function updateAddress(person, newStreet) {
  return {
    ...person,
    address: { ...person.address, street: newStreet }
  };
}
```

### 3. Accidental Side Effects

```javascript
// ❌ Console.log is a side effect
function calculateTotal(items) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  console.log('Total:', total);  // Side effect!
  return total;
}

// ✅ Pure calculation
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Separate logging concern
function loggedCalculateTotal(items) {
  const total = calculateTotal(items);
  console.log('Total:', total);
  return total;
}
```

### 4. Date and Time Dependencies

```javascript
// ❌ Non-deterministic
function isExpired(expiry) {
  return new Date() > expiry;
}

// ✅ Deterministic
function isExpired(expiry, currentTime) {
  return currentTime > expiry;
}
```

### 5. Random Values

```javascript
// ❌ Non-deterministic
function generateColor() {
  return `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
}

// ✅ Deterministic (pass random source)
function generateColor(rand1, rand2, rand3) {
  return `rgb(${rand1 * 255}, ${rand2 * 255}, ${rand3 * 255})`;
}
```

## Resources

### Further Reading

- [Functional Programming in JavaScript](https://github.com/getify/Functional-Light-JS)
- [Professor Frisby's Mostly Adequate Guide to Functional Programming](https://mostly-adequate.gitbook.io/)
- [Immutable.js Documentation](https://immutable-js.com/)
- [Ramda.js - Practical Functional Library](https://ramdajs.com/)

### Related Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Immutability principles and guidelines
- [CODE_REVIEW_GUIDE.md](./CODE_REVIEW_GUIDE.md) - Review checklist for referential transparency
- [LOW_COUPLING_GUIDE.md](./LOW_COUPLING_GUIDE.md) - Architectural principles
- [HIGH_COHESION_GUIDE.md](./HIGH_COHESION_GUIDE.md) - Single responsibility principle
- [TDD_GUIDE.md](./TDD_GUIDE.md) - Test-driven development with pure functions
- [UNIT_TEST_GUIDE.md](./UNIT_TEST_GUIDE.md) - Testing referentially transparent code

### In This Project

The Guia.js project demonstrates referential transparency in several areas:

- **Distance Calculations**: `calculateDistance()` is a pure function
- **Address Formatting**: Uses immutable data transformations
- **Reference Place Types**: Frozen objects prevent mutations
- **Cache Operations**: Designed with immutability in mind
- **Observer Management**: `ObserverSubject` uses immutable array patterns (spread operator, filter) for subscribe/unsubscribe operations

For architecture examples:
- [CLASS_DIAGRAM.md](../docs/architecture/CLASS_DIAGRAM.md) - Overall architecture showing pure functions
- [GEO_POSITION.md](../docs/architecture/GEO_POSITION.md) - Example of immutable data classes
- [REFERENCE_PLACE.md](../docs/architecture/REFERENCE_PLACE.md) - Frozen objects for immutability
- [POSITION_MANAGER.md](../docs/architecture/POSITION_MANAGER.md) - ObserverSubject immutable observer management
- [WEBGEOCODINGMANAGER_REFACTORING.md](../docs/architecture/WEBGEOCODINGMANAGER_REFACTORING.md) - Refactoring toward better separation of concerns

### Academic Papers

- ["Can Programming Be Liberated from the von Neumann Style?"](https://dl.acm.org/doi/10.1145/359576.359579) - John Backus
- ["Why Functional Programming Matters"](https://www.cs.kent.ac.uk/people/staff/dat/miranda/whyfp90.pdf) - John Hughes

---

**Remember**: Referential transparency is not about dogma—it's about making code more predictable, testable, and maintainable. Use these principles as tools to write better software.
