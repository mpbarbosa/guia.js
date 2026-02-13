# Global Error Handling System

## Overview

The Guia Turístico application includes a comprehensive global error handling system that captures all JavaScript exceptions and displays them in a user-friendly manner on both desktop and mobile devices.

## Features

### 1. **Automatic Error Capture**
- Captures all uncaught JavaScript errors
- Captures unhandled Promise rejections
- Prevents default browser error handling
- Logs errors to console for debugging

### 2. **Toast Notifications**
- Immediate visual feedback when errors occur
- Auto-dismisses after 5 seconds
- Click "Ver detalhes" to open full error panel
- Accessible with ARIA live regions

### 3. **Error Panel**
- Sliding panel from the right side
- Shows complete error history (up to 20 errors)
- Displays error details:
  - Error type (Error, Promise Rejection, etc.)
  - Error message
  - Timestamp
  - File location (if available)
  - Full stack trace (expandable)

### 4. **Access Methods**

#### Desktop
- **Keyboard Shortcut:** `Ctrl+E` (Windows/Linux) or `Cmd+E` (Mac)
- Quick access without clicking

#### Mobile & Touch Devices
- **Floating Action Button (FAB):** Red bug icon (🐛) in bottom-right corner
- Shows badge with error count
- Tap to toggle error panel
- Automatically hidden on desktop devices with keyboards

## Usage

### For End Users

#### Desktop Users

1. **When an error occurs:**
   - A red toast notification appears in the top-right corner
   - The notification shows a brief error message
   - Click "Ver detalhes" to see full details

2. **To view error history:**
   - Press `Ctrl+E` (or `Cmd+E` on Mac)
   - Or click "Ver detalhes" on any error toast
   - The error panel slides in from the right

3. **To clear errors:**
   - Open the error panel
   - Click "Limpar" button in the header

#### Mobile Users

1. **When an error occurs:**
   - A red toast notification appears at the top
   - A floating bug button (🐛) appears in the bottom-right corner
   - The button shows a badge with the number of errors

2. **To view error history:**
   - Tap the red bug button (🐛) in the bottom-right corner
   - The error panel slides in from the right side

3. **To close the panel:**
   - Tap the "✕" button in the panel header
   - Or swipe right (on some browsers)

4. **To clear errors:**
   - Open the error panel
   - Tap "Limpar" button in the header

### For Developers

#### Manual Error Reporting

```javascript
// Display a custom error
window.ErrorRecovery.displayError(
  'Título do Erro',
  'Mensagem detalhada do erro',
  {
    type: 'Custom Error',
    message: 'Detalhes completos',
    stack: 'Stack trace...',
    timestamp: new Date().toISOString()
  }
);
```

#### Show/Hide Error Panel Programmatically

```javascript
// Show error panel
window.ErrorRecovery.showErrorPanel();

// Hide error panel
window.ErrorRecovery.hideErrorPanel();

// Toggle error panel
window.ErrorRecovery.toggleErrorPanel();
```

#### Access Error History

```javascript
// Get all captured errors
const errors = window.ErrorRecovery.getErrorHistory();
console.log(`Total errors: ${errors.length}`);

// Clear error history
window.ErrorRecovery.clearErrorHistory();
```

#### Recovery Strategies

The system includes predefined recovery strategies for common errors:

```javascript
// Network error
window.ErrorRecovery.strategies.NetworkError();

// Geolocation error
window.ErrorRecovery.strategies.GeolocationError({ code: 1 });

// API error
window.ErrorRecovery.strategies.APIError({ status: 429 });
```

## Architecture

### Files

- **`src/error-recovery.js`** - Main error handling logic (305 lines)
- **`src/transitions.css`** - Error panel, toast, and FAB styles

### Components

1. **Global Event Listeners**
   - `window.addEventListener('error')` - Catches synchronous errors
   - `window.addEventListener('unhandledrejection')` - Catches async errors

2. **Error History Management**
   - Stores up to 20 most recent errors
   - FIFO queue (newest errors first)
   - Includes full stack traces and metadata

3. **UI Components**
   - Toast container (top-right corner)
   - Error panel (sliding sidebar)
   - Floating Action Button (FAB) - mobile only
   - Individual error cards with expandable details

4. **Input Handlers**
   - Keyboard handler (Ctrl+E/Cmd+E for desktop)
   - Touch handler (FAB button for mobile)

