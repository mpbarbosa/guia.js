# GeoPosition Examples

This directory contains examples demonstrating the features of the referentially transparent GeoPosition class.

## Running the Examples

```bash
# From the project root
node examples/geoposition-immutability-demo.js
```

## Available Examples

### geoposition-immutability-demo.js

Demonstrates the core principles of the referentially transparent GeoPosition class:

1. **Purity - No Mutation**: Shows that the constructor does not mutate input objects
2. **Immutability - Defensive Copying**: Proves that changes to the original position don't affect the GeoPosition instance
3. **Pure Methods**: Demonstrates that methods always return the same output for the same input
4. **Static Pure Functions**: Shows the static `getAccuracyQuality()` method with various accuracy values
5. **Summary**: Confirms that GeoPosition follows functional programming principles

### Expected Output

```
======================================================================
Referentially Transparent GeoPosition Example
======================================================================

1. Purity - No Mutation of Input Objects:
----------------------------------------------------------------------
Before creating GeoPosition:
  - coords.latitude = -23.5505

After creating GeoPosition:
  - coords.latitude unchanged? true

2. Immutability - Defensive Copying:
----------------------------------------------------------------------
GeoPosition latitude before mutation: -23.5505
Original position mutated to Rio coordinates
GeoPosition latitude after mutation: -23.5505
GeoPosition still has São Paulo coordinates? true

3. Pure Methods - Deterministic Outputs:
----------------------------------------------------------------------
Distance calculation 1: 588 meters
Distance calculation 2: 588 meters
Distance calculation 3: 588 meters
All results identical? true

4. Static Pure Function - getAccuracyQuality:
----------------------------------------------------------------------
  Accuracy 5m => Quality: excellent
  Accuracy 15m => Quality: good
  Accuracy 50m => Quality: medium
  Accuracy 150m => Quality: bad
  Accuracy 500m => Quality: very bad

======================================================================
Summary: GeoPosition is now pure, immutable, and referentially transparent!
======================================================================
```

## Key Takeaways

- **No Side Effects**: GeoPosition constructor doesn't log or mutate inputs
- **Immutable**: All properties are set at construction and cannot be changed
- **Pure Functions**: Methods always return the same output for the same input
- **Defensive Copying**: Input objects are copied, preventing shared mutable state
- **Referentially Transparent**: Replacing a GeoPosition with its value is safe
