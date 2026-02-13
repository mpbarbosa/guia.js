# UICoordinator API Documentation

**Version**: 0.9.0-alpha  
**Module**: `coordination/UICoordinator`  
**Since**: 0.9.0-alpha (Phase 1: WebGeocodingManager refactoring)

---

## Overview

UICoordinator manages UI element initialization and DOM manipulation for the Guia Turístico application. It provides centralized, cached access to DOM elements with proper initialization and validation.

**Single Responsibility**: UI/DOM concerns only

### Key Features
- ✅ DOM element caching for performance
- ✅ Element initialization with validation
- ✅ Timestamp display updates
- ✅ Immutable configuration
- ✅ Graceful handling of missing elements

---

## Constructor

```javascript
new UICoordinator(document, elementIds)
```

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `document` | `Document` | ✅ | Document object for DOM queries |
| `elementIds` | `Object` | ❌ | Element ID configuration (optional) |

### Example
```javascript
const coordinator = new UICoordinator(document, {
  chronometer: 'chronometer',
  findRestaurantsBtn: 'find-restaurants-btn',
  cityStatsBtn: 'city-stats-btn',
  timestampDisplay: 'tsPosCapture'
});
```

---

## Methods

### initializeElements()
Initializes all UI elements by querying the DOM.

```javascript
coordinator.initializeElements()
```

### getElement(name)
Gets a cached DOM element by name.

```javascript
const button = coordinator.getElement('findRestaurantsBtn');
```

### updateTimestamp(timestamp)
Updates the timestamp display element.

```javascript
coordinator.updateTimestamp(Date.now());
```

---

**Status**: ✅ Production Ready  
**Test Coverage**: 80%+
