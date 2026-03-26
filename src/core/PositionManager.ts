
/**
 * Centralized singleton manager for device geographic position.
 * 
 * PositionManager implements the singleton and observer patterns to provide a single
 * source of truth for the current device position. It wraps the browser's Geolocation API,
 * applies multi-layer validation rules (accuracy, distance, time thresholds), and notifies
 * subscribed observers about position changes.
 * 
 * Key Features:
 * - Singleton pattern ensures one position state across application
 * - Observer pattern for decoupled position change notifications
 * - Smart filtering prevents excessive processing from GPS noise
 * - Multi-layer validation (accuracy quality, distance OR time threshold)
 * - Integration with GeoPosition for enhanced position data
 * 
 * Validation Rules (v0.9.0-alpha):
 * 1. Accuracy Quality: Rejects medium/bad/very bad accuracy on mobile devices
 * 2. Distance OR Time Threshold: Updates if EITHER condition is met:
 *    - Movement ≥ 20 meters OR
 *    - Time elapsed ≥ 30 seconds
 * 3. Event Classification: Distinguishes regular updates (≥50s) from immediate updates (<50s)
 * 
 * @module core/PositionManager
 * @pattern Singleton - Only one instance manages position state
 * @pattern Observer - Notifies subscribers of position changes
 * 
 * @see {@link GeoPosition} For position data wrapper with convenience methods
 * @see {@link ObserverSubject} For observer pattern implementation
 * @see [Complete Documentation](../../docs/architecture/POSITION_MANAGER.md)
 * 
 * @since 0.6.0-alpha
 * @author Marcelo Pereira Barbosa
 */

import { GeoPosition } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.12.6-alpha/dist/esm/index.js';
import ObserverSubject from './ObserverSubject.js';
import { calculateDistance } from '../utils/distance.js';
import { log, warn } from '../utils/logger.js';
import { withObserver } from '../utils/ObserverMixin.js';
import { createDefaultConfig } from '../config/defaults.js';

// Initialize with defaults
type AppSetupConfig = Omit<ReturnType<typeof createDefaultConfig>, 'notAcceptedAccuracy'> & {
	notAcceptedAccuracy: string[] | null;
};
let setupParams: AppSetupConfig = createDefaultConfig() as AppSetupConfig;

/** Configuration type for PositionManager. */
export type PositionManagerConfig = AppSetupConfig;

/**
 * Returns a PositionManagerConfig populated with default values.
 */
export function createPositionManagerConfig(): PositionManagerConfig {
	return createDefaultConfig() as PositionManagerConfig;
}

/**
 * Replaces (merges) the active PositionManager configuration with the provided values.
 * Missing keys are filled from createPositionManagerConfig() defaults.
 * @param {Object} config - Partial configuration to apply
 * @since 0.9.0-alpha
 */
export function initializeConfig(config: Partial<AppSetupConfig>): void {
	setupParams = { ...createDefaultConfig(), ...config } as AppSetupConfig;
}

/**
 * Manages the current geolocation position using singleton and observer design patterns.
 */
class PositionManager {
	static instance: PositionManager | null = null;

	private observerSubject!: InstanceType<typeof ObserverSubject>;
	private lastModified: number | null = null;
	/** Last accepted geographic position (public in library). */
	lastPosition: GeoPosition | null = null;
	/**
	 * When true, the distance/time gate is bypassed so every throttled GPS fix
	 * is forwarded to subscribers.  Set to true by `LogradouroChangeTrigger`
	 * (via `ServiceCoordinator`) while a logradouro confirmation is in progress,
	 * so the confirmation buffer can fill up quickly regardless of movement
	 * distance.  Reverts to false once all confirmation buffers settle.
	 * @since 0.12.10-alpha
	 */
	private _bypassDistanceRule = false;

	declare subscribe: (observer: { update?: (...args: unknown[]) => void } | ((...args: unknown[]) => void)) => void;
	declare unsubscribe: (observer: { update?: (...args: unknown[]) => void } | ((...args: unknown[]) => void)) => void;

	static strCurrPosUpdate = "PositionManager updated";
	static strCurrPosNotUpdate = "PositionManager not updated";
	static strImmediateAddressUpdate = 'Immediate address update';

	static getInstance(position?: GeolocationPosition): PositionManager {
		if (!PositionManager.instance) {
			PositionManager.instance = new PositionManager(position);
		} else if (position) {
			PositionManager.instance.update(position);
		}
		return PositionManager.instance!;
	}

	constructor(position?: GeolocationPosition) {
		this.observerSubject = new ObserverSubject();
		this.lastModified = null;
		if (position) {
			this.update(position);
		}
	}

	get observers() {
		return this.observerSubject.observers;
	}

	get latitude() { return this.lastPosition?.latitude; }
	get longitude() { return this.lastPosition?.longitude; }
	get accuracy() { return this.lastPosition?.accuracy; }
	get accuracyQuality() { return this.lastPosition?.accuracyQuality; }
	get altitude() { return this.lastPosition?.altitude; }
	get heading() { return this.lastPosition?.heading; }
	get speed() { return this.lastPosition?.speed; }
	get timestamp() { return this.lastPosition?.timestamp; }

