# Documentation Automation Recommendations

**Document Type**: Implementation Guide  
**Created**: 2026-01-11  
**Status**: 📋 Ready for Implementation  
**Priority**: 🟡 HIGH (Quality Assurance Automation)

## Executive Summary

This document provides comprehensive automation recommendations for maintaining documentation quality, consistency, and accuracy across the Guia Turístico project. Includes ready-to-use GitHub Actions, maintenance scripts, and implementation guidelines.

**Benefits**:
- ✅ Automated version consistency checking
- ✅ Self-updating test count badges
- ✅ External link validation
- ✅ JSDoc coverage tracking
- ✅ Documentation date maintenance
- ✅ Reduced manual maintenance burden

---

## Table of Contents

1. [GitHub Actions](#github-actions)
2. [Maintenance Scripts](#maintenance-scripts)
3. [Implementation Priority](#implementation-priority)
4. [Testing and Validation](#testing-and-validation)
5. [Monitoring and Alerts](#monitoring-and-alerts)

---

## GitHub Actions

### 1. Version Consistency Check

**Purpose**: Validate all version references match `package.json`

**File**: `.github/workflows/version-consistency.yml`

```yaml
name: Version Consistency Check

on:
  push:
    branches: [main, develop]
  pull_request:
    paths:
      - 'package.json'
      - 'package-lock.json'
      - 'src/**/*.js'
      - 'docs/**/*.md'
      - '.github/**/*.md'

jobs:
  check-versions:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Get package version
        id: package-version
        run: |
          VERSION=$(node -p "require('./package.json').version")
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          echo "📦 Package version: $VERSION"
      
      - name: Check version in source files
        run: |
          VERSION="${{ steps.package-version.outputs.version }}"
          echo "Checking version references in source files..."
          
          # Check src/app.js
          if ! grep -q "version $VERSION" src/app.js; then
            echo "❌ Version mismatch in src/app.js"
            echo "Expected: $VERSION"
            echo "Found: $(grep -o 'version [0-9.]*-alpha' src/app.js)"
            exit 1
          fi
          
          # Check src/index.html
          if ! grep -q "$VERSION" src/index.html; then
            echo "❌ Version mismatch in src/index.html"
            exit 1
          fi
          
          echo "✅ Source file versions match package.json"
      
      - name: Check version in documentation
        run: |
          VERSION="${{ steps.package-version.outputs.version }}"
          echo "Checking version references in documentation..."
          
          # Check critical docs
          DOCS=(
            "README.md"
            "docs/INDEX.md"
            "docs/architecture/VERSION_TIMELINE.md"
            ".github/CONTRIBUTING.md"
            ".github/copilot-instructions.md"
          )
          
          errors=0
          for doc in "${DOCS[@]}"; do
            if [ -f "$doc" ]; then
              if ! grep -q "$VERSION" "$doc"; then
                echo "⚠️ Version $VERSION not found in $doc"
                errors=$((errors + 1))
              else
                echo "✅ $doc contains version $VERSION"
              fi
            fi
          done
          
          if [ $errors -gt 0 ]; then
            echo "❌ Found $errors documentation files without current version"
            echo "💡 Run: npm run update-version to fix"
            exit 1
          fi
          
          echo "✅ All documentation references current version"
      
      - name: Check for version placeholders
        run: |
          echo "Checking for version placeholders..."
          
          # Find any X.Y.Z or YYYY-MM-DD placeholders
          if grep -r "version X\.Y\.Z\|0\.0\.0\|YYYY-MM-DD" docs/ .github/ --exclude-dir=node_modules; then
            echo "❌ Found version placeholders that need updating"
            exit 1
          fi
          
          echo "✅ No version placeholders found"
      
      - name: Report results
        if: success()
        run: |
          echo "✅ Version consistency check passed"
          echo "Current version: ${{ steps.package-version.outputs.version }}"
          echo "All references are consistent"
```

**Triggers**:
- Push to main/develop branches
- Pull requests modifying version-related files

**What it checks**:
1. Version in `package.json` matches `src/app.js`
2. Version in `src/index.html` matches
3. Critical documentation contains current version
4. No version placeholders (X.Y.Z, 0.0.0)

**On failure**: Exits with error, blocks PR merge

---

### 2. Test Count Verification and Badge Update

**Purpose**: Automatically update test count badges after test runs

**File**: `.github/workflows/test-badges.yml`

```yaml
name: Update Test Badges

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  update-badges:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with JSON output
        run: |
          npm test -- --json --outputFile=test-results.json || true
      
      - name: Parse test results
        id: test-stats
        run: |
          if [ -f test-results.json ]; then
            # Parse JSON results
            PASSING=$(node -p "
              const results = require('./test-results.json');
              results.numPassedTests || 0
            ")
            TOTAL=$(node -p "
              const results = require('./test-results.json');
              results.numTotalTests || 0
            ")
            SKIPPED=$(node -p "
              const results = require('./test-results.json');
              (results.numTotalTests || 0) - (results.numPassedTests || 0) - (results.numFailedTests || 0)
            ")
            
            echo "passing=$PASSING" >> $GITHUB_OUTPUT
            echo "total=$TOTAL" >> $GITHUB_OUTPUT
            echo "skipped=$SKIPPED" >> $GITHUB_OUTPUT
            
            echo "📊 Test Results:"
            echo "  Passing: $PASSING"
            echo "  Total: $TOTAL"
            echo "  Skipped: $SKIPPED"
          else
            echo "❌ No test results file found"
            exit 1
          fi
      
      - name: Update README.md badges
        run: |
          PASSING="${{ steps.test-stats.outputs.passing }}"
          TOTAL="${{ steps.test-stats.outputs.total }}"
          SKIPPED="${{ steps.test-stats.outputs.skipped }}"
          
          # Update test count in README.md
          sed -i "s/Tests: [0-9,]* passing/Tests: ${PASSING} passing/g" README.md
          sed -i "s/[0-9,]* total//${TOTAL} total/g" README.md
          sed -i "s/[0-9,]* skipped/${SKIPPED} skipped/g" README.md
          
          echo "✅ Updated README.md with test counts"
      
      - name: Update documentation
        run: |
          PASSING="${{ steps.test-stats.outputs.passing }}"
          TOTAL="${{ steps.test-stats.outputs.total }}"
          
          # Update .github/copilot-instructions.md
          sed -i "s/1,516 passing//${PASSING} passing/g" .github/copilot-instructions.md
          sed -i "s/1,653 total/${TOTAL} total/g" .github/copilot-instructions.md
          
          # Update docs/INDEX.md
          sed -i "s/1516 passing/${PASSING} passing/g" docs/INDEX.md
          sed -i "s/1653 total/${TOTAL} total/g" docs/INDEX.md
          
          echo "✅ Updated documentation with test counts"
      
      - name: Commit changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          
          if git diff --quiet; then
            echo "No changes to commit"
          else
            git add README.md docs/INDEX.md .github/copilot-instructions.md
            git commit -m "chore: update test count badges [skip ci]"
            git push
            echo "✅ Committed test count updates"
          fi
      
      - name: Create badge URLs
        run: |
          PASSING="${{ steps.test-stats.outputs.passing }}"
          TOTAL="${{ steps.test-stats.outputs.total }}"
          PERCENTAGE=$((PASSING * 100 / TOTAL))
          
          echo "📊 Badge URLs:"
          echo "Tests: https://img.shields.io/badge/tests-${PASSING}%20passing-brightgreen"
          echo "Total: https://img.shields.io/badge/tests-${TOTAL}%20total-blue"
          echo "Coverage: https://img.shields.io/badge/coverage-${PERCENTAGE}%25-green"
```

**Triggers**:
- Push to main branch
- Manual workflow dispatch

**What it does**:
1. Runs full test suite with JSON output
2. Parses test results (passing, total, skipped)
3. Updates test counts in README.md
4. Updates test counts in documentation
5. Commits changes automatically
6. Generates badge URLs

**Benefits**:
- ✅ Always accurate test counts
- ✅ No manual updates needed
- ✅ Runs after every main branch push

---

### 3. External Link Checker

**Purpose**: Validate external API and documentation links

**File**: `.github/workflows/link-checker.yml`

```yaml
name: Check External Links

on:
  schedule:
    # Run weekly on Mondays at 9am UTC
    - cron: '0 9 * * 1'
  workflow_dispatch:
  pull_request:
    paths:
      - '**.md'

jobs:
  check-links:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Check links with Lychee
        uses: lycheeverse/lychee-action@v1
        with:
          args: |
            --verbose
            --no-progress
            --exclude-all-private
            --exclude '^https://github.com/[^/]+/[^/]+/(issues|pull)/[0-9]+$'
            --exclude '^https://img.shields.io'
            --exclude 'localhost'
            --exclude 'example.com'
            --max-retries 3
            --timeout 20
            --accept 200,403,999
            '**/*.md'
            '**/*.js'
          
          # Fail PR if broken links found
          fail: ${{ github.event_name == 'pull_request' }}
      
      - name: Check critical API endpoints
        run: |
          echo "Checking critical API endpoints..."
          
          # OpenStreetMap Nominatim
          status=$(curl -s -o /dev/null -w "%{http_code}" "https://nominatim.openstreetmap.org/reverse?format=json&lat=0&lon=0" || echo "000")
          if [ "$status" = "200" ] || [ "$status" = "400" ]; then
            echo "✅ OpenStreetMap Nominatim: Available"
          else
            echo "❌ OpenStreetMap Nominatim: HTTP $status"
          fi
          
          # IBGE API
          status=$(curl -s -o /dev/null -w "%{http_code}" "https://servicodados.ibge.gov.br/api/v1/localidades/estados" || echo "000")
          if [ "$status" = "200" ]; then
            echo "✅ IBGE API: Available"
          else
            echo "❌ IBGE API: HTTP $status"
          fi
          
          # MDN (documentation reference)
          status=$(curl -s -o /dev/null -w "%{http_code}" "https://developer.mozilla.org/" || echo "000")
          if [ "$status" = "200" ]; then
            echo "✅ MDN: Available"
          else
            echo "⚠️ MDN: HTTP $status"
          fi
      
      - name: Create issue for broken links
        if: failure() && github.event_name == 'schedule'
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🔗 Broken links detected in documentation',
              body: `Automated link checker found broken links.
              
              **When**: ${new Date().toISOString()}
              **Workflow**: [View Run](${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId})
              
              Please review the workflow logs and update broken links.
              
              **Priority Links to Check**:
              - OpenStreetMap Nominatim API
              - IBGE API endpoints
              - MDN documentation references
              
              /cc @maintainers`,
              labels: ['documentation', 'automated', 'maintenance']
            })
```

**Triggers**:
- Weekly on Mondays at 9am UTC
- Manual workflow dispatch
- Pull requests modifying .md files

**What it checks**:
1. All external links in documentation
2. Critical API endpoints (OpenStreetMap, IBGE)
3. Documentation references (MDN, Jest, etc.)

**On failure**:
- PRs: Blocks merge
- Scheduled: Creates GitHub issue

---

### 4. JSDoc Coverage Report

**Purpose**: Generate and publish JSDoc coverage metrics

**File**: `.github/workflows/jsdoc-coverage.yml`

```yaml
name: JSDoc Coverage Report

on:
  push:
    branches: [main]
    paths:
      - 'src/**/*.js'
  pull_request:
    paths:
      - 'src/**/*.js'
  workflow_dispatch:

jobs:
  jsdoc-coverage:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate JSDoc
        run: |
          mkdir -p docs/api
          npx jsdoc -c jsdoc.json -r src/ -d docs/api || true
      
      - name: Calculate JSDoc coverage
        id: coverage
        run: |
          echo "Calculating JSDoc coverage..."
          
          # Count total functions/methods
          TOTAL=$(grep -r "function\|class.*{" src/ --include="*.js" | wc -l)
          
          # Count documented functions (with /** */)
          DOCUMENTED=$(grep -B1 "function\|class" src/ --include="*.js" | grep -c "/\*\*" || echo 0)
          
          # Calculate percentage
          if [ $TOTAL -gt 0 ]; then
            PERCENTAGE=$((DOCUMENTED * 100 / TOTAL))
          else
            PERCENTAGE=0
          fi
          
          echo "total=$TOTAL" >> $GITHUB_OUTPUT
          echo "documented=$DOCUMENTED" >> $GITHUB_OUTPUT
          echo "percentage=$PERCENTAGE" >> $GITHUB_OUTPUT
          
          echo "📊 JSDoc Coverage:"
          echo "  Total functions: $TOTAL"
          echo "  Documented: $DOCUMENTED"
          echo "  Coverage: ${PERCENTAGE}%"
      
      - name: Update coverage badge
        run: |
          PERCENTAGE="${{ steps.coverage.outputs.percentage }}"
          
          # Determine badge color
          if [ $PERCENTAGE -ge 90 ]; then
            COLOR="brightgreen"
          elif [ $PERCENTAGE -ge 70 ]; then
            COLOR="green"
          elif [ $PERCENTAGE -ge 50 ]; then
            COLOR="yellow"
          else
            COLOR="red"
          fi
          
          echo "Badge URL: https://img.shields.io/badge/JSDoc-${PERCENTAGE}%25-${COLOR}"
      
      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const coverage = {
              total: ${{ steps.coverage.outputs.total }},
              documented: ${{ steps.coverage.outputs.documented }},
              percentage: ${{ steps.coverage.outputs.percentage }}
            };
            
            const emoji = coverage.percentage >= 90 ? '🎉' : 
                         coverage.percentage >= 70 ? '✅' :
                         coverage.percentage >= 50 ? '⚠️' : '❌';
            
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `${emoji} **JSDoc Coverage Report**
              
              - **Total Functions**: ${coverage.total}
              - **Documented**: ${coverage.documented}
              - **Coverage**: ${coverage.percentage}%
              
              ${coverage.percentage < 70 ? '⚠️ Coverage below 70% threshold' : '✅ Coverage meets minimum threshold'}`
            })
      
      - name: Publish coverage report
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: |
          # Update JSDOC_COVERAGE_REPORT.md
          PERCENTAGE="${{ steps.coverage.outputs.percentage }}"
          TOTAL="${{ steps.coverage.outputs.total }}"
          DOCUMENTED="${{ steps.coverage.outputs.documented }}"
          DATE=$(date -I)
          
          if [ -f docs/JSDOC_COVERAGE_REPORT.md ]; then
            # Update existing report
            sed -i "s/Last Updated: .*/Last Updated: $DATE/" docs/JSDOC_COVERAGE_REPORT.md
            sed -i "s/Overall Coverage: .*%/Overall Coverage: ${PERCENTAGE}%/" docs/JSDOC_COVERAGE_REPORT.md
          fi
          
          echo "✅ Updated JSDoc coverage report"
```

**Triggers**:
- Push to main branch (src/**/*.js changes)
- Pull requests (src/**/*.js changes)
- Manual workflow dispatch

**What it does**:
1. Generates JSDoc HTML documentation
2. Calculates coverage percentage
3. Updates coverage badge
4. Comments on PRs with coverage stats
5. Updates JSDOC_COVERAGE_REPORT.md on main

**Benefits**:
- ✅ Tracks documentation quality
- ✅ Visible coverage metrics
- ✅ PR feedback on coverage changes

---

## Maintenance Scripts

### 1. Version Consistency Checker

**File**: `scripts/check-version-consistency.sh`

```bash
#!/bin/bash
# Check version consistency across all files

set -e

echo "🔍 Checking version consistency..."
echo

# Get version from package.json
PACKAGE_VERSION=$(node -p "require('./package.json').version")
echo "📦 Package version: $PACKAGE_VERSION"
echo

# Files to check
declare -A FILES=(
    ["src/app.js"]="version $PACKAGE_VERSION"
    ["src/index.html"]="$PACKAGE_VERSION"
    ["README.md"]="$PACKAGE_VERSION"
    ["docs/INDEX.md"]="$PACKAGE_VERSION"
    [".github/CONTRIBUTING.md"]="$PACKAGE_VERSION"
    [".github/copilot-instructions.md"]="$PACKAGE_VERSION"
)

errors=0

for file in "${!FILES[@]}"; do
    pattern="${FILES[$file]}"
    
    if [ -f "$file" ]; then
        if grep -q "$pattern" "$file"; then
            echo "✅ $file"
        else
            echo "❌ $file (missing: $pattern)"
            errors=$((errors + 1))
        fi
    else
        echo "⚠️  $file (file not found)"
    fi
done

echo
echo "📊 Results:"
echo "  Checked: ${#FILES[@]} files"
echo "  Errors: $errors"

if [ $errors -eq 0 ]; then
    echo "✅ All versions consistent"
    exit 0
else
    echo "❌ Version inconsistencies found"
    echo "💡 Run: npm run update-version"
    exit 1
fi
```

**Usage**:
```bash
./scripts/check-version-consistency.sh
```

**Exit codes**:
- 0: All versions consistent
- 1: Inconsistencies found

---

### 2. Test Count Updater

**File**: `scripts/update-test-counts.sh`

```bash
#!/bin/bash
# Update test counts in documentation after running tests

set -e

echo "📊 Updating test counts..."
echo

# Run tests with JSON output
echo "Running tests..."
npm test -- --json --outputFile=test-results.json --silent || true

if [ ! -f test-results.json ]; then
    echo "❌ No test results found"
    exit 1
fi

# Parse results
PASSING=$(node -p "require('./test-results.json').numPassedTests || 0")
TOTAL=$(node -p "require('./test-results.json').numTotalTests || 0")
FAILED=$(node -p "require('./test-results.json').numFailedTests || 0")
SKIPPED=$((TOTAL - PASSING - FAILED))

echo "Test Results:"
echo "  Passing: $PASSING"
echo "  Failed: $FAILED"
echo "  Skipped: $SKIPPED"
echo "  Total: $TOTAL"
echo

# Update files
echo "Updating documentation..."

# README.md
sed -i.bak "s/[0-9,]* passing/$PASSING passing/g" README.md
sed -i "s/[0-9,]* skipped/$SKIPPED skipped/g" README.md
sed -i "s/[0-9,]* total/$TOTAL total/g" README.md

# .github/copilot-instructions.md
sed -i.bak "s/[0-9,]* passing/$PASSING passing/g" .github/copilot-instructions.md
sed -i "s/[0-9,]* total/$TOTAL total/g" .github/copilot-instructions.md

# docs/INDEX.md
sed -i.bak "s/[0-9,]* passing/$PASSING passing/g" docs/INDEX.md
sed -i "s/[0-9,]* total/$TOTAL total/g" docs/INDEX.md

# Clean up backups
rm -f README.md.bak .github/copilot-instructions.md.bak docs/INDEX.md.bak

echo "✅ Test counts updated"
echo
echo "Changed files:"
git diff --name-only README.md .github/copilot-instructions.md docs/INDEX.md

# Clean up test results
rm -f test-results.json

exit 0
```

**Usage**:
```bash
./scripts/update-test-counts.sh
```

**What it does**:
1. Runs full test suite
2. Parses JSON results
3. Updates counts in README.md, copilot-instructions.md, INDEX.md
4. Shows changed files

---

### 3. Documentation Date Updater

**File**: `scripts/update-doc-dates.sh`

```bash
#!/bin/bash
# Update "Last Updated" dates in modified documentation files

set -e

echo "📅 Updating documentation dates..."
echo

# Get today's date
TODAY=$(date -I)
echo "Today's date: $TODAY"
echo

# Get list of modified .md files
MODIFIED=$(git diff --name-only --diff-filter=M | grep '\.md$' || true)

if [ -z "$MODIFIED" ]; then
    echo "No modified markdown files found"
    exit 0
fi

echo "Modified files:"
echo "$MODIFIED"
echo

updated=0

for file in $MODIFIED; do
    # Check if file has "Last Updated" field
    if grep -q "Last Updated" "$file"; then
        # Update existing date
        sed -i.bak "s/\*\*Last Updated\*\*: [0-9-]*/\*\*Last Updated\*\*: $TODAY/" "$file"
        echo "✅ Updated: $file"
        updated=$((updated + 1))
        rm -f "$file.bak"
    else
        # Add footer with date
        echo "" >> "$file"
        echo "---" >> "$file"
        echo "" >> "$file"
        echo "**Last Updated**: $TODAY  " >> "$file"
        echo "**Status**: ✅ Active" >> "$file"
        echo "✅ Added date to: $file"
        updated=$((updated + 1))
    fi
done

echo
echo "📊 Results:"
echo "  Modified files: $(echo "$MODIFIED" | wc -l)"
echo "  Updated dates: $updated"

if [ $updated -gt 0 ]; then
    echo "✅ Documentation dates updated"
    echo "💡 Review changes and commit"
else
    echo "No dates to update"
fi

exit 0
```

**Usage**:
```bash
# Update dates in all modified files
./scripts/update-doc-dates.sh

# Review changes
git diff

# Commit if satisfied
git add .
git commit -m "docs: update Last Updated dates"
```

---

## Implementation Priority

### Phase 1: Critical Automation (Week 1)

**Priority**: 🔴 HIGH

1. **Version Consistency Check** (30 minutes)
   - Prevents version drift
   - Blocks PRs with inconsistencies
   - Highest ROI

2. **Test Count Updater** (45 minutes)
   - Keeps counts accurate
   - Reduces manual work
   - High visibility

**Deliverables**:
- `.github/workflows/version-consistency.yml`
- `.github/workflows/test-badges.yml`
- `scripts/check-version-consistency.sh`
- `scripts/update-test-counts.sh`

---

### Phase 2: Quality Automation (Week 2)

**Priority**: 🟡 MEDIUM

3. **External Link Checker** (45 minutes)
   - Prevents broken links
   - Monitors critical APIs
   - Good maintenance tool

4. **Documentation Date Updater** (30 minutes)
   - Automates date maintenance
   - Supports Issue #13
   - Low friction

**Deliverables**:
- `.github/workflows/link-checker.yml`
- `scripts/update-doc-dates.sh`

---

### Phase 3: Advanced Features (Week 3)

**Priority**: 🟢 LOW

5. **JSDoc Coverage Report** (60 minutes)
   - Tracks documentation quality
   - PR feedback mechanism
   - Nice to have

**Deliverables**:
- `.github/workflows/jsdoc-coverage.yml`
- Enhanced JSDOC_COVERAGE_REPORT.md

---

## Testing and Validation

### Before Implementation

**Checklist**:
- [ ] Review GitHub Actions permissions
- [ ] Test scripts locally
- [ ] Validate sed commands on backup files
- [ ] Check git hooks compatibility
- [ ] Review cron schedule timing

### After Implementation

**Validation Steps**:

1. **Version Consistency Check**:
   ```bash
   # Trigger manually
   gh workflow run version-consistency.yml
   
   # Check status
   gh run list --workflow=version-consistency.yml
   ```

2. **Test Badge Updater**:
   ```bash
   # Run locally
   ./scripts/update-test-counts.sh
   
   # Verify changes
   git diff README.md
   ```

3. **Link Checker**:
   ```bash
   # Trigger manually
   gh workflow run link-checker.yml
   
   # Monitor first run
   gh run watch
   ```

4. **JSDoc Coverage**:
   ```bash
   # Trigger manually
   gh workflow run jsdoc-coverage.yml
   
   # Check generated docs
   open docs/api/index.html
   ```

---

## Monitoring and Alerts

### GitHub Actions Dashboard

**Monitor**:
- Workflow run success rate
- Execution time trends
- Failure patterns

**Access**: Repository → Actions tab

### Notification Setup

**Configure**:
1. Watch repository for Actions failures
2. Enable email notifications
3. Add Slack integration (optional)

**Example Slack Webhook** (optional):
```yaml
- name: Notify Slack on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "❌ Workflow failed: ${{ github.workflow }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Workflow*: ${{ github.workflow }}\n*Status*: Failed\n*Run*: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            }
          }
        ]
      }
```

---

## Maintenance Schedule

### Daily
- ✅ Automated (no action needed)
- Monitor workflow failures

### Weekly
- Review link checker results
- Check JSDoc coverage trends
- Monitor test count stability

### Monthly
- Audit automation effectiveness
- Update workflow configurations
- Review and close automated issues

### Quarterly
- Evaluate ROI of each automation
- Consider new automation opportunities
- Update documentation

---

## Cost Analysis

### Development Time

| Task | Effort | Savings/Month | ROI |
|------|--------|---------------|-----|
| Version Check | 30min | 2 hours | 4x |
| Test Badges | 45min | 3 hours | 4x |
| Link Checker | 45min | 2 hours | 2.7x |
| Date Updater | 30min | 1.5 hours | 3x |
| JSDoc Coverage | 60min | 1 hour | 1x |
| **TOTAL** | **3.5h** | **9.5h/month** | **2.7x** |

### GitHub Actions Minutes

**Free tier**: 2,000 minutes/month

**Estimated usage**:
- Version Check: ~2 min/run × 50 runs/month = 100 min
- Test Badges: ~5 min/run × 20 runs/month = 100 min
- Link Checker: ~3 min/run × 5 runs/month = 15 min
- JSDoc Coverage: ~4 min/run × 20 runs/month = 80 min
- **Total**: ~295 minutes/month (15% of free tier)

**Conclusion**: Well within free tier limits

---

## Troubleshooting

### Common Issues

#### 1. Version Check Fails on PR

**Symptom**: PR blocked by version consistency check

**Solution**:
```bash
# Update version everywhere
npm run update-version

# Or manually
./scripts/check-version-consistency.sh
```

#### 2. Test Badge Update Conflicts

**Symptom**: Git conflicts when pushing

**Solution**:
```bash
# Pull latest
git pull --rebase

# Re-run update
./scripts/update-test-counts.sh

# Commit
git commit --amend
```

#### 3. Link Checker False Positives

**Symptom**: Valid links reported as broken

**Solution**:
- Add to exclusion list in workflow
- Check if API requires authentication
- Increase timeout/retries

#### 4. JSDoc Coverage Incorrect

**Symptom**: Coverage percentage doesn't match expectations

**Solution**:
- Review JSDoc comment format
- Check for template literal functions
- Verify jsdoc.json configuration

---

## npm Scripts Integration

**Add to `package.json`**:

```json
{
  "scripts": {
    "check-version": "./scripts/check-version-consistency.sh",
    "update-test-counts": "./scripts/update-test-counts.sh",
    "update-dates": "./scripts/update-doc-dates.sh",
    "update-version": "npm run check-version && npm run update-test-counts && npm run update-dates",
    "precommit": "npm run check-version",
    "posttest": "npm run update-test-counts"
  }
}
```

**Usage**:
```bash
# Check version consistency
npm run check-version

# Update test counts after test run
npm run update-test-counts

# Update documentation dates
npm run update-dates

# Update everything
npm run update-version
```

---

## Success Criteria

### Short-Term (1 Week)
- [ ] Version consistency check implemented and passing
- [ ] Test badge updater running automatically
- [ ] Scripts executable and documented

### Medium-Term (1 Month)
- [ ] Link checker catching broken links
- [ ] Documentation dates consistently updated
- [ ] Zero manual version updates needed

### Long-Term (3 Months)
- [ ] JSDoc coverage tracked and improving
- [ ] All automation running smoothly
- [ ] Team confident in automation reliability

---

## Related Documentation

- **[CONTRIBUTING.md](../.github/CONTRIBUTING.md)** - Contribution workflow
- **[Issue #13](https://github.com/mpbarbosa/guia.js/issues/264)** - Documentation date auditing
- **[VERSION_TIMELINE.md](./architecture/VERSION_TIMELINE.md)** - Version history

---

**Created**: 2026-01-11  
**Status**: 📋 Ready for Implementation  
**Next Action**: Begin Phase 1 (Version Check + Test Badges)
