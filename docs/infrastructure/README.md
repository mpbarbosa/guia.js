# Infrastructure Documentation

**Purpose:** Documentation for project infrastructure, tooling setup, CI/CD configuration, and development environment management.

**Last Updated:** 2026-02-11

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

❌ **Workflow automation scripts** → `docs/workflow-automation/`  
❌ **Testing infrastructure** → `docs/testing/`  
❌ **Architecture decisions** → `docs/architecture/`  
❌ **Implementation reports** → `docs/reports/implementation/`  
❌ **Bug fixes** → `docs/reports/bugfixes/`  
❌ **API documentation** → `docs/api/`

---

## Current Contents

### CI/CD & Deployment
- **`CDN_DELIVERY_SCRIPT_RELOCATION_PLAN.md`** - jsDelivr CDN URL generation strategy
  - Planning document for `.github/scripts/cdn-delivery.sh`
  - CDN URL templates and version management
  - Relocation from root to .github/scripts/

### Development Environment
- **`NODE_VERSION_ALIGNMENT_PLAN.md`** - Node.js version standardization
  - Node.js v18+ requirement across all environments
  - `.nvmrc` and GitHub Actions alignment
  - Version consistency strategy

- **`EXAMPLES_DIRECTORY.md`** - Examples directory organization
  - Structure and purpose of `/examples` directory
  - Usage demonstration files
  - Integration examples

### AI-Assisted Development
- **`AI_WORKFLOW_INFRASTRUCTURE.md`** - AI-assisted development setup
  - GitHub Copilot integration
  - Copilot instructions configuration
  - AI workflow best practices

---

## Usage Guidelines

### Infrastructure Planning

Use this directory for:

1. **Planning Documents** - Before implementing major infrastructure changes
2. **Configuration Strategies** - CI/CD, environment, deployment strategies
3. **Setup Guides** - How to configure development environments
4. **Migration Plans** - Moving infrastructure components
5. **Alignment Plans** - Ensuring consistency across environments

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

### 1. Node.js Environment

**Files:**
- `.nvmrc` - Node.js version specification
- `package.json` - Engine requirements
- `.github/workflows/*.yml` - CI Node.js versions

**Standard:** Node.js v18+ (LTS)

### 2. GitHub Actions CI/CD

**Files:**
- `.github/workflows/copilot-coding-agent.yml` - Main CI pipeline
- `.github/workflows/test.yml` - Test automation

**Features:**
- Automated testing (Jest)
- Syntax validation
- Coverage reporting
- Pre-commit hooks

### 3. CDN Delivery

**Files:**
- `.github/scripts/cdn-delivery.sh` - URL generation
- `cdn-urls.txt` - Generated URLs

**Provider:** jsDelivr CDN

### 4. Development Scripts

**Files:**
- `.github/scripts/test-workflow-locally.sh` - Local CI simulation
- `.github/scripts/validate-jsdom-update.sh` - jsdom validation

---

## Related Documentation

### Workflow Automation
- **`docs/workflow-automation/`** - Workflow automation scripts and guides

### Testing Infrastructure
- **`docs/testing/`** - Testing strategies and setup
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

## Questions?

### Where should I document...

| Infrastructure Topic | Location |
|---------------------|----------|
| CI/CD pipeline configuration | This directory (`infrastructure/`) |
| Workflow automation scripts | `docs/workflow-automation/` |
| Testing setup and strategy | `docs/testing/` |
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
