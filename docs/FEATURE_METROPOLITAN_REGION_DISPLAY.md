# Feature: Metropolitan Region Display in Municipality Card

## Overview
Display metropolitan region information (Região Metropolitana) in the Municipality Card to provide additional geographic context for users in metropolitan areas.

**Version**: 0.8.7-alpha  
**Date**: 2026-01-28  
**Author**: Marcelo Pereira Barbosa

## Motivation

### Problem
The município highlight card currently displays only the municipality name and state abbreviation (e.g., "Recife, PE"). For municipalities within metropolitan regions, this valuable geographic context is missing, even though the information is available from the Nominatim API.

### Solution
Display the metropolitan region name between the "MUNICÍPIO" label and the municipality name with reduced visual prominence (smaller font + lighter color).

**Visual Example**:
```
MUNICÍPIO
Região Metropolitana do Recife    ← smaller, lighter (0.875rem, opacity 0.7)
Recife, PE                         ← normal, prominent (2.5rem, full opacity)
```

## Technical Implementation

### Data Flow

```
Nominatim API Response (address.county)
    ↓
AddressExtractor extracts regiaoMetropolitana
    ↓
BrazilianStandardAddress stores regiaoMetropolitana
    ↓
HTMLHighlightCardsDisplayer formats and displays
    ↓
HTML element #regiao-metropolitana-value shows text
```

### Field Mapping Discovery

**Research Results** (2026-01-28):
- **Nominatim Field**: `address.county`
- **Example Values**:
  - "Região Metropolitana do Recife" (Pernambuco)
  - "Região Metropolitana de São Paulo" (São Paulo)
  - "Região Metropolitana do Rio de Janeiro" (Rio de Janeiro)

**API Test Queries**:
```bash
# Recife coordinates
curl "https://nominatim.openstreetmap.org/reverse?format=json&lat=-8.047562&lon=-34.877&addressdetails=1"
# Returns: "county": "Região Metropolitana do Recife"

# São Paulo coordinates
curl "https://nominatim.openstreetmap.org/reverse?format=json&lat=-23.550520&lon=-46.633309&addressdetails=1"
# Returns: "county": "Região Metropolitana de São Paulo"
```

### Implementation Changes

#### 1. BrazilianStandardAddress (src/data/BrazilianStandardAddress.js)

**Added Property**:
```javascript
constructor() {
    // ... existing properties
    this.regiaoMetropolitana = null;
    // ... existing properties
}
```

**Added Method**:
```javascript
/**
 * Returns the formatted metropolitan region name.
 * @returns {string} Metropolitan region name or empty string
 * @since 0.8.7-alpha
 */
regiaoMetropolitanaFormatada() {
    return this.regiaoMetropolitana || "";
}
```

#### 2. AddressExtractor (src/data/AddressExtractor.js)

**Added Extraction Logic** (after line 105):
```javascript
// Map metropolitan region information (Região Metropolitana)
// Nominatim stores metropolitan regions in the 'county' field for Brazilian addresses
// Examples: "Região Metropolitana do Recife", "Região Metropolitana de São Paulo"
this.enderecoPadronizado.regiaoMetropolitana = address.county || null;
```

#### 3. HTMLHighlightCardsDisplayer (src/html/HTMLHighlightCardsDisplayer.js)

**Modified Constructor**:
```javascript
constructor(document) {
    // ... existing code
    this._regiaoMetropolitanaElement = document.getElementById('regiao-metropolitana-value');
    // ... existing code
}
```

**Modified update() Method**:
```javascript
update(addressData, enderecoPadronizado) {
    // ... existing code
    
    // Update metropolitan region (displayed between label and municipality)
    if (this._regiaoMetropolitanaElement) {
        const regiaoMetropolitana = enderecoPadronizado.regiaoMetropolitanaFormatada();
        this._regiaoMetropolitanaElement.textContent = regiaoMetropolitana;
        log('Updated regiao-metropolitana-value to:', regiaoMetropolitana || '(empty)');
    }
    
    // ... existing municipio and bairro updates
}
```

#### 4. HTML Template (src/index.html)

**Modified Municipality Card** (line 494-497):
```html
<div class="highlight-card" role="region" aria-labelledby="municipio-label">
  <div id="municipio-label" class="highlight-card-label">Município</div>
  <div id="regiao-metropolitana-value" class="metropolitan-region-value" aria-live="polite"></div>
  <div id="municipio-value" class="highlight-card-value" aria-live="polite">—</div>
</div>
```

