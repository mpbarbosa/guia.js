# Issue Template Comparison

This document provides a comprehensive side-by-side comparison of all GitHub Issue templates available in the Guia Turístico project.

## Template Overview

==========================================================
ISSUE TEMPLATE COMPARISON
==========================================================

| Template                    | Lines | Title Prefix      | Labels                                      |
|-----------------------------|-------|-------------------|---------------------------------------------|
| technical_debt.md           |   90  | [Tech Debt]       | technical-debt, maintenance, triage         |
| feature_request.md          |   40  | [Feature]         | enhancement, triage                         |
| copilot_issue.md            |   45  | [Copilot]         | copilot, triage                             |
| copilot_test.md             |  190  | [Copilot Test] 🆕 | copilot, testing, triage                    |
| documentation.md            |  147  | [Docs]            | documentation, triage                       |
| functional_specification.md |  379  | [Func Spec]       | documentation, functional-spec, triage      |
| github_config.md            |  118  | [Config]          | infrastructure, configuration, triage       |
| agile-ticket.yml            |  203  | [Agile]           | agile-ticket, triage                        |
| ux_issue.md                 |   46  | [UX]              | UX, enhancement                             |

## Common Features Across All Templates

All nine templates share these structural elements:

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

### GitHub Copilot Test Template (190 lines) 🆕

**Purpose:** Document and track systematic testing of GitHub Copilot features, code suggestions, and generation quality

**Unique Sections:**
- **Test Summary** - Brief description of what aspect of Copilot is being tested
- **Test Type** - Multi-select checkboxes for:
  - Code Completion
  - Code Generation
  - Code Explanation
  - Code Translation
  - Test Generation
  - Documentation Generation
  - Refactoring Suggestions
  - Bug Detection
  - Integration Testing
- **Test Environment** - IDE/Editor, Copilot version, programming language, file context
- **Test Scenario** - Detailed test setup including:
  - Context Provided to Copilot
  - Expected Behavior
  - Actual Behavior
- **Test Results** - Quality evaluation checklist:
  - Accuracy, Relevance, Code Quality
  - Referential Transparency adherence
  - Testability, Documentation, Performance, Security
- **Quality Rating** - Excellent, Good, Fair, or Poor
- **Observations** - What worked well, what could be improved, unexpected behaviors
- **Referential Transparency Evaluation** - 5-point checklist:
  - Pure Functions
  - Explicit Dependencies
  - Isolated Side Effects
  - Immutability
  - Testability
- **Test Data** - Sample inputs, test cases used
- **Reproducibility** - Steps to reproduce the test
- **Recommendations** - For users, documentation, and Copilot instructions
- **Follow-up Actions** - Update documentation, improve instructions, create issues, etc.

**Special Considerations:**
- Distinct from copilot_issue.md (which reports bugs) - this tracks systematic testing
- Evaluates quality of Copilot suggestions against project standards
- Documents reproducible test scenarios for consistent evaluation
- Provides structured format for tracking Copilot's behavior patterns
- Helps improve project's .github/copilot-instructions.md over time
- References REFERENTIAL_TRANSPARENCY.md, CODE_REVIEW_GUIDE.md, and TDD_GUIDE.md

### Agile Ticket Template (203 lines) 🆕 **YML Form Format**

**Purpose:** Create actionable Agile tickets for implementing user stories, features, and functional specifications using GitHub's YAML form syntax

**Unique Sections:**
- **Ticket Type** - Dropdown: User Story, Feature Implementation, Technical Task, Bug Fix, Refactoring, Documentation, Research/Spike
- **User Story** - Structured format: "As a [role], I want [feature], so that [benefit]"
- **Background / Context** - Link to functional specifications, related issues, and project context
- **Acceptance Criteria** - Specific, measurable outcomes in checkbox format
- **Engineering Principles & Technical Considerations** - Checklist covering:
  - Referential transparency principles
  - Pure functions implementation
  - Side effects isolation
  - Immutable data structures
  - Testability in isolation
  - Low coupling principles
  - High cohesion maintenance
  - TDD practices
