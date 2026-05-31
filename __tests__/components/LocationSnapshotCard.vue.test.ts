/**
 * @jest-environment jsdom
 */
import { mount } from '@vue/test-utils';
import LocationSnapshotCard from '../../src/components/LocationSnapshotCard.vue';

const mockSnapshotState = {
  enderecoPadronizado: 'Rua Exemplo, Centro, Cidade, UF (último registro salvo)',
  coordinates: '-23.550520, -46.633308 (último registro salvo)',
  sidraLabel: 'Cidade — UF',
};

jest.mock('../../src/composables/useLocationSnapshot.js', () => ({
  useLocationSnapshot: () => mockSnapshotState,
}));

describe('LocationSnapshotCard.vue', () => {
  afterEach(() => {
    mockSnapshotState.enderecoPadronizado = 'Rua Exemplo, Centro, Cidade, UF (último registro salvo)';
    mockSnapshotState.coordinates = '-23.550520, -46.633308 (último registro salvo)';
    mockSnapshotState.sidraLabel = 'Cidade — UF';
  });

  it('renders persisted snapshot values with the existing DOM ids', () => {
    const wrapper = mount(LocationSnapshotCard);

    expect(wrapper.get('#endereco-padronizado-display').text()).toBe(
      'Rua Exemplo, Centro, Cidade, UF (último registro salvo)'
    );
    expect(wrapper.get('#lat-long-display').text()).toBe('-23.550520, -46.633308 (último registro salvo)');
    expect(wrapper.get('#dadosSidra').text()).toBe('Cidade — UF');

    wrapper.unmount();
  });

  it('keeps the reference place placeholder hidden in the DOM', () => {
    const wrapper = mount(LocationSnapshotCard);
    const referencePlace = wrapper.get('#reference-place-display');

    expect(referencePlace.classes()).toContain('sr-only');
    expect(referencePlace.text()).toBe('');

    wrapper.unmount();
  });

  it('renders field-level placeholders when no snapshot is available', () => {
    mockSnapshotState.enderecoPadronizado = 'Aguardando localização...';
    mockSnapshotState.coordinates = 'Aguardando localização...';
    mockSnapshotState.sidraLabel = 'Aguardando localização...';

    const wrapper = mount(LocationSnapshotCard);

    expect(wrapper.get('#endereco-padronizado-display').text()).toBe('Aguardando localização...');
    expect(wrapper.get('#lat-long-display').text()).toBe('Aguardando localização...');
    expect(wrapper.get('#dadosSidra').text()).toBe('Aguardando localização...');

    wrapper.unmount();
  });
});
