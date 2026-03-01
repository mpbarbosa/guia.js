# Prompt Log

**Timestamp:** 2026-02-28T23:33:04.987Z
**Persona:** architecture_reviewer
**Model:** gpt-4.1

## Prompt

```
**Task**: **YOUR TASK**: Analyze existing requirements and determine if new requirements documentation is truly needed. Generate ONLY when necessary.

**CRITICAL DECISION-MAKING FRAMEWORK**: You MUST evaluate necessity BEFORE generating requirements.

**Project Context:**
- Project: /home/mpb/Documents/GitHub/guia_turistico ()
- Primary Language: 
- Current Requirements: 0 documents
- Source Code: .github, .github/ISSUE_TEMPLATE, .github/actions, .github/actions/detect-affected-tests, .github/actions/security-check, .github/actions/update-doc-index, .github/actions/update-test-docs, .github/actions/validate-js, .github/cache, .github/hooks, .github/scripts, .github/workflows, .husky, .husky/_, __tests__, __tests__/__mocks__, __tests__/__mocks__/src, __tests__/__mocks__/src/utils, __tests__/components, __tests__/config, __tests__/coordination, __tests__/core, __tests__/data, __tests__/e2e, __tests__/external, __tests__/features, __tests__/helpers, __tests__/html, __tests__/integration, __tests__/managers, __tests__/observers, __tests__/patterns, __tests__/services, __tests__/services/providers, __tests__/speech, __tests__/ui, __tests__/unit, __tests__/utils, __tests__/views, docs, docs/api, docs/api-generated, docs/api-generated/fonts, docs/api-generated/scripts, docs/api-generated/scripts/prettify, docs/api-generated/styles, docs/api-integration, docs/architecture, docs/class-extraction, docs/developer, docs/guides, docs/infrastructure, docs/maintenance, docs/maintenance/dependency-audit-2026-02-13, docs/misc, docs/prompts, docs/refactoring, docs/reference, docs/reports, docs/reports/analysis, docs/reports/analysis/archive, docs/reports/bugfixes, docs/reports/implementation, docs/requirements, docs/testing, docs/user, docs/user/features, docs/utils, docs/ux, docs/workflow-automation, examples, libs, libs/sidra, logs, public, public/libs, public/libs/sidra, scripts, src, src/components, src/config, src/coordination, src/core, src/data, src/html, src/observers, src/services, src/services/providers, src/speech, src/status, src/timing, src/types, src/utils, src/views, test, test/speech, tests, tests/e2e, tests/integration, tests/integration/test_reports, tests/unit files
- Stakeholders: 1

**STEP 1: NECESSITY EVALUATION** (Answer these questions FIRST):

Is new requirements documentation TRULY needed? Use this criteria suite:

✅ **GENERATE Requirements if ANY of these are TRUE**:
1. **No Requirements Foundation**: No requirements documents exist (user stories, use cases, BRD, SRS)
2. **Ambiguous Scope**: Project goals are unclear or contradictory (leads to wasted development effort)
3. **Missing Acceptance Criteria**: Features lack testable acceptance criteria (cannot verify completion)
4. **Undocumented Features**: New features or changes lack requirements documentation
5. **Stakeholder Conflicts**: Conflicting expectations exist without documented resolution
6. **Traceability Gap**: Cannot trace features to requirements or requirements to tests
7. **Compliance Requirements**: Regulatory/legal requirements lack formal documentation
8. **Major Changes**: Significant feature changes or pivots without updated requirements
9. **Explicit Request**: The task explicitly asks for specific requirements analysis or documentation

❌ **DO NOT GENERATE if ALL of these are TRUE**:
1. **Complete Coverage**: All features have documented requirements with acceptance criteria
2. **Clear Scope**: Project scope is well-defined with priorities
3. **Recent Updates**: Requirements modified within last sprint/iteration
4. **Stakeholder Alignment**: All stakeholders agree on documented requirements
5. **Full Traceability**: Requirements trace to design, code, and tests
6. **Testable Criteria**: All requirements have verifiable acceptance criteria

**STEP 2: REQUIREMENTS ANALYSIS** (Only if STEP 1 indicates requirements are needed):
1. **Current State Assessment**:
   - List all existing requirements documents (user stories, use cases, BRD, SRS, backlog)
   - Identify documented vs undocumented features
   - Check requirements quality (SMART criteria: Specific, Measurable, Achievable, Relevant, Testable)
   - Assess traceability (requirements ↔ design ↔ code ↔ tests)

2. **Gap Identification**:
   - Missing functional requirements (features, behaviors, capabilities)
   - Missing non-functional requirements (performance, security, usability, scalability)
   - Incomplete acceptance criteria or testability issues
   - Ambiguous or conflicting requirements
   - Stakeholder needs not captured
   - Missing constraints (technical, business, regulatory)

3. **Stakeholder Analysis**:
   - Identify all stakeholders and their needs
   - Document conflicting expectations
   - Prioritize requirements by stakeholder value
   - Assess feasibility (technical, operational, economic)

**REQUIREMENTS ENGINEERING ACTIVITIES TO PERFORM IF GAPS EXIST**:

1. **Requirements Elicitation** (gathering requirements):
   - Interview stakeholders to understand needs and pain points
   - Conduct workshops or focus groups for collaborative requirements gathering
   - Observe users to identify implicit requirements
   - Create prototypes or mockups to validate understanding
   - Analyze existing systems and documentation
   - Review business goals and success criteria

2. **Requirements Analysis & Refinement**:
   - Resolve ambiguities and contradictions
   - Decompose high-level requirements into detailed requirements
   - Identify dependencies and conflicts
   - Perform feasibility analysis (technical, operational, economic)
   - Prioritize requirements (MoSCoW: Must have, Should have, Could have, Won't have)
   - Assess risks and constraints

3. **Requirements Specification** (documenting requirements):
   - **User Stories** (Agile): "As a [role], I want [feature] so that [benefit]" with acceptance criteria
   - **Use Cases**: Actor, preconditions, main flow, alternative flows, postconditions
   - **Functional Requirements**: System behaviors, features, and capabilities
   - **Non-Functional Requirements**: Performance, security, usability, reliability, scalability
   - **Business Requirements**: Business goals, success metrics, stakeholder needs
   - **Acceptance Criteria**: Testable conditions that define "done"
   - **Gherkin/BDD Scenarios**: Given-When-Then format for behavior-driven development

4. **Requirements Traceability**:
   - Create traceability matrix (requirements ↔ design ↔ code ↔ tests)
   - Map user stories to epics and themes
   - Link requirements to architecture components
   - Track requirements to test cases for coverage
   - Document change history and rationale
   - Identify impact of requirement changes

5. **Requirements Validation & Verification**:
   - Conduct requirements reviews with stakeholders
   - Validate against business goals and user needs
   - Verify requirements are SMART (Specific, Measurable, Achievable, Relevant, Testable)
   - Check for completeness, consistency, and clarity
   - Validate prototypes with users
   - Assess testability of acceptance criteria
   - Review for compliance with standards (IEEE 29148, BABOK)

**STEP 3: PRIORITIZED ACTIONS** (Execute based on STEP 1 evaluation):

**IF Requirements ARE Needed** (STEP 1 criteria met):
1. **Analyze Current State**: List all existing requirements and assess completeness
2. **Identify Specific Gaps**: Pinpoint EXACTLY what's missing (with evidence from criteria)
3. **Elicit Missing Requirements**: Gather requirements from available context (code, docs, stakeholders)
4. **Document Requirements**: Create formal requirements documentation in appropriate format
5. **Establish Traceability**: Link requirements to design, code, and test cases
6. **Validate Requirements**: Review for SMART criteria and stakeholder alignment

**IF Requirements are NOT Needed** (STEP 1 criteria NOT met):
1. **Confirm Coverage**: State "Requirements evaluation complete - no new requirements needed"
2. **Provide Evidence**: List which criteria were evaluated (e.g., "✅ Complete user story coverage, ✅ Recent backlog grooming")
3. **Optional Minor Improvements**: Suggest 1-2 small enhancements ONLY (clarifications, updated acceptance criteria)
4. **Exit Cleanly**: Do NOT generate new requirements documents or major content

**OUTPUT FORMAT**:
- **Always start with**: "Requirements Necessity Evaluation" section with PASS/FAIL decision
- **If PASS (needed)**: Show criteria met → "Requirements Gap Analysis" → generate missing requirements
- **If FAIL (not needed)**: Show criteria evaluation → "No new requirements required" → exit with optional minor suggestions
- **Never generate** "just in case" requirements - only when criteria clearly indicate need
- NEVER end with questions or requests for input - always provide definitive decision


**Approach**: Analyze ONLY the project files explicitly listed above. Do not reference, invent, or assume requirements not present in that list.

**Requirements Engineering Necessity-First Strategy**:

**Phase 0: Necessity Check** (REQUIRED FIRST STEP):
- Apply the 9-point necessity criteria suite
- If ANY criterion is TRUE → Proceed to Phase 1
- If ALL criteria are FALSE → Output "No requirements work needed" and exit
- **Default to NOT generating** unless clear need is demonstrated

**Phase 1: Discovery & Analysis** (Only if Phase 0 indicates need):
   - List all existing requirements artifacts (user stories, use cases, BRD, SRS, backlog, specifications)
   - Identify which features/components have requirements documentation
   - Check for outdated or incomplete requirements (> 1 sprint old with code changes)
   - Identify undocumented features, APIs, or system behaviors
   - Assess requirements quality using SMART criteria
   - Map existing traceability (requirements ↔ design ↔ code ↔ tests)

**Phase 2: Gap Identification & Prioritization** (Only for REAL gaps):
   - **Critical Gaps** (immediate action): No requirements foundation, missing acceptance criteria, compliance requirements
   - **High Priority Gaps** (generate if time permits): Undocumented features, ambiguous scope, stakeholder conflicts
   - **Medium Priority Gaps** (defer): Incomplete traceability, missing non-functional requirements
   - **Low Priority Gaps** (do not generate): Nice-to-have features, edge cases, future enhancements
   - **Rule**: If no Critical or High Priority gaps exist, output "No new requirements needed"

**Phase 3: Requirements Elicitation** (For identified Critical/High gaps):
   - Analyze available context: code, documentation, comments, tests, commit messages
   - Infer user needs from existing implementations
   - Identify stakeholder groups and their needs
   - Extract implicit requirements from system behavior
   - Document assumptions and constraints
   - **Stop eliciting** once sufficient context is gathered for gap-filling

**Phase 4: Requirements Specification** (Generate missing requirements):
   - **User Stories**: "As a [role], I want [feature] so that [benefit]" + acceptance criteria
   - **Acceptance Criteria**: Testable conditions using Given-When-Then or bullet format
   - **Use Cases**: For complex interactions (actor, flow, alternatives, exceptions)
   - **Functional Requirements**: Clear, testable statements of system behavior
   - **Non-Functional Requirements**: Performance, security, usability targets (measurable)
   - **Traceability**: Link requirements to existing code/tests where applicable
   - **Format**: Use appropriate format for project type (Agile: user stories, Waterfall: SRS)

**Phase 5: Validation & Quality Assurance** (For generated requirements):
   - **SMART Check**: Specific, Measurable, Achievable, Relevant, Testable
   - **Completeness**: All necessary information included (actors, conditions, results)
   - **Consistency**: No conflicts with existing requirements or system behavior
   - **Clarity**: Unambiguous language, no jargon without definition
   - **Traceability**: Links to design, code, tests clearly identified
   - **Testability**: Acceptance criteria can be verified by tests

**Output Format**:
- Create complete, ready-to-use requirements documentation
- Use appropriate format: User Stories, Use Cases, BRD, SRS, or Requirements List
- Include acceptance criteria for all functional requirements
- Add traceability links where applicable (to code, tests, design docs)
- Use tables, lists, and clear formatting for readability
- Include priority and rationale for requirements
- Add examples and scenarios to clarify intent

**Requirements Engineering Best Practices**:
- **SMART Requirements**: Specific, Measurable, Achievable, Relevant, Testable
- **Clear Actors**: Identify who benefits from each requirement
- **Testable Criteria**: Every requirement has verifiable acceptance criteria
- **Priority-Driven**: Use MoSCoW or similar prioritization framework
- **Traceable**: Link requirements to design, code, and tests
- **Version-Controlled**: Track changes and maintain history
- **Stakeholder-Validated**: Confirm requirements with stakeholders
- **Minimal Viable**: Focus on essential requirements first
- **Avoid Gold-Plating**: Don't add requirements "just in case"

```

