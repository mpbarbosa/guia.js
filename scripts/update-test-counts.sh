#!/bin/bash
#
# update-test-counts.sh
# ---------------------
# Purpose:      Run the Jest test suite and synchronise passing/skipped/total
#               test counts across project documentation files.
#
# Usage:        ./scripts/update-test-counts.sh
#               npm run update:tests
#
# Arguments:    (none)
#
# Prerequisites:
#   - Must be run from the project root.
#   - Requires Node.js v18+ and npm (used to run tests and parse JSON output).
#
# What it does:
#   1. Runs "npm test -- --json --outputFile=test-results.json --silent".
#   2. Parses numPassedTests / numTotalTests / numFailedTests from JSON output.
#   3. Updates "N passing" / "N skipped" / "N total" strings in:
#        README.md
#        .github/copilot-instructions.md
#        docs/INDEX.md
#   4. Removes the temporary test-results.json file on exit.
#
# Output:       Prints current counts; lists files changed by "git diff --name-only".
#
# Exit codes:
#   0  Test counts updated successfully.
#   1  test-results.json not produced (hard test-runner failure), or set -e error.
#
# Related modules: README.md, .github/copilot-instructions.md, docs/INDEX.md
# See also:        docs/AUTOMATION_IMPLEMENTATION_SUMMARY.md, scripts/README.md

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
