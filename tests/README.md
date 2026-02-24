# Python Integration Tests

**Purpose**: Browser-based integration tests using Selenium WebDriver and pytest  
**Framework**: pytest + Selenium  
**Python Version**: 3.11+  
**Test Coverage**: Visual hierarchy, console logging, geolocation workflows

---

## 📋 Overview

This directory contains **Python-based integration tests** that complement the main Jest test suite. These tests focus on **real browser behavior** using Selenium WebDriver.

### Why Python + Selenium?

The Guia Turístico project uses **dual testing frameworks**:

| Framework | Location | Purpose | Speed |
|-----------|----------|---------|-------|
| **Jest (JavaScript)** | `__tests__/` | Unit & integration tests (mocked) | ⚡ Fast (~3 sec) |
| **Selenium (Python)** | `tests/` | Real browser UI/UX validation | 🐢 Slow (browser) |

**Selenium tests validate**:

- Real browser geolocation APIs
- Visual hierarchy and accessibility
- Console log capture during execution
- User interaction workflows
- Cross-browser compatibility

**See**: [TESTING.md](../TESTING.md) for comprehensive testing documentation.

---

## 🏗️ Directory Structure

```
tests/
├── requirements.txt              # Python dependencies
├── README.md                     # This file
├── e2e/                          # End-to-end test scenarios
│   ├── MilhoVerde-SerroMG.e2e.test.js  # Jest E2E test (not pytest)
│   └── README.md                 # E2E test documentation
└── integration/                  # Selenium integration tests
    ├── conftest.py               # pytest fixtures and configuration
    ├── firefox_console_capture.py        # Console log capture library
    ├── mock_geolocation_helper.py        # Geolocation mocking utilities
    ├── test_visual_hierarchy.py          # Visual component tests
    ├── test_console_logging.py           # Console capture tests
    ├── test_milho_verde_geolocation.py   # Geolocation workflow tests
    ├── venv/                     # Python virtual environment
    └── README_*.md               # Feature-specific documentation
```

---

## 🚀 Quick Start

### Prerequisites

**Required**:

- Python 3.11+ (`python3 --version`)
- Firefox browser (geckodriver recommended)
- OR Chrome browser (chromedriver as fallback)

**Verify Installation**:

```bash
# Check Python version
python3 --version  # Should show 3.11+

# Check browser availability
firefox --version  # For Firefox tests
# OR
google-chrome --version  # For Chrome tests
```

### Installation

```bash
# 1. Navigate to tests directory
cd tests/

# 2. Create Python virtual environment
python3 -m venv venv

# 3. Activate virtual environment
source venv/bin/activate          # Linux/macOS
# OR
venv\Scripts\activate              # Windows

# 4. Install dependencies
pip install -r requirements.txt

# 5. Verify installation
pip list | grep -E "selenium|pytest"
```

**Expected Output**:

```
pytest       9.0.2
selenium     4.39.0
```

---

## 🧪 Running Tests

### Basic Test Execution

```bash
# Activate venv first
source venv/bin/activate

# Run all integration tests
pytest integration/ -v

# Run specific test file
pytest integration/test_visual_hierarchy.py -v

# Run specific test function
pytest integration/test_console_logging.py::TestConsoleLogCapture::test_initialization_with_firefox_driver -v
```

### Test Options

```bash
# Headless mode (no browser window)
HEADLESS=true pytest integration/ -v

# Parallel execution (faster)
pytest integration/ -v -n auto

# Generate XML report (for CI/CD)
pytest integration/ -v --junitxml=test-results.xml

# Verbose output with full tracebacks
pytest integration/ -v --tb=long

# Stop on first failure
pytest integration/ -v -x
```

### Expected Results

```
============================= test session starts ==============================
platform linux -- Python 3.13.7, pytest-9.0.2, pluggy-1.5.0
collected 54 items

integration/test_visual_hierarchy.py ......... [16%]
integration/test_console_logging.py .......... [35%]
integration/test_milho_verde_geolocation.py ... [100%]

============================== 54 passed in 45.2s ===============================
```

---

## 📂 Test Categories

### 1. Visual Hierarchy Tests (`test_visual_hierarchy.py`)

