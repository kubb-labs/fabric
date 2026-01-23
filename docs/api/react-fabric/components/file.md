---
layout: doc
title: File (React Fabric)
outline: deep
---

# File <Badge type="tip" text="react-fabric" />

React component for generating files with sources, imports, and exports.

> [!NOTE]
> This is the **react-fabric** version using React.
> For the FSX version, see [File (Fabric Core)](/api/fabric-core/components/file).

## Package

```bash
@kubb/react-fabric
```

## Usage

Uses React (not FSX):

```tsx [file.tsx]
import { File } from '@kubb/react-fabric'

export function Generator() {
  return (
    <File baseName="user.ts" path="./generated/user.ts">
      <File.Source isExportable>
        export type User = {'{'} id: number {'}'}
      </File.Source>
    </File>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `baseName` | `string` | - | File name with extension |
| `path` | `string` | - | Full path to the file |
| `meta` | `object` | `{}` | Optional metadata |
| `banner` | `string` | - | Optional banner text |
| `footer` | `string` | - | Optional footer text |
| `children` | `ReactNode` | - | File.Source, File.Import, File.Export |

## Sub-components

### File.Source

Adds source code to the file.

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | Optional name for the source block |
| `isTypeOnly` | `boolean` | `false` | Mark source as type-only export |
| `isExportable` | `boolean` | `false` | Include export keyword in source |
| `isIndexable` | `boolean` | `false` | Include in barrel file generation |
| `children` | `ReactNode` | - | Source code content |

```tsx [source.tsx]
<File.Source isExportable name="User">
  export type User = {'{'} id: number {'}'}
</File.Source>
```

### File.Import

Adds import statements to the file.

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string \| Array<string \| { propertyName: string, name?: string }>` | - | Import name(s) to be used |
| `path` | `string` | - | Path for the import |
| `isTypeOnly` | `boolean` | `false` | Add type-only import prefix |
| `isNameSpace` | `boolean` | `false` | Import entire module as namespace |
| `root` | `string` | - | Root path for relative imports |

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

### File.Export

Adds export statements to the file.

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string \| Array<string>` | - | Export name(s) to be used |
| `path` | `string` | - | Path for the export |
| `isTypeOnly` | `boolean` | `false` | Add type-only export prefix |
| `asAlias` | `boolean` | `false` | Export as aliased namespace |

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

```tsx [complete-file.tsx]
import { File } from '@kubb/react-fabric'

export function Generator() {
  return (
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
  )
}
```

### Multiple Files

```tsx [multiple-files.tsx]
import { File, Root } from '@kubb/react-fabric'

export function Generator() {
  const entities = ['User', 'Post', 'Comment']
  
  return (
    <Root>
      {entities.map(entity => (
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
    </Root>
  )
}
```

## See Also

- [File (Fabric Core)](/api/fabric-core/components/file) - FSX version
- [useFile](/api/fabric-core/composables/use-file) - Access file context
- [useFileManager](/api/fabric-core/composables/use-file-manager) - Manage files collection
- [Overview](/api/overview) - fabric-core vs react-fabric
