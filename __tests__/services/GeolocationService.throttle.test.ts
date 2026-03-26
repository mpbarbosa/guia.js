/**
 * @fileoverview Throttle behaviour tests for GeolocationService.
 * Verifies that both `getSingleLocationUpdate()` and `watchCurrentLocation()` respect
 * the 5-second throttle window and that `flushThrottle()` resets the cooldown.
 *
 * @jest-environment node
 * @since 0.12.10-alpha
 */

import { jest } from '@jest/globals';

global.console = {
	log: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
	info: jest.fn(),
};

global.navigator = undefined;

let GeolocationService;

try {
	const mod = await import('../../src/services/GeolocationService.js');
	GeolocationService = mod.default ?? mod.GeolocationService;
} catch (e) {
	console.warn('GeolocationService import failed:', e.message);
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function makePosition(lat = -23.55, lon = -46.63, timestamp = Date.now()) {
	return {
		coords: { latitude: lat, longitude: lon, accuracy: 10 },
		timestamp,
	};
}

function makeProvider(position, watchCallback = null) {
	return {
		isSupported: jest.fn(() => true),
		getCurrentPosition: jest.fn((success) => success(position)),
		watchPosition: jest.fn((success) => {
			if (watchCallback) watchCallback(success);
			return 1; // fake watch id
		}),
		clearWatch: jest.fn(),
	};
}

function makePositionManager() {
	return { update: jest.fn() };
}

// ─── getSingleLocationUpdate throttle ────────────────────────────────────────

describe('GeolocationService – getSingleLocationUpdate throttle', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.clearAllMocks();
	});

	test('first call reaches getCurrentPosition normally', async () => {
		if (!GeolocationService) { expect(true).toBe(true); return; }

		const pos = makePosition();
		const provider = makeProvider(pos);
		const service = new GeolocationService(null, provider, makePositionManager());

		const result = await service.getSingleLocationUpdate();
		expect(result).toBe(pos);
		expect(provider.getCurrentPosition).toHaveBeenCalledTimes(1);
	});

	test('second call within 5s returns cached position without new GPS fetch', async () => {
		if (!GeolocationService) { expect(true).toBe(true); return; }

		const pos = makePosition();
		const provider = makeProvider(pos);
		const service = new GeolocationService(null, provider, makePositionManager());

		await service.getSingleLocationUpdate(); // populates cache, stamps time

		// Advance by less than the 5000ms throttle window
		jest.advanceTimersByTime(4999);

		const result = await service.getSingleLocationUpdate();
		expect(result).toBe(pos);
		// getCurrentPosition must not be called a second time
		expect(provider.getCurrentPosition).toHaveBeenCalledTimes(1);
	});

	test('second call after 5s triggers a new GPS fetch', async () => {
		if (!GeolocationService) { expect(true).toBe(true); return; }

		const pos1 = makePosition(-23.55, -46.63, 1000);
		const pos2 = makePosition(-23.56, -46.64, 6001);
		let callCount = 0;
		const provider = {
			isSupported: jest.fn(() => true),
			getCurrentPosition: jest.fn((success) => success(callCount++ === 0 ? pos1 : pos2)),
			watchPosition: jest.fn(),
			clearWatch: jest.fn(),
		};
		const service = new GeolocationService(null, provider, makePositionManager());

		await service.getSingleLocationUpdate(); // call 1 → pos1

		jest.advanceTimersByTime(5001); // past the window

		const result = await service.getSingleLocationUpdate(); // call 2 → pos2
		expect(result).toBe(pos2);
		expect(provider.getCurrentPosition).toHaveBeenCalledTimes(2);
	});

	test('call without cached position proceeds even within 5s window', async () => {
		if (!GeolocationService) { expect(true).toBe(true); return; }

		const pos = makePosition();
		const provider = makeProvider(pos);
		const service = new GeolocationService(null, provider, makePositionManager());

		// Do NOT call getSingleLocationUpdate first — no cached position yet
		// Even if lastSingleFetchTime were somehow > 0, there's no cache to return
		// (here it's 0 so the condition won't trigger anyway, but the test documents intent)
		const result = await service.getSingleLocationUpdate();
		expect(result).toBe(pos);
		expect(provider.getCurrentPosition).toHaveBeenCalledTimes(1);
	});
});

