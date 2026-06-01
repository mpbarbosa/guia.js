# Guia Turístico

A real-time tourist guide for Brazilian locations. Given a GPS position, it
identifies the nearest Brazilian address and presents standardised data about
the município, neighbourhood, street, and nearby points of interest.

## Language

### Brazilian address components

**Logradouro**:
The street or public thoroughfare (rua, avenida, travessa, etc.) component of a
Brazilian address.
_Avoid_: Street, road, via

**Bairro**:
The neighbourhood component of a Brazilian address, one level below município.
_Avoid_: District, neighbourhood, suburb, quarter

**Município**:
The Brazilian administrative unit that contains bairros and maps to what the
rest of the world calls a city or town. A município is uniquely identified by
its IBGE code.
_Avoid_: City, town, council, county

**UF / Sigla UF**:
The two-letter abbreviation for a Brazilian state (e.g. SP, RJ, MG). Always
displayed alongside the município name to disambiguate homonymous municipalities.
_Avoid_: State code, province, abbreviation, state

**CEP**:
The Brazilian postal code (Código de Endereçamento Postal), an eight-digit
identifier assigned to a street segment or building.
_Avoid_: Postcode, ZIP, postal code

**Região Metropolitana**:
A metropolitan area grouping municipalities around a major hub (e.g. "Região
Metropolitana de São Paulo"). Sourced from the Nominatim `address.county` field
in Brazil — not `address.region`, which is unused by the OSM dataset for this
purpose.
_Avoid_: Metropolitan region, metro area

**Endereço Padronizado**:
The canonical structured address object produced by this project after a
geocoding result is extracted and normalised. Contains logradouro, bairro,
município, siglaUF, CEP, país, regiãoMetropolitana, and referencePlace. The
authoritative output of the geocoding pipeline.
_Avoid_: Standardised address, parsed address, address object

**Ponto de Referência (ReferencePlace)**:
A nearby named point of interest (café, metrô station, shopping centre, etc.)
extracted from the geocoding response and attached to the endereço padronizado.
_Avoid_: POI, landmark, nearby place

### Position tracking

**GeoPosition**:
An immutable snapshot of a GPS-derived geographic position at a moment in time,
carrying latitude, longitude, and accuracy in metres.
_Avoid_: Position, location, coordinates

**Position update threshold**:
The rule that governs when a new GeoPosition triggers a full geocoding cycle:
a position is accepted only if the device has moved ≥ 20 m **or** ≥ 30 s have
elapsed since the last accepted position.
_Avoid_: Update interval, debounce, throttle

**Rastreamento (Tracking)**:
Continuous position watching — the device's Geolocation API is polled on a
watch handle and each accepted GeoPosition triggers the geocoding pipeline. The
opposite of a single-shot update.
_Avoid_: Monitoring, polling, geofencing

### Geocoding reliability

**Intersection jitter**:
The GPS error artefact that occurs near street intersections: reported
coordinates briefly fall on an adjacent street, bairro, or município because of
the browser geolocation API's ±50 m accuracy margin. The primary reliability
problem this app solves.
_Avoid_: GPS error, location drift, coordinate noise

**Confirmation buffer**:
A per-field filter that requires a new geocoding value to be observed N
consecutive times before it is committed to the UI. Eliminates intersection
jitter from logradouro, bairro, and município displays without delaying
genuinely new locations.
_Avoid_: Debounce, smoothing, hysteresis, vote

**Confirmed value**:
A field value (logradouro, bairro, or município) that has passed its
confirmation buffer and is displayed to the user.
_Avoid_: Stable value, locked value, settled value

### Data persistence

**Location snapshot**:
A persisted record of the most recently confirmed position and its endereço
padronizado, stored in IndexedDB. Shown on startup when a fresh GPS fix has not
yet arrived, giving the user immediately useful context.
_Avoid_: Cached location, last-known position, saved address

**Snapshot surface**:
A read-only UI surface that renders the persisted Location snapshot without
owning live geolocation tracking.
_Avoid_: Live tracker, tracking widget, geolocation controller

**LocationSnapshotCard**:
The Vue component that renders the Snapshot surface on the Extra page. It shows
persisted location-derived data without starting or owning Rastreamento.
_Avoid_: SecondaryInfo, tracking card, live location panel

**Snapshot update event**:
The repository-level notification emitted after the persisted Location snapshot
is written, allowing Snapshot surfaces to refresh without subscribing to live
tracking objects directly.
_Avoid_: Tracking event, live geolocation event, address observer

### Navigation

**Extra page**:
The existing `#/extra` route rendered by `ExtraView.vue`. Reserved for
additional, non-primary content that complements the Home screen.
_Avoid_: Extra screen, misc page, secondary home

### Validation workflow

**Default Jest run**:
The repository's plain Jest invocation exposed as `npm test`. It is a narrower
check than the full test matrix and must not be described as the entire suite.
_Avoid_: Full suite, all tests, unit+integration+e2e

### Statistics

**IBGE**:
Instituto Brasileiro de Geografia e Estatística — the Brazilian government body
that assigns official codes to every município and publishes demographic and
territorial statistics used by the Stats screen.
_Avoid_: Brazilian census bureau, statistics institute

**SIDRA**:
Sistema IBGE de Recuperação Automática — the IBGE API that serves tabular
demographic data (population, area) for a given município code. The Stats screen
queries SIDRA for the current município after it is confirmed.
_Avoid_: IBGE API, city statistics API
