'use strict';

/**
 * ServiceCoordinator - Manages services, observers, and displayers
 * 
 * @fileoverview Handles all service-level coordination for WebGeocodingManager.
 * This class is responsible for managing geolocation services, reverse geocoding,
 * displayer lifecycle, and observer pattern wiring.
 * 
 * **Single Responsibility**: Service coordination and lifecycle management
 * 
 * **Design Principles**:
 * - Separation of Concerns: Isolates service coordination from UI and events
 * - Dependency Injection: Receives all services via constructor
 * - Observer Pattern: Manages observer subscriptions centrally
 * - Resource Management: Handles service cleanup properly
 * 
 * @module coordination/ServiceCoordinator
 * @since 0.7.1-alpha - Phase 1: WebGeocodingManager refactoring
 * @author Marcelo Pereira Barbosa
 * 
 * @requires core/PositionManager
 * @requires utils/logger
 * 
 * @example
 * // Basic usage
 * const coordinator = new ServiceCoordinator({
 *   geolocationService: new GeolocationService(),
 *   reverseGeocoder: new ReverseGeocoder(),
 *   changeDetectionCoordinator: new ChangeDetectionCoordinator(),
 *   observerSubject: new ObserverSubject(),
 *   displayerFactory: DisplayerFactory
 * });
 * 
 * coordinator.createDisplayers(locationResult, addressDisplay, referenceDisplay);
 * coordinator.wireObservers();
 * coordinator.startTracking();
 */

import PositionManager from '../core/PositionManager.js';
import { log, warn, error as logError } from '../utils/logger.js';
import HTMLHighlightCardsDisplayer from '../html/HTMLHighlightCardsDisplayer.js';
import HTMLSidraDisplayer from '../html/HTMLSidraDisplayer.js';

/**
 * ServiceCoordinator class - Manages service lifecycle and coordination
 * 
 * @class
 */
class ServiceCoordinator {
    /**
     * Creates a new ServiceCoordinator instance
     * 
     * @param {Object} params - Configuration parameters
     * @param {GeolocationService} params.geolocationService - Geolocation service instance
     * @param {ReverseGeocoder} params.reverseGeocoder - Reverse geocoder instance
     * @param {ChangeDetectionCoordinator} params.changeDetectionCoordinator - Change detection coordinator
     * @param {ObserverSubject} params.observerSubject - Observer subject for notifications
     * @param {Object} params.displayerFactory - Factory for creating displayers
     * 
     * @throws {TypeError} If required parameters are missing
     * 
     * @example
     * const coordinator = new ServiceCoordinator({
     *   geolocationService: geolocationService,
     *   reverseGeocoder: reverseGeocoder,
     *   changeDetectionCoordinator: changeDetector,
     *   observerSubject: observerSubject,
     *   displayerFactory: DisplayerFactory
     * });
     */
    constructor(params) {
        if (!params) {
            throw new TypeError('ServiceCoordinator: params object is required');
        }
        if (!params.geolocationService) {
            throw new TypeError('ServiceCoordinator: geolocationService is required');
        }
        if (!params.reverseGeocoder) {
            throw new TypeError('ServiceCoordinator: reverseGeocoder is required');
        }
        if (!params.changeDetectionCoordinator) {
            throw new TypeError('ServiceCoordinator: changeDetectionCoordinator is required');
        }
        if (!params.observerSubject) {
            throw new TypeError('ServiceCoordinator: observerSubject is required');
        }

        /**
         * Geolocation service for position tracking
         * @type {GeolocationService}
         * @private
         */
        this._geolocationService = params.geolocationService;
        
        /**
         * Document object for DOM manipulation
         * @type {Document}
         * @private
         */
        this._document = params.document;

        /**
         * Reverse geocoder for address lookup
         * @type {ReverseGeocoder}
         * @private
         */
        this._reverseGeocoder = params.reverseGeocoder;

        /**
         * Change detection coordinator
         * @type {ChangeDetectionCoordinator}
         * @private
         */
        this._changeDetectionCoordinator = params.changeDetectionCoordinator;

        /**
         * Observer subject for notifications
         * @type {ObserverSubject}
         * @private
         */
        this._observerSubject = params.observerSubject;

        /**
         * Factory for creating displayers
         * @type {Object}
         * @private
         */
        this._displayerFactory = params.displayerFactory;

        /**
         * Created displayers (position, address, reference place)
         * @type {Object|null}
         * @private
         */
        this._displayers = null;

        /**
         * Watch ID from geolocation service (for cleanup)
         * @type {number|null}
         * @private
         */
        this._watchId = null;

        /**
         * Flag tracking if services are initialized
         * @type {boolean}
         * @private
         */
        this._initialized = false;
    }

