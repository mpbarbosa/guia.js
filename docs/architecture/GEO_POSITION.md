# GeoPosition Class Documentation

> ⚠️ **Moved to `paraty_geocore.js`**
>
> Since `v0.11.7-alpha`, the `GeoPosition` class lives in the external [`paraty_geocore.js`](https://github.com/mpbarbosa/paraty_geocore.js) library.
> The local `src/core/GeoPosition.ts` file has been removed.
>
> **Full documentation:** [paraty_geocore.js/docs/GEO_POSITION.md](https://github.com/mpbarbosa/paraty_geocore.js/blob/main/docs/GEO_POSITION.md)

## Import in guia_turistico

```ts
import { GeoPosition } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.9.4-alpha/dist/esm/index.js';
```

## Jest (via moduleNameMapper in `jest.config.unit.js`)

The CDN URL is mapped to the local `paraty_geocore.js` source for offline test execution:

```
'^https://cdn\\.jsdelivr\\.net/gh/mpbarbosa/paraty_geocore\\.js@0\\.9\\.3-alpha/dist/esm/index\\.js$'
→ '<rootDir>/../paraty_geocore.js/src/index'
```
