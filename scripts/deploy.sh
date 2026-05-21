#!/bin/bash
#
# deploy.sh
# ---------
# Purpose:      Build the production bundle and deploy it to the mpbarbosa.com
#               website repository, then commit and push any resulting changes.
#
# Usage:        ./scripts/deploy.sh [-h|--help]
#
# Arguments:
#   -h, --help      Show this help message and exit.
#
# Prerequisites:
#   - mpbarbosa.com repository available at $MPBARBOSA_COM_ROOT
#     (default: /home/mpb/Documents/GitHub/mpbarbosa.com).
#   - rsync available on PATH.
#   - Node.js v20.19.0+ and npm installed.
#   - git configured with push access to the mpbarbosa.com remote.
#
# What it does:
#   1. Builds the production bundle with Vite (npm run build).
#   2. Rsyncs dist/ contents to $MPBARBOSA_COM_ROOT/guia_js/.
#   3. If there are uncommitted changes in $MPBARBOSA_COM_ROOT:
#      a. git add -A
#      b. git commit -m "chore: automated deploy from guia_js"
#      c. git push
#
# Environment variables:
#   MPBARBOSA_COM_ROOT   Override the path to the mpbarbosa.com repository.
#                        Default: /home/mpb/Documents/GitHub/mpbarbosa.com
#
# Exit codes:
#   0  Deployment completed successfully (or no changes to push).
#   1  Any step failed (set -euo pipefail).
#
# Related modules: dist/, vite.config.js
# See also:        scripts/README.md, docs/infrastructure/DEPLOYMENT.md

set -euo pipefail

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GUIA_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MPBARBOSA_COM_ROOT="${MPBARBOSA_COM_ROOT:-/home/mpb/Documents/GitHub/mpbarbosa.com}"
DEPLOY_TARGET="$MPBARBOSA_COM_ROOT/guia_js"
COMMIT_MESSAGE="chore: automated deploy from guia_js"

# ---------------------------------------------------------------------------
# Help
# ---------------------------------------------------------------------------
show_help() {
    cat << 'EOF'
deploy.sh — Build and deploy guia_js to mpbarbosa.com

USAGE:
    ./scripts/deploy.sh [OPTIONS]

DESCRIPTION:
    Builds the production bundle, syncs it to the mpbarbosa.com website
    repository, and commits + pushes any resulting changes.

OPTIONS:
    -h, --help          Show this help message and exit.

ENVIRONMENT:
    MPBARBOSA_COM_ROOT  Path to the mpbarbosa.com repository.
                        Default: /home/mpb/Documents/GitHub/mpbarbosa.com

PROCESS:
    1. npm run build       — compile dist/
    2. rsync dist/         — sync to $MPBARBOSA_COM_ROOT/guia_js/
    3. git add -A          — stage all changes in mpbarbosa.com
    4. git commit          — commit with automated deploy message
    5. git push            — push to remote (skipped if nothing to commit)

PREREQUISITES:
    ✅ mpbarbosa.com repository cloned at $MPBARBOSA_COM_ROOT
    ✅ rsync available on PATH
    ✅ Node.js v20.19.0+ and npm installed
    ✅ git configured with push access to the mpbarbosa.com remote

EXIT CODES:
    0    Deployment completed successfully (or no changes to push)
    1    Any step failed

EXAMPLES:
    # Standard deploy
    ./scripts/deploy.sh

    # Override repository path
    MPBARBOSA_COM_ROOT=~/repos/mpbarbosa.com ./scripts/deploy.sh

    # Via npm script
    npm run deploy

EOF
}

if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
    show_help
    exit 0
fi

# ---------------------------------------------------------------------------
# Prerequisite checks
# ---------------------------------------------------------------------------
validate_prerequisites() {
    if [ ! -d "$MPBARBOSA_COM_ROOT" ]; then
        echo "Error: mpbarbosa.com repository not found at '$MPBARBOSA_COM_ROOT'" >&2
        echo "       Set the MPBARBOSA_COM_ROOT environment variable or clone the repo." >&2
        exit 1
    fi

    if [ ! -d "$MPBARBOSA_COM_ROOT/.git" ]; then
        echo "Error: '$MPBARBOSA_COM_ROOT' is not a git repository." >&2
        exit 1
    fi

    if ! command -v rsync >/dev/null 2>&1; then
        echo "Error: rsync is required but was not found on PATH." >&2
        exit 1
    fi
}

# ---------------------------------------------------------------------------
# Step 1: Build
# ---------------------------------------------------------------------------
build() {
    echo "==> [1/3] Building production bundle..."
    cd "$GUIA_ROOT"
    npm run build
    echo "==> Build complete."
}

# ---------------------------------------------------------------------------
# Step 2: Sync dist/ to mpbarbosa.com/guia_js/
# ---------------------------------------------------------------------------
sync_to_target() {
    echo "==> [2/3] Syncing dist/ to $DEPLOY_TARGET..."
    mkdir -p "$DEPLOY_TARGET"
    rsync -av --delete "$GUIA_ROOT/dist/" "$DEPLOY_TARGET/"
    echo "==> Sync complete."
}

# ---------------------------------------------------------------------------
# Step 3: git add, commit, push (only if there are changes)
# ---------------------------------------------------------------------------
git_commit_and_push() {
    echo "==> [3/3] Checking for changes in $MPBARBOSA_COM_ROOT..."
    cd "$MPBARBOSA_COM_ROOT"

    if [ -z "$(git status --porcelain)" ]; then
        echo "==> No changes to commit. Nothing to push."
        return 0
    fi

    echo "==> Staging all changes..."
    git add -A

    echo "==> Committing..."
    git commit -m "$COMMIT_MESSAGE"

    echo "==> Pushing to remote..."
    git push

    echo "==> Changes pushed successfully."
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
    validate_prerequisites
    build
    sync_to_target
    git_commit_and_push
    echo ""
    echo "✓ Deployment complete."
}

main
