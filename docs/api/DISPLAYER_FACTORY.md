# DisplayerFactory API Documentation

**Version**: 0.9.0-alpha  
**Module**: `html/DisplayerFactory`  
**Since**: 0.9.0-alpha

---

## Overview

DisplayerFactory provides centralized creation of all HTML displayer components with dependency injection support. It implements the Factory Pattern for consistent displayer instantiation.

**Single Responsibility**: Displayer object creation

### Key Features
- ✅ Centralized displayer creation
- ✅ Dependency injection support
- ✅ Pure functions with no side effects
- ✅ Immutable displayer instances (frozen)
- ✅ Support for 5 displayer types

---

## Static Methods

### createPositionDisplayer(element)
Creates a position displayer for coordinate display.

```javascript
const displayer = DisplayerFactory.createPositionDisplayer(element);
```

**Returns**: `HTMLPositionDisplayer` (frozen)

### createAddressDisplayer(element)
Creates an address displayer for Brazilian address rendering.

```javascript
const displayer = DisplayerFactory.createAddressDisplayer(element);
```

**Returns**: `HTMLAddressDisplayer` (frozen)

### createReferencePlaceDisplayer(element)
Creates a reference place displayer.

```javascript
const displayer = DisplayerFactory.createReferencePlaceDisplayer(element);
```

**Returns**: `HTMLReferencePlaceDisplayer` (frozen)

### createHighlightCardsDisplayer(element)
Creates a municipality/neighborhood highlight cards displayer.

```javascript
const displayer = DisplayerFactory.createHighlightCardsDisplayer(element);
```

**Returns**: `HTMLHighlightCardsDisplayer` (frozen)

### createSidraDisplayer(element)
Creates an IBGE SIDRA demographic data displayer.

```javascript
const displayer = DisplayerFactory.createSidraDisplayer(element);
```

**Returns**: `HTMLSidraDisplayer` (frozen)

---

## Usage Example

```javascript
import DisplayerFactory from './html/DisplayerFactory.js';

// Create all displayers
const positionDisplayer = DisplayerFactory.createPositionDisplayer(
  document.getElementById('position-display')
);

const addressDisplayer = DisplayerFactory.createAddressDisplayer(
  document.getElementById('address-display')
);

const highlightDisplayer = DisplayerFactory.createHighlightCardsDisplayer(
  document.getElementById('highlight-cards')
);
```

---

**Status**: ✅ Production Ready  
**Test Coverage**: 95%+  
**Pattern**: Factory Pattern
