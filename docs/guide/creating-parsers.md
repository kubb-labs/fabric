---
layout: doc
title: Creating Fabric Parsers - Custom File Type Handlers
description: Build custom parsers to handle different file types and transform generated code. Add support for JSON, YAML, or custom formats.
outline: deep
---

# Creating Parsers

Build custom parsers to handle different file types and transform Fabric's generated output. Parsers convert file objects into final formatted strings for specific file extensions.

## What are Parsers?

Parsers convert Fabric file objects into final formatted strings for specific file types. They handle file-specific formatting, imports/exports generation, and syntax transformations before writing to disk.

**Parsers handle:**
- Formatting source code (TypeScript, JSON, YAML, etc.)
- Generating import and export statements
- Managing file extensions
- Applying syntax-specific transformations

## Why Create Custom Parsers?

- **New file types** - Add support for JSON, YAML, GraphQL, or custom formats
- **Custom formatting** - Apply project-specific code style rules
- **Tool integration** - Connect Prettier, ESLint, or other formatters
- **Syntax transformation** - Apply custom code transformations

## How to Create a Parser

Use the `defineParser` factory from `@kubb/fabric-core/parsers`:

```ts
import { defineParser } from '@kubb/fabric-core/parsers'

const myParser = defineParser({
  name: 'myParser',
  extNames: ['.ext'],  // File extensions to handle
  parse(file) {
    // Transform file object to string
    return file.sources.map(s => s.value).join('\n')
  }
})
```

## Installation

The `defineParser` factory is included in `@kubb/fabric-core/parsers`:

```ts
import { defineParser } from '@kubb/fabric-core/parsers'
```

## Usage

Create plugins using the `defineParser` factory:

```ts twoslash
import { createFabric } from '@kubb/fabric-core'
import { defineParser } from '@kubb/fabric-core/parsers'

const jsonParser = defineParser({
  name: 'jsonParser',
  extNames: ['.json'],
  install(){

  },
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


### extNames

File extensions this parser handles. Use `undefined` for the default parser fallback.

> [!TIP]
> Set to `undefined` to create a default parser that handles any file extension without a registered parser.

|           |                         |
|----------:|:------------------------|
|     Type: | `string[] \| undefined` |
| Required: | `true`                  |

**Example:**

```ts
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


## Type Parameters

### `TOptions`

Type definition for parser options.

```ts
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

::: code-group

```tsx twoslash [run.ts]
import { createFabric } from '@kubb/fabric-core'
import { defineParser } from '@kubb/fabric-core/parsers'
import { fsPlugin } from '@kubb/fabric-core/plugins'

const jsonParser = defineParser({
  name: 'jsonParser',
  extNames: ['.json'],
  install(){

  },
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
  imports: [],
  exports: [],
})

await fabric.write({ extension: { '.json': '.json' } })
```

```json [output/config.json]
{
  "name": "app",
  "version": "1.0.0"
}
```

:::

### Markdown Parser

::: code-group

```tsx twoslash [run.ts]
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
  imports: [],
  exports: [],
})

await fabric.write({ extension: { '.md': '.md' } })
```

```md [output/README.md]
---
title: My Project
date: 2024-01-01
---

# My Project

A description of the project.

```

:::

### CSS Parser

::: code-group

```tsx twoslash [run.ts]
import { createFabric } from '@kubb/fabric-core'
import { defineParser } from '@kubb/fabric-core/parsers'
import { fsPlugin } from '@kubb/fabric-core/plugins'

type CSSOptions = {
  minify?: boolean
}

const cssParser = defineParser<CSSOptions>({
  name: 'cssParser',
  extNames: ['.css'],
  install(){

  },
  parse(file) {
    const styles = file.sources.map(s => s.value).join('\n')

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
  imports: [],
  exports: [],
})

await fabric.write({ extension: { '.css': '.css' } })
```

```css [output/style.css]
.button { padding: 10px; }
.card { margin: 20px; }

```

:::

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

## FAQ

### How do parsers differ from plugins?

Parsers transform file objects into final strings for specific extensions. Plugins handle lifecycle events, file operations, and add methods to Fabric. Use parsers for file formatting, plugins for everything else.

### Can I have multiple parsers for the same extension?

No. Only one parser per extension. The last registered parser for an extension wins. Use conditional logic inside a single parser if you need multiple formatting strategies.

### What's the default parser?

Set `extNames: undefined` to create a fallback parser that handles any extension without a registered parser. Fabric includes a `defaultParser` that does this.

### When is the parse function called?

During `fabric.write()` when files are being written to disk. Parsers receive the complete file object and return the final string content.

## See also

- [TypeScript Parser](/parsers/typescript-parser) — Built-in TypeScript parser example
- [TSX Parser](/parsers/tsx-parser) — Built-in TSX/React parser example
- [Default Parser](/parsers/default-parser) — Built-in fallback parser
- [Creating Plugins](/guide/creating-plugins) — Build custom plugins for Fabric

## Next Steps

- [Explore built-in parsers](/parsers/typescript-parser) - See real-world parser examples
- [Build a plugin](/guide/creating-plugins) - Add lifecycle event handling
- [File System Plugin](/plugins/fs-plugin) - Understand file writing
