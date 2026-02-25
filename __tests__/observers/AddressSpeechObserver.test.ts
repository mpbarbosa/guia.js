/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { AddressSpeechObserver } from '../../src/observers/AddressSpeechObserver.js';
import SpeechSynthesisManager from '../../src/speech/SpeechSynthesisManager.js';
import { SpeechTextBuilder } from '../../src/speech/SpeechTextBuilder.js';
import BrazilianStandardAddress from '../../src/data/BrazilianStandardAddress.js';
import PositionManager from '../../src/core/PositionManager.js';
import { ADDRESS_FETCHED_EVENT } from '../../src/config/defaults.js';

describe('AddressSpeechObserver', () => {
let speechManager;
let textBuilder;
let textInput;
let mockAddress;

beforeEach(() => {
// Create mock text input
textInput = document.createElement('input');
textInput.type = 'text';
textInput.id = 'text-input';

// Create mock SpeechSynthesisManager
speechManager = new SpeechSynthesisManager();
jest.spyOn(speechManager, 'speak').mockImplementation(() => {});

// Create real SpeechTextBuilder
textBuilder = new SpeechTextBuilder();

// Create mock address
mockAddress = new BrazilianStandardAddress();
mockAddress.logradouro = 'Rua das Flores';
mockAddress.numero = '123';
mockAddress.bairro = 'Centro';
mockAddress.municipio = 'São Paulo';
mockAddress.uf = 'SP';
});

afterEach(() => {
jest.restoreAllMocks();
});

describe('Constructor', () => {
it('should create instance with valid parameters', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

expect(observer).toBeInstanceOf(AddressSpeechObserver);
expect(observer.speechManager).toBe(speechManager);
expect(observer.textBuilder).toBe(textBuilder);
expect(observer.textInput).toBe(textInput);
});

it('should throw TypeError if speechManager is null', () => {
expect(() => {
new AddressSpeechObserver(null, textBuilder, textInput);
}).toThrow(TypeError);
expect(() => {
new AddressSpeechObserver(null, textBuilder, textInput);
}).toThrow("SpeechManager parameter cannot be null or undefined");
});

it('should throw TypeError if speechManager is undefined', () => {
expect(() => {
new AddressSpeechObserver(undefined, textBuilder, textInput);
}).toThrow(TypeError);
});

it('should throw TypeError if textBuilder is null', () => {
expect(() => {
new AddressSpeechObserver(speechManager, null, textInput);
}).toThrow(TypeError);
expect(() => {
new AddressSpeechObserver(speechManager, null, textInput);
}).toThrow("TextBuilder parameter cannot be null or undefined");
});

it('should throw TypeError if textBuilder is undefined', () => {
expect(() => {
new AddressSpeechObserver(speechManager, undefined, textInput);
}).toThrow(TypeError);
});

it('should accept null textInput', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, null);

expect(observer.textInput).toBeNull();
});

it('should accept undefined textInput', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, undefined);

expect(observer.textInput).toBeNull();
});

it('should initialize first address announced flag as false', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

expect(observer.hasAnnouncedFirstAddress()).toBe(false);
});
});

describe('update() - First Address', () => {
it('should announce first address with priority 2.5', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

observer.update(mockAddress, mockAddress, ADDRESS_FETCHED_EVENT);

expect(speechManager.speak).toHaveBeenCalledTimes(1);
const [text, priority] = speechManager.speak.mock.calls[0];
expect(priority).toBe(2.5);
expect(text).toContain('Rua das Flores');
expect(text).toContain('São Paulo');
});

it('should set first address announced flag', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

expect(observer.hasAnnouncedFirstAddress()).toBe(false);

observer.update(mockAddress, mockAddress, ADDRESS_FETCHED_EVENT);

expect(observer.hasAnnouncedFirstAddress()).toBe(true);
});

it('should not announce first address twice', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

observer.update(mockAddress, mockAddress, ADDRESS_FETCHED_EVENT);
speechManager.speak.mockClear();

observer.update(mockAddress, mockAddress, ADDRESS_FETCHED_EVENT);

expect(speechManager.speak).not.toHaveBeenCalled();
});

it('should update text input with first address', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

observer.update(mockAddress, mockAddress, ADDRESS_FETCHED_EVENT);

expect(textInput.value).toContain('Rua das Flores');
expect(textInput.value).toContain('São Paulo');
});
});

describe('update() - Municipality Change', () => {
it('should announce municipality change with priority 3', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

const changeDetails = {
previous: { municipio: 'Santos' },
current: { municipio: 'São Paulo' },
currentAddress: mockAddress
};

observer.update(mockAddress, 'MunicipioChanged', 'strCurrPosUpdate', changeDetails);

expect(speechManager.speak).toHaveBeenCalledTimes(1);
const [text, priority] = speechManager.speak.mock.calls[0];
expect(priority).toBe(3);
});

it('should use changeDetails.currentAddress for municipality text', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

const fullAddress = new BrazilianStandardAddress();
fullAddress.municipio = 'São Paulo';
fullAddress.uf = 'SP';

const changeDetails = {
previous: { municipio: 'Santos' },
current: { municipio: 'São Paulo' },
currentAddress: fullAddress
};

observer.update({}, 'MunicipioChanged', 'strCurrPosUpdate', changeDetails);

expect(speechManager.speak).toHaveBeenCalled();
const [text] = speechManager.speak.mock.calls[0];
expect(text).toContain('São Paulo');
});

