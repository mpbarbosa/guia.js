#!/bin/bash

# Test Suite for Change-Type Detection
# Tests all scenarios for commit type detection

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

# Test change type detection
test_change_type() {
    local commit_message="$1"
    local expected_type="$2"
    local description="$3"
    
    print_test "$description"
    
    # Create a temporary test function
    source .github/scripts/change-type-detector.sh
    
    # Test conventional commit extraction
    local detected=$(extract_conventional_type "$commit_message" || echo "")
    
    if [ -z "$detected" ]; then
        # Try pattern matching
        detected=$(detect_type_from_pattern "$commit_message" || echo "")
    fi
    
    if [ "$detected" = "$expected_type" ]; then
        print_pass "$description"
        return 0
    else
        print_fail "$description (expected: $expected_type, got: $detected)"
        return 1
    fi
}

# Main test suite
print_header "Change-Type Detection Test Suite"

print_header "Test Group 1: Conventional Commits"

test_change_type "feat: add new feature" "feat" "Feature conventional commit"
test_change_type "fix: resolve bug" "fix" "Fix conventional commit"
test_change_type "docs: update README" "docs" "Docs conventional commit"
test_change_type "refactor: simplify code" "refactor" "Refactor conventional commit"
test_change_type "test: add unit tests" "test" "Test conventional commit"
test_change_type "style: format code" "style" "Style conventional commit"
test_change_type "perf: optimize performance" "perf" "Perf conventional commit"
test_change_type "chore: update dependencies" "chore" "Chore conventional commit"
test_change_type "ci: update workflow" "ci" "CI conventional commit"
test_change_type "build: configure webpack" "build" "Build conventional commit"

print_header "Test Group 2: Conventional Commits with Scope"

test_change_type "feat(ui): add button component" "feat" "Feature with scope"
test_change_type "fix(api): handle error" "fix" "Fix with scope"
test_change_type "docs(readme): update examples" "docs" "Docs with scope"

print_header "Test Group 3: Pattern Matching"

test_change_type "add new geolocation feature" "feat" "Pattern: add"
test_change_type "implement user tracking" "feat" "Pattern: implement"
test_change_type "create dashboard view" "feat" "Pattern: create"
test_change_type "fix coordinate bug" "fix" "Pattern: fix"
test_change_type "correct calculation error" "fix" "Pattern: correct"
test_change_type "resolve memory leak" "fix" "Pattern: resolve"
test_change_type "update documentation" "docs" "Pattern: document"
test_change_type "refactor address parser" "refactor" "Pattern: refactor"

print_header "Test Group 4: Step Routing"

echo "Testing step routing for different types..."

# Source the detector to get functions
source .github/scripts/change-type-detector.sh

# Test feat routing
steps=$(get_steps_for_type "feat")
if echo "$steps" | grep -q "security_audit" && echo "$steps" | grep -q "test_execution"; then
    print_pass "feat routing includes all critical steps"
else
    print_fail "feat routing missing critical steps"
fi

# Test docs routing
steps=$(get_steps_for_type "docs")
if echo "$steps" | grep -q "syntax_validation" && ! echo "$steps" | grep -q "test_execution"; then
    print_pass "docs routing skips test execution"
else
    print_fail "docs routing includes unnecessary steps"
fi

# Test fix routing
steps=$(get_steps_for_type "fix")
if echo "$steps" | grep -q "test_execution" && echo "$steps" | grep -q "quality_checks"; then
    print_pass "fix routing includes testing and quality"
else
    print_fail "fix routing missing test or quality steps"
fi

print_header "Test Group 5: Test Strategy"

# Test strategies
for type in feat fix docs refactor test style perf chore; do
    strategy=$(get_test_strategy "$type")
    if [ -n "$strategy" ]; then
        print_pass "Test strategy for '$type': $strategy"
    else
        print_fail "No test strategy for '$type'"
    fi
done

print_header "Test Group 6: Configuration Validation"

echo "Checking .workflow-config.yaml..."

if [ -f ".workflow-config.yaml" ]; then
    print_pass "Configuration file exists"
    
    # Check for change_detection section
    if grep -q "change_detection:" .workflow-config.yaml; then
        print_pass "Configuration has 'change_detection' section"
    else
        print_fail "Configuration missing 'change_detection' section"
    fi
    
    # Check for types
    for type in feat fix docs refactor test style perf chore ci build; do
        if grep -q "$type:" .workflow-config.yaml; then
            print_pass "Configuration includes type: $type"
        else
            print_fail "Configuration missing type: $type"
        fi
    done
    
    # Check for routing section
    if grep -q "routing:" .workflow-config.yaml; then
        print_pass "Configuration has 'routing' section"
    else
        print_fail "Configuration missing 'routing' section"
    fi
else
    print_fail "Configuration file .workflow-config.yaml not found"
fi

print_header "Test Group 7: Script Permissions"

if [ -x ".github/scripts/change-type-detector.sh" ]; then
    print_pass "Change-type detector is executable"
else
    print_fail "Change-type detector is not executable"
fi

print_header "Test Group 8: Cache Functionality"

# Test cache creation
if ./.github/scripts/change-type-detector.sh HEAD~1 >/dev/null 2>&1; then
    if [ -f ".github/cache/change_type.cache" ]; then
        print_pass "Change type cache created"
        
        # Check cache content
        if grep -q "CHANGE_TYPE=" .github/cache/change_type.cache; then
            print_pass "Cache contains CHANGE_TYPE"
        else
            print_fail "Cache missing CHANGE_TYPE"
        fi
        
        if grep -q "CHANGE_STEPS=" .github/cache/change_type.cache; then
            print_pass "Cache contains CHANGE_STEPS"
        else
            print_fail "Cache missing CHANGE_STEPS"
        fi
        
        if grep -q "TEST_STRATEGY=" .github/cache/change_type.cache; then
            print_pass "Cache contains TEST_STRATEGY"
        else
            print_fail "Cache missing TEST_STRATEGY"
        fi
    else
        print_fail "Change type cache not created"
    fi
else
    print_fail "Change-type detector failed to run"
fi

print_header "Test Summary"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
if [ "$TOTAL_TESTS" -gt 0 ]; then
    PASS_RATE=$(( TESTS_PASSED * 100 / TOTAL_TESTS ))
else
    PASS_RATE=0
fi

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
