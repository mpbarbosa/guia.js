# Testing HTML Generation in JavaScript

**Project**: Guia Turístico v0.9.0-alpha  
**Topic**: Strategies for Testing HTML-Generating Code  
**Last Updated**: 2026-01-11

---

## 📋 Overview

This document describes comprehensive strategies for testing JavaScript code that generates HTML, based on the existing test infrastructure in the guia_js project. We have **1224+ tests** covering HTML generation across multiple approaches.

---

## 🎯 Key Testing Strategies

### 1. **String-Based HTML Testing** (Primary Approach)
Test HTML generation by validating the string output without requiring a real DOM.

#### Example: HTMLAddressDisplayer

```javascript
test('should render complete São Paulo address with all attributes', () => {
    const addressData = {
        display_name: 'Avenida Paulista, 1578, Bela Vista, São Paulo, SP, Brasil',
        address: {
            road: 'Avenida Paulista',
            house_number: '1578',
            neighbourhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'São Paulo'
        }
    };
    
    const html = displayer.renderAddressHtml(addressData);
    
    // Validate HTML structure
    expect(html).toContain('address-details');
    expect(html).toContain('Endereço Atual');
    
    // Validate content
    expect(html).toContain('Avenida Paulista, 1578, Bela Vista');
    expect(html).toContain('display_name');
});
```

**Advantages**:
- ✅ Fast execution (no DOM manipulation)
- ✅ No browser/JSDOM dependency
- ✅ Easy to test specific HTML patterns
- ✅ Works in Node.js test environment

**Use Cases**:
- Testing HTML string generation methods
- Validating template rendering
- Checking HTML structure and CSS classes
- Verifying content inclusion

---

### 2. **Mock DOM Elements**
Use lightweight JavaScript objects that mimic DOM elements without full DOM implementation.

#### Example: HTMLAddressDisplayer with Mock Elements

```javascript
let mockElement, displayer;

beforeEach(() => {
    // Create lightweight mock DOM element
    mockElement = {
        id: 'address-display',
        innerHTML: ''
    };
    
    displayer = new HTMLAddressDisplayer(mockElement);
});

test('should update element on position update event', () => {
    const addressData = {
        display_name: 'Praça da Sé, São Paulo, SP',
        address: {
            place: 'Praça da Sé',
            city: 'São Paulo'
        }
    };
    
    displayer.update(addressData, null, 'strCurrPosUpdate', false, null);
    
    // Verify innerHTML was updated
    expect(mockElement.innerHTML).toContain('Praça da Sé');
    expect(mockElement.innerHTML).toContain('São Paulo');
});
```

**Advantages**:
- ✅ Lightweight and fast
- ✅ Tests DOM interaction patterns
- ✅ No external dependencies
- ✅ Easy to inspect state changes

**Use Cases**:
- Testing observer pattern implementations
- Validating DOM updates
- Checking innerHTML/textContent manipulation
- Testing element property changes

---

### 3. **HTML Structure Validation**
Validate the semantic correctness of generated HTML.

#### Example: Structural Tests

```javascript
test('should generate proper HTML5 details/summary structure', () => {
    const addressData = {
        display_name: 'Test Structure',
        address: { road: 'Test Road' }
    };
    
    const html = displayer.renderAddressHtml(addressData);
    
    // Validate HTML5 semantic structure
    expect(html).toContain('<details class="address-details" closed>');
    expect(html).toContain('<summary><strong>Endereço Atual</strong></summary>');
    expect(html).toContain('</details>');
});

test('should close all HTML tags properly', () => {
    const html = displayer.renderAddressHtml(addressData);
    
    // Count opening and closing tags
    const openingTags = (html.match(/<\w+/g) || []).length;
    const closingTags = (html.match(/<\/\w+>/g) || []).length;
    const selfClosingTags = (html.match(/<\w+[^>]*\/>/g) || []).length;
    
    // Should have balanced tags
    expect(openingTags - selfClosingTags).toBe(closingTags);
});
```

**Advantages**:
- ✅ Validates HTML correctness
- ✅ Catches malformed HTML early
- ✅ Ensures semantic structure
- ✅ Language-agnostic validation

**Use Cases**:
- Validating tag balancing
- Checking HTML5 semantic elements
- Verifying CSS class names
- Testing accessibility attributes

---

