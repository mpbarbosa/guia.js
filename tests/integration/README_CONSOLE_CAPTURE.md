# Firefox Console Log Capture Library

A Python 3.13+ library for capturing JavaScript console logs from Firefox browser during Selenium integration tests.

## Overview

This library provides a simple, type-safe interface to capture and analyze JavaScript console output (logs, warnings, errors) from Firefox browser during automated testing. It's designed for integration with pytest and follows modern Python 3.13 conventions.

## Features

- ✅ **Capture all console log levels**: INFO, WARNING, ERROR, DEBUG
- ✅ **Python 3.13 compatible**: Modern type hints, pattern matching
- ✅ **pytest integration**: Ready-to-use fixtures
- ✅ **Flexible filtering**: Get logs by level or search by pattern
- ✅ **Wait for logs**: Async-friendly log waiting with timeouts
- ✅ **Auto-clear support**: Optional automatic log clearing
- ✅ **Error detection**: Built-in assertion helpers
- ✅ **Source tracking**: Capture file, line, and column information
- ✅ **Unhandled error capture**: Catches JavaScript exceptions and promise rejections

## Installation

### Requirements

```bash
# Python 3.13+
python --version  # Should be 3.13.0 or higher

# Install dependencies
pip install selenium>=4.15.0 pytest>=7.0.0
```

### Setup

1. Install GeckoDriver (Firefox WebDriver):
```bash
# Ubuntu/Debian
sudo apt install firefox-geckodriver

# macOS
brew install geckodriver

# Or download from: https://github.com/mozilla/geckodriver/releases
```

2. Copy library files to your test directory:
```bash
cp firefox_console_capture.py your_project/tests/integration/
cp conftest.py your_project/tests/integration/  # For pytest fixtures
```

## Quick Start

### Basic Usage

```python
from selenium import webdriver
from firefox_console_capture import FirefoxConsoleCapture

# Create Firefox driver
driver = webdriver.Firefox()
console = FirefoxConsoleCapture(driver)

# Navigate to page
driver.get("https://example.com")

# Get all console logs
logs = console.get_logs()
print(f"Total logs: {len(logs)}")

# Get only errors
errors = console.get_errors()
print(f"Errors: {len(errors)}")

# Assert no errors exist
console.assert_no_errors("Page should load without errors")

driver.quit()
```

### With pytest

```python
import pytest

def test_page_loads_without_errors(firefox_driver, console_capture):
    """Test that page loads without console errors."""
    firefox_driver.get("https://example.com")
    
    # Assert no console errors
    console_capture.assert_no_errors()


def test_wait_for_api_log(firefox_driver, console_capture):
    """Test waiting for specific log message."""
    firefox_driver.get("https://example.com/api")
    
    # Wait for API completion log
    log = console_capture.wait_for_log(r"API call completed", timeout=5.0)
    assert log is not None, "API call not logged"
```

## API Reference

### `FirefoxConsoleCapture`

Main class for capturing console logs.

#### Constructor

```python
FirefoxConsoleCapture(
    driver: webdriver.Firefox,
    config: ConsoleConfig | None = None
)
```

**Parameters:**
- `driver`: Firefox WebDriver instance
- `config`: Optional configuration (default: `ConsoleConfig()`)

**Raises:**
- `TypeError`: If driver is not a Firefox WebDriver

#### Methods

##### `get_logs(level: str | None = None) -> list[ConsoleLogEntry]`

Retrieve console logs from browser.

```python
# Get all logs
all_logs = console.get_logs()

# Get only ERROR level logs
errors = console.get_logs(level="ERROR")

# Get only WARNING level logs
warnings = console.get_logs(level="WARNING")
```

##### `get_errors() -> list[ConsoleLogEntry]`

Convenience method to get ERROR level logs only.

```python
errors = console.get_errors()
for error in errors:
    print(f"Error: {error['message']}")
```

##### `get_warnings() -> list[ConsoleLogEntry]`

Convenience method to get WARNING level logs only.

```python
warnings = console.get_warnings()
```

##### `clear_logs() -> None`

Clear all captured console logs.

```python
console.clear_logs()
```

##### `wait_for_log(message_pattern: str, timeout: float = 10.0, level: str | None = None) -> ConsoleLogEntry | None`

Wait for a log matching the specified regex pattern.

```python
# Wait for specific message
log = console.wait_for_log(r"API call completed", timeout=5.0)

# Wait for error matching pattern
error = console.wait_for_log(r"Failed to load.*", timeout=3.0, level="ERROR")
```

##### `has_errors() -> bool`

Check if any console errors exist.

```python
if console.has_errors():
    print("Console errors detected!")
```

##### `assert_no_errors(message: str = "Console errors detected") -> None`

Assert that no console errors exist. Raises `AssertionError` if errors are present.

```python
console.assert_no_errors("Page should be error-free")
```

##### `get_log_summary() -> dict[str, int]`

Get summary count of logs by level.

