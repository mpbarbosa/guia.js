/**
 * @jest-environment jsdom
 */
import type {
  IGeolocationServiceForSC,
  IReverseGeocoderForSC,
  IChangeDetectionCoordinatorForSC,
  IObserverSubjectForSC,
  IDisplayerFactory,
  IDisplayers,
  ServiceCoordinatorParams,
} from '../../src/types/coordinator-services';

describe('IGeolocationServiceForSC', () => {
  class MockGeolocationService implements IGeolocationServiceForSC {
    getSingleLocationUpdate = jest.fn(async () => ({ lat: 1, lng: 2 }));
    watchCurrentLocation = jest.fn(() => 123);
    stopWatching = jest.fn();
    stopTracking = jest.fn();
    setThrottleInterval = jest.fn();
  }

  it('should resolve getSingleLocationUpdate with a GeoPosition', async () => {
    const service = new MockGeolocationService();
    const pos = await service.getSingleLocationUpdate();
    expect(pos).toEqual({ lat: 1, lng: 2 });
    expect(service.getSingleLocationUpdate).toHaveBeenCalled();
  });

  it('should call watchCurrentLocation and return a watcher id', () => {
    const service = new MockGeolocationService();
    const id = service.watchCurrentLocation?.(jest.fn(), jest.fn());
    expect(id).toBe(123);
    expect(service.watchCurrentLocation).toHaveBeenCalled();
  });

  it('should call stopWatching and stopTracking', () => {
    const service = new MockGeolocationService();
    service.stopWatching?.();
    service.stopTracking?.();
    expect(service.stopWatching).toHaveBeenCalled();
    expect(service.stopTracking).toHaveBeenCalled();
  });

  it('should call setThrottleInterval with correct value', () => {
    const service = new MockGeolocationService();
    service.setThrottleInterval?.(500);
    expect(service.setThrottleInterval).toHaveBeenCalledWith(500);
  });
});

describe('IReverseGeocoderForSC', () => {
  class MockReverseGeocoder implements IReverseGeocoderForSC {
    latitude: number | null = 10;
    longitude: number | null = 20;
    currentAddress: unknown = { street: 'A' };
    enderecoPadronizado: unknown = { rua: 'B' };
    observerSubject = { observers: [] as unknown[] };
    subscribe = jest.fn();
    update = jest.fn();
  }

  it('should subscribe observers', () => {
    const geocoder = new MockReverseGeocoder();
    const observer = {};
    geocoder.subscribe(observer);
    expect(geocoder.subscribe).toHaveBeenCalledWith(observer);
  });

  it('should have latitude and longitude properties', () => {
    const geocoder = new MockReverseGeocoder();
    expect(geocoder.latitude).toBe(10);
    expect(geocoder.longitude).toBe(20);
  });

  it('should call update if defined', () => {
    const geocoder = new MockReverseGeocoder();
    geocoder.update?.('arg1', 'arg2');
    expect(geocoder.update).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should have observerSubject with observers array', () => {
    const geocoder = new MockReverseGeocoder();
    expect(Array.isArray(geocoder.observerSubject?.observers)).toBe(true);
  });
});

describe('IChangeDetectionCoordinatorForSC', () => {
  class MockChangeDetectionCoordinator implements IChangeDetectionCoordinatorForSC {
    setCurrentPosition = jest.fn();
    setupChangeDetection = jest.fn();
  }

  it('should call setCurrentPosition with a position', () => {
    const coordinator = new MockChangeDetectionCoordinator();
    const pos = { lat: 1, lng: 2 };
    coordinator.setCurrentPosition(pos);
    expect(coordinator.setCurrentPosition).toHaveBeenCalledWith(pos);
  });

  it('should call setupChangeDetection', () => {
    const coordinator = new MockChangeDetectionCoordinator();
    coordinator.setupChangeDetection();
    expect(coordinator.setupChangeDetection).toHaveBeenCalled();
  });
});

