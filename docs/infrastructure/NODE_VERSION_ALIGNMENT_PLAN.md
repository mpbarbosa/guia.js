# Node.js Version Alignment Plan

**Created**: 2026-01-16  
**Status**: 🔴 CRITICAL - Environment Mismatch Detected  
**Priority**: HIGH - Blocks jsdom upgrade to v27.4.0

## Problem Statement

### Current State (Mismatched)
| Environment | Node.js Version | Status |
|-------------|----------------|--------|
| **Local (.nvmrc)** | v25.2.1 | ❌ Too new |
| **CI (syntax check)** | v18 | ❌ Too old |
| **CI (tests)** | v20 | ⚠️ Unspecified minor |
| **package.json** | `>=18.0.0 <26.0.0` | ⚠️ Too permissive |

### Impact
1. **jsdom upgrade blocked**: v27.4.0 requires Node.js `^20.19.0 || ^22.12.0 || >=24.0.0`
2. **"Works on my machine" risk**: Local (v25) vs CI (v18/v20)
3. **Dependency vulnerabilities**: Older Node.js versions may have security issues
4. **Test reliability**: Different environments may produce different results

---

## Recommended Solution: Align to Node.js 20 LTS

### Why Node.js 20 LTS?
✅ **Long-term support** until 2026-04-30  
✅ **jsdom 27.x compatible** (`^20.19.0` required)  
✅ **Stable and battle-tested** in production  
✅ **CI/CD friendly** (widely supported)  
✅ **Balance** between stability and modern features  

### Target Configuration
```
Local Development:  Node.js 20.19.0
CI/CD Pipeline:     Node.js 20.19.0
package.json:       ">=20.19.0 <21.0.0"
```

---

## Implementation Plan

### Phase 1: Update Configuration Files (15 minutes)

#### Step 1.1: Update .nvmrc
```bash
echo "20.19.0" > .nvmrc
```

#### Step 1.2: Update package.json engines
```json
{
  "engines": {
    "node": ">=20.19.0 <21.0.0",
    "npm": ">=10.0.0"
  }
}
```

#### Step 1.3: Update CI workflows
```yaml
# .github/workflows/copilot-coding-agent.yml
# Change all occurrences:
node-version: '20.19.0'  # Was: '18' or '20'
```

### Phase 2: Local Validation (10 minutes)

```bash
# Install Node.js 20.19.0
nvm install 20.19.0
nvm use 20.19.0

# Verify version
node --version  # Should show: v20.19.0

# Clean install
rm -rf node_modules package-lock.json
npm install

# Run full test suite
npm run test:all

# Expected results:
# ✅ Tests: 1,827 passing / 1,973 total
# ✅ Test Suites: 80 passing / 84 total
# ✅ Coverage: ~70%
```

### Phase 3: CI/CD Validation (Wait for GitHub Actions)

```bash
# Commit changes
git add .nvmrc package.json .github/workflows/copilot-coding-agent.yml
git commit -m "chore(env): align Node.js to v20.19.0 LTS across all environments"
git push

# Monitor CI pipeline
# Expected: All checks pass ✅
```

### Phase 4: Documentation Updates (5 minutes)

Update the following files to reflect Node.js 20.19.0:
- ✅ `.github/CONTRIBUTING.md` - Add Node.js version requirement
- ✅ `README.md` - Update prerequisites section
- ✅ `.github/copilot-instructions.md` - Update environment requirements

---

## Post-Alignment: jsdom Upgrade Path

### Once Node.js 20.19.0 is aligned:

```bash
# Use existing validation script
./.github/scripts/validate-jsdom-update.sh

# Manual validation steps:
# 1. Test all 1,973 tests pass
# 2. Verify E2E tests (9 Puppeteer tests)
# 3. Check coverage remains ~70%
# 4. Manual browser testing (src/index.html)
```

### Expected jsdom 27.4.0 Benefits:
✅ `TextEncoder`/`TextDecoder` support (Web API compatibility)  
✅ Improved byte decoding performance  
✅ Memory leak fixes  
✅ Better standards compliance  

---

## Alternative: Upgrade to Node.js 25

### Why NOT Recommended (for now):
❌ **No LTS status** - Still in "current" phase  
❌ **Less CI/CD support** - Many tools still target Node.js 20  
❌ **Bleeding edge** - Potential for unexpected breaking changes  
❌ **jsdom 27.x requires 24+** - Node.js 25 is compatible but overkill  

### When to Consider Node.js 25:
- ⏳ After Node.js 22 LTS is released (2024-10)
- ⏳ When dependencies broadly support v25
- ⏳ When CI/CD platforms have robust v25 support

---

## Risk Assessment

### Low Risk ✅
- Node.js 20.19.0 is mature and stable
- All dependencies compatible with Node.js 20
- Existing tests provide regression safety net

### Mitigation Strategy
1. **Backup**: Current state works (no urgent pressure)
2. **Rollback**: Keep commit separate for easy revert
3. **Testing**: Full test suite validation before merge
4. **Monitoring**: Watch CI for 1 week post-merge

---

## Timeline

| Phase | Duration | Responsible | Status |
|-------|----------|-------------|--------|
| 1. Update configs | 15 min | Developer | ⏸️ Pending |
| 2. Local validation | 10 min | Developer | ⏸️ Pending |
| 3. CI validation | 5 min | GitHub Actions | ⏸️ Pending |
| 4. Documentation | 5 min | Developer | ⏸️ Pending |
| **Total** | **35 min** | | ⏸️ **Ready to Execute** |

---

## Checklist

### Pre-Implementation
- [ ] Review current Node.js usage: `node --version`
- [ ] Check CI logs for Node.js warnings
- [ ] Backup current configuration
- [ ] Review dependency compatibility

### Implementation
- [ ] Update `.nvmrc` to 20.19.0
- [ ] Update `package.json` engines
- [ ] Update all CI workflow files
- [ ] Clean install: `rm -rf node_modules && npm ci`
- [ ] Run test suite: `npm run test:all`
- [ ] Commit and push changes

### Post-Implementation
- [ ] Monitor CI pipeline (all checks pass)
- [ ] Update documentation files
- [ ] Plan jsdom upgrade (use validation script)
- [ ] Monitor for 1 week (no regressions)

---

## Related Documentation

- `.github/scripts/validate-jsdom-update.sh` - jsdom upgrade validation
- `.github/dependabot.yml` - Automated dependency management
- `docs/WORKFLOW_SETUP.md` - CI/CD pipeline documentation
- `.github/CONTRIBUTING.md` - Development environment setup

---

**Status**: Plan ready for execution ✅  
**Next Action**: Update `.nvmrc` and begin Phase 1  
**Blocker Removed After**: jsdom can upgrade to v27.4.0
