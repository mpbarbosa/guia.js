# WebGeocodingManager Element IDs Configuration

## Overview

WebGeocodingManager now supports configurable DOM element IDs through the `elementIds` parameter. This feature improves testability, makes the class more reusable, and provides a single source of truth for all DOM dependencies.

## Default Configuration

The default element IDs are defined in `DEFAULT_ELEMENT_IDS`:

```javascript
const DEFAULT_ELEMENT_IDS = {
    chronometer: "chronometer",
    findRestaurantsBtn: "find-restaurants-btn",
    cityStatsBtn: "city-stats-btn",
    timestampDisplay: "tsPosCapture",
    speechSynthesis: {
        languageSelectId: "language",
        voiceSelectId: "voice-select",
        textInputId: "text-input",
        speakBtnId: "speak-btn",
        pauseBtnId: "pause-btn",
        resumeBtnId: "resume-btn",
        stopBtnId: "stop-btn",
        rateInputId: "rate",
        rateValueId: "rate-value",
        pitchInputId: "pitch",
        pitchValueId: "pitch-value",
    }
};
```

## Usage

### Using Default Configuration

By default, WebGeocodingManager uses the default element IDs:

```javascript
const manager = new WebGeocodingManager(document, {
    locationResult: 'location-result',
    enderecoPadronizadoDisplay: 'address-display',
    referencePlaceDisplay: 'reference-place'
});
// Will look for elements with default IDs: "chronometer", "find-restaurants-btn", etc.
```

### Customizing Element IDs

To use custom element IDs, provide an `elementIds` object in the constructor params:

```javascript
const customElementIds = {
    chronometer: "my-timer",
    findRestaurantsBtn: "my-restaurant-btn",
    cityStatsBtn: "my-stats-btn",
    timestampDisplay: "my-timestamp",
    speechSynthesis: {
        languageSelectId: "my-language",
        voiceSelectId: "my-voice",
        textInputId: "my-text",
        speakBtnId: "my-speak",
        pauseBtnId: "my-pause",
        resumeBtnId: "my-resume",
        stopBtnId: "my-stop",
        rateInputId: "my-rate",
        rateValueId: "my-rate-value",
        pitchInputId: "my-pitch",
        pitchValueId: "my-pitch-value",
    }
};

const manager = new WebGeocodingManager(document, {
    locationResult: 'location-result',
    enderecoPadronizadoDisplay: 'address-display',
    referencePlaceDisplay: 'reference-place',
    elementIds: customElementIds
});
// Will look for elements with custom IDs: "my-timer", "my-restaurant-btn", etc.
```

### Partial Override

You can override specific IDs while keeping defaults for others. Note that for nested objects like `speechSynthesis`, you need to provide the full nested object:

```javascript
const manager = new WebGeocodingManager(document, {
    locationResult: 'location-result',
    elementIds: {
        chronometer: "custom-chronometer",
        findRestaurantsBtn: "find-restaurants-btn",    // Using default
        cityStatsBtn: "city-stats-btn",                // Using default
        timestampDisplay: "tsPosCapture",              // Using default
        speechSynthesis: DEFAULT_ELEMENT_IDS.speechSynthesis  // Using default
    }
});
```

## Immutability

The element IDs configuration is frozen to prevent accidental modifications:

```javascript
const manager = new WebGeocodingManager(document, { 
    locationResult: 'location-result' 
});

// Attempting to modify will fail silently (or throw in strict mode)
manager.elementIds.chronometer = "modified";
console.log(manager.elementIds.chronometer); // Still "chronometer"
```

## Testing

The configuration feature makes testing easier by allowing mock element IDs:

```javascript
describe('WebGeocodingManager', () => {
    test('should work with custom element IDs', () => {
        const testElementIds = {
            chronometer: "test-chronometer",
            findRestaurantsBtn: "test-btn",
            // ... other IDs
        };

        const mockDocument = {
            getElementById: jest.fn((id) => {
                // Return mock elements for test IDs
                if (id === "test-chronometer") {
                    return mockChronometerElement;
                }
                return null;
            })
        };

        const manager = new WebGeocodingManager(mockDocument, {
            locationResult: 'test-location',
            elementIds: testElementIds
        });

        expect(mockDocument.getElementById).toHaveBeenCalledWith("test-chronometer");
    });
});
```

## Benefits

1. **Single Source of Truth**: All DOM element IDs are defined in one place
2. **Testability**: Easy to inject test-specific element IDs
3. **Reusability**: Same class can be used with different HTML structures
4. **Type Safety**: Clear documentation of all required DOM elements
5. **Immutability**: Frozen configuration prevents accidental modifications
6. **Backward Compatibility**: Existing code continues to work without changes

## Related

- Issue #189: WebGeocodingManager refactoring
- `docs/ISSUE_189_NEXT_STEPS.md`: Technical debt items
- `__tests__/WebGeocodingManager.test.js`: Test examples
