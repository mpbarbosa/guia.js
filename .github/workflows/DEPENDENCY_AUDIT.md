# Dependency Audit Workflow

## Overview

The **Weekly Dependency Audit** workflow automatically monitors project dependencies for security vulnerabilities and outdated packages.

## Schedule

- **Automatic**: Every Monday at 9:00 AM UTC
- **Manual**: Can be triggered via GitHub Actions UI (workflow_dispatch)

## Features

### 1. Security Audit

- Runs `npm audit --audit-level=moderate`
- Detects vulnerabilities at moderate severity or higher
- Generates detailed audit report

### 2. Outdated Package Detection

- Runs `npm outdated` to identify packages with available updates
- Includes current, wanted, and latest versions
- Non-blocking (informational only)

### 3. Automated Issue Creation

- Creates GitHub issue if vulnerabilities are detected
- Labels: `security`, `dependencies`, `automated`
- Includes full audit report and recommended actions
- Attaches report artifact for 90 days

### 4. Follow-up Comments

- Adds comments to existing open security issues
- Tracks recurring vulnerabilities
- Links to workflow run for details

## Workflow Triggers

### Scheduled Run (Weekly)

```yaml
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
```

### Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **Weekly Dependency Audit** workflow
3. Click **Run workflow** button
4. Select branch and confirm

## Artifacts

The workflow uploads an audit report artifact:

- **Name**: `dependency-audit-report-{run_number}`
- **Retention**: 90 days
- **Contents**: Security audit + outdated packages report

## Permissions

```yaml
permissions:
  contents: read   # Read repository code
  issues: write    # Create/update issues
```

## Local Testing

### Run Security Audit

```bash
npm audit --audit-level=moderate
```

### Check Outdated Packages

```bash
npm outdated
```

### Fix Vulnerabilities Automatically

```bash
# Safe updates (semver-compatible)
npm audit fix

# Force updates (may break compatibility)
npm audit fix --force
```

## Issue Response

When the workflow creates a security issue:

### 1. Review the Report

- Check the audit report artifact
- Identify affected packages and severity

### 2. Update Dependencies

```bash
# Update specific package
npm update <package-name>

# Or use audit fix
npm audit fix
```

### 3. Test Changes

```bash
# Run full test suite
npm run test:all

# Verify functionality
npm run dev
```

### 4. Commit and Close Issue

```bash
git add package.json package-lock.json
git commit -m "fix(deps): resolve security vulnerabilities

Addresses vulnerabilities detected in #<issue-number>

- Updated <package-name> to v<version>
- Ran npm audit fix
- All tests passing

Closes #<issue-number>"
```

## Workflow Outputs

### Success (No Vulnerabilities)

```
✅ Security Audit: Passed
✅ found 0 vulnerabilities
```

### Failure (Vulnerabilities Detected)

```
❌ Security Audit: Failed
❌ found X vulnerabilities (Y moderate, Z high)
📋 Issue created: #<number>
```

## Monitoring Best Practices

### Weekly Review

1. Check Monday notifications for security issues
2. Prioritize high/critical vulnerabilities
3. Update dependencies within 7 days

### Proactive Updates

- Run `npm outdated` regularly
- Update minor/patch versions monthly
- Test major version updates in separate branch

### Security Severity Levels

- **Critical**: Fix immediately (same day)
- **High**: Fix within 3 days
- **Moderate**: Fix within 1 week
- **Low**: Fix in next maintenance cycle

## Troubleshooting

### Workflow Fails to Create Issue

- Check workflow permissions in repository settings
- Verify `issues: write` permission is enabled
- Review GitHub Actions logs

### False Positives

- Some vulnerabilities may not apply to development dependencies
- Review CVE details before updating
- Consider using `npm audit --production` for production-only audit

### Breaking Changes

- Test updates in development branch first
- Review package changelogs for breaking changes
- Use `npm audit fix --dry-run` to preview changes

## Related Documentation

- [npm audit documentation](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [GitHub Actions workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Dependabot alerts](https://docs.github.com/en/code-security/dependabot/dependabot-alerts/about-dependabot-alerts)

## Maintenance

- **Workflow file**: `.github/workflows/dependency-audit.yml`
- **Last updated**: 2026-02-14
- **Maintainer**: Project team
