# Tutorial: Integrating Speech Synthesis

**Version**: 0.9.0-alpha  
**Last Updated**: 2026-02-12  
**Difficulty**: Intermediate  
**Time**: 30 minutes

---

## Overview

This tutorial shows you how to integrate text-to-speech functionality into your Guia Turístico application using the **SpeechSynthesisManager** API. You'll learn how to:

- Initialize the speech synthesis system
- Configure voice parameters (rate, pitch)
- Implement priority-based speech queuing
- Handle voice loading across different browsers
- Create a complete speech-enabled feature

---

## Prerequisites

Before starting this tutorial, you should have:

- ✅ Node.js v18+ installed
- ✅ Guia Turístico project set up (`npm install` completed)
- ✅ Basic JavaScript knowledge (async/await, promises)
- ✅ Understanding of browser Web Speech API
- ✅ Modern browser (Chrome 94+, Firefox 93+, Safari 15+)

---

## Part 1: Basic Setup (5 minutes)

### Step 1: Import the Speech Manager

Create a new file `src/features/speech-announcer.js`:

```javascript
'use strict';

import SpeechSynthesisManager from '../speech/SpeechSynthesisManager.js';

/**
 * Simple speech announcer for location updates.
 */
class SpeechAnnouncer {
  constructor() {
    // Initialize speech manager
    this.speechManager = new SpeechSynthesisManager(false); // No logging
    
    // Wait for voices to load
    this.ready = this.initialize();
  }
  
  async initialize() {
    try {
      // Load available voices
      const voices = await this.speechManager.loadVoices();
      console.log(`Loaded ${voices.length} voices`);
      
      // Configure speech parameters
      this.speechManager.setRate(1.0);   // Normal speed
      this.speechManager.setPitch(1.0);  // Normal pitch
      
      return true;
    } catch (error) {
      console.error('Failed to initialize speech:', error);
      return false;
    }
  }
  
  /**
   * Announce a message with default priority.
   */
  announce(text) {
    this.speechManager.speak(text, 0);
  }
  
  /**
   * Announce an urgent message with high priority.
   */
  announceUrgent(text) {
    this.speechManager.speak(text, 10);
  }
  
  /**
   * Cleanup resources.
   */
  cleanup() {
    this.speechManager.cleanup();
  }
}

export default SpeechAnnouncer;
```

### Step 2: Test Your Setup

Create a test file `examples/speech-test.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Speech Test</title>
</head>
<body>
  <h1>Teste de Síntese de Voz</h1>
  <button id="testBtn">Testar Voz</button>
  
  <script type="module">
    import SpeechAnnouncer from '../src/features/speech-announcer.js';
    
    const announcer = new SpeechAnnouncer();
    
    // Wait for initialization
    await announcer.ready;
    
    document.getElementById('testBtn').addEventListener('click', () => {
      announcer.announce('Olá! Sistema de voz funcionando.');
    });
  </script>
</body>
</html>
```

### Step 3: Run the Test

```bash
# Start development server
npm run dev

# Open in browser
# http://localhost:9000/examples/speech-test.html
```

**Expected Result**: Clicking the button speaks "Olá! Sistema de voz funcionando."

---

## Part 2: Voice Configuration (10 minutes)

### Step 1: Add Voice Information Display

Enhance `speech-announcer.js` to show voice information:

```javascript
/**
 * Get information about the selected voice.
 */
getVoiceInfo() {
  const voice = this.speechManager.getSelectedVoice();
  
  if (!voice) {
    return { available: false };
  }
  
  return {
    available: true,
    name: voice.name,
    language: voice.lang,
    isLocal: voice.localService,
    isDefault: voice.default
  };
}

/**
 * List all available voices.
 */
listVoices() {
  return this.speechManager.getVoices().map(voice => ({
    name: voice.name,
    lang: voice.lang,
    local: voice.localService,
    default: voice.default
  }));
}
```

### Step 2: Create Voice Selection UI

