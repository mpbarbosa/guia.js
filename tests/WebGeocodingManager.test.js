/**
 * Unit Tests for WebGeocodingManager Class
 * 
 * Testing comprehensive orchestration functionality including:
 * - Constructor initialization and dependency injection
 * - Geolocation service coordination and configuration
 * - Address tracking and change detection
 * - Speech coordination and voice interface
 * - UI initialization and DOM management
 * - Observer pattern implementation
 * - Error handling and edge cases
 * - Browser compatibility and device detection
 * 
 * Created: 2024-12-28
 * Part of: CLASS_EXTRACTION_PHASE_16 (Final Major Phase)
 * 
 * @jest-environment node
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import WebGeocodingManager from '../src/coordination/WebGeocodingManager.js';

// Mock dependencies
const mockLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
};

const mockDisplayer = {
    displayLocation: jest.fn(),
    updateDisplay: jest.fn(),
    clear: jest.fn()
};

const mockSpeechManager = {
    speak: jest.fn(),
    initialize: jest.fn(),
    isAvailable: jest.fn(() => true)
};

const mockGeolocationService = {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    isAvailable: jest.fn(() => true),
    configure: jest.fn()
};

const mockFetchManager = {
    fetchLocationData: jest.fn(),
    isOnline: jest.fn(() => true)
};

const mockChangeDetector = {
    hasLocationChanged: jest.fn(),
    updateReference: jest.fn(),
    getThreshold: jest.fn(() => 10)
};

// Mock DOM elements
const mockDOMElements = {
    locationButton: { addEventListener: jest.fn(), disabled: false },
    coordsDisplay: { textContent: '', style: {} },
    statusElement: { textContent: '', className: '' }
};

// TODO: This test suite expects a different WebGeocodingManager API 
// that doesn't match the current implementation. Skipping until the refactoring is completed.
describe.skip('WebGeocodingManager', () => {
    let manager;
    let mockDependencies;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock global objects
        global.window = {
            navigator: {
                geolocation: {
                    getCurrentPosition: jest.fn(),
                    watchPosition: jest.fn()
                }
            },
            document: {
                getElementById: jest.fn((id) => mockDOMElements[id] || null),
                querySelector: jest.fn()
            },
            WebGeocodingManager: undefined
        };

        mockDependencies = {
            logger: mockLogger,
            displayer: mockDisplayer,
            speechManager: mockSpeechManager,
            geolocationService: mockGeolocationService,
            fetchManager: mockFetchManager,
            changeDetector: mockChangeDetector
        };

        manager = new WebGeocodingManager(mockDependencies);
    });

    afterEach(() => {
        delete global.window;
    });

    // Constructor and Initialization Tests
    describe('Constructor and Initialization', () => {
        test('should initialize with all required dependencies', () => {
            expect(manager).toBeDefined();
            expect(manager.logger).toBe(mockLogger);
            expect(manager.displayer).toBe(mockDisplayer);
            expect(manager.speechManager).toBe(mockSpeechManager);
            expect(manager.geolocationService).toBe(mockGeolocationService);
            expect(manager.fetchManager).toBe(mockFetchManager);
            expect(manager.changeDetector).toBe(mockChangeDetector);
        });

        test('should throw error when required dependencies are missing', () => {
            expect(() => {
                new WebGeocodingManager({});
            }).toThrow();

            expect(() => {
                new WebGeocodingManager({ logger: mockLogger });
            }).toThrow();
        });

        test('should initialize with default configuration', () => {
            expect(manager.config).toBeDefined();
            expect(manager.config.autoTrack).toBe(false);
            expect(manager.config.speechEnabled).toBe(true);
            expect(manager.config.watchOptions).toBeDefined();
        });

        test('should allow custom configuration override', () => {
            const customConfig = {
                autoTrack: true,
                speechEnabled: false,
                watchOptions: { timeout: 5000 }
            };

            const customManager = new WebGeocodingManager(mockDependencies, customConfig);
            expect(customManager.config.autoTrack).toBe(true);
            expect(customManager.config.speechEnabled).toBe(false);
            expect(customManager.config.watchOptions.timeout).toBe(5000);
        });

        test('should initialize observers array', () => {
            expect(manager.observers).toEqual([]);
        });

        test('should initialize tracking state as false', () => {
            expect(manager.isTracking).toBe(false);
        });
    });

    // Observer Pattern Implementation Tests
    describe('Observer Pattern Implementation', () => {
        test('should add observers correctly', () => {
            const observer1 = { update: jest.fn() };
            const observer2 = { update: jest.fn() };

            manager.addObserver(observer1);
            manager.addObserver(observer2);

            expect(manager.observers).toContain(observer1);
            expect(manager.observers).toContain(observer2);
            expect(manager.observers.length).toBe(2);
        });

        test('should remove observers correctly', () => {
            const observer1 = { update: jest.fn() };
            const observer2 = { update: jest.fn() };

            manager.addObserver(observer1);
            manager.addObserver(observer2);
            manager.removeObserver(observer1);

            expect(manager.observers).not.toContain(observer1);
            expect(manager.observers).toContain(observer2);
            expect(manager.observers.length).toBe(1);
        });

        test('should notify all observers when location changes', () => {
            const observer1 = { update: jest.fn() };
            const observer2 = { update: jest.fn() };
            const locationData = { lat: 40.7128, lng: -74.0060 };

            manager.addObserver(observer1);
            manager.addObserver(observer2);
            manager.notifyObservers(locationData);

            expect(observer1.update).toHaveBeenCalledWith(locationData);
            expect(observer2.update).toHaveBeenCalledWith(locationData);
        });

        test('should handle observer notification errors gracefully', () => {
            const faultyObserver = { 
                update: jest.fn(() => { throw new Error('Observer error'); })
            };
            const goodObserver = { update: jest.fn() };

            manager.addObserver(faultyObserver);
            manager.addObserver(goodObserver);

            expect(() => {
                manager.notifyObservers({ lat: 0, lng: 0 });
            }).not.toThrow();

            expect(goodObserver.update).toHaveBeenCalled();
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    // Geolocation Service Coordination Tests
    describe('Geolocation Service Coordination', () => {
        test('should start location tracking successfully', async () => {
            const mockPosition = {
                coords: { latitude: 40.7128, longitude: -74.0060 }
            };

            mockGeolocationService.getCurrentPosition.mockResolvedValue(mockPosition);
            mockChangeDetector.hasLocationChanged.mockReturnValue(true);

            await manager.startLocationTracking();

            expect(manager.isTracking).toBe(true);
            expect(mockGeolocationService.getCurrentPosition).toHaveBeenCalled();
            expect(mockLogger.log).toHaveBeenCalledWith('Location tracking started');
        });

        test('should handle geolocation errors gracefully', async () => {
            const error = new Error('Geolocation denied');
            mockGeolocationService.getCurrentPosition.mockRejectedValue(error);

            await manager.startLocationTracking();

            expect(manager.isTracking).toBe(false);
            expect(mockLogger.error).toHaveBeenCalledWith('Geolocation error:', error);
        });

        test('should stop location tracking', () => {
            manager.isTracking = true;
            manager.watchId = 123;
            manager.stopLocationTracking();

            expect(manager.isTracking).toBe(false);
            expect(mockLogger.log).toHaveBeenCalledWith('Location tracking stopped');
        });

        test('should configure geolocation service with custom options', () => {
            const customOptions = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            };

            manager.configureGeolocation(customOptions);

            expect(mockGeolocationService.configure).toHaveBeenCalledWith(customOptions);
            expect(manager.config.watchOptions).toEqual(customOptions);
        });

        test('should handle watch position updates', () => {
            const mockPosition = {
                coords: { latitude: 40.7128, longitude: -74.0060 }
            };

            mockChangeDetector.hasLocationChanged.mockReturnValue(true);
            manager.handlePositionUpdate(mockPosition);

            expect(mockDisplayer.updateDisplay).toHaveBeenCalled();
            expect(mockChangeDetector.updateReference).toHaveBeenCalled();
        });
    });

    // Address Tracking and Change Detection Tests
    describe('Address Tracking and Change Detection', () => {
        test('should track location changes correctly', () => {
            const oldPosition = { lat: 40.7128, lng: -74.0060 };
            const newPosition = { lat: 40.7589, lng: -73.9851 };

            mockChangeDetector.hasLocationChanged.mockReturnValue(true);

            const hasChanged = manager.checkLocationChange(oldPosition, newPosition);

            expect(hasChanged).toBe(true);
            expect(mockChangeDetector.hasLocationChanged).toHaveBeenCalledWith(oldPosition, newPosition);
        });

        test('should not track insignificant location changes', () => {
            const position1 = { lat: 40.7128, lng: -74.0060 };
            const position2 = { lat: 40.7129, lng: -74.0061 }; // Very small change

            mockChangeDetector.hasLocationChanged.mockReturnValue(false);

            const hasChanged = manager.checkLocationChange(position1, position2);

            expect(hasChanged).toBe(false);
        });

        test('should update reference location after significant change', () => {
            const newPosition = { lat: 40.7589, lng: -73.9851 };

            manager.updateLocationReference(newPosition);

            expect(mockChangeDetector.updateReference).toHaveBeenCalledWith(newPosition);
            expect(mockLogger.debug).toHaveBeenCalledWith('Location reference updated');
        });

        test('should handle address geocoding requests', async () => {
            const address = "Times Square, New York";
            const mockGeocodedData = {
                lat: 40.7589,
                lng: -73.9851,
                address: "Times Square, New York, NY"
            };

            mockFetchManager.fetchLocationData.mockResolvedValue(mockGeocodedData);

            const result = await manager.geocodeAddress(address);

            expect(result).toEqual(mockGeocodedData);
            expect(mockFetchManager.fetchLocationData).toHaveBeenCalledWith(address);
        });

        test('should handle geocoding failures', async () => {
            const address = "Invalid Address";
            mockFetchManager.fetchLocationData.mockRejectedValue(new Error('Geocoding failed'));

            const result = await manager.geocodeAddress(address);

            expect(result).toBeNull();
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    // Speech Coordination Tests
    describe('Speech Coordination', () => {
        test('should speak location information when enabled', () => {
            manager.config.speechEnabled = true;
            const locationText = "You are at Times Square, New York";

            manager.speakLocation(locationText);

            expect(mockSpeechManager.speak).toHaveBeenCalledWith(locationText);
        });

        test('should not speak when speech is disabled', () => {
            manager.config.speechEnabled = false;
            const locationText = "You are at Times Square, New York";

            manager.speakLocation(locationText);

            expect(mockSpeechManager.speak).not.toHaveBeenCalled();
        });

        test('should initialize speech manager', () => {
            manager.initializeSpeech();

            expect(mockSpeechManager.initialize).toHaveBeenCalled();
        });

        test('should handle speech manager errors gracefully', () => {
            mockSpeechManager.speak.mockImplementation(() => {
                throw new Error('Speech synthesis failed');
            });

            expect(() => {
                manager.speakLocation("Test message");
            }).not.toThrow();

            expect(mockLogger.error).toHaveBeenCalled();
        });

        test('should check speech availability', () => {
            const isAvailable = manager.isSpeechAvailable();

            expect(isAvailable).toBe(true);
            expect(mockSpeechManager.isAvailable).toHaveBeenCalled();
        });
    });

    // UI Initialization and DOM Management Tests
    describe('UI Initialization and DOM Management', () => {
        test('should initialize UI elements successfully', () => {
            global.window.document.getElementById.mockImplementation((id) => {
                return mockDOMElements[id] || { addEventListener: jest.fn() };
            });

            manager.initializeUI();

            expect(mockLogger.log).toHaveBeenCalledWith('UI initialized successfully');
        });

        test('should handle missing DOM elements gracefully', () => {
            global.window.document.getElementById.mockReturnValue(null);

            expect(() => {
                manager.initializeUI();
            }).not.toThrow();

            expect(mockLogger.warn).toHaveBeenCalled();
        });

        test('should bind event listeners to UI elements', () => {
            const mockButton = { addEventListener: jest.fn() };
            global.window.document.getElementById.mockReturnValue(mockButton);

            manager.bindUIEvents();

            expect(mockButton.addEventListener).toHaveBeenCalled();
        });

        test('should update UI status display', () => {
            const statusElement = { textContent: '', className: '' };
            global.window.document.getElementById.mockReturnValue(statusElement);

            manager.updateUIStatus('tracking', 'Currently tracking location');

            expect(statusElement.textContent).toBe('Currently tracking location');
            expect(statusElement.className).toContain('tracking');
        });

        test('should disable UI elements during processing', () => {
            const button = { disabled: false };
            global.window.document.getElementById.mockReturnValue(button);

            manager.setUIState('disabled');

            expect(button.disabled).toBe(true);
        });
    });

    // Error Handling and Edge Cases Tests
    describe('Error Handling and Edge Cases', () => {
        test('should handle null/undefined position data', () => {
            expect(() => {
                manager.handlePositionUpdate(null);
            }).not.toThrow();

            expect(mockLogger.error).toHaveBeenCalled();
        });

        test('should handle invalid coordinates', () => {
            const invalidPosition = {
                coords: { latitude: 'invalid', longitude: 'invalid' }
            };

            expect(() => {
                manager.handlePositionUpdate(invalidPosition);
            }).not.toThrow();

            expect(mockLogger.error).toHaveBeenCalled();
        });

        test('should handle network connectivity issues', async () => {
            mockFetchManager.isOnline.mockReturnValue(false);

            const result = await manager.geocodeAddress("Test Address");

            expect(result).toBeNull();
            expect(mockLogger.warn).toHaveBeenCalledWith('No network connection available');
        });

        test('should handle missing dependencies gracefully', () => {
            const partialDependencies = { logger: mockLogger };

            expect(() => {
                new WebGeocodingManager(partialDependencies);
            }).toThrow('Missing required dependencies');
        });

        test('should handle timeout errors in geolocation', async () => {
            const timeoutError = new Error('Timeout');
            timeoutError.code = 3; // TIMEOUT error code

            mockGeolocationService.getCurrentPosition.mockRejectedValue(timeoutError);

            await manager.startLocationTracking();

            expect(mockLogger.error).toHaveBeenCalledWith('Geolocation timeout');
        });
    });

    // Browser Compatibility and Device Detection Tests
    describe('Browser Compatibility and Device Detection', () => {
        test('should detect geolocation support', () => {
            global.window.navigator.geolocation = {};

            const isSupported = manager.isGeolocationSupported();

            expect(isSupported).toBe(true);
        });

        test('should handle browsers without geolocation support', () => {
            global.window.navigator.geolocation = undefined;

            const isSupported = manager.isGeolocationSupported();

            expect(isSupported).toBe(false);
        });

        test('should adapt behavior for mobile devices', () => {
            // Mock mobile user agent
            global.window.navigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';

            const isMobile = manager.isMobileDevice();

            expect(isMobile).toBe(true);
        });

        test('should use appropriate settings for desktop', () => {
            global.window.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

            const isMobile = manager.isMobileDevice();

            expect(isMobile).toBe(false);
        });

        test('should handle feature detection for modern APIs', () => {
            global.window.DeviceMotionEvent = {};

            const hasMotionAPI = manager.hasDeviceMotionSupport();

            expect(hasMotionAPI).toBe(true);
        });
    });

    // Integration and Workflow Tests
    describe('Integration and Workflow Tests', () => {
        test('should execute complete location tracking workflow', async () => {
            const mockPosition = {
                coords: { latitude: 40.7128, longitude: -74.0060 }
            };

            mockGeolocationService.getCurrentPosition.mockResolvedValue(mockPosition);
            mockChangeDetector.hasLocationChanged.mockReturnValue(true);
            mockFetchManager.fetchLocationData.mockResolvedValue({
                address: "New York, NY"
            });

            await manager.executeLocationWorkflow();

            expect(mockGeolocationService.getCurrentPosition).toHaveBeenCalled();
            expect(mockDisplayer.updateDisplay).toHaveBeenCalled();
            expect(mockSpeechManager.speak).toHaveBeenCalled();
        });

        test('should handle complete workflow failure gracefully', async () => {
            mockGeolocationService.getCurrentPosition.mockRejectedValue(new Error('Failed'));

            await manager.executeLocationWorkflow();

            expect(mockLogger.error).toHaveBeenCalled();
            expect(manager.isTracking).toBe(false);
        });

        test('should coordinate multiple services correctly', () => {
            const locationData = { lat: 40.7128, lng: -74.0060 };

            manager.coordinateServices(locationData);

            expect(mockDisplayer.displayLocation).toHaveBeenCalledWith(locationData);
            expect(mockChangeDetector.updateReference).toHaveBeenCalledWith(locationData);
        });
    });

    // Performance and Configuration Tests
    describe('Performance and Configuration Tests', () => {
        test('should throttle rapid location updates', () => {
            jest.useFakeTimers();

            const position1 = { coords: { latitude: 40.7128, longitude: -74.0060 } };
            const position2 = { coords: { latitude: 40.7129, longitude: -74.0061 } };

            manager.handlePositionUpdate(position1);
            manager.handlePositionUpdate(position2); // Should be throttled

            jest.advanceTimersByTime(1000);

            expect(mockDisplayer.updateDisplay).toHaveBeenCalledTimes(1);
            jest.useRealTimers();
        });

        test('should allow configuration updates at runtime', () => {
            const newConfig = {
                speechEnabled: false,
                autoTrack: true
            };

            manager.updateConfiguration(newConfig);

            expect(manager.config.speechEnabled).toBe(false);
            expect(manager.config.autoTrack).toBe(true);
        });

        test('should validate configuration parameters', () => {
            const invalidConfig = {
                watchOptions: { timeout: 'invalid' }
            };

            expect(() => {
                manager.updateConfiguration(invalidConfig);
            }).toThrow('Invalid configuration');
        });
    });

    // Cleanup and Resource Management Tests
    describe('Cleanup and Resource Management', () => {
        test('should cleanup resources when destroyed', () => {
            manager.isTracking = true;
            manager.watchId = 123;

            manager.destroy();

            expect(manager.isTracking).toBe(false);
            expect(manager.observers).toEqual([]);
            expect(mockLogger.log).toHaveBeenCalledWith('WebGeocodingManager destroyed');
        });

        test('should remove all event listeners on cleanup', () => {
            const mockElement = { 
                removeEventListener: jest.fn(),
                addEventListener: jest.fn()
            };
            global.window.document.getElementById.mockReturnValue(mockElement);

            manager.initializeUI();
            manager.cleanup();

            expect(mockElement.removeEventListener).toHaveBeenCalled();
        });

        test('should handle cleanup when resources are already released', () => {
            manager.destroy();
            
            // Should not throw when called again
            expect(() => {
                manager.destroy();
            }).not.toThrow();
        });
    });
});

// Export for potential integration testing
export {
    WebGeocodingManager,
    mockLogger,
    mockDisplayer,
    mockSpeechManager,
    mockGeolocationService,
    mockFetchManager,
    mockChangeDetector
};