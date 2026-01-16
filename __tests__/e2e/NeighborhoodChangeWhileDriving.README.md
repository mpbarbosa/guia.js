# Neighborhood Change While Driving - E2E Test

## Purpose

This test validates that the **bairro (neighborhood) card updates correctly** when a user is driving through different neighborhoods in a city. This addresses a production bug where the bairro card wasn't updating when crossing neighborhood boundaries.

## Test Scenario

The test simulates a user driving through São Paulo, Brazil, visiting four different neighborhoods:

1. **República** (Centro - Start Point)
   - Latitude: -23.550520, Longitude: -46.633309

2. **Jardim Paulista** (Jardins)
   - Latitude: -23.565209, Longitude: -46.664850

3. **Vila Mariana**
   - Latitude: -23.587370, Longitude: -46.636040

4. **Moema**
   - Latitude: -23.606230, Longitude: -46.663770

## What Is Being Tested

### Core Functionality
- ✅ Bairro card displays initial neighborhood on app load
- ✅ Bairro card updates when position changes to new neighborhood
- ✅ Multiple sequential neighborhood changes work correctly
- ✅ Bairro card element exists and is visible
- ✅ Address display includes bairro information
- ✅ Updates persist across rapid position changes

### Technical Components
- **HTMLHighlightCardsDisplayer** receives addressData updates
- **Observer Pattern** propagates address changes correctly
- **ReverseGeocoder** passes complete parameters to observers
- **Change Detection** triggers on neighborhood boundaries
- **DOM Updates** reflect new bairro values

## Test Implementation

### Infrastructure
- **Puppeteer** - Headless browser automation
- **Local HTTP Server** - Serves application on port 9877
- **Mock Nominatim API** - Intercepts and mocks geocoding responses
- **Mock Geolocation** - Simulates GPS position updates

### Test Cases (8 total)

1. **Initial Display Test**
   - Validates bairro shows on first geolocation
   - Expected: "República" displayed in bairro card

2. **Single Move Test**  
   - Simulates moving from República to Jardim Paulista
   - Validates card updates to new neighborhood
   - Expected: Card changes from "República" to "Jardim Paulista"

3. **Multiple Moves Test**
   - Drives through all 4 neighborhoods in sequence
   - Validates each transition
   - Expected: 4 different bairro values in correct order

4. **Element Visibility Test**
   - Checks bairro card DOM element exists
   - Validates element is visible (not display:none)

5. **Address Display Integration**
   - Checks endereco-padronizado-display includes bairro
   - Validates complete address formatting

6. **Rapid Changes Test**
   - Simulates rapid position updates (like driving)
   - Validates final state is consistent

7. **Observer Pattern Test**
   - Monitors observer notification calls
   - Validates at least 2 notifications occur

8. **Loading State Test**
   - Checks for loading indicators during geocoding
   - Validates final state after loading completes

## Running The Test

```bash
# Run just this test file
npm test -- __tests__/e2e/NeighborhoodChangeWhileDriving.e2e.test.js

# Run with verbose output
npm run test:verbose -- __tests__/e2e/NeighborhoodChangeWhileDriving.e2e.test.js

# Run all E2E tests
npm test -- __tests__/e2e/
```

## Expected Results

All 8 tests should pass:
```
✓ should display initial neighborhood (República) on app load (30s)
✓ should update bairro card when driving to Jardins (30s)
✓ should update bairro card through multiple neighborhood changes (45s)
✓ should have visible bairro card element (15s)
✓ should include bairro in endereco-padronizado-display (30s)
✓ should maintain bairro update consistency across rapid position changes (45s)
✓ should propagate neighborhood changes through observer pattern (30s)
✓ should show loading state while geocoding new location (30s)
```

## Common Issues

### Test Timeouts
- **Cause**: Puppeteer takes time to launch browser
- **Solution**: `beforeAll` has 30 second timeout
- **Individual tests**: Have appropriate timeouts (15s-45s)

### Port Conflicts
- **Port**: Test uses port 9877
- **Check**: `lsof -i :9877` to find conflicts
- **Solution**: Kill conflicting process or change PORT constant

### Headless Browser Issues
- **Args**: Uses `--no-sandbox`, `--disable-setuid-sandbox`, `--disable-dev-shm-usage`
- **Puppeteer version**: v24.34.0
- **Mode**: `headless: 'new'` (new headless mode)

### Mock API Not Intercepting
- **Setup**: `page.setRequestInterception(true)` before navigation
- **Pattern**: Matches `nominatim.openstreetmap.org/reverse`
- **Validation**: Check console logs for request interception

## Bug Context

### Production Issue
In production, when driving through São Paulo:
- Initial bairro loaded correctly
- Position updates occurred (coordinates changed)
- Geocoding completed successfully
- **BUT**: Bairro card didn't update with new neighborhood name

### Root Cause Investigation
This test helps identify if the issue is:
1. ❌ ReverseGeocoder not passing addressData to observers?
2. ❌ HTMLHighlightCardsDisplayer not receiving updates?
3. ❌ Observer pattern not triggering on position change?
4. ❌ DOM updates not reflecting new bairro value?
5. ❌ Change detection not working for bairro field?

### Fix Validation
Once the bug is fixed, this test suite will:
- ✅ Prevent regression of the fix
- ✅ Document expected behavior
- ✅ Validate all neighborhood transitions work
- ✅ Ensure observer pattern works correctly

## Related Files

- **Source**: `src/html/HTMLHighlightCardsDisplayer.js`
- **Source**: `src/services/ReverseGeocoder.js`
- **Source**: `src/coordination/WebGeocodingManager.js`
- **Tests**: `__tests__/e2e/municipio-bairro-display.e2e.test.js` (similar test)
- **Tests**: `__tests__/e2e/municipio-bairro-simple.e2e.test.js` (simple test)

## Integration With CI/CD

This test is part of the E2E test suite:
- Runs during `npm test` (all tests)
- Can be run individually for debugging
- Part of pre-commit validation (if enabled)
- Validates production-like scenarios

## Future Enhancements

Potential improvements:
1. Add tests for more cities (Rio, Brasília, Belo Horizonte)
2. Test edge cases (undefined bairro, rural areas)
3. Add performance metrics (update latency)
4. Test with real Nominatim API (optional integration test)
5. Add visual regression testing (screenshot comparison)

---

**Last Updated**: 2026-01-15  
**Test Version**: 1.0.0  
**Status**: Active
