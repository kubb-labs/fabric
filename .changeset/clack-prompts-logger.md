---
"@kubb/fabric-core": minor
---

Replace consola and cli-progress with @clack/prompts for improved CLI output

- Migrated from `consola` to `@clack/prompts` for better visual feedback
- Replaced `cli-progress` with `clack.progress()` for modern progress bars
- Added colored output using `picocolors` with symbols (✓, ℹ, ✗)
- Implemented intro/outro pattern for lifecycle events
- Added comprehensive test coverage (13 tests vs 4 previously)
- Improved logging behavior with fallback for non-progress mode
- Removed deprecated `level` option (not applicable to clack)

This change provides a more polished and modern CLI experience consistent with Kubb CLI package.
