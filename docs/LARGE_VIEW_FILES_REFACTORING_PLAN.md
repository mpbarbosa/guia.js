# Large View Files Refactoring Plan

**Date**: 2026-01-24  
**Status**: 📋 DOCUMENTED (Deferred to future sprint)  
**Priority**: MEDIUM  
**Estimated Effort**: 2 days (16 hours)

---

## Current Status

### File Sizes
- `src/views/home.js`: **580 lines** (down from 659)
- `src/views/converter.js`: **526 lines** (down from 603)
- **Total**: 1,106 lines

**Already Improved**: 156 lines reduced through address parser deduplication ✅

---

## Problem Analysis

### What Views Currently Contain

Views are doing too much (violating Single Responsibility Principle):

1. **HTML Rendering** (appropriate for views)
2. **Business Logic** (should be in services)
3. **Event Handling** (should be in controllers/handlers)
4. **State Management** (should be in view models)
5. **Lifecycle Hooks** (appropriate but can be simplified)

### Example Issues

**home.js Mixed Responsibilities**:
```javascript
// ❌ BAD - Business logic in view
_determineLocationType(address) {
  return determineLocationType(address);
}

// ❌ BAD - Complex state management in view
_setupCacheDisplayHandlers() {
  const updateCacheDisplay = () => {
    const tamCache = document.getElementById("tam-cache");
    if (tamCache && this.manager.cache) {
      tamCache.textContent = this.manager.cache.size || 0;
    }
  };
  timerManager.setInterval(updateCacheDisplay, 5000, 'home-cache-display');
}

// ❌ BAD - Event handlers with business logic
_setupGetLocationButton() {
  const locationBtn = document.getElementById("obter-localizacao-btn");
  if (locationBtn) {
    locationBtn.addEventListener('click', () => {
      // 50+ lines of complex logic here
    });
  }
}
```

---

## Proposed Architecture

### Service Layer Pattern

```
src/
├── views/
│   ├── home.js          (200 lines - UI only)
│   └── converter.js     (200 lines - UI only)
├── services/
│   ├── LocationService.js      (150 lines)
│   ├── TrackingService.js      (100 lines)
│   └── DisplayService.js       (100 lines)
├── viewmodels/
│   ├── HomeViewModel.js        (150 lines)
│   └── ConverterViewModel.js   (150 lines)
└── handlers/
    ├── LocationButtonHandler.js (80 lines)
    └── TrackingToggleHandler.js (80 lines)
```

---

## Refactoring Plan

### Phase 1: Extract Services (8 hours)

#### 1.1 Create LocationService
**File**: `src/services/LocationService.js`
**Responsibility**: Geolocation operations

```javascript
export class LocationService {
  constructor(geocodingManager) {
    this.manager = geocodingManager;
  }

  async getCurrentLocation() {
    // Extract location fetching logic
  }

  startTracking(options) {
    // Extract continuous tracking logic
  }

  stopTracking() {
    // Extract stop logic
  }
}
```

**Extracts from home.js**:
- Lines 240-290 (getCurrentLocation logic)
- Lines 470-520 (tracking setup)
- Lines 530-550 (tracking cleanup)

#### 1.2 Create DisplayService
**File**: `src/services/DisplayService.js`
**Responsibility**: UI state updates

```javascript
export class DisplayService {
  constructor() {
    this.elements = new Map();
  }

  registerElement(id, element) {
    this.elements.set(id, element);
  }

  updateText(id, text) {
    const el = this.elements.get(id);
    if (el) el.textContent = text;
  }

  updateVisibility(id, visible) {
    const el = this.elements.get(id);
    if (el) el.style.display = visible ? '' : 'none';
  }
}
```

**Extracts from home.js**:
- Lines 570-580 (_renderToElement)
- Lines 390-420 (cache display logic)
- Lines 550-570 (speech queue display)

#### 1.3 Create TrackingService
**File**: `src/services/TrackingService.js`
**Responsibility**: Continuous tracking state

```javascript
export class TrackingService {
  constructor(locationService) {
    this.locationService = locationService;
    this.isTracking = false;
    this.trackingId = null;
  }

  async start(options) {
    if (this.isTracking) return;
    this.isTracking = true;
    this.trackingId = await this.locationService.startTracking(options);
  }

  stop() {
    if (!this.isTracking) return;
    this.locationService.stopTracking();
    this.isTracking = false;
    this.trackingId = null;
  }

  getState() {
    return {
      isTracking: this.isTracking,
      trackingId: this.trackingId
    };
  }
}
```

**Extracts from home.js**:
- Lines 495-535 (tracking toggle logic)
- Lines 295-310 (tracking state management)

---

### Phase 2: Create ViewModels (4 hours)

#### 2.1 HomeViewModel
**File**: `src/viewmodels/HomeViewModel.js`

```javascript
export class HomeViewModel {
  constructor(locationService, trackingService, displayService) {
    this.locationService = locationService;
    this.trackingService = trackingService;
    this.displayService = displayService;
    this.state = {
      isLoading: false,
      error: null,
      position: null,
      address: null,
      continuousMode: false
    };
  }

  async getLocation() {
    this.setState({ isLoading: true, error: null });
    try {
      const position = await this.locationService.getCurrentLocation();
      this.setState({ position, isLoading: false });
    } catch (error) {
      this.setState({ error: error.message, isLoading: false });
    }
  }

  toggleTracking() {
    if (this.state.continuousMode) {
      this.trackingService.stop();
      this.setState({ continuousMode: false });
    } else {
      this.trackingService.start();
      this.setState({ continuousMode: true });
    }
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notifyObservers();
  }

  notifyObservers() {
    // Update display service
    this.displayService.updateFromState(this.state);
  }
}
```

