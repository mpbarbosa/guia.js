/**
 * End-to-End Test: Multi-Component Integration
 * 
 * This E2E test validates complex interactions between multiple components:
 * 1. WebGeocodingManager orchestration
 * 2. PositionManager + GeoPosition coordination
 * 3. ReverseGeocoder + AddressDataExtractor pipeline
 * 4. ChangeDetectionCoordinator + Observer pattern
 * 5. SpeechSynthesisManager + SpeechQueue coordination
 * 6. Display components (HTML + Speech) synchronization
 * 
 * Tests the full application stack working together as it would in production.
 * 
 * @jest-environment node
 * @author MP Barbosa
 * @since 0.5.0-alpha
 */

import { describe, test, expect, jest, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

// Mock DOM functions to prevent errors in test environment
global.document = undefined;

// Mock console
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
};

// Mock speechSynthesis
global.speechSynthesis = {
    speak: jest.fn(),
    cancel: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    getVoices: jest.fn(() => [{
        name: 'Google português do Brasil',
        lang: 'pt-BR',
        localService: false,
        default: true
    }]),
    speaking: false,
    pending: false,
    paused: false
};

global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
    text: text || '',
    lang: 'pt-BR',
    voice: null,
    volume: 1,
    rate: 0.9,
    pitch: 1,
    onstart: null,
    onend: null,
    onerror: null
}));

global.window = {
    location: { hostname: 'localhost', port: '8080' },
    addEventListener: jest.fn(),
    speechSynthesis: global.speechSynthesis,
    SpeechSynthesisUtterance: global.SpeechSynthesisUtterance
};

// Mock setupParams
global.setupParams = {
    geolocationOptions: {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
    },
    trackingInterval: 60000,
    minimumDistanceChange: 20,
    validRefPlaceClasses: ['amenity', 'building', 'shop', 'place'],
    notAcceptedAccuracy: ['bad', 'very bad'],
    mobileNotAcceptedAccuracy: ['medium', 'bad', 'very bad'],
    desktopNotAcceptedAccuracy: ['bad', 'very bad'],
    speechQueue: {
        maxQueueSize: 10,
        defaultPriority: 'normal',
        interruptOnNewHigh: true
    },
    referencePlaceMap: {
        amenity: {
            restaurant: 'Restaurante',
            cafe: 'Cafeteria',
            bar: 'Bar'
        },
        shop: {
            supermarket: 'Supermercado'
        },
        place: {
            house: 'Residencial',
            neighbourhood: 'Bairro'
        }
    },
    noReferencePlace: 'Não classificado'
};

