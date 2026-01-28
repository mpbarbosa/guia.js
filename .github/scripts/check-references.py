#!/usr/bin/env python3
"""
Enhanced Reference Checker with False Positive Filtering
Checks for broken file references while excluding known false positive patterns
Version: 1.0.0
Date: 2026-01-28
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Tuple, Set

# ANSI color codes
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
RED = '\033[0;31m'
BLUE = '\033[0;34m'
CYAN = '\033[0;36m'
NC = '\033[0m'  # No Color

# Exclusion patterns
EXCLUDE_REGEX_PATTERNS = [
    r'/.*?/g[im]*',              # JavaScript regex: /pattern/g, /pattern/gi, etc.
    r'\.replace\s*\(',           # String replacement
    r'\.match\s*\(',             # String matching
    r'\.test\s*\(',              # Regex testing
]

EXCLUDE_COMMENT_PATTERNS = [
    r'/\*\s*\.\.\.\s*\*/',       # Code omitted: /* ... */
    r'//\s*\.\.\.',               # Line comment: // ...
    r'/\*\*.*?\*/',               # JSDoc comments
]

EXCLUDE_DESCRIPTION_PATTERNS = [
    r'/[a-z]+\s+for\s',          # Descriptive: "/src for library"
    r'/[a-z]+\s+in\s',           # Descriptive: "/docs in repository"
    r'/[a-z]+\s+contains',       # Descriptive: "/tests contains"
]

EXCLUDE_CODE_PATTERNS = [
    r'/@(param|returns?|throws?|type)',  # JSDoc tags
    r'/throw\s+new',                     # Error throwing
    r'/(async\s+)?function',             # Functions
    r'/(const|let|var)\s',               # Variables
]

EXCLUDE_URL_PATTERNS = [
    r'^https?://',               # HTTP(S) URLs
    r'^ftp://',                  # FTP URLs
    r'^file://',                 # File protocol
]

EXCLUDE_SPECIAL_PATTERNS = [
    r'^#',                       # Anchor links
    r'^mailto:',                 # Email links
    r'^tel:',                    # Phone links
]

EXCLUDE_DIRECTORIES = {
    'node_modules', '.git', '.ai_workflow', 
    'coverage', '.jest-cache', 'venv', '.husky'
}


class ReferenceChecker:
    def __init__(self, root_dir='.'):
        self.root_dir = Path(root_dir)
        self.total_references = 0
        self.valid_references = 0
        self.excluded_patterns = 0
        self.broken_references = 0
        self.excluded_refs = []
        self.broken_refs = []
    
    def should_exclude(self, line: str, pattern: str) -> bool:
        """Check if pattern should be excluded as false positive"""
        
        # Check if in code block
        if line.strip().startswith('```'):
            return True
        
        # Check regex patterns
        for regex_pattern in EXCLUDE_REGEX_PATTERNS:
            if re.search(regex_pattern, pattern) or re.search(regex_pattern, line):
                return True
        
        # Check comment patterns
        for comment_pattern in EXCLUDE_COMMENT_PATTERNS:
            if re.search(comment_pattern, pattern):
                return True
        
        # Check description patterns
        for desc_pattern in EXCLUDE_DESCRIPTION_PATTERNS:
            if re.search(desc_pattern, line):
                return True
        
        # Check code patterns
        for code_pattern in EXCLUDE_CODE_PATTERNS:
            if re.search(code_pattern, pattern):
                return True
        
        # Check URL patterns
        for url_pattern in EXCLUDE_URL_PATTERNS:
            if re.search(url_pattern, pattern):
                return True
        
        # Check special patterns
        for special_pattern in EXCLUDE_SPECIAL_PATTERNS:
            if re.search(special_pattern, pattern):
                return True
        
        return False
    
    def extract_references(self, file_path: Path) -> None:
        """Extract and validate file references from a file"""
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
        except Exception as e:
            print(f"{YELLOW}⚠️  Could not read {file_path}: {e}{NC}")
            return
        
        in_code_block = False
        
        # Pattern for file references: /path/to/file.ext or ./path or ../path
        # Match complete file paths with extensions, not partial matches
        # Negative lookbehind/lookahead to ensure not within backticks or middle of paths
        ref_pattern = re.compile(r'(?<![`\w/.])(\./|\.\./|/)([a-zA-Z0-9_][a-zA-Z0-9_/-]*)\.(md|js|json|txt|html|css|sh|py|jsx|ts|tsx)(?![`\w/])')
        
        for line_num, line in enumerate(lines, 1):
            # Track code block state
            if line.strip().startswith('```'):
                in_code_block = not in_code_block
                continue
            
            # Skip lines in code blocks
            if in_code_block:
                continue
            
            # Find all potential references
            matches = ref_pattern.finditer(line)
            
            for match in matches:
                # Reconstruct full path from groups
                ref = match.group(1) + match.group(2) + '.' + match.group(3)
                
                self.total_references += 1
                
                # Check if should be excluded
                if self.should_exclude(line, ref):
                    self.excluded_patterns += 1
                    self.excluded_refs.append(f"{file_path}:{line_num}: {ref} (excluded pattern)")
                    continue
                
                # Resolve path relative to file location
                if ref.startswith('/'):
                    # Absolute path from repo root
                    target = self.root_dir / ref.lstrip('/')
                else:
                    # Relative path
                    target = file_path.parent / ref
                
                # Normalize path
                try:
                    target = target.resolve()
                except Exception:
                    pass
                
                # Check if target exists
                if target.exists():
                    self.valid_references += 1
                else:
                    self.broken_references += 1
                    self.broken_refs.append(f"{file_path}:{line_num}: {ref} → {target} (NOT FOUND)")
    
    def find_markdown_files(self) -> List[Path]:
        """Find all markdown files to scan"""
        md_files = []
        
        for root, dirs, files in os.walk(self.root_dir):
            # Remove excluded directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRECTORIES]
            
            for file in files:
                if file.endswith('.md'):
                    md_files.append(Path(root) / file)
        
        return md_files
    
    def run(self) -> int:
        """Run the reference checker"""
        
        print(f"{BLUE}==========================================")
        print("Enhanced Reference Checker")
        print(f"=========================================={NC}\n")
        
        print(f"{CYAN}🔍 Scanning for potential file references...{NC}\n")
        
        md_files = self.find_markdown_files()
        print(f"Found {len(md_files)} markdown files to scan\n")
        
        # Process each file
        for idx, file_path in enumerate(md_files, 1):
            if idx % 10 == 0:
                print(f"{BLUE}Processing: {idx}/{len(md_files)} files...{NC}")
            
            self.extract_references(file_path)
        
        # Print summary
        print(f"\n{BLUE}==========================================")
        print("Results Summary")
        print(f"=========================================={NC}\n")
        
        print(f"Files scanned: {len(md_files)}")
        print(f"Total references found: {self.total_references}")
        print(f"{GREEN}Valid references: {self.valid_references}{NC}")
        print(f"{YELLOW}Excluded patterns: {self.excluded_patterns}{NC}")
        print(f"{RED}Broken references: {self.broken_references}{NC}\n")
        
        # Show excluded patterns (first 10)
        if self.excluded_refs:
            print(f"{YELLOW}Excluded Patterns (False Positives):{NC}")
            for ref in self.excluded_refs[:10]:
                print(f"  {ref}")
            
            if len(self.excluded_refs) > 10:
                print(f"  ... and {len(self.excluded_refs) - 10} more\n")
        
        # Show broken references (all)
        if self.broken_refs:
            print(f"{RED}❌ Broken References Found:{NC}")
            for ref in self.broken_refs:
                print(f"  {RED}✗{NC} {ref}")
            
            print(f"\n{RED}⚠️  Found {self.broken_references} broken reference(s){NC}")
            return 1
        else:
            print(f"{GREEN}✅ All file references valid!{NC}\n")
            if self.excluded_patterns > 0:
                print(f"{BLUE}ℹ️  Note: {self.excluded_patterns} pattern(s) excluded as false positives{NC}")
            return 0


def main():
    checker = ReferenceChecker()
    exit_code = checker.run()
    sys.exit(exit_code)


if __name__ == '__main__':
    main()
