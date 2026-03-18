# Terminology Guide - Guia Turístico

---

Last Updated: 2026-01-28
Status: Active
Category: Guide

---

**Purpose**: Maintain consistent terminology across documentation, code, and communications.

---

## 📚 Core Project Terms

### Application & Architecture

**SPA (Single-Page Application)**

- ✅ **Use**: "SPA" after first definition
- ✅ **First mention**: "Single-Page Application (SPA)"
- ❌ **Avoid**: "single page app", "spa" (lowercase as noun)
- **Context**: Refers to the web application architecture

**guia.js**

- ✅ **Use**: Always lowercase "guia.js"
- ❌ **Avoid**: "Guia.js", "GUIA.js", "Guia.JS"
- **Context**: The core geolocation library dependency
- **Exception**: Capitalize at sentence start: "Guia.js is..."

**ibira.js**

- ✅ **Use**: Always lowercase "ibira.js"
- ❌ **Avoid**: "Ibira.js", "IBIRA.js"
- **Context**: Brazilian IBGE integration library
- **Exception**: Capitalize at sentence start: "Ibira.js provides..."

### Geographic & Brazilian Terms

**município** (plural: municípios)

- ✅ **Use**: Portuguese accented form "município"
- ❌ **Avoid**: "municipio" (unaccented)
- **Context**: Brazilian municipality (city-level administrative division)
- **Rationale**: Preserves Portuguese linguistic accuracy

**bairro** (plural: bairros)

- ✅ **Use**: Portuguese "bairro"
- ❌ **Avoid**: "neighborhood" in Brazilian context
- **Context**: Brazilian neighborhood/district
- **Note**: Use "neighborhood" only for non-Brazilian contexts

**Região Metropolitana**

- ✅ **Use**: Capitalized "Região Metropolitana"
- ✅ **Abbreviation**: "RM" (after first use)
- ❌ **Avoid**: "região metropolitana", "metropolitan region" in code/UI
- **Context**: Brazilian metropolitan region
- **English equivalent**: "Metropolitan region" (in documentation prose only)

### Testing Terminology

**E2E (End-to-End)**

- ✅ **Use**: "E2E" after first definition
- ✅ **First mention**: "End-to-End (E2E)"
- ❌ **Avoid**: "end to end", "e2e" (lowercase as acronym)
- **Context**: Integration tests simulating real user workflows

**Unit Test**

- ✅ **Use**: "unit test" (lowercase)
- ✅ **Plural**: "unit tests"
- ❌ **Avoid**: "Unit Test" (capitalized outside titles)
- **Context**: Tests for individual functions/methods

**Test Suite**

- ✅ **Use**: "test suite" (singular), "test suites" (plural)
- ✅ **Context**: Collection of related tests
- **Note**: Grammatical variations acceptable (suite/suites)

**Mock** vs **Stub** vs **Spy**

- **Mock**: Object with expectations (verify behavior)
- **Stub**: Object with canned responses (control test inputs)
- **Spy**: Wrapper recording calls (observe interactions)
- **Usage**: Use precise terms in test documentation

### API & Integration

**Nominatim**

- ✅ **Use**: "Nominatim" (proper noun)
- ✅ **Context**: "OpenStreetMap Nominatim API"
- ❌ **Avoid**: "nominatim", "NOMINATIM"
- **Note**: OpenStreetMap's geocoding service

**IBGE (Instituto Brasileiro de Geografia e Estatística)**

- ✅ **Use**: "IBGE" as acronym
- ✅ **Full name**: Use on first mention in major documents
- ❌ **Avoid**: "Ibge", "ibge"
- **Context**: Brazilian statistics and geography institute

**SIDRA (Sistema IBGE de Recuperação Automática)**

- ✅ **Use**: "SIDRA" as acronym
- ✅ **Context**: "IBGE SIDRA API"
- ❌ **Avoid**: "Sidra", "sidra"
- **Note**: IBGE's data retrieval system

### Development & Tooling

**Node.js**

- ✅ **Use**: "Node.js" (capital N, lowercase js)
- ❌ **Avoid**: "NodeJS", "node.js", "node"
- **Context**: JavaScript runtime environment

