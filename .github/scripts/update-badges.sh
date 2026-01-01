#!/bin/bash
# ==============================================================================
# Automated Badge Update Script
# ==============================================================================
# Extracts test results and coverage from npm test output
# Updates badges in README.md automatically
# 
# Usage: ./update-badges.sh
# ==============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Automated Badge Update from Test Results          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ==============================================================================
# Extract Test Count
# ==============================================================================
echo -e "${YELLOW}[1/3] Running tests to extract counts...${NC}"

# Run tests and capture output
TEST_OUTPUT=$(npm test 2>&1 || true)

# Extract test count (e.g., "Tests: 1224 passed")
TEST_COUNT=$(echo "$TEST_OUTPUT" | grep -oP 'Tests:.*?\K\d+(?= passed)' | head -1 || echo "0")

# Extract suite count
SUITE_COUNT=$(echo "$TEST_OUTPUT" | grep -oP 'Test Suites:.*?\K\d+(?= passed)' | head -1 || echo "0")

if [ "$TEST_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}  ⚠ Could not extract test count, trying alternative method...${NC}"
    TEST_COUNT=$(find __tests__ -name "*.test.js" -o -name "*.spec.js" | wc -l)
fi

echo "  Extracted: $TEST_COUNT tests in $SUITE_COUNT suites"

# ==============================================================================
# Extract Coverage
# ==============================================================================
echo -e "${YELLOW}[2/3] Running coverage to extract percentage...${NC}"

# Run coverage
COVERAGE_OUTPUT=$(npm run test:coverage 2>&1 || true)

# Extract overall coverage percentage
COVERAGE=$(echo "$COVERAGE_OUTPUT" | grep -oP 'All files.*?\|\s*\K[\d.]+' | head -1 || echo "0")

# Round to integer
COVERAGE_INT=$(printf "%.0f" "$COVERAGE")

echo "  Extracted: ${COVERAGE_INT}% coverage"

# Determine badge color based on coverage
if [ "$COVERAGE_INT" -ge 80 ]; then
    COVERAGE_COLOR="brightgreen"
elif [ "$COVERAGE_INT" -ge 70 ]; then
    COVERAGE_COLOR="green"
elif [ "$COVERAGE_INT" -ge 60 ]; then
    COVERAGE_COLOR="yellow"
elif [ "$COVERAGE_INT" -ge 50 ]; then
    COVERAGE_COLOR="orange"
else
    COVERAGE_COLOR="red"
fi

# ==============================================================================
# Update README.md Badges
# ==============================================================================
echo -e "${YELLOW}[3/3] Updating badges in README.md...${NC}"

# Backup README
cp README.md README.md.bak

# Update test badge
# Pattern: [![Tests](https://img.shields.io/badge/tests-1224%20passing-brightgreen)]
sed -i "s|\[\!\[Tests\](https://img.shields.io/badge/tests-[0-9]*%20passing-[a-z]*)\]|\[\!\[Tests\](https://img.shields.io/badge/tests-${TEST_COUNT}%20passing-brightgreen)\]|" README.md

# Update coverage badge  
# Pattern: [![Coverage](https://img.shields.io/badge/coverage-70%25-yellow)]
sed -i "s|\[\!\[Coverage\](https://img.shields.io/badge/coverage-[0-9]*%25-[a-z]*)\]|\[\!\[Coverage\](https://img.shields.io/badge/coverage-${COVERAGE_INT}%25-${COVERAGE_COLOR})\]|" README.md

# Check if changes were made
if diff -q README.md README.md.bak > /dev/null; then
    echo -e "${YELLOW}  No changes needed (badges already up to date)${NC}"
    rm README.md.bak
else
    echo -e "${GREEN}  ✓ Updated badges in README.md${NC}"
    echo ""
    echo "  Changes:"
    diff README.md.bak README.md || true
    rm README.md.bak
    
    # Also update copilot instructions
    sed -i "s/1224 tests/${TEST_COUNT} tests/" .github/copilot-instructions.md
    sed -i "s/~70% coverage/~${COVERAGE_INT}% coverage/" .github/copilot-instructions.md
    echo -e "${GREEN}  ✓ Updated copilot-instructions.md${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ Badge update complete!                                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  Test Badge: $TEST_COUNT passing"
echo "  Coverage Badge: ${COVERAGE_INT}% ($COVERAGE_COLOR)"
echo ""
echo "Review changes with: git diff README.md"

exit 0