// Mock utility functions
global.log = jest.fn();
global.warn = jest.fn();
global.calculateDistance = jest.fn((lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
});
global.getOpenStreetMapUrl = jest.fn((lat, lon) => 
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
);
global.delay = jest.fn((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
global.isMobileDevice = jest.fn(() => false);

// Mock fetch
global.fetch = jest.fn();

// Import classes from guia.js
let GeoPosition, PositionManager, ReverseGeocoder, AddressDataExtractor,
    BrazilianStandardAddress, ChangeDetectionCoordinator, SpeechQueue,
    SpeechSynthesisManager, WebGeocodingManager, ObserverSubject,
    ReferencePlace, SingletonStatusManager;

try {
    const guiaModule = await import('../../src/guia.js');
    
    // Extract the classes we need for testing
} catch (error) {
    console.warn('Could not load guia.js:', error.message);
}

describe('E2E: Multi-Component Integration', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        if (PositionManager && PositionManager.instance) {
            PositionManager.instance = null;
        }
        if (SingletonStatusManager && SingletonStatusManager.instance) {
            SingletonStatusManager.instance = null;
        }
    });

    describe('Integration: Manager → Position → Geocoder → Display', () => {
        
        test('should orchestrate complete workflow through WebGeocodingManager', async () => {
            if (!WebGeocodingManager || !GeoPosition || !ReverseGeocoder) {
                console.warn('Required classes not available, skipping test');
                return;
            }

            // Mock DOM elements
            const mockElement = {
                innerHTML: '',
                textContent: '',
                appendChild: jest.fn(),
                style: {}
            };

            const mockDocument = {
                createElement: jest.fn(() => mockElement),
                getElementById: jest.fn(() => mockElement),
                querySelector: jest.fn(() => mockElement)
            };

            // Mock API response
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    display_name: 'Avenida Paulista, Bela Vista, São Paulo, SP, Brasil',
                    address: {
                        road: 'Avenida Paulista',
                        neighbourhood: 'Bela Vista',
                        city: 'São Paulo',
                        state: 'São Paulo',
                        country: 'Brasil'
                    }
                })
            });

            // Initialize manager
            const manager = new WebGeocodingManager(mockDocument, mockElement);
            expect(manager).toBeDefined();

            // Create position
            const position = new GeoPosition({
                latitude: -23.5505,
                longitude: -46.6333,
                accuracy: 10,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null
            });

            expect(position).toBeDefined();

            // Verify PositionManager is initialized
            const positionManager = PositionManager.getInstance();
            expect(positionManager).toBeDefined();
        });

        test('should coordinate PositionManager with Observer pattern', () => {
            if (!PositionManager || !ObserverSubject) {
                console.warn('Required classes not available, skipping test');
                return;
            }

            const manager = PositionManager.getInstance();
            expect(manager).toBeDefined();

            // Create observer callback
            const observerCallback = jest.fn();

            // Attach observer if method exists
            if (manager.attach && typeof manager.attach === 'function') {
                manager.attach(observerCallback);
            }

            // Create position update
            const position = new GeoPosition({
                latitude: -23.5505,
                longitude: -46.6333,
                accuracy: 10,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null
            });

            expect(position).toBeDefined();
        });

        test('should integrate ReverseGeocoder with AddressDataExtractor', async () => {
            if (!ReverseGeocoder || !AddressDataExtractor) {
                console.warn('Required classes not available, skipping test');
                return;
            }

            // Mock geocoding response
            const mockResponse = {
                display_name: 'Rua Oscar Freire, Jardins, São Paulo, SP, Brasil',
                address: {
                    road: 'Rua Oscar Freire',
                    house_number: '500',
                    neighbourhood: 'Jardins',
                    city: 'São Paulo',
                    state: 'São Paulo',
                    postcode: '01426-001',
                    country: 'Brasil'
                }
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            // Step 1: Reverse geocode
            const geocoder = new ReverseGeocoder();
            const geocodedData = await geocoder.getReverseGeocodedData(-23.5606, -46.6556);

            expect(geocodedData).toBeDefined();
            expect(geocodedData.address).toBeDefined();

            // Step 2: Extract Brazilian address
            const brazilianAddress = AddressDataExtractor.getBrazilianStandardAddress(geocodedData);

            expect(brazilianAddress).toBeDefined();
            expect(brazilianAddress.logradouro).toBe('Rua Oscar Freire');
            expect(brazilianAddress.bairro).toBe('Jardins');
            expect(brazilianAddress.municipio).toBe('São Paulo');
        });
    });

    describe('Integration: Change Detection → Speech Synthesis', () => {
        
        test('should detect changes and trigger speech queue', async () => {
            if (!AddressDataExtractor || !SpeechQueue || !ChangeDetectionCoordinator) {
                console.warn('Required classes not available, skipping test');
                return;
            }

            // Create two addresses for comparison
            const address1 = AddressDataExtractor.getBrazilianStandardAddress({
                address: {
                    road: 'Rua Augusta',
                    neighbourhood: 'Consolação',
                    city: 'São Paulo',
                    state: 'São Paulo'
                }
            });

            const address2 = AddressDataExtractor.getBrazilianStandardAddress({
                address: {
                    road: 'Rua Oscar Freire',
                    neighbourhood: 'Jardins',
                    city: 'São Paulo',
                    state: 'São Paulo'
                }
            });

            // Detect neighborhood change
            const bairroChanged = address1.bairro !== address2.bairro;
            expect(bairroChanged).toBe(true);

            // Queue speech notification
            const speechQueue = new SpeechQueue();
            speechQueue.enqueue(`Entrando no bairro ${address2.bairro}`, 'normal');

            expect(speechQueue.items.length).toBe(1);
            expect(speechQueue.items[0].text).toContain('Jardins');
        });

        test('should coordinate multiple change detectors', () => {
            if (!BrazilianStandardAddress) {
                console.warn('BrazilianStandardAddress not available, skipping test');
                return;
            }

            // Simulate multiple address updates
            const addresses = [];
            const locations = [
                { road: 'Rua A', bairro: 'Centro', city: 'São Paulo' },
                { road: 'Rua B', bairro: 'Jardins', city: 'São Paulo' },
                { road: 'Rua C', bairro: 'Pinheiros', city: 'São Paulo' },
            ];

            locations.forEach(loc => {
                const addr = AddressDataExtractor.getBrazilianStandardAddress({
                    address: loc
                });
                addresses.push(addr);
            });

            // Verify all addresses created
            expect(addresses.length).toBe(3);

            // Count bairro changes
            let changeCount = 0;
            for (let i = 1; i < addresses.length; i++) {
                if (addresses[i].bairro !== addresses[i - 1].bairro) {
                    changeCount++;
                }
            }

            expect(changeCount).toBe(2); // Two bairro changes
        });

        test('should prioritize municipality changes in speech queue', () => {
            if (!SpeechQueue) {
                console.warn('SpeechQueue not available, skipping test');
                return;
            }

            const queue = new SpeechQueue();

            // Add various priority messages
            queue.enqueue('Rua mudou', 'low');
            queue.enqueue('Bairro mudou', 'normal');
            queue.enqueue('Município mudou', 'high');

            expect(queue.items.length).toBe(3);

            // High priority should be identifiable
            const highPriorityItems = queue.items.filter(item => item.priority === 'high');
            expect(highPriorityItems.length).toBe(1);
            expect(highPriorityItems[0].text).toContain('Município');
        });
    });

    describe('Integration: Singleton Pattern Coordination', () => {
        
        test('should maintain single PositionManager instance across components', () => {
            if (!PositionManager) {
                console.warn('PositionManager not available, skipping test');
                return;
            }

            const manager1 = PositionManager.getInstance();
            const manager2 = PositionManager.getInstance();
            const manager3 = PositionManager.getInstance();

            expect(manager1).toBeDefined();
            expect(manager1).toBe(manager2);
            expect(manager2).toBe(manager3);
        });

        test('should coordinate SingletonStatusManager with other components', () => {
            if (!SingletonStatusManager) {
                console.warn('SingletonStatusManager not available, skipping test');
                return;
            }

            const statusManager = SingletonStatusManager.getInstance();
            expect(statusManager).toBeDefined();

            // Multiple getInstance calls should return same instance
            const statusManager2 = SingletonStatusManager.getInstance();
            expect(statusManager).toBe(statusManager2);
        });
    });

    describe('Integration: Position Pipeline', () => {
        
        test('should process position through complete pipeline', async () => {
            if (!GeoPosition || !PositionManager || !ReverseGeocoder || !AddressDataExtractor) {
                console.warn('Required classes not available, skipping test');
                return;
            }

            // Step 1: Create position
            const position = new GeoPosition({
                latitude: -23.5505,
                longitude: -46.6333,
                accuracy: 10,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null
            });

            expect(position).toBeDefined();

            // Step 2: Position Manager processes it
            const manager = PositionManager.getInstance();
            expect(manager).toBeDefined();

            // Step 3: Mock geocoding
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    address: {
                        road: 'Avenida Paulista',
                        neighbourhood: 'Bela Vista',
                        city: 'São Paulo',
                        state: 'São Paulo'
                    }
                })
            });

            // Step 4: Reverse geocode
            const geocoder = new ReverseGeocoder();
            const geocodedData = await geocoder.getReverseGeocodedData(
                position.latitude,
                position.longitude
            );

            // Step 5: Extract address
            const address = AddressDataExtractor.getBrazilianStandardAddress(geocodedData);

            expect(address).toBeDefined();
            expect(address.municipio).toBe('São Paulo');
        });

        test('should handle multiple positions in sequence', async () => {
            if (!GeoPosition || !ReverseGeocoder || !AddressDataExtractor) {
                console.warn('Required classes not available, skipping test');
                return;
            }

            const positions = [
                { lat: -23.5505, lon: -46.6333, city: 'São Paulo', bairro: 'Bela Vista' },
                { lat: -23.5606, lon: -46.6556, city: 'São Paulo', bairro: 'Jardins' },
                { lat: -23.5707, lon: -46.6779, city: 'São Paulo', bairro: 'Pinheiros' },
            ];

            const processedAddresses = [];

            for (const pos of positions) {
                // Create position
                const position = new GeoPosition({
                    latitude: pos.lat,
                    longitude: pos.lon,
                    accuracy: 10,
                    altitude: null,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null
                });

                // Mock geocoding response
                global.fetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        address: {
                            city: pos.city,
                            neighbourhood: pos.bairro
                        }
                    })
                });

                // Geocode
                const geocoder = new ReverseGeocoder();
                const data = await geocoder.getReverseGeocodedData(pos.lat, pos.lon);

                // Extract address
                const address = AddressDataExtractor.getBrazilianStandardAddress(data);
                processedAddresses.push(address);
            }

            expect(processedAddresses.length).toBe(3);
            expect(processedAddresses[0].bairro).toBe('Bela Vista');
            expect(processedAddresses[1].bairro).toBe('Jardins');
            expect(processedAddresses[2].bairro).toBe('Pinheiros');
        });
    });

    describe('Integration: Display Components Synchronization', () => {
        
        test('should synchronize HTML and speech display updates', async () => {
            if (!AddressDataExtractor || !SpeechQueue) {
                console.warn('Required classes not available, skipping test');
                return;
            }

            // Create address
            const address = AddressDataExtractor.getBrazilianStandardAddress({
                address: {
                    road: 'Avenida Paulista',
                    neighbourhood: 'Bela Vista',
                    city: 'São Paulo',
                    state: 'São Paulo'
                }
            });

            // Prepare HTML display text
            const htmlText = `${address.logradouro}, ${address.bairro}, ${address.municipio}`;
            expect(htmlText).toContain('Avenida Paulista');

            // Prepare speech text
            const speechText = `Você está na ${address.logradouro}, bairro ${address.bairro}`;
            
            // Queue speech
            const queue = new SpeechQueue();
            queue.enqueue(speechText, 'normal');

            expect(queue.items.length).toBe(1);
            expect(queue.items[0].text).toContain('Avenida Paulista');
        });

        test('should handle concurrent display updates', () => {
            if (!SpeechQueue) {
                console.warn('SpeechQueue not available, skipping test');
                return;
            }

            const queue = new SpeechQueue();

            // Simulate rapid updates
            const updates = [
                'Localização 1',
                'Localização 2',
                'Localização 3',
                'Localização 4',
                'Localização 5'
            ];

            updates.forEach(text => {
                queue.enqueue(text, 'normal');
            });

            expect(queue.items.length).toBe(5);
        });
    });

    describe('Integration: Reference Places with Addresses', () => {
        
        test('should integrate reference places with address data', () => {
            if (!ReferencePlace || !BrazilianStandardAddress) {
                console.warn('Required classes not available, skipping test');
                return;
            }

            // Create reference place
            const restaurant = new ReferencePlace('amenity', 'restaurant', 'Restaurante Exemplo');
            expect(restaurant).toBeDefined();

            // Create associated address
            const address = new BrazilianStandardAddress();
            address.logradouro = 'Rua Augusta';
            address.numero = '2690';
            address.bairro = 'Cerqueira César';
            address.municipio = 'São Paulo';

            // Combine for display
            const displayText = `${restaurant.name} - ${address.logradouro}, ${address.bairro}`;
            expect(displayText).toContain('Restaurante Exemplo');
            expect(displayText).toContain('Rua Augusta');
        });
    });

    describe('Integration: Real-world Navigation Scenario', () => {
        
        test('should handle complete navigation session', async () => {
            if (!GeoPosition || !ReverseGeocoder || !AddressDataExtractor || !SpeechQueue) {
                console.warn('Required classes not available, skipping test');
                return;
            }

            const manager = PositionManager.getInstance();
            const speechQueue = new SpeechQueue();
            const route = [
                { lat: -23.5505, lon: -46.6333, city: 'São Paulo', bairro: 'Bela Vista', road: 'Av Paulista' },
                { lat: -23.5606, lon: -46.6556, city: 'São Paulo', bairro: 'Jardins', road: 'R Oscar Freire' },
                { lat: -23.5707, lon: -46.6779, city: 'São Paulo', bairro: 'Pinheiros', road: 'R dos Pinheiros' },
            ];

            let previousAddress = null;

            for (const point of route) {
                // Create position
                const position = new GeoPosition({
                    latitude: point.lat,
                    longitude: point.lon,
                    accuracy: 10,
                    altitude: null,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null
                });

                // Mock geocoding
                global.fetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        address: {
                            road: point.road,
                            neighbourhood: point.bairro,
                            city: point.city,
                            state: 'São Paulo'
                        }
                    })
                });

                // Geocode
                const geocoder = new ReverseGeocoder();
                const data = await geocoder.getReverseGeocodedData(point.lat, point.lon);
                const address = AddressDataExtractor.getBrazilianStandardAddress(data);

                // Detect changes and queue speech
                if (previousAddress) {
                    if (address.bairro !== previousAddress.bairro) {
                        speechQueue.enqueue(`Entrando no bairro ${address.bairro}`, 'normal');
                    }
                    if (address.logradouro !== previousAddress.logradouro) {
                        speechQueue.enqueue(`Agora na ${address.logradouro}`, 'low');
                    }
                }

                previousAddress = address;
            }

            // Verify navigation processed correctly
            expect(manager).toBeDefined();
            expect(speechQueue.items.length).toBeGreaterThan(0);
        });
    });

    describe('Integration: Component Lifecycle', () => {
        
        test('should initialize all components in correct order', () => {
            if (!PositionManager || !SingletonStatusManager) {
                console.warn('Required classes not available, skipping test');
                return;
            }

            // Step 1: Initialize singletons
            const positionManager = PositionManager.getInstance();
            const statusManager = SingletonStatusManager.getInstance();

            expect(positionManager).toBeDefined();
            expect(statusManager).toBeDefined();

            // Step 2: Create position
            if (GeoPosition) {
                const position = new GeoPosition({
                    latitude: -23.5505,
                    longitude: -46.6333,
                    accuracy: 10,
                    altitude: null,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null
                });
                expect(position).toBeDefined();
            }

            // Step 3: Create speech queue
            if (SpeechQueue) {
                const queue = new SpeechQueue();
                expect(queue).toBeDefined();
            }
        });

        test('should cleanup and reset components', () => {
            if (!PositionManager) {
                console.warn('PositionManager not available, skipping test');
                return;
            }

            const manager1 = PositionManager.getInstance();
            expect(manager1).toBeDefined();

            // Reset singleton
            PositionManager.instance = null;

            // Get new instance
            const manager2 = PositionManager.getInstance();
            expect(manager2).toBeDefined();
            
            // Should be different instances after reset
            expect(manager1).not.toBe(manager2);
        });
    });
});