**Purpose**: Validate Material Design 3 visual prominence  
**What it tests**:

- Location cards are larger than action buttons
- Cards have proper elevation and shadows
- Color contrast meets accessibility standards
- Responsive behavior on different screen sizes
- Hover states work correctly

**Running**:

```bash
pytest integration/test_visual_hierarchy.py -v
```

### 2. Console Log Capture Tests (`test_console_logging.py`)

**Purpose**: Test Firefox console log capture library  
**What it tests**:

- Console listener injection
- Log level filtering (error, warn, info)
- Automatic log collection
- pytest fixture integration

**Running**:

```bash
pytest integration/test_console_logging.py -v
```

### 3. Geolocation Workflow Tests (`test_milho_verde_geolocation.py`)

**Purpose**: End-to-end geolocation testing  
**What it tests**:

- Mock geolocation provider integration
- Coordinate display and formatting
- Address resolution via OpenStreetMap
- Brazilian address format validation

**Running**:

```bash
pytest integration/test_milho_verde_geolocation.py -v
```

---

## 🔧 Configuration

### pytest Configuration (`conftest.py`)

Shared fixtures for all tests:

**`firefox_driver`**: Firefox WebDriver instance with console logging enabled

```python
def test_example(firefox_driver):
    firefox_driver.get("http://localhost:9000/src/index.html")
    assert "Guia Turístico" in firefox_driver.title
```

**`console_capture`**: Console log capture instance

```python
def test_console(firefox_driver, console_capture):
    firefox_driver.get("http://localhost:9000/src/index.html")
    console_capture.assert_no_errors()
```

