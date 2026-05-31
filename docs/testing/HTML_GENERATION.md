# HTML Generation Testing

**Version**: 0.28.6-alpha
**Last Updated**: 2026-05-30

Use this guide when a change affects rendered markup, component output, or
browser-visible structure.

## Recommended coverage

1. Start with `npm run test:unit` or `npm test` when the HTML comes from
   isolated component or utility behavior.
2. Add `npm run test:e2e` or `npm run test:playwright` when the markup must be
   validated in a running browser flow.
3. Use `cd tests && pytest integration/ -v` when visual hierarchy or browser
   interaction needs Selenium-backed validation.

## Related references

- [Testing Guide](./TESTING.md)
- [`__tests__/e2e/metropolitan-region-display.e2e.test.ts`](../../__tests__/e2e/metropolitan-region-display.e2e.test.ts)
