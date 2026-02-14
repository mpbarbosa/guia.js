# Dependency Management Roadmap

**Project**: Guia Turístico v0.9.0-alpha  
**Date**: 2026-02-13  
**Status**: Post-security-audit update

---

## Priority Recommendations

### Phase 1: Immediate (✅ COMPLETED)
**Timeline**: Today  
**Risk**: 🟢 MINIMAL

- [x] Fix qs vulnerability (npm audit fix)
- [x] Update puppeteer to latest patch (24.37.2)
- [x] Run validation suite
- [x] Commit security improvements

**Next**: Monitor for 48 hours, then proceed to Phase 2

---

### Phase 2: Short-term (Recommended)
**Timeline**: Next sprint (1-2 weeks)  
**Risk**: 🟡 MODERATE

#### ESLint v10 Migration
**Current**: 9.39.2  
**Available**: 10.0.0 (major version)

**Pre-migration Checklist**:
```bash
# 1. Review ESLint v10 breaking changes
npm show eslint@10.0.0
npm show eslint@10.0.0 peer

# 2. Create feature branch
git checkout -b chore/eslint-v10-upgrade

# 3. Update package.json
npm install --save-dev eslint@10.0.0

# 4. Test configuration
npm run lint
npm run lint:fix

# 5. Run full validation
npm run test:all
npm run validate

# 6. PR review and merge
```

**Potential Issues**:
- Configuration format changes (eslint.config.js compatibility)
- Plugin version compatibility updates needed
- New linting rules may flag code

**If Issues Arise**:
1. Defer to after v1.0.0 release
2. Continue using eslint 9.x (still supported)
3. No security risk in waiting (v9 is stable)

---

### Phase 3: Medium-term (Scheduled)
**Timeline**: End of sprint or next milestone  
**Risk**: 🟡 MODERATE

#### jsdom v28 Update (Dependent on ESLint v10)
**Current**: 25.0.1  
**Available**: 28.0.0 (major version - 3 major versions behind)

**Important Note**: jsdom updates can be sensitive for test suites!

**Pre-migration Analysis**:
```bash
# 1. Check jest compatibility
npm show jest@30.1.3 peerDependencies
npm view jsdom@28.0.0 engines

# 2. Research breaking changes
# - DOM API changes in v26, v27, v28
# - Performance implications
# - Known issues with jest v30

# 3. Create isolated test branch
git checkout -b chore/jsdom-v28-upgrade

# 4. Update jsdom and jest together
npm install --save-dev jsdom@28.0.0
# May need to update jest too

# 5. Run full test suite incrementally
npm run test:unit      # 10 suites
npm run test:services  # 15 suites
npm run test:features  # 8 suites
npm test               # Full 100+ suites

# 6. Monitor for flaky tests
# jsdom DOM implementation changes may affect timing
npm run test:debug --detectOpenHandles

# 7. PR with detailed migration notes
```

**Migration Strategy**:
```
Option A (Recommended): Update both simultaneously
- npm install --save-dev jsdom@28.0.0 jest@31.0.0
- Higher likelihood of compatibility
- Test together as a unit

Option B (Conservative): Update jsdom only
- npm install --save-dev jsdom@28.0.0
- Keep jest@30.1.3
- More incremental approach, slower validation
```

**Verification Checklist**:
- [ ] All 2,400+ tests pass
- [ ] E2E tests stable (no flakiness)
- [ ] Coverage metrics maintained
- [ ] No new console warnings
- [ ] Performance benchmarks OK

**If Issues Arise**:
1. Revert to jsdom v25
2. Wait for jest v31 stable release
3. Try jsdom v26 (intermediate step)
4. Document issues for upstream projects

**Expected Timeline**: 2-3 hours testing

---

### Phase 4: Long-term (Before v1.0.0)
**Timeline**: Pre-release preparation  
**Risk**: 🟢 MINIMAL (planning only)

#### Production Dependency Stabilization
**Current Status**:
- guia.js: v0.6.0-alpha
- ibira.js: v0.2.1-alpha

**Action Items**:
1. Work with upstream projects (mpbarbosa org)
2. Promote alpha versions to stable (v1.0.0)
3. Update package.json:
   ```json
   {
     "dependencies": {
       "guia.js": "^1.0.0",
       "ibira.js": "^1.0.0"
     }
   }
   ```
4. Final integration testing
5. Release v1.0.0 of Guia Turístico

---

## Dependency Health Metrics

### Current Scorecard
```
Security Vulnerabilities:    0/1       ✅ 0% (was 1 low)
Outdated Packages:           2/13      ✅ 85% up-to-date
Active Maintenance:          13/13     ✅ 100% maintained
Breaking Changes Needed:     2/13      ✅ Plan for next sprint
Production Ready:            ✅ YES (after Phase 1)
```

### Target Scorecard (Before v1.0.0)
```
Security Vulnerabilities:    0/1       ✅ 0%
Outdated Packages:           0/13      ✅ 100%
Active Maintenance:          13/13     ✅ 100%
Breaking Changes Needed:     0/13      ✅ 0%
Production Ready:            ✅ YES
```

---

## Monthly Maintenance Schedule

### Week 1: Audit & Review
```bash
# Tuesday morning
npm audit --json > audit-$(date +%Y%m%d).json
npm outdated --json > outdated-$(date +%Y%m%d).json

# Review in team standup
# Categorize findings: critical | important | nice-to-have
```

### Week 2: Security Response
```bash
# If critical vulnerabilities found:
npm audit fix
npm test:all
npm run validate

# Create PR within 24 hours
git commit -m "chore: apply security updates"
```

