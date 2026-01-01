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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Run this script from the project root.${NC}"
    exit 1
fi

echo "Step 1: Detecting changed files"
echo "--------------------------------"
CHANGED_FILES=$(git diff --name-only HEAD)
if [ -z "$CHANGED_FILES" ]; then
    CHANGED_FILES=$(git diff --name-only HEAD~1)
fi

if [ -z "$CHANGED_FILES" ]; then
    print_info "No changes detected. Checking all files anyway."
    CHANGED_FILES="src/guia.js src/guia_ibge.js"
else
    echo "Changed files:"
    echo "$CHANGED_FILES"
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

# Step 2: Validate JavaScript
if [ "$JS_CHANGED" = true ] || [ "$SRC_CHANGED" = true ]; then
    echo "Step 2: Validating JavaScript syntax"
    echo "-------------------------------------"
    if npm run validate; then
        print_status 0 "JavaScript syntax validation"
    else
        print_status 1 "JavaScript syntax validation"
    fi
    echo ""
fi

# Step 3: Run tests
if [ "$JS_CHANGED" = true ] || [ "$TEST_CHANGED" = true ]; then
    echo "Step 3: Running tests"
    echo "---------------------"
    print_info "Running full test suite..."
    if npm test; then
        print_status 0 "All tests"
    else
        print_status 1 "All tests"
    fi
    echo ""
    
    echo "Step 4: Generating coverage report"
    echo "-----------------------------------"
    if npm run test:coverage; then
        print_status 0 "Coverage generation"
    else
        print_status 1 "Coverage generation"
    fi
    echo ""
fi

# Step 4: Check test documentation updates
if [ "$TEST_CHANGED" = true ]; then
    echo "Step 5: Checking test documentation"
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
    echo "Step 6: Validating documentation"
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
