# Copilot Instructions: guia_js

> Durable, high-signal guidance for Copilot-assisted development in this repository. Focus on stable architecture, documentation sync, and validation. Link to authoritative docs for details.

This file provides concise, project-specific guidance to help Copilot make high-quality, context-aware edits for `guia_js`, a tourist guide web application built on top of the guia.js library.

## Architecture and Source Boundaries

Respect these stable source boundaries:

- `src/app.js` – Main package entry point (editable source sibling: `src/app.ts`)
- `src/main.ts` – Vue runtime entry point that creates the app, wires the router, and mounts `#app`
- `src/core/` – Foundational runtime helpers
- `src/utils/` – Shared low-level utilities

Supporting workflow surfaces:

- `.workflow-config.yaml` – Project-local workflow configuration
- `.ai_workflow/` – Runtime artifacts, cache, and checkpoints

## Documentation and Change Coordination

- Sync user-facing changes with `README.md` and other reference docs.
- Update `docs/ARCHITECTURE.md` and the linked `docs/architecture/` reference docs for architecture or layout changes.
- For markdown formatting rules, use `.markdownlint.yaml` as the source of truth.
- Markdown list indentation follows `.markdownlint.yaml` (`MD007.indent: 2`); do not assume a 4-space project rule.
- For details, refer to authoritative docs:
  - `README.md`
  - `docs/ARCHITECTURE.md`
  - `CHANGELOG.md`
  - `.github/CONTRIBUTING.md`
  - `CLAUDE.md`

## Validation Commands

For substantive code changes, always validate with:

- `npm run lint`
- `npm test`
- `npm run build`

> Do not duplicate implementation status, inventories, installation, or migration details—link to the above docs instead.
