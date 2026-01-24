/**
 * Comprehensive Test Suite for HTMLPositionDisplayer
 * 
 * Tests all functionality of the HTMLPositionDisplayer class including:
 * - Constructor and initialization
 * - HTML rendering with various position data
 * - Update method with different states
 * - Error handling and edge cases
 * - Immutability and observer pattern integration
 */

import { jest } from '@jest/globals';
import { JSDOM } from 'jsdom';
import HTMLPositionDisplayer from '../../src/html/HTMLPositionDisplayer.js';

describe('HTMLPositionDisplayer', () => {
	let dom;
	let document;
	let element;
	let displayer;

	beforeEach(() => {
		// Create a new JSDOM instance for each test
		dom = new JSDOM('<!DOCTYPE html><div id="test-element"></div>');
		document = dom.window.document;
		element = document.getElementById('test-element');
		displayer = new HTMLPositionDisplayer(element);
	});

	describe('Constructor', () => {
		it('should create an instance with the provided element', () => {
			expect(displayer).toBeInstanceOf(HTMLPositionDisplayer);
			expect(displayer.element).toBe(element);
		});

		it('should freeze the instance to prevent modifications', () => {
			expect(Object.isFrozen(displayer)).toBe(true);
		});

		it('should not allow adding new properties after construction', () => {
			expect(() => {
				displayer.newProperty = 'test';
			}).toThrow();
		});

		it('should not allow modifying the element property', () => {
			expect(() => {
				displayer.element = document.createElement('div');
			}).toThrow();
		});

		it('should accept null element without throwing', () => {
			expect(() => {
				new HTMLPositionDisplayer(null);
			}).not.toThrow();
		});

		it('should accept undefined element without throwing', () => {
			expect(() => {
				new HTMLPositionDisplayer(undefined);
			}).not.toThrow();
		});
	});

	describe('formatAccuracyQuality()', () => {
		it('should format excellent quality to Portuguese', () => {
			expect(displayer.formatAccuracyQuality('excellent')).toBe('Excelente');
		});

		it('should format good quality to Portuguese', () => {
			expect(displayer.formatAccuracyQuality('good')).toBe('Boa');
		});

		it('should format medium quality to Portuguese', () => {
			expect(displayer.formatAccuracyQuality('medium')).toBe('Média');
		});

		it('should format bad quality to Portuguese', () => {
			expect(displayer.formatAccuracyQuality('bad')).toBe('Ruim');
		});

		it('should format very bad quality to Portuguese', () => {
			expect(displayer.formatAccuracyQuality('very bad')).toBe('Muito Ruim');
		});

		it('should return original value for unknown quality', () => {
			expect(displayer.formatAccuracyQuality('unknown')).toBe('unknown');
		});

		it('should handle null quality', () => {
			expect(displayer.formatAccuracyQuality(null)).toBe(null);
		});

		it('should handle undefined quality', () => {
			expect(displayer.formatAccuracyQuality(undefined)).toBe(undefined);
		});
	});

	describe('renderPositionHtml()', () => {
		let mockPositionManager;
		let mockGeoPosition;
		let mockCoords;

		beforeEach(() => {
			mockCoords = {
				latitude: -18.4696091,
				longitude: -43.4953982,
				accuracy: 10.5,
				altitude: 1000.5,
				altitudeAccuracy: 5.2,
				heading: 45.0,
				speed: 2.5
			};

			mockGeoPosition = {
				accuracyQuality: 'excellent',
				geolocationPosition: {
					coords: mockCoords,
					timestamp: Date.now()
				}
			};

			mockPositionManager = {
				lastPosition: mockGeoPosition
			};
		});

		it('should return error message when positionManager is null', () => {
			const html = displayer.renderPositionHtml(null);
			expect(html).toContain('No position data available');
			expect(html).toContain("class='error'");
		});

		it('should return error message when positionManager is undefined', () => {
			const html = displayer.renderPositionHtml(undefined);
			expect(html).toContain('No position data available');
		});

		it('should return error message when lastPosition is null', () => {
			mockPositionManager.lastPosition = null;
			const html = displayer.renderPositionHtml(mockPositionManager);
			expect(html).toContain('No position data available');
		});

		it('should include details/summary structure', () => {
			const html = displayer.renderPositionHtml(mockPositionManager);
			expect(html).toContain('<details');
			expect(html).toContain('<summary>');
			expect(html).toContain('Posição Atual');
			expect(html).toContain('</details>');
		});

		it('should display latitude with 6 decimal precision', () => {
			const html = displayer.renderPositionHtml(mockPositionManager);
			expect(html).toContain('-18.469609');
		});

		it('should display longitude with 6 decimal precision', () => {
			const html = displayer.renderPositionHtml(mockPositionManager);
			expect(html).toContain('-43.495398');
		});

		it('should display accuracy with 2 decimal precision', () => {
			const html = displayer.renderPositionHtml(mockPositionManager);
			expect(html).toContain('10.50');
		});

		it('should display formatted accuracy quality', () => {
			const html = displayer.renderPositionHtml(mockPositionManager);
			expect(html).toContain('Excelente');
		});

		it('should display altitude when available', () => {
			const html = displayer.renderPositionHtml(mockPositionManager);
			expect(html).toContain('Altitude:');
			expect(html).toContain('1000.50 metros');
		});

		it('should display altitude accuracy when available', () => {
			const html = displayer.renderPositionHtml(mockPositionManager);
			expect(html).toContain('Precisão da Altitude:');
			expect(html).toContain('5.20 metros');
		});

		it('should not display altitude when null', () => {
			mockCoords.altitude = null;
			const html = displayer.renderPositionHtml(mockPositionManager);
			expect(html).not.toContain('altitude-info');
		});

		it('should not display altitude when undefined', () => {
			mockCoords.altitude = undefined;
			const html = displayer.renderPositionHtml(mockPositionManager);
			expect(html).not.toContain('altitude-info');
		});

		it('should display speed converted to km/h', () => {
			const html = displayer.renderPositionHtml(mockPositionManager);
			const expectedSpeed = (2.5 * 3.6).toFixed(2); // 9.00 km/h
			expect(html).toContain(expectedSpeed);
		});

		it('should display heading when available', () => {
			const html = displayer.renderPositionHtml(mockPositionManager);
			expect(html).toContain('Direção:');
			expect(html).toContain('45°');
		});

		it('should not display movement info when speed is null', () => {
			mockCoords.speed = null;
			const html = displayer.renderPositionHtml(mockPositionManager);
			expect(html).not.toContain('movement-info');
		});

		it('should not display movement info when speed is undefined', () => {
			mockCoords.speed = undefined;
			const html = displayer.renderPositionHtml(mockPositionManager);
			expect(html).not.toContain('Velocidade:');
		});

		it('should handle missing coords gracefully', () => {
			mockGeoPosition.geolocationPosition.coords = null;
			const html = displayer.renderPositionHtml(mockPositionManager);
			expect(html).toContain('N/A');
		});

		it('should handle coords with only latitude', () => {
			mockCoords.longitude = undefined;
			const html = displayer.renderPositionHtml(mockPositionManager);
			expect(html).toContain('-18.469609');
			expect(html).toContain('N/A');
		});

		it('should handle coords with only longitude', () => {
			mockCoords.latitude = undefined;
			const html = displayer.renderPositionHtml(mockPositionManager);
			expect(html).toContain('-43.495398');
			expect(html).toContain('N/A');
		});

		it('should handle speed of 0', () => {
			mockCoords.speed = 0;
			const html = displayer.renderPositionHtml(mockPositionManager);
			expect(html).toContain('0.00 km/h');
		});

		it('should handle heading of 0', () => {
			mockCoords.heading = 0;
			const html = displayer.renderPositionHtml(mockPositionManager);
			expect(html).toContain('0°');
		});

		it('should handle heading of 360', () => {
			mockCoords.heading = 360;
			const html = displayer.renderPositionHtml(mockPositionManager);
			expect(html).toContain('360°');
		});
	});

	describe('update()', () => {
		let mockPositionManager;
		let consoleSpy;

		beforeEach(() => {
			mockPositionManager = {
				lastPosition: {
					geolocationPosition: {
						coords: {
							latitude: -18.4696091,
							longitude: -43.4953982,
							accuracy: 10
						},
						accuracyQuality: 'excellent'
					}
				}
			};

			consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
		});

		afterEach(() => {
			consoleSpy.mockRestore();
		});

		it('should warn when element is null', () => {
			const nullDisplayer = new HTMLPositionDisplayer(null);
			nullDisplayer.update(mockPositionManager, 'PositionManager updated', false, null);
			
			// Logger prepends timestamp as first arg, message is second arg
			expect(consoleSpy).toHaveBeenCalledWith(
				expect.any(String), // timestamp
				'HTMLPositionDisplayer: Cannot update - element is null or undefined'
			);
		});

		it('should warn when element is undefined', () => {
			const undefinedDisplayer = new HTMLPositionDisplayer(undefined);
			undefinedDisplayer.update(mockPositionManager, 'PositionManager updated', false, null);
			
			expect(consoleSpy).toHaveBeenCalled();
		});

		it('should display loading message when loading is true', () => {
			displayer.update(mockPositionManager, 'test', true, null);
			
			expect(element.innerHTML).toContain('Obtendo posição...');
			expect(element.innerHTML).toContain('class="loading"');
		});

		it('should display error message when error is provided', () => {
			const error = { message: 'Geolocation timeout' };
			displayer.update(mockPositionManager, 'test', false, error);
			
			expect(element.innerHTML).toContain('Erro ao obter posição:');
			expect(element.innerHTML).toContain('Geolocation timeout');
			expect(element.innerHTML).toContain('class="error"');
		});

		it('should update display on PositionManager updated event', () => {
			displayer.update(mockPositionManager, 'PositionManager updated', false, null);
			
			expect(element.innerHTML).toContain('-18.469609');
			expect(element.innerHTML).toContain('-43.495398');
		});

		it('should update display on Immediate address update event', () => {
			displayer.update(mockPositionManager, 'Immediate address update', false, null);
			
			expect(element.innerHTML).toContain('-18.469609');
			expect(element.innerHTML).toContain('-43.495398');
		});

		it('should not update on irrelevant events', () => {
			element.innerHTML = '<p>Original content</p>';
			displayer.update(mockPositionManager, 'some.other.event', false, null);
			
			expect(element.innerHTML).toBe('<p>Original content</p>');
		});

		it('should display warning when lastPosition is null', () => {
			mockPositionManager.lastPosition = null;
			displayer.update(mockPositionManager, 'PositionManager updated', false, null);
			
			expect(element.innerHTML).toContain('Dados de posição não disponíveis');
			expect(element.innerHTML).toContain('class="warning"');
		});

		it('should display warning when positionManager is null', () => {
			displayer.update(null, 'PositionManager updated', false, null);
			
			expect(element.innerHTML).toContain('Dados de posição não disponíveis');
		});

		it('should prioritize loading state over error', () => {
			const error = { message: 'Test error' };
			displayer.update(mockPositionManager, 'test', true, error);
			
			expect(element.innerHTML).toContain('Obtendo posição...');
			expect(element.innerHTML).not.toContain('Test error');
		});

		it('should prioritize error state over success', () => {
			const error = { message: 'Test error' };
			displayer.update(mockPositionManager, 'PositionManager updated', false, error);
			
			expect(element.innerHTML).toContain('Test error');
			expect(element.innerHTML).not.toContain('-18.469609');
		});

		it('should clear previous content on loading', () => {
			element.innerHTML = '<p>Previous data</p>';
			displayer.update(mockPositionManager, 'test', true, null);
			
			expect(element.innerHTML).not.toContain('Previous data');
			expect(element.innerHTML).toContain('Obtendo posição...');
		});

		it('should clear previous content on error', () => {
			element.innerHTML = '<p>Previous data</p>';
			const error = { message: 'Error' };
			displayer.update(mockPositionManager, 'test', false, error);
			
			expect(element.innerHTML).not.toContain('Previous data');
			expect(element.innerHTML).toContain('Erro ao obter posição');
		});

		it('should clear previous content on successful update', () => {
			element.innerHTML = '<p>Previous data</p>';
			displayer.update(mockPositionManager, 'PositionManager updated', false, null);
			
			expect(element.innerHTML).not.toContain('Previous data');
			expect(element.innerHTML).toContain('details');
		});
	});

	describe('toString()', () => {
		it('should return class name and element id', () => {
			element.id = 'test-element';
			expect(displayer.toString()).toBe('HTMLPositionDisplayer: test-element');
		});

		it('should return "no-id" when element has no id', () => {
			element.id = '';
			expect(displayer.toString()).toBe('HTMLPositionDisplayer: no-id');
		});

		it('should handle element with null id', () => {
			element.id = null;
			expect(displayer.toString()).toBe('HTMLPositionDisplayer: no-id');
		});
	});

	describe('Observer Pattern Integration', () => {
		it('should work as an observer with update method', () => {
			const mockManager = {
				lastPosition: {
					geolocationPosition: {
						coords: { latitude: 10, longitude: 20, accuracy: 5 },
						accuracyQuality: 'good'
					}
				}
			};

			// Simulate observer pattern
			displayer.update(mockManager, 'PositionManager updated', false, null);
			
			expect(element.innerHTML).toContain('10.000000');
			expect(element.innerHTML).toContain('20.000000');
		});

		it('should handle multiple updates correctly', () => {
			const mockManager = {
				lastPosition: {
					geolocationPosition: {
						coords: { latitude: 10, longitude: 20, accuracy: 5 },
						accuracyQuality: 'good'
					}
				}
			};

			// First update
			displayer.update(mockManager, 'PositionManager updated', false, null);
			expect(element.innerHTML).toContain('10.000000');

			// Second update with different position
			mockManager.lastPosition.geolocationPosition.coords.latitude = 15;
			displayer.update(mockManager, 'PositionManager updated', false, null);
			expect(element.innerHTML).toContain('15.000000');
			expect(element.innerHTML).not.toContain('10.000000');
		});
	});

	describe('Edge Cases and Error Handling', () => {
		it('should handle extremely large coordinates', () => {
			const mockManager = {
				lastPosition: {
					geolocationPosition: {
						coords: {
							latitude: 90,
							longitude: 180,
							accuracy: 1000000
						},
						accuracyQuality: 'bad'
					}
				}
			};

			const html = displayer.renderPositionHtml(mockManager);
			expect(html).toContain('90.000000');
			expect(html).toContain('180.000000');
			expect(html).toContain('1000000.00');
		});

		it('should handle negative coordinates', () => {
			const mockManager = {
				lastPosition: {
					geolocationPosition: {
						coords: {
							latitude: -90,
							longitude: -180,
							accuracy: 1
						},
						accuracyQuality: 'excellent'
					}
				}
			};

			const html = displayer.renderPositionHtml(mockManager);
			expect(html).toContain('-90.000000');
			expect(html).toContain('-180.000000');
		});

		it('should handle very small accuracy values', () => {
			const mockManager = {
				lastPosition: {
					geolocationPosition: {
						coords: {
							latitude: 0,
							longitude: 0,
							accuracy: 0.01
						},
						accuracyQuality: 'excellent'
					}
				}
			};

			const html = displayer.renderPositionHtml(mockManager);
			expect(html).toContain('0.01');
		});
	});

	describe('Performance and Memory', () => {
		it('should not leak memory on multiple updates', () => {
			const mockManager = {
				lastPosition: {
					geolocationPosition: {
						coords: { latitude: 10, longitude: 20, accuracy: 5 },
						accuracyQuality: 'good'
					}
				}
			};

			// Perform many updates
			for (let i = 0; i < 1000; i++) {
				mockManager.lastPosition.geolocationPosition.coords.latitude = i;
				displayer.update(mockManager, 'PositionManager updated', false, null);
			}

			// Should complete without errors and show last value
			expect(element.innerHTML).toContain('999.000000');
		});

		it('should handle rapid state changes', () => {
			const mockManager = {
				lastPosition: {
					geolocationPosition: {
						coords: { latitude: 10, longitude: 20, accuracy: 5 },
						accuracyQuality: 'good'
					}
				}
			};

			// Rapid state changes
			displayer.update(mockManager, 'test', true, null);  // loading
			displayer.update(mockManager, 'test', false, { message: 'Error' });  // error
			displayer.update(mockManager, 'PositionManager updated', false, null);  // success

			// Should show final state
			expect(element.innerHTML).toContain('10.000000');
		});
	});
});
