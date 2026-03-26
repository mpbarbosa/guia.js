## README

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

---

## README

# Geolocation Providers

Concrete implementations of the `GeolocationProvider` interface, enabling the Strategy pattern for geolocation data sources.

## Files

| File | Description |
|------|-------------|
| `GeolocationProvider.ts` | Abstract interface defining the provider contract (all providers must implement this) |
| `BrowserGeolocationProvider.ts` | Production implementation wrapping the browser `navigator.geolocation` API |
| `MockGeolocationProvider.ts` | Test/development implementation returning configurable mock positions |

## Architecture

```
GeolocationService
    └── uses GeolocationProvider (interface)
            ├── BrowserGeolocationProvider  (production)
            └── MockGeolocationProvider     (testing / offline)
```

The abstraction allows `GeolocationService` to be tested without a real device and supports future providers (e.g., IP-based fallback).

## Tests

Provider tests are located in `__tests__/services/providers/`.
