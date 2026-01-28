---
layout: doc
title: tsxParser
outline: deep
---

# `tsxParser`

The `tsxParser` is a specialized parser for TypeScript JSX (TSX) files. It delegates to the `typescriptParser` with TSX printing settings enabled, allowing you to generate `.tsx` files with proper JSX syntax handling.

## Installation

The tsxParser is included in `@kubb/fabric-core`:

```ts [example.ts]
import { tsxParser } from '@kubb/fabric-core/parsers'
```

## Usage

### Basic Example

```ts [example.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { tsxParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(fsPlugin, {
  clean: { path: './generated' },
})

fabric.use(tsxParser)

await fabric.addFile({
  baseName: 'Component.tsx',
  path: './generated/Component.tsx',
  sources: [
    {
      value: 'export const App = () => <div>Hello</div>',
      isExportable: true,
    },
  ],
})

await fabric.write()
```

This creates a file `generated/Component.tsx` with:

```tsx [generated/Component.tsx]
export const App = () => <div>Hello</div>
```

## Options

| Option    | Type            | Required | Default | Description                                                 |
|-----------|-----------------|----------|---------|-------------------------------------------------------------|
| `file`    | `KubbFile.File` | Yes      | -       | File that will be parsed.                                   |
| `extname` | `string`        | No       | `'.tsx'` | Extension to use when emitting import/export paths for TSX/JSX files. |

### `file`

The file object containing sources, metadata, and import/export information.

```ts [example.ts]
const file: KubbFile.File = {
  baseName: 'Button.tsx',
  path: './components/Button.tsx',
  sources: [
    { value: 'export const Button = () => <button>Click</button>', isExportable: true },
  ],
}

await tsxParser.parse(file)
```

### `extname`

Controls the file extension used in import/export statements. Defaults to `.tsx`.

```ts [example.ts]
fabric.use(tsxParser, {
  extname: '.tsx', // Default
})

// Import paths will use: import { Button } from './Button.tsx'
```

## How It Works

The tsxParser:

1. Receives a file object with TSX/JSX content
2. Delegates to `typescriptParser` with TSX-specific settings
3. Processes imports, exports, and source code
4. Returns formatted TSX output with correct syntax

> [!NOTE]
> The tsxParser is a wrapper around `typescriptParser` configured for JSX. For non-JSX TypeScript files, use `typescriptParser` instead.

## Extension Mapping

Use extension mapping to convert TypeScript files to TSX during write:

```ts [example.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { tsxParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(fsPlugin)
fabric.use(tsxParser)

await fabric.addFile({
  baseName: 'App.tsx',
  path: './src/App.tsx',
  sources: [
    { value: 'import React from "react"', isExportable: false },
    { value: 'export const App = () => <div>App</div>', isExportable: true },
  ],
})

// Write with extension mapping
await fabric.write({
  extension: { '.tsx': '.tsx' },
})
```

## Use Cases

### React Component Generation

Generate React components with proper TSX syntax:

```ts [generate-component.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { tsxParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(fsPlugin, {
  clean: { path: './components' },
})

fabric.use(tsxParser)

await fabric.addFile({
  baseName: 'UserCard.tsx',
  path: './components/UserCard.tsx',
  sources: [
    { value: 'interface Props { name: string }', isExportable: false },
    {
      value: 'export const UserCard = ({ name }: Props) => <div>{name}</div>',
      isExportable: true,
    },
  ],
})

await fabric.write()
```

### JSX Template Generation

Create JSX templates programmatically:

```ts [template-gen.ts]
const fabric = createFabric()

fabric.use(fsPlugin)
fabric.use(tsxParser)

const generateTemplate = (name: string) => {
  return `export const ${name} = () => (
  <div className="${name.toLowerCase()}">
    <h1>${name}</h1>
  </div>
)`
}

await fabric.addFile({
  baseName: 'Header.tsx',
  path: './templates/Header.tsx',
  sources: [{ value: generateTemplate('Header'), isExportable: true }],
})

await fabric.write()
```

### Mixed TS/TSX Projects

Handle both TypeScript and TSX files in the same project:

```ts [mixed-project.ts]
import { typescriptParser, tsxParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(fsPlugin)
fabric.use(typescriptParser) // For .ts files
fabric.use(tsxParser)        // For .tsx files

// Add both TS and TSX files
await fabric.addFile({
  baseName: 'utils.ts',
  path: './src/utils.ts',
  sources: [{ value: 'export const add = (a: number, b: number) => a + b', isExportable: true }],
})

await fabric.addFile({
  baseName: 'App.tsx',
  path: './src/App.tsx',
  sources: [{ value: 'export const App = () => <div>App</div>', isExportable: true }],
})

await fabric.write({
  extension: {
    '.ts': '.ts',
    '.tsx': '.tsx',
  },
})
```

## See Also

- [typescriptParser](/parsers/typescript-parser) — TypeScript parser
- [defaultParser](/parsers/default-parser) — Fallback parser
- [Creating Parsers](/guide/creating-parsers) — Create custom parsers
- [fsPlugin](/plugins/fs-plugin) — File system operations
- [Creating Parsers](/guide/creating-parsers) — Build custom parsers
- [reactPlugin](/plugins/react-plugin) — Render React components