describe('IObserverSubjectForSC', () => {
  class MockObserverSubject implements IObserverSubjectForSC {
    subscribe = jest.fn();
  }

  it('should call subscribe with observer', () => {
    const subject = new MockObserverSubject();
    const observer = {};
    subject.subscribe(observer);
    expect(subject.subscribe).toHaveBeenCalledWith(observer);
  });
});

describe('IDisplayerFactory', () => {
  class MockDisplayerFactory implements IDisplayerFactory {
    createPositionDisplayer = jest.fn((el: unknown) => ({ el }));
    createAddressDisplayer = jest.fn((el1: unknown, el2: unknown) => ({ el1, el2 }));
    createReferencePlaceDisplayer = jest.fn((el: unknown) => ({ el }));
    createHighlightCardsDisplayer = jest.fn((doc: Document) => ({ doc }));
    createSidraDisplayer = jest.fn((el: unknown) => ({ el }));
  }

  it('should create all displayers with correct arguments', () => {
    const factory = new MockDisplayerFactory();
    const el = {};
    const el2 = {};
    const doc = document.implementation.createHTMLDocument('test');
    expect(factory.createPositionDisplayer(el)).toEqual({ el });
    expect(factory.createAddressDisplayer(el, el2)).toEqual({ el1: el, el2 });
    expect(factory.createReferencePlaceDisplayer(el)).toEqual({ el });
    expect(factory.createHighlightCardsDisplayer(doc)).toEqual({ doc });
    expect(factory.createSidraDisplayer(el)).toEqual({ el });
  });
});

describe('IDisplayers', () => {
  it('should allow access to known and dynamic keys', () => {
    const displayers: IDisplayers = {
      position: 'pos',
      address: 'addr',
      referencePlace: 'ref',
      highlightCards: 'cards',
      sidra: 'sidra',
      custom: 'customValue',
    };
    expect(displayers.position).toBe('pos');
    expect(displayers['custom']).toBe('customValue');
  });
});

describe('ServiceCoordinatorParams', () => {
  class MockGeolocationService implements IGeolocationServiceForSC {
    getSingleLocationUpdate = jest.fn(async () => ({ lat: 1, lng: 2 }));
  }
  class MockReverseGeocoder implements IReverseGeocoderForSC {
    latitude: number | null = 0;
    longitude: number | null = 0;
    currentAddress: unknown = {};
    enderecoPadronizado: unknown = {};
    subscribe = jest.fn();
  }
  class MockChangeDetectionCoordinator implements IChangeDetectionCoordinatorForSC {
    setCurrentPosition = jest.fn();
    setupChangeDetection = jest.fn();
  }
  class MockDisplayerFactory implements IDisplayerFactory {
    createPositionDisplayer = jest.fn();
    createAddressDisplayer = jest.fn();
    createReferencePlaceDisplayer = jest.fn();
    createHighlightCardsDisplayer = jest.fn();
    createSidraDisplayer = jest.fn();
  }

  it('should construct valid ServiceCoordinatorParams with all required fields', () => {
    const params: ServiceCoordinatorParams = {
      geolocationService: new MockGeolocationService(),
      reverseGeocoder: new MockReverseGeocoder(),
      changeDetectionCoordinator: new MockChangeDetectionCoordinator(),
      observerSubject: {},
      displayerFactory: new MockDisplayerFactory(),
      document: document,
    };
    expect(params.geolocationService).toBeInstanceOf(MockGeolocationService);
    expect(params.reverseGeocoder).toBeInstanceOf(MockReverseGeocoder);
    expect(params.changeDetectionCoordinator).toBeInstanceOf(MockChangeDetectionCoordinator);
    expect(params.observerSubject).toBeDefined();
    expect(params.displayerFactory).toBeInstanceOf(MockDisplayerFactory);
    expect(params.document).toBe(document);
  });

  it('should allow optional fields to be omitted', () => {
    const params: ServiceCoordinatorParams = {
      geolocationService: new MockGeolocationService(),
      reverseGeocoder: new MockReverseGeocoder(),
      changeDetectionCoordinator: new MockChangeDetectionCoordinator(),
      observerSubject: {},
    };
    expect(params.displayerFactory).toBeUndefined();
    expect(params.document).toBeUndefined();
  });
});
