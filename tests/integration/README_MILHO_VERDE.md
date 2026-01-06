# Milho Verde, Serro, MG - Selenium Integration Test

## Overview

This Selenium integration test validates the complete geolocation workflow for a specific real-world location in Brazil:

**Location**: Milho Verde, Serro, Minas Gerais, Brasil  
**Coordinates**: Latitude -18.4696091, Longitude -43.4953982  
**Expected Address**: Camping Nozinho, 172, Rua Direita, Milho Verde, Serro, MG, 39150-000

## Test Coverage

The test suite includes **12 comprehensive tests** across two test classes:

### TestMilhoVerdeGeolocation (Main Test Class)

1. **test_01_page_loads_successfully** - Verifies index page loads with all required elements
2. **test_02_geolocation_mock_works** - Tests geolocation mocking functionality
3. **test_03_coordinates_display_correctly** - Validates coordinate display for Milho Verde
4. **test_04_address_converter_with_milho_verde_coordinates** - Tests address converter with specific coordinates
5. **test_05_address_components_validation** - Validates all Brazilian address components are extracted
6. **test_06_minas_gerais_state_validation** - Ensures Minas Gerais state is correctly identified
7. **test_07_brazilian_postal_code_format** - Tests CEP (Brazilian postal code) format recognition
8. **test_08_error_handling_invalid_coordinates** - Tests error handling with invalid input
9. **test_09_responsive_design_mobile_viewport** - Validates mobile responsiveness
10. **test_10_location_result_persistence** - Tests that results persist across interactions

### TestMilhoVerdeAccessibility (Accessibility Test Class)

11. **test_keyboard_navigation** - Tests keyboard accessibility of interactive elements
12. **test_aria_labels_present** - Validates ARIA labels and accessible names

## Test Features

### Geolocation Mocking
Uses JavaScript injection to mock geolocation:
```python
def _mock_geolocation(self):
    geolocation_script = f"""
    navigator.geolocation.getCurrentPosition = function(success) {{
        var position = {{
            coords: {{
                latitude: {self.TEST_LATITUDE},
                longitude: {self.TEST_LONGITUDE},
                accuracy: 10,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null
            }},
            timestamp: Date.now()
        }};
        success(position);
    }};
    """
    self.driver.execute_script(geolocation_script)
```

### Best Practices Implemented

1. **Page Object Pattern** - Helper methods for common interactions
2. **Explicit Waits** - WebDriverWait for reliable element interaction
3. **Error Handling** - Graceful handling of missing Firefox/GeckoDriver
4. **Multiple Viewports** - Tests both desktop (1920x1080) and mobile (375x667)
5. **Accessibility Testing** - Keyboard navigation and ARIA validation
6. **Responsive Design** - Mobile viewport testing
7. **API Integration** - Tests OpenStreetMap address resolution
8. **Brazilian Address Format** - Validates CEP, state codes, and address components

### Firefox Preferences Configured

- **Geolocation Permission**: Automatically granted
- **Geo Prompt Testing**: Enables geolocation mocking
- **Notifications Disabled**: Prevents interruptions
- **Cache Disabled**: For consistent test behavior
- **Fixed Window Size**: Consistent rendering (1920x1080)

## Prerequisites

### System Requirements
```bash
# Firefox browser
sudo apt-get install firefox

# GeckoDriver (automatically managed by Selenium)
# Or download manually from:
# https://github.com/mozilla/geckodriver/releases
```

### Python Dependencies
```bash
pip install selenium
```

Already installed in the virtual environment at `tests/integration/venv/`

## Running the Tests

### Run All Milho Verde Tests
```bash
cd tests/integration
python3 test_milho_verde_geolocation.py -v
```

### Run Specific Test Class
```bash
# Main geolocation tests
python3 test_milho_verde_geolocation.py TestMilhoVerdeGeolocation -v

# Accessibility tests only
python3 test_milho_verde_geolocation.py TestMilhoVerdeAccessibility -v
```

### Run Single Test
```bash
python3 test_milho_verde_geolocation.py TestMilhoVerdeGeolocation.test_04_address_converter_with_milho_verde_coordinates -v
```

### Run with Test Discovery
```bash
cd tests/integration
python3 -m unittest discover -s . -p "test_milho_verde*.py" -v
```

### Run All Integration Tests
```bash
cd tests/integration
./run_tests.sh
```

