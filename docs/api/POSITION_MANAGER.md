## POSITION_MANAGER

# PositionManager API Documentation

**Version:** 0.9.0-alpha
**Module:** `src/core/PositionManager.js`
**Pattern:** Singleton, Observer
**Author:** Marcelo Pereira Barbosa

## Overview

Centralized singleton manager for device geographic position. `PositionManager` implements the singleton and observer patterns to provide a single source of truth for the current device position. It wraps the browser's Geolocation API, applies multi-layer validation rules (accuracy, distance, time thresholds), and notifies subscribed observers about position changes.

## Purpose and Responsibility

- **Single Position State**: Ensures only one position state exists across the entire application
- **Smart Filtering**: Prevents excessive processing from GPS noise and minor position changes
- **Multi-Layer Validation**: Applies accuracy quality, distance, and time threshold rules
- **Observer Notifications**: Notifies subscribers of meaningful position changes
- **Integration Ready**: Works seamlessly with `GeoPosition` for enhanced position data

## Key Features

- Singleton pattern ensures one position state across application
- Observer pattern for decoupled position change notifications
- Smart filtering prevents excessive processing from GPS noise
- Multi-layer validation (accuracy quality, distance OR time threshold)
- Integration with GeoPosition for enhanced position data

## Validation Rules (v0.9.0-alpha)

1. **Accuracy Quality**: Rejects medium/bad/very bad accuracy on mobile devices
2. **Distance OR Time Threshold**: Updates if EITHER condition is met:
   - Movement ≥ 20 meters OR
   - Time elapsed ≥ 30 seconds
3. **Event Classification**: Distinguishes regular updates (≥50s) from immediate updates (<50s)

## Location in Codebase

```
src/core/PositionManager.js
```

## Dependencies

```javascript
import GeoPosition from './GeoPosition.js';
import ObserverSubject from './ObserverSubject.js';
import { calculateDistance } from '../utils/distance.js';
import { log, warn } from '../utils/logger.js';
```

## Constructor

### `constructor(position)`

Creates a new PositionManager instance (private - use `getInstance()` instead).

**Parameters:**

- `position` (GeolocationPosition, optional): Initial position data

**Example:**

```javascript
// Typically used internally by getInstance()
const manager = new PositionManager(geolocationPosition);
```

**Since:** 0.9.0-alpha

## Static Methods

### `getInstance(position)`

Gets or creates the singleton PositionManager instance.

**Parameters:**

- `position` (GeolocationPosition, optional): HTML5 Geolocation API Position object
  - `position.coords` (GeolocationCoordinates): Coordinate information
    - `latitude` (number): Latitude in decimal degrees
    - `longitude` (number): Longitude in decimal degrees
    - `accuracy` (number): Accuracy in meters
  - `position.timestamp` (number): Timestamp when position was acquired

**Returns:** `PositionManager` - The singleton instance

**Example:**

```javascript
// Create initial instance
const manager = PositionManager.getInstance();

// Create or update with position data
navigator.geolocation.getCurrentPosition((position) => {
  const manager = PositionManager.getInstance(position);
  console.log(manager.latitude, manager.longitude);
});
```

**Since:** 0.9.0-alpha

## Static Constants

### Event Type Constants

```javascript
// Position successfully updated
PositionManager.strCurrPosUpdate = "PositionManager updated"

// Position update rejected by validation
PositionManager.strCurrPosNotUpdate = "PositionManager not updated"

// Immediate position update (< 50s elapsed)
PositionManager.strImmediateAddressUpdate = "Immediate address update"
```

## Public Methods

### `subscribe(observer)`

Subscribes an observer to position change notifications.

**Parameters:**

- `observer` (Object): Observer object to subscribe
  - `observer.update` (Function): Method called on position changes `(positionManager, eventType) => void`

**Returns:** `void`

**E

---

## POSITION_MANAGER

# PositionManager Class Documentation

## Overview

The `PositionManager` class is the central singleton for managing the current geographic position in the Guia.js application. Introduced in version 0.9.0-alpha, it wraps the browser's Geolocation API, implements sophisticated position validation and filtering rules, and provides an observer-based notification system for position changes. Following the Singleton and Observer design patterns, it ensures only one position state exists throughout the application while allowing multiple components to react to position updates.

## Motivation

Managing device location in a geolocation application involves coordinating several challenges:

- Ensuring only one source of truth for current position
- Filtering out inaccurate or insignificant position updates
- Preventing excessive processing from minor GPS fluctuations
- Notifying multiple components about position changes
- Providing consistent position data across the application
- Handling position validation and accuracy requirements

The `PositionManager` class addresses these challenges by:

- **Centralizing position state**: Single source of truth via singleton pattern
- **Implementing validation rules**: Filters positions by accuracy, time, and distance thresholds
- **Managing subscriptions**: Observer pattern for decoupled position notifications
- **Providing intelligence**: Smart update logic prevents processing insignificant changes
- **Ensuring consistency**: All components access the same position instance

Previously, applications had to manage position state manually, leading to inconsistencies, duplicate position objects, and difficulty coordinating updates across components.

## Features

- **Singleton pattern**: Ensures single position state across application
- **Observer pattern**: Subscribe/unsubscribe for position change notifications
- **Smart validation**: Multi-layer filtering (accuracy, time threshold, distance threshold)
- **Position wrapping**: Encapsulates GeolocationPosition in convenient GeoPosition objects
- **Event types**: Distinguishes between regular updates and immediate address updates
- **Distance calculation**: Built-in support for calculating distance from previous position
- **Debugging support**: toString() method for logging and inspection
- **Backward compatibility**: Maintains stable API across versions

## Architecture

### Class Diagram

```
PositionManager (Singleton)
    ├── holds → GeoPosition (lastPosition)
    ├── uses → ObserverSubject
    │              ├── manages → Array<Observer>
    │              └── notifies → Observer.update()
    ├── validates with → setupParams
    │              ├── trackingInterval (50s)
    │              ├── minimumDistanceChange (20m)
    │              └── notAcceptedAccuracy
    └── fires events
                   ├── strCurrPosUpdate
                   ├── strCurrPosNotUpdate
                   └── strImmediateAddressUpdate
```

### Design Patterns Applied

#### 1. Singleton Pattern

Ensures only one PositionManager instance exists per application, preventing multiple conflicting position states.

#### 2. Observer Pattern

Allows multiple components to subscribe to position updates without tight coupling to the PositionManager.

#### 3. Strategy Pattern (Validation)

Position validation uses configurable rules (accuracy thresholds, time intervals, distance thresholds) that can be adjusted via setupParams.

## Usage

### Basic Usage

```javascript
// Get the singleton instance
const manager = PositionManager.getInstance();

// Subscribe to position updates
const observer = {
  update: (positionManager, eventType) => {
    if (eventType === PositionManager.strCurrPosUpdate) {
      console.log('Position updated:', positionManager.latitude, positionManager.longitude);
    }
  }
};
manager.subscribe(observer);
```

### With Initial Position

```javascript
// Create instance with initial position from Geolocation API
navigator.geolocation.getCurrentPosi
