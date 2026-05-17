#!/usr/bin/env bash
# scripts/run-playwright-tests-docker.sh
#
# Build the Playwright test Docker image and run the sanity suite.
#
# Usage:
#   bash scripts/run-playwright-tests-docker.sh

set -euo pipefail

IMAGE_NAME="guia_js-test-playwright"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ─── Step 1: Build ──────────────────────────────────────────────────────────
echo ""
echo "🐳 Building Docker image: ${IMAGE_NAME}"
docker build \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  -t "${IMAGE_NAME}" \
  -f "${PROJECT_ROOT}/Dockerfile.test.playwright" \
  "${PROJECT_ROOT}"

# ─── Step 2: Run ────────────────────────────────────────────────────────────
echo ""
echo "🧪 Running Playwright sanity tests inside Docker..."

set +e
docker run \
  --rm \
  --name "${IMAGE_NAME}-run" \
  -e CI=true \
  --shm-size=256m \
  "${IMAGE_NAME}"
EXIT_CODE=$?
set -e

# ─── Step 3: Report ─────────────────────────────────────────────────────────
echo ""
if [[ $EXIT_CODE -eq 0 ]]; then
  echo "✅ Playwright tests passed (exit code: 0)"
else
  echo "❌ Playwright tests FAILED (exit code: ${EXIT_CODE})"
fi

exit $EXIT_CODE
