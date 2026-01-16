# Coverage Improvement Action Plan

**Project**: Guia Turístico  
**Current Coverage**: ~70% overall  
**Target Coverage**: 80%+ for critical modules  
**Timeline**: 2-3 days (Phase 1), 1-2 weeks (complete)

---

## Executive Summary

This action plan addresses critical test coverage gaps identified in the codebase, prioritizing high-impact modules with the lowest coverage. The plan is divided into 3 phases with clear time estimates and success metrics.

**Key Focus Areas**:
1. WebGeocodingManager.js - 500+ uncovered lines (CRITICAL)
2. Integration test gaps for geocoding workflows
3. DOM manipulation and browser-specific code
4. Error handling paths

---

## Phase 1: Fix Critical Gaps (2-3 days)

### Priority 1: WebGeocodingManager.js ⭐ CRITICAL

**File**: `src/coordination/WebGeocodingManager.js`  
**Current Lines**: ~971 total  
**Uncovered Lines**: 500+ (estimated based on DOM dependencies)  
**Target Coverage**: 70% → 85%

#### Gap Analysis

**Lines 387-422: Error Handling Paths** (35 lines uncovered)
- Geolocation error scenarios
- API failure handling
- Permission denial flows
- Network timeout cases

**Lines 472-971: DOM Manipulation** (499 lines, many uncovered)
- Button click handlers
- Element initialization
- Dynamic UI updates
- Event listener binding

#### Testing Strategy

**1.1 Integration Tests for Geocoding Workflows** (4 hours)

Create `__tests__/integration/WebGeocodingManager.integration.test.js`:

```javascript
describe('WebGeocodingManager Integration Tests', () => {
    describe('Complete geocoding workflow', () => {
        test('should complete full cycle: permission → location → geocoding → display', async () => {
            // Test end-to-end happy path
        });
        
        test('should handle permission denial gracefully', async () => {
            // Test error path: user denies permission
        });
        
        test('should retry on API failure with exponential backoff', async () => {
            // Test retry logic
        });
    });
    
    describe('State management', () => {
        test('should track loading states correctly', async () => {
            // Verify loading indicators
        });
        
        test('should maintain position history', async () => {
            // Test position tracking
        });
    });
});
```

**Target**: Cover lines 387-422 (error handling)  
**Estimated Coverage Gain**: +5%

**1.2 DOM Manipulation Tests** (4 hours)

Create `__tests__/unit/WebGeocodingManager.dom.test.js`:

```javascript
describe('WebGeocodingManager DOM Manipulation', () => {
    let mockDocument;
    let mockElements;
    
    beforeEach(() => {
        // Setup JSDOM mock environment
        mockDocument = {
            getElementById: jest.fn(),
            createElement: jest.fn(),
            addEventListener: jest.fn()
        };
        
        mockElements = {
            startButton: { addEventListener: jest.fn(), disabled: false },
            locationDisplay: { textContent: '' },
            addressDisplay: { innerHTML: '' }
        };
        
        mockDocument.getElementById.mockImplementation((id) => mockElements[id]);
    });
    
    describe('Button initialization', () => {
        test('should bind click handler to start tracking button', () => {
            // Test lines 472-500
        });
        
        test('should disable button while tracking', () => {
            // Test button state management
        });
    });
    
    describe('Display updates', () => {
        test('should update location display with coordinates', () => {
            // Test lines 650-700
        });
        
        test('should update address display with formatted address', () => {
            // Test lines 750-800
        });
        
        test('should handle missing DOM elements gracefully', () => {
            // Test defensive programming
        });
    });
    
    describe('Event listeners', () => {
        test('should attach all required event listeners', () => {
            // Test lines 850-900
        });
        
        test('should remove listeners on cleanup', () => {
            // Test memory leak prevention
        });
    });
});
```

**Target**: Cover lines 472-971 (DOM code)  
**Estimated Coverage Gain**: +15%  
**Total Phase 1 Coverage Gain**: +20% for WebGeocodingManager.js

---

## Phase 2: Secondary Critical Files (3-4 days)

