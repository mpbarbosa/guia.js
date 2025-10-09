# Guide to Creating Issues for #189 Next Steps

## Overview

This guide provides step-by-step instructions and issue templates for creating the 5 technical debt issues identified from Issue #189. Each template is ready to copy-paste into GitHub's issue creation form.

## Prerequisites

- Access to create issues in the mpbarbosa/guia_js repository
- Technical Debt template available at `.github/ISSUE_TEMPLATE/technical_debt.md`

## Quick Reference

| Issue | Title | Priority | Effort | Order |
|-------|-------|----------|--------|-------|
| 1 | Configuration Object for Element IDs | High | Small | 2nd |
| 2 | Factory Pattern for Displayers | Medium | Medium | 4th |
| 3 | Remove Legacy Timeout in startTracking() | Low | Small | 3rd |
| 4 | Extract Change Detection to Separate Coordinator | High | Large | 5th |
| 5 | Dependency Injection for Services | High | Small | 1st ⭐ |

---

## Issue #1: Configuration Object for Element IDs

### How to Create
1. Go to: https://github.com/mpbarbosa/guia_js/issues/new/choose
2. Select "Technical Debt" template
3. Copy and paste the content below

### Issue Content

**Title**: `[Tech Debt] Extract hardcoded element IDs to configuration object in WebGeocodingManager`

**Labels**: `technical-debt`, `maintenance`, `refactoring`, `WebGeocodingManager`, `priority:high`, `effort:small`

**Body**:

```markdown
## Technical Debt Summary

WebGeocodingManager has hardcoded DOM element IDs scattered throughout private initialization methods (`"chronometer"`, `"find-restaurants-btn"`, `"city-stats-btn"`, `"tsPosCapture"`, etc.). These magic strings create tight coupling to specific HTML structure and make the class difficult to reuse or test in different contexts.

**Related**: Follow-up from Issue #189 (WebGeocodingManager refactoring)

## Impact on Codebase

**Maintainability Concerns:**
- Hardcoded element IDs scattered across multiple private methods
- Changing HTML structure requires modifying multiple code locations
- No single source of truth for element ID configuration
- Not immediately clear what elements are required vs optional

**Code Readability:**
- Element IDs appear as magic strings without context
- Developer must search entire class to find all DOM dependencies

**Testing Difficulties:**
- Tests must create DOM elements with specific hardcoded IDs
- Cannot easily test with alternative element configurations
- Makes component reuse in different HTML contexts difficult

## Current Issues

Hardcoded IDs are located in:
- `_initializeChronometer()` (line 3614): `getElementById("chronometer")`
- `_initializeFindRestaurantsButton()` (line 3637): `getElementById("find-restaurants-btn")`
- `_initializeCityStatsButton()` (line 3667): `getElementById("city-stats-btn")`
- `_initializeTimestampDisplay()` (line 3697): `getElementById("tsPosCapture")`
- `initSpeechSynthesis()` (line ~3916): Multiple hardcoded IDs for speech controls

**File**: `src/guia.js` - WebGeocodingManager class (lines 3496-4200+)

## Proposed Solution

Extract all element IDs to a configuration object with defaults:

```javascript
// Define default configuration
const DEFAULT_ELEMENT_IDS = {
    chronometer: "chronometer",
    findRestaurantsBtn: "find-restaurants-btn",
    cityStatsBtn: "city-stats-btn",
    timestampDisplay: "tsPosCapture",
    speechSynthesis: {
        voiceSelect: "voice-select",
        speakButton: "speak-button",
        pauseButton: "pause-button",
        // ... other speech elements
    }
};

// Accept configuration in constructor
constructor(document, params) {
    // ... existing code
    this.elementIds = params.elementIds || DEFAULT_ELEMENT_IDS;
    // Freeze to prevent mutations
    Object.freeze(this.elementIds);
}

