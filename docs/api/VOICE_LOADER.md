# VoiceLoader API Reference

**Version**: 0.9.0-alpha  
**Last Updated**: 2026-02-12  
**Status**: Stable  
**Module**: `src/speech/VoiceLoader.js`

---

## Overview

The **VoiceLoader** handles asynchronous voice loading for the Web Speech API with robust retry mechanisms. It implements exponential backoff to efficiently wait for voices to become available while minimizing CPU usage.

### Key Features

- ✅ **Exponential Backoff** - Retry delays: 100ms → 200ms → 400ms → 800ms → 1600ms → 3200ms → 5000ms (capped)
- ✅ **Promise-Based API** - Modern async/await support
- ✅ **Voice Caching** - Avoids repeated browser queries
- ✅ **Browser Compatibility** - Handles both sync and async voice loading
- ✅ **Configurable Retry** - Customize max retries and delays

### Architecture

**Single Responsibility**: Voice Loading Only
- ❌ Does NOT handle voice selection (see VoiceSelector)
- ❌ Does NOT manage speech synthesis (see SpeechSynthesisManager)
- ✅ Focused solely on detecting when voices become available

### Browser Compatibility

| Browser | Loading Behavior | VoiceLoader Handles |
|---------|-----------------|---------------------|
| Chrome/Edge | Asynchronous | ✅ Exponential backoff retry |
| Firefox | Synchronous | ✅ Immediate return |
| Safari | Event-based | ✅ Event listener + retry |

---

## Class Definition

```javascript
class VoiceLoader {
  constructor(config = {})
}
```

### Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config` | `Object` | `{}` | Configuration options |
| `config.maxRetries` | `number` | `10` | Maximum retry attempts |
| `config.initialDelay` | `number` | `100` | Initial delay in ms |
| `config.maxDelay` | `number` | `5000` | Maximum delay cap in ms |
| `config.speechSynthesis` | `SpeechSynthesis` | `window.speechSynthesis` | Speech synthesis instance (for testing) |
| `config.enableLogging` | `boolean` | `false` | Enable console logging |

---

## Public Methods

### loadVoices()

Loads available voices with exponential backoff retry.

```javascript
async loadVoices()
```

#### Returns

`Promise<SpeechSynthesisVoice[]>` - Array of available voices

#### Behavior

1. Check if voices are already cached → return immediately
2. Get voices from browser API
3. If no voices found:
   - Wait with exponential backoff delay
   - Retry up to `maxRetries` times
   - Return empty array if all retries exhausted
4. Cache voices for future calls

#### Example

```javascript
const loader = new VoiceLoader();

try {
  const voices = await loader.loadVoices();
  console.log(`Loaded ${voices.length} voices`);
  
  voices.forEach(voice => {
    console.log(`${voice.name} (${voice.lang})`);
  });
} catch (error) {
  console.error('Failed to load voices:', error);
}
```

---

### getVoices()

Gets cached voices without triggering a reload.

```javascript
getVoices()
```

#### Returns

`SpeechSynthesisVoice[]` - Array of cached voices (may be empty)

#### Notes

- Returns cached voices immediately
- Does NOT trigger voice loading
- Returns empty array if voices not yet loaded

#### Example

```javascript
const loader = new VoiceLoader();
await loader.loadVoices();

// Get cached voices
const voices = loader.getVoices();
console.log(`${voices.length} voices cached`);
```

---

### hasVoices()

Checks if voices are cached.

```javascript
hasVoices()
```

#### Returns

`boolean` - `true` if voices are cached, `false` otherwise

#### Example

```javascript
const loader = new VoiceLoader();

if (!loader.hasVoices()) {
  console.log('Loading voices...');
  await loader.loadVoices();
}

console.log('Voices ready!');
```

---

### clearCache()

Clears the voice cache, forcing a reload on next `loadVoices()` call.

```javascript
clearCache()
```

#### Returns

`void`

#### Example

