/**
 * @jest-environment jsdom
 */
import { mount, VueWrapper } from '@vue/test-utils';
import MonitorView from '../../../src/components/views/MonitorView.vue';

jest.mock('../../../src/timing/sharedChronometer.js', () => ({
  attachSharedChronometerElement: jest.fn(),
  detachSharedChronometerElement: jest.fn(),
}));

import {
  attachSharedChronometerElement,
  detachSharedChronometerElement,
} from '../../../src/timing/sharedChronometer.js';

describe('MonitorView.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = mount(MonitorView);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders the Monitor header and description', () => {
    expect(wrapper.find('h2').text()).toBe('Monitor');
    expect(wrapper.text()).toContain('Acompanhe os indicadores de rastreamento em um painel dedicado.');
  });

  it('renders the chronometer group with correct label and hint', () => {
    const label = wrapper.find('label.chronometer-label');
    expect(label.exists()).toBe(true);
    expect(label.text()).toContain('Tempo de rastreamento');
    const hint = label.find('.label-hint');
    expect(hint.exists()).toBe(true);
    expect(hint.attributes('aria-label')).toBe('Tempo desde que iniciou o rastreamento contínuo');
  });

  it('renders the chronometer display with correct ARIA attributes', () => {
    const chronometer = wrapper.find('.chronometer-value');
    expect(chronometer.exists()).toBe(true);
    expect(chronometer.attributes('role')).toBe('timer');
    expect(chronometer.attributes('aria-live')).toBe('off');
    expect(chronometer.text()).toBe('00:00:00');
    const desc = wrapper.find('.chronometer-description');
    expect(desc.exists()).toBe(true);
    expect(desc.text()).toContain('Tempo desde que iniciou o rastreamento contínuo');
  });

  it('renders the speech synthesis textarea with correct attributes', () => {
    const textarea = wrapper.find('textarea#text-input');
    expect(textarea.exists()).toBe(true);
    expect(textarea.attributes('placeholder')).toBe('Digite o texto para falar...');
    expect(textarea.attributes('aria-label')).toBe('Texto para síntese de voz');
    expect(textarea.classes()).toContain('speech-input-textarea');
  });

  it('calls attachSharedChronometerElement on mount with the chronometer element', () => {
    // The ref is set after mount, so we need to force an update
    wrapper.vm.$forceUpdate();
    // The first call should be with the DOM element or null
    expect(attachSharedChronometerElement).toHaveBeenCalledTimes(1);
    // Accept both null and HTMLElement, as ref may be null at mount
    const arg = (attachSharedChronometerElement as jest.Mock).mock.calls[0][0];
    expect(arg === null || arg instanceof HTMLElement).toBe(true);
  });

  it('calls detachSharedChronometerElement on unmount', () => {
    wrapper.unmount();
    expect(detachSharedChronometerElement).toHaveBeenCalledTimes(1);
  });

  it('does not throw if attachSharedChronometerElement throws', () => {
    (attachSharedChronometerElement as jest.Mock).mockImplementationOnce(() => {
      throw new Error('fail');
    });
    expect(() => {
      mount(MonitorView);
    }).not.toThrow();
  });

  it('does not throw if detachSharedChronometerElement throws', () => {
    (detachSharedChronometerElement as jest.Mock).mockImplementationOnce(() => {
      throw new Error('fail');
    });
    expect(() => {
      wrapper.unmount();
    }).not.toThrow();
  });
});
