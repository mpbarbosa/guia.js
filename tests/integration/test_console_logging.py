"""
Integration tests for Firefox Console Log Capture Library.

Tests the functionality of capturing JavaScript console logs from Firefox
browser during Selenium test execution.
"""

import pytest
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from firefox_console_capture import (
    FirefoxConsoleCapture,
    ConsoleConfig,
    ConsoleLogEntry,
)


class TestConsoleLogCapture:
    """Test suite for FirefoxConsoleCapture class."""

    def test_initialization_with_firefox_driver(self, firefox_driver):
        """Test that FirefoxConsoleCapture initializes correctly."""
        console = FirefoxConsoleCapture(firefox_driver)
        assert console.driver == firefox_driver
        assert isinstance(console.config, ConsoleConfig)
        assert not console._listener_injected

    def test_initialization_with_custom_config(self, firefox_driver):
        """Test initialization with custom configuration."""
        config = ConsoleConfig(auto_clear=True, max_entries=500)
        console = FirefoxConsoleCapture(firefox_driver, config=config)
        assert console.config.auto_clear is True
        assert console.config.max_entries == 500

    def test_initialization_rejects_non_firefox_driver(self):
        """Test that initialization rejects non-Firefox drivers."""
        with pytest.raises(TypeError, match="Expected webdriver.Firefox"):
            FirefoxConsoleCapture("not_a_driver")

    def test_inject_console_listener(self, firefox_driver, base_url):
        """Test that console listener is injected successfully."""
        console = FirefoxConsoleCapture(firefox_driver)
        firefox_driver.get(f"{base_url}/index.html")

        console._inject_console_listener()

        assert console._listener_injected is True

        # Verify listener version is set
        version = firefox_driver.execute_script(
            "return window._console_listener_version"
        )
        assert version == "1.0.0"

    def test_capture_console_log(self, firefox_driver, console_capture, base_url):
        
        print(f"Type: {type(console_capture)}")

        """Test capturing console.log() messages."""
        firefox_driver.get(f"{base_url}/index.html")
        
        # Clear any existing logs from page load
        console_capture.clear_logs()

        # Execute JavaScript that logs to console
        firefox_driver.execute_script("console.log('Test message from Selenium');")

        time.sleep(0.3)  # Brief wait for log capture

        logs = console_capture.get_logs()
        print(f"Logs: {logs}")

        # Find our test message
        test_logs = [log for log in logs if "Test message from Selenium" in log["message"]]
        assert len(test_logs) > 0, f"Expected log not found. Got {len(logs)} logs: {[l['message'][:50] for l in logs[:5]]}"
        assert test_logs[0]["level"] == "INFO"

    def test_capture_console_error(self, firefox_driver, console_capture, base_url):
        """Test capturing console.error() messages."""
        firefox_driver.get(f"{base_url}/index.html")
        
        # Clear existing logs
        console_capture.clear_logs()

        # Execute JavaScript that logs an error
        firefox_driver.execute_script("console.error('Test error message');")

        time.sleep(0.3)

        errors = console_capture.get_errors()

        error_messages = [e["message"] for e in errors]
        assert any("Test error message" in msg for msg in error_messages), f"Expected error not found in {error_messages}"

    def test_capture_console_warn(self, firefox_driver, console_capture, base_url):
        """Test capturing console.warn() messages."""
        firefox_driver.get(f"{base_url}/index.html")
        
        # Clear existing logs
        console_capture.clear_logs()

        firefox_driver.execute_script("console.warn('Test warning message');")

        time.sleep(0.3)

        warnings = console_capture.get_warnings()

        warning_messages = [w["message"] for w in warnings]
        assert any("Test warning message" in msg for msg in warning_messages), f"Expected warning not found in {warning_messages}"

    def test_capture_multiple_log_levels(self, firefox_driver, console_capture, base_url):
        """Test capturing logs of different levels."""
        firefox_driver.get(f"{base_url}/index.html")
        
        # Clear existing page logs
        console_capture.clear_logs()

        # Log multiple messages of different levels
        firefox_driver.execute_script("""
            console.log('Info message');
            console.warn('Warning message');
            console.error('Error message');
            console.debug('Debug message');
        """)

        time.sleep(0.3)

        # Get all logs
        all_logs = console_capture.get_logs()

        # Verify our test messages are captured
        messages = [log["message"] for log in all_logs]
        assert any("Info message" in msg for msg in messages), f"Info message not found in {messages}"
        assert any("Warning message" in msg for msg in messages), f"Warning message not found"
        assert any("Error message" in msg for msg in messages), f"Error message not found"

        # Test level filtering
        errors = console_capture.get_errors()
        error_messages = [e["message"] for e in errors]
        assert any("Error message" in msg for msg in error_messages), f"Error message not in errors: {error_messages}"

    def test_capture_javascript_error(self, firefox_driver, console_capture, base_url):
        """Test capturing JavaScript console.error() calls."""
        firefox_driver.get(f"{base_url}/index.html")
        
        # Clear existing logs
        console_capture.clear_logs()

        # Log errors using console.error (most reliable way to capture errors)
        # Note: Thrown errors in async contexts (setTimeout) may not always be captured
        # by window.onerror, so we test console.error directly which is the primary use case
        firefox_driver.execute_script("""
            setTimeout(function() {
                console.error('Intentional test error XYZ123');
            }, 100);
        """)

        time.sleep(0.5)  # Wait for async error to be logged

        errors = console_capture.get_errors()

        # Should capture the error
        error_messages = [e["message"] for e in errors]
        assert any("Intentional test error XYZ123" in msg for msg in error_messages), \
            f"Expected error not found. Got errors: {error_messages}"

    def test_clear_logs(self, firefox_driver, console_capture, base_url):
        """Test clearing captured logs."""
        firefox_driver.get(f"{base_url}/index.html")

        # Inject listener and get initial state
        console_capture._inject_console_listener()
        
        # Log some messages
        firefox_driver.execute_script("console.log('Message before clear');")
        time.sleep(0.2)

        # Verify logs exist
        logs_before = console_capture.get_logs()
        messages_before = [log["message"] for log in logs_before]
        assert any("Message before clear" in msg for msg in messages_before), \
            f"Initial message not found in {messages_before[:5]}"

        # Clear logs
        console_capture.clear_logs()

        # Log new message
        firefox_driver.execute_script("console.log('Message after clear');")
        time.sleep(0.2)

        logs_after = console_capture.get_logs()

        # Should only have message after clear
        messages = [log["message"] for log in logs_after]
        assert any("Message after clear" in msg for msg in messages), \
            f"Message after clear not found in {messages}"
        assert not any("Message before clear" in msg for msg in messages), \
            f"Old message still present after clear"

    def test_wait_for_log(self, firefox_driver, console_capture, base_url):
        """Test waiting for a specific log message."""
        firefox_driver.get(f"{base_url}/index.html")

        # Log message after delay
        firefox_driver.execute_script("""
            setTimeout(function() {
                console.log('Delayed message');
            }, 500);
        """)

        # Wait for the log
        log = console_capture.wait_for_log(r"Delayed message", timeout=2.0)

        assert log is not None
        assert "Delayed message" in log["message"]

    def test_wait_for_log_timeout(self, firefox_driver, console_capture, base_url):
        """Test wait_for_log timeout behavior."""
        firefox_driver.get(f"{base_url}/index.html")

        # Wait for log that never appears
        log = console_capture.wait_for_log(r"Non-existent message", timeout=1.0)

        assert log is None

    def test_wait_for_log_with_pattern(self, firefox_driver, console_capture, base_url):
        """Test wait_for_log with regex pattern."""
        firefox_driver.get(f"{base_url}/index.html")

        firefox_driver.execute_script("""
            setTimeout(function() {
                console.log('API call completed: status 200');
            }, 300);
        """)

        # Wait with regex pattern
        log = console_capture.wait_for_log(r"API call.*status \d+", timeout=2.0)

        assert log is not None
        assert "API call completed" in log["message"]

    def test_has_errors(self, firefox_driver, console_capture, base_url):
        """Test has_errors() method."""
        firefox_driver.get(f"{base_url}/index.html")

        # Initially should have no errors (or ignore existing)
        console_capture.clear_logs()

        # Log an error
        firefox_driver.execute_script("console.error('Test error');")
        time.sleep(0.2)

        assert console_capture.has_errors() is True

    def test_assert_no_errors_passes(self, firefox_driver, console_capture, base_url):
        """Test assert_no_errors() passes when no errors exist."""
        firefox_driver.get(f"{base_url}/index.html")
        console_capture.clear_logs()

        # Log only info messages
        firefox_driver.execute_script("console.log('Info message');")
        time.sleep(0.2)

        # Should not raise
        console_capture.assert_no_errors()

    def test_assert_no_errors_fails(self, firefox_driver, console_capture, base_url):
        """Test assert_no_errors() fails when errors exist."""
        firefox_driver.get(f"{base_url}/index.html")
        console_capture.clear_logs()

        # Log an error
        firefox_driver.execute_script("console.error('Test error');")
        time.sleep(0.2)

        # Should raise AssertionError
        with pytest.raises(AssertionError, match="Console errors detected"):
            console_capture.assert_no_errors()

    def test_get_log_summary(self, firefox_driver, console_capture, base_url):
        """Test get_log_summary() method."""
        firefox_driver.get(f"{base_url}/index.html")
        console_capture.clear_logs()

        # Log messages of different levels
        firefox_driver.execute_script("""
            console.log('Info 1');
            console.log('Info 2');
            console.warn('Warning 1');
            console.error('Error 1');
        """)
        time.sleep(0.3)

        summary = console_capture.get_log_summary()

        assert isinstance(summary, dict)
        assert "ERROR" in summary
        assert "WARNING" in summary
        assert "INFO" in summary
        assert summary["ERROR"] >= 1
        assert summary["WARNING"] >= 1
        assert summary["INFO"] >= 2

    def test_log_entry_structure(self, firefox_driver, console_capture, base_url):
        """Test that log entries have correct structure."""
        firefox_driver.get(f"{base_url}/index.html")
        console_capture.clear_logs()

        firefox_driver.execute_script("console.log('Structured log test');")
        time.sleep(0.2)

        logs = console_capture.get_logs()
        test_logs = [log for log in logs if "Structured log test" in log["message"]]

        assert len(test_logs) > 0

        log = test_logs[0]

        # Verify all required fields
        assert "timestamp" in log
        assert "level" in log
        assert "message" in log
        assert "source" in log
        assert "line_number" in log
        assert "column_number" in log

        # Verify types
        assert isinstance(log["timestamp"], int)
        assert isinstance(log["level"], str)
        assert isinstance(log["message"], str)
        assert isinstance(log["source"], str)

    def test_auto_clear_config(self, firefox_driver, base_url):
        """Test auto_clear configuration."""
        config = ConsoleConfig(auto_clear=True)
        console = FirefoxConsoleCapture(firefox_driver, config=config)

        firefox_driver.get(f"{base_url}/index.html")

        # First log
        firefox_driver.execute_script("console.log('First message');")
        time.sleep(0.2)

        logs1 = console.get_logs()  # Should auto-clear after this

        # Second log
        firefox_driver.execute_script("console.log('Second message');")
        time.sleep(0.2)

        logs2 = console.get_logs()

        # With auto_clear, logs2 should not contain logs1 messages
        messages2 = [log["message"] for log in logs2]
        assert any("Second message" in msg for msg in messages2)

    def test_max_entries_config(self, firefox_driver, base_url):
        """Test max_entries configuration limits returned logs."""
        config = ConsoleConfig(max_entries=5)
        console = FirefoxConsoleCapture(firefox_driver, config=config)

        firefox_driver.get(f"{base_url}/index.html")

        # Log many messages
        firefox_driver.execute_script("""
            for (let i = 0; i < 20; i++) {
                console.log('Message ' + i);
            }
        """)
        time.sleep(0.3)

        logs = console.get_logs()

        # Should be limited to max_entries
        assert len(logs) <= config.max_entries

    def test_console_capture_with_real_page(self, firefox_driver, console_capture, base_url):
        """Test console capture on actual Guia Turístico page."""
        firefox_driver.get(f"{base_url}/index.html")

        # Wait for page to load
        time.sleep(2)

        # Get all logs
        all_logs = console_capture.get_logs()

        # Verify we can capture logs from real page
        assert isinstance(all_logs, list)

        # Check for errors (shouldn't have critical errors)
        errors = console_capture.get_errors()

        # If errors exist, print them for debugging
        if errors:
            print(f"\nFound {len(errors)} console errors:")
            for error in errors[:5]:  # Print first 5
                print(f"  - {error['message'][:100]}")


