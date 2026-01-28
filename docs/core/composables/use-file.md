---
layout: doc
title: useFile
outline: deep
---

# `useFile`

Composable for accessing the current File context and its properties.

## Usage

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