### Priority 2: ServiceCoordinator.js

**File**: `src/coordination/ServiceCoordinator.js`  
**Uncovered Areas**: Observer wiring, lifecycle management  
**Estimated Effort**: 3 hours

**Action Items**:
1. Test observer subscription scenarios (1 hour)
2. Test tracking start/stop lifecycle (1 hour)
3. Test error propagation through coordinators (1 hour)

**Tests to Create**:
- `__tests__/coordination/ServiceCoordinator.lifecycle.test.js`
- `__tests__/coordination/ServiceCoordinator.observers.test.js`

**Coverage Gain**: +8%

### Priority 3: ReverseGeocoder.js

**File**: `src/services/ReverseGeocoder.js`  
**Uncovered Areas**: API retry logic, error handling  
**Estimated Effort**: 2 hours

**Action Items**:
1. Test Nominatim API failure scenarios (1 hour)
2. Test coordinate validation edge cases (30 min)
3. Test observer notification with complex data (30 min)

**Tests to Create**:
- `__tests__/services/ReverseGeocoder.errors.test.js`

**Coverage Gain**: +5%

### Priority 4: HTMLAddressDisplayer.js

**File**: `src/html/HTMLAddressDisplayer.js`  
**Current Coverage**: Partial  
**Estimated Effort**: 2 hours

**Action Items**:
1. Test address formatting edge cases (1 hour)
2. Test DOM updates with complex addresses (30 min)
3. Test error handling for invalid data (30 min)

**Tests to Create**:
- `__tests__/html/HTMLAddressDisplayer.edge-cases.test.js`

**Coverage Gain**: +6%

**Total Phase 2 Coverage Gain**: +19%

---

## Phase 3: Long-tail Improvements (1 week)

### Priority 5: Browser-Specific Code

**Files**:
- `src/html/HTMLHighlightCardsDisplayer.js`
- `src/html/HTMLPositionDisplayer.js`
- `src/ui/ErrorRecovery.js`

**Strategy**: E2E tests with Puppeteer (already have infrastructure)

**Estimated Effort**: 8 hours

**Tests to Create**:
- `__tests__/e2e/ErrorRecovery.e2e.test.js` (2 hours)
- `__tests__/e2e/DisplayUpdates.e2e.test.js` (3 hours)
- `__tests__/e2e/UserInteractions.e2e.test.js` (3 hours)

**Coverage Gain**: +12%

### Priority 6: Edge Cases and Error Paths

**Approach**: Systematic review of uncovered branches

**Estimated Effort**: 6 hours

**Action Items**:
1. Run coverage report with branch details (30 min)
2. Identify uncovered if/else branches (1 hour)
3. Create targeted tests for each branch (4.5 hours)

**Coverage Gain**: +8%

**Total Phase 3 Coverage Gain**: +20%

---

## Coverage Targets by File

| File | Current | Phase 1 Target | Phase 2 Target | Phase 3 Target |
|------|---------|----------------|----------------|----------------|
| WebGeocodingManager.js | ~50% | 70% | 75% | 80% |
| ServiceCoordinator.js | ~65% | — | 73% | 78% |
| ReverseGeocoder.js | ~75% | — | 80% | 85% |
| HTMLAddressDisplayer.js | ~60% | — | 66% | 72% |
| HTMLHighlightCardsDisplayer.js | ~55% | — | — | 67% |
| HTMLPositionDisplayer.js | ~58% | — | — | 70% |
| ErrorRecovery.js | ~40% | — | — | 60% |

**Overall Project Target**:
- Current: ~70%
- After Phase 1: ~75%
- After Phase 2: ~80%
- After Phase 3: ~85%

---

## Implementation Timeline

### Day 1-2 (Phase 1 Start)
- ⏰ **Hours 1-4**: WebGeocodingManager integration tests
  - Create test file structure
  - Implement geocoding workflow tests
  - Test error handling paths
  - **Deliverable**: 387-422 lines covered

