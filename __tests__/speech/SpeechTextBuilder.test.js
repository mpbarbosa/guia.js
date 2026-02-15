import { jest } from '@jest/globals';
import { SpeechTextBuilder } from '../../src/speech/SpeechTextBuilder.js';
import BrazilianStandardAddress from '../../src/data/BrazilianStandardAddress.js';

describe('SpeechTextBuilder', () => {
	let builder;

	beforeEach(() => {
		builder = new SpeechTextBuilder();
	});

	describe('Constructor', () => {
		test('should create instance successfully', () => {
			expect(builder).toBeInstanceOf(SpeechTextBuilder);
		});

		test('should be frozen (immutable)', () => {
			expect(Object.isFrozen(builder)).toBe(true);
		});

		test('should have all required methods', () => {
			expect(typeof builder.buildTextToSpeechLogradouro).toBe('function');
			expect(typeof builder.buildTextToSpeechBairro).toBe('function');
			expect(typeof builder.buildTextToSpeechMunicipio).toBe('function');
			expect(typeof builder.buildTextToSpeech).toBe('function');
			expect(typeof builder.toString).toBe('function');
		});
	});

	describe('buildTextToSpeechLogradouro', () => {
		test('should build text for complete logradouro', () => {
			const address = new BrazilianStandardAddress();
			address.logradouro = 'Rua das Flores';
			address.numero = '123';

			const text = builder.buildTextToSpeechLogradouro(address);
			expect(text).toBe('Você está agora em Rua das Flores, 123');
		});

		test('should build text for logradouro without number', () => {
			const address = new BrazilianStandardAddress();
			address.logradouro = 'Avenida Paulista';

			const text = builder.buildTextToSpeechLogradouro(address);
			expect(text).toContain('Avenida Paulista');
		});

		test('should return fallback for null address', () => {
			const text = builder.buildTextToSpeechLogradouro(null);
			expect(text).toBe('Nova localização detectada');
		});

		test('should return fallback for undefined address', () => {
			const text = builder.buildTextToSpeechLogradouro(undefined);
			expect(text).toBe('Nova localização detectada');
		});

		test('should return fallback when logradouro is missing', () => {
			const address = new BrazilianStandardAddress();
			address.bairro = 'Centro';
			address.municipio = 'São Paulo';

			const text = builder.buildTextToSpeechLogradouro(address);
			expect(text).toBe('Nova localização detectada');
		});

		test('should return fallback when logradouro is empty string', () => {
			const address = new BrazilianStandardAddress();
			address.logradouro = '';
			address.bairro = 'Centro';

			const text = builder.buildTextToSpeechLogradouro(address);
			expect(text).toBe('Nova localização detectada');
		});

		test('should use logradouroCompleto method', () => {
			const address = new BrazilianStandardAddress();
			address.logradouro = 'Rua XV de Novembro';
			address.numero = '456';

			const spy = jest.spyOn(address, 'logradouroCompleto');
			builder.buildTextToSpeechLogradouro(address);
			expect(spy).toHaveBeenCalled();
		});
	});

	describe('buildTextToSpeechBairro', () => {
		test('should build text for bairro', () => {
			const address = new BrazilianStandardAddress();
						address.bairro = 'Centro';

			const text = builder.buildTextToSpeechBairro(address);
			expect(text).toBe('Você entrou no bairro Centro');
		});

		test('should use correct Portuguese preposition', () => {
			const address = new BrazilianStandardAddress();
						address.bairro = 'Copacabana';

			const text = builder.buildTextToSpeechBairro(address);
			expect(text).toContain('Você entrou no bairro');
		});

		test('should return fallback for null address', () => {
			const text = builder.buildTextToSpeechBairro(null);
			expect(text).toBe('Novo bairro detectado');
		});

		test('should return fallback for undefined address', () => {
			const text = builder.buildTextToSpeechBairro(undefined);
			expect(text).toBe('Novo bairro detectado');
		});

		test('should return fallback when bairro is missing', () => {
			const address = new BrazilianStandardAddress();
						address.logradouro = 'Rua das Flores';
						address.municipio = 'São Paulo';

			const text = builder.buildTextToSpeechBairro(address);
			expect(text).toBe('Novo bairro detectado');
		});

		test('should return fallback when bairro is empty string', () => {
			const address = new BrazilianStandardAddress();
						address.municipio = 'Rio de Janeiro';

			const text = builder.buildTextToSpeechBairro(address);
			expect(text).toBe('Novo bairro detectado');
		});

		test('should use bairroCompleto method', () => {
			const address = new BrazilianStandardAddress();
						address.bairro = 'Jardim Botânico';

			const spy = jest.spyOn(address, 'bairroCompleto');
			builder.buildTextToSpeechBairro(address);
			expect(spy).toHaveBeenCalled();
		});
	});

	describe('buildTextToSpeechMunicipio', () => {
		test('should build text for municipio with previous context', () => {
			const address = new BrazilianStandardAddress();
						address.municipio = 'São Paulo';

			const changeDetails = {
				previous: { municipio: 'Santos' },
				current: { municipio: 'São Paulo' }
			};

			const text = builder.buildTextToSpeechMunicipio(address, changeDetails);
			expect(text).toBe('Você saiu de Santos e entrou em São Paulo');
		});

		test('should build text for municipio without previous context', () => {
			const address = new BrazilianStandardAddress();
						address.municipio = 'Rio de Janeiro';

			const text = builder.buildTextToSpeechMunicipio(address);
			expect(text).toBe('Você entrou no município de Rio de Janeiro');
		});

		test('should handle missing changeDetails', () => {
			const address = new BrazilianStandardAddress();
						address.municipio = 'Recife';

			const text = builder.buildTextToSpeechMunicipio(address, null);
			expect(text).toBe('Você entrou no município de Recife');
		});

		test('should handle changeDetails without previous', () => {
			const address = new BrazilianStandardAddress();
						address.municipio = 'Salvador';

			const changeDetails = {
				current: { municipio: 'Salvador' }
			};

			const text = builder.buildTextToSpeechMunicipio(address, changeDetails);
			expect(text).toBe('Você entrou no município de Salvador');
		});

		test('should handle changeDetails with empty previous municipio', () => {
			const address = new BrazilianStandardAddress();
						address.municipio = 'Brasília';

			const changeDetails = {
				previous: { municipio: '' },
				current: { municipio: 'Brasília' }
			};

			const text = builder.buildTextToSpeechMunicipio(address, changeDetails);
			expect(text).toBe('Você entrou no município de Brasília');
		});

		test('should return fallback for null address', () => {
			const text = builder.buildTextToSpeechMunicipio(null);
			expect(text).toBe('Novo município detectado');
		});

		test('should return fallback for undefined address', () => {
			const text = builder.buildTextToSpeechMunicipio(undefined);
			expect(text).toBe('Novo município detectado');
		});

		test('should return fallback when municipio is missing', () => {
			const address = new BrazilianStandardAddress();
						address.bairro = 'Centro';

			const text = builder.buildTextToSpeechMunicipio(address);
			expect(text).toBe('Novo município detectado');
		});

		test('should use correct Portuguese for entry/exit', () => {
			const address = new BrazilianStandardAddress();
						address.municipio = 'Curitiba';

			const changeDetails = {
				previous: { municipio: 'Ponta Grossa' },
				current: { municipio: 'Curitiba' }
			};

			const text = builder.buildTextToSpeechMunicipio(address, changeDetails);
			expect(text).toContain('saiu de');
			expect(text).toContain('entrou em');
		});
	});

	describe('buildTextToSpeech', () => {
		test('should build complete address with all components', () => {
			const address = new BrazilianStandardAddress();
						address.logradouro = 'Rua das Flores';
						address.numero = '123';
						address.bairro = 'Centro';
						address.municipio = 'São Paulo';

			const text = builder.buildTextToSpeech(address);
			expect(text).toContain('Você está em');
			expect(text).toContain('Rua das Flores');
			expect(text).toContain('Centro');
			expect(text).toContain('São Paulo');
		});

		test('should build address with logradouro and municipio (no bairro)', () => {
			const address = new BrazilianStandardAddress();
						address.logradouro = 'Avenida Paulista';
						address.municipio = 'São Paulo';

			const text = builder.buildTextToSpeech(address);
			expect(text).toContain('Avenida Paulista');
			expect(text).toContain('São Paulo');
		});

		test('should build address with bairro and municipio (no logradouro)', () => {
			const address = new BrazilianStandardAddress();
						address.bairro = 'Copacabana';
						address.municipio = 'Rio de Janeiro';

			const text = builder.buildTextToSpeech(address);
			expect(text).toBe('Você está em bairro Copacabana, Rio de Janeiro');
		});

		test('should build address with only municipio', () => {
			const address = new BrazilianStandardAddress();
						address.municipio = 'Salvador';

			const text = builder.buildTextToSpeech(address);
			expect(text).toBe('Você está em Salvador');
		});

		test('should build address with only bairro', () => {
			const address = new BrazilianStandardAddress();
						address.bairro = 'Jardim Botânico';

			const text = builder.buildTextToSpeech(address);
			expect(text).toContain('bairro Jardim Botânico');
		});

		test('should return fallback for null address', () => {
			const text = builder.buildTextToSpeech(null);
			expect(text).toBe('Localização não disponível');
		});

		test('should return fallback for undefined address', () => {
			const text = builder.buildTextToSpeech(undefined);
			expect(text).toBe('Localização não disponível');
		});

		test('should return fallback for address with no components', () => {
			const address = new BrazilianStandardAddress({});

			const text = builder.buildTextToSpeech(address);
			expect(text).toBe('Localização detectada, mas endereço não disponível');
		});

		test('should use logradouroCompleto method', () => {
			const address = new BrazilianStandardAddress();
						address.logradouro = 'Rua XV de Novembro';
						address.numero = '789';

			const spy = jest.spyOn(address, 'logradouroCompleto');
			builder.buildTextToSpeech(address);
			expect(spy).toHaveBeenCalled();
		});

		test('should use bairroCompleto method when bairro present', () => {
			const address = new BrazilianStandardAddress();
						address.bairro = 'Centro';

			const spy = jest.spyOn(address, 'bairroCompleto');
			builder.buildTextToSpeech(address);
			expect(spy).toHaveBeenCalled();
		});

		test('should use correct Portuguese structure', () => {
			const address = new BrazilianStandardAddress();
						address.logradouro = 'Rua Augusta';
						address.bairro = 'Consolação';
						address.municipio = 'São Paulo';

			const text = builder.buildTextToSpeech(address);
			expect(text).toMatch(/^Você está em /);
		});
	});

	describe('Brazilian Portuguese Specific Features', () => {
		test('should use proper Portuguese prepositions', () => {
			const address = new BrazilianStandardAddress();
						address.bairro = 'Ipanema';
						address.municipio = 'Rio de Janeiro';

			const bairroText = builder.buildTextToSpeechBairro(address);
			expect(bairroText).toContain('no bairro');
		});

		test('should handle Brazilian city names correctly', () => {
			const address = new BrazilianStandardAddress();
						address.municipio = 'São Paulo';

			const text = builder.buildTextToSpeech(address);
			expect(text).toContain('São Paulo');
		});

		test('should format addresses in hierarchical order', () => {
			const address = new BrazilianStandardAddress();
						address.logradouro = 'Rua A';
						address.bairro = 'Bairro B';
						address.municipio = 'Cidade C';

			const text = builder.buildTextToSpeech(address);
			const logradouroIndex = text.indexOf('Rua A');
			const bairroIndex = text.indexOf('Bairro B');
			const municipioIndex = text.indexOf('Cidade C');

			expect(logradouroIndex).toBeLessThan(bairroIndex);
			expect(bairroIndex).toBeLessThan(municipioIndex);
		});

		test('should use contextual verbs (entrar, sair)', () => {
			const address = new BrazilianStandardAddress();
						address.municipio = 'Porto Alegre';

			const changeDetails = {
				previous: { municipio: 'Canoas' },
				current: { municipio: 'Porto Alegre' }
			};

			const text = builder.buildTextToSpeechMunicipio(address, changeDetails);
			expect(text).toContain('saiu de');
			expect(text).toContain('entrou em');
		});
	});

	describe('toString', () => {
		test('should return class name', () => {
			const text = builder.toString();
			expect(text).toBe('SpeechTextBuilder');
		});
	});

	describe('Pure Function Characteristics', () => {
		test('should be deterministic (same input = same output)', () => {
			const address = new BrazilianStandardAddress();
						address.logradouro = 'Rua Test';
						address.numero = '100';

			const text1 = builder.buildTextToSpeechLogradouro(address);
			const text2 = builder.buildTextToSpeechLogradouro(address);

			expect(text1).toBe(text2);
		});

		test('should have no side effects', () => {
			const address = new BrazilianStandardAddress();
						address.municipio = 'São Paulo';

			const originalMunicipio = address.municipio;
			builder.buildTextToSpeech(address);

			expect(address.municipio).toBe(originalMunicipio);
		});

		test('should not modify changeDetails parameter', () => {
			const address = new BrazilianStandardAddress();
						address.municipio = 'Recife';

			const changeDetails = {
				previous: { municipio: 'Olinda' },
				current: { municipio: 'Recife' }
			};

			const originalChangeDetails = JSON.stringify(changeDetails);
			builder.buildTextToSpeechMunicipio(address, changeDetails);

			expect(JSON.stringify(changeDetails)).toBe(originalChangeDetails);
		});
	});

	describe('Edge Cases', () => {
		test('should handle address with special characters', () => {
			const address = new BrazilianStandardAddress();
						address.logradouro = 'Rua São João';
						address.bairro = 'São José';
						address.municipio = 'São Paulo';

			const text = builder.buildTextToSpeech(address);
			expect(text).toContain('São João');
			expect(text).toContain('São José');
			expect(text).toContain('São Paulo');
		});

		test('should handle very long street names', () => {
			const address = new BrazilianStandardAddress();
						address.logradouro = 'Rua Professora Maria José dos Santos Ferreira';
						address.numero = '1234';

			const text = builder.buildTextToSpeechLogradouro(address);
			expect(text).toContain('Rua Professora Maria José dos Santos Ferreira');
		});

		test('should handle numeric-only logradouro', () => {
			const address = new BrazilianStandardAddress();
						address.logradouro = '13 de Maio';

			const text = builder.buildTextToSpeechLogradouro(address);
			expect(text).toContain('13 de Maio');
		});
	});
});
