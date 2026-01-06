# Using MockGeolocationProvider for Selenium Tests

## Overview

The guia.js library includes a built-in `MockGeolocationProvider` class specifically designed for testing. This mock provider allows you to simulate geolocation behavior without relying on browser APIs or requiring user permission prompts.

## Benefits of Using MockGeolocationProvider

1. **Deterministic Testing**: Always returns the exact coordinates you specify
2. **No User Interaction**: Bypasses browser permission prompts
3. **Fast Execution**: No network delays or GPS acquisition time
4. **Reliable CI/CD**: Works consistently in headless environments
5. **Integrated Solution**: Already exposed through guia.js, no additional setup needed

## Architecture

The mock provider follows the same interface as `BrowserGeolocationProvider` but with controlled, predictable behavior:

```javascript
// The provider hierarchy
GeolocationProvider (base class)
  ├── BrowserGeolocationProvider (uses navigator.geolocation)
  └── MockGeolocationProvider (uses configured coordinates)
```

## How It Works

### 1. Class Availability

`MockGeolocationProvider` is exported globally when guia.js loads:

```javascript
// In guia.js
window.MockGeolocationProvider = MockGeolocationProvider;
```

This means it's available in any page that includes guia.js.

### 2. Integration with GeolocationService

`GeolocationService` accepts a provider through dependency injection:

```javascript
// GeolocationService constructor (simplified)
constructor(locationResult, geolocationProvider, positionManagerInstance, config = {}) {
    // If provider is passed, use it; otherwise create BrowserGeolocationProvider
    this.provider = geolocationProvider || new BrowserGeolocationProvider(navigator);
}
```

### 3. Integration with WebGeocodingManager

`WebGeocodingManager` accepts a `geolocationService` in params:

```javascript
// WebGeocodingManager constructor (simplified)
constructor(document, params) {
    // If geolocationService is provided, use it; otherwise create default
    this.geolocationService = params.geolocationService ||
        new GeolocationService(this.locationResult);
}
```

## Implementation for test_milho_verde_geolocation.py

### Option 1: JavaScript Injection (Recommended)

Inject the mock setup before the page initializes the WebGeocodingManager:

```python
def _setup_mock_geolocation(self):
    """
    Set up MockGeolocationProvider before page initialization.
    This must be called before navigating to the page or before
    the page initializes WebGeocodingManager.
    """
    mock_setup_script = f"""
    // Create mock position object
    window.mockPosition = {{
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
    
    // Create MockGeolocationProvider with the position
    window.mockProvider = new window.MockGeolocationProvider({{
        defaultPosition: window.mockPosition,
        delay: 100  // Small delay to simulate async behavior
    }});
    
    // Create GeolocationService with the mock provider
    window.mockGeolocationService = new window.GeolocationService(
        null,  // locationResult element
        window.mockProvider,  // Our mock provider
        null,  // Use default PositionManager
        {{}}   // Default config
    );
    
    console.log('[TEST] Mock geolocation setup complete');
    console.log('[TEST] Mock will return:', window.mockPosition.coords.latitude, window.mockPosition.coords.longitude);
    """
    
    self.driver.execute_script(mock_setup_script)
```

### Option 2: Custom HTML Page

Create a test HTML page that uses the mock provider from the start:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test - Milho Verde Geolocation</title>
    <script type="module">
        import { MockGeolocationProvider, GeolocationService, WebGeocodingManager } from './src/guia.js';
        
        // Test coordinates for Milho Verde
        const TEST_POSITION = {
            coords: {
                latitude: -18.4696091,
                longitude: -43.4953982,
                accuracy: 10,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null
            },
            timestamp: Date.now()
        };
        
        // Create mock provider
        const mockProvider = new MockGeolocationProvider({
            defaultPosition: TEST_POSITION,
            delay: 100
        });
        
        // Create service with mock provider
        const locationResult = document.getElementById('locationResult');
        const mockService = new GeolocationService(
            locationResult,
            mockProvider
        );
        
        // Create manager with mock service
        const manager = new WebGeocodingManager(document, {
            locationResult: 'locationResult',
            geolocationService: mockService
        });
        
        // Make manager available globally for testing
        window.testManager = manager;
    </script>
</head>
<body>
    <div id="locationResult"></div>
    <button id="getLocationBtn" onclick="window.testManager.startGeolocation()">
        Get Location
    </button>
