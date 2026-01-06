# Functional Requirements: Firefox Console Log Capture Library

## Document Information
- **Version**: 1.0.0
- **Date**: 2026-01-04
- **Python Version**: 3.13+
- **Selenium Version**: 4.15.0+
- **Test Framework**: pytest

## 1. Overview

### 1.1 Purpose
This library provides functionality to capture JavaScript console logs from Firefox browser during Selenium-based integration tests. It enables test developers to verify console output, detect JavaScript errors, and debug frontend issues programmatically.

### 1.2 Scope
- Capture console logs from Firefox browser using Selenium WebDriver
- Support multiple log levels (INFO, WARNING, ERROR, DEBUG)
- Integration with pytest test framework
- Python 3.13+ compatibility with modern type hints
- Thread-safe implementation for parallel test execution

### 1.3 Target Users
- QA Engineers running Selenium integration tests
- Developers debugging frontend JavaScript issues
- CI/CD pipelines validating console output

## 2. Technical Requirements

### 2.1 Python Version
- **Minimum**: Python 3.13.0
- **Rationale**: Modern type hints, improved error messages, better performance

### 2.2 Dependencies
```python
selenium >= 4.15.0  # Modern WebDriver API
pytest >= 7.0.0     # Test framework integration
typing-extensions   # Additional type hints if needed
```

### 2.3 Browser Support
- **Primary**: Firefox (latest stable)
- **WebDriver**: GeckoDriver (compatible with Firefox version)

## 3. Functional Requirements

### 3.1 Core Functionality

#### FR-1: Console Log Retrieval
**Description**: The library shall retrieve JavaScript console logs from Firefox browser.

**Acceptance Criteria**:
- Capture logs using Firefox's browser log capabilities
- Return logs as structured data (timestamp, level, message, source)
- Handle multiple log entries in a single retrieval
- Support real-time log capture during test execution

**Python 3.13 Implementation Notes**:
- Use modern type hints: `list[dict[str, str]]` instead of `List[Dict[str, str]]`
- Utilize structural pattern matching for log parsing (match/case)
- Leverage improved exception groups for error handling

#### FR-2: Log Level Filtering
**Description**: The library shall filter console logs by severity level.

**Supported Log Levels**:
- `SEVERE` / `ERROR`: JavaScript errors, uncaught exceptions
- `WARNING`: JavaScript warnings
- `INFO`: Informational messages
- `DEBUG`: Debug-level messages

**Acceptance Criteria**:
- Filter logs by single level
- Filter logs by multiple levels
- Default behavior captures all levels
- Return empty list if no logs match filter

#### FR-3: Firefox WebDriver Configuration
**Description**: The library shall configure Firefox WebDriver to enable console log capture.

**Acceptance Criteria**:
- Set appropriate Firefox preferences for logging
- Configure log levels in browser capabilities
- Preserve existing WebDriver options
- Work with both local and remote WebDriver instances

**Firefox Configuration Requirements**:
```python
# Enable browser console logging
firefox_options.set_preference("devtools.console.stdout.content", True)
firefox_options.log.level = "trace"  # Enable verbose logging
```

#### FR-4: pytest Integration
**Description**: The library shall integrate seamlessly with pytest framework.

**Acceptance Criteria**:
- Provide pytest fixtures for console log capture
- Support parameterized tests
- Compatible with pytest plugins
- Enable console log assertions in tests

#### FR-5: Error Handling
**Description**: The library shall handle errors gracefully.

**Error Scenarios**:
- Browser not supporting log retrieval
- WebDriver session closed
- Invalid log level specified
- Network timeouts
- JSON parsing errors

**Acceptance Criteria**:
- Raise custom exceptions with descriptive messages
- Log warnings for non-critical issues
- Return empty results instead of crashing
- Provide fallback mechanisms

### 3.2 Data Structures

#### Log Entry Structure
```python
from typing import TypedDict

class ConsoleLogEntry(TypedDict):
    timestamp: int          # Unix timestamp in milliseconds
    level: str             # Log level: SEVERE, WARNING, INFO, DEBUG
    message: str           # Console log message
    source: str            # Source URL or file
    line_number: int | None  # Line number if available
    column_number: int | None  # Column number if available
```

### 3.3 API Design

#### Class: `FirefoxConsoleCapture`

**Methods**:

1. **`__init__(driver: webdriver.Firefox)`**
   - Initialize with existing Firefox WebDriver instance
   - Store driver reference for log retrieval
   - Validate driver is Firefox instance

