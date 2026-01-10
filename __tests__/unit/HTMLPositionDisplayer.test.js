/**
 * Unit Tests for HTMLPositionDisplayer Class
 * 
 * This test suite validates the HTML position display functionality, coordinate formatting,
 * observer pattern integration, and Portuguese localization capabilities.
 * 
 * @author Marcelo Pereira Barbosa
 * @since 0.8.3-alpha
 */

import { jest } from '@jest/globals';
import HTMLPositionDisplayer from '../../src/html/HTMLPositionDisplayer.js';

describe('HTMLPositionDisplayer - MP Barbosa Travel Guide (v0.8.7-alpha)', () => {
    let mockElement, displayer;

    beforeEach(() => {
        // Mock DOM element
        mockElement = {
            id: 'position-display',
            innerHTML: ''
        };

        // Create HTMLPositionDisplayer instance for testing
        displayer = new HTMLPositionDisplayer(mockElement);
    });

    describe('Constructor and Initialization', () => {
        test('should initialize with correct properties', () => {
            expect(displayer.element).toBe(mockElement);
            expect(Object.isFrozen(displayer)).toBe(true);
        });

        test('should handle null element gracefully', () => {
            const displayerWithNull = new HTMLPositionDisplayer(null);
            expect(displayerWithNull.element).toBeNull();
            expect(Object.isFrozen(displayerWithNull)).toBe(true);
        });

        test('should be immutable after construction (MP Barbosa standards)', () => {
            expect(() => {
                displayer.newProperty = 'test';
            }).toThrow();
            
            expect(() => {
                displayer.element = null;
            }).toThrow();
        });
    });

    describe('Position Data Rendering (Brazilian Coordinates)', () => {
        let mockPositionManager;

        beforeEach(() => {
            mockPositionManager = {
                lastPosition: {
                    geolocationPosition: {
                        coords: {
                            latitude: -23.5505,  // São Paulo coordinates
                            longitude: -46.6333,
                            accuracy: 15.5,
                            altitude: 760.2,
                            altitudeAccuracy: 10.0,
                            heading: 180.0,
                            speed: 5.5  // m/s
                        },
                        accuracyQuality: 'good'
                    }
                }
            };
        });

        test('should render complete position HTML with all Brazilian data', () => {
            const html = displayer.renderPositionHtml(mockPositionManager);
            
            expect(html).toContain('Posição Atual');
            expect(html).toContain('Coordenadas:');
            expect(html).toContain('Latitude:');
            expect(html).toContain('Longitude:');
            expect(html).toContain('Precisão:');
            expect(html).toContain('Altitude:');
            expect(html).toContain('Movimento:');
            expect(html).toContain('Velocidade:');
            expect(html).toContain('Direção:');
        });

        test('should format Brazilian coordinates with 6 decimal precision', () => {
            const html = displayer.renderPositionHtml(mockPositionManager);
            
            expect(html).toContain('-23.550500°');  // São Paulo latitude
            expect(html).toContain('-46.633300°');  // São Paulo longitude
        });

        test('should format accuracy with 2 decimal places in Portuguese', () => {
            const html = displayer.renderPositionHtml(mockPositionManager);
            
            expect(html).toContain('15.50 metros');
        });

        test('should convert speed from m/s to km/h for Brazilian users', () => {
            const html = displayer.renderPositionHtml(mockPositionManager);
            
            // 5.5 m/s * 3.6 = 19.80 km/h
            expect(html).toContain('19.80 km/h');
        });

        test('should format heading with no decimal places', () => {
            const html = displayer.renderPositionHtml(mockPositionManager);
            
            expect(html).toContain('180°');
        });

        test('should handle missing altitude data gracefully', () => {
            mockPositionManager.lastPosition.geolocationPosition.coords.altitude = null;
            mockPositionManager.lastPosition.geolocationPosition.coords.altitudeAccuracy = null;
            
            const html = displayer.renderPositionHtml(mockPositionManager);
            
            expect(html).not.toContain('Altitude:');
        });

        test('should handle missing movement data gracefully', () => {
            mockPositionManager.lastPosition.geolocationPosition.coords.speed = null;
            mockPositionManager.lastPosition.geolocationPosition.coords.heading = null;
            
            const html = displayer.renderPositionHtml(mockPositionManager);
            
            expect(html).not.toContain('Movimento:');
        });

        test('should return error message for null position manager', () => {
            const html = displayer.renderPositionHtml(null);
            
            expect(html).toContain("No position data available");
            expect(html).toContain("class='error'");
        });

        test('should return error message for missing last position', () => {
            const mockManager = { lastPosition: null };
            const html = displayer.renderPositionHtml(mockManager);
            
            expect(html).toContain("No position data available");
        });
    });

    describe('Portuguese Localization (Brazilian Quality Standards)', () => {
        test('should format all quality levels in Portuguese', () => {
            expect(displayer.formatAccuracyQuality('excellent')).toBe('Excelente');
            expect(displayer.formatAccuracyQuality('good')).toBe('Boa');
            expect(displayer.formatAccuracyQuality('medium')).toBe('Média');
            expect(displayer.formatAccuracyQuality('bad')).toBe('Ruim');
            expect(displayer.formatAccuracyQuality('very bad')).toBe('Muito Ruim');
        });

        test('should return original value for unknown quality', () => {
            expect(displayer.formatAccuracyQuality('unknown')).toBe('unknown');
            expect(displayer.formatAccuracyQuality('custom')).toBe('custom');
        });

        test('should handle null/undefined quality gracefully', () => {
            expect(displayer.formatAccuracyQuality(null)).toBe(null);
            expect(displayer.formatAccuracyQuality(undefined)).toBe(undefined);
        });

        test('should use Portuguese terms in HTML output', () => {
            const mockPositionManager = {
                lastPosition: {
                    geolocationPosition: {
                        coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 15 },
                        accuracyQuality: 'good'
                    }
                }
            };
            
            const html = displayer.renderPositionHtml(mockPositionManager);
            
            expect(html).toContain('Posição Atual');
            expect(html).toContain('Coordenadas:');
            expect(html).toContain('Precisão:');
            expect(html).toContain('metros');
            expect(html).toContain('Boa'); // Quality in Portuguese
        });
    });

    describe('Observer Pattern Integration (Position Updates)', () => {
        let mockPositionManager;

        beforeEach(() => {
            mockPositionManager = {
                lastPosition: {
                    geolocationPosition: {
                        coords: {
                            latitude: -22.9068,  // Rio de Janeiro coordinates
                            longitude: -43.1729,
                            accuracy: 15
                        },
                        accuracyQuality: 'good'
                    }
                }
            };
        });

        test('should update element on strCurrPosUpdate event', () => {
            displayer.update(mockPositionManager, 'PositionManager updated', false, null);
            
            expect(mockElement.innerHTML).toContain('Posição Atual');
            expect(mockElement.innerHTML).toContain('-22.906800°');  // Rio coordinates
        });

        test('should update element on strImmediateAddressUpdate event', () => {
            displayer.update(mockPositionManager, 'Immediate address update', false, null);
            
            expect(mockElement.innerHTML).toContain('Posição Atual');
            expect(mockElement.innerHTML).toContain('-43.172900°');  // Rio coordinates
        });

        test('should display Portuguese loading message during loading state', () => {
            displayer.update(mockPositionManager, 'PositionManager updated', true, null);
            
            expect(mockElement.innerHTML).toContain('Obtendo posição...');
            expect(mockElement.innerHTML).toContain('class="loading"');
        });

        test('should display Portuguese error message on error', () => {
            const error = new Error('GPS não disponível');
            displayer.update(mockPositionManager, 'PositionManager updated', false, error);
            
            expect(mockElement.innerHTML).toContain('Erro ao obter posição:');
            expect(mockElement.innerHTML).toContain('GPS não disponível');
            expect(mockElement.innerHTML).toContain('class="error"');
        });

        test('should display Portuguese warning for missing position data', () => {
            const mockManagerNoPosition = { lastPosition: null };
            displayer.update(mockManagerNoPosition, 'PositionManager updated', false, null);
            
            expect(mockElement.innerHTML).toContain('Dados de posição não disponíveis');
            expect(mockElement.innerHTML).toContain('class="warning"');
        });

        test('should not update for unrecognized events', () => {
            const originalContent = 'original content';
            mockElement.innerHTML = originalContent;
            
            displayer.update(mockPositionManager, 'unknownEvent', false, null);
            
            expect(mockElement.innerHTML).toBe(originalContent);
        });
    });

    describe('Edge Cases and Error Handling (Brazilian Context)', () => {
        test('should handle coordinates with null values', () => {
            const mockManager = {
                lastPosition: {
                    geolocationPosition: {
                        coords: {
                            latitude: null,
                            longitude: undefined,
                            accuracy: null
                        },
                        accuracyQuality: 'bad'
                    }
                }
            };
            
            const html = displayer.renderPositionHtml(mockManager);
            
            expect(html).toContain('N/A°');
            expect(html).toContain('N/A metros');
        });

        test('should handle missing coords object', () => {
            const mockManager = {
                lastPosition: {
                    geolocationPosition: {
                        coords: null,
                        accuracyQuality: 'bad'
                    }
                }
            };
            
            const html = displayer.renderPositionHtml(mockManager);
            
            expect(html).toContain('N/A°');
            expect(html).toContain('N/A metros');
        });

        test('should handle update with null position manager gracefully', () => {
            expect(() => {
                displayer.update(null, 'PositionManager updated', false, null);
            }).not.toThrow();
        });

        test('should handle extreme Brazilian coordinate values', () => {
            const mockManager = {
                lastPosition: {
                    geolocationPosition: {
                        coords: {
                            latitude: -33.7506,  // Southern Brazil extreme
                            longitude: -73.9857,  // Western Brazil extreme
                            accuracy: 50.25
                        },
                        accuracyQuality: 'medium'
                    }
                }
            };
            
            const html = displayer.renderPositionHtml(mockManager);
            
            expect(html).toContain('-33.750600°');
            expect(html).toContain('-73.985700°');
            expect(html).toContain('50.25 metros');
        });
    });

    describe('String Representation and Debugging', () => {
        test('should return correct string representation with element ID', () => {
            const result = displayer.toString();
            
            expect(result).toBe('HTMLPositionDisplayer: position-display');
        });

        test('should handle missing element ID', () => {
            const elementWithoutId = { innerHTML: '' };
            const displayerNoId = new HTMLPositionDisplayer(elementWithoutId);
            
            const result = displayerNoId.toString();
            
            expect(result).toBe('HTMLPositionDisplayer: no-id');
        });

        test('should provide meaningful toString for debugging Brazilian positions', () => {
            mockElement.id = 'rio-position-display';
            const displayer = new HTMLPositionDisplayer(mockElement);
            
            expect(displayer.toString()).toBe('HTMLPositionDisplayer: rio-position-display');
        });
    });

    describe('Performance and Memory Management', () => {
        test('should not create memory leaks with repeated updates', () => {
            const mockManager = {
                lastPosition: {
                    geolocationPosition: {
                        coords: {
                            latitude: -15.7801,  // Brasília coordinates
                            longitude: -47.9292,
                            accuracy: 15
                        },
                        accuracyQuality: 'good'
                    }
                }
            };

            // Perform many updates
            for (let i = 0; i < 1000; i++) {
                displayer.update(mockManager, 'PositionManager updated', false, null);
            }

            // Should still work correctly
            expect(mockElement.innerHTML).toContain('Posição Atual');
            expect(mockElement.innerHTML).toContain('-15.780100°');  // Brasília latitude
        });

        test('should handle large coordinate values correctly', () => {
            const mockManager = {
                lastPosition: {
                    geolocationPosition: {
                        coords: {
                            latitude: 85.999999,
                            longitude: 179.999999,
                            accuracy: 9999.99
                        },
                        accuracyQuality: 'bad'
                    }
                }
            };
            
            const html = displayer.renderPositionHtml(mockManager);
            
            expect(html).toContain('85.999999°');
            expect(html).toContain('179.999999°');
            expect(html).toContain('9999.99 metros');
        });

        test('should maintain immutability during intensive operations', () => {
            const originalElement = displayer.element;
            
            // Perform intensive operations
            for (let i = 0; i < 100; i++) {
                displayer.formatAccuracyQuality('good');
                displayer.toString();
            }
            
            // Object should remain frozen and unchanged
            expect(Object.isFrozen(displayer)).toBe(true);
            expect(displayer.element).toBe(originalElement);
        });
    });

    describe('HTML Structure and Progressive Disclosure', () => {
        test('should generate proper HTML5 details/summary structure', () => {
            const mockManager = {
                lastPosition: {
                    geolocationPosition: {
                        coords: { latitude: -23.5505, longitude: -46.6333, accuracy: 15 },
                        accuracyQuality: 'good'
                    }
                }
            };
            
            const html = displayer.renderPositionHtml(mockManager);
            
            expect(html).toContain('<details class="position-details" closed>');
            expect(html).toContain('<summary><strong>Posição Atual</strong></summary>');
            expect(html).toContain('</details>');
        });

        test('should organize content in semantic sections', () => {
            const mockManager = {
                lastPosition: {
                    geolocationPosition: {
                        coords: {
                            latitude: -23.5505,
                            longitude: -46.6333,
                            accuracy: 15,
                            altitude: 760,
                            speed: 10
                        },
                        accuracyQuality: 'good'
                    }
                }
            };
            
            const html = displayer.renderPositionHtml(mockManager);
            
            expect(html).toContain('<div class="coordinates">');
            expect(html).toContain('<div class="accuracy-info">');
            expect(html).toContain('<div class="altitude-info">');
            expect(html).toContain('<div class="movement-info">');
        });
    });
});