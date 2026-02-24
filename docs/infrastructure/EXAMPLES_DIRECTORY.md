# Examples Directory Documentation

**Last Updated**: 2026-01-16  
**Version**: 0.9.0-alpha  
**Purpose**: Document the purpose and organization of the `examples/` directory

## Overview

The `examples/` directory contains **18 demonstration files** (184KB total, ~4,000 lines) showcasing various features and testing patterns of Guia Turístico.

## Directory Purpose

### Primary Uses

1. **Interactive Demos** - Browser-based feature demonstrations
2. **Development Testing** - Quick manual testing of components
3. **Code Examples** - Reference implementations for developers
4. **Legacy Tests** - Historical test files (pre-Jest infrastructure)

## File Categories

### 1. Feature Demonstrations (Interactive HTML)

| File | Purpose | Status |
|------|---------|--------|
| `address-converter.html` | Coordinate ↔ Address conversion demo | ✅ Active |
| `loc-em-movimento.html` | Real-time location tracking demo | ✅ Active |
| `test.html` | General feature testing | ✅ Active |

### 2. Component Testing (HTML)

| File | Purpose | Status |
|------|---------|--------|
| `bairro-display-test.html` | Neighborhood display component | ✅ Active |
| `brazilian-voice-test.html` | Portuguese speech synthesis | ✅ Active |
| `device-detection-test.html` | Device capability detection | ✅ Active |
| `ibira-test.html` | IBGE integration testing | ✅ Active |
| `immediate-address-test.html` | Address lookup performance | ✅ Active |
| `module-test.html` | ES6 module loading | ✅ Active |
| `speech-queue-test.html` | Speech queue management | ✅ Active |
| `test-50s-speech.html` | Long speech synthesis | ✅ Active |
| `timeout-test.html` | Timeout handling | ✅ Active |
| `timer-test.html` | Timer management | ✅ Active |

### 3. Code Examples (JavaScript)

| File | Purpose | Status |
|------|---------|--------|
| `geoposition-immutability-demo.js` | Immutability patterns | ✅ Active |
| `geolocation-service-demo.js` | Geolocation API usage | ✅ Active |
| `provider-pattern-demo.js` | Provider pattern implementation | ✅ Active |
| `jest-esm-migration-example.js` | Jest ESM migration guide | 📋 Reference |

### 4. Documentation

| File | Purpose | Status |
|------|---------|--------|
| `README.md` | Directory documentation | ✅ Current |

## Usage Guidelines

### Running Examples

#### Browser-Based Examples (HTML)

```bash
# Start web server
python3 -m http.server 9000

# Open in browser
open http://localhost:9000/examples/address-converter.html
```

#### Node.js Examples (JavaScript)

```bash
# From project root
node examples/geoposition-immutability-demo.js

# Expected output: Immutability demonstration
```

### Development Workflow

1. **Quick Testing**: Use HTML examples for rapid feature testing
2. **Demo Creation**: Create new examples for feature showcases
3. **Documentation**: Reference examples in docs and README
4. **Legacy Support**: Keep working examples for historical reference

## Relationship to Test Infrastructure

### Examples vs. Automated Tests

| Aspect | Examples (`examples/`) | Jest Tests (`__tests__/`) |
|--------|----------------------|--------------------------|
| **Purpose** | Manual demonstration | Automated validation |
| **Execution** | Browser/Node manual | CI/CD automated |
| **Coverage** | Feature showcase | 1,820 passing tests |
| **Maintenance** | Low priority | High priority |
| **Users** | Developers, demos | CI/CD pipeline |

### When to Use Each

- ✅ **Use Examples** for: Quick demos, feature showcases, manual testing
- ✅ **Use Jest Tests** for: Regression testing, CI/CD, code coverage

## Maintenance Strategy

### Current Status (v0.9.0-alpha)

- ✅ 18 example files maintained
- ✅ README.md up to date
- ⚠️ Some examples may be outdated (pre-v0.9.0)

### Recommended Actions

1. **Audit Examples**: Verify all examples work with v0.9.0-alpha
2. **Categorize**: Add category comments to file headers
3. **Archive**: Move deprecated examples to `examples/archive/`
4. **Index**: Create `examples/INDEX.md` with categorized list

### Future Organization

```
examples/
├── README.md              # Overview
├── INDEX.md              # Categorized file list (NEW)
├── active/               # Current working examples (NEW)
│   ├── demos/           # Feature demonstrations
│   ├── testing/         # Component testing
│   └── patterns/        # Code pattern examples
└── archive/             # Historical/deprecated (NEW)
    └── pre-v0.7/        # Pre-refactor examples
```

## Known Issues

### Potential "Pollution" Concerns

❓ **Issue**: 18 files (184KB) in root examples/ may seem excessive

**Analysis**:

- ✅ Files are **organized and documented**
- ✅ Each serves a **specific testing/demo purpose**
- ⚠️ Some may be **outdated** (need audit)
- ⚠️ Could benefit from **subcategory organization**

**Recommendation**:

1. Audit for outdated examples (2 hours)
2. Organize into subdirectories (1 hour)
3. Archive deprecated files (30 min)

## Related Documentation

- `docs/testing/TEST_INFRASTRUCTURE.md` - Test infrastructure overview
- `docs/testing/TESTING.md` - Comprehensive testing guide
- `.github/CONTRIBUTING.md` - Development workflow
- `README.md` - Main project documentation

---

**Status**: Active directory with 18 examples  
**Maintenance**: Audit recommended for v0.9.0  
**Organization**: Subcategory structure planned
