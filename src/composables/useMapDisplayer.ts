import { computed, onMounted, onUnmounted, ref } from 'vue';
import MapLibreDisplayer from '../html/MapLibreDisplayer.js';
import PositionManager from '../core/PositionManager.js';
import AddressCache from '../data/AddressCache.js';
import { createReverseGeocoderService } from '../services/ReverseGeocoder.js';
import NominatimAddressExtractor from '../data/AddressExtractor.js';

const MAP_CONTAINER_ID = 'maplibre-map';
const DEFAULT_STREET = 'Aguardando...';
const DEFAULT_LOCALITY = '—';
const LIVE_LOCATION_TITLE = 'Localização Atual';
const MANUAL_LOCATION_TITLE = 'Localização Selecionada';
const MANUAL_GEOCODING_ERROR = 'Não foi possível buscar o endereço desta localização.';

type ReverseGeocoderFactory = typeof createReverseGeocoderService;

interface UseMapDisplayerOptions {
  createReverseGeocoder?: ReverseGeocoderFactory;
}

/**
 * Wraps MapLibreDisplayer for use in a Vue component.
 * Initialises the map on mount, subscribes to GPS position and address updates,
 * and cleans up subscriptions on unmount.
 */
export function useMapDisplayer(options: UseMapDisplayerOptions = {}) {
  const street = ref<string>(DEFAULT_STREET);
  const neighborhood = ref<string>(DEFAULT_LOCALITY);
  const city = ref<string>(DEFAULT_LOCALITY);
  const locationTitle = ref<string>(LIVE_LOCATION_TITLE);
  const activePositionSource = ref<'live' | 'manual'>('live');
  const manualLocationError = ref<string | null>(null);

  let displayer: MapLibreDisplayer | null = null;
  let latestLivePosition: { latitude: number; longitude: number } | null = null;
  let activeManualRequestId = 0;
  const createReverseGeocoder = options.createReverseGeocoder ?? createReverseGeocoderService;

  const liveAddress = {
    street: DEFAULT_STREET,
    neighborhood: DEFAULT_LOCALITY,
    city: DEFAULT_LOCALITY,
  };
  const manualAddress = {
    street: DEFAULT_STREET,
    neighborhood: DEFAULT_LOCALITY,
    city: DEFAULT_LOCALITY,
  };

  const syncDisplayedAddress = () => {
    const sourceAddress = activePositionSource.value === 'manual' ? manualAddress : liveAddress;
    street.value = sourceAddress.street;
    neighborhood.value = sourceAddress.neighborhood;
    city.value = sourceAddress.city;
    locationTitle.value =
      activePositionSource.value === 'manual' ? MANUAL_LOCATION_TITLE : LIVE_LOCATION_TITLE;
  };

  const formatCoordinateLabel = (lat: number, lon: number) =>
    `Lat ${lat.toFixed(5)}, Lon ${lon.toFixed(5)}`;

  const returnToLivePosition = () => {
    activePositionSource.value = 'live';
    manualLocationError.value = null;
    syncDisplayedAddress();

    if (latestLivePosition) {
      displayer?.updatePosition(latestLivePosition.latitude, latestLivePosition.longitude);
    }
  };

  const handleManualMapSelection = async (lat: number, lon: number) => {
    activeManualRequestId += 1;
    const requestId = activeManualRequestId;

    manualAddress.street = formatCoordinateLabel(lat, lon);
    manualAddress.neighborhood = DEFAULT_LOCALITY;
    manualAddress.city = DEFAULT_LOCALITY;
    manualLocationError.value = null;
    activePositionSource.value = 'manual';
    syncDisplayedAddress();
    displayer?.updatePosition(lat, lon);

    const reverseGeocoder = createReverseGeocoder();
    reverseGeocoder.setCoordinates(lat, lon);

    try {
      const geoAddress = await reverseGeocoder.fetchAddress();

      if (requestId !== activeManualRequestId) {
        return;
      }

      const standardizedAddress = new NominatimAddressExtractor({
        ...geoAddress,
      }).enderecoPadronizado;

      manualAddress.street = standardizedAddress.logradouro ?? formatCoordinateLabel(lat, lon);
      manualAddress.neighborhood =
        standardizedAddress.bairroCompleto() || DEFAULT_LOCALITY;
      manualAddress.city = standardizedAddress.municipio ?? DEFAULT_LOCALITY;
      syncDisplayedAddress();
    } catch (error) {
      if (requestId !== activeManualRequestId) {
        return;
      }

      console.error('(useMapDisplayer) Error reverse geocoding manual map selection:', error);
      manualLocationError.value = MANUAL_GEOCODING_ERROR;
      syncDisplayedAddress();
    }
  };

  const positionObserver = {
    update(positionManager: { latitude: number | null; longitude: number | null }) {
      const { latitude: lat, longitude: lon } = positionManager;
      if (lat != null && lon != null) {
        latestLivePosition = { latitude: lat, longitude: lon };

        if (activePositionSource.value === 'live') {
          displayer?.updatePosition(lat, lon);
        }
      }
    },
  };

  const addressObserver = {
    update(cache: {
      currentAddress: {
        logradouro: string | null;
        bairro: string | null;
        distrito?: string | null;
        municipio: string | null;
      } | null;
    }) {
      const addr = cache.currentAddress;
      if (!addr) return;

      liveAddress.street = addr.logradouro ?? DEFAULT_STREET;
      liveAddress.neighborhood = addr.bairro ?? addr.distrito ?? DEFAULT_LOCALITY;
      liveAddress.city = addr.municipio ?? DEFAULT_LOCALITY;

      if (activePositionSource.value === 'live') {
        syncDisplayedAddress();
      }
    },
  };

  onMounted(() => {
    displayer = new MapLibreDisplayer(MAP_CONTAINER_ID, '');
    displayer.mount();
    displayer.onMapClick(handleManualMapSelection);

    PositionManager.getInstance().subscribe(positionObserver as Parameters<ReturnType<typeof PositionManager.getInstance>['subscribe']>[0]);
    AddressCache.getInstance().subscribe(addressObserver as Parameters<ReturnType<typeof AddressCache.getInstance>['subscribe']>[0]);
  });

  onUnmounted(() => {
    PositionManager.getInstance().unsubscribe(positionObserver as Parameters<ReturnType<typeof PositionManager.getInstance>['unsubscribe']>[0]);
    AddressCache.getInstance().unsubscribe(addressObserver as Parameters<ReturnType<typeof AddressCache.getInstance>['unsubscribe']>[0]);
    displayer?.offMapClick(handleManualMapSelection);
    activeManualRequestId += 1;
    displayer = null;
  });

  return {
    street,
    neighborhood,
    city,
    locationTitle,
    manualLocationError,
    returnToLivePosition,
    activePositionSource,
    isManualMode: computed(() => activePositionSource.value === 'manual'),
  };
}
