# Throttle × GeolocationService — Design Notes

> **Files covered**
>
> - [`src/utils/throttle.ts`](../src/utils/throttle.ts)
> - [`src/services/GeolocationService.ts`](../src/services/GeolocationService.ts)
> - [`src/config/defaults.ts`](../src/config/defaults.ts) — `GEOLOCATION_THROTTLE_INTERVAL`

---

## Problem

The browser's `navigator.geolocation.watchPosition` API fires a callback every
time the device reports a new GPS fix. On mobile devices this can happen many
times per second. Processing each raw event — validating coordinates, calling
`PositionManager.update()`, re-rendering the DOM — far more often than the
application actually needs is wasteful and can degrade battery life and UI
responsiveness.

Additionally, `getSingleLocationUpdate()` is an async operation that can be
triggered by multiple callers. Without rate-limiting, rapid successive calls
could result in overlapping GPS requests, stale data races, and unnecessary
network-equivalent work from the Geolocation API.

---

## Solution

`throttle.ts` provides a generic, leading-edge throttle higher-order function.
`GeolocationService` applies it in two places:

| Location | Mechanism | Purpose |
|---|---|---|
| `watchCurrentLocation()` | `throttledWatchHandler` passed to `watchPosition` | Limits continuous watch callbacks |
| `getSingleLocationUpdate()` | Manual timestamp comparison with `lastSingleFetchTime` | Returns cached position if called too soon |

Both use the same constant — **`GEOLOCATION_THROTTLE_INTERVAL = 5 000 ms`** — as
their cooldown window.

---

## How `throttle.ts` works

```
Leading-edge strategy
─────────────────────────────────────────────────────────────────────▶ time
  call  call  call         call  call
   ▼                        ▼
  FIRE  (drop) (drop)      FIRE  (drop)
   │←─────── 5 s ─────────►│←─────── 5 s ──…
```

- **First call** in each 5-second window executes immediately.
- **Subsequent calls** within the same window are silently dropped (return
  `undefined`).
- **`flush()`** resets the internal timestamp to zero, so the very next call
  fires immediately regardless of elapsed time.

```ts
export function throttle<TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => TReturn,
    wait: number,
): ThrottledFunction<TArgs, TReturn>
```

The returned value is a `ThrottledFunction<TArgs, TReturn>`, which behaves like
`fn` but has an extra `flush(): void` method.

---

## Integration inside `GeolocationService`

### 1 — Continuous watch (`watchCurrentLocation`)

```ts
// Constructor — wired once, reused for the entire lifetime of the instance
this.throttledWatchHandler = throttle((position: GeolocationPosition) => {
    this.lastKnownPosition = position;
    this.positionManager.update(position);
    if (this.locationResult) {
        this.updateLocationDisplay(position);
    }
}, GEOLOCATION_THROTTLE_INTERVAL);

// Later, passed directly to the browser API
this.watchId = this.provider.watchPosition(
    this.throttledWatchHandler,   // ← throttled callback
    errorHandler,
    this.config.geolocationOptions
);
```

The browser may fire dozens of events per second; `PositionManager.update()` is
called at most once every 5 seconds.

### 2 — Single-shot fetch (`getSingleLocationUpdate`)

`getSingleLocationUpdate` applies throttling manually via a timestamp field:

```ts
const now = Date.now();
if (now - this.lastSingleFetchTime < GEOLOCATION_THROTTLE_INTERVAL
    && this.lastKnownPosition) {
    // Return the cached position — no new GPS call needed
    return Promise.resolve(this.lastKnownPosition);
}
```

This prevents redundant GPS requests when the method is called repeatedly in a
short time span (e.g., multiple UI events firing in quick succession).

### 3 — Escape hatch (`flushThrottle`)

Both throttle mechanisms can be reset simultaneously with a single call:

```ts
flushThrottle(): void {
    this.lastSingleFetchTime = 0;         // resets the single-fetch guard
    this.throttledWatchHandler.flush();   // resets the watch callback guard
}
```

Use this when the **user explicitly requests a location refresh** — you want the
next update to go through immediately, bypassing the cooldown.

---

## Data-flow diagram

```
Browser GPS hardware
        │
        │  (raw events, potentially many/second)
        ▼
navigator.geolocation.watchPosition(throttledWatchHandler)
        │
        │  (at most 1 per 5 s — leading-edge throttle)
        ▼
throttledWatchHandler(position)
        ├─▶ GeolocationService.lastKnownPosition = position
        ├─▶ PositionManager.update(position)
        └─▶ GeolocationService.updateLocationDisplay(position)   [if DOM element present]
```

---

## Configuration

| Constant | File | Value | Meaning |
|---|---|---|---|
| `GEOLOCATION_THROTTLE_INTERVAL` | `src/config/defaults.ts` | `5000` ms | Minimum time between processed GPS updates |

Adjust this value to trade off **responsiveness** (lower) vs **battery /
CPU efficiency** (higher).

---

## Error handling & edge cases

| Scenario | Behaviour |
|---|---|
| `watchPosition` timeout (`code 3`) | Warning logged; watch continues; throttle unaffected |
| Fatal watch error (permission denied, unavailable) | Error logged; DOM updated via `updateErrorDisplay` |
| `getSingleLocationUpdate` called while another is pending | Returns the same in-flight `Promise` — no duplicate request |
| `flushThrottle()` called mid-cooldown | Both guards reset; next call fires immediately |
| `throttle(fn, 0)` | Every call executes (no cooldown) |

---

## Related files

| File | Role |
|---|---|
| `src/utils/throttle.ts` | Generic throttle utility |
| `src/services/GeolocationService.ts` | Consumer — applies throttle to GPS callbacks |
| `src/config/defaults.ts` | Defines `GEOLOCATION_THROTTLE_INTERVAL` (5 000 ms) |
| `src/core/PositionManager.ts` | Receives throttled position updates |
| `src/services/providers/BrowserGeolocationProvider.ts` | Wraps `navigator.geolocation` |

---

*Since v0.12.5-alpha — `throttle.ts` introduced; `flushThrottle()` added to `GeolocationService`.*
