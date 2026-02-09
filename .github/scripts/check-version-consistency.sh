#!/bin/bash
# ==============================================================================
# Version Consistency Checker for Guia.js
# ==============================================================================
# This script verifies that version numbers are consistent across all
# documentation and configuration files in the repository.
#
# Exit Codes:
#   0 - Success: All versions match
#   1 - Error: Version inconsistencies found
#
# Usage:
#   ./check-version-consistency.sh
#   
#   Or as a pre-commit hook:
#   ln -s ../../.github/scripts/check-version-consistency.sh .git/hooks/pre-commit
#
# What it checks:
#   - package.json version
#   - README.md version references
#   - docs/INDEX.md version
#   - src/config/defaults.js GUIA_VERSION
#   - .github/copilot-instructions.md version
#
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Version Consistency Checker for Guia.js            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Track if any inconsistencies found
INCONSISTENCIES=0

# ==============================================================================
# 1. Extract version from package.json (source of truth)
# ==============================================================================

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Run this script from the project root directory"
    exit 1
fi

PACKAGE_VERSION=$(node -p "require('./package.json').version" 2>&1)
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: Failed to read package.json${NC}"
    echo "Details: $PACKAGE_VERSION"
    exit 1
fi

echo -e "${GREEN}📦 Source of Truth (package.json):${NC} v${PACKAGE_VERSION}"
echo ""

# ==============================================================================
# 2. Check README.md
# ==============================================================================

echo -e "${YELLOW}Checking README.md...${NC}"

if [ ! -f "README.md" ]; then
    echo -e "${RED}❌ README.md not found${NC}"
    INCONSISTENCIES=$((INCONSISTENCIES + 1))
else
    # Check main version reference (line 7)
    README_VERSION=$(grep -m 1 "version.*${PACKAGE_VERSION}" README.md || echo "")
    
    if [ -z "$README_VERSION" ]; then
        echo -e "${RED}❌ Version mismatch in README.md${NC}"
        echo "   Expected: $PACKAGE_VERSION"
        echo "   Check line 7 and other version references"
        
        # Show actual version if found
        ACTUAL_VERSION=$(grep -oP 'version \K[0-9]+\.[0-9]+\.[0-9]+-?[a-z]*' README.md | head -1)
        if [ -n "$ACTUAL_VERSION" ]; then
            echo -e "   Found: ${ACTUAL_VERSION}"
        fi
        
        INCONSISTENCIES=$((INCONSISTENCIES + 1))
    else
        echo -e "${GREEN}✅ README.md version matches${NC}"
    fi
fi
echo ""

# ==============================================================================
# 3. Check docs/INDEX.md
# ==============================================================================

echo -e "${YELLOW}Checking docs/INDEX.md...${NC}"

if [ ! -f "docs/INDEX.md" ]; then
    echo -e "${YELLOW}⚠️  docs/INDEX.md not found (may be optional)${NC}"
else
    # Check if version is referenced
    INDEX_VERSION=$(grep -i "version" docs/INDEX.md | grep -o "${PACKAGE_VERSION}" || echo "")
    
    if [ -z "$INDEX_VERSION" ]; then
        # Check if any version number exists
        ANY_VERSION=$(grep -oP 'version.*?\K[0-9]+\.[0-9]+\.[0-9]+-?[a-z]*' docs/INDEX.md | head -1)
        
        if [ -n "$ANY_VERSION" ] && [ "$ANY_VERSION" != "$PACKAGE_VERSION" ]; then
            echo -e "${RED}❌ Version mismatch in docs/INDEX.md${NC}"
            echo "   Expected: $PACKAGE_VERSION"
            echo "   Found: $ANY_VERSION"
            INCONSISTENCIES=$((INCONSISTENCIES + 1))
        else
            echo -e "${GREEN}✅ docs/INDEX.md version matches or not specified${NC}"
        fi
    else
        echo -e "${GREEN}✅ docs/INDEX.md version matches${NC}"
    fi
fi
echo ""

# ==============================================================================
# 4. Check src/config/defaults.js
# ==============================================================================

echo -e "${YELLOW}Checking src/config/defaults.js...${NC}"

if [ ! -f "src/config/defaults.js" ]; then
    echo -e "${RED}❌ src/config/defaults.js not found${NC}"
    INCONSISTENCIES=$((INCONSISTENCIES + 1))
