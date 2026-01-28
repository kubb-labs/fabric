---
layout: doc
title: defaultParser
outline: deep
---

# `defaultParser`

Built-in fallback parser for files without a registered parser.

## Installation

The `defaultParser` is included in `@kubb/fabric-core`:

```ts [import.ts]
import { defaultParser } from '@kubb/fabric-core/parsers'
```

## Usage

The `defaultParser` is automatically used as a fallback when no extension mapping is provided to `fabric.write()`, or when a file extension has no registered parser.

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()
fabric.use(fsPlugin)

await fabric.addFile({
  baseName: 'notes.txt',
  path: './output/notes.txt',
  sources: [
    { value: 'Line 1', isExportable: false },
    { value: 'Line 2', isExportable: false },
  ],
  imports: [],
  exports: [],
})

// No extension mapping - defaultParser is used automatically
await fabric.write()
```

## How It Works

The `defaultParser` provides simple text concatenation for files:

1. Concatenates all `sources` with newlines
2. No import/export formatting
3. No syntax-specific transformations

This makes it suitable for plain text files, configuration files, or any file type that doesn't require special parsing.

## When It's Used

The `defaultParser` is selected in these scenarios:

### No Extension Mapping

When `fabric.write()` is called without the `extension` option:

```ts [no-extension.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()
fabric.use(fsPlugin)

await fabric.addFile({
  baseName: 'file.txt',
  path: './output/file.txt',
  sources: [{ value: 'content', isExportable: false }],
  imports: [],
  exports: [],
})

// defaultParser is used
await fabric.write()
```

### Unregistered Extension

When a file extension has no registered parser:

```ts twoslash [unregistered.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()
fabric.use(fsPlugin)
fabric.use(typescriptParser) // Only handles .ts files

await fabric.addFile({
  baseName: 'config.yaml',
  path: './output/config.yaml',
  sources: [{ value: 'key: value', isExportable: false }],
  imports: [],
  exports: [],
})

// No parser for .yaml - defaultParser is used
await fabric.write({
  extension: { '.yaml': '.yaml' },
})
```

## Parser Behavior

### Source Concatenation

The parser joins all sources with newlines:

```ts [concatenation.ts]
await fabric.addFile({
  baseName: 'file.txt',
  path: './output/file.txt',
  sources: [
    { value: 'First line', isExportable: false },
    { value: 'Second line', isExportable: false },
    { value: 'Third line', isExportable: false },
  ],
  imports: [],
  exports: [],
})

await fabric.write()

// Output file.txt:
// First line
// Second line
// Third line
```

### No Import/Export Processing

Imports and exports are ignored:

```ts [no-imports.ts]
await fabric.addFile({
  baseName: 'file.txt',
  path: './output/file.txt',
  imports: [
    { name: 'something', path: './other' }, // Ignored by defaultParser
  ],
  sources: [
    { value: 'Content only', isExportable: false },
  ],
  exports: [],
})

await fabric.write()

// Output file.txt:
// Content only
```

### Metadata Access

The parser can access file metadata:

```ts [metadata.ts]
await fabric.addFile({
  baseName: 'file.txt',
  path: './output/file.txt',
  sources: [
    { value: 'content', isExportable: false },
  ],
  meta: {
    // Metadata is available to the parser
    customField: 'value',
  },
  imports: [],
  exports: [],
})
```

## Examples

### Plain Text File

```ts [plain-text.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()
fabric.use(fsPlugin)

await fabric.addFile({
  baseName: 'README.txt',
  path: './output/README.txt',
  sources: [
    { value: 'Project Name', isExportable: false },
    { value: '', isExportable: false },
    { value: 'Description of the project.', isExportable: false },
  ],
  imports: [],
  exports: [],
})

await fabric.write()

// Output README.txt:
// Project Name
//
// Description of the project.
```

### Configuration File

```ts [config-file.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()
fabric.use(fsPlugin)

await fabric.addFile({
  baseName: '.env',
  path: './output/.env',
  sources: [
    { value: 'API_KEY=abc123', isExportable: false },
    { value: 'DATABASE_URL=postgres://localhost', isExportable: false },
  ],
  imports: [],
  exports: [],
})

await fabric.write()

// Output .env:
// API_KEY=abc123
// DATABASE_URL=postgres://localhost
```

### License File

```ts [license.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()
fabric.use(fsPlugin)

await fabric.addFile({
  baseName: 'LICENSE',
  path: './output/LICENSE',
  sources: [
    { value: 'MIT License', isExportable: false },
    { value: '', isExportable: false },
    { value: 'Copyright (c) 2024', isExportable: false },
  ],
  imports: [],
  exports: [],
})

await fabric.write()
```

### Multiple Text Files

```ts [multiple-files.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const fabric = createFabric()
fabric.use(fsPlugin, { clean: { path: './output' } })

// Add multiple files
await fabric.addFile({
  baseName: 'CHANGELOG.txt',
  path: './output/CHANGELOG.txt',
  sources: [
    { value: 'v1.0.0 - Initial release', isExportable: false },
  ],
  imports: [],
  exports: [],
})

await fabric.addFile({
  baseName: 'TODO.txt',
  path: './output/TODO.txt',
  sources: [
    { value: '- Add tests', isExportable: false },
    { value: '- Update docs', isExportable: false },
  ],
  imports: [],
  exports: [],
})

// All files use defaultParser
await fabric.write()
```

## Custom Default Parser

Create a custom default parser with `defineParser`:

```ts [custom-default.ts]
import { createFabric } from '@kubb/fabric-core'
import { defineParser } from '@kubb/fabric-core/parsers'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const customDefaultParser = defineParser({
  name: 'customDefaultParser',
  extNames: undefined, // undefined = default parser
  parse(file) {
    // Custom formatting for all unhandled files
    const banner = '// Auto-generated file\n\n'
    const content = file.sources.map(s => s.value).join('\n')
    return banner + content
  },
})

const fabric = createFabric()
fabric.use(fsPlugin)
fabric.use(customDefaultParser) // Override default behavior

await fabric.addFile({
  baseName: 'file.txt',
  path: './output/file.txt',
  sources: [{ value: 'content', isExportable: false }],
  imports: [],
  exports: [],
})

await fabric.write()

// Output file.txt:
// // Auto-generated file
//
// content
```

## Best Practices

### Use Specific Parsers

For structured file types, use or create specific parsers:

```ts
// ❌ Don't use defaultParser for TypeScript
await fabric.addFile({
  baseName: 'types.ts',
  path: './output/types.ts',
  sources: [{ value: 'export type User = {}', isExportable: true }],
  imports: [],
  exports: [],
})
await fabric.write() // Uses defaultParser - no TypeScript formatting

// ✅ Use typescriptParser
import { typescriptParser } from '@kubb/fabric-core/parsers'
fabric.use(typescriptParser)
await fabric.write({ extension: { '.ts': '.ts' } }) // Proper formatting
```

### Plain Text Only

Reserve `defaultParser` for plain text files:

```ts
// ✅ Good use cases for defaultParser:
// - Plain .txt files
// - Configuration files (.env, .gitignore)
// - License and documentation files
// - Any file without structured syntax
```

### Create Custom Parsers

For custom file types, create dedicated parsers:

```ts
// Instead of relying on defaultParser for .yaml
// Create a yamlParser with proper formatting
const yamlParser = defineParser({
  name: 'yamlParser',
  extNames: ['.yaml', '.yml'],
  parse(file) {
    // YAML-specific formatting
  },
})
```

## See Also

- [Creating Parsers](/guide/creating-parsers) — Create custom parsers
- [typescriptParser](/parsers/typescript-parser) — TypeScript parser
- [tsxParser](/parsers/tsx-parser) — TSX parser
- [Creating Parsers](/guide/creating-parsers) — Parser development guide
