# Issue Template Comparison

This document provides a comprehensive side-by-side comparison of all GitHub Issue templates available in the Guia.js project.

## Template Overview

==========================================================
ISSUE TEMPLATE COMPARISON
==========================================================

| Template                    | Lines | Title Prefix | Labels                                      |
|-----------------------------|-------|--------------|---------------------------------------------|
| technical_debt.md           |   90  | [Tech Debt]  | technical-debt, maintenance, triage         |
| feature_request.md          |   40  | [Feature]    | enhancement, triage                         |
| copilot_issue.md            |   45  | [Copilot]    | copilot, triage                             |
| documentation.md            |  147  | [Docs]       | documentation, triage                       |
| functional_specification.md |  379  | [Func Spec]  | documentation, functional-spec, triage      |
| github_config.md            |  118  | [Config]     | infrastructure, configuration, triage       |

## Common Features Across All Templates

All six templates share these structural elements:

✅ **YAML Frontmatter** - Each template includes structured metadata:
- `name`: Template display name
- `about`: Brief description of the template's purpose
- `title`: Prefix for issues created with this template
- `labels`: Auto-applied labels for categorization
- `assignees`: Field for automatic assignment (currently empty)

✅ **Clear Section Structure** - Markdown headers organize content logically

✅ **Priority Level Selection** - Helps prioritize work (Critical, High, Medium, Low)

✅ **Additional Context Section** - Space for supplementary information like links, screenshots, or references

✅ **Referential Transparency Considerations** - All templates include guidance on functional programming principles:
- Pure functions (same input → same output, no side effects)
- Explicit dependencies vs. global state
- Isolation of side effects
- Enhanced testability

## Template-Specific Features

### Technical Debt Template (90 lines)

**Purpose:** Report technical debt issues affecting code quality, maintainability, or performance

**Unique Sections:**
- **Technical Debt Summary** - Brief description of the debt
- **Impact on Codebase** - How it affects maintainability, performance, readability, testing, security, scalability
- **Current Issues** - Specific problems being caused or anticipated
- **Proposed Solution** - Refactoring approaches, restructuring, testing, documentation
- **Affected Areas** - Checklist of files/modules impacted
- **Acceptance Criteria** - Definition of "done" with focus on pure functions and isolated side effects
- **Effort Estimation** - Small (< 1 day) to Extra Large (> 2 weeks)

**Special Considerations:**
- Emphasis on making functions referentially transparent
- Focus on isolating side effects to boundary functions
- Code testability improvements

### Feature Request Template (40 lines)

**Purpose:** Propose new features or enhancements for the project

**Unique Sections:**
- **Feature Summary** - Brief description of the proposed feature
- **Motivation** - Why the feature is needed, what problem it solves
- **Use Cases** - Real-world scenarios demonstrating value
- **Proposed Solution** - Implementation ideas including design and workflow
- **Implementation Considerations** - Focus on pure functions, separation of business logic from side effects
- **Alternatives Considered** - Other approaches and reasoning for the proposal

**Special Considerations:**
- Design features with core logic as pure functions
- Separate business logic from I/O and mutations
- Ensure implementations are easy to test in isolation
- Make all dependencies explicit

### Copilot Issue Template (45 lines)

**Purpose:** Report problems or request features related to GitHub Copilot

**Unique Sections:**
- **Problem Description** - What was expected vs. what happened
- **Steps to Reproduce** - Numbered steps to reproduce the issue
- **Copilot Version** - Version information and environment details
- **Screenshots or Logs** - Visual aids for issue explanation
- **Proposed Solution** - Ideas for addressing the issue
- **Referential Transparency Guidelines** - How solutions should use pure functions and explicit dependencies

**Special Considerations:**
- Specific to GitHub Copilot integration issues
- References both REFERENTIAL_TRANSPARENCY.md and CODE_REVIEW_GUIDE.md
- Focus on deterministic, testable solutions

### Documentation Template (147 lines)

**Purpose:** Report documentation issues or request documentation improvements

**Unique Sections:**
- **Documentation Issue Summary** - What's missing, unclear, outdated, or incorrect
- **Type of Documentation Issue** - 7 categories (Missing, Incorrect, Unclear, Enhancement, Code Examples, API Documentation, Tutorial/Guide)
- **Affected Documentation** - Specific files and sections
- **Current State** - Description of existing documentation and problems
- **Expected Documentation** - What the documentation should contain
- **Impact** - Breakdown by User Impact, Contributor Impact, and Project Impact
- **Content to Add/Update** - Specific content outline
- **Structure and Format** - Organization suggestions (new file, location, sections, visuals)
- **Code Examples** - Space for JavaScript code examples
- **Related Documentation** - Cross-reference links
- **Target Audience** - 5 options (End Users, Contributors, Maintainers, New Contributors, API Users)
- **Documentation Quality Checklist** - 8 criteria for high-quality docs:
  - Clear and concise language
  - Accurate and up-to-date information
  - Practical examples and use cases
  - Proper formatting and structure
  - Links to related documentation
  - Code examples follow project conventions
  - Accessible to target audience
  - Searchable with relevant keywords
