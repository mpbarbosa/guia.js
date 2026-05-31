import {
  publishLocationSnapshotUpdate,
  subscribeToLocationSnapshotUpdates,
} from '../../src/services/LocationSnapshotEvents';
import type { CachedLocationSnapshot } from '../../src/services/OfflineCacheService.js';

describe('LocationSnapshotEvents', () => {
  const LOCATION_SNAPSHOT_CHANNEL = 'guia-location-snapshot-updates';

  let originalBroadcastChannel: typeof global.BroadcastChannel | undefined;

  beforeAll(() => {
    originalBroadcastChannel = global.BroadcastChannel;
  });

  afterEach(() => {
    // Restore BroadcastChannel after each test
    global.BroadcastChannel = originalBroadcastChannel as typeof global.BroadcastChannel;
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('notifies all listeners on publish', () => {
    // @ts-expect-error: test helper, not in real interface
    global.BroadcastChannel = undefined;

    const snapshot: CachedLocationSnapshot = {
      latitude: 1,
      longitude: 2,
      address: { displayText: 'Rua Teste', municipio: 'Cidade', siglaUF: 'UF' },
    } as CachedLocationSnapshot;

    const listener1 = jest.fn();
    const listener2 = jest.fn();

    const unsubscribe1 = subscribeToLocationSnapshotUpdates(listener1);
    const unsubscribe2 = subscribeToLocationSnapshotUpdates(listener2);

    publishLocationSnapshotUpdate(snapshot);

    expect(listener1).toHaveBeenCalledWith(snapshot);
    expect(listener2).toHaveBeenCalledWith(snapshot);

    unsubscribe1();
    unsubscribe2();
  });

  it('removes listener on unsubscribe', () => {
    // @ts-expect-error: test helper, not in real interface
    global.BroadcastChannel = undefined;

    const snapshot: CachedLocationSnapshot = {
      latitude: 3,
      longitude: 4,
      address: { displayText: 'Rua X', municipio: 'Y', siglaUF: 'Z' },
    } as CachedLocationSnapshot;

    const listener = jest.fn();
    const unsubscribe = subscribeToLocationSnapshotUpdates(listener);

    unsubscribe();

    publishLocationSnapshotUpdate(snapshot);

    expect(listener).not.toHaveBeenCalled();
  });

  it('uses BroadcastChannel if available and posts message', () => {
    const postMessage = jest.fn();
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    const close = jest.fn();

    class MockBroadcastChannel {
      name: string;
      constructor(name: string) {
        this.name = name;
      }
      postMessage = postMessage;
      addEventListener = addEventListener;
      removeEventListener = removeEventListener;
      close = close;
    }

    // @ts-expect-error: test helper, not in real interface
    global.BroadcastChannel = MockBroadcastChannel as any;

    const snapshot: CachedLocationSnapshot = {
      latitude: 5,
      longitude: 6,
      address: { displayText: 'Rua BC', municipio: 'Cidade', siglaUF: 'UF' },
    } as CachedLocationSnapshot;

    const listener = jest.fn();
    const unsubscribe = subscribeToLocationSnapshotUpdates(listener);

    publishLocationSnapshotUpdate(snapshot);

    expect(postMessage).toHaveBeenCalledWith(snapshot);

    unsubscribe();
  });

  it('handles BroadcastChannel message event and notifies listeners', () => {
    let messageHandler: ((event: MessageEvent) => void) | undefined;
    const addEventListener = jest.fn((event: string, handler: (event: MessageEvent) => void) => {
      if (event === 'message') {
        messageHandler = handler;
      }
    });
    const removeEventListener = jest.fn();
    const close = jest.fn();

    class MockBroadcastChannel {
      name: string;
      constructor(name: string) {
        this.name = name;
      }
      postMessage = jest.fn();
      addEventListener = addEventListener;
      removeEventListener = removeEventListener;
      close = close;
    }

    // @ts-expect-error: test helper, not in real interface
    global.BroadcastChannel = MockBroadcastChannel as any;

    const snapshot: CachedLocationSnapshot = {
      latitude: 7,
      longitude: 8,
      address: { displayText: 'Rua Event', municipio: 'Cidade', siglaUF: 'UF' },
    } as CachedLocationSnapshot;

    const listener = jest.fn();
    const unsubscribe = subscribeToLocationSnapshotUpdates(listener);

    // Simulate receiving a message event
    if (messageHandler) {
      messageHandler({ data: snapshot } as MessageEvent);
    }

    expect(listener).toHaveBeenCalledWith(snapshot);

    unsubscribe();
  });

  it('does not notify listeners if message event has no data', () => {
    let messageHandler: ((event: MessageEvent) => void) | undefined;
    const addEventListener = jest.fn((event: string, handler: (event: MessageEvent) => void) => {
      if (event === 'message') {
        messageHandler = handler;
      }
    });
    const removeEventListener = jest.fn();
    const close = jest.fn();

    class MockBroadcastChannel {
      name: string;
      constructor(name: string) {
        this.name = name;
      }
      postMessage = jest.fn();
      addEventListener = addEventListener;
      removeEventListener = removeEventListener;
      close = close;
    }

    // @ts-expect-error: test helper, not in real interface
    global.BroadcastChannel = MockBroadcastChannel as any;

    const listener = jest.fn();
    const unsubscribe = subscribeToLocationSnapshotUpdates(listener);

    if (messageHandler) {
      messageHandler({ data: undefined } as MessageEvent);
    }

    expect(listener).not.toHaveBeenCalled();

    unsubscribe();
  });

  it('closes BroadcastChannel when no listeners remain', () => {
    const postMessage = jest.fn();
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    const close = jest.fn();

    class MockBroadcastChannel {
      name: string;
      constructor(name: string) {
        this.name = name;
      }
      postMessage = postMessage;
      addEventListener = addEventListener;
      removeEventListener = removeEventListener;
      close = close;
    }

    // @ts-expect-error: test helper, not in real interface
    global.BroadcastChannel = MockBroadcastChannel as any;

    const snapshot: CachedLocationSnapshot = {
      latitude: 9,
      longitude: 10,
      address: { displayText: 'Rua Close', municipio: 'Cidade', siglaUF: 'UF' },
    } as CachedLocationSnapshot;

    const listener = jest.fn();
    const unsubscribe = subscribeToLocationSnapshotUpdates(listener);

    publishLocationSnapshotUpdate(snapshot);

    unsubscribe();

    // After unsubscribe, BroadcastChannel should be closed
    expect(removeEventListener).toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
  });

  it('returns null from getBroadcastChannel if BroadcastChannel is undefined', () => {
    // @ts-expect-error: test helper, not in real interface
    global.BroadcastChannel = undefined;

    const snapshot: CachedLocationSnapshot = {
      latitude: 11,
      longitude: 12,
      address: { displayText: 'Rua Null', municipio: 'Cidade', siglaUF: 'UF' },
    } as CachedLocationSnapshot;

    const listener = jest.fn();
    const unsubscribe = subscribeToLocationSnapshotUpdates(listener);

    publishLocationSnapshotUpdate(snapshot);

    expect(listener).toHaveBeenCalledWith(snapshot);

    unsubscribe();
  });
});
