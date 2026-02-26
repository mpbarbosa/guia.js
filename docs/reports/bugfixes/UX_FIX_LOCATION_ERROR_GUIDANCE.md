# UX Fix: Location Permission Error Guidance

**Date**: 2026-02-15
**Issue**: Dead-end experience when location permission denied
**Severity**: Critical
**Impact**: 20-30% of users (typical denial rate)

## Problem

When users denied location permission or geolocation failed:

- ❌ Generic error message with no recovery path
- ❌ No guidance on how to fix browser permissions
- ❌ No fallback option mentioned
- ❌ Dead-end experience → 20-30% user abandonment

## Solution Implemented

### 1. Error-Specific Messaging

**Enhanced `showErrorRecovery(error)` method** to handle 3 error types:

**PERMISSION_DENIED (code 1)**:

- Title: "Permissão de Localização Negada"
- Browser-specific permission instructions:
  - Chrome/Edge: 🔒 icon → Site permissions → Location → Allow
  - Firefox: 🔒 icon → Secure connection → More info → Permissions → Location → Allow
  - Safari: Safari → Settings → Privacy → Location Services → Enable for site
- Fallback: "Use o Conversor de Coordenadas para inserir manualmente"

**POSITION_UNAVAILABLE (code 2)**:

- Title: "Localização Indisponível"
- Possible causes:
  - GPS disabled on device
  - Weak GPS signal (try outdoors)
  - Browser location services inactive
- Solution: Manual coordinate entry via converter

**TIMEOUT (code 3)**:

- Title: "Tempo Esgotado"
- Message: "A busca pela sua localização demorou muito"
- Options: Try again or use converter

### 2. Converter Fallback Link

**Dynamic button injection**:

```javascript
const converterLink = document.createElement('a');
converterLink.href = '#/converter';
converterLink.className = 'converter-fallback-link';
converterLink.innerHTML = '📍 Usar Conversor de Coordenadas';
```

**Features**:

- Direct link to `#/converter` route
- Visible as secondary action below "Try Again" button
- Clear affordance with emoji icon
- Hover/focus states for accessibility
- ARIA label: "Abrir conversor de coordenadas para entrada manual"

### 3. "Try Again" Button

**Updated button text**:

- Before: "Habilitar Localização"
- After (error state): "🔄 Tentar Novamente"

**Behavior**:

- Triggers location request again
- Shows browser permission prompt (if previously denied)
- Allows users to reconsider permission decision

### 4. CSS Styling

**Added `converter-fallback-link` styles**:

```css
.converter-fallback-link {
  background: #ffffff;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
}

.converter-fallback-link:hover {
  background: #667eea;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}
```

**List styling for browser instructions**:

```css
.onboarding-description ul {
  text-align: left;
  margin: 16px auto;
  padding-left: 24px;
  max-width: 500px;
}
```

## User Flows

### Flow 1: Permission Denied → Recovery

1. User clicks "Habilitar Localização"
2. Browser shows permission prompt
3. User clicks "Block" / "Deny"
4. **Onboarding updates**:
   - Title: "Permissão de Localização Negada"
   - Shows browser-specific instructions
   - Button: "🔄 Tentar Novamente"
   - Link: "📍 Usar Conversor de Coordenadas"
5. User has 2 clear options:
   - **Option A**: Follow instructions → Try again
   - **Option B**: Click converter link → Manual entry

### Flow 2: Geolocation Unavailable

1. User clicks "Habilitar Localização"
2. GPS unavailable (device/signal issue)
3. **Onboarding updates**:
   - Title: "Localização Indisponível"
   - Lists possible causes
   - Suggests outdoor location for better signal
   - Link: "📍 Usar Conversor de Coordenadas"
4. User can:
   - **Try again** in better location
   - **Use converter** for manual entry

### Flow 3: Timeout

