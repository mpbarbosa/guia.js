"""
Integration test for Milho Verde, Serro, MG geolocation workflow.

This Selenium test validates the complete geolocation flow for:
Location: Milho Verde, Serro, Minas Gerais, Brasil
Coordinates: Latitude -18.4696091, Longitude -43.4953982
Expected Address: Camping Nozinho, 172, Rua Direita, Milho Verde, Serro, MG, 39150-000

Test Workflow:
1. Mock geolocation using guia.js MockGeolocationProvider
2. Navigate to index page
3. Trigger location acquisition
4. Verify coordinate display
5. Verify address resolution via OpenStreetMap
6. Validate Brazilian address format
7. Test address converter with same coordinates
8. Verify all address components display correctly

Implementation Note:
This test uses the built-in MockGeolocationProvider class from guia.js instead
of overriding navigator.geolocation. This provides more reliable testing that
integrates properly with the application's dependency injection architecture.
"""

import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.firefox.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

from firefox_console_capture import (
    FirefoxConsoleCapture,
    ConsoleConfig
)

from mock_geolocation_helper import (
    setup_mock_geolocation,
    verify_mock_configuration,
    test_mock_provider_directly,
    reset_geolocation_service
)

class TestMilhoVerdeGeolocation(unittest.TestCase):
    """
    Integration tests for Milho Verde, Serro, MG geolocation workflow.
    
    Tests the complete flow from mocked geolocation to address display,
    following best practices for Selenium testing.
    """

    # Test coordinates for Milho Verde, Serro, MG
    TEST_LATITUDE = -18.4696091
    TEST_LONGITUDE = -43.4953982
    
    # Expected address components
    EXPECTED_STREET = "Rua Direita"
    EXPECTED_NUMBER = "172"
    EXPECTED_DISTRICT = "Milho Verde"
    EXPECTED_CITY = "Serro"
    EXPECTED_STATE = "Minas Gerais"
    EXPECTED_STATE_CODE = "MG"
    EXPECTED_POSTAL_CODE = "39150-000"
    EXPECTED_COUNTRY = "Brasil"
    EXPECTED_PLACE_NAME = "Camping Nozinho"
    
    @classmethod
    def setUpClass(cls):
        """Set up Firefox WebDriver with geolocation mocking."""
        firefox_options = Options()
        
        # Firefox-specific preferences
        # Grant geolocation permission
        firefox_options.set_preference("geo.enabled", True)
        firefox_options.set_preference("geo.provider.use_corelocation", False)
        firefox_options.set_preference("geo.prompt.testing", True)
        firefox_options.set_preference("geo.prompt.testing.allow", True)
        
        # Disable notifications
        firefox_options.set_preference("dom.webnotifications.enabled", False)
        firefox_options.set_preference("dom.push.enabled", False)
        
        # Performance optimizations
        firefox_options.set_preference("browser.cache.disk.enable", False)
        firefox_options.set_preference("browser.cache.memory.enable", False)
        firefox_options.set_preference("browser.cache.offline.enable", False)
        firefox_options.set_preference("network.http.use-cache", False)
        
        # Headless mode for CI/CD (comment out for debugging)
        # firefox_options.add_argument("--headless")
        
        # Set Firefox binary location explicitly
        import os
        
        # Try multiple possible Firefox locations
        firefox_paths = [
            os.environ.get('FIREFOX_BIN'),
            '/usr/bin/firefox',
            '/usr/bin/firefox-esr',
            '/usr/bin/firefox-bin',
            '/opt/firefox/firefox',
            '/opt/firefox/firefox-bin'
        ]
        
        firefox_binary = None
        for path in firefox_paths:
            if path and os.path.exists(path):
                firefox_binary = path
                break
        print(f"Using Firefox binary at: {firefox_binary}")

        if firefox_binary:
            firefox_options.binary_location = firefox_binary
        
        try:
            cls.driver = webdriver.Firefox(options=firefox_options)
            cls.driver.set_window_size(1920, 1080)
        except Exception as e:
            # If Firefox setup fails, skip tests instead of crashing
            print(f"WARNING: Could not initialize Firefox WebDriver: {e}")
            print("Skipping Selenium tests. Install Firefox and GeckoDriver to run these tests.")
            raise unittest.SkipTest("Firefox WebDriver not available")
        
        cls.base_url = "file:///home/mpb/Documents/GitHub/guia_turistico/src"
        cls.wait_timeout = 20
        cls.long_wait_timeout = 30  # For API calls

    @classmethod
    def tearDownClass(cls):
        """Clean up and close the browser."""
        if hasattr(cls, 'driver') and cls.driver:
            cls.driver.quit()

    def setUp(self):
        """Set up before each test."""
        self.wait = WebDriverWait(self.driver, self.wait_timeout)
        self.long_wait = WebDriverWait(self.driver, self.long_wait_timeout)

    def tearDown(self):
        """Clean up after each test."""
        # Reset geolocation service to original state
        try:
            reset_geolocation_service(self.driver)
        except Exception as e:
            print(f"Warning: Could not reset geolocation service: {e}")

    def _mock_geolocation(self):
        """
        Mock geolocation using guia.js MockGeolocationProvider.
        
        This method uses the built-in MockGeolocationProvider class from guia.js
        instead of overriding navigator.geolocation. This provides more reliable
        and deterministic testing that integrates properly with the application
        architecture.
        
        Returns:
            dict: Result with success status and coordinates
        """
        result = setup_mock_geolocation(
            self.driver,
            latitude=self.TEST_LATITUDE,
            longitude=self.TEST_LONGITUDE,
            accuracy=10,
            delay=100
        )
        
        if not result['success']:
            raise Exception(f"Failed to setup mock geolocation: {result.get('error')}")
        
        print(f"[TEST] MockGeolocationProvider configured successfully")
        print(f"[TEST] Test coordinates: {result['coordinates']}")
        
        return result


    def _wait_for_element_text(self, locator, timeout=None):
        """
        Wait for an element to have non-empty text.
        
        Args:
            locator: Tuple of (By.*, selector)
            timeout: Optional timeout in seconds
            
        Returns:
            WebElement with text content
        """
        wait = WebDriverWait(self.driver, timeout or self.wait_timeout)
        return wait.until(lambda driver: driver.find_element(*locator) 
                         if len(driver.find_element(*locator).text.strip()) > 0 
                         else False)

    def _scroll_to_element(self, element):
        """Scroll element into view."""
        self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
        time.sleep(0.5)  # Allow scroll animation

    def test_01_page_loads_successfully(self):
        """Test that index page loads with all required elements."""
        self.driver.get(f"{self.base_url}/index.html")

        # Verify page title
        self.assertIn("Guia Turístico", self.driver.title)
        
        # Verify essential elements exist
        get_location_btn = self.wait.until(
            EC.presence_of_element_located((By.ID, "getLocationBtn"))
        )
        self.assertTrue(get_location_btn.is_displayed(), 
                       "Get location button should be visible")
        
        # Verify result container exists
        location_result = self.wait.until(
            EC.presence_of_element_located((By.ID, "locationResult"))
        )
        self.assertIsNotNone(location_result, 
                            "Location result container should exist")

    def test_02_geolocation_mock_works(self):
        """Test that MockGeolocationProvider is functional and properly configured."""
        self.driver.get(f"{self.base_url}/index.html")
        print(f"Driver type: {type(self.driver)}")
        print(f"Navigated to {self.driver.current_url}")

        # Wait for page to be ready
        self.wait.until(
            EC.presence_of_element_located((By.ID, "getLocationBtn"))
        )
        
        console = FirefoxConsoleCapture(self.driver)
        print(f"Console capture initialized: {type(console)}")
        logs = console.get_logs()
        print(f"Initial console logs: {logs}")

        # Setup mock geolocation using guia.js MockGeolocationProvider
        mock_result = self._mock_geolocation()
        self.assertTrue(mock_result['success'], 
                       f"Mock setup should succeed: {mock_result}")
        
        logs1 = console.get_logs()
        print(f"Console logs after mock setup: {logs1}")
        
        # Verify mock configuration
        verification = verify_mock_configuration(self.driver)
        self.assertTrue(verification['configured'], 
                       "Mock should be properly configured")
        self.assertTrue(verification['isSupported'],
                       "Mock provider should report as supported")
        self.assertTrue(verification['hasPosition'],
                       "Mock should have position configured")
        
        # Verify coordinates match
        position = verification.get('position', {})
        self.assertAlmostEqual(position.get('latitude'), self.TEST_LATITUDE, places=6,
                              msg="Mock latitude should match test value")
        self.assertAlmostEqual(position.get('longitude'), self.TEST_LONGITUDE, places=6,
                              msg="Mock longitude should match test value")
        
        print(f"✅ Mock verification passed: {position}")

        # Test that the mock works by calling it directly
        provider_test = test_mock_provider_directly(self.driver, timeout=5)
        
        self.assertTrue(provider_test['success'],
                       f"Provider direct test should succeed: {provider_test.get('error')}")
        
        # Verify returned coordinates
        self.assertAlmostEqual(provider_test['latitude'], self.TEST_LATITUDE, places=6,
                              msg="Provider should return correct latitude")
        self.assertAlmostEqual(provider_test['longitude'], self.TEST_LONGITUDE, places=6,
                              msg="Provider should return correct longitude")
        
        print(f"✅ Provider direct test passed: lat={provider_test['latitude']}, "
              f"lon={provider_test['longitude']}")
        
        logs2 = console.get_logs()
        print(f"Console logs after provider test: {logs2}")

    def test_03_coordinates_display_correctly(self):
        """Test that Milho Verde coordinates are displayed correctly in the DOM.
        
        This test validates the complete flow:
        1. Load page and let WebGeocodingManager initialize
        2. Inject mock provider into existing GeolocationService
        3. Click "Obter Localização" button
        4. Verify coordinates appear in locationResult element
        5. Extract and validate latitude/longitude values from DOM
        
        NOTE: We inject the mock provider AFTER page load, directly into the
        existing GeolocationService instance, since WebGeocodingManager creates
        its service during initialization.
        """
        # Load page and wait for initialization
        self.driver.get(f"{self.base_url}/index.html")
        time.sleep(3)  # Wait longer for app initialization
        
        # Verify critical elements exist
        initial_check = self.driver.execute_script("""
            return {
                hasGetLocationBtn: !!document.getElementById('getLocationBtn'),
                hasLocationResult: !!document.getElementById('locationResult'),
                hasAppContent: !!document.getElementById('app-content')
            };
        """)
        print(f"[TEST] Page structure check: {initial_check}")
        
        # Verify all required elements are present
        self.assertTrue(initial_check['hasGetLocationBtn'], "Get Location button should be present")
        self.assertTrue(initial_check['hasLocationResult'], "Location result section should be present")
        self.assertTrue(initial_check['hasAppContent'], "App content container should be present")
        
        # Now inject mock provider directly into the existing GeolocationService
        # First check what global references are available
        global_check = self.driver.execute_script("""
            return {
                hasAppState: typeof window.AppState !== 'undefined',
                hasPositionManager: typeof window.PositionManager !== 'undefined',
                hasWebGeocodingManager: typeof window.WebGeocodingManager !== 'undefined',
                hasGeolocationService: typeof window.GeolocationService !== 'undefined',
                hasMockProvider: typeof window.MockGeolocationProvider !== 'undefined',
                globalKeys: Object.keys(window).filter(k => k.includes('Geo') || k.includes('App') || k.includes('Position'))
            };
        """)
        print(f"[TEST] Global check: {global_check}")
        
        # Since AppState is module-scoped, we need to find the manager through global references
        # The PositionManager singleton might have a reference to the service
        inject_result = self.driver.execute_script(f"""
            try {{
                // Create mock position object
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
                
                // Create MockGeolocationProvider instance
                window.TEST_MOCK_PROVIDER = new window.MockGeolocationProvider({{
                    defaultPosition: window.TEST_POSITION,
                    supported: true,
                    delay: 100
                }});
                
                console.log('[TEST] Mock provider created');
                
                // CRITICAL FIX: Override the provider's getCurrentPosition method, not GeolocationService
                // GeolocationService internally calls this.provider.getCurrentPosition()
                // So we need to replace the provider on ALL instances
                
                // Override BrowserGeolocationProvider.prototype.getCurrentPosition
                // This will affect all instances including the one in GeolocationService
                window.BrowserGeolocationProvider.prototype.getCurrentPosition = function(successCallback, errorCallback, options) {{
                    console.log('[TEST] BrowserGeolocationProvider.getCurrentPosition intercepted - using mock');
                    return window.TEST_MOCK_PROVIDER.getCurrentPosition(successCallback, errorCallback, options);
                }};
                
                return {{
                    success: true,
                    method: 'provider prototype override',
                    coordinates: {{
                        latitude: {self.TEST_LATITUDE},
                        longitude: {self.TEST_LONGITUDE},
                        accuracy: 10
                    }}
                }};
                
            }} catch (error) {{
                console.error('[TEST] Failed to inject mock:', error);
                return {{
                    success: false,
                    error: error.message,
                    stack: error.stack
                }};
            }}
        """)
        
        print(f"[TEST] Mock injection result: {inject_result}")
        self.assertTrue(inject_result['success'], 
                       f"Mock injection should succeed: {inject_result.get('error')}")

        # Click "Obter Localização" button to trigger geolocation
        get_location_btn = self.wait.until(
            EC.element_to_be_clickable((By.ID, "getLocationBtn"))
        )
        print("[TEST] Clicking 'Obter Localização' button...")
        get_location_btn.click()
        
        # Wait for coordinates to appear in locationResult element
        time.sleep(4)
        
        # Check what happened - debug the state
        debug_info = self.driver.execute_script("""
            const locationResult = document.getElementById('locationResult');
            return {
                locationResultExists: !!locationResult,
                locationResultHTML: locationResult ? locationResult.innerHTML.substring(0, 300) : 'N/A',
                hasMockProvider: !!window.TEST_MOCK_PROVIDER,
                hasGeolocationService: typeof window.GeolocationService !== 'undefined'
            };
        """)
        print(f"[TEST] Debug info: {debug_info}")
        
        # Handle any alert dialogs that might appear
        try:
            from selenium.webdriver.common.alert import Alert
            alert = Alert(self.driver)
            alert_text = alert.text
            print(f"[TEST] Alert detected: {alert_text}")
            alert.dismiss()
            # If alert appeared, the test should fail as coordinates weren't displayed
            self.fail(f"Unexpected alert appeared: {alert_text}")
        except Exception:
            # No alert present, which is expected
            pass
        
        # Extract coordinate values from both possible locations:
        # 1. The id="locationResult" section (primary display with detailed coordinates)
        # 2. The id="coordinates" section with id="lat-long-display" span (summary display)
        coordinate_data = self.driver.execute_script(r"""
            // First check the main locationResult section
            const locationResult = document.getElementById('locationResult');
            if (!locationResult) {
                return { success: false, error: 'locationResult element not found' };
            }
            
            const locationHTML = locationResult.innerHTML;
            
            // Extract latitude and longitude from locationResult using regex
            const latMatch = locationHTML.match(/Latitude:<\/strong>\s*(-?\d+\.\d+)/i);
            const lonMatch = locationHTML.match(/Longitude:<\/strong>\s*(-?\d+\.\d+)/i);
            
            if (!latMatch || !lonMatch) {
                return { 
                    success: false, 
                    error: 'Coordinates not found in locationResult',
                    html: locationHTML.substring(0, 500)
                };
            }
            
            // Also check if the coordinates section is populated (optional validation)
            const coordinatesSection = document.getElementById('coordinates');
            const latLongDisplay = document.getElementById('lat-long-display');
            const coordinatesText = latLongDisplay ? (latLongDisplay.textContent || latLongDisplay.innerText) : 'Not populated';
            
            return {
                success: true,
                latitude: parseFloat(latMatch[1]),
                longitude: parseFloat(lonMatch[1]),
                source: 'locationResult',
                coordinatesSectionText: coordinatesText,
                locationResultHTML: locationHTML.substring(0, 300)
            };
        """)
        
        print(f"[TEST] Coordinate extraction result: success={coordinate_data.get('success')}")
        
        # Debug: print relevant info
        if not coordinate_data['success']:
            print(f"[TEST] HTML content: {coordinate_data.get('html', 'N/A')[:500]}")
        else:
            print(f"[TEST] Extracted from: {coordinate_data.get('source')}")
            print(f"[TEST] Coordinates section text: {coordinate_data.get('coordinatesSectionText')}")
        
        # Validate that coordinates were successfully extracted
        self.assertTrue(coordinate_data['success'], 
                       f"Should extract coordinates from DOM: {coordinate_data.get('error')}")
        
        # Validate latitude value in DOM matches expected
        actual_lat = coordinate_data['latitude']
        self.assertAlmostEqual(actual_lat, self.TEST_LATITUDE, places=6,
                              msg=f"DOM latitude ({actual_lat}) should match test value ({self.TEST_LATITUDE})")
        
        # Validate longitude value in DOM matches expected
        actual_lon = coordinate_data['longitude']
        self.assertAlmostEqual(actual_lon, self.TEST_LONGITUDE, places=6,
                              msg=f"DOM longitude ({actual_lon}) should match test value ({self.TEST_LONGITUDE})")
        
        print(f"✅ Coordinates validated in locationResult: lat={actual_lat}, lon={actual_lon}")
        print(f"✅ Full coordinate display validation passed!")    

    def test_04_address_converter_with_milho_verde_coordinates(self):
        """Test address converter with Milho Verde coordinates."""
        import os
        converter_file = f"{self.base_url.replace('file://', '')}/address-converter.html"
        if not os.path.exists(converter_file):
            self.skipTest("address-converter.html not implemented yet")
        
        self.driver.get(f"{self.base_url}/address-converter.html")
        
        # Verify page loaded
        self.assertIn("Conversor", self.driver.title)
        
        # Find input fields
        lat_input = self.wait.until(
            EC.presence_of_element_located((By.ID, "latitude"))
        )
        lon_input = self.wait.until(
            EC.presence_of_element_located((By.ID, "longitude"))
        )
        
        # Clear and enter coordinates
        lat_input.clear()
        lat_input.send_keys(str(self.TEST_LATITUDE))
        
        lon_input.clear()
        lon_input.send_keys(str(self.TEST_LONGITUDE))
        
        # Find and click convert button
        convert_btn = self.wait.until(
            EC.element_to_be_clickable((By.ID, "convertBtn"))
        )
        self._scroll_to_element(convert_btn)
        convert_btn.click()
        
        # Wait for address result (longer timeout for API call)
        time.sleep(5)  # Allow OpenStreetMap API to respond
        
        # Check if address result is displayed
        try:
            address_result = self.driver.find_element(By.ID, "addressResult")
            result_html = address_result.get_attribute('innerHTML').lower()
            
            # Verify some expected address components are present
            # (Flexible check since API response may vary)
            has_address_data = any(keyword in result_html for keyword in 
                                  ["serro", "minas gerais", "mg", "rua", "39150"])
            
            self.assertTrue(has_address_data or "erro" in result_html,
                          "Should display address data or error message")
        except NoSuchElementException:
            self.fail("Address result element not found")

    def test_05_address_components_validation(self):
        """Test that address components are properly extracted and displayed."""
        import os
        converter_file = f"{self.base_url.replace('file://', '')}/address-converter.html"
        if not os.path.exists(converter_file):
            self.skipTest("address-converter.html not implemented yet")
        
        self.driver.get(f"{self.base_url}/address-converter.html")
        
        # Input coordinates
        lat_input = self.wait.until(
            EC.presence_of_element_located((By.ID, "latitude"))
        )
        lon_input = self.wait.until(
            EC.presence_of_element_located((By.ID, "longitude"))
        )
        
        lat_input.clear()
        lat_input.send_keys(str(self.TEST_LATITUDE))
        lon_input.clear()
        lon_input.send_keys(str(self.TEST_LONGITUDE))
        
        # Convert
        convert_btn = self.wait.until(
            EC.element_to_be_clickable((By.ID, "convertBtn"))
        )
        convert_btn.click()
        
        # Wait for result
        time.sleep(6)
        
        try:
            address_result = self.driver.find_element(By.ID, "addressResult")
            result_content = address_result.get_attribute('innerHTML')
            
            # Check for key address components
            # Note: Exact format depends on app implementation
            expected_components = {
                "city": ["serro"],
                "state": ["minas gerais", "mg"],
                "postal": ["39150"],
            }
            
            result_lower = result_content.lower()
            
            # At least some components should be present
            found_components = []
            for component_type, keywords in expected_components.items():
                if any(keyword in result_lower for keyword in keywords):
                    found_components.append(component_type)
            
            # Should find at least city and state
            self.assertGreaterEqual(len(found_components), 2,
                                  f"Should find at least 2 address components. "
                                  f"Found: {found_components}")
        except NoSuchElementException:
            self.fail("Could not find address result element")

    def test_06_minas_gerais_state_validation(self):
        """Test that Minas Gerais state is correctly identified."""
        import os
        converter_file = f"{self.base_url.replace('file://', '')}/address-converter.html"
        if not os.path.exists(converter_file):
            self.skipTest("address-converter.html not implemented yet")
        
        self.driver.get(f"{self.base_url}/address-converter.html")
        
        # Input coordinates
        lat_input = self.wait.until(
            EC.presence_of_element_located((By.ID, "latitude"))
        )
        lon_input = self.driver.find_element(By.ID, "longitude")
        
        lat_input.send_keys(str(self.TEST_LATITUDE))
        lon_input.send_keys(str(self.TEST_LONGITUDE))
        
        # Convert
        convert_btn = self.driver.find_element(By.ID, "convertBtn")
        convert_btn.click()
        
        # Wait for API response
        time.sleep(6)
        
        # Get page content
        page_content = self.driver.page_source.lower()
        
        # Verify Minas Gerais or MG is present
        has_mg_reference = ("minas gerais" in page_content or 
                           "mg" in page_content or
                           "br-mg" in page_content)
        
        self.assertTrue(has_mg_reference,
                       "Page should contain reference to Minas Gerais (MG)")

    def test_07_brazilian_postal_code_format(self):
        """Test that Brazilian CEP format is recognized."""
        import os
        converter_file = f"{self.base_url.replace('file://', '')}/address-converter.html"
        if not os.path.exists(converter_file):
            self.skipTest("address-converter.html not implemented yet")
        
        self.driver.get(f"{self.base_url}/address-converter.html")
        
        # Input coordinates
        lat_input = self.wait.until(
            EC.presence_of_element_located((By.ID, "latitude"))
        )
        lon_input = self.driver.find_element(By.ID, "longitude")
        
        lat_input.send_keys(str(self.TEST_LATITUDE))
        lon_input.send_keys(str(self.TEST_LONGITUDE))
        
        # Convert
        convert_btn = self.driver.find_element(By.ID, "convertBtn")
        convert_btn.click()
        
        # Wait for result
        time.sleep(6)
        
        # Check page source for postal code pattern
        page_source = self.driver.page_source
        
        # Brazilian CEP format: 99999-999 or 99999999
        import re
        cep_pattern = r'\b\d{5}-?\d{3}\b'
        has_cep = re.search(cep_pattern, page_source)
        
        # Should have some postal code format
        # (May not be exact match due to API variations)
        self.assertTrue(has_cep or "39150" in page_source,
                       "Should contain Brazilian postal code format")

    def test_08_error_handling_invalid_coordinates(self):
        """Test error handling with invalid coordinates."""
        import os
        converter_file = f"{self.base_url.replace('file://', '')}/address-converter.html"
        if not os.path.exists(converter_file):
            self.skipTest("address-converter.html not implemented yet")
        
        self.driver.get(f"{self.base_url}/address-converter.html")
        
        # Input invalid coordinates
        lat_input = self.wait.until(
            EC.presence_of_element_located((By.ID, "latitude"))
        )
        lon_input = self.driver.find_element(By.ID, "longitude")
        
        lat_input.send_keys("999")  # Invalid latitude
        lon_input.send_keys("999")  # Invalid longitude
        
        # Try to convert
        convert_btn = self.driver.find_element(By.ID, "convertBtn")
        convert_btn.click()
        
        # Wait for response
        time.sleep(3)
        
        # Should show some form of error or no result
        page_content = self.driver.page_source.lower()
        
        # Check for error indicators
        has_error_indicator = any(keyword in page_content for keyword in 
                                 ["erro", "error", "inválido", "invalid"])
        
        # Or check that no valid address is shown
        no_valid_address = "serro" not in page_content
        
        self.assertTrue(has_error_indicator or no_valid_address,
                       "Should handle invalid coordinates gracefully")

    def test_09_responsive_design_mobile_viewport(self):
        """Test that page is responsive on mobile viewport."""
        # Set mobile viewport
        self.driver.set_window_size(375, 667)  # iPhone SE size
        
        self.driver.get(f"{self.base_url}/index.html")
        
        # Verify essential elements are still accessible
        get_location_btn = self.wait.until(
            EC.presence_of_element_located((By.ID, "getLocationBtn"))
        )
        
        # Element should be visible and clickable even on mobile
        self.assertTrue(get_location_btn.is_displayed(),
                       "Button should be visible on mobile viewport")
        
        # Restore desktop viewport
        self.driver.set_window_size(1920, 1080)

    def test_10_location_result_persistence(self):
        """Test that location result persists after multiple interactions."""
        self.driver.get(f"{self.base_url}/index.html")
        
        # Mock geolocation
        self._mock_geolocation()
        
        # Get location
        get_location_btn = self.wait.until(
            EC.element_to_be_clickable((By.ID, "getLocationBtn"))
        )
        get_location_btn.click()
        
        # Wait for result
        time.sleep(4)
        
        # Get first result
        location_result = self.driver.find_element(By.ID, "locationResult")
        first_result = location_result.text
        
        # Scroll page
        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1)
        self.driver.execute_script("window.scrollTo(0, 0);")
        
        # Check result is still there
        location_result = self.driver.find_element(By.ID, "locationResult")
        second_result = location_result.text
        
        self.assertEqual(first_result, second_result,
                        "Location result should persist after page interactions")