**`base_url`**: Base URL for application (file:// protocol)

```python
def test_page(firefox_driver, base_url):
    firefox_driver.get(f"{base_url}/index.html")
```

### Browser Configuration

Tests automatically try **Firefox first**, then fall back to **Chrome**:

```python
# Firefox (recommended)
options = webdriver.FirefoxOptions()
options.add_argument('--headless')  # If HEADLESS=true
driver = webdriver.Firefox(options=options)

# Chrome (fallback)
options = webdriver.ChromeOptions()
options.add_argument('--headless=new')
driver = webdriver.Chrome(options=options)
```

---

## 🛠️ Browser Drivers

### Installing geckodriver (Firefox)

**Linux**:

```bash
# Download latest geckodriver
wget https://github.com/mozilla/geckodriver/releases/download/v0.35.0/geckodriver-v0.35.0-linux64.tar.gz
tar -xvzf geckodriver-v0.35.0-linux64.tar.gz
sudo mv geckodriver /usr/local/bin/
```

**macOS**:

```bash
brew install geckodriver
```

**Verify**:

```bash
geckodriver --version
```

### Installing chromedriver (Chrome)

**Linux**:

```bash
# Install via package manager
sudo apt install chromium-chromedriver
```

**macOS**:

```bash
brew install chromedriver
```

**Verify**:

```bash
chromedriver --version
```

---

## 📊 Test Reports

### Console Output

Standard pytest output shows:

- Test file and function names
- Pass/fail status with ✓/✗
- Execution time
- Summary statistics

### XML Reports (CI/CD)

Generate XML reports for CI/CD integration:

```bash
pytest integration/ --junitxml=test-results.xml
```

### HTML Reports (Optional)

Install and use pytest-html:

```bash
pip install pytest-html
pytest integration/ --html=report.html --self-contained-html
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: `ModuleNotFoundError: No module named 'pytest'`  
**Solution**: Activate virtual environment: `source venv/bin/activate`

**Issue**: `WebDriverException: 'geckodriver' executable needs to be in PATH`  
**Solution**: Install geckodriver (see Browser Drivers section above)

**Issue**: `selenium.common.exceptions.SessionNotCreatedException: Could not start a new session`  
**Solution**: Update browser or WebDriver to compatible versions

**Issue**: Tests fail with "Connection refused"  
**Solution**: Ensure web server is running: `python3 -m http.server 9000`

**Issue**: `HEADLESS=true` not working  
**Solution**: Check environment variable is set before pytest command

### Debug Mode

Run tests with maximum verbosity:

```bash
pytest integration/ -vvv --tb=long --capture=no
```

This shows:

- Full test output (no capture)
- Complete tracebacks
- All print statements

---

## 🔗 Relationship to Jest Tests

### Complementary Testing Strategy

| Test Type | Framework | Location | Purpose |
|-----------|-----------|----------|---------|
| **Unit Tests** | Jest | `__tests__/unit/` | Pure function testing |
| **Integration Tests (Mock)** | Jest | `__tests__/integration/` | Component interaction (mocked) |
| **E2E Tests (Mock)** | Jest | `__tests__/e2e/` | Complete workflows (mocked APIs) |
| **E2E Tests (Real)** | Jest | `tests/e2e/` | Specific real-data scenarios |
| **Browser Tests** | Selenium + pytest | `tests/integration/` | Real browser validation |

### When to Use Each

**Use Jest** (JavaScript):

- Testing business logic
- Testing data transformations
- Fast TDD workflow
- CI/CD automation (runs on every commit)

**Use Selenium** (Python):

- Testing UI rendering
- Testing real browser APIs (geolocation, console)
- Visual hierarchy validation
- Accessibility compliance
- Pre-release validation (manual)

**See**: [TESTING.md](../TESTING.md) "Dual Testing Systems" section for complete explanation.

---

## 📚 Additional Documentation

### Feature-Specific Guides

- **[integration/README_CONSOLE_CAPTURE.md](integration/README_CONSOLE_CAPTURE.md)** - Console log capture library
- **[integration/README_GEOLOCATION_MOCKING.md](integration/README_GEOLOCATION_MOCKING.md)** - Geolocation mocking utilities
- **[integration/README_MILHO_VERDE.md](integration/README_MILHO_VERDE.md)** - Milho Verde test case
- **[integration/README_MOCK_GEOLOCATION.md](integration/README_MOCK_GEOLOCATION.md)** - Mock geolocation implementation

### Project Documentation

- **[../TESTING.md](../TESTING.md)** - Main testing guide (Portuguese)
- **[../docs/INDEX.md](../docs/INDEX.md)** - Documentation index
- **[../.github/CONTRIBUTING.md](../.github/CONTRIBUTING.md)** - Contribution guidelines

---

## 🤝 Contributing

### Adding New Tests

1. Create test file in `integration/` directory: `test_my_feature.py`
2. Import pytest and fixtures: `from conftest import firefox_driver`
3. Write test functions: `def test_my_feature(firefox_driver):`
4. Run locally: `pytest integration/test_my_feature.py -v`
5. Update this README if adding new test category

### Test Naming Convention

- **File names**: `test_*.py` (pytest convention)
- **Class names**: `TestFeatureName` (optional, for grouping)
- **Function names**: `test_specific_behavior()`

### Best Practices

- ✅ Use fixtures from `conftest.py` for shared setup
- ✅ Clean up resources in fixture teardown
- ✅ Use explicit waits (WebDriverWait) instead of time.sleep()
- ✅ Test one behavior per test function
- ✅ Use descriptive test names
- ✅ Add docstrings explaining test purpose

---

## 📜 Version History

- **2026-01-09**: Added comprehensive README and requirements.txt
- **2026-01-05**: Added geolocation workflow tests
- **2026-01-03**: Added console log capture tests
- **2025-12-31**: Initial visual hierarchy tests

---

## 🔍 Quick Reference

### Essential Commands

```bash
# Setup
python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# Run all tests
pytest integration/ -v

# Run with headless browser
HEADLESS=true pytest integration/ -v

# Run specific test
pytest integration/test_visual_hierarchy.py -v

# Generate XML report
pytest integration/ --junitxml=test-results.xml

# Deactivate venv
deactivate
```

### File Structure at a Glance

```
tests/
├── requirements.txt          ← Dependencies
├── README.md                 ← You are here
├── e2e/                      ← Jest E2E tests (not pytest)
└── integration/              ← Selenium pytest tests
    ├── conftest.py           ← pytest configuration
    ├── test_*.py             ← Test files
    └── venv/                 ← Virtual environment
```

---

**Last Updated**: 2026-01-09  
**Python Version**: 3.11+  
**Selenium Version**: 4.39.0  
**pytest Version**: 9.0.2  
**Maintained By**: Guia Turístico testing team
