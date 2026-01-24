# Feature: Município with State Abbreviation Display

## Overview
Display the state abbreviation alongside the município name in the highlight card to provide better geographic context to users.

**Version**: 0.8.7-alpha  
**Date**: 2026-01-24  
**Author**: Marcelo Pereira Barbosa

## Motivation

### Problem
Currently, the município highlight card displays only the municipality name (e.g., "Recife"). This can be ambiguous since:
- Multiple municipalities may share the same name across different states
- Users may not be familiar with the geographic location without state context
- The display lacks complete geographic identification

### Solution
Display the município name with its state abbreviation in the format: `"<Name of Município>, <State abbreviation>"` (e.g., "Recife, PE").

## Technical Implementation

### Data Flow

```
Nominatim API Response
    ↓
AddressExtractor extracts siglaUF
    ↓
BrazilianStandardAddress stores siglaUF
    ↓
HTMLHighlightCardsDisplayer formats display
    ↓
HTML element #municipio-value shows "Recife, PE"
```

### Key Components

#### 1. BrazilianStandardAddress (src/data/BrazilianStandardAddress.js)
**Already exists** - Provides `municipioCompleto()` method:
```javascript
municipioCompleto() {
    if (!this.municipio) return "";
    if (this.siglaUF) {
        return `${this.municipio}, ${this.siglaUF}`;
    }
    return this.municipio;
}
```

**Properties**:
- `municipio`: Municipality name (e.g., "Recife")
- `siglaUF`: Two-letter state abbreviation (e.g., "PE")

#### 2. AddressExtractor (src/data/AddressExtractor.js)
**Already exists** - Extracts state abbreviation from Nominatim response:
```javascript
this.enderecoPadronizado.siglaUF = 
    address.state_code || 
    AddressExtractor.extractSiglaUF(address['ISO3166-2-lvl4']) || 
    null;
```

#### 3. HTMLHighlightCardsDisplayer (src/html/HTMLHighlightCardsDisplayer.js)
**Needs update** - Change from using `municipio` property to `municipioCompleto()` method:

**Before**:
```javascript
const municipio = enderecoPadronizado.municipio || '—';
this._municipioElement.textContent = municipio;
```

**After**:
```javascript
const municipio = enderecoPadronizado.municipioCompleto() || '—';
this._municipioElement.textContent = municipio;
```

### Implementation Changes

**File**: `src/html/HTMLHighlightCardsDisplayer.js`

**Line 59-60**: Replace direct property access with method call

**Change**:
```diff
- const municipio = enderecoPadronizado.municipio || '—';
+ const municipio = enderecoPadronizado.municipioCompleto() || '—';
```

**Reasoning**:
- `municipioCompleto()` already handles the formatting logic
- Maintains separation of concerns (formatting logic in data class)
- Falls back to município name only if siglaUF is not available
- Returns empty string if município is null (handled by `|| '—'`)

## Display Format

### Examples

| Município | State | Display |
|-----------|-------|---------|
| Recife | PE | "Recife, PE" |
| São Paulo | SP | "São Paulo, SP" |
| Belo Horizonte | MG | "Belo Horizonte, MG" |
| Rio de Janeiro | RJ | "Rio de Janeiro, RJ" |

### Edge Cases

| Scenario | Display | Notes |
|----------|---------|-------|
| No município | "—" | Placeholder dash |
| Município without state | "Recife" | Shows município only |
| Empty enderecoPadronizado | "—" | Placeholder dash |
| Null enderecoPadronizado | (no update) | Function returns early |

## Testing Strategy

### Unit Tests
Create `__tests__/html/HTMLHighlightCardsDisplayer.test.js`:

**Test Cases**:
1. ✅ Display município with state abbreviation
2. ✅ Display município without state abbreviation (fallback)
3. ✅ Display placeholder when município is null
4. ✅ Handle null enderecoPadronizado gracefully
5. ✅ Verify municipioCompleto() method is called

### Integration Tests
Update existing E2E tests:

**Files to Update**:
- `__tests__/e2e/municipio-bairro-display.e2e.test.js`
- `__tests__/e2e/municipio-bairro-simple.e2e.test.js`

**Expected Changes**:
- Assertions expecting "Arapiraca" should now expect "Arapiraca, AL"
- Assertions expecting "São Paulo" should now expect "São Paulo, SP"

### Manual Testing Scenarios

1. **Normal Flow**:
   - Navigate to home page
   - Click "Obter Localização"
   - Grant geolocation permission
   - Verify município card shows "City, ST" format

2. **Converter View**:
   - Navigate to converter (`#/converter`)
   - Enter coordinates: `-9.7521`, `-36.6620` (Arapiraca, AL)
   - Click "Converter para Endereço"
   - Verify município card shows "Arapiraca, AL"

3. **State Change**:
   - Test with coordinates from different states
   - Verify state abbreviation updates correctly

## Backwards Compatibility

### Breaking Changes
**None** - This is an additive change that enhances the display format.

### Compatibility Notes
- Falls back to município name only if state is unavailable
- Existing code expecting município text will still work
- E2E tests need assertion updates to match new format

## Dependencies

### Data Dependencies
- **siglaUF extraction**: Already implemented in AddressExtractor
- **Nominatim API**: Already provides state_code and ISO3166-2-lvl4
- **BrazilianStandardAddress**: Already has municipioCompleto() method

### No New Dependencies Required
All necessary infrastructure already exists.

## Performance Impact

**Minimal** - No additional API calls or processing required:
- Uses existing data extraction
- Simple string concatenation
- No database queries
- No network requests

## Accessibility

### Screen Reader Improvements
State abbreviation provides better context for screen reader users:
- Before: "Município: Recife"
- After: "Município: Recife, PE"

### Considerations
- Consider adding aria-label with full state name for clarity
- Example: `aria-label="Município: Recife, Pernambuco"`

## Future Enhancements

1. **Full State Names** (Low Priority):
   - Add option to toggle between abbreviation and full state name
   - Example: "Recife, Pernambuco" instead of "Recife, PE"

2. **State Flag Icons** (Low Priority):
   - Display small state flag icon next to abbreviation
   - Enhances visual recognition

3. **Clickable State Links** (Medium Priority):
   - Make state abbreviation clickable
   - Link to state-specific information page

## Documentation Updates

### Files to Update
1. ✅ `docs/FEATURE_MUNICIPIO_STATE_DISPLAY.md` (this file)
2. ✅ `README.md` - Add to feature list
3. ✅ `CHANGELOG.md` - Add entry for v0.8.7-alpha

## Rollout Plan

### Phase 1: Implementation ✅
- Update HTMLHighlightCardsDisplayer
- Add unit tests
- Validate syntax

### Phase 2: Testing
- Run existing test suite
- Update E2E test assertions
- Manual testing in browser

### Phase 3: Documentation
- Update README.md
- Update CHANGELOG.md
- Add inline code documentation

### Phase 4: Release
- Commit changes
- Tag version 0.8.7-alpha
- Update version in package.json

## References

- **BrazilianStandardAddress**: `src/data/BrazilianStandardAddress.js`
- **AddressExtractor**: `src/data/AddressExtractor.js`
- **HTMLHighlightCardsDisplayer**: `src/html/HTMLHighlightCardsDisplayer.js`
- **Brazilian State Codes**: ISO 3166-2:BR standard