### 4. **CSS Class and Attribute Testing**
Ensure generated HTML includes correct styling hooks and semantic attributes.

#### Example: Class and Attribute Validation

```javascript
test('should generate semantic CSS classes for styling', () => {
    const html = displayer.renderAddressHtml(addressData);
    
    // Validate CSS classes for styling
    expect(html).toContain('class="address-details"');
    expect(html).toContain('class="address-attributes"');
    expect(html).toContain('class="full-address"');
    expect(html).toContain('class="display-name"');
});

test('should include proper error state classes', () => {
    const errorHtml = displayer.renderAddressHtml(null);
    
    expect(errorHtml).toContain("class='error'");
});

test('should include loading state classes', () => {
    displayer.update(null, null, 'strCurrPosUpdate', true, null);
    
    expect(mockElement.innerHTML).toContain('class="loading"');
});
```

**Advantages**:
- ✅ Ensures correct CSS targeting
- ✅ Validates state classes
- ✅ Tests accessibility attributes
- ✅ Verifies data attributes

---

### 5. **Content Escaping and Security**
Test that HTML generation properly handles special characters and prevents injection.

#### Example: Security Tests

```javascript
test('should handle special characters in address data', () => {
    const addressData = {
        display_name: 'Praça da Sé, São Paulo',
        address: {
            place: 'Praça da Sé',
            special: '<script>alert("xss")</script>'
        }
    };
    
    const html = displayer.renderAddressHtml(addressData);
    
    // Should contain special characters correctly
    expect(html).toContain('Praça da Sé');
    expect(html).toContain('São Paulo');
    
    // Should NOT execute script tags (if using proper escaping)
    // Note: Current implementation uses innerHTML directly
    // Consider using textContent for user input
});

test('should handle null and undefined values safely', () => {
    const addressData = {
        display_name: 'Test',
        address: null,
        coordinates: undefined
    };
    
    const html = displayer.renderAddressHtml(addressData);
    
    expect(html).toContain('null');
    // undefined might not appear in JSON.stringify
});
```

---

### 6. **Edge Case and Error State Testing**
Validate behavior with unusual or missing data.

#### Example: Edge Cases

```javascript
test('should return error message for null address data', () => {
    const html = displayer.renderAddressHtml(null);
    
    expect(html).toContain("Dados de endereço não disponíveis");
    expect(html).toContain("class='error'");
});

test('should handle address data without display_name', () => {
    const addressData = {
        address: {
            road: 'Rua Augusta',
            neighbourhood: 'Consolação'
        }
    };
    
    const html = displayer.renderAddressHtml(addressData);
    
    expect(html).toContain('Rua Augusta');
    expect(html).not.toContain('Endereço Completo:');
});

test('should handle empty objects gracefully', () => {
    const addressData = {
        display_name: '',
        address: {},
        extratags: {}
    };
    
    const html = displayer.renderAddressHtml(addressData);
    
    expect(html).toContain('address-details');
    expect(html).toContain('{}'); // Empty object representation
});
```

---

### 7. **Localization Testing**
Verify correct language-specific content and formatting.

#### Example: Portuguese Localization

```javascript
test('should use Portuguese terms in HTML output', () => {
    const html = displayer.renderAddressHtml(addressData);
    
    expect(html).toContain('Endereço Atual');
    expect(html).toContain('Todos os atributos de addressData:');
    expect(html).toContain('Endereço Completo:');
});

test('should provide Portuguese error messages', () => {
    const errorHtml = displayer.renderAddressHtml(null);
    
    expect(errorHtml).toContain('não disponíveis');
});

test('should handle Portuguese special characters', () => {
    const addressData = {
        display_name: 'Praça da Sé, São Paulo, SP',
        address: {
            place: 'Praça da Sé'
        }
    };
    
    const html = displayer.renderAddressHtml(addressData);
    
    expect(html).toContain('Praça da Sé');
    expect(html).toContain('São Paulo');
});
```

---

### 8. **Performance and Memory Testing**
Ensure HTML generation performs well under load.

#### Example: Performance Tests

