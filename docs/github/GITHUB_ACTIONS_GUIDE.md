# GitHub Actions Guide

Reference guide for the GitHub Actions configuration in this repository.

## Workflow Structure

All workflow files live under `.github/workflows/`. Each workflow follows
the naming convention `<purpose>.yml`.

## Secrets and Variables

| Secret / Variable | Used by | Purpose |
|-------------------|---------|---------|
| `GITHUB_TOKEN` | All workflows | Default GitHub token for API calls |

## Adding a New Workflow

1. Create `.github/workflows/<name>.yml`.
2. Define `on:` triggers (e.g., `workflow_dispatch`, `push`, `schedule`).
3. Add steps using existing composite actions from `.github/actions/`.
4. Document the workflow in `.github/workflows/README.md`.

## Composite Actions

Reusable action building blocks are located under `.github/actions/`:

- `detect-affected-tests/` — determines which test suites are affected by a change
- `security-check/` — runs basic credential and security scans
- `update-doc-index/` — regenerates documentation index files
- `update-test-docs/` — keeps test documentation in sync with test files

## Related Files

- [WORKFLOW_SETUP.md](../../WORKFLOW_SETUP.md) — local workflow setup
- [.github/workflows/README.md](../workflows/README.md) — workflow descriptions
