#!/bin/bash
# cleanup-ai-workflow.sh
#
# Removes old .ai_workflow/ artifact directories (logs, prompts, summaries)
# and local build/test caches (.jest-cache, .pytest_cache, coverage/).
#
# Usage:
#   ./scripts/cleanup-ai-workflow.sh [--days N] [--dry-run]
#
# Options:
#   --days N     Delete workflow runs older than N days (default: 30)
#   --dry-run    Print what would be deleted without deleting anything
#   -h, --help   Show this help message
#
# Exit codes:
#   0  Completed (dry-run or actual cleanup)
#   1  Must be run from project root

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# ── Defaults ────────────────────────────────────────────────────────────────
DAYS=30
DRY_RUN=false

# ── Argument parsing ─────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --days)
      DAYS="$2"; shift 2 ;;
    --dry-run)
      DRY_RUN=true; shift ;;
    -h|--help)
      sed -n '2,14p' "$0" | sed 's/^# \?//'
      exit 0 ;;
    *)
      echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

# ── Sanity check ─────────────────────────────────────────────────────────────
if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
  echo "Error: must be run from the project root (or via npm run cleanup:ai-workflow)" >&2
  exit 1
fi
cd "$PROJECT_ROOT"

# ── Helpers ──────────────────────────────────────────────────────────────────
DELETED=0
BYTES=0

delete() {
  local target="$1"
  local size
  size=$(du -sk "$target" 2>/dev/null | cut -f1 || echo 0)
  if $DRY_RUN; then
    echo "  [dry-run] would remove: $target  (${size} KB)"
  else
    rm -rf "$target"
    echo "  ✓ removed: $target  (${size} KB)"
  fi
  DELETED=$((DELETED + 1))
  BYTES=$((BYTES + size))
}

# ── Phase 1: old .ai_workflow/ run directories ────────────────────────────────
echo ""
echo "=== .ai_workflow/ run directories older than ${DAYS} days ==="

for subdir in logs prompts summaries; do
  dir=".ai_workflow/$subdir"
  [[ -d "$dir" ]] || continue
  while IFS= read -r -d '' entry; do
    delete "$entry"
  done < <(find "$dir" -mindepth 1 -maxdepth 1 \( -type d -o -type f \) \
            -name 'workflow_*' -mtime "+${DAYS}" -print0 2>/dev/null)
done

# ── Phase 2: local build/test caches ─────────────────────────────────────────
echo ""
echo "=== Local build/test caches ==="

for cache in .jest-cache .pytest_cache coverage __pycache__; do
  if [[ -d "$cache" ]]; then
    delete "$cache"
  fi
done

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
if $DRY_RUN; then
  echo "Dry-run complete: $DELETED item(s) would be removed (~${BYTES} KB)."
  echo "Re-run without --dry-run to apply."
else
  echo "Cleanup complete: $DELETED item(s) removed (~${BYTES} KB freed)."
fi
