import { jest } from '@jest/globals';
import { nextTick } from 'vue';
import PositionManager from '../../src/core/PositionManager';
import { usePositionDisplayer } from '../../src/composables/usePositionDisplayer';

let _observer: any = null;
const _mockInstance = {
  subscribe: (obs: any) => { _observer = obs; },
  unsubscribe: (obs: any) => { if (_observer === obs) _observer = null; },
};

type Position = { latitude: number | null; longitude: number | null };

describe('usePositionDisplayer', () => {
  beforeEach(() => {
    _observer = null;
    jest.clearAllMocks();
    jest.spyOn(PositionManager, 'getInstance').mockReturnValue(_mockInstance as ReturnType<typeof PositionManager.getInstance>);
  });

  it('initializes coordinates with default message', () => {
    const { coordinates } = usePositionDisplayer();
    expect(coordinates.value).toBe('Aguardando localização...');
  });

  it('updates coordinates with formatted latitude and longitude', async () => {
    const { coordinates } = usePositionDisplayer();
    const pos: Position = { latitude: -23.55052, longitude: -46.633308 };
    _observer?.update(pos);
    await nextTick();
    expect(coordinates.value).toBe('-23.550520, -46.633308');
  });

  it('does not update coordinates if latitude is null', async () => {
    const { coordinates } = usePositionDisplayer();
    coordinates.value = 'Initial';
    _observer?.update({ latitude: null, longitude: -46.6 });
    await nextTick();
    expect(coordinates.value).toBe('Initial');
  });

  it('does not update coordinates if longitude is null', async () => {
    const { coordinates } = usePositionDisplayer();
    coordinates.value = 'Initial';
    _observer?.update({ latitude: -23.5, longitude: null });
    await nextTick();
    expect(coordinates.value).toBe('Initial');
  });

  it('does not update coordinates if both latitude and longitude are null', async () => {
    const { coordinates } = usePositionDisplayer();
    coordinates.value = 'Initial';
    _observer?.update({ latitude: null, longitude: null });
    await nextTick();
    expect(coordinates.value).toBe('Initial');
  });

  it('subscribes observer on setup', () => {
    const subscribeSpy = jest.spyOn(_mockInstance, 'subscribe');
    usePositionDisplayer();
    expect(subscribeSpy).toHaveBeenCalledTimes(1);
  });
});
