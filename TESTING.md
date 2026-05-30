# Guia de Testes / Testing Guide

Este guia rápido aponta para a documentação atual de testes do repositório.

## Comandos rápidos

```bash
npm test                 # Suíte Jest padrão
npm run test:watch       # Modo watch
npm run test:coverage    # Cobertura da suíte padrão
npm run test:unit        # Suíte TypeScript (jest.config.unit.js)
npm run test:e2e         # Suíte Jest E2E (Puppeteer)
npm run test:playwright  # Smoke test do Playwright
npm run test:all         # Validação de sintaxe + suíte padrão
```

## Documentação detalhada

- **[docs/testing/TESTING.md](docs/testing/TESTING.md)** — Visão geral das suítes e quando usar cada comando
- **[docs/testing/TEST_STRATEGY.md](docs/testing/TEST_STRATEGY.md)** — Estratégia para escolher a menor suíte útil
- **[docs/testing/TEST_INFRASTRUCTURE.md](docs/testing/TEST_INFRASTRUCTURE.md)** — Runners, configs e arquivos-chave
- **[tests/README.md](tests/README.md)** — Testes Selenium/pytest e estrutura de diretórios
- **[docs/DOCKER_TESTING.md](docs/DOCKER_TESTING.md)** — Execução dos testes em Docker
- **[.github/TDD_GUIDE.md](.github/TDD_GUIDE.md)** — Guia de desenvolvimento orientado a testes
- **[.github/UNIT_TEST_GUIDE.md](.github/UNIT_TEST_GUIDE.md)** — Boas práticas para testes unitários
