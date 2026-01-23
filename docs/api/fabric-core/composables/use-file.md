---
layout: doc
title: useFile
outline: deep
---

# useFile

Composable for accessing the current File context.

## Usage

```ts [use-file-example.ts]
import { useFile } from '@kubb/fabric-core'

const file = useFile()
console.log(file.path)
console.log(file.baseName)
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
- Read file metadata

## Examples

### Access File Properties

```tsx [access-props.tsx]
import { useFile } from '@kubb/fabric-core'

function FileInfo() {
  const file = useFile()
  
  return `// File: ${file.baseName} at ${file.path}`
}

// Inside File component
<File baseName="user.ts" path="./generated/user.ts">
  <FileInfo />
</File>
```

### Add Source Dynamically

```tsx [add-source.tsx]
import { useFile } from '@kubb/fabric-core'

function DynamicSource({ types }: { types: string[] }) {
  const file = useFile()
  
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

- [File](/api/fabric-core/components/file) — File component
- [useFileManager](/api/fabric-core/composables/use-file-manager) — Manage multiple files