2. **`get_logs(level: str | None = None) -> list[ConsoleLogEntry]`**
   - Retrieve console logs from browser
   - Filter by level if specified
   - Return structured log entries
   - Clear logs after retrieval (optional parameter)

3. **`get_errors() -> list[ConsoleLogEntry]`**
   - Convenience method to get ERROR/SEVERE logs
   - Returns only error-level console messages

4. **`get_warnings() -> list[ConsoleLogEntry]`**
   - Convenience method to get WARNING logs
   - Returns only warning-level console messages

5. **`clear_logs() -> None`**
   - Clear all captured console logs
   - Reset internal state

6. **`wait_for_log(message_pattern: str, timeout: float = 10.0) -> ConsoleLogEntry | None`**
   - Wait for a specific console log message
   - Support regex pattern matching
   - Timeout after specified duration
   - Return matching log entry or None

#### pytest Fixture: `console_capture`

**Usage Example**:
```python
@pytest.fixture
def console_capture(firefox_driver):
    """Fixture providing console log capture for Firefox."""
    return FirefoxConsoleCapture(firefox_driver)

def test_javascript_errors(firefox_driver, console_capture):
    firefox_driver.get("https://example.com")
    errors = console_capture.get_errors()
    assert len(errors) == 0, f"Unexpected console errors: {errors}"
```

### 3.4 Configuration

#### Configuration File: `console_capture_config.py`

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class ConsoleConfig:
    """Configuration for console log capture."""
    
    # Default log level to capture
    default_level: str = "INFO"
    
    # Clear logs after each retrieval
    auto_clear: bool = False
    
    # Include source location in logs
    include_source: bool = True
    
    # Maximum log entries to retrieve (prevent memory issues)
    max_entries: int = 1000
    
    # Timeout for waiting for logs (seconds)
    wait_timeout: float = 10.0
```

## 4. Non-Functional Requirements

### 4.1 Performance
- Log retrieval should complete within 500ms for typical scenarios
- Support capturing up to 10,000 log entries without performance degradation
- Minimal memory overhead (<50MB for typical usage)

### 4.2 Reliability
- Handle browser crashes gracefully
- Recover from WebDriver session errors
- Retry mechanism for transient failures (max 3 retries)

### 4.3 Maintainability
- Type hints for all public APIs (Python 3.13 style)
- Docstrings following Google style guide
- Unit test coverage > 80%
- Integration test coverage for key workflows

### 4.4 Compatibility
- Compatible with existing integration tests (no breaking changes)
- Support both synchronous and asynchronous test execution
- Work with pytest-xdist for parallel testing

## 5. Implementation Notes

### 5.1 Python 3.13 Specific Features

#### Modern Type Hints
```python
# Use built-in generics (no List, Dict imports needed)
def get_logs(self) -> list[dict[str, str | int]]:
    ...

# Union types with | operator
def process_log(entry: str | dict) -> ConsoleLogEntry | None:
    ...

# Type aliases for clarity
type LogLevel = str
type Timestamp = int
```

#### Structural Pattern Matching
```python
def parse_log_level(level_str: str) -> LogLevel:
    match level_str.upper():
        case "SEVERE" | "ERROR":
            return "ERROR"
        case "WARNING" | "WARN":
            return "WARNING"
        case "INFO":
            return "INFO"
        case "DEBUG":
            return "DEBUG"
        case _:
            raise ValueError(f"Unknown log level: {level_str}")
```

#### Exception Groups
```python
try:
    logs = self._retrieve_logs()
except* WebDriverException as eg:
    # Handle WebDriver errors
    logger.warning(f"WebDriver errors: {eg}")
except* JSONDecodeError as eg:
    # Handle parsing errors
    logger.error(f"JSON parsing errors: {eg}")
```

### 5.2 Selenium 4.x API Updates

**Old API (Python 3.8, Selenium 3.x)**:
```python
# Deprecated approach
logs = driver.get_log('browser')
```

**New API (Python 3.13, Selenium 4.15+)**:
```python
# Modern approach using service logs
from selenium.webdriver.firefox.service import Service as FirefoxService

service = FirefoxService(log_output="geckodriver.log")
driver = webdriver.Firefox(service=service)

