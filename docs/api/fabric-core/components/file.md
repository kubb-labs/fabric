---
layout: doc
title: File Component
outline: deep
---

# File <Badge type="info" text="fabric-core" />

Component for generating files with sources, imports, and exports.

> [!NOTE]
> This is the **fabric-core** version using FSX functional API.
> For the React version, see [File (React)](/api/react-fabric/components/file).

## Package

```bash
@kubb/fabric-core
```

## Usage

Uses functional API (not JSX):

```ts [file.ts]
import { createFabric, File } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fsx-plugin'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = File({
  baseName: 'user.ts',
  path: './generated/user.ts',
}).children([
  File.Source({ isExportable: true }).children([
    'export type User = { id: number }'
  ])
])

await fabric.render(component)
```

## Props

### baseName

The file name with extension.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `true`   |

### path

The full path including directory and file name.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `true`   |

> [!IMPORTANT]
> The `path` must include the `baseName` at the end.

### meta

Optional metadata attached to the file.

|           |          |
|----------:|:---------|
|     Type: | `object` |
| Required: | `false`  |

### banner

Optional banner text added at the top of the file.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `false`  |

### footer

Optional footer text added at the bottom of the file.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `false`  |

## File.Source

Adds source code to a file.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | Optional name for the source block |
| `isTypeOnly` | `boolean` | `false` | Mark source as type-only export |
| `isExportable` | `boolean` | `false` | Include export keyword in source |
| `isIndexable` | `boolean` | `false` | Include in barrel file generation |
| `children` | `FabricNode` | - | Source code content |

### Usage

```ts [file-source.ts]
import { createFabric, File } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fsx-plugin'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = File({
  baseName: 'user.ts',
  path: './user.ts',
}).children([
  File.Source({
    name: 'User',
    isExportable: true,
  }).children(['export type User = { id: number }'])
])

await fabric.render(component)
```

## File.Import

Adds import statements to a file.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string \| Array<string \| { propertyName: string, name?: string }>` | - | Import name(s) to be used |
| `path` | `string` | - | Path for the import |
| `isTypeOnly` | `boolean` | `false` | Add type-only import prefix |
| `isNameSpace` | `boolean` | `false` | Import entire module as namespace |
| `root` | `string` | - | Root path for relative imports |

### Usage

```ts [file-import.ts]
import { createFabric, File } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fsx-plugin'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = File({
  baseName: 'index.ts',
  path: './index.ts',
}).children([
  File.Import({
    name: 'User',
    path: './types/user',
    isTypeOnly: true,
  })
])

await fabric.render(component)
```

### Import Name Formats

```ts
// Simple string
File.Import({ name: 'React', path: 'react' })
// -> import React from 'react'

// Array of strings
File.Import({ name: ['useState', 'useEffect'], path: 'react' })
// -> import { useState, useEffect } from 'react'

// Named imports with aliases
File.Import({ 
  name: [{ propertyName: 'default', name: 'React' }], 
  path: 'react' 
})
// -> import { default as React } from 'react'

// Namespace import
File.Import({ name: 'React', path: 'react', isNameSpace: true })
// -> import * as React from 'react'
```

## File.Export

Adds export statements to a file.

### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string \| Array<string>` | - | Export name(s) to be used |
| `path` | `string` | - | Path for the export |
| `isTypeOnly` | `boolean` | `false` | Add type-only export prefix |
| `asAlias` | `boolean` | `false` | Export as aliased namespace |

### Usage

```ts [file-export.ts]
import { createFabric, File } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fsx-plugin'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = File({
  baseName: 'index.ts',
  path: './index.ts',
}).children([
  File.Export({
    name: 'User',
    path: './types/user',
    isTypeOnly: true,
  })
])

await fabric.render(component)
```

### Export Formats

```ts
// Named export
File.Export({ name: 'User', path: './types/user' })
// -> export { User } from './types/user'

// Multiple named exports
File.Export({ name: ['User', 'Post'], path: './types' })
// -> export { User, Post } from './types'

// Type-only export
File.Export({ name: 'User', path: './types/user', isTypeOnly: true })
// -> export type { User } from './types/user'

// Namespace export with alias
File.Export({ path: './types', asAlias: true })
// -> export * as types from './types'
```

## Examples

### Complete File

```ts [complete-file.ts]
import { createFabric, File } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fsx-plugin'

const fabric = createFabric()
fabric.use(fsxPlugin)

const component = File({
  baseName: 'user.ts',
  path: './generated/types/user.ts',
}).children([
  File.Import({ name: 'BaseEntity', path: './base', isTypeOnly: true }),
  
  File.Source({ name: 'User', isExportable: true }).children([
    `export type User = BaseEntity & {
      name: string
      email: string
    }`
  ]),
  
  File.Source({ name: 'createUser', isExportable: true }).children([
    `export function createUser(data: User): User {
      return { ...data, id: Math.random() }
    }`
  ])
])

await fabric.render(component)
```

### Multiple Files

```ts [multiple-files.ts]
import { createFabric, File, Root } from '@kubb/fabric-core'
import { fsxPlugin } from '@kubb/fsx-plugin'

const fabric = createFabric()
fabric.use(fsxPlugin)

const entities = ['User', 'Post', 'Comment']

const component = Root().children(
  entities.map(entity =>
    File({
      baseName: `${entity.toLowerCase()}.ts`,
      path: `./generated/types/${entity.toLowerCase()}.ts`,
    }).children([
      File.Source({ isExportable: true }).children([
        `export type ${entity} = { id: number }`
      ])
    ])
  )
)

await fabric.render(component)
```

## See Also

- [File (React)](/api/react-fabric/components/file) - React version
- [useFile](/api/fabric-core/composables/use-file) - Access file context
- [useFileManager](/api/fabric-core/composables/use-file-manager) - Manage files collection
