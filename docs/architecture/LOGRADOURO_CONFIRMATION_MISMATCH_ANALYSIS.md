# Logradouro confirmation mismatch analysis

## Revision note

The original version of this document (prior to 2026-04-27) concluded that the visible
logradouro highlight card was the **buggy surface** in the observed incident. That conclusion
was wrong. The product owner confirmed that the highlight card behavior is intentional and
correct. This document has been rewritten under the correct premise.

---

## Summary

A production observation showed:

- visible logradouro card: `Rua Herval`
- confirmation buffer panel, "Último estabilizado": `Rua Silva Jardim`
- confirmation buffer panel, "Candidato atual": `Rua Herval`, count `1 / 3`
- speech: had **not** announced `Rua Herval`

All three surfaces were **correct**. They represent three distinct states in the
address-resolution pipeline, not one state viewed from three perspectives.

---

## The three surfaces and their semantics

### Surface 1 — Highlight cards (`HTMLHighlightCardsDisplayer`)

**Semantic:** "freshest address for the current session."

Update logic in `_resolveAddressForUpdate()` (`src/html/HTMLHighlightCardsDisplayer.ts`):

| incoming event | `_hasRenderedAddress` | result |
|---|---|---|
| `ADDRESS_FETCHED_EVENT` | `false` (first render) | use raw geocoder address |
| `ADDRESS_FETCHED_EVENT` | `true` (already shown) | ignored — returns `null` |
| `LogradouroChanged` / `BairroChanged` / `MunicipioChanged` | any | use `changeDetails.currentAddress` |

The card hydrates immediately from the first geocoder result, giving the user something to
read as soon as the geocoder returns. After that it only updates when a confirmed field-change
event fires, so the card never flickers from raw GPS jitter.

### Surface 2 — Confirmation buffer panel (`HTMLConfirmationBufferDisplayer`)

**Semantic:** "internal state of the singleton confirmation buffer — diagnostic only."

Polls `AddressCache.getInstance().getConfirmationBufferState()` every 1 second.

| column | meaning |
|---|---|
| Último estabilizado | last value that accumulated `threshold` consecutive identical geocoder reads |
| Candidato atual | the value currently being accumulated toward the next confirmation |
| Qtd / Limiar | how many consecutive identical readings have been seen / the required threshold |

This panel exposes the internal state of `LogradouroChangeTrigger` and
`AddressFieldConfirmationBuffer` inside `AddressCache`. It is explicitly intended as a
diagnostic tool. Its "Último estabilizado" value is **not** the same as what the highlight
card shows, and that is expected.

The `AddressCache` singleton lives across Vue component lifecycles. Its buffer retains the
last confirmed logradouro even after the home view unmounts and remounts. A newly created
`HTMLHighlightCardsDisplayer` starts with no render history, so it hydrates from the next
raw geocoder result, which may differ from the buffer's last confirmed value.

### Surface 3 — Speech (`AddressSpeechObserver`)

**Semantic:** "addresses and changes worth announcing out loud."

- First address: announced immediately on the first `ADDRESS_FETCHED_EVENT` when
  `_firstAddressAnnounced` is `false`. Same hydration path as the card.
- Subsequent logradouro changes: announced only on `LogradouroChanged` (confirmed event).
  The confirmation buffer acts as a jitter filter so the device does not announce every
  raw GPS intersection reading.

Speech is intentionally more conservative than the card: it waits for confirmation to avoid
repeated, contradictory announcements as the user passes through an intersection.

---

## Why the incident was not a bug

The observed state:

1. Card showed `Rua Herval` — fresh geocoder result, first hydration for the current
   displayer instance. Correct.
2. Buffer showed `Rua Silva Jardim` stabilized, `Rua Herval` accumulating 1 of 3 — the
   singleton had `Rua Silva Jardim` from earlier readings and was still waiting for two more
   `Rua Herval` readings before confirming the change. Correct.
3. Speech had not announced — no `LogradouroChanged` event had fired, and `_firstAddressAnnounced`
   was already `true`. Correct.

All three surfaces behaved exactly as designed.

---

## What caused the appearance of a mismatch

The buffer panel previously used column headers "Confirmado" and "Pendente", which read as
if they were declaring the authoritative address truth. A reader unfamiliar with the buffer
semantics would interpret "Confirmado: Rua Silva Jardim" as "the correct address is Rua
Silva Jardim" and conclude the card was wrong to show `Rua Herval`.

The initial conclusion that "all three surfaces were correct" was wrong. The speech
silence was **not** correct — it was caused by two real bugs described below.

---

## Root cause (revised 2026-04-27)

### Bug 1 — `_firstAddressAnnounced` consumed without speech (`AddressSpeechObserver.ts`)

