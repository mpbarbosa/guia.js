/**
 * Speech text builder for Brazilian Portuguese address announcements.
 * 
 * This module provides text formatting logic for speech synthesis announcements
 * in Brazilian Portuguese travel guide applications. It builds natural-language
 * speech text from Brazilian address data for different types of location changes:
 * street (logradouro), neighborhood (bairro), municipality (municipio), and full
 * address announcements.
 * 
 * **Design Pattern**: Pure Functions (no side effects)
 * - All methods are stateless and side-effect free
 * - Takes BrazilianStandardAddress as input
 * - Returns formatted Brazilian Portuguese strings
 * - No dependencies on DOM, UI, or external state
 * 
 * **Brazilian Portuguese Features**:
 * - Natural speech flow with appropriate prepositions
 * - Hierarchical address information (specific to general)
 * - Context-aware announcements (entry, exit, change)
 * - Graceful handling of incomplete address data
 * 
 * **Use Cases**:
 * 1. **Real-time navigation**: Announce location changes while driving/walking
 * 2. **Accessibility**: Provide location context for visually impaired users
 * 3. **Travel guidance**: Inform users about geographic changes
 * 4. **Periodic updates**: Regular location announcements at intervals
 * 
 * @module SpeechTextBuilder
 * @since 0.11.0-alpha
 * @author Marcelo Pereira Barbosa
 * 
 * @example
 * // Basic usage
 * import { SpeechTextBuilder } from './speech/SpeechTextBuilder.js';
 * 
 * const builder = new SpeechTextBuilder();
 * const address = new BrazilianStandardAddress({
 *   logradouro: 'Rua das Flores',
 *   numero: '123',
 *   bairro: 'Centro',
 *   municipio: 'São Paulo'
 * });
 * 
 * // Build full address announcement
 * const text = builder.buildTextToSpeech(address);
 * // Returns: "Você está em Rua das Flores, 123, Centro, São Paulo"
 * 
 * @example
 * // Municipality change with context
 * const changeDetails = {
 *   previous: { municipio: 'Santos' },
 *   current: { municipio: 'São Paulo' }
 * };
 * 
 * const text = builder.buildTextToSpeechMunicipio(address, changeDetails);
 * // Returns: "Você saiu de Santos e entrou em São Paulo"
 */

/**
 * Speech text builder for Brazilian Portuguese address announcements.
 * 
 * Provides pure functions for building speech text from Brazilian address data.
 * All methods are stateless, deterministic, and have no side effects, making
 * them easy to test and compose.
 * 
 * **Method Categories**:
 * 1. **Component Changes**: buildTextToSpeechLogradouro, buildTextToSpeechBairro, buildTextToSpeechMunicipio
 * 2. **Full Address**: buildTextToSpeech for complete location context
 * 
 * @class SpeechTextBuilder
 * @since 0.11.0-alpha
 */
export class SpeechTextBuilder {
	/**
	 * Creates a new SpeechTextBuilder instance.
	 * 
	 * This is a stateless builder, so the constructor has no parameters
	 * and no internal state to initialize. All methods are pure functions
	 * that operate only on their input parameters.
	 * 
	 * @constructor
	 * @since 0.11.0-alpha
	 * 
	 * @example
	 * const builder = new SpeechTextBuilder();
	 */
	constructor() {
		// Stateless builder - no initialization needed
		// All methods are pure functions
		Object.freeze(this);
	}

