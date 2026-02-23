#!/bin/bash
#
# update-doc-dates.sh
# -------------------
# Purpose:      Keep "Last Updated" metadata current in documentation files
#               by updating dates only in files that git reports as modified.
#
# Usage:        ./scripts/update-doc-dates.sh
#               npm run update:dates
#
# Arguments:    (none)
#
# Prerequisites:
#   - Must be run from the project root (where .git lives).
#   - Requires git (used to detect which .md files have uncommitted changes).
#
# What it does:
#   1. Runs "git diff --name-only --diff-filter=M" to find modified .md files.
#   2. For files containing "**Last Updated**:", replaces the date with today (YYYY-MM-DD).
#   3. For files without that field, appends a footer with the date and Status line.
#   4. Exits cleanly with no changes if no modified markdown files are found.
#
# Output:       Prints each updated filename; final count of files changed.
#
# Exit codes:
#   0  Completed (dates updated, or no modified files found).
#   1  Unexpected error (set -e triggered).
#
# Related modules: docs/ directory
# See also:        docs/AUTOMATION_IMPLEMENTATION_SUMMARY.md, scripts/README.md

set -e

echo "📅 Updating documentation dates..."
echo

# Get today's date
TODAY=$(date -I)
echo "Today's date: $TODAY"
echo

# Get list of modified .md files
MODIFIED=$(git diff --name-only --diff-filter=M | grep '\.md$' || true)

if [ -z "$MODIFIED" ]; then
    echo "No modified markdown files found"
    exit 0
fi

echo "Modified files:"
echo "$MODIFIED"
echo

updated=0

for file in $MODIFIED; do
    # Check if file has "Last Updated" field
    if grep -q "Last Updated" "$file"; then
        # Update existing date
        sed -i.bak "s/\*\*Last Updated\*\*: [0-9-]*/\*\*Last Updated\*\*: $TODAY/" "$file"
        echo "✅ Updated: $file"
        updated=$((updated + 1))
        rm -f "$file.bak"
    else
        # Add footer with date
        {
            echo ""
            echo "---"
            echo ""
            echo "**Last Updated**: $TODAY  "
            echo "**Status**: ✅ Active"
        } >> "$file"
        echo "✅ Added date to: $file"
        updated=$((updated + 1))
    fi
done

echo
echo "📊 Results:"
echo "  Modified files: $(echo "$MODIFIED" | wc -l)"
echo "  Updated dates: $updated"

if [ $updated -gt 0 ]; then
    echo "✅ Documentation dates updated"
    echo "💡 Review changes and commit"
else
    echo "No dates to update"
fi

exit 0
