# SIDRA Integration Documentation

**Version**: 0.7.2+  
**Component**: HTMLSidraDisplayer  
**Purpose**: Display IBGE demographic data for Brazilian municipalities

## Overview

The SIDRA (Sistema IBGE de Recuperação Automática) integration provides population statistics and demographic information for Brazilian municipalities. This integration includes:

- Real-time IBGE API queries
- Offline fallback data (190KB JSON)
- Observer pattern for automatic updates
- Brazilian Portuguese localization

## Architecture

### Components
- **HTMLSidraDisplayer** (`src/html/HTMLSidraDisplayer.js`) - Display component
- **DisplayerFactory** - Factory method for SIDRA displayer creation
- **ServiceCoordinator** - Lifecycle management and observer subscriptions
- **Offline Data** (`libs/sidra/tab6579_municipios.json`) - 190KB fallback dataset

### Data Flow
1. User location changes
2. ReverseGeocoder fetches address with municipality info
3. ReverseGeocoder notifies observers with ADDRESS_FETCHED_EVENT
4. HTMLSidraDisplayer receives update
5. SIDRA API query (or offline fallback)
6. Population data displayed in Brazilian Portuguese

## Usage Example

```javascript
import HTMLSidraDisplayer from './html/HTMLSidraDisplayer.js';
import { ADDRESS_FETCHED_EVENT } from './config/defaults.js';

// Create displayer
const sidraElement = document.getElementById('dadosSidra');
const displayer = new HTMLSidraDisplayer(sidraElement);

// Subscribe to address updates
reverseGeocoder.subscribe(displayer);

// Manual update
displayer.update(addressData, standardizedAddress, ADDRESS_FETCHED_EVENT, false, null);
```

## Testing

- **Unit Tests**: `__tests__/unit/HTMLSidraDisplayer.test.js`
- **Coverage**: 100% (lines, branches, functions, statements)
- **Test Types**: Creation, observer pattern, data display, error handling

## API Endpoint

- **SIDRA API**: `https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/-6/variaveis/9324`
- **Fallback**: `libs/sidra/tab6579_municipios.json` (190KB)

## Constants

```javascript
// src/config/defaults.js
export const ADDRESS_FETCHED_EVENT = "Address fetched";
```

## Related Documentation

- [REFACTOR_ADDRESS_FETCHED_CONSTANT.md](./REFACTOR_ADDRESS_FETCHED_CONSTANT.md)
- [TEST_INFRASTRUCTURE.md](./testing/TEST_INFRASTRUCTURE.md)
