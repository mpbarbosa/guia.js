# SpeechSynthesisManager API Reference

**Version**: 0.9.0-alpha  
**Last Updated**: 2026-02-12  
**Status**: Stable  
**Module**: `src/speech/SpeechSynthesisManager.js`

---

## Overview

The **SpeechSynthesisManager** is the main facade for managing Web Speech API integration in Guia Turístico. It provides a comprehensive speech synthesis system with priority-based queuing, voice selection optimized for Brazilian Portuguese, rate and pitch control, and robust error handling.

### Key Features

- ✅ **Priority-based Speech Queue** - Manages multiple speech requests with priority ordering
- ✅ **Brazilian Portuguese Optimization** - Automatically selects pt-BR voices when available
- ✅ **Retry Mechanisms** - Robust voice loading with exponential backoff
- ✅ **Rate and Pitch Control** - Configurable speech parameters with validation
- ✅ **State Management** - Concurrent speech prevention with proper state tracking
- ✅ **Cross-Environment Safety** - Works in browsers with graceful fallbacks
- ✅ **Timer Management** - Uses TimerManager to prevent memory leaks

### Architecture Pattern

**Manager/Controller with Composition** (v0.9.0-alpha refactored)

The class uses composition to delegate responsibilities:
- **VoiceLoader**: Asynchronous voice loading with exponential backoff
- **VoiceSelector**: Brazilian Portuguese voice prioritization
- **SpeechConfiguration**: Rate/pitch parameter validation
- **SpeechQueue**: Priority-based request queue management

---

## Class Definition

```javascript
class SpeechSynthesisManager {
  constructor(enableLogging = false)
}
```

### Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enableLogging` | `boolean` | `false` | Enable console logging for debugging |

### Constructor Throws

- `TypeError` - If `enableLogging` is not a boolean
- `Error` - If Web Speech API is not available in environment

---

## Public Methods

### speak(text, priority)

Adds a speech request to the queue with specified priority.

```javascript
speak(text, priority = 0)
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `text` | `string` | - | Text to be spoken (required) |
| `priority` | `number` | `0` | Priority level (higher = speaks first) |

#### Returns

`boolean` - `true` if added to queue, `false` if queue is full

#### Example

```javascript
const speechManager = new SpeechSynthesisManager();

// Normal priority
speechManager.speak("Olá, bem-vindo!");

// High priority (speaks first)
speechManager.speak("Alerta importante!", 10);

// Low priority
speechManager.speak("Mensagem informativa", -5);
```

---

### setRate(rate)

Sets the speech rate (speed) with automatic clamping.

```javascript
setRate(rate)
```

#### Parameters

| Parameter | Type | Range | Description |
|-----------|------|-------|-------------|
| `rate` | `number` | `0.1 - 10.0` | Speech rate multiplier |

#### Returns

`void`

#### Notes

- Values outside range are automatically clamped
- Default rate is `1.0` (normal speed)
- `0.5` = half speed, `2.0` = double speed

#### Example

```javascript
speechManager.setRate(1.5); // 50% faster
speechManager.speak("Falando mais rápido");

speechManager.setRate(0.8); // 20% slower
speechManager.speak("Falando mais devagar");
```

---

### setPitch(pitch)

Sets the speech pitch with automatic clamping.

```javascript
setPitch(pitch)
```

#### Parameters

| Parameter | Type | Range | Description |
|-----------|------|-------|-------------|
| `pitch` | `number` | `0.0 - 2.0` | Speech pitch multiplier |

#### Returns

`void`

#### Notes

- Values outside range are automatically clamped
- Default pitch is `1.0` (normal pitch)
- Lower values = deeper voice, higher values = higher voice

#### Example

```javascript
speechManager.setPitch(1.2); // Slightly higher pitch
speechManager.speak("Voz mais aguda");