Update `examples/speech-test.html`:

```html
<body>
  <h1>Teste de Síntese de Voz</h1>
  
  <div>
    <h2>Voz Selecionada</h2>
    <div id="voiceInfo">Carregando...</div>
  </div>
  
  <div>
    <h2>Vozes Disponíveis</h2>
    <ul id="voiceList"></ul>
  </div>
  
  <div>
    <h2>Teste</h2>
    <button id="testBtn">Testar Voz</button>
  </div>
  
  <script type="module">
    import SpeechAnnouncer from '../src/features/speech-announcer.js';
    
    const announcer = new SpeechAnnouncer();
    await announcer.ready;
    
    // Display selected voice
    const voiceInfo = announcer.getVoiceInfo();
    document.getElementById('voiceInfo').innerHTML = `
      <strong>${voiceInfo.name}</strong><br>
      Idioma: ${voiceInfo.language}<br>
      Local: ${voiceInfo.isLocal ? 'Sim' : 'Não'}
    `;
    
    // List all voices
    const voiceList = document.getElementById('voiceList');
    announcer.listVoices().forEach(voice => {
      const li = document.createElement('li');
      li.textContent = `${voice.name} (${voice.lang})`;
      if (voice.default) li.textContent += ' [Padrão]';
      voiceList.appendChild(li);
    });
    
    // Test button
    document.getElementById('testBtn').addEventListener('click', () => {
      announcer.announce('Esta é a voz selecionada.');
    });
  </script>
</body>
```

---

## Part 3: Priority-Based Announcements (10 minutes)

### Step 1: Add Priority Levels

Enhance `speech-announcer.js` with priority constants:

```javascript
/**
 * Priority levels for speech announcements.
 */
export const SpeechPriority = {
  LOW: -5,
  NORMAL: 0,
  HIGH: 5,
  URGENT: 10,
  CRITICAL: 20
};

class SpeechAnnouncer {
  // ... previous code ...
  
  /**
   * Announce with specific priority.
   */
  announceWithPriority(text, priority = SpeechPriority.NORMAL) {
    this.speechManager.speak(text, priority);
  }
}
```

### Step 2: Create Priority Test UI

Add to `examples/speech-test.html`:

```html
<div>
  <h2>Teste de Prioridades</h2>
  <button id="lowPriority">Prioridade Baixa (-5)</button>
  <button id="normalPriority">Prioridade Normal (0)</button>
  <button id="highPriority">Prioridade Alta (5)</button>
  <button id="urgentPriority">Prioridade Urgente (10)</button>
</div>

<script type="module">
  import SpeechAnnouncer, { SpeechPriority } from '../src/features/speech-announcer.js';
  
  const announcer = new SpeechAnnouncer();
  await announcer.ready;
  
  // Queue multiple messages with different priorities
  document.getElementById('lowPriority').addEventListener('click', () => {
    announcer.announceWithPriority('Mensagem de prioridade baixa', SpeechPriority.LOW);
  });
  
  document.getElementById('normalPriority').addEventListener('click', () => {
    announcer.announceWithPriority('Mensagem de prioridade normal', SpeechPriority.NORMAL);
  });
  
  document.getElementById('highPriority').addEventListener('click', () => {
    announcer.announceWithPriority('Mensagem de prioridade alta', SpeechPriority.HIGH);
  });
  
  document.getElementById('urgentPriority').addEventListener('click', () => {
    announcer.announceWithPriority('Mensagem urgente!', SpeechPriority.URGENT);
  });
  
  // Test priority ordering
  document.getElementById('testAll').addEventListener('click', () => {
    // Add in reverse order - priority determines speech order
    announcer.announceWithPriority('Quarta: Prioridade baixa', SpeechPriority.LOW);
    announcer.announceWithPriority('Segunda: Prioridade alta', SpeechPriority.HIGH);
    announcer.announceWithPriority('Terceira: Prioridade normal', SpeechPriority.NORMAL);
    announcer.announceWithPriority('Primeira: Urgente!', SpeechPriority.URGENT);
  });
</script>
```

