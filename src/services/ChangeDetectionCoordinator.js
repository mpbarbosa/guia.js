'use strict';

/**
 * Coordinator for address component change detection.
 * 
 * Manages callbacks for detecting and notifying observers about changes in
 * address components (logradouro, bairro, municipio). This class coordinates
 * between AddressDataExtractor change detection and observer notifications.
 * 
 * @module services/ChangeDetectionCoordinator
 * @since 0.9.0-alpha (extracted from guia.js in Phase 2)
 * @author Marcelo Pereira Barbosa
 */

import ObserverSubject from '../core/ObserverSubject.js';
import { log, warn, error } from '../utils/logger.js';

/**
 * Coordinates address component change detection and notifications.
 * 
 * @class ChangeDetectionCoordinator
 */
class ChangeDetectionCoordinator {
	/**
	 * Creates a new ChangeDetectionCoordinator instance.
	 * 
	 * @param {Object} params - Configuration parameters
	 * @param {Object} params.reverseGeocoder - ReverseGeocoder instance for address data
	 * @param {Object} params.observerSubject - ObserverSubject for managing observers
	 */
	constructor(params) {
		this.reverseGeocoder = params.reverseGeocoder;
		this.observerSubject = params.observerSubject;
		this.currentPosition = null; // Will be updated externally
		
		// Store reference to AddressDataExtractor for change callbacks
		// This will be set externally to avoid circular dependencies
		this.AddressDataExtractor = null;
	}

	/**
	 * Sets the AddressDataExtractor reference.
	 * 
	 * This method allows external code to inject the AddressDataExtractor
	 * dependency, avoiding circular dependencies during module loading.
	 * 
	 * @param {Object} addressDataExtractor - AddressDataExtractor class or instance
	 * @returns {void}
	 */
	setAddressDataExtractor(addressDataExtractor) {
		this.AddressDataExtractor = addressDataExtractor;
	}

	/**
	 * Sets the current position.
	 * Called by WebGeocodingManager when position updates.
	 * 
	 * @param {Object} position - Current position object
	 */
	setCurrentPosition(position) {
		this.currentPosition = position;
	}

	/**
	 * Sets up change detection callbacks for all address components.
	 * 
	 * Registers callbacks with AddressDataExtractor for logradouro, bairro,
	 * and municipio changes. This method should be called during initialization
	 * to begin monitoring address changes.
	 * 
	 * @returns {void}
	 */
	setupChangeDetection() {
		this.setupLogradouroChangeDetection();
		this.setupBairroChangeDetection();
		this.setupMunicipioChangeDetection();
	}

	/**
	 * Removes all change detection callbacks.
	 * 
	 * Clears all callbacks registered with AddressDataExtractor. Use this
	 * during cleanup or when stopping change detection.
	 * 
	 * @returns {void}
	 */
	removeAllChangeDetection() {
		this.removeLogradouroChangeDetection();
		this.removeBairroChangeDetection();
		this.removeMunicipioChangeDetection();
	}

	/**
	 * Sets up logradouro (street) change detection using callback mechanism.
	 * 
	 * Registers a callback with AddressDataExtractor that will be invoked
	 * whenever a logradouro change is detected during address updates.
	 * This replaces the previous timer-based polling approach.
	 * 
	 * @returns {void}
	 */
	setupLogradouroChangeDetection() {
		if (!this.AddressDataExtractor) {
			warn("(ChangeDetectionCoordinator) AddressDataExtractor not available");
			return;
		}
		
		this.AddressDataExtractor.setLogradouroChangeCallback((changeDetails) => {
			this.handleLogradouroChange(changeDetails);
		});
	}

	/**
	 * Removes the logradouro change detection callback.
	 * 
	 * Clears the callback registered with AddressDataExtractor. Use this
	 * when cleaning up or stopping change detection.
	 * 
	 * @returns {void}
	 */
	removeLogradouroChangeDetection() {
		if (!this.AddressDataExtractor) return;
		this.AddressDataExtractor.setLogradouroChangeCallback(null);
	}

