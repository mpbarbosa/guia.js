# Test Mocks

Manual Jest mocks that replace real module implementations during testing. Files here are automatically resolved by Jest's module resolution when tests import the corresponding source module.

## Structure

```
__mocks__/
└── src/
    └── utils/          # Mocks for src/utils/ modules
```

## Usage

Jest picks up mocks automatically when a test calls `jest.mock('path/to/module')` or when the mock path mirrors the source path under `src/`.

## Guidelines

- Keep mocks minimal — only stub what is needed for isolation.
- Mock implementations should match the real module's public API signatures.
- Document any behavioral differences from the real module in a JSDoc comment.