## Styling

### CSS Classes

#### Toast Notifications
- `.toast-container` - Container for toast notifications
- `.toast.error` - Individual error toast
- `.toast-details-btn` - Button to show details

#### Error Panel
- `.error-panel` - Main error panel
- `.error-panel-visible` - Panel visible state
- `.error-panel-header` - Panel header with title and actions
- `.error-panel-content` - Scrollable error list
- `.error-panel-footer` - Footer with keyboard shortcut hint
- `.error-item` - Individual error in history
- `.error-item-stack` - Expandable stack trace section

#### Floating Action Button (Mobile)
- `.error-fab` - Floating action button
- `.error-fab-badge` - Error count badge

### Color Scheme

- Error red: `#c62828`
- Dark background: `#1e1e1e`
- Code background: `#1a1a1a`
- Link blue: `#64b5f6`
- Badge red: `#ff5252`

## Testing

### Test Page

A dedicated test page is available at `src/test-error-handling.html` with buttons to trigger various error types:

- **Synchronous Errors:**
  - ReferenceError
  - TypeError
  - Custom Error

- **Asynchronous Errors:**
  - Promise Rejection
  - Async Function Error
  - setTimeout Error

### Manual Testing Steps

1. Start the web server:
   ```bash
   python3 -m http.server 9000
   ```

2. Open test page:
   ```
   http://localhost:9000/src/test-error-handling.html
   ```

3. **Desktop Testing:**
   - Click each error type button
   - Press `Ctrl+E` to toggle error panel
   - Verify toast notifications
   - Check error details and stack traces

4. **Mobile Testing:**
   - Open page on mobile device or use browser DevTools mobile emulation
   - Click error buttons
   - Tap the 🐛 FAB button in bottom-right corner
   - Verify badge shows error count
   - Check panel slides in smoothly

## Browser Compatibility

- ✅ Chrome 90+ (Desktop & Mobile)
- ✅ Firefox 88+ (Desktop & Mobile)
- ✅ Safari 14+ (Desktop & iOS)
- ✅ Edge 90+ (Desktop & Mobile)
- ✅ Samsung Internet 14+
- ✅ Opera Mobile 60+

**Requirements:**
- ES6+ support
- Modern CSS (flexbox, animations)
- `window.addEventListener` support
- Touch event support (for mobile)

## Responsive Design

### Desktop (≥768px with mouse/trackpad)
- ✅ Keyboard shortcut: Ctrl+E or Cmd+E
- ✅ Toast notifications in top-right
- ❌ FAB button hidden (not needed)

### Mobile & Tablets (<768px or touch-only)
- ❌ Keyboard shortcut unavailable
- ✅ Toast notifications full-width at top
- ✅ FAB button visible in bottom-right
- ✅ Error panel full-width overlay

### Media Queries
```css
/* Desktop: Hide FAB when keyboard available */
@media (min-width: 768px) and (pointer: fine) {
  .error-fab { display: none; }
}

/* Mobile: Full-width error panel */
@media (max-width: 600px) {
  .error-panel { width: 100%; }
}
```

## Performance

- **Minimal overhead** - Event listeners are passive
- **Memory efficient** - Limited to 20 errors max
- **No external dependencies** - Pure JavaScript
- **Fast rendering** - Optimized CSS animations
- **Touch-optimized** - Native touch events, no delays

## Accessibility

- ✅ ARIA live regions for screen readers
- ✅ Keyboard navigation support
- ✅ Touch-friendly button sizes (56x56px FAB)
- ✅ High contrast colors
- ✅ Semantic HTML structure
- ✅ Clear focus indicators
- ✅ Descriptive ARIA labels

## Future Enhancements

- [ ] Export error logs to file
- [ ] Send errors to remote logging service
- [ ] Filter errors by type/severity
- [ ] Search functionality in error panel
- [ ] User feedback submission from error panel
- [ ] Integration with browser DevTools
- [ ] Swipe gesture to open/close panel
- [ ] Haptic feedback on mobile

## Related Documentation

- Main Application: `src/index.html`
- Error Recovery: `src/error-recovery.js`
- Transitions CSS: `src/transitions.css`
- Contributing Guidelines: `.github/CONTRIBUTING.md`

---

**Version:** 0.9.0-alpha  
**Last Updated:** 2026-01-21  
**Author:** Marcelo Pereira Barbosa
