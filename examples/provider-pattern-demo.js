/**
 * Example: Using GeolocationService with MockGeolocationProvider
 * 
 * This example demonstrates how to use the new provider pattern to inject
 * mock geolocation behavior for testing and development.
 * 
 * @author MP Barbosa
 * @since 0.6.1-alpha
 */

import {
	GeolocationService,
	MockGeolocationProvider,
	BrowserGeolocationProvider,
	PositionManager
} from '../src/guia.js';

console.log('='.repeat(70));
console.log('GeolocationService Provider Pattern Example');
console.log('='.repeat(70));
console.log();

// Example 1: Using MockGeolocationProvider for testing
console.log('Example 1: MockGeolocationProvider');
console.log('-'.repeat(70));

const mockPosition = {
	coords: {
		latitude: -23.5505,
		longitude: -46.6333,
		accuracy: 15,
		altitude: null,
		altitudeAccuracy: null,
		heading: null,
		speed: null
	},
	timestamp: Date.now()
};

// Create a mock provider with predefined position
const mockProvider = new MockGeolocationProvider({
	defaultPosition: mockPosition,
	supported: true
});

// Create position manager for testing
const mockPositionManager = {
	update: (position) => {
		console.log('✅ PositionManager.update() called with:');
		console.log(`   Latitude: ${position.coords.latitude}`);
		console.log(`   Longitude: ${position.coords.longitude}`);
		console.log(`   Accuracy: ${position.coords.accuracy}m`);
	}
};

// Create service with mock provider
const mockService = new GeolocationService(
	null,  // No DOM element
	mockProvider,
	mockPositionManager
);

console.log('✓ Created GeolocationService with MockGeolocationProvider');
console.log(`✓ Provider supported: ${mockProvider.isSupported()}`);
console.log();

// Get position (will return mock data immediately)
try {
	const position = await mockService.getSingleLocationUpdate();
	console.log('✅ Position retrieved successfully:');
	console.log(`   Latitude: ${position.coords.latitude}`);
	console.log(`   Longitude: ${position.coords.longitude}`);
	console.log(`   Accuracy: ${position.coords.accuracy}m`);
} catch (error) {
	console.error('❌ Error getting position:', error.message);
}

console.log();

// Example 2: Mocking an error
console.log('Example 2: Mocking Geolocation Errors');
console.log('-'.repeat(70));

const errorProvider = new MockGeolocationProvider({
	defaultError: {
		code: 1,
		message: 'Permission denied by user'
	}
});

const errorService = new GeolocationService(
	null,
	errorProvider,
	mockPositionManager
);

console.log('✓ Created service that will return error');
console.log();

try {
	await errorService.getSingleLocationUpdate();
	console.log('❌ Should have thrown error');
} catch (error) {
	console.log('✅ Error handled correctly:');
	console.log(`   Name: ${error.name}`);
	console.log(`   Code: ${error.code}`);
	console.log(`   Message: ${error.message}`);
}

console.log();

// Example 3: Dynamic position changes
console.log('Example 3: Dynamic Position Changes');
console.log('-'.repeat(70));

const dynamicProvider = new MockGeolocationProvider();

const dynamicService = new GeolocationService(
	null,
	dynamicProvider,
	mockPositionManager
);

console.log('✓ Created service with dynamic provider');
console.log();

// Set São Paulo position
const saoPauloPosition = {
	coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 10 },
	timestamp: Date.now()
};
dynamicProvider.setPosition(saoPauloPosition);

try {
	const pos1 = await dynamicService.getSingleLocationUpdate();
	console.log('✅ First position (São Paulo):');
	console.log(`   Latitude: ${pos1.coords.latitude}`);
	console.log(`   Longitude: ${pos1.coords.longitude}`);
	console.log();
} catch (error) {
	console.error('❌ Error:', error.message);
}

// Change to Rio de Janeiro position
const rioPosition = {
	coords: { latitude: -22.9068, longitude: -43.1729, accuracy: 10 },
	timestamp: Date.now()
};
dynamicProvider.setPosition(rioPosition);

try {
	const pos2 = await dynamicService.getSingleLocationUpdate();
	console.log('✅ Second position (Rio de Janeiro):');
	console.log(`   Latitude: ${pos2.coords.latitude}`);
	console.log(`   Longitude: ${pos2.coords.longitude}`);
	console.log();
} catch (error) {
	console.error('❌ Error:', error.message);
}

// Example 4: Backward compatibility
console.log('Example 4: Backward Compatibility (Navigator Injection)');
console.log('-'.repeat(70));

// Old way: inject navigator object directly
const mockNavigator = {
	geolocation: {
		getCurrentPosition: (success, error, options) => {
			console.log('✓ Mock navigator.geolocation.getCurrentPosition() called');
			success({
				coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 15 },
				timestamp: Date.now()
			});
		}
	}
};

// This still works - automatically wrapped in BrowserGeolocationProvider
const backCompatService = new GeolocationService(
	null,
	mockNavigator,  // Navigator object (old way)
	mockPositionManager
);

console.log('✓ Created service with navigator object (backward compatible)');
console.log();

try {
	const position = await backCompatService.getSingleLocationUpdate();
	console.log('✅ Backward compatibility works:');
	console.log(`   Latitude: ${position.coords.latitude}`);
	console.log(`   Longitude: ${position.coords.longitude}`);
} catch (error) {
	console.error('❌ Error:', error.message);
}

console.log();
console.log('='.repeat(70));
console.log('Summary:');
console.log('✓ MockGeolocationProvider enables easy testing');
console.log('✓ Dynamic position/error changes supported');
console.log('✓ Backward compatible with navigator injection');
console.log('✓ Clean separation of concerns');
console.log('='.repeat(70));
