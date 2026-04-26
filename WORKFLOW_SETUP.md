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

## Related Guides

- [docs/github/GITHUB_ACTIONS_GUIDE.md](./docs/github/GITHUB_ACTIONS_GUIDE.md) — GitHub Actions configuration reference
- [.github/workflows/README.md](./.github/workflows/README.md) — Workflow descriptions
