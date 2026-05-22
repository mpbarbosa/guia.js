import { ref, onMounted, onUnmounted } from 'vue';
import MapLibreDisplayer from '../html/MapLibreDisplayer.js';
import PositionManager from '../core/PositionManager.js';
import AddressCache from '../data/AddressCache.js';

const MAP_CONTAINER_ID = 'maplibre-map';

/**
 * Wraps MapLibreDisplayer for use in a Vue component.
 * Initialises the map on mount, subscribes to GPS position and address updates,
 * and cleans up subscriptions on unmount.
 */
export function useMapDisplayer() {
  const street = ref<string>('Aguardando...');
  const neighborhood = ref<string>('—');
  const city = ref<string>('—');

  let displayer: MapLibreDisplayer | null = null;

  const positionObserver = {
    update(positionManager: { latitude: number | null; longitude: number | null }) {
      const { latitude: lat, longitude: lon } = positionManager;
      if (lat != null && lon != null) {
        displayer?.updatePosition(lat, lon);
      }
    },
  };

  const addressObserver = {
    update(cache: { currentAddress: { logradouro: string | null; bairro: string | null; municipio: string | null } | null }) {
      const addr = cache.currentAddress;
      if (!addr) return;
      street.value = addr.logradouro ?? 'Aguardando...';
      neighborhood.value = addr.bairro ?? '—';
      city.value = addr.municipio ?? '—';
    },
  };

  onMounted(() => {
    displayer = new MapLibreDisplayer(MAP_CONTAINER_ID, '');
    displayer.mount();

    PositionManager.getInstance().subscribe(positionObserver as Parameters<ReturnType<typeof PositionManager.getInstance>['subscribe']>[0]);
    AddressCache.getInstance().subscribe(addressObserver as Parameters<ReturnType<typeof AddressCache.getInstance>['subscribe']>[0]);
  });

  onUnmounted(() => {
    PositionManager.getInstance().unsubscribe(positionObserver as Parameters<ReturnType<typeof PositionManager.getInstance>['unsubscribe']>[0]);
    AddressCache.getInstance().unsubscribe(addressObserver as Parameters<ReturnType<typeof AddressCache.getInstance>['unsubscribe']>[0]);
    displayer = null;
  });

  return { street, neighborhood, city };
}