// Use in methods
_initializeChronometer() {
    const element = this.document.getElementById(this.elementIds.chronometer);
    // ...
}
```

**Benefits:**
- Single source of truth for all element IDs
- Easy to customize for different HTML structures
- Improves testability by allowing mock element IDs
- Self-documenting code (configuration shows all dependencies)

### Referential Transparency Considerations

- Configuration object should be immutable (use `Object.freeze()`)
- Element ID lookups remain side effects (DOM access) but dependencies are now explicit
- Configuration can be passed as pure data
- Easier to test by injecting test configuration

## Affected Areas

- [x] `src/guia.js` - WebGeocodingManager class (lines 3496-4200+)
- [x] `__tests__/WebGeocodingManager.test.js` - Update tests to use configuration
- [x] HTML test files using WebGeocodingManager

## Priority Level

- [ ] **Critical** - Blocking development or causing production issues
- [x] **High** - Significantly impacting development velocity or code quality
- [ ] **Medium** - Noticeable impact on maintainability
- [ ] **Low** - Minor improvement that can be addressed when convenient

**Justification**: High priority because it improves testability and makes the class more reusable. Prevents technical debt from accumulating as new UI elements are added.

## Acceptance Criteria

- [ ] Configuration object with all element IDs defined with defaults
- [ ] Constructor accepts optional `elementIds` parameter
- [ ] All `getElementById` calls use configuration object
- [ ] Configuration object is frozen to prevent mutations
- [ ] Tests updated to verify configuration injection
- [ ] Existing tests still pass (backward compatibility maintained)
- [ ] Documentation updated with configuration examples
- [ ] Functions follow referential transparency principles (pure, testable)
- [ ] Side effects are properly isolated
- [ ] Code is tested and tests verify no mutations occur

## Additional Context

See comprehensive analysis in `docs/ISSUE_189_NEXT_STEPS.md` (Section 1).

**Recommended Implementation**: This should be done 2nd, after Dependency Injection for Services (#5), as it's a high-priority quick win.

## Effort Estimation

- [x] **Small** (< 1 day)
- [ ] **Medium** (1-3 days)
- [ ] **Large** (1-2 weeks)
- [ ] **Extra Large** (> 2 weeks)
```

---

## Issue #2: Factory Pattern for Displayers

### How to Create
1. Go to: https://github.com/mpbarbosa/guia_js/issues/new/choose
2. Select "Technical Debt" template
3. Copy and paste the content below

### Issue Content

**Title**: `[Tech Debt] Implement Factory Pattern or Dependency Injection for Displayer creation`

**Labels**: `technical-debt`, `maintenance`, `refactoring`, `WebGeocodingManager`, `priority:medium`, `effort:medium`

**Body**:

```markdown
## Technical Debt Summary

The `_createDisplayers()` method directly instantiates HTMLPositionDisplayer, HTMLAddressDisplayer, and HTMLReferencePlaceDisplayer. This tight coupling makes it difficult to substitute alternative displayers for testing or to support different display strategies.

**Related**: Follow-up from Issue #189 (WebGeocodingManager refactoring)

## Impact on Codebase

**Maintainability Concerns:**
- Tight coupling to specific displayer implementations
- Adding new displayer types requires modifying WebGeocodingManager
- Cannot easily swap displayers for testing or alternative UI implementations

**Code Readability/Complexity:**
- Direct instantiation hides what could be configurable
- No clear extension point for alternative implementations

**Testing Difficulties:**
- Cannot inject mock displayers for isolated testing
- Difficult to test WebGeocodingManager without full displayer implementations
- Integration testing becomes mandatory even for unit-level concerns

## Current Issues

**Location**: `src/guia.js` - `_createDisplayers()` method (lines 3557-3566)

```javascript
_createDisplayers() {
    this.positionDisplayer = new HTMLPositionDisplayer(this.locationResult);
    this.addressDisplayer = new HTMLAddressDisplayer(
        this.locationResult,
        this.enderecoPadronizadoDisplay
    );
    this.referencePlaceDisplayer = new HTMLReferencePlaceDisplayer(
        this.referencePlaceDisplay
    );
}
```

**Problems:**
- Cannot swap services for different implementations
- Hard to support multiple UI frameworks or display strategies
- Cannot conditionally create displayers based on runtime configuration

## Proposed Solution

**Option A: Factory Pattern**

```javascript
class DisplayerFactory {
    static createPositionDisplayer(elementId) {
        return new HTMLPositionDisplayer(elementId);
    }
    
