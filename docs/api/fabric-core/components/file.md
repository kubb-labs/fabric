---
layout: doc
title: File Component
outline: deep
---

# File

Component for generating files with sources, imports, and exports.

## Usage

The `File` component creates files in the FileManager with sources, imports, and exports.

```tsx [basic-file.tsx]
import { File } from '@kubb/fabric-core'

<File baseName="user.ts" path="./generated/user.ts">
  <File.Source isExportable>
    export type User = {'{'} id: number {'}'}
  </File.Source>
</File>
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

## Sub-Components

### File.Source

Adds source code to the file.

**Props:**

- `name` (string, optional) - Source name
- `isExportable` (boolean, default: false) - Include in barrel exports
- `isIndexable` (boolean, optional) - Include in index files
- `isTypeOnly` (boolean, optional) - Type-only export

### File.Import

Adds import statements to the file.

**Props:**

- `name` (string, required) - Import name
- `path` (string, required) - Import path
- `root` (string, optional) - Root directory
- `isNameSpace` (boolean, optional) - Namespace import
- `isTypeOnly` (boolean, optional) - Type-only import

### File.Export

Adds export statements to the file.

**Props:**

- `name` (string, required) - Export name
- `path` (string, required) - Export path
- `isTypeOnly` (boolean, optional) - Type-only export
- `asAlias` (string, optional) - Export alias

## Examples

### Complete File

```tsx [complete-file.tsx]
<File baseName="user.ts" path="./generated/types/user.ts">
  <File.Import name="BaseEntity" path="./base" isTypeOnly />
  
  <File.Source isExportable name="User">
    export type User = BaseEntity & {'{'}
      name: string
      email: string
    {'}'}
  </File.Source>
  
  <File.Source isExportable name="createUser">
    export function createUser(data: User): User {'{'}
      return {'{'} ...data, id: Math.random() {'}'}
    {'}'}
  </File.Source>
</File>
```

### Multiple Files

```tsx [multiple-files.tsx]
{['User', 'Post', 'Comment'].map(entity => (
  <File 
    key={entity}
    baseName={`${entity.toLowerCase()}.ts`}
    path={`./generated/types/${entity.toLowerCase()}.ts`}
  >
    <File.Source isExportable>
      export type {entity} = {'{'} id: number {'}'}
    </File.Source>
  </File>
))}
```

## See Also

- [useFile](/api/fabric-core/composables/use-file) — Access file context
- [useFileManager](/api/fabric-core/composables/use-file-manager) — Manage files
- [fsxPlugin](/api/plugins/fsx-plugin) — FSX rendering plugin
