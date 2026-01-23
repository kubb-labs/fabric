---
layout: doc
title: typescriptParser
outline: deep
---

# typescriptParser

Parses TypeScript files and formats imports, exports, and source code.

## Installation

The `typescriptParser` is included in `@kubb/fabric-core`:

```ts [import.ts]
import { typescriptParser } from '@kubb/fabric-core/parsers'
```

## Usage

```ts [basic-usage.ts]
import { createFabric } from '@kubb/fabric-core'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(typescriptParser)
```

## Options

The parser accepts options during file parsing, not during registration.

### file

File that will be parsed.

|           |                 |
|----------:|:----------------|
|     Type: | `KubbFile.File` |
| Required: | `true`          |

### extname

Extension to use when emitting import/export paths.

> [!TIP]
> Use this to rewrite import paths, for example from `./file` to `./file.ts`.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `false`  |
|  Default: | `'.ts'`  |

**Example:**

```ts [extname.ts]
// Parser rewrites imports to include .ts extension
await fabric.write({
  extension: { '.ts': '.ts' },
})

// Imports become: import { x } from './module.ts'
```

## Parser Selection

The `typescriptParser` is automatically selected for files with `.ts` extension when using `fabric.write()` with extension mapping.

```ts [parser-selection.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(fsPlugin)
fabric.use(typescriptParser)

await fabric.addFile({
  baseName: 'types.ts',
  path: './output/types.ts',
  sources: [
    { value: 'export type User = { id: number }', isExportable: true },
  ],
})

// typescriptParser is used for .ts files
await fabric.write({
  extension: { '.ts': '.ts' },
})
```

## Features

### Import Formatting

Formats TypeScript imports with proper syntax:

```ts [imports.ts]
await fabric.addFile({
  baseName: 'api.ts',
  path: './output/api.ts',
  imports: [
    { name: 'User', path: './types', isTypeOnly: true },
    { name: 'axios', path: 'axios' },
  ],
  sources: [
    { value: 'export const fetchUser = async (id: number): Promise<User> => {}', isExportable: true },
  ],
})
```

Generates:

```ts [output/api.ts]
import type { User } from './types'
import axios from 'axios'

export const fetchUser = async (id: number): Promise<User> => {}
```

### Export Formatting

Formats TypeScript exports:

```ts [exports.ts]
await fabric.addFile({
  baseName: 'index.ts',
  path: './output/index.ts',
  exports: [
    { name: 'User', path: './types', isTypeOnly: true },
    { name: 'fetchUser', path: './api' },
  ],
})
```

Generates:

```ts [output/index.ts]
export type { User } from './types'
export { fetchUser } from './api'
```

### Source Code

Handles TypeScript source code formatting:

```ts [source.ts]
await fabric.addFile({
  baseName: 'types.ts',
  path: './output/types.ts',
  sources: [
    { 
      value: 'export type User = { id: number; name: string; email: string }',
      isExportable: true 
    },
    {
      value: 'export type Post = { id: number; title: string; userId: number }',
      isExportable: true
    },
  ],
})
```

Generates:

```ts [output/types.ts]
export type User = { id: number; name: string; email: string }
export type Post = { id: number; title: string; userId: number }
```

## Examples

### Basic TypeScript File

```ts [basic-ts.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(fsPlugin)
fabric.use(typescriptParser)

await fabric.addFile({
  baseName: 'user.ts',
  path: './output/user.ts',
  sources: [
    { value: 'export type User = { id: number; name: string }', isExportable: true },
    { value: 'export const defaultUser: User = { id: 0, name: "Guest" }', isExportable: true },
  ],
})

await fabric.write({ extension: { '.ts': '.ts' } })
```

### With Imports

```ts [with-imports.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(fsPlugin)
fabric.use(typescriptParser)

await fabric.addFile({
  baseName: 'api.ts',
  path: './output/api.ts',
  imports: [
    { name: 'User', path: './types', isTypeOnly: true },
    { name: 'axios', path: 'axios' },
  ],
  sources: [
    { 
      value: 'export const getUser = (id: number): Promise<User> => axios.get(`/users/${id}`)',
      isExportable: true 
    },
  ],
})

await fabric.write({ extension: { '.ts': '.ts' } })
```

### Multiple Files

```ts [multiple-files.ts]
import { createFabric } from '@kubb/fabric-core'
import { fsPlugin } from '@kubb/fabric-core/plugins'
import { typescriptParser } from '@kubb/fabric-core/parsers'

const fabric = createFabric()

fabric.use(fsPlugin, { clean: { path: './output' } })
fabric.use(typescriptParser)

// Types file
await fabric.addFile({
  baseName: 'types.ts',
  path: './output/types.ts',
  sources: [
    { value: 'export type User = { id: number; name: string }', isExportable: true },
  ],
})

// API file with imports
await fabric.addFile({
  baseName: 'api.ts',
  path: './output/api.ts',
  imports: [
    { name: 'User', path: './types', isTypeOnly: true },
  ],
  sources: [
    { value: 'export const fetchUser = async (): Promise<User> => {}', isExportable: true },
  ],
})

await fabric.write({ extension: { '.ts': '.ts' } })
```

## Extension Names

The `typescriptParser` handles the following extensions:

- `.ts`

For TypeScript files with JSX, use the [`tsxParser`](/api/parsers/tsx-parser).

## See Also

- [tsxParser](/api/parsers/tsx-parser) — Parse TSX files with JSX
- [defaultParser](/api/parsers/default-parser) — Fallback parser
- [defineParser](/api/parsers/define-parser) — Create custom parsers
- [fsPlugin](/api/plugins/fs-plugin) — Write files to disk
