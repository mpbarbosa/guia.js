# Workflow Automation Model

This document explains how the `Modified Files - Test and Documentation Updates` GitHub Actions workflow works in `guia.js` and why it is a useful model for other projects.

The workflow is defined in `.github/workflows/modified-files.yml` and is designed to react to file changes intelligently instead of running every possible automation on every push or pull request.

## Goals

This workflow is designed to:

- detect what kinds of files changed in a commit or pull request;
- run only the relevant jobs for those changes;
- validate documentation updates automatically;
- run tests when JavaScript or test files change;
- keep project documentation synchronized with test activity;
- produce a summary that makes the workflow outcome easy to understand.

This is a strong model for other repositories because it balances **automation coverage**, **speed**, and **maintainability**.

## Trigger Strategy

The workflow runs on both:

- `pull_request` targeting `main` or `develop`;
- `push` to `main` or `develop`.

This gives the project two benefits:

1. changes are validated before merge through pull requests;
2. direct updates to important branches are also checked.

## Permissions

The workflow requests:

- `contents: write`
- `pull-requests: write`

These permissions allow it to:

- commit generated documentation updates back to the repository when needed;
- support PR-related automation such as future comments or reporting.

Projects that adopt this model should keep permissions minimal and only grant write access when automation truly needs it.

## High-Level Job Design

The workflow is split into five jobs:

1. `detect-changes`
2. `run-affected-tests`
3. `update-test-documentation`
4. `validate-documentation`
5. `update-coverage-badge`
6. `summary`

Although there are six jobs, the design behaves like a pipeline with one lightweight detection phase followed by conditional execution.

## 1. Detect Changes

The `detect-changes` job is the decision engine for the whole workflow.

It compares:

- pull request base SHA vs. current SHA for PRs;
- `HEAD~1` vs. `HEAD` for pushes.

It then classifies whether the changed files include:

- JavaScript files;
- test files;
- Markdown documentation files;
- source files under `src/`.

These results are exposed as job outputs:

- `js_files`
- `test_files`
- `doc_files`
- `src_changed`

### Why this matters

This pattern is worth copying into other repositories because it prevents expensive or irrelevant jobs from running when they are not needed.

For example:

- if only documentation changes, the test pipeline can be skipped;
- if only source or test files change, documentation validation can be skipped unless Markdown was also touched.

This makes CI faster and easier to understand.

## 2. Run Tests for Modified Files

The `run-affected-tests` job runs only when JavaScript or test files changed.

It performs these steps:

- checks out the code;
- sets up Node.js using `.nvmrc`;
- installs dependencies with `npm ci`;
- runs the test suite;
- runs coverage generation;
- validates JavaScript syntax.

### Why this is a good pattern

Even though the job name suggests selective testing, the implementation currently runs the full test suite. That is still a valid intermediate design:

- change detection prevents unnecessary test execution on docs-only changes;
- the implementation remains simple;
- the project can later evolve toward true affected-test selection without changing the workflow structure.

Other projects can adopt the same staged maturity model.

## 3. Update Test Documentation

The `update-test-documentation` job runs only when test files changed.

It:

- installs dependencies;
- collects test statistics;
- updates `TESTING.md` with a current automation timestamp;
- commits and pushes documentation changes if needed.

### Why this is a useful model

Many repositories treat testing documentation as static text, which quickly becomes outdated. This workflow treats documentation as a living artifact.

That is valuable because it:

- reduces drift between the codebase and its testing guidance;
- makes project health more visible;
- reinforces the idea that documentation is part of delivery quality.

## 4. Validate Modified Documentation

The `validate-documentation` job runs only when Markdown files changed.

It:

- identifies changed `.md` files;
- exports them as a multiline workflow output;
- validates each changed file;
- checks for Windows line endings;
- scans for internal links that may be broken;
- optionally checks whether `docs/INDEX.md` may need attention.

### Important implementation detail

This project recently fixed a real failure in this job.

The original workflow attempted to write a multiline list of changed files to `$GITHUB_OUTPUT` using a single-line `key=value` format. That broke when multiple Markdown files changed.

The corrected implementation now uses the GitHub Actions multiline output format:

```bash
{
  echo "files<<EOF"
  echo "$CHANGED_DOCS"
  echo "EOF"
} >> "$GITHUB_OUTPUT"
```

The workflow was also improved to iterate safely over changed filenames line by line, which is more robust for filenames containing spaces.

### Why this is a strong pattern

This job is a good example of **lightweight documentation QA**:

- it is fast;
- it does not require a full docs platform;
- it catches common documentation mistakes early.

For many projects, that is the right level of automation.

## 5. Update Coverage Statistics

The `update-coverage-badge` job runs when:

- source files changed; or
- test files changed.

It currently:

- generates a coverage report;
- checks whether coverage artifacts exist;
- leaves a placeholder for PR coverage reporting.

### Why this matters

This is a good example of a workflow designed for extension.

Even if coverage reporting is not fully implemented yet, the structure is already in place. Other teams can copy this pattern and gradually enhance it with:

- badge updates;
- PR comments;
- threshold enforcement;
- artifact uploads.

## 6. Workflow Summary

The `summary` job always runs.

It writes a human-readable execution summary to `$GITHUB_STEP_SUMMARY`, including:

- which kinds of files changed;
- whether tests ran;
- whether documentation validation ran.

### Why this is worth copying

This is one of the best features of the workflow model.

A summary job makes CI easier for maintainers, contributors, and reviewers because they can quickly understand:

- what the workflow detected;
- what it decided to run;
- what succeeded or failed.

That improves the developer experience without much maintenance cost.

## Why This Workflow Is a Good Model for Other Projects

This workflow is a good template because it demonstrates several healthy automation principles:

### 1. Change-aware execution

Only relevant jobs run.

### 2. Separation of concerns

Each job has a clear responsibility.

### 3. Progressive automation

Some jobs are simple today but structured for future expansion.

### 4. Documentation as a first-class concern

Docs are validated and updated, not ignored.

### 5. Clear reporting

The summary job improves visibility and trust in CI.

## Recommended Practices for Teams Reusing This Model

If another project wants to use this workflow as a template, these practices should be preserved:

- keep a dedicated change-detection job at the start;
- publish small boolean outputs that downstream jobs can use;
- split testing, documentation, and reporting into separate jobs;
- use multiline output syntax whenever a step output may contain multiple lines;
- iterate through file lists safely using line-based reads;
- keep the final summary job so contributors can understand workflow decisions quickly.

## Suggested Future Improvements

Projects using this model may want to extend it with:

- quoted SHA arguments in `git diff` commands for safer shell usage;
- explicit `shell: bash` declarations wherever Bash-specific syntax is used;
- better relative-link resolution for Markdown files;
- selective test execution based on changed paths;
- actual coverage extraction and PR commenting;
- automatic updates to documentation indexes.

## Example Reuse Strategy

A team adopting this workflow model can start with the same structure and then customize the file categories:

- `src/` for application code;
- `__tests__/` for tests;
- `docs/` or `*.md` for documentation;
- optional categories for infrastructure, API specs, or configuration files.

That makes the workflow portable across JavaScript, TypeScript, Python, and other repositories.

## Conclusion

The `guia.js` workflow is a practical example of smart CI design.

It does not try to do everything. Instead, it focuses on a few high-value goals:

- detect meaningful change types;
- run only the jobs that matter;
- keep tests and docs in better shape;
- present results clearly.

That is exactly why it works well as a model for other projects.
