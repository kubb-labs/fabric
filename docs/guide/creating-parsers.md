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

## Parser Structure

Create parsers using the `defineParser` factory:

```ts [parser-structure.ts]
import { defineParser } from '@kubb/fabric-core/parsers'

const myParser = defineParser({
  name: 'myParser',
  extNames: ['.ext'],
  parse(file, { extname }) {
    // Transform file to string
    return formattedOutput
  },
})
```

## defineParser API

The `defineParser` factory creates parsers that can be registered with `fabric.use()` and selected during `fabric.write()`.

### Signature

```ts
defineParser<TOptions>(config: ParserConfig): Parser
```

### Configuration Fields

| Field     | Required | Type                                             | Description                                                                                       |
|-----------|----------|--------------------------------------------------|---------------------------------------------------------------------------------------------------|
| `name`    | Yes      | `string`                                         | Unique identifier for your parser.                                                                 |
| `extNames`| Yes      | `string[] \| undefined`                          | File extensions this parser handles (e.g., `['.ts']`). Use `undefined` for the default parser fallback. |
| `install` | No       | `(fabric, options) => void \| Promise<void>`     | Optional setup when the parser is registered. Subscribe to events, set state, etc.                 |
| `parse`   | Yes      | `(file, { extname }) => string \| Promise<string>` | Transform the file object into the final string output.                                            |

### Type Parameters

| Parameter  | Description                              |
|------------|------------------------------------------|
| `TOptions` | Type of options accepted by the parser.  |

## Basic Parser

Create a simple JSON parser:

```ts [json-parser.ts]
import { defineParser } from '@kubb/fabric-core/parsers'
import type { KubbFile } from '@kubb/fabric-core'

const jsonParser = defineParser({
  name: 'jsonParser',
  extNames: ['.json'],
  parse(file: KubbFile.File) {
    const data = file.sources.map(source => source.value).join('\n')
    return JSON.stringify(JSON.parse(data), null, 2)
  },
})

// Usage
const fabric = createFabric()
fabric.use(fsPlugin)
fabric.use(jsonParser)

await fabric.addFile({
  baseName: 'config.json',
  path: './generated/config.json',
  sources: [
    { value: '{"name": "app", "version": "1.0.0"}', isExportable: false },
  ],
})

await fabric.write({ extension: { '.json': '' } })
```

## Parser with Options

Create a parser that accepts configuration:

```ts [vue-parser.ts]
import { defineParser } from '@kubb/fabric-core/parsers'
import type { KubbFile } from '@kubb/fabric-core'

type VueParserOptions = {
  banner?: string
  scriptSetup?: boolean
}

const vueParser = defineParser<VueParserOptions>({
  name: 'vueParser',
  extNames: ['.vue'],
  async parse(file: KubbFile.File, { extname }) {
    const banner = file.options?.banner ?? ''
    const scriptSetup = file.options?.scriptSetup ?? false
    
    const sources = file.sources.map(s => s.value).join('\n')
    const scriptTag = scriptSetup ? '<script setup>' : '<script>'
    
    return `${banner}
<template>
  <div></div>
</template>

${scriptTag}
${sources}
</script>
`
  },
})

// Usage
const fabric = createFabric()
fabric.use(fsPlugin)
fabric.use(vueParser)

await fabric.addFile({
  baseName: 'App.vue',
  path: './components/App.vue',
  sources: [
    { value: 'const message = "Hello Vue"', isExportable: false },
  ],
  options: {
    banner: '<!-- Auto-generated -->',
    scriptSetup: true,
  },
})

await fabric.write({ extension: { '.vue': '' } })
```

## Parser with Install Hook

Set up event listeners during parser installation:

