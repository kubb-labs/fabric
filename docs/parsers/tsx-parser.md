---
layout: doc
title: TSX Parser - Format .tsx Files with JSX Support
description: Use the tsxParser to format TypeScript JSX files for React components and JSX templates in Fabric code generation.
outline: deep
---

# TSX Parser

The tsxParser formats TypeScript JSX (`.tsx`) files with proper JSX syntax handling. It extends the TypeScript parser with JSX support.

**Use tsxParser when:** Generating React components, JSX templates, or TypeScript files with JSX syntax.

**Perfect for:** React component generators, JSX-based templates, UI library generation.

**Key features:**
- JSX syntax support
- TypeScript + JSX formatting
- Import/export handling
- Extension mapping for `.tsx`

## Installation

The tsxParser is included in `@kubb/fabric-core`.

**Import:**
```ts
import { tsxParser } from '@kubb/fabric-core/parsers'
```

## Usage

Register the TSX parser to format `.tsx` files with JSX.

**Example:** Generate a React component file.

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

**Output:** Creates a file `generated/Component.tsx` with JSX syntax.

```tsx [generated/Component.tsx]
export const App = () => <div>Hello</div>
```

## Parser Options

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