# Get browser logs through CDP (Chrome DevTools Protocol) or direct access
logs = driver.get_log('browser')  # Still supported in Firefox
```

**Firefox-Specific Considerations**:
- Firefox uses GeckoDriver, not ChromeDriver
- Browser logs may require enabling specific Firefox preferences
- CDP support in Firefox is limited compared to Chrome
- Use Firefox's native logging capabilities

### 5.3 Known Limitations (from Stack Overflow Reference)

1. **Firefox Log Support**: 
   - Firefox's log capture differs from Chrome
   - Some log types may not be available
   - Workaround: Use custom console listener injection

2. **JavaScript Console API**:
   - Create custom console wrapper to capture logs
   - Inject JavaScript to intercept console methods
   - Store logs in browser storage for retrieval

**Workaround Implementation**:
```python
def inject_console_listener(driver: webdriver.Firefox) -> None:
    """Inject JavaScript to capture console logs."""
    script = """
    window._captured_logs = [];
    
    ['log', 'info', 'warn', 'error', 'debug'].forEach(function(method) {
        const original = console[method];
        console[method] = function(...args) {
            window._captured_logs.push({
                level: method.toUpperCase(),
                message: args.map(a => String(a)).join(' '),
                timestamp: Date.now()
            });
            original.apply(console, args);
        };
    });
    """
    driver.execute_script(script)

def retrieve_captured_logs(driver: webdriver.Firefox) -> list[dict]:
    """Retrieve logs captured by injected listener."""
    return driver.execute_script("return window._captured_logs || [];")
```

## 6. Testing Requirements

### 6.1 Unit Tests
- Test log parsing logic
- Test log filtering by level
- Test error handling
- Test configuration validation
- Mock WebDriver interactions

### 6.2 Integration Tests
- Test with real Firefox browser
- Test console.log(), console.error(), console.warn()
- Test with multiple log entries
- Test with malformed JavaScript
- Test timeout scenarios
- Test parallel test execution

### 6.3 Test Coverage Goals
- Unit tests: > 90% code coverage
- Integration tests: Cover all public API methods
- Edge cases: Browser crashes, network issues, invalid inputs

## 7. Documentation Requirements

### 7.1 User Documentation
- README with quick start guide
- API reference with examples
- Common troubleshooting scenarios
- Migration guide from old implementations

### 7.2 Code Documentation
- Type hints on all public methods
- Docstrings following Google style guide
- Inline comments for complex logic
- Architecture decision records (ADRs)

## 8. Success Criteria

### 8.1 Functional Acceptance
- [ ] Successfully capture console logs from Firefox
- [ ] Filter logs by level accurately
- [ ] pytest integration works without issues
- [ ] No breaking changes to existing tests
- [ ] Error handling covers all edge cases

### 8.2 Quality Metrics
- [ ] 90%+ unit test coverage
- [ ] All integration tests pass
- [ ] No critical security vulnerabilities
- [ ] Performance benchmarks met
- [ ] Documentation complete and accurate

### 8.3 Python 3.13 Compliance
- [ ] Uses modern type hints (no typing module imports for basic types)
- [ ] No deprecated APIs used
- [ ] Passes mypy strict mode
- [ ] Compatible with Python 3.13 standard library changes

## 9. Deliverables

1. **Library Module**: `firefox_console_capture.py`
2. **pytest Fixtures**: `conftest.py` updates
3. **Unit Tests**: `tests/unit/test_console_capture.py`
4. **Integration Tests**: `tests/integration/test_console_logging.py`
5. **Documentation**: `README_CONSOLE_CAPTURE.md`
6. **Example Usage**: `examples/console_capture_example.py`
7. **Configuration**: `console_capture_config.py`

## 10. Future Enhancements

- Support for Chrome browser console capture
- Real-time log streaming to test output
- Integration with logging frameworks (loguru, structlog)
- Performance profiling of JavaScript execution
- Network request/response logging
- Screenshot capture on console errors
- Export logs to external formats (JSON, CSV)

## 11. References

- Stack Overflow: Getting console log output from Firefox with Selenium
  (https://stackoverflow.com/questions/23231931/getting-console-log-output-from-firefox-with-selenium)
- Selenium 4 Documentation: https://www.selenium.dev/documentation/
- Firefox WebDriver: https://firefox-source-docs.mozilla.org/testing/geckodriver/
- Python 3.13 Release Notes: https://docs.python.org/3.13/whatsnew/3.13.html
- pytest Documentation: https://docs.pytest.org/

## 12. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | [To be filled] | 2026-01-04 | |
| QA Lead | [To be filled] | | |
| Tech Lead | [To be filled] | | |

---

**Document Version History**:
- v1.0.0 (2026-01-04): Initial functional requirements document
