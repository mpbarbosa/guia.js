# 🗺️ Guia Turístico — Project Roadmap

**Current Version**: `0.12.3-alpha` | **Status**: Active Development
**Last Updated**: 2026-03-10

---

## ✅ Completed (v0.9 – v0.12)

- Real-time geolocation tracking with position/address display
- Brazilian address standardization (Nominatim + IBGE)
- IBGE SIDRA population data integration (online + offline fallback)
- Metropolitan region (Região Metropolitana) detection & display
- Municipio + bairro highlight cards
- Speech synthesis for address announcements (Brazilian Portuguese voice prioritization)
- Material Design 3 UI with WCAG 2.1 accessibility
- Refactored `HtmlSpeechSynthesisDisplayer` to facade pattern (−36% lines)
- Partial TypeScript migration (coordination, core, data, config layers)
- PWA scaffold (manifest + service worker stub)
- Vite build system with code splitting (25% bundle reduction)
- Contextual button status messages (`button-status.js`)
- `paraty_geocore.js` CDN dependency for shared geolocation primitives

---

## 🚧 Near-Term (v0.13 – v0.14-alpha)

### TypeScript Migration — Complete Remaining Files

- Migrate `src/views/home.js` and `src/views/converter.js` to TypeScript
- Migrate remaining `.js` files in `src/html/`, `src/speech/`, `src/utils/`
- Full type coverage with strict mode

### Finalize PWA Support

- Implement `service-worker.js` cache strategies (currently a stub)
- Offline mode: serve last-known location data from cache
- Push notification scaffold for location change alerts

### AWS Location Service Integration

- `AwsGeocoder.ts` and `AwsAddressExtractor.ts` exist but are wired only as a UI toggle — complete provider switching logic
- Make geocoding provider configurable at runtime (Nominatim ↔ AWS)

---

## 🔭 Mid-Term (v0.15 – v0.19-alpha)

### Interactive Map Layer (Leaflet 2.0)

- Integrate **Leaflet 2.0** via npm/Vite (ESM + tree-shaking, no legacy bundle overhead)
- User position marker with accuracy circle using Leaflet's `locationfound` event + `L.circle()`
- GeoJSON overlay for bairro/município boundaries (sourced from IBGE geographic data)
- Marker clustering for nearby POI results (`leaflet.markercluster` plugin)
- PointerEvents API (Leaflet 2.0) for smoother mobile location tracking interaction
- Automatic OSM attribution compliance (Leaflet 2.0 feature)

### Nearby Places — Replace Placeholder

- Replace `findNearbyRestaurants()` alert with real Overpass API or Google Places integration
- Category support: restaurants, pharmacies, hospitals, tourist attractions
- Display results on Leaflet map with distance markers and popup details

### City Statistics — Replace Placeholder

- Replace `fetchCityStatistics()` alert with live IBGE SIDRA queries
- Show: population, GDP, HDI, area, neighboring municipalities
- Expandable stats panel within the main view

### Offline-First Architecture

- Cache IBGE municipality data locally (IndexedDB)
- Cache recent addresses and positions for offline access
- Background sync for queued address lookups

### Route Navigation Utility

- Simple A→B route between two Brazilian addresses
- Integration with public OpenRouteService or OSRM

---

## 🌟 Long-Term (v1.0 — Stable Release)

### Stable API & Public 1.0 Release

- Remove `alpha` designation across all version strings
- Semantic versioning policy enforced (no breaking changes without major bump)
- Full public API documentation (JSDoc → HTML)

### Multi-Language Support

- English translation layer (i18n)
- Maintain Brazilian Portuguese as primary

### Accessibility Audit & Certification

- Full WCAG 2.1 AA audit by automated + manual tools
- Screen reader testing on iOS VoiceOver and Android TalkBack
- Leverage Leaflet 2.0 accessible map controls: `aria-keyshortcuts` on map container, accessible popup close button `aria-label`

### Performance Targets

- Lighthouse score: ≥ 90 Performance, ≥ 95 Accessibility
- Bundle size: < 500 KB gzipped
- Core Web Vitals: LCP < 2.5s, CLS < 0.1

---

## 🔑 Key Technical Debt

| Item | Priority |
|---|---|
| Complete TypeScript migration (`.js` → `.ts`) | High |
| Implement `service-worker.js` (currently stub) | High |
| Replace placeholder `findNearbyRestaurants()` | Medium |
| Replace placeholder `fetchCityStatistics()` | Medium |
| Complete AWS geocoding provider integration | Medium |
| Evaluate Leaflet 2.0 v1→v2 API migration (factory methods → ES6 constructors) | Low |
| Consolidate duplicate `CHANGELOG.md` v0.9.0 entries | Low |
