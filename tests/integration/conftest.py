"""
pytest configuration and fixtures for Guia Turístico integration tests.

Provides shared fixtures including Firefox WebDriver with console log capture.
"""

import pytest
from selenium import webdriver
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.firefox.service import Service as FirefoxService

from firefox_console_capture import FirefoxConsoleCapture, ConsoleConfig


@pytest.fixture(scope="function")
def firefox_driver():
    """
    Provide Firefox WebDriver instance with console logging enabled.

    Yields:
        webdriver.Firefox: Configured Firefox driver instance

    Example:
        >>> def test_page_load(firefox_driver):
        ...     firefox_driver.get("https://example.com")
        ...     assert "Example" in firefox_driver.title
    """
    firefox_options = FirefoxOptions()

    # Enable console logging
    firefox_options.set_preference("devtools.console.stdout.content", True)

    # Grant geolocation permission for Guia Turístico tests
    firefox_options.set_preference("geo.prompt.testing", True)
    firefox_options.set_preference("geo.prompt.testing.allow", True)

    # Headless mode for CI/CD (can be overridden with environment variable)
    import os

    if os.getenv("HEADLESS", "false").lower() == "true":
        firefox_options.add_argument("--headless")

    # Initialize driver
    driver = webdriver.Firefox(options=firefox_options)
    driver.maximize_window()

    yield driver

    # Teardown
    driver.quit()


@pytest.fixture(scope="function")
def console_capture(firefox_driver):
    """
    Provide FirefoxConsoleCapture instance for the current test.

    Args:
        firefox_driver: Firefox WebDriver fixture

    Yields:
        FirefoxConsoleCapture: Console capture instance

    Example:
        >>> def test_no_errors(firefox_driver, console_capture):
        ...     firefox_driver.get("https://example.com")
        ...     console_capture.assert_no_errors()
    """
    capture = FirefoxConsoleCapture(firefox_driver)
    yield capture

    # Optionally log summary after test
    if hasattr(capture, "get_log_summary"):
        summary = capture.get_log_summary()
        if any(summary.values()):
            print(f"\nConsole Log Summary: {summary}")


@pytest.fixture(scope="function")
def console_capture_autoclear(firefox_driver):
    """
    Provide FirefoxConsoleCapture instance with auto-clear enabled.

    This fixture automatically clears logs after each retrieval,
    useful for tests that check logs multiple times.

    Args:
        firefox_driver: Firefox WebDriver fixture

    Yields:
        FirefoxConsoleCapture: Console capture instance with auto-clear

    Example:
        >>> def test_sequential_logs(firefox_driver, console_capture_autoclear):
        ...     firefox_driver.get("https://example.com/page1")
        ...     assert len(console_capture_autoclear.get_errors()) == 0
        ...     firefox_driver.get("https://example.com/page2")
        ...     assert len(console_capture_autoclear.get_errors()) == 0
    """
    config = ConsoleConfig(auto_clear=True)
    capture = FirefoxConsoleCapture(firefox_driver, config=config)
    yield capture


@pytest.fixture(scope="session")
def base_url():
    """
    Provide base URL for Guia Turístico application.

    Returns:
        str: Base URL for local testing

    Example:
        >>> def test_index_page(firefox_driver, base_url):
        ...     firefox_driver.get(f"{base_url}/index.html")
    """
    return "file:///home/mpb/Documents/GitHub/guia_turistico/src"


@pytest.fixture(scope="function")
def wait_timeout():
    """
    Provide default wait timeout for explicit waits.

    Returns:
        int: Timeout in seconds
    """
    return 15