	/**
	 * Builds text for logradouro (street) change announcements.
	 * 
	 * Creates appropriately formatted Brazilian Portuguese text for street-level
	 * address changes. Uses the complete street address (logradouroCompleto)
	 * which includes street type, name, and number when available.
	 * 
	 * **Brazilian Portuguese Formatting**:
	 * - Uses "Você está agora em" for natural speech flow
	 * - Includes complete street information (tipo + logradouro + número)
	 * - Handles missing information gracefully with fallback message
	 * 
	 * **Pure Function**: No side effects, deterministic output
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current standardized address
	 * @returns {string} Formatted speech text for logradouro change
	 * @since 0.11.0-alpha
	 * 
	 * @example
	 * const builder = new SpeechTextBuilder();
	 * const address = new BrazilianStandardAddress({
	 *   logradouro: 'Rua das Flores',
	 *   numero: '123'
	 * });
	 * 
	 * const text = builder.buildTextToSpeechLogradouro(address);
	 * // Returns: "Você está agora em Rua das Flores, 123"
	 * 
	 * @example
	 * // Handles missing address gracefully
	 * const text = builder.buildTextToSpeechLogradouro(null);
	 * // Returns: "Nova localização detectada"
	 */
	buildTextToSpeechLogradouro(currentAddress: any): string {
		if (!currentAddress || !currentAddress.logradouro) {
			return "Nova localização detectada";
		}
		return `Você está agora em ${currentAddress.logradouroCompleto()}`;
	}

	/**
	 * Builds text for bairro (neighborhood) change announcements.
	 * 
	 * Creates appropriately formatted Brazilian Portuguese text for neighborhood
	 * changes. Uses "bairroCompleto" method to include neighborhood type and name
	 * when available, providing natural speech flow for Brazilian users.
	 * 
	 * **Brazilian Portuguese Formatting**:
	 * - Uses "Você entrou no bairro" for natural entrance notification
	 * - Includes complete neighborhood information when available
	 * - Handles missing information with appropriate fallback message
	 * 
	 * **Pure Function**: No side effects, deterministic output
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current standardized address
	 * @returns {string} Formatted speech text for bairro change
	 * @since 0.11.0-alpha
	 * 
	 * @example
	 * const builder = new SpeechTextBuilder();
	 * const address = new BrazilianStandardAddress({
	 *   bairro: 'Centro'
	 * });
	 * 
	 * const text = builder.buildTextToSpeechBairro(address);
	 * // Returns: "Você entrou no bairro Centro"
	 * 
	 * @example
	 * // Handles missing neighborhood gracefully
	 * const text = builder.buildTextToSpeechBairro(null);
	 * // Returns: "Novo bairro detectado"
	 */
	buildTextToSpeechBairro(currentAddress: any): string {
		if (!currentAddress || !currentAddress.bairro) {
			return "Novo bairro detectado";
		}
		return `Você entrou no bairro ${currentAddress.bairroCompleto()}`;
	}

	/**
	 * Builds text for municipio (municipality) change announcements.
	 * 
	 * Creates appropriately formatted Brazilian Portuguese text for municipality
	 * changes. When change details are available, includes information about the
	 * previous municipality for a more informative announcement. This is particularly
	 * useful for travel guide applications where users are moving between cities.
	 * 
	 * **Brazilian Portuguese Formatting**:
	 * - Uses "Você saiu de X e entrou em Y" when previous municipality known
	 * - Falls back to "Você entrou no município de X" for simple announcements
	 * - Handles missing information with appropriate fallback message
	 * 
	 * **Change Details Support**:
	 * - Utilizes previous municipality information when available
	 * - Provides context for inter-city travel scenarios
	 * - Graceful degradation when change details unavailable
	 * 
	 * **Pure Function**: No side effects, deterministic output
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current standardized address
	 * @param {Object} [changeDetails] - Details about the municipality change
	 * @param {Object} [changeDetails.previous] - Previous municipality info
	 * @param {string} [changeDetails.previous.municipio] - Previous municipality name
	 * @param {Object} [changeDetails.current] - Current municipality info
	 * @param {string} [changeDetails.current.municipio] - Current municipality name
	 * @returns {string} Formatted speech text for municipio change
	 * @since 0.11.0-alpha
	 * 
	 * @example
	 * const builder = new SpeechTextBuilder();
	 * const address = new BrazilianStandardAddress({
	 *   municipio: 'São Paulo'
	 * });
	 * 
	 * const changeDetails = {
	 *   previous: { municipio: 'Santos' },
	 *   current: { municipio: 'São Paulo' }
	 * };
	 * 
	 * const text = builder.buildTextToSpeechMunicipio(address, changeDetails);
	 * // Returns: "Você saiu de Santos e entrou em São Paulo"
	 * 
	 * @example
	 * // Simple municipality change without previous info
	 * const text = builder.buildTextToSpeechMunicipio(address);
	 * // Returns: "Você entrou no município de São Paulo"
	 */
	buildTextToSpeechMunicipio(currentAddress: any, changeDetails?: { previous?: { municipio?: string }; current?: { municipio?: string } }): string {
		if (!currentAddress || !currentAddress.municipio) {
			return "Novo município detectado";
		}

		// If we have changeDetails with previous municipality, include it in the message
		if (changeDetails && changeDetails.previous && changeDetails.previous.municipio) {
			return `Você saiu de ${changeDetails.previous.municipio} e entrou em ${currentAddress.municipio}`;
		}

		// Fallback to simple message if no previous municipality info
		return `Você entrou no município de ${currentAddress.municipio}`;
	}

