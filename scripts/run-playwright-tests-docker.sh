#!/usr/bin/env bash
# scripts/run-playwright-tests-docker.sh
#
# Build the Playwright test Docker image and run the sanity suite.
#
# Usage:
#   bash scripts/run-playwright-tests-docker.sh

set -euo pipefail

IMAGE_NAME="guia_js-test-playwright"
CONTAINER_NAME="${IMAGE_NAME}-run"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cleanup_container() {
  docker container rm -f "$1" >/dev/null 2>&1 || true
}

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

cleanup_container "${CONTAINER_NAME}"
trap 'cleanup_container "${CONTAINER_NAME}"' EXIT

set +e
docker run \
  --rm \
  --name "${CONTAINER_NAME}" \
  -e CI=true \
  --shm-size=256m \
  "${IMAGE_NAME}"
EXIT_CODE=$?
set -e
trap - EXIT
cleanup_container "${CONTAINER_NAME}"

# ─── Step 3: Report ─────────────────────────────────────────────────────────
echo ""
if [[ $EXIT_CODE -eq 0 ]]; then
  echo "✅ Playwright tests passed (exit code: 0)"
else
  echo "❌ Playwright tests FAILED (exit code: ${EXIT_CODE})"
fi

exit $EXIT_CODE