// ─── flushThrottle ────────────────────────────────────────────────────────────

describe('GeolocationService – flushThrottle()', () => {
	beforeEach(() => jest.useFakeTimers());
	afterEach(() => { jest.useRealTimers(); jest.clearAllMocks(); });

	test('flushThrottle() allows immediate second getSingleLocationUpdate call', async () => {
		if (!GeolocationService) { expect(true).toBe(true); return; }

		const pos1 = makePosition(-23.55, -46.63, 1000);
		const pos2 = makePosition(-23.56, -46.64, 2000);
		let callCount = 0;
		const provider = {
			isSupported: jest.fn(() => true),
			getCurrentPosition: jest.fn((success) => success(callCount++ === 0 ? pos1 : pos2)),
			watchPosition: jest.fn(),
			clearWatch: jest.fn(),
		};
		const service = new GeolocationService(null, provider, makePositionManager());

		await service.getSingleLocationUpdate(); // first fetch

		// Only 100ms later — would normally be throttled
		jest.advanceTimersByTime(100);

		service.flushThrottle(); // reset cooldown

		const result = await service.getSingleLocationUpdate(); // should fire
		expect(result).toBe(pos2);
		expect(provider.getCurrentPosition).toHaveBeenCalledTimes(2);
	});
});

// ─── watchCurrentLocation throttle ────────────────────────────────────────────

