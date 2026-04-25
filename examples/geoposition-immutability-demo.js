/**
 * Example demonstrating the referentially transparent GeoPosition contract.
 *
 * This file is intentionally self-contained so it can run with plain Node.js
 * even though the canonical GeoPosition implementation is provided by
 * paraty_geocore.js in browser and bundled environments.
 *
 * This example shows:
 * 1. Pure construction (no side effects)
 * 2. Immutability (defensive copying)
 * 3. Pure methods (deterministic outputs)
 *
 * @author MP Barbosa
 * @since 0.6.0-alpha
 */

const EARTH_RADIUS_METERS = 6_371_000;

function calculateDistance(latitude1, longitude1, latitude2, longitude2) {
    const toRadians = (value) => (value * Math.PI) / 180;
    const deltaLatitude = toRadians(latitude2 - latitude1);
    const deltaLongitude = toRadians(longitude2 - longitude1);
    const lat1 = toRadians(latitude1);
    const lat2 = toRadians(latitude2);
    const a = (
        Math.sin(deltaLatitude / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLongitude / 2) ** 2
    );

    return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

class GeoPosition {
    constructor(position) {
        this.coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude ?? null,
            altitudeAccuracy: position.coords.altitudeAccuracy ?? null,
            heading: position.coords.heading ?? null,
            speed: position.coords.speed ?? null
        };
        this.timestamp = position.timestamp;
        Object.freeze(this.coords);
        Object.freeze(this);
    }

    get latitude() {
        return this.coords.latitude;
    }

    get longitude() {
        return this.coords.longitude;
    }

    distanceTo(otherPosition) {
        return calculateDistance(
            this.latitude,
            this.longitude,
            otherPosition.latitude,
            otherPosition.longitude
        );
    }

    static getAccuracyQuality(accuracy) {
        if (accuracy <= 10) return 'excellent';
        if (accuracy <= 20) return 'good';
        if (accuracy <= 100) return 'medium';
        if (accuracy <= 250) return 'bad';
        return 'very bad';
    }
}

console.log('='.repeat(70));
console.log('Referentially Transparent GeoPosition Example');
console.log('='.repeat(70));

// 1. PURITY: Constructor does not mutate input
console.log('\n1. Purity - No Mutation of Input Objects:');
console.log('-'.repeat(70));

const originalPosition = {
    coords: {
        latitude: -23.5505,
        longitude: -46.6333,
        accuracy: 15,
        altitude: 760,
        altitudeAccuracy: 10,
        heading: 180,
        speed: 5
    },
    timestamp: 1634567890123
};

console.log('Before creating GeoPosition:');
console.log('  - coords.latitude =', originalPosition.coords.latitude);

const geoPosition = new GeoPosition(originalPosition);

console.log('\nAfter creating GeoPosition:');
console.log('  - coords.latitude unchanged?', originalPosition.coords.latitude === -23.5505);

// 2. IMMUTABILITY: Changes to original don't affect GeoPosition
console.log('\n2. Immutability - Defensive Copying:');
console.log('-'.repeat(70));

console.log('GeoPosition latitude before mutation:', geoPosition.latitude);

// Mutate the original
originalPosition.coords.latitude = -22.9068;
originalPosition.coords.longitude = -43.1729;

console.log('Original position mutated to Rio coordinates');
console.log('GeoPosition latitude after mutation:', geoPosition.latitude);
console.log('GeoPosition still has São Paulo coordinates?', 
    geoPosition.latitude === -23.5505 && geoPosition.longitude === -46.6333);

// 3. PURE METHODS: Same inputs = same outputs
console.log('\n3. Pure Methods - Deterministic Outputs:');
console.log('-'.repeat(70));

const restaurant = { latitude: -23.5489, longitude: -46.6388 };

const distance1 = geoPosition.distanceTo(restaurant);
const distance2 = geoPosition.distanceTo(restaurant);
const distance3 = geoPosition.distanceTo(restaurant);

console.log('Distance calculation 1:', Math.round(distance1), 'meters');
console.log('Distance calculation 2:', Math.round(distance2), 'meters');
console.log('Distance calculation 3:', Math.round(distance3), 'meters');
console.log('All results identical?', distance1 === distance2 && distance2 === distance3);

// 4. STATIC PURE FUNCTION: getAccuracyQuality
console.log('\n4. Static Pure Function - getAccuracyQuality:');
console.log('-'.repeat(70));

const accuracies = [5, 15, 50, 150, 500];
accuracies.forEach(acc => {
    const quality = GeoPosition.getAccuracyQuality(acc);
    console.log('  Accuracy ' + acc + 'm => Quality: ' + quality);
});

console.log('\n' + '='.repeat(70));
console.log('Summary: GeoPosition is now pure, immutable, and referentially transparent!');
console.log('='.repeat(70));
