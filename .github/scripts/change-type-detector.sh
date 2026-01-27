#!/bin/bash

# Change-Type Detector
# Detects change type from commit messages using Conventional Commits
# Usage: ./change-type-detector.sh [base_ref]

set -e

BASE_REF="${1:-HEAD~1}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print status
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}" >&2
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}" >&2
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" >&2
}

print_type() {
    local type="$1"
    local message="$2"
    echo -e "${CYAN}📦 Change type: ${GREEN}${type}${NC} ${message}" >&2
}

# Get commit messages since base ref
get_commit_messages() {
    local base_ref="$1"
    
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo ""
        return 1
    fi
    
    # Get commit messages
    if git rev-parse "$base_ref" > /dev/null 2>&1; then
        git log --format="%s" "${base_ref}..HEAD" 2>/dev/null || echo ""
    else
        # Fallback: get last commit
        git log -1 --format="%s" 2>/dev/null || echo ""
    fi
}

# Extract type from conventional commit message
extract_conventional_type() {
    local message="$1"
    
    # Pattern: type(scope): description
    # or: type: description
    if echo "$message" | grep -qE "^[a-z]+(\([a-z0-9_-]+\))?:\s"; then
        echo "$message" | sed -E 's/^([a-z]+)(\([a-z0-9_-]+\))?:.*/\1/'
        return 0
    fi
    
    return 1
}

# Detect type from pattern matching
detect_type_from_pattern() {
    local message="$1"
    
    # Convert to lowercase for matching
    local lower_message=$(echo "$message" | tr '[:upper:]' '[:lower:]')
    
    # Feature patterns
    if echo "$lower_message" | grep -qE "^(add|implement|create|introduce)\s"; then
        echo "feat"
        return 0
    fi
    
    # Fix patterns
    if echo "$lower_message" | grep -qE "^(fix|repair|correct|resolve|patch)\s"; then
        echo "fix"
        return 0
    fi
    
    # Documentation patterns
    if echo "$lower_message" | grep -qE "^(doc|document|readme|update.*doc)\s"; then
        echo "docs"
        return 0
    fi
    
    # Refactor patterns
    if echo "$lower_message" | grep -qE "^(refactor|restructure|reorganize|rewrite)\s"; then
        echo "refactor"
        return 0
    fi
    
    # Test patterns
    if echo "$lower_message" | grep -qE "^(test|spec|add.*test)\s"; then
        echo "test"
        return 0
    fi
    
    # Style patterns
    if echo "$lower_message" | grep -qE "^(style|format|lint|prettier)\s"; then
        echo "style"
        return 0
    fi
    
    # Performance patterns
    if echo "$lower_message" | grep -qE "^(perf|optimize|speed|improve.*performance)\s"; then
        echo "perf"
        return 0
    fi
    
    # Chore patterns
    if echo "$lower_message" | grep -qE "^(chore|maint|maintain|update.*dep)\s"; then
        echo "chore"
        return 0
    fi
    
    # CI patterns
    if echo "$lower_message" | grep -qE "^(ci|workflow|pipeline|action)\s"; then
        echo "ci"
        return 0
    fi
    
    # Build patterns
    if echo "$lower_message" | grep -qE "^(build|webpack|rollup|config)\s"; then
        echo "build"
        return 0
    fi
    
    # No pattern matched
    return 1
}

# Analyze file changes to infer type
infer_type_from_files() {
    local changed_files="$1"
    
    # Count different file types
    local code_count=$(echo "$changed_files" | grep -cE "\.(js|css|html)$" || echo "0")
    local test_count=$(echo "$changed_files" | grep -cE "__tests__/.*\.js$|tests/.*\.py$" || echo "0")
    local doc_count=$(echo "$changed_files" | grep -cE "\.md$|^docs/" || echo "0")
    local config_count=$(echo "$changed_files" | grep -cE "package\.json|\.yml$|\.yaml$" || echo "0")
    
    # Determine type based on file distribution
    if [ "$doc_count" -gt 0 ] && [ "$code_count" -eq 0 ] && [ "$test_count" -eq 0 ]; then
        echo "docs"
        return 0
    fi
    
    if [ "$test_count" -gt 0 ] && [ "$code_count" -eq 0 ]; then
        echo "test"
        return 0
    fi
    
    if [ "$config_count" -gt 0 ] && [ "$code_count" -eq 0 ]; then
        echo "chore"
        return 0
    fi
    
    if [ "$code_count" -gt 0 ]; then
        # Default to fix for code changes
        echo "fix"
        return 0
    fi
    
    return 1
}

