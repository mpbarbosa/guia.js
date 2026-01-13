#!/bin/bash
# Update "Last Updated" dates in modified documentation files

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
        echo "" >> "$file"
        echo "---" >> "$file"
        echo "" >> "$file"
        echo "**Last Updated**: $TODAY  " >> "$file"
        echo "**Status**: ✅ Active" >> "$file"
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
