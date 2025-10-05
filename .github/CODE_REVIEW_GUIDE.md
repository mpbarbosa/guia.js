# Code Review Guide for Guia.js

## Table of Contents

- [Overview](#overview)
- [Review Process](#review-process)
- [Referential Transparency Checklist](#referential-transparency-checklist)
- [Immutability Checklist](#immutability-checklist)
- [Code Quality Checklist](#code-quality-checklist)
- [Testing Checklist](#testing-checklist)
- [Documentation Checklist](#documentation-checklist)
- [Common Issues and Solutions](#common-issues-and-solutions)

## Overview

This guide helps reviewers ensure code contributions meet the Guia.js project standards, with particular emphasis on **referential transparency**, **immutability**, and **functional programming principles**.

### Goals of Code Review

1. ✅ Ensure code correctness and functionality
2. ✅ Maintain code quality and consistency
3. ✅ Promote referential transparency and pure functions
4. ✅ Verify immutability principles are followed
5. ✅ Improve code maintainability and testability
6. ✅ Share knowledge across the team

### Review Mindset

- **Be constructive**: Focus on the code, not the person
- **Be thorough**: Check for both obvious and subtle issues
- **Be educational**: Explain why changes are suggested
- **Be respectful**: Different approaches can be valid

## Review Process

### 1. Initial Check

Before diving into details, verify:

- [ ] **Build passes**: Code compiles without errors
- [ ] **Tests pass**: All existing tests continue to pass
- [ ] **New tests exist**: New functionality includes tests
- [ ] **Lint passes**: Code follows style guidelines (`npm run validate`)
- [ ] **No console.log**: Debugging statements removed
- [ ] **Branch is up to date**: Merged latest from main

### 2. Understand the Change

- [ ] Read the PR description and linked issue
- [ ] Understand the problem being solved
- [ ] Review the acceptance criteria
- [ ] Identify affected areas of the codebase

### 3. Detailed Review

Go through the code systematically using the checklists below.

### 4. Provide Feedback

- Start with positive comments about what's done well
- Group related feedback together
- Distinguish between blocking issues and suggestions
- Provide code examples when suggesting changes

### 5. Follow Up

- Re-review after changes are made
- Approve when all issues are addressed
- Thank the contributor

## Referential Transparency Checklist

### Pure Functions

When reviewing functions, ask these questions:

#### Are functions pure?

- [ ] **Same input → Same output**: Does the function always return the same result for the same arguments?
- [ ] **No side effects**: Does the function avoid modifying external state?
- [ ] **No I/O operations**: Are network calls, file operations, or console logs absent from core logic?
- [ ] **No random values**: Does the function avoid `Math.random()`, `Date.now()`, etc.?
- [ ] **Deterministic**: Can you predict the output without running the code?

```javascript
// ❌ NOT referentially transparent
let counter = 0;
function getNextId() {
  return counter++;  // Side effect: modifies external state
}

// ✅ Referentially transparent
function getNextId(currentId) {
  return currentId + 1;  // Pure: no side effects
}
```

#### Is state mutated?

- [ ] **No direct mutations**: Are arrays and objects modified in place?
- [ ] **Returns new values**: Does the function return new data structures?
- [ ] **Input preservation**: Are input parameters unchanged after the function call?

```javascript
// ❌ Mutates state
function addItem(list, item) {
  list.push(item);  // Mutates input
  return list;
}

// ✅ Creates new state
function addItem(list, item) {
  return [...list, item];  // Returns new array
}
```

#### Are dependencies explicit?

- [ ] **No hidden dependencies**: Does the function depend on global variables or config?
- [ ] **Parameters over globals**: Are all dependencies passed as parameters?
- [ ] **Testable in isolation**: Can the function be tested without complex setup?

```javascript
// ❌ Hidden dependency
const API_URL = 'https://api.example.com';
function fetchUser(id) {
  return fetch(`${API_URL}/users/${id}`);  // Depends on global
}

// ✅ Explicit dependency
function fetchUser(apiUrl, id) {
  return fetch(`${apiUrl}/users/${id}`);  // Dependency as parameter
}
```

### Side Effects

#### Are side effects isolated?

- [ ] **Boundary isolation**: Are side effects kept at application boundaries?
- [ ] **Clear separation**: Is business logic separated from I/O operations?
- [ ] **Function naming**: Do function names indicate side effects (e.g., `saveUser` vs `formatUser`)?

```javascript
// ✅ Good separation
function validateAddress(address) {  // Pure
  return address.street && address.city;
}

function formatAddress(address) {  // Pure
  return `${address.street}, ${address.city}`;
}

async function saveAddress(address) {  // Impure (clear from name)
  const isValid = validateAddress(address);  // Pure
  if (!isValid) throw new Error('Invalid address');
  
  const formatted = formatAddress(address);  // Pure
  await database.save(formatted);  // Side effect
}
```

### Temporal Coupling

#### Is call order independent?

- [ ] **No call order dependencies**: Can functions be called in any order?
- [ ] **Explicit data flow**: Is data passed between functions rather than stored in shared state?
- [ ] **No hidden initialization**: Do functions work without prior setup calls?

```javascript
// ❌ Temporal coupling
class Service {
  init() { this.config = loadConfig(); }
  process(data) { return transform(data, this.config); }  // Needs init() first
}

// ✅ No temporal coupling
class Service {
  process(data, config) {
    return transform(data, config);  // Explicit dependency
  }
}
```

## Immutability Checklist

### Array Operations

- [ ] **No push/pop/shift/unshift**: Use spread operator or `concat()`
- [ ] **No splice**: Use `filter()` or `slice()`
- [ ] **No sort on original**: Use `[...array].sort()`
- [ ] **No reverse on original**: Use `[...array].reverse()`
- [ ] **Prefer map/filter/reduce**: Use functional array methods

```javascript
// ❌ Mutating operations
items.push(newItem);
items.splice(index, 1);
items.sort();

// ✅ Immutable operations
items = [...items, newItem];
items = items.filter((_, i) => i !== index);
items = [...items].sort();
```

### Object Operations

- [ ] **No direct property assignment**: Use spread operator or `Object.assign()`
- [ ] **Deep copy for nested objects**: Handle nested structures carefully
- [ ] **Use Object.freeze**: Consider freezing objects that shouldn't change
- [ ] **Immutable updates**: Create new objects rather than modifying existing ones

```javascript
// ❌ Mutating operations
user.name = 'New Name';
user.address.city = 'New City';

// ✅ Immutable operations
user = { ...user, name: 'New Name' };
user = {
  ...user,
  address: { ...user.address, city: 'New City' }
};
```

### Observer Patterns

- [ ] **Immutable observer lists**: Create new arrays when subscribing/unsubscribing
- [ ] **No array mutations**: Don't use `push()` for adding observers
- [ ] **Filter for removal**: Use `filter()` to remove observers

```javascript
// ✅ Immutable observer management
subscribe(observer) {
  this.observers = [...this.observers, observer];
}

unsubscribe(observer) {
  this.observers = this.observers.filter(o => o !== observer);
}
```

### Cache Operations

- [ ] **New Map/Set on updates**: Create new collections rather than mutating
- [ ] **Immutable entries**: Don't modify cached objects directly
- [ ] **Eviction without mutation**: Use `filter()` or similar for cleanup

## Code Quality Checklist

### Readability

- [ ] **Clear function names**: Names describe what the function does
- [ ] **Appropriate length**: Functions are focused and not too long
- [ ] **Consistent style**: Code follows project conventions
- [ ] **Meaningful variable names**: Variables are descriptive
- [ ] **Comments where needed**: Complex logic is explained

### Structure

- [ ] **Single Responsibility**: Each function does one thing
- [ ] **DRY principle**: No unnecessary code duplication
- [ ] **Proper abstraction**: Logic is at the right level
- [ ] **Logical organization**: Related code is grouped together

### Error Handling

- [ ] **Errors are handled**: Potential errors are caught and managed
- [ ] **Meaningful error messages**: Errors explain what went wrong
- [ ] **No silent failures**: Errors aren't swallowed without action
- [ ] **Validation**: Input is validated before processing

### Performance

- [ ] **No obvious bottlenecks**: Inefficient algorithms are avoided
- [ ] **Appropriate data structures**: Right tools for the job
- [ ] **Lazy evaluation**: Work is only done when needed
- [ ] **Memoization considered**: Expensive pure functions can be cached

## Testing Checklist

### Test Coverage

- [ ] **New code has tests**: All new functionality is tested
- [ ] **Edge cases covered**: Boundary conditions are tested
- [ ] **Error paths tested**: Failure scenarios are covered
- [ ] **Existing tests pass**: No regressions introduced

### Test Quality

- [ ] **Tests are isolated**: No dependencies between tests
- [ ] **Clear test names**: Test describes what's being tested
- [ ] **Arrange-Act-Assert**: Tests follow clear structure
- [ ] **Appropriate assertions**: Tests verify the right things
- [ ] **No test code smell**: Tests are maintainable

### Pure Function Testing

- [ ] **Simple test setup**: Pure functions need minimal setup
- [ ] **Deterministic tests**: Tests always produce same results
- [ ] **Property-based tests**: Consider testing mathematical properties
- [ ] **Input preservation**: Verify inputs aren't mutated

```javascript
// ✅ Good pure function test
test('calculateDiscount returns correct value', () => {
  expect(calculateDiscount(100, 10)).toBe(90);
  expect(calculateDiscount(50, 20)).toBe(40);
  expect(calculateDiscount(0, 10)).toBe(0);
});

test('calculateDiscount does not modify inputs', () => {
  const price = { amount: 100 };
  calculateDiscount(price.amount, 10);
  expect(price.amount).toBe(100);  // Unchanged
});
```

## Documentation Checklist

### Code Documentation

- [ ] **JSDoc for public APIs**: Public functions have documentation
- [ ] **Parameter types**: Types are documented
- [ ] **Return values**: Return types are documented
- [ ] **Usage examples**: Complex functions have examples
- [ ] **Since tags**: Version information is included

### Project Documentation

- [ ] **README updated**: If public API changes
- [ ] **CHANGELOG updated**: Significant changes are noted
- [ ] **Migration guide**: Breaking changes explained
- [ ] **Examples updated**: Sample code reflects changes

## Common Issues and Solutions

### Issue: Hidden Global State

**Problem:**
```javascript
const cache = {};
function getCachedData(key) {
  return cache[key];
}
```

**Solution:**
```javascript
function getCachedData(cache, key) {
  return cache.get(key);
}
```

**Review Comment:**
> This function depends on a global `cache` variable. Consider passing the cache as a parameter to make the dependency explicit and improve testability.

### Issue: Direct Array Mutation

**Problem:**
```javascript
function addToList(list, item) {
  list.push(item);
  return list;
}
```

**Solution:**
```javascript
function addToList(list, item) {
  return [...list, item];
}
```

**Review Comment:**
> This function mutates the input array. Please use the spread operator to create a new array: `return [...list, item];`

### Issue: Side Effects in Pure Logic

**Problem:**
```javascript
function processUser(user) {
  console.log('Processing:', user.name);
  return { ...user, processed: true };
}
```

**Solution:**
```javascript
function processUser(user) {
  return { ...user, processed: true };
}

function processAndLogUser(user) {
  console.log('Processing:', user.name);
  return processUser(user);
}
```

**Review Comment:**
> The `console.log` introduces a side effect. Consider separating the pure transformation from the logging. This makes the function easier to test and more reusable.

### Issue: Non-Deterministic Behavior

**Problem:**
```javascript
function createSession() {
  return {
    id: Math.random().toString(36),
    createdAt: new Date()
  };
}
```

**Solution:**
```javascript
function createSession(randomId, currentTime) {
  return {
    id: randomId,
    createdAt: currentTime
  };
}
```

**Review Comment:**
> This function is non-deterministic due to `Math.random()` and `new Date()`. Pass these as parameters to make the function pure and testable.

### Issue: Temporal Coupling

**Problem:**
```javascript
class DataLoader {
  load(id) {
    this.data = fetchData(id);
  }
  
  getData() {
    return this.data;
  }
}
```

**Solution:**
```javascript
class DataLoader {
  async load(id) {
    return await fetchData(id);
  }
  
  transform(data) {
    return processData(data);
  }
}
```

**Review Comment:**
> The `getData()` method depends on `load()` being called first. This temporal coupling makes the code harder to reason about. Consider making the data flow explicit by passing data between methods.

## Review Response Templates

### Requesting Changes

```markdown
Thanks for the contribution! I found a few areas where we can improve adherence to referential transparency:

1. **Line 45**: The `updateCart` function mutates the input array. Consider using spread operator:
   \`\`\`javascript
   return [...cart, newItem];
   \`\`\`

2. **Line 78**: The function depends on the global `config` object. Please pass configuration as a parameter.

3. **Line 102**: Consider extracting the side effect (API call) from the business logic to improve testability.

Could you address these points? Let me know if you need any clarification!
```

### Approving Changes

```markdown
Great work! The code follows our referential transparency guidelines:

✅ Pure functions with clear inputs/outputs
✅ Immutable data operations throughout
✅ Side effects properly isolated
✅ Comprehensive test coverage

One minor suggestion (non-blocking): Consider adding a JSDoc comment to the `calculateDistance` function for future maintainers.

Approved! 🎉
```

### Educational Feedback

```markdown
I noticed this pattern in a few places:

\`\`\`javascript
items.sort()
\`\`\`

In this project, we prefer immutable operations to maintain referential transparency. The `sort()` method mutates the original array. Instead, sort a copy:

\`\`\`javascript
[...items].sort()
\`\`\`

This ensures the original data isn't modified, making the code more predictable and easier to test. See [REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md) for more examples.
```

## Resources

- [REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md) - Detailed guide on referential transparency
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines including immutability principles
- [LOW_COUPLING_GUIDE.md](./LOW_COUPLING_GUIDE.md) - Architectural guidelines

---

**Remember**: The goal of code review is to improve the code and help each other grow as developers. Be kind, be thorough, and focus on learning together.
