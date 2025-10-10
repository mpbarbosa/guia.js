# High Cohesion Guide for .github Configuration

This document explains the high-cohesion principles applied to the `.github` folder configuration and how to maintain them.

## Overview

High cohesion in the `.github` folder means ensuring that each configuration file, workflow, action, and template has a single, well-defined responsibility. Components should be focused, self-contained, and internally consistent, making them easier to understand, test, and maintain.

## What is High Cohesion?

**High cohesion** is a software design principle where elements within a module or component are closely related and work together to achieve a single, well-defined purpose. In the context of `.github` configuration:

- **Each workflow** focuses on a specific automation task
- **Each action** performs one clear function
- **Each template** addresses one type of issue
- **Related functionality** is grouped together
- **Unrelated concerns** are separated

### Benefits of High Cohesion

1. **Easier to understand**: Each component has a clear, focused purpose
2. **Easier to maintain**: Changes are localized to specific components
3. **Easier to test**: Focused components can be tested independently
4. **Better reusability**: Well-defined components can be reused confidently
5. **Reduced complexity**: Each part does one thing well

## Principles Applied

### 1. Single Responsibility Workflows

**Location**: `.github/workflows/`

Each workflow should have one primary responsibility and do it well.

#### Example: copilot-coding-agent.yml

This workflow focuses exclusively on validation and security:
- JavaScript syntax validation
- Security scanning
- Basic code quality checks

**Benefits**:
- Clear purpose: "Validate code quality"
- Easy to debug when validation fails
- Can be triggered independently
- Simple to enhance without affecting other concerns

#### Example: modified-files.yml

This workflow focuses on test execution and documentation:
- Running tests for modified files
- Updating documentation timestamps
- Generating coverage reports

**Benefits**:
- Clear purpose: "Test and document changes"
- Separated from validation concerns
- Can be optimized for test performance
- Documentation updates are automatic

**Anti-pattern to Avoid**:
```yaml
# DON'T: Mixed responsibilities
name: Everything Workflow
jobs:
  do-everything:
    steps:
      - Validate syntax
      - Run tests
      - Deploy to production
      - Send notifications
      - Update documentation
      - Analyze performance
      - Generate reports
```

### 2. Focused Reusable Actions

**Location**: `.github/actions/`

Each action should perform one specific, well-defined task.

#### validate-js Action

**Single Responsibility**: Validate JavaScript syntax

```yaml
# ✅ High cohesion: One clear purpose
- name: Validate JavaScript
  uses: ./.github/actions/validate-js
  with:
    files: 'src/guia.js src/guia_ibge.js'
```

**What it does**:
- Takes JavaScript file paths as input
- Runs Node.js syntax validation
- Reports syntax errors
- Returns success/failure status

