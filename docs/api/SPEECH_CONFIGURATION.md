# SpeechConfiguration API Reference

**Version**: 0.28.5-alpha
**Last Updated**: 2026-05-20
**Status**: Stable
**Module**: `src/speech/SpeechConfiguration.ts`

---

## Overview

`SpeechConfiguration` owns the rate and pitch settings used by the speech synthesis pipeline. It validates incoming values, clamps them to browser-supported ranges, and exposes helpers for reading and resetting the active configuration.

## Responsibilities

- Store the active speech `rate` and `pitch`
- Clamp values to supported Web Speech API ranges
- Throw explicit `TypeError`s for invalid input
- Expose current configuration state for callers and tests

## Constructor

```ts
new SpeechConfiguration(enableLogging?)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enableLogging` | `boolean` | `false` | Enables debug logging through the repository logger |

## Public Methods

### `setRate(rate)`

```ts
setRate(rate: number): number
```

- Valid range: `0.1` to `10.0`
- Throws `TypeError` when `rate` is not a valid number

### `setPitch(pitch)`

```ts
setPitch(pitch: number): number
```

- Valid range: `0.0` to `2.0`
- Throws `TypeError` when `pitch` is not a valid number

### `getRate()`

```ts
getRate(): number
```

### `getPitch()`

```ts
getPitch(): number
```

### `getConfiguration()`

```ts
getConfiguration(): { rate: number; pitch: number }
```

### `reset()`

```ts
reset(): void
```

Restores the defaults:

- `rate = 1.0`
- `pitch = 1.0`

### `enableLogs()` / `disableLogs()`

```ts
enableLogs(): void
disableLogs(): void
```

### `SpeechConfiguration.getRateRange()`

```ts
static getRateRange(): { min: number; max: number; default: number }
```

### `SpeechConfiguration.getPitchRange()`

```ts
static getPitchRange(): { min: number; max: number; default: number }
```

## Example

```javascript
import SpeechConfiguration from '../src/speech/SpeechConfiguration.js';

const config = new SpeechConfiguration();

config.setRate(1.2);
config.setPitch(0.9);

console.log(config.getConfiguration());
```

## Related Docs

- [VoiceLoader](./VOICE_LOADER.md) — loads browser voices
- [VoiceSelector](./VOICE_SELECTOR.md) — picks the best voice
- [SpeechSynthesisManager](./SPEECH_SYNTHESIS_MANAGER.md) — orchestrates speech playback
