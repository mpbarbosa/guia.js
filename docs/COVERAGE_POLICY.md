# Coverage Policy
**Date**: 2026-01-09  
**Effective**: Immediately

## Coverage Thresholds

### Current Baselines (Enforced in CI)

```json
{
  "statements": 68%,
  "branches": 73%,
  "functions": 57%,
  "lines": 68%
}
```

**Set slightly below actual coverage** (69.66% / 74.39% / 58.09% / 70%) to allow for minor fluctuations while preventing significant regression.

---

## Policy Rules

### 1. Coverage Must Not Decrease

**Rule**: Pull requests that reduce coverage below thresholds will fail CI.

**Enforcement**: Automated via Jest `coverageThreshold` configuration in `package.json`.

**Exception**: If legitimate (e.g., removing dead code), update thresholds with justification.

---

### 2. New Code Should Maintain Coverage

**Target**: Aim for ≥70% coverage on new code.

**Not Required**: 
- Browser-specific UI code (`app.js`, `error-recovery.js`, `geolocation-banner.js`)
- Defensive error fallbacks (unknown error codes)
- External API failure scenarios (complex mocking)

**Testing Strategy**:
- Unit tests for business logic
- Manual testing checklist for browser UI
- Selenium tests for E2E scenarios

---

### 3. Coverage Improvement Plan

**Current**: 69.66% statement, 74.39% branch (GOOD)

**Target**: 75-80% over time (if beneficial)

**Approach**: Incremental improvements through:
1. Testing new features thoroughly
2. Adding tests when fixing bugs
3. Opportunistic test additions during refactoring

**NOT Through**: Chasing arbitrary coverage goals that don't improve quality

---

## Coverage Metrics Interpretation

### What Coverage Percentages Mean

| Range | Rating | Interpretation |
|-------|--------|----------------|
| 90-100% | Exceptional | Comprehensive testing, rare for web apps |
| 80-90% | Excellent | Very well tested |
| **70-80%** | **Good** | **Industry standard** ← **Current state** |
| 60-70% | Fair | Adequate for early-stage projects |
| <60% | Poor | Significant gaps in testing |

---

### Coverage by Directory (Current)

| Directory | Coverage | Status |
|-----------|----------|--------|
| src/core/ | 84% | ✅ Excellent |
| src/data/ | 78% | ✅ Good |
| src/html/ | 94% | ⭐ Exceptional |
| src/speech/ | 92% | ⭐ Exceptional |
| src/services/ | 47% | ⚠️ Fair (browser APIs) |
| src/coordination/ | 40% | ⚠️ Fair (complex orchestration) |
| src/ (browser files) | 27% | ⚠️ Low (expected - browser UI) |

**Overall**: 69.66% statement, 74.39% branch = **Good**

---

## Acceptable Coverage Gaps

### Browser UI Code (Expected Low Coverage)

**Files**:
- `src/app.js` (0% - SPA router)
- `src/error-recovery.js` (0% - error handling)
- `src/geolocation-banner.js` (0% - permission UI)

**Why**: Cannot be unit tested in Jest (requires real browser)

**Mitigation**: Manual testing checklist in TESTING.md

---

### Error Handling Paths (Expected Low Coverage)

**Examples**:
- Unknown error codes (fallback branches)
- Old browser fallbacks (rare scenarios)
- Network failure edge cases

**Why**: Complex mocking, rarely executed in practice

**Mitigation**: Test critical error paths, accept gaps for rare scenarios

---

## CI/CD Integration

### GitHub Actions Workflow

**File**: `.github/workflows/copilot-coding-agent.yml`

**Test Job**:
```yaml
- run: npm ci
- run: npm run test:coverage
- uses: codecov/codecov-action@v3  # Optional upload
```

**Enforcement**:
- ✅ Coverage thresholds checked automatically
- ✅ CI fails if coverage drops below baseline
- ✅ Coverage summary displayed in workflow

---

### Local Development

**Check coverage before committing**:
```bash
# Run tests with coverage
npm run test:coverage

# Check if thresholds pass
# Jest will exit with error if below thresholds
```

**Pre-commit hook** (`.github/hooks/pre-commit`):
- Already runs tests
- Coverage checked on commit

---

## Updating Thresholds

### When to Update

**Increase thresholds** when:
- Coverage consistently exceeds current baseline by ≥2%
- Major refactoring improves testability
- New tests significantly increase coverage

**Decrease thresholds** when:
- Removing untestable code (browser files, etc.)
- Refactoring reduces LOC without losing functionality
- Justified in PR review

### How to Update

**1. Update package.json**:
```json
"coverageThreshold": {
  "global": {
    "statements": 70,  // New threshold
    "branches": 75,
    "functions": 60,
    "lines": 70
  }
}
```

**2. Test locally**:
```bash
npm run test:coverage
```

**3. Commit with justification**:
```bash
git commit -m "chore: Update coverage thresholds to 70/75/60/70

Justification: Coverage has consistently been above 70% for 3 months.
Raising baseline to prevent regression."
```

---

## Coverage Monitoring

### Tracking Over Time

**Tools**:
- Codecov (optional) - Upload coverage reports to track trends
- GitHub Actions summary - View coverage in each workflow run
- Local reports - `coverage/lcov-report/index.html`

**Frequency**: Check on each PR, review quarterly

---

### Red Flags

**Alert if**:
- Coverage drops >5% in single PR
- Coverage trend declining over time
- Critical paths show <50% coverage
- New features added without tests

---

## Best Practices

### DO ✅

- Write tests for new features
- Test critical business logic thoroughly
- Test edge cases and error conditions
- Use manual testing checklist for browser UI
- Maintain coverage at or above thresholds

### DON'T ❌

- Chase arbitrary coverage goals (e.g., "must reach 80%")
- Test purely for coverage percentage
- Test browser UI in Jest (use manual/Selenium)
- Test defensive fallbacks excessively
- Compromise test quality for coverage number

---

## Summary

**Current Coverage**: 69.66% statement, 74.39% branch = **Good** ✅

**Thresholds**: 68% / 73% / 57% / 68% (enforced in CI)

**Policy**: Maintain or improve coverage, justify any decreases

**Approach**: Quality over quantity, pragmatic testing strategy

---

**Last Updated**: 2026-01-09  
**Next Review**: 2026-04-09 (Quarterly)
