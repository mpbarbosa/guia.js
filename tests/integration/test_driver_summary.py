#!/usr/bin/env python3
"""
Test driver initialization to verify Chrome/Firefox fallback works.
"""

import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions

def test_chrome():
    """Test Chrome driver initialization."""
    try:
        print("Testing Chrome WebDriver...")
        chrome_options = ChromeOptions()
        chrome_options.add_argument("--headless=new")
        driver = webdriver.Chrome(options=chrome_options)
        driver.quit()
        print("✓ Chrome WebDriver available")
        return True
    except Exception as e:
        print(f"✗ Chrome WebDriver unavailable: {e}")
        return False

def test_firefox():
    """Test Firefox driver initialization."""
    try:
        print("\nTesting Firefox WebDriver...")
        firefox_options = FirefoxOptions()
        firefox_options.add_argument("--headless")
        driver = webdriver.Firefox(options=firefox_options)
        driver.quit()
        print("✓ Firefox WebDriver available")
        return True
    except Exception as e:
        print(f"✗ Firefox WebDriver unavailable: {e}")
        return False

if __name__ == "__main__":
    chrome_ok = test_chrome()
    firefox_ok = test_firefox()
    
    print("\n" + "="*50)
    if chrome_ok:
        print("Primary: Chrome WebDriver will be used")
    elif firefox_ok:
        print("Fallback: Firefox WebDriver will be used")
    else:
        print("ERROR: Neither Chrome nor Firefox WebDriver available")
        sys.exit(1)
    
    print("="*50)
