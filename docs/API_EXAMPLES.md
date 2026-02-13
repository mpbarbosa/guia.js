# Guia Turístico API Examples

**Version:** 0.9.0-alpha  
**Last Updated:** 2026-02-11

Comprehensive code examples for all major API features.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Geolocation Examples](#geolocation-examples)
3. [Address Processing Examples](#address-processing-examples)
4. [Display Examples](#display-examples)
5. [Speech Synthesis Examples](#speech-synthesis-examples)
6. [Caching Examples](#caching-examples)
7. [Complete Workflows](#complete-workflows)

---

## Quick Start

### Basic Geolocation Setup

```javascript
import GeolocationService from './src/services/GeolocationService.js';
import PositionManager from './src/core/PositionManager.js';

// Initialize services
const service = new GeolocationService();
const manager = PositionManager.getInstance();

// Start watching position
const watchId = service.watchPosition(
  (position) => {
    manager.updatePosition(
      position.coords.latitude,
      position.coords.longitude
    );
  },
  (error) => {
    console.error('Geolocation error:', error.message);
  },
  {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  }
);
```

---

## Geolocation Examples

### Example 1: Watch Position with Change Detection

```javascript
import GeolocationService from './src/services/GeolocationService.js';
import PositionManager from './src/core/PositionManager.js';
import { MINIMUM_DISTANCE_CHANGE } from './src/config/defaults.js';

const service = new GeolocationService();
const manager = PositionManager.getInstance();

service.watchPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    
    // Update position
    const newPos = manager.updatePosition(latitude, longitude);
    
    // Check if significant movement occurred
    const distance = manager.getDistanceFromPrevious();
    if (distance > MINIMUM_DISTANCE_CHANGE) {
      console.log(`Moved ${distance.toFixed(2)} meters`);
      // Trigger address update
    }
  },
  (error) => {
    console.error('Position error:', error);
  }
);
```

### Example 2: Mock Geolocation for Testing

```javascript
import GeolocationService from './src/services/GeolocationService.js';
import MockGeolocationProvider from './src/services/providers/MockGeolocationProvider.js';

// Create mock provider with test coordinates
const mockProvider = new MockGeolocationProvider({
  latitude: -23.550520,
  longitude: -46.633309
});

// Use mock provider
const service = new GeolocationService(mockProvider);

// Simulate position updates
service.watchPosition((position) => {
  console.log('Mock position:', position.coords);
});

// Update mock position
mockProvider.setPosition(-22.906847, -43.172896);
```

### Example 3: Get Current Position Once

```javascript
import GeolocationService from './src/services/GeolocationService.js';

const service = new GeolocationService();

service.getCurrentPosition(
  (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    console.log(`
      Position: ${latitude}, ${longitude}
      Accuracy: ${accuracy} meters
      Timestamp: ${new Date(position.timestamp)}
    `);
  },
  (error) => {
    console.error('Failed to get position:', error.message);
  }
);
```

---

## Address Processing Examples

### Example 4: Fetch and Display Address

```javascript
import ReverseGeocoder from './src/services/ReverseGeocoder.js';
import BrazilianStandardAddress from './src/data/BrazilianStandardAddress.js';

async function fetchAddress(latitude, longitude) {
  try {
    // Create geocoder
    const geocoder = new ReverseGeocoder(latitude, longitude);
    
    // Fetch address data
    const nominatimData = await geocoder.fetchAddress();
    
    // Create standardized address
    const address = new BrazilianStandardAddress();
    address.setFromNominatim(nominatimData);
    
    // Display address information
    console.log('Complete Address:', address.toString());
    console.log('Municipality:', address.municipioCompleto());
    console.log('Neighborhood:', address.bairro);
    
    // Display metropolitan region (v0.9.0-alpha+)
    if (address.regiaoMetropolitana) {
      console.log('Metro Region:', address.regiaoMetropolitanaFormatada());
    }
    
    return address;
  } catch (error) {
    console.error('Address fetch failed:', error);
    throw error;
  }
}

// Usage
fetchAddress(-23.550520, -46.633309);
```

### Example 5: Address Change Detection

```javascript
import AddressCache from './src/data/AddressCache.js';

const cache = new AddressCache(100);

// Register callbacks for field changes
const neighborhoodCallbackId = cache.registerCallback('bairro', (current, previous) => {
  if (previous && current !== previous) {
    console.log(`Você saiu de ${previous}`);
    console.log(`Você entrou em ${current}`);
  }
});

const municipalityCallbackId = cache.registerCallback('municipio', (current, previous) => {
  if (previous && current !== previous) {
    console.log(`Cidade mudou: ${previous} → ${current}`);
  }
});

// Store addresses (callbacks will trigger on changes)
cache.set('pos1', { bairro: 'Centro', municipio: 'São Paulo' });
cache.set('pos2', { bairro: 'Bela Vista', municipio: 'São Paulo' }); // Triggers bairro change
cache.set('pos3', { bairro: 'Copacabana', municipio: 'Rio de Janeiro' }); // Triggers both

// Cleanup
cache.unregisterCallback('bairro', neighborhoodCallbackId);
cache.unregisterCallback('municipio', municipalityCallbackId);
```

### Example 6: Address Data Extraction

```javascript
import AddressDataExtractor from './src/data/AddressDataExtractor.js';
import ReverseGeocoder from './src/services/ReverseGeocoder.js';

async function extractCompleteAddressData(latitude, longitude) {
  // Fetch raw data
  const geocoder = new ReverseGeocoder(latitude, longitude);
  const nominatimData = await geocoder.fetchAddress();
  
  // Extract structured data
  const extractor = new AddressDataExtractor();
  const addressData = extractor.extract(nominatimData);
  
  console.log('Extracted Data:', {
    street: addressData.logradouro,
    neighborhood: addressData.bairro,
    city: addressData.municipio,
    state: addressData.uf,
    postalCode: addressData.cep,
    metroRegion: addressData.regiaoMetropolitana
  });
  
  return addressData;
}
```

---

## Display Examples

### Example 7: Display Position with Map Link

```javascript
import HTMLPositionDisplayer from './src/html/HTMLPositionDisplayer.js';
import GeoPosition from './src/core/GeoPosition.js';

// Create displayer
const displayer = new HTMLPositionDisplayer(document, 'position-container');

// Create position
const position = new GeoPosition(-23.550520, -46.633309);

// Display (includes Google Maps link)
displayer.display(position);

// HTML output will include:
// - Coordinates
// - Google Maps link
// - Formatted timestamp
```

### Example 8: Display Address with Highlight Cards

```javascript
import HTMLAddressDisplayer from './src/html/HTMLAddressDisplayer.js';
import HTMLHighlightCardsDisplayer from './src/html/HTMLHighlightCardsDisplayer.js';
import BrazilianStandardAddress from './src/data/BrazilianStandardAddress.js';

// Create displayers
const addressDisplayer = new HTMLAddressDisplayer(document, 'address-container');
const cardsDisplayer = new HTMLHighlightCardsDisplayer(document, 'cards-container');

// Create address
const address = new BrazilianStandardAddress();
address.logradouro = 'Avenida Paulista';
address.numero = '1578';
address.bairro = 'Bela Vista';
address.municipio = 'São Paulo';
address.uf = 'SP';
address.cep = '01310-100';

// Display both
addressDisplayer.display(address);
cardsDisplayer.display(address); // Shows municipality and neighborhood cards
```

### Example 9: Display Population Statistics

```javascript
import HTMLSidraDisplayer from './src/html/HTMLSidraDisplayer.js';

// Create SIDRA displayer
const sidraDisplayer = new HTMLSidraDisplayer(document, 'stats-container');

// Display population stats for municipality
sidraDisplayer.display('Recife', 'PE');

// Automatically fetches from IBGE SIDRA API
// Falls back to offline data if network fails
// Output: "População estimada: 1.537.704 habitantes (2021)"
```

### Example 10: Using DisplayerFactory

```javascript
import DisplayerFactory from './src/html/DisplayerFactory.js';

const factory = new DisplayerFactory();

// Create all displayers at once
const displayers = {
  position: factory.createPositionDisplayer(document, 'position'),
  address: factory.createAddressDisplayer(document, 'address'),
  cards: factory.createHighlightCardsDisplayer(document, 'cards'),
  stats: factory.createSidraDisplayer(document, 'stats'),
  reference: factory.createReferencePlaceDisplayer(document, 'reference')
};

// Use displayers
displayers.position.display(position);
displayers.address.display(address);
displayers.cards.display(address);
displayers.stats.display(address.municipio, address.uf);
```

---

## Speech Synthesis Examples

### Example 11: Basic Speech Output

```javascript
import SpeechSynthesisManager from './src/speech/SpeechSynthesisManager.js';

const manager = SpeechSynthesisManager.getInstance();

// Speak text
manager.speak('Você está em São Paulo, Bela Vista');

// Speak with high priority (interrupts current speech)
manager.speak('Atenção: virada à direita em 100 metros', 'high');
```

### Example 12: Configure Speech Parameters

```javascript
import SpeechSynthesisManager from './src/speech/SpeechSynthesisManager.js';

const manager = SpeechSynthesisManager.getInstance();

// Set speech rate (0.1 to 10.0)
manager.setRate(1.2); // 20% faster

// Set pitch (0.0 to 2.0)
manager.setPitch(1.0); // Normal pitch

// Speak with new settings
manager.speak('Testando velocidade e tom da voz');
```

### Example 13: Speech Controls

```javascript
import SpeechSynthesisManager from './src/speech/SpeechSynthesisManager.js';

const manager = SpeechSynthesisManager.getInstance();

// Start speaking
manager.speak('Esta é uma mensagem longa que pode ser pausada ou interrompida');

// Pause after 2 seconds
setTimeout(() => {
  manager.pause();
  console.log('Paused');
}, 2000);

// Resume after 4 seconds
setTimeout(() => {
  manager.resume();
  console.log('Resumed');
}, 4000);

// Stop completely after 6 seconds
setTimeout(() => {
  manager.stop();
  console.log('Stopped');
}, 6000);
```

### Example 14: Voice Selection

```javascript
import VoiceLoader from './src/speech/VoiceLoader.js';
import VoiceSelector from './src/speech/VoiceSelector.js';

async function selectBestVoice() {
  // Load voices
  const loader = new VoiceLoader();
  const voices = await loader.loadVoices();
  
  // Select best Brazilian Portuguese voice
  const selector = new VoiceSelector();
  const bestVoice = selector.selectVoice(voices);
  
  if (bestVoice) {
    console.log('Selected voice:', bestVoice.name);
    console.log('Language:', bestVoice.lang);
    console.log('Local:', bestVoice.localService);
  } else {
    console.warn('No voices available');
  }
  
  return bestVoice;
}
```

---

## Caching Examples

### Example 15: LRU Cache with Eviction

```javascript
import AddressCache from './src/data/AddressCache.js';

// Create cache with max 3 entries
const cache = new AddressCache(3);

// Add entries
cache.set('key1', { bairro: 'Centro', municipio: 'São Paulo' });
cache.set('key2', { bairro: 'Bela Vista', municipio: 'São Paulo' });
cache.set('key3', { bairro: 'Copacabana', municipio: 'Rio' });

console.log('Cache size:', cache.size); // 3

// Add 4th entry - evicts key1 (least recently used)
cache.set('key4', { bairro: 'Ipanema', municipio: 'Rio' });

console.log('Cache size:', cache.size); // 3
console.log('Has key1:', cache.has('key1')); // false (evicted)
console.log('Has key4:', cache.has('key4')); // true
```

### Example 16: Cache with Callbacks

```javascript
import AddressCache from './src/data/AddressCache.js';

const cache = new AddressCache();

// Track neighborhood changes
let neighborhoodChanges = [];

cache.registerCallback('bairro', (current, previous) => {
  neighborhoodChanges.push({ from: previous, to: current });
  console.log(`Neighborhood: ${previous || 'none'} → ${current}`);
});

// Simulate movement
cache.set('pos1', { bairro: 'Centro' });
cache.set('pos2', { bairro: 'Bela Vista' });
cache.set('pos3', { bairro: 'Jardins' });

console.log('Total changes:', neighborhoodChanges.length); // 2
console.log('Change history:', neighborhoodChanges);
```

---

## Complete Workflows

### Example 17: Complete Geolocation Workflow

```javascript
import GeolocationService from './src/services/GeolocationService.js';
import PositionManager from './src/core/PositionManager.js';
import ReverseGeocoder from './src/services/ReverseGeocoder.js';
import BrazilianStandardAddress from './src/data/BrazilianStandardAddress.js';
import HTMLPositionDisplayer from './src/html/HTMLPositionDisplayer.js';
import HTMLAddressDisplayer from './src/html/HTMLAddressDisplayer.js';
import SpeechSynthesisManager from './src/speech/SpeechSynthesisManager.js';

class GuiaTuristico {
  constructor() {
    this.service = new GeolocationService();
    this.manager = PositionManager.getInstance();
    this.positionDisplayer = new HTMLPositionDisplayer(document, 'position');
    this.addressDisplayer = new HTMLAddressDisplayer(document, 'address');
    this.speech = SpeechSynthesisManager.getInstance();
    this.watchId = null;
  }

  start() {
    this.watchId = this.service.watchPosition(
      (position) => this.handlePosition(position),
      (error) => this.handleError(error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }

  async handlePosition(position) {
    const { latitude, longitude } = position.coords;
    
    // Update position
    const geoPos = this.manager.updatePosition(latitude, longitude);
    this.positionDisplayer.display(geoPos);
    
    // Check if significant movement
    const distance = this.manager.getDistanceFromPrevious();
    if (distance > 20) {
      await this.updateAddress(latitude, longitude);
    }
  }

  async updateAddress(latitude, longitude) {
    try {
      // Fetch address
      const geocoder = new ReverseGeocoder(latitude, longitude);
      const data = await geocoder.fetchAddress();
      
      // Standardize
      const address = new BrazilianStandardAddress();
      address.setFromNominatim(data);
      
      // Display
      this.addressDisplayer.display(address);
      
      // Speak
      this.speech.speak(
        `Você está em ${address.bairro}, ${address.municipio}`
      );
    } catch (error) {
      console.error('Address update failed:', error);
    }
  }

  handleError(error) {
    console.error('Geolocation error:', error);
    this.speech.speak('Erro ao obter localização', 'high');
  }

  stop() {
    if (this.watchId) {
      this.service.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}

// Usage
const app = new GuiaTuristico();
app.start();
```

### Example 18: Observer Pattern for Address Changes

```javascript
import PositionManager from './src/core/PositionManager.js';
import AddressCache from './src/data/AddressCache.js';
import SpeechSynthesisManager from './src/speech/SpeechSynthesisManager.js';

class AddressChangeObserver {
  constructor() {
    this.cache = new AddressCache();
    this.speech = SpeechSynthesisManager.getInstance();
    this.setupCallbacks();
  }

  setupCallbacks() {
    // Neighborhood changes
    this.cache.registerCallback('bairro', (current, previous) => {
      if (previous && current !== previous) {
        this.speech.speak(
          `Você entrou em ${current}`,
          'high'
        );
      }
    });

    // Municipality changes
    this.cache.registerCallback('municipio', (current, previous) => {
      if (previous && current !== previous) {
        this.speech.speak(
          `Bem-vindo a ${current}`,
          'high'
        );
      }
    });

    // Metropolitan region changes (v0.9.0-alpha+)
    this.cache.registerCallback('regiaoMetropolitana', (current, previous) => {
      if (current && current !== previous) {
        this.speech.speak(
          `Você está na ${current}`,
          'normal'
        );
      }
    });
  }

  updateAddress(key, addressData) {
    this.cache.set(key, addressData);
  }
}

// Usage
const observer = new AddressChangeObserver();

// Simulate address changes
observer.updateAddress('pos1', {
  bairro: 'Centro',
  municipio: 'Recife',
  regiaoMetropolitana: 'Região Metropolitana de Recife'
});

observer.updateAddress('pos2', {
  bairro: 'Boa Viagem',
  municipio: 'Recife',
  regiaoMetropolitana: 'Região Metropolitana de Recife'
});
// Speech: "Você entrou em Boa Viagem"
```

### Example 19: Timer Management

```javascript
import TimerManager from './src/utils/TimerManager.js';

class PeriodicUpdater {
  constructor() {
    this.timerManager = TimerManager.getInstance();
    this.updateCount = 0;
  }

  start() {
    // Create named interval
    this.timerManager.setInterval(
      () => {
        this.updateCount++;
        console.log(`Update #${this.updateCount}`);
        
        if (this.updateCount >= 10) {
          this.stop();
        }
      },
      1000,
      'periodic-updater'
    );

    // Create named timeout
    this.timerManager.setTimeout(
      () => console.log('One-time action'),
      5000,
      'one-time-action'
    );
  }

  stop() {
    this.timerManager.clearTimer('periodic-updater');
    console.log('Stopped periodic updates');
  }

  cleanup() {
    this.timerManager.clearAll();
  }
}

// Usage
const updater = new PeriodicUpdater();
updater.start();
```

### Example 20: Performance Measurement

```javascript
import Chronometer from './src/timing/Chronometer.js';

class PerformanceMonitor {
  constructor() {
    this.chrono = new Chronometer();
    this.setupObserver();
  }

  setupObserver() {
    this.chrono.addObserver({
      update: (elapsed) => {
        if (elapsed > 5000) {
          console.warn(`Slow operation: ${elapsed}ms`);
        }
      }
    });
  }

  async measureAsync(operation, label) {
    this.chrono.reset();
    this.chrono.start();
    
    try {
      const result = await operation();
      const elapsed = this.chrono.stop();
      console.log(`${label}: ${elapsed}ms`);
      return result;
    } catch (error) {
      this.chrono.stop();
      throw error;
    }
  }

  measure(operation, label) {
    this.chrono.reset();
    this.chrono.start();
    
    try {
      const result = operation();
      const elapsed = this.chrono.stop();
      console.log(`${label}: ${elapsed}ms`);
      return result;
    } catch (error) {
      this.chrono.stop();
      throw error;
    }
  }
}

// Usage
const monitor = new PerformanceMonitor();

// Measure async operation
await monitor.measureAsync(
  async () => {
    const geocoder = new ReverseGeocoder(-23.550520, -46.633309);
    return await geocoder.fetchAddress();
  },
  'Address Fetch'
);

// Measure sync operation
monitor.measure(
  () => {
    const cache = new AddressCache();
    for (let i = 0; i < 1000; i++) {
      cache.set(`key${i}`, { data: i });
    }
    return cache.size;
  },
  'Cache 1000 items'
);
```

---

## Testing Examples

### Example 21: Unit Test with Mock Provider

```javascript
import { describe, it, expect } from '@jest/globals';
import GeolocationService from './src/services/GeolocationService.js';
import MockGeolocationProvider from './src/services/providers/MockGeolocationProvider.js';

describe('GeolocationService', () => {
  it('should receive position updates from mock provider', (done) => {
    const mockProvider = new MockGeolocationProvider({
      latitude: -23.550520,
      longitude: -46.633309
    });

    const service = new GeolocationService(mockProvider);

    service.watchPosition((position) => {
      expect(position.coords.latitude).toBe(-23.550520);
      expect(position.coords.longitude).toBe(-46.633309);
      done();
    });
  });
});
```

### Example 22: Integration Test

```javascript
import { describe, it, expect } from '@jest/globals';
import PositionManager from './src/core/PositionManager.js';
import ReverseGeocoder from './src/services/ReverseGeocoder.js';
import BrazilianStandardAddress from './src/data/BrazilianStandardAddress.js';

describe('Complete Address Flow', () => {
  it('should fetch and format Brazilian address', async () => {
    // Update position
    const manager = PositionManager.getInstance();
    manager.updatePosition(-23.550520, -46.633309);

    // Fetch address
    const geocoder = new ReverseGeocoder(-23.550520, -46.633309);
    const data = await geocoder.fetchAddress();

    // Standardize
    const address = new BrazilianStandardAddress();
    address.setFromNominatim(data);

    // Verify
    expect(address.municipio).toBeTruthy();
    expect(address.uf).toBeTruthy();
    expect(address.toString()).toContain('São Paulo');
  });
});
```

---

## Best Practices

### 1. Always Use Singletons Correctly

```javascript
// ✅ Good
const manager = PositionManager.getInstance();

// ❌ Bad - creates new instance, breaks singleton pattern
const manager = new PositionManager();
```

### 2. Clean Up Timers

```javascript
// ✅ Good
const timerManager = TimerManager.getInstance();
timerManager.setInterval(callback, 1000, 'my-timer');

// On cleanup
timerManager.clearTimer('my-timer');

// ❌ Bad - memory leak
setInterval(callback, 1000); // Not managed
```

### 3. Handle Errors Gracefully

```javascript
// ✅ Good
try {
  const address = await geocoder.fetchAddress();
  displayer.display(address);
} catch (error) {
  console.error('Failed to fetch address:', error);
  // Show cached data or error message
}

// ❌ Bad - unhandled promise rejection
const address = await geocoder.fetchAddress();
displayer.display(address);
```

### 4. Use Configuration Constants

```javascript
// ✅ Good
import { MINIMUM_DISTANCE_CHANGE } from './src/config/defaults.js';

if (distance > MINIMUM_DISTANCE_CHANGE) {
  updateAddress();
}

// ❌ Bad - magic numbers
if (distance > 20) {
  updateAddress();
}
```

### 5. Implement Change Detection

```javascript
// ✅ Good - only update when needed
const distance = manager.getDistanceFromPrevious();
if (distance > MINIMUM_DISTANCE_CHANGE) {
  await updateAddress();
}

// ❌ Bad - updates on every position change
await updateAddress(); // Wasteful API calls
```

---

## Troubleshooting

### Issue: Geolocation Permission Denied

```javascript
service.watchPosition(
  (pos) => console.log(pos),
  (error) => {
    if (error.code === error.PERMISSION_DENIED) {
      // Show UI to request permission
      alert('Please enable location permissions');
    }
  }
);
```

### Issue: Network Timeout

```javascript
const geocoder = new ReverseGeocoder(lat, lon);

try {
  const address = await Promise.race([
    geocoder.fetchAddress(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 10000)
    )
  ]);
} catch (error) {
  console.error('Fetch timeout or failed');
  // Use cached data
}
```

### Issue: Speech Not Working

```javascript
const manager = SpeechSynthesisManager.getInstance();

// Check if voices are available
const loader = new VoiceLoader();
const voices = await loader.loadVoices();

if (voices.length === 0) {
  console.error('No speech voices available');
} else {
  manager.speak('Test');
}
```

---

## Additional Resources

- [API Reference](./API_REFERENCE.md) - Complete API documentation
- [Architecture Overview](./ARCHITECTURE_OVERVIEW.md) - System design
- [Testing Guide](./TESTING.md) - Testing strategies
- [Contributing Guide](../.github/CONTRIBUTING.md) - Development workflow

---

**Version:** 0.9.0-alpha  
**Last Updated:** 2026-02-11
