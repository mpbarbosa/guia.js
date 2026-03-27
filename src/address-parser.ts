/**
 * @fileoverview Address Parser - Pure functions for parsing Nominatim address data
 * Handles Brazilian geopolitical divisions: municipality, district (distrito), and neighborhood (bairro)
 * 
 * This module is the canonical source of address parsing logic, shared via ES6 imports
 * (bundled by Vite for browser views). Consumers: src/views/converter.ts.
 * 
 * @module address-parser
 */

import type { NominatimAddress } from './types/nominatim.js';

type AddressLike = NominatimAddress | { address?: NominatimAddress } | Record<string, unknown>;

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * Extract district information from Nominatim address.
 * Districts (distritos) are administrative subdivisions of municipalities in Brazil.
 * Nominatim may return them as 'village', 'district', 'hamlet', or 'town'.
 *
 * @param address - Nominatim address object
 * @returns District name or null if not available
 */
function extractDistrito(address: AddressLike | null | undefined): string | null {
  if (!isRecord(address)) return null;
  
  const a = address as Record<string, unknown>;
  const distrito = (a.village || a.district || a.hamlet || a.town) as string | undefined;
  
  if (distrito) return distrito;
  
  if (isRecord(a.address)) {
    const nested = a.address as Record<string, unknown>;
    return (nested.village || nested.district || nested.hamlet || nested.town || null) as string | null;
  }
  
  return null;
}

/**
 * Extract neighborhood (bairro) information from Nominatim address.
 * Neighborhoods are smaller subdivisions within cities or districts.
 *
 * @param address - Nominatim address object
 * @returns Neighborhood name or null if not available
 */
function extractBairro(address: AddressLike | null | undefined): string | null {
  if (!isRecord(address)) return null;
  
  const a = address as Record<string, unknown>;
  const bairro = (a.suburb || a.neighbourhood || a.quarter || a.residential) as string | undefined;
  
  if (bairro) return bairro;
  
  if (isRecord(a.address)) {
    const nested = a.address as Record<string, unknown>;
    return (nested.suburb || nested.neighbourhood || nested.quarter || nested.residential || null) as string | null;
  }
  
  return null;
}

/**
 * Determine which location type to display based on address data.
 * Priority: If district exists without suburb, show district. Otherwise show neighborhood.
 *
 * @param address - Nominatim address object
 * @returns Location type and value
 */
function determineLocationType(address: AddressLike | null | undefined): { type: 'distrito' | 'bairro'; value: string | null } {
  const distrito = extractDistrito(address);
  const bairro = extractBairro(address);
  
  if (distrito && !bairro) {
    return { type: 'distrito', value: distrito };
  }
  
  if (bairro) {
    return { type: 'bairro', value: bairro };
  }
  
  return { type: 'bairro', value: null };
}

/**
 * Format location text for display.
 * Returns "Não disponível" if value is null or empty.
 *
 * @param value - Location value
 * @returns Formatted location text
 */
function formatLocationValue(value: string | null | undefined): string {
  if (!value || value.trim() === '') {
    return 'Não disponível';
  }
  return value;
}

export {
  extractDistrito,
  extractBairro,
  determineLocationType,
  formatLocationValue
};
