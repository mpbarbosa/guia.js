#!/usr/bin/env python3
"""
Enhanced Reference Checker with False Positive Filtering and Broken-Ref Classification
Checks for broken file references while excluding known false positive patterns.

For each broken reference, classifies it as:
  MOVED        — filename found elsewhere in the repo (fix: update the reference path)
  TRULY_MISSING — filename not found anywhere in the repo (fix: create file or remove link)

This classification prevents AI analysis tools from recommending "Create missing file"
for files that already exist at reorganized paths, which was the root cause of incorrect
recommendations in step_02 documentation consistency analysis.

Version: 2.0.0
Date: 2026-03-10
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Dict, Set, Tuple, Optional

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

# Broken reference classification labels
LABEL_MOVED = 'MOVED'
LABEL_TRULY_MISSING = 'TRULY_MISSING'


class BrokenRef:
    """Represents a single broken reference with its classification."""

    def __init__(self, source: str, line_num: int, ref: str, resolved: Path,
                 classification: str, alternative: Optional[Path] = None):
        self.source = source
        self.line_num = line_num
        self.ref = ref
        self.resolved = resolved
        self.classification = classification
        self.alternative = alternative

    def __str__(self) -> str:
        base = f"{self.source}:{self.line_num}: {self.ref} → {self.resolved} [{self.classification}]"
        if self.alternative:
            base += f"\n    → Actual location: {self.alternative}"
        return base


class ReferenceChecker:
    def __init__(self, root_dir='.'):
        self.root_dir = Path(root_dir).resolve()
        self.total_references = 0
        self.valid_references = 0
        self.excluded_patterns = 0
        self.broken_references = 0
        self.excluded_refs = []
        self.broken_refs: List[BrokenRef] = []
        # Built once after indexing all files
        self._repo_file_index: Optional[Dict[str, List[Path]]] = None

    def _build_repo_file_index(self) -> Dict[str, List[Path]]:
        """
        Index all files in the repo by their lowercased filename.
        Used for fallback search when a referenced file is not found at its exact path.
        """
        index: Dict[str, List[Path]] = {}
        for root, dirs, files in os.walk(self.root_dir):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRECTORIES]
            for fname in files:
                key = fname.lower()
                full_path = Path(root) / fname
                index.setdefault(key, []).append(full_path)
        return index

    def _find_alternative(self, filename: str) -> Optional[Path]:
        """
        Search the repo index for a file with the same name (case-insensitive).
        Returns the first match or None.
        """
        if self._repo_file_index is None:
            self._repo_file_index = self._build_repo_file_index()
        matches = self._repo_file_index.get(filename.lower(), [])
        return matches[0] if matches else None

    def _classify_broken_ref(self, target: Path) -> Tuple[str, Optional[Path]]:
        """
        Classify a broken reference as MOVED or TRULY_MISSING.
        Returns (classification, alternative_path_or_None).
        """
        alternative = self._find_alternative(target.name)
        if alternative:
            return LABEL_MOVED, alternative
        return LABEL_TRULY_MISSING, None
    
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
        """Extract and validate file references from a file.

        Detects two reference forms:
        1. Markdown links: [text](path/to/file.md) — covers bare paths like .github/CONTRIBUTING.md
        2. Bare path references: ./path, ../path, /path — for inline mentions
        """
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
        except Exception as e:
            print(f"{YELLOW}⚠️  Could not read {file_path}: {e}{NC}")
            return

        in_code_block = False

        # Pattern 1: Markdown link URL  [text](url)  — captures everything inside parens
        md_link_pattern = re.compile(r'\[(?:[^\]]*)\]\(([^)]+)\)')

        # Pattern 2: Bare path references: /path, ./path, ../path
        bare_path_pattern = re.compile(
            r'(?<![`\w/.])(\./|\.\./|/)([a-zA-Z0-9_][a-zA-Z0-9_/-]*)'
            r'\.(md|js|json|txt|html|css|sh|py|jsx|ts|tsx)(?![`\w/])'
        )

        seen_on_line: Set[str] = set()

        for line_num, line in enumerate(lines, 1):
            # Track code block state
            if line.strip().startswith('```'):
                in_code_block = not in_code_block
                continue

            if in_code_block:
                continue

            seen_on_line.clear()

            # Collect all candidate refs from both patterns
            candidates: List[str] = []

            for match in md_link_pattern.finditer(line):
                url = match.group(1).strip().split(' ')[0]  # strip optional title
                candidates.append(url)

            for match in bare_path_pattern.finditer(line):
                ref = match.group(1) + match.group(2) + '.' + match.group(3)
                candidates.append(ref)

            for ref in candidates:
                # Skip external URLs and anchors
                if self.should_exclude(line, ref):
                    self.excluded_patterns += 1
                    self.excluded_refs.append(f"{file_path}:{line_num}: {ref} (excluded pattern)")
                    continue

                # Skip anchor-only links and non-file references
                if ref.startswith('#') or '://' in ref or ref.startswith('mailto:'):
                    continue

                # Only process references to known file extensions
                file_ext = Path(ref).suffix.lower()
                if file_ext not in {'.md', '.js', '.json', '.txt', '.html',
                                    '.css', '.sh', '.py', '.jsx', '.ts', '.tsx'}:
                    continue

                # Deduplicate within same line
                if ref in seen_on_line:
                    continue
                seen_on_line.add(ref)

                self.total_references += 1

                # Resolve path relative to file location
                if ref.startswith('/'):
                    target = self.root_dir / ref.lstrip('/')
                else:
                    target = file_path.parent / ref

                try:
                    target = target.resolve()
                except Exception:
                    pass

                if target.exists():
                    self.valid_references += 1
                else:
                    classification, alternative = self._classify_broken_ref(target)
                    self.broken_references += 1
                    self.broken_refs.append(BrokenRef(
                        source=str(file_path),
                        line_num=line_num,
                        ref=ref,
                        resolved=target,
                        classification=classification,
                        alternative=alternative,
                    ))
    
    def find_markdown_files(self) -> List[Path]:
        """Find all markdown files to scan and pre-build the repo file index."""
        md_files = []

        for root, dirs, files in os.walk(self.root_dir):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRECTORIES]

            for file in files:
                if file.endswith('.md'):
                    md_files.append(Path(root) / file)

        # Pre-build index so first broken ref doesn't pay full scan cost
        self._repo_file_index = self._build_repo_file_index()

        return md_files

    def _format_docs_tree(self) -> str:
        """
        Return a compact directory tree of all .md files under docs/ and .github/.
        This summary can be embedded in AI prompts so the model can locate files
        at reorganized paths instead of assuming they are missing.
        """
        tree_lines = ["## Repository Markdown File Tree (docs/ and .github/)"]
        dirs_seen: Dict[str, List[str]] = {}

        for root, dirs, files in os.walk(self.root_dir):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRECTORIES]
            rel_root = Path(root).relative_to(self.root_dir)
            prefix = str(rel_root)
            if prefix not in ('docs', '.github') and not prefix.startswith('docs/') \
                    and not prefix.startswith('.github/'):
                continue
            md_in_dir = [f for f in files if f.endswith('.md')]
            if md_in_dir:
                dirs_seen[prefix] = sorted(md_in_dir)

        for directory in sorted(dirs_seen.keys()):
            tree_lines.append(f"\n{directory}/")
            for fname in dirs_seen[directory]:
                tree_lines.append(f"  {fname}")

        return "\n".join(tree_lines)

    def run(self) -> int:
        """Run the reference checker"""

        print(f"{BLUE}==========================================")
        print("Enhanced Reference Checker v2.0")
        print(f"=========================================={NC}\n")

        print(f"{CYAN}🔍 Scanning for potential file references...{NC}\n")

        md_files = self.find_markdown_files()
        print(f"Found {len(md_files)} markdown files to scan\n")

        for idx, file_path in enumerate(md_files, 1):
            if idx % 10 == 0:
                print(f"{BLUE}Processing: {idx}/{len(md_files)} files...{NC}")
            self.extract_references(file_path)

        # --- Summary ---
        print(f"\n{BLUE}==========================================")
        print("Results Summary")
        print(f"=========================================={NC}\n")

        print(f"Files scanned: {len(md_files)}")
        print(f"Total references found: {self.total_references}")
        print(f"{GREEN}Valid references: {self.valid_references}{NC}")
        print(f"{YELLOW}Excluded patterns: {self.excluded_patterns}{NC}")
        print(f"{RED}Broken references: {self.broken_references}{NC}\n")

        # Classify broken refs
        moved = [r for r in self.broken_refs if r.classification == LABEL_MOVED]
        truly_missing = [r for r in self.broken_refs if r.classification == LABEL_TRULY_MISSING]

        # Show excluded patterns (first 10)
        if self.excluded_refs:
            print(f"{YELLOW}Excluded Patterns (False Positives):{NC}")
            for ref in self.excluded_refs[:10]:
                print(f"  {ref}")
            if len(self.excluded_refs) > 10:
                print(f"  ... and {len(self.excluded_refs) - 10} more\n")

        # Show MOVED references — update path, not create
        if moved:
            print(f"\n{YELLOW}⚠️  MOVED References ({len(moved)}) — file exists at a different path:{NC}")
            print(f"{YELLOW}   Fix: update the reference in the source file (do NOT create a new file){NC}")
            for ref in moved:
                print(f"  {YELLOW}~{NC} {ref.source}:{ref.line_num}: {ref.ref}")
                if ref.alternative:
                    rel_alt = ref.alternative.relative_to(self.root_dir) \
                        if ref.alternative.is_relative_to(self.root_dir) else ref.alternative
                    print(f"      → Found at: {rel_alt}")

        # Show TRULY_MISSING references — create or remove
        if truly_missing:
            print(f"\n{RED}❌ TRULY_MISSING References ({len(truly_missing)}) — file not found anywhere:{NC}")
            print(f"{RED}   Fix: create the missing file or remove the broken link{NC}")
            for ref in truly_missing:
                print(f"  {RED}✗{NC} {ref.source}:{ref.line_num}: {ref.ref}")

        if self.broken_refs:
            print(f"\n{RED}⚠️  Found {self.broken_references} broken reference(s) "
                  f"({len(moved)} MOVED, {len(truly_missing)} TRULY_MISSING){NC}")

            # Emit docs tree as context for AI analysis
            print(f"\n{CYAN}---")
            print(self._format_docs_tree())
            print(f"---{NC}")
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