	/**
	 * Builds text for full address announcements.
	 * 
	 * Creates comprehensive Brazilian Portuguese text for complete address
	 * announcements. This method is used for periodic full address updates
	 * (every 50 seconds) and provides complete location context to users.
	 * 
	 * **Address Hierarchy Processing**:
	 * 1. Street level: "Você está em [logradouro], [bairro], [municipio]"
	 * 2. Neighborhood level: "Você está em bairro [bairro], [municipio]"
	 * 3. Municipality level: "Você está em [municipio]"
	 * 4. Fallback: "Localização detectada, mas endereço não disponível"
	 * 
	 * **Brazilian Portuguese Formatting**:
	 * - Natural speech flow with appropriate prepositions
	 * - Hierarchical address information from specific to general
	 * - Graceful handling of incomplete address data
	 * 
	 * **Pure Function**: No side effects, deterministic output
	 * 
	 * @param {BrazilianStandardAddress} currentAddress - Current standardized address
	 * @returns {string} Formatted speech text for full address
	 * @since 0.11.0-alpha
	 * 
	 * @example
	 * const builder = new SpeechTextBuilder();
	 * const address = new BrazilianStandardAddress({
	 *   logradouro: 'Rua das Flores',
	 *   numero: '123',
	 *   bairro: 'Centro',
	 *   municipio: 'São Paulo'
	 * });
	 * 
	 * const text = builder.buildTextToSpeech(address);
	 * // Returns: "Você está em Rua das Flores, 123, Centro, São Paulo"
	 * 
	 * @example
	 * // Handles partial address information
	 * const partialAddress = new BrazilianStandardAddress({
	 *   bairro: 'Copacabana',
	 *   municipio: 'Rio de Janeiro'
	 * });
	 * 
	 * const text = builder.buildTextToSpeech(partialAddress);
	 * // Returns: "Você está em bairro Copacabana, Rio de Janeiro"
	 */
	buildTextToSpeech(currentAddress: any): string {
		if (!currentAddress) {
			return "Localização não disponível";
		}
		
		let speechText = "Você está em ";

		if (currentAddress.logradouro) {
			speechText += currentAddress.logradouroCompleto();
			if (currentAddress.bairro) {
				speechText += `, ${currentAddress.bairroCompleto()}`;
			}
			if (currentAddress.municipio) {
				speechText += `, ${currentAddress.municipio}`;
			}
		} else if (currentAddress.bairro) {
			speechText += `bairro ${currentAddress.bairroCompleto()}`;
			if (currentAddress.municipio) {
				speechText += `, ${currentAddress.municipio}`;
			}
		} else if (currentAddress.municipio) {
			speechText += currentAddress.municipio;
		} else {
			speechText = "Localização detectada, mas endereço não disponível";
		}

		return speechText;
	}

	/**
	 * Returns a string representation of this builder.
	 * 
	 * Provides a human-readable string representation for debugging purposes.
	 * 
	 * @returns {string} String representation
	 * @since 0.11.0-alpha
	 * 
	 * @example
	 * const builder = new SpeechTextBuilder();
	 * console.log(builder.toString());
	 * // Output: "SpeechTextBuilder"
	 */
	toString(): string {
		return this.constructor.name;
	}
}

export default SpeechTextBuilder;