- ⏰ **Hours 5-8**: WebGeocodingManager DOM tests (part 1)
  - Setup JSDOM mocks
  - Test button initialization
  - Test event listeners
  - **Deliverable**: 472-650 lines covered

### Day 3 (Phase 1 Complete)
- ⏰ **Hours 1-4**: WebGeocodingManager DOM tests (part 2)
  - Test display updates
  - Test element manipulation
  - Test cleanup/teardown
  - **Deliverable**: 650-971 lines covered

- ⏰ **Hours 5-6**: Phase 1 validation
  - Run coverage report
  - Verify 20% gain
  - Document remaining gaps
  - **Milestone**: Phase 1 COMPLETE ✅

### Day 4-6 (Phase 2)
- ServiceCoordinator tests (Day 4, 3 hours)
- ReverseGeocoder error tests (Day 5, 2 hours)
- HTMLAddressDisplayer edge cases (Day 5, 2 hours)
- Integration testing and validation (Day 6, 3 hours)
- **Milestone**: Phase 2 COMPLETE ✅

### Week 2 (Phase 3)
- E2E tests for browser-specific code (Days 1-2, 8 hours)
- Edge case and branch coverage (Days 3-4, 6 hours)
- Final validation and documentation (Day 5, 2 hours)
- **Milestone**: Phase 3 COMPLETE ✅

---

## Test Code Organization

### New Test Files to Create

```
__tests__/
├── integration/
│   ├── WebGeocodingManager.integration.test.js          (NEW - 4 hours)
│   ├── GeocodingWorkflow.integration.test.js            (NEW - 2 hours)
│   └── ErrorRecovery.integration.test.js                (NEW - 2 hours)
├── unit/
│   ├── WebGeocodingManager.dom.test.js                  (NEW - 4 hours)
│   └── ServiceCoordinator.lifecycle.test.js             (NEW - 3 hours)
├── coordination/
│   └── ServiceCoordinator.observers.test.js             (NEW - 2 hours)
├── services/
│   └── ReverseGeocoder.errors.test.js                   (NEW - 2 hours)
├── html/
│   └── HTMLAddressDisplayer.edge-cases.test.js          (NEW - 2 hours)
└── e2e/
    ├── ErrorRecovery.e2e.test.js                        (NEW - 2 hours)
    ├── DisplayUpdates.e2e.test.js                       (NEW - 3 hours)
    └── UserInteractions.e2e.test.js                     (NEW - 3 hours)
```

**Total New Files**: 11  
**Total Estimated Effort**: 31 hours (~4 working days)

---

## Success Metrics

### Coverage Metrics

**Phase 1 Success Criteria**:
- ✅ WebGeocodingManager.js: 50% → 70% (+20%)
- ✅ Overall project: 70% → 75% (+5%)
- ✅ Lines 387-422 fully covered (error handling)
- ✅ Lines 472-971 at 85%+ coverage (DOM code)

**Phase 2 Success Criteria**:
- ✅ ServiceCoordinator.js: 65% → 73% (+8%)
- ✅ ReverseGeocoder.js: 75% → 80% (+5%)
- ✅ HTMLAddressDisplayer.js: 60% → 66% (+6%)
- ✅ Overall project: 75% → 80% (+5%)

**Phase 3 Success Criteria**:
- ✅ Browser-specific files: Average 70%+ coverage
- ✅ Branch coverage: 75%+
- ✅ Overall project: 80% → 85% (+5%)

### Quality Metrics

**Test Quality**:
- All new tests pass consistently
- No flaky tests (run 10x each, 100% pass rate)
- E2E tests complete in <30 seconds each
- Unit tests complete in <1 second each

**Code Quality**:
- No new ESLint warnings introduced
- All tests follow project patterns
- Clear test descriptions and comments
- Proper mock cleanup (no memory leaks)

---

## Risk Mitigation

### Risk 1: DOM Mocking Complexity
**Probability**: High  
**Impact**: Medium  
**Mitigation**:
- Use JSDOM for complex DOM operations
- Fallback to E2E tests for browser-specific features
- Document mock limitations

