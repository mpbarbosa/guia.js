#!/bin/bash
# Check version consistency across all files

set -e

echo "🔍 Checking version consistency..."
echo

# Get version from package.json
PACKAGE_VERSION=$(node -p "require('./package.json').version")
echo "📦 Package version: $PACKAGE_VERSION"
echo

# Files to check
declare -A FILES=(
    ["src/app.js"]="version $PACKAGE_VERSION"
    ["src/index.html"]="$PACKAGE_VERSION"
    ["README.md"]="$PACKAGE_VERSION"
    ["docs/INDEX.md"]="$PACKAGE_VERSION"
    [".github/CONTRIBUTING.md"]="$PACKAGE_VERSION"
    [".github/copilot-instructions.md"]="$PACKAGE_VERSION"
)

errors=0

for file in "${!FILES[@]}"; do
    pattern="${FILES[$file]}"
    
    if [ -f "$file" ]; then
        if grep -q "$pattern" "$file"; then
            echo "✅ $file"
        else
            echo "❌ $file (missing: $pattern)"
            errors=$((errors + 1))
        fi
    else
        echo "⚠️  $file (file not found)"
    fi
done

echo
echo "📊 Results:"
echo "  Checked: ${#FILES[@]} files"
echo "  Errors: $errors"

if [ $errors -eq 0 ]; then
    echo "✅ All versions consistent"
    exit 0
else
    echo "❌ Version inconsistencies found"
    echo "💡 Run: npm run update-version"
    exit 1
fi
