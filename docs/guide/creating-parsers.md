---
layout: doc
title: Creating Parsers
outline: deep
---

# Creating Parsers

Learn how to create custom parsers to handle different file types and transform code.

## What are Parsers?

Parsers convert Fabric file objects into final string output for specific file types. They handle:

- Formatting source code
- Generating imports and exports
- Managing file extensions
- Applying syntax-specific transformations

Fabric includes built-in parsers for TypeScript, TSX, and default fallback parsing.

## Installation

The `defineParser` factory is included in `@kubb/fabric-core`:

```ts [import.ts]
import { defineParser } from '@kubb/fabric-core/parsers'
```

## Usage

```ts
import { createFabric } from '@kubb/fabric-core'
import { defineParser } from '@kubb/fabric-core/parsers'

const jsonParser = defineParser({
  name: 'jsonParser',
  extNames: ['.json'],
  parse(file) {
    const data = file.sources.map(s => s.value).join('\n')
    return JSON.stringify(JSON.parse(data), null, 2)
  },
})

const fabric = createFabric()
fabric.use(jsonParser)
```

## Signature

```ts
defineParser<TOptions>(config: ParserConfig): Parser
```

## Configuration

### name

Unique identifier for your parser.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `true`   |

**Example:**

```ts [name.ts]
const myParser = defineParser({
  name: 'myParser', // Used for debugging and identification
  extNames: ['.ext'],
  parse(file) {
    return '...'
  },
})
```

### extNames

File extensions this parser handles. Use `undefined` for the default parser fallback.

> [!TIP]
> Set to `undefined` to create a default parser that handles any file extension without a registered parser.

|           |                         |
|----------:|:------------------------|
|     Type: | `string[] \| undefined` |
| Required: | `true`                  |

**Example:**

```ts [extNames.ts]
// Specific extensions
const tsParser = defineParser({
  name: 'tsParser',
  extNames: ['.ts', '.tsx'], // Handles .ts and .tsx files
  parse(file) {
    return '...'
  },
})

// Default fallback parser
const defaultParser = defineParser({
  name: 'defaultParser',
  extNames: undefined, // Handles any unmatched extension
  parse(file) {
    return '...'
  },
})
```

### install

Optional setup function called when the parser is registered via `fabric.use()`.

|           |                                                |
|----------:|:-----------------------------------------------|
|     Type: | `(fabric, options) => void \| Promise<void>` |
| Required: | `false`                                        |

**Parameters:**

- `fabric` — The Fabric instance
- `options` — Parser options passed to `fabric.use()`

**Example:**

```ts [install.ts]
const myParser = defineParser({
  name: 'myParser',
  extNames: ['.ext'],
  install(fabric, options) {
    // Subscribe to events
    fabric.context.events.on('lifecycle:start', () => {
      console.log('Parser registered')
    })

    // Access options
    if (options?.verbose) {
      console.log('Verbose mode enabled')
    }
  },
  parse(file) {
    return '...'
  },
})
```

### parse

Transform the file object into the final string output. This is called during `fabric.write()`.

|           |                                                      |
|----------:|:-----------------------------------------------------|
|     Type: | `(file, { extname }) => string \| Promise<string>` |
| Required: | `true`                                               |

**Parameters:**

- `file` — The file object to parse
- `{ extname }` — Options object with the target extension

**Returns:** The final file content as a string

**Example:**

```ts [parse.ts]
const myParser = defineParser({
  name: 'myParser',
  extNames: ['.ext'],
  parse(file, { extname }) {
    // Access file properties
    const sources = file.sources.map(s => s.value).join('\n')
    const imports = file.imports?.map(i => `import ${i.name} from '${i.path}'`).join('\n')

    // Use extname for path generation
    console.log(`Parsing for extension: ${extname}`)

    return `${imports}\n\n${sources}`
  },
})
```

## Type Parameters

### TOptions

Type definition for parser options.

```ts [type-options.ts]
type MyParserOptions = {
  indent?: number
  semicolons?: boolean
}

const myParser = defineParser<MyParserOptions>({
  name: 'myParser',
  extNames: ['.ext'],
  install(fabric, options) {
    const indent = options?.indent ?? 2
    const semicolons = options?.semicolons ?? true
    console.log(`Using indent: ${indent}, semicolons: ${semicolons}`)
  },
  parse(file) {
    return '...'
  },
})
```

## Examples

### JSON Parser

```ts [json-parser.ts]
import { createFabric } from '@kubb/fabric-core'
import { defineParser } from '@kubb/fabric-core/parsers'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const jsonParser = defineParser({
  name: 'jsonParser',
  extNames: ['.json'],
  parse(file) {
    const data = file.sources.map(s => s.value).join('\n')
    return JSON.stringify(JSON.parse(data), null, 2)
  },
})

const fabric = createFabric()
fabric.use(fsPlugin)
fabric.use(jsonParser)

await fabric.addFile({
  baseName: 'config.json',
  path: './output/config.json',
  sources: [
    { value: '{"name":"app","version":"1.0.0"}', isExportable: false },
  ],
})

await fabric.write({ extension: { '.json': '.json' } })
```

### Markdown Parser

