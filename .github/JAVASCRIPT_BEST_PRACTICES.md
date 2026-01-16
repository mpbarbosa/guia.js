# JavaScript Best Practices Guide for Guia.js

## Table of Contents

- [Introduction](#introduction)
- [Core JavaScript Principles](#core-javascript-principles)
- [Functional Programming in JavaScript](#functional-programming-in-javascript)
- [Pure Functions and Referential Transparency](#pure-functions-and-referential-transparency)
- [Immutability Patterns](#immutability-patterns)
- [Variable and Constant Declarations](#variable-and-constant-declarations)
- [Function Declarations](#function-declarations)
- [Object and Array Handling](#object-and-array-handling)
- [Error Handling](#error-handling)
- [Async Programming](#async-programming)
- [Code Organization](#code-organization)
- [Naming Conventions](#naming-conventions)
- [Comments and Documentation](#comments-and-documentation)
- [Common Pitfalls and Anti-Patterns](#common-pitfalls-and-anti-patterns)
- [Performance Best Practices](#performance-best-practices)
- [Testing Considerations](#testing-considerations)
- [Resources](#resources)

## Introduction

This guide outlines JavaScript best practices specifically for the Guia Turístico project, with a strong emphasis on **functional programming**, **referential transparency**, and **immutability**. Following these practices ensures code quality, maintainability, and alignment with project principles.

### Guiding Principles

1. **Prefer pure functions** over impure ones
2. **Avoid mutations** - use immutable data structures
3. **Make side effects explicit** and isolate them
4. **Write testable code** - small, focused functions
5. **Favor composition** over complex logic
6. **Use declarative style** over imperative when possible

## Core JavaScript Principles

### 1. Use Strict Mode

Always use strict mode to catch common coding errors:

```javascript
'use strict';

// Or in ES6 modules, it's automatic
```

**Why?** Strict mode:
- Prevents accidental global variables
- Throws errors for unsafe actions
- Disables confusing features
- Makes code run faster in some engines

### 2. Understand JavaScript Types

JavaScript has 8 data types:

```javascript
// Primitive types (immutable)
const num = 42;              // Number
const str = 'hello';         // String
const bool = true;           // Boolean
const nothing = null;        // Null
const undef = undefined;     // Undefined
const sym = Symbol('id');    // Symbol
const bigNum = 9007199254740991n; // BigInt

// Reference type (mutable by default)
const obj = { name: 'Guia' }; // Object (includes arrays, functions, etc.)
```

**Best Practice**: Always know whether you're working with primitives (immutable) or objects (mutable).

### 3. Understand `this` Keyword

The value of `this` depends on how a function is called:

```javascript
// ❌ Avoid: 'this' can be confusing
const obj = {
    name: 'Guia',
    greet: function() {
        return `Hello from ${this.name}`;
    }
};

const greet = obj.greet;
greet(); // undefined - 'this' is lost!

// ✅ Prefer: Arrow functions or explicit binding
const obj = {
    name: 'Guia',
    greet: () => `Hello from Guia`  // Lexical this
};

// Or use pure functions that don't rely on 'this'
const greet = (name) => `Hello from ${name}`;
greet(obj.name); // ✅ Pure and predictable
```

**Best Practice**: Avoid `this` when possible. Use pure functions with explicit parameters instead.

## Functional Programming in JavaScript

### 1. First-Class Functions

Functions are values in JavaScript - use this to your advantage:

```javascript
// Functions can be assigned to variables
const add = (a, b) => a + b;

// Functions can be passed as arguments
const applyOperation = (x, y, operation) => operation(x, y);
applyOperation(5, 3, add); // 8

// Functions can be returned from other functions
const createMultiplier = (factor) => (value) => value * factor;
const double = createMultiplier(2);
double(5); // 10
```

### 2. Higher-Order Functions

Use built-in array methods for declarative code:

```javascript
// ✅ Good: Declarative, functional style
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);

// ❌ Avoid: Imperative loops (when functional alternatives exist)
const doubled = [];
for (let i = 0; i < numbers.length; i++) {
    doubled.push(numbers[i] * 2);
}
```

**Best Practice**: Use `map`, `filter`, `reduce`, `find`, `some`, `every` instead of `for` loops when processing arrays.

### 3. Function Composition

Build complex logic from simple functions:

```javascript
// Small, focused functions
const trim = str => str.trim();
const lowercase = str => str.toLowerCase();
const removeSpaces = str => str.replace(/\s+/g, '');

// Compose them together
const normalizeInput = (str) => removeSpaces(lowercase(trim(str)));

normalizeInput('  Hello World  '); // 'helloworld'

// Or use a compose utility
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);
const normalizeInput = compose(removeSpaces, lowercase, trim);
```

## Pure Functions and Referential Transparency

### 1. What Makes a Function Pure?

A pure function must:
1. Always return the same output for the same input
2. Have no side effects

```javascript
// ✅ Pure function
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

// ❌ Impure function - accesses external state
let counter = 0;
const getNextId = () => {
    return counter++; // Side effect!
};

// ✅ Pure alternative - state is a parameter
const getNextId = (currentCounter) => currentCounter + 1;
```

### 2. Benefits of Pure Functions

```javascript
// Easy to test
test('calculateDistance returns 0 for same coordinates', () => {
    expect(calculateDistance(0, 0, 0, 0)).toBe(0);
});

// Easy to reason about
const distance1 = calculateDistance(lat1, lon1, lat2, lon2);
const distance2 = calculateDistance(lat1, lon1, lat2, lon2);
// distance1 === distance2 always!

// Can be memoized for performance
const memoize = (fn) => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};

const cachedDistance = memoize(calculateDistance);
```

### 3. Isolating Side Effects

When side effects are necessary, isolate them:

```javascript
// ✅ Good: Pure logic separated from I/O
const extractAddressData = (rawData) => {
    // Pure transformation
    return {
        street: rawData.address?.road || '',
        neighborhood: rawData.address?.suburb || '',
        city: rawData.address?.city || ''
    };
};

const fetchAndExtractAddress = async (lat, lon) => {
    // Impure: I/O operation isolated to single function
    const rawData = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`).then(r => r.json());
    
    // Call pure function for data transformation
    return extractAddressData(rawData);
};
```

**Best Practice**: Keep the pure/impure boundary clear. Pure functions in the core, side effects at the edges.

## Immutability Patterns

### 1. Never Mutate Objects

```javascript
// ❌ Bad: Mutation
const updateAddress = (address, city) => {
    address.city = city; // Mutates original!
    return address;
};

// ✅ Good: Create new object
const updateAddress = (address, city) => {
    return { ...address, city }; // New object with updated city
};

// ✅ Also good: Explicit object creation
const updateAddress = (address, city) => {
    return Object.assign({}, address, { city });
};
```

### 2. Never Mutate Arrays

```javascript
// ❌ Bad: Mutation
const addItem = (items, newItem) => {
    items.push(newItem); // Mutates original!
    return items;
};

// ✅ Good: Create new array
const addItem = (items, newItem) => {
    return [...items, newItem];
};

// More examples
const removeItem = (items, index) => [
    ...items.slice(0, index),
    ...items.slice(index + 1)
];

const updateItem = (items, index, newValue) => [
    ...items.slice(0, index),
    newValue,
    ...items.slice(index + 1)
];

const updateItem = (items, index, newValue) =>
    items.map((item, i) => i === index ? newValue : item);
```

### 3. Deep Immutability

For nested structures, ensure deep immutability:

```javascript
// ❌ Shallow copy doesn't protect nested objects
const updateNestedAddress = (person, city) => {
    const newPerson = { ...person };
    newPerson.address.city = city; // Still mutates!
    return newPerson;
};

// ✅ Deep immutability with spread operator
const updateNestedAddress = (person, city) => {
    return {
        ...person,
        address: {
            ...person.address,
            city
        }
    };
};

// ✅ For complex structures, consider using libraries like Immer or Immutable.js
```

### 4. Defensive Copying

Protect against external mutations in constructors:

```javascript
// From GeoPosition class example
class GeoPosition {
    constructor(position) {
        // ✅ Defensive copy - don't share reference
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.accuracy = position.coords.accuracy;
        // ... copy all properties individually
        
        // ❌ Would be bad: this.coords = position.coords; (shares reference)
    }
}
```

## Variable and Constant Declarations

### 1. Prefer `const` Over `let`

```javascript
// ✅ Use const for values that won't be reassigned
const PI = 3.14159;
const MAX_RETRY = 3;
const config = { apiUrl: 'https://api.example.com' };

// ✅ Use const even for arrays and objects (prevents reassignment)
const items = [1, 2, 3];
items.push(4); // OK - modifying content (but prefer immutable patterns)
// items = [5, 6]; // Error - can't reassign

// Use let only when reassignment is necessary
let counter = 0;
counter++; // Reassignment needed
```

**Why?** `const` signals intent and prevents accidental reassignment.

### 2. Never Use `var`

```javascript
// ❌ Bad: var has function scope and hoisting issues
var name = 'Guia';

// ✅ Good: const/let have block scope
const name = 'Guia';
```

### 3. One Declaration Per Line

```javascript
// ❌ Avoid: Multiple declarations on one line
const x = 1, y = 2, z = 3;

// ✅ Good: One per line
const x = 1;
const y = 2;
const z = 3;
```

### 4. Initialize Variables

```javascript
// ❌ Avoid: Uninitialized variables
let result;
if (condition) {
    result = calculate();
}

// ✅ Good: Initialize at declaration
const result = condition ? calculate() : defaultValue;
```

## Function Declarations

### 1. Prefer Arrow Functions

```javascript
// ✅ Arrow functions for simple operations
const add = (a, b) => a + b;
const square = x => x * x; // Single param, no parens needed
const greet = () => 'Hello'; // No params, need parens

// Arrow functions in callbacks
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);
```

### 2. Use Function Expressions for Named Functions

```javascript
// ✅ For functions that need a name (useful for debugging/recursion)
const factorial = function factorial(n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
};

// ✅ Arrow function version (but can't reference itself by name)
const factorial = n => n <= 1 ? 1 : n * factorial(n - 1);
```

### 3. Avoid Function Declarations (in most cases)

```javascript
// ❌ Avoid: Function declarations are hoisted
function calculateDistance(lat1, lon1, lat2, lon2) {
    // ...
}

// ✅ Prefer: const with arrow function
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // ...
};
```

**Why?** Hoisting can lead to confusing behavior. const declarations are not hoisted.

### 4. Keep Functions Small and Focused

```javascript
// ❌ Bad: Function does too much
const processAddress = (rawData) => {
    const street = rawData.address?.road || '';
    const number = rawData.address?.house_number || '';
    const city = rawData.address?.city || '';
    const formatted = `${street}, ${number}, ${city}`;
    console.log('Address processed:', formatted);
    saveToDatabase(formatted);
    return formatted;
};

// ✅ Good: Separate concerns
const extractAddress = (rawData) => ({
    street: rawData.address?.road || '',
    number: rawData.address?.house_number || '',
    city: rawData.address?.city || ''
});

const formatAddress = (address) =>
    `${address.street}, ${address.number}, ${address.city}`;

const processAddress = (rawData) => {
    const address = extractAddress(rawData);
    return formatAddress(address);
};

// Side effects isolated
const processAndSaveAddress = async (rawData) => {
    const formatted = processAddress(rawData);
    console.log('Address processed:', formatted);
    await saveToDatabase(formatted);
    return formatted;
};
```

### 5. Use Default Parameters

```javascript
// ✅ Default parameters make intent clear
const greet = (name = 'Guest') => `Hello, ${name}!`;

const fetchData = (url, options = {}) => {
    const finalOptions = { timeout: 5000, ...options };
    return fetch(url, finalOptions);
};

// ❌ Avoid: Manual default assignment
const greet = (name) => {
    name = name || 'Guest'; // Fails for falsy values like 0, ''
    return `Hello, ${name}!`;
};
```

### 6. Use Rest Parameters

```javascript
// ✅ Rest parameters for variable arguments
const sum = (...numbers) => numbers.reduce((acc, n) => acc + n, 0);
sum(1, 2, 3); // 6
sum(1, 2, 3, 4, 5); // 15

// ❌ Avoid: arguments object
function sum() {
    // arguments is array-like but not an array
    return Array.from(arguments).reduce((acc, n) => acc + n, 0);
}
```

## Object and Array Handling

### 1. Object Destructuring

```javascript
// ✅ Destructure to extract properties
const { latitude, longitude, accuracy } = position.coords;

// With renaming
const { latitude: lat, longitude: lon } = position.coords;

// With defaults
const { city = 'Unknown', country = 'Brazil' } = address;

// Nested destructuring
const { coords: { latitude, longitude } } = position;
```

### 2. Array Destructuring

```javascript
// ✅ Destructure arrays
const [first, second, ...rest] = [1, 2, 3, 4, 5];
// first = 1, second = 2, rest = [3, 4, 5]

// Skip elements
const [first, , third] = [1, 2, 3];
// first = 1, third = 3
```

### 3. Spread Operator

```javascript
// ✅ Object spread
const defaults = { timeout: 5000, retries: 3 };
const options = { ...defaults, timeout: 10000 };
// { timeout: 10000, retries: 3 }

// ✅ Array spread
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];
// [1, 2, 3, 4, 5, 6]

// ✅ Function arguments
const numbers = [1, 2, 3];
Math.max(...numbers); // 3
```

### 4. Object Shorthand

```javascript
// ✅ Property shorthand
const name = 'Guia';
const version = '0.8.5';
const obj = { name, version };
// Same as: { name: name, version: version }

// ✅ Method shorthand
const obj = {
    calculate(x, y) {
        return x + y;
    }
};
// Same as: calculate: function(x, y) { return x + y; }
```

### 5. Computed Property Names

```javascript
// ✅ Dynamic property names
const propName = 'latitude';
const obj = {
    [propName]: -23.5505,
    [`computed_${propName}`]: -23.5505
};
// { latitude: -23.5505, computed_latitude: -23.5505 }
```

### 6. Optional Chaining

```javascript
// ✅ Safe property access
const city = rawData?.address?.city;
const firstItem = items?.[0];
const result = obj?.method?.();

// ❌ Avoid: Manual null checks
const city = rawData && rawData.address && rawData.address.city;
```

### 7. Nullish Coalescing

```javascript
// ✅ Nullish coalescing - only for null/undefined
const timeout = config.timeout ?? 5000;

// ❌ Avoid: || operator (fails for 0, '', false)
const timeout = config.timeout || 5000; // If timeout is 0, uses 5000!
```

## Error Handling

### 1. Use Try-Catch for Async Operations

```javascript
// ✅ Good: Handle errors explicitly
const fetchAddress = async (lat, lon) => {
    try {
        const response = await fetch(getOpenStreetMapUrl(lat, lon));
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch address:', error);
        throw error; // Re-throw or return default
    }
};
```

### 2. Return Error Objects Instead of Throwing

For pure functions, consider returning error objects:

```javascript
// ✅ Pure error handling
const parseCoordinates = (input) => {
    if (typeof input !== 'string') {
        return { error: 'Input must be a string' };
    }
    
    const parts = input.split(',');
    if (parts.length !== 2) {
        return { error: 'Invalid format' };
    }
    
    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);
    
    if (isNaN(lat) || isNaN(lon)) {
        return { error: 'Invalid numbers' };
    }
    
    return { latitude: lat, longitude: lon };
};

// Usage
const result = parseCoordinates(input);
if (result.error) {
    // Handle error
} else {
    // Use result.latitude and result.longitude
}
```

### 3. Validate Input Early

```javascript
// ✅ Guard clauses at the start
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (typeof lat1 !== 'number' || typeof lon1 !== 'number' ||
        typeof lat2 !== 'number' || typeof lon2 !== 'number') {
        throw new TypeError('All coordinates must be numbers');
    }
    
    if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90) {
        throw new RangeError('Latitude must be between -90 and 90');
    }
    
    if (lon1 < -180 || lon1 > 180 || lon2 < -180 || lon2 > 180) {
        throw new RangeError('Longitude must be between -180 and 180');
    }
    
    // Main logic here
    // ...
};
```

### 4. Create Custom Error Types

```javascript
// ✅ Custom errors for specific cases
class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}

class NetworkError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'NetworkError';
        this.statusCode = statusCode;
    }
}

// Usage
throw new ValidationError('Invalid coordinates', 'latitude');
```

## Async Programming

### 1. Prefer async/await Over Promises

```javascript
// ✅ Good: async/await is more readable
const fetchAddressData = async (lat, lon) => {
    const response = await fetch(getUrl(lat, lon));
    const data = await response.json();
    return extractAddress(data);
};

// ❌ Avoid: Promise chains (when async/await works)
const fetchAddressData = (lat, lon) => {
    return fetch(getUrl(lat, lon))
        .then(response => response.json())
        .then(data => extractAddress(data));
};
```

### 2. Handle Errors in Async Functions

```javascript
// ✅ Always use try-catch with async/await
const fetchData = async () => {
    try {
        const data = await fetch(url);
        return data;
    } catch (error) {
        console.error('Fetch failed:', error);
        return null;
    }
};
```

### 3. Use Promise.all for Parallel Operations

```javascript
// ✅ Parallel execution
const fetchMultipleAddresses = async (locations) => {
    const promises = locations.map(loc => fetchAddress(loc.lat, loc.lon));
    return await Promise.all(promises);
};

// ❌ Avoid: Sequential when parallel is possible
const fetchMultipleAddresses = async (locations) => {
    const results = [];
    for (const loc of locations) {
        results.push(await fetchAddress(loc.lat, loc.lon)); // Waits for each!
    }
    return results;
};
```

### 4. Create Delays with Promises

```javascript
// ✅ Promise-based delay utility
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Usage
await delay(1000); // Wait 1 second
```

## Code Organization

### 1. Module Organization

```javascript
// ✅ Good module structure
// 1. Constants and configuration
const DEFAULT_TIMEOUT = 5000;
const API_BASE_URL = 'https://api.example.com';

// 2. Pure utility functions
const formatDate = (date) => {
    // ...
};

// 3. Classes and complex logic
class GeoPosition {
    // ...
}

// 4. Exports at the end
module.exports = {
    GeoPosition,
    formatDate,
    DEFAULT_TIMEOUT
};
```

### 2. Group Related Functionality

```javascript
// ✅ Group related functions together
// --- Address Extraction ---
const extractStreet = (data) => data.address?.road || '';
const extractCity = (data) => data.address?.city || '';
const extractNeighborhood = (data) => data.address?.suburb || '';

// --- Address Formatting ---
const formatBrazilianAddress = (address) => {
    // ...
};

// --- Address Validation ---
const isValidCEP = (cep) => /^\d{5}-?\d{3}$/.test(cep);
```

### 3. Avoid Deep Nesting

```javascript
// ❌ Bad: Deep nesting (pyramid of doom)
const processAddress = (data) => {
    if (data) {
        if (data.address) {
            if (data.address.city) {
                return formatAddress(data.address);
            }
        }
    }
    return null;
};

// ✅ Good: Early returns
const processAddress = (data) => {
    if (!data) return null;
    if (!data.address) return null;
    if (!data.address.city) return null;
    
    return formatAddress(data.address);
};

// ✅ Even better: Optional chaining
const processAddress = (data) => {
    if (!data?.address?.city) return null;
    return formatAddress(data.address);
};
```

## Naming Conventions

### 1. Use Descriptive Names

```javascript
// ❌ Bad: Cryptic names
const d = new Date();
const calc = (a, b) => a + b;

// ✅ Good: Clear, descriptive names
const currentDate = new Date();
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // ...
};
```

### 2. Naming Patterns

```javascript
// Variables and functions: camelCase
const userProfile = {};
const fetchUserData = () => {};

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';

// Classes: PascalCase
class GeoPosition {}
class AddressExtractor {}

// Private properties/methods: prefix with underscore
class MyClass {
    _privateMethod() {}
    publicMethod() {}
}

// Boolean variables: use is/has/can prefix
const isValid = true;
const hasError = false;
const canProceed = true;
```

### 3. Function Names Should Be Verbs

```javascript
// ✅ Good: Verb-based function names
const calculateDistance = () => {};
const fetchAddress = () => {};
const formatDate = () => {};
const validateInput = () => {};

// ❌ Avoid: Noun-based function names
const distance = () => {}; // Unclear if it's a getter or calculator
const address = () => {}; // Is this fetching or formatting?
```

### 4. Use Meaningful Context

```javascript
// ❌ Bad: No context
const street = data.road;
const number = data.house_number;

// ✅ Good: Context in name
const addressStreet = data.address.road;
const addressNumber = data.address.house_number;

// ✅ Even better: Destructuring provides context
const {
    road: street,
    house_number: number
} = data.address;
```

## Comments and Documentation

### 1. Write Self-Documenting Code

```javascript
// ❌ Bad: Comments explain what code does
// Add the two numbers together
const result = a + b;

// ✅ Good: Code is self-explanatory
const totalDistance = previousDistance + newDistance;
```

### 2. Use JSDoc for Public APIs

```javascript
/**
 * Calculates the great-circle distance between two geographic points.
 * 
 * @param {number} lat1 - Latitude of first point in decimal degrees (-90 to 90)
 * @param {number} lon1 - Longitude of first point in decimal degrees (-180 to 180)
 * @param {number} lat2 - Latitude of second point in decimal degrees (-90 to 90)
 * @param {number} lon2 - Longitude of second point in decimal degrees (-180 to 180)
 * @returns {number} Distance in meters between the two points
 * 
 * @example
 * const distance = calculateDistance(-23.5505, -46.6333, -22.9068, -43.1729);
 * console.log(distance); // ~357,710 meters
 * 
 * @see {@link https://en.wikipedia.org/wiki/Haversine_formula}
 * @since 0.7.1-alpha
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Implementation
};
```

### 3. Comment Why, Not What

```javascript
// ❌ Bad: Explains what (obvious from code)
// Loop through array
for (const item of items) {
    // ...
}

// ✅ Good: Explains why (non-obvious reasoning)
// Use haversine formula instead of euclidean distance because
// we need to account for Earth's curvature for accurate results
const distance = calculateHaversineDistance(lat1, lon1, lat2, lon2);
```

### 4. Use TODO Comments Sparingly

```javascript
// ✅ Good: TODO with context and owner
// TODO(mpbarbosa): Implement caching for repeated distance calculations
// See issue #123 for requirements

// ❌ Avoid: Vague TODOs
// TODO: fix this
// TODO: optimize
```

## Common Pitfalls and Anti-Patterns

### 1. Truthy/Falsy Confusion

```javascript
// ❌ Pitfall: Using || for default values
const timeout = options.timeout || 5000;
// Problem: If timeout is 0, uses 5000!

// ✅ Solution: Use nullish coalescing
const timeout = options.timeout ?? 5000;
// Only uses 5000 if timeout is null or undefined
```

### 2. Array Mutation Methods

```javascript
// ❌ Methods that mutate arrays
const items = [1, 2, 3];
items.push(4);        // Mutates
items.pop();          // Mutates
items.shift();        // Mutates
items.unshift(0);     // Mutates
items.splice(1, 1);   // Mutates
items.reverse();      // Mutates
items.sort();         // Mutates

// ✅ Immutable alternatives
const withAdded = [...items, 4];
const withoutLast = items.slice(0, -1);
const withoutFirst = items.slice(1);
const withFirst = [0, ...items];
const withoutIndex = [...items.slice(0, 1), ...items.slice(2)];
const reversed = [...items].reverse(); // Copy first!
const sorted = [...items].sort();      // Copy first!
```

### 3. Object Reference Issues

```javascript
// ❌ Pitfall: Comparing objects by reference
const obj1 = { x: 1 };
const obj2 = { x: 1 };
obj1 === obj2; // false! Different references

// ✅ Solution: Deep comparison or serialize
JSON.stringify(obj1) === JSON.stringify(obj2); // true

// Or use a library like lodash
// _.isEqual(obj1, obj2);
```

### 4. Floating Point Precision

```javascript
// ❌ Pitfall: Direct comparison of floating point numbers
0.1 + 0.2 === 0.3; // false! (0.30000000000000004)

// ✅ Solution: Use epsilon comparison
const EPSILON = 0.0001;
Math.abs((0.1 + 0.2) - 0.3) < EPSILON; // true

// Or use toBeCloseTo in tests
expect(0.1 + 0.2).toBeCloseTo(0.3, 10);
```

### 5. Accidental Global Variables

```javascript
// ❌ Pitfall: Missing const/let creates global
function bad() {
    counter = 0; // Global variable created!
}

// ✅ Solution: Always use const/let
function good() {
    const counter = 0; // Local variable
}
```

### 6. Callback Hell

```javascript
// ❌ Callback pyramid of doom
fetchUser(userId, (user) => {
    fetchPosts(user.id, (posts) => {
        fetchComments(posts[0].id, (comments) => {
            // Nested callbacks are hard to read
        });
    });
});

// ✅ Use async/await
const processUserContent = async (userId) => {
    const user = await fetchUser(userId);
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    return { user, posts, comments };
};
```

### 7. Not Handling Promise Rejections

```javascript
// ❌ Unhandled promise rejection
fetchData(); // If it rejects, unhandled!

// ✅ Always handle rejections
fetchData().catch(error => console.error(error));

// Or with async/await
const getData = async () => {
    try {
        return await fetchData();
    } catch (error) {
        console.error(error);
        return null;
    }
};
```

## Performance Best Practices

### 1. Avoid Premature Optimization

```javascript
// ❌ Bad: Premature micro-optimizations
const items = [1, 2, 3];
const len = items.length; // "Optimization" that adds no value
for (let i = 0; i < len; i++) {
    // ...
}

// ✅ Good: Readable code first
for (const item of items) {
    // ...
}

// ✅ Even better: Functional style
items.forEach(item => {
    // ...
});
```

### 2. Memoization for Expensive Calculations

```javascript
// ✅ Memoize pure functions with expensive calculations
const memoize = (fn) => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};

const expensiveCalculation = memoize((a, b) => {
    // Expensive operation
    return a * b;
});
```

### 3. Debounce Frequent Operations

```javascript
// ✅ Debounce for events that fire frequently
const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

// Usage: Wait 300ms after last keystroke
const handleSearch = debounce((query) => {
    fetchSearchResults(query);
}, 300);
```

### 4. Use Appropriate Data Structures

```javascript
// ✅ Use Map for key-value lookups
const userMap = new Map([
    ['id1', { name: 'Alice' }],
    ['id2', { name: 'Bob' }]
]);
userMap.get('id1'); // O(1) lookup

// ✅ Use Set for unique values
const uniqueIds = new Set([1, 2, 2, 3, 3]);
// Set(3) {1, 2, 3}
uniqueIds.has(2); // O(1) lookup
```

## Testing Considerations

### 1. Write Testable Code

```javascript
// ❌ Hard to test: Side effects mixed with logic
const processAndSave = (data) => {
    const processed = transform(data);
    database.save(processed); // Side effect!
    return processed;
};

// ✅ Easy to test: Pure logic separated
const processData = (data) => {
    return transform(data);
};

const saveData = (data) => {
    database.save(data);
};

// Test only the pure part
test('processData transforms correctly', () => {
    expect(processData(input)).toEqual(expected);
});
```

### 2. Favor Dependency Injection

```javascript
// ❌ Hard to test: Hard-coded dependencies
const fetchAddress = async (lat, lon) => {
    const data = await fetch(url); // Can't mock!
    return data;
};

// ✅ Easy to test: Injected dependencies
const fetchAddress = async (lat, lon, fetcher = fetch) => {
    const data = await fetcher(url);
    return data;
};

// Test with mock
test('fetchAddress works', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ /* ... */ });
    await fetchAddress(0, 0, mockFetch);
    expect(mockFetch).toHaveBeenCalled();
});
```

### 3. Keep Tests Focused

```javascript
// ✅ One assertion per test
test('calculateDistance returns 0 for same coordinates', () => {
    expect(calculateDistance(0, 0, 0, 0)).toBe(0);
});

test('calculateDistance returns positive for different coordinates', () => {
    expect(calculateDistance(0, 0, 1, 1)).toBeGreaterThan(0);
});

// ❌ Avoid: Multiple unrelated assertions
test('calculateDistance works', () => {
    expect(calculateDistance(0, 0, 0, 0)).toBe(0);
    expect(calculateDistance(0, 0, 1, 1)).toBeGreaterThan(0);
    expect(calculateDistance(-90, 0, 90, 0)).toBeCloseTo(20000000, -3);
});
```

## Resources

### Guia.js Documentation

- **[REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md)** - Deep dive into pure functions
- **[CODE_REVIEW_GUIDE.md](./CODE_REVIEW_GUIDE.md)** - Code review checklist
- **[UNIT_TEST_GUIDE.md](./UNIT_TEST_GUIDE.md)** - Unit testing best practices
- **[TDD_GUIDE.md](./TDD_GUIDE.md)** - Test-driven development
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines

### External Resources

#### JavaScript Best Practices
- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [JavaScript: The Good Parts](http://shop.oreilly.com/product/9780596517748.do)
- [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS)

#### Functional Programming
- [Professor Frisby's Mostly Adequate Guide](https://mostly-adequate.gitbook.io/)
- [Functional-Light JavaScript](https://github.com/getify/Functional-Light-JS)
- [Ramda.js - Functional Library](https://ramdajs.com/)

#### ES6+ Features
- [ES6 Features](http://es6-features.org/)
- [Exploring ES6](https://exploringjs.com/es6/)
- [2ality - JavaScript Blog](https://2ality.com/)

#### Style Guides
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
- [StandardJS](https://standardjs.com/)

---

**Related Guidelines:**
- For code review: [CODE_REVIEW_GUIDE.md](./CODE_REVIEW_GUIDE.md)
- For testing: [UNIT_TEST_GUIDE.md](./UNIT_TEST_GUIDE.md), [TDD_GUIDE.md](./TDD_GUIDE.md)
- For functional programming: [REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md)
- For architecture: [docs/architecture/CLASS_DIAGRAM.md](../docs/architecture/CLASS_DIAGRAM.md)

---

*This guide is part of the Guia Turístico project documentation. For questions or suggestions, please open an issue.*
