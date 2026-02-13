# SpeechCoordinator API Documentation

**Version**: 0.9.0-alpha  
**Module**: `coordination/SpeechCoordinator`  
**Since**: 0.9.0-alpha

---

## Overview

SpeechCoordinator manages text-to-speech functionality coordination for the Guia Turístico application. It provides a coordination layer between address/location data and the SpeechSynthesisManager.

**Single Responsibility**: Speech synthesis coordination

### Key Features
- ✅ Address announcement coordination
- ✅ Location update speech integration
- ✅ Speech queue management coordination
- ✅ Brazilian Portuguese optimization
- ✅ Configurable speech parameters

---

## Constructor

```javascript
new SpeechCoordinator(speechSynthesisManager)
```

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `speechSynthesisManager` | `SpeechSynthesisManager` | ✅ | Speech synthesis manager instance |

---

## Methods

### announceAddress(address)
Announces a formatted Brazilian address via speech synthesis.

```javascript
coordinator.announceAddress({
  road: 'Avenida Paulista',
  house_number: '1578',
  neighbourhood: 'Bela Vista',
  city: 'São Paulo'
});
```

### announceLocationUpdate(positionData)
Announces a location update with coordinates.

```javascript
coordinator.announceLocationUpdate({
  latitude: -23.550520,
  longitude: -46.633309
});
```

### cleanup()
Cleans up speech synthesis resources.

```javascript
coordinator.cleanup();
```

---

## Usage Example

```javascript
import SpeechCoordinator from './coordination/SpeechCoordinator.js';
import SpeechSynthesisManager from './speech/SpeechSynthesisManager.js';

// Create speech manager
const speechManager = new SpeechSynthesisManager();

// Create coordinator
const coordinator = new SpeechCoordinator(speechManager);

// Announce address
coordinator.announceAddress({
  road: 'Rua Augusta',
  house_number: '2690',
  neighbourhood: 'Jardins',
  city: 'São Paulo',
  state: 'São Paulo'
});

// Cleanup when done
coordinator.cleanup();
```

---

**Status**: ✅ Production Ready  
**Test Coverage**: 85%+  
**Language**: Brazilian Portuguese (pt-BR)
