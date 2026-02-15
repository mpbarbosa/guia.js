#!/bin/bash

# Build and Deploy Script
# Builds production bundle and deploys to staging environment

set -e

# Show help message
show_help() {
    cat << 'EOF'
build_and_deploy.sh - Build production and deploy to staging

USAGE:
    ./scripts/build_and_deploy.sh [OPTIONS]

DESCRIPTION:
    Builds production bundle and deploys to staging environment
    via mpbarbosa_site repository sync script.

⚠️  WARNING: This script has external dependencies and requires
    specific directory structure. Review prerequisites before running.

OPTIONS:
    -h, --help          Show this help message
    --dry-run           Show commands without executing (NOT IMPLEMENTED)
    --skip-build        Skip npm build step (NOT IMPLEMENTED)

PROCESS:
    1. Navigate to parent directory
    2. Run production build (npm run build)
    3. Navigate to mpbarbosa_site repository
    4. Execute staging deployment sync script

PREREQUISITES:
    ✅ mpbarbosa_site repository cloned at ../mpbarbosa_site
    ✅ Valid staging environment configuration
    ✅ Sync script exists: mpbarbosa_site/shell_scripts/sync_to_staging.sh
    ✅ Production build completes successfully
    ✅ Write permissions for deployment

DIRECTORY STRUCTURE REQUIRED:
    parent-directory/
    ├── guia_turistico/           # This project
    │   ├── scripts/
    │   │   └── build_and_deploy.sh
    │   └── dist/                 # Created by npm run build
    └── mpbarbosa_site/           # Sibling project
        └── shell_scripts/
            └── sync_to_staging.sh

KNOWN ISSUES:
    ❌ No error handling for missing directories
    ❌ No validation that build succeeded
    ❌ No rollback mechanism if deployment fails
    ❌ Requires specific directory structure (fragile)

EXIT CODES:
    0    Deployment completed successfully
    1    Error during build or deployment

EXAMPLES:
    # Deploy to staging (current implementation)
    ./scripts/build_and_deploy.sh

    # Proposed: Dry run to preview
    ./scripts/build_and_deploy.sh --dry-run

RECOMMENDATIONS:
    ⚠️  Run tests before deploying: npm test
    ⚠️  Ensure clean git state
    ⚠️  Coordinate with mpbarbosa_site owner
    ⚠️  Not for production deployment (staging only)

ALTERNATIVE (RECOMMENDED):
    Consider migrating to GitHub Actions workflow for:
    - Automated deployment
    - Built-in error handling
    - Rollback capabilities
    - No manual directory management

    See .github/workflows/deploy-staging.yml (proposed)

DOCUMENTATION:
    See scripts/README.md for complete documentation
    See docs/SCRIPT_DOCUMENTATION_COMPLETE.md for enhancement proposals

EOF
}

# Check for help flag
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

cd ..
pwd
npm run build
cd ../mpbarbosa_site
pwd
./shell_scripts/sync_to_staging.sh --step1
