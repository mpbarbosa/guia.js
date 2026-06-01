/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import LocationSnapshotCard from '../../src/components/LocationSnapshotCard.vue';
import locationSnapshotRepository from '../../src/services/LocationSnapshotRepository';

const persistedSnapshot = {
  latitude: -23.55052,
  longitude: -46.633308,
  timestamp: 1717196400000,
  address: {
    displayText: 'Rua Exemplo, Centro, Cidade, UF',
    municipio: 'Cidade',
    siglaUF: 'UF',
  },
};

async function flushComposableEffects(): Promise<void> {
  await Promise.resolve();
  await nextTick();
}

describe('LocationSnapshotCard.vue', () => {
  beforeEach(() => {
    jest.spyOn(locationSnapshotRepository, 'getLatestLocationSnapshot').mockResolvedValue(persistedSnapshot);
    jest.spyOn(locationSnapshotRepository, 'subscribe').mockReturnValue(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders persisted snapshot values with the existing DOM ids', async () => {
    const wrapper = mount(LocationSnapshotCard);
    await flushComposableEffects();

    expect(wrapper.get('#endereco-padronizado-display').text()).toBe(
      'Rua Exemplo, Centro, Cidade, UF (último registro salvo)'
    );
    expect(wrapper.get('#lat-long-display').text()).toBe('-23.550520, -46.633308 (último registro salvo)');
    expect(wrapper.get('#dadosSidra').text()).toBe('Cidade — UF');

    wrapper.unmount();
  });

  it('keeps the reference place placeholder hidden in the DOM', async () => {
    const wrapper = mount(LocationSnapshotCard);
    await flushComposableEffects();
    const referencePlace = wrapper.get('#reference-place-display');

    expect(referencePlace.classes()).toContain('sr-only');
    expect(referencePlace.text()).toBe('');

    wrapper.unmount();
  });

  it('renders field-level placeholders when no snapshot is available', async () => {
    jest.spyOn(locationSnapshotRepository, 'getLatestLocationSnapshot').mockResolvedValueOnce(null);
    const wrapper = mount(LocationSnapshotCard);
    await flushComposableEffects();

    expect(wrapper.get('#endereco-padronizado-display').text()).toBe('Aguardando localização...');
    expect(wrapper.get('#lat-long-display').text()).toBe('Aguardando localização...');
    expect(wrapper.get('#dadosSidra').text()).toBe('Aguardando localização...');

    wrapper.unmount();
  });
});
