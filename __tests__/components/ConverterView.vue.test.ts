/**
 * @jest-environment jsdom
 */
import { mount, flushPromises } from '@vue/test-utils';
import { jest } from '@jest/globals';
import ConverterView from '../../src/components/ConverterView.vue';

// Mock external deps
jest.mock('../../src/utils/html-sanitizer.js', () => ({
  escapeHtml: (s: string) => s,
}));
jest.mock('../../src/address-parser.js', () => ({
  determineLocationType: () => ({ type: 'bairro', value: null }),
  formatLocationValue: (v: string | null) => v ?? '—',
}));
jest.mock('../../src/config/environment.js', () => ({
  env: { nominatimApiUrl: 'https://nominatim.test', nominatimUserAgent: 'test' },
}));

// jsdom doesn't provide fetch — define a stub so jest.spyOn can attach to it
if (!global.fetch) {
  (global as any).fetch = () => Promise.resolve({ ok: true, json: async () => ({}) });
}

describe('ConverterView.vue', () => {
  test('renders form with latitude and longitude inputs', () => {
    const wrapper = mount(ConverterView);
    expect(wrapper.find('#latitude').exists()).toBe(true);
    expect(wrapper.find('#longitude').exists()).toBe(true);
  });

  test('renders "Obter Endereço" submit button', () => {
    const wrapper = mount(ConverterView);
    expect(wrapper.find('button[type="submit"]').text()).toContain('Obter Endereço');
  });

  test('latitude validation: empty value sets error', () => {
    const wrapper = mount(ConverterView);
    (wrapper.vm as any).validateLatitude();
    expect((wrapper.vm as any).latError).toBe('Por favor, insira a latitude.');
    expect((wrapper.vm as any).latInvalid).toBe(true);
  });

  test('latitude validation: out-of-range sets error', () => {
    const wrapper = mount(ConverterView);
    (wrapper.vm as any).latitude = '200';
    (wrapper.vm as any).validateLatitude();
    expect((wrapper.vm as any).latError).toContain('-90');
  });

  test('latitude validation: valid value clears error', () => {
    const wrapper = mount(ConverterView);
    (wrapper.vm as any).latitude = '-23.5505';
    const result = (wrapper.vm as any).validateLatitude();
    expect(result).toBe(true);
    expect((wrapper.vm as any).latError).toBe('');
  });

  test('longitude validation: empty value sets error', () => {
    const wrapper = mount(ConverterView);
    (wrapper.vm as any).validateLongitude();
    expect((wrapper.vm as any).lonError).toBe('Por favor, insira a longitude.');
  });

  test('longitude validation: out-of-range sets error', () => {
    const wrapper = mount(ConverterView);
    (wrapper.vm as any).longitude = '200';
    (wrapper.vm as any).validateLongitude();
    expect((wrapper.vm as any).lonError).toContain('-180');
  });

  test('invalid form does not trigger fetch', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true, json: async () => ({ display_name: 'Test', address: {} }),
    } as any);

    const wrapper = mount(ConverterView);
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  test('shows loading text while fetching', async () => {
    let resolveFetch!: (v: any) => void;
    const fetchPromise = new Promise(res => { resolveFetch = res; });
    jest.spyOn(global, 'fetch' as any).mockReturnValue(fetchPromise);

    const wrapper = mount(ConverterView);
    (wrapper.vm as any).latitude = '-23.5505';
    (wrapper.vm as any).longitude = '-46.6333';

    // Kick off fetch (don't await)
    (wrapper.vm as any).fetchAddress();
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).loading).toBe(true);
    resolveFetch({ ok: true, json: async () => ({ display_name: 'Test', address: {} }) });
  });

  test('successful fetch sets resultHtml and municipioValue', async () => {
    jest.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        display_name: 'Rua A, São Paulo, SP',
        address: { city: 'São Paulo' },
      }),
    } as any);

    const wrapper = mount(ConverterView);
    (wrapper.vm as any).latitude = '-23.5505';
    (wrapper.vm as any).longitude = '-46.6333';
    await (wrapper.vm as any).fetchAddress();
    await flushPromises();

    expect((wrapper.vm as any).municipioValue).toBe('São Paulo');
    expect((wrapper.vm as any).resultHtml).toContain('Rua A, São Paulo, SP');
  });

  test('HTTP error sets resultIsError flag', async () => {
    jest.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: false,
      status: 500,
    } as any);

    const wrapper = mount(ConverterView);
    (wrapper.vm as any).latitude = '-23.5505';
    (wrapper.vm as any).longitude = '-46.6333';
    await (wrapper.vm as any).fetchAddress();
    await flushPromises();

    expect((wrapper.vm as any).resultIsError).toBe(true);
  });

  test('default cache size is 0', () => {
    const wrapper = mount(ConverterView);
    expect((wrapper.vm as any).cacheSize).toBe(0);
  });

  test('highlight cards show — by default', () => {
    const wrapper = mount(ConverterView);
    expect((wrapper.vm as any).municipioValue).toBe('—');
    expect((wrapper.vm as any).locationTypeValue).toBe('—');
  });
});
