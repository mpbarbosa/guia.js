# CI/CD Quick Reference Card

## 🚀 Developer Commands (Daily Use)

### Before Committing

```bash
npm run validate       # Syntax check (<1s)
npm run test:changed   # Test changed files (1-2s)
npm run lint:fix       # Auto-fix style issues
```

### Manual Testing

```bash
npm test               # All tests (~7s)
npm run test:all       # Validate + tests (~8s)
npm run test:coverage  # With coverage (~7s)
```

### Test by Category

```bash
npm run test:unit         # Unit tests only (~6s, 657 tests)
npm run test:integration  # Integration tests (~5s, 277 tests)
npm run test:features     # Feature tests (~2s, ~100 tests)
npm run test:services     # Service tests (~1s, ~50 tests)
```

---

## 📋 Pre-commit Hook

**Location**: `.husky/pre-commit`

**Runs automatically** on `git commit`:

1. Validates JavaScript syntax
2. Runs tests for changed files only
3. Takes 1-2 seconds

**Bypass** (emergency only):

```bash
git commit --no-verify -m "message"
```

---

## �� GitHub Actions Pipeline

**Workflow**: `.github/workflows/test.yml`

### Stages (Parallel)

```
Stage 1: Lint & Validate (5s)
    ↓
├─ Stage 2: Unit Tests (4s)
├─ Stage 3a: Integration Tests (3s)
├─ Stage 3b: Feature Tests (2s)
└─ Stage 3c: Service Tests (1s)
    ↓
Stage 4: Coverage Gate (7s)
    ↓
Stage 5: PR Changed Files (1-2s, PR only)
```

**Total time**: ~16s

---

## 📊 Coverage Thresholds

**Current** (must pass):

- Statements: ≥65% (actual: 67.09%)
- Branches: ≥69% (actual: 69.51%)
- Functions: ≥55% (actual: 57.16%)
- Lines: ≥65% (actual: 67.29%)

**Services** (relaxed):

- Branches: ≥20%
- Functions: ≥18%

---

## 🐛 Common Issues

### Pre-commit hook too slow

```bash
npm run test:changed  # Should be 1-2s, not 7s
# If slow, check which files changed
```

### Coverage failing

```bash
npm run test:coverage  # Check actual %
# Add tests or adjust threshold
```

### Tests failing on CI but not locally

```bash
npm ci                 # Clean install
npm run test:coverage  # Match CI environment
```

---

## 📈 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Pre-commit | <2s | ~1-2s ✅ |
| Unit tests | <7s | ~6s ✅ |
| Full suite | <8s | ~7s ✅ |
| CI total | <20s | ~16s ✅ |
| Coverage | >65% | ~67% ✅ |

---

## 📚 Full Documentation

- **Complete Guide**: `.github/CI_CD_GUIDE.md`
- **Implementation**: `.github/CI_CD_IMPLEMENTATION_SUMMARY.md`
- **Testing Guide**: `.github/UNIT_TEST_GUIDE.md`

---

**Last Updated**: 2026-01-12
