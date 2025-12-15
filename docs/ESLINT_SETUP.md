# ESLint Setup - No "this" Keyword Rule

## Overview

This project has been configured with ESLint to enforce functional programming patterns by **disallowing the use of the `this` keyword**.

## Configuration Files

- **`eslint.config.js`** - Main ESLint configuration using the new flat config format (ESLint v9+)
- **`.eslintignore`** - Files and directories to ignore during linting

## Rules Enforced

### 1. No "this" Keyword (ERROR in src/)

The following rules work together to prevent the use of `this`:

```javascript
{
  'no-invalid-this': 'error',
  'no-restricted-syntax': [
    'error',
    {
      selector: 'ThisExpression',
      message: 'Use of "this" keyword is not allowed. Use functional programming patterns instead.'
    }
  ]
}
```

### 2. Test Files (WARNING)

Test files have relaxed rules where `this` usage generates a **warning** instead of an error, since some testing patterns might require it.

## NPM Scripts

### Lint all files
```bash
npm run lint
```

### Lint and auto-fix issues
```bash
npm run lint:fix
```

## Current Status

As of 2025-12-15:
- **952 errors** found across the codebase
- **270 warnings** in test files
- Most errors are related to class-based code using `this`

## Recommended Refactoring Patterns

### Instead of Classes with "this":
```javascript
// ❌ Avoid
class Counter {
  constructor() {
    this.count = 0;
  }
  increment() {
    this.count++;
  }
}
```

### Use Factory Functions:
```javascript
// ✅ Preferred
const createCounter = () => {
  let count = 0;
  
  return {
    increment: () => {
      count++;
      return count;
    },
    getCount: () => count
  };
};
```

### Or Pure Functions:
```javascript
// ✅ Also good
const increment = (count) => count + 1;
const getCount = (counter) => counter.count;
```

## Integration with CI/CD

Add linting to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Lint code
  run: npm run lint
```

## Ignoring Specific Lines

If you absolutely must use `this` (e.g., in legacy code), you can disable the rule:

```javascript
// eslint-disable-next-line no-restricted-syntax
this.legacyProperty = value;
```

However, this should be avoided. Consider refactoring instead.

## Additional Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Functional Programming in JavaScript](https://github.com/getify/Functional-Light-JS)
- [Why avoid "this"?](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/this-object-prototypes/README.md)

## Future Work

1. Gradually refactor class-based code to functional patterns
2. Update test utilities to use functional approaches
3. Consider adding more functional programming rules:
   - `prefer-arrow-callback`
   - `no-class`
   - `functional/no-class`
