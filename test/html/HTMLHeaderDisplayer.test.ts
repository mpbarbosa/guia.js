// HTMLHeaderDisplayer.test.ts
import HTMLHeaderDisplayer from '../src/html/HTMLHeaderDisplayer';
import { log, warn } from '../src/utils/logger.js';

jest.mock('../src/utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
}));

function createMockElement(id: string, text: string = ''): Element {
  const el = document.createElement('div');
  el.id = id;
  el.textContent = text;
  return el;
}

describe('HTMLHeaderDisplayer', () => {
  let documentMock: Document;

  beforeEach(() => {
    documentMock = document.implementation.createHTMLDocument('Test');
    jest.clearAllMocks();
  });

  it('should initialize and observe municipio and bairro elements', () => {
    const headerTextEl = createMockElement('header-location-text');
    const municipioEl = createMockElement('municipio-value', 'Paraty');
    const bairroEl = createMockElement('bairro-value', 'Centro');
    documentMock.body.append(headerTextEl, municipioEl, bairroEl);

    const displayer = new HTMLHeaderDisplayer(documentMock);

    expect(displayer._headerTextEl).toBe(headerTextEl);
    expect(displayer._municipioEl).toBe(municipioEl);
    expect(displayer._bairroEl).toBe(bairroEl);
    expect(displayer._observer).toBeInstanceOf(MutationObserver);
    expect(Object.isFrozen(displayer)).toBe(true);
    expect(log).toHaveBeenCalledWith('(HTMLHeaderDisplayer) Initialized — observing municipio + bairro');
    expect(headerTextEl.textContent).toBe(' · ');
    expect(headerTextEl.getAttribute('data-pending')).toBe('false');
  });

  it('should set data-pending to true if both municipio and bairro are missing', () => {
    const headerTextEl = createMockElement('header-location-text');
    const municipioEl = createMockElement('municipio-value', '');
    const bairroEl = createMockElement('bairro-value', '');
    documentMock.body.append(headerTextEl, municipioEl, bairroEl);

    const displayer = new HTMLHeaderDisplayer(documentMock);

    expect(headerTextEl.getAttribute('data-pending')).toBe('true');
  });

  it('should handle missing municipio or bairro elements gracefully', () => {
    const headerTextEl = createMockElement('header-location-text');
    documentMock.body.append(headerTextEl);

    const displayer = new HTMLHeaderDisplayer(documentMock);

    expect(displayer._municipioEl).toBeNull();
    expect(displayer._bairroEl).toBeNull();
    expect(headerTextEl.getAttribute('data-pending')).toBe('true');
  });

  it('should warn and not observe if header-location-text is missing', () => {
    const municipioEl = createMockElement('municipio-value', 'Paraty');
    const bairroEl = createMockElement('bairro-value', 'Centro');
    documentMock.body.append(municipioEl, bairroEl);

    const displayer = new HTMLHeaderDisplayer(documentMock);

    expect(displayer._headerTextEl).toBeNull();
    expect(displayer._observer).toBeNull();
    expect(warn).toHaveBeenCalledWith('(HTMLHeaderDisplayer) #header-location-text not found — header will not update');
    expect(Object.isFrozen(displayer)).toBe(true);
  });

  it('should update header text when municipio or bairro changes', () => {
    const headerTextEl = createMockElement('header-location-text');
    const municipioEl = createMockElement('municipio-value', 'Old');
    const bairroEl = createMockElement('bairro-value', 'Old');
    documentMock.body.append(headerTextEl, municipioEl, bairroEl);

    const displayer = new HTMLHeaderDisplayer(documentMock);

    municipioEl.textContent = 'NewMunicipio';
    const mutation = new MutationRecord();
    displayer._render();
    expect(headerTextEl.textContent).toBe(' · ');
    expect(headerTextEl.getAttribute('data-pending')).toBe('false');
    expect(log).toHaveBeenCalledWith(`(HTMLHeaderDisplayer) Updated: " · "`);

    municipioEl.textContent = '';
    bairroEl.textContent = '';
    displayer._render();
    expect(headerTextEl.getAttribute('data-pending')).toBe('true');
  });

  it('should disconnect observer and log on disconnect', () => {
    const headerTextEl = createMockElement('header-location-text');
    const municipioEl = createMockElement('municipio-value', 'Paraty');
    const bairroEl = createMockElement('bairro-value', 'Centro');
    documentMock.body.append(headerTextEl, municipioEl, bairroEl);

    const displayer = new HTMLHeaderDisplayer(documentMock);
    const disconnectSpy = jest.spyOn(displayer._observer as MutationObserver, 'disconnect');

    displayer.disconnect();
    expect(disconnectSpy).toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith('(HTMLHeaderDisplayer) Observer disconnected');
  });

  it('should return correct string from toString()', () => {
    const headerTextEl = createMockElement('header-location-text');
    documentMock.body.append(headerTextEl);

    const displayer = new HTMLHeaderDisplayer(documentMock);
    expect(displayer.toString()).toBe('HTMLHeaderDisplayer');
  });

  it('should create a frozen instance using static create()', () => {
    const headerTextEl = createMockElement('header-location-text');
    documentMock.body.append(headerTextEl);

    const displayer = HTMLHeaderDisplayer.create(documentMock);
    expect(displayer).toBeInstanceOf(HTMLHeaderDisplayer);
    expect(Object.isFrozen(displayer)).toBe(true);
  });
});
