import { ref, onMounted, onUnmounted } from 'vue';
import AddressCache from '../data/AddressCache.js';

export interface NavigationHistoryItem {
  title: string;
  desc: string;
  time: string;
  icon: string;
  timestamp: number;
}

function formatTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}min atrás`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h atrás`;
  return 'Ontem';
}

const MAX_HISTORY = 20;

export function useNavigationHistory() {
  const history = ref<NavigationHistoryItem[]>([]);

  const addressObserver = {
    update(cache: { currentAddress: { logradouro: string | null; bairro: string | null; municipio: string | null } | null }) {
      const addr = cache.currentAddress;
      if (!addr?.municipio) return;

      const title = addr.logradouro ?? addr.municipio;
      const desc = [addr.bairro, addr.municipio].filter(Boolean).join(', ');

      const last = history.value[0];
      if (last && last.title === title) return;

      const entry: NavigationHistoryItem = {
        title,
        desc,
        time: 'Agora',
        icon: addr.logradouro ? 'bi-map-fill' : 'bi-geo-alt-fill',
        timestamp: Date.now(),
      };

      history.value = [entry, ...history.value].slice(0, MAX_HISTORY);
    },
  };

  onMounted(() => {
    const cache = AddressCache.getInstance();
    cache.subscribe(addressObserver as Parameters<ReturnType<typeof AddressCache.getInstance>['subscribe']>[0]);

    const addr = cache.currentAddress;
    if (addr?.municipio) {
      addressObserver.update({ currentAddress: addr });
    }
  });

  onUnmounted(() => {
    AddressCache.getInstance().unsubscribe(
      addressObserver as Parameters<ReturnType<typeof AddressCache.getInstance>['unsubscribe']>[0]
    );
  });

  return { history, formatTime };
}
