#!/bin/bash
#
# deploy.sh
# ---------
# Purpose:      Run the production preflight, sync the built bundle to the
#               sibling mpbarbosa.com website repository, then commit and push
#               only the guia_js deployment subtree.
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
#   1. Verifies both the guia_js and mpbarbosa.com worktrees are clean.
#   2. Fast-forwards the sibling mpbarbosa.com checkout from its remote.
#   3. Runs scripts/deploy-preflight.sh to build and validate dist/.
#   4. Rsyncs dist/ contents to $MPBARBOSA_COM_ROOT/guia_js/.
#   5. If guia_js/ changed in mpbarbosa.com:
#      a. git add -A -- guia_js
#      b. git commit with the guia_js version and source SHA
#      c. git push
#
# Environment variables:
#   MPBARBOSA_COM_ROOT   Override the path to the mpbarbosa.com repository.
#                        Default: /home/mpb/Documents/GitHub/mpbarbosa.com
#
# Exit codes:
#   0  Deployment completed successfully (or no guia_js changes to push).
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
DEPLOY_SUBTREE="guia_js"
COMMIT_MESSAGE=""

die() {
    echo "Error: $*" >&2
    exit 1
}

# ---------------------------------------------------------------------------
# Help
# ---------------------------------------------------------------------------
show_help() {
    cat << 'EOF'
deploy.sh — Build and deploy guia_js to mpbarbosa.com

USAGE:
    ./scripts/deploy.sh [OPTIONS]

DESCRIPTION:
    Runs the production preflight, syncs the validated dist/ bundle to the
    mpbarbosa.com website repository, and commits + pushes only the guia_js
    deployment subtree.

OPTIONS:
    -h, --help          Show this help message and exit.

ENVIRONMENT:
    MPBARBOSA_COM_ROOT  Path to the mpbarbosa.com repository.
                        Default: /home/mpb/Documents/GitHub/mpbarbosa.com

PROCESS:
    1. Verify guia_js worktree is clean
    2. Verify mpbarbosa.com worktree is clean
    3. git pull --ff-only  — fast-forward mpbarbosa.com from remote
    4. deploy-preflight.sh — build + validate dist/
    5. rsync dist/         — sync to $MPBARBOSA_COM_ROOT/guia_js/
    6. git add -A -- guia_js
    7. git commit          — commit with guia_js version + source SHA
    8. git push            — push to remote (skipped if guia_js is unchanged)

PREREQUISITES:
    ✅ mpbarbosa.com repository cloned at $MPBARBOSA_COM_ROOT
    ✅ rsync available on PATH
    ✅ Node.js v20.19.0+ and npm installed
    ✅ git configured with push access to the mpbarbosa.com remote

EXIT CODES:
    0    Deployment completed successfully (or no guia_js changes to push)
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
    if [ ! -d "$GUIA_ROOT/.git" ]; then
        die "'$GUIA_ROOT' is not a git repository."
    fi

    if [ ! -d "$MPBARBOSA_COM_ROOT" ]; then
        die "mpbarbosa.com repository not found at '$MPBARBOSA_COM_ROOT'. Set MPBARBOSA_COM_ROOT or clone the repo."
    fi

    if [ ! -d "$MPBARBOSA_COM_ROOT/.git" ]; then
        die "'$MPBARBOSA_COM_ROOT' is not a git repository."
    fi

    if ! command -v rsync >/dev/null 2>&1; then
        die "rsync is required but was not found on PATH."
    fi

    if [ ! -f "$SCRIPT_DIR/deploy-preflight.sh" ]; then
        die "deploy-preflight.sh not found at '$SCRIPT_DIR/deploy-preflight.sh'."
    fi
}

validate_clean_worktrees() {
    echo "==> [1/5] Verifying clean worktrees..."

    if [ -n "$(git -C "$GUIA_ROOT" status --porcelain)" ]; then
        die "guia_js worktree is not clean. Commit or stash changes before deploying."
    fi

    if [ -n "$(git -C "$MPBARBOSA_COM_ROOT" status --porcelain)" ]; then
        die "mpbarbosa.com worktree is not clean. Commit or stash changes before deploying."
    fi

    echo "==> Worktrees are clean."
}

prepare_deploy_metadata() {
    local version
    local sha

    version="$(node -p "require('$GUIA_ROOT/package.json').version")"
    sha="$(git -C "$GUIA_ROOT" rev-parse --short HEAD)"
    COMMIT_MESSAGE="chore(deploy): publish guia_js ${version} (${sha})"
}

sync_target_repo() {
    local branch

    echo "==> [2/5] Fast-forwarding $MPBARBOSA_COM_ROOT..."
    branch="$(git -C "$MPBARBOSA_COM_ROOT" rev-parse --abbrev-ref HEAD)"
    if [ "$branch" = "HEAD" ]; then
        die "mpbarbosa.com is in detached HEAD state. Check out a branch before deploying."
    fi

    if ! git -C "$MPBARBOSA_COM_ROOT" rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
        die "mpbarbosa.com branch '$branch' has no upstream configured."
    fi

    git -C "$MPBARBOSA_COM_ROOT" pull --ff-only
    echo "==> Sibling repository is up to date."
}

# ---------------------------------------------------------------------------
# Step 3: Production preflight
# ---------------------------------------------------------------------------
run_preflight() {
    echo "==> [3/5] Running production preflight..."
    cd "$GUIA_ROOT"
    "$SCRIPT_DIR/deploy-preflight.sh"
    echo "==> Preflight complete."
}

# ---------------------------------------------------------------------------
# Step 4: Sync dist/ to mpbarbosa.com/guia_js/
# ---------------------------------------------------------------------------
sync_to_target() {
    echo "==> [4/5] Syncing dist/ to $DEPLOY_TARGET..."
    mkdir -p "$DEPLOY_TARGET"
    rsync -av --delete "$GUIA_ROOT/dist/" "$DEPLOY_TARGET/"
    echo "==> Sync complete."
}

# ---------------------------------------------------------------------------
# Step 5: git add, commit, push (only if guia_js/ changed)
# ---------------------------------------------------------------------------
git_commit_and_push() {
    echo "==> [5/5] Checking for changes in $MPBARBOSA_COM_ROOT/$DEPLOY_SUBTREE..."
    cd "$MPBARBOSA_COM_ROOT"

    if [ -z "$(git status --porcelain -- "$DEPLOY_SUBTREE")" ]; then
        echo "==> No guia_js changes to commit. Nothing to push."
        return 0
    fi

    echo "==> Staging guia_js deployment subtree..."
    git add -A -- "$DEPLOY_SUBTREE"

    echo "==> Committing deployment..."
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
    validate_clean_worktrees
    prepare_deploy_metadata
    sync_target_repo
    run_preflight
    sync_to_target
    git_commit_and_push
    echo ""
    echo "✓ Deployment complete."
}

main
