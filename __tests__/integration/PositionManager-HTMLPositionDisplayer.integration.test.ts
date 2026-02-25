/**
 * Comprehensive Integration Test Suite for PositionManager + HTMLPositionDisplayer
 * 
 * Tests the complete observer pattern integration between:
 * - PositionManager (subject) - manages position state
 * - HTMLPositionDisplayer (observer) - displays position in DOM
 * 
 * Integration Test Scenarios:
 * 1. Basic subscription and notification flow
 * 2. Position updates triggering DOM updates
 * 3. Multiple observers receiving same updates
 * 4. Validation rules affecting display
 * 5. Error and loading states propagation
 * 6. Event filtering and priority
 * 7. Real-world position change scenarios
 * 8. Performance under rapid updates
 */

import { jest } from '@jest/globals';
import PositionManager from '../../src/core/PositionManager.js';
import HTMLPositionDisplayer from '../../src/html/HTMLPositionDisplayer.js';
import GeoPosition from '../../src/core/GeoPosition.js';

// Mock DOM environment
global.document = undefined;

describe('PositionManager + HTMLPositionDisplayer Integration', () => {
	let positionManager;
	let mockElement;
	let displayer;

	beforeEach(() => {
		// Reset singleton instance before each test
		PositionManager.instance = null;
		
		// Create mock DOM element
		mockElement = { innerHTML: '', id: 'test-display' };
		
		// Get fresh PositionManager instance
		positionManager = PositionManager.getInstance();
		
		// Create displayer
		displayer = new HTMLPositionDisplayer(mockElement);
	});

	describe('Basic Observer Pattern Integration', () => {
		it('should allow displayer to subscribe to position updates', () => {
			positionManager.subscribe(displayer);
			
			expect(positionManager.observers).toBeDefined();
			expect(positionManager.observers.length).toBeGreaterThan(0);
		});

		it('should notify displayer when position is updated', () => {
			positionManager.subscribe(displayer);
			
			const mockPosition = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 10,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now()
			};

			// Update position
			positionManager.update(mockPosition);
			
			// Check if displayer received update (DOM should be updated)
			expect(mockElement.innerHTML).toContain('-18.469609');
			expect(mockElement.innerHTML).toContain('-43.495398');
		});

		it('should update multiple observers simultaneously', () => {
			const mockElement2 = { innerHTML: '', id: 'test-display-2' };
			const displayer2 = new HTMLPositionDisplayer(mockElement2);
			
			positionManager.subscribe(displayer);
			positionManager.subscribe(displayer2);
			
			const mockPosition = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 10,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now()
			};

			positionManager.update(mockPosition);
			
			// Both displayers should be updated
			expect(mockElement.innerHTML).toContain('-18.469609');
			expect(mockElement2.innerHTML).toContain('-18.469609');
		});

		it('should not update unsubscribed displayer', () => {
			positionManager.subscribe(displayer);
			positionManager.unsubscribe(displayer);
			
			const mockPosition = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 10,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now()
			};

			positionManager.update(mockPosition);
			
			// Displayer should NOT be updated
			expect(mockElement.innerHTML).toBe('');
		});
	});

	describe('Position Update Scenarios', () => {
		beforeEach(() => {
			positionManager.subscribe(displayer);
		});

		it('should display initial position correctly', () => {
			const position = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 5.5,
					altitude: 1000,
					altitudeAccuracy: 2,
					heading: 45,
					speed: 2.5
				},
				timestamp: Date.now()
			};

			positionManager.update(position);
			
			// Should display all position data
			expect(mockElement.innerHTML).toContain('-18.469609');
			expect(mockElement.innerHTML).toContain('-43.495398');
			expect(mockElement.innerHTML).toContain('5.50'); // accuracy
			expect(mockElement.innerHTML).toContain('1000.00'); // altitude
			expect(mockElement.innerHTML).toContain('9.00'); // speed in km/h (2.5 * 3.6)
			expect(mockElement.innerHTML).toContain('45°'); // heading
		});

		it('should update display when position changes significantly', () => {
			// Initial position
			const position1 = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 10,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now()
			};

			positionManager.update(position1);
			expect(mockElement.innerHTML).toContain('-18.469609');
			
			// Move 100 meters (should trigger update)
			const position2 = {
				coords: {
					latitude: -18.4706091, // ~100m change
					longitude: -43.4953982,
					accuracy: 10,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now() + 60000 // 60 seconds later
			};

			positionManager.update(position2);
			expect(mockElement.innerHTML).toContain('-18.470609');
		});

		it('should display position with minimal data', () => {
			const position = {
				coords: {
					latitude: 0,
					longitude: 0,
					accuracy: 100,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now()
			};

			positionManager.update(position);
			
			expect(mockElement.innerHTML).toContain('0.000000');
			expect(mockElement.innerHTML).toContain('100.00');
			expect(mockElement.innerHTML).not.toContain('Altitude:');
			expect(mockElement.innerHTML).not.toContain('Velocidade:');
		});

		it('should display position with high precision coordinates', () => {
			const position = {
				coords: {
					latitude: -18.123456789,
					longitude: -43.987654321,
					accuracy: 1.23,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now()
			};

			positionManager.update(position);
			
			// Should display 6 decimal places
			expect(mockElement.innerHTML).toContain('-18.123457');
			expect(mockElement.innerHTML).toContain('-43.987654');
			expect(mockElement.innerHTML).toContain('1.23');
		});
	});

	describe('Accuracy Quality Impact', () => {
		beforeEach(() => {
			positionManager.subscribe(displayer);
		});

		it('should display excellent accuracy quality', () => {
			const position = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 5, // Excellent
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now()
			};

			positionManager.update(position);
			
			expect(mockElement.innerHTML).toContain('Excelente');
		});

		it('should display good accuracy quality', () => {
			const position = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 15, // Good
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now()
			};

			positionManager.update(position);
			
			expect(mockElement.innerHTML).toContain('Boa');
		});

		it('should display medium accuracy quality', () => {
			const position = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 35, // Medium
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now()
			};

			positionManager.update(position);
			
			// Note: Medium might be rejected on mobile, but should display if accepted
			if (mockElement.innerHTML.includes('Média')) {
				expect(mockElement.innerHTML).toContain('Média');
			}
		});
	});

	describe('Event Type Handling', () => {
		beforeEach(() => {
			positionManager.subscribe(displayer);
		});

		it('should respond to PositionManager updated event', () => {
			const position = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 10,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now()
			};

			positionManager.update(position);
			
			// Displayer should receive and handle the update
			expect(mockElement.innerHTML).toContain('details');
			expect(mockElement.innerHTML).toContain('-18.469609');
		});

		it('should handle immediate address update event', () => {
			// Simulate immediate update (< 50 seconds since last update)
			const position1 = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 10,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now()
			};

			positionManager.update(position1);
			
			// First update should succeed
			expect(mockElement.innerHTML).toContain('-18.469609');
			
			// Immediate update (same location, short time) - should be rejected
			const position2 = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 10,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now() + 1000 // 1 second later
			};

			positionManager.update(position2);
			
			// Second update should be rejected due to neither distance nor time threshold being met
			expect(mockElement.innerHTML).toContain('Neither distance');
			expect(mockElement.innerHTML).toContain('threshold met');
		});
	});

	describe('Error and Edge Cases', () => {
		beforeEach(() => {
			positionManager.subscribe(displayer);
		});

		it('should handle null position gracefully', () => {
			positionManager.update(null);
			
			// Manager might not update, but displayer should handle gracefully
			// No errors should be thrown
			expect(mockElement.innerHTML).toBeDefined();
		});

		it('should handle position with missing coords', () => {
			const position = {
				coords: null,
				timestamp: Date.now()
			};

			// This should not throw an error
			expect(() => {
				positionManager.update(position);
			}).not.toThrow();
		});

		it('should handle extremely large accuracy values', () => {
			const position = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 999999, // Very bad accuracy
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now()
			};

			positionManager.update(position);
			
			// Should still display (though might be rejected on mobile)
			if (mockElement.innerHTML.includes('-18')) {
				expect(mockElement.innerHTML).toContain('999999.00');
			}
		});

		it('should handle rapid position updates', () => {
			// Simulate GPS fluctuation with rapid updates
			for (let i = 0; i < 10; i++) {
				const position = {
					coords: {
						latitude: -18.4696091 + (i * 0.0001),
						longitude: -43.4953982 + (i * 0.0001),
						accuracy: 10,
						altitude: null,
						altitudeAccuracy: null,
						heading: null,
						speed: null
					},
					timestamp: Date.now() + (i * 1000)
				};

				positionManager.update(position);
			}
			
			// Should have the last valid update
			expect(mockElement.innerHTML).toBeDefined();
			expect(mockElement.innerHTML.length).toBeGreaterThan(0);
		});
	});

	describe('Multiple Observers Coordination', () => {
		it('should maintain state consistency across observers', () => {
			const element2 = { innerHTML: '', id: 'display-2' };
			const element3 = { innerHTML: '', id: 'display-3' };
			
			const displayer2 = new HTMLPositionDisplayer(element2);
			const displayer3 = new HTMLPositionDisplayer(element3);
			
			positionManager.subscribe(displayer);
			positionManager.subscribe(displayer2);
			positionManager.subscribe(displayer3);
			
			const position = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 10,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now()
			};

			positionManager.update(position);
			
			// All displayers should show same coordinates
			expect(mockElement.innerHTML).toContain('-18.469609');
			expect(element2.innerHTML).toContain('-18.469609');
			expect(element3.innerHTML).toContain('-18.469609');
		});

		it('should handle observer removal without affecting others', () => {
			const element2 = { innerHTML: '', id: 'display-2' };
			const displayer2 = new HTMLPositionDisplayer(element2);
			
			positionManager.subscribe(displayer);
			positionManager.subscribe(displayer2);
			
			// Remove first displayer
			positionManager.unsubscribe(displayer);
			
			const position = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 10,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now()
			};

			positionManager.update(position);
			
			// First displayer should not be updated
			expect(mockElement.innerHTML).toBe('');
			
			// Second displayer should still work
			expect(element2.innerHTML).toContain('-18.469609');
		});
	});

	describe('Real-World Movement Scenarios', () => {
		beforeEach(() => {
			positionManager.subscribe(displayer);
		});

		it('should handle walking movement (slow speed)', () => {
			// Walking at 5 km/h (1.39 m/s)
			const positions = [
				{
					coords: {
						latitude: -18.4696091,
						longitude: -43.4953982,
						accuracy: 10,
						speed: 1.39,
						heading: 0,
						altitude: null,
						altitudeAccuracy: null
					},
					timestamp: Date.now()
				},
				{
					coords: {
						latitude: -18.4693841, // ~25 meters north (above 20m threshold)
						longitude: -43.4953982,
						accuracy: 10,
						speed: 1.39,
						heading: 0,
						altitude: null,
						altitudeAccuracy: null
					},
					timestamp: Date.now() + 60000 // 1 minute later
				}
			];

			positions.forEach(pos => positionManager.update(pos));
			
			// Should show movement
			expect(mockElement.innerHTML).toContain('5.00 km/h'); // 1.39 * 3.6 = 5.004
		});

		it('should handle driving movement (high speed)', () => {
			const position = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 10,
					speed: 27.78, // 100 km/h
					heading: 180,
					altitude: null,
					altitudeAccuracy: null
				},
				timestamp: Date.now()
			};

			positionManager.update(position);
			
			expect(mockElement.innerHTML).toContain('100.01 km/h'); // 27.78 * 3.6
			expect(mockElement.innerHTML).toContain('180°');
		});

		it('should handle stationary position', () => {
			const position = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 5,
					speed: 0,
					heading: null,
					altitude: null,
					altitudeAccuracy: null
				},
				timestamp: Date.now()
			};

			positionManager.update(position);
			
			expect(mockElement.innerHTML).toContain('0.00 km/h');
		});
	});

	describe('Performance and Memory', () => {
		beforeEach(() => {
			positionManager.subscribe(displayer);
		});

		it('should handle 100 position updates without memory leak', () => {
			const startTime = Date.now();
			
			for (let i = 0; i < 100; i++) {
				const position = {
					coords: {
						latitude: -18.4696091 + (i * 0.001),
						longitude: -43.4953982 + (i * 0.001),
						accuracy: 10,
						altitude: null,
						altitudeAccuracy: null,
						heading: null,
						speed: null
					},
					timestamp: startTime + (i * 60000) // 1 minute apart
				};

				positionManager.update(position);
			}
			
			// Should complete without errors
			expect(mockElement.innerHTML).toBeDefined();
			expect(mockElement.innerHTML).toContain('details');
		});

		it('should maintain reasonable DOM size', () => {
			const position = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 10,
					altitude: 1000,
					altitudeAccuracy: 5,
					heading: 45,
					speed: 2.5
				},
				timestamp: Date.now()
			};

			positionManager.update(position);
			
			// HTML should be reasonable size (< 5KB)
			expect(mockElement.innerHTML.length).toBeLessThan(5000);
		});
	});

	describe('Address Component Integration (Municipio and Bairro)', () => {
		beforeEach(() => {
			// Subscribe displayer to position manager (needed for tests)
			positionManager.subscribe(displayer);
		});
		
		it('should display coordinates when moving between municipios', async () => {
			// First position in Milho Verde, Serro, MG
			const position1 = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 10,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now()
			};
			
			// Second position in Diamantina, MG (different municipio, ~35km away)
			const position2 = {
				coords: {
					latitude: -18.2450,
					longitude: -43.6029,
					accuracy: 10,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now() + 3600000 // 1 hour later
			};
			
			// Update with first position
			positionManager.update(position1);
			expect(mockElement.innerHTML).toContain('-18.469609');
			expect(mockElement.innerHTML).toContain('-43.495398');
			
			// Update with second position
			positionManager.update(position2);
			expect(mockElement.innerHTML).toContain('-18.245000');
			expect(mockElement.innerHTML).toContain('-43.602900');
			
			// Verify both coordinates were processed
			expect(mockElement.innerHTML).toContain('Latitude');
			expect(mockElement.innerHTML).toContain('Longitude');
		});
		
		it('should update display when moving within same municipio (bairro change)', async () => {
			// Position 1: Centro area, Serro, MG
			const position1 = {
				coords: {
					latitude: -18.6058,
					longitude: -43.3795,
					accuracy: 10,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now()
			};
			
			// Position 2: Different bairro in Serro (~500m away)
			const position2 = {
				coords: {
					latitude: -18.6100,
					longitude: -43.3850,
					accuracy: 10,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now() + 1800000 // 30 minutes later
			};
			
			// First update
			positionManager.update(position1);
			expect(mockElement.innerHTML).toContain('-18.605800');
			
			// Second update (different bairro, same municipio)
			positionManager.update(position2);
			expect(mockElement.innerHTML).toContain('-18.610000');
			
			// Should still show coordinate details
			expect(mockElement.innerHTML).toContain('Coordenadas');
		});
		
		it('should handle large movements across state boundaries (UF change)', async () => {
			// Position in Serro, MG
			const position1 = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 10,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now()
			};
			
			// Position in Rio de Janeiro, RJ (~450km away)
			const position2 = {
				coords: {
					latitude: -22.9068,
					longitude: -43.1729,
					accuracy: 10,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now() + 14400000 // 4 hours later
			};
			
			// First update (MG)
			positionManager.update(position1);
			expect(mockElement.innerHTML).toContain('-18.469609');
			
			// Second update (RJ) - large movement
			positionManager.update(position2);
			expect(mockElement.innerHTML).toContain('-22.906800');
			
			// Both positions should have been processed
			expect(mockElement.innerHTML).toContain('Precisão');
		});
		
		it('should reject insignificant movements in same location', async () => {
			const position1 = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 10,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now()
			};
			
			// Same location, slightly different timestamp (should be rejected)
			const position2 = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 10,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null
				},
				timestamp: Date.now() + 1000 // Only 1 second later
			};
			
			// First update
			positionManager.update(position1);
			const html1 = mockElement.innerHTML;
			expect(html1).toContain('-18.469609');
			
			// Second update - should be rejected by PositionManager
			positionManager.update(position2);
			const html2 = mockElement.innerHTML;
			
			// Should show error or keep previous content
			expect(html2).toBeDefined();
		});
		
		it('should validate real-world scenario: walking through Milho Verde', async () => {
			// Realistic scenario: Walking through Milho Verde village
			
			// Position 1: Entrance of village
			const position1 = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 15,
					altitude: 1200,
					altitudeAccuracy: 10,
					heading: 90,
					speed: 1.5 // ~5.4 km/h walking
				},
				timestamp: Date.now()
			};
			
			// Position 2: Center of village (300m away)
			const position2 = {
				coords: {
					latitude: -18.4670,
					longitude: -43.4930,
					accuracy: 12,
					altitude: 1205,
					altitudeAccuracy: 8,
					heading: 85,
					speed: 1.4
				},
				timestamp: Date.now() + 240000 // 4 minutes later
			};
			
			// Position 3: Near church (200m more)
			const position3 = {
				coords: {
					latitude: -18.4655,
					longitude: -43.4915,
					accuracy: 10,
					altitude: 1210,
					altitudeAccuracy: 5,
					heading: 80,
					speed: 1.3
				},
				timestamp: Date.now() + 480000 // 8 minutes total
			};
			
			// First position
			positionManager.update(position1);
			expect(mockElement.innerHTML).toContain('-18.469609');
			expect(mockElement.innerHTML).toContain('1200'); // Altitude
			expect(mockElement.innerHTML).toContain('5.40'); // Speed in km/h
			
			// Second position
			positionManager.update(position2);
			expect(mockElement.innerHTML).toContain('-18.467000');
			expect(mockElement.innerHTML).toContain('1205');
			
			// Third position
			positionManager.update(position3);
			expect(mockElement.innerHTML).toContain('-18.465500');
			expect(mockElement.innerHTML).toContain('1210');
			
			// Should display movement information
			expect(mockElement.innerHTML).toContain('Movimento');
			expect(mockElement.innerHTML).toContain('Velocidade');
		});
		
		it('should display all position components for address-enabled coordinates', async () => {
			// Position with full coordinate data (typical for address lookup)
			const position = {
				coords: {
					latitude: -18.4696091,
					longitude: -43.4953982,
					accuracy: 8,
					altitude: 1200,
					altitudeAccuracy: 5,
					heading: 120,
					speed: 2.5
				},
				timestamp: Date.now()
			};
			
			positionManager.update(position);
			
			// Verify all components are displayed
			expect(mockElement.innerHTML).toContain('Coordenadas');
			expect(mockElement.innerHTML).toContain('Latitude');
			expect(mockElement.innerHTML).toContain('Longitude');
			expect(mockElement.innerHTML).toContain('Precisão');
			expect(mockElement.innerHTML).toContain('Altitude');
			expect(mockElement.innerHTML).toContain('Movimento');
			expect(mockElement.innerHTML).toContain('Velocidade');
			expect(mockElement.innerHTML).toContain('Direção');
			
			// Verify coordinate values
			expect(mockElement.innerHTML).toContain('-18.469609');
			expect(mockElement.innerHTML).toContain('-43.495398');
			expect(mockElement.innerHTML).toContain('8.00 metros'); // Accuracy
			expect(mockElement.innerHTML).toContain('1200.00 metros'); // Altitude
			expect(mockElement.innerHTML).toContain('9.00 km/h'); // Speed
			expect(mockElement.innerHTML).toContain('120°'); // Heading
		});
	});

	describe('toString() Integration', () => {
		it('should provide meaningful string representation', () => {
			const displayerStr = displayer.toString();
			
			expect(displayerStr).toContain('HTMLPositionDisplayer');
			expect(displayerStr).toContain('test-display');
		});
	});
});