it('should update text input with municipality change', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

const changeDetails = {
previous: { municipio: 'Santos' },
current: { municipio: 'São Paulo' },
currentAddress: mockAddress
};

observer.update(mockAddress, 'MunicipioChanged', 'strCurrPosUpdate', changeDetails);

expect(textInput.value.length).toBeGreaterThan(0);
});
});

describe('update() - Bairro Change', () => {
it('should announce bairro change with priority 2', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

const changeDetails = {
currentAddress: mockAddress
};

observer.update(mockAddress, 'BairroChanged', 'strCurrPosUpdate', changeDetails);

expect(speechManager.speak).toHaveBeenCalledTimes(1);
const [text, priority] = speechManager.speak.mock.calls[0];
expect(priority).toBe(2);
expect(text).toContain('Centro');
});

it('should use full address for bairro text', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

const fullAddress = new BrazilianStandardAddress();
fullAddress.bairro = 'Jardins';

const changeDetails = {
currentAddress: fullAddress
};

observer.update({}, 'BairroChanged', 'strCurrPosUpdate', changeDetails);

expect(speechManager.speak).toHaveBeenCalled();
const [text] = speechManager.speak.mock.calls[0];
expect(text).toContain('Jardins');
});

it('should update text input with bairro change', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

observer.update(mockAddress, 'BairroChanged', 'strCurrPosUpdate', { currentAddress: mockAddress });

expect(textInput.value).toContain('Centro');
});
});

describe('update() - Logradouro Change', () => {
it('should announce logradouro change with priority 1', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

const changeDetails = {
currentAddress: mockAddress
};

observer.update(mockAddress, 'LogradouroChanged', 'strCurrPosUpdate', changeDetails);

expect(speechManager.speak).toHaveBeenCalledTimes(1);
const [text, priority] = speechManager.speak.mock.calls[0];
expect(priority).toBe(1);
expect(text).toContain('Rua das Flores');
});

it('should use full address for logradouro text', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

const fullAddress = new BrazilianStandardAddress();
fullAddress.logradouro = 'Avenida Paulista';

const changeDetails = {
currentAddress: fullAddress
};

observer.update({}, 'LogradouroChanged', 'strCurrPosUpdate', changeDetails);

expect(speechManager.speak).toHaveBeenCalled();
const [text] = speechManager.speak.mock.calls[0];
expect(text).toContain('Avenida Paulista');
});

it('should update text input with logradouro change', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

observer.update(mockAddress, 'LogradouroChanged', 'strCurrPosUpdate', { currentAddress: mockAddress });

expect(textInput.value).toContain('Rua das Flores');
});
});

describe('update() - Periodic Updates', () => {
it('should announce periodic full address with priority 0', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

observer.update(mockAddress, mockAddress, PositionManager.strCurrPosUpdate);

expect(speechManager.speak).toHaveBeenCalledTimes(1);
const [text, priority] = speechManager.speak.mock.calls[0];
expect(priority).toBe(0);
expect(text).toContain('Rua das Flores');
expect(text).toContain('São Paulo');
});

it('should update text input with periodic address', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

observer.update(mockAddress, mockAddress, PositionManager.strCurrPosUpdate);

expect(textInput.value).toContain('Rua das Flores');
});
});

describe('update() - Edge Cases', () => {
it('should return early if currentAddress is null', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

observer.update(null, mockAddress, ADDRESS_FETCHED_EVENT);

expect(speechManager.speak).not.toHaveBeenCalled();
});

it('should return early if currentAddress is undefined', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

observer.update(undefined, mockAddress, ADDRESS_FETCHED_EVENT);

expect(speechManager.speak).not.toHaveBeenCalled();
});

it('should not speak for immediate updates without change event', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

observer.update(mockAddress, mockAddress, PositionManager.strImmediateAddressUpdate);

expect(speechManager.speak).not.toHaveBeenCalled();
});

it('should not crash if textInput is null', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, null);

expect(() => {
observer.update(mockAddress, mockAddress, ADDRESS_FETCHED_EVENT);
}).not.toThrow();

expect(speechManager.speak).toHaveBeenCalled();
});

it('should handle missing changeDetails gracefully', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

observer.update(mockAddress, 'MunicipioChanged', 'strCurrPosUpdate');

expect(speechManager.speak).toHaveBeenCalled();
});

it('should fallback to currentAddress if changeDetails.currentAddress missing', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

const changeDetails = {
previous: { municipio: 'Santos' },
current: { municipio: 'São Paulo' }
// currentAddress intentionally omitted
};

observer.update(mockAddress, 'MunicipioChanged', 'strCurrPosUpdate', changeDetails);

expect(speechManager.speak).toHaveBeenCalled();
});
});

