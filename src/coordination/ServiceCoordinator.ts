
/**
 * ServiceCoordinator - Manages services, observers, and displayers
 * @version 0.9.0-alpha
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
 * @since 0.9.0-alpha - Phase 1: WebGeocodingManager refactoring
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
import { log, error as logError } from '../utils/logger.js';
import AddressCache from '../data/AddressCache.js';
import {
	GEOLOCATION_THROTTLE_INTERVAL,
	GEOLOCATION_THROTTLE_CONFIRMATION_INTERVAL
} from '../config/defaults.js';
import type {
	IChangeDetectionCoordinatorForSC,
	IGeolocationServiceForSC,
	IObserverSubjectForSC,
	IReverseGeocoderForSC,
	ServiceCoordinatorParams,
} from '../types/coordinator-services.js';

/**
 * ServiceCoordinator class - Manages service lifecycle and coordination
 * 
 * @class
 */
class ServiceCoordinator {
    // ─── Private property declarations ─────────────────────────────────────
    private _geolocationService: IGeolocationServiceForSC | null;
    private _reverseGeocoder: IReverseGeocoderForSC | null;
    private _changeDetectionCoordinator: IChangeDetectionCoordinatorForSC | null;
    private _observerSubject: IObserverSubjectForSC | null;
    private _watchId: number | null;
    private _initialized: boolean;
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
    constructor(params: ServiceCoordinatorParams) {
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
        this._observerSubject = params.observerSubject as IObserverSubjectForSC;

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
     * @since 0.9.0-alpha
     */
    get geolocationService() {
        return this._geolocationService;
    }

    /**
     * Wire the reverse geocoder to PositionManager so every accepted GPS position
     * triggers a new geocoding cycle.  This is the core data-pipeline connection;
     * displayer subscriptions are now owned by Vue composables (useHighlightCards,
     * usePositionDisplayer, useAddressDisplayer, useReferencePlaceDisplayer,
     * useSidraDisplayer).
     *
     * @returns {ServiceCoordinator} This instance for chaining
     */
    wireObservers() {
        const positionManager = PositionManager.getInstance();

        if (this._reverseGeocoder) {
            positionManager.subscribe(this._reverseGeocoder);
            log('ServiceCoordinator: Reverse geocoder wired to PositionManager');
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
     *   .then(position => log('Got position:', position))
     *   .catch(err => error('Failed:', err));
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
                    this._changeDetectionCoordinator!.setCurrentPosition(position);
                    
                    // Sync reverse geocoder coordinates so they are consistent with
                    // the new position. The actual fetchAddress() call is triggered
                    // automatically via the ReverseGeocoder observer wired to
                    // PositionManager — no need to call it explicitly here, which
                    // would cause a duplicate geocode request.
                    this._reverseGeocoder!.latitude = position.coords.latitude;
                    this._reverseGeocoder!.longitude = position.coords.longitude;
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
        this._watchId = this._geolocationService.watchCurrentLocation?.(
            (position) => {
                if (position && position.coords) {
                    const positionManager = PositionManager.getInstance();
                    positionManager.update(position);
                    this._changeDetectionCoordinator!.setCurrentPosition(position);
                    this._reverseGeocoder!.latitude = position.coords.latitude;
                    this._reverseGeocoder!.longitude = position.coords.longitude;
                }
            },
            (err) => {
                logError('ServiceCoordinator: Position watch error', err);
                document.dispatchEvent(new CustomEvent('geolocation:error', { detail: { error: err } }));
            },
        ) ?? null;
        
        // Set up address component change detection
        this._changeDetectionCoordinator!.setupChangeDetection();

        // NEW (v0.12.12-alpha): Wire AddressCache pending-confirmation callback to
        // switch GeolocationService into fast-throttle mode while any address field
        // awaits confirmation (FR-04.2 / FR-04.3), and to bypass PositionManager's
        // distance/time gate so confirmation reads accumulate at full throttle speed.
        if (this._geolocationService?.setThrottleInterval) {
            const geoSvc = this._geolocationService;
            AddressCache.getInstance().setPendingConfirmationCallback((isPending: boolean) => {
                geoSvc.setThrottleInterval!(
                    isPending
                        ? GEOLOCATION_THROTTLE_CONFIRMATION_INTERVAL
                        : GEOLOCATION_THROTTLE_INTERVAL
                );
                // Bypass PositionManager distance gate while confirmation is pending
                // so every throttled GPS fix reaches ReverseGeocoder regardless of
                // how little the user has moved.
                PositionManager.getInstance().setBypassDistanceRule(isPending);
            });
        }

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
            } else if (typeof this._geolocationService.stopWatching === 'function') {
                this._geolocationService.stopWatching();
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
     *   log('Tracking active');
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
     * log(coordinator.toString());
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
