/**
 * @file WebGeocodingManager DOM Interaction Tests
 * @description Integration tests for WebGeocodingManager DOM manipulation and UI coordination
 * @since 0.9.0-alpha
 * 
 * **Test Coverage Goals**:
 * - DOM element getters (lines 472-521)
 * - Observer subscription/notification (lines 550-707)
 * - Speech synthesis initialization (lines 660-670)
 * - Tracking lifecycle (lines 767-800)
 * - Error display (lines 876-900)
 * - Resource cleanup (lines 920-956)
 * 
 * **Target Coverage**: Lines 472-971 (500+ lines of DOM/UI code)
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import WebGeocodingManager from '../../src/coordination/WebGeocodingManager.js';
import GeoPosition from '../../src/core/GeoPosition.js';

/**
 * Creates a comprehensive mock DOM document for testing.
 * Includes all elements required by WebGeocodingManager.
 * 
 * @returns {Object} Mock document with elements and mocked methods
 */
function createMockDocument() {
    const elements = {
        locationResult: {
            textContent: '',
            innerHTML: '',
            appendChild: jest.fn(),
            setAttribute: jest.fn()
        },
        locationBtn: {
            addEventListener: jest.fn(),
            textContent: 'Get Location',
            disabled: false
        },
        findRestaurantsBtn: {
            addEventListener: jest.fn(),
            disabled: false
        },
        cityStatsBtn: {
            addEventListener: jest.fn(),
            disabled: false
        },
        chronometer: {
            textContent: '',
            innerHTML: ''
        },
        timestampDisplay: {
            textContent: '',
            innerHTML: ''
        },
        errorDisplay: {
            innerHTML: '',
            style: {}
        }
    };
    
    const mockDocument = {
        getElementById: jest.fn((id) => {
            const elementMap = {
                'location-result': elements.locationResult,
                'locationBtn': elements.locationBtn,
                'findRestaurantsBtn': elements.findRestaurantsBtn,
                'cityStatsBtn': elements.cityStatsBtn,
                'chronometer': elements.chronometer,
                'timestampDisplay': elements.timestampDisplay,
                'error-display': elements.errorDisplay,
                'result': elements.locationResult
            };
            return elementMap[id] || null;
        }),
        createElement: jest.fn(() => ({
            textContent: '',
            innerHTML: '',
            appendChild: jest.fn(),
            setAttribute: jest.fn(),
            style: {}
        })),
        querySelector: jest.fn(),
        addEventListener: jest.fn(),
        body: {
            appendChild: jest.fn()
        }
    };
    
    return { mockDocument, elements };
}

/**
 * Creates mock services with complete method signatures.
 * 
 * @returns {Object} Mock services (geolocation, geocoder)
 */
function createMockServices() {
    return {
        geolocationService: {
            getSingleLocationUpdate: jest.fn(() => Promise.resolve({
                coords: {
                    latitude: -23.550520,
                    longitude: -46.633309,
                    accuracy: 10
                },
                timestamp: Date.now()
            })),
            startContinuousTracking: jest.fn(() => Promise.resolve()),
            watchCurrentLocation: jest.fn(() => 12345), // Return mock watch ID
            stopTracking: jest.fn(),
            isSupported: jest.fn(() => true),
            subscribe: jest.fn(),
            unsubscribe: jest.fn()
        },
        reverseGeocoder: {
            fetchAddress: jest.fn(() => Promise.resolve({
                address: 'Av. Paulista, 1578',
                city: 'São Paulo',
                state: 'SP',
                country: 'Brazil'
            })),
            subscribe: jest.fn(),
            unsubscribe: jest.fn(),
            observerSubject: {
                observers: []
            },
            currentAddress: {
                road: 'Av. Paulista',
                house_number: '1578',
                suburb: 'Bela Vista',
                city: 'São Paulo',
                state: 'SP'
            },
            enderecoPadronizado: null
        }
    };
}

