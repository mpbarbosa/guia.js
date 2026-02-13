#!/bin/bash
# Version Reference Update Script
# Updates all version references to the current version from package.json
# Usage: ./.github/scripts/update-version-references.sh [--dry-run]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line arguments
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}Running in DRY-RUN mode. No files will be modified.${NC}\n"
fi

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
if [ -z "$CURRENT_VERSION" ]; then
    echo -e "${RED}❌ Failed to read version from package.json${NC}"
    exit 1
fi

echo -e "${BLUE}Current version: ${GREEN}${CURRENT_VERSION}${NC}\n"

# Define patterns to update
declare -A VERSION_PATTERNS=(
    ["0.9.0-alpha"]="$CURRENT_VERSION"
    ["0.9.0-alpha"]="$CURRENT_VERSION"
    ["0.9.0-alpha"]="$CURRENT_VERSION"
    ["0.9.0-alpha"]="$CURRENT_VERSION"
    ["0.9.0-alpha"]="$CURRENT_VERSION"
    ["0.9.0-alpha"]="$CURRENT_VERSION"
    ["0.9.0-alpha"]="$CURRENT_VERSION"
    ["0.9.0-alpha"]="$CURRENT_VERSION"
    ["0.9.0-alpha"]="$CURRENT_VERSION"
    ["0.9.0-alpha"]="$CURRENT_VERSION"
    ["0.9.0-alpha"]="$CURRENT_VERSION"
    ["0.9.0-alpha"]="$CURRENT_VERSION"
    ["0.9.0-alpha"]="$CURRENT_VERSION"
    ["v0.9.0"]="v${CURRENT_VERSION%-alpha}"
    ["v0.9.0"]="v${CURRENT_VERSION%-alpha}"
    ["v0.9.0"]="v${CURRENT_VERSION%-alpha}"
    ["v0.9.0"]="v${CURRENT_VERSION%-alpha}"
    ["v0.9.0"]="v${CURRENT_VERSION%-alpha}"
    ["v0.9.0"]="v${CURRENT_VERSION%-alpha}"
    ["v0.9.0"]="v${CURRENT_VERSION%-alpha}"
    ["v0.9.0"]="v${CURRENT_VERSION%-alpha}"
    ["v0.9.0"]="v${CURRENT_VERSION%-alpha}"
    ["v0.9.0"]="v${CURRENT_VERSION%-alpha}"
    ["v0.9.0"]="v${CURRENT_VERSION%-alpha}"
    ["v0.9.0"]="v${CURRENT_VERSION%-alpha}"
    ["v0.9.0"]="v${CURRENT_VERSION%-alpha}"
)

# Define directories to search (exclude node_modules, .git, dist, coverage)
SEARCH_DIRS=(
    "docs"
    "src"
    "__tests__"
    "examples"
    ".github"
    "scripts"
)

# File types to update
FILE_PATTERNS=(
    "*.md"
    "*.js"
    "*.html"
    "*.css"
    "*.json"
    "*.txt"
    "*.sh"
)

# Track statistics
TOTAL_FILES_SCANNED=0
TOTAL_FILES_UPDATED=0
TOTAL_REPLACEMENTS=0

# Function to update version in a file
update_file() {
    local file="$1"
    local updated=false
    local replacements=0
    
    TOTAL_FILES_SCANNED=$((TOTAL_FILES_SCANNED + 1))
    
    # Check if file contains any old version patterns
    for old_pattern in "${!VERSION_PATTERNS[@]}"; do
        if grep -q "$old_pattern" "$file" 2>/dev/null; then
            new_version="${VERSION_PATTERNS[$old_pattern]}"
            
            if [ "$DRY_RUN" = true ]; then
                count=$(grep -o "$old_pattern" "$file" | wc -l)
                if [ "$count" -gt 0 ]; then
                    echo -e "  ${YELLOW}Would replace${NC} ${old_pattern} → ${GREEN}${new_version}${NC} (${count} occurrences) in ${file}"
                    replacements=$((replacements + count))
                    updated=true
                fi
            else
                # Perform actual replacement
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    # macOS sed
                    sed -i '' "s/${old_pattern}/${new_version}/g" "$file"
                else
                    # Linux sed
                    sed -i "s/${old_pattern}/${new_version}/g" "$file"
                fi
                count=$(grep -o "$old_pattern" "$file" 2>/dev/null | wc -l || echo "0")
                if [ "$count" -eq 0 ]; then
                    replacements=$((replacements + 1))
                    updated=true
                fi
            fi
        fi
    done
    
    if [ "$updated" = true ]; then
        TOTAL_FILES_UPDATED=$((TOTAL_FILES_UPDATED + 1))
        TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + replacements))
        
        if [ "$DRY_RUN" = false ]; then
            echo -e "${GREEN}✓${NC} Updated: $file"
        fi
    fi
}

# Main update loop
echo -e "${BLUE}Scanning files for version references...${NC}\n"

for dir in "${SEARCH_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${BLUE}Searching in ${dir}/${NC}"
        
        for pattern in "${FILE_PATTERNS[@]}"; do
            while IFS= read -r -d '' file; do
                # Skip backup files
                if [[ "$file" == *.bak ]] || [[ "$file" == *.backup ]]; then
                    continue
                fi
                
                update_file "$file"
            done < <(find "$dir" -type f -name "$pattern" -print0 2>/dev/null)
        done
    fi
done

# Update root-level markdown files
echo -e "\n${BLUE}Checking root-level files...${NC}"
for file in README.md CHANGELOG.md CONTRIBUTING.md; do
    if [ -f "$file" ]; then
        update_file "$file"
    fi
done

# Summary report
echo -e "\n${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                 UPDATE SUMMARY                     ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "Files scanned:     ${TOTAL_FILES_SCANNED}"
echo -e "Files updated:     ${GREEN}${TOTAL_FILES_UPDATED}${NC}"
echo -e "Total replacements: ${GREEN}${TOTAL_REPLACEMENTS}${NC}"

if [ "$DRY_RUN" = true ]; then
    echo -e "\n${YELLOW}This was a DRY-RUN. No files were modified.${NC}"
    echo -e "${YELLOW}Run without --dry-run to apply changes.${NC}"
else
    echo -e "\n${GREEN}✓ Version references updated successfully!${NC}"
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo -e "  1. Review changes: ${BLUE}git diff${NC}"
    echo -e "  2. Run tests: ${BLUE}npm run test:all${NC}"
    echo -e "  3. Commit: ${BLUE}git add -A && git commit -m 'chore: update version references to ${CURRENT_VERSION}'${NC}"
fi

exit 0