**What it doesn't do**:
- Run tests (that's a different concern)
- Check security (separate action)
- Format code (different responsibility)

#### security-check Action

**Single Responsibility**: Scan for security vulnerabilities

```yaml
# ✅ High cohesion: Focused security scanning
- name: Security Check
  uses: ./.github/actions/security-check
  with:
    files: 'src/*.js'
```

**What it does**:
- Scans JavaScript files for security issues
- Checks for common vulnerabilities
- Reports findings
- Fails on critical issues

**What it doesn't do**:
- Validate syntax (validate-js does that)
- Run functional tests (test workflow does that)
- Deploy code (deployment action does that)

### 3. Specialized Issue Templates

**Location**: `.github/ISSUE_TEMPLATE/`

Each template is specialized for a specific type of issue, with sections tailored to that purpose.

#### Technical Debt Template

**Purpose**: Track code quality and refactoring needs

**Focused Sections**:
- Code location and type of debt
- Impact on maintainability
- Refactoring considerations
- Priority assessment

**Why it's cohesive**: All sections relate to identifying and addressing technical debt.

#### Feature Request Template

**Purpose**: Propose new functionality

**Focused Sections**:
- Feature description and use case
- Implementation considerations
- Success criteria
- Impact assessment

**Why it's cohesive**: All sections relate to defining and planning new features.

#### GitHub Configuration Template

**Purpose**: Address infrastructure and workflow issues

**Focused Sections**:
- Configuration issue type (workflow, action, CI/CD)
- Environment details
- Implementation considerations
- Workflow-specific debugging info

**Why it's cohesive**: All sections relate to GitHub automation and infrastructure concerns.

### 4. Cohesive Documentation Structure

**Location**: `docs/`

Documentation files are organized by topic with clear, focused content.

#### CLASS_DIAGRAM.md

**Single Focus**: Architecture and class relationships
- Class structure and responsibilities
- Design patterns used
- Refactoring history

**Doesn't contain**: Testing procedures, API documentation, setup instructions

#### TESTING.md

**Single Focus**: Test suite and testing practices
- Test organization
- Running tests
- Coverage information

**Doesn't contain**: Architecture details, API documentation, deployment info

## Real-World Example: PR #121 Refactoring

The AddressDataExtractor refactoring (PR #121) is an excellent example of improving cohesion:

### Before: Low Cohesion (Multiple Responsibilities)

```javascript
class AddressDataExtractor {
  // Mixed responsibilities:
  - Extract address data from API responses
  - Cache addresses for performance
  - Detect address changes
  - Manage callbacks
  - Handle expiration and eviction
}
```

**Problems**:
- Too many responsibilities in one class
- Hard to understand what it does
- Difficult to test independently
- Changes to caching affect extraction logic

### After: High Cohesion (Single Responsibilities)

```javascript
// ✅ Focused on extraction
class AddressExtractor {
  - Extract address from raw data
  - Standardize to Brazilian format
  - Parse UF codes
}

// ✅ Focused on caching and change detection
class AddressCache {
  - Cache address data
  - Manage cache lifecycle
  - Detect changes between addresses
  - Handle callbacks for changes
}
```

**Benefits Achieved**:
1. **Improved Cohesion**: Each class has a single, well-defined responsibility
2. **Better Maintainability**: Clear separation makes code easier to understand
3. **Enhanced Testability**: Each concern can be tested independently (34 tests passing)
4. **Easier to Extend**: New features can be added without affecting other concerns

## Best Practices for High Cohesion

### When Creating a New Workflow

1. **Define a single, clear purpose**: What is this workflow's responsibility?
2. **Group related steps**: Keep steps that work together in the same job
3. **Separate unrelated concerns**: If a workflow does too much, split it
4. **Name descriptively**: The name should reflect the single purpose

**Good Example**:
```yaml
name: Test Modified Files
jobs:
  test:
    steps:
      - Checkout code
      - Install dependencies
      - Run affected tests
      - Generate coverage report
```

All steps relate to testing - high cohesion.

**Poor Example**:
```yaml
name: Mixed Workflow
jobs:
  everything:
    steps:
      - Run tests
      - Deploy to staging
      - Send email notifications
      - Update documentation
      - Clean up old artifacts
```

Unrelated concerns mixed together - low cohesion.

### When Creating a New Action

1. **Do one thing well**: The action should have a single, focused purpose
2. **Clear inputs/outputs**: Parameters should all relate to the main purpose
3. **Descriptive name**: Name should clearly indicate what it does
4. **No hidden responsibilities**: Don't mix unrelated functionality

**High Cohesion Action**:
```yaml
name: 'Validate JavaScript Syntax'
description: 'Validates JavaScript files for syntax errors'
inputs:
  files:
    description: 'JavaScript files to validate'
    required: true
runs:
  # Only validation logic here
```

### When Creating Issue Templates

1. **One issue type per template**: Each template for a specific purpose
2. **Relevant sections only**: Include only sections related to that issue type
3. **Consistent within template**: All sections support the same goal
4. **Clear purpose**: Users should know immediately which template to use

**Template Cohesion Checklist**:
- [ ] Template name clearly indicates purpose
- [ ] All sections relate to the issue type
- [ ] No sections borrowed from unrelated templates
- [ ] Examples are relevant to this issue type
- [ ] Checklist items all support the same goal

### When Organizing Documentation

1. **One topic per document**: Each file covers a single subject area
2. **Logical grouping**: Related information stays together
3. **Clear boundaries**: Easy to know which file contains what
4. **Cross-references**: Link to related docs instead of duplicating

## Measuring Cohesion

### Signs of High Cohesion

✅ **Can describe the component in one sentence**
- "This workflow validates JavaScript syntax"
- "This template reports technical debt"
- "This action runs security scans"

✅ **Changes are localized**
- Security changes only affect security-check action
- Test changes only affect test-related workflows
- Template changes don't affect workflows

✅ **Easy to name**
- Names clearly indicate purpose
- No need for "and" or "or" in names
- Names are specific, not generic

✅ **Independent testing**
- Each component can be tested alone
- Tests don't require unrelated setup
- Failures are easy to diagnose

### Signs of Low Cohesion

❌ **Hard to describe simply**
- "This workflow does validation and testing and deployment..."
- "This action handles multiple different things"

❌ **Changes cascade**
- Changing one thing breaks unrelated functionality
- Updates require touching many files
- Side effects are unpredictable

❌ **Generic or compound names**
- "Utility workflow"
- "Helper action"
- "General template"

❌ **Tangled testing**
- Tests require complex setup
- Failures are hard to diagnose
- Can't test parts independently

## Architecture Diagram

```
.github/
├── config.yml                          # Centralized configuration
├── LOW_COUPLING_GUIDE.md              # Loose coupling principles
├── HIGH_COHESION_GUIDE.md             # This file - high cohesion principles
├── copilot-instructions.md            # Copilot-specific instructions
├── CONTRIBUTING.md                     # Contribution guidelines
├── REFERENTIAL_TRANSPARENCY.md        # Pure functions and immutability
├── CODE_REVIEW_GUIDE.md               # Code review checklist
├── REFACTORING_SUMMARY.md             # Refactoring history (PR #121)
│
├── actions/                            # Reusable actions (high cohesion)
│   ├── validate-js/                   # ✅ Single purpose: JS validation
│   │   └── action.yml
│   ├── security-check/                # ✅ Single purpose: Security scanning
│   │   └── action.yml
│   ├── detect-affected-tests/         # ✅ Single purpose: Test detection
│   │   └── action.yml
│   └── update-test-docs/              # ✅ Single purpose: Doc updates
│       └── action.yml
│
├── ISSUE_TEMPLATE/                     # Issue templates (high cohesion)
│   ├── config.yml                     # Template configuration
│   ├── copilot_issue.md              # ✅ Focus: Copilot issues
│   ├── feature_request.md            # ✅ Focus: Feature proposals
│   ├── technical_debt.md             # ✅ Focus: Code quality issues
│   ├── documentation.md              # ✅ Focus: Documentation issues
│   ├── functional_specification.md   # ✅ Focus: Functional specs
│   └── github_config.md              # ✅ Focus: GitHub infrastructure
│
└── workflows/                          # Workflows (high cohesion)
    ├── copilot-coding-agent.yml      # ✅ Focus: Code validation
    └── modified-files.yml            # ✅ Focus: Testing & documentation
```

## Examples

### High Cohesion: Focused Action

```yaml
# ✅ GOOD: Single, clear responsibility
name: 'Run Jest Tests'
description: 'Executes Jest test suite and reports results'
inputs:
  test-pattern:
    description: 'Test files pattern to run'
    required: true
  coverage:
    description: 'Generate coverage report'
    required: false
    default: 'false'
outputs:
  test-results:
    description: 'Test execution results'
runs:
  # All logic relates to running tests
```

### Low Cohesion: Mixed Responsibilities

```yaml
# ❌ BAD: Multiple unrelated responsibilities
name: 'Do Many Things'
description: 'Runs tests, validates code, deploys, and sends notifications'
inputs:
  files:
    description: 'Files to process'
  deploy:
    description: 'Whether to deploy'
  email:
    description: 'Email for notifications'
runs:
  # Mixed: testing, validation, deployment, notifications
```

### High Cohesion: Focused Workflow Job

```yaml
# ✅ GOOD: All steps related to testing
test-suite:
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Generate coverage
      run: npm run test:coverage
```

### Low Cohesion: Mixed Workflow Job

```yaml
# ❌ BAD: Unrelated steps mixed together
everything:
  runs-on: ubuntu-latest
  steps:
    - name: Run tests
      run: npm test
    
    - name: Build Docker image
      run: docker build .
    
    - name: Send Slack notification
      run: curl -X POST slack-webhook
    
    - name: Update documentation
      run: npm run docs
    
    - name: Clean old releases
      run: gh release delete old
```

## Refactoring for Higher Cohesion

### Identify Low Cohesion

Look for these warning signs:

1. **Component does multiple unrelated things**
   - Action validates code AND runs tests AND deploys
   - Workflow handles testing AND notifications AND cleanup

2. **Frequent changes to unrelated functionality**
   - Changing test logic requires updating validation code
   - Modifying one template affects another template

3. **Difficult to name or describe**
   - "Utility workflow that handles various tasks"
   - "Helper action for different purposes"

4. **Large, complex components**
   - 500-line workflow with many different jobs
   - Action with 20+ inputs for different purposes

### Refactoring Steps

1. **Identify distinct responsibilities**
   - List everything the component does
   - Group related functionality
   - Identify unrelated concerns

2. **Split into focused components**
   - Create separate actions/workflows for each responsibility
   - Keep related functionality together
   - Remove unrelated code

3. **Improve naming**
   - Name components based on their single purpose
   - Use descriptive, specific names
   - Avoid generic names like "helper" or "utility"

4. **Update dependencies**
   - Update workflows to use new, focused actions
   - Create composition through workflow steps
   - Document the separation

5. **Test independently**
   - Verify each component works alone
   - Test focused functionality
   - Ensure no hidden dependencies

## Integration with Low Coupling

High cohesion and low coupling work together:

- **High Cohesion**: Each component has a single, well-defined purpose
- **Low Coupling**: Components have minimal dependencies on each other

### Example: Actions Architecture

```
validate-js (high cohesion)
    ↓ (low coupling - simple interface)
security-check (high cohesion)
    ↓ (low coupling - simple interface)
test-runner (high cohesion)
```

Each action:
- ✅ **High cohesion**: Does one thing well
- ✅ **Low coupling**: Minimal dependencies
- ✅ **Clear interface**: Simple inputs/outputs
- ✅ **Independent**: Can be used separately

## Testing for Cohesion

### How to Verify High Cohesion

1. **The "One Sentence Test"**
   - Can you describe the component's purpose in one clear sentence?
   - If you need multiple sentences or use "and" repeatedly, cohesion might be low

2. **The "Change Impact Test"**
   - If you change one aspect, does it affect unrelated functionality?
   - High cohesion means changes are localized

3. **The "Naming Test"**
   - Is the component easy to name descriptively?
   - Generic names often indicate low cohesion

4. **The "Split Test"**
   - Try to split the component in half
   - If it's difficult, cohesion might be high (good)
   - If it's easy, you might already have two components mixed together

### Testing Cohesive Components

High cohesion makes testing easier:

```javascript
// ✅ High cohesion = Easy to test
describe('AddressExtractor', () => {
  test('extracts UF from ISO code', () => {
    const result = AddressExtractor.extractSiglaUF('BR-SP');
    expect(result).toBe('SP');
  });
  
  // All tests focus on extraction - one responsibility
});

describe('AddressCache', () => {
  test('caches address data', () => {
    const cache = AddressCache.getInstance();
    cache.getBrazilianStandardAddress(data);
    // Verify caching behavior
  });
  
  // All tests focus on caching - different responsibility
});
```

## Related Documentation

### Within This Repository

- [LOW_COUPLING_GUIDE.md](./LOW_COUPLING_GUIDE.md) - Complementary principles for loose coupling
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Real examples of improving cohesion (PR #121)
- [CODE_REVIEW_GUIDE.md](./CODE_REVIEW_GUIDE.md) - Reviewing for cohesion
- [REFERENTIAL_TRANSPARENCY.md](./REFERENTIAL_TRANSPARENCY.md) - Pure functions and single responsibility
- [TDD_GUIDE.md](./TDD_GUIDE.md) - Testing cohesive components
- [UNIT_TEST_GUIDE.md](./UNIT_TEST_GUIDE.md) - Testing focused units

### Architecture Examples
- [CLASS_DIAGRAM.md](../docs/architecture/CLASS_DIAGRAM.md) - Architecture showing cohesive classes
- [WEBGEOCODINGMANAGER_REFACTORING.md](../docs/architecture/WEBGEOCODINGMANAGER_REFACTORING.md) - PR #189 cohesion improvements
- [WEB_GEOCODING_MANAGER.md](../docs/architecture/WEB_GEOCODING_MANAGER.md) - Coordinator with focused responsibilities
- [REFERENCE_PLACE.md](../docs/architecture/REFERENCE_PLACE.md) - Single-purpose class example

### External Resources

- [Cohesion (computer science) - Wikipedia](https://en.wikipedia.org/wiki/Cohesion_(computer_science))
- [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Separation of Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns)
- [Clean Code by Robert C. Martin](https://www.oreilly.com/library/view/clean-code-a/9780136083238/) - Chapter on classes and cohesion

### Books on High Cohesion

- **Clean Code** by Robert C. Martin - Chapter 10: Classes
- **Code Complete** by Steve McConnell - Chapter 7: High-Quality Routines
- **Design Patterns** by Gang of Four - Single Responsibility examples
- **Refactoring** by Martin Fowler - Improving cohesion through refactoring
- **Object-Oriented Software Engineering** by Ivar Jacobson - Cohesion metrics

## Version History

- **v1.0** (Current): Initial high-cohesion guide for .github configuration
  - Principles and benefits explained
  - Real examples from PR #121 refactoring
  - Best practices for workflows, actions, and templates
  - Integration with low coupling principles
  - Testing and measurement guidelines

## Questions?

If you have questions about applying high cohesion principles or need help refactoring for better cohesion, please open an issue using the [GitHub Configuration template](./ISSUE_TEMPLATE/github_config.md).

## Summary Checklist

Use this checklist when creating or reviewing `.github` components:

### Workflow Cohesion
- [ ] Workflow has a single, clear purpose
- [ ] All jobs relate to the main purpose
- [ ] Unrelated concerns are in separate workflows
- [ ] Name clearly indicates responsibility

### Action Cohesion
- [ ] Action performs one specific task
- [ ] All inputs relate to the main task
- [ ] No hidden or unrelated functionality
- [ ] Can describe purpose in one sentence

### Template Cohesion
- [ ] Template addresses one type of issue
- [ ] All sections relate to that issue type
- [ ] No borrowed sections from unrelated templates
- [ ] Purpose is immediately clear to users

### Documentation Cohesion
- [ ] Document covers one topic area
- [ ] All content relates to the main topic
- [ ] Cross-references instead of duplicating
- [ ] Easy to find information

### Overall Cohesion
- [ ] Component does one thing well
- [ ] Easy to understand and describe
- [ ] Changes are localized
- [ ] Can be tested independently
- [ ] Works well with low coupling principles
