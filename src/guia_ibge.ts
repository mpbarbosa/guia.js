'use strict';

/**
 * Renders an HTML anchor link for a Brazilian state (UF) using IBGE API.
 * 
 * Creates a hyperlink to the IBGE (Brazilian Institute of Geography and Statistics)
 * API endpoint for a specific state. The link displays the state name and points
 * to the IBGE localities API for detailed state information.
 * 
 * @param nomeUF - State name in Portuguese (e.g., "São Paulo", "Rio de Janeiro")
 * @param idUF - IBGE state ID code (e.g., 35 for São Paulo, 33 for Rio de Janeiro)
 * @returns HTML anchor element string with href to IBGE API endpoint
 * 
 * @example
 * // Render link for São Paulo state
 * const link = renderUrlUFNome("São Paulo", 35);
 * // Returns: '<a href="https://servicodados.ibge.gov.br/api/v1/localidades/estados/35">São Paulo</a>'
 * 
 * @see {@link https://servicodados.ibge.gov.br/api/docs/localidades} IBGE Localities API Documentation
 * @since 0.6.0-alpha
 * @author Marcelo Pereira Barbosa
 */
function renderUrlUFNome(nomeUF: string, idUF: number | string): string {
	return `<a href="https://servicodados.ibge.gov.br/api/v1/localidades/estados/${idUF}">${nomeUF}</a>`;
}

/**
 * Module exports for IBGE integration utilities.
 * 
 * @exports renderUrlUFNome - Brazilian state link renderer
 */
export { renderUrlUFNome };