	/**
	 * Sets up bairro (neighborhood) change detection using callback mechanism.
	 * 
	 * Registers a callback with AddressDataExtractor that will be invoked
	 * whenever a bairro change is detected during address updates.
	 * 
	 * @returns {void}
	 */
	setupBairroChangeDetection() {
		if (!this.AddressDataExtractor) {
			warn("(ChangeDetectionCoordinator) AddressDataExtractor not available");
			return;
		}
		
		this.AddressDataExtractor.setBairroChangeCallback((changeDetails) => {
			this.handleBairroChange(changeDetails);
		});
	}

	/**
	 * Removes the bairro change detection callback.
	 * 
	 * @returns {void}
	 */
	removeBairroChangeDetection() {
		if (!this.AddressDataExtractor) return;
		this.AddressDataExtractor.setBairroChangeCallback(null);
	}

	/**
	 * Sets up municipio (municipality/city) change detection using callback mechanism.
	 * 
	 * Registers a callback with AddressDataExtractor that will be invoked
	 * whenever a municipio change is detected during address updates.
	 * 
	 * @returns {void}
	 */
	setupMunicipioChangeDetection() {
		if (!this.AddressDataExtractor) {
			warn("(ChangeDetectionCoordinator) AddressDataExtractor not available");
			return;
		}
		
		this.AddressDataExtractor.setMunicipioChangeCallback((changeDetails) => {
			this.handleMunicipioChange(changeDetails);
		});
	}

	/**
	 * Removes the municipio change detection callback.
	 * 
	 * @returns {void}
	 */
	removeMunicipioChangeDetection() {
		if (!this.AddressDataExtractor) return;
		this.AddressDataExtractor.setMunicipioChangeCallback(null);
	}

	/**
	 * Handles logradouro change events and notifies observers.
	 * 
	 * Called automatically when a logradouro change is detected. Wraps the
	 * notification call in error handling to prevent one error from breaking
	 * the entire change detection system.
	 * 
	 * @param {Object} changeDetails - Details about the logradouro change
	 * @param {Object} changeDetails.previous - Previous address component values
	 * @param {Object} changeDetails.current - Current address component values
	 * @param {boolean} changeDetails.hasChanged - Whether change actually occurred
	 * @returns {void}
	 */
	handleLogradouroChange(changeDetails) {
		try {
			this.notifyLogradouroChangeObservers(changeDetails);
		} catch (err) {
			error(
				"(ChangeDetectionCoordinator) Error handling logradouro change:",
				err,
			);
		}
	}

	/**
	 * Handles bairro change events and notifies observers.
	 * 
	 * Called automatically when a bairro change is detected. Wraps the
	 * notification call in error handling.
	 * 
	 * @param {Object} changeDetails - Details about the bairro change
	 * @param {Object} changeDetails.previous - Previous address component values
	 * @param {Object} changeDetails.current - Current address component values
	 * @param {boolean} changeDetails.hasChanged - Whether change actually occurred
	 * @returns {void}
	 */
	handleBairroChange(changeDetails) {
		try {
			this.notifyBairroChangeObservers(changeDetails);
		} catch (err) {
			error(
				"(ChangeDetectionCoordinator) Error handling bairro change:",
				err,
			);
		}
	}

	/**
	 * Handles municipio change events and notifies observers.
	 * 
	 * Called automatically when a municipio change is detected. Wraps the
	 * notification call in error handling.
	 * 
	 * @param {Object} changeDetails - Details about the municipio change
	 * @param {Object} changeDetails.previous - Previous address component values
	 * @param {Object} changeDetails.current - Current address component values
	 * @param {boolean} changeDetails.hasChanged - Whether change actually occurred
	 * @returns {void}
	 */
	handleMunicipioChange(changeDetails) {
		try {
			this.notifyMunicipioChangeObservers(changeDetails);
		} catch (err) {
			error(
				"(ChangeDetectionCoordinator) Error handling municipio change:",
				err,
			);
		}
	}