```javascript
test('should not create memory leaks with repeated updates', () => {
    const addressData = {
        display_name: 'Repeated Address Test',
        address: { road: 'Test Street' }
    };

    // Perform many updates
    for (let i = 0; i < 1000; i++) {
        displayer.update(addressData, null, 'strCurrPosUpdate', false, null);
    }

    // Should still work correctly
    expect(mockElement.innerHTML).toContain('Repeated Address Test');
});

test('should handle large address data objects efficiently', () => {
    const largeAddressData = {
        display_name: 'Large Address Test',
        address: {}
    };
    
    // Add many properties
    for (let i = 0; i < 100; i++) {
        largeAddressData.address[`property_${i}`] = `value_${i}`;
    }
    
    const html = displayer.renderAddressHtml(largeAddressData);
    
    expect(html).toContain('Large Address Test');
    expect(html).toContain('property_0');
    expect(html).toContain('property_99');
});
```

---

### 9. **Factory Pattern Testing**
Test HTML displayer creation through factory methods.

#### Example: DisplayerFactory Tests

```javascript
test('should create HTMLAddressDisplayer instance', () => {
    const displayer = DisplayerFactory.createAddressDisplayer(mockElement);

    expect(displayer).toBeDefined();
    expect(displayer).toBeInstanceOf(HTMLAddressDisplayer);
    expect(displayer.element).toBe(mockElement);
});

test('should create immutable address displayer', () => {
    const displayer = DisplayerFactory.createAddressDisplayer(mockElement);

    expect(Object.isFrozen(displayer)).toBe(true);
    
    expect(() => {
        displayer.newProperty = 'test';
    }).toThrow();
});

test('should produce consistent results across multiple calls', () => {
    const displayer1 = DisplayerFactory.createAddressDisplayer(mockElement, false);
    const displayer2 = DisplayerFactory.createAddressDisplayer(mockElement, false);

    expect(displayer1).not.toBe(displayer2);
    expect(displayer1.constructor).toBe(displayer2.constructor);
    expect(displayer1.element).toBe(displayer2.element);
});
```

---

### 10. **Integration Testing**
Test HTML generation in context with other modules.

#### Example: Integration Tests

```javascript
test('should work with DisplayerFactory', async () => {
    const guiaModule = await import('../../src/guia.js');
    const { DisplayerFactory } = guiaModule;
    
    const mockElement = { id: 'factory-test', innerHTML: '' };
    const displayer = DisplayerFactory.createAddressDisplayer(mockElement);
    
    expect(displayer).toBeInstanceOf(HTMLAddressDisplayer);
    expect(displayer.element).toBe(mockElement);
});

test('should work alongside other HTML display modules', async () => {
    const HtmlTextModule = await import('../../src/html/HtmlText.js');
    const HTMLPositionDisplayerModule = await import('../../src/html/HTMLPositionDisplayer.js');
    
    const HtmlText = HtmlTextModule.default;
    const HTMLPositionDisplayer = HTMLPositionDisplayerModule.default;
    
    // Create instances of all modules
    const textElement = { id: 'text-test', innerHTML: '' };
    const positionElement = { id: 'position-test', innerHTML: '' };
    const addressElement = { id: 'address-test', innerHTML: '' };
    
    const htmlText = new HtmlText(mockDocument, textElement);
    const positionDisplayer = new HTMLPositionDisplayer(positionElement);
    const addressDisplayer = new HTMLAddressDisplayer(addressElement);
    
    // All should be properly instantiated
    expect(htmlText).toBeDefined();
    expect(positionDisplayer).toBeDefined();
    expect(addressDisplayer).toBeDefined();
});
```

---

## 📊 Test Coverage Statistics

### Current Coverage (guia_js)
- **Total Tests**: 1224+ tests
- **Test Suites**: 57 suites
- **Overall Coverage**: ~70%
- **HTML Generation Coverage**: High (dedicated test files)

### Test Distribution
```
Unit Tests:
- HTMLAddressDisplayer.test.js       (~553 assertions)
- DisplayerFactory.test.js           (~521 assertions)
- HTMLPositionDisplayer.test.js      (comprehensive)
- HTMLReferencePlaceDisplayer.test.js (comprehensive)

Integration Tests:
- HTMLAddressDisplayer.integration.test.js (~375 assertions)
- DisplayerFactory.integration.test.js
- Cross-module compatibility tests
```

---

## 🛠️ Testing Tools and Setup

### Jest Configuration (package.json)

