#!/usr/bin/env bash
# scripts/run-e2e-tests-docker.sh
#
# Build the E2E (Puppeteer) test Docker image and run the test suite.
#
# Usage:
#   bash scripts/run-e2e-tests-docker.sh              # run all E2E tests
#   bash scripts/run-e2e-tests-docker.sh -- --testPathPattern=sanity
#   bash scripts/run-e2e-tests-docker.sh -- --verbose
#
# Arguments after -- are forwarded to Jest.

set -euo pipefail

IMAGE_NAME="guia_js-test-e2e"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ─── Step 1: Build ──────────────────────────────────────────────────────────
echo ""
echo "🐳 Building Docker image: ${IMAGE_NAME}"
docker build \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  -t "${IMAGE_NAME}" \
  -f "${PROJECT_ROOT}/Dockerfile.test.e2e" \
  "${PROJECT_ROOT}"

# ─── Step 2: Run ────────────────────────────────────────────────────────────
# Separate script args from Jest args (everything after --)
JEST_ARGS=()
while [[ $# -gt 0 ]]; do
  if [[ "$1" == "--" ]]; then
    shift
    JEST_ARGS=("$@")
    break
  fi
  shift
done

echo ""
echo "🧪 Running E2E tests inside Docker..."

EXTRA_ARGS=""
if [[ ${#JEST_ARGS[@]} -gt 0 ]]; then
  EXTRA_ARGS="${JEST_ARGS[*]}"
  echo "   Extra Jest args: ${EXTRA_ARGS}"
fi

set +e
docker run \
  --rm \
  --name "${IMAGE_NAME}-run" \
  -e CI=true \
  -e TEST_SERVE_DIST=1 \
  --shm-size=256m \
  "${IMAGE_NAME}" \
  sh -c "npm run test:e2e -- --runInBand ${EXTRA_ARGS}"
EXIT_CODE=$?
set -e

# ─── Step 3: Report ─────────────────────────────────────────────────────────
echo ""
if [[ $EXIT_CODE -eq 0 ]]; then
  echo "✅ E2E tests passed (exit code: 0)"
else
  echo "❌ E2E tests FAILED (exit code: ${EXIT_CODE})"
fi

exit $EXIT_CODE
