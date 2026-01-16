# SpeechCoordinator Test Implementation Notes

**Date**: 2026-01-15  
**Status**: Partial Implementation (Constructor tests passing, initialization tests hanging)  

---

## Issue: Tests Hanging on Speech Synthesis Initialization

### Root Cause
SpeechSynthesisManager constructor waits for 'voiceschanged' event from Web Speech API:
```javascript
// From src/speech/SpeechSynthesisManager.js
if (typeof window === 'undefined' || !window.speechSynthesis) {
    throw new Error('Web Speech API not available');
}
this.synth = window.speechSynthesis;
// Waits for voices to load...
```

### Problem
- Jest mocks don't properly simulate async voice loading
- `speechSynthesis.getVoices()` returns array but 'voiceschanged' event never fires
- Tests hang indefinitely waiting for event

### Solutions Attempted
1. ✅ Mock `global.window.speechSynthesis` - partial success (constructor works)
2. ❌ Mock `addEventListener` - event still not triggered
3. ❌ Mock `getVoices()` return - not sufficient

### Recommended Approach
**Skip integration tests for SpeechCoordinator initialization** and focus on:
1. Constructor validation (DONE - 6 tests passing)
2. Getter methods (DONE - 5 tests passing)  
3. Error handling (DONE - 2 tests passing)
4. String representation (DONE - 1 test passing)

**Total**: 14 tests passing, covers core behavior without speech API complexities

### Alternative Testing Strategy
For full coverage of speech synthesis:
- Use E2E tests with real browser (Puppeteer/Playwright)
- Mock HtmlSpeechSynthesisDisplayer entirely in SpeechCoordinator tests
- Create separate unit tests for SpeechSynthesisManager with proper async mocking

---

## Coverage Impact
- **Constructor**: 100% covered (lines 75-130)
- **Getters**: 100% covered (lines 187-211)
- **toString**: 100% covered (lines 250-253)
- **destroy**: Partial (lines 223-239) - needs initialization first
- **initializeSpeechSynthesis**: Blocked by speech API (lines 147-174)

**Estimated Coverage**: ~60% of SpeechCoordinator.js (160/261 lines)

---

## Recommendation
1. Keep the 14 passing constructor/getter tests
2. Document speech synthesis init as "requires E2E testing"
3. Move to Phase 2 targets (ServiceCoordinator, ReverseGeocoder)
4. Revisit speech synthesis tests in E2E phase