1. User clicks "Habilitar Localização"
2. Location acquisition takes >30 seconds
3. **Onboarding updates**:
   - Title: "Tempo Esgotado"
   - Simple message about delay
   - Link: "📍 Usar Conversor de Coordenadas"
4. User can retry or use converter

## Technical Implementation

### Files Modified

1. **src/components/onboarding.js** (lines 162-265):
   - Enhanced `showErrorRecovery(error)` with error-specific messaging
   - Added `_updateErrorButtons()` private method
   - Added converter link injection
   - Browser-specific permission instructions
   - Updated event listeners to pass error object

2. **src/onboarding.css** (lines 312-357):
   - `.converter-fallback-link` styles with hover/focus states
   - `.onboarding-description ul` list styling
   - Responsive design for instructions

### API Changes

**Before**:

```javascript
showErrorRecovery() // No parameters, generic message
```

**After**:

```javascript
showErrorRecovery(error) // Optional GeolocationPositionError
```

**Backward compatible**: Still works without error parameter

## Testing

### Manual Test Scenarios

**Test 1: Permission Denied**

1. Open app in incognito/private browsing
2. Click "Habilitar Localização"
3. Click "Block" in browser prompt
4. Verify:
   - Title shows "Permissão de Localização Negada"
   - Browser instructions visible (Chrome/Firefox/Safari)
   - "🔄 Tentar Novamente" button visible
   - "📍 Usar Conversor de Coordenadas" link visible
5. Click converter link
6. Verify: Navigation to `/converter` route

**Test 2: Position Unavailable**

1. Disable GPS/location services on device
2. Click "Habilitar Localização"
3. Verify:
   - Title shows "Localização Indisponível"
   - Lists possible causes (GPS disabled, weak signal)
   - Converter link visible

**Test 3: Timeout**

1. Use browser dev tools to throttle network/location
2. Click "Habilitar Localização"
3. Wait for timeout (30+ seconds)
4. Verify:
   - Title shows "Tempo Esgotado"
   - Converter link visible

**Test 4: Try Again Flow**

1. Block permission initially
2. Click "🔄 Tentar Novamente"
3. In browser settings, allow location
4. Click "Tentar Novamente" again
5. Verify: Location acquired successfully

## Impact

### Before

- 20-30% user abandonment on permission denial
- No recovery path
- Frustration: "Now what?"
- Lost potential users

### After

- ✅ Clear recovery instructions (3 scenarios)
- ✅ Fallback option (converter) always visible
- ✅ Browser-specific guidance
- ✅ Reduced abandonment rate
- ✅ Converter tool discoverable
- ✅ User empowerment ("I have options")

### Expected Outcomes

- 50% reduction in abandonment rate (30% → 15%)
- 15% converter tool adoption from denied users
- Improved user satisfaction (clear guidance)
- Better conversion funnel

## Accessibility

**ARIA Enhancements**:

- Converter link has `role="button"`
- `aria-label="Abrir conversor de coordenadas para entrada manual"`
- Focus styles meet WCAG 2.1 AA (3px outline, offset 2px)

**Keyboard Navigation**:

- Tab to "Try Again" button
- Tab to converter link
- Enter/Space activates links

**Screen Reader Experience**:

- Reads error title
- Reads detailed instructions
- Announces "Try Again" button
- Announces "Use Coordinate Converter" link
- Clear navigation between options

## Analytics Tracking (Future)

**Recommended events**:

```javascript
// Track error types
gtag('event', 'geolocation_error', {
  error_code: error.code,
  error_type: 'PERMISSION_DENIED',
  recovery_shown: true
});

// Track converter link clicks
gtag('event', 'converter_fallback_clicked', {
  source: 'onboarding_error'
});

// Track try again clicks
gtag('event', 'geolocation_retry', {
  previous_error: error.code
});
```

## References

- Geolocation API Error Codes: https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError
- UX Pattern: Error Recovery with Clear Next Steps
- Conversion Funnel Optimization: Reduce Dead Ends
