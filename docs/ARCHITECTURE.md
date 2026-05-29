# Architecture Overview — Guia Turístico

> **This is an index file.** Detailed architecture documents live in
> [`docs/architecture/`](architecture/).

---

## Quick navigation

| Document | Contents |
|----------|----------|
| [`architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md) | Full architecture guide |
| [`architecture/CLASS_DIAGRAM.md`](architecture/CLASS_DIAGRAM.md) | Class relationships |
| [`architecture/MODULES.md`](architecture/MODULES.md) | Module boundaries |
| [`architecture/WEB_GEOCODING_MANAGER.md`](architecture/WEB_GEOCODING_MANAGER.md) | Core coordinator |
| [`architecture/ARCHITECTURE_REFACTOR_ROADMAP.md`](architecture/ARCHITECTURE_REFACTOR_ROADMAP.md) | Phased architecture implementation roadmap |
| [`PROJECT_PURPOSE_AND_ARCHITECTURE.md`](PROJECT_PURPOSE_AND_ARCHITECTURE.md) | Purpose and high-level design |

---

## High-level structure

```
src/
├── app.js                    # SPA entry point — router, bootstrap
├── views/                    # View controllers (HomeViewController, ConverterViewController)
├── core/                     # Position management, GeoPosition value object
├── services/                 # API integrations (ReverseGeocoder, GeolocationService)
├── coordination/             # WebGeocodingManager, ServiceCoordinator
├── data/                     # Address extraction, caching, standardisation
├── html/                     # UI displayers (HTMLPositionDisplayer, etc.)
├── speech/                   # Speech synthesis (SpeechSynthesisManager, VoiceLoader, etc.)
├── timing/                   # Chronometer — performance and elapsed-time tracking
├── utils/                    # TimerManager, button-status utilities
├── config/                   # Application constants, route configuration
└── status/                   # SingletonStatusManager
```

### Key architectural patterns

- **MVC**: `Extractor → Validator → Formatter → Displayer` pipeline for address data
- **Observer**: Address change events propagate through `AddressChangeDetector` callbacks
- **Facade**: `HtmlSpeechSynthesisDisplayer` composes `HtmlSpeechControls`, `AddressSpeechObserver`, `SpeechTextBuilder`
- **Singleton**: `PositionManager`, `SingletonStatusManager`, `TimerManager`
- **Composition**: `SpeechSynthesisManager` composes `VoiceLoader`, `VoiceSelector`, `SpeechConfiguration`, `SpeechQueue`

See [`architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md) for the
complete deep-dive with component interactions and data flow diagrams.