**npm**

- ✅ **Use**: "npm" (all lowercase)
- ❌ **Avoid**: "NPM", "Npm"
- **Context**: Node package manager
- **Exception**: Capitalize at sentence start: "Npm install..."

**Jest**

- ✅ **Use**: "Jest" (capitalized)
- ❌ **Avoid**: "JEST", "jest" (except in code)
- **Context**: JavaScript testing framework

**Puppeteer**

- ✅ **Use**: "Puppeteer" (capitalized)
- ❌ **Avoid**: "puppeteer", "PUPPETEER" (except in code)
- **Context**: Browser automation library

**jsdom**

- ✅ **Use**: "jsdom" (all lowercase)
- ❌ **Avoid**: "JSDOM", "JSDom", "jsDom"
- **Context**: JavaScript DOM implementation

---

## 🎯 Code vs. Documentation

### When Terms Differ

Some terms have different conventions in code vs. documentation:

| Term | Code | Documentation | UI Display |
|------|------|---------------|------------|
| **Single-Page Application** | `// SPA` | "SPA" or "Single-Page Application" | N/A |
| **Município** | `municipio` (variable) | "município" (accented) | "Município" |
| **Bairro** | `bairro` (variable) | "bairro" | "Bairro" |
| **End-to-End** | `e2e/` (directory) | "E2E" or "End-to-End" | N/A |
| **Web server** | `http.server` | "web server" (lowercase) | N/A |

**Rationale**: Code follows technical conventions (ASCII, kebab-case, etc.) while documentation preserves linguistic accuracy.

---

## 📝 Capitalization Rules

### Proper Nouns (Always Capitalize)

- Nominatim
- OpenStreetMap
- IBGE
- SIDRA
- Jest
- Puppeteer
- Node.js
- GitHub

### Common Nouns (Lowercase in Prose)

- web server
- unit test
- test suite
- code coverage
- pull request
- commit message

### Acronyms (All Caps After Definition)

- SPA (Single-Page Application)
- E2E (End-to-End)
- API (Application Programming Interface)
- UI (User Interface)
- DOM (Document Object Model)
- IBGE (Instituto Brasileiro de Geografia e Estatística)

### Special Cases

**npm**: Always lowercase (even at sentence start in informal contexts)

- Formal: "The npm package manager..."
- Acceptable: "npm is used for..."

**jsdom**: Always lowercase (library name convention)

- Formal: "The jsdom library..."
- Code: `import { jsdom } from 'jsdom'`

**guia.js / ibira.js**: Always lowercase except sentence start

- Normal: "The guia.js library provides..."
- Sentence start: "Guia.js is a geolocation library."

---

## 🌍 Brazilian Portuguese vs. English

### When to Use Portuguese

**Use Portuguese terms when:**

- Referring to Brazilian administrative divisions (município, bairro)
- Displaying in UI for Brazilian users
- Naming classes/variables for Brazilian-specific features
- Documenting Brazilian data structures

**Examples**:

- ✅ "The município of São Paulo..."
- ✅ "Display the bairro name in the card"
- ✅ "BrazilianStandardAddress class"
- ✅ "The Região Metropolitana field"

### When to Use English

**Use English terms when:**

- Writing general documentation
- Describing architectural patterns
- Explaining technical concepts
- Targeting international audience

**Examples**:

- ✅ "The address extraction module..."
- ✅ "Singleton pattern implementation"
- ✅ "REST API endpoint"
- ✅ "Unit test coverage"

### Hybrid Approach (Acceptable)

**Format**: English explanation with Portuguese term in context

**Examples**:

- "Brazilian municipality (município)"
- "The neighborhood (bairro) display component"
- "Metropolitan region (Região Metropolitana) data"

**Rationale**: Provides clarity while preserving technical accuracy

---

## 🔤 Abbreviations & Acronyms

### Standard Abbreviations

