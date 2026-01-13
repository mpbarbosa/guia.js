/**
 * Simplified Test Suite for HTMLPositionDisplayer
 * Compatible with existing Jest setup - 34 comprehensive tests
 */

import HTMLPositionDisplayer from '../../src/html/HTMLPositionDisplayer.js';

// Mock DOM environment
global.document = undefined;

describe('HTMLPositionDisplayer - Core Functionality', () => {
describe('Constructor', () => {
it('should create an instance', () => {
const mockElement = { innerHTML: '', id: 'test' };
const displayer = new HTMLPositionDisplayer(mockElement);

expect(displayer).toBeDefined();
expect(displayer.element).toBe(mockElement);
});

it('should freeze the instance', () => {
const mockElement = { innerHTML: '' };
const displayer = new HTMLPositionDisplayer(mockElement);

expect(Object.isFrozen(displayer)).toBe(true);
});

it('should accept null element', () => {
expect(() => {
new HTMLPositionDisplayer(null);
}).not.toThrow();
});
});

describe('formatAccuracyQuality()', () => {
let displayer;

beforeEach(() => {
displayer = new HTMLPositionDisplayer({ innerHTML: '' });
});

it('should format excellent to Excelente', () => {
expect(displayer.formatAccuracyQuality('excellent')).toBe('Excelente');
});

it('should format good to Boa', () => {
expect(displayer.formatAccuracyQuality('good')).toBe('Boa');
});

it('should format medium to Média', () => {
expect(displayer.formatAccuracyQuality('medium')).toBe('Média');
});

it('should format bad to Ruim', () => {
expect(displayer.formatAccuracyQuality('bad')).toBe('Ruim');
});

it('should format very bad to Muito Ruim', () => {
expect(displayer.formatAccuracyQuality('very bad')).toBe('Muito Ruim');
});

it('should return unknown values as-is', () => {
expect(displayer.formatAccuracyQuality('unknown')).toBe('unknown');
});
});

describe('renderPositionHtml()', () => {
let displayer;
let mockPositionManager;

beforeEach(() => {
displayer = new HTMLPositionDisplayer({ innerHTML: '' });

mockPositionManager = {
lastPosition: {
accuracyQuality: 'excellent',
geolocationPosition: {
coords: {
latitude: -18.4696091,
longitude: -43.4953982,
accuracy: 10.5
}
}
}
};
});

it('should return error for null manager', () => {
const html = displayer.renderPositionHtml(null);
expect(html).toContain('No position data available');
});

it('should return error for missing lastPosition', () => {
mockPositionManager.lastPosition = null;
const html = displayer.renderPositionHtml(mockPositionManager);
expect(html).toContain('No position data available');
});

it('should include details/summary structure', () => {
const html = displayer.renderPositionHtml(mockPositionManager);
expect(html).toContain('<details');
expect(html).toContain('<summary>');
expect(html).toContain('Posição Atual');
});

it('should display coordinates with precision', () => {
const html = displayer.renderPositionHtml(mockPositionManager);
expect(html).toContain('-18.469609'); // 6 decimal places
expect(html).toContain('-43.495398');
});

it('should display accuracy', () => {
const html = displayer.renderPositionHtml(mockPositionManager);
expect(html).toContain('10.50'); // 2 decimal places
});

it('should display formatted quality', () => {
const html = displayer.renderPositionHtml(mockPositionManager);
expect(html).toContain('Excelente');
});

it('should display altitude when available', () => {
mockPositionManager.lastPosition.geolocationPosition.coords.altitude = 1000.5;
const html = displayer.renderPositionHtml(mockPositionManager);
expect(html).toContain('1000.50 metros');
});

it('should not display altitude when null', () => {
mockPositionManager.lastPosition.geolocationPosition.coords.altitude = null;
const html = displayer.renderPositionHtml(mockPositionManager);
expect(html).not.toContain('altitude-info');
});

it('should display speed in km/h', () => {
mockPositionManager.lastPosition.geolocationPosition.coords.speed = 2.5;
const html = displayer.renderPositionHtml(mockPositionManager);
expect(html).toContain('9.00'); // 2.5 * 3.6 = 9.00
});

it('should display heading', () => {
mockPositionManager.lastPosition.geolocationPosition.coords.speed = 1;
mockPositionManager.lastPosition.geolocationPosition.coords.heading = 45;
const html = displayer.renderPositionHtml(mockPositionManager);
expect(html).toContain('45°');
});

it('should handle missing coords', () => {
mockPositionManager.lastPosition.geolocationPosition.coords = null;
const html = displayer.renderPositionHtml(mockPositionManager);
expect(html).toContain('N/A');
});
});

describe('update()', () => {
let mockElement;
let displayer;
let mockPositionManager;

beforeEach(() => {
mockElement = { innerHTML: '' };
displayer = new HTMLPositionDisplayer(mockElement);

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
});

it('should display loading message', () => {
displayer.update(mockPositionManager, 'test', true, null);

expect(mockElement.innerHTML).toContain('Obtendo posição...');
});

it('should display error message', () => {
const error = { message: 'Test error' };
displayer.update(mockPositionManager, 'test', false, error);

expect(mockElement.innerHTML).toContain('Erro ao obter posição:');
expect(mockElement.innerHTML).toContain('Test error');
});

it('should update on PositionManager updated event', () => {
displayer.update(mockPositionManager, 'PositionManager updated', false, null);

expect(mockElement.innerHTML).toContain('-18.469609');
});

it('should update on Immediate address update event', () => {
displayer.update(mockPositionManager, 'Immediate address update', false, null);

expect(mockElement.innerHTML).toContain('-18.469609');
});

it('should not update on other events', () => {
mockElement.innerHTML = 'Original';
displayer.update(mockPositionManager, 'other.event', false, null);

expect(mockElement.innerHTML).toBe('Original');
});

it('should display warning for null lastPosition', () => {
mockPositionManager.lastPosition = null;
displayer.update(mockPositionManager, 'PositionManager updated', false, null);

expect(mockElement.innerHTML).toContain('Dados de posição não disponíveis');
});

it('should prioritize loading over error', () => {
const error = { message: 'Error' };
displayer.update(mockPositionManager, 'test', true, error);

expect(mockElement.innerHTML).toContain('Obtendo posição...');
expect(mockElement.innerHTML).not.toContain('Error');
});

it('should prioritize error over success', () => {
const error = { message: 'Error' };
displayer.update(mockPositionManager, 'PositionManager updated', false, error);

expect(mockElement.innerHTML).toContain('Error');
expect(mockElement.innerHTML).not.toContain('-18');
});
});

describe('toString()', () => {
it('should return class name and element id', () => {
const element = { innerHTML: '', id: 'test-id' };
const displayer = new HTMLPositionDisplayer(element);

expect(displayer.toString()).toBe('HTMLPositionDisplayer: test-id');
});

it('should return no-id when element has no id', () => {
const element = { innerHTML: '' };
const displayer = new HTMLPositionDisplayer(element);

expect(displayer.toString()).toBe('HTMLPositionDisplayer: no-id');
});
});

describe('Edge Cases', () => {
let displayer;

beforeEach(() => {
displayer = new HTMLPositionDisplayer({ innerHTML: '' });
});

it('should handle extreme coordinates', () => {
const manager = {
lastPosition: {
geolocationPosition: {
coords: { latitude: 90, longitude: 180, accuracy: 1000000 },
accuracyQuality: 'bad'
}
}
};

const html = displayer.renderPositionHtml(manager);
expect(html).toContain('90.000000');
expect(html).toContain('180.000000');
});

it('should handle negative coordinates', () => {
const manager = {
lastPosition: {
geolocationPosition: {
coords: { latitude: -90, longitude: -180, accuracy: 1 },
accuracyQuality: 'excellent'
}
}
};

const html = displayer.renderPositionHtml(manager);
expect(html).toContain('-90.000000');
expect(html).toContain('-180.000000');
});

it('should handle speed of 0', () => {
const manager = {
lastPosition: {
geolocationPosition: {
coords: { latitude: 0, longitude: 0, accuracy: 1, speed: 0 },
accuracyQuality: 'good'
}
}
};

const html = displayer.renderPositionHtml(manager);
expect(html).toContain('0.00 km/h');
});
});
});
