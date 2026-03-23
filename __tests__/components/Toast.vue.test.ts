/**
 * @file Toast.vue.test.ts
 * @description Tests for the Toast Vue SFC component.
 * @since 0.12.6-alpha
 */

import { mount } from '@vue/test-utils';
import Toast from '../../src/components/Toast.vue';

describe('Toast.vue', () => {
  test('renders the message', () => {
    const wrapper = mount(Toast, {
      props: { message: 'Hello world', toastId: 'test-1' },
    });
    expect(wrapper.text()).toContain('Hello world');
  });

  test('defaults to info type', () => {
    const wrapper = mount(Toast, {
      props: { message: 'Info msg', toastId: 'test-2' },
    });
    expect(wrapper.classes()).toContain('toast-info');
  });

  test('applies correct class for success type', () => {
    const wrapper = mount(Toast, {
      props: { message: 'Done', toastId: 'test-3', type: 'success' },
    });
    expect(wrapper.classes()).toContain('toast-success');
  });

  test('applies correct class for error type', () => {
    const wrapper = mount(Toast, {
      props: { message: 'Error', toastId: 'test-4', type: 'error' },
    });
    expect(wrapper.classes()).toContain('toast-error');
  });

  test('applies correct class for warning type', () => {
    const wrapper = mount(Toast, {
      props: { message: 'Warn', toastId: 'test-5', type: 'warning' },
    });
    expect(wrapper.classes()).toContain('toast-warning');
  });

  test('error type has role=alert', () => {
    const wrapper = mount(Toast, {
      props: { message: 'Critical', toastId: 'test-6', type: 'error' },
    });
    expect(wrapper.attributes('role')).toBe('alert');
  });

  test('info type has role=status', () => {
    const wrapper = mount(Toast, {
      props: { message: 'FYI', toastId: 'test-7' },
    });
    expect(wrapper.attributes('role')).toBe('status');
  });

  test('emits dismiss event with toastId when close button clicked', async () => {
    const wrapper = mount(Toast, {
      props: { message: 'Close me', toastId: 'close-1' },
    });
    await wrapper.find('button.toast-close').trigger('click');
    expect(wrapper.emitted('dismiss')).toBeTruthy();
    expect(wrapper.emitted('dismiss')![0]).toEqual(['close-1']);
  });

  test('sets data-toast-id attribute', () => {
    const wrapper = mount(Toast, {
      props: { message: 'Tagged', toastId: 'tag-99' },
    });
    expect(wrapper.attributes('data-toast-id')).toBe('tag-99');
  });
});
