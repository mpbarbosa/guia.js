/**
 * Comprehensive Integration Test Suite for PositionManager + HTMLAddressDisplayer
 * 
 * Tests the complete integration between:
 * - PositionManager (position state management)
 * - ReverseGeocoder (address lookup service)
 * - HTMLAddressDisplayer (address rendering)
 * 
 * Integration Test Scenarios:
 * 1. Address display when position updates
 * 2. Brazilian address standardization
 * 3. Municipio and bairro change detection
 * 4. Loading and error state handling
 * 5. Multiple address observers
 * 6. Real-world geocoding scenarios
 * 7. Address component extraction
 * 8. Portuguese localization
 * 
 * @author Marcelo Pereira Barbosa
 * @since 0.7.0-alpha
 */

import { jest } from '@jest/globals';
import PositionManager from '../../src/core/PositionManager.js';
import HTMLAddressDisplayer from '../../src/html/HTMLAddressDisplayer.js';

// Mock DOM environment
global.document = undefined;

// Mock BrazilianStandardAddress
class MockBrazilianStandardAddress {
	constructor(data = {}) {
		this.logradouro = data.logradouro || null;
		this.numero = data.numero || null;
		this.complemento = data.complemento || null;
		this.bairro = data.bairro || null;
		this.municipio = data.municipio || null;
		this.uf = data.uf || null;
		this.cep = data.cep || null;
	}
	
	enderecoCompleto() {
		const parts = [];
		if (this.logradouro) parts.push(this.logradouro);
		if (this.numero) parts.push(this.numero);
		if (this.bairro) parts.push(this.bairro);
		if (this.municipio) parts.push(this.municipio);
		if (this.uf) parts.push(this.uf);
		if (this.cep) parts.push(`CEP ${this.cep}`);
		return parts.join(', ');
	}
	
	toString() {
		return this.enderecoCompleto();
	}
}

