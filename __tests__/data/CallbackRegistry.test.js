/**
 * @jest-environment jsdom
 */

import CallbackRegistry from '../../src/data/CallbackRegistry.js';

describe('CallbackRegistry', () => {
	let registry;
	
	beforeEach(() => {
		registry = new CallbackRegistry();
	});
	
	describe('register and get', () => {
		it('should register and retrieve callback', () => {
			const callback = () => {};
			registry.register('logradouro', callback);
			expect(registry.get('logradouro')).toBe(callback);
		});
		
		it('should accept null callback', () => {
			registry.register('bairro', null);
			expect(registry.get('bairro')).toBeNull();
		});
		
		it('should throw TypeError for invalid callback', () => {
			expect(() => registry.register('test', 'invalid')).toThrow(TypeError);
		});
	});
	
	describe('execute', () => {
		it('should execute callback with arguments', () => {
			let called = false;
			let receivedArgs = [];
			const callback = (...args) => {
				called = true;
				receivedArgs = args;
			};
			
			registry.register('logradouro', callback);
			registry.execute('logradouro', 'arg1', 'arg2');
			
			expect(called).toBe(true);
			expect(receivedArgs).toEqual(['arg1', 'arg2']);
		});
		
		it('should return true when callback executes', () => {
			registry.register('bairro', () => {});
			expect(registry.execute('bairro')).toBe(true);
		});
		
		it('should return false when no callback registered', () => {
			expect(registry.execute('nonexistent')).toBe(false);
		});
		
		it('should catch callback errors', () => {
			const originalError = console.error;
			let errorCalled = false;
			console.error = () => { errorCalled = true; };
			
			registry.register('test', () => { throw new Error('test'); });
			const result = registry.execute('test');
			
			console.error = originalError;
			expect(result).toBe(false);
			expect(errorCalled).toBe(true);
		});
	});
	
	describe('has and unregister', () => {
		it('should detect registered callbacks', () => {
			registry.register('logradouro', () => {});
			expect(registry.has('logradouro')).toBe(true);
			expect(registry.has('nonexistent')).toBe(false);
		});
		
		it('should unregister callbacks', () => {
			registry.register('bairro', () => {});
			expect(registry.unregister('bairro')).toBe(true);
			expect(registry.has('bairro')).toBe(false);
		});
	});
	
	describe('utility methods', () => {
		it('should clear all callbacks', () => {
			registry.register('a', () => {});
			registry.register('b', () => {});
			registry.clear();
			expect(registry.isEmpty()).toBe(true);
		});
		
		it('should return registered types', () => {
			registry.register('logradouro', () => {});
			registry.register('bairro', () => {});
			const types = registry.getRegisteredTypes();
			expect(types).toContain('logradouro');
			expect(types).toContain('bairro');
		});
		
		it('should return correct size', () => {
			expect(registry.size()).toBe(0);
			registry.register('test', () => {});
			expect(registry.size()).toBe(1);
		});
		
		it('should check if empty', () => {
			expect(registry.isEmpty()).toBe(true);
			registry.register('test', () => {});
			expect(registry.isEmpty()).toBe(false);
		});
	});
});
