# Logging Guide

## Overview

The Guia Turístico application uses a centralized logging system with environment-aware configuration to prevent console pollution in production while maintaining comprehensive logging during development.

## Quick Start

### Using the Logger

```javascript
import { log, warn, error, debug } from './utils/logger.js';

// Info logging (development only by default)
log('Position updated', { lat: -23.5505, lon: -46.6333 });

// Warnings (visible in production)
warn('Low accuracy detected', { accuracy: 500 });

// Errors (always visible unless explicitly disabled)
error('Geolocation failed', { code: 1, message: 'Permission denied' });

// Debug logging (only when explicitly enabled)
debug('Observer notified', { observerCount: 5 });
```

## Log Levels

The logging system supports five levels in ascending order of verbosity:

| Level   | Value | Description | Default Environment |
|---------|-------|-------------|---------------------|
| `none`  | 0     | No logging at all | Manual only |
| `error` | 1     | Errors only | Production |
| `warn`  | 2     | Warnings and errors | - |
| `log`   | 3     | Info, warnings, and errors | Development |
| `debug` | 4     | All messages including debug | Manual only |

## Environment Configuration

### Automatic Detection

The logger automatically detects the environment:

**Production Environment** (log level = 'error'):
- `NODE_ENV === 'production'` (Node.js)
- `hostname !== 'localhost'` and not `127.0.0.1` (Browser)

**Development Environment** (log level = 'log'):
- All other cases

### Manual Configuration

#### Node.js Environment Variable

```bash
# Set log level for Node.js
export GUIA_LOG_LEVEL=debug
npm start

# Or inline
GUIA_LOG_LEVEL=error npm test
```

#### Browser localStorage

```javascript
// In browser console
localStorage.setItem('GUIA_LOG_LEVEL', 'debug');
// Reload page to apply

// Check current setting
localStorage.getItem('GUIA_LOG_LEVEL');

// Remove setting (use defaults)
localStorage.removeItem('GUIA_LOG_LEVEL');
```

#### Runtime Configuration

```javascript
import { setLogLevel } from './utils/logger.js';

// Set to error-only mode
setLogLevel({ level: 'error' });

// Enable debug mode
setLogLevel({ level: 'debug' });

// Disable all logging
setLogLevel({ enabled: false });

// Re-enable with default level
setLogLevel({ enabled: true });
```

## Usage Guidelines

### When to Use Each Level

#### `error()` - Critical Issues
Use for errors that require attention even in production:
- API failures that affect core functionality
- Invalid data that breaks application flow
- Critical security issues
- Unrecoverable errors

```javascript
error('Failed to fetch location', { 
  code: error.code, 
  message: error.message 
});
```

#### `warn()` - Non-Critical Issues
Use for issues that should be visible in production but don't break functionality:
- Deprecated API usage
- Low accuracy readings
- Fallback behavior triggered
- Configuration issues

```javascript
warn('Using fallback voice, preferred voice not available');
```

#### `log()` - General Information
Use for development information (hidden in production by default):
- State changes
- API responses
- Component initialization
- Normal operation flow

```javascript
log('Position manager initialized', { 
  trackingInterval: 50000 
});
```

#### `debug()` - Verbose Debugging
Use for detailed debugging (only when explicitly enabled):
- Observer notifications
- Internal state changes
- Performance measurements
- Detailed flow tracing

```javascript
debug('Notifying observers', { 
  observerCount: observers.length, 
  eventType: 'position-change' 
});
```

## Migration from Direct Console Calls

### Before (Direct Console)

```javascript
// ❌ BAD - Always logs in production
console.log('Position updated:', position);
console.warn('Low accuracy:', accuracy);
console.error('Failed:', error);
```

### After (Logger Utility)

```javascript
// ✅ GOOD - Environment aware
import { log, warn, error } from './utils/logger.js';

log('Position updated:', position);
warn('Low accuracy:', accuracy);
error('Failed:', error);
```

## Configuration Examples

### Scenario 1: Production Deployment

```bash
# Only show errors in production
NODE_ENV=production node src/app.js
# Log level automatically set to 'error'
```

### Scenario 2: Development with Debug

```bash
# Show all logging including debug
GUIA_LOG_LEVEL=debug npm run dev
```

### Scenario 3: Testing with Minimal Logging

```bash
# Only show errors during tests
GUIA_LOG_LEVEL=error npm test
```

### Scenario 4: Completely Silent

```bash
# No logging at all
GUIA_LOG_LEVEL=none npm start
```

## Checking Current Configuration

```javascript
import { getLogLevel } from './utils/logger.js';

const config = getLogLevel();
console.log(config);
// {
//   level: 3,
//   levelName: 'log',
//   enabled: true,
//   timestamp: true,
//   isProduction: false
// }
```

## Best Practices

### DO ✅

1. **Use appropriate log levels**
   ```javascript
   error('Critical failure');  // For critical issues
   warn('Deprecated usage');   // For warnings
   log('State changed');       // For info
   debug('Internal details');  // For debugging
   ```

2. **Include context in messages**
   ```javascript
   log('Position updated', { lat, lon, accuracy });
   error('API call failed', { url, status, error });
   ```

3. **Use the centralized logger**
   ```javascript
   import { log, warn, error } from './utils/logger.js';
   ```

### DON'T ❌

1. **Don't use direct console calls**
   ```javascript
   // ❌ BAD
   console.log('message');
   console.warn('warning');
   console.error('error');
   ```

2. **Don't log sensitive data**
   ```javascript
   // ❌ BAD
   log('User data', { password, creditCard });
   ```

3. **Don't log in tight loops without guards**
   ```javascript
   // ❌ BAD
   array.forEach(item => {
     log('Processing', item); // Floods console
   });
   
   // ✅ GOOD
   log('Processing array', { count: array.length });
   array.forEach(item => {
     debug('Processing item', item); // Only if debug enabled
   });
   ```

## Testing

The logger respects test environments and provides consistent output:

```javascript
// In tests, logger outputs normally but can be controlled
import { setLogLevel } from '../src/utils/logger.js';

beforeAll(() => {
  // Silence logs during tests
  setLogLevel({ level: 'none' });
});

afterAll(() => {
  // Restore default
  setLogLevel({ level: 'log' });
});
```

## Implementation Status

### ✅ Completed
- Enhanced logger with environment detection
- Log level configuration (5 levels)
- Runtime configuration API
- Browser localStorage support
- Node.js environment variable support
- Automatic production detection

### ⚠️ In Progress
- Migration of direct console calls (29 files, 158 calls)
- Integration with all modules

### 📋 Remaining Work
- Add ESLint rule to prevent direct console usage
- Create migration script for automated conversion
- Add logging configuration to initialization flow

## Troubleshooting

### Logs Not Appearing

**Check log level:**
```javascript
import { getLogLevel } from './utils/logger.js';
console.log(getLogLevel());
```

**Verify environment:**
```bash
echo $NODE_ENV
echo $GUIA_LOG_LEVEL
```

**Reset configuration:**
```javascript
// Browser
localStorage.removeItem('GUIA_LOG_LEVEL');

// Node.js
unset GUIA_LOG_LEVEL
```

### Too Much Logging

**Set to error-only:**
```bash
GUIA_LOG_LEVEL=error npm start
```

**Or completely disable:**
```bash
GUIA_LOG_LEVEL=none npm start
```

## See Also

- `src/utils/logger.js` - Logger implementation
- `src/config/defaults.js` - Application configuration
- `docs/CONTRIBUTING.md` - Contribution guidelines
