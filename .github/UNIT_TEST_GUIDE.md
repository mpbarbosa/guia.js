# Unit Test Guide

---

Last Updated: 2026-03-23
Status: Active
Category: Guide

---

Patterns and recipes for writing unit tests in Guia Turístico.

## Test File Location

| Source file | Test file |
|-------------|-----------|
| `src/data/AddressCache.ts` | `__tests__/data/AddressCache.test.ts` |
| `src/services/GeolocationService.ts` | `__tests__/services/GeolocationService.test.ts` |
| `src/html/HTMLAddressDisplayer.ts` | `__tests__/html/HTMLAddressDisplayer.test.ts` |

Mirror the `src/` directory structure under `__tests__/`.

## Mocking Browser APIs

```typescript
// Geolocation
global.navigator.geolocation = {
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  getCurrentPosition: jest.fn(),
};

// Speech synthesis
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: jest.fn().mockReturnValue([]),
};
```

## Resetting Singletons Between Tests

Classes like `AddressCache` are singletons. Reset them in `beforeEach`:

```typescript
beforeEach(() => {
  AddressCache.clearCache();
  // or, if a reset method exists:
  AddressCache.getInstance().reset();
});
```

## Testing Callbacks

```typescript
test('fires the callback when the value changes', () => {
  const cb = jest.fn();
  cache.setLogradouroChangeCallback(cb);

  cache.update({ road: 'Rua Nova' });

  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb).toHaveBeenCalledWith(expect.objectContaining({ current: 'Rua Nova' }));
});
```

## Testing Async Code

```typescript
test('resolves with the address after the API responds', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ road: 'Rua das Flores' }),
  });

  const result = await geocoder.reverse(-8.05, -34.9);

  expect(result.road).toBe('Rua das Flores');
});
```

## See Also

- [TDD_GUIDE.md](./TDD_GUIDE.md) — the Red–Green–Refactor cycle.
- [CODE_REVIEW_GUIDE.md](./CODE_REVIEW_GUIDE.md) — review checklist for tests.
