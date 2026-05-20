# Workflow Setup Guide

This guide covers how to configure and run the GitHub Actions workflows
in this repository.

## Prerequisites

- A GitHub account with write access to the repository.
- Node.js 18+ and npm 10+ installed locally for local testing.

## Available Workflows

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| Update guia.js | `update-guia.yml` | Weekly / manual | Bump guia.js version |
| Update ibira.js | `update-ibira.yml` | Weekly / manual | Bump ibira.js version |
| Copilot agent | `copilot-coding-agent.yml` | Manual | AI-assisted code changes |

## Running Workflows Locally

Use the local simulation script:

```bash
./.github/scripts/test-workflow-locally.sh
```

### Conditional Execution

The local workflow runner supports conditional step execution through
`.workflow-config.yaml` and `.github/scripts/workflow-condition-evaluator.sh`.
This lets local runs skip unnecessary work for cases such as documentation-only
changes, test-only changes, or unchanged directory structure scans.

Useful commands:

```bash
# Check whether a step should run
./.github/scripts/workflow-condition-evaluator.sh step7_test_execution

# Validate the supporting scripts
bash -n .github/scripts/workflow-condition-evaluator.sh
bash -n .github/scripts/test-workflow-locally.sh

# Reset cached directory-structure data
rm -rf .github/cache/
```

Relevant files:

- `.workflow-config.yaml` — conditional rules and change-detection patterns
- `.github/scripts/workflow-condition-evaluator.sh` — evaluates whether steps run
- `.github/scripts/test-conditional-execution.sh` — conditional execution tests

## Related Guides

- [docs/github/GITHUB_ACTIONS_GUIDE.md](./docs/github/GITHUB_ACTIONS_GUIDE.md) — GitHub Actions configuration reference
- [.github/workflows/README.md](./.github/workflows/README.md) — Workflow descriptions
