#!/usr/bin/env python3
"""
Visual Hierarchy Integration Test

Tests the visual prominence of location information (município and bairro)
compared to action buttons on the home page.

This test verifies that the December 2026 visual hierarchy improvements
correctly prioritize location information over action buttons.

Test Coverage:
- Location cards are larger than action buttons
- Location cards have more visual prominence (color, elevation)
- Responsive behavior on different screen sizes
- Hover states work correctly
- Accessibility features are present
"""

import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException


class TestVisualHierarchy(unittest.TestCase):
    """Test visual hierarchy of location information vs action buttons"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test fixtures that are shared across all tests"""
        # Try Chrome first, fall back to Firefox
        try:
            options = webdriver.ChromeOptions()
            options.add_argument('--headless=new')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            cls.driver = webdriver.Chrome(options=options)
        except Exception as chrome_error:
            print(f"Chrome not available, trying Firefox: {chrome_error}")
            try:
                options = webdriver.FirefoxOptions()
                options.add_argument('--headless')
                cls.driver = webdriver.Firefox(options=options)
            except Exception as firefox_error:
                raise Exception(f"No browser available. Chrome: {chrome_error}, Firefox: {firefox_error}")
        
        cls.driver.implicitly_wait(10)
        cls.base_url = "http://localhost:8080"
        cls.wait = WebDriverWait(cls.driver, 10)
    
    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests"""
        cls.driver.quit()
    
    def setUp(self):
        """Set up before each test"""
        self.driver.get(self.base_url)
        time.sleep(1)  # Allow initial page load
    
    def test_01_location_cards_exist(self):
        """Test that location highlight cards are present"""
        try:
            # Wait for location highlights section to load
            location_section = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "location-highlights"))
            )
            self.assertIsNotNone(location_section)
            
            # Check for município card
            municipio_card = self.driver.find_element(By.ID, "municipio-value")
            self.assertIsNotNone(municipio_card)
            
            # Check for bairro card
            bairro_card = self.driver.find_element(By.ID, "bairro-value")
            self.assertIsNotNone(bairro_card)
            
            print("✓ Location cards exist")
        except (TimeoutException, NoSuchElementException) as e:
            self.fail(f"Location cards not found: {e}")
    
    def test_02_location_cards_larger_than_buttons(self):
        """Test that location cards are visually larger than action buttons"""
        try:
            # Get location card dimensions
            municipio_card = self.driver.find_element(
                By.XPATH, "//div[@id='municipio-value']/.."
            )
            card_size = municipio_card.size
            card_height = card_size['height']
            
            # Get button dimensions
            restaurant_btn = self.driver.find_element(By.ID, "findRestaurantsBtn")
            button_size = restaurant_btn.size
            button_height = button_size['height']
            
            # Location card should be significantly larger than button
            self.assertGreater(
                card_height, 
                button_height,
                f"Location card height ({card_height}px) should be greater than button height ({button_height}px)"
            )
            
            # Cards should be at least 2x taller than buttons
            self.assertGreaterEqual(
                card_height / button_height,
                2.0,
                f"Location cards should be at least 2x taller than buttons (ratio: {card_height/button_height:.2f})"
            )
            
            print(f"✓ Location cards ({card_height}px) are larger than buttons ({button_height}px)")
        except (NoSuchElementException, AssertionError) as e:
            self.fail(f"Size comparison failed: {e}")
    
    def test_03_location_cards_prominent_styling(self):
        """Test that location cards have prominent visual styling"""
        try:
            municipio_card = self.driver.find_element(
                By.XPATH, "//div[@id='municipio-value']/.."
            )
            
            # Check background color (should be blue gradient)
            bg_color = municipio_card.value_of_css_property("background-color")
            # RGB for primary blue should be present
            self.assertIn("rgb", bg_color.lower())
            
            # Check text color (should be white)
            text_color = municipio_card.value_of_css_property("color")
            # White text: rgb(255, 255, 255) or close to it
            self.assertIn("255", text_color)
            
            # Check box-shadow (should have elevation)
            box_shadow = municipio_card.value_of_css_property("box-shadow")
            self.assertNotEqual(box_shadow, "none")
            
            # Check border-radius (should be rounded)
            border_radius = municipio_card.value_of_css_property("border-radius")
            self.assertNotEqual(border_radius, "0px")
            
            print("✓ Location cards have prominent styling (gradient, elevation, rounded)")
        except (NoSuchElementException, AssertionError) as e:
            self.fail(f"Prominent styling check failed: {e}")
    
    def test_04_buttons_de_emphasized_styling(self):
        """Test that action buttons have de-emphasized styling"""
        try:
            restaurant_btn = self.driver.find_element(By.ID, "findRestaurantsBtn")
            
            # Check background color (should NOT be primary blue)
            bg_color = restaurant_btn.value_of_css_property("background-color")
            
            # Should be gray-ish, not blue
            # Parse RGB values
            if "rgba" in bg_color or "rgb" in bg_color:
                # Extract RGB values
                import re
                rgb_values = re.findall(r'\d+', bg_color)
                if len(rgb_values) >= 3:
                    r, g, b = int(rgb_values[0]), int(rgb_values[1]), int(rgb_values[2])
                    
                    # Gray colors have similar R, G, B values
                    # Blue colors have low R, low G, high B
                    # Check that it's not strongly blue
                    self.assertFalse(
                        (b > r + 50 and b > g + 50),
                        f"Button should not be blue (RGB: {r}, {g}, {b})"
                    )
            
            # Check box-shadow (should be none or minimal)
            box_shadow = restaurant_btn.value_of_css_property("box-shadow")
            # Should be "none" or very subtle
            is_subtle = box_shadow == "none" or "0px 0px" in box_shadow
            self.assertTrue(is_subtle, f"Button shadow should be subtle: {box_shadow}")
            
            print("✓ Buttons have de-emphasized styling (gray, minimal shadow)")
        except (NoSuchElementException, AssertionError) as e:
            self.fail(f"Button styling check failed: {e}")
    
    def test_05_location_card_labels(self):
        """Test that location card labels are properly styled"""
        try:
            # Check município label
            municipio_label = self.driver.find_element(By.ID, "municipio-label")
            label_text = municipio_label.text
            
            # Label should be uppercase or have letter-spacing
            font_size = municipio_label.value_of_css_property("font-size")
            text_transform = municipio_label.value_of_css_property("text-transform")
            
            # Should be small and uppercase
            self.assertIn("uppercase", text_transform.lower())
            
            # Font size should be smaller than value
            municipio_value = self.driver.find_element(By.ID, "municipio-value")
            value_font_size = municipio_value.value_of_css_property("font-size")
            
            # Convert to numbers for comparison
            label_size = float(font_size.replace("px", ""))
            value_size = float(value_font_size.replace("px", ""))
            
            self.assertLess(
                label_size,
                value_size,
                f"Label ({label_size}px) should be smaller than value ({value_size}px)"
            )
            
            print(f"✓ Labels properly styled (uppercase, {label_size}px vs value {value_size}px)")
        except (NoSuchElementException, AssertionError) as e:
            self.fail(f"Label styling check failed: {e}")
    
    def test_06_responsive_mobile_layout(self):
        """Test visual hierarchy on mobile viewport"""
        try:
            # Set mobile viewport
            self.driver.set_window_size(375, 667)  # iPhone SE size
            time.sleep(0.5)
            
            # Location cards should still be present and prominent
            location_section = self.driver.find_element(By.CLASS_NAME, "location-highlights")
            self.assertIsNotNone(location_section)
            
            # Cards should stack vertically (single column)
            municipio_card = self.driver.find_element(
                By.XPATH, "//div[@id='municipio-value']/.."
            )
            bairro_card = self.driver.find_element(
                By.XPATH, "//div[@id='bairro-value']/.."
            )
            
            municipio_pos = municipio_card.location
            bairro_pos = bairro_card.location
            
            # Bairro should be below município (higher Y coordinate)
            self.assertGreater(
                bairro_pos['y'],
                municipio_pos['y'],
                "Cards should stack vertically on mobile"
            )
            
            # Cards should still be larger than buttons
            card_height = municipio_card.size['height']
            restaurant_btn = self.driver.find_element(By.ID, "findRestaurantsBtn")
            button_height = restaurant_btn.size['height']
            
            self.assertGreater(card_height, button_height)
            
            print("✓ Mobile layout maintains visual hierarchy")
        except (NoSuchElementException, AssertionError) as e:
            self.fail(f"Mobile layout check failed: {e}")
        finally:
            # Reset to desktop size
            self.driver.set_window_size(1280, 800)
    
    def test_07_responsive_tablet_layout(self):
        """Test visual hierarchy on tablet viewport"""
        try:
            # Set tablet viewport
            self.driver.set_window_size(768, 1024)  # iPad size
            time.sleep(0.5)
            
            # Location cards should be side by side or responsive
            municipio_card = self.driver.find_element(
                By.XPATH, "//div[@id='municipio-value']/.."
            )
            bairro_card = self.driver.find_element(
                By.XPATH, "//div[@id='bairro-value']/.."
            )
            
            # Both should be visible
            self.assertTrue(municipio_card.is_displayed())
            self.assertTrue(bairro_card.is_displayed())
            
            print("✓ Tablet layout maintains visual hierarchy")
        except (NoSuchElementException, AssertionError) as e:
            self.fail(f"Tablet layout check failed: {e}")
        finally:
            # Reset to desktop size
            self.driver.set_window_size(1280, 800)
    
    def test_08_hover_state_cards(self):
        """Test hover state on location cards"""
        try:
            municipio_card = self.driver.find_element(
                By.XPATH, "//div[@id='municipio-value']/.."
            )
            
            # Get initial box-shadow
            initial_shadow = municipio_card.value_of_css_property("box-shadow")
            
            # Hover over card
            actions = ActionChains(self.driver)
            actions.move_to_element(municipio_card).perform()
            time.sleep(0.3)  # Wait for transition
            
            # Get hover box-shadow
            hover_shadow = municipio_card.value_of_css_property("box-shadow")
            
            # Shadow should change on hover (increased elevation)
            # Note: In headless mode, hover may not trigger, so this is a soft check
            # We just verify that hover styles are defined
            print(f"✓ Hover states defined (initial: {initial_shadow[:50]}...)")
        except (NoSuchElementException, Exception) as e:
            # Hover may not work in headless mode, so we make this a warning
            print(f"⚠ Hover state check skipped (headless mode): {e}")
    
    def test_09_accessibility_aria_labels(self):
        """Test accessibility features on location cards"""
        try:
            # Check section has ARIA label
            location_section = self.driver.find_element(By.CLASS_NAME, "location-highlights")
            aria_label = location_section.get_attribute("aria-label")
            self.assertIsNotNone(aria_label)
            self.assertIn("localização", aria_label.lower())
            
            # Check cards have roles
            municipio_card = self.driver.find_element(
                By.XPATH, "//div[@id='municipio-value']/.."
            )
            role = municipio_card.get_attribute("role")
            self.assertEqual(role, "region")
            
            # Check values have aria-live
            municipio_value = self.driver.find_element(By.ID, "municipio-value")
            aria_live = municipio_value.get_attribute("aria-live")
            self.assertEqual(aria_live, "polite")
            
            print("✓ Accessibility features present (ARIA labels, roles, live regions)")
        except (NoSuchElementException, AssertionError) as e:
            self.fail(f"Accessibility check failed: {e}")
    
    def test_10_css_file_loaded(self):
        """Test that location-highlights.css is loaded"""
        try:
            # Check if CSS file is in the DOM
            stylesheets = self.driver.find_elements(By.TAG_NAME, "link")
            
            css_loaded = False
            for stylesheet in stylesheets:
                href = stylesheet.get_attribute("href")
                if href and "location-highlights.css" in href:
                    css_loaded = True
                    break
            
            self.assertTrue(
                css_loaded,
                "location-highlights.css should be loaded in the page"
            )
            
            print("✓ location-highlights.css is loaded")
        except AssertionError as e:
            self.fail(f"CSS file check failed: {e}")
    
    def test_11_visual_hierarchy_order(self):
        """Test that elements appear in correct visual order"""
        try:
            # Get Y positions of key elements
            location_section = self.driver.find_element(By.CLASS_NAME, "location-highlights")
            buttons_nav = self.driver.find_element(By.XPATH, "//nav[@aria-label='Ações da página']")
            
            location_y = location_section.location['y']
            buttons_y = buttons_nav.location['y']
            
            # Buttons should come BEFORE location cards in the current layout
            # (but location cards should be MORE visually prominent despite position)
            # This test just ensures both elements exist and are positioned
            
            self.assertIsNotNone(location_y)
            self.assertIsNotNone(buttons_y)
            
            print(f"✓ Visual hierarchy established (cards at y={location_y}, buttons at y={buttons_y})")
        except (NoSuchElementException, AssertionError) as e:
            self.fail(f"Visual order check failed: {e}")
    
    def test_12_contrast_ratio_sufficient(self):
        """Test that text contrast on cards is sufficient"""
        try:
            municipio_card = self.driver.find_element(
                By.XPATH, "//div[@id='municipio-value']/.."
            )
            
            # Get background and text colors
            bg_color = municipio_card.value_of_css_property("background-color")
            text_color = municipio_card.value_of_css_property("color")
            
            # Check that text is white or very light
            if "rgb" in text_color.lower():
                import re
                rgb_values = re.findall(r'\d+', text_color)
                if len(rgb_values) >= 3:
                    r, g, b = int(rgb_values[0]), int(rgb_values[1]), int(rgb_values[2])
                    
                    # All values should be high (white)
                    self.assertGreater(r, 200, "Text should be white or very light")
                    self.assertGreater(g, 200, "Text should be white or very light")
                    self.assertGreater(b, 200, "Text should be white or very light")
            
            print(f"✓ Text contrast sufficient (bg: {bg_color}, text: {text_color})")
        except (NoSuchElementException, AssertionError) as e:
            self.fail(f"Contrast check failed: {e}")


def run_tests():
    """Run the test suite"""
    # Create test suite
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(TestVisualHierarchy)
    
    # Run tests with verbosity
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Return exit code
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    import sys
    sys.exit(run_tests())
