# Guia de Testes / Testing Guide

Este projeto usa dois sistemas de testes: **Jest** para testes unitários e de integração, e **Puppeteer** para testes E2E.

## Comandos rápidos

```bash
npm test                 # Suíte completa (~65s, 3000+ testes)
npm run test:watch       # Modo watch
npm run test:coverage    # Com cobertura (~76%)
npm run test:unit        # Apenas testes unitários
npm run test:e2e         # Apenas testes E2E (Puppeteer)
npm run test:all         # Validação de sintaxe + suíte completa
```

## Documentação detalhada

- **[tests/README.md](tests/README.md)** — Organização dos testes, tipos e estrutura de diretórios
- **[CLAUDE.md](CLAUDE.md)** — Comandos completos e arquitetura do projeto
- **[.github/TDD_GUIDE.md](.github/TDD_GUIDE.md)** — Guia de desenvolvimento orientado a testes
- **[.github/UNIT_TEST_GUIDE.md](.github/UNIT_TEST_GUIDE.md)** — Boas práticas para testes unitários
