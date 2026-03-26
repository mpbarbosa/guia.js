## README

# `__tests__/services/providers`

Unit tests for the geolocation provider implementations in `src/services/providers/`.

## Files

| Test file | Module under test | Description |
|-----------|------------------|-------------|
| `BrowserGeolocationProvider.test.ts` | `BrowserGeolocationProvider` | Browser Geolocation API wrapper |
| `GeolocationProvider.test.ts` | `GeolocationProvider` | Base geolocation provider interface |
| `MockGeolocationProvider.test.ts` | `MockGeolocationProvider` | Mock provider used in other tests |

## Running these tests

```bash
npx jest __tests__/services/providers
```

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
