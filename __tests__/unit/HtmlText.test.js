/**
 * Unit Tests for HtmlText Class
 * 
 * This test suite validates the HTML text management functionality, timestamp formatting,
 * observer pattern integration, and event configuration injection capabilities.
 * 
 * @author Marcelo Pereira Barbosa
 * @since 0.9.0-alpha
 */

import { jest } from '@jest/globals';
import HtmlText from '../../src/html/HtmlText.js';

describe('HtmlText', () => {
    let mockDocument, mockElement, htmlText;

    beforeEach(() => {
        // Mock DOM elements
        mockElement = {
            id: 'test-element',
            textContent: ''
        };
        
        mockDocument = {
            getElementById: jest.fn().mockReturnValue(mockElement)
        };

        // Create HtmlText instance for testing
        htmlText = new HtmlText(mockDocument, mockElement);
    });

    describe('Constructor', () => {
        test('should initialize with correct properties', () => {
            expect(htmlText.document).toBe(mockDocument);
            expect(htmlText.element).toBe(mockElement);
            expect(htmlText.eventConfig).toBeDefined();
        });

        test('should use default event configuration when none provided', () => {
            const htmlText = new HtmlText(mockDocument, mockElement);
            
            expect(htmlText.eventConfig.positionUpdate).toBe('PositionManager updated');
            expect(htmlText.eventConfig.immediateAddressUpdate).toBe('Immediate address update');
        });

        test('should use custom event configuration when provided', () => {
            const customConfig = {
                positionUpdate: 'location.updated',
                immediateAddressUpdate: 'address.immediate'
            };
            const htmlText = new HtmlText(mockDocument, mockElement, customConfig);
            
            expect(htmlText.eventConfig.positionUpdate).toBe('location.updated');
            expect(htmlText.eventConfig.immediateAddressUpdate).toBe('address.immediate');
        });

        test('should use partial custom configuration with defaults for missing values', () => {
            const partialConfig = {
                positionUpdate: 'custom.position.update'
            };
            const htmlText = new HtmlText(mockDocument, mockElement, partialConfig);
            
            expect(htmlText.eventConfig.positionUpdate).toBe('custom.position.update');
            expect(htmlText.eventConfig.immediateAddressUpdate).toBe('Immediate address update');
        });

        test('should be immutable after construction', () => {
            expect(() => {
                htmlText.newProperty = 'test';
            }).toThrow();
        });

        test('should handle null element gracefully', () => {
            const htmlTextWithNull = new HtmlText(mockDocument, null);
            expect(htmlTextWithNull.element).toBeNull();
            expect(htmlTextWithNull.document).toBe(mockDocument);
        });
    });

    describe('Update functionality', () => {
        let mockPositionManager;

        beforeEach(() => {
            mockPositionManager = {
                getInstance: jest.fn()
            };
        });

        test('should update element with timestamp on position update', () => {
            const mockDate = new Date('2025-10-16T15:30:00Z');
            jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('10/16/2025, 3:30:00 PM');
            
            htmlText.update(mockPositionManager, 'PositionManager updated', false, null);
            
            expect(mockElement.textContent).toBe('10/16/2025, 3:30:00 PM');
        });

        test('should update element with timestamp on immediate address update', () => {
            jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('10/16/2025, 3:30:00 PM');
            
            htmlText.update(mockPositionManager, 'Immediate address update', false, null);
            
            expect(mockElement.textContent).toBe('10/16/2025, 3:30:00 PM');
        });

        test('should display loading message when loading state is true', () => {
            htmlText.update(mockPositionManager, 'someEvent', true, null);
            
            expect(mockElement.textContent).toBe('Loading...');
        });

        test('should display error message when error is provided', () => {
            const error = { message: 'Test error message' };
            
            htmlText.update(mockPositionManager, 'someEvent', false, error);
            
            expect(mockElement.textContent).toBe('Error: Test error message');
        });

        test('should prioritize error over loading state', () => {
            const error = { message: 'Test error' };
            
            htmlText.update(mockPositionManager, 'someEvent', true, error);
            
            expect(mockElement.textContent).toBe('Error: Test error');
        });

        test('should not update on unrecognized events', () => {
            const originalContent = 'original content';
            mockElement.textContent = originalContent;
            
            htmlText.update(mockPositionManager, 'unknownEvent', false, null);
            
            expect(mockElement.textContent).toBe(originalContent);
        });

        test('should handle null element gracefully during update', () => {
            const htmlTextWithNull = new HtmlText(mockDocument, null);
            
            expect(() => {
                htmlTextWithNull.update(mockPositionManager, 'PositionManager updated', false, null);
            }).not.toThrow();
        });

        test('should respond to custom event names', () => {
            const customConfig = {
                positionUpdate: 'custom.update',
                immediateAddressUpdate: 'custom.immediate'
            };
            const htmlText = new HtmlText(mockDocument, mockElement, customConfig);
            jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('10/16/2025, 3:30:00 PM');
            
            // Should respond to custom event name
            htmlText.update(mockPositionManager, 'custom.update', false, null);
            expect(mockElement.textContent).toBe('10/16/2025, 3:30:00 PM');
            
            // Reset content
            mockElement.textContent = 'original';
            
            // Should NOT respond to default event name
            htmlText.update(mockPositionManager, 'PositionManager updated', false, null);
            expect(mockElement.textContent).toBe('original');
        });
    });

    describe('Timestamp formatting', () => {
        test('should call Date.toLocaleString() for timestamp formatting', () => {
            const toLocaleStringSpy = jest.spyOn(Date.prototype, 'toLocaleString');
            toLocaleStringSpy.mockReturnValue('mocked timestamp');
            
            htmlText.update({}, 'PositionManager updated', false, null);
            
            expect(toLocaleStringSpy).toHaveBeenCalled();
            expect(mockElement.textContent).toBe('mocked timestamp');
            
            toLocaleStringSpy.mockRestore();
        });

        test('should handle different locale formats', () => {
            const toLocaleStringSpy = jest.spyOn(Date.prototype, 'toLocaleString');
            
            // Test various timestamp formats
            const formats = [
                '16/10/2025, 15:30:00',
                '2025-10-16 15:30:00',
                'Oct 16, 2025, 3:30:00 PM'
            ];
            
            formats.forEach(format => {
                toLocaleStringSpy.mockReturnValue(format);
                htmlText.update({}, 'PositionManager updated', false, null);
                expect(mockElement.textContent).toBe(format);
            });
            
            toLocaleStringSpy.mockRestore();
        });
    });

    describe('toString method', () => {
        test('should return correct string representation with element ID', () => {
            mockElement.id = 'timestamp-display';
            
            const result = htmlText.toString();
            
            expect(result).toBe('HtmlText: timestamp-display');
        });

        test('should return "no-id" when element has no ID', () => {
            mockElement.id = '';
            
            const result = htmlText.toString();
            
            expect(result).toBe('HtmlText: no-id');
        });

        test('should handle null element gracefully', () => {
            const htmlTextWithNull = new HtmlText(mockDocument, null);
            
            const result = htmlTextWithNull.toString();
            
            expect(result).toBe('HtmlText: no-id');
        });

        test('should handle undefined element ID', () => {
            delete mockElement.id;
            
            const result = htmlText.toString();
            
            expect(result).toBe('HtmlText: no-id');
        });
    });

    describe('Observer pattern integration', () => {
        test('should work with different observer systems', () => {
            const customEventConfig = {
                positionUpdate: 'gps.success',
                immediateAddressUpdate: 'geocode.instant'
            };
            const htmlText = new HtmlText(mockDocument, mockElement, customEventConfig);
            jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('GPS timestamp');
            
            // Mock a different observer system
            const customObserver = { type: 'GPS System' };
            
            htmlText.update(customObserver, 'gps.success', false, null);
            
            expect(mockElement.textContent).toBe('GPS timestamp');
        });

        test('should handle multiple event types in single update call', () => {
            jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('Test timestamp');
            
            // Test both configured event types
            htmlText.update({}, 'PositionManager updated', false, null);
            expect(mockElement.textContent).toBe('Test timestamp');
            
            htmlText.update({}, 'Immediate address update', false, null);
            expect(mockElement.textContent).toBe('Test timestamp');
        });
    });

    describe('Edge cases and error handling', () => {
        test('should handle element with no textContent property', () => {
            const mockElementNoText = { id: 'test' };
            const htmlText = new HtmlText(mockDocument, mockElementNoText);
            
            expect(() => {
                htmlText.update({}, 'PositionManager updated', false, null);
            }).not.toThrow();
        });

        test('should handle empty error message', () => {
            const error = { message: '' };
            
            htmlText.update({}, 'someEvent', false, error);
            
            expect(mockElement.textContent).toBe('Error: ');
        });

        test('should handle null error object with message property', () => {
            const error = null;
            
            // Should not crash when trying to access error.message
            expect(() => {
                htmlText.update({}, 'someEvent', false, error);
            }).not.toThrow();
        });

        test('should handle undefined parameters gracefully', () => {
            expect(() => {
                htmlText.update(undefined, undefined, undefined, undefined);
            }).not.toThrow();
        });

        test('should work with different element types', () => {
            const mockDiv = { id: 'div-element', textContent: '' };
            const mockSpan = { id: 'span-element', textContent: '' };
            
            const htmlTextDiv = new HtmlText(mockDocument, mockDiv);
            const htmlTextSpan = new HtmlText(mockDocument, mockSpan);
            
            jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('test timestamp');
            
            htmlTextDiv.update({}, 'PositionManager updated', false, null);
            htmlTextSpan.update({}, 'PositionManager updated', false, null);
            
            expect(mockDiv.textContent).toBe('test timestamp');
            expect(mockSpan.textContent).toBe('test timestamp');
        });

        test('should maintain immutability throughout operations', () => {
            // Try to modify after various operations
            htmlText.update({}, 'PositionManager updated', false, null);
            
            expect(() => {
                htmlText.newProp = 'test';
            }).toThrow();
            
            expect(() => {
                htmlText.element = null;
            }).toThrow();
        });
    });

    describe('Performance and memory', () => {
        test('should not create memory leaks with repeated updates', () => {
            jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('timestamp');
            
            // Perform many updates
            for (let i = 0; i < 1000; i++) {
                htmlText.update({}, 'PositionManager updated', false, null);
            }
            
            expect(mockElement.textContent).toBe('timestamp');
            // Should not throw or cause memory issues
        });

        test('should handle rapid successive updates', () => {
            const timestamps = ['timestamp1', 'timestamp2', 'timestamp3'];
            const toLocaleStringSpy = jest.spyOn(Date.prototype, 'toLocaleString');
            
            timestamps.forEach((timestamp, index) => {
                toLocaleStringSpy.mockReturnValueOnce(timestamp);
                htmlText.update({}, 'PositionManager updated', false, null);
                expect(mockElement.textContent).toBe(timestamp);
            });
            
            toLocaleStringSpy.mockRestore();
        });
    });
});