### Week 3: Planned Updates
```bash
# For non-critical outdated packages:
# Create feature branch for each major update
# Run full test suite
# Wait for PR review
```

### Week 4: Documentation
```bash
# Update MAINTENANCE.md with findings
# Plan next month's focus areas
# Archive audit reports
```

---

## Dependency Categories & Policies

### Security Policy
- **Critical**: Fix within 24 hours
- **High**: Fix within 1 week
- **Moderate**: Fix within 2 weeks
- **Low**: Batch with other updates

Current: 0 vulnerabilities ✅

### Update Policy

| Severity | Patch | Minor | Major |
|----------|-------|-------|-------|
| **Security** | Immediate | Immediate | 1 week |
| **Performance** | 1 week | 2 weeks | 1 sprint |
| **Features** | N/A | 1 sprint | 2 sprints |
| **Bugfix** | 1 week | 1 sprint | 1 sprint |

---

## Tools & Commands Reference

### Regular Maintenance
```bash
# Daily (CI/CD)
npm test:all

# Weekly (Manual)
npm audit
npm outdated

# Monthly (Comprehensive)
npm audit --json > report.json
npm outdated --json > outdated.json
npm list --depth=0

# Quarterly (Deep dive)
npm audit --audit-level=moderate --json
npx npm-check-updates
```

### Emergency Procedures
```bash
# Critical vulnerability discovered
npm audit fix --force
npm test:all --detectOpenHandles
git add package*.json
git commit -m "SECURITY: Fix critical vulnerability"
git push origin HEAD:hotfix/security-patch

# Major version incompatibility
npm ci                    # Install exact versions from lock file
npm install --force       # Resolve conflicts
npm audit fix --force     # Override if necessary
```

### Documentation
```bash
# Generate dependency tree
npm list > dependencies-tree.txt

# Check for duplicate packages
npm dedupe --dry-run

# Audit performance
npm audit --performance

# Check size impact
npm list --size
```

---

## Known Risks & Mitigations

### Risk: jsdom Breaking Changes
**Likelihood**: Medium  
**Impact**: High (affects 100+ tests)  
**Mitigation**:
- Test in isolation first
- Run full suite with --detectOpenHandles
- Have rollback plan (revert commit)
- Document any DOM API changes needed

### Risk: ESLint Configuration Incompatibility
**Likelihood**: Low  
**Impact**: Medium (build failures)  
**Mitigation**:
- Review eslint.config.js before update
- Test on feature branch first
- Have eslint v9 as fallback
- Configuration compatibility guide in CONTRIBUTING.md

### Risk: Transitive Dependency Conflicts
**Likelihood**: Low  
**Impact**: Medium (subtle bugs)  
**Mitigation**:
- Always run `npm audit` after updates
- Use `npm ci` for reproducible installs
- Pin critical transitive dependencies if needed
- Monitor for version conflicts in npm output

---

## Decision Matrix

**When to Update**:

| Scenario | Action | Timeline |
|----------|--------|----------|
| Security vulnerability | Update immediately | 24 hours |
| Critical bugfix | Update immediately | 1 week |
| Performance improvement | Plan update | 1-2 weeks |
| Major feature | Plan update | 1 sprint |
| API deprecation warning | Monitor & plan | 1-2 sprints |
| Alpha/Beta version | Evaluate only | Per-sprint |

**When to Defer**:

| Scenario | Reason | Timeline |
|----------|--------|----------|
| Major version with breaking changes | Risk too high | After v1.0.0 |
| Pre-release versions | Instability | Only if critical |
| Experimental dependencies | Unproven | Per-sprint eval |
| Duplicate functionality | Code bloat | Never (remove) |

---

## Reporting & Communication

### Team Standup Format
```
Dependency Health Update:
- Security: 0 vulnerabilities (✅ HEALTHY)
- Outdated: 2 packages (eslint v10, jsdom v28)
- Updates planned: ESLint v10 next sprint
- Blockers: None
- Action items: None (phase 1 complete)
```

### Monthly Report Template
```markdown
## Dependency Health Report - [MONTH]
- Start: X vulnerabilities, Y outdated
- End: X' vulnerabilities, Y' outdated
- Updates applied: [list]
- Tests passed: Z/Z
- Issues discovered: [list]
- Next month focus: [list]
```

---

## Success Criteria

✅ **Phase 1 Complete** (Today)
- [x] 0 security vulnerabilities
- [x] Puppeteer updated to 24.37.2
- [x] All tests passing (2,430+)
- [x] No code changes needed

🟡 **Phase 2 Target** (Next Sprint)
- [ ] ESLint v10 compatibility verified
- [ ] Configuration updates documented
- [ ] Full test suite passing with v10
- [ ] Team trained on new linting rules

🟡 **Phase 3 Target** (End of Sprint)
- [ ] jsdom v28 compatibility verified
- [ ] Jest/jsdom compatibility confirmed
- [ ] Full test suite passing with v28
- [ ] E2E test stability verified

🟢 **Phase 4 Target** (Before v1.0.0)
- [ ] All production deps stable (v1.0.0+)
- [ ] All dev deps up-to-date
- [ ] 0 security vulnerabilities
- [ ] 100% dependency health

---

## Conclusion

The project is now in a healthy state post security-update. Follow the phased approach above for further improvements while maintaining stability through v1.0.0 release.

**Next immediate action**: Monitor for 48 hours, then schedule Phase 2 ESLint evaluation for next sprint planning.