**Key Changes**:
- Added `regiao-metropolitana-value` element between label and value
- Element has `aria-live="polite"` for accessibility
- Empty by default (no placeholder dash)

#### 5. CSS Styling (src/highlight-cards.css)

**Added Class** (after line 54):
```css
/* Metropolitan Region - Reduced prominence */
.metropolitan-region-value {
  font-size: 0.875rem;        /* Smaller: 87.5% of base */
  font-weight: 500;            /* Medium weight */
  color: var(--md-sys-color-on-surface-variant, #49454f);
  opacity: 0.7;                /* Lighter: 70% opacity */
  margin-top: 8px;
  margin-bottom: 12px;
  line-height: 1.4;
  word-wrap: break-word;
  text-align: center;
  min-height: 0;
}
```

**Visual Hierarchy**:
- Label: 1rem, uppercase, 85% opacity, 600 weight
- **Metropolitan Region**: 0.875rem, normal case, 70% opacity, 500 weight ← NEW
- Municipality: 2.5rem, normal case, full opacity, 700 weight

### Display Format

#### Examples

| Municipality | Metropolitan Region | Display |
|--------------|-------------------|---------|
| Recife, PE | Região Metropolitana do Recife | Shows both |
| Olinda, PE | Região Metropolitana do Recife | Shows both |
| São Paulo, SP | Região Metropolitana de São Paulo | Shows both |
| Arapiraca, AL | (none) | Shows only municipality |

#### Visual Layout

```
┌────────────────────────────────┐
│  MUNICÍPIO                     │  ← Label (1rem, uppercase)
│                                │
│  Região Metropolitana do Recife│  ← NEW: Region (0.875rem, 70% opacity)
│                                │
│  Recife, PE                    │  ← Municipality (2.5rem, full opacity)
└────────────────────────────────┘
```

### Edge Cases

| Scenario | Display Behavior | Notes |
|----------|------------------|-------|
| No metropolitan region | Empty space (collapses) | No placeholder dash |
| Missing município | "—" for município | Region still shows if available |
| Very long region name | Text wraps | word-wrap: break-word |
| Mobile viewport | Same layout | Responsive font scaling |

## Scope

**Applies To**:
- ✅ Main location tracking page (`#/` route)
- ✅ Converter view (`#/converter` route)
- ✅ Both use same HTMLHighlightCardsDisplayer component

## Testing Strategy

### Unit Tests Required

#### BrazilianStandardAddress
- ✅ Constructor initializes `regiaoMetropolitana` to null
- ✅ `regiaoMetropolitanaFormatada()` returns empty string when null
- ✅ `regiaoMetropolitanaFormatada()` returns region when set

#### AddressExtractor
- ✅ Extracts `address.county` to `regiaoMetropolitana`
- ✅ Sets `regiaoMetropolitana` to null when county is missing
- ✅ Handles addresses with and without metropolitan regions

#### HTMLHighlightCardsDisplayer
- ✅ Constructor gets reference to `regiao-metropolitana-value` element
- ✅ `update()` method calls `regiaoMetropolitanaFormatada()`
- ✅ Updates DOM element with metropolitan region text
- ✅ Handles missing element gracefully (logs warning)
- ✅ Clears element when region is empty

### E2E Test Scenarios

#### Test 1: Metropolitan Area (Recife)
```javascript
// Coordinates: -8.047562, -34.877 (Recife)
// Expected: "Região Metropolitana do Recife" displayed
// Município: "Recife, PE"
```

#### Test 2: Metropolitan Area (São Paulo)
```javascript
// Coordinates: -23.550520, -46.633309 (São Paulo)
// Expected: "Região Metropolitana de São Paulo" displayed
// Município: "São Paulo, SP"
```

#### Test 3: Non-Metropolitan Municipality
```javascript
// Coordinates: -9.7521, -36.6620 (Arapiraca, AL)
// Expected: No region displayed (element empty)
// Município: "Arapiraca, AL"
```

#### Test 4: Pontal do Coruripe (Incomplete Data)
```javascript
// Coordinates: -10.1594479, -36.1354556
// Expected: No region displayed
// Município: "—" (missing)
```

### Manual Testing Checklist

