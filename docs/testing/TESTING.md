# Testing Guide

**Version**: 0.28.8-alpha
**Last Updated**: 2026-05-30

## Overview

Guia Turistico uses multiple test layers so changes can be validated at the
smallest useful scope before expanding into browser-backed or containerized
checks.

## Main test commands

| Scope | Command | Use when |
|---|---|---|
| Default Jest suite | `npm test` | Checking the repository's default JavaScript-oriented Jest run |
| TypeScript unit suite | `npm run test:unit` | Verifying TypeScript source and unit behavior under `jest.config.unit.js` |
| Puppeteer E2E suite | `npm run test:e2e` | Exercising the browser-oriented Jest E2E flow |
| Playwright smoke test | `npm run test:playwright` | Running the Playwright browser sanity scenario |
| Python Selenium integration | `cd tests && pytest integration/ -v` | Validating real-browser UI and geolocation workflows |
| Docker test flow | `npm run test:docker`, `npm run test:docker:e2e`, `npm run test:docker:all` | Reproducing CI-style runs in containers |

## Supporting guides

- [Test Strategy](./TEST_STRATEGY.md)
- [Test Infrastructure](./TEST_INFRASTRUCTURE.md)
- [HTML Generation Testing](./HTML_GENERATION.md)
- [Municipio/Bairro E2E Scenario](./E2E_TEST_SCENARIO_MUNICIPIO_BAIRRO.md)
- [Test Performance Optimization](./TEST_PERFORMANCE_OPTIMIZATION.md)
- [docs/DOCKER_TESTING.md](../DOCKER_TESTING.md)
- [tests/README.md](../../tests/README.md)
- [.github/UNIT_TEST_GUIDE.md](../../.github/UNIT_TEST_GUIDE.md)
- [.github/TDD_GUIDE.md](../../.github/TDD_GUIDE.md)
- [root TESTING.md](../../TESTING.md)
