import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';

let HTMLConfirmationThresholdSlider: typeof import('../../src/html/HTMLConfirmationThresholdSlider.js').default;
let AddressCache: {
	configure: jest.Mock;
};
let getCurrentAddressConfirmationBufferThreshold: jest.Mock;
let setCurrentAddressConfirmationBufferThreshold: jest.Mock;
let subscribeAddressConfirmationThreshold: jest.Mock;
let subscriptionListener: ((threshold: number) => void) | null = null;
const unsubscribeMock = jest.fn();

beforeAll(async () => {
	getCurrentAddressConfirmationBufferThreshold = jest.fn(() => 3);
	setCurrentAddressConfirmationBufferThreshold = jest.fn((value: number) => value);
	subscribeAddressConfirmationThreshold = jest.fn((listener: (threshold: number) => void) => {
		subscriptionListener = listener;
		return unsubscribeMock;
	});

	await jest.unstable_mockModule('../../src/data/AddressCache.js', () => ({
		default: {
			configure: jest.fn()
		}
	}));

	await jest.unstable_mockModule('../../src/config/addressConfirmation.js', () => ({
		MIN_ADDRESS_CONFIRMATION_BUFFER_THRESHOLD: 1,
		MAX_ADDRESS_CONFIRMATION_BUFFER_THRESHOLD: 10,
		getCurrentAddressConfirmationBufferThreshold,
		setCurrentAddressConfirmationBufferThreshold,
		subscribeAddressConfirmationThreshold
	}));

	({ default: HTMLConfirmationThresholdSlider } = await import('../../src/html/HTMLConfirmationThresholdSlider.js'));
	({ default: AddressCache } = await import('../../src/data/AddressCache.js') as {
		default: { configure: jest.Mock };
	});
});

describe('HTMLConfirmationThresholdSlider', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		jest.clearAllMocks();
		subscriptionListener = null;
		unsubscribeMock.mockClear();
		getCurrentAddressConfirmationBufferThreshold.mockReturnValue(3);
		setCurrentAddressConfirmationBufferThreshold.mockImplementation((value: number) => value);
	});

	it('renders an accessible range slider with the current threshold and supported bounds', () => {
		const host = document.createElement('div');
		const slider = new HTMLConfirmationThresholdSlider(host);

		const input = host.querySelector('#address-confirmation-threshold-slider') as HTMLInputElement;
		const output = host.querySelector('#address-confirmation-threshold-value') as HTMLOutputElement;

		expect(input).not.toBeNull();
		expect(input.type).toBe('range');
		expect(input.min).toBe('1');
		expect(input.max).toBe('10');
		expect(input.value).toBe('3');
		expect(input.getAttribute('aria-controls')).toBe('confirmation-buffer-card');
		expect(output.textContent).toBe('3 leituras');
		expect(AddressCache.configure).toHaveBeenCalledWith({ addressConfirmationBufferThreshold: 3 });

		slider.destroy();
	});

	it('updates the runtime threshold in real time when the slider moves', () => {
		const host = document.createElement('div');
		const slider = new HTMLConfirmationThresholdSlider(host);
		const input = host.querySelector('#address-confirmation-threshold-slider') as HTMLInputElement;
		const output = host.querySelector('#address-confirmation-threshold-value') as HTMLOutputElement;

		input.value = '7';
		input.dispatchEvent(new Event('input', { bubbles: true }));

		expect(setCurrentAddressConfirmationBufferThreshold).toHaveBeenCalledWith(7);
		expect(AddressCache.configure).toHaveBeenLastCalledWith({ addressConfirmationBufferThreshold: 7 });
		expect(output.textContent).toBe('7 leituras');

		slider.destroy();
	});

	it('reacts to external threshold updates through the shared subscription', () => {
		const host = document.createElement('div');
		const slider = new HTMLConfirmationThresholdSlider(host);
		const input = host.querySelector('#address-confirmation-threshold-slider') as HTMLInputElement;
		const output = host.querySelector('#address-confirmation-threshold-value') as HTMLOutputElement;

		expect(subscriptionListener).not.toBeNull();
		subscriptionListener?.(5);

		expect(input.value).toBe('5');
		expect(output.textContent).toBe('5 leituras');

		slider.destroy();
	});

	it('unsubscribes when destroyed', () => {
		const host = document.createElement('div');
		const slider = new HTMLConfirmationThresholdSlider(host);

		slider.destroy();

		expect(unsubscribeMock).toHaveBeenCalledTimes(1);
	});
});
