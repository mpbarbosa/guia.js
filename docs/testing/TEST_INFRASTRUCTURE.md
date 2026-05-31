# Test Infrastructure

**Version**: 0.28.5-alpha
**Last Updated**: 2026-05-30

## Core infrastructure

- **Jest** drives `npm test` and `npm run test:unit`.
- **Puppeteer** drives `npm run test:e2e`.
- **Playwright** drives `npm run test:playwright`.
- **pytest + Selenium** live under [`tests/`](../../tests/) for real-browser
  integration scenarios.
- **Docker** scripts under [`scripts/`](../../scripts/) provide containerized
  validation.

## Key repository files

- [`package.json`](../../package.json)
- [`jest.config.unit.js`](../../jest.config.unit.js)
- [`jest.config.e2e.js`](../../jest.config.e2e.js)
- [`tests/README.md`](../../tests/README.md)
- [`../DOCKER_TESTING.md`](../DOCKER_TESTING.md)
