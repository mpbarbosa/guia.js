import { computed, onMounted, onUnmounted, ref } from 'vue';
import MapLibreDisplayer from '../html/MapLibreDisplayer.js';
import PositionManager from '../core/PositionManager.js';
import AddressCache from '../data/AddressCache.js';
import { createReverseGeocoderService } from '../services/ReverseGeocoder.js';
import locationSnapshotRepository, {
  type LocationSnapshotRepository,
} from '../services/LocationSnapshotRepository.js';
import NominatimAddressExtractor from '../data/AddressExtractor.js';
import type { CachedAddressSummary } from '../services/OfflineCacheService.js';

const MAP_CONTAINER_ID = 'maplibre-map';
const DEFAULT_STREET = 'Aguardando...';
const DEFAULT_LOCALITY = '—';
const LIVE_LOCATION_TITLE = 'Localização Atual';
const MANUAL_LOCATION_TITLE = 'Localização Selecionada';
const MANUAL_GEOCODING_ERROR = 'Não foi possível buscar o endereço desta localização.';

type ReverseGeocoderFactory = typeof createReverseGeocoderService;

interface UseMapDisplayerOptions {
  createReverseGeocoder?: ReverseGeocoderFactory;
  locationSnapshotRepository?: Pick<LocationSnapshotRepository, 'getLatestLocationSnapshot'>;
}

interface LiveAddressSnapshot {
  logradouro: string | null;
  bairro: string | null;
  distrito?: string | null;
  municipio: string | null;
}

interface PositionManagerSnapshot {
  latitude?: number | null;
  longitude?: number | null;
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
  const snapshotRepository = options.locationSnapshotRepository ?? locationSnapshotRepository;

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

  const applyLiveAddress = (
    address: Pick<LiveAddressSnapshot, 'logradouro' | 'bairro' | 'distrito' | 'municipio'> | null,
  ) => {
    liveAddress.street = address?.logradouro ?? DEFAULT_STREET;
    liveAddress.neighborhood = address?.bairro ?? address?.distrito ?? DEFAULT_LOCALITY;
    liveAddress.city = address?.municipio ?? DEFAULT_LOCALITY;

    if (activePositionSource.value === 'live') {
      syncDisplayedAddress();
    }
  };

  const applySnapshotAddress = (address: CachedAddressSummary | null) => {
    liveAddress.street = address?.logradouro?.trim() || DEFAULT_STREET;
    liveAddress.neighborhood = address?.bairro?.trim() || DEFAULT_LOCALITY;
    liveAddress.city = address?.municipio?.trim() || DEFAULT_LOCALITY;

    if (activePositionSource.value === 'live') {
      syncDisplayedAddress();
    }
  };

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
    update(positionManager: PositionManagerSnapshot) {
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
      currentAddress: LiveAddressSnapshot | null;
    }) {
      applyLiveAddress(cache.currentAddress);
    },
  };

  onMounted(async () => {
    const currentDisplayer = new MapLibreDisplayer(MAP_CONTAINER_ID, '');
    displayer = currentDisplayer;
    currentDisplayer.onMapClick(handleManualMapSelection);

    const positionManager = PositionManager.getInstance() as ReturnType<typeof PositionManager.getInstance> & PositionManagerSnapshot;
    const addressCache = AddressCache.getInstance() as ReturnType<typeof AddressCache.getInstance> & {
      currentAddress?: LiveAddressSnapshot | null;
    };

    positionManager.subscribe(positionObserver as Parameters<ReturnType<typeof PositionManager.getInstance>['subscribe']>[0]);
    addressCache.subscribe(addressObserver as Parameters<ReturnType<typeof AddressCache.getInstance>['subscribe']>[0]);

    applyLiveAddress(addressCache.currentAddress ?? null);

    const liveLat = positionManager.latitude;
    const liveLon = positionManager.longitude;

    if (liveLat != null && liveLon != null) {
      latestLivePosition = { latitude: liveLat, longitude: liveLon };
      currentDisplayer.updatePosition(liveLat, liveLon);
      currentDisplayer.mount();
      return;
    }

    try {
      const snapshot = await snapshotRepository.getLatestLocationSnapshot();
      if (
        displayer === currentDisplayer &&
        !latestLivePosition &&
        activePositionSource.value === 'live' &&
        snapshot
      ) {
        currentDisplayer.updatePosition(snapshot.latitude, snapshot.longitude);
        applySnapshotAddress(snapshot.address);
      }
    } catch (error) {
      console.error('(useMapDisplayer) Error loading initial location snapshot:', error);
    }

    if (displayer !== currentDisplayer) {
      return;
    }

    currentDisplayer.mount();
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
