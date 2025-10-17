# Refactoring Notes: Move referencePlaceMap to ReferencePlace Class

## Issue
Technical debt issue requesting to move `setupParams.referencePlaceMap` to the `ReferencePlace` class.

## Motivation
- **High Cohesion**: The `referencePlaceMap` is only used for reference place classification, so it should belong with the `ReferencePlace` class
- **Low Coupling**: Reduces dependency on `setupParams` for ReferencePlace-specific data
- **Maintainability**: Makes it clearer that this mapping is specifically for ReferencePlace functionality

## Changes Made

### 1. Moved referencePlaceMap to ReferencePlace class (src/guia.js)
```javascript
class ReferencePlace {
    static referencePlaceMap = {
        "place": { "house": "Residencial" },
        "shop": { 
            "mall": "Shopping Center",
            "car_repair": "Oficina Mecânica"
        },
        "amenity": { "cafe": "Café" },
        "railway": { 
            "subway": "Estação do Metrô",
            "station": "Estação do Metrô"
        },
    };
    // ... rest of the class
}
```

### 2. Updated ReferencePlace.calculateDescription() method
Changed from `setupParams.referencePlaceMap` to `ReferencePlace.referencePlaceMap`:
```javascript
if (ReferencePlace.referencePlaceMap[this.className] &&
    ReferencePlace.referencePlaceMap[this.className][this.typeName]) {
    // ...
}
```

### 3. Updated getAddressType() function
Changed from `setupParams.referencePlaceMap` to `ReferencePlace.referencePlaceMap`:
```javascript
if (ReferencePlace.referencePlaceMap[className] &&
    ReferencePlace.referencePlaceMap[className][typeName]) {
    return ReferencePlace.referencePlaceMap[className][typeName];
}
```

### 4. Updated test assertions
Changed test to reference the new location:
```javascript
test('should use referencePlaceMap from ReferencePlace class', () => {
    const map = ReferencePlace.referencePlaceMap;
    // ... test logic
});
```

## Impact

### Files Modified
1. `src/guia.js` - Core implementation
2. `__tests__/unit/ReferencePlace.test.js` - Unit test update
3. `__tests__/e2e/BrazilianAddressProcessing.e2e.test.js` - E2E test update

### Test Results
- All ReferencePlace unit tests passing (24/24)
- All BrazilianAddressProcessing e2e tests passing (16/16)
- Overall test suite: 543/549 passing (6 pre-existing unrelated failures)

### Benefits Achieved
✅ **High Cohesion** - Data colocated with the class that uses it
✅ **Low Coupling** - Reduced dependency on setupParams
✅ **Maintainability** - Clearer code organization
✅ **Referential Transparency** - Consistent behavior across instances

## Backward Compatibility
- Test mock setups that define `setupParams.referencePlaceMap` continue to work
- The actual runtime code now uses `ReferencePlace.referencePlaceMap`
- No breaking changes to public API

## Future Considerations
- The `referencePlaceMap` could be made truly immutable by using `Object.freeze()` on the static property
- Additional mappings can be added to the static property as needed
- Consider extracting to a separate configuration file if the mapping grows significantly

## Author
Refactored by GitHub Copilot on 2025-10-10

## References
- Original issue: [Tech Debt] Move referencePlaceMap to class ReferencePlace
- High Cohesion Guide: `.github/HIGH_COHESION_GUIDE.md`
- Low Coupling Guide: `.github/LOW_COUPLING_GUIDE.md`
- Referential Transparency Guide: `.github/REFERENTIAL_TRANSPARENCY.md`