</body>
</html>
```

### Option 3: Override Existing Page (Pre-initialization)

If you need to use the existing index.html, inject the mock before the page loads its scripts:

```python
def test_with_pre_initialization_mock(self):
    """Test using mock injected before page script execution."""
    
    # Navigate to page
    self.driver.get(f"{self.base_url}/index.html")
    
    # Wait for guia.js to load
    self.wait.until(
        lambda driver: driver.execute_script(
            "return typeof window.MockGeolocationProvider !== 'undefined'"
        )
    )
    
    # Now inject the mock BEFORE the page initializes its manager
    mock_injection = f"""
    // Store reference to original GeolocationService
    window._OriginalGeolocationService = window.GeolocationService;
    
    // Override GeolocationService constructor to use mock
    window.GeolocationService = function(locationResult, provider, pm, config) {{
        // If no provider specified, use mock instead of browser
        if (!provider) {{
            const mockPosition = {{
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
            
            provider = new window.MockGeolocationProvider({{
                defaultPosition: mockPosition,
                delay: 100
            }});
            
            console.log('[TEST] Auto-injected MockGeolocationProvider');
        }}
        
        // Call original constructor with our provider
        return new window._OriginalGeolocationService(locationResult, provider, pm, config);
    }};
    
    // Copy static methods if any
    Object.setPrototypeOf(window.GeolocationService, window._OriginalGeolocationService);
    window.GeolocationService.prototype = window._OriginalGeolocationService.prototype;
    """
    
    self.driver.execute_script(mock_injection)
    
    # Now continue with your test
    get_location_btn = self.wait.until(
        EC.element_to_be_clickable((By.ID, "getLocationBtn"))
    )
    get_location_btn.click()
```

## Complete Example for test_milho_verde_geolocation.py

Here's how to modify your existing test to use MockGeolocationProvider:

```python
def _setup_guia_mock_geolocation(self):
    """
    Use guia.js built-in MockGeolocationProvider for testing.
    More reliable than browser navigator.geolocation override.
    """
    # Wait for guia.js to be fully loaded
    self.wait.until(
        lambda driver: driver.execute_script(
            "return typeof window.MockGeolocationProvider !== 'undefined' && "
            "typeof window.GeolocationService !== 'undefined' && "
            "typeof window.WebGeocodingManager !== 'undefined'"
        )
    )
    
    # Create and configure mock provider
    mock_setup = f"""
    // Create mock position
    window.TEST_POSITION = {{
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
    
    // Create mock provider
    window.TEST_MOCK_PROVIDER = new window.MockGeolocationProvider({{
        defaultPosition: window.TEST_POSITION,
        supported: true,
        delay: 100
    }});
    
    // Override the global GeolocationService to use our mock
    window._OriginalGeolocationService = window.GeolocationService;
    window.GeolocationService = function(locationResult, provider, pm, config) {{
        // Always use our test mock provider
        return new window._OriginalGeolocationService(
            locationResult,
            window.TEST_MOCK_PROVIDER,
            pm,
            config
        );
    }};
    
    // Maintain prototype chain
    window.GeolocationService.prototype = window._OriginalGeolocationService.prototype;
    
    console.log('[TEST] MockGeolocationProvider configured successfully');
    console.log('[TEST] Will return coordinates:', window.TEST_POSITION.coords);
    
    return true;
    """
    
    result = self.driver.execute_script(mock_setup)
    if not result:
        raise Exception("Failed to configure MockGeolocationProvider")
    
    print("[TEST] MockGeolocationProvider configured for Milho Verde coordinates")

def test_02_mock_provider_configuration(self):
    """Verify MockGeolocationProvider is properly configured."""
    self.driver.get(f"{self.base_url}/index.html")
    
    # Setup mock
    self._setup_guia_mock_geolocation()
    
    # Verify mock is configured
    verification = self.driver.execute_script("""
        return {
            providerExists: typeof window.TEST_MOCK_PROVIDER !== 'undefined',
            isSupported: window.TEST_MOCK_PROVIDER ? window.TEST_MOCK_PROVIDER.isSupported() : false,
            hasPosition: typeof window.TEST_POSITION !== 'undefined',
            latitude: window.TEST_POSITION ? window.TEST_POSITION.coords.latitude : null,
            longitude: window.TEST_POSITION ? window.TEST_POSITION.coords.longitude : null
        };
    """)
    
    self.assertTrue(verification['providerExists'], "Mock provider should exist")
    self.assertTrue(verification['isSupported'], "Mock provider should be supported")
    self.assertEqual(verification['latitude'], self.TEST_LATITUDE)
    self.assertEqual(verification['longitude'], self.TEST_LONGITUDE)

