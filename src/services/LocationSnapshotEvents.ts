import type { CachedLocationSnapshot } from './OfflineCacheService.js';

export type LocationSnapshotListener = (snapshot: CachedLocationSnapshot) => void;

const LOCATION_SNAPSHOT_CHANNEL = 'guia-location-snapshot-updates';

const listeners = new Set<LocationSnapshotListener>();

let broadcastChannel: BroadcastChannel | undefined;

function notifyListeners(snapshot: CachedLocationSnapshot): void {
  listeners.forEach((listener) => listener(snapshot));
}

function handleBroadcastMessage(event: MessageEvent<CachedLocationSnapshot>): void {
  if (!event.data) {
    return;
  }

  notifyListeners(event.data);
}

function getBroadcastChannel(): BroadcastChannel | null {
  if (broadcastChannel) {
    return broadcastChannel;
  }

  if (typeof BroadcastChannel === 'undefined') {
    return null;
  }

  broadcastChannel = new BroadcastChannel(LOCATION_SNAPSHOT_CHANNEL);
  broadcastChannel.addEventListener('message', handleBroadcastMessage);
  return broadcastChannel;
}

function closeBroadcastChannelWhenIdle(): void {
  if (listeners.size > 0 || !broadcastChannel) {
    return;
  }

  broadcastChannel.removeEventListener('message', handleBroadcastMessage);
  broadcastChannel.close();
  broadcastChannel = undefined;
}

export function publishLocationSnapshotUpdate(snapshot: CachedLocationSnapshot): void {
  notifyListeners(snapshot);
  getBroadcastChannel()?.postMessage(snapshot);
  closeBroadcastChannelWhenIdle();
}

export function subscribeToLocationSnapshotUpdates(listener: LocationSnapshotListener): () => void {
  listeners.add(listener);
  getBroadcastChannel();

  return () => {
    listeners.delete(listener);
    closeBroadcastChannelWhenIdle();
  };
}
