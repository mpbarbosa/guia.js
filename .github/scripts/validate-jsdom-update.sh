#!/bin/bash
# validate-jsdom-update.sh
# Phase 2: jsdom Update Validation Script

set -e  # Exit on error

echo "========================================="
echo "Phase 2: jsdom Update Validation"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Current version check
echo "Step 1: Checking current jsdom version"
echo "---------------------------------------"
npm list jsdom --depth=0
echo ""

# Step 2: Backup current state
echo "Step 2: Creating backup"
echo "------------------------"
git stash push -m "Pre-jsdom-update backup"
echo -e "${GREEN}✓${NC} Backup created"
echo ""

# Step 3: Update jsdom
echo "Step 3: Updating jsdom to 27.4.0"
echo "----------------------------------"
npm install jsdom@27.4.0 --save-dev
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} jsdom updated successfully"
else
    echo -e "${RED}✗${NC} jsdom update failed"
    git stash pop
    exit 1
fi
echo ""

# Step 4: Syntax validation
echo "Step 4: Running syntax validation"
echo "----------------------------------"
if npm run validate; then
    echo -e "${GREEN}✓${NC} Syntax validation passed"
else
    echo -e "${RED}✗${NC} Syntax validation failed"
    echo "Rolling back..."
    npm install jsdom@25.0.1 --save-dev
    git stash pop
    exit 1
fi
echo ""

# Step 5: Run full test suite
echo "Step 5: Running full test suite"
echo "--------------------------------"
if npm run test:all; then
    echo -e "${GREEN}✓${NC} All tests passed"
else
    echo -e "${RED}✗${NC} Tests failed"
    echo "Rolling back..."
    npm install jsdom@25.0.1 --save-dev
    git stash pop
    exit 1
fi
echo ""

# Step 6: Check coverage
echo "Step 6: Checking test coverage"
echo "-------------------------------"
if npm run test:coverage; then
    echo -e "${GREEN}✓${NC} Coverage check passed"
else
    echo -e "${YELLOW}⚠${NC} Coverage check had warnings (may be acceptable)"
fi
echo ""

# Step 7: Manual validation prompt
echo "Step 7: Manual validation required"
echo "-----------------------------------"
echo ""
echo -e "${YELLOW}Please perform manual validation:${NC}"
echo "  1. Start web server: ${GREEN}python3 -m http.server 9000${NC}"
echo "  2. Open: ${GREEN}http://localhost:9000/src/index.html${NC}"
echo "  3. Test geolocation features:"
echo "     - Click 'Obter Localização'"
echo "     - Verify coordinates display"
echo "     - Check address formatting"
echo "     - Test restaurant search"
echo "  4. Check browser console for errors"
echo "  5. Verify DOM manipulation works correctly"
echo ""
echo -e "${YELLOW}Did all manual tests pass? (y/n):${NC} "
read -r response

if [[ "$response" != "y" ]]; then
    echo ""
    echo -e "${RED}Manual validation failed. Rolling back...${NC}"
    npm install jsdom@25.0.1 --save-dev
    git stash pop
    exit 1
fi

echo ""
echo "========================================="
echo -e "${GREEN}✓ Phase 2 Validation Complete!${NC}"
echo "========================================="
echo ""
echo "Summary:"
echo "  - jsdom updated: 25.0.1 → 27.4.0"
echo "  - All automated tests passed"
echo "  - Manual validation confirmed"
echo ""
echo "Next steps:"
echo "  1. Review changes: ${GREEN}git diff package.json package-lock.json${NC}"
echo "  2. Commit: ${GREEN}git commit -am 'chore(deps): update jsdom to 27.4.0'${NC}"
echo "  3. Push and monitor CI"
echo ""