**Expected Behavior**: Messages speak in priority order, not insertion order.

---

## Part 4: Location Announcement Integration (10 minutes)

### Step 1: Create Location Announcer

Create `src/features/location-announcer.js`:

```javascript
'use strict';

import SpeechAnnouncer, { SpeechPriority } from './speech-announcer.js';
import { PositionManager } from '../core/PositionManager.js';

/**
 * Announces location changes using speech synthesis.
 */
class LocationAnnouncer {
  constructor() {
    this.speechAnnouncer = new SpeechAnnouncer();
    this.positionManager = PositionManager.getInstance();
    this.lastAnnouncedAddress = null;
    
    // Wait for speech initialization
    this.ready = this.speechAnnouncer.ready;
  }
  
  /**
   * Announce current location.
   */
  announceCurrentLocation() {
    const position = this.positionManager.getPosition();
    
    if (!position) {
      this.speechAnnouncer.announce('Localização não disponível');
      return;
    }
    
    const text = `Você está em latitude ${position.latitude.toFixed(4)}, longitude ${position.longitude.toFixed(4)}`;
    this.speechAnnouncer.announce(text);
  }
  
  /**
   * Announce address change.
   */
  announceAddressChange(addressData) {
    // Avoid repeating the same address
    if (this.lastAnnouncedAddress === addressData.display_name) {
      return;
    }
    
    this.lastAnnouncedAddress = addressData.display_name;
    
    // Format announcement
    const parts = [];
    
    if (addressData.address.road) {
      parts.push(addressData.address.road);
    }
    
    if (addressData.address.suburb) {
      parts.push(`bairro ${addressData.address.suburb}`);
    }
    
    if (addressData.address.city) {
      parts.push(addressData.address.city);
    }
    
    const text = `Você está em ${parts.join(', ')}`;
    this.speechAnnouncer.announceWithPriority(text, SpeechPriority.HIGH);
  }
  
  /**
   * Announce nearby landmark.
   */
  announceLandmark(landmarkName) {
    const text = `Próximo a ${landmarkName}`;
    this.speechAnnouncer.announceWithPriority(text, SpeechPriority.NORMAL);
  }
  
  /**
   * Cleanup resources.
   */
  cleanup() {
    this.speechAnnouncer.cleanup();
  }
}

export default LocationAnnouncer;
```

### Step 2: Integrate with Home View

In `src/views/home.js`, add speech announcements:

```javascript
import LocationAnnouncer from '../features/location-announcer.js';

class HomeView {
  constructor() {
    // ... existing code ...
    
    // Initialize location announcer
    this.locationAnnouncer = new LocationAnnouncer();
    
    // Wait for initialization
    this.locationAnnouncer.ready.then(() => {
      console.log('Speech announcer ready');
    });
  }
  
  // ... existing methods ...
  
  /**
   * Handle address update with speech announcement.
   */
  onAddressUpdate(addressData) {
    // Update UI (existing code)
    this.updateAddressDisplay(addressData);
    
    // Announce address change
    this.locationAnnouncer.announceAddressChange(addressData);
  }
  
  /**
   * Handle landmark detection with speech announcement.
   */
  onLandmarkDetected(landmark) {
    // Update UI (existing code)
    this.updateLandmarkDisplay(landmark);
    
    // Announce landmark
    this.locationAnnouncer.announceLandmark(landmark.name);
  }
}
```

---

## Part 5: Advanced Features (5 minutes)

### Rate and Pitch Control

Add adjustable speech parameters:

```javascript
class SpeechAnnouncer {
  // ... previous code ...
  
  /**
   * Set speech speed (0.1 - 10.0).
   */
  setSpeed(speed) {
    this.speechManager.setRate(speed);
  }
  
  /**
   * Set speech pitch (0.0 - 2.0).
   */
  setPitch(pitch) {
    this.speechManager.setPitch(pitch);
  }
  
  /**
   * Reset to default parameters.
   */
  resetParameters() {
    this.speechManager.setRate(1.0);
    this.speechManager.setPitch(1.0);
  }
}
```