```json
{
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
    "test:watch": "node --experimental-vm-modules node_modules/jest/bin/jest.js --watch",
    "test:coverage": "node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage",
    "test:verbose": "node --experimental-vm-modules node_modules/jest/bin/jest.js --verbose"
  },
  "jest": {
    "testEnvironment": "node",
    "transform": {},
    "collectCoverageFrom": ["src/*.js", "!node_modules/**"]
  }
}
```

### Test File Structure

```
__tests__/
├── unit/
│   ├── HTMLAddressDisplayer.test.js
│   ├── DisplayerFactory.test.js
│   ├── HTMLPositionDisplayer.test.js
│   └── HTMLReferencePlaceDisplayer.test.js
└── integration/
    ├── HTMLAddressDisplayer.integration.test.js
    ├── DisplayerFactory.integration.test.js
    └── cross-module-tests.js
```

---

## 🎨 HTML Generation Patterns

### Pattern 1: Progressive Disclosure (HTML5 Details/Summary)

```javascript
renderAddressHtml(addressData) {
    let html = `<details class="address-details" closed>
        <summary><strong>Endereço Atual</strong></summary>`;
    
    // Content here
    
    html += `</details>`;
    return html;
}
```

**Testing Strategy**:
```javascript
test('should use progressive disclosure structure', () => {
    const html = displayer.renderAddressHtml(addressData);
    
    expect(html).toContain('<details class="address-details" closed>');
    expect(html).toContain('<summary>');
    expect(html).toContain('</details>');
});
```

---

### Pattern 2: Conditional Rendering

```javascript
renderAddressHtml(addressData) {
    if (!addressData) {
        return "<p class='error'>Dados de endereço não disponíveis.</p>";
    }
    
    let html = '<div>';
    
    if (addressData.display_name) {
        html += `<p>${addressData.display_name}</p>`;
    }
    
    html += '</div>';
    return html;
}
```

**Testing Strategy**:
```javascript
test('should return error for null data', () => {
    const html = displayer.renderAddressHtml(null);
    expect(html).toContain("class='error'");
});

test('should handle missing display_name', () => {
    const html = displayer.renderAddressHtml({ address: {} });
    expect(html).not.toContain('display_name');
});
```

---

### Pattern 3: Type-Aware Formatting

```javascript
for (const key in addressData) {
    const value = addressData[key];
    if (typeof value === 'object' && value !== null) {
        html += `<li><strong>${key}:</strong> <pre>${JSON.stringify(value, null, 2)}</pre></li>`;
    } else {
        html += `<li><strong>${key}:</strong> ${value}</li>`;
    }
}
```

**Testing Strategy**:
```javascript
test('should format nested objects with JSON pretty-printing', () => {
    const addressData = {
        address: { road: 'Test Street' },
        simple: 'value'
    };
    
    const html = displayer.renderAddressHtml(addressData);
    
    expect(html).toContain('<pre>');
    expect(html).toContain('Test Street');
});
```

---

## 🔥 Best Practices

### ✅ DO

1. **Test Pure Functions Separately**
   ```javascript
   // Good: Separate rendering logic
   renderAddressHtml(data) { return html; }
   update(data) { this.element.innerHTML = this.renderAddressHtml(data); }
   ```

2. **Use Mock Elements for DOM Interaction**
   ```javascript
   const mockElement = { innerHTML: '', id: 'test' };
   const displayer = new HTMLAddressDisplayer(mockElement);
   ```

3. **Validate HTML Structure, Not Exact Strings**
   ```javascript
   expect(html).toContain('<details');
   expect(html).toContain('address-details');
   ```

4. **Test Edge Cases and Error States**
   ```javascript
   test('null data', () => { ... });
   test('empty data', () => { ... });
   test('malformed data', () => { ... });
   ```

5. **Use String Pattern Matching**
   ```javascript
   expect(html).toMatch(/<details[^>]*>/);
   expect(html).toContain('class="error"');
   ```

6. **Test Localization**
   ```javascript
   expect(html).toContain('Endereço Atual');
   expect(errorHtml).toContain('não disponíveis');
   ```

---

### ❌ DON'T

1. **Don't Test Exact HTML Strings**
   ```javascript
   // Bad: Brittle to formatting changes
   expect(html).toBe('<div class="address"><p>...</p></div>');
   
   // Good: Test presence of key elements
   expect(html).toContain('class="address"');
   expect(html).toContain('<p>');
   ```

