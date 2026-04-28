# CI/CD Evolution Roadmap

**Type:** CI/CD
**Date:** 2026-04-27
**Status:** Planning
**Related Workflows:** `.github/workflows/test.yml`, `.github/workflows/modified-files.yml`, `.github/workflows/test-docker.yml`, `.github/workflows/documentation-lint.yml`, `.github/workflows/dependency-audit.yml`, `.github/workflows/bump-sw-cache.yml`, `.github/workflows/copilot-coding-agent.yml`

---

**Navigation**: [🏠 Documentation Hub](../README.md) | [📚 Complete Index](../INDEX.md) | [⚙️ Workflow Automation](./README.md)

---

## Overview

This roadmap defines how the repository should evolve its CI/CD setup over the near and mid term.

The planning priority is **simpler maintenance**: reduce workflow overlap, remove stale assumptions, clarify automation ownership, and make the release/deployment path easier to operate.

The roadmap covers both:

- **CI** - validation, testing, documentation checks, security checks, and scheduled maintenance automation
- **CD / release flow** - the current manual deployment path built around `deploy-preflight.sh`, `build_and_deploy.sh`, and the sibling `../mpbarbosa_site` repository

---

## Why this roadmap exists

The current GitHub Actions surface is broad, but it has become harder to maintain than it needs to be.

### Confirmed current-state issues

1. **Workflow overlap**
   - `test.yml`, `modified-files.yml`, and `copilot-coding-agent.yml` all cover pieces of validation and testing.
2. **Stale repository assumptions**
   - Some workflows still key off `*.js` patterns even though the repo is now TypeScript-first.
3. **Trigger inconsistency**
   - Branch and event rules vary by workflow, and one workflow still references `master`.
4. **Unclear automation side effects**
   - Some workflows auto-commit, auto-comment, or open issues, but there is no single policy that governs when each behavior is appropriate.
5. **Weak CD maturity**
   - Deployment is still primarily a manual operator flow and is coupled to a sibling repository rather than a clearly documented release pipeline.
6. **Documentation drift**
   - Existing workflow guides do not fully reflect the live workflow inventory and should not be treated as the sole source of truth without refresh.

---

## Scope and planning assumptions

- **Scope:** CI + CD / release pipeline
- **Planning horizon:** near-term + mid-term
- **Primary optimization goal:** simpler maintenance
- **Automation platform:** GitHub Actions remains the primary workflow surface
- **Deployment coverage:** explicitly include the current `../mpbarbosa_site` handoff
- **Constraint:** do not assume the sibling repository can be redesigned immediately

---

## Current workflow groups

### Core validation

- `.github/workflows/test.yml`
- `.github/workflows/test-docker.yml`
- `.github/workflows/documentation-lint.yml`
- `.github/workflows/link-checker.yml`
- `.github/workflows/version-consistency.yml`
- `.github/workflows/dependency-review.yml`

### Change-based or specialized validation

- `.github/workflows/modified-files.yml`
- `.github/workflows/copilot-coding-agent.yml`
- `.github/workflows/jsdoc-coverage.yml`

### Scheduled maintenance and mutation workflows

- `.github/workflows/dependency-audit.yml`
- `.github/workflows/test-badges.yml`
- `.github/workflows/bump-sw-cache.yml`
- `.github/workflows/update-guia.yml`
- `.github/workflows/update-ibira.yml`
- `.github/workflows/update-paraty-geocore.yml`
- `.github/workflows/update-bessa.yml`

---

## Target direction

The repository should move toward a CI/CD model with these characteristics:

1. **One canonical CI gate** for push and pull request validation
2. **Fewer overlapping workflows**, with maintenance tasks separated from validation gates
3. **TypeScript-aware automation** aligned with the live repo structure
4. **Explicit bot governance** for auto-commit, PR, issue, and comment behavior
5. **A documented release/deployment path** that explains where this repository ends and where `mpbarbosa_site` begins