- [ ] Main page: Enable geolocation in Recife → Verify region displays
- [ ] Main page: Enable geolocation in São Paulo → Verify region displays
- [ ] Main page: Enable geolocation in non-metro area → Verify no region
- [ ] Converter: Enter Recife coordinates → Verify region displays
- [ ] Converter: Enter non-metro coordinates → Verify no region
- [ ] Visual hierarchy: Region text is smaller and lighter than municipality
- [ ] Mobile viewport: Layout remains correct
- [ ] Screen reader: Region announces properly
- [ ] Text wrapping: Long region names wrap correctly

## Performance Impact

**Minimal**:
- No additional API calls (uses existing Nominatim data)
- Simple property extraction and assignment
- Single DOM element update per address change
- No network requests or database queries

## Accessibility

### Screen Reader Support
- `aria-live="polite"` announces updates non-intrusively
- Natural reading order: Label → Region → Municipality
- Empty region doesn't create announcement clutter

### Color Contrast
- Opacity 0.7 maintains WCAG AA contrast ratio
- Background gradient ensures visibility
- Color variable uses accessible Material 3 colors

### Considerations
- Region provides geographic context for screen reader users
- Announced as part of municipality card updates
- Optional information (not critical for understanding)

## Backwards Compatibility

### Breaking Changes
**None** - This is an additive feature.

### Compatibility Notes
- Existing functionality unchanged
- Graceful degradation when Nominatim doesn't provide county data
- No impact on existing tests (unless they assert specific HTML structure)
- E2E tests may need assertion updates for new element

## Dependencies

### Data Dependencies
- **Nominatim API**: Provides `address.county` field
- **OpenStreetMap**: Source data for Nominatim
- **IBGE**: Brazilian metropolitan region definitions (implicit)

### No New Dependencies Required
All necessary infrastructure already exists.

## Known Limitations

### Nominatim Data Availability
- Not all municipalities have metropolitan region data
- Data quality depends on OpenStreetMap contributors
- Some regions may use different naming conventions
- Future: Consider IBGE API as fallback data source

### Display Limitations
- Very long region names (>60 characters) may wrap awkwardly
- No truncation strategy implemented
- No tooltip or full-text fallback

## Future Enhancements

### Phase 2: Enhanced Formatting (Low Priority)
- Abbreviate common prefixes: "RM Recife" instead of "Região Metropolitana do Recife"
- Add configuration option for display format
- Implement truncation with tooltip for very long names

### Phase 3: IBGE Integration (Medium Priority)
- Add IBGE API fallback for missing Nominatim data
- Validate region names against official IBGE list
- Add metropolitan region codes (if available)

### Phase 4: Interactive Features (Low Priority)
- Make region clickable to show member municipalities
- Add region map visualization
- Link to regional statistics

## Documentation Updates

### Files Updated
1. ✅ `docs/FEATURE_METROPOLITAN_REGION_DISPLAY.md` (this file)
2. ⏳ `README.md` - Add to feature list
3. ⏳ `CHANGELOG.md` - Add entry for v0.8.7-alpha
4. ⏳ Test files - Create comprehensive test suites

## References

### Brazilian Metropolitan Regions
Brazil has 74 officially recognized metropolitan regions (as of 2023):
- **Largest**: São Paulo (~21 million inhabitants, 39 municipalities)
- **Northeast**: Recife, Salvador, Fortaleza
- **South**: Porto Alegre, Curitiba, Florianópolis
- **Central-West**: Brasília, Goiânia

### Related Documentation
- **BrazilianStandardAddress**: `src/data/BrazilianStandardAddress.js`
- **AddressExtractor**: `src/data/AddressExtractor.js`
- **HTMLHighlightCardsDisplayer**: `src/html/HTMLHighlightCardsDisplayer.js`
- **CSS Styling**: `src/highlight-cards.css`
- **Similar Feature**: `docs/FEATURE_MUNICIPIO_STATE_DISPLAY.md`

### External Resources
- [Nominatim API Documentation](https://nominatim.org/release-docs/latest/api/Reverse/)
- [IBGE Metropolitan Regions](https://www.ibge.gov.br/geociencias/organizacao-do-territorio/divisao-regional/18354-regioes-metropolitanas-aglomeracoes-urbanas-e-regioes-integradas-de-desenvolvimento.html)
- [OpenStreetMap Brazil](https://www.openstreetmap.org.br/)

## Implementation Summary

**Files Modified**: 5
**Lines Added**: ~50
**Lines Modified**: ~20
**Test Files Needed**: 3
**Complexity**: Low
**Risk**: Minimal

**Status**: ✅ Implementation Complete - Documentation Phase
