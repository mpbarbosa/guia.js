"""
Helper functions for using MockGeolocationProvider in Selenium tests.

This module provides utility functions to configure and use the guia.js 
MockGeolocationProvider in integration tests, replacing the need for 
navigator.geolocation overrides.

Usage:
    from mock_geolocation_helper import setup_mock_geolocation
    
    # In your test
    setup_mock_geolocation(driver, latitude=-18.4696091, longitude=-43.4953982)
"""

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def wait_for_guia_library(driver, timeout=10):
    """
    Wait for guia.js library to be fully loaded.
    
    Args:
        driver: Selenium WebDriver instance
        timeout: Maximum wait time in seconds
        
    Returns:
        bool: True if library loaded successfully
        
    Raises:
        TimeoutException: If library doesn't load within timeout
    """
    wait = WebDriverWait(driver, timeout)
    
    is_loaded = wait.until(
        lambda d: d.execute_script("""
            return typeof window.MockGeolocationProvider !== 'undefined' && 
                   typeof window.GeolocationService !== 'undefined' && 
                   typeof window.WebGeocodingManager !== 'undefined';
        """)
    )
    
    return is_loaded


def setup_mock_geolocation(driver, latitude, longitude, accuracy=10, delay=100):
    """
    Configure MockGeolocationProvider for testing.
    
    This function sets up the guia.js MockGeolocationProvider to return
    specific coordinates instead of using the browser's geolocation API.
    
    Args:
        driver: Selenium WebDriver instance
        latitude: Test latitude coordinate
        longitude: Test longitude coordinate
        accuracy: Position accuracy in meters (default: 10)
        delay: Simulated async delay in ms (default: 100)
        
    Returns:
        dict: Configuration result with status and details
        
    Example:
        result = setup_mock_geolocation(
            driver, 
            latitude=-18.4696091, 
            longitude=-43.4953982
        )
        if result['success']:
            print(f"Mock configured: {result['coordinates']}")
    """
    # Wait for library to load
    if not wait_for_guia_library(driver):
        return {
            'success': False,
            'error': 'guia.js library not loaded'
        }
    
    # Execute mock setup script
    mock_setup_script = f"""
    try {{
        // Create mock position object
        window.TEST_POSITION = {{
            coords: {{
                latitude: {latitude},
                longitude: {longitude},
                accuracy: {accuracy},
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null
            }},
            timestamp: Date.now()
        }};
        
        // Create MockGeolocationProvider instance
        window.TEST_MOCK_PROVIDER = new window.MockGeolocationProvider({{
            defaultPosition: window.TEST_POSITION,
            supported: true,
            delay: {delay}
        }});
        
        // Store original GeolocationService
        if (!window._OriginalGeolocationService) {{
            window._OriginalGeolocationService = window.GeolocationService;
        }}
        
        // Override GeolocationService to use mock provider
        window.GeolocationService = function(locationResult, provider, pm, config) {{
            // Always use test mock provider instead of browser geolocation
            console.log('[TEST] GeolocationService created with MockGeolocationProvider');
            return new window._OriginalGeolocationService(
                locationResult,
                window.TEST_MOCK_PROVIDER,  // Force mock provider
                pm,
                config
            );
        }};
        
        // Maintain prototype chain for proper inheritance
        window.GeolocationService.prototype = window._OriginalGeolocationService.prototype;
        Object.setPrototypeOf(window.GeolocationService, window._OriginalGeolocationService);
        
        console.log('[TEST] MockGeolocationProvider configured successfully');
        console.log('[TEST] Test coordinates:', {latitude}, {longitude});
        
        return {{
            success: true,
            coordinates: {{
                latitude: {latitude},
                longitude: {longitude},
                accuracy: {accuracy}
            }},
            providerType: 'MockGeolocationProvider'
        }};
        
    }} catch (error) {{
        console.error('[TEST] Failed to configure mock:', error);
        return {{
            success: false,
            error: error.message,
            stack: error.stack
        }};
    }}
    """
    
    result = driver.execute_script(mock_setup_script)
    return result