| Full Term | Abbreviation | First Use | Subsequent |
|-----------|--------------|-----------|------------|
| Single-Page Application | SPA | "Single-Page Application (SPA)" | "SPA" |
| End-to-End | E2E | "End-to-End (E2E)" | "E2E" |
| Application Programming Interface | API | "API" (widely known) | "API" |
| Região Metropolitana | RM | "Região Metropolitana (RM)" | "RM" |
| Instituto Brasileiro de Geografia e Estatística | IBGE | "IBGE" (widely known) | "IBGE" |

### When to Define Acronyms

**Always define**:

- Less common acronyms (SIDRA, RM, OSM)
- Technical project-specific terms
- First use in major documents

**No need to define** (widely known):

- API, UI, DOM, HTML, CSS, JS
- HTTP, HTTPS, URL
- IBGE (in Brazilian context)

---

## ⚠️ Common Mistakes to Avoid

### Inconsistent Case

❌ **Wrong**: "The Guia.js library uses the Npm package..."
✅ **Right**: "The guia.js library uses the npm package..."

❌ **Wrong**: "Run end-to-end tests..."
✅ **Right**: "Run E2E tests..." or "Run end-to-end (E2E) tests..."

### Missing Accents

❌ **Wrong**: "Display the municipio name..."
✅ **Right**: "Display the município name..."

❌ **Wrong**: "Região Metropolitana" → "regiao metropolitana"
✅ **Right**: "Região Metropolitana" (preserve capitalization and accents)

### Inconsistent Terminology

❌ **Wrong**: Mixing "neighborhood" and "bairro" in same document
✅ **Right**: Use "bairro" consistently for Brazilian context

❌ **Wrong**: Alternating between "single-page app" and "SPA"
✅ **Right**: Define "Single-Page Application (SPA)" once, use "SPA" after

---

## 🛠️ Tools & Validation

### Automated Checks

```bash
# Check for common terminology issues
grep -r "municipio[^s]" docs/ --include="*.md"  # Missing accent
grep -r "Guia\.js" docs/ --include="*.md"       # Should be lowercase
grep -r "end-to-end tests" docs/ --include="*.md"  # Should be E2E
```

### Manual Review Checklist

Before committing documentation:

- [ ] Check Portuguese terms have proper accents
- [ ] Verify library names use correct case (guia.js, ibira.js)
- [ ] Confirm acronyms defined on first use
- [ ] Ensure consistent terminology throughout document
- [ ] Review capitalization of proper nouns

---

## 📚 Related Documentation

- [Contributing Guidelines](../../.github/CONTRIBUTING.md) - General contribution standards
- [Documentation Metadata Template](./DOCUMENTATION_METADATA_TEMPLATE.md) - Doc structure
- [Code Review Guide](../../.github/CODE_REVIEW_GUIDE.md) - Code standards

---

## 🔄 Updating This Guide

### When to Update

- New libraries or tools added to project
- New Brazilian geographic terms introduced
- Community feedback on terminology confusion
- Major project nomenclature changes

### How to Update

1. Edit this file with proposed changes
2. Update "Last Updated" metadata
3. Submit pull request with rationale
4. Get review from maintainers
5. Update related documentation if needed

### Proposing New Terms

When adding new terminology:

1. Check existing usage in codebase
2. Research standard industry usage
3. Consider internationalization needs
4. Document in this guide with examples
5. Add to automated validation (if applicable)

---

## 💡 Best Practices

1. **Be Consistent**: Use the same term throughout a document
2. **Define Acronyms**: Always define on first use in major docs
3. **Preserve Accents**: Keep Portuguese linguistic accuracy
4. **Follow Conventions**: Respect library/tool naming conventions
5. **Check Examples**: Look at existing docs for precedent
6. **Ask When Unsure**: Better to clarify than guess

---

## 📊 Terminology Statistics

**Current Status**: ✅ Good consistency maintained

**Key Metrics**:

- Portuguese terms: Consistently accented ✅
- Library names: Correctly cased ✅
- Acronyms: Defined and consistent ✅
- Capitalization: Follows conventions ✅

**Last Audit**: 2026-01-28
**Next Audit**: 2026-04-28 (quarterly review)

---

**Quick Links**:

- [Documentation Hub](../README.md)
- [Contributing](../../.github/CONTRIBUTING.md)
- [Code Review Guide](../../.github/CODE_REVIEW_GUIDE.md)