2. **Don't Rely on Full DOM Implementation**
   ```javascript
   // Bad: Requires full browser/JSDOM
   const element = document.createElement('div');
   
   // Good: Use lightweight mocks
   const element = { innerHTML: '', id: 'test' };
   ```

3. **Don't Mix Unit and Integration Tests**
   ```javascript
   // Bad: Testing renderAddressHtml() AND update() together
   
   // Good: Separate tests
   describe('renderAddressHtml', () => { ... });
   describe('update method', () => { ... });
   ```

4. **Don't Ignore Performance**
   ```javascript
   // Good: Test with realistic data volumes
   test('handles 1000 updates without issues', () => {
       for (let i = 0; i < 1000; i++) {
           displayer.update(data);
       }
   });
   ```

---

## 🚀 Running the Tests

### Execute All HTML Generation Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test HTMLAddressDisplayer.test.js

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# Verbose output
npm run test:verbose
```

### Filter Tests by Pattern

```bash
# Run only HTML-related tests
npm test -- --testNamePattern="HTML"

# Run only structure validation tests
npm test -- --testNamePattern="HTML Structure"

# Run only localization tests
npm test -- --testNamePattern="Portuguese"
```

---

## 📚 Example Test Suite Structure

### Complete HTMLAddressDisplayer Test Suite

```javascript
describe('HTMLAddressDisplayer', () => {
    describe('Constructor and Initialization', () => {
        // Initialization tests
    });
    
    describe('Address Data Rendering', () => {
        // renderAddressHtml() tests
    });
    
    describe('Standardized Address Integration', () => {
        // Integration with BrazilianStandardAddress
    });
    
    describe('Portuguese Localization', () => {
        // Localization tests
    });
    
    describe('Observer Pattern Integration', () => {
        // update() method tests
    });
    
    describe('Edge Cases and Error Handling', () => {
        // Error state tests
    });
    
    describe('HTML Structure Validation', () => {
        // Structure correctness tests
    });
    
    describe('Performance and Memory Management', () => {
        // Performance tests
    });
    
    describe('Brazilian Address Types', () => {
        // Brazilian context tests
    });
    
    describe('Data Type Handling', () => {
        // Type-aware rendering tests
    });
});
```

---

## 🎯 Testing Checklist

When testing HTML generation code, ensure you cover:

- [ ] **Structure**: Valid HTML, balanced tags, semantic elements
- [ ] **Content**: Correct data rendering, escaping, formatting
- [ ] **CSS Classes**: Correct classes for styling and state
- [ ] **Error States**: Null data, empty data, malformed data
- [ ] **Loading States**: Loading messages, placeholders
- [ ] **Localization**: Correct language, special characters
- [ ] **Performance**: Large data sets, repeated operations
- [ ] **Immutability**: Object freezing, no side effects
- [ ] **Integration**: Works with other modules, factory pattern
- [ ] **Edge Cases**: Empty arrays, null values, undefined properties

---

## 📖 Additional Resources

### Related Files
- `src/html/HTMLAddressDisplayer.js` - Implementation
- `src/html/DisplayerFactory.js` - Factory pattern
- `__tests__/unit/HTMLAddressDisplayer.test.js` - Unit tests
- `__tests__/integration/HTMLAddressDisplayer.integration.test.js` - Integration tests

### Documentation
- `.github/CONTRIBUTING.md` - Contribution guidelines
- `docs/WORKFLOW_SETUP.md` - Development workflow
- `README.md` - Project overview

---

## 🔗 Summary

This document demonstrates comprehensive strategies for testing HTML-generating JavaScript code, based on the proven patterns in guia_js:

1. **String-based testing** for fast, lightweight validation
2. **Mock DOM elements** for interaction testing
3. **Structure validation** for HTML correctness
4. **CSS class testing** for styling hooks
5. **Security testing** for proper escaping
6. **Edge case testing** for robustness
7. **Localization testing** for internationalization
8. **Performance testing** for scalability
9. **Factory pattern testing** for clean architecture
10. **Integration testing** for system cohesion

With **1224+ tests** and **~70% coverage**, guia_js demonstrates that comprehensive HTML generation testing is achievable without requiring full browser environments.

---

**Last Updated**: 2026-01-01  
**Version**: 1.0  
**Author**: Based on guia_js testing infrastructure