    static createAddressDisplayer(locationResultId, addressDisplayId) {
        return new HTMLAddressDisplayer(locationResultId, addressDisplayId);
    }
    
    static createReferencePlaceDisplayer(elementId) {
        return new HTMLReferencePlaceDisplayer(elementId);
    }
}

// Inject factory in constructor
constructor(document, params) {
    // ...
    this.displayerFactory = params.displayerFactory || DisplayerFactory;
}
```

**Option B: Direct Dependency Injection (Simpler)**

```javascript
constructor(document, params) {
    // ...
    this.positionDisplayer = params.positionDisplayer || 
        new HTMLPositionDisplayer(this.locationResult);
    this.addressDisplayer = params.addressDisplayer || 
        new HTMLAddressDisplayer(this.locationResult, this.enderecoPadronizadoDisplay);
    this.referencePlaceDisplayer = params.referencePlaceDisplayer || 
        new HTMLReferencePlaceDisplayer(this.referencePlaceDisplay);
}
```

### Referential Transparency Considerations

- Factory methods should be pure functions (given same inputs, return equivalent displayers)
- Factory can be a separate module with no side effects
- Dependency injection makes dependencies explicit
- Easier to test with mock displayers that don't touch DOM

## Affected Areas

- [x] `src/guia.js` - WebGeocodingManager class
- [ ] `src/guia.js` - DisplayerFactory class (new, if using factory pattern)
- [x] `__tests__/WebGeocodingManager.test.js` - Update tests with factory or DI
- [ ] `__tests__/DisplayerFactory.test.js` - New test file (if using factory)

## Priority Level

- [ ] **Critical** - Blocking development or causing production issues
- [ ] **High** - Significantly impacting development velocity or code quality
- [x] **Medium** - Noticeable impact on maintainability
- [ ] **Low** - Minor improvement that can be addressed when convenient

**Justification**: Medium priority - improves testability and extensibility but doesn't block current development. Good refactoring opportunity when adding new displayer types.

## Acceptance Criteria

- [ ] Factory pattern or direct dependency injection implemented
- [ ] Default factory/displayers maintain backward compatibility
- [ ] Can inject custom displayers via constructor
- [ ] Tests demonstrate mock displayer injection
- [ ] All existing tests pass
- [ ] JSDoc documentation for factory pattern (if used)
- [ ] Functions follow referential transparency principles (pure, testable)
- [ ] Side effects are properly isolated
- [ ] Code is tested and tests verify no mutations occur

## Additional Context

See comprehensive analysis in `docs/ISSUE_189_NEXT_STEPS.md` (Section 2).

**Recommended Implementation**: This should be done 4th, after services are injectable and element IDs are configurable. Builds on dependency injection pattern from Issue #5.

## Effort Estimation

- [ ] **Small** (< 1 day)
- [x] **Medium** (1-3 days)
- [ ] **Large** (1-2 weeks)
- [ ] **Extra Large** (> 2 weeks)
```

---

## Issue #3: Remove Legacy Timeout

### How to Create
1. Go to: https://github.com/mpbarbosa/guia_js/issues/new/choose
2. Select "Technical Debt" template
3. Copy and paste the content below

### Issue Content

**Title**: `[Tech Debt] Remove placeholder setTimeout in startTracking() method`

**Labels**: `technical-debt`, `maintenance`, `refactoring`, `WebGeocodingManager`, `priority:low`, `effort:small`

**Body**:

```markdown
## Technical Debt Summary

The `startTracking()` method contains a placeholder `setTimeout` with an empty body that serves no functional purpose. This is legacy code kept "for backward compatibility" but adds no value and creates confusion.

**Related**: Follow-up from Issue #189 (WebGeocodingManager refactoring)

## Impact on Codebase

**Maintainability Concerns:**
- Dead code that serves no purpose
- Creates confusion for developers reading the code
- TODO comment indicates uncertain purpose
- Adds 20-second delay to application startup for no reason

**Code Readability/Complexity:**
- Developers must waste time understanding why it exists
- Reduces confidence in codebase quality

## Current Issues

**Location**: `src/guia.js` - `startTracking()` method (lines 4027-4029)

```javascript
// Legacy timeout - kept for backward compatibility
// TODO: Evaluate if this timeout is still necessary
setTimeout(() => {
    null;
}, 20000);
```

**Problems:**
- Arbitrary 20-second setTimeout that does nothing
- Comment admits purpose is unclear
- No tests depend on this timeout
- No functionality requires this delay

## Proposed Solution

1. Review git history to understand original purpose
2. Check if any tests or functionality depend on this 20-second delay
3. Remove the setTimeout block if no dependencies found
4. If dependencies exist, document them clearly or refactor

**Investigation Steps:**

```bash
# Check git history for this timeout
git log -p --all -S "Legacy timeout" src/guia.js

# Search for any references to 20000ms timing
grep -r "20000" __tests__/

# Run tests after removal
npm test
```

**Expected Result**: Clean removal with all tests passing.

### Referential Transparency Considerations

- Removing side effects (setTimeout) improves code purity
- Makes `startTracking()` more predictable
- Reduces hidden state changes
- Easier to test without arbitrary delays

## Affected Areas

- [x] `src/guia.js` - WebGeocodingManager.startTracking() method (line ~4027)
- [x] `__tests__/WebGeocodingManager.test.js` - Verify no tests depend on delay

## Priority Level

- [ ] **Critical** - Blocking development or causing production issues
- [ ] **High** - Significantly impacting development velocity or code quality
- [ ] **Medium** - Noticeable impact on maintainability
- [x] **Low** - Minor improvement that can be addressed when convenient

**Justification**: Low priority - purely cleanup work that doesn't impact functionality. Can be addressed when convenient during other refactoring work.

## Acceptance Criteria

- [ ] Git history reviewed to understand original purpose
- [ ] Tests verified to ensure no dependencies on 20-second delay
- [ ] setTimeout block removed from startTracking()
- [ ] All existing tests pass after removal
- [ ] No functionality changes or regressions
- [ ] Code review confirms no hidden dependencies
- [ ] Functions follow referential transparency principles (pure, testable)
- [ ] Side effects are properly isolated

## Additional Context

See comprehensive analysis in `docs/ISSUE_189_NEXT_STEPS.md` (Section 3).

**Recommended Implementation**: This can be bundled with Issue #1 or #5 as it's trivial work. Good housekeeping task.

## Effort Estimation

- [x] **Small** (< 1 day)
- [ ] **Medium** (1-3 days)
- [ ] **Large** (1-2 weeks)
- [ ] **Extra Large** (> 2 weeks)
```

---

## Issue #4: Extract Change Detection Coordinator

### How to Create
1. Go to: https://github.com/mpbarbosa/guia_js/issues/new/choose
2. Select "Technical Debt" template
3. Copy and paste the content below

### Issue Content

**Title**: `[Tech Debt] Extract address change detection logic to separate ChangeDetectionCoordinator class`

**Labels**: `technical-debt`, `maintenance`, `refactoring`, `WebGeocodingManager`, `priority:high`, `effort:large`

**Body**:

