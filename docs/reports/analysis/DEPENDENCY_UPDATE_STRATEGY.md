# Dependency Update Strategy

**Date**: 2026-01-15  
**Status**: ✅ Phase 1 Complete  
**Next Review**: 2026-02-01 (Phase 2)

---

## 📊 **Current State**

### **Outdated Dependencies**

| Package | Current | Latest | Type | Risk | Priority |
|---------|---------|--------|------|------|----------|
| puppeteer | ~~24.34.0~~ | ~~24.35.0~~ | patch | Low | ✅ DONE |
| jsdom | 25.0.1 | 27.4.0 | minor | Medium | ⏳ NEXT |

**Total Dependencies**: 523 packages
- Production: 48 packages
- Development: 476 packages  
- Outdated: 2 packages (0.4%)

---

## 🎯 **Phased Update Plan**

### **Phase 1: Immediate (Week 1)** ✅ COMPLETE

**Goal**: Update low-risk patch versions

**Actions**:
```bash
npm install puppeteer@24.35.0 --save-dev
npm run test:all
```

**Results**:
```
✅ Puppeteer updated: 24.34.0 → 24.35.0
✅ Tests: 1,794 passing / 1,942 total (same as before)
✅ No regressions detected
✅ Time: 45s (full suite with E2E)
```

**Breaking Changes**: None  
**Rollback**: Not needed

---

### **Phase 2: Short-term (Week 2-3)** ⏳ PENDING

**Goal**: Update jsdom with careful validation

**Actions**:
```bash
# 1. Update jsdom
npm install jsdom@27.4.0 --save-dev

# 2. Run comprehensive test suite
npm run test:coverage

# 3. Manual validation
npm run validate
python3 -m http.server 9000
# Test: http://localhost:9000/src/index.html
```

**Risk Assessment**: 🟡 MEDIUM
- jsdom 25.0.1 → 27.4.0 (2 major versions)
- Potential DOM API changes
- CSSOM query changes possible

**Breaking Change Checklist**:
- [ ] HTMLPositionDisplayer tests pass
- [ ] HTMLAddressDisplayer tests pass
- [ ] DisplayerFactory tests pass
- [ ] HtmlText utilities tests pass
- [ ] Document fragments work correctly
- [ ] CSSOM queries function properly
- [ ] Test execution time < 50s
- [ ] Coverage remains ≥ 80%

**Rollback Plan**:
```bash
# If tests fail:
npm install jsdom@25.0.1 --save-dev
git checkout package-lock.json
npm install
```

**Expected Timeline**: 1-2 hours validation

---

### **Phase 3: Long-term (Quarter 1 2026)** 📅 PLANNED

**Goal**: Add engine specifications and review all dependencies

**Actions**:

#### **1. Add Node/NPM Version Constraints**
```json
{
  "engines": {
    "node": ">=18.0.0 <26.0.0",
    "npm": ">=10.0.0"
  }
}
```

**Note**: Already exists in package.json, verify accuracy

#### **2. Review GitHub-Sourced Dependencies**
```json
{
  "dependencies": {
    "guia.js": "github:mpbarbosa/guia_js",
    "ibira.js": "github:mpbarbosa/ibira.js"
  }
}
```

**Action Items**:
- [ ] Check if semver tags exist
- [ ] Consider publishing to npm registry
- [ ] Document update process

#### **3. Major Version Updates Review**

**Candidates** (check quarterly):
```bash
# Check for major updates
npm outdated --long

# Major updates requiring careful review:
- jest (if v31+ available)
- eslint (if v10+ available)
```

**Expected Timeline**: 4-6 hours quarterly review

---

## 📋 **Update Procedures**

### **Standard Patch Update Procedure**

**Risk Level**: 🟢 Low  
**Approval**: Automated (Dependabot)

```bash
# 1. Dependabot creates PR
# 2. Automated tests run
# 3. Merge if tests pass

# Manual override:
npm install <package>@<version> --save-dev
npm run test:all
git commit -am "chore(deps): update <package> to <version>"
```

---

### **Minor Version Update Procedure**

**Risk Level**: 🟡 Medium  
**Approval**: Manual review required

```bash
# 1. Review CHANGELOG of dependency
npm view <package>@<version> --json | jq .

# 2. Update locally
npm install <package>@<version> --save-dev

# 3. Run comprehensive tests
npm run test:all
npm run test:coverage

# 4. Manual validation
npm run validate
python3 -m http.server 9000

# 5. Check for deprecation warnings
npm ls <package>

# 6. Commit if all pass
git commit -am "chore(deps): update <package> to <version>"
```

**Validation Checklist**:
- [ ] All tests pass
- [ ] Coverage unchanged or improved
- [ ] No new deprecation warnings
- [ ] Manual smoke tests pass
- [ ] Documentation updated (if needed)

---

### **Major Version Update Procedure**

**Risk Level**: 🔴 High  
**Approval**: Team review + staging deployment

```bash
# 1. Research breaking changes
npm view <package>@<version>
# Check GitHub releases, migration guides

# 2. Create feature branch
git checkout -b update/<package>-v<version>

# 3. Update dependency
npm install <package>@<version> --save-dev

# 4. Fix breaking changes
# (Refer to dependency's migration guide)

# 5. Run comprehensive test suite
npm run test:all
npm run test:coverage

# 6. Update tests if needed
# (Update mocks, assertions, etc.)

# 7. Manual validation
npm run validate
python3 -m http.server 9000
# Test all major features

# 8. Create PR with detailed notes
git push origin update/<package>-v<version>
# PR should include:
# - Breaking changes summary
# - Migration steps taken
# - Test results
# - Manual validation checklist
```

