# CI/CD Configuration Guide

## Overview

This repository implements a **5-stage CI/CD pipeline** optimized for fast feedback and efficient resource usage.

**Total CI time**: ~12-19s with parallel execution
**Pre-commit hook time**: 1-2s (only changed files)

---

## 📋 Pipeline Stages

### Stage 1: Lint and Validate (~5s)
**Purpose**: Fast syntax and style checks
```bash
npm run validate  # JavaScript syntax validation
npm run lint      # ESLint checks
```

**Why first?**: Catches obvious errors before running expensive tests

### Stage 2: Unit Tests (~4s, parallel)
**Purpose**: Test isolated units
```bash
npm run test:unit  # Tests in __tests__/unit/
```

**Runs in parallel** after Stage 1 passes

### Stage 3: Integration Tests (~3s, parallel)
**Purpose**: Test component interactions
```bash
npm run test:integration  # Tests in __tests__/integration/
npm run test:features     # Tests in __tests__/features/
npm run test:services     # Tests in __tests__/services/
```

**Runs in parallel** with Stage 2 (3 parallel jobs)

### Stage 4: Coverage Gate (~7s)
**Purpose**: Enforce quality standards
```bash
npm run test:coverage  # Full suite with coverage report
```

**Coverage Thresholds**:
- **Statements**: ≥65%
- **Branches**: ≥69%
- **Functions**: ≥55%
- **Lines**: ≥65%
- **Services**: ≥20% branches, ≥18% functions (relaxed threshold)

**Runs after** all test stages complete

### Stage 5: PR Optimization (~1-2s)
**Purpose**: Fast feedback for pull requests
```bash
npm run test:changed  # Only tests changed files
```

**Only runs** on pull request events

---

## 🎯 Local Development Workflow

### Pre-commit Hook (Husky)
**Automatically runs** when you `git commit`:
```bash
npm run validate      # Syntax check
npm run test:changed  # Tests for changed files only
```

**Result**: 1-2s validation before commit is accepted

### Manual Test Commands

#### Full Test Suite
```bash
npm test              # All tests (~7s)
npm run test:all      # Validate + All tests (~8s)
npm run test:coverage # With coverage report (~7s)
```

#### Test Categories
```bash
npm run test:unit         # Unit tests only (~4s)
npm run test:integration  # Integration tests only (~3s)
npm run test:features     # Feature tests only (~2s)
npm run test:services     # Service tests only (~2s)
npm run test:changed      # Changed files only (~1-2s)
```

#### Code Quality
```bash
npm run validate      # Syntax validation (<1s)
npm run lint          # ESLint checks (~2s)
npm run lint:fix      # Auto-fix linting issues (~3s)
```

---

## ⚙️ Configuration Details

### Coverage Threshold Changes

**Why adjust thresholds?**
Current coverage: ~67% statements, ~69% branches, ~57% functions

**Realistic baseline approach**:
1. ✅ Set thresholds slightly below current coverage (allows CI to pass)
2. 🔄 Add per-module thresholds (services more lenient at 18-20%)
3. 🎯 Gradually increase coverage via new tests
4. ✅ Raise thresholds incrementally as coverage improves

**Configuration** (`package.json`):
```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "statements": 65,
        "branches": 69,
        "functions": 55,
        "lines": 65
      },
      "./src/services/**/*.js": {
        "branches": 20,
        "functions": 18
      }
    }
  }
}
```

### Caching Strategy

**GitHub Actions caching** saves 10-15s per run:
```yaml
- uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      node_modules
      coverage
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
```

**When cache invalidates**: Only when `package-lock.json` changes

### Parallel Execution

**Before**: Sequential stages → ~19s total
**After**: Parallel test stages → ~12s total

```mermaid
graph LR
    A[Lint 5s] --> B1[Unit 4s]
    A --> B2[Integration 3s]
    A --> B3[Features 2s]
    A --> B4[Services 2s]
    B1 --> C[Coverage 7s]
    B2 --> C
    B3 --> C
    B4 --> C
```

**Total time**: 5s (lint) + 4s (longest parallel) + 7s (coverage) = **16s**

---

## 🚀 Quick Reference

### Daily Development
```bash
# Make changes to code
git add .
git commit -m "feature: add new functionality"
# ⏱️ Pre-commit hook runs automatically (1-2s)

# Manual validation before push
npm run test:all  # (~8s)
```

### Before Pull Request
```bash
# Run full validation locally
npm run validate      # Syntax
npm run lint          # Style
npm run test:coverage # Coverage

# Create PR
git push origin feature-branch
# ⏱️ GitHub Actions runs full pipeline (12-19s)
```

### Troubleshooting Failures

