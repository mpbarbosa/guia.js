# Phase 3 Resume Guide - SpeechQueueProcessor Extraction

**Date**: 2026-01-24  
**Branch**: `refactor/speech-synthesis-manager`  
**Status**: Ready to resume Phase 3  
**Progress**: 40% complete (2/5 phases)

---

## Quick Resume Checklist

```bash
# 1. Switch to feature branch
git checkout refactor/speech-synthesis-manager

# 2. Verify clean state
git status
git log --oneline -3

# 3. Verify all tests passing
npm test

# 4. Expected output:
# - Tests: 1,930 passing (146 skipped)
# - Test Suites: 85 passed (4 skipped)
# - Time: ~30 seconds
```

---

## Completed Phases

### ✅ Phase 1: VoiceManager (Complete)
- **File**: `src/speech/VoiceManager.js` (280 lines)
- **Commit**: ec4b86b
- **Extracted**:
  - Voice loading with Brazilian Portuguese prioritization
  - Async retry mechanism (10 attempts, 1s interval)
  - Voice selection and validation
  - Resource cleanup

### ✅ Phase 2: SpeechConfiguration (Complete)
- **File**: `src/speech/SpeechConfiguration.js` (227 lines)
- **Tests**: `__tests__/unit/SpeechConfiguration.test.js` (26 tests)
- **Commit**: 848ce55
- **Extracted**:
  - Rate/pitch validation and clamping
  - Configuration state management
  - Static range methods

---

## Phase 3: SpeechQueueProcessor (Current)

### Objectives

Extract queue management logic from SpeechSynthesisManager into focused class.

### Files to Extract From

**Source**: `src/speech/SpeechSynthesisManager.js`

**Key Methods** (lines 600-800 approx):
- `enqueue(text, priority)` - Add item to queue
- `processQueue()` - Process next item
- `startQueueTimer()` - Timer management
- `stopQueueTimer()` - Timer cleanup
- `clearQueue()` - Empty queue
- `getQueueLength()` - Queue size
- Priority-based sorting logic
- Timer interval management

### Files to Create

1. **`src/speech/SpeechQueueProcessor.js`** (~200 lines)
   - Queue management with priority support
   - Timer-based processing
   - Queue state management
   - Resource cleanup

2. **`__tests__/unit/SpeechQueueProcessor.test.js`** (~250 lines)
   - 18 comprehensive unit tests
   - Queue operations (enqueue, dequeue, clear)
   - Priority handling
   - Timer management
   - Edge cases

### Implementation Steps

#### Step 1: Extract Queue Logic (60 min)

```javascript
// src/speech/SpeechQueueProcessor.js structure

export class SpeechQueueProcessor {
    constructor(enableLogging = false) {
        this.queue = [];
        this.isProcessing = false;
        this.queueTimer = null;
        this.enableLogging = enableLogging;
    }

    // Core methods to extract:
    enqueue(item, priority = 'normal') { }
    processNext() { }
    startTimer() { }
    stopTimer() { }
    clearQueue() { }
    getQueueLength() { }
    isEmpty() { }
    hasHighPriority() { }
}
```

#### Step 2: Write Unit Tests (90 min)

Test categories:
1. Queue operations (enqueue, dequeue) - 4 tests
2. Priority handling (high/normal) - 3 tests
3. Timer management - 3 tests
4. Queue state - 3 tests
5. Edge cases - 5 tests

#### Step 3: Verify Integration (30 min)

```bash
# Run new tests
npm test -- __tests__/unit/SpeechQueueProcessor.test.js

# Run all tests
npm test

# Expected: 1,948 passing (18 new)
```

#### Step 4: Commit (10 min)

```bash
git add src/speech/SpeechQueueProcessor.js \
        __tests__/unit/SpeechQueueProcessor.test.js

git commit -m "refactor(speech): extract SpeechQueueProcessor (Phase 3)

- Create SpeechQueueProcessor class (200 lines)
- Extract queue and timer management
- Add 18 unit tests with 100% coverage
- All 1,948 tests passing
- Part of god class refactoring (Issue #265)"
```

### Code References