	/**
	 * Notifies observers about address component changes.
	 * 
	 * This is a generalized notification method that handles all types of address
	 * component changes (logradouro, bairro, municipio). It follows DRY principle
	 * by consolidating the notification logic that was previously duplicated across
	 * three separate methods.
	 * 
	 * The method notifies two types of observers:
	 * 1. Regular observers (via update() method) - receive change-specific data
	 * 2. Function observers - receive full context including position and address
	 * 
	 * @private
	 * @param {Object} changeDetails - Details about the address component change
	 * @param {string} changeType - Type of change ("LogradouroChanged", "BairroChanged", "MunicipioChanged")
	 * @param {*} changeData - Specific data for the change (e.g., new logradouro value)
	 * @param {string} logMessage - Optional log message for debugging
	 */
	_notifyAddressChangeObservers(changeDetails, changeType, changeData, logMessage) {
		// Log if message provided
		if (logMessage) {
			log(logMessage);
		}

		// Notify regular observers with change-specific data
		// Pass changeDetails as 4th parameter for observers that need previous/current info
		for (const observer of this.observerSubject.observers) {
			if (typeof observer.update === "function") {
				observer.update(changeData, changeType, null, changeDetails);
			}
		}

		// Notify function observers with full context
		this._notifyFunctionObserversWithError(changeDetails, changeType);
	}

	/**
	 * Notifies function observers with error handling.
	 * 
	 * Extracted method to handle function observer notifications with proper
	 * error handling. This prevents one observer's error from blocking other
	 * observers from receiving notifications.
	 * 
	 * @private
	 * @param {Object} changeDetails - Details about the change
	 * @param {string} changeType - Type of change for error messages
	 */
	_notifyFunctionObserversWithError(changeDetails, changeType) {
		for (const fn of this.observerSubject.functionObservers) {
			try {
				fn(
					this.currentPosition,
					this.reverseGeocoder.currentAddress,
					this.reverseGeocoder.enderecoPadronizado,
					changeDetails
				);
			} catch (err) {
				error(
					`(ChangeDetectionCoordinator) Error notifying function observer about ${changeType}:`,
					err
				);
			}
		}
	}

	/**
	 * Notifies observers specifically about logradouro changes.
	 * 
	 * Uses the generalized notification method with logradouro-specific parameters.
	 * 
	 * @param {Object} changeDetails - Details about the logradouro change
	 * @param {Object} changeDetails.current - Current address component values
	 * @param {string} changeDetails.current.logradouro - New logradouro value
	 */
	notifyLogradouroChangeObservers(changeDetails) {
		this._notifyAddressChangeObservers(
			changeDetails,
			"LogradouroChanged",
			changeDetails.current.logradouro,
			null // No specific log message for logradouro
		);
	}

	/**
	 * Notifies observers specifically about bairro changes.
	 * 
	 * Uses the generalized notification method with bairro-specific parameters.
	 * 
	 * @param {Object} changeDetails - Details about the bairro change
	 * @param {Object} changeDetails.current - Current address component values
	 * @param {string} changeDetails.current.bairro - New bairro value
	 */
	notifyBairroChangeObservers(changeDetails) {
		this._notifyAddressChangeObservers(
			changeDetails,
			"BairroChanged",
			changeDetails.current.bairro,
			'(ChangeDetectionCoordinator) Notificando os observadores da mudança de bairro.'
		);
	}

	/**
	 * Notifies observers specifically about municipio changes.
	 * 
	 * Uses the generalized notification method with municipio-specific parameters.
	 * Note: For municipio changes, the entire currentAddress is passed as changeData
	 * to maintain backward compatibility with existing observers.
	 * 
	 * @param {Object} changeDetails - Details about the municipio change
	 */
	notifyMunicipioChangeObservers(changeDetails) {
		this._notifyAddressChangeObservers(
			changeDetails,
			"MunicipioChanged",
			this.reverseGeocoder.currentAddress, // Full address for municipio
			'(ChangeDetectionCoordinator) Notificando os observadores da mudança de município.'
		);
	}
}

export default ChangeDetectionCoordinator;
/**
 * Module exports for change detection coordination.
 * @exports ChangeDetectionCoordinator - Coordinates position and address change notifications
 */
export { ChangeDetectionCoordinator };
