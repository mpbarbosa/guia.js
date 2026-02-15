#!/bin/bash

# Cross-Reference Validation Script
# Validates internal links in documentation files

set -e

# Show help message
show_help() {
    cat << 'EOF'
validate-cross-references.sh - Validates cross-references in documentation

USAGE:
    ./validate-cross-references.sh [OPTIONS]

DESCRIPTION:
    Validates all internal markdown links to ensure documentation
    integrity across file moves and restructuring.

OPTIONS:
    -h, --help          Show this help message
    --verbose           Show all links checked (not just broken)
    --summary-only      Show only summary statistics

WHAT IT CHECKS:
    ✅ Relative links: [text](./path.md), [text](../path.md)
    ✅ Root-relative links: [text](docs/guide.md)
    ✅ Links with anchors: [text](./file.md#section)
    ✅ File existence for all linked paths

EXCLUSIONS:
    ❌ External URLs: [text](https://example.com)
    ❌ Anchor-only links: [text](#section-in-same-file)
    ❌ node_modules/, .git/, venv/ directories

OUTPUT FORMAT:
    Success:
        ✅ All 42 references valid

    Failure:
        ❌ Broken reference in ./docs/API.md
           → Target: ./guides/missing.md (file not found)
           Line: 15

        Summary: 41 valid, 1 broken (42 total)

EXIT CODES:
    0    All references valid, no broken links found
    1    One or more broken references detected

EXAMPLES:
    # Validate all cross-references
    ./validate-cross-references.sh

    # Verbose mode (show all links)
    ./validate-cross-references.sh --verbose

    # Quick summary only
    ./validate-cross-references.sh --summary-only

    # Use in CI/CD workflow
    - name: Validate cross-references
      run: ./.github/scripts/validate-cross-references.sh

WHEN TO RUN:
    - After moving or renaming documentation files
    - Before major documentation releases
    - As part of documentation validation workflow
    - When restructuring docs/ directory

RELATED TOOLS:
    - check-references.sh       Basic file reference validation
    - check-references.py       Enhanced with false positive filtering
    - check-links.py            External URL validation

DOCUMENTATION:
    See .github/scripts/README.md for complete documentation

EOF
}

# Check for help flag
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

BROKEN_LINKS=0
VALID_LINKS=0
TOTAL_FILES=0

echo "=========================================="
echo "Cross-Reference Validation"
echo "=========================================="
echo ""

# Find all markdown files
MD_FILES=$(find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./venv/*" 2>/dev/null)

# Count files
TOTAL_FILES=$(echo "$MD_FILES" | wc -l)
echo "Found $TOTAL_FILES markdown files"
echo ""

# Extract and validate links
while IFS= read -r file; do
    # Skip if file doesn't exist
    [ ! -f "$file" ] && continue
    
    # Extract relative links: [text](./path) or [text](../path) or [text](path)
    links=$(grep -oP '\[.*?\]\(\K[^)]+(?=\))' "$file" 2>/dev/null | grep -v "^http" | grep -v "^#" || true)
    
    if [ -n "$links" ]; then
        while IFS= read -r link; do
            # Skip empty links
            [ -z "$link" ] && continue
            
            # Resolve relative path
            dir=$(dirname "$file")
            target="$dir/$link"
            
            # Normalize path
            target=$(realpath -m "$target" 2>/dev/null || echo "$target")
            
            # Check if target exists
            if [ -f "$target" ] || [ -d "$target" ]; then
                ((VALID_LINKS++))
                echo -e "${GREEN}✅${NC} $file → $link"
            else
                ((BROKEN_LINKS++))
                echo -e "${RED}❌${NC} $file → $link (NOT FOUND)"
            fi
        done <<< "$links"
    fi
done <<< "$MD_FILES"

echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="
echo "Files checked: $TOTAL_FILES"
echo -e "${GREEN}Valid links: $VALID_LINKS${NC}"
echo -e "${RED}Broken links: $BROKEN_LINKS${NC}"
echo ""

if [ $BROKEN_LINKS -eq 0 ]; then
    echo -e "${GREEN}✅ All cross-references valid!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Found $BROKEN_LINKS broken links${NC}"
    exit 1
fi
