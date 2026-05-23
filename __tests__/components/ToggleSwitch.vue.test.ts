/**
 * @jest-environment jsdom
 */
import { mount, VueWrapper } from '@vue/test-utils';
import ToggleSwitch from '../../src/components/ToggleSwitch.vue';

describe('ToggleSwitch.vue', () => {
  let wrapper: VueWrapper<any>;

  const factory = (modelValue: boolean = false) =>
    mount(ToggleSwitch, {
      props: {
        modelValue,
      },
    });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
  });

  it('renders with correct initial state (off)', () => {
    wrapper = factory(false);
    const button = wrapper.get('button');
    expect(button.attributes('aria-pressed')).toBe('false');
    expect(button.classes()).toContain('bg-outline-variant');
    expect(button.classes()).not.toContain('bg-primary');
    const knob = wrapper.get('div');
    expect(knob.classes()).toContain('translate-x-0');
    expect(knob.classes()).not.toContain('translate-x-6');
  });

  it('renders with correct initial state (on)', () => {
    wrapper = factory(true);
    const button = wrapper.get('button');
    expect(button.attributes('aria-pressed')).toBe('true');
    expect(button.classes()).toContain('bg-primary');
    expect(button.classes()).not.toContain('bg-outline-variant');
    const knob = wrapper.get('div');
    expect(knob.classes()).toContain('translate-x-6');
    expect(knob.classes()).not.toContain('translate-x-0');
  });

  it('emits update:modelValue with toggled value on click (off → on)', async () => {
    wrapper = factory(false);
    const button = wrapper.get('button');
    await button.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([true]);
  });

  it('emits update:modelValue with toggled value on click (on → off)', async () => {
    wrapper = factory(true);
    const button = wrapper.get('button');
    await button.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false]);
  });

  it('button has correct type and accessibility attributes', () => {
    wrapper = factory(false);
    const button = wrapper.get('button');
    expect(button.attributes('type')).toBe('button');
    expect(button.attributes('aria-pressed')).toBe('false');
  });

  it('applies all required classes for styling', () => {
    wrapper = factory(false);
    const button = wrapper.get('button');
    expect(button.classes()).toEqual(
      expect.arrayContaining([
        'w-12',
        'h-6',
        'rounded-full',
        'p-1',
        'transition-colors',
        'shrink-0',
        'bg-outline-variant',
      ])
    );
    const knob = wrapper.get('div');
    expect(knob.classes()).toEqual(
      expect.arrayContaining([
        'w-4',
        'h-4',
        'bg-white',
        'rounded-full',
        'transition-transform',
        'translate-x-0',
      ])
    );
  });

  it('toggles classes and aria-pressed when modelValue changes', async () => {
    wrapper = factory(false);
    const button = wrapper.get('button');
    const knob = wrapper.get('div');
    expect(button.attributes('aria-pressed')).toBe('false');
    expect(button.classes()).toContain('bg-outline-variant');
    expect(knob.classes()).toContain('translate-x-0');

    await wrapper.setProps({ modelValue: true });
    expect(button.attributes('aria-pressed')).toBe('true');
    expect(button.classes()).toContain('bg-primary');
    expect(knob.classes()).toContain('translate-x-6');
  });
});
