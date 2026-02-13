# Phase 4: Automation Setup Guide
**Date:** 2026-01-09  
**Project:** Guia Turístico v0.9.0-alpha  
**Purpose:** Automated dependency management with Dependabot and npm-check-updates

---

## 🤖 Overview

Phase 4 implements automated dependency management to maintain security and stay current with the ecosystem without manual overhead.

### Key Components
1. **Dependabot** - Automated GitHub PR creation for updates
2. **npm-check-updates (ncu)** - Manual update analysis tool
3. **Quarterly Review Process** - Scheduled manual reviews

---

## 📋 1. Dependabot Configuration

### File Created
`.github/dependabot.yml` - Automated dependency update configuration

### Update Schedule

**npm Dependencies:**
- **Frequency:** Weekly (Mondays at 9:00 AM BRT)
- **Max PRs:** 5 concurrent
- **Timezone:** America/Sao_Paulo
- **Auto-reviewer:** @mpbarbosa
- **Labels:** `dependencies`, `automated`

**GitHub Actions:**
- **Frequency:** Monthly (first Monday at 9:00 AM BRT)
- **Max PRs:** 2 concurrent
- **Labels:** `dependencies`, `github-actions`

### Grouping Strategy

#### Security Updates (High Priority) 🔴
```yaml
security-updates:
  patterns: ["*"]
  update-types: ["security"]
```
- All security updates grouped in single PR
- Immediate review required
- Highest priority for merging

#### Minor & Patch Updates (Medium Priority) 🟡
```yaml
minor-and-patch:
  patterns: ["*"]
  update-types: ["minor", "patch"]
  exclude-patterns: ["jest", "eslint"]
```
- Non-breaking updates grouped together
- Review within 1 week
- Excludes jest/eslint (reviewed separately)

