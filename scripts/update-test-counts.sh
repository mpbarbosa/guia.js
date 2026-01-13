#!/bin/bash
# Update test counts in documentation after running tests

set -e

echo "📊 Updating test counts..."
echo

# Run tests with JSON output
echo "Running tests..."
npm test -- --json --outputFile=test-results.json --silent || true

if [ ! -f test-results.json ]; then
    echo "❌ No test results found"
    exit 1
fi

# Parse results
PASSING=$(node -p "require('./test-results.json').numPassedTests || 0")
TOTAL=$(node -p "require('./test-results.json').numTotalTests || 0")
FAILED=$(node -p "require('./test-results.json').numFailedTests || 0")
SKIPPED=$((TOTAL - PASSING - FAILED))

echo "Test Results:"
echo "  Passing: $PASSING"
echo "  Failed: $FAILED"
echo "  Skipped: $SKIPPED"
echo "  Total: $TOTAL"
echo

# Update files
echo "Updating documentation..."

# README.md
sed -i.bak "s/[0-9,]* passing/$PASSING passing/g" README.md
sed -i "s/[0-9,]* skipped/$SKIPPED skipped/g" README.md
sed -i "s/[0-9,]* total/$TOTAL total/g" README.md

# .github/copilot-instructions.md
sed -i.bak "s/[0-9,]* passing/$PASSING passing/g" .github/copilot-instructions.md
sed -i "s/[0-9,]* total/$TOTAL total/g" .github/copilot-instructions.md

# docs/INDEX.md
sed -i.bak "s/[0-9,]* passing/$PASSING passing/g" docs/INDEX.md
sed -i "s/[0-9,]* total/$TOTAL total/g" docs/INDEX.md

# Clean up backups
rm -f README.md.bak .github/copilot-instructions.md.bak docs/INDEX.md.bak

echo "✅ Test counts updated"
echo
echo "Changed files:"
git diff --name-only README.md .github/copilot-instructions.md docs/INDEX.md

# Clean up test results
rm -f test-results.json

exit 0
