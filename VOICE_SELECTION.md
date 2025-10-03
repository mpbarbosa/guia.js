# Brazilian Portuguese Voice Selection - Implementation Details

## Overview

This document describes the implementation of Brazilian Portuguese (pt-BR) voice prioritization in the speech synthesis system of Guia.js.

## Feature Summary

The speech synthesis system now prioritizes Brazilian Portuguese (pt-BR) voices for the target Brazilian user base, with an automatic retry mechanism to handle asynchronous voice loading.

## Implementation Details

### Changes Made

#### 1. SpeechSynthesisManager Class Enhancements

**Location:** `src/guia.js` - Lines 2735-2830

**New Properties:**
- `voiceRetryTimer`: Timer reference for retry mechanism
- `voiceRetryAttempts`: Counter for tracking retry attempts
- `maxVoiceRetryAttempts`: Maximum number of retry attempts (10)
- `voiceRetryInterval`: Interval between retries in milliseconds (1000ms)

**Updated Method: `loadVoices()`**

The method now implements a two-tier priority system:

1. **PRIORITY 1:** Brazilian Portuguese (pt-BR)
   - First searches for voices with language code exactly matching `pt-BR` (case-insensitive)
   
2. **PRIORITY 2:** Any Portuguese variant (pt, pt-PT, etc.)
   - Falls back to any voice starting with `pt` if pt-BR is not available

**New Methods:**

- `startVoiceRetryTimer()`: Initiates periodic checks for Brazilian Portuguese voices
  - Runs every 1 second
  - Maximum 10 attempts
  - Automatically stops when pt-BR voice is found or max attempts reached
  
- `stopVoiceRetryTimer()`: Cleans up the retry timer

#### 2. HtmlSpeechSynthesisDisplayer Class Enhancements

**Location:** `src/guia.js` - Lines 3071-3110

**Updated Method: `updateVoices()`**

Implements the same two-tier priority system for the voice selection dropdown:
- Marks Brazilian Portuguese voices as selected by default
- Falls back to other Portuguese variants if pt-BR not available
- Ensures only one voice is selected at a time

### How It Works

#### Voice Loading Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SpeechSynthesisManager Constructor Called                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. loadVoices() Executes                                     │
│    - Calls updateVoices() immediately                        │
│    - Sets up onvoiceschanged event handler                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. updateVoices() Checks Available Voices                   │
│    - Priority 1: Look for pt-BR                              │
│    - Priority 2: Look for any pt*                            │
│    - Fallback: Use first available voice                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
            ┌────────┴─────────┐
            │                  │
            ▼                  ▼
    ┌──────────────┐   ┌──────────────────┐
    │ pt-BR Found  │   │ pt-BR Not Found  │
    │              │   │                  │
    │ Stop Retry   │   │ Start Retry      │
    └──────────────┘   │ Timer            │
                       └────────┬─────────┘
                                │
                                ▼
                    ┌───────────────────────────┐
                    │ Retry Every 1 Second      │
                    │ (Max 10 Attempts)         │
                    │                           │
                    │ Check for pt-BR voice     │
                    │ Update if found           │
                    └───────────────────────────┘
```

#### Priority Logic

```javascript
// PRIORITY 1: Brazilian Portuguese (pt-BR)
let voice = voices.find(v => v.lang.toLowerCase() === 'pt-br');

// PRIORITY 2: Any Portuguese variant (pt, pt-PT, etc.)
if (!voice) {
    voice = voices.find(v => v.lang.toLowerCase().startsWith('pt'));
}

// FALLBACK: First available voice or null
voice = voice || voices[0] || null;
```

### Testing

#### Manual Testing Page

A comprehensive test page has been created: `brazilian-voice-test.html`

**Features:**
- Displays currently selected voice information
- Lists all available voices with priority badges
- Test speech synthesis with Brazilian phrases
- View retry mechanism status
- Real-time event logging

**Access:** http://localhost:9000/brazilian-voice-test.html (with web server running)

#### Test Scenarios

1. **Brazilian Portuguese Available:** 
   - pt-BR voice is selected immediately
   - No retry mechanism activated
   - Logged as: "Brazilian Portuguese voice found"

2. **Only Other Portuguese Available:**
   - pt-PT or generic pt voice selected
   - Retry mechanism starts
   - Attempts to find pt-BR for up to 10 seconds

3. **No Portuguese Voices:**
   - First available voice selected
   - Retry mechanism starts but eventually gives up
   - Logged as: "Max retry attempts reached"

### Why Retry Mechanism?

The Web Speech API loads voices asynchronously in many browsers. The `voiceschanged` event may fire multiple times as voices become available. The retry mechanism ensures:

1. **Reliability:** Doesn't miss pt-BR voices that load late
2. **User Experience:** Automatically switches to Brazilian Portuguese when available
3. **Resource Efficiency:** Stops after finding pt-BR or reaching max attempts

### Code Quality

The implementation follows the existing code style in the repository:
- Uses same logging patterns with `log()` function
- Follows existing class structure and naming conventions
- Maintains consistency with other timer-based features (e.g., queue timer)
- Includes comprehensive JSDoc comments

### Browser Compatibility

The feature works with any browser that supports:
- Web Speech API (`window.speechSynthesis`)
- `speechSynthesis.getVoices()`
- `voiceschanged` event

Tested compatibility:
- ✅ Chrome/Edge (Chromium-based)
- ✅ Firefox
- ✅ Safari (iOS/macOS)
- ⚠️ Headless browsers (limited voice support)

## Usage Example

```javascript
// Initialize speech synthesis manager
const speechManager = new SpeechSynthesisManager();

// The manager automatically:
// 1. Loads available voices
// 2. Prioritizes pt-BR voices
// 3. Starts retry mechanism if needed
// 4. Logs all actions

// Check selected voice
console.log(speechManager.voice); // Brazilian Portuguese voice if available

// Use in speech synthesis
speechManager.speak("Você está no bairro de Pinheiros", 0);
```

## Configuration

Current retry mechanism parameters (can be adjusted if needed):

```javascript
this.maxVoiceRetryAttempts = 10;     // Maximum retry attempts
this.voiceRetryInterval = 1000;      // Retry every 1 second (1000ms)
```

Total maximum retry time: 10 seconds

## Benefits for Brazilian Users

1. **Accurate Pronunciation:** Brazilian Portuguese has distinct pronunciation from European Portuguese
2. **Natural Experience:** Users hear familiar accent and intonation
3. **Automatic Selection:** No manual configuration needed
4. **Reliable:** Retry mechanism ensures voice is found even with delayed loading

## Future Enhancements

Potential improvements:
- Make retry parameters configurable
- Add voice preference storage (localStorage)
- Support voice selection by name in addition to language code
- Add voice quality/naturalness scoring

## Changelog

**Version 0.8.3-alpha**
- Added Brazilian Portuguese (pt-BR) voice prioritization
- Implemented retry mechanism for voice loading
- Updated HtmlSpeechSynthesisDisplayer for consistent priority
- Added comprehensive test page for manual verification