```python
summary = console.get_log_summary()
# Returns: {"ERROR": 2, "WARNING": 5, "INFO": 10, "DEBUG": 0}
```

### `ConsoleLogEntry`

TypedDict structure for log entries.

```python
class ConsoleLogEntry(TypedDict):
    timestamp: int          # Unix timestamp in milliseconds
    level: str             # Log level: ERROR, WARNING, INFO, DEBUG
    message: str           # Console log message
    source: str            # Source URL or file
    line_number: int | None  # Line number if available
    column_number: int | None  # Column number if available
```

### `ConsoleConfig`

Configuration dataclass for console capture behavior.

```python
@dataclass(frozen=True)
class ConsoleConfig:
    default_level: str = "INFO"       # Default log level
    auto_clear: bool = False          # Clear logs after each retrieval
    include_source: bool = True       # Include source location
    max_entries: int = 1000           # Maximum log entries to return
    wait_timeout: float = 10.0        # Default timeout for wait_for_log
```

**Usage:**

```python
config = ConsoleConfig(auto_clear=True, max_entries=500)
console = FirefoxConsoleCapture(driver, config=config)
```

## pytest Fixtures

The library includes pytest fixtures for easy integration.

### `firefox_driver`

Provides configured Firefox WebDriver instance.

```python
def test_example(firefox_driver):
    firefox_driver.get("https://example.com")
```

### `console_capture`

Provides FirefoxConsoleCapture instance.

```python
def test_console_logs(firefox_driver, console_capture):
    firefox_driver.get("https://example.com")
    errors = console_capture.get_errors()
    assert len(errors) == 0
```

### `console_capture_autoclear`

Provides FirefoxConsoleCapture with auto-clear enabled.

```python
def test_sequential_pages(firefox_driver, console_capture_autoclear):
    firefox_driver.get("https://example.com/page1")
    assert len(console_capture_autoclear.get_errors()) == 0
    
    firefox_driver.get("https://example.com/page2")
    assert len(console_capture_autoclear.get_errors()) == 0  # Logs auto-cleared
```

### `base_url`

Provides base URL for Guia Turístico application (customizable).

### `wait_timeout`

Provides default wait timeout (15 seconds).

## Examples

### Example 1: Basic Error Detection

```python
def test_page_has_no_errors(firefox_driver, console_capture):
    """Ensure page loads without JavaScript errors."""
    firefox_driver.get("https://example.com")
    
    console_capture.assert_no_errors("Page should load cleanly")
```

### Example 2: Wait for Async Operation

```python
def test_api_call_logs(firefox_driver, console_capture):
    """Wait for API call completion log."""
    firefox_driver.get("https://example.com/api-test")
    
    log = console_capture.wait_for_log(r"API call completed", timeout=5.0)
    assert log is not None, "API call not logged"
    assert "status 200" in log["message"]
```

### Example 3: Filter by Log Level

```python
def test_no_warnings_or_errors(firefox_driver, console_capture):
    """Ensure page has no warnings or errors."""
    firefox_driver.get("https://example.com")
    
    warnings = console_capture.get_warnings()
    errors = console_capture.get_errors()
    
    assert len(warnings) == 0, f"Unexpected warnings: {warnings}"
    assert len(errors) == 0, f"Unexpected errors: {errors}"
```

### Example 4: Log Summary Analysis

```python
def test_log_summary(firefox_driver, console_capture):
    """Analyze console log distribution."""
    firefox_driver.get("https://example.com")
    
    summary = console_capture.get_log_summary()
    
    # Allow some info logs but no errors
    assert summary["ERROR"] == 0, "No errors allowed"
    assert summary["WARNING"] <= 2, "Max 2 warnings allowed"
    print(f"Page generated {summary['INFO']} info logs")
```

### Example 5: Custom Configuration

```python
def test_with_custom_config(firefox_driver):
    """Use custom configuration."""
    config = ConsoleConfig(
        auto_clear=True,
        max_entries=100,
        wait_timeout=5.0
    )
    console = FirefoxConsoleCapture(firefox_driver, config=config)
    
    firefox_driver.get("https://example.com")
    
    logs = console.get_logs()  # Auto-clears after retrieval
    assert len(logs) <= 100
```

## Advanced Usage

### Capturing Unhandled JavaScript Errors

The library automatically captures:
- Unhandled exceptions (`window.onerror`)
- Unhandled promise rejections (`window.onunhandledrejection`)

```python
def test_javascript_error_handling(firefox_driver, console_capture):
    """Test that JavaScript errors are captured."""
    firefox_driver.get("https://example.com")
    
    # Trigger intentional error
    firefox_driver.execute_script("throw new Error('Test error');")
    
    time.sleep(0.5)  # Wait for error to be captured
    
    errors = console_capture.get_errors()
    assert any("Test error" in e["message"] for e in errors)
```

### Pattern Matching with Regex