```markdown
## Technical Debt Summary

WebGeocodingManager handles both geocoding coordination AND address component change detection (logradouro, bairro, município). This violates the Single Responsibility Principle and makes the class overly complex with multiple concerns mixed together.

**Related**: Follow-up from Issue #189 (WebGeocodingManager refactoring)

## Impact on Codebase

**Maintainability Concerns:**
- WebGeocodingManager has too many responsibilities (700+ lines)
- Change detection logic is mixed with coordination logic
- Three separate change detection methods with similar patterns
- Difficult to understand class boundaries and responsibilities

**Code Readability/Complexity:**
- Class exceeds 700 lines (coordinator + change detection + observers)
- Multiple notification methods for different change types
- Duplication across change detection methods
- Unclear separation of concerns

**Testing Difficulties:**
- Cannot test change detection in isolation from geocoding
- Large class with many dependencies makes unit testing complex
- Setup complexity grows with each added responsibility

## Current Issues

**Change Detection Methods in WebGeocodingManager:**
- `setupLogradouroChangeDetection()` - Street change detection
- `setupBairroChangeDetection()` - Neighborhood change detection  
- `setupMunicipioChangeDetection()` - Municipality change detection
- `notifyLogradouroChangeObservers()` - Notify street changes
- `notifyBairroChangeObservers()` - Notify neighborhood changes
- `notifyMunicipioChangeObservers()` - Notify municipality changes

**All called from `startTracking()` (lines 4035-4037):**
```javascript
this.setupLogradouroChangeDetection();
this.setupBairroChangeDetection();
this.setupMunicipioChangeDetection();
```

**Problems:**
- Single class doing too much
- Cannot test change detection independently
- Tight coupling between concerns

## Proposed Solution

Create separate `ChangeDetectionCoordinator` class:

```javascript
/**
 * Coordinates address component change detection for Brazilian addresses.
 * 
 * Monitors changes in logradouro (street), bairro (neighborhood), and
 * município (city) components and notifies subscribers when changes occur.
 */
class ChangeDetectionCoordinator {
    constructor(params) {
        this.addressDataExtractor = params.addressDataExtractor;
        this.observerSubject = new ObserverSubject();
    }
    
    setupChangeDetection() {
        this.setupLogradouroChangeDetection();
        this.setupBairroChangeDetection();
        this.setupMunicipioChangeDetection();
    }
    
    setupLogradouroChangeDetection() {
        // Move implementation from WebGeocodingManager
    }
    
    notifyLogradouroChange(changeDetails) {
        // Unified notification logic
    }
    
    // ... other methods
}

// Use in WebGeocodingManager
class WebGeocodingManager {
    constructor(document, params) {
        // ...
        this.changeDetectionCoordinator = new ChangeDetectionCoordinator({
            addressDataExtractor: this.addressDataExtractor
        });
    }
    
