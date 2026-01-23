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

```tsx [source.tsx]
<File.Source isExportable name="User">
  export type User = {'{'} id: number {'}'}
</File.Source>
```

### File.Import

Adds import statements to the file.

```tsx [import.tsx]
<File.Import name="User" path="./types/user" isTypeOnly />
```

### File.Export

Adds export statements to the file.

```tsx [export.tsx]
<File.Export name="User" path="./user" isTypeOnly />
```

## See Also

- [File (Fabric Core)](/api/fabric-core/components/file) - FSX version
- [Overview](/api/overview) - fabric-core vs react-fabric