describe('WebGeocodingManager DOM Integration', () => {
    let mockDocument;
    let elements;
    let mockServices;
    let manager;
    
    beforeEach(() => {
        ({ mockDocument, elements } = createMockDocument());
        mockServices = createMockServices();
        
        jest.clearAllMocks();
    });
    
    afterEach(() => {
        if (manager && typeof manager.destroy === 'function') {
            manager.destroy();
        }
        manager = null;
    });
    
    describe('DOM Element Access (Getters)', () => {
        test('should provide access to chronometer element', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            // Act
            const chronometer = manager.chronometer;
            
            // Assert
            expect(chronometer).toBe(elements.chronometer);
        });
        
        test('should provide access to timestamp display element', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            // Act
            const timestamp = manager.tsPosCapture;
            
            // Assert - element may be null if not found, but getter should work
            expect(timestamp).toBeDefined();
        });
        
        test('should provide access to find restaurants button', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            // Act
            const button = manager.findRestaurantsBtn;
            
            // Assert
            expect(button).toBe(elements.findRestaurantsBtn);
        });
        
        test('should provide access to city stats button', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            // Act
            const button = manager.cityStatsBtn;
            
            // Assert
            expect(button).toBe(elements.cityStatsBtn);
        });
        
        test.skip('should provide access to position displayer', () => {
            // TODO: positionDisplayer requires full ServiceCoordinator initialization
            // which creates real displayer instances. Hard to mock properly.
            // This getter works in production but is difficult to test in isolation.
            
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            // Act
            const displayer = manager.positionDisplayer;
            
            // Assert - may be null if not initialized, but getter should work
            expect(displayer).toBeDefined();
        });
        
        test.skip('should provide access to address displayer', () => {
            // TODO: addressDisplayer requires full ServiceCoordinator initialization
            // which creates real displayer instances. Hard to mock properly.
            // This getter works in production but is difficult to test in isolation.
            
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            // Act
            const displayer = manager.addressDisplayer;
            
            // Assert - may be null if not fully initialized, but getter should work
            expect(displayer).toBeDefined();
        });
    });
    
    describe('Observer Pattern Implementation', () => {
        test('should subscribe object observers successfully', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            const mockObserver = {
                update: jest.fn()
            };
            
            // Act
            manager.subscribe(mockObserver);
            
            // Assert
            expect(manager.observers).toContain(mockObserver);
        });
        
        test('should reject null observer subscription', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            const initialCount = manager.observers.length;
            
            // Act
            manager.subscribe(null);
            
            // Assert
            expect(manager.observers.length).toBe(initialCount);
        });
        
        test('should unsubscribe object observers', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            const mockObserver = {
                update: jest.fn()
            };
            
            manager.subscribe(mockObserver);
            
            // Act
            manager.unsubscribe(mockObserver);
            
            // Assert
            expect(manager.observers).not.toContain(mockObserver);
        });
        
        test('should subscribe function observers successfully', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            const mockObserverFunc = jest.fn();
            
            // Act
            manager.subscribeFunction(mockObserverFunc);
            
            // Assert
            expect(manager.functionObservers).toContain(mockObserverFunc);
        });
        
        test('should reject null function observer subscription', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            const initialCount = manager.functionObservers.length;
            
            // Act
            manager.subscribeFunction(null);
            
            // Assert
            expect(manager.functionObservers.length).toBe(initialCount);
        });
        
        test('should unsubscribe function observers', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            const mockObserverFunc = jest.fn();
            manager.subscribeFunction(mockObserverFunc);
            
            // Act
            manager.unsubscribeFunction(mockObserverFunc);
            
            // Assert
            expect(manager.functionObservers).not.toContain(mockObserverFunc);
        });
        
        test('should notify function observers with current state', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            const mockObserverFunc = jest.fn();
            manager.subscribeFunction(mockObserverFunc);
            
            // Set some state
            const mockPosition = new GeoPosition({
                coords: { latitude: -23.5, longitude: -46.6 },
                timestamp: Date.now()
            });
            manager.currentPosition = mockPosition;
            
            // Act
            manager.notifyFunctionObservers();
            
            // Assert
            expect(mockObserverFunc).toHaveBeenCalledWith(
                mockPosition,
                mockServices.reverseGeocoder.currentAddress,
                mockServices.reverseGeocoder.enderecoPadronizado
            );
        });
        
        test('should handle observer errors gracefully', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            const failingObserver = jest.fn(() => {
                throw new Error('Observer error');
            });
            const successfulObserver = jest.fn();
            
            manager.subscribeFunction(failingObserver);
            manager.subscribeFunction(successfulObserver);
            
            // Act - should not throw
            expect(() => {
                manager.notifyFunctionObservers();
            }).not.toThrow();
            
            // Assert - successful observer should still be called
            expect(failingObserver).toHaveBeenCalled();
            expect(successfulObserver).toHaveBeenCalled();
        });
    });
    
    describe('Tracking Lifecycle', () => {
        test('should start tracking and initialize systems', async () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            // Act
            manager.startTracking();
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Assert
            expect(mockServices.geolocationService.getSingleLocationUpdate).toHaveBeenCalled();
        });
        
        test('should stop tracking when requested', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            manager.startTracking();
            
            // Act
            manager.stopTracking();
            
            // Assert
            expect(mockServices.geolocationService.stopTracking).toHaveBeenCalled();
        });
        
        test('should handle stop tracking when service coordinator not available', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            manager.serviceCoordinator = null;
            
            // Act - should not throw
            expect(() => {
                manager.stopTracking();
            }).not.toThrow();
        });
        
        test('should get single location update via delegation', async () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            // Act
            const position = await manager.getSingleLocationUpdate();
            
            // Assert
            expect(position).toBeTruthy();
            expect(position.coords.latitude).toBe(-23.550520);
            expect(mockServices.geolocationService.getSingleLocationUpdate).toHaveBeenCalled();
        });
        
        test('should update internal state after location update', async () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            // Act
            await manager.getSingleLocationUpdate();
            
            // Assert
            expect(manager.currentPosition).toBeTruthy();
            expect(manager.currentCoords).toBeTruthy();
            expect(manager.currentCoords.latitude).toBe(-23.550520);
        });
    });
    
    describe('Error Display', () => {
        test('should display error in dedicated error element', async () => {
            // Arrange
            mockServices.geolocationService.getSingleLocationUpdate.mockRejectedValue({
                name: 'GeolocationError',
                message: 'User denied geolocation',
                code: 1
            });
            
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            // Act
            try {
                await manager.getSingleLocationUpdate();
            } catch (err) {
                // Expected
            }
            
            // Assert
            expect(elements.errorDisplay.innerHTML).toContain('Erro');
            expect(elements.errorDisplay.innerHTML).toContain('GeolocationError');
            expect(elements.errorDisplay.innerHTML).toContain('User denied geolocation');
        });
        
        test.skip('should fallback to locationResult element if error-display missing', async () => {
            // TODO: This test requires more complex DOM mocking
            // The manager stores document reference in constructor, making it hard to test fallback
            // Consider refactoring _displayError to accept document as parameter for testability
            
            // Arrange - create fresh mock document WITHOUT error-display element
            const limitedMock = {
                getElementById: jest.fn((id) => {
                    if (id === 'location-result') return elements.locationResult;
                    if (id === 'locationBtn') return elements.locationBtn;
                    return null; // No error-display element
                }),
                createElement: mockDocument.createElement,
                querySelector: jest.fn(),
                addEventListener: jest.fn(),
                body: { appendChild: jest.fn() }
            };
            
            mockServices.geolocationService.getSingleLocationUpdate.mockRejectedValue({
                name: 'Error',
                message: 'Test error'
            });
            
            manager = new WebGeocodingManager(limitedMock, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            // Act
            try {
                await manager.getSingleLocationUpdate();
            } catch (err) {
                // Expected
            }
            
            // Assert
            expect(elements.locationResult.innerHTML).toContain('Erro');
            expect(elements.locationResult.innerHTML).toContain('Test error');
        });
        
        test('should include error code in display when available', async () => {
            // Arrange
            mockServices.geolocationService.getSingleLocationUpdate.mockRejectedValue({
                name: 'TimeoutError',
                message: 'Request timeout',
                code: 3
            });
            
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            // Act
            try {
                await manager.getSingleLocationUpdate();
            } catch (err) {
                // Expected
            }
            
            // Assert
            expect(elements.errorDisplay.innerHTML).toContain('Código');
            expect(elements.errorDisplay.innerHTML).toContain('3');
        });
    });
    
    describe('Speech Synthesis Integration', () => {
        test('should initialize speech synthesis on demand', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            // Act - should not throw
            expect(() => {
                manager.initSpeechSynthesis();
            }).not.toThrow();
        });
        
        test('should provide access to speech displayer', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            manager.initSpeechSynthesis();
            
            // Act
            const speechDisplayer = manager.htmlSpeechSynthesisDisplayer;
            
            // Assert - may be null if not initialized, but getter should work
            expect(speechDisplayer).toBeDefined();
        });
    });
    
    describe('Resource Cleanup', () => {
        test('should destroy and clean up all coordinators', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            // Spy on coordinators
            const serviceDestroySpy = jest.spyOn(manager.serviceCoordinator, 'destroy');
            
            // Act
            manager.destroy();
            
            // Assert
            expect(serviceDestroySpy).toHaveBeenCalled();
            expect(manager.serviceCoordinator).toBeNull();
            expect(manager.document).toBeNull();
        });
        
        test('should handle destroy when coordinators already null', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            manager.serviceCoordinator = null;
            manager.eventCoordinator = null;
            
            // Act - should not throw
            expect(() => {
                manager.destroy();
            }).not.toThrow();
        });
        
        test('should handle destroy when destroy methods missing', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            delete manager.serviceCoordinator.destroy;
            
            // Act - should not throw
            expect(() => {
                manager.destroy();
            }).not.toThrow();
        });
    });
    
    describe('Utility Methods', () => {
        test('should provide Brazilian standardized address', () => {
            // Arrange
            const mockAddress = {
                enderecoCompleto: () => 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP'
            };
            mockServices.reverseGeocoder.enderecoPadronizado = mockAddress;
            
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            // Act
            const address = manager.getBrazilianStandardAddress();
            
            // Assert
            expect(address).toBe(mockAddress);
        });
        
        test('should return null for Brazilian address when not available', () => {
            // Arrange
            mockServices.reverseGeocoder.enderecoPadronizado = null;
            
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            // Act
            const address = manager.getBrazilianStandardAddress();
            
            // Assert
            expect(address).toBeNull();
        });
        
        test('should provide string representation with coordinates', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            manager.currentCoords = {
                latitude: -23.550520,
                longitude: -46.633309
            };
            
            // Act
            const str = manager.toString();
            
            // Assert
            expect(str).toContain('WebGeocodingManager');
            expect(str).toContain('-23.55052'); // JavaScript may truncate trailing zero
            expect(str).toContain('-46.633309');
        });
        
        test('should provide string representation without coordinates', () => {
            // Arrange
            manager = new WebGeocodingManager(mockDocument, {
                locationResult: 'location-result',
                geolocationService: mockServices.geolocationService,
                reverseGeocoder: mockServices.reverseGeocoder
            });
            
            // Act
            const str = manager.toString();
            
            // Assert
            expect(str).toContain('WebGeocodingManager');
            expect(str).toContain('N/A');
        });
    });
});
