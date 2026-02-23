#!/usr/bin/env bash
# bump-sw-cache.sh
# Updates the CACHE_NAME in service-worker.js with the current app version,
# date, and git short SHA. Run automatically by CI/CD on push to main.
#
# Usage: ./.github/scripts/bump-sw-cache.sh
#
# Output: Updates service-worker.js in place.

set -euo pipefail

SW_FILE="service-worker.js"

if [ ! -f "$SW_FILE" ]; then
  echo "ERROR: $SW_FILE not found. Run from repository root." >&2
  exit 1
fi

# Derive components of the new cache name
APP_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
DATE=$(date -u +%Y%m%d)
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "dev")

NEW_CACHE_NAME="guia-turistico-v${APP_VERSION}-${DATE}-${GIT_SHA}"

# Replace the CACHE_NAME line in service-worker.js
sed -i "s|const CACHE_NAME = '.*';|const CACHE_NAME = '${NEW_CACHE_NAME}';|" "$SW_FILE"

echo "✅ CACHE_NAME updated to: ${NEW_CACHE_NAME}"