---

### Phase 3: Extract Event Handlers (2 hours)

#### 3.1 LocationButtonHandler
**File**: `src/handlers/LocationButtonHandler.js`

```javascript
export class LocationButtonHandler {
  constructor(viewModel) {
    this.viewModel = viewModel;
  }

  attach(buttonElement) {
    buttonElement.addEventListener('click', () => this.handleClick());
  }

  async handleClick() {
    await this.viewModel.getLocation();
  }
}
```

---

### Phase 4: Refactor Views (2 hours)

#### 4.1 Simplified home.js

```javascript
export default {
  title: 'Guia Turístico - Localização',
  
  // Services (injected or created)
  locationService: null,
  trackingService: null,
  displayService: null,
  viewModel: null,
  
  styles: [],
  
  render() {
    return `<!-- HTML only, no logic -->`;
  },
  
  mount() {
    // Initialize services
    this._initServices();
    
    // Setup handlers
    this._setupHandlers();
  },
  
  _initServices() {
    const manager = new WebGeocodingManager('output');
    this.locationService = new LocationService(manager);
    this.trackingService = new TrackingService(this.locationService);
    this.displayService = new DisplayService();
    this.viewModel = new HomeViewModel(
      this.locationService,
      this.trackingService,
      this.displayService
    );
  },
  
  _setupHandlers() {
    const locationBtn = document.getElementById("obter-localizacao-btn");
    this.locationHandler = new LocationButtonHandler(this.viewModel);
    this.locationHandler.attach(locationBtn);
  },
  
  cleanup() {
    this.trackingService?.stop();
    this.locationService?.cleanup();
    timerManager.clearTimer('home-cache-display');
    timerManager.clearTimer('home-speech-queue-display');
  }
};
```

**Result**: ~200 lines (down from 580)

---

## Benefits

### 1. Single Responsibility
- Views: Only UI rendering and basic DOM manipulation
- Services: Business logic and external integrations
- ViewModels: State management and coordination
- Handlers: Event processing

### 2. Testability
- Services can be unit tested independently
- ViewModels can be tested without DOM
- Handlers can be tested with mock elements
- Views can be tested with mock services

### 3. Reusability
- Services can be shared between views
- ViewModels follow consistent patterns
- Handlers can be composed

### 4. Maintainability
- Smaller files (200 lines each)
- Clear separation of concerns
- Easier to locate and fix bugs

---

## Implementation Checklist

### Phase 1: Services (Day 1 morning)
- [ ] Create `src/services/` directory
- [ ] Implement LocationService.js
- [ ] Implement TrackingService.js
- [ ] Implement DisplayService.js
- [ ] Write service unit tests
- [ ] Test services independently

### Phase 2: ViewModels (Day 1 afternoon)
- [ ] Create `src/viewmodels/` directory
- [ ] Implement HomeViewModel.js
- [ ] Implement ConverterViewModel.js
- [ ] Write view model tests
- [ ] Test state management

### Phase 3: Handlers (Day 2 morning)
- [ ] Create `src/handlers/` directory
- [ ] Implement LocationButtonHandler.js
- [ ] Implement TrackingToggleHandler.js
- [ ] Write handler tests

### Phase 4: View Refactoring (Day 2 afternoon)
- [ ] Refactor home.js to use services
- [ ] Refactor converter.js to use services
- [ ] Update view tests
- [ ] Integration testing
- [ ] E2E testing

---

## Risks & Mitigation

### Risk 1: Breaking Changes
**Mitigation**: Comprehensive test coverage before refactoring

### Risk 2: Over-Engineering
**Mitigation**: Start simple, add complexity only when needed

### Risk 3: Time Overrun
**Mitigation**: Phase by phase approach, can stop after each phase

---

## Success Metrics

### Before
- home.js: 580 lines (mixed responsibilities)
- converter.js: 526 lines (mixed responsibilities)
- Testability: Medium (DOM-dependent)
- Reusability: Low (tight coupling)

### After
- home.js: ~200 lines (UI only)
- converter.js: ~200 lines (UI only)
- Services: 3 files, ~350 lines
- ViewModels: 2 files, ~300 lines
- Handlers: 2 files, ~160 lines
- Testability: High (services independent)
- Reusability: High (services shared)

### Total Lines
- Before: 1,106 lines
- After: ~1,210 lines (104 more, but better organized)
- Trade-off: Slightly more code, but much better structure

---

## When to Implement

**Recommended**: Next sprint or when:
1. Adding significant new features to views
2. Multiple bugs in view layer
3. Need to reuse location/tracking logic
4. Team has 2 days available

**Priority**: MEDIUM (not urgent, but beneficial)

---

## Alternative: Incremental Approach

If 2 days is too much, do incrementally:

### Week 1: Extract one service (4 hours)
- LocationService only
- Update home.js to use it
- Tests

### Week 2: Extract another service (4 hours)
- DisplayService
- Update both views
- Tests

### Week 3: Extract handlers (4 hours)
- Event handlers
- Final cleanup

---

**Status**: 📋 DOCUMENTED, ready for implementation when prioritized  
**Effort**: 2 days (16 hours) or incremental over 3 weeks  
**Impact**: HIGH (better maintainability, testability, reusability)  
**Risk**: LOW (can be done incrementally)
