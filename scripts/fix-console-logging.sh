#!/bin/bash
#
# fix-console-logging.sh
# ----------------------
# Purpose:      Replace direct console.log/warn/error calls with the project's
#               centralized logger (src/utils/logger.js) across all source files.
#
# Usage:        ./scripts/fix-console-logging.sh
#
# Arguments:    (none)
#
# Prerequisites:
#   - Run from anywhere; script resolves project root automatically via SCRIPT_DIR.
#   - Source files must exist under src/. Missing files are silently skipped.
#
# What it does:
#   1. Resolves project root from the script's own location (portable).
#   2. For each file in the hardcoded list under src/:
#      a. Adds "import { log, warn, error } from '…/utils/logger.js'" if not present.
#      b. Replaces console.log( → log(, console.warn( → warn(, console.error( → error(.
#   3. Does NOT touch test files, HTML files, or utils/logger.js itself.
#
# Output:       Prints each processed filename; final summary of file count.
#
# Exit codes:
#   0  All replacements completed successfully.
#   1  Unexpected error (set -e triggered).
#
# Related modules: src/utils/logger.js
# See also:        scripts/README.md

set -e

# Portable path resolution - works across all environments
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT/src"

# List of files to process (excluding test files, HTML, and logger.js itself)
FILES=(
  "views/home.js"
  "views/converter.js"
  "coordination/WebGeocodingManager.js"
  "coordination/ServiceCoordinator.js"
  "coordination/EventCoordinator.js"
  "coordination/UICoordinator.js"
  "coordination/SpeechCoordinator.js"
  "core/PositionManager.js"
  "core/GeoPosition.js"
  "core/GeocodingState.js"
  "core/ObserverSubject.js"
  "services/GeolocationService.js"
  "services/ReverseGeocoder.js"
  "services/ChangeDetectionCoordinator.js"
  "services/providers/GeolocationProvider.js"
  "html/HTMLPositionDisplayer.js"
  "html/HTMLAddressDisplayer.js"
  "html/HTMLReferencePlaceDisplayer.js"
  "html/HTMLHighlightCardsDisplayer.js"
  "html/HTMLSidraDisplayer.js"
  "html/HtmlText.js"
  "html/HtmlSpeechSynthesisDisplayer.js"
  "html/DisplayerFactory.js"
  "data/AddressCache.js"
  "data/LRUCache.js"
  "data/ReferencePlace.js"
  "speech/SpeechSynthesisManager.js"
  "speech/SpeechQueue.js"
  "speech/SpeechQueueProcessor.js"
  "speech/SpeechItem.js"
  "speech/SpeechController.js"
  "speech/VoiceManager.js"
  "speech/SpeechConfiguration.js"
  "timing/Chronometer.js"
  "status/SingletonStatusManager.js"
  "utils/TimerManager.js"
  "utils/device.js"
  "utils/distance.js"
  "error-recovery.js"
  "config/defaults.js"
  "guia.js"
)

echo "Processing ${#FILES[@]} files..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Check if file already imports logger
    if ! grep -q "import.*logger\.js" "$file"; then
      # Check if file has other imports to add after
      if grep -q "^import " "$file"; then
        # Add after last import
        sed -i "/^import .*/a import { log, warn, error } from './utils/logger.js';" "$file" 2>/dev/null || {
          # Try alternative path for nested files
          DEPTH=$(echo "$file" | tr -cd '/' | wc -c)
          PREFIX=$(printf '../%.0s' $(seq 1 $DEPTH))
          sed -i "/^import .*/a import { log, warn, error } from '${PREFIX}utils/logger.js';" "$file"
        }
      else
        # Add at top after 'use strict' if present
        if grep -q "'use strict'" "$file"; then
          sed -i "/'use strict';/a\\
import { log, warn, error } from './utils/logger.js';" "$file" 2>/dev/null || {
            DEPTH=$(echo "$file" | tr -cd '/' | wc -c)
            PREFIX=$(printf '../%.0s' $(seq 1 $DEPTH))
            sed -i "/'use strict';/a\\
import { log, warn, error } from '${PREFIX}utils/logger.js';" "$file"
          }
        fi
      fi
    fi
    
    # Replace console calls
    sed -i 's/console\.log(/log(/g; s/console\.warn(/warn(/g; s/console\.error(/error(/g' "$file"
  fi
done

echo "✓ Console logging fixes complete"
echo "Files processed: ${#FILES[@]}"