**Priority Constants** (existing in SpeechSynthesisManager):
```javascript
const PRIORITY_HIGH = 'high';
const PRIORITY_NORMAL = 'normal';
```

**Queue Item Structure**:
```javascript
{
    text: string,
    priority: 'high' | 'normal',
    timestamp: number
}
```

**Timer Configuration**:
```javascript
const QUEUE_INTERVAL = 100; // ms between queue checks
```

### Common Issues & Solutions

#### Issue 1: Timer Leaks
**Solution**: Always call `stopTimer()` in destroy method

#### Issue 2: Priority Sorting
**Solution**: High priority items go to front, normal to back

#### Issue 3: Concurrent Processing
**Solution**: Use `isProcessing` flag to prevent overlaps

### Testing Strategy

**Unit Test Coverage**:
- ✅ Queue operations (add, remove, clear)
- ✅ Priority handling (high vs normal)
- ✅ Timer lifecycle (start, stop, restart)
- ✅ Empty queue handling
- ✅ Multiple enqueue operations
- ✅ Timer cleanup on destroy

**Integration Points**:
- Will integrate with SpeechController (Phase 4)
- Will use TimerManager for centralized cleanup
- Will notify via callback when processing

### Estimated Time

- Extract code: 60 minutes
- Write tests: 90 minutes
- Verify & debug: 30 minutes
- Commit & document: 10 minutes

**Total**: 180-190 minutes (~3 hours)

### Success Criteria

- [ ] SpeechQueueProcessor.js created (~200 lines)
- [ ] 18 unit tests passing (100% coverage)
- [ ] All 1,948 tests passing
- [ ] No memory leaks (timer cleanup verified)
- [ ] Clean commit to branch

---

## After Phase 3

### Next: Phase 4 - SpeechController (6-8 hours)

**Files to Create**:
- `src/speech/SpeechController.js` (~200 lines)
- `__tests__/unit/SpeechController.test.js` (20 tests)

**Extracts**:
- Speech synthesis core
- Utterance creation
- Event handling (onend, onerror)

### Then: Phase 5 - StateTracker + Facade (6-8 hours)

**Files to Create**:
- `src/speech/SpeechStateTracker.js` (~150 lines)
- `__tests__/unit/SpeechStateTracker.test.js` (12 tests)
- `__tests__/integration/SpeechSynthesisManager.integration.test.js` (15 tests)

**Refactors**:
- SpeechSynthesisManager → Facade pattern (~100 lines)

---

## Emergency Commands

### If Tests Fail
```bash
# Check what changed
git status
git diff

# See recent commits
git log --oneline -5

# Revert last commit (if needed)
git reset --soft HEAD~1
```

### If Need to Pause Mid-Phase
```bash
# Stash work in progress
git stash save "WIP: Phase 3 SpeechQueueProcessor"

# Resume later
git stash pop
```

### If Need to Switch Branches
```bash
# Commit WIP state
git add .
git commit -m "WIP: Phase 3 partial implementation"

# Switch and return
git checkout main
# ... do other work ...
git checkout refactor/speech-synthesis-manager
```

---

## Contact Points

**Issue Tracking**: GitHub Issue #265  
**Documentation**: `docs/refactoring/IMPLEMENTATION_GUIDE_2026-01-24.md`  
**Plan**: `docs/refactoring/GOD_CLASS_REFACTORING_PLAN_2026-01-24.md`

---

## Progress Visualization

```
Phase 1 [████████] VoiceManager        ✅ DONE (280 lines)
Phase 2 [████████] Configuration        ✅ DONE (227 lines, 26 tests)
Phase 3 [░░░░░░░░] QueueProcessor      ⏳ IN PROGRESS
Phase 4 [░░░░░░░░] Controller          ⏳ TODO
Phase 5 [░░░░░░░░] StateTracker+Facade ⏳ TODO

Overall: ████████░░░░░░░░░░ 40% Complete
```

---

**Last Updated**: 2026-01-24 00:40 UTC  
**Status**: Ready to resume Phase 3  
**Next Action**: Extract SpeechQueueProcessor from lines 600-800 of SpeechSynthesisManager.js
