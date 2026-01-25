---
layout: doc
title: useFileManager
outline: deep
---

# useFileManager

Composable for accessing the FileManager.

## Returns

Returns the `FileManager` instance with methods to manage files.

## Usage

### Adding Files

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
