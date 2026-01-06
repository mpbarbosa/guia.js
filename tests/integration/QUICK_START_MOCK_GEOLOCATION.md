# Quick Start: MockGeolocationProvider

## TL;DR

**Yes, guia.js fully supports geolocation mocking!** Use the built-in `MockGeolocationProvider` class.

## 3 Steps to Get Started

### Step 1: Import Helper
```python
from mock_geolocation_helper import setup_mock_geolocation
```

### Step 2: Setup Mock in Your Test
```python
def test_my_location_feature(self):
    self.driver.get(f"{self.base_url}/index.html")
    
    # Setup mock geolocation
    setup_mock_geolocation(
        self.driver,
        latitude=-18.4696091,
        longitude=-43.4953982
    )
    
    # Continue with your test...
```

### Step 3: Click and Verify
```python
    # Trigger geolocation
    get_location_btn = self.driver.find_element(By.ID, "getLocationBtn")
    get_location_btn.click()
    
    # Verify results
    time.sleep(2)
    result = self.driver.find_element(By.ID, "locationResult")
    self.assertIn("Milho Verde", result.text)
```

## What's Included

| File | Purpose |
|------|---------|
| `mock_geolocation_helper.py` | Helper functions for setup/verification |
| `README_MOCK_GEOLOCATION.md` | Complete documentation and examples |
| `MOCK_GEOLOCATION_IMPLEMENTATION.md` | Implementation guide and migration path |
| `example_mock_geolocation_test.py` | Working example test |
| `QUICK_START_MOCK_GEOLOCATION.md` | This quick reference (you are here) |

## Key Functions

### setup_mock_geolocation(driver, latitude, longitude)
Sets up MockGeolocationProvider with specified coordinates.

**Returns:** `{'success': True/False, 'coordinates': {...}}`

### verify_mock_configuration(driver)
Verifies that the mock is properly configured.

**Returns:** `{'configured': True/False, 'position': {...}}`

### test_mock_provider_directly(driver)
Tests the mock provider in isolation (useful for debugging).

**Returns:** `{'success': True/False, 'latitude': ..., 'longitude': ...}`

## Example Test

```python
from mock_geolocation_helper import setup_mock_geolocation, verify_mock_configuration

class TestMyFeature(unittest.TestCase):
    def test_location_display(self):
        # Navigate
        self.driver.get(f"{self.base_url}/index.html")
        
        # Setup mock
        result = setup_mock_geolocation(
            self.driver,
            latitude=-18.4696091,
            longitude=-43.4953982
        )
        self.assertTrue(result['success'])
        
        # Verify
        verification = verify_mock_configuration(self.driver)
        self.assertTrue(verification['configured'])
        
        # Test your feature
        # ...
```

## Run Example

```bash
cd tests/integration
python3 example_mock_geolocation_test.py
```

## Why Use This?

| Old Approach | MockGeolocationProvider |
|--------------|-------------------------|
| ❌ Overrides browser API | ✅ Integrates with guia.js |
| ❌ Race conditions | ✅ No race conditions |
| ❌ Hard to debug | ✅ Easy to debug |
| ❌ Inconsistent results | ✅ Deterministic results |

## Common Issues

### Issue: "MockGeolocationProvider is not defined"
**Solution:** Wait for guia.js to load first:
```python
self.wait.until(
    lambda d: d.execute_script(
        "return typeof window.MockGeolocationProvider !== 'undefined'"
    )
)
```

### Issue: Mock not being used
**Solution:** Setup mock BEFORE clicking the location button:
```python
# ✅ Correct order
setup_mock_geolocation(driver, lat, lon)
get_location_btn.click()

# ❌ Wrong order
get_location_btn.click()
setup_mock_geolocation(driver, lat, lon)  # Too late!
```

### Issue: Coordinates not showing
**Solution:** Check console logs and verify mock:
```python
from firefox_console_capture import FirefoxConsoleCapture
console = FirefoxConsoleCapture(driver)
logs = console.get_logs()
print(logs)
```

## Next Steps

1. ✅ Read this Quick Start (you're here!)
2. 📖 Review `README_MOCK_GEOLOCATION.md` for details
3. 💻 Check `example_mock_geolocation_test.py` for working code
4. 🔧 Update your `test_milho_verde_geolocation.py`
5. 🧪 Run your tests!

## Support

- **Detailed Guide:** `README_MOCK_GEOLOCATION.md`
- **Helper Functions:** `mock_geolocation_helper.py`
- **Working Example:** `example_mock_geolocation_test.py`
- **Implementation Details:** `MOCK_GEOLOCATION_IMPLEMENTATION.md`

## Summary

MockGeolocationProvider is:
- ✅ Built into guia.js
- ✅ Ready to use
- ✅ Well documented
- ✅ Production tested

**Start using it today!** 🚀