```javascript
const loader = new VoiceLoader();
await loader.loadVoices();

// Clear cache to force reload
loader.clearCache();

// This will reload from browser
await loader.loadVoices();
```

---

## Usage Examples

### Basic Usage

```javascript
import VoiceLoader from './speech/VoiceLoader.js';

const loader = new VoiceLoader();
const voices = await loader.loadVoices();

console.log(`Found ${voices.length} voices`);
```

### Custom Configuration

```javascript
const loader = new VoiceLoader({
  maxRetries: 15,        // More retry attempts
  initialDelay: 50,      // Faster initial retry
  maxDelay: 3000,        // Lower delay cap
  enableLogging: true    // Debug logging
});

const voices = await loader.loadVoices();
```

### Check Cache Before Loading

```javascript
const loader = new VoiceLoader();

// Check if already loaded
if (loader.hasVoices()) {
  const voices = loader.getVoices();
  console.log('Using cached voices');
} else {
  const voices = await loader.loadVoices();
  console.log('Loaded fresh voices');
}
```

### Error Handling

```javascript
const loader = new VoiceLoader({ maxRetries: 5 });

try {
  const voices = await loader.loadVoices();
  
  if (voices.length === 0) {
    console.warn('No voices available in browser');
  } else {
    console.log('Voices loaded successfully');
  }
} catch (error) {
  console.error('Voice loading failed:', error);
}
```

### Force Reload

```javascript
const loader = new VoiceLoader();

// Initial load
await loader.loadVoices();
console.log('First load complete');

// Force reload (e.g., after voice installation)
loader.clearCache();
const newVoices = await loader.loadVoices();
console.log('Reloaded after cache clear');
```

---

## Exponential Backoff Algorithm

### Retry Delays

With default configuration (`initialDelay: 100`, `maxDelay: 5000`):

| Attempt | Delay (ms) | Cumulative Time (ms) |
|---------|-----------|----------------------|
| 1 | 100 | 100 |
| 2 | 200 | 300 |
| 3 | 400 | 700 |
| 4 | 800 | 1,500 |
| 5 | 1,600 | 3,100 |
| 6 | 3,200 | 6,300 |
| 7 | 5,000* | 11,300 |
| 8 | 5,000* | 16,300 |
| 9 | 5,000* | 21,300 |
| 10 | 5,000* | 26,300 |

*\*Capped at `maxDelay`*

### Formula

```javascript
delay = Math.min(initialDelay * Math.pow(2, attemptNumber), maxDelay)
```

---

## Browser-Specific Behavior

### Chrome/Edge (Asynchronous Loading)

```javascript
// Chrome requires multiple retries
const loader = new VoiceLoader({ maxRetries: 10 });
const voices = await loader.loadVoices();
// Typically loads after 2-3 retries (~300-700ms)
```

### Firefox (Synchronous Loading)

```javascript
// Firefox loads immediately
const loader = new VoiceLoader();
const voices = await loader.loadVoices();
// Returns instantly with voices
```

### Safari (Event-Based Loading)

```javascript
// Safari uses 'voiceschanged' event
const loader = new VoiceLoader({ maxRetries: 5 });
const voices = await loader.loadVoices();
// Waits for event or timeout
```

---

## Configuration Examples

### Fast Retry (Low Latency)

```javascript
const loader = new VoiceLoader({
  maxRetries: 15,
  initialDelay: 50,   // Start at 50ms
  maxDelay: 2000      // Cap at 2 seconds
});
```

### Conservative Retry (Low CPU)

```javascript
const loader = new VoiceLoader({
  maxRetries: 8,
  initialDelay: 200,  // Start at 200ms
  maxDelay: 10000     // Cap at 10 seconds
});
```

### Production Settings

```javascript
const loader = new VoiceLoader({
  maxRetries: 10,     // Balance between speed and reliability
  initialDelay: 100,  // Standard initial delay
  maxDelay: 5000,     // Reasonable cap
  enableLogging: false // Disable in production
});
```

---

## Testing Support

### Mock speechSynthesis