```ts [markdown-parser.ts]
import { defineParser } from '@kubb/fabric-core/parsers'
import type { KubbFile } from '@kubb/fabric-core'

const markdownParser = defineParser({
  name: 'markdownParser',
  extNames: ['.md'],
  install(fabric, options) {
    // Subscribe to events
    fabric.context.on('file:processing:start', ({ file }) => {
      if (file.path.endsWith('.md')) {
        console.log(`Processing markdown: ${file.baseName}`)
      }
    })
  },
  parse(file: KubbFile.File) {
    const content = file.sources.map(s => s.value).join('\n\n')
    const title = file.meta?.title || file.baseName.replace('.md', '')
    
    return `# ${title}\n\n${content}`
  },
})
```

## Extension Mapping

Use extension mapping to select parsers during `fabric.write()`:

```ts [extension-mapping.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser, tsxParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(fsPlugin)
fabric.use(typescriptParser) // For .ts files
fabric.use(tsxParser)        // For .tsx files

await fabric.addFile({
  baseName: 'utils.ts',
  path: './src/utils.ts',
  sources: [{ value: 'export const add = (a, b) => a + b', isExportable: true }],
})

await fabric.addFile({
  baseName: 'App.tsx',
  path: './src/App.tsx',
  sources: [{ value: 'export const App = () => <div>App</div>', isExportable: true }],
})

// Write with extension mapping
await fabric.write({
  extension: {
    '.ts': '.ts',   // Use typescriptParser
    '.tsx': '.tsx', // Use tsxParser
  },
})
```

> [!NOTE]
> When extension mapping is provided to `fabric.write()`, Fabric selects a parser whose `extNames` include the file's extension. Without extension mapping, the default parser is used.

## Default Parser Fallback

Create a fallback parser for unhandled extensions:

```ts [default-parser.ts]
import { defineParser } from '@kubb/fabric-core/parsers'
import type { KubbFile } from '@kubb/fabric-core'

const customDefaultParser = defineParser({
  name: 'customDefaultParser',
  extNames: undefined, // Fallback for all extensions
  parse(file: KubbFile.File) {
    // Simple concatenation of sources
    return file.sources.map(s => s.value).join('\n')
  },
})

// Usage
const fabric = createFabric()
fabric.use(fsPlugin)
fabric.use(customDefaultParser)

// Files without specific parsers use the default
await fabric.addFile({
  baseName: 'data.txt',
  path: './output/data.txt',
  sources: [{ value: 'Plain text content', isExportable: false }],
})

await fabric.write()
```

## Real-World Example: YAML Parser

Create a YAML parser with validation:

```ts [yaml-parser.ts]
import { defineParser } from '@kubb/fabric-core/parsers'
import type { KubbFile } from '@kubb/fabric-core'
import YAML from 'yaml'

type YamlParserOptions = {
  validate?: boolean
  indent?: number
}

const yamlParser = defineParser<YamlParserOptions>({
  name: 'yamlParser',
  extNames: ['.yaml', '.yml'],
  install(fabric, options) {
    if (options?.validate) {
      fabric.context.on('file:processing:start', ({ file }) => {
        if (file.path.match(/\.(yaml|yml)$/)) {
          console.log(`Validating YAML: ${file.baseName}`)
        }
      })
    }
  },
  parse(file: KubbFile.File, { extname }) {
    const indent = file.options?.indent ?? 2
    
    // Combine sources into object
    const data = file.sources.reduce((acc, source) => {
      try {
        const parsed = JSON.parse(source.value)
        return { ...acc, ...parsed }
      } catch {
        return acc
      }
    }, {})
    
    // Convert to YAML
    return YAML.stringify(data, { indent })
  },
})

// Usage
const fabric = createFabric()
fabric.use(fsPlugin)
fabric.use(yamlParser)

await fabric.addFile({
  baseName: 'config.yaml',
  path: './config/config.yaml',
  sources: [
    { value: '{"app": "myapp", "version": "1.0.0"}', isExportable: false },
  ],
  options: {
    indent: 4,
    validate: true,
  },
})

await fabric.write({ extension: { '.yaml': '' } })
```

## Accessing File Metadata

Use file properties in your parser:

```ts [metadata-parser.ts]
import { defineParser } from '@kubb/fabric-core/parsers'
import type { KubbFile } from '@kubb/fabric-core'

const metadataParser = defineParser({
  name: 'metadataParser',
  extNames: ['.meta.ts'],
  parse(file: KubbFile.File) {
    const { baseName, path, sources, imports, exports, meta } = file
    
    return `
// File: ${baseName}
// Path: ${path}
// Imports: ${imports.length}
// Exports: ${exports.length}
// Meta: ${JSON.stringify(meta)}

${sources.map(s => s.value).join('\n')}
`
  },
})
```

## Best Practices

### Use Type Safety

Define strong types for parser options and file content:

```ts
type MyParserOptions = {
  format?: 'compact' | 'pretty'
  comments?: boolean
}

const myParser = defineParser<MyParserOptions>({
  name: 'myParser',
  extNames: ['.custom'],
  parse(file, { extname }) {
    const format = file.options?.format ?? 'pretty'
    // Type-safe access to options
  },
})
```

### Handle Edge Cases

Validate input and handle empty or malformed content:

```ts
parse(file) {
  if (!file.sources.length) {
    return '// No content'
  }
  
  try {
    return formatContent(file.sources)
  } catch (error) {
    console.error(`Parse error in ${file.baseName}:`, error)
    return `// Parse error: ${error.message}`
  }
}
```

### Register in the Correct Order

Register specific parsers before generic ones:

```ts
fabric.use(typescriptParser) // .ts
fabric.use(tsxParser)        // .tsx
fabric.use(defaultParser)    // fallback
```

## See Also

- [defineParser](/api/parsers/define-parser) — Parser factory API
- [typescriptParser](/api/parsers/typescript-parser) — TypeScript parser reference
- [tsxParser](/api/parsers/tsx-parser) — TSX parser reference
- [defaultParser](/api/parsers/default-parser) — Fallback parser
- [Creating Plugins](/guide/creating-plugins) — Build custom plugins
- [File Generation Patterns](/guide/file-generation-patterns) — Best practices
