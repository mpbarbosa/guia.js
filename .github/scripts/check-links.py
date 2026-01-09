#!/usr/bin/env python3
"""
Documentation Link Checker
Verifies all markdown internal links are valid
"""

import os
import re
import sys
from pathlib import Path

def find_markdown_files(root_dir='.'):
    """Find all markdown files"""
    exclude_dirs = {'node_modules', '.git', '.ai_workflow', 'coverage'}
    md_files = []
    
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file.endswith('.md'):
                md_files.append(os.path.join(root, file))
    
    return md_files

def check_links(md_files):
    """Check all internal markdown links"""
    link_pattern = re.compile(r'\[([^\]]+)\]\(([^\)]+\.md[^\)]*)\)')
    broken = []
    total = 0
    
    for md_file in md_files:
        with open(md_file, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
        
        for line_num, line in enumerate(lines, 1):
            matches = link_pattern.findall(line)
            for text, link in matches:
                # Skip external links and anchors
                if link.startswith(('http://', 'https://', '#')):
                    continue
                
                total += 1
                
                # Remove anchor
                link_path = link.split('#')[0]
                
                # Resolve path
                source_dir = os.path.dirname(md_file)
                target_path = os.path.normpath(os.path.join(source_dir, link_path))
                
                # Check existence
                if not os.path.exists(target_path):
                    broken.append({
                        'source': md_file,
                        'line': line_num,
                        'link': link_path,
                        'target': target_path
                    })
    
    return broken, total

def main():
    print("Checking documentation links...\n")
    
    md_files = find_markdown_files()
    print(f"Scanning {len(md_files)} markdown files")
    
    broken, total = check_links(md_files)
    
    print(f"\nResults:")
    print(f"  Total links: {total}")
    print(f"  Valid: {total - len(broken)}")
    print(f"  Broken: {len(broken)}")
    print(f"  Success rate: {((total - len(broken)) / total * 100) if total > 0 else 0:.1f}%\n")
    
    if broken:
        print(f"❌ Found {len(broken)} broken link(s):\n")
        for item in broken[:10]:  # Show first 10
            print(f"  {item['source']}:{item['line']}")
            print(f"    Link: {item['link']}")
            print(f"    Target: {item['target']}\n")
        
        if len(broken) > 10:
            print(f"  ... and {len(broken) - 10} more")
            print(f"\nSee .github/CROSS_REFERENCE_AUDIT.md for full report\n")
        
        sys.exit(1)
    else:
        print("✅ All documentation links valid!")
        sys.exit(0)

if __name__ == '__main__':
    main()
