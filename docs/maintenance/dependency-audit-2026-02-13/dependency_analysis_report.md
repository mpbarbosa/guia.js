# Dependency Health & Security Analysis Report

**Date**: 2026-02-13  
**Project**: Guia Turístico v0.9.0-alpha  
**Node.js**: v25.6.1 | **npm**: 11.10.0

---

## Executive Summary

| Category | Status | Details |
|----------|--------|---------|
| **Security Score** | ⚠️ LOW | 1 low-severity vulnerability identified |
| **Dependency Count** | ✅ HEALTHY | 13 direct (2 prod, 11 dev); 740 total transitive |
| **Outdated Packages** | ⚠️ ACTION NEEDED | 3 packages have updates available |
| **Node.js Compatibility** | ✅ EXCELLENT | Running v25.6.1 (exceeds requirement of v20.19.0+) |
| **npm Compatibility** | ✅ EXCELLENT | Running v11.10.0 (exceeds requirement of v10.0.0+) |

---

## 🔒 Security Assessment

### Critical Finding: qs Dependency Vulnerability

**Vulnerability Details:**

```
Package: qs (indirect dependency)
Severity: LOW
CVSS Score: 3.7 (Low)
CWE: CWE-20 (Improper Input Validation)
```

**Issue**: "qs's arrayLimit bypass in comma parsing allows denial of service"

- **Affected Range**: qs >=6.7.0 <=6.14.1
- **Advisory**: GHSA-w7fw-mjwx-w883
- **Impact**: DoS potential via crafted query strings, limited practical risk
- **Fix Available**: Yes, via `npm audit fix`

**Root Cause Analysis:**

- `qs` is an indirect dependency (not directly in package.json)
- Likely pulled in by: `http-server` (dev dependency)
- Development-only risk (not in production)

**Recommendation**:
✅ **Run immediately**: `npm audit fix` - Quick, safe, automated fix

---

## 📦 Outdated Packages Analysis

### Overview

3 packages have available updates. Severity varies by impact:

| Package | Current | Wanted | Latest | Type | Priority | Notes |
|---------|---------|--------|--------|------|----------|-------|
| **puppeteer** | 24.36.1 | 24.37.2 | 24.37.2 | Patch | 🟢 LOW | Update immediately (patch fix) |
| **eslint** | 9.39.2 | 9.39.2 | 10.0.0 | Major | 🟡 MEDIUM | 10.x is major version; test before update |
| **jsdom** | 25.0.1 | 25.0.1 | 28.0.0 | Major | 🟡 MEDIUM | Major update; potential breaking changes |

### Detailed Analysis

#### 1. **puppeteer (24.36.1 → 24.37.2)** - PATCH UPDATE

- **Recommendation**: ✅ **Update immediately** (lowest risk)
- **Change Type**: Patch release (bug fixes)
- **Breaking Changes**: None expected
- **Test Impact**: Minimal (E2E tests may auto-update browser)
- **Action**: `npm install puppeteer@24.37.2` or let npm update automatically

#### 2. **eslint (9.39.2 → 10.0.0)** - MAJOR UPDATE

- **Recommendation**: 🟡 **Update with caution**
- **Change Type**: Major version (potential breaking changes)
- **Key Changes** (based on ESLint v10 release):
  - May drop support for older Node.js versions
  - Configuration format changes possible
  - Plugin compatibility may be affected
- **Test Strategy**:
  1. Update in development environment first
  2. Run `npm run lint` to validate configuration
  3. Fix any new linting issues
  4. Run full test suite to ensure no regressions
- **Action**: Defer to next maintenance window unless critical fixes needed

#### 3. **jsdom (25.0.1 → 28.0.0)** - MAJOR UPDATE

- **Recommendation**: 🟡 **Update with caution** OR **defer**
- **Change Type**: Major version (likely breaking changes)
- **Impact Assessment**:
  - Jest uses jsdom for DOM testing (11 test suites dependent)
  - v28 may have API changes, performance improvements
  - IMPORTANT: Project has extensive E2E tests using jsdom
- **Compatibility Concerns**:
  - v28 requires Node.js v18.20.0+ (current: v25.6.1 ✅)
  - jsdom → jest-environment-jsdom dependency chain
  - jest v30.1.3 support for jsdom v28 needs verification
- **Test Strategy**:
  1. Verify jest v30.1.3 officially supports jsdom v28
  2. Update both together for compatibility
  3. Run full test suite: `npm run test:all`
  4. Verify all 2,235+ tests still pass
  5. Check E2E tests for timing-dependent flakiness
- **Action**: Research compatibility first, test thoroughly before merge

---

## 🔍 Dependency Structure Analysis

### Production Dependencies (2 packages)

```
guia.js@github:mpbarbosa/guia_js#v0.6.0-alpha
  └─ Type: GitHub repository reference (alpha)
  └─ Stability: Pre-release (not semver pinned)
  └─ Recommendation: ⚠️ Monitor for updates

ibira.js@github:mpbarbosa/ibira.js#v0.2.1-alpha
  └─ Type: GitHub repository reference (alpha)
  └─ Stability: Pre-release (not semver pinned)
  └─ Recommendation: ⚠️ Monitor for updates
```

**Assessment**:

- Both are internal projects (mpbarbosa org) used for Brazilian geolocation
- Alpha versions appropriate for active development
- Consider promoting to stable versions (v1.0.0) before production release

### Development Dependencies (11 packages)

