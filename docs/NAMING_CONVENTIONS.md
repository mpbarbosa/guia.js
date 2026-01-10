# JavaScript Naming Conventions

## Standard Adopted (v0.7.0-alpha)

### 1. Classes
- **Format**: PascalCase
- **Examples**: `WebGeocodingManager`, `PositionManager`, `SpeechQueue`
- **Status**: ✅ Fully compliant (26/26 classes)

### 2. Public Methods
- **Format**: camelCase (starts with lowercase)
- **Pattern**: Descriptive verb phrases
- **Examples**: 
  - `startTracking()` - action methods
  - `getCurrentPosition()` - getter methods
  - `setupChangeDetection()` - configuration methods
- **Status**: ✅ Compliant

### 3. Private Methods
- **Format**: camelCase with leading underscore `_`
- **Pattern**: Same as public but prefixed with `_`
- **Examples**:
  - `_initialize()` - initialization
  - `_setupEventHandlers()` - internal setup
  - `_computeBairroCompleto()` - internal computation
  - `_notifyObservers()` - internal notification
- **Status**: ⚠️ Partially compliant (17/612 methods)

### 4. Initialization Methods
- **Public**: `initialize*()` or `init*()` 
  - Examples: `initRouter()`, `initNavigation()`, `initializeConverterFeatures()`
- **Private**: `_initialize*()`
  - Examples: `_initializeUIElements()`, `_initializeFetchManager()`, `_initializeChronometer()`
- **Status**: ⚠️ Mixed (some use `init`, some `initialize`)

### 5. Setup/Configuration Methods  
- **Public**: `setup*()`
  - Examples: `setupChangeDetection()`, `setupLogradouroChangeDetection()`
- **Private**: `_setup*()`
  - Examples: `_setupEventHandlers()`
- **Status**: ⚠️ Mixed

## Consistency Issues Found

### Issue #1: Private Method Underscore Prefix
**Problem**: Only 17 out of many private methods use the `_` prefix
**Impact**: Unclear API surface - hard to know what's internal vs. public
**Severity**: Medium

**Examples**:
```javascript
// ✅ GOOD - Clear private method
_initializeUIElements() { ... }
_setupEventHandlers() { ... }
_computeBairroCompleto(rawData) { ... }

// ⚠️ INCONSISTENT - Looks public but used internally
init() { ... }  // Should be _initialize()
setupEventHandlers() { ... }  // Should be _setupEventHandlers()
```

### Issue #2: Init vs Initialize
**Problem**: Mix of `init*()` and `initialize*()` patterns
**Impact**: Inconsistent naming makes code harder to scan
**Severity**: Low

**Resolution**: 
- Use `init*()` for short, top-level public methods (e.g., `initRouter()`)
- Use `initialize*()` or `_initialize*()` for detailed initialization

### Issue #3: Deprecated Methods
**Problem**: Some methods marked deprecated but still present
**Impact**: Confusion about which methods to use
**Severity**: Low

**Examples**:
```javascript
// ✅ Properly deprecated with warning
initElements() {
  warn("initElements() is deprecated, using _initializeUIElements()");
  this._initializeUIElements();
}
```

## Fixes Applied (2026-01-09)

### HtmlSpeechSynthesisDisplayer.js
- ✅ `init()` → `_initialize()`
- ✅ `setupEventHandlers()` → `_setupEventHandlers()`

### Rationale
These methods are:
1. Called only from constructor (internal use)
2. Documented as `@private` in JSDoc
3. Not part of public API

## Recommendations

### Short Term
1. ✅ Mark clearly private methods with `_` prefix where they're internal
2. ⚠️ Keep public methods without underscore even if called internally
3. ✅ Document deprecation warnings for legacy methods

### Long Term  
1. Audit remaining 595+ methods for proper public/private designation
2. Add ESLint rule to enforce underscore prefix for private methods
3. Consider using JavaScript private fields (`#method()`) in future refactor

## Testing
All changes validated with:
- ✅ `npm run validate` - Syntax check passed
- ✅ `npm test` - 1,282 tests passed (63 suites)
- ✅ No breaking changes to public API

