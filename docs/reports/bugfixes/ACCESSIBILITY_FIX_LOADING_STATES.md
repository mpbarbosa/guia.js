# Accessibility Fix: Loading States Semantic Communication

**Date**: 2026-02-15  
**Issue**: Missing screen reader feedback during async operations  
**Severity**: Critical  

## Problem

Loading states were visually clear but lacked semantic attributes:

- No `aria-busy` during geocoding operations
- No screen reader announcements when content updates
- Users with screen readers had no loading feedback
- Created anxiety during longer operations (2-5 seconds for geocoding)

## Solution Implemented

### 1. Added `aria-busy` Management

**HTMLHighlightCardsDisplayer.js**:

```javascript
_setLoadingState(isLoading) {
  cards.forEach(card => {
    if (isLoading) {
      card.setAttribute('aria-busy', 'true');
      card.classList.add('skeleton-loading');
    } else {
      card.removeAttribute('aria-busy');
      card.classList.remove('skeleton-loading');
    }
  });
}
```

**Public API**:

- `showLoading()` - Call before geocoding starts
- `hideLoading()` - Called automatically by `update()`

### 2. Added `aria-live` Regions

**index.html** - Updated value elements:

```html
<div id="municipio-value" class="highlight-card-value" aria-live="polite">—</div>
<div id="bairro-value" class="highlight-card-value" aria-live="polite">—</div>
<div id="logradouro-value" class="highlight-card-value" aria-live="polite">—</div>
```

**Behavior**:

- Screen readers announce updates automatically
- Uses `polite` (non-interrupting) for location changes
- Works with both initial load and subsequent updates

### 3. Skeleton Loading Visual Feedback

**Preserved existing CSS** (`loading-states.css`):

```css
.highlight-card.skeleton-loading {
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #f8f8f8 50%,
    #f0f0f0 100%
  ) !important;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
```

## Testing

### Screen Reader Tests

**NVDA** (Windows):

1. Navigate to page with location tracking
2. Click "Obter Localização"
3. **Expected**: "Município, carregando" → "Município, São Paulo, SP"
4. **Expected**: "Bairro, carregando" → "Bairro, Consolação"

**VoiceOver** (macOS):

1. Same steps as NVDA
2. Announces "busy" state during loading
3. Announces updated values when complete

### Manual Tests

1. **Visual Loading**:
   - Skeleton shimmer appears during geocoding
   - Smooth transition to actual content

2. **Timing**:
   - Loading state shows immediately on position change
   - Cleared when address data arrives (1-3 seconds typically)

3. **Error States**:
   - If geocoding fails, loading state clears
   - Error message shown instead (has own aria-live)

## Impact

### Before

- ❌ Screen reader users: No feedback during 2-5 second delays
- ❌ Anxiety: "Is it working? Did it freeze?"
- ❌ No progress indication
- ❌ Silent updates (users didn't know content changed)

### After

- ✅ Screen readers announce "busy" during loading
- ✅ Screen readers announce new values on update
- ✅ Visual skeleton loading for sighted users
- ✅ Both semantic and visual feedback
- ✅ WCAG 2.1 Level AA compliant (4.1.3 Status Messages)

## Files Modified

1. **src/html/HTMLHighlightCardsDisplayer.js** (lines 26-38, 46-62):
   - Added `_municipioCard`, `_bairroCard`, `_logradouroCard` properties
   - Added `_setLoadingState(isLoading)` method
   - Added `showLoading()` and `hideLoading()` public methods
   - Updated `update()` to clear loading state

2. **src/index.html** (lines 590, 594, 598):
   - Added `aria-live="polite"` to value elements
   - Enables automatic screen reader announcements

## Usage Pattern

```javascript
// Before geocoding
highlightCardsDisplayer.showLoading();

// After geocoding completes
highlightCardsDisplayer.update(addressData, enderecoPadronizado);
// Loading state cleared automatically
```

## WCAG 2.1 Compliance

**Success Criterion 4.1.3 - Status Messages (Level AA)**:
> "In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus."

✅ **Compliant**:

- `aria-busy` indicates ongoing operation
- `aria-live="polite"` announces completion
- No focus stealing during updates
- Screen reader receives all status changes

## Future Enhancements

**Potential additions** (not critical, nice-to-have):

1. Progress percentage for long operations
2. Estimated time remaining (if >3 seconds)
3. "Loading..." text in card during skeleton state
4. Cancel button for long-running geocoding

**Current implementation is sufficient** for typical 1-3 second geocoding delays.

## References

- WCAG 2.1 Success Criterion 4.1.3 (Status Messages)
- ARIA 1.2: `aria-busy` attribute
- ARIA 1.2: `aria-live` regions
- MDN: ARIA live regions best practices
