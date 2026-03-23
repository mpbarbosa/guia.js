import {
  NominatimAddress,
  NominatimResponse,
  OsmElement,
  AwsAddress,
} from '../src/types/nominatim';

describe('NominatimAddress type', () => {
  it('accepts a fully populated address object', () => {
    const addr: NominatimAddress = {
      road: 'Avenida Paulista',
      street: 'Rua Augusta',
      pedestrian: 'Calçadão',
      house_number: '123',
      neighbourhood: 'Bela Vista',
      suburb: 'Centro',
      quarter: 'Quarteirão 1',
      village: 'Vila Mariana',
      district: 'Distrito Central',
      hamlet: 'Povoado',
      town: 'São Paulo',
      city: 'São Paulo',
      municipality: 'Município Central',
      county: 'São Paulo County',
      state: 'São Paulo',
      state_code: 'SP',
      postcode: '01311-000',
      country: 'Brasil',
      country_code: 'br',
      'addr:street': 'Rua Augusta',
      'addr:housenumber': '123',
      'addr:neighbourhood': 'Bela Vista',
      'addr:city': 'São Paulo',
      'addr:state': 'SP',
      'addr:postcode': '01311-000',
      'ISO3166-2-lvl4': 'BR-SP',
      custom_field: 'custom value',
    };
    expect(addr.road).toBe('Avenida Paulista');
    expect(addr['custom_field']).toBe('custom value');
  });

  it('accepts an empty object (all fields optional)', () => {
    const addr: NominatimAddress = {};
    expect(addr).toEqual({});
  });

  it('allows unknown string fields', () => {
    const addr: NominatimAddress = {
      foo: 'bar',
      another: undefined,
    };
    expect(addr.foo).toBe('bar');
    expect(addr.another).toBeUndefined();
  });

  it('rejects non-string values for known fields (type check)', () => {
    // @ts-expect-error
    const addr: NominatimAddress = { road: 123 };
    // @ts-expect-error
    const addr2: NominatimAddress = { 'addr:city': { name: 'foo' } };
    expect(true).toBe(true); // type-only test
  });
});

describe('NominatimResponse type', () => {
  it('accepts a full response with all fields', () => {
    const resp: NominatimResponse = {
      address: {
        road: 'Rua Teste',
        city: 'Cidade Teste',
      },
      display_name: 'Rua Teste, Cidade Teste, Brasil',
      place_id: 123456,
      osm_type: 'node',
      osm_id: 654321,
      lat: '-23.561684',
      lon: '-46.655981',
      type: 'residential',
      class: 'place',
      name: 'Test Place',
      extra_field: 42,
    };
    expect(resp.address?.city).toBe('Cidade Teste');
    expect(resp.extra_field).toBe(42);
  });

  it('accepts a minimal response (all fields optional)', () => {
    const resp: NominatimResponse = {};
    expect(resp).toEqual({});
  });

  it('allows unknown top-level fields of any type', () => {
    const resp: NominatimResponse = {
      foo: 'bar',
      bar: 123,
      baz: { nested: true },
    };
    expect(resp.foo).toBe('bar');
    expect(resp.bar).toBe(123);
    expect((resp.baz as any).nested).toBe(true);
  });

  it('rejects invalid types for known fields (type check)', () => {
    // @ts-expect-error
    const resp: NominatimResponse = { place_id: 'not a number' };
    // @ts-expect-error
    const resp2: NominatimResponse = { address: 'not an object' };
    expect(true).toBe(true); // type-only test
  });
});

describe('OsmElement type', () => {
  it('accepts a minimal element', () => {
    const elem: OsmElement = {};
    expect(elem).toEqual({});
  });

  it('accepts known fields', () => {
    const elem: OsmElement = {
      class: 'amenity',
      type: 'restaurant',
      name: 'Restaurante Teste',
    };
    expect(elem.class).toBe('amenity');
    expect(elem.type).toBe('restaurant');
    expect(elem.name).toBe('Restaurante Teste');
  });

  it('allows unknown fields of any type', () => {
    const elem: OsmElement = {
      foo: 123,
      bar: { nested: true },
    };
    expect(elem.foo).toBe(123);
    expect((elem.bar as any).nested).toBe(true);
  });
});

describe('AwsAddress type', () => {
  it('accepts a fully populated AWS address', () => {
    const addr: AwsAddress = {
      label: '123 Main St, City, Country',
      addressNumber: '123',
      street: 'Main St',
      neighborhood: 'Downtown',
      municipality: 'City',
      region: 'State',
      postalCode: '12345',
      country: 'Country',
      custom: 'custom value',
    };
    expect(addr.label).toBe('123 Main St, City, Country');
    expect(addr.custom).toBe('custom value');
  });

  it('accepts an empty object (all fields optional)', () => {
    const addr: AwsAddress = {};
    expect(addr).toEqual({});
  });

  it('allows unknown string fields', () => {
    const addr: AwsAddress = {
      foo: 'bar',
      bar: undefined,
    };
    expect(addr.foo).toBe('bar');
    expect(addr.bar).toBeUndefined();
  });

  it('rejects non-string values for fields (type check)', () => {
    // @ts-expect-error
    const addr: AwsAddress = { street: 123 };
    // @ts-expect-error
    const addr2: AwsAddress = { foo: { nested: true } };
    expect(true).toBe(true); // type-only test
  });
});
