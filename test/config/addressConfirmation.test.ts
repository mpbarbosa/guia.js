import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import {
	MAX_ADDRESS_CONFIRMATION_BUFFER_THRESHOLD,
	MIN_ADDRESS_CONFIRMATION_BUFFER_THRESHOLD,
	DEFAULT_ADDRESS_CONFIRMATION_THRESHOLDS,
	getCurrentAddressConfirmationBufferThreshold,
	resetAddressConfirmationThresholdRuntimeState,
	resolveAddressConfirmationThresholds,
	setCurrentAddressConfirmationBufferThreshold,
	subscribeAddressConfirmationThreshold
} from '../../src/config/addressConfirmation.js';

describe('addressConfirmation runtime state', () => {
	beforeEach(() => {
		resetAddressConfirmationThresholdRuntimeState();
	});

	it('starts from the configured default runtime threshold', () => {
		expect(getCurrentAddressConfirmationBufferThreshold()).toBe(
			DEFAULT_ADDRESS_CONFIRMATION_THRESHOLDS.logradouro
		);
	});

	it('updates the current threshold and uses it as the default resolver source', () => {
		setCurrentAddressConfirmationBufferThreshold(6);

		expect(getCurrentAddressConfirmationBufferThreshold()).toBe(6);
		expect(resolveAddressConfirmationThresholds()).toEqual({
			logradouro: 6,
			bairro: 6,
			municipio: 6
		});
	});

	it('ignores invalid runtime updates and preserves the current threshold', () => {
		setCurrentAddressConfirmationBufferThreshold(4);
		setCurrentAddressConfirmationBufferThreshold(0);
		setCurrentAddressConfirmationBufferThreshold(4.5);
		setCurrentAddressConfirmationBufferThreshold('abc');

		expect(getCurrentAddressConfirmationBufferThreshold()).toBe(4);
	});

	it('notifies subscribers only when the threshold changes', () => {
		const listener = jest.fn();
		const unsubscribe = subscribeAddressConfirmationThreshold(listener);

		setCurrentAddressConfirmationBufferThreshold(5);
		setCurrentAddressConfirmationBufferThreshold(5);
		setCurrentAddressConfirmationBufferThreshold(7);
		unsubscribe();
		setCurrentAddressConfirmationBufferThreshold(8);

		expect(listener).toHaveBeenNthCalledWith(1, 5);
		expect(listener).toHaveBeenNthCalledWith(2, 7);
		expect(listener).toHaveBeenCalledTimes(2);
	});

	it('exports the supported UI threshold range', () => {
		expect(MIN_ADDRESS_CONFIRMATION_BUFFER_THRESHOLD).toBe(1);
		expect(MAX_ADDRESS_CONFIRMATION_BUFFER_THRESHOLD).toBe(10);
	});
});