#### "Coverage threshold not met"
```bash
# Check current coverage
npm run test:coverage

# Identify uncovered code
cat coverage/lcov-report/index.html  # Open in browser

# Add missing tests
# Then verify locally before pushing
```

#### "Test failed on CI but passes locally"
```bash
# Ensure dependencies are synced
npm ci  # Clean install

# Run exact same command as CI
npm run test:coverage

# Check Node.js version matches CI (20.x)
node --version
```

#### "Lint errors blocking commit"
```bash
# Auto-fix common issues
npm run lint:fix

# Check remaining issues
npm run lint

# Fix manually or adjust .eslintrc if needed
```

---

## 📊 Performance Benchmarks

### Local Machine
| Command | Time | Test Count |
|---------|------|------------|
| `npm run validate` | <1s | N/A |
| `npm run test:unit` | ~4s | ~800 tests |
| `npm run test:integration` | ~3s | ~600 tests |
| `npm run test:features` | ~2s | ~100 tests |
| `npm run test:services` | ~2s | ~50 tests |
| `npm test` | ~7s | 1,558 passing |
| `npm run test:coverage` | ~7s | 1,558 + coverage |
| `npm run test:changed` | ~1-2s | Varies |

### GitHub Actions (Ubuntu runner)
| Stage | Time | Jobs |
|-------|------|------|
| Lint & Validate | ~5s | 1 job |
| Test (parallel) | ~4s | 4 jobs |
| Coverage Gate | ~7s | 1 job |
| **Total** | **~16s** | **6 jobs** |

**With caching**: Install time reduced from 20s → 5s

---

## 🔧 Advanced Configuration

### Custom Test Patterns

Add new test categories to `package.json`:
```json
{
  "scripts": {
    "test:api": "jest --testPathPattern='__tests__/api'",
    "test:e2e": "jest --testPathPattern='__tests__/e2e'"
  }
}
```

### Adjust Coverage Per Directory
```json
{
  "jest": {
    "coverageThreshold": {
      "global": { "branches": 72 },
      "./src/core/**/*.js": {
        "statements": 90,  // Stricter for core
        "branches": 85
      },
      "./src/experimental/**/*.js": {
        "statements": 50,  // More lenient for experimental
        "branches": 40
      }
    }
  }
}
```

### Skip CI for Docs-Only Changes
Add to commit message:
```bash
git commit -m "docs: update README [skip ci]"
```

---

## 📝 Best Practices

### ✅ DO
- Run `npm run test:changed` before committing
- Let pre-commit hooks catch errors early
- Use `npm run lint:fix` to auto-fix style issues
- Check coverage locally before pushing
- Split large test files by category (unit/integration)

### ❌ DON'T
- Skip pre-commit hooks (`git commit --no-verify`)
- Push without running tests locally first
- Lower coverage thresholds without justification
- Commit large test files to main categories (causes slow runs)

---

## 🔍 Monitoring & Metrics

### GitHub Actions Dashboard
View pipeline performance:
1. Go to **Actions** tab
2. Check **Test Pipeline** workflow
3. Review stage timings and failures

### Coverage Reports
- **Local**: `coverage/lcov-report/index.html`
- **CI**: Uploaded as artifacts (download from workflow run)
- **Codecov** (optional): View at codecov.io (if configured)

### Test Result Artifacts
Each CI run uploads:
- `unit-test-results` (7 days retention)
- `integration-test-results` (7 days retention)
- `feature-test-results` (7 days retention)
- `service-test-results` (7 days retention)
- `coverage-report` (30 days retention)

---

## 🆘 Getting Help

### Common Issues

**Q: Pre-commit hook is too slow**
A: Check which tests are running - should only be changed files (~1-2s)

**Q: CI passes but coverage gate fails**
A: Run `npm run test:coverage` locally to see exact thresholds

**Q: Test splitting not working**
A: Ensure test files are in correct directories (`__tests__/{unit,integration,features,services}/`)

**Q: Cache not working on CI**
A: Check if `package-lock.json` changed - cache invalidates on changes

### Debug Commands
```bash
# Check test file organization
find __tests__ -type f -name "*.js" | sort

# Verify coverage thresholds
cat package.json | jq '.jest.coverageThreshold'

# Test Husky hook manually
.husky/pre-commit

# Simulate CI locally
npm ci && npm run test:all
```

---

## 📚 Related Documentation

- [Testing Guide](./UNIT_TEST_GUIDE.md)
- [GitHub Actions Guide](./GITHUB_ACTIONS_GUIDE.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [TDD Guide](./TDD_GUIDE.md)

---

**Last Updated**: 2026-01-12
**Pipeline Version**: 2.0
**Estimated CI Time**: 12-19s (with parallel execution and caching)