- **Acceptance Criteria** - 7 specific criteria including examples of best practices
- **Effort Estimation** - Specific to documentation work (< 2 hours to > 2 days)

**Special Considerations:**
- Detailed template with 147 lines
- Specific effort estimates for documentation tasks
- Comprehensive quality checklist
- Emphasis on documenting pure functions and referential transparency
- Multiple audience types for targeting documentation

### Functional Specification Template (379 lines) ⭐ Most Comprehensive

**Purpose:** Create codeless functional specifications for features, components, or modules suitable for AI-supported development

**Unique Sections:**
- **Specification Overview** - Brief summary of the component/feature
- **Document Information** - Version, status, target audience, implementation language
- **Output Deliverables** - 🆕 Defines output type (Programming Code or Class Documentation)
  - Programming Code option with language, files, and structure details
  - Class Documentation option with documentation file and format template
  - Includes complete Class Documentation Model based on REFERENCE_PLACE.md structure
- **Purpose and Motivation** - Problem statement and solution overview
- **Core Responsibilities** - Primary responsibilities numbered list
- **Functional Requirements** - Detailed FR-1, FR-2, etc. with:
  - Description, Input, Output, Behavior, Validation, Side Effects
- **Data Model** - Input/output data structures and internal state
- **Validation Rules** - Constraints and edge cases
- **Use Cases** - UC-1, UC-2, etc. with:
  - Description, Preconditions, Input, Expected Output, Postconditions
- **Error Handling** - Error types and edge cases
- **Quality Attributes** - Performance, Testability, Maintainability, Usability
- **Integration Points** - Input sources, output consumers, dependencies
- **Implementation Considerations** - Design principles and architecture patterns
- **Referential Transparency Requirements** - 6-point checklist:
  - Core logic as pure functions
  - Deterministic functions
  - Isolated side effects
  - Explicit dependencies
  - Avoid state mutations
  - Side effects at boundaries
- **Non-Functional Requirements** - Scalability, security, accessibility, i18n, compatibility
- **Testing Requirements** - Test categories, test data examples, coverage goals
- **Version History** - Track specification changes
- **References** - Related documentation and resources
- **Glossary** - Domain-specific terms
- **Implementation Checklist** - 12-step checklist for implementers
- **Contact** - Author, reviewers, subject matter experts

**Special Considerations:**
- Largest and most comprehensive template at 379 lines
- **Completely codeless** - focuses on WHAT not HOW
- Language-agnostic design for cross-platform implementation
- AI-friendly structure with clear, parseable sections
- Based on existing GEO_POSITION_FUNC_SPEC.md format
- Strong emphasis on referential transparency throughout
- Includes comprehensive testing and quality sections
- Suitable for GitHub Copilot and other AI tools to parse requirements

### GitHub Configuration Template (118 lines) 🆕

**Purpose:** Report issues or request changes to .github configuration (workflows, actions, issue templates, CI/CD)

**Unique Sections:**
- **Configuration Issue Summary** - Brief description of the configuration issue
- **Type of Configuration Issue** - Multi-select checkboxes for:
  - Workflow Issue
  - Action Issue
  - Issue Template
  - CI/CD Pipeline
  - Configuration File
  - Security/Permissions
  - Documentation
  - Enhancement
  - Architectural
- **Affected Components** - List specific .github files or components
- **Current Behavior** - What's happening now (errors, failures, unexpected behavior)
- **Expected Behavior** - How the configuration should work
- **Impact** - Four impact areas:
  - Developer Impact
  - CI/CD Impact
  - User Impact
  - Maintenance Impact
- **Steps to Reproduce** - For bugs or workflow failures
- **Proposed Solution** - Configuration changes, workflow modifications, new actions
- **Implementation Considerations** - Maintainability, breaking changes, testability, dependencies
- **Environment Details** - GitHub Runner, versions, workflow/action info, run IDs
- **Related Resources** - Links to workflow runs, issues, docs, external references
- **Acceptance Criteria** - Definition of "done" with testing and documentation requirements

