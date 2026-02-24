# Migration Guide - Guia Turístico

**Version**: 0.9.0-alpha  
**Last Updated**: 2026-02-14  
**Purpose**: Guide for upgrading between versions

---

## Table of Contents

1. [Overview](#overview)
2. [Version 0.8.x → 0.9.0](#version-08x--090)
3. [Version 0.7.x → 0.8.0](#version-07x--080)
4. [Version 0.6.x → 0.7.0](#version-06x--070)
5. [Breaking Changes Summary](#breaking-changes-summary)
6. [Deprecation Timeline](#deprecation-timeline)

---

## Overview

This guide helps you migrate your Guia Turístico application between major and minor versions. Each section includes:

- **Breaking Changes** - Changes that may break existing code
- **New Features** - New capabilities added
- **Deprecations** - Features scheduled for removal
- **Migration Steps** - Step-by-step upgrade instructions

---

## Version 0.8.x → 0.9.0

**Release Date**: 2026-02-09  
**Status**: Current Alpha Release  
**Migration Effort**: Low (mostly additions)

### Breaking Changes

#### 1. Metropolitan Region Support (New Field)

**Impact**: Low - Additive change

`BrazilianStandardAddress` now includes `regiaoMetropolitana` field:

```javascript
// Before (0.8.x)
const address = new BrazilianStandardAddress();
address.municipio = 'Recife';
address.siglaUF = 'PE';
// No metro region field

// After (0.9.0)
const address = new BrazilianStandardAddress();
address.municipio = 'Recife';
address.siglaUF = 'PE';
address.regiaoMetropolitana = 'Região Metropolitana do Recife';  // NEW
```

**Action Required**: None - backward compatible

**New Method**:

```javascript
address.regiaoMetropolitanaFormatada()  // Returns formatted region name or null
```

#### 2. HTMLHighlightCardsDisplayer DOM Updates

**Impact**: Low - Only if customizing DOM structure

New DOM element required for metropolitan region display:

```html
<!-- Required in 0.9.0 -->
<div id="regiao-metropolitana-value" class="metropolitan-region-value"></div>
```

**Action Required**:

- If using custom HTML, add the new element between municipality label and value
- See `src/index.html` for reference

### New Features

#### 1. IBGE SIDRA Integration

New demographic statistics display:

```javascript
import HTMLSidraDisplayer from './src/html/HTMLSidraDisplayer.js';

const displayer = new HTMLSidraDisplayer(document);
// Automatically displays population data from IBGE
```

**Features**:

- Offline fallback with bundled data (`libs/sidra/tab6579_municipios.json`)
- Observer pattern integration
- Brazilian Portuguese formatting

#### 2. Enhanced Button Status Messages

Improved UX with contextual button status:

```javascript
import { disableWithReason, enableWithMessage } from './src/utils/button-status.js';

const button = document.getElementById('my-button');
disableWithReason(button, "Aguardando localização para habilitar");
// Displays accessible status message below button
```

**Features**:

- WCAG 2.1 AA accessible
- Color-coded status types (info, warning, success, error)
- ARIA attributes support

#### 3. TimerManager Centralization

All application timers now managed centrally:

```javascript
import timerManager from './src/utils/TimerManager.js';

// Use instead of setInterval/setTimeout
const timerId = timerManager.setInterval(() => {
  console.log('Periodic task');
}, 1000, 'my-timer-id');

// Cleanup
timerManager.clearTimer('my-timer-id');
```

**Benefits**:

- Automatic cleanup on app shutdown
- Prevents memory leaks
- Better debugging with named IDs

### Migration Steps

#### Step 1: Update Dependencies

```bash
npm update guia.js
npm update ibira.js
npm install
```

#### Step 2: Update HTML (if custom)

Add metropolitan region display element:

```html
<div class="highlight-card">
  <div id="municipio-label" class="highlight-card-label">Município</div>
  <!-- ADD THIS LINE -->
  <div id="regiao-metropolitana-value" class="metropolitan-region-value"></div>
  <div id="municipio-value" class="highlight-card-value">—</div>
</div>
```

#### Step 3: Update CSS (if custom)

Add styles for new element:

```css
.metropolitan-region-value {
  font-size: 0.8em;
  color: #666;
  margin: 0.2em 0;
}
```

#### Step 4: Test Application

```bash
npm run test:all
npm run dev
```

Verify:

- ✅ Metropolitan region displays for metro municipalities
- ✅ No console errors
- ✅ All tests passing

---

## Version 0.7.x → 0.8.0

**Release Date**: 2026-01-28  
**Migration Effort**: Medium

### Breaking Changes

#### 1. AddressCache Refactoring

**Impact**: High - Internal architecture change

AddressCache now uses composition with 3 focused classes:

```javascript
// Before (0.7.x) - Direct AddressCache usage
const cache = new AddressCache(capacity);
cache.onAddressChange('municipio', callback);

// After (0.8.0) - Same API, different internals
const cache = new AddressCache(capacity);
cache.onAddressChange('municipio', callback);  // Still works!
```

**Action Required**: None - 100% backward compatible API

**New Internal Classes** (if extending):

- `AddressChangeDetector` - Field change detection
- `CallbackRegistry` - Callback management
- `AddressDataStore` - Data storage

#### 2. SpeechSynthesisManager Composition

**Impact**: Medium - If using internal methods

Refactored to use composition pattern:

```javascript
// Before (0.7.x)
const manager = new SpeechSynthesisManager();
await manager.loadVoices();  // Internal method

// After (0.8.0)
const manager = new SpeechSynthesisManager();
// Voice loading handled automatically by VoiceLoader component
```

**New Components**:

- `VoiceLoader` - Voice loading with exponential backoff
- `VoiceSelector` - Brazilian Portuguese voice selection
- `SpeechConfiguration` - Rate/pitch management
- `SpeechQueue` - Priority queue

**Action Required**:

- If using internal methods, update to new component APIs
- Public API unchanged

### New Features

#### 1. Chronometer Performance Timing

```javascript
import Chronometer from './src/timing/Chronometer.js';

const timer = new Chronometer();
timer.start();
// ... operation ...
timer.stop();
console.log(timer.getElapsedTimeFormatted());  // "2.5s"
```

#### 2. Enhanced Position Update Logic

Position updates now trigger on distance (20m) OR time (30s) thresholds:

```javascript
// Configuration in src/config/defaults.js
export const MINIMUM_DISTANCE_CHANGE = 20;  // meters
export const MINIMUM_TIME_CHANGE = 30;      // seconds
```

### Migration Steps

#### Step 1: Update Dependencies

```bash
npm update
```

#### Step 2: Review Custom Extensions

If you extended `AddressCache` or `SpeechSynthesisManager`:

```javascript
// Check for internal method usage
// Replace with new component APIs if needed
```

#### Step 3: Update Position Threshold Config (Optional)

```javascript
// src/config/defaults.js
export const MINIMUM_DISTANCE_CHANGE = 30;  // Adjust as needed
export const MINIMUM_TIME_CHANGE = 45;
```

#### Step 4: Test

```bash
npm run test:all
```

---

## Version 0.6.x → 0.7.0

**Release Date**: 2026-01-15  
**Migration Effort**: High

### Breaking Changes

#### 1. Observer Pattern Migration

**Impact**: Critical - Core architecture change

Event system migrated from custom events to Observer pattern:

```javascript
// Before (0.6.x)
document.addEventListener('addressFetched', handler);

// After (0.7.0)
import { ADDRESS_FETCHED_EVENT } from './src/config/defaults.js';
positionManager.addObserver(ADDRESS_FETCHED_EVENT, handler);
```

**Action Required**: Update all event listeners

#### 2. Immutability Requirements

**Impact**: High - Code style change

All collections now use immutable operations:

```javascript
// Before (0.6.x) - Mutating operations
array.push(item);
array.sort();

// After (0.7.0) - Immutable operations
array = [...array, item];
array = [...array].sort();
```

**Action Required**: Review all array/object mutations

#### 3. Singleton Pattern Enforcement

**Impact**: Medium - Architectural change

Key classes now enforce singleton pattern:

```javascript
// Before (0.6.x)
const manager1 = new PositionManager();
const manager2 = new PositionManager();  // Creates new instance

// After (0.7.0)
const manager1 = PositionManager.getInstance();
const manager2 = PositionManager.getInstance();  // Returns same instance
```

**Action Required**: Use `getInstance()` for singletons

### Migration Steps

#### Step 1: Update Event System

```javascript
// Find all custom event listeners
// Replace with Observer pattern

// Example migration script:
import { ADDRESS_FETCHED_EVENT } from './src/config/defaults.js';

// Old
document.addEventListener('addressFetched', handleAddress);

// New
positionManager.addObserver(ADDRESS_FETCHED_EVENT, handleAddress);
```

#### Step 2: Fix Mutating Operations

```bash
# Use ESLint to find mutations
npm run lint
```

Common patterns to fix:

```javascript
// Array mutations
array.push(item)        → array = [...array, item]
array.pop()             → array = array.slice(0, -1)
array.sort()            → array = [...array].sort()
array.splice(i, 1)      → array = array.filter((_, idx) => idx !== i)

// Object mutations
obj.prop = value        → obj = { ...obj, prop: value }
delete obj.prop         → const { prop, ...rest } = obj; obj = rest
```

#### Step 3: Update Singleton Usage

```javascript
// Find all singleton instantiations
// Replace with getInstance()

import PositionManager from './src/core/PositionManager.js';
const manager = PositionManager.getInstance();
```

#### Step 4: Comprehensive Testing

```bash
npm run test:all
npm run dev  # Manual testing
```

Verify:

- ✅ No console errors
- ✅ Events firing correctly
- ✅ No mutations in collections
- ✅ Singleton instances working

---

## Breaking Changes Summary

### Version 0.9.0

- ✅ **Low Impact**: Metropolitan region field (additive)
- ✅ **Low Impact**: New DOM element (optional until using feature)

### Version 0.8.0

- ⚠️ **Medium Impact**: Internal architecture (backward compatible API)
- ✅ **Low Impact**: New composition components

### Version 0.7.0

- ❌ **High Impact**: Observer pattern migration
- ❌ **High Impact**: Immutability requirements
- ⚠️ **Medium Impact**: Singleton enforcement

---

## Deprecation Timeline

### Currently Deprecated (Removal in 1.0.0)

#### 1. Custom Event System

**Deprecated**: 0.7.0  
**Removal**: 1.0.0  
**Alternative**: Observer pattern

```javascript
// DEPRECATED
document.addEventListener('addressFetched', handler);

// USE INSTEAD
import { ADDRESS_FETCHED_EVENT } from './src/config/defaults.js';
positionManager.addObserver(ADDRESS_FETCHED_EVENT, handler);
```

#### 2. Direct Singleton Instantiation

**Deprecated**: 0.7.0  
**Removal**: 1.0.0  
**Alternative**: `getInstance()` method

```javascript
// DEPRECATED
const manager = new PositionManager();

// USE INSTEAD
const manager = PositionManager.getInstance();
```

#### 3. VoiceManager Class

**Deprecated**: 0.9.0  
**Removal**: 1.0.0  
**Alternative**: VoiceLoader + VoiceSelector

```javascript
// DEPRECATED
const manager = new VoiceManager();

// USE INSTEAD
import VoiceLoader from './src/speech/VoiceLoader.js';
import VoiceSelector from './src/speech/VoiceSelector.js';

const loader = new VoiceLoader();
await loader.loadVoices();
const selector = new VoiceSelector();
const voice = selector.selectVoice(loader.getVoices());
```

### Soft Deprecations (No Removal Planned)

These patterns are discouraged but will continue working:

#### 1. Mutating Operations

```javascript
// DISCOURAGED (but works)
array.push(item);

// PREFERRED
array = [...array, item];
```

#### 2. Hardcoded Strings

```javascript
// DISCOURAGED
positionManager.addObserver('addressFetched', handler);

// PREFERRED
import { ADDRESS_FETCHED_EVENT } from './src/config/defaults.js';
positionManager.addObserver(ADDRESS_FETCHED_EVENT, handler);
```

---

## Migration Support

### Getting Help

- **Documentation**: [docs/api/README.md](./api/README.md)
- **Examples**: [examples/](../examples/)
- **Issues**: [GitHub Issues](https://github.com/mpbarbosa/guia_turistico/issues)

### Testing Your Migration

Run comprehensive tests after migration:

```bash
# Full test suite
npm run test:all

# Development server
npm run dev

# Production build test
npm run build
npm run preview
```

### Common Migration Issues

#### Issue: "Observer not firing"

**Solution**: Check event constant import

```javascript
import { ADDRESS_FETCHED_EVENT } from './src/config/defaults.js';
```

#### Issue: "Singleton returns different instances"

**Solution**: Ensure using `getInstance()`

```javascript
const manager = PositionManager.getInstance();
```

#### Issue: "Tests failing after mutation fixes"

**Solution**: Update test expectations

```javascript
// Tests may need to check new array reference
expect(result).not.toBe(original);  // Different reference now
```

---

## Rollback Procedures

If migration issues occur, rollback safely:

### Step 1: Revert Dependencies

```bash
# From package-lock.json
git checkout HEAD~1 package-lock.json
npm ci
```

### Step 2: Revert Code Changes

```bash
git checkout HEAD~1 src/
```

### Step 3: Test Rollback

```bash
npm test
```

### Step 4: Report Issue

Create issue with migration details for support.

---

## Version Support Policy

- **Current Version** (0.9.x): Full support
- **Previous Minor** (0.8.x): Security fixes only
- **Older Versions** (≤0.7.x): Unsupported - upgrade recommended

**Upgrade Timeline Recommendation**:

- Major version releases: Upgrade within 6 months
- Minor version releases: Upgrade within 3 months
- Patch version releases: Upgrade within 1 month

---

**Need Help?** Open an issue with tag `migration-help` for assistance.
