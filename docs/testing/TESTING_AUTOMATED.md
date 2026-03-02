# Guia Turístico - Automated Testing

---

Last Updated: 2026-03-02
Status: Active
Category: Testing
---

**Navigation**: [🏠 Home](../README.md) > [📚 Docs](./docs/README.md) > Testing Guide

Este documento descreve como usar os testes automatizados implementados para o Guia Turístico usando Jest.

## Configuração dos Testes

O projeto agora inclui testes automatizados usando Jest, configurados para funcionar tanto no ambiente Node.js quanto para testar funcionalidades que não dependem do DOM.

### Estrutura dos Testes

```
__tests__/
├── unit/                          # Pure unit tests
│   ├── core/                      # Core classes (GeoPosition, PositionManager)
│   ├── data/                      # Data processing
│   ├── services/                  # Services (geocoding, geolocation)
│   ├── html/                      # Display components
│   └── utils/                     # Utility functions
├── integration/                   # Multi-component tests
├── e2e/                           # Full user workflows
├── managers/                      # Service managers
├── external/                      # External API mocking
└── features/                      # Feature-specific tests
```

## Executando os Testes

### Comandos Básicos

```bash
# Executar todos os testes
npm test

# Executar apenas testes E2E (end-to-end)
npm test -- __tests__/e2e

# Executar arquivo E2E específico
npm test -- __tests__/e2e/CompleteGeolocationWorkflow.e2e.test.js

# Executar testes visuais de hierarquia (Selenium)
npm run test:visual

# Executar testes com cobertura de código
npm run test:coverage

# Executar cobertura apenas para E2E
npm run test:coverage -- __tests__/e2e

# Executar testes em modo watch (reexecuta automaticamente quando arquivos mudam)
npm run test:watch

# Executar testes com output detalhado
npm run test:verbose

# Validar sintaxe dos arquivos JavaScript
npm run validate

# Executar validação + testes
npm run test:all
```

### Resultados Esperados

Todos os testes devem passar:

- ✅ 2.437 testes passando (2.639 total)
  - ~91 testes E2E (workflows completos)
  - ~1.200 testes de integração
  - ~1.100 testes unitários e de features
- ✅ 96 suites de teste passando (~109 total)
- ✅ ~84,7% de cobertura geral, 100% em guia_ibge.js

## Funcionalidades Testadas

### 1. Utilitários Básicos (`utils.test.js`)

- **guiaVersion**: Verifica estrutura da versão e formato de string
- **calculateDistance**: Testa cálculo de distância Haversine entre coordenadas
- **getAddressType**: Testa classificação de tipos de endereço
- **delay**: Testa função de delay assíncrona

### 2. Classe CurrentPosition (`CurrentPosition.test.js`)

- **Padrão Singleton**: Verifica que apenas uma instância é criada
- **Gerenciamento de Posição**: Testa inicialização com dados de posição
- **Padrão Observer**: Testa inscrição/desinscrição de observadores
- **Cálculo de Distância**: Testa método distanceTo entre posições
- **Qualidade de Precisão**: Testa classificação de precisão GPS

### 3. Gerenciador de Status (`SingletonStatusManager.test.js`)

- **Padrão Singleton**: Verifica implementação singleton
- **Gerenciamento de Estado**: Testa controle de status de localização
- **Persistência de Estado**: Verifica que o estado é mantido entre instâncias

### 4. Módulo IBGE (`guia_ibge.test.js`)

- **renderUrlUFNome**: Testa geração de URLs para API do IBGE
- **Tratamento de Dados**: Verifica comportamento com diferentes entradas

### 5. Testes End-to-End (E2E) (`__tests__/e2e/*.e2e.test.js`)

- **Workflows Completos**: Testa fluxos de ponta a ponta da aplicação (inicialização → geolocalização → geocodificação → exibição)
- **Integração Multi-componente**: Verifica coordenação entre WebGeocodingManager, PositionManager, ReverseGeocoder, e outros
- **Processamento de Endereços**: Pipeline completo de geocodificação reversa e extração de endereços brasileiros
- **Detecção de Mudanças**: Mudança de município/bairro/logradouro + síntese de fala com prioridades
- **Tratamento de Erros**: Cenários de falha (coordenadas inválidas, timeout de rede, erros de API) e recuperação
- **Cenários Reais**: Casos de uso de produção (Milho Verde/Serro-MG, São Paulo, Rio de Janeiro)
- **Performance**: Validação de tempo de execução de workflows completos

**Ver**: [`__tests__/e2e/README.md`](../__tests__/e2e/README.md) para documentação detalhada dos testes E2E.

#### Diferença entre Testes E2E

O projeto possui dois tipos de testes E2E com propósitos distintos:

**JavaScript E2E** (`__tests__/e2e/`)

- **Framework**: Jest (JavaScript)
- **Ambiente**: Node.js com mocks
- **Propósito**: Testa lógica de integração entre componentes
- **Execução**: `npm test -- __tests__/e2e`
- **Velocidade**: Rápido (~3 segundos)
- **Documentação**: [E2E README](../__tests__/e2e/README.md)

**Python E2E** (`tests/e2e/`)

- **Framework**: Jest (Node.js)
- **Ambiente**: Node.js
- **Propósito**: Testa caso real com dados do OpenStreetMap (Milho Verde/Serro-MG)
- **Execução**: `npm test -- tests/e2e/MilhoVerde-SerroMG.e2e.test.js`
- **Velocidade**: Rápido (mocks de API)
- **Documentação**: [tests/e2e/README.md](../tests/e2e/README.md)

**Nota**: Para testes de browser real com Selenium, veja `tests/integration/` (Python + pytest).

