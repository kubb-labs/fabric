---
layout: doc
title: File Component - Generate Files with React JSX
description: Use the File React component to generate TypeScript files with imports, exports, and sources using JSX syntax in Fabric.

outline: deep
---

# File <Badge type="tip" text="react-fabric" />

React component for generating files with sources, imports, and exports.

> [!NOTE]
> This is the **react-fabric** version using React.
> For the FSX version, see [File (Fabric Core)](/core/components/file).

## Usage

::: code-group

```tsx twoslash [run.tsx]
import { createReactFabric, File } from '@kubb/react-fabric'

const fabric = createReactFabric()

export function Generator() {
  return (
    <File baseName="user.ts" path="./generated/user.ts">
      <File.Source isExportable>
        export type User = {'{'} id: number {'}'}
      </File.Source>
    </File>
  )
}

const output = await fabric.renderToString(<Generator/>)
```

```ts [output]
export type User = { id: number }
```
:::

## Props

### baseName

File name with extension.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `true`   |

### path

Full path to the file.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `true`   |

### meta

Optional metadata.

|           |          |
|----------:|:---------|
|     Type: | `object` |
| Required: | `false`  |
|  Default: | `{}`     |

### banner

Optional banner text.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `false`  |

### footer

Optional footer text.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `false`  |

### children

File.Source, File.Import, File.Export.

|           |            |
|----------:|:-----------|
|     Type: | `KubbNode` |
| Required: | `false`    |

## Sub-components

### `File.Source`

Adds source code to the file.

#### name

Optional name for the source block.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `false`  |

#### isTypeOnly

Mark source as type-only export.
- `true` marks source as type export
- `false` marks source as value export

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

#### isExportable

Include export keyword in source.
- `true` generates exportable const or type
- `false` generates internal declaration

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

#### isIndexable

Include in barrel file generation.
- `true` adds to barrel exports
- `false` excludes from barrel exports

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

#### children

Source code content.

|           |             |
|----------:|:------------|
|     Type: | `KubbNode` |
| Required: | `false`     |

```tsx [source.tsx]
<File.Source isExportable name="User">
  export type User = {'{'} id: number {'}'}
</File.Source>
```

### `File.Import`

Adds import statements to the file.

#### name

Import name(s) to be used.

|           |          |
|----------:|:---------|
|     Type: | `string \| Array<string \| { propertyName: string, name?: string }>` |
| Required: | `true`   |

#### path

Path for the import.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `true`   |

#### isTypeOnly

Add type-only import prefix.
- `true` generates `import type { Type } from './path'`
- `false` generates `import { Type } from './path'`

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

#### isNameSpace

Import entire module as namespace.
- `true` generates `import * as Name from './path'`
- `false` generates standard import

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

#### root

Root path for relative imports.

When root is set it will get the path with relative `getRelativePath(root, path)`.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `false`  |

```tsx [import.tsx]
<File.Import name="User" path="./types/user" isTypeOnly />
```

**Import Name Formats:**

```tsx
// Simple string
<File.Import name="React" path="react" />
// -> import React from 'react'

// Array of strings
<File.Import name={['useState', 'useEffect']} path="react" />
// -> import { useState, useEffect } from 'react'

// Named imports with aliases
<File.Import
  name={[{ propertyName: 'default', name: 'React' }]}
  path="react"
/>
// -> import { default as React } from 'react'

// Namespace import
<File.Import name="React" path="react" isNameSpace />
// -> import * as React from 'react'
```

### `File.Export`

Adds export statements to the file.

#### name

Export name(s) to be used.

|           |          |
|----------:|:---------|
|     Type: | `string \| Array<string>` |
| Required: | `false`  |

#### path

Path for the export.

|           |          |
|----------:|:---------|
|     Type: | `string` |
| Required: | `true`   |

#### isTypeOnly

Add type-only export prefix.
- `true` generates `export type { Type } from './path'`
- `false` generates `export { Type } from './path'`

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

#### asAlias

Export as aliased namespace.
- `true` generates `export * as aliasName from './path'`
- `false` generates standard export

|           |           |
|----------:|:----------|
|     Type: | `boolean` |
| Required: | `false`   |
|  Default: | `false`   |

```tsx [export.tsx]
<File.Export name="User" path="./user" isTypeOnly />
```

**Export Formats:**

```tsx
// Named export
<File.Export name="User" path="./types/user" />
// -> export { User } from './types/user'

// Multiple named exports
<File.Export name={['User', 'Post']} path="./types" />
// -> export { User, Post } from './types'

// Type-only export
<File.Export name="User" path="./types/user" isTypeOnly />
// -> export type { User } from './types/user'

// Namespace export with alias
<File.Export path="./types" asAlias />
// -> export * as types from './types'
```

## Examples

### Complete File

::: code-group

```tsx twoslash [run.ts]
import { File } from '@kubb/react-fabric'

function Generator() {
  return (
    <File baseName="user.ts" path="./generated/types/user.ts">
      <File.Import name="BaseEntity" path="./base" isTypeOnly />

      <File.Source isExportable name="User">
        export type User = BaseEntity & {'{'}
          name: string;
          email: string
        {'}'}
      </File.Source>

      <File.Source isExportable name="createUser">
        export function createUser(data: User): User {'{'} {'\n'}
          return {'{'} ...data, id: Math.random() {'}'}
        {'}'}
      </File.Source>
    </File>
  )
}
```

```ts [generated/types/user.ts]
import type { BaseEntity } from './base'

export type User = BaseEntity & { name: string; email: string }
export function createUser(data: User): User {
  return { ...data, id: Math.random() }
}

```
:::


## See Also

- [File (Fabric Core)](/core/components/file) - FSX version
- [useFile](/core/composables/use-file) - Access file context
- [useFileManager](/core/composables/use-file-manager) - Manage files collection
- [Overview](/getting-started/introduction#fabric-core-vs-react-fabric) - fabric-core vs react-fabric
