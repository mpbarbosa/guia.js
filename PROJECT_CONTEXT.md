## Runtime Constraints

- This repository mixes TypeScript and legacy JavaScript under `src/`; do not assume every runtime file is `.ts`.
- For async analysis, treat callback- and event-driven browser flows as first-class async surfaces alongside promises:
  - `navigator.geolocation.*`
  - DOM event listeners
  - `MutationObserver`
  - `setTimeout` / `setInterval`
  - popup flows such as `window.open(...)`
- `src/app.ts`, `src/main.ts`, `src/andarilho.ts`, `src/services/**`, and selected `src/utils/**` files contain real runtime async behavior.
- Re-export shims such as `src/services/AwsGeocoder.ts` and `src/services/providers/*.ts` are compatibility surfaces, not standalone async implementations.
- Absence of retry or fallback logic is not automatically a bug here: some services intentionally throw, reject, or surface errors to the caller/UI instead of recovering in place.
- When static source is the only evidence, limit conclusions to visible code paths and mark live CORS or timing behavior as unavailable.