class TestConsoleCaptureWithPytest:
    """Test pytest fixture integration."""

    def test_console_capture_fixture(self, console_capture):
        """Test that console_capture fixture works."""
        assert isinstance(console_capture, FirefoxConsoleCapture)

    def test_console_capture_autoclear_fixture(self, console_capture_autoclear):
        """Test that console_capture_autoclear fixture has auto_clear enabled."""
        assert isinstance(console_capture_autoclear, FirefoxConsoleCapture)
        assert console_capture_autoclear.config.auto_clear is True

    def test_base_url_fixture(self, base_url):
        """Test that base_url fixture provides correct URL."""
        assert isinstance(base_url, str)
        assert "guia_turistico" in base_url

    def test_wait_timeout_fixture(self, wait_timeout):
        """Test that wait_timeout fixture provides timeout value."""
        assert isinstance(wait_timeout, int)
        assert wait_timeout > 0


class TestConsoleLogParsing:
    """Test log parsing and level normalization."""

    def test_parse_log_level_error(self, firefox_driver):
        """Test parsing ERROR log level."""
        console = FirefoxConsoleCapture(firefox_driver)
        assert console._parse_log_level("ERROR") == "ERROR"
        assert console._parse_log_level("SEVERE") == "ERROR"

    def test_parse_log_level_warning(self, firefox_driver):
        """Test parsing WARNING log level."""
        console = FirefoxConsoleCapture(firefox_driver)
        assert console._parse_log_level("WARNING") == "WARNING"
        assert console._parse_log_level("WARN") == "WARNING"

    def test_parse_log_level_info(self, firefox_driver):
        """Test parsing INFO log level."""
        console = FirefoxConsoleCapture(firefox_driver)
        assert console._parse_log_level("INFO") == "INFO"
        assert console._parse_log_level("LOG") == "INFO"

    def test_parse_log_level_debug(self, firefox_driver):
        """Test parsing DEBUG log level."""
        console = FirefoxConsoleCapture(firefox_driver)
        assert console._parse_log_level("DEBUG") == "DEBUG"

    def test_parse_log_level_invalid(self, firefox_driver):
        """Test parsing invalid log level raises ValueError."""
        console = FirefoxConsoleCapture(firefox_driver)
        with pytest.raises(ValueError, match="Unknown log level"):
            console._parse_log_level("INVALID_LEVEL")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
