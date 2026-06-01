import { ref, onUnmounted } from 'vue';
import PositionManager from '../core/PositionManager.js';

type PositionManagerInstance = ReturnType<typeof PositionManager.getInstance>;
type SubscribeParam = Parameters<PositionManagerInstance['subscribe']>[0];
type CurrentPosition = {
  latitude: number | null;
  longitude: number | null;
};

/**
 * Reactive GPS coordinates sourced from PositionManager.
 *
 * Replaces HTMLPositionDisplayer: subscribes to PositionManager on mount,
 * exposes a formatted coordinates string ref, and unsubscribes on unmount.
 */
export function usePositionDisplayer() {
  const coordinates = ref<string>('Aguardando localização...');
  const positionManager = PositionManager.getInstance();

  function syncFromPosition(position: CurrentPosition): void {
    const { latitude: lat, longitude: lon } = position;
    if (lat != null && lon != null) {
      coordinates.value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
  }

  const observer = {
    update(position: CurrentPosition) {
      syncFromPosition(position);
    },
  };

  positionManager.subscribe(observer as SubscribeParam);

  onUnmounted(() => {
    positionManager.unsubscribe(observer as SubscribeParam);
  });

  return { coordinates };
}