speechManager.setPitch(0.8); // Slightly lower pitch
speechManager.speak("Voz mais grave");
```

---

### getRate()

Gets the current speech rate.

```javascript
getRate()
```

#### Returns

`number` - Current rate value (0.1 - 10.0)

#### Example

```javascript
const currentRate = speechManager.getRate();
console.log(`Current rate: ${currentRate}`);
```

---

### getPitch()

Gets the current speech pitch.

```javascript
getPitch()
```

#### Returns

`number` - Current pitch value (0.0 - 2.0)

#### Example

```javascript
const currentPitch = speechManager.getPitch();
console.log(`Current pitch: ${currentPitch}`);
```

---

### pause()

Pauses the current speech synthesis.

```javascript
pause()
```

#### Returns

`void`

#### Example

```javascript
speechManager.speak("Esta é uma mensagem longa...");
// ... later
speechManager.pause(); // Pause speech
```

---

### resume()

Resumes paused speech synthesis.

```javascript
resume()
```

#### Returns

`void`

#### Example

```javascript
speechManager.resume(); // Resume paused speech
```

---

### stop()

Stops current speech and clears the queue.

```javascript
stop()
```

#### Returns

`void`

#### Example

```javascript
speechManager.stop(); // Stop all speech immediately
```

---

### loadVoices()

Loads available voices asynchronously with exponential backoff retry.

```javascript
async loadVoices()
```

#### Returns

`Promise<SpeechSynthesisVoice[]>` - Array of available voices

#### Example

```javascript
const voices = await speechManager.loadVoices();
console.log(`Loaded ${voices.length} voices`);
```

---

### getVoices()

Gets cached voices without triggering a reload.

```javascript
getVoices()
```

#### Returns

`SpeechSynthesisVoice[]` - Array of cached voices (may be empty)

#### Example

```javascript
const voices = speechManager.getVoices();
voices.forEach(voice => {
  console.log(`${voice.name} (${voice.lang})`);
});
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
if (!speechManager.hasVoices()) {
  await speechManager.loadVoices();
}
```

---

### getSelectedVoice()

Gets the currently selected voice.

```javascript
getSelectedVoice()
```

#### Returns

`SpeechSynthesisVoice | null` - Selected voice or null if none selected

#### Example

```javascript
const voice = speechManager.getSelectedVoice();
if (voice) {
  console.log(`Using voice: ${voice.name} (${voice.lang})`);
}
```

---

### cleanup()

Cleans up resources (timers, queue, etc.).

```javascript
cleanup()
```

#### Returns

`void`

#### Notes

- Stops all speech
- Clears queue
- Cancels timers
- Should be called before destroying the instance

#### Example

```javascript
// Before page unload
window.addEventListener('beforeunload', () => {
  speechManager.cleanup();
});
```

---

## Logging Methods

### enableLogs()

Enables console logging for debugging.

```javascript
enableLogs()
```

### disableLogs()

Disables console logging.

```javascript
disableLogs()
```

### toggleLogs()

Toggles logging state.

```javascript
toggleLogs()
```

#### Returns

`boolean` - New logging state after toggle

#### Example

```javascript
const speechManager = new SpeechSynthesisManager(false);
speechManager.enableLogs(); // Enable logging
speechManager.speak("Test with logging");
speechManager.disableLogs(); // Disable logging
```

---

## Properties

### Read-Only Properties

| Property | Type | Description |
|----------|------|-------------|
| `isLoggingEnabled` | `boolean` | Current logging state |

---

## Configuration

### Default Configuration

```javascript
const SPEECH_CONFIG = {
  maxVoiceRetryAttempts: 10,
  voiceRetryInterval: 1000,
  independentQueueTimerInterval: 100,
  minRate: 0.1,
  maxRate: 10.0,
  minPitch: 0.0,
  maxPitch: 2.0,
  defaultRate: 1.0,
  defaultPitch: 1.0,
  primaryLanguage: 'pt-br',
  fallbackLanguagePrefix: 'pt'
};
```

---

## Usage Examples

### Basic Usage

```javascript
import SpeechSynthesisManager from './speech/SpeechSynthesisManager.js';

// Create instance
const speechManager = new SpeechSynthesisManager();

// Speak text
speechManager.speak("Olá, bem-vindo ao Guia Turístico!");
```

### Advanced Configuration

```javascript
// Create with logging enabled
const speechManager = new SpeechSynthesisManager(true);

// Configure speech parameters
speechManager.setRate(1.2);  // 20% faster
speechManager.setPitch(1.1); // Slightly higher pitch

