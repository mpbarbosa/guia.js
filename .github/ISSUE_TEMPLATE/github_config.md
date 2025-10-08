---
name: GitHub Configuration
about: Report issues or request changes to .github configuration (workflows, actions, issue templates, etc.)
title: "[Config] "
labels: infrastructure, configuration, triage
assignees: ''

---

## Configuration Issue Summary

<!-- Briefly describe the configuration issue or improvement request. What aspect of .github needs attention? -->

## Type of Configuration Issue

<!-- Select all that apply -->

- [ ] **Workflow Issue** - GitHub Actions workflow not working as expected
- [ ] **Action Issue** - Custom GitHub Action needs fix or enhancement
- [ ] **Issue Template** - Issue template needs to be added, modified, or fixed
- [ ] **CI/CD Pipeline** - Build, test, or deployment pipeline problem
- [ ] **Configuration File** - config.yml or other configuration needs update
- [ ] **Security/Permissions** - Access control or security settings issue
- [ ] **Documentation** - .github documentation needs improvement
- [ ] **Enhancement** - New workflow, action, or automation feature request
- [ ] **Architectural** - Architecture or design patterns in .github configuration (e.g., low coupling, modularity)

## Affected Components

<!-- List the specific .github files or components affected -->

- File/Component: 
- Location: `.github/`

## Current Behavior

<!-- Describe the current state or behavior. What's happening now? Include error messages, workflow run failures, or unexpected behavior. -->

## Expected Behavior

<!-- Describe what should happen. How should the configuration work? -->

## Impact

<!-- Explain how this configuration issue affects the project: -->

- **Developer Impact**: <!-- e.g., workflows fail on pull requests, blocking merges -->
- **CI/CD Impact**: <!-- e.g., tests don't run automatically, deployment fails -->
- **User Impact**: <!-- e.g., contributors can't create proper issues -->
- **Maintenance Impact**: <!-- e.g., manual intervention required frequently -->

## Steps to Reproduce (if applicable)

<!-- For bugs or workflow failures, provide steps to reproduce: -->

1. 
2. 
3. 

## Proposed Solution

<!-- Suggest how this configuration issue should be addressed: -->
<!-- - Workflow modifications -->
<!-- - New actions or steps -->
<!-- - Configuration changes -->
<!-- - Documentation updates -->
<!-- - Template improvements -->

### Implementation Considerations

<!-- When proposing changes, consider: -->
<!-- - Will the changes be maintainable and well-documented? -->
<!-- - Are there any breaking changes or migration steps needed? -->
<!-- - How will this affect existing workflows or processes? -->
<!-- - Are dependencies explicit and version-pinned? -->
<!-- - Is the configuration testable (e.g., using act for workflows)? -->
<!-- See WORKFLOW_SETUP.md for guidance on workflows and actions -->

## Priority Level

<!-- Select the appropriate priority level and provide justification -->

- [ ] **Critical** - Blocking development, CI/CD completely broken
- [ ] **High** - Significantly impacting workflow efficiency or reliability
- [ ] **Medium** - Noticeable impact on automation or processes
- [ ] **Low** - Minor improvement that can be addressed when convenient

## Environment Details (if applicable)

<!-- For workflow or action issues, provide: -->

- **GitHub Runner**: <!-- e.g., ubuntu-latest, windows-latest, self-hosted -->
- **Node/Python Version**: <!-- if relevant -->
- **Workflow/Action**: <!-- name and location -->
- **Run ID**: <!-- GitHub Actions run ID for failed runs -->

## Related Resources

<!-- Link to related resources: -->

- Workflow Run: <!-- Link to failed workflow run -->
- Related Issues: <!-- Links to related issues -->
- Documentation: <!-- Links to relevant docs -->
- External References: <!-- Stack Overflow, GitHub discussions, etc. -->

## Acceptance Criteria

<!-- Define what "done" looks like for this configuration change -->

- [ ] Configuration works as expected
- [ ] Changes are documented
- [ ] No breaking changes to existing workflows (or migration plan provided)
- [ ] Configuration is tested (locally or in workflow)
- [ ] Team members are notified of changes if needed

## Additional Context

<!-- Add any other context such as logs, screenshots, workflow YAML snippets, or error messages. -->
