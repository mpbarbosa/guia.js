#!/usr/bin/env bash
# bump-sw-cache.sh
# Updates the CACHE_NAME in service-worker.js with the current app version,
# date, and git short SHA. Run automatically by CI/CD on push to main.
#
# Usage: ./.github/scripts/bump-sw-cache.sh
#
# Output: Updates service-worker.js in place.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SW_FILE="${REPO_ROOT}/public/service-worker.js"

if [ ! -f "${REPO_ROOT}/package.json" ]; then
  echo "ERROR: package.json not found at repository root: ${REPO_ROOT}" >&2
  exit 1
fi

if [ ! -f "$SW_FILE" ]; then
  echo "ERROR: public/service-worker.js not found at repository root: ${REPO_ROOT}" >&2
  exit 1
fi

cd "${REPO_ROOT}"

# Derive components of the new cache name
APP_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
DATE=$(date -u +%Y%m%d)
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "dev")

NEW_CACHE_NAME="guia-turistico-v${APP_VERSION}-${DATE}-${GIT_SHA}"

# Replace the CACHE_NAME line in public/service-worker.js
sed -i "s|const CACHE_NAME = '.*';|const CACHE_NAME = '${NEW_CACHE_NAME}';|" "$SW_FILE"

echo "✅ public/service-worker.js CACHE_NAME updated to: ${NEW_CACHE_NAME}"