### 6. Padrões de Imutabilidade (`Immutability.test.js`)

- **ObserverSubject**: Verifica que operações de subscribe/unsubscribe não mutam arrays
- **BrazilianStandardAddress**: Testa construção imutável de arrays com filter(Boolean)
- **AddressCache**: Verifica operações de cache sem mutação de estado
- **Best Practices**: Demonstra padrões imutáveis (spread operator, filter, sort em cópias)

## Cobertura de Código

A cobertura atual inclui:

- **guia.js**: ~12% (focado em funcionalidades core)
- **guia_ibge.js**: 100% (função única testada completamente)

### Exemplos de Áreas Testadas

- Cálculos matemáticos (distância Haversine)
- Padrões de design (Singleton, Observer)
- Validação de dados de entrada
- Classificação de precisão GPS
- Integração com APIs externas

## Testes de Integração Manual

Para testar a funcionalidade completa da aplicação web:

1. **Iniciar servidor web**:

   ```bash
   python3 -m http.server 9000
   ```

2. **Acessar aplicação**: `http://localhost:9000/test.html`

3. **Testar funcionalidades**:
   - Clique em "Obter Localização"
   - Verifique permissões de geolocalização
   - Teste botões de restaurantes e estatísticas
   - Monitore console do navegador para logs

## Requisitos

- **Node.js** (para executar testes)
- **Jest** (instalado automaticamente como dependência dev)
- **Python 3** (opcional, para servidor web de testes manuais)

## Arquivos Modificados

Para suportar testes, foram feitas modificações mínimas:

### guia.js

- Adicionada seção de exports no final do arquivo para Node.js
- Mantém compatibilidade total com uso no navegador

### guia_ibge.js

- Adicionada seção de exports para Node.js
- Mantém funcionalidade original

### Novos Arquivos

- `package.json`: Configuração do projeto Node.js e Jest
- `.gitignore`: Ignora node_modules e arquivos temporários
- `__tests__/*.test.js`: Arquivos de teste
- Este README

## Contribuindo

Ao adicionar novas funcionalidades:

1. **Escreva testes** para novas funções e classes
2. **Execute testes** antes de fazer commit: `npm run test:all`
3. **Mantenha cobertura**: Aim para pelo menos 80% de cobertura nas novas funcionalidades
4. **Teste manualmente**: Use o servidor web para testar funcionalidades de DOM

## Troubleshooting

### Problemas Comuns

1. **Testes falham por dependências de DOM**:
   - Verifique se `global.document = undefined` está no início dos testes

2. **Funções não encontradas**:
   - Verifique se as exports estão configuradas corretamente
   - Confirme que `require('../guia.js')` está correto

3. **Testes lentos**:
   - Use `npm run test:watch` para desenvolvimento iterativo
   - Evite delays desnecessários em testes

### Comandos de Debug

```bash
# Debug de teste específico
npx jest __tests__/utils.test.js --verbose

# Debug com mais informações
npx jest --detectOpenHandles --forceExit

# Limpar cache do Jest
npx jest --clearCache
```

## Visual Hierarchy Tests

### Overview

The project includes automated visual hierarchy tests using Selenium to verify that location information (município and bairro cards) is visually more prominent than action buttons.

### Prerequisites

- **Python 3**: Required for running the test script and HTTP server
- **Selenium**: Installed automatically if missing
- **Browser**: Chrome or Firefox with appropriate driver

### Running Visual Tests

```bash
# Via npm script (recommended)
npm run test:visual

# Direct execution
./tests/integration/run_visual_hierarchy_tests.sh
```

### What Gets Tested

The visual hierarchy test script:

1. **Starts HTTP Server**: Launches a local server on port 8080
2. **Runs Selenium Tests**: Automated browser tests for visual hierarchy
3. **Validates Layout**: Checks that location cards are more prominent than buttons
4. **Cleanup**: Automatically stops the server after tests complete

### Test Assertions

- ✅ Location cards (município/bairro) are larger than action buttons (at least 2x height)
- ✅ Cards have prominent visual styling (gradient background, shadows, large fonts)
- ✅ Buttons appear secondary with minimal styling
- ✅ Color contrast meets accessibility standards

### Manual Testing

For manual verification, see detailed checklist in:

- [Visual Hierarchy Tests Guide](./testing/VISUAL_HIERARCHY_TESTS.md)

### Test Output

Successful test output:

```
========================================
Visual Hierarchy Integration Tests
========================================

✓ Server started (PID: 12345)
✓ Running Selenium tests...
✓ Visual hierarchy validated
✓ All tests passed

Cleaning up...
✓ Server stopped
```

---

## Related Documentation

### Testing Resources

- [Test Strategy](./testing/TEST_STRATEGY.md) - Overall testing philosophy and approach
- [Test Infrastructure](./testing/TEST_INFRASTRUCTURE.md) - Test execution and coverage details
- [Testing HTML Generation](./testing/HTML_GENERATION.md) - HTML display component testing
- [Visual Hierarchy Tests](./testing/VISUAL_HIERARCHY_TESTS.md) - Manual and automated visual hierarchy testing

### Development Guides

- [Contributing Guidelines](../.github/CONTRIBUTING.md) - How to contribute with tests
- [TDD Guide](../.github/TDD_GUIDE.md) - Test-Driven Development practices
- [Unit Test Guide](../.github/UNIT_TEST_GUIDE.md) - Writing effective unit tests

### Documentation Hub

- [Documentation Index](./INDEX.md) - Complete documentation catalog
- [Documentation Hub](./README.md) - Quick navigation to all docs

---

_Last updated: 2026-01-28_
