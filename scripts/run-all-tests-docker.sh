#!/usr/bin/env bash
# scripts/run-all-tests-docker.sh
#
# Run both unit/integration and E2E test suites inside Docker.
# Unit tests run first; E2E tests run second regardless of unit result.
# Exits with a non-zero code if either suite fails.
#
# Usage:
#   bash scripts/run-all-tests-docker.sh

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "══════════════════════════════════════════"
echo " guia_js Docker Test Suite — Full Run"
echo "══════════════════════════════════════════"

# ─── Unit / Integration tests ───────────────────────────────────────────────
echo ""
echo "▶ Phase 1: Unit / Integration tests"
set +e
bash "${SCRIPT_DIR}/run-tests-docker.sh"
UNIT_EXIT=$?
set -e

# ─── E2E tests ──────────────────────────────────────────────────────────────
echo ""
echo "▶ Phase 2: E2E (Puppeteer) tests"
set +e
bash "${SCRIPT_DIR}/run-e2e-tests-docker.sh"
E2E_EXIT=$?
set -e

# ─── Summary ────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════"
echo " Summary"
echo "══════════════════════════════════════════"

UNIT_STATUS="✅ passed"
[[ $UNIT_EXIT -ne 0 ]] && UNIT_STATUS="❌ FAILED (exit ${UNIT_EXIT})"

E2E_STATUS="✅ passed"
[[ $E2E_EXIT -ne 0 ]] && E2E_STATUS="❌ FAILED (exit ${E2E_EXIT})"

echo " Unit / Integration: ${UNIT_STATUS}"
echo " E2E:                ${E2E_STATUS}"
echo ""

FINAL_EXIT=$(( UNIT_EXIT | E2E_EXIT ))

if [[ $FINAL_EXIT -eq 0 ]]; then
  echo "✅ All Docker tests passed!"
else
  echo "❌ One or more Docker test suites FAILED."
fi

exit $FINAL_EXIT