**Special Considerations:**
- Focused on DevOps/infrastructure concerns
- Addresses GitHub Actions workflows, custom actions, and CI/CD pipelines
- References WORKFLOW_SETUP.md for workflow guidance
- Emphasis on maintainability and testability of automation
- Includes environment details for debugging workflow failures
- Links to related resources like failed workflow runs

## Integration Points

All templates are well-integrated into the project:

✅ **Referenced in docs/INDEX.md** - Each template is listed with description
- Technical Debt: "Report technical debt" - Now includes referential transparency considerations 🆕
- Feature Request: "Propose new features" - Now includes implementation considerations for pure functions 🆕
- Copilot Issue: "Report Copilot-related issues" - Now includes referential transparency guidelines 🆕
- Documentation: "Report documentation issues" - Includes documentation quality checklist 🆕
- Functional Specification: "Create functional specs" - Codeless, AI-friendly specification format 🆕
- GitHub Configuration: "Report .github configuration issues" - For workflows, actions, CI/CD 🆕

✅ **Consistent Naming Conventions** - All files use lowercase with underscores (snake_case)

✅ **Follows Project Principles** - Each template aligns with the project's referential transparency initiative

✅ **Triage Label** - All templates include the "triage" label for initial review

## Comparison Summary

### Complexity Scale
1. **Feature Request** (40 lines) - Simplest, focused on proposing new functionality
2. **Copilot Issue** (45 lines) - Straightforward bug/feature reporting for Copilot
3. **Technical Debt** (90 lines) - Moderate complexity for code quality issues
4. **GitHub Configuration** (118 lines) - Moderate-to-high complexity for infrastructure issues
5. **Documentation** (147 lines) - Comprehensive with detailed categorization
6. **Functional Specification** (379 lines) - Most comprehensive, codeless specification format

### Common Label Strategy
- All templates use **"triage"** for initial categorization
- Each has a specific domain label (technical-debt, enhancement, copilot, documentation, functional-spec, infrastructure)
- Technical Debt uniquely includes **"maintenance"** label
- Functional Specification uses both **"documentation"** and **"functional-spec"** labels
- GitHub Configuration uses both **"infrastructure"** and **"configuration"** labels

### Functional Programming Focus
All templates include referential transparency guidance, showing the project's commitment to:
- Pure functions and deterministic behavior
- Explicit dependency management
- Side effect isolation
- Enhanced testability

### Target Use Cases
- **Technical Debt**: Internal code quality improvements
- **Feature Request**: New capabilities and enhancements
- **Copilot Issue**: GitHub Copilot integration problems
- **Documentation**: Content creation and maintenance
- **Functional Specification**: Codeless specifications for AI-supported development
- **GitHub Configuration**: DevOps, CI/CD, workflows, actions, and infrastructure issues

## Recent Updates

According to docs/INDEX.md "Recent Updates" section (October 2024):

All templates were enhanced as part of the **Referential Transparency Documentation** initiative:
- ✅ Created comprehensive referential transparency guide
- ✅ Added code review checklist with FP focus
- ✅ Updated contributing guidelines
- ✅ Enhanced all issue templates
- ✅ Created documentation index

**Impact**: All contributors now have clear guidance on writing pure, testable, maintainable code.

## Recommendations

Based on this comparison:

1. **Template Selection**: Choose based on issue type:
   - Code quality concerns → Technical Debt
   - New features → Feature Request
   - Copilot problems → Copilot Issue
   - Documentation needs → Documentation
   - Functional specifications → Functional Specification

2. **Functional Specification Template**: Use when creating codeless, language-agnostic specifications for features or components. Ideal for AI-supported development and cross-platform implementations

3. **Documentation Template**: Use for any content-related issues due to its comprehensive checklist and quality criteria

4. **Consistency**: All templates follow consistent patterns, making them easy to use and maintain

5. **Referential Transparency**: Every template guides users toward functional programming principles, ensuring code quality across all contributions

## Related Resources

- **Template Location**: `.github/ISSUE_TEMPLATE/`
- **Documentation Index**: `docs/INDEX.md`
- **Referential Transparency Guide**: `.github/REFERENTIAL_TRANSPARENCY.md`
- **Code Review Guide**: `.github/CODE_REVIEW_GUIDE.md`
- **TDD Guide**: `.github/TDD_GUIDE.md` 🆕
- **Contributing Guide**: `.github/CONTRIBUTING.md`

---

**Last Updated**: Generated from templates in repository
**Maintained By**: Guia.js Project Team
**Version**: 0.8.5-alpha
