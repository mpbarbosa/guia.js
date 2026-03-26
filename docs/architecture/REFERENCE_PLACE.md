# ReferencePlace Architecture

`ReferencePlace` is a value object in `src/data/ReferencePlace.js` that
represents a nearby point of interest identified during reverse geocoding.

## Responsibilities

- Stores the name, type, and category of a place near the current position.
- Exposes a `calculateCategory()` method that maps OSM tags to display categories.
- Remains immutable after construction.

## Supported OSM types

| OSM tag | Example value | Display category |
|---------|--------------|-----------------|
| `place` | `hamlet`, `village`, `town` | Place |
| `shop` | `supermarket`, `bakery` | Shop |
| `amenity` | `restaurant`, `bank` | Amenity |
| `railway` | `station`, `halt` | Transport |
| `building` | `yes`, `commercial` | Building |

## Class Documentation Example

```javascript
/**
 * Immutable reference place value object.
 *
 * @param {Object} osmTags - Raw OSM tag map from Nominatim response.
 */
class ReferencePlace {
  constructor(osmTags) { /* ... */ }

  /**
   * Maps OSM tags to a human-readable display category.
   * @returns {string} Category label, or 'Other' if no match.
   */
  calculateCategory() { /* ... */ }
}
```

## Related Files

- `src/data/ReferencePlace.js` — implementation
- `src/html/HTMLReferencePlaceDisplayer.js` — UI rendering
- `docs/architecture/ARCHITECTURE.md` — overall architecture overview
