# Geolocation Provider Tests

Unit and integration tests for the geolocation provider implementations in `src/services/providers/`.

## Files

| File | Description |
|------|-------------|
| `GeolocationProvider.test.ts` | Tests for the `GeolocationProvider` interface/base contract |
| `BrowserGeolocationProvider.test.ts` | Tests for the browser-native `navigator.geolocation` wrapper |
| `MockGeolocationProvider.test.ts` | Tests verifying the mock provider used in other tests behaves correctly |

## Purpose

These tests validate the provider abstraction layer — ensuring all concrete geolocation providers honour the `GeolocationProvider` contract, enabling safe substitution (Strategy pattern).
