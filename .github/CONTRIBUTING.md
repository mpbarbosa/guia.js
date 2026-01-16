# Contributing to Guia Turístico

Thank you for your interest in contributing to Guia Turístico! This document provides guidelines and best practices for contributing to this project.

## Table of Contents

- [Creating Issues](#creating-issues)
- [Code Style and Best Practices](#code-style-and-best-practices)
- [Referential Transparency](#referential-transparency)
- [Immutability Principles](#immutability-principles)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)

## Creating Issues

### Issue Templates

Guia Turístico provides several issue templates to help structure and communicate different types of work:

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
- Add JSDoc comments for public APIs (see [JSDoc Guide](JSDOC_GUIDE.md))
- Write tests for new functionality
- Ensure all tests pass before submitting a PR

## Referential Transparency

### What is Referential Transparency?

**Referential transparency** is a fundamental principle in functional programming where an expression can be replaced with its resulting value without changing the program's behavior. A function is referentially transparent when:

1. **It always produces the same output for the same input** (deterministic)
2. **It has no observable side effects** (no mutations, I/O operations, etc.)

### Why It Matters for Contributors

Writing referentially transparent code makes the Guia Turístico project more:
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

## Development Setup

### Git Hooks Installation

Guia Turístico uses **Husky** to manage Git hooks that ensure code quality before commits and pushes.

#### Automatic Installation (Recommended)

Git hooks are automatically installed when you run:

```bash
npm install
```

This triggers the `prepare` script in `package.json` which sets up Husky hooks in `.husky/`.

#### Manual Installation (Alternative)

If automatic installation fails, you can manually set up hooks:

```bash
# Install Husky and set up hooks
npm run prepare

# Verify hooks are installed
ls -la .husky/
```

#### Available Hooks

**Pre-commit Hook** (`.husky/pre-commit`)
- **Trigger**: Before each commit
- **Duration**: ~1-2 seconds
- **Actions**:
  1. ✓ Validates JavaScript syntax (`npm run validate`)
  2. ✓ Runs tests for changed files (`npm run test:changed`)
- **Purpose**: Fast feedback on code quality
- **Bypass** (use sparingly): `git commit --no-verify`

**Legacy Documentation Hook** (`.github/hooks/pre-commit`)
- **Purpose**: Documentation consistency validation
- **Status**: Reference implementation (not auto-installed)
- **Checks**:
  - Version consistency across docs
  - Test count accuracy
  - "Last Updated" date freshness
  - Broken link detection
  - Code example validity
- **Manual Installation**:
  ```bash
  cp .github/hooks/pre-commit .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit
  ```

#### Troubleshooting Hooks

**Hooks not running?**
```bash
# Reinstall Husky
rm -rf .husky
npm run prepare

# Check Git hooks are executable
ls -la .husky/pre-commit
# Should show: -rwxr-xr-x (executable flag)
```

**Hook failing unexpectedly?**
```bash
# Run hook commands manually to see detailed errors
npm run validate
npm run test:changed

# Check Node.js version (requires v18+)
node --version
```

**Need to commit despite failing hooks?**
```bash
# Bypass hooks (use only when necessary!)
git commit --no-verify -m "your message"

# Then fix issues immediately after:
npm run test:all
```

### Environment Requirements

- **Node.js**: v18+ (tested with v20.19.5)
- **npm**: 10+ for package management
- **Python**: 3.11+ (for Python E2E tests only)
- **Git**: 2.30+ (for Husky hook support)

### Initial Project Setup

```bash
# 1. Clone repository
git clone https://github.com/mpbarbosa/guia_turistico.git
cd guia_turistico

# 2. Install dependencies (includes Husky setup)
npm install

# 3. Verify installation
npm run validate
npm test

# 4. Start development server
python3 -m http.server 9000
# Open http://localhost:9000/src/index.html
```

## Testing Guidelines

For comprehensive guidance on Test Driven Development, see [TDD_GUIDE.md](./TDD_GUIDE.md).

### Writing Tests

- Write tests for all new functionality
- Include edge cases and error conditions
- Test both success and failure paths
- Ensure tests are isolated and don't depend on execution order
- Follow the TDD cycle: Red-Green-Refactor (see [TDD_GUIDE.md](./TDD_GUIDE.md))

### Running Tests

**Quick reference** (see [Pull Request Process](#pre-submission-validation-commands) for detailed information):

```bash
# Syntax validation (~1 second)
npm run validate

# Run all tests (~45 seconds, 1,820 passing / 1,968 total)
npm test

# Run tests with coverage (~45 seconds, ~70% coverage)
npm run test:coverage

# Run tests in watch mode (continuous, for development)
npm run test:watch

# Combined validation (~8 seconds, syntax + tests)
npm run test:all
```

**Expected Results** (as of version 0.7.1-alpha):
- Test Suites: 78 passing, 6 skipped, 84 total
- Tests: 1,820 passing, 146 skipped, 1,968 total
- Coverage: ~70% overall (~70% of src/ files)

**Timing Note**: Test execution varies ±1-2 seconds depending on system performance.

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

### Pre-Submission Validation Commands

**IMPORTANT**: Run these commands before submitting your pull request to ensure code quality and compatibility.

#### 1. Quick Syntax Validation (~1 second)

```bash
npm run validate
```

**Expected Output**:
```
> guia_turistico@0.7.1-alpha validate
> node -c src/app.js && node -c src/guia.js

✓ No syntax errors detected
```

**What it checks**: JavaScript syntax errors in main source files

---

#### 2. Full Test Suite (~7 seconds)

```bash
npm test
```

**Expected Output**:
```
Test Suites: 78 passed, 6 skipped, 84 total
Tests:       1820 passed, 146 skipped, 1968 total
Snapshots:   0 total
Time:        6.789 s
```

**What it checks**: All automated tests across 68 test suites

**Timing Note**: Execution time varies ±1-2 seconds depending on system performance.

---

#### 3. Test Coverage (~7 seconds)

```bash
npm run test:coverage
```

**Expected Output**:
```
Test Suites: 78 passed, 6 skipped, 84 total
Tests:       1820 passing, 146 skipped, 1968 total
Coverage:    ~70% overall
```

**What it checks**: Test coverage metrics (see coverage/ directory for detailed report)

---

#### 4. Combined Validation (~8 seconds)

```bash
npm run test:all
```

**Expected Output**:
```
✓ Syntax validation passed
✓ 1820/1968 tests passed
✓ All validation checks completed
```

**What it checks**: Runs both syntax validation and full test suite

---

#### 5. Verify Test Results

**Expected Test Counts** (as of version 0.7.1-alpha):
- **Total Tests**: 1,653
- **Passing**: 1,516
- **Skipped**: 137
- **Failing**: 0 (all must pass)

**If tests fail**:
1. Read the error messages carefully
2. Check if you introduced breaking changes
3. Update tests if intentionally changing behavior
4. See [Troubleshooting](#troubleshooting-validation-failures) below

---

### Pull Request Checklist

Before submitting your PR, ensure all items are checked:

#### Code Quality
- [ ] Code follows immutability principles (see [REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md))
- [ ] Functions are pure and referentially transparent where possible
- [ ] No mutable array operations (push, splice, sort) - use spread operator, filter, map instead
- [ ] Defensive copying used for object parameters
- [ ] JSDoc comments added for all public APIs (see [JSDOC_GUIDE.md](./JSDOC_GUIDE.md))

#### Testing
- [ ] **All validation commands pass** (see [Pre-Submission Validation Commands](#pre-submission-validation-commands) above)
  - [ ] `npm run validate` - Syntax validation passes
  - [ ] `npm test` - All 1,820 tests pass, 146 skipped
  - [ ] Test counts match expected values (1,820 passing / 1,968 total)
- [ ] New functionality has comprehensive tests
  - [ ] Happy path tested
  - [ ] Edge cases covered
  - [ ] Error conditions handled
- [ ] Tests follow TDD principles (see [TDD_GUIDE.md](./TDD_GUIDE.md))
- [ ] Test coverage maintained or improved (~70% minimum)

#### Documentation
- [ ] Documentation updated if needed
  - [ ] README.md updated if API changes
  - [ ] Architecture docs updated if design changes
  - [ ] JSDoc comments added/updated
- [ ] Code examples included in documentation
- [ ] Version numbers updated if releasing (see [VERSION_TIMELINE.md](../docs/architecture/VERSION_TIMELINE.md))

#### Code Hygiene
- [ ] No `console.log` or debugging code left in source files
- [ ] No commented-out code (remove or document why it's kept)
- [ ] No TODO comments without issue references
- [ ] Code is properly formatted (consistent indentation, spacing)
- [ ] Commit messages are clear and descriptive

#### Architecture & Design
- [ ] Changes follow Single Responsibility Principle
- [ ] No new God Objects or overly complex classes
- [ ] Dependencies are minimal (low coupling - see [LOW_COUPLING_GUIDE.md](./LOW_COUPLING_GUIDE.md))
- [ ] Components have high cohesion (see [HIGH_COHESION_GUIDE.md](./HIGH_COHESION_GUIDE.md))
- [ ] Observer pattern used correctly (no memory leaks)

---

### Troubleshooting Validation Failures

#### Syntax Errors
```bash
# If npm run validate fails:
node -c src/app.js    # Check specific file
node -c src/guia.js   # Check specific file
```

**Common causes**:
- Missing semicolons or brackets
- Typos in variable names
- Invalid JavaScript syntax
- ES6 features not supported

**Fix**: Review error message, locate line number, correct syntax.

---

#### Test Failures
```bash
# Run tests in verbose mode to see details
npm test -- --verbose

# Run specific test file
npm test -- __tests__/YourTest.test.js

# Run tests with detailed error output
npm test -- --no-coverage
```

**Common causes**:
- Breaking changes to existing APIs
- Missing imports or dependencies
- Side effects in tests (not isolated)
- Timing issues in async tests

**Fix**: Read error messages, check test expectations, update implementation or tests.

---

#### Test Count Mismatch

**If you see different test counts**:

**Expected** (v0.7.1-alpha):
- 1,820 passing / 1,968 total / 146 skipped

**Your result** shows different numbers? This could mean:
1. ✅ **You added new tests** (passing count increased) - Good! Document in PR description
2. ⚠️ **Tests are failing** (passing count decreased) - Must fix before merging
3. ⚠️ **Tests were deleted** (total count decreased) - Explain why in PR description

**Action**: Verify your changes and explain count differences in PR description.

---

#### Coverage Drop

**If coverage drops below 70%**:

```bash
# Generate detailed coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

**Action**:
1. Identify uncovered lines in report
2. Add tests for new functionality
3. Focus on critical paths and edge cases
4. Aim for 80%+ coverage on new code

---

### Manual Testing (Web Application)

For UI changes, perform manual testing:

```bash
# Start development server (runs indefinitely)
python3 -m http.server 9000

# In browser, navigate to:
# http://localhost:9000/src/index.html
```

**Test the following**:
1. **Geolocation Flow**
   - Click "Obter Localização" button
   - Grant location permissions
   - Verify coordinates display correctly
   - Check address lookup occurs

2. **UI Elements**
   - All buttons are clickable and functional
   - Text displays correctly in result areas
   - Console shows appropriate log messages
   - No JavaScript errors in browser console

3. **Error Handling**
   - Deny location permissions - verify error handling
   - Disconnect network - verify graceful degradation
   - Invalid coordinates - verify validation

**Stop server**: Press `Ctrl+C` in terminal

---

### Validation Command Quick Reference

| Command | Purpose | Time | Expected Result |
|---------|---------|------|-----------------|
| `npm run validate` | Syntax check | ~1s | No syntax errors |
| `npm test` | Full test suite | ~45s | 1,820 passing, 146 skipped |
| `npm run test:coverage` | Tests + coverage | ~7s | ~70% coverage |
| `npm run test:all` | Syntax + tests | ~8s | All checks pass |
| `npm run test:watch` | Dev mode tests | Continuous | Watch for changes |

---

### Additional Resources

**Having trouble with validation?**
- 📚 Read [TDD_GUIDE.md](./TDD_GUIDE.md) for testing methodology
- 📚 Read [UNIT_TEST_GUIDE.md](./UNIT_TEST_GUIDE.md) for test patterns
- 📚 Check [docs/INDEX.md](../docs/INDEX.md) for complete documentation
- 💬 Ask questions by opening an issue

**Understanding the codebase?**
- 📚 Read [VERSION_TIMELINE.md](../docs/architecture/VERSION_TIMELINE.md) for version history
- 📚 Read [CLASS_DIAGRAM.md](../docs/architecture/CLASS_DIAGRAM.md) for architecture
- 📚 Read [PROJECT_PURPOSE_AND_ARCHITECTURE.md](../docs/PROJECT_PURPOSE_AND_ARCHITECTURE.md) for goals

## Related Documentation

### Essential Reading
- **[REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md)** - Core functional programming principles
- **[JSDOC_GUIDE.md](./JSDOC_GUIDE.md)** - API documentation standards
- **[TDD_GUIDE.md](./TDD_GUIDE.md)** - Test-driven development methodology
- **[UNIT_TEST_GUIDE.md](./UNIT_TEST_GUIDE.md)** - Unit testing best practices

### Code Quality
- **[JAVASCRIPT_BEST_PRACTICES.md](./JAVASCRIPT_BEST_PRACTICES.md)** - JavaScript standards
- **[CODE_REVIEW_GUIDE.md](./CODE_REVIEW_GUIDE.md)** - Review checklist
- **[HIGH_COHESION_GUIDE.md](./HIGH_COHESION_GUIDE.md)** - Component design
- **[LOW_COUPLING_GUIDE.md](./LOW_COUPLING_GUIDE.md)** - Dependency management

### Complete Guide Index
- **[docs/INDEX.md](../docs/INDEX.md)** - Comprehensive documentation index

## Questions?

If you have questions about contributing, please open an issue for discussion.

Thank you for contributing to Guia Turístico! 🎉

---

**Version**: 0.7.1-alpha  
**Status**: Active Development  
**Last Updated**: 2026-01-16
