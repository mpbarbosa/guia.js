#!/bin/bash

# Cross-Reference Validation Script
# Validates internal links in documentation files

set -e

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