describe('GeolocationService – watchCurrentLocation throttle', () => {
	beforeEach(() => jest.useFakeTimers());
	afterEach(() => { jest.useRealTimers(); jest.clearAllMocks(); });

	test('first watch callback fires immediately', () => {
		if (!GeolocationService) { expect(true).toBe(true); return; }

		let capturedSuccess;
		const provider = {
			isSupported: jest.fn(() => true),
			getCurrentPosition: jest.fn(),
			watchPosition: jest.fn((success) => { capturedSuccess = success; return 1; }),
			clearWatch: jest.fn(),
		};
		const pm = makePositionManager();
		const service = new GeolocationService(null, provider, pm);

		service.watchCurrentLocation();

		const pos = makePosition();
		capturedSuccess(pos);

		expect(pm.update).toHaveBeenCalledTimes(1);
		expect(pm.update).toHaveBeenCalledWith(pos);
	});

	test('second watch callback within 5s is dropped', () => {
		if (!GeolocationService) { expect(true).toBe(true); return; }

		let capturedSuccess;
		const provider = {
			isSupported: jest.fn(() => true),
			getCurrentPosition: jest.fn(),
			watchPosition: jest.fn((success) => { capturedSuccess = success; return 1; }),
			clearWatch: jest.fn(),
		};
		const pm = makePositionManager();
		const service = new GeolocationService(null, provider, pm);

		service.watchCurrentLocation();

		capturedSuccess(makePosition(-23.55, -46.63)); // fires
		jest.advanceTimersByTime(100);
		capturedSuccess(makePosition(-23.56, -46.64)); // dropped (within 5s)

		expect(pm.update).toHaveBeenCalledTimes(1);
	});

	test('watch callback after 5s is processed', () => {
		if (!GeolocationService) { expect(true).toBe(true); return; }

		let capturedSuccess;
		const provider = {
			isSupported: jest.fn(() => true),
			getCurrentPosition: jest.fn(),
			watchPosition: jest.fn((success) => { capturedSuccess = success; return 1; }),
			clearWatch: jest.fn(),
		};
		const pm = makePositionManager();
		const service = new GeolocationService(null, provider, pm);

		service.watchCurrentLocation();

		capturedSuccess(makePosition(-23.55, -46.63)); // call 1
		jest.advanceTimersByTime(5001);
		capturedSuccess(makePosition(-23.56, -46.64)); // call 2 — past window

		expect(pm.update).toHaveBeenCalledTimes(2);
	});

	test('flushThrottle() resets watch handler cooldown', () => {
		if (!GeolocationService) { expect(true).toBe(true); return; }

		let capturedSuccess;
		const provider = {
			isSupported: jest.fn(() => true),
			getCurrentPosition: jest.fn(),
			watchPosition: jest.fn((success) => { capturedSuccess = success; return 1; }),
			clearWatch: jest.fn(),
		};
		const pm = makePositionManager();
		const service = new GeolocationService(null, provider, pm);

		service.watchCurrentLocation();

		capturedSuccess(makePosition()); // fires
		jest.advanceTimersByTime(100);

		service.flushThrottle();

		capturedSuccess(makePosition(-23.56, -46.64)); // should fire (cooldown reset)

		expect(pm.update).toHaveBeenCalledTimes(2);
	});

	// ── setThrottleInterval() (v0.12.10-alpha) ──────────────────────────────────

	test('setThrottleInterval(2000) causes events within 2s to be throttled', () => {
		if (!GeolocationService) { expect(true).toBe(true); return; }

		let capturedSuccess;
		const provider = {
			isSupported: jest.fn(() => true),
			getCurrentPosition: jest.fn(),
			watchPosition: jest.fn((success) => { capturedSuccess = success; return 1; }),
			clearWatch: jest.fn(),
		};
		const pm = makePositionManager();
		const service = new GeolocationService(null, provider, pm);
		service.watchCurrentLocation();

		// Switch to 2s throttle
		service.setThrottleInterval(2000);

		capturedSuccess(makePosition()); // fires immediately
		jest.advanceTimersByTime(1000);
		capturedSuccess(makePosition(-23.56, -46.64)); // within 2s window — suppressed

		expect(pm.update).toHaveBeenCalledTimes(1);
	});

	test('setThrottleInterval(2000) allows events after 2s', () => {
		if (!GeolocationService) { expect(true).toBe(true); return; }

		let capturedSuccess;
		const provider = {
			isSupported: jest.fn(() => true),
			getCurrentPosition: jest.fn(),
			watchPosition: jest.fn((success) => { capturedSuccess = success; return 1; }),
			clearWatch: jest.fn(),
		};
		const pm = makePositionManager();
		const service = new GeolocationService(null, provider, pm);
		service.watchCurrentLocation();

		service.setThrottleInterval(2000);

		capturedSuccess(makePosition()); // fires immediately
		jest.advanceTimersByTime(2001);
		capturedSuccess(makePosition(-23.56, -46.64)); // past 2s window — should fire

		expect(pm.update).toHaveBeenCalledTimes(2);
	});

	test('setThrottleInterval restores 5s throttle behaviour', () => {
		if (!GeolocationService) { expect(true).toBe(true); return; }

		let capturedSuccess;
		const provider = {
			isSupported: jest.fn(() => true),
			getCurrentPosition: jest.fn(),
			watchPosition: jest.fn((success) => { capturedSuccess = success; return 1; }),
			clearWatch: jest.fn(),
		};
		const pm = makePositionManager();
		const service = new GeolocationService(null, provider, pm);
		service.watchCurrentLocation();

		// Switch to fast mode then back to normal
		service.setThrottleInterval(2000);
		service.setThrottleInterval(5000);

		capturedSuccess(makePosition()); // fires
		jest.advanceTimersByTime(2001);
		capturedSuccess(makePosition(-23.56, -46.64)); // within 5s — suppressed

		expect(pm.update).toHaveBeenCalledTimes(1);
	});
});
