# Update Documentation Index Action

Composite GitHub Action that regenerates `docs/INDEX.md` to reflect the current documentation structure.

## Outputs

| Output | Description |
|--------|-------------|
| `updated` | `true` if the index was updated, `false` otherwise |

## Usage

```yaml
- uses: ./.github/actions/update-doc-index
```

## Purpose

Keeps `docs/INDEX.md` automatically in sync with the actual contents of the `docs/` directory after any documentation changes.