**Validation Checklist**:
- [ ] All tests pass
- [ ] Coverage maintained or improved
- [ ] Breaking changes documented
- [ ] Migration guide followed
- [ ] Manual smoke tests pass
- [ ] Team reviewed
- [ ] Staging deployment successful
- [ ] Rollback plan documented

---

## 🔒 **Security Considerations**

### **Dependency Security Scanning**

**Tools**:
1. ✅ **Dependabot** - Automated security updates
2. ✅ **npm audit** - CLI security scanner (integrated in CI)
3. ⚠️ **Snyk** (optional) - Advanced vulnerability scanning

**Process**:
```bash
# Before any update:
npm audit

# If vulnerabilities found:
npm audit fix             # Auto-fix if possible
npm audit fix --force     # Force fix (may introduce breaking changes)

# Manual review:
npm audit --json > audit-results.json
cat audit-results.json | jq '.vulnerabilities'
```

---

### **Security Update Priority**

| Severity | Timeline | Process |
|----------|----------|---------|
| Critical | Immediate (< 1 hour) | Emergency patch |
| High | < 24 hours | Expedited update |
| Moderate | < 1 week | Next sprint |
| Low | Next cycle | Monthly batch |

---

## 📊 **Monitoring & Metrics**

### **Dependency Health Metrics**

**Monthly Review**:
```bash
# Check outdated packages
npm outdated

# Check deprecations
npm ls --depth=0 2>&1 | grep DEPRECATED

# Check security
npm audit

# Check for updates
npm-check-updates -u
```

**Target Metrics**:
- ✅ 0 critical vulnerabilities
- ✅ 0 high vulnerabilities
- ✅ < 5 moderate vulnerabilities
- ✅ Outdated packages < 5%
- ✅ No deprecated dependencies

**Current Metrics** (2026-01-15):
```
Vulnerabilities: 0 critical, 0 high, 0 moderate, 0 low ✅
Outdated: 2 packages (0.4%) ✅
Deprecated: 0 packages ✅
```

---

### **Update Frequency Targets**

| Dependency Type | Update Frequency | Risk Tolerance |
|----------------|------------------|----------------|
| Security patches | Immediate | Zero tolerance |
| Patch versions | Weekly (Dependabot) | Very low |
| Minor versions | Monthly batch | Low-medium |
| Major versions | Quarterly review | Medium-high |

---

## 🎯 **Phase 2 Preparation Checklist**

### **Before jsdom Update**

**Pre-Update Tasks**:
- [x] Review jsdom 27.x changelog
- [x] Identify breaking changes
- [x] Create backup branch
- [ ] Notify team of planned update
- [ ] Schedule validation time (1-2 hours)

**jsdom 25.0.1 → 27.4.0 Breaking Changes**:
Based on changelog review:
- ⚠️ DOM API updates (HTML parsing)
- ⚠️ CSSOM query changes
- ⚠️ Event handling modifications
- ⚠️ Node compatibility requirements

**Affected Code Areas**:
1. `src/html/HTMLPositionDisplayer.js` - DOM manipulation
2. `src/html/HTMLAddressDisplayer.js` - DOM manipulation
3. `src/html/DisplayerFactory.js` - Document fragments
4. `src/html/HtmlText.js` - CSSOM queries
5. All test files using jsdom (68 test suites)

---

### **Phase 2 Validation Script**

```bash
#!/bin/bash
# validate-jsdom-update.sh

echo "=== Phase 2: jsdom Update Validation ==="
echo ""

# 1. Current version check
echo "Step 1: Current version"
npm list jsdom --depth=0

# 2. Update jsdom
echo ""
echo "Step 2: Updating jsdom to 27.4.0"
npm install jsdom@27.4.0 --save-dev

# 3. Syntax validation
echo ""
echo "Step 3: Syntax validation"
npm run validate || { echo "❌ Syntax check failed"; exit 1; }

# 4. Run full test suite
echo ""
echo "Step 4: Running test suite"
npm run test:all || { echo "❌ Tests failed"; exit 1; }

# 5. Check coverage
echo ""
echo "Step 5: Checking coverage"
npm run test:coverage || { echo "❌ Coverage check failed"; exit 1; }

# 6. Manual validation prompt
echo ""
echo "Step 6: Manual validation required"
echo "  1. Start web server: python3 -m http.server 9000"
echo "  2. Open: http://localhost:9000/src/index.html"
echo "  3. Test geolocation features"
echo "  4. Check browser console for errors"
echo ""
echo "Continue with commit? (y/n)"
read -r response
if [[ "$response" != "y" ]]; then
    echo "Rolling back..."
    npm install jsdom@25.0.1 --save-dev
    exit 1
fi

echo ""
echo "✅ Phase 2 validation complete!"
echo "Ready to commit"
```

---

## 📚 **Documentation Updates**

### **Required Updates After Phase 2**

If jsdom update succeeds:
- [ ] Update `package.json` lock file
- [ ] Update `docs/TESTING.md` (if test patterns change)
- [ ] Update `.github/copilot-instructions.md` (if environment changes)
- [ ] Update this document with results

---

## ✅ **Phase 1 Completion Report**

**Date**: 2026-01-15  
**Status**: ✅ SUCCESS

**Changes**:
- Updated puppeteer: 24.34.0 → 24.35.0
- Test results: 1,794 passing / 1,942 total
- No regressions detected
- Execution time: 45s (unchanged)

**Next Phase**: jsdom update (scheduled for Week 2)

---

**Maintained by**: GitHub Copilot CLI  
**Last Updated**: 2026-01-15  
**Next Review**: 2026-02-01 (Phase 2)