# Get steps for a given type
get_steps_for_type() {
    local type="$1"
    
    case "$type" in
        feat)
            echo "security_audit syntax_validation directory_structure test_execution coverage_report quality_checks doc_validation"
            ;;
        fix)
            echo "security_audit syntax_validation test_execution quality_checks"
            ;;
        docs)
            echo "syntax_validation doc_validation"
            ;;
        refactor)
            echo "security_audit syntax_validation test_execution coverage_report quality_checks"
            ;;
        test)
            echo "syntax_validation test_execution"
            ;;
        style)
            echo "syntax_validation quality_checks"
            ;;
        perf)
            echo "security_audit syntax_validation test_execution coverage_report"
            ;;
        chore)
            echo "security_audit syntax_validation"
            ;;
        ci)
            echo "syntax_validation"
            ;;
        build)
            echo "security_audit syntax_validation test_execution"
            ;;
        *)
            # Fallback
            echo "security_audit syntax_validation test_execution coverage_report"
            ;;
    esac
}

# Get test strategy for type
get_test_strategy() {
    local type="$1"
    
    case "$type" in
        feat|perf) echo "all" ;;
        fix) echo "related" ;;
        refactor) echo "comprehensive" ;;
        test) echo "tests_only" ;;
        docs) echo "none" ;;
        style|chore|ci|build) echo "minimal" ;;
        *) echo "all" ;;
    esac
}

# Main detection logic
main() {
    print_info "Analyzing change type..."
    
    # Get commit messages
    local commit_messages=$(get_commit_messages "$BASE_REF")
    
    if [ -z "$commit_messages" ]; then
        print_warning "No commit messages found"
        commit_messages="No commit message"
    fi
    
    # Try to detect type from most recent commit
    local latest_commit=$(echo "$commit_messages" | head -n 1)
    print_info "Latest commit: $latest_commit"
    
    local detected_type=""
    
    # 1. Try conventional commits format
    detected_type=$(extract_conventional_type "$latest_commit" || echo "")
    
    if [ -n "$detected_type" ]; then
        print_success "Detected conventional commit type"
    else
        # 2. Try pattern matching
        print_info "Trying pattern matching..."
        detected_type=$(detect_type_from_pattern "$latest_commit" || echo "")
        
        if [ -n "$detected_type" ]; then
            print_success "Detected type from pattern"
        else
            # 3. Infer from file changes
            print_info "Inferring type from file changes..."
            local changed_files=$(git diff --name-only "$BASE_REF" 2>/dev/null || echo "")
            detected_type=$(infer_type_from_files "$changed_files" || echo "")
            
            if [ -n "$detected_type" ]; then
                print_success "Inferred type from files"
            else
                # 4. Fallback
                print_warning "Using fallback type"
                detected_type="fix"
            fi
        fi
    fi
    
    # Output results
    print_type "$detected_type" "($(get_test_strategy "$detected_type") testing)"
    
    # Print steps
    local steps=$(get_steps_for_type "$detected_type")
    print_info "Workflow steps: $steps"
    
    # Output machine-readable format
    echo "$detected_type"
    
    # Export for use by other scripts
    export CHANGE_TYPE="$detected_type"
    export CHANGE_STEPS="$steps"
    export TEST_STRATEGY=$(get_test_strategy "$detected_type")
    
    # Create cache file for other scripts
    if mkdir -p .github/cache 2>/dev/null; then
        cat > .github/cache/change_type.cache << EOF
CHANGE_TYPE=$detected_type
CHANGE_STEPS=$steps
TEST_STRATEGY=$(get_test_strategy "$detected_type")
DETECTED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
COMMIT_MESSAGE=$latest_commit
EOF
        print_success "Change type cached"
    fi
}

# Run main function
main