// Speak with priority
speechManager.speak("Mensagem importante!", 10);
speechManager.speak("Mensagem normal", 0);
```

### Priority-Based Queuing

```javascript
const speechManager = new SpeechSynthesisManager();

// Add multiple messages with different priorities
speechManager.speak("Prioridade baixa", 0);
speechManager.speak("Prioridade alta", 10);    // Speaks first
speechManager.speak("Prioridade média", 5);    // Speaks second
speechManager.speak("Prioridade padrão");      // Speaks last

// Priority order: 10 → 5 → 0 → 0 (default)
```

### Voice Loading and Selection

```javascript
const speechManager = new SpeechSynthesisManager();

// Wait for voices to load
await speechManager.loadVoices();

// Check selected voice
const voice = speechManager.getSelectedVoice();
console.log(`Using: ${voice.name} (${voice.lang})`);

// List all available voices
const voices = speechManager.getVoices();
voices.forEach(v => console.log(`${v.name} - ${v.lang}`));
```

### Playback Control

```javascript
const speechManager = new SpeechSynthesisManager();

// Start speaking
speechManager.speak("Esta é uma mensagem longa que pode ser pausada.");

// Pause after 2 seconds
setTimeout(() => speechManager.pause(), 2000);

// Resume after 5 seconds
setTimeout(() => speechManager.resume(), 5000);

// Stop after 10 seconds
setTimeout(() => speechManager.stop(), 10000);
```

### Resource Cleanup

```javascript
const speechManager = new SpeechSynthesisManager();

// Use the manager
speechManager.speak("Mensagem final");

// Clean up before destroying
window.addEventListener('beforeunload', () => {
  speechManager.cleanup();
});
```

---

## Browser Compatibility

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 94+ | ✅ Full | Asynchronous voice loading |
| Firefox | 93+ | ✅ Full | Synchronous voice loading |
| Safari | 15+ | ✅ Full | Event-based voice loading |
| Edge | 94+ | ✅ Full | Same as Chrome |

### Known Limitations

- **Voice availability** varies by browser and OS
- **Brazilian Portuguese voices** may not be available on all systems
- **Mobile browsers** may have limited voice selection
- **Speech queue** is limited to 100 items by default

---

## Design Patterns

### Composition Pattern

The manager uses composition to delegate responsibilities:

```javascript
// Internal composition structure
this.voiceLoader = new VoiceLoader(config);
this.voiceSelector = new VoiceSelector(config);
this.configuration = new SpeechConfiguration(enableLogging);
this.speechQueue = new SpeechQueue(100, 30000, enableLogging);
```

### Facade Pattern

Provides a simple interface to complex speech synthesis subsystem:

```javascript
// Simple facade
speechManager.speak("Hello");

// Behind the scenes:
// 1. VoiceLoader ensures voices are available
// 2. VoiceSelector picks best pt-BR voice
// 3. SpeechConfiguration applies rate/pitch
// 4. SpeechQueue manages request priority
// 5. Manager coordinates synthesis
```

---

## Related APIs

- [VoiceLoader](./VOICE_LOADER.md) - Asynchronous voice loading
- [VoiceSelector](./VOICE_SELECTOR.md) - Voice selection strategy
- [SpeechConfiguration](./SPEECH_CONFIGURATION.md) - Parameter management
- [SpeechQueue](./SPEECH_QUEUE.md) - Queue data structure
- [TimerManager](./TIMER_MANAGER.md) - Timer management

---

## Testing

See `__tests__/unit/speech/SpeechSynthesisManager.test.js` for comprehensive test coverage.

**Test Coverage**: 69/72 tests passing (95.8%)

---

## Changelog

### v0.9.0-alpha
- ✅ Refactored to composition pattern
- ✅ Extracted VoiceLoader, VoiceSelector, SpeechConfiguration
- ✅ Added exponential backoff voice loading
- ✅ Integrated TimerManager to prevent memory leaks

### v0.9.0-alpha
- Initial stable release
- Brazilian Portuguese voice prioritization
- Priority-based speech queue

---

**Navigation**: [API Index](./README.md) | [Speech APIs](./README.md#speech-synthesis-apis) | [Architecture](../architecture/COMPREHENSIVE_GUIDE.md)
