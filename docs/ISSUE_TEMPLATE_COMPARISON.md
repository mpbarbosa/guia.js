# Issue Template Comparison

This document provides a comprehensive side-by-side comparison of all GitHub Issue templates available in the Guia.js project.

## Template Overview

==========================================================
ISSUE TEMPLATE COMPARISON
==========================================================

| Template            | Lines | Title Prefix | Labels                               |
|---------------------|-------|--------------|--------------------------------------|
| technical_debt.md   |   90  | [Tech Debt]  | technical-debt, maintenance, triage  |
| feature_request.md  |   40  | [Feature]    | enhancement, triage                  |
| copilot_issue.md    |   45  | [Copilot]    | copilot, triage                      |
| documentation.md    |  147  | [Docs]       | documentation, triage                |

## Common Features Across All Templates

All four templates share these structural elements:

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

### Documentation Template (147 lines) ⭐ Most Comprehensive

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
- Most detailed template with 147 lines
- Specific effort estimates for documentation tasks
- Comprehensive quality checklist
- Emphasis on documenting pure functions and referential transparency
- Multiple audience types for targeting documentation

## Integration Points

All templates are well-integrated into the project:

✅ **Referenced in docs/INDEX.md** - Each template is listed with description
- Technical Debt: "Report technical debt" - Now includes referential transparency considerations 🆕
- Feature Request: "Propose new features" - Now includes implementation considerations for pure functions 🆕
- Copilot Issue: "Report Copilot-related issues" - Now includes referential transparency guidelines 🆕
- Documentation: "Report documentation issues" - Includes documentation quality checklist 🆕

✅ **Consistent Naming Conventions** - All files use lowercase with underscores (snake_case)

✅ **Follows Project Principles** - Each template aligns with the project's referential transparency initiative

✅ **Triage Label** - All templates include the "triage" label for initial review

## Comparison Summary

### Complexity Scale
1. **Feature Request** (40 lines) - Simplest, focused on proposing new functionality
2. **Copilot Issue** (45 lines) - Straightforward bug/feature reporting for Copilot
3. **Technical Debt** (90 lines) - Moderate complexity for code quality issues
4. **Documentation** (147 lines) - Most comprehensive with detailed categorization

### Common Label Strategy
- All templates use **"triage"** for initial categorization
- Each has a specific domain label (technical-debt, enhancement, copilot, documentation)
- Technical Debt uniquely includes **"maintenance"** label

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

2. **Documentation Template**: Use for any content-related issues due to its comprehensive checklist and quality criteria

3. **Consistency**: All templates follow consistent patterns, making them easy to use and maintain

4. **Referential Transparency**: Every template guides users toward functional programming principles, ensuring code quality across all contributions

## Related Resources

- **Template Location**: `.github/ISSUE_TEMPLATE/`
- **Documentation Index**: `docs/INDEX.md`
- **Referential Transparency Guide**: `.github/REFERENTIAL_TRANSPARENCY.md`
- **Code Review Guide**: `.github/CODE_REVIEW_GUIDE.md`
- **Contributing Guide**: `.github/CONTRIBUTING.md`

---

**Last Updated**: Generated from templates in repository
**Maintained By**: Guia.js Project Team
**Version**: 0.8.5-alpha
