/**
 * @jest-environment jsdom
 */

import AddressDataStore from '../../src/data/AddressDataStore.js';

describe('AddressDataStore', () => {
	let store;
	
	beforeEach(() => {
		store = new AddressDataStore();
	});
	
	describe('constructor', () => {
		it('should initialize with null values', () => {
			expect(store.currentAddress).toBeNull();
			expect(store.previousAddress).toBeNull();
			expect(store.currentRawData).toBeNull();
			expect(store.previousRawData).toBeNull();
		});
	});
	
	describe('update', () => {
		it('should set current address and raw data', () => {
			const address = { logradouro: 'Rua Nova' };
			const raw = { lat: -8.05, lon: -34.9 };
			
			store.update(address, raw);
			
			expect(store.currentAddress).toBe(address);
			expect(store.currentRawData).toBe(raw);
		});
		
		it('should move current to previous on update', () => {
			const address1 = { logradouro: 'Rua Antiga' };
			const raw1 = { lat: -8.05, lon: -34.9 };
			const address2 = { logradouro: 'Rua Nova' };
			const raw2 = { lat: -8.06, lon: -34.91 };
			
			store.update(address1, raw1);
			store.update(address2, raw2);
			
			expect(store.currentAddress).toBe(address2);
			expect(store.currentRawData).toBe(raw2);
			expect(store.previousAddress).toBe(address1);
			expect(store.previousRawData).toBe(raw1);
		});
		
		it('should accept null values', () => {
			store.update(null, null);
			
			expect(store.currentAddress).toBeNull();
			expect(store.currentRawData).toBeNull();
		});
		
		it('should handle multiple updates correctly', () => {
			const addr1 = { logradouro: 'A' };
			const addr2 = { logradouro: 'B' };
			const addr3 = { logradouro: 'C' };
			
			store.update(addr1, null);
			store.update(addr2, null);
			store.update(addr3, null);
			
			expect(store.currentAddress).toBe(addr3);
			expect(store.previousAddress).toBe(addr2);
		});
	});
	
	describe('getCurrent', () => {
		it('should return current address and raw data', () => {
			const address = { logradouro: 'Rua Nova' };
			const raw = { lat: -8.05, lon: -34.9 };
			
			store.update(address, raw);
			const result = store.getCurrent();
			
			expect(result.address).toBe(address);
			expect(result.raw).toBe(raw);
		});
		
		it('should return null values when not set', () => {
			const result = store.getCurrent();
			
			expect(result.address).toBeNull();
			expect(result.raw).toBeNull();
		});
	});
	
	describe('getPrevious', () => {
		it('should return previous address and raw data', () => {
			const address1 = { logradouro: 'Rua Antiga' };
			const raw1 = { lat: -8.05, lon: -34.9 };
			const address2 = { logradouro: 'Rua Nova' };
			const raw2 = { lat: -8.06, lon: -34.91 };
			
			store.update(address1, raw1);
			store.update(address2, raw2);
			
			const result = store.getPrevious();
			
			expect(result.address).toBe(address1);
			expect(result.raw).toBe(raw1);
		});
		
		it('should return null values when no history', () => {
			const result = store.getPrevious();
			
			expect(result.address).toBeNull();
			expect(result.raw).toBeNull();
		});
	});
	
	describe('hasHistory', () => {
		it('should return false initially', () => {
			expect(store.hasHistory()).toBe(false);
		});
		
		it('should return false with only current address', () => {
			store.update({ logradouro: 'Rua' }, null);
			expect(store.hasHistory()).toBe(false);
		});
		
		it('should return true with both current and previous', () => {
			store.update({ logradouro: 'Rua A' }, null);
			store.update({ logradouro: 'Rua B' }, null);
			expect(store.hasHistory()).toBe(true);
		});
		
		it('should return false after clearing', () => {
			store.update({ logradouro: 'A' }, null);
			store.update({ logradouro: 'B' }, null);
			store.clear();
			expect(store.hasHistory()).toBe(false);
		});
	});
	
	describe('clear', () => {
		it('should reset all values to null', () => {
			store.update({ logradouro: 'A' }, { lat: 1 });
			store.update({ logradouro: 'B' }, { lat: 2 });
			
			store.clear();
			
			expect(store.currentAddress).toBeNull();
			expect(store.previousAddress).toBeNull();
			expect(store.currentRawData).toBeNull();
			expect(store.previousRawData).toBeNull();
		});
	});
	
	describe('hasCurrent', () => {
		it('should return false initially', () => {
			expect(store.hasCurrent()).toBe(false);
		});
		
		it('should return true after update', () => {
			store.update({ logradouro: 'Rua' }, null);
			expect(store.hasCurrent()).toBe(true);
		});
		
		it('should return false after clearing', () => {
			store.update({ logradouro: 'Rua' }, null);
			store.clear();
			expect(store.hasCurrent()).toBe(false);
		});
	});
	
	describe('hasPrevious', () => {
		it('should return false initially', () => {
			expect(store.hasPrevious()).toBe(false);
		});
		
		it('should return false with only one update', () => {
			store.update({ logradouro: 'Rua' }, null);
			expect(store.hasPrevious()).toBe(false);
		});
		
		it('should return true after second update', () => {
			store.update({ logradouro: 'A' }, null);
			store.update({ logradouro: 'B' }, null);
			expect(store.hasPrevious()).toBe(true);
		});
	});
	
	describe('generateCacheKey (static)', () => {
		it('should generate key from address components', () => {
			const data = {
				address: {
					road: 'Rua da Aurora',
					house_number: '123',
					neighbourhood: 'Boa Vista',
					city: 'Recife',
					postcode: '50050-000',
					country_code: 'br'
				}
			};
			
			const key = AddressDataStore.generateCacheKey(data);
			
			expect(key).toBeTruthy();
			expect(key).toContain('Rua da Aurora');
			expect(key).toContain('123');
			expect(key).toContain('Boa Vista');
			expect(key).toContain('Recife');
		});
		
		it('should return null for null data', () => {
			expect(AddressDataStore.generateCacheKey(null)).toBeNull();
		});
		
		it('should return null for data without address', () => {
			expect(AddressDataStore.generateCacheKey({})).toBeNull();
		});
		
		it('should return null for empty address', () => {
			const data = { address: {} };
			expect(AddressDataStore.generateCacheKey(data)).toBeNull();
		});
		
		it('should handle alternative field names', () => {
			const data = {
				address: {
					street: 'Main Street',
					suburb: 'Downtown',
					town: 'Springfield'
				}
			};
			
			const key = AddressDataStore.generateCacheKey(data);
			
			expect(key).toContain('Main Street');
			expect(key).toContain('Downtown');
			expect(key).toContain('Springfield');
		});
		
		it('should filter out empty components', () => {
			const data = {
				address: {
					road: 'Rua Nova',
					house_number: '',
					city: 'Recife'
				}
			};
			
			const key = AddressDataStore.generateCacheKey(data);
			
			expect(key).not.toContain('||');
			expect(key).toContain('Rua Nova');
			expect(key).toContain('Recife');
		});
		
		it('should create consistent keys for same data', () => {
			const data = {
				address: {
					road: 'Rua da Aurora',
					city: 'Recife'
				}
			};
			
			const key1 = AddressDataStore.generateCacheKey(data);
			const key2 = AddressDataStore.generateCacheKey(data);
			
			expect(key1).toBe(key2);
		});
	});
});
