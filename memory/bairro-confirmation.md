---
name: bairro-confirmation
description: BAIRRO_CONFIRMATION_COUNT=3 means E2E tests must trigger 3 geocoding observations; use setGeolocation with >20m offsets spaced by 2s
metadata:
  type: project
---

The `AddressFieldConfirmationBuffer` requires `BAIRRO_CONFIRMATION_COUNT = 3` consecutive identical geocoding results before confirming and displaying the bairro. The same applies to municipio (3) and logradouro (3).

In E2E Puppeteer tests, `page.setGeolocation()` triggers `watchPosition` once. A single geolocation event = 1 geocoding observation = not enough to confirm.

**Fix for bairro test**: After page setup, call `page.setGeolocation()` twice more with lat offsets of 0.0003° (≈33m, > `MINIMUM_DISTANCE_CHANGE`=20m) spaced 2s apart (> `GEOLOCATION_THROTTLE_CONFIRMATION_INTERVAL`=1.5s). This triggers geocoding observations #2 and #3, reaching confirmation threshold.

Once observation #1 arrives, `ServiceCoordinator` activates confirmation mode:

- `GeolocationService.setThrottleInterval(1500)` reduces throttle to 1.5s
- `PositionManager.setBypassDistanceRule(true)` bypasses the distance gate

So 2s spacing is sufficient even with the bypass active.

**Why municipio works without this**: The `municipio-value` test only waits for "any non-empty, non-dash value" — it catches the first `ADDRESS_FETCHED_EVENT` which renders the address immediately (before confirmation). The bairro test specifically waits for the confirmed/stable value.
