/**
 * Tests for ChangeDetectionCoordinator class
 * 
 * These tests validate the extracted change detection logic that was moved
 * from WebGeocodingManager to follow the Single Responsibility Principle.
 * 
 * The ChangeDetectionCoordinator is responsible for:
 * - Setting up and removing change detection callbacks
 * - Handling change events with error handling
 * - Notifying observers about detected changes
 */

// Mock document to prevent errors in test environment
global.document = undefined;

const { 
    ChangeDetectionCoordinator, 
    ObserverSubject, 
    ReverseGeocoder,
    AddressDataExtractor 
} = require('../src/guia.js');

describe('ChangeDetectionCoordinator', () => {
    let coordinator;
    let mockReverseGeocoder;
    let mockObserverSubject;

    beforeEach(() => {
        // Create mock reverse geocoder
        mockReverseGeocoder = {
            currentAddress: {
                logradouro: 'Rua Teste',
                bairro: 'Bairro Teste',
                municipio: 'São Paulo'
            },
            enderecoPadronizado: 'Rua Teste, Bairro Teste - São Paulo/SP'
        };

        // Create mock observer subject
        mockObserverSubject = new ObserverSubject();

        // Create coordinator instance
        coordinator = new ChangeDetectionCoordinator({
            reverseGeocoder: mockReverseGeocoder,
            observerSubject: mockObserverSubject
        });
    });

    afterEach(() => {
        // Clean up callbacks after each test
        AddressDataExtractor.setLogradouroChangeCallback(null);
        AddressDataExtractor.setBairroChangeCallback(null);
        AddressDataExtractor.setMunicipioChangeCallback(null);
    });

    describe('Constructor and Initialization', () => {
        test('should initialize with required parameters', () => {
            expect(coordinator).toBeDefined();
            expect(coordinator.reverseGeocoder).toBe(mockReverseGeocoder);
            expect(coordinator.observerSubject).toBe(mockObserverSubject);
            expect(coordinator.currentPosition).toBeNull();
        });

        test('should accept and store observer subject', () => {
            const customObserverSubject = new ObserverSubject();
            const customCoordinator = new ChangeDetectionCoordinator({
                reverseGeocoder: mockReverseGeocoder,
                observerSubject: customObserverSubject
            });

            expect(customCoordinator.observerSubject).toBe(customObserverSubject);
        });
    });

    describe('Position Management', () => {
        test('should update current position', () => {
            const mockPosition = {
                coords: {
                    latitude: -23.5505,
                    longitude: -46.6333
                },
                timestamp: Date.now()
            };

            coordinator.setCurrentPosition(mockPosition);
            expect(coordinator.currentPosition).toBe(mockPosition);
        });

        test('should allow null position', () => {
            coordinator.setCurrentPosition(null);
            expect(coordinator.currentPosition).toBeNull();
        });
    });

    describe('Change Detection Setup', () => {
        test('should set up all change detection callbacks', () => {
            coordinator.setupChangeDetection();

            // Verify callbacks are registered
            expect(AddressDataExtractor.getLogradouroChangeCallback()).toBeDefined();
            expect(AddressDataExtractor.getBairroChangeCallback()).toBeDefined();
            expect(AddressDataExtractor.getMunicipioChangeCallback()).toBeDefined();
        });

        test('should set up logradouro change detection independently', () => {
            coordinator.setupLogradouroChangeDetection();
            expect(AddressDataExtractor.getLogradouroChangeCallback()).toBeDefined();
        });

        test('should set up bairro change detection independently', () => {
            coordinator.setupBairroChangeDetection();
            expect(AddressDataExtractor.getBairroChangeCallback()).toBeDefined();
        });

        test('should set up municipio change detection independently', () => {
            coordinator.setupMunicipioChangeDetection();
            expect(AddressDataExtractor.getMunicipioChangeCallback()).toBeDefined();
        });
    });

    describe('Change Detection Removal', () => {
        test('should remove all change detection callbacks', () => {
            coordinator.setupChangeDetection();
            coordinator.removeAllChangeDetection();

            expect(AddressDataExtractor.getLogradouroChangeCallback()).toBeNull();
            expect(AddressDataExtractor.getBairroChangeCallback()).toBeNull();
            expect(AddressDataExtractor.getMunicipioChangeCallback()).toBeNull();
        });

        test('should remove logradouro change detection independently', () => {
            coordinator.setupLogradouroChangeDetection();
            coordinator.removeLogradouroChangeDetection();
            expect(AddressDataExtractor.getLogradouroChangeCallback()).toBeNull();
        });

        test('should remove bairro change detection independently', () => {
            coordinator.setupBairroChangeDetection();
            coordinator.removeBairroChangeDetection();
            expect(AddressDataExtractor.getBairroChangeCallback()).toBeNull();
        });

        test('should remove municipio change detection independently', () => {
            coordinator.setupMunicipioChangeDetection();
            coordinator.removeMunicipioChangeDetection();
            expect(AddressDataExtractor.getMunicipioChangeCallback()).toBeNull();
        });
    });

    describe('Change Event Handling', () => {
        test('should handle logradouro change without errors', () => {
            const changeDetails = {
                previous: { logradouro: 'Rua Antiga' },
                current: { logradouro: 'Rua Nova' },
                hasChanged: true
            };

            // Should not throw
            expect(() => {
                coordinator.handleLogradouroChange(changeDetails);
            }).not.toThrow();
        });

        test('should handle bairro change without errors', () => {
            const changeDetails = {
                previous: { bairro: 'Bairro Antigo' },
                current: { bairro: 'Bairro Novo' },
                hasChanged: true
            };

            // Should not throw
            expect(() => {
                coordinator.handleBairroChange(changeDetails);
            }).not.toThrow();
        });

        test('should handle municipio change without errors', () => {
            const changeDetails = {
                previous: { municipio: 'Município Antigo' },
                current: { municipio: 'Município Novo' },
                hasChanged: true
            };

            // Should not throw
            expect(() => {
                coordinator.handleMunicipioChange(changeDetails);
            }).not.toThrow();
        });

        test('should catch and log errors during logradouro change handling', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            // Force an error by breaking the observer subject
            coordinator.observerSubject.observers = null;

            const changeDetails = {
                previous: { logradouro: 'Rua Antiga' },
                current: { logradouro: 'Rua Nova' },
                hasChanged: true
            };

            coordinator.handleLogradouroChange(changeDetails);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('ChangeDetectionCoordinator'),
                expect.anything()
            );

            consoleErrorSpy.mockRestore();
        });
    });

    describe('Observer Notifications', () => {
        test('should notify observers of logradouro changes', () => {
            const mockObserver = {
                update: jest.fn()
            };
            mockObserverSubject.subscribe(mockObserver);

            const changeDetails = {
                previous: { logradouro: 'Rua Antiga' },
                current: { logradouro: 'Rua Nova' },
                hasChanged: true
            };

            coordinator.notifyLogradouroChangeObservers(changeDetails);

            expect(mockObserver.update).toHaveBeenCalledWith(
                'Rua Nova',
                'LogradouroChanged',
                null,
                null
            );
        });

        test('should notify observers of bairro changes', () => {
            const mockObserver = {
                update: jest.fn()
            };
            mockObserverSubject.subscribe(mockObserver);

            const changeDetails = {
                previous: { bairro: 'Bairro Antigo' },
                current: { bairro: 'Bairro Novo' },
                hasChanged: true
            };

            coordinator.notifyBairroChangeObservers(changeDetails);

            expect(mockObserver.update).toHaveBeenCalledWith(
                'Bairro Novo',
                'BairroChanged',
                null,
                null
            );
        });

        test('should notify observers of municipio changes', () => {
            const mockObserver = {
                update: jest.fn()
            };
            mockObserverSubject.subscribe(mockObserver);

            const changeDetails = {
                previous: { municipio: 'Município Antigo' },
                current: { municipio: 'Município Novo' },
                hasChanged: true
            };

            coordinator.notifyMunicipioChangeObservers(changeDetails);

            // For municipio, the full address is passed
            expect(mockObserver.update).toHaveBeenCalledWith(
                mockReverseGeocoder.currentAddress,
                'MunicipioChanged',
                null,
                null
            );
        });

        test('should notify function observers with full context', () => {
            const mockFunctionObserver = jest.fn();
            mockObserverSubject.subscribeFunction(mockFunctionObserver);

            const mockPosition = {
                coords: { latitude: -23.5505, longitude: -46.6333 }
            };
            coordinator.setCurrentPosition(mockPosition);

            const changeDetails = {
                previous: { logradouro: 'Rua Antiga' },
                current: { logradouro: 'Rua Nova' },
                hasChanged: true
            };

            coordinator.notifyLogradouroChangeObservers(changeDetails);

            expect(mockFunctionObserver).toHaveBeenCalledWith(
                mockPosition,
                mockReverseGeocoder.currentAddress,
                mockReverseGeocoder.enderecoPadronizado,
                changeDetails
            );
        });

        test('should handle observer errors gracefully', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            const mockFunctionObserver = jest.fn(() => {
                throw new Error('Observer error');
            });
            mockObserverSubject.subscribeFunction(mockFunctionObserver);

            const changeDetails = {
                previous: { logradouro: 'Rua Antiga' },
                current: { logradouro: 'Rua Nova' },
                hasChanged: true
            };

            // Should not throw despite observer error
            expect(() => {
                coordinator.notifyLogradouroChangeObservers(changeDetails);
            }).not.toThrow();

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('Error notifying function observer'),
                expect.anything()
            );

            consoleErrorSpy.mockRestore();
        });

        test('should not break when one observer throws', () => {
            const failingObserver = jest.fn(() => {
                throw new Error('First observer fails');
            });
            const successObserver = jest.fn();

            mockObserverSubject.subscribeFunction(failingObserver);
            mockObserverSubject.subscribeFunction(successObserver);

            const changeDetails = {
                previous: { logradouro: 'Rua Antiga' },
                current: { logradouro: 'Rua Nova' },
                hasChanged: true
            };

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            coordinator.notifyLogradouroChangeObservers(changeDetails);

            // Both observers should be called despite first one failing
            expect(failingObserver).toHaveBeenCalled();
            expect(successObserver).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });
    });

    describe('Integration with AddressDataExtractor', () => {
        test('should receive callbacks from AddressDataExtractor', () => {
            const handleLogradouroChangeSpy = jest.spyOn(coordinator, 'handleLogradouroChange');
            
            coordinator.setupLogradouroChangeDetection();

            const changeDetails = {
                previous: { logradouro: 'Rua Antiga' },
                current: { logradouro: 'Rua Nova' },
                hasChanged: true
            };

            // Simulate AddressDataExtractor calling the callback
            const callback = AddressDataExtractor.getLogradouroChangeCallback();
            callback(changeDetails);

            expect(handleLogradouroChangeSpy).toHaveBeenCalledWith(changeDetails);

            handleLogradouroChangeSpy.mockRestore();
        });

        test('should handle callback after removal gracefully', () => {
            coordinator.setupLogradouroChangeDetection();
            coordinator.removeLogradouroChangeDetection();

            expect(AddressDataExtractor.getLogradouroChangeCallback()).toBeNull();
        });
    });

    describe('Separation of Concerns', () => {
        test('should be independent from WebGeocodingManager', () => {
            // Should be able to create coordinator without WebGeocodingManager
            const independentCoordinator = new ChangeDetectionCoordinator({
                reverseGeocoder: mockReverseGeocoder,
                observerSubject: new ObserverSubject()
            });

            expect(independentCoordinator).toBeDefined();
            expect(independentCoordinator.setupChangeDetection).toBeDefined();
        });

        test('should manage its own observer notifications', () => {
            const observerSubject = new ObserverSubject();
            const testCoordinator = new ChangeDetectionCoordinator({
                reverseGeocoder: mockReverseGeocoder,
                observerSubject: observerSubject
            });

            const mockObserver = {
                update: jest.fn()
            };
            observerSubject.subscribe(mockObserver);

            const changeDetails = {
                previous: { logradouro: 'Rua Antiga' },
                current: { logradouro: 'Rua Nova' },
                hasChanged: true
            };

            testCoordinator.notifyLogradouroChangeObservers(changeDetails);

            expect(mockObserver.update).toHaveBeenCalled();
        });
    });
});