def verify_mock_configuration(driver):
    """
    Verify that MockGeolocationProvider is properly configured.
    
    Args:
        driver: Selenium WebDriver instance
        
    Returns:
        dict: Verification result with configuration details
    """
    verification_script = """
    try {
        if (typeof window.TEST_MOCK_PROVIDER === 'undefined') {
            return {
                configured: false,
                error: 'TEST_MOCK_PROVIDER not found'
            };
        }
        
        return {
            configured: true,
            providerExists: typeof window.TEST_MOCK_PROVIDER !== 'undefined',
            isSupported: window.TEST_MOCK_PROVIDER.isSupported(),
            hasPosition: !!window.TEST_MOCK_PROVIDER.config.defaultPosition,
            position: window.TEST_POSITION ? {
                latitude: window.TEST_POSITION.coords.latitude,
                longitude: window.TEST_POSITION.coords.longitude,
                accuracy: window.TEST_POSITION.coords.accuracy
            } : null
        };
    } catch (error) {
        return {
            configured: false,
            error: error.message
        };
    }
    """
    
    return driver.execute_script(verification_script)


def test_mock_provider_directly(driver, timeout=5):
    """
    Test the MockGeolocationProvider directly to verify it works.
    
    This function calls getCurrentPosition on the mock provider and
    returns the result. Useful for debugging mock configuration.
    
    Args:
        driver: Selenium WebDriver instance
        timeout: Timeout for async script execution in seconds
        
    Returns:
        dict: Test result with coordinates or error
    """
    driver.set_script_timeout(timeout)
    
    test_script = """
    const done = arguments[0];
    
    try {
        if (typeof window.TEST_MOCK_PROVIDER === 'undefined') {
            done({
                success: false,
                error: 'TEST_MOCK_PROVIDER not configured'
            });
            return;
        }
        
        // Call getCurrentPosition on the mock
        window.TEST_MOCK_PROVIDER.getCurrentPosition(
            (position) => {
                done({
                    success: true,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                });
            },
            (error) => {
                done({
                    success: false,
                    error: error.message || 'Unknown error',
                    code: error.code
                });
            },
            {}
        );
        
    } catch (error) {
        done({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
    """
    
    return driver.execute_async_script(test_script)


def reset_geolocation_service(driver):
    """
    Reset GeolocationService to original implementation.
    
    Call this after tests to restore the original behavior.
    
    Args:
        driver: Selenium WebDriver instance
        
    Returns:
        bool: True if reset successfully
    """
    reset_script = """
    try {
        if (window._OriginalGeolocationService) {
            window.GeolocationService = window._OriginalGeolocationService;
            delete window._OriginalGeolocationService;
            delete window.TEST_MOCK_PROVIDER;
            delete window.TEST_POSITION;
            console.log('[TEST] GeolocationService reset to original');
            return true;
        }
        return false;
    } catch (error) {
        console.error('[TEST] Reset failed:', error);
        return false;
    }
    """
    
    return driver.execute_script(reset_script)


def create_custom_position(latitude, longitude, accuracy=10, **kwargs):
    """
    Create a custom position object for testing.
    
    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
        accuracy: Position accuracy in meters
        **kwargs: Additional position properties (altitude, heading, speed)
        
    Returns:
        dict: Position object compatible with Geolocation API
    """
    return {
        'coords': {
            'latitude': latitude,
            'longitude': longitude,
            'accuracy': accuracy,
            'altitude': kwargs.get('altitude'),
            'altitudeAccuracy': kwargs.get('altitudeAccuracy'),
            'heading': kwargs.get('heading'),
            'speed': kwargs.get('speed')
        },
        'timestamp': kwargs.get('timestamp', 'Date.now()')
    }
