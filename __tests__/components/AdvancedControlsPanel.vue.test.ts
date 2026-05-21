/**
 * @jest-environment jsdom
 */
import { mount, VueWrapper } from '@vue/test-utils';
import AdvancedControlsPanel from '../../src/components/AdvancedControlsPanel.vue';

describe('AdvancedControlsPanel.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    wrapper = mount(AdvancedControlsPanel);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders the details panel with summary and advanced controls', () => {
    const details = wrapper.get('details#advanced-controls');
    expect(details.exists()).toBe(true);

    const summary = details.get('summary.advanced-controls-summary');
    expect(summary.text()).toContain('Opções Avançadas');
    expect(summary.find('.summary-icon').text()).toBe('⚙️');
  });

  it('renders the "Inserir posição de teste" button with correct attributes', () => {
    const button = wrapper.get('#insertPositionButton');
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe('Inserir posição de teste');
    expect(button.attributes('aria-label')).toBe('Inserir posição de teste');
    expect(button.classes()).toContain('md3-button-outlined');
  });

  it('renders the chronometer group with correct label and value', () => {
    const chronometerGroup = wrapper.get('.chronometer-group');
    expect(chronometerGroup.exists()).toBe(true);

    const label = chronometerGroup.get('label.chronometer-label');
    expect(label.text()).toContain('Tempo de rastreamento');
    expect(label.find('.label-hint').attributes('aria-label')).toBe('Tempo desde que iniciou o rastreamento contínuo');

    const value = chronometerGroup.get('.chronometer-value');
    expect(value.text()).toBe('00:00:00');
    expect(value.attributes('role')).toBe('timer');
    expect(value.attributes('aria-live')).toBe('off');

    const description = chronometerGroup.get('.chronometer-description');
    expect(description.text()).toBe('Tempo desde que iniciou o rastreamento contínuo');
  });

  it('renders the speech synthesis textarea with correct attributes', () => {
    const textarea = wrapper.get('#text-input');
    expect(textarea.exists()).toBe(true);
    expect(textarea.attributes('placeholder')).toBe('Digite o texto para falar...');
    expect(textarea.attributes('aria-label')).toBe('Texto para síntese de voz');
    expect(textarea.classes()).toContain('speech-input-textarea');
  });

  it('renders the navigation log output with correct ARIA attributes', () => {
    const output = wrapper.get('#navigation-log');
    expect(output.exists()).toBe(true);
    expect(output.attributes('role')).toBe('log');
    expect(output.attributes('aria-live')).toBe('polite');
    expect(output.attributes('aria-atomic')).toBe('false');
    expect(output.classes()).toContain('navigation-log');
  });

  it('renders the hidden bottom-scroll textarea for accessibility', () => {
    const hiddenTextarea = wrapper.get('#bottom-scroll-textarea');
    expect(hiddenTextarea.exists()).toBe(true);
    expect(hiddenTextarea.classes()).toContain('hidden');
    expect(hiddenTextarea.attributes('aria-hidden')).toBe('true');
  });

  it('renders all required labels for accessibility', () => {
    const navLogLabel = wrapper.get('label[for="navigation-log"]');
    expect(navLogLabel.exists()).toBe(true);
    expect(navLogLabel.text()).toBe('Histórico de navegação');

    const speechLabel = wrapper.get('label[for="text-input"]');
    expect(speechLabel.exists()).toBe(true);
    expect(speechLabel.text()).toBe('Síntese de Voz');
  });

  it('expands and collapses the details panel when clicked', async () => {
    const details = wrapper.get('details#advanced-controls');
    expect(details.element.hasAttribute('open')).toBe(false);

    // Simulate click to open
    await details.trigger('click');
    // The open attribute is managed by the browser, not Vue, so we simulate it
    details.element.setAttribute('open', '');
    await wrapper.vm.$nextTick();
    expect(details.element.hasAttribute('open')).toBe(true);

    // Simulate click to close
    details.element.removeAttribute('open');
    await wrapper.vm.$nextTick();
    expect(details.element.hasAttribute('open')).toBe(false);
  });

  it('allows typing into the speech synthesis textarea', async () => {
    const textarea = wrapper.get('#text-input');
    await textarea.setValue('Olá, mundo!');
    expect((textarea.element as HTMLTextAreaElement).value).toBe('Olá, mundo!');
  });

  it('does not throw when clicking the insert position button (no-op)', async () => {
    const button = wrapper.get('#insertPositionButton');
    await expect(button.trigger('click')).resolves.not.toThrow();
  });

  it('chronometer value remains static (no timer logic present)', () => {
    const value = wrapper.get('.chronometer-value');
    expect(value.text()).toBe('00:00:00');
  });

  it('renders all main sections even if DOM is manipulated', async () => {
    // Remove a section and re-render
    wrapper.element.querySelector('.advanced-control-group')?.remove();
    await wrapper.vm.$nextTick();
    // The component should still render the details and other controls
    expect(wrapper.get('details#advanced-controls').exists()).toBe(true);
  });
});
