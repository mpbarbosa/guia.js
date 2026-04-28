# Copilot Instructions: guia_js

> Durable, high-signal guidance for Copilot-assisted development in this repository. Focus on stable architecture, design principles, documentation sync, and validation. Link to authoritative docs for details.

---

## Purpose

This file provides concise, project-specific guidance to help Copilot make high-quality, context-aware edits for `guia_js`, a tourist guide web application built on top of the guia.js library.

---

## Architecture and Source Boundaries

Respect these stable source layers:

- `src/core/` – Foundational runtime helpers
- `src/utils/` – Shared low-level utilities

Supporting workflow surfaces:

- `.workflow-config.yaml` – Project-local workflow configuration
- `.ai_workflow/` – Runtime artifacts, cache, and checkpoints

---

## Design Principles

Follow established design principles and module boundaries. Prefer modularity and clarity. Avoid introducing project-specific conventions not confirmed by authoritative docs.

---

## Documentation and Change Coordination

- Sync user-facing changes with `README.md` and reference docs.
- Update `docs/ARCHITECTURE.md` for architecture or layout changes.
- Align package exports and entry points with `package.json` and API docs.
- For details, refer to authoritative docs:
  - `README.md`
  - `docs/ARCHITECTURE.md`
  - `docs/guides/MIGRATION_GUIDE.md`
  - `CHANGELOG.md`
  - `CONTRIBUTING.md`

---

## Validation Commands

For substantive code changes, always validate with:

- `npm run lint`
- `npm test`
- `npm run build`

---

## Entry Point

- Main entry: `src/app.js`

---

> Do not duplicate implementation status, inventories, installation, or migration details—link to the above docs instead.