def test_03_coordinates_with_mock_provider(self):
    """Test that mock provider returns correct coordinates."""
    self.driver.get(f"{self.base_url}/index.html")
    
    # Setup mock
    self._setup_guia_mock_geolocation()
    
    # Trigger geolocation
    get_location_btn = self.wait.until(
        EC.element_to_be_clickable((By.ID, "getLocationBtn"))
    )
    get_location_btn.click()
    
    # Wait for position to be processed
    time.sleep(2)
    
    # Verify coordinates are displayed
    location_result = self.driver.find_element(By.ID, "locationResult")
    result_text = location_result.text.lower()
    
    # Should contain the test coordinates
    self.assertTrue(
        str(self.TEST_LATITUDE) in result_text or 
        "milho verde" in result_text or
        "serro" in result_text,
        f"Result should contain location info, got: {result_text}"
    )
```

## Testing the Mock Provider Directly

You can test the mock provider independently:

```python
def test_mock_provider_direct(self):
    """Test MockGeolocationProvider directly via JavaScript."""
    self.driver.get(f"{self.base_url}/index.html")
    
    result = self.driver.execute_async_script(f"""
        const done = arguments[0];
        
        // Wait for guia.js to load
        if (typeof window.MockGeolocationProvider === 'undefined') {{
            done({{error: 'MockGeolocationProvider not loaded'}});
            return;
        }}
        
        // Create mock position
        const mockPosition = {{
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
        
        // Create mock provider
        const provider = new window.MockGeolocationProvider({{
            defaultPosition: mockPosition,
            delay: 100
        }});
        
        // Test getCurrentPosition
        provider.getCurrentPosition(
            (position) => {{
                done({{
                    success: true,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                }});
            }},
            (error) => {{
                done({{success: false, error: error.message}});
            }},
            {{}}
        );
    """)
    
    self.assertTrue(result['success'], f"Mock provider test failed: {result}")
    self.assertAlmostEqual(result['latitude'], self.TEST_LATITUDE, places=6)
    self.assertAlmostEqual(result['longitude'], self.TEST_LONGITUDE, places=6)
```

## Advantages Over navigator.geolocation Override

### Old Approach (Current):
```javascript
// Overrides browser API
navigator.geolocation.getCurrentPosition = function(success, error) {
    // Custom implementation
};
```

**Problems:**
- May not work consistently across browsers
- Doesn't integrate with guia.js architecture
- Can conflict with page initialization
- Hard to debug when issues occur

### New Approach (MockGeolocationProvider):
```javascript
// Uses guia.js provider pattern
const mockProvider = new MockGeolocationProvider({ defaultPosition });
const service = new GeolocationService(element, mockProvider);
```

**Benefits:**
- Works with guia.js's dependency injection
- Type-safe and well-documented
- Easy to configure and debug
- Designed specifically for testing

## Debugging Tips

### 1. Verify Library Loading
```python
is_loaded = self.driver.execute_script("""
    return {
        mockProvider: typeof window.MockGeolocationProvider !== 'undefined',
        geoService: typeof window.GeolocationService !== 'undefined',
        manager: typeof window.WebGeocodingManager !== 'undefined'
    };
""")
print(f"Library loaded: {is_loaded}")
```

### 2. Check Mock Configuration
```python
config = self.driver.execute_script("""
    if (!window.TEST_MOCK_PROVIDER) return null;
    return {
        isSupported: window.TEST_MOCK_PROVIDER.isSupported(),
        hasPosition: !!window.TEST_MOCK_PROVIDER.config.defaultPosition,
        position: window.TEST_MOCK_PROVIDER.config.defaultPosition
    };
""")
print(f"Mock config: {config}")
```

### 3. Monitor Console Logs
Use the existing `FirefoxConsoleCapture` to see mock initialization:
```python
console = FirefoxConsoleCapture(self.driver)
self._setup_guia_mock_geolocation()
logs = console.get_logs()
print(f"Console logs: {logs}")
```

## Summary

Using `MockGeolocationProvider` provides:
1. ✅ Integration with guia.js architecture
2. ✅ Predictable, deterministic behavior
3. ✅ No browser permission prompts
4. ✅ Fast, reliable testing
5. ✅ Works in CI/CD environments
6. ✅ Easy to configure and debug

Replace the current `_mock_geolocation()` method with `_setup_guia_mock_geolocation()` for more reliable tests.
