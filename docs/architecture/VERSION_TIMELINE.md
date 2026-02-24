# Guia Turístico - Architecture Version Timeline

## Overview

This document provides a comprehensive timeline of architectural changes across versions of the Guia Turístico project. It helps developers understand when features were introduced, when breaking changes occurred, and the evolution of the codebase.

**Current Version**: 0.9.0-alpha (February 9, 2026)

## Version Timeline Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Guia Turístico Version Timeline                          │
└─────────────────────────────────────────────────────────────────────────────┘

0.5.x-alpha (Pre-October 2025)
├── Initial implementations with mutable patterns
├── GeoPosition with side effects (logging, mutation)
├── Basic position management
└── ⚠️  Legacy - Not recommended for new code

         │
         ├─── BREAKING CHANGES ───
         │
         ↓

0.9.0-alpha (October 11, 2025) ⭐ Major Milestone
├── GeoPosition refactored to immutable/pure
│   ├── ✅ Removed accuracy setter
│   ├── ✅ Constructor no longer mutates inputs
│   ├── ✅ Defensive copying implemented
│   └── ✅ 13 new immutability tests added
│
├── PositionManager introduced (Singleton + Observer)
│   ├── ✅ Multi-layer validation (accuracy, distance, time)
│   ├── ✅ Observer pattern for subscriptions
│   └── ✅ Integration with GeoPosition
│
├── WebGeocodingManager introduced (Coordinator pattern)
│   ├── ✅ Service coordination (GeolocationService, ReverseGeocoder)
│   ├── ✅ Observer pattern for position/address changes
│   └── ✅ UI element initialization
│
└── Architecture established: Core domain, Service, Data processing layers

         │
         ↓

0.9.0-alpha (January 3, 2026)
├── Stable release - refinements only
├── Enhanced validation logic in PositionManager
├── Improved observer pattern integration
├── Planning for PR #189 refactoring
└── ✅ Full backward compatibility maintained

         │
         ↓

0.9.0-alpha (January 11, 2026)
├── Documentation improvements
│   ├── ✅ Test counts corrected (1,739/1,882)
│   ├── ✅ Version consistency achieved
│   ├── ✅ JSDoc coverage documented (100%)
│   ├── ✅ Cross-references enhanced
│   └── ✅ Architecture version timeline added
│
├── Stable implementation - no code changes
├── All tests passing (1,739 passing / 1,968 total)
└── ✅ Ready for production deployment

         │
         ↓

0.9.0-alpha (January 28, 2026) ← CURRENT VERSION
├── Metropolitan Region Display Feature ⭐
│   ├── ✅ BrazilianStandardAddress: regiaoMetropolitana property
│   ├── ✅ AddressExtractor: Extract county field from Nominatim
│   ├── ✅ HTMLHighlightCardsDisplayer: Show metro region
│   ├── ✅ regiaoMetropolitanaFormatada() method
│   └── ✅ 77 new tests (19 unit + 26 unit + 28 unit + 4 E2E)
│
├── Município State Abbreviation Display ⭐
│   ├── ✅ Display format: "Recife, PE" instead of "Recife"
│   ├── ✅ Fallback to município name only
│   ├── ✅ BrazilianStandardAddress.municipioCompleto() method
│   └── ✅ 42 unit tests covering all 26 states
│
├── Test Suite Expansion
│   ├── ✅ 2,236 tests passing (vs 1,739 in v0.9.0)
│   ├── ✅ +497 new tests (+28.6% coverage)
│   ├── ✅ 4 E2E suites, 93 passing
│   └── ✅ 101 test suites (97 passing)
│
├── Documentation Improvements
│   ├── ✅ FEATURE_METROPOLITAN_REGION_DISPLAY.md
│   ├── ✅ FEATURE_MUNICIPIO_STATE_DISPLAY.md
│   ├── ✅ Enhanced copilot-instructions.md
│   └── ✅ Updated version consistency across codebase
│
└── Code Quality
    ├── ✅ Removed unused export default from home.js
    └── ✅ Version alignment (package.json ↔ defaults.js)

         │
         ↓

