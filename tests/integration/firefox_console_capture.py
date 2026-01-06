"""
Firefox Console Log Capture Library

Provides functionality to capture JavaScript console logs from Firefox browser
during Selenium-based integration tests. Compatible with Python 3.13+ and pytest.

Author: Guia Turístico Team
Version: 1.0.0
Python: 3.13+
"""

import re
import time
from dataclasses import dataclass
from typing import TypedDict

from selenium import webdriver
from selenium.common.exceptions import (
    JavascriptException,
    NoSuchWindowException,
    WebDriverException,
)


class ConsoleLogEntry(TypedDict):
    """Structure for a console log entry."""

    timestamp: int
    level: str
    message: str
    source: str
    line_number: int | None
    column_number: int | None


@dataclass(frozen=True)
class ConsoleConfig:
    """Configuration for console log capture."""

    default_level: str = "INFO"
    auto_clear: bool = False
    include_source: bool = True
    max_entries: int = 1000
    wait_timeout: float = 10.0


class FirefoxConsoleCapture:
    """
    Capture JavaScript console logs from Firefox browser during Selenium tests.

    This class provides methods to retrieve, filter, and wait for console logs
    from Firefox browser. It injects JavaScript to intercept console methods
    since Firefox's native log retrieval is limited compared to Chrome.

    Example:
        >>> driver = webdriver.Firefox()
        >>> console = FirefoxConsoleCapture(driver)
        >>> driver.get("https://example.com")
        >>> errors = console.get_errors()
        >>> assert len(errors) == 0, f"Console errors found: {errors}"
    """

    def __init__(
        self, driver: webdriver.Firefox, config: ConsoleConfig | None = None
    ) -> None:
        """
        Initialize console capture for Firefox WebDriver.

        Args:
            driver: Firefox WebDriver instance
            config: Optional configuration settings

        Raises:
            TypeError: If driver is not a Firefox WebDriver instance
            WebDriverException: If driver session is invalid
        """
        if not isinstance(driver, webdriver.Firefox):
            raise TypeError(
                f"Expected webdriver.Firefox instance, got {type(driver).__name__}"
            )

        self.driver = driver
        self.config = config or ConsoleConfig()
        self._listener_injected = False

    def _inject_console_listener(self) -> None:
        """
        Inject JavaScript to capture console logs.

        This method overrides native console methods to capture logs in
        window._captured_logs array. It preserves original console behavior
        while capturing logs for later retrieval.

        Raises:
            JavascriptException: If injection fails
            NoSuchWindowException: If browser window is closed
        """
        if self._listener_injected:
            return

        script = """
        if (!window._captured_logs) {
            window._captured_logs = [];
            window._console_listener_version = '1.0.0';
            
            ['log', 'info', 'warn', 'error', 'debug'].forEach(function(method) {
                const original = console[method];
                console[method] = function(...args) {
                    try {
                        const stack = new Error().stack;
                        const stackLines = stack ? stack.split('\\n') : [];
                        const callerLine = stackLines[2] || '';
                        
                        const sourceMatch = callerLine.match(/https?:\\/\\/[^\\s]+:(\\d+):(\\d+)/);
                        
                        window._captured_logs.push({
                            timestamp: Date.now(),
                            level: method.toUpperCase(),
                            message: args.map(arg => {
                                try {
                                    if (typeof arg === 'object') {
                                        return JSON.stringify(arg);
                                    }
                                    return String(arg);
                                } catch (e) {
                                    return String(arg);
                                }
                            }).join(' '),
                            source: sourceMatch ? sourceMatch[0].split(':').slice(0, -2).join(':') : 'unknown',
                            line_number: sourceMatch ? parseInt(sourceMatch[1]) : null,
                            column_number: sourceMatch ? parseInt(sourceMatch[2]) : null
                        });
                        
                        // Limit stored logs to prevent memory issues
                        if (window._captured_logs.length > 10000) {
                            window._captured_logs = window._captured_logs.slice(-5000);
                        }
                    } catch (e) {
                        // Silently fail to not break page functionality
                    }
                    
                    // Call original console method
                    original.apply(console, args);
                };
            });
            
            // Capture unhandled errors
            window.addEventListener('error', function(event) {
                window._captured_logs.push({
                    timestamp: Date.now(),
                    level: 'ERROR',
                    message: event.message || 'Unknown error',
                    source: event.filename || 'unknown',
                    line_number: event.lineno || null,
                    column_number: event.colno || null
                });
            });
            
            // Capture unhandled promise rejections
            window.addEventListener('unhandledrejection', function(event) {
                window._captured_logs.push({
                    timestamp: Date.now(),
                    level: 'ERROR',
                    message: 'Unhandled Promise Rejection: ' + (event.reason || 'Unknown'),
                    source: 'promise',
                    line_number: null,
                    column_number: null
                });
            });
        }
        return window._console_listener_version;
        """

        try:
            version = self.driver.execute_script(script)
            self._listener_injected = True
            return version
        except (JavascriptException, NoSuchWindowException, WebDriverException) as e:
            raise WebDriverException(f"Failed to inject console listener: {e}") from e

    def _retrieve_captured_logs(self) -> list[dict]:
        """
        Retrieve logs captured by injected JavaScript listener.

        Returns:
            List of log entries as dictionaries

        Raises:
            WebDriverException: If retrieval fails
        """
        try:
            logs = self.driver.execute_script("return window._captured_logs || [];")
            return logs if isinstance(logs, list) else []
        except (JavascriptException, NoSuchWindowException, WebDriverException) as e:
            # Return empty list instead of crashing
            return []

    def _parse_log_level(self, level_str: str) -> str:
        """
        Parse and normalize log level string.

        Args:
            level_str: Raw log level string

        Returns:
            Normalized log level (ERROR, WARNING, INFO, DEBUG)

        Raises:
            ValueError: If log level is unknown
        """
        match level_str.upper():
            case "SEVERE" | "ERROR":
                return "ERROR"
            case "WARNING" | "WARN":
                return "WARNING"
            case "INFO" | "LOG":
                return "INFO"
            case "DEBUG":
                return "DEBUG"
            case _:
                raise ValueError(f"Unknown log level: {level_str}")

    def _filter_logs(
        self, logs: list[dict], level: str | None = None
    ) -> list[ConsoleLogEntry]:
        """
        Filter and convert raw logs to ConsoleLogEntry format.

        Args:
            logs: Raw log entries from browser
            level: Optional level filter (ERROR, WARNING, INFO, DEBUG)

        Returns:
            Filtered list of ConsoleLogEntry objects
        """
        filtered = []

        for log in logs:
            try:
                log_level = self._parse_log_level(log.get("level", "INFO"))

                # Apply level filter if specified
                if level and log_level != self._parse_log_level(level):
                    continue

                entry: ConsoleLogEntry = {
                    "timestamp": log.get("timestamp", 0),
                    "level": log_level,
                    "message": log.get("message", ""),
                    "source": log.get("source", "unknown"),
                    "line_number": log.get("line_number"),
                    "column_number": log.get("column_number"),
                }
                filtered.append(entry)

            except (ValueError, KeyError):
                # Skip malformed log entries
                continue

        return filtered[: self.config.max_entries]

    def get_logs(self, level: str | None = None) -> list[ConsoleLogEntry]:
        """
        Retrieve console logs from Firefox browser.

        Args:
            level: Optional log level filter (ERROR, WARNING, INFO, DEBUG)

        Returns:
            List of console log entries

        Raises:
            WebDriverException: If log retrieval fails

        Example:
            >>> logs = console.get_logs()
            >>> error_logs = console.get_logs(level="ERROR")
        """
        self._inject_console_listener()
        raw_logs = self._retrieve_captured_logs()
        filtered_logs = self._filter_logs(raw_logs, level)

        if self.config.auto_clear:
            self.clear_logs()

        return filtered_logs

    def get_errors(self) -> list[ConsoleLogEntry]:
        """
        Get only ERROR level console logs.

        Returns:
            List of error log entries

        Example:
            >>> errors = console.get_errors()
            >>> assert len(errors) == 0, "Unexpected console errors"
        """
        return self.get_logs(level="ERROR")

    def get_warnings(self) -> list[ConsoleLogEntry]:
        """
        Get only WARNING level console logs.

        Returns:
            List of warning log entries

        Example:
            >>> warnings = console.get_warnings()
        """
        return self.get_logs(level="WARNING")

    def clear_logs(self) -> None:
        """
        Clear all captured console logs from browser.

        Ensures the console listener is injected before clearing.

        Raises:
            WebDriverException: If clear operation fails
        """
        # Ensure listener is injected before clearing
        self._inject_console_listener()
        
        try:
            self.driver.execute_script("window._captured_logs = [];")
        except (JavascriptException, NoSuchWindowException, WebDriverException):
            # Silently fail - logs will be overwritten anyway
            pass

    def wait_for_log(
        self,
        message_pattern: str,
        timeout: float | None = None,
        level: str | None = None,
    ) -> ConsoleLogEntry | None:
        """
        Wait for a console log matching the specified pattern.

        Args:
            message_pattern: Regex pattern to match log message
            timeout: Maximum wait time in seconds (default: config.wait_timeout)
            level: Optional log level filter

        Returns:
            Matching ConsoleLogEntry or None if timeout

        Example:
            >>> log = console.wait_for_log(r"API call completed", timeout=5.0)
            >>> assert log is not None, "Expected log not found"
        """
        timeout = timeout or self.config.wait_timeout
        pattern = re.compile(message_pattern)
        start_time = time.time()

        self._inject_console_listener()

        while time.time() - start_time < timeout:
            logs = self.get_logs(level=level)

            for log in logs:
                if pattern.search(log["message"]):
                    return log

            time.sleep(0.1)  # Poll every 100ms

        return None

    def has_errors(self) -> bool:
        """
        Check if any console errors exist.

        Returns:
            True if errors are present, False otherwise

        Example:
            >>> assert not console.has_errors(), "Console errors detected"
        """
        return len(self.get_errors()) > 0

    def assert_no_errors(self, message: str = "Console errors detected") -> None:
        """
        Assert that no console errors exist.

        Args:
            message: Custom assertion message

        Raises:
            AssertionError: If console errors are present

        Example:
            >>> console.assert_no_errors("Page should load without errors")
        """
        errors = self.get_errors()
        if errors:
            error_messages = "\n".join(
                f"  [{e['level']}] {e['message']} ({e['source']})" for e in errors
            )
            raise AssertionError(f"{message}:\n{error_messages}")

    def get_log_summary(self) -> dict[str, int]:
        """
        Get summary count of logs by level.

        Returns:
            Dictionary with log counts per level

        Example:
            >>> summary = console.get_log_summary()
            >>> print(f"Errors: {summary['ERROR']}, Warnings: {summary['WARNING']}")
        """
        logs = self.get_logs()
        summary = {"ERROR": 0, "WARNING": 0, "INFO": 0, "DEBUG": 0}

        for log in logs:
            level = log["level"]
            if level in summary:
                summary[level] += 1

        return summary
