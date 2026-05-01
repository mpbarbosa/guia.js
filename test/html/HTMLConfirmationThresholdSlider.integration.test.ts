import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { readFileSync } from 'node:fs';

import AddressCache from '../../src/data/AddressCache.js';
import {
	getCurrentAddressConfirmationBufferThreshold,
	resetAddressConfirmationThresholdRuntimeState
} from '../../src/config/addressConfirmation.js';
import HTMLConfirmationBufferDisplayer from '../../src/html/HTMLConfirmationBufferDisplayer.js';
import HTMLConfirmationThresholdSlider from '../../src/html/HTMLConfirmationThresholdSlider.js';

describe('HTMLConfirmationThresholdSlider integration', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		resetAddressConfirmationThresholdRuntimeState();
		document.body.innerHTML = '';
	});

	afterEach(() => {
		AddressCache.destroy();
		resetAddressConfirmationThresholdRuntimeState();
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});

	it('updates the live confirmation-buffer card when the navbar slider changes', () => {
		const sliderHost = document.createElement('div');
		const cardHost = document.createElement('div');
		document.body.append(sliderHost, cardHost);

		const slider = new HTMLConfirmationThresholdSlider(sliderHost);
		const displayer = new HTMLConfirmationBufferDisplayer(cardHost);
		const input = sliderHost.querySelector('#address-confirmation-threshold-slider') as HTMLInputElement;

		expect(cardHost.innerHTML).toContain('— / 3');

		input.value = '6';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		jest.advanceTimersByTime(1000);

		expect(getCurrentAddressConfirmationBufferThreshold()).toBe(6);
		expect(cardHost.innerHTML).toContain('— / 6');

		displayer.destroy();
		slider.destroy();
	});

	it('places the slider container before the diagnostic card in the navbar markup', () => {
		const indexHtml = readFileSync(new URL('../../src/index.html', import.meta.url), 'utf8');
		const parsed = new DOMParser().parseFromString(indexHtml, 'text/html');
		const sliderContainer = parsed.getElementById('address-confirmation-threshold-control');
		const diagnosticCard = parsed.querySelector('.confirmation-buffer-diagnostic-card');

		expect(sliderContainer).not.toBeNull();
		expect(diagnosticCard).not.toBeNull();
		expect(
			Boolean(
				sliderContainer &&
				diagnosticCard &&
				(sliderContainer.compareDocumentPosition(diagnosticCard) & Node.DOCUMENT_POSITION_FOLLOWING)
			)
		).toBe(true);
	});
});