```ts [markdown-parser.ts]
import { createFabric } from '@kubb/fabric-core'
import { defineParser } from '@kubb/fabric-core/parsers'
import { fsPlugin } from '@kubb/fabric-core/plugins'

type MarkdownOptions = {
  addFrontmatter?: boolean
}

const markdownParser = defineParser<MarkdownOptions>({
  name: 'markdownParser',
  extNames: ['.md'],
  install(fabric, options) {
    console.log(`Markdown parser installed (frontmatter: ${options?.addFrontmatter})`)
  },
  parse(file, { extname }) {
    const content = file.sources.map(s => s.value).join('\n\n')

    // Add frontmatter if configured
    if (file.meta?.frontmatter) {
      return `---\n${file.meta.frontmatter}\n---\n\n${content}`
    }

    return content
  },
})

const fabric = createFabric()
fabric.use(fsPlugin)
fabric.use(markdownParser, { addFrontmatter: true })

await fabric.addFile({
  baseName: 'README.md',
  path: './output/README.md',
  sources: [
    { value: '# My Project', isExportable: false },
    { value: 'A description of the project.', isExportable: false },
  ],
  meta: {
    frontmatter: 'title: My Project\ndate: 2024-01-01',
  },
})

await fabric.write({ extension: { '.md': '.md' } })
```

### CSS Parser

```ts [css-parser.ts]
import { createFabric } from '@kubb/fabric-core'
import { defineParser } from '@kubb/fabric-core/parsers'
import { fsPlugin } from '@kubb/fabric-core/plugins'

type CSSOptions = {
  minify?: boolean
}

const cssParser = defineParser<CSSOptions>({
  name: 'cssParser',
  extNames: ['.css'],
  parse(file) {
    const styles = file.sources.map(s => s.value).join('\n')

    // Simple minification (remove extra whitespace)
    if (file.meta?.minify) {
      return styles.replace(/\s+/g, ' ').trim()
    }

    return styles
  },
})

const fabric = createFabric()
fabric.use(fsPlugin)
fabric.use(cssParser)

await fabric.addFile({
  baseName: 'styles.css',
  path: './output/styles.css',
  sources: [
    { value: '.button { padding: 10px; }', isExportable: false },
    { value: '.card { margin: 20px; }', isExportable: false },
  ],
  meta: { minify: false },
})

await fabric.write({ extension: { '.css': '.css' } })
```

### Parser with Import Handling

```ts [with-imports.ts]
import { createFabric } from '@kubb/fabric-core'
import { defineParser } from '@kubb/fabric-core/parsers'

const vueParser = defineParser({
  name: 'vueParser',
  extNames: ['.vue'],
  parse(file, { extname }) {
    // Format imports
    const imports = file.imports
      ?.map(imp => {
        const type = imp.isTypeOnly ? 'type ' : ''
        return `import ${type}{ ${imp.name} } from '${imp.path}${extname}'`
      })
      .join('\n') ?? ''

    // Format sources
    const sources = file.sources.map(s => s.value).join('\n')

    return `<script setup lang="ts">
${imports}

${sources}
</script>

<template>
  <!-- Component template -->
</template>
`
  },
})
```

### Default Fallback Parser

```ts [default-parser.ts]
import { createFabric } from '@kubb/fabric-core'
import { defineParser } from '@kubb/fabric-core/parsers'

const customDefaultParser = defineParser({
  name: 'customDefaultParser',
  extNames: undefined, // Handles any extension
  parse(file) {
    // Simple text concatenation for unknown file types
    return file.sources.map(s => s.value).join('\n')
  },
})

const fabric = createFabric()
fabric.use(customDefaultParser)

// This file will use customDefaultParser (no specific parser for .txt)
await fabric.addFile({
  baseName: 'notes.txt',
  path: './output/notes.txt',
  sources: [
    { value: 'Line 1', isExportable: false },
    { value: 'Line 2', isExportable: false },
  ],
})
```

## Parser Selection

Fabric selects parsers based on file extension during `fabric.write()`:

```ts [parser-selection.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(fsPlugin)
fabric.use(typescriptParser) // Handles .ts files

await fabric.addFile({
  baseName: 'types.ts',
  path: './output/types.ts',
  sources: [/* ... */],
})

// Extension mapping triggers parser selection
await fabric.write({
  extension: {
    '.ts': '.ts', // typescriptParser is used
  },
})
```

## Best Practices

### Name Your Parsers

Use descriptive names that indicate the file type:

```ts
defineParser({
  name: 'jsonParser', // Clear and descriptive
  extNames: ['.json'],
  parse(file) {
    return '...'
  },
})
```

### Handle Edge Cases

Validate input and handle missing data:

```ts
parse(file) {
  if (!file.sources || file.sources.length === 0) {
    return '' // Or throw an error
  }

  return file.sources.map(s => s.value).join('\n')
}
```

### Use TypeScript

Define types for options and file metadata:

```ts
type MyParserOptions = {
  format?: 'compact' | 'pretty'
}

defineParser<MyParserOptions>({
  name: 'myParser',
  extNames: ['.ext'],
  parse(file) {
    // ...
  },
})
```

### Access File Metadata

Use `file.meta` for parser-specific configuration:

```ts
parse(file) {
  const indent = file.meta?.indent ?? 2
  const formatted = format(file.sources, { indent })
  return formatted
}
```

## See Also

- [typescriptParser](/parsers/typescript-parser) — Built-in TypeScript parser
- [tsxParser](/parsers/tsx-parser) — Built-in TSX parser
- [defaultParser](/parsers/default-parser) — Built-in fallback parser
- [fsPlugin](/plugins/fs-plugin) — Write files to disk
- [Creating Plugins](/guide/creating-plugins) — Build custom plugins