### Playback Control

Add pause/resume/stop controls:

```javascript
class SpeechAnnouncer {
  // ... previous code ...
  
  /**
   * Pause current speech.
   */
  pause() {
    this.speechManager.pause();
  }
  
  /**
   * Resume paused speech.
   */
  resume() {
    this.speechManager.resume();
  }
  
  /**
   * Stop all speech and clear queue.
   */
  stop() {
    this.speechManager.stop();
  }
}
```

---

## Testing Your Implementation

### Manual Testing Checklist

- [ ] Speech announces on button click
- [ ] Correct voice is selected (Brazilian Portuguese preferred)
- [ ] Priority ordering works correctly
- [ ] Address changes are announced
- [ ] Landmarks are announced
- [ ] Rate/pitch adjustments work
- [ ] Pause/resume/stop controls work
- [ ] No memory leaks after cleanup

### Automated Testing

Create `__tests__/features/speech-announcer.test.js`:

```javascript
import SpeechAnnouncer from '../../src/features/speech-announcer.js';

describe('SpeechAnnouncer', () => {
  let announcer;
  
  beforeEach(() => {
    // Mock Web Speech API
    global.window = {
      speechSynthesis: {
        speak: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        cancel: jest.fn(),
        getVoices: jest.fn(() => [
          { name: 'Google português do Brasil', lang: 'pt-BR', localService: true }
        ])
      }
    };
    
    announcer = new SpeechAnnouncer();
  });
  
  test('should initialize successfully', async () => {
    const ready = await announcer.ready;
    expect(ready).toBe(true);
  });
  
  test('should announce message', () => {
    announcer.announce('Test message');
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });
  
  // ... more tests ...
});
```

---

## Troubleshooting

### Common Issues

**Issue**: No voice output
- **Solution**: Check browser supports Web Speech API
- **Check**: `window.speechSynthesis` is defined
- **Verify**: Volume is not muted

**Issue**: Wrong language voice selected
- **Solution**: Brazilian Portuguese voice may not be available
- **Check**: Run `speechSynthesis.getVoices()` in console
- **Install**: Additional voices from OS settings

**Issue**: Announcements cut off
- **Solution**: Check queue size limits
- **Adjust**: Increase priority for important messages

**Issue**: Memory leaks
- **Solution**: Always call `cleanup()` before destroying
- **Use**: `beforeunload` event listener

---

## Best Practices

1. **Always Initialize Async**
   ```javascript
   const announcer = new SpeechAnnouncer();
   await announcer.ready; // Wait before using
   ```

2. **Use Priority Appropriately**
   ```javascript
   // Don't overuse URGENT priority
   announcer.announceWithPriority(text, SpeechPriority.NORMAL);
   ```

3. **Cleanup Resources**
   ```javascript
   window.addEventListener('beforeunload', () => {
     announcer.cleanup();
   });
   ```

4. **Handle Missing Voices Gracefully**
   ```javascript
   const voiceInfo = announcer.getVoiceInfo();
   if (!voiceInfo.available) {
     console.warn('Speech synthesis unavailable');
   }
   ```

---

## Next Steps

- **Tutorial**: [Custom Address Display](./TUTORIAL_CUSTOM_DISPLAYER.md)
- **API Reference**: [SpeechSynthesisManager](../api/SPEECH_SYNTHESIS_MANAGER.md)
- **Architecture**: [Speech Synthesis Architecture](../architecture/SPEECH_SYNTHESIS.md)

---

## Complete Example

See `examples/complete-speech-integration/` for a full working implementation.

---

**Navigation**: [Tutorials](../INDEX.md#tutorials) | [Developer Guide](../developer/DEVELOPER_GUIDE.md) | [API Reference](../api/README.md)