---

## Roadmap milestones

## Near-term milestone A - Workflow inventory and ownership

**Goal:** make the current CI/CD system understandable enough to evolve safely.

### Work

- Build a workflow matrix covering triggers, branches, jobs, side effects, and ownership.
- Classify each workflow as **keep**, **merge**, **rewrite**, or **retire**.
- Separate read-only validation workflows from repo-mutating maintenance workflows.
- Identify which workflow should become the canonical CI gate.

### Expected outcome

- One authoritative inventory of the live workflow surface
- Clear ownership boundaries between CI, maintenance automation, and CD/release concerns

---

## Near-term milestone B - CI consolidation

**Goal:** reduce duplication and stale logic before adding more automation.

### Work

- Consolidate overlapping responsibilities across `test.yml`, `modified-files.yml`, and `copilot-coding-agent.yml`.
- Standardize branch and event triggers across the active CI workflows.
- Replace stale JavaScript-era file globs and assumptions with TypeScript-first rules.
- Standardize cache strategy, artifacts, summaries, and failure behavior.
- Decide the long-term role of `test-docker.yml`: required gate, optional confidence job, or manual/scheduled workflow.

### Expected outcome

- A smaller, clearer CI surface
- Lower workflow maintenance cost
- More predictable PR and push validation behavior

---

## Mid-term milestone C - Automation governance

**Goal:** make bot-driven automation predictable, auditable, and supportable.

### Work

- Review all workflows that auto-commit, auto-comment, or create issues.
- Define when automation may write directly to the default branch and when it must raise a PR or issue instead.
- Define rollback and ownership expectations for scheduled dependency bump workflows.
- Refresh operator-facing documentation so one guide accurately reflects the live CI/CD system.

### Expected outcome

- Fewer surprising bot side effects
- A maintainable policy for scheduled maintenance workflows
- Clearer operational documentation for maintainers

---

## Mid-term milestone D - Release and deployment maturity

**Goal:** clarify and improve the release/deployment path without over-automating prematurely.

### Work

- Map the current operator flow around `npm run deploy:preflight`, `scripts/deploy-preflight.sh`, and `scripts/build_and_deploy.sh`.
- Document the handoff to `../mpbarbosa_site` and the current staging sync dependency.
- Decide whether this repository should only produce validated build artifacts or also orchestrate release/deployment steps.
- Choose a target release model:
  - manual release assist
  - environment-gated deployment workflow
  - cross-repo orchestration
- Define approval, rollback, and observability expectations for the chosen model.

### Expected outcome

- A documented CD boundary for this repository
- A realistic path from manual deployment assistance toward a safer release process

---

## Key implementation decisions

These decisions should be resolved before workflow refactoring starts:

1. Which single workflow becomes the canonical PR/push CI gate?
2. Should Docker tests be blocking, optional, or non-default?
3. Which automations are allowed to auto-commit versus open PRs/issues?
4. Does this repository own release orchestration, or only artifact validation and handoff to `mpbarbosa_site`?
5. Which documentation file becomes the canonical CI/CD operator guide?

---

## Success criteria

The roadmap should be considered successful when:

- maintainers can explain the CI/CD surface from one inventory and one operator guide
- the repository has one clearly defined primary CI gate
- stale workflow assumptions about source layout are removed
- bot side effects follow an explicit policy instead of ad hoc behavior
- the release/deployment path is documented clearly enough for a maintainer to operate without tribal knowledge

---

## Follow-up implementation artifacts

When this roadmap is executed, the likely follow-up work will include:

- workflow inventory and target-state matrix
- workflow consolidation and retirement plan
- documentation updates for `WORKFLOW_SETUP.md` and `.github/workflows/README.md`
- release/deployment guide updates for the sibling-repo handoff

---

**Status:** Planning
**Next Step:** Convert this roadmap into workflow-by-workflow implementation tasks once the target CI gate and deployment ownership model are confirmed.
