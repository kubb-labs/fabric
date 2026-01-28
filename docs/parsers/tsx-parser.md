---
layout: doc
title: tsxParser
outline: deep
---

# `tsxParser`

The `tsxParser` is a specialized parser for TypeScript JSX (TSX) files. It delegates to the `typescriptParser` with TSX printing settings enabled, allowing you to generate `.tsx` files with proper JSX syntax handling.

## Installation

The tsxParser is included in `@kubb/fabric-core`:

```ts
import { tsxParser } from '@kubb/fabric-core/parsers'
```

## Usage

### Basic Example

```ts
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
  imports: [],
  exports: [],
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

## Examples

### React Component Generation

Generate React components with proper TSX syntax:

```ts twoslash [generate-component.ts]
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
  imports: [],
  exports: [],
})

await fabric.write()
```

## See Also

- [typescriptParser](/parsers/typescript-parser) — TypeScript parser
- [defaultParser](/parsers/default-parser) — Fallback parser
- [Creating Parsers](/guide/creating-parsers) — Create custom parsers
- [fsPlugin](/plugins/fs-plugin) — File system operations
- [Creating Parsers](/guide/creating-parsers) — Build custom parsers
- [reactPlugin](/plugins/react-plugin) — Render React components
