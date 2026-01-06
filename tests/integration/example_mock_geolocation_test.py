"""
Example test demonstrating MockGeolocationProvider usage.

This is a minimal example showing how to use the mock_geolocation_helper
module with the test_milho_verde_geolocation.py tests.

Run this as a reference for implementing the mock in your actual tests.
"""

import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.firefox.options import Options

# Import our helper functions
from mock_geolocation_helper import (
    setup_mock_geolocation,
    verify_mock_configuration,
    test_mock_provider_directly,
    reset_geolocation_service
)


class ExampleMockGeolocationTest(unittest.TestCase):
    """
    Example test demonstrating MockGeolocationProvider usage.
    
    This shows the recommended pattern for using guia.js built-in
    geolocation mocking in Selenium tests.
    """
    
    # Test coordinates for Milho Verde, Serro, MG
    TEST_LATITUDE = -18.4696091
    TEST_LONGITUDE = -43.4953982
    
    @classmethod
    def setUpClass(cls):
        """Set up Firefox WebDriver."""
        firefox_options = Options()
        # Uncomment for headless mode
        # firefox_options.add_argument("--headless")
        
        try:
            cls.driver = webdriver.Firefox(options=firefox_options)
            cls.driver.set_window_size(1920, 1080)
        except Exception as e:
            print(f"WARNING: Could not initialize Firefox: {e}")
            raise unittest.SkipTest("Firefox WebDriver not available")
        
        cls.base_url = "file:///home/mpb/Documents/GitHub/guia_turistico/src"
        cls.wait_timeout = 10
    
    @classmethod
    def tearDownClass(cls):
        """Clean up and close browser."""
        if hasattr(cls, 'driver') and cls.driver:
            cls.driver.quit()
    
    def setUp(self):
        """Set up before each test."""
        self.wait = WebDriverWait(self.driver, self.wait_timeout)
    
    def tearDown(self):
        """Clean up after each test."""
        # Reset geolocation service to original state
        reset_geolocation_service(self.driver)
    
    def test_01_setup_mock_provider(self):
        """Test: Setup MockGeolocationProvider successfully."""
        # Navigate to page
        self.driver.get(f"{self.base_url}/index.html")
        
        # Setup mock geolocation
        result = setup_mock_geolocation(
            self.driver,
            latitude=self.TEST_LATITUDE,
            longitude=self.TEST_LONGITUDE,
            accuracy=10,
            delay=100
        )
        
        # Verify setup was successful
        self.assertTrue(result['success'], 
            f"Mock setup failed: {result.get('error')}")
        
        # Check coordinates match
        coords = result.get('coordinates', {})
        self.assertEqual(coords.get('latitude'), self.TEST_LATITUDE)
        self.assertEqual(coords.get('longitude'), self.TEST_LONGITUDE)
        
        print(f"✅ Mock configured successfully: {coords}")
    
    def test_02_verify_mock_configuration(self):
        """Test: Verify mock configuration details."""
        # Navigate to page
        self.driver.get(f"{self.base_url}/index.html")
        
        # Setup mock
        setup_result = setup_mock_geolocation(
            self.driver,
            latitude=self.TEST_LATITUDE,
            longitude=self.TEST_LONGITUDE
        )
        self.assertTrue(setup_result['success'])
        
        # Verify configuration
        verification = verify_mock_configuration(self.driver)
        
        self.assertTrue(verification['configured'], 
            "Mock should be configured")
        self.assertTrue(verification['providerExists'], 
            "Provider should exist")
        self.assertTrue(verification['isSupported'], 
            "Provider should report as supported")
        self.assertTrue(verification['hasPosition'], 
            "Provider should have position configured")
        
        # Check position details
        position = verification.get('position', {})
        self.assertAlmostEqual(
            position.get('latitude'), 
            self.TEST_LATITUDE, 
            places=6,
            msg="Latitude should match test value"
        )
        self.assertAlmostEqual(
            position.get('longitude'), 
            self.TEST_LONGITUDE, 
            places=6,
            msg="Longitude should match test value"
        )
        
        print(f"✅ Mock verification passed: {position}")
    
    def test_03_mock_provider_returns_coordinates(self):
        """Test: Mock provider returns coordinates when called directly."""
        # Navigate to page
        self.driver.get(f"{self.base_url}/index.html")
        
        # Setup mock
        setup_result = setup_mock_geolocation(
            self.driver,
            latitude=self.TEST_LATITUDE,
            longitude=self.TEST_LONGITUDE
        )
        self.assertTrue(setup_result['success'])
        
        # Test provider directly
        provider_result = test_mock_provider_directly(self.driver, timeout=5)
        
        self.assertTrue(provider_result['success'], 
            f"Provider test failed: {provider_result.get('error')}")
        
        # Verify returned coordinates
        self.assertAlmostEqual(
            provider_result['latitude'], 
            self.TEST_LATITUDE, 
            places=6,
            msg="Provider should return correct latitude"
        )
        self.assertAlmostEqual(
            provider_result['longitude'], 
            self.TEST_LONGITUDE, 
            places=6,
            msg="Provider should return correct longitude"
        )
        
        print(f"✅ Provider test passed: {provider_result}")
    
    def test_04_application_uses_mock_coordinates(self):
        """Test: Application uses mock coordinates when button clicked."""
        # Navigate to page
        self.driver.get(f"{self.base_url}/index.html")
        
        # Setup mock before user interaction
        setup_result = setup_mock_geolocation(
            self.driver,
            latitude=self.TEST_LATITUDE,
            longitude=self.TEST_LONGITUDE
        )
        self.assertTrue(setup_result['success'])
        
        # Click "Get Location" button
        get_location_btn = self.wait.until(
            EC.element_to_be_clickable((By.ID, "getLocationBtn"))
        )
        get_location_btn.click()
        
        # Wait for geolocation processing
        time.sleep(3)
        
        # Check location result
        location_result = self.driver.find_element(By.ID, "locationResult")
        result_text = location_result.text.lower()
        
        # Verify some location information is displayed
        # (Could be coordinates, address, or location name)
        has_location_info = any(keyword in result_text for keyword in [
            "latitude", "longitude", "coordenadas",
            str(self.TEST_LATITUDE), str(self.TEST_LONGITUDE),
            "milho verde", "serro", "minas gerais"
        ])
        
        self.assertTrue(has_location_info,
            f"Expected location info in result. Got: {result_text[:200]}")
        
        print(f"✅ Application used mock coordinates successfully")
        print(f"   Result preview: {result_text[:100]}...")


def run_example():
    """Run the example tests."""
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(ExampleMockGeolocationTest)
    
    # Run with verbose output
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print("\n" + "="*70)
    print("EXAMPLE TEST SUMMARY")
    print("="*70)
    print(f"Tests run: {result.testsRun}")
    print(f"Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print("="*70)
    
    return result.wasSuccessful()


if __name__ == '__main__':
    # Run example tests
    success = run_example()
    exit(0 if success else 1)