	notifyObservers(posEvent: string, data: unknown = null, error: { name: string; message: string } | null = null): void {
		this.observerSubject.notifyObservers(this, posEvent, data, error);
	}

	update(position: GeolocationPosition): void {
		let bUpdateCurrPos = true;
		let error = null;

		log("(PositionManager) update called with position:", position);
		log("(PositionManager) lastPosition:", this.lastPosition);

		if (!position || !position.timestamp) {
			warn("(PositionManager) Invalid position data:", position);
			return;
		}

		if (
			setupParams.notAcceptedAccuracy &&
			Array.isArray(setupParams.notAcceptedAccuracy) &&
			setupParams.notAcceptedAccuracy.includes(
				GeoPosition.getAccuracyQuality(position.coords.accuracy)
			)
		) {
			bUpdateCurrPos = false;
			error = { name: "AccuracyError", message: "Accuracy is not good enough" };
			warn("(PositionManager) Accuracy not good enough:", position.coords.accuracy);
		}

		if (
			this.lastPosition &&
			position &&
			this.lastPosition.latitude &&
			this.lastPosition.longitude &&
			position.coords
		) {
			const distance = calculateDistance(
				this.lastPosition.latitude,
				this.lastPosition.longitude,
				position.coords.latitude,
				position.coords.longitude,
			);

			const timeElapsed = position.timestamp - (this.lastModified || 0);
			const timeElapsedSeconds = (timeElapsed / 1000).toFixed(1);

			const distanceExceeded = distance >= setupParams.minimumDistanceChange;
			const timeExceeded = timeElapsed >= setupParams.minimumTimeChange;

			if (!distanceExceeded && !timeExceeded) {
				if (this._bypassDistanceRule) {
					log("(PositionManager) Distance/time gate bypassed (confirmation pending) - distance:", distance.toFixed(1) + "m", "time:", timeElapsedSeconds + "s");
				} else {
					bUpdateCurrPos = false;
					error = {
						name: "DistanceAndTimeError",
						message: `Neither distance (${distance.toFixed(1)}m < ${setupParams.minimumDistanceChange}m) nor time (${timeElapsedSeconds}s < ${setupParams.minimumTimeChange / 1000}s) threshold met`
					};
					warn("(PositionManager) Update blocked - distance:", distance.toFixed(1) + "m", "time:", timeElapsedSeconds + "s");
				}
			} else {
				if (distanceExceeded && timeExceeded) {
					log("(PositionManager) Update triggered - BOTH conditions met - distance:", distance.toFixed(1) + "m", "time:", timeElapsedSeconds + "s");
				} else if (distanceExceeded) {
					log("(PositionManager) Update triggered by DISTANCE -", distance.toFixed(1) + "m", "(time:", timeElapsedSeconds + "s)");
				} else {
					log("(PositionManager) Update triggered by TIME -", timeElapsedSeconds + "s", "(distance:", distance.toFixed(1) + "m)");
				}
			}
		}

		if (!bUpdateCurrPos) {
			this.notifyObservers(PositionManager.strCurrPosNotUpdate, null, error);
			return;
		}

		let posEvent = "";

		if (position.timestamp - (this.lastModified || 0) < setupParams.trackingInterval) {
			const errorMessage = `Less than ${setupParams.trackingInterval / 1000} seconds since last update: ${(position.timestamp - (this.lastModified || 0)) / 1000} seconds`;
			error = { name: "ElapseTimeError", message: errorMessage };
			warn("(PositionManager) " + errorMessage);
			posEvent = PositionManager.strImmediateAddressUpdate;
		} else {
			posEvent = PositionManager.strCurrPosUpdate;
		}

		this.lastPosition = new GeoPosition(position);
		this.lastModified = position.timestamp;
		this.notifyObservers(posEvent, null, error);
	}

	/**
	 * Enables or disables the distance/time gate bypass.
	 *
	 * When `true`, `PositionManager.update()` will forward every (throttled) GPS
	 * fix to subscribers even if neither the distance nor the time threshold has
	 * been met.  This should be set to `true` while a logradouro confirmation is
	 * in progress (driven by `LogradouroChangeTrigger`) and restored to `false`
	 * once the confirmation buffers settle.
	 *
	 * @param bypass - `true` to bypass the distance/time gate; `false` to restore normal behaviour.
	 * @since 0.12.10-alpha
	 */
	setBypassDistanceRule(bypass: boolean): void {
		this._bypassDistanceRule = bypass;
	}

	/** Returns whether the distance/time gate bypass is currently active. */
	get bypassDistanceRule(): boolean {
		return this._bypassDistanceRule;
	}

	toString() {
		const position = this.lastPosition;
		if (!position || !this.latitude || !this.longitude) {
			return `${this.constructor.name}: No position data`;
		}
		return `${this.constructor.name}: ${position.latitude}, ${position.longitude}, ${position.accuracyQuality}, ${position.altitude}, ${position.speed}, ${position.heading}, ${position.timestamp}`;
	}
}

Object.assign(PositionManager.prototype, withObserver({ excludeNotify: true }));

export default PositionManager;