```javascript
// Create mock for testing
const mockSpeechSynthesis = {
  getVoices: () => [
    { name: 'Google português do Brasil', lang: 'pt-BR' },
    { name: 'Microsoft Maria', lang: 'pt-BR' }
  ]
};

const loader = new VoiceLoader({ 
  speechSynthesis: mockSpeechSynthesis 
});

const voices = await loader.loadVoices();
// Returns mocked voices
```

---

## Performance Characteristics

### Time Complexity

- **loadVoices()**: O(n) where n = number of retry attempts
- **getVoices()**: O(1) - returns cached array
- **hasVoices()**: O(1) - checks cache presence
- **clearCache()**: O(1) - sets cache to null

### Space Complexity

- O(v) where v = number of voices cached
- Typically ~10-50 voices on modern systems

### Typical Load Times

| Scenario | Time (ms) | Retries |
|----------|-----------|---------|
| Firefox (sync) | 0-5 | 0 |
| Safari (event) | 50-200 | 1-2 |
| Chrome (async) | 100-700 | 2-3 |
| Edge (async) | 100-700 | 2-3 |

---

## Error Handling

### Common Issues

**Issue**: `speechSynthesis is not defined`
```javascript
// Solution: Check environment
if (typeof window !== 'undefined' && window.speechSynthesis) {
  const loader = new VoiceLoader();
  await loader.loadVoices();
} else {
  console.warn('Speech synthesis not supported');
}
```

**Issue**: No voices loaded after max retries
```javascript
const loader = new VoiceLoader();
const voices = await loader.loadVoices();

if (voices.length === 0) {
  console.warn('No voices available. Check system TTS settings.');
}
```

**Issue**: Voices changed after initial load
```javascript
// Listen for voice changes
speechSynthesis.addEventListener('voiceschanged', async () => {
  loader.clearCache();
  const newVoices = await loader.loadVoices();
  console.log('Voices updated:', newVoices.length);
});
```

---

## Best Practices

### 1. Load Once, Cache Forever

```javascript
// ✅ Good: Load once and reuse
const loader = new VoiceLoader();
const voices = await loader.loadVoices();

// Use cached voices
const cachedVoices = loader.getVoices();
```

```javascript
// ❌ Bad: Reload on every access
const voices1 = await loader.loadVoices();
const voices2 = await loader.loadVoices(); // Unnecessary
```

### 2. Check Cache First

```javascript
// ✅ Good: Avoid unnecessary loading
if (!loader.hasVoices()) {
  await loader.loadVoices();
}
const voices = loader.getVoices();
```

### 3. Handle Empty Results

```javascript
// ✅ Good: Graceful degradation
const voices = await loader.loadVoices();
if (voices.length === 0) {
  console.warn('Speech synthesis unavailable');
  // Provide alternative UI
}
```

### 4. Configure for Environment

```javascript
// ✅ Good: Different configs for dev/prod
const config = process.env.NODE_ENV === 'development'
  ? { enableLogging: true, maxRetries: 15 }
  : { enableLogging: false, maxRetries: 10 };

const loader = new VoiceLoader(config);
```

---

## Related APIs

- [VoiceSelector](./VOICE_SELECTOR.md) - Voice selection strategy
- [SpeechSynthesisManager](./SPEECH_SYNTHESIS_MANAGER.md) - Main speech facade
- [SpeechConfiguration](./SPEECH_CONFIGURATION.md) - Parameter management

---

## Testing

See `__tests__/unit/speech/VoiceLoader.test.js` for comprehensive test coverage.

**Test Coverage**: 21/21 tests passing (100%)

---

## Changelog

### v0.9.0-alpha
- ✅ Initial release
- ✅ Exponential backoff retry algorithm
- ✅ Promise-based API
- ✅ Voice caching
- ✅ Browser compatibility layer

---

**Navigation**: [API Index](./README.md) | [Speech APIs](./README.md#speech-synthesis-apis) | [SpeechSynthesisManager](./SPEECH_SYNTHESIS_MANAGER.md)
