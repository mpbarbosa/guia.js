/**
 * Test file for ReferencePlace class
 * 
 * Tests the extraction and representation of reference places from geocoding data,
 * including shopping centers, subway stations, cafes, and other points of interest.
 */

import { describe, test, expect, jest } from '@jest/globals';
import { ReferencePlace, setupParams } from '../../src/guia.js';

// Mock document to prevent errors in test environment
global.document = {
    getElementById: jest.fn().mockReturnValue(null)
};

describe('ReferencePlace Class', () => {
    
    describe('Constructor', () => {
        test('should create instance with valid shop/mall data', () => {
            const data = { 
                class: 'shop', 
                type: 'mall', 
                name: 'Shopping Morumbi' 
            };
            const refPlace = new ReferencePlace(data);
            
            expect(refPlace.className).toBe('shop');
            expect(refPlace.typeName).toBe('mall');
            expect(refPlace.name).toBe('Shopping Morumbi');
            expect(refPlace.description).toBe('Shopping Center Shopping Morumbi');
        });

        test('should create instance with valid amenity/cafe data', () => {
            const data = { 
                class: 'amenity', 
                type: 'cafe', 
                name: 'Café Central' 
            };
            const refPlace = new ReferencePlace(data);
            
            expect(refPlace.className).toBe('amenity');
            expect(refPlace.typeName).toBe('cafe');
            expect(refPlace.name).toBe('Café Central');
            expect(refPlace.description).toBe('Café Café Central');
        });

        test('should create instance with valid railway/subway data', () => {
            const data = { 
                class: 'railway', 
                type: 'subway', 
                name: 'Estação Sé' 
            };
            const refPlace = new ReferencePlace(data);
            
            expect(refPlace.className).toBe('railway');
            expect(refPlace.typeName).toBe('subway');
            expect(refPlace.name).toBe('Estação Sé');
            expect(refPlace.description).toBe('Estação do Metrô Estação Sé');
        });

        test('should create instance with valid place/house data', () => {
            const data = { 
                class: 'place', 
                type: 'house', 
                name: 'Casa do João' 
            };
            const refPlace = new ReferencePlace(data);
            
            expect(refPlace.className).toBe('place');
            expect(refPlace.typeName).toBe('house');
            expect(refPlace.name).toBe('Casa do João');
            expect(refPlace.description).toBe('Residencial Casa do João');
        });

        test('should create instance with valid shop/car_repair data', () => {
            const data = { 
                class: 'shop', 
                type: 'car_repair', 
                name: 'Auto Center Silva' 
            };
            const refPlace = new ReferencePlace(data);
            
            expect(refPlace.className).toBe('shop');
            expect(refPlace.typeName).toBe('car_repair');
            expect(refPlace.name).toBe('Auto Center Silva');
            expect(refPlace.description).toBe('Oficina Mecânica Auto Center Silva');
        });

        test('should handle data without name', () => {
            const data = { 
                class: 'shop', 
                type: 'mall' 
            };
            const refPlace = new ReferencePlace(data);
            
            expect(refPlace.className).toBe('shop');
            expect(refPlace.typeName).toBe('mall');
            expect(refPlace.name).toBeNull();
            expect(refPlace.description).toBe('Shopping Center');
        });

        test('should handle empty data object', () => {
            const data = {};
            const refPlace = new ReferencePlace(data);
            
            expect(refPlace.className).toBeNull();
            expect(refPlace.typeName).toBeNull();
            expect(refPlace.name).toBeNull();
            expect(refPlace.description).toBe(setupParams.noReferencePlace);
        });

        test('should handle null data', () => {
            const refPlace = new ReferencePlace(null);
            
            expect(refPlace.className).toBeNull();
            expect(refPlace.typeName).toBeNull();
            expect(refPlace.name).toBeNull();
            expect(refPlace.description).toBe(setupParams.noReferencePlace);
        });

        test('should handle undefined data', () => {
            const refPlace = new ReferencePlace(undefined);
            
            expect(refPlace.className).toBeNull();
            expect(refPlace.typeName).toBeNull();
            expect(refPlace.name).toBeNull();
            expect(refPlace.description).toBe(setupParams.noReferencePlace);
        });

        test('should be frozen after construction', () => {
            const data = { 
                class: 'shop', 
                type: 'mall', 
                name: 'Shopping Morumbi' 
            };
            const refPlace = new ReferencePlace(data);
            
            expect(Object.isFrozen(refPlace)).toBe(true);
        });
    });

    describe('calculateDescription Method', () => {
        test('should return noReferencePlace for invalid class', () => {
            const data = { 
                class: 'invalid', 
                type: 'unknown', 
                name: 'Test Place' 
            };
            const refPlace = new ReferencePlace(data);
            
            expect(refPlace.description).toBe(setupParams.noReferencePlace);
        });

        test('should return class:type fallback for unmapped valid class', () => {
            const data = { 
                class: 'shop', 
                type: 'unknown_type', 
                name: 'Test Shop' 
            };
            const refPlace = new ReferencePlace(data);
            
            expect(refPlace.description).toBe('shop: unknown_type');
        });

        test('should return noReferencePlace when className is missing', () => {
            const data = { 
                type: 'mall', 
                name: 'Shopping Morumbi' 
            };
            const refPlace = new ReferencePlace(data);
            
            expect(refPlace.description).toBe(setupParams.noReferencePlace);
        });

        test('should return noReferencePlace when typeName is missing', () => {
            const data = { 
                class: 'shop', 
                name: 'Shopping Morumbi' 
            };
            const refPlace = new ReferencePlace(data);
            
            expect(refPlace.description).toBe(setupParams.noReferencePlace);
        });
    });

    describe('toString Method', () => {
        test('should return formatted string with name', () => {
            const data = { 
                class: 'shop', 
                type: 'mall', 
                name: 'Shopping Morumbi' 
            };
            const refPlace = new ReferencePlace(data);
            const result = refPlace.toString();
            
            expect(result).toContain('ReferencePlace');
            expect(result).toContain('Shopping Center');
            expect(result).toContain('Shopping Morumbi');
            expect(result).toBe('ReferencePlace: Shopping Center Shopping Morumbi - Shopping Morumbi');
        });

        test('should return formatted string without name', () => {
            const data = { 
                class: 'amenity', 
                type: 'cafe' 
            };
            const refPlace = new ReferencePlace(data);
            const result = refPlace.toString();
            
            expect(result).toContain('ReferencePlace');
            expect(result).toContain('Café');
            expect(result).not.toContain(' - ');
            expect(result).toBe('ReferencePlace: Café');
        });

        test('should return formatted string for unclassified place', () => {
            const data = { 
                class: 'unknown', 
                type: 'unknown' 
            };
            const refPlace = new ReferencePlace(data);
            const result = refPlace.toString();
            
            expect(result).toContain('ReferencePlace');
            expect(result).toContain(setupParams.noReferencePlace);
        });
    });

    describe('Integration with setupParams', () => {
        test('should use validRefPlaceClasses from setupParams', () => {
            const validClasses = setupParams.validRefPlaceClasses;
            
            validClasses.forEach(validClass => {
                const data = { 
                    class: validClass, 
                    type: 'test', 
                    name: 'Test Place' 
                };
                const refPlace = new ReferencePlace(data);
                
                // Should not return noReferencePlace for valid classes
                // (though it may return fallback class:type format)
                expect(refPlace.description).not.toBe(setupParams.noReferencePlace);
            });
        });

        test('should use referencePlaceMap from ReferencePlace class', () => {
            const map = ReferencePlace.referencePlaceMap;
            
            Object.keys(map).forEach(className => {
                Object.keys(map[className]).forEach(typeName => {
                    const data = { 
                        class: className, 
                        type: typeName, 
                        name: 'Test Place' 
                    };
                    const expectedDescription = `${map[className][typeName]} Test Place`;
                    const refPlace = new ReferencePlace(data);
                    
                    expect(refPlace.description).toBe(expectedDescription);
                });
            });
        });
    });

    describe('Use Case: Driving Around City', () => {
        test('should notify user when entering a mall parking', () => {
            // User enters Shopping Morumbi parking
            const data = { 
                class: 'shop', 
                type: 'mall', 
                name: 'Shopping Morumbi' 
            };
            const refPlace = new ReferencePlace(data);
            
            // The app should be able to speak this information
            expect(refPlace.description).toBe('Shopping Center Shopping Morumbi');
            expect(refPlace.name).toBe('Shopping Morumbi');
            
            // Simulated speech: "Você está no Shopping Center Shopping Morumbi"
            const speechText = `Você está no ${refPlace.description} ${refPlace.name}`;
            expect(speechText).toBe('Você está no Shopping Center Shopping Morumbi Shopping Morumbi');
        });

        test('should notify user when near a subway station', () => {
            // User is near Estação Sé
            const data = { 
                class: 'railway', 
                type: 'subway', 
                name: 'Estação Sé' 
            };
            const refPlace = new ReferencePlace(data);
            
            expect(refPlace.description).toBe('Estação do Metrô Estação Sé');
            expect(refPlace.name).toBe('Estação Sé');
            
            // Simulated speech: "Você está próximo da Estação do Metrô Estação Sé"
            const speechText = `Você está próximo da ${refPlace.description} ${refPlace.name}`;
            expect(speechText).toBe('Você está próximo da Estação do Metrô Estação Sé Estação Sé');
        });

        test('should notify user when at a cafe', () => {
            // User is at a cafe
            const data = { 
                class: 'amenity', 
                type: 'cafe', 
                name: 'Café Girondino' 
            };
            const refPlace = new ReferencePlace(data);
            
            expect(refPlace.description).toBe('Café Café Girondino');
            expect(refPlace.name).toBe('Café Girondino');
        });
    });

    describe('Edge Cases', () => {
        test('should handle data with extra properties', () => {
            const data = { 
                class: 'shop', 
                type: 'mall', 
                name: 'Shopping Morumbi',
                extraProp1: 'value1',
                extraProp2: 'value2'
            };
            const refPlace = new ReferencePlace(data);
            
            expect(refPlace.className).toBe('shop');
            expect(refPlace.typeName).toBe('mall');
            expect(refPlace.name).toBe('Shopping Morumbi');
            expect(refPlace.description).toBe('Shopping Center Shopping Morumbi');
        });

        test('should handle empty string values', () => {
            const data = { 
                class: '', 
                type: '', 
                name: '' 
            };
            const refPlace = new ReferencePlace(data);
            
            // Empty strings are falsy in JavaScript, so (data && data.class) || null returns null
            expect(refPlace.className).toBeNull();
            expect(refPlace.typeName).toBeNull();
            expect(refPlace.name).toBeNull();
            expect(refPlace.description).toBe(setupParams.noReferencePlace);
        });
    });
});
