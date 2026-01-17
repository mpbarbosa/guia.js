/**
 * @fileoverview Address Parser - Pure functions for parsing Nominatim address data
 * Handles Brazilian geopolitical divisions: municipality, district (distrito), and neighborhood (bairro)
 * 
 * This module serves as the source of truth for address parsing logic.
 * The same logic is duplicated in browser views (home.js, converter.js) due to
 * CommonJS/ES6 module incompatibility without a build step.
 * 
 * @module address-parser
 */

/**
 * Extract district information from Nominatim address
 * Districts (distritos) are administrative subdivisions of municipalities in Brazil
 * Nominatim may return them as 'village', 'district', 'hamlet', or 'town' 
 * 
 * @param {Object} address - Nominatim address object
 * @returns {string|null} District name or null if not available
 * @pure
 */
function extractDistrito(address) {
  if (!address) return null;
  
  // Check direct properties first
  const distrito = address.village 
    || address.district 
    || address.hamlet
    || address.town;
  
  if (distrito) return distrito;
  
  // Check nested address object
  if (address.address) {
    return address.address.village 
      || address.address.district 
      || address.address.hamlet
      || address.address.town 
      || null;
  }
  
  return null;
}

/**
 * Extract neighborhood (bairro) information from Nominatim address
 * Neighborhoods are smaller subdivisions within cities or districts
 * 
 * @param {Object} address - Nominatim address object  
 * @returns {string|null} Neighborhood name or null if not available
 * @pure
 */
function extractBairro(address) {
  if (!address) return null;
  
  // Check direct properties first
  const bairro = address.suburb 
    || address.neighbourhood 
    || address.quarter 
    || address.residential;
  
  if (bairro) return bairro;
  
  // Check nested address object
  if (address.address) {
    return address.address.suburb 
      || address.address.neighbourhood 
      || address.address.quarter 
      || address.address.residential 
      || null;
  }
  
  return null;
}

/**
 * Determine which location type to display based on address data
 * Priority: If district exists without suburb, show district. Otherwise show neighborhood.
 * 
 * @param {Object} address - Nominatim address object
 * @returns {{type: 'distrito'|'bairro', value: string|null}} Location type and value
 * @pure
 */
function determineLocationType(address) {
  const distrito = extractDistrito(address);
  const bairro = extractBairro(address);
  
  // If we have a district but no neighborhood, show district
  // This handles cases like Milho Verde (district) where there's no bairro subdivision
  if (distrito && !bairro) {
    return { type: 'distrito', value: distrito };
  }
  
  // If we have a neighborhood, show it (more specific than district)
  if (bairro) {
    return { type: 'bairro', value: bairro };
  }
  
  // No location subdivision available
  return { type: 'bairro', value: null };
}

/**
 * Format location text for display
 * Returns "Não disponível" if value is null or empty
 * 
 * @param {string|null} value - Location value
 * @returns {string} Formatted location text
 * @pure
 */
function formatLocationValue(value) {
  if (!value || value.trim() === '') {
    return 'Não disponível';
  }
  return value;
}

// ES6 exports for Jest testing
export {
  extractDistrito,
  extractBairro,
  determineLocationType,
  formatLocationValue
};