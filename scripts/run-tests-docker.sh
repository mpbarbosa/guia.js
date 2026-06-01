#!/usr/bin/env bash
# scripts/run-tests-docker.sh
#
# Build the unit/integration test Docker image and run the test suite.
#
# Usage:
#   bash scripts/run-tests-docker.sh              # run all unit tests
#   bash scripts/run-tests-docker.sh -- --coverage
#   bash scripts/run-tests-docker.sh -- --testPathPattern=AddressCache
#   bash scripts/run-tests-docker.sh -- --verbose --detectOpenHandles
#
# Arguments after -- are forwarded to Jest.

set -euo pipefail

IMAGE_NAME="guia_js-test"
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
  -f "${PROJECT_ROOT}/Dockerfile.test" \
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
echo "🧪 Running unit tests inside Docker..."

cleanup_container "${CONTAINER_NAME}"
trap 'cleanup_container "${CONTAINER_NAME}"' EXIT

EXTRA_ARGS=""
if [[ ${#JEST_ARGS[@]} -gt 0 ]]; then
  EXTRA_ARGS="${JEST_ARGS[*]}"
  echo "   Extra Jest args: ${EXTRA_ARGS}"
fi

set +e
docker run \
  --rm \
  --name "${CONTAINER_NAME}" \
  -e CI=true \
  "${IMAGE_NAME}" \
  sh -c "npm run test:unit -- --runInBand ${EXTRA_ARGS}"
EXIT_CODE=$?
set -e
trap - EXIT
cleanup_container "${CONTAINER_NAME}"

# ─── Step 3: Report ─────────────────────────────────────────────────────────
echo ""
if [[ $EXIT_CODE -eq 0 ]]; then
  echo "✅ Unit tests passed (exit code: 0)"
else
  echo "❌ Unit tests FAILED (exit code: ${EXIT_CODE})"
fi

exit $EXIT_CODE
