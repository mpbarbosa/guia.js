# Test Strategy

**Version**: 0.28.5-alpha
**Last Updated**: 2026-05-30

Choose the smallest test layer that can prove the change without skipping
important browser, integration, or packaging behavior.

1. Start with `npm run test:unit` for TypeScript unit work.
2. Use `npm test` when the change spans the default Jest suite.
3. Use [HTML Generation Testing](./HTML_GENERATION.md) for rendered-markup and
   browser-visible output changes.
4. Run `npm run test:e2e` or `npm run test:playwright` for route-level or
   browser-flow checks.
5. Run `cd tests && pytest integration/ -v` for Selenium-backed integration
   scenarios.
6. Use the Docker commands when you need container parity.
