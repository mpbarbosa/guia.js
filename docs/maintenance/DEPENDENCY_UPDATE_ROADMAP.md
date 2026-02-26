# Dependency Update Roadmap

**Project:** Guia Turístico v0.9.0-alpha
**Created:** 2026-01-09
**Status:** Planning Phase

---

## 📊 Current Environment State

### ✅ Strengths

- **Node.js v25.2.1:** Latest stable release with excellent ES module support
- **npm v11.7.0:** Modern package manager with improved security
- **ESM Configuration:** `"type": "module"` in package.json ✅
- **Test Infrastructure:** Jest configured with coverage reporting (1,282 passing tests)
- **Coverage Enforcement:** 68%/73%/57%/68% thresholds in CI/CD
- **jsdom Classification:** ✅ **FIXED** - Moved to devDependencies (2026-01-09)

### ⚠️ Known Issues

1. **Jest Version Drift:** Specified ^30.1.3, installed 29.7.0 (tests work perfectly)
2. **Lockfile Drift:** Causes false positive security warnings
3. **Missing Version Specification:** No .nvmrc or engines field
4. **Security False Positives:** glob@7.2.3 and js-yaml@3.14.2 (both safe, npm audit confused)

---

## 🎯 Update Strategy Overview

### Philosophy

- **Alpha stage (0.9.0-alpha):** Prioritize flexibility over absolute stability
- **Minimal disruption:** Only fix actual issues, not cosmetic warnings
- **Test-driven:** Every change must pass 1,282 tests + coverage thresholds
- **Documented decisions:** Track why we changed (or didn't change) each item

---

## 🚀 Phase 1: Environment Specification (LOW RISK - 15 minutes)

**Goal:** Standardize Node.js version across development environments

### Actions

#### 1.1 Create .nvmrc

```bash
echo "25.2.1" > .nvmrc
```

**Benefits:**

- Team members can use `nvm use` for instant version match
- CI/CD can reference exact version
- Documents minimum requirements

#### 1.2 Add engines field to package.json

```json
"engines": {
  "node": ">=18.0.0 <26.0.0",
  "npm": ">=10.0.0"
}
```

**Rationale:**

- **Node >=18:** Required for ES modules support (src/app.js uses `import`)
- **Node <26:** Prevents future breaking changes during alpha
- **npm >=10:** Modern lockfile format with security improvements

#### 1.3 Optional: Enable engine enforcement

```bash
echo "engine-strict=true" >> .npmrc
```

**Warning:** Only enable if all team members have Node 18+

### Testing

```bash
# Verify engines field accepted
npm install --dry-run

# Test with different Node versions (if available)
nvm use 18 && npm test
nvm use 20 && npm test
nvm use 25 && npm test
```

### Expected Outcome

- ✅ .nvmrc created
- ✅ engines field in package.json
- ✅ All tests still pass (1,282 passing)
- ✅ No functional changes

---

## 🔧 Phase 2: Lockfile Regeneration (MODERATE RISK - 30 minutes)

**Goal:** Eliminate false positive security warnings and version drift

**⚠️ CAUTION:** This will update all dependencies to latest versions matching package.json ranges

### Pre-flight Checklist

- [ ] All current changes committed (`git status` clean)
- [ ] Backup created (`git tag backup-before-lockfile-regen`)
- [ ] Tests passing (1,282 passing baseline)
- [ ] Coverage at 74.39% branch coverage

### Actions

#### 2.1 Create safety snapshot

```bash
git add -A
git commit -m "chore: snapshot before lockfile regeneration"
git tag -a "v0.9.0-alpha-pre-lockfile-fix" -m "Backup before dependency updates"
```

#### 2.2 Regenerate lockfile

```bash
# Remove old state
rm -rf node_modules package-lock.json

# Fresh install with latest matching versions
npm install

# Verify what changed
npm list --depth=0
```

#### 2.3 Validate installation

```bash
# Check Jest version (should now be 30.x)
npm list jest

# Check if false positives resolved
npm audit

# Verify installed versions
cat node_modules/glob/package.json | grep '"version"'
cat node_modules/js-yaml/package.json | grep '"version"'
```

### Expected Changes

```diff
# package-lock.json
- "jest": "29.7.0"
+ "jest": "30.1.3" or "30.2.x" (whatever latest 30.x is)

# npm audit should now be clean (no false positives)
```

### Testing Strategy

```bash
# Full validation suite
npm run test:all

# Coverage threshold check
npm run test:coverage

# Syntax validation
npm run validate

# Manual web test
python3 -m http.server 9000
# Open http://localhost:9000/src/index.html
# Test geolocation button
# Verify console output
```

### Rollback Plan (if tests fail)

```bash
git reset --hard v0.9.0-alpha-pre-lockfile-fix
git tag -d v0.9.0-alpha-pre-lockfile-fix
npm install
```

### Expected Outcome

- ✅ Jest 30.x installed (matching package.json)
- ✅ Lockfile consistent with package.json
- ✅ npm audit clean (no false positives)
- ✅ All 1,282 tests passing
- ✅ Coverage thresholds enforced (68%/73%/57%/68%)
- ⚠️ May see minor API changes in Jest 30 (unlikely to break tests)

---

## 🔬 Phase 3: Dependency Updates (LOW PRIORITY - Future)

**Goal:** Update to latest patch/minor versions for bug fixes

**When:** Next release cycle (v0.9.0-alpha or v1.0.0)

### Current Status (As of 2026-01-09)

| Package | Specified | Currently Installed | Latest Available | Update Recommended? |
|---------|-----------|---------------------|------------------|---------------------|
| **eslint** | ^9.39.2 | 9.39.2 | Check with `npm outdated` | Wait for 0.9.0 |
| **jest** | ^30.1.3 | 29.7.0 → will be 30.x after Phase 2 | 30.x | ✅ Phase 2 |
| **jsdom** | ^27.3.0 | 27.3.0 | Check with `npm outdated` | Wait for 0.9.0 |
| **guia.js** | github HEAD | Latest commit | N/A (git dep) | Track upstream |
| **ibira.js** | github HEAD | Latest commit | N/A (git dep) | Track upstream |

### Update Commands (for v0.9.0 cycle)

```bash
# Check for updates
npm outdated

# Update specific packages
npm update eslint  # Updates within ^9.39.2 range
npm update jsdom   # Updates within ^27.3.0 range

# Or update all at once
npm update

# Always test after updates
npm run test:all
```

### Monitoring Strategy

```bash
# Weekly check during alpha development
npm outdated

# Security monitoring
npm audit

# Dependabot (if enabled in GitHub)
# - Auto-creates PRs for security updates
# - Recommended for production (1.0.0+)
```

---

## 📋 Version Pinning Strategy (For Future Production Release)

**Current (0.9.0-alpha):** Caret ranges (`^`) - ✅ Correct for alpha

**Future (1.0.0 production):** Consider exact versions

### Recommended Transition Plan

#### Alpha/Beta Phases (0.9.0 → 0.9.0)

```json
{
  "version": "0.9.0-alpha",
  "devDependencies": {
    "eslint": "^9.39.2",  // ✅ Keep flexible
    "jest": "^30.1.3"
  },
  "dependencies": {
    "guia.js": "github:mpbarbosa/guia_js",  // ✅ HEAD tracking ok
    "ibira.js": "github:mpbarbosa/ibira.js"
  }
}
```

#### Release Candidate (1.0.0-rc.1)

```json
{
  "version": "1.0.0-rc.1",
  "devDependencies": {
    "eslint": "^9.39.2",  // Dev tools stay flexible
    "jest": "^30.1.3"
  },
  "dependencies": {
    "guia.js": "1.0.0",  // Pin to release tag
    "ibira.js": "1.0.0"
  }
}
```

#### Production (1.0.0+)

```json
{
  "version": "1.0.0",
  "devDependencies": {
    "eslint": "9.39.2",   // Optional: exact for reproducibility
    "jest": "30.1.3"
  },
  "dependencies": {
    "guia.js": "1.0.0",   // Exact versions
    "ibira.js": "1.0.0"
  }
}
```

---

## 🎯 Recommended Execution Timeline

### Immediate (This Session)

- [x] **jsdom moved to devDependencies** ✅ COMPLETED (2026-01-09)
- [ ] **Phase 1:** Add .nvmrc and engines field (15 minutes, low risk)

### Next Development Session (Within 1 week)

- [ ] **Phase 2:** Regenerate lockfile (30 minutes, moderate risk)
- [ ] Verify Jest 30.x compatibility
- [ ] Confirm npm audit clean

### Next Release Cycle (v0.9.0-alpha)

- [ ] **Phase 3:** Update outdated dependencies
- [ ] Run `npm outdated` and evaluate updates
- [ ] Test comprehensively with updated dependencies

### Production Release (v1.0.0)

- [ ] Pin dependency versions (exact, not ranges)
- [ ] Enable Dependabot for security monitoring
- [ ] Consider npm shrinkwrap for absolute reproducibility

---

## 🧪 Testing Checklist (After Each Phase)

### Automated Tests

```bash
✅ npm run validate              # Syntax check (<1 second)
✅ npm test                      # 1,282 tests (6 seconds)
✅ npm run test:coverage         # Coverage thresholds (68%/73%/57%/68%)
✅ npm run test:all              # Combined validation (7 seconds)
```

### Manual Validation

```bash
✅ python3 -m http.server 9000
✅ Open http://localhost:9000/src/index.html
✅ Click "Obter Localização" button
✅ Verify geolocation prompt appears
✅ Check browser console for errors
✅ Test "Encontrar Restaurantes" button
✅ Test "Estatísticas da Cidade" button
✅ Verify address display formatting
```

### Coverage Verification

```bash
✅ Branch coverage >= 68%
✅ Line coverage >= 73%
✅ Function coverage >= 57%
✅ Statement coverage >= 68%
```

---

## 📝 Decision Log

### 2026-01-09: jsdom Classification

**Decision:** Move jsdom from dependencies → devDependencies
**Rationale:** Not used in production code, only in (currently skipped) tests
**Impact:** ~7MB production bundle reduction
**Status:** ✅ COMPLETED

### 2026-01-09: Jest Version Drift

**Decision:** Defer to Phase 2 (lockfile regeneration)
**Rationale:** Tests work perfectly with Jest 29, no urgent need to update
**Impact:** Will naturally resolve when lockfile regenerated
**Status:** ⏳ PLANNED (Phase 2)

### 2026-01-09: Security False Positives

**Decision:** Defer to Phase 2 (lockfile regeneration)
**Rationale:** Actual code is secure (glob 7.2.3, js-yaml 3.14.2), npm audit confused by lockfile metadata
**Impact:** False warnings eliminated after fresh install
**Status:** ⏳ PLANNED (Phase 2)

### 2026-01-09: Version Pinning Strategy

**Decision:** Keep caret ranges (`^`) for alpha/beta phases
**Rationale:** Project is 0.9.0-alpha, needs flexibility for rapid development
**Impact:** Easier to stay current with security patches and bug fixes
**Status:** ✅ ACCEPTED (revisit at 1.0.0)

---

## 🚨 Risk Assessment

### Phase 1 (Environment Specification) - LOW RISK ⚠️

**Likelihood of breakage:** 1%
**Impact if breaks:** Low (just documentation, no code changes)
**Rollback complexity:** Trivial (delete .nvmrc, remove engines field)
**Recommended:** ✅ Execute immediately

### Phase 2 (Lockfile Regeneration) - MODERATE RISK ⚠️⚠️

**Likelihood of breakage:** 10-15%
**Impact if breaks:** Moderate (tests may fail, Jest 30 API changes)
**Rollback complexity:** Easy (git reset to backup tag)
**Recommended:** ✅ Execute with backup strategy

### Phase 3 (Dependency Updates) - VARIABLE RISK ⚠️⚠️⚠️

**Likelihood of breakage:** 20-30% (depends on specific updates)
**Impact if breaks:** High (may require code changes, API migrations)
**Rollback complexity:** Moderate (may need per-package rollback)
**Recommended:** ⏳ Defer to v0.9.0 cycle

---

## 📚 References

- [npm package.json engines documentation](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#engines)
- [Semantic Versioning (SemVer) guide](https://semver.org/)
- [nvm (Node Version Manager) documentation](https://github.com/nvm-sh/nvm)
- [Jest 30 Migration Guide](https://jestjs.io/docs/upgrading-to-jest30) (for Phase 2)
- Project-specific: `docs/misc/SECURITY_ASSESSMENT_2026-01-09.md`

---

## 🎬 Next Steps

### Immediate Actions (Recommended)

1. Review this roadmap with team (if applicable)
2. Execute Phase 1 (15 minutes, low risk)
3. Commit Phase 1 changes
4. Schedule Phase 2 for next development session

### Before Executing Phase 2

1. Ensure all current work committed
2. Create backup tag: `git tag v0.9.0-alpha-pre-lockfile-fix`
3. Allocate 30-45 minutes for testing
4. Have rollback plan ready

### Questions to Resolve

- [ ] Is there a team? (affects .npmrc engine-strict setting)
- [ ] Target release date for v0.9.0-alpha? (affects Phase 3 timing)
- [ ] Production timeline for v1.0.0? (affects version pinning strategy)

---

**Last Updated:** 2026-01-09
**Next Review:** Before v0.9.0-alpha release
**Owner:** Project maintainer
**Status:** 📋 Planning → ⏭️ Ready for Phase 1 execution
