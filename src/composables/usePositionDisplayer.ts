import { ref, onMounted, onUnmounted } from 'vue';
import PositionManager from '../core/PositionManager.js';

type PositionManagerInstance = ReturnType<typeof PositionManager.getInstance>;
type SubscribeParam = Parameters<PositionManagerInstance['subscribe']>[0];

/**
 * Reactive GPS coordinates sourced from PositionManager.
 *
 * Replaces HTMLPositionDisplayer: subscribes to PositionManager on mount,
 * exposes a formatted coordinates string ref, and unsubscribes on unmount.
 */
export function usePositionDisplayer() {
  const coordinates = ref<string>('Aguardando localização...');

  const observer = {
    update(pm: { latitude: number | null; longitude: number | null }) {
      const { latitude: lat, longitude: lon } = pm;
      if (lat != null && lon != null) {
        coordinates.value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
      }
    },
  };

  onMounted(() => {
    PositionManager.getInstance().subscribe(observer as SubscribeParam);
  });

  onUnmounted(() => {
    PositionManager.getInstance().unsubscribe(observer as SubscribeParam);
  });

  return { coordinates };
}
