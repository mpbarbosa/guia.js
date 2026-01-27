#!/bin/bash

# Test Workflow Locally
# This script simulates what the GitHub Actions workflow will do
# Run this before pushing to verify everything works

# Track overall exit code
EXIT_CODE=0

echo "========================================"
echo "Testing GitHub Actions Workflow Locally"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        EXIT_CODE=1
        return 1
    fi
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Function to check if step should run based on change type
should_run_step() {
    local step_name="$1"
    
    # If no change type detected, run all steps
    if [ -z "$CHANGE_STEPS" ] || [ "$CHANGE_TYPE" = "unknown" ]; then
        return 0
    fi
    
    # Check if step is in the allowed steps list
    if echo "$CHANGE_STEPS" | grep -qw "$step_name"; then
        return 0
    else
        return 1
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Run this script from the project root.${NC}"
    exit 1
fi

echo "Step 1: Detecting change type and files"
echo "----------------------------------------"

# Detect change type using the detector script
if [ -x ".github/scripts/change-type-detector.sh" ]; then
    print_info "Running change-type detection..."
    CHANGE_TYPE=$(./.github/scripts/change-type-detector.sh HEAD~1 2>&1 | tail -1)
    
    # Load cached information
    if [ -f ".github/cache/change_type.cache" ]; then
        source .github/cache/change_type.cache
        echo ""
        echo "Change Type Analysis:"
        echo "  Type: $CHANGE_TYPE"
        echo "  Strategy: $TEST_STRATEGY"
        echo "  Steps: $CHANGE_STEPS"
        echo ""
    else
        print_info "Using default workflow (change type detection unavailable)"
        CHANGE_TYPE="unknown"
        CHANGE_STEPS="security_audit syntax_validation test_execution coverage_report"
        TEST_STRATEGY="all"
    fi
else
    print_info "Change-type detector not found, using legacy detection"
    CHANGE_TYPE="unknown"
fi

CHANGED_FILES=$(git diff --name-only HEAD)
if [ -z "$CHANGED_FILES" ]; then
    CHANGED_FILES=$(git diff --name-only HEAD~1)
fi

if [ -z "$CHANGED_FILES" ]; then
    print_info "No changes detected. Checking all files anyway."
    CHANGED_FILES="src/guia.js src/guia_ibge.js"
else
    echo "Changed files:"
    echo "$CHANGED_FILES" | head -10
    [ $(echo "$CHANGED_FILES" | wc -l) -gt 10 ] && echo "  ... and $(( $(echo "$CHANGED_FILES" | wc -l) - 10 )) more"
fi
echo ""

# Detect file types
JS_CHANGED=false
TEST_CHANGED=false
DOC_CHANGED=false
SRC_CHANGED=false

if echo "$CHANGED_FILES" | grep -q "\.js$"; then
    JS_CHANGED=true
fi
if echo "$CHANGED_FILES" | grep -q "__tests__.*\.js$"; then
    TEST_CHANGED=true
fi
if echo "$CHANGED_FILES" | grep -qE "\.md$"; then
    DOC_CHANGED=true
fi
if echo "$CHANGED_FILES" | grep -q "^src/.*\.js$"; then
    SRC_CHANGED=true
fi

echo "Detection results:"
echo "  JavaScript files: $JS_CHANGED"
echo "  Test files: $TEST_CHANGED"
echo "  Documentation files: $DOC_CHANGED"
echo "  Source files: $SRC_CHANGED"
echo ""

# Step 2: Security audit (with change-type routing)
echo "Step 2: Running security audit"
echo "--------------------------------"

if should_run_step "security_audit"; then
    print_info "Checking for known vulnerabilities..."
    
    if npm audit --json > /tmp/audit-results.json 2>&1; then
        print_status 0 "Security audit (no vulnerabilities)"
    else
        AUDIT_EXIT=$?
        
        # Parse results
        CRITICAL=$(cat /tmp/audit-results.json 2>/dev/null | jq -r '.metadata.vulnerabilities.critical // 0' 2>/dev/null || echo "0")
        HIGH=$(cat /tmp/audit-results.json 2>/dev/null | jq -r '.metadata.vulnerabilities.high // 0' 2>/dev/null || echo "0")
        MODERATE=$(cat /tmp/audit-results.json 2>/dev/null | jq -r '.metadata.vulnerabilities.moderate // 0' 2>/dev/null || echo "0")
        LOW=$(cat /tmp/audit-results.json 2>/dev/null | jq -r '.metadata.vulnerabilities.low // 0' 2>/dev/null || echo "0")
        echo ""
        echo "Vulnerabilities found:"
        echo "  🔴 Critical: $CRITICAL"
        echo "  🟠 High: $HIGH"
        echo "  🟡 Moderate: $MODERATE"
        echo "  🟢 Low: $LOW"
        echo ""
        
        if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
            print_status 1 "Security audit (CRITICAL or HIGH vulnerabilities found!)"
            print_info "Run 'npm audit fix' to attempt automatic fixes"
        elif [ "$MODERATE" -gt 0 ]; then
            print_info "Moderate vulnerabilities found. Review recommended."
            print_status 0 "Security audit (moderate issues only)"
        else
            print_status 0 "Security audit (low severity only)"
        fi
    fi
else
    print_info "⏭️  Skipped (change type: $CHANGE_TYPE)"
fi
echo ""

# Step 3: Validate JavaScript (with change-type routing and conditional execution)
echo "Step 3: Validating JavaScript syntax"
echo "-------------------------------------"
if should_run_step "syntax_validation"; then
    if ./.github/scripts/workflow-condition-evaluator.sh step3_syntax_validation 2>/dev/null; then
        if npm run validate; then
            print_status 0 "JavaScript syntax validation"
        else
            print_status 1 "JavaScript syntax validation"
        fi
    else
        print_info "⏭️  Skipped (no JavaScript changes detected)"
    fi
else
    print_info "⏭️  Skipped (change type: $CHANGE_TYPE)"
fi
echo ""

# Step 4: Directory structure scan (with change-type routing and caching)
echo "Step 4: Directory structure analysis"
echo "-------------------------------------"
if should_run_step "directory_structure"; then
    if ./.github/scripts/workflow-condition-evaluator.sh step4_directory_structure 2>/dev/null; then
        if [ -d ".github/cache" ] || mkdir -p .github/cache 2>/dev/null; then
            find src -type f > .github/cache/directory_structure.cache 2>/dev/null
            print_status 0 "Directory structure cached"
        else
            print_info "Cache directory not writable, skipping cache"
        fi
    else
        print_info "⏭️  Skipped (using cached structure, no new files)"
    fi
else
    print_info "⏭️  Skipped (change type: $CHANGE_TYPE)"
fi
echo ""

# Step 5: Run tests (with change-type routing and conditional execution)
echo "Step 5: Running tests"
echo "---------------------"
if should_run_step "test_execution"; then
    if ./.github/scripts/workflow-condition-evaluator.sh step7_test_execution 2>/dev/null; then
        print_info "Running test suite (strategy: ${TEST_STRATEGY:-all})..."
        if npm test; then
            print_status 0 "All tests"
        else
            print_status 1 "All tests"
        fi
    else
        print_info "⏭️  Skipped (no code changes detected)"
    fi
else
    print_info "⏭️  Skipped (change type: $CHANGE_TYPE)"
fi
echo ""

# Step 6: Generating coverage report (with change-type routing and conditional execution)
echo "Step 6: Generating coverage report"
echo "-----------------------------------"
if should_run_step "coverage_report"; then
    if ./.github/scripts/workflow-condition-evaluator.sh step5_coverage_report 2>/dev/null; then
        if npm run test:coverage; then
            print_status 0 "Coverage generation"
        else
            print_status 1 "Coverage generation"
        fi
    else
        print_info "⏭️  Skipped (docs-only or test-only changes)"
    fi
else
    print_info "⏭️  Skipped (change type: $CHANGE_TYPE)"
fi
echo ""

# Step 7: Check test documentation updates
if [ "$TEST_CHANGED" = true ]; then
    echo "Step 6: Checking test documentation"
    echo "------------------------------------"
    
    TEST_SUITES=$(find __tests__ -name "*.test.js" | wc -l)
    print_info "Found $TEST_SUITES test suites"
    
    if [ -f "TESTING.md" ]; then
        if grep -q "Last updated automatically" TESTING.md; then
            print_info "TESTING.md has automation notice (will be updated in CI)"
        else
            print_info "TESTING.md will get automation notice in CI"
        fi
        print_status 0 "TESTING.md check"
    else
        print_status 1 "TESTING.md not found"
    fi
    echo ""
fi

# Step 5: Validate documentation
if [ "$DOC_CHANGED" = true ]; then
    echo "Step 7: Validating documentation"
    echo "---------------------------------"
    
    # Get changed markdown files
    CHANGED_DOCS=$(echo "$CHANGED_FILES" | grep "\.md$" || echo "")
    
    if [ -z "$CHANGED_DOCS" ]; then
        print_info "No documentation files changed"
    else
        echo "Changed documentation:"
        echo "$CHANGED_DOCS"
        
        # Check each file
        while IFS= read -r file; do
            if [ -f "$file" ]; then
                # Check for Windows line endings
                if grep -q $'\r' "$file" 2>/dev/null; then
                    echo -e "${YELLOW}⚠️  Warning: $file contains Windows line endings${NC}"
                fi
                print_status 0 "Validated $file"
            fi
        done <<< "$CHANGED_DOCS"
    fi
    
    # Check documentation index
    if [ -f "docs/INDEX.md" ]; then
        print_status 0 "docs/INDEX.md exists"
        
        if grep -q "automatically updated" docs/INDEX.md; then
            print_info "docs/INDEX.md has automation notice (will be updated in CI)"
        else
            print_info "docs/INDEX.md will get automation notice in CI"
        fi
    else
        print_status 1 "docs/INDEX.md not found"
    fi
    echo ""
fi

# Step 6: Summary
echo "========================================"
echo "Local Workflow Test Summary"
echo "========================================"
echo ""
echo "Changes detected:"
echo "  ├─ JavaScript files: $JS_CHANGED"
echo "  ├─ Test files: $TEST_CHANGED"
echo "  ├─ Documentation files: $DOC_CHANGED"
echo "  └─ Source files: $SRC_CHANGED"
echo ""

# Check if everything passed
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Safe to push.${NC}"
    echo ""
    echo "What will happen when you push:"
    
    if [ "$JS_CHANGED" = true ] || [ "$TEST_CHANGED" = true ]; then
        echo "  • Tests will run in CI"
        echo "  • Coverage report will be generated"
    fi
    
    if [ "$TEST_CHANGED" = true ]; then
        echo "  • TESTING.md will be updated automatically"
        echo "  • An auto-commit will be created by github-actions[bot]"
    fi
    
    if [ "$DOC_CHANGED" = true ]; then
        echo "  • Documentation will be validated"
        echo "  • docs/INDEX.md will be updated automatically"
    fi
    
    echo ""
    echo "Next steps:"
    echo "  1. Review changes: git status"
    echo "  2. Commit: git commit -m 'your message'"
    echo "  3. Push: git push"
    echo "  4. Check Actions tab on GitHub for results"
else
    echo -e "${RED}❌ Some checks failed. Fix issues before pushing.${NC}"
    exit 1
fi

echo ""
echo "For more information, see:"
echo "  • docs/GITHUB_ACTIONS_GUIDE.md"
echo "  • .github/workflows/README.md"