    /**
     * Gets the geolocation service instance.
     * 
     * Exposes the private _geolocationService for external access.
     * Needed for testing and backward compatibility.
     * 
     * @returns {GeolocationService} The geolocation service instance
     * @since 0.8.4-alpha
     */
    get geolocationService() {
        return this._geolocationService;
    }

    /**
     * Creates displayer instances for UI updates.
     * 
     * Factory method that creates all displayer instances needed for the application:
     * - Position displayer (coordinates, accuracy, altitude)
     * - Address displayer (raw geocoding data and standardized addresses)
     * - Reference place displayer (nearby landmarks)
     * - Highlight cards displayer (municipio/bairro cards)
     * - SIDRA displayer (IBGE statistical data)
     * 
     * All created displayers are frozen after creation to prevent modification.
     * 
     * @param {HTMLElement} positionDisplay - Element for coordinate display  
     * @param {HTMLElement} addressDisplay - Element for raw address display
     * @param {HTMLElement} enderecoPadronizadoDisplay - Element for standardized address display
     * @param {HTMLElement} referencePlaceDisplay - Element for reference place display
     * @param {HTMLElement} sidraDisplay - Element for SIDRA/IBGE data display
     * @returns {ServiceCoordinator} This instance for chaining
     * @throws {Error} If displayerFactory not configured
     * 
     * @example
     * const displayers = coordinator.createDisplayers(
     *   positionElement,
     *   addressElement,
     *   standardizedAddressElement,
     *   referencePlaceElement,
     *   sidraElement
     * );
     */
    createDisplayers(positionDisplay, addressDisplay, enderecoPadronizadoDisplay, referencePlaceDisplay, sidraDisplay) {
        if (!this._displayerFactory) {
            throw new Error('ServiceCoordinator: displayerFactory not configured');
        }

        console.log('>>> (ServiceCoordinator) Creating displayers with elements:', {
            positionDisplay,
            addressDisplay,
            enderecoPadronizadoDisplay,
            referencePlaceDisplay,
            sidraDisplay
        });
        this._displayers = {
            position: this._displayerFactory.createPositionDisplayer(positionDisplay),
            address: this._displayerFactory.createAddressDisplayer(
                addressDisplay,
                enderecoPadronizadoDisplay
            ),
            referencePlace: this._displayerFactory.createReferencePlaceDisplayer(
                referencePlaceDisplay
            ),
            highlightCards: this._document ? this._displayerFactory.createHighlightCardsDisplayer(this._document) : null,
            sidra: sidraDisplay ? this._displayerFactory.createSidraDisplayer(sidraDisplay) : null
        };

        Object.freeze(this._displayers);
        
        log('ServiceCoordinator: Displayers created', {
            position: !!this._displayers.position,
            address: !!this._displayers.address,
            referencePlace: !!this._displayers.referencePlace,
            highlightCards: !!this._displayers.highlightCards,
            sidra: !!this._displayers.sidra
        });

        return this;
    }

