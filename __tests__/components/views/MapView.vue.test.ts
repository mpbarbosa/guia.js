/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';

// Mock maplibre-gl before any module imports — required for ESM mocking
const mockMap = {
  setCenter: jest.fn(),
  resize: jest.fn(),
  addControl: jest.fn(),
  on: jest.fn((event: string, cb: () => void) => { if (event === 'load') cb(); }),
};

// Use unstable_mockModule for ESM packages (jest.mock does not intercept ESM imports)
let mount: typeof import('@vue/test-utils')['mount'];
let MapView: typeof import('../../../src/components/views/MapView.vue')['default'];

beforeAll(async () => {
  await jest.unstable_mockModule('maplibre-gl', () => ({
    __esModule: true,
    default: {
      Map: jest.fn(() => mockMap),
      Marker: jest.fn(() => ({ setLngLat: jest.fn().mockReturnThis(), addTo: jest.fn() })),
      NavigationControl: jest.fn(),
    },
  }));

  const testUtils = await import('@vue/test-utils');
  mount = testUtils.mount;

  const mod = await import('../../../src/components/views/MapView.vue');
  MapView = mod.default;
});

describe('MapView.vue', () => {
  test('renders the recenter control and address overlay', () => {
    const wrapper = mount(MapView, { attachTo: document.body });

    expect(wrapper.get('button[aria-label="Centrar no mapa"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Localização Atual');

    wrapper.unmount();
  });

  test('renders all category chips', () => {
    const wrapper = mount(MapView, { attachTo: document.body });
    const chipLabels = wrapper.findAll('button').slice(1).map((chip) => chip.text());

    expect(chipLabels).toEqual(['Restaurantes', 'Postos', 'Hospitais', 'Estacionamento']);

    wrapper.unmount();
  });
});