```typescript
// Before fix (AddressSpeechObserver.ts)
this._firstAddressAnnounced = true;   // set unconditionally
if (textToBeSpoken) {                 // then maybe speak
    this.speechManager.speak(...);
}
```

`_firstAddressAnnounced` was set to `true` regardless of whether `buildTextToSpeech`
returned content.  If the address data was incomplete on the first geocoding result, or
if the browser's speech synthesis API was not yet ready, the flag was silently consumed
and speech never announced the current street.  All subsequent `ADDRESS_FETCHED_EVENT`
calls were ignored because `_firstAddressAnnounced` was already `true`.

**Fix**: move `this._firstAddressAnnounced = true` inside the `if (textToBeSpoken)` block.
The first-announcement slot is now only consumed when speech actually fires.

### Bug 2 — controller never recreated on back-navigation (`app.ts`)

`initializeHomeView()` guarded controller creation with `if (!AppState.homeController)`,
which meant the controller — and with it the card displayer and speech observer — was
created once and lived for the entire page session.  When the user navigated to
`#/converter`, `loadConverterView()` replaced `#app-content` innerHTML, making the card
displayer's cached DOM references stale.  On return to `#/`, no HTML was restored and no
new controller was created, so the home view was broken and speech remained gated on a
`LogradouroChanged` event that was blocked by the buffer.

**Fix**: in `handleRoute()`, destroy the controller and snapshot the home view HTML
before loading any non-home route.  In `initializeHomeView()`, restore the HTML snapshot
before creating the new controller.  This guarantees that every `#/` visit gets a fresh
card displayer with live DOM references and a fresh speech observer with
`_firstAddressAnnounced = false`.

---

## Fixes applied (2026-04-27)

### 1. `AddressSpeechObserver._firstAddressAnnounced` ordering fix

`this._firstAddressAnnounced = true` moved inside `if (textToBeSpoken)`.

### 2. `app.ts` routing lifecycle fix

- Added `AppState.homeViewHTML` to hold the home view snapshot.
- `handleRoute()` destroys controller and saves HTML before any non-home route.
- `initializeHomeView()` restores HTML snapshot before creating the new controller.

### 3. Lifecycle log lines added

- `HTMLHighlightCardsDisplayer` constructor logs creation.
- `AddressSpeechObserver` constructor logs creation.
- `HomeViewController.destroy()` logs destruction.

These three log lines allow future production incidents to confirm whether card and
speech observer instances were created together by comparing timestamps in the console.

### 4. Buffer panel column relabeling (`HTMLConfirmationBufferDisplayer.ts`)

- "Confirmado" → "Último estabilizado"
- "Pendente" → "Candidato atual"

### 5. Buffer card header clarification (`src/index.html`)

Added "(diagnóstico)" to signal this panel is an inspection tool.

### 6. Buffer panel caption

Added a `<caption>` explaining the relationship between buffer state and highlight cards.

---

## The full three-state model

```
ReverseGeocoder ──── ADDRESS_FETCHED_EVENT ───► HTMLHighlightCardsDisplayer
                                                 (first render only; fast hydration)
                │
                ▼
          AddressCache
          (singleton)
          LogradouroChangeTrigger ──► (after N readings) ──► LogradouroChanged ──► Speech
          AddressFieldConfirmationBuffer                                         ──► HTMLHighlightCardsDisplayer
                │                                                                     (confirmed updates)
                │
                ▼
          getConfirmationBufferState()
                │
                ▼
          HTMLConfirmationBufferDisplayer
          (diagnostic poll, 1 s)
```

---

## Observability gaps that remain

Even though the incident behavior was correct, the following observability improvements would
make future incidents easier to triage:

1. A log entry when `HTMLHighlightCardsDisplayer` accepts an `ADDRESS_FETCHED_EVENT` that
   indicates whether it is the first hydration or a confirmed-change update.
2. A log of the current buffer snapshot at the moment of any highlight-card logradouro change.
3. Lifecycle logs for creation/destruction of `HomeViewController` and
   `HTMLHighlightCardsDisplayer` to correlate displayer recreation with buffer state.

---

## References

- `src/html/HTMLHighlightCardsDisplayer.ts` — three-path update logic
- `src/html/HTMLConfirmationBufferDisplayer.ts` — diagnostic panel
- `src/data/AddressCache.ts` — singleton, `getConfirmationBufferState()`
- `src/data/LogradouroChangeTrigger.ts` — logradouro confirmation buffer
- `src/data/AddressFieldConfirmationBuffer.ts` — generic field confirmation buffer
- `src/services/ChangeDetectionCoordinator.ts` — confirmed-change dispatch
- `src/observers/AddressSpeechObserver.ts` — speech hydration and change paths
- `docs/architecture/observer-pattern-sequence.md` — event-flow sequence diagrams