describe('resetFirstAddressFlag()', () => {
it('should reset first address announced flag', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

// Announce first address
observer.update(mockAddress, mockAddress, ADDRESS_FETCHED_EVENT);
expect(observer.hasAnnouncedFirstAddress()).toBe(true);

// Reset flag
observer.resetFirstAddressFlag();
expect(observer.hasAnnouncedFirstAddress()).toBe(false);
});

it('should allow first address to be announced again after reset', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

// Announce first address
observer.update(mockAddress, mockAddress, ADDRESS_FETCHED_EVENT);
speechManager.speak.mockClear();

// Try again - should not speak
observer.update(mockAddress, mockAddress, ADDRESS_FETCHED_EVENT);
expect(speechManager.speak).not.toHaveBeenCalled();

// Reset and try again - should speak
observer.resetFirstAddressFlag();
observer.update(mockAddress, mockAddress, ADDRESS_FETCHED_EVENT);
expect(speechManager.speak).toHaveBeenCalled();
});
});

describe('hasAnnouncedFirstAddress()', () => {
it('should return false initially', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

expect(observer.hasAnnouncedFirstAddress()).toBe(false);
});

it('should return true after first address announcement', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

observer.update(mockAddress, mockAddress, ADDRESS_FETCHED_EVENT);

expect(observer.hasAnnouncedFirstAddress()).toBe(true);
});

it('should return false after reset', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

observer.update(mockAddress, mockAddress, ADDRESS_FETCHED_EVENT);
observer.resetFirstAddressFlag();

expect(observer.hasAnnouncedFirstAddress()).toBe(false);
});
});

describe('toString()', () => {
it('should return class name', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

expect(observer.toString()).toBe('AddressSpeechObserver');
});
});

describe('Integration Tests', () => {
it('should handle complete address change workflow', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

// First address
observer.update(mockAddress, mockAddress, ADDRESS_FETCHED_EVENT);
expect(speechManager.speak).toHaveBeenCalledWith(expect.any(String), 2.5);
speechManager.speak.mockClear();

// Municipality change
const municipioChange = {
previous: { municipio: 'São Paulo' },
current: { municipio: 'Santos' },
currentAddress: mockAddress
};
observer.update(mockAddress, 'MunicipioChanged', 'strCurrPosUpdate', municipioChange);
expect(speechManager.speak).toHaveBeenCalledWith(expect.any(String), 3);
speechManager.speak.mockClear();

// Bairro change
observer.update(mockAddress, 'BairroChanged', 'strCurrPosUpdate', { currentAddress: mockAddress });
expect(speechManager.speak).toHaveBeenCalledWith(expect.any(String), 2);
speechManager.speak.mockClear();

// Logradouro change
observer.update(mockAddress, 'LogradouroChanged', 'strCurrPosUpdate', { currentAddress: mockAddress });
expect(speechManager.speak).toHaveBeenCalledWith(expect.any(String), 1);
speechManager.speak.mockClear();

// Periodic update
observer.update(mockAddress, mockAddress, PositionManager.strCurrPosUpdate);
expect(speechManager.speak).toHaveBeenCalledWith(expect.any(String), 0);
});

it('should coordinate text input updates with speech', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

observer.update(mockAddress, mockAddress, ADDRESS_FETCHED_EVENT);

const spokenText = speechManager.speak.mock.calls[0][0];
const inputText = textInput.value;

expect(inputText).toBe(spokenText);
});

it('should handle priority ordering correctly', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

const events = [
{ event: 'LogradouroChanged', priority: 1 },
{ event: 'BairroChanged', priority: 2 },
{ event: 'MunicipioChanged', priority: 3 }
];

events.forEach(({ event, priority }) => {
speechManager.speak.mockClear();
observer.update(mockAddress, event, 'strCurrPosUpdate', { currentAddress: mockAddress });
expect(speechManager.speak).toHaveBeenCalledWith(expect.any(String), priority);
});
});
});

describe('Brazilian Portuguese Features', () => {
it('should produce Brazilian Portuguese text for municipality change', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

const changeDetails = {
previous: { municipio: 'Santos' },
current: { municipio: 'São Paulo' },
currentAddress: mockAddress
};

observer.update(mockAddress, 'MunicipioChanged', 'strCurrPosUpdate', changeDetails);

const text = speechManager.speak.mock.calls[0][0];
// Should contain Portuguese words
expect(text.toLowerCase()).toMatch(/você|saiu|entrou/);
});

it('should produce Brazilian Portuguese text for bairro change', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

observer.update(mockAddress, 'BairroChanged', 'strCurrPosUpdate', { currentAddress: mockAddress });

const text = speechManager.speak.mock.calls[0][0];
expect(text).toContain('Centro');
});

it('should produce Brazilian Portuguese text for full address', () => {
const observer = new AddressSpeechObserver(speechManager, textBuilder, textInput);

observer.update(mockAddress, mockAddress, ADDRESS_FETCHED_EVENT);

const text = speechManager.speak.mock.calls[0][0];
// Should contain address components in Portuguese format
expect(text).toContain('Rua das Flores');
expect(text).toContain('Centro');
expect(text).toContain('São Paulo');
});
});
});