### Risk 2: Test Flakiness
**Probability**: Medium  
**Impact**: High  
**Mitigation**:
- Implement proper waits in E2E tests
- Use deterministic mocks
- Add retry logic for network-dependent tests

### Risk 3: Time Overruns
**Probability**: Medium  
**Impact**: Medium  
**Mitigation**:
- Buffer 20% extra time per phase
- Prioritize P0 tests if time constrained
- Document deferred tests for future sprints

---

## Monitoring and Reporting

### Daily Standup Reports

**Template**:
```
Coverage Update - Day X

✅ Completed:
- [Test File Name] - Coverage: XX% → YY%
- [Lines Covered]: XXX-YYY

🚧 In Progress:
- [Current Task] - XX% complete

⏭️ Next:
- [Next Task] - Starting [Time]

📊 Metrics:
- Overall Coverage: XX% (Target: YY%)
- Tests Added: XX (Target: YY)
```

### Weekly Summary Reports

**Template**:
```
Week X Coverage Summary

📈 Coverage Progress:
- Start: XX%
- End: YY%
- Gain: +ZZ%

✅ Phase Milestones:
- Phase 1: [COMPLETE/IN PROGRESS/PENDING]
- Phase 2: [COMPLETE/IN PROGRESS/PENDING]
- Phase 3: [COMPLETE/IN PROGRESS/PENDING]

📝 Tests Added:
- Integration: X files
- Unit: Y files
- E2E: Z files

⚠️  Blockers: [None/List]
```

---

## Phase 1 Quick Start Guide

### Immediate Next Steps (Today)

**Step 1**: Create integration test file (30 min)
```bash
mkdir -p __tests__/integration
touch __tests__/integration/WebGeocodingManager.integration.test.js
```

**Step 2**: Setup test infrastructure (30 min)
```javascript
// Copy structure from existing integration tests
// Setup mocks for document, geolocation, fetch
// Create helper functions
```

**Step 3**: Implement first test (1 hour)
```javascript
test('should complete full geocoding cycle', async () => {
    // Arrange: Setup mocks
    // Act: Trigger geocoding
    // Assert: Verify all steps completed
});
```

**Step 4**: Run and validate (30 min)
```bash
npm test -- WebGeocodingManager.integration.test.js
npm run test:coverage -- --collectCoverageFrom='src/coordination/WebGeocodingManager.js'
```

**Expected Result**: +3-5% coverage after first test

---

## Tools and Resources

### Required Tools
- ✅ Jest (already installed)
- ✅ Puppeteer (already installed for E2E)
- ✅ JSDOM (via Jest environment)
- ⚠️ Coverage badges (optional - can add to README)

### Useful Commands

```bash
# Run coverage for specific file
npm run test:coverage -- --collectCoverageFrom='src/path/to/file.js'

# Run coverage with HTML report
npm run test:coverage && open coverage/lcov-report/index.html

# Find uncovered lines
npm run test:coverage -- --coverage --coverageReporters=text

# Run tests in watch mode
npm run test:watch -- WebGeocodingManager

# Check specific file coverage
npm run test:coverage -- --collectCoverageFrom='src/coordination/**/*.js' --testPathPattern=coordination
```

### Documentation References
- Jest Coverage Docs: https://jestjs.io/docs/cli#--coverageboolean
- Puppeteer Testing Guide: https://pptr.dev/guides/
- JSDOM Setup: https://github.com/jsdom/jsdom

---

## Conclusion

This action plan provides a systematic approach to improving test coverage from 70% to 85% over 2-3 weeks. **Phase 1 is the highest priority** and should yield immediate results (20% coverage gain for WebGeocodingManager.js) in just 2-3 days.

**Key Success Factors**:
1. Focus on high-impact files first (WebGeocodingManager)
2. Use appropriate test types (unit for logic, E2E for DOM)
3. Monitor progress daily with coverage reports
4. Maintain test quality standards

**Next Action**: Begin Phase 1, Task 1.1 (Integration Tests) immediately.

---

**Last Updated**: 2026-01-15  
**Document Owner**: Development Team  
**Review Schedule**: Weekly during implementation
