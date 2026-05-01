import {
	BAIRRO_CONFIRMATION_COUNT,
	LOGRADOURO_CONFIRMATION_COUNT,
	MUNICIPIO_CONFIRMATION_COUNT
} from './defaults.js';
import { env } from './environment.js';

/**
 * Optional runtime overrides for address-field confirmation buffering.
 *
 * A single shared threshold keeps the public API simple while preserving the
 * existing per-field defaults when no override is provided.
 */
export interface AddressConfirmationThresholdOptions {
	addressConfirmationBufferThreshold?: number;
}

/**
 * Normalized thresholds consumed internally by AddressCache.
 */
export interface AddressConfirmationThresholds {
	logradouro: number;
	bairro: number;
	municipio: number;
}

export type AddressConfirmationThresholdListener = (threshold: number) => void;

export const DEFAULT_ADDRESS_CONFIRMATION_THRESHOLDS: Readonly<AddressConfirmationThresholds> = Object.freeze({
	logradouro: LOGRADOURO_CONFIRMATION_COUNT,
	bairro: BAIRRO_CONFIRMATION_COUNT,
	municipio: MUNICIPIO_CONFIRMATION_COUNT
});

export const MIN_ADDRESS_CONFIRMATION_BUFFER_THRESHOLD = 1;
export const MAX_ADDRESS_CONFIRMATION_BUFFER_THRESHOLD = 10;

const addressConfirmationThresholdListeners = new Set<AddressConfirmationThresholdListener>();
let currentAddressConfirmationBufferThreshold = normalizeAddressConfirmationThreshold(
	env.addressConfirmationBufferThreshold,
	LOGRADOURO_CONFIRMATION_COUNT
);

/**
 * Valid thresholds are positive safe integers. Zero, negatives, floats, NaN,
 * and unbounded values fall back to the default so misconfiguration does not
 * change the current confirmation behavior.
 */
export function isValidAddressConfirmationThreshold(value: unknown): value is number {
	return typeof value === 'number' &&
		Number.isInteger(value) &&
		Number.isSafeInteger(value) &&
		value >= MIN_ADDRESS_CONFIRMATION_BUFFER_THRESHOLD;
}

export function normalizeAddressConfirmationThreshold(
	value: unknown,
	fallback: number = LOGRADOURO_CONFIRMATION_COUNT
): number {
	return isValidAddressConfirmationThreshold(value) ? value : fallback;
}

export function resolveAddressConfirmationThresholds(
	options: AddressConfirmationThresholdOptions = {}
): Readonly<AddressConfirmationThresholds> {
	const override =
		options.addressConfirmationBufferThreshold ??
		currentAddressConfirmationBufferThreshold;

	if (!isValidAddressConfirmationThreshold(override)) {
		return DEFAULT_ADDRESS_CONFIRMATION_THRESHOLDS;
	}

	return Object.freeze({
		logradouro: override,
		bairro: override,
		municipio: override
	});
}

export function getCurrentAddressConfirmationBufferThreshold(): number {
	return currentAddressConfirmationBufferThreshold;
}

export function setCurrentAddressConfirmationBufferThreshold(value: unknown): number {
	const nextThreshold = normalizeAddressConfirmationThreshold(
		value,
		currentAddressConfirmationBufferThreshold
	);

	if (nextThreshold === currentAddressConfirmationBufferThreshold) {
		return currentAddressConfirmationBufferThreshold;
	}

	currentAddressConfirmationBufferThreshold = nextThreshold;
	addressConfirmationThresholdListeners.forEach((listener) => listener(currentAddressConfirmationBufferThreshold));
	return currentAddressConfirmationBufferThreshold;
}

export function subscribeAddressConfirmationThreshold(
	listener: AddressConfirmationThresholdListener
): () => void {
	addressConfirmationThresholdListeners.add(listener);
	return () => {
		addressConfirmationThresholdListeners.delete(listener);
	};
}

export function resetAddressConfirmationThresholdRuntimeState(): void {
	currentAddressConfirmationBufferThreshold = normalizeAddressConfirmationThreshold(
		env.addressConfirmationBufferThreshold,
		LOGRADOURO_CONFIRMATION_COUNT
	);
	addressConfirmationThresholdListeners.clear();
}