    startTracking() {
        // ...
        this.changeDetectionCoordinator.setupChangeDetection();
    }
}
```

**Benefits:**
- Each class has single responsibility
- Change detection can be tested independently
- Clearer code organization and boundaries
- Easier to modify change detection without affecting geocoding

### Referential Transparency Considerations

- Change detection involves inherent side effects (notifications)
- BUT: Logic that determines IF change occurred can be pure
- Separate pure change detection logic from side-effectful notifications
- Example:
  ```javascript
  // Pure function
  function hasAddressComponentChanged(previous, current, component) {
      return previous[component] !== current[component];
  }
  
  // Side effect at boundary
  notifyIfChanged(previous, current, component) {
      if (hasAddressComponentChanged(previous, current, component)) {
          this.notifyObservers(/* ... */);
      }
  }
  ```

## Affected Areas

- [x] `src/guia.js` - WebGeocodingManager class (move change detection out)
- [ ] `src/guia.js` - ChangeDetectionCoordinator class (new)
- [x] `__tests__/WebGeocodingManager.test.js` - Simplify tests
- [ ] `__tests__/ChangeDetectionCoordinator.test.js` - New test file
- [x] `docs/CLASS_DIAGRAM.md` - Update architecture documentation

## Priority Level

- [ ] **Critical** - Blocking development or causing production issues
- [x] **High** - Significantly impacting development velocity or code quality
- [ ] **Medium** - Noticeable impact on maintainability
- [ ] **Low** - Minor improvement that can be addressed when convenient

**Justification**: High priority because it addresses core architectural principle (Single Responsibility) and significantly reduces class complexity. Makes future modifications much easier.

## Acceptance Criteria

- [ ] ChangeDetectionCoordinator class created
- [ ] All change detection logic moved from WebGeocodingManager
- [ ] WebGeocodingManager delegates to ChangeDetectionCoordinator
- [ ] Comprehensive tests for ChangeDetectionCoordinator
- [ ] All existing tests pass (backward compatibility)
- [ ] JSDoc documentation for new class
- [ ] CLASS_DIAGRAM.md updated
- [ ] Pure functions separated from side effects where possible
- [ ] Functions follow referential transparency principles (pure, testable)
- [ ] Side effects are properly isolated
- [ ] Code is tested and tests verify no mutations occur

## Additional Context

See comprehensive analysis in `docs/ISSUE_189_NEXT_STEPS.md` (Section 4).

**Recommended Implementation**: This should be done 5th (last), after all other improvements. It's the most significant refactoring and benefits from previous improvements. Requires careful work to maintain backward compatibility.

## Effort Estimation

- [ ] **Small** (< 1 day)
- [ ] **Medium** (1-3 days)
- [x] **Large** (1-2 weeks)
- [ ] **Extra Large** (> 2 weeks)
```

---

## Issue #5: Dependency Injection for Services

### How to Create
1. Go to: https://github.com/mpbarbosa/guia_js/issues/new/choose
2. Select "Technical Debt" template
3. Copy and paste the content below

### Issue Content

**Title**: `[Tech Debt] Implement Dependency Injection for GeolocationService and ReverseGeocoder`

**Labels**: `technical-debt`, `maintenance`, `refactoring`, `WebGeocodingManager`, `priority:high`, `effort:small`

**Body**:

```markdown
## Technical Debt Summary

WebGeocodingManager directly instantiates GeolocationService and ReverseGeocoder in its constructor. This tight coupling makes testing difficult and prevents using alternative service implementations or pre-configured service instances.

**Related**: Follow-up from Issue #189 (WebGeocodingManager refactoring)

## Impact on Codebase

**Maintainability Concerns:**
- Cannot swap services for different implementations
- Hard to support multiple geocoding providers (Google Maps, Mapbox, etc.)
- Services cannot be configured independently before use
- Tight coupling to specific service implementations

**Code Readability/Complexity:**
- Direct instantiation hides what could be configurable
- No clear extension point for alternative services

**Testing Difficulties:**
- Cannot inject mock services for unit testing
- Tests must deal with real service initialization
- Cannot test WebGeocodingManager in isolation
- Difficult to test error handling scenarios

## Current Issues

**Location**: `src/guia.js` - constructor (lines 3540-3541)

```javascript
// Create services (lazy instantiation could be considered for better testability)
this.geolocationService = new GeolocationService(this.locationResult);
this.reverseGeocoder = new ReverseGeocoder();
```

**Problems:**
- Cannot configure services before passing to manager
- Cannot reuse service instances across multiple managers
- No way to lazy-load or conditionally create services
- Hard to test with mock services

## Proposed Solution

Implement constructor dependency injection:

```javascript
class WebGeocodingManager {
    constructor(document, params) {
        // Store dependencies
        this.document = document;
        this.locationResult = params.locationResult;
        this.enderecoPadronizadoDisplay = params.enderecoPadronizadoDisplay || null;
        this.referencePlaceDisplay = params.referencePlaceDisplay || null;
        
        // Initialize observer subject
        this.observerSubject = new ObserverSubject();
        
        // Initialize state
        this.currentPosition = null;
        this.currentCoords = null;

        // Initialize DOM elements and event handlers
        this._initializeUIElements();

        // Inject services or create defaults (maintaining backward compatibility)
        this.geolocationService = params.geolocationService || 
            new GeolocationService(this.locationResult);
        this.reverseGeocoder = params.reverseGeocoder || 
            new ReverseGeocoder();

        // Create and configure displayers
        this._createDisplayers();
        this._wireObservers();
    }
}
```

**Usage Examples:**

```javascript
// Default behavior (backward compatible)
const manager = new WebGeocodingManager(document, {
    locationResult: 'location-result'
});

