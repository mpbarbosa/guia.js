/**
 * ReferencePlace — Re-exports ReferencePlace from paraty_geocore.js
 *
 * The canonical implementation now lives in paraty_geocore.js.
 * This file maintains the original module path for all local callers.
 *
 * @see https://github.com/mpbarbosa/paraty_geocore.js — src/core/ReferencePlace.ts
 * @module data/ReferencePlace
 * @since 0.9.0-alpha (moved to paraty_geocore in 0.12.4-alpha)
 */

export {
	ReferencePlace as default,
	ReferencePlace,
	NO_REFERENCE_PLACE,
	VALID_REF_PLACE_CLASSES,
} from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.12.10-alpha/dist/esm/index.js';
export type { OsmElement } from 'https://cdn.jsdelivr.net/gh/mpbarbosa/paraty_geocore.js@0.12.10-alpha/dist/esm/index.js';

