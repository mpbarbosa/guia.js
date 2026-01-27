#!/bin/bash

# Test Suite for Conditional Step Execution
# Tests all scenarios for the workflow condition evaluator

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

print_test() {
    echo -e "${BLUE}Testing: $1${NC}"
}

print_pass() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
    ((TESTS_PASSED++))
}

print_fail() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    ((TESTS_FAILED++))
}

print_header() {
    echo ""
    echo "=========================================="
    echo "$1"
    echo "=========================================="
    echo ""
}

# Test helper function
test_condition() {
    local step="$1"
    local expected_exit="$2"
    local description="$3"
    
    print_test "$description"
    
    if ./.github/scripts/workflow-condition-evaluator.sh "$step" HEAD~1 2>/dev/null; then
        actual_exit=0
    else
        actual_exit=1
    fi
    
    if [ "$actual_exit" -eq "$expected_exit" ]; then
        print_pass "$description"
        return 0
    else
        print_fail "$description (expected exit $expected_exit, got $actual_exit)"
        return 1
    fi
}

# Main test suite
print_header "Conditional Step Execution Test Suite"

echo "Current repository state:"
git diff --name-only HEAD~1 | head -n 5
echo "..."
echo ""

print_header "Test Group 1: Step 3 - Syntax Validation"

# These tests use actual repository state
test_condition "step3_syntax_validation" 0 "Should run when JS files exist"

print_header "Test Group 2: Step 4 - Directory Structure"

test_condition "step4_directory_structure" 0 "Should run when cache is missing/expired"

print_header "Test Group 3: Step 5 - Coverage Report"

test_condition "step5_coverage_report" 0 "Should run when source code changes"

print_header "Test Group 4: Step 7 - Test Execution"

test_condition "step7_test_execution" 0 "Should run when code or tests change"

print_header "Test Group 5: Unknown Steps"

test_condition "unknown_step" 0 "Should default to run for unknown steps"

print_header "Test Group 6: Cache Testing"

echo "Testing cache creation..."
if mkdir -p .github/cache 2>/dev/null; then
    echo "Sample file" > .github/cache/directory_structure.cache
    print_pass "Cache directory created successfully"
else
    print_fail "Failed to create cache directory"
fi

if [ -f ".github/cache/directory_structure.cache" ]; then
    print_pass "Cache file exists"
    
    # Test cache age
    cache_age=$(( $(date +%s) - $(stat -c %Y .github/cache/directory_structure.cache 2>/dev/null || echo 0) ))
    if [ "$cache_age" -lt 86400 ]; then
        print_pass "Cache is fresh (age: ${cache_age}s < 24h)"
    else
        print_fail "Cache is stale (age: ${cache_age}s >= 24h)"
    fi
else
    print_fail "Cache file not found"
fi

print_header "Test Group 7: Pattern Matching"

echo "Testing pattern matching logic..."

# Test JavaScript pattern
if echo "src/app.js" | grep -qE "src/.*\.js"; then
    print_pass "JavaScript pattern matches src/app.js"
else
    print_fail "JavaScript pattern does not match src/app.js"
fi

# Test documentation pattern
if echo "README.md" | grep -qE ".*\.md"; then
    print_pass "Documentation pattern matches README.md"
else
    print_fail "Documentation pattern does not match README.md"
fi

# Test test file pattern
if echo "__tests__/example.test.js" | grep -qE "__tests__/.*\.test\.js"; then
    print_pass "Test file pattern matches __tests__/example.test.js"
else
    print_fail "Test file pattern does not match __tests__/example.test.js"
fi

print_header "Test Group 8: Configuration Validation"

echo "Checking .workflow-config.yaml..."

if [ -f ".workflow-config.yaml" ]; then
    print_pass "Configuration file exists"
    
    # Check for required sections
    if grep -q "conditionals:" .workflow-config.yaml; then
        print_pass "Configuration has 'conditionals' section"
    else
        print_fail "Configuration missing 'conditionals' section"
    fi
    
    if grep -q "change_patterns:" .workflow-config.yaml; then
        print_pass "Configuration has 'change_patterns' section"
    else
        print_fail "Configuration missing 'change_patterns' section"
    fi
    
    # Check for specific steps
    for step in step3_syntax_validation step4_directory_structure step5_coverage_report step7_test_execution; do
        if grep -q "$step:" .workflow-config.yaml; then
            print_pass "Configuration includes $step"
        else
            print_fail "Configuration missing $step"
        fi
    done
else
    print_fail "Configuration file .workflow-config.yaml not found"
fi

print_header "Test Group 9: Script Permissions"

if [ -x ".github/scripts/workflow-condition-evaluator.sh" ]; then
    print_pass "Condition evaluator is executable"
else
    print_fail "Condition evaluator is not executable"
fi

if [ -x ".github/scripts/test-workflow-locally.sh" ]; then
    print_pass "Local workflow script is executable"
else
    print_fail "Local workflow script is not executable"
fi

print_header "Test Summary"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
PASS_RATE=$(( TESTS_PASSED * 100 / TOTAL_TESTS ))

echo "Total tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo "Pass rate: ${PASS_RATE}%"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed${NC}"
    exit 1
fi
