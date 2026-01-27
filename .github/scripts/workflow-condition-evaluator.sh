#!/bin/bash

# Workflow Condition Evaluator
# Evaluates conditional execution rules from .workflow-config.yaml
# Usage: ./workflow-condition-evaluator.sh <step_name> [base_ref]

set -e

STEP_NAME="${1:-}"
BASE_REF="${2:-HEAD~1}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}" >&2
}

print_skip() {
    echo -e "${YELLOW}⏭️  $1${NC}" >&2
}

print_run() {
    echo -e "${GREEN}▶️  $1${NC}" >&2
}

# Check if we're in the right directory
if [ ! -f ".workflow-config.yaml" ]; then
    echo "Error: .workflow-config.yaml not found. Run this script from the project root." >&2
    exit 1
fi

if [ -z "$STEP_NAME" ]; then
    echo "Error: Step name required." >&2
    echo "Usage: $0 <step_name> [base_ref]" >&2
    exit 1
fi

# Detect changed files
get_changed_files() {
    local base_ref="$1"
    local changed_files
    
    # Try to get changes from git
    if git rev-parse --git-dir > /dev/null 2>&1; then
        # Check if we have any commits
        if git rev-parse "$base_ref" > /dev/null 2>&1; then
            changed_files=$(git diff --name-only "$base_ref" 2>/dev/null || echo "")
        else
            # Fallback: get all tracked files
            changed_files=$(git ls-files 2>/dev/null || echo "")
        fi
    fi
    
    echo "$changed_files"
}

# Check if pattern matches any changed files
pattern_matches() {
    local pattern="$1"
    local changed_files="$2"
    
    # Convert glob pattern to grep regex
    local regex=$(echo "$pattern" | sed 's/\*\*/.*/' | sed 's/\*/[^\/]*/')
    
    if echo "$changed_files" | grep -qE "$regex"; then
        return 0
    else
        return 1
    fi
}

# Evaluate conditions
evaluate_conditions() {
    local step="$1"
    local changed_files="$2"
    
    # Check if no changes detected
    local no_code_changes=false
    local only_docs_changed=false
    local no_js_changes=false
    local only_tests_changed=false
    local no_new_files=false
    
    if [ -z "$changed_files" ]; then
        no_code_changes=true
        no_new_files=true
    fi
    
    # Detect change types
    local code_changed=false
    local docs_changed=false
    local tests_changed=false
    local js_changed=false
    
    if pattern_matches "src/**/*.js" "$changed_files" || \
       pattern_matches "src/**/*.css" "$changed_files" || \
       pattern_matches "src/**/*.html" "$changed_files"; then
        code_changed=true
    fi
    
    if pattern_matches "**/*.md" "$changed_files" || \
       pattern_matches "docs/**/*" "$changed_files"; then
        docs_changed=true
    fi
    
    if pattern_matches "__tests__/**/*.js" "$changed_files" || \
       pattern_matches "tests/**/*.py" "$changed_files"; then
        tests_changed=true
    fi
    
    if pattern_matches "**/*.js" "$changed_files"; then
        js_changed=true
    fi
    
    # Evaluate specific conditions
    if [ "$docs_changed" = true ] && [ "$code_changed" = false ] && [ "$tests_changed" = false ]; then
        only_docs_changed=true
    fi
    
    if [ "$tests_changed" = true ] && [ "$code_changed" = false ] && [ "$docs_changed" = false ]; then
        only_tests_changed=true
    fi
    
    if [ "$js_changed" = false ]; then
        no_js_changes=true
    fi
    
    if [ -z "$changed_files" ]; then
        no_code_changes=true
    fi
    
    # Step-specific evaluation
    case "$step" in
        step7_test_execution)
            if [ "$no_code_changes" = true ] || [ "$only_docs_changed" = true ]; then
                print_skip "Skipping test execution (no code changes or docs-only)"
                return 1
            fi
            
            if [ "$code_changed" = true ] || [ "$tests_changed" = true ]; then
                print_run "Running test execution (code or tests changed)"
                return 0
            fi
            
            print_skip "Skipping test execution (no relevant changes)"
            return 1
            ;;
            
        step4_directory_structure)
            # Check cache age (24h = 86400 seconds)
            local cache_file=".github/cache/directory_structure.cache"
            local cache_max_age=86400
            
            if [ -f "$cache_file" ]; then
                local cache_age=$(( $(date +%s) - $(stat -c %Y "$cache_file" 2>/dev/null || echo 0) ))
                if [ "$cache_age" -lt "$cache_max_age" ] && [ "$no_new_files" = true ]; then
                    print_skip "Skipping directory structure scan (cache valid, no new files)"
                    return 1
                fi
            fi
            
            print_run "Running directory structure scan (cache expired or new files)"
            return 0
            ;;
            
        step3_syntax_validation)
            if [ "$no_js_changes" = true ]; then
                print_skip "Skipping syntax validation (no JavaScript changes)"
                return 1
            fi
            
            print_run "Running syntax validation (JavaScript files changed)"
            return 0
            ;;
            
        step5_coverage_report)
            if [ "$only_docs_changed" = true ] || [ "$only_tests_changed" = true ]; then
                print_skip "Skipping coverage report (docs-only or tests-only changes)"
                return 1
            fi
            
            if [ "$code_changed" = true ]; then
                print_run "Running coverage report (source code changed)"
                return 0
            fi
            
            print_skip "Skipping coverage report (no source code changes)"
            return 1
            ;;
            
        *)
            print_info "Unknown step: $step (defaulting to run)"
            return 0
            ;;
    esac
}

# Main execution
main() {
    print_info "Evaluating conditions for step: $STEP_NAME"
    
    local changed_files=$(get_changed_files "$BASE_REF")
    
    if [ -z "$changed_files" ]; then
        print_info "No changes detected"
    else
        print_info "Detected $(echo "$changed_files" | wc -l) changed files"
    fi
    
    # Evaluate and return exit code
    if evaluate_conditions "$STEP_NAME" "$changed_files"; then
        exit 0  # Run step
    else
        exit 1  # Skip step
    fi
}

# Run main function
main