0.8.x-alpha (Planned Future - PR #189)
├── WebGeocodingManager major refactoring
│   ├── 🔄 Dependency injection for services
│   ├── 🔄 ChangeDetectionCoordinator extraction
│   ├── 🔄 High cohesion improvements
│   ├── 🔄 Enhanced DisplayerFactory pattern
│   └── ✅ 100% backward compatibility maintained
│
├── ReferencePlace class implementation
│   ├── 🔄 Reference place data encapsulation
│   ├── 🔄 Portuguese descriptions
│   └── 🔄 Immutable instances
│
├── PositionManager enhancements
│   ├── 🔄 ObserverSubject delegation
│   └── 🔄 Enhanced validation rules
│
└── Performance optimizations and test coverage improvements
```

## Component-Specific Version History

### GeoPosition Class

| Version | Date | Status | Key Changes |
|---------|------|--------|-------------|
| 0.5.x-alpha | Pre-Oct 2025 | ⚠️ Deprecated | Mutable implementation with side effects |
| **0.9.0-alpha** | Oct 11, 2025 | ⭐ Breaking | Immutable, pure functions, defensive copying |
| 0.9.0-alpha | Jan 3, 2026 | ✅ Stable | No changes |
| **0.9.0-alpha** | Jan 11, 2026 | ✅ Current | Documentation updates only |

**Breaking Changes in 0.9.0-alpha**:

- ❌ Removed `accuracy` setter (immutability)
- ❌ Constructor no longer logs creation
- ❌ Constructor no longer mutates input objects
- ✅ All properties set once at construction
- ✅ All methods are pure functions

**Test Coverage**: 62+ tests (24 standard, 13 immutability, 25 integration)

---

### PositionManager Class

| Version | Date | Status | Key Changes |
|---------|------|--------|-------------|
| **0.9.0-alpha** | Oct 2025 | ⭐ Initial | Singleton + Observer patterns, validation rules |
| 0.9.0-alpha | Jan 3, 2026 | ✅ Stable | Refined validation logic |
| **0.9.0-alpha** | Jan 11, 2026 | ✅ Current | Documentation updates only |
| 0.8.x-alpha | Planned | 🔄 Future | Enhanced observer management |

**Key Features**:

- ✅ Singleton pattern (single position state)
- ✅ Observer pattern (subscribe/unsubscribe)
- ✅ Multi-layer validation (accuracy, distance, time)
- ✅ Event types: `strCurrPosUpdate`, `strCurrPosNotUpdate`, `strImmediateAddressUpdate`

**Test Coverage**: 17+ comprehensive tests

---

### WebGeocodingManager Class

| Version | Date | Status | Key Changes |
|---------|------|--------|-------------|
| **0.9.0-alpha** | Oct 2025 | ⭐ Initial | Coordinator pattern, service creation, UI management |
| 0.9.0-alpha | Jan 3, 2026 | ✅ Stable | Planning for refactoring |
| **0.9.0-alpha** | Jan 11, 2026 | ✅ Current | Documentation updates only |
| 0.8.x-alpha | Planned | 🔄 Major | PR #189 refactoring (dependency injection, extraction) |

**Current Features**:

- ✅ Service coordination (GeolocationService, ReverseGeocoder)
- ✅ Observer pattern for position/address changes
- ✅ UI element initialization and event binding
- ✅ `startTracking()` for continuous monitoring

**Planned Improvements (0.8.x-alpha)**:

- 🔄 Dependency injection for testability
- 🔄 ChangeDetectionCoordinator extraction
- 🔄 High cohesion (focused methods)
- 🔄 Low coupling (configuration objects)
- ✅ 100% backward compatibility maintained

**Test Coverage**: 23 unit tests (planned for 0.8.x-alpha)

---

### ReferencePlace Class

| Version | Date | Status | Key Changes |
|---------|------|--------|-------------|
| 0.8.x-alpha | Planned | 🔄 Future | Initial implementation with immutable instances |

**Planned Features**:

- 🔄 Automatic extraction from geocoding data
- 🔄 Portuguese descriptions for reference place types
- 🔄 Immutable instances (frozen after creation)
- 🔄 Integration with AddressExtractor

---

## Migration Guides

### Migrating from 0.5.x-alpha to 0.9.0-alpha

#### GeoPosition Breaking Changes

**Before (0.5.x-alpha)**:

```javascript
const position = new GeoPosition(browserPosition);
position.accuracy = 20;  // Mutates and updates accuracyQuality
console.log(position.toString());  // Logs during construction
```

**After (0.9.0-alpha and later)**:

```javascript
// Option 1: Create new instance with different accuracy
const newBrowserPosition = {
    ...browserPosition,
    coords: { ...browserPosition.coords, accuracy: 20 }
};
const position = new GeoPosition(newBrowserPosition);

// Option 2: For continuous updates, create new instances
navigator.geolocation.watchPosition((browserPos) => {
    const position = new GeoPosition(browserPos);  // New instance each time
    handlePositionUpdate(position);
});

// Manual logging if needed
console.log("Created position:", position.toString());
```

### No Breaking Changes from 0.9.0-alpha to 0.9.0-alpha

✅ **Full backward compatibility maintained**. Code written for 0.9.0-alpha works unchanged in 0.9.0-alpha and 0.9.0-alpha.

### Preparing for 0.8.x-alpha (PR #189)

While PR #189 introduces significant refactoring, **100% backward compatibility is maintained**. However, new code should prefer the enhanced patterns:

**Current (0.9.0-alpha)** - Still works in 0.8.x-alpha:

```javascript
const manager = new WebGeocodingManager(document, {
    locationResult: 'location-result'
});
manager.startTracking();
```

**Enhanced (0.8.x-alpha)** - Recommended for new code:

```javascript
// Dependency injection for testability
const manager = new WebGeocodingManager(
    document,
    { locationResult: 'location-result' },
    {
        geolocationService: mockGeolocationService,  // Injected for testing
        reverseGeocoder: mockReverseGeocoder,         // Injected for testing
        displayerFactory: mockDisplayerFactory        // Injected for testing
    }
);
manager.startTracking();
```

---

## Version Decision Matrix

Use this matrix to determine which version to use for different scenarios:

| Scenario | Recommended Version | Notes |
|----------|---------------------|-------|
| **New projects** | 0.9.0-alpha | Current stable release |
| **Production deployment** | 0.9.0-alpha | Thoroughly tested, 1,739 passing tests |
| **Existing 0.9.0 projects** | 0.9.0-alpha | Drop-in upgrade, no changes needed |
| **Existing 0.5.x projects** | 0.9.0-alpha | Migration required (see guide above) |
| **Testing/development** | 0.9.0-alpha or 0.8.x-alpha branch | 0.8.x-alpha for upcoming features |
| **Legacy support** | 0.9.0-alpha | If migration not feasible |

---

## Deprecation Policy

### Currently Deprecated

1. **GeoPosition 0.5.x-alpha patterns** (Deprecated in 0.9.0-alpha)
   - ❌ Using `position.accuracy = value` setter
   - ❌ Relying on constructor logging
   - ❌ Sharing position object references
   - **Action**: Migrate to immutable patterns (see migration guide)

2. **GeoPosition.calculateAccuracyQuality() method** (Deprecated in 0.9.0-alpha)
   - ❌ Instance method has bug (calls undefined function)
   - ✅ Use `position.accuracyQuality` property instead
   - ✅ Or use static method `GeoPosition.getAccuracyQuality(accuracy)`

### Planned Deprecations (0.8.x-alpha)

No deprecations planned. PR #189 refactoring maintains full backward compatibility.

---

## Testing Across Versions

### Test Coverage by Version

| Version | Total Tests | Passing | Skipped | Coverage |
|---------|-------------|---------|---------|----------|
| 0.9.0-alpha | ~1,400 | ~1,200 | ~100 | ~65% |
| 0.9.0-alpha | 1,438 | 1,301 | 137 | ~68% |
| **0.9.0-alpha** | **1,882** | **1,739** | **143** | **~70%** |
| 0.8.x-alpha (planned) | 1,680+ | 1,550+ | 130 | ~75% |

### Running Tests for Specific Versions

```bash
# Current version tests (0.9.0-alpha)
npm test                    # ~7 seconds, 1,739 passing
npm run test:coverage       # ~7 seconds, ~70% coverage
npm run test:all            # ~8 seconds, syntax + tests

# Test specific components
npm test -- __tests__/CurrentPosition.test.js           # GeoPosition tests
npm test -- __tests__/unit/GeoPosition.immutability.test.js  # Immutability
npm test -- __tests__/PositionManager.test.js           # PositionManager tests
```

---

## Related Documentation

### Architecture Documentation

- **[GEO_POSITION.md](./GEO_POSITION.md)** - GeoPosition class with version history
- **[POSITION_MANAGER.md](./POSITION_MANAGER.md)** - PositionManager class with version history
- **[WEB_GEOCODING_MANAGER.md](./WEB_GEOCODING_MANAGER.md)** - WebGeocodingManager class with version history
- **[CLASS_DIAGRAM.md](./CLASS_DIAGRAM.md)** - Complete architecture overview
- **[REFERENCE_PLACE.md](./REFERENCE_PLACE.md)** - Planned ReferencePlace class

### Development Guidelines

- **[REFERENTIAL_TRANSPARENCY.md](../../.github/REFERENTIAL_TRANSPARENCY.md)** - Immutability and pure functions
- **[CONTRIBUTING.md](../../.github/CONTRIBUTING.md)** - Contribution guidelines
- **[TDD_GUIDE.md](../../.github/TDD_GUIDE.md)** - Test-driven development

### Project Documentation

- **[README.md](../../README.md)** - Project overview and quick start
- **[CHANGELOG](../../CHANGELOG.md)** - Detailed change log (if available)
- **[PROJECT_PURPOSE_AND_ARCHITECTURE.md](../PROJECT_PURPOSE_AND_ARCHITECTURE.md)** - Project goals and architecture

---

## Version Stability Ratings

| Version | Stability | Recommended For | Notes |
|---------|-----------|-----------------|-------|
| 0.5.x-alpha | ⚠️ Deprecated | Legacy support only | Mutable patterns, side effects |
| 0.9.0-alpha | ✅ Stable | Legacy projects | Breaking changes, use for compatibility |
| 0.9.0-alpha | ✅ Stable | Production | Minor refinements, fully compatible |
| **0.9.0-alpha** | ✅ **Current** | **Production** | **Recommended for all new projects** |
| 0.8.x-alpha | 🔄 In Development | Testing/Development | Major refactoring, 100% backward compatible |

---

## Frequently Asked Questions

### Q: Can I upgrade from 0.9.0-alpha to 0.9.0-alpha without changes?

**A**: Yes! ✅ Full backward compatibility is maintained. Simply update package.json version.

### Q: What happens to my 0.5.x-alpha code in 0.9.0-alpha?

**A**: It will break. ❌ You must migrate to immutable patterns. See migration guide above.

### Q: Will 0.8.x-alpha break my 0.9.0-alpha code?

**A**: No! ✅ PR #189 maintains 100% backward compatibility. New features are additive.

### Q: Which version should I use for production?

**A**: Version 0.9.0-alpha is recommended. It's stable, thoroughly tested, and production-ready.

### Q: How do I test against multiple versions?

**A**: Use git tags and npm version management:

```bash
git checkout v0.9.0-alpha && npm install && npm test
git checkout v0.9.0-alpha && npm install && npm test
git checkout v0.9.0-alpha && npm install && npm test
```

### Q: What's the release schedule?

**A**: Alpha versions are released as features stabilize. No fixed schedule. Monitor GitHub releases.

---

## Contributing Version Information

When documenting new features or changes:

1. **Add version context** to all architecture documents:

   ```markdown
   Introduced in version X.X.X-alpha, stable in Y.Y.Y-alpha
   ```

2. **Update version history sections** in component documentation

3. **Create migration guides** for breaking changes

4. **Update this timeline** when significant changes occur

5. **Tag git commits** with version numbers:

   ```bash
   git tag v0.9.0-alpha
   git push origin v0.9.0-alpha
   ```

---

**Last Updated**: 2026-02-09  
**Document Version**: 1.0  
**Status**: ✅ Complete and up-to-date

**Maintainer**: Marcelo Pereira Barbosa  
**Contact**: See repository root for contact information