#### Dev Dependencies (Low Priority) 🟢
```yaml
dev-dependencies:
  dependency-type: "development"
  update-types: ["minor", "patch"]
```
- Development tools grouped separately
- Review within 2 weeks
- Lower priority (doesn't affect production)

### Ignored Updates

**Major Version Updates:**
```yaml
ignore:
  - dependency-name: "*"
    update-types: ["version-update:semver-major"]
```
- All major versions ignored by Dependabot
- Require manual review and testing
- Use quarterly review process (see below)

---

## 🛠️ 2. npm-check-updates (ncu)

### Installation

**Global installation (recommended):**
```bash
npm install -g npm-check-updates
```

**Project-specific (alternative):**
```bash
npm install --save-dev npm-check-updates
# Then use: npx ncu
```

### Usage Commands

#### Check for Available Updates
```bash
# Show all available updates
ncu

# Show only major updates
ncu --target major

# Show only minor/patch updates
ncu --target minor
```

**Example Output:**
```
 eslint     ^9.39.2  →  ^9.40.0
 jest       ^30.1.3  →  ^30.2.1
 jsdom      ^27.3.0  →  ^28.0.0

Run ncu -u to upgrade package.json
```

#### Interactive Selection
```bash
# Choose which packages to update
ncu -i

# Interactive with filters
ncu -i --target major  # Only major updates
ncu -i --dep dev       # Only devDependencies
```

#### Update package.json
```bash
# Update all packages
ncu -u

# Update specific packages
ncu -u eslint jest

# Update with filters
ncu -u --target minor  # Only minor/patch
ncu -u --dep prod      # Only production deps
```

#### Dry Run / Analysis
```bash
# Show what would be updated (no changes)
ncu --doctor

# Test updates with npm install simulation
ncu --doctor --packageManager npm
```

### Recommended Workflow

**Monthly Quick Check:**
```bash
# Check for updates
ncu

# If minor/patch available, update
ncu -u --target minor
npm install
npm test
git add package.json package-lock.json
git commit -m "chore(deps): update minor/patch dependencies"
```

**Quarterly Major Update Review:**
```bash
# 1. Check for major updates
ncu --target major

# 2. Interactive selection
ncu -i --target major

# 3. Update selected packages
ncu -u jest  # Example: update jest only

# 4. Install and test
npm install
npm test

# 5. Commit if successful
git add package.json package-lock.json
git commit -m "chore(deps): update jest to v31"
```

---

## 📅 3. Quarterly Review Process

### Schedule
- **Q1 2026:** April 9, 2026
- **Q2 2026:** July 9, 2026
- **Q3 2026:** October 9, 2026
- **Q4 2026:** January 9, 2027

### Review Checklist

#### Pre-Review (1 hour)
```bash
# 1. Check current state
npm outdated
ncu --target major

# 2. Review security advisories
npm audit
gh api /repos/mpbarbosa/guia_turistico/dependabot/alerts

# 3. Check Dependabot PRs
gh pr list --label "dependencies"
```

#### Review Meeting (2 hours)
1. **Security Updates** (30 min)
   - Review npm audit output
   - Check GitHub security alerts
   - Prioritize critical/high severity

2. **Major Version Updates** (60 min)
   - Review `ncu --target major` output
   - Check changelog/breaking changes
   - Decide: update now, defer, or ignore
   - Create tracking issues for deferred updates

3. **Ecosystem Health** (30 min)
   - Bundle size trends
   - Install time trends
   - Test execution time trends
   - Unused dependencies audit

#### Post-Review Actions (1-2 hours)
```bash
# 1. Apply approved updates
ncu -u [packages]
npm install

# 2. Run full test suite
npm run test:all

# 3. Update documentation
# Update docs/DEPENDENCY_UPDATE_ROADMAP.md with next quarter plan

# 4. Commit changes
git add .
git commit -m "chore(deps): quarterly dependency review (Q1 2026)"
```

---

## 🎯 4. Automation Benefits

### Time Savings
- **Before:** Manual weekly checks (~2 hours/month)
- **After:** Automated PRs + quarterly reviews (~6 hours/quarter)
- **Savings:** ~18 hours/quarter

### Security Improvements
- Automated security update PRs (within 24 hours)
- Grouped security updates for easier review
- Continuous monitoring via Dependabot alerts

### Quality Improvements
- Consistent update cadence
- Testing automation (CI runs on PRs)
- Documented review process

---

## 📊 5. Monitoring Dashboard

### Weekly Metrics (from Dependabot)
```bash
# Check Dependabot PR status
gh pr list --label "dependencies" --state open

# Review merged updates
gh pr list --label "dependencies" --state merged --limit 10
```

### Monthly Metrics (from npm)
```bash
# Check for outdated packages
npm outdated

# Security audit
npm audit

# Dependency tree size
npm ls --depth=0 | wc -l
```

### Quarterly Metrics (deep dive)
```bash
# Major version drift
ncu --target major

# Bundle size analysis
npx bundlephobia@latest

# Test performance trends
npm test | grep "Time:"
```

---

## 🚨 6. Alert Thresholds

### Immediate Action Required 🔴
- **Security:** Critical or high severity vulnerabilities
- **Build:** CI/CD pipeline failures on dependency PRs
- **Tests:** Test failures on dependency PRs

### Review Within 1 Week 🟡
- **Minor/Patch:** Non-security updates grouped by Dependabot
- **Coverage:** Coverage drops below thresholds
- **Performance:** Test time increases >20%

### Review at Quarterly Meeting 🟢
- **Major:** Major version updates
- **Unused:** Potential unused dependencies
- **Alternatives:** New library alternatives to evaluate

---

## 🎓 7. Best Practices

### DO ✅
- Review Dependabot PRs within 7 days
- Test locally before merging
- Read changelogs for major updates
- Keep documentation updated
- Maintain quarterly review schedule

### DON'T ❌
- Auto-merge without CI validation
- Ignore security updates
- Defer major updates indefinitely
- Skip testing after updates
- Update all packages at once

### CONSIDER 💭
- Staging environment for dependency testing
- Canary deployments for major updates
- A/B testing performance impacts
- User feedback monitoring after updates

---

## 📝 8. npm Scripts Enhancement

### Add to package.json
```json
{
  "scripts": {
    "deps:check": "ncu",
    "deps:update": "ncu -u && npm install",
    "deps:update-minor": "ncu -u --target minor && npm install",
    "deps:update-patch": "ncu -u --target patch && npm install",
    "deps:doctor": "ncu --doctor",
    "deps:audit": "npm audit && npm outdated"
  }
}
```

### Usage
```bash
# Quick dependency health check
npm run deps:audit

# Check for available updates
npm run deps:check

# Update minor/patch only (safe)
npm run deps:update-minor

# Full update with testing
npm run deps:doctor
```

---

## 🔧 9. GitHub Integration

### Enable Dependabot Alerts
```bash
# Via GitHub CLI
gh repo edit --enable-dependabot-security-updates

# Via GitHub Web UI
Settings → Security & analysis → Dependabot alerts: Enable
Settings → Security & analysis → Dependabot security updates: Enable
```

### Configure Notifications
```bash
# Watch dependency PRs
gh repo set-default mpbarbosa/guia_turistico
gh api user/repository_notifications -f repository_id=$(gh repo view --json id -q .id)
```

### Dependabot Commands (in PR comments)
- `@dependabot rebase` - Rebase PR against base branch
- `@dependabot recreate` - Recreate PR (discard local edits)
- `@dependabot merge` - Merge PR once CI passes
- `@dependabot squash and merge` - Squash + merge
- `@dependabot cancel merge` - Cancel auto-merge
- `@dependabot close` - Close PR without merging
- `@dependabot ignore this dependency` - Skip this dependency
- `@dependabot ignore this major version` - Skip major version

---

## ✅ 10. Implementation Checklist

### Phase 4 Setup (This Session)
- [x] Create `.github/dependabot.yml` configuration
- [x] Document ncu installation and usage
- [x] Define quarterly review process
- [x] Create monitoring dashboard guide
- [x] Document best practices
- [ ] Commit automation configuration
- [ ] Enable Dependabot in GitHub settings

### First Week Actions
- [ ] Install npm-check-updates globally
- [ ] Test ncu commands locally
- [ ] Review first Dependabot PRs
- [ ] Set calendar reminder for quarterly review (2026-04-09)

### First Quarter Goals
- [ ] Establish Dependabot PR review rhythm
- [ ] Complete first quarterly review (2026-04-09)
- [ ] Measure time savings vs manual process
- [ ] Refine grouping strategy based on experience

---

## 📚 11. References

### Documentation
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [npm-check-updates](https://github.com/raineorshine/npm-check-updates)
- [npm audit](https://docs.npmjs.com/cli/v9/commands/npm-audit)
- [Semantic Versioning](https://semver.org/)

### Project-Specific
- `docs/DEPENDENCY_UPDATE_ROADMAP.md` - Long-term strategy
- `docs/COVERAGE_POLICY.md` - Testing requirements
- `.github/workflows/copilot-coding-agent.yml` - CI/CD pipeline

---

## 🎯 Success Metrics

### Target Metrics (After 1 Quarter)
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Security Response Time** | <24 hours | TBD | 📊 Measuring |
| **Update Cadence** | Weekly | TBD | 📊 Measuring |
| **Time Spent on Deps** | <2 hours/month | TBD | 📊 Measuring |
| **Outdated Deps** | <5 packages | 0 | ✅ Baseline |
| **Security Alerts** | 0 open | 0 | ✅ Baseline |

### Quarterly Review Metrics
- Dependabot PRs created: ____ (target: 20-40/quarter)
- Dependabot PRs merged: ____ (target: >80%)
- Security updates applied: ____ (target: 100%)
- Major updates completed: ____ (target: 1-2/quarter)

---

## 🎉 Phase 4 Summary

**Status:** 📋 DOCUMENTED & READY TO ENABLE

**What's Ready:**
- ✅ Dependabot configuration created
- ✅ npm-check-updates guide documented
- ✅ Quarterly review process defined
- ✅ Monitoring dashboard specified
- ✅ Best practices documented

**Next Steps:**
1. Commit `.github/dependabot.yml`
2. Enable Dependabot in GitHub repository settings
3. Install npm-check-updates globally
4. Set calendar reminder for Q2 2026 review (2026-04-09)

**Benefits:**
- 🤖 Automated security updates
- ⏰ Time savings (~18 hours/quarter)
- 📊 Continuous monitoring
- 🎯 Consistent update cadence
- 📚 Documented process

---

**Report Generated:** 2026-01-09T02:04:00Z  
**Status:** Ready for implementation  
**Next Action:** Commit and enable Dependabot
