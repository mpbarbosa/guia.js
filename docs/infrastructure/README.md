# Infrastructure Documentation

**Purpose:** Documentation for project infrastructure, tooling setup, CI/CD configuration, and development environment management.

**Last Updated:** 2026-05-22

---

## What Belongs Here

This directory is for:

✅ **CI/CD pipeline configuration and strategy**
✅ **Development environment setup guides**
✅ **Node.js version management and alignment**
✅ **CDN deployment and delivery scripts**
✅ **Examples directory organization**
✅ **Build and deployment infrastructure**
✅ **AI workflow infrastructure setup**
✅ **Development tooling configuration**

---

## What Does NOT Belong Here

Use these directories instead:

❌ **Executable workflow automation scripts** →
`.github/scripts/` and `.github/workflows/`
❌ **Testing infrastructure** → `TESTING.md` (root) + `tests/README.md`
❌ **Architecture decisions** → `docs/architecture/`
❌ **Implementation reports** → `docs/misc/` or a topic-specific stable directory
❌ **Bug fixes** → `docs/misc/` or the affected topic directory
❌ **API documentation** → `docs/api/`

---

## Current Contents

### Active Reference Docs

- **`CI_CD_GUIDE.md`** - CI/CD behavior and local validation workflow
- **`DEPENDENCY_MANAGEMENT.md`** - Dependency strategy and audit guidance
- **`DEPLOYMENT.md`** - Production deployment and publishing
- **`SECURITY_CONFIGURATION.md`** - CSP, rate limiting, and security hardening
- **`AI_WORKFLOW_INFRASTRUCTURE.md`** - AI workflow directory and handling notes

---

## Usage Guidelines

### Infrastructure Planning

Use this directory for:

1. **Configuration Strategies** - CI/CD, security, deployment strategies
2. **Setup Guides** - How to configure development environments
3. **Operational References** - Deployment and dependency maintenance
4. **Workflow Notes** - Durable documentation for infrastructure-related tooling

### Document Template

```markdown
# [Infrastructure Component] - [Purpose]

**Type:** [CI/CD|Environment|Deployment|Tooling]
**Date:** YYYY-MM-DD
**Status:** [Planning|In Progress|Complete|Archived]
**Related Files:** [List configuration files or scripts]

---

## Overview

Brief description of the infrastructure component.

## Current State

What exists now (if applicable).

## Proposed Changes

What we plan to implement.

## Implementation Strategy

Step-by-step plan.

## Configuration Files

- `.github/workflows/xxx.yml`
- `package.json` (specific fields)
- Other relevant files

## Testing & Validation

How to verify the infrastructure works.

## Rollback Plan

How to revert if needed.

---

**Status:** [Current status]
**Next Steps:** [What comes next]
```

---

## Key Infrastructure Components

### 1. GitHub Actions CI/CD

**Files:**

- `.github/workflows/copilot-coding-agent.yml` - Main CI pipeline
- `.github/workflows/test.yml` - Test automation

**Features:**

- Automated testing (Jest)
- Syntax validation
- Coverage reporting
- Pre-commit hooks

### 2. Development Scripts

**Files:**

- `.github/scripts/test-workflow-locally.sh` - Local CI simulation
- `.github/scripts/validate-jsdom-update.sh` - jsdom validation

---

## Related Documentation

### Workflow Automation

- **`WORKFLOW_SETUP.md`** - Local workflow setup and CI/CD overview
- **`docs/github/GITHUB_ACTIONS_GUIDE.md`** - GitHub Actions reference guide
- **`.github/workflows/README.md`** - Workflow catalog
- **`.github/scripts/README.md`** - Automation script inventory

### Testing Infrastructure

- **`TESTING.md`** - Testing overview and quick reference
- **`tests/README.md`** - Test organization and structure
- **`__tests__/`** - Actual test suites

### Configuration Files

- **`.github/`** - GitHub Actions workflows and scripts
- **`package.json`** - npm dependencies and scripts
- **`.nvmrc`** - Node.js version

---

## Maintenance

### Periodic Review

Review infrastructure documentation quarterly (every 3 months) to:

- Update for new tools and dependencies
- Verify configuration files are current
- Archive obsolete infrastructure docs
- Update this README with new components

### Change Management

When modifying infrastructure:

1. **Document first** - Create planning document in this directory
2. **Review with team** - Discuss changes before implementing
3. **Test thoroughly** - Use local validation scripts
4. **Update documentation** - Keep all docs current
5. **Monitor deployment** - Watch for issues after changes

---

## Questions

### Where should I document

| Infrastructure Topic | Location |
|---------------------|----------|
| CI/CD pipeline configuration | This directory (`infrastructure/`) |
| Workflow automation scripts | `.github/scripts/` and `.github/workflows/` |
| Workflow setup guides | `WORKFLOW_SETUP.md` and `docs/github/` |
| Testing setup and strategy | `TESTING.md` (root) + `tests/README.md` |
| Build process | This directory (`infrastructure/`) |
| Deployment scripts | This directory (`infrastructure/`) |
| Environment variables | This directory (`infrastructure/`) |

### Getting Help

- Check related infrastructure documents first
- Review `.github/` directory for actual configuration
- Consult `docs/INDEX.md` for overall structure
- Ask in project discussions or issues

---

**Maintained By:** Development team
**Purpose:** Infrastructure planning and configuration documentation
**Status:** ✅ Active - Updated 2026-02-11