// With custom/configured services
const customGeocoder = new ReverseGeocoder();
customGeocoder.configure({ provider: 'mapbox', timeout: 5000 });

const manager = new WebGeocodingManager(document, {
    locationResult: 'location-result',
    reverseGeocoder: customGeocoder
});

// For testing with mocks
const mockGeocoder = {
    subscribe: jest.fn(),
    currentAddress: mockAddress,
    enderecoPadronizado: mockStandardAddress
};

const manager = new WebGeocodingManager(document, {
    locationResult: 'location-result',
    reverseGeocoder: mockGeocoder
});
```

### Referential Transparency Considerations

- Dependency injection makes dependencies explicit
- Services remain side-effectful (they perform I/O)
- BUT: Injection allows replacing with pure mocks for testing
- Factory functions for services can be pure
- Makes testing easier by allowing pure mock services

## Affected Areas

- [x] `src/guia.js` - WebGeocodingManager constructor
- [x] `__tests__/WebGeocodingManager.test.js` - Add tests with injected services
- [x] Documentation - Update constructor examples
- [x] HTML test files - Update if they instantiate WebGeocodingManager

## Priority Level

- [ ] **Critical** - Blocking development or causing production issues
- [x] **High** - Significantly impacting development velocity or code quality
- [ ] **Medium** - Noticeable impact on maintainability
- [ ] **Low** - Minor improvement that can be addressed when convenient

**Justification**: High priority because it dramatically improves testability and enables future flexibility (supporting multiple geocoding providers, service configuration, etc.). This is a foundational improvement that should be done first.

## Acceptance Criteria

- [ ] Constructor accepts optional `geolocationService` parameter
- [ ] Constructor accepts optional `reverseGeocoder` parameter
- [ ] Default services created if not provided (backward compatibility)
- [ ] Tests demonstrate service injection with mocks
- [ ] All existing tests pass without modification
- [ ] JSDoc updated with injection examples
- [ ] Services can be pre-configured before injection
- [ ] Functions follow referential transparency principles (pure, testable)
- [ ] Side effects are properly isolated
- [ ] Code is tested and tests verify no mutations occur

## Additional Context

See comprehensive analysis in `docs/ISSUE_189_NEXT_STEPS.md` (Section 5).

**Recommended Implementation**: ⭐ **Start with this issue first** - it's high priority, small effort, and enables better testing for all subsequent refactoring work. This is the foundational improvement that makes everything else easier.

## Effort Estimation

- [x] **Small** (< 1 day)
- [ ] **Medium** (1-3 days)
- [ ] **Large** (1-2 weeks)
- [ ] **Extra Large** (> 2 weeks)
```

---

## Post-Creation Checklist

After creating each issue:

1. [X] Update `docs/ISSUE_189_TRACKING.md` with issue number
2. [X] Link issues together if dependencies exist
3. [X] Update this guide's status section

## Summary

**Total Issues to Create**: 5

**Implementation Order**:
1. ⭐ Issue #5 - Dependency Injection (High/Small) - START HERE
2. Issue #1 - Configuration Object (High/Small)
3. 🧹 Issue #3 - Remove Timeout (Low/Small) - Can bundle with above
4. Issue #2 - Factory Pattern (Medium/Medium)
5. 🎯 Issue #4 - Extract Change Detection (High/Large) - Final major refactoring

---

**Created**: 2025-10-08  
**Version**: 1.0  
**Related**: Issue #189  
**Author**: GitHub Copilot