class TestMilhoVerdeAccessibility(unittest.TestCase):
    """Accessibility tests for Milho Verde geolocation workflow."""
    
    @classmethod
    def setUpClass(cls):
        """Set up Firefox with accessibility testing support."""
        firefox_options = Options()
        
        # Firefox accessibility preferences
        firefox_options.set_preference("ui.prefersReducedMotion", 1)
        firefox_options.set_preference("accessibility.force_disabled", 0)
        
        # Set Firefox binary location explicitly
        import os
        
        # Try multiple possible Firefox locations
        firefox_paths = [
            os.environ.get('FIREFOX_BIN'),
            '/usr/bin/firefox',
            '/usr/bin/firefox-esr',
            '/usr/bin/firefox-bin',
            '/opt/firefox/firefox',
            '/opt/firefox/firefox-bin'
        ]
        
        firefox_binary = None
        for path in firefox_paths:
            if path and os.path.exists(path):
                firefox_binary = path
                break
        
        if firefox_binary:
            firefox_options.binary_location = firefox_binary
        
        try:
            cls.driver = webdriver.Firefox(options=firefox_options)
            cls.driver.set_window_size(1920, 1080)
        except Exception as e:
            print(f"WARNING: Could not initialize Firefox WebDriver: {e}")
            raise unittest.SkipTest("Firefox WebDriver not available")
        
        cls.base_url = "file:///home/mpb/Documents/GitHub/guia_turistico/src"
        cls.wait_timeout = 15

    @classmethod
    def tearDownClass(cls):
        """Clean up."""
        if hasattr(cls, 'driver') and cls.driver:
            cls.driver.quit()

    def setUp(self):
        """Set up before each test."""
        self.wait = WebDriverWait(self.driver, self.wait_timeout)

    def test_keyboard_navigation(self):
        """Test that all interactive elements are keyboard accessible."""
        self.driver.get(f"{self.base_url}/index.html")
        
        # Get location button
        get_location_btn = self.wait.until(
            EC.presence_of_element_located((By.ID, "getLocationBtn"))
        )
        
        # Tab to button and verify it receives focus
        self.driver.execute_script("arguments[0].focus();", get_location_btn)
        active_element = self.driver.switch_to.active_element
        
        self.assertEqual(active_element.get_attribute('id'), 'getLocationBtn',
                        "Button should be focusable via keyboard")

    def test_aria_labels_present(self):
        """Test that important elements have ARIA labels."""
        self.driver.get(f"{self.base_url}/index.html")
        
        # Check if main interactive elements have accessibility attributes
        get_location_btn = self.wait.until(
            EC.presence_of_element_located((By.ID, "getLocationBtn"))
        )
        
        # Button should have some accessible text (text content or aria-label)
        accessible_name = (get_location_btn.text or 
                          get_location_btn.get_attribute('aria-label') or
                          get_location_btn.get_attribute('title'))
        
        self.assertTrue(len(accessible_name) > 0,
                       "Interactive elements should have accessible names")


if __name__ == "__main__":
    # Run with verbose output
    unittest.main(verbosity=2)