- **Implementation Notes** - Files to modify, new components, architecture patterns, dependencies
- **Testing Requirements** - Unit tests, integration tests, edge cases, error handling, coverage targets
- **Priority Level** - Dropdown: Critical, High, Medium, Low
- **Story Points / Effort Estimation** - Fibonacci scale (1-21) with time estimates
- **Definition of Done** - Pre-filled checklist of completion criteria
- **Dependencies & Blockers** - Track related issues and blocking factors
- **Additional Context** - Links, diagrams, and supplementary information

**Special Considerations:**
- **First YML template** - Uses GitHub's modern YAML form syntax (not markdown)
- Designed to bridge functional specifications and implementation work
- Supports both large features (broken down from specs) and small standalone features
- Integrates all project engineering principles (referential transparency, TDD, low coupling, high cohesion)
- Provides structured dropdowns for consistency (ticket type, priority, story points)
- Pre-filled "Definition of Done" checklist ensures quality standards
- Story points use Fibonacci scale following Agile best practices
- Explicitly supports Agile/Scrum methodology with user story format
- References multiple project guides (.github/REFERENTIAL_TRANSPARENCY.md, LOW_COUPLING_GUIDE.md, HIGH_COHESION_GUIDE.md, TDD_GUIDE.md)

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

### UX Issue Template (46 lines)

**Purpose:** Report user experience problems or make usability suggestions

**Unique Sections:**
- **Summary** - Brief description of the UX issue or suggestion
- **Steps to Reproduce** - Numbered steps to encounter the problem or observe the UX concern
- **Expected Behavior** - What should happen from a user perspective
- **Actual Behavior** - What actually happens (including error messages or confusing UI)
- **Screenshots or Videos** - Visual aids to illustrate the problem
- **Environment** - Browser/version, device type, operating system details
- **Severity** - Classification as:
  - Cosmetic (minor visual issue)
  - Usability (makes usage confusing or difficult)
  - Blocking (prevents using a feature)
- **Additional Context** - Other details or suggestions

**Special Considerations:**
- Focused on user-facing aspects rather than code quality
- No referential transparency section (UX-specific, not implementation-focused)
- Simpler structure compared to other templates
- Environment details help reproduce browser/device-specific issues
- Severity classification helps prioritize UX improvements
- Does NOT include "triage" label (only UX and enhancement labels)

## Integration Points

All templates are well-integrated into the project:

✅ **Referenced in docs/INDEX.md** - Each template is listed with description
- Technical Debt: "Report technical debt" - Now includes referential transparency considerations 🆕
- Feature Request: "Propose new features" - Now includes implementation considerations for pure functions 🆕
- Copilot Issue: "Report Copilot-related issues" - Now includes referential transparency guidelines 🆕
- GitHub Copilot Test: "Document and track Copilot testing" - Test code quality and project standards adherence 🆕
- Documentation: "Report documentation issues" - Includes documentation quality checklist 🆕
- Functional Specification: "Create functional specs" - Codeless, AI-friendly specification format 🆕
- GitHub Configuration: "Report .github configuration issues" - For workflows, actions, CI/CD 🆕
- Agile Ticket: "Create actionable Agile tickets" - User stories, acceptance criteria, engineering principles 🆕
- UX Issue: "Report user experience problems" - Usability concerns and UX suggestions 🆕

✅ **Consistent Naming Conventions** - All files use lowercase with underscores (snake_case)

✅ **Follows Project Principles** - Each template aligns with the project's referential transparency initiative

✅ **Triage Label** - Most templates include the "triage" label for initial review (exception: ux_issue.md uses UX and enhancement labels)

## Comparison Summary

