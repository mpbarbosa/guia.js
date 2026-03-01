/**
 * displayers.test.ts — Tests for displayers type interfaces (src/types/displayers.ts)
 */

import type {
  Observer,
  Coords,
  PositionLike,
  AddressFields,
  SidraRecord,
} from './displayers';

describe('Observer interface', () => {
  it('should allow implementing update method with correct signature (happy path)', () => {
    class TestObserver implements Observer {
      public lastArgs: any;
      update(subject: object, posEvent: string, loading: boolean | object | null, error: Error | null): void {
        this.lastArgs = { subject, posEvent, loading, error };
      }
    }
    const observer = new TestObserver();
    const subject = { foo: 'bar' };
    observer.update(subject, 'position', true, null);
    expect(observer.lastArgs).toEqual({
      subject,
      posEvent: 'position',
      loading: true,
      error: null,
    });
  });

  it('should handle null and object loading, and error scenarios (edge/error cases)', () => {
    class TestObserver implements Observer {
      public lastArgs: any;
      update(subject: object, posEvent: string, loading: boolean | object | null, error: Error | null): void {
        this.lastArgs = { subject, posEvent, loading, error };
      }
    }
    const observer = new TestObserver();
    const error = new Error('Test error');
    observer.update({}, 'event', { pending: true }, error);
    expect(observer.lastArgs.loading).toEqual({ pending: true });
    expect(observer.lastArgs.error).toBe(error);

    observer.update({}, 'event', null, null);
    expect(observer.lastArgs.loading).toBeNull();
    expect(observer.lastArgs.error).toBeNull();
  });
});

describe('Coords interface', () => {
  it('should accept required latitude and longitude (happy path)', () => {
    const coords: Coords = { latitude: 10, longitude: 20 };
    expect(coords.latitude).toBe(10);
    expect(coords.longitude).toBe(20);
  });

  it('should accept optional fields (edge cases)', () => {
    const coords: Coords = {
      latitude: 1,
      longitude: 2,
      accuracy: 5,
      altitude: null,
      altitudeAccuracy: undefined,
      heading: 90,
      speed: 10,
    };
    expect(coords.accuracy).toBe(5);
    expect(coords.altitude).toBeNull();
    expect(coords.altitudeAccuracy).toBeUndefined();
    expect(coords.heading).toBe(90);
    expect(coords.speed).toBe(10);
  });

  it('should allow missing optional fields (edge case)', () => {
    const coords: Coords = { latitude: 0, longitude: 0 };
    expect(coords.accuracy).toBeUndefined();
    expect(coords.altitude).toBeUndefined();
  });
});

describe('PositionLike interface', () => {
  it('should accept coords and optional timestamp (happy path)', () => {
    const pos: PositionLike = {
      coords: { latitude: 1, longitude: 2 },
      timestamp: 1234567890,
    };
    expect(pos.coords.latitude).toBe(1);
    expect(pos.timestamp).toBe(1234567890);
  });

  it('should allow missing timestamp (edge case)', () => {
    const pos: PositionLike = { coords: { latitude: 3, longitude: 4 } };
    expect(pos.timestamp).toBeUndefined();
  });
});

describe('AddressFields interface', () => {
  it('should accept known address fields (happy path)', () => {
    const address: AddressFields = {
      municipio: 'Serro',
      bairro: 'Centro',
      logradouro: 'Rua Principal',
      regiaoMetropolitana: 'Belo Horizonte',
    };
    expect(address.municipio).toBe('Serro');
    expect(address.bairro).toBe('Centro');
    expect(address.logradouro).toBe('Rua Principal');
    expect(address.regiaoMetropolitana).toBe('Belo Horizonte');
  });

  it('should accept arbitrary string keys (edge case)', () => {
    const address: AddressFields = {
      municipio: 'Serro',
      customField: 'Custom Value',
    };
    expect(address.customField).toBe('Custom Value');
  });

  it('should allow missing fields (edge case)', () => {
    const address: AddressFields = {};
    expect(address.municipio).toBeUndefined();
    expect(address.bairro).toBeUndefined();
  });
});

describe('SidraRecord interface', () => {
  it('should accept municipio_codigo as string or number, and populacao as number (happy path)', () => {
    const record1: SidraRecord = { municipio_codigo: '123', populacao: 4567 };
    const record2: SidraRecord = { municipio_codigo: 123, populacao: 4567 };
    expect(record1.municipio_codigo).toBe('123');
    expect(record2.municipio_codigo).toBe(123);
    expect(record1.populacao).toBe(4567);
  });

  it('should accept arbitrary keys with unknown values (edge case)', () => {
    const record: SidraRecord = { municipio_codigo: 1, populacao: 2, extra: { foo: 'bar' } };
    expect(record.extra).toEqual({ foo: 'bar' });
  });

  it('should allow missing fields (edge case)', () => {
    const record: SidraRecord = {};
    expect(record.municipio_codigo).toBeUndefined();
    expect(record.populacao).toBeUndefined();
  });
});