    /**
     * Wire all observers between services and displayers
     * 
     * Sets up the observer pattern connections:
     * - PositionManager → positionDisplayer, reverseGeocoder
     * 
     * Must be called after createDisplayers().
     * 
     * @returns {ServiceCoordinator} This instance for chaining
     * @throws {Error} If displayers not created yet
     * 
     * @example
     * coordinator.createDisplayers(...);
     * coordinator.wireObservers();
     */
    wireObservers() {
        if (!this._displayers) {
            throw new Error('ServiceCoordinator: Displayers must be created before wiring observers');
        }

        const positionManager = PositionManager.getInstance();

        // Wire position displayer to position updates
        if (this._displayers.position) {
            positionManager.subscribe(this._displayers.position);
            log('ServiceCoordinator: Position displayer wired');
        }

        // Wire reverse geocoder to position updates
        if (this._reverseGeocoder) {
            positionManager.subscribe(this._reverseGeocoder);
            log('ServiceCoordinator: Reverse geocoder wired');
            
            // Subscribe address displayer to address updates
            console.log('>>> (ServiceCoordinator) Wiring address-related displayers to ReverseGeocoder');
            if (this._displayers.address) {
                console.log('>>> (ServiceCoordinator) Subscribing HTMLAddressDisplayer to ReverseGeocoder', this._displayers.address);
                this._reverseGeocoder.subscribe(this._displayers.address);
                log('>>> ServiceCoordinator: Address displayer wired');
            } else {
                console.warn('(ServiceCoordinator) address displayer is null, cannot subscribe!');
            }
            
            // Subscribe highlight cards displayer to address updates
            if (this._displayers.highlightCards) {
                console.log('>>> (ServiceCoordinator) Subscribing HTMLHighlightCardsDisplayer to ReverseGeocoder', this._displayers.highlightCards);
                this._reverseGeocoder.subscribe(this._displayers.highlightCards);
                log('>>> ServiceCoordinator: Highlight cards displayer wired');
            } else {
                console.warn('(ServiceCoordinator) highlightCards displayer is null, cannot subscribe!');
            }
            
            // Subscribe reference place displayer to address updates
            if (this._displayers.referencePlace) {
                console.log('>>> (ServiceCoordinator) Subscribing HTMLReferencePlaceDisplayer to ReverseGeocoder', this._displayers.referencePlace);
                this._reverseGeocoder.subscribe(this._displayers.referencePlace);
                log('>>> ServiceCoordinator: Reference place displayer wired');
            } else {
                console.warn('(ServiceCoordinator) referencePlace displayer is null, cannot subscribe!');
            }
            
            console.log('>>> (ServiceCoordinator) Wiring SIDRA-related displayer to ReverseGeocoder: ', this._displayers.sidra);
            // Subscribe SIDRA displayer to address updates
            if (this._displayers.sidra) {
                console.log('>>> (ServiceCoordinator) Subscribing HTMLSidraDisplayer to ReverseGeocoder', this._displayers.sidra);
                this._reverseGeocoder.subscribe(this._displayers.sidra);
                log('>>> ServiceCoordinator: SIDRA displayer wired');
            } else {
                console.warn('(ServiceCoordinator) sidra displayer is null, cannot subscribe!');
            }
            
            // Safe logging - check if observerSubject exists
            if (this._reverseGeocoder.observerSubject?.observers) {
                console.log('(ServiceCoordinator) ReverseGeocoder now has', this._reverseGeocoder.observerSubject.observers.length, 'observers');
            }
        }

        this._initialized = true;
        log('ServiceCoordinator: Observers wired successfully');

        return this;
    }