### Complexity Scale
1. **Feature Request** (40 lines) - Simplest, focused on proposing new functionality
2. **Copilot Issue** (45 lines) - Straightforward bug/feature reporting for Copilot
3. **UX Issue** (46 lines) - Simple user experience reporting 🆕
4. **Technical Debt** (90 lines) - Moderate complexity for code quality issues
5. **GitHub Configuration** (118 lines) - Moderate-to-high complexity for infrastructure issues
6. **Documentation** (147 lines) - Comprehensive with detailed categorization
7. **GitHub Copilot Test** (190 lines) - Comprehensive testing documentation for Copilot features 🆕
8. **Agile Ticket** (203 lines) - Structured Agile/Scrum ticket format with YML forms 🆕
9. **Functional Specification** (379 lines) - Most comprehensive, codeless specification format

### Common Label Strategy
- Most templates use **"triage"** for initial categorization
- Exception: **UX Issue** uses "UX" and "enhancement" without "triage" 🆕
- Each has a specific domain label (technical-debt, enhancement, copilot, documentation, functional-spec, infrastructure, testing, UX)
- Technical Debt uniquely includes **"maintenance"** label
- Functional Specification uses both **"documentation"** and **"functional-spec"** labels
- GitHub Configuration uses both **"infrastructure"** and **"configuration"** labels
- GitHub Copilot Test uses both **"copilot"** and **"testing"** labels 🆕

### Functional Programming Focus
Most templates include referential transparency guidance, showing the project's commitment to:
- Pure functions and deterministic behavior
- Explicit dependency management
- Side effect isolation
- Enhanced testability

Note: UX Issue template focuses on user-facing concerns rather than implementation, so it doesn't include referential transparency sections.

### Target Use Cases
- **Technical Debt**: Internal code quality improvements
- **Feature Request**: New capabilities and enhancements
- **Copilot Issue**: GitHub Copilot integration problems and feature requests
- **GitHub Copilot Test**: Systematic testing and quality evaluation of Copilot suggestions 🆕
- **Documentation**: Content creation and maintenance
- **Functional Specification**: Codeless specifications for AI-supported development
- **GitHub Configuration**: DevOps, CI/CD, workflows, actions, and infrastructure issues
- **Agile Ticket**: Actionable user stories and tasks following Agile/Scrum methodology 🆕
- **UX Issue**: User experience problems, usability concerns, and interface suggestions 🆕

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
   - New features → Feature Request or Agile Ticket
   - Copilot problems → Copilot Issue
   - Documentation needs → Documentation
   - Functional specifications → Functional Specification
   - Actionable user stories → Agile Ticket 🆕
   - Breaking down specs into tasks → Agile Ticket 🆕
   - User experience issues → UX Issue 🆕
   - Workflows/CI/CD issues → GitHub Configuration

2. **Agile Ticket Template**: Use for Agile/Scrum teams to create structured user stories with acceptance criteria, engineering principles, and definition of done. Ideal for breaking down functional specifications into implementable tasks 🆕

3. **Functional Specification Template**: Use when creating codeless, language-agnostic specifications for features or components. Ideal for AI-supported development and cross-platform implementations

4. **Documentation Template**: Use for any content-related issues due to its comprehensive checklist and quality criteria

5. **Consistency**: All templates follow consistent patterns, making them easy to use and maintain

6. **Referential Transparency**: Every template guides users toward functional programming principles, ensuring code quality across all contributions

7. **Workflow Recommendation**: For large features, start with a Functional Specification, then break it down into multiple Agile Tickets for implementation 🆕

## Related Resources

- **Template Location**: `.github/ISSUE_TEMPLATE/`
- **Documentation Index**: `docs/INDEX.md`
- **Referential Transparency Guide**: `.github/REFERENTIAL_TRANSPARENCY.md`
- **Code Review Guide**: `.github/CODE_REVIEW_GUIDE.md`
- **TDD Guide**: `.github/TDD_GUIDE.md` 🆕
- **Contributing Guide**: `.github/CONTRIBUTING.md`

---

**Last Updated**: Generated from templates in repository
**Maintained By**: Guia Turístico Project Team
**Version**: 0.8.5-alpha
