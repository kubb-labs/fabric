---
"@kubb/fabric-core": patch
---

Sort combined imports by their resolved relative path instead of the raw absolute `path`. When `root` is set, the emitted specifier is `getRelativePath(root, path)`, so sorting on the absolute `path` made the import order depend on where the project lives on disk — producing different orderings for identical output (e.g. a CLI cwd vs a bundler root). Sorting on the resolved relative path keeps the generated import order deterministic across environments.
