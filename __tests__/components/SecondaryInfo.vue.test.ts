/**
 * @jest-environment jsdom
 */
import { mount, VueWrapper } from '@vue/test-utils';
import SecondaryInfo from '../../src/components/SecondaryInfo.vue';

// Mocks for composables
jest.mock('../../src/composables/usePositionDisplayer.js', () => ({
  usePositionDisplayer: () => ({
    coordinates: '12.3456, -65.4321',
  }),
}));
jest.mock('../../src/composables/useAddressDisplayer.js', () => ({
  useAddressDisplayer: () => ({
    enderecoPadronizado: 'Rua Exemplo, 123 - Centro, Cidade/UF',
  }),
}));
jest.mock('../../src/composables/useReferencePlaceDisplayer.js', () => ({
  useReferencePlaceDisplayer: () => ({
    referencePlaceName: 'Praça Central',
  }),
}));
jest.mock('../../src/composables/useSidraDisplayer.js', () => ({
  useSidraDisplayer: () => ({
    sidraLabel: 'População: 10.000',
  }),
}));

describe('SecondaryInfo.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    wrapper = mount(SecondaryInfo);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders all main info fields with provided values', () => {
    expect(wrapper.get('#endereco-padronizado-display').text()).toBe('Rua Exemplo, 123 - Centro, Cidade/UF');
    expect(wrapper.get('#lat-long-display').text()).toBe('12.3456, -65.4321');
    expect(wrapper.get('#reference-place-display').text()).toBe('Praça Central');
    expect(wrapper.get('#dadosSidra').text()).toBe('População: 10.000');
  });

  it('renders the correct aria-label and section structure', () => {
    const section = wrapper.get('section[aria-label="Informações de localização"]');
    expect(section.exists()).toBe(true);
    expect(section.classes()).toContain('bg-white');
    expect(section.classes()).toContain('rounded-2xl');
  });

  it('renders the reference place placeholder when referencePlaceName is empty', async () => {
    // Remock composable to return empty string
    jest.doMock('../../src/composables/useReferencePlaceDisplayer.js', () => ({
      useReferencePlaceDisplayer: () => ({
        referencePlaceName: '',
      }),
    }));
    // Need to re-require the component to pick up the new mock
    const { default: SecondaryInfoNoRef } = await import('../../src/components/SecondaryInfo.vue');
    const wrapperNoRef = mount(SecondaryInfoNoRef);
    const refPlace = wrapperNoRef.get('#reference-place-display');
    expect(refPlace.classes()).toContain('sr-only');
    expect(refPlace.text()).toBe('');
    wrapperNoRef.unmount();
    jest.resetModules();
  });

  it('updates displayed values when composable values change', async () => {
    // Remock composables with new values
    jest.doMock('../../src/composables/usePositionDisplayer.js', () => ({
      usePositionDisplayer: () => ({
        coordinates: '99.9999, -99.9999',
      }),
    }));
    jest.doMock('../../src/composables/useAddressDisplayer.js', () => ({
      useAddressDisplayer: () => ({
        enderecoPadronizado: 'Avenida Nova, 456 - Bairro, Cidade/UF',
      }),
    }));
    jest.doMock('../../src/composables/useReferencePlaceDisplayer.js', () => ({
      useReferencePlaceDisplayer: () => ({
        referencePlaceName: 'Museu Histórico',
      }),
    }));
    jest.doMock('../../src/composables/useSidraDisplayer.js', () => ({
      useSidraDisplayer: () => ({
        sidraLabel: 'População: 20.000',
      }),
    }));
    const { default: SecondaryInfoUpdated } = await import('../../src/components/SecondaryInfo.vue');
    const wrapperUpdated = mount(SecondaryInfoUpdated);
    expect(wrapperUpdated.get('#endereco-padronizado-display').text()).toBe('Avenida Nova, 456 - Bairro, Cidade/UF');
    expect(wrapperUpdated.get('#lat-long-display').text()).toBe('99.9999, -99.9999');
    expect(wrapperUpdated.get('#reference-place-display').text()).toBe('Museu Histórico');
    expect(wrapperUpdated.get('#dadosSidra').text()).toBe('População: 20.000');
    wrapperUpdated.unmount();
    jest.resetModules();
  });

  it('renders empty strings gracefully if all composables return empty', async () => {
    jest.doMock('../../src/composables/usePositionDisplayer.js', () => ({
      usePositionDisplayer: () => ({
        coordinates: '',
      }),
    }));
    jest.doMock('../../src/composables/useAddressDisplayer.js', () => ({
      useAddressDisplayer: () => ({
        enderecoPadronizado: '',
      }),
    }));
    jest.doMock('../../src/composables/useReferencePlaceDisplayer.js', () => ({
      useReferencePlaceDisplayer: () => ({
        referencePlaceName: '',
      }),
    }));
    jest.doMock('../../src/composables/useSidraDisplayer.js', () => ({
      useSidraDisplayer: () => ({
        sidraLabel: '',
      }),
    }));
    const { default: SecondaryInfoEmpty } = await import('../../src/components/SecondaryInfo.vue');
    const wrapperEmpty = mount(SecondaryInfoEmpty);
    expect(wrapperEmpty.get('#endereco-padronizado-display').text()).toBe('');
    expect(wrapperEmpty.get('#lat-long-display').text()).toBe('');
    expect(wrapperEmpty.get('#reference-place-display').text()).toBe('');
    expect(wrapperEmpty.get('#dadosSidra').text()).toBe('');
    wrapperEmpty.unmount();
    jest.resetModules();
  });
});