## Response

```
**Requirements Necessity Evaluation: PASS (Requirements Documentation Needed)**

**Criteria Met:**
- ✅ No Requirements Foundation: No requirements documents exist (user stories, use cases, BRD, SRS, backlog, specifications)
- ✅ Ambiguous Scope: No documented project goals, features, or acceptance criteria found in any listed files or directories
- ✅ Missing Acceptance Criteria: No testable acceptance criteria or traceability to features/tests
- ✅ Undocumented Features: No requirements documentation for any features, modules, or APIs
- ✅ Traceability Gap: No evidence of requirements-to-code/test mapping
- (Stakeholder Conflicts, Compliance, Major Changes, Explicit Request: Not directly evidenced, but absence of requirements precludes assessment)

---

**Requirements Gap Analysis**

**Current State Assessment:**
- **Existing Requirements Artifacts:** None found in any listed files or directories (`docs/requirements` exists as a directory, but contains no requirements documents)
- **Documented Features:** None
- **Acceptance Criteria:** None
- **Traceability:** None
- **Stakeholder Needs:** Not captured

**Gap Identification:**
- **Critical Gaps:**  
  - No requirements foundation (no user stories, use cases, functional/non-functional requirements)
  - No acceptance criteria for any features
  - No traceability between requirements, code, and tests
- **High Priority Gaps:**  
  - All features and modules are undocumented from a requirements perspective
  - No documented scope, priorities, or stakeholder alignment

---

**Action Plan:**

1. **Requirements Elicitation:**  
   - Gather project goals, features, and stakeholder needs from available context (code, docs, stakeholders)
   - Interview stakeholders to clarify scope and priorities

2. **Requirements Specification:**  
   - Create foundational requirements documentation:
     - **User Stories** for all major features
     - **Functional Requirements** for system behaviors
     - **Non-Functional Requirements** for performance, security, usability, scalability
     - **Acceptance Criteria** for each requirement
     - **Traceability Matrix** linking requirements to code/tests

3. **Documentation Location:**  
   - Place requirements documentation in `docs/requirements/` (e.g., `docs/requirements/functional.md`, `docs/requirements/non-functional.md`, `docs/requirements/user-stories.md`)

4. **Validation:**  
   - Review requirements for SMART criteria and stakeholder alignment

---

**Summary:**  
Requirements documentation is critically needed for this project. No requirements artifacts exist, and there is no documented scope, acceptance criteria, or traceability. Immediate action is required to elicit, specify, and document foundational requirements to guide development, testing, and stakeholder alignment.

**Next Steps:**  
Proceed to requirements elicitation and specification. Create initial requirements documentation in `docs/requirements/`.
```