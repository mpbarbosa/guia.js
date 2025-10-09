/**
 * Tests for WebGeocodingManager class
 * 
 * These tests validate the improved cohesion and coupling of the refactored
 * WebGeocodingManager class, ensuring proper initialization, observer pattern
 * implementation, and coordination between components.
 */

// Mock document to prevent errors in test environment
global.document = undefined;

const { WebGeocodingManager, ObserverSubject, GeolocationService, ReverseGeocoder, DEFAULT_ELEMENT_IDS } = require('../src/guia.js');

describe('WebGeocodingManager - High Cohesion and Low Coupling', () => {
    let mockDocument;
    let mockElement;

    beforeEach(() => {
        // Create mock document with getElementById
        mockElement = {
            textContent: '',
            addEventListener: jest.fn()
        };
        
        mockDocument = {
            getElementById: jest.fn((id) => {
                // Return null for most elements to simulate missing UI elements
                if (id === 'location-result') {
                    return mockElement;
                }
                return null;
            })
        };
    });

    describe('Constructor and Initialization', () => {
        test('should initialize with required parameters', () => {
            const params = {
                locationResult: 'location-result',
                enderecoPadronizadoDisplay: 'address-display',
                referencePlaceDisplay: 'reference-place'
            };

            const manager = new WebGeocodingManager(mockDocument, params);

            expect(manager).toBeDefined();
            expect(manager.document).toBe(mockDocument);
            expect(manager.locationResult).toBe(params.locationResult);
            expect(manager.enderecoPadronizadoDisplay).toBe(params.enderecoPadronizadoDisplay);
            expect(manager.referencePlaceDisplay).toBe(params.referencePlaceDisplay);
        });

        test('should initialize observer subject', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);

            expect(manager.observerSubject).toBeDefined();
            expect(manager.observerSubject).toBeInstanceOf(ObserverSubject);
        });

        test('should create geolocation service and reverse geocoder', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);

            expect(manager.geolocationService).toBeDefined();
            expect(manager.geolocationService).toBeInstanceOf(GeolocationService);
            expect(manager.reverseGeocoder).toBeDefined();
            expect(manager.reverseGeocoder).toBeInstanceOf(ReverseGeocoder);
        });

        test('should handle optional parameters with defaults', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);

            expect(manager.enderecoPadronizadoDisplay).toBeNull();
            expect(manager.referencePlaceDisplay).toBeNull();
        });

        test('should initialize state to null', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);

            expect(manager.currentPosition).toBeNull();
            expect(manager.currentCoords).toBeNull();
        });
    });

    describe('Observer Pattern Implementation', () => {
        test('should subscribe object observers', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);
            
            const mockObserver = {
                update: jest.fn()
            };

            manager.subscribe(mockObserver);
            
            expect(manager.observers).toContain(mockObserver);
        });

        test('should not subscribe null observers', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);
            
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            manager.subscribe(null);
            
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Attempted to subscribe a null observer')
            );
            
            consoleSpy.mockRestore();
        });

        test('should unsubscribe object observers', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);
            
            const mockObserver = {
                update: jest.fn()
            };

            manager.subscribe(mockObserver);
            expect(manager.observers).toContain(mockObserver);
            
            manager.unsubscribe(mockObserver);
            expect(manager.observers).not.toContain(mockObserver);
        });

        test('should subscribe function observers', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);
            
            const mockFunction = jest.fn();

            manager.subscribeFunction(mockFunction);
            
            expect(manager.functionObservers).toContain(mockFunction);
        });

        test('should not subscribe null function observers', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);
            
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            manager.subscribeFunction(null);
            
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Attempted to subscribe a null observer function')
            );
            
            consoleSpy.mockRestore();
        });

        test('should unsubscribe function observers', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);
            
            const mockFunction = jest.fn();

            manager.subscribeFunction(mockFunction);
            expect(manager.functionObservers).toContain(mockFunction);
            
            manager.unsubscribeFunction(mockFunction);
            expect(manager.functionObservers).not.toContain(mockFunction);
        });
    });

    describe('Public API Methods', () => {
        test('should get Brazilian standard address from reverse geocoder', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);
            
            const mockAddress = { logradouro: 'Rua Test' };
            manager.reverseGeocoder.enderecoPadronizado = mockAddress;

            const result = manager.getBrazilianStandardAddress();
            
            expect(result).toBe(mockAddress);
        });

        test('should provide toString representation', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);

            const result = manager.toString();
            
            expect(result).toContain('WebGeocodingManager');
            expect(result).toContain('N/A');
        });

        test('should provide toString with coordinates when available', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);
            
            manager.currentCoords = {
                latitude: -23.5505,
                longitude: -46.6333
            };

            const result = manager.toString();
            
            expect(result).toContain('WebGeocodingManager');
            expect(result).toContain('-23.5505');
            expect(result).toContain('-46.6333');
        });
    });

    describe('Cohesion - Single Responsibility', () => {
        test('should delegate DOM element initialization to private methods', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);

            // Verify that initialization was called
            expect(mockDocument.getElementById).toHaveBeenCalled();
        });

        test('should separate displayer creation from observer wiring', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);

            // Verify displayers were created
            expect(manager.positionDisplayer).toBeDefined();
            expect(manager.addressDisplayer).toBeDefined();
            expect(manager.referencePlaceDisplayer).toBeDefined();
        });
    });

    describe('Coupling - Dependencies', () => {
        test('should accept document as dependency injection', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);

            expect(manager.document).toBe(mockDocument);
        });

        test('should accept configuration as parameter object', () => {
            const params = {
                locationResult: 'location-result',
                enderecoPadronizadoDisplay: 'address-display',
                referencePlaceDisplay: 'reference-place'
            };
            const manager = new WebGeocodingManager(mockDocument, params);

            expect(manager.locationResult).toBe(params.locationResult);
            expect(manager.enderecoPadronizadoDisplay).toBe(params.enderecoPadronizadoDisplay);
            expect(manager.referencePlaceDisplay).toBe(params.referencePlaceDisplay);
        });
    });

    describe('Service Dependency Injection', () => {
        test('should create default services when not provided', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);

            expect(manager.geolocationService).toBeDefined();
            expect(manager.geolocationService).toBeInstanceOf(GeolocationService);
            expect(manager.reverseGeocoder).toBeDefined();
            expect(manager.reverseGeocoder).toBeInstanceOf(ReverseGeocoder);
        });

        test('should accept injected GeolocationService', () => {
            const mockGeolocationService = {
                subscribe: jest.fn(),
                getCurrentPosition: jest.fn()
            };

            const params = {
                locationResult: 'location-result',
                geolocationService: mockGeolocationService
            };
            const manager = new WebGeocodingManager(mockDocument, params);

            expect(manager.geolocationService).toBe(mockGeolocationService);
            expect(manager.geolocationService).not.toBeInstanceOf(GeolocationService);
        });

        test('should accept injected ReverseGeocoder', () => {
            const mockReverseGeocoder = {
                subscribe: jest.fn(),
                currentAddress: { logradouro: 'Test Street' },
                enderecoPadronizado: 'Test Address'
            };

            const params = {
                locationResult: 'location-result',
                reverseGeocoder: mockReverseGeocoder
            };
            const manager = new WebGeocodingManager(mockDocument, params);

            expect(manager.reverseGeocoder).toBe(mockReverseGeocoder);
            expect(manager.reverseGeocoder).not.toBeInstanceOf(ReverseGeocoder);
        });

        test('should accept both injected services simultaneously', () => {
            const mockGeolocationService = {
                subscribe: jest.fn(),
                getCurrentPosition: jest.fn()
            };
            const mockReverseGeocoder = {
                subscribe: jest.fn(),
                currentAddress: { logradouro: 'Test Street' },
                enderecoPadronizado: 'Test Address'
            };

            const params = {
                locationResult: 'location-result',
                geolocationService: mockGeolocationService,
                reverseGeocoder: mockReverseGeocoder
            };
            const manager = new WebGeocodingManager(mockDocument, params);

            expect(manager.geolocationService).toBe(mockGeolocationService);
            expect(manager.reverseGeocoder).toBe(mockReverseGeocoder);
        });

        test('should allow pre-configured service instances', () => {
            // Create a real ReverseGeocoder that could be pre-configured
            const preconfiguredGeocoder = new ReverseGeocoder();
            
            const params = {
                locationResult: 'location-result',
                reverseGeocoder: preconfiguredGeocoder
            };
            const manager = new WebGeocodingManager(mockDocument, params);

            expect(manager.reverseGeocoder).toBe(preconfiguredGeocoder);
            expect(manager.reverseGeocoder).toBeInstanceOf(ReverseGeocoder);
        });

        test('should pass injected services to ChangeDetectionCoordinator', () => {
            const mockReverseGeocoder = {
                subscribe: jest.fn(),
                currentAddress: { logradouro: 'Test Street' },
                enderecoPadronizado: 'Test Address'
            };

            const params = {
                locationResult: 'location-result',
                reverseGeocoder: mockReverseGeocoder
            };
            const manager = new WebGeocodingManager(mockDocument, params);

            expect(manager.changeDetectionCoordinator.reverseGeocoder).toBe(mockReverseGeocoder);
        });
    });

    describe('Backward Compatibility', () => {
        test('should provide legacy initElements method', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);

            expect(typeof manager.initElements).toBe('function');
        });

        test('should provide observers getter for backward compatibility', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);

            expect(Array.isArray(manager.observers)).toBe(true);
        });

        test('should provide functionObservers getter for backward compatibility', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);

            expect(Array.isArray(manager.functionObservers)).toBe(true);
        });
    });

    describe('Error Handling', () => {
        test('should handle missing DOM elements gracefully', () => {
            const params = { locationResult: 'location-result' };
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            // Create manager with document that returns null for most elements
            const manager = new WebGeocodingManager(mockDocument, params);

            // Should have logged warnings for missing elements
            expect(consoleSpy).toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });

        test('should handle null observer subscription gracefully', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            // Should not throw error
            expect(() => manager.subscribe(null)).not.toThrow();
            expect(consoleSpy).toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });
    });

    describe('Element IDs Configuration', () => {
        test('should use DEFAULT_ELEMENT_IDS when no custom elementIds provided', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);

            expect(manager.elementIds).toBe(DEFAULT_ELEMENT_IDS);
            expect(manager.elementIds.chronometer).toBe('chronometer');
            expect(manager.elementIds.findRestaurantsBtn).toBe('find-restaurants-btn');
            expect(manager.elementIds.cityStatsBtn).toBe('city-stats-btn');
            expect(manager.elementIds.timestampDisplay).toBe('tsPosCapture');
        });

        test('should use custom elementIds when provided', () => {
            const customElementIds = {
                chronometer: 'custom-chronometer',
                findRestaurantsBtn: 'custom-find-btn',
                cityStatsBtn: 'custom-stats-btn',
                timestampDisplay: 'custom-timestamp',
                speechSynthesis: {
                    languageSelectId: 'custom-language',
                    voiceSelectId: 'custom-voice',
                    textInputId: 'custom-text',
                    speakBtnId: 'custom-speak',
                    pauseBtnId: 'custom-pause',
                    resumeBtnId: 'custom-resume',
                    stopBtnId: 'custom-stop',
                    rateInputId: 'custom-rate',
                    rateValueId: 'custom-rate-value',
                    pitchInputId: 'custom-pitch',
                    pitchValueId: 'custom-pitch-value',
                }
            };

            const params = {
                locationResult: 'location-result',
                elementIds: customElementIds
            };

            const manager = new WebGeocodingManager(mockDocument, params);

            expect(manager.elementIds).toBe(customElementIds);
            expect(manager.elementIds.chronometer).toBe('custom-chronometer');
            expect(manager.elementIds.findRestaurantsBtn).toBe('custom-find-btn');
            expect(manager.elementIds.cityStatsBtn).toBe('custom-stats-btn');
            expect(manager.elementIds.timestampDisplay).toBe('custom-timestamp');
        });

        test('should freeze elementIds configuration to prevent mutations', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);

            // Attempt to modify elementIds should not work (in strict mode would throw)
            expect(() => {
                manager.elementIds.chronometer = 'modified';
            }).not.toThrow();
            
            // Value should remain unchanged due to freeze
            expect(manager.elementIds.chronometer).toBe('chronometer');
            expect(Object.isFrozen(manager.elementIds)).toBe(true);
        });

        test('should use custom element IDs in DOM lookups', () => {
            const customChronometerId = 'my-custom-chronometer';
            const customElementIds = {
                chronometer: customChronometerId,
                findRestaurantsBtn: 'custom-find-btn',
                cityStatsBtn: 'custom-stats-btn',
                timestampDisplay: 'custom-timestamp',
                speechSynthesis: DEFAULT_ELEMENT_IDS.speechSynthesis
            };

            const customMockElement = {
                textContent: '',
                addEventListener: jest.fn()
            };

            const customMockDocument = {
                getElementById: jest.fn((id) => {
                    if (id === 'location-result' || id === customChronometerId) {
                        return customMockElement;
                    }
                    return null;
                })
            };

            const params = {
                locationResult: 'location-result',
                elementIds: customElementIds
            };

            const manager = new WebGeocodingManager(customMockDocument, params);

            // Verify custom ID was used in DOM lookup
            expect(customMockDocument.getElementById).toHaveBeenCalledWith(customChronometerId);
        });

        test('DEFAULT_ELEMENT_IDS should be frozen', () => {
            expect(Object.isFrozen(DEFAULT_ELEMENT_IDS)).toBe(true);
            expect(Object.isFrozen(DEFAULT_ELEMENT_IDS.speechSynthesis)).toBe(true);
        });

        test('should have all required element IDs in DEFAULT_ELEMENT_IDS', () => {
            expect(DEFAULT_ELEMENT_IDS).toHaveProperty('chronometer');
            expect(DEFAULT_ELEMENT_IDS).toHaveProperty('findRestaurantsBtn');
            expect(DEFAULT_ELEMENT_IDS).toHaveProperty('cityStatsBtn');
            expect(DEFAULT_ELEMENT_IDS).toHaveProperty('timestampDisplay');
            expect(DEFAULT_ELEMENT_IDS).toHaveProperty('speechSynthesis');
            
            // Verify speech synthesis nested properties
            expect(DEFAULT_ELEMENT_IDS.speechSynthesis).toHaveProperty('languageSelectId');
            expect(DEFAULT_ELEMENT_IDS.speechSynthesis).toHaveProperty('voiceSelectId');
            expect(DEFAULT_ELEMENT_IDS.speechSynthesis).toHaveProperty('textInputId');
            expect(DEFAULT_ELEMENT_IDS.speechSynthesis).toHaveProperty('speakBtnId');
            expect(DEFAULT_ELEMENT_IDS.speechSynthesis).toHaveProperty('pauseBtnId');
            expect(DEFAULT_ELEMENT_IDS.speechSynthesis).toHaveProperty('resumeBtnId');
            expect(DEFAULT_ELEMENT_IDS.speechSynthesis).toHaveProperty('stopBtnId');
            expect(DEFAULT_ELEMENT_IDS.speechSynthesis).toHaveProperty('rateInputId');
            expect(DEFAULT_ELEMENT_IDS.speechSynthesis).toHaveProperty('rateValueId');
            expect(DEFAULT_ELEMENT_IDS.speechSynthesis).toHaveProperty('pitchInputId');
            expect(DEFAULT_ELEMENT_IDS.speechSynthesis).toHaveProperty('pitchValueId');
        });
    });

    describe('Displayer Factory Injection', () => {
        test('should use default DisplayerFactory when none provided', () => {
            const params = { locationResult: 'location-result' };
            const manager = new WebGeocodingManager(mockDocument, params);

            expect(manager.positionDisplayer).toBeDefined();
            expect(manager.addressDisplayer).toBeDefined();
            expect(manager.referencePlaceDisplayer).toBeDefined();
        });

        test('should accept custom displayer factory for testing', () => {
            // Create mock displayers
            const mockPositionDisplayer = {
                update: jest.fn(),
                element: mockElement,
                toString: () => 'MockPositionDisplayer'
            };
            const mockAddressDisplayer = {
                update: jest.fn(),
                element: mockElement,
                toString: () => 'MockAddressDisplayer'
            };
            const mockReferencePlaceDisplayer = {
                update: jest.fn(),
                element: mockElement,
                toString: () => 'MockReferencePlaceDisplayer'
            };

            // Create mock factory
            const mockFactory = {
                createPositionDisplayer: jest.fn(() => mockPositionDisplayer),
                createAddressDisplayer: jest.fn(() => mockAddressDisplayer),
                createReferencePlaceDisplayer: jest.fn(() => mockReferencePlaceDisplayer)
            };

            const params = {
                locationResult: 'location-result',
                enderecoPadronizadoDisplay: 'address-display',
                referencePlaceDisplay: 'reference-place',
                displayerFactory: mockFactory
            };

            const manager = new WebGeocodingManager(mockDocument, params);

            // Verify factory was used
            expect(mockFactory.createPositionDisplayer).toHaveBeenCalledWith('location-result');
            expect(mockFactory.createAddressDisplayer).toHaveBeenCalledWith(
                'location-result',
                'address-display'
            );
            expect(mockFactory.createReferencePlaceDisplayer).toHaveBeenCalledWith('reference-place');

            // Verify mock displayers were assigned
            expect(manager.positionDisplayer).toBe(mockPositionDisplayer);
            expect(manager.addressDisplayer).toBe(mockAddressDisplayer);
            expect(manager.referencePlaceDisplayer).toBe(mockReferencePlaceDisplayer);
        });

        test('should enable isolated testing without DOM manipulation', () => {
            // Mock displayers that don't touch DOM
            const mockDisplayers = {
                position: { update: jest.fn(), toString: () => 'Mock' },
                address: { update: jest.fn(), toString: () => 'Mock' },
                referencePlace: { update: jest.fn(), toString: () => 'Mock' }
            };

            const mockFactory = {
                createPositionDisplayer: () => mockDisplayers.position,
                createAddressDisplayer: () => mockDisplayers.address,
                createReferencePlaceDisplayer: () => mockDisplayers.referencePlace
            };

            const params = {
                locationResult: 'location-result',
                displayerFactory: mockFactory
            };

            const manager = new WebGeocodingManager(mockDocument, params);

            // Verify displayers were created without DOM access
            expect(manager.positionDisplayer.update).toBeDefined();
            expect(manager.addressDisplayer.update).toBeDefined();
            expect(manager.referencePlaceDisplayer.update).toBeDefined();
        });

        test('should maintain backward compatibility with default factory', () => {
            const params1 = { locationResult: 'location-result' };
            const manager1 = new WebGeocodingManager(mockDocument, params1);

            const params2 = {
                locationResult: 'location-result',
                displayerFactory: undefined
            };
            const manager2 = new WebGeocodingManager(mockDocument, params2);

            // Both should use default factory and create real displayers
            expect(manager1.positionDisplayer.constructor.name).toBe('HTMLPositionDisplayer');
            expect(manager2.positionDisplayer.constructor.name).toBe('HTMLPositionDisplayer');
        });
    });
});