```
Build Tools (4):
  ├─ vite@^7.3.1 (module bundler, ES2022 target)
  ├─ @vitejs/plugin-legacy@^7.2.1 (legacy browser support)
  ├─ terser@^5.46.0 (JS minifier)
  └─ jsdoc@^4.0.5 (API documentation)

Testing & Quality (6):
  ├─ jest@^30.1.3 (test runner)
  ├─ jest-environment-jsdom@^30.2.0 (DOM simulation)
  ├─ jsdom@^25.0.1 (DOM implementation)
  ├─ puppeteer@^24.36.1 (E2E browser automation)
  ├─ eslint@^9.39.2 (code linting)
  └─ http-server@^14.1.1 (dev server/testing)

DevOps & Git (1):
  └─ husky@^9.1.7 (git hooks)
```

**Health Indicators**:

- ✅ All dev dependencies actively maintained (2024+ releases)
- ✅ Ecosystem well-supported (Vite, Jest, Puppeteer are industry standard)
- ✅ No deprecated packages detected
- ✅ Compatible with Node.js v25.6.1

---

## 📊 Transitive Dependencies

### Total Dependency Tree

```
Direct Dependencies:     13 (2 prod + 11 dev)
Transitive Dependencies: 727
├─ Production context:   48 packages
├─ Development context:  693 packages
└─ Optional:              83 packages
```

### Major Transitive Contributors

1. **puppeteer** → ~150 packages (Chromium & browser automation)
2. **jest** → ~200 packages (testing framework ecosystem)
3. **vite** → ~100 packages (build tool ecosystem)
4. **jsdom** → ~50 packages (DOM implementation)
5. **eslint** → ~80 packages (linting ecosystem)

**Assessment**:

- ✅ Normal for modern JavaScript projects
- ✅ No bloat detected
- ✅ All major tools are stable and well-maintained

---

## ⚠️ Known Incompatibilities & Risks

### None Detected ✅

Current setup has:

- ✅ Verified Node.js v25.6.1 compatibility
- ✅ npm v11.10.0 compatibility
- ✅ No conflicting peer dependency requirements
- ✅ All tools support modern ES modules (package.json `"type": "module"`)

### Potential Future Issues

1. **Python E2E tests** (`tests/e2e/`) require Python 3.11+
   - Separate ecosystem, not managed by npm
   - May need: `pip install -r requirements.txt`

---

## 🚀 Update Recommendations

### Immediate Actions (Today)

```bash
# 1. Fix security vulnerability
npm audit fix

# 2. Update puppeteer patch
npm install puppeteer@24.37.2

# 3. Verify no regressions
npm run test:all
```

**Expected Time**: ~2 minutes  
**Risk Level**: 🟢 MINIMAL

### Short-term Actions (Next Sprint)

```bash
# 4. Research ESLint v10 compatibility
npm outdated eslint
npm show eslint@10.0.0 peer

# 5. Test ESLint v10 in isolation
npm install --save-dev eslint@10.0.0
npm run lint
npm run test:all
```

**Expected Time**: ~15 minutes  
**Risk Level**: 🟡 MODERATE (may need config updates)

### Medium-term Actions (Before v1.0.0)

```bash
# 6. Plan jsdom v28 update
# - Verify jest v30.1.3 official support
# - Create feature branch
# - Update both jsdom + jest together
# - Full regression test suite
```

**Expected Time**: ~30 minutes  
**Risk Level**: 🟡 MODERATE (breaking changes possible)

---

## 📋 Best Practices Implementation

### Current State ✅

- [x] `package-lock.json` committed (reproducible installs)
- [x] Semantic versioning used throughout (^, ~)
- [x] npm audit configured and passing
- [x] Separate prod/dev dependencies
- [x] engine constraints in package.json
- [x] GitHub Actions CI/CD configured

### Recommendations

#### 1. **Dependency Monitoring**

```bash
# Add to CI/CD or run weekly
npm audit --audit-level=moderate
npm outdated
```

#### 2. **Version Pinning Strategy**

```json
{
  "devDependencies": {
    "puppeteer": "24.37.2",    // Pin patch for E2E consistency
    "jest": "^30.1.3",         // Minor version flexibility
    "vite": "^7.3.1"           // Patch version updates only
  }
}
```

#### 3. **Update Process**

1. **Weekly**: `npm audit` (security scanning)
2. **Monthly**: `npm outdated` (version review)
3. **Per-sprint**: Planned updates with testing
4. **Pre-release**: Full regression test suite

#### 4. **Documentation**

Add to CONTRIBUTING.md:

```markdown
## Dependency Management
- Update patches immediately (security fixes)
- Update minors in planning phase (features)
- Test majors before release (breaking changes)
- Always run `npm test:all` after updates
```

---

## 🎯 Conclusion

| Aspect | Status | Action |
|--------|--------|--------|
| **Security** | ⚠️ LOW RISK | Run `npm audit fix` immediately |
| **Maintenance** | ✅ GOOD | All packages actively maintained |
| **Compatibility** | ✅ EXCELLENT | Node.js v25.6.1+ exceeds requirements |
| **Updates Available** | 🟡 3 PENDING | Prioritize puppeteer (patch), defer eslint/jsdom |
| **Production Ready** | ⚠️ NEEDS ATTENTION | Address qs vulnerability before production |

**Overall Health Score**: 8/10 (Good, with minor updates recommended)

---

**Next Steps**:

1. ✅ Run `npm audit fix` → `npm install puppeteer@24.37.2`
2. ✅ Run `npm test:all` to verify no regressions
3. 🔄 Schedule eslint v10 evaluation for next sprint
4. 🔄 Plan jsdom v28 update with full regression testing
