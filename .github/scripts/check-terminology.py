#!/usr/bin/env python3
"""
Terminology Consistency Checker
Validates documentation against terminology guide standards
Version: 1.0.0
Date: 2026-01-28
"""

import os
import re
import sys
from pathlib import Path

# ANSI colors
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
RED = '\033[0;31m'
BLUE = '\033[0;34m'
NC = '\033[0m'

# Terminology checks
CHECKS = [
    {
        'name': "Missing accent in 'município'",
        'pattern': r'\bmunicipios?\b(?!s)',  # municipio without accent
        'message': "Use 'município' (with accent)",
        'exclude_pattern': r'var\s+municipio|const\s+municipio|\.municipio'  # Exclude code
    },
    {
        'name': "Incorrect guia.js capitalization",
        'pattern': r'\bGuia\.js|GUIA\.js',
        'message': "Use lowercase 'guia.js'",
        'exclude_pattern': r'^Guia\.js is'  # Allow at sentence start
    },
    {
        'name': "Incorrect ibira.js capitalization",
        'pattern': r'\bIbira\.js|IBIRA\.js',
        'message': "Use lowercase 'ibira.js'",
        'exclude_pattern': r'^Ibira\.js is'
    },
    {
        'name': "'end-to-end tests' instead of 'E2E tests'",
        'pattern': r'\bend-to-end tests\b',
        'message': "Use 'E2E tests' after first definition"
    },
    {
        'name': "Incorrect npm capitalization",
        'pattern': r'\bNPM\b|\bNpm\b',
        'message': "Use lowercase 'npm'"
    },
    {
        'name': "Incorrect Node.js variations",
        'pattern': r'\bNodeJS\b|\bnode\.js\b|\bNode\.JS\b',
        'message': "Use 'Node.js' (capital N, lowercase js)"
    },
    {
        'name': "Incorrect jsdom capitalization",
        'pattern': r'\bJSDom\b|\bJsdom\b|\bJSDom\b',
        'message': "Use lowercase 'jsdom'"
    }
]

def check_file(file_path):
    """Check terminology in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            lines = content.split('\n')
    except Exception as e:
        print(f"{YELLOW}⚠️  Could not read {file_path}: {e}{NC}")
        return 0
    
    issues = 0
    
    for check in CHECKS:
        pattern = re.compile(check['pattern'])
        exclude = re.compile(check['exclude_pattern']) if 'exclude_pattern' in check else None
        
        for line_num, line in enumerate(lines, 1):
            # Skip if in code block
            if line.strip().startswith('```') or line.strip().startswith('    '):
                continue
            
            # Check for pattern
            if pattern.search(line):
                # Check if should be excluded
                if exclude and exclude.search(line):
                    continue
                
                # Found an issue
                if issues == 0:  # First issue in file
                    print(f"{YELLOW}⚠️  {file_path}{NC}")
                
                print(f"   Line {line_num}: {check['message']}")
                print(f"   Found: {line.strip()[:80]}")
                issues += 1
    
    if issues > 0:
        print()  # Blank line after file issues
    
    return issues

def main():
    if len(sys.argv) < 2 or '--help' in sys.argv or '-h' in sys.argv:
        print(f"{BLUE}Terminology Consistency Checker{NC}\n")
        print(f"{BLUE}Usage:{NC}")
        print(f"  {sys.argv[0]} [OPTIONS] FILE...\n")
        print(f"{BLUE}Options:{NC}")
        print(f"  --all, -a     Check all markdown files in docs/")
        print(f"  --help, -h    Show this help message\n")
        print(f"{BLUE}Examples:{NC}")
        print(f"  # Check specific file")
        print(f"  {sys.argv[0]} docs/TESTING.md\n")
        print(f"  # Check all documentation")
        print(f"  {sys.argv[0]} --all\n")
        print(f"{BLUE}Checks Performed:{NC}")
        for i, check in enumerate(CHECKS, 1):
            print(f"  {i}. {check['name']}")
        print(f"\n{BLUE}See Also:{NC}")
        print(f"  docs/guides/TERMINOLOGY_GUIDE.md - Full terminology reference\n")
        sys.exit(0)
    
    print(f"{BLUE}==========================================")
    print("Terminology Consistency Checker")
    print(f"=========================================={NC}\n")
    
    # Build file list
    files_to_check = []
    
    if '--all' in sys.argv or '-a' in sys.argv:
        print("Finding markdown files in docs/...")
        for root, dirs, files in os.walk('docs'):
            for file in files:
                if file.endswith('.md'):
                    files_to_check.append(os.path.join(root, file))
        print(f"Found {len(files_to_check)} files to check\n")
    else:
        files_to_check = [arg for arg in sys.argv[1:] if not arg.startswith('-')]
    
    if not files_to_check:
        print(f"{YELLOW}No files specified. Use --all to check all docs or provide file paths.{NC}")
        print("Run with --help for usage information.")
        sys.exit(1)
    
    print("Checking terminology consistency...\n")
    
    # Check files
    total_issues = 0
    checked_files = 0
    
    for file_path in files_to_check:
        if os.path.isfile(file_path):
            checked_files += 1
            total_issues += check_file(file_path)
    
    # Summary
    print(f"{BLUE}==========================================")
    print("Summary")
    print(f"=========================================={NC}\n")
    
    print(f"Files checked: {checked_files}")
    print(f"Issues found: {total_issues}\n")
    
    if total_issues == 0:
        print(f"{GREEN}✅ All terminology checks passed!{NC}\n")
        print("Terminology is consistent across checked files.")
        sys.exit(0)
    else:
        print(f"{YELLOW}⚠️  Found {total_issues} terminology inconsistencies{NC}\n")
        print("Please review and fix the issues above.")
        print("See docs/guides/TERMINOLOGY_GUIDE.md for correct usage.")
        sys.exit(1)

if __name__ == '__main__':
    main()
