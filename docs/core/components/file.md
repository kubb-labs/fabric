---
layout: doc
title: File Component
outline: deep
---

# File <Badge type="info" text="fabric-core" />

Component for generating files with sources, imports, and exports.

> [!NOTE]
> This is the **fabric-core** version using FSX functional API.
> For the React version, see [File (React)](/react/components/file).

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

File name with extension.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `true`   |

### path

Full path to the file including directory and file name.

> [!IMPORTANT]
> The `path` must include the `baseName` at the end.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `true`   |

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

### children

Child components (File.Source, File.Import, File.Export).

|           |             |
|----------:|:------------|
|     Type: | `FabricNode` |
| Required: | `false`     |

## File.Source

Adds source code to a file.

### name

Optional name for the source block.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `false`  |

### isTypeOnly

Mark source as type-only export.
- `true` marks source as type export
- `false` marks source as value export

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

### isExportable

Include export keyword in source.
- `true` generates exportable const or type
- `false` generates internal declaration

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

### isIndexable

Include in barrel file generation.
- `true` adds to barrel exports
- `false` excludes from barrel exports

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

### children

Source code content.

|           |             |
|----------:|:------------|
|     Type: | `FabricNode` |
| Required: | `false`     |

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

### name

Import name(s) to be used.

|           |          |
|----------:|:---------|
|     Type: | `string \| Array<string \| { propertyName: string, name?: string }>` |
| Required: | `true`   |

### path

Path for the import.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `true`   |

### isTypeOnly

Add type-only import prefix.
- `true` generates `import type { Type } from './path'`
- `false` generates `import { Type } from './path'`

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

### isNameSpace

Import entire module as namespace.
- `true` generates `import * as Name from './path'`
- `false` generates standard import

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

### root

Root path for relative imports.

When root is set it will get the path with relative `getRelativePath(root, path)`.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `false`  |

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

### name

Export name(s) to be used.

|           |          |
|----------:|:---------|
|     Type: | `string \| Array<string>` |
| Required: | `false`  |

### path

Path for the export.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `true`   |

### isTypeOnly

Add type-only export prefix.
- `true` generates `export type { Type } from './path'`
- `false` generates `export { Type } from './path'`

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

### asAlias

Export as aliased namespace.
- `true` generates `export * as aliasName from './path'`
- `false` generates standard export

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

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

- [File (React)](/react/components/file) - React version
- [useFile](/core/composables/use-file) - Access file context
- [useFileManager](/core/composables/use-file-manager) - Manage files collection
