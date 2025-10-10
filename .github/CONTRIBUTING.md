# Contributing to Guia.js

Thank you for your interest in contributing to Guia.js! This document provides guidelines and best practices for contributing to this project.

## Table of Contents

- [Creating Issues](#creating-issues)
- [Code Style and Best Practices](#code-style-and-best-practices)
- [Referential Transparency](#referential-transparency)
- [Immutability Principles](#immutability-principles)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)

## Creating Issues

### Issue Templates

Guia.js provides several issue templates to help structure and communicate different types of work:

#### Agile Ticket Template (agile-ticket.yml)

Use the **Agile Ticket** template to create actionable user stories and tasks. This template is ideal for:

- **Breaking down functional specifications** into implementable tasks
- **Defining small features** with clear acceptance criteria
- **Creating user stories** following Agile best practices
- **Technical tasks** that support larger initiatives

**When to use:**
- You want to convert a functional specification into actionable development work
- You're defining a new feature with specific user value
- You need to create a technical task with clear deliverables
- You're following Agile/Scrum methodology

**Key sections:**
- **User Story**: "As a [role], I want [feature], so that [benefit]"
- **Acceptance Criteria**: Specific, measurable outcomes
- **Engineering Principles**: Technical guidelines (referential transparency, immutability, etc.)
- **Testing Requirements**: What needs to be tested
- **Definition of Done**: Checklist for completion

#### Other Templates

- **Functional Specification** (`functional_specification.md`): For comprehensive feature documentation
- **Feature Request** (`feature_request.md`): For proposing new features or enhancements
- **Technical Debt** (`technical_debt.md`): For reporting code quality or maintenance issues
- **Documentation** (`documentation.md`): For documentation improvements
- **GitHub Config** (`github_config.md`): For workflow and configuration changes
- **UX Issue** (`ux_issue.md`): For user experience problems or suggestions
- **Copilot Issue** (`copilot_issue.md`): For AI-assisted development issues

**Best Practice**: Start with a Functional Specification for complex features, then break it down into multiple Agile Tickets for implementation.

## Code Style and Best Practices

### General Guidelines

- Follow existing code style and conventions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Write tests for new functionality
- Ensure all tests pass before submitting a PR

## Referential Transparency

### What is Referential Transparency?

**Referential transparency** is a fundamental principle in functional programming where an expression can be replaced with its resulting value without changing the program's behavior. A function is referentially transparent when:

1. **It always produces the same output for the same input** (deterministic)
2. **It has no observable side effects** (no mutations, I/O operations, etc.)

### Why It Matters for Contributors

Writing referentially transparent code makes the Guia.js project more:
- **Predictable**: Easier to understand and reason about
- **Testable**: Simple to test without complex setup
- **Maintainable**: Changes have localized effects
- **Reliable**: No hidden dependencies or side effects

### Guidelines for Writing Referentially Transparent Code

#### ✅ DO: Write Pure Functions

```javascript
// ✅ GOOD: Pure function - same input always gives same output
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  // ... calculation
  return distance;
}

// ✅ GOOD: Pure transformation
function formatAddress(address) {
  return [address.street, address.city, address.state]
    .filter(Boolean)
    .join(', ');
}
```

#### ❌ DON'T: Depend on External State

```javascript
// ❌ BAD: Depends on external config
const config = { apiUrl: 'https://api.example.com' };
function fetchData(endpoint) {
  return fetch(`${config.apiUrl}${endpoint}`);  // Hidden dependency
}

// ✅ GOOD: Explicit dependencies as parameters
function fetchData(apiUrl, endpoint) {
  return fetch(`${apiUrl}${endpoint}`);
}
```

#### ✅ DO: Isolate Side Effects

Keep side effects (I/O, mutations, logging) at the boundaries:

```javascript
// ✅ GOOD: Pure business logic
function validateCoordinates(lat, lon) {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

// Side effects in the orchestration layer
async function processLocation(lat, lon) {
  if (!validateCoordinates(lat, lon)) {  // Pure
    throw new Error('Invalid coordinates');
  }
  
  const address = await fetchAddress(lat, lon);  // Side effect: I/O
  console.log('Address fetched:', address);  // Side effect: logging
  return address;
}
```

#### ❌ DON'T: Use Non-Deterministic Values

```javascript
// ❌ BAD: Non-deterministic
function createTimestamp() {
  return Date.now();  // Different value each time
}

// ✅ GOOD: Deterministic (pass current time as parameter)
function createTimestamp(currentTime) {
  return currentTime;
}

// ❌ BAD: Random values
function generateId() {
  return Math.random().toString(36);
}

// ✅ GOOD: Pass randomness as parameter or use at boundary
function generateId(randomValue) {
  return randomValue.toString(36);
}
```

### Quick Checklist for Contributors

Before submitting your PR, verify your functions are referentially transparent:

- [ ] Functions return the same output for the same input
- [ ] No modifications to external state (no mutations outside function scope)
- [ ] No I/O operations in business logic (console.log, fetch, localStorage, etc.)
- [ ] No use of `Math.random()`, `Date.now()`, or similar non-deterministic sources
- [ ] All dependencies are passed as parameters (no hidden globals)
- [ ] Side effects are isolated to boundary functions
- [ ] Functions are easy to test in isolation

### Learn More

For a comprehensive guide with detailed examples, see:
- **[REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md)** - Full documentation
- **[CODE_REVIEW_GUIDE.md](./CODE_REVIEW_GUIDE.md)** - Review checklist

## Immutability Principles

### Why Immutability Matters

Immutability is a core principle in writing maintainable, predictable, and bug-free code. When data structures are immutable, you can:

- **Prevent unintended side effects**: Changes to data don't accidentally affect other parts of the code
- **Improve debugging**: State changes are explicit and easier to trace
- **Enable better testing**: Pure functions with immutable data are easier to test
- **Facilitate safe state management**: Essential for observer patterns and reactive programming
- **Reduce cognitive load**: You can reason about code without worrying about hidden mutations

### Immutable vs Mutable Patterns

#### ❌ Avoid: Mutable Array Operations

```javascript
// BAD: Directly mutating arrays
const observers = [];
function subscribe(observer) {
  observers.push(observer);  // Mutates the original array
}

// BAD: In-place sorting
const items = [3, 1, 2];
items.sort();  // Mutates the original array

// BAD: Using splice, shift, unshift, pop
const list = [1, 2, 3];
list.splice(1, 1);  // Mutates the original array
list.shift();       // Mutates the original array
```

#### ✅ Prefer: Immutable Array Operations

```javascript
// GOOD: Using spread operator to create new array
let observers = [];
function subscribe(observer) {
  observers = [...observers, observer];  // Creates new array
}

// GOOD: Using concat (non-mutating)
function subscribe(observer) {
  observers = observers.concat(observer);  // Creates new array
}

// GOOD: Sorting without mutation
const items = [3, 1, 2];
const sortedItems = [...items].sort();  // Creates new sorted array

// GOOD: Filtering instead of splicing
const list = [1, 2, 3];
const newList = list.filter((item, index) => index !== 1);  // Creates new array

// GOOD: Using slice for removing first element
const withoutFirst = list.slice(1);  // Creates new array
```

#### ❌ Avoid: Mutable Object Operations

```javascript
// BAD: Directly mutating objects
const config = { timeout: 5000 };
function updateConfig(newTimeout) {
  config.timeout = newTimeout;  // Mutates the original object
}

// BAD: Modifying nested objects
const user = { profile: { name: 'John' } };
user.profile.name = 'Jane';  // Mutates nested object
```

#### ✅ Prefer: Immutable Object Operations

```javascript
// GOOD: Using spread operator for shallow copy
const config = { timeout: 5000 };
function updateConfig(newTimeout) {
  return { ...config, timeout: newTimeout };  // Creates new object
}

// GOOD: Using Object.assign (creates new object)
function updateConfig(newTimeout) {
  return Object.assign({}, config, { timeout: newTimeout });
}

// GOOD: Deep cloning for nested objects
const user = { profile: { name: 'John' } };
const updatedUser = {
  ...user,
  profile: { ...user.profile, name: 'Jane' }
};
```

### Non-Mutating Array Methods

Always prefer these non-mutating methods:

- `map()` - Transform array elements
- `filter()` - Select subset of elements
- `concat()` - Combine arrays
- `slice()` - Extract portion of array
- `reduce()` - Accumulate values
- `find()` / `findIndex()` - Search without modifying
- `some()` / `every()` - Test conditions
- Spread operator `[...array]` - Create shallow copy

### Mutating Methods to Avoid

Avoid these methods that modify arrays in-place:

- `push()` / `pop()` - Use spread operator or concat instead
- `shift()` / `unshift()` - Use slice and spread operator
- `splice()` - Use filter or slice
- `sort()` - Sort a copy: `[...array].sort()`
- `reverse()` - Reverse a copy: `[...array].reverse()`

### Building Arrays Immutably

```javascript
// ❌ BAD: Building array with push
function buildAddress(parts) {
  const result = [];
  if (parts.street) result.push(parts.street);
  if (parts.city) result.push(parts.city);
  if (parts.zip) result.push(parts.zip);
  return result.join(', ');
}

// ✅ GOOD: Building array with filter
function buildAddress(parts) {
  return [parts.street, parts.city, parts.zip]
    .filter(Boolean)  // Remove falsy values
    .join(', ');
}

// ✅ GOOD: Building array with reduce
function buildAddress(parts) {
  return Object.values(parts)
    .reduce((acc, part) => part ? [...acc, part] : acc, [])
    .join(', ');
}
```

### Working with Observer Patterns Immutably

```javascript
// ❌ BAD: Mutating observer arrays
class Subject {
  constructor() {
    this.observers = [];
  }
  
  subscribe(observer) {
    this.observers.push(observer);  // Mutation
  }
  
  unsubscribe(observer) {
    const index = this.observers.indexOf(observer);
    this.observers.splice(index, 1);  // Mutation
  }
}

// ✅ GOOD: Immutable observer management
class Subject {
  constructor() {
    this.observers = [];
  }
  
  subscribe(observer) {
    this.observers = [...this.observers, observer];  // New array
  }
  
  unsubscribe(observer) {
    this.observers = this.observers.filter(o => o !== observer);  // New array
  }
}
```

### Immutability Libraries

For complex state management, consider using immutability libraries:

#### Immer (Recommended)

Immer allows you to work with immutable data using a mutable API:

```javascript
import produce from 'immer';

const state = { count: 0, items: [] };

// Looks mutable but creates new immutable state
const newState = produce(state, draft => {
  draft.count += 1;
  draft.items.push('new item');
});

console.log(state.count);      // 0 (unchanged)
console.log(newState.count);   // 1 (new state)
```

**When to use**: Complex nested state updates, reducing boilerplate

#### Immutable.js

Provides persistent immutable data structures:

```javascript
import { List, Map } from 'immutable';

const list = List([1, 2, 3]);
const newList = list.push(4);  // Returns new List

console.log(list.size);     // 3 (unchanged)
console.log(newList.size);  // 4 (new list)
```

**When to use**: High-performance applications with frequent state updates

### Guidelines for Copilot and AI-Assisted Development

When using GitHub Copilot or other AI assistants:

1. **Review suggestions carefully**: Copilot may suggest mutable patterns
2. **Refactor to immutable**: Convert `push()`, `splice()`, etc. to immutable alternatives
3. **Use immutable patterns in prompts**: Include keywords like "immutable", "spread operator", "filter"
4. **Test thoroughly**: Ensure AI-generated code doesn't introduce side effects

### Code Review Checklist

When reviewing code (your own or others'), check for:

- [ ] No direct array mutations (`push`, `splice`, `sort`, etc.)
- [ ] No direct object property assignments in shared state
- [ ] Arrays copied before sorting or reversing
- [ ] Spread operator or `concat()` used for adding items
- [ ] `filter()` used instead of `splice()` for removing items
- [ ] Observer arrays managed immutably
- [ ] Cache operations don't mutate shared state

## Testing Guidelines

For comprehensive guidance on Test Driven Development, see [TDD_GUIDE.md](./TDD_GUIDE.md).

### Writing Tests

- Write tests for all new functionality
- Include edge cases and error conditions
- Test both success and failure paths
- Ensure tests are isolated and don't depend on execution order
- Follow the TDD cycle: Red-Green-Refactor (see [TDD_GUIDE.md](./TDD_GUIDE.md))

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Validate syntax
npm run validate

# Run validation + tests
npm run test:all
```

### Test Coverage

- Aim for at least 80% coverage for new code
- Focus on testing critical paths and edge cases
- Don't sacrifice test quality for coverage metrics

## Pull Request Process

1. **Create a feature branch**: `git checkout -b feature/your-feature-name`
2. **Make your changes**: Follow the guidelines in this document
3. **Write/update tests**: Ensure all tests pass
4. **Update documentation**: Update relevant `.md` files if needed
5. **Commit your changes**: Use clear, descriptive commit messages
6. **Push to your fork**: `git push origin feature/your-feature-name`
7. **Open a Pull Request**: Provide a clear description of your changes

### Pull Request Checklist

- [ ] Code follows immutability principles
- [ ] All tests pass (`npm run test:all`)
- [ ] New functionality has tests
- [ ] Documentation updated if needed
- [ ] No console.log or debugging code left in
- [ ] Code is properly formatted and linted

## Questions?

If you have questions about contributing, please open an issue for discussion.

Thank you for contributing to Guia.js! 🎉
