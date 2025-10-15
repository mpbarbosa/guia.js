# JavaScript and ECMAScript Version Features

**Complete reference guide for JavaScript developers and GitHub Copilot**

## Table of Contents

- [Overview](#overview)
- [Version Timeline](#version-timeline)
- [ECMAScript Versions](#ecmascript-versions)
- [Browser Compatibility](#browser-compatibility)
- [Feature Support Matrix](#feature-support-matrix)
- [Best Practices](#best-practices)
- [Related Documentation](#related-documentation)

## Overview

This document provides a comprehensive summary of main features introduced in each JavaScript and ECMAScript version. It serves as a quick reference for developers and is optimized for GitHub Copilot understanding.

**Key Points:**
- **JavaScript** is the programming language
- **ECMAScript** is the specification that JavaScript implements
- **TC39** is the committee that develops ECMAScript
- Starting with ES2015, new versions are released **annually**

## Version Timeline

| Version | Release Date | Common Name | Major Features |
|---------|--------------|-------------|----------------|
| ES1 | June 1997 | ECMAScript 1 | Foundation |
| ES2 | June 1998 | ECMAScript 2 | Editorial changes |
| ES3 | December 1999 | ECMAScript 3 | Regex, try/catch |
| ES4 | Abandoned | - | Never released |
| ES5 | December 2009 | ECMAScript 5 | Strict mode, JSON, Array methods |
| ES5.1 | June 2011 | ECMAScript 5.1 | ISO alignment |
| ES6 | June 2015 | ES2015, ES6 | Classes, modules, arrows, promises |
| ES7 | June 2016 | ES2016 | Exponentiation, includes |
| ES8 | June 2017 | ES2017 | Async/await |
| ES9 | June 2018 | ES2018 | Object spread, async iteration |
| ES10 | June 2019 | ES2019 | flat, fromEntries |
| ES11 | June 2020 | ES2020 | Optional chaining, nullish coalescing |
| ES12 | June 2021 | ES2021 | Logical assignment, numeric separators |
| ES13 | June 2022 | ES2022 | Top-level await, class fields |
| ES14 | June 2023 | ES2023 | toSorted, findLast |
| ES15 | June 2024 | ES2024 | groupBy, Promise.withResolvers |

---

## ECMAScript Versions

### ES3 (1999) - Regular Expressions and Error Handling

**Major Features:**
- Regular expressions
- try/catch/finally exception handling
- switch statement
- do-while loops

**Example:**
```javascript
// Regular expressions
const pattern = /\d{3}-\d{4}/;
console.log(pattern.test("555-1234")); // true

// Error handling
try {
  throw new Error("Something went wrong");
} catch (error) {
  console.error(error.message);
}
```

---

### ES5 (2009) - Strict Mode and Array Methods

**Major Features:**
- Strict mode (\`"use strict"\`)
- JSON support (parse, stringify)
- Array methods: forEach, map, filter, reduce
- Object methods: create, keys, freeze
- Property getters/setters
- Function.bind()

**Examples:**
```javascript
"use strict";

// Array methods (functional programming)
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2); // [2, 4, 6, 8, 10]
const evens = numbers.filter(n => n % 2 === 0); // [2, 4]
const sum = numbers.reduce((acc, n) => acc + n, 0); // 15

// JSON
const obj = { name: "Alice", age: 30 };
const json = JSON.stringify(obj);
const parsed = JSON.parse(json);

// Object.freeze (immutability)
const immutable = Object.freeze({ x: 1 });
```

**Referential Transparency:** Array methods (map, filter, reduce) encourage pure functions.

---

### ES6/ES2015 (2015) - Modern JavaScript Begins

**Major Features:**
- Arrow functions (\`=>\`)
- Classes
- Modules (import/export)
- Template literals
- Destructuring
- Default parameters
- Rest/spread operators (\`...\`)
- let and const (block scope)
- Promises
- Generators (\`function*\`)
- Map and Set
- for...of loops

**Examples:**

**Arrow Functions:**
```javascript
// Concise syntax
const add = (a, b) => a + b;
const double = x => x * 2;

// Lexical 'this'
class Timer {
  constructor() { this.seconds = 0; }
  start() {
    setInterval(() => this.seconds++, 1000);
  }
}
```

**Classes:**
```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return \`Hello, I'm \${this.name}\`;
  }
}

class Developer extends Person {
  constructor(name, language) {
    super(name);
    this.language = language;
  }
}
```

**Modules:**
```javascript
// math.js
export const PI = 3.14159;
export const add = (a, b) => a + b;

// app.js
import { PI, add } from './math.js';
```

**Template Literals:**
```javascript
const name = "Alice";
const age = 30;
const message = \`Hello, \${name}! You are \${age} years old.\`;
```

**Destructuring:**
```javascript
// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];

// Object destructuring
const { name, age } = { name: "Alice", age: 30 };

// Function parameters
function greet({ name, age }) {
  return \`\${name} is \${age} years old\`;
}
```

**Spread Operator:**
```javascript
// Array spread
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]

// Object spread
const person = { name: "Alice" };
const employee = { ...person, role: "Developer" };
```

**Promises:**
```javascript
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve({ data: "Hello" }), 1000);
  });
};

fetchData()
  .then(result => console.log(result.data))
  .catch(error => console.error(error));
```

**Map and Set:**
```javascript
// Map
const map = new Map();
map.set('name', 'Alice');
map.set(42, 'answer');

// Set (unique values)
const set = new Set([1, 2, 3, 2, 1]);
console.log([...set]); // [1, 2, 3]
```

---

### ES2016 (ES7) - Small Improvements

**Major Features:**
- Exponentiation operator (\`**\`)
- Array.includes()

**Examples:**
```javascript
// Exponentiation
console.log(2 ** 3); // 8

// Array.includes
const arr = [1, 2, 3, NaN];
console.log(arr.includes(2)); // true
console.log(arr.includes(NaN)); // true (unlike indexOf)
```

---

### ES2017 (ES8) - Async/Await

**Major Features:**
- async/await
- Object.values(), Object.entries()
- String.padStart(), padEnd()
- Object.getOwnPropertyDescriptors()
- Trailing commas in function parameters

**Examples:**

**Async/Await:**
```javascript
// Clean async code
async function fetchUserData() {
  const response = await fetch('/api/user');
  const user = await response.json();
  return user;
}

// Error handling
async function fetchData() {
  try {
    const data = await fetch('/api/data').then(r => r.json());
    return data;
  } catch (error) {
    console.error('Failed:', error);
  }
}
```

**Object Methods:**
```javascript
const person = { name: 'Alice', age: 30 };

// Object.values
console.log(Object.values(person)); // ['Alice', 30]

// Object.entries
console.log(Object.entries(person)); 
// [['name', 'Alice'], ['age', 30]]

// Iterate entries
for (const [key, value] of Object.entries(person)) {
  console.log(\`\${key}: \${value}\`);
}
```

**String Padding:**
```javascript
const str = "5";
console.log(str.padStart(3, "0")); // "005"
console.log("Loading".padEnd(10, ".")); // "Loading..."
```

---

### ES2018 (ES9) - Object Spread and Async Iteration

**Major Features:**
- Rest/spread for objects
- Async iteration (for await...of)
- Promise.finally()
- RegExp improvements

**Examples:**

**Object Spread:**
```javascript
// Spread operator
const person = { name: 'Alice', age: 30 };
const employee = { ...person, role: 'Developer' };

// Rest destructuring
const { name, ...rest } = person;

// Immutable update
const updated = { ...person, age: 31 };
```

**Async Iteration:**
```javascript
async function* asyncGenerator() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
}

async function process() {
  for await (const value of asyncGenerator()) {
    console.log(value);
  }
}
```

**Promise.finally():**
```javascript
fetch('/api/data')
  .then(r => r.json())
  .catch(err => console.error(err))
  .finally(() => console.log('Done')); // Always runs
```

---

### ES2019 (ES10) - Array Flat and Object.fromEntries

**Major Features:**
- Array.flat(), flatMap()
- Object.fromEntries()
- String.trimStart(), trimEnd()
- Optional catch binding

**Examples:**

**Array.flat():**
```javascript
const nested = [1, [2, 3], [4, [5, 6]]];
console.log(nested.flat()); // [1, 2, 3, 4, [5, 6]]
console.log(nested.flat(2)); // [1, 2, 3, 4, 5, 6]

// flatMap (map + flat)
const arr = [1, 2, 3];
console.log(arr.flatMap(x => [x, x * 2])); // [1, 2, 2, 4, 3, 6]
```

**Object.fromEntries():**
```javascript
const entries = [['name', 'Alice'], ['age', 30]];
const obj = Object.fromEntries(entries);

// Transform object
const prices = { apple: 1.5, banana: 0.8 };
const discounted = Object.fromEntries(
  Object.entries(prices).map(([k, v]) => [k, v * 0.9])
);
```

---

### ES2020 (ES11) - Optional Chaining and Nullish Coalescing

**Major Features:**
- Optional chaining (\`?.\`)
- Nullish coalescing (\`??\`)
- BigInt
- Promise.allSettled()
- globalThis
- Dynamic import()

**Examples:**

**Optional Chaining:**
```javascript
const user = { address: { city: 'NYC' } };

// Safe navigation
const zip = user?.address?.zipCode; // undefined (no error)
const result = obj.method?.(); // Safe method call
const item = arr?.[0]; // Safe array access

// Practical
const city = user?.address?.city ?? 'Unknown';
```

**Nullish Coalescing:**
```javascript
// ?? only for null/undefined (not 0, '', false)
const value1 = 0 ?? 'default'; // 0
const value2 = null ?? 'default'; // 'default'

// vs || operator
const value3 = 0 || 'default'; // 'default'

// Configuration with defaults
const timeout = userConfig?.timeout ?? 5000;
```

**BigInt:**
```javascript
const big = 9007199254740991n;
console.log(big + 1n); // 9007199254740992n

// Large calculations
const power = 2n ** 100n;
```

**Promise.allSettled():**
```javascript
// Waits for all promises (doesn't fail fast)
const results = await Promise.allSettled([
  fetch('/api/users'),
  fetch('/api/posts'),
  fetch('/api/invalid') // Fails
]);

results.forEach(result => {
  if (result.status === 'fulfilled') {
    console.log('Success:', result.value);
  } else {
    console.log('Failed:', result.reason);
  }
});
```

---

### ES2021 (ES12) - Logical Assignment

**Major Features:**
- Logical assignment (\`||=\`, \`&&=\`, \`??=\`)
- Numeric separators
- String.replaceAll()
- Promise.any()
- WeakRef

**Examples:**

**Logical Assignment:**
```javascript
// ||= (OR assignment)
let x = 0;
x ||= 10; // x = 10

// &&= (AND assignment)
let obj = { value: 5 };
obj.value &&= obj.value * 2; // 10

// ??= (nullish assignment)
let config = { timeout: null };
config.timeout ??= 5000; // Assigns only if null/undefined
```

**Numeric Separators:**
```javascript
const billion = 1_000_000_000;
const bytes = 0xFF_FF_FF_FF;
const price = 1_999.99;
```

**String.replaceAll():**
```javascript
const str = "Hello World, Hello Universe";
const result = str.replaceAll('Hello', 'Hi');
// "Hi World, Hi Universe"
```

**Promise.any():**
```javascript
// First fulfilled promise wins
const fastest = await Promise.any([
  fetch('/server1'),
  fetch('/server2'),
  fetch('/server3')
]);
```

---

### ES2022 (ES13) - Top-Level Await and Class Fields

**Major Features:**
- Top-level await
- Class fields (public/private)
- Private methods (\`#private\`)
- Static class features
- .at() method
- Object.hasOwn()
- Error.cause

**Examples:**

**Top-Level Await:**
```javascript
// In ES modules
const response = await fetch('/api/config');
const config = await response.json();
export const appConfig = config;
```

**Class Fields:**
```javascript
class Counter {
  count = 0; // Public field
  #privateCount = 0; // Private field
  
  #increment() { // Private method
    this.#privateCount++;
  }
  
  increment() {
    this.count++;
    this.#increment();
  }
}

// Static features
class Database {
  static instanceCount = 0;
  static #maxConnections = 10;
  
  static {
    console.log('Class initialized');
  }
}
```

**.at() Method:**
```javascript
const arr = [10, 20, 30, 40, 50];
console.log(arr.at(-1)); // 50 (last element)
console.log(arr.at(-2)); // 40 (second to last)

// Works with strings
console.log("Hello".at(-1)); // 'o'
```

**Object.hasOwn():**
```javascript
const obj = { x: 1 };
console.log(Object.hasOwn(obj, 'x')); // true (safer than hasOwnProperty)
```

---

### ES2023 (ES14) - Immutable Array Methods

**Major Features:**
- Array: findLast(), findLastIndex()
- Immutable methods: toSorted(), toReversed(), toSpliced(), with()
- Symbols as WeakMap keys

**Examples:**

**findLast():**
```javascript
const numbers = [1, 2, 3, 4, 5, 4, 3];
console.log(numbers.findLast(n => n > 3)); // 4 (last match)
console.log(numbers.findLastIndex(n => n > 3)); // 5
```

**Immutable Array Methods:**
```javascript
const original = [3, 1, 4, 1, 5];

// toSorted() - doesn't mutate
const sorted = original.toSorted();
console.log(sorted); // [1, 1, 3, 4, 5]
console.log(original); // [3, 1, 4, 1, 5] (unchanged)

// toReversed()
const reversed = original.toReversed();

// toSpliced()
const spliced = original.toSpliced(2, 1, 99);

// with() - replace at index
const updated = original.with(2, 99);
```

**Referential Transparency:** New methods are pure functions that don't mutate arrays.

---

### ES2024 (ES15) - Promise.withResolvers and groupBy

**Major Features:**
- Promise.withResolvers()
- Object.groupBy(), Map.groupBy()
- ArrayBuffer transfer
- String.isWellFormed(), toWellFormed()
- RegExp v flag

**Examples:**

**Promise.withResolvers():**
```javascript
// Easier deferred promises
const { promise, resolve, reject } = Promise.withResolvers();

// Use in event handlers
class EventManager {
  waitFor(event) {
    const { promise, resolve } = Promise.withResolvers();
    this.once(event, resolve);
    return promise;
  }
}
```

**groupBy():**
```javascript
const products = [
  { name: 'Apple', category: 'fruit' },
  { name: 'Carrot', category: 'vegetable' }
];

const grouped = Object.groupBy(products, p => p.category);
// {
//   fruit: [{ name: 'Apple', ... }],
//   vegetable: [{ name: 'Carrot', ... }]
// }

// Map.groupBy returns Map
const map = Map.groupBy(products, p => p.category);
```

**String.isWellFormed():**
```javascript
const str = "Hello 👋";
console.log(str.isWellFormed()); // true

// Fix ill-formed Unicode
const fixed = badString.toWellFormed();
```

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge | Node.js |
|---------|--------|---------|--------|------|---------|
| ES2015 | 51+ | 54+ | 10+ | 15+ | 6+ |
| ES2017 | 55+ | 52+ | 10.1+ | 15+ | 7.6+ |
| ES2018 | 64+ | 58+ | 11.1+ | 79+ | 10+ |
| ES2019 | 73+ | 66+ | 12.1+ | 79+ | 12+ |
| ES2020 | 80+ | 74+ | 13.1+ | 80+ | 14+ |
| ES2021 | 85+ | 79+ | 14+ | 85+ | 15+ |
| ES2022 | 94+ | 93+ | 15.4+ | 94+ | 16.11+ |
| ES2023 | 110+ | 115+ | 16+ | 110+ | 20+ |
| ES2024 | 117+ | 119+ | 17+ | 117+ | 21+ |

**For older browsers:** Use [Babel](https://babeljs.io/) to transpile modern JavaScript to ES5.

---

## Feature Support Matrix

### Functional Programming Features

| Feature | Version | Purpose |
|---------|---------|---------|
| map, filter, reduce | ES5 | Transform arrays |
| Arrow functions | ES2015 | Pure functions |
| const | ES2015 | Immutable bindings |
| Spread operator | ES2015 | Non-destructive operations |
| Object.freeze | ES5 | Immutability |
| toSorted, toReversed | ES2023 | Immutable array ops |
| groupBy | ES2024 | Functional grouping |

---

## Best Practices

### Modern JavaScript Recommendations

1. **Use \`const\` by default**, \`let\` when needed
2. **Prefer arrow functions** for callbacks
3. **Use template literals** for strings
4. **Destructure** objects and arrays
5. **Use spread operator** for immutability
6. **Prefer async/await** over promise chains
7. **Use optional chaining** (\`?.\`) and nullish coalescing (\`??\`)
8. **Use ES modules** (import/export)
9. **Use immutable array methods** (toSorted, toReversed)
10. **Leverage convenience methods** (at, hasOwn, groupBy)

### Referential Transparency Guidelines

- ✅ Pure functions: Use map, filter, reduce
- ✅ Immutable data: Use spread, toSorted, Object.freeze
- ✅ No side effects: Isolate I/O at boundaries
- ✅ Explicit dependencies: Pass as parameters
- ✅ Deterministic: Same input → same output

---

## Related Documentation

### Project Documentation
- [JAVASCRIPT_BEST_PRACTICES.md](../.github/JAVASCRIPT_BEST_PRACTICES.md)
- [REFERENTIAL_TRANSPARENCY.md](../.github/REFERENTIAL_TRANSPARENCY.md)
- [MODULE_SPLITTING_GUIDE.md](./MODULE_SPLITTING_GUIDE.md)
- [CONTRIBUTING.md](../.github/CONTRIBUTING.md)

### External Resources
- [ECMAScript Specifications](https://tc39.es/ecma262/)
- [MDN JavaScript Reference](https://developer.mozilla.org/docs/Web/JavaScript)
- [Can I Use](https://caniuse.com/) - Browser compatibility
- [TC39 Proposals](https://github.com/tc39/proposals) - Upcoming features

---

## Summary

### Key Milestones

1. **ES5 (2009)**: JSON, array methods, strict mode
2. **ES2015 (2015)**: Classes, modules, arrows, promises
3. **ES2017 (2017)**: Async/await
4. **ES2020 (2020)**: Optional chaining, nullish coalescing
5. **ES2023 (2023)**: Immutable array methods

### For Guia.js Project

This project uses:
- ✅ ES6 modules (import/export)
- ✅ Arrow functions and const/let
- ✅ Promises and async/await
- ✅ Spread operator for immutability
- ✅ Array methods for functional programming
- ✅ Classes with modern syntax
- ✅ Optional chaining where applicable

---

**Contributors:**
- Marcelo Pereira Barbosa (Original Author)
- GitHub Copilot (Documentation)

**Version:** 1.0.0  
**Last Updated:** October 15, 2024  
**Target Audience:** Contributors, Maintainers, GitHub Copilot

**Note:** Optimized for GitHub Copilot understanding and aligned with project's functional programming principles.
