/**
 * Tests for DisplayerFactory class
 * 
 * Validates factory pattern implementation for displayer creation,
 * ensuring proper instantiation and support for dependency injection.
 */

const {
    DisplayerFactory,
    HTMLPositionDisplayer,
    HTMLAddressDisplayer,
    HTMLReferencePlaceDisplayer
} = require('../src/guia.js');

describe('DisplayerFactory', () => {
    let mockElement;

    beforeEach(() => {
        // Create mock element for testing
        mockElement = {
            id: 'test-element',
            innerHTML: '',
            textContent: ''
        };
    });

    describe('Factory Methods - Creation', () => {
        test('should create HTMLPositionDisplayer instance', () => {
            const displayer = DisplayerFactory.createPositionDisplayer(mockElement);

            expect(displayer).toBeDefined();
            expect(displayer).toBeInstanceOf(HTMLPositionDisplayer);
            expect(displayer.element).toBe(mockElement);
        });

        test('should create HTMLAddressDisplayer instance', () => {
            const displayer = DisplayerFactory.createAddressDisplayer(mockElement);

            expect(displayer).toBeDefined();
            expect(displayer).toBeInstanceOf(HTMLAddressDisplayer);
            expect(displayer.element).toBe(mockElement);
        });

        test('should create HTMLAddressDisplayer with enderecoPadronizadoDisplay', () => {
            const mockEnderecoDisplay = { id: 'endereco-display' };
            const displayer = DisplayerFactory.createAddressDisplayer(
                mockElement,
                mockEnderecoDisplay
            );

            expect(displayer).toBeDefined();
            expect(displayer).toBeInstanceOf(HTMLAddressDisplayer);
            expect(displayer.element).toBe(mockElement);
            expect(displayer.enderecoPadronizadoDisplay).toBe(mockEnderecoDisplay);
        });

        test('should create HTMLReferencePlaceDisplayer instance', () => {
            const displayer = DisplayerFactory.createReferencePlaceDisplayer(mockElement);

            expect(displayer).toBeDefined();
            expect(displayer).toBeInstanceOf(HTMLReferencePlaceDisplayer);
            expect(displayer.element).toBe(mockElement);
        });
    });

    describe('Factory Methods - Immutability', () => {
        test('should create immutable position displayer', () => {
            const displayer = DisplayerFactory.createPositionDisplayer(mockElement);

            expect(Object.isFrozen(displayer)).toBe(true);
        });

        test('should create immutable address displayer', () => {
            const displayer = DisplayerFactory.createAddressDisplayer(mockElement);

            expect(Object.isFrozen(displayer)).toBe(true);
        });

        test('should create immutable reference place displayer', () => {
            const displayer = DisplayerFactory.createReferencePlaceDisplayer(mockElement);

            expect(Object.isFrozen(displayer)).toBe(true);
        });
    });

    describe('Factory Methods - Referential Transparency', () => {
        test('should create equivalent position displayers for same inputs', () => {
            const displayer1 = DisplayerFactory.createPositionDisplayer(mockElement);
            const displayer2 = DisplayerFactory.createPositionDisplayer(mockElement);

            // Should be different instances but same type with same element
            expect(displayer1).not.toBe(displayer2);
            expect(displayer1.constructor).toBe(displayer2.constructor);
            expect(displayer1.element).toBe(displayer2.element);
        });

        test('should create equivalent address displayers for same inputs', () => {
            const displayer1 = DisplayerFactory.createAddressDisplayer(mockElement, false);
            const displayer2 = DisplayerFactory.createAddressDisplayer(mockElement, false);

            expect(displayer1).not.toBe(displayer2);
            expect(displayer1.constructor).toBe(displayer2.constructor);
            expect(displayer1.element).toBe(displayer2.element);
        });
    });

    describe('Factory Methods - No Side Effects', () => {
        test('should not modify input element when creating position displayer', () => {
            const originalInnerHTML = mockElement.innerHTML;
            const originalTextContent = mockElement.textContent;

            DisplayerFactory.createPositionDisplayer(mockElement);

            expect(mockElement.innerHTML).toBe(originalInnerHTML);
            expect(mockElement.textContent).toBe(originalTextContent);
        });

        test('should not modify input element when creating address displayer', () => {
            const originalInnerHTML = mockElement.innerHTML;
            const originalTextContent = mockElement.textContent;

            DisplayerFactory.createAddressDisplayer(mockElement);

            expect(mockElement.innerHTML).toBe(originalInnerHTML);
            expect(mockElement.textContent).toBe(originalTextContent);
        });

        test('should not modify input element when creating reference place displayer', () => {
            const originalInnerHTML = mockElement.innerHTML;
            const originalTextContent = mockElement.textContent;

            DisplayerFactory.createReferencePlaceDisplayer(mockElement);

            expect(mockElement.innerHTML).toBe(originalInnerHTML);
            expect(mockElement.textContent).toBe(originalTextContent);
        });
    });

    describe('Factory Pattern - Static Methods', () => {
        test('should have static createPositionDisplayer method', () => {
            expect(typeof DisplayerFactory.createPositionDisplayer).toBe('function');
            expect(DisplayerFactory.createPositionDisplayer).toBeDefined();
        });

        test('should have static createAddressDisplayer method', () => {
            expect(typeof DisplayerFactory.createAddressDisplayer).toBe('function');
            expect(DisplayerFactory.createAddressDisplayer).toBeDefined();
        });

        test('should have static createReferencePlaceDisplayer method', () => {
            expect(typeof DisplayerFactory.createReferencePlaceDisplayer).toBe('function');
            expect(DisplayerFactory.createReferencePlaceDisplayer).toBeDefined();
        });

        test('should not require instantiation of factory', () => {
            // Factory should work without creating an instance
            expect(() => {
                DisplayerFactory.createPositionDisplayer(mockElement);
            }).not.toThrow();
        });
    });
});
