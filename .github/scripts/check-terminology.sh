#!/bin/bash

# Terminology Consistency Checker
# Validates documentation against terminology guide standards
# Version: 1.1.0
# Date: 2026-01-28

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Counters
TOTAL_ISSUES=0
CHECKED_FILES=0

echo -e "${BLUE}=========================================="
echo "Terminology Consistency Checker"
echo -e "==========================================${NC}\n"

# Function to check terminology in file
check_file() {
    local file="$1"
    local issues=0
    
    ((CHECKED_FILES++))
    
    # Skip if not a markdown file
    [[ ! "$file" =~ \.md$ ]] && return
    
    # Check for common issues
    
    # 1. Missing accent in município
    if grep -E "municipio[^s]" "$file" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  $file${NC}"
        echo "   Issue: 'municipio' without accent (should be 'município')"
        grep -n "municipio[^s]" "$file" 2>/dev/null | head -3 || true
        ((issues++))
        echo ""
    fi
    
    # 2. Incorrect guia.js capitalization
    if grep "Guia\.js\|GUIA\.js" "$file" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  $file${NC}"
        echo "   Issue: Incorrect guia.js capitalization (should be lowercase 'guia.js')"
        grep -n "Guia\.js\|GUIA\.js" "$file" 2>/dev/null | head -3 || true
        ((issues++))
        echo ""
    fi
    
    # 3. Incorrect ibira.js capitalization
    if grep "Ibira\.js\|IBIRA\.js" "$file" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  $file${NC}"
        echo "   Issue: Incorrect ibira.js capitalization (should be lowercase 'ibira.js')"
        grep -n "Ibira\.js\|IBIRA\.js" "$file" 2>/dev/null | head -3 || true
        ((issues++))
        echo ""
    fi
    
    # 4. Inconsistent E2E usage
    if grep -E "\bend-to-end tests\b" "$file" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  $file${NC}"
        echo "   Issue: Use 'E2E tests' instead of 'end-to-end tests'"
        grep -n "end-to-end tests" "$file" 2>/dev/null | head -3 || true
        ((issues++))
        echo ""
    fi
    
    # 5. Incorrect NPM capitalization
    if grep -E "\bNPM\b|\bNpm\b" "$file" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  $file${NC}"
        echo "   Issue: Use lowercase 'npm' not 'NPM' or 'Npm'"
        grep -nE "\bNPM\b|\bNpm\b" "$file" 2>/dev/null | head -3 || true
        ((issues++))
        echo ""
    fi
    
    # 6. Incorrect Node.js variations
    if grep -E "\bNodeJS\b|\bnode\.js\b|\bNode\.JS\b" "$file" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  $file${NC}"
        echo "   Issue: Use 'Node.js' (capital N, lowercase js)"
        grep -nE "\bNodeJS\b|\bnode\.js\b|\bNode\.JS\b" "$file" 2>/dev/null | head -3 || true
        ((issues++))
        echo ""
    fi
    
    # 7. Incorrect jsdom capitalization
    if grep -E "\bJSDom\b|\bJsdom\b|\bJSDom\b" "$file" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  $file${NC}"
        echo "   Issue: Use lowercase 'jsdom'"
        grep -nE "\bJSDom\b|\bJsdom\b|\bJSDom\b" "$file" 2>/dev/null | head -3 || true
        ((issues++))
        echo ""
    fi
    
    ((TOTAL_ISSUES += issues))
    return $issues
}

# Parse arguments
FILES_TO_CHECK=()
CHECK_ALL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -a|--all)
            CHECK_ALL=true
            shift
            ;;
        -h|--help)
            cat << EOF
${BLUE}Terminology Consistency Checker${NC}

${CYAN}Usage:${NC}
  $0 [OPTIONS] [FILE...]

${CYAN}Options:${NC}
  -a, --all     Check all markdown files in docs/
  -h, --help    Show this help message

${CYAN}Examples:${NC}
  # Check specific file
  $0 docs/TESTING.md

  # Check all documentation
  $0 --all

  # Check multiple files
  $0 docs/TESTING.md docs/ARCHITECTURE.md

${CYAN}Checks Performed:${NC}
  1. Missing accent in 'município'
  2. Incorrect 'guia.js' capitalization
  3. Incorrect 'ibira.js' capitalization
  4. 'end-to-end tests' instead of 'E2E tests'
  5. 'NPM' instead of 'npm'
  6. 'NodeJS' instead of 'Node.js'
  7. 'JSDOM' instead of 'jsdom'

${CYAN}See Also:${NC}
  docs/guides/TERMINOLOGY_GUIDE.md - Full terminology reference

EOF
            exit 0
            ;;
        *)
            FILES_TO_CHECK+=("$1")
            shift
            ;;
    esac
done

# Build file list
if [ "$CHECK_ALL" = true ]; then
    echo "Finding markdown files in docs/..."
    while IFS= read -r file; do
        FILES_TO_CHECK+=("$file")
    done < <(find docs -name "*.md" -type f 2>/dev/null)
    echo "Found ${#FILES_TO_CHECK[@]} files to check"
    echo ""
fi

# Check if we have files
if [ ${#FILES_TO_CHECK[@]} -eq 0 ]; then
    echo -e "${YELLOW}No files specified. Use --all to check all docs or provide file paths.${NC}"
    echo "Run with --help for usage information."
    exit 1
fi

# Process files
echo "Checking terminology consistency..."
echo ""

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        check_file "$file"
    fi
done

# Summary
echo -e "${BLUE}=========================================="
echo "Summary"
echo -e "==========================================${NC}\n"

echo "Files checked: $CHECKED_FILES"
echo "Issues found: $TOTAL_ISSUES"
echo ""

if [ $TOTAL_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All terminology checks passed!${NC}"
    echo ""
    echo "Terminology is consistent across checked files."
    exit 0
else
    echo -e "${YELLOW}⚠️  Found $TOTAL_ISSUES terminology inconsistencies${NC}"
    echo ""
    echo "Please review and fix the issues above."
    echo "See docs/guides/TERMINOLOGY_GUIDE.md for correct usage."
    exit 1
fi
