# Code Quality Control Guide

This guide defines quality-control expectations for implementation changes in
**Guia Turístico** (guia.js), with focus on boundary-heavy integration code such
as adapters, wrappers, and third-party CDN boundaries (Nominatim, IBGE, ibira.js,
paraty_geoservices).

It is intentionally narrow: use it to review the quality of implementation
changes, not as a replacement for the architecture and design guides.

## Source of truth

Use this guide together with:

- [Architecture Guide](../architecture/ARCHITECTURE.md)
- [DRY Guide](./DRY_GUIDE.md)
- [High Cohesion Guide](./HIGH_COHESION_GUIDE.md)
- [Low Coupling Guide](./LOW_COUPLING_GUIDE.md)
- [Referential Transparency Guide](./REFERENTIAL_TRANSPARENCY.md)
- [Unit Test Guide](./UNIT_TEST_GUIDE.md)

## Goal

Catch quality regressions early by checking that new code:

1. lands in the correct bounded context
2. keeps public APIs clear and intentional
3. isolates third-party SDK details at adapter boundaries
4. preserves deterministic helper logic where practical
5. stays covered by repository validation and focused tests

## Quality gates

Every substantive code change should satisfy these gates.

### 1. Responsibility gate

- A file, class, or document should keep one clear primary job.
- Wrapper modules should orchestrate runtime behavior, not become generic
  buckets for parsing, mapping, compatibility glue, and policy logic at once.
- If a component description needs repeated "and", split or extract.

### 2. Boundary gate

- Public APIs should expose library-owned concepts by default.
- Third-party SDK shapes should cross into public APIs only when the leak is
  explicit, justified, and documented.
- Dependency quirks, dynamic imports, and CDN version compatibility workarounds
  should stay in narrow internal adapters (e.g. `src/services/`).

### 3. Ubiquitous language gate

- Use the project's established language consistently across all modules and
  documents. See [TERMINOLOGY_GUIDE.md](./TERMINOLOGY_GUIDE.md) for the
  canonical term list.
- Prefer value-style modeling for requests, responses, configs, and parsed
  outputs (e.g. `BrazilianStandardAddress`, `GeoPosition`).
- Avoid adding abstractions whose main effect is ceremony rather than clarity.

### 4. Purity gate

- Keep pure mapping, parsing, normalization, and validation logic in small
  reusable helpers where practical.
- Avoid cloning the same mapping or normalization rule across multiple layers;
  keep one canonical implementation and delegate to it.
- Keep filesystem, process, environment, network, and SDK session work in
  explicit runtime-facing modules (`src/services/`, `src/coordination/`).
- Do not hide side effects behind utility-sounding names.
- All timers must go through `TimerManager` — never bare `setInterval` /
  `setTimeout`.

### 5. Test gate

- Changes to public behavior require focused tests at the affected boundary.
- Extracted helper logic should gain direct unit coverage when its behavior is
  significant enough to regress independently.
- Split tests along responsibility seams when a refactor separates execution
  logic from administration or translation logic.

### 6. Documentation gate

- Update user-facing docs when public API behavior, exports, or recommended
  usage changes.
- Cross-link to related design guides instead of restating them. See
  [DRY Guide](./DRY_GUIDE.md) when deciding whether prose belongs in a new doc
  or should reference an existing one.
- Call out intentional breaking cleanup in `CHANGELOG.md` (project root).

### 7. Architecture gate

See [Architecture Guide](../architecture/ARCHITECTURE.md) for the full layer
reference. The project layers from inner to outer are:

| Layer | Path | Role |
|---|---|---|
| Domain | `src/core/`, `src/data/`, `src/types/`, `src/config/` | Value objects, state, constants |
| Use-case | `src/coordination/`, `src/views/` | Orchestration, business flow |
| Adapters | `src/services/` | External API wrappers (Nominatim, IBGE, etc.) |
| UI | `src/html/`, `src/components/`, `src/speech/` | Display, Vue SFCs |
| Framework | `src/app.ts`, `src/main.ts` | Vue bootstrap, router, CDN wiring |

The key checks at review time:

- Dependencies must point inward. No inner-layer file (`src/core/`,
  `src/data/`) may import from an outer layer (`src/services/`, `src/html/`,
  `src/components/`, or Vue).
- Domain and use-case files must be free of framework, CDN SDK, and transport
  imports.
- Use-case logic should delegate all I/O through interfaces or ports defined
  in `src/types/`, not by constructing service dependencies directly.
- Adapter translation code must stay in `src/services/`; it must not leak into
  domain types or coordination files.
- CDN wiring and framework bootstrapping (Vue setup, dynamic CDN imports)
  belongs in `src/app.ts` / `src/main.ts` only.
- Domain and use-case logic should be exercisable in unit tests without
  real HTTP calls or browser APIs.

### 8. Validation gate

Run the repository validation commands for substantive code changes:

1. **Lint:** `npm run lint`
2. **Unit tests:** `npm run test:unit`
3. **Full test suite:** `npm test`
4. **Build:** `npm run build`
5. **Version consistency:** `npm run check:version`
6. **Syntax validation:** `npm run validate`

For pre-push validation the git hooks run steps 3 and 4 automatically.

## Review checklist

- [ ] The change belongs to the correct module boundary.
- [ ] Public names reflect library concepts rather than accidental SDK naming.
- [ ] Compatibility shims are isolated from business-facing APIs.
- [ ] Pure helpers are separated from runtime orchestration where practical.
- [ ] New abstractions improve clarity more than they increase indirection.
- [ ] Tests cover the changed boundary and any newly extracted critical helper.
- [ ] Docs and changelog reflect any meaningful API or behavior change.
- [ ] Repository validation commands still pass (`npm run lint`, `npm test`, `npm run build`).
- [ ] No inner-layer file (`src/core/`, `src/data/`) imports from an outer layer.
- [ ] Domain and use-case files have no Vue, CDN, or SDK imports.
- [ ] Use-case logic delegates I/O through `src/types/` interfaces, not by constructing services directly.
- [ ] Adapter translation code does not leak into domain types or coordination logic.
- [ ] CDN and framework wiring is confined to `src/app.ts` / `src/main.ts`.
- [ ] All timers use `TimerManager`, not bare `setInterval` / `setTimeout`.

## Summary

Good quality control is mostly about keeping boundaries clear, abstractions
small, and public APIs intentional. Favor thinner adapters, focused helpers, and
explicit documentation over broad wrappers and hidden dependency leakage.
