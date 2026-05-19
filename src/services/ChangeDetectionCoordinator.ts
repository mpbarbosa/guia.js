/**
 * Compatibility adapter for the CDN ChangeDetectionCoordinator.
 *
 * Preserves the legacy guia.js constructor and Portuguese API while delegating
 * lifecycle wiring to the paraty_geoservices CDN implementation.
 *
 * @module services/ChangeDetectionCoordinator
 */

import {
	ChangeDetectionCoordinator as CDNChangeDetectionCoordinator,
	type AddressFieldChangeEvent,
	type IAddressComponentExtractor,
	type IObserverSubject,
} from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geoservices@v1.6.3/dist/esm/application/services/ChangeDetectionCoordinator.js';
import type {
	GeoAddress,
} from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geoservices@v1.6.3/dist/esm/index.js';
import { log, error, warn } from '../utils/logger.js';

interface LegacyReverseGeocoder {
	currentAddress: unknown;
	enderecoPadronizado: unknown;
}

interface LegacyObserver {
	update?: (...args: unknown[]) => void;
}

interface LegacyObserverSubject {
	observers: ReadonlyArray<LegacyObserver> | null;
	functionObservers: ReadonlyArray<(...args: unknown[]) => void>;
}

interface LegacyAddressDataExtractor {
	setLogradouroChangeCallback(callback: ((...args: unknown[]) => void) | null): void;
	setBairroChangeCallback(callback: ((...args: unknown[]) => void) | null): void;
	setMunicipioChangeCallback(callback: ((...args: unknown[]) => void) | null): void;
}

interface LegacyChangeDetails {
	to?: string | null;
	from?: string | null;
	currentAddress?: Record<string, unknown> | null;
	previousAddress?: Record<string, unknown> | null;
	current?: Record<string, unknown> | null;
	previous?: Record<string, unknown> | null;
	hasChanged?: boolean;
	[key: string]: unknown;
}

class AddressComponentExtractorAdapter implements IAddressComponentExtractor {
	private readonly extractor: LegacyAddressDataExtractor;

	constructor(extractor: LegacyAddressDataExtractor) {
		this.extractor = extractor;
	}

	setStreetChangeCallback(callback: ((event: AddressFieldChangeEvent) => void) | null): void {
		this.extractor.setLogradouroChangeCallback(callback as ((...args: unknown[]) => void) | null);
	}

	setNeighborhoodChangeCallback(callback: ((event: AddressFieldChangeEvent) => void) | null): void {
		this.extractor.setBairroChangeCallback(callback as ((...args: unknown[]) => void) | null);
	}

	setCityChangeCallback(callback: ((event: AddressFieldChangeEvent) => void) | null): void {
		this.extractor.setMunicipioChangeCallback(callback as ((...args: unknown[]) => void) | null);
	}
}

/**
 * Legacy wrapper around the CDN ChangeDetectionCoordinator.
 *
 * Uses the CDN implementation for extractor lifecycle wiring while preserving
 * the established guia.js constructor, Portuguese method names, and observer
 * payload contracts.
 */
class ChangeDetectionCoordinator extends CDNChangeDetectionCoordinator {
	public readonly reverseGeocoder: LegacyReverseGeocoder;

	constructor(params: {
		reverseGeocoder: LegacyReverseGeocoder;
		observerSubject: LegacyObserverSubject;
	}) {
		const { reverseGeocoder, observerSubject } = params;

		super({
			addressState: {
				get currentAddress() {
					return (reverseGeocoder.currentAddress ?? null) as GeoAddress | null;
				},
			},
			observerSubject: observerSubject as unknown as IObserverSubject,
			logger: {
				warn,
				error,
				info: log,
			},
		});

		this.reverseGeocoder = reverseGeocoder;
	}

	private get legacyObserverSubject(): LegacyObserverSubject {
		return this.observerSubject as unknown as LegacyObserverSubject;
	}

	setAddressDataExtractor(addressDataExtractor: LegacyAddressDataExtractor): void {
		this.setAddressComponentExtractor(new AddressComponentExtractorAdapter(addressDataExtractor));
	}

	setupLogradouroChangeDetection(): void {
		this.setupStreetChangeDetection();
	}

	removeLogradouroChangeDetection(): void {
		this.removeStreetChangeDetection();
	}

	setupBairroChangeDetection(): void {
		this.setupNeighborhoodChangeDetection();
	}

