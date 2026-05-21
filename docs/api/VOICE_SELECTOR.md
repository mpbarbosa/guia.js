# VoiceSelector API Reference

**Version**: 0.24.9-alpha
**Last Updated**: 2026-05-20
**Status**: Stable
**Module**: `src/speech/VoiceSelector.ts`

---

## Overview

`VoiceSelector` chooses the best available `SpeechSynthesisVoice` for Guia Turístico's speech pipeline. It prioritizes Brazilian Portuguese (`pt-BR`) voices first, falls back to other Portuguese variants, and finally uses the first available browser voice when needed.

## Responsibilities

- Prefer exact `pt-BR` matches when available
- Fall back to broader `pt-*` matches
- Score voices so local voices win when candidates tie
- Expose lightweight helpers for filtering and inspecting selected voices

## Constructor

```ts
new VoiceSelector(config?)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config.primaryLang` | `string` | `'pt-br'` | Preferred language code, normalized to lowercase |
| `config.fallbackLangPrefix` | `string` | `'pt'` | Prefix used for broader language fallback |

## Public Methods

### `selectVoice(voices)`

Returns the best available voice or `null` when the input list is empty.

```ts
selectVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null
```

Selection order:

1. Exact `primaryLang` match
2. Prefix match using `fallbackLangPrefix`
3. First available voice

### `filterByLanguage(voices, langCode)`

Returns only exact language matches.

```ts
filterByLanguage(
  voices: SpeechSynthesisVoice[],
  langCode: string
): SpeechSynthesisVoice[]
```

### `filterByLanguagePrefix(voices, langPrefix)`

Returns voices whose `lang` starts with the provided prefix.

```ts
filterByLanguagePrefix(
  voices: SpeechSynthesisVoice[],
  langPrefix: string
): SpeechSynthesisVoice[]
```

### `scoreVoice(voice)`

Applies the class's quality heuristic.

```ts
scoreVoice(voice: SpeechSynthesisVoice): number
```

Current scoring rules:

- `+20` for an exact `primaryLang` match
- `+10` for `localService === true`

### `getVoiceInfo(voice)`

Returns lightweight metadata for UI or logging.

```ts
getVoiceInfo(
  voice: SpeechSynthesisVoice | null
): { type: string; name: string; lang: string; isLocal: boolean } | null
```

## Example

```javascript
import VoiceSelector from '../src/speech/VoiceSelector.js';

const selector = new VoiceSelector();
const selected = selector.selectVoice(window.speechSynthesis.getVoices());

if (selected) {
  console.log(`${selected.name} (${selected.lang})`);
}
```

## Related Docs

- [VoiceLoader](./VOICE_LOADER.md) — loads and caches browser voices
- [SpeechConfiguration](./SPEECH_CONFIGURATION.md) — manages rate and pitch
- [SpeechSynthesisManager](./SPEECH_SYNTHESIS_MANAGER.md) — composes the speech pipeline
