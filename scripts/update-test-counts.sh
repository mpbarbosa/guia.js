#!/bin/bash
#
# update-test-counts.sh
# ---------------------
# Purpose:      Run the non-E2E Jest suite and refresh the managed README
#               test-status summary without touching unrelated prose.
#
# Usage:        ./scripts/update-test-counts.sh
#               npm run update:tests
#
# Arguments:    (none)
#
# Prerequisites:
#   - Must be run from the project root.
#   - Requires Node.js v20.19.0+ and npm.
#
# What it does:
#   1. Runs "npm run test:unit -- --json --outputFile=test-results.unit.json --silent".
#   2. Parses test and suite totals from JSON output.
#   3. Refuses to rewrite docs when the suite still has failing tests.
#   4. Rewrites the managed "Note on Test Status" line in README.md only.
#   5. Removes the temporary test-results.unit.json file on exit.
#
# Output:       Prints parsed counts and any updated managed files.
#
# Exit codes:
#   0  Managed test summary updated successfully (or no managed summary line was present).
#   1  test-results.unit.json not produced, the suite had failures, or set -e error.
#
# Related modules: README.md, jest.config.unit.js
# See also:        docs/AUTOMATION_IMPLEMENTATION_SUMMARY.md, scripts/README.md

set -euo pipefail

RESULTS_FILE="test-results.unit.json"

cleanup() {
    rm -f "$RESULTS_FILE"
}

trap cleanup EXIT

echo "📊 Updating test counts..."
echo

# Run tests with JSON output
echo "Running non-E2E Jest suite..."
npm run test:unit -- --json --outputFile="$RESULTS_FILE" --silent || true

if [ ! -f "$RESULTS_FILE" ]; then
    echo "❌ No test results found"
    exit 1
fi

# Parse results
PASSING=$(node -p "require('./$RESULTS_FILE').numPassedTests || 0")
TOTAL=$(node -p "require('./$RESULTS_FILE').numTotalTests || 0")
FAILED=$(node -p "require('./$RESULTS_FILE').numFailedTests || 0")
SKIPPED=$((TOTAL - PASSING - FAILED))
PASSING_SUITES=$(node -p "require('./$RESULTS_FILE').numPassedTestSuites || 0")
TOTAL_SUITES=$(node -p "require('./$RESULTS_FILE').numTotalTestSuites || 0")
FAILED_SUITES=$(node -p "require('./$RESULTS_FILE').numFailedTestSuites || 0")
SKIPPED_SUITES=$((TOTAL_SUITES - PASSING_SUITES - FAILED_SUITES))

echo "Test Results:"
echo "  Passing: $PASSING"
echo "  Failed: $FAILED"
echo "  Skipped: $SKIPPED"
echo "  Total: $TOTAL"
echo "  Passing Suites: $PASSING_SUITES"
echo "  Failed Suites: $FAILED_SUITES"
echo "  Skipped Suites: $SKIPPED_SUITES"
echo "  Total Suites: $TOTAL_SUITES"
echo

if [ "$FAILED" -ne 0 ] || [ "$FAILED_SUITES" -ne 0 ]; then
    echo "❌ Test run has failures; refusing to update documentation counts"
    exit 1
fi

SUMMARY_LINE="> **Note on Test Status**: The latest \`npm run test:unit\` run reported ${PASSING} passing tests out of ${TOTAL} total (${SKIPPED} skipped, ${FAILED} failing) across ${PASSING_SUITES} passing suites out of ${TOTAL_SUITES} total (${SKIPPED_SUITES} skipped, ${FAILED_SUITES} failing)."
export SUMMARY_LINE

echo "Updating managed documentation..."
node --input-type=module <<'EOF'
import fs from 'node:fs';

const targets = [
  {
    path: 'README.md',
    pattern: /^> \*\*Note on Test Status\*\*:.*$/m,
    replacement: process.env.SUMMARY_LINE,
  },
];

const updated = [];

for (const target of targets) {
  if (!fs.existsSync(target.path)) continue;

  const original = fs.readFileSync(target.path, 'utf8');
  if (!target.pattern.test(original)) continue;

  const next = original.replace(target.pattern, target.replacement);
  if (next !== original) {
    fs.writeFileSync(target.path, next);
    updated.push(target.path);
  }
}

if (updated.length === 0) {
  console.log('ℹ️ No managed test-summary lines found');
} else {
  console.log('✅ Updated managed files:');
  for (const file of updated) {
    console.log(`  - ${file}`);
  }
}
EOF

echo "✅ Test counts updated"
echo
echo "Changed files:"
git diff --name-only README.md

exit 0