	removeBairroChangeDetection(): void {
		this.removeNeighborhoodChangeDetection();
	}

	setupMunicipioChangeDetection(): void {
		this.setupCityChangeDetection();
	}

	removeMunicipioChangeDetection(): void {
		this.removeCityChangeDetection();
	}

	handleLogradouroChange(changeDetails: LegacyChangeDetails): void {
		try {
			this.notifyLogradouroChangeObservers(changeDetails);
		} catch (err) {
			error('(ChangeDetectionCoordinator) Error handling logradouro change:', err);
		}
	}

	override handleStreetChange(event: AddressFieldChangeEvent): void {
		this.handleLogradouroChange(event as LegacyChangeDetails);
	}

	handleBairroChange(changeDetails: LegacyChangeDetails): void {
		try {
			this.notifyBairroChangeObservers(changeDetails);
		} catch (err) {
			error('(ChangeDetectionCoordinator) Error handling bairro change:', err);
		}
	}

	override handleNeighborhoodChange(event: AddressFieldChangeEvent): void {
		this.handleBairroChange(event as LegacyChangeDetails);
	}

	handleMunicipioChange(changeDetails: LegacyChangeDetails): void {
		try {
			this.notifyMunicipioChangeObservers(changeDetails);
		} catch (err) {
			error('(ChangeDetectionCoordinator) Error handling municipio change:', err);
		}
	}

	override handleCityChange(event: AddressFieldChangeEvent): void {
		this.handleMunicipioChange(event as LegacyChangeDetails);
	}

	notifyLogradouroChangeObservers(changeDetails: LegacyChangeDetails): void {
		this.notifyLegacyObservers(
			changeDetails,
			'LogradouroChanged',
			this.getChangeValue(changeDetails, 'logradouro'),
			null,
		);
	}

	override notifyStreetChangeObservers(event: AddressFieldChangeEvent): void {
		this.notifyLogradouroChangeObservers(event as LegacyChangeDetails);
	}

	notifyBairroChangeObservers(changeDetails: LegacyChangeDetails): void {
		this.notifyLegacyObservers(
			changeDetails,
			'BairroChanged',
			this.getChangeValue(changeDetails, 'bairro'),
			'(ChangeDetectionCoordinator) Notificando os observadores da mudança de bairro.',
		);
	}

	override notifyNeighborhoodChangeObservers(event: AddressFieldChangeEvent): void {
		this.notifyBairroChangeObservers(event as LegacyChangeDetails);
	}

	notifyMunicipioChangeObservers(changeDetails: LegacyChangeDetails): void {
		this.notifyLegacyObservers(
			changeDetails,
			'MunicipioChanged',
			this.reverseGeocoder.enderecoPadronizado,
			'(ChangeDetectionCoordinator) Notificando os observadores da mudança de município.',
		);
	}

	override notifyCityChangeObservers(event: AddressFieldChangeEvent): void {
		this.notifyMunicipioChangeObservers(event as LegacyChangeDetails);
	}

	private getChangeValue(changeDetails: LegacyChangeDetails, field: string): unknown {
		if (changeDetails.to !== undefined) {
			return changeDetails.to;
		}

		return (
			changeDetails.currentAddress?.[field] ??
			changeDetails.current?.[field] ??
			null
		);
	}

	private notifyLegacyObservers(
		changeDetails: LegacyChangeDetails,
		changeType: string,
		changeData: unknown,
		logMessage: string | null,
	): void {
		if (logMessage) {
			log(logMessage);
		}

		for (const observer of this.legacyObserverSubject.observers as unknown as Iterable<LegacyObserver>) {
			if (typeof observer.update === 'function') {
				observer.update(changeData, changeType, null, changeDetails);
			}
		}

		this.notifyLegacyFunctionObservers(changeDetails, changeType);
	}

	private notifyLegacyFunctionObservers(changeDetails: LegacyChangeDetails, changeType: string): void {
		for (const fn of this.legacyObserverSubject.functionObservers) {
			try {
				fn(
					this.currentPosition,
					this.reverseGeocoder.currentAddress,
					this.reverseGeocoder.enderecoPadronizado,
					changeDetails,
				);
			} catch (err) {
				error(
					`(ChangeDetectionCoordinator) Error notifying function observer about ${changeType}:`,
					err,
				);
			}
		}
	}
}

export default ChangeDetectionCoordinator;
export { ChangeDetectionCoordinator };
