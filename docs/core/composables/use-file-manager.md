---
layout: doc
title: useFileManager Hook - Manage Files in Fabric Queue
description: Access the FileManager to add, retrieve, and manage files in the generation queue with the useFileManager hook.
outline: deep
---

# useFileManager Hook

The useFileManager composable accesses the FileManager for adding, retrieving, and managing files in the generation queue.

**Use useFileManager when:** You need to add files programmatically, check if files exist, or access the file queue.

**Perfect for:** Dynamic file generation, file deduplication, queue inspection.

## Usage

Add and manage files programmatically using the FileManager.

**Example:** Add a file to the generation queue from a component.

```tsx twoslash
import { useFileManager } from '@kubb/fabric-core'

function MyGenerator() {
  const fileManager = useFileManager()

  fileManager.add({
    baseName: 'user.ts',
    path: './generated/user.ts',
    sources: [{
      value: 'export type User = { id: number }',
      isExportable: true
    }],
    imports: [],
    exports: []
  })

  return null
}
```

## Return Value

Returns the `FileManager` instance with the following methods:

| Method | Type                                                               | Description |
|--------|--------------------------------------------------------------------|-------------|
| `add` | `(...files: Array<KubbFile.File>) => Array<KubbFile.ResolvedFile>` | Add one or more files to the manager |
| `getByPath` | `(path: string) => KubbFile.ResolvedFile \| null`                                   | Get a file by path |
| `files` | `Array<KubbFile.ResolvedFile>`                                                           | Array of all managed files |
| `clear` | `() => void`                                                       | Remove all files from the manager |

## When to Use

Use `useFileManager` when you need to:
- Add files programmatically from components
- Check if a file has already been generated
- Access all files in the generation queue
- Clear or manage the file collection

## Examples

### Checking File Existence

```tsx twoslash
import { useFileManager } from '@kubb/fabric-core'

function MyGenerator() {
  const fileManager = useFileManager()

  if (fileManager.getByPath('./generated/user.ts')) {
    console.log('File exists')
  }

  return null
}
```

## See Also

- [File](/core/components/file) - File component
- [useFile](/core/composables/use-file) - Access current file
