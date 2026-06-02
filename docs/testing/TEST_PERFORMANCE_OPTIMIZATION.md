# Test Performance Optimization

**Version**: 0.28.9-alpha
**Last Updated**: 2026-05-30

Keep feedback loops fast by matching the suite size to the change and reserving
browser or container runs for behavior that truly depends on them.

1. Prefer `npm run test:unit` for focused TypeScript work.
2. Use `npm test` when the change spans the default Jest suite.
3. Run E2E, Selenium, and Docker suites only when the change crosses those
   execution boundaries.
