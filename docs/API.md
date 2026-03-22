# API Reference — Guia Turístico

> **This is an index file.** The full API reference is in
> [`docs/api/API_REFERENCE.md`](api/API_REFERENCE.md).

---

## Quick navigation

| Document | Contents |
|----------|----------|
| [`api/API_REFERENCE.md`](api/API_REFERENCE.md) | Complete API reference (all classes and methods) |
| [`api/API_COMPLETE_REFERENCE.md`](api/API_COMPLETE_REFERENCE.md) | Extended API documentation |
| [`api/API_QUICK_REFERENCE.md`](api/API_QUICK_REFERENCE.md) | Quick reference card |
| [`api/API_EXAMPLES.md`](api/API_EXAMPLES.md) | Usage examples |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Architecture overview |

---

## Key modules

| Module | Description |
|--------|-------------|
| `WebGeocodingManager` | Main coordination class — orchestrates geolocation, geocoding, and UI |
| `HomeViewController` | Home view controller — single-position and continuous tracking |
| `ConverterViewController` | Converter view controller — coordinate format conversion |
| `ReverseGeocoder` | OpenStreetMap/Nominatim reverse geocoding integration |
| `BrazilianStandardAddress` | Brazilian address standardisation and formatting |
| `SpeechSynthesisManager` | Text-to-speech with Brazilian Portuguese voice prioritisation |
| `PositionManager` | Singleton — current geolocation state management |

See [`api/API_REFERENCE.md`](api/API_REFERENCE.md) for full signatures,
parameters, return types, and examples for each module.
