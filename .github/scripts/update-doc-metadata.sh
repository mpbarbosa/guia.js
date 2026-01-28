#!/bin/bash

# Documentation Metadata Updater
# Adds or updates "Last Updated" metadata in documentation files
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

# Current date in ISO format
CURRENT_DATE=$(date +%Y-%m-%d)

# Usage information
usage() {
    cat << EOF
${BLUE}Documentation Metadata Updater${NC}

${CYAN}Usage:${NC}
  $0 [OPTIONS] FILE...

${CYAN}Options:${NC}
  -h, --help           Show this help message
  -d, --date DATE      Use specific date (format: YYYY-MM-DD)
  -a, --all            Update all markdown files in docs/
  -r, --recursive      Process directories recursively
  -v, --verbose        Show detailed output
  -n, --dry-run        Show what would be changed without modifying files

${CYAN}Examples:${NC}
  # Update single file
  $0 docs/TESTING.md

  # Update multiple files
  $0 docs/TESTING.md docs/ARCHITECTURE.md

  # Update all docs recursively
  $0 --all --recursive

  # Dry run to see changes
  $0 --dry-run --all

  # Use specific date
  $0 --date 2026-01-15 docs/TESTING.md

${CYAN}Metadata Format:${NC}
  The script adds or updates metadata at the top of markdown files:
  
  ---
  Last Updated: YYYY-MM-DD
  Status: Active | Deprecated | Draft
  Version: X.X.X
  ---

${CYAN}Note:${NC}
  - Preserves existing title and navigation sections
  - Only updates "Last Updated" field if metadata block exists
  - Creates new metadata block if none exists
  - Skips files without write permission

EOF
}

# Variables
DATE="$CURRENT_DATE"
DRY_RUN=false
VERBOSE=false
RECURSIVE=false
UPDATE_ALL=false
FILES_TO_UPDATE=()
UPDATED_COUNT=0
SKIPPED_COUNT=0
ERROR_COUNT=0

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -d|--date)
            DATE="$2"
            shift 2
            ;;
        -a|--all)
            UPDATE_ALL=true
            shift
            ;;
        -r|--recursive)
            RECURSIVE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -n|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -*)
            echo -e "${RED}Error: Unknown option $1${NC}"
            usage
            exit 1
            ;;
        *)
            FILES_TO_UPDATE+=("$1")
            shift
            ;;
    esac
done

# Validate date format
if ! [[ "$DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    echo -e "${RED}Error: Invalid date format. Use YYYY-MM-DD${NC}"
    exit 1
fi

# Function to check if file has metadata block
has_metadata() {
    local file="$1"
    grep -q "^Last Updated:" "$file" 2>/dev/null
}

# Function to update metadata in file
update_metadata() {
    local file="$1"
    
    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠️  File not found: $file${NC}"
        ((SKIPPED_COUNT++))
        return
    fi
    
    if [ ! -w "$file" ]; then
        echo -e "${YELLOW}⚠️  No write permission: $file${NC}"
        ((SKIPPED_COUNT++))
        return
    fi
    
    # Check if file already has metadata
    if has_metadata "$file"; then
        # Update existing metadata
        if [ "$DRY_RUN" = true ]; then
            echo -e "${CYAN}[DRY RUN]${NC} Would update: $file"
        else
            # Update Last Updated line
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS sed
                sed -i '' "s/^Last Updated:.*$/Last Updated: $DATE/" "$file"
            else
                # Linux sed
                sed -i "s/^Last Updated:.*$/Last Updated: $DATE/" "$file"
            fi
            echo -e "${GREEN}✅${NC} Updated: $file"
        fi
        ((UPDATED_COUNT++))
    else
        # Add new metadata block
        if [ "$DRY_RUN" = true ]; then
            echo -e "${CYAN}[DRY RUN]${NC} Would add metadata to: $file"
        else
            # Read first line to preserve title
            first_line=$(head -n 1 "$file")
            
            # Create temporary file with metadata
            {
                echo "$first_line"
                echo ""
                echo "---"
                echo "Last Updated: $DATE"
                echo "Status: Active"
                echo "---"
                echo ""
                tail -n +2 "$file"
            } > "${file}.tmp"
            
            mv "${file}.tmp" "$file"
            echo -e "${GREEN}✅${NC} Added metadata to: $file"
        fi
        ((UPDATED_COUNT++))
    fi
    
    if [ "$VERBOSE" = true ]; then
        echo "    Date: $DATE"
    fi
}

# Main execution
echo -e "${BLUE}Documentation Metadata Updater${NC}"
echo "Date: $DATE"
if [ "$DRY_RUN" = true ]; then
    echo -e "${CYAN}Mode: DRY RUN (no changes will be made)${NC}"
fi
echo ""

# Build file list
if [ "$UPDATE_ALL" = true ]; then
    echo "Finding markdown files in docs/..."
    
    if [ "$RECURSIVE" = true ]; then
        while IFS= read -r file; do
            FILES_TO_UPDATE+=("$file")
        done < <(find docs -name "*.md" -type f 2>/dev/null)
    else
        while IFS= read -r file; do
            FILES_TO_UPDATE+=("$file")
        done < <(find docs -maxdepth 1 -name "*.md" -type f 2>/dev/null)
    fi
    
    echo "Found ${#FILES_TO_UPDATE[@]} files"
    echo ""
fi

# Check if we have files to process
if [ ${#FILES_TO_UPDATE[@]} -eq 0 ]; then
    echo -e "${YELLOW}No files specified. Use --all to update all docs or provide file paths.${NC}"
    echo "Run with --help for usage information."
    exit 1
fi

# Process files
for file in "${FILES_TO_UPDATE[@]}"; do
    update_metadata "$file"
done

# Summary
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "  Updated: $UPDATED_COUNT"
echo "  Skipped: $SKIPPED_COUNT"
echo "  Errors: $ERROR_COUNT"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${CYAN}This was a dry run. No files were modified.${NC}"
    echo "Remove --dry-run flag to apply changes."
else
    echo -e "${GREEN}✅ Metadata update complete!${NC}"
fi
