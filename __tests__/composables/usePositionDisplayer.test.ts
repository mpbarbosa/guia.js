import { nextTick } from 'vue';
import { usePositionDisplayer } from '../../src/composables/usePositionDisplayer';
import PositionManager from '../../src/core/PositionManager.js';

jest.mock('../../src/core/PositionManager.js', () => {
  let observer: any = null;
  return {
    __esModule: true,
    default: {
      getInstance: () => ({
        subscribe: (obs: any) => { observer = obs; },
        unsubscribe: (obs: any) => { if (observer === obs) observer = null; },
        __triggerUpdate: (pm: { latitude: number | null; longitude: number | null }) => {
          if (observer && observer.update) observer.update(pm);
        },
      }),
    },
  };
});

type Position = { latitude: number | null; longitude: number | null };

describe('usePositionDisplayer', () => {
  let positionManagerInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    positionManagerInstance = PositionManager.getInstance();
  });

  it('initializes coordinates with default message', () => {
    const { coordinates } = usePositionDisplayer();
    expect(coordinates.value).toBe('Aguardando localização...');
  });

  it('updates coordinates with formatted latitude and longitude', async () => {
    const { coordinates } = usePositionDisplayer();
    const pos: Position = { latitude: -23.55052, longitude: -46.633308 };
    positionManagerInstance.__triggerUpdate(pos);
    await nextTick();
    expect(coordinates.value).toBe('-23.550520, -46.633308');
  });

  it('does not update coordinates if latitude is null', async () => {
    const { coordinates } = usePositionDisplayer();
    coordinates.value = 'Initial';
    positionManagerInstance.__triggerUpdate({ latitude: null, longitude: -46.6 });
    await nextTick();
    expect(coordinates.value).toBe('Initial');
  });

  it('does not update coordinates if longitude is null', async () => {
    const { coordinates } = usePositionDisplayer();
    coordinates.value = 'Initial';
    positionManagerInstance.__triggerUpdate({ latitude: -23.5, longitude: null });
    await nextTick();
    expect(coordinates.value).toBe('Initial');
  });

  it('does not update coordinates if both latitude and longitude are null', async () => {
    const { coordinates } = usePositionDisplayer();
    coordinates.value = 'Initial';
    positionManagerInstance.__triggerUpdate({ latitude: null, longitude: null });
    await nextTick();
    expect(coordinates.value).toBe('Initial');
  });

  it('subscribes and unsubscribes observer on mount/unmount', () => {
    const subscribeSpy = jest.spyOn(positionManagerInstance, 'subscribe');
    const unsubscribeSpy = jest.spyOn(positionManagerInstance, 'unsubscribe');
    usePositionDisplayer();
    expect(subscribeSpy).toHaveBeenCalledTimes(1);
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });
});