describe('PositionManager + HTMLAddressDisplayer Integration', () => {
	let positionManager;
	let mockElement;
	let addressDisplayer;
	let mockStandardizedElement;

	beforeEach(() => {
		// Reset singleton instance before each test
		PositionManager.instance = null;
		
		// Create mock DOM elements
		mockElement = { innerHTML: '', id: 'address-display' };
		mockStandardizedElement = { innerHTML: '', id: 'standardized-address' };
		
		// Get fresh PositionManager instance
		positionManager = PositionManager.getInstance();
		
		// Create address displayer
		addressDisplayer = new HTMLAddressDisplayer(mockElement, mockStandardizedElement);
	});

	describe('Basic Address Display Integration', () => {
		it('should display address when position updates', () => {
			// Mock address data (OpenStreetMap format)
			const addressData = {
				display_name: 'Rua das Flores, 123, Centro, Serro, Minas Gerais, Brasil',
				address: {
					road: 'Rua das Flores',
					house_number: '123',
					neighbourhood: 'Centro',
					municipality: 'Serro',
					state: 'Minas Gerais',
					country: 'Brasil',
					postcode: '39150-000'
				}
			};
			
			// Mock standardized address
			const standardizedAddress = new MockBrazilianStandardAddress({
				logradouro: 'Rua das Flores',
				numero: '123',
				bairro: 'Centro',
				municipio: 'Serro',
				uf: 'MG',
				cep: '39150-000'
			});
			
			// Update with address data
			addressDisplayer.update(
				addressData,
				standardizedAddress,
				'PositionManager updated',
				false,
				null
			);
			
			// Verify address is displayed
			expect(mockElement.innerHTML).toContain('Rua das Flores');
			expect(mockElement.innerHTML).toContain('Centro');
			expect(mockElement.innerHTML).toContain('Serro');
			expect(mockElement.innerHTML).toContain('Minas Gerais');
		});

		it('should handle loading state with Portuguese message', () => {
			addressDisplayer.update(null, null, 'PositionManager updated', true, null);
			
			expect(mockElement.innerHTML).toContain('Carregando endereço');
			expect(mockElement.innerHTML).toContain('loading');
		});

		it('should handle error state with Portuguese message', () => {
			const error = { message: 'Serviço de geocodificação indisponível' };
			
			addressDisplayer.update(null, null, 'PositionManager updated', false, error);
			
			expect(mockElement.innerHTML).toContain('Erro ao carregar endereço');
			expect(mockElement.innerHTML).toContain('geocodificação indisponível');
			expect(mockElement.innerHTML).toContain('error');
		});

		it('should not update when element is null', () => {
			const nullDisplayer = new HTMLAddressDisplayer(null);
			
			// Should not throw error
			expect(() => {
				nullDisplayer.update({}, null, 'PositionManager updated', false, null);
			}).not.toThrow();
		});
	});

	describe('Brazilian Address Standardization', () => {
		it('should display standardized Brazilian address format', () => {
			const addressData = {
				display_name: 'Milho Verde, Serro, Minas Gerais, Brasil',
				address: {
					village: 'Milho Verde',
					municipality: 'Serro',
					state: 'Minas Gerais',
					country: 'Brasil'
				}
			};
			
			const standardizedAddress = new MockBrazilianStandardAddress({
				logradouro: null,
				numero: null,
				bairro: 'Milho Verde',
				municipio: 'Serro',
				uf: 'MG',
				cep: null
			});
			
			addressDisplayer.update(
				addressData,
				standardizedAddress,
				'PositionManager updated',
				false,
				null
			);
			
			expect(mockElement.innerHTML).toContain('Milho Verde');
			expect(mockElement.innerHTML).toContain('Serro');
		});

		it('should handle complete address with all components', () => {
			const addressData = {
				display_name: 'Av. Afonso Pena, 1500, Centro, Belo Horizonte, MG, 30130-009',
				address: {
					road: 'Avenida Afonso Pena',
					house_number: '1500',
					neighbourhood: 'Centro',
					city: 'Belo Horizonte',
					state: 'Minas Gerais',
					postcode: '30130-009',
					country: 'Brasil'
				}
			};
			
			const standardizedAddress = new MockBrazilianStandardAddress({
				logradouro: 'Av. Afonso Pena',
				numero: '1500',
				bairro: 'Centro',
				municipio: 'Belo Horizonte',
				uf: 'MG',
				cep: '30130-009'
			});
			
			addressDisplayer.update(
				addressData,
				standardizedAddress,
				'PositionManager updated',
				false,
				null
			);
			
			// Verify all components are present
			expect(mockElement.innerHTML).toContain('Afonso Pena');
			expect(mockElement.innerHTML).toContain('1500');
			expect(mockElement.innerHTML).toContain('Centro');
			expect(mockElement.innerHTML).toContain('Belo Horizonte');
		});

		it('should handle rural addresses without street numbers', () => {
			const addressData = {
				display_name: 'Zona Rural, Serro, Minas Gerais, Brasil',
				address: {
					village: 'Zona Rural',
					municipality: 'Serro',
					state: 'Minas Gerais',
					country: 'Brasil'
				}
			};
			
			const standardizedAddress = new MockBrazilianStandardAddress({
				logradouro: null,
				numero: null,
				bairro: 'Zona Rural',
				municipio: 'Serro',
				uf: 'MG',
				cep: null
			});
			
			addressDisplayer.update(
				addressData,
				standardizedAddress,
				'PositionManager updated',
				false,
				null
			);
			
			expect(mockElement.innerHTML).toContain('Zona Rural');
			expect(mockElement.innerHTML).toContain('Serro');
		});
	});

	describe('Municipio and Bairro Context', () => {
		it('should display municipio changes in address', () => {
			// First address in Serro
			const address1 = {
				display_name: 'Milho Verde, Serro, MG, Brasil',
				address: {
					village: 'Milho Verde',
					municipality: 'Serro',
					state: 'Minas Gerais',
					country: 'Brasil'
				}
			};
			
			const standardized1 = new MockBrazilianStandardAddress({
				bairro: 'Milho Verde',
				municipio: 'Serro',
				uf: 'MG'
			});
			
			addressDisplayer.update(address1, standardized1, 'PositionManager updated', false, null);
			expect(mockElement.innerHTML).toContain('Serro');
			
			// Second address in Diamantina
			const address2 = {
				display_name: 'Centro, Diamantina, MG, Brasil',
				address: {
					neighbourhood: 'Centro',
					city: 'Diamantina',
					state: 'Minas Gerais',
					country: 'Brasil'
				}
			};
			
			const standardized2 = new MockBrazilianStandardAddress({
				bairro: 'Centro',
				municipio: 'Diamantina',
				uf: 'MG'
			});
			
			addressDisplayer.update(address2, standardized2, 'PositionManager updated', false, null);
			expect(mockElement.innerHTML).toContain('Diamantina');
		});

		it('should display bairro changes within same municipio', () => {
			// First bairro - Centro
			const address1 = {
				display_name: 'Centro, Serro, MG, Brasil',
				address: {
					neighbourhood: 'Centro',
					municipality: 'Serro',
					state: 'Minas Gerais',
					country: 'Brasil'
				}
			};
			
			const standardized1 = new MockBrazilianStandardAddress({
				bairro: 'Centro',
				municipio: 'Serro',
				uf: 'MG'
			});
			
			addressDisplayer.update(address1, standardized1, 'PositionManager updated', false, null);
			const html1 = mockElement.innerHTML;
			expect(html1).toContain('Centro');
			
			// Second bairro - São Sebastião
			const address2 = {
				display_name: 'São Sebastião, Serro, MG, Brasil',
				address: {
					neighbourhood: 'São Sebastião',
					municipality: 'Serro',
					state: 'Minas Gerais',
					country: 'Brasil'
				}
			};
			
			const standardized2 = new MockBrazilianStandardAddress({
				bairro: 'São Sebastião',
				municipio: 'Serro',
				uf: 'MG'
			});
			
			addressDisplayer.update(address2, standardized2, 'PositionManager updated', false, null);
			expect(mockElement.innerHTML).toContain('São Sebastião');
		});

		it('should handle state (UF) changes', () => {
			// Address in Minas Gerais
			const addressMG = {
				display_name: 'Serro, Minas Gerais, Brasil',
				address: {
					municipality: 'Serro',
					state: 'Minas Gerais',
					country: 'Brasil'
				}
			};
			
			const standardizedMG = new MockBrazilianStandardAddress({
				municipio: 'Serro',
				uf: 'MG'
			});
			
			addressDisplayer.update(addressMG, standardizedMG, 'PositionManager updated', false, null);
			expect(mockElement.innerHTML).toContain('Serro');
			
			// Address in Rio de Janeiro
			const addressRJ = {
				display_name: 'Centro, Rio de Janeiro, RJ, Brasil',
				address: {
					neighbourhood: 'Centro',
					city: 'Rio de Janeiro',
					state: 'Rio de Janeiro',
					country: 'Brasil'
				}
			};
			
			const standardizedRJ = new MockBrazilianStandardAddress({
				bairro: 'Centro',
				municipio: 'Rio de Janeiro',
				uf: 'RJ'
			});
			
			addressDisplayer.update(addressRJ, standardizedRJ, 'PositionManager updated', false, null);
			expect(mockElement.innerHTML).toContain('Rio de Janeiro');
		});
	});

	describe('Real-World Geocoding Scenarios', () => {
		it('should handle Milho Verde village address', () => {
			const address = {
				display_name: 'Milho Verde, Serro, Minas Gerais, 39150-000, Brasil',
				address: {
					village: 'Milho Verde',
					municipality: 'Serro',
					state: 'Minas Gerais',
					postcode: '39150-000',
					country: 'Brasil'
				}
			};
			
			const standardized = new MockBrazilianStandardAddress({
				bairro: 'Milho Verde',
				municipio: 'Serro',
				uf: 'MG',
				cep: '39150-000'
			});
			
			addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			
			expect(mockElement.innerHTML).toContain('Milho Verde');
			expect(mockElement.innerHTML).toContain('Serro');
			expect(mockElement.innerHTML).toContain('39150-000');
		});

		it('should handle historic city addresses (Diamantina)', () => {
			const address = {
				display_name: 'Rua Direita, 10, Centro, Diamantina, MG, Brasil',
				address: {
					road: 'Rua Direita',
					house_number: '10',
					neighbourhood: 'Centro',
					city: 'Diamantina',
					state: 'Minas Gerais',
					country: 'Brasil'
				}
			};
			
			const standardized = new MockBrazilianStandardAddress({
				logradouro: 'Rua Direita',
				numero: '10',
				bairro: 'Centro',
				municipio: 'Diamantina',
				uf: 'MG'
			});
			
			addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			
			expect(mockElement.innerHTML).toContain('Rua Direita');
			expect(mockElement.innerHTML).toContain('Diamantina');
			expect(mockElement.innerHTML).toContain('Centro');
		});

		it('should handle metropolitan addresses (Belo Horizonte)', () => {
			const address = {
				display_name: 'Praça da Liberdade, Savassi, Belo Horizonte, MG, Brasil',
				address: {
					road: 'Praça da Liberdade',
					neighbourhood: 'Savassi',
					city: 'Belo Horizonte',
					state: 'Minas Gerais',
					postcode: '30140-000',
					country: 'Brasil'
				}
			};
			
			const standardized = new MockBrazilianStandardAddress({
				logradouro: 'Praça da Liberdade',
				bairro: 'Savassi',
				municipio: 'Belo Horizonte',
				uf: 'MG',
				cep: '30140-000'
			});
			
			addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			
			expect(mockElement.innerHTML).toContain('Praça da Liberdade');
			expect(mockElement.innerHTML).toContain('Savassi');
			expect(mockElement.innerHTML).toContain('Belo Horizonte');
		});

		it('should handle coastal addresses (Rio de Janeiro)', () => {
			const address = {
				display_name: 'Av. Atlântica, 1702, Copacabana, Rio de Janeiro, RJ, Brasil',
				address: {
					road: 'Avenida Atlântica',
					house_number: '1702',
					neighbourhood: 'Copacabana',
					city: 'Rio de Janeiro',
					state: 'Rio de Janeiro',
					postcode: '22021-001',
					country: 'Brasil'
				}
			};
			
			const standardized = new MockBrazilianStandardAddress({
				logradouro: 'Av. Atlântica',
				numero: '1702',
				bairro: 'Copacabana',
				municipio: 'Rio de Janeiro',
				uf: 'RJ',
				cep: '22021-001'
			});
			
			addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			
			expect(mockElement.innerHTML).toContain('Atlântica');
			expect(mockElement.innerHTML).toContain('Copacabana');
			expect(mockElement.innerHTML).toContain('Rio de Janeiro');
		});
	});

	describe('Address Component Extraction', () => {
		it('should extract street name (logradouro)', () => {
			const address = {
				display_name: 'Rua XV de Novembro, 500, Centro',
				address: {
					road: 'Rua XV de Novembro',
					house_number: '500',
					neighbourhood: 'Centro'
				}
			};
			
			const standardized = new MockBrazilianStandardAddress({
				logradouro: 'Rua XV de Novembro',
				numero: '500',
				bairro: 'Centro'
			});
			
			addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			
			expect(mockElement.innerHTML).toContain('XV de Novembro');
		});

		it('should extract house number (numero)', () => {
			const address = {
				display_name: 'Rua das Flores, 123',
				address: {
					road: 'Rua das Flores',
					house_number: '123'
				}
			};
			
			const standardized = new MockBrazilianStandardAddress({
				logradouro: 'Rua das Flores',
				numero: '123'
			});
			
			addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			
			expect(mockElement.innerHTML).toContain('123');
		});

		it('should extract neighborhood (bairro)', () => {
			const address = {
				display_name: 'Centro, Serro, MG',
				address: {
					neighbourhood: 'Centro',
					municipality: 'Serro',
					state: 'Minas Gerais'
				}
			};
			
			const standardized = new MockBrazilianStandardAddress({
				bairro: 'Centro',
				municipio: 'Serro',
				uf: 'MG'
			});
			
			addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			
			expect(mockElement.innerHTML).toContain('Centro');
		});

		it('should extract municipality (municipio)', () => {
			const address = {
				display_name: 'Serro, Minas Gerais, Brasil',
				address: {
					municipality: 'Serro',
					state: 'Minas Gerais',
					country: 'Brasil'
				}
			};
			
			const standardized = new MockBrazilianStandardAddress({
				municipio: 'Serro',
				uf: 'MG'
			});
			
			addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			
			expect(mockElement.innerHTML).toContain('Serro');
		});

		it('should extract postal code (CEP)', () => {
			const address = {
				display_name: 'Serro, MG, 39150-000',
				address: {
					municipality: 'Serro',
					state: 'Minas Gerais',
					postcode: '39150-000'
				}
			};
			
			const standardized = new MockBrazilianStandardAddress({
				municipio: 'Serro',
				uf: 'MG',
				cep: '39150-000'
			});
			
			addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			
			expect(mockElement.innerHTML).toContain('39150-000');
		});
	});

	describe('Error and Edge Cases', () => {
		it('should handle null address data gracefully', () => {
			addressDisplayer.update(null, null, 'PositionManager updated', false, null);
			
			// Should not throw error, element should remain unchanged or show appropriate message
			expect(mockElement.innerHTML).toBeDefined();
		});

		it('should handle empty address object', () => {
			const emptyAddress = {
				display_name: '',
				address: {}
			};
			
			addressDisplayer.update(emptyAddress, null, 'PositionManager updated', false, null);
			
			expect(mockElement.innerHTML).toBeDefined();
		});

		it('should handle address without standardized version', () => {
			const address = {
				display_name: 'Some Location',
				address: {
					road: 'Unknown Road'
				}
			};
			
			addressDisplayer.update(address, null, 'PositionManager updated', false, null);
			
			expect(mockElement.innerHTML).toBeDefined();
		});

		it('should handle malformed address data', () => {
			const malformed = {
				display_name: 'Test',
				address: null
			};
			
			expect(() => {
				addressDisplayer.update(malformed, null, 'PositionManager updated', false, null);
			}).not.toThrow();
		});

		it('should handle network timeout errors', () => {
			const error = {
				message: 'Tempo limite excedido',
				code: 'TIMEOUT'
			};
			
			addressDisplayer.update(null, null, 'PositionManager updated', false, error);
			
			expect(mockElement.innerHTML).toContain('Erro ao carregar endereço');
			expect(mockElement.innerHTML).toContain('Tempo limite excedido');
		});

		it('should handle geocoding service unavailable', () => {
			const error = {
				message: 'Serviço de geocodificação temporariamente indisponível',
				code: 'SERVICE_UNAVAILABLE'
			};
			
			addressDisplayer.update(null, null, 'PositionManager updated', false, error);
			
			expect(mockElement.innerHTML).toContain('Erro ao carregar endereço');
			expect(mockElement.innerHTML).toContain('temporariamente indisponível');
		});
	});

	describe('Portuguese Localization', () => {
		it('should use Portuguese loading message', () => {
			addressDisplayer.update(null, null, 'PositionManager updated', true, null);
			
			expect(mockElement.innerHTML).toContain('Carregando');
			expect(mockElement.innerHTML).not.toContain('Loading');
		});

		it('should use Portuguese error messages', () => {
			const error = { message: 'Falha ao buscar endereço' };
			
			addressDisplayer.update(null, null, 'PositionManager updated', false, error);
			
			expect(mockElement.innerHTML).toContain('Erro');
			expect(mockElement.innerHTML).not.toContain('Error');
		});

		it('should handle Portuguese address components', () => {
			const address = {
				display_name: 'Rua, Bairro, Município, Estado',
				address: {
					road: 'Rua das Palmeiras',
					neighbourhood: 'Jardim América',
					municipality: 'São Paulo',
					state: 'São Paulo'
				}
			};
			
			const standardized = new MockBrazilianStandardAddress({
				logradouro: 'Rua das Palmeiras',
				bairro: 'Jardim América',
				municipio: 'São Paulo',
				uf: 'SP'
			});
			
			addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			
			expect(mockElement.innerHTML).toContain('Palmeiras');
			expect(mockElement.innerHTML).toContain('Jardim América');
		});
	});

	describe('Event Type Filtering', () => {
		it('should only update on PositionManager updated event', () => {
			const address = {
				display_name: 'Test Address',
				address: { road: 'Test Road' }
			};
			
			const standardized = new MockBrazilianStandardAddress({
				logradouro: 'Test Road'
			});
			
			// Update with correct event
			addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			expect(mockElement.innerHTML).toContain('Test Road');
			
			// Clear element
			mockElement.innerHTML = '';
			
			// Update with different event (should not update)
			addressDisplayer.update(address, standardized, 'Some Other Event', false, null);
			expect(mockElement.innerHTML).toBe('');
		});

		it('should ignore updates without proper event type', () => {
			const address = {
				display_name: 'Test',
				address: {}
			};
			
			addressDisplayer.update(address, null, null, false, null);
			addressDisplayer.update(address, null, undefined, false, null);
			addressDisplayer.update(address, null, '', false, null);
			
			// Should not update for invalid event types
			expect(mockElement.innerHTML).toBe('');
		});
	});

	describe('toString() Integration', () => {
		it('should provide meaningful string representation', () => {
			const displayerStr = addressDisplayer.toString();
			
			expect(displayerStr).toContain('HTMLAddressDisplayer');
			expect(displayerStr).toContain('address-display');
		});

		it('should handle displayer without element ID', () => {
			const noIdElement = { innerHTML: '' };
			const noIdDisplayer = new HTMLAddressDisplayer(noIdElement);
			
			const displayerStr = noIdDisplayer.toString();
			expect(displayerStr).toContain('HTMLAddressDisplayer');
			expect(displayerStr).toContain('no-id');
		});
	});

	describe('Municipio and Bairro Validation (Detailed)', () => {
		it('should validate municipio value in raw address data', () => {
			const address = {
				display_name: 'Serro, Minas Gerais, Brasil',
				address: {
					municipality: 'Serro',
					state: 'Minas Gerais',
					country: 'Brasil'
				}
			};
			
			const standardized = new MockBrazilianStandardAddress({
				municipio: 'Serro',
				uf: 'MG'
			});
			
			addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			
			// Verify municipio appears in JSON representation
			expect(mockElement.innerHTML).toContain('"municipality": "Serro"');
			// Verify municipio appears in display_name
			expect(mockElement.innerHTML).toContain('Serro, Minas Gerais');
		});

		it('should validate bairro value in raw address data', () => {
			const address = {
				display_name: 'Centro, Serro, MG',
				address: {
					neighbourhood: 'Centro',
					municipality: 'Serro',
					state: 'Minas Gerais'
				}
			};
			
			const standardized = new MockBrazilianStandardAddress({
				bairro: 'Centro',
				municipio: 'Serro',
				uf: 'MG'
			});
			
			addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			
			// Verify bairro appears in JSON representation
			expect(mockElement.innerHTML).toContain('"neighbourhood": "Centro"');
			// Verify bairro appears in display_name
			expect(mockElement.innerHTML).toContain('Centro, Serro');
		});

		it('should validate municipio in standardized Brazilian address format', () => {
			const address = {
				display_name: 'Diamantina, MG, Brasil',
				address: {
					city: 'Diamantina',
					state: 'Minas Gerais'
				}
			};
			
			const standardized = new MockBrazilianStandardAddress({
				municipio: 'Diamantina',
				uf: 'MG'
			});
			
			// Update standardized display element
			addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			
			// Verify standardized display shows municipio
			expect(mockStandardizedElement.innerHTML).toContain('Diamantina');
			// Verify municipio in raw data
			expect(mockElement.innerHTML).toContain('Diamantina');
		});

		it('should validate bairro in standardized Brazilian address format', () => {
			const address = {
				display_name: 'Milho Verde, Serro, MG',
				address: {
					village: 'Milho Verde',
					municipality: 'Serro'
				}
			};
			
			const standardized = new MockBrazilianStandardAddress({
				bairro: 'Milho Verde',
				municipio: 'Serro',
				uf: 'MG'
			});
			
			addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			
			// Verify standardized display shows bairro
			expect(mockStandardizedElement.innerHTML).toContain('Milho Verde');
			// Verify bairro in raw data
			expect(mockElement.innerHTML).toContain('Milho Verde');
		});

		it('should validate different bairro names in same municipio', () => {
			// Test multiple bairros in Serro
			const bairros = [
				{ name: 'Centro', display: 'Centro, Serro, MG' },
				{ name: 'São Sebastião', display: 'São Sebastião, Serro, MG' },
				{ name: 'Milho Verde', display: 'Milho Verde, Serro, MG' }
			];
			
			bairros.forEach(({ name, display }) => {
				mockElement.innerHTML = ''; // Clear for each test
				mockStandardizedElement.innerHTML = '';
				
				const address = {
					display_name: display,
					address: {
						neighbourhood: name,
						municipality: 'Serro',
						state: 'Minas Gerais'
					}
				};
				
				const standardized = new MockBrazilianStandardAddress({
					bairro: name,
					municipio: 'Serro',
					uf: 'MG'
				});
				
				addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
				
				// Verify bairro name appears
				expect(mockElement.innerHTML).toContain(name);
				expect(mockStandardizedElement.innerHTML).toContain(name);
				// Verify municipio is consistent
				expect(mockElement.innerHTML).toContain('Serro');
				expect(mockStandardizedElement.innerHTML).toContain('Serro');
			});
		});

		it('should validate municipio changes across different cities', () => {
			const municipios = [
				{ name: 'Serro', uf: 'MG', display: 'Serro, Minas Gerais' },
				{ name: 'Diamantina', uf: 'MG', display: 'Diamantina, Minas Gerais' },
				{ name: 'Belo Horizonte', uf: 'MG', display: 'Belo Horizonte, MG' },
				{ name: 'Rio de Janeiro', uf: 'RJ', display: 'Rio de Janeiro, RJ' }
			];
			
			municipios.forEach(({ name, uf, display }) => {
				mockElement.innerHTML = ''; // Clear for each test
				mockStandardizedElement.innerHTML = '';
				
				const address = {
					display_name: display,
					address: {
						municipality: name,
						city: name,
						state: uf === 'MG' ? 'Minas Gerais' : 'Rio de Janeiro'
					}
				};
				
				const standardized = new MockBrazilianStandardAddress({
					municipio: name,
					uf: uf
				});
				
				addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
				
				// Verify municipio name appears
				expect(mockElement.innerHTML).toContain(name);
				expect(mockStandardizedElement.innerHTML).toContain(name);
				// Verify UF appears
				expect(mockStandardizedElement.innerHTML).toContain(uf);
			});
		});

		it('should validate complete address hierarchy: logradouro, bairro, municipio, UF', () => {
			const address = {
				display_name: 'Rua das Flores, 123, Centro, Serro, MG, Brasil',
				address: {
					road: 'Rua das Flores',
					house_number: '123',
					neighbourhood: 'Centro',
					municipality: 'Serro',
					state: 'Minas Gerais',
					postcode: '39150-000',
					country: 'Brasil'
				}
			};
			
			const standardized = new MockBrazilianStandardAddress({
				logradouro: 'Rua das Flores',
				numero: '123',
				bairro: 'Centro',
				municipio: 'Serro',
				uf: 'MG',
				cep: '39150-000'
			});
			
			addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			
			// Validate each level of address hierarchy
			// Raw data validation
			expect(mockElement.innerHTML).toContain('"road": "Rua das Flores"');
			expect(mockElement.innerHTML).toContain('"house_number": "123"');
			expect(mockElement.innerHTML).toContain('"neighbourhood": "Centro"');
			expect(mockElement.innerHTML).toContain('"municipality": "Serro"');
			expect(mockElement.innerHTML).toContain('"state": "Minas Gerais"');
			
			// Standardized format validation
			expect(mockStandardizedElement.innerHTML).toContain('Rua das Flores');
			expect(mockStandardizedElement.innerHTML).toContain('123');
			expect(mockStandardizedElement.innerHTML).toContain('Centro');
			expect(mockStandardizedElement.innerHTML).toContain('Serro');
			expect(mockStandardizedElement.innerHTML).toContain('MG');
		});

		it('should validate bairro and municipio with special characters', () => {
			const address = {
				display_name: 'São Sebastião, Conceição do Mato Dentro, MG',
				address: {
					neighbourhood: 'São Sebastião',
					municipality: 'Conceição do Mato Dentro',
					state: 'Minas Gerais'
				}
			};
			
			const standardized = new MockBrazilianStandardAddress({
				bairro: 'São Sebastião',
				municipio: 'Conceição do Mato Dentro',
				uf: 'MG'
			});
			
			addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			
			// Verify special characters are preserved
			expect(mockElement.innerHTML).toContain('São Sebastião');
			expect(mockElement.innerHTML).toContain('Conceição do Mato Dentro');
			expect(mockStandardizedElement.innerHTML).toContain('São Sebastião');
			expect(mockStandardizedElement.innerHTML).toContain('Conceição do Mato Dentro');
		});

		it('should validate municipio-bairro consistency across updates', () => {
			// First update: Bairro A in Municipio 1
			const address1 = {
				display_name: 'Centro, Serro, MG',
				address: {
					neighbourhood: 'Centro',
					municipality: 'Serro'
				}
			};
			
			const standardized1 = new MockBrazilianStandardAddress({
				bairro: 'Centro',
				municipio: 'Serro',
				uf: 'MG'
			});
			
			addressDisplayer.update(address1, standardized1, 'PositionManager updated', false, null);
			const html1 = mockElement.innerHTML;
			
			// Verify first update
			expect(html1).toContain('"neighbourhood": "Centro"');
			expect(html1).toContain('"municipality": "Serro"');
			
			// Second update: Different bairro, same municipio
			const address2 = {
				display_name: 'Milho Verde, Serro, MG',
				address: {
					village: 'Milho Verde',
					municipality: 'Serro'
				}
			};
			
			const standardized2 = new MockBrazilianStandardAddress({
				bairro: 'Milho Verde',
				municipio: 'Serro',
				uf: 'MG'
			});
			
			addressDisplayer.update(address2, standardized2, 'PositionManager updated', false, null);
			
			// Both bairros should be present (appended)
			expect(mockElement.innerHTML).toContain('Centro');
			expect(mockElement.innerHTML).toContain('Milho Verde');
			// Municipio should appear multiple times (once per update)
			const serroMatches = mockElement.innerHTML.match(/Serro/g);
			expect(serroMatches).not.toBeNull();
			expect(serroMatches.length).toBeGreaterThan(1);
		});

		it('should validate empty bairro with valid municipio', () => {
			const address = {
				display_name: 'Serro, Minas Gerais, Brasil',
				address: {
					municipality: 'Serro',
					state: 'Minas Gerais',
					country: 'Brasil'
					// No neighbourhood/bairro specified
				}
			};
			
			const standardized = new MockBrazilianStandardAddress({
				bairro: null,
				municipio: 'Serro',
				uf: 'MG'
			});
			
			addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			
			// Municipio should appear
			expect(mockElement.innerHTML).toContain('Serro');
			// Should not crash with null bairro
			expect(mockElement.innerHTML).toBeDefined();
		});

		it('should validate village as bairro alternative', () => {
			// In rural areas, village often serves as bairro
			const address = {
				display_name: 'Milho Verde, Serro, MG',
				address: {
					village: 'Milho Verde',
					municipality: 'Serro',
					state: 'Minas Gerais'
				}
			};
			
			const standardized = new MockBrazilianStandardAddress({
				bairro: 'Milho Verde', // Village mapped to bairro
				municipio: 'Serro',
				uf: 'MG'
			});
			
			addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			
			// Verify village appears in raw data
			expect(mockElement.innerHTML).toContain('"village": "Milho Verde"');
			// Verify village is treated as bairro in standardized format
			expect(mockStandardizedElement.innerHTML).toContain('Milho Verde');
			// Verify municipio
			expect(mockElement.innerHTML).toContain('Serro');
		});
	});

	describe('Multiple Address Updates', () => {
		it('should handle sequential address updates', () => {
			// First address
			const address1 = {
				display_name: 'Address 1',
				address: { municipality: 'Serro' }
			};
			const standardized1 = new MockBrazilianStandardAddress({ municipio: 'Serro' });
			
			addressDisplayer.update(address1, standardized1, 'PositionManager updated', false, null);
			expect(mockElement.innerHTML).toContain('Serro');
			
			// Second address (should append)
			const address2 = {
				display_name: 'Address 2',
				address: { municipality: 'Diamantina' }
			};
			const standardized2 = new MockBrazilianStandardAddress({ municipio: 'Diamantina' });
			
			addressDisplayer.update(address2, standardized2, 'PositionManager updated', false, null);
			
			// Both addresses should be present (appended)
			expect(mockElement.innerHTML).toContain('Serro');
			expect(mockElement.innerHTML).toContain('Diamantina');
		});

		it('should handle rapid address changes', () => {
			const addresses = [
				{ display_name: 'Serro', address: { municipality: 'Serro' } },
				{ display_name: 'Diamantina', address: { municipality: 'Diamantina' } },
				{ display_name: 'Belo Horizonte', address: { city: 'Belo Horizonte' } }
			];
			
			addresses.forEach((address, index) => {
				const standardized = new MockBrazilianStandardAddress({
					municipio: address.address.municipality || address.address.city
				});
				
				addressDisplayer.update(address, standardized, 'PositionManager updated', false, null);
			});
			
			// All addresses should be present
			expect(mockElement.innerHTML).toContain('Serro');
			expect(mockElement.innerHTML).toContain('Diamantina');
			expect(mockElement.innerHTML).toContain('Belo Horizonte');
		});
	});
});
