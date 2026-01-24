#!/bin/bash
# Fix console logging violations by replacing with centralized logger
set -e

cd /home/mpb/Documents/GitHub/guia_turistico/src

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