```python
def test_log_pattern_matching(firefox_driver, console_capture):
    """Match logs using regex patterns."""
    firefox_driver.get("https://example.com")
    
    # Wait for log matching pattern
    log = console_capture.wait_for_log(
        r"Request to /api/.*completed in \d+ms",
        timeout=3.0
    )
    
    assert log is not None
```

### Sequential Log Checking

```python
def test_multi_page_navigation(firefox_driver, console_capture_autoclear):
    """Test multiple pages with auto-clear."""
    pages = ["page1.html", "page2.html", "page3.html"]
    
    for page in pages:
        firefox_driver.get(f"https://example.com/{page}")
        
        # Each page checked independently
        errors = console_capture_autoclear.get_errors()
        assert len(errors) == 0, f"Errors on {page}: {errors}"
```

## How It Works

The library uses JavaScript injection to intercept console methods:

1. **Injection Phase**: When first accessed, the library injects JavaScript that overrides native console methods (`log`, `info`, `warn`, `error`, `debug`)

2. **Capture Phase**: Overridden methods capture log details (message, timestamp, level, source location) into `window._captured_logs` array

3. **Preservation**: Original console behavior is preserved - logs still appear in browser console

4. **Retrieval Phase**: Python code retrieves captured logs via `driver.execute_script()`

5. **Processing**: Logs are filtered, parsed, and returned as structured `ConsoleLogEntry` objects

## Limitations

1. **Firefox Specific**: Designed for Firefox/GeckoDriver (Chrome has better native log APIs)
2. **Single Page**: Logs are cleared when navigating to new pages (use fixtures for multi-page tests)
3. **Performance**: Very large numbers of logs (>10,000) may impact browser performance
4. **Source Location**: Source file/line tracking may not work for minified code

## Troubleshooting

### No logs captured

**Issue**: `get_logs()` returns empty list

**Solution:**
1. Ensure page has fully loaded before retrieving logs
2. Add `time.sleep(0.2)` after logging actions
3. Check that JavaScript is enabled in browser
4. Verify Firefox WebDriver is used (not Chrome)

### GeckoDriver not found

**Issue**: `selenium.common.exceptions.WebDriverException: 'geckodriver' executable needs to be in PATH`

**Solution:**
```bash
# Install geckodriver
# Ubuntu/Debian
sudo apt install firefox-geckodriver

# Or download manually
wget https://github.com/mozilla/geckodriver/releases/download/v0.34.0/geckodriver-v0.34.0-linux64.tar.gz
tar -xzf geckodriver-v0.34.0-linux64.tar.gz
sudo mv geckodriver /usr/local/bin/
```

### Type errors with Python < 3.13

**Issue**: `TypeError: 'type' object is not subscriptable`

**Solution**: This library requires Python 3.13+. Upgrade Python or modify type hints:
```python
# Python 3.13+ (current code)
def get_logs(self) -> list[ConsoleLogEntry]:

# Python 3.9-3.12 (fallback)
from typing import List
def get_logs(self) -> List[ConsoleLogEntry]:
```

### Logs disappear between calls

**Issue**: Logs retrieved once don't appear in subsequent calls

**Solution:**
1. Don't use `auto_clear=True` if you need to access logs multiple times
2. Store logs in variable before clearing:
```python
all_logs = console.get_logs()
# Work with all_logs instead of calling get_logs() again
```

## Testing the Library

Run integration tests:

```bash
cd tests/integration

# Run all console capture tests
pytest test_console_logging.py -v

# Run specific test
pytest test_console_logging.py::TestConsoleLogCapture::test_capture_console_error -v

# Run with output
pytest test_console_logging.py -v -s
```

Run examples:

```bash
python examples_console_capture.py
```

## Contributing

When contributing to this library:

1. **Follow Python 3.13 conventions**: Use modern type hints, pattern matching
2. **Add tests**: Update `test_console_logging.py` with new test cases
3. **Update docs**: Keep this README in sync with code changes
4. **Type safety**: Run `mypy` for type checking
5. **Code style**: Follow PEP 8 and use `black` formatter

## License

This library is part of the Guia Turístico project. See main project LICENSE file.

## References

- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [Firefox WebDriver (GeckoDriver)](https://firefox-source-docs.mozilla.org/testing/geckodriver/)
- [Python 3.13 Release Notes](https://docs.python.org/3.13/whatsnew/3.13.html)
- [pytest Documentation](https://docs.pytest.org/)
- [Stack Overflow: Getting console log output from Firefox](https://stackoverflow.com/questions/23231931/getting-console-log-output-from-firefox-with-selenium)

## Version History

- **v1.0.0** (2026-01-04): Initial release
  - Console log capture for Firefox
  - pytest integration
  - Python 3.13 compatibility
  - Comprehensive test suite

## Support

For issues, questions, or contributions:
- Open an issue in the Guia Turístico repository
- See main project documentation
- Check functional requirements: `CONSOLE_LOG_CAPTURE_REQUIREMENTS.md`
