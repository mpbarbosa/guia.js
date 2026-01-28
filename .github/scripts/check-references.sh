#!/bin/bash

# Enhanced Reference Checker with False Positive Filtering
# Checks for broken file references while excluding known false positive patterns
# Version: 1.1.0
# Date: 2026-01-28

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/reference-checker.config"

# Counters
TOTAL_REFERENCES=0
VALID_REFERENCES=0
EXCLUDED_PATTERNS=0
BROKEN_REFERENCES=0

# Arrays for results
declare -a BROKEN_REFS
declare -a EXCLUDED_REFS

# Load configuration
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
    echo -e "${BLUE}📋 Loaded configuration from $CONFIG_FILE${NC}"
else
    echo -e "${YELLOW}⚠️  Configuration file not found: $CONFIG_FILE${NC}"
    echo -e "${YELLOW}   Using default patterns${NC}"
fi

echo ""
echo "=========================================="
echo "Enhanced Reference Checker"
echo "=========================================="
echo ""

# Function to check if pattern should be excluded
should_exclude() {
    local line="$1"
    local pattern="$2"
    
    # Check if we're in a code block
    if echo "$line" | grep -qE '```'; then
        return 0  # Exclude
    fi
    
    # Check regex patterns
    if echo "$pattern" | grep -qE '\/.*\/g|\/.*\/gi|\/.*\/gm'; then
        return 0  # Exclude
    fi
    
    # Check if line contains .replace(/ or .match(/ or .test(/
    if echo "$line" | grep -qE '\.replace\(\/|\.match\(\/|\.test\(\/'; then
        return 0  # Exclude
    fi
    
    # Check code comment placeholders
    if echo "$pattern" | grep -qE '\/\* ?\.\.\. ?\*\/|\/\/ ?\.\.\.'; then
        return 0  # Exclude
    fi
    
    # Check path descriptions
    if echo "$line" | grep -qE '\/[a-z]+ (for|in|contains) '; then
        return 0  # Exclude
    fi
    
    # Check JSDoc patterns
    if echo "$pattern" | grep -qE '\/@(param|returns|throws|type)|\/throw new|\/function|\/const |\/let |\/async function'; then
        return 0  # Exclude
    fi
    
    # Check URL patterns
    if echo "$pattern" | grep -qE '^https?://|^ftp://|^file://'; then
        return 0  # Exclude
    fi
    
    # Check special patterns
    if echo "$pattern" | grep -qE '^#|^mailto:|^tel:'; then
        return 0  # Exclude
    fi
    
    return 1  # Don't exclude
}

# Function to extract potential file references
extract_references() {
    local file="$1"
    local in_code_block=false
    local line_num=0
    
    while IFS= read -r line; do
        ((line_num++))
        
        # Track code block state
        if echo "$line" | grep -q '^```'; then
            if [ "$in_code_block" = true ]; then
                in_code_block=false
            else
                in_code_block=true
            fi
            continue
        fi
        
        # Skip lines in code blocks
        if [ "$in_code_block" = true ]; then
            continue
        fi
        
        # Extract potential file paths
        # Match: /path/to/file or ./path/to/file or ../path/to/file
        refs=$(echo "$line" | grep -oE '(\./|\.\.\/|/)[a-zA-Z0-9_/-]+\.(md|js|json|txt|html|css|sh|py)' || true)
        
        if [ -n "$refs" ]; then
            while IFS= read -r ref; do
                [ -z "$ref" ] && continue
                
                ((TOTAL_REFERENCES++))
                
                # Check if should be excluded
                if should_exclude "$line" "$ref"; then
                    ((EXCLUDED_PATTERNS++))
                    EXCLUDED_REFS+=("$file:$line_num: $ref (excluded pattern)")
                    continue
                fi
                
                # Resolve path relative to file location
                dir=$(dirname "$file")
                if [[ "$ref" == /* ]]; then
                    # Absolute path from repo root
                    target=".$ref"
                else
                    # Relative path
                    target="$dir/$ref"
                fi
                
                # Normalize path
                target=$(realpath -m "$target" 2>/dev/null || echo "$target")
                
                # Check if target exists
                if [ -f "$target" ] || [ -d "$target" ]; then
                    ((VALID_REFERENCES++))
                else
                    ((BROKEN_REFERENCES++))
                    BROKEN_REFS+=("$file:$line_num: $ref → $target (NOT FOUND)")
                fi
            done <<< "$refs"
        fi
    done < "$file"
}

# Find all files to scan
echo -e "${CYAN}🔍 Scanning for potential file references...${NC}"
echo ""

MD_FILES=$(find . -name "*.md" \
    -not -path "./node_modules/*" \
    -not -path "./.git/*" \
    -not -path "./venv/*" \
    -not -path "./.ai_workflow/*" \
    -not -path "./coverage/*" \
    2>/dev/null)

FILE_COUNT=$(echo "$MD_FILES" | wc -l)
echo "Found $FILE_COUNT markdown files to scan"
echo ""

# Process each file
PROCESSED=0
while IFS= read -r file; do
    [ ! -f "$file" ] && continue
    ((PROCESSED++))
    
    # Show progress every 10 files
    if [ $((PROCESSED % 10)) -eq 0 ]; then
        echo -e "${BLUE}Processing: $PROCESSED/$FILE_COUNT files...${NC}"
    fi
    
    extract_references "$file"
done <<< "$MD_FILES"

echo ""
echo "=========================================="
echo "Results Summary"
echo "=========================================="
echo ""
echo "Files scanned: $FILE_COUNT"
echo "Total references found: $TOTAL_REFERENCES"
echo -e "${GREEN}Valid references: $VALID_REFERENCES${NC}"
echo -e "${YELLOW}Excluded patterns: $EXCLUDED_PATTERNS${NC}"
echo -e "${RED}Broken references: $BROKEN_REFERENCES${NC}"
echo ""

# Show excluded patterns (first 10)
if [ ${#EXCLUDED_REFS[@]} -gt 0 ]; then
    echo -e "${YELLOW}Excluded Patterns (False Positives):${NC}"
    for i in "${!EXCLUDED_REFS[@]}"; do
        if [ $i -lt 10 ]; then
            echo "  ${EXCLUDED_REFS[$i]}"
        fi
    done
    
    if [ ${#EXCLUDED_REFS[@]} -gt 10 ]; then
        echo "  ... and $((${#EXCLUDED_REFS[@]} - 10)) more"
    fi
    echo ""
fi

# Show broken references (all)
if [ ${#BROKEN_REFS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Broken References Found:${NC}"
    for ref in "${BROKEN_REFS[@]}"; do
        echo -e "  ${RED}✗${NC} $ref"
    done
    echo ""
    echo -e "${RED}⚠️  Found $BROKEN_REFERENCES broken reference(s)${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All file references valid!${NC}"
    echo ""
    if [ $EXCLUDED_PATTERNS -gt 0 ]; then
        echo -e "${BLUE}ℹ️  Note: $EXCLUDED_PATTERNS pattern(s) excluded as false positives${NC}"
    fi
    exit 0
fi
