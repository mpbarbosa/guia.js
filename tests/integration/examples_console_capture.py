"""
Example usage of Firefox Console Log Capture Library.

This file demonstrates various ways to use the console capture functionality
in your Selenium integration tests.
"""

import time
from selenium import webdriver
from selenium.webdriver.firefox.options import Options as FirefoxOptions

from firefox_console_capture import FirefoxConsoleCapture, ConsoleConfig


def example_basic_usage():
    """Basic usage example: capture and check console logs."""
    print("=== Basic Usage Example ===\n")

    # Setup Firefox driver
    options = FirefoxOptions()
    driver = webdriver.Firefox(options=options)

    # Initialize console capture
    console = FirefoxConsoleCapture(driver)

    try:
        # Navigate to a page
        driver.get("https://example.com")

        # Execute some JavaScript that logs to console
        driver.execute_script("""
            console.log('Application started');
            console.warn('This is a warning');
            console.error('This is an error');
        """)

        time.sleep(0.5)  # Give time for logs to be captured

        # Get all logs
        all_logs = console.get_logs()
        print(f"Total logs captured: {len(all_logs)}")

        # Get only errors
        errors = console.get_errors()
        print(f"Errors found: {len(errors)}")
        for error in errors:
            print(f"  - [{error['level']}] {error['message']}")

        # Get only warnings
        warnings = console.get_warnings()
        print(f"Warnings found: {len(warnings)}")

        # Get log summary
        summary = console.get_log_summary()
        print(f"\nLog Summary: {summary}")

    finally:
        driver.quit()


def example_with_assertions():
    """Example with assertions for testing."""
    print("\n=== Testing with Assertions Example ===\n")

    options = FirefoxOptions()
    driver = webdriver.Firefox(options=options)
    console = FirefoxConsoleCapture(driver)

    try:
        driver.get("https://example.com")

        # Clear any existing logs
        console.clear_logs()

        # Perform some action
        driver.execute_script("console.log('Page loaded successfully');")
        time.sleep(0.3)

        # Assert no errors occurred
        try:
            console.assert_no_errors("Page should load without errors")
            print("✓ No console errors detected")
        except AssertionError as e:
            print(f"✗ Assertion failed: {e}")

        # Check if errors exist
        if not console.has_errors():
            print("✓ Page is error-free")

    finally:
        driver.quit()


def example_wait_for_log():
    """Example of waiting for specific log messages."""
    print("\n=== Wait for Log Example ===\n")

    options = FirefoxOptions()
    driver = webdriver.Firefox(options=options)
    console = FirefoxConsoleCapture(driver)

    try:
        driver.get("https://example.com")

        # Simulate async operation that logs after delay
        driver.execute_script("""
            setTimeout(function() {
                console.log('API call completed: status 200');
            }, 1000);
        """)

        # Wait for the log message
        print("Waiting for API completion log...")
        log = console.wait_for_log(r"API call.*status \d+", timeout=3.0)

        if log:
            print(f"✓ Found log: {log['message']}")
        else:
            print("✗ Log not found within timeout")

    finally:
        driver.quit()


def example_with_custom_config():
    """Example using custom configuration."""
    print("\n=== Custom Configuration Example ===\n")

    options = FirefoxOptions()
    driver = webdriver.Firefox(options=options)

    # Custom config with auto-clear enabled
    config = ConsoleConfig(
        auto_clear=True,  # Clear logs after each retrieval
        max_entries=100,  # Limit number of logs
        wait_timeout=5.0  # Custom wait timeout
    )

    console = FirefoxConsoleCapture(driver, config=config)

    try:
        driver.get("https://example.com")

        # First batch of logs
        driver.execute_script("console.log('First batch');")
        time.sleep(0.2)
        logs1 = console.get_logs()  # Auto-clears after this
        print(f"First batch: {len(logs1)} logs")

        # Second batch of logs
        driver.execute_script("console.log('Second batch');")
        time.sleep(0.2)
        logs2 = console.get_logs()  # Only has logs since last retrieval
        print(f"Second batch: {len(logs2)} logs")

        print("✓ Auto-clear working correctly")

    finally:
        driver.quit()


def example_filtering_logs():
    """Example of filtering logs by level."""
    print("\n=== Log Filtering Example ===\n")

    options = FirefoxOptions()
    driver = webdriver.Firefox(options=options)
    console = FirefoxConsoleCapture(driver)

    try:
        driver.get("https://example.com")

        # Generate logs of different levels
        driver.execute_script("""
            console.log('Info message 1');
            console.log('Info message 2');
            console.warn('Warning message 1');
            console.warn('Warning message 2');
            console.error('Error message 1');
            console.debug('Debug message 1');
        """)

        time.sleep(0.3)

        # Filter by level
        print("Filtering logs by level:")
        print(f"  Errors: {len(console.get_errors())}")
        print(f"  Warnings: {len(console.get_warnings())}")
        print(f"  All INFO: {len(console.get_logs(level='INFO'))}")

        # Get summary
        summary = console.get_log_summary()
        for level, count in summary.items():
            if count > 0:
                print(f"  {level}: {count}")

    finally:
        driver.quit()


def example_with_pytest():
    """
    Example of using console capture in pytest tests.

    This is pseudo-code showing the pattern.
    """
    print("\n=== Pytest Integration Example (pseudo-code) ===\n")

    code = """
import pytest
from firefox_console_capture import FirefoxConsoleCapture

def test_page_has_no_errors(firefox_driver, console_capture):
    '''Test that page loads without console errors.'''
    firefox_driver.get("https://example.com")
    
    # Assert no console errors
    console_capture.assert_no_errors("Page should load cleanly")


def test_api_call_logs(firefox_driver, console_capture):
    '''Test that API calls are logged correctly.'''
    firefox_driver.get("https://example.com/api-test")
    
    # Wait for API log
    log = console_capture.wait_for_log(r"API call completed", timeout=5.0)
    assert log is not None, "API completion not logged"


def test_error_handling(firefox_driver, console_capture_autoclear):
    '''Test error handling with auto-clear.'''
    firefox_driver.get("https://example.com")
    
    # Trigger error
    firefox_driver.execute_script("throw new Error('Test error');")
    
    # Check error was captured
    errors = console_capture_autoclear.get_errors()
    assert len(errors) > 0
    assert "Test error" in errors[0]["message"]
    """

    print(code)


def main():
    """Run all examples."""
    print("Firefox Console Log Capture - Usage Examples")
    print("=" * 60)

    try:
        example_basic_usage()
        example_with_assertions()
        example_wait_for_log()
        example_with_custom_config()
        example_filtering_logs()
        example_with_pytest()

        print("\n" + "=" * 60)
        print("All examples completed successfully!")

    except Exception as e:
        print(f"\n✗ Error running examples: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
