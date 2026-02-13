# Views Layer Documentation

**Version**: 0.9.0+  
**Location**: `src/views/`  
**Purpose**: SPA view controllers for route-specific functionality

## Overview

The views layer contains JavaScript modules that control individual pages (routes) in the single-page application. Each view module handles:

- Page-specific DOM initialization
- User interaction event handlers
- Display component coordination
- Route-specific business logic

## Current Views

### 1. Home View (`home.js`)

**Route**: `/` or `#/`  
**Purpose**: Main location tracking interface  
**File Size**: ~24KB  

**Responsibilities**:
- Initialize geolocation tracking
- Coordinate all display components (position, address, cards, SIDRA)
- Handle "Get Location" button interactions
- Manage real-time position updates
- Speech synthesis for location changes

**Key Components**:
```javascript
import WebGeocodingManager from '../coordination/WebGeocodingManager.js';
import ServiceCoordinator from '../coordination/ServiceCoordinator.js';

export function initHome() {
  // Initialize display components
  // Set up event listeners
  // Start location tracking
}
```

### 2. Converter View (`converter.js`)

**Route**: `/converter` or `#/converter`  
**Purpose**: Coordinate-to-address conversion utility  
**File Size**: ~19KB  

**Responsibilities**:
- Manual coordinate input form
- One-time geocoding requests
- Address display without tracking
- Standalone utility interface

**Key Components**:
```javascript
import ReverseGeocoder from '../services/ReverseGeocoder.js';
import HTMLAddressDisplayer from '../html/HTMLAddressDisplayer.js';

export function initConverter() {
  // Set up coordinate input form
  // Handle conversion button click
  // Display results
}
```

## Architecture Pattern

### View Controller Pattern

Views follow a controller pattern where:

1. **Route Mapping** - `app.js` maps URL routes to view initializers
2. **Initialization** - View's `init` function sets up the page
3. **Cleanup** - (Optional) View cleanup on route change
4. **DOM Management** - Views directly manipulate their section of DOM

### Separation from Display Components

- **Views**: Page controllers, event handling, component coordination
- **Display Components** (`src/html/`): Reusable UI rendering logic

### Example Flow

```
User navigates to #/ 
  → app.js router calls initHome()
  → home.js initializes ServiceCoordinator
  → ServiceCoordinator creates all display components
  → WebGeocodingManager starts location tracking
  → User sees real-time location updates
```

## Design Decisions

### Why Separate Views?

1. **Route-Specific Logic**: Each route has distinct initialization needs
2. **Code Splitting**: Potential for lazy loading in future
3. **Maintainability**: Clear separation between routes reduces coupling
4. **Testing**: Views can be tested independently

### Why Not Use a Framework?

- **Lightweight**: No framework overhead, pure JavaScript
- **Learning**: Demonstrates SPA routing patterns
- **Control**: Full control over routing and state management
- **Performance**: Minimal bundle size, fast initialization

## Testing Strategy

### Current Coverage

- **Unit Tests**: View initialization logic
- **E2E Tests**: Full user flows through each view
- **Integration Tests**: View-to-component interaction

### Test Files

- `__tests__/views/home.test.js` - Home view unit tests
- `__tests__/views/converter.test.js` - Converter view unit tests
- `__tests__/e2e/CompleteGeolocationWorkflow.e2e.test.js` - Home view E2E
- `__tests__/e2e/converter-workflow.e2e.test.js` - Converter view E2E

## Adding New Views

### Step 1: Create View File

```javascript
// src/views/new-view.js
export function initNewView() {
  console.log('Initializing new view...');
  
  // DOM initialization
  const container = document.getElementById('newViewContainer');
  
  // Component setup
  // Event handlers
  // Business logic
}
```

### Step 2: Register Route

```javascript
// src/app.js
import { initNewView } from './views/new-view.js';

const routes = {
  '/': initHome,
  '/converter': initConverter,
  '/new-view': initNewView  // Add here
};
```

### Step 3: Add Navigation

```html
<!-- src/index.html -->
<footer class="app-footer">
  <a href="#/new-view">New View</a>
</footer>
```

### Step 4: Write Tests

```javascript
// __tests__/views/new-view.test.js
import { initNewView } from '../../src/views/new-view.js';

describe('New View', () => {
  it('should initialize correctly', () => {
    initNewView();
    // Assertions
  });
});
```

## Related Documentation

- [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) - Overall project organization
- [ROUTING.md](./ROUTING.md) - SPA routing documentation
- [TEST_INFRASTRUCTURE.md](../testing/TEST_INFRASTRUCTURE.md) - Testing strategy
