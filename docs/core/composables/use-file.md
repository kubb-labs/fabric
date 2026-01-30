---
layout: doc
title: useFile Hook - Access Current File Context in Fabric
description: Access the current File object and its properties (path, sources, imports) with the useFile composable hook.
outline: deep
---

# useFile Hook

The useFile composable accesses the current File context including path, baseName, sources, imports, exports, and metadata.

**Use useFile when:** You need to read or modify the current file's properties from within a component.

**Perfect for:** Adding sources dynamically, reading file metadata, conditional file generation.

## Usage

Access the current file's properties from within a component.

**Example:** Read file path and baseName.

```ts twoslash
import { useFile } from '@kubb/fabric-core'

const file = useFile()

if (file) {
  console.log(file.path)
  console.log(file.baseName)
}
```

## Return Value

Returns the current `File` object containing:

|            |                   |                                      |
|-----------:|:------------------|:-------------------------------------|
| `baseName` | `string`          | File name with extension             |
|     `path` | `string`          | Full path to file                    |
|   `sources`| `Source[]`        | Array of source code blocks          |
|  `imports` | `Import[]`        | Array of import statements           |
|  `exports` | `Export[]`        | Array of export statements           |
|     `meta` | `object`          | Optional metadata                    |
|   `banner` | `string`          | Optional banner text                 |
|   `footer` | `string`          | Optional footer text                 |

## When to Use

Use `useFile` when you need to:
- Access the current file's properties
- Add sources, imports, or exports programmatically
- Read file metadata from within a component

## Examples

### Access File Properties

```tsx twoslash
import { useFile } from '@kubb/fabric-core'

function FileInfo() {
  const file = useFile()

  if (!file) return null

  return `// File: ${file.baseName} at ${file.path}`
}
```

### Add Source Dynamically

```tsx twoslash
import { useFile } from '@kubb/fabric-core'

function DynamicSource({ types }: { types: string[] }) {
  const file = useFile()

  if (!file) return null

  types.forEach(type => {
    file.sources.push({
      value: `export type ${type} = {}`,
      isExportable: true,
    })
  })

  return null
}
```

## See Also

- [File](/core/components/file) - File component
- [useFileManager](/core/composables/use-file-manager) - Manage multiple files
- [useApp](/core/composables/use-app) - Access app context

