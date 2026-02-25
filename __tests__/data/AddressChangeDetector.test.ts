/**
 * @jest-environment jsdom
 */

import AddressChangeDetector from '../../src/data/AddressChangeDetector.js';

describe('AddressChangeDetector', () => {
let detector;

beforeEach(() => {
detector = new AddressChangeDetector();
});

describe('constructor', () => {
it('should initialize with empty notification signatures', () => {
expect(detector.notificationSignatures).toBeInstanceOf(Map);
expect(detector.notificationSignatures.size).toBe(0);
});
});

describe('hasFieldChanged', () => {
const current = { logradouro: 'Rua Nova', bairro: 'Boa Vista', municipio: 'Recife' };
const previous = { logradouro: 'Rua Antiga', bairro: 'Centro', municipio: 'Recife' };

it('should detect field change on first check', () => {
const changed = detector.hasFieldChanged('logradouro', current, previous);
expect(changed).toBe(true);
});

it('should not detect duplicate notification for same change', () => {
detector.hasFieldChanged('logradouro', current, previous); // First call
const changed = detector.hasFieldChanged('logradouro', current, previous); // Duplicate
expect(changed).toBe(false);
});

it('should detect change for different fields independently', () => {
const logradouroChanged = detector.hasFieldChanged('logradouro', current, previous);
const bairroChanged = detector.hasFieldChanged('bairro', current, previous);

expect(logradouroChanged).toBe(true);
expect(bairroChanged).toBe(true);
});

it('should return false if current address is null', () => {
const changed = detector.hasFieldChanged('logradouro', null, previous);
expect(changed).toBe(false);
});

it('should return false if previous address is null', () => {
const changed = detector.hasFieldChanged('logradouro', current, null);
expect(changed).toBe(false);
});

it('should return false if both addresses are null', () => {
const changed = detector.hasFieldChanged('logradouro', null, null);
expect(changed).toBe(false);
});

it('should return false if field value has not changed', () => {
const same = { municipio: 'Recife' };
const changed = detector.hasFieldChanged('municipio', same, same);
expect(changed).toBe(false);
});

it('should return false if current is undefined', () => {
const changed = detector.hasFieldChanged('logradouro', undefined, previous);
expect(changed).toBe(false);
});

it('should return false if previous is undefined', () => {
const changed = detector.hasFieldChanged('logradouro', current, undefined);
expect(changed).toBe(false);
});

it('should handle field values that are undefined', () => {
const currentWithUndefined = { logradouro: undefined };
const previousWithValue = { logradouro: 'Rua Antiga' };
const changed = detector.hasFieldChanged('logradouro', currentWithUndefined, previousWithValue);
expect(changed).toBe(true);
});

it('should track signature for each field separately', () => {
detector.hasFieldChanged('logradouro', current, previous);
detector.hasFieldChanged('bairro', current, previous);

expect(detector.notificationSignatures.get('logradouro')).toBe('Rua Antiga=>Rua Nova');
expect(detector.notificationSignatures.get('bairro')).toBe('Centro=>Boa Vista');
});

it('should detect new change after field value changes again', () => {
const first = { logradouro: 'Rua A' };
const second = { logradouro: 'Rua B' };
const third = { logradouro: 'Rua C' };

expect(detector.hasFieldChanged('logradouro', second, first)).toBe(true);
expect(detector.hasFieldChanged('logradouro', third, second)).toBe(true);
});

it('should handle empty string values', () => {
const withEmpty = { bairro: '' };
const withValue = { bairro: 'Centro' };
const changed = detector.hasFieldChanged('bairro', withEmpty, withValue);
expect(changed).toBe(true);
});

it('should work with metropolitan region field', () => {
const currentRM = { regiaoMetropolitana: 'Região Metropolitana do Recife' };
const previousRM = { regiaoMetropolitana: null };
const changed = detector.hasFieldChanged('regiaoMetropolitana', currentRM, previousRM);
expect(changed).toBe(true);
});
});

describe('getChangeDetails', () => {
const current = { logradouro: 'Rua Nova', bairro: 'Boa Vista', municipio: 'Recife' };
const previous = { logradouro: 'Rua Antiga', bairro: 'Centro', municipio: 'Olinda' };

it('should return change details with from and to values', () => {
const details = detector.getChangeDetails('logradouro', current, previous);

expect(details.from).toBe('Rua Antiga');
expect(details.to).toBe('Rua Nova');
expect(details.field).toBe('logradouro');
});

it('should include full previous and current addresses', () => {
const details = detector.getChangeDetails('bairro', current, previous);

expect(details.previousAddress).toBe(previous);
expect(details.currentAddress).toBe(current);
});

it('should include raw data when provided', () => {
const rawCurrent = { lat: -8.05, lon: -34.9 };
const rawPrevious = { lat: -8.06, lon: -34.91 };

const details = detector.getChangeDetails('municipio', current, previous, rawCurrent, rawPrevious);

expect(details.currentRawData).toBe(rawCurrent);
expect(details.previousRawData).toBe(rawPrevious);
});

it('should set raw data to null when not provided', () => {
const details = detector.getChangeDetails('logradouro', current, previous);

expect(details.currentRawData).toBeNull();
expect(details.previousRawData).toBeNull();
});

it('should handle null previous address', () => {
const details = detector.getChangeDetails('bairro', current, null);

expect(details.from).toBeNull();
expect(details.to).toBe('Boa Vista');
expect(details.previousAddress).toBeNull();
});

it('should handle null current address', () => {
const details = detector.getChangeDetails('bairro', null, previous);

expect(details.from).toBe('Centro');
expect(details.to).toBeNull();
expect(details.currentAddress).toBeNull();
});
});

describe('clearFieldSignature', () => {
it('should clear signature for specific field', () => {
const current = { logradouro: 'Rua Nova' };
const previous = { logradouro: 'Rua Antiga' };

detector.hasFieldChanged('logradouro', current, previous);
expect(detector.notificationSignatures.has('logradouro')).toBe(true);

detector.clearFieldSignature('logradouro');
expect(detector.notificationSignatures.has('logradouro')).toBe(false);
});

it('should return true if signature was cleared', () => {
detector.notificationSignatures.set('bairro', 'Centro=>Boa Vista');
const cleared = detector.clearFieldSignature('bairro');
expect(cleared).toBe(true);
});

it('should return false if signature did not exist', () => {
const cleared = detector.clearFieldSignature('nonexistent');
expect(cleared).toBe(false);
});

it('should allow same change to be detected after clearing', () => {
const current = { logradouro: 'Rua Nova' };
const previous = { logradouro: 'Rua Antiga' };

detector.hasFieldChanged('logradouro', current, previous);
expect(detector.hasFieldChanged('logradouro', current, previous)).toBe(false);

detector.clearFieldSignature('logradouro');
expect(detector.hasFieldChanged('logradouro', current, previous)).toBe(true);
});
});

describe('clearAllSignatures', () => {
it('should clear all field signatures', () => {
detector.notificationSignatures.set('logradouro', 'A=>B');
detector.notificationSignatures.set('bairro', 'X=>Y');
detector.notificationSignatures.set('municipio', 'M=>N');

expect(detector.notificationSignatures.size).toBe(3);

detector.clearAllSignatures();

expect(detector.notificationSignatures.size).toBe(0);
});

it('should allow all changes to be detected after clearing', () => {
const current = { logradouro: 'Rua Nova', bairro: 'Boa Vista' };
const previous = { logradouro: 'Rua Antiga', bairro: 'Centro' };

detector.hasFieldChanged('logradouro', current, previous);
detector.hasFieldChanged('bairro', current, previous);

detector.clearAllSignatures();

expect(detector.hasFieldChanged('logradouro', current, previous)).toBe(true);
expect(detector.hasFieldChanged('bairro', current, previous)).toBe(true);
});
});

describe('getFieldSignature', () => {
it('should return signature for existing field', () => {
detector.notificationSignatures.set('logradouro', 'Rua A=>Rua B');
const signature = detector.getFieldSignature('logradouro');
expect(signature).toBe('Rua A=>Rua B');
});

it('should return undefined for non-existent field', () => {
const signature = detector.getFieldSignature('nonexistent');
expect(signature).toBeUndefined();
});
});

describe('hasFieldSignature', () => {
it('should return true if field has signature', () => {
detector.notificationSignatures.set('bairro', 'Centro=>Boa Vista');
expect(detector.hasFieldSignature('bairro')).toBe(true);
});

it('should return false if field has no signature', () => {
expect(detector.hasFieldSignature('municipio')).toBe(false);
});
});

describe('getTrackedFields', () => {
it('should return empty array when no fields tracked', () => {
const fields = detector.getTrackedFields();
expect(fields).toEqual([]);
});

it('should return array of tracked field names', () => {
detector.notificationSignatures.set('logradouro', 'A=>B');
detector.notificationSignatures.set('bairro', 'X=>Y');

const fields = detector.getTrackedFields();
expect(fields).toHaveLength(2);
expect(fields).toContain('logradouro');
expect(fields).toContain('bairro');
});

it('should return new array each time (immutability)', () => {
detector.notificationSignatures.set('municipio', 'M=>N');

const fields1 = detector.getTrackedFields();
const fields2 = detector.getTrackedFields();

expect(fields1).toEqual(fields2);
expect(fields1).not.toBe(fields2); // Different array instances
});
});
});
