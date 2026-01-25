---
layout: doc
title: useFileManager
outline: deep
---

# useFileManager

Composable for accessing the FileManager to manage file operations.

## Usage

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

| Method | Type | Description |
|--------|------|-------------|
| `add` | `(...files: File[]) => Promise<void>` | Add one or more files to the manager |
| `has` | `(path: string) => boolean` | Check if a file exists at the given path |
| `get` | `(path: string) => File \| undefined` | Get a file by path |
| `files` | `File[]` | Array of all managed files |
| `clear` | `() => void` | Remove all files from the manager |

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

  if (fileManager.has('./generated/user.ts')) {
    console.log('File exists')
  }

  return null
}
```

## See Also

- [File](/core/components/file) - File component
- [useFile](/core/composables/use-file) - Access current file