## Expected Test Results

When Firefox and GeckoDriver are properly configured:
- All 12 tests should pass or skip gracefully
- Tests that depend on OpenStreetMap API may take 5-10 seconds
- Total execution time: ~60-90 seconds

If Firefox/GeckoDriver is not available:
- Tests will skip with message: "Firefox WebDriver not available"
- Exit code: 0 (success with skipped tests)

## Debugging

### Enable Visual Browser (Disable Headless)
In the test file, the headless mode is already commented out for debugging:
```python
# firefox_options.add_argument("--headless")  # Already commented
```

### Add Breakpoints
```python
import pdb; pdb.set_trace()  # Add before failing test
```

### Increase Timeouts
Adjust wait timeouts for slow connections:
```python
cls.wait_timeout = 30  # Default: 20
cls.long_wait_timeout = 60  # Default: 30
```

### Check Console Logs
```python
# Get browser console logs
logs = self.driver.get_log('browser')
print(logs)
```

## Test Data Validation

The test validates the following expected data:

### Coordinates
- Latitude: -18.4696091
- Longitude: -43.4953982
- Region: Minas Gerais bounds (lat -14 to -23, lon -39 to -51)

### Address Components
- Street: Rua Direita
- Number: 172
- District: Milho Verde
- City: Serro
- State: Minas Gerais
- State Code: MG
- Postal Code (CEP): 39150-000
- Country: Brasil
- Reference Place: Camping Nozinho (tourism, camp_site)

### API Integration
- OpenStreetMap Nominatim API for reverse geocoding
- Response time: 3-6 seconds typical
- Fallback: Tests validate error handling if API fails

## Relationship to Other Tests

This Selenium test complements:

1. **E2E Tests** (`tests/e2e/MilhoVerde-SerroMG.e2e.test.js`)
   - Jest-based unit/integration tests
   - Tests data processing without browser
   - 18 tests covering API mocking and data validation

2. **Unit Tests** (`tests/unit/`)
   - Pure function testing
   - No DOM or API dependencies
   - Fast execution (<1 second)

3. **Integration Tests** (`tests/integration/`)
   - Browser-based UI testing
   - Real geolocation and API calls
   - End-to-end user workflows

## Common Issues

### Issue: "no firefox binary at /usr/bin/firefox"
**Solution**: Install Firefox or set `FIREFOX_BIN` environment variable
```bash
export FIREFOX_BIN=/usr/bin/firefox-esr
```

### Issue: "geckodriver executable needs to be in PATH"
**Solution**: Selenium automatically downloads GeckoDriver, or install manually
```bash
# Selenium will auto-download, or install manually:
wget https://github.com/mozilla/geckodriver/releases/latest/download/geckodriver-linux64.tar.gz
tar -xzf geckodriver-linux64.tar.gz
sudo mv geckodriver /usr/local/bin/
```

### Issue: "Message: unknown error: Firefox failed to start"
**Solution**: Check Firefox is installed and permissions are correct
```bash
firefox --version
which firefox
```

### Issue: Tests timeout waiting for address
**Solution**: Increase timeout or check network connectivity
```python
self.long_wait_timeout = 60  # Increase from 30
```

### Issue: Geolocation permission denied
**Solution**: Verify Firefox preferences are set correctly
```python
firefox_options.set_preference("geo.prompt.testing", True)
firefox_options.set_preference("geo.prompt.testing.allow", True)
```

## Contributing

When adding new location-based tests:

1. Use real coordinates from OpenStreetMap
2. Verify expected address data beforehand
3. Include timeout handling for API calls
4. Test both success and error scenarios
5. Validate accessibility features
6. Test responsive design (mobile viewport)
7. Follow the naming pattern: `test_<location>_geolocation.py`

## References

- **Selenium Documentation**: https://selenium-python.readthedocs.io/
- **GeckoDriver**: https://github.com/mozilla/geckodriver
- **OpenStreetMap Nominatim**: https://nominatim.openstreetmap.org/
- **WebDriver Best Practices**: https://www.selenium.dev/documentation/test_practices/
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

## Test Maintenance

- **Update frequency**: When UI changes affect geolocation workflow
- **Data validation**: Verify address data if OpenStreetMap updates
- **Firefox updates**: Update GeckoDriver when Firefox updates
- **Timeout adjustments**: May need adjustment based on network conditions
