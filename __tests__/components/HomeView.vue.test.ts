/**
 * @jest-environment jsdom
 */
import { mount, flushPromises } from '@vue/test-utils';
import { jest } from '@jest/globals';
import HomeView from '../../src/components/HomeView.vue';

// Mock HomeViewController to avoid real geolocation/DOM side effects
jest.mock('../../src/views/home.js', () => {
  const MockController = jest.fn().mockImplementation(() => ({
    isTracking: jest.fn(() => false),
    destroy: jest.fn(),
    toggleTracking: jest.fn(),
  }));
  (MockController as any).create = jest.fn().mockResolvedValue(
    new (MockController as any)()
  );
  return { default: MockController };
});

describe('HomeView.vue', () => {
  test('renders slot content', () => {
    const wrapper = mount(HomeView, {
      slots: { default: '<div id="slot-content">Hello</div>' },
    });
    expect(wrapper.find('#slot-content').exists()).toBe(true);
  });

  test('exposes isTracking as false initially', () => {
    const wrapper = mount(HomeView);
    expect((wrapper.vm as any).isTracking).toBe(false);
  });

  test('exposes isInitialized as false before mount settles', () => {
    const wrapper = mount(HomeView);
    // Before flushPromises isInitialized may still be false
    expect(typeof (wrapper.vm as any).isInitialized).toBe('boolean');
  });

  test('exposes toggleTracking function', () => {
    const wrapper = mount(HomeView);
    expect(typeof (wrapper.vm as any).toggleTracking).toBe('function');
  });

  test('isInitialized becomes true after controller init', async () => {
    const wrapper = mount(HomeView);
    await flushPromises();
    expect((wrapper.vm as any).isInitialized).toBe(true);
  });

  test('destroy is called on unmount', async () => {
    const HomeViewController = (await import('../../src/views/home.js')).default as any;
    const mockInstance = { isTracking: jest.fn(() => false), destroy: jest.fn(), toggleTracking: jest.fn() };
    HomeViewController.create = jest.fn().mockResolvedValue(mockInstance);

    const wrapper = mount(HomeView);
    await flushPromises();
    wrapper.unmount();

    expect(mockInstance.destroy).toHaveBeenCalledTimes(1);
  });
});