else
    # GUIA_VERSION is an object with major, minor, patch, prerelease
    # Extract each component
    MAJOR=$(grep -oP "major:\s*\K[0-9]+" src/config/defaults.js | head -1)
    MINOR=$(grep -oP "minor:\s*\K[0-9]+" src/config/defaults.js | head -1)
    PATCH=$(grep -oP "patch:\s*\K[0-9]+" src/config/defaults.js | head -1)
    PRERELEASE=$(grep -oP "prerelease:\s*['\"]?\K[a-z]+" src/config/defaults.js | head -1)
    
    if [ -z "$MAJOR" ] || [ -z "$MINOR" ] || [ -z "$PATCH" ]; then
        echo -e "${RED}❌ Could not find GUIA_VERSION components in src/config/defaults.js${NC}"
        INCONSISTENCIES=$((INCONSISTENCIES + 1))
    else
        # Construct version string
        DEFAULTS_VERSION="${MAJOR}.${MINOR}.${PATCH}"
        if [ -n "$PRERELEASE" ]; then
            DEFAULTS_VERSION="${DEFAULTS_VERSION}-${PRERELEASE}"
        fi
        
        if [ "$DEFAULTS_VERSION" != "$PACKAGE_VERSION" ]; then
            echo -e "${RED}❌ Version mismatch in src/config/defaults.js${NC}"
            echo "   Expected: $PACKAGE_VERSION"
            echo "   Found: $DEFAULTS_VERSION"
            INCONSISTENCIES=$((INCONSISTENCIES + 1))
        else
            echo -e "${GREEN}✅ src/config/defaults.js version matches${NC}"
        fi
    fi
fi
echo ""

# ==============================================================================
# 5. Check .github/copilot-instructions.md
# ==============================================================================

echo -e "${YELLOW}Checking .github/copilot-instructions.md...${NC}"

if [ ! -f ".github/copilot-instructions.md" ]; then
    echo -e "${YELLOW}⚠️  .github/copilot-instructions.md not found (may be optional)${NC}"
else
    # Check if version is referenced
    COPILOT_VERSION=$(grep -o "${PACKAGE_VERSION}" .github/copilot-instructions.md | head -1 || echo "")
    
    if [ -z "$COPILOT_VERSION" ]; then
        # Check if any version number exists
        ANY_VERSION=$(grep -oP 'version.*?\K[0-9]+\.[0-9]+\.[0-9]+-?[a-z]*' .github/copilot-instructions.md | head -1)
        
        if [ -n "$ANY_VERSION" ] && [ "$ANY_VERSION" != "$PACKAGE_VERSION" ]; then
            echo -e "${RED}❌ Version mismatch in .github/copilot-instructions.md${NC}"
            echo "   Expected: $PACKAGE_VERSION"
            echo "   Found: $ANY_VERSION"
            INCONSISTENCIES=$((INCONSISTENCIES + 1))
        else
            echo -e "${GREEN}✅ .github/copilot-instructions.md version matches or not specified${NC}"
        fi
    else
        echo -e "${GREEN}✅ .github/copilot-instructions.md version matches${NC}"
    fi
fi
echo ""

# ==============================================================================
# 6. Summary
# ==============================================================================

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Summary                                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ $INCONSISTENCIES -eq 0 ]; then
    echo -e "${GREEN}✅ All version references are consistent!${NC}"
    echo -e "   Version: ${PACKAGE_VERSION}"
    echo ""
    echo "Files checked:"
    echo "  ✅ package.json"
    echo "  ✅ README.md"
    echo "  ✅ docs/INDEX.md"
    echo "  ✅ src/config/defaults.js"
    echo "  ✅ .github/copilot-instructions.md"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Found $INCONSISTENCIES version inconsistency/inconsistencies${NC}"
    echo ""
    echo "To fix:"
    echo "  1. Update package.json with: npm version <new-version>"
    echo "  2. Update src/config/defaults.js GUIA_VERSION constant"
    echo "  3. Update README.md version references"
    echo "  4. Update docs/INDEX.md if applicable"
    echo "  5. Update .github/copilot-instructions.md if applicable"
    echo "  6. Run this script again to verify"
    echo ""
    echo "Example workflow:"
    echo "  ${BLUE}# Bump version${NC}"
    echo "  npm version patch  # or minor, or major"
    echo ""
    echo "  ${BLUE}# Update source code version${NC}"
    echo "  # Edit src/config/defaults.js manually"
    echo "  export const GUIA_VERSION = '0.6.1-alpha';"
    echo ""
    echo "  ${BLUE}# Update documentation${NC}"
    echo "  # Edit README.md line 7"
    echo "  # Edit other documentation as needed"
    echo ""
    echo "  ${BLUE}# Verify consistency${NC}"
    echo "  ./.github/scripts/check-version-consistency.sh"
    echo ""
    exit 1
fi