    /**
     * Get single location update
     * 
     * Requests a one-time position update from the geolocation service.
     * Updates PositionManager and coordinates upon success.
     * 
     * @returns {Promise<Object>} Promise resolving to position object
     * 
     * @example
     * coordinator.getSingleLocationUpdate()
     *   .then(position => console.log('Got position:', position))
     *   .catch(err => console.error('Failed:', err));
     */
    getSingleLocationUpdate() {
        if (!this._geolocationService) {
            return Promise.reject(new Error('ServiceCoordinator: GeolocationService not initialized'));
        }

        return this._geolocationService
            .getSingleLocationUpdate()
            .then((position) => {
                if (position && position.coords) {
                    log('ServiceCoordinator: Single location update received', {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                    
                    // Update PositionManager (this will notify all observers including displayers)
                    const positionManager = PositionManager.getInstance();
                    positionManager.update(position);
                    
                    // Update change detection coordinator
                    this._changeDetectionCoordinator.setCurrentPosition(position);
                    
                    // Update reverse geocoder coordinates
                    this._reverseGeocoder.latitude = position.coords.latitude;
                    this._reverseGeocoder.longitude = position.coords.longitude;
                    
                    // Trigger reverse geocoding to fetch address
                    this._reverseGeocoder.fetchAddress()
                        .then(() => {
                            log('ServiceCoordinator: Address fetched successfully');
                        })
                        .catch((err) => {
                            logError('ServiceCoordinator: Failed to fetch address', err);
                        });
                }
                return position;
            })
            .catch((err) => {
                logError('ServiceCoordinator: Failed to get location', err);
                throw err;
            });
    }

    /**
     * Start continuous position tracking
     * 
     * Initiates continuous position updates via watchCurrentLocation().
     * Sets up change detection for address components.
     * 
     * @returns {ServiceCoordinator} This instance for chaining
     * 
     * @example
     * coordinator.startTracking();
     */
    startTracking() {
        if (!this._geolocationService) {
            throw new Error('ServiceCoordinator: GeolocationService not initialized');
        }

        if (!this._initialized) {
            throw new Error('ServiceCoordinator: Must wire observers before starting tracking');
        }

        // Start continuous position watching
        this._watchId = this._geolocationService.watchCurrentLocation();
        
        // Set up address component change detection
        this._changeDetectionCoordinator.setupChangeDetection();

        log('ServiceCoordinator: Tracking started', { watchId: this._watchId });

        return this;
    }

    /**
     * Stop position tracking
     * 
     * Stops continuous position updates and cleans up resources.
     * 
     * @returns {ServiceCoordinator} This instance for chaining
     * 
     * @example
     * coordinator.stopTracking();
     */
    stopTracking() {
        if (this._geolocationService && this._watchId !== null) {
            if (typeof this._geolocationService.stopTracking === 'function') {
                this._geolocationService.stopTracking();
            }
            this._watchId = null;
            log('ServiceCoordinator: Tracking stopped');
        }

        return this;
    }

    /**
     * Check if services are initialized
     * 
     * @returns {boolean} True if observers are wired
     * 
     * @example
     * if (coordinator.isInitialized()) {
     *   coordinator.startTracking();
     * }
     */
    isInitialized() {
        return this._initialized;
    }

    /**
     * Check if tracking is active
     * 
     * @returns {boolean} True if currently tracking position
     * 
     * @example
     * if (coordinator.isTracking()) {
     *   console.log('Tracking active');
     * }
     */
    isTracking() {
        return this._watchId !== null;
    }

    /**
     * Get reference to geolocation service
     * 
     * @returns {GeolocationService} The geolocation service
     * 
     * @example
     * const service = coordinator.getGeolocationService();
     */
    getGeolocationService() {
        return this._geolocationService;
    }

    /**
     * Get reference to reverse geocoder
     * 
     * @returns {ReverseGeocoder} The reverse geocoder
     * 
     * @example
     * const geocoder = coordinator.getReverseGeocoder();
     */
    getReverseGeocoder() {
        return this._reverseGeocoder;
    }

    /**
     * Get reference to change detection coordinator
     * 
     * @returns {ChangeDetectionCoordinator} The change detection coordinator
     * 
     * @example
     * const detector = coordinator.getChangeDetectionCoordinator();
     */
    getChangeDetectionCoordinator() {
        return this._changeDetectionCoordinator;
    }

    /**
     * Get created displayers
     * 
     * @returns {Object|null} Frozen displayers object or null if not created
     * 
     * @example
     * const displayers = coordinator.getDisplayers();
     * if (displayers) {
     *   console.log(displayers.position);
     * }
     */
    getDisplayers() {
        return this._displayers;
    }

    /**
     * Destroy coordinator and clean up resources
     * 
     * Stops tracking, releases all references, and resets state.
     * 
     * @returns {void}
     * 
     * @example
     * coordinator.destroy();
     */
    destroy() {
        // Stop tracking if active
        this.stopTracking();

        // Release references
        this._geolocationService = null;
        this._reverseGeocoder = null;
        this._changeDetectionCoordinator = null;
        this._observerSubject = null;
        this._displayerFactory = null;
        this._displayers = null;
        this._initialized = false;

        log('ServiceCoordinator: Destroyed');
    }

    /**
     * Get string representation for debugging
     * 
     * @returns {string} Debug string
     * 
     * @example
     * console.log(coordinator.toString());
     * // "ServiceCoordinator: initialized, tracking (watchId: 123)"
     */
    toString() {
        const initStatus = this._initialized ? 'initialized' : 'not initialized';
        const trackStatus = this._watchId !== null ? `tracking (watchId: ${this._watchId})` : 'not tracking';
        const displayerCount = this._displayers ? Object.keys(this._displayers).length : 0;
        return `ServiceCoordinator: ${initStatus}, ${trackStatus}, ${displayerCount} displayers`;
    }
}

export default ServiceCoordinator;
